// Which dashboard panel, if any, answers an Ask DeepGrid question, and with which year or chips.
//
// Ask shows the matched panel beside the cited prose: the same component and the same checked data as the
// dashboard, never a chart drawn from model output. Three stages, each tried only when the one before finds nothing:
//   1. phrase rules (SPECS): instant and literal;
//   2. semantic similarity to each panel's example questions (PANEL_EXAMPLES), embedded in the site's own index,
//      through the floor and lead that scripts/build-semantic-index.mjs calibrates with zero wrong and zero forced;
//   3. the answer service's model (POST /panel, services/ask/worker.ts), given PANEL_SCOPE; its pick counts only if
//      it is on PANEL_IDS (panelFromModel).
// The year and chips always come from the question's words. A tie or a weak match shows nothing: a wrong chart is
// worse than none. scripts/ask-panel-eval.json is the routing eval; scripts/check-ask-panels.mjs runs in every build.
//
// No imports and only erasable TypeScript, so Node runs this file as it is. Generic words only: this file ships
// in every build, including those that do not publish the plan (memory: client code ships in every build).

export type PanelId =
  | 'plan-flow' | 'plan-segments' | 'plan-margins' | 'plan-opex' | 'plan-cash' | 'plan-funds' | 'plan-reconcile'
  | 'pf-lines' | 'pf-ramp' | 'pf-approvals' | 'pf-tranche' | 'pf-dev' | 'pf-unit' | 'pf-specs' | 'pf-conflicts'
  | 'uc-windows' | 'uc-share';
export type Dashboard = 'plan' | 'portfolio' | 'use-cases';
export type PanelMatch = {id: PanelId; dashboard: Dashboard; score: number; via: 'rule' | 'semantic' | 'model'; year?: string; skus?: string[]};

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
    [/\brevenue (mix|by segment|split|breakdown|streams?)\b/, 3], [/\bsegments?\b/, 3], [/\bbusiness lines?\b/, 2],
    [/\bwhere (does|will) (the )?revenue come from\b/, 3], [/\bhow (does|will) (the company|deepgrid|it) make money\b/, 3],
    [/\bper (chip|sku|product)\b|\bby (chip|sku|product)\b|\bmarket segments?\b|\bsegments? of the market\b/, -3]]},
  {id: 'plan-margins', dashboard: 'plan', rules: [
    [/\b(gross|ebitda|net|operating) margins?\b/, 3], [/\bmargins?\b/, 1], [/\bprofitab(le|ility)\b/, 2],
    [/\bbreak[- ]?even\b|\bturn(s)? (a )?profit\b|\bmake a profit\b/, 3], [/\b(stop|stops) losing money\b|\blosses (end|stop)\b|\blos(e|ing) money\b/, 3],
    [/\bper (chip|unit|die|part)\b|\b(each|one|a single|single) (chip|unit|part|sku)\b|\bunit (cost|economics)\b/, -4]]},
  {id: 'plan-opex', dashboard: 'plan', rules: [
    [/\bopex\b|\boperating (expenses?|costs?|spend)\b/, 3], [/\b(r&d|r and d|sales and marketing|g&a|overheads?) (spend|costs?|budget)\b/, 3],
    [/\bheadcount cost\b|\bsalar(y|ies)\b/, 2]]},
  {id: 'plan-cash', dashboard: 'plan', rules: [
    [/\b(runway|burn rate|cash burn|liquidity)\b/, 3], [/\b(cash (low|balance|position|trough)|closing cash|lowest cash)\b/, 3],
    [/\brun(s)? out of (cash|money)\b/, 3], [/\bcash\b.*\blowest\b|\blowest\b.*\bcash\b/, 3], [/\b(capex|capital expenditure)\b/, 3], [/\bcash (is )?(left|remaining)\b|\bhow tight\b.*\bcash\b|\bcash\b.*\b(tight|tightest)\b/, 3], [/\bburn\b/, 1]]},
  {id: 'plan-funds', dashboard: 'plan', rules: [
    [/\buse of (funds|proceeds)\b/, 3], [/\binvestment ask\b|\bthe ask\b/, 3], [/\b(the|this) raise\b/, 2], [/\bfunding sources?\b|\bcapital allocation\b/, 3],
    [/\bhow much (is|are|will|does)?\b.*\brais(e|ing)\b|\braise (size|amount)\b|\bsize of the raise\b/, 3],
    [/\bwhere (does|will) (the )?(money raised|raise|investment|funds?)\b.*\bgo\b/, 3], [/\btranche\b/, -3]]},
  {id: 'plan-reconcile', dashboard: 'plan', rules: [
    [/\breconcil\w*\b/, 2], [/\b(two|different|both) (revenue )?(forecasts?|projections?)\b/, 3], [/\b(two|both|company and chip|financial and portfolio) (revenue )?plans?\b/, 2],
    [/\bplans? (agree|match|differ|disagree)\b|\b(agree|match|differ)\b.*\bplans?\b/, 2],
    [/\b(conflicts?|contradict\w*|discrepanc\w*)\b/, -2]]},
  {id: 'pf-lines', dashboard: 'portfolio', rules: [
    [/\bplan lines?\b/, 3], [/\b(revenue|opportunity|earn\w*|sales) (by|per|of each|for each) (chip|product|sku)\b/, 3],
    [/\bwhich (chips?|products?|skus?)\b.*\b(revenue|earn|sell the most|ramp|biggest|largest)\b/, 3],
    [/\b(how much|what) revenue\b.*\bsku[- ]?\d/, 3], [/\bfy ?31\b/, 1]]},
  {id: 'pf-ramp', dashboard: 'portfolio', rules: [
    [/\b(revenue |chip )?ramp\b/, 2], [/\bchip revenue\b.*\bgrow|\bgrow\w*\b.*\bchip revenue\b/, 3], [/\bby (chip )?group\b|\bchip groups?\b/, 3], [/\bfy ?29\b.*\bfy ?33\b/, 2]]},
  {id: 'pf-approvals', dashboard: 'portfolio', rules: [
    [/\b(qualif\w*|approvals?|certif\w*|aec-q100|homologat\w*)\b/, 2.5], [/\blead times?\b/, 2.5], [/\bhow long\b/, 1],
    [/\b(sell|target|go after)\b.*\bfirst\b|\bfirst customers?\b|\bbeachhead\b/, -2]]},
  {id: 'pf-tranche', dashboard: 'portfolio', rules: [
    [/\b(first )?tranche( 1| one)?\b/, 3], [/\binitial (funding|investment|capital)\b/, 3], [/\bfirst (raise|round)\b.*\b(spent|used|go)\b/, 2]]},
  {id: 'pf-dev', dashboard: 'portfolio', rules: [
    [/\b(development|dev|nre|design|tape[- ]?out) costs?\b/, 3], [/\bcosts? to (develop|design|build|tape out)\b/, 3], [/\bcosts? to bring\b.*\bto market\b/, 3], [/\btape[- ]?out\b.*\bsku[- ]?\d|\bsku[- ]?\d.*\btape[- ]?out\b/, 3],
    [/\bhow much (does|will|would)\b.*\b(cost to develop|cost to design|to develop|to design)\b/, 2], [/\bmasks?\b/, 1]]},
  {id: 'pf-unit', dashboard: 'portfolio', rules: [
    [/\bunit (cost|economics|price)s?\b/, 3], [/\b(costs?|prices?|margins?) (per|of each|for each) (chip|unit|die)\b/, 3],
    [/\b(asp|average selling price|selling price|bom)\b/, 3], [/\b(profit\w*|margins?)\b.*\b(each|per|one|a single|single) (chip|part|unit)\b/, 3], [/\bpay per (chip|unit|part)\b|\bcost to (manufacture|make|produce)\b/, 3], [/\bdie (size|area)\b/, 2]]},
  {id: 'pf-specs', dashboard: 'portfolio', rules: [
    [/\b(specs?|specifications?|datasheets?)\b/, 2], [/\bdg32\b/, 2], [/\b(clock speed|sram|boot rom|adc|package)\b/, 1]]},
  {id: 'pf-conflicts', dashboard: 'portfolio', rules: [
    [/\b(conflicts?|contradict\w*|discrepanc\w*|inconsisten\w*)\b/, 3], [/\bopen (issues|questions)\b/, 2], [/\b(don'?t|do not) (line up|match|agree)\b.*\b(documents?|sources?)\b/, 3], [/\bsources? (disagree|differ)\b/, 3]]},
  {id: 'uc-windows', dashboard: 'use-cases', rules: [
    [/\b(sell|target|go after)\b.*\bfirst\b|\bfirst customers?\b|\bbeachhead\b|\bgo[- ]to[- ]market\b/, 3],
    [/\bwhich markets?\b/, 2], [/\b(fast|slow|quick)(er|est)?[- ](qualif\w*|markets?)\b/, 3], [/\bearly revenue\b/, 2]]},
  {id: 'uc-share', dashboard: 'use-cases', rules: [
    [/\bmarket share\b|\bshare of (the |each )?market\b|\bmarket penetration\b|\bpercent(age)? of (the |each )?market\b/, 3], [/\bhow much of the market\b/, 3]]},
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
  'plan-flow': ["How does each year's revenue get spent before it becomes profit?", "What costs come out of revenue on the way to the bottom line?", "Walk me from sales to net profit for one year", "Where does the operating cash go each year?", "What are the largest costs in a given year?", "How does revenue convert into earnings?", "What is left of sales once every cost is paid?", "Show the year's revenue, costs and profit step by step", "How much profit is left from a year's sales?", "Which costs take the biggest bite out of revenue?", "What happens to the cash generated in a year?", "Take me through one year of the profit and loss account"],
  'plan-segments': ["Which part of the business brings in most of the revenue?", "How is revenue split between products and services?", "What are the revenue streams of the company?", "Which segment grows fastest?", "What proportion of sales comes from each line of business?", "What does DeepGrid earn money from apart from silicon?", "How large is each line of business over the plan?", "What other businesses does the company run alongside its chips?", "How much revenue comes from each activity?", "Is the company mainly a chip business by revenue?"],
  'plan-margins': ["When does the business become profitable?", "How do gross and net margins change over the plan?", "Is the company making money yet?", "What year does profit turn positive?", "How profitable is the company at the end of the plan?", "When do losses end?", "What percentage of revenue is kept as profit?", "How long does the company run at a loss?", "What profit margin does the model reach?", "When does net income first go above zero?"],
  'plan-opex': ["How much does the company spend on research and development?", "What are the overhead costs?", "How much goes to sales, marketing and administration?", "How do running costs grow each year?", "What does it cost to operate the company?", "What is the annual spend on engineering and staff?", "How much is the yearly cost base?", "Which expense line grows the most?", "What share of spending goes to research?", "How much does administration cost?"],
  'plan-cash': ["How long will the money last?", "How much cash does the company hold each year?", "What is the low point of the bank balance?", "How much is invested in equipment and fixed assets?", "Does the company need more cash before revenue arrives?", "How close does the company come to running dry?", "What is the year-end cash position over the plan?", "When is the bank balance at its lowest?", "Is there a funding gap before revenue picks up?", "How much is spent on equipment and tooling?", "How much money is in the bank at year end?"],
  'plan-funds': ["How will the investment be spent?", "Where does the funding come from?", "How is the capital being allocated?", "What will investors' money pay for?", "How large is the funding round?", "How much money is the company asking investors for?", "What is the money raised used for?", "What are the proceeds of the round spent on?", "How much capital does the plan raise in total?", "How is the round split between equity and other sources?"],
  'plan-reconcile': ["Is the financial model consistent with the chip roadmap?", "Why do the company and product revenue figures differ?", "Does the business plan match the portfolio strategy?", "How does total company revenue compare with chip revenue?", "Why does the company forecast not match the product forecast?", "Which revenue projection should I believe?", "How far apart are the two revenue plans?", "Are the financial model and the SKU blueprint the same plan?"],
  'pf-lines': ["Which product has the biggest sales potential?", "How much can each chip sell at full rate?", "Which chips bring in revenue by FY31?", "Compare the revenue of two chips", "What is the revenue target for each SKU?", "Which chip earns the least?", "How much is each chip expected to sell in FY31?", "Which SKUs carry most of the revenue?", "What does a single chip contribute to revenue?", "How close is each chip to its full revenue line?"],
  'pf-ramp': ["How does chip revenue build from year to year?", "Which family of chips grows the most?", "What is the revenue trajectory of the chip portfolio?", "How fast do chip sales ramp up?", "How does chip revenue grow between FY29 and FY33?", "What does chip revenue reach in the last plan year?", "How is chip revenue split across product families each year?", "When does chip revenue take off?"],
  'pf-approvals': ["How long do customers take to approve a new chip?", "When can automotive buyers start purchasing?", "What approvals does each market need?", "How long does defence certification take?", "What delays revenue after first silicon?", "What standards must the chips meet for each market?", "How many months of testing does each market require?", "Which market approves new parts fastest?", "What qualification do car makers ask for?", "How long is the wait between samples and volume orders?"],
  'pf-tranche': ["What does the first round of funding pay for?", "How is the initial investment split across activities?", "What will the opening investment deliver?", "Which activities get the most of the first raise?", "What milestones does the first funding reach?", "Where does the opening money go chip by chip?", "What is bought with the first instalment of capital?", "How much of the first funding goes to masks and shuttles?"],
  'pf-dev': ["How expensive is it to design each chip?", "What is the engineering cost to bring a chip to market?", "Which chip is the most costly to develop?", "What does it cost to take a chip from design to silicon?", "How much engineering investment does each chip need?", "What is the non-recurring cost per chip?", "Which chip is cheapest to develop?", "How much is the total development budget across chips?", "What does it take in money to get a chip to production?"],
  'pf-unit': ["How much does it cost to manufacture one chip?", "What price will the chips sell for?", "What gross margin does each chip earn at volume?", "What is the cost of the die and package?", "What is the production cost per part?", "How much profit is made on each chip sold?", "What is the selling price of one part?", "How big is the die and what does it cost?", "What does a chip cost at high volume?"],
  'pf-specs': ["What are the technical specifications of DG32?", "What memory and peripherals does the DG32 have?", "What package and process does DG32 use?", "Compare the two DG32 dies", "How fast is the DG32 processor?", "What supply voltage does DG32 run on?", "What analog inputs does DG32 offer?", "What is on the DG32 datasheet?"],
  'pf-conflicts': ["Where do the documents disagree?", "Which numbers are inconsistent across sources?", "What issues remain unresolved between the documents?", "Which claims conflict between publications?", "Which figures differ from one document to another?", "What has been corrected between versions of the documents?", "Which statements in the sources contradict?", "What mismatches exist in the published material?"],
  'uc-windows': ["Which customers should the company approach first?", "Which markets bring revenue soonest?", "Where should sales start?", "Which industries can buy the chips earliest?", "Why start with industrial buyers?", "Which sectors generate early sales?", "What are the fastest markets to enter?", "Which buyers can place orders soonest?", "Where does early revenue come from by market?", "Why do automotive and defence come later?"],
  'uc-share': ["How much of each market does the plan need to win?", "Are the market share targets achievable?", "What share of its market does each chip assume?", "Is the plan aggressive about market share?", "What portion of each market must the chips capture?", "How much market capture does the forecast rely on?", "Is the assumed share of each market plausible?", "What penetration of each market is assumed?"],
};

/** Row order of the panel block in semantic.bin. */
export const PANEL_IDS = Object.keys(PANEL_EXAMPLES) as PanelId[];

/** What the browser hashes to know the panel rows in semantic.bin were built from these examples. */
export function panelKey(): string { return Object.entries(PANEL_EXAMPLES).map(([id, qs]) => id + '\u0001' + qs.join('\u0002')).join('\u0003'); }

/** What each panel shows, for the answer service's model stage (services/ask/worker.ts, POST /panel). The model
 *  picks one id or none; the browser accepts only an id on this list (panelFromModel). Generic words only. */
export const PANEL_SCOPE: Record<PanelId, string> = {
  'plan-flow': 'Company plan, one year at a time: revenue walked down through each cost to net income, and opening cash walked to closing cash.',
  'plan-segments': 'Company plan: revenue by business segment and year, and each segment\'s share.',
  'plan-margins': 'Company plan: gross, EBITDA and net margin by year, and the first profitable year.',
  'plan-opex': 'Company plan: operating expense by year and its mix (R&D, tape-out programme, sales and marketing, G&A).',
  'plan-cash': 'Company plan: closing cash by year, the cash low point, capital expenditure and liquidity.',
  'plan-funds': 'Company plan: the size of the raise, its sources, and the use of funds.',
  'plan-reconcile': 'Whether the company financial model and the chip portfolio plan agree on revenue, year by year.',
  'pf-lines': 'Chip portfolio: each chip\'s full-rate plan line and its FY31 revenue ramp; compares chips by revenue.',
  'pf-ramp': 'Chip portfolio: total chip revenue FY29 to FY33, stacked by chip group.',
  'pf-approvals': 'Chip portfolio: qualification or approval time by market (industrial, metering, automotive, defence), in months.',
  'pf-tranche': 'Chip portfolio: how the first funding tranche is split across activities and what each delivers.',
  'pf-dev': 'Chip portfolio: development (design, masks, tape-out) cost per chip, low to high.',
  'pf-unit': 'Chip portfolio: per-chip unit cost, selling price, die size, package and gross margin at volume.',
  'pf-specs': 'DG32 preliminary specifications: core, clock, SRAM, boot ROM, ADC, supply, package, process.',
  'pf-conflicts': 'Where published documents state a figure or claim differently, and whether each was fixed or decided.',
  'uc-windows': 'Which markets to sell to first: FY31 chip revenue grouped by how fast each market qualifies parts.',
  'uc-share': 'Market share each chip\'s plan assumes, against a 30% planning reference.',
};

/** A panel the model stage named, accepted only if it is on the list and allowed in this build; the year and chips
 *  still come from the question's own words, never from the model. */
export function panelFromModel(id: unknown, question: string, opts: MatchOpts): PanelMatch | null {
  if (typeof id !== 'string' || !(PANEL_IDS as string[]).includes(id)) return null;
  const pid = id as PanelId, dashboard = DASHBOARD_OF[pid];
  if (!opts.plan && dashboard === 'plan') return null;
  const match: PanelMatch = {id: pid, dashboard, score: 1, via: 'model'};
  if (pid === 'plan-flow') { const y = yearIn(question, opts.years ?? []); if (y) match.year = y; }
  if (pid === 'pf-lines' || pid === 'pf-dev') { const k = skusIn(question); if (k.length) match.skus = k; }
  return match;
}
export const PANEL_ENDPOINT = 'https://deepgrid-rerank.shekerkamma.workers.dev/panel';
