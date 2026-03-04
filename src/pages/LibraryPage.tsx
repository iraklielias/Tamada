import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Wine, ArrowRight } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { motion } from "framer-motion";

const LibraryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isEn = i18n.language === "en";

  const { data: templates, isLoading } = useQuery({
    queryKey: ["toast-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toast_templates")
        .select("*")
        .order("occasion_type", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}სთ ${m > 0 ? `${m}წთ` : ""}` : `${m}წთ`;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-display text-heading-1 text-foreground">
          {t("library.title")}
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {t("library.subtitle")}
        </p>
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-28 bg-surface-2 rounded" />
                  <div className="h-2 w-20 bg-surface-2 rounded" />
                  <div className="h-2 w-16 bg-surface-2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((tpl, i) => {
            const seq = Array.isArray(tpl.toast_sequence)
              ? tpl.toast_sequence
              : [];
            const name = isEn && tpl.name_en ? tpl.name_en : tpl.name_ka;
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Card className="card-interactive group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gold-light flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                        <BookOpen className="h-6 w-6 text-gold group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {t(
                              `feasts.occasion.${tpl.occasion_type}`,
                              tpl.occasion_type
                            )}
                          </Badge>
                          {tpl.formality_level && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {t(
                                `feasts.formalityOptions.${tpl.formality_level}`,
                                tpl.formality_level
                              )}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Wine className="h-3 w-3" />
                            {seq.length} {t("live.toastProgress")}
                          </span>
                          {tpl.estimated_duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(tpl.estimated_duration_minutes)}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 h-8 px-3 text-xs text-primary hover:bg-wine-light -ml-3"
                          onClick={() =>
                            navigate(
                              `/feasts/new?template=${tpl.occasion_type}`
                            )
                          }
                        >
                          {t("library.useTemplate", "Use template")}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title={t("library.noTemplates")}
          description={t("library.subtitle")}
        />
      )}
    </div>
  );
};

export default LibraryPage;
