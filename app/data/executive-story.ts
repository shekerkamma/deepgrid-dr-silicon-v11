/** Executive narrative content for Ask DeepGrid.
 *
 *  Built with the story-architect contract (skills/story-architect/SKILL.md):
 *  every answer provides:
 *  - BLUF: Crisp executive takeaway directly answering the query
 *  - Audience Decision & Tension: The sourcing, regulatory, and system stakes
 *  - Argument Arc: Context -> Tension -> Proof -> Implication -> Action
 *  - Assertion-led Beats: Active executive titles (never generic meta-labels)
 *    and multi-sentence evidence-synthesized prose.
 *
 *  Content rules: only figures carried by `app/claims.ts` or the SKU Blueprint profiles in
 *  `public/downloads/docs/deepgrid-sku-blueprint-oct2026.md`; strictly exclude withheld claims
 *  (no MCEME contract, no 39.3 TOPS FPGA derivation, no Mobileye comparison); no retrieval
 *  mechanics or internal jargon in visible prose.
 */

export type Story = {
  /** The answer as an assertion an executive or lead engineer could repeat. */
  headline: string;
  /** 2–4 sentences: business answer, technical context, maturity stance. */
  short: string;
  /** Sourcing and market tension. */
  whyNow: string;
  /** What DeepGrid integrates on-die and how the hardware executes the function. */
  brings: string;
  /** Commercial economics, addressable market, plan line, and unit payback. */
  value: string;
  /** Documented and simulated proof points. */
  proven: string;
  /** Unmeasured parameters, qualification hurdles, and open dependencies. */
  notYet: string;
  /** System engineering and procurement trade-offs. */
  tradeoff: string;
  /** Actionable next step and bounded evaluation gate. */
  recommendation: string;
  /** Specific replacement narrative when query asks what the part replaces. */
  replacement?: {
    headline: string;
    short: string;
  };
  /** Assertion-led beat titles for the product story arc. */
  beatTitles?: {
    whyNow: string;
    brings: string;
    value: string;
    proven: string;
    tradeoff: string;
    recommendation: string;
  };
};

const PRE_SILICON =
  'Like every DeepGrid product, it is at the design stage: nothing has yet been measured on manufactured silicon, and no qualification has been completed.';

export const productStories: Record<string, Story> = {
  sku1: {
    headline: 'SKU-1 integrates motor control and gate drive on 130 nm BCD — collapsing multi-chip discrete drives into one die.',
    short:
      'Most brushless DC motor drives today require a separate microcontroller paired with an external high-voltage gate driver (such as a TI DRV83xx). SKU-1 proposes to combine both roles onto a single 130 nm die, supporting motor supplies up to 120 V (with external switches above 20 V) and sub-microsecond control loops for appliances, industrial equipment, drones, and electric vehicles. The integration delivers genuine BOM and supplier savings, provided the complete power stage is validated in your operating environment.',
    whyNow:
      'Brushless DC drives are expanding rapidly across India’s 25M–78M annual controller market (₹337 Cr–₹2,719 Cr TAM), accelerated by BEE star ratings on ceiling fans, inverter appliances, and EV drivetrains. Every additional discrete component adds board area, trace parasitic inductance, and foreign procurement vulnerability.',
    brings:
      'A single mature-node device housing a DGridRiscV core with hardwired sub-microsecond speed and torque control, seven PWM outputs, on-die gate drive up to ~20 V rails, and runtime star/delta phase switching. SkyWater 130 nm BCD technology was selected because its thick dielectrics tolerate high-voltage motor transients that destroy fine-node silicon.',
    value:
      'The SKU Blueprint targets a ₹320 Cr annual plan line (26% mid-market share) across unit prices spanning $0.50 for fan cuts to $12 for robotics. Development cost (₹3.8–8.8 Cr) is recovered within 41K–118K units, with stripped fan cuts ramping after higher-margin industrial and EV drives establish volume.',
    proven: `The architecture, register map, and analog driver stages are defined and simulated in the SKU Blueprint (October 2026). Prototypes are scheduled for the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'High-current switching behavior, thermal dissipation under motor stall, and long-term transient survival under inductive kickback remain to be demonstrated on fabricated silicon.',
    tradeoff:
      'Consolidating the controller and gate driver cuts PCB footprint and eliminates multi-vendor dependencies, but concentrates thermal dissipation into a single package. Staying with discrete components keeps familiar vendor models but locks in higher BOM cost and supply chain exposure.',
    recommendation:
      'Select a high-volume appliance or industrial drive where component shortages are painful, specify your transient envelope and current response, and evaluate SKU-1’s simulated drive stage before gating volume production on shuttle silicon delivery.',
    replacement: {
      headline: 'SKU-1 replaces the separate gate-driver and motor-control MCU pair, collapsing DRV83xx-class drive electronics onto one die.',
      short:
        'SKU-1 directly displaces the ubiquitous two-chip motor drive set—such as a TI DRV83xx gate driver combined with a discrete motor-control MCU—as well as imported Chinese motor chips in appliances and ceiling fans. By integrating a sub-microsecond DGridRiscV hardware speed/torque control loop, seven PWM outputs, and gate drive for motor supplies up to 120 V (with external switches above 20 V) on 130 nm BCD, it cuts part count and supplier dependencies across six market sectors.',
    },
    beatTitles: {
      whyNow: 'Incumbent Friction: Multi-Chip Bills of Materials Across 25M–78M Drives',
      brings: 'Architectural Integration: Hardware FOC Loop with Direct Gate-Drive Output',
      value: 'Commercial Math: ₹320 Cr Plan Line at 26% Mid-Market Share',
      proven: 'Pre-Silicon Truth: Analog Simulated, Prototype on December Shuttle',
      tradeoff: 'Engineering Trade-Off: High Integration vs Component-Level Redundancy',
      recommendation: 'Executive Recommendation: Evaluate Bounded Drive Envelopes Before Production Commit',
    },
  },
  sku2: {
    headline: 'SKU-2 integrates metrology, MCU, and tamper memory — winning where utility tenders demand supply continuity.',
    short:
      'SKU-2 combines energy measurement, meter control, outage logging, and tamper evidence on a single die for electricity-board tenders and meter makers. By displacing multi-chip architectures from ST, Microchip, and Chinese suppliers, it addresses India’s RDSS mandate (20.33 crore meters sanctioned) with an indigenous, tender-compliant single-chip architecture.',
    whyNow:
      'India’s Revamped Distribution Sector Scheme (RDSS) sanctions 20.33 crore smart meters (with 5.73 crore installed as of mid-2026 and an extended deadline to March 2028). Meter manufacturers face strict utility tenders penalizing revenue leakage, tampering, and imported single-source dependencies across an addressable market of 16M–45M units annually (₹273 Cr–₹1,794 Cr TAM).',
    brings:
      'A single device integrating precision metrology analog front ends, application processing, and hardware tamper detection. It continuously records power outages and phase manipulation in tamper-proof registers, eliminating the inter-chip communication traces that fraudsters exploit in discrete designs.',
    value:
      'At an average selling price of $0.80–$10.00, winning 29% of the mid-market tender volume delivers DeepGrid’s ₹250 Cr annual revenue plan. Because utility tenders bind supply for 5–10 year deployment cycles, winning approved vendor status creates sticky, recurring volume with payback reached inside the first tender delivery.',
    proven: `Digital RTL and analog metrology circuits are simulated; prototypes take the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'Formal BIS IS 16444 meter certification with a partner meter manufacturer and utility lab metrology accuracy across temperature remain to be proven on manufactured hardware.',
    tradeoff:
      'An integrated metering SoC dramatically lowers assembly cost and board failures, but commits the meter manufacturer to a single silicon supplier through exhaustive NABL and utility laboratory qualification.',
    recommendation:
      'Review SKU-2’s documented metrology dynamic range against your target utility tender’s specific accuracy and anti-tamper clauses. Commit to production only after prototype shuttle silicon demonstrates Class 1.0/0.5 accuracy on physical test benches.',
    replacement: {
      headline: 'SKU-2 replaces discrete metrology and MCU chipsets, unifying smart meter measurement and tamper security.',
      short:
        'SKU-2 replaces separate energy metering ICs and external host microcontrollers from ST, Microchip, and Chinese vendors. Collapsing metrology, tamper detection, and outage logging onto one 130 nm SoC eliminates external bus snooping and lowers meter manufacturing costs under India’s RDSS deployment.',
    },
    beatTitles: {
      whyNow: 'Tender Mandate: Statutory Domestic Procurement Under RDSS',
      brings: 'Single-Die Architecture: Metrology, Tamper Logging & Outage Memory',
      value: 'Commercial Realism: ₹250 Cr Plan Line on 29% Tender Capture',
      proven: 'Pre-Silicon Status: Analog Simulated, BIS Certification Pathfinder in 2028',
      tradeoff: 'Certification Lock-in Trade-Off: Sticky Tender Volumes vs Multi-Year Approval Cycles',
      recommendation: 'Executive Recommendation: Map Specifications to BIS IS 16444 Clauses Today',
    },
  },
  sku3: {
    headline: 'SKU-3 provides sovereign power management for defence, rail, and space — where harsh transients destroy standard silicon.',
    short:
      'SKU-3 targets the demanding power supplies used in military electronics, railway signalling (such as the Kavach national safety system), and space applications. Built on 130 nm BCD to withstand 28–120 V transients and −55 to +125 °C operating extremes, it provides an indigenous alternative to imported parts from TI, ADI, and Renesas that face increasing export restrictions and obsolescence.',
    whyNow:
      'Strategic capital programs in defence, aerospace, and Indian Railways operate on 15–30 year lifecycles, yet depend on imported high-reliability PMICs from US and European vendors who frequently obsolete military packages or face ITAR/export controls. A single missing power management chip can ground a platform or halt locomotive production.',
    brings:
      'A power-supply architecture on 130 nm BCD with thick dielectric isolation, capable of surviving 28–120 V input transients and extreme −55 °C to +125 °C temperature swings that destroy sub-28 nm fine-node silicon.',
    value:
      'While unit volumes are modest (162K–560K units annually), military and space grade PMICs command premium prices spanning $8 to $1,500. Winning 29% of the addressable Indian market delivers ₹40 Cr in annual revenue, de-risked by statutory procurement priority under DAP-2020 Make-II indigenisation rules.',
    proven: `Low-voltage control circuits are scheduled for the ChipFoundry December 2026 shuttle, with high-voltage BCD qualification following at SCL Mohali (180 nm) and SkyWater. Voltage ratings and temperature ranges are process nominals. ${PRE_SILICON}`,
    notYet:
      'Full military temperature screening, radiation hardness assurance, and long-term burn-in reliability data remain to be demonstrated on physical silicon.',
    tradeoff:
      'Qualifying a domestic military PMIC requires substantial up-front thermal, mechanical, and burn-in testing budgets. However, once screened, it insulates defence primes from international supply sanctions and unpredictable foreign factory allocations.',
    recommendation:
      'Define your platform’s specific MIL-STD-883 screening grade or railway transient profile (e.g. Kavach train collision avoidance specifications). Evaluate SKU-3’s simulated power stage against those criteria and partner on prototype shuttle characterisation.',
    replacement: {
      headline: 'SKU-3 replaces imported military-grade PMICs, delivering domestic high-voltage transient tolerance for strategic systems.',
      short:
        'SKU-3 directly displaces imported defence and aerospace power management ICs from TI, ADI, and Renesas. Built on thick-oxide 130 nm BCD to survive 28–120 V line surges and −55 to +125 °C ambients, it eliminates reliance on foreign obsolete semiconductor lines across military, railway, and space equipment.',
    },
    beatTitles: {
      whyNow: 'Strategic Sourcing Risk: Foreign Obsolescence on Decadal Capital Equipment',
      brings: 'High-Voltage Process Moat: 130 nm BCD Surviving 28–120 V Transients',
      value: 'Commercial Niche: ₹40 Cr Plan Line Across 162K–560K Strategic Sockets',
      proven: 'Pre-Silicon Truth: Low-Voltage Blocks on December Shuttle, High-Voltage SCL Port',
      tradeoff: 'Screening Cost Trade-Off: High Qualification Overhead vs Total Supply Sovereignty',
      recommendation: 'Executive Recommendation: Scope Grade-Specific Environmental Screening Profiles',
    },
  },
  sku4: {
    headline: 'SKU-4 (DG32-LITE) enforces deterministic hardware safety — tripping to safe state in 39 cycles without firmware.',
    short:
      'SKU-4 (DG32-LITE) uses dual RV32IM cores running in hardware lockstep with an autonomous 2-cycle (<40 ns) comparator trip to latched FAULT_N safe state, total 39 cycles to bridge shutdown without firmware intervention. FOC loop executes in ~300 cycles (6 µs), leaving 82% diagnostic headroom at 10 kHz PWM. Designed toward ISO 26262 ASIL-D (design target, not certificate held).',
    whyNow:
      'Modern commercial vehicles, robotics, and industrial actuators rely heavily on digital motor control, where a software hang or memory bit-flip can cause shoot-through inverter destruction or uncontrolled torque. Conventional MCUs rely on supervisory firmware watchdogs that react in milliseconds—far too slow to prevent mechanical or electrical damage.',
    brings:
      'Dual RV32IM cores where the shadow core executes instructions with a cycle stagger. A dedicated hardware comparator checks bus transactions every clock cycle; upon disagreement, hardware latches the safe state in under 2 clock cycles (<40 ns at 50 MHz) and drives FAULT_N to disable the PWM bridge in 39 clock cycles total, with zero software execution required.',
    value:
      'The field-oriented control (FOC) current loop runs in hardwired Park/Clarke and CORDIC logic taking only ~300 clock cycles (6.0 µs). At a 10 kHz PWM rate, this leaves 82% of the 50 MHz core clock cycles completely free for condition monitoring and predictive vibration diagnostics without degrading real-time motor control responsiveness.',
    proven:
      'The SKU-4 evidence is detailed and rigorously labelled: the 39-cycle fault response is verified in gate-level simulation; the 55–62 MHz core fmax is derived from completed physical place-and-route on SkyWater sky130A; power consumption is estimated at ~0.43 W via vectorless EDA tools. It is pre-silicon: no silicon has been fabricated, and ISO 26262 ASIL-D remains an architectural goal, not a granted certification.',
    notYet:
      'Manufactured silicon measurements, physical AEC-Q100 thermal qualification, and third-party ISO 26262 functional safety certification.',
    tradeoff:
      'Hardware-enforced lockstep and fixed-function FOC acceleration eliminate firmware timing jitter and simplify safety cases, but constrain software customization compared to general-purpose automotive microcontrollers from Infineon (AURIX) or TI (Hercules). System architects must align motor control parameters with the hardware datapath.',
    recommendation:
      'Review the documented 39-cycle fault simulation trace and place-and-route timing files. Scope early hardware evaluation using the Arty A7-100T FPGA bitstream to verify motor control loop timings, and condition commercial commitment on physical chip bring-up from the December 2026 shuttle.',
    replacement: {
      headline: 'SKU-4 replaces imported safety microcontrollers, providing hardware lockstep fail-safe protection designed toward ASIL-D.',
      short:
        'SKU-4 displaces imported functional safety microcontrollers such as Infineon AURIX, TI Hercules, and NXP S32K in automotive and industrial drives. Its hardware lockstep comparator forces PWM bridge shutdown in 39 cycles without software intervention, targeting ISO 26262 ASIL-D sockets on an indigenous mature node.',
    },
    beatTitles: {
      whyNow: 'Tension: The Silent Failure Risk in Software-Controlled Machines',
      brings: 'Hardware Lockstep Mechanism: Autonomous 2-Cycle Divergence Latch',
      value: 'Compute Budget & Control Headroom: 82% Diagnostic Capacity at 10 kHz FOC',
      proven: 'Pre-Silicon Evidence: Placed-and-Routed Timing with Tool Power Estimates',
      tradeoff: 'Architecture Trade-Off: Deterministic Hardware Safety vs General Compiler Flexibility',
      recommendation: 'Executive Recommendation: Audit the Gate-Level Fault Injection Benchmark',
    },
  },
  sku5: {
    headline: 'SKU-5 provides 5V-tolerant line transceivers on 130 nm — an indigenous attach part for every wired network node.',
    short:
      'SKU-5 is an attach part that ships on virtually every wired network node—addressing 20M–60M units annually in India ($0.40–1.50 ASP, ₹45 Cr plan line). Target buyers include automotive tier-1s, industrial automation makers, and defence platforms where imported transceivers from TI, ADI, Renesas, and NXP are either obsolete or restricted by country-of-origin rules.',
    whyNow:
      'Wired interface transceivers (CAN, RS-485, LIN) are essential commodity parts on every control board, but many legacy imported chips from TI, Renesas, and ADI are becoming end-of-life or barred by defence indigenisation mandates. A missing $0.50 transceiver can halt delivery of an entire locomotive, defence power supply, or industrial automation rack.',
    brings:
      'Rugged 5 V-tolerant thick-oxide output stages on SkyWater 130 nm capable of surviving cable discharge and inductive line noise—an analog requirement where advanced sub-28 nm nodes fail. SkyWater 130 nm provides the voltage headroom and thermal stability needed for robust industrial and automotive bus communication.',
    value:
      'The SKU Blueprint projects ₹45 Cr in annual revenue, needing only 12% of the addressable Indian market (conservatively planned against 20M–60M units/year). Because interface chips attach to every microcontroller on a network, unit volumes ramp rapidly, recovering the initial development cost within the first year of production.',
    proven: `Analog circuit designs are completed and simulated, with first silicon prototypes scheduled on the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'Physical electrical bus protection, transceiver propagation delay under capacitive load, and MIL-STD screening remain to be proven on returned silicon.',
    tradeoff:
      'SKU-5 aims for standard packaging (SOIC-8) to minimize drop-in replacement friction, but slight variations in ESD clamping or receiver hysteresis must be verified against installed legacy bus harnesses.',
    recommendation:
      'Audit your bill of materials for single-source or obsolete interface transceivers. Request DeepGrid’s simulated interface parameters and reserve engineering evaluation boards from the first shuttle run.',
    replacement: {
      headline: 'SKU-5 replaces imported bus transceivers from TI, ADI, and Renesas, securing commodity interface lines against obsolescence.',
      short:
        'SKU-5 replaces imported CAN, LIN, and RS-485 interface transceivers from TI, ADI, NXP, and Renesas. Built on thick-oxide 130 nm silicon with 5V-tolerant line drivers, it provides an indigenous drop-in attach part across industrial, automotive, and defence equipment boards.',
    },
    beatTitles: {
      whyNow: 'Sourcing Vulnerability: Obsolete Bus Transceivers on Strategic Platforms',
      brings: 'Process Node Fit: 130 nm Thick-Oxide Transistors for 5V-Tolerant Bus Lines',
      value: 'Commercial Economics: High-Volume Attach Part with Rapid Payback',
      proven: 'Pre-Silicon Status: Analog Simulated, December 2026 Shuttle Prototype',
      tradeoff: 'Engineering Trade-Off: Pin-for-Pin Compatibility vs Board Redesign',
      recommendation: 'Executive Recommendation: Identify High-Vulnerability Sockets for Prototype Sampling',
    },
  },
  sku6: {
    headline: 'SKU-6 delivers sub-dollar voltage supervision and reset logic — the pathfinder for military and industrial qualification.',
    short:
      'SKU-6 watches board supply rails, brownout conditions, and watchdog timings, asserting clean system resets to protect processors from corrupt execution. Displacing standard parts from TI and Maxim/ADI across 30M–80M addressable units in India ($0.20–0.80 ASP, ₹40 Cr plan line), it acts as DeepGrid’s low-complexity pathfinder for military and automotive screening.',
    whyNow:
      'Virtually every microcontroller and processor board requires a dedicated voltage supervisor to enforce clean power-up resets and trigger brownout saves. While inexpensive ($0.20–$0.80), these chips are almost entirely imported from TI, Maxim/ADI, or ON Semi, exposing Indian manufacturing to global allocation pinches.',
    brings:
      'An internal temperature-compensated bandgap reference, precision voltage comparators, programmable delay timers, and a watchdog timer in a compact SOT-23 package (~1 mm² die area). It provides fail-safe reset outputs that remain valid down to 1.0 V supply rails.',
    value:
      'The SKU Blueprint targets ₹40 Cr in annual revenue (14% of the mid-case 55M-unit market). Because its die is tiny and its functional scope tightly bounded, SKU-6 serves as DeepGrid’s lead pathfinder in 2028 for full military screening—establishing qualification procedures for all subsequent defence chips.',
    proven: `Analog comparator stages and references are simulated, with prototypes taking the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'Trip-point drift across temperature (−55 to +125 °C) and power-supply noise rejection remain to be characterised on physical hardware.',
    tradeoff:
      'Supervisors command low absolute dollar margins per unit, requiring large order volumes to cover sales overhead. However, their small die size yields thousands of chips per wafer, providing exceptional gross margins (66–82%) once production begins.',
    recommendation:
      'Compare SKU-6’s simulated voltage threshold tolerances and response times against the incumbent Maxim/TI parts on your highest-volume boards, using prototype samples to validate brownout recovery.',
    replacement: {
      headline: 'SKU-6 replaces ubiquitous imported supervisor ICs from TI and Maxim, securing power-rail monitoring.',
      short:
        'SKU-6 replaces standard voltage supervisor and reset ICs from TI and Maxim/Analog Devices. Integrating precision voltage monitoring and brownout reset onto a ~1 mm² SOT-23 die, it eliminates imported single-source vulnerabilities on critical supply rails.',
    },
    beatTitles: {
      whyNow: 'Pervasive Dependency: Every Digital Board Requires Supervisory Silicon',
      brings: 'Silicon Architecture: Precision Voltage References and Ultra-Low Quiescent Draw',
      value: 'Commercial Role: 14% Market Capture for ₹40 Cr and Qualification Pathfinder',
      proven: 'Pre-Silicon Status: Analog Simulated, Prototype on December Shuttle',
      tradeoff: 'Margin Trade-Off: Low Unit ASP Balanced Against High Volume and Fast Payback',
      recommendation: 'Executive Recommendation: Benchmark Reset Trip Accuracies Against Incumbents',
    },
  },
  sku7: {
    headline: 'SKU-7 uses IHP 130 nm SiGe BiCMOS to deliver uncooled 77 GHz radar without fine-node mask costs.',
    short:
      'SKU-7 targets 77 GHz automotive and defence 4D imaging radar by fabricating the RF front end on IHP SG13G2 silicon-germanium (SiGe BiCMOS, fmax 350–500 GHz). It replaces imported radar transceivers from TI, NXP, Infineon, and Calterah, addressing 1M–5M units in India ($8–25 ASP, ₹35 Cr plan line) while avoiding the multi-million dollar mask sets required for 40–45 nm fine-node RF-CMOS.',
    whyNow:
      'Automotive ADAS and defence perimeter surveillance require 77 GHz radar front ends. Standard 130 nm CMOS cannot operate at 77 GHz; while 40–45 nm RF-CMOS can, its mask sets cost millions of dollars, creating prohibitive barrier-to-entry for domestic radar production and leaving India dependent on foreign suppliers.',
    brings:
      'DeepGrid partners with IHP (Germany) on their open SG13G2 130 nm SiGe BiCMOS process. With transistor cutoff frequencies reaching 350–500 GHz, SKU-7 delivers pristine 77 GHz 4D MIMO radar transmission and reception without exotic packaging or sub-28 nm lithography.',
    value:
      'The SKU Blueprint targets ₹35 Cr in annual revenue, needing just 7% of the 3M-unit Indian radar market. Driven by automotive ADAS adoption and indigenous military counter-drone radar platforms, development costs are fully amortized across early strategic defence orders.',
    proven: `Architecture and digital backend interfaces are defined; RF front end is scheduled for an IHP SiGe fabrication run in 2027. ${PRE_SILICON}`,
    notYet:
      'Full automotive AEC-Q100 qualification, uncooled RF beamforming characterisation, and target resolution under adverse weather clutter remain to be demonstrated on fabricated SiGe chips.',
    tradeoff:
      'High-frequency 77 GHz signals require specialized antenna-in-package or low-loss substrate routing. DeepGrid utilizes organic BT-resin packaging to avoid expensive silicon interposers, requiring precision RF board design by the radar tier-1.',
    recommendation:
      'Radar systems engineering teams should review IHP’s published SG13G2 device models and evaluate how SKU-7’s 4D MIMO channel configuration interfaces with their digital signal processing backends.',
    replacement: {
      headline: 'SKU-7 replaces imported 77 GHz radar RF chips from TI, NXP, and Infineon, bypassing ITAR export controls.',
      short:
        'SKU-7 replaces imported 77 GHz automotive and surveillance radar transceivers from TI, NXP, Infineon, and Calterah. Fabricated on IHP 130 nm SiGe BiCMOS (fmax 350–500 GHz), it delivers uncooled 4D imaging radar performance while bypassing foreign fine-node RF-CMOS mask costs.',
    },
    beatTitles: {
      whyNow: 'Radar Procurement Bottleneck: 77 GHz Export Restrictions and Mask Economics',
      brings: 'SiGe BiCMOS Innovation: IHP SG13G2 Delivering 350–500 GHz Transistor Speeds',
      value: 'Commercial Scale: ₹35 Cr Plan Line on 7% Conservative Market Capture',
      proven: 'Development Status: Architecture Defined, IHP Tape-Out Planned for 2027',
      tradeoff: 'Packaging Trade-Off: RF Routing on Organic Substrates vs High-Cost Interposers',
      recommendation: 'Executive Recommendation: Review IHP SiGe Process Design Kit Benchmarks',
    },
  },
  sku8: {
    headline: 'SKU-8 drives high-voltage rugged display columns — built for defence cockpits, rail consoles, and industrial HMIs.',
    short:
      'SKU-8 targets rugged and high-reliability displays in military cockpits (BEL consoles), Indian Railways passenger information systems, and industrial HMIs. It displaces imported Novatek and Himax display timing-controller and column-driver chipsets across 0.5M–2M panels annually in India ($3–12 ASP, ₹20 Cr plan line), leveraging mature 130 nm thick-oxide transistors to provide the 0–12 V output swings required by rugged LCD panels.',
    whyNow:
      'Defence multi-function displays (MFDs), locomotive driver interfaces, and industrial HMIs require ruggedised displays operating across wide temperatures. The timing controllers and column drivers for these screens are currently imported from commercial Taiwanese and Chinese suppliers (Novatek, Himax), creating acute supply risks for strategic infrastructure.',
    brings:
      'Column drivers, timing control, and hardware frozen-frame detection directly on-chip. Panel columns demand 0–12 V analog voltage swings—a high-voltage thick-oxide requirement where mature 130 nm BCD processes excel, ensuring the operator never views stale telemetry without an immediate hardware alert.',
    value:
      'Addressing 0.5M–2M panels annually in India, winning 22% of the mid-market at $3–12 ASP achieves DeepGrid’s ₹20 Cr plan line. Once designed into a defence cockpit (such as BEL avionics) or railway console, display drivers enjoy multi-year supply continuity with zero commercial redesign pressure.',
    proven: `Analog column drivers and digital TCON logic are simulated, with prototypes scheduled on the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'Physical optical contrast, column-to-column voltage matching, and environmental temperature extremes (−40 to +85 °C) remain to be validated.',
    tradeoff:
      'Competing against consumer display driver giants in smartphone or television panels would be economically unviable. SKU-8 focuses exclusively on rugged, high-margin, low-to-mid volume display applications where domestic supply and extended lifetime are mandatory.',
    recommendation:
      'Coordinate with your display module packaging team to verify SKU-8’s simulated column driver slew rates and voltage steps against your qualified liquid crystal glass formulations.',
    replacement: {
      headline: 'SKU-8 replaces imported display column drivers from Novatek and Himax in rugged defence and railway cockpits.',
      short:
        'SKU-8 replaces imported Novatek and Himax timing controllers and column drivers in rugged displays. Designed for Indian defence consoles (BEL), railway displays, and industrial HMIs, its 130 nm thick-oxide stage delivers 0–12 V drive swings with on-chip frozen-frame detection.',
    },
    beatTitles: {
      whyNow: 'Vulnerability in the Cockpit: Sourcing Imported Panel Drivers for Strategic Fleets',
      brings: 'High-Voltage Driver Architecture: 0–12 V Swings and Frozen-Frame Detection',
      value: 'Commercial Plan: ₹20 Cr Plan Line at 22% Mid-Market Share',
      proven: 'Pre-Silicon Status: Analog Simulated, December 2026 Shuttle Prototype',
      tradeoff: 'Market Realism: Focused on High-Margin Industrial/Defence Rather than Consumer Panels',
      recommendation: 'Executive Recommendation: Test Column Drive Voltages Against Target Rugged Glass',
    },
  },
  sku9: {
    headline: 'SKU-9 consolidates automotive zonal networks — replacing heavy wiring harnesses with local TSN Ethernet.',
    short:
      'SKU-9 targets software-defined vehicle (SDV) architectures by combining multi-channel CAN/LIN/FlexRay interfaces with a deterministic Ethernet TSN gateway. Replacing imported zonal controllers (such as NXP S32G, Renesas, and Infineon) across 1M–4M units in India ($6–20 ASP, ₹60 Cr plan line), it allows carmakers to replace bulky relay-and-harness boxes with four corner zonal controllers, eliminating up to 18 kg of vehicle copper wiring.',
    whyNow:
      'Commercial and passenger EVs are transitioning from point-to-point wiring harnesses to zonal architectures. Traditional wiring harnesses add 18+ kg of copper, inflating assembly cost and labor. Zonal design moves intelligence to four corner controllers, but carmakers currently depend entirely on imported zonal processors from NXP (S32G), Renesas, and Infineon.',
    brings:
      'Legacy CAN-FD, LIN, and FlexRay interfaces unified with a 100 Mbps time-sensitive networking (TSN) Ethernet switch on a single 130 nm die. A gateway demands multiple deterministic channels and bounded latency rather than gigahertz clock speeds; the on-chip hardware switch bounds packet delay, keeping processor load minimal.',
    value:
      'With ~5 million vehicles manufactured annually in India and 10–30% moving to zonal platforms by FY31 (averaging three zonal gateways per vehicle), the addressable market is 1M–4M units. Winning 19% at a mid-price of $13.00 delivers ₹60 Cr annually, with development costs (₹3.8–8.8 Cr) recovered inside 41K–118K units.',
    proven: `Digital RTL is complete, with prototypes scheduled on the ChipFoundry December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'Automotive AEC-Q100 qualification and ISO 26262 ASIL-B/D functional safety cases are planned for 2029–2030 ahead of volume production in FY31.',
    tradeoff:
      'SKU-9 manages localized power distribution and peripheral sensor/actuator networking only. Central vehicle compute (running autonomous driving and infotainment) requires sub-10 nm leading-edge silicon and is deliberately outside DeepGrid’s mature-node portfolio.',
    recommendation:
      'Map your vehicle’s zonal bus topology against SKU-9’s interface channel count. Evaluate simulated TSN packet forwarding delays against your worst-case steer-by-wire and braking latency budgets.',
    replacement: {
      headline: 'SKU-9 replaces imported zonal gateways from NXP and Renesas, eliminating relay-and-harness complexity.',
      short:
        'SKU-9 replaces imported zonal controllers and multi-protocol gateways such as NXP S32G, Renesas, and Infineon. Housing deterministic TSN Ethernet switching and CAN/LIN routing on 130 nm silicon, it collapses vehicle wiring harnesses by replacing discrete relay boxes with corner zonal modules.',
    },
    beatTitles: {
      whyNow: 'Automotive Architectural Shift: Eliminating the Heavy Wiring Harness',
      brings: 'Deterministic Gateway Logic: Multi-Bus Translation with Hardware TSN Routing',
      value: 'Commercial Traction: ₹60 Cr Plan Line on 19% Mid-Market Zonal Adoption',
      proven: 'Pre-Silicon Status: RTL Ready, Prototype on December Shuttle',
      tradeoff: 'System Boundary: Zonal Management Strictly Decoupled from Central Compute',
      recommendation: 'Executive Recommendation: Evaluate Network Latency Models on Vehicle Benches',
    },
  },
  sku10: {
    headline: 'SKU-10 (DG32-Max) unifies secure control and verified boot — replacing the MCU-plus-crypto dual-chip pair.',
    short:
      'DG32-Max directly displaces the imported two-chip combination used across industrial, drone and EV sub-controllers: a general microcontroller paired with an external secure element (such as an ATECC608). By housing dual DGridRiscV cores in lockstep alongside a mask-ROM secure boot engine (309 ms digital signature verification) and a 1 kbit ReRAM secret store on SkyWater 130 nm, it eliminates foreign crypto dependencies while cutting component count.',
    whyNow:
      'Equipment makers building connected industrial drives, drone flight controllers, and EV chargers face rising security mandates while relying on imported microcontrollers paired with external cryptographic elements. This split architecture introduces two foreign supply dependencies, bus interception vulnerabilities, and higher assembly cost across an addressable Indian market of 8M–25M units a year (₹229 Cr–₹1,908 Cr TAM).',
    brings:
      'Dual DGridRiscV processors in hardware lockstep, dedicated hardware cryptographic acceleration, a 4 KB instruction cache, and 128 KB of error-corrected SRAM across 32 ChipFoundry macros. Crucially, verified boot executes entirely from internal mask ROM—verifying firmware signatures in 309 ms from reset—while device secrets and rollback counters reside in an on-die 1 kbit ReRAM macro, eliminating external security ICs.',
    value:
      'The October 2026 SKU Blueprint projects a plan line of ₹110 Cr yearly revenue at an ASP of $5.50 (60–75% gross margin). Capturing just 13% of the 16.5M-unit mid-case market delivers this volume, with initial development and shuttle costs (estimated at ₹2.1–4.3 Cr) fully recovered within 53K–137K units—well under the first year of volume production.',
    proven: `RTL was feature-complete on 1 October 2026, passing all simulation testbenches and secure boot verification. Hardware validation is proceeding via Arty A7-100T FPGA emulation and oscillator characterisation, targeting tape-out on the ChipFoundry OpenFrame December 2026 shuttle. ${PRE_SILICON}`,
    notYet:
      'No physical silicon has been manufactured or qualified; customer design wins remain the primary adoption gate.',
    tradeoff:
      'Moving from established incumbent MCUs (from ST, Microchip, or Analog Devices) to SKU-10 trades standard commercial IDEs and multi-source supplier familiarity for indigenous supply security, open-PDK auditability, and lower BOM cost. Early adopters must validate the DGridRiscV software toolchain and custom pinout against their board layouts.',
    recommendation:
      'Identify an industrial controller, drone ESC, or EV charger design where dual-chip BOM cost or import restrictions are acute. Evaluate the open-source boot and crypto flow against the lead customer’s firmware signing scheme on the Arty A7-100T FPGA platform before committing to volume production silicon.',
    replacement: {
      headline: 'SKU-10 replaces MAX32655-class secure MCUs and separate crypto chips, collapsing secure boot and control onto a single die.',
      short:
        'DG32-Max directly displaces the imported two-chip combination used across industrial, drone and EV sub-controllers: a general microcontroller paired with an external secure element (such as an ATECC608). By housing dual DGridRiscV cores in lockstep alongside a mask-ROM secure boot engine (309 ms digital signature verification) and a 1 kbit ReRAM secret store on SkyWater 130 nm, it eliminates foreign crypto dependencies while cutting component count.',
    },
    beatTitles: {
      whyNow: 'Sourcing & Security Friction: The Two-Chip Discrete Vulnerability',
      brings: 'Architectural Consolidation: Lockstep RISC-V with On-Die Mask ROM & ReRAM',
      value: 'Commercial Math: ₹110 Cr Revenue on 13% Market Capture',
      proven: 'Pre-Silicon Truth & Verification: RTL-Complete Toward December 2026 Shuttle',
      tradeoff: 'System Trade-Off: PDK Sourcing Freedom vs Established Toolchain Ecosystem',
      recommendation: 'Executive Recommendation: Scope Lead Customer Security Verification on FPGA',
    },
  },
  sku11: {
    headline: 'SKU-11 merges battery state-of-health AI with hardwired safety — protecting lithium packs independently of software.',
    short:
      'SKU-11 collapses three discrete chips beside external battery analog front ends (such as TI BQ76952 or ADI ADBMS)—the supervisory MCU, the edge neural accelerator for battery state-of-health (SOH), and the security authentication chip. Building on the DG32-Max 130 nm platform, it integrates on-chip electrochemical impedance spectroscopy (EIS), hardwired analog protection that shuts down the contactor even if firmware halts, and an on-board SOH AI engine to satisfy AIS-156 and EU Battery Passport requirements.',
    whyNow:
      'AIS-156 mandates microprocessor-controlled BMS on every Indian electric vehicle, while Phase-2 thermal propagation tests make protection safety-critical. Simultaneously, the EU Battery Passport (Article 77, mandatory February 2027) legally requires verifiable battery health tracking on exports. Battery pack makers currently cobble together imported MCUs, Syntiant-class neural accelerators, and crypto chips to comply, driving up assembly cost across 3M–10M packs annually (₹57 Cr–₹572 Cr TAM).',
    brings:
      'On-chip EIS internal resistance measurement, AxCIM-AI neural inference, and tamper-proof pack authentication combined with the host MCU. Crucially, over-voltage, under-voltage, over-current, and over-temperature safety comparators are hardwired directly into the contactor driver—guaranteeing immediate battery pack isolation even if the processor hangs or crashes.',
    value:
      'The SKU Blueprint projects ₹40 Cr in annual steady-state revenue at an ASP of $4.00, requiring 16% capture of the 6.5M-unit mid-case market. Reusing the DG32-Max platform, PUF security IP, and SKU-6 comparator circuits minimizes new design risk, with development costs (₹3.4–7.8 Cr) recovered within 119K–341K units.',
    proven: `Block specification issued September 2026; host processor and security blocks are proven in DG32-Max RTL. ${PRE_SILICON}`,
    notYet:
      'The AFE companion bridge, registration of target electrochemical cell impedance curves, and an assigned manufacturing shuttle slot remain open.',
    tradeoff:
      'High-voltage cell-measuring analog front ends (AFEs) require mature automotive analog foundries that carry 26–40 week lead times and high NDA barriers. DeepGrid avoids duplicating complex analog fabs by deliberately leaving the AFE external (pairing with TI or ADI), focusing indigenous silicon strictly on the digital intelligence, security, and hardware safety layers.',
    recommendation:
      'Evaluate SKU-11 as a joint platform development: freeze the companion AFE interface (e.g. BQ76952), supply real-world cell degradation curves, and prepare for joint prototype validation once the digital platform completes tape-out.',
    replacement: {
      headline: 'SKU-11 replaces MCU, neural accelerator, and auth chip sets beside external AFEs, unifying BMS intelligence.',
      short:
        'SKU-11 replaces the supervisory MCU, external edge neural accelerator (e.g. Syntiant NDP120), and authentication element that currently sit beside battery analog front ends. It unites battery management, on-board SOH AI inference, and hardwired analog safety comparators into a single 130 nm digital controller.',
    },
    beatTitles: {
      whyNow: 'Regulatory Mandate & Safety Tension: AIS-156 and EU Battery Passport Deadlines',
      brings: 'Three-to-One Hardware Consolidation: EIS Engine, SOH AI & Autonomous Protection',
      value: 'Sourcing Strategy: Building Digital Intelligence While Buying Proven Analog AFEs',
      proven: 'Pre-Silicon Status: Block Spec Issued, Dependent on AFE Partner & Indian Datasets',
      tradeoff: 'Commercial Scale: ₹40 Cr Plan Line on 16% Pack Controller Share',
      recommendation: 'Executive Recommendation: Partner on AFE Bridge and Field Thermal Datasets',
    },
  },
  d100: {
    headline: 'D100 Drone SoC is sequenced as a separate ₹50 Cr growth round, completely ring-fenced from mature-node revenues.',
    short:
      'The October 2026 SKU Blueprint isolates the Track B D100 drone chip from the FY31 ₹1,000 Cr portfolio plan, funding it through a separate ₹50 Cr round only after the eleven mature-node products generate proven commercial revenue. This prevents advanced-node mask costs from jeopardizing cash-flow self-sufficiency.',
    whyNow:
      'Indian drone manufacturers (such as ideaForge, guiding 340–450 units in Q4 FY26) currently rely on imported Qualcomm QRB5165 or Chinese flight computers. Statutory country-of-origin rules barring land-border components create an urgent sovereign wedge for an indigenous SoC combining optical navigation, DShot motor telemetry, and autonomous return-to-home logic.',
    brings:
      'A dual-track architecture: high-compute visual odometry and navigation running on an advanced 28 nm node, linked to an isolated 130 nm hardware failsafe island that provides autonomous return-to-home and parachute deployment if the primary compute domain fails.',
    value:
      'Sequencing D100 after the eleven mature-node products generates commercial revenue protects early capital while positioning DeepGrid for high-margin sovereign UAV tenders once domestic drone manufacturing scales.',
    proven:
      'The concept, pin-reuse schemes, and failsafe state machine are architecturally specified. It is pre-silicon and outside the core 130 nm tape-out schedule.',
    notYet:
      'Advanced-node 28 nm mask funding, DO-254 aviation qualification, and multi-sensor flight trials under real electronic countermeasure environments.',
    tradeoff:
      'Funding D100 immediately would accelerate a high-profile sovereign drone SoC but burn critical capital on advanced-node mask sets. Sequencing it as Track B protects portfolio cash flow while preserving the growth upside.',
    recommendation:
      'Treat D100 as a separate investment and technical decision. Review its 130 nm failsafe island architecture now, but tie formal evaluation to completion of the ₹50 Cr growth financing round.',
    replacement: {
      headline: 'D100 replaces imported drone flight computers like Qualcomm QRB5165, uniting navigation and failsafe.',
      short:
        'D100 directly targets imported drone flight computers such as Qualcomm QRB5165. By uniting advanced 28 nm visual navigation with a 130 nm isolated hardware failsafe island, it answers statutory defence country-of-origin restrictions that bar foreign components from military and commercial UAVs.',
    },
    beatTitles: {
      whyNow: 'Sovereign UAV Tension: Banning Land-Border Components from Flight Electronics',
      brings: 'Dual-Domain Architecture: 28 nm Visual Navigation with 130 nm Failsafe Island',
      value: 'Strategic Positioning: Capturing Tactical and Commercial Drone Avionic Sockets',
      proven: 'Pre-Silicon Conceptual Status: Architectural Specification Completed',
      tradeoff: 'Capital Sequencing: Protecting Portfolio Runway Before Advanced-Node Masks',
      recommendation: 'Executive Recommendation: Audit Failsafe Island Verification on FPGA',
    },
  },
};

/** Cross-cutting questions that are not about one product. */
export const topicStories: { test: RegExp; story: Story }[] = [
  {
    test: /certif|qualif|asil|iso ?26262|approved|guarantee|compliant|immune/i,
    story: {
      headline: 'No DeepGrid product is certified or qualified yet — treat qualification as an adoption gate, not a feature.',
      short:
        'DeepGrid designs toward recognized international standards—the DG32-LITE safety microcontroller is designed toward ISO 26262 ASIL-D—but a design target is not a certificate held. All published evidence is pre-silicon, based on gate-level simulations and physical layout timing.',
      whyNow:
        'Automotive OEMs, railway signaling contractors, and defence primes cannot deploy uncertified silicon into production machines. Treating design evidence as certified status creates catastrophic program delivery risks.',
      brings:
        'Rigorous hardware safety mechanisms built into the silicon architecture: cycle-delayed lockstep comparators, 39-cycle autonomous PWM shutdown, and hardware fault latching designed specifically to satisfy ASIL-D diagnostic coverage metrics.',
      value:
        'Clear, honest evidence labeling allows engineering leadership to accurately schedule qualification test benches, burn-in budgets, and certification audits into program roadmaps from day one.',
      proven:
        'Simulated fault injection traces, post-place-and-route timing analysis (55–62 MHz), and EDA vectorless power estimations (~0.43 W) on SkyWater sky130A.',
      notYet:
        'Fabricated silicon characterisation, AEC-Q100 thermal cycle qualification, and formal ISO 26262 functional safety certificates from accredited audit bodies.',
      tradeoff:
        'Engaging at the pre-silicon stage allows equipment makers to influence pinout, register maps, and peripheral packaging; waiting for certified silicon provides certainty but surrenders early lead time to competitors.',
      recommendation:
        'Identify the exact safety standard and grade required by your system, audit DeepGrid’s simulation testbenches, and structure commercial adoption around discrete qualification gates.',
      beatTitles: {
        whyNow: 'Compliance Gate: Distinguishing Architectural Targets from Held Certificates',
        brings: 'Hardware Safety Mechanisms: Deterministic Lockstep and Safe-State Latching',
        value: 'Risk Management: Accurate Qualification Budgeting and Delivery Timelines',
        proven: 'Pre-Silicon Status: Gate-Level Simulation and Post-Route Timing Analysis',
        tradeoff: 'Adoption Timing: Early Architectural Influence vs Certified Certainty',
        recommendation: 'Actionable Step: Formulate Acceptance Criteria Tied to Qualification Milestones',
      },
    },
  },
  {
    test: /fund|financ|invest|budget|revenue|round|valuation|fy ?31|crore|\bcr\b/i,
    story: {
      headline: 'The plan is staged: mature-node revenue first, D100 as a separately funded growth bet.',
      short:
        'The October 2026 SKU Blueprint establishes a FY31 ₹1,000 Cr portfolio revenue plan anchored entirely by eleven mature-node chips on 130 nm and 180 nm. The Track B D100 drone SoC is strictly excluded from this revenue target, funded via a separate ₹50 Cr growth round only after mature-node products prove commercial traction.',
      whyNow:
        'Semiconductor startups frequently fail by over-allocating capital to expensive advanced-node tape-outs before core products generate revenue. Investors and equipment partners require strict capital discipline to ensure wafer runway.',
      brings:
        'Eleven targeted mature-node silicon replacements addressing India’s $9B electronics import deficit across motors, smart meters, power systems, transceivers, and radar, with DG32 as the documented proof point.',
      value:
        'Mature-node products require dramatically lower mask and NRE capital (shuttle slots at $15K–$50K) while addressing high-volume, sticky industrial sockets with 60–75% gross margins.',
      proven:
        'Capital waterfall plans, unit economics, and ChipFoundry shuttle quotes are documented; all revenue figures represent planning projections, not achieved financial results.',
      notYet:
        'Volume manufacturing wafer contracts, mass customer design wins, and production invoice collections remain ahead.',
      tradeoff:
        'Staging capital preserves operational runway and protects the core portfolio from cash crunches, but delays the high-profile D100 drone SoC until the core business earns.',
      recommendation:
        'Evaluate DeepGrid’s progress against concrete engineering milestones: first shuttle tape-out (December 2026), silicon bring-up (mid-2027), and initial customer design wins before capital expansion.',
      beatTitles: {
        whyNow: 'Capital Discipline: Preventing Premature Advanced-Node Cash Burn',
        brings: 'Mature-Node Economics: High-Volume Commodity Sockets on Low-Cost Tooling',
        value: 'Revenue Portfolio: FY31 ₹1,000 Cr Plan Across Eleven Core Products',
        proven: 'Documented Waterfall: Seed Runway and December Shuttle Commitments',
        tradeoff: 'Sequencing Trade-Off: Capital Insulation vs Aggressive Expansion',
        recommendation: 'Investment Milestone: Gating Capital Tranches on Physical Silicon Bring-Up',
      },
    },
  },
  {
    test: /ready|readiness|status|when|timeline|mature|silicon yet|tape|shuttle|available/i,
    story: {
      headline: 'DeepGrid is at the design stage: the evidence is specific, but nothing is measured on silicon yet.',
      short:
        'DeepGrid’s products are pre-silicon. DG32-LITE is the most advanced design, with feature-complete RTL, placed-and-routed timing, and simulated fault injection. Nine of the eleven mature-node products are scheduled to tape out on the ChipFoundry December 2026 shuttle, but no physical chips have yet been manufactured or characterized.',
      whyNow:
        'Equipment manufacturers planning production launches cannot afford schedule drift caused by confusing simulated design files with production-ready silicon inventory.',
      brings:
        'Fully documented and inspectable RTL, physical layout floorplans, simulated fault traces, and open-source PDK compatibility that engineering teams can evaluate today on FPGA hardware.',
      value:
        'Engaging during the pre-silicon window allows customers to request custom pin multiplexing, evaluate driver software stacks, and reserve early prototype wafer allocations.',
      proven:
        'Completed RTL for ten SKUs, analog simulations for six SKUs, and post-route timing closure for DG32-LITE on SkyWater sky130A.',
      notYet:
        'Wafer fabrication, packaging yield, physical silicon brings-up, parametric testing, and volume supply availability.',
      tradeoff:
        'Evaluating pre-silicon designs requires FPGA emulation and simulation review; waiting for manufactured silicon guarantees physical parts but forfeits early engineering influence.',
      recommendation:
        'Run bounded evaluations using DeepGrid’s FPGA bitstreams on Arty A7-100T boards today, and establish prototype bring-up criteria for the returned December 2026 shuttle silicon.',
      beatTitles: {
        whyNow: 'Schedule Protection: Recognizing the Gap Between Simulation and Silicon',
        brings: 'Engineering Transparency: Inspectable RTL and Open-PDK Floorplans',
        value: 'Strategic Window: Early Influence on Pinout and Software Stacks',
        proven: 'Current Readiness: RTL Complete, Tape-Out Slated for December Shuttle',
        tradeoff: 'Development Choice: Early FPGA Prototyping vs Late Off-the-Shelf Procurement',
        recommendation: 'Next Step: Establish Hardware Bring-Up Acceptance Criteria',
      },
    },
  },
  {
    test: /why india|domestic|sovereign|import|supply|sourcing|130 ?nm|mature[- ]node|node/i,
    story: {
      headline: 'Mature-node silicon is the right tool for physical jobs — and domestic sourcing eliminates critical supply risk.',
      short:
        'Power electronics, motor drives, sensors, and safety microcontrollers do not need sub-10 nm transistors; they need thick-oxide dielectrics that withstand 28–120 V transients and extreme −55 to +125 °C operating temperatures. DeepGrid selected 130 nm BCD and 180 nm nodes because fine nodes break down under physical industrial loads and cost tens of millions in mask tooling.',
      whyNow:
        'Geopolitical trade sanctions and supply shocks have demonstrated that a missing $0.50 transceiver or motor controller halts assembly of multimillion-dollar locomotives, defence vehicles, and industrial machinery.',
      brings:
        'A comprehensive sovereign silicon portfolio spanning eleven critical socket categories, designed to run across multiple foundries (SkyWater 130 nm, SCL Mohali 180 nm, and IHP 130 nm SiGe).',
      value:
        'Equipment makers gain second-source supply security immune to land-border country-of-origin import bans, while qualifying for domestic procurement mandates under DAP-2020 Make-II.',
      proven:
        'Process node selection rationale, voltage breakdown analyses, and thermal design envelopes are fully documented across master architecture whitepapers.',
      notYet:
        'Multi-foundry second-source production qualification and volume wafer delivery guarantees.',
      tradeoff:
        'Qualifying an emerging domestic silicon supplier requires engineering investment and board validation; remaining with imported silicon avoids validation effort but perpetuates single-source supply exposure.',
      recommendation:
        'Identify your bill-of-materials sockets with the highest geopolitical or obsolescence risk, and evaluate the corresponding DeepGrid mature-node architecture as a strategic second source.',
      beatTitles: {
        whyNow: 'Supply Chain Friction: The Cost of Geopolitical Component Bottlenecks',
        brings: 'Physical Process Match: Why High Voltage and Wide Temperature Demand 130 nm',
        value: 'Sovereign Advantage: Statutory Indigenisation Under DAP-2020 Make-II',
        proven: 'Architectural Rationale: Multi-Factory Roadmap Across SkyWater, SCL, and IHP',
        tradeoff: 'Procurement Balance: Domestic Qualification Effort vs Sourcing Vulnerability',
        recommendation: 'Strategic Action: Pilot High-Risk Socket Evaluations on Domestic Architectures',
      },
    },
  },
  {
    test: /portfolio|products|what (do|does) (you|deepgrid)|offer|overview|strategy|business|opportunit/i,
    story: {
      headline: 'DeepGrid builds the silicon around the main computer — eleven architectures plus D100, with DG32 as the proof.',
      short:
        'DeepGrid builds the mature-node semiconductors that handle the physical world around the central processing computer: motion control, power conversion, sensing, bus interfaces, and safety monitoring. The portfolio spans eleven core SKU architectures on 130 nm / 180 nm plus the Track B D100 drone SoC, using DG32-LITE as the deep architectural proof point.',
    whyNow:
      'While global industry focuses on multi-billion-dollar AI accelerators, 80% of an electronic machine’s physical bill of materials consists of mature-node chips that interface with motors, sensors, and power lines. India imports over $9B of these parts annually.',
    brings:
      'A synchronized product family spanning motor controllers (SKU-1), smart meters (SKU-2), hi-rel power (SKU-3), lockstep MCUs (SKU-4), interface transceivers (SKU-5), supervisors (SKU-6), 77 GHz radar (SKU-7), display drivers (SKU-8), zonal gateways (SKU-9), secure MCUs (SKU-10), and BMS controllers (SKU-11).',
    value:
      'Together, the eleven products address an annual Indian market of ₹1,611 Cr at a 30% ceiling, supporting DeepGrid’s planned ₹1,000 Cr steady-state portfolio plan with 60–75% gross margins.',
    proven:
      'DG32-LITE represents the fully elaborated pre-silicon proof point with post-route timing; the remaining ten SKUs are defined in the SKU Blueprint (October 2026) with prototypes scheduled for December 2026.',
    notYet:
      'Volume silicon manufacturing, commercial design wins, and production revenue across all product lines.',
    tradeoff:
      'Offering eleven architectures demonstrates comprehensive system coverage but spreads initial engineering focus; DeepGrid sequences execution by prioritizing high-volume lead chips (DG32-Max, motor controller, smart meter, supervisor).',
    recommendation:
      'Examine the specific SKU that matches your current system bottleneck, audit its documented architectural profile, and engage with DeepGrid for targeted prototype evaluation.',
    beatTitles: {
      whyNow: 'The Unmet Need: Addressing the $9B Mature-Node Import Deficit',
      brings: 'Portfolio Breadth: Eleven Specialized Silicon Architectures',
      value: 'Economic Engine: The FY31 ₹1,000 Cr Revenue Ramp',
      proven: 'Proof Point Strategy: DG32-LITE as the Complete Architectural Model',
      tradeoff: 'Portfolio Balance: Broad Socket Coverage vs Staged Market Rollout',
      recommendation: 'Next Step: Identify Your System Bottleneck and Request Architectural Handouts',
    },
  },
];

export const comparisonClose = {
  howToChoose:
    'Match each candidate directly against your system’s primary responsibility: choose SKU-10 if your bottleneck is firmware signature verification, secure boot, and general control on industrial/drone boards; choose SKU-11 if you are designing a lithium battery pack requiring on-board state-of-health estimation and hardwired safety shutdown. Reusing the DGridRiscV core and security primitives does not make these parts interchangeable.',
  recommendation:
    'Agree on the specific hardware interfaces, pin allocations, and acceptance benchmarks required for each socket. Evaluate SKU-10’s verified boot flow on FPGA today, while tracking companion AFE partner selection for SKU-11.',
};
