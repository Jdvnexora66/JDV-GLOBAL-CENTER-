# Audit JDV PAY hors intégrations de paiement — 1 novembre 2026

## Périmètre
Audit en lecture du code et de la configuration Supabase, sans toucher à `main`, aux règles financières, aux flux de paiement ni aux autres branches. Les intégrations prestataires et la vérification publique par QR restent en pause.

## Correction réalisée
- `src/app/settings/page.tsx` : les faux interrupteurs de préférences de notifications donnaient l'impression que les options pouvaient être activées, alors qu'aucune sauvegarde n'était raccordée. Ils sont remplacés par un état explicite « Non configuré » et un message de transparence.
- Commit : `2b7ddb4ffb59df0d2af5abf11c0b59288b75fe28`.

## Points vérifiés
- Le bucket Supabase `kyc-documents` est privé (`public = false`), limité à 5 Mio et aux formats JPEG, PNG, WebP et PDF.
- Les politiques de stockage inspectées autorisent le dépôt dans le dossier de l'utilisateur connecté et la lecture par le propriétaire ou un super-administrateur.
- Les tables `kyc_profiles`, `kyc_documents`, `pay_beneficiaries`, `wallets` et `wallet_transactions` ont RLS activé. Les politiques inspectées de lecture relient les lignes au propriétaire via `auth.uid()`.
- Le formulaire KYC contrôle le format et la taille côté interface, mais les contrôles serveur/base et les règles de stockage restent les véritables barrières de sécurité.

## Points restant à traiter
1. **Audit approfondi des fonctions SQL privilégiées.** Les Security Advisors Supabase signalent 12 fonctions `SECURITY DEFINER` exécutables par `anon` et 128 exécutables par `authenticated`. Ce signal n'est pas une preuve automatique de vulnérabilité : certaines fonctions publiques sont intentionnelles. Il faut examiner chaque définition, ses vérifications d'identité, ses droits et ses données avant de modifier les permissions.
2. **Tables RLS sans politique.** Les advisors signalent 7 tables avec RLS activé mais aucune politique. Il faut vérifier leurs privilèges SQL et leur usage serveur avant de décider si elles doivent rester strictement serveur ou recevoir des politiques.
3. **Politiques KYC.** Les politiques de quelques tables KYC apparaissent comme applicables au rôle `public`, bien que leur condition exige `auth.uid()`. Il est recommandé de les limiter explicitement au rôle `authenticated` après vérification des fonctions et migrations qui les gèrent.
4. **Paramètres JDV PAY.** Les méthodes de paiement restent dépendantes de la configuration des prestataires. Les notifications générales n'ont pas encore de persistance ; l'interface indique désormais honnêtement cet état.
5. **Vérifications techniques.** TypeScript, lint, build et tests de navigateur n'ont pas été exécutés dans cet audit. Aucun résultat positif n'est revendiqué.

## Décision de périmètre
- Ne pas changer les fonctions de paiement, les soldes, les règles de portefeuille, les limites, les remboursements, les webhooks ou les identifiants prestataires.
- Ne pas révoquer en masse les droits sur les fonctions `SECURITY DEFINER` sans revue fonction par fonction.
- Garder toutes les corrections dans `design/jdv-global-center-visual-map-v1`; aucune modification de `main` ni aucun déploiement de production.
