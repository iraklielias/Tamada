import React from "react";
import { Loader2 } from "lucide-react";

const STAGES: Record<string, { label: string; labelKa: string }> = {
  listening: { label: "Listening...", labelKa: "ვუსმენ..." },
  transcribing: { label: "Transcribing...", labelKa: "ვაკონვერტირებ..." },
  thinking: { label: "Tamada is thinking...", labelKa: "თამადა ფიქრობს..." },
  tts: { label: "Preparing voice...", labelKa: "ხმას ვამზადებ..." },
};

interface ProcessingStagesProps {
  stage: string;
}

export function ProcessingStages({ stage }: ProcessingStagesProps) {
  const stageInfo = STAGES[stage] || STAGES.thinking;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{stageInfo.labelKa}</span>
    </div>
  );
}
