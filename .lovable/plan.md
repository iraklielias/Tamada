

# Plan: Production-Grade Supra Flow — Full Audit and Fix

## Problems Identified

### 1. Fixed 8 toasts regardless of duration
The `generate-feast-plan` prompt says "fit within X minutes" but never explicitly instructs the AI to scale toast count by duration. A 4-hour wedding should have 12-15 toasts; a 1-hour casual gathering should have 5-6.

**Fix**: Add explicit toast count guidance to the prompt based on duration and occasion protocol ranges already defined in the system prompt.

### 2. Cannot add a toast between existing toasts (insert at position)
The manual "add toast" input always appends to the end (`position: length + 1`). No way to insert between position 3 and 4.

**Fix**: Add an "insert toast after" action on each toast card. When clicked, opens the add-toast form with the position pre-set. All subsequent toasts get their positions shifted up.

### 3. Cannot generate AI body for a manually-added toast
When a user adds a toast manually (just title + type), there's no way to generate the full body text for it. The "regenerate" button in the dialog calls `generate-feast-plan` with `single_toast_type`, which creates a new custom_toast and links it — this works, but the UX doesn't make it clear that this generates a body for an empty slot.

**Fix**: In the `ToastDetailDialog`, when `bodyKa` is null (no custom_toast or assigned_toast), show a prominent "Generate Toast Body" button instead of showing the regenerate button.

### 4. `generate-toast` edge function uses outdated model and no master system prompt
`generate-toast/index.ts` uses `google/gemini-2.5-flash` with a minimal one-line system prompt. It should use `google/gemini-3-flash-preview` and the master TAMADA AI system prompt.

**Fix**: Deprecate `generate-toast` — redirect its callers to use `tamada-ai` instead. The `tamada-ai` function already has the full master prompt and uses the correct model.

### 5. `generate-feast-plan` has its own separate system prompt, not the master
The feast plan function has `FEAST_PLAN_SYSTEM_PROMPT` (v3.0) which is a different, simpler prompt than the master `TAMADA AI CORE SYSTEM PROMPT (v1.0.0)` in `tamada-ai`. They should share the same base.

**Fix**: Merge the master system prompt layers (identity, cultural knowledge, anti-hallucination) into the feast plan function, then append the feast-plan-specific layers (plan structure, response format) as additional layers.

### 6. DB triggers still not attached
The `<db-triggers>` section shows "There are no triggers in the database." — the previous migration to attach them may have failed or not been applied.

**Fix**: Create a new migration that uses `CREATE TRIGGER IF NOT EXISTS` for all 5 trigger functions.

### 7. RLS policies still RESTRICTIVE
All policies still show `Permissive: No` — the previous migration to fix this also appears to not have been applied.

**Fix**: New migration to drop and recreate as PERMISSIVE for `toasts` SELECT, `feast_collaborators` INSERT, and `feasts` SELECT by share_code.

### 8. Model inconsistency
- `generate-toast`: uses `google/gemini-2.5-flash` (outdated)
- `tamada-ai`: uses `google/gemini-3-flash-preview` (correct)
- `generate-feast-plan`: uses `google/gemini-3-flash-preview` (correct)

**Fix**: Update `generate-toast` to use `google/gemini-3-flash-preview`, or better yet, deprecate it.

## Implementation

### Task 1: DB Migration — Triggers + RLS Fix
Create migration with:
- 5 `CREATE TRIGGER IF NOT EXISTS` statements
- Drop and recreate restrictive SELECT policies on `toasts`, restrictive INSERT policies on `feast_collaborators`, and restrictive SELECT policy `feasts_select_by_share_code` as PERMISSIVE

### Task 2: Unify System Prompt + Scale Toast Count
Update `generate-feast-plan/index.ts`:
- Replace `FEAST_PLAN_SYSTEM_PROMPT` with the full master prompt from `tamada-ai` (Layers 0-2: Identity, Cultural Knowledge, Anti-Hallucination)
- Append feast-plan-specific layers (plan structure, response format, occasion protocols) as additional layers
- Add explicit toast count instructions to the user prompt:
  - `"რაოდენობა: ${Math.max(5, Math.min(20, Math.round(duration_minutes / 15)))} სადღეგრძელო (მინიმუმ ${minToasts}, მაქსიმუმ ${maxToasts})"`
  - Map occasion to min/max ranges: wedding 10-15, memorial 6-8, birthday 8-12, supra 8-15, etc.

### Task 3: Upgrade `generate-toast` to use master prompt + correct model
Update `generate-toast/index.ts`:
- Change model to `google/gemini-3-flash-preview`
- Replace the minimal system prompt with the master TAMADA AI prompt (same as in `tamada-ai`)
- Add the full CORS headers

### Task 4: Insert Toast at Position + Generate Body for Empty Slots
Update `FeastDetailPage.tsx`:
- Add "Insert toast after" button on each toast card (visible to host in draft)
- When inserting, shift positions of all subsequent toasts
- In `ToastDetailDialog`, when `bodyKa` is null, show a prominent "Generate Body" CTA button that calls the single regen flow
- Make the manual add toast form include a toast_type selector

### Task 5: Add toast_type selector to manual add form
Currently manual add only takes a title. Add a `Select` for `toast_type` so the AI knows what type to generate when the user later clicks "Generate Body".

## Files Changed

1. `supabase/migrations/` — New migration for triggers + RLS
2. `supabase/functions/generate-feast-plan/index.ts` — Master prompt, toast count scaling
3. `supabase/functions/generate-toast/index.ts` — Model upgrade + master prompt
4. `src/pages/FeastDetailPage.tsx` — Insert at position, generate body for empty slots, toast_type selector

