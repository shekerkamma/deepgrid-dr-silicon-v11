'use client';
import {ArrowUpRight} from 'lucide-react';
import {PortfolioFinder} from './portfolio-finder';
import {DeepGridVisual} from './deepgrid-visual';
import {LayoutEvidence} from './engineering-visuals';
import {url} from './routes';
import {readHref} from './doc-links';
import {Workbench,SafetyWorkbench} from './portfolio-workbench';
import {claims} from './claims';
import {PortfolioV6Style} from './portfolio-v6-style';
import {FundingPath, ReviewPaths, EvidenceAgenda, DiscussionClose} from './investor-journey';
const src=(s:string,section?:string)=>readHref('/downloads/'+s.replace(/^\/?downloads\//,''),section);
export function Overview({reduced}:{reduced:boolean}){return <div className="v6-home v11-home"><PortfolioV6Style/>
<section className="v11-hero" aria-labelledby="home-title"><div className="v11-hero-copy"><h1 id="home-title">Silicon for motion,<br/>power and sensing.</h1><p>DeepGrid is developing silicon for motion, power, sensing and communications. Explore the product architectures, their role in your equipment, and the evidence needed before adoption.</p><div className="v11-actions"><a className="v11-button" href={url("/contact")+"?intent=investor"}>Request a discussion <ArrowUpRight size={18} aria-hidden="true"/></a><a className="v11-text-link" href={url("/products")}>Explore the products <ArrowUpRight size={18} aria-hidden="true"/></a></div><div className="v11-evidence-note"><span>Pre-silicon portfolio</span><p>Architecture and engineering evidence today. Manufactured-silicon results and qualification still ahead.</p></div></div><DeepGridVisual kind="overview" priority/></section>
<ReviewPaths/>
<PortfolioFinder/>
<section className="dgs-proof-strip" aria-label="Evidence at a glance"><ul><li><a href={url('/products')}><strong>12</strong><span>architectures</span><small>Pre-silicon portfolio · SKU Blueprint</small></a></li>{([['fault-39','injected fault to protective response'],['fmax-lockstep','lockstep core, sets the 50 MHz clock'],['node-130','process, for 28 to 120 V rails']] as const).map(([id,label])=>{const c=claims[id];return <li key={id}><a href={src(c.source)} title={c.measures}><strong>{c.figure}</strong><span>{label}</span><small>{c.kind} · {c.sourceTitle}</small></a></li>})}</ul></section>
<nav className="v11-application-strip" aria-label="Explore by application"><span>What are you building?</span>{[['Motors & drives','motors'],['Vehicles','vehicles'],['Defence & drones','defence'],['Grid & metering','grid'],['Board infrastructure','boards']].map(([name,path])=><a key={path} href={url('/use-cases/'+path)}>{name}</a>)}</nav>
<section className="v6-section" id="dg32-proof"><header><h2>Hardware fault response in 39 cycles.</h2><p>In simulation, DG32 detects a processor disagreement and trigger a protective response without waiting for application software. The important decision is whether that response meets the needs of the complete machine.</p></header><SafetyWorkbench reduced={reduced}/><div className="v6-proof"><strong>{claims['fault-39'].figure}</strong><div><b>Injected-fault response · simulated</b><p>The complete reported path differs from the checker’s two-cycle execution skew. Hardware lockstep is a mechanism, not a functional-safety certificate.</p><a href={src(claims['fault-39'].source)}>Read the fault-path source <ArrowUpRight size={14} aria-hidden="true"/></a></div></div><a className="v6-link" href={url('/technology/safety')}>Inspect fault causes and reset behaviour</a></section>
<section className="v11-system"><div className="v11-system-intro"><h2>Control, power and interfaces<br/>in one system.</h2><p>A product earns its place by solving a system problem. Explore how control, power and interfaces contribute to the equipment, and which responsibilities remain outside the chip.</p><a className="v11-text-link" href={url('/applications')}>Explore system applications</a><DeepGridVisual kind="products"/></div><Workbench reduced={reduced}/></section>
<LayoutEvidence compact/>
<EvidenceAgenda/>
<FundingPath/>
<DiscussionClose/>
</div>}
