'use client';

import {useEffect, useRef, useState} from 'react';
import {Shell} from '../shell';
import {ArrowUpRight, Mail, Copy} from 'lucide-react';
import {SectionHead} from '../detail';
import {url} from '../routes';
import {CONTACT_EMAIL, enquiryRoles, motorTypes, powers, timelines, volumes, voltages} from '../company-content';
import '../contact.css';
import Related from '../related';

type Intent = 'investor' | 'partner' | 'engineering';
type Field = {id:string; label:string; type:'text'|'email'|'textarea'|'select'; options?:string[]; wide?:boolean; required?:boolean; autoComplete?:string; placeholder?:string};
const intents: {id:Intent; label:string; description:string}[] = [
  {id:'investor',label:'Investment & data room',description:'Discuss the funding plan, assumptions and evidence; request the materials needed for diligence.'},
  {id:'partner',label:'Strategic partnership',description:'Explore a market, product programme or collaboration and the evidence needed to evaluate it.'},
  {id:'engineering',label:'Engineering evaluation',description:'Describe your system and constraints so the relevant architecture and evaluation can be scoped.'},
];
const common:Field[] = [
  {id:'name',label:'Full name',type:'text',required:true,autoComplete:'name',placeholder:'Priya Raman…'},
  {id:'email',label:'Email',type:'email',required:true,autoComplete:'email',placeholder:'name@company.com…'},
  {id:'company',label:'Company or organization',type:'text',required:true,autoComplete:'organization',placeholder:'Organization name…'},
];
const technical:Field[] = [
  {id:'function',label:'Silicon function',type:'select',options:['Motion and safety','Power and supervision','Sensing and acquisition','Interfaces','Zonal or drone integration']},
  {id:'motor',label:'Motor type (if applicable)',type:'select',options:motorTypes},
  {id:'voltage',label:'Voltage range',type:'select',options:voltages},
  {id:'power',label:'Power rating',type:'select',options:powers},
  {id:'volume',label:'Annual volume target',type:'select',options:volumes},
  {id:'timeline',label:'Project timeline',type:'select',options:timelines},
  {id:'constraints',label:'Key requirements and constraints',type:'textarea',wide:true,placeholder:'Temperature range, safety standard, existing sensors…'},
];

export default function Page() {
  const [intent,setIntent] = useState<Intent>('investor');
  const [values,setValues] = useState<Record<string,string>>({});
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [status,setStatus] = useState('');
  const form = useRef<HTMLFormElement>(null);
  useEffect(()=>{
    const read=()=>{
      const params=new URLSearchParams(location.search), wanted=params.get('intent');
      setIntent(intents.some(i=>i.id===wanted)?wanted as Intent:'investor');
      const sku=params.get('sku');
      if(sku && /^(SKU-\d{1,2}|D100)$/.test(sku)) setValues(v=>({...v,application:v.application || `I would like to discuss ${sku} and the evidence available for evaluation.`}));
    };
    read(); window.addEventListener('popstate',read); return()=>window.removeEventListener('popstate',read);
  },[]);
  const choose=(id:Intent)=>{
    setIntent(id);setErrors({});setStatus('');
    const target=new URL(location.href);target.searchParams.set('intent',id);history.replaceState(null,'',target);
  };
  const fields:Field[] = [...common,
    {id:'role',label:'Your role',type:'select',options:intent==='engineering'?enquiryRoles:['Investor','Strategic partner','Founder / executive','Advisor','Other'],autoComplete:'organization-title'},
    {id:'application',label:intent==='engineering'?'Application description':'What would you like to discuss?',type:'textarea',wide:true,required:true,
      placeholder:intent==='investor'?'Funding milestones, financial assumptions or data-room materials…':intent==='partner'?'A product programme, first market or proposed collaboration…':'A 48 V BLDC drive, target control loop and qualification needs…'},
    ...(intent==='engineering'?technical:[]),
  ];
  const set=(id:string,value:string)=>{
    setValues(v=>({...v,[id]:value}));
    if(errors[id]) setErrors(previous=>{const next={...previous};delete next[id];return next;});
  };
  const body=[`Enquiry: ${intents.find(i=>i.id===intent)!.label}`,...fields.filter(f=>(values[f.id]||'').trim()).map(f=>`${f.label}:\n${values[f.id].trim()}`)].join('\n\n');
  const mailto=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('DeepGrid '+intents.find(i=>i.id===intent)!.label+(values.company?': '+values.company:''))}&body=${encodeURIComponent(body)}`;
  const submit=()=>{
    const found:Record<string,string>={};
    for(const field of fields) if(field.required && !(values[field.id]||'').trim()) found[field.id]=`${field.label} is required.`;
    if(values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) found.email='Enter an address in the form name@company.com.';
    setErrors(found);
    const first=fields.find(f=>found[f.id]);
    if(first){setStatus('Please complete the required fields.');form.current?.querySelector<HTMLElement>('#enq-'+first.id)?.focus();return;}
    setStatus('Opening your mail app. Review the request there and send it when ready.');window.location.href=mailto;
  };
  const copy=async()=>{
    try{await navigator.clipboard.writeText(CONTACT_EMAIL);setStatus('Email address copied. Paste it into your preferred mail service.');}
    catch{setStatus('Copy was unavailable. Select the email address below and copy it manually.');}
  };
  return <Shell route="contact"><section className="page-wrap">
    <SectionHead title="Start the right discussion" copy="Investment, strategic partnership or engineering evaluation: choose the conversation and the evidence you need."/>
    <div className="ij-contact-intents" role="group" aria-label="Discussion type">{intents.map(i=><button key={i.id} type="button" aria-pressed={intent===i.id} onClick={()=>choose(i.id)}>{i.label}</button>)}</div>
    <p className="ij-contact-context" role="status">{intents.find(i=>i.id===intent)!.description}</p>
    <div className="ij-contact-layout"><div>
      <h2>{intent==='investor'?'Request a discussion or data-room access':intent==='partner'?'Discuss a strategic partnership':'Scope an engineering evaluation'}</h2>
      <p className="ij-contact-note">This form prepares an email in your own mail app. Review it there before sending. No request is submitted or stored by this website; data-room access is agreed after the discussion.</p>
      <form className="dr-enq" ref={form} onSubmit={event=>{event.preventDefault();submit();}} noValidate aria-describedby="enq-status">
        {fields.map(field=>{
          const id='enq-'+field.id, error=errors[field.id];
          const props={id,name:field.id,value:values[field.id]||'',required:field.required,'aria-invalid':error?true:undefined,'aria-describedby':error?id+'-err':undefined,autoComplete:field.autoComplete||'off'};
          return <div key={field.id} className={'dr-enq-field'+(field.wide?' dr-enq-wide':'')}><label htmlFor={id}>{field.label}{field.required?<span aria-hidden="true"> *</span>:null}</label>
            {field.type==='textarea'?<textarea {...props} placeholder={field.placeholder} onChange={e=>set(field.id,e.target.value)}/>:
              field.type==='select'?<select {...props} onChange={e=>set(field.id,e.target.value)}><option value="">Select {field.label.toLowerCase()}</option>{field.options!.map(option=><option key={option}>{option}</option>)}</select>:
              <input {...props} type={field.type} inputMode={field.type==='email'?'email':undefined} spellCheck={field.type==='email'?false:undefined} placeholder={field.placeholder} onChange={e=>set(field.id,e.target.value)}/>}
            {error&&<p className="dr-enq-error" id={id+'-err'}>{error}</p>}</div>;
        })}
        <div className="dr-enq-actions"><button className="primary" type="submit"><Mail size={17} aria-hidden="true"/>Compose discussion request</button></div>
        <p id="enq-status" className="dr-enq-note" aria-live="polite">{status||'Fields marked * are required. The button opens your mail app; it does not send the request.'}</p>
      </form>
    </div><aside className="ij-contact-aside" aria-label="Prepare for the discussion"><h2>Three questions make<br/>the first call useful.</h2><ul><li>Which first market or product interests you?</li><li>Which funding assumptions need reconciliation?</li><li>What evidence would unblock your next decision?</li></ul>
      <a className="ij-link" href={url('/portfolio/brief')}>Review the investment brief <ArrowUpRight size={16} aria-hidden="true"/></a>
      <a className="ij-link" href={url('/evidence')}>Check evidence & gaps <ArrowUpRight size={16} aria-hidden="true"/></a>
      <div className="ij-contact-direct"><h3>Prefer to write directly?</h3><a className="text-link" href={'mailto:'+CONTACT_EMAIL}>{CONTACT_EMAIL}</a><button type="button" className="uc-control" onClick={copy}><Copy size={16} aria-hidden="true"/>Copy email address</button><p>No mail app configured? Copy the address into the mail service you use.</p></div>
    </aside></div>
    {intent==='engineering' && <Related route="contact"/>}
  </section></Shell>;
}
