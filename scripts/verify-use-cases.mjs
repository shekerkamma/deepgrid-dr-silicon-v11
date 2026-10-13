// Complete reference-dashboard acceptance: independent source fixtures, interactions, responsive layout and a11y.
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const base = process.argv[2]?.replace(/\/?$/, '/');
if (!base) throw new Error('Pass the base URL');
const out = process.argv[3] || 'verify-shots/use-cases';
fs.mkdirSync(out, {recursive:true});
const map = JSON.parse(fs.readFileSync('data/portfolio/use-cases.json','utf8'));
const sheets = JSON.parse(fs.readFileSync('data/portfolio/sheets.json','utf8'));
const scores = {'SKU-6':10,'SKU-1':8,'SKU-2':8,'SKU-5':8,'SKU-10':7,'SKU-4':7,'SKU-3':6,'SKU-8':6,'SKU-9':5,'SKU-7':3,'SKU-11':2,D100:0};
const fails = [];
const check = (ok, message) => {if (!ok) fails.push(message);};
const browser = await chromium.launch();
const require = createRequire(import.meta.url);
let axe;
try {axe = require.resolve('axe-core/axe.min.js');} catch {throw new Error('axe-core is required for dashboard accessibility review');}

for (const width of [1440,768,390]) {
  const context = await browser.newContext({viewport:{width,height:900},hasTouch:width===390,reducedMotion:'reduce',acceptDownloads:true});
  const page = await context.newPage();
  const errors = []; page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if (r.url().startsWith(base) && r.status()>=400) errors.push(`HTTP ${r.status()} ${r.url()}`);});
  let mode = 'offline';
  await page.route('https://docs.google.com/spreadsheets/**', async route => {
    if (mode === 'offline') return route.abort();
    const entry = Object.entries(sheets).find(([,id])=>route.request().url().includes(id));
    if (!entry) return route.abort();
    let csv = fs.readFileSync(`data/portfolio/${entry[0]}.csv`,'utf8');
    if (entry[0] === 'skus' && mode === 'changed') csv = csv.replace('26,12,PLAUSIBLE','27,12,PLAUSIBLE');
    if (entry[0] === 'skus' && mode === 'invalid') csv = csv.replace('26,12,PLAUSIBLE','999,12,PLAUSIBLE');
    return route.fulfill({status:200,contentType:'text/csv',body:csv});
  });
  await page.goto(base+'portfolio/brief?view=use-cases',{waitUntil:'networkidle'});
  const dashboard = page.locator('.uc-dashboard');
  await dashboard.waitFor();
  check((await page.getByRole('tab',{name:'Use cases & implementation'}).getAttribute('aria-selected'))==='true',`${width}: direct view URL`);
  check(await dashboard.locator('figure').count()===4,`${width}: all four charts present`);
  check(await dashboard.locator('.dg-ins').count()===4,`${width}: all four findings present`);
  check(await dashboard.locator('.uc-matrix tbody tr').count()===12,`${width}: twelve readiness rows`);
  check(await dashboard.locator('.uc-case').count()===12,`${width}: twelve use-case selectors`);
  check((await dashboard.innerText()).includes('Live tables unavailable'),`${width}: failed live read shows checked snapshot`);
  check((await dashboard.locator('.dg-ins-v').allTextContents()).join('|')==='61%|₹46 Cr|7–29%|1 of 12',`${width}: independently verified findings`);
  await page.screenshot({path:path.join(out,`use-cases-${width}.png`)});
  for (const c of map.cases) {
    await dashboard.locator('.uc-case').filter({hasText:c.title}).click();
    check((await page.locator('#uc-detail-title').innerText())===c.title,`${width}: ${c.sku} changes implementation path`);
    check((await page.locator('.uc-selected-heading').innerText()).includes(`coverage ${scores[c.sku]}/12`),`${width}: ${c.sku} score`);
    check(new URL(page.url()).searchParams.get('sku')===c.sku,`${width}: ${c.sku} shareable selection`);
  }
  await page.getByRole('searchbox',{name:'Find a use case'}).fill('bldc');
  check(await dashboard.locator('.uc-case').count()===1,`${width}: search filters case list`);
  await page.getByRole('searchbox').fill('no matching chip');
  check(await dashboard.locator('.uc-empty').count()===1,`${width}: meaningful empty state`);
  await page.getByRole('button',{name:'Clear filters'}).click();
  await page.getByLabel('Show',{exact:true}).selectOption('shuttle');
  check(await dashboard.locator('.uc-case').count()===9,`${width}: shuttle filter`);
  await page.getByLabel('Show',{exact:true}).selectOption('all');
  await page.getByRole('button',{name:'Smart electricity meters SKU-2 · Smart-Meter SoC',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.id==='uc-detail-title',null,{timeout:3000}).catch(()=>{});
  check(await page.locator('#uc-detail-title').evaluate(e=>e===document.activeElement),`${width}: matrix selection focuses detail`);
  await page.locator('#uc-implementation').screenshot({path:path.join(out,`implementation-${width}.png`)});
  await page.getByRole('button',{name:'Show sources'}).click();
  const download = page.locator('.uc-source-links a[download]').first();
  const [file] = await Promise.all([page.waitForEvent('download'),download.click()]);
  check(fs.readFileSync(await file.path(),'utf8').startsWith('sku,name,'),`${width}: raw data download`);
  const mark = dashboard.locator('.sk-range').first();
  await mark.scrollIntoViewIfNeeded();
  if(width===390) await mark.tap(); else await mark.hover();
  const fig=dashboard.locator('figure').nth(2), tip=fig.locator('.pd-tip');
  check(await tip.count()===1,`${width}: approval tooltip works`);
  if(await tip.count()) {const t=await tip.boundingBox(),f=await fig.boundingBox();check(t.x>=f.x-1&&t.x+t.width<=f.x+f.width+1,`${width}: tooltip stays within chart`);}
  await page.getByRole('button',{name:'Hide sources'}).click();
  await page.getByRole('tab',{name:'Use cases & implementation'}).focus();
  await page.keyboard.press('ArrowLeft');
  check(await page.getByRole('tab',{name:'Buyer questions'}).getAttribute('aria-selected')==='true',`${width}: keyboard tabs`);
  await page.goBack({waitUntil:'networkidle'});
  check(await page.getByRole('tab',{name:'Use cases & implementation'}).getAttribute('aria-selected')==='true',`${width}: browser back restores dashboard`);
  // The router settles its popstate work asynchronously; do not race a new document load against it.
  await page.waitForTimeout(500);
  await page.goto(base+'portfolio/brief?view=use-cases&sku=SKU-6',{waitUntil:'networkidle'});
  check(await page.locator('#uc-detail-title').innerText()==='Supply supervision for defence and industrial boards',`${width}: direct chip link`);
  mode='changed';await page.getByRole('button',{name:'Refresh data'}).click();
  await page.getByText(/Live portfolio tables ·/).waitFor();
  check((await dashboard.locator('figure').nth(3).innerText()).includes('12–27%'),`${width}: validated live edit updates market chart`);
  mode='invalid';await page.getByRole('button',{name:'Refresh data'}).click();
  await page.getByText('Live tables unavailable; showing the copy checked at build.').waitFor();
  check((await dashboard.locator('figure').nth(3).innerText()).includes('12–26%'),`${width}: invalid live table rejected atomically`);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  check(!overflow,`${width}: no page overflow`);
  await page.addScriptTag({path:axe});
  const violations=await page.evaluate(async()=> (await axe.run(document.querySelector('.dashboard-page'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  check(!violations.length,`${width}: axe ${JSON.stringify(violations)}`);
  check(!errors.length,`${width}: errors ${errors.join('; ')}`);
  console.log(`${width}: complete dashboard, 12 paths, source/download, live refresh/rejection, keyboard and accessibility checked`);
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:!fails.length,failures:fails},null,2));
if(fails.length){console.error(fails.join('\n'));process.exit(1);}
console.log('PASS complete use-case dashboard');
