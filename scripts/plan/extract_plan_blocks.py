"""Extract the business-plan dashboard's tables from the corrected model workbook.

Run by hand when the model changes (needs pandas + openpyxl, e.g. ~/.venvs/data/bin/python):
    python scripts/plan/extract_plan_blocks.py <Deepgrid_Semi_Financial_Model_Corrected_v3-sept.xlsx>

Why blocks, not sheets: /excel-ingest (--list, 2026-10-12) found that four of the model's sheets are
hand-built reports holding several tables each, and its header detection lands on the second one
(Use of Funds: the "Uses" table, dropping "Sources"; Cash Flow: the annual table, dropping "Opening
capital"). Each table here is read from its own header row to the first blank row, by label, never
by position, and every accounting identity is checked before a CSV is written. A break fails the run.
"""
import csv, sys, pathlib
import openpyxl

FY = ['FY2027', 'FY2028', 'FY2029', 'FY2030', 'FY2031', 'FY2032']
TOL = 0.02
out = pathlib.Path(__file__).resolve().parents[2] / 'data' / 'plan'


def rows(ws):
    return [list(r) for r in ws.iter_rows(values_only=True)]


def block(ws, header_first_cell, label_col=0, year_cols=None):
    """Rows under the row whose first non-empty cell equals header_first_cell, until a blank row."""
    R = rows(ws)
    for i, r in enumerate(R):
        cells = [c for c in r if c is not None]
        if cells and str(cells[0]).strip() == header_first_cell:
            head = r
            break
    else:
        raise SystemExit(f'{ws.title}: header "{header_first_cell}" not found')
    lc = next(j for j, c in enumerate(head) if c is not None and str(c).strip() == header_first_cell)
    cols = year_cols or {str(c).strip(): j for j, c in enumerate(head) if c is not None and str(c).strip() in FY}
    data = {}
    for r in R[i + 1:]:
        if all(c is None or str(c).strip() == '' for c in r):
            break
        label = r[lc]
        if label is None:
            continue
        data[str(label).strip()] = r, cols
    return data, head, lc


def series(data, label):
    r, cols = data[label]
    vals = [r[cols[y]] for y in FY]
    if any(not isinstance(v, (int, float)) for v in vals):
        raise SystemExit(f'"{label}": non-numeric value in {vals}')
    return [float(v) for v in vals]


def close(name, a, b):
    bad = [(y, round(x, 4), round(z, 4)) for y, x, z in zip(FY, a, b) if abs(x - z) > TOL]
    print(f'  [{"FAIL" if bad else "pass"}] {name}' + (f'  {bad}' if bad else ''))
    return not bad


wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
ok = True

# P&L (one table; the label column header is "Line item").
pl, _, _ = block(wb['P&L'], 'Line item')
L = {k: series(pl, k) for k in ['Revenue', 'Gross profit', 'COGS', 'R&D (total)', 'run-rate R&D', 'SoC4 5nm tape-out program',
                                'Sales & Marketing', 'G&A', 'Total operating expense', 'EBITDA', 'D&A', 'EBIT',
                                'Tax (25%, post-carryforward)', 'Net income']}
print('P&L identities (tolerance ±%.2f, ₹ Cr):' % TOL)
ok &= close('Revenue - COGS = Gross profit', [a - b for a, b in zip(L['Revenue'], L['COGS'])], L['Gross profit'])
ok &= close('run-rate R&D + SoC4 programme = R&D (total)', [a + b for a, b in zip(L['run-rate R&D'], L['SoC4 5nm tape-out program'])], L['R&D (total)'])
ok &= close('R&D + S&M + G&A = Total operating expense', [a + b + c for a, b, c in zip(L['R&D (total)'], L['Sales & Marketing'], L['G&A'])], L['Total operating expense'])
ok &= close('Gross profit - opex = EBITDA', [a - b for a, b in zip(L['Gross profit'], L['Total operating expense'])], L['EBITDA'])
ok &= close('EBITDA - D&A = EBIT', [a - b for a, b in zip(L['EBITDA'], L['D&A'])], L['EBIT'])
ok &= close('EBIT - Tax = Net income', [a - b for a, b in zip(L['EBIT'], L['Tax (25%, post-carryforward)'])], L['Net income'])

# Revenue by segment: block B of Revenue Build.
seg, _, _ = block(wb['Revenue Build'], 'Segment')
S = {k: series(seg, k) for k in ['Systems', 'Semiconductors', 'Robotics', 'Sensors', 'Total (check)']}
print('Revenue Build, block B:')
ok &= close('Segments sum to their total', [sum(v) for v in zip(*(S[k] for k in ['Systems', 'Semiconductors', 'Robotics', 'Sensors']))], S['Total (check)'])
ok &= close('Segment total = P&L revenue', S['Total (check)'], L['Revenue'])

# Cash flow: block B (annual flows) and block C (balance), both headed "Fiscal year".
ws = wb['Cash Flow & Runway']
R = rows(ws)
heads = [i for i, r in enumerate(R) if r and any(c is not None and str(c).strip() == 'Fiscal year' for c in r)]
if len(heads) != 2:
    raise SystemExit(f'Cash Flow & Runway: expected two "Fiscal year" tables, found {len(heads)}')
def table_at(i):
    head = R[i]; lc = next(j for j, c in enumerate(head) if c is not None and str(c).strip() == 'Fiscal year')
    cols = {str(c).strip(): j for j, c in enumerate(head) if c is not None and str(c).strip() in FY}
    d = {}
    for r in R[i + 1:]:
        if all(c is None or str(c).strip() == '' for c in r): break
        if r[lc] is not None: d[str(r[lc]).strip()] = r, cols
    return d
cf, bal = table_at(heads[0]), table_at(heads[1])
C = {k: series(cf, k) for k in ['Operating cash flow (NI + D&A)', 'Less: tapeout capex (one-time)', 'Less: other capex (equipment, lab)',
                                'Less: TaaS debt interest', 'Less: change in working capital', 'Net cash flow for the year']}
B = {k: series(bal, k) for k in ['Opening cash', 'Closing cash']}
print('Cash Flow & Runway:')
ok &= close('Operating cash flow = Net income + D&A', [a + b for a, b in zip(L['Net income'], L['D&A'])], C['Operating cash flow (NI + D&A)'])
ok &= close('Flows sum to net cash flow', [sum(v) for v in zip(*(C[k] for k in list(C)[:5]))], C['Net cash flow for the year'])
ok &= close('Opening + net flow = closing', [a + b for a, b in zip(B['Opening cash'], C['Net cash flow for the year'])], B['Closing cash'])
ok &= close('Closing cash carries to next opening', B['Closing cash'][:-1] + [B['Closing cash'][-1]], B['Opening cash'][1:] + [B['Closing cash'][-1]])

# Use of funds: Sources block and Uses block (the context block below them is deliberately not extracted).
uf = rows(wb['Use of Funds'])
def kv(header):
    i = next(i for i, r in enumerate(uf) if r and any(c is not None and str(c).strip() == header for c in r))
    head = uf[i]; lc = next(j for j, c in enumerate(head) if c is not None and str(c).strip() == header)
    cr = next(j for j, c in enumerate(head) if c is not None and str(c).strip() == 'Rs Cr')
    d = []
    for r in uf[i + 1:]:
        if all(c is None or str(c).strip() == '' for c in r): break
        if r[lc] is not None and isinstance(r[cr], (int, float)): d.append((str(r[lc]).strip(), float(r[cr])))
    return d
sources, uses = kv('Source'), kv('Allocation')
src_items = [(k, v) for k, v in sources if not k.lower().startswith('total')]
use_items = [(k, v) for k, v in uses if not k.lower().startswith('total')]
src_total = next(v for k, v in sources if k.lower().startswith('total'))
use_total = next(v for k, v in uses if k.lower().startswith('total'))
print('Use of Funds:')
ok &= close('Sources sum to total', [sum(v for _, v in src_items)] * 6, [src_total] * 6)
ok &= close('Uses sum to total', [sum(v for _, v in use_items)] * 6, [use_total] * 6)
ok &= close('Uses = sources (within ±0.02)', [use_total] * 6, [src_total] * 6)

if not ok:
    raise SystemExit('Identity break: fix the model or record the correction before publishing. No CSV written.')

out.mkdir(parents=True, exist_ok=True)
for f in out.glob('*.csv'): f.unlink()
def write(name, header, rows_):
    with open(out / name, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh); w.writerow(header); w.writerows(rows_)
    print('  wrote', name, len(rows_), 'rows')
write('pl.csv', ['line_item'] + FY, [[k] + [round(v, 6) for v in L[k]] for k in L])
write('revenue-by-segment.csv', ['segment'] + FY, [[k] + [round(v, 6) for v in S[k]] for k in ['Systems', 'Semiconductors', 'Robotics', 'Sensors']])
write('cash.csv', ['line_item'] + FY, [[k] + [round(v, 6) for v in C[k]] for k in C] + [[k] + [round(v, 6) for v in B[k]] for k in B])
write('use-of-funds.csv', ['kind', 'item', 'rs_cr'], [['source', k, v] for k, v in src_items] + [['use', k, v] for k, v in use_items])
print('source workbook:', pathlib.Path(sys.argv[1]).name)
