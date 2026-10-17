// =====================================================================
//  styles/motionreel/kit.js — graphic motion design in the manner of a motion-designer showreel: full-bleed colour
//  fields that cut on the beat, huge kinetic type that rises from a masked baseline, rolling slot-counter numerals,
//  eased bars and glowing motion paths, and a crisp HUD frame (corner brackets, timecode, section counter, balance).
//  One accent colour carries the meaning. Studied from motion-reel references (kept local, never copied).
//  Deterministic: everything is a function of TT; no state between frames.
// =====================================================================
const MR = {
  navy: '#0b1220', ink: '#0b1220', white: '#f4f6fa', amber: '#f0a020', amberDeep: '#c98500', blue: '#7fb0e6',
  fg: '#f4f6fa', dim: '#8fa3bf', line: 'rgba(244,246,250,0.18)',
};
const MRSANS = '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif';
const MRMONO = 'Consolas, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace';
// easing
const mrOut = (t) => 1 - Math.pow(1 - clamp(t), 4);              // quart out
const mrExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));
const mrInOut = (t) => { t = clamp(t); return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; };
const mrK = (t0, d = 0.6) => clamp((TT - t0) / d);              // progress of a move that starts at t0
// the field: a full-bleed colour with a faint grid and a soft vignette
function mrField(c, o = {}) {
  ctx.save(); ctx.fillStyle = c; ctx.fillRect(0, 0, W, H);
  const dark = c === MR.navy;
  ctx.strokeStyle = dark ? 'rgba(127,176,230,0.06)' : 'rgba(11,18,32,0.06)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 96) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 96) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
  const g = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.2, W * 0.5, H * 0.5, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.10)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
const mrInk = (field) => (field === MR.navy ? MR.fg : MR.ink);
const mrDim = (field) => (field === MR.navy ? MR.dim : 'rgba(11,18,32,0.55)');
// kinetic line: each word rises from below a mask line, staggered
function mrWords(str, x, y, size, o = {}) {
  const t0 = o.at ?? 0, st = o.stagger ?? 0.06, weight = o.weight ?? 800, color = o.color ?? MR.fg, track = o.track ?? 0;
  ctx.save(); ctx.font = `${weight} ${size}px ${o.mono ? MRMONO : MRSANS}`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
  if (track) ctx.letterSpacing = track + 'px';
  const words = str.split(' '); let cx = x;
  const total = words.reduce((w, s, i) => w + ctx.measureText(s).width + (i ? ctx.measureText(' ').width : 0), 0);
  if (o.align === 'center') cx = x - total / 2; else if (o.align === 'right') cx = x - total;
  for (let i = 0; i < words.length; i++) {
    const k = mrExpo(mrK(t0 + i * st, o.d ?? 0.7)), w = ctx.measureText(words[i]).width;
    if (k < 0.12) { cx += w + ctx.measureText(' ').width; continue; }   // not rising yet: draw nothing (the text check traces clipped text too)
    ctx.save(); ctx.beginPath(); ctx.rect(cx - 4, y - size * 1.05, w + 8, size * 1.32); ctx.clip();
    ctx.fillText(words[i], cx, y + (1 - k) * size * 1.15); ctx.restore();
    cx += w + ctx.measureText(' ').width;
  }
  ctx.restore(); return total;
}
// a rolling numeral: each digit is a reel that rolls to its target value (slot counter), with a short streak
function mrRoll(value, decimals, x, y, size, o = {}) {
  const t0 = o.at ?? 0, d = o.d ?? 1.0, from = o.from ?? 0, k = mrOut(mrK(t0, d)), v = from + (value - from) * k;
  const txt = (o.prefix ?? '') + v.toFixed(decimals) + (o.suffix ?? '');
  ctx.save(); ctx.font = `${o.weight ?? 900} ${size}px ${MRSANS}`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = o.color ?? MR.fg;
  ctx.letterSpacing = (o.track ?? -4) + 'px';
  const total = ctx.measureText(txt).width; let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  // the fractional part of the rolling value moves the last digit's reel; blur it while it moves fast
  const speed = (1 - k) * 3;
  for (const ch of txt) {
    const w = ctx.measureText(ch).width;
    if (/[0-9]/.test(ch) && speed > 0.05) { ctx.save(); ctx.globalAlpha = 0.25; ctx.fillText(ch, cx, y - size * 0.08 * speed); ctx.fillText(ch, cx, y + size * 0.08 * speed); ctx.restore(); }
    ctx.fillText(ch, cx, y); cx += w;
  }
  ctx.restore(); return total;
}
// a bar that grows with easing from x0, height h
function mrBar(x, y, w, h, color, t0, d = 0.8) { const k = mrOut(mrK(t0, d)); ctx.fillStyle = color; ctx.fillRect(x, y, w * k, h); return k; }
// a glowing motion path drawn along points P up to fraction u, with a bright head
function mrPath(P, u, color, o = {}) {
  if (u <= 0) return; const n = Math.max(2, Math.floor(P.length * clamp(u)));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, a] of [[o.w * 4 || 14, 0.12], [o.w * 2 || 7, 0.25], [o.w || 3.5, 1]]) {
    ctx.strokeStyle = color; ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath(); P.slice(0, n).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  const [hx, hy] = P[n - 1]; ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.shadowColor = color; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(hx, hy, o.head ?? 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
// a chip glyph: rounded square with pins, filled when lit
function mrChip(x, y, s, lit, color, field) {
  const ink = mrInk(field); ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = ink; ctx.globalAlpha = 0.9; ctx.lineWidth = Math.max(2, s * 0.03);
  for (let i = 0; i < 4; i++) { const p = -s * 0.3 + i * s * 0.2; for (const [a, b, c, d] of [[p, -s / 2, p, -s / 2 - s * 0.1], [p, s / 2, p, s / 2 + s * 0.1], [-s / 2, p, -s / 2 - s * 0.1, p], [s / 2, p, s / 2 + s * 0.1, p]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); } }
  ctx.globalAlpha = 1; ctx.fillStyle = lit > 0 ? color : 'transparent'; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.12);
  if (lit > 0) { ctx.globalAlpha = lit; ctx.fill(); ctx.globalAlpha = 1; } ctx.stroke(); ctx.restore();
}
// the HUD: corner brackets, title, timecode, section counter with progress, and a right-hand readout
function mrHudNow(o) {
  const ink = mrInk(o.field), dim = mrDim(o.field), m = 56, L = 34;
  ctx.save(); ctx.strokeStyle = dim; ctx.lineWidth = 2;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); }
  ctx.font = `700 20px ${MRMONO}`; ctx.fillStyle = ink; ctx.textBaseline = 'middle'; ctx.fillText('DEEPGRID', m + 18, m + 22);
  ctx.fillStyle = dim; ctx.font = `400 20px ${MRMONO}`; ctx.fillText(o.title, m + 18 + 112, m + 22);
  const f = Math.floor(TT * FPS), s = Math.floor(f / FPS), tc = `TC 00:00:${String(s).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  ctx.textAlign = 'right'; ctx.fillStyle = ink; ctx.fillText(tc, W - m - 18, m + 22);
  ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.font = `700 20px ${MRMONO}`; ctx.fillText(o.section, m + 18, H - m - 22);
  const px = m + 18 + 220, pw = 420; ctx.fillStyle = dim; ctx.fillRect(px, H - m - 23, pw, 2); ctx.fillStyle = MR.amber; ctx.fillRect(px, H - m - 23, pw * clamp(TT / DURATION), 2);
  if (o.right) { ctx.textAlign = 'right'; ctx.font = `700 20px ${MRMONO}`; ctx.fillStyle = ink; ctx.fillText(o.right, W - m - 18, H - m - 22); }
  ctx.restore();
}
const mrHud = (o) => { const f = () => mrHudNow(o); if (DEFER) DEFER.push(f); else f(); };

const STYLE = {
  name: 'motionreel',
  paper: MR.navy,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); ctx.fillStyle = c; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.restore(); },
  hero(x, y, r) { ctx.save(); ctx.fillStyle = MR.amber; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); },
  heroColor: '#f0a020',
  post() {},
  ones: true,
};
