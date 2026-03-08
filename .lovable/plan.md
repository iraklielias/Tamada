

## Hero Animation UX Fix — Slow Down & Let It Breathe

### Core Problems

1. **Scene durations are 2.8–3.5s** — way too fast. A viewer needs ~2s just to recognize what they're looking at, leaving only 0.8s to absorb the content before it vanishes.

2. **The wine-gradient "wipe" transition is visually aggressive** — a full-screen color flash between scenes is disorienting. The viewer loses spatial context.

3. **Internal scene steps fire too fast** — Scene 1 fills all 3 selects in 900ms. That's faster than a human eye can track. The tags appear at 1400ms. The viewer has only ~1.4s to see the completed form before the scene changes.

4. **Scene exit is abrupt** — 250ms exit animation means content disappears almost instantly. The eye hasn't finished reading.

5. **No "settle" time** — each scene constantly animates right up to the transition. There's no quiet beat where the viewer can absorb the final state.

---

### Fix Plan

#### A. Double All Scene Durations
```
Generator:  2800 → 5500ms
Result:     3500 → 7000ms  
Live Feast: 3200 → 6000ms
Chat:       3500 → 7000ms
Alaverdi:   2800 → 5000ms
```
Total loop: ~30s instead of ~16s. This gives 2–3 seconds of "settle" time per scene after all animations complete.

#### B. Remove the Wipe Transition
Replace the aggressive wine-gradient wipe with a soft 500ms crossfade. Remove `TransitionWipe` component entirely. Just let `AnimatePresence mode="wait"` handle the transition with a gentler exit (400ms fade-out) and entry (500ms fade-in with subtle y:8 slide).

#### C. Slow Down Internal Scene Steps

**Scene 1 (Generator)**: Space selects at 600ms, 1200ms, 1800ms (instead of 300/600/900). Tags at 2800ms. Button at 3500ms. Viewer has ~2s to see completed form.

**Scene 2 (Result)**: Shimmer phase lasts 1200ms (not 600ms). Title typing starts at 1200ms. Body at 2500ms. Guidance at 5000ms. ~2s settle.

**Scene 3 (Live Feast)**: First progress update at 800ms, card swap at 3000ms (not 1800ms). ~3s settle.

**Scene 4 (Chat)**: User bubble at 800ms, AI response at 1800ms, voice chip at 4500ms. ~2.5s settle.

**Scene 5 (Alaverdi)**: Count increment at 1200ms, second guest at 2000ms. ~3s settle.

#### D. Soften Scene Transitions
Change `sceneVariants`:
- Entry: `duration: 0.5` (from 0.35), `y: 8` (from 12), remove `scale`
- Exit: `duration: 0.4` (from 0.25), `y: -4` (from -8), remove `scale`

The scale bounce on entry/exit is part of what makes transitions feel jarring.

#### E. Remove advanceScene Wipe Logic
Simplify `advanceScene` to just `setScene(next)` — no wipe state, no setTimeout wrapper. Scene change is handled purely by AnimatePresence crossfade.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | Update SCENE_META durations, remove TransitionWipe, soften sceneVariants, slow all internal setTimeout timings, simplify advanceScene |

### Result
Each scene will have a clear rhythm: **build up (2-3s) → settle (2-3s) → gentle fade to next**. The viewer can understand what they're looking at before it changes.

