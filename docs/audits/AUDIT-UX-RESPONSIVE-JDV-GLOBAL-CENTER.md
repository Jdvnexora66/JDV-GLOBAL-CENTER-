# JDV GLOBAL CENTER — Audit UX, responsive et qualité du code

Date de démarrage : 1 novembre 2026
Branche de travail : `design/jdv-global-center-visual-map-v1`

## Règles de conduite
- Auditer chaque application, chaque route et chaque écran avant sa validation.
- Préserver les règles métier, les autorisations, les contrats de données et les routes existantes pendant les refontes visuelles.
- Concevoir une interface unique qui s’adapte au téléphone, à la tablette et à l’ordinateur.
- Ne jamais modifier `main`, Supabase ou la production dans cette phase.
- Ne jamais annoncer une compilation ou un test navigateur comme réussi sans l’avoir réellement exécuté.

## Ordre de travail
1. JDV PAY — application pilote du premier cycle.
2. JDV CRM.
3. JDV BUSINESS et JDV MARKETPLACE.
4. JDV IMMO.
5. JDV TRAVEL, TRANSPORT et TRANSIT.
6. JDV HEALTH et JDV INSURANCE.
7. JDV TONTINE, ACCOUNTING, HR, PROCUREMENT et INVENTORY.
8. JDV AGRICULTURE et JDV ENERGY.
9. JDV ACADEMY, JOBS, LEGAL, AI, SOCIAL, COMMUNITY, EVENTS, MEDIA, PUB, ENTERTAINMENT et ADMIN.
10. Portail global, authentification, paramètres, administration et parcours transverses.

## Grille d’audit par écran
- Rôle de la page et parcours utilisateur.
- Hiérarchie visuelle, lisibilité, densité et cohérence de marque.
- Mobile 360/390/430 px, tablette et desktop.
- Navigation, retour, état actif, focus clavier et cibles tactiles.
- États de chargement, vide, erreur, succès et nouvelle tentative.
- Formulaires, validation, clavier mobile et prévention des doubles actions.
- Tableaux, listes, filtres, pagination et export.
- Authentification, permissions, protection des données et états non autorisés.
- Dépendances, composants réutilisés, types, erreurs potentielles et dette technique.
- Vérification des liens et des routes internes.

## Cycle 1 — JDV PAY

### Écrans inspectés
- `/pay` — tableau de bord et synthèse des portefeuilles.
- `/pay/send` — envoi et confirmation du transfert.
- `/pay/history` — historique des opérations (première lecture du composant).
- `/pay/beneficiaries` — gestion des bénéficiaires (première lecture du composant).
- `/pay/receive` — à compléter dans la revue approfondie.

### Constat initial
- Le tableau de bord initial était fonctionnel mais très compact, avec une hiérarchie visuelle faible et peu de différenciation entre les actions principales, les portefeuilles et les opérations.
- Le sélecteur de devise du transfert et les onglets PayHeader utilisent le défilement horizontal ; à tester tactilement sur petit écran.
- La page d’envoi dispose déjà d’un parcours formulaire → confirmation → succès, d’un devis de frais/limites et d’une clé d’idempotence. Ces comportements sont à préserver.
- La liste des bénéficiaires présente des actions denses à droite de chaque ligne ; contrôler le reflow mobile et les cibles tactiles.
- La navigation globale contextuelle est générique ; les onglets spécifiques à PAY restent dans PayHeader. Vérifier la cohérence de ce double niveau lors des essais réels.
- Le hook des portefeuilles trie les soldes par solde et devise ; le tableau de bord ne doit pas additionner des devises différentes dans un total unique.

### Travail réalisé
- Refonte visuelle de `/pay` : accueil plus éditorial, actions rapides identifiables, portefeuilles en cartes adaptatives, historique plus lisible et états de chargement/vide/erreur explicités.
- Conservation des requêtes Supabase, des routes, des types métier et de la logique de portefeuille.
- Les montants restent affichés dans leur devise d’origine ; aucun total multi-devise trompeur n’est calculé.
- Commit de la refonte du dashboard : `66fb10be4eec7441a8babaf3a219896c4bd32173`.

### Contrôles encore nécessaires pour JDV PAY
- Relecture détaillée complète de chaque route secondaire.
- Tests de largeur réelle 360, 390, 430, 768, 1024 et 1440 px.
- Test du clavier mobile, du scroll horizontal, des états de chargement et des erreurs réseau.
- Vérification des règles RLS et des droits via des comptes de test autorisés.
- Type-check, lint et build Next.js dans un environnement de build disponible.
- Test de navigation et de transactions en environnement de test ; aucun transfert réel ne doit être déclenché pour valider l’interface.

## Statut
- JDV PAY : refonte initiale du dashboard enregistrée ; audit des sous-pages et tests techniques toujours ouverts.
- Les autres applications : inventaire et audit à réaliser par lots.
- La plateforme n’est pas déclarée prête pour la production.
