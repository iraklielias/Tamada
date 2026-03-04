
-- ============================================================
-- ADAPTIVE LEARNING PIPELINE: Triggers & Functions
-- Updates user_ai_knowledge based on behavioral signals
-- ============================================================

-- Helper: Bayesian confidence update via UPSERT
CREATE OR REPLACE FUNCTION public.upsert_ai_knowledge(
  p_user_id UUID,
  p_type TEXT,
  p_key TEXT,
  p_value JSONB,
  p_signal_weight FLOAT DEFAULT 0.5
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_confidence FLOAT;
  v_old_count INT;
  v_new_confidence FLOAT;
BEGIN
  -- Try to get existing entry
  SELECT confidence_score, signal_count
  INTO v_old_confidence, v_old_count
  FROM public.user_ai_knowledge
  WHERE user_id = p_user_id
    AND knowledge_type = p_type
    AND knowledge_key = p_key;

  IF FOUND THEN
    -- Bayesian update: new_conf = (old_conf * old_count + signal_weight) / (old_count + 1)
    v_new_confidence := (v_old_confidence * v_old_count + p_signal_weight) / (v_old_count + 1);
    -- Clamp to [0, 1]
    v_new_confidence := GREATEST(0.0, LEAST(1.0, v_new_confidence));

    UPDATE public.user_ai_knowledge
    SET knowledge_value = p_value,
        confidence_score = v_new_confidence,
        signal_count = v_old_count + 1,
        last_reinforced_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND knowledge_type = p_type
      AND knowledge_key = p_key;
  ELSE
    INSERT INTO public.user_ai_knowledge (user_id, knowledge_type, knowledge_key, knowledge_value, confidence_score, signal_count)
    VALUES (p_user_id, p_type, p_key, p_value, p_signal_weight, 1);
  END IF;
END;
$$;

-- ============================================================
-- SIGNAL 1: TOAST FAVORITED (weight 0.8)
-- Extracts occasion_type and region from the favorited toast
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_favorite_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_occasion TEXT;
  v_region TEXT;
  v_formality TEXT;
  v_current JSONB;
BEGIN
  -- Get toast details (system toast or custom toast)
  IF NEW.toast_id IS NOT NULL THEN
    SELECT occasion_type, region, formality_level
    INTO v_occasion, v_region, v_formality
    FROM public.toasts WHERE id = NEW.toast_id;
  ELSIF NEW.custom_toast_id IS NOT NULL THEN
    SELECT occasion_type, NULL, NULL
    INTO v_occasion, v_region, v_formality
    FROM public.custom_toasts WHERE id = NEW.custom_toast_id;
  END IF;

  -- Update occasion preference
  IF v_occasion IS NOT NULL THEN
    -- Get current value or default
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = NEW.user_id AND knowledge_type = 'preference_model' AND knowledge_key = 'occasion_affinity';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[v_occasion],
      to_jsonb(COALESCE((v_current ->> v_occasion)::float, 0.0) + 0.1));

    PERFORM public.upsert_ai_knowledge(NEW.user_id, 'preference_model', 'occasion_affinity', v_current, 0.8);
  END IF;

  -- Update region affinity
  IF v_region IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = NEW.user_id AND knowledge_type = 'preference_model' AND knowledge_key = 'region_affinity';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[v_region],
      to_jsonb(COALESCE((v_current ->> v_region)::float, 0.0) + 0.15));

    PERFORM public.upsert_ai_knowledge(NEW.user_id, 'preference_model', 'region_affinity', v_current, 0.8);
  END IF;

  -- Update formality preference
  IF v_formality IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = NEW.user_id AND knowledge_type = 'preference_model' AND knowledge_key = 'formality_preference';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[v_formality],
      to_jsonb(COALESCE((v_current ->> v_formality)::float, 0.0) + 0.1));

    PERFORM public.upsert_ai_knowledge(NEW.user_id, 'preference_model', 'formality_preference', v_current, 0.8);
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- SIGNAL 2: FAVORITE REMOVED (weight 0.4 negative)
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_favorite_removed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_occasion TEXT;
  v_current JSONB;
BEGIN
  IF OLD.toast_id IS NOT NULL THEN
    SELECT occasion_type INTO v_occasion FROM public.toasts WHERE id = OLD.toast_id;
  ELSIF OLD.custom_toast_id IS NOT NULL THEN
    SELECT occasion_type INTO v_occasion FROM public.custom_toasts WHERE id = OLD.custom_toast_id;
  END IF;

  IF v_occasion IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = OLD.user_id AND knowledge_type = 'preference_model' AND knowledge_key = 'occasion_affinity';

    IF v_current IS NOT NULL THEN
      v_current := jsonb_set(v_current, ARRAY[v_occasion],
        to_jsonb(GREATEST(0.0, COALESCE((v_current ->> v_occasion)::float, 0.0) - 0.05)));

      PERFORM public.upsert_ai_knowledge(OLD.user_id, 'preference_model', 'occasion_affinity', v_current, 0.4);
    END IF;
  END IF;

  RETURN OLD;
END;
$$;

-- ============================================================
-- SIGNAL 3: CUSTOM TOAST SAVED (weight 0.7)
-- Learns from AI-generated toasts that users save
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_custom_toast_saved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current JSONB;
  v_word_count INT;
  v_len_pref TEXT;
BEGIN
  -- Only process AI-generated toasts
  IF NEW.is_ai_generated IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Learn length preference from saved toast
  v_word_count := array_length(regexp_split_to_array(COALESCE(NEW.body_ka, ''), '\s+'), 1);
  IF v_word_count < 60 THEN
    v_len_pref := 'short';
  ELSIF v_word_count < 150 THEN
    v_len_pref := 'medium';
  ELSE
    v_len_pref := 'long';
  END IF;

  PERFORM public.upsert_ai_knowledge(
    NEW.user_id,
    'preference_model',
    'length_preference',
    jsonb_build_object('preferred', v_len_pref, 'avg_word_count', v_word_count),
    0.7
  );

  -- Learn occasion preference
  IF NEW.occasion_type IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = NEW.user_id AND knowledge_type = 'preference_model' AND knowledge_key = 'occasion_affinity';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[NEW.occasion_type],
      to_jsonb(COALESCE((v_current ->> NEW.occasion_type)::float, 0.0) + 0.12));

    PERFORM public.upsert_ai_knowledge(NEW.user_id, 'preference_model', 'occasion_affinity', v_current, 0.7);
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- SIGNAL 4: FEAST TOAST COMPLETED (weight 0.9 — strongest)
-- A toast actually delivered at a real feast
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_feast_toast_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host_id UUID;
  v_occasion TEXT;
  v_region TEXT;
  v_current JSONB;
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get feast context
  SELECT host_id, occasion_type, region
  INTO v_host_id, v_occasion, v_region
  FROM public.feasts WHERE id = NEW.feast_id;

  IF v_host_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update toast_type usage for the host
  SELECT knowledge_value INTO v_current
  FROM public.user_ai_knowledge
  WHERE user_id = v_host_id AND knowledge_type = 'interaction_pattern' AND knowledge_key = 'toast_type_usage';

  v_current := COALESCE(v_current, '{}'::jsonb);
  v_current := jsonb_set(v_current, ARRAY[NEW.toast_type],
    to_jsonb(COALESCE((v_current ->> NEW.toast_type)::int, 0) + 1));

  PERFORM public.upsert_ai_knowledge(v_host_id, 'interaction_pattern', 'toast_type_usage', v_current, 0.9);

  -- Reinforce occasion affinity with strongest signal
  IF v_occasion IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = v_host_id AND knowledge_type = 'preference_model' AND knowledge_key = 'occasion_affinity';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[v_occasion],
      to_jsonb(COALESCE((v_current ->> v_occasion)::float, 0.0) + 0.2));

    PERFORM public.upsert_ai_knowledge(v_host_id, 'preference_model', 'occasion_affinity', v_current, 0.9);
  END IF;

  -- Reinforce region affinity
  IF v_region IS NOT NULL THEN
    SELECT knowledge_value INTO v_current
    FROM public.user_ai_knowledge
    WHERE user_id = v_host_id AND knowledge_type = 'preference_model' AND knowledge_key = 'region_affinity';

    v_current := COALESCE(v_current, '{}'::jsonb);
    v_current := jsonb_set(v_current, ARRAY[v_region],
      to_jsonb(COALESCE((v_current ->> v_region)::float, 0.0) + 0.2));

    PERFORM public.upsert_ai_knowledge(v_host_id, 'preference_model', 'region_affinity', v_current, 0.9);
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- SIGNAL 5: AI GENERATION LOGGED (weight 0.3 — passive)
-- Track generation patterns
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_ai_generation_logged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current JSONB;
  v_gen_type TEXT;
BEGIN
  v_gen_type := COALESCE(NEW.generation_type, 'generate_toast');

  -- Track generation count by type
  SELECT knowledge_value INTO v_current
  FROM public.user_ai_knowledge
  WHERE user_id = NEW.user_id AND knowledge_type = 'interaction_pattern' AND knowledge_key = 'generation_counts';

  v_current := COALESCE(v_current, '{"total": 0}'::jsonb);
  v_current := jsonb_set(v_current, ARRAY['total'],
    to_jsonb(COALESCE((v_current ->> 'total')::int, 0) + 1));
  v_current := jsonb_set(v_current, ARRAY[v_gen_type],
    to_jsonb(COALESCE((v_current ->> v_gen_type)::int, 0) + 1));

  PERFORM public.upsert_ai_knowledge(NEW.user_id, 'interaction_pattern', 'generation_counts', v_current, 0.3);

  RETURN NEW;
END;
$$;

-- ============================================================
-- CREATE TRIGGERS
-- ============================================================

CREATE TRIGGER trg_favorite_added
  AFTER INSERT ON public.user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.on_favorite_added();

CREATE TRIGGER trg_favorite_removed
  AFTER DELETE ON public.user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.on_favorite_removed();

CREATE TRIGGER trg_custom_toast_saved
  AFTER INSERT ON public.custom_toasts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_custom_toast_saved();

CREATE TRIGGER trg_feast_toast_completed
  AFTER UPDATE ON public.feast_toasts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_feast_toast_completed();

CREATE TRIGGER trg_ai_generation_logged
  AFTER INSERT ON public.ai_generation_log
  FOR EACH ROW
  EXECUTE FUNCTION public.on_ai_generation_logged();
