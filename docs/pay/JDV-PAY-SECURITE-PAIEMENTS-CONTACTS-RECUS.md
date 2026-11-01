# JDV PAY — Extensions fonctionnelles prioritaires

**Branche de travail :** `design/jdv-global-center-visual-map-v1`  
**Date :** 1 novembre 2026  
**Statut :** cadrage technique et fonctionnel — aucune intégration fournisseur ni modification de base de données exécutée.

## Objectif
Faire évoluer JDV PAY vers un parcours financier cohérent, sécurisé, vérifiable et utilisable sur téléphone comme sur ordinateur, sans contourner les contrôles serveur existants.

## 1. Paiement par carte bancaire
- Ajouter une méthode « Carte bancaire » dans les moyens de paiement et dans le parcours de dépôt/rechargement.
- Utiliser une page de paiement hébergée ou des composants tokenisés certifiés par un prestataire de paiement compatible avec les pays et devises réellement desservis.
- Ne jamais enregistrer dans JDV PAY le numéro complet de carte (PAN), le CVV ou les données sensibles d'authentification. Ne conserver que le jeton fournisseur, les quatre derniers chiffres, la marque, l'expiration si le prestataire l'autorise, et les références de transaction.
- Confirmer un dépôt uniquement après validation serveur du webhook signé du prestataire ; gérer les états initié, en attente, confirmé, refusé, remboursé et contesté, avec idempotence.
- Les cartes « numérisées » sont traitées comme des cartes enregistrées via tokenisation du prestataire, pas comme une photo de carte à stocker. Ne jamais demander de photographier le recto/verso d'une carte bancaire.

## 2. KYC
- Parcours par étapes : informations personnelles, pays, type de pièce accepté, capture/téléversement sécurisé, selfie/contrôle de présence si exigé par le partenaire, consentement, soumission, suivi du dossier.
- États visibles : non commencé, brouillon, soumis, en cours de vérification, approuvé, rejeté (motif actionnable), expiré, nouvelle soumission requise.
- Les limites et opérations autorisées restent déterminées par le serveur selon le niveau KYC approuvé. Aucun badge visuel ne doit accorder à lui seul un droit financier.
- Les documents d'identité sont des données hautement sensibles : stockage privé, URLs temporaires, accès strictement limité, journalisation, durée de conservation et procédure de suppression définies.
- Choisir et contractualiser un fournisseur KYC avant intégration réelle ; ne pas inventer une validation automatique.

## 3. Double authentification (2FA)
- Le dépôt contient déjà un composant `MfaCard` basé sur TOTP Supabase Auth (enrôlement, QR, code de confirmation, désactivation).
- Le rendre accessible depuis la sécurité JDV PAY et relier les écrans de connexion/défi MFA ; le paramètre général du compte affiche encore « prochainement ».
- Exiger une authentification renforcée selon le risque : nouvel appareil, modification des moyens de paiement, opérations sensibles ou seuils définis par conformité.
- Prévoir récupération sécurisée, codes de secours ou procédure de récupération assistée, sans désactivation silencieuse.
- Vérifier le niveau d'assurance MFA côté serveur avant toute opération qui l'exige.

## 4. Contacts du téléphone
- Ajouter « Choisir dans mes contacts » près du champ bénéficiaire.
- Sur navigateur compatible, demander explicitement l'autorisation via Contact Picker API ; proposer la saisie manuelle si l'API n'est pas disponible ou si l'utilisateur refuse.
- N'importer que le contact choisi et les champs explicitement sélectionnés par l'utilisateur. Ne pas aspirer ni synchroniser tout le carnet d'adresses en arrière-plan.
- Normaliser les numéros en format international E.164, demander confirmation avant de créer/enregistrer le bénéficiaire.
- Le contact du téléphone est une suggestion, pas une preuve d'identité. Avant validation, afficher le nom du bénéficiaire enregistré et, si possible, un nom vérifié par le service destinataire. Signaler clairement toute divergence.

## 5. Confirmation du destinataire avant l'envoi
- Étape obligatoire de récapitulatif avant confirmation : nom complet vérifié, identifiant partiellement masqué (téléphone/email/compte), pays, montant, devise, frais et total débité.
- L'utilisateur doit confirmer explicitement que le nom correspond à la personne visée.
- En cas d'identité non vérifiée ou de divergence, bloquer ou mettre en attente selon les règles de conformité ; ne pas présenter un simple nom saisi comme identité vérifiée.
- Revalider côté serveur bénéficiaire, devis, limites, solde et statut au moment de l'exécution.

## 6. Reçu PDF et QR de vérification
- Après confirmation définitive d'un dépôt ou transfert, proposer « Télécharger le reçu PDF » et « Partager le reçu ».
- Le reçu contient au minimum : marque JDV PAY, statut final, référence unique, date/heure avec fuseau, émetteur et bénéficiaire (données masquées selon confidentialité), montant, devise, frais, total, canal/moyen de paiement et identifiant de transaction fournisseur si partageable.
- QR code vers une page publique de vérification HTTPS, utilisant un identifiant opaque ou un jeton signé et révocable ; aucune donnée personnelle ou bancaire ne doit être encodée directement dans le QR.
- La page de vérification indique seulement les éléments minimaux : référence, statut, date, montant/devise et noms partiellement masqués. Elle doit distinguer « transaction confirmée » d'un simple reçu généré.
- Un reçu n'est émis comme preuve de paiement qu'après confirmation serveur et rapprochement du registre immuable ; les dépôts en attente produisent au mieux un avis provisoire clairement marqué.
- Prévoir un reçu pour chaque dépôt, transfert sortant et paiement reçu, avec possibilité de retrouver/télécharger depuis l'historique.

## 7. Notifications et alignement de l'interface
- Faire un inventaire des cloches, badges, compteurs non lus, préférences, notifications système, notifications sécurité et notifications transactionnelles.
- Aligner les icônes, tailles, espacements, badges et zones tactiles dans l'en-tête et la navigation mobile/desktop.
- Séparer les alertes obligatoires (sécurité, activité financière, KYC) des préférences marketing ; un utilisateur ne doit pas pouvoir désactiver les alertes essentielles de sécurité/transaction.
- États : non lu/lu, horodatage, lien profond vers l'opération, état vide, chargement, erreur et permission de notifications navigateur.
- Ne jamais afficher un succès de dépôt/transfert à partir d'une simple réponse client ou d'une notification non vérifiée.

## 8. Éléments existants repérés dans le code
- `src/components/security/MfaCard.tsx` implémente déjà une base TOTP, mais les paramètres généraux montrent encore 2FA « prochainement ».
- `src/app/pay/settings/page.tsx` renvoie actuellement KYC vers `/pay/kyc`, notifications vers `/settings` et méthodes de paiement vers `/settings` : raccords à clarifier.
- `src/app/pay/send/page.tsx` affiche déjà le nom du bénéficiaire dans l'étape de confirmation, mais la vérification est limitée à l'enregistrement bénéficiaire et au test d'appartenance JDV ; il faut renforcer l'identité affichée et les contrôles de cohérence.
- `src/app/pay/p/[id]/page.tsx` traite le paiement d'une demande et affiche le nom du demandeur ; le succès n'offre pas encore de reçu PDF/QR de transaction.
- `package.json` inclut `qrcode.react`, mais aucune bibliothèque PDF n'a été identifiée dans les dépendances inspectées.
- Le schéma de référence PAY contient déjà des tables de fournisseurs, moyens de paiement, transactions et bénéficiaires. Leur état réel et leurs politiques RLS doivent être vérifiés avant toute migration.

## 9. Ordre de réalisation proposé
1. **Socle d'identité et sécurité :** raccorder proprement le MFA existant, définir le parcours KYC et les états serveur.
2. **Bénéficiaire/contact :** sélection de contact avec permission explicite, normalisation, confirmation renforcée du destinataire.
3. **Reçus :** modèle de reçu commun, génération PDF, jeton QR signé et page de vérification.
4. **Carte bancaire :** choix du prestataire compatible, environnement sandbox, tokenisation, webhooks et rapprochement.
5. **Notifications :** inventaire puis harmonisation des notifications transactionnelles et de sécurité.
6. **Validation :** tests unitaires, intégration, RLS, webhooks, anti-rejeu, responsive, accessibilité et tests de parcours.

## 10. Conditions avant mise en production
- Choix et compte marchand d'un prestataire cartes ; clés et webhooks configurés dans un coffre de secrets.
- Choix d'un partenaire KYC et validation des exigences légales applicables aux pays desservis.
- Revue sécurité et conformité, politiques de conservation des pièces d'identité, consentements et mécanismes anti-fraude.
- Tests sur sandbox avec événements de webhook signés, doublons, retards, refus, remboursements et contestations.
- Tests de sécurité RLS et vérification qu'un utilisateur ne peut lire ni télécharger les reçus/documents d'un autre utilisateur.
- Tests réels sur mobile et desktop ; aucune fonctionnalité financière ne doit être considérée prête sans validation serveur et parcours complet.

## Périmètre non modifié
Ce document ne modifie ni la base Supabase, ni les règles financières, ni les clés fournisseurs, ni la production. Les intégrations carte et KYC nécessitent des prestataires et paramètres validés avant toute activation réelle.
