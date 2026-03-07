

# Fix Plan: Language Isolation, Voice Mode Reliability, Conversational Flow & Polish

## Issues Identified

### 1. Bilingual responses when user selects Georgian
**Root cause**: The system prompt has a `<BILINGUAL_OUTPUT>` section (lines 353-361) that instructs the AI to always output Georgian FIRST then English below a separator `──────────`. This conflicts with the user's language selection. The `RESPONSE LANGUAGE` line (41) says "respond in the language the user writes in" but the `<BILINGUAL_OUTPUT>` section overrides it for toasts.

**Fix**: Override the `<BILINGUAL_OUTPUT>` behavior in the `CONVERSATIONAL_ADDITIONS` block. Add a language-enforcement instruction that tells the AI: "In this conversational mode, respond ONLY in the language specified by the `language` parameter. Do NOT produce bilingual output. If language=ka, respond entirely in Georgian. If language=en, respond entirely in English." Also pass `language` explicitly in the user message context so the AI knows which language to use.

### 2. Voice mode never stops listening with background noise
**Root cause**: The VAD silence threshold is `0.008` RMS — extremely low. Any ambient noise (AC, traffic, keyboard) exceeds this threshold, so silence is never detected. Additionally, there is no maximum recording duration — if the threshold is never met, recording continues forever.

**Fix**:
- Raise the default `silenceThreshold` from `0.008` to `0.02` (more tolerant of ambient noise)
- Add a `maxRecordingDurationMs` (e.g., 30 seconds) to `useVoiceConversation.ts` — auto-stop recording after this timeout regardless of VAD
- Add a "speech started" gate: only start the silence timer after speech is first detected (RMS exceeds a higher threshold like `0.03`), preventing immediate silence detection on quiet starts

### 3. AI doesn't ask for details conversationally
**Root cause**: The `PARAMETER_GATHERING` prompt section is present but gets outweighed by the `<CONVERSATIONAL_BEHAVIOR>` section's first interaction pattern which already generates a greeting. The language parameter is sent but the AI often defaults to generating a toast immediately if the user's message contains enough intent. The prompt says "If the user provides enough info (at minimum: occasion), you can generate without asking more" — this is too permissive.

**Fix**: Strengthen the `PARAMETER_GATHERING` rules:
- Change to: "ALWAYS ask at least 2 questions before generating a toast: (1) occasion, (2) who it's for. Even if the user says 'wedding toast', still ask who it's for."
- Remove the "if user seems impatient" shortcut — at minimum occasion + person must be gathered
- Add: "When you have gathered occasion + person_name at minimum, confirm and generate."

### 4. Session doesn't reset after long gaps
**Root cause**: `getOrCreateSession` always reuses the existing session regardless of how old the last message was.

**Fix**: In `getOrCreateSession`, check `updated_at` — if last activity was >2 hours ago, reset `gathered_params` to `{}` and add a system message noting "New conversation started." This gives the AI fresh context.

### 5. "Powered by TAMADA AI" styling is too subtle
**Fix**: Make it slightly more prominent — use `text-[11px]` instead of `text-[10px]`, add a small wine glass icon, use `text-primary/50` instead of `text-muted-foreground/40`.

### 6. Voice mode `onClose` doesn't call `endSession`
**Root cause**: When user clicks the X or "Text" button, `onClose` is called but `voice.endSession()` is not — the mic stream keeps running in the background.

**Fix**: In `FullVoiceMode`, create a `handleClose` that calls `voice.endSession()` then `onClose()`.

## Implementation

### File 1: `supabase/functions/tamada-external-api/index.ts`
- In `CONVERSATIONAL_ADDITIONS`, add a `<LANGUAGE_ENFORCEMENT>` block overriding `<BILINGUAL_OUTPUT>`:
  ```
  <LANGUAGE_ENFORCEMENT>
  OVERRIDE <BILINGUAL_OUTPUT> in conversational mode.
  You MUST respond ONLY in the language specified. 
  If language=ka → entire response in Georgian only. No English.
  If language=en → entire response in English only. No Georgian.
  This applies to both conversational replies AND toasts.
  </LANGUAGE_ENFORCEMENT>
  ```
- Strengthen `PARAMETER_GATHERING`: require at minimum occasion + person before generating
- In `handleChatMessage` and `handleChatMessageVoice`: prepend `[Language: ${language}. Respond ONLY in this language.]` to the user message content sent to AI
- In `getOrCreateSession`: if `existing.updated_at` is >2 hours old, reset `gathered_params` to `{}` and update `updated_at`

### File 2: `src/hooks/useVAD.ts`
- Add `speechDetected` ref — set to `true` when RMS exceeds `0.03`
- Only start silence timer after `speechDetected` is true
- Reset `speechDetected` on each `startMonitoring` call

### File 3: `src/hooks/useVoiceConversation.ts`
- Raise `silenceThreshold` to `0.02`
- Add a `maxRecordingTimeout` (30s) that auto-stops the recorder
- Clear timeout on stop

### File 4: `src/components/api-testing/FullVoiceMode.tsx`
- Add `handleClose` that calls `voice.endSession()` then `onClose()`
- Use `handleClose` for both X button and "Text" button

### File 5: `src/components/api-testing/ToastCard.tsx`
- Update attribution styling: slightly larger text, wine icon, `text-primary/50`

