import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowLeft, Play, Pause, Square, Check, SkipForward, Undo2,
  Clock, Wine, Hand,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import FeastAdvisory from "@/components/FeastAdvisory";

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

  // Fetch assigned toast body text when current toast has assigned_toast_id
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

  // Fetch custom toast body when assigned_custom_toast_id is set (AI-generated feast toasts)
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

  // Realtime subscriptions
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

  // Timer: only run when active, calculate from start time
  useEffect(() => { if (!isActive) { setIsTimerRunning(false); return; } setIsTimerRunning(true); }, [isActive]);
  useEffect(() => { if (!isTimerRunning) return; const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000); return () => clearInterval(interval); }, [isTimerRunning]);

  // Initialize elapsed from actual_start_time, accounting for paused time
  // Since we don't track cumulative paused time in DB, we show wall-clock elapsed from start
  // but stop counting when paused (timer stops via isTimerRunning)
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

  // Get the body text for the current toast: custom_toast > assigned_toast > description
  const currentToastBody = customToastBody?.body_ka || assignedToastBody?.body_ka || currentToast?.description_ka || null;
  const currentToastBodyEn = customToastBody?.body_en || assignedToastBody?.body_en || currentToast?.description_en || null;

  if (feastLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">{t("common.loading")}</div></div>;
  if (!feast) return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">{t("common.notFound")}</p><Button variant="outline" onClick={() => navigate("/feasts")}>{t("common.back")}</Button></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/feasts/${id}`)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-heading-3 text-foreground truncate max-w-[200px]">{feast.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                {isActive ? "🔴 LIVE" : isPaused ? `⏸ ${t("common.pause")}` : feast.status}
              </Badge>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {formatTime(elapsedSeconds)}</span>
            </div>
          </div>
        </div>
        {isHost && (
          <div className="flex gap-1.5">
            {isPaused && <Button size="sm" onClick={() => updateFeastStatus.mutate("active")}><Play className="h-3.5 w-3.5 mr-1" />{t("common.resume")}</Button>}
            {isActive && <Button size="sm" variant="outline" onClick={() => updateFeastStatus.mutate("paused")}><Pause className="h-3.5 w-3.5 mr-1" />{t("common.pause")}</Button>}
            {isLive && <Button size="sm" variant="outline" onClick={() => updateFeastStatus.mutate("completed")}><Square className="h-3.5 w-3.5 mr-1" />{t("common.complete")}</Button>}
            {feast.status === "draft" && <Button size="sm" onClick={() => updateFeastStatus.mutate("active")}><Play className="h-3.5 w-3.5 mr-1" />{t("common.start")}</Button>}
          </div>
        )}
      </header>

      <div className="px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{completedCount}/{totalCount} {t("live.toastProgress")}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <AnimatePresence mode="wait">
          {allCompleted ? (
            <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-heading-1 text-foreground">{t("live.allCompleted")}</h2>
              <p className="text-body text-muted-foreground">{t("live.allCompletedDesc")}</p>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 text-center mt-4">
                <div className="p-3 rounded-xl bg-accent">
                  <p className="text-heading-2 text-foreground">{feastToasts?.filter(t => t.status === "completed").length}</p>
                  <p className="text-[10px] text-muted-foreground">{t("common.completed")}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent">
                  <p className="text-heading-2 text-foreground">{skippedCount}</p>
                  <p className="text-[10px] text-muted-foreground">{t("common.skip")}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent">
                  <p className="text-heading-2 text-foreground">{formatTime(elapsedSeconds)}</p>
                  <p className="text-[10px] text-muted-foreground">{t("feasts.duration")}</p>
                </div>
              </div>
              {/* Alaverdi leaderboard */}
              {guests && guests.some(g => (g.alaverdi_count ?? 0) > 0) && (
                <div className="mt-4 space-y-1.5 max-w-xs mx-auto">
                  <p className="text-caption text-muted-foreground">{t("feastDetail.alaverdi")} 🏆</p>
                  {[...guests].sort((a, b) => (b.alaverdi_count ?? 0) - (a.alaverdi_count ?? 0)).filter(g => (g.alaverdi_count ?? 0) > 0).map((g, i) => (
                    <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {g.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{g.alaverdi_count}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={() => navigate(`/feasts/${id}`)}>{t("live.returnBack")}</Button>
            </motion.div>
          ) : currentToast ? (
            <motion.div key={currentToast.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full wine-gradient flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elevated">{currentToast.position}</div>
              </div>
              <div>
                <Badge variant="outline" className="mb-2 text-xs">{t(`live.toastType.${currentToast.toast_type}`, currentToast.toast_type)}</Badge>
                <h2 className="text-display text-foreground">{currentToast.title_ka}</h2>
                {currentToastBody && <p className="text-body text-muted-foreground mt-3 leading-relaxed">{currentToastBody}</p>}
                {currentToastBodyEn && <p className="text-body-sm text-muted-foreground/70 mt-2 italic">{currentToastBodyEn}</p>}
              </div>
              {currentToast.alaverdi_assigned_to && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm">
                  <Hand className="h-4 w-4" /> {t("feastDetail.alaverdi")}: <strong>{currentToast.alaverdi_assigned_to}</strong>
                </div>
              )}
              {currentToast.duration_minutes && <p className="text-caption text-muted-foreground">⏱ {t("live.estimated")}: {currentToast.duration_minutes}m</p>}
              {isHost && isActive && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button size="lg" onClick={() => completeToast.mutate(currentToast.id)} disabled={completeToast.isPending}><Check className="h-4 w-4 mr-2" />{t("common.completed")}</Button>
                  <Button size="lg" variant="outline" onClick={() => skipToast.mutate(currentToast.id)} disabled={skipToast.isPending}><SkipForward className="h-4 w-4 mr-2" />{t("common.skip")}</Button>
                </div>
              )}
              {/* Undo skip button */}
              {isHost && lastSkippedToastId && (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => undoSkip.mutate(lastSkippedToastId)} disabled={undoSkip.isPending}>
                  <Undo2 className="h-3.5 w-3.5 mr-1.5" />{t("feastDetail.undoSkip")}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <Wine className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-body text-muted-foreground">{t("live.noToastsAdded")}</p>
              <Button variant="outline" onClick={() => navigate(`/feasts/${id}`)}>{t("live.editPlan")}</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {upcomingToasts.length > 0 && !allCompleted && (
          <div className="w-full max-w-lg space-y-2">
            <p className="text-caption text-muted-foreground text-center">{t("live.upcoming")}</p>
            {upcomingToasts.map((toast) => (
              <Card key={toast.id} className="opacity-60">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">{toast.position}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{toast.title_ka}</p>
                    <span className="text-[10px] text-muted-foreground">{t(`live.toastType.${toast.toast_type}`, toast.toast_type)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Advisory */}
        {isLive && isHost && feast && (
          <FeastAdvisory
            feastId={feast.id}
            occasionType={feast.occasion_type}
            currentToastIndex={currentToastIndex}
            totalToasts={totalCount}
            elapsedMinutes={elapsedMinutes}
            totalDurationMinutes={feast.estimated_duration_minutes}
            guestCount={feast.guest_count ?? guests?.length ?? 0}
            currentToastTitle={currentToast?.title_ka}
            currentToastType={currentToast?.toast_type}
            completedToasts={completedToastsData}
            guests={guestsForAdvisory}
            skippedCount={skippedCount}
          />
        )}
      </div>

      {isLive && guests && guests.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevated wine-gradient border-0 text-primary-foreground z-50">
              <Hand className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2"><Hand className="h-5 w-5" /> {t("feastDetail.alaverdi")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[50vh]">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">{g.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t("feastDetail.alaverdi")}: {g.alaverdi_count ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentToast && (
                      <Button size="sm" variant="outline" onClick={() => { assignAlaverdi.mutate({ toastId: currentToast.id, guestName: g.name }); incrementAlaverdi.mutate(g.id); }} disabled={incrementAlaverdi.isPending}>
                        <Hand className="h-3.5 w-3.5 mr-1" /> {t("common.assign")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default LiveFeastPage;
