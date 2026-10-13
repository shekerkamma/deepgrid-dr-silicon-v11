# Storyboard: the three dashboards (ai-analyst, 13 Oct 2026)

Method: ai-analyst `agents/story-architect.md` (audience journey, beats, headline read-through) and
`agents/validation.md` (every card number re-derived from the raw CSVs by `scripts/analyst/validate_findings.py`,
22 of 22 PASS). Pattern taken from the project's "Tranche 1 investor dashboard" (claude.ai): verdict title →
lede with the numbers → labels line → **What the data says** (insight cards: number, finding, one sentence,
source and kind of number) → chapters named as questions, each chart titled with its finding → full table.

## /portfolio: SKU portfolio
- **Audience**: an investor or an equipment maker's programme lead.
- **Current belief**: "₹1,000 Cr in FY31 from eleven chips."
- **Target belief**: three chips carry the early revenue; approval time, not market size, sets the pace.
- **Decision**: which chips to evaluate or fund first.
- **Verdict title**: Three chips carry 89 % of the FY31 ramp; approval time, not market size, sets the pace for the rest.
- **What the data says**: 89 % (SKU-1, SKU-2, SKU-10: ₹541 Cr of the chips' ₹609 Cr) · 61 % (FY31 ramp ₹608 Cr of
  ₹1,000 Cr plan lines; ₹1,000 Cr in FY31 is the stretch target) · 9 of 11 (on the Dec 2026 shuttle) · 4 of 9
  (shuttle chips in 18–36 month markets, 19 % of their plan lines).
- **Chapters**: Where the revenue comes from → What slows it → What it costs → What exists today → Which
  documents to trust.
- **Read-through**: Three chips carry the ramp. The ramp reaches 61 % of the plan in FY31. Nine go on the shuttle.
  Four of those wait 18–36 months. Tranche 1 buys the prototypes. Development costs ₹41.7–91.2 Cr. Two DG32 dies
  exist pre-silicon. The documents' disagreements are resolved.

## /plan: Business plan
- **Audience**: an investor. **Decision**: which model figures to rely on, and how much the raise must cover.
- **Verdict title**: The model turns profitable in FY28, but cash bottoms at ₹10.1 Cr in FY29, and 83 % of FY32
  revenue is Systems, not chips.
- **What the data says**: ₹1,128 Cr (FY32 revenue) · 83 % (Systems' share of FY32; chips 9 %) · FY28 (first
  profitable year, ₹1.38 Cr) · ₹10.1 Cr (lowest year-end cash, FY29).
- **Chapters**: What the company sells → How margins build → Where cash gets tight → What the raise buys → The
  P&L line by line → How it compares with the Blueprint.

## /portfolio/brief: Investor and buyer brief
- **Audience**: an investor in a tranche-1 meeting; a buyer's engineering lead.
- **Verdict title**: ₹10 Cr buys first silicon for nine chips; lead with the Blueprint, not the September model.
- **What the data says**: 76 % (prototypes, respins and the team) · 13.5× (Blueprint FY31 chips vs the model's
  chip line) · ₹10.1 Cr (model cash low, FY29) · ₹41.7–91.2 Cr (full development is a later raise).
- **Chapters** (tranche tab): What tranche 1 buys → Why the two plans differ → What investors will ask.
