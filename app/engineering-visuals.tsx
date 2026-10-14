import {url} from './routes';

const dimensions: Record<string,[number,number]> = {
 'sku-1':[1513,885], 'sku-2':[1513,699], 'sku-3':[1513,903],
 'sku-4':[1518,1045], 'sku-5':[1513,733], 'sku-6':[1513,841],
 'sku-7':[1513,763], 'sku-8':[1513,921], 'sku-9':[1513,883],
 'd100':[1553,945],
};

export function ArchitectureImage({sku,name}: {sku:string;name:string}) {
 const slug=sku.toLowerCase();
 if(!dimensions[slug])return null;
 const src=slug==='sku-4'?'/images/v11/dg32-lite-architecture.svg':`/diagrams/${slug}-architecture.svg`;
 const [width,height]=dimensions[slug]||[1513,885];
 return <figure className="dg-engineering-figure"><a href={url('/products/'+slug)} aria-label={'Review '+name+' architecture'}>
  <img src={url(src)} alt={name+' system architecture and functional interfaces'} width={width} height={height} loading="lazy" decoding="async"/>
 </a><figcaption>{name} · original DeepGrid architecture. Pre-silicon design; qualification remains ahead.</figcaption></figure>;
}

export function LayoutEvidence({compact=false}: {compact?:boolean}) {
 return <section className={'dg-layout-evidence'+(compact?' dg-layout-compact':'')} aria-label="DG32 physical design">
  <div><h2>DG32 physical design.<br/>Silicon validation comes next.</h2><p>The DeepGrid Silicon Engine capture shows the DG32-LITE layout. It records pre-silicon design work; manufactured-silicon measurements and product qualification are separate milestones.</p>
   <a className="ij-link" href={url('/images/v11/dg32-layout.png')} target="_blank" rel="noreferrer">Inspect the complete layout image</a>
  </div><figure className="dg-engineering-figure"><a href={url('/images/v11/dg32-layout.png')} target="_blank" rel="noreferrer" aria-label="Open full-size DG32-LITE layout capture">
   <img src={url('/images/v11/dg32-layout.png')} alt="DG32-LITE layout capture showing routed interconnect and functional regions in the DeepGrid Silicon Engine" width={1140} height={740} loading="lazy" decoding="async"/>
  </a><figcaption>Original DeepGrid layout capture · pre-silicon physical design, not a product photograph.</figcaption></figure>
 </section>;
}

export function ArchitectureReferences({investor=false}: {investor?:boolean}) {
 return <section className="dg-architecture-references" aria-label="DeepGrid architecture references">
  <header><h2>{investor?'Product architecture defines the investment scope.':'Review the architecture behind each product requirement.'}</h2><p>{investor?'Three distinct engineering programmes: motor control, safety supervision and radar sensing. Their diagrams describe intended functions, not qualified or shipping products.':'Open an original DeepGrid diagram, then examine its interfaces, operating limits and qualification requirements.'}</p></header>
  <div className="dg-architecture-reference-grid">
   <ArchitectureImage sku="SKU-1" name="BLDC motor control"/>
   <ArchitectureImage sku="SKU-4" name="DG32 hardware safety"/>
   <ArchitectureImage sku="SKU-7" name="77 GHz radar sensing"/>
  </div>
 </section>;
}
