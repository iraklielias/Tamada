import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic } from "lucide-react";
import { toast } from "sonner";
import { ChatBubble } from "./ChatBubble";
import { ToastCard } from "./ToastCard";
import { TypingIndicator } from "./TypingIndicator";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatHeader } from "./ChatHeader";
import { SettingsDrawer } from "./SettingsDrawer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { ExternalChatMessage, UsageInfo } from "@/types/external-api";

interface ChatSimulatorProps {
  api: ReturnType<typeof import("@/hooks/useTamadaExternalApi").useTamadaExternalApi>;
  onOpenVoiceMode: () => void;
}

export function ChatSimulator({ api, onOpenVoiceMode }: ChatSimulatorProps) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState("test_user_001");
  const [language, setLanguage] = useState<"ka" | "en">("ka");
  const [messages, setMessages] = useState<ExternalChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extractedParams, setExtractedParams] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const player = useAudioPlayer();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = useCallback(async () => {
    if (!api.apiKey) {
      toast.error(language === "ka" ? "API Key შეიყვანეთ" : "Enter API Key first");
      setSettingsOpen(true);
      return;
    }
    try {
      const msgs = await api.getChatHistory(userId);
      setMessages(msgs);
      const u = await api.getUsage(userId);
      setUsage(u);
    } catch {}
  }, [api, userId, language]);

  const handleSendText = useCallback(async (textOverride?: string) => {
    const text = textOverride || inputText;
    if (!text.trim() || !api.apiKey || isLoading) {
      if (!api.apiKey) {
        toast.error(language === "ka" ? "API Key შეიყვანეთ" : "Enter API Key first");
        setSettingsOpen(true);
      }
      return;
    }
    setIsLoading(true);
    try {
      const userMsg: ExternalChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (!textOverride) setInputText("");

      const res = await api.sendMessage(userId, text, language, null);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setUsage(res.usage);
        if ((res as any).extracted_params) {
          setExtractedParams((prev) => ({ ...prev, ...(res as any).extracted_params }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, api, userId, language, isLoading]);

  const handlePlayAudio = useCallback(async (msg: ExternalChatMessage) => {
    if (msg.audio_url) {
      player.toggle(msg.audio_url);
    } else {
      try {
        const res = await api.generateAudio(userId, msg.id, language);
        if (res.success && res.audio_url) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, audio_url: res.audio_url, audio_duration_seconds: res.audio_duration_seconds }
                : m
            )
          );
          player.play(res.audio_url);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [api, userId, language, player]);

  const handleClear = useCallback(async () => {
    if (!api.apiKey) return;
    await api.clearHistory(userId);
    setMessages([]);
    setExtractedParams(null);
    setSettingsOpen(false);
  }, [api, userId]);

  const handleSuggestion = useCallback((message: string) => {
    handleSendText(message);
  }, [handleSendText]);

  // Handle voice mode messages (called from parent)
  const addVoiceMessages = useCallback(
    (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => {
      setMessages((prev) => [...prev, ...(userMsg ? [userMsg] : []), assistantMsg]);
    },
    []
  );

  const showWelcome = messages.length === 0;

  return (
    <>
      <Card className="flex flex-col h-[calc(100vh-8rem)] md:h-[700px] overflow-hidden">
        <ChatHeader
          language={language}
          onToggleLanguage={() => setLanguage((l) => (l === "ka" ? "en" : "ka"))}
          onOpenSettings={() => setSettingsOpen(true)}
          usage={usage}
          extractedParams={extractedParams}
        />

        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {showWelcome ? (
            <WelcomeScreen language={language} onSuggestion={handleSuggestion} />
          ) : (
            <>
              {messages.map((msg) =>
                msg.message_type === "toast" && msg.role === "assistant" ? (
                  <ToastCard
                    key={msg.id}
                    message={msg}
                    onPlay={() => handlePlayAudio(msg)}
                    isPlaying={player.isPlaying && !!msg.audio_url}
                  />
                ) : (
                  <ChatBubble key={msg.id} message={msg} />
                )
              )}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input bar */}
        <div className="p-3 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 flex-shrink-0 text-primary hover:bg-primary/10"
              onClick={onOpenVoiceMode}
              title={language === "ka" ? "ხმოვანი რეჟიმი" : "Voice Mode"}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "ka" ? "დაწერეთ შეტყობინება..." : "Type a message..."}
              className="h-9 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
              onClick={() => handleSendText()}
              disabled={isLoading || !inputText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiKey={api.apiKey}
        onApiKeyChange={api.setApiKey}
        userId={userId}
        onUserIdChange={setUserId}
        onClearHistory={handleClear}
        onLoadHistory={loadHistory}
        language={language}
      />
    </>
  );
}
