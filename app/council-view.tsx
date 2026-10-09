'use client';
import { useEffect, useState } from 'react';
import { collectEvidence, type Claim } from './data/answer-evidence';
import { composeAnswer, type AnswerResult } from './data/answer-generator';
import { getSemantic } from './data/semantic';
import { asset } from './routes';
import { readHref } from './doc-links';
import './executive-story.css';
interface GroundedAnswerViewProps { query: string; onSelectQuery: (q: string) => void; go: (hash: string) => void; }
export default function GroundedAnswerView({query}: GroundedAnswerViewProps) {
  const [ready,setReady]=useState(false);
  const [state,setState]=useState<{q:string;result?:AnswerResult;error?:string;pending?:boolean;semantic?:boolean}>({q:''});
  const [retry,setRetry]=useState(0);
  const [sourcesOpen,setSourcesOpen]=useState(false);
  useEffect(()=>{setReady(true);void getSemantic();},[]);
  useEffect(()=>{
    setSourcesOpen(false);
    if(!query)return;
    const controller=new AbortController();
    let active=true;
    setState({q:query,pending:true});
    void (async()=>{
      try {
        // Wait briefly for semantic retrieval, then use graph/lexical retrieval
        // if the local embedding model is still downloading. One generation per submit.
        let timer:ReturnType<typeof setTimeout>|undefined;
        const scores=await Promise.race([
          getSemantic().then(s=>s?.scores(query)).catch(()=>null),
          new Promise<null>(resolve=>{timer=setTimeout(()=>resolve(null),5000);}),
        ]);
        if(timer)clearTimeout(timer);
        if(!active)return;
        const packet=collectEvidence(query,scores||null);
        const result=await composeAnswer(packet,controller.signal);
        if(active)setState({q:query,result,semantic:!!scores});
      } catch(e) {
        if(active)setState({q:query,error:e instanceof Error?e.message:'The answer could not be completed. Please retry.'});
      }
    })();
    return ()=>{active=false;controller.abort();};
  },[query,retry]);
  const current=state.q===query?state:undefined;
  const result=current?.result;
  const refs=(claim:Claim)=>claim.support.map(s=>result!.sources.findIndex(c=>c.id===s.sourceId)+1).filter((n,i,a)=>n>0&&a.indexOf(n)===i).map(n=>(
    <a key={n} className="executive-ref" href={'#answer-source-'+n} onClick={()=>setSourcesOpen(true)} aria-label={'Source '+n}>[{n}]</a>
  ));
  return <div className="dr-grounded-answer-wrap executive-answer" data-ready={ready} data-semantic={current?.semantic?'on':'off'} data-answerable={result?.answer.answerable} data-model={result?.model} aria-busy={!!current?.pending}>
    {query&&<article className="dr-answer-card answer-essay" aria-label="Answer">
      <h2 className="dr-contextual-title">{query}</h2>
      {current?.pending&&<p role="status">Reading the source material and composing your answer…</p>}
      {current?.error&&<div role="alert"><p>{current.error}</p><button type="button" className="ask-submit" onClick={()=>setRetry(n=>n+1)}>Retry answer</button></div>}
      {result&&<>
        <p className="dr-answer-lead">{result.answer.lead.text}{refs(result.answer.lead)}</p>
        {result.answer.sections.map((section,i)=><section key={i}>
          <h3>{section.heading}</h3>
          {section.paragraphs.map((p,j)=><p key={j}>{p.text}{refs(p)}</p>)}
        </section>)}
        {result.answer.gaps.length>0&&<section aria-label="Evidence limitations"><h3>What the sources do not establish</h3>{result.answer.gaps.map((g,i)=><p key={i}>{g}</p>)}</section>}
        {result.sources.length>0&&<details className="executive-sources" open={sourcesOpen} onToggle={e=>setSourcesOpen(e.currentTarget.open)}>
          <summary>Further details and sources · {result.sources.length}</summary>
          <ol>{result.sources.map((c,i)=><li key={c.id} id={'answer-source-'+(i+1)}>
            <strong>{c.docTitle} · {c.section} · {c.pageLabel}</strong>
            <blockquote>{c.text}</blockquote>
            <a href={asset(c.pdfPath.replace(/^\./,''))+(c.pdfPath.endsWith('.pdf')?'#page='+(c.pageLabel.match(/\d+/)?.[0]||1):'')}>Open source document</a>{' · '}
            <a href={readHref(c.specPath.replace(/^\./,''),c.docNum==='primary'?c.section:undefined)}>Read in site</a>
          </li>)}</ol>
        </details>}
      </>}
    </article>}
  </div>;
}
