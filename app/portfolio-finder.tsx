'use client';
import {useState} from 'react';
import {ArrowUpRight, Search} from 'lucide-react';
import {portfolioParts, portfolioGroups} from './portfolio-story-data';
import {productSlugFor} from './product-pages-data';
import {url} from './routes';

export function PortfolioFinder() {
  const [group,setGroup]=useState('all');
  const [query,setQuery]=useState('');
  const matches=portfolioParts.filter(p=>(group==='all'||p.group===group)&&`${p.code} ${p.name} ${p.job} ${p.architecture}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="v11-finder" id="portfolio" aria-labelledby="finder-title">
    <header className="v11-section-head"><h2 id="finder-title">Find your next<br/>silicon building block.</h2><p>Start with the job your system needs to do. Explore ten architectures, each with its own physical requirements and evidence.</p></header>
    <div className="v11-finder-tools"><div className="v11-filters" role="group" aria-label="Filter product families">{[{id:'all',title:'All architectures'},...portfolioGroups].map(g=><button key={g.id} aria-pressed={group===g.id} onClick={()=>setGroup(g.id)}>{g.title}</button>)}</div><label className="v11-search"><Search size={18} aria-hidden="true"/><span className="v11-sr">Search architectures</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products or tasks"/></label></div>
    <p className="v11-result-count" aria-live="polite">{matches.length} {matches.length===1?'architecture':'architectures'} · Pre-silicon portfolio</p>
    <div className="v11-product-list">{matches.map(p=><a className="v11-product-row" key={p.id} href={url('/products/'+productSlugFor[p.id])}><span className="v11-part-code">{p.code}</span><span><strong>{p.name}</strong><span className="v11-product-job">{p.job}</span></span><span className="v11-product-process">{p.process}<small>{p.maturity}</small></span><ArrowUpRight size={22} aria-hidden="true"/></a>)}</div>
    {!matches.length&&<div className="v11-empty"><p>No architectures match that search.</p><button onClick={()=>{setQuery('');setGroup('all')}}>Clear search and filters</button></div>}
  </section>;
}
