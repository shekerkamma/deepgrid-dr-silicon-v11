import {ArrowUpRight, ArrowRight} from 'lucide-react';
import {url, type RouteId} from './routes';
import {briefVisual as brief} from './brief-content';

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', {maximumFractionDigits:1}).format(value)} Cr`;
const discussion = () => url('/contact') + '?intent=investor';

export function FundingPath() {
  const funding = brief.tranche.reduce((sum, row) => sum + row.cr, 0);
  return <section className="ij-funding" aria-labelledby="ij-funding-title">
    <div className="ij-introduction"><h2 id="ij-funding-title">Fund the next evidence.<br/>Then decide the next stage.</h2>
      <p>The Blueprint allocates {money(funding)} in tranche 1 to first-silicon work. Its December shuttle plan includes {brief.chips.length} designs. This is a prototype milestone, with qualification and full development still ahead.</p>
      <a className="ij-link" href={url('/portfolio/brief')}>Review the funding brief <ArrowRight size={18} aria-hidden="true"/></a>
      <p className="ij-source">SKU Blueprint, October 2026 · planned allocations, not capital received or silicon results.</p>
    </div>
    <div className="ij-ledger"><h3>Where tranche 1 goes</h3><dl>{brief.tranche.map(row => <div key={row.use}><dt>{row.use}</dt><dd>{money(row.cr)}</dd></div>)}</dl>
      <p>The September model and October Blueprint use different revenue scopes. Read their reconciliation before comparing headline totals.</p>
      <a className="ij-link" href={url('/portfolio/brief') + '#ch-differ'}>Compare the two plans <ArrowRight size={16} aria-hidden="true"/></a>
    </div>
  </section>;
}

export function ReviewPaths() {
  return <nav className="ij-review-paths" aria-label="Investor review paths">
    <a href={url('/company')}><strong>Why this portfolio?</strong><span>First markets and product strategy</span><ArrowUpRight size={18} aria-hidden="true"/></a>
    <a href={url('/portfolio/brief')}><strong>What does funding unlock?</strong><span>Tranche 1, milestones and model differences</span><ArrowUpRight size={18} aria-hidden="true"/></a>
    <a href={url('/evidence')}><strong>What is proven today?</strong><span>Engineering evidence and open gaps</span><ArrowUpRight size={18} aria-hidden="true"/></a>
  </nav>;
}

export function EvidenceAgenda() {
  return <section className="ij-evidence" aria-labelledby="ij-evidence-title">
    <div><h2 id="ij-evidence-title">Read the evidence.<br/>Keep the gaps in view.</h2><p>Architecture breadth, engineering work and commercial readiness answer different questions. Evaluate each on its own evidence.</p>
      <a className="ij-link" href={url('/evidence')}>Review evidence & withheld claims <ArrowRight size={18} aria-hidden="true"/></a></div>
    <div className="ij-evidence-register"><section><h3>Available for review</h3><ul><li>Portfolio architectures and dated SKU Blueprint tables</li><li>DG32 simulation, implementation and post-route records</li><li>Named approval routes and estimated unit costs</li></ul></section>
      <section><h3>Still to establish</h3><ul><li>Returned-silicon measurements and confirmed sample dates</li><li>Qualification and application-specific validation</li><li>Purchase orders, letters of intent and reconciled financial assumptions</li></ul></section>
    </div>
  </section>;
}

export function DiscussionClose({compact = false}: {compact?: boolean}) {
  return <section className={'ij-discussion' + (compact ? ' ij-discussion-compact' : '')} aria-label="Investor and partner discussion">
    <div><h2>Decide what you need<br/>for the next discussion.</h2><p>Request a portfolio discussion, strategic-partner evaluation or data-room access. Tell us which assumptions and evidence you want to examine.</p></div>
    <a className="ij-primary" href={discussion()}>Request a discussion <ArrowUpRight size={18} aria-hidden="true"/></a>
  </section>;
}

export function InvestorGuide({route}: {route: RouteId}) {
  const technical = ['technology','safety','control','die','package','procurement'].includes(route) || /^(sku|d100)/.test(route);
  const links = technical ? [['/evidence','Check the evidence'],['/portfolio/brief','Return to the investment brief']] :
    route === 'brief' ? [['/plan','Examine the business plan'],['/evidence','Review evidence & gaps']] :
    [['/portfolio/brief','Read the investment brief'],['/portfolio/brief?view=use-cases','Compare first markets & approval windows']];
  return <nav className="ij-route-guide" aria-label="Continue your review"><p>Continue your review</p><div>
    {links.map(([href,label]) => <a key={href} href={url(href)}>{label}<ArrowRight size={16} aria-hidden="true"/></a>)}
    <a href={discussion()}>Request a discussion<ArrowUpRight size={16} aria-hidden="true"/></a>
  </div></nav>;
}

export function SiteDirectory() {
  const groups = [
    ['Investors', [['/portfolio/brief','Investment brief'],['/company','Portfolio strategy'],['/plan','Business plan']]],
    ['Explore', [['/portfolio','SKU comparison'],['/products','Architectures'],['/portfolio/brief?view=use-cases','Use cases & implementation']]],
    ['Diligence', [['/evidence','Evidence & gaps'],['/resources/docs','Source library'],['/ask','Ask DeepGrid']]],
    ['Company', [['/about','Our story'],['/about/team','Leadership & team'],['/contact?intent=investor','Request a discussion']]],
  ] as const;
  return <nav className="ij-directory" aria-label="Site directory">{groups.map(([title,links]) => <div key={title}><p>{title}</p>{links.map(([href,label]) => <a key={href} href={url(href)}>{label}</a>)}</div>)}</nav>;
}
