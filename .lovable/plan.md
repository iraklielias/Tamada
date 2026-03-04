

# Master Execution Plan — TAMADA Final Build

## Scope Overview

Three categories of work: (1) Model upgrade to `google/gemini-3-pro-preview`, (2) Critical DB infrastructure fixes (triggers + RLS + realtime), (3) Verification.

---

## Task 1: Upgrade AI Model to `google/gemini-3-pro-preview`

All three edge functions currently use `google/gemini-3-flash-preview`. Change to `google/gemini-3-pro-preview` for higher-quality toast generation.

**Files to edit (6 occurrences total):**

| File | Lines | Change |
|------|-------|--------|
| `supabase/functions/tamada-ai/index.ts` | L673, L733 | model + model_used |
| `supabase/functions/generate-feast-plan/index.ts` | L461, L563 | model + model_used |
| `supabase/functions/generate-toast/index.ts` | L163, L203 | model + model_used |

All instances of `"google/gemini-3-flash-preview"` → `"google/gemini-3-pro-preview"`.

---

## Task 2: Attach All DB Triggers (Migration)

**Problem:** All 5 adaptive learning trigger functions and `update_updated_at_column` exist but have zero triggers attached. The adaptive learning system is completely non-functional.

**Migration SQL — 10 triggers using `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`:**

| Trigger Name | Table | Event | Function |
|---|---|---|---|
| `trg_favorite_added` | `user_favorites` | AFTER INSERT | `on_favorite_added()` |
| `trg_favorite_removed` | `user_favorites` | AFTER DELETE | `on_favorite_removed()` |
| `trg_custom_toast_saved` | `custom_toasts` | AFTER INSERT | `on_custom_toast_saved()` |
| `trg_feast_toast_completed` | `feast_toasts` | AFTER UPDATE | `on_feast_toast_completed()` |
| `trg_ai_generation_logged` | `ai_generation_log` | AFTER INSERT | `on_ai_generation_logged()` |
| `trg_updated_at_profiles` | `profiles` | BEFORE UPDATE | `update_updated_at_column()` |
| `trg_updated_at_feasts` | `feasts` | BEFORE UPDATE | `update_updated_at_column()` |
| `trg_updated_at_custom_toasts` | `custom_toasts` | BEFORE UPDATE | `update_updated_at_column()` |
| `trg_updated_at_toasts` | `toasts` | BEFORE UPDATE | `update_updated_at_column()` |
| `trg_updated_at_user_ai_knowledge` | `user_ai_knowledge` | BEFORE UPDATE | `update_updated_at_column()` |

---

## Task 3: Fix RESTRICTIVE RLS Policies (Migration)

**Problem:** All policies are RESTRICTIVE (AND logic). Multiple SELECT policies on the same table require ALL to pass, which blocks legitimate access.

**Fix — Drop and recreate as PERMISSIVE (default):**

- **`feasts`**: Drop `feasts_select` + `feasts_select_by_share_code`, recreate both as PERMISSIVE so host OR collaborator OR share-code access works independently
- **`feast_collaborators`**: Drop `collaborators_insert_host` + `collaborators_insert_self`, recreate as PERMISSIVE so either host OR self can insert
- **`toasts`**: Drop `toasts_select_system` + `toasts_select_own`, recreate as PERMISSIVE so system toasts OR own toasts visible independently

---

## Task 4: Enable Realtime Publication (Migration)

**Problem:** `LiveFeastPage` subscribes to realtime channels but tables aren't in the publication.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_toasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feast_guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feasts;
```

---

## Execution Order

1. **Single migration** combining Tasks 2 + 3 + 4 (triggers, RLS, realtime)
2. **Edge function edits** for Task 1 (model upgrade across 3 files, deployed automatically)

## Files Modified

- `supabase/functions/tamada-ai/index.ts` — model upgrade
- `supabase/functions/generate-feast-plan/index.ts` — model upgrade
- `supabase/functions/generate-toast/index.ts` — model upgrade
- `supabase/migrations/` — new migration (triggers + RLS + realtime)

