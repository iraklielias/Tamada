

# Audit: User Knowledge Integration — Production Readiness

## Critical Problem Found

**All 6 database trigger functions exist but NONE of their triggers are actually created.** The functions `on_favorite_added`, `on_favorite_removed`, `on_custom_toast_saved`, `on_feast_toast_completed`, `on_ai_generation_logged`, and `handle_new_user` are defined but never wired to their tables. This means:

- Favoriting a toast does NOT learn occasion/region/formality preferences
- Saving an AI-generated toast does NOT learn length preferences
- Completing a feast toast does NOT learn toast type usage or occasion affinity
- AI generation logging does NOT update interaction pattern counts
- New user signups do NOT auto-create profiles (the `handle_new_user` function)

The only knowledge accumulation happening today is through the **explicit edge function calls** (`analyze_edit_delta`, `submit_feedback`) in `tamada-ai` — these bypass triggers and write directly. This is why only 4 knowledge rows exist across the entire system.

## What's Working

- `user_ai_knowledge` table schema, indexes, unique constraint, and RLS — all correct
- `upsert_ai_knowledge` RPC function with Bayesian confidence updates — correct
- `buildUserContextBlock` in both `tamada-ai` and `generate-feast-plan` — correctly loads and injects user knowledge into prompts
- Edge function actions `analyze_edit_delta` and `submit_feedback` — correctly write knowledge directly
- Knowledge grouping by type (`preference_model`, `style_fingerprint`, `explicit_preference`, `person_context`) — complete

## Fix: Single Database Migration

Create all 6 missing triggers in one migration:

```sql
-- 1. Profile auto-creation on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Learn from favorites
CREATE TRIGGER trg_favorite_added
  AFTER INSERT ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_added();

CREATE TRIGGER trg_favorite_removed
  AFTER DELETE ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.on_favorite_removed();

-- 3. Learn from saved AI toasts
CREATE TRIGGER trg_custom_toast_saved
  AFTER INSERT ON public.custom_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_custom_toast_saved();

-- 4. Learn from completed feast toasts
CREATE TRIGGER trg_feast_toast_completed
  AFTER UPDATE ON public.feast_toasts
  FOR EACH ROW EXECUTE FUNCTION public.on_feast_toast_completed();

-- 5. Track AI generation patterns
CREATE TRIGGER trg_ai_generation_logged
  AFTER INSERT ON public.ai_generation_log
  FOR EACH ROW EXECUTE FUNCTION public.on_ai_generation_logged();
```

**Important note:** The `auth.users` trigger may be blocked by the reserved schema restriction. If so, `handle_new_user` must remain as a Supabase Auth hook (it may already be configured via the dashboard). The other 5 triggers on public tables will work without issue.

## Execution

1. Run the migration to create all 6 triggers (attempt `auth.users` trigger, skip if blocked)
2. No code changes needed — all edge functions and frontend code are already correctly reading/writing knowledge

## Files Modified

| File | Change |
|------|--------|
| New migration SQL | Create 5-6 triggers wiring existing functions to tables |

