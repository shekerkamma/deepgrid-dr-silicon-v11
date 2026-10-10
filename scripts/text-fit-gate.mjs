// Vendored from content-ideas skills/e2e-qa-review/scripts/clip_gate.mjs (2026-10-10). Run through verify-text-fit.mjs.
// Text-fit gate: nothing a visitor should read is cut off, covered or mangled. Every route, every width,
// every disclosure state named in `expand`. Four checks:
//   clipped   text that runs past an ancestor with overflow hidden/clip (a fixed-height card cutting its own
//             button off). Scroll containers are skipped: their content is reachable by scrolling.
//   overlap   two visible text runs whose boxes intersect (a negative margin pulling one block over another).
//   crop      a text-bearing image (poster, diagram, slide...) cropped by object-fit: cover, so its baked-in
//             title or labels are cut. Photographs are not checked; cropping them is a composition choice.
//   units     a unit forced into capitals by text-transform: uppercase ("130 NM", "114 MHZ").
// Visually hidden text (clip-path: inset(50%), 1px boxes, sr-only, aria-hidden, inert) and deliberate
// ellipsis (text-overflow: ellipsis) are excluded, because on the first site they were the only false positives.
//
// Written after DeepGrid v11's restyle (2026-10-10): bold Inter headings and 1rem Source Sans body made an open
// product tile outgrow its fixed 33rem height, clipping "View details"; a -28px margin laid one document group
// over another on phones; film stills lost their titles to object-fit: cover; "130 nm" rendered as "130 NM".
// Every other gate was green; the owner saw it first.
//
// Usage: node clip_gate.mjs <config.json>
//   config: { base, routes, widths?: [[w,h,label]], out?, expand?: ["css selector", ...], textImages?: "regex" }
//   expand: each matching element is clicked in turn and the page re-measured in that state.
//   exit 0 clean, 2 findings, 1 blocked. Reuses sweep.json (base, routes, widths).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const blocked = (m) => { console.error('BLOCKED: ' + m); process.exit(1); };
const cfgPath = process.argv[2]; if (!cfgPath || !fs.existsSync(cfgPath)) blocked('usage: node clip_gate.mjs <config.json>');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (!cfg.base || !Array.isArray(cfg.routes) || !cfg.routes.length) blocked('config needs base and a non-empty routes list');
const BASE = cfg.base.endsWith('/') ? cfg.base : cfg.base + '/';
const widths = (cfg.widths || [[1440, 900, 'desktop'], [1100, 900, 'tablet'], [390, 844, 'phone']]).map((w) => Array.isArray(w) ? w : [w.width, w.height, w.label]);
const expand = cfg.expand || [];
const textImages = cfg.textImages || 'poster|diagram|slide|deck|still|storyboard|explainer|infographic|chart|frame';

// playwright from the project first, then $E2E_QA_NODE_MODULES, then this skill's repo (as sweep.mjs does).
let chromium;
for (const base of [process.cwd(), process.env.E2E_QA_NODE_MODULES, path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..')].filter(Boolean)) {
  try { ({ chromium } = createRequire(path.join(base, 'noop.js'))('playwright')); break; } catch {}
}
if (!chromium) blocked('playwright not found in the project, $E2E_QA_NODE_MODULES or the skill repo');

function measure(textImages) {
  const hiddenClip = (e) => {
    for (let a = e; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/inset\(50%/.test(s.clipPath)) return true;
      if (s.position === 'absolute' && parseFloat(s.width) <= 1 && parseFloat(s.height) <= 1) return true;
    }
    return false;
  };
  const vis = (e) => {
    const s = getComputedStyle(e);
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 &&
      !e.closest('[aria-hidden="true"],[inert],.sr-only,.visually-hidden,.skip-link') && !hiddenClip(e);
  };
  const scroller = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/auto|scroll/.test(s.overflowX + s.overflowY)) return a; } return null; };
  const name = (e) => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const text = (e) => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40);
  const box = (e) => {
    const rg = document.createRange(); rg.selectNodeContents(e);
    const rs = [...rg.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
    return rs.length ? rs.reduce((a, x) => ({ left: Math.min(a.left, x.left), top: Math.min(a.top, x.top), right: Math.max(a.right, x.right), bottom: Math.max(a.bottom, x.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 }) : null;
  };
  const leaves = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1));
  const runs = []; const clipped = [], overlap = [], crop = [], units = [];
  for (const e of leaves) {
    const t = box(e); if (!t) continue; runs.push([e, t]);
    if (getComputedStyle(e).textOverflow === 'ellipsis') continue;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a), ov = s.overflowX + s.overflowY;
      if (/auto|scroll/.test(ov)) break;
      if (/hidden|clip/.test(ov)) {
        const r = a.getBoundingClientRect(); if (r.width < 5 || r.height < 5) break;
        const d = Math.max(t.right - r.right, r.left - t.left, t.bottom - r.bottom, r.top - t.top);
        if (d > 2) clipped.push(`${name(e)} cut ${Math.round(d)}px by ${name(a)}: "${text(e)}"`);
        break;
      }
    }
    if (getComputedStyle(e).textTransform === 'uppercase' && /\d[\d.,]*\s?(nm|mhz|khz|ghz|ms|µs|us|ns|mm|kb|mb|ma|mv|kv|mw)\b/.test(e.textContent))
      units.push(`${name(e)} uppercases a unit: "${text(e)}"`);
  }
  for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
    const [e1, a] = runs[i], [e2, c] = runs[j];
    if (e1.contains(e2) || e2.contains(e1) || scroller(e1) !== scroller(e2)) continue;
    if (getComputedStyle(e1).textOverflow === 'ellipsis' || getComputedStyle(e2).textOverflow === 'ellipsis') continue;
    const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (ix > 3 && iy > 3 && ix * iy > 40) overlap.push(`${name(e1)} "${text(e1).slice(0, 25)}" over ${name(e2)} "${text(e2).slice(0, 25)}"`);
  }
  const textImg = new RegExp(textImages, 'i');
  for (const im of document.querySelectorAll('img')) {
    if (!vis(im) || !im.naturalWidth || getComputedStyle(im).objectFit !== 'cover' || !textImg.test(im.currentSrc || im.src)) continue;
    const r = im.getBoundingClientRect(); if (r.width < 40 || r.height < 20) continue;
    const nat = im.naturalWidth / im.naturalHeight, bx = r.width / r.height, lost = 1 - Math.min(nat, bx) / Math.max(nat, bx);
    if (lost > 0.04) crop.push(`${name(im)} ${(im.currentSrc || im.src).split('/').pop()} loses ${Math.round(lost * 100)}% to object-fit: cover`);
  }
  const uniq = (a) => [...new Set(a)];
  return { clipped: uniq(clipped), overlap: uniq(overlap), crop: uniq(crop), units: uniq(units) };
}

const browser = await chromium.launch();
const failures = []; let pages = 0, states = 0;
for (const [w, h, label] of widths) {
  const pg = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  for (const route of cfg.routes) {
    const res = await pg.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => null);
    if (!res || res.status() >= 400) continue;          // the sweep owns status
    pages++;
    await pg.evaluate(async () => {                        // lazy content exists, every disclosure open
      document.querySelectorAll('details').forEach((d) => { d.open = true; });
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await pg.waitForTimeout(400);
    const toggles = [];
    for (const sel of expand) toggles.push(...await pg.$$(sel));
    for (let k = 0; k <= toggles.length; k++) {
      if (k > 0) { await toggles[k - 1].evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(450); }
      if (k === 0 && toggles.length) continue;             // measure each expanded state, not the default twice
      states++;
      const m = await pg.evaluate(measure, textImages);
      const n = m.clipped.length + m.overlap.length + m.crop.length + m.units.length;
      if (n) failures.push({ width: label, route: '/' + route, state: toggles.length ? `expand ${k}/${toggles.length}` : '', ...m });
    }
  }
  await pg.close();
}
await browser.close();
if (!pages) blocked(`no route at ${BASE} answered below 400`);

const out = { base: BASE, pages, states, failures };
if (cfg.out) fs.writeFileSync(cfg.out, JSON.stringify(out, null, 1));
console.log(`clip gate: ${states} states on ${pages} page loads; ${failures.length} with cut-off, overlapping, cropped or uppercased-unit text`);
for (const f of failures) {
  console.log(`  FAIL ${f.width} ${f.route}${f.state ? ' (' + f.state + ')' : ''}`);
  for (const k of ['clipped', 'overlap', 'crop', 'units']) for (const x of f[k].slice(0, 6)) console.log(`    ${k}: ${x}`);
}
process.exit(failures.length ? 2 : 0);
