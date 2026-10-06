# SKU-2: Architecture Guide

Deepgrid Semi · smart-meter SoC · reading guide to the SKU-2 system architecture diagram · October 2026

> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-2?

SKU-2 is an energy-meter SoC. Six sigma-delta channels feed a decimator and a metrology engine that computes real, reactive and apparent power and harmonics; a DGridRiscV core, a security engine and an always-on domain handle billing, tamper and timekeeping.

---

## Architecture Overview

1. **Metrology**: A six-channel 24-bit sigma-delta front end, a sinc³ decimator at OSR 256, and a metrology engine for P, Q, S and THD to the 15th harmonic.
2. **Compute + security**: A DGridRiscV core, a four-channel DMA and the DG-SE security engine with AES-256 and SHA-256.
3. **Always-on**: A PMU and RTC on a 32.768 kHz crystal with brownout detection, drawing under 2 µW.
4. **Peripherals**: Tamper-logging RTC, capture and compare timer, 4 × 40 segment LCD, DLMS/COSEM UART, case and magnet tamper inputs, and GPIO for relay and LED.

## Component: Metrology

What it does: A six-channel 24-bit sigma-delta front end, a sinc³ decimator at OSR 256, and a metrology engine for P, Q, S and THD to the 15th harmonic.

Why it exists: Billing accuracy is set by the converter and the arithmetic, so both are dedicated hardware.

- **DG-AFE6**: 6-ch 24-bit delta-sigma
- **DECIM**: sinc³ · OSR 256
- **METRO**: P Q S · THD-15

## Component: Compute + security

What it does: A DGridRiscV core, a four-channel DMA and the DG-SE security engine with AES-256 and SHA-256.

- **DGridRiscV**: RV32IM_Zicsr
- **DMA**: 4-ch
- **DG-SE**: AES-256 · SHA-256

## Component: Always-on

What it does: A PMU and RTC on a 32.768 kHz crystal with brownout detection, drawing under 2 µW.

Why it exists: Time and tamper state must survive when mains power is gone.

- **PMU + RTC**: 32.768 kHz XTAL · brownout 2.0 V · <2 µW

## Component: Peripherals

What it does: Tamper-logging RTC, capture and compare timer, 4 × 40 segment LCD, DLMS/COSEM UART, case and magnet tamper inputs, and GPIO for relay and LED.

- **RTC**: tamper log
- **Timer**: capture / compare
- **LCD**: 4 × 40 seg
- **UART**: DLMS / COSEM
- **Tamper**: case · magnet
- **GPIO**: relay + LED

---

## Key Data Flows

- ① Six voltage and current channels enter the front end.
- ② The 24-bit samples decimate through sinc³ at OSR 256.
- ③ The metrology engine computes P, Q, S and THD.
- ④ Results cross the 32-bit bus to the core and DMA.
- ⑤ Readings leave on the DLMS/COSEM UART.

## Designed toward

Targets the design is developed toward, not certificates held:

- IEC metering accuracy Class 0.5S
