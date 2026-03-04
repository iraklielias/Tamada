
-- Create the user_ai_knowledge table for adaptive AI learning
CREATE TABLE public.user_ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  knowledge_type TEXT NOT NULL, -- 'preference_model', 'interaction_pattern', 'explicit_preference', 'person_context', 'style_fingerprint'
  knowledge_key TEXT NOT NULL,
  knowledge_value JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.5,
  signal_count INTEGER DEFAULT 1,
  last_reinforced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, knowledge_type, knowledge_key)
);

-- Enable RLS
ALTER TABLE public.user_ai_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own knowledge
CREATE POLICY "user_ai_knowledge_select" ON public.user_ai_knowledge
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_ai_knowledge_insert" ON public.user_ai_knowledge
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_ai_knowledge_update" ON public.user_ai_knowledge
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_ai_knowledge_delete" ON public.user_ai_knowledge
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Index for fast lookups
CREATE INDEX idx_user_ai_knowledge_user_type ON public.user_ai_knowledge(user_id, knowledge_type);
CREATE INDEX idx_user_ai_knowledge_confidence ON public.user_ai_knowledge(user_id, confidence_score DESC);

-- Updated_at trigger
CREATE TRIGGER update_user_ai_knowledge_updated_at
  BEFORE UPDATE ON public.user_ai_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
