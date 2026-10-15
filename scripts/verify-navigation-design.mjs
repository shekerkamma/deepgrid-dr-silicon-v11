import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.argv[2],out=process.argv[3];
if(!base||!out)throw new Error('Pass base URL and output directory');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const results=[];
for(const width of [1440,1100,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 for(const route of ['', 'products','resources','technology/control-loop','applications']){
  await page.goto(base+route,{waitUntil:'networkidle',timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow');
  if(route===''){
   const labels=await page.locator('nav.mega-nav .mega-trigger').allTextContents();
   assert.deepEqual(labels.map(x=>x.trim()),['Products','Applications','Technology','Resources','Company','Investors']);
   assert.equal(await page.locator('.ij-discussion').count(),1);
   assert.equal(await page.locator('.v6-close').count(),0);
  }
  if(route==='products'||route==='resources'){
   const selectors=route==='products'?['.pt','.page-wrap > .dg-brand-image']:['.dr-library','.dg-brand-gallery'];
   const [task,art]=await Promise.all(selectors.map(s=>page.locator(s).first().boundingBox()));
   assert(task.y<art.y,route+' selection precedes imagery');
  }
  if(route.startsWith('technology/')){
   const tabs=page.locator('.technology-nav a');
   for(const tab of await tabs.all()){
    await tab.scrollIntoViewIfNeeded();
    assert(await tab.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Technology tab must remain uncovered');
   }
  }
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`${out}/${route.replaceAll('/','-')||'home'}-${width}.png`});
  results.push({route,width,height:await page.evaluate(()=>document.documentElement.scrollHeight),headings:await page.locator('main h1,main h2').allTextContents()});
 }
 await page.goto(base+'products',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/Radar sensing/}).click();
 assert.equal(await page.locator('.v11-visual-products img').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.getByRole('button',{name:/Power management/}).click();
 assert.equal(await page.locator('.v11-visual-products img').evaluate(el=>getComputedStyle(el).animationName),'dgs-diagram-change');
 await page.close();
 console.log(`PASS ${width}: menu order, page sequence, visible Technology tabs and motion preferences`);
}
fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
await browser.close();
