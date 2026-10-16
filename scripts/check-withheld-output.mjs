// The three withheld claims (app/claims.ts `withheld`) may appear in the shipped site only inside that register,
// which states each one and why it is excluded. Anywhere else (a document note, an Ask fact, a corpus chunk) a
// figure is repeated, so the build fails. Scans the packaged output, so a source the other checks never read
// (JSON corpora, generated data) is covered too. Downloadable source PDFs are documents, not site copy: skipped.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, process.argv[2] || 'dist/pages');
// Figures match in any case; the contract name only in capitals, since retrieval vocabularies keep a lowercase
// "mceme" index token that states nothing.
const WITHHELD = /(?:Rs\.?|₹|\\u20b9)\s?(?:2\.88|1\.01)\s?(?:Cr|crore)|MCEME|(?:39\.3\s?TOPS|12\.9\s?(?:x|×|\\u00d7))/g;
// The register's own strings, as they appear in markup and in escaped JS/JSON.
const reg = fs.readFileSync(path.join(root, 'app/claims.ts'), 'utf8').split('export const withheld')[1] ?? '';
const allowed = [...reg.matchAll(/(?:claim|why):\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
const forms = s => [s, JSON.stringify(s).slice(1, -1), JSON.stringify(s).slice(1, -1).replace(/[^\x00-\x7f]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')),
  s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'), s.replace(/&/g, '&amp;').replace(/'/g, '&#39;')];
const strip = text => allowed.reduce((t, a) => forms(a).reduce((u, f) => u.split(f).join(''), t), text);
const hits = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'downloads' && e.name !== 'media') walk(f); continue; }
    if (!/\.(html|js|json|rsc|txt|csv)$/.test(e.name)) continue;
    const text = strip(fs.readFileSync(f, 'utf8'));
    // A detector's own pattern (sanitizeWithheld's regex, with its \s? escapes) names nothing to a reader.
    for (const m of text.matchAll(WITHHELD)) if (!/\\s\?|\(\?:/.test(text.slice(Math.max(0, m.index - 24), m.index + m[0].length + 8))) hits.push(`${path.relative(out, f)}: …${text.slice(Math.max(0, m.index - 70), m.index + 50).replace(/\s+/g, ' ')}…`);
  }
})(out);
if (hits.length) { console.error(`Withheld claims repeated outside the evidence register (${hits.length}):\n  ` + hits.slice(0, 25).join('\n  ')); process.exit(1); }
console.log(`withheld claims: none outside the register (${allowed.length} register strings allowed)`);
