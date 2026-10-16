  // SCORE BODY — applications opener (inside buildScore(); see kit/score-head.js). 120 BPM, D major.
  // Arc: soft pad (open) -> a pluck groove under the worlds -> the groove drops out when the meter's mains is cut
  // -> 8ths build under the drone -> a hit on every 16th in the rush -> silence on the chip alone -> the loudest
  // hit on the payoff ring, then a flat chord to the loop.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 2.1, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 900, att: 0.05, rel: 0.2 });
  // the groove: a pluck on every beat with a bass on the bar, one cut per world
  const prog = [['D4', 'Fs4', 'A4', 'Fs4'], ['B3', 'D4', 'Fs4', 'D4'], ['G3', 'B3', 'D4', 'B3']];
  for (let b = 2.0; b < cu.mainsCut - 1e-6; b += BEAT) {
    const bar = Math.floor((b - 2.0) / 2) % 3, k = Math.round((b - 2.0) / BEAT) % 4;
    pluck(b, nz(prog[bar][k]), 0.15, k % 2 ? 0.25 : -0.25, 0.3, 2600, 0.2);
    if (k === 0) bass(b, nz(['D2', 'B1', 'G1'][bar]), 0.22);
  }
  [5.0, 8.0].forEach(t => noiseHit(t, 0.06, 'bandpass', 2400, 1.4, 0.35));          // a tick on each world cut
  // mains cut: the groove stops; only a low drone and the tamper blink remain
  drone(cu.mainsCut, 11.0, nz('D2'), 0.04, {});
  for (let t = cu.mainsCut + 0.5; t < 11.0; t += 0.5) blip(t, 1800, 1700, 0.04, 0.05);
  // drones: 8ths build, rising
  for (let t = 11.0; t < 13.0 - 1e-6; t += E8) pluck(t, nz(['D4', 'E4', 'Fs4', 'A4', 'B4', 'D5', 'E5', 'Fs5'][Math.round((t - 11.0) / E8) % 8]), 0.13, 0, 0.2, 3400, 0.15);
  riser(11.5, 13.0, 0.05);
  // the rush: a hit on every 16th
  for (let i = 0; i < 4; i++) noiseHit(13.0 + i * E16, 0.07, 'bandpass', 1800 + i * 500, 1.5, 0.5, (i % 2 ? 0.3 : -0.3));
  pad(13.375, 14.45, ['D3', 'A3', 'E4'], 0.03, { cut: 1100, att: 0.05, rel: 0.05 });
  // 14.5–15.5: silence (the chip alone, accent off)
  // the payoff: a stab and sub on the hit, then a flat chord to the loop
  chime(cu.payoff, [nz('D5'), nz('Fs5'), nz('A5')], 0.1); sub(cu.payoff, 0.38);
  bass(cu.payoff, nz('D2'), 0.3);
  pad(cu.payoff + 0.05, 20.0, ['D3', 'A3', 'D4', 'Fs4'], 0.045, { cut: 1200, att: 0.25, rel: 0.3, send: 0.4 });
