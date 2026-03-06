import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Volume2, Pause } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import type { ExternalChatMessage } from "@/types/external-api";

interface ToastCardProps {
  message: ExternalChatMessage;
  onPlay: () => void;
  isPlaying: boolean;
}

export function ToastCard({ message, onPlay, isPlaying }: ToastCardProps) {
  const cleanContent = message.content.replace(/---/g, "").trim();

  return (
    <div className="bg-card border-l-4 border-l-primary rounded-lg p-4 space-y-3 shadow-sm">
      <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {cleanContent}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1"
          onClick={() => {
            navigator.clipboard.writeText(cleanContent);
            sonnerToast.success("Copied!");
          }}
        >
          <Copy className="h-3 w-3" /> Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1"
          onClick={onPlay}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        {message.audio_duration_seconds && (
          <span className="text-[10px] text-muted-foreground">
            {Math.round(message.audio_duration_seconds)}s
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground">Powered by TAMADA</div>
    </div>
  );
}
