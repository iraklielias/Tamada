

## Understanding Confirmed

I've analyzed the full codebase. Here's what the real product does vs. what the animation currently shows:

### Real Product Features (from actual code)

| Feature | Real UI | Current Animation |
|---------|---------|-------------------|
| **AI Generator** | 4 dropdowns (occasion, formality, tone, region) + advanced fields (person name, details, freeform topic) + summary strip of selected tags | Generic typed text "ქორწილი, 45 სტუმარი" — doesn't match the actual select-based form |
| **AI Result** | Bilingual toast (ka/en), title + body, delivery guidance (pace, pauses, glass-raise moment), metadata badges, edit mode, diff view | Plain text typing — misses the structured card with title/body separation |
| **Chat Mode** | PRO-gated conversational interface with chat bubbles, voice input, welcome screen with suggestion chips | Not shown at all |
| **Live Feast** | Sticky header with timer, progress bar, current toast card with type/body, host controls (play/pause/stop), presentation mode, "LIVE" badge | Roughly correct but uses a flat checklist instead of the actual card-based toast display |
| **Alaverdi** | Bottom sheet with guest list, assign alaverdi action, count per guest | Roughly correct |
| **Feast Creation** | Title, occasion select, guest count slider, formality, duration, region, notes, guest list management | Not shown |

### Key Gap
Scene 1 ("The Ask") shows a **free-text input with typed text**, but the real AI Generator uses **dropdown selects** that produce **tag badges**. The animation should mirror the actual interaction pattern: select dropdowns cycling through options, then badges appearing.

---

## Execution Plan: Polish Animation to Match Real Product

### Change A — Scene 1: Mirror the Real AI Generator Form

Replace the free-text typing with a miniature replica of the actual form:
- Show 2 small select-style rows: "ქორწილი" and "ფორმალური" appearing as pre-filled selects (animated fill)
- Then tone "ემოციური ❤️" slides into a third select
- Summary strip animates in at the bottom with 3 tag badges (matching the real `generation summary strip` on line 576)
- Wine-gradient "შექმნა" button pulses

### Change B — Scene 2: Match the Real AI Result Card

Replace plain text typing with a structured result card:
- Title line types first: "ნეფე-პატარძლის სადღეგრძელო"
- Body text types below, inside a bordered card (matching the real result card)
- After body completes, show a small delivery guidance row: "⏱ 2-3 წუთი · 🥂 მე-3 წინადადების შემდეგ" fading in
- A small heart (👍) and save (⭐) icon row fades in at the bottom

### Change C — Scene 3: Use the Real Toast Card Layout

Replace the flat checklist with the actual LiveFeastPage card pattern:
- Show a single "current toast" card with a wine-gradient top border, title, and 2-line body excerpt
- Below the card, show the progress fraction chip: "2/7 სადღეგრძელო · 42%"
- The card crossfades to the next toast (title changes, progress updates)
- Keep the LIVE badge and timer — those match

### Change D — Scene 4: Add Chat Bubble Preview

Replace or augment the Alaverdi scene with a **Chat Mode preview** (since this is a major PRO feature):
- Show 2 chat bubbles: user asks "ქორწილისთვის სადღეგრძელო მინდა" → AI responds with a short toast excerpt
- A small "🎤 Voice" chip animates in at the bottom
- This demonstrates the conversational AI, which is a key differentiator

**Alternative**: Keep Alaverdi as Scene 4 but add Chat as Scene 5 (5 scenes, 2s each = 10s loop). This shows more product surface area.

### Change E — Scene Duration & Pacing

Current: 2500ms per scene — too fast for reading Georgian text.
- Increase to **3500ms** per scene for scenes with text content (2, 3)
- Keep 2500ms for scenes 1 and 4/5 which are more visual

### Change F — Scene Labels

Update the dot indicators to include tiny text labels below, showing the feature name. Current `SCENE_LABELS` array exists but isn't rendered.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | Rewrite all 4 scenes to match real UI patterns, add optional 5th scene (Chat), adjust timing, render scene labels |

### Estimated scope
Single file rewrite of scene content (~300 lines). No new dependencies. No CSS changes needed — existing design tokens cover everything.

