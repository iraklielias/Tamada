

## Hero Section Design & UX Audit — Enhancement Plan

### Current Issues Identified

**1. Headline readability is critically weak**
The shimmer gradient text ("რომელსაც დაიმახსოვრებენ") is barely readable — it renders as washed-out pink/salmon against the light background. The `backgroundImage` uses `hsla(0,0%,100%,0.35)` at the 50% stop which whitewashes the text. The `bg-clip-text text-transparent` approach loses all contrast at certain shimmer positions.

**2. Headline is too large and wraps awkwardly**
At `clamp(2.6rem, 5.5vw, 4.2rem)` the second line breaks across two visual lines, creating three total lines of headline text. This dilutes impact — a world-class hero headline should be 2 lines maximum.

**3. Subtitle text is bland**
Plain `text-muted-foreground` with no visual differentiation from generic body copy. Needs more breathing room and slight typographic refinement.

**4. CTA group sits too close to subtitle**
Only `mb-8` gap. The CTA needs more vertical separation and the secondary "როგორ მუშაობს?" button is visually weak.

**5. Testimonial card is heavy and pushed low**
It takes up significant vertical space, pushing content below the fold. On the screenshot, it's already at the very bottom. Should be lighter/more compact.

**6. Badge pill is underwhelming**
Small, flat, low contrast. Should feel more like a premium "NEW" announcement.

**7. Background effects are invisible in practice**
The breathing orbs, particle burst, and arrival flash are technically present but barely perceptible against the warm parchment background. The gradient mesh is too subtle to create atmosphere.

**8. Floating icons are too faint**
At 0.20-0.25 opacity they're ghost-like. They should either be visible enough to add character or removed entirely.

**9. Mockup lacks a "wow" shadow/glow**
The `glow-behind` pseudo-element is very subtle. The mockup needs a stronger ambient glow to pop off the page.

**10. No vertical rhythm anchor**
There's no visual separator or decorative element between the hero content and the trust bar — the transition feels abrupt.

---

### Enhancement Plan

#### A. Fix Headline Contrast & Size

- Reduce font size to `clamp(2.2rem, 4.8vw, 3.6rem)` to ensure the headline fits in 2 lines max
- Replace the washed-out shimmer gradient: use a solid wine-deep color for the shimmer line with a moving white highlight overlay instead of `bg-clip-text` transparency
- Add a subtle `text-shadow` to the shimmer line for legibility at all shimmer positions
- Make the first line ("იყავი თამადა,") use full `text-foreground` color (solid black) at a bolder weight

#### B. Strengthen Badge Pill

- Add a subtle animated glow border (wine-muted pulsing border)
- Slightly larger padding, add a small sparkle icon animation
- Use `backdrop-blur` glass effect on the badge

#### C. Improve Subtitle & CTA Spacing

- Bump subtitle to `text-lg md:text-xl` with `text-foreground/70` instead of muted
- Increase CTA margin to `mb-12`
- Give secondary CTA an outline/border treatment instead of pure ghost

#### D. Compact Testimonial Card

- Reduce to a single-line horizontal layout: avatars + quote + attribution in one row
- Smaller avatars (w-7 h-7), shorter quote, inline layout
- Reduce overall card padding

#### E. Boost Background Atmosphere

- Increase gradient mesh opacity by ~40% (wine radial from 0.28 to 0.38, gold from 0.16 to 0.22)
- Increase breathing orb opacity (wine from 0.30 to 0.40, gold from 0.25 to 0.32)
- Make the arrival flash stronger (peak opacity from 0.25 to 0.40)

#### F. Upgrade Mockup Presentation

- Strengthen `glow-behind` pseudo-element opacity from 0.14 to 0.22
- Add a second glow layer with gold tint for depth
- Increase mockup float amplitude from 8px to 12px

#### G. Floating Icons — Make or Break

- Increase opacity to 0.35 for icon-float-1 and 0.28 for icon-float-2
- Add a third floating icon (QvevriIcon) at bottom-right

#### H. Add Hero Bottom Fade Transition

- Add a gradient fade at the bottom of the hero section that blends into the trust bar background, creating a seamless transition

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Headline font size, badge glass effect, subtitle styling, CTA spacing, testimonial compacting, floating icon opacity, third icon, hero bottom fade div |
| `src/index.css` | Gradient mesh opacity boost, shimmer fix for contrast, glow-behind strength, arrival flash intensity, orb values, badge glow animation |
| `src/lib/animations.ts` | No changes needed — existing variants are fine |

### Estimated scope
8-10 targeted edits across 2 files. No structural changes, no new components.

