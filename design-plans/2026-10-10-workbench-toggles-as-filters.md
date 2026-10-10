# Workbench toggles use the filter treatment

Written against: 222e5ec (+ uncommitted navy theme)

## Evidence chain

- Surface: home system section and fault-path stage (`app/portfolio-workbench.tsx`, `.v6-tabs`); Company (`app/portfolio-story.tsx`).
- Problem: the System / Motion / Power / Sensing / Interfaces / DG32 / Pause motion toggles are square, and their selected state is light blue with dark text; the product filters above them on the same page are rounded and Brand Blue with white text.
- Design evidence: `DESIGN.md` Shapes ("6px on buttons, filters and inputs") and Components ("Filter: ... `aria-pressed` selected state is Brand Blue with white text").
- Owner: `app/portfolio-workbench.css` `.v6-tabs button` (no radius) and `.v6-tabs button[aria-pressed=true]{background:var(--v6-copper);color:var(--t-on-accent)}`; `--v6-copper` resolves to `--t-accent` (#61a6fa on navy).
- Scope and affected surfaces: every `.v6-tabs` group.
- Uncertainty: none.

## Design decision

Both groups are `aria-pressed` toggles in the same task; they take one treatment, the documented filter.

## Reuse

- `--dgs-blue`, `--sc-radius-sm` (6px), `--t-card`, `--t-border`
- Exemplar: `.v11-filters button` and `.v11-filters button[aria-pressed=true]` in `app/theme-dgs.css`

## Changes

1. `app/theme-dgs.css`
   - Change: `.v6-tabs button` radius 6px, background `--t-card`, border `--t-border`, text `--t-fg`; selected: background and border `--dgs-blue`, text #fff.
   - Preserve: 44px min-height, padding, button semantics.
   - Verify: home workbench toggles match the filters at 1440 and 390.

## Scope

- Inherit: home system section, fault-path stage, Company.
- Exclude: `.v11-family-tabs` (underline tabs, a different component).

## Validation

- Interface: home, Company; selected and unselected; keyboard focus visible.
- Repository: `bash qa/dgs/gates.sh` → all exit 0 (verify-v6-interactions drives these buttons).

## Stop conditions

- Stop if a `.v6-tabs` group is a true tablist (role=tab) rather than toggle buttons.

## Design documentation

- None: Components already documents the filter state.
