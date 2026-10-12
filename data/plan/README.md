# Business-plan dashboard data (internal)

**Source:** `Deepgrid_Semi_Financial_Model_Corrected_v3-sept.xlsx` (saved 2026-08-28), FY2027–FY2032, ₹ Cr, base scenario.
Chosen by the owner on 2026-10-12 over the earlier "Segmented Model ADAS v3" (business-plan.xlsx carries the same
numbers as that one). **These are plan targets, not results:** not audited, not contracted.

**How the CSVs were made:**
1. `/excel-ingest --list` found that four sheets (Assumptions, Use of Funds, Cash Flow & Runway, Demand & TAM) are
   hand-built reports holding several tables. Its header detection lands on the second table, so a whole-sheet
   convert silently drops the first.
2. `scripts/plan/extract_plan_blocks.py <workbook>` therefore reads each needed table from its own header to the
   first blank row, by label rather than by position.
3. It checks 15 accounting identities and writes nothing if one breaks. On 2026-10-12, all 15 passed.

| File | Holds |
|---|---|
| `pl.csv` | P&L |
| `revenue-by-segment.csv` | Revenue Build, block B |
| `cash.csv` | Cash Flow & Runway, the annual flows and the cash balance |
| `use-of-funds.csv` | Sources and uses. The sheet's "Grants & prior funding" context block is not extracted: it is not part of this raise, and it includes figures the public site treats as unverified. |
| `metrics.md` | The definition of every figure the dashboard shows (ai-analyst `define-metric`) |

**Where it is published:**
- **The public v11/v12 sites.** The owner chose to publish the dashboard publicly on 2026-10-12. `.github/workflows/pages.yml` sets `DGS_PLAN=1`, and this folder is in those public repositories, so the CSVs are public and permanent in git history.
- **The Sheker-semi droplet,** where `scripts/build-droplet.sh` sets `DGS_INTERNAL=1`.
- **Anywhere else:** a build with neither flag gets a stub, and `/plan` shows a notice.

`/plan` is not offered to search engines: the page sets `noindex`, because plan targets read out of context in a search result look like results.

The "Grants & prior funding" block of Use of Funds is still not extracted.
