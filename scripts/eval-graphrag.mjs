// Graph-guided retrieval eval for Ask DeepGrid: runs every case in scripts/ask-graphrag-eval.json through the
// real engine with real question embeddings (the same int8 rows the browser scores), checks the evidence, and
// measures what the graph contributes by re-running each case with graph spreading switched off.
//
//   node scripts/eval-graphrag.mjs            report, exit 1 on any failed case
//   node scripts/eval-graphrag.mjs --verbose  also print every answer and its evidence
//
// npm run build:semantic runs it and records the result in public/graphrag/semantic.json, which
// scripts/check-semantic.mjs verifies on every build without loading the model.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import * as esbuild from 'esbuild';
import {pipeline, env} from '@huggingface/transformers';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');

export async function runGraphEval({extract, quiet = false} = {}) {
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/graphrag/semantic.json'), 'utf8'));
  const bin = new Int8Array(fs.readFileSync(path.join(ROOT, 'public/graphrag/semantic.bin')).buffer.slice(0));
  if (!extract) {
    env.allowRemoteModels = false; env.localModelPath = path.join(ROOT, 'public/models') + '/';
    extract = await pipeline('feature-extraction', meta.model, {dtype: meta.dtype});
  }
  const bundled = path.join(ROOT, 'node_modules/.cache/graphrag-eval.mjs');
  await esbuild.build({stdin: {contents: `export {executeGraphRAG} from './app/data/graphrag-engine.ts';`, resolveDir: ROOT, loader: 'ts'},
    bundle: true, platform: 'node', format: 'esm', outfile: bundled, logLevel: 'warning'});
  const {executeGraphRAG} = await import(pathToFileURL(bundled).href + '?t=' + Date.now());
  const {nodes: N, chunks: C, themes: T, examples: X = 0} = meta.counts, dims = meta.dims;
  const row = (qv, r) => { let d = 0; for (let c = 0; c < dims; c++) d += qv[c] * bin[r * dims + c]; return d / meta.scale; };
  const scoresFor = qv => {
    const themes = Float32Array.from({length: T}, (_, i) => row(qv, N + C + i));
    (meta.exampleTheme || []).forEach((t, k) => { themes[t] = Math.max(themes[t], row(qv, N + C + T + k)); });
    return {nodes: Float32Array.from({length: N}, (_, i) => row(qv, i)), chunks: Float32Array.from({length: C}, (_, i) => row(qv, N + i)),
      themes, themeMin: meta.themeMin, themeGap: meta.themeGap};
  };
  const set = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/ask-graphrag-eval.json'), 'utf8'));
  const failures = []; let graphMoved = 0;
  for (const c of set.cases) {
    const qv = (await extract([(meta.queryPrefix || '') + c.q], {pooling: 'mean', normalize: true})).data;
    const sc = scoresFor(qv);
    const r = executeGraphRAG(c.q, sc).retrieval;
    const off = executeGraphRAG(c.q, sc, {graph: false}).retrieval;
    // the same question before the model loads (word matching): it must not answer what it cannot
    const kw = executeGraphRAG(c.q, null).retrieval;
    if (c.answerable !== undefined && kw.answerable !== c.answerable) failures.push(`${c.q}\n      word matching: answerable ${kw.answerable}, expected ${c.answerable}`);
    const order = x => x.evidence.map(e => e.chunk.id).join('|');
    if (order(r) !== order(off)) graphMoved++;
    const why = [];
    if (c.answerable !== undefined && r.answerable !== c.answerable) why.push(`answerable ${r.answerable}, expected ${c.answerable}`);
    if (c.section && !(r.evidence[0]?.chunk.section || '').startsWith(c.section)) why.push(`first evidence "${r.evidence[0]?.chunk.section}", expected ${c.section}`);
    if (c.quote && !r.evidence.some(e => e.chunk.text.includes(c.quote))) why.push(`no evidence passage contains "${c.quote}"`);
    if (c.compare) {
      if (!r.comparison) why.push('not treated as a comparison');
      for (const code of c.compare) if (!r.evidence.some(e => new RegExp(`\\b${code}(?!\\d)`).test(`${e.chunk.section} ${e.chunk.text}`))) why.push(`no evidence for ${code}`);
    }
    if (c.limit === 'certification' && !r.limits.some(l => /certification/.test(l))) why.push('no certification limit stated');
    if (why.length) failures.push(`${c.q}\n      ${why.join('\n      ')}`);
    if (verbose) {
      console.log(`\n? ${c.q}\n  ${r.answerable ? 'ANSWER' : 'NOT ESTABLISHED'}: ${r.bluf}`);
      r.evidence.forEach(e => console.log(`  [${e.n}] ${e.kind} sem ${e.semantic} graph ${e.graph} | ${e.chunk.section} ${e.chunk.pageLabel}`));
      r.limits.forEach(l => console.log(`  limit: ${l}`));
    }
  }
  const failedCases = new Set(failures.map(f => f.split('\n')[0]));
  const result = {cases: set.cases.length, passed: set.cases.length - failedCases.size, graphMoved, codeSha256: retrievalCodeSha()};
  if (!quiet) {
    console.log(`graphrag eval: ${result.passed}/${result.cases} cases pass; graph spreading changes the evidence in ${graphMoved}/${result.cases}`);
    if (failures.length) console.log('  failed:\n    ' + failures.join('\n    '));
  }
  return {...result, failures};
}

/** Hash of the retrieval code and the eval cases: a change to either means the recorded eval is stale. */
export function retrievalCodeSha() {
  const h = crypto.createHash('sha256');
  for (const f of ['app/data/graph-retrieval.ts', 'app/data/graphrag-engine.ts', 'scripts/ask-graphrag-eval.json']) h.update(fs.readFileSync(path.join(ROOT, f)));
  return h.digest('hex');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await runGraphEval();
  process.exit(r.failures.length ? 1 : 0);
}
