'use client';

import {Shell} from '../../shell';
import {SectionHead} from '../../detail';
import {BriefView} from '../../brief-view';
import Related from '../../related';

/** Investor and buyer brief: the tranche-1 reading of the Blueprint and the model, and six buyer questions answered. */
export default function Page() {
  return (
    <Shell route="brief">
      <section className="page-wrap">
        <SectionHead title="Investor and buyer brief" copy="What tranche 1 buys, how the two plans relate, and what a buyer can expect today."/>
        <BriefView/>
        <Related route="brief"/>
      </section>
    </Shell>
  );
}
