import Link from 'next/link';
import {
  ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2,
 feat/jdv-univers-dedicated-portals-v1
  ChevronRight, Compass, Globe2, Headphones, LayoutGrid, Search,
  ShieldCheck, Sparkles, Star, Users, Wallet, type LucideIcon,
=======
  ChevronRight, CircleHelp, Compass, Globe2, LayoutGrid, Menu, Search,
  Settings2, ShieldCheck, Sparkles, Star, Users, Wallet,
 supabase-sync-2026-09-24
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getGroupedJDVModules } from '@/lib/jdv/application-registry';

 feat/jdv-univers-dedicated-portals-v1
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
=======
type UniverseContent = {
  eyebrow: string;
  headline: string;
  highlight: string;
  intro: string;
  slogan: string;
  heroImage: string;
  heroPosition?: string;
  accent: string;
  soft: string;
  popularTitle: string;
  popularIntro: string;
  promoTitle: string;
  promoPoints: string[];
  newsTitle: string;
  newsDescription: string;
  features: { title: string; description: string; icon: LucideIcon }[];
};

const contentByUniverse: Record<string, UniverseContent> = {
  immo: {
    eyebrow: 'Habitat · Immobilier · Construction',
    headline: 'Trouvez le lieu où',
    highlight: 'vos projets prennent vie.',
    intro: 'Explorez les biens, rencontrez les professionnels et concrétisez vos projets immobiliers dans un espace unique.',
    slogan: 'Votre prochain projet commence ici.',
    heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85',
    accent: '#1762bd', soft: '#edf4ff', popularTitle: 'Explorer l’immobilier', popularIntro: 'Les outils essentiels pour avancer.',
    promoTitle: 'Donnez forme à votre projet immobilier',
    promoPoints: ['Biens et annonces immobilières', 'Professionnels et partenaires', 'Conception et suivi de projets'],
    newsTitle: 'Conseils & tendances immobilières', newsDescription: 'Préparez votre achat, votre location ou votre projet de construction avec les bons repères.',
    features: [{ title: 'Rechercher un bien', description: 'Maisons, terrains et appartements', icon: Search }, { title: 'Vendre ou louer', description: 'Publiez et gérez vos biens', icon: Building2 }, { title: 'Construire', description: 'Concevez votre futur espace', icon: Compass }],
  },
  sante: {
    eyebrow: 'Prévention · Soins · Professionnels',
    headline: 'Prenez soin de vous,',
    highlight: 'en toute confiance.',
    intro: 'Trouvez les professionnels de santé, pharmacies et laboratoires et accédez aux services de soins de votre région.',
    slogan: 'La santé, mieux orientée.',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=85',
    accent: '#16865d', soft: '#eaf8f1', popularTitle: 'Accéder aux services de santé', popularIntro: 'Les services utiles au quotidien.',
    promoTitle: 'Un réseau de soins plus accessible',
    promoPoints: ['Professionnels et établissements', 'Pharmacies et laboratoires', 'Rendez-vous et services de santé'],
    newsTitle: 'Prévention & bien-être', newsDescription: 'Retrouvez des repères utiles pour mieux vous orienter dans votre parcours de santé.',
    features: [{ title: 'Trouver un médecin', description: 'Professionnels près de vous', icon: Search }, { title: 'Pharmacies', description: 'Services et disponibilités', icon: ShieldCheck }, { title: 'Laboratoires', description: 'Analyses et examens', icon: CheckCircle2 }],
  },
  academy: {
    eyebrow: 'Apprendre · Progresser · Certifier',
    headline: 'Développez vos talents,',
    highlight: 'ouvrez de nouvelles voies.',
    intro: 'Découvrez des formations, développez vos compétences et avancez avec des outils conçus pour apprendre et enseigner.',
    slogan: 'Le savoir ouvre les possibles.',
    heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85',
    accent: '#6551c8', soft: '#f1efff', popularTitle: 'Vos espaces de formation', popularIntro: 'Apprenez et enseignez à votre rythme.',
    promoTitle: 'Faites évoluer vos compétences',
    promoPoints: ['Parcours et contenus pédagogiques', 'Espaces apprenants et formateurs', 'Évaluations et attestations'],
    newsTitle: 'Apprendre aujourd’hui, réussir demain', newsDescription: 'Explorez les méthodes et ressources qui accompagnent votre progression.',
    features: [{ title: 'Explorer les cours', description: 'Formations et parcours', icon: Search }, { title: 'Apprendre', description: 'Votre espace apprenant', icon: BriefcaseBusiness }, { title: 'Enseigner', description: 'Outils pour formateurs', icon: Users }],
  },
  social: {
    eyebrow: 'Communauté · Médias · Événements',
    headline: 'Les rencontres créent',
    highlight: 'les grandes idées.',
    intro: 'Rejoignez des communautés, partagez vos contenus et découvrez les événements et initiatives qui vous rassemblent.',
    slogan: 'Connectés par les idées.',
    heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=85',
    accent: '#7542bd', soft: '#f5efff', popularTitle: 'Explorer la communauté', popularIntro: 'Partagez, échangez et participez.',
    promoTitle: 'Faites vivre vos communautés',
    promoPoints: ['Réseaux et groupes thématiques', 'Publication et médias', 'Événements et rencontres'],
    newsTitle: 'Communautés & inspirations', newsDescription: 'Découvrez des idées, des initiatives et des rendez-vous à partager.',
    features: [{ title: 'Communautés', description: 'Trouvez votre réseau', icon: Users }, { title: 'Publier', description: 'Partagez vos contenus', icon: Sparkles }, { title: 'Événements', description: 'Participez aux rencontres', icon: CalendarDays }],
  },
  travel: {
    eyebrow: 'Voyages · Transport · Mobilité',
    headline: 'Le monde est à portée,',
    highlight: 'préparez votre voyage.',
    intro: 'Organisez vos déplacements, découvrez les destinations et retrouvez les services de transport et de séjour.',
    slogan: 'Voyagez avec de meilleures connexions.',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
    accent: '#0879b9', soft: '#eaf6fc', popularTitle: 'Préparer un déplacement', popularIntro: 'Les services pour voyager sereinement.',
    promoTitle: 'Tout votre voyage, mieux organisé',
    promoPoints: ['Voyages et destinations', 'Transport et mobilité', 'Transit et logistique'],
    newsTitle: 'Destinations & conseils voyage', newsDescription: 'Préparez vos prochaines étapes et découvrez de nouvelles possibilités.',
    features: [{ title: 'Voyager', description: 'Destinations et séjours', icon: Compass }, { title: 'Transport', description: 'Solutions de mobilité', icon: BriefcaseBusiness }, { title: 'Transit', description: 'Suivi et logistique', icon: Globe2 }],
  },
  marketplace: {
    eyebrow: 'Acheter · Vendre · Développer',
    headline: 'Découvrez des produits,',
    highlight: 'faites grandir vos ventes.',
    intro: 'Explorez les produits et boutiques publiés ou lancez votre activité commerciale avec les outils JDV Marketplace.',
    slogan: 'Le commerce ouvre de nouvelles opportunités.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85',
    accent: '#bd6b12', soft: '#fff5e8', popularTitle: 'Explorer le commerce', popularIntro: 'Achetez et développez votre boutique.',
    promoTitle: 'Votre boutique mérite sa vitrine',
    promoPoints: ['Produits et boutiques publiés', 'Espace vendeur guidé', 'Gestion de votre catalogue'],
    newsTitle: 'Conseils pour les vendeurs', newsDescription: 'Des idées pour présenter vos produits et développer votre activité commerciale.',
    features: [{ title: 'Découvrir les produits', description: 'Parcourir le catalogue', icon: Search }, { title: 'Trouver une boutique', description: 'Découvrir les vendeurs', icon: Building2 }, { title: 'Créer une boutique', description: 'Lancer votre vitrine', icon: BriefcaseBusiness }],
  },
  services: {
    eyebrow: 'Entreprises · Prestations · Professionnels',
    headline: 'Connectez-vous aux meilleures',
    highlight: 'opportunités de services.',
    intro: 'Trouvez des entreprises, des professionnels et des prestations de qualité, ou développez votre activité avec JDV Services.',
    slogan: 'Ensemble, bâtissons un avenir meilleur.',
    heroImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85',
    accent: '#145db7', soft: '#edf4ff', popularTitle: 'Services populaires', popularIntro: 'Découvrez les domaines les plus recherchés.',
    promoTitle: 'Développez votre activité avec JDV Services',
    promoPoints: ['Accès à un réseau professionnel', 'Visibilité pour vos prestations', 'Outils pour gérer votre activité'],
    newsTitle: 'Actualités & conseils professionnels', newsDescription: 'Des ressources pour entreprendre, travailler et développer vos projets.',
    features: [{ title: 'Annuaire professionnel', description: 'Entreprises et professionnels', icon: Building2 }, { title: 'Emploi & carrière', description: 'Trouver un emploi ou recruter', icon: BriefcaseBusiness }, { title: 'Prestations', description: 'Offres et demandes de services', icon: Users }],
  },
  tontine: {
    eyebrow: 'Épargne collective · Cotisations · Groupes',
    headline: 'Construisez vos projets,',
    highlight: 'ensemble et durablement.',
    intro: 'Organisez vos groupes, suivez les cotisations et retrouvez les outils nécessaires à une épargne collective structurée.',
    slogan: 'La confiance grandit ensemble.',
    heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=85',
    accent: '#0c8278', soft: '#eaf8f6', popularTitle: 'Gérer votre tontine', popularIntro: 'Les outils pour vos groupes et cotisations.',
    promoTitle: 'Une gestion claire pour chaque groupe',
    promoPoints: ['Classes et formules de tontine', 'Suivi des membres et cotisations', 'Documents et historique des opérations'],
    newsTitle: 'Conseils & organisation collective', newsDescription: 'Retrouvez des repères pour organiser vos engagements et vos projets communs.',
    features: [{ title: 'Découvrir les formules', description: 'Comprendre les classes', icon: Search }, { title: 'Gérer un groupe', description: 'Membres et cotisations', icon: Users }, { title: 'Suivre les opérations', description: 'Historique et documents', icon: Wallet }],
  },
  finance: {
    eyebrow: 'Paiements · Assurance · Comptabilité',
    headline: 'Pilotez vos finances,',
    highlight: 'avec plus de clarté.',
    intro: 'Retrouvez les outils de paiement, d’assurance et de gestion comptable dans un univers financier structuré et sécurisé.',
    slogan: 'Des outils pour mieux gérer.',
    heroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=85',
    accent: '#087b83', soft: '#eaf8f8', popularTitle: 'Vos services financiers', popularIntro: 'Les solutions essentielles de votre espace.',
    promoTitle: 'Une meilleure visibilité sur vos opérations',
    promoPoints: ['Services de paiement', 'Solutions d’assurance', 'Gestion comptable et suivi'],
    newsTitle: 'Comprendre & mieux gérer', newsDescription: 'Des ressources pour mieux organiser vos opérations et vos démarches financières.',
    features: [{ title: 'Paiements', description: 'Services et opérations', icon: Wallet }, { title: 'Assurance', description: 'Protection et demandes', icon: ShieldCheck }, { title: 'Comptabilité', description: 'Suivi et gestion', icon: BriefcaseBusiness }],
 supabase-sync-2026-09-24
  },
};

const fallbackTheme = themes.services;

export function generateStaticParams() {
  return getGroupedJDVModules().map((group) => ({ slug: group.id }));
}

export default async function UniverseWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getGroupedJDVModules().find((item) => item.id === slug || (slug === 'health' && item.id === 'sante'));
 feat/jdv-univers-dedicated-portals-v1
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
=======
  const experience = contentByUniverse[slug === 'health' ? 'sante' : slug];
  if (!group || !experience) notFound();

  const primaryModules = group.modules.slice(0, 5);
  const popularModules = group.modules.slice(0, 4);
  const firstHref = group.modules[0]?.href ?? '/univers';

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-[#10264a]" style={{ '--universe-accent': experience.accent, '--universe-soft': experience.soft } as React.CSSProperties}>
      <div className="min-h-screen lg:grid lg:grid-cols-[218px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen flex-col bg-[#0b2148] text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
          <Link href="/univers" className="flex h-[112px] items-center gap-3 border-b border-white/10 px-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-amber-300">JDV</span>
            <span><span className="block text-xl font-black tracking-tight">Global Center</span><span className="text-[10px] font-semibold tracking-[.16em] text-blue-200">UNIVERS · {group.title.toUpperCase()}</span></span>
          </Link>
          <nav className="flex-1 space-y-1 px-3 py-6">
            <p className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-300">Votre espace</p>
            <Link href={`/univers/${group.id}`} className="flex items-center gap-3 rounded-xl bg-blue-700 px-3 py-3 text-sm font-bold shadow-lg"><LayoutGrid size={18}/> Accueil</Link>
            {primaryModules.map((module) => { const Icon = module.icon; return <Link key={module.id} href={module.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"><Icon size={18}/> <span className="truncate">{module.name.replace(/^JDV /, '')}</span></Link>; })}
            <div className="my-5 border-t border-white/10"/>
            <Link href="/univers" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-blue-100 hover:bg-white/10"><Compass size={18}/> Les neuf univers</Link>
            <Link href="/help" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-blue-100 hover:bg-white/10"><CircleHelp size={18}/> Aide & support</Link>
          </nav>
          <div className="m-4 rounded-2xl border border-blue-400/30 bg-blue-900/60 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-blue-950"><Star size={19} fill="currentColor"/></span>
            <p className="mt-3 text-sm font-extrabold">{group.title}</p>
            <p className="mt-1 text-xs leading-5 text-blue-100/80">{experience.slogan}</p>
            <Link href="/help" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-300">En savoir plus <ArrowRight size={13}/></Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-[78px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-7 xl:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/univers" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b2148] text-sm font-black text-amber-300 lg:hidden">JDV</Link>
              <div className="min-w-0"><p className="truncate text-lg font-black sm:text-xl" style={{ color: experience.accent }}>{group.title}</p><p className="hidden text-[11px] font-medium text-slate-500 sm:block">Entreprendre · Découvrir · Développer</p></div>
            </div>
            <div className="hidden max-w-[430px] flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:flex"><Search size={17} className="text-slate-500"/><span className="text-xs text-slate-500">Explorez les applications et services de cet univers</span></div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Link href="/univers" className="hidden items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 sm:flex"><Globe2 size={17}/> Neuf univers</Link>
              <Link href="/help" aria-label="Centre d’aide" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"><Bell size={18}/></Link>
              <Link href="/help" className="hidden items-center gap-2 sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-800">JD</span><span className="text-left"><span className="block text-xs font-bold text-slate-800">Mon espace</span><span className="block text-[10px] text-slate-500">Compte & assistance</span></span></Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-7 px-4 py-5 pb-24 sm:px-7 sm:py-7 sm:pb-24 xl:px-9 lg:pb-7">
            <section className="relative isolate min-h-[330px] overflow-hidden rounded-[26px] bg-[#102e5a] shadow-xl sm:min-h-[365px]" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,25,55,.96) 0%, rgba(5,25,55,.86) 39%, rgba(5,25,55,.12) 100%), url(${experience.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071d42]/40 to-transparent"/>
              <div className="relative flex min-h-[330px] max-w-3xl flex-col justify-center px-6 py-9 text-white sm:min-h-[365px] sm:px-10 lg:px-12">
                <span className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-100">{experience.eyebrow}</span>
                <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl xl:text-6xl">{experience.headline}<br/><span className="text-amber-300">{experience.highlight}</span></h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">{experience.intro}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={firstHref} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 shadow-lg transition hover:bg-amber-300">Explorer les services <ArrowRight size={16}/></Link>
                  <Link href="#applications" className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20">Voir les applications</Link>
                </div>
              </div>
              <div className="absolute bottom-5 right-6 hidden max-w-[240px] text-right text-sm font-bold italic text-white/90 xl:block">{experience.slogan}</div>
            </section>

            <section id="applications" className="scroll-mt-28">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em]" style={{ color: experience.accent }}>Découvrez votre univers</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Nos applications principales</h2></div>
                <span className="text-xs font-bold text-slate-500">{group.modules.length} application{group.modules.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {group.modules.map((module, index) => { const Icon = module.icon; return (
                  <Link key={module.id} href={module.href} className="group flex min-h-[132px] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: experience.accent }}><Icon size={23}/></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold leading-5 text-slate-900">{module.name.replace(/^JDV /, '')}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{module.description}</span><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold" style={{ color: experience.accent }}>Découvrir <ArrowRight size={13} className="transition group-hover:translate-x-1"/></span></span>
 supabase-sync-2026-09-24
                  </Link>
                );})}
              </div>
            </section>

 feat/jdv-univers-dedicated-portals-v1
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
=======
            <section className="grid gap-4 xl:grid-cols-[.92fr_1.45fr_.92fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2"><Star size={18} fill="#f5b51b" className="text-amber-500"/><h2 className="text-sm font-black">{experience.popularTitle}</h2></div>
                <p className="mb-3 text-xs text-slate-500">{experience.popularIntro}</p>
                <div className="divide-y divide-slate-100">
                  {popularModules.map((module) => { const Icon = module.icon; return <Link key={module.id} href={module.href} className="flex items-center gap-3 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: experience.soft, color: experience.accent }}><Icon size={19}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-slate-800">{module.name}</span><span className="mt-1 block line-clamp-1 text-[10px] text-slate-500">{module.description}</span></span><ChevronRight size={17} className="text-slate-400"/></Link>;})}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:p-8" style={{ background: `linear-gradient(120deg, ${experience.accent}, #0b2a58)` }}>
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[34px] border-white/10"/>
                <div className="relative max-w-xl">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/70">Votre prochaine étape</p>
                  <h2 className="mt-3 max-w-md text-2xl font-black leading-tight sm:text-3xl">{experience.promoTitle}</h2>
                  <ul className="mt-5 space-y-3">{experience.promoPoints.map((point) => <li key={point} className="flex items-center gap-2 text-xs font-semibold text-white/90"><CheckCircle2 size={17} className="shrink-0 text-amber-300"/>{point}</li>)}</ul>
                  <Link href={firstHref} className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-amber-300">Commencer maintenant <ArrowRight size={15}/></Link>
                </div>
              </div>

              <div className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2"><Sparkles size={18} style={{ color: experience.accent }}/><h2 className="text-sm font-black">{experience.newsTitle}</h2></div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{experience.newsDescription}</p>
                  <Link href="/help" className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: experience.accent }}>En savoir plus <ArrowRight size={13}/></Link>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2"><Settings2 size={18} style={{ color: experience.accent }}/><h2 className="text-sm font-black">Accès rapide</h2></div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href={firstHref} className="rounded-xl border border-slate-200 px-3 py-3 text-center text-[11px] font-bold text-slate-700 hover:bg-slate-50">Mes applications</Link>
                    <Link href="/help" className="rounded-xl border border-slate-200 px-3 py-3 text-center text-[11px] font-bold text-slate-700 hover:bg-slate-50">Assistance</Link>
                  </div>
                </article>
              </div>
            </section>

            <footer className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:grid-cols-3">
              <div className="flex items-center gap-3"><ShieldCheck size={23} style={{ color: experience.accent }}/><span><strong className="block text-xs">Accès sécurisé</strong><span className="text-[10px] text-slate-500">Chaque application conserve ses accès.</span></span></div>
              <div className="flex items-center gap-3"><Globe2 size={23} style={{ color: experience.accent }}/><span><strong className="block text-xs">Un écosystème connecté</strong><span className="text-[10px] text-slate-500">Neuf univers, des applications dédiées.</span></span></div>
              <div className="flex items-center gap-3"><CircleHelp size={23} style={{ color: experience.accent }}/><span><strong className="block text-xs">Centre d’aide JDV</strong><span className="text-[10px] text-slate-500">Retrouvez l’assistance centralisée.</span></span></div>
            </footer>
            <div className="pb-5 text-center text-[10px] font-medium text-slate-400">JDV Global Center · {group.title} · Un univers, plusieurs applications</div>
 supabase-sync-2026-09-24
          </div>
        </div>
      </div>
      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_24px_rgba(15,35,70,.08)] backdrop-blur-xl lg:hidden">
        <Link href={`/univers/${group.id}`} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-extrabold" style={{ color: experience.accent }}><LayoutGrid size={20}/>Accueil</Link>
        <Link href="#applications" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><BriefcaseBusiness size={20}/>Applications</Link>
        <Link href="/univers" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><Compass size={20}/>Univers</Link>
        <Link href="/help" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-500"><CircleHelp size={20}/>Aide</Link>
      </nav>
    </main>
  );
}
