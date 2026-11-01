'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import PayHeader from '@/components/pay/PayHeader';
import { DOC_LABEL, LEVEL_LABEL, STATUS_TEXT, kycError, kycPath, validateKycFile, type DocType } from '@/lib/kyc/files';

type Status = { level: string; status: string; notes: string | null; expires_at: string | null; documents: { type: DocType; status: string; submitted_at: string }[]; missing: string[]; can_submit: boolean };
const DOC_STATE: Record<string, string> = { pending: 'Ajouté', under_review: 'En examen', approved: 'Validé', rejected: 'Refusé' };

export default function KycPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const sb = useMemo(() => createClient(), []);
  const [s, setS] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/auth/login?redirect=/pay/kyc'); }, [loading, user, router]);

  const load = useCallback(async () => {
    setLoadError(false);
    const { data, error } = await sb.rpc('kyc_my_status');
    if (error || !data) {
      setLoadError(true);
      return;
    }
    setS(data as Status);
  }, [sb]);

  useEffect(() => { if (user) void load(); }, [user, load]);

  const editable = !!s && ['none', 'pending', 'rejected', 'expired'].includes(s.status);

  async function upload(type: DocType, file: File | undefined) {
    if (!file || !user || busy) return;
    const err = validateKycFile(file, type);
    if (err) { toast.error(err); return; }
    setBusy(type);
    const path = kycPath(user.id, type, file.type);
    try {
      const up = await sb.storage.from('kyc-documents').upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) {
        toast.error(kycError(up.error.message));
        return;
      }
      const { error } = await sb.rpc('kyc_register_document', { p_document_type: type, p_storage_path: path });
      if (error) {
        // Best-effort cleanup: do not leave an unregistered upload behind.
        await sb.storage.from('kyc-documents').remove([path]);
        toast.error(kycError(error.message));
        return;
      }
      toast.success('Document ajouté. Son statut sera actualisé après vérification.');
      await load();
    } catch {
      toast.error('Impossible de transmettre ce document. Vérifiez votre connexion et réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!s?.can_submit || !consent || busy) return;
    setBusy('submit');
    try {
      const { error } = await sb.rpc('kyc_submit');
      if (error) {
        toast.error(kycError(error.message));
      } else {
        toast.success('Dossier envoyé pour examen.');
        setConsent(false);
        await load();
      }
    } catch {
      toast.error('La soumission a échoué. Vérifiez votre connexion et réessayez.');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <main className="mx-auto max-w-2xl px-4 py-6"><PayHeader title="Vérification d’identité" active="/pay/kyc" /><p className="text-sm text-muted-foreground" role="status">Vérification de votre session…</p></main>;
  if (!user) return <main className="mx-auto max-w-2xl px-4 py-6"><PayHeader title="Vérification d’identité" active="/pay/kyc" /><p className="text-sm text-muted-foreground">Redirection vers la connexion…</p></main>;
  if (loadError) return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <PayHeader title="Vérification d’identité" active="/pay/kyc" />
      <section className="jdv-card space-y-3 p-5" role="alert">
        <h2 className="font-semibold text-foreground">Statut temporairement indisponible</h2>
        <p className="text-sm text-muted-foreground">Nous n’avons pas pu récupérer votre dossier. Aucun document ne sera soumis tant que le statut n’aura pas été chargé.</p>
        <button type="button" onClick={() => void load()} className="btn-primary px-4 py-2">Réessayer</button>
      </section>
    </main>
  );
  if (!s) return <main className="mx-auto max-w-2xl px-4 py-6"><PayHeader title="Vérification d’identité" active="/pay/kyc" /><p className="text-sm text-muted-foreground" role="status">Chargement du dossier…</p></main>;

  const current = (t: DocType) => s.documents.find((d) => d.type === t);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <PayHeader title="Vérification d’identité" active="/pay/kyc" />
      <section aria-labelledby="st-title" className="jdv-card p-5">
        <h2 id="st-title" className="font-bold text-foreground">Votre statut : {STATUS_TEXT[s.status] ?? s.status}</h2>
        {s.status === 'approved' && <p className="mt-1 text-sm text-success">Niveau {LEVEL_LABEL[s.level] ?? s.level}{s.expires_at ? ` · valable jusqu’au ${new Date(s.expires_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}` : ''}. Les plafonds applicables sont déterminés par le serveur.</p>}
        {s.status === 'under_review' && <p className="mt-1 text-sm text-muted-foreground">Votre dossier est en cours d’examen. Vous serez informé de la décision.</p>}
        {s.status === 'rejected' && <p role="alert" className="mt-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">Dossier refusé. Motif communiqué : {s.notes || 'Aucun motif détaillé n’est disponible. Contactez l’assistance.'} Vous pouvez transmettre de nouveaux documents.</p>}
        {s.status === 'expired' && <p role="alert" className="mt-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">Votre vérification a expiré. Une nouvelle vérification est nécessaire.</p>}
        {(s.status === 'none' || s.status === 'pending') && <p className="mt-1 text-sm text-muted-foreground">La vérification d’identité permet d’établir votre niveau KYC. Les plafonds et opérations autorisés restent contrôlés par le serveur.</p>}
      </section>

      <section className="mt-5 rounded-xl border border-border bg-muted/30 p-4" aria-label="Étapes de vérification">
        <h2 className="text-sm font-semibold text-foreground">Étapes du dossier</h2>
        <ol className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <li className="rounded-lg bg-card p-3"><strong className="block text-foreground">1. Documents</strong>Ajoutez les pièces demandées.</li>
          <li className="rounded-lg bg-card p-3"><strong className="block text-foreground">2. Soumission</strong>Confirmez votre consentement et envoyez le dossier.</li>
          <li className="rounded-lg bg-card p-3"><strong className="block text-foreground">3. Examen</strong>Un statut sera communiqué après contrôle.</li>
        </ol>
      </section>

      <ul className="mt-5 space-y-3" aria-label="Documents demandés">
        {(Object.keys(DOC_LABEL) as DocType[]).map((t) => {
          const d = current(t); const def = DOC_LABEL[t];
          return (
            <li key={t} className="jdv-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-medium text-foreground">{def.title} {def.required ? <span className="text-xs text-accent">obligatoire</span> : <span className="text-xs text-muted-foreground">facultatif</span>}</p>
                  <p className="text-xs text-muted-foreground">{def.hint}</p></div>
                {d && <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground">{DOC_STATE[d.status] ?? d.status}</span>}
              </div>
              {editable && (
                <div className="mt-3">
                  <input type="file" className="sr-only" id={`f-${t}`} accept={def.imageOnly ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'}
                    disabled={!!busy}
                    onChange={(e) => { void upload(t, e.target.files?.[0]); e.target.value = ''; }} />
                  <label htmlFor={`f-${t}`} className={`btn-ghost inline-block cursor-pointer px-4 py-2 text-sm ${busy ? 'pointer-events-none opacity-60' : ''}`}>{busy === t ? 'Envoi…' : d ? 'Remplacer' : 'Choisir un fichier'}</label>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editable && (
        <section className="jdv-card mt-5 space-y-3 p-5">
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>Je confirme que les documents transmis me concernent, que les informations fournies sont exactes et que j’autorise leur utilisation pour l’examen de mon identité dans le cadre de JDV PAY.</span>
          </label>
          <button type="button" onClick={submit} disabled={!s.can_submit || !consent || !!busy} className="btn-primary w-full px-4 py-2.5 disabled:opacity-50">{busy === 'submit' ? 'Envoi du dossier…' : 'Envoyer mon dossier'}</button>
          {!s.can_submit && s.missing.length > 0 && <p className="text-xs text-muted-foreground">Documents requis manquants : {s.missing.map((m) => DOC_LABEL[m as DocType]?.title.toLowerCase() ?? m).join(', ')}.</p>}
        </section>
      )}
      <p className="mt-5 text-xs text-muted-foreground">Formats acceptés : JPG, PNG, WebP ou PDF selon le document, 5 Mo maximum par fichier. Ne transmettez jamais vos pièces d’identité par messagerie ou à une personne non habilitée. Consultez les informations de confidentialité de JDV PAY pour connaître les règles de conservation et de traitement applicables.</p>
    </main>
  );
}
