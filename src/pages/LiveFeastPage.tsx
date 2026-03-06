import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Play, Pause, Square, Check, SkipForward, Undo2,
  Wine, Hand, Maximize2, Minimize2, ChevronRight, ChevronDown, ChevronUp, Share2,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import FeastAdvisory from "@/components/FeastAdvisory";

const toastTypeAccent: Record<string, string> = {
  mandatory: "bg-primary/10 text-primary border-primary/20",
  traditional: "bg-primary/10 text-primary border-primary/20",
  religious: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  patriotic: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  humorous: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  personal: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  custom: "bg-muted text-muted-foreground border-border",
};

const LiveFeastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [alertFired, setAlertFired] = useState<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [lastSkippedToastId, setLastSkippedToastId] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const { data: feast, isLoading: feastLoading } = useQuery({
    queryKey: ["feast", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feasts").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: feastToasts } = useQuery({
    queryKey: ["feast-toasts", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feast_toasts").select("*").eq("feast_id", id!).order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: guests } = useQuery({
    queryKey: ["feast-guests", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feast_guests").select("*").eq("feast_id", id!).order("seat_position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: false,
  });

  const currentToastIndex = feastToasts?.findIndex((t) => t.status === "pending" || t.status === "active") ?? -1;
  const currentToast = currentToastIndex >= 0 ? feastToasts![currentToastIndex] : null;

  const { data: assignedToastBody } = useQuery({
    queryKey: ["assigned-toast", currentToast?.assigned_toast_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("toasts").select("body_ka, body_en").eq("id", currentToast!.assigned_toast_id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentToast?.assigned_toast_id && !currentToast?.assigned_custom_toast_id,
  });

  const { data: customToastBody } = useQuery({
    queryKey: ["custom-toast-body", currentToast?.assigned_custom_toast_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_toasts").select("body_ka, body_en").eq("id", currentToast!.assigned_custom_toast_id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentToast?.assigned_custom_toast_id,
  });

  const isHost = feast?.host_id === user?.id;
  const isPaused = feast?.status === "paused";
  const isActive = feast?.status === "active";
  const isLive = isActive || isPaused;

  const completedCount = feastToasts?.filter((t) => t.status === "completed" || t.status === "skipped").length ?? 0;
  const totalCount = feastToasts?.length ?? 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const upcomingToasts = feastToasts?.slice(currentToastIndex + 1, currentToastIndex + 3) ?? [];

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`feast-live-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feast_toasts", filter: `feast_id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feast_guests", filter: `feast_id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feasts", filter: `id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["feast", id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  useEffect(() => { if (!isActive) { setIsTimerRunning(false); return; } setIsTimerRunning(true); }, [isActive]);
  useEffect(() => { if (!isTimerRunning) return; const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000); return () => clearInterval(interval); }, [isTimerRunning]);

  useEffect(() => {
    if (feast?.actual_start_time && isActive) {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(feast.actual_start_time).getTime()) / 1000)));
    }
  }, [feast?.actual_start_time, isActive]);

  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!currentToast?.duration_minutes || !isActive) return;
    const durationSec = currentToast.duration_minutes * 60;
    const remaining = durationSec - (elapsedSeconds % durationSec);
    if (remaining <= 60 && !alertFired.has(`${currentToast.id}-60`)) {
      playChime(); setAlertFired((prev) => new Set(prev).add(`${currentToast.id}-60`));
    }
  }, [elapsedSeconds, currentToast, isActive, alertFired, playChime]);

  const updateFeastStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: Record<string, unknown> = { status };
      if (status === "active" && !feast?.actual_start_time) updates.actual_start_time = new Date().toISOString();
      if (status === "completed") updates.actual_end_time = new Date().toISOString();
      const { error } = await supabase.from("feasts").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["feast", id] }); sonnerToast.success(t("common.statusUpdated")); },
  });

  const completeToast = useMutation({
    mutationFn: async (toastId: string) => { const { error } = await supabase.from("feast_toasts").update({ status: "completed", actual_time: new Date().toISOString() }).eq("id", toastId); if (error) throw error; },
    onSuccess: () => { setLastSkippedToastId(null); queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }); },
  });

  const skipToast = useMutation({
    mutationFn: async (toastId: string) => { const { error } = await supabase.from("feast_toasts").update({ status: "skipped" }).eq("id", toastId); if (error) throw error; return toastId; },
    onSuccess: (toastId) => { setLastSkippedToastId(toastId); queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }); },
  });

  const undoSkip = useMutation({
    mutationFn: async (toastId: string) => {
      const { error } = await supabase.from("feast_toasts").update({ status: "pending" }).eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => { setLastSkippedToastId(null); queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }); },
  });

  const incrementAlaverdi = useMutation({
    mutationFn: async (guestId: string) => { const { error } = await supabase.rpc("increment_alaverdi", { p_guest_id: guestId }); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }); sonnerToast.success(t("live.alaverdiRecorded")); },
  });

  const assignAlaverdi = useMutation({
    mutationFn: async ({ toastId, guestName }: { toastId: string; guestName: string }) => {
      const { error } = await supabase.from("feast_toasts").update({ alaverdi_assigned_to: guestName }).eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600); const m = Math.floor((secs % 3600) / 60); const s = secs % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  };

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const completedToastsData = useMemo(() =>
    (feastToasts || []).filter(t => t.status === "completed").map(t => ({
      position: t.position,
      title_ka: t.title_ka,
      toast_type: t.toast_type,
    })), [feastToasts]);
  const skippedCount = feastToasts?.filter(t => t.status === "skipped").length ?? 0;
  const guestsForAdvisory = useMemo(() =>
    (guests || []).map(g => ({ name: g.name, alaverdi_count: g.alaverdi_count })), [guests]);
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const currentToastBody = customToastBody?.body_ka || assignedToastBody?.body_ka || currentToast?.description_ka || null;
  const currentToastBodyEn = customToastBody?.body_en || assignedToastBody?.body_en || currentToast?.description_en || null;

  if (feastLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">{t("common.loading")}</div></div>;
  if (!feast) return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">{t("common.notFound")}</p><Button variant="outline" onClick={() => navigate("/feasts")}>{t("common.back")}</Button></div>;

  const estimatedTotalMinutes = feast.estimated_duration_minutes || 0;
  const isOverTime = estimatedTotalMinutes > 0 && elapsedMinutes > estimatedTotalMinutes;
  const isEnLang = typeof window !== "undefined" && localStorage.getItem("tamada-lang") === "en";

  const getDisplayTitle = (toast: { title_en?: string | null; title_ka: string }) =>
    isEnLang ? (toast.title_en || toast.title_ka) : toast.title_ka;

  const typeAccentClass = currentToast ? (toastTypeAccent[currentToast.toast_type] || toastTypeAccent.custom) : "";

  /* ── PRESENTATION MODE ── */
  if (presentationMode && !allCompleted) {
    const primaryBody = currentToast ? (isEnLang ? (currentToastBodyEn || currentToastBody) : currentToastBody) : null;
    return (
      <div className="fixed inset-0 z-[100] flex flex-col live-presentation-bg text-white">
        {/* Thin progress line at very top */}
        <div className="h-1 w-full bg-white/10">
          <motion.div className="h-full bg-white/40" style={{ width: `${progressPercent}%` }} layout transition={{ duration: 0.4 }} />
        </div>

        {/* Minimal top bar: timer + exit */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {isActive && <span className="h-3 w-3 rounded-full bg-green-400 live-pulse-dot" />}
            <span className="font-mono text-2xl font-bold tabular-nums text-white/90">{formatTime(elapsedSeconds)}</span>
            {estimatedTotalMinutes > 0 && (
              <span className="text-sm text-white/40 ml-1">/ {estimatedTotalMinutes}m</span>
            )}
          </div>
          <button onClick={() => setPresentationMode(false)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Minimize2 className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Main toast content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 max-w-3xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {currentToast ? (
              <motion.div key={currentToast.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }} className="text-center space-y-8 w-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-white/30 text-xl font-mono">{currentToast.position}/{totalCount}</span>
                    <Badge className={`border ${typeAccentClass} bg-white/10 text-white/80 border-white/20`}>
                      {t(`live.toastType.${currentToast.toast_type}`, currentToast.toast_type)}
                    </Badge>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-display font-bold leading-[1.15] text-white">
                    {getDisplayTitle(currentToast)}
                  </h1>
                </div>
                {primaryBody && (
                  <ScrollArea className="max-h-[45vh]">
                    <p className="text-xl md:text-2xl leading-[1.9] text-white/80 max-w-2xl mx-auto">{primaryBody}</p>
                  </ScrollArea>
                )}
                {currentToast.alaverdi_assigned_to && (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white/90 text-lg">
                    <Hand className="h-5 w-5" /> {t("feastDetail.alaverdi")}: <strong>{currentToast.alaverdi_assigned_to}</strong>
                  </div>
                )}
              </motion.div>
            ) : (
              <p className="text-xl text-white/50">{t("live.noToastsAdded")}</p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom action */}
        {isHost && isActive && currentToast && (
          <div className="flex items-center justify-center gap-6 pb-10">
            <button className="h-20 w-20 rounded-full bg-white text-[hsl(var(--wine-deep))] shadow-lg flex items-center justify-center active:scale-95 transition-transform" onClick={() => completeToast.mutate(currentToast.id)} disabled={completeToast.isPending}>
              <Check className="h-8 w-8" />
            </button>
            <button className="h-14 w-14 rounded-full border-2 border-white/30 text-white/70 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/10" onClick={() => skipToast.mutate(currentToast.id)} disabled={skipToast.isPending}>
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── NORMAL MODE ── */
  return (
    <div className="min-h-screen flex flex-col live-page-bg">
      {/* Pulsing top border */}
      {isActive && <div className="h-[3px] w-full wine-gradient live-pulse-border" />}

      {/* ── Compact Header: title + timer + toggle ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-3 py-2.5 gap-3">
          {/* Left: back + title + badge */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate(`/feasts/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex items-center gap-2">
              <h1 className="text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">{feast.title}</h1>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-pulse-dot" />
                  {t("live.liveLabel", "LIVE")}
                </span>
              )}
              {isPaused && (
                <Badge variant="secondary" className="text-[10px]">⏸ {t("common.pause")}</Badge>
              )}
            </div>
          </div>

          {/* Center: timer */}
          <div className="flex flex-col items-center shrink-0">
            <span className={`font-mono font-bold tabular-nums text-xl ${isOverTime ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
              {formatTime(elapsedSeconds)}
            </span>
            {estimatedTotalMinutes > 0 && (
              <span className={`text-[10px] ${isOverTime ? "text-amber-600/70 dark:text-amber-400/70" : "text-muted-foreground"}`}>
                / {estimatedTotalMinutes}{t("common.minAbbrev", "m")}
              </span>
            )}
          </div>

          {/* Right: presentation + pause/stop */}
          <div className="flex items-center gap-1 shrink-0">
            {isHost && isPaused && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFeastStatus.mutate("active")}>
                <Play className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {isHost && isActive && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFeastStatus.mutate("paused")}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {isHost && isLive && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateFeastStatus.mutate("completed")}>
                <Square className="h-3.5 w-3.5" />
              </Button>
            )}
            {isHost && feast.status === "draft" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateFeastStatus.mutate("active")}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPresentationMode(true)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Thin progress bar at header bottom */}
        <div className="h-1 w-full bg-border/50">
          <motion.div
            className="h-full wine-gradient"
            style={{ width: `${progressPercent}%` }}
            layout
            transition={{ duration: 0.4 }}
          />
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5 overflow-y-auto">
        {/* Progress fraction chip */}
        <div className="text-xs text-muted-foreground font-medium">
          {completedCount}/{totalCount} {t("live.toastProgress")} &middot; {Math.round(progressPercent)}%
        </div>

        <AnimatePresence mode="wait">
          {/* ── COMPLETION SCREEN ── */}
          {allCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center space-y-6 w-full max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                className="text-7xl"
              >
                🎉
              </motion.div>
              <h2 className="font-display text-heading-1 text-foreground">{t("live.allCompleted")}</h2>
              <p className="text-body text-muted-foreground">{t("live.allCompletedDesc")}</p>

              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { value: feastToasts?.filter(t => t.status === "completed").length ?? 0, label: t("common.completed"), color: "bg-green-500/10 border-green-500/20" },
                  { value: skippedCount, label: t("common.skip"), color: "bg-amber-500/10 border-amber-500/20" },
                  { value: formatTime(elapsedSeconds), label: t("feasts.duration"), color: "bg-primary/10 border-primary/20" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`p-4 rounded-2xl border ${stat.color}`}
                  >
                    <p className="text-heading-2 text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {guests && guests.some(g => (g.alaverdi_count ?? 0) > 0) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 space-y-2 max-w-xs mx-auto">
                  <p className="text-sm font-semibold text-foreground">{t("feastDetail.alaverdi")} 🏆</p>
                  {[...guests].sort((a, b) => (b.alaverdi_count ?? 0) - (a.alaverdi_count ?? 0)).filter(g => (g.alaverdi_count ?? 0) > 0).map((g, i) => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                      <span className="text-sm font-medium text-foreground">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {g.name}</span>
                      <Badge variant="secondary">{g.alaverdi_count}</Badge>
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate(`/feasts/${id}`)}>
                  {t("live.returnBack")}
                </Button>
              </div>
            </motion.div>

          ) : currentToast ? (
            /* ── CURRENT TOAST CARD ── */
            <motion.div
              key={currentToast.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-2xl"
            >
              <div className={`relative rounded-2xl border bg-card p-6 md:p-8 ${isActive ? "shadow-wine border-primary/15" : "border-border shadow-sm"}`}>
                {/* Position badge overlapping top-left */}
                <div className="absolute -top-5 left-6">
                  <div className="h-10 w-10 rounded-full wine-gradient flex items-center justify-center font-bold text-primary-foreground text-lg shadow-wine">
                    {currentToast.position}
                  </div>
                </div>

                <div className="pt-3 space-y-4">
                  {/* Type badge + duration */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`border text-xs ${typeAccentClass}`}>
                      {t(`live.toastType.${currentToast.toast_type}`, currentToast.toast_type)}
                    </Badge>
                    {currentToast.duration_minutes && (
                      <span className="text-xs text-muted-foreground">⏱ {currentToast.duration_minutes}{t("common.minAbbrev", "m")}</span>
                    )}
                    {currentToast.alaverdi_assigned_to && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Hand className="h-3 w-3" /> {currentToast.alaverdi_assigned_to}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-[1.2]">
                    {getDisplayTitle(currentToast)}
                  </h2>

                  {/* Body text with Georgian typography */}
                  {(() => {
                    const primaryBody = isEnLang ? (currentToastBodyEn || currentToastBody) : currentToastBody;
                    const secondaryBody = isEnLang ? currentToastBody : currentToastBodyEn;
                    return (
                      <>
                        {primaryBody && (
                          <ScrollArea className="max-h-[40vh]">
                            <div className="border-l-[3px] border-primary/20 pl-5 py-1">
                              <p className="text-base md:text-lg leading-[1.85] text-foreground/85 max-w-xl">
                                {primaryBody}
                              </p>
                            </div>
                          </ScrollArea>
                        )}
                        {secondaryBody && (
                          <div className="pt-1">
                            <button
                              onClick={() => setShowEnglish(!showEnglish)}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showEnglish ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {isEnLang ? "ქართულად" : "English"}
                            </button>
                            <AnimatePresence>
                              {showEnglish && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-sm leading-relaxed text-muted-foreground/70 italic mt-2 pl-5 border-l-[3px] border-border">
                                    {secondaryBody}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* ── Action Zone below the card ── */}
              {isHost && isActive && (
                <div className="flex items-center justify-center gap-5 mt-6">
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      className="h-16 w-16 rounded-full wine-gradient text-white shadow-wine flex items-center justify-center active:scale-95 transition-transform"
                      onClick={() => completeToast.mutate(currentToast.id)}
                      disabled={completeToast.isPending}
                    >
                      <Check className="h-6 w-6" />
                    </button>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("common.complete")}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      className="h-12 w-12 rounded-full border-2 border-border bg-card text-foreground shadow-sm flex items-center justify-center active:scale-95 transition-transform hover:bg-accent"
                      onClick={() => skipToast.mutate(currentToast.id)}
                      disabled={skipToast.isPending}
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] text-muted-foreground">{t("common.skip")}</span>
                  </div>
                  {isPaused && (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        className="h-16 w-16 rounded-full wine-gradient text-white shadow-wine flex items-center justify-center active:scale-95 transition-transform"
                        onClick={() => updateFeastStatus.mutate("active")}
                      >
                        <Play className="h-6 w-6 ml-0.5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground font-medium">{t("common.resume")}</span>
                    </div>
                  )}
                </div>
              )}

              {isHost && lastSkippedToastId && (
                <div className="flex justify-center mt-3">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => undoSkip.mutate(lastSkippedToastId)} disabled={undoSkip.isPending}>
                    <Undo2 className="h-3 w-3 mr-1" />{t("feastDetail.undoSkip")}
                  </Button>
                </div>
              )}
            </motion.div>

          ) : (
            /* ── EMPTY STATE ── */
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-12">
              <Wine className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-body text-muted-foreground">{t("live.noToastsAdded")}</p>
              <Button variant="outline" onClick={() => navigate(`/feasts/${id}`)}>{t("live.editPlan")}</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upcoming strip ── */}
        {upcomingToasts.length > 0 && !allCompleted && (
          <div className="w-full max-w-2xl mt-2">
            <div className="flex items-start gap-3 px-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0 pt-0.5">{t("live.nextUp")}:</span>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {upcomingToasts.map((toast) => (
                  <div key={toast.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-xs font-mono text-muted-foreground/50 w-5 text-right shrink-0">{toast.position}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                    <span className="truncate">{getDisplayTitle(toast)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advisory */}
        {isLive && isHost && feast && (
          <div className="w-full max-w-2xl">
            <FeastAdvisory
              feastId={feast.id}
              occasionType={feast.occasion_type}
              currentToastIndex={currentToastIndex}
              totalToasts={totalCount}
              elapsedMinutes={elapsedMinutes}
              totalDurationMinutes={feast.estimated_duration_minutes}
              guestCount={feast.guest_count ?? guests?.length ?? 0}
              currentToastTitle={currentToast ? getDisplayTitle(currentToast) : undefined}
              currentToastType={currentToast?.toast_type}
              completedToasts={completedToastsData}
              guests={guestsForAdvisory}
              skippedCount={skippedCount}
            />
          </div>
        )}
      </div>

      {/* ── Alaverdi FAB ── */}
      {isLive && guests && guests.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="fixed bottom-6 right-6 h-14 rounded-full shadow-elevated wine-gradient border-0 text-primary-foreground z-50 px-5 gap-2">
              <Hand className="h-5 w-5" />
              <span className="text-sm font-semibold">{t("feastDetail.alaverdi")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[75vh] sm:max-w-lg sm:mx-auto sm:rounded-t-2xl">
            <SheetHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-wine-light flex items-center justify-center shrink-0">
                  <Hand className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-base">{t("feastDetail.alaverdi")}</SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {guests.length} {t("feastDetail.guestsLabel", "guests")}
                    {currentToast && (
                      <> &middot; {getDisplayTitle(currentToast)}</>
                    )}
                  </p>
                </div>
              </div>
            </SheetHeader>
            <ScrollArea className="mt-3 max-h-[calc(75vh-100px)]">
              <div className="space-y-2 pr-1">
                {[...guests].sort((a, b) => (b.alaverdi_count ?? 0) - (a.alaverdi_count ?? 0)).map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Hand className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground">{g.alaverdi_count ?? 0}</span>
                          {g.role && <span className="text-[10px] text-muted-foreground/60">&middot; {g.role}</span>}
                        </div>
                      </div>
                    </div>
                    {currentToast && (
                      <Button
                        size="sm"
                        variant="wine"
                        className="h-9 px-4 shadow-wine shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={() => { assignAlaverdi.mutate({ toastId: currentToast.id, guestName: g.name }); incrementAlaverdi.mutate(g.id); }}
                        disabled={incrementAlaverdi.isPending}
                      >
                        <Hand className="h-3.5 w-3.5 mr-1.5" /> {t("common.assign")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default LiveFeastPage;
