

# Fix Plan: Chat Parameter Gathering, Voice Mode Controls, Reset Button

## Issues Found

### 1. Chat still doesn't ask for details — AI generates toast immediately
**Root cause**: The `<BILINGUAL_OUTPUT>` section (lines 353-361) in the CORE prompt tells the AI to always output Georgian + English with separator. Even though `<LANGUAGE_ENFORCEMENT>` overrides it in `CONVERSATIONAL_ADDITIONS`, the core prompt's `<CONVERSATIONAL_BEHAVIOR>` section (line 363-376) has its OWN interaction patterns that compete with `<PARAMETER_GATHERING>`. Specifically, line 368: "Vague request → ask occasion" and line 369 suggest the AI CAN generate after occasion only. The AI follows whichever section it "feels" is stronger. The `<PARAMETER_GATHERING>` says "MUST have occasion + person_name" but the `<CONVERSATIONAL_BEHAVIOR>` section's patterns encourage quicker generation.

**Fix**: Remove the competing patterns from `<CONVERSATIONAL_BEHAVIOR>` and make it defer to `<PARAMETER_GATHERING>`. Add explicit: "NEVER generate a toast until PARAMETER_GATHERING requirements are met." Also, the `<BILINGUAL_OUTPUT>` section itself should be removed from the core prompt since it conflicts with the language enforcement — or at minimum explicitly disabled.

### 2. Voice mode: tapping orb while listening doesn't stop recording
**Root cause**: `handleOrbClick` only handles `idle` and `speaking` stages. No `stopListening()` method is exposed from `useVoiceConversation`. When user taps mic during `listening`, nothing happens.

**Fix**: Add `stopListening()` to `useVoiceConversation` that manually stops the MediaRecorder. Add `listening` case to `handleOrbClick` in `FullVoiceMode`.

### 3. No "Reset" button in chat
**Root cause**: The "Clear History" is buried in the Settings drawer. User wants a visible reset button that clears context and makes the AI re-ask all gathering questions.

**Fix**: Add a reset button in the chat header (or as a floating button). On reset: call `clearHistory`, clear local messages + extractedParams, and the next message will trigger a fresh session with welcome + parameter gathering.

### 4. Thinking loader in voice mode is too plain
**Current**: Spinning border ring. Need a classier 3-dot pulse animation.

**Fix**: Replace the spinning border with wine-colored animated dots during `thinking` and `transcribing` states.

---

## Implementation

### File 1: `supabase/functions/tamada-external-api/index.ts`
- **Remove** or comment out `<BILINGUAL_OUTPUT>` section (lines 353-361) from core prompt — it's already overridden by `<LANGUAGE_ENFORCEMENT>` and causes confusion
- **Update** `<CONVERSATIONAL_BEHAVIOR>` to add: "IMPORTANT: Before generating any toast, ensure all PARAMETER_GATHERING requirements are satisfied. Do not generate until you have both occasion AND recipient."
- In the `generateAIResponse` call for voice mode (line 991), update the injected system message to: "VOICE_CONVERSATION_MODE is active. Keep responses concise but ALWAYS follow PARAMETER_GATHERING rules — ask for occasion and recipient before generating."

### File 2: `src/hooks/useVoiceConversation.ts`
- Add `stopListening()` method that stops `mediaRecorderRef.current` if recording
- Expose it in the return object

### File 3: `src/components/api-testing/FullVoiceMode.tsx`
- Add `listening` case to `handleOrbClick` → call `voice.stopListening()`
- Replace spinning border loader with a 3-dot wine-colored pulse animation for `thinking`/`transcribing` states

### File 4: `src/components/api-testing/ChatSimulator.tsx` or `ChatHeader.tsx`
- Add a visible "Reset / ახალი" button in the chat area (visible when messages exist)
- On click: calls `handleClear` (which already calls `api.clearHistory` + resets messages/params)
- This triggers fresh session + welcome on next message

### File 5: `src/components/api-testing/ChatHeader.tsx`
- Add reset button (refresh icon) to the header bar

