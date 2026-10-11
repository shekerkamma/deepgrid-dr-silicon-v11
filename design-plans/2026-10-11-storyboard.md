# DeepGrid site storyboard (story-architect, section by section)

Written 2026-10-11 against the live v11 site (07071b9) plus the body fixes in this round.

**Method.** For each of 75 sections on the eight primary routes, the visible words were measured: what a reader sees, not what is collapsed. Each section was read and given one row covering:
- its claim;
- its role in the page's argument;
- the specific evidence it shows;
- its visual;
- its takeaway;
- the status of its body.

The measurements are in the run's `bodies.json`. **No row adds a claim the section does not already carry.**

## 1. BLUF

DG32 catches a processor fault in hardware and stops the motor bridge in 39 cycles (simulated). Every figure on this site states the evidence it rests on, so an equipment maker can scope a pre-silicon evaluation knowing exactly what is and is not proven.

## 2. Audience decision

**Primary reader:** an equipment maker's engineering or programme lead. They should shortlist one named part and open a bounded evaluation, with the evidence gap written down.

**Secondary reader:** a partner or investor. They read About and Company, and they never interrupt the buyer's path.

## 3. Tension

Safety-relevant control silicon is bought on evidence, and every part here is pre-silicon. A site that blurs design targets with measurements loses the buyer at the first datasheet review. DeepGrid's edge is the opposite: it shows its working, including three claims it withdrew.

## 4. Site argument arc

| # | Beat | Phase | Page that owns it |
|---|---|---|---|
| 1 | A safety-control silicon portfolio for motors, power, sensing and interfaces | Context | Home hero, Products |
| 2 | A processor fault is caught in hardware before software reacts | Tension → proof | Home act, Technology, Safety |
| 3 | The control loop runs in hardware, so its cost is fixed and the rest is a known budget | Proof | Control loop, Products |
| 4 | That budget runs thirty motor diagnostics; the sensor, not the chip, is the limit | Implication | Applications |
| 5 | Nothing is silicon-measured yet; each figure says what it rests on | Honesty | Evidence |
| 6 | Against the incumbent STM32G0, DG32 leads on lockstep and trails on ADC and flash, and each gap has a scheduled fix | Trade-off | Procurement |
| 7 | Name the part, the failure and the evidence gap | Action | Every page's close, Contact |

## 5. Section spine, page by page

**Status codes:**
- **OK:** the body carries the claim.
- **FIXED:** the body was missing or collapsed, and this round shows it.
- **MEDIA:** the visual carries the evidence.
- **CUT** / **MOVE:** see §7.

### Home: "the fault is caught in hardware, and everything else is honest about its evidence"

| # | Claim (heading) | Role | Evidence shown | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | Build the systems that move, protect and connect. | Context | Pre-silicon portfolio; four sourced figures: 12 architectures, 39 cycles, 55–62 MHz, 130 nm | Photo hero and proof strip | Real figures, each with its maturity | OK |
| 2 | In simulation, a processor fault switches off the motor bridge in 39 cycles, without firmware. | Peak | Six-step chain: MAIN → CHECKER (2-cycle skew) → comparator → sticky latch → FAULT_N → gate driver | Pinned scroll act; click to inject | The protection is hardware, not software | OK |
| 3 | At a 10 kHz loop, 82 % of the core stays free for diagnostics. | Implication | 177 cycles ADC, 53–58 CORDIC, ≈300 datapath; the 8-bit ADC limit; INT8 engine on its own clock | Stat row and two notes | Safety leaves room for monitoring | OK |
| 4 | Twelve architectures. Two carry engineering evidence today. | Breadth | 12 indexed rows: SKU-4 and SKU-10 have engineering evidence, ten are architecture scope | Hairline index with filters | Breadth is not equal readiness | OK (the rows are the body) |
| 5 | Four parts take the motion, power and interface jobs around DG32. | Fit | SKU-1, SKU-3, SKU-6, SKU-5 sockets; "roles, not a validated board" | Workbench plus diagram | Where each part sits | OK |
| 6 | Four of the six gates to production can only be passed on returned silicon. | Honesty | Six gates; 198 days = 30 digital + 168 physical, analytic | Gate rail and split bar | Know what is unproven | OK |
| 7 | Define the opportunity. Agree the next milestone. | Action | Six "what the next evidence must establish" rows | Index and primary button | Bring a part and its evidence gap | OK |

### Products: "choose by the job; DG32 is the one with engineering evidence"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | Choose the product by the problem it removes. | Context | 11 mature-node parts plus D100 | Workbench tabs and diagram | Start from the job | OK |
| 2 | Twelve architectures. Two carry engineering evidence today. | Breadth | As on Home | Index | (duplicate of Home) | **CUT on Products**: the tiles below carry the same twelve |
| 3 | Our products | Proof per part | Per part: three design-target figures and a film | Expanding tiles | Each part's headline numbers | OK; heading should be a claim → "Twelve parts, each built for one physical job." |
| 4 | DG32-LITE and DG32-2DOM share one pinout, pin for pin | Proof | 2 cores, ~300 cycles, 44 pins | 3D model | Swap variants without a new board | MEDIA |
| 5 | Self-test cannot see a fault between runs; lockstep checks every store. | Tension → proof | Self-test vs lockstep table; 39 cycles, simulated | Table | Lockstep closes the blind gap | OK (steps moved to Safety) |
| 6 | Six block groups on one clock; DG32-2DOM adds a seventh on its own. | Proof | Block groups and their contents; 0.43 W estimate | Chip map and cards | The engine is isolated | **FIXED**: 333 hidden card words now shown |
| 7 | The loop runs in hardware, so its cost is fixed. | Proof | 10/20/50/100 kHz: 5,000/2,500/1,000/500 cycles, ~300 hardware | Rate table | The firmware budget is known | OK |
| 8 | Mature-node silicon, around the sub-10 nm core. | Breadth | 28–120 V rails, 24-bit AFE, −55 to +125 °C; three foundries | Portfolio table | Why 130/180 nm | **FIXED**: 69 hidden words shown |
| 9 | Start on DG32-LITE; move to DG32-2DOM when the drive should watch its own motor. | Decision | LITE: lockstep, FOC, DShot; 2DOM: engine on a separate clock, in physical trials | Two cards | Pick the smaller part first | **FIXED**: 42 hidden words shown |
| 10 | Shortlist a part, then agree the evidence needed to adopt it. | Action | Lead, three checks (voltage/acquisition/interface job; SKU-4 vs SKU-1; …), two links | Close | Write the evidence gap down | **FIXED**: was a heading with 0 visible words |

### Technology: "a silent fault becomes a hardware signal"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | DG32 turns a silent processor fault into a hardware signal. | Context | Two cores two cycles apart; comparator; FAULT_N; 39 cycles simulated | Photo hero and diagram | The mechanism in one line | OK |
| 2 | DG32-LITE runs a second identical core two cycles behind the first, so a datapath fault reaches the gate driver without firmware. | Proof | One 130 nm die; 50 MHz; 2 masters; 16 IRQs; 64 KB ROM; 32 KB SRAM | Spec strip | What is on the die | OK |
| 3 | Four hardening findings set the shape of every block, starting with a lockstep core that tops out near 55–62 MHz. | Tension | No debug halt; fmax 55–62 MHz; ~8 CPI; no ECC; and what each forces | Table and system diagram | Each limit has a design answer | **FIXED**: 636 hidden words shown |
| 4 | Six block groups share one deterministic 50 MHz bus, and each exists because something on the die could not be left to firmware. | Proof | SAFE, MEM, MTR, SNS, COM, SYS with reasons | 3D model and cards | Every block has a job | **FIXED**: 62 hidden words shown |
| 5 | One current loop costs about 300 hardware cycles at any loop rate, the boot has no rescue path, and the fault path never waits for firmware. | Proof | Loop: 177 + 53–58 cycles; boot: 5 steps; fault: 5 steps | Three sequences | The three paths that explain the chip | OK; heading carries three claims (keep: it is the section's index) |
| 6 | Four decisions are frozen until first-silicon test, and the largest is that the control core will not be reopened for features. | Implication | Freeze the core; separate fetch path; error slave; shared motor pads | Cards | What will not change | **FIXED**: 56 hidden words shown |
| 7 | The lockstep core is the slowest block, so it sets the clock. | Proof | Post-route fmax per block: GPIO 173.6 … core 55–62 MHz | Bar chart | Why 50 MHz | OK |
| 8 | Connect each claimed benefit to a measurable system requirement. | Action | Lead, three checks (trace ADC → CORDIC → PI → PWM; MAIN/CHECKER; …) | Close | Test the benefit you rely on | **FIXED** |

### Evidence: "sixteen figures, five kinds of evidence, three withdrawn claims"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | Sixteen figures carry this site. Each names the evidence it rests on. | Context | Pre-silicon illustration | Photo hero | The register's purpose | OK |
| 2 | Nothing here is measured on silicon yet. Every figure says what it rests on instead. | Tension | 6 simulated, 1 post-route, 2 analytic, 1 tool estimate, 1 process nominal, 5 design constants; 11 other chips | Count grid | Read every number with its kind | OK |
| 3 | Three claims in our own sources failed verification. This site does not make them. | Proof of honesty | ₹1.01 Cr contract misdescribed; 39.3 TOPS was derived; 12.9× vs Mobileye a category error | Withdrawn list | It withdraws its own claims | OK |
| 4–8 | Simulation / Post-route / Analytic / Tool estimate / Process nominal | Proof, one kind each | Per figure: what it measures and its source; film narration as corroboration | Film moment and table | Each kind and what replaces it | OK (quotes kept: here the narration is evidence) |
| 9 | Some figures are design decisions, not measurements of anything. | Proof | ASIL-D target, 64 KB ROM, 32 KB SRAM, QFN-64 | Table | Not everything needs a test | OK |
| 10 | The other eleven chips rest on design documents, RTL and FPGA prototypes, not silicon. | Breadth | Per chip: strongest evidence and next step | Table | Readiness differs by part | OK (492 words; the table is the body) |
| 11 | What this site does not claim, and where to check what it does. | Honesty | No certification, sign-off, competitor price, other-chip silicon or market size | List | The boundaries, once | OK (owner of the list) |
| 12 | Ask for the proof required by the next decision, not a broader claim. | Action | Lead and three checks | Close | Ask for the right proof | **FIXED** |

### Applications: "thirty diagnostics fit; the sensor is the limit"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | Twelve chips go into five kinds of system, and DG32-LITE can also watch the motor it drives. | Context | 12-chip "where it goes / replaces / node / evidence" table with filters | Table and cards | The portfolio by system; DG32 opens into the story below | **FIXED**: the mismatch was this heading (changed earlier on 2026-10-11), not the table |
| 2 | DG32-LITE is a safety microcontroller for motors and batteries, and it can watch the machine it controls. | Context | SKU-4; Microchip/Renesas socket; 24 of 30 tasks > 1 kHz; slowest 10.3 ms; largest 20 KB | Text and four family counts | The second job in spare cycles | OK |
| 3 | It goes into five places, and each one has its own faults worth watching. | Fit | Five sockets with their tasks; CAN-FD not on LITE | Socket list | Where it earns its place | OK |
| 4 | In a motor drive, control comes first. Diagnostics has to fit around it. | Tension | A wrong PWM edge can short the bridge; diagnostics only advise | Text and film frame | The trip never waits on a model | OK |
| 5 | Control costs a fixed amount of hardware time, so what is left is a known budget. | Proof | 12.5 MMAC/s; 16.5 KB model budget; 82 % free; CORDIC in the loop | Stat row | The budget each task spends | OK |
| 6 | On this core, small classical models beat neural networks, and the signal matters more than the model. | Proof | RF 95.6 % on CWRU; SVM 95–100 % vs deep 97–100 %; features 4–5× (225.9 vs 51.8) | Model table | Spend cycles on the signal | OK |
| 7–10 | Bearings / Phase current / Existing sensors / Trend tasks | Proof, one family each | Per task: signal, model, latency, rate, memory | Four task tables | What runs where | OK (dense; candidate to collapse per family) |
| 11 | Compute is not the limit. The sensors are. | Implication | 8-bit ADC resolves 42 dB vs 40–60 dB sidebands; add an accelerometer (bearings 44 %) | Three cards | The sensor to add first | OK |
| 12 | DG32-2DOM adds an attention engine, on its own clock, for the models the scalar core runs slowly. | Option | 0.26 MMAC attention ≈ 21 ms in software; none of the 30 need it | Text | When to step up | OK |
| 13 | Every figure here is derived, not measured, and the classifier never holds the trip. | Honesty | 4 cycles per MAC back-solved; leakage drops 85.8 % to 69.5 %; expect 65–80 % | Text | Design a trial, not a claim | OK |
| 14 | Bring a failure mode and a sample rate. We will tell you whether it fits. | Action | Method: fault, sensor, rate, model | Links | Bring your fault | OK |
| 15 | Name the failure or product limitation you want to address. | Action | Lead and three checks | Close | (second close) | **FIXED**, but #14 and #15 now both close: **merge** (§7) |

### Procurement: "evaluate now if you need lockstep; wait for the second spin if you need the ADC"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | DG32 leads the STM32G0 on lockstep, DShot and CORDIC. The G0 leads on ADC and embedded flash. | Context and proof | 12-row comparison: CPU, safety, memory, PWM, analog … | Comparison table and two lists | An honest scorecard | OK |
| 2 | Every gap is a deliberate sequencing choice, and each one closes in the order that first silicon makes possible. | Tension | Why the second core, the small ADC, boot-from-QSPI, and the roadmap order | Cards | The gaps are planned | **FIXED**: 72 hidden words shown |
| 3 | First silicon rides a shared shuttle | Proof | MPW shares reticles; DG32-LITE on the September 2026 shuttle | 3D wafer | How first silicon happens | MEDIA |
| 4 | Closing the gaps in deliberate order. | Proof | Now / Next / Then / Parallel: first silicon, second spin (ADC, flash), CAN-FD and JTAG, 2DOM | Roadmap rail | Which spin closes which gap | OK |
| 5 | Evaluate DG32-LITE now if the drive needs lockstep; wait for the second spin if it needs a 12-bit ADC or embedded flash. | Decision | Evaluate-now and plan-for-second-spin criteria | Two cards | The buying rule | **FIXED**: 37 hidden words shown |
| 6 | Agree acceptance criteria, milestones and a fallback before selection. | Action | Lead and three checks | Close | Write the fallback down | **FIXED** |

### About: the company's own statement (deepgridsemi.com text, kept verbatim)

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | A semiconductor company for edge AI, in Hyderabad. | Context | 2020 founded · 28 team · 4 product lines | Stats | Who they are | OK |
| 2 | Founded in Hyderabad in 2020 to bring edge AI into vehicles, robots and infrastructure | Origin | Reference text, three paragraphs | Text and render | The founding focus | OK |
| 3 | The mission is road safety: zero road fatalities, looking back from 2040 | Purpose | Philosophy, vision, mission | Three cards | Why safety | OK |
| 4 | Safety is the foundation; innovation, quality and collaboration serve it | Values | Four values | Cards | Safety first | OK |
| 5 | The products aim at hard driving conditions, with radar assistance and blind-spot detection | Direction | Development text | Text | Links to SKU-7 radar | OK |
| 6 | Research, testing, collaboration, then validation in the field | Method | Four steps, about 20 words | Steps | How they build | Thin by design (reference text) |
| 7 | Start with a product opportunity we can evaluate together | Action | Contact and team links | CTA | (second close) | **Merge** with #8 (§7) |
| 8 | Judge the strategy through a specific customer requirement. | Action | Lead and three checks | Close | Bring a requirement | **FIXED** |

### Contact: "an enquiry is a scoped evaluation brief"

| # | Claim | Role | Evidence | Visual | Takeaway | Status |
|---|---|---|---|---|---|---|
| 1 | Turn a business need into a defined evaluation. | Context | What to bring | Hero | Bring constraints | OK |
| 2 | This form composes an email in your own client, so nothing is submitted to a server and nothing is stored here. | Proof of privacy | Fields; mailto; no cookies | Form | Your record, your send | OK |
| 3 | Three of these answer most questions without waiting for a reply, and all of them are on this site already. | Self-serve | Whitepaper (71 pp), playbook (12 pp), 5 films, Ask | Cards | Read before the call | OK |
| 4 | Design, verification and bring-up are in one building in Hyderabad, and that is where an enquiry lands. | Trust | T-Hub address; no published customer list (NDA) | Card | Who answers | OK |
| 5 | Leave the conversation with a clear scope and next decision. | Action | Lead and three checks | Close | Arrive with the evidence gap | **FIXED** |

## 6. Evidence map

**Direct evidence:** figures from `app/claims.ts`, each with a kind and a source:
- 39 cycles, 177, 53–58, ~300, ~8 CPI, 55–62 MHz, 0.43 W, 130 nm, 82 %, 198 days, ASIL-D target;
- the per-block fmax table;
- the STM32G0 datasheet column;
- the playbook task costs.

**Fair synthesis:**
- "Breadth is not equal readiness" (2 of 12 rows);
- "the sensor, not the chip, sets the limit" (42 dB vs 40–60 dB);
- "the firmware budget is known" (fixed ~300 cycles).

**Interpretation:**
- **Kept with labels:** "Four parts take the motion, power and interface jobs around DG32". The page already says these are "roles, not a validated reference board".
- **Kept as the company's own claims:** the About mission text, under About only.

## 7. Content cuts and moves (next tranche)

1. **Products #2 → cut.** The finder repeats Home, and the tiles list the same twelve parts.
2. **Applications #1 table → move to Products #8.** The 12-chip "where it goes / replaces" table is the portfolio story. Applications should open on DG32 (#2).
3. **Applications #14 + #15 → one close.** Keep #14's method text as the body of #15's decision heading.
4. **About #7 + #8 → one close,** the same way.
5. **Products #3 heading → a claim:** "Twelve parts, each built for one physical job." (the section's own lede).
6. **Applications #7–10:** consider one disclosure per family, with the verdict heading visible, to cut about six screens.

## 8. Rebuild instructions (done in this round)

1. **Cards (`ExplainedGrid`):** card content and the WHY line are visible again (pre-d71c389 form). This fixes 9 sections that hid 1,300+ words behind "Supporting detail".
2. **Every route close (`Related`):** the decision heading now carries the route's brief as its body: lead, three checks, then "Read the relevant architecture" and "Continue the evaluation". The collapsed "Detailed evaluation checklist" is gone. This fixes 10 headings that had 0 visible words.
3. **§7 items 1, 3, 4 and 5 are done:**
   - Products drops the duplicate finder.
   - The tiles heading is the claim "Twelve parts, each built for one physical job."
   - Applications and About end on their own close: `Related` skips the route close for routes in `ownClose`.
4. **Still to do:** item 2 (move the 12-chip table) and item 6 (collapse the task families). They need their own gated round, because the table carries the Applications filters and compare view.

## 9. Quality gate

- **Does each section have a reason to exist?** Yes, except the cuts and merges in §7.
- **Can a reader follow without the source?** Yes, now that card bodies and closes are visible.
- **Are the examples specific?** Yes. Every row names a figure, part or source.
- **Is there a clear next action?** One per page, after the §7 merges.
- **Are there unsupported or internal claims?** Two:
  - The About mission text is the company's own claim, kept under About.
  - The S1–S4 investor table lives on /company only.

## 10. Open items closed (2026-10-11, owner: "go ahead with your decisions")

**§7 item 2, move the 12-chip table: reversed after inspection.**
- Applications was built as the portfolio by system. Its own title in the source is "Twelve chips, five kinds of system".
- Products' table says "Per-chip facts live on /applications (one home per fact)", and Products, Company, the overview and Evidence link into its `#chip-` cards.
- The mismatch came from my headline change earlier the same day. The fix is the headline: "Twelve chips go into five kinds of system, and DG32-LITE can also watch the motor it drives."

**§7 item 6, collapse the task families: withdrawn, replaced by density.**
- A disclosure would have hidden the body again: the defect this storyboard exists to fix.
- Measured: the four families were 5,974 px at 1440, of which the 30 rows were about 4,600 px at about 130 px each.
- Each family now keeps its claim and every task. The family head reads title-left/intro-right, and a row puts its three costs on one line.
- Result: rows 130 → 99 px; families 5,974 → 4,386 px; page 20.1 → 18.3 screens at 1440 and 31.2 → 30.6 at 390.
- Further cuts would remove content (the 17-model table, 1,782 px; the five sockets, 1,306 px). They are left to the owner.
