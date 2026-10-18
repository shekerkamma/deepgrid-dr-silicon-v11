'use client';
/** The dashboard panel Ask DeepGrid shows beside its answer: the dashboard's own component and checked data, picked
 *  by app/data/dashboard-panels.ts from the question (phrase rules, then the semantic stage once it has loaded).
 *  Loaded only when a question is asked, so the Ask page does not carry the dashboards until then. The prose answer
 *  is unchanged and cites its sources; this panel shows the numbers behind it and links to the full dashboard. */
import {matchPanel, PANEL_HOME, DASHBOARD_NAME, type PanelSemantic} from './data/dashboard-panels';
import {PlanPanel, planAvailable, planYears} from './plan-dashboard';
import {PortfolioPanel} from './portfolio-dashboard';
import {UseCasePanel} from './use-case-dashboard';
import {url} from './routes';

export default function AskPanel({query, sem}: {query: string; sem?: PanelSemantic | null}) {
  const m = matchPanel(query, {plan: planAvailable, years: planYears, sem});
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
