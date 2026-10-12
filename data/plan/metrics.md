# Business-plan dashboard: metric specs (ai-analyst `define-metric`)

Source for every metric: the CSVs in this folder, extracted from
`Deepgrid_Semi_Financial_Model_Corrected_v3-sept.xlsx` by `scripts/plan/extract_plan_blocks.py`.

**Common to all metrics:**
- **Unit of analysis:** one fiscal year, FY2027 to FY2032 (Indian fiscal year, April–March). Money is ₹ Cr.
- **Refresh cadence:** none. These are plan targets from one model version, re-extracted only when the model changes. They are not measurements, not audited and not contracted.
- **Thresholds:** **not applicable**. The template's healthy/watch/alert bands need history, and a plan has none. This dashboard shows targets; it does not monitor them.
- **Identity checks:** the extractor and the build re-check 10 accounting identities, and a break stops publication (`scripts/build-plan-data.mjs`). They prove internal consistency, not that the assumptions are right.

## Metric: Revenue
- **Plain English:** What the plan expects to invoice in the year.
- **Formula:** sum over business lines of units sold × average selling price (₹) ÷ 10⁷, times the scenario multiplier (Base = 1).
- **Components:**
  - `pl.csv` row `Revenue`;
  - bottom-up detail on the Revenue Build sheet, block E (not extracted);
  - the segment split in `revenue-by-segment.csv`.
- **Known limitations:** the Base scenario only. The Bull and Bear multipliers in Assumptions are not shown.
- **Related:** segment share, gross margin.

## Metric: Revenue growth rate (compound, FY2027→FY2032)
- **Plain English:** The constant yearly growth that takes FY2027 revenue to FY2032 revenue.
- **Formula:** (Revenue FY2032 ÷ Revenue FY2027)^(1/5) − 1.
- **Components:** numerator `Revenue[FY2032]`; denominator `Revenue[FY2027]`; 5 yearly steps.
- **Known limitations:**
  - It is very sensitive to the small FY2027 base (₹1.70 Cr).
  - The year-on-year path is uneven, so read it beside the revenue chart, never alone.

## Metric: Gross margin
- **Plain English:** The share of revenue left after the direct cost of the goods sold.
- **Formula:** Gross profit ÷ Revenue, same year.
- **Components:** numerator `pl.csv` `Gross profit` (the model sums it by segment); denominator `Revenue`.
- **Related:** EBITDA margin, which also deducts operating expense.

## Metric: EBITDA margin
- **Plain English:** Operating profit before depreciation and amortisation, as a share of revenue.
- **Formula:** EBITDA ÷ Revenue, where EBITDA = Gross profit − Total operating expense (R&D, sales and marketing, G&A).

## Metric: Net margin
- **Plain English:** Profit after tax as a share of revenue.
- **Formula:** Net income ÷ Revenue, where Net income = EBIT − tax at 25 % after loss carry-forward.
- **Known limitations:** the model has no interest line in the P&L. Fleet-debt interest appears only in the cash flow.

## Metric: First profitable year
- **Plain English:** The first year the plan shows a positive net income.
- **Formula:** the earliest fiscal year with `Net income` > 0.
- **Known limitations:** one year's sign, not a trend. Read it with the net-margin line.

## Metric: Cash trough
- **Plain English:** The lowest year-end cash balance in the plan, and the year it occurs.
- **Formula:** min over years of `cash.csv` `Closing cash`, where closing = opening + net cash flow, and FY2027 opening = ₹45 Cr equity + ₹0.025 Cr (the model's line "Grants + angel + defence", marked as the corrected actual bank balance).
- **Components:** net cash flow = operating cash flow (net income + D&A) − tapeout capex − other capex − fleet-debt interest − change in working capital.
- **Known limitations:**
  - **Year-end balances only.** Cash inside a year can fall below the trough.
  - The model finances the TaaS fleet capex (about ₹60 Cr) with debt against the trucks, so it is not in this balance.

## Metric: Segment share
- **Plain English:** One segment's part of the year's revenue.
- **Formula:** segment revenue ÷ total revenue, same year (`revenue-by-segment.csv`).
- **Segments:** Systems, Semiconductors, Robotics, Sensors (the model's own block B). They sum to P&L revenue, which is checked at build.

## Metric: Use-of-funds share
- **Plain English:** One allocation's part of the capital being raised.
- **Formula:** allocation ₹ Cr ÷ total uses (₹54.99 Cr). Total uses equal total sources (₹45 Cr equity + ₹10 Cr CGTMSE-backed loan) within ₹0.02 Cr.
- **Known limitations:** the sheet's "Grants & prior funding" context block is deliberately not extracted. It is not part of this raise, and it includes figures the public site treats as unverified.
