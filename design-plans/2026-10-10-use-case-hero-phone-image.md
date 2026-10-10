# Use-case heroes: on phones the photo sits above the copy

Written against: cf7f0a3 (+ uncommitted two-ground theme)

## Evidence chain
- Surface: `/use-cases/{motors,vehicles,defence,grid,boards}` at ≤760 px (`header.cp-band` with `img.cp-band-bg`).
- Problem: the photo is cropped 71–78% and darkened under the copy; the caption names a subject the reader cannot see.
- Design evidence: `DESIGN.md` Don'ts: "Don't crop an image with text or a subject the caption names … the phone hero image sits above the copy." Exemplar: the home hero phone rule in `app/theme-dgs.css`.
- Owner: `app/company-pages.css:184-187,246` (`.cp-band`, `.cp-band-bg`, `.cp-band::after`).
- Uncertainty: none.

## Design decision
At ≤760 px the band image leaves the background: a full-width 3:2 block above the copy with no scrim; desktop is unchanged.

## Reuse
- The home-hero phone treatment (`.v11-hero` block at the end of `app/theme-dgs.css`).

## Changes
1. `app/theme-dgs.css`, `@media (max-width: 760px)`:
   - `.cp-band` becomes a flex column;
   - `.cp-band-bg` becomes static (`position: relative`, `order: -1`, `width: 100%`, `aspect-ratio: 3/2`, `height: auto`, `opacity: 1`), with a bottom margin;
   - `.cp-band::after` is hidden.

   Preserve the copy, the chips and the caption. Verify: at 390 px the truck, meters and boards images are fully visible above the headline.

## Validation
- Interface: 5 use-case routes at 390 and 1440 (desktop unchanged).
- Repository: `bash qa/dgs/gates.sh` → all exit 0; the text-fit gate stays at 0.

## Stop conditions
- Stop if another `.cp-band` page relies on text over its image on phones.
