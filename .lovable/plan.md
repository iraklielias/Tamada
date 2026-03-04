

# Plan: Regenerate Library Toasts + Language-Aware Display

## Two tasks

### Task 1: Create a `regenerate-library` edge function

A new edge function that iterates through all 61 system toasts in the `toasts` table and regenerates each one using the Master TAMADA AI system prompt + `google/gemini-3-pro-preview`. For each toast, it will:

1. Take the toast's `occasion_type`, `formality_level`, `region`, and `toast_order_position` as context
2. Call the AI gateway with the master system prompt to generate a proper bilingual toast (`title_ka`, `body_ka`, `title_en`, `body_en`)
3. Update the toast row in-place via service role client

The function will be invoked once manually (via curl) to seed all toasts. It processes toasts sequentially with a small delay to avoid rate limits.

**New file:** `supabase/functions/regenerate-library/index.ts`

### Task 2: Language-aware display across all supra/toast pages

Currently, toast titles and bodies are hardcoded to show `title_ka` / `body_ka` as primary. When the user switches to English, the primary display should switch to `title_en` / `body_en`.

**Files to edit:**

- **`src/pages/ToastsPage.tsx`** — Lines 109, 136, 141, 182, 200-201: Use `isEn ? title_en || title_ka : title_ka` pattern for card titles, body text, dialog title, and body display
- **`src/pages/FeastDetailPage.tsx`** — Line 109 (SortableToastCard title), line 112 (description), and the ToastDetailDialog: Switch primary display based on `i18n.language`. Need to add `useTranslation` to SortableToastCard via prop or context.
- **`src/pages/LiveFeastPage.tsx`** — Line 292 (`currentToast.title_ka`), lines 293-294 (body display): Swap primary/secondary based on language. Also line 201 in completedToastsData.
- **`src/pages/FavoritesPage.tsx`** — Lines showing `toastData.title_ka` and `toastData.body_ka`: Use language-aware display.
- **`src/pages/LibraryPage.tsx`** — Already uses `isEn` for template names but toast sequence count label needs no change.

The pattern everywhere will be:
```tsx
const isEn = i18n.language === "en";
// Title: show English first when in EN mode
const displayTitle = isEn ? (toast.title_en || toast.title_ka) : toast.title_ka;
const displayBody = isEn ? (toast.body_en || toast.body_ka) : toast.body_ka;
```

### Execution order

1. Create `regenerate-library` edge function
2. Deploy and invoke it to regenerate all 61 toasts
3. Update all 5 page files for language-aware display

