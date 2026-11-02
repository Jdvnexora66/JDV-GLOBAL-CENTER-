'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Loader2, PackageCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Listing = { id: string; title: string; listing_status: string };
type Country = { id: string; name: string; iso_code: string };
type Trace = { id: string; listing_id: string; verification_status: string; origin_country_id: string | null; serial_number: string | null; batch_number: string | null; created_at: string };

export default function MarketplaceTraceabilityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sb = useMemo(() => createClient(), []);
  const [sellerId, setSellerId] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [records, setRecords] = useState<Trace[]>([]);
  const [listingId, setListingId] = useState('');
  const [origin, setOrigin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [supplier, setSupplier] = useState('');
  const [sourceType, setSourceType] = useState('reseller');
  const [serial, setSerial] = useState('');
  const [batch, setBatch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/marketplace/connexion'); return; }
    let active = true;
    (async () => {
      const [seller, countryRes] = await Promise.all([
        sb.from('marketplace_sellers').select('id').eq('user_id', user.id).maybeSingle(),
        sb.from('countries').select('id,name,iso_code').eq('is_active', true).order('name'),
      ]);
      if (!active) return;
      if (!seller.data) { router.replace('/marketplace/seller/create'); return; }
      setSellerId(seller.data.id);
      setCountries((countryRes.data || []) as Country[]);
      const [listingRes, traceRes] = await Promise.all([
        sb.from('marketplace_listings').select('id,title,listing_status').eq('seller_id', seller.data.id).order('created_at', { ascending: false }),
        sb.from('marketplace_product_traceability').select('id,listing_id,verification_status,origin_country_id,serial_number,batch_number,created_at').eq('seller_id', seller.data.id).order('created_at', { ascending: false }),
      ]);
      if (!active) return;
      setListings((listingRes.data || []) as Listing[]);
      setRecords((traceRes.data || []) as Trace[]);
    })().catch(() => { if (active) setError('Impossible de charger vos produits et leurs informations de traçabilité.'); });
    return () => { active = false; };
  }, [authLoading, user, router, sb]);

  async function submit() {
    if (!sellerId || !listingId || !origin || busy) { setError('Choisissez un produit et son pays d’origine.'); return; }
    setBusy(true); setError(''); setSuccess('');
    const { data, error: insertError } = await sb.from('marketplace_product_traceability').insert({
      listing_id: listingId, seller_id: sellerId, origin_country_id: origin,
      manufacturer_name: manufacturer.trim() || null, supplier_name: supplier.trim() || null,
      source_type: sourceType, serial_number: serial.trim() || null, batch_number: batch.trim() || null,
      seller_declaration: true, verification_status: 'submitted',
    }).select('id,listing_id,verification_status,origin_country_id,serial_number,batch_number,created_at').single();
    setBusy(false);
    if (insertError) { setError(insertError.message.includes('duplicate') ? 'Une fiche de traçabilité existe déjà pour ce produit. Elle sera affichée dans votre historique.' : 'Enregistrement impossible : ' + insertError.message); return; }
    setRecords(old => [data as Trace, ...old]);
    setListingId(''); setOrigin(''); setManufacturer(''); setSupplier(''); setSerial(''); setBatch('');
    setSuccess('Déclaration enregistrée. Elle reste « soumise » jusqu’au contrôle des justificatifs ; elle n’est pas encore certifiée.');
  }

  const label = 'mb-1 block text-xs font-bold text-slate-600';
  const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm';
  const status: Record<string,string> = { submitted: 'À vérifier', analyzing: 'Analyse en cours', verified: 'Traçabilité vérifiée', rejected: 'Refusée', review_required: 'Contrôle renforcé' };
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-4xl">
    <Link href="/marketplace/seller" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16}/> Espace vendeur</Link>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={24}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">JDV Marketplace</p><h1 className="text-2xl font-black">Traçabilité des produits</h1></div></div>
      <p className="mt-3 text-sm leading-6 text-slate-600">Déclarez l’origine et la chaîne d’approvisionnement de chaque produit. Les informations restent déclaratives jusqu’à vérification des preuves. Une déclaration ne constitue pas une certification d’authenticité.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label><span className={label}>Produit *</span><select className={field} value={listingId} onChange={e=>setListingId(e.target.value)}><option value="">Sélectionner un produit</option>{listings.map(x=><option key={x.id} value={x.id}>{x.title} · {x.listing_status}</option>)}</select></label>
        <label><span className={label}>Pays d’origine *</span><select className={field} value={origin} onChange={e=>setOrigin(e.target.value)}><option value="">Sélectionner un pays</option>{countries.map(x=><option key={x.id} value={x.id}>{x.name} ({x.iso_code})</option>)}</select></label>
        <label><span className={label}>Fabricant</span><input className={field} maxLength={160} value={manufacturer} onChange={e=>setManufacturer(e.target.value)}/></label>
        <label><span className={label}>Fournisseur / distributeur</span><input className={field} maxLength={160} value={supplier} onChange={e=>setSupplier(e.target.value)}/></label>
        <label><span className={label}>Type de provenance</span><select className={field} value={sourceType} onChange={e=>setSourceType(e.target.value)}><option value="manufacturer">Fabricant</option><option value="authorized_distributor">Distributeur agréé</option><option value="importer">Importateur</option><option value="reseller">Revendeur</option><option value="artisan">Artisan / producteur</option><option value="other">Autre</option></select></label>
        <label><span className={label}>Numéro de série</span><input className={field} maxLength={160} value={serial} onChange={e=>setSerial(e.target.value)}/></label>
        <label><span className={label}>Numéro de lot</span><input className={field} maxLength={160} value={batch} onChange={e=>setBatch(e.target.value)}/></label>
      </div>
      <button disabled={busy || !listingId || !origin} onClick={submit} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-5 font-extrabold text-[#10213d] disabled:opacity-50">{busy?<Loader2 size={17} className="animate-spin"/>:<PackageCheck size={17}/>} Enregistrer la traçabilité</button>
    </section>
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-extrabold">Historique des déclarations</h2>{records.length===0?<p className="mt-3 text-sm text-slate-500">Aucune déclaration pour le moment.</p>:<ul className="mt-3 divide-y divide-slate-100">{records.map(r=><li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{listings.find(x=>x.id===r.listing_id)?.title || 'Produit'} · {r.serial_number || r.batch_number || 'Sans numéro'}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{status[r.verification_status] || r.verification_status}</span></li>)}</ul>}</section>
  </div></main>;
}
