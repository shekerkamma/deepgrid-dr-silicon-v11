// Outside-judge gate for the internal founder decision report (/plan?view=decisions).
//
// Checks four things independently of the component that renders the report:
//   1. Public-build isolation: under DGS_PLAN=1 (without DGS_INTERNAL=1), app/plan-data.json must carry
//      decisionReport: null and zero decision-report labels or prose may live in app/plan-dashboard.tsx.
//   2. Raw-CSV per-field & per-SKU verification: recomputes every figure and stage-gate status directly from
//      data/plan/*.csv, data/portfolio/*.csv, app/claims.ts and app/company-content.ts, and checks the exact
//      numeric sequence of every KPI, decision field, tie-out row and red-team row, plus every stage cell of
//      all 12 SKU ladder rows. Changing a single number (even to another CSV number like ₹608 Cr), date, or
//      readiness cell fails the gate.
//   3. Traceability & destination checks: every [data-source] block must carry a non-empty source attribute
//      and a link whose target file exists in public/ (and returns HTTP 200 in browser mode).
//   4. Browser at 1440, 768 and 390 px: zero page errors, zero horizontal overflow, under-60-second word budget
//      (< 260 words across the three decision summaries), keyboard tab switching, and zero axe WCAG 2.2 A/AA
//      violations.
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {DECISION_FIELDS, LABEL_FIELDS, decisionShape} from './decision-shape.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2]?.startsWith('http') ? process.argv[2].replace(/\/?$/, '/') : null;
const dataOnly = process.argv.includes('--data-only');
if (!base && !dataOnly) {
  console.error('Usage: node scripts/verify-decision-report.mjs <base-url> [--data-only] [--check-public]');
  process.exit(1);
}

const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const near = (a, b, tol = 1e-9) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const norm = s => String(s ?? '').replace(/\u00a0/g, ' ').trim();
const numsIn = s =>
  [...norm(s).replace(/−\s*₹?/g, '-').matchAll(/(?<![A-Za-z\d])-?\d+(?:,\d{3})*(?:\.\d+)?(?:e[+-]?\d+)?/gi)].map(m =>
    Number(m[0].replace(/,/g, ''))
  );
const datesIn = s =>
  [
    ...norm(s).matchAll(
      /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4}-\d{2}-\d{2}|FY\d{2,4}|SKU-\d+|D100|v\d+(?:\.\d+)?|SoC\d+)\b/g
    ),
  ].map(m => m[0]);
const sameNums = (actualStr, expectedNums, label, expectedDates = null) => {
  const got = numsIn(actualStr);
  const ok = got.length === expectedNums.length && got.every((v, i) => Math.abs(v - expectedNums[i]) <= 1e-9);
  check(ok, `${label}: numeric sequence ${JSON.stringify(got)} != expected ${JSON.stringify(expectedNums)} in "${norm(actualStr)}"`);
  if (expectedDates !== null) {
    const gotD = datesIn(actualStr);
    const okD = gotD.length === expectedDates.length && gotD.every((v, i) => v === expectedDates[i]);
    check(okD, `${label}: date/period sequence ${JSON.stringify(gotD)} != expected ${JSON.stringify(expectedDates)} in "${norm(actualStr)}"`);
  }
};

function parseCsv(rel) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').trim();
  const rows = [];
  for (const line of txt.split('\n')) {
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { cells.push(cur.trim()); cur = ''; } else cur += c;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

// 1. Raw-source recomputation
const tranche = parseCsv('data/portfolio/tranche1-uses.csv');
const skus = parseCsv('data/portfolio/skus.csv');
const ramp = parseCsv('data/portfolio/ramp.csv');
const unitCost = parseCsv('data/portfolio/unit-cost.csv');
const specs = parseCsv('data/portfolio/dg32-specs.csv');
const docs = parseCsv('data/portfolio/documents.csv');
const conflicts = parseCsv('data/portfolio/conflicts.csv');
const pl = parseCsv('data/plan/pl.csv');
const cash = parseCsv('data/plan/cash.csv');
const seg = parseCsv('data/plan/revenue-by-segment.csv');
const funds = parseCsv('data/plan/use-of-funds.csv');

const trancheTotalCr = Math.round(tranche.reduce((a, r) => a + Number(r.cr), 0) * 100) / 100;
const protoCr = Number(tranche.find(r => /prototypes/i.test(r.use))?.cr ?? NaN);
const respinRow = tranche.find(r => /respin/i.test(r.use));
const respinCr = Number(respinRow?.cr ?? NaN);
const siliconTrancheCr = Math.round((protoCr + respinCr) * 100) / 100;
const teamRow = tranche.find(r => /engineering team/i.test(r.use));
const teamCr = Number(teamRow?.cr ?? NaN);
const approvalsCr = Number(tranche.find(r => /approvals/i.test(r.use))?.cr ?? NaN);
// Parse teamRow.delivers ("₹1.0 Cr to March 2027, ₹1.5 Cr for the following 12 months; tranche 2 grows")
const teamParts = teamRow?.delivers.match(/₹([\d.]+)\s*Cr\s+to\s+March\s+(\d{4}),\s*₹([\d.]+)\s*Cr\s+for\s+the\s+following\s+(\d+)\s+months/i);
const teamFirstCr = Number(teamParts?.[1] ?? NaN);
const teamFirstYear = Number(teamParts?.[2] ?? NaN);
const teamSecondCr = Number(teamParts?.[3] ?? NaN);
const followMonths = Number(teamParts?.[4] ?? NaN);
const teamEndYear = teamFirstYear + Math.round(followMonths / 12);
const teamMonthlyCr = Math.round((teamSecondCr / followMonths) * 1000) / 1000;

const shuttleSkus = skus.filter(s => s.dec2026_shuttle === 'yes');
const plannedSkus = skus.filter(s => s.plan_line_cr !== '');
const shuttleCount = shuttleSkus.length;
const perChipShuttleCr = Math.round((protoCr / shuttleCount) * 100) / 100;
const respinRuns = /eight/i.test(respinRow?.delivers ?? '') ? 8 : Math.floor(respinCr / perChipShuttleCr);
const shuttlePlanCr = shuttleSkus.reduce((a, s) => a + Number(s.plan_line_cr), 0);
const totalPlanCr = plannedSkus.reduce((a, s) => a + Number(s.plan_line_cr), 0);
const shuttleRampFy31Cr = shuttleSkus.reduce((a, s) => a + Number(s.fy31_ramp_cr), 0);
const skuRampFy31SumCr = plannedSkus.reduce((a, s) => a + Number(s.fy31_ramp_cr), 0);
const top3ShuttleSkus = [...shuttleSkus].sort((a, b) => Number(b.fy31_ramp_cr) - Number(a.fy31_ramp_cr)).slice(0, 3);
const top3ShuttleRamps = top3ShuttleSkus.map(s => Number(s.fy31_ramp_cr));
const top3ShuttleRampCr = top3ShuttleRamps.reduce((a, v) => a + v, 0);
const top3ShuttleSharePct = Math.round((top3ShuttleRampCr / shuttleRampFy31Cr) * 1000) / 10;
const sku4RampCr = Number(shuttleSkus.find(s => s.sku === 'SKU-4')?.fy31_ramp_cr ?? NaN);
const sku6RampCr = Number(shuttleSkus.find(s => s.sku === 'SKU-6')?.fy31_ramp_cr ?? 0);
const top4ProtectedSharePct = Math.round(((top3ShuttleRampCr + sku6RampCr) / shuttleRampFy31Cr) * 1000) / 10;
const devLowShuttleCr = Math.round(shuttleSkus.reduce((a, s) => a + Number(s.dev_cost_low_cr), 0) * 10) / 10;
const devHighShuttleCr = Math.round(shuttleSkus.reduce((a, s) => a + Number(s.dev_cost_high_cr), 0) * 10) / 10;
const devLowAllCr = Math.round(plannedSkus.reduce((a, s) => a + Number(s.dev_cost_low_cr), 0) * 10) / 10;
const devHighAllCr = Math.round(plannedSkus.reduce((a, s) => a + Number(s.dev_cost_high_cr), 0) * 10) / 10;

const modelSourcesCr = Math.round(funds.filter(r => r.kind === 'source').reduce((a, r) => a + Number(r.rs_cr), 0) * 100) / 100;
const modelUsesCr = Math.round(funds.filter(r => r.kind === 'use').reduce((a, r) => a + Number(r.rs_cr), 0) * 100) / 100;
const equityRoundCr = Number(funds.find(r => /equity round/i.test(r.item))?.rs_cr ?? NaN);
const termLoanCr = Number(funds.find(r => /term loan/i.test(r.item))?.rs_cr ?? NaN);
const engPayrollCr = Math.round(Number(funds.find(r => /Engineering/i.test(r.item))?.rs_cr ?? NaN) * 100) / 100;
const soc2NreCr = Math.round(Number(funds.find(r => /SoC2 tapeout/i.test(r.item))?.rs_cr ?? NaN) * 100) / 100;
const capexRow = cash.find(r => /tapeout capex/i.test(r.line_item));
const fy27TapeoutCapexCr = Number(capexRow?.FY2027 ?? NaN);
const fy28TapeoutCapexCr = Number(capexRow?.FY2028 ?? NaN);
const fy29TapeoutCapexCr = Number(capexRow?.FY2029 ?? NaN);
const threeYrTapeoutCapexCr = ['FY2027', 'FY2028', 'FY2029'].reduce((a, y) => a + Number(capexRow?.[y] ?? 0), 0);
const fmt2 = v => Number(Math.abs(v).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace(/,/g, ''));
const fmt1 = v => Number(Math.abs(v).toLocaleString('en-IN', {minimumFractionDigits: 1, maximumFractionDigits: 1}).replace(/,/g, ''));
const openRow = cash.find(r => r.line_item === 'Opening cash');
const closeRow = cash.find(r => r.line_item === 'Closing cash');
const fy27OpenCashCr = Number(openRow?.FY2027 ?? NaN);
const fy29CloseCashCr = Number(closeRow?.FY2029 ?? NaN);
const fy27OpenCash2dp = fmt2(fy27OpenCashCr);
const fy29CloseCash2dp = fmt2(fy29CloseCashCr);
const revRow = pl.find(r => r.line_item === 'Revenue');
const gpRow = pl.find(r => r.line_item === 'Gross profit');
const soc4Row = pl.find(r => /SoC4 5nm/i.test(r.line_item));
const fy31ModelRevCr = Number(revRow?.FY2031 ?? NaN);
const fy31ModelRev2dp = fmt2(fy31ModelRevCr);
const fy31ModelRev1dp = fmt1(fy31ModelRevCr);
const fy31ModelGpCr = Number(gpRow?.FY2031 ?? NaN);
const fy31ModelGmPct = Math.round((fy31ModelGpCr / fy31ModelRevCr) * 1000) / 10;
const soc4CumRdCr = Math.round(['FY2027', 'FY2028', 'FY2029', 'FY2030', 'FY2031', 'FY2032'].reduce((a, y) => a + Number(soc4Row?.[y] ?? 0), 0) * 100) / 100;
const fy31SemiRevCr = Number(seg.find(r => r.segment === 'Semiconductors')?.FY2031 ?? NaN);
const fy31SysRevCr = Number(seg.find(r => r.segment === 'Systems')?.FY2031 ?? NaN);
const fy31SysRev2dp = fmt2(fy31SysRevCr);
const fy31SysRev1dp = fmt1(fy31SysRevCr);
const fy31RampTotalCr = Number(ramp.find(r => r.group === 'Total')?.FY31 ?? NaN);
const fy33RampTotalCr = Number(ramp.find(r => r.group === 'Total')?.FY33 ?? NaN);
const fy33RampGroupSumCr = ramp.filter(r => r.group !== 'Total').reduce((a, r) => a + Number(r.FY33 || 0), 0);
const chipGapRatio = Math.round((fy31RampTotalCr / fy31SemiRevCr) * 10) / 10;
const costedChipCount = unitCost.length;
const minChipMarginPct = Math.min(...unitCost.map(u => Number(u.margin_low_pct)));
const maxChipMarginPct = Math.max(...unitCost.map(u => Number(u.margin_high_pct)));

// Verify all 51 source probes against public/downloads/*
const claimSrc = fs.readFileSync(path.join(root, 'app/claims.ts'), 'utf8');
const compSrc = fs.readFileSync(path.join(root, 'app/company-content.ts'), 'utf8');
const ENTRY = /'([\w-]+)':\s*\{[\s\S]*?source:\s*'([^']+)'[\s\S]*?probe:\s*'([^']+)'/g;
const parseEntries = text => [...text.matchAll(ENTRY)].map(m => ({id: m[1], source: m[2], probe: m[3]}));
const cStart = compSrc.indexOf('export const companySources');
const allClaimEntries = [
  ...parseEntries(claimSrc),
  ...(cStart < 0 ? [] : parseEntries(compSrc.slice(cStart, compSrc.indexOf('\n};', cStart)))),
];
for (const e of allClaimEntries) {
  const f = path.join(root, 'public/downloads', e.source);
  check(fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes(e.probe), `claim probe broken: ${e.id} -> ${e.source}`);
}
const totalProbedClaims = allClaimEntries.length;
const supersededPublishedCount = docs.filter(d => d.where === 'published' && /superseded/i.test(d.status)).length;
const fixedConflictsCount = conflicts.filter(c => /^fixed/i.test(c.status)).length;

// Founder inputs: the gitignored real file when present, else the committed empty template.
const fiRel = fs.existsSync(path.join(root, 'data/plan/founder-inputs.csv')) ? 'data/plan/founder-inputs.csv' : 'data/plan/founder-inputs.template.csv';
const fiRows = parseCsv(fiRel);
const fiGet = (scope, field) => fiRows.find(r => r.scope === scope && r.field === field && r.value !== '')?.value;
const fiFilled = fiRows.filter(r => r.value !== '');
const fiAsOf = fiFilled.map(r => r.as_of).sort().at(-1);
const fiToday = process.env.DGS_TODAY || new Date().toISOString().slice(0, 10);
const fiAge = fiAsOf ? Math.round((Date.parse(fiToday) - Date.parse(fiAsOf)) / 864e5) : null;

// Expected per-SKU ladder derived from skus.csv, dg32-specs.csv and app/claims.ts
const fmaxFig = claimSrc.match(/'fmax-lockstep':[\s\S]*?figure:\s*'([^']+)'/)?.[1] ?? '';
const fmaxRange = fmaxFig.replace(/\s+to\s+/i, '–');
const expectedLadder = skus.map(s => {
  const specRow = specs.find(sp => sp.sku === s.sku);
  const r = s.readiness || '';
  const hasSpec = Boolean(s.plan_line_cr || r);
  const hasRtl = /RTL/i.test(r) || Boolean(specRow);
  const adcParts = specRow?.adc?.match(/^(\d+-bit)\s+\w+\s+(SAR),\s*(untrimmed)/i);
  const hasAnalog = /analog schematics/i.test(r)
    ? 'Schematics ready'
    : adcParts
      ? `${adcParts[1]} ${adcParts[2]} (${adcParts[3]})`
      : 'INPUT REQUIRED';
  const hasLayout = specRow && /hardened die/i.test(specRow.status) ? `Hardened die (${fmaxRange} post-route)` : 'INPUT REQUIRED';
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
    layout: fiGet(s.sku, 'layout') ?? hasLayout,
    drcLvs: fiGet(s.sku, 'drc_lvs') ?? 'INPUT REQUIRED',
    slotBooked: fiGet(s.sku, 'slot_booked') ?? (s.mpw ? `${s.mpw} (booking confirmation: INPUT REQUIRED)` : 'INPUT REQUIRED'),
    gdsSubmitted: fiGet(s.sku, 'gds_submitted') ?? 'INPUT REQUIRED',
    sourceAttr: 'data/portfolio/skus.csv; data/portfolio/dg32-specs.csv',
    sourceHref: '/portfolio-data/skus.csv',
    sourceLabel: 'skus.csv',
  };
});

// 2. Check app/plan-data.json carries decisionReport with exact per-field & per-SKU values
const planJsonPath = path.join(root, 'app/plan-data.json');
check(fs.existsSync(planJsonPath), 'app/plan-data.json does not exist');
const planJson = fs.existsSync(planJsonPath) ? JSON.parse(fs.readFileSync(planJsonPath, 'utf8')) : {};
const dr = planJson.decisionReport;
check(Boolean(dr && typeof dr === 'object'), 'app/plan-data.json has no decisionReport object (run DGS_INTERNAL=1 node scripts/build-plan-data.mjs)');

if (dr) {
  const m = dr.metrics || {};
  check(near(m.trancheTotalCr, trancheTotalCr), `trancheTotalCr mismatch: json=${m.trancheTotalCr} vs csv=${trancheTotalCr}`);
  check(near(m.protoCr, protoCr), `protoCr mismatch: json=${m.protoCr} vs csv=${protoCr}`);
  check(near(m.respinCr, respinCr), `respinCr mismatch: json=${m.respinCr} vs csv=${respinCr}`);
  check(near(m.teamCr, teamCr), `teamCr mismatch: json=${m.teamCr} vs csv=${teamCr}`);
  check(m.followMonths === followMonths, `followMonths mismatch: json=${m.followMonths} vs csv=${followMonths}`);
  check(m.shuttleCount === shuttleCount, `shuttleCount mismatch: json=${m.shuttleCount} vs csv=${shuttleCount}`);
  check(m.respinRuns === respinRuns, `respinRuns mismatch: json=${m.respinRuns} vs csv=${respinRuns}`);
  check(near(m.shuttlePlanCr, shuttlePlanCr), `shuttlePlanCr mismatch: json=${m.shuttlePlanCr} vs csv=${shuttlePlanCr}`);
  check(near(m.shuttleRampFy31Cr, shuttleRampFy31Cr), `shuttleRampFy31Cr mismatch: json=${m.shuttleRampFy31Cr} vs csv=${shuttleRampFy31Cr}`);
  check(near(m.top3ShuttleRampCr, top3ShuttleRampCr), `top3ShuttleRampCr mismatch: json=${m.top3ShuttleRampCr} vs csv=${top3ShuttleRampCr}`);
  check(near(m.top4ProtectedSharePct, top4ProtectedSharePct), `top4ProtectedSharePct mismatch`);
  check(near(m.devLowShuttleCr, devLowShuttleCr) && near(m.devHighShuttleCr, devHighShuttleCr), `devShuttleCr mismatch`);
  check(near(m.devLowAllCr, devLowAllCr) && near(m.devHighAllCr, devHighAllCr), `devAllCr mismatch`);
  check(near(m.modelSourcesCr, modelSourcesCr) && near(m.modelUsesCr, modelUsesCr), `modelSources/Uses mismatch`);
  check(near(m.fy27TapeoutCapexCr, fy27TapeoutCapexCr), `fy27TapeoutCapexCr mismatch: json=${m.fy27TapeoutCapexCr} vs csv=${fy27TapeoutCapexCr}`);
  check(near(m.threeYrTapeoutCapexCr, threeYrTapeoutCapexCr), `threeYrTapeoutCapexCr mismatch: json=${m.threeYrTapeoutCapexCr} vs csv=${threeYrTapeoutCapexCr}`);
  check(near(m.fy27OpenCashCr, fy27OpenCashCr) && near(m.fy29CloseCashCr, fy29CloseCashCr), `cash balance mismatch`);
  check(near(m.fy31ModelRevCr, fy31ModelRevCr) && near(m.fy31SemiRevCr, fy31SemiRevCr) && near(m.fy31SysRevCr, fy31SysRevCr), `FY31 segment/revenue mismatch`);
  check(near(m.fy31RampTotalCr, fy31RampTotalCr) && near(m.chipGapRatio, chipGapRatio), `FY31 chip gap mismatch`);
  check(near(m.soc4CumRdCr, soc4CumRdCr), `soc4CumRdCr mismatch: json=${m.soc4CumRdCr} vs csv=${soc4CumRdCr}`);
  check(near(m.fy31ModelGmPct, fy31ModelGmPct) && m.maxChipMarginPct === maxChipMarginPct, `margin mismatch`);
  check(m.totalProbedClaims === totalProbedClaims && m.conflictsCount === conflicts.length && m.documentsCount === docs.length, `evidence counts mismatch`);

  // Header, tabs, and labels exact numeric & date/period sequence assertions
  check(norm(dr.heading) === 'DECIDE THIS WEEK', `dr.heading must be "DECIDE THIS WEEK", got "${norm(dr.heading)}"`);
  sameNums(dr.heading, [], 'dr.heading', []);
  sameNums(dr.flag, [1, totalProbedClaims, totalProbedClaims, 0], 'dr.flag', []);
  // First line: founder-input freshness. Stale (> 7 days) must lead with STALE; none recorded must say so.
  const st = norm(dr.inputsStatus);
  if (!fiAsOf) check(/^Founder inputs: none recorded\b/.test(st), `dr.inputsStatus must say no founder inputs are recorded, got "${st}"`);
  else {
    check(st.startsWith('STALE: ') === (fiAge > 7), `dr.inputsStatus STALE prefix wrong for ${fiAge}-day-old inputs: "${st}"`);
    check(st.includes(`as of ${fiAsOf} (${fiAge} days`) && st.includes(`${fiFilled.length} of ${fiRows.length} values`), `dr.inputsStatus must state as-of ${fiAsOf}, age ${fiAge} and ${fiFilled.length}/${fiRows.length} values: "${st}"`);
  }
  sameNums(dr.subhead, [shuttleCount, shuttlePlanCr, totalPlanCr, shuttleRampFy31Cr, 2026, trancheTotalCr, 1], 'dr.subhead', ['FY31', 'December']);
  check(Array.isArray(dr.tabs) && dr.tabs.length === 2, 'dr.tabs must have 2 entries');
  if (Array.isArray(dr.tabs) && dr.tabs.length === 2) {
    check(dr.tabs[0]?.id === 'model' && dr.tabs[1]?.id === 'decisions', 'dr.tabs ids mismatch');
    sameNums(dr.tabs[0]?.label, [], 'dr.tabs[0].label', ['FY27', 'FY32']);
    sameNums(dr.tabs[1]?.label, [], 'dr.tabs[1].label', []);
  }
  const L = dr.labels || {};
  sameNums(L.sourcePrefix, [], 'labels.sourcePrefix', []);
  sameNums(L.sourcesPrefix, [], 'labels.sourcesPrefix', []);
  sameNums(L.deadlinePrefix, [], 'labels.deadlinePrefix', []);
  sameNums(L.forLabel, [], 'labels.forLabel', []);
  sameNums(L.againstLabel, [], 'labels.againstLabel', []);
  sameNums(L.missingLabel, [], 'labels.missingLabel', []);
  sameNums(L.tieTitle, [], 'labels.tieTitle', []);
  sameNums(L.tieSub, [1], 'labels.tieSub', ['v3']);
  sameNums(L.tieCaption, [], 'labels.tieCaption', []);
  sameNums((L.tieHead || []).join(' | '), [2026], 'labels.tieHead', ['Oct', 'v3', 'v3']);
  sameNums(L.ladderTitle, [], 'labels.ladderTitle', []);
  sameNums(L.ladderSub, [], 'labels.ladderSub', []);
  sameNums(L.ladderCaption, [], 'labels.ladderCaption', []);
  sameNums((L.ladderHead || []).join(' | '), [], 'labels.ladderHead', ['FY31']);
  sameNums(L.auditTitle, [], 'labels.auditTitle', []);
  sameNums(L.auditSub, [], 'labels.auditSub', []);
  sameNums(L.auditCaption, [], 'labels.auditCaption', []);
  sameNums((L.auditHead || []).join(' | '), [], 'labels.auditHead', []);
  check(!/26 Dec 2026|2026-12-26|May 2027/i.test(JSON.stringify(dr)), 'decisionReport contains unsupported shuttle day or Tranche 2 month');

  // Per-KPI exact numeric & date/period sequence assertions (including label, value, context, def)
  const siliconSharePct = Math.round((siliconTrancheCr / trancheTotalCr) * 1000) / 10;
  check(Array.isArray(dr.kpis) && dr.kpis.length === 4, `expected 4 KPIs, got ${dr.kpis?.length}`);
  if (Array.isArray(dr.kpis) && dr.kpis.length === 4) {
    sameNums(dr.kpis[0].label, [1], 'kpis[0].label', []);
    sameNums(dr.kpis[0].value, [siliconTrancheCr, trancheTotalCr], 'kpis[0].value', []);
    sameNums(dr.kpis[0].context, [protoCr, shuttleCount, 2026, perChipShuttleCr, respinCr, respinRuns], 'kpis[0].context', ['Dec']);
    sameNums(dr.kpis[0].def, [1, protoCr, respinCr, trancheTotalCr, siliconSharePct], 'kpis[0].def', []);

    sameNums(dr.kpis[1].label, [1], 'kpis[1].label', []);
    check(norm(dr.kpis[1].value) === `Mar ${teamEndYear} (+${followMonths} mo)`, `kpis[1].value must be "Mar ${teamEndYear} (+${followMonths} mo)", got "${norm(dr.kpis[1].value)}"`);
    sameNums(dr.kpis[1].context, [teamCr, teamFirstCr, teamFirstYear, teamSecondCr, followMonths, teamEndYear, 2], 'kpis[1].context', ['Mar', 'Mar']);
    sameNums(dr.kpis[1].def, [teamFirstCr, teamFirstYear, teamSecondCr, followMonths, teamFirstYear, teamEndYear, teamMonthlyCr], 'kpis[1].def', ['Mar', 'Apr', 'Mar']);

    sameNums(dr.kpis[2].label, [3], 'kpis[2].label', []);
    sameNums(dr.kpis[2].value, [top3ShuttleSharePct, top3ShuttleRampCr], 'kpis[2].value', []);
    sameNums(dr.kpis[2].context, [1, 2, 10, top3ShuttleRampCr, shuttleRampFy31Cr, 0, 3], 'kpis[2].context', [...top3ShuttleSkus.map(s => s.sku), 'FY31']);
    sameNums(dr.kpis[2].def, [3, ...top3ShuttleRamps, shuttleCount, shuttleRampFy31Cr], 'kpis[2].def', ['FY31', 'FY31']);

    sameNums(dr.kpis[3].label, [], 'kpis[3].label', []);
    sameNums(dr.kpis[3].value, [chipGapRatio], 'kpis[3].value', []);
    sameNums(dr.kpis[3].context, [fy31RampTotalCr, fy31SemiRevCr, fy31ModelRev1dp, fy31SysRev1dp], 'kpis[3].context', ['FY31', 'v3']);
    sameNums(dr.kpis[3].def, [fy31RampTotalCr, fy31SemiRevCr], 'kpis[3].def', ['FY31', 'FY2031']);
    for (let i = 0; i < 4; i++) {
      check(Boolean(dr.kpis[i].sourceAttr), `kpis[${i}].sourceAttr empty`);
      sameNums(dr.kpis[i].sourceAttr, i === 0 ? [2, 5] : i === 1 ? [6] : i === 2 ? [2, 3, 11] : [6, 3], `kpis[${i}].sourceAttr`, []);
      sameNums(dr.kpis[i].sourceLabel, [], `kpis[${i}].sourceLabel`, []);
      check(dr.kpis[i].sourceHref?.endsWith('/' + dr.kpis[i].sourceLabel), `kpis[${i}].sourceLabel must match sourceHref basename`);
    }
  }

  // Per-decision exact numeric & date/period sequence assertions on every field (title, badge, lead, forArg, againstArg, deadline, inputRequired, sourceAttr, sourceLinks)
  check(Array.isArray(dr.decisions) && dr.decisions.length === 3, `expected 3 decisions, got ${dr.decisions?.length}`);
  if (Array.isArray(dr.decisions) && dr.decisions.length === 3) {
    const [d1, d2, d3] = dr.decisions;
    sameNums(d1.title, [1, 1, 2, 10, 2026], 'decisions[0].title', ['SKU-1', 'SKU-2', 'SKU-10', 'Dec']);
    sameNums(d1.badge, [top3ShuttleSharePct, top3ShuttleRampCr, shuttleRampFy31Cr], 'decisions[0].badge', ['FY31']);
    sameNums(d1.lead, [1, top3ShuttleRamps[0], 2, top3ShuttleRamps[1], 10, top3ShuttleRamps[2], top3ShuttleRampCr, shuttleRampFy31Cr, 4, sku4RampCr], 'decisions[0].lead', ['SKU-1', 'SKU-2', 'SKU-10', 'FY31', 'SKU-4', 'FY31']);
    sameNums(d1.forArg, [1, 2, 6, approvalsCr, 6, 2, 10, top4ProtectedSharePct, 2026], 'decisions[0].forArg', ['SKU-1', 'SKU-2', 'SKU-6', 'SKU-6', 'SKU-2', 'SKU-10', 'FY31', 'December']);
    sameNums(d1.againstArg, [shuttleCount, protoCr, 2026, perChipShuttleCr], 'decisions[0].againstArg', ['Oct']);
    check(
      norm(d1.deadline) === 'Before December 2026 shuttle (exact foundry GDS cutoff date: INPUT REQUIRED)',
      `decisions[0].deadline unexpected: ${d1.deadline}`
    );
    sameNums(d1.inputRequired, [1, 3, 5, 6, 8, 9, 10], 'decisions[0].inputRequired', ['SKU-1']);
    sameNums(d1.sourceAttr, [2, 11, 2, 3], 'decisions[0].sourceAttr', []);

    sameNums(d2.title, [2, trancheTotalCr, 1, modelSourcesCr, fy27TapeoutCapexCr], 'decisions[1].title', ['v4', 'FY27']);
    sameNums(d2.badge, [siliconTrancheCr, 1, fy27TapeoutCapexCr], 'decisions[1].badge', ['FY27']);
    sameNums(d2.lead, [1, trancheTotalCr, protoCr, respinCr, fy27OpenCash2dp, fy27TapeoutCapexCr, threeYrTapeoutCapexCr, soc4CumRdCr, 5], 'decisions[1].lead', ['v3', 'FY27', 'FY27', 'FY27', 'FY29', 'SoC4']);
    sameNums(d2.forArg, [fy31RampTotalCr, 130, 180, devLowAllCr, devHighAllCr, plannedSkus.length, 1, chipGapRatio], 'decisions[1].forArg', ['v4', 'FY31']);
    sameNums(d2.againstArg, [fy31ModelRev1dp, fy31SysRev1dp, devHighAllCr, 50, Math.round((devHighAllCr - 50) * 10) / 10], 'decisions[1].againstArg', ['v3', 'FY31']);
    check(
      norm(d2.deadline) === 'Before Tranche 1 close & March 2027 engineering milestone (exact close date: INPUT REQUIRED)',
      `decisions[1].deadline unexpected: ${d2.deadline}`
    );
    sameNums(d2.inputRequired, [1, 5], 'decisions[1].inputRequired', ['SoC4']);
    sameNums(d2.sourceAttr, [], 'decisions[1].sourceAttr', []);

    sameNums(d3.title, [3, 5, 2026], 'decisions[2].title', ['Sep', 'v3']);
    sameNums(d3.badge, [supersededPublishedCount, conflicts.length, fixedConflictsCount], 'decisions[2].badge', []);
    sameNums(d3.lead, [conflicts.length, totalProbedClaims, 10, 200, 10, 2], 'decisions[2].lead', ['v3']);
    sameNums(d3.forArg, [1, 2026], 'decisions[2].forArg', ['v3.1', 'Oct']);
    sameNums(d3.againstArg, [2026, 10, 12, 11], 'decisions[2].againstArg', ['2026-10-12']);
    check(
      norm(d3.deadline) === 'Before Tranche 1 investor data-room circulation (owner sign-off date: INPUT REQUIRED)',
      `decisions[2].deadline unexpected: ${d3.deadline}`
    );
    sameNums(d3.inputRequired, [2], 'decisions[2].inputRequired', ['v3']);
    sameNums(d3.sourceAttr, [3, 5, 11], 'decisions[2].sourceAttr', []);

    for (let i = 0; i < 3; i++) {
      for (const link of dr.decisions[i].sourceLinks || []) {
        sameNums(link.label, [], `decisions[${i}].sourceLinks(${link.label})`, []);
        check(link.href?.endsWith('/' + link.label), `decisions[${i}] sourceLink label ${link.label} must match href ${link.href}`);
      }
    }
  }

  // Per-row tie-out numeric & date/period sequence assertions on each individual cell (item, blueprint, modelFunds, modelCash, verdict, sourceAttr, sourceLabel)
  check(Array.isArray(dr.tieOut) && dr.tieOut.length === 4, `expected 4 tie-out rows, got ${dr.tieOut?.length}`);
  if (Array.isArray(dr.tieOut) && dr.tieOut.length === 4) {
    sameNums(dr.tieOut[0].item, [], 'tieOut[0].item', []);
    sameNums(dr.tieOut[0].blueprint, [trancheTotalCr, 1, 40, 2, 50], 'tieOut[0].blueprint', []);
    sameNums(dr.tieOut[0].modelFunds, [modelSourcesCr, equityRoundCr, termLoanCr], 'tieOut[0].modelFunds', []);
    sameNums(dr.tieOut[0].modelCash, [fy27OpenCash2dp, 1], 'tieOut[0].modelCash', ['FY27']);
    sameNums(dr.tieOut[0].verdict, [], 'tieOut[0].verdict', []);

    sameNums(dr.tieOut[1].item, [], 'tieOut[1].item', []);
    sameNums(dr.tieOut[1].blueprint, [protoCr, shuttleCount, 2026, respinCr, siliconTrancheCr], 'tieOut[1].blueprint', ['Dec']);
    sameNums(dr.tieOut[1].modelFunds, [soc2NreCr], 'tieOut[1].modelFunds', ['SoC2']);
    sameNums(dr.tieOut[1].modelCash, [fy27TapeoutCapexCr, fy28TapeoutCapexCr, fy29TapeoutCapexCr, threeYrTapeoutCapexCr, 3], 'tieOut[1].modelCash', ['FY27', 'FY28', 'FY29']);
    sameNums(dr.tieOut[1].verdict, [130, siliconTrancheCr, threeYrTapeoutCapexCr], 'tieOut[1].verdict', []);

    sameNums(dr.tieOut[2].item, [], 'tieOut[2].item', []);
    sameNums(dr.tieOut[2].blueprint, [shuttleCount, devLowShuttleCr, devHighShuttleCr, plannedSkus.length, devLowAllCr, devHighAllCr], 'tieOut[2].blueprint', []);
    sameNums(dr.tieOut[2].modelFunds, [modelUsesCr, engPayrollCr, soc2NreCr], 'tieOut[2].modelFunds', []);
    sameNums(dr.tieOut[2].modelCash, [fy29CloseCash2dp, soc4CumRdCr, 5], 'tieOut[2].modelCash', ['FY2029', 'SoC4']);
    sameNums(dr.tieOut[2].verdict, [50, Math.round((50 - devLowAllCr) * 10) / 10, Math.round((devHighAllCr - 50) * 10) / 10, plannedSkus.length], 'tieOut[2].verdict', []);

    sameNums(dr.tieOut[3].item, [], 'tieOut[3].item', ['FY2031']);
    sameNums(dr.tieOut[3].blueprint, [fy31RampTotalCr, skuRampFy31SumCr, minChipMarginPct, maxChipMarginPct], 'tieOut[3].blueprint', []);
    sameNums(dr.tieOut[3].modelFunds, [], 'tieOut[3].modelFunds', []);
    sameNums(dr.tieOut[3].modelCash, [fy31ModelRev2dp, fy31SemiRevCr, fy31SysRev2dp, fy31ModelGmPct], 'tieOut[3].modelCash', ['FY31']);
    sameNums(dr.tieOut[3].verdict, [chipGapRatio, fy31ModelGmPct, maxChipMarginPct], 'tieOut[3].verdict', []);
    for (let i = 0; i < 4; i++) {
      sameNums(dr.tieOut[i].sourceLabel, [], `tieOut[${i}].sourceLabel`, []);
      check(dr.tieOut[i].sourceHref?.endsWith('/' + dr.tieOut[i].sourceLabel), `tieOut[${i}] sourceLabel must match sourceHref`);
    }
  }

  // Per-SKU ladder exact field assertions across all 12 rows
  check(Array.isArray(dr.ladder) && dr.ladder.length === expectedLadder.length, `expected ${expectedLadder.length} SKU ladder rows, got ${dr.ladder?.length}`);
  if (Array.isArray(dr.ladder) && dr.ladder.length === expectedLadder.length) {
    for (let i = 0; i < expectedLadder.length; i++) {
      const got = dr.ladder[i], exp = expectedLadder[i];
      for (const k of Object.keys(exp)) {
        check(got?.[k] === exp[k], `ladder[${i}] (${exp.sku}).${k}: got "${got?.[k]}" != expected "${exp[k]}"`);
      }
    }
  }

  // Per-row redTeam numeric & date/period sequence assertions on each individual field (rank, role, finding, status, sourceAttr, sourceLabel)
  check(Array.isArray(dr.redTeam) && dr.redTeam.length === 5, `expected 5 red-team rows, got ${dr.redTeam?.length}`);
  if (Array.isArray(dr.redTeam) && dr.redTeam.length === 5) {
    check(dr.redTeam[0].rank === 1, 'redTeam[0].rank');
    sameNums(dr.redTeam[0].role, [], 'redTeam[0].role', []);
    sameNums(dr.redTeam[0].finding, [chipGapRatio, fy31RampTotalCr, fy31SemiRevCr, soc4CumRdCr, 5], 'redTeam[0].finding', ['FY31', 'SoC4']);
    sameNums(dr.redTeam[0].status, [10], 'redTeam[0].status', ['v4']);

    check(dr.redTeam[1].rank === 2, 'redTeam[1].rank');
    sameNums(dr.redTeam[1].role, [], 'redTeam[1].role', []);
    sameNums(dr.redTeam[1].finding, [top3ShuttleSharePct, top3ShuttleRampCr, 1, 2, 10], 'redTeam[1].finding', ['FY31', ...top3ShuttleSkus.map(s => s.sku)]);
    sameNums(dr.redTeam[1].status, [2026], 'redTeam[1].status', ['December']);

    check(dr.redTeam[2].rank === 3, 'redTeam[2].rank');
    sameNums(dr.redTeam[2].role, [], 'redTeam[2].role', []);
    sameNums(dr.redTeam[2].finding, [5, 2026, 2.88, 1.01], 'redTeam[2].finding', ['v3', 'Sep']);
    sameNums(dr.redTeam[2].status, [12, 2026, 8, 11], 'redTeam[2].status', ['Oct']);

    check(dr.redTeam[3].rank === 4, 'redTeam[3].rank');
    sameNums(dr.redTeam[3].role, [], 'redTeam[3].role', []);
    sameNums(dr.redTeam[3].finding, [devHighShuttleCr, shuttleCount, devHighAllCr, plannedSkus.length, 50, Math.round((devHighAllCr - 50) * 10) / 10], 'redTeam[3].finding', []);
    sameNums(dr.redTeam[3].status, [], 'redTeam[3].status', []);

    check(dr.redTeam[4].rank === 5, 'redTeam[4].rank');
    sameNums(dr.redTeam[4].role, [], 'redTeam[4].role', []);
    sameNums(dr.redTeam[4].finding, [fy31ModelGmPct, costedChipCount, minChipMarginPct, maxChipMarginPct, skuRampFy31SumCr, fy31RampTotalCr, fy33RampGroupSumCr, fy33RampTotalCr, 12], 'redTeam[4].finding', ['FY31', 'FY31', 'FY33']);
    sameNums(dr.redTeam[4].status, [12], 'redTeam[4].status', ['FY31', 'FY33']);
    for (let i = 0; i < 5; i++) {
      sameNums(dr.redTeam[i].sourceLabel, [], `redTeam[${i}].sourceLabel`, []);
      check(dr.redTeam[i].sourceHref?.endsWith('/' + dr.redTeam[i].sourceLabel), `redTeam[${i}] sourceLabel must match sourceHref`);
    }
  }

  // Verify all sourceHref and sourceLinks files exist under public/
  const hrefs = [
    ...(dr.kpis || []).map(k => k.sourceHref),
    ...(dr.decisions || []).flatMap(d => (d.sourceLinks || []).map(s => s.href)),
    ...(dr.tieOut || []).map(t => t.sourceHref),
    ...(dr.ladder || []).map(l => l.sourceHref),
    ...(dr.redTeam || []).map(r => r.sourceHref),
  ];
  for (const h of new Set(hrefs)) {
    check(Boolean(h) && fs.existsSync(path.join(root, 'public', h.replace(/^\//, ''))), `missing source file in public/: ${h}`);
  }

  // Backtest and ranking sections, recomputed here from conflict-backtest.csv and the expected ladder.
  const secs = Object.fromEntries((dr.sections || []).map(x => [x.id, x]));
  const bt = parseCsv('data/portfolio/conflict-backtest.csv');
  const btSec = secs['ch-dr-backtest'];
  check(Boolean(btSec), 'decisionReport.sections lacks ch-dr-backtest');
  if (btSec) {
    check(btSec.rows.length === bt.length, `backtest rows ${btSec.rows.length} != conflict-backtest.csv ${bt.length}`);
    bt.forEach((b, i) => {
      const want = [b.topic, b.both_present_date ? `${b.both_present_date} (${b.both_present_commit})` : 'Not in git', `${b.logged_date} (${b.logged_commit})`, b.lag_days || 'Not measurable', b.note || ''];
      check(JSON.stringify(btSec.rows[i]?.cells) === JSON.stringify(want), `backtest row ${i} (${b.topic}) != conflict-backtest.csv`);
    });
    const lags = bt.filter(b => b.lag_days !== '').map(b => Number(b.lag_days));
    sameNums(btSec.sub, [lags.length, bt.length, Math.min(...lags), Math.max(...lags), 3, bt.length], 'sections.backtest.sub', []);
  }
  const rkSec = secs['ch-dr-rank'];
  check(Boolean(rkSec), 'decisionReport.sections lacks ch-dr-rank');
  if (rkSec) {
    const want = expectedLadder
      .filter(l => l.shuttle === 'Dec 2026 shuttle')
      .map(l => ({sku: l.sku, cr: Number(l.rampFy31Cr), missing: [l.layout, l.drcLvs, l.gdsSubmitted].filter(v => !/^(?:complete|clean|confirmed|submitted|signed off)\b|^Hardened die/i.test(v)).length}))
      .filter(x => x.missing > 0)
      .sort((a, b) => b.cr - a.cr || a.sku.localeCompare(b.sku));
    check(rkSec.rows.length === want.length, `ranking rows ${rkSec.rows.length} != expected ${want.length}`);
    want.forEach((x, i) => {
      const cells = rkSec.rows[i]?.cells || [];
      check(cells[1] === x.sku && cells[2] === x.cr.toFixed(2) && cells[3] === String(x.missing), `ranking row ${i + 1}: got ${JSON.stringify(cells)}, expected ${x.sku} ${x.cr.toFixed(2)} ${x.missing}`);
      check((cells[4] === 'Decision 1') === ['SKU-1', 'SKU-2', 'SKU-10'].includes(x.sku), `ranking row ${i + 1}: "Covered by" wrong for ${x.sku}`);
    });
    check(rkSec.sub.includes(fiGet('company', 'gds_deadline') ?? 'INPUT REQUIRED'), 'ranking sub must state the GDS freeze date or INPUT REQUIRED');
  }

  // Diligence section: present exactly when data/diligence/results.csv exists; rows = its failed questions.
  const dilPath = 'data/diligence/results.csv';
  const dlSec = secs['ch-dr-diligence'];
  if (fs.existsSync(path.join(root, dilPath))) {
    const dil = parseCsv(dilPath);
    check(Boolean(dlSec), 'decisionReport.sections lacks ch-dr-diligence although results.csv exists');
    if (dlSec) {
      const failed = dil.filter(r => r.pass !== 'yes');
      check(dlSec.rows.length === failed.length, `diligence rows ${dlSec.rows.length} != failed questions in results.csv ${failed.length}`);
      failed.forEach((r, i) => check(JSON.stringify(dlSec.rows[i]?.cells) === JSON.stringify([r.n, r.q, r.set, r.expect, r.reason]), `diligence row ${i} (question ${r.n}) != results.csv`));
      const sc = set => [dil.filter(r => r.set === set && r.pass === 'yes').length, dil.filter(r => r.set === set).length];
      const ms = dil.map(r => Number(r.ms)).sort((a, b) => a - b);
      const p95 = ms[Math.min(ms.length - 1, Math.ceil(0.95 * ms.length) - 1)];
      sameNums(dlSec.sub, [dil.length, ...sc('holdout'), ...sc('tuning'), Number((p95 / 1000).toFixed(1)), 5, dil.filter(r => r.cites_superseded_whitepaper === 'yes').length, 3, 10], 'sections.diligence.sub', []);
    }
  } else check(!dlSec, 'ch-dr-diligence present without data/diligence/results.csv');

  // Section titles carry figures too: each must match the numbers it states.
  if (btSec) { const L2 = bt.filter(b => b.lag_days !== '').map(b => Number(b.lag_days)); sameNums(btSec.title, [L2.length, bt.length, Math.min(...L2), Math.max(...L2)], 'sections.backtest.title', []); }
  if (rkSec) { const k = rkSec.rows.findIndex(r => r.cells[4] !== 'Decision 1'); sameNums(rkSec.title, [k < 0 ? rkSec.rows.length : k, 1], 'sections.rank.title', ['FY31']); }
  if (dlSec && fs.existsSync(path.join(root, dilPath))) {
    const dil = parseCsv(dilPath), h = dil.filter(r => r.set === 'holdout');
    const ms = dil.map(r => Number(r.ms)).sort((a, b) => a - b), p95 = ms[Math.min(ms.length - 1, Math.ceil(0.95 * ms.length) - 1)];
    sameNums(dlSec.title, [h.filter(r => r.pass === 'yes').length, h.length, Number((p95 / 1000).toFixed(1))], 'sections.diligence.title', []);
  }

  // Decision direction: the numeric checks above cannot see "Lock" become "Postpone". Every decision's
  // wording (numbers masked) must match its owner-approved entry in data/plan/approved-decisions.json.
  const approvedPath = path.join(root, 'data/plan/approved-decisions.json');
  const approvedDoc = fs.existsSync(approvedPath) ? JSON.parse(fs.readFileSync(approvedPath, 'utf8')) : {};
  const approved = approvedDoc.decisions ?? [];
  check(decisionShape(dr.heading) === approvedDoc.heading, `heading differs from the approved entry: "${norm(dr.heading)}"`);
  for (const f of LABEL_FIELDS) check(decisionShape(dr.labels?.[f]) === approvedDoc.labels?.[f], `labels.${f} differs from the approved entry: "${norm(dr.labels?.[f])}"`);
  check(approved.length > 0, 'data/plan/approved-decisions.json missing or empty (run scripts/approve-decisions.mjs after owner approval)');
  const gotIds = (dr.decisions || []).map(d => d.id), wantIds = approved.map(a => a.id);
  check(JSON.stringify(gotIds) === JSON.stringify(wantIds), `decision ids ${JSON.stringify(gotIds)} != approved ${JSON.stringify(wantIds)}`);
  for (const d of dr.decisions || []) {
    const a = approved.find(x => x.id === d.id);
    if (!a) continue;
    for (const f of DECISION_FIELDS) {
      check(decisionShape(d[f]) === a.fields?.[f], `${d.id}.${f}: wording differs from the approved entry (${a.approvedBy}, ${a.approvedOn}): "${decisionShape(d[f]).slice(0, 90)}"`);
    }
  }
}

// 3. Check that app/plan-dashboard.tsx carries zero static decision-report prose or labels
const dashSrc = fs.readFileSync(path.join(root, 'app/plan-dashboard.tsx'), 'utf8');
check(
  !/DECIDE THIS WEEK|Three-way capital|Per-SKU stage-gate|Red-team audit|Argument for|Argument against|Missing input|SoC4 5nm|MCEME|ChipFoundry OpenFrame/i.test(dashSrc),
  'app/plan-dashboard.tsx contains static decision-report prose or labels that would ship in public builds'
);

// 4. Verify public build isolation (when --check-public is passed)
if (process.argv.includes('--check-public')) {
  const saved = fs.existsSync(planJsonPath) ? fs.readFileSync(planJsonPath, 'utf8') : null;
  try {
    execFileSync(process.execPath, [path.join(root, 'scripts/build-plan-data.mjs')], {
      cwd: root,
      env: {...process.env, DGS_PLAN: '1', DGS_INTERNAL: '0'},
      stdio: 'pipe',
    });
    const pubJson = JSON.parse(fs.readFileSync(planJsonPath, 'utf8'));
    check(pubJson.available === true && pubJson.decisionReport === null, 'public DGS_PLAN=1 build must set decisionReport: null');
    check(!/DECIDE THIS WEEK|Three-way capital/i.test(JSON.stringify(pubJson)), 'public DGS_PLAN=1 plan-data.json leaked decision report');
  } finally {
    if (saved !== null) fs.writeFileSync(planJsonPath, saved);
  }
}

// Recompute what the report transcribes: the backtest from git history (skipped, with a notice, on a shallow
// clone such as CI's checkout) and the diligence verdicts from answers.json.
for (const [script, label] of [['scripts/backtest-conflicts.mjs', 'backtest'], ['scripts/score-diligence.mjs', 'diligence']]) {
  if (label === 'diligence' && !fs.existsSync(path.join(root, 'data/diligence/answers.json'))) continue;
  try { execFileSync(process.execPath, [path.join(root, script), '--check'], {cwd: root, stdio: 'pipe'}); }
  catch (e) {
    if (label === 'backtest' && e.status === 2) console.log('verify-decision-report: backtest recompute skipped (shallow clone)');
    else check(false, `${label} recompute failed: ${String(e.stderr || e.message).split('\n')[0]}`);
  }
}

if (dataOnly) {
  if (fails.length) {
    console.error('verify-decision-report (--data-only) FAILED:\n  - ' + fails.join('\n  - '));
    process.exit(1);
  }
  console.log('verify-decision-report (--data-only): PASS');
  process.exit(0);
}

// 5. Browser checks at 1440, 768, 390
const require = createRequire(import.meta.url);
const axe = require.resolve('axe-core/axe.min.js');
const browser = await chromium.launch();

for (const width of [1440, 768, 390]) {
  const ctx = await browser.newContext({viewport: {width, height: 900}, hasTouch: width === 390, reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`); });

  await page.goto(base + 'plan?view=decisions', {waitUntil: 'networkidle'});
  const report = page.locator('[data-decision-report="true"]');
  await report.waitFor({state: 'visible', timeout: 5000}).catch(() => {});
  const present = await report.count();
  check(present === 1, `${width}: [data-decision-report="true"] missing on /plan?view=decisions`);
  if (present === 1) {
    const text = await report.innerText();
    check(/DECIDE THIS WEEK/.test(text), `${width}: missing DECIDE THIS WEEK heading`);
    check(await report.locator('.dr-card').count() === 3, `${width}: expected 3 decision cards (.dr-card)`);
    check(await report.locator('[aria-labelledby="dr-tie-h"] tbody tr').count() === 4, `${width}: expected 4 rows in tie-out table`);
    check(await report.locator('.dr-ladder tbody tr').count() === skus.length, `${width}: expected ${skus.length} rows in SKU ladder`);
    check(await report.locator('[aria-labelledby="dr-aud-h"] tbody tr').count() === 5, `${width}: expected 5 rows in red-team audit table`);
    check(/INPUT REQUIRED/.test(text), `${width}: missing INPUT REQUIRED markers on unverified stages`);

    // Check rendered KPI cards, decision cards, tie-out cells, ladder cells, and red-team cells match dr / expectedLadder in the DOM
    if (dr) {
      check(norm(await report.locator('.pd-flag:not([data-inputs-status])').innerText()) === norm(dr.flag), `${width}: DOM .pd-flag mismatch`);
      const statusEl = report.locator('[data-inputs-status="true"]');
      check(await statusEl.count() === 1 && norm(await statusEl.innerText()) === norm(dr.inputsStatus), `${width}: DOM founder-inputs status line missing or differs from dr.inputsStatus`);
      const firstLine = await report.locator('header .pd-flag').first().getAttribute('data-inputs-status');
      check(firstLine === 'true', `${width}: founder-inputs status must be the report's first line`);
      check(norm(await report.locator('.dg-verdict').innerText()) === norm(dr.heading), `${width}: DOM .dg-verdict mismatch`);
      check(norm(await report.locator('.dg-lede').innerText()) === norm(dr.subhead), `${width}: DOM .dg-lede mismatch`);
      const domKpis = await report.locator('.dr-kpi').evaluateAll(els =>
        els.map(el => ({
          label: el.querySelector('.dr-kpi-label')?.textContent?.trim() ?? '',
          value: el.querySelector('.dr-kpi-val')?.textContent?.trim() ?? '',
          context: el.querySelector('.dr-kpi-ctx')?.textContent?.trim() ?? '',
          def: el.querySelector('.pd-def')?.textContent?.trim() ?? '',
        }))
      );
      for (let i = 0; i < dr.kpis.length; i++) {
        const gk = domKpis[i] || {}, ek = dr.kpis[i];
        check(
          norm(gk.label) === norm(ek.label) && norm(gk.value) === norm(ek.value) &&
          norm(gk.context) === norm(ek.context) && norm(gk.def) === norm(ek.def),
          `${width}: DOM KPI[${i}] mismatch: ${JSON.stringify(gk)}`
        );
      }
      const domCards = await report.locator('.dr-card').evaluateAll(els =>
        els.map(el => ({
          title: el.querySelector('.dr-card-title')?.innerText.trim() ?? '',
          badge: el.querySelector('.dr-badge')?.innerText.trim() ?? '',
          lead: el.querySelector('.dr-card-lead')?.innerText.trim() ?? '',
        }))
      );
      for (let i = 0; i < dr.decisions.length; i++) {
        const gc = domCards[i] || {}, ec = dr.decisions[i];
        check(
          norm(gc.title) === norm(ec.title) && norm(gc.badge) === norm(ec.badge) && norm(gc.lead) === norm(ec.lead),
          `${width}: DOM decision[${i}] mismatch: ${JSON.stringify(gc)}`
        );
      }
    }

    const domLadder = await report.locator('.dr-ladder tbody tr').evaluateAll(trs =>
      trs.map(tr => [...tr.querySelectorAll('th,td')].map(c => c.innerText.trim()))
    );
    for (let i = 0; i < expectedLadder.length; i++) {
      const row = domLadder[i] || [], exp = expectedLadder[i];
      check(
        row[0] === exp.sku && row[3] === exp.planCr && row[4] === exp.rampFy31Cr && row[5] === exp.devRangeCr &&
        row[6] === exp.spec && row[7] === exp.rtl && row[8] === exp.analog && row[9] === exp.layout &&
        row[10] === exp.drcLvs && row[11] === exp.slotBooked && row[12] === exp.gdsSubmitted,
        `${width}: rendered ladder row ${exp.sku} stage mismatch: ${JSON.stringify(row)}`
      );
    }

    for (const token of ['₹10.00', '₹2.60', '₹2.50', '−₹18.00', '₹55.00', '13.5×', '90.0%', 'Mar 2028 (+12 mo)']) {
      check(text.replace(/\u00a0/g, ' ').includes(token), `${width}: rendered report missing traced figure ${token}`);
    }
    // Check every [data-source] element has non-empty source and at least one link inside
    const untraced = await report.locator('[data-source]').evaluateAll(els =>
      els.filter(el => !el.getAttribute('data-source')?.trim() || !el.querySelector('a.pd-link')).length
    );
    check(untraced === 0, `${width}: ${untraced} [data-source] block(s) missing source attribute or link`);

    // At 1440 px, verify every unique source link inside the report resolves with HTTP 200
    if (width === 1440) {
      const linkUrls = await report.locator('a.pd-link').evaluateAll(as => [...new Set(as.map(a => a.href))]);
      check(linkUrls.length >= 6, `1440: expected at least 6 unique source links, got ${linkUrls.length}`);
      for (const u of linkUrls) {
        const res = await page.request.get(u);
        check(res.status() === 200, `1440: source link ${u} returned HTTP ${res.status()}`);
      }
    }

    // 60-second reading budget at 390 px: decision cards body under 260 words
    if (width === 390) {
      const words = await report.locator('.dr-card-lead').evaluateAll(els =>
        els.map(e => e.innerText.trim()).join(' ').split(/\s+/).filter(Boolean).length
      );
      check(words > 20 && words <= 260, `390: decision leads word count ${words} outside 20..260 budget`);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    check(!overflow, `${width}: horizontal overflow on /plan?view=decisions`);

    await page.addScriptTag({path: axe});
    const violations = await page.evaluate(async () =>
      (await window.axe.run(document.querySelector('.dashboard-page'), {
        runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']},
      })).violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))
    );
    check(!violations.length, `${width}: axe violations ${JSON.stringify(violations)}`);

    // Keyboard tab switch back to Company model and return
    const tabDecisions = page.locator('#pd-tab-decisions');
    if (await tabDecisions.count()) {
      await tabDecisions.focus();
      await page.keyboard.press('ArrowLeft');
      check((await page.locator('#pd-tab-model').getAttribute('aria-selected')) === 'true', `${width}: ArrowLeft did not switch to model tab`);
      await page.keyboard.press('ArrowRight');
      check((await tabDecisions.getAttribute('aria-selected')) === 'true', `${width}: ArrowRight did not return to decisions tab`);
    }
  }
  check(!errs.length, `${width}: page errors: ${errs.join(' | ')}`);
  await ctx.close();
}

await browser.close();
if (fails.length) {
  console.error('verify-decision-report FAILED:\n  - ' + fails.join('\n  - '));
  process.exit(1);
}
console.log('verify-decision-report: PASS (raw CSV per-field & per-SKU tie-out, link HTTP 200, 1440/768/390 layout, keyboard, axe A/AA)');
