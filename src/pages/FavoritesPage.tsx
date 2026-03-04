import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Wine, Heart, Trash2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const [selectedToast, setSelectedToast] = useState<any | null>(null);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*, toasts(*), custom_toasts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const removeFav = useMutation({
    mutationFn: async (favId: string) => {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites-full"] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["fav-count"] });
      sonnerToast.success(t("favorites.removed"));
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div>
        <h1 className="text-heading-1 text-foreground">{t("favorites.title")}</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {t("favorites.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-24" /></Card>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3">
            {favorites.map((fav) => {
              const toastData = fav.toasts || fav.custom_toasts;
              if (!toastData) return null;
              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card
                    className="hover:shadow-card-hover transition-shadow cursor-pointer"
                    onClick={() => setSelectedToast(toastData)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                        <Heart className="h-4 w-4 text-primary fill-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground">
                            {isEn ? (toastData.title_en || toastData.title_ka) : toastData.title_ka}
                          </h3>
                          {"occasion_type" in toastData && toastData.occasion_type && (
                            <Badge variant="outline" className="text-[10px]">
                              {t(`feasts.occasion.${toastData.occasion_type}`, toastData.occasion_type)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {toastData.body_ka}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeFav.mutate(fav.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10" />}
          title={t("favorites.empty")}
          description={t("favorites.emptyDesc")}
          actionLabel={t("nav.toasts")}
          onAction={() => navigate("/toasts")}
        />
      )}

      {/* Toast Detail Dialog */}
      <Dialog open={!!selectedToast} onOpenChange={(open) => !open && setSelectedToast(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedToast?.title_ka || t("favorites.title")}</DialogTitle>
            <DialogDescription>
              {"occasion_type" in (selectedToast || {}) && selectedToast?.occasion_type && (
                <Badge variant="outline" className="text-xs mt-1">
                  {String(t(`feasts.occasion.${selectedToast.occasion_type}`, selectedToast.occasion_type))}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedToast?.body_ka && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">🇬🇪</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedToast.body_ka}</p>
              </div>
            )}
            {selectedToast?.body_en && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">🇬🇧</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedToast.body_en}</p>
              </div>
            )}
            {selectedToast?.title_en && (
              <p className="text-xs text-muted-foreground italic">{selectedToast.title_en}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FavoritesPage;
