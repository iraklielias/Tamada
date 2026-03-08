

## UX & Animation Polish — Full Execution Strategy

### Analysis of Uploaded Images vs Current Code

The uploaded images show the **hero mockup scenes** (Generator, Live Feast, Chat, Alaverdi). Comparing these to the current code reveals several issues:

---

### Problem Areas Identified

**1. Sonner Toast Notifications Are Generic**
The app uses bare `sonnerToast.success("Copied!")` and `sonnerToast.error(msg)` calls everywhere — plain white rectangles with no brand personality. For a product centered around Georgian toasts (სადღეგრძელო), the notification toasts should feel on-brand with wine-themed styling, icons, and better animation.

**2. Hero Mockup Scene Spacing Issues (from images)**
- **Scene 1 (Generator)**: Labels like "შემთხვევა" are cramped at `text-[9px]` with `w-16` — too tight. Select rows need more breathing room.
- **Scene 3 (Live Feast)**: The toast card and progress bar are vertically compressed. The `p-3` padding and `text-[10px]` body create a dense block.
- **Scene 4 (Chat)**: Bubble spacing is minimal (`space-y-2.5`). The AI avatar is only `w-6 h-6` — barely visible.
- **Scene 5 (Alaverdi)**: Guest cards at `py-2` are too tight. The count number is hard to read.

**3. Mockup Scene Copywriting**
- Scene labels at `text-[8px]` are illegibly small for badge text like "სავალდებულო" and "ტრადიციული"
- "✓ დასრულება" and "⏭ გამოტოვება" action buttons use raw unicode instead of proper icons

**4. Landing Page Section Spacing**
- Feature showcase `gap-12 md:gap-16` is good, but bullet lists use `space-y-2` which is tight for Georgian text
- Timeline step cards have `pl-20` which leaves the icon hanging on mobile

**5. Page-Level Animation Consistency**
- Dashboard and other app pages use basic `staggerContainer`/`staggerChild` from `lib/animations.ts`, but these don't have the entry blur treatment that the hero mockup now uses
- Page transitions between routes have no animation at all

---

### Execution Strategy

#### A. Branded Sonner Toast Styling (High Impact)

**File: `src/components/ui/sonner.tsx`**

Completely restyle the Sonner toaster to match the wine/Georgian theme:
- Custom `toastOptions.classNames` with wine-gradient border-left accent for success, destructive red for errors
- Add HornIcon or WineGlassIcon as default icon for success toasts
- Increase padding, use `font-serif` for toast text
- Add `animate-in slide-in-from-bottom` entry animation override
- Custom close button styling with wine-muted colors
- Increase duration to 4s (from default 3s) so users can read Georgian text

#### B. Hero Mockup Scene Layout Polish

**File: `src/components/HeroMockupStory.tsx`**

**Scene 1 (Generator)**:
- Increase label width from `w-16` to `w-20`, bump to `text-[10px]`
- Add `gap-2.5` between select rows (from `space-y-2`)
- Tags: increase from `text-[9px]` to `text-[10px]`, add `gap-2`

**Scene 2 (Result)**:
- Bump title from `text-[11px]` to `text-[12px]`
- Body from `text-[10px]` to `text-[11px]`
- Increase card padding from `p-3` to `p-3.5`

**Scene 3 (Live Feast)**:
- Toast card body: bump from `text-[10px]` to `text-[11px]`
- Badge type labels: from `text-[8px]` to `text-[9px]`
- Replace unicode action buttons ("✓" "⏭") with proper Lucide `Check` and `SkipForward` icons
- Progress text: from `text-[9px]` to `text-[10px]`

**Scene 4 (Chat)**:
- Increase AI avatar from `w-6 h-6` to `w-7 h-7`
- Bubble text from `text-[10px]` to `text-[11px]`
- Chat spacing from `space-y-2.5` to `space-y-3`

**Scene 5 (Alaverdi)**:
- Guest card padding from `py-2` to `py-2.5`
- Name text from `text-[10px]` to `text-[11px]`
- Role text from `text-[9px]` to `text-[10px]`

**Global mockup**: Increase content area min-height from `min-h-[280px]` to `min-h-[300px]` and padding from `p-4 sm:p-5` to `p-5 sm:p-6`

#### C. Landing Page Spacing & Copy Polish

**File: `src/pages/Index.tsx`**

- Feature bullet lists: increase `space-y-2` to `space-y-3` for readability
- Timeline step cards: reduce `pl-20` to `pl-16` on mobile with responsive `pl-16 md:pl-20`
- Testimonial quote text: increase from `text-xs` in the hero mini-testimonial to `text-[13px]`
- Trust bar stat numbers: add a subtle count-up animation (already have `AnimatedCount` but trust bar uses static text)
- Feature section descriptions: add `text-base` instead of implicit small sizing

#### D. App Page Animation Consistency

**File: `src/lib/animations.ts`**

Add a `pageStaggerChild` variant that includes the blur treatment:
```
pageStaggerChild: {
  initial: { opacity: 0, y: 8, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" }
}
```

**Files: `src/pages/Dashboard.tsx`, `src/pages/ToastsPage.tsx`, `src/pages/FeastsPage.tsx`**
- Replace basic `staggerChild` with new blur-enhanced variant for consistent feel across all pages

#### E. Sonner Toast Animation Enhancement

**File: `src/components/ui/sonner.tsx`**

Key styling changes:
- Wine-accent left border on success: `border-l-[3px] border-l-[hsl(353,41%,32%)]`
- Rounded corners: `rounded-xl`
- Subtle wine-light background: `bg-[hsl(350,30%,93%)]` for light mode
- Custom icon placement using Sonner's `icons` prop with `WineGlassIcon` for success
- Entry animation: override to use `slide-in-from-bottom-full` with spring easing
- Proper dark mode support matching the existing dark theme variables

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/ui/sonner.tsx` | Wine-branded toast styling, custom icons, animation overrides |
| `src/components/HeroMockupStory.tsx` | Spacing, font sizes, icon replacements across all 5 scenes, content area sizing |
| `src/pages/Index.tsx` | Feature bullet spacing, timeline responsive padding, testimonial sizing, trust bar animations |
| `src/lib/animations.ts` | Add blur-enhanced page stagger variant |

### Priority Order
1. **Sonner toasts** — most visible user-facing issue, every action triggers them
2. **Hero mockup spacing** — first thing visitors see
3. **Landing page spacing** — supports conversion
4. **App page animation consistency** — polish layer

