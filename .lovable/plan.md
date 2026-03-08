

## Hero Mockup Story — Expert UX Enhancement Plan

### Current State Assessment

The 5-scene animated story is structurally sound but has these issues:

**1. No scene progress indicator — scenes feel abrupt**
Each scene just appears and disappears. There's no visual sense of time passing within a scene. Users don't know how long to watch before it changes.

**2. Scenes feel disconnected — no narrative continuity**
The jump from Generator → Result → Live Feast → Chat → Alaverdi feels like 5 separate demos, not one story. There's no visual thread connecting them.

**3. Content area height jumps between scenes**
Scene 1 (3 selects + tags + button) is taller than Scene 5 (2 guest rows). This causes the mockup to visually "bounce" in height, breaking immersion.

**4. No micro-interactions — feels like a slideshow**
Everything fades in linearly. No satisfying spring pops, no particle effects on key moments (like when the toast generates or when alaverdi increments).

**5. Scene transitions are plain crossfades**
`AnimatePresence mode="wait"` with a simple opacity+y shift. No directional awareness — whether going forward or backward feels the same.

**6. The bottom nav dots are tiny and disconnected**
Labels at 7px are unreadable. The dots don't show progress within a scene.

**7. No "wow moment" — the generating-to-result transition**
The most important moment in the product (AI creates a toast) happens with a simple shimmer → text fade. This should be the hero's climax.

---

### Enhancement Plan

#### A. Add Scene Progress Bar
Add a thin wine-gradient progress bar at the top of the browser content area that fills from 0% to 100% during each scene's duration. This gives users a sense of timing and creates anticipation for the next scene. Implemented as a `motion.div` with `animate={{ width: "100%" }}` and `transition={{ duration: sceneDuration/1000 }}`.

#### B. Fix Content Height Stability
Set `min-h-[280px]` on the scene container and make all scenes render within that fixed height using `flex flex-col justify-between`. No more height jumping.

#### C. Add Narrative Connector — Scene Transition Effect
Replace plain crossfade with a brief wine-gradient "wipe" overlay that flashes between scenes (100ms). A thin horizontal line sweeps down during scene change, creating a cinematic cut feel. Implement as an overlay `motion.div` that scales from `scaleY(0)` to `scaleY(1)` to `scaleY(0)`.

#### D. Scene 2 Climax — "Generation Moment"
When the shimmer skeletons resolve into the typed toast:
- A brief radial wine glow pulse emanates from the card center (200ms, opacity 0→0.3→0)
- The card border briefly flashes gold before settling to wine-muted
- A single sparkle particle rises from the Sparkles icon

This makes the AI generation feel magical, not mundane.

#### E. Scene 3 — Animate the Progress More
Currently the progress bar jumps from 28% to 42% to 57%. Add intermediate steps so it visually fills smoothly. Also add a brief scale pulse on the toast card when it swaps (the crossfade exists but lacks punch — add `scale: [1, 1.02, 1]` on entry).

#### F. Scene 5 (Alaverdi) — Add Sound-Free "Clap" Effect
When the +1 floats up, add 3 tiny confetti dots (wine, gold, green) that spring outward from the count number and fade. This makes the alaverdi moment feel celebratory.

#### G. Upgrade Bottom Navigation
- Increase label text from 7px to 8px
- Replace plain dots with a pill-shaped progress indicator per scene (the active scene's dot is a pill that fills with wine-gradient as the scene progresses)
- Make dots clickable (already are) but add a subtle scale bounce on click

#### H. Auto-Pause on Hover
When user hovers the mockup, pause the scene timer. Resume on mouse leave. This lets users study a scene they're interested in. Add a subtle "⏸" icon that fades in at top-right on hover.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | All changes above: progress bar, fixed height, transition wipe, generation climax effect, alaverdi confetti, nav upgrade, hover-pause |

### Estimated Scope
Single file, ~40 lines added/modified across existing scene functions + main component. No new dependencies.

