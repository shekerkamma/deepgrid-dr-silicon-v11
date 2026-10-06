# DeepGrid Semi — Product Portfolio (SKU Blueprint), October 2026

> Markdown rendering of `deepgrid-sku-blueprint-oct2026.pdf` (46 pages) for in-site reading and search. Text and tables are taken from the PDF unchanged; architecture-diagram pages are referenced by page rather than transcribed. Source page numbers are marked as `[pdf p.N]`.

[pdf p.1]

**Product Portfolio** (SKU Blueprint)

Mature-node silicon for India’s defence, industrial and energy base

Eleven chips on SkyWater 130 nm and SCL 180 nm, plus the Track B drone SoC Nine prototypes on the ChipFoundry December 2026 shuttle ₹1,000 Cr plan at full run-rate · about ₹610 Cr in FY31 on approval times

**October 2026**

[pdf p.2]

# **Contents**

Click any line to go to that section.

|Portfolio at a glance||1|
|---|---|---|
|Path to revenue||3|
|What the funding buys||4|
|**SKU-1 · BLDC Motor Controller**|plan line ₹320 Cr|7|
|**SKU-2 · Smart-Meter SoC**|plan line ₹250 Cr|10|
|**SKU-3 · Hi-Rel PMIC**|plan line ₹40 Cr|13|
|**SKU-4 · Lockstep MCU**|plan line ₹40 Cr|16|
|**SKU-5 · Interface Transceiver**|plan line ₹45 Cr|19|
|**SKU-6 · Voltage Supervisor**|plan line ₹40 Cr|22|
|**SKU-7 · 4D Radar RF**|plan line ₹35 Cr|25|
|**SKU-8 · Display Driver**|plan line ₹20 Cr|28|
|**SKU-9 · SDV Zonal Gateway**|plan line ₹60 Cr|31|
|**SKU-10 · DG32-Max Secure MCU**|plan line ₹110 Cr|34|
|**SKU-11 · SOH-Aware BMS Controller**|plan line ₹40 Cr|37|
|**Track B · D100 Drone SoC**|separate ₹50 Cr round|40|
|Glossary||43|

[pdf p.3]

Each SKU below is a standalone handout. It answers nine questions in the same order: what the part is, what it replaces, how big the market is, what share we need and whether that is realistic, what we earn per unit, who buys it, the policy driver, why this process node, and where the FPGA prototype ends and the chip begins.

##### HOW THE NUMBERS ARE WORKED OUT

For each SKU we estimate two things: how many units India could buy each year, and the price range. Everything else is simple arithmetic on those two, at ₹95.4 per US dollar and a 60–75 % gross margin, shown so it can be checked. The plan line for each SKU is its yearly revenue once its approvals have landed; together the eleven lines make a ₹1,000 Cr plan. Volumes, prices and the split are our own estimates; where a figure comes from published data, the SKU page says so.

### **What the numbers say about the portfolio**

The table applies the same arithmetic to all eleven SKUs.

|SKU|Addressable<br>units / yr|Price<br>range|Addressable market|Plan line<br>(full rate)|FY31<br>(ramp)|Share<br>at mid|Share<br>at top<br>of both<br>bands|Verdict|
|---|---|---|---|---|---|---|---|---|
|**SKU-1**<br>BLDC Motor Controller|25 M – 78 M|$0.5 – 12|₹337 Cr – ₹2,719 Cr|₹320 Cr|₹256 Cr|**26 %**|12 %|PLAUSIBLE|
|**SKU-2**<br>Smart-Meter SoC|16 M – 45 M|$0.8 – 10|₹273 Cr – ₹1,794 Cr|₹250 Cr|₹175 Cr|**29 %**|14 %|PLAUSIBLE|
|**SKU-3**<br>Hi-Rel PMIC|162 K – 560 K|$8 – 1,500|₹22 Cr – ₹358 Cr|₹40 Cr|₹12 Cr|**29 %**|11 %|PLAUSIBLE|
|**SKU-4**<br>Lockstep MCU|3 M – 10 M|$4 – 12|₹114 Cr – ₹1,145 Cr|₹40 Cr|₹4 Cr|**8 %**|3 %|CONSERVATIVE|
|**SKU-5**<br>Interface Transceiver|20 M – 60 M|$0.4 – 1.5|₹76 Cr – ₹859 Cr|₹45 Cr|₹14 Cr|**12 %**|5 %|CONSERVATIVE|
|**SKU-6**<br>Voltage Supervisor|30 M – 80 M|$0.2 – 50|₹58 Cr – ₹658 Cr|₹40 Cr|₹16 Cr|**14 %**|6 %|PLAUSIBLE|
|**SKU-7**<br>4D Radar RF|1 M – 5 M|$8 – 25|₹76 Cr – ₹1,192 Cr|₹35 Cr|₹4 Cr|**7 %**|3 %|CONSERVATIVE|
|**SKU-8**<br>Display Driver|0.5 M – 2 M|$3 – 12|₹14 Cr – ₹229 Cr|₹20 Cr|₹8 Cr|**22 %**|9 %|PLAUSIBLE|
|**SKU-9**<br>SDV Zonal Gateway|1 M – 4 M|$6 – 20|₹57 Cr – ₹763 Cr|₹60 Cr|₹6 Cr|**19 %**|8 %|PLAUSIBLE|
|**SKU-10**<br>DG32-Max Secure<br>MCU|8 M – 25 M|$3 – 8|₹229 Cr – ₹1,908 Cr|₹110 Cr|₹110 Cr|**13 %**|6 %|CONSERVATIVE|
|**SKU-11**<br>SOH-Aware BMS<br>Controller|3 M – 10 M|$2 – 6|₹57 Cr – ₹572 Cr|₹40 Cr|₹4 Cr|**16 %**|7 %|PLAUSIBLE|

**How to read the table.** “Share at mid” is the part of the market we need to win, using the middle of both estimates. “Share at top” uses the high end of both. “Plan line” is each chip’s yearly revenue once its approvals have landed; “FY31 (ramp)” is what the approval times give in FY31. We plan no single SKU to win more than 30 % of its market — our own planning rule, not an industry benchmark; the verdicts are our judgement.

**Every SKU is within that limit.** The largest asks are the smart-meter SoC and the hi-rel PMIC, at 29 % each. Both sell to buyers who purchase only from approved suppliers — electricity-board tenders, the defence approved-vendor list, railway approval and ISRO’s qualified parts. Once a part is approved, it tends to stay in use for many years.

**The large markets come from one chip serving many uses.** The BLDC motor controller sells into EVs, industrial drives, ceiling fans, home appliances, drones and robots — 25 to 78 million controllers a year

[pdf p.4]

in India. The smart-meter SoC covers household meters, transformer and industrial meters, rooftop solar, EV chargers and building submeters. The PMIC covers military, railway and space power.

**There is room to grow.** At a 30 % share, the eleven SKUs could reach about ₹ **1,611 Cr** a year, against a plan of ₹ **1,000 Cr** . The plan needs about 62 % of what these markets allow.

**Timing.** On the approval times in this book, FY31 revenue is about ₹610 Cr, and the eleven chips approach the ₹1,000 Cr level by FY33 (₹950 Cr). ₹1,000 Cr in FY31 is the stretch target. At a 10 % share in every market the eleven chips would earn about ₹540 Cr a year. Page 5 shows the ramp chip by chip.

**Two SKUs carry most of the plan.** The motor controller and the smart-meter SoC make up 57 % of the ₹1,000 Cr. The most unused room is in DG32-Max (SKU-10, ₹150 Cr), lockstep MCU (SKU-4, ₹109 Cr) and radar chip (SKU-7, ₹107 Cr), which is where we would grow next.

**DG32-Max and the BMS controller share one platform.** The BMS controller reuses the DG32-Max processor, bus, CAN-FD and security blocks, so the second chip builds directly on the first.

[pdf p.5]

### **Path to revenue**

RTL is ready for ten of the eleven chips; only the BMS controller is still at specification. Six chips also have their analog circuits designed and simulated — the motor controller, smart meter, PMIC, transceiver, supervisor and display driver; their layout and silicon proof follow on the prototypes. The radar front end is still to be designed. Nine chips go on the ChipFoundry December shuttle, deadline **26 December 2026** — SKU-1 to SKU-6 and SKU-8 to SKU-10, about ₹2.6 Cr of prototypes — so a design that fails, fails in 2027. The table shows the planned path from first silicon to volume for each chip.

|**SKU**|**2026–27**|**2028**|**FY29–FY31**|
|---|---|---|---|
|**SKU-10 DG32-Max**|**Dec 2026**: Prototype on the<br>ChipFoundry December shuttle<br>(deadline 26 Dec)<br>**2027**: Silicon brought up on our<br>own prototype boards before<br>tranche 2 (May)|**2028**: Industrial and drone design<br>wins, first production orders||
|**SKU-1 Motor**<br>**controller**|**Dec 2026**: Prototype on the<br>December shuttle|**2028**: Industrial, drone and robot<br>design wins; EV qualification<br>starts|**FY29–FY31**: Industrial ramp from<br>FY29; EV from FY30; cost-down<br>chip for fans and appliances|
|**SKU-2 Smart meter**|**Dec 2026**: Prototype on the<br>December shuttle|**2028**: BIS IS 16444 meter<br>certification with a meter maker|**FY29–FY31**: Utility tenders|
|**SKU-3, 5, 6, 8**|**Dec 2026**: Prototypes on the<br>December shuttle (SKU-3 tests its<br>low-voltage part)|**2028**: Military screening of<br>SKU-6 starts — the pathfinder for<br>every defence part|**FY30–FY31**: Defence, railway<br>and industrial approvals; SCL<br>production grades|
|**SKU-9 Zonal gateway**|**Dec 2026**: Prototype on the<br>December shuttle||**2029–2030**: Automotive approval<br>**FY31**: First volume|
|**SKU-4 Lockstep MCU**|**Dec 2026**: Prototype on the<br>December shuttle||**2029–2030**: Automotive approval<br>**FY31**: First volume|
|**SKU-7 Radar**|**2027**: Front end on an IHP<br>silicon-germanium run||**2029–2030**: Automotive approval<br>**FY31**: First volume|
|**SKU-11 BMS**<br>**controller**|**2027**: RTL on the DG32-Max<br>platform|**2028**: Prototype with an AFE<br>partner|**FY30–FY31**: Pack-maker design<br>wins|

### **How long approval takes**

Each market approves new chips differently. These are typical times from working silicon to first volume order, based on industry practice; they are our planning estimates.

|**Market**|**Approval**|**Typical time**|
|---|---|---|
|**Industrial, consumer, drones**|customer qualification|6–12 months|
|**Smart meters**|BIS IS 16444 + utility tender|12–18 months|
|**Automotive**|AEC-Q100 + carmaker design-in|18–36 months|
|**Defence**|MIL screening + approved-vendor listing|18–36 months|
|**Railways**|RDSO approval|12–24 months|
|**Space**|radiation testing + ISRO qualification|18–36 months|

**What this means for FY31.** DG32-Max and the motor controller’s industrial, drone and robot markets can earn revenue from FY29; the motor controller’s EV market follows automotive approval, from FY30. Smart meters follow certification in 2028. Defence, railway, automotive and space approvals take 12–36 months after silicon, so their FY31 lines depend on first silicon in 2027 and on approvals landing on time. That timing, not market size, is the main risk in the plan.

[pdf p.6]

### **What the funding buys**

The mature-node chips are funded in two tranches. **Tranche 1,** ₹ **10 Cr** , takes nine chips to tape-out. **Tranche 2,** ₹ **40 Cr in May 2027** , is raised after the silicon is working on our prototype boards, and carries the chips to production. Our PCB engine generates a board in a day, so boards are ready about 15 days later and are built while the wafers are still in the fab: bring-up starts the week the silicon arrives.

#### **Tranche 1 milestones:**

1. Nine chips taped out on the December 2026 shuttle by 26 December (every SKU except the radar and the BMS controller).

2. Prototype boards built while the wafers are in the fab, and the silicon brought up on them before May 2027 — if a design fails, we learn it in weeks, not quarters.

#### **Tranche 2 milestones:**

1. A design partner signed for the motor controller and for the smart-meter SoC by Q4 2027.

2. The voltage supervisor entered into military screening by Q1 2028, opening the path for every defence part.

3. Production masks and qualification under way for the lead chips; radar (IHP) and BMS controller prototypes in 2027–28.

**Team capacity.** The team is kept lean until tranche 2 — ₹1.0 Cr to March 2027, then ₹1.5 Cr over the next 12 months — so that tranche 1 can hold ₹2.5 Cr for respins. It carries the nine December prototypes through layout and bring-up; tranche 2 grows it for production, qualification and customer support. **Customer evidence:** this book claims no purchase orders or letters of intent; signing design partners is a tranche 2 milestone.

### **Proposed use of tranche 1 (₹10 Cr)**

|**Use**|**₹ Cr**|**What it delivers**|
|---|---|---|
|**Nine prototypes, December 2026 shuttle**|2.6|SKU-1 to SKU-6 and SKU-8 to SKU-10 at about ₹0.29 Cr each ($15 K slot +<br>$15 K IP and other costs)|
|**Bring-up and evaluation boards**|0.1|Respins come from contingency|
|**First approvals**|1.0|Military screening of SKU-6; meter certification work with a partner|
|**Respin reserve**|2.5|About eight prototype re-runs at ₹0.29 Cr each, held inside tranche 1|
|**Engineering team**|2.5|₹1.0 Cr to March 2027, ₹1.5 Cr for the following 12 months; tranche 2 grows<br>the team|
|**Design tools and lab**|1.0|EDA licences, test equipment|
|**Contingency**|0.3|General contingency|
|**Total**|**10.0**|Production masks for the lead chips come from tranche 2 (and the DLI<br>scheme, if approved)|

### **Financing path**

|**Round**|**When**|**Funds**|**Gated by**|
|---|---|---|---|
|**Tranche 1, ₹10 Cr**|2026–27|Nine December prototypes, first approvals, team|Raise|
|**DLI reimbursement, up to 50 % of**<br>**design cost**|2027–28|Part of production masks for the lead chips|Scheme approval|
|**Tranche 2, ₹40 Cr**|May 2027|Production masks and qualification for the lead chips;<br>radar and BMS prototypes; respins; team growth|Silicon working on<br>prototype boards|
|**Track B round, ₹50 Cr**|after<br>mature-node<br>revenue|D100 drone chip at 28 nm|Revenue|

The DLI scheme was announced for 2021–26; its extension and DeepGrid’s application are still to be confirmed, so the plan does not depend on it; tranche 2 covers the gap if it is not available. Development cost excludes engineering salaries, which sit in the team line, and assumes no respin; each analog respin adds about ₹0.29 Cr, one more prototype run.

[pdf p.7]

**Government support.** Under MeitY’s Design Linked Incentive scheme, up to 50 % of eligible design cost is reimbursed (capped at ₹15 Cr per application), and 4–6 % of net sales is paid for five years after deployment (capped at ₹30 Cr).

### **Development cost per chip**

Each chip needs a prototype run — **about** ₹ **29 lakh per chip** : a $15,000 shuttle slot plus about $15,000 for IP and other costs — then a production mask set and qualification for its markets. The prototype cost is our figure; the ChipFoundry shuttle and licensed blocks are quoted ($23–50 K for DG32-Max); mask and qualification costs are our planning estimates.

|**SKU**|**Development cost**|**SKU**|**Development cost**|
|---|---|---|---|
|**SKU-1 BLDC Motor Controller**|₹5.2–11.1 Cr|SKU-7 4D Radar RF|₹6.4–12.8 Cr|
|**SKU-2 Smart-Meter SoC**|₹2.2–4.6 Cr|SKU-8 Display Driver|₹2.4–5.3 Cr|
|**SKU-3 Hi-Rel PMIC**|₹5–11.1 Cr|SKU-9 SDV Zonal Gateway|₹3.8–8.8 Cr|
|**SKU-4 Lockstep MCU**|₹3.4–7.8 Cr|SKU-10 DG32-Max Secure MCU|₹2.1–4.3 Cr|
|**SKU-5 Interface Transceiver**|₹3.9–9.3 Cr|SKU-11 SOH-Aware BMS Controller|₹3.4–7.8 Cr|
|**SKU-6 Voltage Supervisor**|₹3.9–8.3 Cr|**All eleven**|**₹41.7–91.2 Cr**|

|**Cost item**|**Estimate per chip**|**Applies to**|
|---|---|---|
|**Prototype run**|₹0.29 Cr|every chip; a second for the SKU-1 cost-down chip|
|**Licensed IP blocks**|₹0.1–0.5 Cr|most chips; ₹0.5–1.5 Cr for SKU-9 (Ethernet, security)|
|**Production mask set, 130/180 nm**|₹1.5–3 Cr|every chip; a second set for SKU-3 and SKU-6 (SCL)<br>and the SKU-1 cost-down chip|
|**Industrial qualification**|₹0.2–0.5 Cr|SKU-2, 10|
|**AEC-Q100 + ISO 26262 process**|₹1.5–4 Cr|SKU-1 (EV), 4, 5 (cars), 7, 9, 11|
|**MIL screening**|₹0.5–1.5 Cr|SKU-3, 5, 6, 8|
|**RDSO / EN 50155**|₹0.3–0.8 Cr|SKU-3|
|**Radiation testing (TID/SEE)**|₹0.8–2 Cr|SKU-3|
|**BIS meter certification**|₹0.1–0.3 Cr|SKU-2|
|**SiGe mm-wave tape-outs and test**|₹3–5 Cr|SKU-7|

**Capital to FY31.** Beyond development cost, the plan needs working capital for wafers and stock — roughly ₹40–60 Cr by FY31, about three months of the cost of goods at FY31 revenue — plus the team, sales and support. Tranche 2 covers development and qualification through FY28; from FY29 gross profit carries most of it, as the table shows.

|₹ Cr|FY27|FY28|FY29|FY30|FY31|
|---|---|---|---|---|---|
|Development|4–9|13–27|10–23|8–18|6–14|
|Working capital (cumulative)|—|—|4–7|18–30|38–61|
|Equity raised|10|40|—|—|—|
|Gross profit from sales|—|—|42–52|177–222|365–456|

Need covers development (spread over the years each chip is built) and working capital at about three months of the cost of goods; it excludes team, sales and support costs. Gross profit is at a 60–75 % margin on the ramp. Tranche 1 holds a ₹2.5 Cr respin reserve, about eight prototype re-runs at ₹0.29 Cr each.

Across all eleven chips the development cost is ₹42–91 Cr, which is why the chips are funded in stages: tranche 1 covers the prototypes, tranche 2 the production masks and qualification, the incentive scheme up to half of design cost if approved, and early revenue the rest.

### **Unit cost at volume**

Estimated cost to make each chip, assuming a 200 mm wafer at $1,500–2,500 and typical yields. These are assumptions until we have a volume quote.

|**Chip**<br>**Die**<br>|**Package**|**Cost to make**|**Price**<br>**Gross margin**|
|---|---|---|---|

[pdf p.8]

|**Voltage supervisor**|~1 mm²|SOT-23|$0.09–0.17|$0.2–0.8|66–82 % at $0.50|
|---|---|---|---|---|---|
|**Interface transceiver**|~2 mm²|SOIC-8|$0.17–0.30|$0.4–1.5|68–82 % at $0.95|
|**Motor controller, fan cut**|~3 mm²|QFN-24|$0.27–0.47|$0.5–1.5|53–73 % at $1.00|
|**DG32-Max**|~15 mm²|QFN-64|$1.3–2.3|$3–8|58–76 % at $5.50|

Fans run below the 60 % margin target at the low end, which is why they follow the higher-margin markets. **Production:** 130 nm chips at SkyWater (US), 180 nm chips at SCL Mohali, and the radar front end at IHP (Germany). SkyWater’s automotive (AEC-Q100) readiness is still to be confirmed; automotive chips move to a qualified foundry if needed. **Competition:** Chinese suppliers price metering and motor-control chips aggressively, so we start where approved-vendor lists and country-of-origin rules favour local supply.

### **Revenue ramp**

Each chip’s revenue starts after its first silicon, its approval time from the table above, and the customer’s own design-in time. Automotive chips start last. The table shows the result, chip by chip, grouped.

|₹ Cr|FY29|FY30|FY31|FY32|FY33|
|---|---|---|---|---|---|
|DG32-Max, motor controller|₹70|₹210|₹366|₹430|₹430|
|Smart meter, transceiver, display|—|₹82|₹196|₹302|₹315|
|Supervisor, PMIC (defence first)|—|₹4|₹28|₹60|₹80|
|Automotive: SKU-4, 7, 9, 11|—|—|₹18|₹52|₹122|
|**Total**|**₹70**|**₹296**|**₹608**|**₹844**|**₹948**|

**Plan and stretch.** On these approval times FY31 revenue is about ₹ **610 Cr** , rising to ₹950 Cr in FY33 as the automotive chips ramp. The ₹1,000 Cr line split is the level the eleven chips reach once every approval has landed; reaching it in FY31 is the stretch target.

**Lower cases.** If only the four lead chips (DG32-Max, motor controller, smart meter, supervisor) ship, at 60 % of their lines, FY31 revenue is about ₹430 Cr. At a 10 % share in every market instead of the planned shares, the eleven chips would earn about ₹540 Cr a year once approved.

### **Where the numbers come from**

Smart meters: Ministry of Power, July 2026 — 20.33 crore meters sanctioned under RDSS, 5.73 crore installed by June 2026, deadline extended to March 2028. Ceiling fans: 44 million made in India in 2025 (IMARC). Air conditioners: 12–15 million a year, over 75 % inverter (ICRA). Kavach: fitted on 6,290 locomotives, with 7,190 more and 1,200 EMU/MEMU trains in progress (July 2026). EVs: 24.5 lakh registered in FY26 (Vahan). Incentives: MeitY DLI scheme. Shuttle cost: ChipFoundry quote, October 2026. All other unit and price ranges are our estimates.

[pdf p.9]

### SKU-1 · BLDC Motor Controller: architecture diagram

_Architecture diagram on page 9 of the PDF._

[pdf p.10]

### **SKU-1 · BLDC Motor Controller**

### **What it is**

A single chip that runs a brushless motor: a DGridRiscV processor, a hardware speed and torque control loop that reacts in under a microsecond, seven PWM outputs, and control of the motor’s supply from 5 V to 120 V (with external power switches above 20 V). Secrets are stored on-chip and firmware in external flash. A full version serves traction, drives, drones and robots; a smaller, cheaper version serves fans and appliances.

### **What it replaces**

DRV83xx-class gate driver plus an external MCU — a two-chip set collapsed onto one die, with runtime star/delta selection. In fans and appliances it displaces the imported motor-control MCU that every BLDC board carries. Main competitors: TI, Infineon and ST, and low-cost Chinese motor-control chips.

### **What the market is worth**

Every brushless motor needs a controller, and India is moving whole product groups to brushless motors: ceiling fans under the BEE star rating, inverter air conditioners, refrigerators and washing machines, and the motors in every drone and robot joint. We count six markets.

|Market|Controllers / yr|Price range|Addressable market|At mid|
|---|---|---|---|---|
|EV traction|2 M – 6 M|$4 – 8|₹76 Cr – ₹458 Cr|₹229 Cr|
|Industrial drives|3 M – 9 M|$3 – 7|₹86 Cr – ₹601 Cr|₹286 Cr|
|Ceiling fans|5 M – 20 M|$0.5 – 1.5|₹24 Cr – ₹286 Cr|₹119 Cr|
|Home appliances|15 M – 40 M|$1 – 3|₹143 Cr – ₹1,145 Cr|₹525 Cr|
|Drones|0.2 M – 2 M|$2 – 6|₹3.8 Cr – ₹114 Cr|₹42 Cr|
|Robotics|0.1 M – 1 M|$4 – 12|₹3.8 Cr – ₹114 Cr|₹42 Cr|
|**All six**|**25 M – 78 M**||**₹337 Cr – ₹2,719 Cr**|**₹1,243 Cr**|

Together that is ₹ **337 Cr –** ₹ **2,719 Cr a year** , on 25–78 million controllers. Fans and appliances bring the volume at a low price; drones and robots are small today but growing fastest. All figures are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **320 Cr** . At the middle of the estimates the markets are worth ₹ **1,243 Cr a year** , so we need **26 %** of the market.

PLAUSIBLE  — a realistic target for a qualified supplier, and the plan does not depend on any one market. At the high end of the estimates we would need only **12 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **373 Cr a year** — ₹53 Cr more than the plan.

### **What it earns**

|Unit economics|EV traction|Industrial drives|Ceiling fans|Home appliance|s Drones|Robotics|
|---|---|---|---|---|---|---|
|Price, middle of range|$6.00|$5.00|$1.00|$2.00|$4.00|$8.00|
|Gross profit per unit|$3.60 – 4.50|$3.00 – 3.75|$0.60 – 0.75|$1.20 – 1.50|$2.40 – 3.00|$4.80 – 6.00|
|Units to pay back develo|pment<br>121 K – 323 K|145 K – 388 K|727 K – 1,939 K|363 K – 970 K|182 K – 485 K|91 K – 242 K|

_Gross margin target 60–75 %. Development cost for this chip, including masks and qualification:_ ₹ _5.2–11.1 Cr._

[pdf p.11]

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales in every market. Fans and appliances need the most units to pay back — up to 1,939 K — because their price is lowest, and they need the cost-down version of the chip. The larger risk is how quickly the appliance and EV design wins arrive.

### **Who buys it**

Captive: every ASWA actuator joint and every D100 module. Commercial: wherever a brushless motor turns — EV and industrial drives, BLDC ceiling fans, inverter appliances, drones and robot actuators, 25–78 M controllers a year in India. Target buyers include EV makers (Ather, TVS, Bajaj), fan makers (Atomberg, Crompton, Havells) and drone makers (ideaForge) (no engagement claimed).

### **Policy and demand**

The defence procurement list (PIL-5) names a BLDC motor with encoder for the ATGM programme. BEE star rating is moving ceiling fans to BLDC, and inverter compressors are already the norm in new air conditioners. Drone and robotics programmes add country-of-origin rules on top.

### **Why this node**

Up to about 20 V the gate drive, regulator and processor share one die; higher motor rails, up to 120 V, use external power switches the chip drives. An advanced node would push even the gate drive back onto the board. The fan-and-appliance cut drops the buck-boost and most of the memory to reach its price.

### **Status**

RTL ready, and the analog gate-drive and sensing circuits are designed and simulated (schematic and SPICE). FPGA prototype on Artix-7 at 81.25 MHz is validation only. Product is a 130 nm chip at 100 MHz, the speed DG32-Max is built for on SKY130. Secrets are kept in on-chip ReRAM and firmware in external flash. First MPW: cycle 1. The cost-down cut for fans and appliances is a second tape-out on the same RTL.

[pdf p.12]

### SKU-2 · Smart-Meter SoC: architecture diagram

_Architecture diagram on page 12 of the PDF._

[pdf p.13]

### **SKU-2 · Smart-Meter SoC**

### **What it is**

A single chip for an electricity meter: a six-channel, high-precision converter that measures voltage and current, logic that computes energy and power quality, encryption to protect billing data, and a clock domain that runs on under 2 µW during power cuts. One chip for every point where energy is billed or measured.

### **What it replaces**

ADE9153 / V9203-class metering AFE plus a separate meter MCU — one chip instead of two. Main competitors: Renesas, ST, Analog Devices and Chinese metering chips such as Vango.

### **What the market is worth**

The same metering chip sits wherever electricity is billed or measured: in household meters, on distribution transformers and feeders, in commercial and industrial meters, in rooftop-solar net meters, inside EV chargers, and in building submeters and smart plugs. We count five markets.

|Market|Units / yr|Price range|Addressable market|At mid|
|---|---|---|---|---|
|Household|8 M – 14 M|$2 – 5|₹153 Cr – ₹668 Cr|₹367 Cr|
|DT, feeder, C&I|1 M – 4 M|$4 – 10|₹38 Cr – ₹382 Cr|₹167 Cr|
|Rooftop solar|2 M – 6 M|$2 – 5|₹38 Cr – ₹286 Cr|₹134 Cr|
|EV chargers|0.2 M – 1 M|$3 – 8|₹5.7 Cr – ₹76 Cr|₹31 Cr|
|Submetering|5 M – 20 M|$0.8 – 2|₹38 Cr – ₹382 Cr|₹167 Cr|
|**All five**|**16 M – 45 M**||**₹273 Cr – ₹1,794 Cr**|**₹866 Cr**|

Together that is ₹ **273 Cr –** ₹ **1,794 Cr a year** , on 16–45 million parts. The RDSS deadline is March 2028, but 14.6 crore of the 20.33 crore sanctioned meters were still to be installed in June 2026; at the 2025–26 pace of about 1.1 crore a year, installation runs well past 2028. After the rollout, demand comes from replacing meters, new connections and rooftop solar. Household meters are the core. Transformer and industrial meters carry a higher price, and rooftop solar and submetering add volume. All figures are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **250 Cr** . At the middle of the estimates the markets are worth ₹ **866 Cr a year** , so we need **29 %** of the market.

PLAUSIBLE — electricity boards buy only BIS-certified meters through approved tenders, and tamper detection is a tender requirement. Once a metering chip is approved, it tends to stay in use for many years.

**Downside case.** Without household meters, the other four markets are worth ₹499 Cr a year at mid, and the line would need 50 %. The plan depends on household meter demand continuing after RDSS. Signing a meter-maker design partner is a tranche 2 milestone.

At the high end of the estimates we would need only **14 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **260 Cr a year** — ₹9.9 Cr more than the plan.

[pdf p.14]

### **What it earns**

|Unit economics|Household|DT, feeder, C&I|Rooftop solar|EV chargers|Submetering|
|---|---|---|---|---|---|
|Price, middle of range|$3.50|$7.00|$3.50|$5.50|$1.40|
|Gross profit per unit|$2.10 – 2.62|$4.20 – 5.25|$2.10 – 2.62|$3.30 – 4.12|$0.84 – 1.05|
|Units to pay back develop|ment<br>88 K – 230 K|44 K – 115 K|88 K – 230 K|56 K – 146 K|220 K – 574 K|

_Gross margin target 60–75 %. Development cost for this chip, including masks and qualification:_ ₹ _2.2–4.6 Cr._

At plan volume the development cost is recovered within the first year of sales. The larger risk is time: BIS certification and the utility tender cycle.

### **Who buys it**

Household meters 8–14 M/yr at $2–5; transformer, feeder and C&I 1–4 M at $4–10; rooftop solar 2–6 M; EV chargers 0.2–1 M; submetering 5–20 M at $0.8–2 — 16–45 M a year in India. Target buyers include meter makers Genus Power, HPL Electric, Secure Meters and Landis+Gyr India (no engagement claimed).

### **Policy and demand**

Tamper detection is a tender requirement, not a feature — which makes it a silicon differentiator. RDSS funds the national prepaid smart-meter rollout; PM Surya Ghar targets one crore rooftop-solar homes, each needing a net meter; every public EV charger bills by energy.

### **Why this node**

A 24-bit ΔΣ needs precision poly resistors, MiM caps and real device matching. 130 nm has all three; fine nodes trade them away.

### **Status**

RTL ready and FPGA-validated, and the analog front end (the six-channel converter) is designed and simulated (schematic and SPICE); 130 nm chip at 100 MHz. Firmware sits in ROM, error-corrected SRAM and encrypted external flash, with an SCL eNVM variant for sealed meters. Cycle-1 MPW alongside SKU-1.

[pdf p.15]

### SKU-3 · Hi-Rel PMIC: architecture diagram

_Architecture diagram on page 15 of the PDF._

[pdf p.16]

### **SKU-3 · Hi-Rel PMIC**

### **What it is**

A power-management chip for harsh environments: it takes a 28 V supply that meets aircraft and military noise standards, steps it down, and produces four sequenced supply rails with current limits. Its control logic is hardened against radiation upsets. One chip, made in three screened grades: military, railway and space.

### **What it replaces**

TI and ADI QML power sockets in avionics and vetronics LRUs; imported EN 50155-grade power parts in Indian rolling stock and signalling; imported radiation-tolerant PMICs on Indian satellites and launchers. Main competitors: TI, Analog Devices and Renesas (Intersil) radiation-tolerant parts.

### **What the market is worth**

One chip, made in three screened grades, serves three markets: **military** (avionics and vetronics LRUs, screened to MIL-883), **railways** (about 1,900 locomotives and 6,300 coaches built a year, Kavach fitted on 6,290 locomotives with 7,190 more in progress, and 1,009 stations, and metro signalling, with tens of power rails each) and **space** (ISRO and NewSpace satellites and launch vehicles, about 20–50 a year with 100–200 power parts each, radiation-tolerant).

|Market|Units / yr|Price range|Addressable market|At mid|
|---|---|---|---|---|
|Military|10 K – 50 K|$50 – 200|₹4.8 Cr – ₹95 Cr|₹36 Cr|
|Railways|150 K – 500 K|$8 – 25|₹11 Cr – ₹119 Cr|₹51 Cr|
|Space|2 K – 10 K|$300 – 1,500|₹5.7 Cr – ₹143 Cr|₹52 Cr|
|**All three**|**162 K – 560 K**||**₹22 Cr – ₹358 Cr**|**₹138 Cr**|

Together that is ₹ **22 Cr –** ₹ **358 Cr a year** . Railways bring the volume; space brings the price, with a space-grade part selling for about seven times the military one. All figures are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **40 Cr** . At the middle of the estimates the markets are worth ₹ **138 Cr a year** , so we need **29 %** of the market.

PLAUSIBLE — all three markets buy only from approved suppliers: the defence approved-vendor list, railway approval and ISRO’s qualified parts. Few suppliers qualify, and an approved part stays in use for many years.

At the high end of the estimates we would need only **11 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **42 Cr a year** — ₹1.5 Cr more than the plan.

### **What it earns**

|Unit economics|Military|Railways|Space|
|---|---|---|---|
|Price, middle of range|$125.00|$16.50|$900.00|
|Gross margin target|60 – 75 %|60 – 75 %|60 – 75 %|
|Implied cost of goods|$31.25 – 50.00|$4.12 – 6.60|$225.00 – 360.00|
|Gross profit per unit|$75.00 – 93.75|$9.90 – 12.38|$540.00 – 675.00|
|Units to pay back development|5,590 – 15,514|42,352 – 117,527|776 – 2,155|

[pdf p.17]

At plan volume the development cost, ₹5–11.1 Cr including both mask sets and qualification (but not engineering salaries), is recovered within the first year of sales. The risk is time: the railway grade needs EN 50155 and RDSO approval and the space grade a radiation test campaign, which take 12–24 and 18–36 months.

### **Who buys it**

Military: 10–50 K/yr at $50–200, AVL-locked for decades once listed. Railways: 150–500 K/yr at $8–25, the volume tier. Space: 2–10 K/yr at $300–1,500, the value tier. Target buyers include BEL and HAL, Kavach suppliers such as HBL and Medha, and ISRO and private satellite makers (no engagement claimed).

### **Policy and demand**

Military: SRIJAN NSG-5962 class; PIL-5 lists two Tank DC-DC converters (16–40 V in, 4 A) from BEL, due Dec 2026 and Dec 2028. Railways: Kavach, India’s own train-protection system, is being fitted across locomotives and route kilometres, with RDSO approval as the gate. Space: the Indian Space Policy 2023 and IN-SPACe opened launch and satellite building to private firms, and radiation-tolerant power parts are almost all imported and often export-controlled.

### **Why this node**

LDMOS and thick-oxide options put a 28 V front end and a 0.9 V rail on the same die. The same front end fits a spacecraft’s 28 V bus and sits behind a train’s isolated 110 V converter. Radiation hardening comes from the design: hardened latches and triple redundancy in the control logic.

### **Status**

RTL ready for the digital sequencer and telemetry, and the analog power circuits are designed and simulated (schematic and SPICE). The sky130 prototype tests the control logic and low-voltage rails; the 28 V front end and power stage arrive on SCL 180 nm. 883 screening flow. SEU hardening by design — DICE latches and TMR on the sequencer FSM. No rad-hard claim beyond that: the space grade is radiation-tolerant for LEO and launch vehicles, proven by a TID/SEE test campaign. The railway grade needs EN 50155 and RDSO approval. Both are included in its ₹5.1–11.2 Cr development cost.

[pdf p.18]

### SKU-4 · Lockstep MCU: architecture diagram

_Architecture diagram on page 18 of the PDF._

[pdf p.19]

### **SKU-4 · Lockstep MCU**

### **What it is**

Two DGridRiscV processors run the same code two cycles apart, and a checker compares them; any mismatch raises a fault signal within two cycles. Memory and bus carry error-correcting codes end to end.

### **What it replaces**

Functional-safety microcontrollers from Microchip and Renesas. Main competitors: Infineon AURIX, TI Hercules and NXP.

### **What the market is worth**

**3 M – 10 M units a year** are addressable in India — about 5 million cars and commercial vehicles a year, each with one or two braking, steering or motor-safety controllers, plus industrial safety controllers and robot joints (battery management is counted under SKU-11). At **$4–12** a chip, that is a market of ₹ **114 Cr –** ₹ **1,145 Cr a year** , or $12 M – $120 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **40 Cr** . At the middle price of **$8.00** that is **524 K units a year** , or **8 %** of the middle volume estimate of 6.5 M units.

CONSERVATIVE  — the plan needs well under a fifth of the market, so there is plenty of room.

At the high end of the estimates we would need only **3 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **149 Cr a year** — ₹109 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$8.00**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$2.00 – $3.20 per unit|
|Gross profit per unit|**$4.80 – $6.00**|
|Development cost, incl. qualification|**₹3.4 – 7.8 Cr**|
|Units to pay back development|**59 K – 170 K**|
|Share of one year’s plan volume|32.5 % of 524 K units|

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales. The larger risk is the time it takes to qualify the chip and reach that volume.

### **Who buys it**

EV battery management, motor-safety supervision, braking and steering controllers and robot joints — and the safety processor beside SKU-1 and inside the D100 drone chip.

### **Policy and demand**

The design targets the ISO 26262 ASIL-D automotive safety level. The lockstep checker has been fault-injection tested in RTL simulation.

[pdf p.20]

### **Why this node**

Running two processors costs chip area, not speed. A mature node makes that redundancy, and radiation-hardened latches, affordable.

### **Status**

RTL ready; prototype on the December 2026 shuttle. Validated on FPGA at 81.25 MHz; the product is a 130 nm chip at 100 MHz. The first version uses ROM, SRAM and encrypted external flash; an embedded-flash variant follows on SCL 180 nm.

[pdf p.21]

### SKU-5 · Interface Transceiver: architecture diagram

_Architecture diagram on page 21 of the PDF._

[pdf p.22]

### **SKU-5 · Interface Transceiver**

### **What it is**

Line drivers and receivers for industrial and vehicle buses (CAN and RS-485 class): 5 V thick-oxide output stages, noise-tolerant receivers, a safe idle state if a wire breaks, and ±15 kV ESD protection.

### **What it replaces**

Interface chips from TI, ADI and Renesas — many of which defence platforms can no longer buy. Main competitors: TI, NXP and Microchip.

### **What the market is worth**

**20 M – 60 M units a year** are addressable in India — about 5 million CAN-equipped cars and commercial vehicles a year with 5–20 bus nodes each, plus industrial networks; we count the 20–60 million nodes that use a separate transceiver chip. At **$0.4–1.5** a chip, that is a market of ₹ **76 Cr –** ₹ **859 Cr a year** , or $8 M – $90 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **45 Cr** . At the middle price of **$0.95** that is **5.0 M units a year** , or **12 %** of the middle volume estimate of 40 M units.

CONSERVATIVE  — the plan needs well under a fifth of the market, so there is plenty of room.

At the high end of the estimates we would need only **5 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **109 Cr a year** — ₹64 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$0.95**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$0.24 – $0.38 per unit|
|Gross profit per unit|**$0.57 – $0.71**|
|Development cost, incl. qualification|**₹3.9 – 9.3 Cr**|
|Units to pay back development|**574 K – 1710 K**|
|Share of one year’s plan volume|34.4 % of 5.0 M units|

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales. The larger risk is the time it takes to qualify the chip and reach that volume.

### **Who buys it**

20–60 M a year: one ships with every node on every bus, at $0.4–1.5 commercial, with screened grades priced far higher.

### **Policy and demand**

Replacing obsolete parts is the quickest sale to defence PSUs: the part is already designed into a platform that can no longer buy it.

[pdf p.23]

### **Why this node**

Fine nodes are worse for this kind of part. A 5 V-tolerant thick-oxide output stage is exactly what a line driver needs, and only mature nodes offer it.

### **Status**

RTL ready for the digital logic, and the analog line drivers are designed and simulated (schematic and SPICE); layout and silicon proof follow on the second MPW cycle. Designed to the ISO 11898-2 bus standard; a high-voltage bus-fault version can follow on SCL or IHP. Planned for the second MPW cycle.

[pdf p.24]

### SKU-6 · Voltage Supervisor: architecture diagram

_Architecture diagram on page 24 of the PDF._

[pdf p.25]

### **SKU-6 · Voltage Supervisor**

### **What it is**

Watches a board’s supply voltages and resets the system if any drifts out of range: precise comparators, matched resistor ladders, an 8 µs filter against switching noise, a temperature-stable reference and a windowed watchdog.

### **What it replaces**

Supervisor chips from TI and Maxim, which sit on almost every circuit board. Main competitors: TI, Analog Devices (Maxim) and low-cost Asian suppliers.

### **What the market is worth**

A voltage supervisor sits on nearly every circuit board. We sell it in two grades: a screened defence grade in small volumes at a high price, and a commercial grade in large volumes at a low price.

|Market|Units / yr|Price range|Addressable market|At mid|
|---|---|---|---|---|
|Defence grade|0.02 M – 0.1 M|$5 – 50|₹1.0 Cr – ₹48 Cr|₹16 Cr|
|Commercial grade|30 M – 80 M|$0.2 – 0.8|₹57 Cr – ₹611 Cr|₹262 Cr|
|**Both grades**|**30 M – 80 M**||**₹58 Cr – ₹658 Cr**|**₹278 Cr**|

Together that is ₹ **58 Cr –** ₹ **658 Cr a year** , on 30–80 million parts. The defence grade sells first, through military screening; the commercial grade follows on a second, cheaper version. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **40 Cr** . At the middle of the estimates the markets are worth ₹ **278 Cr a year** , so we need **14 %** of the market.

PLAUSIBLE  — the defence grade wins on approval and local supply; the commercial grade needs only a small share of a very large market.

At the high end of the estimates we would need only **6 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **83 Cr a year** — ₹43 Cr more than the plan.

### **What it earns**

|Unit economics|Defence grade|Commercial grade|
|---|---|---|
|Price, middle of range|$27.50|$0.50|
|Gross profit per unit|$16.50 – 20.62|$0.30 – 0.38|
|Units to pay back develop|ment<br>20 K – 53 K|1,090 K – 2,900 K|

_Gross margin target 60–75 %. Development cost for this chip, including masks and qualification:_ ₹ _3.9–8.3 Cr._

At plan volume the development cost is recovered within the first year of sales. Of the ₹40 Cr line, about ₹4 Cr comes from the defence grade and ₹36 Cr from the commercial grade, which ramps later.

### **Who buys it**

Target buyers include BEL and other defence PSUs for the defence grade, and Indian electronics manufacturers for the commercial grade (no engagement claimed). Defence grade: every defence electronics unit and every D100 module, 20–100 K a year. Commercial grade: one or more on nearly every circuit board, 30–80 M a year — the highest unit count in the range.

[pdf p.26]

### **Policy and demand**

The simplest chip in the range, so it goes through military screening first and sets up the qualification flow for the parts behind it.

### **Why this node**

Accurate thresholds from −40 to +125 °C come from a trimmed reference and matched resistors — a strength of mature nodes.

### **Status**

RTL ready for the digital logic (watchdog, filters, fault latch), and the analog comparators and reference are designed and simulated; layout and silicon proof follow on the sky130 prototype, with production on SCL 180 nm.

[pdf p.27]

### SKU-7 · 4D Radar RF: architecture diagram

_Architecture diagram on page 27 of the PDF._

[pdf p.28]

### **SKU-7 · 4D Radar RF**

### **What it is**

A 77 GHz radar chipset (with a 24 GHz variant) with 2 transmit and 4 receive channels: a silicon-germanium radio front end and a CMOS signal-processing chip.

### **What it replaces**

Imported 77 GHz radar front ends and the processing chips that go with them. Main competitors: TI, NXP, Infineon and Calterah.

### **What the market is worth**

**1 M – 5 M units a year** are addressable in India — about 5 million cars a year in India, a radar attach rate rising to 10–30 % with one to five radars per car by FY31, plus security radar, and defence radar from FY30. At **$8–25** a chip, that is a market of ₹ **76 Cr –** ₹ **1,192 Cr a year** , or $8 M – $125 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **35 Cr** . At the middle price of **$16.50** that is **222 K units a year** , or **7 %** of the middle volume estimate of 3 M units.

CONSERVATIVE  — the plan needs well under a fifth of the market, so there is plenty of room.

At the high end of the estimates we would need only **3 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **142 Cr a year** — ₹107 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$16.50**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$4.12 – $6.60 per unit|
|Gross profit per unit|**$9.90 – $12.38**|
|Development cost, incl. qualification|**₹6.4 – 12.8 Cr**|
|Units to pay back development|**54 K – 136 K**|
|Share of one year’s plan volume|61.0 % of 222 K units|

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales. The larger risk is the time it takes to qualify the chip and reach that volume.

### **Who buys it**

1–5 M radars a year in India at $8–25, plus defence radar from FY30, after approval.

### **Policy and demand**

Defence procurement lists name radar warning receivers for the Su-30 MKI and Mi-17, weapon-locating radar, battlefield surveillance radar and shipborne and precision-approach radar.

[pdf p.29]

### **Why this node**

The one SKU where the process is a hard limit: 130 nm CMOS cannot reach 77 GHz. Fine-node RF-CMOS (40–45 nm) can, but at a much higher mask cost, so the front end uses IHP’s silicon-germanium process.

### **Status**

RTL ready for the CMOS signal-processing chip, validated on FPGA. The silicon-germanium front end can only be proven on silicon, on IHP SG13G2.

[pdf p.30]

### SKU-8 · Display Driver: architecture diagram

_Architecture diagram on page 30 of the PDF._

[pdf p.31]

### **SKU-8 · Display Driver**

### **What it is**

Drives rugged and industrial LCD panels: takes LVDS or MIPI video in, corrects colour, and drives the panel columns through high-voltage amplifiers. We count one chipset per panel: a timing chip plus its column drivers, priced together.

### **What it replaces**

Imported timing-controller and column-driver chipsets in rugged and industrial displays. Main competitors: Novatek and Himax.

### **What the market is worth**

**0.5 M – 2 M units a year** are addressable in India — rugged and industrial displays assembled in India for defence, railways, industrial panels and medical equipment, about 0.5–2 million panels a year. At **$3–12** a chip, that is a market of ₹ **14 Cr –** ₹ **229 Cr a year** , or $2 M – $24 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **20 Cr** . At the middle price of **$7.50** that is **280 K units a year** , or **22 %** of the middle volume estimate of 1.25 M units.

PLAUSIBLE  — a realistic target for a qualified supplier in a market that buys from approved vendors.

At the high end of the estimates we would need only **9 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **27 Cr a year** — ₹6.8 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$7.50**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$1.88 – $3.00 per unit|
|Gross profit per unit|**$4.50 – $5.62**|
|Development cost, incl. qualification|**₹2.4 – 5.3 Cr**|
|Units to pay back development|**45 K – 123 K**|
|Share of one year’s plan volume|44.2 % of 280 K units|

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales. The larger risk is the time it takes to qualify the chip and reach that volume.

### **Who buys it**

0.5–2 M rugged and industrial display drivers a year in India at $3–12.

### **Policy and demand**

The defence procurement list names a 17-inch rugged SXGA display from BEL, due December 2027.

### **Why this node**

Panel columns need a 0–12 V swing — a high-voltage, thick-oxide job that mature nodes do best.

[pdf p.32]

### **Status**

RTL ready for the digital logic (video input, colour, timing controller), and the high-voltage column amplifiers are designed and simulated; layout and silicon proof follow on the first prototype. A cockpit-display version is the same chip with a wider temperature range.

[pdf p.33]

### SKU-9 · SDV Zonal Gateway: architecture diagram

_Architecture diagram on page 33 of the PDF._

[pdf p.34]

### **SKU-9 · SDV Zonal Gateway**

### **What it is**

The network hub for a software-defined vehicle zone: a lockstep safety processor, a full hardware security module, secure boot with two firmware slots, over-the-air updates, a time-sensitive Ethernet switch, six vehicle network types and 16 electronic fuses.

### **What it replaces**

Imported zonal controllers and CAN/LIN/FlexRay-to-Ethernet gateways. Main competitors: NXP (S32G), Renesas and Infineon.

### **What the market is worth**

**1 M – 4 M units a year** are addressable in India — about 5 million cars a year in India, 10–30 % moving to zonal design by FY31, about three zone and gateway controllers per car. At **$6–20** a chip, that is a market of ₹ **57 Cr –** ₹ **763 Cr a year** , or $6 M – $80 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **60 Cr** . At the middle price of **$13.00** that is **484 K units a year** , or **19 %** of the middle volume estimate of 2.5 M units.

PLAUSIBLE  — a realistic target for a qualified supplier in a market that buys from approved vendors.

At the high end of the estimates we would need only **8 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **93 Cr a year** — ₹33 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$13.00**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$3.25 – $5.20 per unit|
|Gross profit per unit|**$7.80 – $9.75**|
|Development cost, incl. qualification|**₹3.8 – 8.8 Cr**|
|Units to pay back development|**41 K – 118 K**|
|Share of one year’s plan volume|24.4 % of 484 K units|

At plan volume the development cost (excluding engineering salaries) is recovered within the first year of sales. The larger risk is the time it takes to qualify the chip and reach that volume.

### **Who buys it**

1–4 M zonal and gateway controllers a year in India at $6–20.

### **Policy and demand**

Zonal design replaces the relay-and-harness box, saving cost and weight — the carmaker makes the case for us.

[pdf p.35]

### **Why this node**

A gateway needs many channels and predictable timing, not a fast clock. The Ethernet switch bounds the delay, not the processor.

### **Status**

RTL ready; prototype on the December 2026 shuttle. A 130 nm chip at 100 MHz for the zonal layer. Central vehicle computers need sub-10 nm chips and are not part of this plan.

[pdf p.36]

### SKU-10 · DG32-Max Secure MCU: architecture diagram

_Architecture diagram on page 36 of the PDF._

[pdf p.37]

### **SKU-10 · DG32-Max Secure MCU**

### **What it is**

A secure general-purpose microcontroller: two DGridRiscV processors running in lockstep, with built-in instructions for encryption and a 4 KB instruction cache, 128 KB of error-corrected memory, and a boot ROM that checks the firmware’s digital signature before running it (309 ms from reset). It adds CAN-FD, a 9-bit ADC, on-chip clocks, temperature and supply monitors, and debug access — 44 signal pins in a 64-pin package.

### **What it replaces**

MAX32655-class imported secure MCUs, and the separate secure element a board adds when it must boot only signed firmware. One die replaces the MCU-plus-secure-element pair. Main competitors: ST, Microchip, Analog Devices and GigaDevice.

### **What the market is worth**

**8 M – 25 M units a year** are addressable in India — secure 32-bit MCU sockets on industrial, drone, EV sub-controller and IoT-gateway boards, counted outside the ASIL-D sockets SKU-4 already claims so that no unit is counted twice. At **$3–8** a chip, that is a market of ₹ **229 Cr –** ₹ **1,908 Cr a year** , or $24 M – $200 M. Both bands are our estimates.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **110 Cr** . At the middle price of **$5.50** that is **2.1 M units a year** , or **13 %** of the middle volume estimate of 16.5 M units.

CONSERVATIVE  — the plan needs well under a fifth of the market, so there is plenty of room.

At the high end of the estimates we would need only **6 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **260 Cr a year** — ₹150 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$5.50**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$1.38 – $2.20 per unit|
|Gross profit per unit|**$3.30 – $4.12**|
|Development cost, incl. qualification|**₹2.1 – 4.3 Cr**|
|Units to pay back development|**53 K – 137 K**|
|Share of one year’s plan volume|6.5 % of 2.1 M units|

The development cost is recovered well inside the first year of sales. Part of it is already known: the December shuttle costs $23–50 K (₹0.22–0.48 Cr): the $15,000 slot plus memory, ReRAM and other licensed blocks. The rest is qualification. The main risk is winning customer designs, not the margin.

### **Who buys it**

Industrial controllers, drone flight controllers and ESCs, EV body and charger controllers, IoT gateways — 8–25 M/yr India at $3–8. Captive: the host platform inside SKU-1 and SKU-11. Target buyers include industrial controller, drone and EV-charger makers (no engagement claimed).

[pdf p.38]

### **Policy and demand**

Country-of-origin rules for defence and drone procurement (the D100 sheet cites them) bar land-border-nation components; an indigenous secure MCU built on an open PDK, with every layer auditable, answers that directly. Verified boot is the first security requirement buyers ask for, and here it is in mask ROM rather than in a second chip.

### **Why this node**

SKY130 through ChipFoundry’s OpenFrame is a $15,000 shuttle slot with 44 pads, and 100 MHz is enough for the control and crypto load. The node has two costs, both designed around: 128 KB of SRAM needs 32 ChipFoundry compiled macros (3.76 mm²), and SKY130 has no OTP or eFuse, so the root key lives in mask ROM and the device secrets and rollback counter in a 1 kbit ReRAM macro (Neuromorphic X1, $5,500, on the December shuttle).

### **Status**

RTL feature-complete on 1 Oct 2026: lockstep core, root of trust, I-cache, QSPI capture on the delay line, CAN-FD receive FIFO in dual-port RAM, and UART2 and SPI1 pin-muxed onto existing pads. Every bench and firmware test passes, including secure boot on all three test images. Next: synthesis and the Arty A7-100T FPGA proof, oscillator characterisation by the end of October, then place-and-route for the December 2026 OpenFrame shuttle. The OpenTitan root-of-trust subset follows in January.

[pdf p.39]

### SKU-11 · SOH-Aware BMS Controller: architecture diagram

_Architecture diagram on page 39 of the PDF._

[pdf p.40]

### **SKU-11 · SOH-Aware BMS Controller**

### **What it is**

A battery-management controller: the DG32-Max processor and security, an AI accelerator that estimates a battery’s charge, health and remaining life, an optional circuit that measures each cell’s impedance, and hardwired over-voltage, under-voltage, over-current and over-temperature protection that works even if the processor stops. The cell-measuring front end and the isolation chip are bought, not built.

### **What it replaces**

The MCU that sits beside a TI BQ769xx or ADI ADBMS AFE today, the separate neural accelerator a pack needs to run SOH inference at the edge (Eatron used a Syntiant NDP120), and the authentication chip — three parts become one. Main competitors: TI, Analog Devices, NXP and Infineon controller and AFE sets.

### **What the market is worth**

**3 M – 10 M units a year** are addressable in India — one controller per lithium pack across e-2W, lithium e-3W, cars, e-buses and CVs, plus grid BESS, inverter/UPS/telecom and swap packs. The floor is today’s base — about 2 M lithium EV packs in FY26 from 24.5 lakh EV registrations (lead-acid e-rickshaws carry no BMS and are excluded) plus stationary packs; the top is that base after five years at the 22–28 % growth the market deck reads. At **$2–6** a chip, that is a market of ₹ **57 Cr –** ₹ **572 Cr a year** , or $6 M – $60 M. Both bands are our estimates.

For scale: DeepGrid’s BMS market study (September 2026, citing IMARC and Vahan) puts India’s whole BMS market at ₹2,200 – 2,700 Cr a year bottom-up, close to IMARC’s $327.9 M (about ₹3,130 Cr) top-down. The top of our controller band is about a fifth of that system value, which is what the digital controller is worth on a BMS board. The unit base and the system market come from published figures in that deck; the controller band and ASP are ours.

### **What share we need, and whether that is realistic**

The plan line for this SKU — its yearly revenue once its approvals have landed — is ₹ **40 Cr** . At the middle price of **$4.00** that is **1.0 M units a year** , or **16 %** of the middle volume estimate of 6.5 M units.

PLAUSIBLE  — a realistic target for a qualified supplier in a market that buys from approved vendors. At the high end of the estimates we would need only **7 %** .

At a 30 % share, the most we plan any SKU to win, this part could reach ₹ **74 Cr a year** — ₹34 Cr more than the plan.

### **What it earns**

|Unit economics||
|---|---|
|Price, middle of range|**$4.00**|
|Gross margin target|**60 – 75 %**|
|Implied cost of goods|$1.00 – $1.60 per unit|
|Gross profit per unit|**$2.40 – $3.00**|
|Development cost, incl. qualification|**₹3.4 – 7.8 Cr**|
|Units to pay back development|**119 K – 341 K**|
|Share of one year’s plan volume|32.5 % of 1.0 M units|

[pdf p.41]

The development cost is recovered well inside the first year of volume production. Most of the design is reused — the DG32-Max platform, protection and power circuits ported to 130 nm from SKU-6 and SKU-3, AxCIM-AI and the PUF IP — so the new design is the feature DSP, the EIS engine, the contactor interface and the AFE bridge. The risk on this SKU is the AFE partner and the field dataset, not the margin.

### **Who buys it**

Lead tier: centralised e-2W and e-3W packs on a single AFE (BQ76952), the highest volume and the furthest from the state of the art. Second tier: master controller for cars, buses and grid BESS, where the isoSPI bridge is switched in. 3–10 M/yr India at $2–6.

### **Policy and demand**

AIS-156 has required a microprocessor-based BMS on every L-category EV since December 2022, and its Phase-2 thermal-propagation test makes protection safety-critical. The EU Battery Passport, mandatory from 18 February 2027 (Article 77), requires state-of-health data for batteries over 2 kWh sold in the EU — it binds Indian exporters wherever the pack is made. No verified Indian design runs on-chip EIS or on-board SOH inference in production.

### **Why this node**

The AFE stays bought: India has no automotive-grade analog fab, and those parts carry 26–40-week lead times and NDA-only pricing. What we build is digital plus protection. At 130 nm the protection comparators, ported from SKU-6, and the DG32-Max platform share a die, and a 4–100 kB SOH model does not need a smaller node — it needs its own memory, away from the safety path. On-die non-volatile memory is ReRAM, the only kind the shuttle offers: a 1 kbit macro holds the device keys, the rollback counter and the hash chain that makes the Battery-Passport log in external flash tamper-evident; firmware and model weights stay in that flash and are verified at every boot.

### **Status**

Block specification issued September 2026: twenty blocks in six groups. Reused from DG32-Max RTL, which is feature-complete: the DGridRiscV host, CAN-FD, crypto, sleep and wake, PLL and POR, and the root of trust. New work is the feature DSP, EIS, contactor interface and AFE bridge. Next: freeze the AFE partner, then the register map. The Indian-condition dataset — 45 °C ambients, stop-start duty, monsoon humidity — starts in parallel; it is the moat the models depend on. No MPW slot assigned yet.

[pdf p.42]

### Track B · D100 Drone SoC: architecture diagram

_Architecture diagram on page 42 of the PDF._

[pdf p.43]

### **Track B · D100 Drone SoC**

### **What it is**

Flight control, visual navigation and optional AI on one chip. Attention and softmax run in hardware, using about 70 % less power than a general AI accelerator. A lockstep RISC-V pair runs flight control on a DO-254 certification path. Target die cost under $3.

### **What it replaces**

Qualcomm’s QRB5165, the closest comparable chip, which is imported. Most chips in this class do AI or flight control, not both.

### **What the market is worth**

India’s drone market was $1.2–1.3 billion in 2025 and is forecast to reach $2.7–3.2 billion by 2030–34. Our chip sells into the compute board: $100–300 for flight control and navigation, $500–800 with AI.

### **Where it sits in the plan**

The D100 is not part of the FY31 ₹1,000 Cr plan. It is funded by a separate ₹50 Cr round that follows revenue from the eleven mature-node chips. The question here is not market share but whether an Indian flight-control-plus-navigation chip exists at all — and today none does. VyomChakra does flight control only, C-DAC VEGA is a research programme, and country-of-origin rules bar components from land-border nations.

### **What it earns**

|Unit economics||
|---|---|
|Target die cost|< $3|
|Price, flight control + navigation|$100 – 300|
|Price, with AI|$500 – 800|
|Gross margin at the lower price|> 95 %|
|Development cost|28 nm masks and IP, from the ₹50 Cr round|
|Reference volume|ideaForge: 340–450 units in Q4 FY26|

A die under $3 against a $100–800 price gives a very high gross margin. The real hurdles are the 28 nm mask cost and DO-254 certification, which is why this chip waits for mature-node revenue.

### **Who buys it**

India drone market $1.2–1.3 B (2025), rising to $2.7–3.2 B by 2030–34. ideaForge alone guided 340–450 units in Q4 FY26.

### **Policy and demand**

No Indian chip combines flight control and visual navigation today, and country-of-origin rules bar components from land-border nations.

### **Why this node**

The vision and AI blocks need tens of millions of transistors running within a drone’s power budget, which only a fine node such as 28 nm delivers. The failsafe island — hardware that brings the drone home if the main computer fails — is the moat: no chip vendor sells it as a feature, and it can be built at 130 nm, linking the two tracks.

[pdf p.44]

### **Status**

Funded by a separate ₹50 Cr round, raised once the eleven mature-node chips earn revenue; it takes nothing from their budget. The lockstep safety core is shared with SKU-4.

[pdf p.45]

### **Glossary**

Short explanations of the technical terms used in this book.

|**AEC-Q100**|The stress-test standard a chip must pass to be used in cars.|
|---|---|
|**AFE**|Analog front end: the circuit that measures real-world signals such as cell voltages.|
|**ASIL-B/C/D**|Automotive safety levels under ISO 26262; D is the strictest.|
|**ASP**|Average selling price of one chip.|
|**AVL**|Approved vendor list: the suppliers a defence or utility buyer may purchase from.|
|**BLDC**|Brushless DC motor, used in EVs, fans, drones and robots.|
|**CAN / CAN-FD**|The data bus used inside vehicles and machines.|
|**DICE / TMR**|Ways to harden logic against radiation: special latches, and three copies that vote.|
|**DLI scheme**|MeitY’s Design Linked Incentive for Indian chip-design companies.|
|**DPSU**|Defence public-sector undertaking, such as BEL.|
|**ECC / SECDED**|Error-correcting codes that fix single-bit memory errors.|
|**EIS**|Electrochemical impedance spectroscopy: measuring a battery cell’s health with a<br>small AC signal.|
|**FOC**|Field-oriented control: the standard way to drive a brushless motor efficiently.|
|**FPGA**|A reprogrammable chip used to test a design before it is made in silicon.|
|**Lockstep**|Two processors running the same code; a mismatch signals a fault.|
|**MPW / shuttle**|A shared wafer run that makes small numbers of prototype chips cheaply.|
|**PIL-5**|The defence ministry’s published list of items to be made in India.|
|**RDSO**|Indian Railways’ standards body, which approves equipment for railway use.|
|**RDSS**|The government scheme funding India’s smart-meter rollout.|
|**ReRAM**|Resistive memory that keeps data without power; here used for keys and counters.|
|**RTL**|The chip’s design written in a hardware language, ready for synthesis.|
|**SiGe**|Silicon-germanium: a process for very high-frequency circuits such as 77 GHz radar.|
|**SKY130 / SCL 180 nm**|The SkyWater 130 nm open process (US) and SCL’s 180 nm process (Mohali, India).|
|**SOC / SOH**|A battery’s state of charge and state of health.|
|**Tape-out**|Sending the finished design to the foundry for manufacture.|
|**Zonal architecture**|A car layout where a few zone controllers replace many separate control boxes.|
|**ESC**|Electronic speed controller: the board that drives a drone motor.|
|**HSM**|Hardware security module: on-chip block that stores keys and runs encryption.|
|**isoSPI**|An isolated serial link between battery-measurement chips in high-voltage packs.|
|**LDMOS**|A transistor type for high-voltage, high-current power stages.|
|**LEO**|Low Earth orbit, where most small satellites fly.|
|**LRU**|Line-replaceable unit: a sealed box of electronics in an aircraft or vehicle.|
|**PUF**|Physically unclonable function: a chip fingerprint used as a secret key.|
|**QML**|Qualified manufacturers list for military and space parts.|
|**TID / SEE**|Radiation tests: total ionising dose and single-event effects.|
|**TSN**|Time-sensitive networking: Ethernet with guaranteed delivery times.|
|**VIO**|Visual-inertial odometry: working out position from a camera and motion sensors.|

[pdf p.46]

**ΔΣ converter**

Delta-sigma: a high-precision analog-to-digital converter used in meters.

