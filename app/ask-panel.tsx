'use client';
/** The dashboard panel Ask DeepGrid shows beside its answer: the dashboard's own component and checked data, picked
 *  by app/data/dashboard-panels.ts from the question in three stages: phrase rules and the semantic match, both
 *  instant, then, only when neither finds one, one short call to the answer service's model (POST /panel), whose
 *  pick is accepted only if it is on the panel list. Loaded only when a question is asked, so the Ask page does not
 *  carry the dashboards until then. The prose answer is unchanged and cites its sources; this panel shows the
 *  numbers behind it and links to the full dashboard. */
import {useEffect, useState} from 'react';
import {matchPanel, panelFromModel, PANEL_ENDPOINT, PANEL_HOME, DASHBOARD_NAME, type PanelMatch, type PanelSemantic} from './data/dashboard-panels';
import {PlanPanel, planAvailable, planYears} from './plan-dashboard';
import {PortfolioPanel} from './portfolio-dashboard';
import {UseCasePanel} from './use-case-dashboard';
import {url} from './routes';

/** semDone: the semantic stage has finished for this question (sem may still be null if it could not load). */
export default function AskPanel({query, sem, semDone}: {query: string; sem?: PanelSemantic | null; semDone: boolean}) {
  const opts = {plan: planAvailable, years: planYears};
  const instant = matchPanel(query, {...opts, sem});
  // A plan rule fired, but this build does not publish the plan. The question is answered (no panel), so the model
  // stage is not asked: it could only pick a plan panel this build hides, or a chart the question did not mean.
  const planOnly = !instant && !opts.plan && matchPanel(query, {plan: true, years: opts.years})?.dashboard === 'plan';
  const [model, setModel] = useState<{q: string; m: PanelMatch | null} | null>(null);
  useEffect(() => {
    if (instant || planOnly || !semDone) return;
    const ctl = new AbortController();
    fetch(PANEL_ENDPOINT, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question: query}),
      signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(20000)])})
      .then(r => (r.ok ? r.json() as Promise<{panel?: unknown}> : null))
      .then(v => setModel({q: query, m: panelFromModel(v?.panel, query, opts)}))
      .catch(() => { /* no panel: the answer stands on its own */ });
    return () => ctl.abort();
  }, [query, semDone, !!instant, planOnly]);
  const m = instant ?? (model?.q === query ? model.m : null);
  if (!m) return null;
  const home = PANEL_HOME[m.id], name = DASHBOARD_NAME[m.dashboard];
  const search = m.dashboard === 'use-cases' ? '?view=use-cases' : m.year ? '?year=' + m.year : '';
  return (
    <aside className={'ask-panel pd-root' + (m.dashboard === 'use-cases' ? ' uc-dashboard' : '')} aria-label={`From the ${name} dashboard`} data-panel={m.id} data-via={m.via}>
      <p className="ask-panel-from">From the {name} dashboard: plan targets and estimates, not results.</p>
      {m.dashboard === 'plan' ? <PlanPanel key={m.id + (m.year ?? '')} id={m.id} year={m.year}/>
        : m.dashboard === 'portfolio' ? <PortfolioPanel id={m.id} skus={m.skus}/> : <UseCasePanel id={m.id}/>}
      <a className="pd-link ask-panel-open" href={url(home.path) + search + '#' + home.hash}>Open the {name} dashboard</a>
    </aside>
  );
}
