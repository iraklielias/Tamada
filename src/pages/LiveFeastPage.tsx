import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ArrowLeft, Play, Pause, Square, Check, SkipForward,
  Users, Clock, Wine, Hand,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const toastTypeLabel: Record<string, string> = {
  mandatory: "სავალდებულო", traditional: "ტრადიციული",
  custom: "მორგებული", religious: "სარწმუნოებრივი",
  patriotic: "პატრიოტული", humorous: "იუმორისტული",
  personal: "პირადი",
};

const LiveFeastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [alertFired, setAlertFired] = useState<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Fetch feast
  const { data: feast, isLoading: feastLoading } = useQuery({
    queryKey: ["feast", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feasts").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch toasts
  const { data: feastToasts } = useQuery({
    queryKey: ["feast-toasts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feast_toasts").select("*")
        .eq("feast_id", id!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch guests
  const { data: guests } = useQuery({
    queryKey: ["feast-guests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feast_guests").select("*")
        .eq("feast_id", id!)
        .order("seat_position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isHost = feast?.host_id === user?.id;
  const isPaused = feast?.status === "paused";
  const isActive = feast?.status === "active";
  const isLive = isActive || isPaused;

  // Derive current toast (first non-completed/non-skipped)
  const currentToastIndex = feastToasts?.findIndex(
    (t) => t.status === "pending" || t.status === "active"
  ) ?? -1;
  const currentToast = currentToastIndex >= 0 ? feastToasts![currentToastIndex] : null;
  const completedCount = feastToasts?.filter((t) => t.status === "completed" || t.status === "skipped").length ?? 0;
  const totalCount = feastToasts?.length ?? 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const upcomingToasts = feastToasts?.slice(currentToastIndex + 1, currentToastIndex + 3) ?? [];

  // Timer
  useEffect(() => {
    if (!isActive) { setIsTimerRunning(false); return; }
    setIsTimerRunning(true);
  }, [isActive]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Initialize elapsed from actual_start_time
  useEffect(() => {
    if (feast?.actual_start_time) {
      const diff = Math.floor((Date.now() - new Date(feast.actual_start_time).getTime()) / 1000);
      setElapsedSeconds(Math.max(0, diff));
    }
  }, [feast?.actual_start_time]);

  // Audio chime
  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore audio errors */ }
  }, []);

  // Alert at duration thresholds
  useEffect(() => {
    if (!currentToast?.duration_minutes || !isActive) return;
    const durationSec = currentToast.duration_minutes * 60;
    const elapsed = elapsedSeconds; // relative — simplified
    const remaining = durationSec - (elapsed % durationSec); // approximate
    if (remaining <= 60 && !alertFired.has(`${currentToast.id}-60`)) {
      playChime();
      setAlertFired((prev) => new Set(prev).add(`${currentToast.id}-60`));
    }
  }, [elapsedSeconds, currentToast, isActive, alertFired, playChime]);

  // Mutations
  const updateFeastStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: Record<string, unknown> = { status };
      if (status === "active" && !feast?.actual_start_time)
        updates.actual_start_time = new Date().toISOString();
      if (status === "completed") updates.actual_end_time = new Date().toISOString();
      const { error } = await supabase.from("feasts").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feast", id] });
      sonnerToast.success("სტატუსი განახლდა");
    },
  });

  const completeToast = useMutation({
    mutationFn: async (toastId: string) => {
      const { error } = await supabase.from("feast_toasts")
        .update({ status: "completed", actual_time: new Date().toISOString() })
        .eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const skipToast = useMutation({
    mutationFn: async (toastId: string) => {
      const { error } = await supabase.from("feast_toasts")
        .update({ status: "skipped" }).eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const incrementAlaverdi = useMutation({
    mutationFn: async (guestId: string) => {
      const { error } = await supabase.rpc("increment_alaverdi", { p_guest_id: guestId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feast-guests", id] });
      sonnerToast.success("ალავერდი დაფიქსირდა!");
    },
  });

  const assignAlaverdi = useMutation({
    mutationFn: async ({ toastId, guestName }: { toastId: string; guestName: string }) => {
      const { error } = await supabase.from("feast_toasts")
        .update({ alaverdi_assigned_to: guestName }).eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  if (feastLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">იტვირთება...</div>
      </div>
    );
  }

  if (!feast) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">სუფრა ვერ მოიძებნა</p>
        <Button variant="outline" onClick={() => navigate("/feasts")}>უკან</Button>
      </div>
    );
  }

  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/feasts/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-heading-3 text-foreground truncate max-w-[200px]">{feast.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                {isActive ? "🔴 LIVE" : isPaused ? "⏸ პაუზა" : feast.status}
              </Badge>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        {isHost && (
          <div className="flex gap-1.5">
            {isPaused && (
              <Button size="sm" onClick={() => updateFeastStatus.mutate("active")}>
                <Play className="h-3.5 w-3.5 mr-1" />გაგრძელება
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="outline" onClick={() => updateFeastStatus.mutate("paused")}>
                <Pause className="h-3.5 w-3.5 mr-1" />პაუზა
              </Button>
            )}
            {isLive && (
              <Button size="sm" variant="outline" onClick={() => updateFeastStatus.mutate("completed")}>
                <Square className="h-3.5 w-3.5 mr-1" />დასრულება
              </Button>
            )}
            {feast.status === "draft" && (
              <Button size="sm" onClick={() => updateFeastStatus.mutate("active")}>
                <Play className="h-3.5 w-3.5 mr-1" />დაწყება
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{completedCount}/{totalCount} სადღეგრძელო</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <AnimatePresence mode="wait">
          {allCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-6xl">🎉</div>
              <h2 className="text-heading-1 text-foreground">გაუმარჯოს!</h2>
              <p className="text-body text-muted-foreground">ყველა სადღეგრძელო დასრულდა</p>
              <Button onClick={() => navigate(`/feasts/${id}`)}>
                უკან დაბრუნება
              </Button>
            </motion.div>
          ) : currentToast ? (
            <motion.div
              key={currentToast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg text-center space-y-6"
            >
              {/* Current toast number */}
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full wine-gradient flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elevated">
                  {currentToast.position}
                </div>
              </div>

              {/* Title */}
              <div>
                <Badge variant="outline" className="mb-2 text-xs">
                  {toastTypeLabel[currentToast.toast_type] || currentToast.toast_type}
                </Badge>
                <h2 className="text-display text-foreground">{currentToast.title_ka}</h2>
                {currentToast.description_ka && (
                  <p className="text-body text-muted-foreground mt-3 leading-relaxed">
                    {currentToast.description_ka}
                  </p>
                )}
              </div>

              {/* Alaverdi info */}
              {currentToast.alaverdi_assigned_to && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm">
                  <Hand className="h-4 w-4" />
                  ალავერდი: <strong>{currentToast.alaverdi_assigned_to}</strong>
                </div>
              )}

              {/* Duration */}
              {currentToast.duration_minutes && (
                <p className="text-caption text-muted-foreground">
                  ⏱ სავარაუდო: {currentToast.duration_minutes} წთ
                </p>
              )}

              {/* Actions */}
              {isHost && isActive && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    size="lg"
                    onClick={() => completeToast.mutate(currentToast.id)}
                    disabled={completeToast.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    დასრულდა
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => skipToast.mutate(currentToast.id)}
                    disabled={skipToast.isPending}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    გამოტოვება
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <Wine className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-body text-muted-foreground">სადღეგრძელოები არ არის დამატებული</p>
              <Button variant="outline" onClick={() => navigate(`/feasts/${id}`)}>
                გეგმის რედაქტირება
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming */}
        {upcomingToasts.length > 0 && !allCompleted && (
          <div className="w-full max-w-lg space-y-2">
            <p className="text-caption text-muted-foreground text-center">მომდევნო</p>
            {upcomingToasts.map((t) => (
              <Card key={t.id} className="opacity-60">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                    {t.position}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title_ka}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {toastTypeLabel[t.toast_type] || t.toast_type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alaverdi FAB */}
      {isLive && guests && guests.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevated wine-gradient border-0 text-primary-foreground z-50"
            >
              <Hand className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5" /> ალავერდი
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[50vh]">
              {guests.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ალავერდი: {g.alaverdi_count ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentToast && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          assignAlaverdi.mutate({ toastId: currentToast.id, guestName: g.name });
                          incrementAlaverdi.mutate(g.id);
                        }}
                        disabled={incrementAlaverdi.isPending}
                      >
                        <Hand className="h-3.5 w-3.5 mr-1" />
                        მიანიჭე
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
