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
  GripVertical, RefreshCw, ArrowDown, Heart, Check, History, RotateCcw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const toastTypeKeys = [
  "god", "homeland", "parents", "deceased", "host", "guest_of_honor",
  "love", "children", "friendship", "future", "mother", "father",
  "women", "brotherhood", "peace", "georgia", "custom",
];

// ── Sortable Toast Card ──
interface SortableToastCardProps {
  ft: any;
  index: number;
  isDraft: boolean;
  isHost: boolean;
  toastStatusIcon: Record<string, string>;
  onSelect: (ft: any) => void;
  onRemove: (id: string) => void;
  onInsertAfter: (position: number) => void;
  t: (key: string, fallback?: any) => string;
}

const SortableToastCard: React.FC<SortableToastCardProps> = ({
  ft, index, isDraft, isHost, toastStatusIcon, onSelect, onRemove, onInsertAfter, t,
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
              <p className="text-sm font-semibold text-foreground truncate">{(typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en') ? (ft.title_en || ft.title_ka) : ft.title_ka}</p>
              <span className="text-xs">{toastStatusIcon[ft.status || "pending"]}</span>
            </div>
            {(ft.description_ka || ft.description_en) && <p className="text-xs text-muted-foreground truncate mt-0.5">{(typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en') ? (ft.description_en || ft.description_ka) : ft.description_ka}</p>}
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px]">{t(`live.toastType.${ft.toast_type}`, ft.toast_type)}</Badge>
              {ft.duration_minutes && <span className="text-[10px] text-muted-foreground">{ft.duration_minutes}m</span>}
              {ft.alaverdi_assigned_to && <Badge variant="secondary" className="text-[10px]">{t("feastDetail.alaverdi")}: {ft.alaverdi_assigned_to}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {isHost && isDraft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title={t("feastDetail.insertAfter", "ჩასმა ამის შემდეგ")}
                onClick={(e) => { e.stopPropagation(); onInsertAfter(ft.position); }}
              >
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            {isHost && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onRemove(ft.id); }}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ── Toast Detail Dialog ──
interface ToastDetailDialogProps {
  selectedToast: any;
  onClose: () => void;
  t: (key: string, fallback?: any) => string;
  isHost: boolean;
  isDraft: boolean;
  feastId: string | undefined;
  feast: any;
  onToastUpdated: () => void;
}

const ToastDetailDialog: React.FC<ToastDetailDialogProps> = ({
  selectedToast, onClose, t, isHost, isDraft, feastId, feast, onToastUpdated,
}) => {
  const [retryComment, setRetryComment] = useState("");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  // Fetch version history
  const { data: versions } = useQuery({
    queryKey: ["toast-versions", selectedToast?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toast_versions")
        .select("*")
        .eq("feast_toast_id", selectedToast!.id)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedToast?.id,
  });

  // Save current body as a version snapshot before regen
  const saveVersionSnapshot = async () => {
    const currentBodyKa = customToastBody?.body_ka || assignedToastBody?.body_ka;
    if (!currentBodyKa || !selectedToast?.id) return;

    const currentBodyEn = customToastBody?.body_en || assignedToastBody?.body_en;
    const nextVersion = (versions?.length || 0) + 1;

    await supabase.from("toast_versions").insert({
      feast_toast_id: selectedToast.id,
      version_number: nextVersion,
      body_ka: currentBodyKa,
      body_en: currentBodyEn || null,
      source_type: "ai",
      user_instructions: retryComment.trim() || null,
      style_overrides: (() => {
        const so: Record<string, string> = {};
        if (selectedTone) so.tone = selectedTone;
        if (selectedLength) so.length = selectedLength;
        if (selectedStyle) so.style = selectedStyle;
        return Object.keys(so).length > 0 ? so : null;
      })(),
    });
  };

  // Generate body for a toast slot (single regen) with customization
  const regenSingleToast = useMutation({
    mutationFn: async () => {
      if (!selectedToast || !feast) throw new Error("No toast/feast");

      // Save current version before regenerating
      await saveVersionSnapshot();

      const allToasts = queryClient.getQueryData<any[]>(["feast-toasts", feastId]) || [];
      const existingToastTypes = allToasts
        .filter((ft: any) => ft.id !== selectedToast.id)
        .map((ft: any) => ft.toast_type);
      const guestList = queryClient.getQueryData<any[]>(["feast-guests", feastId]) || [];
      const guestNames = guestList.map((g: any) => g.name);

      const styleOverrides: Record<string, string> = {};
      if (selectedTone) styleOverrides.tone = selectedTone;
      if (selectedLength) styleOverrides.length = selectedLength;
      if (selectedStyle) styleOverrides.style = selectedStyle;

      const { data, error } = await supabase.functions.invoke("generate-feast-plan", {
        body: {
          feast_id: feastId,
          occasion_type: feast.occasion_type,
          formality_level: feast.formality_level,
          duration_minutes: feast.estimated_duration_minutes,
          guest_count: feast.guest_count,
          region: feast.region,
          guest_names: guestNames,
          feast_title: feast.title,
          feast_notes: feast.notes,
          existing_toast_types: existingToastTypes,
          single_toast_type: selectedToast.toast_type,
          single_toast_title: selectedToast.title_ka,
          user_instructions: retryComment.trim() || undefined,
          style_overrides: Object.keys(styleOverrides).length > 0 ? styleOverrides : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const toasts = data.toasts;
      if (!toasts?.length) throw new Error("No toast generated");
      const generated = toasts[0];

      if (generated.assigned_custom_toast_id) {
        const { error: updateErr } = await supabase.from("feast_toasts")
          .update({ assigned_custom_toast_id: generated.assigned_custom_toast_id, assigned_toast_id: null })
          .eq("id", selectedToast.id);
        if (updateErr) throw updateErr;
      }
      return generated;
    },
    onSuccess: () => {
      sonnerToast.success(t("feastDetail.toastRegenerated", "სადღეგრძელო განახლდა"));
      setRetryComment("");
      onToastUpdated();
      queryClient.invalidateQueries({ queryKey: ["custom-toast-body"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-toast-body"] });
      queryClient.invalidateQueries({ queryKey: ["toast-versions"] });
    },
    onError: () => sonnerToast.error(t("ai.generateFailed")),
  });

  // Restore a previous version
  const restoreVersion = useMutation({
    mutationFn: async (version: { body_ka: string; body_en: string | null; version_number: number }) => {
      if (!selectedToast || !user) throw new Error("Missing data");

      // Save current as a new version snapshot before restoring
      await saveVersionSnapshot();

      // Create a new custom_toast with the restored content
      const { data: newCustomToast, error: insertErr } = await supabase.from("custom_toasts").insert({
        user_id: user.id,
        body_ka: version.body_ka,
        body_en: version.body_en,
        title_ka: selectedToast.title_ka,
        title_en: selectedToast.title_en,
        occasion_type: feast?.occasion_type || "supra",
        is_ai_generated: true,
      }).select("id").single();
      if (insertErr) throw insertErr;

      // Update the feast_toast to point to the restored version
      const { error: updateErr } = await supabase.from("feast_toasts")
        .update({ assigned_custom_toast_id: newCustomToast.id, assigned_toast_id: null })
        .eq("id", selectedToast.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      sonnerToast.success(t("feastDetail.versionRestored", "ვერსია აღდგენილია"));
      setShowVersions(false);
      onToastUpdated();
      queryClient.invalidateQueries({ queryKey: ["custom-toast-body"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-toast-body"] });
      queryClient.invalidateQueries({ queryKey: ["toast-versions"] });
    },
    onError: () => sonnerToast.error(t("common.error")),
  });

  // Save to favorites
  const saveToFavorites = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const toastId = selectedToast?.assigned_toast_id || null;
      const customToastId = selectedToast?.assigned_custom_toast_id || null;
      if (!toastId && !customToastId) throw new Error("No toast to save");
      const { error } = await supabase.from("user_favorites").insert({
        user_id: user.id,
        toast_id: toastId,
        custom_toast_id: customToastId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      sonnerToast.success(t("ai.savedToFavs"));
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => sonnerToast.error(t("ai.saveFailed")),
  });

  const bodyKa = customToastBody?.body_ka || assignedToastBody?.body_ka || null;
  const bodyEn = customToastBody?.body_en || assignedToastBody?.body_en || null;
  const hasBody = !!bodyKa;

  const toneOptions = ["traditional", "humorous", "emotional", "philosophical"];
  const lengthOptions = ["short", "medium", "long"];
  const styleOptions = ["poetic", "storytelling", "proverbial", "direct"];

  const hasAssignment = !!selectedToast?.assigned_toast_id || !!selectedToast?.assigned_custom_toast_id;

  return (
    <Dialog open={!!selectedToast} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">{selectedToast?.position}</span>
            {(typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en') ? (selectedToast?.title_en || selectedToast?.title_ka) : selectedToast?.title_ka}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="text-xs mt-1">{String(t(`live.toastType.${selectedToast?.toast_type}`, selectedToast?.toast_type || ""))}</Badge>
            {selectedToast?.duration_minutes && <span className="text-xs text-muted-foreground ml-2">{selectedToast.duration_minutes}m</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {(() => {
            const isEnLang = typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en';
            const primaryBody = isEnLang ? (bodyEn || bodyKa) : bodyKa;
            const secondaryBody = isEnLang ? bodyKa : bodyEn;
            const primaryLabel = isEnLang ? "🇬🇧 English" : `🇬🇪 ${t("feastDetail.fullToast", "სრული სადღეგრძელო")}`;
            const secondaryLabel = isEnLang ? `🇬🇪 ქართულად` : "🇬🇧 English";
            return (
              <>
                {primaryBody && (
                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium">{primaryLabel}</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{primaryBody}</p>
                  </div>
                )}
                {secondaryBody && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium">{secondaryLabel}</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{secondaryBody}</p>
                  </div>
                )}
              </>
            );
          })()}

          {/* Prominent Generate Body CTA when no body exists */}
          {!hasBody && isHost && isDraft && (
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("feastDetail.noBodyYet", "ტექსტი ჯერ არ არის შექმნილი")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("feastDetail.generateBodyDesc", "AI შექმნის სრულ სადღეგრძელოს ტექსტს ამ სლოტისთვის")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!bodyKa && !hasBody && selectedToast?.description_ka && (
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

          {/* ── Customize & Retry Section ── */}
          {isHost && isDraft && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("feastDetail.customizeRetry", "Customize & Retry")}</p>

              {/* User instructions textarea */}
              <Textarea
                placeholder={t("feastDetail.retryComment", "მითითებები გენერაციისთვის...")}
                value={retryComment}
                onChange={(e) => setRetryComment(e.target.value)}
                className="min-h-[60px] text-sm"
                rows={2}
              />

              {/* Tone chips */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">{t("feastDetail.toneLabel", "ტონი")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {toneOptions.map((tone) => (
                    <Badge
                      key={tone}
                      variant={selectedTone === tone ? "default" : "outline"}
                      className="cursor-pointer transition-colors text-xs"
                      onClick={() => setSelectedTone(selectedTone === tone ? null : tone)}
                    >
                      {t(`ai.tones.${tone}`, tone)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Length chips */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">{t("feastDetail.lengthLabel", "სიგრძე")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {lengthOptions.map((len) => (
                    <Badge
                      key={len}
                      variant={selectedLength === len ? "default" : "outline"}
                      className="cursor-pointer transition-colors text-xs"
                      onClick={() => setSelectedLength(selectedLength === len ? null : len)}
                    >
                      {t(`feastDetail.lengths.${len}`, len)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Style chips */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">{t("feastDetail.styleLabel", "სტილი")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {styleOptions.map((style) => (
                    <Badge
                      key={style}
                      variant={selectedStyle === style ? "default" : "outline"}
                      className="cursor-pointer transition-colors text-xs"
                      onClick={() => setSelectedStyle(selectedStyle === style ? null : style)}
                    >
                      {t(`feastDetail.styles.${style}`, style)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="wine"
                  size="sm"
                  className="flex-1"
                  onClick={() => regenSingleToast.mutate()}
                  disabled={regenSingleToast.isPending}
                >
                  {regenSingleToast.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {hasBody ? t("feastDetail.regenerateToast", "ხელახლა გენერაცია") : t("feastDetail.generateBody", "ტექსტის გენერაცია")}
                </Button>
                {hasAssignment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveToFavorites.mutate()}
                    disabled={saveToFavorites.isPending}
                  >
                    <Heart className="h-3.5 w-3.5 mr-1.5" />
                    {t("feastDetail.saveToFavorites", "ფავორიტებში")}
                  </Button>
                )}
              </div>

              {/* Version History toggle + panel */}
              {versions && versions.length > 0 && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-muted-foreground"
                    onClick={() => setShowVersions(!showVersions)}
                  >
                    <History className="h-3.5 w-3.5 mr-1.5" />
                    {t("feastDetail.versionHistory", "ვერსიების ისტორია")} ({versions.length})
                  </Button>

                  {showVersions && (
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2 pr-2">
                        {versions.map((v: any) => {
                          const isEnLang = typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en';
                          const vBody = isEnLang ? (v.body_en || v.body_ka) : v.body_ka;
                          return (
                            <Card key={v.id} className="border-dashed">
                              <CardContent className="p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[10px]">v{v.version_number}</Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(v.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => restoreVersion.mutate(v)}
                                    disabled={restoreVersion.isPending}
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    {t("common.restore")}
                                  </Button>
                                </div>
                                <p className="text-xs text-foreground leading-relaxed line-clamp-3">{vBody}</p>
                                {v.user_instructions && (
                                  <p className="text-[10px] text-muted-foreground italic">💬 {v.user_instructions}</p>
                                )}
                                {v.style_overrides && (
                                  <div className="flex gap-1 flex-wrap">
                                    {Object.entries(v.style_overrides as Record<string, string>).map(([k, val]) => (
                                      <Badge key={k} variant="secondary" className="text-[9px] px-1.5 py-0">{val}</Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Guest Card with inline editable notes ──
const GuestCard: React.FC<{
  guest: any;
  isHost: boolean;
  feastId: string;
  t: (key: string, fallback?: any) => string;
  onRemove: (id: string) => void;
  onUpdated: () => void;
}> = ({ guest, isHost, feastId, t, onRemove, onUpdated }) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(guest.notes || "");

  const updateNotes = useMutation({
    mutationFn: async (notes: string) => {
      const trimmed = notes.trim().substring(0, 500);
      const { error } = await supabase.from("feast_guests").update({ notes: trimmed || null }).eq("id", guest.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingNotes(false);
      onUpdated();
    },
  });

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-semibold text-accent-foreground">{guest.name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{guest.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px]">{t(`feastDetail.guestRoles.${guest.role || "guest"}`, guest.role || "guest")}</Badge>
                {(guest.alaverdi_count ?? 0) > 0 && <span className="text-[10px] text-muted-foreground">{t("feastDetail.alaverdi")}: {guest.alaverdi_count}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isHost && !editingNotes && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setNotesValue(guest.notes || ""); setEditingNotes(true); }}>
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            {isHost && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(guest.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>}
          </div>
        </div>
        {editingNotes ? (
          <div className="mt-2 flex gap-1.5">
            <Input
              className="text-xs h-8"
              placeholder={t("feastDetail.guestNotesPlaceholder", "შენიშვნები (დიეტა, სასმელი...)")}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateNotes.mutate(notesValue); if (e.key === "Escape") setEditingNotes(false); }}
              maxLength={500}
              autoFocus
            />
            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => updateNotes.mutate(notesValue)} disabled={updateNotes.isPending}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : guest.notes ? (
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-11 cursor-pointer hover:text-foreground transition-colors" onClick={() => isHost && (setNotesValue(guest.notes || ""), setEditingNotes(true))}>
            📝 {guest.notes}
          </p>
        ) : isHost ? (
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 ml-11 cursor-pointer hover:text-muted-foreground transition-colors" onClick={() => { setNotesValue(""); setEditingNotes(true); }}>
            + {t("feastDetail.addNotes", "შენიშვნის დამატება")}
          </p>
        ) : null}
      </CardContent>
    </Card>
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
  const [newToastType, setNewToastType] = useState("custom");
  const [selectedToast, setSelectedToast] = useState<any | null>(null);
  const [showAiConfirm, setShowAiConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [insertAfterPosition, setInsertAfterPosition] = useState<number | null>(null);

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

  // Add toast — supports inserting at a specific position
  const addToast = useMutation({
    mutationFn: async () => {
      if (!newToastTitle.trim()) return;
      const targetPosition = insertAfterPosition !== null
        ? insertAfterPosition + 1
        : (feastToasts?.length || 0) + 1;

      // If inserting in the middle, shift subsequent toasts
      if (insertAfterPosition !== null && feastToasts) {
        const toShift = feastToasts.filter((ft) => ft.position >= targetPosition);
        for (const ft of toShift) {
          await supabase.from("feast_toasts").update({ position: ft.position + 1 }).eq("id", ft.id);
        }
      }

      const { error } = await supabase.from("feast_toasts").insert({
        feast_id: id!,
        position: targetPosition,
        toast_type: newToastType,
        title_ka: newToastTitle.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewToastTitle("");
      setNewToastType("custom");
      setInsertAfterPosition(null);
      queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] });
    },
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
          feast_title: feast.title,
          feast_notes: feast.notes,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.toasts as Array<{
        title_ka: string; title_en?: string; toast_type: string;
        duration_minutes?: number; description_ka?: string; description_en?: string;
        assigned_custom_toast_id?: string;
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

  const handleInsertAfter = (position: number) => {
    setInsertAfterPosition(position);
    // Scroll to the add toast form
    setTimeout(() => {
      document.getElementById("add-toast-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
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
      {/* Hero header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="rounded-xl bg-surface-1 hover:bg-surface-2" onClick={() => navigate("/feasts")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-heading-2 font-display text-foreground truncate">{feast.title}</h1>
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
            {(feast.status === "active" || feast.status === "paused") && <Button size="sm" className="shadow-wine" onClick={() => navigate(`/feasts/${id}/live`)}><Play className="h-3.5 w-3.5 mr-1.5" />LIVE</Button>}
            {canStart && <Button size="sm" variant="wine" className="shadow-wine" onClick={() => { updateStatus.mutate("active"); navigate(`/feasts/${id}/live`); }}><Play className="h-3.5 w-3.5 mr-1.5" />{feast.status === "paused" ? t("common.resume") : t("common.start")}</Button>}
            {canPause && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("paused")}><Pause className="h-3.5 w-3.5 mr-1.5" />{t("common.pause")}</Button>}
            {(feast.status === "active" || feast.status === "paused") && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("completed")}><Square className="h-3.5 w-3.5 mr-1.5" />{t("common.complete")}</Button>}
          </div>
        )}
      </div>

      {/* Tabs with improved styling */}
      <Tabs defaultValue="plan">
        <TabsList className="w-full grid grid-cols-3 bg-surface-1 p-1 rounded-xl">
          <TabsTrigger value="plan" className="rounded-lg data-[state=active]:shadow-card data-[state=active]:bg-card">📋 {t("feastDetail.plan")}</TabsTrigger>
          <TabsTrigger value="guests" className="rounded-lg data-[state=active]:shadow-card data-[state=active]:bg-card">👥 {t("feastDetail.guestsTab")}</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:shadow-card data-[state=active]:bg-card">ℹ️ {t("feastDetail.detailsTab")}</TabsTrigger>
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
                      onInsertAfter={handleInsertAfter}
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : isHost ? (
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-heading-3 text-foreground mb-1">{t("feastDetail.aiPlanTitle", "შექმენი სუფრის გეგმა AI-ით")}</h3>
                  <p className="text-body-sm text-muted-foreground max-w-xs">{t("feastDetail.aiPlanDesc", "AI შექმნის სრულ სადღეგრძელოების გეგმას შენი სუფრის პარამეტრებზე დაყრდნობით")}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}</Badge>
                  <Badge variant="outline">{t(`feasts.formality.${feast.formality_level || "formal"}`, feast.formality_level || "formal")}</Badge>
                  {feast.guest_count && <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{feast.guest_count}</Badge>}
                  <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{formatDuration(feast.estimated_duration_minutes)}</Badge>
                  {feast.region && <Badge variant="outline">{t(`profile.regions.${feast.region}`, feast.region)}</Badge>}
                </div>
                <Button
                  variant="wine"
                  size="lg"
                  onClick={handleAiGenerate}
                  disabled={generatePlan.isPending}
                  className="mt-2"
                >
                  {generatePlan.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("ai.generating")}</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />{t("feastDetail.generatePlan", "გეგმის გენერაცია")}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <EmptyState icon={<Wine className="h-10 w-10" />} title={t("feastDetail.planEmpty")} description={t("feastDetail.planEmptyDesc")} />
          )}
          {isHost && feastToasts && feastToasts.length > 0 && (
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
                  <><Sparkles className="h-4 w-4 mr-2" />{t("feastDetail.aiRegenerate", "ხელახლა გენერაცია")}</>
                )}
              </Button>
            </div>
          )}
          {isHost && (
            <Card id="add-toast-form" className="border-dashed">
              <CardContent className="p-3 space-y-2">
                {insertAfterPosition !== null && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <ArrowDown className="h-3 w-3" />
                    <span>{t("feastDetail.insertingAfter", "ჩასმა პოზიციის შემდეგ")}: #{insertAfterPosition}</span>
                    <Button variant="ghost" size="sm" className="h-5 px-1 text-xs" onClick={() => setInsertAfterPosition(null)}>✕</Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder={t("feastDetail.toastNamePlaceholder")}
                    value={newToastTitle}
                    onChange={(e) => setNewToastTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToast.mutate()}
                    className="flex-1"
                  />
                  <Select value={newToastType} onValueChange={setNewToastType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toastTypeKeys.map((tt) => (
                        <SelectItem key={tt} value={tt}>{t(`live.toastType.${tt}`, tt)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => addToast.mutate()}><Plus className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guests" className="mt-4 space-y-3">
          {guests && guests.length > 0 ? (
            <div className="space-y-2">
              {guests.map((g) => (
                <GuestCard key={g.id} guest={g} isHost={isHost} feastId={id!} t={t} onRemove={(guestId) => removeGuest.mutate(guestId)} onUpdated={() => queryClient.invalidateQueries({ queryKey: ["feast-guests", id] })} />
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
        isHost={isHost}
        isDraft={isDraft}
        feastId={id}
        feast={feast}
        onToastUpdated={() => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] })}
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
