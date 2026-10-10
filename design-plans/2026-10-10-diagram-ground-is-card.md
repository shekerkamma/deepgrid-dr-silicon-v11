# Diagram ground is the Card navy, not cream

Written against: cf7f0a3 (+ uncommitted two-ground theme)

## Evidence chain
- Surface: product pages `/products/sku-*`, `/products/d100` (10 routes)
- Problem: the architecture diagram renders its dark variant inside a cream frame; carousel slides letterbox on cream.
- Design evidence: `DESIGN.md` Colors: "Card (`#121b2d`) … diagram plates"; Don'ts: "no white reading bands, … no third navy".
- Owner: `app/product-page.css:93` `:root { --diagram-ground: #f4f2ec; }`, consumed by `.pp-arch-figure` (`:188`) and `.pp-slide-img img` (`:157`).
- Uncertainty: none. The draw.io SVGs render their dark variant (`color-scheme: dark` is set in theme-dgs.css).

## Design decision
The diagram ground takes the Card token, so the plate and the diagram are one surface.

## Reuse
- `--dgs-card` (`#121b2d`) in `app/theme-dgs.css`.

## Changes
1. `app/theme-dgs.css`: redefine `--diagram-ground: var(--dgs-card)` on `:root` (theme-dgs.css is imported last). Preserve the figure's padding, border and radius. Verify: no `rgb(244,242,236)` ground on any product route.

## Validation
- Background scan of all routes: the only grounds are Frame, Page and Card.
- Repository: `bash qa/dgs/gates.sh` → all exit 0.

## Stop conditions
- Stop if a diagram renders its light variant on the navy plate (dark lines on navy).
