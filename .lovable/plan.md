

# Sophisticated Toast Retry & Customization in Supra Mode

## What We're Building

Transform the `ToastDetailDialog` in `FeastDetailPage.tsx` from a simple "regenerate" button into a rich retry experience with:

1. **User comment/instruction field** — free-text input to guide regeneration ("make it more emotional", "mention the bride's family")
2. **Pre-selected customization chips** — quick-tap options for tone, length, and style adjustments
3. **Remove the "From Library" button** — replaced with "Save to Favorites"
4. **Regenerate using master system prompt** with user customization params passed to the edge function

## Technical Details

### 1. Edge Function Update — `generate-feast-plan/index.ts`

Add two new optional params to the destructured request body:

- `user_instructions` (string) — free-text retry comment from user
- `style_overrides` (object) — `{ tone, length, style }` from the chip selectors

Inject these into the single-regen prompt block (lines 410-424):

```text
${user_instructions ? `- მომხმარებლის მითითება: ${user_instructions}` : ""}
${style_overrides?.tone ? `- ტონი: ${style_overrides.tone}` : ""}
${style_overrides?.length ? `- სიგრძე: ${style_overrides.length}` : ""}
${style_overrides?.style ? `- სტილი: ${style_overrides.style}` : ""}
```

### 2. ToastDetailDialog Overhaul — `FeastDetailPage.tsx`

**New state variables:**
- `retryComment` (string) — user's free-text instruction
- `selectedTone` (string | null) — "traditional" | "humorous" | "emotional" | "philosophical"
- `selectedLength` (string | null) — "short" | "medium" | "long"
- `selectedStyle` (string | null) — "poetic" | "storytelling" | "proverbial" | "direct"

**New UI (replacing the bottom action bar, lines 396-423):**

```text
┌─────────────────────────────────────┐
│ [Toast body display — unchanged]    │
│                                     │
│ ── Customize & Retry ──────────────│
│                                     │
│ 💬 "Make it more personal..."       │  ← Textarea for instructions
│                                     │
│ Tone:  [Traditional] [Humorous]     │  ← Toggle chips
│        [Emotional] [Philosophical]  │
│                                     │
│ Length: [Short] [Medium] [Long]     │  ← Toggle chips
│                                     │
│ Style:  [Poetic] [Storytelling]     │  ← Toggle chips
│         [Proverbial] [Direct]       │
│                                     │
│ [🔄 Regenerate Toast]  [❤️ Save]   │  ← Action buttons
└─────────────────────────────────────┘
```

- Chips use existing `Badge` with `cursor-pointer` and active state styling
- "Regenerate Toast" calls `regenSingleToast` with the new params
- "Save to Favorites" inserts into `user_favorites` with `custom_toast_id` or `toast_id` from the current assignment
- **Remove** the "From Library" button and `showLibrary` state/UI entirely

**Mutation update for `regenSingleToast`:** Pass `user_instructions` and `style_overrides` in the edge function invocation body.

**New mutation `saveToFavorites`:** Insert into `user_favorites` table using the current toast's `assigned_toast_id` or `assigned_custom_toast_id`.

### 3. Translation Keys

Add to both `en.json` and `ka.json`:
- `feastDetail.retryComment` — "Add instructions for regeneration"
- `feastDetail.toneLabel` / `feastDetail.lengthLabel` / `feastDetail.styleLabel`
- `feastDetail.saveToFavorites` — "Save to Favorites"
- `feastDetail.styles.poetic` / `storytelling` / `proverbial` / `direct`
- `feastDetail.lengths.short` / `medium` / `long`

Tone keys already exist under `ai.tones.*`.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-feast-plan/index.ts` | Accept `user_instructions` + `style_overrides`, inject into single-regen prompt |
| `src/pages/FeastDetailPage.tsx` | Overhaul `ToastDetailDialog` — add retry UI, remove library, add save-to-favorites |
| `src/i18n/locales/en.json` | Add ~10 new keys |
| `src/i18n/locales/ka.json` | Add ~10 new keys |

