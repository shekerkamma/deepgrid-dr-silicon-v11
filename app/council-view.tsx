'use client';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { A2uiSurface } from '@a2ui/react/v0_9';
import { collectEvidence } from './data/answer-evidence';
import { answerToA2ui } from './data/a2ui-answer';
import { answerCatalog } from './a2ui-answer-catalog';
import { composeAnswer, type AnswerResult } from './data/answer-generator';
import { getSemantic } from './data/semantic';
import type { PanelSemantic } from './data/dashboard-panels';
import './executive-story.css';
// The dashboards load only when a question is asked (app/ask-panel.tsx).
const AskPanel = lazy(() => import('./ask-panel'));
interface GroundedAnswerViewProps { query: string; onSelectQuery: (q: string) => void; go: (hash: string) => void; }
export default function GroundedAnswerView({query}: GroundedAnswerViewProps) {
  const [ready,setReady]=useState(false);
  const [state,setState]=useState<{q:string;result?:AnswerResult;error?:string;pending?:boolean;semantic?:boolean}>({q:''});
  const [retry,setRetry]=useState(0);
  // the semantic stage of the dashboard-panel match, from the same embedding the answer uses
  const [panelSem,setPanelSem]=useState<{q:string;sem:PanelSemantic|null}>({q:'',sem:null});
  // The 26 MB embedding model now loads on the first focus of the search box (ask.tsx) or the first
  // submitted query (below), not on page open: opening /ask/ downloaded it for every visitor.
  useEffect(()=>{setReady(true);},[]);
  useEffect(()=>{
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
        setPanelSem({q:query,sem:scores?.panels??null});
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
  // The checked answer is drawn as an A2UI surface from the closed catalog in app/a2ui-answer-catalog.tsx.
  // One processor per answer, so a new question starts from a clean surface (and a closed sources list).
  const surface=useMemo(()=>{
    if(!result)return undefined;
    try {
      const processor=new MessageProcessor([answerCatalog]);
      processor.processMessages(answerToA2ui(result.answer,result.sources,'answer'));
      return processor.model.getSurface('answer');
    } catch { return undefined; } // a message the catalog rejects: show the retry notice, never partial UI
  },[result]);
  return <div className="dr-grounded-answer-wrap executive-answer" data-ready={ready} data-semantic={current?.semantic?'on':'off'} data-answerable={result?.answer.answerable} data-model={result?.model} aria-busy={!!current?.pending}>
    {query&&<article className="dr-answer-card answer-essay" aria-label="Answer">
      <h2 className="dr-contextual-title">{query}</h2>
      {current?.pending&&<p role="status">Reading the source material and composing your answer…</p>}
      {current?.error&&<div role="alert"><p>{current.error}</p><button type="button" className="ask-submit" onClick={()=>setRetry(n=>n+1)}>Retry answer</button></div>}
      {result&&(surface?<A2uiSurface surface={surface}/>:<p role="alert">The answer could not be displayed. Please retry.</p>)}
    </article>}
    {query&&<Suspense fallback={null}><AskPanel query={query} sem={panelSem.q===query?panelSem.sem:null} semDone={panelSem.q===query}/></Suspense>}
  </div>;
}
