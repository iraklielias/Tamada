

# Hero Section UX Audit — Expert Assessment

## Current Grades

| Category | Grade | Score |
|----------|-------|-------|
| **Animation Quality** | D+ | 4/10 |
| **Visual Hierarchy** | B- | 6.5/10 |
| **Layout & Spacing** | B | 7/10 |
| **Interactivity & Delight** | D | 3.5/10 |
| **Performance Feel** | C | 5/10 |
| **Mobile Experience** | C- | 4.5/10 |
| **Overall Hero Impact** | C- | 5/10 |

---

## What's Good

- **Solid structural foundation**: Two-column hero with text left / mockup right is proven conversion layout
- **Gradient mesh background**: The layered radial gradients create depth without being garish
- **Social proof placement**: Mini-testimonial below CTA is strong conversion pattern
- **Brand consistency**: Wine color palette, cultural icons, typography all cohesive
- **Scroll indicator**: Mouse-wheel animation at bottom is a nice touch
- **ProductMockup**: The animated dashboard mockup with live progress bar, staggered list items, and pulsing indicators is well-crafted

---

## Why It Feels 4/10 — Root Cause Analysis

### 1. Everything Animates the Same Way (Monotony)
Every element uses the same pattern: `opacity: 0 → 1` + `y: N → 0`. Badge, headline, subtitle, CTA, testimonial — they all slide up with nearly identical easing and timing. The human eye reads this as a single "block reveal" rather than a choreographed sequence. There's no variation in animation *type* — no scale, no blur, no rotation, no spring physics on the text elements.

### 2. Stagger Timing Is Too Tight
`heroStagger` uses `staggerChildren: 0.14` with `delayChildren: 0.3`. That's only 140ms between elements. At 60fps, the user perceives them as appearing almost simultaneously. World-class hero stagger uses 200-300ms gaps with accelerating or decelerating rhythm.

### 3. The Headline Shimmer Is Invisible
`hero-headline-shimmer` animates `background-position` over 6 seconds on a wine-colored gradient. The color range between start and end is so narrow (all wine tones) that the shimmer is nearly imperceptible. Compare to Stripe's shimmer which sweeps a white highlight across dark text — high contrast creates the "wow" moment.

### 4. CTA Glow Is Subtle to the Point of Nonexistence
`cta-glow-pulse` goes from `0 0 0 0` to `0 0 20px 4px` shadow. On a wine-colored button this reads as a very faint halo. No user consciously notices this. The `btn-shimmer` sweep is better but fires every 3s — too slow to catch attention on first load.

### 5. Background Orbs Are Wallpaper, Not Energy
The two breathing orbs (`animate: { x, y, scale }`) move on 8s and 10s cycles. They're so slow and low-opacity (0.22, 0.18) that they feel like static texture, not living energy. They don't respond to or complement the text entrance.

### 6. No "Moment of Arrival" — Missing Climax
World-class heroes have a *climax moment* — typically 0.8-1.2s after load — where all entrance animations converge and something *extra* happens (a particle burst, a logo morph, a color shift). This hero just... finishes revealing. There's no payoff.

### 7. Floating Icons Are Ghost-Like
The cultural icons (horn, wine glass) animate to `opacity: 0.16` and `0.13`. They're so faint they're invisible on most monitors. They exist but contribute nothing.

### 8. No Motion on Scroll Within Hero Viewport
`heroOpacity` and `heroY` only activate on scroll *out* of the hero. While the user is *in* the hero (which is where 80% of time is spent), everything is static after the initial reveal.

### 9. Mobile Gets Nothing
The mockup is `hidden lg:block`. The floating icons are `hidden lg:block`. On mobile, the hero is just text sliding up — zero visual interest beyond the gradient background.

---

## Master Execution Strategy

### Phase 1: Animation Choreography Overhaul
**File: `src/lib/animations.ts`**
- Increase `heroStagger.staggerChildren` from 0.14 → 0.22
- Increase `delayChildren` from 0.3 → 0.15 (start sooner, spread wider)
- Add `filter: "blur(8px)"` to `heroHeadlineReveal.initial` — headline deblurs as it rises, creating focus-pull effect
- Add spring physics to `heroBadgeReveal`: `type: "spring", stiffness: 200, damping: 18` instead of tween
- Give `heroCTAReveal` a distinct motion — scale from 0.9 with overshoot spring instead of x/y slide
- Add a new `heroMockupReveal` with 3D rotation: `rotateY: -8` → `0` combined with current `rotateX`

### Phase 2: Headline Shimmer + CTA Glow Upgrade
**File: `src/index.css`**
- Rework `hero-headline-shimmer`: Insert a bright `hsla(0,0%,100%,0.25)` highlight band in the gradient that sweeps once on load (2s) then settles into subtle loop
- Rework `cta-glow-pulse`: Increase peak shadow radius to `0 0 30px 8px` with higher opacity. Add a one-shot stronger pulse at 1.5s delay (the "climax moment")
- Add new `@keyframes hero-entrance-flash` — a full-viewport radial flash that fires once at ~1s, creating the arrival moment

### Phase 3: Background Energy
**File: `src/pages/Index.tsx` (hero section)**
- Increase orb opacity from 0.22/0.18 → 0.30/0.25
- Speed up orb cycles from 8s/10s → 5s/7s
- Add a third orb (smaller, faster, wine-gold blend) that appears only after 1s delay
- Increase floating icon opacity from 0.16/0.13 → 0.25/0.20 and add subtle `rotate` oscillation to the float keyframes
- Add a one-shot "light sweep" div that animates across the hero background at ~0.8s (the arrival flash)

### Phase 4: Scroll Interactivity Within Hero
**File: `src/pages/Index.tsx` (hero section)**
- Add `useTransform` for subtle parallax *within* the hero viewport: badge moves at 0.95x scroll, headline at 1x, subtitle at 1.05x — creates depth layering
- Mockup should have slight counter-parallax (moves up as user scrolls down slightly)
- The social proof card could have a gentle `rotateX` tilt based on scroll position

### Phase 5: Mobile Hero Enhancement
**File: `src/pages/Index.tsx` (hero section)**
- Show a simplified, smaller version of ProductMockup on mobile (below the CTA) — even a static screenshot-like version with a subtle scale-in animation
- Or: add a "mini-preview" strip showing 3 small cards (AI, Live, Library) that slide in from the sides on mobile
- Keep background orbs on mobile but reduce size by 50%

### Phase 6: Post-Reveal Micro-Interactions
**File: `src/pages/Index.tsx`**
- Add hover parallax to the ProductMockup: track mouse position and apply subtle `rotateX`/`rotateY` (3D tilt card effect)
- CTA button: on hover, the shimmer sweep accelerates and the glow intensifies
- Social proof avatars: on hover, they "pop up" with a spring animation and show a tiny tooltip

---

### Files to Change

| File | Changes |
|------|---------|
| `src/lib/animations.ts` | Rework all hero variants with varied motion types, blur, springs, wider stagger |
| `src/index.css` | Upgrade shimmer, glow, add entrance flash keyframe, improve float keyframes |
| `src/pages/Index.tsx` | Enhance orbs, icons, add mobile mockup, add mouse-parallax on mockup, add scroll depth layers |

### Priority Order
1. Phase 1 + 2 (animation + shimmer/glow) — biggest bang, single render pass
2. Phase 3 (background energy) — immediate visual uplift
3. Phase 6 (micro-interactions) — delight layer
4. Phase 5 (mobile) — reach layer
5. Phase 4 (scroll interactivity) — polish layer

