

# Master Execution Plan: AI Generator Enhancement — Refinement, Chat/Voice Mode, and Thinking Facts

## Scope

Three major features across 4 phases:
1. **Thinking Facts** in AI Generator and Supra mode during loading
2. **Supra-style Refinement** (collapsible) in AI Generator
3. **Chat/Voice Mode** (full-page takeover, PRO-only) in AI Generator
4. Cross-mode state sharing

---

## Phase 1: Generalized ThinkingFacts Component + Integration

**Goal:** Show cultural facts during AI loading in AI Generator and Supra (FeastDetailPage) — reuse the existing `ThinkingFacts` component but decouple it from `VoiceStage`.

### Files Changed

| File | Change |
|------|--------|
| `src/components/api-testing/ThinkingFacts.tsx` | Generalize props: accept `isVisible: boolean` instead of `stage: VoiceStage`. Keep backward compat by accepting either. |
| `src/pages/AIGeneratePage.tsx` | Import `ThinkingFacts`. Show it when `generate.isPending` below the generate button or overlaid on the result area. Language from i18n. |
| `src/pages/FeastDetailPage.tsx` | Import `ThinkingFacts`. Show it in the `ToastDetailDialog` when `regenSingleToast.isPending`, inside the toast body area. |

### Risks & Mitigations
- **ThinkingFacts currently imports `VoiceStage` type** — we'll make the `stage` prop optional and add an `isVisible` boolean prop. The existing FullVoiceMode usage stays unchanged.
- **Layout shift during loading** — use a fixed-height container (`min-h-[60px]`) to prevent content jumping.

---

## Phase 2: Supra-style Refinement in AI Generator

**Goal:** After a toast is generated, add a collapsed "Customize & Retry" section with free-text instructions + tone/length/style chips — same UX as `FeastDetailPage`'s `ToastDetailDialog`.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/AIGeneratePage.tsx` | Add refinement UI (Collapsible) after the generated toast card. State: `refinementOpen`, `refinementComment`, `selectedRefineTone`, `selectedRefineLength`, `selectedRefineStyle`. New mutation `refineMutation` that calls `tamada-ai` with action `refine_toast`. |
| `supabase/functions/tamada-ai/index.ts` | Add `refine_toast` action handler (distinct from existing `regenerate`/`refine`). Accepts `current_toast` (the full body), `instructions` (free text), `style_overrides` (tone/length/style), and original `generation_params`. Sends the current toast + instructions to AI, returns refined version in same JSON format. |

### Detailed Implementation

**Backend (`tamada-ai`):**
- New action `refine_toast` between `regenerate` handler (line 966) and `feast_advisory` (line 977)
- User message includes: the current toast body, the user's refinement instructions, style overrides
- Still returns same JSON structure: `{ title_ka, body_ka, title_en, body_en, metadata, delivery_guidance }`
- Counts as an AI generation (logged, counts toward daily limit)

**Frontend (`AIGeneratePage`):**
- Refinement section appears only when `result` exists, collapsed by default
- Chips: tone (traditional/humorous/emotional/philosophical), length (shorter/longer), style (poetic/storytelling/proverbial/direct)
- "Refine" button triggers `refineMutation`
- On success: updates `result` and `editedBody`/`editedTitle`, preserves `originalResult` for diff
- ThinkingFacts shows during refinement loading too

### Risks & Mitigations
- **Refinement resets edit state** — intentional: refined output replaces current `editedBody`, but `originalResult` stays as the first generation for diff
- **Daily limit** — refinement counts as a generation. UI shows updated count after refine.

---

## Phase 3: Internal Chat/Voice Mode in AI Generator (PRO-only)

**Goal:** Full-page voice/chat takeover accessible from AI Generator, using authenticated Supabase session (no API key), PRO-gated.

### Architecture Decision
Instead of duplicating the external API's session management, we create a **lightweight internal chat mode** that:
- Uses the `tamada-ai` edge function with a new `chat_generate` action
- Stores conversation in client-side state only (no DB persistence needed for internal chat)
- Reuses `useVoiceConversation` hook but with an adapter that calls `tamada-ai` instead of `tamada-external-api`
- Reuses `FullVoiceMode` component with minimal prop changes

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/tamada-ai/index.ts` | Add `chat_generate` action: accepts `messages` array (conversation history), `language`, optional `style_overrides`. Returns `{ content, extracted_params?, title_ka?, body_ka?, ... }`. When AI produces a complete toast (detected by `===TOAST===` markers or JSON), includes structured toast data. |
| `src/hooks/useInternalTamadaChat.ts` | **New file.** Adapter hook that wraps `tamada-ai` calls to match the interface expected by `useVoiceConversation`. Provides `sendVoiceMessage()` that: (1) sends audio base64 to a new `chat_voice` action on `tamada-ai` for STT+AI, (2) returns `VoiceChatResponse`. Also provides `sendTextMessage()` for text chat. Uses Supabase auth JWT, not API key. |
| `src/components/ai-chat/AIVoiceMode.tsx` | **New file.** Thin wrapper around `FullVoiceMode` that passes the internal API adapter instead of external API. Adds PRO gate check. |
| `src/components/ai-chat/AIChatPanel.tsx` | **New file.** Simplified chat UI (no API key setup, no developer tools). Shows messages, text input, voice mode toggle. Receives `onToastGenerated` callback to pass completed toasts back to AIGeneratePage. |
| `src/pages/AIGeneratePage.tsx` | Add "Chat with Tamada" button (PRO badge, mic icon). Opens full-page chat/voice overlay. `onToastGenerated` callback populates the form result with the AI-generated toast. PRO gate via `useProGate`. |

### Backend: `chat_generate` action in `tamada-ai`

```text
Input: { action: "chat_generate", messages: [...], language: "ka"|"en", style_overrides?: {...} }
Output: { content: "...", toast?: { title_ka, body_ka, ... }, extracted_params?: {...} }
```

- Uses the same system prompt + user context
- Messages array sent directly to AI (client manages history)
- No server-side session persistence (unlike external API)
- Still rate-limited by daily AI count

### Backend: `chat_voice` action in `tamada-ai`

```text
Input: { action: "chat_voice", audio_base64: "...", language: "ka"|"en", messages: [...] }
Output: { success, transcription, message: { content, audio_url }, extracted_params? }
```

- STT via ElevenLabs (same as external API)
- AI generation via same system prompt
- TTS via ElevenLabs (same as external API)
- Audio stored in `chat-audio` bucket

### Risks & Mitigations
- **Code duplication with external API** — acceptable because internal mode is simpler (no session DB, no API key auth). The shared parts are: STT/TTS calls, system prompt, AI gateway call. We extract STT/TTS helpers if they grow.
- **Voice mode AudioContext** — reused from `useVoiceConversation` which already handles mobile Safari.
- **PRO gate bypass** — enforced both client-side (UI hidden) and server-side (daily limit check in edge function).
- **Empty AI responses** — same fallback guard as external API (if cleanContent empty after param extraction, insert acknowledgment).

---

## Phase 4: Cross-Mode State Sharing

**Goal:** When a toast is generated via chat/voice, it populates the AI Generator result area. When form generates a toast, chat mode can refine it.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/AIGeneratePage.tsx` | `onToastGenerated` callback from chat/voice mode sets `result`, `editedBody`, `editedTitle`, `originalResult`. When entering chat mode, pass current `result` as initial context if exists. |

### Risks & Mitigations
- **State sync complexity** — kept simple: one-directional callbacks. Chat produces toast → form displays it. No bidirectional real-time sync.

---

## File Impact Summary

| File | Phase | Type |
|------|-------|------|
| `src/components/api-testing/ThinkingFacts.tsx` | 1 | Edit (generalize props) |
| `src/pages/AIGeneratePage.tsx` | 1,2,3,4 | Edit (facts, refinement, chat/voice entry) |
| `src/pages/FeastDetailPage.tsx` | 1 | Edit (facts during regen) |
| `supabase/functions/tamada-ai/index.ts` | 2,3 | Edit (refine_toast, chat_generate, chat_voice actions) |
| `src/hooks/useInternalTamadaChat.ts` | 3 | New |
| `src/components/ai-chat/AIVoiceMode.tsx` | 3 | New |
| `src/components/ai-chat/AIChatPanel.tsx` | 3 | New |

**Files NOT touched** (preserving working functionality):
- `supabase/functions/tamada-external-api/index.ts` — no changes
- `src/hooks/useVoiceConversation.ts` — reused as-is
- `src/components/api-testing/FullVoiceMode.tsx` — reused as-is (or imported by AIVoiceMode)
- `src/hooks/useTamadaExternalApi.ts` — no changes
- All existing chat simulator components — no changes

---

## Execution Order

1. **Phase 1 first** — smallest scope, no risk, immediately visible improvement
2. **Phase 2 second** — standalone feature, no PRO gate needed, builds refinement backend
3. **Phase 3 third** — largest scope, PRO-gated, builds on Phase 2's backend patterns
4. **Phase 4 last** — wiring, minimal code

Each phase is independently deployable and testable.

