// The three withheld claims (app/claims.ts `withheld`) may appear only inside that register. Shared by the two gates
// that enforce it: check-withheld-output.mjs on the packaged site, and check-answer-service.mjs and the Worker deploy
// on the Worker bundle.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Figures match in any case; the contract name only in capitals, since retrieval vocabularies keep a lowercase
// "mceme" index token that states nothing.
export const WITHHELD = /(?:Rs\.?|₹|\\u20b9)\s?(?:2\.88|1\.01)\s?(?:Cr|crore)|MCEME|(?:39\.3\s?TOPS|12\.9\s?(?:x|×|\\u00d7))/g;
// The register's own strings, as they appear in markup and in escaped JS/JSON.
const reg = fs.readFileSync(path.join(root, 'app/claims.ts'), 'utf8').split('export const withheld')[1] ?? '';
const allowed = [...reg.matchAll(/(?:claim|why):\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
export const registerCount = allowed.length;
const forms = s => [s, JSON.stringify(s).slice(1, -1), JSON.stringify(s).slice(1, -1).replace(/[^\x00-\x7f]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')),
  s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;'), s.replace(/&/g, '&amp;').replace(/'/g, '&#39;')];
export const stripRegister = text => allowed.reduce((t, a) => forms(a).reduce((u, f) => u.split(f).join(''), t), text);
// A detector's own pattern (sanitizeWithheld's regex, with its \s? escapes) names nothing to a reader.
export const findWithheld = text => [...text.matchAll(WITHHELD)]
  .filter(m => !/\\s\?|\(\?:/.test(text.slice(Math.max(0, m.index - 24), m.index + m[0].length + 8)))
  .map(m => ({index: m.index, context: text.slice(Math.max(0, m.index - 70), m.index + 50).replace(/\s+/g, ' ')}));
// auditInstructions in services/ask/worker.ts names the claims so the audit model can reject them. That one
// parenthetical is the only exemption, and it must occur exactly once so a second copy cannot hide a figure.
const AUDIT_LIST = 'withheld claims (';
export function scanWorkerBundle(text) {
  const start = text.indexOf(AUDIT_LIST);
  const end = text.indexOf(')', start);
  if (start < 0 || end < 0 || text.indexOf(AUDIT_LIST, start + 1) >= 0) throw new Error(`Worker bundle: expected the audit list "${AUDIT_LIST}…)" exactly once`);
  return findWithheld(stripRegister(text.slice(0, start) + text.slice(end + 1)));
}
