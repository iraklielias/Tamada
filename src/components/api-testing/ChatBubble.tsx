import React from "react";
import { motion } from "framer-motion";
import type { ExternalChatMessage } from "@/types/external-api";

interface ChatBubbleProps {
  message: ExternalChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.message_type === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-br-md shadow-sm"
            : isSystem
            ? "bg-muted/50 text-muted-foreground italic rounded-bl-md border border-border/50"
            : "bg-card text-foreground rounded-bl-md border border-border/50 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span
          className={`text-[10px] mt-1.5 block ${
            isUser ? "text-primary-foreground/50" : "text-muted-foreground/50"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
