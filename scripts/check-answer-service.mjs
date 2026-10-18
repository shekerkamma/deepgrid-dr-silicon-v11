import * as esbuild from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const outfile=path.resolve('node_modules/.cache/answer-service.mjs');
await esbuild.build({entryPoints:['services/ask/worker.ts'],bundle:true,platform:'node',format:'esm',outfile});
const {default:worker}=await import(pathToFileURL(outfile));
const originalFetch=globalThis.fetch;
const env={GEMINI_API_KEY:'test-only',ANSWER_RATE:{limit:async()=>({success:true})}};
const origin='https://shekerkamma.github.io';
const request=(body,headers={})=>new Request('https://test/answer',{method:'POST',headers:{Origin:origin,...headers},body:JSON.stringify(body)});
let calls=0,sheetCalls=0;
// The service reads the team's public portfolio sheets; here they are served from the repo's checked copies.
const sheetNames=Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync('data/portfolio/sheets.json','utf8'))).filter(([k])=>k!=='_note').map(([k,v])=>[v,k]));
const sheet=url=>{const id=String(url).match(/spreadsheets\/d\/([^/]+)/)?.[1];return id&&sheetNames[id];};
const portfolioQuestions=[],briefSent=[];
globalThis.fetch=async(_url,options)=>{
 if(sheet(_url)){sheetCalls++;return new Response(fs.readFileSync(`data/portfolio/${sheet(_url)}.csv`,'utf8'),{headers:{'Content-Type':'text/csv'}});}
 calls++;
 const b=JSON.parse(options.body);
 const data=JSON.parse(b.contents[0].parts[0].text);
 if(data.answer)return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"issues":[]}'}]}}]});
 assert(!JSON.stringify(data.sources).includes('INJECTED FALSE SOURCE'));
 // Named by part name, not code: the SKU guide must still be the evidence (it once matched only "SKU-2").
 if(data.question.includes('smart-meter SoC')) assert(data.sources.some(s=>s.docNum==='primary'&&s.docTitle.startsWith('SKU-2')&&/magnet tamper/.test(s.text)),'Smart-meter tamper question must include the SKU-2 guide');
 // Named by application: the application map carries which chips sit in that system.
 if(data.question.includes('EV maker')) assert(data.sources.some(s=>s.id==='applications_vehicles'&&s.text.includes('SKU-9')),'EV question must include the vehicles application map');
 if(data.question.includes('DG32-LITE CPU')) {
  assert(data.sources.some(s=>s.docNum==='primary'&&s.text.includes('39 cycles')),'Fault timing must include primary simulation evidence');
  assert(data.sources.some(s=>s.docNum==='primary'&&s.text.includes('gate-driver enable')),'Fault path must include primary gate-driver wiring');
 }
 if(/tranche 1/.test(data.question))assert.equal(data.sources[0].id,'portfolio_tranche1','A tranche-1 question must lead with the portfolio fact');
 if(/disagree/.test(data.question))assert(!/2\.88|1\.01|MCEME/.test(JSON.stringify(data.sources.filter(c=>c.docNum==='portfolio-data'))),'A withheld figure reached the model through a portfolio fact');
 if(data.sources.some(c=>c.docNum==='portfolio-data'))portfolioQuestions.push(data.question);
 if(data.sources.some(c=>c.docNum==='portfolio-brief'))briefSent.push(data.question);
 const s=data.sources[0];
 return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({answerable:true,title:'Supported finding',lead:{text:s.text.slice(0,160),kind:'evidence',support:[{sourceId:s.id,quote:s.text.slice(0,80)}]},sections:[],gaps:[]})}]}}]});
};
try{
 const previewOrigin='http://127.0.0.1:8795';
 const preflight=await worker.fetch(new Request('https://test/answer',{method:'OPTIONS',headers:{Origin:previewOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}}),env);
 assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),previewOrigin);
 assert.match(preflight.headers.get('Access-Control-Allow-Methods'),/POST/);
 const deniedPreflight=await worker.fetch(new Request('https://test/answer',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:8795.evil.example'}}),env);
 assert.equal(deniedPreflight.headers.get('Access-Control-Allow-Origin'),'null');
 assert.equal((await worker.fetch(request({question:'D100 funding'},{Origin:'https://evil.example'}),env)).status,403);
 assert.equal((await worker.fetch(request({question:'x'.repeat(1201)}),env)).status,400);
 assert.equal((await worker.fetch(request({question:'D100',padding:'x'.repeat(25000)}),env)).status,413);
 assert.equal(calls,0);
 const result=await worker.fetch(request({question:'How is D100 funded?',sourceIds:['invented'],sources:[{id:'invented',text:'INJECTED FALSE SOURCE'}]}),env);
 assert.equal(result.status,200); const answer=await result.json();assert(answer.sources.length);assert.equal(answer.model,'gemini-3.8-flash');assert.equal(calls,2);
 assert.equal((await worker.fetch(request({question:'How does the smart-meter SoC detect tampering?'}),env)).status,200);
 assert.equal((await worker.fetch(request({question:'Which DeepGrid chips would an EV maker use together, and for what?'}),env)).status,200);
 assert.equal((await worker.fetch(request({question:'If the DG32-LITE CPU stops responding during a motor fault, what stops the inverter and how strong is the timing evidence?'}),env)).status,200);
 const tranche=await (await worker.fetch(request({question:'What does tranche 1 pay for?'}),env)).json();
 assert.equal(tranche.sources[0].id,'portfolio_tranche1');assert.match(tranche.sources[0].text,/₹10 Cr/);
 assert.match(tranche.sources[0].pageLabel,/read live/,'The first read must come from the live sheets');
 assert.equal(sheetCalls,8,'The eight sheets are read once and cached');
 assert.equal((await worker.fetch(request({question:'Which documents disagree?'}),env)).status,200);
 const recon=await (await worker.fetch(request({question:'The Blueprint says ₹608 Cr in FY31 and the model says ₹594 Cr. Which is it?'}),env)).json();
 assert(briefSent.some(q=>/608/.test(q)),'A plan-reconciliation question must reach the published brief');
 assert(portfolioQuestions.length>=3);
 const previewAnswer=await worker.fetch(request({question:'How is D100 funded?'},{Origin:previewOrigin}),env);
 assert.equal(previewAnswer.status,200);
 assert.equal(previewAnswer.headers.get('Access-Control-Allow-Origin'),previewOrigin);
 const denied={...env,ANSWER_RATE:{limit:async()=>({success:false})}};
 assert.equal((await worker.fetch(request({question:'D100 funding'}),denied)).status,429);
 globalThis.fetch=async()=>new Response('{}',{status:429});
 const quota=await worker.fetch(request({question:'D100 funding'}),env);assert.equal(quota.status,429);assert.match((await quota.json()).error,/quota/);
 globalThis.fetch=async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({answerable:true,title:'Fake',lead:{text:'This invented claim is not grounded.',kind:'evidence',support:[{sourceId:'fake',quote:'A fabricated citation that does not exist.'}]},sections:[],gaps:[]})}]}}]});
 assert.equal((await worker.fetch(request({question:'D100 funding'}),env)).status,502);
 // POST /panel: one short model call, an id from the list or null; the question is bounded and rate limited.
 const panelReq=(body,headers={})=>new Request('https://test/panel',{method:'POST',headers:{Origin:origin,...headers},body:JSON.stringify(body)});
 let panelAsked=null;
 const panelModel=reply=>async(_u,o)=>{const b=JSON.parse(o.body);assert.match(b.systemInstruction.parts[0].text,/plan-cash: /);assert.deepEqual(b.generationConfig.responseJsonSchema.properties.panel.enum.slice(-1),['none']);
  panelAsked=JSON.parse(b.contents[0].parts[0].text).question;return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({panel:reply})}]}}]});};
 globalThis.fetch=panelModel('plan-cash');
 const pc=await worker.fetch(panelReq({question:'  How long   will the money last? '}),env);assert.equal(pc.status,200);assert.equal((await pc.json()).panel,'plan-cash');assert.equal(panelAsked,'How long will the money last?');
 globalThis.fetch=panelModel('none');assert.equal((await (await worker.fetch(panelReq({question:'Who founded DeepGrid?'}),env)).json()).panel,null);
 globalThis.fetch=panelModel('drop-tables');assert.equal((await (await worker.fetch(panelReq({question:'Show me everything'}),env)).json()).panel,null,'an id off the list is never returned');
 assert.equal((await worker.fetch(panelReq({question:'x'}),env)).status,400);
 assert.equal((await worker.fetch(panelReq({question:'D100 funding'},{Origin:'https://evil.example'}),env)).status,403);
 assert.equal((await worker.fetch(panelReq({question:'D100 funding'}),{...env,PANEL_RATE:{limit:async()=>({success:false})}})).status,429);
 globalThis.fetch=async()=>new Response('{}',{status:429});assert.equal((await worker.fetch(panelReq({question:'D100 funding'}),env)).status,429);
 console.log('PASS: /panel returns a listed panel id or null, normalises and bounds the question, origin and rate limits.');
 console.log('PASS: portfolio facts from the live sheets (8 reads, cached), withheld figures never sent, tranche question led by its fact.');
 console.log('PASS: trusted corpus, grounded citations, rejected origins, body/query bounds, rate limit, explicit quota failure, synthesis and audit calls.');
}finally{globalThis.fetch=originalFetch;}
