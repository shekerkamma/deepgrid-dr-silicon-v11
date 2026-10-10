# Plan: apply the ScrollCraft guidelines to the DeepGrid home page

Source: Nate Herk, "ScrollCraft" walkthrough, youtube.com/watch?v=QUI6Ug4cHnE (watched 2026-10-10 through Gemini;
timestamps below are Gemini's). Reference set: `~/.claude/skills/ai-graphics/assets/references/deeptech-silicon/`
(Etched, Groq, Lightmatter and Normal Computing captured; Cerebras from its teardown). Live baseline: ad14c1e.

**Brief: self-authored, not interviewed.** The owner delegated scroll-craft's interview on 2026-09-13 ("adapt the
recommendations if it makes sense").

## 1. The video's guidelines against the home page today

| # | Guideline (video time) | Home today | Verdict |
|---|---|---|---|
| 1 | The hook lands in seconds; treat the hero like short-form content (01:15) | Headline, lead and two buttons over a photo. No proof in the first viewport. | **Gap** |
| 2 | Motion density matches brand tone; professional pages get subtle motion (01:30) | Almost no motion; the workbench and fault path are click-driven. | Right tone; room for one move |
| 3 | Scroll correlates to state (00:48) | No scroll-driven element on the page. | **Gap**, by design so far |
| 4 | Scroll distance matches reading speed (10:15, 12:45) | Not applicable until #3 exists. | Rule for #3 |
| 5 | Feeling curve and energy curve, "quiet, then one surge" (08:06, 08:18) | 13 bands at similar intensity; the fault-path stage is the natural surge but sits mid-page with no lead-in. | **Gap** |
| 6 | Signature move: "every claim has a receipt" (07:06) | The site already has a claims register and source links, but scattered. | **Strong fit**, not yet visible |
| 7 | Prune clutter and repeated sections (13:55) | Two closes ("Define the opportunity", then "Choose a system opportunity"); a collapsed films library mid-page; about 12.6 viewport heights. | **Gap** |
| 8 | Keep identity, copy and colours while changing the experience (00:30) | Navy look, content locked. | Constraint |
| 9 | Visual verification harness (08:40) | `qa/dgs/gates.sh`, text-fit gate, contact sheets. | Already met |

## 2. Feeling curve (self-authored)

1. **Hero: "this is real silicon thinking".** Recognition, caused by the photo plus four real figures.
2. **Product finder: "I can find my part".** Orientation.
3. **System section: "I see where it sits in my machine".** Understanding.
4. **Shared capability: calm.**
5. **Fault path (THE PEAK): "I watched a fault get caught in hardware".** Conviction.
6. **Diagnostics and stages: "they know what is not proven yet".** Trust.
7. **Close: "I know the next step".** Action.

Peak sentence a visitor would repeat: *"It's the site where you scroll a processor fault through the chip and
watch the hardware stop the motor, every number with its source."*

## 3. Recommendations, in order

1. **Authority strip under the hero** (Normal Computing pattern; guideline #1). Four cells, each a real figure from
   the site's own data with its maturity label:
   - 12 architectures · pre-silicon portfolio
   - 39 cycles fault response · simulated
   - 130 nm · DG32-LITE process
   - QFN-64 · 9 × 9 mm
   Each cell links to its source (#6). No funding or competitor cells.
2. **Scroll-driven fault path: the one surge** (#3, #4, #5). The six-step chain advances as the section scrolls through
   a pinned stage of about 4.5 viewport heights, roughly one step per 0.7 viewport height, which is slow enough to
   read each step (#4). The "Inject illustrative fault" button stays for keyboard users and for reduced motion,
   where the stage is static and step-through.
3. **Receipts visible** (#6). Every figure on home (strip, diagnostics numbers, 39 cycles, 198 days) carries a small
   source link and a maturity tag in one consistent component, reusing `.v6-cite`.
4. **Prune** (#7):
   - On home, drop the shared "Choose a system opportunity" block; it repeats the close above it.
   - Move "Explore all ten product films" to Products, where the same tiles already live.
   - Target: 13 bands to 11, at most 11 viewport heights.
   - **These are content changes, so they need the owner's yes.**
5. **No Groq-style darkening statements.** One scroll-driven device on the page; a second would compete with the
   surge (#5, scroll-craft's "same device twice" rule).

## 4. Gates

- `qa/dgs/gates.sh`
- the scroll-craft harness: pinned stage at 1440, 390 and reduced motion (`data-sc-*`, so the lane stops being
  "not applicable")
- a manual reading-speed check on the pinned stage
- the text-fit gate with the stage at each step
