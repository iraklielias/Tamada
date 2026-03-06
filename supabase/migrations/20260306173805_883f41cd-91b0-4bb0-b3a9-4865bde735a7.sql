
-- ============================================
-- API KEYS (for external integrations)
-- ============================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  daily_limit_per_user INTEGER DEFAULT 5,
  total_daily_limit INTEGER DEFAULT 10000,
  allowed_origins TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- ============================================
-- EXTERNAL CHAT SESSIONS
-- ============================================
CREATE TABLE public.external_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'ka',
  preferred_mode TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_key_id, external_user_id)
);

-- ============================================
-- EXTERNAL CHAT MESSAGES
-- ============================================
CREATE TABLE public.external_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.external_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  audio_url TEXT,
  audio_duration_seconds FLOAT,
  tokens_used INTEGER,
  generation_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXTERNAL USAGE TRACKING
-- ============================================
CREATE TABLE public.external_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER DEFAULT 0,
  voice_generation_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_audio_seconds FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_key_id, external_user_id, usage_date)
);

-- Indexes
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_ext_sessions_lookup ON public.external_chat_sessions(api_key_id, external_user_id);
CREATE INDEX idx_ext_messages_session ON public.external_chat_messages(session_id, created_at DESC);
CREATE INDEX idx_ext_messages_audio ON public.external_chat_messages(session_id) WHERE audio_url IS NOT NULL;
CREATE INDEX idx_ext_usage_lookup ON public.external_usage_tracking(api_key_id, external_user_id, usage_date);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_usage_tracking ENABLE ROW LEVEL SECURITY;

-- API keys: pro users can manage
CREATE POLICY api_keys_select ON public.api_keys FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);
CREATE POLICY api_keys_insert ON public.api_keys FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);
CREATE POLICY api_keys_update ON public.api_keys FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);
CREATE POLICY api_keys_delete ON public.api_keys FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);

-- Sessions: pro users can view
CREATE POLICY ext_sessions_select ON public.external_chat_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);

-- Messages: authenticated users can view (for testing dashboard)
CREATE POLICY ext_messages_select ON public.external_chat_messages FOR SELECT TO authenticated USING (TRUE);

-- Usage: pro users can view
CREATE POLICY ext_usage_select ON public.external_usage_tracking FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = TRUE)
);
