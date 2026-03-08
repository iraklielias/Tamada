

## TAMADA — Status Audit & Master Execution Plan

### What Is Built

| Area | Status |
|------|--------|
| Landing page (`/`) | Done — hero, features, how-it-works, footer |
| Auth (login, signup, callback) | Done — email/password, onAuthStateChange, protected routes |
| Onboarding wizard (`/onboarding`) | Done — 4 steps: name, region, experience, occasions |
| App shell (sidebar + bottom nav) | Done — collapsible sidebar, mobile bottom nav, profile footer |
| Dashboard (`/dashboard`) | Done — greeting, quick actions, recent feasts, popular toasts |
| Toasts browse (`/toasts`) | Done — search, occasion/formality filters, favorite toggle |
| AI Generator (`/ai-generate`) | Done — occasion/formality/topic form, edge function, save to favorites |
| Favorites (`/favorites`) | Done — list system + custom favorites, remove |
| Library (`/library`) | Done — reads toast_templates (currently 0 rows) |
| Profile (`/profile`) | Done — read-only display, logout |
| Edge function: `generate-toast` | Done — Lovable AI gateway, JSON parse |
| Database schema + RLS | Done — all 11 tables, policies in place |
| Seed data: toasts | Done — 11 system toasts |

### What Is NOT Built

| Area | Spec Section |
|------|-------------|
| **Feast CRUD** — `/feasts`, `/feasts/new`, `/feasts/:id` | Sections 3, 4, 5 |
| **Live Feast Mode** — `/feasts/:id/live` with timer, toast progression, alerts, audio | Section 6 |
| **Alaverdi tracking** — FAB, guest assignment, count increment | Section 6 |
| **Co-Tamada / Realtime** — share code, join link, Supabase Realtime sync | Section 6 + Realtime spec |
| **Toast template seeding** — 7 templates with JSONB sequences | Seed Data |
| **More sample toasts** — spec calls for 50-100; we have 11 | Seed Data |
| **Feast plan from template** — selecting a template populates feast_toasts | Section 4 |
| **AI Feast Plan generator** — `generate-feast-plan` edge function | AI Integration |
| **Pro gating / useProGate hook** — daily limits, feature locks, upsell modals | Free vs Pro |
| **Upgrade page** (`/upgrade`) — comparison table, Stripe checkout | Section 11 |
| **Stripe integration** — checkout session, webhook, subscription management | Edge Functions |
| **Profile editing** — avatar upload, edit name/region/experience/language | Section 10 |
| **PDF export** — jsPDF feast plan export (Pro) | Section 5 |
| **i18n** — i18next setup, language toggle, all strings externalized | i18n spec |
| **Dark mode** | Design System |
| **Keyboard shortcuts** | Desktop spec |
| **Additional occasion types** in filters (christening, guest_reception, friendly_gathering) | Throughout |
| **config.toml** — `generate-toast` function entry with `verify_jwt = false` | Edge function config |

---

### Master Execution Plan (8 Phases)

#### Phase 8 — Seed Data & Config Fixes
- Seed 7 toast templates into `toast_templates` table (wedding, birthday, memorial, guest reception, holiday, corporate, friendly gathering) with proper `toast_sequence` JSONB arrays
- Add `[functions.generate-toast]` with `verify_jwt = false` to `supabase/config.toml`
- Add missing occasion types to all filter dropdowns across pages (christening, guest_reception, friendly_gathering, other)

#### Phase 9 — Feast CRUD (Core)
- Create `/feasts` page — list user's feasts with status filter pills + search
- Create `/feasts/new` page — multi-section form: basic info, details (guest count, formality, region, duration), template selection, optional guest list
- Create `/feasts/:id` page — tabbed view (Plan, Guests, Details) with toast timeline, guest management, edit metadata, delete
- Add routes to `App.tsx`, add "სუფრები" nav item to sidebar and bottom nav
- Dashboard "ახალი სუფრა" quick action routes to `/feasts/new`; feast cards link to `/feasts/:id`

#### Phase 10 — Live Feast Mode
- Create `/feasts/:id/live` — full-screen immersive view
- Current toast display with complete text, toast number, type
- Next-up preview (2 upcoming toasts)
- Elapsed time tracker + progress bar
- "Completed" and "Skip" buttons that update `feast_toasts` status
- Pause/Resume/End feast controls updating `feasts.status`
- Timer alert system: amber glow + audio chime at configurable intervals before next toast (Web Audio API)
- Alaverdi FAB: bottom sheet with guest list, tap to assign, increment `alaverdi_count` via `increment_alaverdi` RPC

#### Phase 11 — Co-Tamada & Realtime
- Generate `share_code` on feast, build `/feasts/:id/join/:shareCode` route
- Add user as `feast_collaborator` on join
- Subscribe to Supabase Realtime channels for `feast_toasts`, `feast_guests`, `feasts` changes
- Enable realtime publication on relevant tables (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`)
- Co-Tamada sees live view with read-only controls (can assign alaverdi, cannot pause/end)
- Online indicator for connected collaborators

#### Phase 12 — Profile Editing & Pro Gating
- Make profile page editable: avatar upload (to `avatars` bucket), display name, region, experience, language
- Build `useProGate` hook checking `is_pro` + `pro_expires_at`
- Enforce free limits: 5 AI generations/day (server + client), 10 favorites, 1 active feast
- Add server-side rate limit check in `generate-toast` edge function using `get_daily_ai_count`
- Soft upsell modals when limits reached; gold lock icons on Pro features
- Create `/upgrade` page with feature comparison table and pricing

#### Phase 13 — Stripe & Subscriptions
- Enable Stripe integration
- Create `create-checkout-session` edge function
- Create `stripe-webhook` edge function handling subscription lifecycle events
- Wire `/upgrade` page CTA to checkout session
- Add `/profile/subscription` route for managing active subscription

#### Phase 14 — i18n & Polish
- Set up i18next with `ka` (default) and `en` locales
- Extract all hardcoded Georgian strings to locale JSON files
- Add language toggle to sidebar footer and profile settings
- Persist language choice to `profiles.preferred_language`
- Toast content displays `_ka` or `_en` based on selected language

#### Phase 15 — Advanced Features & Hardening
- `generate-feast-plan` edge function — AI-generated toast schedule based on occasion/duration/formality
- PDF export of feast plan using jsPDF (Pro only)
- Dark mode support
- Keyboard shortcuts in live feast mode (Space = complete, Esc = pause)
- Additional seed toasts (expand from 11 to 50+)
- Error boundary components, offline queue for failed writes, optimistic updates throughout

