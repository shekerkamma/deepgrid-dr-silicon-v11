# SKU-1: Architecture Guide

Deepgrid Semi · BLDC motor controller · reading guide to the SKU-1 system architecture diagram · October 2026

> Architecture scope, pre-silicon. The diagram is redrawn from the SKU Architecture Compendium, Technical Annex v3, sheet 2. Every value is a design target, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-1?

SKU-1 is a brushless-motor controller that keeps the current loop in hardware. A DGridRiscV core configures and supervises; the field-oriented-control datapath, the 16-bit sensing and the PWM and pre-drivers run the loop without it, controlling a 5 V to 120 V motor supply (external power switches above 20 V).

---

## Architecture Overview

1. **Host · control plane**: A DGridRiscV core with timers and watchdog, SRAM and ReRAM, and the host interfaces. It sets the loop up and supervises it.
2. **Mixed signal**: A 16-bit ADC for phase, bus and temperature, four reference DACs, an on-die temperature sensor and three current-sense amplifiers.
3. **Power path**: A buck-boost converter, seven PWM channels, three half-bridge pre-drivers, latched protection and runtime star or delta winding selection.
4. **Field-oriented control datapath**: A hardware PID tuner, a CORDIC rectangular-to-polar stage, inverse Park and Clarke, and sine or trapezoid lookup: torque command in, phase drive out.
5. **Sensor + feedback**: Hall, quadrature or encoder inputs give rotor angle and speed; the three phase currents are rebuilt, amplified and digitised.

## Component: Host · control plane

What it does: A DGridRiscV core with timers and watchdog, SRAM and ReRAM, and the host interfaces. It sets the loop up and supervises it.

Why it exists: The processor configures and supervises; it does not sit in the loop.

- **DGridRiscV**: custom 32-bit RISC-V · 100 MHz
- **Timers · WDT · CCU**
- **SRAM**: 32 KB, up to 256 KB
- **ReRAM**: 256 KB, up to 1 MB
- **Host interfaces**: I²C slave · UART × 4 · SPI · CAN-FD × 2 · JTAG

## Component: Mixed signal

What it does: A 16-bit ADC for phase, bus and temperature, four reference DACs, an on-die temperature sensor and three current-sense amplifiers.

- **16-bit ADC**: phase / bus / temp
- **DAC × 4**: reference out
- **Temp sense**: on-die, −40 to +125 °C
- **CSA × 3**: current-sense amps

## Component: Power path

What it does: A buck-boost converter, seven PWM channels, three half-bridge pre-drivers, latched protection and runtime star or delta winding selection.

Why it exists: Up to about 20 V the gate drive sits on the BCD die beside the logic; above it, up to 120 V, the chip drives external power switches.

- **B-B converter**: buck-boost, PWM-pin driven
- **PWM × 7**: up to 200 kHz · 6 bridge + 1 aux
- **Pre-drivers R / Y / B**: 3 half-bridges · clock gating per phase
- **Star / delta**: winding configuration, runtime selectable
- **Protection**: thermal · overcurrent · overvoltage → gate shutdown, latched

## Component: Field-oriented control datapath

What it does: A hardware PID tuner, a CORDIC rectangular-to-polar stage, inverse Park and Clarke, and sine or trapezoid lookup: torque command in, phase drive out.

Why it exists: The loop runs in hardware, so its latency is fixed and stays under 1 µs.

- **PID tuner**: hardware · <1 µs tuning latency
- **Rect → polar**: CORDIC · magnitude + angle
- **d,q → 3-phase**: inverse Park + Clarke
- **Sine / trapezoid**: lookup tables · sinusoidal or 6-step

## Component: Sensor + feedback

What it does: Hall, quadrature or encoder inputs give rotor angle and speed; the three phase currents are rebuilt, amplified and digitised.

- **Hall / quad / enc**: sensored or sensorless
- **Angle (ω)**: rotor position + speed
- **iR iY iB rebuild**: transfer function
- **Instant current**: amplify + digitise

---

## Key Data Flows

- ① Speed, torque, halt and brake commands reach the host.
- ② The datapath turns the torque command into phase drive: PID, CORDIC, inverse Park and Clarke, waveform lookup.
- ③ PWM drives the three half-bridge pre-drivers.
- ④ Current and angle feedback closes the PID loop.
- F A thermal, overcurrent or overvoltage fault shuts the gates and latches.

## Designed toward

Targets the design is developed toward, not certificates held:

- AEC-Q100 Grade 0
- ISO 26262 ASIL-B/C
- UL94
