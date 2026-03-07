import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceConversation, VoiceStage } from "@/hooks/useVoiceConversation";
import type { ExternalChatMessage } from "@/types/external-api";

interface FullVoiceModeProps {
  api: {
    sendVoiceMessage: (
      userId: string,
      audioBase64: string,
      language: string,
      format?: string,
      quickParams?: Record<string, string> | null
    ) => Promise<any>;
    apiKey: string;
  };
  userId: string;
  language: "ka" | "en";
  onClose: () => void;
  onMessage: (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => void;
  onParamsExtracted?: (params: Record<string, unknown>) => void;
}

const STAGE_LABELS: Record<VoiceStage, { ka: string; en: string }> = {
  idle: { ka: "დააჭირეთ დასაწყებად", en: "Tap to start" },
  listening: { ka: "გისმენთ...", en: "Listening..." },
  transcribing: { ka: "ვამუშავებ...", en: "Processing..." },
  thinking: { ka: "თამადა ფიქრობს...", en: "Tamada is thinking..." },
  speaking: { ka: "თამადა საუბრობს...", en: "Tamada is speaking..." },
};

function VoiceOrb({ stage, getVolume }: { stage: VoiceStage; getVolume: () => number }) {
  const [volume, setVolume] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (stage !== "listening" && stage !== "speaking") {
      setVolume(0);
      return;
    }

    const tick = () => {
      setVolume(getVolume());
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stage, getVolume]);

  const scale = 1 + Math.min(volume * 8, 0.3);
  const isActive = stage !== "idle";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
        }}
        animate={{
          scale: stage === "listening" ? [1, 1.15, 1] : stage === "thinking" ? [1, 1.1, 1] : 1,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          duration: stage === "thinking" ? 1.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb */}
      <motion.div
        className="relative w-32 h-32 rounded-full border-2 flex items-center justify-center cursor-pointer"
        style={{
          borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
          background: isActive
            ? `radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))`
            : "hsl(var(--muted))",
        }}
        animate={{ scale }}
        transition={{ duration: 0.1, ease: "linear" }}
      >
        {(stage === "thinking" || stage === "transcribing") && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-primary"
                animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        <Mic
          className={`w-8 h-8 ${isActive ? "text-primary" : "text-muted-foreground"}`}
        />
      </motion.div>
    </div>
  );
}

export function FullVoiceMode({ api, userId, language, onClose, onMessage, onParamsExtracted }: FullVoiceModeProps) {
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");

  const handleMessage = useCallback(
    (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => {
      if (userMsg) setTranscript(userMsg.content);
      setLastResponse(assistantMsg.content.replace(/===TOAST_START===|===TOAST_END===/g, "").trim());
      onMessage(userMsg, assistantMsg);
    },
    [onMessage]
  );

  const voice = useVoiceConversation({
    api,
    userId,
    language,
    onMessage: handleMessage,
    onParamsExtracted,
  });

  const handleClose = useCallback(() => {
    voice.endSession();
    onClose();
  }, [voice, onClose]);

  const handleOrbClick = useCallback(() => {
    if (voice.stage === "idle") {
      voice.startSession();
    } else if (voice.stage === "speaking") {
      voice.interrupt();
    }
  }, [voice]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Close button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button size="icon" variant="ghost" onClick={handleClose} className="h-10 w-10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Switch to text */}
      <div className="absolute top-4 left-4">
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={handleClose}>
          <Keyboard className="h-3.5 w-3.5" />
          {language === "ka" ? "ტექსტი" : "Text"}
        </Button>
      </div>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center" onClick={handleOrbClick}>
        <VoiceOrb stage={voice.stage} getVolume={voice.getVolume} />
      </div>

      {/* Stage label */}
      <motion.p
        key={voice.stage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground mb-4"
      >
        {STAGE_LABELS[voice.stage][language]}
      </motion.p>

      {/* Transcript & Response */}
      <div className="w-full max-w-md px-6 pb-8 space-y-2 text-center min-h-[120px]">
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.p
              key={`t-${transcript}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              {transcript}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {lastResponse && voice.stage !== "listening" && (
            <motion.p
              key={`r-${lastResponse.slice(0, 30)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-foreground font-serif leading-relaxed line-clamp-4"
            >
              {lastResponse}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* End session */}
      {voice.stage !== "idle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full px-6"
            onClick={voice.endSession}
          >
            {language === "ka" ? "დასრულება" : "End Session"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
