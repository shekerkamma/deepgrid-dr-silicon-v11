'use client';

import {Shell} from '../../shell';
import ProductPageView from '../../product-page';
import Related from '../../related';

export default function Page() {
  return (
    <Shell route="sku11">
      <div className="page-wrap"><ProductPageView slug="sku-11"/><Related route="sku11"/></div>
    </Shell>
  );
}
