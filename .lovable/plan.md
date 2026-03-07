

# Fix Plan: Restore Missing Sections, Fix Voice Mode VAD, Add Language Toggle

## Issues Identified

1. **Voice mode listens forever** — The VAD `onSilenceDetected` callback captures a stale `stage` value via closure. It checks `stage === "listening"` but `stage` is from the initial render, so the condition never matches and silence never triggers a stop.

2. **Missing sections** — The previous page had tabbed sections: API Key Manager, Endpoint Tester, Usage Analytics, Voice Settings. These components still exist in the codebase but are no longer rendered in `ApiTestingPage.tsx`.

3. **"Powered by TAMADA" removed** — Was present in prior ToastCard design, now missing.

4. **Language toggle not connected to voice mode** — `FullVoiceMode` is hardcoded to `language="ka"`. The ChatSimulator has a language state but it's not lifted to the parent or passed to voice mode.

---

## Implementation

### 1. Fix VAD stale closure bug in `useVoiceConversation.ts`
- Use a `stageRef` to track current stage value
- Change `onSilenceDetected` to read from `stageRef.current` instead of the closure `stage`
- Remove `stage` from `startListening` dependency array to prevent unnecessary re-creation

### 2. Restore developer sections in `ApiTestingPage.tsx`
- Add a tabbed section below the chat (or in the inspector sheet) with: **Endpoint Tester**, **API Key Manager**, **Usage Analytics**, **Voice Settings**
- These components already exist and just need to be wired back in
- Place them in the existing Sheet (inspector drawer) using Tabs

### 3. Add "Powered by TAMADA" to `ToastCard.tsx`
- Add a subtle footer line: "Powered by TAMADA AI" at the bottom of each toast card

### 4. Lift language state to `ApiTestingPage.tsx`
- Move the `language` state from `ChatSimulator` up to `ApiTestingPage`
- Pass it down to both `ChatSimulator` and `FullVoiceMode`
- Show active language clearly in the header toggle (highlight active option)

### Files to modify
- `src/hooks/useVoiceConversation.ts` — fix stale closure
- `src/pages/ApiTestingPage.tsx` — restore sections, lift language state
- `src/components/api-testing/ChatSimulator.tsx` — accept language as prop
- `src/components/api-testing/ToastCard.tsx` — add "Powered by TAMADA"

