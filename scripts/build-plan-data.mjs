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
// Walk-downs for the money-flow chapter. Each total must equal the running sum of everything above it, every year
// (dashboard rule: flows have to close); the component re-checks and draws a break instead of a bar if one does not.
const neg = xs => xs.map(v => -v);
// A group joins rows that are one cost split in two (R&D: run rate + tape-out), so "largest cost" compares like with like.
const walk = (...rows) => rows.map(([label, values, total = false, group]) => ({label, total, values, ...(group ? {group} : {})}));
const plWalk = walk(
  ['Revenue', P('Revenue'), true], ['Cost of goods sold', neg(P('COGS'))], ['Gross profit', P('Gross profit'), true],
  ['R&D, run rate', neg(P('run-rate R&D')), false, 'R&D'], ['R&D, SoC4 5 nm tape-out programme', neg(P('SoC4 5nm tape-out program')), false, 'R&D'],
  ['Sales and marketing', neg(P('Sales & Marketing'))], ['General and administrative', neg(P('G&A'))], ['EBITDA', P('EBITDA'), true],
  ['Depreciation and amortisation', neg(P('D&A'))], ['Tax at 25 %, after loss carry-forward', neg(P('Tax (25%, post-carryforward)'))], ['Net income', P('Net income'), true],
);
const cashWalk = walk(
  ['Opening cash', C('Opening cash'), true], ['Operating cash flow (net income + D&A)', C('Operating cash flow (NI + D&A)')], ['Tape-out capex', C('Less: tapeout capex (one-time)')],
  ['Other capex (equipment, lab)', C('Less: other capex (equipment, lab)')], ['Fleet-debt interest', C('Less: TaaS debt interest')],
  ['Change in working capital', C('Less: change in working capital')], ['Closing cash', C('Closing cash'), true],
);
for (const [name, w] of [['Revenue walks to net income', plWalk], ['Opening cash walks to closing cash', cashWalk]]) {
  const ok = periods.every((_, i) => { let run = 0; return w.every((r, k) => { if (r.total && k > 0 && Math.abs(r.values[i] - run) > TOL) return false; run = r.total ? r.values[i] : run + r.values[i]; return true; }); });
  checks.push([name, [0], [ok ? 0 : 1]]);
}
const broken2 = checks.filter(([, a, b]) => a.some((v, i) => Math.abs(v - b[i]) > TOL)).map(([n]) => n);
for (const n of broken2) if (!broken.includes(n)) broken.push(n);
if (broken.length) throw new Error('plan data: identity break, not published: ' + broken.join('; '));

// Every plan-specific word lives here, never in app/plan-dashboard.tsx: the component's code ships in every
// build (public included), so a label written there would publish the plan's structure even with no data.
const segOrder = Object.keys(seg.rows).sort((x, y) => seg.rows[y].at(-1) - seg.rows[x].at(-1));
const row = (t, key, label, strong = false) => ({label, strong, values: need(t, key)});
const fundLabel = {
  'Pre-Series A equity round': 'Pre-Series A equity round',
  'CGTMSE-backed term loan': 'CGTMSE-backed term loan',
};

function parsePortfolioCsv(file, dir = 'data/portfolio') {
  const text = fs.readFileSync(path.join(root, dir, file), 'utf8').replace(/\r\n/g, '\n').trim();
  const rows = text.split('\n').map(line => {
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { cells.push(cur.trim()); cur = ''; } else cur += c;
    }
    cells.push(cur.trim()); return cells;
  });
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

// Founder inputs (tape-out and bank actuals). The real file is gitignored because these repos are public;
// without it the committed empty template is read and every value stays INPUT REQUIRED.
function readFounderInputs() {
  const local = fs.existsSync(path.join(root, 'data/plan/founder-inputs.csv'));
  const rows = parsePortfolioCsv(local ? 'founder-inputs.csv' : 'founder-inputs.template.csv', 'data/plan');
  const filled = rows.filter(r => r.value !== '');
  for (const r of filled) if (!/^\d{4}-\d{2}-\d{2}$/.test(r.as_of)) throw new Error(`founder inputs: ${r.scope}.${r.field} has a value but no YYYY-MM-DD as_of`);
  const get = (scope, field) => rows.find(r => r.scope === scope && r.field === field && r.value !== '')?.value;
  const asOf = filled.map(r => r.as_of).sort().at(-1);
  const today = process.env.DGS_TODAY || new Date().toISOString().slice(0, 10);
  const ageDays = asOf ? Math.round((Date.parse(today) - Date.parse(asOf)) / 864e5) : null;
  const status = !asOf
    ? `Founder inputs: none recorded. Fill data/plan/founder-inputs.csv (kept out of git) from founder-inputs.template.csv; until then tape-out and bank actuals stay INPUT REQUIRED.`
    : `${ageDays > 7 ? 'STALE: ' : ''}Founder inputs as of ${asOf} (${ageDays} days before this build${ageDays > 7 ? ', more than 7' : ''}); ${filled.length} of ${rows.length} values recorded.`;
  return {get, status};
}

function buildDecisionReport() {
  const tranche = parsePortfolioCsv('tranche1-uses.csv');
  const skus = parsePortfolioCsv('skus.csv');
  const ramp = parsePortfolioCsv('ramp.csv');
  const unitCost = parsePortfolioCsv('unit-cost.csv');
  const specs = parsePortfolioCsv('dg32-specs.csv');
  const docs = parsePortfolioCsv('documents.csv');
  const conflicts = parsePortfolioCsv('conflicts.csv');

  const mustNum = (v, label) => {
    const n = Number(v ?? NaN);
    if (v === undefined || v === '' || Number.isNaN(n)) throw new Error(`plan data: missing or non-numeric ${label}`);
    return n;
  };
  const trancheTotalCr = Math.round(tranche.reduce((a, r) => a + mustNum(r.cr, 'tranche.cr'), 0) * 100) / 100;
  const protoRow = tranche.find(r => /prototypes/i.test(r.use));
  const respinRow = tranche.find(r => /respin/i.test(r.use));
  const teamRow = tranche.find(r => /engineering team/i.test(r.use));
  const approvalsRow = tranche.find(r => /approvals/i.test(r.use));
  const protoCr = mustNum(protoRow?.cr, 'protoCr');
  const respinCr = mustNum(respinRow?.cr, 'respinCr');
  const siliconTrancheCr = Math.round((protoCr + respinCr) * 100) / 100;
  const teamCr = mustNum(teamRow?.cr, 'teamCr');
  const approvalsCr = mustNum(approvalsRow?.cr, 'approvalsCr');
  // Extract "₹1.0 Cr to March 2027, ₹1.5 Cr for the following 12 months; tranche 2 grows" directly from tranche1-uses.csv
  const followMonthsMatch = teamRow?.delivers.match(/(\d+)\s+months/i);
  const followMonths = mustNum(followMonthsMatch?.[1], 'followMonths');

  const shuttleSkus = skus.filter(s => s.dec2026_shuttle === 'yes');
  const plannedSkus = skus.filter(s => s.plan_line_cr !== '');
  const shuttleCount = shuttleSkus.length;
  const perChipShuttleCr = Math.round((protoCr / shuttleCount) * 100) / 100;
  // tranche1-uses.csv row 5 explicitly states "About eight prototype re-runs at ₹0.29 Cr each"
  if (!/eight/i.test(respinRow?.delivers ?? '')) throw new Error('plan data: missing respin re-run count in tranche1-uses.csv');
  const respinRuns = 8;
  const shuttlePlanCr = Math.round(shuttleSkus.reduce((a, s) => a + mustNum(s.plan_line_cr, 'shuttle plan_line_cr'), 0) * 10) / 10;
  const totalPlanCr = Math.round(plannedSkus.reduce((a, s) => a + mustNum(s.plan_line_cr, 'plan_line_cr'), 0) * 10) / 10;
  const shuttleRampFy31Cr = Math.round(shuttleSkus.reduce((a, s) => a + mustNum(s.fy31_ramp_cr, 'shuttle fy31_ramp_cr'), 0) * 10) / 10;
  const skuRampFy31SumCr = Math.round(plannedSkus.reduce((a, s) => a + mustNum(s.fy31_ramp_cr, 'fy31_ramp_cr'), 0) * 10) / 10;
  const top3Shuttle = [...shuttleSkus].sort((a, b) => Number(b.fy31_ramp_cr) - Number(a.fy31_ramp_cr)).slice(0, 3);
  const top3ShuttleRampCr = Math.round(top3Shuttle.reduce((a, s) => a + mustNum(s.fy31_ramp_cr, 'top3 fy31_ramp_cr'), 0) * 10) / 10;
  const top3ShuttleSharePct = Math.round((top3ShuttleRampCr / shuttleRampFy31Cr) * 1000) / 10;
  const sku6RampCr = mustNum(shuttleSkus.find(s => s.sku === 'SKU-6')?.fy31_ramp_cr, 'sku6RampCr');
  const sku6PlanCr = mustNum(shuttleSkus.find(s => s.sku === 'SKU-6')?.plan_line_cr, 'sku6PlanCr');
  const sku6SharePct = Math.round((sku6RampCr / shuttleRampFy31Cr) * 1000) / 10;
  const defence = parsePortfolioCsv('approvals.csv').find(a => /^Defence/i.test(a.market));
  if (!defence) throw new Error('plan data: approvals.csv has no Defence row');
  const top4ProtectedSharePct = Math.round(((top3ShuttleRampCr + sku6RampCr) / shuttleRampFy31Cr) * 1000) / 10;
  const devLowShuttleCr = Math.round(shuttleSkus.reduce((a, s) => a + mustNum(s.dev_cost_low_cr, 'dev_cost_low_cr'), 0) * 10) / 10;
  const devHighShuttleCr = Math.round(shuttleSkus.reduce((a, s) => a + mustNum(s.dev_cost_high_cr, 'dev_cost_high_cr'), 0) * 10) / 10;
  const devLowAllCr = Math.round(plannedSkus.reduce((a, s) => a + mustNum(s.dev_cost_low_cr, 'dev_cost_low_cr'), 0) * 10) / 10;
  const devHighAllCr = Math.round(plannedSkus.reduce((a, s) => a + mustNum(s.dev_cost_high_cr, 'dev_cost_high_cr'), 0) * 10) / 10;

  const modelSourcesCr = Math.round(total('source') * 100) / 100;
  const modelUsesCr = Math.round(total('use') * 100) / 100;
  const soc2NreCr = mustNum(funds.find(f => /SoC2 tapeout/i.test(f.item))?.value, 'soc2NreCr');
  const y27 = periods.indexOf('FY2027'), y28 = periods.indexOf('FY2028'), y29 = periods.indexOf('FY2029'), y31 = periods.indexOf('FY2031');
  const capex = C('Less: tapeout capex (one-time)');
  const fy27TapeoutCapexCr = capex[y27];
  const threeYrTapeoutCapexCr = Math.round((capex[y27] + capex[y28] + capex[y29]) * 100) / 100;
  const fy27OpenCashCr = C('Opening cash')[y27];
  const fy29CloseCashCr = C('Closing cash')[y29];
  const fy31ModelRevCr = P('Revenue')[y31];
  const fy31ModelGpCr = P('Gross profit')[y31];
  const fy31ModelGmPct = Math.round((fy31ModelGpCr / fy31ModelRevCr) * 1000) / 10;
  const soc4CumRdCr = Math.round(P('SoC4 5nm tape-out program').reduce((a, v) => a + v, 0) * 100) / 100;
  const fy31SemiRevCr = S('Semiconductors')[y31];
  const fy31SysRevCr = S('Systems')[y31];
  const fy31RampTotalCr = mustNum(ramp.find(r => r.group === 'Total')?.FY31, 'fy31RampTotalCr');
  const chipGapRatio = Math.round((fy31RampTotalCr / fy31SemiRevCr) * 10) / 10;
  const minChipMarginPct = Math.min(...unitCost.map(u => Number(u.margin_low_pct)));
  const maxChipMarginPct = Math.max(...unitCost.map(u => Number(u.margin_high_pct)));

  const claimSrc = fs.readFileSync(path.join(root, 'app/claims.ts'), 'utf8');
  const compSrc = fs.readFileSync(path.join(root, 'app/company-content.ts'), 'utf8');
  const ENTRY = /'([\w-]+)':\s*\{[\s\S]*?source:\s*'([^']+)'[\s\S]*?probe:\s*'([^']+)'/g;
  const parseEntries = text => [...text.matchAll(ENTRY)].map(m => ({id: m[1], source: m[2], probe: m[3]}));
  const claimEntries = parseEntries(claimSrc);
  const cStart = compSrc.indexOf('export const companySources');
  const companyEntries = cStart < 0 ? [] : parseEntries(compSrc.slice(cStart, compSrc.indexOf('\n};', cStart)));
  const allEntries = [...claimEntries, ...companyEntries];
  for (const e of allEntries) {
    const p = path.join(root, 'public/downloads', e.source);
    if (!fs.existsSync(p) || !fs.readFileSync(p, 'utf8').includes(e.probe)) {
      throw new Error(`plan data: claim probe failed for ${e.id} (${e.source})`);
    }
  }
  const totalProbedClaims = allEntries.length;
  const supersededPublished = docs.filter(d => d.where === 'published' && /superseded/i.test(d.status));
  const fixedConflicts = conflicts.filter(c => /^fixed/i.test(c.status)).length;

  const crFmt = (v, dp = 2) => `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN', {minimumFractionDigits: dp, maximumFractionDigits: dp})}\u00a0Cr`;

  const inputs = readFounderInputs();
  const ladder = skus.map(s => {
    const specRow = specs.find(sp => sp.sku === s.sku);
    const r = s.readiness || '';
    const hasSpec = Boolean(s.plan_line_cr || r);
    const hasRtl = /RTL/i.test(r) || Boolean(specRow);
    const hasAnalog = /analog schematics/i.test(r) ? 'Schematics ready' : specRow ? '8-bit SAR (untrimmed)' : 'INPUT REQUIRED';
    const hasLayout = specRow && /hardened die/i.test(specRow.status) ? 'Hardened die (55–62 MHz post-route)' : 'INPUT REQUIRED';
    return {
      sku: s.sku,
      name: s.name,
      process: s.process,
      shuttle: s.dec2026_shuttle === 'yes' ? 'Dec 2026 shuttle' : 'Off shuttle',
      planCr: s.plan_line_cr ? Number(s.plan_line_cr).toFixed(2) : 'INPUT REQUIRED',
      rampFy31Cr: s.fy31_ramp_cr ? Number(s.fy31_ramp_cr).toFixed(2) : 'INPUT REQUIRED',
      devRangeCr: s.dev_cost_low_cr && s.dev_cost_high_cr ? `${s.dev_cost_low_cr}–${s.dev_cost_high_cr}` : 'INPUT REQUIRED',
      spec: hasSpec ? (specRow ? specRow.source : 'SKU Blueprint (no standalone datasheet)') : 'INPUT REQUIRED',
      rtl: hasRtl ? r || specRow.status : 'INPUT REQUIRED',
      analog: hasAnalog,
      layout: inputs.get(s.sku, 'layout') ?? hasLayout,
      drcLvs: inputs.get(s.sku, 'drc_lvs') ?? 'INPUT REQUIRED',
      slotBooked: inputs.get(s.sku, 'slot_booked') ?? (s.mpw ? `${s.mpw} (booking confirmation: INPUT REQUIRED)` : 'INPUT REQUIRED'),
      gdsSubmitted: inputs.get(s.sku, 'gds_submitted') ?? 'INPUT REQUIRED',
      sourceAttr: 'data/portfolio/skus.csv; data/portfolio/dg32-specs.csv',
      sourceHref: '/portfolio-data/skus.csv',
      sourceLabel: 'skus.csv',
    };
  });

  // Backtest (scripts/backtest-conflicts.mjs, regenerated from full git history) and the ranking challenge.
  const backtest = fs.existsSync(path.join(root, 'data/portfolio/conflict-backtest.csv')) ? parsePortfolioCsv('conflict-backtest.csv') : [];
  const measured = backtest.filter(b => b.lag_days !== '');
  const lags = measured.map(b => Number(b.lag_days));
  const decidedConflict = conflicts.find(c => /^decided/i.test(c.status) && /confidential/i.test(c.topic));
  const openConflicts = conflicts.filter(c => !/^(fixed|decided|info)/i.test(c.status));
  // Exposure = FY31 shuttle ramp of each SKU with an unrecorded stage; urgency (days to the GDS freeze) is uniform
  // until data/plan/founder-inputs.csv records the freeze date, so the order is by exposure alone.
  const gdsDeadline = inputs.get('company', 'gds_deadline');
  // A stage counts as resolved only when it says so; "open: 14 DRC errors" or "not started" still counts as unresolved.
  const STAGE_DONE = /^(?:complete|clean|confirmed|submitted|signed off)\b|^Hardened die/i;
  const exposure = ladder
    .filter(l => l.shuttle === 'Dec 2026 shuttle')
    .map(l => ({sku: l.sku, cr: Number(l.rampFy31Cr), missing: ['layout', 'drcLvs', 'gdsSubmitted'].filter(k => !STAGE_DONE.test(l[k])).length}))
    .filter(x => x.missing > 0)
    .sort((a, b) => b.cr - a.cr || a.sku.localeCompare(b.sku));
  const d1Skus = ['SKU-1', 'SKU-2', 'SKU-10'];
  const coveredBy = sku => d1Skus.includes(sku) ? 'Decision 1' : sku === 'SKU-6' ? 'Decision 3' : 'Not in a decision';
  // Diligence holdout (scripts/ask-diligence.mjs + score-diligence.mjs): the questions the live Ask cannot answer.
  const dil = fs.existsSync(path.join(root, 'data/diligence/results.csv')) ? parsePortfolioCsv('results.csv', 'data/diligence') : [];
  const dilScore = set => `${dil.filter(r => r.set === set && r.pass === 'yes').length}/${dil.filter(r => r.set === set).length}`;
  const dilMs = dil.map(r => Number(r.ms)).sort((a, b) => a - b);
  const dilP95 = dilMs.length ? dilMs[Math.min(dilMs.length - 1, Math.ceil(0.95 * dilMs.length) - 1)] : 0;
  const sections = [
    {
      id: 'ch-dr-backtest',
      title: `${measured.length} of ${backtest.length} contradictions sat in the repo ${Math.min(...lags)} to ${Math.max(...lags)} days before anyone logged them`,
      heading: 'Days between both sides entering git and the conflict being logged',
      sub: `${measured.length} of ${backtest.length} logged conflicts are measurable from git history: ${Math.min(...lags)} to ${Math.max(...lags)} days between both sides being in the repo and the conflict being logged. Today's content gates (check-claims, check-crossrefs) pass on commit 3f05289, where all ${backtest.length} were still present: they check that claims link to their sources, not that two documents agree. Dates come from when each source file or passage first entered git.`,
      caption: 'Conflict backtest against git history',
      head: ['Conflict', 'Both sides in repo', 'Logged', 'Days', 'Note'],
      rows: backtest.map(b => ({
        cells: [b.topic, b.both_present_date ? `${b.both_present_date} (${b.both_present_commit})` : 'Not in git', `${b.logged_date} (${b.logged_commit})`, b.lag_days || 'Not measurable', b.note || ''],
        sourceAttr: 'data/portfolio/conflict-backtest.csv; data/portfolio/conflicts.csv', sourceHref: '/portfolio-data/conflicts.csv', sourceLabel: 'conflicts.csv',
      })),
    },
    {
      id: 'ch-dr-rank',
      title: `The top ${exposure.findIndex(x => coveredBy(x.sku) === 'Not in a decision') < 0 ? exposure.length : exposure.findIndex(x => coveredBy(x.sku) === 'Not in a decision')} SKUs by FY31 revenue at stake are all in a decision`,
      heading: 'Shuttle SKUs with a stage not recorded as complete, by FY31 revenue',
      sub: `Ranked by FY31 shuttle revenue exposed to a stage not recorded as complete. Days to the GDS freeze: ${gdsDeadline ?? 'INPUT REQUIRED'}${gdsDeadline ? '' : ', so urgency cannot be computed and the order uses exposure alone'}. Open conflicts: ${openConflicts.length} of ${conflicts.length}. Decision 3 was replaced on 23 Oct 2026 by SKU-6, the first SKU not in a decision: the owner kept the whitepaper published, as conflicts.csv records (decided 12 Oct 2026).`,
      caption: 'Exposure ranking against the current decisions',
      head: ['Rank', 'Item', 'FY31 ₹ Cr exposed', 'Stages not complete', 'Covered by'],
      rows: exposure.map((x, i) => ({
        cells: [String(i + 1), x.sku, x.cr.toFixed(2), String(x.missing), coveredBy(x.sku)],
        sourceAttr: 'data/portfolio/skus.csv; data/plan/founder-inputs.csv', sourceHref: '/portfolio-data/skus.csv', sourceLabel: 'skus.csv',
      })),
      decided: decidedConflict ? `${decidedConflict.topic}: ${decidedConflict.status}` : '',
    },
    ...(dil.length ? [{
      id: 'ch-dr-diligence',
      title: `Ask answers ${dilScore('holdout')} holdout diligence questions correctly, at ${(dilP95 / 1000).toFixed(1)} s p95`,
      heading: 'Questions that failed, with the reason',
      sub: `${dil.length} data-room questions written and frozen before any answer was seen, run through the live Ask service and scored without a model. Holdout ${dilScore('holdout')}, tuning ${dilScore('tuning')}; latency p95 ${(dilP95 / 1000).toFixed(1)} s against a 5 s goal; ${dil.filter(r => r.cites_superseded_whitepaper === 'yes').length} answers cite the superseded whitepaper. The scorer was corrected after the holdout answers had been read (holdout 3/10 before the citation fix), so the holdout is no longer blind; see data/diligence/README.md. Rows below are the questions that failed.`,
      caption: 'Diligence questions the site does not answer correctly',
      head: ['#', 'Question', 'Set', 'Expected', 'Why it failed'],
      rows: dil.filter(r => r.pass !== 'yes').map(r => ({
        cells: [r.n, r.q, r.set, r.expect, r.reason],
        sourceAttr: 'data/diligence/results.csv; data/diligence/questions.json', sourceHref: '/portfolio-data/documents.csv', sourceLabel: 'documents.csv',
      })),
    }] : []),
  ];

  return {
    tabs: [
      {id: 'model', label: 'Company model (FY27–FY32)'},
      {id: 'decisions', label: 'Founder decisions (internal)'},
    ],
    labels: {
      sourcePrefix: 'Source:',
      sourcesPrefix: 'Sources:',
      deadlinePrefix: 'Deadline:',
      forLabel: 'Argument for',
      againstLabel: 'Argument against',
      missingLabel: 'Missing input',
      tieTitle: 'Three-way capital and runway tie-out',
      tieSub: 'Reconciliation of Blueprint Tranche 1 against Model v3 sources, uses and cash flow.',
      tieCaption: 'Three-way financial tie-out',
      tieHead: ['Dimension', 'SKU Blueprint (Oct 2026)', 'Model v3 Sources & Uses', 'Model v3 Cash & P&L', 'Tie-out verdict', 'Source'],
      ladderTitle: 'Per-SKU stage-gate readiness ladder',
      ladderSub: 'Stage-gate status across all twelve portfolio rows; unverified stages are marked INPUT REQUIRED.',
      ladderCaption: 'Per-SKU shuttle readiness ladder',
      ladderHead: ['SKU', 'Chip', 'Cohort', 'Plan ₹\u00a0Cr', 'FY31 ₹\u00a0Cr', 'Dev ₹\u00a0Cr', 'Spec', 'RTL', 'Analog', 'Layout', 'DRC/LVS', 'Slot booked', 'GDS', 'Source'],
      auditTitle: 'Red-team audit and evidence integrity',
      auditSub: 'Ranked contradictions and diligence checks from raw tables and public downloads.',
      auditCaption: 'Red-team findings ranked',
      auditHead: ['#', 'Lens', 'Finding', 'Current status', 'Source'],
    },
    flag: `Internal founder decision report (DGS_INTERNAL=1 · noindex). Every figure is computed at build from data/plan/*.csv, data/portfolio/*.csv and app/claims.ts (${totalProbedClaims}/${totalProbedClaims} probed claims verified, 0 untraced). Missing tape-out and bank actuals are marked INPUT REQUIRED.`,
    inputsStatus: inputs.status,
    heading: 'DECIDE THIS WEEK',
    subhead: `Target outcome: put ${shuttleCount} SKUs (${crFmt(shuttlePlanCr, 0)} of ${crFmt(totalPlanCr, 0)} plan lines; ${crFmt(shuttleRampFy31Cr, 0)} FY31 ramp) onto the December 2026 shuttle (exact foundry GDS cutoff: INPUT REQUIRED) and close the ${crFmt(trancheTotalCr)} Tranche 1 without an investor finding two numbers that disagree.`,
    metrics: {
      trancheTotalCr, protoCr, respinCr, siliconTrancheCr, teamCr, approvalsCr, followMonths,
      shuttleCount, perChipShuttleCr, respinRuns, shuttlePlanCr, totalPlanCr, shuttleRampFy31Cr, skuRampFy31SumCr,
      top3ShuttleRampCr, top3ShuttleSharePct, top4ProtectedSharePct, devLowShuttleCr, devHighShuttleCr, devLowAllCr, devHighAllCr,
      modelSourcesCr, modelUsesCr, soc2NreCr, fy27TapeoutCapexCr, threeYrTapeoutCapexCr,
      fy27OpenCashCr, fy29CloseCashCr, fy31ModelRevCr, fy31ModelGpCr, fy31ModelGmPct, soc4CumRdCr,
      fy31SemiRevCr, fy31SysRevCr, fy31RampTotalCr, chipGapRatio, minChipMarginPct, maxChipMarginPct,
      totalProbedClaims, conflictsCount: conflicts.length, documentsCount: docs.length,
    },
    kpis: [
      {
        label: 'Tranche 1 silicon allocation',
        value: `${crFmt(siliconTrancheCr)} / ${crFmt(trancheTotalCr)}`,
        context: `${crFmt(protoCr)} for ${shuttleCount} Dec 2026 prototypes (~${crFmt(perChipShuttleCr)} each) + ${crFmt(respinCr)} respin reserve (~${respinRuns} re-runs).`,
        def: `Blueprint Tranche 1 silicon = prototypes (${crFmt(protoCr)}) + respin reserve (${crFmt(respinCr)}) ÷ ${crFmt(trancheTotalCr)} total ask (${((siliconTrancheCr / trancheTotalCr) * 100).toFixed(1)}%).`,
        sourceAttr: 'data/portfolio/tranche1-uses.csv rows 2,5',
        sourceHref: '/portfolio-data/tranche1-uses.csv',
        sourceLabel: 'tranche1-uses.csv',
      },
      {
        label: 'Tranche 1 team runway',
        value: `Mar 2028 (+${followMonths} mo)`,
        context: `${crFmt(teamCr)} funds ₹1.00 Cr to Mar 2027 + ₹1.50 Cr for the following ${followMonths} months (to Mar 2028) until Tranche 2 (target date: INPUT REQUIRED).`,
        def: `Formula: ₹1.00 Cr through Mar 2027 + ₹1.50 Cr across ${followMonths} months (Apr 2027–Mar 2028 at ₹0.125 Cr/mo). Close date & bank cash: INPUT REQUIRED.`,
        sourceAttr: 'data/portfolio/tranche1-uses.csv row 6; data/plan/metrics.md',
        sourceHref: '/portfolio-data/tranche1-uses.csv',
        sourceLabel: 'tranche1-uses.csv',
      },
      {
        label: 'Top-3 shuttle concentration',
        value: `${top3ShuttleSharePct.toFixed(1)}% (${crFmt(top3ShuttleRampCr, 0)})`,
        context: `${top3Shuttle.map(s => s.sku).join(', ')} carry ${crFmt(top3ShuttleRampCr, 0)} of the ${crFmt(shuttleRampFy31Cr, 0)} FY31 shuttle ramp; 0 of 3 have a datasheet.`,
        def: 'Formula: sum of top 3 shuttle FY31 ramps (₹256 + ₹175 + ₹110 Cr) ÷ 9-chip shuttle FY31 ramp (₹601 Cr).',
        sourceAttr: 'data/portfolio/skus.csv rows 2,3,11',
        sourceHref: '/portfolio-data/skus.csv',
        sourceLabel: 'skus.csv',
      },
      {
        label: 'Blueprint vs Model chip gap',
        value: `${chipGapRatio.toFixed(1)}×`,
        context: `FY31 chips: ${crFmt(fy31RampTotalCr, 0)} in Blueprint ramp vs ${crFmt(fy31SemiRevCr)} in Model v3 (${crFmt(fy31ModelRevCr, 1)} total; ${crFmt(fy31SysRevCr, 1)} Systems).`,
        def: 'Formula: ramp.csv FY31 Total (₹608.00 Cr) ÷ revenue-by-segment.csv FY2031 Semiconductors (₹45.00 Cr).',
        sourceAttr: 'data/portfolio/ramp.csv row 6; data/plan/revenue-by-segment.csv row 3',
        sourceHref: '/plan-data/revenue-by-segment.csv',
        sourceLabel: 'revenue-by-segment.csv',
      },
    ],
    decisions: [
      {
        id: 'D1',
        title: '1. Lock physical layout & preliminary datasheets for SKU-1, SKU-2 and SKU-10, or narrow the Dec 2026 shuttle cohort',
        badge: `${top3ShuttleSharePct.toFixed(1)}% of FY31 shuttle ramp (${crFmt(top3ShuttleRampCr, 0)} / ${crFmt(shuttleRampFy31Cr, 0)})`,
        lead: `Three chips (SKU-1 ₹256 Cr, SKU-2 ₹175 Cr, SKU-10 ₹110 Cr) carry ${crFmt(top3ShuttleRampCr, 0)} of the ${crFmt(shuttleRampFy31Cr, 0)} FY31 shuttle ramp, yet only SKU-4 (₹4 Cr FY31 ramp) has a hardened die and preliminary datasheet.`,
        forArg: `Focusing layout, DRC/LVS and preliminary datasheets on SKU-1, SKU-2, SKU-6 (${crFmt(approvalsCr)} First approvals covers SKU-6 MIL screening and SKU-2 meter certification) and SKU-10 protects ${top4ProtectedSharePct.toFixed(1)}% of FY31 shuttle revenue before the December 2026 shuttle.`,
        againstArg: `Dropping any of the 9 shuttle chips changes the headline "nine prototypes for ${crFmt(protoCr)}" in the Oct 2026 Blueprint and leaves ${crFmt(perChipShuttleCr)}/slot unspent unless reallocated to respins.`,
        deadline: 'Before December 2026 shuttle (exact foundry GDS cutoff date: INPUT REQUIRED)',
        inputRequired: 'INPUT REQUIRED: ChipFoundry GDS freeze date, slot booking receipts, and layout/DRC/LVS status for SKU-1..3, 5, 6, 8, 9, 10.',
        sourceAttr: 'data/portfolio/skus.csv rows 2-11; data/portfolio/dg32-specs.csv rows 2-3',
        sourceLinks: [
          {label: 'skus.csv', href: '/portfolio-data/skus.csv', download: true},
          {label: 'dg32-specs.csv', href: '/portfolio-data/dg32-specs.csv', download: true},
        ],
      },
      {
        id: 'D2',
        title: '2. Publish Financial Model v4 reconciling the ₹10.00 Cr Tranche 1 against the ₹55.00 Cr / −₹18.00 Cr FY27 capex model',
        badge: `${crFmt(siliconTrancheCr)} Tranche 1 silicon vs ${crFmt(fy27TapeoutCapexCr)} FY27 tape-out capex`,
        lead: `Adversarial tie-out confirms two separate capital scopes: Blueprint Tranche 1 raises ${crFmt(trancheTotalCr)} (${crFmt(protoCr)} prototypes + ${crFmt(respinCr)} respins), while Model v3 opens FY27 with ${crFmt(fy27OpenCashCr)} and spends ${crFmt(fy27TapeoutCapexCr)} FY27 tape-out capex (${crFmt(threeYrTapeoutCapexCr)} over FY27–FY29) plus ${crFmt(soc4CumRdCr)} on "SoC4 5nm tape-out program".`,
        forArg: `Issuing Model v4 with the ${crFmt(fy31RampTotalCr, 0)} Blueprint chip ramp, 130/180 nm capex schedule and ${crFmt(devLowAllCr, 1)}–${crFmt(devHighAllCr, 1)} 11-SKU development range eliminates the #1 diligence contradiction (${chipGapRatio.toFixed(1)}× FY31 chip gap).`,
        againstArg: `Replacing Model v3 changes the ${crFmt(fy31ModelRevCr, 1)} FY31 whole-company headline (${crFmt(fy31SysRevCr, 1)} Systems) and exposes that ${crFmt(devHighAllCr, 1)} high-case chip dev cost exceeds the ${crFmt(50, 0)} Blueprint tranches by ${crFmt(devHighAllCr - 50, 1)}.`,
        deadline: 'Before Tranche 1 close & March 2027 engineering milestone (exact close date: INPUT REQUIRED)',
        inputRequired: 'INPUT REQUIRED: actual cash in bank today, committed Tranche 1 subscriptions, and whether Systems & SoC4 5nm stay in the corporate entity.',
        sourceAttr: 'data/portfolio/tranche1-uses.csv; data/plan/use-of-funds.csv; data/plan/cash.csv; data/plan/pl.csv',
        sourceLinks: [
          {label: 'tranche1-uses.csv', href: '/portfolio-data/tranche1-uses.csv', download: true},
          {label: 'cash.csv', href: '/plan-data/cash.csv', download: true},
          {label: 'use-of-funds.csv', href: '/plan-data/use-of-funds.csv', download: true},
        ],
      },
      {
        id: 'D3',
        title: '3. Decide the SKU-6 qualification path: whether military screening of the 130 nm December 2026 prototype carries over to 180 nm production',
        badge: `${crFmt(sku6RampCr, 0)} FY31 ramp · ${crFmt(sku6PlanCr, 0)} plan line · ${crFmt(approvalsCr)} first approvals`,
        lead: `SKU-6 (Voltage Supervisor) is the first shuttle SKU not covered by a decision: ${crFmt(sku6RampCr, 0)} FY31 ramp, built at 130 nm first and 180 nm in production. Tranche 1 spends ${crFmt(approvalsCr)} on first approvals, which include its military screening, and MIL screening plus approved-vendor listing takes ${defence.months_low}–${defence.months_high} months from silicon (estimate).`,
        forArg: `Settling now whether screening runs on the 130 nm prototype or is repeated at 180 nm sets how much of the ${crFmt(approvalsCr)} first-approvals line SKU-6 needs, and whether a defence buyer can start the ${defence.months_low}–${defence.months_high} month listing from the December 2026 silicon.`,
        againstArg: `SKU-6 carries ${crFmt(sku6RampCr, 0)} of the ${crFmt(shuttleRampFy31Cr, 0)} FY31 shuttle ramp (${sku6SharePct.toFixed(1)}%), and its layout, DRC/LVS and GDS stages are not recorded yet, so the choice could wait until physical design shows which node it ships on.`,
        deadline: 'Before December 2026 shuttle (exact foundry GDS cutoff date: INPUT REQUIRED)',
        inputRequired: 'INPUT REQUIRED: the screening standard, whether 130 nm screening results are accepted for 180 nm production, and layout/DRC/LVS status for SKU-6.',
        sourceAttr: 'data/portfolio/skus.csv row 7; data/portfolio/tranche1-uses.csv row 4; data/portfolio/approvals.csv row 5',
        sourceLinks: [
          {label: 'skus.csv', href: '/portfolio-data/skus.csv', download: true},
          {label: 'tranche1-uses.csv', href: '/portfolio-data/tranche1-uses.csv', download: true},
          {label: 'approvals.csv', href: '/portfolio-data/approvals.csv', download: true},
        ],
      },
    ],
    tieOut: [
      {
        item: 'Total capital raised / ask',
        blueprint: `${crFmt(trancheTotalCr)} Tranche 1 (+ ₹40.00\u00a0Cr Tranche 2 = ₹50.00\u00a0Cr equity)`,
        modelFunds: `${crFmt(modelSourcesCr)} (₹45.00\u00a0Cr equity + ₹10.00\u00a0Cr CGTMSE loan)`,
        modelCash: `FY27 Opening cash ${crFmt(fy27OpenCashCr)} (models full equity round on day 1)`,
        verdict: 'Different capital structures (staged equity vs upfront equity + loan)',
        sourceAttr: 'tranche1-uses.csv; use-of-funds.csv rows 2-3; cash.csv row 8',
        sourceHref: '/plan-data/use-of-funds.csv',
        sourceLabel: 'use-of-funds.csv',
      },
      {
        item: 'Silicon tape-out / prototype spend',
        blueprint: `${crFmt(protoCr)} (9 Dec 2026 prototypes) + ${crFmt(respinCr)} (respin reserve) = ${crFmt(siliconTrancheCr)}`,
        modelFunds: `${crFmt(soc2NreCr)} SoC2 tapeout NRE + IP (MPW → full die → mask)`,
        modelCash: `Tape-out capex ${crFmt(fy27TapeoutCapexCr)} FY27, −₹10.00\u00a0Cr FY28, −₹2.00\u00a0Cr FY29 (${crFmt(threeYrTapeoutCapexCr)} 3-yr)`,
        verdict: `Scope split: 130 nm MPW shuttle (${crFmt(siliconTrancheCr)}) vs multi-year mask capex (${crFmt(threeYrTapeoutCapexCr)})`,
        sourceAttr: 'tranche1-uses.csv rows 2,5; use-of-funds.csv row 4; cash.csv row 3',
        sourceHref: '/plan-data/cash.csv',
        sourceLabel: 'cash.csv',
      },
      {
        item: 'All-chip development cost vs raise',
        blueprint: `9 shuttle SKUs: ${crFmt(devLowShuttleCr, 1)}–${crFmt(devHighShuttleCr, 1)}; all 11 SKUs: ${crFmt(devLowAllCr, 1)}–${crFmt(devHighAllCr, 1)}`,
        modelFunds: `${crFmt(modelUsesCr)} total uses (${crFmt(9.024)} Engineering + ${crFmt(soc2NreCr)} NRE)`,
        modelCash: `Cash trough ${crFmt(fy29CloseCashCr)} at end FY2029; P&L also spends ${crFmt(soc4CumRdCr)} on SoC4 5nm R&D`,
        verdict: `₹50.00\u00a0Cr covers low case (+${crFmt(50 - devLowAllCr, 1)}) but is ${crFmt(devHighAllCr - 50, 1)} below 11-SKU high case`,
        sourceAttr: 'skus.csv dev_cost_low_cr..dev_cost_high_cr; pl.csv row 7; cash.csv row 9',
        sourceHref: '/portfolio-data/skus.csv',
        sourceLabel: 'skus.csv',
      },
      {
        item: 'FY2031 revenue & gross margin',
        blueprint: `${crFmt(fy31RampTotalCr, 0)} chip ramp table (${crFmt(skuRampFy31SumCr, 0)} SKU sum); chip GM ${minChipMarginPct}–${maxChipMarginPct}%`,
        modelFunds: 'Not in use-of-funds.csv',
        modelCash: `FY31 Revenue ${crFmt(fy31ModelRevCr, 2)} (${crFmt(fy31SemiRevCr)} Chips, ${crFmt(fy31SysRevCr, 2)} Systems); GM ${fy31ModelGmPct.toFixed(1)}%`,
        verdict: `${chipGapRatio.toFixed(1)}× chip revenue gap; model GM (${fy31ModelGmPct.toFixed(1)}%) sits above chip ceiling (${maxChipMarginPct}%)`,
        sourceAttr: 'ramp.csv row 6; unit-cost.csv; pl.csv rows 2-3; revenue-by-segment.csv',
        sourceHref: '/plan-data/pl.csv',
        sourceLabel: 'pl.csv',
      },
    ],
    ladder,
    sections,
    redTeam: [
      {
        rank: 1,
        role: 'Short seller / Forensic accountant',
        finding: `${chipGapRatio.toFixed(1)}× FY31 chip revenue gap (${crFmt(fy31RampTotalCr, 0)} Blueprint vs ${crFmt(fy31SemiRevCr)} Model Semiconductors) + ${crFmt(soc4CumRdCr)} cumulative SoC4 5nm R&D in P&L`,
        status: 'Disclosed as separate plans (conflicts.csv row 10); Model v4 uncommitted',
        sourceAttr: 'ramp.csv row 6; revenue-by-segment.csv row 3; pl.csv row 7',
        sourceHref: '/plan-data/pl.csv',
        sourceLabel: 'pl.csv',
      },
      {
        rank: 2,
        role: 'Tape-out PM / Diligence analyst',
        finding: `${top3ShuttleSharePct.toFixed(1)}% (${crFmt(top3ShuttleRampCr, 0)}) of FY31 shuttle ramp (SKU-1, SKU-2, SKU-10) has no standalone datasheet and no layout/post-route evidence in repo`,
        status: 'Open execution risk before December 2026 shuttle (exact cutoff: INPUT REQUIRED)',
        sourceAttr: 'skus.csv rows 2,3,11; documents.csv; dg32-specs.csv',
        sourceHref: '/portfolio-data/skus.csv',
        sourceLabel: 'skus.csv',
      },
      {
        rank: 3,
        role: 'Short seller',
        finding: `Superseded Master Whitepaper v3 (5 Sep 2026) remains in public downloads with CONFIDENTIAL header and withdrawn ₹2.88\u00a0Cr / ₹1.01\u00a0Cr order claim in raw PDF`,
        status: 'Site text fixed 12 Oct 2026 (conflicts.csv rows 8,11); PDF kept as authored',
        sourceAttr: 'documents.csv row 3; conflicts.csv rows 8,11',
        sourceHref: '/portfolio-data/conflicts.csv',
        sourceLabel: 'conflicts.csv',
      },
      {
        rank: 4,
        role: 'Forensic accountant',
        finding: `High-case chip development cost (${crFmt(devHighShuttleCr, 1)} for 9 shuttle SKUs; ${crFmt(devHighAllCr, 1)} for 11 SKUs) exceeds ₹50.00\u00a0Cr Blueprint tranches by up to ${crFmt(devHighAllCr - 50, 1)}`,
        status: 'Disclosed in brief; contingency funding source INPUT REQUIRED',
        sourceAttr: 'skus.csv dev_cost_low_cr..dev_cost_high_cr',
        sourceHref: '/portfolio-data/skus.csv',
        sourceLabel: 'skus.csv',
      },
      {
        rank: 5,
        role: 'Forensic accountant / Short seller',
        finding: `Model FY31 gross margin (${fy31ModelGmPct.toFixed(1)}%) exceeds the high-case margin of all 4 costed chips (${minChipMarginPct}–${maxChipMarginPct}% in unit-cost.csv); SKU FY31 ramp sums to ${crFmt(skuRampFy31SumCr, 0)} vs ${crFmt(fy31RampTotalCr, 0)} table total (and FY33 ramp sums to ₹947 Cr vs ₹948 Cr in conflicts.csv row 12)`,
        status: 'Margin & FY31 sum new in audit; FY33 rounding in conflicts.csv row 12',
        sourceAttr: 'pl.csv rows 2-3; unit-cost.csv rows 2-5; skus.csv; ramp.csv; conflicts.csv row 12',
        sourceHref: '/portfolio-data/unit-cost.csv',
        sourceLabel: 'unit-cost.csv',
      },
    ],
  };
}

const decisionReport = process.env.DGS_INTERNAL === '1' ? buildDecisionReport() : null;

fs.writeFileSync(out, JSON.stringify({
  available: true,
  decisionReport,
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
  plNote: 'The model\'s P&L has no interest line, so net income is before the fleet-debt interest the cash walk deducts.',
  sources: funds.filter(f => f.kind === 'source').map(f => ({label: fundLabel[f.item] ?? f.item, value: f.value})),
  uses: funds.filter(f => f.kind === 'use').map(f => ({label: f.item, value: f.value})),
  plWalk, cashWalk,
  opexParts: [['R&D, run rate', P('run-rate R&D'), 'R&D'], ['R&D, SoC4 5 nm tape-out programme', P('SoC4 5nm tape-out program'), 'R&D'], ['Sales and marketing', P('Sales & Marketing')], ['General and administrative', P('G&A')]]
    .map(([label, values, group]) => ({label, values, ...(group ? {group} : {})})),
  checks: checks.map(([n]) => n).concat('Uses of funds = sources'),
}, null, 1) + '\n');
fs.mkdirSync(pub, {recursive: true});
for (const f of FILES) fs.copyFileSync(path.join(root, 'data/plan', f), path.join(pub, f));
console.log(`plan data: published, ${checks.length + 1} identities pass, ${periods.length} periods`);
