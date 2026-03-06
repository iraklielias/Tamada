import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Send, ChevronDown, Loader2, Volume2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChatBubble } from "./ChatBubble";
import { ToastCard } from "./ToastCard";
import { ApiInspector } from "./ApiInspector";
import { ProcessingStages } from "./ProcessingStages";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { ExternalChatMessage, UsageInfo } from "@/types/external-api";

interface ChatSimulatorProps {
  api: ReturnType<typeof import("@/hooks/useTamadaExternalApi").useTamadaExternalApi>;
}

const QUICK_CHIPS = [
  { label: "ქორწილი", occasion: "wedding" },
  { label: "დაბადების დღე", occasion: "birthday" },
  { label: "მეგობრობა", occasion: "friendly" },
  { label: "მშობლები", occasion: "supra" },
  { label: "სტუმარი", occasion: "guest" },
];

export function ChatSimulator({ api }: ChatSimulatorProps) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState("test_user_001");
  const [language, setLanguage] = useState<"ka" | "en">("ka");
  const [voiceMode, setVoiceMode] = useState(false);
  const [messages, setMessages] = useState<ExternalChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [quickParams, setQuickParams] = useState<Record<string, string>>({});
  const [voiceStage, setVoiceStage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recorder = useAudioRecorder();
  const player = useAudioPlayer();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    if (!api.apiKey) return;
    try {
      const msgs = await api.getChatHistory(userId);
      setMessages(msgs);
      const u = await api.getUsage(userId);
      setUsage(u);
    } catch {}
  };

  const handleSendText = async () => {
    if (!inputText.trim() || !api.apiKey || isLoading) return;
    setIsLoading(true);
    try {
      const userMsg: ExternalChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: inputText,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      const res = await api.sendMessage(userId, inputText, language, Object.keys(quickParams).length ? quickParams : null);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setUsage(res.usage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (occasion: string) => {
    const msg = language === "ka"
      ? `მინდა სადღეგრძელო - ${occasion}`
      : `I need a toast for ${occasion}`;
    setInputText(msg);
    setQuickParams({ ...quickParams, occasion_type: occasion });
  };

  const handleVoiceRecord = async () => {
    if (recorder.state === "idle") {
      try {
        await recorder.startRecording();
      } catch (err) {
        const msg = err instanceof Error && err.name === "NotAllowedError"
          ? "მიკროფონზე წვდომა უარყოფილია. შეამოწმეთ ბრაუზერის ნებართვები."
          : "მიკროფონის გაშვება ვერ მოხერხდა.";
        toast.error(msg);
        recorder.resetState();
        return;
      }
    } else if (recorder.state === "recording") {
      setIsLoading(true);
      setVoiceStage("transcribing");
      try {
        const audioBase64 = await recorder.stopRecording();
        setVoiceStage("thinking");
        const res = await api.sendVoiceMessage(userId, audioBase64, language, "webm", Object.keys(quickParams).length ? quickParams : null);

        if (res.success) {
          if (res.transcription) {
            const userMsg: ExternalChatMessage = {
              id: crypto.randomUUID(),
              role: "user",
              content: res.transcription.original_audio_text,
              message_type: "text",
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMsg]);
          }
          setMessages((prev) => [...prev, res.message]);
          setUsage(res.usage);

          // Auto-play audio in voice mode
          if (res.message.audio_url) {
            player.play(res.message.audio_url);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setVoiceStage(null);
        recorder.resetState();
      }
    }
  };

  const handlePlayAudio = async (msg: ExternalChatMessage) => {
    if (msg.audio_url) {
      player.toggle(msg.audio_url);
    } else {
      try {
        const res = await api.generateAudio(userId, msg.id, language);
        if (res.success && res.audio_url) {
          setMessages((prev) =>
            prev.map((m) => m.id === msg.id ? { ...m, audio_url: res.audio_url, audio_duration_seconds: res.audio_duration_seconds } : m)
          );
          player.play(res.audio_url);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClear = async () => {
    if (!api.apiKey) return;
    await api.clearHistory(userId);
    setMessages([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
      {/* Left: Chat */}
      <div className="flex-[3] flex flex-col">
        <Card className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-2">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-40 h-8 text-xs"
              placeholder="user_id"
            />
            <Input
              value={api.apiKey}
              onChange={(e) => api.setApiKey(e.target.value)}
              className="flex-1 min-w-[120px] h-8 text-xs font-mono"
              placeholder="API Key"
              type="password"
            />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={loadHistory}>
              {t("apiTesting.loadHistory")}
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-xs">{language === "ka" ? "KA" : "EN"}</Label>
              <Switch
                checked={language === "en"}
                onCheckedChange={(v) => setLanguage(v ? "en" : "ka")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">
                {voiceMode ? "🎙️" : "⌨️"}
              </Label>
              <Switch
                checked={voiceMode}
                onCheckedChange={setVoiceMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {usage && (
              <Badge variant="outline" className="text-xs">
                {usage.used_today}/{usage.daily_limit}
              </Badge>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleClear}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[500px]">
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
            {isLoading && voiceStage && <ProcessingStages stage={voiceStage} />}
            {isLoading && !voiceStage && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("apiTesting.generating")}
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input area */}
          <div className="p-3 border-t border-border space-y-2">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <Button
                  key={chip.occasion}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleQuickChip(chip.occasion)}
                >
                  {chip.label}
                </Button>
              ))}
            </div>

            {/* Advanced params */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                  <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                  Advanced Params
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {["occasion_type", "formality_level", "tone", "region", "person_name", "person_details"].map((key) => (
                  <Input
                    key={key}
                    placeholder={key}
                    value={quickParams[key] || ""}
                    onChange={(e) => setQuickParams({ ...quickParams, [key]: e.target.value })}
                    className="h-7 text-xs"
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Voice or text input */}
            {voiceMode ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Button
                  size="lg"
                  variant={recorder.state === "recording" ? "destructive" : "wine"}
                  className={`rounded-full w-16 h-16 ${recorder.state === "recording" ? "animate-pulse" : ""}`}
                  onClick={handleVoiceRecord}
                  disabled={isLoading}
                >
                  <Mic className="h-6 w-6" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {recorder.state === "recording"
                    ? "საუბრობთ… (დააჭირეთ შესაჩერებლად)"
                    : recorder.state === "processing"
                    ? "ვამუშავებ…"
                    : "დააჭირეთ სალაპარაკოდ"}
                </span>
                {/* Fallback text input */}
                <div className="flex w-full gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="ან დაწერეთ…"
                    className="h-8 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                  />
                  <Button size="sm" className="h-8" onClick={handleSendText} disabled={isLoading || !inputText.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={language === "ka" ? "დაწერეთ შეტყობინება..." : "Type a message..."}
                  className="h-9"
                  onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                />
                <Button className="h-9" onClick={handleSendText} disabled={isLoading || !inputText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right: Inspector */}
      <div className="flex-[2]">
        <ApiInspector entries={api.inspectorLog} onClear={api.clearInspector} />
      </div>
    </div>
  );
}
