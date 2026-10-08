import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.argv[2]; if(!base)throw Error('Pass site base URL');
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'ask/',{waitUntil:'networkidle'});
await page.locator('[data-ready="true"]').waitFor({state:'attached'});
const input=page.getByRole('searchbox',{name:'Search DeepGrid knowledge'});
assert.equal(await page.locator('.answer-essay').count(),0,'No answer before a question');
assert.equal(await page.getByText('Your next decision',{exact:true}).count(),0);
assert.equal(await page.getByText('Detailed evaluation checklist',{exact:true}).count(),0);
assert.equal(await page.getByText('Enter a question above, then select Answer question.',{exact:true}).count(),0);
assert(!(await page.getByRole('button',{name:'Submit',exact:true}).isEnabled()));
for(const sample of ['Why secure control?','The D100 funding decision','Control or battery intelligence?','Who needs the interface product?']){
 await page.getByRole('button',{name:sample,exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.answer-essay h2')?.textContent===document.querySelector('.dr-ask-input')?.value);
 assert.equal(await page.locator('.dr-grounded-answer-wrap').getAttribute('data-answerable'),'true',sample);
 if(sample==='Who needs the interface product?')assert(!/display drivers|20–60 M/.test(await page.locator('.dr-answer-lead').innerText()));
}
for(const [q,expected] of [
 ['How is the D100 drone chip funded?',/50 Cr/],
 ['What is the difference between SKU-10 and SKU-11?',/SKU-10/],
 ['Thirty use cases, no accelerator',/calculated design scenarios/],
 ['What is the weather in Hyderabad today?',/does not establish an answer/]
]){
 await input.fill(q);
 await page.locator('.answer-essay').waitFor({state:'detached'});
 await input.press('Enter');
 await page.locator('.answer-essay').waitFor();
 assert.equal(await page.locator('.answer-essay h2').innerText(),q);
 assert.match(await page.locator('.dr-answer-lead').innerText(),expected);
 assert.equal(await page.locator('.executive-arc').count(),0);
 assert.equal(await page.getByText('EXECUTIVE BRIEF',{exact:true}).count(),0);
 if(!q.includes('weather')){
  assert(await page.locator('.answer-essay > p').count()>1);
  const refs=page.locator('.answer-essay details');
  assert.equal(await refs.getAttribute('open'),null);
  await refs.locator('summary').click();
  for(const link of await refs.locator('a').all()){
   const href=await link.evaluate(a=>a.href);assert(href.startsWith(base));
   assert.equal((await page.request.get(href)).status(),200);
  }
 }
}
await input.fill('How is the D100 drone chip funded?');await page.getByRole('button',{name:'Submit',exact:true}).click();
await page.locator('.answer-essay').waitFor();
fs.mkdirSync('work/ask-review',{recursive:true});
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.screenshot({path:'work/ask-review/simple-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await page.screenshot({path:'work/ask-review/simple-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS simple Ask: explicit keyboard submission, narrative paragraphs, expandable sources, no decision checklist, abstention, mobile layout. Does not establish arbitrary-query synthesis quality.');
