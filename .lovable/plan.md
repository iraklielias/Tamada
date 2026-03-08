

# Fix: Audio Cuts Off During Long Toast Playback

## Root Cause

The `synthesizeSpeech` function in `tamada-external-api/index.ts` (line 770) sends the **entire text** to ElevenLabs TTS in a single API call. ElevenLabs has a ~5,000 character limit per request. Georgian toasts with conversational wrapping routinely hit 2,000-4,000+ characters. When exceeded, ElevenLabs **silently truncates** the audio — no error, just shorter output.

Additionally, `max_tokens: 1500` on the AI call (line 709) can produce responses close to that character boundary.

## Verification

The playback code itself (Web Audio API in `useVoiceConversation.ts`, lines 148-177) is correct — it fetches, decodes, and plays the full buffer. The issue is upstream: the MP3 file in storage is already truncated.

## Fix Strategy

**Single file change:** `supabase/functions/tamada-external-api/index.ts`

### 1. Add text chunking helper (~15 lines)

```typescript
function splitTextForTTS(text: string, maxChars = 4500): string[] {
  if (text.length <= maxChars) return [text];
  // Split on sentence boundaries (Georgian and English)
  const sentences = text.match(/[^.!?।]+[.!?।]+\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxChars && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
```

### 2. Modify `synthesizeSpeech` to chunk and concatenate

- Call `splitTextForTTS(text)` at the top
- If single chunk, proceed as before (no behavior change for short text)
- If multiple chunks, call ElevenLabs for each sequentially, concatenate the `Uint8Array` results, return combined audio
- Use ElevenLabs `previous_text`/`next_text` request stitching for smooth prosody across chunks

### 3. Extract toast body for TTS (optimization)

On line 1034, when `isToast` is true, extract only the content between `===TOAST_START===` / `===TOAST_END===` for TTS instead of the full `cleanContent` (which includes conversational preamble). This reduces character count significantly.

### 4. Add logging

Add `console.log("TTS text length:", text.length)` before the ElevenLabs call for observability.

## What stays untouched

- `useVoiceConversation.ts` — playback logic is correct
- `useAudioPlayer.ts` — not involved in voice mode
- `FullVoiceMode.tsx` — UI layer, no changes needed
- All client-side code — zero changes

## Risk Assessment

- **Low risk**: Chunking only activates for text > 4500 chars; short responses follow the exact same code path as today
- **Request stitching** ensures no audible seams between chunks
- **Sequential chunk synthesis** adds latency for very long toasts (~2-5s extra per chunk), but this is preferable to truncated audio

