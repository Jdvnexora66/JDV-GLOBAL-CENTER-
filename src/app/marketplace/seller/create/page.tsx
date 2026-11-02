'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Store, Loader2, AlertCircle, CheckCircle2, UserRound, Globe2, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Country = { id: string; name: string; iso_code: string };
const slugify = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function StoreField({ label, value, onChange, placeholder, required = false, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#17233d]">{label}{required && ' *'}
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-normal outline-none transition focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/15" />
    </label>
  );
}

const stages = [
  { title: 'Identité de la boutique', detail: 'Donnez un nom à votre espace de vente.', icon: Store },
  { title: 'Présentation', detail: 'Expliquez votre activité et comment vous joindre.', icon: UserRound },
  { title: 'Présence en ligne', detail: 'Ajoutez votre site et votre localisation.', icon: Globe2 },
  { title: 'Vérification', detail: 'Relisez les informations avant l’envoi.', icon: ClipboardCheck },
];

export default function CreateSellerStorePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countryError, setCountryError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ shop_name: '', description: '', phone: '', email: '', country_id: '', city: '', address: '', website: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/marketplace/connexion?mode=register'); return; }
    let active = true;
    (async () => {
      const [membershipResult, sellerResult, countryResult] = await Promise.all([
        supabase.from('app_memberships').select('id,status').eq('user_id', user.id).eq('app_key', 'marketplace').maybeSingle(),
        supabase.from('marketplace_sellers').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('countries').select('id,name,iso_code').eq('is_active', true).order('name')
      ]);
      if (!active) return;
      if (countryResult.error) setCountryError('Impossible de charger les pays : ' + countryResult.error.message);
      else setCountries((countryResult.data || []) as Country[]);
      setCountriesLoading(false);
      if (membershipResult.error || !membershipResult.data || membershipResult.data.status !== 'active') {
        setError('Votre accès Marketplace n’est pas encore activé. Connectez-vous ou terminez votre inscription dédiée à JDV Marketplace.');
        setLoading(false);
        return;
      }
      if (sellerResult.data) { router.replace('/marketplace/seller'); return; }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [authLoading, user, router, supabase]);

  const update = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));
  const next = () => {
    setError('');
    if (step === 0 && (form.shop_name.trim().length < 3 || !form.country_id || !countries.some(country => country.id === form.country_id))) {
      setError('Indiquez un nom de boutique (3 caractères minimum) et choisissez votre pays.');
      return;
    }
    if (step === 1 && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Adresse e-mail invalide.');
      return;
    }
    setStep(current => Math.min(current + 1, stages.length - 1));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || saving) return;
    const name = form.shop_name.trim();
    const slug = slugify(name);
    if (name.length < 3 || !slug || !form.country_id || !countries.some(country => country.id === form.country_id)) {
      setStep(0);
      setError('Le nom de la boutique et le pays sont obligatoires.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    const result = await supabase.from('marketplace_sellers').insert({
      user_id: user.id,
      shop_name: name,
      shop_slug: slug + '-' + user.id.slice(0, 6),
      description: form.description.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || user.email || null,
      country_id: form.country_id,
      city: form.city.trim() || null,
      address: form.address.trim() || null,
      website: form.website.trim() || null,
      seller_status: 'pending',
      is_verified: false
    }).select('id').single();
    setSaving(false);
    if (result.error) {
      setError(result.error.code === '23505' ? 'Une boutique avec cette adresse existe déjà. Choisissez un autre nom.' : 'La boutique n’a pas pu être créée. Vérifiez les champs et vos droits, puis réessayez.');
      return;
    }
    setSuccess('Votre boutique est créée et transmise pour vérification. Aucun paiement ni retrait n’a été activé.');
    window.setTimeout(() => router.replace('/marketplace/seller'), 1200);
  };

  if (authLoading || loading) return <main className="grid min-h-screen place-items-center bg-[#f5f7fb] text-[#0B1B3D]"><Loader2 className="animate-spin" size={30} /></main>;

  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-[#0B1B3D] sm:px-6">
    <div className="mx-auto max-w-5xl">
      <Link href="/marketplace" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0B1B3D]"><ArrowLeft size={16}/> Retour au marché</Link>
      <div className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[300px_1fr]">
        <aside className="bg-gradient-to-br from-[#0B1B3D] via-[#102849] to-[#173967] p-6 text-white sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F28C28] text-[#10213d]"><Store size={24}/></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#ffb56f]">JDV Marketplace</p>
          <h1 className="mt-2 text-2xl font-black leading-tight">Construisons votre boutique, étape par étape.</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">Un parcours guidé inspiré des bonnes pratiques des plateformes de créateurs, adapté aux vendeurs JDV.</p>
          <div className="mt-8 space-y-4">
            {stages.map((item, index) => {
              const Icon = item.icon;
              return <div key={item.title} className="flex items-start gap-3">
                <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border '+(index === step ? 'border-[#F28C28] bg-[#F28C28] text-[#10213d]' : index < step ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-200' : 'border-white/15 bg-white/5 text-white/45')}><Icon size={17}/></div>
                <div><p className={'text-sm font-bold '+(index === step ? 'text-white' : 'text-white/65')}>{item.title}</p><p className="mt-0.5 text-xs leading-5 text-white/45">{item.detail}</p></div>
              </div>;
            })}
          </div>
          <p className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/55">Aucune transaction financière n’est réalisée pendant cette configuration. Votre boutique reste en attente de validation.</p>
        </aside>

        <section className="p-5 sm:p-9">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D96C12]">Configuration vendeur</p><h2 className="mt-1 text-2xl font-black">{stages[step].title}</h2><p className="mt-1 text-sm text-slate-500">{stages[step].detail}</p></div>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#9a4b0b]">Étape {step + 1} / {stages.length}</span>
          </div>
          <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#F28C28] transition-all" style={{width: ((step + 1) / stages.length * 100) + '%'}}/></div>

          {error && <p role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="shrink-0"/>{error}</p>}
          {success && <p role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={17}/>{success}</p>}

          <form onSubmit={submit}>
            {step === 0 && <div className="grid gap-5">
              <StoreField label="Nom de la boutique" value={form.shop_name} onChange={v=>update('shop_name',v)} placeholder="Ex. Les créations de Marie" required/>
              <label className="grid gap-2 text-sm font-semibold">Pays d’activité *
                <select required disabled={countriesLoading || Boolean(countryError) || countries.length === 0} value={form.country_id} onChange={e=>update('country_id',e.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-normal outline-none focus:border-[#F28C28]"><option value="">{countriesLoading ? 'Chargement des pays…' : countries.length ? 'Sélectionner votre pays' : 'Aucun pays disponible'}</option>{countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
              {countryError && <span role="alert" className="text-xs font-medium text-red-600">{countryError}</span>}
              {!countriesLoading && !countryError && countries.length === 0 && <span role="alert" className="text-xs text-red-600">La liste des pays est vide. Vérifiez les pays actifs et les autorisations de lecture.</span>}
              </label>
              <p className="text-xs leading-5 text-slate-500">Le nom servira à identifier votre boutique. Son adresse JDV sera générée automatiquement.</p>
            </div>}
            {step === 1 && <div className="grid gap-5">
              <label className="grid gap-2 text-sm font-semibold">Description de votre activité
                <textarea rows={5} maxLength={1000} value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Présentez vos produits, votre expertise et ce qui rend votre boutique unique…" className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#F28C28]"/>
              </label>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Téléphone professionnel" value={form.phone} onChange={v=>update('phone',v)} placeholder="+229 …"/><Field label="E-mail de contact" value={form.email} onChange={v=>update('email',v)} placeholder={user?.email || 'contact@exemple.com'} type="email"/></div>
            </div>}
            {step === 2 && <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Ville" value={form.city} onChange={v=>update('city',v)} placeholder="Cotonou"/><Field label="Adresse (facultatif)" value={form.address} onChange={v=>update('address',v)} placeholder="Quartier, rue…"/></div>
              <StoreField label="Site web ou page professionnelle" value={form.website} onChange={v=>update('website',v)} placeholder="https://…"/>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">Les liens vers les réseaux sociaux et les éléments graphiques du profil seront ajoutés dans les paramètres de la boutique après sa création. Ils ne sont pas enregistrés dans des champs non vérifiés de la base actuelle.</div>
            </div>}
            {step === 3 && <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold">Identité</h3><p className="mt-2 text-sm text-slate-600">{form.shop_name || '—'} · {countries.find(c=>c.id===form.country_id)?.name || 'Pays non sélectionné'}</p>
                <h3 className="mt-5 font-bold">Présentation et contact</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{form.description || 'Aucune description'}<br/>{form.phone || 'Téléphone non renseigné'} · {form.email || user?.email || 'E-mail non renseigné'}</p>
                <h3 className="mt-5 font-bold">Présence</h3><p className="mt-2 text-sm text-slate-600">{[form.city,form.address,form.website].filter(Boolean).join(' · ') || 'Non renseignée'}</p>
              </div>
              <p className="text-sm leading-6 text-slate-500">En confirmant, vous créez une boutique au statut « en attente ». La publication commerciale restera soumise à validation. Aucun moyen de paiement réel n’est configuré ni déclenché.</p>
            </div>}
            <div className="mt-9 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button type="button" disabled={step===0 || saving} onClick={()=>{setError('');setStep(s=>s-1)}} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 disabled:opacity-40"><ArrowLeft size={16}/> Précédent</button>
              {step < stages.length - 1 ? <button type="button" onClick={next} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-6 text-sm font-extrabold text-[#10213d] hover:bg-[#ffab52]">Continuer <ArrowRight size={16}/></button> : <button type="submit" disabled={saving || !!success} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-6 text-sm font-extrabold text-[#10213d] disabled:opacity-60">{saving ? <Loader2 size={17} className="animate-spin"/> : <CheckCircle2 size={17}/>} Confirmer et créer ma boutique</button>}
            </div>
          </form>
        </section>
      </div>
    </div>
  </main>;
}
