# JDV PAY — Vérification indépendante des reçus par QR code

**Statut :** spécification technique à valider avant toute modification de Supabase  
**Périmètre :** reçus de transactions JDV PAY uniquement  
**Environnement :** branche de travail `design/jdv-global-center-visual-map-v1`

## 1. Objectif

Permettre à un commerçant, un bénéficiaire ou un contrôleur de scanner un QR code et de vérifier qu'un reçu correspond à une transaction enregistrée et confirmée par JDV PAY.

Le QR ne doit jamais contenir un identifiant utilisateur, un numéro de téléphone, une adresse e-mail, un numéro de compte, une donnée KYC, une donnée de carte, ni les détails complets de la transaction.

## 2. Ce qui existe déjà

- `wallet_transactions` possède notamment un identifiant, une référence, un statut, un montant, des frais, une date et un portefeuille.
- Les reçus privés de l'application lisent les transactions à travers la session de l'utilisateur.
- Les demandes de paiement ont leur propre QR de partage. Ce QR est un lien de paiement et ne doit pas être confondu avec un QR de vérification de reçu.

La référence de transaction et l'UUID ne doivent pas devenir des secrets d'accès public.

## 3. Flux proposé

1. L'utilisateur connecté ouvre un reçu lié à une transaction qu'il est autorisé à consulter.
2. Le serveur vérifie que la transaction existe et que son statut est exactement `completed`.
3. Le serveur génère un jeton aléatoire cryptographiquement sûr d'au moins 256 bits.
4. Seul le hash du jeton est conservé en base ; le jeton brut est remis une seule fois au serveur applicatif pour composer l'URL du QR.
5. Le QR encode une URL HTTPS de vérification avec ce jeton opaque. Il ne contient aucune donnée personnelle ou financière lisible.
6. Lors du scan, un endpoint public valide le jeton, contrôle la révocation et relit le statut actuel de la transaction.
7. La page publique renvoie uniquement un résultat minimal : valide/invalide, référence publique, date, type et montant/devise si la politique de confidentialité l'autorise. Elle n'affiche jamais le nom complet, l'e-mail, le téléphone, le portefeuille, l'identifiant utilisateur ou le solde.
8. Le propriétaire peut révoquer le jeton. Une révocation rend immédiatement le QR invalide.

## 4. Modèle de données proposé

Nouvelle table privée, par exemple `pay_receipt_verification_tokens` :

- `id` : UUID technique.
- `transaction_id` : FK vers `wallet_transactions(id)`.
- `owner_user_id` : FK vers `auth.users(id)`, utilisée pour vérifier le droit de révocation.
- `token_hash` : hash SHA-256 unique du jeton aléatoire ; jamais le jeton brut.
- `expires_at` : date d'expiration obligatoire.
- `revoked_at` : date de révocation, nullable.
- `created_at` : date d'émission.

La table doit être inaccessible aux rôles `anon` et `authenticated` via le Data API. Les opérations d'émission, de vérification et de révocation passent par un service serveur contrôlé. Si une fonction SQL privilégiée est retenue, son schéma, son propriétaire, ses droits EXECUTE, son `search_path` et ses contrôles `auth.uid()` doivent être audités avant déploiement.

## 5. Contrôles obligatoires

- Émettre un jeton uniquement pour une transaction `completed`.
- Vérifier côté serveur l'appartenance du reçu à l'utilisateur lors de l'émission et de la révocation.
- Ne jamais accepter un statut ou un montant envoyé par le navigateur comme preuve.
- Recontrôler le statut courant à chaque vérification publique ; un remboursement, une annulation ou une rétrofacturation doit empêcher l'affichage « valide » selon les règles métier retenues.
- Stocker le hash, pas le jeton brut.
- Utiliser HTTPS, expiration, révocation, limitation de débit et journalisation sans jeton brut.
- Réponses publiques minimales, messages d'erreur non révélateurs et protections contre l'énumération.
- Ne jamais exposer la clé Supabase service-role dans le navigateur ni dans une variable `NEXT_PUBLIC_*`.
- Ajouter des tests d'accès inter-comptes, jeton expiré, jeton révoqué, transaction non terminée, transaction remboursée, brute-force et statut modifié après émission.

## 6. Endpoints envisagés

- `POST /api/pay/receipts/:transactionId/verification-token` — session authentifiée ; émet ou renouvelle un jeton après contrôle d'appartenance et de statut.
- `GET /api/pay/verify/:token` — public ; valide le jeton et retourne seulement les informations publiques minimales.
- `DELETE /api/pay/receipts/:transactionId/verification-token` — session authentifiée ; révoque le jeton du propriétaire.

Les noms et contrats définitifs doivent être confirmés avant développement. Aucun endpoint de vérification publique ne doit effectuer une lecture libre de `wallet_transactions` par UUID ou référence.

## 7. Interface prévue

- Dans le reçu privé : bouton « Générer / renouveler le QR de vérification », QR, URL de vérification, date d'expiration et action « Révoquer ».
- Sur la page publique : identité visuelle JDV PAY, état « Reçu vérifié » ou « Reçu non vérifiable », référence publique, date, type, montant/devise selon politique validée, et mention précisant qu'il s'agit d'une vérification d'enregistrement et non d'une garantie de règlement bancaire externe.
- Aucun détail privé du compte ou des parties à la transaction.

## 8. Décisions confirmées

Les choix suivants ont été confirmés par le concepteur pour guider l'implémentation :

1. Durée de validité par défaut du QR : **90 jours**.
2. Renouvellement après expiration : **oui, par le propriétaire connecté**, après un nouveau contrôle d'accès et de statut.
3. Remboursement ou annulation ultérieure : le reçu devient **non valide / opération remboursée ou annulée** ; l'historique n'est pas effacé.
4. Informations publiques : **référence publique, date, montant, devise et statut**, sans nom des parties, e-mail, téléphone, identifiant utilisateur ou portefeuille.
5. Architecture retenue pour la suite : **route serveur Next.js**, à condition de disposer d'un secret serveur exclusivement privé ; aucune clé service-role dans le navigateur.

## 9. État de réalisation

La spécification et les décisions sont enregistrées. La génération effective du QR reste désactivée tant que la migration, les contrôles RLS/droits, les endpoints serveur et les tests de sécurité ne sont pas prêts. Le QR de demande de paiement existant reste inchangé.

**Limite de cette étape :** l'environnement de travail connecté à GitHub ne fournit pas le Supabase CLI permettant de créer proprement une migration avec `supabase migration new`, ni un environnement local pour exécuter les tests. Aucun SQL n'a été appliqué à Supabase, aucune route incomplète n'a été publiée et aucune mise en production n'a été effectuée.


## 10. Première livraison technique — 1er novembre 2026

Un brouillon de migration versionnée a été ajouté :
`supabase/migrations/20261101090000_jdv_pay_receipt_verification_tokens.sql`.

Il prévoit :
- une table dédiée qui ne conserve que le hash SHA-256 du jeton ;
- un jeton aléatoire de 256 bits, délivré uniquement au propriétaire d'une transaction terminée ;
- une durée de validité de 90 jours et révocation du jeton précédent lors d'un renouvellement ;
- une vérification de statut en direct ;
- aucune lecture directe de la table par les rôles anon/authenticated ;
- une fonction de vérification réservée à `service_role`, afin d'obliger le passage par un endpoint serveur protégé contre les abus.

**Cette migration est un fichier de code en attente de revue, pas une modification appliquée à la base.** La fonction de vérification n'est volontairement pas exposée au public. L'application ne doit pas afficher de QR actif tant qu'un endpoint serveur à limitation de débit, un client Supabase administratif strictement serveur et les tests correspondants ne sont pas disponibles.

### Conditions bloquantes avant activation

1. Confirmer que l'extension `pgcrypto` est disponible dans le projet et que son schéma est bien `extensions`.
2. Vérifier les droits effectifs des rôles Supabase et l'accès aux fonctions SECURITY DEFINER.
3. Ajouter un client administratif serveur uniquement si une variable secrète privée existe ; ne jamais utiliser de clé `NEXT_PUBLIC_*`.
4. Implémenter les endpoints POST émission/renouvellement et GET vérification avec limitation de débit, réponses uniformes en cas de jeton inconnu, et journaux sans jeton brut.
5. Ajouter les tests d'accès inter-comptes, jeton expiré/révoqué, transaction remboursée/annulée, statut modifié après émission et tentatives répétées.

Aucun déploiement, aucune migration exécutée et aucun changement de production n'ont été effectués.
