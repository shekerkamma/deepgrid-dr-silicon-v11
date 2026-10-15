import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const base=process.argv[2]?.replace(/\/?$/,'/'),out=process.argv[3];
if(!base||!out)throw new Error('Pass base URL and screenshot directory');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const axe=createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const routes=['','products','technology','resources','resources/docs','evidence','company','portfolio','portfolio/brief',...Array.from({length:11},(_,i)=>`products/sku-${i+1}`),'products/d100'];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  await page.goto(base+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const images=page.locator('.dg-brand-image img');assert.ok(await images.count()>0,route+' brand image');
  for(const image of await images.all()){await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow');
  const titleOverflow=await page.locator('#main h1,#main h2,#main h3').evaluateAll(xs=>xs.filter(el=>el.checkVisibility()&&el.clientWidth>1&&el.scrollWidth>el.clientWidth+2).map(el=>el.textContent));
  assert.deepEqual(titleOverflow,[],route+' title fit');
  if(route==='technology'){
   const head=page.locator('.dg-brand-intro');
   assert.equal(await head.evaluate(el=>getComputedStyle(el,'::before').display),'none',route+' single opening visual');
   assert.equal(await head.evaluate(el=>getComputedStyle(el).clipPath.startsWith('inset(0px')),true,route+' header must not paint over navigation');
   if(width>800){
    const title=await head.locator('h1').boundingBox(),visual=await head.locator('.dg-brand-intro-visual').boundingBox();
    assert.ok(visual.x>=title.x+title.width-1,route+' visual stays outside title column');
   }
  }
  for(const figure of await page.locator('.dg-brand-image').all()){
   assert.match(await figure.locator('figcaption').innerText(),/concept illustration.*pre-silicon/);
   const img=figure.locator('img');assert.ok(await img.getAttribute('alt'));
   const href=await figure.locator('a').getAttribute('href');assert.equal((await page.request.get(new URL(href,base).href)).status(),200);
  }
  await page.addScriptTag({path:axe});const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>v.id));assert.deepEqual(violations,[],route+' accessibility');
  if(['','technology','resources','evidence','portfolio/brief','products/sku-4'].includes(route)){
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
   const name=route.replaceAll('/','-')||'home';await page.screenshot({path:`${out}/${name}-${width}-top.png`});
   const section=page.locator(route==='resources'?'.dg-brand-gallery':'.dg-brand-image').first();
   await section.screenshot({path:`${out}/${name}-${width}-visual.png`});
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS ${width}: ${routes.length} routes, source imagery, maturity captions, working links, responsive fit and axe`);
 await page.close();
}
await browser.close();
