'use client';
import {useState} from 'react';
import {url} from './routes';
import {BrandImage} from './brand-imagery';
const families=[
 {name:'Motor control',code:'SKU-1',file:'sku-1',w:1513,h:885,copy:'The control engine and the power stage, in one architecture.'},
 {name:'Power management',code:'SKU-3',file:'sku-3',w:1513,h:903,copy:'Convert the equipment power bus into sequenced board supplies.'},
 {name:'Radar sensing',code:'SKU-7',file:'sku-7',w:1513,h:763,copy:'A specialist RF front end, sampling and baseband processing.'},
 {name:'Drone integration',code:'D100',file:'d100',w:1553,h:945,copy:'Separate flight safety from higher-level perception compute.'},
];
export function DeepGridVisual({kind,priority=false}:{kind:'overview'|'products'|'technology';priority?:boolean}){
 const [selected,setSelected]=useState(0);const p=families[selected];
 if(kind==='products')return <figure className="v11-visual v11-visual-products"><div className="v11-family-tabs" role="group" aria-label="Explore product architecture diagrams">{families.map((x,i)=><button key={x.code} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{x.name}<span>{x.code}</span></button>)}</div><a href={url('/products/'+p.file)} aria-label={'Explore '+p.code+' '+p.name}><img src={url('/diagrams/'+p.file+'-architecture.svg')} alt={p.code+' '+p.name+' original DeepGrid architecture diagram'} width={p.w} height={p.h} loading={priority?'eager':'lazy'} decoding="async"/></a><figcaption><strong>{p.code} · {p.copy}</strong><br/>Original DeepGrid architecture diagram · pre-silicon design. <a href={url('/products/'+p.file)}>Explore this part</a></figcaption></figure>;
 if(kind==='overview')return <BrandImage kind="portfolio" priority className="v11-visual v11-visual-overview"/>;
 return <BrandImage kind="dg32" priority={priority} className="v11-visual v11-visual-technology"/>;
}
