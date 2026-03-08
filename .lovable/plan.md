

## Hero Animation: Master Strategy — From Scratch

### Bug Fix: Testimonial Text Cutoff

The quote text on line 1356 uses `truncate` (CSS `text-overflow: ellipsis; overflow: hidden; white-space: nowrap`), which clips the text. Remove `truncate`, allow the quote to wrap naturally within the card. Also widen `max-w-md` to `max-w-lg` on the testimonial container (line 1332) so the full quote fits.

---

### The Core Problem with the Current Hero Animation

The hero mockup is a **static screenshot of a dashboard**. It doesn't move, doesn't tell a story, and doesn't demonstrate what the app actually does. A user lands on the page and sees a frozen UI with some numbers. There's no narrative, no "aha moment," no reason to believe the product delivers on its promise.

World-class hero animations don't just look pretty — they **prove the product's value proposition in 5 seconds**.

---

### Animation Strategy: "60-Second Supra" — A Live Product Demo in the Hero

**Concept**: The mockup becomes a **scripted micro-story** that plays out automatically, showing the entire user journey in ~8 seconds:

1. **Act 1 — The Ask** (0–2s): User types "ქორწილი, 45 სტუმარი" into an input. Tags animate in (wedding, formal, Kakheti).
2. **Act 2 — AI Magic** (2–4s): A shimmer/thinking pulse fires, then a toast text types out character by character. The AI just wrote a toast.
3. **Act 3 — The Feast Goes Live** (4–6s): The view transitions (crossfade) to a live feast screen. A progress bar fills, toast items check off one by one, a timer ticks, LIVE badge pulses.
4. **Act 4 — Alaverdi Moment** (6–8s): A guest avatar pops up with a name, alaverdi count increments with a spring animation. The crowd responds.

This is one continuous animation loop inside the mockup browser frame. No user interaction needed. It sells the entire product flow.

---

### Technical Implementation

#### Phase 1: Rebuild ProductMockup as a Multi-Scene Component

Replace the current static `ProductMockup` with a new `HeroMockupStory` component that cycles through 4 scenes using a state machine driven by `useEffect` timers.

```text
┌─────────────────────────────────┐
│  Browser Chrome (dots + URL)    │
├─────────────────────────────────┤
│                                 │
│   Scene 1: AI Input Form        │  0–2s
│   → Tags spring in              │
│                                 │
│   Scene 2: AI Generation        │  2–4s  
│   → Shimmer pulse → typing      │
│                                 │
│   Scene 3: Live Feast           │  4–6s
│   → Progress fills, checks pop  │
│                                 │
│   Scene 4: Alaverdi             │  6–8s
│   → Guest avatar + count bump   │
│                                 │
│   → Loop back to Scene 1        │
│                                 │
└─────────────────────────────────┘
```

**State**: `scene: 1|2|3|4`, auto-advancing via `setTimeout`.

**Transitions**: Each scene crossfades using `AnimatePresence mode="wait"` with 300ms fade+slideUp.

#### Phase 2: Scene Details

**Scene 1 — "The Ask"**
- An input field with a blinking cursor
- `useTypingEffect` types "ქორწილი, 45 სტუმარი"
- Three tag pills spring in sequentially: "ქორწილი", "ფორმალური", "კახეთი"
- A wine-gradient "შექმნა" button pulses with a ring animation

**Scene 2 — "AI Writes"**
- Three shimmer skeleton lines pulse (thinking state)
- After 800ms, text types out: a short 2-line toast excerpt
- A sparkle icon rotates next to "AI სადღეგრძელო"
- Wine-glow dot pulses next to "გენერირებული"

**Scene 3 — "Live Feast"**
- Title "ნიკას ქორწილი" with pulsing LIVE badge
- Progress bar animates from 30% → 60%
- 4 toast items: first 3 get checkmarks (spring pop), 4th has active arrow
- Timer counts: "12:45" → "13:02" (counting up)

**Scene 4 — "Alaverdi"**  
- Title "ალავერდი"
- A guest row highlights with a wine-deep avatar
- Alaverdi count animates 2 → 3 with a scale spring
- A small "+1" floats up and fades out
- Second guest row fades in below

#### Phase 3: Scene Indicator Dots

Below the mockup browser frame, add 4 small dots indicating the current scene. Active dot is wine-deep, others are muted. Dots transition with a spring scale.

#### Phase 4: Testimonial Fix

- Remove `truncate` from the quote text (line 1356)
- Change the testimonial container from `max-w-md` to `max-w-lg`
- Allow the text to wrap to 2 lines naturally with `line-clamp-2` as a safety

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Replace `ProductMockup` with `HeroMockupStory` (multi-scene animated component), fix testimonial truncation, add scene indicator dots |

### What This Achieves

- **Proves the product** in 8 seconds without requiring any click
- **Tells a story**: input → AI generates → feast runs → guests participate
- **Creates re-watch value**: the loop is satisfying enough to watch twice
- **Differentiates** from every other SaaS hero that shows a static screenshot

### Estimated scope
One file, ~250 lines of new component code replacing ~150 lines of current `ProductMockup`. The existing animation utilities (`useTypingEffect`, `AnimatedCount`, spring configs) are reused.

