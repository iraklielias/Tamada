import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Sparkles, Clock, Pencil, ThumbsUp, ThumbsDown, Wine, AlertCircle, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";

interface LogEntry {
  id: string;
  generation_type: string;
  input_params: Json;
  output_text: string | null;
  model_used: string | null;
  latency_ms: number | null;
  tokens_used: number | null;
  created_at: string | null;
}

const occasionLabels: Record<string, string> = {
  supra: "სუფრა", wedding: "ქორწილი", birthday: "დაბადების დღე", memorial: "პანაშვიდი",
  christening: "ნათლობა", guest_reception: "სტუმრის მიღება", holiday: "დღესასწაული",
  business: "საქმიანი", friendly_gathering: "მეგობრული შეკრება", other: "სხვა",
};

const toneLabels: Record<string, string> = {
  traditional: "🏛️ ტრადიციული", humorous: "😄 იუმორისტული",
  emotional: "❤️ ემოციური", philosophical: "🤔 ფილოსოფიური",
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  generate_toast: { label: "გენერაცია", icon: <Sparkles className="h-3.5 w-3.5" />, color: "bg-primary/10 text-primary border-primary/20" },
  submit_feedback: { label: "უკუკავშირი", icon: <MessageSquare className="h-3.5 w-3.5" />, color: "bg-gold-light text-gold border-gold/20" },
  analyze_edit_delta: { label: "რედაქტირება", icon: <Pencil className="h-3.5 w-3.5" />, color: "bg-accent text-accent-foreground border-accent" },
  generate_feast_plan: { label: "გეგმა", icon: <Wine className="h-3.5 w-3.5" />, color: "bg-wine-light text-primary border-primary/20" },
};

const AIHistoryPage = () => {
  const { user } = useAuth();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["ai-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_generation_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as LogEntry[];
    },
    enabled: !!user,
  });

  const { data: editKnowledge } = useQuery({
    queryKey: ["ai-edit-knowledge", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_ai_knowledge")
        .select("*")
        .in("knowledge_key", ["edit_behavior", "length_preference", "tone_preference"])
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalGenerations = logs?.filter(l => l.generation_type === "generate_toast").length || 0;
  const totalFeedback = logs?.filter(l => l.generation_type === "submit_feedback").length || 0;
  const totalEdits = logs?.filter(l => l.generation_type === "analyze_edit_delta").length || 0;
  const avgLatency = logs?.filter(l => l.latency_ms).reduce((sum, l) => sum + (l.latency_ms || 0), 0) || 0;
  const latencyCount = logs?.filter(l => l.latency_ms).length || 1;

  const editBehavior = editKnowledge?.find(k => k.knowledge_key === "edit_behavior");
  const lengthPref = editKnowledge?.find(k => k.knowledge_key === "length_preference");

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading-1 font-display text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          გენერაციის ისტორია
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          ყველა AI-ით შექმნილი სადღეგრძელო და მათი ცვლილებები
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: totalGenerations, label: "გენერაცია", icon: <Sparkles className="h-4 w-4" />, color: "text-primary" },
          { value: totalFeedback, label: "უკუკავშირი", icon: <MessageSquare className="h-4 w-4" />, color: "text-gold" },
          { value: totalEdits, label: "რედაქტირება", icon: <Pencil className="h-4 w-4" />, color: "text-accent-foreground" },
          { value: `${Math.round(avgLatency / latencyCount)}ms`, label: "საშ. ლატენსი", icon: <Zap className="h-4 w-4" />, color: "text-success" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-caption text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning insights */}
      {(editBehavior || lengthPref) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-primary/20 overflow-hidden">
            <div className="h-0.5 wine-gradient" />
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-wine-light flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                </div>
                ადაპტური სწავლის შეჯამება
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {editBehavior && (
                  <div className="p-3 rounded-lg bg-surface-1 border border-border">
                    <span className="font-medium text-foreground block mb-1.5">რედაქტირების ქცევა</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>დამჯერებლობა: <strong className="text-foreground">{((editBehavior.confidence_score || 0) * 100).toFixed(0)}%</strong></span>
                      <span>სიგნალები: <strong className="text-foreground">{editBehavior.signal_count}</strong></span>
                    </div>
                  </div>
                )}
                {lengthPref && (
                  <div className="p-3 rounded-lg bg-surface-1 border border-border">
                    <span className="font-medium text-foreground block mb-1.5">სიგრძის პრეფერენცია</span>
                    <span className="text-muted-foreground">
                      {(() => {
                        const val = lengthPref.knowledge_value as Record<string, unknown>;
                        const pref = val?.preferred as string || "medium";
                        const prefLabels: Record<string, string> = { short: "მოკლე", medium: "საშუალო", long: "გრძელი" };
                        return <>{prefLabels[pref] || pref} • დამჯერებლობა: <strong className="text-foreground">{((lengthPref.confidence_score || 0) * 100).toFixed(0)}%</strong></>;
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline history list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !logs?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-surface-1 flex items-center justify-center mx-auto mb-3">
              <History className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-muted-foreground">ჯერ არ გაქვთ გენერაციის ისტორია</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="relative pr-3">
            {/* Vertical timeline connector */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />

            <div className="space-y-1">
              {logs.map((log, index) => {
                const params = log.input_params as Record<string, unknown> | null;
                const genParams = (
                  (params?.generation_params as Record<string, string>) ||
                  ((params?.feedback_params as Record<string, unknown>)?.generation_params as Record<string, string>) ||
                  ((params?.edit_delta_params as Record<string, unknown>)?.generation_params as Record<string, string>)
                );
                const tc = typeConfig[log.generation_type] || { label: log.generation_type, icon: <Sparkles className="h-3.5 w-3.5" />, color: "bg-muted text-muted-foreground" };
                const isGeneration = log.generation_type === "generate_toast";
                const isFeedback = log.generation_type === "submit_feedback";
                const isEditDelta = log.generation_type === "analyze_edit_delta";
                const feedbackSignal = isFeedback ? (params?.feedback_params as Record<string, unknown>)?.signal as string : null;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex gap-3 items-start group"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-4 shrink-0">
                      <div className={`h-[10px] w-[10px] rounded-full border-2 border-background ${isGeneration ? "bg-primary" : isFeedback ? "bg-gold" : isEditDelta ? "bg-accent-foreground" : "bg-muted-foreground"}`} />
                    </div>

                    {/* Content card */}
                    <div className="flex-1 pb-2">
                      <Card className="transition-colors group-hover:border-border-strong">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Header: type + tags */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge className={`text-[10px] gap-1 border ${tc.color}`}>
                                  {tc.icon} {tc.label}
                                </Badge>
                                {genParams?.occasion_type && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {occasionLabels[genParams.occasion_type] || genParams.occasion_type}
                                  </Badge>
                                )}
                                {genParams?.tone && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {toneLabels[genParams.tone] || genParams.tone}
                                  </Badge>
                                )}
                                {isFeedback && feedbackSignal && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${feedbackSignal === "positive" ? "border-success/50 text-success" : "border-destructive/50 text-destructive"}`}
                                  >
                                    {feedbackSignal === "positive" ? <ThumbsUp className="h-2.5 w-2.5 mr-0.5" /> : <ThumbsDown className="h-2.5 w-2.5 mr-0.5" />}
                                    {feedbackSignal === "positive" ? "დადებითი" : "უარყოფითი"}
                                  </Badge>
                                )}
                                {isEditDelta && (
                                  <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                                    <Pencil className="h-2.5 w-2.5 mr-0.5" /> რედაქტირებული
                                  </Badge>
                                )}
                              </div>

                              {/* Output preview */}
                              {isGeneration && log.output_text && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {log.output_text.substring(0, 200)}{log.output_text.length > 200 ? "..." : ""}
                                </p>
                              )}

                              {isEditDelta && (
                                <p className="text-xs text-muted-foreground">ორიგინალი → რედაქტირებული ვერსია</p>
                              )}
                            </div>

                            {/* Right: time + latency */}
                            <div className="text-right shrink-0 space-y-1">
                              <p className="text-[10px] text-muted-foreground">
                                {log.created_at
                                  ? format(new Date(log.created_at), "d MMM, HH:mm", { locale: ka })
                                  : "—"}
                              </p>
                              {log.latency_ms && (
                                <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground justify-end">
                                  <Clock className="h-2.5 w-2.5" />
                                  {log.latency_ms}ms
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AIHistoryPage;
