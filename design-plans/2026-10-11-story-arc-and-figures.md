# Story pack: the site's arc (story-architect) and its figures (ai-analyst)

Written against: live v11 at 8f205f9, read 2026-10-11 from the rendered pages (headings, intros and heights measured
with Playwright at 1440 x 900). Status: **implemented 2026-10-11** (owner: "go ahead with your decision and recommendations", option 3: home serves
buyers, investor material stays on `/company`). Deviations are listed in §10.

Source spine: the site's own sections and copy. This pack reorders, cuts and sharpens them. It writes no new claims;
every figure named here already exists in `app/claims.ts` or on the page.

## 1. BLUF

DG32 catches a processor fault in hardware and stops the motor in 39 cycles (simulated), and every figure on this site
says what evidence it rests on, so you can scope a pre-silicon evaluation knowing exactly what is not yet proven.

## 2. Audience decision

The reader should agree to a bounded evaluation of one named part: "Discuss a system" with a product, a problem and an
evidence gap.

**Open question for the owner, which decides several cuts below:** who is home written for?
- The hero lead ("Find the product opportunity, then assess the evidence") and "Start with the system **your
  customer** needs" address someone who sells to equipment makers, such as a partner, distributor or investor.
- "Keep growth ambitions tied to decision gates" (S1–S4: "No binding Ripple Metering letter by the Chip 2
  factory-order cutoff", "delivered Chinese component prices…") is investor or board material.
- Contact and Procurement address the equipment maker directly.

Today the home page speaks to all three, and that is the main reason it runs to 15 screens.

## 3. Tension

Safety-relevant control silicon is bought on evidence. A pre-silicon company that blurs design targets with measured
results loses the buyer at the first datasheet review. DeepGrid's edge is the opposite: it shows its working. Today
that edge sits in the fifth home section, about six screens down.

## 4. Argument arc (home)

| Beat | Phase | What the reader learns | Existing section |
|---|---|---|---|
| 1 | Context | A safety-control silicon company for motors, power and sensing | Hero |
| 2 | Context | Four real figures, each with its maturity and source | Proof strip |
| 3 | Tension → proof | A fault is caught in hardware before software reacts. **The peak.** | Fault path (now 5th) |
| 4 | Implication | The control loop leaves room for diagnostics | Diagnostics (now 6th) |
| 5 | Breadth | The same discipline runs across 12 architectures; find your part | Product finder (now 2nd) |
| 6 | Fit | Where each part sits in the machine | System section |
| 7 | Honesty | What is designed, simulated and not yet built | Stage the commitment |
| 8 | Action | One close: name the part, the problem and the evidence gap | Define the opportunity |

Arc test (ai-analyst story-architect, Check 2): today the story opens on breadth (finder, system, shared capability),
reaches tension only at beat 5 and closes twice. Context dominates the first half, so "the story hasn't started" until
the fault path.

## 5. Section spine (home, proposed order)

| # | Heading (assertion) | Role | Evidence on the page | Visual treatment | Takeaway |
|---|---|---|---|---|---|
| 1 | Build the systems that move, protect and connect. (keep) | Context | Hero lead | Photo hero, unchanged | Who this is for |
| 2 | (proof strip, no heading) | Context | fault-39, fmax-lockstep, node-130, 12 architectures | Big-number row, unchanged | Real figures, each sourced |
| 3 | Make fault response part of the customer evaluation. | Peak | Six-step chain, 39 cycles simulated | The pinned scroll act, unchanged; moves up to 3rd | "I watched the hardware stop the motor" |
| 4 | Add diagnostics where they improve the product. | Implication | 177 / 53–58 / ≈300 cycles, 82 % headroom at 10 kHz | **Cycle-budget bar** (see §8), replacing four bare numbers | Room is left for diagnostics |
| 5 | Choose the opportunity. Then assess the product. | Breadth | 12 rows | Hairline index, unchanged | Find your part |
| 6 | Start with the system your customer needs. | Fit | Workbench and system image | Unchanged | Where it sits |
| 7 | Stage the commitment against the evidence. | Honesty | Six stages, 198 days analytic | **Two-segment timeline bar** (see §8) | What is not yet proven |
| 8 | Define the opportunity. Agree the next milestone. | Action | Six "Inspect SKU" rows plus "Discuss a system" | Unchanged | The next step |

## 6. Evidence map

- **Direct evidence (keep as is):** the proof-strip figures, 39 cycles, 177 / 53–58 / ≈300 cycles, 82 %, 198 days.
  All come from `claims.ts` with a maturity label.
- **Fair synthesis:** "Product breadth does not imply equal readiness"; "a production decision requires much more."
- **Interpretation (soften, or keep only where the owner wants it):** "Sharing selected technology can reduce repeated
  development work"; the shared-capability diagram. These are claims about the portfolio strategy, not about a part.

## 7. Content cuts

| Cut | Where | Why |
|---|---|---|
| "Keep growth ambitions tied to decision gates" with the S1–S4 table | Home | Internal strategy and investor triggers (named customer letter, competitor pricing, fab slips) on a buyer-facing page. Move it to About or an investor page **if** the owner's answer in §2 is "investors". |
| "Build on shared capability" | Home → Technology | Portfolio interpretation, not proof. It belongs beside the architecture, not between the finder and the peak. |
| Second close: "Where to go next" on home | Home | Home already closes with "Define the opportunity". Two closes compete (`DecisionClose` is already hidden on home for this reason). |
| Three closing blocks per inner route: decision section, journey block, "Where to go next" | Products, Technology, Evidence, Applications, Procurement, About, Contact | One close per page. Keep the decision section and fold its links into "Where to go next". |
| Repeated "Choose the opportunity. Then assess the product." | Products | Identical to the home finder heading. Products' own h1 already says it. |

Target length after cuts: home from 15 screens to about 11 (the agreed ScrollCraft target). Applications runs to
20.5 screens (18,414 px); review it separately once the home arc is agreed.

**Flag, do not cut:** the About paragraph "Deepgrid Semi is a pioneering semiconductor company specializing in AI
acceleration solutions for edge computing… at the forefront of the AI revolution" is carried verbatim from
deepgridsemi.com. It contradicts the site's story, which is safety and control silicon, not AI acceleration. The
owner decides whether the reference's wording stands.

## 8. Figures (ai-analyst visualization-patterns)

Rule applied: a single number gets a big-number treatment; a **part-to-whole** gets a horizontal stacked bar; never a
pie; at most two colours plus grey; the chart title states the data claim and differs from the section heading.

1. **Diagnostics row → cycle-budget bar.** Today it shows four big numbers side by side (177, 53–58, ≈300, 82 %) with
   labels such as "cycles · CORDIC". The reader has to do the sum. These figures are parts of one loop budget, so they
   are a part-to-whole.
   - Draw one horizontal bar of the 10 kHz loop budget: control-loop cycles in Brand Blue, the 82 % headroom in grey.
   - Title, with values from `claims.ts` only, for example: "The control loop uses about 300 hardware cycles; 82 % of
     the 10 kHz budget stays free."
   - Keep the four figures as labelled segments under the bar.
   - SVG in the page's tokens (`--t-accent`, `--t-line`), with an `aria-label` that carries the same sentence.
2. **198 days → two-segment bar.** The caption already splits it (30 digital + 168 physical). Draw it as one bar with
   two labelled segments. Title: "Physical design takes 168 of the 198 planned days."
3. **Proof strip:** keep as is. It already matches the big-number layout: figure, label, maturity, source.
4. **39 cycles** appears twice, in the strip (Inter 300) and under the fault act (mono). Keep both: the second is the
   act's payoff. DESIGN.md's Machine Voice Rule allows mono there.

Stop condition: if `claims.ts` cannot supply the 10 kHz budget total, do not compute one; keep the four numbers and
add only the sentence title.

## 9. Rebuild instructions (for the executor, after the owner's yes)

1. `app/home-refined.tsx`: reorder sections to the §5 order (fault act to 3rd, diagnostics 4th, finder 5th, system 6th,
   stages 7th, close 8th). `ScrollAct` keeps `span={4.5}`.
2. Remove the growth-gates section and the shared-capability section from home (move them per §7 if the owner says
   so).
3. Hide `dr-related` on home, the same way `DecisionClose` is hidden there (`app/related.tsx`).
4. Inner routes: one close. Delete the journey block (`app/route-journey.tsx`) where a decision section exists, and
   carry its links into `dr-related`.
5. Build the two bars in §8 as inline SVG components using theme tokens. No chart library.
6. Run `qa/dgs/gates.sh` (all exit 0), the scroll-craft harness on the moved act at 1440, 390 and reduced motion, and
   the text-fit gate. Take home contact sheets at 1440 and 390 and check the height is at most 11 screens.

## Quality gate

- **Every section has a reason to exist?** Yes, after the cuts in §7.
- **Readable without the source?** Yes. Each beat's evidence is on the page.
- **Specific examples?** Yes. Every beat names a figure or a part.
- **A clear next action?** Yes: one close.
- **Unsupported or internal claims?** Yes, two: the S1–S4 table, which is internal, and the About boilerplate,
  which contradicts the site. Both are flagged for the owner.

## 10. As built (2026-10-11)

- Home order: hero, proof strip, application strip, fault act, diagnostics, finder, system, stages, close, "Where to go next".
- Removed from home: shared capability and growth gates. Both already render on `/company` (`ReuseMap`, `RoadmapRegister`), so nothing was moved.
- **Kept, against §7:** "Where to go next" on home. `scripts/check-crossrefs.mjs` requires every route to render `<Related>`, and the build fails without it.
- **Not done, per the §8 stop condition:** the cycle-budget bar. `claims.ts` (`headroom-82`) defines 82 % as headroom after the datapath **and** the firmware, a different quantity from the ≈300-cycle datapath cost. A single bar would conflate them, so the row gained a sentence title instead.
- **Built:** the 198-day split bar (30 + 168).
- **Not done:** inner-route closes. The journey block is already collapsed in a `<details>`, so each route shows one decision section plus links.
- **Found on the way:** `SafetyWorkbench` Reset returned control to the scroll state, so a reader arriving from below (act at its last step) saw Reset do nothing. Reset now holds normal operation until the reader scrolls (`heldAt`).
- **Colour (owner: buttons "too bright"):** see DESIGN.md, One Fill Rule.

## 11. Section synthesis, every page (2026-10-11, tranche 1)

Owner: "in spite of using story-architect, why are we missing synthesis of content across each section of every page".

**Root cause.** Commit d71c389 (7 Oct, "Apply executive story architecture") added an overlay:
- `app/executive-sections.json` (26 entries), applied by `Sec` in `app/detail.tsx`;
- `executive-routes.json` page titles, applied by `SectionHead`;
- hand edits to Applications, architecture, fmax and die headings.

It replaced each section's own finding with generic advice. Its pack (`docs/executive-story-pack-v12.md`) gives every one of the 37 routes the same "Evidence" and "Visual treatment" cells, which shows a template filled, not a synthesis. Story-architect's own rules ("use source-specific examples"; "every slide must advance the argument") fail there.

**Rule applied now.** A heading states what its section proves, using a figure or fact already in that section. No new claims.

| Where | Was (overlay) | Now (the section's finding) |
|---|---|---|
| 26 `Sec` sections | e.g. "Fault detection supports a stronger control proposition." | The original title + second line, e.g. "Self-test cannot see a fault between runs; lockstep checks every store." (overlay no longer applied) |
| Applications, 7 beats | e.g. "Measurement quality can decide whether a diagnostic feature is useful." | e.g. "Compute is not the limit. The sensors are." (pre-d71c389 text) |
| Technology intro | "Keep the control function dependable, and make a fault observable." | "DG32-LITE runs a second identical core two cycles behind the first, so a datapath fault reaches the gate driver without firmware." |
| Timing chart | "Choose workloads within the validated timing envelope." | "The lockstep core is the slowest block, so it sets the clock." |
| Die | "Customise the product. Protect the safety foundation." | "Six functional groups. One of them is frozen." |
| Home fault act | "Make fault response part of the customer evaluation." | "In simulation, a processor fault switches off the motor bridge in 39 cycles, without firmware." (claims `fault-39`) |
| Home diagnostics | "Add diagnostics where they improve the product." | "At a 10 kHz loop, 82 % of the core stays free for diagnostics." (claims `headroom-82`) |
| Finder (home and products) | "Choose the opportunity. Then assess the product." | "Twelve architectures. Two carry engineering evidence today." (SKU-4, SKU-10; the other ten are architecture scope) |
| Home system | "Start with the system your customer needs." | "Four parts take the motion, power and interface jobs around DG32." (SKU-1, SKU-3, SKU-6, SKU-5) |
| Home stages | "Stage the commitment against the evidence." | "Four of the six gates to production can only be passed on returned silicon." (gates 03–06) |
| Products, 3D parts | "One footprint, two chips" | "DG32-LITE and DG32-2DOM share one pinout, pin for pin" |
| Page titles | technology, evidence, applications, procurement, control, package | Findings from each page (`executive-routes.json` `headline`) |

**Tranche 2 (next):**
- Tell each story once. The fault path is told in full on Home, Products, Technology and Safety; the cycle budget on Home, Products, Applications and Control loop. Keep the owner page and give the others one line plus a link.
- Remove film-transcript quotes that restate their section (Applications ×4).
- Remove the "What this site does not claim" list duplicated from Evidence on Procurement.
- Merge Procurement's shuttle caption and section.

**Owner decision pending:** the About body is deepgridsemi.com copy about ADAS and edge AI acceleration. Its headings describe equipment-maker silicon.

## 12. Tranche 2, as built (owner: "go ahead with self answers, decisions, recommendations")

**One story, one owner page.**
- The step-by-step fault path lives on `/technology/safety` and in the home scroll act. Products keeps the self-test vs lockstep table and its "Follow the fault path step by step" link; the five-step list is gone from `WhyLockstep`.
- Applications film moments keep the frame, the label and the player, but drop the narration quote (`FilmMoment said={false}`): each beat's paragraph already makes the point. Evidence keeps the quotes, because there the narration is the evidence.
- Procurement's copy of the "What this site does not claim" list becomes one line linking to Evidence, which owns it.
- Kept: the cycle-budget table on Products ("The loop runs in hardware, so its cost is fixed."). Choosing a loop rate is a part-selection question there.

**About (decision).** The body stays as written: it is deepgridsemi.com copy, the owner's named authority. The headings now say what that text says, instead of contradicting it:
- "Founded in Hyderabad in 2020 to bring edge AI into vehicles, robots and infrastructure"
- "The mission is road safety: zero road fatalities, looking back from 2040"
- "Safety is the foundation; innovation, quality and collaboration serve it"
- "The products aim at hard driving conditions, with radar assistance and blind-spot detection"
- "Research, testing, collaboration, then validation in the field"

Page title: the page's own "A semiconductor company for edge AI, in Hyderabad."

**Not changed:** the shuttle-scene duplicates were a 3D label, an aria-label and a no-WebGL fallback, which are not visible repetition.
