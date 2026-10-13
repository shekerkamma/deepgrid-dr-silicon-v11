/** Investor and buyer brief (/portfolio/brief): published by the owner, 2026-10-13.
 *
 *  Transcribed from the claude.ai project document "Tranche 1 investor prep" (two tabs: the tranche-1 brief and the
 *  buyer prompt tests, both 13 Oct 2026). Every figure was checked against data/portfolio and data/plan before
 *  publication. Two changes from the source: the line saying the prep stays private was removed (the document-conflict
 *  list is now public), and "other capex ₹1–2 Cr a year" became the model's actual ₹1–5 Cr a year (cash.csv). The
 *  answer service cites these sections (services/ask/worker.ts), so a change here is a change to what Ask can say. */
export type Block =
  | {h2: string}
  | {h3: string}
  | {p: string; lead?: string}
  | {table: {head: string[]; rows: string[][]; total?: string[]}; note?: string}
  | {list: {lead?: string; text: string}[]; ordered?: boolean};
export type BriefTab = {id: string; title: string; dated: string; blocks: Block[]};

export const brief: BriefTab[] = [
  {
    id: 'tranche-1', title: 'Tranche 1 brief', dated: '13 Oct 2026',
    blocks: [
      {p: "Lead with the SKU Blueprint for tranche 1: its ₹10 Cr use-of-funds table is the ask, and its FY31 chip ramp (₹608 Cr) is not the same number as the September model's FY31 revenue (₹594 Cr), even though they look close."},
      {lead: 'Sources and labels.', p: 'SKU Blueprint (October 2026, current); financial model, corrected v3 (September 2026); DG32-LITE and DG32-2DOM preliminary datasheets (12 Sep 2026); DeepGrid business overview. Every Blueprint and model figure is a plan target, not a result; nothing here is audited or contracted. Approval times, market sizes, unit costs and margins are estimates.'},
      {h2: 'Nine chips carry ₹925 Cr of the ₹1,000 Cr plan and go on the 26 Dec 2026 shuttle'},
      {p: 'Nine of eleven Blueprint chips go on the ChipFoundry December 2026 shuttle; tranche 1 pays about ₹0.29 Cr each to get them there (SKU Blueprint, Oct 2026). Together they hold ₹925 Cr of plan lines and ₹601 Cr of the FY31 ramp, all plan targets. Four of the nine sell into markets where approval takes 18–36 months, so the FY31 ramp leans on three: SKU-1, SKU-2 and SKU-10 (₹541 Cr of ₹601 Cr).'},
      {table: {
        head: ['SKU', 'Chip', 'Plan line ₹ Cr', 'FY31 ramp ₹ Cr', 'First market (approval route)', 'Approval, months (est.)', 'Readiness', 'Dev cost ₹ Cr (est.)'],
        rows: [
          ['SKU-1', 'BLDC Motor Controller', '320', '256', 'Industrial (customer qualification)', '6–12', 'RTL + analog schematics', '5.2–11.1'],
          ['SKU-2', 'Smart-Meter SoC', '250', '175', 'Smart meters (BIS IS 16444 + utility tender)', '12–18', 'RTL + analog schematics', '2.2–4.6'],
          ['SKU-10', 'DG32-Max Secure MCU', '110', '110', 'Industrial (customer qualification)', '6–12', 'RTL', '2.1–4.3'],
          ['SKU-9', 'SDV Zonal Gateway', '60', '6', 'Automotive (AEC-Q100 + design-in)', '18–36', 'Digital RTL', '3.8–8.8'],
          ['SKU-5', 'Interface Transceiver', '45', '14', 'Meters, industrial', '6–18', 'RTL + analog schematics', '3.9–9.3'],
          ['SKU-3', 'Hi-Rel PMIC', '40', '12', 'Defence first (MIL screening + vendor listing)', '18–36', 'RTL + analog schematics', '5.0–11.1'],
          ['SKU-4', 'Lockstep MCU (DG32-LITE die)', '40', '4', 'Automotive (AEC-Q100 + design-in)', '18–36', 'RTL; die hardened and taped out per datasheet', '3.4–7.8'],
          ['SKU-6', 'Voltage Supervisor', '40', '16', 'Defence first (MIL screening + vendor listing)', '18–36', 'RTL + analog schematics', '3.9–8.3'],
          ['SKU-8', 'Display Driver', '20', '8', 'Meters, industrial', '6–18', 'RTL + analog schematics', '2.4–5.3'],
        ],
        total: ['Nine on shuttle', '', '925', '601', '', '', '', '31.9–70.6'],
      }, note: "Plan lines, ramp, readiness and dev cost: SKU Blueprint (Oct 2026), plan targets and estimates. Approval months: the Blueprint's approval table by market; which market each chip enters first is read from the Blueprint's ramp groups and tranche 1 uses (SKU-6 military screening, meter certification), so treat the mapping as an estimate."},
      {list: [
        {lead: 'Not on the shuttle:', text: 'SKU-7 4D Radar RF (digital RTL only; SiGe front end) and SKU-11 BMS Controller (specification; no MPW slot). Together ₹75 Cr of plan lines, ₹8 Cr of FY31 ramp. D100 (28 nm, Track B) has no plan line.'},
        {lead: 'Clock, SKU-4 and SKU-10:', text: 'the Blueprint lists 100 MHz, a design target. The DG32-LITE datasheet (12 Sep 2026) specifies 50 MHz; the lockstep core closes at 55–62 MHz in post-route timing, pre-silicon. No silicon has been measured.'},
        {lead: 'Readiness, SKU-4:', text: 'the Blueprint says RTL; the DG32-LITE datasheet (12 Sep 2026) says taped-out RTL and hardened die. Both are pre-silicon.'},
        {lead: '₹1 Cr rounding inside the Blueprint:', text: "SKU-2, SKU-5 and SKU-8 sum to ₹197 Cr in FY31, but the Blueprint's ramp table shows that group at ₹196 Cr. All eleven SKUs sum to ₹609 Cr against the ₹608 Cr total. Quote ₹608 Cr and say it is the Blueprint's table total."},
      ]},
      {h2: 'The two plans agree on FY31 revenue only by coincidence'},
      {p: "The Blueprint's ₹608 Cr FY31 ramp is chip revenue alone; the September model's ₹594.3 Cr FY31 is the whole company, and only ₹45.0 Cr of it is chips. The model's FY31 revenue is mostly its Systems segment (₹501.9 Cr), with Robotics ₹28.9 Cr and Sensors ₹18.5 Cr. Neither document has absorbed the other, so an investor who adds them, or swaps one for the other, gets a wrong picture."},
      {table: {
        head: ['Item', 'SKU Blueprint (Oct 2026)', 'Financial model v3 (Sep 2026)', 'How to read it'],
        rows: [
          ['Capital', '₹50 Cr equity in tranches: ₹10 Cr, then ₹40 Cr', '₹55 Cr: ₹45 Cr equity + ₹10 Cr CGTMSE-backed loan', 'Different structures; the model adds debt and ₹5 Cr more'],
          ['What tranche 1 / early capital buys', '₹10 Cr: prototypes ₹2.6 Cr, respin reserve ₹2.5 Cr, team ₹2.5 Cr, approvals ₹1.0 Cr, tools and lab ₹1.0 Cr, contingency ₹0.3 Cr, boards ₹0.1 Cr', 'Tape-out capex ₹18 Cr (FY27), ₹10 Cr (FY28), ₹2 Cr (FY29); other capex ₹1–5 Cr a year', "The Blueprint's table is line-by-line and sums to ₹10.0 Cr; the model has no tranche split"],
          ['Development cost', '₹41.7–91.2 Cr for all eleven chips; ₹31.9–70.6 Cr for the nine on the shuttle (estimates)', '₹30 Cr tape-out capex over FY27–FY29, plus R&D in the P&L', '₹50 Cr of Blueprint tranches covers the low case, not the high case'],
          ['First chip revenue', 'FY29: ₹70 Cr (DG32-Max and motor controller)', 'Semiconductors: ₹0.05 Cr FY28, ₹5.2 Cr FY29', '13.6× apart in FY29'],
          ['FY31 chip revenue', '₹608 Cr (table total; SKUs sum to ₹609 Cr)', '₹45.0 Cr Semiconductors segment', 'The core gap: 13.5×'],
          ['FY32', '₹844 Cr chips', '₹104.0 Cr chips; ₹1,128.5 Cr total', 'Model total exceeds the chip ramp only because of Systems'],
          ['Process scope', '130 nm SKY130; D100 at 28 nm as Track B with no plan line', 'R&D line "SoC4 5nm tape-out program": ₹95.1 Cr in FY31, ₹169.3 Cr in FY32', 'A 5 nm programme appears only in the model'],
          ['Margin', 'Gross margin 53–82% on four costed chips (estimates, Oct 2026)', 'Gross margin 84% in FY31 (₹501.0 Cr on ₹594.3 Cr)', "Model margin sits above the Blueprint's per-chip range"],
          ['Cash low point', 'Not modelled', 'Closing cash ₹10.1 Cr at end FY29 (Mar 2029), lowest year', 'Tranche timing in the Blueprint has no cash curve behind it'],
        ],
      }, note: 'SKU Blueprint (Oct 2026) ramp table; financial model corrected v3 (Sep 2026) revenue by segment and P&L. Plan targets.'},
      {lead: 'Recommendation.', p: 'Present the Blueprint as the chip plan and the ₹10 Cr table as the ask. Describe the September model as the company-wide plan written before the Blueprint, and say plainly that its chip line (₹45 Cr in FY31) predates the Blueprint ramp. Commit to a model v4 that takes the Blueprint ramp as its Semiconductors line before tranche 2.'},
      {h2: 'Five questions: answer each with what is proven, then what is a target'},
      {p: 'The honest line through all five: no silicon and no customers yet; tranche 1 buys the first silicon for nine chips and the first approvals.'},
      {h3: '1. What exists today: any silicon, any customers?'},
      {p: "No silicon and no customers. DG32-LITE and DG32-2DOM are taped-out RTL and hardened die, pre-silicon (preliminary datasheets, 12 Sep 2026). The DG32-LITE lockstep core closes at 55–62 MHz in post-route timing, a pre-silicon result; the datasheet specifies 50 MHz, and SKU-10's 100 MHz is a design target (SKU Blueprint, Oct 2026). The datasheets specify the 8-bit ADC as untrimmed. There are no purchase orders or letters of intent today. The demand case is that Indian buyers in metering, defence and industrial are already obliged to buy domestic; that is a thesis, not a booked order."},
      {h3: '2. What does ₹10 Cr buy, and how will I know it worked?'},
      {p: 'It buys nine prototypes on the 26 Dec 2026 shuttle (₹2.6 Cr, about ₹0.29 Cr each), a respin reserve for about eight re-runs (₹2.5 Cr), the engineering team (₹1.0 Cr to March 2027, ₹1.5 Cr for the next 12 months), first approvals (₹1.0 Cr: SKU-6 military screening, meter certification with a partner), tools and lab (₹1.0 Cr), contingency (₹0.3 Cr) and boards (₹0.1 Cr). Source: SKU Blueprint (Oct 2026), plan targets. The milestones are: nine designs on the shuttle by 26 Dec 2026; first silicon brought up on boards; approvals started for SKU-6 and the meter SoC. The silicon return date is not stated in any source document, so no date is committed until ChipFoundry confirms it.'},
      {h3: '3. The Blueprint says ₹608 Cr in FY31 and the model says ₹594 Cr. Which is it?'},
      {p: 'Neither contradicts the other; they measure different things. ₹608 Cr is chip revenue alone (SKU Blueprint, Oct 2026). ₹594.3 Cr is total company revenue, of which chips are ₹45.0 Cr and Systems ₹501.9 Cr (financial model v3, Sep 2026). Both are plan targets. The model predates the Blueprint and has not taken in its ramp; a model v4 with the Blueprint ramp as its chip line is due before tranche 2.'},
      {h3: '4. When does chip revenue start, and what slows it?'},
      {p: "The Blueprint's first chip revenue is ₹70 Cr in FY29 (Apr 2028–Mar 2029), from DG32-Max and the motor controller (plan target). Both sell into industrial markets, where customer qualification takes 6–12 months; smart meters take 12–18 months (BIS IS 16444 plus a utility tender). Automotive and defence take 18–36 months (AEC-Q100 and design-in; MIL screening and vendor listing), which is why the automotive group carries only ₹18 Cr and the defence group ₹28 Cr of the FY31 ramp. Approval times are estimates from the Blueprint's approval table. The FY29 start also depends on first silicon working, which no one has measured yet."},
      {h3: '5. How much capital does this take in total, and do the margins hold?'},
      {p: "Development cost for all eleven chips is ₹41.7–91.2 Cr (estimate, SKU Blueprint, Oct 2026). The Blueprint's two tranches total ₹50 Cr, which covers the low case; the high case needs more. The September model raises ₹55 Cr (₹45 Cr equity plus a ₹10 Cr CGTMSE-backed loan) and its closing cash bottoms at ₹10.1 Cr at end FY29 (plan target). On margin, the Blueprint costs four chips at 53–82% gross margin: for example the voltage supervisor at $0.09–0.17 to make against $0.20–0.80 prices, and DG32-Max at $1.30–2.30 against $3–8 (estimates, no silicon yet). The model's FY31 gross margin of 84% is above that range."},
    ],
  },
  {
    id: 'buyers', title: 'Buyer questions', dated: '13 Oct 2026',
    blocks: [
      {p: "Six questions an equipment maker's engineering or programme lead would ask, answered under the same rules: every answer names its source and labels targets."},
      {h2: 'All six get honest answers; none can give a sample date, and three have no spec to give'},
      {p: 'The weak spot is data, not rules: only DG32-LITE and DG32-2DOM have datasheets, so for SKU-1, SKU-2 and SKU-6 the honest answer to "will it fit our board" is "not documented yet".'},
      {table: {
        head: ['#', 'Buyer use case', 'Chip', 'Short answer', 'Missing for the buyer'],
        rows: [
          ['1', 'BLDC ceiling-fan maker replacing an imported motor controller', 'SKU-1', 'Not drop-in yet; on the Dec 2026 shuttle, samples after first silicon', 'Datasheet: pinout, supply range, drive features; sample date'],
          ['2', 'Smart-meter OEM bidding a utility tender under IS 16444', 'SKU-2', 'Not for current tenders; certification 12–18 months (est.)', 'Spec sheet; certification partner and date'],
          ['3', 'Defence integrator needing a MIL-screened supervisor', 'SKU-6', 'Intended part; screening funded by tranche 1; listing 18–36 months (est.)', 'Screening standard; when production moves to 180 nm'],
          ['4', 'Automotive tier-1 needing an ASIL-B body-controller MCU', 'SKU-4 (DG32-LITE)', 'Not on current evidence: no ECC, no safety or AEC-Q100 claim', 'Safety plan; ECC roadmap'],
          ['5', 'Drone maker sizing an obstacle-detection model', 'DG32-2DOM', 'INT8 attention engine exists pre-silicon; no measured throughput to give', 'Measured performance; a product commitment'],
          ['6', '"Your whitepaper says you already have orders"', '–', 'No purchase orders or letters of intent today; use the Blueprint', 'Re-issue of the whitepaper'],
        ],
      }},
      {h3: '1. "We make BLDC ceiling fans and import our motor controller. Can SKU-1 drop into our board, and when do we get samples?"'},
      {p: 'Not yet. SKU-1 is a design with RTL and analog schematics ready, going on the ChipFoundry December 2026 shuttle (SKU Blueprint, Oct 2026). The Blueprint costs a fan-cut version: 3 mm² die in QFN-24, $0.27–0.47 to make against a $0.50–1.50 price (estimates). Its 100 MHz clock is a design target. Samples follow first silicon; no source states a return date. Industrial customer qualification then takes 6–12 months (estimate).'},
      {lead: 'Fit with their implementation:', p: 'package is known (QFN-24); pinout, supply range, gate-drive and sensorless control support are not documented, because there is no SKU-1 datasheet.'},
      {h3: '2. "Will SKU-2 let us bid in the next utility tender under IS 16444?"'},
      {p: 'Not for current tenders. SKU-2 has no BIS certification yet; the Blueprint estimates BIS IS 16444 plus a utility tender at 12–18 months. Tranche 1 sets aside ₹1.0 Cr for first approvals, including meter certification work with a partner (SKU Blueprint, Oct 2026). The ₹250 Cr plan line and ₹175 Cr FY31 ramp are plan targets, not tender wins.'},
      {lead: 'Fit with their implementation:', p: 'metrology accuracy, analog front end and communication interfaces are not in any source.'},
      {h3: '3. "We need an Indian-made, MIL-screened voltage supervisor for a programme starting in 2028."'},
      {p: 'SKU-6 is the intended part, and tranche 1 funds its military screening (SKU Blueprint, Oct 2026). MIL screening plus approved-vendor listing takes 18–36 months from silicon (estimate), so a 2028 start is tight. SKU-6 is built at 130 nm first and 180 nm in production; the integrator should ask whether screened 130 nm parts carry over to 180 nm production. The price range of $0.20–50 reflects grade (estimate).'},
      {lead: 'Fit with their implementation:', p: 'the screening standard, temperature range and package are not named in any source.'},
      {h3: '4. "Can the DG32 lockstep MCU go into a body controller that needs ASIL-B?"'},
      {p: 'Not on current evidence. DG32-LITE has two rv32imc cores in lockstep, 32 KB SRAM without ECC, 64 KB boot ROM, an untrimmed 8-bit SAR ADC, QFN-64 (9×9 mm), 1.8 V core and 3.3 V I/O (preliminary datasheet, 12 Sep 2026). The datasheet specifies 50 MHz; post-route timing closes at 55–62 MHz, pre-silicon; the Blueprint lists 100 MHz as a design target (Oct 2026). No source claims functional safety or AEC-Q100, and AEC-Q100 plus design-in takes 18–36 months (estimate). The Blueprint itself expects only ₹4 Cr from SKU-4 in FY31.'},
      {lead: 'Fit with their implementation:', p: 'package, supply and memory are documented; SRAM without ECC is the gap for ASIL work.'},
      {h3: '5. "Can DG32-2DOM run our obstacle-detection model, and how fast?"'},
      {p: 'It has an INT8 attention engine on its own 114 MHz clock (preliminary datasheet, 12 Sep 2026), pre-silicon. Nothing has been measured on silicon, so there is no throughput figure to give; the DG32-2DOM system architecture document (24 pages, 12 Sep 2026) lets a team size the model. DG32-2DOM has no SKU number or plan line in the Blueprint, and the drone SoC D100 (28 nm, Track B) has no plan line either.'},
      {lead: 'Fit with their implementation:', p: 'same package and supply as DG32-LITE; performance is unknown until silicon.'},
      {h3: '6. "Your whitepaper says you already have orders. Can we see them?"'},
      {p: 'There are no purchase orders or letters of intent today. The master whitepaper v3 (5 Sep 2026) is superseded in part by the SKU Blueprint (Oct 2026); use the Blueprint.'},
      {h2: 'Four gaps to close before buyer conversations start'},
      {list: [
        {lead: 'Preliminary datasheets for SKU-1, SKU-2 and SKU-6.', text: 'Package, pinout, supply range and temperature grade are what an engineering lead checks first, and these three chips carry ₹610 Cr of plan lines (SKU Blueprint, Oct 2026).'},
        {lead: 'A sample date.', text: 'Published only once ChipFoundry confirms when December 2026 shuttle silicon returns; until then, "after first silicon".'},
        {lead: 'A safety position for SKU-4.', text: 'State whether ECC and an AEC-Q100 plan are coming, or say plainly that SKU-4 is not aimed at ASIL work yet.'},
        {lead: 'The whitepaper.', text: 'Buyers will meet its superseded figures while the whitepaper v3 stays published; re-issuing it is an open owner question.'},
      ], ordered: true},
    ],
  },
];
