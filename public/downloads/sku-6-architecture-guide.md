# SKU-6: Architecture Guide

Deepgrid Semi · quad-rail voltage supervisor · reading guide to the SKU-6 system architecture diagram · October 2026

> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-6?

SKU-6 watches four supply rails and the processor that depends on them. Each rail runs through a matched divider, a chopper-stabilised comparator and a digital deglitch counter into a latched fault matrix that drives FAULT_N and RESET_N; a windowed watchdog catches a hung or runaway processor.

---

## Architecture Overview

1. **Sense chain · one per rail**: For each of four rails: an ESD-protected input, a 0.1%-matched polysilicon divider, a chopper-stabilised comparator with 8 mV hysteresis, and an 8 µs digital deglitch counter.
2. **Fault logic**: A maskable, latched fault matrix with a priority encoder, mask register, latch and I²C registers.
3. **Output stage**: Open-drain FAULT_N, which asserts before RESET_N, an open-drain RESET_N with a trimmed 200 ms delay, and a manual-reset input.
4. **Reference + timebase**: A curvature-corrected bandgap at 1.20 V and 10 ppm/°C, a 5-bit OTP trim to ±0.5%, and a 1 MHz oscillator with a reference current.
5. **Watchdog**: A windowed watchdog adjustable from 100 ms to 1.6 s: an open and close window, a kick input, and a timeout counter that drives RESET_N.

## Component: Sense chain · one per rail

What it does: For each of four rails: an ESD-protected input, a 0.1%-matched polysilicon divider, a chopper-stabilised comparator with 8 mV hysteresis, and an 8 µs digital deglitch counter.

Why it exists: Switching noise must not trip a reset, yet a real fault must still be caught quickly; the deglitch counter does both.

- **VIN 1**: 5V0 · ESD 2 kV
- **Divider**: poly R ladder · 0.1% match
- **Comparator**: chopper-stabilised · ±1% · 8 mV hyst
- **Deglitch**: digital counter · 8 µs
- **VIN 2**: 3V3 · ESD 2 kV
- **Divider**: poly R ladder · 0.1% match
- **Comparator**: chopper-stabilised · ±1% · 8 mV hyst
- **Deglitch**: digital counter · 8 µs
- **VIN 3**: 1V8 · ESD 2 kV
- **Divider**: poly R ladder · 0.1% match
- **Comparator**: chopper-stabilised · ±2% · 8 mV hyst
- **Deglitch**: digital counter · 8 µs
- **VIN 4**: 1.2 / 0.9 V adjustable · ESD 2 kV
- **Divider**: poly R ladder · 0.1% match
- **Comparator**: chopper-stabilised · ±2% · 8 mV hyst
- **Deglitch**: digital counter · 8 µs

## Component: Fault logic

What it does: A maskable, latched fault matrix with a priority encoder, mask register, latch and I²C registers.

- **Fault matrix**: maskable · latched · priority enc · mask reg · latch · I²C regs

## Component: Output stage

What it does: Open-drain FAULT_N, which asserts before RESET_N, an open-drain RESET_N with a trimmed 200 ms delay, and a manual-reset input.

- **RESET_N**: open-drain · 200 ms delay, trimmed
- **FAULT_N**: open-drain · asserts before RESET_N
- **MR / manual**: push-button in

## Component: Reference + timebase

What it does: A curvature-corrected bandgap at 1.20 V and 10 ppm/°C, a 5-bit OTP trim to ±0.5%, and a 1 MHz oscillator with a reference current.

Why it exists: The bandgap and trimmed polysilicon resistors are what make the threshold accuracy possible on a mature node.

- **Bandgap**: curvature-corrected · 1.20 V · 10 ppm/°C · PTAT + CTAT
- **Trim**: OTP 5-bit · ±0.5% after trim
- **Osc**: 1 MHz · ±2% over −40 to 125 °C · ref current

## Component: Watchdog

What it does: A windowed watchdog adjustable from 100 ms to 1.6 s: an open and close window, a kick input, and a timeout counter that drives RESET_N.

- **Window logic**: open + close · 100 ms to 1.6 s
- **WDI**: kick input
- **Timeout**: counter → RESET_N

---

## Key Data Flows

- ① Each rail enters through its divider.
- ② The comparator and deglitch counter report a confirmed fault to the matrix.
- ③ The matrix latches it and drives FAULT_N, then RESET_N.
- ④ The trimmed bandgap sets every comparator threshold.
- ⑤ A missed or early watchdog kick times out to RESET_N.

## Designed toward

Targets the design is developed toward, not certificates held:

- MIL-STD-883K Class B screening flow
