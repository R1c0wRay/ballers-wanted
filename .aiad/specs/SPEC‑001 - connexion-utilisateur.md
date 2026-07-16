# Spécification de Feature : Connexion à Ballers Wanted

**Branche de la Feature**: `001-connexion-ballers-wanted`
**Créé le**: 06/05/2026
**Status**: Draft
**Input**: Description utilisateur: "INTENT-001 — connexion-utilisateur"

---

## Description de la feature

Du point de vue du joueur, la connexion à Ballers Wanted est le point d'entrée unique et obligatoire de l'application. Un nouveau joueur crée son compte en saisissant un pseudo, son email et en choisissant un picto parmi une liste fermée prédéfinie — sans mot de passe, sans données personnelles sensibles, sans étape superflue. Il accepte le consentement RGPD, reçoit un email de confirmation et accède directement à la fréquentation des Playgrounds dès l'activation de son compte. À son retour, il se reconnecte par biométrie (empreinte digitale) ou via un code OTP reçu par email. Chaque compte créé enrichit les données de fréquentation collective.

---

## Scénarios utilisateur et Tests **(obligatoire)**

### User Story 1 - Création de compte (nouveau joueur) (Priorité : P1)

Un joueur qui découvre Ballers Wanted pour la première fois crée son compte en 3 étapes maximum en saisissant uniquement un pseudo, son email et en sélectionnant un picto parmi une liste fermée prédéfinie. Il accepte le consentement RGPD, reçoit un email de confirmation et, après avoir cliqué sur le lien de confirmation, est redirigé directement vers la vue de fréquentation des Playgrounds.

**Pourquoi cette priorité** :
C'est le prérequis absolu de toute l'application. Aucune autre fonctionnalité (consultation de fréquentation, déclaration de Présence) n'est accessible sans compte actif. C'est aussi la fenêtre critique pour le lancement pilote estival sur les 6 Playgrounds d'Île-de-France : la fonctionnalité doit être testable par de vrais utilisateurs au plus tard à mi-juin 2026. Chaque semaine de retard risque de faire manquer la saison estivale et les données terrain irremplaçables qu'elle représente.

**Test indépendant** :
Peut être testé entièrement en simulant un nouveau joueur qui remplit le formulaire (pseudo + email + picto + consentement RGPD), reçoit l'email de confirmation, clique sur le lien et vérifie qu'il atterrit sur la vue de fréquentation d'un Playground. Fournit une valeur autonome complète : le joueur est identifié et accède à la donnée principale de l'app dès sa première session d'authentification.

**Scénarios d'acceptation** : **(en anglais)**
1. **Given** a new user opens the app for the first time, **When** they complete the creation form (pseudo + email + picto) in 3 steps maximum and accept the RGPD consent, **Then** a confirmation email is sent to the provided address and the user sees a "check your inbox" confirmation message.
2. **Given** a user has submitted the creation form and received a confirmation email, **When** they click the confirmation link, **Then** their account is activated and they are redirected to the view to ask for an OTP.
3. **Given** a user submits the creation form with an email already associated with an existing account, **When** the form is submitted, **Then** the system displays an error message indicating the email is already in use, without revealing account details.
4. **Given** a user submits the creation form with an invalid email format, **When** they attempt to proceed, **Then** the system displays an inline validation error before submission and prevents the form from being sent.
5. **Given** a user attempts to submit the creation form without selecting a picto, **When** they attempt to proceed, **Then** the system prevents submission and visually indicates the picto field is required.
6. **Given** a user attempts to submit the creation form without accepting the RGPD consent, **When** they attempt to proceed, **Then** the system prevents submission and highlights the consent field as required.

---

### User Story 2 - Reconnexion par biométrie (Priorité : P2)

Un joueur possédant déjà un compte actif ouvre l'application et se reconnecte en utilisant son empreinte digitale, sans saisir aucune information.

**Pourquoi cette priorité** :
La reconnexion biométrique est le moyen principal et le plus fluide de retour dans l'app pour les joueurs sur appareils compatibles. Elle supprime toute friction à la reconnexion et encourage l'usage récurrent — clé pour alimenter les données de fréquentation en continu et atteindre l'objectif de rétention semaine 1 d'au moins 40% défini dans le PRD.

**Test indépendant** :
Peut être testé indépendamment sur un appareil compatible biométrie, avec un compte existant actif, en vérifiant que la validation de l'empreinte digitale donne accès à l'application et redirige vers la vue de fréquentation d'un Playground sans aucune saisie supplémentaire, dans un délai inférieur à 60 secondes depuis l'ouverture de l'app.

**Scénarios d'acceptation** : **(en anglais)**
1. **Given** an existing user with an active account opens the app on a biometric-compatible device, **When** they authenticate using their registered fingerprint, **Then** they are logged in and redirected to the Playground frequentation view within 60 seconds of opening the app.
2. **Given** an existing user attempts biometric authentication and the fingerprint is not recognized after [NEEDS CLARIFICATION : nombre de tentatives maximum non défini], **When** the maximum attempts are reached, **Then** the system automatically redirects to the OTP email authentication flow.
3. **Given** an existing user's device does not support biometrics, **When** they open the app, **Then** the system automatically presents the OTP email authentication flow without offering the biometric option.

---

### User Story 3 - Reconnexion par OTP email (Priorité : P3)

Un joueur possédant déjà un compte mais ne pouvant pas utiliser la biométrie (ou qui le préfère) saisit son email enregistré, reçoit un code OTP à usage unique et l'utilise pour se connecter.

**Pourquoi cette priorité** :
C'est le mécanisme de fallback universel garantissant que 100% des joueurs peuvent se reconnecter, quelle que soit leur configuration d'appareil. Sans ce fallback, les joueurs sur appareils sans biométrie sont bloqués définitivement après leur première session d'authentification.

**Test indépendant** :
Peut être testé indépendamment sur n'importe quel appareil (avec ou sans biométrie) en vérifiant qu'un code OTP reçu par email permet l'accès complet à l'app et redirige vers la vue de fréquentation d'un Playground dans un délai ≤ 60 secondes depuis la saisie du code valide.

**Scénarios d'acceptation** : **(en anglais)**
1. **Given** an existing user selects the OTP login option, **When** they enter their registered email address and submit, **Then** a one-time password is sent to that email and the user sees a "check your inbox" screen.
2. **Given** a user has received an OTP, **When** they enter the valid OTP within its validity period of 1 minute, **Then** they are logged in and redirected to the Playground frequentation view.
3. **Given** a user enters an expired OTP, **When** they submit it, **Then** the system displays an error indicating the code has expired and offers to send a new OTP.
4. **Given** a user enters an invalid OTP, **When** they submit it, **Then** the system displays an error and offers to resend a new OTP.
5. **Given** a user enters an unregistered email address in the OTP flow, **When** they submit, **Then** the system displays the generic message "If this email is registered, you will receive a code" without revealing whether the email exists.

---

### User Story 4 - Accès à la politique de confidentialité (Priorité : P4)

Pendant la création de compte, un joueur peut accéder et lire la politique de confidentialité avant d'accepter le consentement RGPD, sans perdre les données déjà saisies dans le formulaire.

**Pourquoi cette priorité** :
Exigence légale RGPD : un consentement n'est juridiquement valide que si l'utilisateur a eu la possibilité de lire ce à quoi il consent. C'est une obligation de conformité, mais elle ne constitue pas la valeur principale de l'app.

**Test indépendant** :
Peut être testé en vérifiant que le lien vers la politique de confidentialité est accessible depuis l'écran de création, que la politique est intégralement lisible, et qu'au retour au formulaire, les champs pseudo, email et picto sont intégralement conservés.

**Scénarios d'acceptation** : **(en anglais)**
1. **Given** a user is on the account creation screen, **When** they tap the privacy policy link, **Then** the full privacy policy text is displayed (overlay or dedicated screen).
2. **Given** a user has opened the privacy policy and closes it, **When** they return to the creation form, **Then** all previously entered fields (pseudo, email, picto selection) are fully preserved.
3. **Given** a user reads the privacy policy, **When** they return to the form and check the consent checkbox, **Then** the system records the consent with the version and date of the accepted policy.

---

### Cas limites (Edge Cases)

- Lien de confirmation jamais cliqué : Le lien de confirmation est valide 5 minutes. Si l'utilisateur ne clique pas dans ce délai, le compte reste en statut pending et les données déjà renseignées (email, pseudo, picto) sont conservées. Une relance automatique par email est envoyée 24 heures après l'inscription avec un nouveau lien valide 5 minutes.
- Tentative de création avec un email appartenant à un compte actif : L'application affiche immédiatement un message sur l'écran de création indiquant que cet email est déjà associé à un compte actif.
- Tentative de création avec un email appartenant à un compte pending :
  Si un lien de confirmation est encore valide : l'application affiche un message informant l'utilisateur qu'un email de finalisation d'inscription lui a déjà été envoyé.
  Si aucun lien valide n'est en cours : un message informe l'utilisateur qu'un nouvel email est envoyé et l'email de finalisation d'inscription est envoyé.
- Tentative de connexion avec un compte en statut pending :
  Si le lien de confirmation est encore valide : l'utilisateur est informé que son compte est en attente de confirmation et est invité à consulter sa boîte mail.
  Si le lien de confirmation est expiré : un nouveau lien est envoyé et l'utilisateur en est informé.
- Création de compte — Pseudo déjà pris : La disponibilité du pseudo est vérifiée et signalée à l'utilisateur à la soumission du formulaire.
- Création de compte — Interruption de session en cours de saisie du formulaire (fermeture de l'application, perte réseau) : Les données déjà saisies dans le formulaire sont conservées et restituées à la réouverture.
- Confirmation email : 
  Lien de confirmation cliqué : Le compte est activé mais l'utilisateur n'est pas connecté automatiquement. Il doit se connecter manuellement sur l'appareil de son choix en demandant un OTP.
  Lien de confirmation cliqué une seconde fois (compte déjà actif) : l'utilisateur est redirigé vers la page de connexion avec un message l'informant que son compte a déjà été activé.
- Échecs répétés de la biométrie : Après 3 tentatives biométriques échouées, l'application redirige automatiquement l'utilisateur vers la méthode d'authentification par OTP.
- Demandes d'OTP multiples en rafale : Tant qu'un code OTP est en cours de validité (1 minutes), l'utilisateur ne peut pas en générer un nouveau.
- Saisies OTP incorrectes répétées : Après 4 saisies OTP incorrectes, la saisie est bloquée pendant 20 secondes. L'utilisateur peut ensuite soumettre une nouvelle demande d'OTP.

---

## Exigences **(obligatoire)**

### Exigences fonctionnelles (Functional Requirements)

- **FR-001** : Le système DOIT permettre la création d'un compte avec exactement 3 champs : pseudo, email et picto.
- **FR-002** : Le système DOIT valider l'unicité de l'email lors de la soumission du formulaire de création.
- **FR-003** : Le système DOIT valider le format de l'email avant toute soumission du formulaire de création.
- **FR-004** : Le système DOIT proposer une liste fermée de 8 pictos prédéfinis sans permettre l'upload d'image.
- **FR-005** : Le système DOIT rendre la sélection d'un picto obligatoire pour soumettre le formulaire de création.
- **FR-006** : Le système DOIT permettre la complétion du parcours de création de compte en 3 étapes maximum dans l'application.
- **FR-007** : Le système DOIT afficher un consentement RGPD explicite, à accepter obligatoirement avant la soumission du formulaire de création.
- **FR-008** : Le système DOIT rendre la politique de confidentialité accessible via un lien depuis l'écran de création de compte.
- **FR-009** : Le système DOIT conserver les données saisies dans le formulaire de création lorsque l'utilisateur navigue vers la politique de confidentialité puis revient au formulaire.
- **FR-010** : Le système DOIT envoyer un email contenant un lien de confirmation à usage unique à l'adresse saisie lors de la création de compte.
- **FR-011** : Le système DOIT activer le compte uniquement après que l'utilisateur a cliqué sur le lien de confirmation email. Aucun accès à l'application n'est possible avant cette activation.
- **FR-012** : Le système DOIT rediriger l'utilisateur vers la vue de fréquentation d'un Playground immédiatement après l'activation du compte.
- **FR-013** : Le système DOIT invalider le lien de confirmation après son utilisation ou après expiration fixée à 5 minutes.
- **FR-014** : Le système NE DOIT PAS proposer d'authentification sociale (Google, Apple, Facebook) en v1.
- **FR-015** : Le système DOIT permettre la reconnexion d'un joueur actif par biométrie (empreinte digitale) sur les appareils compatibles.
- **FR-016** : Le système DOIT proposer automatiquement le flux OTP email si la biométrie n'est pas disponible sur l'appareil ou échoue après 3 tentatives.
- **FR-017** : Le système DOIT envoyer un code OTP à usage unique à l'email enregistré du joueur lors d'une demande de reconnexion par OTP.
- **FR-018** : Le système DOIT invalider un code OTP après son utilisation ou après expiration fixée à 5 minutes.
- **FR-019** : Le système DOIT afficher le message générique "If this email is registered, you will receive a code" en cas de saisie d'un email non reconnu dans le flux OTP, sans révéler l'existence ou non du compte.
- **FR-020** : Le système DOIT enregistrer pour chaque compte la version et la date de la politique de confidentialité acceptée lors du consentement RGPD.
- **FR-021** : Le pseudo DOIT être unique.

### Entités clés

- **Joueur (Player)** : Représente l'identité minimale d'un utilisateur enregistré.
  Attributs : identifiant unique, pseudo unique, email vérifié, picto_id, statut du compte (pending / active), date de création, version et date du consentement RGPD accepté.

- **Picto** : Représente un avatar visuel prédéfini sélectionnable par le joueur.
  Attributs : identifiant, référence visuelle. Appartient à une liste fermée gérée par le système, non modifiable par l'utilisateur.

- **Session d'authentification** : Représente une session d'authentification technique active d'un joueur dans l'application. À ne pas confondre avec la "Session de jeu" (déclaration de Présence d'un joueur sur un Playground), qui relève d'une autre feature. Attributs : identifiant joueur, méthode d'authentification utilisée (biométrie / OTP), date de création.

- **Token de confirmation email** : Représente le lien de vérification envoyé à la création du compte. Attributs : valeur unique, joueur associé, statut (actif / utilisé / expiré), expiration à 5 minutes

- **Code OTP** : Représente le code à usage unique envoyé pour la reconnexion.
  Attributs : valeur, joueur associé, statut (actif / utilisé / expiré), expire à 1 minutes.

---

## Critères de succès **(obligatoire)**

### Résultats mesurables

- **SC-001** : Le taux de complétion du parcours de création de compte est de 80% minimum (Outcome Criteria PRD — mesuré via funnel login).
- **SC-002** : Le taux d'abandon lors de la création de compte est strictement inférieur au taux de complétion (50% max).
- **SC-003** : Le parcours de création de compte est réalisable en 3 étapes maximum dans l'application, mesurable par audit du nombre d'écrans traversés.
- **SC-004** : 100% des comptes nouvellement activés (post-confirmation email) sont redirigés vers la vue de fréquentation d'un Playground sans étape intermédiaire supplémentaire.
- **SC-005** : La fonctionnalité de création de compte est testable par des utilisateurs réels sur les 6 Playgrounds pilotes d'Île-de-France au plus tard le 15 juin 2026.
- **SC-006** : Le nombre d'étapes du parcours de connexion ne dépasse pas 3 à compter de la version initiale (critère de drift — Outcome Criteria PRD).
- **SC-007** : 100% des consentements RGPD enregistrés sont tracés avec la version et la date de la politique acceptée, vérifiable par audit des données.
- **SC-008** : Le flux de reconnexion (biométrie ou OTP) est opérationnel pour 100% des joueurs disposant d'un compte actif, quelle que soit la configuration de
  leur appareil.
- **SC-009** : Le flux de reconnexion complet (biométrie ou OTP) permet à un joueur existant d'accéder à la vue de fréquentation d'un Playground en 60 secondes maximum depuis l'ouverture de l'app (Outcome Criteria PRD — "Temps pour décider j'y vais").
