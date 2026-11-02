'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type DigitalAsset = {
  id: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  marketplace_listings: { title: string } | null;
};

export default function MarketplaceDownloadsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState<string | null>(null);

  const loadAssets = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('marketplace_digital_assets')
      .select('id,storage_path,file_name,content_type,size_bytes,created_at,marketplace_listings(title)')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError(queryError.message.includes('marketplace_digital_assets')
        ? 'La livraison numérique sécurisée sera disponible après activation de la migration JDV Marketplace correspondante.'
        : 'Impossible de charger vos fichiers. Vérifiez votre connexion puis réessayez.');
      setAssets([]);
    } else {
      setAssets((data || []) as unknown as DigitalAsset[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/marketplace/connexion'); return; }
    let active = true;
    void (async () => {
      const { data: membership, error: membershipError } = await supabase
        .from('app_memberships').select('id,status')
        .eq('user_id', user.id).eq('app_key', 'marketplace').maybeSingle();
      if (!active) return;
      if (membershipError || membership?.status !== 'active') {
        setError('Votre accès JDV Marketplace doit être activé pour consulter vos téléchargements.');
        setLoading(false);
        return;
      }
      await loadAssets();
    })();
    return () => { active = false; };
  }, [authLoading, user, router, supabase]);

  const download = async (asset: DigitalAsset) => {
    setOpening(asset.id);
    setError('');
    const { data, error: signedError } = await supabase.storage
      .from('jdv-marketplace-digital')
      .createSignedUrl(asset.storage_path, 60, { download: asset.file_name });
    setOpening(null);
    if (signedError || !data?.signedUrl) {
      setError('Ce fichier n’est pas accessible. Vérifiez que votre commande a bien été validée.');
      return;
    }
    window.location.assign(data.signedUrl);
  };

  const formatSize = (size: number) => size >= 1024 * 1024
    ? (size / 1024 / 1024).toFixed(1) + ' Mo'
    : Math.max(1, Math.round(size / 1024)) + ' Ko';

  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Link href="/marketplace" className="btn-ghost p-2"><ArrowLeft size={18}/></Link>
        <div><p className="text-xs font-bold uppercase tracking-widest text-accent">JDV Marketplace</p><h1 className="font-bold">Mes téléchargements</h1></div>
      </div>
    </header>
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-success"/>
        <div><h2 className="font-bold">Vos contenus numériques</h2><p className="mt-1 text-sm text-muted-foreground">Les fichiers privés sont accessibles uniquement après validation de la commande. Les liens de téléchargement sont temporaires et expirent après 60 secondes.</p></div>
      </div>
      {error && <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</p>}
      {loading ? <div className="grid min-h-40 place-items-center"><Loader2 className="animate-spin text-accent" size={28}/></div>
      : assets.length === 0 ? <div className="rounded-2xl border border-border bg-card p-10 text-center"><FileText size={36} className="mx-auto mb-3 text-muted-foreground/40"/><h2 className="font-bold">Aucun fichier disponible</h2><p className="mt-2 text-sm text-muted-foreground">Les fichiers associés à vos achats validés apparaîtront ici.</p><Link href="/marketplace/orders" className="btn-outline mt-5 inline-flex">Voir mes commandes</Link></div>
      : <div className="space-y-3">{assets.map(asset=><article key={asset.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><FileText size={20}/></div><div className="min-w-0"><h3 className="truncate font-semibold">{asset.file_name}</h3><p className="mt-0.5 truncate text-xs text-muted-foreground">{asset.marketplace_listings?.title || 'Produit numérique'} · {formatSize(asset.size_bytes)}</p></div></div><button type="button" onClick={()=>void download(asset)} disabled={opening===asset.id} className="btn-primary inline-flex items-center justify-center gap-2 text-sm">{opening===asset.id?<Loader2 size={15} className="animate-spin"/>:<Download size={15}/>} Télécharger</button></article>)}</div>}
      {!loading && <button type="button" onClick={()=>void loadAssets()} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><RefreshCw size={13}/> Actualiser</button>}
    </section>
  </main>;
}
