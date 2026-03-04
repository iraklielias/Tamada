import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb, Loader2, Timer, Hand, ArrowRightLeft, ListOrdered, Smile, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Advisory {
  type: string;
  message_ka: string;
  message_en?: string;
  priority: string;
}

interface FeastAdvisoryProps {
  feastId: string;
  occasionType: string;
  currentToastIndex: number;
  totalToasts: number;
  elapsedMinutes: number;
  totalDurationMinutes: number;
  guestCount: number;
  currentToastTitle?: string;
  currentToastType?: string;
  completedToasts: Array<{ position: number; title_ka: string; toast_type: string }>;
  guests: Array<{ name: string; alaverdi_count: number | null }>;
  skippedCount: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  pacing: <Timer className="h-4 w-4" />,
  alaverdi_suggestion: <Hand className="h-4 w-4" />,
  transition: <ArrowRightLeft className="h-4 w-4" />,
  toast_order: <ListOrdered className="h-4 w-4" />,
  mood_reading: <Smile className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  pacing: "ტემპი",
  alaverdi_suggestion: "ალავერდი",
  transition: "გარდამავალი",
  toast_order: "რიგითობა",
  mood_reading: "განწყობა",
};

const priorityColors: Record<string, string> = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-primary/30 bg-primary/5",
  low: "border-border bg-muted/30",
};

const FeastAdvisory: React.FC<FeastAdvisoryProps> = (props) => {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [expanded, setExpanded] = useState(true);

  const fetchAdvisory = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "feast_advisory",
          feast_context: {
            feast_id: props.feastId,
            occasion_type: props.occasionType,
            current_toast_index: props.currentToastIndex,
            total_toasts: props.totalToasts,
            elapsed_minutes: props.elapsedMinutes,
            total_duration_minutes: props.totalDurationMinutes,
            guest_count: props.guestCount,
            current_toast_title: props.currentToastTitle,
            current_toast_type: props.currentToastType,
            completed_toasts: props.completedToasts,
            guests: props.guests,
            skipped_count: props.skippedCount,
          },
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      // Handle both { advisories: [...] } and { advisory: {...} } formats
      if (data.advisories) return data.advisories as Advisory[];
      if (data.advisory) return [data.advisory] as Advisory[];
      return [];
    },
    onSuccess: (data) => {
      setAdvisories(data);
      setExpanded(true);
    },
  });

  const handleAsk = useCallback(() => {
    fetchAdvisory.mutate();
  }, [fetchAdvisory]);

  return (
    <div className="w-full max-w-lg space-y-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
        onClick={handleAsk}
        disabled={fetchAdvisory.isPending}
      >
        {fetchAdvisory.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> თამადა AI ფიქრობს...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> AI რჩევა</>
        )}
      </Button>

      <AnimatePresence>
        {advisories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
            >
              <Lightbulb className="h-3 w-3" />
              {advisories.length} რჩევა
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {expanded && advisories.map((adv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`${priorityColors[adv.priority] || priorityColors.low}`}>
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{typeIcons[adv.type] || <Lightbulb className="h-4 w-4" />}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabels[adv.type] || adv.type}
                      </Badge>
                      {adv.priority === "high" && (
                        <Badge variant="destructive" className="text-[10px]">მნიშვნელოვანი</Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{adv.message_ka}</p>
                    {adv.message_en && (
                      <p className="text-xs text-muted-foreground italic">{adv.message_en}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeastAdvisory;
