
-- TASK 2: Attach all 10 DB triggers

DROP TRIGGER IF EXISTS trg_favorite_added ON public.user_favorites;
CREATE TRIGGER trg_favorite_added AFTER INSERT ON public.user_favorites FOR EACH ROW EXECUTE FUNCTION public.on_favorite_added();

DROP TRIGGER IF EXISTS trg_favorite_removed ON public.user_favorites;
CREATE TRIGGER trg_favorite_removed AFTER DELETE ON public.user_favorites FOR EACH ROW EXECUTE FUNCTION public.on_favorite_removed();

DROP TRIGGER IF EXISTS trg_custom_toast_saved ON public.custom_toasts;
CREATE TRIGGER trg_custom_toast_saved AFTER INSERT ON public.custom_toasts FOR EACH ROW EXECUTE FUNCTION public.on_custom_toast_saved();

DROP TRIGGER IF EXISTS trg_feast_toast_completed ON public.feast_toasts;
CREATE TRIGGER trg_feast_toast_completed AFTER UPDATE ON public.feast_toasts FOR EACH ROW EXECUTE FUNCTION public.on_feast_toast_completed();

DROP TRIGGER IF EXISTS trg_ai_generation_logged ON public.ai_generation_log;
CREATE TRIGGER trg_ai_generation_logged AFTER INSERT ON public.ai_generation_log FOR EACH ROW EXECUTE FUNCTION public.on_ai_generation_logged();

DROP TRIGGER IF EXISTS trg_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at_feasts ON public.feasts;
CREATE TRIGGER trg_updated_at_feasts BEFORE UPDATE ON public.feasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at_custom_toasts ON public.custom_toasts;
CREATE TRIGGER trg_updated_at_custom_toasts BEFORE UPDATE ON public.custom_toasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at_toasts ON public.toasts;
CREATE TRIGGER trg_updated_at_toasts BEFORE UPDATE ON public.toasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at_user_ai_knowledge ON public.user_ai_knowledge;
CREATE TRIGGER trg_updated_at_user_ai_knowledge BEFORE UPDATE ON public.user_ai_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TASK 3: Fix RESTRICTIVE RLS → PERMISSIVE

DROP POLICY IF EXISTS "feasts_select" ON public.feasts;
DROP POLICY IF EXISTS "feasts_select_by_share_code" ON public.feasts;
CREATE POLICY "feasts_select" ON public.feasts FOR SELECT TO authenticated USING ((host_id = auth.uid()) OR is_feast_collaborator(id, auth.uid()));
CREATE POLICY "feasts_select_by_share_code" ON public.feasts FOR SELECT TO authenticated USING ((share_code IS NOT NULL) AND (share_code <> ''::text));

DROP POLICY IF EXISTS "collaborators_insert_host" ON public.feast_collaborators;
DROP POLICY IF EXISTS "collaborators_insert_self" ON public.feast_collaborators;
CREATE POLICY "collaborators_insert_host" ON public.feast_collaborators FOR INSERT TO authenticated WITH CHECK (is_feast_host(feast_id, auth.uid()));
CREATE POLICY "collaborators_insert_self" ON public.feast_collaborators FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "toasts_select_system" ON public.toasts;
DROP POLICY IF EXISTS "toasts_select_own" ON public.toasts;
CREATE POLICY "toasts_select_system" ON public.toasts FOR SELECT TO authenticated USING (is_system = true);
CREATE POLICY "toasts_select_own" ON public.toasts FOR SELECT TO authenticated USING (created_by = auth.uid());
