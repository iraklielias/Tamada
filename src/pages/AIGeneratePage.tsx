import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProGate } from "@/hooks/useProGate";
import ProUpsellModal from "@/components/ProUpsellModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Heart, Loader2, Wine, RefreshCw, Lock } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const occasions = [
  { value: "supra", label: "სუფრა" },
  { value: "wedding", label: "ქორწილი" },
  { value: "birthday", label: "დაბადების დღე" },
  { value: "memorial", label: "პანაშვიდი" },
  { value: "christening", label: "ნათლობა" },
  { value: "guest_reception", label: "სტუმრის მიღება" },
  { value: "holiday", label: "დღესასწაული" },
  { value: "business", label: "საქმიანი" },
  { value: "friendly_gathering", label: "მეგობრული შეკრება" },
  { value: "other", label: "სხვა" },
];

const formalities = [
  { value: "formal", label: "ფორმალური" },
  { value: "semi_formal", label: "ნახევრად ფორმალური" },
  { value: "casual", label: "არაფორმალური" },
];

interface GeneratedToast {
  title_ka: string;
  body_ka: string;
  title_en?: string;
  body_en?: string;
}

const AIGeneratePage = () => {
  const [occasion, setOccasion] = useState("supra");
  const [formality, setFormality] = useState("formal");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GeneratedToast | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellMessage, setUpsellMessage] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkFeature, dailyAICount, limits, canGenerateAI } = useProGate();

  const generate = useMutation({
    mutationFn: async () => {
      const check = checkFeature("ai");
      if (!check.allowed) {
        setUpsellMessage(check.message);
        setShowUpsell(true);
        throw new Error(check.message);
      }

      const { data, error } = await supabase.functions.invoke("generate-toast", {
        body: { occasion_type: occasion, formality_level: formality, topic },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as GeneratedToast;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["daily-ai-count"] });
      sonnerToast.success("სადღეგრძელო შეიქმნა!");
    },
    onError: (err: Error) => {
      if (!showUpsell) sonnerToast.error(err.message || "გენერაცია ვერ მოხერხდა");
    },
  });

  const saveToFavorites = useMutation({
    mutationFn: async () => {
      const check = checkFeature("favorite");
      if (!check.allowed) {
        setUpsellMessage(check.message);
        setShowUpsell(true);
        throw new Error(check.message);
      }

      if (!result || !user) return;
      const { data: custom, error: cErr } = await supabase
        .from("custom_toasts")
        .insert({
          user_id: user.id,
          title_ka: result.title_ka,
          body_ka: result.body_ka,
          title_en: result.title_en,
          body_en: result.body_en,
          occasion_type: occasion,
          is_ai_generated: true,
          ai_generation_params: { occasion, formality, topic } as any,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      const { error: fErr } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, custom_toast_id: custom.id });
      if (fErr) throw fErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites-full"] });
      queryClient.invalidateQueries({ queryKey: ["fav-count"] });
      sonnerToast.success("დაემატა რჩეულებში!");
    },
    onError: (err: Error) => {
      if (!showUpsell) sonnerToast.error("შენახვა ვერ მოხერხდა");
    },
  });

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.body_ka);
    sonnerToast.success("დაკოპირდა!");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI გენერატორი
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            შექმენი უნიკალური ქართული სადღეგრძელო AI-ის დახმარებით
          </p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {dailyAICount}/{limits.maxAIPerDay} დღეს
        </Badge>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">წვეულების ტიპი</label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">ფორმალურობა</label>
              <Select value={formality} onValueChange={setFormality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {formalities.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">
              თემა / დამატებითი სურვილი (არასავალდებულო)
            </label>
            <Textarea
              placeholder="მაგ: სიყვარულზე, ოჯახურ ღირებულებებზე, წარმატებაზე..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
          >
            {generate.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> იქმნება...</>
            ) : !canGenerateAI ? (
              <><Lock className="h-4 w-4 mr-2" /> ლიმიტი ამოიწურა</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> სადღეგრძელოს გენერაცია</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-primary/20 shadow-card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{result.title_ka}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">AI</Badge>
                </div>

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {result.body_ka}
                </p>

                {result.body_en && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground italic">{result.body_en}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> კოპირება
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => saveToFavorites.mutate()}
                    disabled={saveToFavorites.isPending}
                  >
                    <Heart className="h-3.5 w-3.5 mr-1.5" /> შენახვა
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => generate.mutate()}
                    disabled={generate.isPending}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> ხელახლა
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <ProUpsellModal open={showUpsell} onOpenChange={setShowUpsell} message={upsellMessage} />
    </div>
  );
};

export default AIGeneratePage;
