
-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  region TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'master')),
  preferred_language TEXT DEFAULT 'ka' CHECK (preferred_language IN ('ka', 'en')),
  typical_occasions TEXT[],
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CUSTOM TOASTS (defined before user_favorites for FK)
-- ============================================
CREATE TABLE public.custom_toasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ka TEXT,
  title_en TEXT,
  body_ka TEXT NOT NULL,
  body_en TEXT,
  occasion_type TEXT,
  tags TEXT[],
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_generation_params JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_custom_toasts_updated_at
  BEFORE UPDATE ON public.custom_toasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TOAST LIBRARY
-- ============================================
CREATE TABLE public.toasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ka TEXT NOT NULL,
  title_en TEXT,
  body_ka TEXT NOT NULL,
  body_en TEXT,
  occasion_type TEXT NOT NULL,
  region TEXT,
  toast_order_position INTEGER,
  formality_level TEXT CHECK (formality_level IN ('formal', 'semi_formal', 'casual')),
  tags TEXT[],
  is_system BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOAST TEMPLATES
-- ============================================
CREATE TABLE public.toast_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ka TEXT NOT NULL,
  name_en TEXT,
  occasion_type TEXT NOT NULL,
  region TEXT,
  formality_level TEXT CHECK (formality_level IN ('formal', 'semi_formal', 'casual')),
  toast_sequence JSONB NOT NULL,
  estimated_duration_minutes INTEGER,
  is_system BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER FAVORITES
-- ============================================
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  toast_id UUID REFERENCES public.toasts(id) ON DELETE CASCADE,
  custom_toast_id UUID REFERENCES public.custom_toasts(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT favorite_one_type CHECK (
    (toast_id IS NOT NULL AND custom_toast_id IS NULL) OR
    (toast_id IS NULL AND custom_toast_id IS NOT NULL)
  )
);

-- ============================================
-- FEASTS
-- ============================================
CREATE TABLE public.feasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  occasion_type TEXT NOT NULL,
  formality_level TEXT CHECK (formality_level IN ('formal', 'semi_formal', 'casual')) DEFAULT 'formal',
  guest_count INTEGER,
  estimated_duration_minutes INTEGER NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  share_code TEXT UNIQUE,
  region TEXT,
  notes TEXT,
  template_id UUID REFERENCES public.toast_templates(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_feasts_updated_at
  BEFORE UPDATE ON public.feasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FEAST TOAST SCHEDULE
-- ============================================
CREATE TABLE public.feast_toasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_id UUID NOT NULL REFERENCES public.feasts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  toast_type TEXT NOT NULL,
  title_ka TEXT NOT NULL,
  title_en TEXT,
  description_ka TEXT,
  description_en TEXT,
  scheduled_time_offset_minutes INTEGER,
  actual_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 5,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'skipped')) DEFAULT 'pending',
  assigned_toast_id UUID REFERENCES public.toasts(id),
  assigned_custom_toast_id UUID REFERENCES public.custom_toasts(id),
  alaverdi_assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEAST GUESTS
-- ============================================
CREATE TABLE public.feast_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_id UUID NOT NULL REFERENCES public.feasts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('guest', 'mejavare', 'honored_guest', 'family')) DEFAULT 'guest',
  seat_position INTEGER,
  alaverdi_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CO-TAMADA ACCESS
-- ============================================
CREATE TABLE public.feast_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feast_id UUID NOT NULL REFERENCES public.feasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('mejavare', 'viewer')) DEFAULT 'mejavare',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feast_id, user_id)
);

-- ============================================
-- AI GENERATION LOG
-- ============================================
CREATE TABLE public.ai_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  input_params JSONB NOT NULL,
  output_text TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_toasts_occasion ON public.toasts(occasion_type);
CREATE INDEX idx_toasts_region ON public.toasts(region);
CREATE INDEX idx_toasts_order ON public.toasts(toast_order_position);
CREATE INDEX idx_feast_toasts_feast ON public.feast_toasts(feast_id);
CREATE INDEX idx_feast_toasts_position ON public.feast_toasts(feast_id, position);
CREATE INDEX idx_feast_guests_feast ON public.feast_guests(feast_id);
CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX idx_custom_toasts_user ON public.custom_toasts(user_id);
CREATE INDEX idx_feasts_host ON public.feasts(host_id);
CREATE INDEX idx_feasts_status ON public.feasts(status);
CREATE INDEX idx_feasts_share_code ON public.feasts(share_code);
CREATE INDEX idx_ai_log_user_date ON public.ai_generation_log(user_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toast_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_toasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feast_toasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feast_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feast_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Toasts: system toasts readable by all authenticated, user toasts by creator
CREATE POLICY toasts_select_system ON public.toasts FOR SELECT TO authenticated USING (is_system = TRUE);
CREATE POLICY toasts_select_own ON public.toasts FOR SELECT USING (created_by = auth.uid());
CREATE POLICY toasts_insert_own ON public.toasts FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY toasts_update_own ON public.toasts FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY toasts_delete_own ON public.toasts FOR DELETE USING (created_by = auth.uid());

-- Toast templates: readable by all authenticated
CREATE POLICY templates_select ON public.toast_templates FOR SELECT TO authenticated USING (TRUE);

-- User favorites
CREATE POLICY favorites_select ON public.user_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY favorites_insert ON public.user_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY favorites_update ON public.user_favorites FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY favorites_delete ON public.user_favorites FOR DELETE USING (user_id = auth.uid());

-- Custom toasts
CREATE POLICY custom_toasts_select ON public.custom_toasts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY custom_toasts_insert ON public.custom_toasts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY custom_toasts_update ON public.custom_toasts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY custom_toasts_delete ON public.custom_toasts FOR DELETE USING (user_id = auth.uid());

-- Feasts: host + collaborators can read, host can modify
CREATE POLICY feasts_select ON public.feasts FOR SELECT USING (
  host_id = auth.uid() OR
  id IN (SELECT feast_id FROM public.feast_collaborators WHERE user_id = auth.uid())
);
CREATE POLICY feasts_insert ON public.feasts FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY feasts_update ON public.feasts FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY feasts_delete ON public.feasts FOR DELETE USING (host_id = auth.uid());

-- Feast toasts: readable if feast accessible, modifiable by host
CREATE POLICY feast_toasts_select ON public.feast_toasts FOR SELECT USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid()) OR
  feast_id IN (SELECT feast_id FROM public.feast_collaborators WHERE user_id = auth.uid())
);
CREATE POLICY feast_toasts_insert ON public.feast_toasts FOR INSERT WITH CHECK (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY feast_toasts_update ON public.feast_toasts FOR UPDATE USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY feast_toasts_delete ON public.feast_toasts FOR DELETE USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);

-- Feast guests: same pattern
CREATE POLICY feast_guests_select ON public.feast_guests FOR SELECT USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid()) OR
  feast_id IN (SELECT feast_id FROM public.feast_collaborators WHERE user_id = auth.uid())
);
CREATE POLICY feast_guests_insert ON public.feast_guests FOR INSERT WITH CHECK (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY feast_guests_update ON public.feast_guests FOR UPDATE USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY feast_guests_delete ON public.feast_guests FOR DELETE USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);

-- Feast collaborators
CREATE POLICY collaborators_select ON public.feast_collaborators FOR SELECT USING (
  user_id = auth.uid() OR
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY collaborators_insert ON public.feast_collaborators FOR INSERT WITH CHECK (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);
CREATE POLICY collaborators_delete ON public.feast_collaborators FOR DELETE USING (
  feast_id IN (SELECT id FROM public.feasts WHERE host_id = auth.uid())
);

-- AI log
CREATE POLICY ai_log_select ON public.ai_generation_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY ai_log_insert ON public.ai_generation_log FOR INSERT WITH CHECK (user_id = auth.uid());

-- Subscriptions
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY subscriptions_insert ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY subscriptions_update ON public.subscriptions FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.get_daily_ai_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM public.ai_generation_log
  WHERE user_id = p_user_id
    AND created_at >= (CURRENT_DATE)::TIMESTAMPTZ;
$$;

CREATE OR REPLACE FUNCTION public.increment_alaverdi(p_guest_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.feast_guests
  SET alaverdi_count = alaverdi_count + 1
  WHERE id = p_guest_id;
$$;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKET FOR AVATARS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
