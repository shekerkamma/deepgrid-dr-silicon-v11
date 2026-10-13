'use client';
/** Business-plan dashboard: public on v11/v12 (DGS_PLAN=1, owner 2026-10-12) and on the Sheker-semi droplet.
 *
 *  Data: app/plan-data.json, written per build by scripts/build-plan-data.mjs from data/plan/*.csv, which
 *  scripts/plan/extract_plan_blocks.py extracts from the corrected model workbook. Public builds get
 *  {"available": false} and this renders a notice instead, so no plan figure ships.
 *
 *  Layout (dashboard brief, 2026-10-12): a KPI row (label, large figure, context), then the detail. Every
 *  figure carries its definition from data/plan/metrics.md (ai-analyst define-metric), visible under it,
 *  and every panel links the CSV it is drawn from. Charts follow the dataviz method: one axis per chart,
 *  categorical hues in a fixed order validated on the card surface (#121b2d), thin marks with a 2px surface
 *  gap, a legend with direct labels, a hover tooltip on every mark, and a table holding the same numbers.
 *  Plan targets only: no review findings (owner, 2026-10-12).
 */
import {useState} from 'react';
import raw from './plan-data.json';
import {revenueBuild} from './company-content';
import {asset, url} from './routes';
import {Insights, Chapter} from './dash-charts';

/** Generic by design: every plan-specific label arrives in the data (scripts/build-plan-data.mjs), because this
 *  file's code ships in every build, public included. */
type Row = {label: string; strong: boolean; values: number[]};
type Item = {label: string; value: number};
type PlanData = {available: true; model: string; periods: string[];
  series: {revenue: number[]; grossProfit: number[]; ebitda: number[]; netIncome: number[]; openingCash: number[]; closingCash: number[]; netCashFlow: number[]; capex: number[]};
  capexLabel: string; segments: {name: string; values: number[]}[]; reconcileSegment: string; reconcileLede: string;
  plRows: Row[]; cashRows: Row[]; cashNote: string; sources: Item[]; uses: Item[]; checks: string[]};
const data = raw as unknown as PlanData | {available: false};

const NB = ' ';
const cr = (v: number, dp = 2) => `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN', {minimumFractionDigits: dp, maximumFractionDigits: dp})}${NB}Cr`;
const pct = (v: number, dp = 1) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(dp)}${NB}%`;
/** One rounding path for every figure: cr() and num() both use Intl, so a value such as 45.025 reads 45.03 in a
 *  heading and in a table alike (toFixed would give 45.02 from the binary float). */
const num = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false});
const fy = (p: string) => 'FY' + p.slice(-2);

/** Tooltip anchored above its mark; near either end of the plot it aligns to the inside edge so it never hangs off
 *  the chart (or off a phone screen). frac = the mark's horizontal position, 0..1. */
const W0 = 720;
type Tip = {x: number; y: number; lines: string[]; frac: number; w: number} | null;
/** Horizontal: centred on the mark, or aligned to the inside edge near either end. Vertical: above the mark, or
 *  below it when the mark is too near the top for the tooltip to fit (verify-plan.mjs asserts it stays inside). */
/** Edge alignment by the room in pixels (half a tooltip, ~90px), not by a fraction of the chart: on a 390px phone a
 *  mark at 15 % of the width still pushed a centred tooltip off screen. */
const ROOM = 90;
const tx = (x: number, w: number) => x < ROOM ? '-8px' : w - x < ROOM ? 'calc(-100% + 8px)' : '-50%';
const place = (x: number, w: number, y: number) => `translate(${tx(x, w)}, ${y < 96 ? '12px' : 'calc(-100% - 10px)'})`;
function TipBox({tip}: {tip: Tip}) {
  if (!tip) return null;
  return <div className="pd-tip" role="status" style={{left: tip.x, top: tip.y, transform: place(tip.x, tip.w, tip.y)}}>{tip.lines.map((l, i) => <span key={i} className={i === 0 ? 'pd-tip-head' : undefined}>{l}</span>)}</div>;
}
function Source({files, note}: {files: string[]; note: string}) {
  return <p className="pd-source">{note} Source: {files.map((f, i) => <span key={f}>{i > 0 && ', '}<a className="pd-link" href={asset('/plan-data/' + f)} download>{f}</a></span>)}.</p>;
}
/** The metric's definition, visible under the figure (data/plan/metrics.md). */
function Def({children}: {children: React.ReactNode}) { return <span className="pd-def">{children}</span>; }

function StackedBars({d}: {d: PlanData}) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 720, H = 340, L = 56, R = 120, T = 28, B = 32;
  const segs = d.segments, totals = d.periods.map((_, i) => segs.reduce((a, s) => a + s.values[i], 0));
  const max = Math.ceil(Math.max(...totals) / 250) * 250, ticks = Array.from({length: max / 250 + 1}, (_, i) => i * 250);
  const band = (W - L - R) / d.periods.length, bw = band * 0.56, y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label="Revenue by segment by year, ₹ Cr, stacked bars. The same figures are in the table below.">
      <ul className="pd-legend" aria-label="Segments">{segs.map((s, i) => <li key={s.name}><span className={'pd-swatch pd-s' + (i + 1)} aria-hidden="true"/>{s.name}</li>)}</ul>
      <div className="pd-plot" onMouseLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true">
          {ticks.map(t => <g key={t}><line className="pd-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t.toLocaleString('en-IN')}</text></g>)}
          {d.periods.map((p, pi) => {
            const x = L + band * pi + (band - bw) / 2; let acc = 0;
            return <g key={p}>
              {segs.map((s, si) => {
                const v = s.values[pi]; if (v <= 0) return null;
                const y0 = y(acc), y1 = y(acc + v); acc += v;
                const show = (e: React.MouseEvent) => { const b = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
                  setTip({x: (x + bw / 2) / W * b.width, y: y1 / H * b.height, frac: (x + bw / 2) / W, w: b.width, lines: [`${s.name} · ${fy(p)}`, cr(v), `${pct(v / totals[pi])} of ${fy(p)} revenue`]}); };
                return <rect key={s.name} className={'pd-s' + (si + 1)} x={x} y={y1} width={bw} height={Math.max(0, y0 - y1 - 2)} onMouseEnter={show} onMouseMove={show}/>;
              })}
              <text className="pd-value" x={x + bw / 2} y={y(totals[pi]) - 8} textAnchor="middle">{totals[pi] < 10 ? totals[pi].toFixed(1) : Math.round(totals[pi]).toLocaleString('en-IN')}</text>
              {/* Direct labels on the last bar, only for segments tall enough to carry one; the legend names the rest. */}
              {pi === d.periods.length - 1 && (() => { let a2 = 0; return segs.map(s => { const v = s.values[pi], top = y(a2 + v), bot = y(a2); a2 += v;
                return bot - top >= 16 ? <text key={s.name} className="pd-seglabel" x={x + bw + 8} y={(top + bot) / 2 + 4}>{s.name}</text> : null; }); })()}
              <text className="pd-axis" x={x + bw / 2} y={H - 10} textAnchor="middle">{fy(p)}</text>
            </g>;
          })}
        </svg>
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

function Lines({d, series, label}: {d: PlanData; series: {name: string; values: number[]; slot: number}[]; label: string}) {
  const [hover, setHover] = useState<number | null>(null), [pw, setPw] = useState(W0);
  const W = 720, H = 300, L = 56, R = 16, T = 20, B = 32;
  const all = series.flatMap(s => s.values);
  const lo = Math.min(-0.4, Math.floor(Math.min(...all) * 5) / 5), hi = 1;
  const ticks: number[] = []; for (let t = lo; t <= hi + 1e-9; t += 0.2) ticks.push(+t.toFixed(1));
  const step = (W - L - R) / (d.periods.length - 1), x = (i: number) => L + step * i, y = (v: number) => T + (H - T - B) * (hi - v) / (hi - lo);
  return (
    <figure className="pd-figure" aria-label={label}>
      <ul className="pd-legend" aria-label="Lines">{series.map(s => <li key={s.name}><span className={'pd-swatch pd-s' + s.slot} aria-hidden="true"/>{s.name}</li>)}</ul>
      <div className="pd-plot" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true"
          onMouseMove={e => { const b = e.currentTarget.getBoundingClientRect(); setPw(b.width); setHover(Math.max(0, Math.min(d.periods.length - 1, Math.round(((e.clientX - b.left) / b.width * W - L) / step)))); }}>
          {ticks.map(t => <g key={t}><line className={t === 0 ? 'pd-zero' : 'pd-grid'} x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{Math.round(t * 100)}%</text></g>)}
          {d.periods.map((p, i) => <text key={p} className="pd-axis" x={x(i)} y={H - 10} textAnchor="middle">{fy(p)}</text>)}
          {hover !== null && <line className="pd-cross" x1={x(hover)} x2={x(hover)} y1={T} y2={H - B}/>}
          {series.map(s => <g key={s.name}>
            <path className={'pd-line pd-l' + s.slot} d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')}/>
            {s.values.map((v, i) => <circle key={i} className={'pd-dot pd-l' + s.slot} cx={x(i)} cy={y(v)} r={4}/>)}
            <text className="pd-value" x={x(s.values.length - 1) - 8} y={y(s.values[s.values.length - 1]) - 9} textAnchor="end">{pct(s.values[s.values.length - 1])}</text>
          </g>)}
        </svg>
        {hover !== null && <div className="pd-tip" role="status" style={{left: `${x(hover) / W * 100}%`, top: 8, transform: `translate(${tx(x(hover) / W * pw, pw)}, 0)`}}>
          <span className="pd-tip-head">{fy(d.periods[hover])}</span>{series.map(s => <span key={s.name}>{s.name} {pct(s.values[hover])}</span>)}</div>}
      </div>
    </figure>
  );
}

function CashBars({d}: {d: PlanData}) {
  const [tip, setTip] = useState<Tip>(null);
  const close = d.series.closingCash, open0 = d.series.openingCash[0];
  const W = 720, H = 300, L = 56, R = 12, T = 28, B = 32;
  const max = Math.ceil(Math.max(open0, ...close) / 50) * 50, ticks = Array.from({length: max / 50 + 1}, (_, i) => i * 50).filter((t, i, a) => a.length <= 8 || i % 2 === 0);
  const trough = close.indexOf(Math.min(...close));
  const band = (W - L - R) / d.periods.length, bw = band * 0.5, y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label="Closing cash by year, ₹ Cr, with the FY27 opening balance as a reference line. The same figures are in the cash table below.">
      <ul className="pd-legend" aria-label="Marks"><li><span className="pd-swatch pd-s1" aria-hidden="true"/>Closing cash</li><li><span className="pd-swatch pd-ref" aria-hidden="true"/>Opening cash, FY27 ({cr(open0)})</li></ul>
      <div className="pd-plot" onMouseLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true">
          {ticks.map(t => <g key={t}><line className="pd-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
          <line className="pd-refline" x1={L} x2={W - R} y1={y(open0)} y2={y(open0)}/>
          {d.periods.map((p, i) => {
            const x = L + band * i + (band - bw) / 2, v = close[i];
            const show = (e: React.MouseEvent) => { const b = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
              setTip({x: (x + bw / 2) / W * b.width, y: y(v) / H * b.height, frac: (x + bw / 2) / W, w: b.width, lines: [`${fy(p)} closing cash`, cr(v), `net cash flow ${cr(d.series.netCashFlow[i])}`]}); };
            return <g key={p}>
              <rect className="pd-s1" x={x} y={y(v)} width={bw} height={y(0) - y(v)} onMouseEnter={show} onMouseMove={show}/>
              <text className="pd-value" x={x + bw / 2} y={y(v) - 8} textAnchor="middle">{v.toFixed(1)}{i === trough ? ' (lowest)' : ''}</text>
              <text className="pd-axis" x={x + bw / 2} y={H - 10} textAnchor="middle">{fy(p)}</text>
            </g>;
          })}
        </svg>
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

export function PlanDashboard() {
  if (!data.available) return (
    <section className="pd-unavailable">
      <h2>The business-plan dashboard is not published on this build.</h2>
      <p>Plan figures are not built here. Ask the DeepGrid team for the business plan, or for the data room.</p>
      <a className="pd-link" href={url('/contact')}>Contact the team</a>
    </section>
  );
  const d = data, n = d.periods.length, last = n - 1, F0 = fy(d.periods[0]), FL = fy(d.periods[last]);
  const {revenue: rev, grossProfit: gp, ebitda, netIncome: ni} = d.series;
  const firstProfit = ni.findIndex(v => v > 0);
  const close = d.series.closingCash, trough = close.indexOf(Math.min(...close)), open0 = d.series.openingCash[0];
  const segs = d.segments, segTotal = (i: number) => segs.reduce((a, s) => a + s.values[i], 0);
  const segMax = Math.max(...segs.map(s => s.values[last]));
  const sources = d.sources, uses = [...d.uses].sort((a, b) => b.value - a.value);
  const recon = segs.find(s => s.name === d.reconcileSegment);
  const usesTotal = uses.reduce((a, f) => a + f.value, 0), useMax = Math.max(...uses.map(f => f.value));
  const company = revenueBuild.filter(([k]) => /^FY\d\d$/.test(k)).map(([k, v]) => ({fy: k, plan: Number(v.replace(/[^\d.]/g, ''))}));
  return (
    <div className="pd-root">
      <header className="pd-head">
        <h2 className="dg-verdict">The model turns profitable in {fy(d.periods[firstProfit])}, but cash bottoms at {cr(close[trough])} in {fy(d.periods[trough])}, and {pct(segs[0].values[last] / segTotal(last), 0)} of {FL} revenue is {segs[0].name}.</h2>
        <p className="dg-lede">Revenue grows from {cr(rev[0])} in {F0} to {cr(rev[last])} in {FL}. {segs[0].name} carries most of it{recon && recon !== segs[0] ? `; ${recon.name} is ${pct(recon.values[last] / segTotal(last), 0)} of ${FL} revenue` : ''}. The raise has to carry the company through the {fy(d.periods[trough])} cash low before revenue catches up.</p>
        <p className="pd-flag"><strong>Plan targets, not results.</strong> {d.model}, {F0}–{FL}, base scenario, ₹{NB}Cr. Nothing here is audited or contracted. {d.checks.length} accounting identities are re-checked on every build; they show the model adds up, not that its assumptions hold.</p>
      </header>

      <Insights items={[
        {value: cr(rev[last], 0), finding: `Revenue in ${FL}`, text: `From ${cr(rev[0])} in ${F0} and ${cr(rev[Math.min(2, last)])} in ${fy(d.periods[Math.min(2, last)])}: most of the growth comes in the last three years.`, source: `${d.model} · plan target · units × price, summed over business lines`},
        {value: pct(segs[0].values[last] / segTotal(last), 0), finding: `${segs[0].name} is most of it`, text: `${segs[0].name} is ${cr(segs[0].values[last], 0)} of ${FL} revenue${recon && recon !== segs[0] ? `; ${recon.name} is ${cr(recon.values[last], 0)} (${pct(recon.values[last] / segTotal(last), 0)})` : ''}.`, source: `${d.model} · plan target · segment ÷ total revenue, same year`},
        {value: fy(d.periods[firstProfit]), finding: 'First profitable year', text: `Net income ${cr(ni[firstProfit])}; EBITDA ${cr(ebitda[firstProfit])}. Gross margin reaches ${pct(gp[last] / rev[last])} by ${FL}.`, source: `${d.model} · plan target · tax at 25 % after loss carry-forward`},
        {value: cr(close[trough]), finding: `Cash is tightest in ${fy(d.periods[trough])}`, text: `Lowest year-end cash, down from ${cr(open0)} at the start of ${F0}, before revenue catches up.`, source: `${d.model} · plan target · year-end balances only`},
      ]}/>

      <Chapter id="ch-sells" title="What the company sells">
      <section className="pd-panel" aria-labelledby="pd-seg-h">
        <h3 id="pd-seg-h">{segs[0].name} carries {pct(segs[0].values[last] / segTotal(last), 0)} of {FL} revenue; {segs[1].name} follows with {pct(segs[1].values[last] / segTotal(last), 0)}.</h3>
        <StackedBars d={d}/>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Revenue by segment, ₹ Cr</caption>
          <thead><tr><th scope="col">Segment</th>{d.periods.map(p => <th scope="col" key={p}>{fy(p)}</th>)}<th scope="col">{FL} share</th></tr></thead>
          <tbody>
            {segs.map((s, si) => <tr key={s.name}><th scope="row"><span className={'pd-swatch pd-s' + (si + 1)} aria-hidden="true"/>{s.name}</th>
              {s.values.map((v, i) => <td key={i}>{num(v)}</td>)}
              <td><span className="pd-inbar"><span className={'pd-inbar-fill pd-s' + (si + 1)} style={{width: `${s.values[last] / segMax * 100}%`}}/></span>{pct(s.values[last] / segTotal(last))}</td></tr>)}
            <tr className="pd-total"><th scope="row">Total</th>{d.periods.map((_, i) => <td key={i}>{num(segTotal(i))}</td>)}<td>100.0{NB}%</td></tr>
          </tbody>
        </table></div>
        <Source files={['revenue-by-segment.csv']} note="Segment share = segment revenue ÷ total revenue, same year. Segments sum to P&L revenue (checked at build)."/>
      </section>
      </Chapter>

      <Chapter id="ch-margins" title="How margins build">
      <section className="pd-panel" aria-labelledby="pd-margin-h">
        <h3 id="pd-margin-h">Gross margin rises from {pct(gp[0] / rev[0])} to {pct(gp[last] / rev[last])}; net margin turns positive in {fy(d.periods[firstProfit])} and reaches {pct(ni[last] / rev[last])}.</h3>
        <Lines d={d} label="Gross, EBITDA and net margin by year, per cent of revenue. The same figures follow from the P&L table below." series={[
          {name: 'Gross margin', values: gp.map((v, i) => v / rev[i]), slot: 1},
          {name: 'EBITDA margin', values: ebitda.map((v, i) => v / rev[i]), slot: 2},
          {name: 'Net margin', values: ni.map((v, i) => v / rev[i]), slot: 3},
        ]}/>
        <Source files={['pl.csv']} note="Gross, EBITDA and net margin = gross profit, EBITDA and net income ÷ revenue, same year."/>
      </section>
      </Chapter>

      <Chapter id="ch-cash" title="Where cash gets tight">
      <section className="pd-panel" aria-labelledby="pd-cash-h">
        <h3 id="pd-cash-h">Cash falls from {cr(open0)} to {cr(close[trough])} by the end of {fy(d.periods[trough])}, with {cr(-d.series.capex.slice(0, trough + 1).reduce((a, v) => a + v, 0), 0)} of {d.capexLabel} in {F0}–{fy(d.periods[trough])}, then rebuilds to {cr(close[last])} by {FL}.</h3>
        <CashBars d={d}/>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Cash flow and balance, ₹ Cr</caption>
          <thead><tr><th scope="col">₹{NB}Cr</th>{d.periods.map(p => <th scope="col" key={p}>{fy(p)}</th>)}</tr></thead>
          <tbody>{d.cashRows.map(r => <tr key={r.label} className={r.strong ? 'pd-strong' : undefined}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i}>{num(v)}</td>)}</tr>)}</tbody>
        </table></div>
        <Source files={['cash.csv']} note={'Closing cash = opening cash + net cash flow. ' + d.cashNote}/>
      </section>
      </Chapter>

      <Chapter id="ch-raise" title="What the raise buys">
      <section className="pd-panel" aria-labelledby="pd-funds-h">
        <h3 id="pd-funds-h">The plan raises {cr(sources.reduce((a, f) => a + f.value, 0), 0)}; the largest use takes {pct(uses[0].value / usesTotal, 0)} of it.</h3>
        <p className="pd-lede">{'Sources: ' + sources.map(f => `${f.label} (${cr(f.value, 0)})`).join(' and ') + '.'}</p>
        <div className="table-scroll"><table className="pd-table pd-funds">
          <caption className="sr-only">Use of funds, ₹ Cr</caption>
          <thead><tr><th scope="col">Use</th><th scope="col">₹{NB}Cr</th><th scope="col">Share</th></tr></thead>
          <tbody>
            {uses.map(f => <tr key={f.label}><th scope="row">{f.label}</th><td>{num(f.value)}</td><td><span className="pd-inbar pd-inbar-wide"><span className="pd-inbar-fill pd-s1" style={{width: `${f.value / useMax * 100}%`}}/></span>{pct(f.value / usesTotal)}</td></tr>)}
            <tr className="pd-total"><th scope="row">Total</th><td>{num(usesTotal)}</td><td>100.0{NB}%</td></tr>
          </tbody>
        </table></div>
        <Source files={['use-of-funds.csv']} note="Use-of-funds share = allocation ÷ total uses; uses equal sources within ₹0.02 Cr (checked at build)."/>
      </section>
      </Chapter>

      <Chapter id="ch-pl" title="The P&L line by line">
      <section className="pd-panel" aria-labelledby="pd-pl-h">
        <h3 id="pd-pl-h">The P&L, line by line, as the model states it.</h3>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Company P&L, ₹ Cr</caption>
          <thead><tr><th scope="col">₹{NB}Cr</th>{d.periods.map(p => <th scope="col" key={p}>{fy(p)}</th>)}</tr></thead>
          <tbody>{d.plRows.map(r => <tr key={r.label} className={r.strong ? 'pd-strong' : undefined}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i}>{num(v)}</td>)}</tr>)}</tbody>
        </table></div>
        <Source files={['pl.csv']} note="P&L sheet of the corrected model."/>
      </section>
      </Chapter>

      <Chapter id="ch-compare" title="How it compares with the Blueprint">
      <section className="pd-panel" aria-labelledby="pd-rec-h">
        <h3 id="pd-rec-h">This model and the plan on the Portfolio strategy page are different plans, and their revenue does not reconcile.</h3>
        <p className="pd-lede">{d.reconcileLede}</p>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Revenue plans compared, ₹ Cr</caption>
          <thead><tr><th scope="col">Year</th><th scope="col">Portfolio strategy page (silicon plan)</th><th scope="col">This model, total</th><th scope="col">This model, {d.reconcileSegment}</th></tr></thead>
          <tbody>{company.map(c => { const i = d.periods.findIndex(p => fy(p) === c.fy);
            return <tr key={c.fy}><th scope="row">{c.fy}</th><td>{c.plan.toLocaleString('en-IN')}</td><td>{i >= 0 ? num(rev[i]) : '–'}</td><td>{i >= 0 && recon ? num(recon.values[i]) : '–'}</td></tr>; })}</tbody>
        </table></div>
        <p className="pd-source">Portfolio strategy figures: the mature-node whitepaper, as published on <a className="pd-link" href={url('/company')}>the Portfolio strategy page</a>. Model figures: pl.csv and revenue-by-segment.csv.</p>
      </section>
      </Chapter>
    </div>
  );
}

export default PlanDashboard;
