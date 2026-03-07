import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const STAGES: Record<string, { ka: string; en: string }> = {
  listening: { en: "Listening...", ka: "ვუსმენ..." },
  transcribing: { en: "Transcribing...", ka: "ვაკონვერტირებ..." },
  thinking: { en: "Tamada is thinking...", ka: "თამადა ფიქრობს..." },
  tts: { en: "Preparing voice...", ka: "ხმას ვამზადებ..." },
};

interface ProcessingStagesProps {
  stage: string;
  language?: "ka" | "en";
}

export function ProcessingStages({ stage, language = "ka" }: ProcessingStagesProps) {
  const stageInfo = STAGES[stage] || STAGES.thinking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground px-1"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-4 w-4 text-primary" />
      </motion.div>
      <span>{stageInfo[language]}</span>
    </motion.div>
  );
}
