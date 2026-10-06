'use client';

import {PortfolioV6Style} from '../portfolio-v6-style';
import {Shell, useNav} from '../shell';
import {PRE_SILICON} from '../copy';
import {ArrowRight,ArrowUpRight} from 'lucide-react';
import {DataTable,ExplainedGrid,Sec,SectionHead,Stats} from '../detail';
import {familyCompare, sovereignSkuHorizon} from '../detail-content';
import {parts} from '../content';
import {ChipMap,LoopCost,WhyLockstep} from '../products-story';
import {ProductsScene} from '../three/blocks';
import Related from '../related';
import {url} from '../routes';
import ProductTiles from '../product-tiles';
import {DeepGridVisual} from '../deepgrid-visual';
import {PortfolioFinder} from '../portfolio-finder';

export default function Page() {
  const {navigate, go, href} = useNav();
  return (
    <Shell route="products"><PortfolioV6Style/>
      <section className="page-wrap">
  <SectionHead kicker="Products" title="Twelve parts, each for one physical job." copy="Motion and safety, power and infrastructure, interfaces and perception, system integration: each part starts from the job it does on the board. Below the ten, DG32, the lockstep safety MCU, is shown in depth with its 2DOM variant. Pre-silicon; every figure is a design target."/>
  <DeepGridVisual kind="products" priority/>
  <PortfolioFinder/>
  <ProductTiles/>
  <ProductsScene/>
  <Stats items={[['2 cores','In lockstep: CHECKER runs two cycles behind MAIN'],['~300 cycles','Fixed hardware cost of one FOC loop'],['44 pins','One signal pinout for both chips']]}/>

  <Sec kicker="WHY A SECOND CORE" title="Self-test cannot see a fault between runs;" em="lockstep checks every store." copy="Motor control drives power electronics, and a silent CPU fault can destroy a bridge. Hardware lockstep has lived in automotive MCUs such as Infineon AURIX, NXP S32K and TI Hercules; DG32-LITE brings it to the entry-level motor-control tier.">
   <WhyLockstep/>
   <p className="disclaimer">The 39-cycle figure is measured in simulation, from an injected fault to the latch.</p>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>navigate('safety')}>Follow the fault path step by step <ArrowUpRight size={16}/></button>
     <a className="text-link" href={href('safety')+'#film'}>Watch it animated, in ninety seconds <ArrowUpRight size={16}/></a>
   </div>
  </Sec>

  <Sec title="Six block groups on one clock;" em="DG32-2DOM adds a seventh on its own." copy="Choose a block to see what it does and why it is there. Then switch to DG32-2DOM: the six groups are the same design from the same source, and only the attention engine and its bridges are new.">
   <ChipMap/>
   <details className="ps-specs">
    <summary>Full specifications, side by side</summary>
    <DataTable caption="DG32-LITE and DG32-2DOM compared" head={['Area','DG32-LITE','DG32-2DOM']} rows={familyCompare} wide/>
    <div className="ps-spec-cols">{parts.map(p=><div key={p.id}><h3>{p.name}</h3><p className="ps-spec-status">{p.status}</p><dl className="dr-specs">{p.specs.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>)}</div>
   </details>
   <p className="disclaimer">{PRE_SILICON} The ~0.43 W power figure is a vectorless tool estimate at 25 °C and 1.8 V.</p>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>navigate('architecture')}>Inside the architecture, in 3D <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>go('library?pkg=lite')}>DG32-LITE architecture deck and film <ArrowRight size={16}/></button>
     <button className="text-link" onClick={()=>go('library?pkg=2dom')}>DG32-2DOM architecture deck and film <ArrowRight size={16}/></button>
   </div>
  </Sec>

  <Sec title="The loop runs in hardware," em="so its cost is fixed." copy="Sampling, the Park transforms and the PWM update are dedicated blocks costing about 300 cycles at any loop rate; the CPU keeps only the two PI regulators. What is left at each rate is the firmware budget.">
   <LoopCost/>
   <p className="disclaimer">Cycle costs measured in simulation at the 50 MHz clock; 100 kHz is the simulated ceiling, not a bench result.</p>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>navigate('control')}>Pick a loop rate and see the budget <ArrowUpRight size={16}/></button>
   </div>
  </Sec>

  {/* Where DG32 sits. The mature-node thesis is the organising argument of the SKU Architecture
      Compendium and it appeared nowhere on this site: without it 130 nm reads as a limitation
      rather than the choice the portfolio is built on. */}
  <Sec
    kicker="WHERE DG32 SITS"
    title="Mature-node silicon,"
    em="around the sub-10 nm core."
    copy="Sub-10 nm silicon cannot withstand 28 V to 120 V transient rails, carries no 24-bit high-dynamic-range analog front end, and does not survive automotive and military screening from −55 °C to +125 °C without external support. DeepGrid anchors those physical interfaces on 130 nm and 180 nm, taking the satellite sockets around the sub-10 nm central compute rather than competing with it. DG32 is SKU-4 of that portfolio, the lockstep safety MCU."
  >
   <figure className="st-art">
    <img src={url('/images/deepgridsemi/package-stack.webp')} alt="Exploded view of a layered chip package: die, substrate and lid separated" width={544} height={364} loading="lazy" decoding="async"/>
    <figcaption>DeepGrid&rsquo;s multi-die package concept, from deepgridsemi.com. The D100 at the foot of this table is the portfolio&rsquo;s multi-die part.</figcaption>
   </figure>
   <details className="dr-evaluation-guide"><summary>Compare process nodes across the portfolio</summary><div className="table-scroll">
    <table className="dr-table dr-table-wide">
     {/* Per-chip facts live on /applications (one home per fact); this table keeps only what the
         mature-node argument needs, and each part opens its card there. */}
     <caption>The twelve-chip portfolio and where DG32 sits in it. Each part opens its card on the applications page, with where it goes, what it replaces and what it rests on.</caption>
     <thead>
      <tr>
       <th scope="col">SKU</th><th scope="col">Part</th><th scope="col">Node</th>
      </tr>
     </thead>
     <tbody>
      {sovereignSkuHorizon.map(k => {
       const chip = k.sku === 'Track B' ? 'd100' : 'sku' + k.sku.replace(/\D/g, '').slice(0, 1);
       return (
       <tr key={k.sku + k.name}>
        <th scope="row">{k.sku}</th>
        <td><a className="st-link" href={href('applications') + '#chip-' + chip}>{k.isDg32 ? <strong>{k.name}</strong> : k.name}</a></td>
        <td>{k.node}</td>
       </tr>
       );
      })}
     </tbody>
    </table>
   </div></details>
   <p className="disclaimer">
    Portfolio, numbering and nodes follow the SKU Blueprint, October 2026. Phase names the sovereignty foundry, not a date: Phase 1 SkyWater, Phase 2 IHP,
    Phase 3 SCL Mohali. Anchor customers and contract values are held off this table pending
    verification.
   </p>
   <div className="dr-links dr-sec-gap">
     <button className="text-link" onClick={()=>go('library')}>Read the SKU Architecture Compendium <ArrowUpRight size={16}/></button>
     <button className="text-link" onClick={()=>go('ask')}>Ask how the portfolio fits together <ArrowUpRight size={16}/></button>
   </div>
  </Sec>

  <Sec title="Start on DG32-LITE;" em="move to DG32-2DOM when the drive should watch its own motor.">
   <ExplainedGrid cols={2} items={[
    {name:'Choose DG32-LITE',what:'For a drive that needs hardware lockstep safety, hardware FOC acceleration and native DShot in a 64-pin part.',why:'It is pre-silicon. Bring-up must measure loop costs, fault latency, timing and electrical behaviour before design values become silicon results.'},
    {name:'Choose DG32-2DOM',what:'For a drive that should also watch its own motor: bearing-fault or anomaly detection on phase-current data, without a second processor.',why:'The engine runs on its own clock behind bridges, so condition monitoring cannot extend the control core’s worst-case execution time. Design complete, in physical trials.'},
   ]}/>
   <div className="dr-links dr-sec-gap">
     <button className="primary" onClick={()=>navigate('contact')}>Discuss your application <ArrowUpRight size={17}/></button>
     <button className="text-link" onClick={()=>go('library?pkg=lite-datasheet')}>DG32-LITE datasheet deck and film <ArrowRight size={16}/></button>
     <button className="text-link" onClick={()=>go('library?pkg=2dom-datasheet')}>DG32-2DOM datasheet deck and film <ArrowRight size={16}/></button>
     <button className="text-link" onClick={()=>navigate('pinout')}>QFN-64 package & electrical limits <ArrowUpRight size={16}/></button>
   </div>
  </Sec>
 <Related route="products"/>
 </section>
    </Shell>
  );
}
