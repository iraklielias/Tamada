import React from "react";
import type { ExternalChatMessage } from "@/types/external-api";

interface ChatBubbleProps {
  message: ExternalChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.message_type === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
          isUser
            ? "bg-[hsl(var(--primary))] text-primary-foreground rounded-br-sm"
            : isSystem
            ? "bg-muted text-muted-foreground italic rounded-bl-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] opacity-60 mt-1 block">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
