import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const site=process.argv[2].replace(/\/?$/,'/');
const browser=await chromium.launch();
const page=await browser.newPage();
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.md'))files.push(f);}}
walk('public/downloads');
const failures=[];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});
 // Documents are read inside the site (/resources/read?doc=<key>, app/doc-reader.tsx); the old generated
 // /downloads/*.html paths are redirects to it. Both are checked: the in-site edition renders with the
 // site's own shell, and every old path still lands there.
 for(const file of files){
  const key=file.replace(/^public[\\/]downloads[\\/]/,'').replaceAll('\\','/').replace(/\.md$/,'');
  const target=site+'resources/read?doc='+encodeURIComponent(key);
  const response=await page.goto(target,{waitUntil:'networkidle'});
  await page.locator('.rd-content h2, .rd-content p').first().waitFor({timeout:15000}).catch(()=>{});
  if(response.status()!==200||await page.locator('.rd-body h1').count()!==1)failures.push(`${width}: missing in-site reader ${target}`);
  if(await page.locator('.rd-content p').count()<1)failures.push(`${width}: document did not render ${target}`);
  if(await page.locator('header, nav').count()<1)failures.push(`${width}: reader outside the site shell ${target}`);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))failures.push(`${width}: overflow ${target}`);
  if(!await page.getByRole('link',{name:'Markdown source'}).getAttribute('download').then(x=>x!==null).catch(()=>false))failures.push(`missing raw download ${target}`);
  if(width===1440){
   const old=site+'downloads/'+key+'.html';
   await page.goto(old,{waitUntil:'networkidle'});
   if(!page.url().includes('resources/read?doc='))failures.push(`old path does not redirect: ${old} -> ${page.url()}`);
  }
 }
 for(const route of ['', 'company.html']){
  await page.goto(site+route,{waitUntil:'networkidle'});
  // Text in the reuse and gate bands must contrast with the surface it actually sits on (WCAG AA: 4.5, or 3 for large
  // text). Measured against the nearest painted ancestor, so it holds whether the band is light or dark.
  const bad=await page.locator('.v6-bone h2,.v6-bone h3,.v6-bone strong,.v6-foundation h3,.v6-foundation p,.v6-proposed h3,.v6-proposed p').evaluateAll(nodes=>{
   const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number);
   const lum=([r,g,b])=>[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   const ground=el=>{for(let e=el;e;e=e.parentElement){const c=rgb(getComputedStyle(e).backgroundColor);if(c.length>=3&&(c[3]===undefined||c[3]>0))return c;}return [255,255,255];};
   return nodes.filter(el=>{const cs=getComputedStyle(el),a=lum(rgb(cs.color)),b=lum(ground(el));const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&Number(cs.fontWeight)>=700);return ratio<(large?3:4.5);}).map(el=>el.textContent);});
  if(bad.length)failures.push(`${width} ${route}: low-contrast text in reuse and gate bands: ${bad.join(', ')}`);
  const rawLinks=await page.locator('a[href*=".md"]:not([download])').count();
  if(rawLinks)failures.push(`${width} ${route}: ${rawLinks} raw-source reading links`);
  const oldReaders=await page.locator('a[href*="/downloads/"][href$=".html"], a[href*="/downloads/"][href*=".html#"]').count();
  if(oldReaders)failures.push(`${width} ${route}: ${oldReaders} links to generated document pages instead of the in-site reader`);
 }
}
if(process.argv[3]){
 fs.mkdirSync(process.argv[3],{recursive:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(site,{waitUntil:'networkidle'});
  await page.locator('.v6-bone').first().screenshot({path:path.join(process.argv[3],`${width}-reuse.png`)});
  await page.goto(site+'resources/read?doc=docs%2Fdeepgrid-sku-compendium-architecture',{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(process.argv[3],`${width}-reader.png`)});
 }
}
await browser.close();
if(failures.length)throw Error(failures.join('\n'));
console.log(`Reading gate PASS: ${files.length} documents read in-site at desktop/phone widths, old paths redirect; home/company band text contrast and source-reading links.`);
