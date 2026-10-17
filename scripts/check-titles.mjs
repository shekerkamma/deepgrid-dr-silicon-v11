// Titles state a business or technology fact; they do not coach the reader.
//
// This exists because a story pass (d71c389, 7 Oct) rewrote ~130 headings into advice such as
// "Make the display trustworthy in demanding operating conditions." and "Agree the next milestone
// for your product." It typechecked, built and passed every browser gate, because a heading that
// lectures is present and correct by all of those measures. The 17 Oct pass rewrote them so each
// names a part, a system or a number ("SKU-8 drives 1280 columns at up to 12 V and flags a frozen
// image within two frames."). This check keeps the overlay files and the company-page titles from
// drifting back. Rule text: DESIGN.md, "Titles".
//
// Only data-driven titles are read: the two executive overlay files and `title:` literals in
// company-pages.ts. A JSX heading is reviewed by eye; the grep in DESIGN.md finds candidates.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// Coaching openers that the 7 Oct pass used. A title may still start with a verb when it names
// the action and its object for a call to action ("Request an investment discussion, ...").
const COACH = /^(Agree|Align|Assess|Bring the (system|questions)|Check the|Choose the|Combine|Connect|Customise|Define|Develop|Expand|Identify|Judge|Keep|Leave|Make|Match|Move from|Name the|Pick|Prioritise|Protect|Release|Resolve|Reuse|Review the|Scope|See how|Select|Separate|Share|Simplify|Stage|Start (the|with)|Test the|Treat|Turn|Understand|Use)\b/;
// Aphorisms and topic labels that carried no fact.
const BANNED = [/^Compute is not the limit/, /^Silicon (value|reaches)/, /^Recognition opens/, /must lead to a controlled outcome/];

const titles = [];
const routes = JSON.parse(read('app/executive-routes.json'));
for (const [id, r] of Object.entries(routes)) for (const f of ['headline', 'decision']) titles.push([`executive-routes.json ${id}.${f}`, r[f]]);
const products = JSON.parse(read('app/executive-products.json'));
for (const [id, p] of Object.entries(products)) for (const f of ['headline', 'valueTitle', 'gateTitle']) titles.push([`executive-products.json ${id}.${f}`, p[f]]);
for (const m of read('app/company-pages.ts').matchAll(/\btitle: '((?:[^'\\]|\\.)*)'/g)) titles.push(['company-pages.ts title', m[1]]);

const problems = titles.filter(([, t]) => typeof t === 'string' && (COACH.test(t) || BANNED.some(b => b.test(t))));
if (problems.length) {
  console.error(`${problems.length} title(s) coach the reader instead of stating a fact (DESIGN.md, "Titles"):\n`);
  for (const [where, t] of problems) console.error(`  ${where}: ${t}`);
  process.exit(1);
}
console.log(`Title check: ${titles.length} data-driven titles, none coaching.`);
