import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.argv[2];
if (!base) throw new Error('Pass site base URL');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + 'ask/', { waitUntil: 'networkidle' });
await page
  .locator('.dr-grounded-answer-wrap[data-semantic="on"]')
  .waitFor({ timeout: 120000 });
const input = page.locator('.dr-ask-input');
await input.fill('How is the D100 drone chip funded?');
await page
  .locator('.dr-grounded-answer-wrap[data-semantic="on"]')
  .waitFor({ timeout: 120000 });
await page.waitForFunction(() =>
  /50 Cr/.test(document.querySelector('.dr-answer-lead')?.textContent || ''),
);
assert.match(await page.locator('.dr-answer-lead').innerText(), /50 Cr/);
await page.locator('.executive-sources summary').click();
for (const a of await page.locator('.executive-sources a').all()) {
  const href = await a.evaluate((a) => a.href);
  assert(href.startsWith(base), href);
  const res = await page.request.get(href);
  assert.equal(res.status(), 200, href);
}
assert.equal(await page.locator('.dr-trace').count(), 0);
assert.equal(await page.locator('.executive-arc>li').count(), 3);
assert(
  !/graph score|PageRank|shared words|Starting points/.test(
    await page.locator('.dr-answer-card').innerText(),
  ),
);
await input.fill('What is the weather in Hyderabad today?');
await page.waitForFunction(
  () =>
    document
      .querySelector('.dr-grounded-answer-wrap')
      ?.getAttribute('data-semantic') === 'on',
);
assert.equal(
  await page
    .locator('.dr-grounded-answer-wrap')
    .getAttribute('data-answerable'),
  'false',
);
await input.fill('What is the difference between SKU-10 and SKU-11?');
await page.waitForFunction(
  () =>
    document
      .querySelector('.dr-grounded-answer-wrap')
      ?.getAttribute('data-semantic') === 'on',
);
assert.match(await page.locator('.executive-arc').innerText(), /SKU-10/);
assert.match(await page.locator('.executive-arc').innerText(), /SKU-11/);
await page.waitForFunction(
  () => !document.querySelector('.executive-sources')?.open,
);
await input.fill('Thirty use cases, no accelerator');
await page.waitForFunction(() =>
  /calculated design scenarios/.test(
    document.querySelector('.dr-answer-lead')?.textContent || '',
  ),
);
assert.equal(await page.locator('.executive-arc>li').count(), 4);
assert.match(await page.locator('.executive-arc').innerText(), /focused pilot/);
await page.locator('.executive-sources summary').click();
assert(
  !/N A V I G A T E Contents|Every entry links to its slide/.test(
    await page.locator('.executive-sources').innerText(),
  ),
);
await page.setViewportSize({ width: 390, height: 844 });
assert(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth + 1,
  ),
);
fs.mkdirSync('work/ask-review', { recursive: true });
await page.screenshot({ path: 'work/ask-review/mobile.png', fullPage: true });
assert.deepEqual(errors, []);
await browser.close();
console.log(
  'PASS Ask: live semantic mode, D100 funding, source URLs, executive narrative, hidden source detail, abstention, comparison and mobile width',
);
