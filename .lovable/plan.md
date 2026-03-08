

## Reimagine Landing Page Feature Sections with Hero-Level Sophistication

### Current State Assessment

The hero section uses spring physics, parallax scrolling, mouse-tracking 3D tilt, deblurring reveals, word-level stagger, breathing orbs, and particle bursts. By contrast, the feature sections below the fold rely on basic `revealFromLeft/Right` slide-ins and simple `scrollReveal` fades — a stark quality drop-off.

**Sections to upgrade (in scroll order):**

| # | Section | Current Animation | Quality Gap |
|---|---------|------------------|-------------|
| 1 | Feature Showcase (×3 zig-zag) | Simple `revealFromLeft/Right` slide | No stagger on bullets, no scroll-linked parallax, mockups have no entrance choreography |
| 2 | Testimonials | Basic fade-up + slight rotate | No hover lift, no stagger delay, no quote-mark animation |
| 3 | How It Works (Timeline) | `timelineStep` + scroll-driven line | Mini-cards are static, no spring entrances, icon boxes don't animate |
| 4 | Cultural Mission | `scrollRevealScale` + counter | No parallax layers, counters pop without spring |
| 5 | Pricing | `scrollReveal` + `timelineStep` | No card tilt, no hover 3D, toggle has no spring |
| 6 | Final CTA | Floating text + basic reveal | No headline deblur, CTA has no breath/shimmer |

---

### Execution Strategy

#### Phase 1: Animation Infrastructure (`src/lib/animations.ts`)
Add new shared variants:
- `staggerBullets` — per-bullet reveal with 80ms stagger + slight x-offset
- `deblurReveal` — the hero-style `filter: blur(8px)→0` headline treatment
- `springScaleIn` — spring-physics scale entrance for cards/icons
- `parallaxChild(offset)` — helper for scroll-linked y-transforms
- `hoverLift` — standardized card hover with y:-4, shadow increase, 0.2s spring

#### Phase 2: Feature Showcase Sections (×3)
**Text block:**
- Replace `revealFromLeft/Right` with a stagger container
- Number badge: `springScaleIn` with bounce
- Subtitle: fade-in
- Title: `deblurReveal` (same as hero headline but lighter — `blur(4px)`)
- Description: `heroSubReveal` style fade+y
- Bullets: individual `staggerBullets` items with checkmark spring-pop
- CTA button: `heroCTAReveal` spring entrance

**Visual block (mockups):**
- Wrap in scroll-linked `useTransform` for subtle parallax (30px range)
- Add `whileHover` 3D tilt using CSS perspective (lighter than hero — no mouse tracking, just `rotateY: 2deg, scale: 1.03`)
- Mockup internal elements already animate on `inView` — keep those

**Section transitions:**
- Add subtle radial gradient that fades in on scroll using `useTransform(scrollYProgress, opacity)`
- Section dividers get a width-scale animation on scroll

#### Phase 3: Testimonials
- Cards enter with `springScaleIn` + stagger (150ms between cards)
- Quote icon `<Quote>` rotates in from -15deg with spring
- Star ratings fill sequentially (50ms per star)
- Cards get `hoverLift` with subtle `rotateY` tilt on hover
- Avatar initials spring-pop on card entrance

#### Phase 4: How It Works (Timeline)
- Timeline step icons: `springScaleIn` with ring pulse on entrance
- Step cards: stagger container internally (badge → title → description → mini-card)
- Mini-card contents animate internally (progress bars fill, checkmarks pop)
- Timeline line already scroll-driven — enhance with gradient color shift

#### Phase 5: Cultural Mission
- Qvevri icon: breathing scale animation (already exists) + rotate wobble
- Headline: `deblurReveal` treatment
- Stat counters: spring-physics number animation (already `AnimatedCount`) + card entrance with `springScaleIn`
- Background orbs: add 2 subtle breathing orbs similar to hero (wine + gold, lower opacity)

#### Phase 6: Pricing
- Cards enter with `springScaleIn` + 200ms stagger
- Pro card: persistent subtle glow pulse on border
- Toggle: spring animation on switch (`layoutId` transition)
- Feature list items: bullet stagger on card entrance
- Hover: `hoverLift` with shadow-wine intensification

#### Phase 7: Final CTA
- Headline: `deblurReveal` with word-level stagger
- CTA button: `heroCTAReveal` spring + breath animation + shimmer (reuse hero pattern)
- Testimonial quote: typewriter-style fade or italic slide

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/lib/animations.ts` | Add ~5 new variant exports: `staggerBullets`, `deblurReveal`, `springScaleIn`, `hoverLift`, `bulletItem` |
| `src/pages/Index.tsx` | Upgrade `FeatureShowcase`, `Testimonials`, `HowItWorks`, `MissionStats`, `PricingSection`, and Final CTA animations |

### Estimated Scope
- ~200 lines of new/modified animation variants
- ~400 lines of modified JSX in Index.tsx
- No new dependencies needed — all Framer Motion

