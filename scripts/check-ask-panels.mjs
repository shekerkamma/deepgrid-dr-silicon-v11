// Guards the dashboard panels Ask DeepGrid shows beside its answer (app/data/dashboard-panels.ts). No model needed.
//
// Routing is two stages: phrase rules, then semantic similarity to each panel's example questions. The eval is
// scripts/ask-panel-eval.json. This check fails when:
//   - a rule:true question does not open its panel, year and chips from the rules alone
//   - the rules open a wrong panel for any question, or any panel for an expect:null question
//   - a build without the plan could open a plan panel
//   - an example question copies an eval question (the eval would score the examples against themselves)
//   - the panel rows in semantic.bin were built from other examples, or the recorded two-stage eval shows a wrong
//     or forced panel, or falls under its recall floor. Rebuild with: npm run build:semantic
import fs from 'node:fs';
import crypto from 'node:crypto';
import {matchPanel, panelKey, PANEL_EXAMPLES, PANEL_IDS} from '../app/data/dashboard-panels.ts';

const evalSet = JSON.parse(fs.readFileSync('scripts/ask-panel-eval.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync('public/graphrag/semantic.json', 'utf8'));
const opts = {plan: true, years: evalSet.years};
const fail = [];
const same = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);

for (const c of evalSet.cases) {
  const m = matchPanel(c.q, opts);
  if (c.expect === null) { if (m) fail.push(`"${c.q}" opened ${m.id}; it should open nothing`); continue; }
  if (m && m.id !== c.expect) { fail.push(`"${c.q}" opened ${m.id} by rule, expected ${c.expect}`); continue; }
  if (c.rule && !m) { fail.push(`"${c.q}" opened nothing by rule, expected ${c.expect}`); continue; }
  if (m && (m.year !== c.year || !same(m.skus, c.skus))) fail.push(`"${c.q}" opened ${m.id} with ${JSON.stringify({year: m.year, skus: m.skus})}, expected ${JSON.stringify({year: c.year, skus: c.skus})}`);
  const off = matchPanel(c.q, {plan: false});
  if (off?.dashboard === 'plan') fail.push(`"${c.q}" opened ${off.id} in a build without the plan`);
}
if (matchPanel('Where does the cash go in FY45?', opts)?.year) fail.push('FY45 is not a plan year, but was passed to the panel');

const asked = new Set(evalSet.cases.map(c => c.q.trim().toLowerCase()));
for (const [id, qs] of Object.entries(PANEL_EXAMPLES)) for (const q of qs) if (asked.has(q.trim().toLowerCase())) fail.push(`${id} example copies an eval question: "${q}"`);
const thin = PANEL_IDS.filter(id => PANEL_EXAMPLES[id].length < 4);
if (thin.length) fail.push(`fewer than 4 example questions: ${thin.join(', ')}`);

const p = meta.panels;
if (!p || p.keySha256 !== crypto.createHash('sha256').update(panelKey()).digest('hex')) fail.push('the panel example questions changed since the semantic index was built. Run: npm run build:semantic');
else {
  if (p.eval.wrong.length || p.eval.forced.length) fail.push(`recorded panel eval: wrong ${p.eval.wrong.join(' | ')}; forced ${p.eval.forced.join(' | ')}`);
  if (p.eval.right / p.eval.positives < evalSet.minRecall) fail.push(`recorded panel eval: ${p.eval.right}/${p.eval.positives} under the ${evalSet.minRecall} floor`);
}

if (fail.length) { console.error(`Ask panel check: ${fail.length} failure(s)\n  ` + fail.join('\n  ')); process.exit(1); }
const rule = evalSet.cases.filter(c => c.rule).length, none = evalSet.cases.filter(c => c.expect === null).length;
console.log(`Ask panel check: ${rule} questions open their panel by rule, ${none} open none, no plan panel without the plan; ` +
  `with the semantic stage ${p.eval.right}/${p.eval.positives} open the right panel, 0 wrong, 0 forced (min ${p.min} / gap ${p.gap}).`);
