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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wine, Search, Heart, Sparkles } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const occasionKeys = [
  "supra",
  "wedding",
  "birthday",
  "memorial",
  "christening",
  "guest_reception",
  "holiday",
  "business",
  "friendly_gathering",
  "other",
];
const formalityKeys = ["formal", "semi_formal", "casual"];

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
      let q = supabase
        .from("toasts")
        .select("*")
        .eq("is_system", true)
        .order("toast_order_position", { ascending: true });
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
      const { data, error } = await supabase
        .from("user_favorites")
        .select("toast_id");
      if (error) throw error;
      return new Set(data.map((f) => f.toast_id));
    },
    enabled: !!user,
  });

  const toggleFav = useMutation({
    mutationFn: async (toastId: string) => {
      if (favorites?.has(toastId)) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("toast_id", toastId)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ toast_id: toastId, user_id: user!.id });
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
    return (
      toast.title_ka.toLowerCase().includes(s) ||
      toast.body_ka.toLowerCase().includes(s) ||
      toast.title_en?.toLowerCase().includes(s)
    );
  });

  const isEn = i18n.language === "en";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-display text-heading-1 text-foreground">
          {t("toasts.title")}
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {t("toasts.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("toasts.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-surface-1 border-border"
          />
        </div>
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger className="w-full sm:w-44 h-11 bg-surface-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("toasts.allOccasions")}</SelectItem>
            {occasionKeys.map((o) => (
              <SelectItem key={o} value={o}>
                {t(`feasts.occasion.${o}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={formality} onValueChange={setFormality}>
          <SelectTrigger className="w-full sm:w-44 h-11 bg-surface-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("toasts.allFormality")}</SelectItem>
            {formalityKeys.map((f) => (
              <SelectItem key={f} value={f}>
                {t(`ai.${f}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-surface-2 rounded" />
                  <div className="h-2 w-full bg-surface-2 rounded" />
                  <div className="h-2 w-3/4 bg-surface-2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((toast, i) => {
              const isFav = favorites?.has(toast.id);
              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className="card-interactive cursor-pointer group"
                    onClick={() => setSelectedToast(toast)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-xl bg-wine-light flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent transition-colors">
                            <Wine className="h-5 w-5 text-wine group-hover:text-accent-foreground transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm text-foreground">
                                {isEn
                                  ? toast.title_en || toast.title_ka
                                  : toast.title_ka}
                              </h3>
                              <Badge variant="outline" className="text-[10px]">
                                {t(
                                  `feasts.occasion.${toast.occasion_type}`,
                                  toast.occasion_type
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                              {isEn
                                ? toast.body_en || toast.body_ka
                                : toast.body_ka}
                            </p>
                            {toast.tags && toast.tags.length > 0 && (
                              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                                {toast.tags.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 hover:bg-wine-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFav.mutate(toast.id);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isFav
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-surface-1/50">
          <div className="w-16 h-16 rounded-2xl bg-wine-light/60 flex items-center justify-center mb-5">
            <Wine className="h-8 w-8 text-wine-muted" />
          </div>
          <p className="text-heading-3 text-foreground mb-2">
            {t("toasts.noToasts") as string}
          </p>
          <p className="text-body-sm text-muted-foreground mb-6">
            სცადეთ სხვა ფილტრი ან შექმენით AI-ით
          </p>
          <Button
            variant="wine"
            className="shadow-wine"
            onClick={() => navigate("/ai-generate")}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />{" "}
            {t("nav.aiGenerator") as string}
          </Button>
        </div>
      )}

      {/* Toast Detail Dialog */}
      <Dialog
        open={!!selectedToast}
        onOpenChange={(open) => !open && setSelectedToast(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedToast && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">
                  {isEn
                    ? selectedToast.title_en || selectedToast.title_ka
                    : selectedToast.title_ka}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap pt-2">
                  <Badge variant="outline" className="text-xs">
                    {String(
                      t(
                        `feasts.occasion.${selectedToast.occasion_type}`,
                        selectedToast.occasion_type
                      )
                    )}
                  </Badge>
                  {selectedToast.formality_level && (
                    <Badge variant="secondary" className="text-xs">
                      {String(
                        t(
                          `ai.${selectedToast.formality_level}`,
                          selectedToast.formality_level
                        )
                      )}
                    </Badge>
                  )}
                  {selectedToast.region && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedToast.region}
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="p-4 rounded-xl bg-surface-1">
                  <p className="text-caption text-muted-foreground mb-2 font-semibold">
                    {isEn ? "English" : "ქართულად"}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {isEn
                      ? selectedToast.body_en || selectedToast.body_ka
                      : selectedToast.body_ka}
                  </p>
                </div>

                {isEn
                  ? selectedToast.body_ka && (
                      <div className="p-4 rounded-xl bg-surface-1">
                        <p className="text-caption text-muted-foreground mb-2 font-semibold">
                          ქართულად
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedToast.body_ka}
                        </p>
                      </div>
                    )
                  : selectedToast.body_en && (
                      <div className="p-4 rounded-xl bg-surface-1">
                        <p className="text-caption text-muted-foreground mb-2 font-semibold">
                          English
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedToast.body_en}
                        </p>
                      </div>
                    )}

                {selectedToast.tags && selectedToast.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedToast.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav.mutate(selectedToast.id);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 mr-1.5 ${
                      favorites?.has(selectedToast.id)
                        ? "fill-primary text-primary"
                        : ""
                    }`}
                  />
                  {favorites?.has(selectedToast.id)
                    ? t("favorites.remove")
                    : t("favorites.add")}
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
