// =====================================================================
//  SCENES — technology reel. Content x 160..1760, y 160..900; HUD in the 56 px frame. Every figure carries its kind of
//  evidence, as the site's claim register does (app/claims.ts): simulated, post-route, analytic.
// =====================================================================
const hud = (field, n, name, right) => mrHud({ field, title: 'TECHNOLOGY · DG32', section: `0${n}/07  ${name}`, right });
const shotStart = () => ERA_LIST.find(([a]) => Math.abs(a - E0) < 1e-6)[0];
// an evidence tag: a small outlined mono label
function tag(str, x, y, field, at) {
  const k = mrOut(mrK(at, 0.4)); if (k <= 0) return; const ink = mrInk(field);
  ctx.save(); ctx.globalAlpha = k; ctx.font = `700 22px ${MRMONO}`; const w = ctx.measureText(str).width + 28;
  ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(x, y - 28, w, 40); ctx.fillStyle = ink; ctx.textBaseline = 'middle'; ctx.fillText(str, x + 14, y - 8); ctx.restore();
}
// a labelled block (core, comparator, bridge...)
function block(x, y, w, h, label, field, at, o = {}) {
  const k = mrOut(mrK(at, 0.45)); if (k <= 0) return; const ink = mrInk(field);
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 24);
  ctx.fillStyle = o.fill ?? 'transparent'; ctx.strokeStyle = o.stroke ?? ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); if (o.fill) ctx.fill(); ctx.stroke();
  ctx.fillStyle = o.text ?? ink; ctx.font = `700 ${o.size ?? 26}px ${MRMONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h / 2); ctx.restore();
}
function line2(P, u, field, color) { mrPath(P, u, color ?? MR.amber, { w: 4, head: 8 }); }
const tsSeg = (a, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);

function sceneOpen() {
  const f = MR.navy; mrField(f); const t = VL('open');
  mrWords('Two chips.', 160, 470, 150, { at: t.t0, weight: 800 });
  mrWords('One frozen safety core.', 160, 640, 112, { at: VW('open', 'one'), weight: 800, color: MR.amber });
  for (let i = 0; i < 2; i++) { const k = mrOut(mrK(t.t0 + 0.2 + i * 0.15, 0.6)); ctx.save(); ctx.globalAlpha = k; ctx.translate(1380 + i * 220, 360 + (1 - k) * 40); mrChip(0, 0, 150, 1, i ? MR.amber : MR.blue, f); ctx.restore(); }
  hud(f, 1, 'THE PLATFORM', 'DG32-LITE · DG32-2DOM');
}
function sceneLock() {
  const f = MR.white, ink = MR.ink; mrField(f); const t = VL('lock');
  mrWords('Two cores in lockstep', 160, 330, 104, { at: t.t0, weight: 800, color: ink });
  mrWords('CHECKED AGAINST EACH OTHER, CONTINUOUSLY', 166, 410, 30, { at: VW('lock', 'checked'), weight: 700, color: ink, mono: true, stagger: 0.03 });
  const at = VW('lock', 'two');
  block(160, 480, 380, 150, 'CORE A', f, at, { size: 36 }); block(160, 700, 380, 150, 'CORE B', f, at + 0.12, { size: 36 });
  block(800, 575, 260, 200, '=', f, VW('lock', 'checked'), { size: 96, stroke: MR.amberDeep, text: MR.amberDeep });
  line2(tsSeg([540, 555], [800, 650]), mrInOut(mrK(VW('lock', 'checked'), 0.6)), f, MR.amberDeep);
  line2(tsSeg([540, 775], [800, 700]), mrInOut(mrK(VW('lock', 'checked') + 0.1, 0.6)), f, MR.amberDeep);
  // the cycle clock: ticks marching right, a pulse on the comparator each tick
  const c0 = VW('lock', 'continuously');
  if (TT > c0) { ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 3; const off = ((TT - c0) * 120) % 60;
    for (let x = 1160 - off; x < 1760; x += 60) { ctx.beginPath(); ctx.moveTo(x, 620); ctx.lineTo(x, 730); ctx.stroke(); }
    ctx.font = `700 24px ${MRMONO}`; ctx.fillStyle = ink; ctx.fillText('EVERY CYCLE', 1160, 790);
    ctx.globalAlpha = 0.5 + 0.5 * Math.cos((TT - c0) * Math.PI * 4); ctx.fillStyle = MR.amberDeep; ctx.beginPath(); ctx.arc(930, 735, 16, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  hud(f, 2, 'LOCKSTEP', 'DG32-LITE');
}
function sceneFault() {
  const f = MR.amber, ink = MR.ink; mrField(f); const t = VL('fault');
  mrRoll(39, 0, 160, 470, 300, { at: VW('fault', 'thirty-nine') - 0.3, d: 0.8, color: ink });
  mrWords('CYCLES', 166, 548, 44, { at: VW('fault', 'thirty-nine'), weight: 700, color: ink, track: 16 });
  mrWords('No firmware in the path.', 160, 690, 96, { at: VW('fault', 'no'), weight: 800, color: ink });
  tag('SIMULATED', 170, 800, f, VW('fault', 'thirty-nine') + 0.4);
  // the fault path: core → comparator → FAULT_N → bridge off, drawn on "shuts the motor bridge"
  const a = VW('fault', 'disagree');
  const xs = [1020, 1260, 1500], labels = ['MISMATCH', 'FAULT_N', 'BRIDGE OFF'];
  labels.forEach((l, i) => block(1100 + i * 110, 190 + i * 130, 340, 104, l, f, a + i * 0.35, { size: 32, fill: i === 2 ? MR.ink : null, text: i === 2 ? MR.amber : ink }));
  for (let i = 0; i < 2; i++) line2(tsSeg([1100 + i * 110 + 170, 294 + i * 130], [1100 + (i + 1) * 110 + 170, 190 + (i + 1) * 130]), mrInOut(mrK(a + 0.2 + i * 0.35, 0.4)), f, MR.ink);
  hud(f, 3, 'FAULT PATH', 'INJECT → LATCH');
}
function sceneClock() {
  const f = MR.navy; mrField(f); const t = VL('clock');
  mrRoll(62, 0, 160, 470, 280, { at: VW('clock', 'fifty-five') - 0.2, d: 0.9, from: 0, prefix: '55–', color: MR.fg });
  mrWords('MHz POST-ROUTE FMAX', 166, 548, 40, { at: VW('clock', 'megahertz'), weight: 700, color: MR.amber, track: 8 });
  mrWords('So it runs at a safe 50.', 160, 690, 96, { at: VW('clock', 'so'), weight: 800 });
  tag('POST-ROUTE', 170, 800, f, VW('clock', 'megahertz') + 0.3);
  // a 0–70 MHz scale: the fmax range as a bar, the 50 MHz run clock as a line
  const x0 = 1080, x1 = 1760, y = 560, sx = (m) => x0 + (x1 - x0) * m / 70;
  const k = mrOut(mrK(VW('clock', 'fifty-five'), 0.8));
  ctx.save(); ctx.strokeStyle = MR.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.font = `600 28px ${MRMONO}`; ctx.fillStyle = MR.dim; [0, 25, 50, 70].forEach((m) => ctx.fillText(m + '', sx(m) - 12, y + 52)); ctx.fillText('MHz', x1 - 50, y + 92);
  ctx.fillStyle = MR.amber; ctx.globalAlpha = k; ctx.fillRect(sx(55), y - 200, (sx(62) - sx(55)) * k, 180);
  ctx.font = `700 26px ${MRMONO}`; ctx.fillText('FMAX', sx(55), y - 216); ctx.restore();
  const r = mrOut(mrK(VW('clock', 'fifty'), 0.5));
  if (r > 0) { ctx.save(); ctx.globalAlpha = r; ctx.strokeStyle = MR.fg; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx(50), y - 260); ctx.lineTo(sx(50), y + 12); ctx.stroke();
    ctx.fillStyle = MR.fg; ctx.font = `800 52px ${MRSANS}`; ctx.textAlign = 'right'; ctx.fillText('runs at 50', sx(50) - 18, y - 220); ctx.restore(); }
  hud(f, 4, 'TIMING', 'RUNS AT 50 MHz');
}
function sceneBudget(card) {
  const f = card === 2 ? MR.amber : MR.white, ink = MR.ink; mrField(f); const t0 = shotStart();
  if (card === 0) {
    mrRoll(300, 0, 160, 470, 280, { at: VW('budget', 'three') - 0.3, d: 0.8, prefix: '~', color: ink });
    mrWords('CYCLES OF HARDWARE PER LOOP', 166, 548, 40, { at: VW('budget', 'hundred'), weight: 700, color: MR.amberDeep, track: 6 });
    mrWords('One motor-control loop', 160, 690, 96, { at: t0, weight: 800, color: ink });
    tag('SIMULATED', 170, 800, f, VW('budget', 'hundred') + 0.3);
  } else if (card === 1) {
    mrRoll(5000, 0, 160, 470, 280, { at: t0, d: 0.7, color: ink });
    mrWords('CYCLES PER PERIOD AT 10 kHz, 50 MHz', 166, 548, 36, { at: t0 + 0.1, weight: 700, color: MR.amberDeep, track: 4 });
    mrWords('At ten kilohertz', 160, 690, 96, { at: t0, weight: 800, color: ink });
  } else {
    mrRoll(82, 0, 160, 520, 320, { at: t0, d: 0.9, suffix: '%', color: ink, track: -10 });
    mrWords('left for diagnostics', 172, 690, 80, { at: VW('budget', 'left'), weight: 800, color: ink });
    tag('ANALYTIC', 176, 800, f, t0 + 0.6);
  }
  // the period as one bar: hardware ~6 %, control firmware ~12 %, diagnostics 82 % (94 % after hardware alone)
  const x0 = 1000, w = 760, y = 420, k = mrOut(mrK(t0, 0.7));
  const parts = [['HARDWARE', 0.06, MR.ink], ['FIRMWARE', 0.12, 'rgba(11,18,32,0.45)'], ['DIAGNOSTICS', 0.82, card === 2 ? MR.ink : MR.amber]];
  let x = x0; ctx.save(); ctx.font = `700 20px ${MRMONO}`;
  for (const [name, share, c] of parts) { const pw = w * share * k; ctx.fillStyle = c; ctx.fillRect(x, y, Math.max(0, pw - 4), 90);
    if (share > 0.1 && k > 0.8) { ctx.fillStyle = c === MR.amber ? MR.ink : f === MR.amber ? MR.amber : MR.white; ctx.fillText(name, x + 14, y + 52); } x += w * share * k; }
  ctx.fillStyle = 'rgba(11,18,32,0.6)'; ctx.fillText('ONE 10 kHz CONTROL PERIOD · DG32-LITE AT 50 MHz', x0, y + 140); ctx.restore();
  hud(f, 5, 'LOOP BUDGET', card === 2 ? '82% HEADROOM' : 'PER CONTROL PERIOD');
}
function sceneDom() {
  const f = MR.amber, ink = MR.ink; mrField(f); const t = VL('dom');
  mrWords('An attention engine,', 160, 330, 96, { at: t.t0, weight: 800, color: ink });
  mrWords('on its own clock.', 160, 450, 96, { at: VW('dom', 'clock'), weight: 800, color: ink });
  mrWords('DG32-2DOM · INT8 · BEHIND CDC BRIDGES', 166, 530, 30, { at: VW('dom', 'bridges'), weight: 700, color: ink, mono: true, stagger: 0.03 });
  // two clock lanes ticking at their own rates, joined by bridges
  const lane = (y, label, mhz, at, color) => { const k = mrOut(mrK(at, 0.5)); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = ink; ctx.font = `800 40px ${MRSANS}`; ctx.fillText(mhz + ' MHz', 160, y + 14); ctx.font = `700 22px ${MRMONO}`; ctx.fillText(label, 400, y + 10);
    ctx.strokeStyle = color; ctx.lineWidth = 4; const step = 3000 / mhz, off = (TT * 60) % step;
    for (let x = 900 - off; x < 1760; x += step) { ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x, y + 24); ctx.stroke(); } ctx.restore(); };
  lane(680, 'CONTROL CORE · FROZEN', 50, t.t0 + 0.3, MR.ink);
  lane(820, 'INT8 ATTENTION ENGINE', 114, VW('dom', 'one-hundred-fourteen') - 0.1, MR.ink);
  const b = mrOut(mrK(VW('dom', 'bridges'), 0.5));
  if (b > 0) { ctx.save(); ctx.globalAlpha = b; ctx.fillStyle = MR.ink; [1100, 1400, 1650].forEach((x) => { ctx.fillRect(x - 3, 704, 6, 92); ctx.font = `700 18px ${MRMONO}`; ctx.fillText('CDC', x + 10, 756); }); ctx.restore(); }
  hud(f, 6, 'DG32-2DOM', '50 + 114 MHz');
}
function sceneClose() {
  const f = MR.navy; mrField(f); const t = VL('close'), p = TIMELINE.cues.payoff;
  for (let i = 0; i < 2; i++) { const k = mrOut(mrK(p + i * 0.1, 0.5)); ctx.save(); ctx.globalAlpha = 0.3 + 0.7 * k; ctx.translate(1380 + i * 220, 360); mrChip(0, 0, 150, k > 0.5 ? 1 : 0, i ? MR.amber : MR.blue, f); ctx.restore(); }
  mrWords('Two chips.', 160, 470, 150, { at: t.t0, weight: 800 });
  mrWords('One frozen safety core.', 160, 640, 112, { at: VW('close', 'one'), weight: 800, color: MR.amber });
  if (TT > t.t1 + 0.1) { ctx.save(); ctx.globalAlpha = clamp((TT - t.t1 - 0.1) / 0.5); ctx.font = `500 22px ${MRMONO}`; ctx.fillStyle = MR.dim;
    ctx.fillText('PRE-SILICON  ·  SIMULATED, POST-ROUTE AND ANALYTIC FIGURES  ·  APP/CLAIMS REGISTER ON /EVIDENCE', 166, 780); ctx.restore(); }
  hud(f, 7, 'THE PLATFORM', 'PRE-SILICON');
}
