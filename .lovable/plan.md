

# Root Cause Analysis: Voice Mode Not Speaking

## The Real Bug

The current "pre-unlock" approach (`new Audio(); audio.play().catch(() => {})` with no source) **does not work on mobile Safari**. Playing an Audio element with no `src` produces an error — it doesn't actually unlock the element for future playback. The gesture context is consumed by the failed play, not preserved.

There are also **two paths** into `recorder.onstop`:
1. **Manual tap** → `stopListening()` → pre-creates Audio → `recorder.stop()` — gesture context exists but unlock fails (no src)
2. **VAD auto-stop** → `recorder.stop()` called from `requestAnimationFrame` callback — **no gesture context at all**, `preloadedAudioRef` is null, falls back to `new Audio()` which also can't play

In both cases, `preloadedAudio.play()` on line 155 fails, the `.catch` on line 156-158 calls `startListening()`, and the user sees "listening" again immediately after "thinking" — which is exactly the reported symptom.

## Fix Strategy: Web Audio API Playback

Replace `HTMLAudioElement` playback with `AudioContext` + `fetch` + `decodeAudioData`. An `AudioContext` created or `.resume()`d during a user gesture stays unlocked for all subsequent playback — no per-play gesture needed.

### File: `src/hooks/useVoiceConversation.ts` — Full Rewrite of Audio Playback

**Step 1: Add a persistent `AudioContext` ref**
- Create `audioCtxRef = useRef<AudioContext | null>(null)`
- Add `sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)` for interrupt support

**Step 2: Unlock AudioContext in `stopListening` (gesture handler)**
```typescript
const stopListening = useCallback(() => {
  // Create or resume AudioContext in the user gesture — stays unlocked
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  } else if (audioCtxRef.current.state === "suspended") {
    audioCtxRef.current.resume();
  }
  // stop recording
  if (mediaRecorderRef.current?.state === "recording") {
    mediaRecorderRef.current.stop();
  }
}, []);
```

**Step 3: Also unlock in `startSession` (first tap is also a gesture)**
```typescript
const startSession = useCallback(async () => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  } else if (audioCtxRef.current.state === "suspended") {
    audioCtxRef.current.resume();
  }
  activeRef.current = true;
  await startListening();
}, [startListening]);
```

**Step 4: Replace Audio element playback in `recorder.onstop`**
Instead of `preloadedAudio.src = url; preloadedAudio.play()`, do:
```typescript
if (res.message.audio_url && activeRef.current) {
  setStage("speaking");
  try {
    const ctx = audioCtxRef.current!;
    if (ctx.state === "suspended") await ctx.resume();
    const response = await fetch(res.message.audio_url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    sourceNodeRef.current = source;
    source.onended = () => {
      sourceNodeRef.current = null;
      if (activeRef.current) startListening();
    };
    source.start(0);
  } catch (err) {
    console.warn("Web Audio playback failed:", err);
    if (activeRef.current) startListening();
  }
}
```

**Step 5: Update `interrupt` and `stopAudio`**
```typescript
const stopAudio = useCallback(() => {
  if (sourceNodeRef.current) {
    try { sourceNodeRef.current.stop(); } catch {}
    sourceNodeRef.current = null;
  }
}, []);
```

**Step 6: Clean up in `endSession` and unmount**
- Call `audioCtxRef.current?.close()` in `endSession`
- Same in the cleanup `useEffect`

**Step 7: Remove dead refs**
- Remove `audioRef`, `preloadedAudioRef` — no longer needed

### File: `src/components/api-testing/FullVoiceMode.tsx` — No changes needed

The component only reads `voice.stage` and calls `voice.stopListening()` / `voice.interrupt()` — all still work with the new internals.

### Summary of Changes

| What | Why |
|------|-----|
| Replace `HTMLAudioElement` with `AudioContext` | Reliable cross-browser playback after gesture unlock |
| Unlock `AudioContext` in `startSession` + `stopListening` | Both are user gesture handlers, ensures context is always unlocked |
| Fetch + `decodeAudioData` for response audio | Works with unlocked AudioContext regardless of async delay |
| `BufferSourceNode.stop()` for interrupt | Clean interrupt support |
| Remove `audioRef` / `preloadedAudioRef` | Dead code cleanup |

Single file change: `src/hooks/useVoiceConversation.ts`

