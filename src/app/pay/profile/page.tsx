'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, UserRound, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PayHeader from '@/components/pay/PayHeader';
import { createClient } from '@/lib/supabase/client';

export default function PayProfilePage(){
 const {user,profile,loading}=useAuth(); const router=useRouter();
 const [country,setCountry]=React.useState<string>('');
 const [countryLoading,setCountryLoading]=React.useState(false);
 useEffect(()=>{if(!loading&&!user)router.push('/auth/login?redirect=/pay/profile')},[loading,user,router]);
 useEffect(()=>{let live=true;async function load(){if(!profile?.country_id)return;setCountryLoading(true);const {data}=await createClient().from('countries').select('name,flag_emoji').eq('id',profile.country_id).maybeSingle();if(live)setCountry(data?((data.flag_emoji??'')+' '+data.name):'');setCountryLoading(false)}void load();return()=>{live=false}},[profile?.country_id]);
 if(loading)return <main className="mx-auto max-w-4xl p-6 text-sm text-muted-foreground">Chargement du profil…</main>;
 const rows=[{label:'Nom complet',value:profile?.full_name||[profile?.first_name,profile?.last_name].filter(Boolean).join(' ')||'Non renseigné',icon:UserRound},{label:'Adresse e-mail',value:profile?.email||user?.email||'Non renseignée',icon:Mail},{label:'Téléphone',value:profile?.phone||'Non renseigné',icon:Phone},{label:'Pays',value:countryLoading?'Chargement…':country||'Non renseigné',icon:MapPin}];
 return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6"><PayHeader title="Profil & coordonnées" active="/pay/profile"/><section className="jdv-card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-accent">Identité JDV centralisée</p><h2 className="mt-2 text-xl font-bold text-foreground">Vos coordonnées personnelles</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">JDV PAY lit ces informations depuis votre profil JDV Global Center. Il ne crée pas de fiche d’identité parallèle.</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Lecture privée</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{rows.map(r=><div key={r.label} className="flex items-start gap-3 rounded-xl border border-border p-4"><span className="rounded-lg bg-muted p-2 text-accent"><r.icon size={18}/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{r.label}</p><p className="mt-1 break-words text-sm font-semibold text-foreground">{r.value}</p></div></div>)}</div><div className="mt-5 rounded-xl border border-border bg-muted/30 p-4"><div className="flex items-start gap-2"><AlertCircle size={17} className="mt-0.5 text-accent"/><div><p className="text-sm font-semibold text-foreground">Modification des coordonnées</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Pour éviter les divergences entre les applications JDV, les modifications se font dans le profil central. Un changement d’e-mail ou de téléphone doit être confirmé avant d’être utilisé pour la sécurité ou les notifications.</p><Link href="/profile" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">Ouvrir mon profil central <ExternalLink size={14}/></Link></div></div></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 size={15} className="text-success"/>Vos coordonnées ne sont pas affichées publiquement aux autres utilisateurs.</div></section></main>
}
import React from 'react';
