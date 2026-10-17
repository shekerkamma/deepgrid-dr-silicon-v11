  // SCORE BODY — a quiet bed under the voice (music at −14 dB, ducked further while the voice speaks), a tick on each
  // cut, a drop out under the share line, and the payoff hit in the pause before the closing line.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, CUT[4] + 0.2, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 1100, att: 0.4, rel: 0.4 });
  for (let b = 0.5; b < CUT[4]; b += BEAT) pluck(b, nz(['D4', 'A4', 'Fs4', 'A4'][Math.round(b / BEAT) % 4]), 0.07, 0, 0.25, 2400, 0.25);
  T.cuts.forEach((c) => noiseHit(c, 0.05, 'bandpass', 2600, 1.4, 0.22));
  pad(CUT[4], cu.payoff - 0.05, ['B2', 'Fs3', 'D4'], 0.03, { cut: 900, att: 0.3, rel: 0.2 });
  chime(cu.payoff, [nz('D5'), nz('Fs5'), nz('A5')], 0.1); sub(cu.payoff, 0.35); bass(cu.payoff, nz('D2'), 0.25);
  pad(cu.payoff + 0.05, T.duration, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { cut: 1200, att: 0.3, rel: 0.4, send: 0.4 });
