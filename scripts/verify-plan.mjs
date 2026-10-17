// /plan interaction check. Added 2026-10-12 after a live UI pass found the margin chart's tooltip clipped above its
// plot, which no layout, text-fit or axe check had caught: they never hover.
// With figures (DGS_PLAN or DGS_INTERNAL build): every chart's tooltip, hovered at both ends and the middle, must
// sit fully inside its figure and the viewport, at desktop and on a phone tap; a CSV link must download a table;
// a source link must take keyboard focus with a visible outline. Without figures: the notice must render.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base = process.argv[2];
if (!base) throw new Error('Pass the base URL');
const url = base.replace(/\/?$/, '/') + 'plan';
const browser = await chromium.launch();
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

async function inside(page, figure, label) {
  const tip = figure.locator('.pd-tip').first();
  if (!(await tip.count())) { fails.push(`${label}: no tooltip`); return; }
  const [t, f, vw] = await Promise.all([tip.boundingBox(), figure.boundingBox(), page.evaluate(() => innerWidth)]);
  check(t.x >= f.x - 1 && t.x + t.width <= f.x + f.width + 1 && t.y >= f.y - 1, `${label}: tooltip outside its chart (${Math.round(t.x)},${Math.round(t.y)} ${Math.round(t.width)}x${Math.round(t.height)} vs ${Math.round(f.x)},${Math.round(f.y)} ${Math.round(f.width)})`);
  check(t.x >= 0 && t.x + t.width <= vw + 1, `${label}: tooltip off screen`);
}

for (const [w, touch] of [[1440, false], [390, true]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: 900}, hasTouch: touch, isMobile: touch, acceptDownloads: true});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url, {waitUntil: 'networkidle'});
  if (!(await page.locator('.pd-root').count())) {
    assert(await page.locator('.pd-unavailable h2').count(), 'no dashboard and no notice');
    console.log(`${w}: notice only (no plan figures in this build)`); await ctx.close(); continue;
  }
  check(await page.locator('.dg-ins').count() === 4 && await page.locator('.dg-chapter').count() === 6, `${w}: expected four findings and six chapters`);
  const figs = page.locator('.pd-root figure:has(svg)');
  assert.equal(await figs.count(), 3, 'expected three SVG charts');
  // Money flow (2026-10-17): both walk-downs close on screen for every year, and their tooltips stay inside.
  const walks = page.locator('.pd-root figure .wk');
  check(await walks.count() === 2, `${w}: expected two walk-downs`);
  check(!(await page.locator('.wk-break').count()), `${w}: a walk-down does not close`);
  const years = page.locator('.pd-year');
  for (let k = 0; k < await years.count(); k++) {
    // Tap on the phone: a mouse click there leaves an emulated pointer that Chrome moves back after each later
    // tap, firing mouseleave on the chart and clearing its tooltip (2026-10-17; a real phone has no pointer).
    if (touch) await years.nth(k).tap(); else await years.nth(k).click();
    await page.waitForTimeout(60);
    check(!(await page.locator('.wk-break').count()), `${w}: walk-down does not close in year ${k}`);
  }
  for (let k = 0; k < 2; k++) {
    const fig = page.locator('.pd-root figure:has(.wk)').nth(k), bar = fig.locator('.sk-bar').last();
    await bar.scrollIntoViewIfNeeded(); if (touch) await bar.tap(); else await bar.hover(); await page.waitForTimeout(120);
    await inside(page, fig, `${w} walk ${k}`);
  }
  // 14px floor at 1:1: the smallest rendered chart label, measured in the browser.
  const minText = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.pd-root svg text, .pd-root .sk-label, .pd-root .sk-end')].map(e => {
    const px = parseFloat(getComputedStyle(e).fontSize), svg = e.ownerSVGElement;
    return svg ? px * svg.getBoundingClientRect().width / svg.viewBox.baseVal.width : px;
  })));
  check(minText >= 13.5, `${w}: chart text renders at ${minText.toFixed(1)}px, below the 14px floor`);
  for (const [fi, name] of [[0, 'segments'], [2, 'cash']]) {
    // Only marks a reader can point at: a segment worth ₹0.1 Cr is 0 px tall at this scale and cannot be hovered.
    const fig = figs.nth(fi), rects = fig.locator('rect[height]:not([height="0"])');
    const hs = await rects.evaluateAll(rs => rs.map(r => r.getBoundingClientRect().height));
    const visible = hs.map((h, i) => [h, i]).filter(([h]) => h >= 4).map(([, i]) => i);
    const n = visible.length;
    for (const i of [visible[0], visible[Math.floor(n / 2)], visible[n - 1]]) {
      await rects.nth(i).scrollIntoViewIfNeeded();
      if (touch) await rects.nth(i).tap(); else await rects.nth(i).hover();
      await page.waitForTimeout(120);
      await inside(page, fig, `${w} ${name} mark ${i}`);
      check(/₹/.test(await fig.locator('.pd-tip').first().innerText().catch(() => '')), `${w} ${name} mark ${i}: tooltip has no figure`);
    }
  }
  if (!touch) {
    const fig = figs.nth(1), svg = fig.locator('svg');
    await svg.scrollIntoViewIfNeeded(); const b = await svg.boundingBox();
    for (const frac of [0.08, 0.5, 0.99]) {
      await page.mouse.move(b.x + b.width * frac, b.y + b.height / 2); await page.waitForTimeout(120);
      await inside(page, fig, `${w} margins at ${frac}`);
      check((await fig.locator('.pd-tip span').count()) === 4, `${w} margins at ${frac}: tooltip is not year + three margins`);
    }
    const link = page.locator('a.pd-link[download]').first(); await link.scrollIntoViewIfNeeded();
    const [dl] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const fs = await import('node:fs'); const text = fs.readFileSync(await dl.path(), 'utf8');
    check(/^\w+,FY2027,/.test(text) && text.trim().split('\n').length >= 3, `download ${dl.suggestedFilename()} is not a plan table`);
    await page.focus('body'); let focused = false;
    for (let i = 0; i < 120 && !focused; i++) { await page.keyboard.press('Tab'); focused = await page.evaluate(() => document.activeElement?.classList.contains('pd-link')); }
    check(focused, 'keyboard never reaches a source link');
    if (focused) check(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'focused source link has no outline');
  }
  check(!errs.length, `${w}: page errors: ${errs.join(' | ')}`);
  console.log(`${w}: charts, tooltips${touch ? ' (tap)' : ', download, keyboard'} checked`);
  await ctx.close();
}
await browser.close();
if (fails.length) { console.error(fails.join('\n')); console.error(`${fails.length} /plan check(s) failed.`); process.exit(1); }
console.log('/plan: all interaction checks pass');
