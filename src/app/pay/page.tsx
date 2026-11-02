'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock3, ShieldCheck, UserRound, QrCode, FileText, Settings2, WalletCards, ChevronRight, CircleUserRound, Bell, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { usePayWallets } from '@/hooks/usePayWallets';
import PayHeader from '@/components/pay/PayHeader';
import { IN_TYPES, STATUS_LABEL, TYPE_LABEL, money, type PayTx } from '@/lib/pay/types';

const modules = [
  { href:'/pay/send', title:'Envoyer', desc:'Transférer vers un contact JDV', icon:ArrowUpRight, tone:'bg-blue-500/10 text-blue-600', enabled:true },
  { href:'/pay/receive', title:'Recevoir & QR', desc:'Créer une demande et partager votre QR', icon:QrCode, tone:'bg-violet-500/10 text-violet-600', enabled:true },
  { href:'/pay/history', title:'Historique', desc:'Consulter vos opérations et statuts', icon:Clock3, tone:'bg-cyan-500/10 text-cyan-600', enabled:true },
  { href:'/pay/beneficiaries', title:'Contacts', desc:'Gérer vos bénéficiaires enregistrés', icon:UserRound, tone:'bg-emerald-500/10 text-emerald-600', enabled:true },
  { href:'/pay/profile', title:'Profil & coordonnées', desc:'Coordonnées issues de votre profil JDV', icon:CircleUserRound, tone:'bg-orange-500/10 text-orange-600', enabled:true },
  { href:'/pay/kyc', title:'Vérification KYC', desc:'Suivre votre niveau de vérification', icon:ShieldCheck, tone:'bg-indigo-500/10 text-indigo-600', enabled:true },
  { href:'/pay/security', title:'Sécurité & 2FA', desc:'Consulter les protections du compte', icon:LockKeyhole, tone:'bg-rose-500/10 text-rose-600', enabled:true },
  { href:'/pay/receipts', title:'Reçus PDF', desc:'Espace de consultation des justificatifs', icon:FileText, tone:'bg-amber-500/10 text-amber-600', enabled:true },
  { href:'/pay/exchange', title:'Conversion', desc:'Taux, frais et confirmation avant conversion', icon:ArrowLeftRight, tone:'bg-teal-500/10 text-teal-600', enabled:false },
];

export default function PayHome() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { wallets } = usePayWallets();
  const [txs, setTxs] = useState<PayTx[] | null>(null);
  const [txError, setTxError] = useState('');
  const [showBalances, setShowBalances] = useState(true);
  const sb = useMemo(() => createClient(), []);
  useEffect(() => { if (!loading && !user) router.push('/auth/login?redirect=/pay'); }, [loading, user, router]);
  useEffect(() => {
    if (!user?.id) { setTxs([]); return; }
    let active = true;
    async function load() {
      setTxError('');
      const { data: walletRows, error: walletError } = await sb.from('wallets').select('id').eq('user_id', user!.id).is('organization_id', null);
      if (walletError) { if(active){setTxError('Impossible de vérifier vos portefeuilles.');setTxs([]);} return; }
      const ids = (walletRows ?? []).map((w) => w.id);
      if (!ids.length) { if(active)setTxs([]); return; }
      const { data, error } = await sb.from('wallet_transactions')
        .select('id,transaction_type,amount,fee_amount,transaction_status,description,reference,created_at,balance_after,currencies:currency_id(code)')
        .in('wallet_id', ids).order('created_at', { ascending: false }).limit(5);
      if (!active) return;
      if (error) { setTxError('Impossible de charger vos dernières opérations.'); setTxs([]); }
      else setTxs((data ?? []) as unknown as PayTx[]);
    }
    void load();
    return () => { active = false; };
  }, [user?.id, sb]);
  const activeWallets = (wallets ?? []).filter(w => w.wallet_status === 'active');
  const totalWallets = activeWallets.length;
  const totalCurrencies = [...new Set(activeWallets.map(w=>w.currencies.code))].length;
  const displayName = profile?.first_name || profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = (profile?.full_name || displayName).slice(0,1).toUpperCase();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PayHeader title="Votre espace financier" active="/pay" back="/dashboard" />
      <section className="relative overflow-hidden rounded-3xl bg-[#0B1B3D] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-[#F28C28]/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">Bonjour, {displayName}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Vos portefeuilles JDV</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">Retrouvez vos soldes par devise, vos contacts et vos opérations dans un seul espace.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">{initials}</div>
        </div>
        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between text-xs text-white/70"><span>Portefeuilles actifs</span><WalletCards size={16}/></div>
            <p className="mt-2 text-3xl font-bold">{wallets === null ? '…' : totalWallets}</p>
            <p className="mt-1 text-xs text-white/55">{totalCurrencies} devise(s) disponible(s)</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between text-xs text-white/70"><span>Solde disponible</span><button onClick={()=>setShowBalances(v=>!v)} className="underline">{showBalances?'Masquer':'Afficher'}</button></div>
            <p className="mt-2 text-2xl font-bold">{showBalances ? (activeWallets.length ? money(activeWallets[0].available_balance,activeWallets[0].currencies.code) : '—') : '••••••'}</p>
            <p className="mt-1 text-xs text-white/55">Affiché par portefeuille, sans conversion fictive</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between text-xs text-white/70"><span>Profil de contact</span><ShieldCheck size={16}/></div>
            <p className="mt-2 text-lg font-bold">{profile?.phone ? 'Téléphone renseigné' : 'À compléter'}</p>
            <p className="mt-1 truncate text-xs text-white/55">{profile?.email || user?.email || 'E-mail non disponible'}</p>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <Link href="/pay/send" className="inline-flex items-center gap-2 rounded-xl bg-[#F28C28] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"><ArrowUpRight size={17}/>Envoyer</Link>
          <Link href="/pay/receive" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><ArrowDownLeft size={17}/>Recevoir / QR</Link>
          <Link href="/pay/history" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Clock3 size={17}/>Historique</Link>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="font-bold text-foreground">Mes portefeuilles</h2><p className="text-xs text-muted-foreground">Les montants restent dans leur devise d’origine.</p></div><span className="text-xs text-muted-foreground">{activeWallets.length} actif(s)</span></div>
        {wallets === null ? <div className="jdv-card p-5 text-sm text-muted-foreground">Chargement des portefeuilles…</div> : activeWallets.length === 0 ? <div className="jdv-card p-5 text-sm text-muted-foreground">Aucun portefeuille actif n’est associé à ce compte pour le moment.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{activeWallets.map(w=><article key={w.id} className="jdv-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{w.currencies.code}</span><span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">Actif</span></div><p className="mt-2 text-2xl font-extrabold text-foreground">{showBalances?money(w.balance,w.currencies.code):'••••••'}</p><p className="mt-1 text-xs text-muted-foreground">Disponible : {showBalances?money(w.available_balance,w.currencies.code):'••••••'}</p></article>)}</div>}
      </section>

      <section className="mt-8">
        <div className="mb-3"><h2 className="font-bold text-foreground">Services JDV PAY</h2><p className="text-xs text-muted-foreground">Accès rapide à vos fonctionnalités.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{modules.map(m=><Link key={m.href} href={m.enabled?m.href:'#'} aria-disabled={!m.enabled} onClick={e=>{if(!m.enabled)e.preventDefault();}} className={`jdv-card group flex gap-3 p-4 transition hover:-translate-y-0.5 hover:border-accent/40 ${!m.enabled?'cursor-not-allowed opacity-60':''}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.tone}`}><m.icon size={19}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{m.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{m.desc}</span>{!m.enabled&&<span className="mt-1 inline-block text-[10px] font-semibold text-warning">Bientôt disponible</span>}</span>{m.enabled&&<ChevronRight size={16} className="mt-1 text-muted-foreground transition group-hover:translate-x-1"/>}</Link>)}</div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <div className="jdv-card p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-foreground">Dernières opérations</h2><p className="text-xs text-muted-foreground">Activité de vos portefeuilles personnels</p></div><Link href="/pay/history" className="text-xs font-semibold text-accent hover:underline">Tout voir</Link></div>
          {txError?<p role="alert" className="mt-4 text-sm text-danger">{txError}</p>:txs===null?<p className="mt-4 text-sm text-muted-foreground">Chargement…</p>:txs.length===0?<p className="mt-4 text-sm text-muted-foreground">Aucune opération pour le moment.</p>:<ul className="mt-3 divide-y divide-border">{txs.map(t=>{const incoming=IN_TYPES.includes(t.transaction_type);return <li key={t.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className={`rounded-xl p-2 ${incoming?'bg-success/10 text-success':'bg-muted text-foreground'}`}>{incoming?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{TYPE_LABEL[t.transaction_type]??'Opération'} <span className="text-xs font-normal text-muted-foreground">{t.transaction_status!=='completed'?(STATUS_LABEL[t.transaction_status]??t.transaction_status):''}</span></p><p className="truncate text-xs text-muted-foreground">{t.description??t.reference??'Opération JDV'} · {new Date(t.created_at).toLocaleDateString('fr-FR')}</p></div></div><p className="shrink-0 text-sm font-bold text-foreground">{incoming?'+':'−'}{money(Number(t.amount),t.currencies.code)}</p></li>})}</ul>}
        </div>
        <aside className="jdv-card p-5">
          <div className="flex items-center gap-2"><ShieldCheck className="text-success" size={19}/><h2 className="font-bold text-foreground">Protection du compte</h2></div>
          <p className="mt-2 text-sm text-muted-foreground">Vos coordonnées viennent de votre profil JDV central. Elles ne sont pas publiées aux autres utilisateurs.</p>
          <Link href="/pay/profile" className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 p-3 text-sm font-semibold text-foreground">Vérifier mes coordonnées<ChevronRight size={16}/></Link>
          <Link href="/pay/security" className="mt-2 flex items-center justify-between rounded-xl bg-muted/60 p-3 text-sm font-semibold text-foreground">Paramètres de sécurité<Settings2 size={16}/></Link>
          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">Les paiements réels, les conversions et les prestataires externes restent désactivés dans cette version de construction.</p>
        </aside>
      </section>
    </main>
  );
}
