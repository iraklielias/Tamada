import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EmptyState from "@/components/EmptyState";
import {
  ArrowLeft, Play, Pause, Square, Plus, Trash2, Users, Clock, Wine, Share2, Copy, Link, Sparkles, Loader2,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-secondary text-secondary-foreground",
};

const toastStatusIcon: Record<string, string> = {
  pending: "⏳", active: "🔴", completed: "✅", skipped: "⏭️",
};

const FeastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newGuestName, setNewGuestName] = useState("");
  const [newToastTitle, setNewToastTitle] = useState("");
  const [newToastType] = useState("custom");

  const { data: feast, isLoading } = useQuery({
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
  });

  const generateShareCode = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("feasts").update({ share_code: code }).eq("id", id!);
      if (error) throw error;
      return code;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["feast", id] }); sonnerToast.success(t("common.codeGenerated")); },
  });

  const copyShareLink = () => {
    if (!feast?.share_code) return;
    navigator.clipboard.writeText(`${window.location.origin}/feasts/join/${feast.share_code}`);
    sonnerToast.success(t("common.linkCopied"));
  };

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: Record<string, unknown> = { status };
      if (status === "active") updates.actual_start_time = new Date().toISOString();
      if (status === "completed") updates.actual_end_time = new Date().toISOString();
      const { error } = await supabase.from("feasts").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["feast", id] }); sonnerToast.success(t("common.statusUpdated")); },
  });

  const deleteFeast = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("feasts").delete().eq("id", id!); if (error) throw error; },
    onSuccess: () => { sonnerToast.success(t("common.deleted")); navigate("/feasts"); },
  });

  const addGuest = useMutation({
    mutationFn: async () => {
      if (!newGuestName.trim()) return;
      const { error } = await supabase.from("feast_guests").insert({ feast_id: id!, name: newGuestName.trim(), role: "guest", seat_position: (guests?.length || 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => { setNewGuestName(""); queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }); },
  });

  const removeGuest = useMutation({
    mutationFn: async (guestId: string) => { const { error } = await supabase.from("feast_guests").delete().eq("id", guestId); if (error) throw error; },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }),
  });

  const addToast = useMutation({
    mutationFn: async () => {
      if (!newToastTitle.trim()) return;
      const { error } = await supabase.from("feast_toasts").insert({ feast_id: id!, position: (feastToasts?.length || 0) + 1, toast_type: newToastType, title_ka: newToastTitle.trim(), status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => { setNewToastTitle(""); queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }); },
  });

  const removeToast = useMutation({
    mutationFn: async (toastId: string) => { const { error } = await supabase.from("feast_toasts").delete().eq("id", toastId); if (error) throw error; },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const generatePlan = useMutation({
    mutationFn: async () => {
      if (!feast) throw new Error("No feast");
      const { data, error } = await supabase.functions.invoke("generate-feast-plan", {
        body: {
          occasion_type: feast.occasion_type,
          formality_level: feast.formality_level,
          duration_minutes: feast.estimated_duration_minutes,
          guest_count: feast.guest_count,
          region: feast.region,
          language: "ka",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.toasts as Array<{
        title_ka: string; title_en?: string; toast_type: string;
        duration_minutes?: number; description_ka?: string; description_en?: string;
      }>;
    },
    onSuccess: async (toasts) => {
      if (!toasts?.length) { sonnerToast.error(t("ai.generateFailed")); return; }
      // Delete existing toasts first
      if (feastToasts?.length) {
        await supabase.from("feast_toasts").delete().eq("feast_id", id!);
      }
      // Insert generated toasts
      const rows = toasts.map((toast, i) => ({
        feast_id: id!,
        position: i + 1,
        toast_type: toast.toast_type || "traditional",
        title_ka: toast.title_ka,
        title_en: toast.title_en || null,
        description_ka: toast.description_ka || null,
        description_en: toast.description_en || null,
        duration_minutes: toast.duration_minutes || 5,
        status: "pending",
      }));
      const { error } = await supabase.from("feast_toasts").insert(rows);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] });
      sonnerToast.success(t("ai.created"));
    },
    onError: () => sonnerToast.error(t("ai.generateFailed")),
  });

  const formatDuration = (mins: number) => { const h = Math.floor(mins / 60); const m = mins % 60; return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`; };

  if (isLoading) {
    return <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>)}</div>;
  }

  if (!feast) {
    return <div className="p-6 text-center"><p className="text-muted-foreground">{t("common.notFound")}</p><Button variant="outline" className="mt-4" onClick={() => navigate("/feasts")}>{t("common.back")}</Button></div>;
  }

  const isHost = feast.host_id === user?.id;
  const canStart = feast.status === "draft" || feast.status === "paused";
  const canPause = feast.status === "active";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/feasts")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-heading-2 text-foreground truncate">{feast.title}</h1>
              <Badge className={`text-[10px] ${statusColors[feast.status || "draft"]}`}>{t(`feasts.status.${feast.status || "draft"}`)}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}</span>
              {feast.guest_count && <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{feast.guest_count}</span>}
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{formatDuration(feast.estimated_duration_minutes)}</span>
            </div>
          </div>
        </div>
        {isHost && (
          <div className="flex gap-2 shrink-0">
            {(feast.status === "active" || feast.status === "paused") && <Button size="sm" onClick={() => navigate(`/feasts/${id}/live`)}><Play className="h-3.5 w-3.5 mr-1.5" />LIVE</Button>}
            {canStart && <Button size="sm" onClick={() => { updateStatus.mutate("active"); navigate(`/feasts/${id}/live`); }}><Play className="h-3.5 w-3.5 mr-1.5" />{feast.status === "paused" ? t("common.resume") : t("common.start")}</Button>}
            {canPause && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("paused")}><Pause className="h-3.5 w-3.5 mr-1.5" />{t("common.pause")}</Button>}
            {(feast.status === "active" || feast.status === "paused") && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("completed")}><Square className="h-3.5 w-3.5 mr-1.5" />{t("common.complete")}</Button>}
          </div>
        )}
      </div>

      <Tabs defaultValue="plan">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="plan">📋 {t("feastDetail.plan")}</TabsTrigger>
          <TabsTrigger value="guests">👥 {t("feastDetail.guestsTab")}</TabsTrigger>
          <TabsTrigger value="details">ℹ️ {t("feastDetail.detailsTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="mt-4 space-y-3">
          {feastToasts && feastToasts.length > 0 ? (
            <div className="space-y-2">
              {feastToasts.map((ft, i) => (
                <motion.div key={ft.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className={`transition-shadow ${ft.status === "completed" ? "opacity-60" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-bold text-accent-foreground">{ft.position}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{ft.title_ka}</p>
                          <span className="text-xs">{toastStatusIcon[ft.status || "pending"]}</span>
                        </div>
                        {ft.description_ka && <p className="text-xs text-muted-foreground truncate mt-0.5">{ft.description_ka}</p>}
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{ft.toast_type}</Badge>
                          {ft.duration_minutes && <span className="text-[10px] text-muted-foreground">{ft.duration_minutes}m</span>}
                          {ft.alaverdi_assigned_to && <Badge variant="secondary" className="text-[10px]">{t("feastDetail.alaverdi")}: {ft.alaverdi_assigned_to}</Badge>}
                        </div>
                      </div>
                      {isHost && <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeToast.mutate(ft.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Wine className="h-10 w-10" />} title={t("feastDetail.planEmpty")} description={t("feastDetail.planEmptyDesc")} />
          )}
          {isHost && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => generatePlan.mutate()}
                disabled={generatePlan.isPending}
              >
                {generatePlan.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("ai.generating")}</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />{t("feastDetail.aiGenerate", "AI გეგმა")}</>
                )}
              </Button>
            </div>
          )}
          {isHost && (
            <Card className="border-dashed">
              <CardContent className="p-3 flex gap-2">
                <Input placeholder={t("feastDetail.toastNamePlaceholder")} value={newToastTitle} onChange={(e) => setNewToastTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToast.mutate()} />
                <Button variant="outline" size="icon" onClick={() => addToast.mutate()}><Plus className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guests" className="mt-4 space-y-3">
          {guests && guests.length > 0 ? (
            <div className="space-y-2">
              {guests.map((g) => (
                <Card key={g.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-semibold text-accent-foreground">{g.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{g.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{g.role}</Badge>
                          {(g.alaverdi_count ?? 0) > 0 && <span className="text-[10px] text-muted-foreground">{t("feastDetail.alaverdi")}: {g.alaverdi_count}</span>}
                        </div>
                      </div>
                    </div>
                    {isHost && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGuest.mutate(g.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Users className="h-10 w-10" />} title={t("feastDetail.noGuests")} description={t("feastDetail.noGuestsDesc")} />
          )}
          {isHost && (
            <Card className="border-dashed">
              <CardContent className="p-3 flex gap-2">
                <Input placeholder={t("feasts.guestNamePlaceholder")} value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGuest.mutate()} />
                <Button variant="outline" size="icon" onClick={() => addGuest.mutate()}><Plus className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">{t("feastDetail.occasionType")}</p><p className="font-medium text-foreground">{t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}</p></div>
                <div><p className="text-muted-foreground text-xs">{t("feasts.formality")}</p><p className="font-medium text-foreground">{t(`feasts.formalityOptions.${feast.formality_level || "formal"}`)}</p></div>
                <div><p className="text-muted-foreground text-xs">{t("feastDetail.guestCount")}</p><p className="font-medium text-foreground">{feast.guest_count || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">{t("feasts.duration")}</p><p className="font-medium text-foreground">{formatDuration(feast.estimated_duration_minutes)}</p></div>
                {feast.region && <div><p className="text-muted-foreground text-xs">{t("profile.region")}</p><p className="font-medium text-foreground">{t(`profile.regions.${feast.region}`, feast.region)}</p></div>}
              </div>
              {feast.notes && <div><p className="text-muted-foreground text-xs mb-1">{t("feasts.notes")}</p><p className="text-sm text-foreground">{feast.notes}</p></div>}
            </CardContent>
          </Card>

          {isHost && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-muted-foreground text-xs">{t("feastDetail.shareCotamada")}</p>
                {feast.share_code ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-mono font-semibold text-foreground">{feast.share_code}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyShareLink}><Copy className="h-3.5 w-3.5 mr-1" /> {t("common.copy")}</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => generateShareCode.mutate()} disabled={generateShareCode.isPending}>
                    <Share2 className="h-4 w-4 mr-2" /> {t("common.generateCode")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {isHost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full"><Trash2 className="h-4 w-4 mr-2" />{t("feastDetail.deleteFeast")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("feastDetail.deleteConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteFeast.mutate()}>{t("common.delete")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeastDetailPage;
