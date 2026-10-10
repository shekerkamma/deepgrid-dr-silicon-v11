# Arrow icons only on outbound and primary links (home)

Written against: 222e5ec (+ uncommitted navy theme)

## Evidence chain

- Surface: home (`app/page.tsx` → `app/home-refined.tsx`, `app/portfolio-story.tsx`, `app/deepgrid-visual.tsx`, `app/executive-story.tsx`, `app/related.tsx`).
- Problem: internal secondary text links carry `ArrowUpRight` (e.g. "Inspect fault causes and reset behaviour" → `/technology/safety`, the application-strip links).
- Design evidence: `DESIGN.md` Components, Text link: "a lucide `ArrowUpRight` ... only on outbound and primary links".
- Owner: the JSX of each link.
- Scope and affected surfaces: text links rendered on home.
- Uncertainty: none for classification: outbound = `src(...)` document links and external hosts; primary = the band's button (`.v11-button`, `.v6-primary`, "Discuss a system"); everything with `url('/...')` text-link styling is internal secondary.

## Design decision

The arrow says "leaves this page's flow" or "the action". On internal links it is noise: remove it there.

## Reuse

- `ArrowUpRight` stays on outbound and primary links.
- Exemplar: none needed.

## Changes

1. Home text links with `url('/...')` targets that are not buttons
   - Change: delete the `<ArrowUpRight .../>` element.
   - Preserve: link text and href; arrows on `src(...)` links, buttons and product-row affordances.
   - Verify: no arrow on internal home text links.

## Scope

- Inherit: home.
- Verify: shared components touched (`related.tsx`, `executive-story.tsx`, `deepgrid-visual.tsx`) render on other routes; the same rule holds there.
- Exclude: product-row and card affordance arrows; mega-nav; other routes' own links (separate audit).

## Validation

- Interface: home 1440/390.
- Repository: `bash qa/dgs/gates.sh` → all exit 0.

## Stop conditions

- Stop if a verify script selects links by the icon.

## Design documentation

- None.
