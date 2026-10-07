/** Executive narrative content for Ask DeepGrid.
 *
 *  Built with the story-architect contract (runs/deepgrid-v12-story-rebuild/story-pack.md):
 *  every answer reads headline → short answer → why it matters now → what DeepGrid brings →
 *  where the value is → what is proven and what is not yet → the trade-off → recommendation.
 *
 *  Content rules: only figures carried by `app/claims.ts` or the SKU Blueprint profiles in
 *  `app/executive-products.json`; nothing from `withheld`; no implementation vocabulary in
 *  visible text. Evidence kinds are stated in plain words (designed, simulated, estimated,
 *  measured, qualified). */

export type Story = {
  /** The answer as an assertion a CEO could repeat. */
  headline: string;
  /** 2–4 sentences: business answer, context, maturity stance. */
  short: string;
  whyNow: string;
  brings: string;
  value: string;
  proven: string;
  notYet: string;
  tradeoff: string;
  recommendation: string;
};

const PRE_SILICON =
  'Like every DeepGrid product, it is at the design stage: nothing has yet been measured on manufactured silicon, and no qualification has been completed.';

export const productStories: Record<string, Story> = {
  sku1: {
    headline: 'SKU-1 is a bet on simpler motor drives — worth evaluating where part count and sourcing are the pain.',
    short:
      'Most motor drives use a separate controller and gate driver. SKU-1 proposes to combine those roles in one part for motors, appliances and actuators, which can shorten the bill of materials and the supplier list. The benefit only becomes real if the complete drive — not just the chip — performs in your operating environment.',
    whyNow:
      'Motor drives are multiplying across appliances, industrial equipment and vehicles, and each additional part is another sourcing dependency and another failure point. Equipment makers that simplify the drive now get a cost and supply advantage that compounds across every product line.',
    brings:
      'One mature-node device that takes over the control and gate-drive roles, built on the same 130 nm technology DeepGrid selected because it tolerates high-voltage transients and wide temperature ranges.',
    value:
      'The commercial test is simple: does integration reduce the complexity, cost and supplier exposure of your drive without giving up response or robustness? If it does, the saving repeats on every unit you ship.',
    proven: `The architecture and its intended role are defined in the SKU Blueprint (October 2026). ${PRE_SILICON}`,
    notYet:
      'The complete power stage has not been validated. Switching behaviour, thermal performance and robustness under real loads all remain to be demonstrated.',
    tradeoff:
      'Integration lowers part count but concentrates risk in one device and one supplier. Staying with discrete parts keeps today’s known behaviour but also keeps today’s cost and sourcing exposure.',
    recommendation:
      'Pick one drive where part count or supply is a genuine problem, define the operating envelope and required response, and evaluate SKU-1 against it. Treat any component reduction as a production benefit only after the full power stage is validated.',
  },
  sku2: {
    headline: 'SKU-2 puts billing accuracy and tamper evidence in one meter chip — it wins only if it clears the utility tender.',
    short:
      'SKU-2 brings energy measurement, meter control and outage records together for utilities and meter makers. In metering, the buyer is the tender specification: accuracy, tamper resistance and service behaviour decide the business, not the chip’s feature list.',
    whyNow:
      'Large smart-meter programmes reward suppliers who can meet accuracy and tamper requirements at scale with a dependable domestic supply. Revenue leakage from tampering and disputed bills is a direct cost to utilities.',
    brings:
      'A single device that measures energy, runs the meter and records outages and tampering, so the meter maker designs around fewer parts.',
    value:
      'The value is measured in tenders won and revenue protected: a meter that proves its accuracy and records tampering reliably is easier to certify and harder to defraud.',
    proven: `The functional scope is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'Measurement accuracy and outage behaviour need measured evidence before any utility deployment.',
    tradeoff:
      'An integrated meter chip simplifies the design but ties the meter maker to one device through a long certification cycle. A change of supplier later is expensive.',
    recommendation:
      'Map SKU-2 against one specific tender’s accuracy, tamper and service clauses and agree the measured evidence required. Commit only once accuracy has been demonstrated on hardware.',
  },
  sku3: {
    headline: 'SKU-3 targets a domestic option for high-reliability power supplies — the grade you need decides whether it fits.',
    short:
      'SKU-3 targets the power supplies used in military, railway and space equipment, where qualification is part of the buying decision. A general power-management claim is not enough: the required grade and equipment programme come first.',
    whyNow:
      'Programmes in defence, rail and space increasingly favour qualified domestic sources, and long equipment lifetimes make supply continuity a strategic issue rather than a procurement detail.',
    brings:
      'A power-supply architecture on 130 nm, chosen because it can tolerate 28–120 V transients and −55 to +125 °C — conditions leading-edge processes cannot survive.',
    value:
      'For the right programme, a domestic, grade-appropriate power part reduces import dependency across a decades-long equipment life.',
    proven: `The architecture and the reasons for the process choice are documented; the temperature and voltage figures are process nominals, not measurements. ${PRE_SILICON}`,
    notYet:
      'Every environmental and screening requirement must be demonstrated for the intended grade.',
    tradeoff:
      'Qualifying a new source takes time and test budget; the payoff is supply security over the programme’s life. Staying with an imported part avoids the qualification effort but keeps the dependency.',
    recommendation:
      'Name the grade and the equipment programme, list its screening requirements, and use those to scope a qualification-oriented evaluation.',
  },
  sku4: {
    headline: 'SKU-4 (DG32-LITE) is DeepGrid’s proof point: control that is designed to fail safely — evaluate it now, certify later.',
    short:
      'SKU-4 uses two processors in lockstep to catch disagreement and trigger a hardware fault response, so a control failure does not become an uncontrolled machine. It is the most fully documented DeepGrid design and the one that shows how the team works. It is designed toward ISO 26262 ASIL-D — a target, not a certificate held.',
    whyNow:
      'Motors, vehicles and industrial machines are increasingly software-controlled, and a silent control fault is a safety and liability event. Buyers need a safe-stop path that does not depend on the software that may have failed.',
    brings:
      'A safety microcontroller whose fault path runs in hardware: in simulation, an injected fault reaches the fault output and disables the motor bridge in 39 clock cycles, with no firmware involved. Control work runs in dedicated hardware, leaving headroom for diagnostics.',
    value:
      'The business requirement is the machine reaching its safe state. A hardware-enforced path simplifies the safety case and leaves capacity for condition monitoring that can reduce service cost.',
    proven:
      'The evidence is specific and labelled: the 39-cycle fault path is simulated; the 55–62 MHz speed of the lockstep core comes from the completed physical layout and sets the 50 MHz clock; about 0.43 W is a design-tool estimate; 82% diagnostic headroom is an analytical figure. All of it is pre-silicon.',
    notYet:
      'No measurement on manufactured silicon, no product certification and no system-level safety case yet. Simulated fault detection does not establish either.',
    tradeoff:
      'Starting now lets your team shape the evaluation and gain early position; the cost is working with design evidence rather than measured parts. Waiting gives measured data but less influence and a later start.',
    recommendation:
      'Run a bounded evaluation of the complete response — from detecting a failure to the machine reaching its safe state — against your own safety requirements. Make missing analog or memory features explicit dependencies, and agree which milestone (returned silicon, characterisation, certification) gates each commitment.',
  },
  sku5: {
    headline: 'SKU-5 keeps equipment connected when interface parts become a sourcing risk — compatibility decides the opportunity.',
    short:
      'SKU-5 targets the wired interfaces used across industrial and vehicle equipment, combining bus functions on one part. The opportunity is replacement: it matters where installed equipment depends on interface parts that are hard to source.',
    whyNow:
      'Interface transceivers are low-cost but high-consequence: when one is unavailable, an entire product line can stop shipping. That makes a compatible second source a business-continuity issue.',
    brings:
      'One device combining several wired-bus functions, designed for the electrical environment of industrial and vehicle equipment.',
    value:
      'Value comes from drop-in compatibility with what is already installed — fewer redesigns, protected production schedules, and volume across many boards.',
    proven: `The scope is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'Electrical protection, wiring limits and interchangeability with incumbent parts still require validation.',
    tradeoff:
      'Combining functions saves board space but may not be pin- or behaviour-identical to the parts you replace; any difference becomes redesign effort.',
    recommendation:
      'Start from your installed equipment: list the interface parts at risk and their replacement requirements, then evaluate SKU-5 for interchangeability first.',
  },
  sku6: {
    headline: 'SKU-6 protects equipment when its power behaves unexpectedly — its value depends on how your system should respond.',
    short:
      'SKU-6 watches supply conditions and records a fault so the wider system can respond. It is a function needed on almost every board, which is where the volume is.',
    whyNow:
      'Unexpected power disturbances cause field failures that are expensive to diagnose. A supervisor that records what happened turns unexplained returns into actionable data.',
    brings:
      'A supply supervisor that detects abnormal conditions and leaves a fault record for the system to act on.',
    value:
      'Fewer unexplained field failures and faster root-cause analysis — and, because the function sits on nearly every board, a broad volume opportunity.',
    proven: `The function is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'The response must be tested against real supply noise and the intended screening requirements.',
    tradeoff:
      'A sensitive supervisor protects equipment but can trigger on harmless noise; a tolerant one avoids nuisance stops but may miss real faults. That balance is a system decision, not a chip feature.',
    recommendation:
      'Define which power disturbances should stop your system and which should be tolerated, then test SKU-6 on your board against that policy.',
  },
  sku7: {
    headline: 'SKU-7 turns radar sensing into usable range and motion information — start from the detection task, not the spec sheet.',
    short:
      'SKU-7 separates radio-frequency sensing from digital processing, targeting radar functions for vehicles and other platforms. Radar value is decided by the scene: what must be detected, at what range, in what conditions.',
    whyNow:
      'Radar is spreading from premium vehicles into commercial vehicles, industrial safety and drones, and domestic sensing capability is becoming a strategic requirement.',
    brings:
      'A radar architecture that splits the sensing front end from the processing, so each can be matched to the platform.',
    value:
      'The value is reliable detection in your operating scene — fewer missed objects and false alarms — which is what customers and regulators actually judge.',
    proven: `The architecture is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'The radio and processing combination must be proven together in the intended scene.',
    tradeoff:
      'Separating sensing and processing adds flexibility but adds an integration step; an all-in-one radar is simpler to adopt but harder to tailor.',
    recommendation:
      'Write down the detection task, environment and required range first; use those to decide whether SKU-7’s architecture fits before any technical evaluation.',
  },
  sku8: {
    headline: 'SKU-8 makes a rugged display trustworthy — including telling the operator when the image has frozen.',
    short:
      'SKU-8 targets rugged displays, combining panel-driving functions with detection of a frozen image. For an operator, a display that silently freezes is worse than one that fails visibly.',
    whyNow:
      'Vehicles, defence systems and industrial machines rely on displays for safety-relevant information; regulators and customers increasingly expect failure indication, not just brightness and resolution.',
    brings:
      'Display-driving functions plus a built-in check that the image is still live.',
    value:
      'Operator trust and safety: readable in harsh conditions, and honest when it fails.',
    proven: `The function is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'Panel compatibility, environmental performance and fault indication need system tests.',
    tradeoff:
      'Built-in failure detection adds value only if your panel and operating conditions are supported; otherwise you inherit an integration burden.',
    recommendation:
      'Evaluate readability and failure indication as part of the operator’s task, with your panel, in your environment.',
  },
  sku9: {
    headline: 'SKU-9 brings vehicle power and networking closer to the loads they serve — but consolidation must not dilute vehicle safety.',
    short:
      'SKU-9 combines network and power-distribution functions within a vehicle zone; the central vehicle computer remains separate. Zonal design reduces wiring, but every responsibility it absorbs must still be met.',
    whyNow:
      'Vehicle makers are moving to zonal architectures to cut wiring weight, cost and assembly time. The suppliers who fit that transition early become designed-in for a vehicle generation.',
    brings:
      'A zone device that handles local power distribution and networking for the loads in its part of the vehicle.',
    value:
      'Less wiring, simpler assembly and a cleaner path to software-defined vehicles — if timing, protection and failure isolation hold.',
    proven: `The scope is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'Network timing, power protection and the vehicle safety case remain adoption gates.',
    tradeoff:
      'Consolidation saves wiring but means one device failure can affect several loads; isolation design becomes critical.',
    recommendation:
      'Choose one specific zone, list its loads, network traffic and failure-isolation needs, and evaluate consolidation against that zone only.',
  },
  sku10: {
    headline: 'DG32-Max combines secure control and trusted start-up in one part — it needs a customer design win to matter.',
    short:
      'DG32-Max targets imported secure microcontrollers and the separate security chip often used to check firmware before it runs. Combining them could simplify secure control for industrial, drone and EV equipment.',
    whyNow:
      'Connected equipment faces rising security expectations, and many makers rely on imported secure parts plus a second security chip — two dependencies for one job.',
    brings:
      'One device that provides control and checks firmware integrity at start-up.',
    value:
      'Simpler secure control with fewer imported parts — provided customer security requirements can be met.',
    proven: `The design status is documented. ${PRE_SILICON} A completed design is not qualified production.`,
    notYet:
      'Customer design wins and validation remain essential.',
    tradeoff:
      'Merging control and security reduces parts but means the security function must satisfy each customer’s scheme; a separate security chip is more flexible but costs more.',
    recommendation:
      'Identify a lead customer whose security requirements can be written down, and use that design-win opportunity to scope validation.',
  },
  sku11: {
    headline: 'SKU-11 combines battery intelligence with protection that stays independent of software — its success depends on partners and data.',
    short:
      'SKU-11 brings control, battery-health estimation and authentication together, while the cell-measuring and isolation components remain external. The adoption decision depends on the measurement partner and battery data as much as on the controller.',
    whyNow:
      'Electric vehicles and energy storage need trustworthy battery-health information and protection that cannot be overridden by faulty software; battery safety incidents carry heavy reputational cost.',
    brings:
      'A battery controller that estimates health, authenticates packs and keeps protection independent of software.',
    value:
      'Better battery-health insight and safer packs — if the measurement chain and field data are in place.',
    proven: `The architecture is defined in the SKU Blueprint. ${PRE_SILICON}`,
    notYet:
      'The Blueprint leaves the measurement partner and field dataset as key dependencies, and no manufacturing run is yet assigned.',
    tradeoff:
      'Relying on external measurement parts keeps the controller focused but makes the solution dependent on a partner not yet selected.',
    recommendation:
      'Treat partner selection and field data as the first milestones; evaluate SKU-11 once those are named.',
  },
  d100: {
    headline: 'D100 is a separate growth investment that follows the mature-node business — not part of today’s revenue plan.',
    short:
      'D100 proposes an Indian flight-control and navigation chip with a failsafe that remains separate from higher-level computing. The October 2026 Blueprint places it outside the FY31 ₹1,000 Cr portfolio plan and proposes a separate ₹50 Cr round once the mature-node products generate revenue.',
    whyNow:
      'Drone and avionics programmes want domestic flight-control silicon with a software-independent failsafe, but this is a harder, costlier development than the mature-node portfolio.',
    brings:
      'A flight-control and navigation chip whose failsafe does not depend on the higher-level computer.',
    value:
      'A strategic position in domestic drone and avionics silicon — a growth option, sequenced after the core business is earning.',
    proven:
      'The concept and its place in the plan are documented. It has not been designed to the depth of DG32, and nothing is measured on silicon.',
    notYet:
      'The advanced-process development cost and the aviation qualification path remain major delivery gates.',
    tradeoff:
      'Funding D100 early would accelerate a strategic option but divert capital from the revenue-generating portfolio; sequencing it later protects the core plan.',
    recommendation:
      'Review D100 as a separate investment decision with its own funding trigger, development milestones and qualification plan.',
  },
};

/** Cross-cutting questions that are not about one product. */
export const topicStories: { test: RegExp; story: Story }[] = [
  {
    test: /certif|qualif|asil|iso ?26262|approved|guarantee|compliant|immune/i,
    story: {
      headline: 'No DeepGrid product is certified or qualified yet — treat qualification as an adoption gate, not a feature.',
      short:
        'DeepGrid designs toward recognised targets — the safety microcontroller is designed against ISO 26262 ASIL-D — but a design target is not a certificate held. All published evidence is pre-silicon.',
      whyNow:
        'Buyers in vehicles, defence and industrial safety cannot ship without qualification, so knowing exactly where each product stands avoids committing a programme to an assumption.',
      brings:
        'Safety mechanisms designed into hardware, and evidence that is labelled by kind so you can see what each number is.',
      value:
        'Clear labelling lets your team plan qualification work and budget from day one instead of discovering gaps late.',
      proven:
        'Design-stage evidence only: simulated fault behaviour, completed physical layout timing, design-tool estimates.',
      notYet:
        'Measurement on manufactured silicon, characterisation, product certification and system-level safety cases.',
      tradeoff:
        'Engaging before qualification gives influence and lead time; waiting for qualified parts gives certainty but a later start.',
      recommendation:
        'Confirm the exact standard and grade you need, request the current evidence for it, and tie each commitment to a named qualification milestone.',
    },
  },
  {
    test: /fund|financ|invest|budget|revenue|round|valuation|fy ?31|crore|\bcr\b/i,
    story: {
      headline: 'The plan is staged: mature-node revenue first, D100 as a separately funded growth bet.',
      short:
        'The October 2026 SKU Blueprint sets a FY31 ₹1,000 Cr portfolio plan built on the mature-node products. D100 sits outside that plan, with a proposed separate ₹50 Cr round after the mature-node products generate revenue.',
      whyNow:
        'Investors and partners need to see that capital is sequenced against demonstrated milestones, not spread across every opportunity at once.',
      brings:
        'A portfolio of eleven core architectures on 130 nm, with DG32 as the detailed design proof point.',
      value:
        'Mature-node products need less capital per product than leading-edge chips and address large, recurring sockets.',
      proven:
        'The plan and the DG32 design evidence are documented; the revenue figures are plans, not results.',
      notYet:
        'Manufactured silicon, customer design wins and revenue are all still ahead.',
      tradeoff:
        'Staging protects capital but means the growth option (D100) waits; accelerating it would raise risk on the core plan.',
      recommendation:
        'Judge the plan on its milestone gates — first silicon, first design wins, first revenue — and fund each stage against the previous one being met.',
    },
  },
  {
    test: /ready|readiness|status|when|timeline|mature|silicon yet|tape|shuttle|available/i,
    story: {
      headline: 'DeepGrid is at the design stage: the evidence is specific, but nothing is measured on silicon yet.',
      short:
        'DG32 is the most advanced design, with simulated fault behaviour and completed physical-layout timing. The planned design-to-shuttle loop is 198 days on the foundry calendar — an analytical plan, not an achieved result.',
      whyNow:
        'Your own programme timing depends on when measured parts exist; planning around design evidence as if it were measured would put your schedule at risk.',
      brings:
        'A defined design you can evaluate today, and clear labelling of what each figure is.',
      value:
        'Early engagement lets your requirements shape the first evaluation and gives you lead time over competitors who wait.',
      proven: 'Design-stage evidence for DG32; architecture definitions for the rest of the portfolio.',
      notYet: 'Returned silicon, characterisation, qualification and production supply.',
      tradeoff:
        'Starting now means working with design evidence; waiting means certainty later but less influence.',
      recommendation:
        'Start a bounded evaluation of the defined design now, and agree which milestone must be reached before each further commitment.',
    },
  },
  {
    test: /why india|domestic|sovereign|import|supply|sourcing|130 ?nm|mature[- ]node|node/i,
    story: {
      headline: 'Mature-node silicon is the right tool for the physical jobs around the main computer — and a domestic source reduces supply risk.',
      short:
        'Power, sensing, interfaces and safety need tolerance of 28–120 V transients and −55 to +125 °C — conditions sub-10 nm processes cannot survive. DeepGrid chose 130 nm for exactly that reason, and targets functions where equipment makers today depend on imported parts.',
      whyNow:
        'Supply shocks have shown that the cheapest parts on a board can halt production; equipment makers want a second, domestic source for the functions that matter.',
      brings:
        'A portfolio of eleven core architectures matched to named jobs — motion, power, sensing, interfaces, safety.',
      value:
        'Reduced single-source exposure and parts designed for harsh physical environments.',
      proven:
        'The process choice and its rationale are documented; temperature and voltage figures are process nominals.',
      notYet: 'Manufactured silicon and supply at production volume.',
      tradeoff:
        'A new domestic source adds evaluation and qualification effort; staying with imports keeps the dependency.',
      recommendation:
        'Identify the sockets on your boards with the highest sourcing risk and evaluate the matching DeepGrid architecture first.',
    },
  },
  {
    test: /portfolio|products|what (do|does) (you|deepgrid)|offer|overview|strategy|business|opportunit/i,
    story: {
      headline: 'DeepGrid builds the silicon around the main computer — eleven architectures plus D100, with DG32 as the proof.',
      short:
        'The portfolio covers motion, power, sensing, interfaces and safety: eleven core SKU architectures plus D100. That is architecture breadth, not twelve shipping products. DG32 (SKU-4) is documented in depth to show how the team designs.',
      whyNow:
        'The functions around the main computer are where equipment depends on imported parts and where failures have physical consequences.',
      brings:
        'Mature-node architectures matched to specific jobs, and a detailed, labelled proof point in DG32.',
      value:
        'For equipment makers: a path to fewer imported dependencies and safer control. For investors: a staged plan toward a FY31 ₹1,000 Cr portfolio.',
      proven: 'DG32 design evidence (pre-silicon); architecture definitions for the rest.',
      notYet: 'Manufactured silicon, qualification and customer design wins.',
      tradeoff:
        'Breadth signals a credible roadmap but each product needs its own development and qualification; focus is decided by customer pull.',
      recommendation:
        'Find the job that matters most to you in the portfolio, then scope an evaluation against your own acceptance criteria.',
    },
  },
];

export const comparisonClose = {
  howToChoose:
    'These products do different jobs. Start from the responsibility your product needs covered, then compare the evidence each candidate must produce before adoption. Shared technology does not make them interchangeable.',
  recommendation:
    'Agree the required function, interfaces and acceptance evidence for each candidate, and evaluate them separately against your own requirements.',
};
