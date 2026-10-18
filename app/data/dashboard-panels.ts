// Which dashboard panel, if any, answers an Ask DeepGrid question, and with which year or chips.
//
// Ask shows the matched panel beside the cited prose: the same component and the same checked data as the
// dashboard, never a chart drawn from model output. Matching is by phrase, not by the semantic index: the
// dashboard vocabulary (cash, margin, tranche, qualification) is narrow and literal, a phrase rule is instant
// and testable, and a wrong chart is worse than none. scripts/check-ask-panels.mjs holds the routing eval
// (questions that must open a panel, and questions that must not) and runs in every build.
//
// No imports and only erasable TypeScript, so Node runs this file as it is. Generic words only: this file ships
// in every build, including those that do not publish the plan (memory: client code ships in every build).

export type PanelId =
  | 'plan-flow' | 'plan-segments' | 'plan-margins' | 'plan-opex' | 'plan-cash' | 'plan-funds' | 'plan-reconcile'
  | 'pf-lines' | 'pf-ramp' | 'pf-approvals' | 'pf-tranche' | 'pf-dev' | 'pf-unit' | 'pf-specs' | 'pf-conflicts'
  | 'uc-windows' | 'uc-share';
export type Dashboard = 'plan' | 'portfolio' | 'use-cases';
export type PanelMatch = {id: PanelId; dashboard: Dashboard; score: number; via: 'rule' | 'semantic'; year?: string; skus?: string[]};

type Rule = [RegExp, number];
type Spec = {id: PanelId; dashboard: Dashboard; rules: Rule[]};

/** Weights: 3 = the phrase alone names this panel; 2 = a strong cue; 1 = supporting; negative = belongs elsewhere. */
const SPECS: Spec[] = [
  {id: 'plan-flow', dashboard: 'plan', rules: [
    [/\bwhere (does|do|will) (the |our )?(money|cash|revenue|income)\b.*\bgo\b/, 3], [/\bwaterfall\b|\bwalk[- ]?down\b/, 3],
    [/\bnet income\b/, 3], [/\b(p&l|p and l|profit and loss|income statement)\b/, 3],
    [/\b(cost|expense)s? (break ?down|breakdown|structure)\b|\bbreak ?down (of )?(the )?(costs?|expenses?)\b/, 3],
    [/\bcash (flows?|outflows?|movements?)\b/, 2], [/\bwhat (eats|takes|consumes) (the )?(revenue|cash|money)\b/, 3]]},
  {id: 'plan-segments', dashboard: 'plan', rules: [
    [/\brevenue (mix|by segment|split|breakdown|streams?)\b/, 3], [/\bsegments?\b/, 2], [/\bbusiness lines?\b/, 2],
    [/\bwhere (does|will) (the )?revenue come from\b/, 3], [/\bhow (does|will) (the company|deepgrid|it) make money\b/, 3],
    [/\bper (chip|sku|product)\b|\bby (chip|sku|product)\b/, -3]]},
  {id: 'plan-margins', dashboard: 'plan', rules: [
    [/\b(gross|ebitda|net|operating) margins?\b/, 3], [/\bmargins?\b/, 1], [/\bprofitab(le|ility)\b/, 2],
    [/\bbreak[- ]?even\b|\bturn(s)? (a )?profit\b|\bmake a profit\b/, 3],
    [/\bper (chip|unit|die)\b|\bunit (cost|economics)\b/, -4]]},
  {id: 'plan-opex', dashboard: 'plan', rules: [
    [/\bopex\b|\boperating (expenses?|costs?|spend)\b/, 3], [/\b(r&d|r and d|sales and marketing|g&a|overheads?) (spend|costs?|budget)\b/, 3],
    [/\bheadcount cost\b|\bsalar(y|ies)\b/, 2]]},
  {id: 'plan-cash', dashboard: 'plan', rules: [
    [/\b(runway|burn rate|cash burn|liquidity)\b/, 3], [/\b(cash (low|balance|position|trough)|closing cash|lowest cash)\b/, 3],
    [/\brun(s)? out of (cash|money)\b/, 3], [/\bcash\b.*\blowest\b|\blowest\b.*\bcash\b/, 3], [/\b(capex|capital expenditure)\b/, 2], [/\bburn\b/, 1]]},
  {id: 'plan-funds', dashboard: 'plan', rules: [
    [/\buse of (funds|proceeds)\b/, 3], [/\bfunding sources?\b|\bcapital allocation\b/, 3],
    [/\bhow much (is|are|will|does)?\b.*\brais(e|ing)\b|\braise (size|amount)\b|\bsize of the raise\b/, 3],
    [/\bwhere (does|will) (the )?(money raised|raise|investment|funds?)\b.*\bgo\b/, 3], [/\btranche\b/, -3]]},
  {id: 'plan-reconcile', dashboard: 'plan', rules: [
    [/\breconcil\w*\b/, 2], [/\b(two|both|company and chip|financial and portfolio) (revenue )?plans?\b/, 2],
    [/\bplans? (agree|match|differ|disagree)\b|\b(agree|match|differ)\b.*\bplans?\b/, 2],
    [/\b(conflicts?|contradict\w*|discrepanc\w*)\b/, -2]]},
  {id: 'pf-lines', dashboard: 'portfolio', rules: [
    [/\bplan lines?\b/, 3], [/\b(revenue|opportunity|earn\w*|sales) (by|per|of each|for each) (chip|product|sku)\b/, 3],
    [/\bwhich (chips?|products?|skus?)\b.*\b(revenue|earn|sell the most|ramp|biggest|largest)\b/, 3],
    [/\b(how much|what) revenue\b.*\bsku[- ]?\d/, 3], [/\bfy ?31\b/, 1]]},
  {id: 'pf-ramp', dashboard: 'portfolio', rules: [
    [/\b(revenue |chip )?ramp\b/, 2], [/\bby (chip )?group\b|\bchip groups?\b/, 3], [/\bfy ?29\b.*\bfy ?33\b/, 2]]},
  {id: 'pf-approvals', dashboard: 'portfolio', rules: [
    [/\b(qualif\w*|approvals?|certif\w*|aec-q100|homologat\w*)\b/, 2.5], [/\blead times?\b/, 2.5], [/\bhow long\b/, 1],
    [/\b(sell|target|go after)\b.*\bfirst\b|\bfirst customers?\b|\bbeachhead\b/, -2]]},
  {id: 'pf-tranche', dashboard: 'portfolio', rules: [
    [/\b(first )?tranche( 1| one)?\b/, 3], [/\bfirst (raise|round)\b.*\b(spent|used|go)\b/, 2]]},
  {id: 'pf-dev', dashboard: 'portfolio', rules: [
    [/\b(development|dev|nre|design|tape[- ]?out) costs?\b/, 3], [/\bcosts? to (develop|design|build|tape out)\b/, 3],
    [/\bhow much (does|will|would)\b.*\b(cost to develop|cost to design|to develop|to design)\b/, 2], [/\bmasks?\b/, 1]]},
  {id: 'pf-unit', dashboard: 'portfolio', rules: [
    [/\bunit (cost|economics|price)s?\b/, 3], [/\b(costs?|prices?|margins?) (per|of each|for each) (chip|unit|die)\b/, 3],
    [/\b(asp|average selling price|selling price|bom)\b/, 3], [/\bdie (size|area)\b/, 2]]},
  {id: 'pf-specs', dashboard: 'portfolio', rules: [
    [/\b(specs?|specifications?|datasheets?)\b/, 2], [/\bdg32\b/, 2], [/\b(clock speed|sram|boot rom|adc|package)\b/, 1]]},
  {id: 'pf-conflicts', dashboard: 'portfolio', rules: [
    [/\b(conflicts?|contradict\w*|discrepanc\w*|inconsisten\w*)\b/, 3], [/\bopen (issues|questions)\b/, 2], [/\bsources? (disagree|differ)\b/, 3]]},
  {id: 'uc-windows', dashboard: 'use-cases', rules: [
    [/\b(sell|target|go after)\b.*\bfirst\b|\bfirst customers?\b|\bbeachhead\b|\bgo[- ]to[- ]market\b/, 3],
    [/\bwhich markets?\b/, 2], [/\b(fast|slow|quick)(er|est)?[- ](qualif\w*|markets?)\b/, 3], [/\bearly revenue\b/, 2]]},
  {id: 'uc-share', dashboard: 'use-cases', rules: [
    [/\bmarket share\b|\bshare of (the |each )?market\b|\bmarket penetration\b/, 3], [/\bhow much of the market\b/, 3]]},
];

const MIN = 3, GAP = 1;

/** FY27 … FY33 written as FY29, FY 29, FY'29 or fiscal (year) 2029; only years the panel can show. */
export function yearIn(q: string, years: string[]): string | undefined {
  const m = q.match(/\bfy ?'?(\d{2})\b/i) || q.match(/\bfiscal (?:year )?20(\d{2})\b/i);
  const fy = m ? 'FY' + m[1] : undefined;
  return fy && years.includes(fy) ? fy : undefined;
}
/** SKU-1 … SKU-11 and D100, by code: chip names are data, and this file carries none. */
export function skusIn(q: string): string[] {
  const out = [...q.matchAll(/\bsku[- ]?(\d{1,2})\b/gi)].map(m => 'SKU-' + Number(m[1]));
  if (/\bd100\b/i.test(q)) out.push('D100');
  return [...new Set(out)];
}

/** Semantic similarity of the question to each panel (its best example question), in PANEL_IDS order, with the
 *  floor and lead the build calibrated on scripts/ask-panel-eval.json (zero wrong, zero forced). */
export type PanelSemantic = {scores: ArrayLike<number>; min: number; gap: number};
export type MatchOpts = {plan: boolean; years?: string[]; sem?: PanelSemantic | null};

/** The panel for a question, or null when none is clearly meant. Phrase rules decide first; when none fires, the
 *  semantic scores may, above their calibrated floor and lead. plan=false (a build without the plan) never returns
 *  a plan panel. A tie, or a lead under the gap, returns null: a wrong chart is worse than none. */
export function matchPanel(question: string, opts: MatchOpts): PanelMatch | null {
  const q = question.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
  const allowed = (d: Dashboard) => opts.plan || d !== 'plan';
  const scored = SPECS.filter(s => allowed(s.dashboard))
    .map(s => ({s, score: s.rules.reduce((a, [re, w]) => a + (re.test(q) ? w : 0), 0)}))
    .sort((a, b) => b.score - a.score);
  const [top, next] = scored;
  let id: PanelId | null = null, score = 0, via: 'rule' | 'semantic' = 'rule';
  if (top && top.score >= MIN && !(next && top.score - next.score < GAP)) { id = top.s.id; score = top.score; }
  else if (opts.sem) {
    const ranked = PANEL_IDS.map((p, i) => ({p, v: opts.sem!.scores[i]})).filter(x => allowed(DASHBOARD_OF[x.p])).sort((a, b) => b.v - a.v);
    if (ranked[0] && ranked[0].v >= opts.sem.min && (!ranked[1] || ranked[0].v - ranked[1].v >= opts.sem.gap)) { id = ranked[0].p; score = ranked[0].v; via = 'semantic'; }
  }
  if (!id) return null;
  const match: PanelMatch = {id, dashboard: DASHBOARD_OF[id], score, via};
  if (id === 'plan-flow') { const y = yearIn(q, opts.years ?? []); if (y) match.year = y; }
  if (id === 'pf-lines' || id === 'pf-dev') { const k = skusIn(q); if (k.length) match.skus = k; }
  return match;
}
const DASHBOARD_OF = Object.fromEntries(SPECS.map(s => [s.id, s.dashboard])) as Record<PanelId, Dashboard>;

/** Where the panel lives on its dashboard. */
export const PANEL_HOME: Record<PanelId, {path: string; hash: string}> = {
  'plan-flow': {path: '/plan', hash: 'ch-flow'}, 'plan-segments': {path: '/plan', hash: 'pd-seg-h'},
  'plan-margins': {path: '/plan', hash: 'pd-margin-h'}, 'plan-opex': {path: '/plan', hash: 'pd-opex-h'},
  'plan-cash': {path: '/plan', hash: 'pd-cash-h'}, 'plan-funds': {path: '/plan', hash: 'pd-funds-h'},
  'plan-reconcile': {path: '/plan', hash: 'pd-rec-h'},
  'pf-lines': {path: '/portfolio', hash: 'sk-lines-h'}, 'pf-ramp': {path: '/portfolio', hash: 'sk-ramp-h'},
  'pf-approvals': {path: '/portfolio', hash: 'sk-appr-h'}, 'pf-tranche': {path: '/portfolio', hash: 'sk-money-h'},
  'pf-dev': {path: '/portfolio', hash: 'sk-dev-h'}, 'pf-unit': {path: '/portfolio', hash: 'sk-unit-h'},
  'pf-specs': {path: '/portfolio', hash: 'sk-spec-h'}, 'pf-conflicts': {path: '/portfolio', hash: 'sk-conf-h'},
  'uc-windows': {path: '/portfolio/brief', hash: 'uc-revenue'}, 'uc-share': {path: '/portfolio/brief', hash: 'uc-market'},
};
export const DASHBOARD_NAME: Record<Dashboard, string> = {plan: 'Business plan', portfolio: 'SKU portfolio', 'use-cases': 'Markets and qualification'};

/** Example questions per panel, embedded by scripts/build-semantic-index.mjs. They let a reworded question reach its
 *  panel by meaning when no phrase rule fires. Never copy a question from scripts/ask-panel-eval.json: the build
 *  rejects a leak, because the eval would then score the examples against themselves. */
export const PANEL_EXAMPLES: Record<PanelId, string[]> = {
  'plan-flow': ['How does each year\'s revenue get spent before it becomes profit?', 'What costs come out of revenue on the way to the bottom line?',
    'Walk me from sales to net profit for one year', 'Where does the operating cash go each year?', 'What are the largest costs in a given year?',
    'How does revenue convert into earnings?'],
  'plan-segments': ['Which part of the business brings in most of the revenue?', 'How is revenue split between products and services?',
    'What are the revenue streams of the company?', 'Which segment grows fastest?', 'What proportion of sales comes from each line of business?'],
  'plan-margins': ['When does the business become profitable?', 'How do gross and net margins change over the plan?',
    'Is the company making money yet?', 'What year does profit turn positive?', 'How profitable is the company at the end of the plan?'],
  'plan-opex': ['How much does the company spend on research and development?', 'What are the overhead costs?',
    'How much goes to sales, marketing and administration?', 'How do running costs grow each year?', 'What does it cost to operate the company?'],
  'plan-cash': ['How long will the money last?', 'How much cash does the company hold each year?', 'What is the low point of the bank balance?',
    'How much is invested in equipment and fixed assets?', 'Does the company need more cash before revenue arrives?'],
  'plan-funds': ['How will the investment be spent?', 'Where does the funding come from?', 'How is the capital being allocated?',
    'What will investors\' money pay for?', 'How large is the funding round?'],
  'plan-reconcile': ['Is the financial model consistent with the chip roadmap?', 'Why do the company and product revenue figures differ?',
    'Does the business plan match the portfolio strategy?', 'How does total company revenue compare with chip revenue?'],
  'pf-lines': ['Which product has the biggest sales potential?', 'How much can each chip sell at full rate?', 'Which chips bring in revenue by FY31?',
    'Compare the revenue of two chips', 'What is the revenue target for each SKU?'],
  'pf-ramp': ['How does chip revenue build from year to year?', 'Which family of chips grows the most?', 'What is the revenue trajectory of the chip portfolio?',
    'How fast do chip sales ramp up?'],
  'pf-approvals': ['How long do customers take to approve a new chip?', 'When can automotive buyers start purchasing?', 'What approvals does each market need?',
    'How long does defence certification take?', 'What delays revenue after first silicon?'],
  'pf-tranche': ['What does the first round of funding pay for?', 'How is the initial investment split across activities?', 'What will the opening investment deliver?',
    'Which activities get the most of the first raise?'],
  'pf-dev': ['How expensive is it to design each chip?', 'What is the engineering cost to bring a chip to market?', 'Which chip is the most costly to develop?',
    'What does it cost to take a chip from design to silicon?'],
  'pf-unit': ['How much does it cost to manufacture one chip?', 'What price will the chips sell for?', 'What gross margin does each chip earn at volume?',
    'What is the cost of the die and package?'],
  'pf-specs': ['What are the technical specifications of DG32?', 'What memory and peripherals does the DG32 have?', 'What package and process does DG32 use?',
    'Compare the two DG32 dies'],
  'pf-conflicts': ['Where do the documents disagree?', 'Which numbers are inconsistent across sources?', 'What issues remain unresolved between the documents?',
    'Which claims conflict between publications?'],
  'uc-windows': ['Which customers should the company approach first?', 'Which markets bring revenue soonest?', 'Where should sales start?',
    'Which industries can buy the chips earliest?', 'Why start with industrial buyers?'],
  'uc-share': ['How much of each market does the plan need to win?', 'Are the market share targets achievable?', 'What share of its market does each chip assume?',
    'Is the plan aggressive about market share?'],
};

/** Row order of the panel block in semantic.bin. */
export const PANEL_IDS = Object.keys(PANEL_EXAMPLES) as PanelId[];

/** What the browser hashes to know the panel rows in semantic.bin were built from these examples. */
export function panelKey(): string { return Object.entries(PANEL_EXAMPLES).map(([id, qs]) => id + '\u0001' + qs.join('\u0002')).join('\u0003'); }
