import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import SystemIcon from "@/components/SystemIcon";
import EmptyState from "@/components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

const occasionKeys = [
  "supra", "wedding", "birthday", "memorial", "christening",
  "guest_reception", "holiday", "business", "friendly_gathering", "other",
];

const LibraryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isEn = i18n.language === "en";
  const [search, setSearch] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((tpl) => {
      if (occasionFilter !== "all" && tpl.occasion_type !== occasionFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const name = (isEn && tpl.name_en ? tpl.name_en : tpl.name_ka).toLowerCase();
        if (!name.includes(s)) return false;
      }
      return true;
    });
  }, [templates, search, occasionFilter, isEn]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-display text-heading-1 text-foreground">
          {t("library.title")}
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {t("library.subtitle")}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <SystemIcon
          name="action.search"
          size="sm"
          tone="muted"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />
        <Input
          placeholder={t("common.search") + "..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 bg-surface-1 border-border"
        />
      </div>

      {/* Occasion filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setOccasionFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            occasionFilter === "all"
              ? "bg-primary text-primary-foreground shadow-card"
              : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
          }`}
        >
          {t("common.all")}
        </button>
        {occasionKeys.map((o) => (
          <button
            key={o}
            onClick={() => setOccasionFilter(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              occasionFilter === o
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
            }`}
          >
            {t(`feasts.occasion.${o}`)}
          </button>
        ))}
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
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTemplates.map((tpl, i) => {
            const seq = Array.isArray(tpl.toast_sequence)
              ? (tpl.toast_sequence as Array<{ title_ka?: string; title_en?: string; toast_type?: string; position?: number }>)
              : [];
            const name = isEn && tpl.name_en ? tpl.name_en : tpl.name_ka;
            const isExpanded = expandedId === tpl.id;
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
                        <SystemIcon
                          name="nav.library"
                          size="md"
                          tone="primary"
                          className="group-hover:text-accent-foreground transition-colors"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {t(`feasts.occasion.${tpl.occasion_type}`, tpl.occasion_type)}
                          </Badge>
                          {tpl.formality_level && (
                            <Badge variant="secondary" className="text-[10px]">
                              {t(`feasts.formalityOptions.${tpl.formality_level}`, tpl.formality_level)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SystemIcon
                              name="nav.toasts"
                              size="xs"
                              tone="muted"
                            />
                            {seq.length} {t("live.toastProgress")}
                          </span>
                          {tpl.estimated_duration_minutes && (
                            <span className="flex items-center gap-1">
                              <SystemIcon
                                name="status.time"
                                size="xs"
                                tone="muted"
                              />
                              {formatDuration(tpl.estimated_duration_minutes)}
                            </span>
                          )}
                        </div>

                        {/* Template preview toggle */}
                        {seq.length > 0 && (
                          <button
                            type="button"
                            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {isExpanded ? t("common.hideChanges") : `${seq.length} items`}
                          </button>
                        )}
                        <AnimatePresence>
                          {isExpanded && seq.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-1 pl-1 border-l-2 border-border">
                                {seq.slice(0, 10).map((item, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground pl-2 py-0.5">
                                    <span className="font-medium text-foreground">{item.position ?? idx + 1}.</span>{" "}
                                    {isEn ? (item.title_en || item.title_ka) : item.title_ka}
                                  </div>
                                ))}
                                {seq.length > 10 && (
                                  <div className="text-[10px] text-muted-foreground pl-2">+{seq.length - 10} more</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 h-8 px-3 text-xs text-primary hover:bg-wine-light -ml-3"
                          onClick={() => navigate(`/feasts/new?template=${tpl.occasion_type}`)}
                        >
                          {t("library.useTemplate")}
                          <SystemIcon
                            name="action.next"
                            size="xs"
                            tone="primary"
                            className="ml-1"
                          />
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
          icon={
            <SystemIcon
              name="nav.library"
              size="lg"
              tone="primary"
            />
          }
          title={t("library.noTemplates")}
          description={t("library.subtitle")}
        />
      )}
    </div>
  );
};

export default LibraryPage;
