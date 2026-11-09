// The three withheld claims (app/claims.ts `withheld`) may appear in the shipped site only inside that register,
// which states each one and why it is excluded. Anywhere else (a document note, an Ask fact, a corpus chunk) a
// figure is repeated, so the build fails. Scans the packaged output, so a source the other checks never read
// (JSON corpora, generated data) is covered too. Downloadable source PDFs and data files are documents, not site
// copy, and are skipped; the Markdown reading editions in downloads/ are rendered by /resources/read and are scanned.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findWithheld, registerCount, stripRegister} from './lib/withheld.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, process.argv[2] || 'dist/pages');
const hits = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'media') walk(f); continue; }
    // Under downloads/ only the Markdown reading editions are site copy: /resources/read renders them as pages.
    const inDownloads = path.relative(out, f).split(path.sep).includes('downloads');
    if (inDownloads ? !e.name.endsWith('.md') : !/\.(html|js|json|rsc|txt|csv)$/.test(e.name)) continue;
    for (const {context} of findWithheld(stripRegister(fs.readFileSync(f, 'utf8')))) hits.push(`${path.relative(out, f)}: …${context}…`);
  }
})(out);
if (hits.length) { console.error(`Withheld claims repeated outside the evidence register (${hits.length}):\n  ` + hits.slice(0, 25).join('\n  ')); process.exit(1); }
console.log(`withheld claims: none outside the register (${registerCount} register strings allowed)`);
