import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Volume2, Pause, Wine } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import type { ExternalChatMessage } from "@/types/external-api";

interface ToastCardProps {
  message: ExternalChatMessage;
  onPlay: () => void;
  isPlaying: boolean;
}

export function ToastCard({ message, onPlay, isPlaying }: ToastCardProps) {
  const cleanContent = message.content
    .replace(/===TOAST_START===|===TOAST_END===/g, "")
    .replace(/---/g, "")
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex justify-start"
    >
      <div className="max-w-[90%] md:max-w-[80%] rounded-2xl overflow-hidden shadow-md border border-primary/20">
        {/* Wine-colored accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

        <div className="p-4 bg-card space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wine className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">სადღეგრძელო</span>
          </div>

          {/* Toast text */}
          <p className="font-serif text-sm leading-[1.8] whitespace-pre-wrap text-foreground">
            {cleanContent}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-1 border-t border-border/50">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigator.clipboard.writeText(cleanContent);
                sonnerToast.success("დაკოპირდა!");
              }}
            >
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onPlay}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            {message.audio_duration_seconds && (
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {Math.round(message.audio_duration_seconds)}s
              </span>
            )}
          </div>

          {/* Attribution */}
          <p className="text-[10px] text-muted-foreground/40 text-right pt-1">
            Powered by TAMADA AI
          </p>
        </div>
      </div>
    </motion.div>
  );
}
