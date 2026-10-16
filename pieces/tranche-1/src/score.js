  // SCORE BODY — what ₹10 Cr buys (inside buildScore(); see kit/score-head.js). 120 BPM, D major.
  // Arc: soft pad (open) -> a pluck groove under the three big lines, a tick as each slab lands -> rising 8ths
  // under the small lines -> silence on the 76% hold -> the loudest hit on the payoff, then a flat chord to the loop.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 2.6, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 900, att: 0.05, rel: 0.2 });
  const prog = [['D4', 'Fs4', 'A4', 'Fs4'], ['B3', 'D4', 'Fs4', 'D4'], ['G3', 'B3', 'D4', 'B3']];
  for (let b = cu.proto; b < cu.small - 1e-6; b += BEAT) {
    const bar = Math.floor((b - cu.proto) / 2) % 3, k = Math.round((b - cu.proto) / BEAT) % 4;
    pluck(b, nz(prog[bar][k]), 0.14, k % 2 ? 0.25 : -0.25, 0.3, 2600, 0.2);
    if (k === 0) bass(b, nz(['D2', 'B1', 'G1'][bar]), 0.2);
  }
  // a soft glass tick as each slab lands (LEAVE + 0.9 in scenes.js: the cue + 1.0 for the big lines)
  [cu.proto, cu.respin, cu.team].forEach((c) => blip(c + 1.0, 2400, 1900, 0.05, 0.08));
  // the small lines: rising 8ths, a tick per landing
  for (let t = cu.small; t < cu.silence - 1e-6; t += E8) pluck(t, nz(['D4', 'E4', 'Fs4', 'A4', 'B4', 'D5', 'E5', 'Fs5', 'A5', 'B5'][Math.round((t - cu.small) / E8) % 10]), 0.12, 0, 0.2, 3400, 0.15);
  [0, 0.5, 1.0, 1.5].forEach((d) => noiseHit(cu.small + d + 0.9, 0.06, 'bandpass', 2600 + d * 800, 1.5, 0.35, d % 1 ? 0.3 : -0.3));
  riser(cu.small + 0.5, cu.silence - 0.05, 0.04);
  // cu.silence .. cu.payoff: silence (the 76% hold)
  chime(cu.payoff, [nz('D5'), nz('Fs5'), nz('A5')], 0.09); sub(cu.payoff, 0.32);
  bass(cu.payoff, nz('D2'), 0.25);
  pad(cu.payoff + 0.05, 20.0, ['D3', 'A3', 'D4', 'Fs4'], 0.045, { cut: 1200, att: 0.25, rel: 0.3, send: 0.4 });
