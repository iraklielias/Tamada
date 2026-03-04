

# TAMADA — Full UX/UI Design Overhaul: Phase 0 Audit & Execution Strategy

## Codebase Audit Findings

### Sitemap (16 routes)
```text
/                     Landing page (public)
/auth/login           Email + Google login
/auth/signup          Email + Google signup
/auth/callback        OAuth redirect handler
/onboarding           4-step wizard (post-signup)
/dashboard            Home hub — quick actions, recent feasts/toasts
/feasts               List view with status filters
/feasts/new           Multi-field creation form
/feasts/:id           Detail page with tabs (plan/guests/details), toast management, drag-drop
/feasts/:id/live      Real-time feast runner with timer, alaverdi
/feasts/join/:code    Share-code join flow
/toasts               Browse/filter system toasts
/library              Template gallery
/ai-generate          AI toast generator with edit/diff/feedback
/ai-history           Generation log + learning insights
/favorites            Saved toasts collection
/profile              Avatar, name, region, language, experience
/upgrade              Pro comparison table + CTA
/admin/telemetry      Charts: generations, latency, knowledge coverage
/404                  Not Found
```

### Component Inventory
- **Navigation**: `AppSidebar` (desktop collapsible), `BottomNav` (mobile 5-tab), `AppLayout` (shell wrapper)
- **Auth**: `AuthLayout` (split-screen), `ProtectedRoute`
- **Shared UI**: `EmptyState`, `GrapevineDecor`, `LoadingSkeleton`, `ProBadge`, `ProUpsellModal`, `FeastAdvisory`
- **Custom Icons**: `HornIcon`, `WineGlassIcon`, `QvevriIcon`, `GrapevineIcon`
- **Design System**: Full shadcn/ui suite, custom wine/gold CSS variables, Framer Motion animations in `lib/animations.ts`

### Critical Friction Points Identified

1. **Landing page**: Functional but generic — no social proof, no live demo, no problem/agitation section, weak visual impact. Hero icon is tiny. No scroll-triggered animations below fold.

2. **Auth pages**: Clean but bland — no visual personality. The left panel is static text on a gradient. No motion, no atmosphere.

3. **Dashboard**: Flat card grid with no visual hierarchy differentiation. Quick actions all look the same except the first one. No "welcome back" warmth.

4. **List pages (Feasts, Toasts, Favorites, Library)**: All share identical visual pattern — same card structure, same icon placement, same spacing. No visual distinction between page purposes.

5. **AI Generate page**: Dense form with many selects crammed together. Result display is functional but not celebratory — generating a toast should feel like an event, not a form submission.

6. **FeastDetailPage**: 1200+ line monolith. Toast detail dialog is overloaded. No visual breathing room.

7. **404 page**: Bare minimum — no character, no brand.

8. **Empty states**: Generic across all pages — same layout, no illustrations, no personality.

9. **Loading states**: Using `animate-pulse` on blank cards instead of proper skeleton screens that match content shape.

10. **Dark mode**: Implemented but dark theme colors feel flat — no depth differentiation between surfaces.

11. **No page transitions**: Routes swap instantly. No AnimatePresence at router level.

12. **Typography**: `Noto Sans Georgian` for everything — no display/heading font contrast.

### What's Working Well (Preserve)
- Color palette concept (wine/gold) is strong — needs refinement, not replacement
- Sidebar + bottom nav architecture is sound
- Framer Motion already installed and used in some places
- i18n fully wired throughout
- All data fetching patterns are clean and consistent

---

## Execution Strategy

Given the scope, this must be broken into **focused, sequential phases** where each phase produces a visibly improved result without breaking anything. I recommend implementing **one phase per approval cycle**.

### Phase 1: Design System Foundation
**Files**: `src/index.css`, `tailwind.config.ts`, `src/lib/animations.ts`, `index.html`

- Refine CSS variables: add surface-level depth tokens (`--surface-1`, `--surface-2`, `--surface-3`) for layered card/panel design
- Add display font (Playfair Display via Google Fonts link in `index.html`) for hero/heading use
- Expand animation library: add `pageTransition`, `cardHover`, `listStagger`, `heroReveal` variants
- Add subtle glassmorphism utilities (`.glass-card`, `.glass-nav`)
- Improve dark mode surface colors for better depth
- Add scroll-smooth to html element
- Clean up `App.css` (currently has unused Vite boilerplate)

### Phase 2: Landing Page Redesign
**Files**: `src/pages/Index.tsx`, `src/components/GrapevineDecor.tsx`

- Rebuild hero: larger display typography with Playfair, animated gradient background, floating cultural elements
- Add problem/agitation section with emotional copy
- Rebuild feature showcase as interactive tabbed or scroll-reveal cards
- Add "How it Works" with connected step indicators
- Add social proof section (placeholder testimonials)
- Final CTA section with warm background shift
- Redesigned footer with column layout
- Transparent-to-solid navbar on scroll

### Phase 3: Auth & Onboarding Polish
**Files**: `src/components/AuthLayout.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/SignupPage.tsx`, `src/pages/OnboardingWizard.tsx`

- AuthLayout left panel: add subtle animated background (gradient shift or floating elements)
- Form inputs: larger, more generous padding, smooth focus transitions
- Onboarding: add illustrations per step, smoother progress bar, more delightful selection cards

### Phase 4: App Shell & Navigation
**Files**: `src/components/AppLayout.tsx`, `src/components/AppSidebar.tsx`, `src/components/BottomNav.tsx`

- Add AnimatePresence page transitions at the Outlet level
- Sidebar: subtle glassmorphism, improved hover states, better collapsed state
- Bottom nav: add active indicator animation (pill slide)
- Desktop header: add breadcrumbs and user greeting

### Phase 5: Dashboard Redesign
**Files**: `src/pages/Dashboard.tsx`

- Bento grid layout with varying card sizes
- Hero greeting card with time-aware illustration
- Quick actions with distinct visual treatments per type
- Recent feasts as timeline-style cards
- Popular toasts with richer preview cards

### Phase 6: Content Pages (Feasts, Toasts, Library, Favorites)
**Files**: `src/pages/FeastsPage.tsx`, `src/pages/ToastsPage.tsx`, `src/pages/LibraryPage.tsx`, `src/pages/FavoritesPage.tsx`

- Each page gets a distinct visual identity while sharing the design system
- Better skeleton loaders matching actual content shapes
- Improved empty states with unique illustrations per page
- Card hover effects with lift + shadow transitions
- Filter bars: pill-style with smooth active transitions

### Phase 7: AI Generate & Detail Pages
**Files**: `src/pages/AIGeneratePage.tsx`, `src/pages/FeastDetailPage.tsx`, `src/pages/AIHistoryPage.tsx`

- AI Generate: turn result display into a "reveal" moment with celebration animation
- FeastDetailPage: visual breathing room, better tab design, improved toast cards
- AI History: timeline-style layout instead of flat list

### Phase 8: Profile, Upgrade, 404 & Final Polish
**Files**: `src/pages/ProfilePage.tsx`, `src/pages/UpgradePage.tsx`, `src/pages/NotFound.tsx`, `src/components/EmptyState.tsx`

- Profile: more visual, card-based sections with inline editing feel
- Upgrade: comparison table redesign with highlighted recommended plan
- 404: branded illustration with character
- EmptyState: unique per-context illustrations
- Final pass: check all dark mode, responsive breakpoints, accessibility

---

## Recommendation

This is a large project. I recommend we start with **Phase 1 (Design System Foundation)** — it takes ~15 minutes of implementation, touches only 4 files, breaks nothing, and establishes the visual vocabulary everything else builds on. Each subsequent phase can then be approved and implemented individually.

Shall I proceed with Phase 1?

