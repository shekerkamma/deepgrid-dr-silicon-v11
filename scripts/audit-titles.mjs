import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.argv[2]?.replace(/\/?$/, '/');
const output=process.argv[3];
if(!base||!output)throw new Error('Pass site URL and inventory output path');
const scope=process.argv[4]==='--review-scope'?process.argv[5]?.split(','):null;
const routes=[...fs.readFileSync('app/routes.ts','utf8').matchAll(/href:\s*'([^']+)'/g)].map(m=>m[1]).filter(route=>!scope||scope.includes(route));
const variants=['/contact?intent=engineering','/contact?intent=partner','/products?chip=2dom','/resources?pkg=2dom','/resources?pkg=lite-datasheet','/resources?pkg=2dom-datasheet','/resources?pkg=lite-tapein','/technology?chip=2dom','/technology?chip=tapein',...Array.from({length:6},(_,i)=>`/technology?block=${i}`),'/portfolio/brief?view=buyers','/portfolio/brief?view=use-cases',...Array.from({length:12},(_,i)=>`/portfolio/brief?view=use-cases&sku=${i===11?'D100':`SKU-${i+1}`}`)];
variants.push(...Array.from({length:6},(_,i)=>`/technology/die?block=${i}`));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const prior=process.argv[4]==='--fit-only'?JSON.parse(fs.readFileSync(output,'utf8')):null;
const inventory=prior?.inventory||[];
let navigation=prior?.navigation||[];
for(const route of prior?[]:[...new Set([...routes,...variants.filter(route=>!scope||scope.includes(route.split('?')[0]))])]){
  await page.goto(base+route.slice(1),{waitUntil:'networkidle',timeout:60000});
  await page.locator('#main h1').first().waitFor();
  if(!navigation.length)navigation=await page.locator('.mega-nav a,.mega-trigger,.ij-directory a').allTextContents();
  const items=await page.locator('#main').evaluate(root=>[...root.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="tab"],legend,summary,caption,nav a,.dgs-figure-title,.stage-top .mono,.dr-lib-kicker')].map(el=>({kind:el.tagName.toLowerCase(),text:el.innerText?.replace(/\s+/g,' ').trim()||el.textContent.replace(/\s+/g,' ').trim(),visible:el.checkVisibility()})).filter(x=>x.text));
  inventory.push({route,title:await page.title(),items});
  console.log(route);
}
const failures=[];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});
 for(const route of routes){
  await page.goto(base+route.slice(1),{waitUntil:'networkidle',timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  const issues=await page.evaluate(()=>{
   const issues=[];
   if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page overflow');
   for(const el of document.querySelectorAll('#main h1,#main h2,#main h3,#main h4,#main h5,#main h6')){
    const rect=el.getBoundingClientRect();
    // Screen-reader headings are deliberately clipped to a 1px box; retain
    // them in the content inventory but do not judge their visual text fit.
    if(rect.width<=1&&rect.height<=1)continue;
    if(el.checkVisibility()&&el.clientWidth&&el.scrollWidth>el.clientWidth+2)issues.push('title overflow: '+el.textContent);
   }
   return issues;
  });
  failures.push(...issues.map(x=>`${width} ${route}: ${x}`));
 }
 console.log(`Title fit: ${routes.length} routes at ${width}px`);
}
await browser.close();
fs.writeFileSync(output,JSON.stringify({navigation,inventory,failures},null,2)+'\n');
console.log(`Audited ${inventory.length} routes/states, ${inventory.reduce((n,r)=>n+r.items.length,0)} titles`);
if(failures.length)throw new Error(failures.join('\n'));
