'use client';

import {Shell} from '../../shell';
import ProductPageView from '../../product-page';
import Related from '../../related';

export default function Page() {
  return (
    <Shell route="sku10">
      <div className="page-wrap"><ProductPageView slug="sku-10"/><Related route="sku10"/></div>
    </Shell>
  );
}
