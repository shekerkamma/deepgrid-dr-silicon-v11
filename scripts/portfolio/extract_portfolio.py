"""Extract the portfolio dashboard's tables from the public SKU Blueprint (Oct 2026) and the DG32 datasheets.

Run when a source changes:  python3 scripts/portfolio/extract_portfolio.py
Needs poppler's pdftotext. Sources are the files the site already publishes under public/downloads/docs/.

Every table is read by its own headings, never by page position, and checked against the totals the book
itself states (plan lines sum to ₹1,000 Cr; development cost ₹41.7–91.2 Cr; ramp groups sum to the ramp
total). A mismatch stops the run and no CSV is written.
"""
import csv, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOCS = ROOT / 'public' / 'downloads' / 'docs'
OUT = ROOT / 'data' / 'portfolio'
BP = DOCS / 'deepgrid-sku-blueprint-oct2026.pdf'

def text(pdf):
    raw = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, text=True, check=True).stdout
    return [re.sub(r'[ \t]+', ' ', l).strip().replace('‐', '-').replace('∙', '·') for l in raw.split('\n')]

fails = []
def check(ok, msg):
    print(('  pass ' if ok else '  FAIL ') + msg)
    if not ok: fails.append(msg)

num = lambda s: float(s.replace(',', ''))
L = text(BP)

# 1. Portfolio table (page 1): one row per SKU; the name continues on the next line(s).
port = {}
row_re = re.compile(r'^(SKU-\d+) (.+?) \$([\d.]+) ?– ?([\d,.]+) ₹([\d,]+) Cr – ₹([\d,]+) Cr ₹([\d,]+) Cr ₹([\d,]+) Cr (\d+) ?% (\d+) ?% (PLAUSIBLE|CONSERVATIVE)$')
for l in L:
    m = row_re.match(l)
    if m:
        sku, units, plo, phi, mlo, mhi, plan, fy31, smid, stop, verdict = m.groups()
        port[sku] = dict(addressable_units=units.replace('M–', 'M – ').strip(), price_low_usd=num(plo), price_high_usd=num(phi),
                         market_low_cr=num(mlo), market_high_cr=num(mhi), plan_line_cr=num(plan), fy31_ramp_cr=num(fy31),
                         share_mid_pct=int(smid), share_top_pct=int(stop), verdict=verdict)
check(len(port) == 11, f'portfolio table: 11 SKUs read ({len(port)})')
check(sum(r['plan_line_cr'] for r in port.values()) == 1000, f"plan lines sum to ₹1,000 Cr ({sum(r['plan_line_cr'] for r in port.values()):.0f})")

# 2. Handout headers: name, then node · clock · readiness · MPW · plan line.
names, hdr = {}, {}
for i, l in enumerate(L):
    m = re.match(r'^(SKU-\d+|Track B) · (.+)$', l)
    if m and m.group(1) not in names and 'plan line' not in l and 'the nine questions' not in l:
        nxt = next((x for x in L[i + 1:i + 4] if x), '')
        if 'plan line' in nxt or 'Track B' in nxt:
            key = 'D100' if m.group(1) == 'Track B' else m.group(1)
            names[key] = m.group(2).replace('D100 ', '') if key != 'D100' else 'D100 Drone SoC'
            hdr[key] = nxt
check(len(hdr) == 12, f'handout headers: 11 SKUs + D100 ({len(hdr)})')
def field(h, pat, default=''):
    m = re.search(pat, h); return m.group(1) if m else default

# 3. Development cost per chip (two SKUs a line).
dev = {}
for l in L:
    for sku, lo, hi in re.findall(r'(SKU-\d+) [A-Za-z0-9 \-]+? ₹([\d.]+)–([\d.]+) Cr', l):
        dev[sku] = (num(lo), num(hi))
check(len(dev) == 11, f'development cost: 11 SKUs ({len(dev)})')
tot = next((l for l in L if l.startswith('SKU-6 Voltage Supervisor') and 'All eleven' in l), '')
mt = re.search(r'All eleven ₹([\d.]+)–([\d.]+) Cr', tot)
lo_sum, hi_sum = round(sum(v[0] for v in dev.values()), 1), round(sum(v[1] for v in dev.values()), 1)
check(bool(mt) and (lo_sum, hi_sum) == (num(mt.group(1)), num(mt.group(2))), f'development cost sums to the stated ₹41.7–91.2 Cr ({lo_sum}–{hi_sum})')

# 4. Shuttle: the December 2026 ChipFoundry shuttle carries SKU-1 to SKU-6 and SKU-8 to SKU-10 (path to revenue).
shuttle = {f'SKU-{n}' for n in [1, 2, 3, 4, 5, 6, 8, 9, 10]}
check(any('SKU-1 to SKU-6 and SKU-8 to SKU-10' in l for l in L), 'shuttle list stated as SKU-1 to SKU-6 and SKU-8 to SKU-10')

# 5. Revenue ramp by chip group, FY29–FY33.
ramp = []
for l in L:
    m = re.match(r'^(DG32-Max, motor controller|Smart meter, transceiver, display|Supervisor, PMIC \(defence first\)|Automotive: SKU-4, 7, 9, 11|Total) (.+)$', l)
    if m and len(ramp) < 5:
        vals = [None if v == '—' else num(v.lstrip('₹')) for v in re.findall(r'₹[\d,]+|—', m.group(2))]
        if len(vals) == 5: ramp.append([m.group(1)] + vals)
check(len(ramp) == 5, f'ramp: 4 groups + total ({len(ramp)})')
if len(ramp) == 5:
    for j, fy in enumerate(['FY29', 'FY30', 'FY31', 'FY32', 'FY33']):
        s = sum(r[j + 1] or 0 for r in ramp[:4]); check(abs(s - ramp[4][j + 1]) <= 2, f'ramp {fy}: groups sum to the total ({s:.0f} vs {ramp[4][j + 1]:.0f})')

# 6. Approval time by market.
appr = []
for l in L:
    m = re.match(r'^(Industrial, consumer, drones|Smart meters|Automotive|Defence|Railways|Space) (.+?) (\d+)–(\d+) months$', l)
    if m: appr.append([m.group(1), m.group(2), int(m.group(3)), int(m.group(4))])
check(len(appr) == 6, f'approval times: 6 markets ({len(appr)})')

# 7. Unit cost at volume.
unit = []
for l in L:
    m = re.match(r'^(Voltage supervisor|Interface transceiver|Motor controller, fan cut|DG32-Max) ~([\d.]+) mm² (\S+) \$([\d.]+)–([\d.]+) \$([\d.]+)–([\d.]+) (\d+)–(\d+) % at \$([\d.]+)$', l)
    if m: unit.append(list(m.groups()))
check(len(unit) == 4, f'unit cost: 4 chips ({len(unit)})')

# 8. Tranche 1 uses.
uses = []
for l in L:
    m = re.match(r'^(Nine prototypes, December 2026 shuttle|Bring-up and evaluation boards|First approvals|Respin reserve|Engineering team|Design tools and lab|Contingency) ([\d.]+) (.+)$', l)
    if m:
        d, j = m.group(3), L.index(l) + 1
        while d.endswith('+') and j < len(L):  # the delivers cell wraps onto the next line
            d, j = d + ' ' + L[j], j + 1
        uses.append([m.group(1), num(m.group(2)), d])
check(len(uses) == 7 and abs(sum(u[1] for u in uses) - 10.0) < 0.01, f"tranche 1 uses: 7 lines summing to ₹10 Cr ({len(uses)}, {sum(u[1] for u in uses):.1f})")

# 9. DG32 datasheets: the part line under "Part Package Process Core Clock".
specs = []
for f, part in [('deepgrid-dg32-lite-preliminary-datasheet.pdf', 'DG32-LITE'), ('deepgrid-dg32-2dom-preliminary-datasheet.pdf', 'DG32-2DOM')]:
    T = text(DOCS / f)
    line = next((l for l in T if l.startswith(part + ' QFN-64')), '')
    m = re.match(rf'^{part} (QFN-64, 9x9 mm) (sky130A 130 nm) (.+?) ([\d / ]+ MHz)$', line)
    check(bool(m), f'{part}: part line read')
    if m:
        joined = ' '.join(T)
        specs.append(dict(part=part, sku='SKU-4' if part == 'DG32-LITE' else '', package=m.group(1), process=m.group(2), core=m.group(3), clock=m.group(4),
                          sram='32 KB (no ECC)' if '32 KB' in joined else '', boot_rom='64 KB' if '64 KB' in joined else '',
                          adc='8-bit differential SAR, untrimmed on this silicon' if 'untrimmed' in joined else '8-bit differential SAR',
                          supply='1.8 V core, 3.3 V I/O', status='pre-silicon, taped-out RTL and hardened die', note='' if part == 'DG32-LITE' else 'attention variant of DG32-LITE; no SKU number in the Blueprint', source=f))

if fails:
    sys.exit(f'{len(fails)} check(s) failed: nothing written.')

OUT.mkdir(parents=True, exist_ok=True)
def write(name, header, rows):
    with open(OUT / name, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh); w.writerow(header); w.writerows(rows)
    print(f'  wrote {name} ({len(rows)} rows)')

# Readiness where a header states none: page 3 says "RTL is ready for ten of the eleven chips; only the BMS controller
# is still at specification".
ready_line = next((l for l in L if 'RTL is ready for ten of the eleven chips' in l), '')
check(bool(ready_line) and any('only the BMS controller is still at specification' in l for l in L), 'readiness sentence present (ten of eleven RTL-ready; BMS at specification)')
def readiness(k, h):
    r = field(h, r'(RTL \+ analog schematics ready|digital RTL ready|RTL ready)')
    if r: return r
    return 'specification' if k == 'SKU-11' else ('' if k == 'D100' else 'RTL ready')
if fails:
    sys.exit(f'{len(fails)} check(s) failed: nothing written.')
order = [f'SKU-{n}' for n in range(1, 12)] + ['D100']
rows = []
for k in order:
    h = hdr[k]; p = port.get(k, {}); d = dev.get(k, (None, None))
    rows.append([k, names[k], field(h, r'^(.+?) ·'), field(h, r'(\d+) MHz'), readiness(k, h),
                 field(h, r'(MPW cycle \d|ChipFoundry OpenFrame, December 2026|MPW slot not yet assigned)'), 'yes' if k in shuttle else 'no',
                 p.get('plan_line_cr', ''), p.get('fy31_ramp_cr', ''), p.get('addressable_units', ''), p.get('price_low_usd', ''), p.get('price_high_usd', ''),
                 p.get('market_low_cr', ''), p.get('market_high_cr', ''), p.get('share_mid_pct', ''), p.get('share_top_pct', ''), p.get('verdict', ''),
                 d[0] if d[0] is not None else '', d[1] if d[1] is not None else ''])
write('skus.csv', ['sku', 'name', 'process', 'clock_mhz', 'readiness', 'mpw', 'dec2026_shuttle', 'plan_line_cr', 'fy31_ramp_cr', 'addressable_units',
                   'price_low_usd', 'price_high_usd', 'market_low_cr', 'market_high_cr', 'share_mid_pct', 'share_top_pct', 'verdict', 'dev_cost_low_cr', 'dev_cost_high_cr'], rows)
write('ramp.csv', ['group', 'FY29', 'FY30', 'FY31', 'FY32', 'FY33'], [[r[0]] + ['' if v is None else v for v in r[1:]] for r in ramp])
write('approvals.csv', ['market', 'approval', 'months_low', 'months_high'], appr)
write('unit-cost.csv', ['chip', 'die_mm2', 'package', 'cost_low_usd', 'cost_high_usd', 'price_low_usd', 'price_high_usd', 'margin_low_pct', 'margin_high_pct', 'margin_at_price_usd'], unit)
write('tranche1-uses.csv', ['use', 'cr', 'delivers'], uses)
write('dg32-specs.csv', list(specs[0].keys()), [list(s.values()) for s in specs])
print('source:', BP.name)
