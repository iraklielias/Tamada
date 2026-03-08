

# Review: Remaining Leaks in Current Implementation

## Status of Previously Identified Issues

| # | Issue | Status |
|---|-------|--------|
| 1 | Chat/Voice don't share state | **Fixed** — `useInternalTamadaChat` lifted to `AIGeneratePage` (line 150), passed as `chat` prop to both `AIChatPanel` and `AIVoiceMode` |
| 2 | No backend PRO gate | **Fixed** — Lines 891-896 of edge function check `isPro` for `chat_generate`/`chat_voice`, return 403 |
| 3 | Voice onMessage is no-op | **Partially fixed** — Still `() => {}` at line 1028, but `AIVoiceMode.handleMessage` calls `chat.addMessage()` which writes to the shared hook, so messages persist. The no-op is harmless now. |
| 4 | Audio storage cleanup | **Not addressed** (low priority, accepted as TODO) |
| 5 | Every chat turn = generation | **Not addressed** (product decision, accepted) |
| 7 | Language from localStorage | **Fixed** — Uses `i18n.language` via `currentLang` (line 151) |

## NEW Bug Found: Duplicate Chat History in Voice Mode

**Severity: Medium (data quality / token waste)**

**Root cause:** Two independent code paths both push to `chatHistoryRef`:

1. `sendVoiceMessage()` in `useInternalTamadaChat.ts` (lines 86-97) — pushes user transcription and assistant content directly to `chatHistoryRef.current`
2. `AIVoiceMode.handleMessage()` (lines 26-27) calls `chat.addMessage()` which also pushes to `chatHistoryRef.current` (line 17 of `useInternalTamadaChat.ts`)

**Result:** Every voice turn produces TWO entries in `chatHistoryRef` — one from `sendVoiceMessage`, one from `addMessage`. The next API call sends duplicated conversation history, wasting tokens and potentially confusing the AI.

**Fix:** Remove the `chatHistoryRef.current.push()` calls from `sendVoiceMessage` (lines 86-97). Let `AIVoiceMode.handleMessage` → `addMessage` be the single source of truth for history tracking. `sendVoiceMessage` should only return data, not mutate shared state.

However, there's a subtlety: `sendVoiceMessage` sends `chatHistoryRef.current` as `chat_messages` at line 78 — this happens BEFORE `addMessage` is called. So the history for the current request is correct. The duplicate only affects subsequent requests. The fix is still to remove lines 86-97 since `addMessage` handles it.

**Note for text mode:** `sendTextMessage` calls `addMessage` for the user message BEFORE the API call (line 32), then sends `chatHistoryRef.current` (line 38). This is correct — no duplication since only `addMessage` writes to history.

## Fix Plan

| File | Change |
|------|--------|
| `src/hooks/useInternalTamadaChat.ts` | Remove lines 85-97 (the `chatHistoryRef.current.push` calls inside `sendVoiceMessage`). The `AIVoiceMode.handleMessage` → `addMessage` path handles history. |

Single file, 13 lines removed. No other issues found.

