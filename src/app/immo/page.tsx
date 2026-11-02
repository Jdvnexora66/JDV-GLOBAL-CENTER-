'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Bell, Building2, CalendarDays, ChartNoAxesCombined, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Globe2, Handshake, Home, LayoutDashboard, LogOut, Menu, MessageCircle, Search, Settings, ShieldCheck, Users, X, BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Property = {id:string;title:string;city:string|null;price:number;transaction_type:string;property_status:string;created_at:string;property_type_id:string};
type Project = {id:string;name:string;city:string|null;project_status:string;price_from:number|null;created_at:string};
type ActivityItem = {id:string;title:string;detail:string;at:string;kind:'property'|'reservation'|'appointment'};
const nav = [
  {label:'Biens immobiliers',href:'/immo/biens',icon:Home},{label:'Agences',href:'/immo/partenaires',icon:Building2},
  {label:'Agents',href:'/immo/partenaires',icon:Users},{label:'Projets',href:'/immo/construction',icon:BriefcaseBusiness},
  {label:'Réservations',href:'/immo/reservations',icon:CalendarDays},{label:'Locataires & baux',href:'/immo/locataires',icon:Users},
];
const extras = [
  {label:'Gestion globale',href:'/immo/gestion',icon:ClipboardList},{label:'Marketing & Croissance',href:'/immo/partenaires',icon:ChartNoAxesCombined},
  {label:'Paramètres',href:'/settings',icon:Settings},{label:'Sécurité',href:'/settings',icon:ShieldCheck},
  {label:'Rapports & Analyses',href:'/immo/gestion',icon:Activity},{label:'Aide & Support',href:'/help',icon:CircleHelp},
];
const number = (n:number) => new Intl.NumberFormat('fr-FR').format(n);
const ago = (value:string) => { const m=Math.max(1,Math.floor((Date.now()-new Date(value).getTime())/60000)); return m<60?'Il y a '+m+' min':m<1440?'Il y a '+Math.floor(m/60)+' h':'Il y a '+Math.floor(m/1440)+' j'; };

export default function ImmoPage() {
  const {user,loading}=useAuth();
  const supabase=useMemo(()=>createClient(),[]);
  const [menuOpen,setMenuOpen]=useState(false),[search,setSearch]=useState(''),[busy,setBusy]=useState(true),[error,setError]=useState('');
  const [properties,setProperties]=useState<Property[]>([]),[projects,setProjects]=useState<Project[]>([]),[activities,setActivities]=useState<ActivityItem[]>([]);
  const [typeNames,setTypeNames]=useState<Record<string,string>>({});
  const [metrics,setMetrics]=useState({properties:0,reservations:0,requests:0,agencies:0,appointments:0});
  const [period,setPeriod]=useState<'7j'|'30j'|'90j'|'1an'>('30j');
  const [series,setSeries]=useState<Array<{label:string;properties:number;reservations:number;visits:number}>>([]);

  const load=useCallback(async()=>{
    setBusy(true);setError('');
    const monthStart=new Date();monthStart.setDate(1);monthStart.setHours(0,0,0,0);
    const [pc,rc,ac,vc,pr,proj,rr,ar,reqCount,tr]=await Promise.all([
      supabase.from('immo_properties').select('id',{count:'exact',head:true}).eq('property_status','published'),
      supabase.from('immo_reservations').select('id',{count:'exact',head:true}).gte('created_at',monthStart.toISOString()),
      supabase.from('immo_agencies').select('id',{count:'exact',head:true}),
      supabase.from('immo_appointments').select('id',{count:'exact',head:true}),
      supabase.from('immo_properties').select('id,title,city,price,transaction_type,property_status,created_at,property_type_id').order('created_at',{ascending:false}).limit(500),
      supabase.from('immo_projects').select('id,name,city,project_status,price_from,created_at').order('created_at',{ascending:false}).limit(6),
      supabase.from('immo_reservations').select('id,client_user_id,reservation_status,created_at').order('created_at',{ascending:false}).limit(500),
      supabase.from('immo_appointments').select('id,scheduled_at,appointment_status,created_at').order('created_at',{ascending:false}).limit(500),
      supabase.from('immo_requests').select('id',{count:'exact',head:true}),
      supabase.from('immo_property_types').select('id,name').eq('is_active',true),
    ]);
    if(pc.error)setError(pc.error.message);
    if(rc.error)setError(v=>v||rc.error!.message);
    if(ac.error)setError(v=>v||ac.error!.message);
    if(vc.error)setError(v=>v||vc.error!.message);
    if(pr.error)setError(v=>v||pr.error!.message);
    if(proj.error)setError(v=>v||proj.error!.message);
    if(rr.error)setError(v=>v||rr.error!.message);
    if(ar.error)setError(v=>v||ar.error!.message);
    if(reqCount.error)setError(v=>v||reqCount.error!.message);
    const p=(pr.data??[]) as Property[], projectsData=(proj.data??[]) as Project[], reservations=rr.data??[], appointments=ar.data??[];
    setProperties(p);setProjects(projectsData);
    setMetrics({properties:pc.count??0,reservations:rc.count??0,requests:reqCount.count??0,agencies:ac.count??0,appointments:vc.count??0});
    const names:Record<string,string>={};(tr.data??[]).forEach((r:any)=>{names[r.id]=r.name;});setTypeNames(names);
    const feed:ActivityItem[]=[
      ...p.slice(0,12).map(r=>({id:'p'+r.id,title:'Nouveau bien ajouté',detail:r.title+(r.city?' · '+r.city:''),at:r.created_at,kind:'property' as const})),
      ...reservations.slice(0,12).map((r:any)=>({id:'r'+r.id,title:r.reservation_status==='confirmed'?'Réservation confirmée':'Nouvelle réservation',detail:'Dossier de réservation',at:r.created_at,kind:'reservation' as const})),
      ...appointments.slice(0,12).map((r:any)=>({id:'a'+r.id,title:'Visite immobilière',detail:r.appointment_status==='confirmed'?'Visite confirmée':'Demande de visite',at:r.created_at,kind:'appointment' as const})),
    ].filter(x=>x.at).sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()).slice(0,5);
    setActivities(feed);
    const publishedProperties=p.filter(row=>row.property_status==='published');
    const span=period==='7j'?7:period==='30j'?30:period==='90j'?90:365, n=period==='7j'?7:period==='30j'?10:12, now=new Date();
    setSeries(Array.from({length:n},(_,i)=>{
      const d=new Date(now);d.setDate(now.getDate()-span+1+Math.round(i*(span-1)/(n-1)));const start=new Date(d);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+Math.max(1,Math.ceil(span/n)));
      const count=(rows:any[],field:string)=>rows.filter(r=>{const dt=new Date(r[field]);return dt>=start&&dt<end;}).length;
      return {label:d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}),properties:count(publishedProperties,'created_at'),reservations:count(reservations,'created_at'),visits:count(appointments,'created_at')};
    }));
    setBusy(false);
  },[supabase,period]);
  useEffect(()=>{if(!loading)void load();},[loading,load]);

  const recentProperties=properties.filter(p=>(p.title+' '+(p.city||'')).toLowerCase().includes(search.toLowerCase())).slice(0,3);
  const distribution=Object.entries(properties.reduce((acc:Record<string,number>,p)=>{const name=typeNames[p.property_type_id]||'Autres biens';acc[name]=(acc[name]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const total=distribution.reduce((s,x)=>s+x[1],0)||1,max=Math.max(1,...series.flatMap(s=>[s.properties,s.reservations,s.visits]));
  const line=(key:'properties'|'reservations'|'visits')=>series.map((s,i)=>((i?'L':'M')+(32+i*520/Math.max(1,series.length-1)).toFixed(1)+' '+(170-s[key]/max*145).toFixed(1))).join(' ');
  const initials=(user?.email||'JDV').slice(0,2).toUpperCase();

  return <div className="min-h-screen bg-[#f3f6fc] text-[#101b35]"><div className="flex min-h-screen">
    <aside className={(menuOpen?'fixed inset-y-0 left-0 z-50 flex ':'hidden')+'w-[240px] shrink-0 flex-col bg-[#071a37] text-white lg:sticky lg:top-0 lg:flex lg:h-screen'}>
      <div className="flex h-[88px] items-center gap-3 border-b border-white/10 px-7"><div className="grid h-11 w-12 place-items-center text-[#ffd12d]"><Building2 size={38}/></div><div className="leading-tight"><div className="text-[23px] font-black">JDV</div><div className="text-[11px] font-bold tracking-[.08em]">GLOBAL CENTER</div></div><button onClick={()=>setMenuOpen(false)} className="ml-auto lg:hidden"><X size={19}/></button></div>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#dce9fb] to-[#7697c9] text-sm font-black text-[#0b1d3a]">{initials}</div><div className="min-w-0"><div className="truncate text-sm font-bold">{user?.user_metadata?.full_name||user?.email?.split('@')[0]||'Espace JDV'}</div><div className="text-xs text-blue-100/70">Concepteur</div><div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-100/80"><span className="h-2 w-2 rounded-full bg-emerald-400"/>En ligne</div></div><ChevronDown size={14} className="ml-auto"/></div>
      <nav className="flex-1 overflow-y-auto px-3 py-4"><Link href="/immo" className="mb-3 flex items-center gap-3 rounded-xl bg-[#0865f5] px-4 py-3 text-sm font-bold"><LayoutDashboard size={18}/>Tableau de bord</Link><div className="mb-2 flex items-center justify-between px-3 pt-3 text-[11px] font-bold uppercase tracking-[.15em] text-blue-100/50">JDV IMO <ChevronDown size={14}/></div>
        {nav.map(({label,href,icon:Icon})=><Link key={label} href={href} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-blue-50/90 hover:bg-white/10"><Icon size={16}/>{label}</Link>)}<div className="my-3 border-t border-white/10"/>{extras.map(({label,href,icon:Icon})=><Link key={label} href={href} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-blue-50/85 hover:bg-white/10"><Icon size={16}/>{label}<ChevronRight size={13} className="ml-auto opacity-50"/></Link>)}
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#123c79] to-[#06132c] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-black text-[#ffd34e]"><Building2 size={18}/>JDV IMO</div><p className="text-sm font-semibold leading-5">Construire aujourd’hui le cadre de demain</p><Link href="/immo/construction" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ffc21a] px-3 py-2 text-xs font-bold text-[#10203c]">Découvrir plus <ArrowRight size={13}/></Link></div>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-[70px] items-center gap-4 bg-[#082653] px-4 text-white shadow-md sm:px-7"><button onClick={()=>setMenuOpen(true)} className="rounded-lg p-2 hover:bg-white/10 lg:hidden"><Menu size={22}/></button><div className="hidden rounded-lg p-2 lg:block"><Menu size={22}/></div>
 fix/jdv-immo-dashboard-data-search-2026-11-02
        <form onSubmit={e=>{e.preventDefault();window.location.href='/immo/biens'+(search.trim()?'?q='+encodeURIComponent(search.trim()):'');}} className="flex h-11 max-w-[580px] flex-1 items-center gap-3 rounded-2xl bg-white/10 px-4"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un bien, un client, une agence..." className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-blue-100/80"/></form>
=======
        <form onSubmit={e=>{e.preventDefault();window.location.href='/immo/biens?q='+encodeURIComponent(search.trim());}} className="flex h-11 max-w-[580px] flex-1 items-center gap-3 rounded-2xl bg-white/10 px-4"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un bien, un client, une agence..." className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-blue-100/80"/></form>
 supabase-sync-2026-09-24
        <div className="ml-auto flex items-center gap-2 sm:gap-5"><button className="hidden items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold sm:flex"><Globe2 size={19}/> Français <ChevronDown size={14}/></button><Link href="/notifications" className="relative rounded-full p-2 hover:bg-white/10"><Bell size={21}/><span className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#ef2448] text-[10px] font-bold">3</span></Link><Link href="/settings" className="rounded-full p-2 hover:bg-white/10"><Settings size={21}/></Link><button onClick={async()=>{await supabase.auth.signOut();window.location.href='/immo';}} className="rounded-full p-2 hover:bg-white/10" aria-label="Déconnexion"><LogOut size={21}/></button></div>
      </header>
      <div className="p-3 sm:p-5 lg:p-4">
        <section className="relative flex min-h-[210px] items-center overflow-hidden bg-[#0755b8] px-6 py-8 text-white sm:min-h-[215px] sm:rounded-2xl sm:px-8 lg:px-9"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"linear-gradient(90deg,rgba(2,24,57,.92),rgba(2,53,120,.55) 48%,rgba(2,53,120,.05)),url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85')"}}/><div className="relative z-10"><div className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">JDV IMO</div><p className="mt-1 text-lg font-semibold leading-snug sm:text-xl">Votre plateforme immobilière intelligente<br className="hidden sm:block"/> au sein de JDV Global Center</p><Link href="/immo/biens" className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#08c65b] px-5 py-2.5 text-sm font-bold text-white">Gérer vos biens <ArrowRight size={17}/></Link></div><div className="relative z-10 ml-auto hidden pr-4 text-right xl:block"><div className="font-serif text-2xl italic">Investir · Vivre · Réussir</div><div className="ml-auto mt-2 h-1 w-44 -rotate-2 rounded-full bg-[#ffd12d]"/></div></section>

        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {[
            {label:'Biens immobiliers',value:metrics.properties,detail:'Biens publiés',icon:Home,color:'bg-blue-600',border:'border-blue-100'},
            {label:'Réservations ce mois',value:metrics.reservations,detail:'Total enregistré',icon:CalendarDays,color:'bg-emerald-500',border:'border-emerald-100'},
 fix/jdv-immo-dashboard-data-search-2026-11-02
            {label:'Demandes clients',value:metrics.requests,detail:'Demandes enregistrées',icon:Users,color:'bg-violet-600',border:'border-violet-100'},
=======
            {label:'Demandeurs IMO',value:metrics.clients,detail:'Comptes sur les dossiers récents',icon:Users,color:'bg-violet-600',border:'border-violet-100'},
 supabase-sync-2026-09-24
            {label:'Agences partenaires',value:metrics.agencies,detail:'Agences enregistrées',icon:Handshake,color:'bg-orange-500',border:'border-orange-100'},
          ].map(({label,value,detail,icon:Icon,color,border})=><div key={label} className={'flex min-h-[96px] items-center gap-4 rounded-xl border bg-white px-4 py-4 shadow-sm '+border}><div className={'grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-lg '+color}><Icon size={27}/></div><div className="min-w-0"><div className="text-sm font-bold">{label}</div><div className="mt-1 text-2xl font-black tabular-nums">{busy?'—':number(value)}</div><div className="text-[10px] text-slate-500">{detail}</div></div></div>)}
        </section>
        {error&&<div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Certaines données n’ont pas pu être chargées : {error}</div>}

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,.95fr)_minmax(265px,.9fr)]">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-extrabold"><ChartNoAxesCombined size={20} className="text-blue-600"/>Évolution des activités IMO</h2><div className="flex rounded-xl border border-slate-200 p-0.5 text-xs">{(['7j','30j','90j','1an'] as const).map(x=><button key={x} onClick={()=>setPeriod(x)} className={'rounded-lg px-2.5 py-1.5 font-semibold '+(period===x?'bg-blue-600 text-white':'text-slate-600')}>{x}</button>)}</div></div>
            <div className="mt-4 flex flex-wrap justify-end gap-4 text-xs"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-blue-600"/>Biens publiés</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500"/>Réservations</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-600"/>Visites</span></div>
            <svg viewBox="0 0 580 225" className="mt-2 h-[205px] w-full" role="img" aria-label="Évolution des activités immobilières">{[25,65,105,145,185].map(y=><g key={y}><line x1="32" x2="558" y1={y} y2={y} stroke="#e6edf8"/><text x="22" y={y+4} textAnchor="end" fill="#64748b" fontSize="10">{Math.round((185-y)/160*max)}</text></g>)}{series.length>1&&<><path d={line('properties')} fill="none" stroke="#0865f5" strokeWidth="3" strokeLinecap="round"/><path d={line('reservations')} fill="none" stroke="#08bd63" strokeWidth="3" strokeLinecap="round"/><path d={line('visits')} fill="none" stroke="#8b2be8" strokeWidth="3" strokeLinecap="round"/></>}<text x="32" y="213" fill="#64748b" fontSize="10">{series[0]?.label||'—'}</text><text x="290" y="213" textAnchor="middle" fill="#64748b" fontSize="10">{series[Math.floor(series.length/2)]?.label||'—'}</text><text x="558" y="213" textAnchor="end" fill="#64748b" fontSize="10">{series[series.length-1]?.label||'—'}</text></svg>
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">{busy?'Actualisation…':'Activité observée dans Supabase'} <button onClick={()=>void load()} className="float-right font-semibold text-blue-600">Actualiser</button></div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-base font-extrabold">Répartition par type de bien</h2><div className="mt-6 flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row"><div className="relative h-36 w-36 shrink-0 rounded-full" style={{background:distribution.length?'conic-gradient(#0865f5 0 '+((distribution[0]?.[1]||0)/total*100)+'%,#08bd63 '+((distribution[0]?.[1]||0)/total*100)+'% '+(((distribution[0]?.[1]||0)+(distribution[1]?.[1]||0))/total*100)+'%,#ff7b1a '+(((distribution[0]?.[1]||0)+(distribution[1]?.[1]||0))/total*100)+'% '+(((distribution[0]?.[1]||0)+(distribution[1]?.[1]||0)+(distribution[2]?.[1]||0))/total*100)+'%,#8b2be8 '+(((distribution[0]?.[1]||0)+(distribution[1]?.[1]||0)+(distribution[2]?.[1]||0))/total*100)+'% 100%)':'conic-gradient(#e2e8f0 0 100%)'}}><div className="absolute inset-[26%] grid place-items-center rounded-full bg-white"><Home size={30} className="text-[#153a83]"/></div></div><div className="w-full space-y-3">{distribution.length?distribution.map(([name,count],i)=><div key={name} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2"><i className={'h-2.5 w-2.5 shrink-0 rounded-full '+['bg-blue-600','bg-emerald-500','bg-orange-500','bg-violet-600'][i]}/><span className="truncate">{name}</span></span><b>{Math.round(count/total*100)}%</b></div>):<p className="text-xs leading-5 text-slate-500">La répartition apparaîtra dès que les biens seront enregistrés.</p>}</div></div></div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><h2 className="text-base font-extrabold">Activités récentes</h2><Link href="/immo/gestion" className="text-xs font-semibold text-blue-600">Voir tout →</Link></div><div className="mt-4 space-y-4">{activities.length?activities.map(item=><div key={item.id} className="flex items-start gap-3"><div className={'grid h-9 w-9 shrink-0 place-items-center rounded-full '+(item.kind==='property'?'bg-blue-50 text-blue-600':item.kind==='reservation'?'bg-emerald-50 text-emerald-600':'bg-violet-50 text-violet-600')}>{item.kind==='property'?<Home size={17}/>:item.kind==='reservation'?<CalendarDays size={17}/>:<Users size={17}/>}</div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{item.title}</div><div className="truncate text-[11px] text-slate-500">{item.detail}</div></div><span className="shrink-0 text-[10px] text-slate-500">{ago(item.at)}</span></div>):<p className="rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-500">Aucune activité récente disponible pour le moment.</p>}</div></div>
        </section>

        <section className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,1fr)_minmax(220px,.72fr)]">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><h2 className="text-base font-extrabold">Nos projets immobiliers</h2><Link href="/immo/construction" className="text-xs font-semibold text-blue-600">Voir tous →</Link></div><div className="mt-3 grid gap-3 sm:grid-cols-3">{projects.length?projects.slice(0,3).map((p,i)=><article key={p.id} className="overflow-hidden rounded-xl border border-slate-100"><div className="relative h-[105px] bg-cover bg-center" style={{backgroundImage:"linear-gradient(135deg,rgba(7,26,55,.1),rgba(7,26,55,.25)),url('"+['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80'][i]+"')"}}><span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-800">{p.project_status==='completed'||p.project_status==='delivered'?'Livré':p.project_status==='under_construction'?'En cours':'À venir'}</span></div><div className="p-3"><h3 className="truncate text-xs font-extrabold">{p.name}</h3><p className="mt-1 text-[10px] text-slate-500">{p.city||'Localisation à préciser'}</p><p className="mt-2 text-xs font-black">{p.price_from?number(p.price_from)+' FCFA':'Prix à définir'}</p><Link href="/immo/construction" className="mt-2 flex items-center justify-center gap-1 rounded-full bg-blue-50 py-2 text-[11px] font-bold text-blue-700">Voir détails <ArrowRight size={12}/></Link></div></article>):<div className="col-span-full rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Aucun projet immobilier enregistré pour le moment. Les projets publiés apparaîtront ici.</div>}</div></div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-base font-extrabold"><ChartNoAxesCombined size={19} className="text-blue-600"/>Performance globale</h2><span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">Depuis le début</span></div><div className="mt-5 flex items-center gap-4"><div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{background:'conic-gradient(#08bd63 '+Math.min(100,metrics.properties?Math.round(metrics.reservations/Math.max(1,metrics.properties)*100):0)+'%,#e8eef7 0)'}}><div className="grid h-[82px] w-[82px] place-items-center rounded-full bg-white text-center"><div><div className="text-2xl font-black">{metrics.properties?Math.round(metrics.reservations/Math.max(1,metrics.properties)*100):0}%</div><div className="text-[9px] text-slate-500">Réservations / biens</div></div></div></div><div className="min-w-0 flex-1 space-y-3 text-xs"><div className="flex justify-between gap-2"><span className="text-slate-500">Biens publiés</span><b>{number(metrics.properties)}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Réservations</span><b>{number(metrics.reservations)}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Visites demandées</span><b>{number(metrics.appointments)}</b></div></div></div><p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-500">Indicateurs calculés à partir des enregistrements accessibles. Aucun objectif fictif n’est appliqué.</p></div>
          <div className="relative flex min-h-[245px] flex-col justify-end overflow-hidden rounded-xl bg-[#06275c] p-4 text-white"><div className="absolute inset-0 bg-cover bg-center opacity-45" style={{backgroundImage:"url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80')"}}/><div className="absolute inset-0 bg-gradient-to-t from-[#031b43] via-[#06275c]/65 to-transparent"/><div className="relative z-10"><div className="mb-2 flex items-center gap-2 text-sm font-black"><MessageCircle size={18}/>Assistant JDV IMO</div><p className="text-sm font-semibold">Une question ?<br/>Je suis là pour vous aider.</p><Link href="/help" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2.5 text-xs font-bold">Poser une question <ArrowRight size={14}/></Link></div></div>
        </section>

        <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-extrabold">Biens récemment enregistrés</h2><p className="mt-1 text-xs text-slate-500">Les trois dernières fiches accessibles dans JDV IMO.</p></div><Link href="/immo/biens" className="text-xs font-semibold text-blue-600">Tous les biens →</Link></div><div className="mt-3 grid gap-2 md:grid-cols-3">{recentProperties.length?recentProperties.map(p=><Link key={p.id} href="/immo/biens" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:border-blue-200"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><Home size={19}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{p.title}</div><div className="text-[10px] text-slate-500">{p.city||'Ville non précisée'} · {p.transaction_type==='rent'?'Location':'Vente'}</div></div><ArrowRight size={15} className="text-blue-600"/></Link>):<p className="col-span-full rounded-lg bg-slate-50 p-4 text-xs text-slate-500">{search?'Aucun bien ne correspond à cette recherche.':'Aucun bien publié pour le moment.'}</p>}</div></section>
      </div>
      <footer className="px-5 pb-5 text-center text-[10px] text-slate-400">JDV GLOBAL CENTER · JDV IMO · Les statistiques reflètent les données autorisées dans votre espace.</footer>
    </main>
  </div></div>;
}
