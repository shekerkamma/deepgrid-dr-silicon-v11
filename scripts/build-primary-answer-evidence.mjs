import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as esbuild from 'esbuild';
const root='public/downloads';
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const chunks=[];
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('-architecture-guide.md')).sort()){
 const md=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
 const title=md.match(/^# (.+)/m)[1];
 const parts=[...md.matchAll(/^(#{2,3}) (.+)\r?\n([\s\S]*?)(?=^#{1,3} |$(?![\s\S]))/gm)];
 for(const [i,m] of parts.entries()){
  const text=m[3].replace(/\*\*|`/g,'').trim();if(text.length<40)continue;
  chunks.push({id:`primary_${file.replace('.md','')}_${i}`,docTitle:title,docNum:'primary',pdfPath:`./downloads/${file}`,pdfSize:'',specPath:`./downloads/${file}`,pageLabel:'Primary architecture guide',section:m[2].trim(),text});
 }
}

// Visitors name parts the way the site and the Blueprint do ("smart-meter SoC"), not only by code. Each guide's
// match terms are its code plus those published names; a trailing generic word is dropped when two words remain,
// so "smart meter" and "bldc motor" also match. No answer prose here, only names.
const bundle=path.resolve('node_modules/.cache/answer-aliases-src.mjs');
await esbuild.build({stdin:{contents:`export {products, areas} from './app/applications-story-data.ts'; export {portfolioParts} from './app/portfolio-story-data.ts';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:bundle,logLevel:'warning'});
const {products, areas, portfolioParts}=await import(pathToFileURL(bundle).href+'?t='+Date.now());
const index=JSON.parse(fs.readFileSync('app/data/graphrag-unified-index.json','utf8')).chunks;
const blueprintNames={};
for(const c of index){const m=c.section.match(/^(SKU-\d+|Track B) · ([^·]+?) ·/);if(m)(blueprintNames[m[1]==='Track B'?'D100':m[1]]??=new Set()).add(m[2].trim());}
const generic=new Set(['soc','ic','rf','mcu','controller','chip','driver']);
const variants=name=>{const n=norm(name),w=n.split(' ');const out=[n];if(w.length>2&&generic.has(w.at(-1)))out.push(w.slice(0,-1).join(' '));return out;};
const products_={};
for(const title of [...new Set(chunks.map(c=>c.docTitle))].sort()){
 const code=title.split(/ — | – |: /)[0].trim();
 const names=new Set([norm(code),norm(code).replace(/ /g,'')]);
 const site=Object.values(products).find(p=>p.tag===code||(code==='D100'&&p.tag==='D100'));
 const part=portfolioParts.find(p=>p.code===code);
 for(const n of [...(blueprintNames[code]||[]),...(site?[site.name]:[]),...(part?[part.name]:[])])for(const v of variants(n))names.add(v);
 products_[title]=[...names].filter(n=>n.length>=3).sort();
}

// One passage per application area, from the published /applications data (SKU Blueprint sockets): which chips
// sit in that system and their role. Pinned when a question names the application rather than a part.
const areaTerms={motors:['motor','motors','motor drive','drives','fan','fans','appliance','appliances','robot','robots','robotics','actuator'],
 vehicles:['ev','evs','electric vehicle','electric vehicles','vehicle','vehicles','car','cars','automotive','truck','trucks','two wheeler','three wheeler','e 2w','e 3w'],
 defence:['defence','defense','military','avionics','aerospace','drone','drones','uav'],
 grid:['grid','meter','meters','metering','utility','utilities','electricity board'],
 boards:['every board','power rail','power rails','supervisor','interface','board level']};
const areas_={};
for(const a of areas){
 const lines=a.items.map(i=>`${products[i.product].tag} (${products[i.product].name}): ${i.role}`);
 const id=`applications_${a.id}`;
 chunks.push({id,docTitle:'SKU Blueprint, October 2026 (11 SKUs + D100)',docNum:'applications',pdfPath:'./downloads/docs/deepgrid-sku-blueprint-oct2026.pdf',pdfSize:'',specPath:'./downloads/docs/deepgrid-sku-blueprint-oct2026.md',pageLabel:'Applications map',section:`Applications · ${a.name}`,
  text:`${a.headline} ${a.lede} Chips and roles in this system: ${lines.join(' ')} ${a.fit}`});
 areas_[id]=[...new Set([norm(a.name),...(areaTerms[a.id]||[])])].sort();
}

const files={'app/data/primary-answer-evidence.json':JSON.stringify(chunks,null,2)+'\n','app/data/answer-aliases.json':JSON.stringify({products:products_,areas:areas_},null,2)+'\n'};
for(const [output,data] of Object.entries(files)){
 if(process.argv.includes('--check')){if(!fs.existsSync(output)||fs.readFileSync(output,'utf8').replace(/\r\n/g,'\n')!==data)throw new Error(`${output} is stale: run node scripts/build-primary-answer-evidence.mjs`);}
 else fs.writeFileSync(output,data);
}
console.log(`${chunks.filter(c=>c.docNum==='primary').length} primary architecture sections, ${areas.length} application passages and ${Object.keys(products_).length} part name sets verified`);
