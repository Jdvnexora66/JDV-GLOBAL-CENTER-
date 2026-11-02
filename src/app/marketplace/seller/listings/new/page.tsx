'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Package, DollarSign, Tag, Image as ImageIcon, Save, Loader2, AlertCircle, Plus, X, CheckCircle2, FileText, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Category = { id: string; name: string; slug: string };
type Currency = { id: string; code: string; symbol: string; name: string };
const productTypes = [
  { id: 'physical', name: 'Produit physique', detail: 'Articles matériels, stock et livraison', digital: false },
  { id: 'files', name: 'Fichiers numériques', detail: 'E-books, documents, modèles et ressources', digital: true },
  { id: 'course', name: 'Formation / cours', detail: 'Programmes pédagogiques et supports', digital: true },
  { id: 'license', name: 'Licence', detail: 'Clés, accès et autorisations d’utilisation', digital: true },
  { id: 'bundle', name: 'Pack / bundle', detail: 'Plusieurs produits réunis dans une offre', digital: true },
  { id: 'coaching', name: 'Coaching', detail: 'Accompagnement et séances personnalisées', digital: true },
  { id: 'service', name: 'Service', detail: 'Prestation réalisée pour un client', digital: false },
  { id: 'community', name: 'Communauté', detail: 'Accès à un espace ou groupe privé', digital: true },
];
const steps = ['Type de produit', 'Présentation', 'Prix et offre', 'Visuels', 'Contenu / livraison', 'Aperçu et publication'];

export default function NewListingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sellerStatus, setSellerStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: 'physical', title: '', short_description: '', description: '', delivery_notes: '',
    sku: '', price: '', compare_at_price: '', currency_id: '', stock_quantity: '0',
    track_inventory: true, allow_backorder: false, category_id: '', tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/marketplace/connexion'); return; }
    let active = true;
    (async () => {
      const [catRes, curRes, sellerRes] = await Promise.all([
        supabase.from('marketplace_categories').select('id,name,slug').eq('is_active', true).order('sort_order'),
        supabase.from('currencies').select('id,code,symbol,name').order('code'),
        supabase.from('marketplace_sellers').select('id,seller_status').eq('user_id', user.id).maybeSingle(),
      ]);
      if (!active) return;
      setCategories((catRes.data || []) as Category[]);
      setCurrencies((curRes.data || []) as Currency[]);
      if (sellerRes.error || !sellerRes.data) { router.replace('/marketplace/seller/create'); return; }
      setSellerId(sellerRes.data.id);
      setSellerStatus(sellerRes.data.seller_status || 'pending');
      const xof = (curRes.data || []).find((c: Currency) => c.code === 'XOF');
      if (xof) setForm(prev => ({ ...prev, currency_id: xof.id }));
      setLoading(false);
    })().catch(() => { if (active) { setError('Impossible de charger les données du formulaire.'); setLoading(false); } });
    return () => { active = false; };
  }, [authLoading, user, router, supabase]);

  const selectedType = productTypes.find(t => t.id === form.type) || productTypes[0];
  const update = (key: keyof typeof form, value: string | boolean | string[]) => setForm(prev => ({ ...prev, [key]: value } as typeof form));
  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (value && !form.tags.includes(value)) setForm(prev => ({ ...prev, tags: [...prev.tags, value] }));
    setTagInput('');
  };
  const addImage = () => {
    const value = imageInput.trim();
    if (/^https?:\/\//i.test(value) && !imageUrls.includes(value)) setImageUrls(prev => [...prev, value]);
    else if (value) setError('Ajoutez une adresse d’image commençant par https:// ou http://.');
    setImageInput('');
  };
  const validateStep = () => {
    if (step === 0 && !form.type) return 'Choisissez un type de produit.';
    if (step === 1 && form.title.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères.';
    if (step === 2) {
      const price = Number(form.price);
      if (!form.price || !Number.isFinite(price) || price < 0) return 'Indiquez un prix valide.';
      if (form.compare_at_price && Number(form.compare_at_price) < price) return 'Le prix barré doit être supérieur ou égal au prix de vente.';
    }
    if (step === 3 && imageUrls.some(url => !/^https?:\/\//i.test(url))) return 'Une adresse d’image est invalide.';
    return '';
  };
  const next = () => { const message = validateStep(); if (message) { setError(message); return; } setError(''); setStep(s => Math.min(s + 1, steps.length - 1)); };
  const save = async (status: 'draft' | 'published') => {
    if (!sellerId || saving) return;
    const message = validateStep();
    if (message && step !== 5) { setError(message); return; }
    if (status === 'published' && sellerStatus !== 'active') { setError('Votre boutique doit être validée avant la publication. Enregistrez ce produit en brouillon en attendant.'); return; }
    if (!form.title.trim() || !form.price || Number(form.price) < 0) { setStep(1); setError('Complétez le titre et le prix avant de continuer.'); return; }
    setSaving(true); setError('');
    try {
      const slug = form.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const description = [form.description.trim(), form.delivery_notes.trim() ? 'Informations de livraison / accès :\n' + form.delivery_notes.trim() : ''].filter(Boolean).join('\n\n');
      const tags = Array.from(new Set([...form.tags, 'type:' + form.type]));
      const { data: listing, error: listError } = await supabase.from('marketplace_listings').insert({
        seller_id: sellerId, title: form.title.trim(), slug,
        description: description || null, short_description: form.short_description.trim() || null,
        sku: form.sku.trim() || null, price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        currency_id: form.currency_id || null, stock_quantity: selectedType.digital ? 0 : Math.max(0, parseInt(form.stock_quantity, 10) || 0),
        track_inventory: selectedType.digital ? false : form.track_inventory,
        allow_backorder: selectedType.digital ? false : form.allow_backorder,
        category_id: form.category_id || null, tags, is_digital: selectedType.digital,
        listing_status: status, published_at: status === 'published' ? new Date().toISOString() : null,
      }).select('id').single();
      if (listError) throw listError;
      if (imageUrls.length) {
        const { error: mediaError } = await supabase.from('marketplace_listing_media').insert(imageUrls.map((url, index) => ({ listing_id: listing.id, url, media_type: 'image', sort_order: index, is_primary: index === 0 })));
        if (mediaError) throw mediaError;
      }
      setSuccess(true);
      window.setTimeout(() => router.push('/marketplace/seller'), 1300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le produit n’a pas pu être enregistré.');
    } finally { setSaving(false); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-background"><Loader2 size={30} className="animate-spin text-accent"/></main>;

  const field = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent';
  const label = 'mb-1.5 block text-xs font-bold text-muted-foreground';
  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4"><Link href="/marketplace/seller" className="btn-ghost p-2"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-widest text-accent">JDV Marketplace</p><h1 className="font-bold">Créer un produit</h1></div></div></header>
    <div className="mx-auto max-w-5xl px-4 py-7">
      <div className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-bold">Étape {step + 1} sur {steps.length} — {steps[step]}</p><span className="text-xs text-muted-foreground">{Math.round((step + 1) / steps.length * 100)} %</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent transition-all" style={{ width: ((step + 1) / steps.length * 100) + '%' }}/></div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{steps.map((name, i) => <button key={name} type="button" onClick={() => { if (i <= step) { setError(''); setStep(i); } }} className={'rounded-lg px-2 py-2 text-left text-[11px] font-semibold ' + (i === step ? 'bg-accent/15 text-accent' : i < step ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground')}>{i + 1}. {name}</button>)}</div>
      </div>
      {error && <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</p>}
      {success && <p role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success"><CheckCircle2 size={17}/>Produit enregistré. Redirection vers votre espace vendeur…</p>}

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        {step === 0 && <div><div className="mb-5 flex items-center gap-3"><Package className="text-accent"/><div><h2 className="text-xl font-black">Quel type de produit souhaitez-vous proposer ?</h2><p className="text-sm text-muted-foreground">Choisissez le format qui correspond à votre offre.</p></div></div><div className="grid gap-3 sm:grid-cols-2">{productTypes.map(type => <button type="button" key={type.id} onClick={() => update('type', type.id)} className={'rounded-xl border p-4 text-left transition ' + (form.type === type.id ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border hover:border-accent/50')}><span className="font-bold">{type.name}</span><p className="mt-1 text-xs text-muted-foreground">{type.detail}</p></button>)}</div></div>}
        {step === 1 && <div className="space-y-5"><div><h2 className="text-xl font-black">Présentez votre offre</h2><p className="text-sm text-muted-foreground">Un titre clair et une description utile aident les clients à comprendre ce qu’ils achètent.</p></div><label className="block"><span className={label}>Nom du produit *</span><input className={field} maxLength={160} value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Ex. Formation Excel pour débutants"/></label><label className="block"><span className={label}>Résumé court</span><input className={field} maxLength={240} value={form.short_description} onChange={e=>update('short_description',e.target.value)} placeholder="Présentez la valeur de votre offre en une phrase"/></label><label className="block"><span className={label}>Description détaillée</span><textarea className={field} rows={7} maxLength={10000} value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Contenu, bénéfices, public concerné, conditions…"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className={label}>Catégorie</span><select className={field} value={form.category_id} onChange={e=>update('category_id',e.target.value)}><option value="">Choisir une catégorie</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="block"><span className={label}>Référence / SKU (facultatif)</span><input className={field} value={form.sku} onChange={e=>update('sku',e.target.value)} maxLength={80}/></label></div><div><span className={label}>Mots-clés</span><div className="flex gap-2"><input className={field} value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag())} placeholder="Ajouter un mot-clé"/><button type="button" onClick={addTag} className="btn-outline px-3"><Plus size={16}/></button></div><div className="mt-2 flex flex-wrap gap-2">{form.tags.map(tag=><span key={tag} className="rounded-lg bg-accent/10 px-2 py-1 text-xs text-accent">#{tag}<button type="button" onClick={()=>update('tags',form.tags.filter(t=>t!==tag))} className="ml-1"><X size={11}/></button></span>)}</div></div></div>}
        {step === 2 && <div className="space-y-5"><div><h2 className="text-xl font-black">Définissez votre prix</h2><p className="text-sm text-muted-foreground">Aucune transaction ne sera déclenchée depuis cet écran.</p></div><div className="grid gap-4 sm:grid-cols-2"><label><span className={label}>Prix de vente *</span><input className={field} type="number" min="0" step="0.01" value={form.price} onChange={e=>update('price',e.target.value)} placeholder="0"/></label><label><span className={label}>Prix de référence (facultatif)</span><input className={field} type="number" min="0" step="0.01" value={form.compare_at_price} onChange={e=>update('compare_at_price',e.target.value)} placeholder="0"/></label></div><label className="block"><span className={label}>Devise</span><select className={field} value={form.currency_id} onChange={e=>update('currency_id',e.target.value)}><option value="">Sélectionner une devise</option>{currencies.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name} ({c.symbol})</option>)}</select></label>{!selectedType.digital && <div className="rounded-xl border border-border p-4"><h3 className="mb-3 font-bold">Stock et inventaire</h3><label className="block"><span className={label}>Quantité disponible</span><input className={field} type="number" min="0" value={form.stock_quantity} onChange={e=>update('stock_quantity',e.target.value)}/></label><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.track_inventory} onChange={e=>update('track_inventory',e.target.checked)}/> Suivre le stock</label><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allow_backorder} onChange={e=>update('allow_backorder',e.target.checked)}/> Autoriser les précommandes</label></div>}</div>}
        {step === 3 && <div className="space-y-5"><div className="flex items-center gap-3"><ImageIcon className="text-accent"/><div><h2 className="text-xl font-black">Ajoutez vos visuels</h2><p className="text-sm text-muted-foreground">La première image sera la couverture principale de la fiche.</p></div></div><div className="flex gap-2"><input className={field} type="url" value={imageInput} onChange={e=>setImageInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addImage())} placeholder="https://adresse-de-votre-image…"/><button type="button" onClick={addImage} className="btn-outline px-4"><Plus size={16}/></button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{imageUrls.map((url,i)=><div key={url} className="relative overflow-hidden rounded-xl border border-border"><img src={url} alt={'Visuel '+(i+1)} className="aspect-square w-full object-cover"/><button type="button" onClick={()=>setImageUrls(prev=>prev.filter(x=>x!==url))} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"><X size={14}/></button>{i===0&&<span className="absolute bottom-0 left-0 right-0 bg-accent/90 py-1 text-center text-xs font-bold text-white">Couverture</span>}</div>)}</div><p className="text-xs text-muted-foreground">Ajoutez des URL d’images hébergées. L’import direct de fichiers et la bibliothèque média nécessitent un raccordement au stockage Supabase qui sera traité séparément.</p></div>}
        {step === 4 && <div className="space-y-5"><div className="flex items-center gap-3"><FileText className="text-accent"/><div><h2 className="text-xl font-black">Précisez le contenu et la livraison</h2><p className="text-sm text-muted-foreground">Indiquez ce que le client recevra ou comment la prestation sera organisée.</p></div></div><label className="block"><span className={label}>Instructions d’accès / livraison</span><textarea className={field} rows={7} maxLength={5000} value={form.delivery_notes} onChange={e=>update('delivery_notes',e.target.value)} placeholder="Ex. Après validation de la commande, le client recevra les informations de prise de rendez-vous…"/></label><div className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-4 text-sm leading-6 text-amber-900">Pour le moment, ces instructions sont conservées dans la description du produit. Le dépôt sécurisé de fichiers, la délivrance automatique de licences et les espaces de cours/communauté ne sont pas activés dans cette étape.</div></div>}
        {step === 5 && <div className="space-y-5"><div className="flex items-center gap-3"><Eye className="text-accent"/><div><h2 className="text-xl font-black">Vérifiez votre fiche produit</h2><p className="text-sm text-muted-foreground">Relisez les informations avant de l’enregistrer.</p></div></div><div className="rounded-2xl border border-border p-5">{imageUrls[0]&&<img src={imageUrls[0]} alt="Couverture du produit" className="mb-4 max-h-64 w-full rounded-xl object-cover"/>}<p className="text-xs font-bold uppercase tracking-wider text-accent">{selectedType.name}</p><h3 className="mt-2 text-2xl font-black">{form.title||'Titre du produit'}</h3><p className="mt-2 text-sm text-muted-foreground">{form.short_description}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{form.description}</p><p className="mt-5 text-2xl font-black">{form.price||'0'} {currencies.find(c=>c.id===form.currency_id)?.code||''}</p><p className="mt-2 text-xs text-muted-foreground">{form.category_id ? categories.find(c=>c.id===form.category_id)?.name : 'Sans catégorie'} · {imageUrls.length} visuel(s)</p></div>{sellerStatus!=='active'&&<p className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-4 text-sm text-amber-900">Votre boutique est en attente de validation. Vous pouvez enregistrer ce produit en brouillon ; la publication sera disponible après validation.</p>}</div>}
        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row"><button type="button" disabled={step===0||saving} onClick={()=>{setError('');setStep(s=>s-1)}} className="btn-outline inline-flex items-center justify-center gap-2"><ArrowLeft size={16}/> Précédent</button>{step<5?<button type="button" onClick={next} className="btn-primary inline-flex items-center justify-center gap-2">Continuer <ArrowRight size={16}/></button>:<div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={saving||success} onClick={()=>save('draft')} className="btn-outline inline-flex items-center justify-center gap-2"><Save size={15}/> Enregistrer en brouillon</button><button type="button" disabled={saving||success||sellerStatus!=='active'} onClick={()=>save('published')} className="btn-primary inline-flex items-center justify-center gap-2">{saving?<Loader2 size={15} className="animate-spin"/>:<CheckCircle2 size={15}/>} Publier la fiche</button></div>}</div>
      </section>
    </div>
  </main>;
}
