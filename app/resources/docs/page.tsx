'use client';

import {Shell} from '../../shell';
import CompanyPageView from '../../company-page';
import Related from '../../related';
import {pageById} from '../../company-pages';
import {BrandGallery} from '../../brand-imagery';

export default function Page() {
  return (
    <Shell route="docs">
      <CompanyPageView page={pageById('docs')!}/>
      <div className="page-wrap"><BrandGallery/><Related route="docs"/></div>
    </Shell>
  );
}
