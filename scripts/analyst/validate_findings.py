"""ai-analyst validation (agents/validation.md): re-derive every number the dashboards' insight cards state,
straight from the CSVs with pandas, independent of the site's TypeScript. Prints each claim with PASS/FAIL."""
import pandas as pd, pathlib, sys
R = pathlib.Path(__file__).resolve().parents[2] / 'data'
sku = pd.read_csv(R/'portfolio/skus.csv'); ramp = pd.read_csv(R/'portfolio/ramp.csv')
appr = pd.read_csv(R/'portfolio/approvals.csv'); tr = pd.read_csv(R/'portfolio/tranche1-uses.csv')
unit = pd.read_csv(R/'portfolio/unit-cost.csv')
pl = pd.read_csv(R/'plan/pl.csv').set_index('line_item'); seg = pd.read_csv(R/'plan/revenue-by-segment.csv').set_index('segment')
cash = pd.read_csv(R/'plan/cash.csv').set_index(pd.read_csv(R/'plan/cash.csv').columns[0])
fails = 0
def claim(name, got, want, tol=0.05):
    global fails
    ok = abs(got - want) <= tol
    fails += not ok
    print(f"{'PASS' if ok else 'FAIL'}  {name}: derived {got:.4g}, card says {want}")
p = sku[sku.plan_line_cr.notna()]
on = p[p.dec2026_shuttle == 'yes']
# /portfolio
top3 = p.nlargest(3, 'fy31_ramp_cr')
claim('portfolio: top-3 share of the SKUs FY31 ramp, %', 100 * top3.fy31_ramp_cr.sum() / p.fy31_ramp_cr.sum(), 89, 0.5)
claim('portfolio: top-3 FY31 ramp, Cr', top3.fy31_ramp_cr.sum(), 541)
claim('portfolio: FY31 ramp total (stated), Cr', float(ramp.set_index('group').loc['Total', 'FY31']), 608)
claim('portfolio: FY31 ramp as % of plan lines', 100 * float(ramp.set_index('group').loc['Total', 'FY31']) / p.plan_line_cr.sum(), 61, 0.5)
claim('portfolio: chips on shuttle', len(on), 9, 0)
r = p.fy31_ramp_cr / p.plan_line_cr
claim('portfolio: chips at >= 70 % of plan line by FY31', int((r >= 0.7).sum()), 3, 0)
claim('portfolio: best of the rest, % of plan line', 100 * r[r < 0.7].max(), 40, 0.5)
claim('plan: FY29-FY32 share of all growth, %', 100 * (pd.read_csv(R/'plan/pl.csv').set_index('line_item').loc['Revenue', 'FY2032'] - pd.read_csv(R/'plan/pl.csv').set_index('line_item').loc['Revenue', 'FY2029']) / (pd.read_csv(R/'plan/pl.csv').set_index('line_item').loc['Revenue', 'FY2032'] - pd.read_csv(R/'plan/pl.csv').set_index('line_item').loc['Revenue', 'FY2027']), 90, 0.5)
claim('brief: tranche-1 top three uses, Cr', tr.nlargest(3, 'cr').cr.sum(), 7.6)
slow = on.merge(pd.DataFrame({'sku': ['SKU-3', 'SKU-4', 'SKU-6', 'SKU-9']}), on='sku')
claim('portfolio: shuttle chips in 18-36 month markets', len(slow), 4, 0)
claim('portfolio: their share of the shuttle chips plan lines, %', 100 * slow.plan_line_cr.sum() / on.plan_line_cr.sum(), 19.5, 0.5)
claim('portfolio: dev cost low, all eleven', p.dev_cost_low_cr.sum(), 41.7); claim('portfolio: dev cost high, all eleven', p.dev_cost_high_cr.sum(), 91.2)
claim('portfolio: tranche-1 top three uses share, %', 100 * tr.nlargest(3, 'cr').cr.sum() / tr.cr.sum(), 76, 0.5)
claim('portfolio: tranche-1 total', tr.cr.sum(), 10.0)
claim('portfolio: lowest gross margin low end, %', unit.margin_low_pct.min(), 53, 0); claim('portfolio: highest margin high end, %', unit.margin_high_pct.max(), 82, 0)
# /plan
fy = ['FY2027', 'FY2028', 'FY2029', 'FY2030', 'FY2031', 'FY2032']
rev = pl.loc['Revenue']; ni = pl.loc['Net income']; gp = pl.loc['Gross profit']
claim('plan: FY32 revenue, Cr', rev['FY2032'], 1128.45, 0.01)
top_seg = seg['FY2032'].idxmax()
claim(f'plan: {top_seg} share of FY32 revenue, %', 100 * seg['FY2032'].max() / rev['FY2032'], 83.4, 0.05)
claim('plan: Semiconductors share of FY32 revenue, %', 100 * seg.loc['Semiconductors', 'FY2032'] / rev['FY2032'], 9.2, 0.05)
first = next(y for y in fy if ni[y] > 0)
claim('plan: first profitable year (FY index 2028)', int(first[2:]), 2028, 0)
claim('plan: net income in that year, Cr', ni[first], 1.38, 0.005)
cl = cash.loc['Closing cash']; trough = cl.idxmin()
claim('plan: lowest closing cash, Cr', cl.min(), 10.10, 0.005); claim('plan: trough year (FY2029)', int(trough[2:]), 2029, 0)
claim('plan: FY32 gross margin, %', 100 * gp['FY2032'] / rev['FY2032'], 87.4, 0.05)
claim('brief: Blueprint FY31 chips / model FY31 chips, x', 608 / seg.loc['Semiconductors', 'FY2031'], 13.5, 0.05)
print(('ALL CLAIMS RE-DERIVED' if not fails else f'{fails} CLAIM(S) FAIL'))
sys.exit(1 if fails else 0)
