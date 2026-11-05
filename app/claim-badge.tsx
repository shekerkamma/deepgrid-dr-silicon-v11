import {claims} from './claims';
import {url} from './routes';

/** The anchor a claim's row carries on /evidence, so a figure anywhere on the site can link to it. */
export const claimAnchor = (id: string) => 'claim-' + id;

/** A small link from a figure to its row in the evidence register (app/claims.ts, listed on /evidence).
 *  Only figures with a claim get one: a badge that pointed nowhere would be worse than none. */
export function ClaimBadge({id, label}: {id: string; label?: string}) {
  // `label` replaces the evidence kind where the figure already shows it, as the product hero's status tag does.
  const c = claims[id];
  if (!c) return null;
  const kind = c.kind ?? 'Design constant';
  return (
    <a className="claim-badge" href={url('/evidence') + '#' + claimAnchor(id)}
      aria-label={`Evidence for ${c.figure}: ${kind}, ${c.sourceTitle}`} title={c.measures}>
      {label ?? kind}
    </a>
  );
}
