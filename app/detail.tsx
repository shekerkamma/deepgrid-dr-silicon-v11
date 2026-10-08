'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Download} from 'lucide-react';
import {url} from './routes';
import sectionStories from './executive-sections.json';
import {useRouteStory} from './executive-story';
import {readHref} from './doc-links';
import {nbspUnits as nb, type DiagramNotes as DiagramNotesData, type DiagramRef} from './diagram-notes';
import type {Explained,Step} from './detail-content';

// Layout primitives for the detailed sections. Content lives in detail-content.ts.

export function Eyebrow({children}:{children:React.ReactNode}){return <p className="eyebrow"><span/> {children}</p>}
export function SectionHead({title,copy,kicker}:{tag?:string;kicker?:string;title:string;copy:string}){const story=useRouteStory(); title=story.headline; copy=story.context;return <header className="section-head"><div><h1>{title}</h1></div><p>{copy}</p></header>}

export function Sec({kicker,title,em,copy,children}:{kicker?:string;title:string;em?:string;copy?:React.ReactNode;children?:React.ReactNode}){
 const story=sectionStories[title.replace(/\u00a0/g,' ') as keyof typeof sectionStories]; if(story){title=story.title;copy=story.copy;em=undefined;}
 return <section className="dr-sec"><header className="dr-sec-head"><div><h2 className="dr-h2">{title}{em&&<><br/><em>{em}</em></>}</h2></div>{copy&&<div className="dr-sec-copy">{typeof copy==='string'?<p>{copy}</p>:copy}</div>}</header>{children}</section>;
}

export function ExplainedGrid({items,cols=3}:{items:Explained[];cols?:2|3}){
 return <div className={'dr-explained dr-cols-'+cols}>{items.map(x=><article key={x.name}><h3>{x.name}</h3><p>{x.why}</p><details className="executive-sources"><summary>Supporting detail</summary><p>{x.what}</p>{x.points&&<ul>{x.points.map(p=><li key={p}>{p}</li>)}</ul>}</details></article>)}</div>;
}

export function Steps({steps,label}:{steps:Step[];label?:string}){
 return <ol className="dr-steps" aria-label={label}>{steps.map(([t,d],i)=><li key={t}><span className="dr-step-n">{String(i+1).padStart(2,'0')}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>;
}

export function Flows({flows}:{flows:{title:string;lead:string;steps:Step[]}[]}){
 return <div className={'dr-flows dr-flows-'+flows.length}>{flows.map(f=><div key={f.title} className="dr-flow"><h3>{f.title}</h3><p className="dr-flow-lead">{f.lead}</p><Steps steps={f.steps} label={f.title}/></div>)}</div>;
}

export function DataTable({caption,head,rows,wide}:{caption:string;head:string[];rows:readonly (readonly (string|number)[])[];wide?:boolean}){
 return <div className="table-scroll"><table className={'dr-table'+(wide?' dr-table-wide':'')}><caption>{caption}</caption><thead><tr>{head.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={String(r[0])}><th scope="row">{r[0]}</th>{r.slice(1).map((c,i)=><td key={i}>{c}</td>)}</tr>)}</tbody></table></div>;
}

export function Callout({label,children,action}:{label:string;children:React.ReactNode;action?:React.ReactNode}){return <aside className="dr-callout"><span className="mono">{label}</span><p>{children}</p>{action}</aside>}

export function Stats({items}:{items:readonly (readonly [string,string])[]}){return <div className="spec-grid dr-stats-grid">{items.map(([v,k])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>}

// A draw.io diagram at its native size (its labels are drawn at 10 px), in a frame wider than the
// text column, with a fit-to-width toggle and the full-size and source links.

/** The part's draw.io architecture diagram as the visual of record. It fits the column on a desk; on a phone it
 *  keeps a readable scale and scrolls sideways, with the full-size image one tap away. */
export function Diagram({src,title,alt,width,height,drawio,guide,html,deck}:{src:string;title:string;alt:string;width:number;height:number;drawio?:string;guide?:string;html?:string;deck?:string}){
 const [more,setMore]=useState(false);
 const body=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=body.current;if(!el)return;const check=()=>setMore(el.scrollLeft+el.clientWidth<el.scrollWidth-4);check();const img=el.querySelector('img');el.addEventListener('scroll',check,{passive:true});img?.addEventListener('load',check);const ro=new ResizeObserver(check);ro.observe(el);return ()=>{el.removeEventListener('scroll',check);img?.removeEventListener('load',check);ro.disconnect();};},[]);
 return <figure className="dr-diagram sb-diagram">
  <div className="dr-diagram-bar"><div><span className="mono">SYSTEM ARCHITECTURE</span><strong>{title}</strong></div>
   <div className="dr-diagram-actions"><a className="text-link" href={src} target="_blank" rel="noreferrer">Open full size <ArrowUpRight size={15} aria-hidden="true"/></a>{html&&<a className="text-link" href={html} target="_blank" rel="noreferrer">Interactive version <ArrowUpRight size={15} aria-hidden="true"/></a>}{deck&&<a className="text-link" href={deck} download>Architecture deck (.pptx) <Download size={15} aria-hidden="true"/></a>}{drawio&&<a className="text-link" href={drawio} download>Source (.drawio) <Download size={15} aria-hidden="true"/></a>}{guide&&<a className="text-link" href={url(guide)}>Architecture guide <ArrowUpRight size={15} aria-hidden="true"/></a>}</div></div>
  <div ref={body} className="dr-diagram-body" data-more={more?'':undefined} tabIndex={0} role="region" aria-label={title+'. On a narrow screen, scroll sideways or open it full size.'}><img src={src} alt={alt} width={width} height={height} loading="lazy"/></div>
 </figure>;
}

export type StoryBeat = {marks: string[]; title: string; body: string; zones: string[]};
type SectionStory = {title: string; copy: string};
export type ArchStory = {id: string; headline: string; lead: string; beats: StoryBeat[]; closing: {title: string; body: string};
  /** Part-specific title and lead for every other section of the product page (story-architect). */
  sections?: Record<'physics' | 'specs' | 'questions' | 'fit' | 'evidence' | 'sources' | 'close', SectionStory>};

/** The storyboard under the diagram: the reading path told beat by beat, each beat carrying the marker it points
 *  to on the image and the zones it crosses. Data: arch-stories.ts (story-architect, 2026-10-03). */
export function Storyboard({story,questionsHref}:{story:ArchStory;questionsHref?:string}){
 return <div className="sb">
  <p className="dr-kicker">THE STORYBOARD · FOLLOW THE NUMBERED MARKERS ON THE DIAGRAM</p>
  <ol className="sb-beats">{story.beats.map((b,i)=><li key={i} className="sb-beat">
   <div className="sb-rail" aria-hidden="true">{b.marks.length?b.marks.map(m=><span key={m} className={'sb-mark'+(m==='F'?' is-fault':'')}>{m}</span>):<span className="sb-mark is-plain">{i+1}</span>}</div>
   <div className="sb-body"><h3>{b.marks.length?<span className="sr-only">Marker {b.marks.join(', ')}: </span>:null}{b.title}</h3><p>{nb(b.body)}</p>
    {b.zones.length>0&&<p className="sb-zones">{b.zones.map(z=><span key={z}>{z.split('  ·  ')[0]}</span>)}</p>}</div>
  </li>)}</ol>
  <aside className="sb-close"><p className="dr-kicker">WHAT IS STILL UNPROVEN</p><h3>{story.closing.title}</h3><p>{nb(story.closing.body)}</p>{questionsHref&&<a className="text-link" href={questionsHref}>The evaluation questions <ArrowUpRight size={15} aria-hidden="true"/></a>}</aside>
 </div>;
}

/** The reading notes under an architecture diagram: what each zone is and why it exists, what the
 *  numbered markers mean, then the primary documents and background reading. Data: diagram-notes.ts. */
export function DiagramNotes({notes}:{notes:DiagramNotesData}){
 const refs=(items:DiagramRef[],external:boolean)=><ul className="dr-dnotes-list">{items.map(r=><li key={r.href}><a href={r.href} {...(external?{target:'_blank',rel:'noreferrer'}:{})}><strong>{r.title}{external&&<ArrowUpRight size={14} aria-hidden="true"/>}</strong><span>{nb(r.note)}</span>{r.meta&&<small className="mono">{r.meta}</small>}</a></li>)}</ul>;
 return <div className="dr-dnotes">
  <section aria-label="How to read this diagram">
   <p className="dr-kicker">THE NUMBERED MARKERS</p>
   <ol className="dr-dnotes-marks">{notes.markers.map(m=><li key={m.mark}><b aria-hidden="true">{m.mark}</b><span><span className="sr-only">Marker {m.mark}: </span>{nb(m.text)}</span></li>)}</ol>
   <p className="dr-kicker dr-dnotes-gap">HOW TO READ THIS DIAGRAM</p>
   <dl className="dr-dnotes-zones">{notes.zones.map(z=><div key={z.name}><dt>{z.name}</dt><dd><p>{nb(z.what)}</p>{z.why&&<p className="dr-dnotes-why"><b>Why</b> {nb(z.why)}</p>}<a className="dr-dnotes-cite" href={readHref(notes.guide,z.section)}>Guide: {z.section.replace(/^Component: /,'')}</a></dd></div>)}</dl>
  </section>
  <section aria-label="Sources and further reading" className="dr-dnotes-refs">
   <p className="dr-kicker">PRIMARY SOURCES</p>
   {refs(notes.primary,false)}
   <details className="dr-dnotes-more"><summary className="dr-kicker">BACKGROUND READING · {notes.background.length}</summary>
    {refs(notes.background,true)}
    <p className="disclaimer">Background reading explains the general technique each block uses. None of it describes this part or implies its certification.</p>
   </details>
  </section>
 </div>;
}
