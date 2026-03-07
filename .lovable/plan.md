

# Fix: Voice Mode Not Speaking After Thinking

## Root Cause

The browser's **autoplay policy** blocks audio playback. In `useVoiceConversation.ts` line 140, a new `Audio` object is created after the async `sendVoiceMessage` call completes. By that point, the original user gesture (tapping the orb) has been consumed, so `audio.play()` is silently rejected — especially on mobile Safari.

The `.catch(() => { startListening() })` on line 148 swallows the rejection and silently restarts listening, making it appear the AI responded with text but never spoke.

## Fix

**Pre-create and unlock the Audio element** inside the user gesture context (when recording stops via tap), before the async API call begins. Then set its `src` after the response arrives.

### File: `src/hooks/useVoiceConversation.ts`

In the `recorder.onstop` handler (line 94), immediately create an `Audio` element and call `audio.play().catch(() => {})` to unlock it for later use. Store it in `audioRef`. After the API response arrives with `audio_url`, set `audioRef.current.src = url` and play again.

```
// Inside recorder.onstop, BEFORE the async work:
const preloadedAudio = new Audio();
preloadedAudio.play().catch(() => {}); // unlock for autoplay
audioRef.current = preloadedAudio;

// ... after API response, instead of creating new Audio():
if (res.message.audio_url && activeRef.current) {
  setStage("speaking");
  preloadedAudio.src = res.message.audio_url;
  preloadedAudio.onended = () => { if (activeRef.current) startListening(); };
  preloadedAudio.onerror = () => { if (activeRef.current) startListening(); };
  await preloadedAudio.play().catch(() => {
    if (activeRef.current) startListening();
  });
}
```

Also add a `console.warn` in the `.catch` so silent failures are visible during debugging.

### Single file change — `src/hooks/useVoiceConversation.ts` only.

