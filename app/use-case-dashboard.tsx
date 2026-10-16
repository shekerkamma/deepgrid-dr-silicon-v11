'use client';
import {useEffect, useRef, useState} from 'react';
import {ArrowRight, RefreshCw, Download, FileText} from 'lucide-react';
import {HBars, Insights, Chapter} from './dash-charts';
import {usePortfolio} from './data/use-portfolio';
import {readinessLabels, useCases, useCaseSource, type UseCase} from './data/use-case-model';
import {sheetViewUrl, type TableName} from './data/portfolio-facts';
import {asset, url} from './routes';
import {ArchitectureImage} from './engineering-visuals';

const cr = (v: number) => `₹${v.toLocaleString('en-IN', {maximumFractionDigits: 1})} Cr`;
const usd = (v: number) => `$${v.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
const sum = (cases: UseCase[], key: 'fy31Cr' | 'planCr') => cases.reduce((n, c) => n + (c.chip[key] ?? 0), 0);
const STATUS = ['No', 'Partly', 'Yes'];
/** A row's own address: the dashboard view with that use case selected, scrolled to its implementation path. */
const caseHref = (sku: string) => `?view=use-cases&sku=${encodeURIComponent(sku)}#uc-implementation`;
/** Plain clicks select in place; a modified click (new tab, copy link) keeps the browser's own behaviour. */
const plainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

function Source({tables, expanded}: {tables: TableName[]; expanded: boolean}) {
  return <div className="uc-source">
    <p className="pd-source">SKU Blueprint, October 2026. Plan targets; market sizes and approval times are estimates. Use-case mapping is an estimate.</p>
    {expanded && <ul className="uc-source-links">{tables.map(t => <li key={t}>
      <a className="pd-link" href={sheetViewUrl(t)} target="_blank" rel="noreferrer">{t}: live source</a>
      <a className="pd-link" href={asset('/portfolio-data/' + t + '.csv')} download><Download size={14} aria-hidden="true"/> CSV</a>
    </li>)}<li><a className="pd-link" href={asset('/portfolio-data/use-cases.json')} download>Use-case mapping</a></li></ul>}
  </div>;
}

function Implementation({c}: {c: UseCase}) {
  const {chip, approval, costed} = c;
  const steps = [
    ['Design', chip.readiness || 'Not documented'],
    ['December 2026 shuttle', chip.shuttle ? 'Planned for 26 December 2026' : 'Not on this run'],
    ['First silicon', 'Return date not yet confirmed'],
    ['Approval', `${approval.approval} · ${approval.low}–${approval.high} months (estimate)`],
    ['Volume', chip.planCr == null ? 'No plan line yet' : `Plan line ${cr(chip.planCr)}; FY31 ramp ${cr(chip.fy31Cr ?? 0)} (targets)`],
  ];
  const facts = [
    ['Process', chip.process || 'Not documented'],
    ['Clock', chip.clockMhz == null ? 'Not documented' : `${chip.clockMhz} MHz (design target)`],
    ['Market', chip.marketLowCr == null || chip.marketHighCr == null ? 'Not estimated' : `${cr(chip.marketLowCr)}–${cr(chip.marketHighCr)} (estimate)`],
    ['Units', chip.units ? `${chip.units} a year (estimate)` : 'Not estimated'],
    ['Price band', chip.priceLowUsd == null || chip.priceHighUsd == null ? 'Not estimated' : `${usd(chip.priceLowUsd)}–${usd(chip.priceHighUsd)} (estimate)`],
    ['Package', costed ? `${costed.pkg}, ${costed.dieMm2} mm² die` : c.datasheet ? 'DG32-LITE QFN-64 (preliminary)' : 'Not documented'],
    ['Unit cost', costed ? `${usd(costed.costLow)}–${usd(costed.costHigh)} (estimate)` : 'Not costed in the published table'],
    ['Gross margin', costed ? `${costed.marginLow}–${costed.marginHigh}% (estimate)` : 'Not estimated'],
  ];
  return <div className="uc-detail-grid">
    <article className="uc-path" aria-label="Implementation path">
      <ArchitectureImage sku={chip.sku} name={chip.name}/>
      <p className="uc-detail-lede">For {c.buyer}. {c.job}.</p>
      <ol className="uc-steps">{steps.map(([label, value], i) => <li key={label}>
        <span className="uc-step-number" aria-hidden="true">{i + 1}</span><div><strong>{label}</strong><p>{value}</p></div>
      </li>)}</ol>
      <div className="uc-evidence-grid">
        <section><h4>Current product evaluation basis</h4><ul>{c.ready.map(r => <li key={r}>{r}</li>)}{c.funded && <li>First approval work is allocated in tranche 1; approval is not held yet.</li>}</ul></section>
        <section><h4>Outstanding qualification requirements</h4><ul>{c.missing.map(m => <li key={m}>{m}</li>)}</ul></section>
      </div>
      <div className="uc-detail-actions">
        <a className="pd-link" href={url('/contact') + '?intent=partner&sku=' + encodeURIComponent(chip.sku)}>Discuss this opportunity <ArrowRight size={16} aria-hidden="true"/></a>
        <a className="pd-link" href={url(c.route)}>Explore this application <ArrowRight size={16} aria-hidden="true"/></a>
        <a className="pd-link" href={url(chip.sku === 'D100' ? '/products/d100' : '/products/' + chip.sku.toLowerCase())}>Chip architecture <ArrowRight size={16} aria-hidden="true"/></a>
        {c.datasheet && <a className="pd-link" href={asset(c.datasheet)}><FileText size={16} aria-hidden="true"/> Preliminary datasheet</a>}
      </div>
    </article>
    <aside className="uc-facts" aria-label="Operating requirements and commercial estimates"><h4>Operating requirements and commercial estimates</h4><p className="pd-source">Published estimates and design targets, before silicon.</p>
      <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </aside>
  </div>;
}

export function UseCaseDashboard() {
  const {d, prov, refresh} = usePortfolio();
  const cases = useCases(d);
  const [selected, setSelected] = useState('SKU-1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sources, setSources] = useState(false);
  const detail = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(location.search), sku = params.get('sku'), market = params.get('market');
      setSelected(useCaseSource.cases.some(c => c.sku === sku) ? sku! : 'SKU-1');
      setSearch(params.get('q') || '');
      setFilter(market && ['shuttle','fast','later'].includes(market) ? market : 'all');
    };
    read(); window.addEventListener('popstate', read); return () => window.removeEventListener('popstate', read);
  }, []);
  const choose = (sku: string, jump = false) => {
    setSelected(sku);
    const target = new URL(location.href); target.searchParams.set('view', 'use-cases'); target.searchParams.set('sku', sku);
    history.replaceState(null, '', target);
    if (jump) requestAnimationFrame(() => detail.current?.focus());
  };
  const updateFilter = (key: 'q' | 'market', value: string) => {
    const target = new URL(location.href); target.searchParams.set('view','use-cases');
    if (value && (key === 'q' || value !== 'all')) target.searchParams.set(key,value); else target.searchParams.delete(key);
    history.replaceState(null,'',target);
    if (key === 'q') setSearch(value); else setFilter(value);
  };
  const clearFilters = () => {updateFilter('q',''); updateFilter('market','all');};
  const active = cases.find(c => c.sku === selected) ?? cases[0];
  if (!active) return <p className="pd-flag">No use cases match the checked portfolio tables.</p>;
  const planned = cases.filter(c => c.chip.planCr != null);
  const shuttle = planned.filter(c => c.chip.shuttle);
  const fast = shuttle.filter(c => c.approval.high <= 12), slow = planned.filter(c => c.approval.high >= 36);
  const share = Math.round(sum(fast, 'fy31Cr') / Math.max(1, sum(shuttle, 'fy31Cr')) * 100);
  const shares = planned.flatMap(c => c.chip.shareMidPct == null ? [] : [c.chip.shareMidPct]);
  const sheetCount = cases.filter(c => c.datasheet).length;
  const ranked = [...planned].sort((a, b) => (b.chip.fy31Cr ?? 0) - (a.chip.fy31Cr ?? 0));
  const readiness = [...cases].sort((a, b) => b.score - a.score);
  const best = readiness.filter(c => c.score === readiness[0]?.score), complete = readiness.filter(c => c.score === 12);
  const readyHead = complete.length ? `${complete.length} of ${cases.length} use cases have all six evaluation documents in place.`
    : `No use case is fully evaluation-ready; ${best.map(c => c.title.toLowerCase()).join(' and ')} ${best.length > 1 ? 'come' : 'comes'} closest at ${best[0]?.score}/12.`;
  const openRow = (sku: string) => (e: React.MouseEvent) => { if (!plainClick(e)) return; e.preventDefault(); choose(sku, true); document.getElementById('uc-implementation')?.scrollIntoView({block: 'start'}); };
  const visible = cases.filter(c => (!search.trim() || `${c.title} ${c.sku} ${c.chip.name} ${c.buyer}`.toLowerCase().includes(search.trim().toLowerCase())) &&
    (filter === 'all' || (filter === 'shuttle' ? c.chip.shuttle : filter === 'fast' ? c.approval.high <= 12 : !c.chip.shuttle)));
  const coverageMax = Math.max(...shares, 30);

  return <div className="uc-dashboard">
    <header className="pd-head">
      <h2 className="dg-verdict">Sell to industrial buyers first; automotive and defence revenue comes later.</h2>
      <p className="dg-lede"><strong>{share}%</strong> of the FY31 ramp on the December 2026 shuttle comes from <strong>{fast.length} chips</strong> whose buyers qualify parts in 6–12 months. The {slow.length} automotive and defence chips carry {cr(sum(slow, 'fy31Cr'))} of FY31 ramp between them, with estimated approval windows of 18–36 months.</p>
      <p className="pd-flag">Plan targets and estimates. No measured silicon, purchase orders or qualification is claimed.</p>
    </header>
    <div className="uc-toolbar">
      <p className="pd-source" role="status">{prov.pending ? 'Reading live portfolio tables; showing the checked copy.' : prov.live ? `Live portfolio tables · ${prov.readAt} IST` : 'Live tables unavailable; showing the copy checked at build.'}</p>
      <div><button className="uc-control" onClick={() => setSources(!sources)} aria-pressed={sources}><FileText size={16} aria-hidden="true"/>{sources ? 'Hide sources' : 'Show sources'}</button>
        <button className="uc-control" onClick={refresh} disabled={prov.pending}><RefreshCw size={16} aria-hidden="true"/>{prov.pending ? 'Reading…' : 'Refresh data'}</button></div>
    </div>
    <Insights id="uc-findings" items={[
      {value: `${share}%`, finding: 'Fast markets carry the early revenue', text: `${cr(sum(fast, 'fy31Cr'))} of ${cr(sum(shuttle, 'fy31Cr'))} on the shuttle comes from ${fast.map(c => c.chip.name).join(' and ')}.`, source: 'SKU Blueprint, Oct 2026 · plan targets; market mapping estimate'},
      {value: cr(sum(slow, 'fy31Cr')), finding: 'Slow markets wait', text: `FY31 ramp across ${slow.length} automotive and defence chips, against ${cr(sum(slow, 'planCr'))} of plan lines. Approvals take 18–36 months.`, source: 'SKU Blueprint, Oct 2026 · plan targets and estimates'},
      {value: shares.length ? `${Math.min(...shares)}–${Math.max(...shares)}%` : 'Not stated', finding: 'How much of the market the plan needs', text: `Declared midpoint shares in the Blueprint: ${planned.filter(c => c.chip.verdict === 'PLAUSIBLE').length} plausible and ${planned.filter(c => c.chip.verdict === 'CONSERVATIVE').length} conservative.`, source: 'SKU Blueprint, Oct 2026 · estimates, not won market share'},
      {value: `${sheetCount} of ${cases.length}`, finding: 'Datasheets are the evaluation gap', text: 'Only the lockstep MCU use case maps to a published preliminary DG32 datasheet. Sample dates remain unconfirmed.', source: 'DG32 preliminary datasheets, Sep 2026 · mapped document coverage'},
    ]}/>
    <nav className="uc-jump" aria-label="Use-case dashboard sections"><a href="#uc-revenue">Revenue</a><a href="#uc-timeline">Approval windows</a><a href="#uc-market">Market assumptions</a><a href="#uc-readiness">Readiness</a><a href="#uc-explore">Product fit & qualification</a></nav>

    <Chapter id="uc-revenue" title="FY31 revenue opportunity and qualification exposure">
      <div className="uc-chart-grid">
        <section className="uc-card"><h3>Markets qualifying within a year carry {cr(sum(planned.filter(c => c.approval.high <= 12), 'fy31Cr'))} of the FY31 chip ramp.</h3>
          <HBars label="FY31 ramp by approval window, rupees crore" max={Math.max(1, sum(planned, 'fy31Cr'))} rows={[[6,12],[12,18],[18,36]].map(([lo,hi]) => {
            const group = planned.filter(c => c.approval.low === lo && c.approval.high === hi), total = sum(group, 'fy31Cr');
            return {key: String(hi), label: `${lo}–${hi} months`, bars: [{value: total, slot: hi === 12 ? 1 : 0}], end: cr(total), tip: [`${lo}–${hi} month qualification`, cr(total), `${group.length} chips`, ...group.map(c => c.chip.name)]};
          })}/><Source tables={['skus', 'approvals']} expanded={sources}/></section>
        <section className="uc-card"><h3>Three chips carry {cr(sum(ranked.slice(0,3), 'fy31Cr'))} of the {cr(sum(planned, 'fy31Cr'))} chip-by-chip ramp.</h3>
          <HBars label="FY31 revenue ramp by chip, rupees crore" max={Math.max(1, ...planned.map(c => c.chip.fy31Cr ?? 0))} legend={[{name: '6–12 month qualification',slot:1},{name:'Longer qualification',slot:0}]} rows={ranked.map(c => ({key:c.sku,label:`${c.sku} · ${c.chip.name}`,bars:[{value:c.chip.fy31Cr ?? 0,slot:c.approval.high <= 12 ? 1 : 0}],end:cr(c.chip.fy31Cr ?? 0),tip:[c.chip.name,`FY31 ${cr(c.chip.fy31Cr ?? 0)}`,`${c.approval.low}–${c.approval.high} months (estimate)`]}))}/><Source tables={['skus']} expanded={sources}/></section>
      </div>
      <p className="pd-source">The eleven chip rows sum to {cr(sum(planned, 'fy31Cr'))}; the separate Blueprint ramp table states {cr(d.total[d.years.indexOf('FY31')])}. The one-crore difference is source rounding. D100 has no plan line.</p>
    </Chapter>

    <Chapter id="uc-timeline" title="Qualification lead times to volume production">
      <section className="uc-card"><h3>Qualification begins after first silicon; automotive and defence can take up to three years.</h3>
        <p className="pd-lede">Approval windows by use case, in months. Silicon return dates are not confirmed. The line marks 12 months.</p>
        <HBars label="Approval window by use case, months after first silicon" max={36} refLine={{value:12,label:'12 months'}} legend={[{name:'Shuttle, qualifies within a year',slot:1},{name:'Shuttle, slower',slot:2},{name:'Later run',slot:0}]} rows={cases.map(c => ({key:c.sku,label:`${c.sku} · ${c.title}`,range:[c.approval.low,c.approval.high],slot:!c.chip.shuttle ? 0 : c.approval.high <= 12 ? 1 : 2,end:`${c.approval.low}–${c.approval.high} mo`,tip:[c.title,c.approval.approval,`${c.approval.low}–${c.approval.high} months (estimate)`,c.chip.shuttle ? 'December 2026 shuttle plan' : 'Not on the December shuttle']}))}/>
        <Source tables={['approvals','skus']} expanded={sources}/>
      </section>
    </Chapter>

    <Chapter id="uc-market" title="Market-share assumptions and commercial exposure">
      <section className="uc-card"><h3>{shares.length && Math.max(...shares) < 30 ? 'Every declared midpoint share is below 30%.' : 'Compare declared market shares with the 30% reference.'}</h3>
        <p className="pd-lede">Bar: share at the high-end market estimate to the declared midpoint share. Dot: midpoint. These are the Blueprint's stated shares, not a calculation from the two market endpoints.</p>
        <HBars label="Declared market share range per chip, percent" max={coverageMax + 5} refLine={{value:30,label:'30% planning reference'}} legend={[{name:'Plausible (Blueprint)',slot:1},{name:'Conservative (Blueprint)',slot:0}]} rows={planned.filter(c => c.chip.shareMidPct != null && c.chip.shareTopPct != null).map(c => ({key:c.sku,label:`${c.sku} · ${c.chip.name}`,range:[c.chip.shareTopPct!,c.chip.shareMidPct!],dot:c.chip.shareMidPct!,slot:c.chip.verdict === 'PLAUSIBLE' ? 1 : 0,end:`${c.chip.shareTopPct}–${c.chip.shareMidPct}% · ${c.chip.verdict.toLowerCase()}`,tip:[c.chip.name,`Declared midpoint ${c.chip.shareMidPct}%`, `At high market estimate ${c.chip.shareTopPct}%`,c.chip.verdict + ' · Blueprint estimate']}))}/>
        <Source tables={['skus']} expanded={sources}/>
      </section>
    </Chapter>

    <Chapter id="uc-readiness" title="What a buyer can evaluate today">
      <section className="uc-card"><h3>{readyHead}</h3>
        <p className="pd-lede">Six things an engineering lead asks for. Amber = in place, light = partly, grey = not yet. Click a row to open its path below, or follow its application link. Funding is a planned allocation, not an approval held.</p>
        <ul className="uc-heat-key" aria-label="Cell shading"><li><span className="uc-heat" data-level="2" aria-hidden="true"/>In place</li><li><span className="uc-heat" data-level="1" aria-hidden="true"/>Partly</li><li><span className="uc-heat" data-level="0" aria-hidden="true"/>Not yet</li></ul>
        <div className="table-scroll uc-matrix-scroll" role="region" aria-label="Use-case readiness matrix; scroll horizontally for all six criteria" tabIndex={0}><table className="pd-table uc-matrix">
          <caption className="sr-only">What a buyer can evaluate today, by use case. Each row links to its implementation path.</caption>
          <thead><tr><th scope="col">Use case</th>{readinessLabels.map(l => <th scope="col" key={l}>{l}</th>)}<th scope="col">Score /12</th></tr></thead>
          <tbody>{readiness.map(c => <tr key={c.sku} data-selected={c.sku === active.sku} onClick={e => { if ((e.target as Element).closest('a')) return; choose(c.sku, true); document.getElementById('uc-implementation')?.scrollIntoView({block: 'start'}); }}>
            <th scope="row"><a className="uc-row-link" href={caseHref(c.sku)} onClick={openRow(c.sku)} aria-current={c.sku === active.sku ? 'true' : undefined}>{c.title}<span>{c.sku} · {c.chip.name}</span></a>
              <a className="uc-row-app" href={url(c.route)}>Application <ArrowRight size={12} aria-hidden="true"/></a></th>
            {c.criteria.map((n,i) => <td key={i}><span className="uc-heat" data-level={n}>{STATUS[n]}<span className="sr-only">: {readinessLabels[i]}</span></span></td>)}
            <td><strong>{c.score}</strong><span className="uc-score" aria-hidden="true"><span style={{width:`${c.score / 12 * 100}%`}}/></span></td></tr>)}</tbody>
        </table></div>
        <details className="uc-mobile-readiness"><summary>Compare product evaluation prerequisites</summary><p className="pd-source">Score out of 12. Document coverage, not silicon readiness. The complete six-criterion table remains above.</p><ul>{readiness.map(c => <li key={c.sku}><a href={caseHref(c.sku)} onClick={openRow(c.sku)}>{c.title}</a><span>{c.score}/12</span></li>)}</ul></details>
        <details className="uc-method"><summary>Qualification planning criteria and assessment limits</summary><p>Each of six criteria contributes 0, 1 or 2 points. Design: RTL plus analog schematics = 2, RTL only = 1, specification or undocumented = 0. Shuttle: in the December plan = 2. Datasheet: published preliminary document = 2. Unit cost: a row in the cost table = 2. Approval funded: identified first-approval allocation in tranche 1 = 2. Plan line: a published allocation = 2. This is document coverage, not a safety, certification, sample availability or silicon-readiness rating.</p></details>
        <Source tables={['skus','unit-cost','tranche1-uses','dg32-specs']} expanded={sources}/>
      </section>
    </Chapter>

    <Chapter id="uc-explore" title="Product fit and qualification route by market">
      <div className="uc-filters"><label>Find a use case<input type="search" name="q" autoComplete="off" value={search} onChange={e => updateFilter('q',e.target.value)} placeholder="Search chip, application or buyer…"/></label>
        <label>Show<select aria-label="Show" name="market" value={filter} onChange={e => updateFilter('market',e.target.value)}><option value="all">All use cases</option><option value="shuttle">December shuttle</option><option value="fast">6–12 month qualification</option><option value="later">Later runs</option></select></label>
        <p className="pd-source" role="status">{visible.length} of {cases.length} use cases</p></div>
      <div className="uc-gallery" role="group" aria-label="Choose a use case">{visible.map(c => <button key={c.sku} className="uc-case" aria-pressed={c.sku === active.sku} aria-controls="uc-implementation" onClick={() => choose(c.sku)}>
        <span className="uc-case-code">{c.sku}</span><strong>{c.title}</strong><span>{c.chip.name}</span><span className="uc-case-meta">{c.chip.shuttle ? 'December shuttle' : 'Later run'} · {c.approval.low}–{c.approval.high} mo <ArrowRight size={16} aria-hidden="true"/></span>
      </button>)}</div>
      {!visible.length && <div className="uc-empty"><p>No use cases match these filters. The previous selection remains below.</p><button className="uc-control" onClick={clearFilters}>Clear filters</button></div>}
      {!!visible.length && !visible.some(c => c.sku === active.sku) && <p className="uc-selection-note" role="status">The selected {active.chip.name} is outside these filter results. Its detail remains below; choose a matching use case or <button className="uc-control" onClick={clearFilters}>Clear filters</button>.</p>}
      <section id="uc-implementation" className="uc-card" aria-labelledby="uc-detail-title">
        <div className="uc-selected-heading"><h3 id="uc-detail-title" ref={detail} tabIndex={-1}>{active.title}</h3><span>{active.sku} · coverage {active.score}/12</span></div>
        <Implementation c={active}/>
        <Source tables={['skus','unit-cost','dg32-specs','approvals']} expanded={sources}/>
      </section>
    </Chapter>
    <p className="pd-source">{useCaseSource.kind} <a className="pd-link" href={useCaseSource.reference} target="_blank" rel="noreferrer">Published dashboard reference</a>. No purchase orders or letters of intent are represented.</p>
  </div>;
}
