

# Supra (Feast) Feature Audit — All Leaks and Gaps

After reviewing all 5 feast-related pages (`FeastsPage`, `NewFeastPage`, `FeastDetailPage`, `LiveFeastPage`, `JoinFeastPage`), plus `FeastAdvisory`, routing, and RLS policies, here is every issue found.

---

## CRITICAL: Data Access & Security

### 1. Join Feast RLS Blocks the Lookup
`JoinFeastPage` queries `feasts` by `share_code` (line 28-32), but the `feasts_select` RLS policy only allows `host_id = auth.uid() OR is_feast_collaborator(id, auth.uid())`. A new user trying to join has neither — **the lookup will always return null**, making the entire join flow non-functional. Needs a permissive policy allowing SELECT when `share_code` matches.

### 2. Collaborator INSERT Policies are Both Restrictive
`feast_collaborators` has two restrictive INSERT policies: `collaborators_insert` (requires host) and `collaborators_self_insert` (requires `user_id = auth.uid()`). Since both are restrictive, **both must pass**. A joining user satisfies `self_insert` but not `host_insert` — insert fails. The previous migration recreated these but kept them restrictive. Must make them permissive.

### 3. No Feast Edit Capability
`FeastDetailPage` has no way to edit feast details (title, occasion, duration, formality, region, notes). Once created, these are frozen. The only mutation is status changes and delete.

---

## UX Gaps

### 4. No Toast Reordering (Drag & Drop)
Feast toasts have a `position` field but no UI to reorder them. The list is static — users cannot drag toasts up or down to rearrange the sequence.

### 5. No Toast Detail View in Feast Plan
`FeastDetailPage` toast cards show `title_ka` truncated and `description_ka` truncated (line 238, 241). No way to click/expand to read full description or see `title_en`/`description_en`. Same gap as the main toasts page had.

### 6. Toast Type Badge Shows Raw Enum
In `FeastDetailPage` line 243, `{ft.toast_type}` displays raw strings like `mandatory`, `traditional`, `custom` instead of translated labels. Similarly in `LiveFeastPage` line 219, it uses `t('live.toastType.${toast.toast_type}')` which is better, but these translation keys likely don't all exist.

### 7. AI-Generated Plan Replaces Without Confirmation
`FeastDetailPage` line 156-158: clicking "AI გეგმა" **silently deletes all existing toasts** before inserting AI-generated ones. No confirmation dialog, no undo. Destructive action without warning.

### 8. LiveFeastPage — Timer Drift Issue
The elapsed timer (line 94) initializes from `actual_start_time` on mount, but doesn't account for paused time. If a feast was paused for 30 minutes, the timer shows 30 minutes more than actual active time.

### 9. LiveFeastPage — No Way to Go Back to a Skipped Toast
Once a toast is skipped, it's permanently marked `skipped`. No undo button. If the tamada accidentally skips, they can't recover.

### 10. LiveFeastPage — No Toast Content for Delivery
The live view shows `title_ka` and `description_ka` for the current toast, but if the toast was linked from the `toasts` table (via `assigned_toast_id`), the actual toast body text (`body_ka`) is never fetched. The tamada has no delivery content to read.

### 11. Guest Role is Always "guest"
`NewFeastPage` line 103 and `FeastDetailPage` line 109 hardcode `role: "guest"` for all added guests. No way to set roles like "mejavare" (co-tamada), "maspindzeli" (host), etc. The field exists in the schema but the UI ignores it.

### 12. No Guest Notes
`feast_guests` has a `notes` field but the UI never shows or edits it. Useful for "vegetarian", "doesn't drink", etc.

### 13. Alaverdi Assignment UX is Confusing
In `LiveFeastPage`, assigning alaverdi both sets `alaverdi_assigned_to` on the toast AND increments the guest's `alaverdi_count` in a single click (line 304). But there's no way to unassign or change the assignment. Also, the alaverdi sheet only appears when there are guests — if guests weren't added, the entire alaverdi feature is invisible.

### 14. Feast Status "scheduled" Exists in Colors but Not in Flow
`FeastsPage` defines `scheduled` in `statusColors` (line 17) but the status filter tabs don't include it, and no code path ever sets a feast to "scheduled" status.

### 15. Completed Feast Has No Summary View
When a feast is completed, there's no summary/stats screen — total duration, number of toasts completed vs skipped, alaverdi leaderboard, etc. The feast just goes back to the detail page.

### 16. No Feast Duplicate/Clone
Users can't clone a completed feast as a template for a new one. Common use case: "use same toast plan for next wedding."

---

## Data Integrity

### 17. Region "none" Stored as String
`NewFeastPage` line 63 stores `region: region || null`, but `region` state starts as `""` (line 37). Selecting "none" from the Select (line 160, value `"none"`) stores the string `"none"` in the database, not null.

### 18. Occasion Type Mismatch: "business" vs "corporate"
`NewFeastPage` line 19 uses `"business"` in `occasionKeys`, but `OnboardingWizard` uses `"corporate"`. The `OccasionType` type (from types/index.ts) needs to be checked for which is canonical. This causes inconsistent data.

---

## Recommended Fix Priority

1. **Fix RLS for feast join flow** — SELECT policy on `feasts` for share_code lookup + make collaborator INSERT policies permissive (blocks entire co-tamada feature)
2. **Fix occasion type mismatch** — standardize `business`/`corporate` across all pages
3. **Fix region "none" storage** — map "none" to null before insert
4. **Add confirmation dialog before AI plan regeneration** — prevents data loss
5. **Add toast detail/expand in FeastDetailPage** — same pattern as ToastsPage fix
6. **Translate toast_type badges** — add missing i18n keys
7. **Add feast editing** — allow updating title, occasion, duration after creation
8. **Add completed feast summary** — show stats after feast ends
9. **Fetch assigned toast body** for live delivery — join `toasts` table when `assigned_toast_id` is set
10. **Fix timer drift** for paused feasts

