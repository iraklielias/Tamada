import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SystemIcon from "@/components/SystemIcon";
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
  const [search, setSearch] = useState("");

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
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-1 text-foreground">
            {t("favorites.title")}
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {t("favorites.subtitle")}
          </p>
        </div>
        {favorites && favorites.length > 0 && (
          <Badge variant="secondary" className="text-xs shrink-0 mt-2">
            {favorites.length} {t("favorites.saved")}
          </Badge>
        )}
      </div>

      {/* Search */}
      {favorites && favorites.length > 0 && (
        <div className="relative">
          <SystemIcon
            name="action.search"
            size="sm"
            tone="muted"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            placeholder={t("favorites.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-surface-1 border-border"
          />
        </div>
      )}

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
                  <div className="h-3 w-28 bg-surface-2 rounded" />
                  <div className="h-2 w-full bg-surface-2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {favorites.filter((fav) => {
              if (!search) return true;
              const td = fav.toasts || fav.custom_toasts;
              if (!td) return false;
              const s = search.toLowerCase();
              return (td.title_ka?.toLowerCase().includes(s) || td.title_en?.toLowerCase().includes(s) || td.body_ka?.toLowerCase().includes(s));
            }).map((fav, i) => {
              const toastData = fav.toasts || fav.custom_toasts;
              if (!toastData) return null;
              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="card-interactive cursor-pointer group bg-rose-50/20 dark:bg-rose-950/5 border-rose-200/30 dark:border-rose-800/10"
                    onClick={() => setSelectedToast(toastData)}
                  >
                    <CardContent className="p-5 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-wine-light flex items-center justify-center shrink-0 mt-0.5">
                        <SystemIcon
                          name="nav.favorites"
                          size="sm"
                          tone="primary"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground">
                            {isEn
                              ? toastData.title_en || toastData.title_ka
                              : toastData.title_ka}
                          </h3>
                          {"occasion_type" in toastData &&
                            toastData.occasion_type && (
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                {t(
                                  `feasts.occasion.${toastData.occasion_type}`,
                                  toastData.occasion_type
                                )}
                              </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {isEn
                            ? toastData.body_en || toastData.body_ka
                            : toastData.body_ka}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                          {new Date(fav.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); navigate("/feasts"); }}
                        >
                          <SystemIcon
                            name="nav.feasts"
                            size="sm"
                            tone="muted"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFav.mutate(fav.id);
                          }}
                        >
                          <SystemIcon
                            name="action.delete"
                            size="sm"
                            tone="danger"
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
        <EmptyState
          icon={
            <SystemIcon
              name="nav.favorites"
              size="lg"
              tone="primary"
            />
          }
          title={t("favorites.empty")}
          description={t("favorites.emptyDesc")}
          actionLabel={t("nav.toasts")}
          onAction={() => navigate("/toasts")}
        />
      )}

      {/* Toast Detail Dialog */}
      <Dialog
        open={!!selectedToast}
        onOpenChange={(open) => !open && setSelectedToast(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {isEn
                ? selectedToast?.title_en || selectedToast?.title_ka
                : selectedToast?.title_ka || t("favorites.title")}
            </DialogTitle>
            <DialogDescription>
              {"occasion_type" in (selectedToast || {}) &&
                selectedToast?.occasion_type && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {String(
                      t(
                        `feasts.occasion.${selectedToast.occasion_type}`,
                        selectedToast.occasion_type
                      )
                    )}
                  </Badge>
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {(() => {
              const primaryBody = isEn
                ? selectedToast?.body_en || selectedToast?.body_ka
                : selectedToast?.body_ka;
              const secondaryBody = isEn
                ? selectedToast?.body_ka
                : selectedToast?.body_en;
              return (
                <>
                  {primaryBody && (
                    <div className="p-4 rounded-xl bg-surface-1">
                      <p className="text-caption text-muted-foreground mb-2 font-semibold">
                        {isEn ? "🇬🇧 English" : "🇬🇪 ქართულად"}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {primaryBody}
                      </p>
                    </div>
                  )}
                  {secondaryBody && (
                    <div className="p-4 rounded-xl bg-surface-1">
                      <p className="text-caption text-muted-foreground mb-2 font-semibold">
                        {isEn ? "🇬🇪 ქართულად" : "🇬🇧 English"}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {secondaryBody}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
            {selectedToast?.title_en && (
              <p className="text-xs text-muted-foreground italic">
                {selectedToast.title_en}
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const body = isEn
                  ? selectedToast?.body_en || selectedToast?.body_ka
                  : selectedToast?.body_ka;
                if (body) {
                  navigator.clipboard.writeText(body);
                  sonnerToast.success(t("common.copied"));
                }
              }}
            >
              <SystemIcon
                name="action.copy"
                size="sm"
                tone="muted"
                className="mr-1.5"
              />
              {t("common.copy")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedToast(null);
                navigate("/feasts");
              }}
            >
            <SystemIcon
              name="nav.feasts"
              size="sm"
              tone="muted"
              className="mr-1.5"
            />
              {t("ai.useInFeast")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FavoritesPage;
