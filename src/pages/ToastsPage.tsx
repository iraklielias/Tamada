import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Wine, Search, Heart, Sparkles } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const occasionKeys = ["supra","wedding","birthday","memorial","christening","guest_reception","holiday","business","friendly_gathering","other"];
const formalityKeys = ["formal","semi_formal","casual"];

const ToastsPage = () => {
  const [search, setSearch] = useState("");
  const [occasion, setOccasion] = useState("all");
  const [formality, setFormality] = useState("all");
  const [selectedToast, setSelectedToast] = useState<any>(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: toasts, isLoading } = useQuery({
    queryKey: ["toasts", occasion, formality],
    queryFn: async () => {
      let q = supabase.from("toasts").select("*").eq("is_system", true).order("toast_order_position", { ascending: true });
      if (occasion !== "all") q = q.eq("occasion_type", occasion);
      if (formality !== "all") q = q.eq("formality_level", formality);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_favorites").select("toast_id");
      if (error) throw error;
      return new Set(data.map((f) => f.toast_id));
    },
    enabled: !!user,
  });

  const toggleFav = useMutation({
    mutationFn: async (toastId: string) => {
      if (favorites?.has(toastId)) {
        const { error } = await supabase.from("user_favorites").delete().eq("toast_id", toastId).eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_favorites").insert({ toast_id: toastId, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["fav-count"] });
    },
    onError: () => sonnerToast.error(t("common.error")),
  });

  const filtered = toasts?.filter((toast) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return toast.title_ka.toLowerCase().includes(s) || toast.body_ka.toLowerCase().includes(s) || toast.title_en?.toLowerCase().includes(s);
  });

  const isEn = i18n.language === "en";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div>
        <h1 className="text-heading-1 text-foreground">{t("toasts.title")}</h1>
        <p className="text-body-sm text-muted-foreground mt-1">{t("toasts.subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("toasts.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("toasts.allOccasions")}</SelectItem>
            {occasionKeys.map((o) => (
              <SelectItem key={o} value={o}>{t(`feasts.occasion.${o}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={formality} onValueChange={setFormality}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("toasts.allFormality")}</SelectItem>
            {formalityKeys.map((f) => (
              <SelectItem key={f} value={f}>{t(`ai.${f}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border"><CardContent className="p-4 h-28" /></Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3">
            {filtered.map((toast) => (
              <motion.div key={toast.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card
                  className="hover:shadow-card-hover transition-shadow cursor-pointer"
                  onClick={() => setSelectedToast(toast)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                          <Wine className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm text-foreground">{toast.title_ka}</h3>
                            <Badge variant="outline" className="text-[10px]">
                              {t(`feasts.occasion.${toast.occasion_type}`, toast.occasion_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{toast.body_ka}</p>
                          {toast.tags && toast.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {toast.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => { e.stopPropagation(); toggleFav.mutate(toast.id); }}
                      >
                        <Heart className={`h-4 w-4 ${favorites?.has(toast.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Wine className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-body-sm">{t("toasts.noToasts") as string}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/ai-generate")}>
            <Sparkles className="h-4 w-4 mr-1" /> {t("nav.aiGenerator") as string}
          </Button>
        </div>
      )}

      {/* Toast Detail Dialog */}
      <Dialog open={!!selectedToast} onOpenChange={(open) => !open && setSelectedToast(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedToast && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedToast.title_ka}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap pt-1">
                  <Badge variant="outline" className="text-xs">
                    {String(t(`feasts.occasion.${selectedToast.occasion_type}`, selectedToast.occasion_type))}
                  </Badge>
                  {selectedToast.formality_level && (
                    <Badge variant="secondary" className="text-xs">
                      {String(t(`ai.${selectedToast.formality_level}`, selectedToast.formality_level))}
                    </Badge>
                  )}
                  {selectedToast.region && (
                    <Badge variant="secondary" className="text-xs">{selectedToast.region}</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-caption text-muted-foreground mb-1">ქართულად</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedToast.body_ka}</p>
                </div>

                {selectedToast.body_en && (
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">English</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedToast.body_en}</p>
                  </div>
                )}

                {selectedToast.title_en && (
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Title (EN)</p>
                    <p className="text-sm text-foreground">{selectedToast.title_en}</p>
                  </div>
                )}

                {selectedToast.tags && selectedToast.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedToast.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => { e.stopPropagation(); toggleFav.mutate(selectedToast.id); }}
                >
                  <Heart className={`h-4 w-4 mr-1 ${favorites?.has(selectedToast.id) ? "fill-primary text-primary" : ""}`} />
                  {favorites?.has(selectedToast.id) ? t("favorites.remove") : t("favorites.add")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToastsPage;
