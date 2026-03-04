
-- Drop existing triggers first, then recreate
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

-- Fix RLS: toasts SELECT → permissive
DROP POLICY IF EXISTS toasts_select_system ON public.toasts;
DROP POLICY IF EXISTS toasts_select_own ON public.toasts;

CREATE POLICY toasts_select_system ON public.toasts
  FOR SELECT TO authenticated USING (is_system = true);

CREATE POLICY toasts_select_own ON public.toasts
  FOR SELECT TO authenticated USING (created_by = auth.uid());

-- Fix RLS: feast_collaborators INSERT → permissive
DROP POLICY IF EXISTS collaborators_insert_host ON public.feast_collaborators;
DROP POLICY IF EXISTS collaborators_insert_self ON public.feast_collaborators;

CREATE POLICY collaborators_insert_host ON public.feast_collaborators
  FOR INSERT TO authenticated WITH CHECK (is_feast_host(feast_id, auth.uid()));

CREATE POLICY collaborators_insert_self ON public.feast_collaborators
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Fix RLS: feasts_select_by_share_code → permissive
DROP POLICY IF EXISTS feasts_select_by_share_code ON public.feasts;

CREATE POLICY feasts_select_by_share_code ON public.feasts
  FOR SELECT TO authenticated USING (share_code IS NOT NULL AND share_code <> '');

-- Enable realtime (ignore if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_toasts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_guests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
