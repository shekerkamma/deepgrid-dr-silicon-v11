// =====================================================================
//  SCENES — applications opener. Isometric line art on the site's navy (DESIGN.md: Page #0b1220, Light Blue
//  #7fb0e6 as the one accent). Each world anchors its iso origin so the hero chip lands on HERO_AT exactly.
//  Draw back to front; every move settles on a spring; one accent per frame: the chip's fault pin.
// =====================================================================
Object.assign(PAL, { paper: '#0b1220', face: '#0b1220', edge: '#8fa3bf', inner: '#26344d', accent: '#7fb0e6', text: '#e2e8f0', textD: '#7c8aa3' });
STYLE.paper = PAL.paper;   // the kit read the ground before this override

// put world point p (the chip's corner) on the fixed screen point
function anchorIso(u, p, at = HERO_AT) { setIso({ u, ox: at[0] - (p[0] - p[1]) * u, oy: at[1] - ((p[0] + p[1]) * 0.5 - p[2] * ZK) * u }); }
const drop = (t0, h = 220, k = 160) => (1 - spring(TT, E0 + t0, { k, damp: 0.6 })) * h;
const on = (t0) => TT > E0 + t0;

// ---- the hero: a QFN chip with pads on its edges, the DeepGrid mark, and the fault pin as the accent
const CHIP = 124, CHIPH = 16;
function heroChip(x, y, z, label, o = {}) {
  { const m = ctx.getTransform(), q = iso(x, y, z); SPARK_AT = [m.a * q[0] + m.c * q[1] + m.e, m.b * q[0] + m.d * q[1] + m.f]; }   // measured, for the anchor check
  isoBox(x, y, z, CHIP, CHIP, CHIPH, { r: 8, seg: 3 });
  const top = faceOf([x, y, z + CHIPH], [1, 0, 0], [0, 1, 0]);
  faceRR(top, 10, 10, CHIP - 20, CHIP - 20, 6, { stroke: PAL.inner });
  // pads on the two edges that face us (repetition carries the detail)
  const fx = faceOf([x, y + CHIP, z + CHIPH], [1, 0, 0], [0, 0, -1]), fy = faceOf([x + CHIP, y, z + CHIPH], [0, 1, 0], [0, 0, -1]);
  for (let i = 0; i < 9; i++) { faceRR(fx, 12 + i * 11.8, CHIPH - 5, 6, 4, 1, { stroke: PAL.edge }); faceRR(fy, 12 + i * 11.8, CHIPH - 5, 6, 4, 1, { stroke: PAL.edge }); }
  isoText(top, 'DG', 24, 54, 28, { color: PAL.textD });
  if (label) isoText(top, label, 24, 90, 22, { color: PAL.text });
  if (o.accent !== false) accentDot(top, CHIP - 22, 22, 7);   // the fault pin
}
// a plain part (no accent): a smaller chip or a passive block
function part(x, y, z, w, d, h, label) {
  isoBox(x, y, z, w, d, h, { r: 5, seg: 2 });
  if (label) isoText(faceOf([x, y, z + h], [1, 0, 0], [0, 1, 0]), label, 8, d / 2 + 6, 14, { color: PAL.textD });
}
// a circuit board: two stacked plates with a trace or two
function board(x, y, z, w, d) { isoPlates(x, y, z, w, d, [{ h: 12, r: 26 }, { h: 4, gap: 3, inset: 10, r: 20 }]); return z + 19; }

// ---- captions, left-aligned like the site's headings: a mono tag, a short rule, then the line
function capNow(tag, str) {
  const a = clamp(spring(TT, E0 + 0.2, { k: 120, damp: 0.8 }));
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `400 26px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.fillText(tag, 120, 888);
  polyPath([[120, 912], [120 + 56 * a, 912]], false); hair(PAL.accent); ctx.stroke();
  ctx.font = `500 46px ${SANS}`; ctx.fillStyle = PAL.text;
  const words = str.split(' '); let line = '', y = 972;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > 1060 && line) { ctx.fillText(line, 120, y + (1 - a) * 14); line = w; y += 58; } else line = t; }
  ctx.fillText(line, 120, y + (1 - a) * 14);
  ctx.restore();
}
const cap = (tag, str) => { const f = () => capNow(tag, str); if (DEFER) DEFER.push(f); else f(); };
const longShot = () => { const e = ERA_LIST.find(([a]) => Math.abs(a - E0) < 1e-6); return !!e && e[1] - e[0] >= 1 - 1e-6; };

// ---- the chip alone: the open's second beat and the silence before the payoff
function sceneAlone() {
  anchorIso(1.6, [0, 0, 0]);
  heroChip(0, 0, 0, '', { accent: TT < 14.5 });
  if (TT < 2) cap('DeepGrid Semi', 'Twelve architectures.');
}

// ---- motors and drives: SKU-1 runs the motor, SKU-4 beside it can stop it
function sceneMotor() {
  anchorIso(1.15, [40, 40, 19]);
  const bz = board(-260, -170, 0, 520, 420);
  // power stage: a row of six switches, rising in a wave
  isoGrid(6, 1, (i) => part(-230 + i * 48, -150, bz + 0 * drop(0.1 + i * 0.04, 80), 34, 40, 18));
  // the supervisor chip, beside the drive chip
  if (on(0.25)) part(-200, 40 + drop(0.3, 0, 1), bz + drop(0.3, 160), 70, 70, 12, 'SKU-4');
  isoCable([[-130, 110, bz + 6], [-60, 110, bz + 6], [-20, 90, bz + 6]], { w: 4 });   // the trip line to the drive
  heroChip(40, 40, bz, 'SKU-1');
  // the motor: a stator drum with fins, on the floor to the right, wired from the board
  if (on(0.4)) {
    const mz = drop(0.45, 180);
    isoCable([[260, 0, bz - 6], [330, 0, 30], [380, 30, 40 + mz]], { w: 7 });
    isoCyl(470, 60, mz, 100, 130);
    const tf = faceOf([470 - 100, 60 + 100, mz + 130], [1, 0, 0], [0, -1, 0]);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + TT * 2.2; faceLine(tf, [[100 + Math.cos(a) * 26, 100 + Math.sin(a) * 26], [100 + Math.cos(a) * 78, 100 + Math.sin(a) * 78]], PAL.inner); }
    faceEll(tf, 100, 100, 20, 20, { stroke: PAL.edge });
  }
  if (longShot()) cap('Motors and drives · SKU-1, SKU-4', 'In a motor drive, one chip runs the motor and another can stop it safely.');
}

// ---- vehicles: the chips sit at the edges. A long skateboard chassis (nose to the right); the battery pack in the
//      middle, the zonal box on the near front corner carrying the chip, the radar at the nose, all wired along the floor.
function sceneVehicle() {
  anchorIso(0.9, [20, 130, 64]);
  isoCyl(-330, -40, 0, 50, 36); isoCyl(200, -40, 0, 50, 36);                    // far wheels
  isoBox(-440, -40, 30, 760, 320, 22, { r: 34, seg: 4 });                         // chassis floor
  const pz = 52 + drop(0.15, 160);                                                // the battery pack drops in
  isoBox(-380, 10, pz, 300, 230, 26, { r: 16 });
  const lid = faceOf([-380, 10, pz + 26], [1, 0, 0], [0, 1, 0]);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) faceRR(lid, 20 + i * 54, 20 + j * 50, 40, 36, 6, { stroke: PAL.inner });
  if (on(0.3)) part(-330, 60, pz + 26, 76, 70, 10, 'SKU-11');                     // the battery controller on the pack
  isoCable([[-80, 160, 58], [-40, 170, 58], [0, 180, 58]], { w: 4 });            // pack to zonal box
  isoBox(-10, 100, 52, 190, 160, 12, { r: 14 });                                   // the zonal box
  if (on(0.4)) { const rz = 52 + drop(0.45, 140);                                  // the radar at the nose
    isoBox(330, 60, rz, 46, 140, 64, { r: 10 });
    const rf = faceOf([376, 60, rz + 64], [0, 1, 0], [0, 0, -1]);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) faceRR(rf, 14 + i * 20, 12 + j * 16, 12, 8, 2, { stroke: PAL.inner });
    isoText(faceOf([330, 60, rz + 64], [1, 0, 0], [0, 1, 0]), 'SKU-7', 8, 80, 14, { color: PAL.textD });
    isoCable([[180, 150, 58], [260, 140, 56], [330, 130, rz + 20]], { w: 4 }); }
  heroChip(20, 130, 64, 'SKU-9');
  isoCyl(-330, 280, 0, 50, 36); isoCyl(200, 280, 0, 50, 36);                      // near wheels, last
  if (longShot()) cap('Vehicles · SKU-9, SKU-7, SKU-11', 'In a vehicle, the chips sit at the edges.');
}

// ---- grid and metering: the meter, its display, mains cut, and the tamper log keeping time
function sceneMeter() {
  anchorIso(0.95, [30, 140, 19]);
  // the meter case standing behind the board
  const cx = -120, cy = -220, cw = 340, cd = 120, ch = 280;
  isoBox(cx, cy, 0, cw, cd, ch, { r: 18, seg: 4 });
  const front = faceOf([cx, cy + cd, ch], [1, 0, 0], [0, 0, -1]);
  const mains = TT < TIMELINE.cues.mainsCut;
  faceRR(front, 40, 60, 260, 110, 10, { stroke: PAL.edge });
  isoText(front, mains ? '0042.7 kWh' : '-- -- --', 64, 128, 34, { color: mains ? PAL.text : PAL.textD });
  for (let i = 0; i < 4; i++) lamp(front, 60 + i * 34, 200, 7, mains && blinkOn(TT, 0.5, i * 0.12));
  faceRR(front, 40, 236, 260, 30, 8, { stroke: PAL.inner });   // terminal cover
  for (let i = 0; i < 6; i++) faceRR(front, 56 + i * 40, 240, 24, 20, 4, { stroke: PAL.edge });
  // the board in front, the chip on it
  const bz = board(-150, 0, 0, 400, 300);
  part(180, 40, bz, 60, 60, 10, 'SKU-5');
  part(-120, 200, bz, 80, 40, 10, 'SKU-8');
  // the tamper magnet that arrives after mains is cut
  if (TT > TIMELINE.cues.mainsCut + 0.3) { const mz = drop(TIMELINE.cues.mainsCut + 0.3 - E0, 140); isoBox(300, 230, mz + bz, 60, 40, 30, { r: 6 }); }
  heroChip(30, 140, bz, 'SKU-2', { accent: mains || blinkOn(TT, 0.5) });   // on battery the log keeps blinking
  if (longShot()) cap('Grid and metering · SKU-2', 'One chip measures the power and records tampering, even with mains cut.');
}

// ---- defence, avionics and drones: a quad frame; the failsafe line runs from the chip straight to the four motor drives
function sceneDrone() {
  anchorIso(1.0, [40, 40, 60]);
  const arm = (x0, y0, x1, y1) => isoBox(Math.min(x0, x1), Math.min(y0, y1), 40, Math.abs(x1 - x0) || 16, Math.abs(y1 - y0) || 16, 10, { r: 6 });
  const ends = [[-260, 100], [100, -260], [100, 460], [460, 100]];
  // back arms first, then the body, then the front arms
  arm(-260, 92, 0, 108); arm(92, -260, 108, 0);
  ends.slice(0, 2).forEach(([x, y]) => { isoCyl(x, y, 50, 24, 20); const rf = faceOf([x - 70, y - 70, 74], [1, 0, 0], [0, 1, 0]);
    faceEll(rf, 70, 70, 70, 70, { stroke: PAL.inner }); const a = TT * 30; faceLine(rf, [[70 + Math.cos(a) * 66, 70 + Math.sin(a) * 66], [70 - Math.cos(a) * 66, 70 - Math.sin(a) * 66]], PAL.edge); });
  isoBox(-20, -20, 40, 240, 240, 20, { r: 26 });   // the body plate
  arm(200, 92, 460, 108); arm(92, 200, 108, 460);
  ends.slice(2).forEach(([x, y]) => { isoCyl(x, y, 50, 24, 20); const rf = faceOf([x - 70, y - 70, 74], [1, 0, 0], [0, 1, 0]);
    faceEll(rf, 70, 70, 70, 70, { stroke: PAL.inner }); const a = TT * 30 + 1; faceLine(rf, [[70 + Math.cos(a) * 66, 70 + Math.sin(a) * 66], [70 - Math.cos(a) * 66, 70 - Math.sin(a) * 66]], PAL.edge); });
  // the failsafe lines: hairlines from the chip to each motor drive, drawn on in turn
  ends.forEach(([x, y], i) => { const k = clamp((TT - E0 - 0.3 - i * 0.12) / 0.3); if (k <= 0) return;
    const c = [100, 100, 62]; line3([c, [lerp(c[0], x, k), lerp(c[1], y, k), 62]], PAL.edge); });
  part(150, -10, 60, 50, 40, 10, 'SKU-3');
  heroChip(40, 40, 60, 'D100');
  if (longShot()) cap('Defence, avionics and drones · D100, SKU-3', 'A failsafe that does not depend on software can still land the airframe.');
}
// ---- on nearly every board: three boards in the rush, the chip in the same spot on each
function sceneBoard(k) {
  anchorIso(1.15, [40, 40, 19]);
  const bz = board(-220, -180, 0, 460, 380);
  if (k === 0) { [[-180, -140], [-110, -140], [-40, -140], [30, -140]].forEach(([x, y]) => isoCyl(x + 22, y + 22, bz, 22, 26)); }   // four rails' inductors
  if (k === 1) { isoBox(-200, 100, bz, 40, 160, 30, { r: 4 }); const hf = faceOf([-200, 100, bz + 30], [1, 0, 0], [0, 1, 0]); for (let i = 0; i < 8; i++) faceRR(hf, 12, 10 + i * 18, 14, 10, 2, { stroke: PAL.edge });
    isoCable([[-200, 180, bz + 10], [-300, 190, 20], [-360, 210, 20]], { w: 6 }); }   // the bus header and its harness
  if (k === 2) { part(-170, -130, bz, 90, 60, 10, 'FLASH'); isoBox(170, -140, bz, 60, 60, 24, { r: 8 }); }   // external flash, a regulator
  heroChip(40, 40, bz, ['SKU-6', 'SKU-5', 'SKU-10'][k]);
  if (longShot()) cap('On nearly every board · SKU-6, SKU-5, SKU-10', 'Some parts go on nearly every circuit board, which is where the volume is.');
}

// ---- the payoff ring: the five worlds as small objects round the chip, each wired to it
function miniMotor(x, y, z) { isoCyl(x, y, z, 46, 60); }
function miniMeter(x, y, z) { isoBox(x - 40, y - 20, z, 80, 40, 120, { r: 8 }); faceRR(faceOf([x - 40, y + 20, z + 120], [1, 0, 0], [0, 0, -1]), 12, 18, 56, 26, 4, { stroke: PAL.inner }); }
function miniCar(x, y, z) { isoBox(x - 80, y - 36, z + 14, 160, 72, 30, { r: 14 }); isoBox(x - 40, y - 30, z + 44, 80, 60, 26, { r: 12 }); [-50, 50].forEach(dx => isoCyl(x + dx, y + 40, z, 14, 10)); }
function miniDrone(x, y, z) { isoBox(x - 70, y - 6, z + 20, 140, 12, 8, { r: 4 }); isoBox(x - 6, y - 70, z + 20, 12, 140, 8, { r: 4 }); [[-70, 0], [70, 0], [0, -70], [0, 70]].forEach(([dx, dy]) => isoCyl(x + dx, y + dy, z + 28, 26, 4)); isoBox(x - 22, y - 22, z + 14, 44, 44, 20, { r: 8 }); }
function miniBoard(x, y, z) { isoPlates(x - 70, y - 50, z, 140, 100, [{ h: 8, r: 14 }]); [[-50, -30], [-5, -20], [30, 10]].forEach(([dx, dy]) => isoBox(x + dx, y + dy, z + 8, 26, 26, 8, { r: 3 })); }
// positions solved from screen offsets round the anchor (a pentagon that clears the caption, bottom left)
const RING = [['motor', miniMotor, -278, 70], ['meter', miniMeter, -317, -187], ['vehicle', miniCar, -91, -378], ['drone', miniDrone, 261, -157], ['board', miniBoard, 296, 139]];
const RING_NAME = { motor: 'Motors and drives', meter: 'Grid and metering', vehicle: 'Vehicles', drone: 'Defence, avionics and drones', board: 'On nearly every board' };
function sceneRing() {
  anchorIso(1.15, [0, 0, 0]);
  const payoff = E0 >= TIMELINE.cues.payoff - 1e-6;
  const out = payoff ? 0 : clamp((TT - 0.55) / 0.4);          // the flash-forward falls away before the cut
  RING.forEach(([key, fn, x, y], i) => {
    const s = payoff ? spring(TT, E0 + 0.1 + i * 0.08, { k: 140, damp: 0.6 }) : 1 - out;
    if (s <= 0.02) return;
    isoCable([[48, 48, 8], [lerp(48, x, 0.5), lerp(48, y, 0.5), 4], [x, y, 4]], { w: 3 });
    const z = (1 - s) * 160;
    fn(x, y, z);
    // the hold names each role in turn (a reveal every 0.6 s, so the end is never still)
    const la = payoff ? clamp((TT - 16.7 - i * 0.55) / 0.25) : 0;
    if (la > 0) { const [sx, sy] = iso(x, y, 0); const fl = () => { ctx.save(); ctx.globalAlpha = la; ctx.font = `500 28px ${SANS}`; ctx.fillStyle = PAL.text; const left = key === 'meter'; ctx.textAlign = left ? 'right' : 'center';   // the meter's cable runs under it: label to its left
      ctx.fillText(RING_NAME[key], left ? sx - 96 : sx, (left ? sy - 40 : sy + 96) + (1 - la) * 10); ctx.restore(); }; if (DEFER) DEFER.push(fl); else fl(); }
  });
  heroChip(0, 0, 0, '', {});
  if (payoff && longShot()) cap('Applications', 'Twelve architectures. Five system roles.');
  if (payoff && TT > 18.5) {
    ctx.save(); ctx.font = `400 22px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.textAlign = 'left';
    ctx.globalAlpha = clamp((TT - 18.5) / 0.4); ctx.fillText('Pre-silicon · concept illustration', 120, 1040); ctx.restore();
  }
}
