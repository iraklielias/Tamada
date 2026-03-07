

# Production Readiness Audit & Execution Strategy

## Critical Leaks Found

### 1. Voice messages never appear in chat
`handleVoiceMessage` in `ApiTestingPage.tsx` (line 23-25) is an empty callback. When voice mode ends and user returns to text, none of the voice conversation appears in the chat history. The user loses all context.

### 2. No onboarding / first-use guidance
- No explanation of what voice mode is or how it works
- No tooltip or hint on the mic button
- No API key setup prompt on first load — user sees the chat but can't do anything until they find settings
- Welcome screen doesn't mention voice mode at all

### 3. Voice mode lacks visual instructions
- "Tap to start" label exists but no explanation of the flow
- No hint that tapping during listening stops recording
- No indication that you can interrupt while speaking
- "End Session" button is only shown after starting — no clear exit affordance at idle

### 4. Stream leak on listen cycles
Every `startListening()` call requests a new `getUserMedia()` stream but never stops the previous one. After several listen→speak→listen cycles, orphaned mic streams accumulate.

### 5. Error states are silent
- If API call fails during chat, nothing is shown to user — the message just disappears
- If voice transcription fails, it silently restarts listening with no feedback
- If TTS fails, voice mode jumps back to listening with no explanation

### 6. Language toggle has no visual indicator of active state
The globe icon toggles between KA/EN but doesn't show which is active. User can't tell current language at a glance.

### 7. ToastCard hardcoded Georgian label
Line 37 of `ToastCard.tsx`: `<span>სადღეგრძელო</span>` — always Georgian regardless of language setting.

### 8. Copy/Play button labels not localized
"Copy" and "Play"/"Pause" in ToastCard are always English.

---

## Master Execution Strategy

### Phase 1: Critical Functional Fixes

**1a. Wire voice messages into chat** (`ApiTestingPage.tsx`)
- Replace empty `handleVoiceMessage` with a ref-based callback that adds messages to `ChatSimulator`'s state
- Use a ref to `ChatSimulator.addVoiceMessages` (already defined but unused)
- OR lift `messages` state up to `ApiTestingPage` so both components share it

**1b. Fix stream leak** (`useVoiceConversation.ts`)
- Before `getUserMedia()` in `startListening`, stop any existing `streamRef.current` tracks
- This prevents orphaned mic streams

**1c. Add error feedback** (`ChatSimulator.tsx`, `FullVoiceMode.tsx`)
- In chat: on API error, show an error bubble or toast notification
- In voice: on transcription/API error, show stage label "Error — tap to retry" instead of silently restarting

### Phase 2: User Guidance & Onboarding

**2a. API key first-run prompt** (`ChatSimulator.tsx`)
- If no API key is set, show a prominent inline card (not just settings drawer) with input field: "Enter your API key to start"
- Auto-focus the key input on first load

**2b. Voice mode button with label** (`ChatSimulator.tsx`)
- Replace the bare mic icon with a labeled button: `🎤 Voice Mode` / `🎤 ხმოვანი`
- Add a subtle tooltip: "Switch to hands-free voice conversation"

**2c. Voice mode instructions overlay** (`FullVoiceMode.tsx`)
- On first open (or at idle state), show brief instructions:
  - "Tap the orb to start listening"
  - "Tap again to send your message"
  - "Tap while speaking to interrupt"
- Dismiss on first tap, remember with localStorage

**2d. Welcome screen voice mention** (`WelcomeScreen.tsx`)
- Add a subtle note below suggestions: "💡 Try Voice Mode — tap the mic icon for hands-free conversation"

### Phase 3: Language & Localization Polish

**3a. Active language indicator** (`ChatHeader.tsx`)
- Replace the globe icon with a badge showing "KA" or "EN" that toggles on click
- Use primary color for active state

**3b. Localize ToastCard** (`ToastCard.tsx`)
- Accept `language` prop
- "სადღეგრძელო" → dynamic based on language
- "Copy"/"Play"/"Pause" → localized

### Phase 4: Voice Mode Resilience

**4a. Error stage** (`useVoiceConversation.ts`, `FullVoiceMode.tsx`)
- Add `"error"` to `VoiceStage` type
- On API/transcription failure, set stage to "error" with label "Something went wrong — tap to retry"
- On tap during error → restart listening

**4b. Voice-to-chat transcript sync**
- When voice session ends, all voice messages should be visible in the chat scroll
- Already handled by Phase 1 fix (1a)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ApiTestingPage.tsx` | Lift messages state or use ref to sync voice→chat messages |
| `src/hooks/useVoiceConversation.ts` | Fix stream leak, add error stage |
| `src/components/api-testing/FullVoiceMode.tsx` | Instructions overlay, error state display |
| `src/components/api-testing/ChatSimulator.tsx` | API key inline prompt, error bubbles, voice button label |
| `src/components/api-testing/WelcomeScreen.tsx` | Voice mode hint |
| `src/components/api-testing/ChatHeader.tsx` | Language badge instead of globe |
| `src/components/api-testing/ToastCard.tsx` | Language-aware labels |

