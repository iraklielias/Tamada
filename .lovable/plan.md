

# Comprehensive Audit: TAMADA Application — Leaks, Gaps, and Missing Pieces

After thorough analysis of the entire codebase, here is a systematic breakdown of every issue, categorized by severity and domain.

---

## 1. CRITICAL UX GAPS

### 1.1 Toasts Page — No "View More" / Detail View
**Problem**: `ToastsPage.tsx` shows toast body with `line-clamp-2`, but there is no way to expand or view the full text. Users see truncated content with no interaction to read the complete toast.
**Fix**: Add a Dialog or expandable card that shows full `body_ka`, `body_en`, delivery context, and occasion metadata when a toast card is clicked.

### 1.2 Dashboard Toast Cards — Not Clickable
**Problem**: `Dashboard.tsx` displays popular toasts but they are not clickable — no `onClick`, no navigation. Dead-end cards.
**Fix**: Make toast cards clickable, linking to the Toasts page or opening a detail dialog.

### 1.3 Dashboard Feast Cards — Not Clickable
**Problem**: Feast cards on the Dashboard have `hover:shadow-card-hover` and `cursor-pointer` but no `onClick` handler. Visual affordance with no action.
**Fix**: Add `onClick={() => navigate(`/feasts/${feast.id}`)}`.

### 1.4 Occasion Type Badge Shows Raw Enum
**Problem**: In `ToastsPage.tsx` line 127, the occasion badge displays `{t.occasion_type}` — the raw enum string like `supra` or `wedding` — instead of the translated label.
**Fix**: Use `t(`feasts.occasion.${t.occasion_type}`)` for translated display.

---

## 2. AI & KNOWLEDGE SYSTEM ISSUES

### 2.1 Latency Tracking is Unreliable
**Problem**: `AIGeneratePage.tsx` lines 194-200 try to update the most recent `ai_generation_log` entry by filtering on `user_id` and ordering — but `.update()` with `.order().limit()` doesn't work as intended in Supabase JS (order/limit are ignored on update). The latency is likely never saved.
**Fix**: The edge function should record latency directly, or the frontend should get the log ID from the response and update that specific row.

### 2.2 No DB Triggers Active
**Problem**: The `<db-triggers>` section says "There are no triggers in the database." But the codebase defines trigger functions like `on_favorite_added`, `on_favorite_removed`, `on_custom_toast_saved`, `on_feast_toast_completed`, and `on_ai_generation_logged`. These functions exist but **no triggers are attached**, meaning the entire adaptive learning pipeline via database events is **completely non-functional**.
**Fix**: Create migration to attach triggers:
- `user_favorites` AFTER INSERT → `on_favorite_added()`
- `user_favorites` AFTER DELETE → `on_favorite_removed()`
- `custom_toasts` AFTER INSERT → `on_custom_toast_saved()`
- `feast_toasts` AFTER UPDATE → `on_feast_toast_completed()`
- `ai_generation_log` AFTER INSERT → `on_ai_generation_logged()`

### 2.3 Feedback Signal Never Logged to `ai_generation_log`
**Problem**: The `submit_feedback` action in `tamada-ai` edge function updates knowledge but doesn't create an `ai_generation_log` entry. The telemetry dashboard therefore has no visibility into feedback volume.
**Fix**: Log feedback actions to `ai_generation_log` with `generation_type: 'feedback'`.

### 2.4 Edit Delta Analysis Not Logged
**Problem**: Similarly, `analyze_edit_delta` action doesn't log to `ai_generation_log`, making edit analysis invisible in telemetry.

---

## 3. NAVIGATION & ROUTING LEAKS

### 3.1 Admin Telemetry Has No Access Control
**Problem**: `/admin/telemetry` is accessible to every authenticated user. No role check, no `is_pro` check, nothing.
**Fix**: Add role-based access or at minimum restrict to specific user IDs.

### 3.2 AI History Has No Access Control
**Problem**: `/ai-history` shows all AI generation logs for the current user, which is fine, but the sidebar navigation exposes both "AI History" and "Telemetry" to all users equally with no distinction.

### 3.3 Realtime Not Enabled on Tables
**Problem**: `LiveFeastPage` subscribes to `postgres_changes` on `feast_toasts`, `feast_guests`, and `feasts`, but there is no migration that runs `ALTER PUBLICATION supabase_realtime ADD TABLE ...` for any of these tables. Realtime subscriptions will silently fail.
**Fix**: Add migration to enable realtime on `feasts`, `feast_toasts`, `feast_guests`.

---

## 4. UPGRADE & MONETIZATION GAPS

### 4.1 Upgrade Button Does Nothing
**Problem**: `UpgradePage.tsx` line 81 — the "გააქტიურე PRO" button has no `onClick` handler. It's a dead button.
**Fix**: Either implement Stripe integration or show a "coming soon" state.

### 4.2 Pro Gating is Client-Side Only
**Problem**: `useProGate.ts` checks `profile.is_pro` from the client. A user could modify localStorage or the Supabase response to bypass limits. Edge functions should validate Pro status server-side.

---

## 5. DATA INTEGRITY ISSUES

### 5.1 Feast Share Code Join is Broken
**Problem**: `/feasts/join/:shareCode` route exists and `JoinFeastPage` is imported, but there's no mechanism to generate share codes reliably (the mutation in `FeastDetailPage` generates one but it's not shown to work end-to-end, and the join flow inserts into `feast_collaborators` which requires `collaborators_self_insert` policy — but that policy only checks `user_id = auth.uid()` on INSERT, not whether the share code is valid).

### 5.2 Profile State Initialization Race
**Problem**: `ProfilePage.tsx` initializes form state from `profile` on mount: `useState(profile?.display_name || "")`. If `profile` is null initially and loads later, the form stays empty. There's no `useEffect` to sync when profile arrives.

### 5.3 RLS Policy Type: All Restrictive (DENY by default)
**Problem**: Every RLS policy is `Permissive: No` (restrictive). In PostgreSQL, restrictive policies require ALL to pass. This means if you have two restrictive SELECT policies on `toasts` (`toasts_select_system` and `toasts_select_own`), a user must satisfy BOTH — they can only see system toasts they also created. This is likely unintended.
**Fix**: Change policies to PERMISSIVE so they act as OR conditions.

---

## 6. MISSING FEATURES (Promised but Not Built)

| Feature | Status |
|---------|--------|
| PDF Export | Not implemented (listed in upgrade page) |
| Stripe Integration | Not implemented (dead button) |
| Dark Mode Toggle | ThemeProvider exists but no toggle visible in app shell |
| i18n Language Switching at Runtime | LanguageToggle component exists but not used in app layout |
| Keyboard Shortcuts | Not implemented |
| Co-Tamada Realtime Collaboration | Partially — collaborators can be added but no live collaboration UI |
| `supra` Occasion Type Mismatch | OnboardingWizard uses `corporate`, but AI Generate page uses `business` for the same concept |

---

## 7. MINOR UX POLISH ISSUES

- **Bottom nav padding**: `pb-24` added inconsistently — some pages have it (Library, Profile, Upgrade) and others don't (Toasts, Feasts, Dashboard)
- **Empty state on Toasts page**: Uses Georgian text but no action button to navigate to AI generator
- **Loading states**: Skeleton cards have no border/background distinction, appearing as invisible rectangles
- **Profile page**: `levelOptions` uses `"advanced"` but the type system defines `"experienced"` — mismatch at line 33

---

## Recommended Priority Order

1. **Attach all database triggers** — the adaptive learning pipeline is entirely broken without them
2. **Enable realtime on feast tables** — live feast mode doesn't actually work in realtime
3. **Fix RLS policy types** (restrictive → permissive) — users likely can't see system toasts
4. **Add toast detail/expand view** — core UX gap
5. **Fix Dashboard clickability** — dead cards
6. **Fix latency tracking** — telemetry data is hollow
7. **Fix occasion badge translation** on Toasts page
8. **Fix profile form state sync**
9. **Add access control** to admin pages
10. **Fix occasion type mismatches** across codebase

