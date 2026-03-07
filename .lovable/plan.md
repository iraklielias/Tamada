

# Design Polish Plan — Chat Mode & Voice Mode

## UX Audit: Issues Found

### Chat Mode

1. **Chat bubbles lack personality** — Assistant bubbles are plain `bg-card` with a generic `Bot` icon. For a Georgian cultural product, the avatar should feel more branded (wine glass, not a generic robot).

2. **User avatar is flat** — A gray circle with a generic User icon. Lacks warmth to match the wine/parchment design system.

3. **Input bar feels cramped** — `h-9` inputs and buttons are small. The mic button blends into the background; the send button has no visual weight when active.

4. **Typing indicator has no avatar** — The 3-dot bounce floats with no sender context, breaking the visual pattern of the chat.

5. **ToastCard actions bar is visually weak** — Copy/Play buttons are ghost-styled and nearly invisible. The attribution line sits too close to the actions, making the card bottom feel cluttered.

6. **Welcome screen suggestion chips lack hover delight** — They have basic `hover:bg-accent/50` but no motion or scale feedback, feeling static for a premium product.

7. **Timestamps are nearly invisible** — `text-[10px] text-muted-foreground/40` is too faint; they read as visual noise rather than useful information.

8. **No entrance animation for input bar** — Everything above animates in, but the input bar just appears.

### Voice Mode

9. **Plain `bg-background` feels empty** — No atmosphere, no texture. Premium voice UIs (ChatGPT, Gemini) use subtle gradients or ambient patterns.

10. **Orb idle state is too muted** — `hsl(var(--muted))` background makes the orb look disabled rather than inviting.

11. **Stage label typography is plain** — `text-sm text-muted-foreground` lacks hierarchy. The stage is the primary information on screen.

12. **Response text area has no container** — Text floats at the bottom with no visual grounding, making it feel disconnected from the orb.

13. **"End Session" button is jarring** — Red destructive button at the bottom of an otherwise serene UI breaks the mood.

14. **Close / Text buttons lack visual weight** — Ghost buttons in corners are hard to find, especially on mobile.

15. **Instructions card feels bolted on** — Positioned with `absolute top-20`, it can overlap the orb on smaller screens.

---

## Execution Strategy

### Phase 1: Chat Mode Polish (4 files)

**ChatBubble.tsx:**
- Replace `Bot` icon with `WineGlassIcon` for assistant avatar (already imported but unused)
- Add subtle gradient to assistant avatar matching the wine palette
- Bump user avatar: add a warm gradient instead of flat `bg-muted`
- Make timestamps `text-muted-foreground/60` (up from /40)
- Add a gentle `font-serif` to assistant text for personality contrast

**ToastCard.tsx:**
- Give action buttons a subtle pill background on hover
- Add subtle wine-colored left border instead of just the top accent bar
- Increase spacing between actions row and attribution
- Make the play button more prominent with a filled variant when audio is available

**TypingIndicator.tsx:**
- Add assistant avatar (matching ChatBubble) to the left of the dots for visual consistency

**ChatSimulator.tsx (input bar):**
- Increase input height from `h-9` to `h-10`
- Give the send button a gradient background matching primary when enabled
- Add a subtle scale animation on mic button hover
- Add `backdrop-blur-md` and slightly more padding to the input bar

**WelcomeScreen.tsx:**
- Add `hover:scale-[1.02]` transition to suggestion chips
- Add subtle shadow on hover for chips

### Phase 2: Voice Mode Polish (1 file)

**FullVoiceMode.tsx:**

- **Ambient background**: Add a subtle radial gradient centered on the orb area (`radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.04) 0%, transparent 60%)`) for atmosphere
- **Orb idle state**: Change from flat `hsl(var(--muted))` to a subtle glass-like gradient with a faint wine tint so it looks tappable
- **Add secondary outer ring**: A thin, faint ring outside the orb that pulses gently in idle to signal interactivity
- **Stage label**: Bump to `text-base font-medium` with a `tracking-wide` for better readability
- **Response text container**: Wrap transcript + response in a frosted glass card (`bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4`) so text feels grounded
- **"End Session" button**: Change from `destructive` to a ghost/outline style with muted text, less visually aggressive
- **Close/Text buttons**: Add a subtle `bg-muted/50 rounded-full` background so they're findable
- **Instructions card**: Use `bottom-32` positioning (above the response area) instead of `top-20` to avoid orb overlap

### Files Changed (no functionality changes)

| File | Changes |
|------|---------|
| `ChatBubble.tsx` | Wine glass avatar, serif text, warmer user bubble |
| `ToastCard.tsx` | Stronger action buttons, better spacing |
| `TypingIndicator.tsx` | Add avatar for consistency |
| `ChatSimulator.tsx` | Input bar sizing and polish |
| `WelcomeScreen.tsx` | Chip hover micro-interactions |
| `FullVoiceMode.tsx` | Ambient bg, orb glow, glass response card, button refinements |

All changes are purely visual/CSS. Zero functional or state logic modifications.

