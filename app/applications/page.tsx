'use client';

import {Shell} from '../shell';
import {SectionHead} from '../detail';
import ApplicationsStory from '../applications-story';
import {PRE_SILICON} from '../copy';
import Related from '../related';
import {MotionLoop} from '../motion-loop';

export default function Page() {
  return (
    <Shell route="applications">
      <section className="page-wrap">
        <SectionHead
          title="Twelve chips, five kinds of system"
          copy="DeepGrid’s portfolio by the systems it goes into. Open a chip for what it replaces and its SKU Blueprint page; DG32-LITE, the pre-silicon proof point, opens into its diagnostic story and films."
        />
        <MotionLoop name="applications-opener"
          label="Animation: one DeepGrid chip holds its place while five systems build around it in turn: a motor drive, a vehicle, a smart meter, a drone and a circuit board; then all five ring the chip"
          caption={<><strong>One chip, five system roles.</strong> Motors and drives, vehicles, grid and metering, defence and drones, and nearly every board. Concept animation, not product footage; DeepGrid silicon remains pre-silicon.</>}/>
        <ApplicationsStory/>
        <p className="disclaimer">{PRE_SILICON}</p>
      <Related route="applications"/>
      </section>
    </Shell>
  );
}
