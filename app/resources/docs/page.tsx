'use client';

import {Shell} from '../../shell';
import CompanyPageView from '../../company-page';
import Related from '../../related';
import {pageById} from '../../company-pages';
import {ArchitectureReferences} from '../../engineering-visuals';

export default function Page() {
  return (
    <Shell route="docs">
      <CompanyPageView page={pageById('docs')!}/>
      <div className="page-wrap"><ArchitectureReferences/><Related route="docs"/></div>
    </Shell>
  );
}
