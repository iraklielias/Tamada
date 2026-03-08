

## Interactive Hero Demo — Final Execution Strategy

### What We're Building

Replace the passive auto-playing `HeroMockupStory` with a 3-step interactive mini-demo inside the same browser chrome. Visitors pick an occasion, watch AI generate a real toast, then see the result with a conversion CTA. The old auto-play animation runs as idle state before interaction.

### Flow

```text
IDLE STATE (before interaction)
  Current HeroMockupStory auto-plays at full opacity
  Overlaid: subtle pulsing "სცადე ახლავე ▼" indicator

USER CLICKS → STEP 1: Pick Occasion
  2×2 grid of occasion cards (centered, generous spacing)
  ┌──────────────┐  ┌──────────────┐
  │  💒 ქორწილი   │  │  🎂 დაბადება  │
  └──────────────┘  └──────────────┘
  ┌──────────────┐  ┌──────────────┐
  │  🤝 მეგობარს  │  │  🏠 სტუმარს   │
  └──────────────┘  └──────────────┘
  Bottom: 3-step progress dots (step 1 active)

STEP 2: AI Generating
  Shimmer skeletons (1.2s) → typed title → typed body
  Bottom: pulsing "გაგრძელება →" button appears after typing
  Progress dots (step 2 active)

STEP 3: Result + CTA
  Full toast card with copy button
  "მოგეწონა?" text + wine-gradient "დაიწყე უფასოდ" CTA
  "სხვა სცადე" reset link
  Progress dots (step 3 active)
```

### Layout & Spacing Rules

- **Mockup container**: Same browser chrome (dots, URL bar) as current. Inner content area: `p-5 sm:p-6`, `min-h-[300px] sm:min-h-[340px]`
- **Occasion cards**: `gap-3`, each card `px-4 py-3.5 rounded-xl`, centered in container with `max-w-[280px] mx-auto`
- **Step transitions**: 500ms crossfade (same as current `sceneVariants`), no wipe
- **Progress dots**: 3 pills at bottom in the indicator bar area, with step labels ("აირჩიე", "იქმნება", "შედეგი")
- **CTA button**: Full-width within card, `h-11 rounded-xl`, wine-gradient
- **All text**: Minimum 11px for body, 12px for labels, 13px for titles — nothing smaller

### AI Integration

Call existing `tamada-ai` edge function directly via `supabase.functions.invoke("tamada-ai", { body })`:
- `action: "generate_toast"`
- `generation_params: { occasion_type, formality_level: "formal", language }`
- No auth header needed — function handles null userId gracefully
- **Fallback toast**: Hardcoded beautiful example if API fails, so demo never breaks

### Files to Change

| File | What |
|------|------|
| `src/components/HeroInteractiveDemo.tsx` | **New file** — 3-step interactive component with idle/picker/generating/result states |
| `src/components/HeroMockupStory.tsx` | No changes — kept as idle background animation |
| `src/pages/Index.tsx` | Swap `<HeroMockupStory>` for `<HeroInteractiveDemo>` which internally renders `HeroMockupStory` as idle state |

### Component Architecture

```text
HeroInteractiveDemo
├── state: "idle" | "pick" | "generating" | "result"
├── idle → renders HeroMockupStory + "try it" overlay button
├── pick → 2×2 occasion grid + step dots
├── generating → shimmer → typed text (reuse useSceneTyping)
│   └── calls supabase.functions.invoke("tamada-ai")
├── result → toast card + copy + CTA + "try another"
└── bottom bar: 3 step indicators with labels
```

### Interaction Details

- **Idle → Pick**: User clicks the "სცადე" overlay button. Auto-play stops, crossfade to picker.
- **Pick → Generating**: User clicks an occasion card. Card briefly scales up, then crossfade to generation view.
- **Generating → Result**: Auto-transition after typing completes + 1s settle. Or user clicks "გაგრძელება".
- **Result → Pick**: "სხვა სცადე" link resets to picker (not idle).
- **Error handling**: If API call fails within 8s, show fallback toast with a small "offline" badge.
- **Cache**: Store last generated toast per occasion in component state to avoid re-fetching on "try another" → same occasion.

### Spacing & Visual Hierarchy

- Occasion cards: Wine-light background on hover, wine-muted border, `transition-all duration-200`
- Between sections: consistent `gap-4` vertical rhythm
- Toast result card: Same styling as `SceneResult` (wine-gradient top bar, bordered card)
- CTA section: `mt-4 pt-4 border-t border-border/30` separator before conversion block
- "Try another" link: `text-xs text-muted-foreground underline` — subtle, not competing with CTA

