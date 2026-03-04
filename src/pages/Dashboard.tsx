import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import {
  Wine, CalendarDays, Plus, Sparkles, Star, Users, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: recentFeasts, isLoading: feastsLoading } = useQuery({
    queryKey: ["recent-feasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentToasts, isLoading: toastsLoading } = useQuery({
    queryKey: ["recent-toasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toasts")
        .select("*")
        .eq("is_system", true)
        .order("popularity_score", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: favCount } = useQuery({
    queryKey: ["fav-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.greeting.morning");
    if (h < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  const quickActions = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: t("feasts.newFeast"),
      desc: t("dashboard.createFirst"),
      onClick: () => navigate("/feasts/new"),
      color: "wine-gradient text-primary-foreground",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: t("nav.aiGenerator"),
      desc: t("ai.subtitle"),
      onClick: () => navigate("/ai-generate"),
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: <Wine className="h-5 w-5" />,
      label: t("nav.library"),
      desc: t("library.subtitle"),
      onClick: () => navigate("/library"),
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: t("nav.favorites"),
      desc: `${favCount ?? 0} ${t("favorites.title").toLowerCase()}`,
      onClick: () => navigate("/favorites"),
      color: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-heading-1 text-foreground">
          {greeting()}, {profile?.display_name || "თამადა"} 👋
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <button
              onClick={a.onClick}
              className={`${a.color} w-full rounded-xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="mb-2">{a.icon}</div>
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{a.desc}</p>
            </button>
          </motion.div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-3 text-foreground">{t("dashboard.upcomingFeasts")}</h2>
        </div>

        {feastsLoading ? (
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))}
          </div>
        ) : recentFeasts && recentFeasts.length > 0 ? (
          <div className="grid gap-3">
            {recentFeasts.map((feast) => (
              <Card key={feast.id} className="hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate(`/feasts/${feast.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{feast.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}
                        </span>
                        {feast.guest_count && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {feast.guest_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {t(`feasts.status.${feast.status || "draft"}`, feast.status || "draft")}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title={t("dashboard.noFeasts")}
            description={t("dashboard.createFirst")}
            actionLabel={t("feasts.newFeast")}
            onAction={() => navigate("/feasts/new")}
          />
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-3 text-foreground">{t("dashboard.popularToasts")}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/library")}>
            {t("common.search")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {toastsLoading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3 h-16" />
              </Card>
            ))}
          </div>
        ) : recentToasts && recentToasts.length > 0 ? (
          <div className="grid gap-2">
            {recentToasts.map((toast) => (
              <Card key={toast.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Wine className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground">{toast.title_ka}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{toast.body_ka}</p>
                  </div>
                  {toast.tags && toast.tags.length > 0 && (
                    <Badge variant="outline" className="text-[10px] shrink-0">{toast.tags[0]}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wine className="h-10 w-10" />}
            title={t("dashboard.noToasts")}
            description={t("library.subtitle")}
          />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
