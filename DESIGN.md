---
name: DeepGrid Silicon Portfolio
description: The company's public look (deepgridsemi.com) carrying the evidence catalogue. Black frames and photographic heroes, navy reading bands, one brand blue, Inter headings over Source Sans body.
colors:
  brand-blue: "#0863a1"
  brand-blue-hover: "#0a75bd"
  blue-on-dark: "#61a6fa"
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

A visitor arriving from deepgridsemi.com should recognise the same company: black header, a photographic hero with a cyan headline, one brand blue, a navy close and footer. The reading sections are navy too (owner, 2026-10-10: white bands "do not look good at all"; the navy close band was the model). Underneath that public face the site stays an evidence catalogue: every figure carries its maturity, every illustration says it is illustrative, and DG32's pre-silicon evidence never transfers to another part.

**Key characteristics:**
- Two grounds only: Frame for header, hero, strips and footer; Page for every reading section, divided by hairlines.
- Brand Blue fills primary buttons and marks links and feature-card edges; no section uses it as a ground.
- Cards are raised navy with a hairline border; depth comes from the lighter surface, not shadows.
- Photographic concept renders, text-free and captioned as illustrations, carry the home, Products, Technology and Evidence heroes.

## Colors

Restrained: navy neutrals plus one blue.

### Primary
- **Brand Blue** (`#0863a1`): primary button fills (white text, 6.6:1), selected filters, the capability band.
- **Blue Hover** (`#0a75bd`).
- **Light Blue** (`#61a6fa`): links, focus rings and accent marks on navy (7.3:1 on Navy Page).
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

**The One Blue Rule.** Blue marks what can be acted on. Headings are white, never blue.

**The Opaque Ground Rule.** A card on a coloured band takes the opaque colour it renders as (`#1b6fa8` on Brand Blue), so alpha-blind contrast checks measure the real ground.

## Typography

**Headings:** Inter Variable, **light**: 300 for the home hero, 400 for h1 and h2, 600 for h3 and h4; tracking -0.025em (-0.03em on the hero). Changed from 700 on 2026-10-10. Every Awwwards deep-tech winner and silicon peer in `ai-graphics/assets/references/` sets display type at 300 to 400.
**Body:** Source Sans 3 Variable (the maintained Source Sans Pro), 1rem / 1.65, held to a 64ch measure.
**Code and measurements:** JetBrains Mono Variable, only for part codes (SKU-4, D100), measured values (39 cycles, 198 days) and diagram internals.

### Hierarchy
- **Hero** (`clamp(2.6rem, 4.4vw, 3.9rem)`, 1.1): the home headline, cyan on the photograph.
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
- **Shell.** Above 1100px the sticky header holds the wordmark, the mega-navigation, Contact and the blue "Discuss your application" button in one row; below 1100px the labelled menu control opens the phone sheet. `--nav-h` is measured by `app/motion.tsx`.
- **Home hero.** Full-bleed photograph (`public/images/dgs/home-hero.webp`) under a left-to-right scrim that covers only the copy column (`rgb(10 10 10 / .92)` to transparent at 68%); copy max 620px, left. Below 760px the scrim runs top to bottom and the caption moves under the copy.
- **Inner photo heroes.** Products, Technology and Evidence use a full-viewport `::before` image (`app/assets/dgs/*`) behind the first `section-head`, with copy stacked in the dark left column (max 600px). Other routes use a plain black hero band that bleeds to the viewport edge (`box-shadow: 0 0 0 100vmax` plus `clip-path: inset(-160px -100vmax 0)`).
- **Proof strip.** Directly under the home hero: four cells on black with hairline dividers. Each cell is a figure (Inter 300), a short label paraphrasing the claim, and its maturity plus source title, linked to the source document. The three engineering figures come from `app/claims.ts` (fault-39, fmax-lockstep, node-130) and are never typed by hand; the fourth is the 12-architecture portfolio count. Two columns below 900 px.
- **One scroll act.** The home fault path is the page's single pinned act: `ScrollAct` (`app/scroll-act.tsx`) mounts the vendored scrollcraft engine (`public/engine/scrollcraft`, unedited, MIT). The span is 4.5 viewport heights, about 0.7 per fault step, which is reading pace. It pins only at 1100 px and wider with motion allowed; on phones and under reduced motion the stage stays click-driven. The stage declares `data-sc-verify-state` for scroll-craft's harness. Never add a second scroll device to a page.
- **Section heads, every page.** Title left, intro paragraph right, stacked below 760px. Home uses the same grammar as the inner routes. The reference centres its section heads; this site does not (owner, 2026-10-10), so the hero, every section, the close and the footer share one left edge.
- **Band order on home.** Black hero, black application strip, then navy bands (product finder, system section, films), the Brand Blue capability band, navy fault-path stage and diagnostics, navy grid-paper stages, decision gates, the Navy Close band, the next-decision block, footer navy.
- **Engineering pages.** One `page-wrap` column (max 1600px, 8% gutter, 5% below 650px).
- Tap targets are at least 24px; controls that take a press are 44px.

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
- **Filter:** Navy Card with a border; `aria-pressed` selected state is Brand Blue with white text.
- **Fault chain:** Navy Card rows; reached rows take Navy Surface and white text; the current row takes a Light Blue border and a 14% blue tint.
- **Header:** black at 95% with blur, white 500 links.
- **Footer:** navy, white links that turn Blue on Dark on hover; the tagline is a paragraph (not a heading), 1.75rem, hidden below 650px.
- **Focus:** a 2px outline in the band's accent at 3px offset, never removed.

## Do's and Don'ts

- **Do** paint every dark region's own ground; a dark band with transparent background renders white text on white.
- **Do** caption every concept render as illustrative ("not a product photograph") and record it in `docs/v11/image-provenance.json` with its prompt in `docs/v11/dgs-renders/`.
- **Do** keep renderer materials literal: technical stages (`app/portfolio-workbench.css`, `app/die-stage.css`) are literal on purpose.
- **Don't** reintroduce white reading bands, a saturated section ground, or a third navy; the owner rejected each on 2026-10-10.
- **Don't** crop an image with text or a subject the caption names: scene illustrations show the whole frame, the phone hero image sits above the copy, and phone diagrams fit the width.
- **Don't** copy the reference's two-tone headings, gradient text, glow shadows, random coloured icon tiles, check icons on every bullet, rotated card labels, placeholder copy or partner-logo strip.
- **Don't** put a kicker or eyebrow above a heading; such kickers are hidden by rule (`[class*="kicker"]:has(+ h1, h2, h3, h4)`).
- **Don't** centre section headings, closes or link lists.
- **Don't** use a text glyph (↗) as an icon; use the lucide `ArrowUpRight` component.
- **Don't** add a scroll cue, a `01 / 06` counter used as decoration, or a film-grain overlay.
- **Don't** ship the design direction contract in page source (it was injected as an HTML comment until 2026-10-10).
