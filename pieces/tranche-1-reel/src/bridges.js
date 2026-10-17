// CAMERAS AND (NO) BRIDGES — hard cuts on the voice; no camera moves.
const ERA_BG = SHOT_LIST.map(([, key]) => ({ proto: '#f0a020', share: '#f0a020', team: '#f4f6fa', 'card-tools': '#f0a020', 'card-cont': '#f0a020' }[key] || '#0b1220'));
// a slow push on every shot (3.5 % over the shot), so a held line never reads as a still; the HUD stays at screen size
function pieceCam(era, t) { const [t0, t1] = ERA_LIST[era], u = clamp((t - t0) / Math.max(0.5, t1 - t0)); return camOf({ z: 1 + 0.035 * u, p: [960, 540], to: [960, 540] }); }
const BRIDGES = [];
