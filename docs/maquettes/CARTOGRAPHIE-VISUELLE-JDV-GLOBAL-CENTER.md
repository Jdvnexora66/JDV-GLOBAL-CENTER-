# JDV GLOBAL CENTER — Maquette visuelle générale et cartographie des écrans

Version 1 — 1 novembre 2026  
Branche de conception : `design/jdv-global-center-visual-map-v1`  
Dépôt : `Jdvnexora66/JDV-GLOBAL-CENTER-`

## Objectif
Valider visuellement l’architecture générale, les comptes, les interfaces et les branches avant de réorganiser le vrai dashboard. Cette maquette n’est pas une autorisation de remplacer les pages existantes : l’accueil global et les branches indépendantes doivent être préservés.

## Rôles / espaces proposés
1. Administrateur global : vue générale, utilisateurs, organisations, branches, abonnements, permissions, audit, rapports et configuration.
2. Entreprise : ventes, clients, produits/services, commandes, factures/paiements, stocks, fournisseurs, équipe, rapports.
3. Agence : portefeuille, biens/dossiers, agents, clients, visites, offres/contrats, commissions et rapports.
4. Entrepôt : stock, réceptions, sorties/livraisons, transferts, inventaires, lots/emplacements, anomalies et historique.
5. Prospecteur : prospects, visites/relances, opportunités, ventes, stock confié, remises/encaissements, commissions et objectifs.
6. Client final — rôle provisoire à confirmer : demandes, commandes, paiements, documents, notifications et assistance.

## Branches / inventaire de pages
### JDV PAY
Accueil, portefeuille, envoyer/recevoir de l’argent, transferts internationaux, conversion de devises, historique, bénéficiaires, paiements commerçants, réclamations, vérification/sécurité, paramètres.

### JDV CRM
Accueil CRM, dashboard commercial, clients, prospects, pipeline, produits/services, devis, commandes, factures, paiements, achats/fournisseurs, stocks, rapports, équipe/permissions, paramètres.

### Formation
Accueil, catalogue, détail cours, mes cours, lecteur de leçon, exercices/évaluations, résultats, certificats, formateurs, apprenants, inscription/paiement, paramètres.

### JDV Immo
Accueil, catalogue des biens, détail bien, recherche/filtres, agences, agents, visites, locations, contrats, paiements de loyers, propriétaires/locataires, documents, rapports, paramètres.

### Commerce
Accueil marketplace, catalogue, catégories, fiche produit, recherche, panier, paiement, suivi commande, vendeurs/boutiques, gestion vendeur, livraison/retours, avis, litiges, paramètres.

### Autres services
Catalogue, santé/orientation, médias, voyages, énergie/solaire, assurance/orientation, assistance juridique, aide, demandes de service, partenaires, paramètres.

## Pages communes
- Pages publiques : accueil, présentation, catalogue des branches, détail de branche, tarifs, contact, FAQ.
- Compte : inscription, connexion, vérification, mot de passe oublié/réinitialisation, profil, sécurité et sessions.
- Espace utilisateur : tableau de bord, abonnements, factures, historique des paiements, notifications, langue, thème de l’espace, assistance.
- Administration : utilisateurs, rôles, branches, abonnements, rapports, audit, paramètres avancés.

## Parcours fonctionnels à vérifier
- Visiteur : accueil → catalogue → branche → inscription/connexion.
- Utilisateur : authentification → résolution des permissions → dashboard correspondant → pages métier autorisées.
- Entreprise : client/produit → commande → facture/paiement → rapport.
- Agence : portefeuille → dossier/bien → agent → rendez-vous → offre/contrat.
- Entrepôt : réception → contrôle → mise en stock → préparation → sortie/livraison → historique.
- Prospecteur : prospect → qualification → visite/relance → opportunité → vente → commission.
- Administrateur : utilisateur/organisation → rôle → permissions → audit.

## Règles de conception et sécurité
- Socle commun, modules visuellement cohérents mais branches métier indépendantes.
- Ne pas fusionner JDV CRM avec la page d’accueil de JDV Global Center.
- Le thème global et les paramètres de plateforme sont réservés à l’administration autorisée ; la personnalisation locale appartient aux réglages autorisés de chaque espace.
- Les données sont limitées côté serveur et par RLS Supabase ; cacher un bouton dans l’interface ne suffit pas.
- Chaque écran doit prévoir chargement, erreur, état vide, succès, accès refusé, validation, pagination/recherche et confirmation d’action selon le cas.
- Les nombres et enregistrements du prototype sont fictifs ; aucune action du prototype n’écrit dans Supabase.

## Ordre de travail après validation
1. Confirmer les noms exacts des rôles (en particulier le sixième espace).
2. Cartographier les routes existantes du dépôt vers cet inventaire.
3. Pour chaque écran, définir objectif, données, actions, composants, états, permissions et navigation entrante/sortante.
4. Rapprocher les écrans des tables et relations Supabase existantes.
5. Concevoir des maquettes détaillées page par page.
6. Développer par petites étapes sur une branche isolée, tester, puis proposer une PR seulement après validation explicite.
