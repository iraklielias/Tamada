import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Mic } from "lucide-react";
import { JsonViewer } from "./JsonViewer";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

const ENDPOINTS = [
  {
    label: "POST chat_message",
    action: "chat_message",
    template: {
      action: "chat_message",
      external_user_id: "test_user_001",
      message: "მინდა სადღეგრძელო ქორწილისთვის",
      language: "ka",
      quick_params: { occasion_type: "wedding", formality_level: "formal" },
    },
  },
  {
    label: "POST chat_message_voice",
    action: "chat_message_voice",
    template: {
      action: "chat_message_voice",
      external_user_id: "test_user_001",
      audio_base64: "<record or paste>",
      audio_format: "webm",
      language: "ka",
    },
  },
  {
    label: "POST generate_audio",
    action: "generate_audio",
    template: {
      action: "generate_audio",
      external_user_id: "test_user_001",
      message_id: "<paste message UUID>",
      language: "ka",
    },
  },
  {
    label: "POST chat_history",
    action: "chat_history",
    template: { action: "chat_history", external_user_id: "test_user_001" },
  },
  {
    label: "DELETE clear_history",
    action: "clear_history",
    template: { action: "clear_history", external_user_id: "test_user_001" },
  },
  {
    label: "POST usage",
    action: "usage",
    template: { action: "usage", external_user_id: "test_user_001" },
  },
];

interface EndpointTesterProps {
  api: ReturnType<typeof import("@/hooks/useTamadaExternalApi").useTamadaExternalApi>;
}

export function EndpointTester({ api }: EndpointTesterProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(ENDPOINTS[0].action);
  const [body, setBody] = useState(JSON.stringify(ENDPOINTS[0].template, null, 2));
  const [response, setResponse] = useState<{ data: unknown; status: number; duration: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const recorder = useAudioRecorder();

  const handleSelect = (action: string) => {
    const ep = ENDPOINTS.find((e) => e.action === action);
    if (ep) {
      setSelected(action);
      setBody(JSON.stringify(ep.template, null, 2));
      setResponse(null);
    }
  };

  const handleSend = async () => {
    if (!api.apiKey) return;
    setIsLoading(true);
    try {
      const parsed = JSON.parse(body);
      const res = await api.callApi(parsed);
      setResponse(res);
    } catch (err) {
      setResponse({ data: { error: String(err) }, status: 0, duration: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecord = async () => {
    if (recorder.state === "idle") {
      await recorder.startRecording();
    } else if (recorder.state === "recording") {
      const base64 = await recorder.stopRecording();
      try {
        const parsed = JSON.parse(body);
        parsed.audio_base64 = base64;
        setBody(JSON.stringify(parsed, null, 2));
      } catch {}
      recorder.resetState();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={api.apiKey}
              onChange={(e) => api.setApiKey(e.target.value)}
              placeholder="API Key"
              type="password"
              className="h-8 text-xs font-mono"
            />
          </div>
          <Select value={selected} onValueChange={handleSelect}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENDPOINTS.map((ep) => (
                <SelectItem key={ep.action} value={ep.action} className="text-xs">
                  {ep.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono text-xs min-h-[200px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={isLoading || !api.apiKey} className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Send
            </Button>
            {selected === "chat_message_voice" && (
              <Button
                variant={recorder.state === "recording" ? "destructive" : "outline"}
                onClick={handleRecord}
              >
                <Mic className="h-4 w-4 mr-1" />
                {recorder.state === "recording" ? "Stop" : "Record"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 flex-row items-center justify-between">
          <CardTitle className="text-sm">Response</CardTitle>
          {response && (
            <Badge
              className={
                response.status >= 200 && response.status < 300
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-600"
              }
            >
              {response.status} • {response.duration}ms
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {response ? (
            <JsonViewer data={response.data} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              Send a request to see the response
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
