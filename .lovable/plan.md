

# Bug: AI Keeps Re-asking for Name/Details — Memory Loss

## Root Cause

Two compounding bugs in `tamada-external-api/index.ts`:

**Bug 1: Gathered params never injected back into AI context.**
The system extracts params (`===PARAMS===` blocks) from AI responses and stores them in `session.gathered_params` (line 884-888). But on the next turn, these stored params are **never sent back to the AI**. The AI only receives raw message history via `loadRecentMessages()` — it has no idea what it previously extracted.

**Bug 2: Params blocks stripped before storing messages.**
The `===PARAMS===` block is stripped from the AI's response before saving to `external_chat_messages` (line 881: `extractParams(aiContent)` → stores `cleanContent`). So when `loadRecentMessages` loads history on the next turn, the AI's own previous responses no longer contain the params it emitted. The AI literally cannot see what it gathered before.

**Bug 3 (minor): Message limit too tight for voice.**
`loadRecentMessages` defaults to `limit=10`. Voice mode generates 2 messages per exchange (user + assistant), so after just 5 turns the earliest context — including the initial occasion/name answers — falls off the window.

**Result:** The AI asks "who is the toast for?", user answers, AI extracts `person_name` but that extraction is stripped and never re-injected. Next turn, AI sees no record of the name → asks again.

## Fix Strategy

### 1. Inject `gathered_params` into AI context (primary fix)

Before calling `generateAIResponse`, prepend a system message with the current `gathered_params` so the AI knows what's already been collected:

```text
[ALREADY_GATHERED_PARAMS: {"occasion_type":"birthday","person_name":"გიორგი","formality_level":null,...}]
Do NOT re-ask for information that is already gathered above.
```

This goes into both `handleChatMessage` (line ~877) and `handleChatMessageVoice` (line ~984), right before the AI call.

### 2. Increase message history limit for voice

Change `loadRecentMessages(session.id)` calls to `loadRecentMessages(session.id, 20)` — supports 10 exchanges before context drops off.

### 3. No frontend changes needed

The bug is entirely server-side in the edge function. No changes to `useVoiceConversation.ts`, `FullVoiceMode.tsx`, or `ChatSimulator.tsx`.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/tamada-external-api/index.ts` | Inject gathered_params into AI context before generation; increase message limit to 20 |

