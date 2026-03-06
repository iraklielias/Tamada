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
import SystemIcon from "@/components/SystemIcon";
import { motion } from "framer-motion";
import { staggerContainer, staggerChild } from "@/lib/animations";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const { data: activeFeast } = useQuery({
    queryKey: ["active-feast-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feasts")
        .select("id, title, status, occasion_type")
        .in("status", ["active", "paused"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

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

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [feastsRes, toastsRes, favsRes] = await Promise.all([
        supabase.from("feasts").select("*", { count: "exact", head: true }),
        supabase.from("ai_generation_log").select("*", { count: "exact", head: true }),
        supabase.from("user_favorites").select("*", { count: "exact", head: true }),
      ]);
      return {
        feasts: feastsRes.count ?? 0,
        aiToasts: toastsRes.count ?? 0,
        favorites: favsRes.count ?? 0,
      };
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.greeting.morning");
    if (h < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  const greetingEmoji = () => {
    const h = new Date().getHours();
    if (h < 12) return "☀️";
    if (h < 18) return "🌤️";
    return "🌙";
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* ═══════════ Hero greeting card ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        className="relative overflow-hidden rounded-2xl wine-gradient p-6 md:p-8 text-primary-foreground"
      >
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm opacity-80 mb-1 font-medium">
              {greetingEmoji()} {greeting()}
            </p>
            <h1 className="font-display text-heading-1 md:text-display-sm text-primary-foreground mb-2">
              {profile?.display_name || "თამადა"}
            </h1>
            <p className="text-body-sm opacity-75 max-w-md">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center shrink-0 border border-white/10">
            <SystemIcon name="decor.horn" size={28} className="text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      {/* ═══════════ First-Time Nudge ═══════════ */}
      {stats && stats.feasts === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-dashed border-primary/30 bg-primary/5 overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <SystemIcon name="nav.ai" size="md" tone="primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{t("dashboard.firstFeastTitle", "Create your first feast")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.firstFeastDesc", "Set up a feast in 60 seconds and let AI plan your toasts")}</p>
              </div>
              <Button variant="wine" size="sm" className="shadow-wine shrink-0" onClick={() => navigate("/feasts/new")}>
                <SystemIcon name="action.add" size="sm" className="mr-1.5" /> {t("feasts.newFeast")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══════════ Active Feast Banner ═══════════ */}
      {activeFeast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            className="border-success/40 bg-success/5 cursor-pointer group overflow-hidden"
            onClick={() => navigate(`/feasts/${activeFeast.id}/live`)}
          >
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                  <SystemIcon name="action.play" size="md" tone="success" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{activeFeast.title}</p>
                    <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                      {t(`feasts.status.${activeFeast.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.returnToFeast")}</p>
                </div>
              </div>
              <SystemIcon name="action.next" size="sm" tone="success" className="shrink-0 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══════════ Activity Stats Strip ═══════════ */}
      {stats && (stats.feasts > 0 || stats.aiToasts > 0 || stats.favorites > 0) && (
        <div className="flex items-center gap-4 md:gap-6 text-sm text-muted-foreground overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <SystemIcon name="nav.feasts" size="xs" tone="muted" />
            <span className="font-medium text-foreground">{stats.feasts}</span>
            {isEn ? "feasts" : t("nav.feasts").toLowerCase()}
          </div>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <SystemIcon name="nav.ai" size="xs" tone="muted" />
            <span className="font-medium text-foreground">{stats.aiToasts}</span>
            {isEn ? "AI toasts" : "AI სადღეგრძელო"}
          </div>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <SystemIcon name="action.favorite" size="xs" tone="muted" />
            <span className="font-medium text-foreground">{stats.favorites}</span>
            {t("nav.favorites").toLowerCase()}
          </div>
        </div>
      )}

      {/* ═══════════ Quick actions — bento grid ═══════════ */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* New Feast — primary action */}
        <motion.button
          variants={staggerChild}
          onClick={() => navigate("/feasts/new")}
          className="col-span-2 md:col-span-1 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] wine-gradient-vivid text-primary-foreground shadow-wine"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <SystemIcon name="action.add" size="md" />
          </div>
          <p className="font-semibold text-sm">{t("feasts.newFeast")}</p>
          <p className="text-xs opacity-75 mt-1">{t("dashboard.createFirst")}</p>
        </motion.button>

        {/* AI Generator — amber/gold tint */}
        <motion.button
          variants={staggerChild}
          onClick={() => navigate("/ai-generate")}
          className="rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/20 hover:border-amber-300 hover:shadow-card-hover"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
            <SystemIcon name="nav.ai" size="md" className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-semibold text-sm text-foreground">{t("nav.aiGenerator")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("ai.subtitle")}</p>
        </motion.button>

        {/* Library — parchment tone */}
        <motion.button
          variants={staggerChild}
          onClick={() => navigate("/library")}
          className="rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-orange-50/30 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-800/15 hover:border-orange-300 hover:shadow-card-hover"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center mb-3">
            <SystemIcon name="nav.library" size="md" className="text-gold" />
          </div>
          <p className="font-semibold text-sm text-foreground">{t("nav.library")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("library.subtitle")}</p>
        </motion.button>

        {/* Favorites — wine-rose tint */}
        <motion.button
          variants={staggerChild}
          onClick={() => navigate("/favorites")}
          className="rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-rose-50/40 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-800/15 hover:border-rose-300 hover:shadow-card-hover"
        >
          <div className="w-10 h-10 rounded-xl bg-wine-light flex items-center justify-center mb-3">
            <SystemIcon name="nav.favorites" size="md" className="text-wine" />
          </div>
          <p className="font-semibold text-sm text-foreground">{t("nav.favorites")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {favCount ?? 0} {t("favorites.title").toLowerCase()}
          </p>
        </motion.button>
      </motion.div>

      {/* ═══════════ Two-column layout for feasts & toasts ═══════════ */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* ── Recent Feasts ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-foreground">
              {t("dashboard.upcomingFeasts")}
            </h2>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/feasts")}
              className="text-muted-foreground hover:text-foreground"
              >
              {t("dashboard.viewAll")}
              <SystemIcon name="action.next" size="xs" className="ml-0.5" tone="muted" />
            </Button>
          </div>

          {feastsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-surface-2 rounded" />
                      <div className="h-2 w-20 bg-surface-2 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentFeasts && recentFeasts.length > 0 ? (
            <div className="space-y-3">
              {recentFeasts.map((feast, i) => (
                <motion.div
                  key={feast.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Card
                    className={`card-interactive cursor-pointer group ${(feast.status === "active" || feast.status === "paused") ? "border-l-[3px] border-l-green-500" : ""}`}
                    onClick={() => navigate(`/feasts/${feast.id}`)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:bg-wine-light transition-colors">
                          <SystemIcon name="nav.feasts" size="md" className="text-accent-foreground group-hover:text-wine transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {feast.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {t(
                                `feasts.occasion.${feast.occasion_type}`,
                                feast.occasion_type
                              )}
                            </span>
                            {feast.guest_count && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <SystemIcon name="nav.profile" size="xs" tone="muted" /> {feast.guest_count}
                              </span>
                            )}
                            {feast.estimated_duration_minutes && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <SystemIcon name="status.time" size="xs" tone="muted" />{" "}
                                {feast.estimated_duration_minutes}{t("common.minAbbrev")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px]">
                          {t(
                            `feasts.status.${feast.status || "draft"}`,
                            feast.status || "draft"
                          )}
                        </Badge>
                        <SystemIcon name="action.next" size="xs" tone="muted" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SystemIcon name="nav.feasts" size="lg" />}
              title={t("dashboard.noFeasts")}
              description={t("dashboard.createFirst")}
              actionLabel={t("feasts.newFeast")}
              onAction={() => navigate("/feasts/new")}
            />
          )}
        </section>

        {/* ── Popular Toasts ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-foreground">
              {t("dashboard.popularToasts")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/toasts")}
              className="text-muted-foreground hover:text-foreground"
              >
              {t("dashboard.viewAll")}
              <SystemIcon name="action.next" size="xs" className="ml-0.5" tone="muted" />
            </Button>
          </div>

          {toastsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 h-[72px] animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-28 bg-surface-2 rounded" />
                      <div className="h-2 w-40 bg-surface-2 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentToasts && recentToasts.length > 0 ? (
            <div className="space-y-3">
              {recentToasts.map((toast, i) => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card
                    className="card-interactive cursor-pointer group"
                    onClick={() => navigate("/toasts")}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-wine-light flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent transition-colors">
                        <SystemIcon name="nav.toasts" size="sm" className="text-wine group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {isEn ? (toast.title_en || toast.title_ka) : toast.title_ka}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {isEn ? (toast.body_en || toast.body_ka) : toast.body_ka}
                        </p>
                      </div>
                      {toast.tags && toast.tags.length > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0 mt-0.5"
                        >
                          {toast.tags[0]}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SystemIcon name="nav.toasts" size="lg" />}
              title={t("dashboard.noToasts")}
              description={t("library.subtitle")}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
