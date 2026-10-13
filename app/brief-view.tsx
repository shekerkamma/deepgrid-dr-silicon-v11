'use client';
/** Investor and buyer brief (/portfolio/brief): the two tabs of app/brief-content.ts, rendered with the dashboard
 *  styles (plan-dashboard.css). Content only; every figure was checked against the portfolio and plan tables. */
import {useState} from 'react';
import {brief, type Block} from './brief-content';
import {url} from './routes';

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

export function BriefView() {
  const [tab, setTab] = useState(brief[0].id);
  const t = brief.find(x => x.id === tab)!;
  return (
    <div className="pd-root">
      <p className="pd-flag"><strong>Plan targets and estimates, not results.</strong> Written {t.dated} from the SKU Blueprint (October 2026), the financial model (corrected v3, September 2026) and the DG32 preliminary datasheets. The live figures are on <a className="pd-link" href={url('/portfolio')}>the SKU portfolio page</a> and <a className="pd-link" href={url('/plan')}>the business plan</a>.</p>
      <div className="bf-tabs" role="tablist" aria-label="Brief sections">
        {brief.map(x => <button key={x.id} role="tab" id={'bf-tab-' + x.id} aria-controls={'bf-panel-' + x.id} aria-selected={x.id === tab} className="bf-tab" onClick={() => setTab(x.id)}>{x.title}</button>)}
      </div>
      <section className="pd-panel bf-panel" role="tabpanel" id={'bf-panel-' + t.id} aria-labelledby={'bf-tab-' + t.id}>
        {t.blocks.map((b, i) => <Render key={t.id + i} b={b}/>)}
      </section>
    </div>
  );
}

export default BriefView;
