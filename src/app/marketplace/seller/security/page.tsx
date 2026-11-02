'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Upload, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Seller = { id: string; shop_name: string };
type DocType = 'national_id' | 'passport' | 'drivers_license' | 'residence_permit' | 'business_registration';
const types: { value: DocType; label: string; expiry: boolean }[] = [
  { value: 'national_id', label: 'Carte nationale d’identité', expiry: true },
  { value: 'passport', label: 'Passeport', expiry: true },
  { value: 'drivers_license', label: 'Permis de conduire', expiry: true },
  { value: 'residence_permit', label: 'Titre de séjour', expiry: true },
  { value: 'business_registration', label: 'Document d’immatriculation professionnelle', expiry: false },
];

export default function MarketplaceSellerSecurityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [type, setType] = useState<DocType>('national_id');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<{id:string;document_type:string;document_status:string;rejection_reason:string|null;expires_at:string|null;created_at:string}[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/marketplace/connexion'); return; }
    let live = true;
    (async () => {
      const { data } = await supabase.from('marketplace_sellers').select('id,shop_name').eq('user_id', user.id).maybeSingle();
      if (!live) return;
      if (!data) { router.replace('/marketplace/seller/create'); return; }
      setSeller(data as Seller);
      const { data: docs } = await supabase.from('marketplace_seller_kyc_documents').select('id,document_type,document_status,rejection_reason,expires_at,created_at').eq('seller_id', data.id).order('created_at', { ascending: false });
      if (live) setDocuments((docs || []) as typeof documents);
    })();
    return () => { live = false; };
  }, [authLoading, user, router, supabase]);

  async function submit() {
    if (!user || !seller || !file || busy) return;
    setError(''); setMessage('');
    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) { setError('Format refusé. Utilisez JPG, PNG, WebP ou PDF.'); return; }
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) { setError('Le fichier doit peser entre 1 octet et 5 Mo.'); return; }
    const definition = types.find(x => x.value === type)!;
    if (definition.expiry && !expiry) { setError('La date d’expiration est obligatoire pour toute pièce d’identité.'); return; }
    if (definition.expiry && expiry < new Date().toISOString().slice(0,10)) { setError('Cette pièce est expirée : elle est automatiquement refusée. Téléversez un document en cours de validité.'); return; }
    setBusy(true);
    const extension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1].replace('jpeg','jpg');
    const path = user.id + '/marketplace-' + crypto.randomUUID() + '.' + extension;
    const upload = await supabase.storage.from('kyc-documents').upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) { setBusy(false); setError('Téléversement impossible : ' + upload.error.message); return; }
    const { data, error: insertError } = await supabase.from('marketplace_seller_kyc_documents').insert({
      seller_id: seller.id, user_id: user.id, document_type: type, storage_path: path,
      expires_at: definition.expiry ? expiry : null,
      document_status: 'submitted', quality_status: 'pending',
    }).select('id,document_type,document_status,rejection_reason,expires_at,created_at').single();
    setBusy(false);
    if (insertError) {
      await supabase.storage.from('kyc-documents').remove([path]);
      setError('Le document n’a pas pu être enregistré. ' + insertError.message);
      return;
    }
    setDocuments(old => [data as typeof documents[number], ...old]);
    setFile(null); setExpiry('');
    setMessage(data.document_status === 'rejected' ? 'Document automatiquement rejeté : sa date d’expiration est absente ou dépassée.' : 'Document reçu. Il doit maintenant passer les contrôles de lisibilité, d’authenticité et de KYC.');
  }

  const statusLabel: Record<string,string> = { submitted: 'Reçu', analyzing: 'Analyse en cours', accepted: 'Accepté', rejected: 'Rejeté automatiquement', review_required: 'Contrôle renforcé' };
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-3xl">
      <Link href="/marketplace/seller" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16}/> Espace vendeur</Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={25}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Sécurité JDV Marketplace</p><h1 className="text-2xl font-black">Vérification des documents vendeur</h1></div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">Boutique : <strong>{seller?.shop_name || 'Chargement…'}</strong>. Les pièces sont déposées dans le stockage privé KYC. Les documents illisibles, flous ou expirés sont refusés ; une pièce expirée ne peut jamais valider votre identité.</p>
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="shrink-0" size={18}/><p>La date d’expiration est obligatoire pour les pièces d’identité. Les documents expirés sont rejetés automatiquement par la règle serveur, même si la date a été saisie par erreur dans le formulaire.</p></div>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/>{message}</p>}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Type de document<select className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3" value={type} onChange={e=>setType(e.target.value as DocType)}>{types.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
          {types.find(x=>x.value===type)?.expiry && <label className="text-sm font-semibold">Date d’expiration *<input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3" type="date" min={new Date().toISOString().slice(0,10)} value={expiry} onChange={e=>setExpiry(e.target.value)} required/></label>}
        </div>
        <label className="mt-4 block text-sm font-semibold">Fichier du document *<input className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)}/><span className="mt-1 block text-xs font-normal text-slate-500">JPG, PNG, WebP ou PDF · 5 Mo maximum · photo nette, sans reflet, document entier visible.</span></label>
        <button type="button" disabled={busy || !file || !seller} onClick={submit} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-5 font-extrabold text-[#10213d] disabled:opacity-50">{busy?<Loader2 size={17} className="animate-spin"/>:<Upload size={17}/>} Envoyer le document</button>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-extrabold">Historique des documents</h2>
        {documents.length===0 ? <p className="mt-3 text-sm text-slate-500">Aucun document transmis pour le moment.</p> : <ul className="mt-4 divide-y divide-slate-100">{documents.map(d=><li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{types.find(x=>x.value===d.document_type)?.label || d.document_type}{d.expires_at ? ' · expire le '+new Date(d.expires_at+'T00:00:00').toLocaleDateString('fr-FR') : ''}</span><span className={'rounded-full px-3 py-1 text-xs font-bold '+(d.document_status==='accepted'?'bg-emerald-50 text-emerald-700':d.document_status==='rejected'?'bg-red-50 text-red-700':'bg-amber-50 text-amber-800')}>{statusLabel[d.document_status] || d.document_status}{d.rejection_reason==='DOCUMENT_EXPIRED'?' · expiré':d.rejection_reason==='DOCUMENT_UNREADABLE'?' · illisible':d.rejection_reason==='DOCUMENT_UNCLEAR'?' · peu clair':''}</span></li>)}</ul>}
      </section>
    </div>
  </main>;
}
