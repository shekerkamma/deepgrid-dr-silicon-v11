// /applications task families as tabs (app/applications-story.tsx FamilyTabs): four tabs, one family shown at a time,
// all thirty tasks still in the document, and every in-page link to a family or a task opens the family that holds it.
import {chromium} from 'playwright';
const base = process.argv[2];
if (!base) throw new Error('Pass the base URL');
const page0 = base.replace(/\/?$/, '/') + 'applications';
const browser = await chromium.launch();
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
for (const [w, touch] of [[1440, false], [390, true]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: 900}, hasTouch: touch, isMobile: touch});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(page0, {waitUntil: 'networkidle'});
  const tabs = page.locator('.st-fam-tablist [role=tab]');
  check(await tabs.count() === 4, `${w}: expected four family tabs`);
  check(await page.locator('.st-fam-panel .st-task').count() === 30, `${w}: all thirty tasks stay in the document`);
  const shown = () => page.locator('.st-fam-panel:not([hidden])');
  check(await shown().count() === 1, `${w}: exactly one family shown`);
  // Clicking a tab switches the panel.
  await tabs.nth(2).scrollIntoViewIfNeeded(); await tabs.nth(2).click();
  check(await tabs.nth(2).getAttribute('aria-selected') === 'true' && (await shown().getAttribute('id')) === await page.locator('.st-fam-panel').nth(2).getAttribute('id'), `${w}: tab click opens its family`);
  // Each tab's aria-controls names a panel that exists (the anchor id lives inside the panel, not on it).
  for (const c of await tabs.evaluateAll(ts => ts.map(t => t.getAttribute('aria-controls')))) check(!!c && await page.locator('#' + c + '.st-fam-panel').count() === 1, `${w}: aria-controls ${c} names no panel`);
  // Keyboard: arrow keys move between tabs.
  if (!touch) { await tabs.nth(2).focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
    check(await tabs.nth(3).getAttribute('aria-selected') === 'true', `${w}: arrow key reaches the next tab`); }
  // A link to a task in a hidden family (the sockets list) opens that family and scrolls to the task.
  const hiddenTask = await page.locator('.st-fam-panel[hidden] .st-task').first().getAttribute('id');
  const link = page.locator(`.st-sockets a[href="#${hiddenTask}"]`).first();
  if (await link.count()) { await link.scrollIntoViewIfNeeded(); await link.click(); }
  else await page.evaluate(id => { location.hash = id; }, hiddenTask);
  await page.waitForTimeout(400);
  check(await page.locator('#' + hiddenTask).isVisible(), `${w}: link to #${hiddenTask} opens its family`);
  // The site scrolls smoothly (html { scroll-behavior: smooth }): wait for the scroll to settle, up to 3 s.
  let top = 1e9; for (let i = 0; i < 30 && !(top >= -2 && top < 900); i++) { await page.waitForTimeout(100); top = await page.locator('#' + hiddenTask).evaluate(e => e.getBoundingClientRect().top); }
  check(top >= -2 && top < 900, `${w}: #${hiddenTask} scrolled into view (top ${Math.round(top)})`);
  // The intro's family cards (#fam-…) open their family too.
  const card = page.locator('nav.st-families a').nth(1), target = (await card.getAttribute('href')).slice(1);
  await card.scrollIntoViewIfNeeded(); await card.click(); await page.waitForTimeout(400);
  check(await page.locator('#' + target).isVisible(), `${w}: family card opens #${target}`);
  // A deep link on load works as well.
  await page.goto(page0 + '#' + hiddenTask, {waitUntil: 'networkidle'}); await page.waitForTimeout(400);
  check(await page.locator('#' + hiddenTask).isVisible(), `${w}: deep link #${hiddenTask} on load opens its family`);
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  check(sw[0] <= sw[1] + 1, `${w}: page scrolls sideways`);
  check(!errs.length, `${w}: page errors: ${errs.join(' | ')}`);
  console.log(`${w}: family tabs, links and deep links checked`);
  await ctx.close();
}
// /resources/docs: published documents lead as cards; request-only titles live only in the accordion below them.
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({viewport: {width: w, height: 900}});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base.replace(/\/?$/, '/') + 'resources/docs', {waitUntil: 'networkidle'});
  check(await page.locator('.cp-docgroup a[href^="mailto:"]').count() === 0, `docs ${w}: a request-only title is still among the published cards`);
  const items = page.locator('.cp-acc-item'), n = await items.count();
  check(n >= 3, `docs ${w}: expected the request-only groups in the accordion, found ${n}`);
  const heading = await page.locator('.cp-ask-h').innerText();
  // Closed panels are not rendered, so count from each group's badge, then prove one open group's links match its badge.
  const total = (await page.locator('.cp-acc-n').allInnerTexts()).reduce((a, t) => a + Number(t), 0);
  check(new RegExp('^' + total + ' more documents').test(heading), `docs ${w}: heading "${heading}" does not match ${total} request links`);
  const trig = items.first().locator('.cp-acc-trigger');
  await trig.scrollIntoViewIfNeeded();
  check(!(await items.first().locator('.cp-acc-list a').first().isVisible()), `docs ${w}: groups should start closed`);
  await trig.click();
  check(await items.first().locator('.cp-acc-list a').first().isVisible(), `docs ${w}: opening a group shows its request links`);
  check(await items.first().locator('.cp-acc-list a[href^="mailto:"]').count() === Number(await items.first().locator('.cp-acc-n').innerText()), `docs ${w}: an open group's links do not match its count`);
  await trig.focus(); await page.keyboard.press('Enter');
  check(!(await items.first().locator('.cp-acc-list a').first().isVisible()), `docs ${w}: Enter closes the group again`);
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  check(sw[0] <= sw[1] + 1, `docs ${w}: page scrolls sideways`);
  check(!errs.length, `docs ${w}: page errors: ${errs.join(' | ')}`);
  console.log(`docs ${w}: request-only accordion checked (${n} groups, ${total} titles)`);
  await ctx.close();
}
await browser.close();
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
console.log('/applications family tabs: all checks pass');
