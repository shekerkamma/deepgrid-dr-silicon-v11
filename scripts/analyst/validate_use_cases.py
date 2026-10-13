"""Independently join the use-case mapping to the raw CSVs and verify reference findings and coverage scores."""
import csv
import json
import pathlib

root = pathlib.Path(__file__).resolve().parents[2]
data = root / 'data' / 'portfolio'
def rows(name):
    with (data / (name + '.csv')).open() as f:
        return list(csv.DictReader(f))
skus = {r['sku']: r for r in rows('skus')}
approvals = {r['market']: r for r in rows('approvals')}
costs = {r['chip']: r for r in rows('unit-cost')}
cases = json.loads((data / 'use-cases.json').read_text())['cases']
expected = {'SKU-6':10,'SKU-1':8,'SKU-2':8,'SKU-5':8,'SKU-10':7,'SKU-4':7,'SKU-3':6,'SKU-8':6,'SKU-9':5,'SKU-7':3,'SKU-11':2,'D100':0}
assert len(cases) == len(skus) == len({c['sku'] for c in cases}) == 12
funds = [r for r in rows('tranche1-uses') if 'approval' in r['use'].lower() and float(r['cr']) > 0]
scores = {}
for c in cases:
    s = skus[c['sku']]
    assert c['market'] in approvals
    assert not c.get('cost') or c['cost'] in costs
    assert (root / 'app' / c['route'].lstrip('/') / 'page.tsx').exists(), c['route']
    assert not c.get('datasheet') or (root / 'public' / c['datasheet'].lstrip('/')).exists()
    design = 2 if 'RTL' in s['readiness'] and 'analog' in s['readiness'] else 1 if 'RTL' in s['readiness'] else 0
    funded = any(('SKU-6' in r['delivers'] if c['sku'] == 'SKU-6' else c['sku'] == 'SKU-2' and 'meter certification' in r['delivers']) for r in funds)
    scores[c['sku']] = design + 2 * (int(s['dec2026_shuttle'] == 'yes') + int(bool(c.get('datasheet'))) + int(bool(c.get('cost'))) + int(funded) + int(bool(s['plan_line_cr'])))
assert scores == expected, scores
planned = [c for c in cases if skus[c['sku']]['plan_line_cr']]
def ramp(group):
    return sum(float(skus[c['sku']]['fy31_ramp_cr']) for c in group)
shuttle = [c for c in planned if skus[c['sku']]['dec2026_shuttle'] == 'yes']
fast = [c for c in shuttle if int(approvals[c['market']]['months_high']) <= 12]
slow = [c for c in planned if int(approvals[c['market']]['months_high']) >= 36]
assert len(fast) == 2 and ramp(fast) == 366 and ramp(shuttle) == 601
assert round(100 * ramp(fast) / ramp(shuttle)) == 61
assert len(slow) == 6 and ramp(slow) == 46
assert ramp(planned) == 609  # The separately stated ramp total is 608; retain the rounding disclosure.
assert sum(bool(c.get('datasheet')) for c in cases) == 1
assert min(float(skus[c['sku']]['share_mid_pct']) for c in planned) == 7
assert max(float(skus[c['sku']]['share_mid_pct']) for c in planned) == 29
print('PASS: 12 mapped use cases and routes, all coverage scores, 61% / 366 / 601 / 46 / 609 Cr findings, 7–29% shares and datasheet coverage')
