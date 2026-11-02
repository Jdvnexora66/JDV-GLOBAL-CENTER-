'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, FileWarning, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const reasons = [
  { value: 'counterfeit', label: 'Produit potentiellement contrefait' },
  { value: 'misleading_listing', label: 'Annonce trompeuse ou fausse description' },
  { value: 'suspected_scam', label: 'Suspicion d’arnaque' },
  { value: 'seller_behavior', label: 'Comportement du vendeur' },
  { value: 'unsafe_product', label: 'Produit dangereux ou interdit' },
  { value: 'delivery_problem', label: 'Problème de livraison' },
  { value: 'order_dispute', label: 'Litige concernant une commande' },
  { value: 'other', label: 'Autre problème de sécurité' },
] as const;

export default function MarketplaceSafetyReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listingId, setListingId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setListingId(params.get('listing') || '');
    setSellerId(params.get('seller') || '');
    setOrderId(params.get('order') || '');
  }, []);
  const [reason, setReason] = useState(orderId ? 'order_dispute' : 'suspected_scam');
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/marketplace/connexion');
  }, [loading, user, router]);

  async function submit() {
    if (!user || busy) return;
    setError(''); setSuccess('');
    if (!listingId && !sellerId && !orderId) {
      setError('Ouvrez ce formulaire depuis une annonce, une boutique ou une commande afin de rattacher le signalement.');
      return;
    }
    if (details.trim().length < 30) {
      setError('Décrivez le problème en au moins 30 caractères afin de permettre son examen.');
      return;
    }
    if (reason === 'order_dispute' && !orderId) {
      setError('Un litige de commande doit être rattaché à une commande existante.');
      return;
    }
    setBusy(true);
    const { error: insertError } = await supabase.from('marketplace_safety_reports').insert({
      reporter_user_id: user.id,
      listing_id: listingId || null,
      seller_id: sellerId || null,
      order_id: orderId || null,
      report_type: reason,
      details: details.trim(),
      evidence_reference: evidence.trim() || null,
      status: 'received',
      severity: 'normal',
    });
    setBusy(false);
    if (insertError) {
      setError('Le signalement n’a pas pu être enregistré. Vérifiez que la migration de protection des acheteurs est installée sur l’environnement de test. ' + insertError.message);
      return;
    }
    setSuccess('Votre signalement a été transmis. Il reste privé et sera examiné par l’équipe de modération. Conservez vos preuves originales.');
    setDetails(''); setEvidence('');
  }

  if (loading) return <main className="grid min-h-screen place-items-center">Chargement…</main>;

  const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900';
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-2xl">
      <Link href="/marketplace" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16}/> Retour à JDV Marketplace</Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-amber-50 p-3 text-amber-700"><ShieldCheck size={25}/></span>
          <div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Protection des utilisateurs</p><h1 className="text-2xl font-black">Signaler un problème</h1></div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">Signalez une annonce suspecte, un vendeur ou un problème de commande. Les informations transmises sont privées et accessibles uniquement aux personnes autorisées à traiter le dossier.</p>
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="shrink-0"/><p>N’effectuez aucun paiement hors des moyens officiellement proposés par JDV Marketplace. Ne transmettez jamais votre mot de passe ni vos codes de validation.</p></div>
        {(listingId || sellerId || orderId) && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Dossier rattaché : {listingId ? 'annonce' : ''}{sellerId ? ' vendeur' : ''}{orderId ? ' commande' : ''}.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
        <label className="mt-6 block text-sm font-bold">Motif du signalement<select className={field} value={reason} onChange={e=>setReason(e.target.value)}>{reasons.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
        <label className="mt-4 block text-sm font-bold">Description détaillée *<textarea className={field} rows={6} maxLength={5000} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Expliquez ce qui s’est passé, les dates, les échanges et les éléments qui vous semblent suspects…"/></label>
        <label className="mt-4 block text-sm font-bold">Référence de preuve (facultatif)<input className={field} maxLength={500} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Référence de conversation, numéro de reçu ou lien interne"/></label>
        <p className="mt-2 text-xs text-slate-500">Ne collez pas de données bancaires, mots de passe ou documents d’identité dans ce champ. Le dépôt sécurisé de pièces justificatives sera raccordé dans une étape dédiée.</p>
        <button onClick={submit} disabled={busy || !user} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-5 font-extrabold text-[#10213d] disabled:opacity-50">{busy?<Loader2 size={17} className="animate-spin"/>:<FileWarning size={17}/>} Envoyer le signalement</button>
      </section>
    </div>
  </main>;
}
