

## Hero Section — Full Animation Polish Plan

After reviewing the current hero implementation across `Index.tsx` (2061 lines) and `HeroMockupStory.tsx` (682 lines), here are all remaining polish opportunities organized by area.

---

### A. Mockup Story Internal Polish

**1. Staggered element entries** — Currently each scene uses independent `setTimeout` for element visibility. Wrap scene contents in a `motion.div` with `staggerChildren: 0.12` so elements cascade in a parent-child relationship instead of popping independently.

**2. Exit blur dissolve** — `sceneVariants.exit` is just `opacity: 0, y: -4`. Add `filter: "blur(2px)"` so content dissolves organically rather than vanishing.

**3. Entry blur** — Match with `initial: { filter: "blur(4px)" }` → `animate: { filter: "blur(0px)" }` for a deblur entrance that echoes the hero headline treatment.

**4. Typing cursor refinement** — The blinking cursor (`w-0.5 h-3`) should use `rounded-full`, a smoother sine-wave opacity curve (`opacity: [1, 0.2, 1]` instead of `[1, 0, 1]`), and scale-to-zero exit when typing completes.

**5. Chat bubble directionality (Scene 4)** — User bubble should enter from `x: 16` (right), AI bubble from `x: -16` (left), creating conversational lateral motion instead of generic `y: 6` for both.

**6. Confetti particles too small (Scene 5)** — Increase from `w-1 h-1` to `w-1.5 h-1.5`, extend travel distance from 12-18px to 20-28px, add `rotate: [0, 180]` on each dot.

**7. Progress bar fade-in** — Currently restarts with a hard cut via `key={progressKey}`. Add `initial={{ opacity: 0 }}` with 200ms fade-in so it materializes smoothly at scene start.

**8. Nav pill width transitions** — Bottom indicator pills jump between 6px and 20px instantly. Wrap in `motion.div` with `animate={{ width }}` and `transition={{ duration: 0.3 }}` for smooth expansion.

**9. Browser chrome life** — Add a subtle pulse `animate={{ opacity: [0.7, 1, 0.7] }}` on the green dot (3s cycle) to suggest "active tab."

**10. Pause state visual feedback** — When paused, dim content area to `opacity: 0.85` and slightly desaturate, making the pause state unmistakable without hunting for the tiny icon.

**11. Scene 3 progress bar physics** — Replace stepped `setProgress` jumps with a single `motion.div` using `animate={{ width: [28, 34, 42, 48, 57] }}` with spring physics for organic growth.

---

### B. Hero Section Background & Atmosphere

**12. Breathing orb synchronization** — The 3 background orbs animate independently with different durations (5s, 7s, 4s). Slightly offset them so they create a visible "inhale/exhale" pattern — e.g., all reach peak scale within a 1s window, then relax together.

**13. Floating icon interaction** — The cultural icons (Horn, WineGlass, Qvevri) are static after entrance. Add a very subtle `rotate: [0, 3, -3, 0]` oscillation (8s cycle) so they feel alive, not frozen.

**14. Particle burst timing** — The 16-particle burst fires at ~1s with `animationDelay`. Some particles share nearly identical angles. Add a `Math.random() * 0.3` jitter to each delay so they don't fire in a mechanical wave.

**15. Gradient mesh subtle animation** — The `gradient-mesh-hero` class is static CSS. Add a slow `background-position` shift (CSS `animation: gradient-shift 20s ease infinite`) to make the mesh feel like flowing liquid rather than a painted backdrop.

---

### C. Hero Text & Badge Choreography

**16. Badge micro-bounce on arrival** — The badge pill uses `heroBadgeReveal` (spring). Add a secondary `boxShadow` animation that pulses the `badge-glow-pulse` once more strongly at arrival, then settles to the subtle loop.

**17. Headline letter-level stagger** — Currently the headline deblurs as a single block. For the wine-colored second line ("რომელსაც დაიმახსოვრებენ"), wrap each word in a `motion.span` with 80ms stagger for a word-by-word reveal that builds anticipation.

**18. Sub-headline opacity curve** — The subtitle fades in linearly. Use an ease-out-quint curve so it appears to "settle into place" — fast start, slow finish.

**19. CTA button ripple on idle** — After the initial entrance, the primary CTA button (`btn-shimmer`) has a shimmer loop. Add a subtle `scale: [1, 1.015, 1]` breath (4s cycle, delayed 3s) so the button feels alive and clickable.

**20. Testimonial avatars sequential pop** — Already staggered at 80ms, but the delay starts at 1.8s. Tighten to 1.4s so they appear sooner after the CTA, keeping momentum.

---

### D. Mockup Container & 3D Effects

**21. Mockup shadow depth on scroll** — The mockup has `glow-behind-strong` which is static. Tie the shadow intensity to scroll progress — stronger shadow at top, fading as user scrolls, creating a "lifting off the page" → "settling down" arc.

**22. 3D tilt spring physics** — Currently `rotateX/Y` updates on every mousemove frame with CSS `transition: 0.15s`. Replace with Framer Motion's `useSpring` for physics-based following that feels weighty, not linear.

**23. Mockup entrance overshoot** — `heroMockupReveal` uses `rotateX: 12, rotateY: -8`. The transition is `duration: 1.1`. Add a slight overshoot on Y-axis (`y: [50, -4, 0]`) so the mockup appears to "land" with a bounce.

**24. Mobile mockup parallax** — The mobile `<HeroMockupStory>` has no scroll parallax (desktop gets `heroMockupY`). Add a lighter `useTransform` so it scrolls at 0.9x speed, creating subtle depth even on mobile.

---

### E. Transition to Next Section

**25. Bottom fade gradient sync** — The 32px-tall bottom fade is static. Make it `h-40` and add a subtle `opacity` animation tied to scroll so it intensifies as the user scrolls, creating a more cinematic section handoff.

**26. Trust bar entrance** — Whatever section follows the hero (features/trust bar) should have its first element appear with `initial={{ y: 20, opacity: 0 }}` triggered at `-100px` viewport margin, so it starts revealing while the hero is still partly visible — creating overlap depth.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | Items 1-11: stagger children, exit/entry blur, cursor polish, chat directionality, bigger confetti, progress bar fade-in, pill width transitions, chrome pulse, pause dimming, progress physics |
| `src/pages/Index.tsx` | Items 12-26: orb sync, icon oscillation, particle jitter, gradient animation, badge bounce, headline word stagger, sub ease curve, CTA breath, avatar timing, mockup shadow/spring/overshoot, mobile parallax, bottom fade, trust bar overlap |
| `src/index.css` | Gradient mesh animation keyframe if not already present |

### Estimated Scope
~80 lines of animation property changes across 2 main files. No new dependencies. Pure motion refinement.

