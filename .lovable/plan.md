

# Bug: Gathered Params Injection Broken — Role Mapping Strips System Messages

## Root Cause

In `generateAIResponse()` (line 703-704), the role mapping logic is:

```javascript
role: m.role === "assistant" ? "assistant" : "user"
```

This converts **every** non-assistant message to `"user"` — including the `{ role: "system", content: "[ALREADY_GATHERED_PARAMS: ...]" }` message we inject. The AI receives it as a user message, not a system instruction, so it has no authoritative weight and gets ignored.

## Fix

**File:** `supabase/functions/tamada-external-api/index.ts` (line 703-704)

Change the role mapping to preserve system messages:

```javascript
role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
```

This is a one-line fix. No other files need changes. The gathered params context will now correctly arrive as a system-level instruction that the AI model treats authoritatively.

## Impact

- Text chat: gathered params will persist across turns
- Voice chat: same fix applies (same `generateAIResponse` function is shared)
- No frontend changes needed

