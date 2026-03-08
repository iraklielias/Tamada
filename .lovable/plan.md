

## Fix: Write Full Georgian Toast Texts Across All Scenes

### Root Cause
Every toast body in the mockup is a stub ending with `"..."`:
- **Scene 2** (line 204): `"დიდება ღმერთს, რომელმაც მოგვცა ეს დღე — ორი გულის ერთ ცხოვრებად შეკვრის დღე..."` — 82 chars
- **Scene 3** (line 318-319): `"უფალო, გმადლობთ ამ დღისთვის..."` and `"საქართველოს გაუმარჯოს..."`
- **Scene 4** (line 403): `"ბატონო, აი ქორწილის სადღეგრძელო: „მზე და მთვარე ერთად...\""` — 56 chars

These aren't being clipped by layout. The strings themselves are incomplete stubs. Users see the `...` and think the animation is broken.

### Fix

**File: `src/components/HeroMockupStory.tsx`**

**Scene 2 — Complete wedding toast body** (line 204):
Replace with a full 3-sentence toast (~150 chars). Adjust typing speed from `18ms` to `14ms` so it completes within the 3700ms window (1800ms→5500ms). Remove `line-clamp` constraints if any remain on rendering.

**Scene 3 — Complete Live Feast toast bodies** (lines 318-319):
Write full 2-sentence bodies for both toasts. These aren't typed — they render statically — so no timing concern. Also remove `line-clamp-2` from line 361.

**Scene 4 — Complete AI chat response** (line 403):
Extend the AI response to 2 full sentences (~100 chars). Adjust typing speed from `20ms` to `16ms` and push phase 3 from `4500ms` to `5500ms` to accommodate. Increase scene duration from `7000ms` to `7500ms`.

### Timing Math

| Scene | Text Length | Speed | Typing Duration | Available Window | OK? |
|-------|------------|-------|----------------|-----------------|-----|
| Scene 2 | ~150 chars | 14ms | 2100ms | 3700ms (1800→5500) | ✓ |
| Scene 4 | ~100 chars | 16ms | 1600ms | 3700ms (1800→5500) | ✓ |

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/HeroMockupStory.tsx` | Replace 4 stub strings with complete Georgian toasts; adjust typing speeds; remove `line-clamp-2` from Scene 3; extend Scene 4 duration |

