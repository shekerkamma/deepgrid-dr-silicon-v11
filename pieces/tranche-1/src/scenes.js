// =====================================================================
//  SCENE — one continuous glass-3D stage. World units: 1 ≈ ₹0.5 Cr of block width. The block sits at the origin;
//  stations stand in a row along +x; the camera glides between them on eased keys and pulls back for the payoff.
// =====================================================================
const cu = TIMELINE.cues;
const ez = (t) => t * t * (3 - 2 * t);
const span = (t, a, b) => ez(clamp((t - a) / (b - a)));
const BLOCK = { w: 5.0, h: 1.0, d: 2.0 };
// each line's slab: its width is its share of the block; where it starts inside the block, and when it leaves
const SLABS = (() => { let x = -BLOCK.w / 2; return USES.map((u, i) => { const w = u.cr / 10 * BLOCK.w, s = { ...u, w, x0: x + w / 2 }; x += w; return s; }); })();
const LEAVE = { proto: cu.proto + 0.1, respin: cu.respin + 0.1, team: cu.team + 0.1, approve: cu.small, tools: cu.small + 0.5, cont: cu.small + 1.0, boards: cu.small + 1.5 };
const STATION = { proto: [8, 0, 0], respin: [14, 0, 0], team: [20, 0, 0], approve: [24.7, 0, 0], tools: [25.6, 0, 0], cont: [26.4, 0, 0], boards: [27.0, 0, 0] };   // the small lines stand in a row
const balance = (t) => 10 - USES.reduce((s, u) => s + (t >= LEAVE[u.id] + 0.6 ? u.cr : 0), 0);

// camera keys: [t, position, look-at]
const TR_CAM = [   // each glide starts on its line's cue and arrives about a second later, so the title matches what is in view
  [0.0,  [0.6, 2.4, 7.4], [0, 0.3, 0]],
  [2.5,  [1.5, 2.9, 8.6], [0.5, 0.1, 0]],
  [3.6,  [9.2, 3.0, 7.6], [8, 0.2, 0]],
  [6.0,  [9.6, 3.1, 7.4], [8.4, 0.2, 0]],
  [7.0,  [15.2, 3.2, 7.2], [14, 0.3, 0]],
  [9.0,  [15.6, 3.2, 7.0], [14.4, 0.3, 0]],
  [10.0, [21.2, 3.0, 7.4], [20, 0.4, 0]],
  [12.0, [21.8, 3.1, 7.6], [20.6, 0.4, 0]],
  [12.9, [26.6, 3.6, 7.8], [25.9, 0.2, 0]],
  [14.5, [27.0, 3.8, 8.0], [26.0, 0.2, 0]],
  [14.8, [14.0, 4.6, 14.0], [14.0, 0.1, 0]],   // the silence: a held mid-shot of the three big lines
  [15.5, [14.0, 4.6, 14.0], [14.0, 0.1, 0]],
  [16.4, [14.0, 5.2, 15.5], [14.0, 0.2, 1.5]],
  [20.0, [14.0, 5.6, 16.8], [14.0, 0.3, 1.5]],
];
function trCamAt(t) {
  let i = 0; while (i < TR_CAM.length - 2 && t >= TR_CAM[i + 1][0]) i++;
  const [t0, p0, a0] = TR_CAM[i], [t1, p1, a1] = TR_CAM[i + 1], u = span(t, t0, t1);
  const L = (a, b) => a.map((v, k) => lerp(v, b[k], u));
  return [L(p0, p1), L(a0, a1)];
}
// the nine chips: the flash-forward row and the payoff row
const CHIP = { w: 0.62, h: 0.14, d: 0.62 };
function chips(t, scene) {
  // 0–1.0: a row in front of the block; 1.0–2.0: fold into the block; 15.5+: rise as the payoff row in front of all stations
  const fold = span(t, cu.fold, cu.fold + 1.0), rise = g3Spring(t, cu.payoff + 0.2, { k: 90, damp: 0.6 });
  for (let i = 0; i < 9; i++) {
    let p, s = 1;
    if (t < cu.payoff) {
      if (fold >= 1) continue;
      const a = [(i - 4) * 0.62, 0.35 + Math.sin(t * 2 + i) * 0.04, 1.2];
      p = a.map((v, k) => lerp(v, [0, 0, 0][k], fold)); s = 1 - fold * 0.9;
    } else {
      if (rise <= 0.001) continue;
      p = [14 + (i - 4) * 0.92, -0.35 + rise * 1.1, 7.6]; s = (0.4 + 0.6 * clamp(rise)) * 1.25;   // the payoff row: lower third, in front of the stations
    }
    g3Mesh(g3Box(CHIP.w, CHIP.h, CHIP.d, 0.05), g3Mat('dark'), p, [0, 0.35, 0], s);
    g3Mesh(g3Box(CHIP.w * 0.62, 0.02, CHIP.d * 0.62, 0.01), g3Mat('die'), [p[0], p[1] + CHIP.h * s / 2 + 0.01, p[2]], [0, 0.35, 0], s);
    for (let j = 0; j < 5; j++) for (const side of [-1, 1]) {   // pins on two edges
      const off = (j - 2) * 0.11 * s, e = side * (CHIP.d / 2 + 0.02) * s, c = Math.cos(0.35), sn = Math.sin(0.35);
      g3Mesh(g3Box(0.05, 0.03, 0.06, 0.01), g3Mat('light', '#8fa3bf'), [p[0] + off * c + e * sn, p[1] - CHIP.h * s * 0.3, p[2] - off * sn + e * c], [0, 0.35, 0], s);
    }
  }
}
function pedestal(x, z = 0, w = 4.2, d = 3.2) {   // a navy glass floor tile with a thin light-blue front edge
  g3Mesh(g3Box(w, 0.1, d, 0.06), g3Mat('floor'), [x, -0.62, z]);
  g3Mesh(g3Box(w - 0.2, 0.012, 0.012, 0.004), g3Mat('light'), [x, -0.56, z + d / 2 - 0.02]);
}

function sceneStage() {
  const t = TT;
  g3Frame((scene, cam) => {
    const [cp, ca] = trCamAt(t); g3Look(cp, ca);
    g3Dust('stage', 420, [-6, 32, -1.5, 5, -6, 6], t);
    pedestal(0, 0, 6.4, 3.4);
    ['proto', 'respin', 'team'].forEach((k) => pedestal(STATION[k][0]));
    pedestal(25.9, 0, 4.2, 3.6);
    // the block: whatever has not left yet stays in place; leaving slabs arc to their station and land
    for (const s of SLABS) {
      const t0 = LEAVE[s.id], u = span(t, t0, t0 + 0.9);
      if (t < cu.fold + 0.6) {   // the block grows in as the chips fold into it
        const g = span(t, cu.fold + 0.2, cu.fold + 1.0); if (g <= 0) continue;
        g3Mesh(g3Box(s.w - 0.03, BLOCK.h, BLOCK.d, 0.06), g3Mat('warm'), [s.x0, 0, 0], [0, 0, 0], [1, g, 1]); continue;
      }
      const dst = STATION[s.id], small = !['proto', 'respin', 'team'].includes(s.id);
      const end = small ? [dst[0], -0.25, dst[2]] : [dst[0] - 1.5, -0.05, dst[2] + 0.6];
      // a low arc that swings slightly toward the camera (+z): with the camera above, that keeps it in the lower half, clear of the titles
      const arc = (v) => [lerp(s.x0, end[0], v), lerp(0, end[1], v) + Math.sin(v * Math.PI) * 0.35, lerp(0, end[2], v) + Math.sin(v * Math.PI) * 1.4];
      const p = arc(u);
      if (u > 0 && u < 1) for (let j = 1; j <= 28; j++) {   // the light-blue trail behind a flying slab: dense enough to read as a streak
        const v = u - j * 0.012; if (v <= 0) break;
        g3Mesh(g3Sph(0.045), g3Glow(G3GLOW.blue, 1 - j / 29), arc(v), [0, 0, 0], 1 - j / 34);
      }
      { const age = t - (t0 + 0.9); if (age > 0 && age < 0.35) {   // a short flash on the slab as it lands
        g3Mesh(g3Sph(0.1), g3Glow(G3GLOW.amber, 1 - age / 0.35), [end[0], end[1] + 0.55, end[2] + 0.5], [0, 0, 0], 1 + age * 4); } }
      const sc = small ? lerp(1, 0.8, u) : lerp(1, 0.7, u);
      const glow = t >= cu.silence && t < cu.payoff && !small ? 1.6 : 1;   // the silence: the three big lines glow together
      const m = g3Mesh(g3Box(s.w - 0.03, BLOCK.h, BLOCK.d, 0.06), glow > 1 ? g3Mat('warm', '#ffb02e') : g3Mat('warm'), p, [0, small ? 0 : u * 0.6, 0], [sc, sc, sc]);
      const stag = { approve: 0.98, tools: 1.38, cont: 0.98, boards: 1.38 }[s.id] ?? 0.95;   // small labels at staggered heights
      if (u >= 1 && (!small || t < cu.payoff)) g3Label('₹' + s.cr.toFixed(1) + ' Cr', [p[0], p[1] + stag, p[2]], { height: small ? 0.24 : 0.36, color: '#ffd28a' });
    }
    // station 1: the shuttle wafer, nine dies printing on it
    { const [x] = STATION.proto, on = span(t, cu.proto + 0.8, cu.proto + 1.4);
      if (on > 0) { g3Mesh(g3Cyl(1.45, 0.06), g3Mat('glass', '#7fb0e6'), [x + 0.4, -0.45 + on * 0.25, 0]);
        for (let i = 0; i < 9; i++) { const k = span(t, cu.proto + 1.2 + i * 0.12, cu.proto + 1.5 + i * 0.12); if (k <= 0) continue;
          g3Mesh(g3Box(0.42, 0.05, 0.42, 0.02), g3Mat('die'), [x + 0.4 + (i % 3 - 1) * 0.6, -0.17, (Math.floor(i / 3) - 1) * 0.6], [0, 0, 0], [k, 1, k]); }
        if (t > cu.proto + 1.4 && t < cu.respin + 0.6) g3Label('Dec 2026 shuttle', [x + 0.4, 0.75, 0], { height: 0.26, color: '#cfe3ff', mono: true, weight: 500 }); } }
    // station 2: the respin reserve, a stack of spare wafers (about eight re-runs)
    { const [x] = STATION.respin;
      for (let i = 0; i < 8; i++) { const k = g3Spring(t, cu.respin + 0.8 + i * 0.1, { k: 160, damp: 0.6 }); if (k <= 0.01) continue;
        g3Mesh(g3Cyl(1.2, 0.05), g3Mat('glass'), [x + 0.5, -0.5 + i * 0.12 + (1 - k) * 1.2, 0]); }
      if (t > cu.respin + 1.6 && t < cu.team + 0.6) g3Label('×8 re-runs', [x + 0.5, 1.0, 0], { height: 0.26, color: '#cfe3ff', mono: true, weight: 500 }); }
    // station 3: the team, five glass figures
    { const [x] = STATION.team;
      for (let i = 0; i < 5; i++) { const k = g3Spring(t, cu.team + 0.8 + i * 0.12, { k: 140, damp: 0.55 }); if (k <= 0.01) continue;
        const px = x + 0.2 + (i - 2) * 0.62, pz = i % 2 ? -0.5 : 0.35;
        g3Mesh(g3Cap(0.17, 0.55), g3Mat('glass', '#a9c9f0'), [px, -0.15 + (1 - k) * 0.8, pz]);
        g3Mesh(g3Sph(0.15), g3Mat('glass', '#a9c9f0'), [px, 0.42 + (1 - k) * 0.8, pz]); }
      if (t > cu.team + 1.5 && t < cu.small + 0.6) g3Label('to March 2027, then 12 months', [x + 0.2, 1.05, 0], { height: 0.24, color: '#cfe3ff', mono: true, weight: 500 }); }
    chips(t, scene);
  });
  // 2D overlays: the reference layout — tag, title, one line — plus the balance counter
  const bal = balance(t);
  g3Counter('₹' + (Math.abs(bal) < 0.05 ? '0.0' : bal.toFixed(1)) + ' Cr left');
  const T2 = (t0, t1, ...a) => { if (t >= t0 && t < t1) g3Title(...a); };
  T2(0, cu.proto, 'TRANCHE 1', 'What ₹10 Cr buys', 'Line by line, from the investor brief', { at: 0.3 });
  T2(cu.proto, cu.respin, '01 · ₹2.6 Cr', 'Nine prototypes', 'December 2026 shuttle, about ₹0.29 Cr each', { at: cu.proto + 0.2 });
  T2(cu.respin, cu.team, '02 · ₹2.5 Cr', 'Respin reserve', 'About eight prototype re-runs', { at: cu.respin + 0.2 });
  T2(cu.team, cu.small, '03 · ₹2.5 Cr', 'Engineering team', '₹1.0 Cr to March 2027, ₹1.5 Cr for the 12 months after', { at: cu.team + 0.2 });
  T2(cu.small, cu.silence, '04 · ₹2.4 Cr', 'Approvals, tools, boards', '₹1.0 Cr first approvals · ₹1.0 Cr tools and lab · ₹0.4 Cr boards and contingency', { at: cu.small + 0.2 });
  T2(cu.silence, cu.payoff, '₹7.6 Cr of ₹10 Cr', '76%', 'Prototypes, respins and the team', { at: cu.silence + 0.05, size: 120 });
  T2(cu.payoff, 99, 'TRANCHE 1 · ₹10 Cr', 'First silicon for nine chips', 'SKU-1 to SKU-6 and SKU-8 to SKU-10', { at: cu.payoff + 0.3 });
  if (t > cu.payoff + 1.5) g3Foot('Planned allocation, not spend · pre-silicon · no purchase orders today');
}
