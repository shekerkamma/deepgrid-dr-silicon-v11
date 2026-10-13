/** SKU portfolio data: one model for /portfolio and for Ask DeepGrid's answers.
 *
 *  Source of truth: eight public Google Sheets (data/portfolio/sheets.json), edited by the team. The site and the
 *  answer service read them live as CSV; data/portfolio/*.csv is the checked copy every build bundles, used when a
 *  sheet cannot be read or fails the checks below. A live read is checked for structure and internal consistency
 *  only (headers, numbers, ramp groups against the stated total, low ≤ high): an edit to a figure is accepted, a
 *  broken table is not. The build additionally checks the Blueprint's own stated totals (scripts/build-portfolio-data.mjs).
 *
 *  Ask uses portfolioFacts(): short, computed statements with their document, date and kind of number, so a total, a
 *  ranking or a comparison is answered from the table rather than from the nearest prose passage. Withheld claims are
 *  never repeated: a cell that carries one is replaced before any text is built (sanitizeWithheld). */
import type { IndexChunk } from './graph-retrieval';
import sheetIds from '../../data/portfolio/sheets.json';

export const TABLES = ['skus', 'ramp', 'approvals', 'unit-cost', 'tranche1-uses', 'dg32-specs', 'documents', 'conflicts'] as const;
export type TableName = typeof TABLES[number];
export type Row = Record<string, string>;
export type Tables = Record<TableName, Row[]>;

export type Sku = {sku: string; name: string; process: string; clockMhz: number | null; readiness: string; mpw: string; shuttle: boolean;
  planCr: number | null; fy31Cr: number | null; units: string; priceLowUsd: number | null; priceHighUsd: number | null;
  marketLowCr: number | null; marketHighCr: number | null; verdict: string; devLowCr: number | null; devHighCr: number | null};
export type PortfolioData = {source: string; sourceFile: string; skus: Sku[]; years: string[]; groups: {name: string; values: number[]}[]; total: number[];
  approvals: {market: string; approval: string; low: number; high: number}[];
  unitCost: {chip: string; dieMm2: number; pkg: string; costLow: number; costHigh: number; priceLow: number; priceHigh: number; marginLow: number; marginHigh: number; marginAt: number}[];
  tranche: {use: string; cr: number; delivers: string}[]; specs: Row[];
  documents: Row[]; conflicts: Row[];
  model: {fy31RevenueCr: number; sources: {item: string; cr: number}[]} | null};
export type Provenance = {live: boolean; readAt?: string};

const HEADERS: Record<TableName, string[]> = {
  skus: ['sku', 'name', 'process', 'clock_mhz', 'readiness', 'mpw', 'dec2026_shuttle', 'plan_line_cr', 'fy31_ramp_cr', 'addressable_units', 'price_low_usd', 'price_high_usd', 'market_low_cr', 'market_high_cr', 'verdict', 'dev_cost_low_cr', 'dev_cost_high_cr'],
  ramp: ['group'],
  approvals: ['market', 'approval', 'months_low', 'months_high'],
  'unit-cost': ['chip', 'die_mm2', 'package', 'cost_low_usd', 'cost_high_usd', 'price_low_usd', 'price_high_usd', 'margin_low_pct', 'margin_high_pct', 'margin_at_price_usd'],
  'tranche1-uses': ['use', 'cr', 'delivers'],
  'dg32-specs': ['part', 'core', 'clock', 'sram', 'adc', 'package', 'process', 'status'],
  documents: ['document', 'file', 'where', 'version', 'status', 'note'],
  conflicts: ['topic', 'source_a', 'a_says', 'source_b', 'b_says', 'status'],
};

export const SHEET_IDS = sheetIds as unknown as Record<TableName, string>;
export const sheetCsvUrl = (t: TableName) => `https://docs.google.com/spreadsheets/d/${SHEET_IDS[t]}/export?format=csv`;
export const sheetViewUrl = (t: TableName) => `https://docs.google.com/spreadsheets/d/${SHEET_IDS[t]}/edit`;

/** RFC 4180 CSV: quoted cells, doubled quotes, CRLF or LF. */
export function parseCsv(text: string): Row[] {
  const rows: string[][] = []; let row: string[] = [], cur = '', q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(c => c.trim() !== ''));
  if (!head) return [];
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const num = (v: string | undefined) => (v == null || v.trim() === '' ? null : Number(v.replace(/,/g, '')));
const isNum = (v: string | undefined) => v != null && v.trim() !== '' && Number.isFinite(Number(v.replace(/,/g, '')));

/** Structure and internal consistency, for a live read and for the build alike. Returns what is wrong, empty if usable. */
export function checkTables(t: Tables): string[] {
  const bad: string[] = [];
  for (const name of TABLES) {
    const rows = t[name];
    if (!rows || !rows.length) { bad.push(`${name}: no rows`); continue; }
    const missing = HEADERS[name].filter(h => !(h in rows[0]));
    if (missing.length) bad.push(`${name}: missing column ${missing.join(', ')}`);
  }
  if (bad.length) return bad;
  const planned = t.skus.filter(r => r.plan_line_cr !== '');
  if (planned.length < 1) bad.push('skus: no SKU has a plan line');
  for (const r of planned) {
    for (const k of ['plan_line_cr', 'fy31_ramp_cr', 'dev_cost_low_cr', 'dev_cost_high_cr']) if (!isNum(r[k])) bad.push(`skus ${r.sku}: ${k} is not a number`);
    if (isNum(r.fy31_ramp_cr) && isNum(r.plan_line_cr) && num(r.fy31_ramp_cr)! > num(r.plan_line_cr)!) bad.push(`skus ${r.sku}: FY31 ramp above its plan line`);
    if (isNum(r.dev_cost_low_cr) && isNum(r.dev_cost_high_cr) && num(r.dev_cost_low_cr)! > num(r.dev_cost_high_cr)!) bad.push(`skus ${r.sku}: development cost low above high`);
    if (!/^(yes|no)$/i.test(r.dec2026_shuttle)) bad.push(`skus ${r.sku}: shuttle is not yes or no`);
  }
  const years = Object.keys(t.ramp[0]).filter(k => /^FY\d\d$/.test(k));
  const total = t.ramp.find(r => r.group === 'Total');
  if (!years.length || !total) bad.push('ramp: needs FY columns and a Total row');
  else for (const y of years) {
    const s = t.ramp.filter(r => r.group !== 'Total').reduce((a, r) => a + (num(r[y]) ?? 0), 0);
    if (!isNum(total[y]) || Math.abs(s - num(total[y])!) > 2) bad.push(`ramp ${y}: groups sum to ${s}, total says ${total[y]}`);
  }
  for (const r of t.approvals) if (!isNum(r.months_low) || !isNum(r.months_high) || num(r.months_low)! > num(r.months_high)!) bad.push(`approvals ${r.market}: months invalid`);
  for (const r of t['unit-cost']) for (const k of HEADERS['unit-cost'].slice(3)) if (!isNum(r[k])) bad.push(`unit-cost ${r.chip}: ${k} is not a number`);
  for (const r of t['tranche1-uses']) if (!isNum(r.cr) || num(r.cr)! < 0) bad.push(`tranche1-uses ${r.use}: amount invalid`);
  return bad;
}

/** Claims this site withholds (app/claims.ts `withheld`) are never repeated, even inside a conflict row: each segment of
 *  a cell (split at " / ", "; " and ": ") that carries one is replaced, so the rest of the cell still reads. */
const WITHHELD = /(?:Rs|₹)\s?(?:2\.88|1\.01)\s?Cr|MCEME|39\.3\s?TOPS|12\.9\s?[x×]/i;
const WITHHELD_TEXT = 'a figure this site withholds as misdescribed';
export function sanitizeWithheld(s: string): string {
  if (!WITHHELD.test(s)) return s;
  const parts = s.split(/(\s\/\s|;\s|:\s)/);
  const out = parts.map((p, i) => (i % 2 === 0 && WITHHELD.test(p) ? WITHHELD_TEXT : p));
  return out.join('').replace(new RegExp(`(${WITHHELD_TEXT})((?:\\s\\/\\s|;\\s|:\\s)\\1)+`, 'g'), '$1');
}

export function toPortfolio(t: Tables, model: PortfolioData['model'] = null): PortfolioData {
  const skus: Sku[] = t.skus.map(r => ({
    sku: r.sku, name: r.name, process: r.process, clockMhz: num(r.clock_mhz), readiness: r.readiness, mpw: r.mpw, shuttle: /^yes$/i.test(r.dec2026_shuttle),
    planCr: num(r.plan_line_cr), fy31Cr: num(r.fy31_ramp_cr), units: r.addressable_units, priceLowUsd: num(r.price_low_usd), priceHighUsd: num(r.price_high_usd),
    marketLowCr: num(r.market_low_cr), marketHighCr: num(r.market_high_cr), verdict: r.verdict, devLowCr: num(r.dev_cost_low_cr), devHighCr: num(r.dev_cost_high_cr),
  }));
  const years = Object.keys(t.ramp[0]).filter(k => /^FY\d\d$/.test(k));
  const total = t.ramp.find(r => r.group === 'Total')!;
  const clean = (rows: Row[]) => rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, sanitizeWithheld(v)])));
  return {
    source: 'SKU Blueprint, October 2026', sourceFile: 'deepgrid-sku-blueprint-oct2026.pdf', skus, years,
    groups: t.ramp.filter(r => r.group !== 'Total').map(r => ({name: r.group, values: years.map(y => num(r[y]) ?? 0)})),
    total: years.map(y => num(total[y]) ?? 0),
    approvals: t.approvals.map(r => ({market: r.market, approval: r.approval, low: num(r.months_low)!, high: num(r.months_high)!})),
    unitCost: t['unit-cost'].map(r => ({chip: r.chip, dieMm2: num(r.die_mm2)!, pkg: r.package, costLow: num(r.cost_low_usd)!, costHigh: num(r.cost_high_usd)!,
      priceLow: num(r.price_low_usd)!, priceHigh: num(r.price_high_usd)!, marginLow: num(r.margin_low_pct)!, marginHigh: num(r.margin_high_pct)!, marginAt: num(r.margin_at_price_usd)!})),
    tranche: t['tranche1-uses'].map(r => ({use: r.use, cr: num(r.cr)!, delivers: r.delivers})),
    specs: t['dg32-specs'], documents: clean(t.documents), conflicts: clean(t.conflicts), model,
  };
}

/** Read all eight sheets. Null when any sheet cannot be read or the tables fail checkTables: the caller keeps its built copy. */
export async function loadLiveTables(fetchFn: typeof fetch = fetch, signal?: AbortSignal): Promise<{tables: Tables; failures: string[]} | null> {
  try {
    const entries = await Promise.all(TABLES.map(async t => {
      const r = await fetchFn(sheetCsvUrl(t), {signal, redirect: 'follow'});
      if (!r.ok) throw new Error(`${t}: HTTP ${r.status}`);
      return [t, parseCsv(await r.text())] as const;
    }));
    const tables = Object.fromEntries(entries) as Tables;
    return {tables, failures: checkTables(tables)};
  } catch { return null; }
}

// ---- Facts for Ask DeepGrid ---------------------------------------------------------------------------------------

const NB = ' ';
const cr = (v: number) => `₹${v.toLocaleString('en-IN', {maximumFractionDigits: 1})}${NB}Cr`;
const pct = (v: number) => `${Math.round(v * 100)}${NB}%`;
const list = (xs: string[]) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs.at(-1);

type Fact = IndexChunk & {match: RegExp};

/** A part is named by its code or by its name as people say it: the full name, its last two words ("motor
 *  controller") or a distinctive first word ("Smart-Meter", "Lockstep"). */
const GENERIC = new Set(['interface', 'display', 'voltage', 'the', 'secure']);
function skuMatch(s: Sku): RegExp {
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[- ]/g, '[- ]?');
  const w = s.name.split(/\s+/), alts = [esc(s.name)];
  if (w.length > 2) alts.push(esc(w.slice(-2).join(' ')));
  if (w[0].length >= 4 && !GENERIC.has(w[0].toLowerCase())) alts.push(esc(w[0]));
  return new RegExp(`\\b(?:${s.sku.replace('-', '[- ]?')}|${alts.join('|')})\\b`, 'i');
}

/** Short computed statements, each a source passage Ask may cite. docNum 'portfolio-data'; pdfPath is the /portfolio
 *  page, specPath the live sheet. Every figure names its document and the kind of number it is. */
export function portfolioFacts(d: PortfolioData, prov: Provenance): Fact[] {
  const when = prov.live ? `read live from the team's sheet${prov.readAt ? ' at ' + prov.readAt : ''}` : 'from the copy checked at the last site build';
  const label = `SKU portfolio data, ${when}`;
  const mk = (id: string, section: string, text: string, table: TableName, match: RegExp): Fact =>
    ({id: 'portfolio_' + id, docTitle: 'SKU portfolio data (SKU Blueprint, October 2026)', docNum: 'portfolio-data', pdfPath: '/portfolio', pdfSize: '',
      specPath: sheetViewUrl(table), pageLabel: label, section, text, match});
  const planned = d.skus.filter(s => s.planCr != null);
  const on = planned.filter(s => s.shuttle), off = planned.filter(s => !s.shuttle);
  const nm = (s: Sku) => `${s.sku} ${s.name}`;
  const sum = (k: keyof Sku) => Math.round(planned.reduce((a, s) => a + ((s[k] as number) || 0), 0) * 10) / 10;
  const y31 = d.years.indexOf('FY31'), last = d.years.length - 1;
  const byRamp = [...planned].sort((a, b) => (b.fy31Cr ?? 0) - (a.fy31Cr ?? 0));
  const fy31Sum = sum('fy31Cr');
  const facts: Fact[] = [];

  facts.push(mk('shuttle', 'Which chips go on the December 2026 shuttle',
    `${on.length} of the ${planned.length} chips go on the ChipFoundry December 2026 prototype shuttle: ${list(on.map(nm))}. Not on it: ${list(off.map(s => `${nm(s)} (${s.readiness || 'no readiness stated'})`))}. D100, the 28 nm Track B drone SoC, has no plan line. Source: SKU Blueprint, October 2026; a schedule, not a delivery.`,
    'skus', /shuttle|tape.?out|prototype|mpw|chipfoundry|december|how many chips/i));

  if (y31 >= 0) facts.push(mk('plan-vs-ramp', 'Plan lines and the FY31 ramp',
    `The eleven chips' plan lines total ${cr(sum('planCr'))}: the revenue they can carry at full run-rate, a plan target. On the Blueprint's approval times the revenue ramp reaches ${cr(d.total[y31])} in FY31 and ${cr(d.total[last])} in ${d.years[last]}; ₹1,000 Cr in FY31 is the Blueprint's stretch target, not its expectation. All are plan targets, not results (SKU Blueprint, October 2026).`,
    'ramp', /fy ?31|ramp|revenue|plan line|1,?000|run.?rate|how much.*(earn|revenue)|forecast|projection/i));

  if (y31 >= 0) facts.push(mk('top-fy31', 'Which chips carry the FY31 revenue',
    `${list(byRamp.slice(0, 2).map(s => `${nm(s)} (${cr(s.fy31Cr!)})`))} carry ${pct((byRamp[0].fy31Cr! + byRamp[1].fy31Cr!) / fy31Sum)} of the chips' FY31 ramp of ${cr(fy31Sum)}. Ranked by FY31 ramp: ${byRamp.map(s => `${s.sku} ${cr(s.fy31Cr!)} of a ${cr(s.planCr!)} line`).join('; ')}. Plan targets (SKU Blueprint, October 2026).`,
    'skus', /which chips|most|largest|biggest|top|carry|lead|drive|fy ?31|share of revenue|rank/i));

  facts.push(mk('ramp-years', 'Revenue ramp by year and chip group',
    `Revenue ramp, plan targets (SKU Blueprint, October 2026): ${d.years.map((y, i) => `${y} ${cr(d.total[i])}`).join(', ')}. By group in ${d.years[last]}: ${d.groups.map(g => `${g.name} ${cr(g.values[last])}`).join('; ')}.`,
    'ramp', /ramp|by year|fy ?(29|30|32|33)|grow|growth|trajectory|over time|group/i));

  const tr = [...d.tranche].sort((a, b) => b.cr - a.cr), trTotal = Math.round(d.tranche.reduce((a, t) => a + t.cr, 0) * 10) / 10;
  facts.push(mk('tranche1', 'What tranche 1 pays for',
    `Tranche 1 is ${cr(trTotal)}, proposed in the SKU Blueprint (October 2026): ${tr.map(t => `${t.use} ${cr(t.cr)} (${t.delivers})`).join('; ')}. A proposal for the raise, not committed funding.`,
    'tranche1-uses', /tranche|use of funds|raise|funding|invest|money|spend|10 ?cr|pay for|budget/i));

  const devTop = [...planned].sort((a, b) => (b.devHighCr ?? 0) - (a.devHighCr ?? 0));
  facts.push(mk('dev-cost', 'Development cost per chip',
    `Development cost for all eleven chips is ${cr(sum('devLowCr'))}–${cr(sum('devHighCr'))}: a prototype run, then a production mask set and qualification for each chip's markets. Highest: ${list(devTop.slice(0, 2).map(s => `${nm(s)} ${cr(s.devLowCr!)}–${cr(s.devHighCr!)}`))}; lowest: ${nm(devTop.at(-1)!)} ${cr(devTop.at(-1)!.devLowCr!)}–${cr(devTop.at(-1)!.devHighCr!)}. The prototype cost is quoted; mask and qualification costs are planning estimates (SKU Blueprint, October 2026).`,
    'skus', /develop|nre|cost to (build|design|bring)|design cost|mask|qualif|how much.*cost/i));

  facts.push(mk('unit-cost', 'Unit cost and gross margin at volume',
    `Cost to make at volume and gross margin, estimates (SKU Blueprint, October 2026): ${d.unitCost.map(u => `${u.chip}: about ${u.dieMm2} mm² in ${u.pkg}, costs $${u.costLow.toFixed(2)}–${u.costHigh.toFixed(2)}, sells for $${u.priceLow}–${u.priceHigh}, ${u.marginLow}–${u.marginHigh}${NB}% gross margin at $${u.marginAt.toFixed(2)}`).join('; ')}. These are assumptions until there is a volume quote.`,
    'unit-cost', /margin|unit cost|cost to make|asp|price|per unit|die size|package|economics/i));

  facts.push(mk('approvals', 'Approval time before volume revenue',
    `Approval each market needs before it buys in volume (SKU Blueprint, October 2026): ${d.approvals.map(a => `${a.market}: ${a.approval}, ${a.low}–${a.high} months`).join('; ')}. Timing of approvals, not market size, is the main risk to the FY31 ramp.`,
    'approvals', /approv|certif|qualif|aec|bis|rdso|isro|mil|how long|time to market|when.*revenue/i));

  if (d.model && y31 >= 0) facts.push(mk('blueprint-vs-model', 'The SKU Blueprint and the financial model compared',
    `Two plans, two documents. The SKU Blueprint (October 2026) covers the eleven chips: a ${cr(trTotal)} first tranche, then further tranches, and a chip revenue ramp of ${cr(d.total[y31])} in FY31. The financial model (corrected v3, September 2026, shown on the Business plan page) covers the whole company by segment: it raises ${list(d.model.sources.map(s => `${cr(s.cr)} (${s.item})`))} and expects ${cr(Math.round(d.model.fy31RevenueCr))} of whole-company revenue in FY31. Read each figure with its own document; both are plan targets.`,
    'ramp', /model|business plan|financial|compare|reconcil|differ|versus|vs\.?|september|two plans|funding story|equity|loan|cgtmse/i));

  for (const s of d.specs) facts.push(mk('spec-' + s.part.toLowerCase(), `${s.part} preliminary specifications`,
    `${s.part}${s.sku ? ` (${s.sku})` : ''}, preliminary datasheet: ${s.core}; clock ${s.clock}; SRAM ${s.sram}; boot ROM ${s.boot_rom}; ADC ${s.adc}; supply ${s.supply}; ${s.package}; ${s.process}; status: ${s.status}.${s.note ? ' ' + s.note + '.' : ''}`,
    'dg32-specs', new RegExp(s.part.replace('-', '[- ]?') + '|dg32|spec|datasheet|clock|sram|adc', 'i')));

  for (const s of planned) facts.push(mk('sku-' + s.sku.toLowerCase(), `${s.sku} ${s.name}`,
    `${nm(s)}: ${s.process}${s.clockMhz ? `, ${s.clockMhz} MHz product target` : ''}; ${s.readiness}; ${s.shuttle ? 'on' : 'not on'} the December 2026 shuttle${s.mpw ? ` (${s.mpw})` : ''}. Plan line ${cr(s.planCr!)}, FY31 ramp ${cr(s.fy31Cr!)}; addressable ${s.units} units a year at $${s.priceLowUsd}–${s.priceHighUsd}, market ${cr(s.marketLowCr!)}–${cr(s.marketHighCr!)}, verdict ${s.verdict.toLowerCase()}; development cost ${cr(s.devLowCr!)}–${cr(s.devHighCr!)}. Plan targets and estimates (SKU Blueprint, October 2026).`,
    'skus', skuMatch(s)));

  const cur = d.documents.filter(r => /^current/i.test(r.status)), old = d.documents.filter(r => !/^current/i.test(r.status));
  facts.push(mk('documents', 'Which version of each document is current',
    `Current: ${cur.map(r => `${r.document} (${r.version}${r.pages ? `, ${r.pages} pages` : ''})`).join('; ')}. Superseded, stale or duplicate: ${old.map(r => `${r.document}: ${r.status}${r.note ? ` (${r.note})` : ''}`).join('; ')}.`,
    'documents', /document|version|current|latest|superseded|stale|datasheet|whitepaper|which (pdf|file)|download/i));

  const disagree = /disagree|conflict|inconsisten|contradict|discrepan|which document/i;
  facts.push(mk('conflicts', 'Where the published documents disagree',
    `Where the published documents disagree, and what was done (${d.conflicts.length} items): ${d.conflicts.map(c => `${c.topic}: ${c.source_a} says ${c.a_says}; ${c.source_b} says ${c.b_says} (${c.status})`).join('. ')}.`,
    'conflicts', disagree));
  d.conflicts.forEach((c, i) => facts.push(mk('conflict-' + i, `Where documents disagree: ${c.topic}`,
    `${c.topic}. ${c.source_a} says: ${c.a_says}. ${c.source_b} says: ${c.b_says}. Status: ${c.status}.`,
    'conflicts', new RegExp(c.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))));
  return facts;
}

/** The facts a question calls for: matched by topic, the named part's own row first, at most six. */
export function selectFacts(question: string, facts: Fact[]): IndexChunk[] {
  const named = facts.filter(f => f.id.startsWith('portfolio_sku-') && f.match.test(question));
  const topical = facts.filter(f => !f.id.startsWith('portfolio_sku-') && f.match.test(question));
  return [...named, ...topical].slice(0, 6).map(({match: _m, ...c}) => c);
}
