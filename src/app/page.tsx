'use client';

import Link from 'next/link';

import {
  ArrowRight, Globe2, LayoutGrid, ShieldCheck, Building2, HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import GlobalHeader from '@/components/navigation/GlobalHeader';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

export default function HomePage() {
  const { user, isSuperAdmin } = useAuth();
  const moduleGroups = getGroupedJDVModules();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f7fc] text-[#172b4d]">
      <GlobalHeader />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102b59] via-[#1769c9] to-[#4a9bfa] px-6 py-9 text-white shadow-[0_22px_55px_rgba(23,105,200,.22)] sm:px-10 sm:py-12 lg:min-h-[330px] lg:px-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 -z-10 h-[430px] w-[430px] rounded-full border border-white/20 shadow-[0_0_0_32px_rgba(255,255,255,.05),0_0_0_76px_rgba(255,255,255,.04)]" />
          <div aria-hidden="true" className="pointer-events-none absolute right-[9%] top-[15%] -z-10 h-64 w-64 rounded-full border border-white/25 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,.28),transparent_48%)] shadow-[inset_-30px_-20px_55px_rgba(4,30,77,.25)]" />
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-100"><Globe2 size={14}/> Votre monde connecté</span>
            <h1 className="mt-5 max-w-3xl text-[2.55rem] font-black leading-[1.04] tracking-[-.045em] sm:text-5xl lg:text-[3.6rem]">Un seul portail.<br/><span className="text-blue-100">Tout un monde de possibilités.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">Découvrez les services de JDV GLOBAL CENTER : finance, entreprise, immobilier, mobilité, santé, communauté, médias, formation, agriculture et énergie.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#univers-jdv" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#1455a8] shadow-lg transition hover:-translate-y-0.5">Explorer les univers <ArrowRight size={16}/></a>
              <Link href={user ? '/dashboard' : '/auth/register'} className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-white/20">{user ? 'Ouvrir mon espace' : 'Créer mon compte'}</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 lg:absolute lg:bottom-8 lg:right-10 lg:mt-0">
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Compte unifié</span>
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Accès sécurisés</span>
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Applications autonomes</span>
          </div>
        </section>

        <section aria-label="Aperçu de l'écosystème" className="relative z-[1] -mt-1 grid grid-cols-2 gap-2 pt-4 sm:gap-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#e4ebf5] bg-white p-3 shadow-sm sm:gap-3 sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><LayoutGrid size={18}/></span><span><strong className="block text-lg font-black leading-tight">{moduleGroups.length}</strong><span className="text-[9px] font-semibold text-slate-500 sm:text-[11px]">Univers</span></span></div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#e4ebf5] bg-white p-3 shadow-sm sm:gap-3 sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck size={18}/></span><span><strong className="block text-lg font-black leading-tight">JDV CORE</strong><span className="text-[9px] font-semibold text-slate-500 sm:text-[11px]">Socle commun</span></span></div>
        </section>

        <section id="univers-jdv" className="scroll-mt-24 pt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Explorez l'écosystème</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Les 9 univers JDV</h2><p className="mt-1 text-xs text-slate-500">Chaque univers rassemble des applications métier complémentaires.</p></div>
            <Link href="/branches" className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800">Voir les univers <ArrowRight size={15}/></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {moduleGroups.map((group, index) => {
              const GroupIcon = group.modules[0]?.icon ?? Building2;
              return <Link key={group.id} href={`/univers/${group.id}`} className="group rounded-2xl border border-[#e4ebf5] bg-white p-4 shadow-[0_4px_18px_rgba(16,43,89,.035)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_15px_35px_rgba(16,43,89,.09)] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-xl" style={{backgroundColor:group.accent+'20',color:group.accent}}><GroupIcon size={23}/></span>
                  <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-extrabold text-slate-500">{group.modules.length} application{group.modules.length === 1 ? '' : 's'}</span>
                </div>
                <p className="mt-4 text-[9px] font-black uppercase tracking-[.18em] text-blue-600">UNIVERS {String(index+1).padStart(2,'0')}</p>
                <h3 className="mt-1 text-base font-extrabold text-[#172b4d]">{group.title}</h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{group.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold text-blue-600">Découvrir cet univers <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
              </Link>;
            })}
          </div>
        </section>

        <section className="mt-12 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><HeartHandshake size={22}/></span><div><h2 className="text-sm font-black text-[#174d9a]">Une fondation commune, des applications autonomes.</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">JDV CORE mutualise les services transversaux. Chaque application conserve ses données, ses règles métier, ses routes et ses parcours spécialisés.</p></div></div>
          <Link href="/architecture/branches" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[11px] font-extrabold text-white transition hover:bg-blue-700">Voir l'architecture <ArrowRight size={15}/></Link>
        </section>

        {isSuperAdmin && <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-700">Espace privé · concepteur</p><h2 className="mt-1 text-sm font-extrabold text-amber-950">Centre de contrôle de la plateforme</h2><p className="mt-1 text-xs text-amber-800">Configuration et pilotage global, réservés aux comptes autorisés.</p></div><Link href="/hidden-concepteur-gate/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-[11px] font-extrabold text-white">Ouvrir le centre de contrôle <ArrowRight size={14}/></Link></section>}

        <footer className="mt-12 flex flex-col gap-4 border-t border-[#e1e8f2] pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-2"><AppLogo size={32}/><span><strong className="block text-sm text-[#172b4d]">JDV GLOBAL CENTER</strong><span className="text-[10px]">Votre monde connecté</span></span></Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/about" className="hover:text-blue-600">À propos</Link><Link href="/branches" className="hover:text-blue-600">Nos univers</Link><Link href="/help" className="hover:text-blue-600">Centre d'aide</Link><Link href="/auth/login" className="hover:text-blue-600">Connexion</Link></div>
          <span>© {new Date().getFullYear()} JDV GLOBAL CENTER</span>
        </footer>
      </div>
    </main>
  );
}
