import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Key } from "lucide-react";
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
  language: "ka" | "en";
  onLanguageChange: (lang: "ka" | "en") => void;
  addVoiceMessagesRef?: React.RefObject<((userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => void) | null>;
}

export function ChatSimulator({ api, onOpenVoiceMode, language, onLanguageChange, addVoiceMessagesRef }: ChatSimulatorProps) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState("test_user_001");
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

  // Wire up voice message callback
  useEffect(() => {
    if (addVoiceMessagesRef) {
      (addVoiceMessagesRef as React.MutableRefObject<any>).current = (
        userMsg: ExternalChatMessage | null,
        assistantMsg: ExternalChatMessage
      ) => {
        setMessages((prev) => [...prev, ...(userMsg ? [userMsg] : []), assistantMsg]);
      };
    }
  }, [addVoiceMessagesRef]);

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
      toast.error(language === "ka" ? "შეცდომა მოხდა. სცადეთ თავიდან." : "Something went wrong. Please try again.");
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

  const showWelcome = messages.length === 0;
  const needsApiKey = !api.apiKey;

  return (
    <>
      <Card className="flex flex-col h-[100dvh] md:h-[700px] overflow-hidden rounded-none md:rounded-xl border-x-0 md:border-x">
        <ChatHeader
          language={language}
          onToggleLanguage={() => onLanguageChange(language === "ka" ? "en" : "ka")}
          onOpenSettings={() => setSettingsOpen(true)}
          onReset={handleClear}
          usage={usage}
          extractedParams={extractedParams}
          hasMessages={messages.length > 0}
        />

        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {needsApiKey ? (
            /* API Key first-run prompt */
            <div className="flex flex-col items-center justify-center h-full px-4 py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg">
                <Key className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-display font-bold text-foreground mb-1">
                {language === "ka" ? "API Key საჭიროა" : "API Key Required"}
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs mb-5">
                {language === "ka"
                  ? "შეიყვანეთ თქვენი API Key რომ დაიწყოთ თამადა AI-სთან საუბარი"
                  : "Enter your API Key to start chatting with Tamada AI"}
              </p>
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Input
                  type="password"
                  placeholder="tam_xxxxxxxxxxxx"
                  className="flex-1 h-10"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      api.setApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                  onChange={(e) => api.setApiKey(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3">
                {language === "ka" ? "ან გახსენით ⚙ პარამეტრები" : "Or open ⚙ Settings"}
              </p>
            </div>
          ) : showWelcome ? (
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
                    language={language}
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
              size="sm"
              variant="ghost"
              className="flex-shrink-0 text-primary hover:bg-primary/10 gap-1.5 px-2.5"
              onClick={onOpenVoiceMode}
              title={language === "ka" ? "ხმოვანი რეჟიმი — ხელისუფლებად საუბარი" : "Voice Mode — hands-free conversation"}
            >
              <Mic className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">{language === "ka" ? "ხმოვანი" : "Voice"}</span>
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "ka" ? "დაწერეთ შეტყობინება..." : "Type a message..."}
              className="h-9 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              disabled={needsApiKey}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
              onClick={() => handleSendText()}
              disabled={isLoading || !inputText.trim() || needsApiKey}
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
