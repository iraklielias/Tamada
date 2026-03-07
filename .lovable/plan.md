

# Fix: Voice Mode Transcribing Noise as Speech

## Root Cause Analysis

The screenshot shows the core issue: STT is returning `[clicking]`, `[pause]`, `[background noise]` as transcriptions. These are **audio event tags** from ElevenLabs Scribe v2. The system then sends them to the AI as real user messages, producing empty or confused assistant responses.

**Three compounding problems:**

1. **STT returns audio event tags** — Scribe v2 defaults `tag_audio_events` to `true`, so non-speech sounds produce bracketed tags like `[clicking]`. The edge function does not filter these out.

2. **No non-speech filter on transcription results** — After STT returns, the code only checks `!transcribedText.trim()`. Text like `[background noise]` passes this check and gets sent to the AI.

3. **VAD thresholds too sensitive** — Speech threshold at `0.03` RMS triggers on ambient noise, causing the recorder to "detect speech" from background sounds, then auto-stop after 1.8s silence, sending garbage audio to STT.

## Fix Plan (2 files)

### 1. `supabase/functions/tamada-external-api/index.ts` — Filter non-speech STT results

**In `transcribeAudio` function (~line 746):**
- Explicitly set `tag_audio_events` to `false` in the form data to prevent Scribe from returning bracketed event tags at all.

**After STT result (~line 962):**
- Add a regex filter that strips bracketed audio events: `text.replace(/\[.*?\]/g, "").trim()`
- If the cleaned text is empty after stripping, return a 400 "no speech detected" response (same as current empty check)

```typescript
// After line 960
const cleanedTranscription = transcribedText.replace(/\[.*?\]/g, "").trim();

if (!cleanedTranscription) {
  return new Response(JSON.stringify({ 
    error: "No speech detected. Please try again." 
  }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
```

### 2. `src/hooks/useVoiceConversation.ts` — Handle 400 gracefully + raise VAD thresholds

**Handle 400 "no speech" responses (~line 130):**
- When the API returns `{ success: false }` or a 400 error specifically for "no speech", don't set `error` stage — just silently restart listening. This prevents the error screen from showing when the user hasn't spoken yet.

```typescript
// In the catch block and success check
} catch (err: any) {
  // If it's a "no speech" 400, just restart listening
  if (err?.message?.includes("No speech") || err?.message?.includes("no speech")) {
    if (activeRef.current) startListening();
    return;
  }
  // ... existing error handling
}
```

**Raise VAD thresholds:**
- `silenceThreshold`: `0.02` → `0.025` (less sensitive to ambient)
- `speechThreshold`: `0.03` → `0.045` (requires louder sound to count as speech)
- `silenceDurationMs`: `1800` → `2000` (longer pause before auto-stop)

These changes ensure:
- Background noise doesn't trigger speech detection
- Audio event tags from STT are never sent to the AI
- If only noise is recorded, the system silently restarts listening instead of showing an error

### Files Changed

| File | Changes |
|------|---------|
| `tamada-external-api/index.ts` | Disable `tag_audio_events`, filter bracketed tags from STT output |
| `useVoiceConversation.ts` | Handle "no speech" 400s gracefully, raise VAD thresholds |

