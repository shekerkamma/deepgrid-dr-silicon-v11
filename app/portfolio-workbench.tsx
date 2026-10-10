'use client';
import {useEffect,useRef,useState} from 'react';
import {url} from './routes';
import './portfolio-workbench.css';

const jobs=[
  ['System','A representative assembly. Select a function to locate its sockets.'],
  ['Motion','SKU-1 serves the power stage. DG32 supplies checked control and the hardware fault path.'],
  ['Power','SKU-3 PMIC manages rails. SKU-6 Supervisor monitors board conditions.'],
  ['Sensing','Acquisition and RF blocks have their own physical requirements; their placement here is conceptual.'],
  ['Interfaces','SKU-5 Transceiver connects protocol logic to the electrical harness.'],
  ['DG32','Open the controller’s functional view, then follow its hardware fault path below.'],
] as const;
const chain=['MAIN executes','CHECKER follows · 2-cycle skew','Comparator detects mismatch','Sticky fault latch records cause','FAULT_N asserts low','Gate-driver disabled'];

/* Screen-aligned material overlays preserve the reference assembly across every state.
   Functional annotations are HTML, deliberately separate from physical package geometry. */
function Scene({reduced,job,step=0,opened=false,paused=false,reset=0}:{reduced:boolean;job:number;step?:number;opened?:boolean;paused?:boolean;reset?:number}){
  const host=useRef<HTMLDivElement>(null);
  const current=useRef({reduced,job,step,opened,paused,reset});
  const repaint=useRef<()=>void>(()=>{});
  useEffect(()=>{current.current={reduced,job,step,opened,paused,reset};repaint.current()},[reduced,job,step,opened,paused,reset]);
  useEffect(()=>{
    let disposed=false,clean=()=>{};
    import('three').then(T=>{
      if(disposed||!host.current)return;
      const el=host.current;
      let renderer:import('three').WebGLRenderer;
      try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.outputColorSpace=T.SRGBColorSpace;
      el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
      const scene=new T.Scene();
      const camera=new T.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.z=8;
      scene.add(new T.HemisphereLight('#fff3df','#222824',2));
      const key=new T.DirectionalLight('#ffffff',3);key.position.set(-2,4,6);scene.add(key);
      const copper=new T.MeshStandardMaterial({color:'#d6a06a',metalness:.8,roughness:.3,transparent:true,opacity:.8});
      const dark=new T.MeshStandardMaterial({color:'#171d1b',metalness:.35,roughness:.45,transparent:true,opacity:.96});
      const gold=new T.MeshStandardMaterial({color:'#e5b27d',metalness:.85,roughness:.27});
      const lid=new T.Group();lid.position.set(.38,-.04,.3);lid.rotation.set(-.45,.12,-.22);scene.add(lid);
      const cap=new T.Mesh(new T.BoxGeometry(.29,.025,.24),dark);lid.add(cap);
      const seam=new T.LineSegments(new T.EdgesGeometry(cap.geometry),new T.LineBasicMaterial({color:'#a9b3ab',transparent:true,opacity:.65}));lid.add(seam);
      const pad=new T.Mesh(new T.BoxGeometry(.28,.015,.23),gold);pad.position.set(.38,-.04,.1);pad.rotation.copy(lid.rotation);scene.add(pad);
      // This is a rotation cue on the visible motor, not a claim of simulated mechanics.
      const rotor=new T.Group();rotor.position.set(-.59,.4,.4);rotor.scale.set(1,.68,1);rotor.rotation.z=-.3;scene.add(rotor);
      const arc=new T.Mesh(new T.TorusGeometry(.105,.003,6,64,Math.PI*1.4),copper);rotor.add(arc);
      const dot=new T.Mesh(new T.SphereGeometry(.008,8,8),gold);dot.position.x=.105;rotor.add(dot);
      const bridge=new T.Group();bridge.position.set(-.18,.18,.4);scene.add(bridge);
      const lamps:Array<import('three').Mesh>=[];
      for(let i=0;i<3;i++){const mesh=new T.Mesh(new T.BoxGeometry(.027,.006,.008),new T.MeshBasicMaterial({color:'#d5ac79'}));mesh.position.set(i*.036,0,0);bridge.add(mesh);lamps.push(mesh)}
      let id=0,last=0,angle=0,speed=.75,lift=0,lastReset=0,visible=true;
      const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)repaint.current();else cancelAnimationFrame(id)},{rootMargin:'100px'});observer.observe(el);
      const resize=()=>{renderer.setSize(el.clientWidth,Math.max(1,el.clientHeight),false);repaint.current()};
      const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(el);resize();
      const frame=(time:number)=>{
        if(disposed)return;cancelAnimationFrame(id);id=0;
        const dt=Math.min((time-last)/1000,.05);last=time;
        if(!visible)return;
        const s=current.current;
        if(lastReset!==s.reset){angle=0;speed=.75;lift=s.opened?.2:0;lastReset=s.reset}
        if(!s.paused&&!s.reduced){
          speed=s.step>=6?Math.max(0,speed-dt*.24):.75;
          angle+=speed*dt;
          lift+=((s.opened?.2:0)-lift)*Math.min(1,dt*5);
        }else if(s.reduced){lift=s.opened?.2:0;angle=0;speed=s.step>=6?0:.75}
        rotor.rotation.z=-.3+angle;
        rotor.visible=!s.reduced&&!s.paused;
        lid.position.y=-.04+lift;lid.visible=s.opened;pad.visible=s.opened;
        lamps.forEach(l=>{(l.material as import('three').MeshBasicMaterial).color.set(s.step>=6?'#666e68':'#d5ac79')});
        renderer.render(scene,camera);
        if(!s.reduced&&!s.paused&&(s.step<6||speed>0||Math.abs((s.opened?.2:0)-lift)>.0001))id=requestAnimationFrame(frame);
      };
      repaint.current=()=>frame(performance.now());
      repaint.current();
      clean=()=>{repaint.current=()=>{};cancelAnimationFrame(id);observer.disconnect();sizeObserver.disconnect();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}else if(o instanceof T.LineSegments){o.geometry.dispose();(o.material as import('three').Material).dispose()}});renderer.dispose();renderer.domElement.remove()};
    }).catch(()=>{});
    return()=>{disposed=true;clean()};
  },[]);
  const disabled=step>=6;
  return <div className="v6-stage" data-region={job} data-opened={opened} data-reduced={reduced}>
    <img className="v6-assembly" src={url('/images/v6/system-workbench.webp')} width={1536} height={1024} alt="Representative assembly with visible motor, bridge power stage, controller package and electrical interfaces"/>
    <div className="v6-material-layer" ref={host}/>
    <div className="v6-region-wash" aria-hidden="true"/>
    <div className="v6-socket v6-socket-motion" data-selected={job===1}><span>Motion</span><strong>SKU-1 + DG32</strong></div>
    <div className="v6-socket v6-socket-power" data-selected={job===2}><span>Power</span><strong>SKU-3 + SKU-6</strong></div>
    <div className="v6-socket v6-socket-interface" data-selected={job===4}><span>Interfaces</span><strong>SKU-5</strong></div>
    <div className="v6-socket v6-socket-controller" data-selected={job===5||opened}><span>Controller</span><strong>DG32 · QFN-64</strong></div>
    {job===3&&<div className="v6-sensing-note">Sensing / conceptual socket<br/><small>Placement depends on signal and RF requirements.</small></div>}
    {opened&&<div className="v6-package-note">Package opened · functional view below<br/><small>Illustrative lid separation; not a physical die layout.</small></div>}
    <div className="v6-bridge-state" data-disabled={disabled}><span className="v6-state-dot"/>{disabled?'Bridge outputs disabled':'Bridge drive enabled'}{opened&&<small>{disabled?(reduced?'Motor coast → rest (static state)':'Motor coasts → illustrative rest'):'Motor rotation · illustrative'}</small>}</div>
    <span className="v6-assembly-caption">Representative system · illustrative architecture</span>
  </div>
}
export function Workbench({reduced}:{reduced:boolean}){
  const [job,setJob]=useState(0),[paused,setPaused]=useState(false);
  return <figure className="v6-workbench"><Scene reduced={reduced} job={job} paused={paused} opened={job===5}/><div className="v6-tabs" role="group" aria-label="Explore system functions">{jobs.map(([j],i)=><button key={j} aria-pressed={job===i} onClick={()=>setJob(i)}>{j}</button>)}{!reduced&&<button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Resume motion':'Pause motion'}</button>}</div><figcaption><strong>{jobs[job][0]}</strong><p>{jobs[job][1]}</p><small>Product labels identify roles, not a validated reference board. Sensing is a conceptual socket, not an assigned component in this illustration.</small></figcaption></figure>
}
// progress (0..1) comes from a pinned scroll act on the home page: the fault walks the chain as the reader scrolls,
// about 0.7 viewport heights per step. A click on the button takes over from scroll; null means no scroll act.
const stepAt=(p:number)=>p<0.08?0:Math.min(6,2+Math.floor((p-0.08)/0.84*5));
export function SafetyWorkbench({reduced,progress=null}:{reduced:boolean;progress?:number|null}){
  const [clicked,setInjected]=useState(false),[timed,setStep]=useState(0),[reset,setReset]=useState(0);
  const scrolled=progress!==null&&!clicked;
  const step=scrolled?stepAt(progress):timed,injected=scrolled?step>=2:clicked;
  useEffect(()=>{
    if(!clicked){setStep(0);return}
    if(reduced){setStep(6);return}
    setStep(2);
    const timers=[3,4,5,6].map((stage,i)=>window.setTimeout(()=>setStep(stage),450+i*550));
    return()=>timers.forEach(window.clearTimeout);
  },[clicked,reduced]);
  const resetFault=()=>{setInjected(false);setStep(0);setReset(r=>r+1)};
  return <div className="v6-safety" data-sc-verify-state={`fault-step-${step}`} data-sc-verify-hold={step===6?'true':undefined}><div><Scene reduced={reduced} job={5} step={step} opened reset={reset}/><div className="v6-functional-plate" aria-label="DG32 functional relationship, not a die layout"><span>FUNCTIONAL VIEW / NOT A DIE LAYOUT</span><div><b data-fault={step>=2}>MAIN</b><i>results →</i><b>CHECKER<small>2-cycle skew</small></b><i>compare →</i><b data-fault={step>=3}>Comparator</b></div><div><b data-fault={step>=4}>Sticky latch</b><i>→</i><b data-fault={step>=5}>FAULT_N<small>{step>=5?'LOW':'HIGH'}</small></b><i>→</i><b data-fault={step>=6}>Gate driver<small>{step>=6?'DISABLED':'ENABLED'}</small></b></div></div></div><div><span className="v6-mono">DG32 functional safety path</span><ol className="v6-fault-chain">{chain.map((x,i)=><li key={x} data-active={i<2||step>i} data-current={injected&&step===i+1}><span>0{i+1}</span>{x}<small>{i<2?(injected?'Running':'Results agree'):step>i?'Reached':'Waiting for mismatch'}</small></li>)}</ol><button className="v6-primary" onClick={clicked?resetFault:()=>setInjected(true)}>{clicked?'Reset illustrative fault':'Inject illustrative fault'}</button><p aria-live="polite">{step>=6?'FAULT_N is low. The bridge outputs are disabled; the motor loses drive and coasts to rest.':step>=5?'FAULT_N asserts low and propagates to the gate-driver enable.':step>=4?'The sticky latch records the mismatch; clearing the injected value alone does not clear the fault.':step>=3?'The comparator detects disagreement between the delayed results.':injected?'A wrong value enters MAIN. Follow the mismatch through the independent hardware path.':'Normal operation: MAIN and the delayed CHECKER results agree. Inject a mismatch to follow the response.'}</p><small>Interactive explanation, not an executable silicon simulation. The animation is slowed for reading; reported fault latency: 39 cycles · simulated. The complete causal path remains readable without WebGL or motion.</small></div></div>
}


