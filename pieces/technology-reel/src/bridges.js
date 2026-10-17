// CAMERAS AND (NO) BRIDGES — hard cuts on the voice; a slow push on every shot, the HUD at screen size.
const ERA_BG = SHOT_LIST.map(([, key]) => ({ lock: '#f4f6fa', fault: '#f0a020', budget: '#f4f6fa', 'budget-10k': '#f4f6fa', 'budget-82': '#f0a020', dom: '#f0a020' }[key] || '#0b1220'));
function pieceCam(era, t) { const [t0, t1] = ERA_LIST[era], u = clamp((t - t0) / Math.max(0.5, t1 - t0)); return camOf({ z: 1 + 0.035 * u, p: [960, 540], to: [960, 540] }); }
const BRIDGES = [];
