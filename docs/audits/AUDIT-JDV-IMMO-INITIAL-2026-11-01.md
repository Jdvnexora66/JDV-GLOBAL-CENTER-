# Audit initial JDV IMMO — 1 novembre 2026

## Périmètre et précautions
- Dépôt examiné : `Jdvnexora66/JDV-GLOBAL-CENTER-`
- Branche examinée : `design/jdv-global-center-visual-map-v1`
- Inspection initiale du code et des politiques Supabase en lecture seule.
- Aucun changement de schéma, aucune modification de paiement, aucun déploiement.
- Le traitement des loyers via un prestataire reste suspendu tant que les accès prestataires ne sont pas disponibles.

## Éléments positifs constatés
- Les tables `immo_*` examinées ont RLS activé.
- Les baux sont filtrés par locataire, propriétaire ou accès à l'entreprise propriétaire.
- Les échéanciers de loyer sont lisibles par les parties au bail ou les utilisateurs ayant accès à l'entreprise propriétaire.
- Les signalements de maintenance, états des lieux et historiques de bail ont des politiques RLS qui contrôlent l'accès au bien ou au bail.
- La page catalogue valide côté interface que la date d'une visite est future ; les demandes de visite restent explicitement non contractuelles.

## Points à examiner avant de déclarer le module sécurisé

### Priorité haute — visibilité de `immo_projects`
La politique SELECT `immo_projects_select` utilise `USING (true)` pour le rôle `public`. Les droits de table observés accordent SELECT à `authenticated`, pas à `anon`, donc l'inspection ne démontre pas un accès anonyme. En revanche, tous les utilisateurs authentifiés semblent pouvoir lire les lignes de projets, dont les colonnes comprennent notamment adresse, coordonnées, statut, prix de départ et identifiant d'entreprise. Vérifier si les projets non publiés ou suspendus doivent être visibles aux autres comptes et, si non, restreindre la politique selon le statut public prévu et/ou les droits métier. **Aucune politique n'a été modifiée**, car le statut de publication attendu doit être confirmé avant une correction.

### Priorité haute — modification des demandes de visite
La politique UPDATE de `immo_appointments` permet à la personne qui a créé la demande ou au gestionnaire du bien de modifier la ligne si elle satisfait le prédicat. Il faut confirmer que les demandes ne peuvent pas être modifiées par leur demandeur pour changer des champs réservés au gestionnaire, notamment `appointment_status` et `agent_id`. Une solution robuste pourrait limiter les colonnes modifiables ou séparer les opérations de demandeur et de gestionnaire. Aucune modification SQL n'a été appliquée.

### Priorité moyenne — droits de suppression
Les droits de table de plusieurs tables accordent DELETE à `authenticated`, alors que RLS détermine ensuite quelles lignes sont supprimables. Pour chaque table immobilière, confirmer que les politiques DELETE sont intentionnelles et que les suppressions de dossiers sensibles (baux, documents, projets, rendez-vous) sont couvertes par des politiques explicites. Ne pas révoquer globalement les privilèges sans cartographier les usages.

### Priorité moyenne — documents
La politique de lecture de `immo_documents` autorise la lecture si `is_public = true`, si l'utilisateur est l'uploader, ou si l'utilisateur est partie autorisée au bien/bail. Vérifier que `is_public` ne peut pas être activé librement pour un document privé et que les chemins/URLs de stockage ne contournent pas cette politique.

### Interface de gestion
`src/app/immo/gestion/page.tsx` interroge plusieurs tables, mais s'appuie principalement sur RLS pour limiter les lignes. C'est acceptable uniquement si les politiques de chaque table sont exactes. Prévoir des messages d'accès refusé plus explicites et tester les vues avec plusieurs profils : visiteur, locataire, propriétaire individuel, membre d'entreprise, agent et super-administrateur.

## Plan de correction recommandé
1. Définir les états de projet qui sont publiquement visibles et confirmer le modèle d'accès aux projets.
2. Examiner les triggers et les flux de mise à jour des rendez-vous avant de séparer les droits demandeur/gestionnaire.
3. Vérifier la politique de publication des documents et les politiques DELETE table par table.
4. Tester les scénarios d'accès croisé entre deux utilisateurs et deux entreprises distinctes.
5. Tester build, lint et tests automatisés avant tout déploiement.

## État de validation
- Audit SQL : lecture seule, politiques et privilèges inspectés pour les tables citées.
- Tests navigateur, build, lint et tests automatisés : non exécutés dans le cadre de cet audit.
- Déploiement : aucun.
- Branche principale `main` : non modifiée.
