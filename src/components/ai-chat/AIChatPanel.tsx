import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThinkingFacts } from "@/components/api-testing/ThinkingFacts";
import type { ExternalChatMessage } from "@/types/external-api";
import type { GeneratedToast } from "./types";

interface AIChatPanelProps {
  language: "ka" | "en";
  onClose: () => void;
  onVoiceMode: () => void;
  onToastGenerated?: (toast: GeneratedToast) => void;
  chat: {
    messages: ExternalChatMessage[];
    isLoading: boolean;
    sendTextMessage: (text: string, language: "ka" | "en") => Promise<ExternalChatMessage>;
    clearMessages: () => void;
  };
}

function ChatBubble({ message }: { message: ExternalChatMessage }) {
  const isUser = message.role === "user";
  const content = message.content
    .replace(/===TOAST_START===|===TOAST_END===/g, "")
    .replace(/===PARAMS===[\s\S]*?===END_PARAMS===/g, "")
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-surface-1 border border-border/50 text-foreground rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        <p className={`text-[10px] mt-1 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

export function AIChatPanel({ language, onClose, onVoiceMode, onToastGenerated, chat }: AIChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, chat.isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || chat.isLoading) return;
    setInputText("");

    try {
      const response = await chat.sendTextMessage(text, language);
      const toastData = (response.metadata as any)?.toast;
      if (toastData && onToastGenerated) {
        onToastGenerated(toastData as GeneratedToast);
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  }, [inputText, chat, language, onToastGenerated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = language === "ka"
    ? "გამარჯობა! მე ვარ თამადა AI. მითხარი, რა შემთხვევისთვის გჭირდება სადღეგრძელო და შევქმნი რაღაც განსაკუთრებულს. 🍷"
    : "Hello! I'm TAMADA AI. Tell me what occasion you need a toast for and I'll craft something special. 🍷";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full wine-gradient flex items-center justify-center">
            <span className="text-sm">🍷</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {language === "ka" ? "თამადა AI" : "Tamada AI"}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {language === "ka" ? "საუბარი სადღეგრძელოზე" : "Chat about your toast"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={chat.clearMessages}
            title={language === "ka" ? "თავიდან" : "Reset"}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div ref={scrollRef} className="py-4 space-y-1">
          {chat.messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-3"
            >
              <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed bg-surface-1 border border-border/50 text-foreground">
                <p className="whitespace-pre-wrap">{welcomeMessage}</p>
              </div>
            </motion.div>
          )}

          {chat.messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {chat.isLoading && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-surface-1 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {language === "ka" ? "თამადა ფიქრობს..." : "Tamada is thinking..."}
                  </span>
                </div>
                <ThinkingFacts isVisible={true} language={language} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full shrink-0 text-primary hover:bg-primary/10"
            onClick={onVoiceMode}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "ka" ? "დაწერე შეტყობინება..." : "Type a message..."}
            className="flex-1 rounded-full bg-surface-1 border-border/50 px-4"
            disabled={chat.isLoading}
          />
          <Button
            size="icon"
            variant="wine"
            className="h-10 w-10 rounded-full shrink-0"
            onClick={handleSend}
            disabled={!inputText.trim() || chat.isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
