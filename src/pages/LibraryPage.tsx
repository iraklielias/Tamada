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
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div>
        <h1 className="text-heading-1 text-foreground">{t("library.title")}</h1>
        <p className="text-body-sm text-muted-foreground mt-1">{t("library.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5 h-32" /></Card>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((tpl) => {
            const seq = Array.isArray(tpl.toast_sequence) ? tpl.toast_sequence : [];
            const name = isEn && tpl.name_en ? tpl.name_en : tpl.name_ka;
            return (
              <Card key={tpl.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground">{name}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {t(`feasts.occasion.${tpl.occasion_type}`, tpl.occasion_type)}
                        </Badge>
                        {tpl.formality_level && (
                          <Badge variant="secondary" className="text-[10px]">
                            {t(`feasts.formalityOptions.${tpl.formality_level}`, tpl.formality_level)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Wine className="h-3 w-3" />
                          {seq.length} {t("live.toastProgress")}
                        </span>
                        {tpl.estimated_duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(tpl.estimated_duration_minutes)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs text-primary"
                        onClick={() => navigate(`/feasts/new?template=${tpl.occasion_type}`)}
                      >
                        {t("library.useTemplate", "Use template")} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
