# SKU-7: Architecture Guide

Deepgrid Semi · 77 GHz MIMO radar · reading guide to the SKU-7 system architecture diagram · October 2026

> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-7?

SKU-7 is a two-transmit, four-receive FMCW radar for the 76 to 81 GHz band. A SiGe HBT die synthesises the chirp, transmits it and mixes the four echoes down; a 130 nm CMOS die digitises the result and runs range and Doppler FFTs, CFAR detection, angle estimation and a target list.

---

## Architecture Overview

1. **Chirp synthesis + transmit · SiGe die**: A 40 MHz crystal, a ramp generator, a fractional-N PLL, a 38.5 GHz SiGe VCO and a doubler to 77 GHz, feeding two 13 dBm power amplifiers.
2. **Signal processing · CMOS die**: Four 12-bit 40 MSPS converters digitise the IF signals as they cross the die boundary; windowing, a 1024-point radix-4 range FFT, a 128-point Doppler FFT and a range-Doppler map in 512 KB of SRAM follow.
3. **Receive array · 4 channels · SiGe die**: Four identical channels: a 3.5 dB noise-figure LNA, a mixer fed by the LO, an IF amplifier and a 10 MHz anti-alias filter; the IF signals leave the SiGe die for the converters.
4. **Detection + output · CMOS die**: Cell-averaging CFAR detection, digital-beamforming angle estimation at 15° resolution from four receivers, and a target list of up to 64 tracks per frame.

## Component: Chirp synthesis + transmit · SiGe die

What it does: A 40 MHz crystal, a ramp generator, a fractional-N PLL, a 38.5 GHz SiGe VCO and a doubler to 77 GHz, feeding two 13 dBm power amplifiers.

Why it exists: A 4 GHz sweep gives 3.75 cm range resolution, and only a SiGe HBT reaches 77 GHz on a mature node.

- **XTAL**: 40 MHz
- **Ramp gen**: chirp profile · sawtooth / triangle
- **PLL**: fractional-N · 1 MHz loop BW
- **VCO**: 38.5 GHz · SiGe HBT
- **PA · TX2**: 13 dBm
- **PA · TX1**: 13 dBm
- **× 2**: 77 GHz

## Component: Signal processing · CMOS die

What it does: Four 12-bit 40 MSPS converters digitise the IF signals as they cross the die boundary; windowing, a 1024-point radix-4 range FFT, a 128-point Doppler FFT and a range-Doppler map in 512 KB of SRAM follow.

- **ADC × 4**: 12-bit · 40 MSPS
- **Windowing**: Hann / Blackman
- **Doppler FFT**: 128-pt across chirps · velocity bins
- **Range FFT**: 1024-pt radix-4 · 26 µs per chirp
- **Range-Doppler**: map buffer · SRAM 512 KB

## Component: Receive array · 4 channels · SiGe die

What it does: Four identical channels: a 3.5 dB noise-figure LNA, a mixer fed by the LO, an IF amplifier and a 10 MHz anti-alias filter; the IF signals leave the SiGe die for the converters.

Why it exists: The beat frequency carries range; the phase across the four receivers carries the angle of arrival.

- **LNA × 4**: 3.5 dB NF
- **Mixer × 4**: LO from the × 2
- **IF amp × 4**
- **AAF × 4**: 10 MHz LP

## Component: Detection + output · CMOS die

What it does: Cell-averaging CFAR detection, digital-beamforming angle estimation at 15° resolution from four receivers, and a target list of up to 64 tracks per frame.

- **Angle est**: digital beamform · 4 RX → 15° res
- **CFAR**: cell-averaging · constant false-alarm
- **Target list**: range · velocity · angle · RCS · up to 64 tracks per frame

---

## Key Data Flows

- ① The crystal, ramp generator, PLL and VCO synthesise the chirp.
- ② The doubler reaches 77 GHz and the two PAs transmit.
- ③ Each of four echoes is amplified, mixed with the LO, filtered.
- ④ The IF signals cross the die boundary and four 12-bit converters digitise them for the range FFT.
- ⑤ The range-Doppler map feeds CFAR detection and angle estimation.
- ⑥ The target list goes to the ECU over CAN-FD, 100BASE-T1 or MIPI CSI-2.

## Designed toward

Targets the design is developed toward, not certificates held:

- ISO 26262 ASIL-B
- DO-160G
- MIL-STD-883K
