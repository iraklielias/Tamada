import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProGate } from "@/hooks/useProGate";
import ProUpsellModal from "@/components/ProUpsellModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Heart, Loader2, Wine, RefreshCw, Lock, MapPin, User, Clock, Volume2, Hand, ThumbsUp, ThumbsDown, Palette, Pencil, Check } from "lucide-react";
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

const tones = [
  { value: "traditional", label: "ტრადიციული", icon: "🏛️" },
  { value: "humorous", label: "იუმორისტული", icon: "😄" },
  { value: "emotional", label: "ემოციური", icon: "❤️" },
  { value: "philosophical", label: "ფილოსოფიური", icon: "🤔" },
];

const regions = [
  { value: "general", label: "ზოგადი ქართული" },
  { value: "kakheti", label: "კახეთი — პოეტური, ვაზის მეტაფორები" },
  { value: "imereti", label: "იმერეთი — მახვილგონივრული, იუმორი" },
  { value: "kartli", label: "ქართლი — ღირსეული, ისტორიული" },
  { value: "racha", label: "რაჭა-ლეჩხუმი — გულწრფელი, მთიური" },
  { value: "samegrelo", label: "სამეგრელო — ვნებიანი, ემოციური" },
  { value: "guria", label: "გურია — ენერგიული, მუსიკალური" },
  { value: "adjara", label: "აჭარა — სტუმართმოყვარე, ინკლუზიური" },
  { value: "svaneti", label: "სვანეთი — უძველესი, მისტიკური" },
  { value: "meskheti", label: "მესხეთი — გამძლე, მემორიალური" },
];

interface DeliveryGuidance {
  recommended_pace?: string;
  emotional_peak_location?: string;
  pause_suggestions?: string[];
  glass_raise_moment?: string;
  estimated_duration_minutes?: number;
}

interface ToastMetadata {
  toast_type?: string;
  region_style?: string;
  tone?: string;
  complexity?: string;
  generation_type?: string;
}

interface GeneratedToast {
  title_ka: string;
  body_ka: string;
  title_en?: string;
  body_en?: string;
  metadata?: ToastMetadata;
  delivery_guidance?: DeliveryGuidance;
}

const paceLabels: Record<string, string> = {
  slow: "ნელა — საზეიმო ტემპი",
  moderate: "ზომიერი ტემპი",
  conversational: "საუბრისებური ტემპი",
};

const peakLabels: Record<string, string> = {
  beginning: "დასაწყისში",
  middle: "შუაში",
  end: "ბოლოს",
};

const AIGeneratePage = () => {
  const [occasion, setOccasion] = useState("supra");
  const [formality, setFormality] = useState("formal");
  const [tone, setTone] = useState("traditional");
  const [region, setRegion] = useState("general");
  const [personName, setPersonName] = useState("");
  const [personDetails, setPersonDetails] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GeneratedToast | null>(null);
  const [originalResult, setOriginalResult] = useState<GeneratedToast | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellMessage, setUpsellMessage] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
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

      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "generate_toast",
          generation_params: {
            occasion_type: occasion,
            formality_level: formality,
            tone,
            region: region !== "general" ? region : undefined,
            person_name: personName || undefined,
            person_details: personDetails || undefined,
            freeform_comment: topic,
            language: "both",
          },
        },
      });
      const latencyMs = Math.round(performance.now() - startTime);
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Track latency asynchronously
      supabase
        .from("ai_generation_log")
        .update({ latency_ms: latencyMs })
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(1)
        .then(() => {});

      return data as GeneratedToast;
    },
    onSuccess: (data) => {
      setResult(data);
      setOriginalResult(data);
      setEditedTitle(data.title_ka);
      setEditedBody(data.body_ka);
      setIsEditing(false);
      setFeedbackGiven(null);
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

      // Check if user edited the toast
      const wasEdited = originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka);

      const { data: custom, error: cErr } = await supabase
        .from("custom_toasts")
        .insert({
          user_id: user.id,
          title_ka: editedTitle,
          body_ka: editedBody,
          title_en: result.title_en,
          body_en: result.body_en,
          occasion_type: occasion,
          is_ai_generated: true,
          ai_generation_params: { occasion, formality, tone, region, personName, personDetails, topic } as any,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      const { error: fErr } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, custom_toast_id: custom.id });
      if (fErr) throw fErr;

      // Send edit delta for adaptive learning if edited
      if (wasEdited && originalResult) {
        supabase.functions.invoke("tamada-ai", {
          body: {
            action: "analyze_edit_delta",
            edit_delta_params: {
              original_title: originalResult.title_ka,
              original_body: originalResult.body_ka,
              edited_title: editedTitle,
              edited_body: editedBody,
              generation_params: {
                occasion_type: occasion,
                tone,
                region: region !== "general" ? region : undefined,
                formality_level: formality,
              },
            },
          },
        }).catch(() => {}); // fire-and-forget
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites-full"] });
      queryClient.invalidateQueries({ queryKey: ["fav-count"] });
      sonnerToast.success(
        originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka)
          ? "რედაქტირებული ვერსია შეინახა!"
          : "დაემატა რჩეულებში!"
      );
    },
    onError: (err: Error) => {
      if (!showUpsell) sonnerToast.error("შენახვა ვერ მოხერხდა");
    },
  });

  const sendFeedback = useMutation({
    mutationFn: async (signal: "positive" | "negative") => {
      if (!user) return;
      const signalWeight = signal === "positive" ? 1.0 : 0.2;

      // Update tone preference
      const toneValue = {
        [tone]: signal === "positive" ? 0.15 : -0.1,
      };

      await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "submit_feedback",
          feedback_params: {
            signal,
            generation_params: {
              occasion_type: occasion,
              tone,
              region: region !== "general" ? region : undefined,
              formality_level: formality,
            },
          },
        },
      });
    },
    onSuccess: (_, signal) => {
      setFeedbackGiven(signal);
      sonnerToast.success(signal === "positive" ? "მადლობა! 👍" : "გავითვალისწინებთ 📝");
    },
  });

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.body_ka);
    sonnerToast.success("დაკოპირდა!");
  };

  const dg = result?.delivery_guidance;
  const meta = result?.metadata;

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
          {/* Row 1: Occasion + Formality */}
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

          {/* Row 2: Tone selector */}
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> ტონი / სტილი
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    tone === t.value
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent/50"
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Region */}
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> რეგიონული სტილი
            </label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> ვისთვის (არასავალდებულო)
              </label>
              <Input
                placeholder="მაგ: გიორგი"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">
                დეტალები პიროვნებაზე
              </label>
              <Input
                placeholder="მაგ: ექიმი თელავიდან, ფეხბურთის მოყვარული"
                value={personDetails}
                onChange={(e) => setPersonDetails(e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Freeform */}
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
            className="space-y-4"
          >
            {/* Toast card */}
            <Card className="border-primary/20 shadow-card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{result.title_ka}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {meta?.tone && (
                      <Badge variant="outline" className="text-[10px]">
                        {tones.find(t => t.value === meta.tone)?.icon} {tones.find(t => t.value === meta.tone)?.label || meta.tone}
                      </Badge>
                    )}
                    {meta?.region_style && meta.region_style !== "general" && (
                      <Badge variant="outline" className="text-[10px]">
                        <MapPin className="h-2.5 w-2.5 mr-0.5" />
                        {regions.find(r => r.value === meta.region_style)?.label.split(" —")[0] || meta.region_style}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">AI</Badge>
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {result.body_ka}
                </p>

                {result.body_en && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground italic">{result.body_en}</p>
                  </div>
                )}

                {/* Actions + Feedback */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
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

                  {/* Feedback buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={feedbackGiven === "positive" ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${feedbackGiven === "positive" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      onClick={() => sendFeedback.mutate("positive")}
                      disabled={feedbackGiven !== null || sendFeedback.isPending}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={feedbackGiven === "negative" ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${feedbackGiven === "negative" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
                      onClick={() => sendFeedback.mutate("negative")}
                      disabled={feedbackGiven !== null || sendFeedback.isPending}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Guidance */}
            {dg && (dg.recommended_pace || dg.emotional_peak_location || dg.glass_raise_moment) && (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    წარმოთქმის გზამკვლევი
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {dg.recommended_pace && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">ტემპი</span>
                          <span className="text-muted-foreground">
                            {paceLabels[dg.recommended_pace] || dg.recommended_pace}
                          </span>
                        </div>
                      </div>
                    )}

                    {dg.emotional_peak_location && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">ემოციური პიკი</span>
                          <span className="text-muted-foreground">
                            {peakLabels[dg.emotional_peak_location] || dg.emotional_peak_location}
                          </span>
                        </div>
                      </div>
                    )}

                    {dg.glass_raise_moment && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Hand className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">ბოკალი აწიეთ</span>
                          <span className="text-muted-foreground">{dg.glass_raise_moment}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {dg.pause_suggestions && dg.pause_suggestions.length > 0 && (
                    <div className="text-xs space-y-1 pt-1">
                      <span className="font-medium text-foreground">პაუზების ადგილები:</span>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {dg.pause_suggestions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dg.estimated_duration_minutes && (
                    <p className="text-[11px] text-muted-foreground">
                      სავარაუდო ხანგრძლივობა: ~{dg.estimated_duration_minutes} წუთი
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ProUpsellModal open={showUpsell} onOpenChange={setShowUpsell} message={upsellMessage} />
    </div>
  );
};

export default AIGeneratePage;
