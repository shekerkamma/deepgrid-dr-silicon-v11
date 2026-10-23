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
import {useEffect, useState} from 'react';
import raw from './plan-data.json';
import {revenueBuild} from './company-content';
import {asset, url} from './routes';
import {Insights, Chapter, Walk, HBars, useWidth, type WalkRow} from './dash-charts';

/** Generic by design: every plan-specific label arrives in the data (scripts/build-plan-data.mjs), because this
 *  file's code ships in every build, public included. */
type Row = {label: string; strong: boolean; values: number[]};
type Item = {label: string; value: number};
type SourceLink = {label: string; href: string; download?: boolean};
type DecisionReport = {
  tabs: {id: string; label: string}[];
  labels: {
    sourcePrefix: string; sourcesPrefix: string; deadlinePrefix: string;
    forLabel: string; againstLabel: string; missingLabel: string;
    tieTitle: string; tieSub: string; tieCaption: string; tieHead: string[];
    ladderTitle: string; ladderSub: string; ladderCaption: string; ladderHead: string[];
    auditTitle: string; auditSub: string; auditCaption: string; auditHead: string[];
  };
  flag: string;
  inputsStatus?: string;
  heading: string;
  subhead: string;
  kpis: {label: string; value: string; context: string; def: string; sourceAttr: string; sourceHref: string; sourceLabel: string}[];
  decisions: {
    id: string; title: string; badge: string; lead: string;
    forArg: string; againstArg: string; deadline: string; inputRequired: string;
    sourceAttr: string; sourceLinks: SourceLink[];
  }[];
  tieOut: {item: string; blueprint: string; modelFunds: string; modelCash: string; verdict: string; sourceAttr: string; sourceHref: string; sourceLabel: string}[];
  ladder: {
    sku: string; name: string; process: string; shuttle: string;
    planCr: string; rampFy31Cr: string; devRangeCr: string;
    spec: string; rtl: string; analog: string; layout: string; drcLvs: string; slotBooked: string; gdsSubmitted: string;
    sourceAttr: string; sourceHref: string; sourceLabel: string;
  }[];
  sections?: {id: string; title: string; heading: string; sub: string; caption: string; head: string[]; rows: {cells: string[]; sourceAttr: string; sourceHref: string; sourceLabel: string}[]}[];
  redTeam: {rank: number; role: string; finding: string; status: string; sourceAttr: string; sourceHref: string; sourceLabel: string}[];
};
type PlanData = {available: true; decisionReport?: DecisionReport | null; model: string; periods: string[];
  series: {revenue: number[]; grossProfit: number[]; ebitda: number[]; netIncome: number[]; openingCash: number[]; closingCash: number[]; netCashFlow: number[]; capex: number[]};
  capexLabel: string; segments: {name: string; values: number[]}[]; reconcileSegment: string; reconcileLede: string;
  plRows: Row[]; cashRows: Row[]; cashNote: string; plNote: string; sources: Item[]; uses: Item[]; checks: string[];
  plWalk: Walked[]; cashWalk: Walked[]; opexParts: {label: string; values: number[]; group?: string}[]};
type Walked = {label: string; total: boolean; values: number[]; group?: string};
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
  const [tip, setTip] = useState<Tip>(null), [plot, W] = useWidth();
  const H = 340, L = 56, R = W < 560 ? 12 : 120, T = 28, B = 32;
  const segs = d.segments, totals = d.periods.map((_, i) => segs.reduce((a, s) => a + s.values[i], 0));
  const max = Math.ceil(Math.max(...totals) / 250) * 250, ticks = Array.from({length: max / 250 + 1}, (_, i) => i * 250);
  const band = (W - L - R) / d.periods.length, bw = band * 0.56, y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label="Revenue by segment by year, ₹ Cr, stacked bars. The same figures are in the table below.">
      <ul className="pd-legend" aria-label="Segments">{segs.map((s, i) => <li key={s.name}><span className={'pd-swatch pd-s' + (i + 1)} aria-hidden="true"/>{s.name}</li>)}</ul>
      <div className="pd-plot" ref={plot} onMouseLeave={() => setTip(null)}>
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
              {band >= 44 && <text className="pd-value" x={x + bw / 2} y={y(totals[pi]) - 8} textAnchor="middle">{totals[pi] < 10 ? totals[pi].toFixed(1) : Math.round(totals[pi]).toLocaleString('en-IN')}</text>}
              {/* Direct labels on the last bar, only for segments tall enough to carry one; the legend names the rest. */}
              {pi === d.periods.length - 1 && R > 12 && (() => { let a2 = 0; return segs.map(s => { const v = s.values[pi], top = y(a2 + v), bot = y(a2); a2 += v;
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
  const [hover, setHover] = useState<number | null>(null), [plot, W] = useWidth(W0), pw = W;
  const H = 300, L = 56, R = 16, T = 20, B = 32;
  const all = series.flatMap(s => s.values);
  const lo = Math.min(-0.4, Math.floor(Math.min(...all) * 5) / 5), hi = 1;
  const ticks: number[] = []; for (let t = lo; t <= hi + 1e-9; t += 0.2) ticks.push(+t.toFixed(1));
  const step = (W - L - R) / (d.periods.length - 1), x = (i: number) => L + step * i, y = (v: number) => T + (H - T - B) * (hi - v) / (hi - lo);
  return (
    <figure className="pd-figure" aria-label={label}>
      <ul className="pd-legend" aria-label="Lines">{series.map(s => <li key={s.name}><span className={'pd-swatch pd-s' + s.slot} aria-hidden="true"/>{s.name}</li>)}</ul>
      <div className="pd-plot" ref={plot} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true"
          onMouseMove={e => { const b = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(d.periods.length - 1, Math.round(((e.clientX - b.left) / b.width * W - L) / step)))); }}>
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
  const [tip, setTip] = useState<Tip>(null), [plot, W] = useWidth();
  const close = d.series.closingCash, open0 = d.series.openingCash[0];
  const H = 300, L = 56, R = 12, T = 28, B = 32;
  const max = Math.ceil(Math.max(open0, ...close) / 50) * 50, ticks = Array.from({length: max / 50 + 1}, (_, i) => i * 50).filter((t, i, a) => a.length <= 8 || i % 2 === 0);
  const trough = close.indexOf(Math.min(...close));
  const band = (W - L - R) / d.periods.length, bw = band * 0.5, y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label="Closing cash by year, ₹ Cr, with the FY27 opening balance as a reference line. The same figures are in the cash table below.">
      <ul className="pd-legend" aria-label="Marks"><li><span className="pd-swatch pd-s1" aria-hidden="true"/>Closing cash</li><li><span className="pd-swatch pd-ref" aria-hidden="true"/>Opening cash, FY27 ({cr(open0)})</li></ul>
      <div className="pd-plot" ref={plot} onMouseLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true">
          {ticks.map(t => <g key={t}><line className="pd-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
          <line className="pd-refline" x1={L} x2={W - R} y1={y(open0)} y2={y(open0)}/>
          {d.periods.map((p, i) => {
            const x = L + band * i + (band - bw) / 2, v = close[i];
            const show = (e: React.MouseEvent) => { const b = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
              setTip({x: (x + bw / 2) / W * b.width, y: y(v) / H * b.height, frac: (x + bw / 2) / W, w: b.width, lines: [`${fy(p)} closing cash`, cr(v), `net cash flow ${cr(d.series.netCashFlow[i])}`]}); };
            return <g key={p}>
              <rect className="pd-s1" x={x} y={y(v)} width={bw} height={y(0) - y(v)} onMouseEnter={show} onMouseMove={show}/>
              {band >= 44 && <text className="pd-value" x={x + bw / 2} y={y(v) - 8} textAnchor="middle">{v.toFixed(1)}{i === trough && band >= 96 ? ' (lowest)' : ''}</text>}
              <text className="pd-axis" x={x + bw / 2} y={H - 10} textAnchor="middle">{fy(p)}</text>
            </g>;
          })}
        </svg>
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

const signed = (v: number, s: boolean) => (s && v > 0 ? '+' : '') + cr(v);
/** Sentence case for a row label inside a heading, leaving acronyms ("R&D, run rate") alone. */
const lower = (t: string) => /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
/** The largest of a set of parts, joining the parts of one group (R&D is two rows) before comparing. */
function largest(parts: {label: string; value: number; group?: string}[]) {
  const m = new Map<string, number>();
  for (const p of parts) m.set(p.group ?? p.label, (m.get(p.group ?? p.label) ?? 0) + p.value);
  return [...m].map(([label, value]) => ({label, value})).reduce((a, b) => (b.value > a.value ? b : a));
}
const ROUNDED = 'Subtotals equal the running sum at full precision (checked at build); printed figures are rounded to ₹0.01 Cr.';


/** Money flow (BenAI dashboard rules, adopted 2026-10-17): one year at a time, revenue walked down to net income
 *  beside opening cash walked to closing cash. Opens on the cash-low year, the year the raise has to carry, unless
 *  a year is asked for (Ask DeepGrid passes one; /plan?year=FY30 does too). The year buttons filter these two walks;
 *  they are not tabs, and every other chapter shows all years. */
function FlowWalks({d, year, fromUrl}: {d: PlanData; year?: string; fromUrl?: boolean}) {
  const close = d.series.closingCash, pick = (y?: string | null) => { const k = d.periods.findIndex(p => fy(p) === y); return k >= 0 ? k : close.indexOf(Math.min(...close)); };
  const [i, setI] = useState(() => pick(year));
  // after hydration: the prerendered page has no query string, so the URL's year is read once mounted
  useEffect(() => { if (fromUrl) setI(pick(new URLSearchParams(location.search).get('year')?.toUpperCase())); }, [fromUrl]);
  const at = (w: Walked[]): WalkRow[] => w.map(r => ({label: r.label, total: r.total, value: r.values[i]}));
  const pl = at(d.plWalk), cash = at(d.cashWalk), F = fy(d.periods[i]);
  const big = largest(d.plWalk.filter(r => !r.total).map(r => ({label: r.label, group: r.group, value: -r.values[i]})));
  const outs = cash.filter(r => !r.total && r.value < 0), out = outs.length ? outs.reduce((a, r) => (r.value < a.value ? r : a)) : null;
  const rev = pl[0].value, ni = pl[pl.length - 1].value, op = cash[0].value, cl = cash[cash.length - 1].value;
  return <>
    <div className="pd-years" role="group" aria-label="Year shown in the two walk-downs">
      {d.periods.map((p, k) => <button key={p} type="button" className="pd-year" aria-pressed={k === i} onClick={() => setI(k)}>{fy(p)}</button>)}
    </div>
    <div className="pd-flow">
      <section className="pd-panel" aria-labelledby="pd-plw-h">
        <h3 id="pd-plw-h">In {F}, {cr(rev)} of revenue {ni >= 0 ? `leaves ${cr(ni)} of net income` : `ends in a net loss of ${cr(-ni)}`}; {lower(big.label)} is the largest cost at {cr(big.value)}.</h3>
        <Walk rows={pl} fmt={signed} label={`Revenue to net income, ${F}, ₹ Cr: each cost taken from revenue in turn. The same figures are in the P&L table below.`}/>
        <Source files={['pl.csv']} note={ROUNDED + ' ' + d.plNote}/>
      </section>
      <section className="pd-panel" aria-labelledby="pd-cashw-h">
        <h3 id="pd-cashw-h">Cash {cl < op ? 'falls' : 'rises'} from {cr(op)} to {cr(cl)} in {F}{out ? `; ${lower(out.label)} is the largest outflow at ${cr(-out.value)}` : ''}.</h3>
        <Walk rows={cash} fmt={signed} label={`Opening to closing cash, ${F}, ₹ Cr. The same figures are in the cash table below.`}/>
        <Source files={['cash.csv']} note={ROUNDED + ' ' + d.cashNote}/>
      </section>
    </div>
  </>;
}

/** Everything the panels compute from the plan, once. */
function derive(d: PlanData) {
  const n = d.periods.length, last = n - 1, F0 = fy(d.periods[0]), FL = fy(d.periods[last]);
  const {revenue: rev, grossProfit: gp, ebitda, netIncome: ni} = d.series;
  const close = d.series.closingCash, segs = d.segments, segTotal = (i: number) => segs.reduce((a, s) => a + s.values[i], 0);
  const uses = [...d.uses].sort((a, b) => b.value - a.value), opex = (i: number) => d.opexParts.reduce((a, o) => a + o.values[i], 0);
  return {d, last, F0, FL, rev, gp, ebitda, ni, firstProfit: ni.findIndex(v => v > 0), close, trough: close.indexOf(Math.min(...close)),
    open0: d.series.openingCash[0], segs, segTotal, segMax: Math.max(...segs.map(s => s.values[last])), sources: d.sources, uses,
    recon: segs.find(s => s.name === d.reconcileSegment), usesTotal: uses.reduce((a, f) => a + f.value, 0), useMax: Math.max(...uses.map(f => f.value)),
    opex, opTop: largest(d.opexParts.map(o => ({label: o.label, group: o.group, value: o.values[last]}))),
    company: revenueBuild.filter(([k]) => /^FY\d\d$/.test(k)).map(([k, v]) => ({fy: k, plan: Number(v.replace(/[^\d.]/g, ''))}))};
}
type V = ReturnType<typeof derive>;

function PlTable({v: {d, rev, ni, F0, FL, last, firstProfit}}: {v: V}) {
  return (
    <section className="pd-panel" aria-labelledby="pd-pl-h">
      <h3 id="pd-pl-h">Revenue grows from {cr(rev[0])} in {F0} to {cr(rev[last])} in {FL}; net income turns positive in {fy(d.periods[firstProfit])} and reaches {cr(ni[last])}.</h3>
      <div className="table-scroll"><table className="pd-table">
        <caption className="sr-only">Company P&L, ₹ Cr</caption>
        <thead><tr><th scope="col">₹{NB}Cr</th>{d.periods.map(p => <th scope="col" key={p}>{fy(p)}</th>)}</tr></thead>
        <tbody>{d.plRows.map(r => <tr key={r.label} className={r.strong ? 'pd-strong' : undefined}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i}>{num(v)}</td>)}</tr>)}</tbody>
      </table></div>
      <Source files={['pl.csv']} note="P&L sheet of the corrected model."/>
    </section>
  );
}

function SegPanel({v: {d, segs, segTotal, segMax, last, FL}}: {v: V}) {
  return (
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
  );
}

function MarginPanel({v: {d, gp, ebitda, ni, rev, last, firstProfit}}: {v: V}) {
  return (
    <section className="pd-panel" aria-labelledby="pd-margin-h">
      <h3 id="pd-margin-h">Gross margin rises from {pct(gp[0] / rev[0])} to {pct(gp[last] / rev[last])}; net margin turns positive in {fy(d.periods[firstProfit])} and reaches {pct(ni[last] / rev[last])}.</h3>
      <Lines d={d} label="Gross, EBITDA and net margin by year, per cent of revenue. The same figures follow from the P&L table below." series={[
        {name: 'Gross margin', values: gp.map((v, i) => v / rev[i]), slot: 1},
        {name: 'EBITDA margin', values: ebitda.map((v, i) => v / rev[i]), slot: 2},
        {name: 'Net margin', values: ni.map((v, i) => v / rev[i]), slot: 3},
      ]}/>
      <Source files={['pl.csv']} note="Gross, EBITDA and net margin = gross profit, EBITDA and net income ÷ revenue, same year."/>
    </section>
  );
}

function OpexPanel({v: {d, opex, opTop, F0, FL, last}}: {v: V}) {
  return (
    <section className="pd-panel" aria-labelledby="pd-opex-h">
      <h3 id="pd-opex-h">Operating expense grows from {cr(opex(0))} in {F0} to {cr(opex(last))} in {FL}; {lower(opTop.label)} is {pct(opTop.value / opex(last), 0)} of it.</h3>
      <HBars label="Operating expense mix by year: each line's share of that year's operating expense, with the total at the end. The same figures are in the P&L table." max={100}
        legend={d.opexParts.map((o, k) => ({name: o.label, slot: k + 1}))}
        rows={d.periods.map((p, i) => ({key: p, label: fy(p), end: cr(opex(i)), tip: [`${fy(p)} operating expense: ${cr(opex(i))}`],
          stack: d.opexParts.map((o, k) => ({value: o.values[i] / opex(i) * 100, slot: k + 1, name: o.label, text: `${cr(o.values[i])}, ${pct(o.values[i] / opex(i))}`}))}))}/>
      <Source files={['pl.csv']} note="Operating expense = run-rate R&D + tape-out programme + sales and marketing + G&A (checked at build)."/>
    </section>
  );
}

function CashPanel({v: {d, open0, close, trough, F0, last, FL}}: {v: V}) {
  return (
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
  );
}

function FundsPanel({v: {sources, uses, usesTotal, useMax}}: {v: V}) {
  return (
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
  );
}

function ReconPanel({v: {d, company, rev, recon}}: {v: V}) {
  return (
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
  );
}

/** The plan years Ask may pass to a panel; none in a build without the plan. */
export const planYears = data.available ? data.periods.map(fy) : [];
export const planAvailable = data.available;

/** One panel, for Ask DeepGrid: the same component and data as the dashboard. Null in a build without the plan. */
export function PlanPanel({id, year}: {id: string; year?: string}) {
  if (!data.available) return null;
  const v = derive(data);
  switch (id) {
    case 'plan-flow': return <FlowWalks d={data} year={year}/>;
    case 'plan-segments': return <SegPanel v={v}/>;
    case 'plan-margins': return <MarginPanel v={v}/>;
    case 'plan-opex': return <OpexPanel v={v}/>;
    case 'plan-cash': return <CashPanel v={v}/>;
    case 'plan-funds': return <FundsPanel v={v}/>;
    case 'plan-reconcile': return <ReconPanel v={v}/>;
    default: return null;
  }
}

function DecisionReportView({dr}: {dr: DecisionReport}) {
  const L = dr.labels;
  return (
    <div className="dr-root" data-decision-report="true">
      <header className="pd-head">
        {dr.inputsStatus ? <p className="pd-flag" data-inputs-status="true">{dr.inputsStatus}</p> : null}
        <p className="pd-flag">{dr.flag}</p>
        <h2 className="dg-verdict">{dr.heading}</h2>
        <p className="dg-lede">{dr.subhead}</p>
      </header>

      <div className="dr-kpis">
        {dr.kpis.map(k => (
          <div className="dr-kpi" key={k.label} data-source={k.sourceAttr}>
            <span className="dr-kpi-label">{k.label}</span>
            <strong className="dr-kpi-val">{k.value}</strong>
            <p className="dr-kpi-ctx">{k.context}</p>
            <p className="pd-def">{k.def}</p>
            <p className="pd-source">{L.sourcePrefix} <a className="pd-link" href={asset(k.sourceHref)} download>{k.sourceLabel}</a></p>
          </div>
        ))}
      </div>

      <ol className="dr-cards">
        {dr.decisions.map(dec => (
          <li className="dr-card" key={dec.id} data-source={dec.sourceAttr}>
            <div className="dr-card-top">
              <span className="dr-badge">{dec.badge}</span>
              <span className="pd-source">{L.deadlinePrefix} {dec.deadline}</span>
            </div>
            <h3 className="dr-card-title">{dec.title}</h3>
            <p className="dr-card-lead">{dec.lead}</p>
            <dl className="dr-args">
              <div><dt>{L.forLabel}</dt><dd>{dec.forArg}</dd></div>
              <div><dt>{L.againstLabel}</dt><dd>{dec.againstArg}</dd></div>
              <div><dt>{L.missingLabel}</dt><dd>{dec.inputRequired}</dd></div>
            </dl>
            <p className="pd-source">
              {L.sourcesPrefix} {dec.sourceLinks.map((s, i) => (
                <span key={s.href}>{i > 0 && ', '}<a className="pd-link" href={asset(s.href)} download={s.download}>{s.label}</a></span>
              ))}
            </p>
          </li>
        ))}
      </ol>

      <Chapter id="ch-dr-tieout" title={L.tieTitle}>
        <section className="pd-panel" aria-labelledby="dr-tie-h" data-source={dr.tieOut[0]?.sourceAttr}>
          <h3 id="dr-tie-h">{L.tieSub}</h3>
          <div className="table-scroll">
            <table className="pd-table">
              <caption className="sr-only">{L.tieCaption}</caption>
              <thead>
                <tr>{L.tieHead.map(h => <th scope="col" key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dr.tieOut.map(r => (
                  <tr key={r.item} data-source={r.sourceAttr}>
                    <th scope="row">{r.item}</th>
                    <td>{r.blueprint}</td>
                    <td>{r.modelFunds}</td>
                    <td>{r.modelCash}</td>
                    <td>{r.verdict}</td>
                    <td><a className="pd-link" href={asset(r.sourceHref)} download>{r.sourceLabel}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Chapter>

      <Chapter id="ch-dr-ladder" title={L.ladderTitle}>
        <section className="pd-panel" aria-labelledby="dr-lad-h" data-source={dr.ladder[0]?.sourceAttr}>
          <h3 id="dr-lad-h">{L.ladderSub}</h3>
          <div className="table-scroll">
            <table className="pd-table dr-ladder">
              <caption className="sr-only">{L.ladderCaption}</caption>
              <thead>
                <tr>{L.ladderHead.map(h => <th scope="col" key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dr.ladder.map(s => (
                  <tr key={s.sku} data-source={s.sourceAttr}>
                    <th scope="row">{s.sku}</th>
                    <td>{s.name}</td>
                    <td>{s.shuttle}</td>
                    <td>{s.planCr}</td>
                    <td>{s.rampFy31Cr}</td>
                    <td>{s.devRangeCr}</td>
                    <td>{s.spec}</td>
                    <td>{s.rtl}</td>
                    <td>{s.analog}</td>
                    <td>{s.layout}</td>
                    <td>{s.drcLvs}</td>
                    <td>{s.slotBooked}</td>
                    <td>{s.gdsSubmitted}</td>
                    <td><a className="pd-link" href={asset(s.sourceHref)} download>{s.sourceLabel}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Chapter>

      {(dr.sections ?? []).map(sec => (
        <Chapter id={sec.id} title={sec.title} key={sec.id}>
          <section className="pd-panel" aria-labelledby={sec.id + '-h'} data-source={sec.rows[0]?.sourceAttr}>
            <h3 id={sec.id + '-h'}>{sec.heading}</h3>
            <p className="pd-lede">{sec.sub}</p>
            <div className="table-scroll">
              <table className="pd-table">
                <caption className="sr-only">{sec.caption}</caption>
                <thead>
                  <tr>{sec.head.map(h => <th scope="col" key={h}>{h}</th>)}<th scope="col">{L.sourcePrefix}</th></tr>
                </thead>
                <tbody>
                  {sec.rows.map(r => (
                    <tr key={r.cells[0]} data-source={r.sourceAttr}>
                      <th scope="row">{r.cells[0]}</th>
                      {r.cells.slice(1).map((c, i) => <td key={i}>{c}</td>)}
                      <td><a className="pd-link" href={asset(r.sourceHref)} download>{r.sourceLabel}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </Chapter>
      ))}

      <Chapter id="ch-dr-audit" title={L.auditTitle}>
        <section className="pd-panel" aria-labelledby="dr-aud-h" data-source={dr.redTeam[0]?.sourceAttr}>
          <h3 id="dr-aud-h">{L.auditSub}</h3>
          <div className="table-scroll">
            <table className="pd-table">
              <caption className="sr-only">{L.auditCaption}</caption>
              <thead>
                <tr>{L.auditHead.map(h => <th scope="col" key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dr.redTeam.map(item => (
                  <tr key={item.rank} data-source={item.sourceAttr}>
                    <th scope="row">{item.rank}</th>
                    <td>{item.role}</td>
                    <td>{item.finding}</td>
                    <td>{item.status}</td>
                    <td><a className="pd-link" href={asset(item.sourceHref)} download>{item.sourceLabel}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Chapter>
    </div>
  );
}

export function PlanDashboard() {
  const dr = data.available ? data.decisionReport ?? null : null;
  const [tab, setTab] = useState<'model' | 'decisions'>('model');
  useEffect(() => {
    if (!dr) return;
    const read = () => {
      const v = new URLSearchParams(location.search).get('view');
      setTab(v === 'decisions' ? 'decisions' : 'model');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [dr]);
  if (!data.available) return (
    <section className="pd-unavailable">
      <h2>Discuss the business plan and funding requirements.</h2>
      <p>Plan figures are not built here. Ask the DeepGrid team for the business plan, or for the data room.</p>
      <a className="pd-link" href={url('/contact')}>Contact the team</a>
    </section>
  );
  const selectTab = (id: 'model' | 'decisions') => {
    setTab(id);
    const target = new URL(location.href);
    if (id === 'decisions') target.searchParams.set('view', 'decisions');
    else target.searchParams.delete('view');
    history.pushState(null, '', target);
  };
  const v = derive(data), {d, last, F0, FL, rev, gp, ebitda, ni, firstProfit, close, trough, open0, segs, segTotal, recon} = v;
  return (
    <div className="pd-root">
      {dr && (
        <div className="bf-tabs" role="tablist" aria-label="Plan views">
          {dr.tabs.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              id={'pd-tab-' + x.id}
              aria-selected={tab === x.id}
              tabIndex={tab === x.id ? 0 : -1}
              className="bf-tab"
              onClick={() => selectTab(x.id as 'model' | 'decisions')}
              onKeyDown={e => {
                const next = e.key === 'ArrowRight' ? (i + 1) % dr.tabs.length : e.key === 'ArrowLeft' ? (i + dr.tabs.length - 1) % dr.tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? dr.tabs.length - 1 : -1;
                if (next < 0) return;
                e.preventDefault();
                const nextId = dr.tabs[next].id as 'model' | 'decisions';
                selectTab(nextId);
                document.getElementById('pd-tab-' + nextId)?.focus();
              }}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}
      {dr && tab === 'decisions' ? (
        <DecisionReportView dr={dr}/>
      ) : (
      <>
      <header className="pd-head">
        <h2 className="dg-verdict">The financial plan targets profitability in {fy(d.periods[firstProfit])}, but cash bottoms at {cr(close[trough])} in {fy(d.periods[trough])}, and {pct(segs[0].values[last] / segTotal(last), 0)} of {FL} revenue is {segs[0].name}.</h2>
        <p className="dg-lede">Revenue grows from {cr(rev[0])} in {F0} to {cr(rev[last])} in {FL}. {segs[0].name} carries most of it{recon && recon !== segs[0] ? `; ${recon.name} is ${pct(recon.values[last] / segTotal(last), 0)} of ${FL} revenue` : ''}. The raise has to carry the company through the {fy(d.periods[trough])} cash low before revenue catches up.</p>
        <p className="pd-flag"><strong>Plan targets, not results.</strong> {d.model}, {F0}–{FL}, base scenario, ₹{NB}Cr. Nothing here is audited or contracted. {d.checks.length} accounting identities are re-checked on every build; they show the model adds up, not that its assumptions hold.</p>
      </header>

      <Insights title="Revenue, profit and cash findings" items={[
        {value: cr(rev[last], 0), finding: `Revenue in ${FL}`, text: `From ${cr(rev[0])} in ${F0} and ${cr(rev[Math.min(2, last)])} in ${fy(d.periods[Math.min(2, last)])}: most of the growth comes in the last three years.`, source: `${d.model} · plan target · units × price, summed over business lines`},
        {value: pct(segs[0].values[last] / segTotal(last), 0), finding: `${segs[0].name} is most of it`, text: `${segs[0].name} is ${cr(segs[0].values[last], 0)} of ${FL} revenue${recon && recon !== segs[0] ? `; ${recon.name} is ${cr(recon.values[last], 0)} (${pct(recon.values[last] / segTotal(last), 0)})` : ''}.`, source: `${d.model} · plan target · segment ÷ total revenue, same year`},
        {value: fy(d.periods[firstProfit]), finding: 'First profitable year', text: `Net income ${cr(ni[firstProfit])}; EBITDA ${cr(ebitda[firstProfit])}. Gross margin reaches ${pct(gp[last] / rev[last])} by ${FL}.`, source: `${d.model} · plan target · tax at 25 % after loss carry-forward`},
        {value: cr(close[trough]), finding: `Cash is tightest in ${fy(d.periods[trough])}`, text: `Lowest year-end cash, down from ${cr(open0)} at the start of ${F0}, before revenue catches up.`, source: `${d.model} · plan target · year-end balances only`},
      ]}/>

      <details className="pd-checks">
        <summary>The {d.checks.length} accounting identities checked on every build</summary>
        <ul>{d.checks.map(c => <li key={c}>{c}</li>)}</ul>
      </details>

      <Chapter id="ch-flow" title="Where revenue and cash go, by year">
        <FlowWalks d={d} fromUrl/>
        <PlTable v={v}/>
      </Chapter>
      <Chapter id="ch-sells" title="Revenue mix and business segments"><SegPanel v={v}/></Chapter>
      <Chapter id="ch-margins" title="Gross and net profitability targets, and operating expense"><MarginPanel v={v}/><OpexPanel v={v}/></Chapter>
      <Chapter id="ch-cash" title="Liquidity requirements and capital expenditure"><CashPanel v={v}/></Chapter>
      <Chapter id="ch-raise" title="Funding sources and capital allocation"><FundsPanel v={v}/></Chapter>
      <Chapter id="ch-compare" title="Reconcile company revenue with the chip portfolio plan"><ReconPanel v={v}/></Chapter>
      </>
      )}
    </div>
  );
}

export default PlanDashboard;
