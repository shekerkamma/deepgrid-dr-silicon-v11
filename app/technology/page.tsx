'use client';

import {useState} from 'react';
import {Shell, useReduced, useQuery, useNav} from '../shell';
import {SectionHead} from '../detail';
import {blocks} from '../content';
import {PRE_SILICON} from '../copy';
import Architecture from '../architecture';
import {FmaxChart} from '../fmax-chart';
import Related from '../related';
import {BrandImage} from '../brand-imagery';
import {FilmPlayer} from '../film-player';
import {url} from '../routes';

export default function Page() {
  const reduced = useReduced();
  const {go} = useNav();
  const [params, update] = useQuery();
  const [exploded, setExploded] = useState(false);
  const [reducedLocal, setReducedLocal] = useState(reduced);
  const block = Math.max(0, Math.min(blocks.length - 1, Number(params.get('block')) || 0));
  return (
    <Shell route="technology">
      <section className="page-wrap">
        <SectionHead
          title="Two chips, one frozen safety core"
          copy="DG32-LITE is the lockstep motor-control SoC; DG32-2DOM adds an INT8 attention engine on its own clock. Choose one for its diagram, every block and why it exists, the constraints that shaped it and how data moves through it, or see the die as recorded for tape-in."
          visual={<BrandImage kind="dg32" priority/>}
        />
        <figure className="st-loop">
          <FilmPlayer film={{id: 'technology-reel', title: 'Two chips, one frozen safety core', sub: 'The platform in seven beats, narrated', length: '0:47',
            src: url('/media/technology-reel.mp4'), poster: url('/media/technology-reel-poster.jpg'), vtt: url('/media/technology-reel.vtt')}}/>
          <figcaption className="st-loop-cap"><strong>Two chips, one frozen safety core · 0:47, narrated.</strong> Lockstep, the fault path, timing closure and the control-loop budget. Each figure carries its basis on screen: simulated, post-route or analytic. Concept animation; DeepGrid silicon remains pre-silicon.</figcaption>
        </figure>
        <Architecture
          chip={params.get('chip') || 'lite'}
          block={block}
          reduced={reducedLocal}
          setReduced={setReducedLocal}
          exploded={exploded}
          setExploded={setExploded}
          update={update}
          go={go}
        />
        <FmaxChart/>
        <p className="disclaimer">{PRE_SILICON}</p>
      <Related route="technology"/>
      </section>
    </Shell>
  );
}
