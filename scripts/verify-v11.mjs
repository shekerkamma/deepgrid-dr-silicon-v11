import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.argv[2];
if(!base)throw new Error('Pass the deployed base URL');
fs.mkdirSync('.impeccable/review',{recursive:true});
const browser=await chromium.launch();
for(const width of [1440,1024,390]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['', 'products','technology']){
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;});
  assert.equal(await page.locator('h1').count(),1);
  if(route){
   const hero=await page.locator('.page-wrap > .section-head').first().boundingBox();
   const nav=await page.locator(route==='technology'?'.technology-nav':'.breadcrumbs').boundingBox();
   assert.ok(hero&&nav&&hero.y>=nav.y+nav.height-1,`${route} hero overlaps navigation at ${width}`);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${route} overflow at ${width}`);
  assert.ok(await page.locator('.v11-visual img').count(),`${route} missing DeepGrid visual`);
  assert.ok(await page.locator('.v11-visual figcaption').first().innerText());
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}scrollTo(0,0);});
  await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.complete).map(i=>i.decode().catch(()=>{})));});
  await page.waitForTimeout(1000);
  await page.screenshot({path:`.impeccable/review/${route||'home'}-${width}-top.png`});
  await page.screenshot({path:`.impeccable/review/${route||'home'}-${width}.png`,fullPage:true});
  if(route==='products'){
   for(const [name,code] of [['Radar sensing','sku-7'],['Drone integration','d100'],['Power management','sku-3'],['Motor control','sku-1']]){
    await page.getByRole('button',{name:new RegExp(name)}).click();
    assert.match(await page.locator('.v11-visual-products img').getAttribute('src'),new RegExp(code+'-architecture'));
    await page.locator('.v11-visual-products img').evaluate(i=>i.decode());
   }
  }
  if(route===''){
   assert.equal(await page.locator('.v11-product-row').count(),10);
   await page.getByRole('button',{name:'Motion & safety',exact:true}).click();
   assert.equal(await page.locator('.v11-product-row').count(),2);
   await page.getByRole('searchbox',{name:'Search architectures'}).fill('no-matching-architecture');
   assert.equal(await page.locator('.v11-product-row').count(),0);
   await page.getByRole('button',{name:'Clear search and filters'}).click();
   assert.equal(await page.locator('.v11-product-row').count(),10);
   await page.getByRole('searchbox',{name:'Search architectures'}).fill('radar');
   assert.equal(await page.locator('.v11-product-row').count(),1);
   assert.match(await page.locator('.v11-product-row').getAttribute('href'),/products\/sku-7$/);
  }
 }
 // Every route hero stays below its breadcrumbs and section tabs, and sticky offsets use the real header height.
 for(const route of ['technology/safety','technology/control-loop','technology/package','evidence','applications','contact','resources','about','use-cases/motors']){
  await page.goto(base+route,{waitUntil:'networkidle'});
  const r=await page.evaluate(()=>{const hero=document.querySelector('.page-wrap > .section-head, .cp-band');if(!hero)return null;
   const navBottom=Math.max(0,...[...document.querySelectorAll('.breadcrumbs, .technology-nav')].map(e=>e.getBoundingClientRect().bottom));
   return {hero:hero.getBoundingClientRect().top,navBottom,navH:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')),header:document.querySelector('.topbar').offsetHeight};});
  assert.ok(r,`${route} has no page hero`);
  assert.ok(r.hero>=r.navBottom-1,`${route} hero overlaps navigation at ${width}`);
  assert.equal(r.navH,r.header,`${route} --nav-h ${r.navH} does not match the ${r.header}px header at ${width}`);
 }
 assert.deepEqual(errors,[]);await page.close();console.log(`PASS v11 ${width}: imagery, captions, layout, search, filters and route heroes`);
}
await browser.close();
