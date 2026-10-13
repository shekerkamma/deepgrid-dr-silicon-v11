'use client';
/** Chart pieces shared by /portfolio and /portfolio/brief (styles: plan-dashboard.css pd-*, portfolio-dashboard.css sk-*).
 *
 *  Method (dataviz skill): series colours are the pd-s1..s4 slots, validated on the card surface #121b2d (all checks
 *  pass; amber/green sit in the 6–8 CVD band, so every chart that uses both labels its marks directly). Context series
 *  are grey (sk-muted), never a hue. Every mark has a hover/focus/tap tooltip; every chart sits beside a table or list
 *  of the same numbers. One axis per chart. */
import {useState} from 'react';

/** Tooltips wrap at a fixed width (at most 240px, never wider than the chart) and are clamped inside the chart, so
 *  a long line can neither push one off a phone screen nor out of its chart. Above the mark, or below it near the top. */
export type Tip = {x: number; y: number; w: number; lines: string[]} | null;
export function TipBox({tip}: {tip: Tip}) {
  if (!tip) return null;
  const width = Math.min(240, tip.w - 8), left = Math.max(4, Math.min(tip.x - width / 2, tip.w - width - 4));
  return <div className="pd-tip sk-tip" role="status" style={{left, top: tip.y, width, transform: tip.y < 96 ? 'translate(0, 12px)' : 'translate(0, calc(-100% - 10px))'}}>
    {tip.lines.map((l, i) => <span key={i} className={i === 0 ? 'pd-tip-head' : undefined}>{l}</span>)}</div>;
}
/** Tooltip for an HTML mark, positioned in its figure's plot box. */
export const tipAt = (e: React.SyntheticEvent<HTMLElement | SVGElement>, lines: string[]): Tip => {
  const plot = (e.currentTarget as Element).closest('.pd-plot') as HTMLElement, p = plot.getBoundingClientRect(), m = (e.currentTarget as Element).getBoundingClientRect();
  return {x: m.left - p.left + m.width / 2, y: m.top - p.top, w: p.width, lines};
};

const fill = (slot: number) => (slot ? 'pd-s' + slot : 'sk-muted');

/** Horizontal bars in HTML, so labels stay readable at any width. A row is one or two bars (e.g. plan line and FY31),
 *  one low–high range, or one stacked bar of parts (part-to-whole). An optional reference line marks one value. */
export type BarRow = {key: string; label: string; bars?: {value: number; slot: number}[]; range?: [number, number]; slot?: number; dot?: number;
  stack?: {value: number; slot: number; name: string}[]; end: string; tip: string[]};
export function HBars({rows, max, legend, label, refLine}: {rows: BarRow[]; max: number; legend?: {name: string; slot: number}[]; label: string;
  refLine?: {value: number; label: string}}) {
  const [tip, setTip] = useState<Tip>(null);
  const w = (v: number) => `${Math.max(0, v / max * 100)}%`;
  return (
    <figure className="pd-figure" aria-label={label}>
      {legend && <ul className="pd-legend" aria-label="Bars">{legend.map(l => <li key={l.name}><span className={'pd-swatch ' + fill(l.slot)} aria-hidden="true"/>{l.name}</li>)}</ul>}
      <div className="pd-plot sk-bars" onMouseLeave={() => setTip(null)}>
        {rows.map(r => {
          const show = (lines: string[]) => (e: React.SyntheticEvent<HTMLElement>) => setTip(tipAt(e, lines));
          return <div className="sk-row" key={r.key}>
            <span className="sk-label">{r.label}</span>
            <span className="sk-track">
              {refLine && <span className="sk-ref" style={{left: w(refLine.value)}} aria-hidden="true"/>}
              {r.bars && r.bars.map((b, i) => <span key={i} className={'sk-bar ' + fill(b.slot) + (r.bars!.length > 1 ? ' sk-thin' : '')} style={{width: w(b.value)}}
                tabIndex={i === 0 ? 0 : -1} role="img" aria-label={r.tip.join('. ')} onMouseEnter={show(r.tip)} onMouseMove={show(r.tip)} onFocus={show(r.tip)} onClick={show(r.tip)}/>)}
              {r.range && <span className={'sk-bar sk-range ' + fill(r.slot ?? 1)} style={{marginLeft: w(r.range[0]), width: w(r.range[1] - r.range[0])}}
                tabIndex={0} role="img" aria-label={r.tip.join('. ')} onMouseEnter={show(r.tip)} onMouseMove={show(r.tip)} onFocus={show(r.tip)} onClick={show(r.tip)}/>}
              {r.dot != null && <span className={'uc-range-dot ' + fill(r.slot ?? 1)} style={{left:w(r.dot)}} aria-hidden="true"/>}
              {r.stack && <span className="sk-stack">{r.stack.map((s, i) => <span key={i} className={'sk-bar sk-seg ' + fill(s.slot)} style={{width: w(s.value)}}
                tabIndex={i === 0 ? 0 : -1} onMouseEnter={show([r.label, `${s.name}: ${s.value}`, ...r.tip])} onMouseMove={show([r.label, `${s.name}: ${s.value}`, ...r.tip])}
                onFocus={show([r.label, `${s.name}: ${s.value}`, ...r.tip])} onClick={show([r.label, `${s.name}: ${s.value}`, ...r.tip])}>{s.value / max >= 0.3 && <span className="sk-seg-label">{s.name}</span>}</span>)}</span>}
            </span>
            <span className="sk-end">{r.end}</span>
          </div>;
        })}
        {refLine && <p className="sk-ref-note"><span className="sk-ref-key" aria-hidden="true"/>{refLine.label}</p>}
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

/** Grouped columns over a few periods, one axis. Series in fixed slot order; slot 0 is grey context. Values above
 *  each column are direct labels, so identity is never colour alone. */
export function GroupedColumns({periods, series, label, unit}: {periods: string[]; series: {name: string; slot: number; values: number[]}[]; label: string; unit: (v: number) => string}) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 720, H = 300, L = 56, R = 12, T = 30, B = 32;
  const maxV = Math.max(...series.flatMap(s => s.values));
  const step = maxV > 800 ? 250 : maxV > 400 ? 200 : 100;
  const max = Math.ceil(maxV / step) * step, ticks = Array.from({length: max / step + 1}, (_, i) => i * step);
  const band = (W - L - R) / periods.length, gap = 2, bw = Math.min(56, (band * 0.78 - gap * (series.length - 1)) / series.length);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label={label}>
      <ul className="pd-legend" aria-label="Series">{series.map(s => <li key={s.name}><span className={'pd-swatch ' + fill(s.slot)} aria-hidden="true"/>{s.name}</li>)}</ul>
      <div className="pd-plot" onMouseLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true">
          {ticks.map(t => <g key={t}><line className="pd-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t.toLocaleString('en-IN')}</text></g>)}
          {periods.map((p, pi) => {
            const x0 = L + band * pi + (band - (bw * series.length + gap * (series.length - 1))) / 2;
            return <g key={p}>
              {series.map((s, si) => {
                const v = s.values[pi], x = x0 + si * (bw + gap);
                const show = (e: React.SyntheticEvent<SVGElement>) => { const b = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
                  setTip({x: (x + bw / 2) / W * b.width, y: y(v) / H * b.height, w: b.width, lines: [`${s.name} · ${p}`, unit(v)]}); };
                return <g key={s.name}>
                  <rect className={'sk-col ' + fill(s.slot)} x={x} y={y(v)} width={bw} height={Math.max(1, y(0) - y(v))} rx={3} onMouseEnter={show} onMouseMove={show} onClick={show}/>
                  <text className="pd-value" x={x + bw / 2} y={y(v) - 6} textAnchor="middle">{v >= 10 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(1)}</text>
                </g>;
              })}
              <text className="pd-axis" x={L + band * pi + band / 2} y={H - 10} textAnchor="middle">{p}</text>
            </g>;
          })}
        </svg>
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

/** ai-analyst storytelling (agents/story-architect.md): the page opens on "What the data says", three or four
 *  findings each led by its number, then one sentence and the source with the kind of number (plan target,
 *  estimate, schedule). Every number here is re-derived from the raw tables by scripts/analyst/validate_findings.py. */
export type Insight = {value: string; finding: string; text: string; source: string};
export function Insights({items, id = 'what-the-data-says'}: {items: Insight[]; id?: string}) {
  return (
    <section className="dg-insights" aria-labelledby={id}>
      <h2 id={id} className="dg-ins-h">What the data says</h2>
      <ul className="dg-ins-grid">{items.map(i => <li className="dg-ins" key={i.finding}>
        <strong className="dg-ins-v">{i.value}</strong>
        <span className="dg-ins-f">{i.finding}</span>
        <p className="dg-ins-t">{i.text}</p>
        <span className="dg-ins-src">{i.source}</span>
      </li>)}</ul>
    </section>
  );
}

/** A chapter: one reader question as its heading; the panels inside answer it, each titled with its finding. */
export function Chapter({id, title, children}: {id: string; title: string; children: React.ReactNode}) {
  return <section className="dg-chapter" aria-labelledby={id}><h2 id={id} className="dg-ch-h">{title}</h2>{children}</section>;
}
