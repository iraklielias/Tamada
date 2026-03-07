import { useState, useRef, useCallback, useEffect } from "react";
import { useVAD } from "./useVAD";
import type { ExternalChatMessage, VoiceChatResponse } from "@/types/external-api";

export type VoiceStage = "idle" | "listening" | "transcribing" | "thinking" | "speaking" | "error";

const MAX_RECORDING_DURATION_MS = 30000;

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
  const activeRef = useRef(false);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web Audio API refs for reliable cross-browser playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const vad = useVAD({
    silenceThreshold: 0.025,
    silenceDurationMs: 2000,
    speechThreshold: 0.045,
    onSilenceDetected: () => {
      if (stageRef.current === "listening" && mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    },
  });

  const clearMaxRecordingTimer = useCallback(() => {
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch {}
      sourceNodeRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  /** Ensure AudioContext exists and is unlocked. Call inside user gesture handlers. */
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!activeRef.current) return;
    setStage("listening");
    chunksRef.current = [];

    try {
      releaseStream();

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
        clearMaxRecordingTimer();
        if (!activeRef.current) return;

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          startListening();
          return;
        }

        setStage("transcribing");

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

              // Play response audio via Web Audio API
              if (res.message.audio_url && activeRef.current) {
                setStage("speaking");
                try {
                  const ctx = audioCtxRef.current!;
                  if (ctx.state === "suspended") await ctx.resume();

                  const response = await fetch(res.message.audio_url);
                  const arrayBuffer = await response.arrayBuffer();
                  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

                  if (!activeRef.current) return;

                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(ctx.destination);
                  sourceNodeRef.current = source;

                  source.onended = () => {
                    sourceNodeRef.current = null;
                    if (activeRef.current) startListening();
                  };

                  source.start(0);
                } catch (err) {
                  console.warn("Web Audio playback failed:", err);
                  if (activeRef.current) startListening();
                }
              } else if (activeRef.current) {
                startListening();
              }
            } else if (activeRef.current) {
              // Check if it's a "no speech" response — silently restart
              const errMsg = ((res as any).error || "").toLowerCase();
              if (errMsg.includes("no speech") || errMsg.includes("could not transcribe")) {
                startListening();
              } else {
                setStage("error");
              }
            }
          } catch (err: any) {
            console.error("Voice conversation error:", err);
            // If "no speech detected" 400, silently restart listening
            const msg = err?.message || "";
            if (msg.toLowerCase().includes("no speech") || msg.toLowerCase().includes("could not transcribe")) {
              if (activeRef.current) startListening();
              return;
            }
            if (activeRef.current) {
              setStage("error");
            }
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(250);

      maxRecordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_DURATION_MS);
    } catch (err) {
      console.error("Failed to start mic:", err);
      setStage("error");
      activeRef.current = false;
    }
  }, [api, userId, language, onMessage, onParamsExtracted, vad, clearMaxRecordingTimer, releaseStream]);

  const startSession = useCallback(async () => {
    ensureAudioContext();
    activeRef.current = true;
    await startListening();
  }, [startListening, ensureAudioContext]);

  const endSession = useCallback(() => {
    activeRef.current = false;
    vad.stopMonitoring();
    stopAudio();
    clearMaxRecordingTimer();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    releaseStream();
    mediaRecorderRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    sourceNodeRef.current = null;

    setStage("idle");
  }, [vad, stopAudio, clearMaxRecordingTimer, releaseStream]);

  const interrupt = useCallback(() => {
    stopAudio();
    if (activeRef.current) {
      startListening();
    }
  }, [stopAudio, startListening]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      vad.stopMonitoring();
      stopAudio();
      clearMaxRecordingTimer();
      releaseStream();
      audioCtxRef.current?.close();
    };
  }, []);

  const stopListening = useCallback(() => {
    ensureAudioContext();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [ensureAudioContext]);

  const retryFromError = useCallback(() => {
    if (activeRef.current) {
      startListening();
    } else {
      setStage("idle");
    }
  }, [startListening]);

  return { stage, startSession, endSession, interrupt, stopListening, retryFromError, getVolume: vad.getVolume };
}
