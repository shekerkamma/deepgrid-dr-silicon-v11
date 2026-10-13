// SKU portfolio data (/portfolio and Ask DeepGrid), published by every build.
//
// The live tables are eight public Google Sheets (data/portfolio/sheets.json); the site and the Ask service read them
// at request time. data/portfolio/*.csv is the checked copy every build bundles, used whenever a sheet cannot be read or
// fails app/data/portfolio-facts.ts checkTables(). The extracted tables come from scripts/portfolio/extract_portfolio.py
// (the public SKU Blueprint and DG32 datasheets); documents.csv and conflicts.csv are snapshots of their sheets.
//
// This parses and shapes the copy with the same code the site uses (portfolio-facts.ts), then adds the checks only a
// build can make: the Blueprint's own stated totals (plan lines ₹1,000 Cr, development cost ₹41.7–91.2 Cr, tranche 1
// ₹10 Cr). A break stops the build. The comparison with the financial model on /plan is added only by builds that
// publish /plan (DGS_PLAN=1 or DGS_INTERNAL=1), so a build without the plan never prints plan numbers.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'app/portfolio-data.json');
const pub = path.join(root, 'public/portfolio-data');
const bundle = path.join(root, 'node_modules/.cache/portfolio-facts.mjs');
await esbuild.build({entryPoints: [path.join(root, 'app/data/portfolio-facts.ts')], bundle: true, platform: 'node', format: 'esm', outfile: bundle, logLevel: 'error'});
const {TABLES, parseCsv, checkTables, toPortfolio, portfolioFacts} = await import(pathToFileURL(bundle).href + '?t=' + Date.now());

const tables = Object.fromEntries(TABLES.map(t => [t, parseCsv(fs.readFileSync(path.join(root, 'data/portfolio', t + '.csv'), 'utf8'))]));
const fail = [...checkTables(tables)];
const check = (ok, msg) => { if (!ok) fail.push(msg); };

// Comparison with /plan, only where /plan is published by this build.
let model = null;
if (process.env.DGS_PLAN === '1' || process.env.DGS_INTERNAL === '1') {
  const rd = f => parseCsv(fs.readFileSync(path.join(root, 'data/plan', f), 'utf8'));
  const rev = rd('pl.csv').find(r => r.line_item === 'Revenue');
  const sources = rd('use-of-funds.csv').filter(r => r.kind === 'source').map(r => ({item: r.item, cr: Number(r.rs_cr)}));
  if (rev && rev.FY2031 && sources.length) model = {fy31RevenueCr: Number(rev.FY2031), sources};
}

const d = fail.length ? null : toPortfolio(tables, model);
if (d) {
  const planned = d.skus.filter(s => s.planCr != null);
  const sum = k => Math.round(planned.reduce((a, s) => a + (s[k] || 0), 0) * 10) / 10;
  check(planned.length === 11, `expected 11 SKUs with a plan line, found ${planned.length}`);
  check(sum('planCr') === 1000, `plan lines sum to ${sum('planCr')}, the Blueprint states ₹1,000 Cr`);
  check(sum('devLowCr') === 41.7 && sum('devHighCr') === 91.2, `development cost ${sum('devLowCr')}–${sum('devHighCr')}, the Blueprint states ₹41.7–91.2 Cr`);
  check(Math.abs(d.tranche.reduce((a, t) => a + t.cr, 0) - 10) < 0.01, 'tranche-1 uses do not sum to the stated ₹10 Cr');
  check(d.approvals.length === 6 && d.unitCost.length === 4 && d.specs.length === 2, 'approvals, unit cost or specs row count changed');
  // A withheld claim must not survive into published text, even in a conflict row.
  const text = JSON.stringify([d.documents, d.conflicts, portfolioFacts(d, {live: false}).map(f => f.text)]);
  check(!/2\.88\s?Cr|1\.01\s?Cr|MCEME|39\.3\s?TOPS|12\.9\s?[x×]/i.test(text), 'a withheld claim survives in the published portfolio text');
}
if (fail.length) { console.error('portfolio data: not published:\n  ' + fail.join('\n  ')); process.exit(1); }

fs.writeFileSync(out, JSON.stringify(d, null, 1) + '\n');
fs.rmSync(pub, {recursive: true, force: true});
fs.mkdirSync(pub, {recursive: true});
// documents.csv and conflicts.csv are published as shaped (withheld figures replaced), not as the raw snapshot.
const csv = rows => { const h = Object.keys(rows[0]); const q = v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; return [h.join(','), ...rows.map(r => h.map(k => q(r[k] ?? '')).join(','))].join('\n') + '\n'; };
for (const t of TABLES) {
  if (t === 'documents' || t === 'conflicts') fs.writeFileSync(path.join(pub, t + '.csv'), csv(d[t]));
  else fs.copyFileSync(path.join(root, 'data/portfolio', t + '.csv'), path.join(pub, t + '.csv'));
}
console.log(`portfolio data: ${d.skus.length} SKUs, ${d.conflicts.length} conflicts, ${d.documents.length} documents, ${TABLES.length} CSVs published${model ? ', with the /plan comparison' : ''}`);
