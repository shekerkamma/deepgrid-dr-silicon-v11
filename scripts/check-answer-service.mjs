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
let calls=0;
globalThis.fetch=async(_url,options)=>{
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
 const s=data.sources[0];
 return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({answerable:true,title:'Supported finding',lead:{text:s.text.slice(0,160),kind:'evidence',support:[{sourceId:s.id,quote:s.text.slice(0,80)}]},sections:[],gaps:[]})}]}}]});
};
try{
 assert.equal((await worker.fetch(request({question:'D100 funding'},{Origin:'https://evil.example'}),env)).status,403);
 assert.equal((await worker.fetch(request({question:'x'.repeat(1201)}),env)).status,400);
 assert.equal((await worker.fetch(request({question:'D100',padding:'x'.repeat(25000)}),env)).status,413);
 assert.equal(calls,0);
 const result=await worker.fetch(request({question:'How is D100 funded?',sourceIds:['invented'],sources:[{id:'invented',text:'INJECTED FALSE SOURCE'}]}),env);
 assert.equal(result.status,200); const answer=await result.json();assert(answer.sources.length);assert.equal(answer.model,'gemini-3.8-flash');assert.equal(calls,2);
 assert.equal((await worker.fetch(request({question:'How does the smart-meter SoC detect tampering?'}),env)).status,200);
 assert.equal((await worker.fetch(request({question:'Which DeepGrid chips would an EV maker use together, and for what?'}),env)).status,200);
 assert.equal((await worker.fetch(request({question:'If the DG32-LITE CPU stops responding during a motor fault, what stops the inverter and how strong is the timing evidence?'}),env)).status,200);
 const denied={...env,ANSWER_RATE:{limit:async()=>({success:false})}};
 assert.equal((await worker.fetch(request({question:'D100 funding'}),denied)).status,429);
 globalThis.fetch=async()=>new Response('{}',{status:429});
 const quota=await worker.fetch(request({question:'D100 funding'}),env);assert.equal(quota.status,429);assert.match((await quota.json()).error,/quota/);
 globalThis.fetch=async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({answerable:true,title:'Fake',lead:{text:'This invented claim is not grounded.',kind:'evidence',support:[{sourceId:'fake',quote:'A fabricated citation that does not exist.'}]},sections:[],gaps:[]})}]}}]});
 assert.equal((await worker.fetch(request({question:'D100 funding'}),env)).status,502);
 console.log('PASS: trusted corpus, grounded citations, rejected origins, body/query bounds, rate limit, explicit quota failure, synthesis and audit calls.');
}finally{globalThis.fetch=originalFetch;}
