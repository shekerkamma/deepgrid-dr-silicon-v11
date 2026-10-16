// =====================================================================
//  CAMERAS AND (NO) BRIDGES — applications opener (read by kit/morph.js). Every boundary is a hard cut on the grid.
//  'close' pushes in on the chip, keeping it on its anchor point, so the hero holds still through the rush.
// =====================================================================
const ERA_BG = ERA_LIST.map(() => PAL.paper);
const CAMS = { wide: null, close: { z: 1.45, p: HERO_AT, to: HERO_AT } };
// the payoff hold: a slow push of 4 % on the anchor, so the last 4 s are never still
function pieceCam(era, t) { const c = CAMS[SHOT_LIST[era][2]]; if (c) return camOf(c); return era === SHOT_LIST.length - 1 ? push(t, 16.6, 19.6, { z: 1.04, p: HERO_AT, to: HERO_AT }) : null; }
const BRIDGES = [];
