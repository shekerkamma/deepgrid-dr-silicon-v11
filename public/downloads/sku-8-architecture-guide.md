# SKU-8: Architecture Guide

Deepgrid Semi · rugged display driver and TCON · reading guide to the SKU-8 system architecture diagram · October 2026

> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-8?

SKU-8 combines a timing controller and a 1280-column source driver for rugged TFT panels. It receives video over LVDS or MIPI DSI, linearises, colour-corrects, gamma-maps and dithers it, and drives each column through a 10-bit DAC and a high-voltage output amplifier, with row, VCOM and backlight control alongside.

---

## Architecture Overview

1. **Video input**: Dual-link LVDS at 655 Mbps per lane and four-lane MIPI DSI receivers into a dual-port line buffer of four 1280-pixel, 24-bit lines.
2. **Pixel pipeline**: De-gamma, a 3 × 3 colour matrix with white point, a 14-bit gamma table with temperature feedback, and temporal and spatial dithering.
3. **Timing + test**: A timing controller with programmable porches, a 100 MHz pixel-clock PLL, a colour-bar test pattern and frame-freeze detection that alerts within two frames.
4. **Column (source) drivers · high-voltage**: One 10-bit resistor-string DAC per column and rail-to-rail high-voltage amplifiers swinging 0 to 12 V, driving 3,840 sub-pixel outputs with charge-sharing precharge.
5. **Row + backlight**: A gate-driver interface with a 24 V level shift, the VCOM electrode, an LED backlight with eight local-dimming zones, and ambient light and temperature sensing.

## Component: Video input

What it does: Dual-link LVDS at 655 Mbps per lane and four-lane MIPI DSI receivers into a dual-port line buffer of four 1280-pixel, 24-bit lines.

- **LVDS RX**: dual link · 655 Mbps per lane · SXGA 1280 × 1024 @ 60 Hz
- **DSI RX**: four-lane MIPI DSI
- **Line buffer**: dual-port SRAM · 4 lines × 1280 × 24 bit

## Component: Pixel pipeline

What it does: De-gamma, a 3 × 3 colour matrix with white point, a 14-bit gamma table with temperature feedback, and temporal and spatial dithering.

Why it exists: LCD response shifts with panel temperature, so the gamma is temperature-compensated.

- **De-gamma**: input linearise
- **Colour**: 3 × 3 matrix + WP
- **Dither**: temporal + spatial
- **Gamma LUT**: 14-bit table · temperature feedback

## Component: Timing + test

What it does: A timing controller with programmable porches, a 100 MHz pixel-clock PLL, a colour-bar test pattern and frame-freeze detection that alerts within two frames.

- **TCON**: H/V timing gen · programmable porches
- **PLL**: pixel clock · 100 MHz
- **Test pattern**: colour bars
- **BIST + safety**: frame-freeze detect

## Component: Column (source) drivers · high-voltage

What it does: One 10-bit resistor-string DAC per column and rail-to-rail high-voltage amplifiers swinging 0 to 12 V, driving 3,840 sub-pixel outputs with charge-sharing precharge.

Why it exists: A 0 to 12 V swing on thick oxide is mature-node territory; precharge cuts driver power by about 40%.

- **DAC bank**: 10-bit, 1 per column · resistor-string + buffer
- **Output amps**: rail-to-rail HV · 0 to 12 V swing, thick oxide
- **Column outputs × 1280**: 3 sub-pixels × 1280 → 3,840 outputs · charge-sharing precharge

## Component: Row + backlight

What it does: A gate-driver interface with a 24 V level shift, the VCOM electrode, an LED backlight with eight local-dimming zones, and ambient light and temperature sensing.

- **Gate driver IF**: row scan · up to 24 V level shift
- **VCOM**: common electrode
- **Backlight**: PWM + LED string · local dimming, 8 zones
- **Ambient**: light + temp sense

---

## Key Data Flows

- ① Video arrives over LVDS, MIPI DSI or parallel RGB.
- ② The line buffer feeds the pixel pipeline, 24 bits per pixel.
- ③ Dithered pixels drive the column DACs.
- ④ High-voltage amplifiers drive the 3,840 column outputs.
- ⑤ The timing controller scans the rows through the gate driver.

## Designed toward

Targets the design is developed toward, not certificates held:

- ISO 26262 ASIL-B
- MIL-STD-810G
- DEF-STAN 00-35
