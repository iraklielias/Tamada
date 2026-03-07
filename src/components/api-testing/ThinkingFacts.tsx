import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tamadaFacts, CATEGORY_ICONS } from "@/data/tamadaFacts";
import type { VoiceStage } from "@/hooks/useVoiceConversation";

interface ThinkingFactsProps {
  stage: VoiceStage;
  language: "ka" | "en";
}

const ROTATE_MS = 5000;

export function ThinkingFacts({ stage, language }: ThinkingFactsProps) {
  const isVisible = stage === "thinking" || stage === "transcribing";
  const [index, setIndex] = useState(() => Math.floor(Math.random() * tamadaFacts.length));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isVisible) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    // Reset to random on each thinking session
    setIndex(Math.floor(Math.random() * tamadaFacts.length));
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % tamadaFacts.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const fact = tamadaFacts[index];
  const icon = CATEGORY_ICONS[fact.category];

  return (
    <div className="w-full max-w-[280px] mx-auto px-5 text-center py-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-lg leading-none" aria-hidden>{icon}</span>
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 font-medium">
            {fact[language]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
