

## Fix: Toast Text Cut-off, Button Emphasis & Scene Transitions

### Issues Found

**1. Toast body text gets cut off in Scene 2 (Result)**
The body string is 82 chars typed at 18ms/char = ~1.5s of typing. Phase 2 starts at 2500ms and phase 3 (which stops the cursor) hits at 5000ms — timing is fine. The real problem: the container uses `line-clamp` and `flex-1` but the card sits inside a flex column with other elements competing for space. The `min-h-[300px]` content area minus the header, title, and footer metadata leaves insufficient room. The body text wraps but the card doesn't grow enough to show it all.

**Fix**: Remove the implicit height constraint by giving the result card `overflow-visible`, increase body `leading` to `leading-[1.8]`, and slightly reduce the timing gap so body typing starts sooner (2000ms instead of 2500ms) giving more time to complete.

**2. "შექმნა" button too subtle**
Currently: `text-[10px]` pill with `px-3.5 py-1.5`. It blends in as a tag rather than a primary CTA.

**Fix**: Make it a full-width button at bottom with `w-full py-2 text-[11px]`, stronger shadow pulse, and add a shimmer sweep animation. The text should read "🍷 შექმენი სადღეგრძელო" (more descriptive + emoji).

**3. Scene-to-scene transitions feel choppy**
`AnimatePresence mode="wait"` causes a 0.4s exit + 0.5s enter = 0.9s gap where content is partially invisible. This creates a "blink" feeling.

**Fix**: Reduce exit to 0.25s, entry to 0.35s. Add `mode="wait"` with crossfade overlap by using `exitBeforeEnter` timing reduction. Also add a subtle `scale: 0.98` on exit for depth.

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | Fix Scene 2 typing timing and card overflow; redesign Scene 1 CTA button; tune scene transition durations |

### Specific Changes

**Scene transitions (line 60-78)**:
- Exit: `duration: 0.25`, add `scale: 0.98`
- Entry: `duration: 0.35`
- This cuts total transition from 0.9s to 0.6s

**Scene 1 button (line 171-184)**:
- Full-width `w-full`, `py-2`, `text-[11px]`
- Text: "🍷 შექმენი სადღეგრძელო" with ArrowRight icon
- Stronger glow pulse and shimmer overlay

**Scene 2 timing (line 200-206)**:
- Move body typing start from 2500ms to 1800ms
- Move phase 3 (complete) from 5000ms to 5500ms
- This gives 3700ms for body typing vs current 2500ms
- Increase scene duration from 7000ms to 7500ms

**Scene 2 card (line 248-272)**:
- Remove implicit height clipping
- Body text `leading-[1.8]` for readability

