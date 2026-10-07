// Graph-guided evidence retrieval for Ask DeepGrid.
//
// The graph decides which passages support an answer; it is not drawn beside an answer chosen without it:
//   1. Seeds: entities the question names (SKU-10, DG32-Max, Kavach) and entities closest to it in meaning.
//   2. Spread: personalised PageRank from the seeds over the typed edges, each edge weighted by the
//      confidence graphify recorded for it (EXTRACTED 1.0, INFERRED 0.55-0.95, AMBIGUOUS 0.1-0.3), so a
//      guessed relation carries little weight.
//   3. Passages: every passage is linked at build time to the entities it mentions. A passage's score is its
//      semantic match to the question plus the graph score of the entities it is linked to.
//   4. Relevance: a passage counts as evidence only if it shares a content word with the question beyond the
//      names of the entities. Naming the right SKU alone does not make a passage answer the question.
//   5. Answer: the shape story-architect sets for a client brief. A direct answer first (a sentence quoted
//      from the best passage), then numbered evidence, then what the sources do not establish. When nothing
//      passes step 4 the answer says so instead of composing one.
// Deterministic, static, no model call at answer time beyond the question embedding.

export type IndexNode = {id: string; name: string; shortName?: string; category: string; communityName: string;
  description: string; origin: string; aliases?: string[]};
export type IndexEdge = {from: string; to: string; label: string; weight: number; confidence?: string};
export type IndexChunk = {id: string; docTitle: string; docNum: string; pdfPath: string; pdfSize: string; specPath: string;
  pageLabel: string; section: string; text: string; entities?: number[]};
export type GraphIndexLike = {nodes: IndexNode[]; edges: IndexEdge[]; chunks: IndexChunk[]};

export type Evidence = {n: number; chunk: IndexChunk; quote: string; kind: 'direct' | 'related';
  semantic: number; graph: number; via: string[]};
export type Seed = {name: string; why: 'named in the question' | 'closest in meaning'; score: number};
export type Hop = {from: string; relation: string; to: string; confidence: string; weight: number};
export type Retrieval = {
  answerable: boolean;
  comparison: string[] | null;     // the parts compared (SKU-1, SKU-4) when the question compares parts
  byMeaning: boolean;              // true once the in-browser model scored the question; false = word matching
  blufRefs: number[];              // evidence numbers the direct answer quotes
  bluf: string;                    // the direct answer: a quoted sentence, or a plain statement that it is not established
  evidence: Evidence[];
  limits: string[];
  seeds: Seed[];
  hops: Hop[];
  graphChanged: number;            // passages in the evidence that semantic ranking alone would not have chosen
};

const STOP = new Set(('a an and are as at be by can could did do does for from has have how i in is it its of on or our '
  + 'should so than that the their them then there these they this to was we what when where which who why will with '
  + 'would you your about into between versus vs compare comparison difference different differ each any much many more '
  + 'most tell me explain describe give list show deepgrid chip chips part parts sku skus product products silicon '
  + 'come comes go goes get gets use used today now currently please know').split(' '));
const CERT = /\b(certif\w*|qualif\w*|approved|approval|compliant|complian\w*|guarantee\w*|immune|accredit\w*)\b/i;
const COMPARE = /\b(compare|comparison|versus|vs\.?|difference|differ\w*|between|against)\b/i;

const stem = (w: string) => w.replace(/(ies|ing|ers|ed|es|s)$/, '').slice(0, 7);
const words = (t: string) => (t.toLowerCase().match(/[a-z0-9][a-z0-9.-]*[a-z0-9]|[a-z0-9]/g) || []);

/** Alias matchers, built once per index. SKU-1 must not match SKU-10. */
const matcherCache = new WeakMap<GraphIndexLike, {idx: number; rx: RegExp}[]>();
function matchers(g: GraphIndexLike) {
  let m = matcherCache.get(g);
  if (!m) {
    m = [];
    g.nodes.forEach((n, idx) => (n.aliases || []).forEach(a => {
      const s = a.trim(); if (s.length < 3) return;
      const sku = s.match(/^SKU-(\d+)$/i);
      const rx = sku ? new RegExp(`\\bSKU-${sku[1]}(?!\\d)`, 'i')
        : new RegExp(`(?<![A-Za-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'i');
      m!.push({idx, rx});
    }));
    matcherCache.set(g, m);
  }
  return m;
}

/** Undirected weighted adjacency, built once per index. */
const adjCache = new WeakMap<GraphIndexLike, {to: number; w: number; e: IndexEdge}[][]>();
function adjacency(g: GraphIndexLike) {
  let adj = adjCache.get(g);
  if (!adj) {
    const at = new Map(g.nodes.map((n, i) => [n.id, i]));
    adj = g.nodes.map(() => []);
    for (const e of g.edges) {
      const a = at.get(e.from), b = at.get(e.to);
      if (a === undefined || b === undefined || a === b) continue;
      const w = Math.max(0.05, Math.min(1, e.weight ?? 1));
      adj[a].push({to: b, w, e}); adj[b].push({to: a, w, e});
    }
    adjCache.set(g, adj);
  }
  return adj;
}

/** Personalised PageRank from the seed weights; returns a score per node. */
function spread(g: GraphIndexLike, seed: Map<number, number>, restart = 0.35, rounds = 14): Float32Array {
  const adj = adjacency(g), N = g.nodes.length;
  const p0 = new Float32Array(N); let total = 0;
  seed.forEach(v => { total += v; });
  seed.forEach((v, i) => { p0[i] = v / (total || 1); });
  let p = Float32Array.from(p0);
  const out = adj.map(list => list.reduce((s, x) => s + x.w, 0));
  for (let r = 0; r < rounds; r++) {
    const next = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!p[i] || !out[i]) continue;
      for (const x of adj[i]) next[x.to] += (1 - restart) * p[i] * (x.w / out[i]);
    }
    for (let i = 0; i < N; i++) next[i] += restart * p0[i];
    p = next;
  }
  return p;
}

/** The strongest path (product of edge weights, at most two hops) from any seed to `target`. */
function bestPath(g: GraphIndexLike, seeds: number[], target: number): Hop[] {
  const adj = adjacency(g); let best: {w: number; hops: Hop[]} | null = null;
  const hop = (a: number, x: {to: number; w: number; e: IndexEdge}): Hop => ({
    from: g.nodes[a].name, relation: x.e.label.replace(/_/g, ' '), to: g.nodes[x.to].name,
    confidence: x.e.confidence || 'EXTRACTED', weight: x.w});
  for (const s of seeds) {
    if (s === target) return [];
    for (const x of adj[s]) {
      if (x.to === target && (!best || x.w > best.w)) best = {w: x.w, hops: [hop(s, x)]};
      for (const y of adj[x.to]) if (y.to === target && (!best || x.w * y.w > best.w)) best = {w: x.w * y.w, hops: [hop(s, x), hop(x.to, y)]};
    }
  }
  return best ? best.hops : [];
}

function sentences(text: string): string[] {
  return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9“"(₹$])/).map(s => s.trim()).filter(s => s.length > 25);
}

export type RetrieveOpts = {
  nodeScore: (i: number) => number;      // semantic (or TF-IDF) match of node i to the question
  chunkScore: (i: number) => number;     // same for passage i
  semantic: boolean;                     // true when scores come from the embedding model
  useGraph?: boolean;                    // false ranks by meaning alone (the eval's ablation); default true
};

/** Floors for the embedding model and for the TF-IDF fallback (cosine scales differ). Calibrated by the
 *  GraphRAG eval in scripts/build-semantic-index.mjs (scripts/ask-graphrag-eval.json). */
export const EVIDENCE_FLOOR = {semantic: 0.58, tfidf: 0.08};

/** Matches two stemmed words: equal, or one a prefix of the other when the shorter has five or more letters
 *  ("replace" and "replaces", "certif" and "certified"). */
const same = (a: string, b: string) => a === b || (Math.min(a.length, b.length) >= 5 && (a.startsWith(b) || b.startsWith(a)));

/** The part a node stands for (SKU-10, D100), so the catalog entry and the Blueprint entity count once. */
const partOf = (n: IndexNode) => (`${(n.aliases || []).join(' ')} ${n.name}`.match(/\bSKU-\d+\b|\bD100\b/i)?.[0] || n.name).toUpperCase();

/** What kind of answer the question wants, mapped to the Blueprint handout section that gives it. */
const INTENT: [RegExp, string][] = [
  [/\breplac\w*|\binstead of\b|\bcompetitor/i, 'What it replaces'],
  [/\bwho\b|\bbuy\w*|\bcustomer|\bused (by|in)\b/i, 'Who buys it'],
  [/\bwhy\b.*\b(node|nm|process|germanium|sige|cmos|130|180|28)\b|\bwhich node\b/i, 'Why this node'],
  [/\bpolic\w*|\bmandate|\bregulat\w*|\bprogramme|\bprogram\b|\bnecessary\b|\bdemand\b/i, 'Policy and demand'],
  [/\bstatus\b|\bready\b|\bwhen\b|\btape[- ]?out|\bshuttle\b|\bprototype/i, 'Status'],
  [/\bfund\w*|\bround\b|\bplan\b/i, 'Where it sits in the plan'],
  [/\bhow does\b|\bhow do\b|\bwhat is\b|\bwhat does\b.*\bdo\b|\bwork\b|\bdetect|\bboot/i, 'What it is'],
];

// "SKU-10 · DG32-Max Secure MCU · What it replaces" + quote -> "SKU-10 DG32-Max Secure MCU, what it replaces: quote"
function frame(e: Evidence): string {
  const parts = e.chunk.section.split(' · ');
  if (parts.length < 3) return e.quote;
  const sec = parts[parts.length - 1];
  return `${parts.slice(0, -1).join(' ')}, ${sec.charAt(0).toLowerCase()}${sec.slice(1)}: ${e.quote}`;
}

export function retrieve(question: string, g: GraphIndexLike, o: RetrieveOpts): Retrieval {
  const q = question.trim();
  // 1. Seeds: named entities first, then the nodes closest in meaning.
  const named = new Map<number, number>();
  for (const {idx, rx} of matchers(g)) if (rx.test(q)) named.set(idx, 1);
  const nodeOrder = g.nodes.map((_, i) => [o.nodeScore(i), i] as const).sort((a, b) => b[0] - a[0]);
  const top = nodeOrder[0]?.[0] || 0;
  const seed = new Map(named);
  for (const [sc, i] of nodeOrder.slice(0, 5)) if (sc > 0 && sc >= top * 0.85 && !seed.has(i)) seed.set(i, 0.6 * (sc / (top || 1)));
  const seeds: Seed[] = [...seed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([i, w]) => ({name: g.nodes[i].name, why: named.has(i) ? 'named in the question' : 'closest in meaning', score: +w.toFixed(2)}));

  // 2. Spread over the confidence-weighted graph. When the question names an entity the graph is strong
  //    evidence of what it is about; when the seeds are only guesses by meaning, it counts for less.
  const pr = o.useGraph === false ? new Float32Array(g.nodes.length) : spread(g, seed);
  let prMax = 0; pr.forEach(v => { if (v > prMax) prMax = v; });
  // (TF-IDF scores run lower and noisier than embedding scores, so a named part weighs more there)
  const graphWeight = named.size ? (o.semantic ? 0.12 : 0.15) : (o.semantic ? 0.05 : 0.03);

  // Content words: what the question asks about, beyond the names of the entities it mentions.
  const nameWords = new Set<string>();
  named.forEach((_, i) => (g.nodes[i].aliases || [g.nodes[i].name]).forEach(a => words(a).forEach(w => nameWords.add(stem(w)))));
  const raw = words(q).filter(w => !STOP.has(w) && w.length > 2);
  const contentPairs = [...new Map(raw.map(w => [stem(w), w] as const)).entries()].filter(([st]) => ![...nameWords].some(n => same(n, st)));
  const content = contentPairs.map(([st]) => st);
  const intents = INTENT.filter(([rx]) => rx.test(q)).map(([, sec]) => sec);

  // 3. Score passages: semantic match, plus the graph score of their entities, plus a small lift for the
  //    handout section the question asks for and for each content word the passage shares.
  const floor = o.semantic ? EVIDENCE_FLOOR.semantic : EVIDENCE_FLOOR.tfidf;
  // A Blueprint handout section belongs to one part ("SKU-1 · BLDC Motor Controller · What it replaces").
  const namedParts = new Set([...named.keys()].map(i => partOf(g.nodes[i])));
  const scored = g.chunks.map((c, i) => {
    const semantic = Math.max(0, o.chunkScore(i));
    let graph = 0; const via: string[] = [];
    for (const e of c.entities || []) {
      const v = prMax ? pr[e] / prMax : 0;
      if (v > graph) graph = v;
      if (v > 0.25 && via.length < 3 && !via.includes(g.nodes[e].name)) via.push(g.nodes[e].name);
    }
    const hay = words(`${c.section} ${c.text}`).map(stem);
    const overlap = content.filter(w => hay.some(h => same(h, w))).length;
    // the handout section only means something once the question names a part
    const own = c.section.includes(' · ') && namedParts.has(c.section.split(' · ')[0]);
    const lift = (named.size && intents.some(t => c.section.endsWith(t)) ? 0.1 : 0) + (own ? 0.08 : 0) + 0.02 * Math.min(overlap, 3);
    return {i, c, semantic, graph, via, overlap, score: semantic + graphWeight * graph + lift};
  });
  const bySem = [...scored].sort((a, b) => b.semantic - a.semantic);
  const byScore = [...scored].sort((a, b) => b.score - a.score);

  // 4. Relevance: clears the floor and shares a content word (or the question has none beyond names).
  // Word matching alone (before the model loads) needs two shared words when the question has them.
  const need = o.semantic ? 1 : Math.min(2, content.length);
  const relevant = (x: typeof scored[number]) => x.semantic >= floor && (content.length === 0 ? x.graph > 0 : x.overlap >= need);

  // Parts the question names, once each (the catalog entry and the Blueprint entity are the same part).
  const parts = new Map<string, number[]>();
  named.forEach((_, i) => { const p = partOf(g.nodes[i]); parts.set(p, [...(parts.get(p) || []), i]); });
  const comparison = parts.size >= 2 && COMPARE.test(q) ? [...parts.keys()] : null;

  const picked: typeof scored = [];
  const seen = new Set<string>();
  const take = (x: typeof scored[number]) => {
    const key = `${x.c.docNum}|${x.c.pageLabel}|${x.c.section}`;
    if (seen.has(key)) return false;
    seen.add(key); picked.push(x); return true;
  };
  if (comparison) {
    // one passage per compared part, through that part's links, preferring its own handout ("What it is")
    for (const [part, idxs] of parts) {
      const own = (x: typeof scored[number]) => (x.c.section.toUpperCase().startsWith(part + ' ') ? 0.1 : 0) + (x.c.section.endsWith('What it is') ? 0.15 : 0);
      const best = [...scored].filter(x => (x.c.entities || []).some(e => idxs.includes(e)) && x.semantic >= floor - (own(x) >= 0.1 ? 0.08 : 0))
        .sort((a, b) => (b.score + own(b)) - (a.score + own(a)))[0];
      if (best) take(best);
    }
  }
  for (const x of byScore) { if (picked.length >= 4) break; if (relevant(x)) take(x); }
  const certQuestion = CERT.test(q);
  const answerable = picked.some(relevant) || (!!comparison && picked.length >= 2);
  if (!picked.length) for (const x of byScore.slice(0, 2)) take(x);   // closest material, labelled as such

  const evidence: Evidence[] = picked.map((x, k) => ({
    n: k + 1, chunk: x.c, quote: bestSentence(x.c.text, content, named, g) || x.c.text.slice(0, 280),
    kind: relevant(x) || (comparison && k < comparison.length) ? 'direct' : 'related',
    semantic: +x.semantic.toFixed(3), graph: +x.graph.toFixed(2), via: x.via}));

  // How much the graph changed the evidence: passages chosen that semantic order alone would not have put first.
  const semTop = new Set(bySem.filter(relevant).slice(0, evidence.length).map(x => x.i));
  const graphChanged = picked.filter(x => !semTop.has(x.i)).length;

  // Trace: the strongest path from a seed to each entity that brought a passage in.
  const seedIdx = [...seed.keys()];
  const hops: Hop[] = []; const hopKey = new Set<string>();
  for (const x of picked) for (const e of x.c.entities || []) {
    if (prMax && pr[e] / prMax > 0.25) for (const h of bestPath(g, seedIdx, e)) {
      const k = `${h.from}|${h.relation}|${h.to}`; if (!hopKey.has(k) && hops.length < 6) { hopKey.add(k); hops.push(h); }
    }
  }

  // 5. Direct answer and limits.
  const CERT_LIMIT = 'No DeepGrid part holds a certification, qualification or approval today. Standards in these documents are design targets, not results.';
  let bluf: string; let blufRefs: number[] = [];
  if (comparison && evidence.length >= 2) {
    const each = evidence.slice(0, comparison.length);
    bluf = each.map((e, k) => `${comparison[k]}: ${e.quote}`).join(' '); blufRefs = each.map(e => e.n);
  }
  else if (certQuestion && !answerable) bluf = CERT_LIMIT;
  else if (!answerable) bluf = 'The sources on this site do not establish an answer to this question. The closest material is below.';
  else {
    // One quoted sentence per thing the question asks (what it replaces, how it works, ...), each framed by
    // the part and handout section it comes from, so the answer reads on its own without the evidence list.
    const direct = evidence.filter(e => e.kind === 'direct');
    const lead = named.size ? intents.map(t => direct.find(e => e.chunk.section.endsWith(t))).filter((e): e is Evidence => !!e) : [];
    const chosen = [...new Set(lead.length ? lead : [direct[0] || evidence[0]])].slice(0, 2);
    bluf = chosen.map(frame).join(' '); blufRefs = chosen.map(e => e.n);
  }

  const limits: string[] = [];
  if (certQuestion) limits.push(CERT_LIMIT);
  const missing = contentPairs.filter(([st]) => !picked.some(x => words(`${x.c.section} ${x.c.text}`).map(stem).some(h => same(h, st)))).map(([, w]) => w);
  if (!answerable && missing.length) limits.push(`No indexed passage addresses ${missing.slice(0, 4).join(', ')}.`);
  if (comparison) {
    const covered = new Set(picked.flatMap(x => (x.c.entities || []).map(e => partOf(g.nodes[e]))));
    for (const part of comparison) if (!covered.has(part)) limits.push(`No passage answers this for ${part}.`);
  }
  if (answerable && evidence.some(e => /\d\s?(MHz|GHz|nm|V|mV|µW|mW|W|kB|KB|MB|ms|µs|%|°C)\b/.test(e.quote)))
    limits.push('Figures are design targets from pre-silicon documents, not measurements of manufactured parts.');

  return {answerable, comparison, byMeaning: !!o.semantic, bluf, blufRefs, evidence, limits, seeds, hops, graphChanged};
}

/** The sentence of a passage that best answers: most content words, then a named entity, then earliest. */
function bestSentence(text: string, content: string[], named: Map<number, number>, g: GraphIndexLike): string {
  const ss = sentences(text);
  if (!ss.length) return '';
  const nameRx = [...named.keys()].flatMap(i => (g.nodes[i].aliases || []).filter(a => a.length > 2));
  let best = ss[0], bestScore = -1;
  ss.forEach((s, k) => {
    const sw = words(s).map(stem);
    const hit = content.filter(w => sw.some(h => h === w || (w.length > 4 && h.startsWith(w)))).length;
    const ent = nameRx.some(a => s.toLowerCase().includes(a.toLowerCase())) ? 0.5 : 0;
    const score = hit * 2 + ent - k * 0.05;
    if (score > bestScore) { bestScore = score; best = s; }
  });
  return best.length > 420 ? best.slice(0, 417).replace(/\s+\S*$/, '') + '…' : best;
}
