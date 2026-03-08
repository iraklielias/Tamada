

# Bug: AI Responds with Only Params Block, No Conversational Text

## Root Cause

When the user provides details (name, occasion, etc.), the AI sometimes responds with **only** a `===PARAMS===` extraction block and no conversational text. After `extractParams` strips the params block, `cleanContent` becomes empty. This causes:

1. TTS gets empty text → logs `"TTS text has no speakable content, skipping"` → returns `null`
2. No `audio_url` in the response
3. Voice mode goes to "ready" state silently — user sees "Tap to continue" with no AI response

This is confirmed by the edge function log at `10:02:31`: `WARNING TTS text has no speakable content, skipping`

## Fix Strategy

### 1. Guard against empty AI responses after param extraction

In both `handleChatMessage` and `handleChatMessageVoice`, after `extractParams`, check if `cleanContent` is empty. If so, provide a fallback acknowledgment message so the user always gets a response.

```typescript
// After extractParams
let { cleanContent, params: extractedParams } = extractParams(aiContent);

// If AI only emitted params with no text, generate a fallback
if (!cleanContent.replace(/[\s\-=_*#]/g, "").trim()) {
  cleanContent = language === "ka" 
    ? "მადლობა, ინფორმაცია მივიღე! ახლა მოვამზადებ სადღეგრძელოს..." 
    : "Thanks, got it! Let me prepare the toast now...";
}
```

### 2. Add system instruction to prevent params-only responses

Append to the system prompt or the gathered context injection a note telling the AI to always include conversational text alongside any `===PARAMS===` block.

Add to the gathered context system message:
```
IMPORTANT: NEVER respond with ONLY a ===PARAMS=== block. Always include a conversational message alongside it.
```

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/tamada-external-api/index.ts` | Add empty-content fallback after `extractParams` in both text and voice handlers; add instruction to prevent params-only responses |

