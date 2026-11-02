'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Bell, BookOpen, Building2, ChevronRight, CircleHelp,
  Compass, Grid2X2, LayoutDashboard, Search, Settings2, ShieldCheck,
  ShoppingBag, Sparkles, Users, Wallet,
} from 'lucide-react';
import GlobalHeader from '@/components/navigation/GlobalHeader';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

const quickLinks = [
  { label: 'Explorer les applications', description: 'Retrouver un outil JDV', href: '#applications', icon: Grid2X2 },
  { label: 'Marketplace', description: 'Découvrir les offres', href: '/marketplace', icon: ShoppingBag },
  { label: 'Espace entreprise', description: 'Gérer votre activité', href: '/business', icon: Building2 },
  { label: 'Centre d’aide', description: 'Obtenir une assistance', href: '/help', icon: CircleHelp },
];

export default function HomePage() {
  const { user, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const groups = getGroupedJDVModules();
  const modules = groups.flatMap((group) => group.modules);
  const portalBranches = groups.filter((group) => group.id !== 'other');
  const visibleGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fr');
    if (!query) return groups;
    return groups.map((group) => ({
      ...group,
      modules: group.modules.filter((module) =>
        [module.name, module.description, group.title].join(' ').toLocaleLowerCase('fr').includes(query)
      ),
    })).filter((group) => group.modules.length > 0);
  }, [groups, search]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-[#0b1d42] text-white lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3 px-6 py-7">
            <AppLogo size={48} />
            <span className="leading-tight"><strong className="block text-lg font-black tracking-wide">JDV</strong><span className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-200">Global Center</span></span>
          </Link>
          <div className="px-4 pb-4"><p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-blue-100">Une seule plateforme pour retrouver vos services, vos applications et les univers JDV.</p></div>
          <nav aria-label="Navigation du portail" className="flex-1 space-y-1 px-3 py-3">
            <a href="#accueil" className="flex items-center gap-3 rounded-xl bg-blue-500/25 px-4 py-3 text-sm font-bold text-white"><LayoutDashboard size={18}/>Accueil</a>
            <a href="#branches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><Compass size={18}/>Nos branches</a>
            <a href="#applications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><Grid2X2 size={18}/>Applications</a>
            <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><ShoppingBag size={18}/>Marketplace</Link>
            <Link href="/about" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><BookOpen size={18}/>Présentation</Link>
            <Link href="/help" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><CircleHelp size={18}/>Centre d’aide</Link>
            {isSuperAdmin && <Link href="/hidden-concepteur-gate/dashboard" className="mt-5 flex items-center gap-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100"><Settings2 size={18}/>Studio & pilotage</Link>}
          </nav>
          <div className="m-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/25 to-indigo-500/10 p-4">
            <Sparkles size={20} className="text-amber-300"/>
            <p className="mt-3 text-sm font-extrabold">Votre univers JDV</p>
            <p className="mt-1 text-xs leading-5 text-blue-100">Explorez les services et choisissez l’espace adapté à votre besoin.</p>
            <Link href="/branches" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white">Voir les branches <ArrowRight size={14}/></Link>
          </div>
        </aside>

        <div id="accueil" className="min-w-0">
          <GlobalHeader />
          <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-accent">Portail central · Écosystème JDV</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Bienvenue sur JDV Global Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Toutes vos branches, applications et informations essentielles réunies dans un espace unique.</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/branches" className="btn-secondary"><Compass size={16}/>Explorer les branches</Link>
                <Link href={user ? '/dashboard' : '/auth/login'} className="btn-primary">{user ? 'Mon espace' : 'Se connecter'}<ArrowRight size={16}/></Link>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-r from-[#0b1d42] via-[#123c78] to-[#1762a5] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[38px] border-white/5"/>
              <div className="pointer-events-none absolute right-24 top-10 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl"/>
              <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-blue-100"><Sparkles size={13}/> Un monde de services, une seule plateforme</span>
                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">Connectez vos projets.<br/><span className="text-amber-300">Explorez toutes les possibilités.</span></h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Accédez simplement aux univers JDV, découvrez les applications disponibles et retrouvez les ressources utiles à votre activité.</p>
                <div className="mt-6 flex flex-wrap gap-3"><Link href="#branches" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-300">Découvrir les branches <ArrowRight size={16}/></Link><Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">Découvrir JDV</Link></div>
              </div>
            </section>

            <section aria-label="Vue d'ensemble" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Branches référencées</span><Compass size={19} className="text-blue-500"/></div><p className="mt-3 text-3xl font-black tabular-nums">{portalBranches.length}</p><p className="mt-1 text-xs text-muted-foreground">Univers principaux du catalogue</p></div>
              <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Applications répertoriées</span><Grid2X2 size={19} className="text-violet-500"/></div><p className="mt-3 text-3xl font-black tabular-nums">{modules.length}</p><p className="mt-1 text-xs text-muted-foreground">Outils accessibles depuis le portail</p></div>
              <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Univers de services</span><Building2 size={19} className="text-emerald-500"/></div><p className="mt-3 text-3xl font-black tabular-nums">{groups.length}</p><p className="mt-1 text-xs text-muted-foreground">Catégories du catalogue applicatif</p></div>
              <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Votre espace</span><Users size={19} className="text-amber-500"/></div><p className="mt-3 text-xl font-black">{user ? 'Connecté' : 'Découverte'}</p><p className="mt-1 text-xs text-muted-foreground">{user ? 'Retrouvez vos espaces de travail' : 'Explorez librement le portail public'}</p></div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Accès directs</p><h2 className="mt-1 text-xl font-extrabold sm:text-2xl">Que souhaitez-vous faire ?</h2></div></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon size={20}/></span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.label}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.description}</span></span><ChevronRight size={17} className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent"/></Link>; })}
              </div>
            </section>

            <section id="branches" className="mt-10 scroll-mt-24">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Le réseau JDV</p><h2 className="mt-1 text-xl font-extrabold sm:text-2xl">Explorez les branches</h2><p className="mt-1 text-sm text-muted-foreground">Chaque univers conserve ses fonctionnalités et ses parcours métier.</p></div><Link href="/univers" className="inline-flex items-center gap-2 text-sm font-bold text-accent">Voir le catalogue complet <ArrowRight size={15}/></Link></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {portalBranches.map((branch, index) => { const Icon = branch.modules[0]?.icon ?? Grid2X2; const destination = `/univers?branche=${branch.id}`; return <Link key={branch.id} href={destination} className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background" style={{color:branch.accent}}><Icon size={27}/></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-[.14em]" style={{color:branch.accent}}>0{index+1} · {branch.modules.length} application{branch.modules.length>1?'s':''}</span><strong className="mt-1 block text-sm">{branch.title}</strong><span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">{branch.description}</span></span><ArrowRight size={16} className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent"/></Link>; })}
              </div>
            </section>

            <section id="applications" className="mt-10 scroll-mt-24">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Catalogue global</p><h2 className="mt-1 text-xl font-extrabold sm:text-2xl">Toutes les applications JDV</h2><p className="mt-1 text-sm text-muted-foreground">Recherchez un outil ou ouvrez un univers pour afficher ses applications.</p></div><span className="text-xs font-semibold text-muted-foreground">{modules.length} applications répertoriées</span></div>
              <label className="relative block"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Rechercher une application, un service, un domaine…" className="min-h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/15"/></label>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {visibleGroups.map((group) => <article key={group.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold">{group.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{group.description}</p></div><span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{group.modules.length} outil{group.modules.length>1?'s':''}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{group.modules.map((module) => { const Icon=module.icon; return <Link key={module.id} href={module.href} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition hover:border-accent/40 hover:bg-accent/5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon size={17}/></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{module.name}</strong><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{module.description}</span></span><ArrowRight size={14} className="shrink-0 text-muted-foreground"/></Link>; })}</div></article>)}
                {visibleGroups.length===0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center xl:col-span-2"><Search size={24} className="mx-auto text-muted-foreground"/><p className="mt-3 font-bold">Aucun résultat</p><p className="mt-1 text-sm text-muted-foreground">Essayez un autre mot-clé.</p></div>}
              </div>
            </section>

            <section className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><ShieldCheck size={20}/></span><div><h2 className="font-extrabold">Un accès adapté à chaque application</h2><p className="text-xs text-muted-foreground">Une navigation commune, des espaces métier distincts.</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">La consultation des informations publiques reste ouverte. Lorsqu’une opération nécessite un compte, l’inscription et la connexion suivent les règles propres à l’application concernée.</p></div>
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><Wallet size={20}/></span><div><h2 className="font-extrabold">Besoin d’accompagnement ?</h2><p className="text-xs text-muted-foreground">Le Centre d’aide JDV</p></div></div><Link href="/help" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent">Contacter l’assistance <ArrowRight size={15}/></Link></div>
            </section>
          </div>
          <footer className="border-t border-border bg-card/70 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">© {new Date().getFullYear()} JDV Global Center · Innovation · Confiance · Développement</footer>
        </div>
      </div>
    </main>
  );
}
