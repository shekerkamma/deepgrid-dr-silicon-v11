'use client';
/** Investor and buyer brief (/portfolio/brief) as a dashboard. Data: briefVisual and the brief text in
 *  app/brief-content.ts (13 Oct 2026, every figure checked against data/portfolio and data/plan).
 *
 *  Forms (dataviz): KPI tiles for the headline figures; emphasis bars for plan line vs FY31 ramp (the ramp is the
 *  point, the line is grey context); range bars for approval months and per-chip margins against the model's 84 %
 *  reference line; grouped columns for the two plans by year, the model's total in grey; a stacked part-to-whole bar
 *  for each capital structure; cards for the questions, with the full answer one click away; a status matrix for
 *  what a buyer can have today (icon + word, never colour alone). The full brief text stays at the foot of each tab. */
import {useEffect, useState} from 'react';
import {brief, briefVisual as v, type Block, type Status} from './brief-content';
import {HBars, GroupedColumns, Insights, Chapter} from './dash-charts';
import {url} from './routes';
import {UseCaseDashboard} from './use-case-dashboard';

const NB = ' ';
const cr = (x: number) => `₹${x.toLocaleString('en-IN', {maximumFractionDigits: 1})}${NB}Cr`;

function Render({b}: {b: Block}) {
  if ('h2' in b) return <h3 className="bf-h2">{b.h2}</h3>;
  if ('h3' in b) return <h4 className="bf-h3">{b.h3}</h4>;
  if ('p' in b) return <p className="pd-lede">{b.lead && <strong>{b.lead} </strong>}{b.p}</p>;
  if ('list' in b) {
    const items = b.list.map((i, k) => <li key={k}>{i.lead && <strong>{i.lead} </strong>}{i.text}</li>);
    return b.ordered ? <ol className="bf-list">{items}</ol> : <ul className="bf-list">{items}</ul>;
  }
  return <>
    <div className="table-scroll"><table className="pd-table sk-table">
      <thead><tr>{b.table.head.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
      <tbody>
        {b.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th scope="row" key={j}>{c}</th> : <td key={j} className="sk-wrap">{c}</td>)}</tr>)}
        {b.table.total && <tr className="pd-total">{b.table.total.map((c, j) => j === 0 ? <th scope="row" key={j}>{c}</th> : <td key={j}>{c}</td>)}</tr>}
      </tbody>
    </table></div>
    {b.note && <p className="pd-source">{b.note}</p>}
  </>;
}

/** The text under the h3 that starts with "n." in a tab: the full answer behind a card. */
function answer(tabId: string, n: number): Block[] {
  const blocks = brief.find(t => t.id === tabId)!.blocks, out: Block[] = [];
  let on = false;
  for (const b of blocks) {
    if ('h2' in b || 'h3' in b) { if (on) break; on = 'h3' in b && b.h3.startsWith(n + '.'); continue; }
    if (on) out.push(b);
  }
  return out;
}


const STATUS: Record<Status, [string, string]> = {yes: ['✓', 'Yes'], no: ['✕', 'No'], partial: ['◐', 'Partly']};

function TrancheTab() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => { setDays(Math.max(0, Math.ceil((Date.parse(v.shuttleDeadline + 'T23:59:59+05:30') - Date.now()) / 86400000))); }, []);
  const chips = v.chips, top3 = [...chips].sort((a, b) => b.ramp - a.ramp).slice(0, 3);
  const top3Ramp = top3.reduce((a, c) => a + c.ramp, 0), ramp9 = chips.reduce((a, c) => a + c.ramp, 0);
  const y31 = v.compare.periods.indexOf('FY31');
  const fullText = brief.find(t => t.id === 'tranche-1')!.blocks;
  const uses = [...v.tranche].sort((a, b) => b.cr - a.cr), useTotal = uses.reduce((a, u) => a + u.cr, 0), use3 = uses.slice(0, 3).reduce((a, u) => a + u.cr, 0);
  const gap31 = v.compare.blueprintChips[y31] / v.compare.modelChips[y31];
  return <>
    <header className="pd-head">
      <h2 className="dg-verdict">₹10 Cr targets first silicon for nine chips.</h2>
      <p className="dg-lede">Tranche 1 plans nine of eleven chips for the 26 Dec 2026 shuttle{days != null ? `, ${days} days away,` : ''} carrying {cr(chips.reduce((a, c) => a + c.plan, 0))} of the {cr(v.planTotal)} plan lines. The Blueprint's FY31 chip ramp is {gap31.toFixed(1)}× the September model's chip line. Review the reconciliation below; these are different plans and revenue scopes.</p>
    </header>
    <Insights items={[
      {value: `${Math.round(use3 / useTotal * 100)}${NB}%`, finding: 'Most of tranche 1 buys silicon', text: `${uses.slice(0, 3).map(u => u.use.split(',')[0].toLowerCase()).join(', ').replace(/^./, c => c.toUpperCase())}: ${cr(use3)} of the ${cr(useTotal)}. The rest is approvals, tools and contingency.`, source: 'SKU Blueprint, Oct 2026 · plan targets'},
      {value: `${gap31.toFixed(1)}×`, finding: 'The two plans disagree on chips', text: `FY31 chip revenue: ${cr(v.compare.blueprintChips[y31])} in the Blueprint against ${cr(v.compare.modelChips[y31])} in the model, whose ${cr(v.compare.modelTotal[y31])} total is mostly Systems.`, source: 'Blueprint, Oct 2026; model v3, Sep 2026 · plan targets'},
      {value: cr(v.cashLow.value), finding: `Cash is tightest in ${v.cashLow.year}`, text: `Lowest closing cash in model v3, at the end of ${v.cashLow.year}, before chip and Systems revenue catch up.`, source: 'Model v3, Sep 2026 · plan target'},
      {value: '₹41.7–91.2 Cr', finding: 'Full development is a later raise', text: 'Estimated development cost for all eleven chips (₹31.9–70.6 Cr for the nine on the shuttle). Tranche 1 funds prototypes, not full development.', source: 'SKU Blueprint, Oct 2026 · estimates'},
    ]}/>

    <Chapter id="ch-buys" title="What tranche 1 buys">
    <section className="pd-panel" aria-labelledby="bf-chips-h">
      <h3 id="bf-chips-h">Three of the nine carry {cr(top3Ramp)} of their {cr(ramp9)} FY31 ramp: {top3.map(c => c.sku).join(', ')}.</h3>
      <div className="bf-two">
        <HBars label="Plan line and FY31 ramp for the nine shuttle chips, ₹ Cr" max={Math.max(...chips.map(c => c.plan))}
          legend={[{name: 'Plan line (full rate)', slot: 0}, {name: 'FY31 ramp', slot: 1}]}
          rows={chips.map(c => ({key: c.sku, label: `${c.sku} ${c.name}`, bars: [{value: c.plan, slot: 0}, {value: c.ramp, slot: 1}], end: `${c.ramp} / ${c.plan}`,
            tip: [`${c.sku} ${c.name}`, `FY31 ramp ${cr(c.ramp)}`, `Plan line ${cr(c.plan)}`, `First market: ${c.market}`]}))}/>
        <HBars label="Approval time before volume revenue for each shuttle chip, months, estimate" max={36}
          rows={chips.map(c => ({key: c.sku, label: `${c.sku} · ${c.market}`, range: c.approval as [number, number], end: `${c.approval[0]}–${c.approval[1]} mo`,
            tip: [`${c.sku} ${c.name}`, `${c.market}: ${c.approval[0]}–${c.approval[1]} months (estimate)`]}))}/>
      </div>
      <p className="pd-source">Left: plan targets, SKU Blueprint (Oct 2026). Right: approval months by first market, the Blueprint's approval table; which market each chip enters first is an estimate.</p>
    </section>
    </Chapter>

    <Chapter id="ch-differ" title="Why the two plans differ">
    <section className="pd-panel" aria-labelledby="bf-plans-h">
      <h3 id="bf-plans-h">The two plans meet in FY31 only by coincidence: {cr(v.compare.blueprintChips[y31])} of chips in the Blueprint, {cr(v.compare.modelTotal[y31])} for the whole company in the model, of which chips are {cr(v.compare.modelChips[y31])}.</h3>
      <GroupedColumns label="Chip revenue in the SKU Blueprint and in the financial model, with the model's whole-company total, FY29 to FY32, ₹ Cr" unit={cr}
        periods={v.compare.periods} series={[
          {name: 'Blueprint: chips', slot: 1, values: v.compare.blueprintChips},
          {name: 'Model: chips (Semiconductors)', slot: 2, values: v.compare.modelChips},
          {name: 'Model: whole company', slot: 0, values: v.compare.modelTotal},
        ]}/>
      <p className="pd-source">SKU Blueprint ramp table (Oct 2026); financial model corrected v3 (Sep 2026), revenue by segment. Plan targets. The model's chip line predates the Blueprint; a model v4 with the Blueprint ramp is due before tranche 2.</p>
    </section>

    <section className="pd-panel" aria-labelledby="bf-cap-h">
      <h3 id="bf-cap-h">The Blueprint raises {cr(50)} of equity in two tranches; the model raises {cr(55)}, {cr(10)} of it as a loan. Per-chip margins sit below the model's {v.margins.modelFy31}{NB}%.</h3>
      <div className="bf-two">
        <HBars label="Capital raised in each plan, parts, ₹ Cr" max={55}
          legend={v.capital.flatMap(c => c.parts.map(p => ({name: p.name, slot: p.slot})))}
          rows={v.capital.map(c => ({key: c.plan, label: c.plan, stack: c.parts, end: cr(c.parts.reduce((a, p) => a + p.value, 0)), tip: [`Total ${cr(c.parts.reduce((a, p) => a + p.value, 0))}`]}))}/>
        <HBars label="Gross margin at volume per costed chip, per cent, estimate, against the model's FY31 margin" max={100}
          refLine={{value: v.margins.modelFy31, label: `Model's FY31 gross margin, ${v.margins.modelFy31}${NB}% (Sep 2026)`}}
          rows={v.margins.chips.map(m => ({key: m.chip, label: m.chip, range: [m.low, m.high] as [number, number], end: `${m.low}–${m.high}${NB}%`,
            tip: [m.chip, `${m.low}–${m.high}% gross margin at ${m.at} (estimate)`]}))}/>
      </div>
      <p className="pd-source">Capital: SKU Blueprint equity table and financial model sources of funds. Margins: SKU Blueprint unit-cost table (estimates, no silicon yet); the model's FY31 gross profit ₹501.0 Cr on revenue ₹594.3 Cr.</p>
    </section>
    </Chapter>

    <Chapter id="ch-ask" title="What investors will ask">
    <section className="pd-panel" aria-labelledby="bf-q-h">
      <h3 id="bf-q-h">Five investor questions: what is shown so far, and what is still a target.</h3>
      <ol className="bf-cards">{v.investor.map((q, i) => <li className="bf-card" key={q.q}>
        <span className="bf-num">{i + 1}</span>
        <p className="bf-ask">{q.q}</p>
        <p className="bf-verdict">{q.verdict}</p>
        <dl className="bf-kv"><dt>Shown so far</dt><dd>{q.proven}</dd><dt>Target or estimate</dt><dd>{q.target}</dd></dl>
        <details className="bf-more"><summary>Full answer</summary>{answer('tranche-1', i + 1).map((b, k) => <Render key={k} b={b}/>)}</details>
      </li>)}</ol>
    </section>
    </Chapter>

    <aside className="bf-callout"><strong>Recommendation.</strong> Present the Blueprint as the chip plan and the ₹10 Cr table as the ask; describe the September model as the company-wide plan written before it, and commit to a model v4 with the Blueprint ramp before tranche 2.</aside>

    <details className="bf-text"><summary>Read the full tranche-1 brief as text</summary>{fullText.map((b, i) => <Render key={i} b={b}/>)}</details>
  </>;
}

function BuyerTab() {
  const noSheet = v.buyers.filter(b => b.status && b.status[0] === 'no');
  const planBehind = v.chips.filter(c => noSheet.some(b => b.chip === c.sku)).reduce((a, c) => a + c.plan, 0);
  const withApproval = v.buyers.filter(b => b.approval);
  const fullText = brief.find(t => t.id === 'buyers')!.blocks;
  const gaps = (fullText.find(b => 'list' in b) as Extract<Block, {list: unknown}>).list;
  return <>
    <header className="pd-head">
      <h2 className="dg-verdict">A buyer can evaluate two DG32 dies today; the chips buyers ask about most have no datasheet and no sample date yet.</h2>
      <p className="dg-lede">Six questions an equipment maker's engineering or programme lead would ask, answered with what is documented and what is still a target. None can give a sample date; {noSheet.length} name a chip with no datasheet.</p>
    </header>
    <Insights items={[
      {value: '0', finding: 'No sample dates yet', text: 'No source states when the December 2026 shuttle silicon returns; every answer says "after first silicon".', source: 'Buyer answers, 13 Oct 2026'},
      {value: `${noSheet.length} of ${v.buyers.length}`, finding: 'Chips asked about with no datasheet', text: `${noSheet.map(b => b.chip).join(', ')}. Only DG32-LITE and DG32-2DOM have preliminary datasheets.`, source: 'DG32 datasheets, 12 Sep 2026'},
      {value: cr(planBehind), finding: 'The undocumented chips carry the plan', text: 'Plan lines of the three chips with no datasheet: most of the ₹1,000 Cr.', source: 'SKU Blueprint, Oct 2026 · plan targets'},
      {value: '6–36 mo', finding: 'Then approval', text: "After first silicon, the buyer's market approval takes 6–12 months (industrial) to 18–36 (defence, automotive).", source: 'SKU Blueprint, Oct 2026 · estimates'},
    ]}/>

    <Chapter id="ch-today" title="What a buyer can have today">
    <section className="pd-panel" aria-labelledby="bf-ready-h">
      <h3 id="bf-ready-h">What a buyer can have today: two datasheets, no sample dates, no approvals, nothing measured on silicon.</h3>
      <div className="table-scroll"><table className="pd-table bf-matrix">
        <caption className="sr-only">Buyer readiness by question</caption>
        <thead><tr><th scope="col">Buyer</th><th scope="col">Chip</th><th scope="col">Answer</th>{v.readinessColumns.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{v.buyers.map(b => <tr key={b.ask}>
          <th scope="row">{b.who}</th><td>{b.chip}</td><td className="sk-wrap">{b.verdict}</td>
          {v.readinessColumns.map((c, i) => { const s = b.status?.[i]; return <td key={c} className={'bf-st' + (s ? ' bf-' + s : '')}>{s ? <><span aria-hidden="true">{STATUS[s][0]}</span> {STATUS[s][1]}</> : '–'}</td>; })}
        </tr>)}</tbody>
      </table></div>
      <p className="pd-source">From the six buyer answers (13 Oct 2026). "Approval held" means the market approval the buyer needs; none is held yet.</p>
    </section>

    <section className="pd-panel" aria-labelledby="bf-wait-h">
      <h3 id="bf-wait-h">After first silicon, these buyers wait another 6 to 36 months for the approval their market needs.</h3>
      <HBars label="Approval months for the chips buyers asked about, estimate" max={36}
        rows={withApproval.map(b => ({key: b.chip, label: `${b.chip} · ${b.who}`, range: b.approval as [number, number], end: `${b.approval![0]}–${b.approval![1]} mo`, tip: [b.chip, `${b.approval![0]}–${b.approval![1]} months (estimate)`, b.who]}))}/>
      <p className="pd-source">SKU Blueprint approval table by market (estimates).</p>
    </section>
    </Chapter>

    <Chapter id="ch-buyers" title="What buyers ask">
    <section className="pd-panel" aria-labelledby="bf-bq-h">
      <h3 id="bf-bq-h">Six questions, six honest answers.</h3>
      <ol className="bf-cards">{v.buyers.map((b, i) => <li className="bf-card" key={b.ask}>
        <span className="bf-num">{i + 1}</span>
        <p className="bf-who">{b.chip === '–' ? b.who : `${b.who} · ${b.chip}`}</p>
        <p className="bf-ask">“{b.ask}”</p>
        <p className="bf-verdict">{b.verdict}</p>
        <dl className="bf-kv"><dt>Missing for the buyer</dt><dd>{b.missing}</dd></dl>
        <details className="bf-more"><summary>Full answer</summary>{answer('buyers', i + 1).map((x, k) => <Render key={k} b={x}/>)}</details>
      </li>)}</ol>
    </section>
    </Chapter>

    <Chapter id="ch-close" title="What to close first">
    <section className="pd-panel" aria-labelledby="bf-gap-h">
      <h3 id="bf-gap-h">Four gaps to close before buyer conversations start.</h3>
      <ol className="bf-gaps">{gaps.map((g, i) => <li key={i}><span className="bf-num">{i + 1}</span><p><strong>{g.lead}</strong> {g.text}</p></li>)}</ol>
    </section>
    </Chapter>

    <details className="bf-text"><summary>Read the buyer answers as text</summary>{fullText.map((b, i) => <Render key={i} b={b}/>)}</details>
  </>;
}

export function BriefView() {
  const [tab, setTab] = useState(brief[0].id);
  const tabs = [...brief.map(x => ({id:x.id,title:x.title})), {id:'use-cases',title:'Use cases & implementation'}];
  useEffect(() => {
    const read = () => { const view = new URLSearchParams(location.search).get('view'); setTab(view && ['tranche-1','buyers','use-cases'].includes(view) ? view : brief[0].id); };
    read(); window.addEventListener('popstate',read); return () => window.removeEventListener('popstate',read);
  }, []);
  const select = (id: string) => {
    setTab(id); const target = new URL(location.href); target.searchParams.set('view',id); if (id !== 'use-cases') ['sku','q','market'].forEach(key=>target.searchParams.delete(key)); history.pushState(null,'',target);
  };
  return (
    <div className="pd-root">
      {tab !== 'use-cases' && <p className="pd-flag"><strong>Plan targets and estimates, not results.</strong> Written {v.dated} from the SKU Blueprint (October 2026), the financial model (corrected v3, September 2026) and the DG32 preliminary datasheets. The live figures are on <a className="pd-link" href={url('/portfolio')}>the SKU portfolio page</a> and <a className="pd-link" href={url('/plan')}>the business plan</a>.</p>}
      <div className="bf-tabs" role="tablist" aria-label="Brief sections">
        {tabs.map((x,i) => <button key={x.id} role="tab" id={'bf-tab-' + x.id} aria-controls={'bf-panel-' + x.id} aria-selected={x.id === tab} tabIndex={x.id === tab ? 0 : -1} className="bf-tab" onClick={() => select(x.id)} onKeyDown={e => {
          const next = e.key === 'ArrowRight' ? (i+1)%tabs.length : e.key === 'ArrowLeft' ? (i+tabs.length-1)%tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : -1;
          if (next < 0) return; e.preventDefault(); select(tabs[next].id); document.getElementById('bf-tab-'+tabs[next].id)?.focus();
        }}>{x.title}</button>)}
      </div>
      <div className="bf-panel" role="tabpanel" id={'bf-panel-' + tab} aria-labelledby={'bf-tab-' + tab}>
        {tab === 'tranche-1' ? <TrancheTab/> : tab === 'buyers' ? <BuyerTab/> : <UseCaseDashboard/>}
      </div>
    </div>
  );
}

export default BriefView;
