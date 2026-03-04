import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/EmptyState";
import {
  Plus,
  Search,
  CalendarDays,
  Users,
  Clock,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  active: "bg-success-light text-success dark:bg-success/20 dark:text-green-400",
  paused: "bg-warning-light text-warning-foreground dark:bg-warning/20 dark:text-amber-400",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const FeastsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const statusFilters = [
    { value: "all", label: t("common.all") },
    { value: "draft", label: t("feasts.status.draft") },
    { value: "active", label: t("feasts.status.active") },
    { value: "paused", label: t("feasts.status.paused") },
    { value: "completed", label: t("feasts.status.completed") },
  ];

  const { data: feasts, isLoading } = useQuery({
    queryKey: ["feasts", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("feasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const filtered = feasts?.filter((f) => {
    if (!search) return true;
    return f.title.toLowerCase().includes(search.toLowerCase());
  });

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}სთ ${m > 0 ? `${m}წთ` : ""}` : `${m}წთ`;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-1 text-foreground">
            {t("feasts.title")}
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {t("feasts.subtitle")}
          </p>
        </div>
        <Button
          variant="wine"
          className="shadow-wine shrink-0"
          onClick={() => navigate("/feasts/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("feasts.newFeast")}
        </Button>
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
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === sf.value
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 bg-surface-2 rounded" />
                  <div className="h-2 w-24 bg-surface-2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((feast, i) => (
            <motion.div
              key={feast.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                className="card-interactive cursor-pointer group"
                onClick={() => navigate(`/feasts/${feast.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:bg-wine-light transition-colors">
                      <UtensilsCrossed className="h-5 w-5 text-accent-foreground group-hover:text-wine transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {feast.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {t(
                            `feasts.occasion.${feast.occasion_type}`,
                            feast.occasion_type
                          )}
                        </Badge>
                        {feast.guest_count && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {feast.guest_count}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />{" "}
                          {formatDuration(feast.estimated_duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-[10px] border-0 ${
                        statusStyles[feast.status || "draft"]
                      }`}
                    >
                      {t(`feasts.status.${feast.status || "draft"}`)}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-10 w-10" />}
          title={t("feasts.noFeasts")}
          description={t("feasts.noFeastsDesc")}
          actionLabel={t("feasts.newFeast")}
          onAction={() => navigate("/feasts/new")}
        />
      )}
    </div>
  );
};

export default FeastsPage;
