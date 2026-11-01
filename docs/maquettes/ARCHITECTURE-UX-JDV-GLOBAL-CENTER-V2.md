# JDV GLOBAL CENTER — Cartographie UX et architecture cible

**Version :** conception 1.0  
**Statut :** prototype à valider — aucune intégration métier ou migration Supabase effectuée.

## Vision
JDV GLOBAL CENTER est le portail unifié d'un écosystème de 29 applications, organisé en neuf univers. JDV CORE fournit les services transversaux. Les applications restent des domaines distincts avec leurs routes, données et règles métier propres.

## Sources examinées
- Dépôt : `Jdvnexora66/JDV-GLOBAL-CENTER-`
- Branche de référence : `supabase-sync-2026-09-24`
- Registre frontend : `src/lib/jdv/application-registry.ts`
- Regroupement frontend : `JDV_MODULE_GROUPS` dans le même fichier
- Référentiel des branches : `src/lib/jdv/branch-catalog.ts`
- Supabase : projet `lncgghdbnkehdcyhqdfo`, table `public.modules`

## Constat de cohérence
Le registre frontend présente 29 applications. La table `public.modules` interrogée contient 19 entrées : JDV CORE et 18 modules. Les statuts observés sont `active` et `development`. L'écart doit être réconcilié avant de faire du registre Supabase la source de vérité du catalogue. Les données de ce prototype sont statiques et de démonstration.

## Les neuf univers du registre frontend
1. Finance & Protection — Pay, Tontine, Insurance, Accounting.
2. Immobilier & Patrimoine — Immo.
3. Entreprises & Services — Business, Marketplace, CRM, Services, Legal, Admin, Procurement, Inventory, AI, HR.
4. Mobilité & Logistique — Travel, Transport, Transit.
5. Santé & Bien-être — Health.
6. Social & Communauté — Social, Community, Events.
7. Médias & Divertissement — Media, Pub, Global Divertissement.
8. Formation & Carrière — Academy, Jobs.
9. Agriculture & Énergie — Agriculture, Energy.

## Architecture de navigation cible
- Accueil public : proposition de valeur, recherche globale, catégories, sélections et accès au compte.
- Catalogue : recherche, filtres, fiches applications et états de disponibilité.
- Univers : page d'entrée de chacune des neuf catégories.
- Fiche application : description, fonctionnalités, statut, accès requis, abonnement et ouverture.
- Espace personnel : profil, sécurité, appareils, préférences, notifications, favoris, historique et facturation.
- JDV CORE : console d'administration du socle, avec autorisations renforcées.

## JDV CORE — capacités transversales à inventorier
Identité/authentification ; rôles et permissions ; organisations si nécessaires ; catalogue d'applications ; souscriptions et droits ; facturation ; notifications ; messagerie ; recherche ; documents ; support ; pays/langues/devises/fuseaux ; IA et automatisations ; audit, observabilité et conformité.

## Expérience multi-écran
### Ordinateur
Navigation latérale persistante, barre supérieure, recherche, grille de catégories et d'applications, espaces de travail plus denses.
### Mobile
Navigation inférieure, menus tactiles, grilles compactes, formulaires adaptés, zones de clic confortables, prise en charge des safe areas iOS et affichage responsive.
### Tablette
Disposition intermédiaire avec navigation repliable et grilles fluides.

Le prototype est un site web responsive. La préparation PWA et les validations sur appareils réels constituent une étape distincte.

## Parcours d'accès cible
1. Accueil global.
2. Recherche ou choix d'un univers.
3. Fiche d'application et conditions.
4. Connexion ou création de compte si nécessaire.
5. Vérification serveur des permissions et souscriptions.
6. Ouverture de l'application spécialisée.
7. Retour au portail avec session conservée.

## Règles de séparation
- Ne pas transformer JDV CRM en accueil de la plateforme.
- Ne pas fusionner les données métier des applications.
- Le portail unifie la découverte, l'identité et les services transversaux.
- Les contrôles d'accès restent côté serveur et dans les politiques RLS.
- Le catalogue ne doit jamais afficher « actif » sur la seule base d'une route frontend : utiliser un statut validé.

## Écrans à détailler après validation de cette direction
1. Accueil desktop et mobile.
2. Catalogue et recherche/filtrage.
3. Page univers (9 variantes).
4. Fiche application (29 fiches alimentées par données).
5. Connexion, inscription et récupération.
6. Espace personnel.
7. Centre de notifications et messagerie.
8. Centre JDV CORE : utilisateurs, permissions, modules, abonnements, paramètres, audit et supervision.

## Prochaine phase technique
1. Inventorier les routes et composants existants.
2. Comparer le registre frontend, les tables Supabase et les politiques RLS.
3. Définir un modèle de données canonique pour les catégories, applications, versions, statuts, routes et droits.
4. Concevoir les composants partagés et les breakpoints.
5. Implémenter progressivement dans une branche isolée.
6. Tests desktop, Android, iOS, tablette, accessibilité et sécurité.
7. Soumettre une PR de revue seulement après validation visuelle explicite.

## Limites de ce livrable
Le HTML est une maquette de navigation et de direction visuelle. Les fiches d'applications, connexions, données personnelles, notifications, abonnements et opérations d'administration sont des écrans conceptuels non branchés au backend. Aucun changement n'a été apporté à Supabase ni à la branche principale.
