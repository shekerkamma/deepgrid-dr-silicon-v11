'use client';

import {Shell} from '../shell';
import {SectionHead} from '../detail';
import {PortfolioDashboard} from '../portfolio-dashboard';
import Related from '../related';
import {DashboardNav} from '../dashboard-nav';
import {BrandGallery} from '../brand-imagery';

/** SKU portfolio dashboard: every chip's readiness, plan line, ramp, approvals and cost, from the SKU Blueprint. */
export default function Page() {
  return (
    <Shell route="portfolio">
      <section className="page-wrap dashboard-page">
        <SectionHead title="SKU portfolio" copy="Eleven chips: where each stands, what it can earn, and what it costs to bring to market."/>
        <DashboardNav current="portfolio"/>
        <PortfolioDashboard/>
        <BrandGallery investor/>
        <Related route="portfolio"/>
      </section>
    </Shell>
  );
}
