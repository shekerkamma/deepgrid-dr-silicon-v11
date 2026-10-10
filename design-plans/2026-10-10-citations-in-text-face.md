# Source citations use the text face, not monospace

Written against: 222e5ec (+ uncommitted navy theme)

## Evidence chain

- Surface: home (`app/home-refined.tsx`), Company (`app/portfolio-story.tsx`)
- Problem: "SKU Architecture Compendium, §3.5" and "Source: DG32 AI architecture" render in JetBrains Mono with wide tracking.
- Design evidence: `DESIGN.md` The Machine Voice Rule: "Monospace means a machine produced it: a part code, a measured value, a file name. Labels and prose are never monospace."
- Owner: `app/portfolio-v6.css` `.v6-cite{font:var(--sc-t-meta) var(--font-mono);letter-spacing:var(--sc-track-meta)}`; not overridden in `app/theme-dgs.css`.
- Scope and affected surfaces: every `.v6-cite` (home-refined.tsx, portfolio-story.tsx).
- Uncertainty: none.

## Design decision

A citation is a document title, a label in the reader's language. Set it in the text face at the Label size, keeping its underline and muted colour.

## Reuse

- `--font-text`, Label typography (0.875rem, 600 not required for a link)
- Exemplar: `body :is(.eyebrow,.v6-mono,...)` label rule in `app/theme-dgs.css`

## Changes

1. `app/theme-dgs.css`
   - Change: `.v6-cite` font-family `var(--font-text)`, letter-spacing 0, font-size .875rem.
   - Preserve: underline, `--ink-3` colour, hover accent, 28px min-height.
   - Verify: both citations render in Source Sans 3.

## Scope

- Inherit: home, Company.
- Verify: no other `.v6-cite` consumer.
- Exclude: part codes (`.v11-part-code`, `.pt-code`) and measured values stay mono.

## Validation

- Interface: home at 1440 and 390; Company.
- Repository: `bash qa/dgs/gates.sh` → all exit 0.

## Stop conditions

- Stop if a citation turns out to name a file path rather than a document title.

## Design documentation

- None: the Machine Voice Rule already states it.
