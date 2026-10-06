// Cross-references, declared once per route.
//
// Before this file every page ended in a hand-written list of links, so the set drifted: the home
// page linked to nothing at all, /products reached two routes, and no page outside /resources and
// /ask linked to a single source document even though the site ships nine of them. A reader who
// wanted the document behind a figure had to go and look for it.
//
// Two rules hold here, and scripts/check-crossrefs.mjs enforces both:
//   1. Every route declares at least two sibling sections and, where one exists, the document that
//      backs its claims. A route with nothing to point at is a route that has not been finished.
//   2. `why` says what the reader gets by following the link, in the reader's terms. "Learn more"
//      and "Read the documentation" are not reasons; "the cycle budget those tasks are spending" is.
import type {RouteId} from './routes';

export type DocId = 'doc1' | 'doc2' | 'doc3' | 'doc4' | 'doc5' | 'doc6' | 'doc7';
export type SectionRef = {id: RouteId; why: string; query?: string};
export type Related = {sections: SectionRef[]; docs: DocId[]};

export const related: Record<RouteId, Related> = {
  home: {
    sections: [
      {id: 'products', why: 'Explore the silicon portfolio, then inspect DG32-LITE and DG32-2DOM in detail.'},
      {id: 'technology', why: 'How the lockstep pair, the control loop and the attention engine actually work.'},
      {id: 'evidence', why: 'Where every figure on this site comes from, and which claims were withdrawn.'},
      {id: 'procurement', why: 'Compare design requirements with the incumbent, including its practical advantages.'},
    ],
    docs: ['doc7', 'doc5', 'doc2'],
  },
  sku1: {
    sections: [
      {id: 'sku4', why: 'The safety MCU that supervises this drive and can shut it down.'},
      {id: 'uc-motors', why: 'Where the motor controller sits in a drive, beside its safety supervisor.'},
      {id: 'control', why: 'How DG32 budgets a hardware control loop, cycle by cycle.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  sku2: {
    sections: [
      {id: 'uc-grid', why: 'The meter it goes into, and what decides measurement quality.'},
      {id: 'sku5', why: 'The RS-485 transceiver on the wired meter bus.'},
      {id: 'sku6', why: 'The supervisor that catches a brownout before the record is lost.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  sku3: {
    sections: [
      {id: 'sku6', why: 'The supervisor that independently checks every rail this IC produces.'},
      {id: 'uc-defence', why: 'The avionics and vehicle platforms its 28 V bus comes from.'},
      {id: 'evidence', why: 'What an architecture sheet establishes, and what only silicon can.'},
    ],
    docs: ['doc7', 'doc2'],
  },
  sku4: {
    sections: [
      {id: 'safety', why: 'The fault path from a wrong value to a switched-off bridge, step by step.'},
      {id: 'control', why: 'The cycle budget of one current-control loop on DG32-LITE.'},
      {id: 'die', why: 'The six block groups on the die, and the one that is frozen.'},
      {id: 'package', why: 'The QFN-64 pinout a board designer works from.'},
    ],
    docs: ['doc7', 'doc2', 'doc6'],
  },
  sku5: {
    sections: [
      {id: 'sku9', why: 'The zonal gateway whose buses this transceiver drives.'},
      {id: 'uc-boards', why: 'The boards where an interface part sits at every node.'},
      {id: 'uc-vehicles', why: 'The vehicle buses that need CAN-FD at every node.'},
    ],
    docs: ['doc7', 'doc2'],
  },
  sku6: {
    sections: [
      {id: 'sku3', why: 'The power IC whose rails this supervisor cross-checks.'},
      {id: 'sku4', why: 'The safety MCU it holds in reset until the supplies are good.'},
      {id: 'uc-boards', why: 'The boards that need a predictable start below firmware.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  sku7: {
    sections: [
      {id: 'uc-vehicles', why: 'The truck mirror tower and braking systems the radar serves.'},
      {id: 'd100', why: 'The drone platform that uses radar for collision avoidance.'},
      {id: 'evidence', why: 'Why an RF front end is proven on silicon or not at all.'},
    ],
    docs: ['doc7', 'doc2'],
  },
  sku8: {
    sections: [
      {id: 'uc-defence', why: 'The rugged cockpit and vehicle displays it drives.'},
      {id: 'sku3', why: 'The power IC that supplies its display bias rails.'},
      {id: 'evidence', why: 'What a rugged-display target does and does not establish.'},
    ],
    docs: ['doc7', 'doc2'],
  },
  sku9: {
    sections: [
      {id: 'uc-vehicles', why: 'The zones of a software-defined vehicle, and what mature nodes own there.'},
      {id: 'sku5', why: 'The transceivers on its physical vehicle buses.'},
      {id: 'sku4', why: 'The lockstep pattern its safety island reuses.'},
    ],
    docs: ['doc7', 'doc2'],
  },
  sku10: {
    sections: [
      {id: 'sku4', why: 'The lockstep safety pattern its two cores build on.'},
      {id: 'sku11', why: 'The battery controller that reuses its whole platform.'},
      {id: 'uc-boards', why: 'The industrial, drone and gateway boards that need signed boot.'},
      {id: 'evidence', why: 'What feature-complete RTL does and does not establish before silicon.'},
    ],
    docs: ['doc7'],
  },
  sku11: {
    sections: [
      {id: 'sku10', why: 'The DG32-Max platform its processor and security come from.'},
      {id: 'sku6', why: 'The supervisor whose protection comparators it reuses.'},
      {id: 'uc-vehicles', why: 'The e-2W and e-3W packs it is first aimed at.'},
      {id: 'evidence', why: 'What a block specification establishes, and what it leaves to silicon and field data.'},
    ],
    docs: ['doc7'],
  },
  d100: {
    sections: [
      {id: 'uc-defence', why: 'The drone and avionics platforms D100 is scoped for.'},
      {id: 'sku1', why: 'The motor controller on its flight motors.'},
      {id: 'sku7', why: 'The radar that feeds its collision avoidance.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  read: {
    sections: [
      {id: 'resources', why: 'Every source document, with its PDF and the decision it supports.'},
      {id: 'evidence', why: 'How each figure in these documents is graded on the site.'},
      {id: 'ask', why: 'Search all the documents at once and get a cited answer.'},
    ],
    docs: [],
  },
  products: {
    sections: [
      {id: 'technology', why: 'The architecture behind both parts, one tab each.'},
      {id: 'package', why: 'The 44-signal QFN-64 pinout both chips share, pin for pin.'},
      {id: 'procurement', why: 'How DG32 compares with the STM32G0, gaps included.'},
      {id: 'applications', why: 'Where each of the twelve chips goes, and what DG32 watches in a motor.'},
    ],
    docs: ['doc7', 'doc6', 'doc2'],
  },
  technology: {
    sections: [
      {id: 'safety', why: 'The lockstep pair and the fault path, in detail.'},
      {id: 'control', why: 'Where the 300 hardware cycles go, and what is left over.'},
      {id: 'die', why: 'The six block groups on the die itself.'},
      {id: 'package', why: 'How the die reaches its 44 signal pads.'},
    ],
    docs: ['doc4', 'doc6', 'doc3'],
  },
  safety: {
    sections: [
      {id: 'control', why: 'The loop the fault path has to interrupt, cycle by cycle.'},
      {id: 'die', why: 'Where the safety core sits, and why it is the one frozen block.'},
      {id: 'evidence', why: 'The 39-cycle trip is simulated, not measured. This says what that means.'},
      {id: 'technology', why: 'The rest of the architecture the safety core is embedded in.'},
    ],
    docs: ['doc4'],
  },
  control: {
    sections: [
      {id: 'applications', why: 'The 30 diagnostic tasks that spend the headroom this page measures, and where the chip goes.'},
      {id: 'safety', why: 'What happens to the loop when the two cores disagree.'},
      {id: 'die', why: 'The CORDIC and ADC blocks the loop runs through.'},
      {id: 'evidence', why: 'How the cycle counts were derived, and at which evidence grade.'},
    ],
    docs: ['doc1', 'doc4'],
  },
  die: {
    sections: [
      {id: 'package', why: 'How the die is bonded out to the QFN-64.'},
      {id: 'safety', why: 'Why the safety core is frozen until first-silicon test.'},
      {id: 'technology', why: 'The block-by-block architecture behind the 3D model.'},
      {id: 'products', why: 'Which of the two chips each die belongs to.'},
    ],
    docs: ['doc4', 'doc6'],
  },
  package: {
    sections: [
      {id: 'die', why: 'The die behind the pad ring, group by group.'},
      {id: 'products', why: 'Why a DG32-LITE board takes DG32-2DOM without a layout change.'},
      {id: 'technology', why: 'The architecture the pinout serves.'},
      {id: 'procurement', why: 'Package and footprint against the incumbent.'},
    ],
    docs: ['doc6', 'doc3'],
  },
  applications: {
    sections: [
      {id: 'control', why: 'The cycle budget every task on this page is spending.'},
      {id: 'evidence', why: 'What each chip on this page rests on, from FPGA prototype to first silicon.'},
      {id: 'products', why: 'The two DG32 parts in detail, and the portfolio table they sit in.'},
      {id: 'company', why: 'What each chip line is planned to earn, labelled as plan targets, not results.'},
      {id: 'ask', why: 'Put a specific task to the knowledge graph and get a cited answer.'},
    ],
    docs: ['doc7', 'doc1', 'doc2'],
  },
  evidence: {
    sections: [
      {id: 'procurement', why: 'Where the design still loses to the incumbent, stated plainly.'},
      {id: 'control', why: 'The largest analytic claim on the site, with its derivation.'},
      {id: 'safety', why: 'The simulated fault path, and what simulation does and does not show.'},
      {id: 'applications', why: 'The twelve chips this page grades, by the systems they go into.'},
    ],
    docs: ['doc1', 'doc4', 'doc6'],
  },
  procurement: {
    sections: [
      {id: 'evidence', why: 'The grade behind every DG32 figure in the comparison.'},
      {id: 'products', why: 'The parts being procured, and which fits which drive.'},
      {id: 'package', why: 'Footprint, pinout and supply sequencing for a board team.'},
      {id: 'company', why: 'The roadmap, the funding behind it and the stop rules.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  'uc-motors': {
    sections: [
      {id: 'applications', why: 'Every chip by application, with filters and a side-by-side comparison.'},
      {id: 'evidence', why: 'How each chip here is evidenced today, graded the same way across the portfolio.'},
      {id: 'contact', why: 'What to tell us about your application so we can answer.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  'uc-vehicles': {
    sections: [
      {id: 'applications', why: 'Every chip by application, with filters and a side-by-side comparison.'},
      {id: 'evidence', why: 'How each chip here is evidenced today, graded the same way across the portfolio.'},
      {id: 'contact', why: 'What to tell us about your application so we can answer.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  'uc-defence': {
    sections: [
      {id: 'applications', why: 'Every chip by application, with filters and a side-by-side comparison.'},
      {id: 'evidence', why: 'How each chip here is evidenced today, graded the same way across the portfolio.'},
      {id: 'contact', why: 'What to tell us about your application so we can answer.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  'uc-grid': {
    sections: [
      {id: 'applications', why: 'Every chip by application, with filters and a side-by-side comparison.'},
      {id: 'evidence', why: 'How each chip here is evidenced today, graded the same way across the portfolio.'},
      {id: 'contact', why: 'What to tell us about your application so we can answer.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  'uc-boards': {
    sections: [
      {id: 'applications', why: 'Every chip by application, with filters and a side-by-side comparison.'},
      {id: 'evidence', why: 'How each chip here is evidenced today, graded the same way across the portfolio.'},
      {id: 'contact', why: 'What to tell us about your application so we can answer.'},
    ],
    docs: ['doc7', 'doc2', 'doc5'],
  },
  docs: {
    sections: [
      {id: 'resources', why: 'The same documents as readable specifications, with the decks and films made from them.'},
      {id: 'evidence', why: 'How each figure in these documents was obtained, and which are not yet measured.'},
      {id: 'ask', why: 'Query the documents instead of reading them end to end.'},
    ],
    docs: ['doc6', 'doc4'],
  },
  about: {
    sections: [
      {id: 'team', why: 'The founders, board, engineering organisation and the partners contracted for the silicon.'},
      {id: 'recognition', why: 'The awards and the milestones behind them.'},
      {id: 'company', why: 'Why DG32 fits a market that is obliged to buy domestic.'},
    ],
    docs: ['doc5'],
  },
  team: {
    sections: [
      {id: 'about', why: 'What the company is for, in its own words.'},
      {id: 'contact', why: 'Where an enquiry lands, and what to tell us.'},
    ],
    docs: ['doc5'],
  },
  recognition: {
    sections: [
      {id: 'about', why: 'The company behind the awards.'},
      {id: 'evidence', why: 'How the DG32 figures themselves are evidenced.'},
    ],
    docs: ['doc5'],
  },
  videos: {
    sections: [
      {id: 'die', why: 'The six functional groups the die tour walks across, with what each one does.'},
      {id: 'package', why: 'Where the die sits in the 9 × 9 mm package, pin by pin.'},
      {id: 'resources', why: 'The datasheets and architecture documents the videos are drawn from.'},
    ],
    docs: ['doc6', 'doc4'],
  },
  resources: {
    sections: [
      {id: 'ask', why: 'Query the same documents instead of reading them end to end.'},
      {id: 'technology', why: 'The architecture the decks and films walk through.'},
      {id: 'evidence', why: 'How the figures in these documents are graded.'},
      {id: 'products', why: 'Which document belongs to which chip.'},
    ],
    docs: ['doc7', 'doc5', 'doc2', 'doc1'],
  },
  ask: {
    sections: [
      {id: 'resources', why: 'The documents behind every answer, in full.'},
      {id: 'evidence', why: 'What each evidence grade in an answer actually means.'},
      {id: 'technology', why: 'The architecture most questions are about.'},
      {id: 'applications', why: 'The portfolio and the DG32 diagnostic tasks, to ask about by name.'},
    ],
    docs: ['doc7', 'doc1', 'doc2', 'doc4'],
  },
  company: {
    sections: [
      {id: 'applications', why: 'Where each chip in the revenue plan goes, and what it rests on today.'},
      {id: 'procurement', why: 'The competitive position behind the revenue plan.'},
      {id: 'evidence', why: 'Every figure on this site, graded, including the withdrawn ones.'},
      {id: 'resources', why: 'The whitepaper the plan and the stress test come from.'},
      {id: 'contact', why: 'Start an evaluation, or ask for the data room.'},
    ],
    docs: ['doc7', 'doc5', 'doc2'],
  },
  contact: {
    sections: [
      {id: 'company', why: 'Who you would be talking to, and the plan they are working to.'},
      {id: 'products', why: 'Which variant to name in your enquiry.'},
      {id: 'resources', why: 'Datasheets and decks to read before the call.'},
      {id: 'ask', why: 'Answer a technical question now, without waiting for a reply.'},
    ],
    docs: ['doc6', 'doc5'],
  },
};
