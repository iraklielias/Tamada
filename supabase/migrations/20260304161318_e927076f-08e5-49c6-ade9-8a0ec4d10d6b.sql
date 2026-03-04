-- Idempotent: drop and recreate all knowledge triggers

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
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.on_feast_toast_completed();

CREATE TRIGGER trg_ai_generation_logged
  AFTER INSERT ON public.ai_generation_log
  FOR EACH ROW EXECUTE FUNCTION public.on_ai_generation_logged();