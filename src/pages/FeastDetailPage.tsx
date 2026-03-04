import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import {
  ArrowLeft, Play, Pause, Square, Plus, Trash2, Users, Clock, Wine, Share2, Copy, Link, Sparkles, Loader2, Pencil,
  GripVertical,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-secondary text-secondary-foreground",
};

const toastStatusIcon: Record<string, string> = {
  pending: "⏳", active: "🔴", completed: "✅", skipped: "⏭️",
};

const guestRoleKeys = ["guest", "mejavare", "honored_guest", "family"];

// ── Sortable Toast Card ──
interface SortableToastCardProps {
  ft: any;
  index: number;
  isDraft: boolean;
  isHost: boolean;
  toastStatusIcon: Record<string, string>;
  onSelect: (ft: any) => void;
  onRemove: (id: string) => void;
  t: (key: string, fallback?: any) => string;
}

const SortableToastCard: React.FC<SortableToastCardProps> = ({
  ft, index, isDraft, isHost, toastStatusIcon, onSelect, onRemove, t,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ft.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Card
        className={`transition-shadow cursor-pointer hover:shadow-card-hover ${ft.status === "completed" ? "opacity-60" : ""} ${isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}`}
        onClick={() => onSelect(ft)}
      >
        <CardContent className="p-3 flex items-center gap-3">
          {isHost && isDraft && (
            <div
              className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-bold text-accent-foreground">{ft.position}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{ft.title_ka}</p>
              <span className="text-xs">{toastStatusIcon[ft.status || "pending"]}</span>
            </div>
            {ft.description_ka && <p className="text-xs text-muted-foreground truncate mt-0.5">{ft.description_ka}</p>}
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px]">{t(`live.toastType.${ft.toast_type}`, ft.toast_type)}</Badge>
              {ft.duration_minutes && <span className="text-[10px] text-muted-foreground">{ft.duration_minutes}m</span>}
              {ft.alaverdi_assigned_to && <Badge variant="secondary" className="text-[10px]">{t("feastDetail.alaverdi")}: {ft.alaverdi_assigned_to}</Badge>}
            </div>
          </div>
          {isHost && <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(ft.id); }}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ── Toast Detail Dialog (fetches custom_toast body) ──
const ToastDetailDialog: React.FC<{ selectedToast: any; onClose: () => void; t: (key: string, fallback?: any) => string }> = ({ selectedToast, onClose, t }) => {
  const { data: customToastBody } = useQuery({
    queryKey: ["custom-toast-body", selectedToast?.assigned_custom_toast_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_toasts").select("body_ka, body_en").eq("id", selectedToast!.assigned_custom_toast_id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedToast?.assigned_custom_toast_id,
  });

  const { data: assignedToastBody } = useQuery({
    queryKey: ["assigned-toast-body", selectedToast?.assigned_toast_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("toasts").select("body_ka, body_en").eq("id", selectedToast!.assigned_toast_id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedToast?.assigned_toast_id && !selectedToast?.assigned_custom_toast_id,
  });

  const bodyKa = customToastBody?.body_ka || assignedToastBody?.body_ka || null;
  const bodyEn = customToastBody?.body_en || assignedToastBody?.body_en || null;

  return (
    <Dialog open={!!selectedToast} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">{selectedToast?.position}</span>
            {selectedToast?.title_ka}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="text-xs mt-1">{String(t(`live.toastType.${selectedToast?.toast_type}`, selectedToast?.toast_type || ""))}</Badge>
            {selectedToast?.duration_minutes && <span className="text-xs text-muted-foreground ml-2">{selectedToast.duration_minutes}m</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {bodyKa && (
            <div className="p-3 rounded-lg bg-accent/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">🇬🇪 {t("feastDetail.fullToast", "სრული სადღეგრძელო")}</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{bodyKa}</p>
            </div>
          )}
          {bodyEn && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">🇬🇧 English</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{bodyEn}</p>
            </div>
          )}
          {!bodyKa && selectedToast?.description_ka && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">🇬🇪</p>
              <p className="text-sm text-foreground leading-relaxed">{selectedToast.description_ka}</p>
            </div>
          )}
          {!bodyEn && selectedToast?.description_en && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">🇬🇧</p>
              <p className="text-sm text-foreground leading-relaxed">{selectedToast.description_en}</p>
            </div>
          )}
          {selectedToast?.title_en && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("feastDetail.toastDetail")}</p>
              <p className="text-sm text-foreground">{selectedToast.title_en}</p>
            </div>
          )}
          {selectedToast?.alaverdi_assigned_to && (
            <Badge variant="secondary">{t("feastDetail.alaverdi")}: {selectedToast.alaverdi_assigned_to}</Badge>
          )}
          {selectedToast?.notes && (
            <p className="text-xs text-muted-foreground">{selectedToast.notes}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestRole, setNewGuestRole] = useState("guest");
  const [newToastTitle, setNewToastTitle] = useState("");
  const [newToastType] = useState("custom");
  const [selectedToast, setSelectedToast] = useState<any | null>(null);
  const [showAiConfirm, setShowAiConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  const updateFeast = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feasts").update({
        title: editTitle.trim(),
        notes: editNotes.trim() || null,
      }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feast", id] });
      sonnerToast.success(t("common.statusUpdated"));
      setEditMode(false);
    },
  });

  const deleteFeast = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("feasts").delete().eq("id", id!); if (error) throw error; },
    onSuccess: () => { sonnerToast.success(t("common.deleted")); navigate("/feasts"); },
  });

  const addGuest = useMutation({
    mutationFn: async () => {
      if (!newGuestName.trim()) return;
      const { error } = await supabase.from("feast_guests").insert({ feast_id: id!, name: newGuestName.trim(), role: newGuestRole, seat_position: (guests?.length || 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => { setNewGuestName(""); setNewGuestRole("guest"); queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }); },
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

  // ── Toast reordering (dnd-kit) ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const reorderToasts = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from("feast_toasts").update({ position: u.position }).eq("id", u.id);
        if (error) throw error;
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !feastToasts) return;

    const oldIndex = feastToasts.findIndex((ft) => ft.id === active.id);
    const newIndex = feastToasts.findIndex((ft) => ft.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(feastToasts, oldIndex, newIndex);
    const updates = reordered.map((ft, i) => ({ ...ft, position: i + 1 }));

    // Optimistic
    queryClient.setQueryData(["feast-toasts", id], updates);

    reorderToasts.mutate(updates.map((u) => ({ id: u.id, position: u.position })));
  }, [feastToasts, id, queryClient, reorderToasts]);

  const generatePlan = useMutation({
    mutationFn: async () => {
      if (!feast) throw new Error("No feast");
      const guestNames = guests?.map((g) => g.name) || [];
      const { data, error } = await supabase.functions.invoke("generate-feast-plan", {
        body: {
          feast_id: id,
          occasion_type: feast.occasion_type,
          formality_level: feast.formality_level,
          duration_minutes: feast.estimated_duration_minutes,
          guest_count: feast.guest_count,
          region: feast.region,
          guest_names: guestNames,
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
      if (feastToasts?.length) {
        await supabase.from("feast_toasts").delete().eq("feast_id", id!);
      }
      const rows = toasts.map((toast: any, i: number) => ({
        feast_id: id!,
        position: i + 1,
        toast_type: toast.toast_type || "custom",
        title_ka: toast.title_ka,
        title_en: toast.title_en || null,
        description_ka: toast.description_ka || null,
        description_en: toast.description_en || null,
        duration_minutes: toast.duration_minutes || 5,
        status: "pending",
        assigned_custom_toast_id: toast.assigned_custom_toast_id || null,
      }));
      const { error } = await supabase.from("feast_toasts").insert(rows);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] });
      sonnerToast.success(t("ai.created"));
    },
    onError: () => sonnerToast.error(t("ai.generateFailed")),
  });

  const handleAiGenerate = () => {
    if (feastToasts && feastToasts.length > 0) {
      setShowAiConfirm(true);
    } else {
      generatePlan.mutate();
    }
  };

  const formatDuration = (mins: number) => { const h = Math.floor(mins / 60); const m = mins % 60; return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`; };

  const isDraft = feast?.status === "draft";

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={feastToasts.map((ft) => ft.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {feastToasts.map((ft, i) => (
                    <SortableToastCard
                      key={ft.id}
                      ft={ft}
                      index={i}
                      isDraft={isDraft}
                      isHost={isHost}
                      toastStatusIcon={toastStatusIcon}
                      onSelect={setSelectedToast}
                      onRemove={(toastId) => removeToast.mutate(toastId)}
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <EmptyState icon={<Wine className="h-10 w-10" />} title={t("feastDetail.planEmpty")} description={t("feastDetail.planEmptyDesc")} />
          )}
          {isHost && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAiGenerate}
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
                          <Badge variant="outline" className="text-[10px]">{t(`feastDetail.guestRoles.${g.role || "guest"}`, g.role || "guest")}</Badge>
                          {(g.alaverdi_count ?? 0) > 0 && <span className="text-[10px] text-muted-foreground">{t("feastDetail.alaverdi")}: {g.alaverdi_count}</span>}
                        </div>
                        {g.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{g.notes}</p>}
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
              <CardContent className="p-3 space-y-2">
                <div className="flex gap-2">
                  <Input placeholder={t("feasts.guestNamePlaceholder")} value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGuest.mutate()} />
                  <Select value={newGuestRole} onValueChange={setNewGuestRole}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {guestRoleKeys.map((r) => (
                        <SelectItem key={r} value={r}>{t(`feastDetail.guestRoles.${r}`, r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => addGuest.mutate()}><Plus className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("feasts.feastName")}</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("feasts.notes")}</label>
                    <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateFeast.mutate()} disabled={updateFeast.isPending || !editTitle.trim()}>
                      {t("common.save")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>{t("common.cancel")}</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground text-xs">{t("feastDetail.occasionType")}</p><p className="font-medium text-foreground">{t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}</p></div>
                    <div><p className="text-muted-foreground text-xs">{t("feasts.formality")}</p><p className="font-medium text-foreground">{t(`feasts.formalityOptions.${feast.formality_level || "formal"}`)}</p></div>
                    <div><p className="text-muted-foreground text-xs">{t("feastDetail.guestCount")}</p><p className="font-medium text-foreground">{feast.guest_count || "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs">{t("feasts.duration")}</p><p className="font-medium text-foreground">{formatDuration(feast.estimated_duration_minutes)}</p></div>
                    {feast.region && <div><p className="text-muted-foreground text-xs">{t("profile.region")}</p><p className="font-medium text-foreground">{t(`profile.regions.${feast.region}`, feast.region)}</p></div>}
                  </div>
                  {feast.notes && <div><p className="text-muted-foreground text-xs mb-1">{t("feasts.notes")}</p><p className="text-sm text-foreground">{feast.notes}</p></div>}
                  {isHost && (
                    <Button size="sm" variant="outline" onClick={() => { setEditTitle(feast.title); setEditNotes(feast.notes || ""); setEditMode(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />{t("feastDetail.editFeast")}
                    </Button>
                  )}
                </>
              )}
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

      {/* Toast Detail Dialog */}
      <ToastDetailDialog
        selectedToast={selectedToast}
        onClose={() => setSelectedToast(null)}
        t={t}
      />

      {/* AI Plan Confirmation Dialog */}
      <AlertDialog open={showAiConfirm} onOpenChange={setShowAiConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("feastDetail.aiConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("feastDetail.aiConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowAiConfirm(false); generatePlan.mutate(); }}>
              <Sparkles className="h-4 w-4 mr-1.5" />{t("feastDetail.aiConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeastDetailPage;
