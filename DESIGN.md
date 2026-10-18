---
name: DeepGrid Silicon Portfolio
description: The company's public look (deepgridsemi.com) carrying the evidence catalogue. Black frames and photographic heroes, navy reading bands, one brand blue, Inter headings over Source Sans body.
colors:
  brand-blue: "#0e4c7a"
  brand-blue-hover: "#14598c"
  blue-on-dark: "#7fb0e6"
  hero-cyan: "#4de2ff"
  black: "#0a0a0a"
  night: "#111827"
  night-2: "#1f2937"
  navy: "#232c48"
  white: "#ffffff"
  navy-page: "#0b1220"
  navy-surface: "#0f172a"
  navy-surface-2: "#111827"
  navy-card: "#162033"
  navy-close: "#0e1a33"
  navy-line: "#1e293b"
  navy-border: "#2a3854"
  text: "#f8fafc"
  text-2: "#cbd5e1"
  safe: "#2dd4bf"
  ok: "#34d399"
  danger: "#fca5a5"
typography:
  hero:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 4.4vw, 3.9rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 3.6vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 2.9vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "-0.005em"
  body:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  lead:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.6
  label:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  code:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "0.8rem"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  circle: "50%"
spacing:
  measure: "64ch"
  gutter: "5%"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "16px 21px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue-hover}"
    textColor: "{colors.white}"
  button-outline-on-dark:
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "52px"
  filter-selected:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.navy-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "20px 22px"
  header:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
  footer:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
  close-band:
    backgroundColor: "{colors.navy-close}"
    textColor: "{colors.white}"
---

# Design System: DeepGrid Silicon Portfolio

<!-- 2026-10-10: replaced the dark copper/Newsreader world on the owner's request ("v11 page should look similar to
https://deepgridsemi.com/"). Built in app/theme-dgs.css on branch design/deepgridsemi-look; plan in
design-plans/2026-10-10-deepgridsemi-look.md. The previous system is kept at docs/v11/DESIGN-copper-2026-10-09.md. -->

## Overview

**Creative North Star: "The Company Site That Shows Its Working"**

A visitor arriving from deepgridsemi.com should recognise the same company: black header, a cyan home headline beside materially detailed concept imagery, one brand blue, a navy close and footer. The reading sections are navy too (owner, 2026-10-10: white bands "do not look good at all"; the navy close band was the model). Underneath that public face the site stays an evidence catalogue: every figure carries its maturity, every illustration says it is illustrative, and DG32's pre-silicon evidence never transfers to another part.

The 2026-10-14 investor extension inherits this system. `app/theme-dgs.css` supplies Frame `#070b14`, Page `#0b1220`, Card `#121b2d`, Brand Blue `#0e4c7a`, Light Blue `#7fb0e6`, Inter/Source Sans font variables and the 6/8/12px radius scale. `app/investor-journey.css` consumes `--t-*`, `--font-display`, `--dgs-blue` and `--sc-radius-sm` rather than defining a new palette or type family. The approved richer-image correction uses full-frame DeepGrid hardware and application concepts beside reading content, with explicit concept captions. Existing sourced artwork remains available where its provenance and proposed system role are clear. This documentation pass preserves the frontmatter tokens; their pre-existing drift and the stale `.impeccable/design.json` sidecar are not reconciled here.

**Key characteristics:**
- Two grounds only: Frame for header, hero, strips and footer; Page for every reading section, divided by hairlines.
- Brand Blue fills primary buttons and marks links and feature-card edges; no section uses it as a ground.
- Cards are raised navy with a hairline border; depth comes from the lighter surface, not shadows.
- Materially believable DeepGrid hardware concepts and sourced application artwork are displayed full-frame and captioned as illustrations. Home uses the portfolio assembly; Resources and Technology use the corrected DG32 board concept. Visible branding in artwork is identity, never evidence of manufactured hardware.

## Colors

Restrained: navy neutrals plus one blue.

### Primary
- **Brand Blue** (`#0e4c7a`): the fill of the one primary button per view (white text, 9:1). Deepened from the reference's `#0863a1` on 2026-10-11 (owner: buttons "too bright" across every section).
- **Blue Hover** (`#14598c`).
- **Light Blue** (`#7fb0e6`): links, focus rings, selected-state edges and accent marks on navy (8:1 on Page). Softened from `#61a6fa` on 2026-10-11.
- **Hero Cyan** (`#4de2ff`): the home hero headline only.

### Neutral: two grounds and one card (owner, 2026-10-10: backgrounds must gel)
- **Frame** (`#070b14`): header (94% with blur), hero, proof strip, application strip, footer, inner-page heroes.
- **Page** (`#0b1220`): every reading section, **one ground**, sections separated by a `#1b2538` hairline rule, never by alternating colours.
- **Card** (`#121b2d`) with border `#2a3854`: cards, rows on hover, filters, diagram plates, fault-chain rows.
- **Text** (`#f8fafc`) and **Text 2** (`#cbd5e1`).

Retired after measurement: the live home used seven grounds from two families (neutral `#0a0a0a`/`#111827`, blue `#0f172a`/`#0b1220`/`#232c48`) plus a saturated `#0863a1` section. Brand Blue is never a section ground; it marks actions, links and the 2 px top edge of feature cards.

### Signal
- **Safe** (`#2dd4bf`): a held value, a safe state or a passing gate. Never decorative.

### Named Rules
**The Band Decides Rule.** No stylesheet names a colour. Rules speak role tokens (`--t-bg`, `--t-surface`, `--t-surface-2`, `--t-card`, `--t-plate`, `--t-fg`, `--t-fg-2`, `--t-line`, `--t-border`, `--t-accent`, `--t-on-accent`, `--t-safe`, `--t-ok`, `--t-danger`), and the band sets their values. `scripts/dgs-tokenize-colors.py` converted the 571 historical literals; the mapping is in `docs/v11/dgs-tokenize-map.tsv`.

**The Re-alias Rule.** Legacy names (`--copper`, `--ink`, `--v6-*`, `--v11-*`) are re-declared inside every band, because a custom property resolves where it is declared.

**The One Blue Rule.** Blue marks what can be acted on. Headings and figures (39 cycles, 198 days, stat rows) are white, never blue.

**The One Fill Rule.** One filled action per action group: the shell and home hero use "Request a discussion" (investor contact intent); the hero's second action, "Explore the products", is outlined. The single home discussion close repeats "Request a discussion" and part pages retain "Discuss this part". Selected filters and workbench toggles take the Card ground with a Light Blue edge; secondary actions ("Inject illustrative fault", the Blueprint PDF) are outline buttons; repeated tile actions ("View details") are text links.

**The Opaque Ground Rule.** A card on a coloured band takes the opaque colour it renders as (`#1b6fa8` on Brand Blue), so alpha-blind contrast checks measure the real ground.

## Typography

### Dashboard operating surfaces

The complete use-case dashboard and compact dashboard route headers use a fixed 2rem heading/figure step, 1.25rem chart titles and 1rem card titles. These denser steps serve comparison and selection at desktop, tablet and phone widths. They retain the existing Inter/Source Sans typography and navy surfaces; chart series keep the validated dashboard palette. The readiness score bar conveys six-criterion document coverage, not product qualification. The readiness matrix is a heatmap keyed like the project's claude.ai Use cases dashboard: dataviz slot 4 amber `#c98500` = in place, the same amber at 24 % = partly, white at 6 % = not yet, with the word in every cell. Each row's use case is a real link (`?view=use-cases&sku=…#uc-implementation`) that opens its path in place and works in a new tab, with a second link to its application page. Implementation-step numbers denote the actual design-to-volume sequence.

**Headings:** Inter Variable, **light**: 300 for the home hero, 400 for h1 and h2, 600 for h3 and h4; tracking -0.025em (-0.03em on the hero). Changed from 700 on 2026-10-10. Every Awwwards deep-tech winner and silicon peer in `ai-graphics/assets/references/` sets display type at 300 to 400.
**Body:** Source Sans 3 Variable (the maintained Source Sans Pro), 1rem / 1.65, held to a 64ch measure.
**Code and measurements:** JetBrains Mono Variable, only for part codes (SKU-4, D100), measured values (39 cycles, 198 days) and diagram internals.

### Hierarchy
- **Hero** (`clamp(2.6rem, 4.4vw, 3.9rem)`, 1.1): the home headline, cyan in the copy column beside the concept illustration.
- **Display** (`clamp(2.3rem, 3.6vw, 3.25rem)`, 1.12): each route's h1.
- **Headline** (`clamp(1.9rem, 2.9vw, 2.75rem)`, 1.15): section h2, one weight, one line style.
- **Lead** (1.125rem): the hero lead and photo-hero intros.
- **Label** (0.875rem, 600, sentence case): labels over card content.

### Named Rules
**The One Left Axis Rule.** Every heading on every page aligns left. Centring is not a section treatment on this site, including where the reference centres.

**The One Voice Heading Rule.** A heading is one weight and one style. No lighter second line, no italic accent, no second colour. `<em>` inside headings was removed from 11 headings and from the `Sec` component.

**The Machine Voice Rule.** Monospace means a machine produced it: a part code, a measured value, a file name. Labels and prose are never monospace.

**The Verdict Heading Rule.** A heading states the finding, not the topic.

**The Joined Quantity Rule.** A number and its unit are joined by a non-breaking space, and tabular figures are on every metric.

## Layout

- **Paths.** All routes are lower case; an inline head script replaces a typed `/About` with `/about` before paint (static asset folders such as `/downloads/` keep their case).
- **Shell.** Above 1100px the sticky header holds the wordmark, Products, Applications, Technology, Resources, Company and Investors navigation, Contact and the blue "Request a discussion" button in one row. The discussion action links to `/contact?intent=investor`. At 1100px and below a control labelled "Menu" opens the phone sheet with the same group order. `--nav-h` is measured by `app/motion.tsx`.
- **Home hero.** A two-column composition puts product-purpose copy and actions left and the complete portfolio assembly concept (`public/images/deepgrid-brand/portfolio-systems.webp`) right. Columns are `1fr / 1.05fr`, with a 3rem gap and 3rem / 5% padding. The figure is in normal flow with a restrained border; its image keeps its native aspect ratio and uses contain sizing, with the caption below. The earlier full-bleed background and scrim are disabled. "Request a discussion" remains the first filled action and "Explore the products" the outlined second action, followed by the pre-silicon note. At 900px and below the columns stack with a 1.5rem gap: copy, actions and maturity note first, then the full-frame illustration and caption.
- **Technology opening split.** The title and explanation occupy the left column; the complete corrected DG32 board concept (`public/images/deepgrid-brand/dg32-control.webp`) and caption occupy the right, spanning the two copy rows. Equal columns have a 3rem horizontal gap and 3rem vertical padding. At 800px and below, title, explanation, then figure stack with 2rem vertical padding. The inherited photo backdrop is disabled. All opening grounds clip their horizontal bleed at the section's top edge (`inset(0 -100vmax)`) so they do not paint upward into navigation. Resources now uses a compact text opening and places the DG32 concept after its library, keeping document selection first.
- **Application galleries.** Resources introduces robotics, vehicle and driver-assistance context through its library gallery; the documents route also uses that gallery. Three full-frame linked figures sit in equal columns with a 1.5rem gap and ruled gallery boundaries, becoming one column at 800px and below. Each figure links to its relevant product or application review and keeps its caption in normal flow. Product pages use the corresponding system-role concept before technical diligence; no illustration transfers DG32 evidence to another architecture.
- **Proof strip.** After the product finder, before the application strip and technical demonstrations: four cells on Frame with hairline dividers. Each cell is a figure (Inter 300), a short label paraphrasing the claim, and its maturity plus source title, linked to the source document. The three engineering figures come from `app/claims.ts` (fault-39, fmax-lockstep, node-130) and are never typed by hand; the fourth is the 12-architecture portfolio count. Two columns below 900 px.
- **Fault demonstration.** The homepage now uses the direct interactive SafetyWorkbench at every width. Injection and reset remain available without the former 4.5-viewport pinned scroll sequence. The vendored scroll engine remains available for existing dedicated technical treatments; it is not mounted by the homepage.
- **Section heads, every page.** Title left, intro paragraph right, stacked below 760px. Home uses the same grammar as the inner routes. The reference centres its section heads; this site does not (owner, 2026-10-10), so the hero, every section, the close and the footer share one left edge.
- **Band order on home (current, 2026-10-15).** Hero, three product/application/engineering paths, portfolio finder, proof strip, application strip, DG32 fault demonstration, system workbench, layout evidence, evidence and gaps register, funding ledger, one discussion close, footer directory. Detailed diagnostics and qualification remain on their technical destinations. The shared-capability and growth-gates sections live on `/company`. The shell's extra "Continue your review" navigation is limited to Ask and Read, which lack the normal related-reference close.
- **Historical home order (2026-10-11).** `design-plans/2026-10-11-story-arc-and-figures.md` records the earlier proof/application-first story pack and route-list close. It is historical planning evidence, not the current home sequence.
- **Engineering pages.** One `page-wrap` column (max 1600px, 8% gutter, 5% below 650px).
- Tap targets are at least 24px; controls that take a press are 44px.

## Business-plan dashboard (/plan)

- **Where it runs:** `/plan` (`app/plan-dashboard.tsx`), published on v11/v12 (`DGS_PLAN=1` in `pages.yml`; owner, 2026-10-12) and on the Sheker-semi droplet. A build without the flag shows a notice; see `data/plan/README.md`.
- **Layout:**
  - a KPI row of four cells, each with a label, a large figure, a context line and its definition, visible and taken from `data/plan/metrics.md`;
  - then one panel per question: segments, margins, cash, use of funds, the P&L, and the reconciliation with /company.
  - Each panel's heading is the finding, computed from the data, and each ends on a source line linking its CSV.
- **Charts:**
  - hand-built SVG on the theme tokens, one axis per chart;
  - series colours are the dataviz dark slots 1–4 (`#3987e5 #d95926 #199e70 #c98500`), validated on the card surface `#121b2d`;
  - a 2 px surface gap between stacked segments, and value labels outlined in the page colour so gridlines never strike through them;
  - a legend plus direct labels, a hover tooltip on every mark, and a table carrying the same numbers.
- **Plan-specific wording** lives in the generated data, not the component, so a build without the flag carries none of it.
- **Money flow** (2026-10-17): after the four findings and the list of identities, one chapter walks revenue down to net income beside opening cash to closing cash, for one year at a time. It opens on the cash-low year. The year buttons filter that chapter only. `scripts/build-plan-data.mjs` refuses to publish a walk that does not close, and `Walk` draws a break instead of a bar if one ever does.

## Dashboards (/plan, /portfolio, /portfolio/brief, use cases)

Adopted 2026-10-17 from BenAI's dashboard rules (`~/.claude/skills/analytics-dashboard-builder`, `references/design.md`). Their source video says what they are for: one page of numbers that someone acts on. Where those rules conflict with this file, this file wins on brand: serif headings, no icon on every heading, no uppercase card titles. Their rules win on the data.

- **Nothing below 14px**, chart text included, measured on screen. SVG charts draw at 1:1: `useWidth()` in `app/dash-charts.tsx` makes the viewBox the plot's pixel width, so a phone does not shrink 14px labels to 6px. Hide a value label that will not fit (the tooltip and the table still carry it); never shrink it. `scripts/check-dashboard-type.mjs` runs in every build and fails on both. On the 17 Oct baseline it reports 36.
- **Cut test before a metric gets a place:** would the reader act differently if it moved? Offer 15–20 candidates, recommend 5–15, and agree a monospace wireframe before writing code. Lifetime totals, counts with no comparison, and anything a table on the page already shows are cut.
- **Mark from the question:** compare categories → sorted horizontal bars; change over time → line or columns; composition → stacked bar (a donut only for two or three well-separated parts); a total taken apart in steps → walk-down (`Walk`).
- **Colour by direction, not by sign.** A walk draws totals in the accent, increases in green and decreases in grey, and the signed figure at the row end carries the direction. Draw missing data as a gap or a hatch, never as a zero.
- **Flows close.** Every total is re-checked against its parts at build, and the identities are listed on the page.
- **No tabs inside the data.** A year or a use-case filter is fine; a second set of panels behind a tab is not.
- **House overrides of the BenAI rules** (decided 2026-10-17, after the first blind review): /plan keeps six chapters (it is read, not glanced at); spacing stays on the site's own scale, not 4/8/12/16/24/32; numerals stay tabular Source Sans, not monospace; the four finding cards keep their one-sentence explanation (ai-analyst storytelling). /portfolio reads the team's public Google Sheets at load by design (owner, 2026-10-13), so audit row 15 does not apply there. A dashboard chapter `h2` may be a navigation label ("Funding sources and capital allocation") when the panel `h3` under it states the finding. A reviewer reports these as overrides, not findings.
- **Known exception, to convert:** /portfolio/brief still switches three audience views with tabs (Tranche 1 brief, buyer questions, markets and qualification). That predates this rule; convert it to one page of chapters in the next dashboard pass.
- **Panels in Ask DeepGrid** (2026-10-18): Ask shows one dashboard panel under the cited answer when the question asks for it: the dashboard's own component and checked data (`PlanPanel`, `PortfolioPanel`, `UseCasePanel`), never a chart built from model output. `app/data/dashboard-panels.ts` picks it in three stages, each tried only when the one before finds nothing: phrase rules; semantic similarity to each panel's example questions, through a floor and lead calibrated with zero wrong and zero forced panels on `scripts/ask-panel-eval.json`; then one short call to the answer service (`POST /panel`), whose model picks from the panel list or none, and whose pick is accepted only if it is on the list. A tie or a weak match shows nothing; a wrong chart is worse than none. On 40 questions written after the router was finished, the three stages opened the right panel for 30 of 30 and a panel for none of 10 off-topic questions (18 Oct); `scripts/measure-ask-panels.mjs` reruns that score against the live service. The question can set the year of the money-flow walks ("FY30", and `/plan?year=FY30` does the same) and the chips in the plan-line and development-cost charts ("SKU-3 vs SKU-8"). A build without the plan never opens a plan panel. `scripts/check-ask-panels.mjs` runs in every build; `npm run build:semantic` re-embeds the examples and recalibrates after any change to the rules, the examples or the eval; the `/panel` endpoint ships with the Worker (`services/ask`), deployed separately from Pages; `scripts/verify-ask-panels.mjs` checks the rendered panels at 1440 and 390. To add a panel: give it an id, phrase rules, at least four example questions and a home anchor in `dashboard-panels.ts`, render it in the matching `*Panel` switch, and add eval questions it must and must not open.
- **Review:** before the owner sees a new dashboard, a fresh agent that did not build it runs the BenAI 20-point audit against the rendered page in both widths. It does not edit, and every finding cites a rule or is labelled taste. Fix, then re-review with a new agent, three rounds at most.

## Elevation & Depth

Flat at rest: cards are lifted by a lighter navy surface and a hairline, not a shadow.

- **Card hover** (`0 12px 28px rgb(0 0 0 / .35)`, `translateY(-1px)`, a Light Blue border): interactive rows and cards.
- **Overlay** (`0 12px 32px rgba(0,0,0,.45)`): modals, drawers, the deck viewer.

### Named Rules
**The No Halo Rule.** A shadow has an offset. Zero-offset coloured halos are banned and gated in the build (`scripts/check-css-bans.mjs`).

**The Lift By Surface Rule.** Depth on navy comes from a lighter surface step, never a resting shadow.

## Shapes

6px on buttons, filters and inputs; 8px on cards, stages and figures; 12px for the largest panels; 50% on dots. Tab underlines are an inset 3px box-shadow, not a border, so a rounded control never carries an accent edge.

## Components

- **Primary button:** Brand Blue, white text, 6px, 52px high, hover Blue Hover. Enforced with `:not(#_)` over the legacy layers.
- **Outline button (on dark):** 1.5px white border, 6px, white text, hover `rgb(255 255 255 / .08)`.
- **Text link:** blue, underline offset 4px; a lucide `ArrowUpRight` (14px, `aria-hidden`) only on outbound and primary links.
- **Product row (home finder):** a hairline-ruled index row (no card, no radius, no shadow); hover takes the Navy Card ground. It reads as a datasheet index, as on the reference sites.
- **Filter:** Navy Card with a border; the `aria-pressed` selected state is a lighter card (`#1a2740`) with a Light Blue border and white text, never a fill.
- **Fault chain:** Navy Card rows; reached rows take Navy Surface and white text; the current row takes a Light Blue border and a 14% blue tint.
- **Header:** black at 95% with blur, white 500 links.
- **Footer:** navy, white links that turn Blue on Dark on hover; the tagline is a paragraph (not a heading), 1.75rem, hidden below 650px.
- **Focus:** a 2px outline in the band's accent at 3px offset, never removed.
- **Product review paths:** three open, hairline-divided links immediately after the home hero lead to products, applications and engineering evidence; at 800px and below they stack with horizontal dividers.
- **Funding ledger and evidence register:** paired reading columns with tabular funding figures, ruled rows and explicit available/still-to-establish lists; at 800px and below they stack. They inherit navy role tokens and heading hierarchy, with no new card or shadow language.
- **Concept figure:** a native image link with descriptive alt text, intrinsic dimensions and contain sizing; the whole scene and named subject stay visible. New branded assets have 1536px and 768px WebP sources. Opening figures load eagerly; gallery figures load lazily. Captions name the proposed system role and source, then state "concept illustration, not a product photograph or deployment evidence. DeepGrid silicon remains pre-silicon." New hardware concepts come from host-native OpenAI image generation; fleet and driver-assistance scenes come from the reviewed DeepGrid commercial-fleet GTM deck. The corrected DG32 package is flat QFN-style without protruding gull-wing leads. Source hashes, specifications, dimensions and review status live in `docs/deepgrid-brand-image-provenance.json`; earlier asset records retain their original provenance files.
- **Discussion close and directory:** the home has one terminal discussion close, pairing the decision prompt with a filled "Request a discussion" action and stacking at 800px and below. The directory orders Products & applications, Technology & resources, Company and Investors. Inner pages retain their own evaluation close and related references, without an additional global investor close.
- **Task order:** product tiles and the document selector precede supporting imagery on the Products and Resources indexes. Technical hero grounds clip at their own top boundary, keeping the Technology tabs visible on phones.
- **Lattice (`app/lattice.ts`, `app/lattice.css`):** the one container for a set of peer items (mechanisms, values, partners, documents, product business case). Cells sit on a 1px hairline lattice (`gap:1px` over the Line colour), no per-cell border, radius or shadow; the first item is a full-width lead row (title in the start column, body in the end column); the rest split into the widest column count that divides them evenly, and the last cell spans any gap. No icons in cells. Use `lattice(n, maxCols)` and spread `.cell(i)` on each child. Reference: 21st.dev Feature Overview Bento. At 720px and below it is one column.
- **Question split (`.qsplit-*`):** heading and lede on the start side, a single-open `<details>` list on the end side, each item with a short mono tag (Physics, Open); the first item starts open. Used for product readiness questions. Reference: 21st.dev FAQ Two Column.
- **Comparison table:** a real `<table>`; the DG32 column takes `.cmp-hl` (9% copper tint). Never two eyebrow-labelled columns for a comparison.
- **Motion:** user-selected architecture diagrams and deck slides settle over 180 ms with a 3px translation and mild opacity change; content is visible from the first frame. Link arrows respond over 160 ms. Reduced-motion preferences disable both. These apply the animate skill's stable framing and purposeful transition principles; this work does not produce a separate animated film.

## Titles

Every h1, h2 and data-driven h3 states a business or technology fact: it names a part, a system or a number. "SKU-8 drives 1280 columns at up to 12 V and flags a frozen image within two frames.", not "Make the display trustworthy in demanding operating conditions." Use only figures already public on that page (never plan figures from gated data), and keep pre-silicon figures labelled ("design target", "in simulation").

- **Don't** coach the reader ("Agree the next milestone…", "Use recognition as context…") or write aphorisms ("Compute is not the limit. The sensors are."). A call to action may start with a verb when it names the action and its object ("Request an investment discussion, a partnership or an engineering evaluation.").
- **Don't** put a topic label where a finding fits ("Technical Whitepapers", "Product maturity and validation milestones."); labels are for navigation, filters and table headers.
- The decision close names its destination in the link ("Product validation →"), never "Take the next step".
- Most data-driven titles live in `app/executive-routes.json`, `app/executive-products.json` and `app/company-pages.ts`. `scripts/check-titles.mjs` (part of every build) fails on coaching openers in those files; on the 7 Oct overlay it reports 68. A product page must not override its own product-specific section titles with generic ones.
- deepgridsemi.com copy carried on /about (values, mission, "Achievements") stays verbatim unless the owner changes it; flag doubts, do not rewrite.

## Do's and Don'ts

- **Do** paint every dark region's own ground; a dark band with transparent background renders white text on white.
- **Do** caption every concept render as illustrative, state that it is not a product photograph or deployment evidence, and retain its source record. New richer-image assets use `docs/deepgrid-brand-image-provenance.json`; earlier renders retain `docs/v11/image-provenance.json` and their prompts in `docs/v11/dgs-renders/`.
- **Do** keep renderer materials literal: technical stages (`app/portfolio-workbench.css`, `app/die-stage.css`) are literal on purpose.
- **Don't** reintroduce white reading bands, a saturated section ground, or a third navy; the owner rejected each on 2026-10-10.
- **Don't** crop an image with text or a subject the caption names: scene illustrations show the whole frame, the phone home hero illustration follows the copy, actions and maturity note, and phone diagrams fit the width.
- **Don't** copy the reference's two-tone headings, gradient text, glow shadows, random coloured icon tiles, check icons on every bullet, rotated card labels, placeholder copy or partner-logo strip.
- **Don't** put a kicker or eyebrow above a heading; such kickers are hidden by rule (`[class*="kicker"]:has(+ h1, h2, h3, h4)`).
- **Don't** build a grid of same-size cards (icon, heading, text) as page structure; use the Lattice, the Question split or a table. Disclosure and group labels are sentence case, never generated uppercase.
- **Don't** centre section headings, closes or link lists.
- **Don't** use a text glyph (↗) as an icon; use the lucide `ArrowUpRight` component.
- **Don't** add a scroll cue, a `01 / 06` counter used as decoration, or a film-grain overlay.
- **Don't** ship the design direction contract in page source (it was injected as an HTML comment until 2026-10-10).
