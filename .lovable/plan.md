

# Upgrade Plan: TAMADA AI System Prompt v2.0

## Current State

The system prompt exists in **5 edge functions**, each with a copy-pasted variant of the v1.0.0 prompt (~160 lines, ~4KB). The new v2.0 prompt is ~800 lines (~15KB) — a massive upgrade adding verified historical references, proverbs, opening/closing repertoires, metaphor domains, quality criteria, voice mode, error handling, and prompt injection protection.

### What's Changing (v1.0 → v2.0)

| Area | v1.0 | v2.0 |
|---|---|---|
| Identity | Generic 3-domain summary | Deep personality portrait, prompt injection defense |
| Critical Rules | Scattered in layers | 10 explicit absolute-priority rules |
| References | "Use David the Builder, Queen Tamar" | 9 historical figures with dates, contexts, usage guidance |
| Rustaveli | "Use themes" | 4 verified quotes with Georgian + English |
| Proverbs | None | 24 verified proverbs organized by context |
| Regional Styles | 1-line descriptions | Full paragraphs with essence, markers, 2 example fragments each |
| Occasions | Basic protocols | Deep psychological guidance per occasion |
| Toast Openings | None | 12 categorized opening patterns |
| Toast Closings | None | 15+ closings with anti-patterns |
| Metaphor Domains | None | 8 domains with usage guidance + domains to avoid |
| Toast Structures | Basic | Detailed with word counts, memorial-specific |
| Quality Criteria | None | 7 criteria + 7 anti-patterns |
| Georgian Language | Experience levels only | Grammar safety rules, formality markers |
| Voice Mode | None (external only had brief note) | Full section with length/style calibration |
| Error Handling | None | Sensitive topic reframing guide |
| Output Format | JSON instruction appended | `===TOAST_START/END===` delimiters |
| Bilingual | None | Explicit bilingual output rules |

## Affected Functions & Adaptation Strategy

### 1. `tamada-ai/index.ts` (primary toast generator + feast advisory)
- **Replace** `SYSTEM_PROMPT` (lines 15-160) with the full v2.0 prompt
- **Adaptation**: This function demands JSON output via user messages, NOT the system prompt. The v2.0 `<OUTPUT_FORMAT>` section uses `===TOAST_START/END===` delimiters for conversational mode. For this function, we append a JSON output instruction to the user message (already done today) — the system prompt's output format section is fine as-is since the user message override takes precedence.
- **Keep**: `buildUserContextBlock()` helper injects `<USER_PREFERENCES>` dynamically — this aligns perfectly with v2.0's `<PREFERENCE_APPLICATION>` section.
- **Keep**: All action routing, maps, and business logic unchanged.

### 2. `tamada-external-api/index.ts` (external chat API)
- **Replace** `CORE_SYSTEM_PROMPT` (lines 17-136) with v2.0 prompt
- **Simplify** `CONVERSATIONAL_ADDITIONS` — v2.0 already includes `<CONVERSATIONAL_BEHAVIOR>`, `<VOICE_MODE>`, `<OUTPUT_FORMAT>` sections. The additions only need toast marking format (`---` delimiters for external API vs `===TOAST_START/END===`).
- **Toast detection**: Update detection logic to look for `===TOAST_START===` / `===TOAST_END===` delimiters AND `---` delimiters (backward compat).

### 3. `generate-feast-plan/index.ts` (feast plan generator)
- **Replace** `MASTER_SYSTEM_PROMPT` Layers 0-2 portion (lines 16-161) with v2.0 prompt
- **Keep** Feast Plan layers (F1, F2) appended after the v2.0 core — these are function-specific
- **Keep**: `buildUserContextBlock()` and all business logic

### 4. `generate-toast/index.ts` (simple toast generation)
- **Replace** `MASTER_SYSTEM_PROMPT` (lines 14-69) with v2.0 prompt
- **Keep** the JSON output instruction at the end (already appended via user message)
- Note: This function uses a condensed v1.0 — upgrading to full v2.0 will significantly improve output quality

### 5. `regenerate-library/index.ts` (library batch regeneration)
- **Replace** `SYSTEM_PROMPT` (lines 10-50) with v2.0 prompt + JSON output appendix
- This is a batch processor — benefits from richer cultural knowledge but needs the JSON output instruction preserved

## Execution Phases

### Phase 1: Core Prompt Constant
Create the v2.0 prompt as a single const string and update `tamada-ai/index.ts`. This is the authoritative copy. Test toast generation quality.

### Phase 2: External API
Update `tamada-external-api/index.ts`. Adapt conversational additions (most are now in v2.0 natively). Update toast detection to use `===TOAST_START/END===`. Test chat flow.

### Phase 3: Feast Plan & Toast Generators
Update `generate-feast-plan/index.ts` (core only, keep F1/F2 layers) and `generate-toast/index.ts`. Test feast plan generation and simple toast generation.

### Phase 4: Library Regenerator
Update `regenerate-library/index.ts` with v2.0 core. Preserve JSON output format instruction. Test batch regeneration.

### Phase 5: Verification
Test all 5 functions end-to-end to confirm improved output quality, no regressions, and correct format handling per function.

## Key Technical Decisions

1. **Output format conflict**: v2.0 uses `===TOAST_START/END===` delimiters. Functions that need JSON (tamada-ai, generate-toast, generate-feast-plan, regenerate-library) override this via user message instructions ("respond ONLY with valid JSON"). The external API uses the delimiters natively. No conflict.

2. **Prompt size**: v2.0 is ~15KB. Within Gemini/GPT context limits. May slightly increase latency and token cost (~3x more input tokens for system prompt). Acceptable tradeoff for dramatically better output.

3. **No shared file**: Edge functions in Lovable Cloud cannot import from each other. The prompt must be duplicated in each function. This is the current pattern and remains necessary.

4. **Voice mode section**: Already in v2.0. The external API's voice pipeline benefits directly. Internal functions ignore it (no voice mode internally).

