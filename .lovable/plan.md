

# Plan: Full Toast Generation in Feast Plan + Supra Experience Audit

## What the User Wants

When the AI generates a feast plan, each toast slot should also get a **full toast text** (same quality as the standalone AI toast generator) — not just a title and brief description. The tamada should be able to read actual toast content during live mode.

## Current State

- `generate-feast-plan` returns: `title_ka`, `title_en`, `toast_type`, `duration_minutes`, `description_ka`, `description_en`
- These are **slot descriptions** ("what to say about"), NOT actual toasts
- `feast_toasts` table has `description_ka`/`description_en` (short) but no `body_ka`/`body_en` columns
- The only way to attach full toast text is via `assigned_toast_id` (→ `toasts` table) or `assigned_custom_toast_id` (→ `custom_toasts` table)
- In live mode, `description_ka` shows as the content — which is just a 1-sentence guidance note

## Architecture Decision

**Use `custom_toasts` as the storage for AI-generated feast toast bodies.** For each toast in the plan:
1. The edge function generates both the slot metadata AND the full toast body
2. Insert each full toast into `custom_toasts` (with `is_ai_generated = true`)
3. Link it to the `feast_toasts` row via `assigned_custom_toast_id`

This avoids schema changes and reuses existing infrastructure. Live mode already fetches `assigned_toast_id` body — we extend it to also fetch `assigned_custom_toast_id`.

## Implementation

### Task 1: Upgrade `generate-feast-plan` Edge Function

Rewrite the prompt to generate full toast texts alongside plan structure. Two-phase approach in one AI call:

- Update the system prompt to require `body_ka` and `body_en` fields in each toast object (full 3-5 sentence toast text, not just description)
- After parsing the AI response, for each toast:
  - Insert into `custom_toasts` with `user_id`, `body_ka`, `body_en`, `title_ka`, `occasion_type`, `is_ai_generated = true`
  - Use the returned `custom_toast_id` as `assigned_custom_toast_id` on the `feast_toasts` row
- The `description_ka`/`description_en` remain as brief guidance; `body_ka`/`body_en` live in `custom_toasts`

### Task 2: Update FeastDetailPage to Show Full Toast Body

- In the toast detail dialog, fetch `body_ka`/`body_en` from `custom_toasts` when `assigned_custom_toast_id` is set (same pattern as LiveFeastPage does for `assigned_toast_id`)
- Display the full body text in the dialog

### Task 3: Update LiveFeastPage to Fetch Custom Toast Body

- Extend the `assignedToastBody` query to also handle `assigned_custom_toast_id` → fetch from `custom_toasts` table
- Display `body_ka`/`body_en` as the delivery content for the tamada

### Task 4: Fix DB Triggers (Still Not Attached)

The trigger functions exist but are NOT connected to tables. Create a migration to:
- `CREATE TRIGGER IF NOT EXISTS trg_favorite_added AFTER INSERT ON user_favorites FOR EACH ROW EXECUTE FUNCTION on_favorite_added()`
- Same for `on_favorite_removed`, `on_custom_toast_saved`, `on_feast_toast_completed`, `on_ai_generation_logged`

### Task 5: Fix RLS Policies (Still Restrictive)

The `toasts` SELECT policies and `feast_collaborators` INSERT policies and `feasts_select_by_share_code` are all still RESTRICTIVE. Create a migration to drop and recreate them as PERMISSIVE.

---

## Remaining Supra Experience Leaks

| # | Leak | Impact |
|---|------|--------|
| 1 | **DB triggers not attached** — adaptive learning pipeline is dead | AI never learns from user behavior |
| 2 | **RLS still restrictive** — toasts SELECT, collaborator INSERT, feast share_code SELECT | Join feast flow broken, toast browsing broken for non-creators |
| 3 | **No toast body in feast plan** — only brief descriptions generated | Tamada has no content to read during live feast |
| 4 | **FeastDetailPage dialog shows no body text** — only description_ka/en | Can't preview actual toast content |
| 5 | **LiveFeastPage doesn't fetch custom_toast body** — only checks `assigned_toast_id`, not `assigned_custom_toast_id` | AI-generated feast toasts show no body |
| 6 | **No "regenerate single toast" in feast plan** — can only regenerate entire plan | Can't fix one bad toast without losing all |
| 7 | **No way to assign existing library toasts to feast slots** — can't browse toasts and link them | Limits reuse of curated content |
| 8 | **Guest notes not editable** — field exists but no edit UI | Can't add dietary/drinking preferences |
| 9 | **Alaverdi can't be unassigned** — once set, permanent | Mistakes can't be corrected |
| 10 | **No feast clone/duplicate** — can't reuse a successful plan | Common use case ignored |

## Execution Order

1. **Task 4 + 5** — DB migration (triggers + RLS) — unblocks everything
2. **Task 1** — Upgrade edge function with full toast generation
3. **Task 2 + 3** — Update FeastDetailPage + LiveFeastPage to show body text

