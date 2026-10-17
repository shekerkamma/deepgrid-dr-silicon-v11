import {url} from './routes';

type Kind='dg32'|'portfolio'|'fleet'|'driver'|'robotics'|'truck'|'defence'|'grid'|'power';
const images:Record<Kind,{src:string;w:number;h:number;name:string;alt:string;href:string;origin:string}>={
 dg32:{src:'/images/deepgrid-brand/dg32-control',w:1536,h:1024,name:'DG32 control and hardware safety',alt:'Illustrative DeepGrid DG32 controller board with an external power stage and motor connector',href:'/products/sku-4',origin:'New DeepGrid product concept'},
 portfolio:{src:'/images/deepgrid-brand/portfolio-systems',w:1536,h:1024,name:'Motion, metering, sensing and zonal interfaces',alt:'DeepGrid portfolio concept with separate motor-drive, metering, radar and zonal-interface assemblies',href:'/products',origin:'New DeepGrid portfolio concept'},
 fleet:{src:'/images/deepgrid-brand/fleet-evaluation',w:1536,h:864,name:'Commercial vehicle evaluation',alt:'Fleet trucks on a highway at night in an illustrative commercial vehicle application scene',href:'/use-cases/vehicles',origin:'DeepGrid commercial-fleet GTM deck'},
 driver:{src:'/images/deepgrid-brand/driver-assistance',w:1536,h:864,name:'Sensing and alerts at the vehicle',alt:'Illustrative truck cab with driver-assistance display and sensing equipment',href:'/use-cases/vehicles',origin:'DeepGrid commercial-fleet GTM deck'},
 robotics:{src:'/media/deepgrid_robotics.jpg',w:1376,h:768,name:'Industrial motion and autonomous equipment',alt:'DeepGrid application concept of an autonomous forklift and its sensing field in a warehouse',href:'/use-cases/motors',origin:'Existing DeepGrid application artwork'},
 truck:{src:'/media/deepgrid_truck.jpg',w:1376,h:768,name:'Vehicle power, sensing and communications',alt:'DeepGrid-branded truck and camera-mirror display in an illustrative vehicle scene',href:'/use-cases/vehicles',origin:'Existing DeepGrid application artwork'},
 defence:{src:'/media/deepgrid_defence.jpg',w:1376,h:768,name:'Defence and screened equipment',alt:'Illustrative DeepGrid surveillance equipment and operator display',href:'/use-cases/defence',origin:'Existing DeepGrid application artwork'},
 grid:{src:'/images/scenes/grid-meters-1536.webp',w:1536,h:1024,name:'Energy measurement and tamper monitoring',alt:'Illustrative smart meters and a metrology board for grid applications',href:'/use-cases/grid',origin:'Existing metering concept'},
 power:{src:'/images/scenes/boards-supervisor-1536.webp',w:1536,h:1024,name:'Board power and supply supervision',alt:'Illustrative controller board with regulators and a voltage supervisor',href:'/use-cases/boards',origin:'Existing power-supervision concept'},
};
export function BrandImage({kind,priority=false,className=''}: {kind:Kind;priority?:boolean;className?:string}){
 const x=images[kind],responsive=x.src.startsWith('/images/deepgrid-brand/');
 return <figure className={'dg-brand-image dg-engineering-figure '+className}><a href={url(x.href)} aria-label={'Review '+x.name}>
  <img src={url(x.src+(responsive?'.webp':''))} srcSet={responsive?`${url(x.src+'-768.webp')} 768w, ${url(x.src+'.webp')} 1536w`:undefined} sizes="(max-width: 800px) 100vw, 70vw" alt={x.alt} width={x.w} height={x.h} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async"/>
 </a><figcaption><strong>{x.name}.</strong> {x.origin} · concept illustration, not a product photograph or deployment evidence. DeepGrid silicon remains pre-silicon.</figcaption></figure>;
}
export function BrandGallery({investor=false}: {investor?:boolean}){
 const kinds:Kind[]=investor?['portfolio','truck','fleet']:['robotics','truck','driver'];
 return <section className="dg-brand-gallery" aria-label="DeepGrid product and application concepts"><header><h2>{investor?'DeepGrid chips earn revenue inside equipment makers’ systems.':'Control, sensing and integration in the customer system.'}</h2><p>Explore the proposed product roles, then examine their architecture, validation and qualification requirements.</p></header><div className="dg-brand-gallery-grid">{kinds.map(kind=><BrandImage key={kind} kind={kind}/>)}</div></section>;
}
export function ProductApplicationImage({sku}: {sku:string}){
 const kinds:Record<string,Kind>={'sku-1':'robotics','sku-2':'grid','sku-3':'defence','sku-4':'dg32','sku-5':'truck','sku-6':'power','sku-7':'truck','sku-8':'driver','sku-9':'truck','sku-10':'robotics','sku-11':'truck','d100':'defence'};
 const kind=kinds[sku.toLowerCase()];return kind?<BrandImage kind={kind}/>:null;
}
