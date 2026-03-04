

# Plan: Improve Feast Plan AI Generation UX + Context Enrichment

## Problem Statement

Two issues identified from the screenshots and code:

1. **UX is unclear for generating toasts**: The "AI გეგმა" button at the bottom of the toast list generates the entire plan, but there's no obvious call-to-action when the plan is empty. The button blends in as a secondary outline button. Users don't understand this is how they get their feast populated.

2. **AI context gap**: When generating individual toasts (single regen from the dialog), the AI only receives `toast_type`, `title`, `occasion_type`, `formality`, and `region`. It does NOT receive:
   - Guest names (who's at the feast)
   - Guest count
   - Full feast duration
   - Feast title/notes (which may contain context like "my sister's wedding")
   - Other toasts already in the plan (so the regen can maintain coherence with the sequence)

## Execution Strategy

### Task 1: Improve Empty State UX for AI Plan Generation

When the feast plan tab is empty, replace the generic `EmptyState` with a prominent AI generation card that:
- Has a large `Sparkles` icon and clear Georgian copy explaining "Generate your feast plan with AI"
- Shows a prominent primary button (not outline) to trigger generation
- Displays the feast context (occasion, formality, guest count, duration) so the user sees what the AI will use
- Keep the existing "AI გეგმა" button below the list for RE-generation when toasts already exist

### Task 2: Enrich Single Toast Regen with Full Supra Context

Update the `regenSingleToast` mutation in `ToastDetailDialog` to pass:
- `guest_names` from the guests list
- `guest_count` from feast
- `duration_minutes` from feast
- `feast_title` and `feast_notes` for thematic context
- `existing_toast_types` — the list of other toast types already in the plan, so the AI can maintain coherence

Update the `generate-feast-plan` edge function's single regen prompt to include this enriched context:
- Add feast title/notes to the prompt
- Add guest names
- Add "other toasts in this feast" context so the generated toast fits the sequence
- This uses the same master system prompt already in the function

### Task 3: Pass feast context fields through in the edge function

In the edge function, accept and use `feast_title`, `feast_notes`, `existing_toast_types` in the single regen user prompt. This enriches the AI's understanding of the specific feast without changing the system prompt.

## Files Changed

1. **`src/pages/FeastDetailPage.tsx`** — Improve empty state with AI CTA; pass enriched context to single regen
2. **`supabase/functions/generate-feast-plan/index.ts`** — Accept and use `feast_title`, `feast_notes`, `existing_toast_types` in single regen prompt

