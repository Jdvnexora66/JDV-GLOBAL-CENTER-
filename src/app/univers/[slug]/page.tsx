import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Compass, LockKeyhole, Sparkles,
  Building2, HeartPulse, GraduationCap, Users, Plane, ShoppingBag,
  BriefcaseBusiness, Wallet, Headset, Search, ShieldCheck,
} from 'lucide-react';
import GlobalHeader from '@/components/navigation/GlobalHeader';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

const universeExperience: Record<string, {
  eyebrow: string; headline: string; intro: string; promise: string;
  gradient: string; surface: string; features: { title: string; description: string; icon: typeof Compass }[];
  action: string;
}> = {
  immo: {
    eyebrow: 'Habitat · Immobilier · Construction',
    headline: 'Donnez vie à vos projets immobiliers.',
    intro: 'Un espace dédié pour découvrir des biens, trouver des professionnels et faire avancer vos projets immobiliers.',
    promise: 'De la recherche du bien à la concrétisation du projet, retrouvez les services immobiliers JDV dans un même univers.',
    gradient: 'from-[#172554] via-[#1d4e89] to-[#0e7490]', surface: 'bg-blue-50',
    features: [
      { title: 'Rechercher un bien', description: 'Parcourez les offres immobilières et leurs informations.', icon: Search },
      { title: 'Vendre ou louer', description: 'Présentez vos biens et échangez avec les personnes intéressées.', icon: Building2 },
      { title: 'Construire et aménager', description: 'Préparez vos projets immobiliers et de construction.', icon: Compass },
    ], action: 'Explorer JDV Immo',
  },
  sante: {
    eyebrow: 'Prévention · Soins · Professionnels',
    headline: 'Votre santé, mieux orientée.',
    intro: 'Retrouvez les services de santé de cet univers : professionnels, pharmacies, laboratoires et parcours de soins.',
    promise: 'Un point de départ pour identifier les services disponibles et accéder aux applications santé JDV.',
    gradient: 'from-[#064e3b] via-[#047857] to-[#0f766e]', surface: 'bg-emerald-50',
    features: [
      { title: 'Trouver un professionnel', description: 'Repérez les médecins et services de santé disponibles.', icon: Search },
      { title: 'Pharmacies et laboratoires', description: 'Accédez aux services de proximité référencés.', icon: HeartPulse },
      { title: 'Suivre ses démarches', description: 'Retrouvez les parcours et services proposés par JDV Santé.', icon: BadgeCheck },
    ], action: 'Explorer JDV Santé',
  },
  academy: {
    eyebrow: 'Apprendre · Progresser · Certifier',
    headline: 'Faites grandir vos compétences.',
    intro: 'Un univers consacré à la formation, aux parcours pédagogiques et à l’apprentissage tout au long de la vie.',
    promise: 'Découvrez les espaces de formation et les outils qui accompagnent apprenants, formateurs et organisations.',
    gradient: 'from-[#312e81] via-[#4338ca] to-[#7c3aed]', surface: 'bg-indigo-50',
    features: [
      { title: 'Explorer les formations', description: 'Découvrez les parcours et contenus pédagogiques.', icon: Search },
      { title: 'Apprendre à son rythme', description: 'Accédez aux espaces et ressources de formation.', icon: GraduationCap },
      { title: 'Accompagner les apprenants', description: 'Retrouvez les outils dédiés aux formateurs et équipes.', icon: Users },
    ], action: 'Explorer JDV Academy',
  },
  social: {
    eyebrow: 'Communauté · Médias · Événements',
    headline: 'Les idées et les communautés se rencontrent.',
    intro: 'Un espace pour échanger, partager des contenus, découvrir des communautés et participer à des événements.',
    promise: 'Les applications de communication, de publication et de vie communautaire sont réunies dans cet univers.',
    gradient: 'from-[#581c87] via-[#7e22ce] to-[#be185d]', surface: 'bg-fuchsia-50',
    features: [
      { title: 'Échanger', description: 'Rejoignez les espaces de discussion et les communautés.', icon: Users },
      { title: 'Publier et découvrir', description: 'Explorez les contenus, médias et campagnes.', icon: Sparkles },
      { title: 'Participer', description: 'Retrouvez les événements et initiatives collectives.', icon: Compass },
    ], action: 'Explorer JDV Social',
  },
  travel: {
    eyebrow: 'Voyages · Transport · Mobilité',
    headline: 'Préparez vos déplacements en toute simplicité.',
    intro: 'Un univers pour organiser vos voyages, découvrir les solutions de transport et accéder aux services de mobilité.',
    promise: 'Retrouvez les applications liées aux déplacements, aux voyages et aux opérations de transit.',
    gradient: 'from-[#0c4a6e] via-[#0369a1] to-[#4f46e5]', surface: 'bg-sky-50',
    features: [
      { title: 'Préparer un voyage', description: 'Explorez les services et informations de voyage.', icon: Plane },
      { title: 'Choisir un transport', description: 'Accédez aux solutions de mobilité disponibles.', icon: Compass },
      { title: 'Suivre le transit', description: 'Retrouvez les outils liés à la logistique et au transit.', icon: BadgeCheck },
    ], action: 'Explorer JDV Travel',
  },
  marketplace: {
    eyebrow: 'Acheter · Vendre · Développer',
    headline: 'Le commerce prend une nouvelle dimension.',
    intro: 'Découvrez les produits, les boutiques et les vendeurs, ou lancez votre activité commerciale dans l’écosystème JDV.',
    promise: 'Un espace commercial pour les acheteurs, créateurs, commerçants et fournisseurs.',
    gradient: 'from-[#172554] via-[#1e3a8a] to-[#c2410c]', surface: 'bg-orange-50',
    features: [
      { title: 'Découvrir les produits', description: 'Explorez les offres et trouvez ce qui vous correspond.', icon: Search },
      { title: 'Trouver une boutique', description: 'Rencontrez des vendeurs et découvrez leurs catalogues.', icon: ShoppingBag },
      { title: 'Créer son activité', description: 'Accédez au parcours de création de votre boutique.', icon: Building2 },
    ], action: 'Explorer Marketplace',
  },
  services: {
    eyebrow: 'Entreprises · Prestations · Professionnels',
    headline: 'Les bons services, les bons partenaires.',
    intro: 'Un univers professionnel qui rassemble les prestations, les outils d’entreprise et les services aux organisations.',
    promise: 'Découvrez les applications qui accompagnent les entreprises, les équipes et les prestataires dans leurs opérations.',
    gradient: 'from-[#064e3b] via-[#047857] to-[#1d4ed8]', surface: 'bg-teal-50',
    features: [
      { title: 'Trouver une prestation', description: 'Parcourez les services proposés par les professionnels.', icon: Search },
      { title: 'Gérer son activité', description: 'Accédez aux outils métier et aux applications d’entreprise.', icon: BriefcaseBusiness },
      { title: 'Développer son réseau', description: 'Découvrez les ressources pour travailler avec des partenaires.', icon: Users },
    ], action: 'Explorer JDV Services',
  },
  tontine: {
    eyebrow: 'Épargne collective · Cotisations · Groupes',
    headline: 'Construisez vos projets ensemble.',
    intro: 'Un espace consacré à l’épargne collective, aux groupes de cotisation et au suivi des engagements.',
    promise: 'Retrouvez les outils de gestion et de suivi des tontines dans un univers dédié.',
    gradient: 'from-[#134e4a] via-[#0f766e] to-[#0e7490]', surface: 'bg-teal-50',
    features: [
      { title: 'Découvrir les formules', description: 'Comprenez les différentes classes et modalités proposées.', icon: Search },
      { title: 'Organiser un groupe', description: 'Retrouvez les outils de gestion des membres et cotisations.', icon: Users },
      { title: 'Suivre les opérations', description: 'Consultez les documents et le suivi de votre groupe.', icon: Wallet },
    ], action: 'Explorer JDV Tontine',
  },
  finance: {
    eyebrow: 'Paiements · Assurance · Comptabilité',
    headline: 'Vos opérations financières mieux organisées.',
    intro: 'Un univers pour accéder aux services de paiement, aux solutions d’assurance et aux outils de gestion financière.',
    promise: 'Les applications financières conservent leurs propres règles, comptes et parcours sécurisés.',
    gradient: 'from-[#1e293b] via-[#155e75] to-[#0f766e]', surface: 'bg-cyan-50',
    features: [
      { title: 'Services de paiement', description: 'Découvrez les outils et services de paiement disponibles.', icon: Wallet },
      { title: 'Protection et assurance', description: 'Accédez aux services liés à la couverture et aux demandes.', icon: ShieldCheck },
      { title: 'Gestion comptable', description: 'Retrouvez les outils de suivi et de comptabilité.', icon: BadgeCheck },
    ], action: 'Explorer JDV Finance',
  },
};

export function generateStaticParams() {
  return getGroupedJDVModules().map((group) => ({ slug: group.id }));
}

export default async function UniverseWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getGroupedJDVModules().find((item) => item.id === slug || (slug === 'health' && item.id === 'sante'));
  if (!group) notFound();
  const experience = universeExperience[group.id];
  if (!experience) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <GlobalHeader />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <Link href="/univers" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"><ArrowLeft size={16} /> Les neuf univers</Link>

        <section className={`relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br ${experience.gradient} px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14`}>
          <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border-[52px] border-white/[.07]" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 h-80 w-80 rounded-full bg-white/[.06] blur-3xl" />
          <div className="relative grid gap-9 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-white/90"><Sparkles size={14} /> {experience.eyebrow}</span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-white/65">Univers JDV · {group.title}</p>
              <h1 className="mt-3 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">{experience.headline}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{experience.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={group.modules[0]?.href ?? '/'} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-white/90">{experience.action}<ArrowRight size={16}/></a>
                <a href="#applications" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">Voir les applications<ArrowRight size={16}/></a>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-3">
              {experience.features.map((feature, index) => { const Icon = feature.icon; return (
                <div key={feature.title} className={`rounded-2xl border border-white/15 bg-white/[.09] p-4 backdrop-blur-sm ${index === 2 ? 'col-span-2' : ''}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Icon size={20}/></span>
                  <h2 className="mt-4 text-sm font-extrabold">{feature.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-white/70">{feature.description}</p>
                </div>
              );})}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className={`rounded-3xl ${experience.surface} p-6 sm:p-8`}>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Un univers, plusieurs solutions</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">Tout commence ici.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{experience.promise}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-800"><BadgeCheck size={17}/> {group.modules.length} application{group.modules.length > 1 ? 's' : ''} rattachée{group.modules.length > 1 ? 's' : ''}</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-accent"><Headset size={21}/></span><div><h2 className="font-extrabold">Besoin d’accompagnement ?</h2><p className="mt-1 text-sm text-muted-foreground">Les informations d’assistance sont centralisées.</p></div></div>
            <Link href="/help" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-accent">Accéder au Centre d’aide<ArrowRight size={15}/></Link>
          </div>
        </section>

        <section id="applications" className="mt-12 scroll-mt-24" aria-labelledby="universe-applications">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-accent">Votre espace métier</p><h2 id="universe-applications" className="mt-2 text-2xl font-black sm:text-3xl">Les applications de {group.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Découvrez chaque application. La connexion reste propre à l’application lorsqu’une opération nécessite un compte.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground"><LockKeyhole size={13}/> Accès et comptes indépendants</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.modules.map((module, index) => { const Icon = module.icon; return (
              <article key={module.id} className="group flex min-h-56 flex-col rounded-3xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl">
                <div className="flex items-start justify-between gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-accent"><Icon size={23}/></span><span className="text-xs font-black tracking-[.14em] text-muted-foreground">APP {String(index + 1).padStart(2,'0')}</span></div>
                <h3 className="mt-5 text-lg font-extrabold">{module.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{module.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-xs font-semibold text-muted-foreground">{module.protected ? 'Compte requis pour agir' : 'Découverte publique'}</span><Link href={module.href} className="inline-flex items-center gap-2 text-sm font-extrabold text-accent">Ouvrir<ArrowRight size={15} className="transition group-hover:translate-x-1"/></Link></div>
              </article>
            );})}
          </div>
        </section>
      </div>
    </main>
  );
}
