## Intent Statement—001 — Connexion à Ballers Wanted

**Auteur humain :** Eric Hazoumé — 06 mai 2026

**POURQUOI MAINTENANT**
### DEPRECATED - 06 mai 2026 - Pas assez clair en terme d'objectifs temporels
La connexion est le point d'entrée obligatoire de toute l'expérience BallersWanted.
Sans identité minimale, aucun utilisateur ne peut être reconnu comme présent sur un terrain, ni se déclarer présent pour une durée donnée.
C'est le premier pied dans l'application : il doit être le plus léger possible pour ne pas décourager avant même l'usage réel.
Il pose aussi les bases d'une identité évolutive : ce compte minimal pourra accueillir plus tard des informations plus personnelles, sans les imposer dès le départ.
### CURRENT - 01 juin 2026
BallersWanted n'a encore aucune ligne de code : ceci est la toute première intention, celle qui rend tout le reste possible. La connexion est le prérequis absolu — sans identité minimale, aucune autre fonctionnalité ne peut exister : ni la consultation de fréquentation, ni la déclaration de présence sur un terrain. Six terrains pilotes sont déjà identifiés en Île-de-France (TEP Louis Lumière, Quai de Jemmapes, Duperré, Bir-Hakeim, La Courneuve et Nanterre Université) et doivent être actifs dès août 2026, au moment où les playgrounds se remplissent naturellement avec l'été. Cette fenêtre est étroite et non négociable : la connexion doit être testable au plus tard à mi-juin 2026 pour permettre les ajustements avant le lancement pilote. Chaque semaine de retard repousse le premier test utilisateur réel et risque de faire manquer la saison estivale — et les données terrain irremplaçables qu'elle représente pour le produit.

**POUR QUI**
Utilisateur principal : tout joueur (spontané, hésitant ou contributeur) qui découvre BallersWanted pour la première fois et veut accéder à la fréquentation réelle d'un terrain ou déclarer sa propre présence.
Utilisateur secondaire : la communauté déjà présente dans l'app, qui bénéficie directement de chaque nouvel utilisateur enregistré (effet réseau, données de fréquentation enrichies).
### UPDATED - 01 juin 2026
Investisseur / Partenaire marque : chaque utilisateur connecté est un joueur de basketball urbain identifié, localisé et actif — un profil d'audience à haute valeur pour les marques de sport (Nike, Decathlon, New Balance…) souhaitant accéder à une communauté qualifiée pour des tests produits, des enquêtes terrain ou des événements sponsorisés. La connexion est donc le premier maillon d'un actif data monétisable.


**OBJECTIF**
Permettre à un utilisateur de créer un compte en un minimum d'étapes avec trois informations seulement : un pseudo, un email unique et un picto.
Ce compte lui donne accès aux deux fonctionnalités core de l'application : consulter la fréquentation fiable d'un playground et déclarer sa propre présence sur un terrain pour une durée donnée.
Le bénéfice utilisateur est immédiat : une identité légère, sans friction, qui débloque la valeur principale de l'app dès la première session.
### DEPRECATED - 01 juin 2026 - Existe déjà dans la partie CONTRAINTES
La connexion doit établir : une identité minimale mais crédible, un cadre de confiance, et une base pour des usages futurs (présence, match, notifications), sans créer de friction inutile.

**CONTRAINTES**
- Aucune authentification sociale (Google, Apple, Facebook) en v1 : limiter la complexité technique et accélérer la mise en production.
- Collecte de données strictement minimale : pseudo + email unique + picto. Pas de photo réelle, pas de date de naissance, pas de numéro de téléphone.
- Le picto est sélectionné parmi une liste fermée d'avatars prédéfinis, sans possibilité d'upload d'image.
- Le parcours de création de compte doit être réalisable en une seule session courte, sans étape superflue.
- La valeur de la connexion doit être visible immédiatement après création du compte (accès direct à la fréquentation d'un terrain).
- Risque fort identifié : toute complexification du parcours génère de l'abandon avant même le premier usage réel.
- RGPD : la collecte de l'email implique un consentement explicite de l'utilisateur et une politique de confidentialité accessible dès la création de compte.


**CRITERE DE DRIFT**
Dans 3 mois, nous saurons que l'intention a été trahie si :
- le taux d'abandon lors de la création de compte dépasse le taux de complétion
- le nombre d'étapes du parcours de connexion a augmenté par rapport à la version initiale (pseudo + email + picto en moins de 3 étapes).
- le taux de complétion connexion passe sous les 80% définis dans les Outcome Criteria du PRD.
Signal clair de dérive :
“On a dû compliquer la connexion pour préparer plus tard…”
### DEPRECATED - 01 juin 2026 - Existe déjà dans la partie OBJECTIF
 Si la connexion n'aide pas directement un joueur à décider d'aller jouer aujourd'hui, alors elle a raté son objectif.