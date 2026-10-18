// Ask DeepGrid shows a dashboard panel beside its answer (app/ask-panel.tsx, routed by app/data/dashboard-panels.ts).
// Checks, at 1440 and on a 390px touch phone: a plan question opens the money-flow walks on the year asked, with no
// broken subtotal and working year buttons; a two-chip question narrows the chip chart to those chips; a market
// question opens the use-case card; a reworded question reaches its panel through the semantic stage; a people
// question opens none; every "Open the dashboard" link resolves. The answer service is mocked: this tests the panel,
// not synthesis, and spends no model quota. A build without the plan must open no plan panel.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.argv[2]; if (!base) throw Error('Pass site base URL');
const plan = (await fetch(base + 'plan-data/pl.csv')).ok;
const browser = await chromium.launch(), errors = [];
// a cited answer, as verify-ask.mjs sends: the answer view validates every quote against its source
const chunk = JSON.parse(fs.readFileSync('app/data/graphrag-unified-index.json', 'utf8')).chunks.find(c => c.id === 'bp_track-b-d100-drone-soc-status');
const mock = async route => {
  const h = {'Access-Control-Allow-Origin': new URL(base).origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'};
  if (route.request().method() === 'OPTIONS') return route.fulfill({status: 204, headers: h});
  const claim = {text: 'A mocked answer for the panel test.', kind: 'evidence', support: [{sourceId: chunk.id, quote: chunk.text.slice(0, 100)}]};
  return route.fulfill({status: 200, contentType: 'application/json', headers: h, body: JSON.stringify({model: 'mock', sources: [chunk], answer: {answerable: true, title: 'Mock', lead: claim, sections: [{heading: 'Mock', paragraphs: [claim]}], gaps: []}})});
};

async function open(ctx) {
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.route('https://deepgrid-rerank.shekerkamma.workers.dev/answer', mock);
  await page.goto(base + 'ask/', {waitUntil: 'networkidle'}); await page.locator('[data-ready="true"]').waitFor({state: 'attached'});
  return page;
}
async function ask(page, q) {
  const input = page.getByRole('searchbox', {name: 'Search DeepGrid knowledge'});
  await input.fill(q); await input.press('Enter');
  await page.locator('[data-model="mock"]').waitFor({timeout: 60000});
}
const panel = (page, id) => page.locator(`.ask-panel[data-panel="${id}"]`);
async function linkResolves(page, id, want) {
  const href = await panel(page, id).locator('.ask-panel-open').evaluate(a => a.href);
  assert(href.includes(want), `${id}: dashboard link ${href} should contain ${want}`);
  assert.equal((await page.request.get(href.split('#')[0])).status(), 200, `${id}: ${href} does not resolve`);
}

for (const [label, opts] of [['1440', {viewport: {width: 1440, height: 1000}}], ['390', {viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}]]) {
  const ctx = await browser.newContext(opts), page = await open(ctx), touch = !!opts.hasTouch;
  const press = el => touch ? el.tap() : el.click();

  await ask(page, 'Where does the cash go in FY30?');
  if (plan) {
    await panel(page, 'plan-flow').waitFor();
    assert.equal(await panel(page, 'plan-flow').locator('.pd-year[aria-pressed="true"]').innerText(), 'FY30', `${label}: the year asked is shown`);
    assert.match(await panel(page, 'plan-flow').locator('#pd-plw-h').innerText(), /^In FY30,/);
    assert.equal(await panel(page, 'plan-flow').locator('.wk-break').count(), 0, `${label}: a subtotal does not equal its running sum`);
    await press(panel(page, 'plan-flow').getByRole('button', {name: 'FY31'}));
    assert.match(await panel(page, 'plan-flow').locator('#pd-plw-h').innerText(), /^In FY31,/, `${label}: year buttons switch the walks`);
    await linkResolves(page, 'plan-flow', 'plan?year=FY30#ch-flow');
  } else assert.equal(await page.locator('.ask-panel[data-panel^="plan-"]').count(), 0, 'a build without the plan opened a plan panel');

  await ask(page, 'How much revenue does SKU-3 make compared with SKU-8?');
  await panel(page, 'pf-lines').waitFor();
  assert.deepEqual((await panel(page, 'pf-lines').locator('.sk-row .sk-label').allInnerTexts()).map(t => t.split(' ')[0]).sort(), ['SKU-3', 'SKU-8'], `${label}: the chart shows the two chips asked about`);
  assert.match(await panel(page, 'pf-lines').locator('h3').innerText(), /^By FY31, SKU-\d+ reaches .*; SKU-\d+, \d+/);
  await linkResolves(page, 'pf-lines', 'portfolio#sk-lines-h');

  await ask(page, 'Which markets should DeepGrid sell to first?');
  await panel(page, 'uc-windows').waitFor();
  await linkResolves(page, 'uc-windows', 'portfolio/brief?view=use-cases#uc-revenue');

  // reworded: no phrase rule fires, the semantic stage routes it (the model loads from the site on first use)
  await ask(page, 'Which customers come first?');
  await page.locator('.ask-panel[data-panel="uc-windows"][data-via="semantic"]').waitFor({timeout: 60000});

  await ask(page, 'Who founded DeepGrid?');
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('.ask-panel').count(), 0, `${label}: a people question opened a dashboard panel`);

  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal scroll`);
  await ctx.close();
}
await browser.close();
assert.deepEqual(errors, []);
console.log(`PASS Ask dashboard panels at 1440/390: ${plan ? 'money flow on the year asked with working year buttons, ' : 'no plan panel without the plan, '}two-chip comparison, market card, semantic routing of a reworded question, none for a people question, dashboard links resolve.`);
