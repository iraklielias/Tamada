import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ExternalChatMessage, VoiceChatResponse } from "@/types/external-api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useInternalTamadaChat() {
  const [messages, setMessages] = useState<ExternalChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  const addMessage = useCallback((msg: ExternalChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    chatHistoryRef.current.push({ role: msg.role as "user" | "assistant", content: msg.content });
  }, []);

  const sendTextMessage = useCallback(
    async (text: string, language: "ka" | "en"): Promise<ExternalChatMessage> => {
      setIsLoading(true);

      // Add user message
      const userMsg: ExternalChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);

      try {
        const { data, error } = await supabase.functions.invoke("tamada-ai", {
          body: {
            action: "chat_generate",
            chat_messages: [...chatHistoryRef.current],
            language,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        const assistantMsg: ExternalChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          message_type: data.message_type || "text",
          metadata: { toast: data.toast, extracted_params: data.extracted_params },
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        return assistantMsg;
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  // Adapter matching useVoiceConversation's expected api.sendVoiceMessage signature
  const sendVoiceMessage = useCallback(
    async (
      _userId: string,
      audioBase64: string,
      language: string,
      format = "webm",
      _quickParams?: Record<string, string> | null
    ): Promise<VoiceChatResponse> => {
      const { data, error } = await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "chat_voice",
          audio_base64: audioBase64,
          audio_format: format,
          language,
          chat_messages: chatHistoryRef.current,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // History is managed by AIVoiceMode.handleMessage → addMessage
      // Do NOT push to chatHistoryRef here to avoid duplication

      return data as VoiceChatResponse;
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    chatHistoryRef.current = [];
  }, []);

  return {
    messages,
    isLoading,
    sendTextMessage,
    sendVoiceMessage,
    addMessage,
    clearMessages,
    // API adapter for useVoiceConversation compatibility
    voiceApi: {
      sendVoiceMessage,
      apiKey: "internal", // dummy — not used for internal auth
    },
  };
}
