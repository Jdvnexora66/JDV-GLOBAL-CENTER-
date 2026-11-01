'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight, Building2, CalendarDays, ClipboardList, FileText,
  Heart, House, LayoutDashboard, RefreshCw, Users, Wrench, HardHat,
  ShieldCheck, Search, UserRound, Wallet,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { hasApplicationMembership } from '@/lib/apps/access';

type Counts = {
  properties: number;
  appointments: number;
  leases: number;
  maintenance: number;
  favorites: number;
  requests: number;
};

const initialCounts: Counts = {
  properties: 0, appointments: 0, leases: 0, maintenance: 0, favorites: 0, requests: 0,
};

const workspaces = [
  {
    title: 'Acheteur & locataire',
    description: 'Explorer les annonces, enregistrer des favoris et suivre les demandes de visite.',
    icon: Search,
    href: '/immo',
    tag: 'Catalogue immobilier',
  },
  {
    title: 'Propriétaire',
    description: 'Retrouver les outils de gestion des biens, des baux, des états des lieux et de la maintenance.',
    icon: House,
    href: '/immo/gestion',
    tag: 'Gestion des biens',
  },
  {
    title: 'Agent & agence',
    description: 'Accéder à l’espace réseau immobilier et aux outils de collaboration disponibles.',
    icon: Users,
    href: '/immo/partenaires',
    tag: 'Réseau & partenaires',
  },
  {
    title: 'Gestion locative',
    description: 'Consulter les dossiers de bail, les suivis, les échéances et les événements enregistrés.',
    icon: ClipboardList,
    href: '/immo/locataires',
    tag: 'Baux & locataires',
  },
  {
    title: 'Construction & promoteur',
    description: 'Préparer un projet, un brief de construction et explorer les parcours de conception.',
    icon: HardHat,
    href: '/immo/construction',
    tag: 'Projets immobiliers',
  },
];

function Metric({ label, value, icon: Icon, note }: {
  label: string;
  value: number;
  icon: typeof Building2;
  note: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[.045] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#F28C28]/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/60">{label}</span>
        <span className="rounded-xl bg-[#F28C28]/10 p-2.5 text-[#F28C28]"><Icon size={19} /></span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">{value.toLocaleString('fr-FR')}</p>
      <p className="mt-1 text-xs text-white/35">{note}</p>
    </article>
  );
}

export default function ImmoDashboardPage() {
  const { user, profile, loading, isSuperAdmin } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [member, setMember] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setCounts(initialCounts);
      setMember(false);
      setRoles([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    setError('');

    const membership = await hasApplicationMembership(supabase, user.id, 'immo');
    setMember(membership || isSuperAdmin);

    const [properties, appointments, leases, maintenance, favorites, requests, owned, agent, tenant] = await Promise.all([
      supabase.from('immo_properties').select('id', { count: 'exact', head: true }),
      supabase.from('immo_appointments').select('id', { count: 'exact', head: true }).eq('requester_user_id', user.id),
      supabase.from('immo_leases').select('id', { count: 'exact', head: true }).or('tenant_user_id.eq.' + user.id + ',landlord_user_id.eq.' + user.id),
      supabase.from('immo_maintenance_requests').select('id', { count: 'exact', head: true }).eq('reported_by', user.id),
      supabase.from('immo_favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('immo_requests').select('id', { count: 'exact', head: true }).eq('requester_user_id', user.id),
      supabase.from('immo_properties').select('id', { count: 'exact', head: true }).eq('owner_user_id', user.id),
      supabase.from('immo_agents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('immo_leases').select('id', { count: 'exact', head: true }).eq('tenant_user_id', user.id),
    ]);
    const detected: string[] = [];
    if (isSuperAdmin) detected.push('Administrateur');
    if ((owned.count ?? 0) > 0) detected.push('Propriétaire');
    if ((agent.count ?? 0) > 0) detected.push('Agent immobilier');
    if ((tenant.count ?? 0) > 0) detected.push('Locataire');
    if ((favorites.count ?? 0) > 0 || (requests.count ?? 0) > 0 || (appointments.count ?? 0) > 0) detected.push('Acheteur / candidat');
    if (membership || isSuperAdmin) detected.push('Membre JDV IMMO');
    setRoles([...new Set(detected)]);

    const results = [properties, appointments, leases, maintenance, favorites, requests, owned, agent, tenant];
    const firstError = results.find((result) => result.error)?.error;
    if (firstError) setError('Certaines statistiques ne sont pas disponibles avec les autorisations actuelles. Les autres espaces restent accessibles.');
    setCounts({
      properties: properties.count ?? 0,
      appointments: appointments.count ?? 0,
      leases: leases.count ?? 0,
      maintenance: maintenance.count ?? 0,
      favorites: favorites.count ?? 0,
      requests: requests.count ?? 0,
    });
    setBusy(false);
  }, [supabase, user, isSuperAdmin]);

  useEffect(() => {
    if (!loading) void load();
  }, [loading, load]);

  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Bienvenue';

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#08152E] text-white"><div className="flex items-center gap-3 text-sm text-white/60"><RefreshCw className="animate-spin" size={18} /> Préparation de votre espace JDV IMMO…</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#08152E] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/immo" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F28C28] text-[#08152E] shadow-lg shadow-orange-950/20"><Building2 size={23} /></span>
            <span><span className="block text-lg font-black tracking-wide">JDV IMMO</span><span className="block text-[10px] uppercase tracking-[.22em] text-white/40">Espace immobilier</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/immo" className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white">Voir les annonces</Link>
            <button onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:border-[#F28C28]/50 disabled:opacity-50"><RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Actualiser</button>
          </div>
        </header>

        <section className="relative mt-7 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#142B50] via-[#10213F] to-[#0D1A33] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#F28C28]/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-[#F5A044]"><LayoutDashboard size={14} /> Tableau de bord central</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Bonjour, {firstName}.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Retrouvez vos activités immobilières, vos dossiers et les outils JDV IMMO depuis un seul espace.</p>
              {!user && <p className="mt-5 inline-flex rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">Connectez-vous pour afficher vos données personnelles et accéder à vos espaces.</p>}
              {user && !member && <p className="mt-5 inline-flex rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">Votre compte n’a pas encore d’adhésion JDV IMMO active. Le catalogue public reste consultable.</p>}
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#F5A044]"><UserRound size={21} /></span>
              <div><p className="text-sm font-semibold">{user ? (profile?.full_name || user.email || 'Compte connecté') : 'Visiteur'}</p><p className="mt-1 text-xs text-white/40">{roles.length ? roles.join(' · ') : member ? 'Membre JDV IMMO' : 'Accès découverte'}</p></div>
              {isSuperAdmin && <ShieldCheck className="ml-2 text-emerald-300" size={18} />}
            </div>
          </div>
        </section>

        {error && <p role="status" className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F5A044]">Vue d’ensemble</p><h2 className="mt-1 text-xl font-bold">Votre activité immobilière</h2></div><span className="text-xs text-white/35">{busy ? 'Actualisation…' : 'Données accessibles à votre compte'}</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Biens accessibles" value={counts.properties} icon={Building2} note="Annonces visibles selon les droits actifs" />
            <Metric label="Demandes de visite" value={counts.appointments} icon={CalendarDays} note="Demandes envoyées par votre compte" />
            <Metric label="Baux associés" value={counts.leases} icon={FileText} note="Baux où vous êtes partie prenante" />
            <Metric label="Signalements" value={counts.maintenance} icon={Wrench} note="Signalements créés par votre compte" />
            <Metric label="Favoris" value={counts.favorites} icon={Heart} note="Biens enregistrés dans votre sélection" />
            <Metric label="Demandes envoyées" value={counts.requests} icon={Wallet} note="Demandes immobilières de votre compte" />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F5A044]">Profils détectés</p><h2 className="mt-1 text-lg font-bold">Vos accès JDV IMMO</h2></div><span className="text-xs text-white/40">Basés sur vos dossiers accessibles</span></div>
          <div className="mt-4 flex flex-wrap gap-2">{(roles.length ? roles : ['Visiteur']).map((role) => <span key={role} className="rounded-full border border-[#F28C28]/25 bg-[#F28C28]/10 px-3 py-1.5 text-xs font-semibold text-[#F5A044]">{role}</span>)}</div>
          <p className="mt-3 text-xs leading-5 text-white/40">Les profils sont déduits des relations et dossiers visibles. Les autorisations réelles restent déterminées par les règles de sécurité de la base, et non par ces étiquettes d’interface.</p>
        </section>

        <section className="mt-9">
          <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F5A044]">Vos espaces de travail</p><h2 className="mt-1 text-xl font-bold">Choisissez votre espace</h2><p className="mt-1 text-sm text-white/45">Chaque raccourci ouvre un module existant de JDV IMMO. Les droits de consultation et d’action restent contrôlés par la plateforme.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map(({ title, description, icon: Icon, href, tag }) => (
              <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#F28C28]/50 hover:bg-white/[.06] focus:outline-none focus:ring-2 focus:ring-[#F28C28]">
                <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-[#F28C28]/10 p-3 text-[#F5A044] transition group-hover:bg-[#F28C28] group-hover:text-[#08152E]"><Icon size={21} /></span><ArrowUpRight size={18} className="text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#F5A044]" /></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#F5A044]">{tag}</p>
                <h3 className="mt-1 text-lg font-bold">{title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-white/50">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/75 group-hover:text-white">Ouvrir l’espace <ArrowUpRight size={14} /></span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/35">
          <span>JDV IMMO · Une branche de JDV GLOBAL CENTER</span>
          <span>Les statistiques reflètent uniquement les données accessibles à votre compte.</span>
        </footer>
      </div>
    </main>
  );
}
