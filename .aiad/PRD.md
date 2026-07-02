# PRD - BallersWanted

## Contexte et Problème

**Quel problème ?**
Les joueurs de sports collectifs en extérieur (ex : basket playground) font face à une incertitude constante :
“Est-ce qu’il y aura du monde si je me déplace ?”
Aujourd’hui :
- si les joueurs se connaissent, ils peuvent s'envoyer des messages via des applications téléphoniques de messagerie instantanée
- s'ils ne se connaissent pas, ils peuvent voir si des groupes existent sur les réseaux sociaux pour se coordonner
- Les terrains extérieurs sont non coordonnés
- La fréquentation est imprévisible
- Les joueurs prennent un risque (temps, énergie, déplacement) en se rendant sur place

Résultat :
- Friction forte à la pratique
- Opportunités de jeu perdues
- Expérience sociale dégradée

**Pour qui ?**
Les utilisateurs principaux sont :
- Des joueurs de sports collectifs extérieurs (principalement basket au démarrage)
- Qui jouent de manière spontanée
- Qui veulent anticiper la fréquentation des terrains à la journée
- Qui utilisent leur téléphone avant de se déplacer
- Et qui veulent éviter de se retrouver seuls

**Pourquoi maintenant ?**
L'usage mobile est omniprésent pour les décisions en temps réel
Les communautés sportives sont actives mais mal outillées
Les solutions existantes (groupes WhatsApp, bouche‑à‑oreille) ne sont pas fiables ni scalables

=> BallersWanted répond à une friction immédiate et universelle :
prendre une décision rapide en fonction de la présence réelle.

## Outcome Criteria

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Taux d’utilisateurs actifs utilisant la présence | ≥ 60% | Logs API (présence / session) |
| Taux de complétion connexion | ≥ 80% | Funnel login |
| Temps pour décider “j’y vais” | ≤ 60 sec | Tracking mobile |
| Taux de rétention semaine 1 | ≥ 40% | Cohort analytics |
| Nombre moyen de sessions créées / jour | ≥ 5 (MVP local) | DB sessions |

## Personas et Use Cases

### Persona 1 : Joueur spontané
- **Profil** : Personne qui joue régulièrement sur des playgrounds publics, souvent après le travail, les cours ou en soirée. Cette personne ne planifie pas longtemps à l’avance et décide au dernier moment.
- **Besoin principal** : Savoir rapidement si un playground est fréquenté pour éviter de se déplacer inutilement.
- **Scénario d'usage** :
1. Ouvre BallersWanted sur son téléphone
2. Consulte les playgrounds proches
3. Regarde la fréquentation en temps réel
4. Décide s’il se déplace ou non
5. Se connecte et déclare sa présence si la décision est positive

### Persona 2 : Joueur hésitant
- **Profil** : Personne qui aime jouer mais qui a déjà vécu des expériences négatives (terrain vide, attente). Cette personne est sensible à la fiabilité de l’information.
- **Besoin principal** : Réduire l’incertitude avant de se déplacer.
- **Scénario d'usage** :
1. Ouvre l’application avant de sortir
2. Vérifie l’activité sur un playground
3. Hésite en fonction du nombre de participants affiché
4. Se connecte pour voir des données fiables (qui ? pseudo, âge. Est-ce qu'il la connait ? Ami dans l'application ?)
5. Décide de rester ou de se déplacer

### Persona 3 : Joueur contributeur
- **Profil** : Personne engagée qui veut jouer mais aussi contribuer à la communauté en signalant sa présence.
- **Besoin principal** : Être visible et permettre aux autres de prendre une décision.
- **Scénario d'usage** :
1. Se connecte à l’application
2. Arrive sur un playground
3. Déclare sa présence
4. Contribue à la fréquentation visible
5. Permet à d’autres utilisateurs de décider de venir

## Hors Périmètre

- Réseau social complet (chat, amis, feed, commentaires) => Hors scope car ne contribue pas directement à la décision “j’y vais / j’y vais pas”.
- Organisation avancée de matchs (équipes, score, ranking) => Trop complexe pour le MVP et ne résout pas le problème principal de fréquentation.
- Authentification sociale (Google, Apple, Facebook) => Rejeté en v1 pour limiter la complexité technique et accélérer la mise en production.
- Profils utilisateurs enrichis (photos, bio, stats joueur) => Non essentiel pour valider l’usage initial basé sur la présence.
- Matching intelligent entre joueurs => Feature avancée, dépendante de données et d’usage réels encore inexistants.
- Notifications push avancées => Différé pour éviter surcharge et bruit avant d’avoir validé la valeur du core usage.
- Multi-sports avec règles spécifiques complètes => L'architecture est prête, mais le focus produit reste sur un sport initial (basket).
- Fiabilité parfaite de la présence => Non recherchée en v1 (best effort assumé). La vitesse et la fraîcheur priment sur la précision absolue.

## Trade-offs et Décisions

| Décision | Alternative écartée | Raison |
|----------|---------------------|--------|
| Connexion simple et rapide | Onboarding complet avec plusieurs étapes | Réduire la friction et maximiser l’activation immédiate |
| Données utilisateur minimales | Collecte riche d’informations profil | Respect de la privacy et focus sur la valeur directe |
| Focus sur la fréquentation réelle | Ajouter fonctionnalités sociales (chat, amis) | Prioriser le problème principal : décider de jouer |
| Expérience sans engagement fort | Inscription obligatoire détaillée | Permettre une adoption spontaneée |
| UX minimaliste | Interface riche avec beaucoup d’options | Éviter la surcharge et faciliter la compréhension immédiate |
| 1 usage clé (voir fréquentation) | Multi-features dès le départ | Apprendre rapidement sur un use case central |
| Activation progressive | Activation complète dès la première session | Réduire la charge cognitive au premier usage |

## Dépendances et Risques

| Risque/Dépendance | Impact | Mitigation |
|--------------------|--------|------------|
| Friction à la connexion utilisateur| Haut | Simplifier au maximum le parcours (email minimal, peu d’étapes), expliquer clairement la valeur (“voir qui joue”) |
| Perception faible de valeur après connexion | Haut | Lier immédiatement la connexion à une valeur visible (fréquentation fiable, présence réelle) |
| Données de fréquentation perçues comme peu fiables | Haut | Assumer le “best effort” + transparence + encourager la participation (effet réseau) |
| Dépendance au comportement utilisateur (effet réseau) | Haut | Encourager la contribution (déclarer sa présence), faciliter l’engagement minimal |
| Adoption initiale faible | Moyen | Focus sur un usage unique clair (voir fréquentation) + onboarding rapide |
| Mauvaise compréhension du produit | Moyen | UX simple + vocabulaire clair (Playground, Session, Présence) |
| Abandon au premier usage | Moyen | Réduire la friction + accès rapide à la valeur sans complexité |
| Mauvais timing produit (pas assez d’utilisateurs actifs) | Moyen | Lancer sur une zone géographique limitée pour créer densité (île de france) |
| Surcomplexification trop tôt | Moyen | Maintenir un scope strict MVP, refuser toute feature non liée à la décision “j’y vais / j’y vais pas” |
| Manque de différenciation perçue vs solutions informelles | Bas | Mettre en avant la fiabilité et l’instantanéité par rapport au bouche‑à‑oreille |
