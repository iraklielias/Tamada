import React, { useCallback } from "react";
import { FullVoiceMode } from "@/components/api-testing/FullVoiceMode";
import { useAuth } from "@/hooks/useAuth";
import { useInternalTamadaChat } from "@/hooks/useInternalTamadaChat";
import type { ExternalChatMessage } from "@/types/external-api";
import type { GeneratedToast } from "./types";

interface AIVoiceModeProps {
  language: "ka" | "en";
  onClose: () => void;
  onMessage: (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => void;
  onToastGenerated?: (toast: GeneratedToast) => void;
}

export function AIVoiceMode({ language, onClose, onMessage, onToastGenerated }: AIVoiceModeProps) {
  const { user } = useAuth();
  const chat = useInternalTamadaChat();

  const handleMessage = useCallback(
    (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => {
      // Track in chat history
      if (userMsg) chat.addMessage(userMsg);
      chat.addMessage(assistantMsg);

      // Check for toast in response
      if (assistantMsg.content.includes("===TOAST_START===") && onToastGenerated) {
        const toastMatch = assistantMsg.content.match(/===TOAST_START===\s*([\s\S]*?)\s*===TOAST_END===/);
        if (toastMatch) {
          onToastGenerated({
            title_ka: "სადღეგრძელო",
            body_ka: toastMatch[1].trim(),
            metadata: { generation_type: "voice_conversational" },
          });
        }
      }

      onMessage(userMsg, assistantMsg);
    },
    [chat, onMessage, onToastGenerated]
  );

  const handleParamsExtracted = useCallback((params: Record<string, unknown>) => {
    // Could be used to sync params back to form in future
    console.log("Voice params extracted:", params);
  }, []);

  return (
    <FullVoiceMode
      api={chat.voiceApi}
      userId={user?.id || "anonymous"}
      language={language}
      onClose={onClose}
      onMessage={handleMessage}
      onParamsExtracted={handleParamsExtracted}
    />
  );
}
