

# Fix: Voice Mode Broken — Two Bugs

## Bug 1: Critical Syntax Error in FullVoiceMode.tsx (from design polish)

Lines 176-189 have a **broken function structure**. The `handleClose` callback is missing its closing brace, and a `useLayoutEffect` hook got nested inside it during the design polish edit:

```tsx
// Line 176-189 — BROKEN
const handleClose = useCallback(() => {
  // ← missing closing brace here
  useLayoutEffect(() => {         // ← React hook INSIDE a callback = crash
    ...
  }, [lastResponse, expanded]);

  voice.endSession();
  onClose();
}, [voice, onClose]);
```

This violates React's Rules of Hooks and will crash the component on render — **this is why voice mode doesn't work at all**.

**Fix**: Move `useLayoutEffect` out of `handleClose` and close the callback properly:

```tsx
const handleClose = useCallback(() => {
  voice.endSession();
  onClose();
}, [voice, onClose]);

useLayoutEffect(() => {
  const el = responseRef.current;
  if (!el) { setIsOverflowing(false); return; }
  setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
}, [lastResponse, expanded]);
```

## Bug 2: TTS 400 Crashes Voice Pipeline

In `tamada-external-api/index.ts` line 806, status `400` is not in the graceful degradation list. When ElevenLabs rejects empty/punctuation-only text, the function throws instead of returning text-only.

**Fix** (line 806): Add `400` to the handled statuses:

```typescript
if ([400, 402, 403, 429].includes(response.status)) {
```

Also strengthen the empty-text guard (line 770) to strip non-speech characters:

```typescript
const speakable = text.replace(/[\s\-=_*#`~>|.,:;!?"""''()[\]{}]/g, "").trim();
if (!speakable) {
  console.warn("TTS text has no speakable content, skipping");
  return null;
}
```

## Files Changed

| File | Change |
|------|--------|
| `FullVoiceMode.tsx` | Fix hook placement — move `useLayoutEffect` out of `handleClose` |
| `tamada-external-api/index.ts` | Add 400 to graceful degradation + stronger empty-text guard |

