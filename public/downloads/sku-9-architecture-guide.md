# SKU-9: Architecture Guide

Deepgrid Semi · zonal controller and gateway · reading guide to the SKU-9 system architecture diagram · October 2026

> Architecture scope, pre-silicon. The diagram is redrawn from the SKU Architecture Compendium, Technical Annex v3, sheet 10. Every value is a design target, not a measurement. Standards appear only as targets the design is developed toward; no certificate exists for any DeepGrid part.

## What is SKU-9?

SKU-9 is the zonal edge of a software-defined vehicle. It receives messages on Ethernet, CAN and LIN, schedules them with time-sensitive networking, and turns them into switched power at sixteen smart fuses, with a lockstep safety island and a hardware security module across every path.

---

## Architecture Overview

1. **Safety island**: Two DGridRiscV cores in lockstep with a two-cycle skew, memory protection and ECC, a bus and retire comparator, and a freedom-from-interference firewall.
2. **Security**: A hardware security module with AES-256 and ECC-256, secure boot from an OTP key store with A/B slots, and an OTA engine with signed-image verification and rollback.
3. **Real-time control**: A TSN switch with an 802.1Qbv time-aware shaper, 802.1AS precision time, and a SOME/IP and DoIP service router.
4. **In-vehicle network · gateway**: The gateway ports: two 100BASE-T1, eight CAN-FD, one CAN-XL, eight LIN and one FlexRay. The gateway routes and rate-limits between domains.
5. **Zonal power + I/O**: Sixteen smart electronic fuses with sensing, eight high-side drivers, a 24-channel 12-bit sense ADC and twelve PWM actuator outputs.

## Component: Safety island

What it does: Two DGridRiscV cores in lockstep with a two-cycle skew, memory protection and ECC, a bus and retire comparator, and a freedom-from-interference firewall.

Why it exists: Safety-critical and comfort functions share one chip, so the island is isolated by an MPU and a bus firewall.

- **DGridRiscV × 2**: RV32IM_Zicsr · lockstep · 100 MHz · +2 cycle skew · PMP · ECC
- **Comparator**: bus + retire · mismatch → safe state
- **Freedom from interference**: MPU + bus firewall

## Component: Security

What it does: A hardware security module with AES-256 and ECC-256, secure boot from an OTP key store with A/B slots, and an OTA engine with signed-image verification and rollback.

- **HSM**: hardware security module · AES-256 · ECC-256 · true RNG
- **Secure boot**: root of trust · OTP key store · A/B slots
- **OTA engine**: signed image verify + rollback

## Component: Real-time control

What it does: A TSN switch with an 802.1Qbv time-aware shaper, 802.1AS precision time, and a SOME/IP and DoIP service router.

Why it exists: Brake-by-wire messages need bounded latency on a shared link.

- **TSN switch**: 802.1Qbv · time-aware shaper
- **PTP**: 802.1AS clock · sub-µs sync
- **Service router**: SOME/IP + DoIP

## Component: In-vehicle network · gateway

What it does: The gateway ports: two 100BASE-T1, eight CAN-FD, one CAN-XL, eight LIN and one FlexRay. The gateway routes and rate-limits between domains.

- **100BASE-T1 × 2**: automotive Ethernet
- **CAN-FD × 8**
- **CAN-XL × 1**
- **LIN × 8**: masters
- **FlexRay × 1**

## Component: Zonal power + I/O

What it does: Sixteen smart electronic fuses with sensing, eight high-side drivers, a 24-channel 12-bit sense ADC and twelve PWM actuator outputs.

Why it exists: Switching 12 V and 48 V loads in the harness needs BCD power devices beside the logic.

- **Smart fuse × 16**: eFuse + sense · replaces relay box
- **HS driver × 8**: load control
- **ADC 12-bit**: 24-ch sense
- **PWM × 12**: actuator drive

---

## Key Data Flows

- ① Messages arrive on Ethernet, CAN and LIN.
- ② The TSN switch schedules them against precision time.
- ③ The service router forwards them across the crossbar.
- ④ They become switched power at the smart fuses.
- ⑤ A lockstep mismatch drives the safe state.

## Where this differs from the annex sheet

Structure follows the annex figure on sheet 10. Some values on that sheet differ from the product page; where they do, the diagram follows the product page, and anyone opening the sheet will see the other value. The differences: the network ports (the sheet draws CAN-XL × 2, FlexRay × 2 and a 1000BASE-T1 port; this page states one CAN-XL, one FlexRay and no 1000BASE-T1).

## Designed toward

Targets the design is developed toward, not certificates held:

- ISO 26262 ASIL-D
- EVITA Full
- AUTOSAR Classic 4.4
- AEC-Q100 Grade 1
