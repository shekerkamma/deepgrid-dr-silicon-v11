# DeepGrid Semi v12 — Story Pack (story-architect)

Status: **draft — awaiting build and review**
Scope: whole-site storyboard + Ask DeepGrid answer narrative
Sources used: `app/executive-products.json`, `app/executive-sections.json`,
`app/claims.ts` (incl. `withheld`), `PRODUCT.md`, `app/data/executive-answer.ts`
(repo `shekerkamma/deepgrid-dr-silicon-v12`, `main`).

---

## 1. BLUF

DeepGrid is building an Indian, mature-node silicon portfolio for the physical
functions around the main computer — motion, power, sensing, interfaces and
safety — and DG32 is the inspectable proof that the team can design it; the
right move for an equipment maker today is a **bounded evaluation against its
own acceptance criteria**, not a production commitment.

## 2. Audience decision

| Reader | What they should believe | What they should do |
|---|---|---|
| Equipment-maker business / programme lead | DeepGrid addresses a real sourcing and control gap in the parts around the main computer, and is honest about maturity | Name the socket and the acceptance evidence; open a scoped evaluation |
| Technical diligence / engineering lead | The DG32 design evidence is specific and traceable, and clearly labelled pre-silicon | Test the defined design; treat missing analog/memory features as explicit dependencies |
| Investor / strategy reader | The plan is staged: mature-node revenue first (FY31 ₹1,000 Cr portfolio plan), D100 as a separate ₹50 Cr growth round | Judge the plan on milestone gates, not on headline claims |

## 3. Tension — why now, what breaks if nothing is done

- The functions around the main computer (drives, power, interfaces, supervision,
  safety) are where equipment depends on **imported parts with sourcing risk**
  and where failures become **uncontrolled machines**, not just bad data.
- These functions need what leading-edge nodes cannot give: tolerance of
  **28–120 V transient rails and −55 to +125 °C** — which is why DeepGrid chose
  **130 nm** (process nominal).
- If buyers wait, they keep single-source exposure; if they commit too early,
  they bet a production programme on **pre-silicon evidence**. The site must
  help them take the middle path: evaluate now, commit at demonstrated gates.

## 4. Argument arc (site-wide)

1. **Context** — Silicon starts with the system: the valuable, under-served
   jobs sit around the main computer.
2. **Tension** — Those jobs carry sourcing risk and safety consequence; leading
   nodes are the wrong tool for them.
3. **Offer** — Eleven core SKU architectures plus D100 map to named jobs
   (architecture breadth, not twelve shipping products).
4. **Proof** — DG32-LITE (SKU-4) shows the team's design discipline: a
   simulated 39-cycle hardware fault path with no firmware in it, a 55–62 MHz
   post-route lockstep core that sets the 50 MHz clock.
5. **Honesty** — Nothing is measured on silicon yet; ASIL-D is a design target,
   not a certificate; three tempting claims are deliberately withheld.
6. **Implication** — The value is real only when the complete machine response
   is demonstrated in the customer's environment.
7. **Action** — Name the socket, agree acceptance evidence, run a bounded
   evaluation; stage commitments to demonstrated milestones.

## 5. Section spine (one row per site section)

| # | Section (route) | Assertion title | Role in story | Evidence | Visual treatment | Takeaway |
|---|---|---|---|---|---|---|
| 1 | Home `/` | Silicon starts with the system — and the system's riskiest jobs sit around the main computer. | Context + BLUF | PRODUCT.md purpose; portfolio scope | Existing workbench assembly; add a 3-line "answer / why now / next step" band under the hero | Reader knows the thesis and the next action in one screen |
| 2 | Products `/products` | Twelve architectures, each matched to one job a buyer already pays for. | Offer | executive-products.json (11 SKUs + D100) | Job-first grid: job → architecture → maturity chip | Find your socket by job, not by part number |
| 3 | Product detail `/products/sku-*` | Each product page = one decision: is this job worth evaluating now? | Offer → decision | Per-SKU headline/context/gate | Fixed narrative order: answer · why now · what we bring · proven / not yet · trade-off · next step | Every page ends in a decision, not a spec dump |
| 4 | Technology `/technology` | DG32 is the proof that the team can design control that fails safely. | Proof | claims: fault-39, fmax, loop-100k, headroom-82 | Fault path diagram with evidence-kind labels | The proof is specific and traceable |
| 5 | Technology › Safety | A wrong value becomes a safe bridge in 39 cycles — in simulation, with no firmware in the path. | Proof (headline) | fault-39 (Simulated), asil-d (target) | Step trace; "Simulated" badge on every number | Safety is designed in hardware; certification is still ahead |
| 6 | Technology › Control loop / Die / Package | Hardware does the loop, which leaves budget for diagnostics. | Proof (depth) | loop-100k, hw-300, headroom-82, qfn-64 | Budget bar: hardware cost vs headroom | Predictable control creates room for added value |
| 7 | Applications `/use-cases/*` | The same discipline applies across motors, vehicles, defence, grid and every board. | Implication | executive-products.json per domain | Domain → job → product chain | The reader sees their market in the story |
| 8 | Evidence `/evidence` | Nothing here is measured on silicon yet — and we say exactly what each number is. | Honesty / trust | claims kinds; withheld list | Evidence ladder; withheld claims shown with reasons | Trust is earned by labelling, not by volume |
| 9 | Procurement `/procurement` | Where DG32 leads, where it does not yet, and what closes the gap. | Trade-off | executive-sections "gaps", 198-day shuttle loop (Analytic) | Lead / gap / gate table | Gaps are dependencies in the adoption decision |
| 10 | Company / About | A staged plan: mature-node revenue first, D100 as a separate growth bet. | Strategy | FY31 ₹1,000 Cr portfolio plan; D100 ₹50 Cr round | Two-track timeline | The plan is sequenced to de-risk |
| 11 | Contact | Start with the outcome your product needs. | Action | executive-sections contact copy | Brief builder | Reader leaves with a scoped evaluation brief |
| 12 | Ask DeepGrid `/ask` | Every answer is an executive narrative, with its sources one click away. | Navigation of the whole story | All of the above | Narrative answer card; sources collapsed | Any question returns answer → why → trade-off → next step |

## 6. Ask DeepGrid — answer narrative contract

Every answer must render in this order. No developer, retrieval or
implementation language in visible text (no "chunk", "index", "retrieval",
"RTL", "GDSII", "cycles" without a business translation).

1. **Headline (assertion)** — the answer as a sentence a CEO could repeat.
2. **Short answer** — 2–4 sentences: the business answer, the context, the
   stance on maturity.
3. **Why it matters now** — the buyer's exposure if nothing changes.
4. **What DeepGrid brings** — the offer in business terms.
5. **Where the value is** — the commercial test that decides whether it pays.
6. **What is proven — and what is not yet** — evidence kind stated plainly
   (designed / simulated / estimated / measured / qualified).
7. **The trade-off** — what the buyer gives up or risks either way.
8. **Our recommendation** — the decision and the concrete next step.
9. **Sources** — collapsed by default, numbered refs inline only where a claim
   rests on them.

Comparison answers: one beat per product (job, value, gate), then "How to
choose" and "Our recommendation". Unsupported answers keep the same shape:
"What we can say", "What is missing", "How to get the answer".

## 7. Evidence map

| Claim | Class | Source |
|---|---|---|
| 11 core SKU architectures + D100; breadth ≠ shipping products | Direct | PRODUCT.md, SKU Blueprint Oct 2026 |
| DG32-LITE = SKU-4 lockstep safety MCU | Direct | claims `sku-4` |
| 39-cycle fault-to-safe-bridge, no firmware | Direct (Simulated) | claims `fault-39` |
| ~100 kHz current-loop ceiling | Direct (Simulated) | claims `loop-100k` |
| 55–62 MHz lockstep fmax → 50 MHz clock | Direct (Post-route) | claims `fmax-lockstep` |
| ~0.43 W at 50 MHz | Direct (Tool estimate) | claims `power-043` |
| 82% diagnostic headroom at 10 kHz | Direct (Analytic) | claims `headroom-82` |
| 130 nm for 28–120 V transients, −55…+125 °C | Direct (Process nominal) | claims `node-130` |
| 198-day design-to-shuttle loop | Direct (Analytic) | claims `loop-198` |
| ASIL-D is a target mechanism, not a certificate | Direct | claims `asil-d` |
| FY31 ₹1,000 Cr portfolio plan; D100 separate ₹50 Cr round | Direct | SKU Blueprint (via executive-answer.ts) |
| "Imported parts carry sourcing risk" | Fair synthesis | SKU-5 / SKU-10 profiles |
| "Evaluate now, commit at gates is the right path" | Interpretation | Recommendation — framed as advice |

## 8. Content cuts

- **Withheld, never shown as claims:** ₹1.01 Cr Army MCEME contract (misdescribed);
  39.3 TOPS "measured on FPGA" (a derivation); "12.9× cheaper than Mobileye"
  (category error; ~2.3× with NRE). Evidence page may list them *as withheld*.
- Retrieval mechanics, chunk IDs, graph scores, document numbers — out of all
  visible answer text.
- Generic placeholder copy ("What this means for your decision.", "The closest
  material is below.") — replaced by narrative.
- Raw engineering units in Ask headlines — keep them in "What is proven" with
  a plain-English gloss.

## 9. Rebuild instructions (for the build agent)

1. Add `app/data/executive-story.ts` (this run) — narrative content per product
   and per cross-cutting topic.
2. Replace `app/data/executive-answer.ts` (this run) — same exported type and
   function signature, so `app/ask.tsx` compiles unchanged.
3. In `app/ask.tsx`: render `answer` as the lead paragraph under the title;
   render `beats` as titled narrative sections in order; move the sources list
   into a `<details>` element labelled "Sources (n)", closed by default; keep
   inline `[n]` refs.
4. Apply section spine titles (§5) to the matching entries in
   `app/executive-sections.json` / page headers, within `app/claims.ts` limits.
5. Fix `CLAUDE.md` base path: v6 → `deepgrid-dr-silicon-v12`.
6. Verify (see HANDOFF.md) and open the preview before deploying.

## 10. Quality gate

- [x] Each section has a reason to exist and an assertion title.
- [x] Story readable without the raw sources.
- [x] Examples are specific (39-cycle fault path, 130 nm rationale, FY31 plan).
- [x] Clear decision and next action on every answer and page.
- [x] No unsupported claims; withheld claims excluded; no internal terms in
      visible text.
