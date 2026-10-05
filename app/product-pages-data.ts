/** Product pages (/products/<slug>), one record per portfolio part. Authored from the SKU Architecture
 *  Compendium (Technical Annex v3) chapters under docs/v6/story-pack-depth.md §8:
 *  - published: the job, the physical requirement, block architecture, architecture-target figures and
 *    the engineering questions each sheet asks of itself;
 *  - softened: standards appear only as "designed toward", never as held or met;
 *  - left out: margins, prices, market sizes, "moat" language and anything in claims.ts `withheld`.
 *  Every figure here is an architecture target from the named sheet, not a datasheet value. Where a
 *  sheet disagrees with an implemented part (SKU-4 vs DG32-LITE) or with its own standard (SKU-5), the
 *  `reconcile` note says so on the page. Status and evidence come from applications-story-data.ts, so
 *  /applications, /evidence and these pages cannot disagree about a chip. */
import type {ProductId} from './applications-story-data';

export type ProductBlock = {name: string; items: string[]};
export type ProductPage = {
  id: ProductId; slug: string; portfolioId: string;
  headline: string; lede: string;
  physics: {requirement: string; consequence: string}[];
  blocks: ProductBlock[];
  blockNote: string;
  specs: [string, string][];
  /** The three spec rows the hero carries beside the part, as deepgridsemi.com's product pages do. */
  heroSpecs: string[];
  /** Three performance-highlight tiles: [figure, label, the spec row it comes from]. Checked: the figure's
   *  number appears in that row. */
  highlights: [string, string, string][];
  /** Parts built from more than one die: the hero draws each die with its own blocks (sources: blocks above). */
  dies?: {name: string; blocks: string[]}[];
  designedToward: string[];
  questions: {title: string; question: string}[];
  reconcile?: string;
  related: {slug: string; why: string}[];
  deeper?: {label: string; href: string}[];
};

export const productPages: ProductPage[] = [
  {
    id: 'sku1', slug: 'sku-1', portfolioId: 'sku-1',
    heroSpecs: ['High-voltage rail', 'Control engine', 'PWM'],
    highlights: [['120 V', 'Top of the high-voltage rail', 'High-voltage rail'], ['< 1 µs', 'Hardware PID loop', 'Control engine'], ['200 kHz', 'PWM, seven channels', 'PWM']],
    headline: 'One die runs the motor and drives its power stage.',
    lede: 'SKU-1 collapses the usual two-chip motor drive, a microcontroller plus a separate gate pre-driver, into one 130 nm BCD die. Field-oriented control runs in hardware, so the control loop does not wait on firmware, and the same die drives the high-voltage stage.',
    physics: [
      {requirement: 'The pre-driver rail spans 5 V to 120 V.', consequence: 'That needs BCD power devices on the same die as the logic; thin-oxide advanced nodes cannot hold the voltage.'},
      {requirement: 'A 16-bit ADC shares the die with a switching half-bridge.', consequence: 'Fast switching edges couple into the substrate, so the analog section needs guard rings and separate grounds.'},
      {requirement: 'The control loop must close in under a microsecond.', consequence: 'PID, CORDIC and the Clarke and Park transforms run as a hardware datapath, not as firmware.'},
    ],
    blocks: [
      {name: 'Sensor feedback', items: ['Hall, quadrature or encoder input', 'Angle engine', 'Three current-sense amplifiers']},
      {name: 'Mixed signal', items: ['16-bit synchronised ADC (phase, bus, temperature)', 'Four DACs', 'Temperature sense']},
      {name: 'Control datapath', items: ['Hardware PID, under 1 µs', 'CORDIC rectangular to polar', 'Inverse Clarke and Park', 'Sine or trapezoid lookup']},
      {name: 'Host', items: ['DGridRiscV RV32IM at 200 MHz', 'Timers and watchdog', 'I²C, UART, SPI, CAN-FD, JTAG']},
      {name: 'Power path', items: ['Buck-boost pre-driver rail, 5 to 120 V', 'Seven PWM channels', 'Three-phase pre-drivers', 'Star or delta switching']},
    ],
    blockNote: 'Signal flows from the position and current sensors, through the hardware control datapath, to the gate drive. The processor configures and supervises; it does not sit in the loop.',
    specs: [
      ['Process', '130 nm BCD / high-voltage CMOS'],
      ['High-voltage rail', '5 V to 120 V, buck-boost pre-driver'],
      ['Processor', 'DGridRiscV (RV32IM) at 200 MHz'],
      ['Memory', '32 KB SRAM (to 256 KB), 256 KB ReRAM (to 1 MB)'],
      ['Conversion', '16-bit synchronised ADC, three current-sense amplifiers'],
      ['Control engine', 'Hardware PID under 1 µs, CORDIC, inverse Clarke and Park'],
      ['PWM', 'Seven channels to 200 kHz (six-switch bridge plus one auxiliary)'],
    ],
    designedToward: ['AEC-Q100 Grade 0', 'ISO 26262 ASIL-B/C', 'UL94'],
    questions: [
      {title: 'Substrate isolation', question: 'Which guard-ring and deep-trench structures keep 10 V/ns switching edges on the 120 V half-bridge out of the 16-bit ADC?'},
      {title: 'Loop deadline under bus load', question: 'Does the CORDIC datapath still meet its 1 µs deadline while the processor runs CAN-FD traffic over the same bus?'},
      {title: 'ReRAM at temperature', question: 'Retention falls quickly above 125 °C junction. What ECC and scrubbing keep stored parameters intact in continuous operation?'},
      {title: 'Shoot-through', question: 'How fine is dead-time insertion, and does it hold as gate thresholds drift with temperature?'},
    ],
    related: [{slug: 'sku-4', why: 'Supervises the drive and can shut it down'}, {slug: 'd100', why: 'Drives the flight motors through the ESC path'}],
    deeper: [{label: 'How DG32 budgets a control loop', href: '/technology/control-loop'}],
  },
  {
    id: 'sku2', slug: 'sku-2', portfolioId: 'sku-2',
    heroSpecs: ['Front end', 'Accuracy class', 'Always-on domain'],
    highlights: [['24-bit', 'Six-channel sigma-delta front end', 'Front end'], ['0.5S', 'Accuracy class', 'Accuracy class'], ['< 2 µW', 'Always-on domain', 'Always-on domain']],
    headline: 'A meter that keeps measuring, and keeps its record, when the mains is gone.',
    lede: 'SKU-2 puts a six-channel 24-bit sigma-delta front end, the metrology engine, cryptography and an always-on clock domain on one 130 nm CMOS die, so a meter needs one chip for measurement, security and its own time base.',
    physics: [
      {requirement: 'Class 0.5S accuracy across a 1000:1 current range.', consequence: 'A sigma-delta converter with low flicker noise and stable references, calibrated once for a long service life.'},
      {requirement: 'The clock and tamper log must survive outages on a backup cell.', consequence: 'An isolated always-on domain drawing under 2 µW, separate from the 200 MHz core.'},
      {requirement: 'Open 130 nm processes have no embedded flash.', consequence: 'Code lives in ROM, ECC SRAM and encrypted external QSPI, or in SCL non-volatile memory where available.'},
    ],
    blocks: [
      {name: 'Metrology', items: ['DG-AFE6: six 24-bit sigma-delta channels', 'sinc³ decimation, OSR 256', 'Active, reactive and apparent power, harmonics to the 15th']},
      {name: 'Compute and security', items: ['DGridRiscV at 200 MHz', 'Four-channel DMA', 'AES-256 and SHA engine, secure boot, tamper key erase']},
      {name: 'Always-on domain', items: ['Power management and RTC, under 2 µW', '32.768 kHz crystal, 2.2 to 3.6 V backup', 'Tamper sense']},
      {name: 'Peripherals', items: ['DLMS/COSEM UART', 'Segment LCD, 4 × 40', 'Optical port', 'Case-open switch']},
    ],
    blockNote: 'Current and voltage enter the six converters, are decimated and turned into energy figures, and are stored and signed by the security engine. The always-on domain keeps time and tamper state when everything else is off.',
    specs: [
      ['Process', '130 nm CMOS'],
      ['Front end', 'Six-channel 24-bit sigma-delta, sinc³ OSR 256'],
      ['Accuracy class', 'Class 0.5S target (P, Q, S, THD to 15th harmonic)'],
      ['Processor', 'DGridRiscV at 200 MHz, AHB-Lite multilayer bus'],
      ['Always-on domain', 'Under 2 µW, 32.768 kHz, 2.2 to 3.6 V backup'],
      ['Security', 'AES-256, SHA, secure boot, tamper key erase'],
      ['Interfaces', 'DLMS/COSEM UART, 4 × 40 segment LCD, optical port'],
    ],
    designedToward: ['IEC metering accuracy Class 0.5S'],
    questions: [
      {title: 'Accuracy over a lifetime', question: 'How does the front end hold Class 0.5S across a 1000:1 current range without drift over a fifteen-year service life?'},
      {title: 'Magnetic and DC tamper', question: 'When a strong magnet or injected DC tries to defeat metrology, how is the imbalance detected and measurement preserved?'},
      {title: 'Blackout retention', question: 'What leakage crosses the isolation cells into the always-on domain during a thirty-day outage on the backup cell?'},
      {title: 'Non-volatile memory', question: 'Which code-storage option ships first: ROM with encrypted QSPI, or SCL non-volatile memory?'},
    ],
    related: [{slug: 'sku-5', why: 'The wired RS-485 meter bus'}, {slug: 'sku-6', why: 'Brownout supervision'}],
  },
  {
    id: 'sku3', slug: 'sku-3', portfolioId: 'sku-3',
    heroSpecs: ['Input', 'Rails', 'Upset hardening'],
    highlights: [['100 V', 'Input spike', 'Input'], ['3 A', 'Largest rail, at 3.3 V', 'Rails'], ['12 ppm/°C', 'Reference drift', 'Reference']],
    headline: 'Turn a 28 V equipment bus into four sequenced, supervised rails.',
    lede: 'SKU-3 is a high-reliability power management IC for avionics and vehicle electronics: a pre-buck regulator takes the 28 V bus, four regulators sequence the board supplies, and a hardened state machine keeps the sequence correct under radiation.',
    physics: [
      {requirement: 'The input sees 4.5 to 40 V continuous, 80 V surges and 100 V spikes.', consequence: 'A 180 nm BCD process with 30 V power devices and an input stage that clamps without thermal runaway.'},
      {requirement: 'A 12 ppm/°C reference from −55 to +125 °C.', consequence: 'A curvature-corrected bandgap with large matched resistors, a mature-node strength.'},
      {requirement: 'A single particle strike must not corrupt the power sequence.', consequence: 'Dual interlocked latches and triple-modular redundancy on the sequencer state machine.'},
    ],
    blocks: [
      {name: 'Input conditioning', items: ['EMI filter and transient suppression', 'Ideal diode and inrush control', 'Under- and over-voltage lockout']},
      {name: 'Pre-regulator', items: ['Peak-current-mode synchronous buck, 500 kHz to 2 MHz', 'Type-III compensation', '30 V power stage']},
      {name: 'Rails', items: ['5.0 V buck, 2 A', '3.3 V buck, 3 A', '1.8 V LDO, 500 mA', '1.2 or 0.9 V LDO, 300 mA', 'Each with window monitor, current limit and power-good']},
      {name: 'Reference and telemetry', items: ['Brokaw bandgap, 12 ppm/°C', '10-bit 500 kSPS SAR ADC on voltage, current and temperature']},
      {name: 'Supervision', items: ['Four-step sequencer, triple-redundant', 'Watchdog', 'Single-event-upset hardened latches']},
    ],
    blockNote: 'Power flows from the bus through conditioning and the pre-regulator into four rails; every rail reports back through its window monitor, and the hardened sequencer decides when each one may start.',
    specs: [
      ['Process', '180 nm BCD (SCL Mohali production); 130 nm 20 V devices for prototyping'],
      ['Input', '4.5 to 40 V continuous; 28 V nominal; 80 V surge; 100 V spike'],
      ['Pre-regulator', 'Synchronous buck, peak current mode, 500 kHz to 2 MHz'],
      ['Rails', '5 V 2 A, 3.3 V 3 A, 1.8 V 500 mA, 1.2/0.9 V 300 mA'],
      ['Reference', 'Curvature-corrected bandgap, 12 ppm/°C, −55 to +125 °C'],
      ['Telemetry', '10-bit 500 kSPS ADC over SPI'],
      ['Upset hardening', 'DICE latches, TMR sequencer'],
    ],
    designedToward: ['DO-160 sections 16 and 17', 'MIL-STD-704F', 'MIL-STD-1275D', 'MIL-STD-461G', 'MIL-STD-883 Class B'],
    questions: [
      {title: '100 V surge withstand', question: 'During a 100 V, 50 ms load-dump surge, how does the input stage clamp without thermal runaway in the pass devices?'},
      {title: 'Loop stability', question: 'Does the regulator keep more than 60° phase margin and 10 dB gain margin with ceramic or tantalum output capacitors across −55 to +125 °C?'},
      {title: 'Cross-rail noise', question: 'How much 3.3 V switching ripple reaches the 1.2 V converter supply through the shared reference?'},
      {title: 'Upset spacing', question: 'What layout spacing keeps one heavy-ion strike from flipping two of the three voting bits?'},
    ],
    related: [{slug: 'sku-6', why: 'Independently supervises the rails it produces'}, {slug: 'sku-4', why: 'Powers the safety MCU and its memory'}, {slug: 'sku-8', why: 'Supplies the display bias rails'}],
  },
  {
    id: 'sku4', slug: 'sku-4', portfolioId: 'sku-4',
    heroSpecs: ['Lockstep', 'Fault response', 'Package (DG32-LITE)'],
    highlights: [['39', 'Cycles from injected fault to FAULT_N', 'Fault response'], ['2', 'Cycles of lockstep skew', 'Lockstep'], ['50 MHz', 'DG32-LITE clock', 'Clock (DG32-LITE)']],
    headline: 'Two cores, two cycles apart, and a comparator that answers in hardware.',
    lede: 'SKU-4 is the safety microcontroller of the portfolio and the one part with detailed engineering evidence: DG32-LITE implements it. A second core runs the same instructions two cycles behind the first; when their committed results differ, a comparator latches the cause and drives the fault pin without waiting for firmware.',
    physics: [
      {requirement: 'A transient that hits both cores at once must still be caught.', consequence: 'A two-cycle skew between the cores, so the same disturbance lands on different instructions.'},
      {requirement: 'The fault response cannot depend on the processor that failed.', consequence: 'The comparator, latch and fault pin are hardware; the safe state does not run through firmware.'},
      {requirement: 'Safety logic is small, deterministic and long-lived.', consequence: 'A mature 130 nm CMOS process with predictable timing suits it better than a dense node.'},
    ],
    blocks: [
      {name: 'Lockstep domain', items: ['Primary core', 'Checker core, two cycles behind', 'Retire-stage comparator', 'Sticky fault latch and FAULT_N']},
      {name: 'Memory', items: ['ECC on memory and bus', 'Boot from ROM (DG32-LITE: 64 KB ROM, 32 KB SRAM, no on-die flash)']},
      {name: 'System', items: ['Interrupt controller', 'DMA', 'Windowed safety watchdog', 'Fault-injection register for proof testing']},
      {name: 'Control I/O', items: ['PWM, ADC, CORDIC and encoder blocks on DG32-LITE', 'UART, SPI, I²C, QSPI']},
    ],
    blockNote: 'Both cores read the same inputs; the checker trails by two cycles. Every committed store is compared, and the first mismatch is latched with its cause before FAULT_N drives the gate-driver enable.',
    specs: [
      ['Process', '130 nm CMOS'],
      ['Lockstep', 'Two cores, two-cycle skew, comparator on every committed store'],
      ['Fault response', '39 cycles from injected fault to latched FAULT_N (DG32-LITE, simulated)'],
      ['Clock (DG32-LITE)', '50 MHz, one domain'],
      ['Memory (DG32-LITE)', '64 KB boot ROM, 32 KB dual-port SRAM, external QSPI'],
      ['Package (DG32-LITE)', 'QFN-64, 9 × 9 mm'],
    ],
    designedToward: ['ISO 26262 ASIL-D (a path, not a certificate)', 'IEC 61508 SIL 3'],
    reconcile: 'The annex sheet describes the SKU-4 family target: 200 MHz cores, 1 MB of flash and two CAN-FD ports. DG32-LITE, the implemented part, runs at 50 MHz, boots from ROM and has no on-die flash or CAN-FD. Figures above marked DG32-LITE are the implemented part; the rest of the sheet is the family direction.',
    questions: [
      {title: 'Skewed reads', question: 'How does the delay buffer make both cores see identical read data from asynchronous peripherals without stalling?'},
      {title: 'Diagnostic coverage', question: 'Which built-in self-tests run at power-on and in periodic windows to reach the single-point fault metric a safety case needs?'},
      {title: 'Interrupt alignment', question: 'How is an asynchronous interrupt taken on the same logical cycle by both skewed pipelines?'},
      {title: 'Safe state without software', question: 'What hardware interlock forces the PWM outputs to a safe state the moment FAULT_N asserts?'},
    ],
    related: [{slug: 'sku-1', why: 'The motor drive it supervises'}, {slug: 'sku-9', why: 'Reuses the lockstep pattern in its safety island'}, {slug: 'sku-6', why: 'Holds it in reset until the rails are good'}],
    deeper: [
      {label: 'Follow the fault path', href: '/technology/safety'},
      {label: 'The control-loop budget', href: '/technology/control-loop'},
      {label: 'The die, block by block', href: '/technology/die'},
      {label: 'Pinout and package', href: '/technology/package'},
    ],
  },
  {
    id: 'sku5', slug: 'sku-5', portfolioId: 'sku-5',
    heroSpecs: ['RS-485', 'CAN-FD', 'Protection target'],
    highlights: [['256', 'RS-485 nodes', 'RS-485'], ['8 Mbps', 'CAN-FD data phase', 'CAN-FD'], ['±15 kV', 'Pin protection', 'Protection target']],
    headline: 'The link at every node of an industrial or vehicle bus.',
    lede: 'SKU-5 is a dual-channel line driver, RS-485 and CAN-FD, built where a bus transceiver belongs: thick-oxide 5 V output devices, hysteresis receivers, failsafe biasing and heavy ESD protection. Every differentiating block is analog; the logic is a thin skin.',
    physics: [
      {requirement: 'Bus pins face miswiring, ground shifts and electrostatic discharge.', consequence: 'Thick-oxide 5 V LDMOS outputs and large ESD structures, which mature 130 nm offers and advanced nodes do not.'},
      {requirement: 'Reach and node count depend on edge timing, not headline bit rate.', consequence: 'Trimmed slew control and a fixed propagation budget: 20 ns driver, 50 ns receiver.'},
      {requirement: 'A dead or open bus must read as a known state.', consequence: 'Failsafe bias holds idle as recessive, with open, short and idle detection.'},
    ],
    blocks: [
      {name: 'Logic interface', items: ['1.8 V core, level shift to 5 V', 'TXD, RXD, enable and standby']},
      {name: 'Driver', items: ['Slew-shaped pre-driver, 3 V/ns trimmed', 'Differential push-pull, thick-oxide LDMOS']},
      {name: 'Receiver', items: ['Hysteresis comparator, 30 mV', '50 ns propagation', 'Failsafe bias and bus-state detection']},
      {name: 'Protection', items: ['Thermal and short-circuit shutdown at 150 °C', 'RS-485 enable interlock', 'CAN transmit timeout', 'ESD structures on A/B and CANH/CANL']},
      {name: 'Local supply', items: ['3.3 V LDO and bandgap from the 5 V bus', '1.8 V core rail', '40 MHz reference']},
    ],
    blockNote: 'Two channels share one block set: logic in, shaped and driven onto the bus, received back through a hysteresis comparator, with protection around every pin that leaves the board.',
    specs: [
      ['Process', '130 nm with 5 V thick-oxide LDMOS'],
      ['RS-485', 'Half duplex, up to 256 nodes; 20 Mbps over short runs, about 83 kbps at 1.2 km'],
      ['CAN-FD', '8 Mbps data phase, ISO 11898-2'],
      ['Common mode', 'RS-485 −7 to +12 V (TIA/EIA-485); CAN ±12 V as drawn'],
      ['Timing', '20 ns driver, 50 ns receiver; 70 ns loop delay'],
      ['Protection target', '±15 kV, stated per test standard'],
      ['Standby', 'Under 8 µA'],
    ],
    designedToward: ['TIA/EIA-485', 'ISO 11898-2', 'IEC 61000-4-2 (system level) and HBM (component level), each rated separately'],
    reconcile: 'The annex sheet pairs a 20 Mbps rate with a 1.2 km reach and quotes “IEC 61000-4-2 ±15 kV HBM” and “±7 V” common mode. Rate and reach are two operating points, not one; IEC 61000-4-2 and HBM are different tests; and TIA/EIA-485 specifies −7 to +12 V. This page states the corrected forms.',
    questions: [
      {title: 'ESD on an open process', question: 'Which ESD structures have silicon data at ±15 kV? This needs a dedicated test chip; it cannot be inferred from shared tiles.'},
      {title: 'Unit load', question: 'Are 256 nodes reached with eighth-unit-load receivers, and at what input impedance?'},
      {title: 'First pin-compatible target', question: 'Which discontinued interface part is the first drop-in replacement?'},
    ],
    related: [{slug: 'sku-9', why: 'Physical bus links for the zonal gateway'}, {slug: 'sku-2', why: 'The wired meter bus'}],
  },
  {
    id: 'sku6', slug: 'sku-6', portfolioId: 'sku-6',
    heroSpecs: ['Rails', 'Deglitch', 'Watchdog'],
    highlights: [['8 µs', 'Deglitch filter', 'Deglitch'], ['500 µV', 'Comparator offset, at most', 'Comparator offset'], ['0.1%', 'Threshold-network matching', 'Threshold network']],
    headline: 'Watch four rails, ignore the switching noise, latch the real fault.',
    lede: 'SKU-6 supervises four supply rails with chopper-stabilised comparators and matched resistor ladders, filters out converter noise with an 8 µs deglitch, and latches a fault the system cannot ignore. It is planned as the first part through the MIL-STD-883 screening flow.',
    physics: [
      {requirement: 'Thresholds accurate to a fraction of a percent.', consequence: 'Comparators with offset under 500 µV and 0.1%-matched polysilicon dividers trimmed once.'},
      {requirement: 'A buck converter’s ripple must not trip it; a real brownout must.', consequence: 'An 8 µs digital deglitch window between the comparator and the latch.'},
      {requirement: 'A reference stable over the military temperature range.', consequence: 'A curvature-corrected bandgap at 10 ppm/°C.'},
    ],
    blocks: [
      {name: 'Sense chains, ×4', items: ['0.1%-matched resistor divider', 'Chopper-stabilised comparator', '8 µs deglitch counter']},
      {name: 'Reference and timebase', items: ['Bandgap, 10 ppm/°C', 'One-time-programmable trim', '1 MHz oscillator']},
      {name: 'Watchdog', items: ['Windowed timer, 100 ms to 1.6 s', 'Watchdog input pin']},
      {name: 'Outputs', items: ['Latched open-drain FAULT_N', 'RESET_N with 200 ms delay', 'Manual reset']},
    ],
    blockNote: 'Each rail runs through its own divider, comparator and deglitch counter into one fault matrix; the watchdog adds a timing check on the processor, and both end at a latched fault and a delayed reset.',
    specs: [
      ['Process', '130 nm CMOS prototype, 180 nm production'],
      ['Rails', '5.0, 3.3, 1.8 and 1.2/0.9 V adjustable'],
      ['Comparator offset', 'Under 500 µV, chopper stabilised'],
      ['Threshold network', '0.1%-matched polysilicon, OTP trim'],
      ['Deglitch', '8 µs digital filter'],
      ['Reference', '10 ppm/°C bandgap'],
      ['Watchdog', 'Windowed, 100 ms to 1.6 s'],
      ['Outputs', 'Latched FAULT_N, RESET_N after 200 ms'],
    ],
    designedToward: ['MIL-STD-883K Class B screening flow'],
    questions: [
      {title: 'Deglitch window', question: 'Is 8 µs long enough to ignore converter noise and short enough to stop memory corruption before reset?'},
      {title: 'Chopper ripple', question: 'What filtering removes the chopper’s own ripple before the fault latch?'},
      {title: 'Ladder ageing', question: 'How far does polysilicon drift move the 0.1% ratio over twenty years at high temperature?'},
      {title: 'Why this part first', question: 'What does taking SKU-6 through screening first establish for every part that follows?'},
    ],
    related: [{slug: 'sku-3', why: 'Cross-checks the rails the PMIC produces'}, {slug: 'sku-4', why: 'Holds the safety MCU in reset until power is good'}],
  },
  {
    id: 'sku7', slug: 'sku-7', portfolioId: 'sku-7',
    dies: [{name: 'SiGe', blocks: ['SiGe die: transmit', 'SiGe die: receive']}, {name: 'CMOS', blocks: ['CMOS die: digitise', 'CMOS die: detect']}],
    heroSpecs: ['Sweep', 'Array', 'Processing'],
    highlights: [['4 GHz', 'Chirp sweep', 'Sweep'], ['3.75 cm', 'Range resolution', 'Sweep'], ['64', 'Tracked targets', 'Processing']],
    headline: 'Two dies, because 77 GHz and signal processing want different silicon.',
    lede: 'SKU-7 is a 4D imaging radar split across a silicon-germanium transceiver for the 77 GHz front end and a 130 nm CMOS die for sampling, FFTs and target detection. Its own sheet states the risk plainly: the SiGe front end has no FPGA equivalent, so it is proven on silicon or not at all.',
    physics: [
      {requirement: 'Gain at 77 GHz.', consequence: 'SiGe heterojunction transistors with transition frequency above 350 GHz; standard CMOS lacks the margin.'},
      {requirement: 'Range resolution of 3.75 cm.', consequence: 'A 4 GHz chirp sweep with a linear, low-noise frequency ramp.'},
      {requirement: 'Fast converters and FFTs next to sensitive RF.', consequence: 'The converters sit on the CMOS die, across a package boundary from the RF.'},
    ],
    blocks: [
      {name: 'SiGe die: transmit', items: ['40 MHz crystal, ramp generator', 'Fractional-N PLL and 38.5 GHz VCO', 'Doubler to 77 GHz, two power amplifiers']},
      {name: 'SiGe die: receive', items: ['Four channels: LNA, mixer, IF amplifier, anti-alias filter']},
      {name: 'CMOS die: digitise', items: ['Four 12-bit 40 MSPS converters', 'Hann or Blackman windowing']},
      {name: 'CMOS die: detect', items: ['1024-point range FFT, Doppler FFT', '512 KB range-Doppler memory', 'CFAR detection, angle estimation', 'Tracker, up to 64 targets']},
    ],
    blockNote: 'The chirp leaves the SiGe die, its reflections return through four receive chains, cross the die boundary as IF signals, and are digitised, transformed and turned into tracked targets on the CMOS die.',
    specs: [
      ['RF process', '130 nm SiGe BiCMOS (IHP SG13G2), fT above 350 GHz'],
      ['Baseband process', '130 nm CMOS at 200 MHz'],
      ['Array', 'Two transmit, four receive (MIMO)'],
      ['Sweep', '4 GHz in the 76 to 81 GHz band; 3.75 cm range resolution'],
      ['Conversion', 'Four 12-bit 40 MSPS ADCs'],
      ['Processing', 'Range and Doppler FFT, CFAR, angle estimation, 64-target tracker'],
      ['Interfaces', 'CAN-FD, 100BASE-T1, MIPI CSI-2'],
    ],
    designedToward: ['ISO 26262 ASIL-B', 'DO-160G', 'MIL-STD-883K'],
    questions: [
      {title: 'The die boundary', question: 'What substrate transmission lines keep the IF signal clean between the SiGe and CMOS dies?'},
      {title: 'Chirp linearity', question: 'Can the ramp hold under 50 kHz rms error across 4 GHz without ghost targets?'},
      {title: 'Silicon risk', question: 'With no FPGA stand-in for the front end, how is risk reduced across IHP wafer runs?'},
      {title: 'Co-existence', question: 'On a mast beside UHF and VHF radios, what shielding keeps local-oscillator harmonics out of them?'},
    ],
    related: [{slug: 'sku-9', why: 'Sends target data to the zonal gateway'}, {slug: 'd100', why: 'Obstacle detection for autonomous flight'}],
  },
  {
    id: 'sku8', slug: 'sku-8', portfolioId: 'sku-8',
    heroSpecs: ['Output swing', 'Column outputs', 'Safety'],
    highlights: [['12 V', 'Column output swing', 'Output swing'], ['14-bit', 'Temperature-fed gamma', 'Gamma'], ['2 frames', 'Freeze alert', 'Safety']],
    headline: 'A cockpit display driver that notices when the picture freezes.',
    lede: 'SKU-8 integrates a timing controller and a 1280-channel 10-bit source driver on one 130 nm high-voltage die, with temperature-compensated gamma for sunlight and a frame-freeze self-test that flags a frozen display within two frames.',
    physics: [
      {requirement: 'Panel columns swing 0 to 12 V and row drivers need 24 V.', consequence: 'Thick-oxide high-voltage amplifiers and level shifters on a 130 nm HV process; dense nodes cannot reach these voltages.'},
      {requirement: 'Contrast must hold at +85 °C in direct sun.', consequence: 'An on-die temperature sensor feeding a 14-bit gamma table.'},
      {requirement: 'A frozen display in a cockpit is a hazard, not a glitch.', consequence: 'Frame-by-frame CRC comparison in hardware.'},
    ],
    blocks: [
      {name: 'Video input', items: ['Dual LVDS, 655 Mbps per lane', 'Four-lane MIPI DSI', 'Four-line buffer']},
      {name: 'Pixel pipeline', items: ['De-gamma and colour conversion', '14-bit gamma table', 'Dither']},
      {name: 'Timing and safety', items: ['Programmable timing controller', 'Frame-freeze self-test', '100 MHz PLL']},
      {name: 'Column drive', items: ['1280 10-bit DACs', '0 to 12 V output amplifiers', 'Charge-sharing precharge']},
      {name: 'Row and backlight', items: ['24 V gate-driver level shift', 'VCOM generator', 'Ambient light input']},
    ],
    blockNote: 'Video arrives over LVDS or DSI, is corrected and dithered, timed by the controller and checked frame by frame, then driven onto 1280 columns by the high-voltage amplifiers.',
    specs: [
      ['Process', '130 nm high-voltage CMOS'],
      ['Resolution', 'SXGA 1280 × 1024 at 60 Hz; WXGA and Full HD variants'],
      ['Column outputs', '1280 × 10-bit DACs with charge-sharing precharge (about 40% less drive power)'],
      ['Output swing', '0 to 12 V; 24 V gate level shift'],
      ['Inputs', 'Dual LVDS, MIPI DSI, parallel RGB'],
      ['Gamma', '14-bit table with temperature feedback'],
      ['Safety', 'Frame-freeze self-test, alert within two frames'],
    ],
    designedToward: ['ISO 26262 ASIL-B', 'MIL-STD-810G', 'DEF-STAN 00-35'],
    questions: [
      {title: 'Why 130 nm', question: 'Which voltages force the driver onto a high-voltage process rather than a dense digital one?'},
      {title: 'Charge sharing', question: 'How much energy does precharge between adjacent columns recover during full-screen video?'},
      {title: 'Freeze detection', question: 'How do successive frame CRCs alert the operator within two frames if the image stops updating?'},
      {title: 'Heat and contrast', question: 'How does the gamma table track temperature to hold contrast at +85 °C?'},
    ],
    related: [{slug: 'sku-3', why: 'Generates the display bias rails'}, {slug: 'sku-9', why: 'Receives the graphics stream in a vehicle'}],
  },
  {
    id: 'sku9', slug: 'sku-9', portfolioId: 'sku-9',
    heroSpecs: ['Networking', 'Power', 'Safety island'],
    highlights: [['16', 'Smart electronic fuses', 'Power'], ['8 × CAN-FD', 'Beside TSN, LIN and FlexRay', 'Networking'], ['2-cycle', 'Lockstep safety island', 'Safety island']],
    headline: 'The zonal edge of a software-defined vehicle, not its central computer.',
    lede: 'SKU-9 bridges in-vehicle networks to local loads in one zone: sixteen smart electronic fuses, a time-sensitive Ethernet switch, a lockstep safety island and a hardware security module. Its sheet draws the line itself: the central multi-gigahertz computer is a sub-10 nm part and is not claimed.',
    physics: [
      {requirement: 'Switch and protect 12 V and 48 V loads in a harness.', consequence: 'BCD power devices for the smart fuses alongside the logic.'},
      {requirement: 'Brake-by-wire messages need bounded latency on a shared link.', consequence: 'A time-aware shaper (802.1Qbv) and precision time sync (802.1AS) in hardware.'},
      {requirement: 'Safety-critical and comfort functions share one chip.', consequence: 'A lockstep island with memory protection and bus firewalls for freedom from interference.'},
    ],
    blocks: [
      {name: 'Safety island', items: ['Two DGridRiscV cores in two-cycle lockstep', 'Comparator', 'Freedom-from-interference firewall']},
      {name: 'Security', items: ['Hardware security module: AES-256, ECC-256, true RNG', 'Secure boot, A/B update bank']},
      {name: 'Real-time network', items: ['TSN switch, 802.1Qbv and 802.1AS', 'Service router']},
      {name: 'Vehicle networks', items: ['Two 100BASE-T1', 'Eight CAN-FD, one CAN-XL', 'Eight LIN, one FlexRay']},
      {name: 'Zonal power', items: ['Sixteen smart fuses with I²t models', 'Eight high-side drivers, twelve PWM', '12-bit diagnostic ADC']},
    ],
    blockNote: 'Messages arrive on Ethernet, CAN and LIN, are scheduled and routed in hardware, and become switched power at the zone’s loads; the safety island and security module sit across every path.',
    specs: [
      ['Process', '130 nm CMOS and BCD at 200 MHz'],
      ['Safety island', 'Dual-core two-cycle lockstep'],
      ['Security', 'Hardware security module, secure boot, over-the-air update bank'],
      ['Networking', 'TSN switch; 2 × 100BASE-T1, 8 × CAN-FD, CAN-XL, 8 × LIN, FlexRay'],
      ['Power', '16 smart electronic fuses with programmable trip and I²t'],
      ['Scope', 'Zonal edge only; central compute is out of scope'],
    ],
    designedToward: ['ISO 26262 ASIL-D', 'EVITA Full', 'AUTOSAR Classic 4.4', 'AEC-Q100 Grade 1'],
    reconcile: 'The annex sheet lists the safety island as “ASIL-D certified”. No certificate exists for any DeepGrid part; this page states it as a design target.',
    questions: [
      {title: 'Where the node line falls', question: 'Why does the zonal layer belong on 130 nm while central compute needs a sub-10 nm process?'},
      {title: 'Bounded latency', question: 'Can the shaper guarantee under 10 µs for brake-by-wire traffic while bulk data shares the port?'},
      {title: 'Solid-state fusing', question: 'How do the smart fuses cut off in microseconds without avalanche damage from harness inductance?'},
      {title: 'Isolation', question: 'Which memory-protection and firewall rules keep lighting commands away from steering registers?'},
    ],
    related: [{slug: 'sku-4', why: 'The lockstep pattern its safety island reuses'}, {slug: 'sku-5', why: 'The physical bus transceivers'}, {slug: 'sku-7', why: 'A radar feeding it target data'}],
  },
  {
    id: 'sku10', slug: 'sku-10', portfolioId: 'sku-10',
    heroSpecs: ['Security', 'Memory', 'Interfaces'],
    highlights: [['309 ms', 'Signed firmware checked from reset', 'Security'], ['128 KB', 'Error-corrected memory', 'Memory'], ['100 MHz', 'Lockstep DGridRiscV pair', 'Process']],
    headline: 'A secure microcontroller that checks its own firmware before it runs it.',
    lede: 'SKU-10, the DG32-Max, pairs two DGridRiscV processors in lockstep with encryption instructions, a 4 KB instruction cache and 128 KB of error-corrected memory. Its boot ROM verifies the firmware’s digital signature before running it, so one die does the work of an imported secure MCU and the separate secure element a board adds for signed boot.',
    physics: [
      {requirement: 'Boot only firmware that carries a valid signature.', consequence: 'Signature verification lives in mask ROM, checked from reset, rather than in a second chip.'},
      {requirement: 'Keep a root key and device secrets on a process with no OTP or eFuse.', consequence: 'The root key sits in mask ROM; device secrets and the rollback counter sit in a 1 kbit ReRAM macro.'},
      {requirement: 'Control and crypto work, not peak clock speed.', consequence: 'A 100 MHz lockstep pair on SKY130, reached through a low-cost shuttle slot with 44 signal pads.'},
    ],
    blocks: [
      {name: 'Processor', items: ['Two DGridRiscV cores in lockstep', 'Encryption instructions', '4 KB instruction cache']},
      {name: 'Security', items: ['Boot ROM signature check', 'Root key in mask ROM', 'Device secrets and rollback counter in ReRAM']},
      {name: 'Memory', items: ['128 KB error-corrected SRAM', 'QSPI external flash']},
      {name: 'Interfaces', items: ['CAN-FD', 'UART and SPI', 'Debug access']},
      {name: 'Analog and monitors', items: ['9-bit ADC', 'On-chip clocks', 'Temperature and supply monitors']},
    ],
    blockNote: 'Reset runs the boot ROM, which checks the firmware signature in external flash before the lockstep pair executes it; secrets never leave the ROM and ReRAM.',
    specs: [
      ['Process', '130 nm CMOS (SKY130) at 100 MHz, ChipFoundry OpenFrame shuttle'],
      ['Processor', 'Dual DGridRiscV in lockstep, crypto instructions, 4 KB I-cache'],
      ['Memory', '128 KB error-corrected SRAM'],
      ['Security', 'Signed boot from mask ROM, 309 ms from reset; secrets in 1 kbit ReRAM'],
      ['Interfaces', 'CAN-FD, UART, SPI, 9-bit ADC, debug'],
      ['Package', '44 signal pins in a 64-pin package'],
    ],
    designedToward: ['Verified boot', 'Country-of-origin procurement rules'],
    reconcile: 'SKU-10 postdates Technical Annex v3; this page is written from the October 2026 SKU Blueprint. RTL is feature-complete and every bench and firmware test passes; no silicon or FPGA proof is published yet.',
    questions: [
      {title: 'Keys without OTP', question: 'How are the root key and rollback counter protected on a process that has no OTP or eFuse?'},
      {title: 'Boot time', question: 'What sets the 309 ms from reset to verified firmware, and what would shorten it?'},
      {title: 'Memory area', question: 'How much of the die do the 32 compiled SRAM macros for 128 KB take, and what does that leave?'},
      {title: 'From FPGA to silicon', question: 'Which results from the Arty A7-100T proof carry over to the December 2026 shuttle?'},
    ],
    related: [{slug: 'sku-4', why: 'The lockstep safety pattern it builds on'}, {slug: 'sku-11', why: 'The battery controller built on its platform'}, {slug: 'sku-1', why: 'Uses it as the host platform'}],
  },
  {
    id: 'sku11', slug: 'sku-11', portfolioId: 'sku-11',
    heroSpecs: ['Protection', 'State of health', 'Platform'],
    highlights: [['4–100 kB', 'On-chip state-of-health model', 'State of health'], ['4', 'Hardwired protection trips', 'Protection'], ['130 nm', 'Shares a die with DG32-Max', 'Process']],
    headline: 'A battery controller whose protection works even when its processor has stopped.',
    lede: 'SKU-11 brings the DG32-Max processor and security, an AI accelerator that estimates a battery’s charge, health and remaining life, an optional circuit that measures each cell’s impedance, and hardwired over-voltage, under-voltage, over-current and over-temperature protection onto one die. The cell-measuring front end and the isolation chip are bought, not built.',
    physics: [
      {requirement: 'Protection must hold if the processor stops.', consequence: 'Over-voltage, under-voltage, over-current and over-temperature trips are hardwired, outside the software path.'},
      {requirement: 'Run a state-of-health model at the pack, not in the cloud.', consequence: 'A 4–100 kB model gets its own memory and accelerator, away from the safety path; 130 nm is enough.'},
      {requirement: 'India has no automotive-grade analog fab.', consequence: 'The cell front end stays bought; the chip is the digital controller plus protection, bridged to the front end.'},
    ],
    blocks: [
      {name: 'Platform', items: ['DG32-Max DGridRiscV host', 'CAN-FD, crypto, sleep and wake', 'Root of trust']},
      {name: 'State of health', items: ['AI accelerator for charge, health and remaining life', 'Feature DSP', 'Optional cell-impedance (EIS) engine']},
      {name: 'Protection', items: ['Over- and under-voltage', 'Over-current', 'Over-temperature', 'Contactor interface']},
      {name: 'Front-end bridge', items: ['Bridge to a bought cell front end', 'isoSPI path for larger packs']},
      {name: 'Records', items: ['Keys and rollback counter in ReRAM', 'Tamper-evident battery log in external flash']},
    ],
    blockNote: 'Cell data arrives through the front-end bridge, feeds the protection comparators and the state-of-health model, and drives the contactors; the protection path never waits on software.',
    specs: [
      ['Process', '130 nm CMOS (SKY130), on the DG32-Max platform die'],
      ['Platform', 'DG32-Max host, CAN-FD, crypto, root of trust'],
      ['State of health', 'On-chip AI accelerator; 4–100 kB model; optional EIS'],
      ['Protection', '4 hardwired trips: over-voltage, under-voltage, over-current, over-temperature'],
      ['Front end', 'Bought cell front end (BQ76952 class) and isolation chip'],
      ['Records', 'Battery log hash chain anchored in ReRAM'],
    ],
    designedToward: ['AIS-156', 'EU Battery Passport'],
    reconcile: 'SKU-11 postdates Technical Annex v3; this page is written from the October 2026 SKU Blueprint. It is at block-specification stage with no wafer-run slot assigned, and no state-of-health accuracy on Indian field data is claimed.',
    questions: [
      {title: 'Protection without software', question: 'Which trips stay hardwired, and how fast do they open the contactors with the processor halted?'},
      {title: 'Model accuracy', question: 'How accurate is state-of-health inference on Indian duty cycles: 45 °C ambients, stop-start use and monsoon humidity?'},
      {title: 'Front-end partner', question: 'Which cell front end is frozen first, and what does the bridge need from it?'},
      {title: 'Tamper-evident records', question: 'How does the ReRAM hash chain keep the battery log trustworthy when the log lives in external flash?'},
    ],
    related: [{slug: 'sku-10', why: 'The DG32-Max platform it is built on'}, {slug: 'sku-6', why: 'The protection comparators it reuses'}, {slug: 'sku-3', why: 'The power circuits it ports to 130 nm'}],
  },
  {
    id: 'd100', slug: 'd100', portfolioId: 'track-b-d100',
    dies: [{name: '130 nm', blocks: ['Flight control', 'Visual-inertial odometry', 'Failsafe island', 'Platform']}, {name: '28 nm', blocks: ['AI accelerator (phase 2)']}],
    heroSpecs: ['Navigation', 'Failsafe', 'Flight control'],
    highlights: [['30 Hz', 'Six-DoF pose, in hardware', 'Navigation'], ['10 TOPS', 'Optional AI, phase 2', 'AI (phase 2)'], ['1080p60', 'Vision input', 'Vision input']],
    headline: 'A drone SoC whose failsafe does not trust its own flight computer.',
    lede: 'D100 combines real-time flight control, visual-inertial odometry for GPS-denied navigation, and an isolated hardware failsafe island with its own power, clock and path to the motor controllers. When the mission computer locks up or the link is lost, the island brings the airframe to a safe state without it.',
    physics: [
      {requirement: 'Recovery must work when the flight software has failed.', consequence: 'A separate safe-state machine and link monitor in their own power and clock domain, wired directly to the ESCs.'},
      {requirement: 'Navigation without GPS.', consequence: 'A hardware visual-inertial engine running a six-degree-of-freedom Kalman filter at 30 Hz.'},
      {requirement: 'Vision AI needs dense logic that 130 nm cannot supply.', consequence: 'Control and failsafe on 130 nm; an optional accelerator on a 28 nm die joins in the package later.'},
    ],
    blocks: [
      {name: 'Flight control', items: ['Two DGridRiscV cores for PX4 or ArduPilot loops', 'IMU, magnetometer, barometer', 'ESC out (PWM, DShot)']},
      {name: 'Visual-inertial odometry', items: ['MIPI CSI-2 camera input and ISP', 'Feature extraction', 'Kalman pose engine, 30 Hz']},
      {name: 'AI accelerator (phase 2)', items: ['10 TOPS INT8/INT4 array', '2 MB on-chip memory', 'Object detection']},
      {name: 'Failsafe island', items: ['Link monitor: radio loss, GPS denial', 'Safe-state machine', 'Independent path to the ESCs']},
      {name: 'Platform', items: ['128-bit AXI crossbar at 200 MHz', 'LPDDR4, eMMC/NAND', 'Gigabit Ethernet, USB 3']},
    ],
    blockNote: 'Sensors feed the flight loop and the pose engine; the accelerator, when present, adds detection. The failsafe island watches the link and the flight computer from outside and can take the motors on its own.',
    specs: [
      ['Process', '130 nm CMOS at 200 MHz; proposed 28 nm accelerator die in the same package'],
      ['Flight control', 'Dual DGridRiscV, hard real-time PX4 or ArduPilot'],
      ['Navigation', 'Hardware VIO, six-DoF EKF at 30 Hz'],
      ['Vision input', 'MIPI CSI-2, two lanes, to 1080p60, with ISP'],
      ['AI (phase 2)', 'Optional 10 TOPS INT8/INT4, 2 MB SRAM'],
      ['Failsafe', 'Independent watchdog and safe-state machine, isolated power and clock, direct ESC link'],
      ['Memory', 'LPDDR4 32-bit, eMMC or NAND'],
    ],
    designedToward: ['DGCA type certification path', 'STANAG 4586', 'MIL-STD-810H'],
    reconcile: 'The flight-control sheet describes the 130 nm die; the annex matrix and the site list the part as 130 nm plus a 28 nm die in one package, the 28 nm die carrying the phase-2 accelerator. The failsafe architecture does not establish jamming immunity or certified flight safety.',
    questions: [
      {title: 'Hardware failsafe', question: 'Why is the safe-state logic separate hardware rather than a task in the flight stack, and what does it need to see to act?'},
      {title: 'GPS-denied drift', question: 'Can the 30 Hz pose engine hold under 1% drift per kilometre under jamming, without learned weights?'},
      {title: 'Thermal envelope', question: 'How is heat removed in a closed fuselage at +55 °C with the camera pipeline and flight loops running?'},
      {title: 'From FPGA to silicon', question: 'Which timing paths in the 128-bit crossbar had to change to close at 200 MHz on an open process?'},
    ],
    related: [{slug: 'sku-1', why: 'Drives the flight motors'}, {slug: 'sku-7', why: 'Radar for collision avoidance'}, {slug: 'sku-4', why: 'The lockstep pattern in its flight cores'}],
  },
];

export const productBySlug = Object.fromEntries(productPages.map(p => [p.slug, p])) as Record<string, ProductPage>;
export const productSlugFor = Object.fromEntries(productPages.map(p => [p.portfolioId, p.slug])) as Record<string, string>;
export const productSlugById = Object.fromEntries(productPages.map(p => [p.id, p.slug])) as Record<ProductId, string>;
