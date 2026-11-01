'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import PayHeader from '@/components/pay/PayHeader';
import { IN_TYPES, STATUS_LABEL, TYPE_LABEL, money, type PayTx } from '@/lib/pay/types';

export default function ReceiptPage() {
  const id = String(useParams()?.id ?? '');
  const { user, loading } = useAuth();
  const router = useRouter();
  const sb = useMemo(() => createClient(), []);
  const [tx, setTx] = useState<PayTx | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push(`/auth/login?redirect=${encodeURIComponent(`/pay/receipt/${id}`)}`);
  }, [loading, user, router, id]);

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    sb.from('wallet_transactions')
      .select('id,transaction_type,amount,fee_amount,transaction_status,description,reference,created_at,balance_after,currencies:currency_id(code)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setLoadError(true);
        setTx(data ? data as unknown as PayTx : null);
      });
    return () => { active = false; };
  }, [user, id, sb]);

  if (loading || tx === undefined) return <main className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted-foreground">Chargement du reçu…</main>;
  if (!user) return null;
  if (loadError || !tx) return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="jdv-card p-6 text-center">
        <p className="font-semibold text-foreground">Reçu indisponible</p>
        <p className="mt-2 text-sm text-muted-foreground">Cette opération est introuvable ou n’est pas accessible depuis votre compte.</p>
        <Link href="/pay/history" className="mt-4 inline-flex items-center gap-2 text-sm text-accent underline"><ArrowLeft size={14} />Retour à l’historique</Link>
      </div>
    </main>
  );

  const completed = tx.transaction_status === 'completed';
  const incoming = IN_TYPES.includes(tx.transaction_type);
  const date = new Date(tx.created_at);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="print:hidden"><PayHeader title="Reçu de transaction" active="/pay/history" /></div>
      <section className="jdv-card mx-auto max-w-xl p-6 sm:p-8 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">JDV PAY</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground">Reçu de transaction</h1>
            <p className="mt-1 text-sm text-muted-foreground">Document récapitulatif</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${completed ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
            {STATUS_LABEL[tx.transaction_status] ?? tx.transaction_status}
          </span>
        </div>

        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">{TYPE_LABEL[tx.transaction_type] ?? 'Opération'}</p>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{incoming ? '+' : '−'}{money(Number(tx.amount), tx.currencies.code)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Référence : <span className="font-mono text-foreground">{tx.reference ?? tx.id}</span></p>
        </div>

        <dl className="divide-y divide-border border-y border-border text-sm">
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Date et heure</dt><dd className="text-right font-medium text-foreground">{date.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Montant</dt><dd className="text-right font-medium text-foreground">{money(Number(tx.amount), tx.currencies.code)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Frais</dt><dd className="text-right font-medium text-foreground">{money(Number(tx.fee_amount ?? 0), tx.currencies.code)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Type d’opération</dt><dd className="text-right font-medium text-foreground">{TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type}</dd></div>
          {tx.description && <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Description</dt><dd className="max-w-[65%] text-right font-medium text-foreground">{tx.description}</dd></div>}
        </dl>

        {!completed && <p role="alert" className="mt-5 rounded-lg bg-warning/10 p-3 text-xs text-warning">Attention : cette opération n’est pas marquée comme terminée. Ce document ne constitue pas une preuve de paiement effectué.</p>}

        <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <p>Ces informations sont affichées depuis l’historique JDV PAY de votre compte. Ce reçu est un récapitulatif imprimable ; il ne dispose pas encore d’une vérification publique indépendante par QR code.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2 px-4 py-2"><Printer size={15} />Imprimer / Enregistrer en PDF</button>
          <Link href="/pay/history" className="btn-ghost inline-flex items-center gap-2 px-4 py-2"><ArrowLeft size={15} />Historique</Link>
        </div>
      </section>
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body { background: white !important; color: #111827 !important; }
          main { max-width: 100% !important; padding: 0 !important; }
          .jdv-card { background: white !important; color: #111827 !important; }
        }
      `}</style>
    </main>
  );
}
