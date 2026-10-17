// Dashboard text floor: nothing below 14px on /plan, /portfolio, /portfolio/brief or the use-case dashboard, and SVG
// chart text drawn at 1:1.
//
// Adopted 2026-10-17 from BenAI's dashboard design rules (ban 1, "no text below 14px", and "draw chart text at 1:1").
// An audit that day found 30 declarations under 14px across the three dashboard stylesheets, and every SVG chart drew
// 12px text inside a fixed 720-unit viewBox, which a 390px phone scaled to about 6px. Both passed every gate, because
// small text is present and legible to a DOM check. This check keeps both from coming back. Rule text: DESIGN.md,
// "Dashboards".
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const CSS = ['app/plan-dashboard.css', 'app/portfolio-dashboard.css', 'app/use-case-dashboard.css'];
const TSX = ['app/plan-dashboard.tsx', 'app/portfolio-dashboard.tsx', 'app/use-case-dashboard.tsx', 'app/dash-charts.tsx', 'app/brief-view.tsx'];
const problems = [];

for (const f of CSS) read(f).split('\n').forEach((line, i) => {
  for (const m of line.matchAll(/font-size:\s*([\d.]+)(px|rem|em)\b/g)) {
    const px = m[2] === 'px' ? Number(m[1]) : Number(m[1]) * 16;
    if (px < 14) problems.push(`${f}:${i + 1}: font-size ${m[1]}${m[2]} is ${px}px`);
  }
});
// A chart whose viewBox width is a literal scales its text with the column; useWidth() makes the viewBox the
// plot's pixel width. Flags `const W = 720` style literals beside a viewBox in the same file.
for (const f of TSX) {
  const s = read(f);
  if (/viewBox=\{`0 0 \$\{W\}/.test(s)) s.split('\n').forEach((line, i) => {
    if (/\bconst W = \d+/.test(line) || /\bW = \d+,/.test(line)) problems.push(`${f}:${i + 1}: fixed chart width; draw at 1:1 with useWidth()`);
  });
}
if (problems.length) {
  console.error(`${problems.length} dashboard text problem(s) (DESIGN.md, "Dashboards"):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`Dashboard type check: ${CSS.length} stylesheets at or above 14px; SVG charts draw at 1:1.`);
