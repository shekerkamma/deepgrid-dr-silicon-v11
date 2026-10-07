---
name: DeepGrid Silicon Portfolio
description: Mature-node silicon portfolio and strategy, with DG32 as the detailed pre-silicon engineering proof point. One dark system across every route, homepage included - ink grounds, copper accents, Newsreader display, Inter text and JetBrains Mono labels. The v11 catalogue roles are aliases of those tokens.
colors:
  ink: "#101212"
  surface: "#191d1b"
  muted: "#292d29"
  accent-surface: "#343d31"
  border: "#3d453b"
  rule: "#48544066"
  paper: "#eeeae2"
  paper-bright: "#f4f0e7"
  ink-2: "#a7b09f"
  muted-foreground: "#a0a59b"
  copper: "#d4a36e"
  copper-ring: "#d9ac78"
  hardware: "#bf7f3b"
  cpu: "#a0a59b"
  safe: "#2f9e8c"
  overlay-shadow: "rgb(0 0 0 / .45)"
  bone-ink: "#18201c"
  bone-muted: "#48534b"
  bone-copper: "#78522e"
  portfolio-muted: "#aaaFA7"
  portfolio-rule: "#343b36"
  portfolio-frame: "#566157"
  strategy-rule: "#8c978b"
  diagnostics-surface: "#151a17"
  evaluation-surface: "#1b221e"
  evaluation-muted: "#aab3a8"
  journey-rule: "#677166"
  v11-navy: "#eeeae2"
  v11-paper: "#101212"
  v11-white: "#191d1b"
  v11-muted: "#a0a59b"
  v11-rule: "#3d453b"
  v11-accent: "#d4a36e"
typography:
  v11-display:
    fontFamily: "'Newsreader Variable', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3.2rem, 5.5vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.032em"
  v11-headline:
    fontFamily: "'Newsreader Variable', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2rem, 3.2vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.032em"
  v11-caption:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.6
  portfolio-display:
    fontFamily: "'Newsreader Variable', Georgia, serif"
    fontSize: "clamp(3.5rem, 6vw, 6.5rem)"
    fontWeight: 450
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  portfolio-headline:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.7vw, 4rem)"
    fontWeight: 450
    lineHeight: 1.13
    letterSpacing: "-0.025em"
  portfolio-body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.75
  portfolio-label:
    fontFamily: "'JetBrains Mono Variable', monospace"
    fontSize: "0.7rem"
    letterSpacing: "0.09em"
  display:
    fontFamily: "'Newsreader Variable', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.4rem, 3.8vw, 3.5rem)"
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Newsreader Variable', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.9rem, 2.6vw, 2.45rem)"
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Newsreader Variable', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.5rem, 2.1vw, 1.95rem)"
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
  xl: "8px"
  pill: "9999px"
  circle: "50%"
spacing:
  measure: "64ch"
components:
  v11-button:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 21px"
  v11-button-hover:
    backgroundColor: "{colors.copper-ring}"
    textColor: "{colors.ink}"
  v11-filter-selected:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "11px 13px"
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  text-link:
    textColor: "{colors.copper}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "11px 13px"
    height: "44px"
---

# Design System: DeepGrid Silicon Portfolio

<!-- v11 implementation merge 2026-10-05: app/modern-v11.css, app/deepgrid-visual.tsx, app/portfolio-finder.tsx, app/shell.tsx and docs/v11/image-provenance.json. Runtime review is recorded separately. Incumbent identity extracted 2026-09-24; v6 merged from implementation 2026-09-30. Sources: app/globals.css, app/dr.css, app/portfolio-v6.css, app/route-journey.css and app/portfolio-workbench.tsx. Owner delegated the direction and documentation merge; historical audit counts are not current verification. -->

## Overview

**Creative North Star: "The Datasheet That Argues"**

V12 preserves the latest GitHub v11 visual baseline (`1e5c338`): the unified dark theme and existing semiconductor concept hero. The v12 publication is a separate repository and Pages endpoint, with parent-category navigation states and four-width layout regression checks. It does not establish new product evidence. Runtime results are recorded separately.

The v11 catalogue leads with DeepGrid visuals, physical system jobs and searchable architectures, on the same ink, copper, Newsreader, Inter and JetBrains Mono system as every other route. The 2026-10-05 unification retired the separate navy, cool paper, white and Manrope layer: it made the homepage and the Products and Technology entry surfaces read as a different site.

The Datasheet That Argues remains the evidence discipline: show the source, the mechanism and the maturity beside each decision. A pre-silicon layout capture is labelled as a design visualization, never a die photograph. Product breadth does not imply availability or transfer DG32 evidence to another part.

**Key Characteristics:**
- One dark ground site-wide; chapters alternate only between Background and Surface, separated by hairline rules
- Newsreader headings, Inter prose and JetBrains Mono labels on every route, homepage included
- Original DeepGrid source imagery with captions and onward inspection links
- Searchable horizontal product rows retain process and individual maturity
- Readable static, reduced-motion and WebGL-free explanations

## Colors

### v11 catalogue scope
The `v11-*` roles in `app/modern-v11.css` are aliases of the incumbent tokens, kept so the v11 components need no renaming: Navy is Foreground (text), Paper is Background, White is Surface (raised chapters such as the system section), Muted is Muted Foreground, Rule is Line and Accent is Copper. Former light bands, including `.v6-bone` on the homepage and Company, use Surface. Never reintroduce a light page band: draw.io diagrams render their own dark variant through `color-scheme: dark`.

A warm copper accent on a cool near-black ground, with a single teal admitted only where the
hardware is in a safe state.

### Primary
- **Copper** (`#d4a36e`): the one accent. Section kickers, active tabs, links, the left edge of a
  data bar, the value a reader is meant to land on. A slightly lighter **Copper Ring**
  (`#d9ac78`) is the focus ring and the primary fill.
- **Hardware Copper** (`#bf7f3b`): deeper, used only for the hardware share of a cycle-budget bar,
  so hardware and CPU are distinguishable without a legend.

### Secondary
- **Signal Teal** (`#2f9e8c`): reserved. It marks the safe state, a held value and a passing gate.
  It is the only hue on the site that is not copper or neutral, and it earns that by never being
  decorative.

### Neutral
- **Ink** (`#101212`): the page ground. Cool, very slightly green.
- **Surface** (`#191d1b`): panels, inputs and any raised block.
- **Muted** (`#292d29`) and **Accent Surface** (`#343d31`): selection and hover grounds.
- **Border** (`#3d453b`): the visible edge on inputs and cards.
- **Rule** (`#48544066`): the hairline. Deliberately translucent, so it recedes on any ground.
- **Paper** (`#eeeae2`): body text. **Paper Bright** (`#f4f0e7`) for emphasis on a dark panel.
- **Ink 2** (`#a7b09f`) and **Muted Foreground** (`#a0a59b`): secondary text, captions and labels.

### Portfolio surface roles (v6)
- **Bone (historical role):** the homepage and Company bands now use Surface with light foregrounds. The old Bone Ink, Bone Muted and Bone Copper values remain historical tokens; do not use them to restore light page chapters.
- **Diagnostics / Evaluation Surface:** subdued dark grounds separate workload constraints and the close.
- **Portfolio / Strategy / Journey Rules:** hairlines and frames organise atlas rows and flat diagrams.
- **Industrial materials:** the workbench renderer uses literal copper, package, pad, seam and light colours.
  These describe object shading, not new UI accents. The sidecar records only actual renderer literals;
  removed colours from the historical detector snapshot are not added to the palette.

### Named Rules

**The One Accent Rule.** Copper is the only accent. A new state gets a new *shape*, weight or
position, not a new hue. Teal is the single exception and it means "safe", nothing else.

**The Named Colour Rule.** Repeated UI colours use named roles. The v6 bone, rule and dark-surface roles above are extracted from implementation. Industrial renderer materials are documented separately rather than promoted to interaction tokens. Historical literal-count audits are not current measurements.

**v10 decisions (2026-10-04).** Three roles were settled in the v10 QA pass. (1) **Diagram Ground**
(`#f4f2ec`, token `--diagram-ground`) is the light ground behind the draw.io architecture diagrams on the
product pages. (2) **Safe** (`--safe`, Signal Teal) is now its own token: `--cpu` had been teal and was used
both for the CPU share of a cycle bar and for safe states, which broke the teal rule; the CPU share is now
the neutral `--muted-foreground`, and every safe state reads `--safe`. (3) The product hero's exploded-die
render uses dark material shades (`#1d2420`, `#121614`, `#2a2f2a`, `#181c1a`) under the object-shading
exemption; they are renderer materials, not interaction colours.

**The Alpha Is Not A Colour Rule.** `#d4a36e1f` is copper at 12%, not a separate colour. Express it
from the token (`color-mix`, or a documented alpha token), never as a new hex, so a change to copper
reaches every place copper is implied.

## Typography

### v11 entry typography
v11 entry headings use the incumbent display role: Newsreader Variable at weight 400 with -0.032em tracking. The homepage hero keeps the v11-display size clamp, changing to `clamp(2.8rem, 10vw, 4.5rem)` at 760px; homepage h2 uses the v11-headline size. h3 and product row names use Inter 500. Manrope is no longer applied to any heading.

**Display Font:** self-hosted Newsreader Variable, with Georgia, Times New Roman and serif fallbacks
**Body Font:** self-hosted Inter Variable, with system-ui and sans-serif fallbacks
**Label / Mono Font:** self-hosted JetBrains Mono Variable, with ui-monospace, SFMono-Regular, Menlo and monospace fallbacks

**Character:** a journal pairing rather than a product one. The serif gives headings the authority
of a printed specification; the sans keeps long technical body text quiet and legible; the monospace
marks everything a machine emitted, which on this site is most of the numbers. The self-hosted variable faces keep the editorial pairing consistent; fallback stacks remain available while fonts load.

### Hierarchy
- **Display** (serif, `clamp(2.4rem, 3.8vw, 3.5rem)`, line-height 1.05, tracking -0.035em): the
  page headline, once per route.
- **Headline** (serif, `clamp(1.9rem, 2.6vw, 2.45rem)`, 1.16, -0.025em): a section verdict.
- **Title** (serif, `clamp(1.5rem, 2.1vw, 1.95rem)`, 1.22, -0.02em): a block heading.
- **Card** (serif, 1.35rem, 1.28, -0.015em): the heading inside a panel.
- **Body** (sans, 0.9375rem, 1.65): running text, held to a 64ch measure.
- **Control** (sans, 0.875rem): buttons, tabs and form controls.
- **Label** (mono, 0.75rem, tracking 0.08em, uppercase): kickers, units, table headers, evidence
  grades and anything a tool produced.

### Named Rules

**The Verdict Heading Rule.** A heading states the finding, not the topic. "Both domains close
post-route with positive slack" rather than "Timing closure". A heading that ends in a question mark
has not been written yet.

**The Machine Voice Rule.** Monospace means a machine produced it: a measured value, a part number,
an evidence grade, a file name. Prose never sets itself in monospace for texture.

**The Joined Quantity Rule.** A number and its unit are joined by a non-breaking space
(`50&nbsp;MHz`, `300&nbsp;cycles`), so a wrap can never separate them. Tabular figures
(`font-variant-numeric: tabular-nums`) are on every table, metric and counter.

## Layout

### v11 entry and shared shell
Above 1100px the sticky header combines the 165px wordmark, centered mega-navigation and contact link in one row; the topline is hidden. At 1100px and below, the labelled mobile-menu control replaces desktop navigation and contact. The dialog traps focus, restores focus on close and closes when switching back to desktop.

The hero is a .9fr / 1.2fr grid, capped at 1680px, with 5% gutters, 76px top/56px bottom padding and 660px minimum height. At 1100px its minimum height clears and top padding becomes 45px. At 760px it becomes one column with 6% gutters and 40px/30px vertical padding. Finder sections use 90px/5% padding, reducing to 50px/6%; section headings and system demonstrations stack at 760px. Product rows change from code/name/process/arrow to code/name/arrow with process beneath the name. Family diagrams use four selector columns, becoming two at 760px; technology annotations change from three columns to one. Original diagrams remain contained and uncropped. The shared first section heading and company band explicitly use margin-top:0 in `app/modern-v11.css`, so route navigation stays visible beneath the compact header. `app/motion.tsx` measures the full `.topbar` for `--nav-h`; sticky readers, tabs and anchor offsets use that height. Parent categories remain active on their detail routes, and exact destination links expose `aria-current="page"`.

### Retained engineering layout

A single centred column, `page-wrap`, capped at 1600px with an 8% side gutter that tightens to 5%
below 650px, and body text capped at a 64ch measure regardless of viewport. Sections are separated by generous vertical space
and hairline rules rather than boxes.

The inherited editorial type scale remains fluid. V6 uses Newsreader hero display at `clamp(3.5rem, 6vw, 6.5rem)` and 1.02 line-height; Inter section verdicts use `clamp(2rem, 3.7vw, 4rem)` and 1.13 line-height. Below 800px the hero uses `clamp(3.4rem, 10vw, 5.5rem)` and section verdicts use 2.3rem. Component layout uses CSS grid with `minmax(0, 1fr)` tracks, collapsing to a single
column at 720–800px depending on the component. Tap targets are at least 24px in every state, and
controls that take a press are 44px.

The declared map contains 35 routes. The shared sticky navigation carries a page-progress hairline, and every route
ends with the same cross-reference block: sibling sections with a reason each, then the source
documents behind that page.

The v6 hero is a .8fr / 1.2fr copy-and-workbench grid. Portfolio sections use 5% gutters and 5rem
vertical padding, shifting to 6% and 3rem below 800px. Atlas rows are .5fr / 2fr / 1.1fr and become
single-column below 800px. The four-column cycle budget becomes two columns; qualification gates
shift from three to two. Evaluation rows and route guides stack below 700px. The historical bone section now uses a full
Surface chapter ground. Diagram links and limits remain textual and source-linked.

## Elevation & Depth

**Flat at rest, lifted only when something genuinely floats.** Most depth comes from tonal
layering, ink to surface to muted, and from hairline rules. Nothing on the page carries a shadow in
its resting state except true overlays.

The earlier 2026-09-24 scan recorded 26 shadow declarations across 16 values; these are historical audit counts. They
fall into three roles, and the spread of values is loose rather than a designed scale: an elevation
pass could reduce 16 values to about four without changing how anything reads.

Zero-offset coloured halos were removed: on all four rules that had one, the state was already
carried by a copper border and a tinted background, so the glow decorated a signal that was already
there.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 12px 32px rgba(0,0,0,0.45)`, 8 uses): modals, drawers and the deck
  viewer. The most reused value on the site and the closest thing it has to a standard.
- **Deep overlay** (`0 16px 48px rgba(0,0,0,0.4)`, 3 uses; `0 24px 64px rgba(0,0,0,0.8)`): the
  largest floating surfaces, where the page behind needs to recede.
- **Hover lift** (`0 4px 20px #00000033`, and one copper-tinted `0 6px 18px rgba(212,163,110,.22)`):
  the only shadows that appear in response to a pointer, on interactive cards.

### Named Rules

**The No Halo Rule.** `box-shadow: 0 0 Npx <colour>` is banned and gated in the build
(`scripts/check-css-bans.mjs`). A shadow has an offset, or it is not a shadow. An inset hairline
(`inset 0 0 0 1px`) is a ring and is allowed.

**The Resting Flatness Rule.** A surface that is part of the page carries no shadow. A shadow means
the element is above the page (a modal, a drawer) or is responding to a pointer. There is no
ambient elevation.

**The No Side Tab Rule.** A thick coloured border on one edge of a panel is banned. State is carried
by the whole frame, the background tint and the label, never by a stripe.

## Shapes

Small radii. The incumbent scale uses 2px, 3px and 4px,
with 6px and 8px on the largest panels, 50% on dots and status pips, and a 9999px pill used twice.
Three neighbouring steps under 5px is one more than this system needs: 3px and 4px are not
distinguishable at a glance, and collapsing them is the one shape change worth making.

Several structural elements are deliberately square, including the architecture and library tab
bars, whose active state is a 3px top border on a 0px-radius button.

Borders are 1px and translucent by default. The form language is rectangular and quiet: this is a
document, and a document does not have pill-shaped edges.

## Components

### v11 catalogue primitives and source visuals
The primary entry action is copper with ink text, 4px radius, minimum 52px high and 16px 21px padding; hover uses Copper Ring. Focus is 2px copper at 4px offset. Buttons and product rows use 0.2s background transitions disabled under reduced motion. Filter buttons are at least 44px high with a Border outline; selected `aria-pressed` state is copper with ink text. Search has an accessible label, a Border bottom rule and copper caret. Search is case-insensitive over code, name, job and architecture and intersects with the selected family. The polite live result count includes the pre-silicon portfolio label; the empty state clears both search and family selection.

Product rows link to individual part routes and show process and maturity. The four architecture selectors (Motor control/SKU-1, Power management/SKU-3, Radar sensing/SKU-7, Drone integration/D100) are grouped buttons with `aria-pressed`, not tab-role panels. Their active underline is copper; the image and caption change together and link to the selected part.

Only existing DeepGrid imagery ships. The homepage hero is the semiconductor concept render from shekerkamma/deepgrid-platform-showcase (`public/images/v5/semiconductor-hero-*.webp`), linked to Products and captioned as an illustrative concept render, not a product photograph. Product SVGs reuse `public/diagrams/*-architecture.svg`. Technology reuses the unchanged DG32-LITE architecture SVG from the Downloads architecture package, links to the full-size diagram and adds three mechanism annotations. Diagram frames are Background with a Line hairline and 6px radius inside 8px Surface plates; captions use v11-caption. `docs/v11/image-provenance.json` records exact origins. Rejected generated concepts are excluded from publication.

### Retained engineering primitives

### Buttons
- **Shape:** slightly softened corners (4px), or square where the control is structural.
- **Primary:** copper fill, ink text, 10px 16px padding, minimum 44px tall.
- **Text link:** copper text with an underline offset 3px, no background, arrow glyph for an
  outbound or cross-section link.
- **Hover / Focus:** enumerated transitions on colour, background, border, opacity, shadow and
  transform at 0.15s. `transition: all` is banned and gated in the build. Focus is a 2px copper ring
  at 2–4px offset, never removed. It is written two ways across the codebase, `var(--ring)` (4 uses)
  and `var(--copper)` (5, one of them `!important`); they differ by a hair (`#d9ac78` against
  `#d4a36e`). Prefer `var(--ring)`, which exists for exactly this.

### Chips
- **Style:** 4px radius, surface background, translucent border, mono label at 0.75rem.
- **State:** the selected chip takes a copper border and copper text; the ground shifts one tonal
  step. No stripe, no glow.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** surface (`#191d1b`) on the ink ground.
- **Shadow Strategy:** none. See Elevation & Depth.
- **Border:** 1px translucent rule, or a solid border where the card is interactive.
- **Internal Padding:** 16–20px.

### Inputs / Fields
- **Style:** surface ground, 1px border, 6px radius, 11px 13px padding, 44px minimum height.
- **Focus:** a 2px copper ring at 2px offset.
- **Error:** a warm red-sand border (`#e8a08a`) with the message rendered directly beneath the
  field, wired through `aria-invalid` and `aria-describedby`. Focus moves to the first invalid field
  on submit.

### Navigation
- The shared v11 header uses the 1100px navigation breakpoint described in Layout. Retained route navigation and engineering controls keep their incumbent copper state markers.

### The Cross-Reference Block (signature)
Every route ends with the same structure: a hairline-separated list of sibling sections, each with a
one-line reason a reader would actually act on, then the source documents behind that page with
their page counts. It is typeset as part of the document, with no cards and no accent bar, so it
reads as the end of the argument rather than as a widget.

### Portfolio system workbench (v6, 2026-09-30)
The representative assembly is a production raster with interactive Three.js material overlays.
HTML labels identify motion (SKU-1 + DG32), power (SKU-3 + SKU-6), interface (SKU-5), controller
(DG32 QFN-64) and a conceptual sensing socket. Labels state roles; the assembly is not a validated
reference board. A functional DG32 plate distinguishes execution, checking, comparison, sticky
latching, FAULT_N and external gate-driver disable. The opened package is illustrative, not a die layout.
Motor movement explains loss of drive and coast-down; it does not measure mechanical behaviour.
Reduced-motion, pause/reset and WebGL-free comprehension are required; final runtime motion review
is recorded by the implementation verification, not inferred from this documentation scan.

### Source-led product atlas
Horizontal editorial rows replace a uniform card grid. Function filters use native buttons with
`aria-pressed`; each row joins a named architecture, purpose, boundary, maturity, evaluation needs
and a named source. Eleven core SKUs plus D100 retain individual maturity; DG SDV remains a separate
reference platform. DG32 simulation evidence is not transferred to the other parts.

### Strategy diagrams and integration labels
Shared digital foundations, specialist physical blocks and proposed organic-substrate SiP are distinct
regions. Proposed integration uses a dashed frame and an explicit label. DG32 QFN-64 remains separate.
Qualification gates name the evidence needed at each state. Process and manufacturing roadmaps occupy
separate lanes; four stop conditions pair a source-defined trigger with its response.

### Per-route evaluation guides
The shared Shell adds 22 route-specific guides, each with a verdict, three evaluation checks, a source
link and a reasoned onward route. Home and company carry evaluation inside their rebuilt story instead.
The guide complements the retained engineering or company body; it is not evidence that every page
body was rebuilt. The exact 24-route review is in `docs/v6/site-review.md`.

## Do's and Don'ts

### Do:
- **Do** state a finding in a heading, and print the evidence grade next to a figure.
- **Do** use the named palette and documented material roles. A colour used twice is a token.
- **Do** join a number to its unit with a non-breaking space, and set numerals as tabular figures.
- **Do** enumerate the properties a transition animates.
- **Do** give every scroll-driven surface a complete resting state, and a reduced-motion path.
- **Do** keep body text inside the 64ch measure.

### Don't:
- **Don't** add a second accent hue. Teal means safe and nothing else.
- **Don't** use `transition: all`, a zero-offset coloured halo, or a coloured stripe down one edge
  of a panel. All three are gated in the build.
- **Don't** add an unassigned near-black UI colour; reuse a surface role. Object-shading materials remain separately documented.
- **Don't** set prose in monospace, or a machine-produced value in the serif.
- **Don't** put a number on the page that no source document carries.






### Executive narrative, October 2026
The main reading order is customer problem → proposed value → evidence → adoption gate → next decision. `docs/executive-story-pack-v12.md` is the narrative source of record. Route openings, product benefit cards, detailed-section introductions and closing decisions use the executive story registries. Keep measurements and technical labels exact in the supporting layer. Ask leads with an executive brief and source-specific business implications; sources are disclosed on demand. Never expose retrieval scores, graph paths or implementation vocabulary as the answer’s structure.
