

# Restore Degraded AI Generator Form

## Problem

During the i18n refactor, the four core Select dropdowns were stripped from the `AIGeneratePage` form:

- **Occasion** (wedding, birthday, memorial, etc.) — stuck on default "supra"
- **Formality** (formal, semi_formal, casual) — stuck on "formal"  
- **Tone** (traditional, humorous, emotional, philosophical) — stuck on "traditional"
- **Region** (kakheti, imereti, kartli, etc.) — stuck on "general"

The state variables (`occasion`, `formality`, `tone`, `region`) and the backend call (`generation_params`) still exist and work correctly. The AI model receives these params and uses them. The only issue is the UI no longer lets users choose them.

## Fix — Single File Edit

**File:** `src/pages/AIGeneratePage.tsx` (lines 318–341)

Restore the four Select components between `{/* Row 1 */}` and the personName/personDetails fields. The structure:

1. **Row 1** — Occasion + Formality (2-column grid with `Select`)
2. **Row 2** — Tone + Region (2-column grid with `Select`)
3. **Row 3** — Person Name + Person Details (existing, keep as-is)
4. **Row 4** — Topic textarea (existing, keep as-is)
5. **Generate button** (existing, keep as-is)

Each Select will use `t()` for labels and option text, referencing the keys already populated in `ka.json`/`en.json` (e.g., `t("ai.occasions.wedding")`, `t("ai.tones.traditional")`, `t("profile.regions.kakheti")`).

The occasion Select will use `Wine` icon, formality uses `Lock` icon, tone uses `Palette` icon, region uses `MapPin` icon — all already imported in the file.

No backend changes needed. No new dependencies. Single file restoration.

