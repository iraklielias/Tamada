

# Master Execution Strategy: Chat UX Redesign + Full Voice Mode

## Current State Summary

The API testing page (`/api-testing`) is a developer-facing tool with:
- A **ChatSimulator** that combines text + voice-record-to-text in one view
- Manual input fields for `occasion_type`, `formality_level`, `tone`, `region`, `person_name`, `person_details` via an "Advanced Params" collapsible
- Voice "mode" is really just a record-transcribe-to-chat flow (press mic → record → STT → text message → AI responds → optional TTS playback)
- The backend (`tamada-external-api`) already supports multi-turn conversation, STT (Scribe v2), TTS (Eleven v3), and toast detection with delimiters

Two core problems:
1. **UX is developer-grade, not product-grade** — raw param inputs, no guided flow, no conversational parameter gathering
2. **Voice mode is record-and-transcribe, not a real-time voice conversation** — user wants a ChatGPT/Gemini-style continuous voice session

---

## Phase 1: Conversational Parameter Gathering (AI-Driven)

**Goal**: Remove manual param inputs. The AI asks the user for occasion, person, tone, etc. through natural conversation.

### 1a. Update System Prompt (Edge Function)
- Add a `PARAMETER_GATHERING` layer to `FULL_SYSTEM_PROMPT` in `tamada-external-api/index.ts`
- Instruct the AI: when a new session starts or user requests a toast without specifying details, the AI should ask conversationally:
  - "რა შემთხვევაა?" (What's the occasion?)
  - "ვის ეძღვნება?" (Who is it for?)
  - "რა ტონს ამჯობინებთ?" (What tone do you prefer?)
- AI should extract structured params from conversation context and include them in its generation
- Add a new response metadata field `extracted_params` so the frontend knows what was gathered

### 1b. Backend: Store Extracted Params
- When the AI responds, parse `extracted_params` from AI output (using a structured JSON block after the conversational text)
- Store extracted params in the session metadata or a new `session_params` column on `external_chat_sessions`
- Pass accumulated params to subsequent AI calls so context persists across turns

### 1c. Frontend: Remove Manual Params, Add Smart Chips
- **Remove** the Advanced Params collapsible and raw input fields from `ChatSimulator`
- **Keep** occasion quick-chips but restyle as elegant suggestion cards (not tiny buttons)
- When user taps a chip, send it as a natural message: "ქორწილის სადღეგრძელო მინდა" instead of setting hidden params
- Show extracted params as subtle badges in the chat header (e.g., "🎉 Wedding · 👤 Nino · Formal")

---

## Phase 2: Chat UX Polish

**Goal**: Elevate from developer tool to polished product experience.

### 2a. Page Layout Redesign
- **Default view**: Full-width chat (no inspector panel for end-users)
- **Developer toggle**: Small gear icon reveals API Inspector as a slide-out drawer (not side-by-side)
- Move API key + user ID inputs into a settings drawer/modal — not the chat header
- Clean header: TAMADA AI logo/name + language toggle + settings gear

### 2b. Chat Bubble Redesign
- **User bubbles**: Wine-colored with subtle gradient, rounded with tail
- **AI bubbles**: Card-style with warm parchment background, serif font for toasts
- **Toast cards**: Elevated design — decorative border, Georgian ornamental accent, play/copy/share actions as icon buttons
- Add typing indicator with animated dots (replace plain Loader2 spinner)
- Add markdown rendering for AI responses using `react-markdown` (or manual prose styling)

### 2c. Mobile-First Layout
- Full-screen chat on mobile with floating input bar
- Quick chips as horizontal scroll strip above input
- Voice mode button integrated into the input bar (mic icon next to send)
- Bottom sheet for settings instead of inline controls

### 2d. Welcome Experience
- Replace plain text welcome with a styled welcome card showing TAMADA AI identity
- Include 3-4 suggestion cards: "ქორწილის სადღეგრძელო", "დაბადების დღე", "მეგობარს", "სტუმარს"
- Cards trigger the conversational flow, not param injection

---

## Phase 3: Full Voice Mode (Real-Time Conversation)

**Goal**: A dedicated immersive voice-to-voice experience, similar to ChatGPT voice mode.

### 3a. Architecture Decision
Two approaches available:
- **Option A: ElevenLabs Conversational AI Agent** (`@elevenlabs/react` `useConversation` hook) — real-time WebRTC voice-to-voice with an ElevenLabs agent. Requires configuring an ElevenLabs Agent in their dashboard with our system prompt.
- **Option B: Custom STT→AI→TTS loop with auto-listen** — Enhance the current pipeline to auto-listen after TTS finishes, creating a continuous conversation loop. No external agent needed, uses existing infrastructure.

**Recommended: Option B** (Custom loop) because:
- We already have STT + AI + TTS working end-to-end
- We retain full control of the TAMADA system prompt and conversation flow
- No dependency on ElevenLabs Agent configuration/dashboard
- Lower latency since we can start TTS streaming while AI generates

### 3b. New Full Voice Mode UI Component
Create `src/components/api-testing/FullVoiceMode.tsx`:
- **Immersive overlay** that takes over the screen (like ChatGPT voice mode)
- Central animated orb/waveform that visualizes:
  - **Listening**: Pulsing wine-colored ring, subtle waveform from mic input
  - **Transcribing**: Spinning dots animation
  - **Thinking**: Warm glow pulse
  - **Speaking**: Waveform animated to TTS audio output
- **Minimal controls**: Tap-to-interrupt (stop AI speaking), end session button, text fallback button
- Live transcript appearing below the orb as subtle fading text
- Session params shown as floating badges

### 3c. Auto-Listen Loop Hook
Create `src/hooks/useVoiceConversation.ts`:
- State machine: `idle → listening → transcribing → thinking → speaking → listening → ...`
- Auto-start recording after TTS playback ends
- Use `MediaRecorder` with voice activity detection (VAD) — stop recording after ~1.5s silence
- Send audio to existing `chat_message_voice` action
- Play response audio, then auto-resume listening
- User can tap to interrupt at any point (stops TTS, starts listening)
- Expose `startSession()`, `endSession()`, `interrupt()`, `currentStage`

### 3d. VAD (Voice Activity Detection)
- Use Web Audio API `AnalyserNode` to detect silence
- When volume drops below threshold for 1.5s, auto-stop recording and send
- This creates the natural "speak and it understands" feel

### 3e. Backend Optimization for Voice Loop
- Add `mode: "voice"` param to `chat_message_voice` action
- When `mode === "voice"`, the AI should:
  - Respond more concisely in conversational turns (gathering info)
  - Only produce full toasts when ready
  - Omit delivery marks (already handled)
- Consider streaming TTS to reduce time-to-first-audio

### 3f. Integration into Page
- Add a prominent "Voice Mode" FAB (floating action button) on the chat view
- Tapping it opens the full voice overlay
- Voice mode shares the same session/history as text chat
- User can switch between text and voice seamlessly

---

## Phase 4: Param Persistence + Generation Bridge

**Goal**: When the AI gathers all params through conversation, persist them and optionally trigger the existing toast generation pipeline.

### 4a. Session Params Table
- Add migration: `ALTER TABLE external_chat_sessions ADD COLUMN gathered_params jsonb DEFAULT '{}'`
- Backend updates this as AI extracts params from conversation

### 4b. Generation Trigger
- When AI has gathered sufficient params (occasion + at least one detail), it can:
  - Generate a toast inline (current behavior, already works)
  - Or offer to generate a formal toast: "მზად ვარ სადღეგრძელოს შესაქმნელად. გსურთ?"
- The toast generation uses the same `generateAIResponse` with accumulated context

---

## Execution Order

```text
Phase 1a → 1b → 1c    (AI-driven param gathering — backend then frontend)
Phase 2a → 2b → 2c → 2d  (UX polish — can parallel with Phase 1)
Phase 3c → 3d → 3b → 3e → 3f  (Voice mode — hook first, then UI, then backend)
Phase 4a → 4b           (Persistence — after Phase 1 is validated)
```

### Estimated Scope
- **Phase 1**: 3 steps — prompt engineering + backend param extraction + frontend cleanup
- **Phase 2**: 4 steps — layout, bubbles, mobile, welcome
- **Phase 3**: 5 steps — hook, VAD, UI overlay, backend optimization, integration
- **Phase 4**: 2 steps — migration + bridge logic

Total: ~14 implementation steps across 4 phases.

---

## Technical Details

### Files to Create
- `src/components/api-testing/FullVoiceMode.tsx` — immersive voice overlay
- `src/hooks/useVoiceConversation.ts` — auto-listen voice loop state machine
- `src/hooks/useVAD.ts` — voice activity detection via Web Audio API

### Files to Modify
- `supabase/functions/tamada-external-api/index.ts` — prompt updates, param extraction, voice mode flag
- `src/components/api-testing/ChatSimulator.tsx` — remove manual params, redesign layout
- `src/components/api-testing/ChatBubble.tsx` — elevated design
- `src/components/api-testing/ToastCard.tsx` — premium toast card design
- `src/components/api-testing/ProcessingStages.tsx` — richer animations
- `src/pages/ApiTestingPage.tsx` — layout restructure, voice mode entry point

### No New Dependencies Required
- Web Audio API (native) for VAD
- `framer-motion` (already installed) for voice mode animations
- All existing ElevenLabs integration stays as-is

