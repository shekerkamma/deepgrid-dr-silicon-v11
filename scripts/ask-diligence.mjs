// Runs the frozen diligence questions (data/diligence/questions.json) through the live Ask page, the way
// qa/live-ask-probe.mjs does, and stores the raw answers in data/diligence/answers.json for the model-free
// scorer (scripts/score-diligence.mjs). Paid: one Worker answer call per question; the Worker allows 12/min.
//
//   node scripts/ask-diligence.mjs [base-url]
import {chromium} from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';

const base = process.argv[2] || 'https://shekerkamma.github.io/deepgrid-dr-silicon-v11/';
const frozen = JSON.parse(fs.readFileSync('data/diligence/questions.json', 'utf8'));
const body = JSON.stringify(frozen.questions, null, 1);
if (crypto.createHash('sha256').update(body).digest('hex') !== frozen.sha256) {
  console.error('ask-diligence: questions.json no longer matches its frozen sha256; the question set was edited');
  process.exit(1);
}
const browser = await chromium.launch();
const out = [];
for (const item of frozen.questions) {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + 'ask', {waitUntil: 'load', timeout: 90000});
  await page.locator('[data-ready="true"]').waitFor({state: 'attached', timeout: 120000});
  await page.getByRole('searchbox', {name: 'Search DeepGrid knowledge'}).fill(item.q);
  const t0 = Date.now();
  let status = 0, answer = {}, error;
  try {
    const [res] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith('/answer') && r.request().method() === 'POST', {timeout: 150000}),
      page.getByRole('button', {name: 'Submit', exact: true}).click(),
    ]);
    status = res.status();
    const b = await res.json().catch(async () => ({error: await res.text()}));
    answer = b.answer || {}; error = b.error;
  } catch (e) { error = String(e).slice(0, 300); }
  const ms = Date.now() - t0;
  const support = [answer.lead, ...(answer.sections || []).flatMap(x => x.paragraphs || [])].filter(Boolean).flatMap(p => (p.support || []).map(s => s.sourceId));
  const text = [answer.title, answer.lead?.text, ...(answer.sections || []).flatMap(s => [s.heading, ...(s.paragraphs || []).map(p => p.text)]), ...(answer.gaps || [])].filter(Boolean).join('\n');
  out.push({n: item.n, set: item.set, expect: item.expect, q: item.q, status, ms, answerable: answer.answerable ?? null, cited: [...new Set(support)], text, gaps: answer.gaps || [], error: error ?? null, pageErrors: errors});
  console.log(`${String(item.n).padStart(2)} ${status} ${String(ms).padStart(6)}ms answerable=${String(answer.answerable).padEnd(9)} cited=${support.length} ${item.expect}`);
  await page.close();
  await new Promise(r => setTimeout(r, 5500)); // stay under the Worker's 12 answers per minute
}
await browser.close();
fs.writeFileSync('data/diligence/answers.json', JSON.stringify({base, ran: new Date().toISOString(), questionsSha256: frozen.sha256, answers: out}, null, 1) + '\n');
console.log(`ask-diligence: ${out.length} answers written to data/diligence/answers.json`);
