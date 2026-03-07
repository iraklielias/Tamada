

# Voice Mode Polish: Playback Stability + Mic Icon Upgrade

## Problem Analysis

**Audio stops during AI playback ("speaking" stage):**

The root cause is the auto-listen loop. After `source.onended` fires, the code immediately calls `startListening()`, which opens the mic and starts VAD. In noisy environments, this creates a problematic cycle:
1. AI finishes speaking → `startListening()` fires instantly
2. Mic picks up ambient noise (TV, room sounds, speaker echo)
3. VAD detects "speech" from noise → waits for silence → stops recorder
4. Sends garbage audio → gets "no speech" error or a confused AI response
5. The brief recording/processing gap feels like the AI "stopped suddenly"

Additionally, on some mobile devices, `source.onended` can fire prematurely if the AudioContext gets suspended by the OS (e.g., a notification sound), which would also feel like it "stopped."

**Mic icon is plain:** Currently a raw Lucide `<Mic>` icon with no visual refinement — no animated rings, no gradient, no state-aware styling.

## Execution Strategy

### 1. Disable Auto-Listen After Speaking — Require Tap to Continue

**File:** `src/hooks/useVoiceConversation.ts`

Change `source.onended` callback: instead of calling `startListening()`, transition to a new **"ready"** stage that shows the orb waiting for a tap. This gives the user full control and eliminates noise-triggered restarts.

- Add `"ready"` to the `VoiceStage` type: `"idle" | "ready" | "listening" | "transcribing" | "thinking" | "speaking" | "error"`
- `source.onended` → `setStage("ready")` instead of `startListening()`
- When no `audio_url` in response → also go to `"ready"` instead of `startListening()`
- "No speech" errors during listening → still silently restart (this is fine, user is actively speaking)
- Add a `resumeListening()` method exposed alongside `startSession`, called when user taps orb in "ready" state

### 2. Handle "Ready" Stage in FullVoiceMode

**File:** `src/components/api-testing/FullVoiceMode.tsx`

- Add `"ready"` to `STAGE_LABELS`: `{ ka: "დააჭირეთ გასაგრძელებლად", en: "Tap to continue" }`
- In `handleOrbClick`: when `stage === "ready"` → call `voice.resumeListening()` (same as starting to listen again)
- `VoiceOrb` treats "ready" visually like idle but with a subtle "ready" indicator (soft primary border, gentle pulse)

### 3. Polish the Mic Icon in VoiceOrb

**File:** `src/components/api-testing/FullVoiceMode.tsx` (VoiceOrb component)

Replace the plain `<Mic>` with a layered, state-aware microphone visualization:

- **Idle/Ready:** Mic icon with a subtle circular ring behind it that gently pulses — invites interaction
- **Listening:** Mic icon scales with volume, surrounded by concentric animated rings that react to voice amplitude
- **Speaking:** Replace mic with a small animated waveform or speaker icon to clearly differentiate "I'm talking" from "I'm listening"
- **Thinking:** Keep existing dot animation (already good)
- Increase icon size slightly (`w-9 h-9` → `w-10 h-10`) for better tap target on mobile
- Add a gradient fill to the mic icon itself using `text-primary` with subtle opacity layers

### 4. Stage Label for "Ready" State

The "ready" stage label should feel inviting — "Tap to continue" — making it clear the user is in control. The orb in "ready" state shows a soft primary glow (not the full idle fade) to indicate the session is still active.

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useVoiceConversation.ts` | Add "ready" stage, stop auto-listen after speaking, expose `resumeListening()` |
| `src/components/api-testing/FullVoiceMode.tsx` | Handle "ready" stage in orb click, upgrade VoiceOrb mic visuals, add stage label |
| `src/components/api-testing/ThinkingFacts.tsx` | No changes needed |

No database changes. No edge function changes. No breaking changes to the voice pipeline or VAD logic.

