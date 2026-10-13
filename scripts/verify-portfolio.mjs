// /portfolio interaction check, the /plan check's sibling (scripts/verify-plan.mjs).
// At desktop and on a phone tap: every chart's first, middle and last mark shows a tooltip that sits fully inside
// its chart and the screen and carries a figure; the page never scrolls sideways; on desktop a CSV link downloads
// a table with its header, and a bar takes keyboard focus with a visible outline.
import {chromium} from 'playwright';
import fs from 'node:fs';
const base = process.argv[2];
if (!base) throw new Error('Pass the base URL');
const url = base.replace(/\/?$/, '/') + 'portfolio';
const browser = await chromium.launch();
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

for (const [w, touch] of [[1440, false], [390, true]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: 900}, hasTouch: touch, isMobile: touch, acceptDownloads: true});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url, {waitUntil: 'networkidle'});
  check(await page.locator('.pd-root').count() === 1, `${w}: no dashboard`);
  // ai-analyst structure: a verdict, What the data says (four findings), chapters named as questions.
  check(/chips carry \d+\s%\sof the FY31 ramp/.test(await page.locator('.pd-head h2').innerText()), `${w}: verdict missing`);
  check(await page.locator('.dg-ins').count() === 4, `${w}: expected four findings under What the data says`);
  check(await page.locator('.dg-chapter').count() === 5, `${w}: expected five chapters`);
  const figs = page.locator('.pd-root figure');
  const nf = await figs.count();
  check(nf === 5, `${w}: expected five charts, found ${nf}`);
  for (let fi = 0; fi < nf; fi++) {
    const fig = figs.nth(fi);
    const marks = fig.locator('.sk-bar, rect[height]:not([height="0"])');
    const sizes = await marks.evaluateAll(ms => ms.map(m => { const r = m.getBoundingClientRect(); return Math.min(r.width, r.height); }));
    const ok = sizes.map((s, i) => [s, i]).filter(([s]) => s >= 4).map(([, i]) => i);
    check(ok.length > 0, `${w} chart ${fi}: no mark a reader can point at`);
    for (const i of [...new Set([ok[0], ok[Math.floor(ok.length / 2)], ok[ok.length - 1]])]) {
      if (i == null) continue;
      const m = marks.nth(i);
      await m.scrollIntoViewIfNeeded();
      if (touch) await m.tap(); else await m.hover();
      await page.waitForTimeout(120);
      const tip = fig.locator('.pd-tip').first();
      if (!(await tip.count())) { fails.push(`${w} chart ${fi} mark ${i}: no tooltip`); continue; }
      const [t, f, vw] = await Promise.all([tip.boundingBox(), fig.boundingBox(), page.evaluate(() => innerWidth)]);
      check(t.x >= f.x - 1 && t.x + t.width <= f.x + f.width + 1, `${w} chart ${fi} mark ${i}: tooltip outside its chart`);
      check(t.x >= 0 && t.x + t.width <= vw + 1, `${w} chart ${fi} mark ${i}: tooltip off screen`);
      check(/\d/.test(await tip.innerText()), `${w} chart ${fi} mark ${i}: tooltip has no figure`);
    }
  }
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  check(sw[0] <= sw[1] + 1, `${w}: page scrolls sideways (${sw[0]} > ${sw[1]})`);
  if (!touch) {
    const link = page.locator('a.pd-link[download]').first(); await link.scrollIntoViewIfNeeded();
    const [dl] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const text = fs.readFileSync(await dl.path(), 'utf8');
    check(/^sku,name,/.test(text) && text.trim().split('\n').length >= 12, `download ${dl.suggestedFilename()} is not the SKU table`);
    // Reached by Tab, as a keyboard reader reaches it: focus() from script after a mouse click is not :focus-visible.
    await page.locator('#sk-lines-h').scrollIntoViewIfNeeded(); await page.locator('#sk-lines-h').click();
    let onBar = false;
    for (let i = 0; i < 40 && !onBar; i++) { await page.keyboard.press('Tab'); onBar = await page.evaluate(() => !!document.activeElement?.classList.contains('sk-bar')); }
    check(onBar, 'keyboard never reaches a bar');
    if (onBar) check(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'a focused bar has no outline');
    check(await page.locator('.sk-bars .pd-tip').count() > 0, 'focusing a bar shows no tooltip');
  }
  check(!errs.length, `${w}: page errors: ${errs.join(' | ')}`);
  console.log(`${w}: ${nf} charts, tooltips${touch ? ' (tap)' : ', download, keyboard'} checked`);
  await ctx.close();
}
// The brief (/portfolio/brief): both tabs switch and carry their content; no sideways scroll on a phone.
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({viewport: {width: w, height: 900}});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base.replace(/\/?$/, '/') + 'portfolio/brief', {waitUntil: 'networkidle'});
  const tabs = page.getByRole('tab');
  check(await tabs.count() === 3, `brief ${w}: expected investor, buyer and implementation tabs`);
  // A dashboard, not text: headline tiles, charts and cards on each tab.
  const panel = page.locator('[role=tabpanel]');
  check(/925/.test(await panel.innerText()), `brief ${w}: the tranche-1 tab does not show the nine chips' plan lines`);
  check(await panel.locator('.dg-ins').count() === 4 && await panel.locator('.dg-chapter').count() === 3, `brief ${w}: tranche tab needs four findings and three chapters`);
  check(await panel.locator('figure').count() >= 5, `brief ${w}: tranche tab needs at least five charts`);
  check(await panel.locator('.bf-card').count() === 5, `brief ${w}: tranche tab needs five question cards`);
  const col = panel.locator('figure rect.sk-col').nth(2);
  await col.scrollIntoViewIfNeeded(); await col.hover({force: true}); await page.waitForTimeout(120);
  const fig = panel.locator('figure', {has: page.locator('rect.sk-col')}).first(), tip = fig.locator('.pd-tip');
  if (await tip.count()) { const [t, f] = [await tip.boundingBox(), await fig.boundingBox()]; check(t.x >= f.x - 1 && t.x + t.width <= f.x + f.width + 1, `brief ${w}: column tooltip outside its chart`); }
  else fails.push(`brief ${w}: hovering a column shows no tooltip`);
  await tabs.nth(1).click();
  check(await tabs.nth(1).getAttribute('aria-selected') === 'true', `brief ${w}: the buyer tab did not open`);
  check(await panel.locator('.bf-matrix tbody tr').count() === 6, `brief ${w}: buyer tab needs the six-row readiness matrix`);
  check(await panel.locator('.dg-ins').count() === 4 && await panel.locator('.dg-chapter').count() === 3, `brief ${w}: buyer tab needs four findings and three chapters`);
  check(await panel.locator('figure').count() >= 1 && await panel.locator('.bf-card').count() === 6, `brief ${w}: buyer tab needs a chart and six cards`);
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  check(sw[0] <= sw[1] + 1, `brief ${w}: page scrolls sideways`);
  check(!errs.length, `brief ${w}: page errors: ${errs.join(' | ')}`);
  console.log(`brief ${w}: tabs and content checked`);
  await ctx.close();
}
await browser.close();
if (fails.length) { console.error(fails.join('\n')); console.error(`${fails.length} /portfolio check(s) failed.`); process.exit(1); }
console.log('/portfolio: all interaction checks pass');
