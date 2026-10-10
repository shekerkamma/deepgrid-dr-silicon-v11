---
name: DeepGrid Silicon Portfolio
description: The company's public look (deepgridsemi.com) carrying the evidence catalogue. Black frames and photographic heroes, light reading bands, one brand blue, Inter headings over Source Sans body. Technical stages stay dark cards on the light page.
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
  gray-50: "#f9fafb"
  slate-100: "#f1f5f9"
  gray-200: "#e5e7eb"
  ink: "#111827"
  ink-2: "#4b5563"
  ink-on-dark: "#ffffff"
  ink-2-on-dark: "#d1d5db"
  border-light: "#d3dde8"
  border-dark: "#374151"
  safe-light: "#0f766e"
  safe-dark: "#2dd4bf"
  ok-light: "#047857"
  danger-light: "#b42318"
typography:
  hero:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 4.4vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 3.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 2.9vw, 2.75rem)"
    fontWeight: 700
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
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px 22px"
  header:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
  footer:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
  close-band:
    backgroundColor: "{colors.night}"
    textColor: "{colors.white}"
---

# Design System: DeepGrid Silicon Portfolio

<!-- 2026-10-10: replaced the dark copper/Newsreader world on the owner's request ("v11 page should look similar to
https://deepgridsemi.com/"). Built in app/theme-dgs.css on branch design/deepgridsemi-look; plan in
design-plans/2026-10-10-deepgridsemi-look.md. The previous system is kept at docs/v11/DESIGN-copper-2026-10-09.md. -->

## Overview

**Creative North Star: "The Company Site That Shows Its Working"**

A visitor arriving from deepgridsemi.com should recognise the same company: black header, a photographic hero with a cyan headline, light sections, one brand blue, a dark call to action and a navy footer. Underneath that public face the site stays an evidence catalogue: every figure carries its maturity, every illustration says it is illustrative, and DG32's pre-silicon evidence never transfers to another part.

The look is the reference's; the content discipline is this site's own. What the reference does that this system refuses is listed under Do's and Don'ts.

**Key characteristics:**
- Frames are dark (header, heroes, application strip, close, footer); reading bands are light and alternate white, Gray 50 and Slate 100.
- Technical stages (die explorer, fault-path stage, system workbench, films, 3D) keep a dark ground and sit on light bands as dark cards.
- One brand blue carries every action and link; cyan appears only in the home hero headline.
- Photographic concept renders, text-free and captioned as illustrations, carry the home, Products, Technology and Evidence heroes.

## Colors

Restrained: neutrals plus one accent. Blue owns action; the rest of the page is white, gray and ink.

### Primary
- **Brand Blue** (`#0863a1`): buttons, links, selected filters, focus rings and accent marks on light bands (6.6:1 on white).
- **Blue Hover** (`#0a75bd`): the hover fill of a blue button.
- **Blue on Dark** (`#61a6fa`): links and accents inside dark bands. Not a button fill under white text (2.5:1).
- **Hero Cyan** (`#4de2ff`): the home hero headline only.

### Neutral
- **Black** (`#0a0a0a`): header (at 95% with an 8px backdrop blur), heroes, the application strip.
- **Night** (`#111827`) and **Night 2** (`#1f2937`): the close band, raised surfaces and hairlines inside dark bands.
- **Navy** (`#232c48`): the footer only.
- **White, Gray 50 (`#f9fafb`), Slate 100 (`#f1f5f9`), Gray 200 (`#e5e7eb`)**: light bands and hairlines.
- **Ink** (`#111827`) and **Ink 2** (`#4b5563`): text on light. On dark: white and `#d1d5db`.

### Signal
- **Safe** (`#0f766e` light, `#2dd4bf` dark): a held value, a safe state or a passing gate. Never decorative.

### Named Rules
**The Band Decides Rule.** No stylesheet names a colour. Rules speak role tokens (`--t-bg`, `--t-surface`, `--t-surface-2`, `--t-fg`, `--t-fg-2`, `--t-line`, `--t-border`, `--t-accent`, `--t-on-accent`, `--t-safe`, `--t-ok`, `--t-danger`), and the band an element sits in sets their values. `scripts/dgs-tokenize-colors.py` converted the 571 historical literals; the mapping is in `docs/v11/dgs-tokenize-map.tsv`.

**The Re-alias Rule.** Legacy names (`--copper`, `--ink`, `--v6-*`, `--v11-*`) are re-declared inside every band, never set once on `:root`, because a custom property resolves where it is declared and would carry light values into a dark stage.

**The One Blue Rule.** Blue marks what can be acted on or what the reader should land on. Headings are ink, never blue.

## Typography

**Headings:** Inter Variable, weight 700 (h1, h2) and 600 (h3, h4), tracking -0.02em on h1 and h2.
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
- **Section heads, every page.** Title left, intro paragraph right, stacked below 760px. Home uses the same grammar as the inner routes. The reference centres its section heads; this site does not (owner, 2026-10-10), so the hero, every section, the close and the footer share one left edge.
- **Band order on home.** Black hero, black application strip, Slate 100 product finder, Gray 50 system section, white films, Brand Blue capability band, white fault-path stage, white diagnostics, Gray 50 grid-paper stages, white decision gates, Night close, Night next-decision band, navy footer.
- **Engineering pages.** One `page-wrap` column (max 1600px, 8% gutter, 5% below 650px).
- Tap targets are at least 24px; controls that take a press are 44px.

## Elevation & Depth

Light bands use a soft offset shadow on cards, because white on white needs one edge more than a hairline.

- **Card** (`0 4px 16px rgb(30 50 80 / .08)`): resting cards on light bands.
- **Card hover** (`0 10px 28px rgb(8 99 161 / .16)`, plus `translateY(-1px)` and a blue border): interactive rows and cards.
- **Overlay** (`0 12px 32px rgba(0,0,0,.45)`): modals, drawers, the deck viewer.

### Named Rules
**The No Halo Rule.** A shadow has an offset. Zero-offset coloured halos are banned and gated in the build (`scripts/check-css-bans.mjs`).

**The Dark Card Rule.** Cards inside dark bands and on the blue band carry no shadow; they use a 1px border and a translucent white ground.

## Shapes

6px on buttons, filters and inputs; 8px on cards, stages and figures; 12px for the largest panels; 50% on dots. Tab underlines are an inset 3px box-shadow, not a border, so a rounded control never carries an accent edge.

## Components

- **Primary button:** Brand Blue, white text, 6px, 52px high, hover Blue Hover. Enforced with `:not(#_)` over the legacy layers.
- **Outline button (on dark):** 1.5px white border, 6px, white text, hover `rgb(255 255 255 / .08)`.
- **Text link:** blue, underline offset 4px; a lucide `ArrowUpRight` (14px, `aria-hidden`) only on outbound and primary links.
- **Product row (home finder):** white card, 8px, blue-tint border, card shadow; hover lifts 1px with a blue border.
- **Filter:** white with a border; `aria-pressed` selected state is Brand Blue with white text.
- **Fault chain:** white rows; reached rows take Gray 50 and ink; the current row takes a blue border and an 8% blue tint.
- **Header:** black at 95% with blur, white 500 links.
- **Footer:** navy, white links that turn Blue on Dark on hover; the tagline is a paragraph (not a heading), 1.75rem, hidden below 650px.
- **Focus:** a 2px outline in the band's accent at 3px offset, never removed.

## Do's and Don'ts

- **Do** paint every dark region's own ground; a dark band with transparent background renders white text on white.
- **Do** caption every concept render as illustrative ("not a product photograph") and record it in `docs/v11/image-provenance.json` with its prompt in `docs/v11/dgs-renders/`.
- **Do** keep technical stages dark: their renderer materials (`app/portfolio-workbench.css`, `app/die-stage.css`) are literal on purpose.
- **Don't** copy the reference's two-tone headings, gradient text, glow shadows, random coloured icon tiles, check icons on every bullet, rotated card labels, placeholder copy or partner-logo strip.
- **Don't** put a kicker or eyebrow above a heading; such kickers are hidden by rule (`[class*="kicker"]:has(+ h1, h2, h3, h4)`).
- **Don't** centre section headings, closes or link lists.
- **Don't** use a text glyph (↗) as an icon; use the lucide `ArrowUpRight` component.
- **Don't** add a scroll cue, a `01 / 06` counter used as decoration, or a film-grain overlay.
- **Don't** ship the design direction contract in page source (it was injected as an HTML comment until 2026-10-10).
