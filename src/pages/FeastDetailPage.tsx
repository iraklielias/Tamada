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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft, Play, Pause, Square, Plus, Trash2, Users, Clock, Wine, Share2, Copy, Link, Sparkles, Loader2, Pencil,
  GripVertical, RefreshCw, Heart, Check, History, RotateCcw, ChevronDown, ChevronUp, MoreHorizontal,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  t: (key: string, fallback?: any) => string;
}

const toastBorderColor: Record<string, string> = {
  completed: "border-l-green-500",
  active: "border-l-amber-500",
  skipped: "border-l-muted-foreground",
  pending: "border-l-border",
};

const hasBodyContent = (ft: any) => !!(ft.assigned_toast_id || ft.assigned_custom_toast_id);

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
  const hasBody = hasBodyContent(ft);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Card
        className={`card-interactive cursor-pointer border-l-[3px] ${hasBody ? "border-l-green-500" : (toastBorderColor[ft.status || "pending"] || "border-l-border")} ${ft.status === "completed" ? "opacity-60" : ""} ${isDragging ? "shadow-elevated ring-2 ring-primary/30" : ""}`}
        onClick={() => onSelect(ft)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {isHost && isDraft && (
              <div
                className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <div className="h-8 w-8 rounded-lg bg-wine-light flex items-center justify-center shrink-0 text-sm font-bold text-primary">{ft.position}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{(typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en') ? (ft.title_en || ft.title_ka) : ft.title_ka}</p>
                <span className="text-xs leading-none">{toastStatusIcon[ft.status || "pending"]}</span>
              </div>
            </div>
            {isHost && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(ft.id); }}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
          {/* Second tier: metadata */}
          <div className="flex items-center gap-2 mt-1.5 ml-[calc(2rem+0.75rem+1rem)]">
            <Badge variant="outline" className="text-[10px]">{t(`live.toastType.${ft.toast_type}`, ft.toast_type)}</Badge>
            {ft.duration_minutes && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ft.duration_minutes}m</span>}
            {ft.alaverdi_assigned_to && <Badge variant="secondary" className="text-[10px]">{t("feastDetail.alaverdi")}: {ft.alaverdi_assigned_to}</Badge>}
            {!hasBody && <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />{t("feastDetail.needsBody", "needs text")}</span>}
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
  onUpdateSelectedToast?: (updates: Partial<any>) => void;
}

const ToastDetailDialog: React.FC<ToastDetailDialogProps> = ({
  selectedToast, onClose, t, isHost, isDraft, feastId, feast, onToastUpdated, onUpdateSelectedToast,
}) => {
  const [retryComment, setRetryComment] = useState("");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
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
  const isEnLang = typeof window !== 'undefined' && localStorage.getItem('tamada-lang') === 'en';
  const canEdit = isHost && feast?.status !== "completed";

  return (
    <Dialog open={!!selectedToast} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* ── Hero header with wine accent ── */}
        <div className="relative">
          <div className="h-1 wine-gradient" />
          <div className="px-5 pt-4 pb-3">
            <DialogHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-wine-light flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{selectedToast?.position}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-semibold text-foreground leading-snug">
                    {isEnLang ? (selectedToast?.title_en || selectedToast?.title_ka) : selectedToast?.title_ka}
                  </DialogTitle>
                  <div className="mt-1 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{String(t(`live.toastType.${selectedToast?.toast_type}`, selectedToast?.toast_type || ""))}</Badge>
                    {selectedToast?.duration_minutes && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{selectedToast.duration_minutes}m</span>
                    )}
                    {selectedToast?.alaverdi_assigned_to && (
                      <Badge variant="secondary" className="text-[10px]">{t("feastDetail.alaverdi")}: {selectedToast.alaverdi_assigned_to}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* ── Action toolbar ── */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
              {canEdit && (
                <Button
                  variant="wine"
                  size="sm"
                  className="h-8 text-xs gap-1.5 shadow-wine"
                  onClick={() => regenSingleToast.mutate()}
                  disabled={regenSingleToast.isPending}
                >
                  {regenSingleToast.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {hasBody ? t("feastDetail.regenerateToast") : t("feastDetail.generateBody")}
                </Button>
              )}
              {hasAssignment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => saveToFavorites.mutate()}
                  disabled={saveToFavorites.isPending}
                >
                  <Heart className="h-3.5 w-3.5" />
                  {t("feastDetail.saveToFavorites")}
                </Button>
              )}
              {hasBody && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 ml-auto"
                  onClick={() => {
                    const body = isEnLang ? (bodyEn || bodyKa) : bodyKa;
                    if (body) { navigator.clipboard.writeText(body); sonnerToast.success(t("common.copied")); }
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t("common.copy")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <ScrollArea className="max-h-[calc(90vh-180px)] px-5 pb-5">
          <div className="space-y-4">
            {/* ── Toast body content ── */}
            {hasBody ? (
              <div className="space-y-3">
                {(() => {
                  const primaryBody = isEnLang ? (bodyEn || bodyKa) : bodyKa;
                  const secondaryBody = isEnLang ? bodyKa : bodyEn;
                  const primaryFlag = isEnLang ? "🇬🇧" : "🇬🇪";
                  const secondaryFlag = isEnLang ? "🇬🇪" : "🇬🇧";
                  const primaryLabel = isEnLang ? "English" : t("feastDetail.fullToast");
                  const secondaryLabel = isEnLang ? t("feastDetail.inGeorgian") : "English";
                  return (
                    <>
                      {primaryBody && (
                        <div className="rounded-xl bg-card border border-border overflow-hidden">
                          <div className="px-3.5 py-2 bg-surface-1 border-b border-border/50 flex items-center gap-2">
                            <span className="text-sm">{primaryFlag}</span>
                            <span className="text-xs font-medium text-foreground">{primaryLabel}</span>
                          </div>
                          <div className="px-3.5 py-3">
                            <p className="text-sm text-foreground leading-[1.7] whitespace-pre-line">{primaryBody}</p>
                          </div>
                        </div>
                      )}
                      {secondaryBody && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                              <div className="flex-1 h-px bg-border" />
                              <span className="flex items-center gap-1.5 shrink-0">
                                {secondaryFlag} {secondaryLabel}
                                <ChevronDown className="h-3 w-3" />
                              </span>
                              <div className="flex-1 h-px bg-border" />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="rounded-xl bg-muted/30 border border-border/50 px-3.5 py-3 mt-1">
                              <p className="text-sm text-foreground/80 leading-[1.7] whitespace-pre-line">{secondaryBody}</p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                {/* No body yet — show generate CTA or description fallback */}
                {canEdit ? (
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("feastDetail.noBodyYet")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("feastDetail.generateBodyDesc")}</p>
                    </div>
                    <Button
                      variant="wine"
                      size="sm"
                      className="shadow-wine"
                      onClick={() => regenSingleToast.mutate()}
                      disabled={regenSingleToast.isPending}
                    >
                      {regenSingleToast.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                      {t("feastDetail.generateBody")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {selectedToast?.description_ka && (
                      <div className="rounded-xl bg-card border border-border px-3.5 py-3">
                        <p className="text-sm text-foreground leading-relaxed">{isEnLang ? (selectedToast.description_en || selectedToast.description_ka) : selectedToast.description_ka}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Toast details metadata ── */}
            {(selectedToast?.title_en || selectedToast?.notes) && (
              <div className="rounded-xl bg-surface-1 border border-border/50 p-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("feastDetail.toastDetail")}</p>
                {selectedToast?.title_en && !isEnLang && (
                  <p className="text-xs text-foreground">{selectedToast.title_en}</p>
                )}
                {selectedToast?.title_ka && isEnLang && selectedToast?.title_en && (
                  <p className="text-xs text-foreground">{selectedToast.title_ka}</p>
                )}
                {selectedToast?.notes && (
                  <p className="text-xs text-muted-foreground">{selectedToast.notes}</p>
                )}
              </div>
            )}

            {/* ── Customize & Retry (collapsible) ── */}
            {canEdit && (
              <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-2 rounded-xl bg-surface-1 hover:bg-surface-2 transition-colors px-3.5 py-2.5 text-left">
                    <div className="h-7 w-7 rounded-lg bg-wine-light flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{t("feastDetail.customizeRetry")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("feastDetail.retryComment")}</p>
                    </div>
                    {customizeOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 pt-3 pl-1">
                    <Textarea
                      placeholder={t("feastDetail.retryComment")}
                      value={retryComment}
                      onChange={(e) => setRetryComment(e.target.value)}
                      className="min-h-[60px] text-sm bg-surface-1 border-border"
                      rows={2}
                    />
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{t("feastDetail.toneLabel")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {toneOptions.map((tone) => (
                            <Badge key={tone} variant={selectedTone === tone ? "default" : "outline"} className="cursor-pointer transition-all text-xs hover:border-primary/40" onClick={() => setSelectedTone(selectedTone === tone ? null : tone)}>
                              {t(`ai.tones.${tone}`, tone)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{t("feastDetail.lengthLabel")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {lengthOptions.map((len) => (
                            <Badge key={len} variant={selectedLength === len ? "default" : "outline"} className="cursor-pointer transition-all text-xs hover:border-primary/40" onClick={() => setSelectedLength(selectedLength === len ? null : len)}>
                              {t(`feastDetail.lengths.${len}`, len)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{t("feastDetail.styleLabel")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {styleOptions.map((style) => (
                            <Badge key={style} variant={selectedStyle === style ? "default" : "outline"} className="cursor-pointer transition-all text-xs hover:border-primary/40" onClick={() => setSelectedStyle(selectedStyle === style ? null : style)}>
                              {t(`feastDetail.styles.${style}`, style)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="wine"
                      size="sm"
                      className="w-full shadow-wine"
                      onClick={() => regenSingleToast.mutate()}
                      disabled={regenSingleToast.isPending}
                    >
                      {regenSingleToast.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                      {hasBody ? t("feastDetail.regenerateToast") : t("feastDetail.generateBody")}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* ── Version History (collapsible) ── */}
            {versions && versions.length > 0 && (
              <Collapsible open={showVersions} onOpenChange={setShowVersions}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-2 rounded-xl bg-surface-1 hover:bg-surface-2 transition-colors px-3.5 py-2.5 text-left">
                    <div className="h-7 w-7 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{t("feastDetail.versionHistory")}</p>
                      <p className="text-[10px] text-muted-foreground">{versions.length} {versions.length === 1 ? "version" : "versions"}</p>
                    </div>
                    {showVersions ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 pt-2 pl-1">
                    {versions.map((v: any, vi: number) => {
                      const vBody = isEnLang ? (v.body_en || v.body_ka) : v.body_ka;
                      return (
                        <div key={v.id} className="relative pl-5">
                          {/* Timeline connector */}
                          {vi < versions.length - 1 && <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />}
                          <div className="absolute left-0 top-2 h-[14px] w-[14px] rounded-full border-2 border-border bg-card" />
                          <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] font-mono">v{v.version_number}</Badge>
                                <span className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                              </div>
                              {canEdit && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => restoreVersion.mutate(v)} disabled={restoreVersion.isPending}>
                                  <RotateCcw className="h-2.5 w-2.5" />{t("common.restore")}
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">{vBody}</p>
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setInsertAfterPosition(prev => prev === position ? null : position);
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

  const totalToasts = feastToasts?.length || 0;
  const completedToasts = feastToasts?.filter((ft: any) => ft.status === "completed").length || 0;
  const toastsWithBody = feastToasts?.filter((ft: any) => ft.assigned_toast_id || ft.assigned_custom_toast_id).length || 0;
  const totalGuests = guests?.length || 0;
  const planProgress = totalToasts > 0 ? Math.round((toastsWithBody / totalToasts) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      {/* Summary Hero Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1.5 wine-gradient" />
        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="rounded-xl bg-surface-1 hover:bg-surface-2 shrink-0" onClick={() => navigate("/feasts")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-heading-2 font-display text-foreground truncate">{feast.title}</h1>
                  <Badge className={`text-[10px] ${statusColors[feast.status || "draft"]}`}>
                    {t(`feasts.status.${feast.status || "draft"}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Wine className="h-3 w-3" />
                    {t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type)}
                  </span>
                  {feast.guest_count && (
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" /> {feast.guest_count}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {formatDuration(feast.estimated_duration_minutes)}
                  </span>
                </div>
              </div>
            </div>
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-surface-1 hover:bg-surface-2 shrink-0 h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditTitle(feast.title); setEditNotes(feast.notes || ""); setEditMode(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> {t("feastDetail.editFeast")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (feast.share_code) { copyShareLink(); } else { generateShareCode.mutate(); }
                  }}>
                    <Share2 className="h-3.5 w-3.5 mr-2" /> {feast.share_code ? t("common.copy") + " " + t("feastDetail.shareCotamada").substring(0, 15) : t("common.generateCode")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> {t("feastDetail.deleteFeast")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Progress section */}
          {totalToasts > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Wine className="h-3.5 w-3.5" /> {totalToasts} {t("feastDetail.plan").toLowerCase()}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {totalGuests} {t("feastDetail.guestsTab").toLowerCase()}</span>
                </div>
                <span className="text-xs font-medium text-foreground/70">{toastsWithBody}/{totalToasts} {t("feastDetail.ready", "ready")}</span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full wine-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${planProgress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Primary action: Go Live */}
          {isHost && (canStart || canPause || feast.status === "active") && (
            <div className="mt-4 flex gap-2">
              {(feast.status === "active" || feast.status === "paused") && (
                <Button className="flex-1 h-11 wine-gradient text-white shadow-wine hover:opacity-90 transition-opacity" onClick={() => navigate(`/feasts/${id}/live`)}>
                  <Play className="h-4 w-4 mr-2" />{t("feastDetail.goLive", "Go Live")}
                </Button>
              )}
              {canStart && feast.status === "draft" && (
                <Button className="flex-1 h-11 wine-gradient text-white shadow-wine hover:opacity-90 transition-opacity" onClick={() => { updateStatus.mutate("active"); navigate(`/feasts/${id}/live`); }}>
                  <Play className="h-4 w-4 mr-2" />{t("feastDetail.goLive", "Go Live")}
                </Button>
              )}
              {canPause && (
                <Button size="lg" variant="outline" className="h-11" onClick={() => updateStatus.mutate("paused")}>
                  <Pause className="h-4 w-4 mr-1.5" />{t("common.pause")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                <div className="space-y-0">
                  {feastToasts.map((ft, i) => (
                    <React.Fragment key={ft.id}>
                      <div className="py-1">
                        <SortableToastCard
                          ft={ft}
                          index={i}
                          isDraft={isDraft}
                          isHost={isHost}
                          toastStatusIcon={toastStatusIcon}
                          onSelect={setSelectedToast}
                          onRemove={(toastId) => removeToast.mutate(toastId)}
                          t={t}
                        />
                      </div>
                      {/* Inline insertion point between toasts */}
                      {isHost && isDraft && (
                        <div className="relative group">
                          {insertAfterPosition === ft.position ? (
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="py-1.5"
                              >
                                <Card className="border-primary/40 bg-primary/5 border-dashed">
                                  <CardContent className="p-2.5">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder={t("feastDetail.toastNamePlaceholder")}
                                        value={newToastTitle}
                                        onChange={(e) => setNewToastTitle(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") addToast.mutate(); if (e.key === "Escape") setInsertAfterPosition(null); }}
                                        className="flex-1 h-9 text-sm"
                                        autoFocus
                                      />
                                      <Select value={newToastType} onValueChange={setNewToastType}>
                                        <SelectTrigger className="w-[120px] h-9 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {toastTypeKeys.map((tt) => (
                                            <SelectItem key={tt} value={tt}>{t(`live.toastType.${tt}`, tt)}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button size="sm" variant="wine" className="h-9 px-3" onClick={() => addToast.mutate()}>
                                        <Plus className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-9 px-2" onClick={() => setInsertAfterPosition(null)}>
                                        ✕
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </AnimatePresence>
                          ) : (
                            <div
                              className="flex items-center gap-2 py-1 cursor-pointer opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
                              onClick={() => handleInsertAfter(ft.position)}
                            >
                              <div className="flex-1 h-px bg-border group-hover:bg-primary/40 transition-colors" />
                              <span className="flex items-center justify-center h-5 w-5 rounded-full border border-border group-hover:border-primary/40 text-muted-foreground group-hover:text-primary transition-colors">
                                <Plus className="h-3 w-3" />
                              </span>
                              <div className="flex-1 h-px bg-border group-hover:bg-primary/40 transition-colors" />
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
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
            <Card className="border-dashed">
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("feastDetail.toastNamePlaceholder")}
                    value={insertAfterPosition === null ? newToastTitle : ""}
                    onChange={(e) => { if (insertAfterPosition === null) setNewToastTitle(e.target.value); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && insertAfterPosition === null) { addToast.mutate(); } }}
                    className="flex-1"
                    disabled={insertAfterPosition !== null}
                  />
                  <Select value={newToastType} onValueChange={setNewToastType} disabled={insertAfterPosition !== null}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toastTypeKeys.map((tt) => (
                        <SelectItem key={tt} value={tt}>{t(`live.toastType.${tt}`, tt)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => { if (insertAfterPosition === null) addToast.mutate(); }} disabled={insertAfterPosition !== null}><Plus className="h-4 w-4" /></Button>
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
          <Card className="overflow-hidden">
            <div className="h-0.5 surface-gradient" />
            <CardContent className="p-4 space-y-3">
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("feasts.feastName")}</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-surface-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("feasts.notes")}</label>
                    <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="bg-surface-1" />
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
                    {[
                      { label: t("feastDetail.occasionType"), value: t(`feasts.occasion.${feast.occasion_type}`, feast.occasion_type) },
                      { label: t("feasts.formality"), value: t(`feasts.formalityOptions.${feast.formality_level || "formal"}`) },
                      { label: t("feastDetail.guestCount"), value: feast.guest_count || "—" },
                      { label: t("feasts.duration"), value: formatDuration(feast.estimated_duration_minutes) },
                    ].map((item, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-surface-1">
                        <p className="text-muted-foreground text-caption mb-0.5">{item.label}</p>
                        <p className="font-medium text-foreground">{item.value}</p>
                      </div>
                    ))}
                    {feast.region && (
                      <div className="p-2.5 rounded-lg bg-surface-1">
                        <p className="text-muted-foreground text-caption mb-0.5">{t("profile.region")}</p>
                        <p className="font-medium text-foreground">{t(`profile.regions.${feast.region}`, feast.region)}</p>
                      </div>
                    )}
                  </div>
                  {feast.notes && <div className="p-3 rounded-lg bg-surface-1"><p className="text-muted-foreground text-caption mb-1">{t("feasts.notes")}</p><p className="text-sm text-foreground">{feast.notes}</p></div>}
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
            <Button variant="outline" className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />{t("feastDetail.deleteFeast")}
            </Button>
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

      {/* Delete Feast Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
    </div>
  );
};

export default FeastDetailPage;
