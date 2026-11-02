'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bell, BookOpen, CalendarClock, CheckCircle2, ChevronRight, CircleDollarSign, FileText, LoaderCircle, Plus, RefreshCw, Search, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Tontine = { id:string; name:string; description:string|null; contribution_amount:number; frequency:string; cycle_periods:number; member_limit:number; late_fee_amount:number; status:string; currency_id:string; tontine_type:string; tontine_class:string|null };
type Membership = { id:string; tontine_id:string; role:string; membership_status:string; contribution_count:number };
type Schedule = { id:string; member_id:string; due_on:string; expected_amount:number; status:string; late_fee_amount:number; penalty_status:string };
type Currency = { id:string; code:string; symbol:string };
type TontineClass = { code:string; name:string; description:string };
const frequencies:Record<string,string>={daily:'Quotidienne',weekly:'Hebdomadaire',biweekly:'Toutes les deux semaines',monthly:'Mensuelle',quarterly:'Trimestrielle'};
const statuses:Record<string,string>={active:'Active',open:'En cours',draft:'Brouillon',pending:'En attente',completed:'Terminée',suspended:'Suspendue',paused:'En pause'};
const money=(n:number,c='FCFA')=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(n||0))+' '+c;

export default function TontinePage(){
 const {user,loading}=useAuth(); const supabase=useMemo(()=>createClient(),[]);
 const [groups,setGroups]=useState<Tontine[]>([]); const [members,setMembers]=useState<Membership[]>([]);
 const [schedules,setSchedules]=useState<Schedule[]>([]); const [currencies,setCurrencies]=useState<Currency[]>([]);
 const [classes,setClasses]=useState<TontineClass[]>([]); const [query,setQuery]=useState('');
 const [busy,setBusy]=useState(true); const [error,setError]=useState('');
 const load=useCallback(async()=>{
  setBusy(true);setError('');
  if(!user){setGroups([]);setMembers([]);setSchedules([]);setCurrencies([]);setClasses([]);setBusy(false);return;}
  const [m,c,k]=await Promise.all([
   supabase.from('tontine_members').select('id,tontine_id,role,membership_status,contribution_count').eq('user_id',user.id).limit(200),
   supabase.from('currencies').select('id,code,symbol').eq('is_active',true).limit(100),
   (supabase as any).from('tontine_classes').select('code,name,description').eq('is_active',true).order('name')
  ]);
  if(m.error)setError('Adhésions indisponibles : '+m.error.message);
  const memberRows=(m.data||[]) as Membership[];setMembers(memberRows);
  if(c.error)setError(v=>v||'Devises indisponibles : '+c.error.message);setCurrencies((c.data||[]) as Currency[]);
  if(k.error)setError(v=>v||'Classes indisponibles : '+k.error.message);setClasses((k.data||[]) as TontineClass[]);
  const ids=[...new Set(memberRows.map(x=>x.tontine_id))];
  if(ids.length){
   const [g,s]=await Promise.all([
    supabase.from('tontines').select('id,name,description,contribution_amount,frequency,cycle_periods,member_limit,late_fee_amount,status,currency_id,tontine_type,tontine_class').in('id',ids).order('created_at',{ascending:false}).limit(100),
    supabase.from('tontine_contribution_schedules').select('id,member_id,due_on,expected_amount,status,late_fee_amount,penalty_status').in('member_id',memberRows.map(x=>x.id)).order('due_on',{ascending:true}).limit(200)
   ]);
   if(g.error)setError(v=>v||'Tontines indisponibles : '+g.error.message);else setGroups((g.data||[]) as Tontine[]);
   if(s.error)setError(v=>v||'Échéances indisponibles : '+s.error.message);else setSchedules((s.data||[]) as Schedule[]);
  }else{setGroups([]);setSchedules([]);}
  setBusy(false);
 },[supabase,user]);
 useEffect(()=>{if(!loading)void load();},[loading,load]);
 const filtered=groups.filter(g=>(g.name+' '+(g.description||'')+' '+g.frequency+' '+g.status).toLowerCase().includes(query.toLowerCase()));
 const currency=(id:string)=>currencies.find(c=>c.id===id)?.code||'FCFA';
 const pending=schedules.filter(s=>!['paid','completed'].includes(s.status));
 const active=groups.filter(g=>['active','open'].includes(g.status)).length;
 const className=(code:string|null)=>classes.find(c=>c.code===code)?.name||'Classe à préciser';
 if(loading||busy)return <main className="grid min-h-screen place-items-center bg-[#f5f7fb] text-[#10264c]"><div className="flex items-center gap-3 text-sm"><LoaderCircle className="animate-spin text-[#ed8b22]"/>Chargement de votre espace Tontine…</div></main>;
 return <main className="min-h-screen bg-[#f5f7fb] text-[#172844]"><div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[245px_minmax(0,1fr)]">
 <aside className="hidden flex-col bg-[#0b1b3d] px-5 py-7 text-white lg:flex">
  <Link href="/tontine" className="mb-9 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f28c28] text-xl font-black text-[#0b1b3d]">J</span><span><b className="block text-lg">JDV <i className="not-italic text-[#f28c28]">TONTINE</i></b><small className="text-[10px] text-white/45">Ensemble, construisons votre avenir</small></span></Link>
  <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Espace personnel</p><nav className="space-y-1 text-sm">
   <Link href="/tontine" className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 font-semibold"><WalletCards size={17} className="text-[#f28c28]"/>Tableau de bord</Link>
   <Link href="/tontine/categories" className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10"><Users size={17}/>Les six classes</Link>
   <Link href="/tontine/concepteur" className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10"><Plus size={17}/>Créer une tontine</Link>
   <Link href="/tontine/documents" className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10"><FileText size={17}/>Documents & contrats</Link>
   <Link href="/tontine/contrat" className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10"><BookOpen size={17}/>Contrat-cadre</Link>
  </nav><div className="mt-auto rounded-2xl border border-white/10 bg-white/[.05] p-4"><div className="mb-2 flex items-center gap-2 text-[#f28c28]"><ShieldCheck size={17}/><b className="text-xs text-white">Votre sécurité</b></div><p className="text-[11px] leading-5 text-white/50">Les adhésions, identités et contrats sont vérifiés avant activation.</p><Link href="/tontine/documents" className="mt-3 inline-flex text-xs font-bold text-[#f28c28]">Gérer mes documents <ArrowUpRight size={13}/></Link></div>
 </aside>
 <section className="min-w-0"><header className="flex h-[72px] items-center justify-between border-b border-[#e7ebf2] bg-white px-5 sm:px-8"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ed8b22]">JDV GLOBAL CENTER</p><p className="text-sm font-bold">Mon espace Tontine</p></div><div className="flex items-center gap-3"><button onClick={()=>void load()} className="rounded-xl border border-[#e5eaf2] p-2.5 text-[#61718b]" aria-label="Actualiser"><RefreshCw size={16}/></button><span className="relative rounded-xl border border-[#e5eaf2] p-2.5 text-[#61718b]"><Bell size={16}/></span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff0dd] text-xs font-extrabold text-[#9b5610]">{(user?.email?.[0]||'U').toUpperCase()}</span></div></header>
 <div className="mx-auto max-w-[1300px] space-y-7 px-5 py-7 sm:px-8 sm:py-9">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff0dd] px-3 py-1.5 text-[11px] font-bold text-[#9b5610]">✦ Une gestion plus simple et transparente</p><h1 className="text-3xl font-black tracking-tight text-[#10264c] sm:text-[34px]">Bonjour 👋</h1><p className="mt-2 text-sm text-[#75839a]">Retrouvez vos groupes, vos engagements et vos prochaines échéances.</p></div><div className="flex flex-wrap gap-2"><Link href="/tontine/categories" className="rounded-xl border border-[#dce3ed] bg-white px-4 py-3 text-xs font-bold text-[#29405f]">Explorer les classes</Link><Link href="/tontine/concepteur" className="inline-flex items-center gap-2 rounded-xl bg-[#f28c28] px-4 py-3 text-xs font-extrabold text-[#172844] shadow-sm hover:bg-[#ff9e3e]"><Plus size={15}/>Créer une tontine</Link></div></div>
  {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
  {!user&&<div className="rounded-2xl border border-[#e5eaf2] bg-white p-7"><h2 className="font-bold">Connexion requise</h2><p className="mt-2 text-sm text-[#75839a]">Connectez-vous avec votre compte JDV Tontine pour consulter vos groupes et échéances.</p><Link href="/tontine/connexion" className="mt-4 inline-flex rounded-xl bg-[#f28c28] px-4 py-3 text-sm font-bold">Se connecter</Link></div>}
  {user&&<>
   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {[['Mes tontines',String(groups.length),active+' active(s)',WalletCards],['Mes adhésions',String(members.length),members.filter(m=>m.membership_status==='pending').length+' en attente',Users],['Échéances à suivre',String(pending.length),'Votre calendrier personnel',CalendarClock],['Vérification',members.some(m=>m.membership_status==='pending')?'À compléter':'Suivi actif','KYC et contrat selon le groupe',ShieldCheck]].map(([label,value,sub,Icon]:any)=><div key={label} className="rounded-2xl border border-[#e8edf4] bg-white p-5"><div className="flex items-center justify-between text-xs text-[#77859a]"><span>{label}</span><Icon size={17} className="text-[#e98a25]"/></div><p className="mt-3 text-3xl font-black text-[#10264c]">{value}</p><p className="mt-1 text-[11px] text-[#8491a4]">{sub}</p></div>)}
   </div>
   <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.8fr)]">
    <section className="rounded-2xl border border-[#e8edf4] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#10264c]">Mes tontines</h2><p className="mt-1 text-xs text-[#8491a4]">Les groupes associés à votre compte</p></div><label className="flex items-center gap-2 rounded-xl border border-[#e7ebf2] px-3 py-2 text-xs text-[#8491a4]"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher…" className="w-32 bg-transparent text-[#10264c] outline-none sm:w-44"/></label></div>
     <div className="mt-5 space-y-3">{filtered.map(t=><article key={t.id} className="rounded-xl border border-[#edf0f5] p-4 transition hover:border-[#f2bd83]"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><Link href={'/tontine/'+t.id} className="font-bold text-[#183254] hover:text-[#dc7915]">{t.name}</Link><p className="mt-1 text-[11px] text-[#8491a4]">{className(t.tontine_class)} · {t.tontine_type==='individual'?'Épargne individuelle':'Groupe'}</p></div><span className="rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[10px] font-bold text-[#24764a]">{statuses[t.status]||t.status}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#6e7d94]"><span className="inline-flex items-center gap-1.5"><CircleDollarSign size={14} className="text-[#e98a25]"/>{money(t.contribution_amount,currency(t.currency_id))} / {frequencies[t.frequency]||t.frequency}</span><span>{memberRowsCount(t.id,members)} adhésion(s)</span><span>{t.cycle_periods} périodes</span></div><div className="mt-3 flex justify-end"><Link href={'/tontine/'+t.id} className="inline-flex items-center gap-1 text-xs font-bold text-[#d87916]">Ouvrir l’espace <ChevronRight size={14}/></Link></div></article>)}
     {!filtered.length&&<div className="rounded-xl border border-dashed border-[#dce3ed] p-8 text-center"><WalletCards className="mx-auto text-[#b5c0d0]" size={25}/><p className="mt-3 text-sm font-bold text-[#40516c]">{query?'Aucun résultat':'Aucune tontine associée'}</p><p className="mt-1 text-xs text-[#8491a4]">Créez votre premier brouillon ou rejoignez un groupe avec un lien d’invitation.</p><Link href="/tontine/concepteur" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f28c28] px-4 py-2.5 text-xs font-bold text-[#172844]"><Plus size={14}/>Créer une tontine</Link></div>}</div>
    </section>
    <aside className="space-y-5"><section className="rounded-2xl bg-[#10264c] p-5 text-white"><div className="flex items-center gap-2 text-[#f5a34c]"><CalendarClock size={17}/><h2 className="text-sm font-extrabold text-white">Prochaines échéances</h2></div><div className="mt-4 space-y-3">{pending.slice(0,5).map(s=>{const m=members.find(x=>x.id===s.member_id);const g=groups.find(x=>x.id===m?.tontine_id);return <div key={s.id} className="rounded-xl border border-white/10 bg-white/[.06] p-3"><p className="text-xs font-bold">{g?.name||'Tontine'}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[11px] text-white/50">{new Date(s.due_on+'T00:00:00').toLocaleDateString('fr-FR')}</span><span className="text-xs font-bold text-[#ffc17c]">{money(s.expected_amount,g?currency(g.currency_id):'FCFA')}</span></div><p className="mt-1 text-[10px] text-white/40">{statuses[s.status]||s.status}</p></div>})}{!pending.length&&<p className="rounded-xl border border-white/10 p-4 text-xs leading-5 text-white/55">Aucune échéance personnelle à afficher pour le moment.</p>}</div><p className="mt-4 text-[10px] leading-5 text-white/40">Aperçu consultatif. Les opérations financières sont contrôlées séparément.</p></section>
    <section className="rounded-2xl border border-[#e8edf4] bg-white p-5"><h2 className="text-sm font-extrabold text-[#10264c]">Accès rapides</h2><div className="mt-3 space-y-1"><Link href="/tontine/documents" className="flex items-center justify-between rounded-lg px-2 py-3 text-xs font-semibold text-[#52637d] hover:bg-[#f5f7fb]"><span className="flex items-center gap-2"><FileText size={15} className="text-[#e98a25]"/>Mes documents</span><ChevronRight size={14}/></Link><Link href="/tontine/contrat" className="flex items-center justify-between rounded-lg px-2 py-3 text-xs font-semibold text-[#52637d] hover:bg-[#f5f7fb]"><span className="flex items-center gap-2"><BookOpen size={15} className="text-[#e98a25]"/>Contrat-cadre</span><ChevronRight size={14}/></Link></div></section></aside>
   </div>
   <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-extrabold text-[#10264c]">Les classes JDV Tontine</h2><p className="mt-1 text-xs text-[#8491a4]">Choisissez le modèle adapté à votre objectif</p></div><Link href="/tontine/categories" className="text-xs font-bold text-[#d87916]">Tout voir <ArrowUpRight size={13} className="inline"/></Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{classes.map((c,i)=><Link key={c.code} href={'/tontine/categories/'+c.code} className="group rounded-2xl border border-[#e8edf4] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#f0bd85] hover:shadow-md"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1df] text-lg">{['🔄','🎯','🤝','🏪','📊','⚙️'][i%6]}</span><ArrowUpRight size={16} className="text-[#a8b3c2] group-hover:text-[#e98a25]"/></div><h3 className="mt-3 text-sm font-extrabold text-[#183254]">{c.name}</h3><p className="mt-1 text-xs leading-5 text-[#8491a4]">{c.description}</p></Link>)}</div></section>
   <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5eaf1] pt-5 text-[10px] text-[#98a3b2]"><span>JDV TONTINE · Une branche de JDV GLOBAL CENTER</span><span className="inline-flex items-center gap-1"><CheckCircle2 size={12}/> Accès soumis aux autorisations de votre compte</span></footer>
  </>}
 </div></section></div></main>;
}
function memberRowsCount(id:string,members:Membership[]){return members.filter(m=>m.tontine_id===id).length;}
