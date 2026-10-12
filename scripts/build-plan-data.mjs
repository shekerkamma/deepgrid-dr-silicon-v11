// Business-plan dashboard data: published only by builds that set DGS_PLAN=1 or DGS_INTERNAL=1.
//
// data/plan/*.csv are extracted from the corrected model workbook by scripts/plan/extract_plan_blocks.py
// (which reads each table by its own header, after /excel-ingest showed the sheets hold several tables).
// With DGS_INTERNAL=1 (set by scripts/build-droplet.sh, the login-protected droplet) this re-checks the
// accounting identities, writes app/plan-data.json and copies the CSVs to public/plan-data/ so every panel
// links its source. Any other build gets {"available": false} and no CSVs: nothing reaches a public site.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'app/plan-data.json');
const pub = path.join(root, 'public/plan-data');
const FILES = ['pl.csv', 'revenue-by-segment.csv', 'cash.csv', 'use-of-funds.csv'];
const TOL = 0.02;

fs.rmSync(pub, {recursive: true, force: true});
// DGS_PLAN=1: the public v11/v12 Pages build (owner, 2026-10-12: publish it publicly). DGS_INTERNAL=1: the
// Sheker-semi droplet build. Either publishes; without one the route shows a notice and no figure is built.
if (process.env.DGS_PLAN !== '1' && process.env.DGS_INTERNAL !== '1') {
  fs.writeFileSync(out, JSON.stringify({available: false}) + '\n');
  console.log('plan data: stub (neither DGS_PLAN nor DGS_INTERNAL is 1)');
  process.exit(0);
}

function parse(file) {
  const text = fs.readFileSync(path.join(root, 'data/plan', file), 'utf8').replace(/\r\n/g, '\n').trim();
  return text.split('\n').map(line => {
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { cells.push(cur); cur = ''; } else cur += c;
    }
    cells.push(cur); return cells;
  });
}
const table = file => {
  const [head, ...body] = parse(file);
  const periods = head.slice(1);
  return {periods, rows: Object.fromEntries(body.map(r => [r[0], r.slice(1).map(Number)]))};
};

const pl = table('pl.csv'), seg = table('revenue-by-segment.csv'), cash = table('cash.csv');
const periods = pl.periods;
for (const t of [seg, cash]) if (t.periods.join() !== periods.join()) throw new Error('plan data: period columns differ between CSVs');
const funds = parse('use-of-funds.csv').slice(1).map(([kind, item, v]) => ({kind, item, value: Number(v)}));

const need = (t, k) => { if (!t.rows[k] || t.rows[k].some(Number.isNaN)) throw new Error(`plan data: "${k}" missing or non-numeric`); return t.rows[k]; };
const P = k => need(pl, k), S = k => need(seg, k), C = k => need(cash, k);
const sum = (...xs) => periods.map((_, i) => xs.reduce((a, x) => a + x[i], 0));
const diff = (a, b) => periods.map((_, i) => a[i] - b[i]);
const checks = [
  ['Revenue − COGS = gross profit', diff(P('Revenue'), P('COGS')), P('Gross profit')],
  ['Run-rate R&D + SoC4 programme = R&D', sum(P('run-rate R&D'), P('SoC4 5nm tape-out program')), P('R&D (total)')],
  ['R&D + sales and marketing + G&A = operating expense', sum(P('R&D (total)'), P('Sales & Marketing'), P('G&A')), P('Total operating expense')],
  ['Gross profit − operating expense = EBITDA', diff(P('Gross profit'), P('Total operating expense')), P('EBITDA')],
  ['EBITDA − D&A = EBIT', diff(P('EBITDA'), P('D&A')), P('EBIT')],
  ['EBIT − tax = net income', diff(P('EBIT'), P('Tax (25%, post-carryforward)')), P('Net income')],
  ['Segments sum to revenue', sum(S('Systems'), S('Semiconductors'), S('Robotics'), S('Sensors')), P('Revenue')],
  ['Operating cash flow = net income + D&A', sum(P('Net income'), P('D&A')), C('Operating cash flow (NI + D&A)')],
  ['Opening cash + net cash flow = closing cash', sum(C('Opening cash'), C('Net cash flow for the year')), C('Closing cash')],
];
const broken = checks.filter(([, a, b]) => a.some((v, i) => Math.abs(v - b[i]) > TOL)).map(([n]) => n);
const total = kind => funds.filter(f => f.kind === kind).reduce((a, f) => a + f.value, 0);
if (Math.abs(total('source') - total('use')) > TOL) broken.push('Uses of funds = sources');
if (broken.length) throw new Error('plan data: identity break, not published: ' + broken.join('; '));

// Every plan-specific word lives here, never in app/plan-dashboard.tsx: the component's code ships in every
// build (public included), so a label written there would publish the plan's structure even with no data.
const segOrder = Object.keys(seg.rows).sort((x, y) => seg.rows[y].at(-1) - seg.rows[x].at(-1));
const row = (t, key, label, strong = false) => ({label, strong, values: need(t, key)});
const fundLabel = {
  'Pre-Series A equity round': 'Pre-Series A equity round',
  'CGTMSE-backed term loan': 'CGTMSE-backed term loan',
};
fs.writeFileSync(out, JSON.stringify({
  available: true,
  model: 'Deepgrid Semi financial model, corrected v3 (September)',
  periods,
  series: {
    revenue: P('Revenue'), grossProfit: P('Gross profit'), ebitda: P('EBITDA'), netIncome: P('Net income'),
    openingCash: C('Opening cash'), closingCash: C('Closing cash'), netCashFlow: C('Net cash flow for the year'),
    capex: C('Less: tapeout capex (one-time)'),
  },
  capexLabel: 'tape-out capex',
  segments: segOrder.map(name => ({name, values: seg.rows[name]})),
  reconcileSegment: 'Semiconductors',
  reconcileLede: 'The Portfolio strategy page carries the silicon portfolio plan from the mature-node whitepaper. This model covers the whole company: ' + segOrder.slice(0, -1).join(', ') + ' and ' + segOrder.at(-1) + '. The table sets them side by side; neither is adjusted.',
  plRows: [
    row(pl, 'Revenue', 'Revenue', true), row(pl, 'COGS', 'Cost of goods sold'), row(pl, 'Gross profit', 'Gross profit', true),
    row(pl, 'run-rate R&D', 'R&D, run rate'), row(pl, 'SoC4 5nm tape-out program', 'R&D, SoC4 5 nm tape-out programme'), row(pl, 'R&D (total)', 'R&D, total'),
    row(pl, 'Sales & Marketing', 'Sales and marketing'), row(pl, 'G&A', 'General and administrative'), row(pl, 'Total operating expense', 'Total operating expense'),
    row(pl, 'EBITDA', 'EBITDA', true), row(pl, 'D&A', 'Depreciation and amortisation'), row(pl, 'EBIT', 'EBIT'),
    row(pl, 'Tax (25%, post-carryforward)', 'Tax at 25 %, after loss carry-forward'), row(pl, 'Net income', 'Net income', true),
  ],
  cashRows: [
    row(cash, 'Opening cash', 'Opening cash', true), row(cash, 'Operating cash flow (NI + D&A)', 'Operating cash flow (net income + D&A)'),
    row(cash, 'Less: tapeout capex (one-time)', 'Tape-out capex'), row(cash, 'Less: other capex (equipment, lab)', 'Other capex (equipment, lab)'),
    row(cash, 'Less: TaaS debt interest', 'Fleet-debt interest'), row(cash, 'Less: change in working capital', 'Change in working capital'),
    row(cash, 'Net cash flow for the year', 'Net cash flow', true), row(cash, 'Closing cash', 'Closing cash', true),
  ],
  cashNote: 'Fleet capex (about ₹60 Cr) is financed by debt against the trucks in the model, so it is not in this balance.',
  sources: funds.filter(f => f.kind === 'source').map(f => ({label: fundLabel[f.item] ?? f.item, value: f.value})),
  uses: funds.filter(f => f.kind === 'use').map(f => ({label: f.item, value: f.value})),
  checks: checks.map(([n]) => n).concat('Uses of funds = sources'),
}, null, 1) + '\n');
fs.mkdirSync(pub, {recursive: true});
for (const f of FILES) fs.copyFileSync(path.join(root, 'data/plan', f), path.join(pub, f));
console.log(`plan data: published, ${checks.length + 1} identities pass, ${periods.length} periods`);
