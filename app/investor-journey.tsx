import {ArrowUpRight, ArrowRight} from 'lucide-react';
import {byId, url, type RouteId} from './routes';
import {briefVisual as brief} from './brief-content';
import {areas, type ProductId} from './applications-story-data';
import {portfolioParts} from './portfolio-story-data';

// The DG32 pages (technology, its sub-pages, the evidence register and the G0 comparison) are all about SKU-4.
const dg32Routes: RouteId[] = ['technology', 'safety', 'control', 'die', 'package', 'evidence', 'procurement'];

/** The parts a page is about: a use case's primary parts, from the same `areas` record its page renders, or
 *  SKU-4 on the DG32 pages. Other pages get none, rather than a list that is not about them. */
function partsFor(route: RouteId) {
  const area = route.startsWith('uc-') ? areas.find(a => 'uc-' + a.id === route) : undefined;
  const ids: ProductId[] = area ? area.items.filter(i => i.primary).map(i => i.product) : dg32Routes.includes(route) ? ['sku4'] : [];
  const code = (id: ProductId) => id === 'd100' ? 'D100' : 'SKU-' + id.slice(3);
  return ids.map(id => portfolioParts.find(p => p.code === code(id))).filter(p => !!p);
}

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', {maximumFractionDigits:1}).format(value)} Cr`;
const discussion = () => url('/contact') + '?intent=investor';

export function FundingPath() {
  const funding = brief.tranche.reduce((sum, row) => sum + row.cr, 0);
  return <section className="ij-funding" aria-labelledby="ij-funding-title">
    <div className="ij-introduction"><h2 id="ij-funding-title">₹10 Cr funds first silicon for nine chips<br/>on the December 2026 shuttle.</h2>
      <p>The Blueprint allocates {money(funding)} in tranche 1 to first-silicon work. Its December shuttle plan includes {brief.chips.length} designs. This is a prototype milestone, with qualification and full development still ahead.</p>
      <a className="ij-link" href={url('/portfolio/brief')}>Review the funding brief <ArrowRight size={18} aria-hidden="true"/></a>
      <p className="ij-source">SKU Blueprint, October 2026 · planned allocations, not capital received or silicon results.</p>
    </div>
    <div className="ij-ledger"><h3>Tranche 1 capital allocation</h3><dl>{brief.tranche.map(row => <div key={row.use}><dt>{row.use}</dt><dd>{money(row.cr)}</dd></div>)}</dl>
      <p>The September model and October Blueprint use different revenue scopes. Read their reconciliation before comparing headline totals.</p>
      <a className="ij-link" href={url('/portfolio/brief') + '#ch-differ'}>Compare the two plans <ArrowRight size={16} aria-hidden="true"/></a>
    </div>
  </section>;
}

export function ReviewPaths() {
  return <nav className="ij-review-paths" aria-label="Explore DeepGrid">
    <a href={url('/products')}><strong>Find a product</strong><span>Control, power, sensing and interfaces</span><ArrowUpRight size={18} aria-hidden="true"/></a>
    <a href={url('/applications')}><strong>Explore your application</strong><span>Product roles in the complete system</span><ArrowUpRight size={18} aria-hidden="true"/></a>
    <a href={url('/evidence')}><strong>Assess the engineering</strong><span>Validation results and qualification gaps</span><ArrowUpRight size={18} aria-hidden="true"/></a>
  </nav>;
}

export function EvidenceAgenda() {
  return <section className="ij-evidence" aria-labelledby="ij-evidence-title">
    <div><h2 id="ij-evidence-title">Pre-silicon validation.<br/>Qualification still ahead.</h2><p>Architecture breadth, engineering work and commercial readiness answer different questions. Evaluate each on its own evidence.</p>
      <a className="ij-link" href={url('/evidence')}>Review evidence & withheld claims <ArrowRight size={18} aria-hidden="true"/></a></div>
    <div className="ij-evidence-register"><section><h3>Current engineering and commercial basis</h3><ul><li>Portfolio architectures and dated SKU Blueprint tables</li><li>DG32 simulation, implementation and post-route records</li><li>Named approval routes and estimated unit costs</li></ul></section>
      <section><h3>Silicon, qualification and customer milestones</h3><ul><li>Returned-silicon measurements and confirmed sample dates</li><li>Qualification and application-specific validation</li><li>Purchase orders, letters of intent and reconciled financial assumptions</li></ul></section>
    </div>
  </section>;
}

export function DiscussionClose({compact = false}: {compact?: boolean}) {
  return <section className={'ij-discussion' + (compact ? ' ij-discussion-compact' : '')} aria-label="Investor and partner discussion">
    <div><h2>Portfolio discussions, partner evaluations<br/>and data-room access start here.</h2><p>Request a portfolio discussion, strategic-partner evaluation or data-room access. Tell us which assumptions and evidence you want to examine.</p></div>
    <a className="ij-primary" href={discussion()}>Request a discussion <ArrowUpRight size={18} aria-hidden="true"/></a>
  </section>;
}

export function InvestorGuide({route}: {route: RouteId}) {
  const technical = ['technology','safety','control','die','package','procurement','products','evidence'].includes(route) || /^(sku|d100)/.test(route);
  const buyer = ['applications','resources','docs','videos','read','ask'].includes(route) || /^uc-/.test(route);
  const all: string[][] = technical ? [['/evidence','Review validation & readiness'],['/resources/docs','Read technical specifications'],['/portfolio','Compare portfolio economics']] :
    buyer ? [['/products','Compare product architectures'],['/evidence','Review validation & readiness'],['/portfolio','Compare portfolio economics']] :
    route === 'brief' ? [['/plan','Examine the business plan'],['/evidence','Review evidence & gaps']] :
    [['/portfolio/brief','Read the investment brief'],['/portfolio/brief?view=use-cases','Compare first markets & approval windows']];
  // Never point a reader at the page they are on.
  const here = byId[route].href;
  const links = all.filter(([href]) => href !== here).slice(0, 2);
  const parts = partsFor(route);
  return <nav className="ij-route-guide" aria-label="Continue your review"><p>Continue your review</p><div>
    {links.map(([href,label]) => <a key={href} href={url(href)}>{label}<ArrowRight size={16} aria-hidden="true"/></a>)}
    <a href={discussion()}>Request a discussion<ArrowUpRight size={16} aria-hidden="true"/></a>
  </div>
  {parts.length > 0 && <><p className="ij-route-parts-h">Parts for this topic</p><div className="ij-route-parts">
    {parts.map(p => <a key={p.id} href={url(p.code === 'D100' ? '/products/d100' : `/products/${p.id}`)}><span className="mono">{p.code}</span> {p.name}<ArrowRight size={16} aria-hidden="true"/></a>)}
  </div></>}</nav>;
}

export function SiteDirectory() {
  const groups = [
    ['Products & applications', [['/products','Product architectures'],['/applications','System applications'],['/procurement','Product comparison']]],
    ['Technology & resources', [['/technology','DG32 technology'],['/evidence','Validation & readiness'],['/resources','Documents, decks & films'],['/ask','Ask DeepGrid']]],
    ['Company', [['/about','Company profile'],['/about/team','Leadership & team'],['/contact?intent=investor','Request a discussion']]],
    ['Investors', [['/portfolio/brief','Investment brief'],['/company','Portfolio strategy'],['/plan','Business plan']]],
  ] as const;
  return <nav className="ij-directory" aria-label="Site directory">{groups.map(([title,links]) => <div key={title}><p>{title}</p>{links.map(([href,label]) => <a key={href} href={url(href)}>{label}</a>)}</div>)}</nav>;
}
