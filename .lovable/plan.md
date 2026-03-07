

# Two Fixes: Thinking Slideshow + View More Bug

## 1. Cultural Facts Slideshow During Thinking Stage

### What
A subtle, auto-rotating slideshow of Georgian cultural facts that appears below the orb when `stage === "thinking"` or `stage === "transcribing"`. Fills the 10-30s wait with educational content instead of empty space.

### Facts Database
Create `src/data/tamadaFacts.ts` with 30+ bilingual facts organized by category. Examples:

- **History**: "The tradition of supra dates back over 3,000 years to ancient Colchis"
- **Tamada role**: "A tamada is never elected — they are recognized by the table"
- **Wine**: "Georgia is the birthplace of wine, with 8,000 years of winemaking history"
- **Qvevri**: "Georgian qvevri winemaking is UNESCO Intangible Cultural Heritage since 2013"
- **Proverbs**: "Georgian proverb: 'A guest is a gift from God'"
- **Regions**: "In Kakheti, toasts are elaborate and poetic, reflecting the region's deep wine culture"
- **Figures**: "Shota Rustaveli's 'The Knight in the Panther's Skin' is quoted in nearly every formal supra"

Each fact: `{ ka: string, en: string, category: string, icon?: string }`

Minimum 30 facts to ensure variety across sessions.

### UI Component
Create `src/components/api-testing/ThinkingFacts.tsx`:
- Shows only when `stage === "thinking"` or `stage === "transcribing"`
- Auto-rotates every 5 seconds with crossfade animation
- Starts at a random index each session to avoid repetition
- Positioned below the orb, above the stage label
- Compact: icon + fact text, max 2 lines, `text-xs` on mobile
- Uses `framer-motion` AnimatePresence for smooth transitions
- Category badge/icon (wine glass, scroll, map pin) for visual variety

### Integration in FullVoiceMode.tsx
- Import and render `<ThinkingFacts />` between the orb and stage label
- Pass `stage` and `language` props
- Component self-manages visibility (renders nothing when not thinking)

## 2. Fix "View More" Button Bug

### Root Cause
`AnimatePresence mode="wait"` with changing `key` on the response `motion.div` causes the old element to unmount before the new one mounts. When `useLayoutEffect` fires on `lastResponse` change, `responseRef.current` is `null` (pointing to the exiting element), so `isOverflowing` is set to `false` and the button never appears again.

### Fix
Replace `useLayoutEffect` with a `useEffect` that uses a short `requestAnimationFrame` + `setTimeout` to check overflow after the enter animation completes:

```typescript
useEffect(() => {
  // Wait for AnimatePresence enter animation to complete
  const raf = requestAnimationFrame(() => {
    const timer = setTimeout(() => {
      const el = responseRef.current;
      if (!el) { setIsOverflowing(false); return; }
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    }, 350); // matches animation duration
    return () => clearTimeout(timer);
  });
  return () => cancelAnimationFrame(raf);
}, [lastResponse, expanded]);
```

Also add a `ref` callback approach: attach `responseRef` via callback ref so overflow is rechecked when the DOM element actually mounts.

## Files

| File | Action |
|------|--------|
| `src/data/tamadaFacts.ts` | **Create** — 30+ bilingual facts array |
| `src/components/api-testing/ThinkingFacts.tsx` | **Create** — auto-rotating slideshow component |
| `src/components/api-testing/FullVoiceMode.tsx` | **Edit** — integrate ThinkingFacts + fix overflow detection |

No database changes. No edge function changes. No breaking changes to existing props or mobile layout.

