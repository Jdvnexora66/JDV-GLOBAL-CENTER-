'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Clock3, CreditCard,
  History, Plus, ShieldCheck, Sparkles, Users, WalletCards,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { usePayWallets } from '@/hooks/usePayWallets';
import PayHeader from '@/components/pay/PayHeader';
import { IN_TYPES, STATUS_LABEL, TYPE_LABEL, money, type PayTx } from '@/lib/pay/types';

const QUICK_ACTIONS = [
  { href: '/pay/send', label: 'Envoyer de l’argent', detail: 'Transférer vers un bénéficiaire', icon: ArrowUpRight, tone: 'bg-blue-50 text-blue-700' },
  { href: '/pay/receive', label: 'Recevoir', detail: 'Recevoir un transfert JDV', icon: ArrowDownLeft, tone: 'bg-emerald-50 text-emerald-700' },
  { href: '/pay/beneficiaries', label: 'Bénéficiaires', detail: 'Gérer vos destinataires', icon: Users, tone: 'bg-violet-50 text-violet-700' },
  { href: '/pay/history', label: 'Historique', detail: 'Consulter vos opérations', icon: History, tone: 'bg-amber-50 text-amber-700' },
] as const;

export default function PayHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { wallets } = usePayWallets();
  const [txs, setTxs] = useState<PayTx[] | null>(null);
  const [all, setAll] = useState(false);
  const [txError, setTxError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const loadRecentTransactions = useCallback(async () => {
    if (!user) { setTxs([]); return; }
    setRetrying(true);
    setTxError('');
    const { data, error } = await createClient().from('wallet_transactions')
      .select('id,transaction_type,amount,fee_amount,transaction_status,description,reference,created_at,balance_after,currencies:currency_id(code)')
      .order('created_at', { ascending: false }).limit(6);
    if (error) {
      setTxError(error.message);
      setTxs([]);
    } else {
      setTxs((data ?? []) as unknown as PayTx[]);
    }
    setRetrying(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/pay');
  }, [loading, user, router]);

  useEffect(() => {
    let active = true;
    if (user) {
      void (async () => {
        setTxError('');
        const { data, error } = await createClient().from('wallet_transactions')
          .select('id,transaction_type,amount,fee_amount,transaction_status,description,reference,created_at,balance_after,currencies:currency_id(code)')
          .order('created_at', { ascending: false }).limit(6);
        if (!active) return;
        if (error) { setTxError(error.message); setTxs([]); }
        else setTxs((data ?? []) as unknown as PayTx[]);
      })();
    } else if (!loading) {
      setTxs([]);
    }
    return () => { active = false; };
  }, [user, loading]);

  const shown = (wallets ?? []).filter((w) => all || w.balance > 0 || w.currencies.code === 'XOF');

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-8 sm:px-6 sm:py-8">
      <PayHeader title="JDV PAY" active="/pay" back="/dashboard" />

      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#0B1F42] px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9" aria-labelledby="pay-welcome">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 right-28 h-64 w-64 rounded-full border border-cyan-300/20" />
        <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wide text-cyan-100"><Sparkles size={13}/> VOTRE ESPACE FINANCIER</span>
            <h2 id="pay-welcome" className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">Votre argent, simplement.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">Retrouvez vos portefeuilles, envoyez de l’argent et suivez vos opérations depuis un seul espace sécurisé.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/pay/send" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#0B1F42] transition hover:bg-cyan-50"><ArrowUpRight size={17}/> Envoyer</Link>
            <Link href="/pay/receive" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"><ArrowDownLeft size={17}/> Recevoir</Link>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-blue-100/75">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-300"/> Espace personnel</span>
          <span className="inline-flex items-center gap-1.5"><CreditCard size={14}/> Portefeuilles multidevises</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/> Suivi des opérations</span>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="wallet-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-accent">Votre argent</p><h2 id="wallet-heading" className="mt-1 text-xl font-black text-foreground sm:text-2xl">Mes portefeuilles</h2><p className="mt-1 text-sm text-muted-foreground">Chaque solde est affiché dans sa devise d’origine.</p></div>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">{wallets === null ? 'Chargement…' : `${wallets.length} portefeuille(s)`}</span>
        </div>
        {wallets === null ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl bg-muted"/><div className="h-32 animate-pulse rounded-2xl bg-muted"/></div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-7 text-center"><WalletCards size={28} className="mx-auto text-muted-foreground"/><p className="mt-3 font-bold text-foreground">Aucun portefeuille disponible</p><p className="mt-1 text-sm text-muted-foreground">Vos portefeuilles apparaîtront ici lorsqu’ils seront activés.</p></div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((w) => (
              <li key={w.id} className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md sm:p-5">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><WalletCards size={19}/></span><span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-extrabold text-muted-foreground">{w.currencies.code}</span></div>
                <p className="mt-4 text-xs font-semibold text-muted-foreground">Solde du portefeuille</p>
                <p className="mt-1 break-words text-2xl font-black tracking-tight text-foreground">{money(w.balance, w.currencies.code)}</p>
                {w.available_balance !== w.balance && <p className="mt-2 text-xs text-muted-foreground">Disponible : <strong className="text-foreground">{money(w.available_balance, w.currencies.code)}</strong></p>}
              </li>
            ))}
          </ul>
        )}
        {wallets && wallets.length > shown.length && <button type="button" onClick={() => setAll(true)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-accent hover:bg-accent/5">Afficher les {wallets.length} devises <ArrowRight size={15}/></button>}
        <p className="mt-4 rounded-xl border border-blue-200/60 bg-blue-50/70 p-3.5 text-xs leading-5 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">La recharge par Mobile Money ou carte sera disponible prochainement. En attendant, vous pouvez recevoir de l’argent d’un autre utilisateur JDV.</p>
      </section>

      <section className="mt-8" aria-labelledby="quick-actions-heading">
        <div className="mb-4"><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-accent">Accès rapide</p><h2 id="quick-actions-heading" className="mt-1 text-xl font-black text-foreground sm:text-2xl">Que souhaitez-vous faire ?</h2></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return <Link key={action.href} href={action.href} className="group flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.tone}`}><Icon size={21}/></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm font-extrabold text-foreground">{action.label}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{action.detail}</span></span>
              <ArrowRight size={16} className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent"/>
            </Link>;
          })}
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-accent">Activité du compte</p><h2 id="recent-heading" className="mt-1 text-lg font-black text-foreground">Dernières opérations</h2></div>
          <Link href="/pay/history" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-extrabold text-accent hover:bg-accent/5">Tout l’historique <ArrowRight size={15}/></Link>
        </div>
        <div className="px-4 sm:px-5">
          {txError ? <div role="alert" className="my-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><p className="font-bold">Impossible de charger les opérations.</p><p className="mt-1 text-xs opacity-80">{txError}</p><button type="button" onClick={loadRecentTransactions} disabled={retrying} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-current px-3 text-xs font-bold disabled:opacity-50">{retrying ? 'Chargement…' : 'Réessayer'}</button></div> : txs === null ? <div className="space-y-3 py-5"><div className="h-4 w-1/3 animate-pulse rounded bg-muted"/><div className="h-12 animate-pulse rounded bg-muted"/><div className="h-12 animate-pulse rounded bg-muted"/></div> : txs.length === 0 ? <div className="py-9 text-center"><History size={27} className="mx-auto text-muted-foreground"/><p className="mt-3 text-sm font-bold text-foreground">Aucune opération pour le moment</p><p className="mt-1 text-xs text-muted-foreground">Vos opérations récentes apparaîtront dans cet espace.</p><Link href="/pay/send" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground">Effectuer un envoi <ArrowRight size={14}/></Link></div> : (
            <ul className="divide-y divide-border">
              {txs.map((t) => {
                const incoming = IN_TYPES.includes(t.transaction_type);
                return <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${incoming ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{incoming ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</span>
                    <span className="min-w-0"><strong className="block truncate text-sm font-bold text-foreground">{TYPE_LABEL[t.transaction_type] ?? 'Opération'}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{t.description ?? t.reference} · {new Date(t.created_at).toLocaleDateString('fr-FR')}</span>{t.transaction_status !== 'completed' && <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{STATUS_LABEL[t.transaction_status] ?? t.transaction_status}</span>}</span>
                  </div>
                  <strong className={`shrink-0 text-sm font-black tabular-nums ${incoming ? 'text-emerald-700' : 'text-foreground'}`}>{incoming ? '+' : '−'}{money(Number(t.amount), t.currencies.code)}</strong>
                </li>;
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-border bg-muted/30 px-4 py-3 sm:px-5"><p className="text-[11px] leading-5 text-muted-foreground">Pour votre sécurité, vérifiez toujours le nom du bénéficiaire, les frais et le montant total avant de confirmer un transfert.</p></div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100"><ShieldCheck size={19} className="mt-0.5 shrink-0"/><p className="text-xs leading-5"><strong className="block text-sm">Gardez le contrôle de vos opérations.</strong> Consultez vos transactions et vérifiez chaque détail avant de valider un envoi.</p></div>
    </main>
  );
}
