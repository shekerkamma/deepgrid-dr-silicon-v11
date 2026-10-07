# SKU-5: Architecture Guide

Deepgrid Semi · interface transceiver · reading guide to the SKU-5 system architecture diagram · October 2026

> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-5?

SKU-5 is a line transceiver with one RS-485 channel and one CAN-FD channel. Each channel shifts 1.8 V logic to a 5 V thick-oxide output stage, shapes its edges, biases the bus to a defined idle state, and protects itself against shorts, heat and ESD.

---

## Architecture Overview

1. **Channel 1 · RS-485  ·  half duplex · up to 256 nodes · −7 to +12 V CM**: Logic interface with TXD, RXD and enable, a slew-shaped pre-driver, a differential push-pull output on thick-oxide LDMOS, a 30 mV-hysteresis receiver, failsafe idle bias, fault and ESD protection, a local LDO and an oscillator.
2. **Bus pins**: RS-485 A and B, CAN CANH and CANL.
3. **Channel 2 · CAN-FD  ·  8 Mbps data · ISO 11898-2 · ±12 V CM**: The same structure for CAN-FD: logic interface, pre-driver, output stage, receiver, failsafe bias, fault and ESD protection, with a TXD timeout and bus-fault detection, and an oscillator for bit-time recovery.

## Component: Channel 1 · RS-485  ·  half duplex · up to 256 nodes · −7 to +12 V CM

What it does: Logic interface with TXD, RXD and enable, a slew-shaped pre-driver, a differential push-pull output on thick-oxide LDMOS, a 30 mV-hysteresis receiver, failsafe idle bias, fault and ESD protection, a local LDO and an oscillator.

Why it exists: A 5 V-tolerant thick-oxide ring is why 130 nm suits a line driver.

- **Logic IF**: 1.8 V core · level shift to 5 V · TXD · RXD · EN/STB
- **Pre-driver**: slew shaping · dV/dt 3 V/ns trimmed
- **Output stage**: diff push-pull · thick-oxide 5 V LDMOS
- **Prot logic**: EN interlock · no bus contention
- **Fault**: thermal + short · 150 °C shutdown
- **Receiver**: hysteresis comp · 30 mV hyst · 50 ns prop
- **Failsafe bias**: idle = recessive · open / short / idle
- **ESD + EMC**: ±15 kV, rated per test standard
- **Local supply + osc**: 3.3 V LDO + bandgap · 40 MHz ref

## Component: Bus pins

What it does: RS-485 A and B, CAN CANH and CANL.

- **A / B**: RS-485
- **CANH / CANL**: CAN-FD

## Component: Channel 2 · CAN-FD  ·  8 Mbps data · ISO 11898-2 · ±12 V CM

What it does: The same structure for CAN-FD: logic interface, pre-driver, output stage, receiver, failsafe bias, fault and ESD protection, with a TXD timeout and bus-fault detection, and an oscillator for bit-time recovery.

- **Local supply + osc**: 3.3 V LDO + bandgap · 40 MHz · bit-time recovery
- **ESD + EMC**: ±15 kV, rated per test standard
- **Failsafe bias**: idle = recessive · open / short / idle
- **Output stage**: diff push-pull · thick-oxide 5 V LDMOS
- **Pre-driver**: slew shaping · dV/dt 3 V/ns trimmed
- **Logic IF**: 1.8 V core · level shift to 5 V · TXD · RXD · EN/STB
- **Receiver**: hysteresis comp · 30 mV hyst · 50 ns prop
- **Fault**: thermal + short · 150 °C shutdown
- **Prot logic**: TXD timeout · bus-fault detect

---

## Key Data Flows

- ① TXD enters the logic interface and is level-shifted to 5 V.
- ② The pre-driver shapes the edge for the output stage.
- ③ The differential output drives the bus pins.
- ④ The receiver reads the bus back to RXD. Channel 2 follows the same path.

## Designed toward

Targets the design is developed toward, not certificates held:

- TIA/EIA-485
- ISO 11898-2
- IEC 61000-4-2 (system level) and HBM (component level), each rated separately
