

# Implementation Review: Potential Leaks and Issues

After thorough inspection of all Phase 1-3 files, here are the issues found:

---

## 1. Chat State Not Shared Between Chat and Voice Mode (Critical UX Bug)

**Problem:** `AIChatPanel` and `AIVoiceMode` each call `useInternalTamadaChat()` independently, creating **separate** hook instances with separate `messages` and `chatHistoryRef` arrays. When a user switches from chat to voice mode (via the mic button in chat), the conversation history is lost. The voice mode starts fresh with no context.

**Fix:** Lift `useInternalTamadaChat()` to `AIGeneratePage` and pass the shared instance down to both `AIChatPanel` and `AIVoiceMode` as a prop.

---

## 2. No PRO Gate on Backend for chat_generate / chat_voice (Security Leak)

**Problem:** The PRO gate for chat/voice is only enforced client-side (checking `isPro` before opening the modal). The edge function's rate limit logic applies the same 5-generation daily cap for free users, but it does NOT explicitly reject non-PRO users from `chat_generate` / `chat_voice` actions. A free user who knows the API can call these actions directly and use them up to their 5-generation limit.

**Fix:** Add an explicit PRO check in the edge function for `chat_generate` and `chat_voice` actions — if the user profile `is_pro` is false, return a 403 with a message.

---

## 3. Voice Mode `onMessage` Callback Is a No-Op

**Problem:** In `AIGeneratePage.tsx` line 1024, the voice mode's `onMessage` prop is `() => {}`. This means voice transcription/response text is never surfaced to the user after voice mode closes. If a user has a conversation in voice mode and closes it, there's no record.

**Impact:** Minor — voice mode shows its own transcript. But the `AIVoiceMode` component also calls `chat.addMessage()` inside `handleMessage`, which writes to its own local hook instance (see issue #1), so even the internal tracking is lost.

**Fix:** Resolved by fixing issue #1 (shared chat instance).

---

## 4. Audio Files in `chat-audio` Bucket Never Cleaned Up (Storage Leak)

**Problem:** Every voice response generates an MP3 file stored in `chat-audio/internal-chat/{userId}/{msgId}.mp3`. These files are never deleted. Over time this will accumulate significant storage costs.

**Fix:** Add a retention policy or a scheduled cleanup. For now, add a comment/TODO and consider implementing lifecycle rules on the storage bucket. Not urgent for MVP.

---

## 5. `chat_generate` Logs Every Message as a Generation (Rate Limit Issue)

**Problem:** Every conversational turn (even "hello", "what's your name?") is logged to `ai_generation_log` and counted toward the daily limit. A PRO user gets 100/day — a 10-turn conversation consumes 10 generations. For text chat this could burn through limits quickly.

**Impact:** Moderate — could frustrate PRO users who have long conversations.

**Fix:** Consider only counting turns that produce a toast (where `isToast === true`) as generations, or count an entire chat session as 1 generation. For now, this is a product decision — flag it but don't change behavior without user input.

---

## 6. `refine_toast` Action Missing User Context Injection

**Problem:** The `refine_toast` action constructs `userMessage` but the AI call uses `fullSystemPrompt` which includes user context. However, the refinement prompt doesn't reference the user's learned preferences for the refinement — it only sends the current toast + instructions. This is actually fine since the system prompt already contains the user context block.

**Status:** No leak — works correctly.

---

## 7. Language Detection Inconsistency

**Problem:** Language is read from `localStorage.getItem('tamada-lang')` in three places in `AIGeneratePage.tsx` (lines 605, 995, 1012, 1022). If the value is null or something unexpected, it defaults to `'ka'`. This is consistent but fragile — if i18n language changes and localStorage isn't updated, the chat/voice mode will use the wrong language.

**Fix:** Minor — use i18n's `i18n.language` directly instead of reading localStorage.

---

## Summary of Required Fixes

| Issue | Severity | Fix |
|-------|----------|-----|
| 1. Chat/Voice don't share state | High | Lift `useInternalTamadaChat` to parent |
| 2. No backend PRO gate on chat actions | High (security) | Add PRO check in edge function |
| 3. Voice onMessage is no-op | Medium | Fixed by #1 |
| 4. Audio files never cleaned up | Low | TODO/future lifecycle policy |
| 5. Every chat turn counts as generation | Medium (product) | Product decision needed |
| 6. Refine toast context | None | Works correctly |
| 7. Language from localStorage | Low | Use i18n.language instead |

### Files to Change

| File | Changes |
|------|---------|
| `src/pages/AIGeneratePage.tsx` | Lift `useInternalTamadaChat` to component level, pass to chat/voice; use `i18n.language` for language |
| `src/components/ai-chat/AIChatPanel.tsx` | Accept chat instance as prop instead of creating its own |
| `src/components/ai-chat/AIVoiceMode.tsx` | Accept chat instance as prop instead of creating its own |
| `supabase/functions/tamada-ai/index.ts` | Add PRO-only guard for `chat_generate` and `chat_voice` actions |

