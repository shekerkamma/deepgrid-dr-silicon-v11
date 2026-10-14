'use client';

import {Shell} from '../../shell';
import {SectionHead} from '../../detail';
import {BriefView} from '../../brief-view';
import Related from '../../related';
import {DashboardNav} from '../../dashboard-nav';
import {DiscussionClose} from '../../investor-journey';
import {BrandGallery} from '../../brand-imagery';

/** Investor and buyer brief: the tranche-1 reading of the Blueprint and the model, and six buyer questions answered. */
export default function Page() {
  return (
    <Shell route="brief">
      <section className="page-wrap dashboard-page">
        <SectionHead title="Investor and buyer brief" copy="What tranche 1 buys, how the two plans relate, and what a buyer can expect today."/>
        <DashboardNav current="brief"/>
        <BriefView/>
        <BrandGallery investor/>
        <DiscussionClose compact/>
        <Related route="brief"/>
      </section>
    </Shell>
  );
}
