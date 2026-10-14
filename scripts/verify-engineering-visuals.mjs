import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const base=process.argv[2]?.replace(/\/?$/,'/'),out=process.argv[3];
if(!base||!out)throw new Error('Pass base URL and screenshot directory');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const axe=createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const routes=['','company','resources','resources/docs','evidence','technology/die','portfolio','portfolio/brief','portfolio/brief?view=use-cases&sku=SKU-7'];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 for(const route of routes){
  await page.goto(base+route,{waitUntil:'networkidle'});
  const figures=page.locator('.dg-engineering-figure');assert.ok(await figures.count()>0,route+' has engineering visuals');
  for(const image of await figures.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());}
  const bad=await figures.evaluateAll(figs=>figs.flatMap(f=>{
   const i=f.querySelector('img'),a=f.querySelector('a');
   return (!i.alt||!i.width||!i.height||!f.querySelector('figcaption')?.textContent.includes('Pre-silicon')&&!f.querySelector('figcaption')?.textContent.includes('pre-silicon')||!a.href)?['Incomplete visual']:[];
  }));assert.deepEqual(bad,[],route);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow');
  for(const href of await figures.locator('a').evaluateAll(xs=>xs.map(a=>a.href))){const r=await page.request.get(href);assert.equal(r.status(),200,href);}
  await page.addScriptTag({path:axe});
  const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>v.id));
  assert.deepEqual(violations,[],route+' accessibility');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(150);
  await page.screenshot({path:`${out}/${route.split('?')[0].replaceAll('/','-')||'home'}-${width}.png`,fullPage:true});
  const section=page.locator(route.includes('view=use-cases')?'.uc-path':'.dg-layout-evidence,.dg-architecture-references,.dg-brand-gallery').first();
  await section.screenshot({path:`${out}/visual-${route.split('?')[0].replaceAll('/','-')||'home'}-${width}.png`});
 }
 assert.deepEqual(failures,[]);console.log(`PASS ${width}: nine visual routes, loaded images, captions, links, overflow and accessibility`);
 await page.close();
}
await browser.close();
