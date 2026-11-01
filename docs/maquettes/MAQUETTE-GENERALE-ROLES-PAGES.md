# JDV GLOBAL CENTER — Maquette générale des rôles et des pages

**Version :** V1 — 1 novembre 2026  
**Dépôt :** [Jdvnexora66/JDV-GLOBAL-CENTER-](https://github.com/Jdvnexora66/JDV-GLOBAL-CENTER-)  
**Branche de travail :** `maquette/jdv-global-center-roles-v1`  
**Projet Supabase vérifié :** `lncgghdbnkehdcyhqdfo` — `JDV GLOGBAL CENTER FINAL`, état `ACTIVE_HEALTHY`.

## 1. Accès vérifiés

- GitHub : accès en lecture et écriture (`pull=true`, `push=true`). Le compte connecté n’a pas les droits d’administration du dépôt (`admin=false`).
- Supabase : accès au projet, lecture du schéma et exécution de requêtes de lecture confirmés. Aucune migration ni modification des données n’a été faite pour produire cette maquette.
- La branche de maquette a été créée à partir de `supabase-sync-2026-09-24`. Le travail reste isolé : pas de changement direct sur la branche par défaut, pas de déploiement de production et pas de modification de JDV CRM.

## 2. Fichiers livrés dans cette branche

- `public/maquette-jdv-global-center.html` : prototype visuel interactif, adaptatif mobile/ordinateur. Le sélecteur de rôle permet de parcourir les menus, les tableaux de bord et les écrans de démonstration.
- Ce document : inventaire des parcours, périmètre par rôle et décisions à confirmer.

## 3. Rôles retenus pour la maquette

| Espace | Objectif principal | Accès de principe |
|---|---|---|
| Administrateur global | Utilisateurs, organisations, branches, rôles, facturation, sécurité, configuration | Accès plateforme selon permissions explicites |
| Entreprise | Ventes, clients, produits, commandes, factures, stocks, équipe, rapports | Données de sa propre organisation |
| Agence | Portefeuille, dossiers/biens, agents, clients, visites, contrats, commissions | Données de l’agence et dossiers autorisés |
| Entrepôt | Réceptions, stocks, sorties, transferts, inventaires, emplacements, anomalies | Stocks et mouvements affectés à l’entrepôt |
| Prospecteur | Prospects, relances, visites, opportunités, ventes, stock confié, encaissements, commissions, objectifs | Prospects et activités attribués au prospecteur |
| Client / utilisateur final — **à confirmer** | Demandes, commandes, paiements, documents, notifications, assistance | Ses propres données uniquement |

**Important :** le sixième espace « Client / utilisateur final » est une proposition de travail parce que le nom du dernier compte n’a pas été confirmé oralement. Il ne faut pas créer ou attribuer ce rôle en production avant validation. Le schéma Supabase contient aussi des rôles génériques `admin`, `owner`, `manager`, `agent`, `accountant`, `staff`, `member` et `viewer`. Leur correspondance avec les espaces métier doit être documentée avant d’appliquer des changements de permissions.

## 4. Pages prévues par espace

### A. Administrateur global
1. Vue d’ensemble
2. Utilisateurs et rôles
3. Entreprises et organisations
4. Branches et modules
5. Abonnements et facturation
6. Contrôle des accès
7. Audit et sécurité
8. Paramètres globaux

### B. Entreprise
1. Tableau de bord
2. Activité commerciale
3. Clients
4. Produits et services
5. Commandes
6. Factures et paiements
7. Stocks
8. Équipe et rôles
9. Rapports
10. Paramètres entreprise

### C. Agence
1. Tableau de bord
2. Portefeuille
3. Biens et dossiers
4. Agents
5. Clients et demandes
6. Visites et rendez-vous
7. Offres et contrats
8. Commissions
9. Rapports agence
10. Paramètres agence

### D. Entrepôt
1. Tableau de bord
2. Stock disponible
3. Réceptions
4. Sorties et livraisons
5. Transferts
6. Inventaires
7. Lots et emplacements
8. Anomalies
9. Historique des mouvements
10. Paramètres entrepôt

### E. Prospecteur
1. Tableau de bord
2. Mes prospects
3. Nouveau prospect
4. Visites et relances
5. Opportunités
6. Commandes et ventes
7. Mon stock confié
8. Remises et encaissements
9. Commissions
10. Objectifs
11. Mon profil

### F. Client / utilisateur final — à confirmer
1. Mon accueil
2. Mon profil
3. Mes demandes
4. Mes commandes
5. Mes paiements
6. Mes documents
7. Notifications
8. Aide et assistance
9. Sécurité du compte

## 5. Structure commune de chaque écran

- En-tête : nom de l’espace, fil d’Ariane, sélecteur de profil de démonstration, notifications et avatar.
- Navigation latérale : liens propres au rôle actif.
- Zone de page : titre, description, actions principales.
- Tableau de bord : indicateurs, activité récente, raccourcis et alertes.
- Pages de données : recherche, filtres, tableau, pagination à intégrer.
- Formulaires : validation, erreurs explicites, confirmation et journalisation.
- États obligatoires : chargement, vide, erreur, succès, accès refusé, réseau indisponible et session expirée.
- Responsive : navigation compacte et tableaux défilants sur téléphone.

## 6. Principes d’accès et de sécurité

1. Ne pas se fier uniquement au menu ou à la dissimulation d’un bouton : les droits doivent être contrôlés côté serveur et par RLS.
2. Chaque entreprise, agence et entrepôt doit être limité à son organisation et à son périmètre d’affectation.
3. Un prospecteur ne doit voir que les prospects, stocks confiés, encaissements et commissions qui lui sont autorisés.
4. Le client ne voit que ses propres demandes, commandes, paiements et documents.
5. Les changements de rôle, suspensions, remboursements, ajustements de stock et actions financières doivent être audités.
6. Aucune donnée de démonstration ne doit être présentée comme une vraie activité. Le prototype indique explicitement que ses chiffres sont fictifs.

## 7. État réel constaté et précautions

- Le dépôt contient une application Next.js 15 / React 19 / Tailwind connectée à Supabase.
- Le registre de routes déjà présent dans le dépôt mentionne 167 fichiers de pages et 2 gestionnaires API à la date de son audit. Les pages listées ne sont pas toutes nécessairement testées ou complètes.
- Le schéma Supabase renvoie 375 tables dans `public`, notamment des tables de profils, organisations, rôles, permissions, entreprise, marketplace, CRM, agence/immobilier, stocks et mouvements.
- Les rôles actuellement inscrits dans `public.roles` sont génériques : `accountant`, `admin`, `agent`, `manager`, `member`, `owner`, `staff`, `viewer`. Les comptes métier cités par le propriétaire ne doivent pas être supposés équivalents sans une matrice de permissions.
- Les écrans de ce prototype sont des maquettes : ils n’enregistrent aucune donnée et ne prétendent pas remplacer les pages réelles ni les règles de sécurité.

## 8. Prochaines étapes de développement

1. Confirmer le nom du dernier compte évoqué et le périmètre de l’administrateur (administrateur global vs administrateur d’entreprise).
2. Cartographier chaque route Next.js existante vers un écran de cette maquette, sans supprimer les branches ni remplacer l’accueil de JDV Global Center.
3. Comparer chaque écran aux colonnes et relations Supabase réelles, en commençant par profils, organisations, membres, rôles et permissions.
4. Définir une matrice « rôle × page × action × périmètre de données » et valider les politiques RLS.
5. Implémenter par lots sur cette branche, puis exécuter type-check, build, tests d’accès et tests navigateur.
6. Ouvrir une Pull Request pour revue avant fusion. Aucune publication en production ne doit être faite sans validation.
