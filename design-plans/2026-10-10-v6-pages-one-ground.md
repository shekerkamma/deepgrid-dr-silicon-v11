# Every v6 page sits on the one page ground

Written against: cf7f0a3 (+ uncommitted two-ground theme)

## Evidence chain
- Surface: `/company` (`.v6-home.v6-company`).
- Problem: the closing section is `#0e1a33`, a third navy, between Page sections.
- Design evidence: `DESIGN.md` Colors: Frame and Page only; "no third navy".
- Owner: `app/theme-dgs.css:160` (`.v6-home .v6-close{background:#0e1a33}`); the unification rule at `:339` is scoped to `.v6-home.v11-home`.

## Design decision
The page-ground rule applies to every `.v6-home` page, not the home page alone.

## Changes
1. `app/theme-dgs.css:339`: change the selector scope from `.v6-home.v11-home` to `.v6-home`, keeping the hairline border-top. Verify: `/company` grounds are Frame and Page only.

## Validation
- Background scan of all routes.
- Repository: `bash qa/dgs/gates.sh` → all exit 0.
