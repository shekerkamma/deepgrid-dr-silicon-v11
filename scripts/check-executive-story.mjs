import * as esbuild from 'esbuild';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const output = path.resolve('node_modules/.cache/story-check.mjs');
await esbuild.build({
  stdin: {
    contents:
      "export {executeGraphRAG} from './app/data/graphrag-engine';export {executiveAnswer} from './app/data/executive-answer';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: output,
});
const { executeGraphRAG, executiveAnswer } = await import(
  pathToFileURL(output)
);
const ask = (q) => executiveAnswer(q, executeGraphRAG(q).retrieval);
const funding = ask('How is the D100 drone chip funded?');
assert.match(funding.answer, /separate.*50 Cr/);
assert(funding.sources.some((c) => c.text.includes('50 Cr')));
assert.match(funding.beats[0].title, /investment/i);
for (const q of [
  'What does SKU-10 DG32-Max replace?',
  'What does SKU-1 replace?',
  'What is the difference between SKU-10 and SKU-11?',
]) {
  const a = ask(q);
  assert(a.supported, q);
  assert(a.beats.length >= 3);
  assert(a.sources.length >= 2);
  assert(
    !/PageRank|TF-IDF|seed entities|graph score|semantic match/i.test(
      JSON.stringify(a),
    ),
  );
  for (const n of [...a.answerRefs, ...a.beats.flatMap((b) => b.refs)])
    assert(a.sources[n - 1]);
}
for (const q of [
  'Thirty use cases, no accelerator',
  'Can DG32-LITE work without an AI accelerator?',
]) {
  const a = ask(q);
  assert(a.supported, q);
  assert.match(a.title, /machine diagnostics/);
  assert.match(a.answer, /calculated design scenarios/);
  assert.equal(a.beats.length, 4);
  assert(a.sources.every((c) => !/_p[12]$/.test(c.id)));
  assert(
    a.sources.some((c) => c.text.includes('not been measured on silicon')),
  );
  assert(
    a.sources.some((c) =>
      c.text.includes('No workload here has been compiled'),
    ),
  );
}
assert(!ask('What is the weather in Hyderabad today?').supported);
assert(!ask('What is SKU-99?').supported);
const r = JSON.parse(fs.readFileSync('app/executive-routes.json', 'utf8'));
const ids = [
  ...fs.readFileSync('app/routes.ts', 'utf8').matchAll(/\{id: '([^']+)'/g),
].map((m) => m[1]);
assert.equal(ids.length, 37);
for (const id of ids) {
  assert(r[id], id);
  assert(r[id].headline && r[id].context && r[id].decision && r[id].next, id);
}
console.log(
  'PASS executive story: 37 route storyboards, grounded funding, product value, comparisons, abstention and source references.',
);
