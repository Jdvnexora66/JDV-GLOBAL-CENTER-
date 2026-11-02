'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, Clock3, RefreshCw, Search, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Reservation = { id:string; property_id:string; client_user_id:string; amount:number; reservation_status:string; expires_at:string|null; created_at:string; property_title?:string; city?:string|null };
type Appointment = { id:string; property_id:string; requester_user_id:string; scheduled_at:string; appointment_status:string; notes:string|null; created_at:string; property_title?:string; city?:string|null };
const money=(value:number)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(value)+' FCFA';
const date=(value:string)=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const statusLabel:Record<string,string>={pending:'En attente',confirmed:'Confirmée',expired:'Expirée',cancelled:'Annulée',refunded:'Remboursée',requested:'Demandée',completed:'Terminée',missed:'Absence'};
const statusClass=(status:string)=>status==='confirmed'||status==='completed'?'bg-emerald-50 text-emerald-700':status==='cancelled'||status==='expired'||status==='missed'?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700';

export default function ImmoReservationsPage(){
 const {user,loading}=useAuth();const supabase=useMemo(()=>createClient(),[]);
 const [reservations,setReservations]=useState<Reservation[]>([]);const [appointments,setAppointments]=useState<Appointment[]>([]);
 const [tab,setTab]=useState<'reservations'|'visits'>('reservations');const [filter,setFilter]=useState('all');const [search,setSearch]=useState('');
 const [busy,setBusy]=useState(true);const [error,setError]=useState('');
 const load=useCallback(async()=>{
  if(!user){setBusy(false);return;}setBusy(true);setError('');
  const [rr,ar]=await Promise.all([
   supabase.from('immo_reservations').select('id,property_id,client_user_id,amount,reservation_status,expires_at,created_at').order('created_at',{ascending:false}).limit(200),
   supabase.from('immo_appointments').select('id,property_id,requester_user_id,scheduled_at,appointment_status,notes,created_at').order('scheduled_at',{ascending:false}).limit(200)
  ]);
  if(rr.error)setError(rr.error.message);if(ar.error)setError(v=>v||ar.error!.message);
  const rs=(rr.data??[]) as Reservation[], aps=(ar.data??[]) as Appointment[];
  const ids=[...new Set([...rs.map(x=>x.property_id),...aps.map(x=>x.property_id)])];
  let map:Record<string,{title:string;city:string|null}>={};
  if(ids.length){const pr=await supabase.from('immo_properties').select('id,title,city').in('id',ids);if(pr.error)setError(v=>v||pr.error!.message);(pr.data??[]).forEach((p:any)=>{map[p.id]={title:p.title,city:p.city};});}
  setReservations(rs.map(x=>({...x,property_title:map[x.property_id]?.title||'Bien immobilier',city:map[x.property_id]?.city||null})));
  setAppointments(aps.map(x=>({...x,property_title:map[x.property_id]?.title||'Bien immobilier',city:map[x.property_id]?.city||null})));
  setBusy(false);
 },[supabase,user]);
 useEffect(()=>{if(!loading)void load();},[loading,load]);
 const source=tab==='reservations'?reservations:appointments;
 const filtered=source.filter((item:any)=>(filter==='all'||item[tab==='reservations'?'reservation_status':'appointment_status']===filter)&&((item.property_title+' '+(item.city||'')+' '+item.id).toLowerCase().includes(search.toLowerCase())));
 const pendingReservations=reservations.filter(x=>x.reservation_status==='pending').length;
 const upcomingVisits=appointments.filter(x=>new Date(x.scheduled_at)>=new Date()&&['requested','confirmed'].includes(x.appointment_status)).length;
 if(loading)return <main className="grid min-h-screen place-items-center bg-[#0B1B3D] text-white">Chargement…</main>;
 if(!user)return <main className="grid min-h-screen place-items-center bg-[#0B1B3D] p-5 text-white"><div className="max-w-md rounded-2xl border border-white/10 bg-white/[.05] p-7 text-center"><h1 className="text-2xl font-black">Espace réservé</h1><p className="mt-3 text-sm text-white/60">Connectez-vous à JDV IMO pour consulter les réservations et demandes de visite autorisées par votre compte.</p><Link href="/inscription/immo" className="mt-5 inline-flex rounded-xl bg-[#F28C28] px-5 py-3 font-bold text-[#0B1B3D]">Accéder à mon compte</Link></div></main>;
 return <main className="min-h-screen bg-[#0B1B3D] p-4 text-white sm:p-7"><div className="mx-auto max-w-7xl">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><Link href="/immo" className="text-sm text-white/55 hover:text-white">← Tableau de bord</Link><p className="mt-4 text-xs font-bold uppercase tracking-[.22em] text-[#F28C28]">JDV IMO · Suivi commercial</p><h1 className="mt-1 text-3xl font-black">Réservations & visites</h1><p className="mt-2 text-sm text-white/55">Suivi des demandes visibles selon les autorisations de votre compte.</p></div><button onClick={()=>void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm disabled:opacity-50"><RefreshCw size={15} className={busy?'animate-spin':''}/> Actualiser</button></div>
  <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><p className="text-xs text-white/50">Réservations visibles</p><p className="mt-2 text-3xl font-black">{busy?'—':reservations.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><p className="text-xs text-white/50">En attente</p><p className="mt-2 text-3xl font-black">{busy?'—':pendingReservations}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><p className="text-xs text-white/50">Visites à venir</p><p className="mt-2 text-3xl font-black">{busy?'—':upcomingVisits}</p></div></div>
  {error&&<div role="alert" className="mt-4 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">Certaines données n’ont pas pu être chargées : {error}</div>}
  <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4"><div className="flex rounded-xl bg-black/20 p-1"><button onClick={()=>{setTab('reservations');setFilter('all');}} className={'rounded-lg px-4 py-2 text-sm font-bold '+(tab==='reservations'?'bg-[#F28C28] text-[#0B1B3D]':'text-white/65')}>Réservations ({reservations.length})</button><button onClick={()=>{setTab('visits');setFilter('all');}} className={'rounded-lg px-4 py-2 text-sm font-bold '+(tab==='visits'?'bg-[#F28C28] text-[#0B1B3D]':'text-white/65')}>Visites ({appointments.length})</button></div><div className="flex min-w-[230px] flex-1 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 sm:max-w-sm"><Search size={16} className="text-white/40"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un bien ou dossier" className="w-full bg-transparent text-sm outline-none"/></div><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#09152f] px-3 py-2.5 text-sm"><option value="all">Tous les statuts</option>{(tab==='reservations'?['pending','confirmed','expired','cancelled','refunded']:['requested','confirmed','completed','cancelled','missed']).map(x=><option key={x} value={x}>{statusLabel[x]}</option>)}</select></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-white/[.04] text-xs uppercase tracking-wide text-white/45"><tr>{(tab==='reservations'?['Bien immobilier','Montant','Client','Statut','Créée le']:['Bien immobilier','Demandeur','Date de visite','Statut','Note']).map(x=><th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y divide-white/10">{filtered.map((item:any)=><tr key={item.id} className="hover:bg-white/[.03]"><td className="px-4 py-4"><div className="font-bold">{item.property_title}</div><div className="mt-1 text-xs text-white/45">{item.city||'Ville non précisée'} · {item.id.slice(0,8)}</div></td>{tab==='reservations'?<><td className="px-4 py-4 font-semibold">{money(Number(item.amount))}</td><td className="px-4 py-4 text-xs text-white/60">{item.client_user_id.slice(0,8)}…</td><td className="px-4 py-4"><span className={'rounded-full px-2.5 py-1 text-xs font-bold '+statusClass(item.reservation_status)}>{statusLabel[item.reservation_status]||item.reservation_status}</span></td><td className="px-4 py-4 text-xs text-white/60">{date(item.created_at)}</td></>:<><td className="px-4 py-4 text-xs text-white/60">{item.requester_user_id.slice(0,8)}…</td><td className="px-4 py-4 text-xs text-white/70">{date(item.scheduled_at)}</td><td className="px-4 py-4"><span className={'rounded-full px-2.5 py-1 text-xs font-bold '+statusClass(item.appointment_status)}>{statusLabel[item.appointment_status]||item.appointment_status}</span></td><td className="max-w-[180px] truncate px-4 py-4 text-xs text-white/55">{item.notes||'—'}</td></>}</tr>)}{!busy&&filtered.length===0&&<tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-white/45">{source.length?'Aucun dossier ne correspond aux filtres.':'Aucune donnée accessible pour le moment.'}</td></tr>}</tbody></table></div>
   <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4 text-xs text-white/45"><span>{filtered.length} dossier(s) affiché(s)</span><span className="inline-flex items-center gap-2"><Clock3 size={14}/> Les statuts sont consultés en lecture seule depuis Supabase.</span></div>
  </section>
  <div className="mt-5 flex flex-wrap gap-3"><Link href="/immo/biens" className="rounded-xl bg-[#F28C28] px-4 py-3 text-sm font-bold text-[#0B1B3D]">Consulter le catalogue</Link><Link href="/immo/partenaires" className="rounded-xl border border-white/15 px-4 py-3 text-sm">Espace agences & agents</Link></div>
 </div></main>;
}
