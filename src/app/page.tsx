'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight, Search, Globe2, LayoutGrid, ShieldCheck, Sparkles,
  CreditCard, Building2, HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import GlobalHeader from '@/components/navigation/GlobalHeader';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

export default function HomePage() {
  const { user, isSuperAdmin } = useAuth();
  const [moduleSearch, setModuleSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const moduleGroups = useMemo(() => getGroupedJDVModules(), []);
  const allModules = useMemo(() => moduleGroups.flatMap((group) => group.modules), [moduleGroups]);
  const visibleModules = useMemo(() => {
    const query = moduleSearch.trim().toLocaleLowerCase('fr');
    return allModules.filter((module) => {
      const group = moduleGroups.find((item) => item.modules.some((entry) => entry.id === module.id));
      const matchesGroup = activeGroup === 'all' || group?.id === activeGroup;
      const matchesSearch = !query || `${module.name} ${module.description} ${group?.title ?? ''}`.toLocaleLowerCase('fr').includes(query);
      return matchesGroup && matchesSearch;
    });
  }, [activeGroup, allModules, moduleGroups, moduleSearch]);

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
              <a href="#catalogue-jdv" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#1455a8] shadow-lg transition hover:-translate-y-0.5">Explorer les applications <ArrowRight size={16}/></a>
              <Link href={user ? '/dashboard' : '/auth/register'} className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-white/20">{user ? 'Ouvrir mon espace' : 'Créer mon compte'}</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 lg:absolute lg:bottom-8 lg:right-10 lg:mt-0">
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Compte unifié</span>
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Accès sécurisés</span>
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold">Applications autonomes</span>
          </div>
        </section>

        <section aria-label="Aperçu de l'écosystème" className="relative z-[1] -mt-1 grid grid-cols-3 gap-2 pt-4 sm:gap-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#e4ebf5] bg-white p-3 shadow-sm sm:gap-3 sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><LayoutGrid size={18}/></span><span><strong className="block text-lg font-black leading-tight">{moduleGroups.length}</strong><span className="text-[9px] font-semibold text-slate-500 sm:text-[11px]">Univers</span></span></div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#e4ebf5] bg-white p-3 shadow-sm sm:gap-3 sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Globe2 size={18}/></span><span><strong className="block text-lg font-black leading-tight">{allModules.length}</strong><span className="text-[9px] font-semibold text-slate-500 sm:text-[11px]">Applications référencées</span></span></div>
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
                <div className="mt-4 flex flex-wrap gap-1.5">{group.modules.slice(0,3).map((module) => <span key={module.id} className="rounded-lg bg-[#f4f7fc] px-2 py-1 text-[9px] font-bold text-slate-600">{module.name}</span>)}{group.modules.length > 3 && <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-extrabold text-blue-600">+{group.modules.length-3}</span>}</div>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold text-blue-600">Découvrir cet univers <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
              </Link>;
            })}
          </div>
        </section>

        <section id="catalogue-jdv" className="scroll-mt-24 pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Accès direct</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Catalogue des applications</h2><p className="mt-1 text-xs text-slate-500">Retrouvez rapidement un service par son nom ou son domaine.</p></div>
            <div className="relative w-full sm:max-w-sm"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={moduleSearch} onChange={(event) => setModuleSearch(event.target.value)} type="search" aria-label="Rechercher une application" placeholder="Rechercher une application…" className="h-11 w-full rounded-xl border border-[#e0e8f3] bg-white pl-10 pr-4 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"/></div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            <button type="button" onClick={() => setActiveGroup('all')} className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-extrabold transition ${activeGroup === 'all' ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#e0e8f3] bg-white text-slate-500 hover:border-blue-200'}`}>Toutes</button>
            {moduleGroups.map((group) => <button key={group.id} type="button" onClick={() => setActiveGroup(group.id)} className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-extrabold transition ${activeGroup === group.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#e0e8f3] bg-white text-slate-500 hover:border-blue-200'}`}>{group.title}</button>)}
          </div>
          <div className="mb-3 mt-2 text-[10px] font-semibold text-slate-400">{visibleModules.length} application{visibleModules.length === 1 ? '' : 's'} affichée{visibleModules.length === 1 ? '' : 's'}</div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleModules.map((module) => {
              const ModuleIcon = module.icon;
              return <Link key={module.id} href={module.href} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#e4ebf5] bg-white p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><ModuleIcon size={19}/></span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-[11px] font-extrabold text-[#172b4d]">{module.name}</strong><span className="mt-0.5 block truncate text-[9px] text-slate-500">{module.description}</span></span>
                <ArrowRight size={14} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"/>
              </Link>;
            })}
            {visibleModules.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center text-xs text-slate-500 sm:col-span-2 lg:col-span-3 xl:col-span-4">Aucune application ne correspond à cette recherche. Essayez un autre terme.</div>}
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
