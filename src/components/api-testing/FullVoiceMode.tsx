import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Mic, AlertCircle } from "lucide-react";
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
  listening: { ka: "გისმენთ — დააჭირეთ გასაგზავნად", en: "Listening — tap to send" },
  transcribing: { ka: "ვამუშავებ...", en: "Processing..." },
  thinking: { ka: "თამადა ფიქრობს...", en: "Tamada is thinking..." },
  speaking: { ka: "თამადა საუბრობს — დააჭირეთ შესაწყვეტად", en: "Speaking — tap to interrupt" },
  error: { ka: "შეცდომა — დააჭირეთ თავიდან", en: "Error — tap to retry" },
};

const INSTRUCTIONS = {
  ka: [
    "🎤 დააჭირეთ ორბს საუბრის დასაწყებად",
    "✋ დააჭირეთ ისევ შეტყობინების გასაგზავნად",
    "🔇 დააჭირეთ საუბრისას შესაწყვეტად",
  ],
  en: [
    "🎤 Tap the orb to start speaking",
    "✋ Tap again to send your message",
    "🔇 Tap while speaking to interrupt",
  ],
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
  const isError = stage === "error";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: isError
            ? `radial-gradient(circle, hsl(var(--destructive) / 0.15) 0%, transparent 70%)`
            : `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
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
          borderColor: isError
            ? "hsl(var(--destructive))"
            : isActive
            ? "hsl(var(--primary))"
            : "hsl(var(--border))",
          background: isError
            ? `radial-gradient(circle at 40% 40%, hsl(var(--destructive) / 0.2), hsl(var(--destructive) / 0.05))`
            : isActive
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

        {isError ? (
          <AlertCircle className="w-8 h-8 text-destructive" />
        ) : (
          <Mic
            className={`w-8 h-8 ${isActive ? "text-primary" : "text-muted-foreground"} ${
              (stage === "thinking" || stage === "transcribing") ? "opacity-0" : ""
            }`}
          />
        )}
      </motion.div>
    </div>
  );
}

export function FullVoiceMode({ api, userId, language, onClose, onMessage, onParamsExtracted }: FullVoiceModeProps) {
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const responseRef = useRef<HTMLParagraphElement>(null);
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem("tamada-voice-instructions-seen");
  });

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
    // Dismiss instructions on first interaction
    if (showInstructions) {
      setShowInstructions(false);
      localStorage.setItem("tamada-voice-instructions-seen", "1");
    }

    if (voice.stage === "idle") {
      voice.startSession();
    } else if (voice.stage === "listening") {
      voice.stopListening();
    } else if (voice.stage === "speaking") {
      voice.interrupt();
    } else if (voice.stage === "error") {
      voice.retryFromError();
    }
  }, [voice, showInstructions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Close button */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex gap-2">
        <Button size="icon" variant="ghost" onClick={handleClose} className="h-10 w-10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Switch to text */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4">
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={handleClose}>
          <Keyboard className="h-3.5 w-3.5" />
          {language === "ka" ? "ტექსტი" : "Text"}
        </Button>
      </div>

      {/* Instructions overlay (shown once) */}
      <AnimatePresence>
        {showInstructions && voice.stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 w-full max-w-xs px-6"
          >
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg space-y-2">
              <p className="text-sm font-medium text-foreground mb-2">
                {language === "ka" ? "როგორ მუშაობს:" : "How it works:"}
              </p>
              {INSTRUCTIONS[language].map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground">{line}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center w-full" onClick={handleOrbClick}>
        <VoiceOrb stage={voice.stage} getVolume={voice.getVolume} />
      </div>

      {/* Stage label */}
      <motion.p
        key={voice.stage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm mb-4 px-4 text-center ${voice.stage === "error" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {STAGE_LABELS[voice.stage][language]}
      </motion.p>

      {/* Transcript & Response */}
      <div className="w-full max-w-md px-4 md:px-6 pb-4 space-y-2 text-center min-h-[100px]">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4">
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
