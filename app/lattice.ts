// The hairline lattice replaces same-size card grids site-wide (impeccable craft-floor bans the
// icon + heading + text grid as page structure). Pattern reference: 21st.dev "Feature Overview Bento"
// (mohammadshehadeh/feature-10): mixed cells on one hairline lattice.
//
// The first item becomes a full-width lead row; the rest split into the widest column count that
// divides them evenly, and when none does the last cell spans the gap, so a row is never left short.
import type {CSSProperties} from 'react';

export function lattice(n: number, max = 3) {
  const rest = n - 1;
  const opts = [4, 3, 2].filter(c => c <= max && c <= rest);
  const cols = rest <= 1 ? 1 : opts.find(c => rest % c === 0) ?? Math.min(max, rest);
  const lastRow = rest > 0 ? ((rest - 1) % cols) + 1 : cols;
  const lastSpan = cols - lastRow + 1;
  return {
    style: {'--lat-cols': cols} as CSSProperties,
    cell: (i: number): {className?: string; style?: CSSProperties} =>
      i === 0 ? {className: 'lat-lead'} : i === n - 1 && lastSpan > 1 ? {style: {gridColumn: `span ${lastSpan}`}} : {},
  };
}
