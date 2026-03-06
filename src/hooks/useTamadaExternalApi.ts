import { useState, useCallback, useRef } from "react";
import type {
  ChatResponse,
  VoiceChatResponse,
  AudioResponse,
  ApiInspectorEntry,
  ExternalChatMessage,
} from "@/types/external-api";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tamada-external-api`;

export function useTamadaExternalApi() {
  const [apiKey, setApiKey] = useState("");
  const [inspectorLog, setInspectorLog] = useState<ApiInspectorEntry[]>([]);

  const addInspectorEntry = useCallback((entry: ApiInspectorEntry) => {
    setInspectorLog((prev) => [entry, ...prev]);
  }, []);

  const clearInspector = useCallback(() => setInspectorLog([]), []);

  const callApi = useCallback(
    async (body: Record<string, unknown>): Promise<{ data: Record<string, unknown>; status: number; duration: number }> => {
      const start = Date.now();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const duration = Date.now() - start;

      addInspectorEntry({
        id: crypto.randomUUID(),
        method: "POST",
        action: body.action as string,
        status: response.status,
        timestamp: new Date(),
        duration,
        request: body,
        response: data,
      });

      return { data, status: response.status, duration };
    },
    [apiKey, addInspectorEntry]
  );

  const sendMessage = useCallback(
    async (
      externalUserId: string,
      message: string,
      language: string,
      quickParams?: Record<string, string> | null
    ): Promise<ChatResponse> => {
      const { data } = await callApi({
        action: "chat_message",
        external_user_id: externalUserId,
        message,
        language,
        quick_params: quickParams || null,
      });
      return data as unknown as ChatResponse;
    },
    [callApi]
  );

  const sendVoiceMessage = useCallback(
    async (
      externalUserId: string,
      audioBase64: string,
      language: string,
      audioFormat = "webm",
      quickParams?: Record<string, string> | null
    ): Promise<VoiceChatResponse> => {
      const { data } = await callApi({
        action: "chat_message_voice",
        external_user_id: externalUserId,
        audio_base64: audioBase64,
        audio_format: audioFormat,
        language,
        quick_params: quickParams || null,
      });
      return data as unknown as VoiceChatResponse;
    },
    [callApi]
  );

  const generateAudio = useCallback(
    async (externalUserId: string, messageId: string, language: string): Promise<AudioResponse> => {
      const { data } = await callApi({
        action: "generate_audio",
        external_user_id: externalUserId,
        message_id: messageId,
        language,
      });
      return data as unknown as AudioResponse;
    },
    [callApi]
  );

  const getChatHistory = useCallback(
    async (externalUserId: string): Promise<ExternalChatMessage[]> => {
      const { data } = await callApi({
        action: "chat_history",
        external_user_id: externalUserId,
      });
      return ((data as any).messages || []) as ExternalChatMessage[];
    },
    [callApi]
  );

  const clearHistory = useCallback(
    async (externalUserId: string): Promise<void> => {
      await callApi({
        action: "clear_history",
        external_user_id: externalUserId,
      });
    },
    [callApi]
  );

  const getUsage = useCallback(
    async (externalUserId: string) => {
      const { data } = await callApi({
        action: "usage",
        external_user_id: externalUserId,
      });
      return (data as any).usage;
    },
    [callApi]
  );

  return {
    apiKey,
    setApiKey,
    inspectorLog,
    clearInspector,
    sendMessage,
    sendVoiceMessage,
    generateAudio,
    getChatHistory,
    clearHistory,
    getUsage,
    callApi,
  };
}
