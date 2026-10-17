// =====================================================================
//  SCENES — motion reel. Layout: content x 160..1760; the ₹10 Cr bar at y 900; HUD in the 56 px frame.
// =====================================================================
const USES = [
  { id: 'proto', cr: 2.6, label: 'Prototypes' }, { id: 'respin', cr: 2.5, label: 'Respins' }, { id: 'team', cr: 2.5, label: 'Team' },
  { id: 'approve', cr: 1.0, label: 'Approvals' }, { id: 'tools', cr: 1.0, label: 'Tools & lab' }, { id: 'cont', cr: 0.3, label: 'Contingency' },
  { id: 'boards', cr: 0.1, label: 'Boards' },
];
const SMALL = ['approve', 'tools', 'cont', 'boards'];
// when each line counts as spent: on the word that names it
const SPENT = { proto: () => VW('proto', 'puts'), respin: () => VW('respin', 'held'), team: () => VW('team', 'keeps'),
  approve: () => VW('small', 'approvals'), tools: () => VW('small', 'tools'), cont: () => VW('small', 'contingency'), boards: () => VW('small', 'boards') };
const spentAt = (id) => SPENT[id]();
const balance = () => 10 - USES.reduce((s, u) => s + (TT >= spentAt(u.id) + 0.4 ? u.cr : 0), 0);
const BX = 160, BW = 1600, BY = 892, BH = 16;

// the ₹10 Cr bar: seven segments; spent ones drain to an outline; the active ones glow
function moneyBar(field, active = []) {
  const ink = mrInk(field); let x = BX;
  ctx.save(); ctx.font = `600 18px ${MRMONO}`; ctx.textBaseline = 'alphabetic';
  for (const u of USES) {
    const w = u.cr / 10 * BW - 6, k = mrOut(clamp((TT - spentAt(u.id)) / 0.5)), on = active.includes(u.id);
    ctx.globalAlpha = 1; ctx.strokeStyle = on ? MR.amber : (field === MR.navy ? 'rgba(244,246,250,0.35)' : 'rgba(11,18,32,0.35)'); ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, BY + 1, w - 2, BH - 2);
    ctx.fillStyle = on ? (field === MR.amber ? MR.ink : MR.amber) : (field === MR.navy ? 'rgba(244,246,250,0.55)' : 'rgba(11,18,32,0.55)');
    if (!(TT >= spentAt(u.id))) ctx.fillRect(x, BY, w, BH); else if (on) ctx.fillRect(x, BY, w * (1 - 0.0 * k), BH);
    if (on && w > 60) { ctx.fillStyle = ink; ctx.fillText(u.label.toUpperCase(), x, BY - 12); }
    x += w + 6;
  }
  ctx.restore();
}
const bal = () => '₹ LEFT ' + Math.max(0, balance()).toFixed(1) + ' CR';
const hud = (field, n, name) => mrHud({ field, title: 'TRANCHE 1 · WHAT ₹10 CR BUYS', section: `0${n}/07  ${name}`, right: bal() });

function sceneOpen() {
  const f = MR.navy; mrField(f);
  const t = VL('open'), here = VW('open', "here's");
  mrRoll(10, 1, 160, 600, 320, { at: t.t0 + 0.05, d: 1.1, prefix: '₹', color: MR.fg });
  mrWords('CRORE', 160 + 6, 690, 64, { at: t.t0 + 0.6, weight: 700, color: MR.amber, track: 22, mono: false });
  mrWords('Here is exactly what it buys.', 160, 800, 72, { at: here, weight: 700, color: MR.fg, stagger: 0.07 });
  // the bar assembles segment by segment under the title
  ctx.save(); let x = BX; USES.forEach((u, i) => { const w = u.cr / 10 * BW - 6; mrBar(x, BY, w, BH, MR.amber, t.t0 + 1.2 + i * 0.08, 0.5); x += w + 6; }); ctx.restore();
  hud(f, 1, 'THE RAISE');
}
function sceneProto() {
  const f = MR.amber, ink = MR.ink; mrField(f);
  const t = VL('proto');
  mrRoll(2.6, 1, 160, 470, 260, { at: t.t0, d: 0.9, prefix: '₹', color: ink });
  mrWords('CRORE', 166, 548, 44, { at: t.t0 + 0.3, weight: 700, color: ink, track: 16 });
  mrWords('Nine prototypes', 160, 690, 104, { at: VW('proto', 'nine'), weight: 800, color: ink });
  mrWords('DECEMBER 2026 SHUTTLE  ·  ~₹0.29 CR EACH', 166, 770, 30, { at: VW('proto', 'december'), weight: 600, color: ink, mono: true, stagger: 0.03 });
  // nine chips light in a 3×3 grid on "nine prototype chips"
  const g0 = VW('proto', 'nine');
  for (let i = 0; i < 9; i++) { const k = mrOut(clamp((TT - g0 - i * 0.08) / 0.35)); const cx = 1300 + (i % 3) * 150, cy = 260 + Math.floor(i / 3) * 150;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.4); ctx.translate(cx, cy + (1 - k) * 40); mrChip(0, 0, 96, k > 0.6 ? 1 : 0, MR.ink, f); ctx.restore(); }
  moneyBar(f, ['proto']); hud(f, 2, 'PROTOTYPES');
}
function sceneRespin() {
  const f = MR.navy; mrField(f);
  const t = VL('respin');
  mrRoll(2.5, 1, 160, 470, 260, { at: t.t0, d: 0.9, prefix: '₹', color: MR.fg });
  mrWords('CRORE', 166, 548, 44, { at: t.t0 + 0.3, weight: 700, color: MR.amber, track: 16 });
  mrWords('Held for respins', 160, 690, 104, { at: VW('respin', 'held'), weight: 800 });
  mrWords('ABOUT EIGHT RE-RUNS', 166, 770, 30, { at: VW('respin', 'about'), weight: 600, color: MR.dim, mono: true, stagger: 0.04 });
  // eight wafers: rings that draw on, one per re-run
  const r0 = VW('respin', 'eight');
  for (let i = 0; i < 8; i++) { const k = mrOut(clamp((TT - r0 - i * 0.07) / 0.5)); if (k <= 0) continue; const cx = 1180 + (i % 4) * 150, cy = 300 + Math.floor(i / 4) * 170;
    ctx.save(); ctx.strokeStyle = MR.amber; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 56, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    ctx.globalAlpha = 0.25 * k; ctx.lineWidth = 1.5; for (let a = -2; a <= 2; a++) { ctx.beginPath(); ctx.moveTo(cx - 40, cy + a * 16); ctx.lineTo(cx + 40, cy + a * 16); ctx.stroke(); }
    ctx.restore(); }
  moneyBar(f, ['respin']); hud(f, 3, 'RESPINS');
}
function sceneTeam() {
  const f = MR.white, ink = MR.ink; mrField(f);
  const t = VL('team');
  mrRoll(2.5, 1, 160, 470, 260, { at: t.t0, d: 0.9, prefix: '₹', color: ink });
  mrWords('CRORE', 166, 548, 44, { at: t.t0 + 0.3, weight: 700, color: MR.amberDeep, track: 16 });
  mrWords('The engineering team', 160, 690, 96, { at: VW('team', 'engineering'), weight: 800, color: ink });
  // a timeline: two spans, drawn by an eased glowing path with a head
  const y = 470, x0 = 1000, x1 = 1380, x2 = 1760, a = VW('team', 'march'), b = VW('team', 'twelve');
  ctx.save(); ctx.strokeStyle = 'rgba(11,18,32,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.restore();
  const P = []; for (let i = 0; i <= 80; i++) { const u = i / 80; P.push([x0 + (x2 - x0) * u, y - Math.sin(u * Math.PI) * 0]); }
  const ua = mrInOut(clamp((TT - a + 0.2) / 0.9)) * ((x1 - x0) / (x2 - x0)), ub = mrInOut(clamp((TT - b + 0.2) / 0.9)) * ((x2 - x1) / (x2 - x0));
  mrPath(P, ua + ub, MR.amberDeep, { w: 7, head: 12 });
  const lab = (x, top, bot, at) => { const k = mrOut(mrK(at, 0.5)); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = ink; ctx.font = `800 72px ${MRSANS}`; ctx.fillText(top, x, y - 44); ctx.font = `600 26px ${MRMONO}`; ctx.fillStyle = 'rgba(11,18,32,0.6)'; ctx.fillText(bot, x, y + 60); ctx.fillRect(x, y - 16, 3, 32); ctx.restore(); };
  lab(x0, '₹1.0 Cr', 'TO MARCH 2027', a); lab(x1, '₹1.5 Cr', 'NEXT 12 MONTHS', b);
  moneyBar(f, ['team']); hud(f, 4, 'TEAM');
}
function sceneSmall() {
  const f = MR.navy; mrField(f);
  const t = VL('small');
  mrRoll(2.4, 1, 160, 470, 260, { at: t.t0, d: 0.9, prefix: '₹', color: MR.fg });
  mrWords('CRORE', 166, 548, 44, { at: t.t0 + 0.3, weight: 700, color: MR.amber, track: 16 });
  mrWords('The last four lines', 160, 690, 96, { at: t.t0 + 0.2, weight: 800 });
  // four bars race on the words that name them
  const rows = [['approve', 'First approvals', 1.0, 'approvals'], ['tools', 'Tools and lab', 1.0, 'tools'], ['boards', 'Boards', 0.1, 'boards'], ['cont', 'Contingency', 0.3, 'contingency']];
  rows.forEach(([id, name, cr, w], i) => { const y = 250 + i * 110, at = VW('small', w);
    const k = mrOut(mrK(at, 0.6)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(k * 2); ctx.fillStyle = MR.fg; ctx.font = `700 30px ${MRSANS}`; ctx.fillText(name, 1060, y);
    ctx.font = `700 30px ${MRMONO}`; ctx.textAlign = 'right'; ctx.fillStyle = MR.amber; ctx.fillText('₹' + cr.toFixed(1), 1760, y); ctx.restore();
    mrBar(1060, y + 18, 700 * cr / 1.0, 14, MR.amber, at, 0.7); });
  moneyBar(f, SMALL); hud(f, 5, 'THE REST');
}
function sceneShare() {
  const f = MR.amber, ink = MR.ink; mrField(f);
  const t = VL('share');
  mrRoll(76, 0, 160, 640, 440, { at: t.t0, d: 1.2, suffix: '%', color: ink, track: -14 });
  mrWords('goes to chips, respins and people.', 172, 760, 64, { at: VW('share', 'goes'), weight: 700, color: ink });
  mrWords('₹7.6 CR OF ₹10 CR', 178, 830, 30, { at: VW('share', 'chips'), weight: 700, color: ink, mono: true });
  moneyBar(f, ['proto', 'respin', 'team']); hud(f, 6, 'THE SHARE');
}
function sceneClose() {
  const f = MR.navy; mrField(f);
  const t = VL('close'), p = TIMELINE.cues.payoff;
  // nine chips in a row, lit on the payoff hit (in the pause before the line), sweeping left to right
  for (let i = 0; i < 9; i++) { const k = mrOut(clamp((TT - p - i * 0.06) / 0.4)); const cx = 280 + i * 170, cy = 330;
    ctx.save(); ctx.translate(cx, cy + (1 - k) * 30); ctx.globalAlpha = 0.35 + 0.65 * k; mrChip(0, 0, 104, k > 0.5 ? 1 : 0, MR.amber, f); ctx.restore(); }
  mrWords('First silicon', 160, 610, 120, { at: VW('close', 'first'), weight: 800 });
  mrWords('for nine chips.', 160, 740, 120, { at: VW('close', 'nine'), weight: 800, color: MR.amber });
  if (TT > t.t1 + 0.2) { ctx.save(); ctx.globalAlpha = clamp((TT - t.t1 - 0.2) / 0.5); ctx.font = `500 22px ${MRMONO}`; ctx.fillStyle = MR.dim;
    ctx.fillText('PLANNED ALLOCATION, NOT SPEND  ·  PRE-SILICON  ·  NO PURCHASE ORDERS TODAY', 166, 830); ctx.restore(); }
  moneyBar(f, []); hud(f, 7, 'WHAT IT BUYS');
}

// the rush: one full-frame card per small line, cut on the word that names it; amber and navy alternate
function sceneCard(id, i) {
  const u = USES.find((x) => x.id === id), f = i % 2 ? MR.amber : MR.navy, ink = f === MR.navy ? MR.fg : MR.ink; mrField(f);
  const t0 = ERA_LIST.find(([a]) => Math.abs(a - E0) < 1e-6)[0];
  mrRoll(u.cr, 1, 160, 560, 300, { at: t0, d: 0.35, prefix: '₹', color: f === MR.navy ? MR.amber : MR.ink });
  mrWords({ approve: 'First approvals', tools: 'Tools and lab', boards: 'Bring-up boards', cont: 'Contingency' }[id], 160, 700, 104, { at: t0, d: 0.3, stagger: 0.03, color: ink });
  moneyBar(f, [id]); hud(f, 5, 'THE REST');
}
