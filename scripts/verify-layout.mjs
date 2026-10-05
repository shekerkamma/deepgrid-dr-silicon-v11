import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.argv[2];
if(!base)throw new Error('Pass the deployed base URL');
const routes=[...fs.readFileSync('app/routes.ts','utf8').matchAll(/href:\s*'([^']+)'/g)].map(m=>m[1]);
const browser=await chromium.launch();const failures=[];
for(const width of [1440,1024,478,390]){
 const page=await browser.newPage({viewport:{width,height:width===478?668:900},reducedMotion:'reduce'});
 for(const route of routes){
  await page.goto(base+route.slice(1),{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.locator('#main h1').first().waitFor();
  await page.waitForFunction(()=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))-document.querySelector('.topbar').getBoundingClientRect().height)<1);
  const issues=await page.evaluate(()=>{
   const issues=[];
   const heading=document.querySelector('h1')?.textContent?.trim()||'';
   if(!heading||/couldn.t load/i.test(heading))issues.push('route rendered an error boundary or no heading');
   if(document.documentElement.scrollWidth>innerWidth+1)issues.push('horizontal overflow');
   const navs=[...document.querySelectorAll('#main > .breadcrumbs, #main > .technology-nav')];
   const nav=navs.at(-1),hero=document.querySelector('.page-wrap > .section-head:first-child,.page-wrap > .cp-band:first-child');
   if(nav&&hero&&hero.getBoundingClientRect().top<nav.getBoundingClientRect().bottom-1)issues.push('hero covers section navigation');
   for(const a of navs.flatMap(n=>[...n.querySelectorAll('a')])){const r=a.getBoundingClientRect();for(const y of [r.top+2,r.top+r.height/2,r.bottom-2]){const hit=document.elementFromPoint(r.x+r.width/2,y);if(hit&&!a.contains(hit)){issues.push('obscured navigation: '+a.textContent.trim());break;}}}
   return issues;
  });
  failures.push(...issues.map(i=>`${width} ${route}: ${i}`));
 }
 for(const [route,selector] of [['products/sku-1','.pp-bar'],['technology','.dr-arch-tabs'],['technology/die','.dg-split-stage']]){
  await page.goto(base+route,{waitUntil:'networkidle'});await page.waitForTimeout(400);
  await page.locator(selector).first().evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top+160,behavior:'instant'}));await page.waitForTimeout(150);
  const ok=await page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect();return getComputedStyle(el).position!=='sticky'||r.top>=h.bottom-1;});
  if(!ok)failures.push(`${width} ${route}: sticky control under header`);
 }
 console.log(`Checked all ${routes.length} routes and sticky controls at ${width}px`);await page.close();
}
await browser.close();if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log('PASS shared layout: navigation visibility, hero flow, header height and sticky controls');
