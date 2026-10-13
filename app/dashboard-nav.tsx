import {url} from './routes';

export function DashboardNav({current}: {current: 'brief' | 'portfolio' | 'plan'}) {
  return <nav className="db-nav" aria-label="DeepGrid dashboards">
    {([
      ['brief', '/portfolio/brief', 'Investor & buyer brief'],
      ['portfolio', '/portfolio', 'SKU portfolio'],
      ['plan', '/plan', 'Business plan'],
    ] as const).map(([id, href, label]) => <a key={id} href={url(href)} aria-current={id === current ? 'page' : undefined}>{label}</a>)}
    <a href={url('/portfolio/brief') + '?view=use-cases'}>Use cases & implementation</a>
  </nav>;
}
