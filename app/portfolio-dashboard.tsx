'use client';
/** SKU portfolio dashboard (/portfolio): public on every build.
 *
 *  Data: the team's eight public Google Sheets, read in the browser and checked by app/data/portfolio-facts.ts; until
 *  then, and whenever a sheet cannot be read or fails the checks, the copy bundled by scripts/build-portfolio-data.mjs
 *  (which also checks the Blueprint's own totals). The header says which one is shown. Ask DeepGrid answers from the
 *  same tables (services/ask/worker.ts).
 *
 *  Same method as /plan (plan-dashboard.css): a KPI row, then one panel per question whose heading is the finding,
 *  computed from the data so it cannot drift from it; every chart has a hover/tap tooltip and a table or list holding
 *  the same numbers; every panel links the CSV it is drawn from. The document-version and document-conflict tables are
 *  public (owner, 2026-10-13); figures of withheld claims are replaced before they reach the page.
 */
import {useEffect, useState} from 'react';
import raw from './portfolio-data.json';
import {asset, url} from './routes';
import {loadLiveTables, toPortfolio, sheetViewUrl, type PortfolioData, type Provenance, type Sku} from './data/portfolio-facts';

const built = raw as unknown as PortfolioData;

const NB = ' ';
const cr = (v: number, dp = 0) => `₹${v.toLocaleString('en-IN', {minimumFractionDigits: dp, maximumFractionDigits: dp})}${NB}Cr`;
const cr1 = (v: number) => cr(v, Number.isInteger(v) ? 0 : 1);
const usd = (v: number) => `$${v.toFixed(2)}`;
const pct = (v: number) => `${Math.round(v * 100)}${NB}%`;
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const say = (k: number) => words[k] ?? String(k);
const Say = (k: number) => say(k).charAt(0).toUpperCase() + say(k).slice(1);

/** Tooltips wrap at a fixed width (at most 240px, never wider than the chart) and are clamped inside the chart, so
 *  a long line (a chip name, what a tranche line delivers) can neither push one off a phone screen nor out of its
 *  chart. Above the mark, or below it when the mark is too near the top. */
type Tip = {x: number; y: number; w: number; lines: string[]} | null;
function TipBox({tip}: {tip: Tip}) {
  if (!tip) return null;
  const width = Math.min(240, tip.w - 8), left = Math.max(4, Math.min(tip.x - width / 2, tip.w - width - 4));
  return <div className="pd-tip sk-tip" role="status" style={{left, top: tip.y, width, transform: tip.y < 96 ? 'translate(0, 12px)' : 'translate(0, calc(-100% - 10px))'}}>
    {tip.lines.map((l, i) => <span key={i} className={i === 0 ? 'pd-tip-head' : undefined}>{l}</span>)}</div>;
}
/** Tooltip for an HTML mark, positioned in its figure's plot box. */
const tipAt = (e: React.SyntheticEvent<HTMLElement>, lines: string[]): Tip => {
  const plot = e.currentTarget.closest('.pd-plot') as HTMLElement, p = plot.getBoundingClientRect(), m = e.currentTarget.getBoundingClientRect();
  return {x: m.left - p.left + m.width / 2, y: m.top - p.top, w: p.width, lines};
};
function Source({files, note}: {files: string[]; note: string}) {
  return <p className="pd-source">{note} Source: {files.map((f, i) => <span key={f}>{i > 0 && ', '}<a className="pd-link" href={asset('/portfolio-data/' + f)} download>{f}</a></span>)}.</p>;
}

/** Horizontal bars in HTML, so labels stay readable at any width. A row is one or two bars (plan line and FY31),
 *  or one low–high range. */
type BarRow = {key: string; label: string; bars?: {value: number; slot: number}[]; range?: [number, number]; end: string; tip: string[]};
function HBars({rows, max, legend, label}: {rows: BarRow[]; max: number; legend?: {name: string; slot: number}[]; label: string}) {
  const [tip, setTip] = useState<Tip>(null);
  const w = (v: number) => `${Math.max(0, v / max * 100)}%`;
  return (
    <figure className="pd-figure" aria-label={label}>
      {legend && <ul className="pd-legend" aria-label="Bars">{legend.map(l => <li key={l.name}><span className={'pd-swatch ' + (l.slot ? 'pd-s' + l.slot : 'sk-muted')} aria-hidden="true"/>{l.name}</li>)}</ul>}
      <div className="pd-plot sk-bars" onMouseLeave={() => setTip(null)}>
        {rows.map(r => {
          const show = (e: React.SyntheticEvent<HTMLElement>) => setTip(tipAt(e, r.tip));
          return <div className="sk-row" key={r.key}>
            <span className="sk-label">{r.label}</span>
            <span className="sk-track">
              {r.bars && r.bars.map((b, i) => <span key={i} className={'sk-bar ' + (b.slot ? 'pd-s' + b.slot : 'sk-muted') + (r.bars!.length > 1 ? ' sk-thin' : '')} style={{width: w(b.value)}}
                tabIndex={i === 0 ? 0 : -1} onMouseEnter={show} onMouseMove={show} onFocus={show} onClick={show}/>)}
              {r.range && <span className="sk-bar sk-range pd-s1" style={{marginLeft: w(r.range[0]), width: w(r.range[1] - r.range[0])}}
                tabIndex={0} onMouseEnter={show} onMouseMove={show} onFocus={show} onClick={show}/>}
            </span>
            <span className="sk-end">{r.end}</span>
          </div>;
        })}
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

/** FY29–FY33 ramp as stacked columns (the /plan segment chart's geometry). */
function RampBars({d}: {d: PortfolioData}) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 720, H = 320, L = 52, R = 16, T = 28, B = 32, step = 200;
  const sums = d.years.map((_, i) => d.groups.reduce((a, g) => a + g.values[i], 0));
  const max = Math.ceil(Math.max(...sums, ...d.total) / step) * step, ticks = Array.from({length: max / step + 1}, (_, i) => i * step);
  const band = (W - L - R) / d.years.length, bw = band * 0.56, y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <figure className="pd-figure" aria-label="Revenue ramp by chip group, FY29 to FY33, ₹ Cr, stacked columns. The same figures are in the table below.">
      <ul className="pd-legend" aria-label="Chip groups">{d.groups.map((g, i) => <li key={g.name}><span className={'pd-swatch pd-s' + (i + 1)} aria-hidden="true"/>{g.name}</li>)}</ul>
      <div className="pd-plot" onMouseLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pd-svg" aria-hidden="true">
          {ticks.map(t => <g key={t}><line className="pd-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)}/><text className="pd-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t.toLocaleString('en-IN')}</text></g>)}
          {d.years.map((yr, yi) => {
            const x = L + band * yi + (band - bw) / 2; let acc = 0;
            return <g key={yr}>
              {d.groups.map((g, gi) => {
                const v = g.values[yi]; if (v <= 0) return null;
                const y0 = y(acc), y1 = y(acc + v); acc += v;
                const show = (e: React.MouseEvent) => { const b = (e.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
                  setTip({x: (x + bw / 2) / W * b.width, y: y1 / H * b.height, w: b.width, lines: [`${g.name} · ${yr}`, cr(v), `${pct(v / sums[yi])} of ${yr}`]}); };
                return <rect key={g.name} className={'pd-s' + (gi + 1)} x={x} y={y1} width={bw} height={Math.max(0, y0 - y1 - 2)} onMouseEnter={show} onMouseMove={show}/>;
              })}
              <text className="pd-value" x={x + bw / 2} y={y(Math.max(sums[yi], d.total[yi])) - 8} textAnchor="middle">{d.total[yi].toLocaleString('en-IN')}</text>
              <text className="pd-axis" x={x + bw / 2} y={H - 10} textAnchor="middle">{yr}</text>
            </g>;
          })}
        </svg>
        <TipBox tip={tip}/>
      </div>
    </figure>
  );
}

export function PortfolioDashboard() {
  // The built copy renders first (and is what a crawler sees); the team's public sheets replace it once read and
  // checked. A sheet that cannot be read or fails the checks leaves the built copy, and the header says which is shown.
  const [{d, prov}, setLive] = useState<{d: PortfolioData; prov: Provenance}>({d: built, prov: {live: false}});
  useEffect(() => {
    const ac = new AbortController();
    void loadLiveTables(fetch, ac.signal).then(r => {
      if (r && !r.failures.length) setLive({d: toPortfolio(r.tables, built.model), prov: {live: true, readAt: new Date().toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'})}});
    });
    return () => ac.abort();
  }, []);
  const planned = d.skus.filter(s => s.planCr != null);
  const onShuttle = planned.filter(s => s.shuttle);
  const total = (k: keyof Sku) => Math.round(planned.reduce((a, s) => a + ((s[k] as number) || 0), 0) * 10) / 10;
  const planTotal = total('planCr'), fy31Sum = total('fy31Cr');
  const yi31 = d.years.indexOf('FY31'), last = d.years.length - 1;
  const byFy31 = [...planned].sort((a, b) => (b.fy31Cr ?? 0) - (a.fy31Cr ?? 0));
  const top2 = byFy31.slice(0, 2), top2Share = (top2[0].fy31Cr! + top2[1].fy31Cr!) / fy31Sum;
  const notShuttle = planned.filter(s => !s.shuttle);
  const spec = planned.filter(s => /specification/i.test(s.readiness));
  const lead = d.groups.reduce((a, g) => (g.values[last] > a.values[last] ? g : a));
  const apLo = Math.min(...d.approvals.map(a => a.low)), apHi = Math.max(...d.approvals.map(a => a.high));
  const longest = d.approvals.filter(a => a.high === apHi).map(a => a.market);
  const tranche = [...d.tranche].sort((a, b) => b.cr - a.cr), tTotal = tranche.reduce((a, t) => a + t.cr, 0);
  const top3 = tranche.slice(0, 3), top3Share = top3.reduce((a, t) => a + t.cr, 0) / tTotal;
  const mLo = Math.min(...d.unitCost.map(u => u.marginLow)), mHi = Math.max(...d.unitCost.map(u => u.marginHigh));
  const marketMax = Math.max(...planned.map(s => s.marketHighCr ?? 0));
  const devMax = Math.max(...planned.map(s => s.devHighCr ?? 0));
  const devTop = [...planned].sort((a, b) => (b.devHighCr ?? 0) - (a.devHighCr ?? 0))[0];
  const short = (s: Sku) => `${s.sku} ${s.name}`;
  const specRows: [string, string][] = [['Core', 'core'], ['Clock', 'clock'], ['SRAM', 'sram'], ['Boot ROM', 'boot_rom'], ['ADC', 'adc'], ['Supply', 'supply'], ['Package', 'package'], ['Process', 'process'], ['Status', 'status']];

  return (
    <div className="pd-root">
      <header className="pd-head">
        <h2>{Say(onShuttle.length)} of {say(planned.length)} chips go on the December 2026 shuttle. Their plan lines total {cr(planTotal)}; the ramp reaches {cr(d.total[yi31])} in FY31.</h2>
        <p className="pd-flag"><strong>Plan targets, not results.</strong> Every figure is from the {d.source} (<a className="pd-link" href={asset('/downloads/docs/' + d.sourceFile)}>PDF</a>) or the DG32 preliminary datasheets. A plan line is what a chip can carry at full rate; the ramp is what the Blueprint expects year by year. Nothing here is a purchase order.</p>
        <p className="pd-source sk-prov" data-live={prov.live ? 'true' : 'false'}>{prov.live ? `Live from the team's tables, read ${prov.readAt}.` : 'From the copy checked at the last site build; the live tables could not be read.'} The tables are public: <a className="pd-link" href={sheetViewUrl('skus')} target="_blank" rel="noopener noreferrer">open the SKU table</a>. The reading for investors and buyers is in <a className="pd-link" href={url('/portfolio/brief')}>the brief</a>.</p>
      </header>

      <ul className="pd-kpis" aria-label="Headline figures">
        <li><span className="pd-kpi-label">On the December 2026 shuttle</span><strong className="pd-kpi-value">{onShuttle.length} of {planned.length}</strong><span className="pd-kpi-context">not on it: {notShuttle.map(s => s.sku).join(', ')}</span><span className="pd-def">Chips with a prototype slot on the ChipFoundry shuttle.</span></li>
        <li><span className="pd-kpi-label">Plan lines, all chips</span><strong className="pd-kpi-value">{cr(planTotal)}</strong><span className="pd-kpi-context">largest: {short(byFy31[0])}</span><span className="pd-def">Sum of the revenue each chip can carry at full rate.</span></li>
        <li><span className="pd-kpi-label">Revenue ramp, FY31</span><strong className="pd-kpi-value">{cr(d.total[yi31])}</strong><span className="pd-kpi-context">{cr(d.total[last])} in {d.years[last]}</span><span className="pd-def">The Blueprint's stated total for the year, all chip groups.</span></li>
        <li><span className="pd-kpi-label">Development cost, all chips</span><strong className="pd-kpi-value">{cr1(total('devLowCr'))}–{cr1(total('devHighCr')).replace('₹', '')}</strong><span className="pd-kpi-context">low to high estimate</span><span className="pd-def">Per chip: a prototype run, a production mask set and qualification for its markets; summed.</span></li>
      </ul>

      <section className="pd-panel" aria-labelledby="sk-lines-h">
        <h3 id="sk-lines-h">{top2.map(short).join(' and ')} carry {pct(top2Share)} of the FY31 ramp; most other chips are still far from their plan line that year.</h3>
        <HBars label="Plan line and FY31 ramp per chip, ₹ Cr, horizontal bars. The same figures are in the table below." max={Math.max(...planned.map(s => s.planCr!))}
          legend={[{name: 'Plan line', slot: 0}, {name: 'FY31 ramp', slot: 1}]}
          rows={byFy31.map(s => ({key: s.sku, label: short(s), bars: [{value: s.planCr!, slot: 0}, {value: s.fy31Cr!, slot: 1}], end: `${s.fy31Cr} / ${s.planCr}`,
            tip: [short(s), `FY31 ramp ${cr(s.fy31Cr!)}`, `Plan line ${cr(s.planCr!)}`, `${pct(s.fy31Cr! / s.planCr!)} of the line in FY31`]}))}/>
        <div className="table-scroll"><table className="pd-table sk-table">
          <caption className="sr-only">Chips, readiness and plan, ₹ Cr</caption>
          <thead><tr><th scope="col">Chip</th><th scope="col">Process</th><th scope="col">Readiness</th><th scope="col">Dec 2026 shuttle</th><th scope="col">Plan line</th><th scope="col">FY31 ramp</th><th scope="col">Market, ₹{NB}Cr</th><th scope="col">Market verdict</th></tr></thead>
          <tbody>{d.skus.map(s => <tr key={s.sku}><th scope="row">{short(s)}</th><td>{s.process}{s.clockMhz ? `, ${s.clockMhz}${NB}MHz` : ''}</td><td>{s.readiness || '–'}</td><td>{s.planCr == null ? '–' : s.shuttle ? 'Yes' : 'No'}{s.mpw ? ` (${s.mpw})` : ''}</td>
            <td>{s.planCr ?? '–'}</td><td>{s.fy31Cr ?? '–'}</td><td>{s.marketLowCr != null ? `${s.marketLowCr.toLocaleString('en-IN')}–${s.marketHighCr!.toLocaleString('en-IN')}` : '–'}</td><td>{s.verdict ? s.verdict.charAt(0) + s.verdict.slice(1).toLowerCase() : '–'}</td></tr>)}</tbody>
        </table></div>
        <Source files={['skus.csv']} note={`Plan lines sum to ${cr(planTotal)} (checked at build). ${spec.length ? `${spec.map(short).join(', ')} is still at specification; ` : ''}D100 is Track B, on 28${NB}nm, with no plan line yet. Clock is the product target, not a measurement.`}/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-ramp-h">
        <h3 id="sk-ramp-h">The ramp grows from {cr(d.total[0])} in {d.years[0]} to {cr(d.total[last])} in {d.years[last]}; {lead.name} is the largest group.</h3>
        <RampBars d={d}/>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Revenue ramp by chip group, ₹ Cr</caption>
          <thead><tr><th scope="col">Chip group</th>{d.years.map(y => <th scope="col" key={y}>{y}</th>)}</tr></thead>
          <tbody>
            {d.groups.map((g, gi) => <tr key={g.name}><th scope="row"><span className={'pd-swatch pd-s' + (gi + 1)} aria-hidden="true"/>{g.name}</th>{g.values.map((v, i) => <td key={i}>{v ? v.toLocaleString('en-IN') : '–'}</td>)}</tr>)}
            <tr className="pd-total"><th scope="row">Total, as stated</th>{d.total.map((v, i) => <td key={i}>{v.toLocaleString('en-IN')}</td>)}</tr>
          </tbody>
        </table></div>
        <Source files={['ramp.csv']} note="Column labels are the Blueprint's stated totals; where the groups sum one away from a total, that is rounding in the source."/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-appr-h">
        <h3 id="sk-appr-h">Revenue waits on approvals of {apLo} to {apHi} months; {longest.join(', ').toLowerCase()} take longest.</h3>
        <HBars label="Approval time by market, months, low to high. The same figures are listed beside each bar." max={apHi}
          rows={d.approvals.map(a => ({key: a.market, label: a.market, range: [a.low, a.high] as [number, number], end: `${a.low}–${a.high} months`, tip: [a.market, a.approval, `${a.low}–${a.high} months`]}))}/>
        <Source files={['approvals.csv']} note="What each market requires before it buys in volume, and how long that takes."/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-money-h">
        <h3 id="sk-money-h">{top3.map(t => t.use.split(',')[0]).join(', ')} take {pct(top3Share)} of the {cr(tTotal)} first tranche.</h3>
        <HBars label="Proposed use of the first tranche, ₹ Cr. The same figures are in the table below." max={tranche[0].cr}
          rows={tranche.map(t => ({key: t.use, label: t.use, bars: [{value: t.cr, slot: 1}], end: cr1(t.cr), tip: [t.use, cr1(t.cr), t.delivers]}))}/>
        <div className="table-scroll"><table className="pd-table pd-funds">
          <caption className="sr-only">Tranche 1 uses, ₹ Cr</caption>
          <thead><tr><th scope="col">Use</th><th scope="col">₹{NB}Cr</th><th scope="col">What it delivers</th></tr></thead>
          <tbody>{tranche.map(t => <tr key={t.use}><th scope="row">{t.use}</th><td>{t.cr.toFixed(1)}</td><td className="sk-wrap">{t.delivers}</td></tr>)}
            <tr className="pd-total"><th scope="row">Total</th><td>{tTotal.toFixed(1)}</td><td/></tr></tbody>
        </table></div>
        <Source files={['tranche1-uses.csv']} note={`Uses sum to ${cr(tTotal)} (checked at build).`}/>
        {d.model && <p className="pd-lede sk-recon"><strong>Not the same plan as the Business plan page.</strong> That page shows the September financial model: it raises {d.model.sources.map(s => `${cr(s.cr)} (${s.item.charAt(0).toLowerCase() + s.item.slice(1)})`).join(' and ')}, and expects {cr(Math.round(d.model.fy31RevenueCr))} of whole-company revenue in FY31. This October Blueprint funds the chips in tranches, starting with the {cr(tTotal)} above, and expects {cr(d.total[yi31])} from these chips in FY31. Read each figure with its own document. <a className="pd-link" href={url('/plan')}>Business plan</a></p>}
      </section>

      <section className="pd-panel" aria-labelledby="sk-dev-h">
        <h3 id="sk-dev-h">{short(devTop)} costs the most to develop, up to {cr1(devTop.devHighCr!)}; the others need {cr1(Math.min(...planned.map(s => s.devLowCr!)))}–{cr1(Math.max(...planned.filter(s => s !== devTop).map(s => s.devHighCr!))).replace('₹', '')} each.</h3>
        <HBars label="Development cost per chip, ₹ Cr, low to high estimate. The same figures are listed beside each bar." max={devMax}
          rows={[...planned].sort((a, b) => b.devHighCr! - a.devHighCr!).map(s => ({key: s.sku, label: short(s), range: [s.devLowCr!, s.devHighCr!] as [number, number],
            end: `${s.devLowCr}–${s.devHighCr}`, tip: [short(s), `${cr1(s.devLowCr!)} – ${cr1(s.devHighCr!)}`, s.readiness]}))}/>
        <Source files={['skus.csv']} note={`Development cost sums to ${cr1(total('devLowCr'))}–${cr1(total('devHighCr'))} across the eleven chips (checked at build). The addressable market per chip runs up to ${cr(marketMax)}; see the table above.`}/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-unit-h">
        <h3 id="sk-unit-h">At volume, the four costed chips keep {mLo}–{mHi}{NB}% of their price as gross margin.</h3>
        <div className="table-scroll"><table className="pd-table">
          <caption className="sr-only">Unit cost and price at volume, US dollars</caption>
          <thead><tr><th scope="col">Chip</th><th scope="col">Die, mm²</th><th scope="col">Package</th><th scope="col">Unit cost</th><th scope="col">Price</th><th scope="col">Gross margin</th></tr></thead>
          <tbody>{d.unitCost.map(u => <tr key={u.chip}><th scope="row">{u.chip}</th><td>{u.dieMm2}</td><td>{u.pkg}</td><td>{usd(u.costLow)}–{usd(u.costHigh)}</td><td>{usd(u.priceLow)}–{usd(u.priceHigh)}</td><td>{u.marginLow}–{u.marginHigh}{NB}% at {usd(u.marginAt)}</td></tr>)}</tbody>
        </table></div>
        <Source files={['unit-cost.csv']} note="Cost to make at volume, and the gross margin at the price point the Blueprint names. Prototype costs are quoted; mask and qualification costs are planning estimates."/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-spec-h">
        <h3 id="sk-spec-h">The two DG32 dies share a package, a process and their memory; DG32-2DOM adds an attention engine on its own clock.</h3>
        <div className="table-scroll"><table className="pd-table sk-table">
          <caption className="sr-only">DG32 preliminary specifications</caption>
          <thead><tr><th scope="col">Specification</th>{d.specs.map(s => <th scope="col" key={s.part}>{s.part}{s.sku ? ` (${s.sku})` : ''}</th>)}</tr></thead>
          <tbody>{specRows.map(([lab, k]) => <tr key={k}><th scope="row">{lab}</th>{d.specs.map(s => <td key={s.part} className="sk-wrap">{s[k]}</td>)}</tr>)}</tbody>
        </table></div>
        <Source files={['dg32-specs.csv']} note={d.specs.filter(s => s.note).map(s => `${s.part}: ${s.note}.`).join(' ') + ' Preliminary datasheets; 50 MHz is the CPU-domain design target, set by the lockstep core’s measured 55–62 MHz post-route.'}/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-docs-h">
        <h3 id="sk-docs-h">{d.documents.filter(r => /^current/i.test(r.status)).length} documents are current; {d.documents.filter(r => !/^current/i.test(r.status)).length} copies are superseded, stale or duplicates.</h3>
        <div className="table-scroll"><table className="pd-table sk-table">
          <caption className="sr-only">Document versions</caption>
          <thead><tr><th scope="col">Document</th><th scope="col">Where</th><th scope="col">Version</th><th scope="col">Pages</th><th scope="col">Status</th><th scope="col">Note</th></tr></thead>
          <tbody>{d.documents.map(r => <tr key={r.document}><th scope="row">{r.document}</th><td>{r.where}</td><td>{r.version}</td><td>{r.pages || '–'}</td><td>{r.status}</td><td className="sk-wrap">{r.note}</td></tr>)}</tbody>
        </table></div>
        <Source files={['documents.csv']} note="Which copy of each document is current: the published downloads, and the local copies they were checked against."/>
      </section>

      <section className="pd-panel" aria-labelledby="sk-conf-h">
        <h3 id="sk-conf-h">Where the published documents disagree: {d.conflicts.filter(c => /^open/i.test(c.status)).length} open, {d.conflicts.filter(c => /^fixed/i.test(c.status)).length} fixed, {d.conflicts.filter(c => /^decided/i.test(c.status)).length} decided by the owner.</h3>
        <div className="table-scroll"><table className="pd-table sk-table">
          <caption className="sr-only">Document disagreements and their status</caption>
          <thead><tr><th scope="col">Topic</th><th scope="col">One source says</th><th scope="col">Another says</th><th scope="col">Status</th></tr></thead>
          <tbody>{d.conflicts.map(c => <tr key={c.topic}><th scope="row">{c.topic}</th><td className="sk-wrap">{c.source_a}: {c.a_says}</td><td className="sk-wrap">{c.source_b}: {c.b_says}</td><td className="sk-wrap">{c.status}</td></tr>)}</tbody>
        </table></div>
        <Source files={['conflicts.csv']} note="Each row is one claim two sources state differently, and what was done about it. Figures this site withholds are not repeated."/>
      </section>
    </div>
  );
}

export default PortfolioDashboard;
