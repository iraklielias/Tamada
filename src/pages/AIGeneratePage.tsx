import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProGate } from "@/hooks/useProGate";
import ProUpsellModal from "@/components/ProUpsellModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Heart, Loader2, Wine, RefreshCw, Lock, MapPin, User, Clock, Volume2, Hand, ThumbsUp, ThumbsDown, Palette, Pencil, Check, Eye, EyeOff, Undo2 } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Simple word-level diff
function computeWordDiff(original: string, edited: string): { type: "same" | "added" | "removed"; text: string }[] {
  const origWords = original.split(/(\s+)/);
  const editWords = edited.split(/(\s+)/);
  const result: { type: "same" | "added" | "removed"; text: string }[] = [];

  // LCS-based diff for reasonable lengths
  const m = origWords.length, n = editWords.length;
  if (m + n > 2000) {
    // fallback: show full removal + addition
    return [
      { type: "removed", text: original },
      { type: "added", text: edited },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = origWords[i - 1] === editWords[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  let i = m, j = n;
  const ops: { type: "same" | "added" | "removed"; text: string }[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === editWords[j - 1]) {
      ops.push({ type: "same", text: origWords[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "added", text: editWords[j - 1] });
      j--;
    } else {
      ops.push({ type: "removed", text: origWords[i - 1] });
      i--;
    }
  }
  ops.reverse();

  // Merge consecutive same-type segments
  for (const op of ops) {
    if (result.length > 0 && result[result.length - 1].type === op.type) {
      result[result.length - 1].text += op.text;
    } else {
      result.push({ ...op });
    }
  }
  return result;
}

const occasionKeys = ["supra","wedding","birthday","memorial","christening","guest_reception","holiday","business","friendly_gathering","other"];
const formalityKeys = ["formal","semi_formal","casual"];
const toneKeys = ["traditional","humorous","emotional","philosophical"];
const toneIcons: Record<string, string> = { traditional: "🏛️", humorous: "😄", emotional: "❤️", philosophical: "🤔" };
const regionKeys = ["general","kakheti","imereti","kartli","racha","samegrelo","guria","adjara","svaneti","meskheti"];

interface DeliveryGuidance {
  recommended_pace?: string;
  emotional_peak_location?: string;
  pause_suggestions?: string[];
  glass_raise_moment?: string;
  estimated_duration_minutes?: number;
}

interface ToastMetadata {
  toast_type?: string;
  region_style?: string;
  tone?: string;
  complexity?: string;
  generation_type?: string;
}

interface GeneratedToast {
  title_ka: string;
  body_ka: string;
  title_en?: string;
  body_en?: string;
  metadata?: ToastMetadata;
  delivery_guidance?: DeliveryGuidance;
}

const paceKeys = ["slow", "moderate", "conversational"] as const;
const peakKeys = ["beginning", "middle", "end"] as const;

const AIGeneratePage = () => {
  const { t } = useTranslation();
  const [occasion, setOccasion] = useState("supra");
  const [formality, setFormality] = useState("formal");
  const [tone, setTone] = useState("traditional");
  const [region, setRegion] = useState("general");
  const [personName, setPersonName] = useState("");
  const [personDetails, setPersonDetails] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GeneratedToast | null>(null);
  const [originalResult, setOriginalResult] = useState<GeneratedToast | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellMessage, setUpsellMessage] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkFeature, dailyAICount, limits, canGenerateAI } = useProGate();

  const generate = useMutation({
    mutationFn: async () => {
      const check = checkFeature("ai");
      if (!check.allowed) {
        setUpsellMessage(check.message);
        setShowUpsell(true);
        throw new Error(check.message);
      }

      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "generate_toast",
          generation_params: {
            occasion_type: occasion,
            formality_level: formality,
            tone,
            region: region !== "general" ? region : undefined,
            person_name: personName || undefined,
            person_details: personDetails || undefined,
            freeform_comment: topic,
            language: "both",
          },
        },
      });
      const latencyMs = Math.round(performance.now() - startTime);
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Track latency: find most recent log entry and update by id
      supabase
        .from("ai_generation_log")
        .select("id")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
        .then(({ data: logEntry }) => {
          if (logEntry) {
            supabase
              .from("ai_generation_log")
              .update({ latency_ms: latencyMs })
              .eq("id", logEntry.id)
              .then(() => {});
          }
        });

      return data as GeneratedToast;
    },
    onSuccess: (data) => {
      setResult(data);
      setOriginalResult(data);
      setEditedTitle(data.title_ka);
      setEditedBody(data.body_ka);
      setIsEditing(false);
      setShowDiff(false);
      setFeedbackGiven(null);
      queryClient.invalidateQueries({ queryKey: ["daily-ai-count"] });
      sonnerToast.success(t("ai.created"));
    },
    onError: (err: Error) => {
      if (!showUpsell) sonnerToast.error(err.message || t("ai.generateFailed"));
    },
  });

  const saveToFavorites = useMutation({
    mutationFn: async () => {
      const check = checkFeature("favorite");
      if (!check.allowed) {
        setUpsellMessage(check.message);
        setShowUpsell(true);
        throw new Error(check.message);
      }

      if (!result || !user) return;

      // Check if user edited the toast
      const wasEdited = originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka);

      const { data: custom, error: cErr } = await supabase
        .from("custom_toasts")
        .insert({
          user_id: user.id,
          title_ka: editedTitle,
          body_ka: editedBody,
          title_en: result.title_en,
          body_en: result.body_en,
          occasion_type: occasion,
          is_ai_generated: true,
          ai_generation_params: { occasion, formality, tone, region, personName, personDetails, topic } as any,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      const { error: fErr } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, custom_toast_id: custom.id });
      if (fErr) throw fErr;

      // Send edit delta for adaptive learning if edited
      if (wasEdited && originalResult) {
        supabase.functions.invoke("tamada-ai", {
          body: {
            action: "analyze_edit_delta",
            edit_delta_params: {
              original_title: originalResult.title_ka,
              original_body: originalResult.body_ka,
              edited_title: editedTitle,
              edited_body: editedBody,
              generation_params: {
                occasion_type: occasion,
                tone,
                region: region !== "general" ? region : undefined,
                formality_level: formality,
              },
            },
          },
        }).catch(() => {}); // fire-and-forget
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites-full"] });
      queryClient.invalidateQueries({ queryKey: ["fav-count"] });
      sonnerToast.success(
        originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka)
          ? t("common.editedVersionSaved")
          : t("ai.savedToFavs")
      );
    },
    onError: (err: Error) => {
      if (!showUpsell) sonnerToast.error(t("ai.saveFailed"));
    },
  });

  const sendFeedback = useMutation({
    mutationFn: async (signal: "positive" | "negative") => {
      if (!user) return;
      const signalWeight = signal === "positive" ? 1.0 : 0.2;

      // Update tone preference
      const toneValue = {
        [tone]: signal === "positive" ? 0.15 : -0.1,
      };

      await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "submit_feedback",
          feedback_params: {
            signal,
            generation_params: {
              occasion_type: occasion,
              tone,
              region: region !== "general" ? region : undefined,
              formality_level: formality,
            },
          },
        },
      });
    },
    onSuccess: (_, signal) => {
      setFeedbackGiven(signal);
      sonnerToast.success(signal === "positive" ? t("ai.feedback.thanks") : t("ai.feedback.noted"));
    },
  });

  const copyToClipboard = () => {
    if (!editedBody) return;
    navigator.clipboard.writeText(editedBody);
    sonnerToast.success(t("common.copied"));
  };

  const dg = result?.delivery_guidance;
  const meta = result?.metadata;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            {t("ai.title")}
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {t("ai.subtitle")}
          </p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {dailyAICount}/{limits.maxAIPerDay} {t("ai.today")}
        </Badge>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Row 1: Occasion + Formality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {t("ai.personName")}
              </label>
              <Input
                placeholder={t("ai.personNamePlaceholder")}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">
                {t("ai.personDetails")}
              </label>
              <Input
                placeholder={t("ai.personDetailsPlaceholder")}
                value={personDetails}
                onChange={(e) => setPersonDetails(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">
              {t("ai.topic")}
            </label>
            <Textarea
              placeholder={t("ai.topicPlaceholder")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
          >
            {generate.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> იქმნება...</>
            ) : !canGenerateAI ? (
              <><Lock className="h-4 w-4 mr-2" /> ლიმიტი ამოიწურა</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> სადღეგრძელოს გენერაცია</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Toast card */}
             <Card className="border-primary/20 shadow-card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wine className="h-5 w-5 text-primary" />
                    {isEditing ? (
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="font-semibold text-sm h-8"
                      />
                    ) : (
                      <h3 className="font-semibold text-foreground">{editedTitle}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {editedTitle !== originalResult?.title_ka || editedBody !== originalResult?.body_ka ? (
                      <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                        <Pencil className="h-2.5 w-2.5 mr-0.5" /> {t("common.edited")}
                      </Badge>
                    ) : null}
                    {meta?.tone && (
                      <Badge variant="outline" className="text-[10px]">
                        {toneIcons[meta.tone] || ""} {t(`ai.tones.${meta.tone}`, meta.tone)}
                      </Badge>
                    )}
                    {meta?.region_style && meta.region_style !== "general" && (
                      <Badge variant="outline" className="text-[10px]">
                        <MapPin className="h-2.5 w-2.5 mr-0.5" />
                        {t(`profile.regions.${meta.region_style}`, meta.region_style)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">AI</Badge>
                  </div>
                </div>

                {isEditing ? (
                  <Textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="text-sm leading-relaxed min-h-[120px]"
                    rows={6}
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {editedBody}
                  </p>
                )}

                {/* Visual Diff View */}
                {!isEditing && originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka) && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowDiff(!showDiff)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {showDiff ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {showDiff ? t("common.hideChanges") : t("common.showChanges")}
                    </button>
                    <AnimatePresence>
                      {showDiff && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                            {editedTitle !== originalResult.title_ka && (
                              <div className="text-xs">
                                <span className="font-medium text-muted-foreground block mb-1">{t("common.titleLabel")}:</span>
                                <p className="leading-relaxed">
                                  {computeWordDiff(originalResult.title_ka, editedTitle).map((seg, i) =>
                                    seg.type === "same" ? (
                                      <span key={i}>{seg.text}</span>
                                    ) : seg.type === "removed" ? (
                                      <span key={i} className="bg-destructive/20 text-destructive line-through rounded px-0.5">{seg.text}</span>
                                    ) : (
                                      <span key={i} className="bg-green-500/20 text-green-700 dark:text-green-400 rounded px-0.5">{seg.text}</span>
                                    )
                                  )}
                                </p>
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="font-medium text-muted-foreground block mb-1">{t("common.textLabel")}:</span>
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {computeWordDiff(originalResult.body_ka, editedBody).map((seg, i) =>
                                  seg.type === "same" ? (
                                    <span key={i}>{seg.text}</span>
                                  ) : seg.type === "removed" ? (
                                    <span key={i} className="bg-destructive/20 text-destructive line-through rounded px-0.5">{seg.text}</span>
                                  ) : (
                                    <span key={i} className="bg-green-500/20 text-green-700 dark:text-green-400 rounded px-0.5">{seg.text}</span>
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isEditing && result.body_en && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground italic">{result.body_en}</p>
                  </div>
                )}

                {/* Actions + Feedback */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {isEditing ? (
                      <>
                        <Button variant="default" size="sm" onClick={() => setIsEditing(false)}>
                          <Check className="h-3.5 w-3.5 mr-1.5" /> {t("common.ready")}
                        </Button>
                        {originalResult && (editedTitle !== originalResult.title_ka || editedBody !== originalResult.body_ka) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditedTitle(originalResult.title_ka);
                              setEditedBody(originalResult.body_ka);
                              setShowDiff(false);
                            }}
                          >
                            <Undo2 className="h-3.5 w-3.5 mr-1.5" /> აღდგენა
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> რედაქტირება
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> კოპირება
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => saveToFavorites.mutate()}
                      disabled={saveToFavorites.isPending}
                    >
                      <Heart className="h-3.5 w-3.5 mr-1.5" /> შენახვა
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => generate.mutate()}
                      disabled={generate.isPending}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> ხელახლა
                    </Button>
                  </div>

                  {/* Feedback buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={feedbackGiven === "positive" ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${feedbackGiven === "positive" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      onClick={() => sendFeedback.mutate("positive")}
                      disabled={feedbackGiven !== null || sendFeedback.isPending}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={feedbackGiven === "negative" ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${feedbackGiven === "negative" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
                      onClick={() => sendFeedback.mutate("negative")}
                      disabled={feedbackGiven !== null || sendFeedback.isPending}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Guidance */}
            {dg && (dg.recommended_pace || dg.emotional_peak_location || dg.glass_raise_moment) && (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    წარმოთქმის გზამკვლევი
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {dg.recommended_pace && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">{t("ai.delivery.pace")}</span>
                          <span className="text-muted-foreground">
                            {t(`ai.delivery.${dg.recommended_pace}`, dg.recommended_pace)}
                          </span>
                        </div>
                      </div>
                    )}

                    {dg.emotional_peak_location && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">{t("ai.delivery.emotionalPeak")}</span>
                          <span className="text-muted-foreground">
                            {t(`ai.delivery.${dg.emotional_peak_location}`, dg.emotional_peak_location)}
                          </span>
                        </div>
                      </div>
                    )}

                    {dg.glass_raise_moment && (
                      <div className="flex items-start gap-2 p-2 rounded-md bg-background border border-border">
                        <Hand className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground block">{t("ai.delivery.raiseGlass")}</span>
                          <span className="text-muted-foreground">{dg.glass_raise_moment}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {dg.pause_suggestions && dg.pause_suggestions.length > 0 && (
                    <div className="text-xs space-y-1 pt-1">
                      <span className="font-medium text-foreground">პაუზების ადგილები:</span>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {dg.pause_suggestions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dg.estimated_duration_minutes && (
                    <p className="text-[11px] text-muted-foreground">
                      სავარაუდო ხანგრძლივობა: ~{dg.estimated_duration_minutes} წუთი
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ProUpsellModal open={showUpsell} onOpenChange={setShowUpsell} message={upsellMessage} />
    </div>
  );
};

export default AIGeneratePage;
