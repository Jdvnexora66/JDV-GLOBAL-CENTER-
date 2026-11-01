'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Factor = { id: string; friendly_name?: string | null; status: string };
type Enrolling = { factorId: string; qr: string; secret: string };

export default function MfaCard() {
  const sb = useMemo(() => createClient(), []);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<Enrolling | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disableChallenge, setDisableChallenge] = useState<{ factorId: string; challengeId: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb.auth.mfa.listFactors();
    if (error) {
      setMsg({ ok: false, text: 'Impossible de vérifier le statut 2FA. Réessayez dans quelques instants.' });
    } else {
      setFactors((data?.totp ?? []) as Factor[]);
    }
    setLoading(false);
  }, [sb]);

  useEffect(() => { void load(); }, [load]);

  const verified = factors.find((f) => f.status === 'verified');

  async function start() {
    setBusy(true);
    setMsg(null);
    for (const factor of factors.filter((x) => x.status !== 'verified')) {
      const { error } = await sb.auth.mfa.unenroll({ factorId: factor.id });
      if (error) {
        setBusy(false);
        setMsg({ ok: false, text: 'Une activation précédente doit être nettoyée avant de recommencer. Réactualisez le statut puis réessayez.' });
        return;
      }
    }
    const { data, error } = await sb.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `JDV ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error || !data) {
      setMsg({ ok: false, text: 'La double authentification n’est pas disponible pour le moment.' });
      return;
    }
    setEnrolling({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enrolling || !/^\d{6}$/.test(code)) {
      setMsg({ ok: false, text: 'Entrez le code à 6 chiffres.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { data: challenge, error: challengeError } = await sb.auth.mfa.challenge({ factorId: enrolling.factorId });
    if (challengeError || !challenge) {
      setBusy(false);
      setMsg({ ok: false, text: 'Impossible de vérifier le code pour le moment. Réessayez.' });
      return;
    }
    const { error } = await sb.auth.mfa.verify({ factorId: enrolling.factorId, challengeId: challenge.id, code });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: 'Code incorrect. Vérifiez l’heure de votre téléphone et réessayez.' });
      return;
    }
    setEnrolling(null);
    setCode('');
    setMsg({ ok: true, text: 'Double authentification activée.' });
    await load();
  }

  async function cancelEnrollment() {
    if (!enrolling) return;
    setBusy(true);
    const { error } = await sb.auth.mfa.unenroll({ factorId: enrolling.factorId });
    setBusy(false);
    setEnrolling(null);
    setCode('');
    setMsg(error
      ? { ok: false, text: 'L’activation incomplète n’a pas pu être supprimée. Vérifiez le statut avant de recommencer.' }
      : { ok: true, text: 'Activation annulée.' });
    await load();
  }

  async function beginDisable() {
    if (!verified || !window.confirm('Désactiver la double authentification ? Votre compte sera moins protégé.')) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await sb.auth.mfa.challenge({ factorId: verified.id });
    setBusy(false);
    if (error || !data) {
      setMsg({ ok: false, text: 'Impossible de lancer la vérification. Réessayez.' });
      return;
    }
    setDisableChallenge({ factorId: verified.id, challengeId: data.id });
    setCode('');
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!disableChallenge || !/^\\d{6}$/.test(code)) {
      setMsg({ ok: false, text: 'Entrez le code à 6 chiffres de votre application.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error: verifyError } = await sb.auth.mfa.verify({
      factorId: disableChallenge.factorId,
      challengeId: disableChallenge.challengeId,
      code,
    });
    if (verifyError) {
      setBusy(false);
      setMsg({ ok: false, text: 'Code incorrect. La double authentification reste active.' });
      return;
    }
    const { error } = await sb.auth.mfa.unenroll({ factorId: disableChallenge.factorId });
    setBusy(false);
    setDisableChallenge(null);
    setCode('');
    setMsg(error
      ? { ok: false, text: 'La désactivation n’a pas abouti. Votre facteur peut être encore actif ; actualisez le statut.' }
      : { ok: true, text: 'Double authentification désactivée après vérification.' });
    await load();
  }

  return (
    <section aria-labelledby="mfa-title" className="rounded-2xl border border-[var(--jdv-border)] bg-white p-6">
      <h2 id="mfa-title" className="text-lg font-semibold">Double authentification (2FA)</h2>
      <p className="mt-1 text-sm text-[var(--jdv-muted)]">Ajoute un code temporaire à votre mot de passe, depuis une application comme Google Authenticator ou Authy.</p>

      {loading && <p className="mt-4 text-sm text-[var(--jdv-muted)]" role="status">Vérification du statut de sécurité…</p>}
      {!loading && verified && !enrolling && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm"><span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Activée</span></p>
          <button type="button" onClick={beginDisable} disabled={busy} className="rounded-lg border border-[var(--jdv-border)] px-3 py-2 text-sm hover:bg-[var(--jdv-primary-soft)] disabled:opacity-60">Désactiver</button>
        </div>
      )}
      {!loading && !verified && !enrolling && (
        <button type="button" onClick={start} disabled={busy} className="mt-4 rounded-lg px-4 py-2 font-medium disabled:opacity-60" style={{ background: 'var(--jdv-primary)', color: 'var(--jdv-on-primary)' }}>Activer la 2FA</button>
      )}
      {disableChallenge && (
        <form onSubmit={confirmDisable} className="mt-4 space-y-3">
          <p className="text-sm font-medium">Confirmez la désactivation avec le code de votre application d’authentification.</p>
          <label className="block text-sm">Code à 6 chiffres
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\\D/g, ''))} className="mt-1 w-40 rounded-lg border border-[var(--jdv-border)] px-3 py-2 tracking-widest" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6} className="rounded-lg px-4 py-2 font-medium disabled:opacity-60" style={{ background: 'var(--jdv-primary)', color: 'var(--jdv-on-primary)' }}>Confirmer la désactivation</button>
            <button type="button" onClick={() => { setDisableChallenge(null); setCode(''); }} disabled={busy} className="rounded-lg border border-[var(--jdv-border)] px-4 py-2">Annuler</button>
          </div>
        </form>
      )}
      {enrolling && (
        <form onSubmit={confirm} className="mt-4 space-y-3">
          <p className="text-sm">1. Scannez ce QR code avec votre application d’authentification.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolling.qr} alt="QR code de configuration 2FA" className="h-44 w-44 rounded-lg border border-[var(--jdv-border)]" />
          <p className="text-sm">Ou saisissez cette clé manuellement : <code className="break-all rounded bg-[var(--jdv-primary-soft)] px-1.5 py-0.5">{enrolling.secret}</code></p>
          <label className="block text-sm">2. Entrez le code à 6 chiffres affiché
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="mt-1 w-40 rounded-lg border border-[var(--jdv-border)] px-3 py-2 tracking-widest" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6} className="rounded-lg px-4 py-2 font-medium disabled:opacity-60" style={{ background: 'var(--jdv-primary)', color: 'var(--jdv-on-primary)' }}>{busy ? 'Vérification…' : 'Confirmer'}</button>
            <button type="button" onClick={cancelEnrollment} disabled={busy} className="rounded-lg border border-[var(--jdv-border)] px-4 py-2 disabled:opacity-60">Annuler</button>
          </div>
        </form>
      )}
      {msg && <p role="status" aria-live="polite" className={`mt-3 text-sm ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>{msg.text}</p>}
    </section>
  );
}
