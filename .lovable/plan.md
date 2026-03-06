

# Master Execution Plan: TAMADA External Chat API + Voice Mode + Testing Dashboard

## Current State Assessment

TAMADA has a mature internal AI system: a 160-line system prompt (Layers 0-2) in `tamada-ai/index.ts` covering identity, cultural knowledge, anti-hallucination, regional styles, and occasion protocols. It uses the Lovable AI Gateway (`google/gemini-2.5-flash`) with structured JSON output. There are also 8 build errors from missing Lucide imports and a property access issue that must be fixed first.

**Key architecture decision**: The external API will reuse the exact same TAMADA system prompt (all 160 lines, Layers 0-2) but adapt it for conversational mode. Instead of demanding JSON output, the external prompt will instruct the AI to respond naturally in conversation and mark toasts with `---` delimiters. The model will be `google/gemini-3-flash-preview` via the Lovable AI Gateway (not direct Gemini API calls — we use `https://ai.gateway.lovable.dev/v1/chat/completions` which already supports this model and requires no additional API key).

**ElevenLabs**: The user provided their API key. We will store it plus a default voice ID (`JBFqnCBsd6RMkjVDRZzb` — George) as secrets.

---

## Phase 0: Fix Build Errors (prerequisite)

Fix 8 TypeScript errors across 4 files before any new work:

- `AIGeneratePage.tsx`: Add `Pencil` to lucide-react imports
- `Index.tsx`: Use `'active' in g` guard before accessing `g.active` on GUESTS array items
- `NewFeastPage.tsx`: Add `Users, Clock` to lucide-react imports
- `ToastsPage.tsx`: Add `Copy, Heart` to lucide-react imports

No edge function error fixes needed (the `generate-toast` and `tamada-ai` errors from the previous plan were already in the codebase).

---

## Phase 1: Database & Storage Setup

**Database migration** — 4 new tables:

| Table | Purpose |
|---|---|
| `api_keys` | Hashed API keys for external clients, with rate limits and expiry |
| `external_chat_sessions` | Per-user chat sessions tied to an API key |
| `external_chat_messages` | Message history with `audio_url`, `audio_duration_seconds` |
| `external_usage_tracking` | Daily usage counters per user per API key |

All with RLS enabled. Policies gate dashboard access via `is_pro` on profiles (acceptable for MVP — not a security-critical admin role, just feature gating). The edge function uses the service role key to bypass RLS for external API operations.

**Storage**: Create public `chat-audio` bucket for TTS audio files.

**Indexes**: On key_hash, session lookup, message ordering, usage lookup.

---

## Phase 2: Store Secrets

Using the secrets tool:
- `ELEVENLABS_API_KEY` — user provided value
- `ELEVENLABS_VOICE_ID` — default `JBFqnCBsd6RMkjVDRZzb`

`LOVABLE_API_KEY` already exists and works for `google/gemini-3-flash-preview`.

---

## Phase 3: Edge Function — `tamada-external-api`

Single function at `supabase/functions/tamada-external-api/index.ts` with `verify_jwt = false`.

**System prompt strategy**: Embed the full TAMADA system prompt (Layers 0-2, identical to `tamada-ai/index.ts`) but replace the JSON output instruction with conversational behavior rules:

```text
[Full 160-line TAMADA prompt: Layers 0-2]

CONVERSATIONAL MODE ADDITIONS:
- Respond naturally in conversation, not JSON
- Mark toasts with --- delimiters
- End celebratory toasts with გაუმარჯოს!
- Keep chat responses short (1-3 sentences)
- VOICE MODE NOTE: Interpret transcription errors generously
```

**6 actions routed by request body `action` field:**

1. **`chat_message`** (text): API key auth via SHA-256 hash lookup → rate limit → get/create session → store user msg → load 10-msg context → call Lovable AI Gateway (`google/gemini-3-flash-preview`, non-streaming) → detect toast (--- delimiters, გაუმარჯოს!, length heuristic) → store response → return JSON

2. **`chat_message_voice`** (full pipeline): Same auth → decode base64 audio → ElevenLabs Scribe v2 STT (`kat`/`eng`) → store user msg with transcription → AI generation → detect toast → ElevenLabs Eleven v3 TTS → upload MP3 to `chat-audio` bucket → store msg with `audio_url` → return JSON with text + audio + transcription

3. **`generate_audio`** (TTS only): Look up existing message → verify ownership → ElevenLabs TTS → upload → update msg → return URL. No rate limit impact.

4. **`chat_history`**: Return last N messages for session including audio_url

5. **`clear_history`**: Delete session messages

6. **`usage`**: Return today's usage stats

**Technical details:**
- All AI calls go through `https://ai.gateway.lovable.dev/v1/chat/completions` with `model: "google/gemini-3-flash-preview"` — standard OpenAI-compatible format with `user`/`assistant` roles (the gateway handles role mapping)
- Base64 audio encoding uses Deno's `std/encoding/base64.ts` (not `btoa` with spread)
- CORS headers on all responses
- Quick params enrich the user message with occasion/formality/region context
- Welcome message on first session creation

---

## Phase 4: Types & Hooks

**New files:**

- `src/types/external-api.ts` — TypeScript interfaces for API requests, responses, messages, sessions, usage
- `src/hooks/useTamadaExternalApi.ts` — Wrapper hook for all 6 edge function actions with API key header management
- `src/hooks/useAudioRecorder.ts` — MediaRecorder API wrapper (start/stop, webm/opus capture, base64 output)
- `src/hooks/useAudioPlayer.ts` — Audio playback state (play/pause/duration/progress)

---

## Phase 5: API Testing Dashboard — Core Structure

**Route**: `/api-testing` inside `AppLayout` (protected)

**Navigation**: Add to `AppSidebar.tsx`, `BottomNav.tsx`, `App.tsx` routes, and i18n files.

**`src/pages/ApiTestingPage.tsx`** — 5-tab layout:

1. Chat Simulator (Phase 6)
2. Endpoint Tester (Phase 7)
3. API Keys (Phase 7)
4. Usage Analytics (Phase 7)
5. Voice Settings (Phase 7)

This phase creates the page shell, tab structure, and navigation integration.

---

## Phase 6: Chat Simulator Tab (most complex)

Split-screen layout:

**Left 60% — Interactive Chat:**
- Header: `external_user_id` input, language toggle, voice/text mode switch, usage badge
- Message list: `ChatBubble.tsx` (user right/blue, assistant left/gray), `ToastCard.tsx` (wine-bordered, copy/another/audio player)
- Text mode input: quick chips + advanced params collapsible + text input
- Voice mode input: `VoiceModeInput.tsx` with large mic button (`VoiceRecorder.tsx`), recording/processing/playing states, `ProcessingStages.tsx` (4-stage progress), fallback text input
- `AudioPlayer.tsx`: inline player with play/pause and duration on toast cards

**Right 40% — API Inspector:**
- `ApiInspector.tsx`: Real-time log of requests/responses, expandable JSON (`JsonViewer.tsx`), voice pipeline sub-entries (STT → AI → TTS), copy/clear

**Components:**
- `ChatSimulator.tsx`, `ChatBubble.tsx`, `ToastCard.tsx`, `VoiceRecorder.tsx`, `VoiceModeInput.tsx`, `AudioPlayer.tsx`, `ApiInspector.tsx`, `JsonViewer.tsx`, `ProcessingStages.tsx`

---

## Phase 7: Remaining Dashboard Tabs

**Endpoint Tester** (`EndpointTester.tsx`):
- Dropdown for 6 endpoints with pre-filled templates
- Audio record button for voice endpoint
- Editable JSON body, send button, formatted response

**API Keys** (`ApiKeyManager.tsx`):
- Generate key (crypto.randomUUID, SHA-256 hash, store hash, show key once)
- List keys (prefix, client name, status, last used)
- Deactivate/delete

**Usage Analytics** (`UsageAnalytics.tsx`):
- Daily text/voice counts, tokens, audio seconds
- Charts using recharts (already installed)

**Voice Settings** (`VoiceSettings.tsx`):
- Display current voice_id, model, stability/similarity settings
- Preview button (calls TTS with sample text)
- Note about env var configuration

---

## Phase 8: Polish & Integration Testing

- End-to-end testing of text and voice flows
- Error handling for ElevenLabs failures (quota, invalid audio)
- Rate limit edge cases
- CORS verification for external client access
- Flutter/Laravel integration documentation (reference only — not built in Lovable)

---

## File Summary

```text
NEW FILES (19):
  supabase/functions/tamada-external-api/index.ts
  src/pages/ApiTestingPage.tsx
  src/components/api-testing/ChatSimulator.tsx
  src/components/api-testing/ChatBubble.tsx
  src/components/api-testing/ToastCard.tsx
  src/components/api-testing/VoiceRecorder.tsx
  src/components/api-testing/VoiceModeInput.tsx
  src/components/api-testing/AudioPlayer.tsx
  src/components/api-testing/ApiInspector.tsx
  src/components/api-testing/JsonViewer.tsx
  src/components/api-testing/ProcessingStages.tsx
  src/components/api-testing/EndpointTester.tsx
  src/components/api-testing/ApiKeyManager.tsx
  src/components/api-testing/UsageAnalytics.tsx
  src/components/api-testing/VoiceSettings.tsx
  src/types/external-api.ts
  src/hooks/useTamadaExternalApi.ts
  src/hooks/useAudioRecorder.ts
  src/hooks/useAudioPlayer.ts

MODIFIED FILES (8):
  src/pages/AIGeneratePage.tsx (fix import)
  src/pages/Index.tsx (fix property access)
  src/pages/NewFeastPage.tsx (fix imports)
  src/pages/ToastsPage.tsx (fix imports)
  src/App.tsx (add route)
  src/components/AppSidebar.tsx (add nav)
  src/components/BottomNav.tsx (add nav)
  src/i18n/locales/en.json + ka.json (add keys)
  supabase/config.toml (add function)
```

---

## Secrets Required

| Secret | Status |
|---|---|
| `LOVABLE_API_KEY` | Already exists |
| `ELEVENLABS_API_KEY` | User provided — needs storing |
| `ELEVENLABS_VOICE_ID` | Default `JBFqnCBsd6RMkjVDRZzb` — needs storing |

---

## Out of Scope (external team)

- Laravel proxy routes (PHP documentation only)
- Flutter/Dart client integration (documentation only)
- Stripe billing for API usage
- ElevenLabs voice cloning

