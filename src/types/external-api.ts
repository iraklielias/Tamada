export interface ExternalChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  message_type: "text" | "toast" | "error" | "system";
  metadata?: Record<string, unknown>;
  audio_url?: string | null;
  audio_duration_seconds?: number | null;
  created_at: string;
}

export interface ChatMessageRequest {
  action: "chat_message";
  external_user_id: string;
  message: string;
  language?: "ka" | "en";
  mode?: "text" | "voice";
  quick_params?: QuickParams | null;
}

export interface ChatMessageVoiceRequest {
  action: "chat_message_voice";
  external_user_id: string;
  audio_base64: string;
  audio_format?: string;
  language?: "ka" | "en";
  quick_params?: QuickParams | null;
}

export interface GenerateAudioRequest {
  action: "generate_audio";
  external_user_id: string;
  message_id: string;
  language?: "ka" | "en";
}

export interface QuickParams {
  occasion_type?: string;
  formality_level?: string;
  tone?: string;
  region?: string;
  person_name?: string;
  person_details?: string;
}

export interface ChatResponse {
  success: boolean;
  message: ExternalChatMessage;
  usage: UsageInfo;
}

export interface VoiceChatResponse extends ChatResponse {
  transcription?: {
    original_audio_text: string;
    language_detected: string;
  };
}

export interface AudioResponse {
  success: boolean;
  audio_url: string;
  audio_duration_seconds: number;
}

export interface UsageInfo {
  used_today: number;
  daily_limit: number;
  remaining: number;
  voice_used_today?: number;
  total_tokens_today?: number;
  total_audio_seconds_today?: number;
}

export interface ApiKeyInfo {
  id: string;
  key_prefix: string;
  client_name: string;
  client_id: string;
  is_active: boolean;
  daily_limit_per_user: number;
  created_at: string;
  expires_at?: string | null;
  last_used_at?: string | null;
}

export interface ApiInspectorEntry {
  id: string;
  method: string;
  action: string;
  status: number;
  timestamp: Date;
  duration: number;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  subEntries?: { label: string; status: "pending" | "done" | "error"; duration?: number }[];
}
