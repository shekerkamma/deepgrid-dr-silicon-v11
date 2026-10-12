'use client';

import {Shell} from '../shell';
import {SectionHead} from '../detail';
import {PlanDashboard} from '../plan-dashboard';
import Related from '../related';

/** Business-plan dashboard. Plan figures render only in the internal (droplet) build; see app/plan-dashboard.tsx. */
export default function Page() {
  return (
    <Shell route="plan">
      <section className="page-wrap">
        <SectionHead title="Business plan" copy="The company model by segment and year."/>
        <PlanDashboard/>
        <Related route="plan"/>
      </section>
    </Shell>
  );
}
