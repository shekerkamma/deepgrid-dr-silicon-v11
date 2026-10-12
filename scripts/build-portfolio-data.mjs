// SKU portfolio dashboard data (/portfolio), published by every build.
//
// data/portfolio/*.csv are extracted from the public SKU Blueprint (October 2026) and the DG32 datasheets by
// scripts/portfolio/extract_portfolio.py; both PDFs are already public downloads, so nothing here needs a gate.
// This re-checks the totals the Blueprint itself states, writes app/portfolio-data.json and copies the CSVs a
// reader can download to public/portfolio-data/. The document-conflict and document-version tables stay out:
// they are a review worklist, kept in the private live dashboard, not a page for buyers or investors.
//
// The one exception is the comparison with the financial model on /plan: its figures are added only by builds
// that publish /plan (DGS_PLAN=1 or DGS_INTERNAL=1), so a build without the plan never prints plan numbers.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'app/portfolio-data.json');
const pub = path.join(root, 'public/portfolio-data');
const FILES = ['skus.csv', 'ramp.csv', 'approvals.csv', 'unit-cost.csv', 'tranche1-uses.csv', 'dg32-specs.csv'];

function parse(file, dir = 'data/portfolio') {
  const text = fs.readFileSync(path.join(root, dir, file), 'utf8').replace(/\r\n/g, '\n').trim();
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
const rows = file => {
  const [head, ...body] = parse(file);
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
};
const n = v => (v === '' || v == null ? null : Number(v));
const fail = [];
const check = (ok, msg) => { if (!ok) fail.push(msg); };

const skus = rows('skus.csv').map(r => ({
  sku: r.sku, name: r.name, process: r.process, clockMhz: n(r.clock_mhz), readiness: r.readiness, mpw: r.mpw,
  shuttle: r.dec2026_shuttle === 'yes', planCr: n(r.plan_line_cr), fy31Cr: n(r.fy31_ramp_cr), units: r.addressable_units,
  marketLowCr: n(r.market_low_cr), marketHighCr: n(r.market_high_cr), verdict: r.verdict,
  devLowCr: n(r.dev_cost_low_cr), devHighCr: n(r.dev_cost_high_cr),
}));
const planned = skus.filter(s => s.planCr != null);
const sum = (xs, k) => Math.round(xs.reduce((a, x) => a + (x[k] || 0), 0) * 10) / 10;
check(planned.length === 11, `expected 11 SKUs with a plan line, found ${planned.length}`);
check(sum(planned, 'planCr') === 1000, `plan lines sum to ${sum(planned, 'planCr')}, the Blueprint states ₹1,000 Cr`);
check(sum(planned, 'devLowCr') === 41.7 && sum(planned, 'devHighCr') === 91.2, 'development cost does not sum to the stated ₹41.7–91.2 Cr');
for (const s of planned) check(s.planCr > 0 && s.fy31Cr != null && s.fy31Cr <= s.planCr, `${s.sku}: FY31 ramp missing or above its plan line`);

const [rh, ...rb] = parse('ramp.csv');
const years = rh.slice(1);
const groups = rb.filter(r => r[0] !== 'Total').map(r => ({name: r[0], values: r.slice(1).map(v => n(v) ?? 0)}));
const totalRow = rb.find(r => r[0] === 'Total');
check(!!totalRow && groups.length === 4, 'ramp: four groups and a Total row expected');
const total = totalRow ? totalRow.slice(1).map(Number) : [];
years.forEach((y, i) => { const s = groups.reduce((a, g) => a + g.values[i], 0); check(Math.abs(s - total[i]) <= 2, `ramp ${y}: groups sum to ${s}, stated total ${total[i]}`); });

const approvals = rows('approvals.csv').map(r => ({market: r.market, approval: r.approval, low: n(r.months_low), high: n(r.months_high)}));
check(approvals.length === 6 && approvals.every(a => a.low > 0 && a.high >= a.low), 'approvals: six markets with low ≤ high expected');
const unitCost = rows('unit-cost.csv').map(r => ({chip: r.chip, dieMm2: n(r.die_mm2), pkg: r.package, costLow: n(r.cost_low_usd), costHigh: n(r.cost_high_usd),
  priceLow: n(r.price_low_usd), priceHigh: n(r.price_high_usd), marginLow: n(r.margin_low_pct), marginHigh: n(r.margin_high_pct), marginAt: n(r.margin_at_price_usd)}));
check(unitCost.length === 4, 'unit cost: four chips expected');
const tranche = rows('tranche1-uses.csv').map(r => ({use: r.use, cr: n(r.cr), delivers: r.delivers}));
check(Math.abs(sum(tranche, 'cr') - 10) < 0.01, `tranche-1 uses sum to ${sum(tranche, 'cr')}, the Blueprint states ₹10 Cr`);
const specs = rows('dg32-specs.csv');
check(specs.length === 2, 'two DG32 parts expected');

// Comparison with /plan, only where /plan is published by this build.
let model = null;
if (process.env.DGS_PLAN === '1' || process.env.DGS_INTERNAL === '1') {
  const pl = parse('pl.csv', 'data/plan'), head = pl[0], rev = pl.find(r => r[0] === 'Revenue');
  const funds = parse('use-of-funds.csv', 'data/plan').slice(1).filter(r => r[0] === 'source').map(([, item, v]) => ({item, cr: Number(v)}));
  const fy31 = head.indexOf('FY2031');
  if (rev && fy31 > 0 && funds.length) model = {fy31RevenueCr: Number(rev[fy31]), sources: funds};
}

if (fail.length) { console.error('portfolio data: not published:\n  ' + fail.join('\n  ')); process.exit(1); }

fs.writeFileSync(out, JSON.stringify({
  source: 'SKU Blueprint, October 2026', sourceFile: 'deepgrid-sku-blueprint-oct2026.pdf',
  skus, years, groups, total, approvals, unitCost, tranche, specs, model,
}, null, 1) + '\n');
fs.rmSync(pub, {recursive: true, force: true});
fs.mkdirSync(pub, {recursive: true});
for (const f of FILES) fs.copyFileSync(path.join(root, 'data/portfolio', f), path.join(pub, f));
console.log(`portfolio data: ${skus.length} SKUs, ${years.length} ramp years, ${FILES.length} CSVs published${model ? ', with the /plan comparison' : ''}`);
