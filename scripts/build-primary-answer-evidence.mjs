import fs from 'node:fs';
import path from 'node:path';
const root='public/downloads';
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
const output='app/data/primary-answer-evidence.json';
const data=JSON.stringify(chunks,null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(output,'utf8')!==data)throw new Error('Primary answer evidence is stale: run node scripts/build-primary-answer-evidence.mjs');}
else fs.writeFileSync(output,data);
console.log(`${chunks.length} primary architecture sections verified`);
