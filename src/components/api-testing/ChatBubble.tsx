import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import type { ExternalChatMessage } from "@/types/external-api";

interface ChatBubbleProps {
  message: ExternalChatMessage;
  language?: "ka" | "en";
}

export function ChatBubble({ message, language = "ka" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.message_type === "system";
  const isAssistant = message.role === "assistant" && !isSystem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mt-1 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[80%] md:max-w-[72%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-br-md shadow-md"
              : isSystem
              ? "bg-muted/50 text-muted-foreground italic rounded-bl-md border border-border/40"
              : "bg-card text-foreground rounded-bl-md border border-border/40 shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Footer row: timestamp + attribution */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-muted-foreground/40">
            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isAssistant && (
            <div className="flex items-center gap-1">
              <WineGlassIcon className="w-2.5 h-2.5 text-primary/40" />
              <span className="text-[10px] font-medium text-primary/40 tracking-wide">
                Powered by TAMADA AI
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-1">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
