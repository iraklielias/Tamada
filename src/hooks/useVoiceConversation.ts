import { useState, useRef, useCallback, useEffect } from "react";
import { useVAD } from "./useVAD";
import type { ExternalChatMessage, VoiceChatResponse } from "@/types/external-api";

export type VoiceStage = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

interface UseVoiceConversationOptions {
  api: {
    sendVoiceMessage: (
      userId: string,
      audioBase64: string,
      language: string,
      format?: string,
      quickParams?: Record<string, string> | null
    ) => Promise<VoiceChatResponse>;
    apiKey: string;
  };
  userId: string;
  language: "ka" | "en";
  onMessage: (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => void;
  onParamsExtracted?: (params: Record<string, unknown>) => void;
}

export function useVoiceConversation({ api, userId, language, onMessage, onParamsExtracted }: UseVoiceConversationOptions) {
  const [stage, setStage] = useState<VoiceStage>("idle");
  const stageRef = useRef<VoiceStage>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef(false);

  // Keep stageRef in sync
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const vad = useVAD({
    silenceThreshold: 0.008,
    silenceDurationMs: 1800,
    onSilenceDetected: () => {
      if (stageRef.current === "listening" && mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    },
  });

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!activeRef.current) return;
    setStage("listening");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      vad.startMonitoring(stream);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        vad.stopMonitoring();
        if (!activeRef.current) return;

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          // Too short, restart listening
          startListening();
          return;
        }

        setStage("transcribing");

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          if (!base64) {
            startListening();
            return;
          }

          setStage("thinking");

          try {
            const res = await api.sendVoiceMessage(userId, base64, language, "webm", null);
            if (!activeRef.current) return;

            if (res.success) {
              const userMsg: ExternalChatMessage | null = res.transcription
                ? {
                    id: crypto.randomUUID(),
                    role: "user",
                    content: res.transcription.original_audio_text,
                    message_type: "text",
                    created_at: new Date().toISOString(),
                  }
                : null;

              onMessage(userMsg, res.message);

              if ((res as any).extracted_params) {
                onParamsExtracted?.((res as any).extracted_params);
              }

              // Play audio response
              if (res.message.audio_url && activeRef.current) {
                setStage("speaking");
                const audio = new Audio(res.message.audio_url);
                audioRef.current = audio;
                audio.onended = () => {
                  if (activeRef.current) startListening();
                };
                audio.onerror = () => {
                  if (activeRef.current) startListening();
                };
                await audio.play().catch(() => {
                  if (activeRef.current) startListening();
                });
              } else if (activeRef.current) {
                startListening();
              }
            } else if (activeRef.current) {
              startListening();
            }
          } catch (err) {
            console.error("Voice conversation error:", err);
            if (activeRef.current) startListening();
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(250);
    } catch (err) {
      console.error("Failed to start mic:", err);
      setStage("idle");
      activeRef.current = false;
    }
  }, [api, userId, language, onMessage, onParamsExtracted, vad]);

  const startSession = useCallback(async () => {
    activeRef.current = true;
    await startListening();
  }, [startListening]);

  const endSession = useCallback(() => {
    activeRef.current = false;
    vad.stopMonitoring();
    stopAudio();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setStage("idle");
  }, [vad, stopAudio]);

  const interrupt = useCallback(() => {
    stopAudio();
    if (activeRef.current) {
      startListening();
    }
  }, [stopAudio, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      vad.stopMonitoring();
      stopAudio();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { stage, startSession, endSession, interrupt, getVolume: vad.getVolume };
}
