/** Portfolio narrative: architecture scope is not availability. Source paths are site-relative;
 * pass them through routes.url when rendering. Index IDs aid discovery, not verification.
 * Editorial grouping follows docs/v6/story-pack.md; publication follows the named downloads
 * and the corrective claim map. No dated shuttle plan is promoted to current readiness.
 */
export type PortfolioGroupId = 'motion' | 'infrastructure' | 'interfaces' | 'integration';
export type StorySource = {title: string; path: string; section: string};
export type PortfolioGroup = {id: PortfolioGroupId; title: string; question: string; description: string};
export type PortfolioPart = {
  id: string; code: string; name: string; group: PortfolioGroupId;
  job: string; architecture: string; process: string;
  maturity: 'Architecture scope' | 'Pre-silicon engineering evidence';
  boundary: string; evaluation: string; route: string;
  claimIds: string[]; source: StorySource;
};
export type FoundationItem = {
  id: string; title: string; description: string; boundary: string; source: StorySource;
};
export type QualificationGate = {
  id: string; title: string; work: string; evidence: string; boundary: string; source: StorySource;
};
export type RoadmapStep = {
  id: string; title: string; purpose: string; boundary: string; source: StorySource;
};
export type StopRule = {
  id: 'S1' | 'S2' | 'S3' | 'S4'; title: string; condition: string; response: string; source: StorySource;
};

const skuSource = (section: string): StorySource => ({title: 'SKU Architecture Compendium', path: '/downloads/deepgrid-sku-compendium-architecture.md', section});
const blueprintSource = (section: string): StorySource => ({title: 'SKU Blueprint, October 2026', path: '/downloads/docs/deepgrid-sku-blueprint-oct2026.md', section});
const strategySource = (section: string): StorySource => ({title: 'Mature-Node Silicon System Architecture', path: '/downloads/deepgrid-mature-silicon-architecture.md', section});

export const portfolioGroups: PortfolioGroup[] = [
  {id: 'motion', title: 'Motion & safety', question: 'What drives the motor, and what stops it?', description: 'Motor-control power stages and the independent logic that watches control execution.'},
  {id: 'infrastructure', title: 'Power & infrastructure', question: 'What measures, powers and supervises the board?', description: 'Metering, rail generation and supply supervision are separate silicon jobs.'},
  {id: 'interfaces', title: 'Interfaces & perception', question: 'How does the system communicate, sense and display?', description: 'Harness interfaces, radio-frequency sensing and display drive each need specialist blocks.'},
  {id: 'integration', title: 'System integration', question: 'How do these functions become a platform?', description: 'Zonal control and drone architectures combine functions across process and safety boundaries.'},
];

export const portfolioParts: PortfolioPart[] = [
  {id: 'sku-1', code: 'SKU-1', name: 'BLDC motor controller', group: 'motion', job: 'Control a brushless motor and drive its power stage.', architecture: 'CORDIC, hardware PID and seven PWM channels, controlling a 5–120 V motor supply with external power switches above 20 V; a cost-down cut serves fans and appliances.', process: '130 nm BCD', maturity: 'Architecture scope', boundary: 'The high-voltage motor-controller architecture is distinct from DG32’s low-voltage safety MCU.', evaluation: 'Motor topology, bus voltage, gate-drive needs and protection requirements.', route: '/products', claimIds: [], source: blueprintSource('SKU-1')},
  {id: 'sku-4', code: 'SKU-4', name: 'DG32 safety MCU', group: 'motion', job: 'Make a control-core disagreement observable at the hardware fault output.', architecture: 'MAIN and CHECKER run with a two-cycle skew; a comparator and sticky latch drive the fault path.', process: '130 nm CMOS', maturity: 'Pre-silicon engineering evidence', boundary: 'DG32 has detailed simulation and implementation evidence; no measured silicon result or functional-safety certificate is claimed.', evaluation: 'Fault response, loop budget, ADC limits and QFN-64 board compatibility.', route: '/technology/safety', claimIds: ['sku-4', 'fault-39', 'qfn-64'], source: {title: 'DG32-LITE Architecture Guide', path: '/downloads/dg32-lite-architecture-guide.md', section: 'Safety core and fault injection'}},
  {id: 'sku-2', code: 'SKU-2', name: 'Smart-meter SoC', group: 'infrastructure', job: 'Measure electrical energy and preserve metering state when mains power is absent.', architecture: 'Six-channel sigma-delta analog front end, metrology processing and an always-on RTC domain.', process: '130 nm CMOS', maturity: 'Architecture scope', boundary: 'Metrology and low-power figures are architecture targets, not published production measurements.', evaluation: 'Accuracy class, analog front end, tamper detection and backup operation.', route: '/products', claimIds: [], source: blueprintSource('SKU-2')},
  {id: 'sku-3', code: 'SKU-3', name: 'High-reliability PMIC', group: 'infrastructure', job: 'Turn an equipment power bus into sequenced board supplies.', architecture: 'Pre-buck conversion, four sequenced rails, bandgap reference and fault protection, in military, railway and space grades.', process: 'SCL 180 nm BCD; sky130 prototype', maturity: 'Architecture scope', boundary: 'Military, railway (EN 50155) and space requirements are intended qualification contexts, not held approvals; the space grade is radiation-tolerant, not rad-hard.', evaluation: 'Input transients, rail current, sequencing and screening requirements.', route: '/products', claimIds: [], source: blueprintSource('SKU-3')},
  {id: 'sku-6', code: 'SKU-6', name: 'Quad-rail supervisor', group: 'infrastructure', job: 'Detect unsafe supply conditions and latch a fault.', architecture: 'Four monitored rails, deglitch filtering and a windowed watchdog.', process: 'SCL 180 nm CMOS; sky130 prototype', maturity: 'Architecture scope', boundary: 'Planned screening pathfinder; the manufacturing route remains to be resolved against the broader roadmap.', evaluation: 'Rail thresholds, transient rejection, fault latching and screening.', route: '/products', claimIds: [], source: blueprintSource('SKU-6')},
  {id: 'sku-5', code: 'SKU-5', name: 'Interface transceiver', group: 'interfaces', job: 'Connect digital control to an electrically exposed harness.', architecture: 'RS-485 and CAN-FD interfaces with fault and ESD protection targets.', process: '130 nm LDMOS', maturity: 'Architecture scope', boundary: 'Harness-survival and protocol requirements need device-level validation.', evaluation: 'Bus protocol, common-mode range, fault exposure and ESD tests.', route: '/products', claimIds: [], source: blueprintSource('SKU-5')},
  {id: 'sku-7', code: 'SKU-7', name: '77 GHz radar', group: 'interfaces', job: 'Convert radio-frequency reflections into range and motion information.', architecture: 'SiGe RF front end at 77 GHz (24 GHz variant) paired with CMOS sampling and baseband processing.', process: 'IHP SiGe + 130 nm CMOS', maturity: 'Architecture scope', boundary: 'RF and baseband are different dies; transistor frequency capability is not the radar operating frequency.', evaluation: 'RF channels, waveform, sampling, processing and package partition.', route: '/products', claimIds: [], source: blueprintSource('SKU-7')},
  {id: 'sku-8', code: 'SKU-8', name: 'Rugged display driver', group: 'interfaces', job: 'Translate digital image data into panel drive signals.', architecture: 'Column DACs, gamma control and timing-controller functions.', process: '130 nm high-voltage CMOS', maturity: 'Architecture scope', boundary: 'Rugged display applications and safety requirements are targets, not certifications.', evaluation: 'Panel interface, resolution, column voltage and environmental tests.', route: '/products', claimIds: [], source: blueprintSource('SKU-8')},
  {id: 'sku-9', code: 'SKU-9', name: 'Zonal controller & gateway', group: 'integration', job: 'Bring power distribution and network connections into a vehicle zone.', architecture: 'Smart e-fuses, time-sensitive networking and hardware security functions.', process: '130 nm CMOS and BCD', maturity: 'Architecture scope', boundary: 'System architecture; no measured harness-weight reduction or qualified vehicle implementation is claimed.', evaluation: 'Zone loads, network timing, security and power-fault containment.', route: '/products', claimIds: [], source: blueprintSource('SKU-9')},
  {id: 'sku-10', code: 'SKU-10', name: 'DG32-Max secure MCU', group: 'integration', job: 'Boot only signed firmware on one chip, without a separate secure element.', architecture: 'Two lockstep DGridRiscV cores with crypto instructions, 128 KB of error-corrected memory and a boot ROM that verifies the firmware signature.', process: '130 nm CMOS (SKY130)', maturity: 'Pre-silicon engineering evidence', boundary: 'RTL feature-complete with passing bench and firmware tests; no silicon, FPGA proof or certification result is claimed yet.', evaluation: 'Secure-boot chain, key storage on a node without OTP, crypto throughput and the 44-pin budget.', route: '/products', claimIds: [], source: blueprintSource('SKU-10')},
  {id: 'sku-11', code: 'SKU-11', name: 'SOH-aware BMS controller', group: 'infrastructure', job: 'Run a lithium battery pack safely and estimate its state of health on the chip.', architecture: 'The DG32-Max platform with an AI accelerator for charge, health and remaining-life estimates, optional cell-impedance measurement and hardwired cell protection.', process: '130 nm CMOS (SKY130)', maturity: 'Architecture scope', boundary: 'Block specification only; the cell-measuring front end and isolation chip are bought, and no model accuracy on Indian field data is claimed.', evaluation: 'Protection that works when the processor stops, the AFE partner, and state-of-health accuracy on Indian duty cycles.', route: '/products', claimIds: [], source: blueprintSource('SKU-11')},
  {id: 'track-b-d100', code: 'D100', name: 'Drone SoC', group: 'integration', job: 'Separate flight safety from higher-level perception compute.', architecture: 'A dedicated failsafe island with isolated power and clocks connects to the ESC path.', process: '28 nm; 130 nm failsafe island', maturity: 'Architecture scope', boundary: 'The failsafe architecture does not establish jamming immunity, certified flight safety or an awarded silicon contract.', evaluation: 'Safe-state behavior, compute partition, power isolation and flight validation.', route: '/products', claimIds: [], source: blueprintSource('D100')},
];

export const portfolioScope = {
  title: 'Eleven core SKUs. D100. A separate system reference.',
  description: 'This is the architecture portfolio from the October 2026 SKU Blueprint, not a list of available production parts. DG SDV is a reference platform, not a thirteenth chip.',
  referenceId: 'dg-sdv-platform', source: skuSource('§1; §2, Sheet 12'),
};

export const reusableFoundation: FoundationItem[] = [
  {id: 'dgridriscv-core-architecture', title: 'Processor and digital building blocks', description: 'A common RISC-V foundation and reusable digital IP can serve multiple product architectures.', boundary: 'Reuse does not make every chip the same implementation, frequency or safety configuration.', source: strategySource('§5: Canonical Processor Architecture')},
  {id: '198-day-loop', title: 'Implementation method', description: 'In-house engineering, open-source tools and shared MPW fabrication are the development method.', boundary: 'A reusable flow is not an achieved cost multiplier or a guaranteed turnaround.', source: strategySource('§§2–3')},
];
export const specialistBlocks: FoundationItem[] = [
  {id: 'power-analog', title: 'Power and analog', description: 'References, converters, high-voltage devices and protection structures must meet the socket’s physical requirements.', boundary: 'Analog and high-voltage work can require additional silicon cycles.', source: strategySource('§3: Two-Speed Development Reality')},
  {id: 'rf-interface', title: 'RF and exposed interfaces', description: 'Radar RF uses a SiGe front end; harness interfaces require their own fault and ESD protection.', boundary: 'Digital IP portability does not establish analog or RF portability.', source: skuSource('§2, Sheets 6 and 8; §3.3')},
  {id: 'sip-packaging', title: 'Proposed organic-substrate integration', description: 'The SiP concept uses a four-layer organic BT-resin, 15 × 15 mm BGA package; a later compute die would join by flip-chip.', boundary: 'A proposed multi-die architecture, distinct from DG32’s 9 × 9 mm QFN-64. Package qualification remains separate.', source: skuSource('§3.5: Sheet 13')},
];
export const equipmentStrategy: FoundationItem = {id: 'boxes-not-chips', title: 'Start with the equipment maker.', description: 'The proposed route to market is silicon inside converters, actuators, displays and line-replaceable units. The equipment requirement defines the socket.', boundary: 'A procurement strategy is not an awarded order, guaranteed volume or automatic eligibility.', source: strategySource('§6: Boxes, Not Chips')};

export const qualificationGates: QualificationGate[] = [
  {id: 'design', title: 'Design', work: 'Define the function, electrical boundaries and intended safe state.', evidence: 'Architecture, requirements and interface documents.', boundary: 'A specification is not a tested device.', source: skuSource('§§1–2')},
  {id: 'implementation', title: 'Implementation', work: 'Simulate behavior and inspect the placed-and-routed implementation.', evidence: 'Simulation results and post-route timing, each labelled separately.', boundary: 'Neither is a measurement from manufactured silicon.', source: {title: 'DG32-LITE Architecture Guide', path: '/downloads/dg32-lite-architecture-guide.md', section: 'Control loop and safety core'}},
  {id: 'fabrication', title: 'MPW fabrication', work: 'Prepare a tapeout for a shared factory run.', evidence: 'Run-specific submission and fabrication records.', boundary: 'The 198-day model is 30 digital days plus 168 physical days: analytic planning, not a current completion record.', source: strategySource('§3: The 198-Day Dual-Clock Silicon Loop')},
  {id: 'bring-up', title: 'Bring-up', work: 'Exercise the manufactured part, its boot path, interfaces and fault behavior.', evidence: 'Bench records from identified devices.', boundary: 'A dated shuttle plan does not prove returned or working silicon.', source: strategySource('§3')},
  {id: 'characterisation', title: 'Characterisation', work: 'Measure operating limits and physical behavior across relevant conditions.', evidence: 'Device measurements, including analog and high-voltage behavior.', boundary: 'Analog and protection structures cannot be validated by digital simulation alone.', source: strategySource('§3: Two-Speed Development Reality')},
  {id: 'qualification', title: 'Qualification', work: 'Complete the screening and approval required by the intended equipment.', evidence: 'Applicable test reports and approval records.', boundary: 'A safety mechanism, test chip or tapeout is not a product qualification.', source: strategySource('§2: Testing & Approval; §8: Qualification & Approval')},
];

export const processRoadmap: RoadmapStep[] = [
  {id: 'mature-foundation', title: '130 / 180 nm foundation', purpose: 'Start with mature-node power, interface, sensing and control architectures.', boundary: 'Architecture scope; it does not establish availability across the catalogue.', source: skuSource('§2; §3.6')},
  {id: 'selective-scaling', title: 'Selective logic scaling', purpose: 'Use smaller logic processes where channel count and DSP throughput justify the change.', boundary: 'The source lists 90/55 nm in its matrix and adds 45 nm in the detailed roadmap; no node is promised here.', source: skuSource('§3.6: Sheet 14')},
  {id: 'compute-integration', title: 'Later 28 nm compute', purpose: 'Add compute capability alongside mature-node physical interfaces.', boundary: 'A roadmap stage, not a capability claimed for the 130 nm parts.', source: skuSource('§2, Sheets 11–14; §3.5')},
];
export const manufacturingRoadmap: RoadmapStep[] = [
  {id: 'skywater', title: 'SkyWater · 130 nm', purpose: 'Open-PDK development and shared MPW prototyping route.', boundary: 'A named route does not establish current product qualification or completed fabrication.', source: strategySource('§4: Phase 1')},
  {id: 'ihp', title: 'IHP · SG13G2', purpose: 'SiGe capability for the radar front-end architecture.', boundary: 'A specialist process route, not a drop-in second source for every design.', source: strategySource('§4: Phase 2')},
  {id: 'scl', title: 'SCL Mohali · 180 nm', purpose: 'Intended domestic fabrication route, with packaging and screening in the plan.', boundary: 'Porting and qualification remain work; completed domestic qualification is not claimed.', source: strategySource('§4: Phase 3')},
];

export const stopRules: StopRule[] = [
  {id: 'S1', title: 'Meter commitment', condition: 'No binding Ripple Metering letter by the Chip 2 factory-order cutoff.', response: 'Pause Chip 2 for one cycle and reallocate its capital to Chips 1 and 3.', source: strategySource('§8: Stop Rule S1')},
  {id: 'S2', title: 'Repeated screening failure', condition: 'Chip 6 fails military screening twice.', response: 'Defer all forward defence revenue projections by 12 months, updating materials within 30 days.', source: strategySource('§8: Stop Rule S2')},
  {id: 'S3', title: 'Commodity economics', condition: 'At the FY29 review, delivered Chinese component prices fall below bare manufacturing cost.', response: 'Exit ceiling-fan drivers and focus on two-wheelers and proprietary modules.', source: strategySource('§8: Stop Rule S3')},
  {id: 'S4', title: 'Domestic-fab delay', condition: 'SCL Mohali slips by more than two manufacturing cycles.', response: 'Disclose the delay and use the SkyWater and IHP routes for production plans.', source: strategySource('§8: Stop Rule S4')},
];
export const governanceBoundary = 'These are stated commitments and planned responses, not evidence that a forecast, qualification or manufacturing transfer has been achieved.';
