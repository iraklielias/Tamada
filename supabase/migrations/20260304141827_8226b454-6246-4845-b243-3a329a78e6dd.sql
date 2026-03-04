
-- ===== TASK 1: Attach all 5 trigger functions =====
-- Note: Postgres < 14 doesn't support CREATE TRIGGER IF NOT EXISTS,
-- so we use DROP TRIGGER IF EXISTS + CREATE TRIGGER.

-- 1. on_favorite_added
DROP TRIGGER IF EXISTS trg_on_favorite_added ON public.user_favorites;
CREATE TRIGGER trg_on_favorite_added
  AFTER INSERT ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_added();

-- 2. on_favorite_removed
DROP TRIGGER IF EXISTS trg_on_favorite_removed ON public.user_favorites;
CREATE TRIGGER trg_on_favorite_removed
  AFTER DELETE ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_removed();

-- 3. on_custom_toast_saved
DROP TRIGGER IF EXISTS trg_on_custom_toast_saved ON public.custom_toasts;
CREATE TRIGGER trg_on_custom_toast_saved
  AFTER INSERT ON public.custom_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_custom_toast_saved();

-- 4. on_feast_toast_completed
DROP TRIGGER IF EXISTS trg_on_feast_toast_completed ON public.feast_toasts;
CREATE TRIGGER trg_on_feast_toast_completed
  AFTER UPDATE ON public.feast_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_feast_toast_completed();

-- 5. on_ai_generation_logged
DROP TRIGGER IF EXISTS trg_on_ai_generation_logged ON public.ai_generation_log;
CREATE TRIGGER trg_on_ai_generation_logged
  AFTER INSERT ON public.ai_generation_log
  FOR EACH ROW EXECUTE FUNCTION public.on_ai_generation_logged();

-- ===== TASK 2: Fix RESTRICTIVE RLS policies =====

-- Fix toasts SELECT policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS toasts_select_system ON public.toasts;
DROP POLICY IF EXISTS toasts_select_own ON public.toasts;
CREATE POLICY "toasts_select_system" ON public.toasts FOR SELECT USING (is_system = true);
CREATE POLICY "toasts_select_own" ON public.toasts FOR SELECT USING (created_by = auth.uid());

-- Fix feast_collaborators INSERT policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS collaborators_insert_host ON public.feast_collaborators;
DROP POLICY IF EXISTS collaborators_insert_self ON public.feast_collaborators;
CREATE POLICY "collaborators_insert_host" ON public.feast_collaborators FOR INSERT WITH CHECK (is_feast_host(feast_id, auth.uid()));
CREATE POLICY "collaborators_insert_self" ON public.feast_collaborators FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix feasts SELECT by share_code: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS feasts_select_by_share_code ON public.feasts;
CREATE POLICY "feasts_select_by_share_code" ON public.feasts FOR SELECT USING ((share_code IS NOT NULL) AND (share_code <> ''::text));
