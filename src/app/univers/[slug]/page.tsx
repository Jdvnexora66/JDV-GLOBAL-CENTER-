import Link from 'next/link';
import {
  ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2,
  ChevronRight, Compass, Globe2, Headphones, LayoutGrid, Search,
  ShieldCheck, Sparkles, Star, Users, Wallet, type LucideIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

type PortalTheme = {
  eyebrow: string; headline: string; intro: string; slogan: string;
  photo: string; accent: string; accentSoft: string; heroAction: string;
  popular: string[]; sideLinks: { label: string; href: string; icon: LucideIcon }[];
  promoTitle: string; promoText: string;
};

const themes: Record<string, PortalTheme> = {
  immo: {
    eyebrow: 'HABITAT · IMMOBILIER · CONSTRUCTION',
    headline: 'Trouvez le lieu où vos projets prennent vie.',
    intro: 'Explorez les biens, rencontrez les professionnels et donnez forme à vos projets immobiliers dans un espace dédié.',
    slogan: 'Votre prochain projet commence ici.',
    photo: 'photo-1600585154340-be6161a56a0c',
    accent: '#D99A16', accentSoft: '#FFF7E5', heroAction: 'Explorer les biens',
    popular: ['Recherche immobilière', 'Vente & location', 'Construction & plans', 'Gestion immobilière'],
    sideLinks: [{label:'Biens immobiliers',href:'/immo',icon:Building2},{label:'Projets de construction',href:'/immo/construction',icon:Compass},{label:'Professionnels',href:'/immo',icon:Users}],
    promoTitle: 'Un projet immobilier en tête ?',
    promoText: 'Retrouvez les outils et les professionnels qui peuvent vous accompagner, de la recherche à la réalisation.',
  },
  sante: {
    eyebrow: 'PRÉVENTION · SOINS · PROFESSIONNELS',
    headline: 'Les bons services de santé, plus proches de vous.',
    intro: 'Repérez les professionnels, pharmacies et laboratoires et accédez aux services de santé de votre environnement.',
    slogan: 'La santé commence par une bonne orientation.',
    photo: 'photo-1576091160399-112ba8d25d1d',
    accent: '#15966B', accentSoft: '#E9F8F1', heroAction: 'Trouver un service de santé',
    popular: ['Médecins & spécialistes', 'Pharmacies', 'Laboratoires', 'Rendez-vous & téléconsultation'],
    sideLinks: [{label:'Professionnels de santé',href:'/health',icon:Users},{label:'Pharmacies',href:'/health',icon:ShieldCheck},{label:'Laboratoires',href:'/health',icon:CheckCircle2}],
    promoTitle: 'Prenez soin de l’essentiel.',
    promoText: 'Découvrez les services disponibles et les applications qui facilitent votre parcours de santé.',
  },
  academy: {
    eyebrow: 'APPRENDRE · PROGRESSER · CERTIFIER',
    headline: 'Ouvrez la porte à de nouvelles compétences.',
    intro: 'Découvrez les formations, les ressources pédagogiques et les espaces qui accompagnent apprenants et formateurs.',
    slogan: 'Chaque compétence ouvre une possibilité.',
    photo: 'photo-1523050854058-8df90110c9f1',
    accent: '#6956D9', accentSoft: '#F0EDFF', heroAction: 'Découvrir les formations',
    popular: ['Formations & cours', 'Espace apprenant', 'Espace formateur', 'Évaluations & certificats'],
    sideLinks: [{label:'Catalogue de formations',href:'/academy',icon:LayoutGrid},{label:'Espace apprenant',href:'/academy',icon:Users},{label:'Ressources',href:'/academy',icon:BriefcaseBusiness}],
    promoTitle: 'Votre avenir se construit maintenant.',
    promoText: 'Accédez à des parcours d’apprentissage et aux outils qui vous aident à progresser.',
  },
  social: {
    eyebrow: 'COMMUNAUTÉ · MÉDIAS · ÉVÉNEMENTS',
    headline: 'Connectez-vous aux idées et aux communautés.',
    intro: 'Partagez, découvrez des contenus, participez aux événements et faites vivre vos communautés dans un même univers.',
    slogan: 'Ensemble, faisons circuler les idées.',
    photo: 'photo-1529156069898-49953e39b3ac',
    accent: '#8A49C7', accentSoft: '#F7EEFF', heroAction: 'Rejoindre la communauté',
    popular: ['Réseau social', 'Communautés', 'Médias & publications', 'Événements'],
    sideLinks: [{label:'Fil communautaire',href:'/social',icon:Users},{label:'Groupes & communautés',href:'/community',icon:Users},{label:'Événements',href:'/events',icon:CalendarDays}],
    promoTitle: 'Votre communauté a sa place ici.',
    promoText: 'Créez des liens, partagez vos initiatives et découvrez les espaces qui vous ressemblent.',
  },
  travel: {
    eyebrow: 'VOYAGES · TRANSPORT · MOBILITÉ',
    headline: 'Le monde est à portée de votre prochain départ.',
    intro: 'Préparez vos déplacements, explorez les destinations et retrouvez les services de voyage et de mobilité.',
    slogan: 'Voyagez mieux, partout où vos projets vous mènent.',
    photo: 'photo-1500530855697-b586d89ba3ee',
    accent: '#1686BD', accentSoft: '#EAF7FD', heroAction: 'Préparer un voyage',
    popular: ['Vols & compagnies', 'Hôtels & hébergements', 'Restaurants', 'Transport & transit'],
    sideLinks: [{label:'Voyages',href:'/travel',icon:Compass},{label:'Transport',href:'/transport',icon:BriefcaseBusiness},{label:'Transit & logistique',href:'/transit',icon:Building2}],
    promoTitle: 'Votre prochaine destination vous attend.',
    promoText: 'Retrouvez les applications pour organiser vos voyages et vos déplacements.',
  },
  marketplace: {
    eyebrow: 'ACHETER · VENDRE · DÉVELOPPER',
    headline: 'Découvrez des produits. Faites grandir vos boutiques.',
    intro: 'Parcourez les offres publiées, découvrez les vendeurs et lancez votre activité commerciale dans l’écosystème JDV.',
    slogan: 'Les opportunités commerciales se rencontrent ici.',
    photo: 'photo-1555529669-e69e7aa0ba9a',
    accent: '#E58A16', accentSoft: '#FFF5E7', heroAction: 'Découvrir les produits',
    popular: ['Produits publiés', 'Boutiques', 'Espace vendeur', 'Créer une boutique'],
    sideLinks: [{label:'Découvrir les produits',href:'/marketplace',icon:LayoutGrid},{label:'Boutiques',href:'/marketplace',icon:Building2},{label:'Espace vendeur',href:'/marketplace/seller',icon:BriefcaseBusiness}],
    promoTitle: 'Vous avez quelque chose à vendre ?',
    promoText: 'Créez votre boutique et présentez vos produits à une communauté de clients.',
  },
  services: {
    eyebrow: 'ENTREPRISES · PRESTATIONS · PROFESSIONNELS',
    headline: 'Connectez-vous aux meilleures opportunités de services.',
    intro: 'Trouvez des entreprises, des professionnels et des prestations de qualité. Développez votre activité et vos projets.',
    slogan: 'Ensemble, bâtissons un avenir meilleur.',
    photo: 'photo-1521737711867-e3b97375f902',
    accent: '#0D65B8', accentSoft: '#EAF3FF', heroAction: 'Explorer les services',
    popular: ['Annuaire professionnel', 'Emploi & carrière', 'Prestations de services', 'Gestion de projets'],
    sideLinks: [{label:'Annuaire professionnel',href:'/service-marketplace',icon:Building2},{label:'Emploi & carrière',href:'/jobs',icon:BriefcaseBusiness},{label:'Prestations',href:'/service-marketplace',icon:CheckCircle2}],
    promoTitle: 'Développez votre activité avec JDV Services.',
    promoText: 'Gagnez en visibilité, trouvez des partenaires et accédez aux outils pour faire avancer votre entreprise.',
  },
  tontine: {
    eyebrow: 'ÉPARGNE COLLECTIVE · COTISATIONS · GROUPES',
    headline: 'Ensemble, construisez vos projets de demain.',
    intro: 'Organisez votre épargne collective, gérez vos groupes et suivez les cotisations avec des espaces dédiés.',
    slogan: 'La confiance et la régularité font grandir les projets.',
    photo: 'photo-1511632765486-a01980e01a18',
    accent: '#159A8A', accentSoft: '#E8F8F5', heroAction: 'Découvrir les tontines',
    popular: ['Classes de tontine', 'Groupes & membres', 'Cotisations', 'Documents & contrats'],
    sideLinks: [{label:'Mes groupes',href:'/tontine',icon:Users},{label:'Cotisations',href:'/tontine',icon:Wallet},{label:'Documents',href:'/tontine',icon:BriefcaseBusiness}],
    promoTitle: 'Un projet collectif à réaliser ?',
    promoText: 'Découvrez les formules et les outils de suivi conçus pour accompagner les groupes.',
  },
  finance: {
    eyebrow: 'PAIEMENTS · ASSURANCE · COMPTABILITÉ',
    headline: 'Donnez plus de clarté à vos opérations financières.',
    intro: 'Retrouvez les services de paiement, les solutions d’assurance et les outils de gestion financière de JDV.',
    slogan: 'Des outils clairs pour avancer avec confiance.',
    photo: 'photo-1460925895917-afdab827c52f',
    accent: '#167A8A', accentSoft: '#E9F7F8', heroAction: 'Explorer les services financiers',
    popular: ['Paiements & transferts', 'Assurances', 'Comptabilité', 'Suivi financier'],
    sideLinks: [{label:'Paiements',href:'/pay',icon:Wallet},{label:'Assurances',href:'/insurance',icon:ShieldCheck},{label:'Comptabilité',href:'/accounting',icon:BriefcaseBusiness}],
    promoTitle: 'Gardez le cap sur vos finances.',
    promoText: 'Accédez aux applications financières dédiées, chacune avec ses propres parcours et règles de sécurité.',
  },
};

const fallbackTheme = themes.services;

export function generateStaticParams() {
  return getGroupedJDVModules().map((group) => ({ slug: group.id }));
}

export default async function UniverseWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getGroupedJDVModules().find((item) => item.id === slug || (slug === 'health' && item.id === 'sante'));
  if (!group) return null;
  const theme = themes[group.id] ?? fallbackTheme;
  const primaryModule = group.modules[0];
  const allPopular = theme.popular.map((label, index) => ({
    label,
    module: group.modules[index] ?? primaryModule!,
  }));

  return (
    <main className="min-h-screen bg-[#F3F6FB] text-[#10213E]">
      <GlobalHeader />
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-64px)] w-[238px] shrink-0 flex-col bg-[#102B55] px-4 py-7 text-white lg:flex">
          <Link href="/univers" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Globe2 size={25}/></span>
            <span><strong className="block text-lg font-black tracking-wide">JDV</strong><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">Global Center</span></span>
          </Link>
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[.2em] text-blue-200/70">{group.title}</p>
          <nav className="flex flex-col gap-1">
            <a href="#top" className="flex items-center gap-3 rounded-xl bg-[#1762B2] px-3 py-3 text-sm font-bold"><LayoutGrid size={17}/> Accueil</a>
            <a href="#applications" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10"><BriefcaseBusiness size={17}/> Applications</a>
            {theme.sideLinks.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"><Icon size={17}/>{item.label}</Link>; })}
            <Link href="/help" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10"><Headphones size={17}/> Aide & Support</Link>
          </nav>
          <div className="mt-auto rounded-2xl border border-white/15 bg-white/[.07] p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-[#102B55]"><Star size={18}/></span>
            <h3 className="mt-3 text-sm font-extrabold">L’univers {group.title}</h3>
            <p className="mt-1 text-xs leading-5 text-blue-100/75">Un espace dédié pour découvrir les applications et les opportunités JDV.</p>
            <Link href="/univers" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-amber-300">Voir les neuf univers <ArrowRight size={13}/></Link>
          </div>
        </aside>

        <div id="top" className="min-w-0 flex-1">
          <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-[#DCE5F0] bg-white px-4 py-3 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{background:theme.accentSoft,color:theme.accent}}><Sparkles size={20}/></span>
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-500">Votre univers dédié</p><h1 className="text-lg font-black text-[#102B55]">{group.title}</h1></div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/univers" className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex"><Globe2 size={15}/> Les neuf univers</Link>
              <Link href="/notifications" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Bell size={17}/></Link>
              <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-[#102B55] px-3 py-2.5 text-xs font-extrabold text-white hover:bg-[#17447D]">Mon espace <ArrowRight size={14}/></Link>
            </div>
          </div>

          <div className="p-3 sm:p-6 lg:p-7">
            <section className="relative isolate min-h-[330px] overflow-hidden rounded-[25px] bg-[#0C2C53] text-white shadow-lg sm:min-h-[360px]">
              <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage: `url(https://images.unsplash.com/${theme.photo}?auto=format&fit=crop&w=1800&q=85)`}}/>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071D3B]/95 via-[#092C52]/80 to-[#092C52]/15"/>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071D3B]/50 via-transparent to-transparent"/>
              <div className="flex min-h-[330px] max-w-3xl flex-col justify-center px-6 py-9 sm:min-h-[360px] sm:px-10 lg:px-12">
                <span className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.17em] text-white/90">{theme.eyebrow}</span>
                <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[46px]">{theme.headline}</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">{theme.intro}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#applications" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-[#172B45] shadow-md transition hover:-translate-y-0.5" style={{background:'#FFC629'}}><Search size={16}/>{theme.heroAction}<ArrowRight size={15}/></a>
                  <Link href="/help" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"><Headphones size={16}/> Être accompagné</Link>
                </div>
                <p className="mt-5 text-xs font-semibold tracking-wide text-white/70">{theme.slogan}</p>
              </div>
            </section>

            <section id="applications" className="mt-7 scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[.18em]" style={{color:theme.accent}}>Découvrez votre univers</p><h2 className="mt-1 text-2xl font-black text-[#102B55]">Nos applications principales</h2></div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#145DB0]">{group.modules.length} application{group.modules.length > 1 ? 's' : ''} <ArrowRight size={14}/></span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.modules.map((module,index) => { const Icon = module.icon; return (
                  <Link key={module.id} href={module.href} className="group flex min-h-[142px] items-start gap-3 rounded-2xl border border-[#DCE6F2] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#A9C8EB] hover:shadow-lg">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{background:theme.accentSoft,color:theme.accent}}><Icon size={23}/></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-black leading-5 text-[#102B55]">{module.name}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{module.description}</span><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold" style={{color:theme.accent}}>Découvrir <ArrowRight size={13} className="transition group-hover:translate-x-1"/></span></span>
                  </Link>
                );})}
              </div>
            </section>

            <section className="mt-7 grid gap-4 xl:grid-cols-[.95fr_1.25fr_.9fr]">
              <div className="rounded-2xl border border-[#DCE6F2] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between"><h2 className="font-black text-[#102B55]">Services populaires</h2><Star size={17} className="text-amber-500"/></div>
                <div className="divide-y divide-slate-100">
                  {allPopular.map((item,index)=><Link key={item.label} href={item.module.href} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#245A97]"><ChevronRight size={17}/></span><span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-[#102B55]">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.module.description}</span></span><ArrowRight size={14} className="text-slate-400"/></Link>)}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E4C91] via-[#1266B6] to-[#123C78] p-6 text-white shadow-md sm:p-7">
                <div className="absolute -right-10 -top-12 h-52 w-52 rounded-full border-[30px] border-white/10"/>
                <div className="relative max-w-lg">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em]"><Sparkles size={13}/> JDV Global Center</span>
                  <h2 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">{theme.promoTitle}</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">{theme.promoText}</p>
                  <Link href={primaryModule?.href ?? '/univers'} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FFC629] px-5 py-3 text-sm font-black text-[#102B55] hover:bg-amber-300">Accéder aux applications <ArrowRight size={15}/></Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-[#DCE6F2] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2"><ShieldCheck size={18} style={{color:theme.accent}}/><h2 className="font-black text-[#102B55]">Un accès sécurisé</h2></div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">La découverte reste ouverte. Chaque application conserve son propre parcours de connexion pour les opérations qui le nécessitent.</p>
                </div>
                <div className="rounded-2xl border border-[#DCE6F2] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2"><Headphones size={18} style={{color:theme.accent}}/><h2 className="font-black text-[#102B55]">Aide & Support</h2></div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">Besoin d’une information ou d’un accompagnement ? Le Centre d’aide centralise les ressources JDV.</p>
                  <Link href="/help" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#145DB0]">Contacter l’assistance <ArrowRight size={13}/></Link>
                </div>
              </div>
            </section>

            <footer className="mt-7 grid gap-3 rounded-2xl border border-[#DCE6F2] bg-white px-5 py-4 text-xs text-slate-600 sm:grid-cols-3">
              <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#1762B2]"/> Plateforme sécurisée</span>
              <span className="flex items-center gap-2"><Globe2 size={18} className="text-[#1762B2]"/> Un écosystème ouvert sur plusieurs pays</span>
              <span className="flex items-center gap-2"><Headphones size={18} className="text-[#1762B2]"/> Assistance via le Centre d’aide</span>
            </footer>
          </div>
        </div>
      </div>
      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_24px_rgba(15,35,70,.08)] backdrop-blur-xl lg:hidden">
        <Link href={`/univers/${group.id}`} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-extrabold" style={{ color: theme.accent }}><LayoutGrid size={20}/>Accueil</Link>
        <Link href="#applications" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><BriefcaseBusiness size={20}/>Applications</Link>
        <Link href="/univers" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><Compass size={20}/>Univers</Link>
        <Link href="/help" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><Headphones size={20}/>Aide</Link>
      </nav>
    </main>
  );
}
