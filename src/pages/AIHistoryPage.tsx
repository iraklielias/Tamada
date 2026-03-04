import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Sparkles, Clock, Pencil, ThumbsUp, ThumbsDown, Wine, AlertCircle } from "lucide-react";
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
  supra: "სუფრა",
  wedding: "ქორწილი",
  birthday: "დაბადების დღე",
  memorial: "პანაშვიდი",
  christening: "ნათლობა",
  guest_reception: "სტუმრის მიღება",
  holiday: "დღესასწაული",
  business: "საქმიანი",
  friendly_gathering: "მეგობრული შეკრება",
  other: "სხვა",
};

const toneLabels: Record<string, string> = {
  traditional: "🏛️ ტრადიციული",
  humorous: "😄 იუმორისტული",
  emotional: "❤️ ემოციური",
  philosophical: "🤔 ფილოსოფიური",
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  generate_toast: { label: "გენერაცია", icon: <Sparkles className="h-3 w-3" /> },
  submit_feedback: { label: "უკუკავშირი", icon: <ThumbsUp className="h-3 w-3" /> },
  analyze_edit_delta: { label: "რედაქტირების ანალიზი", icon: <Pencil className="h-3 w-3" /> },
  generate_feast_plan: { label: "გეგმის გენერაცია", icon: <Wine className="h-3 w-3" /> },
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

  // Fetch edit deltas from user_ai_knowledge
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

  // Stats
  const totalGenerations = logs?.filter(l => l.generation_type === "generate_toast").length || 0;
  const totalFeedback = logs?.filter(l => l.generation_type === "submit_feedback").length || 0;
  const totalEdits = logs?.filter(l => l.generation_type === "analyze_edit_delta").length || 0;
  const avgLatency = logs?.filter(l => l.latency_ms).reduce((sum, l) => sum + (l.latency_ms || 0), 0) || 0;
  const latencyCount = logs?.filter(l => l.latency_ms).length || 1;

  const editBehavior = editKnowledge?.find(k => k.knowledge_key === "edit_behavior");
  const lengthPref = editKnowledge?.find(k => k.knowledge_key === "length_preference");

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-heading-1 text-foreground flex items-center gap-2">
          <History className="h-7 w-7 text-primary" />
          გენერაციის ისტორია
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          ყველა AI-ით შექმნილი სადღეგრძელო და მათი ცვლილებები
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalGenerations}</p>
            <p className="text-xs text-muted-foreground">გენერაცია</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalFeedback}</p>
            <p className="text-xs text-muted-foreground">უკუკავშირი</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEdits}</p>
            <p className="text-xs text-muted-foreground">რედაქტირება</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{Math.round(avgLatency / latencyCount)}ms</p>
            <p className="text-xs text-muted-foreground">საშ. ლატენსი</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning insights */}
      {(editBehavior || lengthPref) && (
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              ადაპტური სწავლის შეჯამება
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {editBehavior && (
                <div className="p-2.5 rounded-md bg-muted/50 border border-border">
                  <span className="font-medium text-foreground block mb-1">რედაქტირების ქცევა</span>
                  <span className="text-muted-foreground">
                    დამჯერებლობა: {((editBehavior.confidence_score || 0) * 100).toFixed(0)}% • 
                    სიგნალები: {editBehavior.signal_count}
                  </span>
                </div>
              )}
              {lengthPref && (
                <div className="p-2.5 rounded-md bg-muted/50 border border-border">
                  <span className="font-medium text-foreground block mb-1">სიგრძის პრეფერენცია</span>
                  <span className="text-muted-foreground">
                    {(() => {
                      const val = lengthPref.knowledge_value as Record<string, unknown>;
                      const pref = val?.preferred as string || "medium";
                      const prefLabels: Record<string, string> = { short: "მოკლე", medium: "საშუალო", long: "გრძელი" };
                      return `${prefLabels[pref] || pref} • დამჯერებლობა: ${((lengthPref.confidence_score || 0) * 100).toFixed(0)}%`;
                    })()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !logs?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">ჯერ არ გაქვთ გენერაციის ისტორია</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-3 pr-3">
            {logs.map((log, index) => {
              const params = log.input_params as Record<string, unknown> | null;
              const genParams = (
                (params?.generation_params as Record<string, string>) ||
                ((params?.feedback_params as Record<string, unknown>)?.generation_params as Record<string, string>) ||
                ((params?.edit_delta_params as Record<string, unknown>)?.generation_params as Record<string, string>)
              );
              const typeInfo = typeLabels[log.generation_type] || { label: log.generation_type, icon: <Sparkles className="h-3 w-3" /> };
              const isGeneration = log.generation_type === "generate_toast";
              const isFeedback = log.generation_type === "submit_feedback";
              const isEditDelta = log.generation_type === "analyze_edit_delta";
              const feedbackSignal = isFeedback ? (params?.feedback_params as Record<string, unknown>)?.signal as string : null;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={`transition-colors ${isEditDelta ? "border-accent/40" : isFeedback ? "border-muted" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Header: type + occasion */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              {typeInfo.icon} {typeInfo.label}
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
                                className={`text-[10px] ${feedbackSignal === "positive" ? "border-green-500/50 text-green-600" : "border-destructive/50 text-destructive"}`}
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

                          {/* Output preview for generations */}
                          {isGeneration && log.output_text && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {log.output_text.substring(0, 200)}{log.output_text.length > 200 ? "..." : ""}
                            </p>
                          )}

                          {/* Edit delta info */}
                          {isEditDelta && params?.edit_delta_params && (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>
                                ორიგინალი → რედაქტირებული ვერსია ანალიზი
                              </p>
                            </div>
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
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AIHistoryPage;
