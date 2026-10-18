// Run: node scripts/measure-ask-panels.mjs <questions.json> (cases: [{q, expect}]). Calls the live service; not a build step.
// The full three-stage router on a question set: rules and semantic exactly as the browser runs them, then the
// deployed /panel model stage only for questions they leave unmatched.
import fs from 'node:fs';
import {pipeline, env} from '@huggingface/transformers';
import {matchPanel, panelFromModel, PANEL_IDS} from '../app/data/dashboard-panels.ts';
const meta = JSON.parse(fs.readFileSync('public/graphrag/semantic.json', 'utf8')), bin = new Int8Array(fs.readFileSync('public/graphrag/semantic.bin'));
env.allowRemoteModels = false; env.localModelPath = 'public/models/';
const extract = await pipeline('feature-extraction', meta.model, {dtype: meta.dtype});
const {nodes, chunks, themes, examples, panelExamples} = meta.counts, start = nodes + chunks + themes + examples, dims = meta.dims;
const opts = {plan: true, years: ['FY27','FY28','FY29','FY30','FY31','FY32']};
const set = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).cases, by = {rule: 0, semantic: 0, model: 0};
let right = 0; const wrong = [], forced = [], missed = [];
for (const c of set) {
  const q = (await extract([meta.queryPrefix + c.q], {pooling: 'mean', normalize: true})).data, best = new Float32Array(PANEL_IDS.length).fill(-1);
  for (let k = 0; k < panelExamples; k++) { let d = 0; const o = (start + k) * dims; for (let j = 0; j < dims; j++) d += q[j] * bin[o + j]; d /= meta.scale; const p = meta.panelExampleOf[k]; if (d > best[p]) best[p] = d; }
  let m = matchPanel(c.q, {...opts, sem: {scores: best, min: meta.panels.min, gap: meta.panels.gap}});
  if (!m) {
    const r = await fetch('https://deepgrid-rerank.shekerkamma.workers.dev/panel', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'http://127.0.0.1:8768'}, body: JSON.stringify({question: c.q})});
    m = r.ok ? panelFromModel((await r.json()).panel, c.q, opts) : null; await new Promise(z => setTimeout(z, 2200));
  }
  if (m) by[m.via]++;
  const tag = m ? `${m.id} [${m.via}]` : 'none';
  if (c.expect === null) { if (m) forced.push(`${c.q} -> ${tag}`); } else if (m?.id === c.expect) right++; else if (m) wrong.push(`${c.q} -> ${tag} (want ${c.expect})`); else missed.push(c.q);
}
const pos = set.filter(c => c.expect).length;
console.log(`pipeline: right ${right}/${pos}, wrong ${wrong.length}, forced ${forced.length}/${set.length - pos}; decided by rule ${by.rule}, semantic ${by.semantic}, model ${by.model}`);
for (const [k, v] of Object.entries({wrong, forced, missed})) for (const x of v) console.log(`  ${k}: ${x}`);
