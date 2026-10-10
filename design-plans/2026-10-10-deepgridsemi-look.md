# Plan: give v11 the deepgridsemi.com look

Date: 2026-10-10. Reference: https://deepgridsemi.com/ (home, /use-cases/adas, /accelerators), captured with
Playwright at 1440 and 390 px, computed styles extracted. Target: shekerkamma.github.io/deepgrid-dr-silicon-v11,
built from `release/v12` in this worktree.

**Scope is the look, not the content.** Colours, type, surfaces, section rhythm, hero, cards, buttons, nav and
footer follow the reference. v11 words, claims, maturity labels, routes and interactive tools stay as they are.
The reference's product names and specs (DG-A100, ASIL-D, 100 TOPS) do not come across.

## 1. What the reference is, measured

| Part | deepgridsemi.com | v11 today |
|---|---|---|
| Page rhythm | Dark photo hero, then **light content bands** (white, gray-50 #F9FAFB, slate-100 #F1F5F9, gray-200 #E5E7EB), a dark CTA band, a navy footer | One dark ground everywhere (#101212 / #191D1B) |
| Brand colour | Blue **#0863A1** (buttons, links, accents, headings' second word); cyan **#4DE2FF** for the hero h1, #67E8F9 for small kicker text on dark | Copper #D4A36E |
| Text | #111827 headings and #4B5563 body on light; white and #E5E7EB on dark | Paper #EEEAE2, sage #A0A59B |
| Headings | **Inter 700**, 48 px for h1 and section h2, 20–24 px for card titles, no negative tracking | Newsreader 400 serif, 46–79 px, -0.032em |
| Body | **Source Sans Pro** 400, 16–24 px | Inter 400 |
| Mono | None | JetBrains Mono for part codes, labels and numbers |
| Hero | Full-bleed photograph (blue/violet PCB), dark gradient on the left, text left, outlined rounded button, scroll cue | Two columns: serif headline and a framed copper render |
| Cards | White, 8 px radius, 1 px blue-tint border (#0863A1 at 10–20 %), soft drop shadow, icon tile top-left | Hairline rows, flat dark panels |
| Buttons | Solid blue #0863A1, 6 px radius, white text; outline variant on dark | Copper fill, ink text, 4 px |
| Nav | Black at 95 % with backdrop blur, white 14 px links, solid blue "Get Started" | Ink, grey links, outlined "Discuss your application" |
| Footer | Navy #232C48, five columns, blue (#61A6FA) column heads | Ink, wordmark plus serif tagline |
| Section heads | Centred title plus one-line subtitle | Left title, right paragraph (two columns) |
| Texture | Faint blue grid paper behind the timeline section | None |

## 2. AI slop: what we will not copy, and what we will remove from v11

**Not copied from the reference** (each one reads as template or machine-made, or makes a claim):
- Two-tone headings ("Our **Products**", "Use **Cases**") and gradient text (`--gradient-text`).
- Glow shadows (`--shadow-glow`, `0 0 20px` blue). The project's own `check-css-bans.mjs` already blocks them.
- Placeholder copy ("For small companies." on every use-case tab), empty founder-video box, and an `undefined` background image.
- Random coloured icon tiles (the green chip and pink server in "Why Deepgrid Semi?") and a check icon on every bullet.
- Product names rotated 90° on the tiles: it looks good in a thumbnail and is hard to read.
- The NVIDIA / Intel / AMD "compatible with" logo strip: it makes a partnership claim v11 cannot back.
- Generic CTAs ("Get Started", "Let's Talk Possibilities"). v11 keeps its specific ones ("Discuss your application").

**Removed from v11 while restyling:**
- Monospace labels everywhere: 94 elements use JetBrains Mono. Keep it only for part codes (SKU-4) and measured values (39 cycles).
- Uppercase tracked eyebrows over every section. The reference has none; one per page at most.
- Five stacked style layers (v3, v5, v6, v11, refinement) fighting over the same selectors, plus 1,100 hard-coded colours (699 in `dr.css`). These are why a re-theme currently means editing hundreds of rules. Replace them with tokens.
- Arrow glyphs (↗) on every text link: keep them on outbound and primary links only.
- Left-title/right-paragraph section heads alternating with centred ones. Use one heading axis per page (the align gate enforces it).

## 3. Decisions

1. **Light reading bands, dark frames.** Heroes, nav, the CTA band and the footer are dark, as on the reference. Reading sections become light.
   - Technical stages stay dark and sit on the light page as dark cards, the way the reference puts its dark product tiles on a gray band. These are the die stage, the fault-path simulation, the 3D workbench, films and draw.io diagrams.
   - This reverses DESIGN.md's rule "never reintroduce a light page band". You asked for this, so DESIGN.md is rewritten to match.
2. **Blue replaces copper as the one accent.**
   - #0863A1 is the accent on light (6.6:1 on white). #4DE2FF is reserved for the hero h1 on dark, and #61A6FA for links on dark.
   - Signal teal stays for the safe state only.
3. **Type.**
   - Headings are Inter 700, which is already bundled.
   - Body is Source Sans 3, the maintained successor of Source Sans Pro, via `@fontsource-variable/source-sans-3`.
   - Newsreader is dropped. JetBrains Mono stays only for part codes and measured values.
4. **Imagery.**
   - The copper hero render clashes with a blue system. Regenerate the hero and three route heroes as blue/violet PCB concept renders through `ai-graphics`, captioned "concept render", as now.
   - Product and system photos keep their colours, under a dark-blue gradient only where text sits on them. No CSS `hue-rotate` hacks.
5. **Layout patterns adopted** (reference part → v11 equivalent):
   - Full-bleed photo hero → home, Products, Technology, Applications, Company and Evidence heroes.
   - "Our Products" tile row → kept as v11's searchable product list (it is functional). It goes on a gray-200 band with white row cards, and gains a 12-tile visual strip above the list with horizontal labels.
   - Use-case tab list and detail panel → v11 "Start with the system", restyled as a left list of cards and a right panel card.
   - Timeline on grid paper → "Stage the commitment against the evidence", drawn as the vertical journey with a blue spine.
   - Blue "Why" band → "Build on shared capability", on a #0863A1 band with white text.
   - Dark centred CTA → "Define the opportunity", with buttons centred.
   - Navy five-column footer → the footer, keeping v11's links (Products, Technology, Applications, Evidence, Company).
6. **Section heads are left-aligned on every page** (owner, 2026-10-10, overriding the first build's centred home heads). Home uses the inner routes' grammar: title left, intro right, stacked on phones. One left edge from hero to footer.

## 4. Phases

| # | Work | Files | Done when |
|---|---|---|---|
| 0 | Branch `design/deepgridsemi-look` off `release/v12`. Baseline screenshots of every route at 1440/390 (e2e-qa-review sweep) | `qa/baseline/` | Baseline sheet saved |
| 1 | **Token layer.** New `app/theme-dgs.css`, imported last: palette, light/dark band roles (`--band-bg`, `--band-fg`, `--band-muted`, `--band-line`), radius 6/8, shadows (offset only), fonts. Codemod the hard-coded colours in `dr.css`, `ux.css`, `globals.css` and `portfolio-*.css` to tokens, with a mapping table checked in | `app/theme-dgs.css`, `scripts/tokenize-colors.mjs` | Fewer than 40 hex literals left outside token files; the build passes |
| 2 | **Shell.** Blurred black nav, white links, blue primary button; navy footer with five columns; mega-menu as white cards on light | `app/shell.tsx`, theme CSS | Nav gate clean at desktop and phone |
| 3 | **Home.** Photo hero, gray product band, use-case list/panel, blue capability band, grid-paper timeline, dark CTA, footer | `app/modern-v11.css` → theme, `portfolio-v6-style.tsx` sections | Side-by-side sheet vs the reference reads as one family |
| 4 | **Inner templates.** Product page, Products/Technology/Applications indexes, Evidence, Company, Contact, Ask: photo hero, light body, dark technical cards | `product-page.css`, `company-pages.css`, `applications-portfolio.css`, `doc-reader.css`, `executive-story.css` | Every route in the sweep has a light body and a dark hero |
| 5 | **Visuals.** Four blue concept renders; draw.io diagrams switch to `color-scheme: light` on light bands; 3D and die stages framed as dark cards | `public/images/`, `docs/v11/image-provenance.json` | Provenance updated; no dark diagram sits bare on white |
| 6 | **Slop pass and gates.** Run the impeccable detector and critique, the design-review slop list, the web-design-guidelines audit, and the e2e-qa-review sweep plus align and nav gates at 1440/390, all with axe contrast. Run the project CI (`check-*`, seven `verify-*.mjs`) | `qa/` | 0 axe violations, 0 banned CSS, 1 heading axis per page, CI green locally |
| 7 | **Docs and ship.** Rewrite DESIGN.md (new North Star, tokens, the bans above); write `docs/v11/look-reference.md` (this table). **Ask before pushing** to v11 (and v12, which shares the branch) | `DESIGN.md` | Live URL serves the commit |

## 5. Risks

- **Contrast on light bands.** v11's sage and grey secondaries (#A0A59B) fail on white. Every muted role is redefined per band, and axe gates it.
- **draw.io diagrams** use `light-dark()`; on a light band they need `color-scheme: light`. Diagrams baked as PNG stay inside dark cards.
- **v11 and v12 both take the new look** (owner, 2026-10-10). Both publish from `release/v12`; the push to each repo is still asked for separately.
- **Size.** About 7,600 lines of CSS across 25 files. Phase 1's codemod is the lever; without it this is weeks of per-rule edits.

## 6. Skills applied, and where (owner, 2026-10-10: "apply all the skills that are relevant along the way")

| Skill | Phase | What it does here | Its gate or output |
|---|---|---|---|
| `impeccable` (context, new-work, craft-floor) | 0–1 | Redesign path: the reference site is the pinned world, so no concept roll. Code-led; the reference screenshots stand in for the comp. Direction contract goes in the surface brief. Craft floor is read before any UI edit. Inter-as-display is on its "stopped looking" list; the brief pins it, and the brief wins | Surface brief with six contract blocks |
| `impeccable` (extract, colorize, typeset, layout) | 1–4 | Token layer, blue accent at page scale, the Inter/Source Sans scale, the band rhythm | `app/theme-dgs.css` |
| `impeccable detect` + `critique` + `audit` | 6 | Detector over the changed CSS/TSX; heuristic critique of home and one inner page; a11y/perf/responsive audit | 0 warnings; critique rows triaged |
| `impeccable` finish reviewer + documenter | 7 | Reviewer against the direction contract; documenter writes the new DESIGN.md and `.impeccable/design.json` from the built world | Disposition word; token-bearing DESIGN.md |
| `nateherk-design:scroll-craft` | 3–6 | Adapted, no interview (delegated). The site does not use its engine, so its taste floor and refuse list apply: no scroll cue (the reference hero's ↓ is not copied), no `01 / 06` counters, at most one eyebrow per three sections, no em dash, no gradient text or glow, a scrim only where text sits on the hero photo, one peak per page (home: the fault-path stage), a close that resolves | Refuse list in `qa/CONTRACT.md`; harness lane marked not applicable, with the reason |
| `web-design-guidelines` | 1–6 | Rules held while building: visible `:focus-visible` on the new blue, `scroll-margin-top` under the sticky nav, `width`/`height` + `loading="lazy"` on new images, `fetchpriority="high"` on the hero, tabular numbers, `&nbsp;` between number and unit, curly quotes and `…`, no `transition: all`, reduced motion | `file:line` audit with 0 open findings |
| `e2e-qa-review` | 0, 6, 7 | Contract first; baseline and final sweep of every route at 1440/390 with axe WCAG 2.2; align gate (one heading axis per page); nav gate (pointer, keyboard, phone sheet); lanes; one bounded visual round; live check | `qa/CONTRACT.md`, `qa/SWEEP.md`, report |
| `improve-ui` | 6 | Drift audit: new rules that bypass the tokens, three proofs per finding | Review rows |
| `design-review` (gstack) | 6 | Designer's-eye slop and spacing pass on the screenshots | Fixes in one batch |
| `fixing-accessibility`, `fixing-motion-performance` | 6 | Only if the audit finds contrast, focus or motion defects | Fixes |
| `ai-graphics` | 5 | Four blue/violet concept renders (home, Products, Technology, Applications heroes), design spec first, no baked text | Images + provenance JSON |
| `story-architect` | n/a | Not run: no new narrative; content and order stay | n/a |
