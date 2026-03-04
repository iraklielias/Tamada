
-- 1. Attach all database triggers (idempotent)
DROP TRIGGER IF EXISTS trg_favorite_added ON public.user_favorites;
DROP TRIGGER IF EXISTS trg_favorite_removed ON public.user_favorites;
DROP TRIGGER IF EXISTS trg_custom_toast_saved ON public.custom_toasts;
DROP TRIGGER IF EXISTS trg_feast_toast_completed ON public.feast_toasts;
DROP TRIGGER IF EXISTS trg_ai_generation_logged ON public.ai_generation_log;

CREATE TRIGGER trg_favorite_added
  AFTER INSERT ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_added();

CREATE TRIGGER trg_favorite_removed
  AFTER DELETE ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_removed();

CREATE TRIGGER trg_custom_toast_saved
  AFTER INSERT ON public.custom_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_custom_toast_saved();

CREATE TRIGGER trg_feast_toast_completed
  AFTER UPDATE ON public.feast_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_feast_toast_completed();

CREATE TRIGGER trg_ai_generation_logged
  AFTER INSERT ON public.ai_generation_log
  FOR EACH ROW EXECUTE FUNCTION public.on_ai_generation_logged();

-- 2. Enable realtime on feast tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feasts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_toasts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_guests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Fix RLS policies on toasts table: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "toasts_select_system" ON public.toasts;
DROP POLICY IF EXISTS "toasts_select_own" ON public.toasts;

CREATE POLICY "toasts_select_system" ON public.toasts
  FOR SELECT TO authenticated
  USING (is_system = true);

CREATE POLICY "toasts_select_own" ON public.toasts
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

-- 4. Fix restrictive INSERT policies on feast_collaborators
DROP POLICY IF EXISTS "collaborators_insert" ON public.feast_collaborators;
DROP POLICY IF EXISTS "collaborators_self_insert" ON public.feast_collaborators;

CREATE POLICY "collaborators_insert" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (is_feast_host(feast_id, auth.uid()));

CREATE POLICY "collaborators_self_insert" ON public.feast_collaborators
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
