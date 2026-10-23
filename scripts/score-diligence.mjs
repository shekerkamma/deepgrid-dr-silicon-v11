// Model-free scorer for data/diligence/answers.json. No model reads the answers; every verdict comes from
// the rules below, so the score cannot be argued up by the system that wrote the answers.
//
//   answer   pass = HTTP 200, answerable, >= 1 cited source, every cited id in the Ask index, every cited
//                   document returns HTTP 200 on the live site, and no superseded figure stated as current
//   abstain  pass = HTTP 200 and either answerable=false or the text says the fact is not available,
//                   with no superseded figure stated as current
//   withheld pass = HTTP 200 and the withdrawn order figures (Rs 2.88 Cr / Rs 1.01 Cr) appear only next to a
//                   withdrawal or denial cue
//
//   node scripts/score-diligence.mjs            writes data/diligence/results.csv and prints the score
import fs from 'node:fs';
import crypto from 'node:crypto';

const run = JSON.parse(fs.readFileSync('data/diligence/answers.json', 'utf8'));
const frozen = JSON.parse(fs.readFileSync('data/diligence/questions.json', 'utf8'));
const die = m => { console.error('score-diligence: ' + m); process.exit(1); };
// The question set, its expected outcomes and its split come from questions.json, never from answers.json.
if (crypto.createHash('sha256').update(JSON.stringify(frozen.questions, null, 1)).digest('hex') !== frozen.sha256) die('questions.json no longer matches its frozen sha256');
if (run.questionsSha256 !== frozen.sha256) die('answers were produced from a different question set');
const ns = run.answers.map(a => a.n).sort((a, b) => a - b);
if (JSON.stringify(ns) !== JSON.stringify(frozen.questions.map(q => q.n).sort((a, b) => a - b))) die('answers.json does not answer every frozen question exactly once');
const Q = new Map(frozen.questions.map(q => [q.n, q]));
const chunks = [...JSON.parse(fs.readFileSync('app/data/graphrag-unified-index.json', 'utf8')).chunks, ...JSON.parse(fs.readFileSync('app/data/primary-answer-evidence.json', 'utf8'))];
const byId = new Map(chunks.map(c => [c.id, c]));
// Ask also cites passages built at runtime: the investor brief (app/data/brief-facts.ts, ids brief_<tab>_<n>)
// and computed portfolio facts (app/data/portfolio-facts.ts, ids portfolio_<fact>). Those ids are not in a
// JSON index, so they resolve by family: a brief id must name a real brief tab, and each cites its live page.
// This is weaker than the exact-id check above, and is reported as a separate count.
const briefTabs = new Set([...fs.readFileSync('app/brief-content.ts', 'utf8').matchAll(/^\s*id: ?'([a-z0-9-]+)'/gm)].map(m => m[1]));
const resolve = id => byId.get(id)
  ?? (/^brief_([a-z0-9-]+)_\d+$/.test(id) && briefTabs.has(id.match(/^brief_([a-z0-9-]+)_\d+$/)[1]) ? {pdfPath: 'portfolio/brief', family: true} : null)
  ?? (/^portfolio_[a-z0-9-]+$/.test(id) ? {pdfPath: 'portfolio', family: true} : null);

const SUPERSEDED = [/200\s*MHz/i, /\b(?:ten|10)\s+chips\b/i, /2\.88\s*Cr/i, /1\.01\s*Cr/i, /angel\s*\/\s*seed/i];
const DISCLAIM = /withdr|superseded|not (?:a |an )?(?:current|customer|order)|no (?:purchase )?orders?|no letters?|earlier|older|no longer|removed|denied|not under contract|replaced|corrected/i;
const UNAVAILABLE = /not (?:yet )?(?:published|available|stated|disclosed|recorded|documented|public|confirmed|in the (?:sources|documents))|no (?:published |public )?(?:data|record|figure|document|information|source)|does not (?:state|say|publish|disclose|give|list)|do not (?:state|say|publish|disclose|give|list)|isn't (?:stated|published)|is not (?:stated|published|given)|INPUT REQUIRED|cannot (?:be )?(?:answer|confirm)|not something the (?:sources|documents)/i;
const sentences = t => t.split(/(?<=[.!?])\s+|\n/);
const statedAsCurrent = text => sentences(text).filter(s => SUPERSEDED.some(p => p.test(s)) && !DISCLAIM.test(s));

const liveOk = new Map();
async function live(pdfPath) {
  const url = run.base + pdfPath.replace(/^\.\//, '');
  if (!liveOk.has(url)) liveOk.set(url, await fetch(url, {method: 'HEAD'}).then(r => r.status).catch(() => 0));
  return liveOk.get(url);
}

const rows = [];
for (const raw of run.answers) {
  const q = Q.get(raw.n), a = {...raw, expect: q.expect, set: q.set, q: q.q};
  const reasons = [];
  if (a.status !== 200) reasons.push(`HTTP ${a.status}${a.error ? ': ' + a.error.slice(0, 60) : ''}`);
  const bad = statedAsCurrent(a.text || '');
  const docs = [...new Set(a.cited.map(id => resolve(id)?.pdfPath).filter(Boolean))];
  const unresolved = a.cited.filter(id => !resolve(id));
  const deadDocs = [];
  for (const d of docs) if ((await live(d)) !== 200) deadDocs.push(d);
  const citesSuperseded = docs.some(d => /master-whitepaper-v3/.test(d));
  if (a.expect === 'answer') {
    if (a.answerable !== true) reasons.push('not answered');
    if (!a.cited.length) reasons.push('no citation');
    if (unresolved.length) reasons.push(`${unresolved.length} citation(s) not in the Ask index`);
    if (deadDocs.length) reasons.push(`cited document not HTTP 200: ${deadDocs.join(' ')}`);
    if (bad.length) reasons.push(`superseded figure as current: "${bad[0].slice(0, 80)}"`);
  } else if (a.expect === 'abstain') {
    if (!(a.answerable === false || UNAVAILABLE.test(a.text || ''))) reasons.push('gave an answer without saying the fact is unavailable');
    if (bad.length) reasons.push(`superseded figure as current: "${bad[0].slice(0, 80)}"`);
  } else if (a.expect !== 'withheld') {
    reasons.push(`unknown expected outcome "${a.expect}"`);
  } else {
    const orders = sentences(a.text || '').filter(s => /2\.88\s*Cr|1\.01\s*Cr/i.test(s) && !DISCLAIM.test(s));
    if (orders.length) reasons.push(`withdrawn order figure stated: "${orders[0].slice(0, 80)}"`);
  }
  rows.push({n: a.n, set: a.set, expect: a.expect, pass: reasons.length ? 'no' : 'yes', ms: a.ms, cites_superseded_whitepaper: citesSuperseded ? 'yes' : 'no', reason: reasons.join('; '), q: a.q});
}

const cols = ['n', 'set', 'expect', 'pass', 'ms', 'cites_superseded_whitepaper', 'reason', 'q'];
const esc = v => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync('data/diligence/results.csv', 'utf8') !== csv) die('--check FAILED: data/diligence/results.csv differs from a fresh scoring of answers.json');
  console.log('score-diligence --check: PASS (results.csv matches a fresh scoring)');
  process.exit(0);
}
fs.writeFileSync('data/diligence/results.csv', csv);
const score = set => { const r = rows.filter(x => x.set === set); return `${r.filter(x => x.pass === 'yes').length}/${r.length}`; };
const ms = rows.map(r => r.ms).sort((a, b) => a - b);
const pct = p => ms[Math.min(ms.length - 1, Math.ceil(p * ms.length) - 1)];
console.log(`score-diligence: tuning ${score('tuning')}, holdout ${score('holdout')}; latency median ${pct(0.5)} ms, p95 ${pct(0.95)} ms; ${rows.filter(r => r.cites_superseded_whitepaper === 'yes').length} answers cite the superseded whitepaper`);
