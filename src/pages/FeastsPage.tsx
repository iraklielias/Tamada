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
import { Plus, Search, CalendarDays, Users, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
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
      let q = supabase.from("feasts").select("*").order("created_at", { ascending: false });
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
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-foreground">{t("feasts.title")}</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{t("feasts.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/feasts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("feasts.newFeast")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("toasts.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((sf) => (
            <Button key={sf.value} variant={statusFilter === sf.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(sf.value)} className="text-xs">
              {sf.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((feast, i) => (
            <motion.div key={feast.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate(`/feasts/${feast.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{feast.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}
                        </Badge>
                        {feast.guest_count && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {feast.guest_count}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {formatDuration(feast.estimated_duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] ${statusColors[feast.status || "draft"]}`}>
                      {t(`feasts.status.${feast.status || "draft"}`)}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
