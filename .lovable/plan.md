

# Comprehensive Audit + Execution Plan

## Three Requests Addressed

1. **Drag-and-drop toast reordering** in FeastDetailPage
2. **Upgrade `generate-feast-plan` to use the sophisticated Tamada AI system prompt** (same cultural depth as `tamada-ai`)
3. **Full product audit** — all remaining leaks and integration gaps

---

## Remaining Leaks Found

### A. Database (Still Broken)

| Issue | Detail |
|-------|--------|
| **DB Triggers still not attached** | The `<db-triggers>` section says "There are no triggers in the database" — meaning the previous migration to create triggers either failed or wasn't applied. The 5 trigger functions exist but are NOT connected to any tables. The entire adaptive learning pipeline is dead. |
| **Toasts RLS still restrictive** | `toasts_select_system` and `toasts_select_own` are both `Permissive: No`. Two restrictive SELECT policies = AND logic. Users can only see system toasts they also created (impossible). The previous migration to fix this was apparently not applied or failed. |
| **Collaborator INSERT still restrictive** | `collaborators_insert_host` and `collaborators_insert_self` are both `Permissive: No`. A joining user cannot satisfy both. The feast join flow is still broken. |
| **`feasts_select_by_share_code` is restrictive** | The share code lookup policy was created but also as restrictive. Combined with `feasts_select`, a non-host/non-collaborator still can't look up by share code because they must also satisfy `feasts_select` (host OR collaborator). |

### B. `generate-feast-plan` Uses a Trivial Prompt

The edge function uses a simple generic prompt ("You are an expert Georgian Tamada...") instead of the rich 11-layer `SYSTEM_PROMPT` from `tamada-ai`. It also:
- Does not load user profile or AI knowledge
- Does not authenticate the user or check rate limits
- Does not log to `ai_generation_log`
- Uses a different model (`gemini-3-flash-preview` vs `gemini-2.5-flash`)
- Returns different `toast_type` values (`mandatory`, `traditional`, `custom`) than the canonical `ToastType` enum in `types/index.ts` (`god`, `homeland`, `parents`, etc.)

### C. Feature Integration Gaps

| Gap | Pages Affected |
|-----|----------------|
| **FavoritesPage has no detail dialog** | Click does nothing — can only delete, can't read full text |
| **FavoritesPage doesn't use i18n** — hardcoded Georgian strings | `FavoritesPage.tsx` |
| **FavoritesPage has limited occasion labels** — only 6 hardcoded, missing many | `FavoritesPage.tsx` line 48-51 |
| **Library "Use template" doesn't preselect the template** — passes `?template=occasion_type` but `NewFeastPage` only reads this to set `occasionType`, not to auto-select the matching template | `LibraryPage` → `NewFeastPage` |
| **OnboardingWizard uses `corporate`** but `NewFeastPage` and `ToastsPage` use `business` | Still inconsistent |
| **No `supra` in OnboardingWizard occasions** | Missing the core occasion type |
| **Dashboard "Popular Toasts" link goes to `/library`** not `/toasts`** | Confusing navigation |
| **Profile page not internationalized** — all Georgian hardcoded | `ProfilePage.tsx` |
| **FeastsPage missing `pb-24`** for bottom nav | Content hidden under bottom nav on mobile |
| **No toast content in FeastDetailPage toast cards** — only shows title/description, no `body_ka` from linked `toasts` table | Same gap as LiveFeastPage had |

### D. AI Integration Gaps

| Gap | Detail |
|-----|--------|
| **Feedback/edit delta not logged to `ai_generation_log`** | `submit_feedback` and `analyze_edit_delta` actions in `tamada-ai` return early without creating log entries. Telemetry dashboard has no visibility into these signals. |
| **`tamada-ai` uses `gemini-2.5-flash`** but best practice says to use `gemini-3-flash-preview` as default | Model mismatch |

---

## Execution Plan

### Task 1: Fix Database — Triggers, RLS, and Realtime (Migration)

Create a single migration that:
1. **Drop and recreate ALL feast/toast RLS policies as PERMISSIVE** — `toasts_select_system`, `toasts_select_own`, `feasts_select`, `feasts_select_by_share_code`, `collaborators_insert_host`, `collaborators_insert_self`
2. **Attach the 5 triggers** to their tables (with `IF NOT EXISTS` guards)
3. **Enable realtime** on `feasts`, `feast_toasts`, `feast_guests` (idempotent)

### Task 2: Upgrade `generate-feast-plan` Edge Function

Rewrite to:
- Use the full Tamada AI system prompt (from `tamada-ai`)
- Load user profile and AI knowledge for personalization
- Authenticate the user and check rate limits
- Log to `ai_generation_log`
- Use canonical `ToastType` values (`god`, `homeland`, `parents`, etc.) instead of generic ones
- Use `google/gemini-3-flash-preview` model
- Include guest names, region, and occasion-specific protocols in the prompt
- Return richer toast objects with proper `description_ka`/`description_en`

### Task 3: Add Drag-and-Drop Toast Reordering in FeastDetailPage

- Add move-up/move-down buttons on each toast card (simpler and more reliable than full drag-and-drop which requires a new dependency)
- On reorder, update `position` values for affected toasts in the database
- Optimistic UI update for instant feedback
- Only show reorder controls when feast is in `draft` status

### Task 4: Fix FavoritesPage — Add Detail Dialog, i18n, Full Occasion Labels

- Add the same `Dialog` pattern used on `ToastsPage` to expand and read full toast content
- Replace hardcoded Georgian strings with `t()` calls
- Use `t(\`feasts.occasion.\${type}\`)` instead of the limited hardcoded `occasionLabel` map

### Task 5: Fix Remaining Integration Gaps

In a single pass:
- **OnboardingWizard**: Add `supra` to OCCASIONS list, keep `corporate` (it's in the type union)
- **NewFeastPage**: Auto-select matching template when `?template=` is passed
- **Dashboard**: Change "Popular Toasts" link from `/library` to `/toasts`
- **FeastsPage**: Add `pb-24` for bottom nav
- **ProfilePage**: Internationalize with `t()` calls
- **`tamada-ai` edge function**: Log feedback and edit_delta to `ai_generation_log`; update model to `gemini-3-flash-preview`

### Task 6: Log Feedback/Edit Delta in `tamada-ai`

Add `ai_generation_log` inserts to the `submit_feedback` and `analyze_edit_delta` code paths so telemetry can see these signals.

---

## Implementation Order

1. **Task 1** (DB migration) — unblocks everything
2. **Task 2** (Feast plan AI upgrade) — core AI improvement
3. **Task 3** (Drag-and-drop reorder) — UX feature
4. **Task 4** (FavoritesPage fixes) — UX polish
5. **Task 5** (Integration gaps) — polish pass
6. **Task 6** (AI logging) — telemetry completeness

