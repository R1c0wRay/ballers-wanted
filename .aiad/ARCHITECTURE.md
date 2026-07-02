# ARCHITECTURE

> Ce fichier est le contexte technique permanent. Un résumé condensé (max 500 tokens) est injecté dans chaque session agent.
> Mainteneur : Tech Lead

## 1. Principes Architecturaux [max 5 principes]

1. **Mobile‑First, Real‑Time by Design** :
    L’application doit être perçue comme instantanée (la présence en temps réel, la fréquentation des playgrounds, des décisions rapides (“j’y vais / j’y vais pas”). La moindre latence tue la valeur.
    Ca implique : Backend orienté événements (présence, arrivée, départ), Données fraîches > données parfaitement exhaustives, Pas de logique bloquante côté mobile, Synchronisation optimisée (résilience aux réseaux mobiles)
2. **Domain‑Driven & Sport‑Agnostic** :
    Le basket est un cas d’usage, pas une contrainte. Même si on démarre avec France, Basket, l’architecture doit explicitement permettre d’autres sports (football, street workout, padel…), d’autres règles (nombre de joueurs, durée, format), d’autres cultures d’usage. Ca implique un modèle centré sur des concepts métier abstraits : Playground, Session, Participant, SportRules. Aucune règle “basket” codée en dur. Paramétrage métier plutôt que logique conditionnelle
3. **Scalable by Composition, Not by Special Cases** :
    On ajoute des capacités sans casser l’existant. Les applications communautaires échouent souvent quand : chaque nouveau besoin = un cas spécial, chaque pays = une exception, chaque fonctionnalité = un hack. Ca implique des services découplés, responsabilités claires, extension par composition (plugins, capacités), pas de duplication fonctionnelle, APIs pensées pour être réutilisées.
4. **Privacy & Trust as a First‑Class Concern** :
    La confiance est un actif produit. On gère de la géolocalisation, de la présence physique, des habitudes de déplacement. C’est extrêmement sensible, surtout en Europe. Ca implique minimisation des données personnelles et une séparation claire entre identité, localisation et activité. Transparence utilisateur. Conformité RGPD by design, pas a posteriori
5. **Evolution Over Perfection** :
    L’architecture doit absorber l’évolution produit, pas la contraindre. Les usages réels vont : surprendre, contredire des hypothèses, évoluer vite dans les 6–12 premiers mois. Une architecture trop “parfaite” est fragile. Cea implique des choix simples, explicables, et réversibles, peu de technologies, bien maîtrisées, une observabilité intégrée (metrics ≠ logs seulement), des dépendances clairement documentées

## 2. Vue d'Ensemble

« Un joueur ouvre l’app et consulte la fréquentation d’un playground proche »

Diagramme ASCII — Flux Client → DB (stack finale)
     ┌────────────────────────────┐
     │        Mobile App          │
     │      (iOS / Android)       │
     │                            │
     │ - UI / UX                  │
     │ - Cache local              │
     │ - Offline-first            │
     └────────────┬───────────────┘
                  │
                  │ HTTPS (REST) 
                  │ + WebSocket natif
                  │ (Auth token)
                  ▼
    ┌────────────────────────────┐
    │      Backend NestJS        │
    │   (Monolithe modulaire)    │
    │                            │
    │ - AuthN / AuthZ            │
    │ - Validation entrées       │
    │ - Versioning API           │
    │ - WebSocket Gateway        │
    └────────────┬───────────────┘
                 │
                 │ Appel use case
                 ▼
     ┌────────────────────────────┐
     │       Domain Layer         │
     │ (Playground / Session)     │
     │                            │
     │ - Règles métier            │
     │ - Sport-agnostic           │
     │ - Logique pure             │
     │ - Orchestration            │
     └────────────┬───────────────┘
                  │
                  │ Requête lecture
                  ▼
    ┌────────────────────────────┐
    │       Data Access          │
    │        Layer               │
    │                            │
    │ - Requêtes optimisées      │
    │ - Géolocalisation          │
    │ - Agrégation fréquentation │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │        PostgreSQL 16       │
    │                            │
    │ - Users                    │
    │ - Playgrounds              │
    │ - Sessions                 │
    │ - Presence (volatile)      │
    └────────────┬───────────────┘
                 │
                 │ Résultat agrégé
                 ▼
    ┌────────────────────────────┐
    │       Domain Layer         │
    │                            │
    │ - Mapping DTO              │
    │ - Filtrage privacy         │
    │ - Format client            │
    └────────────┬───────────────┘
                 │
                 │ HTTPS response
                 ▼
    ┌────────────────────────────┐
    │        Mobile App          │
    │                            │
    │ - UI refresh               │
    │ - Optimistic rendering     │
    │ - Sync WebSocket           │
    └────────────────────────────┘

Variante temps réel — présence & mises à jour live
Important : le temps réel complète le HTTP, il ne le remplace pas.
     Mobile App
        │
        ├── HTTPS (chargement initial)
        │
        └── WebSocket natif
                │
                ▼
          NestJS WebSocket Gateway
                │
                ▼
          Mémoire process + DB
      (presence volatile, best effort)
                │
                ▼
          Push updates clients

Résumé des choix d’architecture :
1. Monolithe modulaire assumé
•	Un seul backend NestJS
•	Découpage strict par domaines
•	Pas de gateway externe ni BFF séparé
Simplicité maximale, évolutivité conservée

2. PostgreSQL = source unique
•	Données métier + présence volatile
•	Pas de cache distribué
•	Pas d’event bus externe
Moins d’infra, plus de maîtrise

3. Temps réel natif, sans middleware
•	WebSocket directement dans NestJS
•	Synchronisation DB / mémoire
•	Modèle “best effort”, tolérant
Cohérent avec un usage communautaire

4. Domain Layer comme rempart qualité
•	Règles métier isolées
•	Pas de dépendance framework
•	Testables même sans frameworks externes
Le domaine protège le produit

5️. Privacy by design maintenue
•	Aucune donnée inutile exposée
•	Filtrage systématique avant réponse
•	Séparation claire identité / activité
RGPD structurel, malgré les contraintes


## 3. Stack Technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Runtime** | Node.js 25 | [Pourquoi] | Écosystème mature, excellent pour I/O, temps réel et event‑driven. Aligné AI / agents / tooling. Support long terme, prévisible. Un runtime moderne, performant et imposé par l’entreprise. Il permet une architecture événementielle simple (async, WebSocket) sans multiplier les environnements.
| **Framework backend** | Nest.js | [Pourquoi] | Architecture claire (DI, modules), excellent pour DDD, scalable, maintenable par des agents. Facilite tests, observabilité et standards d’équipe. Framework structurant et opinionated, idéal pour un projet qui va évoluer. Il impose une organisation claire (modules, services, domaines), essentielle quand les tests automatisés sont limités.
| **Language** | [Ex: TypeScript strict] | [Pourquoi] | Contrat technique fort, sécurité à long terme, lisibilité pour les agents, réduction drastique des bugs en croissance. Contrat fort entre le métier, le code et les agents. Réduit drastiquement les erreurs, sert de documentation vivante et sécurise la croissance du projet.
| **Database** | [Ex: PostgreSQL 16] | [Pourquoi] | Solide, relationnel pour le cœur métier (users, playgrounds, sports). Support JSONB pour flexibilité métier. Base robuste, mature et polyvalente. Gère à la fois les données métier structurées et des besoins plus flexibles (JSONB, géo, timestamps).

1. Temps réel — WebSocket natif
Permet la présence et la fréquentation en quasi temps réel sans middleware externe.
Simple, direct, parfaitement adapté à un produit mobile communautaire.
>> Moins d’infra, plus de valeur immédiate.

2. Tests unitaires — Node.js test runner natif
Aucun outil externe, mais suffisant pour tester la logique métier critique.
Encourage des fonctions pures et un domaine bien isolé.
>> On teste ce qui compte vraiment.

3. Tests d’intégration — Scripts Node + appels HTTP réels
Validation des flux réels de bout en bout (API, DB, règles).
Moins élégant que des frameworks dédiés, mais très fidèle à la production.
>> La réalité prime sur le confort.

4. E2E — Processus QA manuels cadrés
Les parcours critiques sont validés humainement, avec checklists et critères clairs.
La qualité devient un processus, pas juste un outillage.
>> Responsabilité collective assumée.

5. Observabilité — Logs structurés + garde‑fous runtime
Sans outillage avancé, on mise sur des logs lisibles, corrélés et exploitables.
Permet de comprendre vite ce qui se passe en prod.
>> Compréhension > sophistication.

6. Architecture — Monolithe modulaire orienté domaine
Un seul déploiement, mais découpé proprement par domaines métier.
Facile à faire évoluer, à comprendre et à faire respecter par les agents.
>> Évolutif sans complexité prématurée.

## 4. Structure technique du Projet (exclusion des dossiers AIAD et packages techniques)

C:\BallersWanted
│
├── README.md
├── ARCHITECTURE.md
├── DECISIONS.md
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
│
├── .env.example
├── .gitignore
│
├── scripts/
│   ├── test-unit/
│   │   └── run-domain-tests.ts
│   ├── test-integration/
│   │   └── check-api.contract.ts
│   └── db/
│       ├── migrate.ts
│       └── seed.ts
│
├── logs/
│   └── .gitkeep
│
├── src/
│   │
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── env.config.ts
│   │   ├── database.config.ts
│   │   └── websocket.config.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── dto/
│   │   └── utils/
│   │
│   ├── domain/
│   │   ├── playground/
│   │   │   ├── playground.entity.ts
│   │   │   ├── playground.rules.ts
│   │   │   └── playground.service.ts
│   │   │
│   │   ├── session/
│   │   │   ├── session.entity.ts
│   │   │   ├── session.rules.ts
│   │   │   └── session.service.ts
│   │   │
│   │   └── user/
│   │       ├── user.entity.ts
│   │       └── user.service.ts
│   │
│   ├── application/
│   │   ├── playground/
│   │   │   └── get-playground-activity.usecase.ts
│   │   ├── session/
│   │   │   └── join-session.usecase.ts
│   │   └── user/
│   │       └── authenticate-user.usecase.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── postgres.module.ts
│   │   │   └── repositories/
│   │   │       ├── playground.repository.ts
│   │   │       └── session.repository.ts
│   │   │
│   │   ├── websocket/
│   │   │   └── presence.gateway.ts
│   │   │
│   │   └── logging/
│   │       └── logger.service.ts
│   │
│   ├── api/
│   │   ├── playground/
│   │   │   ├── playground.controller.ts
│   │   │   └── playground.module.ts
│   │   ├── session/
│   │   │   ├── session.controller.ts
│   │   │   └── session.module.ts
│   │   └── user/
│   │       ├── user.controller.ts
│   │       └── user.module.ts
│   │
│   └── tests/
│       ├── unit/
│       │   └── domain/
│       └── integration/
│
└── docs/
    ├── api-contracts.md
    ├── qa-checklists.md
    └── product-notes.md

## 5. Conventions de Code

### Nommage
- **Variables** :
Convention : camelCase
Noms métier explicites, jamais techniques
Verbes pour les actions, noms pour les états
Booléens préfixés par is, has, can, should

Pourquoi ?
Aligné TypeScript / JavaScript
Lisible sans contexte
Favorise la compréhension métier

Exemples :
```
const playgroundId: string;
const activePlayersCount: number;
const isUserAuthenticated: boolean;
const hasReachedMaxPlayers: boolean;
const shouldNotifySubscribers: boolean;
```

A éviter :
const data;
const tmp;
const pId;
const flag;

- **Fichiers** :
Convention : kebab-case
Suffixed par le rôle, pas par la techno
1 fichier = 1 responsabilité claire
Le nom du fichier doit permettre de deviner son contenu sans l’ouvrir

Pourquoi ?
Compatible OS / Git
Lisibilité immédiate dans l’arborescence
Prévisible pour les agents

Exemples :
```
playground.controller.ts
playground.module.ts
get-playground-activity.usecase.ts
session.rules.ts
presence.gateway.ts
auth.guard.ts
```

- **Database** :
Convention : snake_case
Noms métier, jamais techniques
Tables au singulier
Clés étrangères explicites : <entity>_id
Dates en suffixe _at

Pourquoi ?
Lisible côté SQL
Standard largement adopté
Pas de surprise pour l’analyse ou la BI

Exemple :
```
user
playground
session

session_id
playground_id
user_id

created_at
updated_at
started_at
ended_at

(Colonnes métiers claires)
current_players_count
max_players_allowed
sport_type

A éviter :
tbl_users
usrId
dateCreation
data1
```

### Formatting
- **Indentation** : 2 espaces (jamais de tabulation)
Pourquoi ?
Standard de facto dans l’écosystème TypeScript / JavaScript
Réduit la largeur des lignes (important pour lisibilité)
Lisible sans être visuellement “lourd”
Favorise la cohérence backend / frontend
Exemple :
```
if (isPlaygroundActive) {
  return this.playgroundService.getActivity(playgroundId);
}
```

- **Line length** : Max 100 caractères (si ça dépasse, trop dense ou mal nommée)
Pourquoi ?
Suffisant pour :
signatures métier expressives
génériques TypeScript
DTO un peu verbeux

Forçe la lisibilité sans découper artificiellement
Bon compromis entre 80 (trop strict) et 120 (trop permissif)

Règles supplémentaires :
Une idée principale par ligne
Une responsabilité principale par fonction
Sauts de ligne pour séparer les intentions, pas pour “faire joli”
Lisibilité > concision

Ces règles compensent l’absence de formateurs automatiques (Prettier, ESLint).
Elles doivent être strictement respectées en revue de code.

Exemple :
```
const activePlayersCount = this.sessionRepository.countActivePlayersForPlayground(
  playgroundId,
);
```

### Imports

1. Lisibilité immédiate
En lisant les imports, on doit comprendre :
    - où on est (API ? domain ? infra ?)
    - de quoi dépend le fichier

2. Protection du Domain Layer
Le domaine ne doit jamais dépendre d’infra ou de framework
L’ordre des imports rend les violations visibles instantanément

3. Homogénéité pour les agents
Les agents ont besoin de règles simples et déterministes
L’ordre d’import est un signal fort

4. Détection visuelle de dette
Un import mal placé = alerte immédiate en review
Pas besoin d’outillage sophistiqué

ORDRE D'IMPORTS :
1. Imports Node.js natifs
2. Imports de dépendances externes
3. Imports transverses du projet (common, config)
4. Imports application (use cases)
5. Imports domain
6. Imports infrastructure

Exemple :
// 1. Node.js natif
import crypto from 'node:crypto';

// 2. Dépendances externes
import { Injectable } from '@nestjs/common';

// 3. Commun / transverse
import { AuthenticatedUser } from '../../common/guards/auth.guard';

// 4. Application layer
import { JoinSessionUseCase } from '../../application/session/join-session.usecase';

// 5. Domain layer
import { Session } from '../../domain/session/session.entity';
import { SessionRules } from '../../domain/session/session.rules';

// 6. Infrastructure layer
import { SessionRepository } from '../../infrastructure/database/repositories/session.repository';

 Règles implicites expliquées aux agents :
Groupes séparés par une ligne vide
Pas de mélange entre layers
Pas d’import infra → domain (interdit)
Les imports sont toujours ordonnés selon les couches d’architecture.
Le Domain Layer ne doit jamais importer :
    - de framework
    - d’infrastructure
    - de code applicatif
Toute violation de l’ordre d’import est considérée comme une erreur de conception.
Les imports doivent refléter les dépendances réelles, pas des commodités.

NE PAS FAIRE :
Une liste générique type :
import A
import B
import C

Une règle floue du style :
“organiser proprement les imports”
Une convention dépendante d’un outil (ESLint, Prettier)

## 6. Patterns Utilisés

3 messages clés :
- Les patterns sont intentionnels
- Ils incarnent les principes d’architecture
- Ils ne sont pas interchangeables

Un fichier = un rôle architectural clair
Un pattern = un type de responsabilité
Pas de mélange
Les patterns protègent le Domain Layer
Le domaine est stable
Les patterns organisent le reste autour de lui

### [Pattern 1] - Use Case (Application Service)
Un Use Case représente une intention utilisateur explicite.
Il orchestre le domaine, sans contenir de logique métier complexe.

Règles pour les agents
1 fichier = 1 use case
Nom = verbe + objet + .usecase.ts
Aucune logique technique (pas de SQL, pas de HTTP)
Appelle le domaine, ne le remplace pas

Exemple canonique :
 ```
 export class JoinSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
  ) {}

  execute(input: JoinSessionInput): JoinSessionResult {
    const session = this.sessionRepository.getById(input.sessionId);

    session.join(input.userId);

    this.sessionRepository.save(session);

    return {
      sessionId: session.id,
      currentPlayersCount: session.currentPlayersCount,
    };
  }
}
```

### [Pattern 2] - Domain Entity + Rules
Une Entity encapsule l’état métier et les invariants.
Les règles métier vivent dans le domaine, jamais ailleurs.

Règles
Le domaine ne dépend de rien d’externe
Pas de DTO, pas de framework
Les règles sont explicites, nommées, testables

Exemple canonique :
```
export class Session {
  constructor(
    readonly id: string,
    private currentPlayersCount: number,
    private readonly maxPlayersAllowed: number,
  ) {}

  join(userId: string): void {
    SessionRules.ensureNotFull(this.currentPlayersCount, this.maxPlayersAllowed);
    this.currentPlayersCount++;
  }
}
```

### [Pattern 3] - Controller mince (Thin Controller)
Le Controller est une porte d’entrée, pas un cerveau.

Règles
Aucune règle métier
Aucune orchestration complexe
Il délègue toujours à un use case

Exemple canonique :
```
@Controller('sessions')
export class SessionController {
  constructor(
    private readonly joinSessionUseCase: JoinSessionUseCase,
  ) {}

  @Post(':id/join')
  joinSession(@Param('id') sessionId: string, @Req() request: Request) {
    return this.joinSessionUseCase.execute({
      sessionId,
      userId: request.user.id,
    });
  }
}
```

### [Pattern 4] - Repository (Infrastructure Boundary)
Le Repository est le seul point de contact avec la base de données.

Règles
Une interface implicite, claire
Le domaine ne connaît pas la DB
Les requêtes restent localisées

Exemple canonique :
```
export class SessionRepository {
  getById(sessionId: string): Session {
    // SQL / ORM ici
  }

  save(session: Session): void {
    // persistence ici
  }
}
```

### [Patterns explicitement INTERDITS]
Services “fourre‑tout”
Logique métier dans les controllers
Helpers transverses métiers
Accès DB hors Repository
DTO utilisés comme modèles métier

### [Résumé des règles sur les patterns]
Dans BallersWanted, les patterns ne sont pas des suggestions.
Ils structurent le code, reflètent l’architecture et protègent le métier.
Si un agent hésite, il doit imiter un pattern existant, jamais en inventer un.

## 7. Gestion des Erreurs
Cette section définit le contrat d’erreur de tout le système.
Elle précise :
- où une erreur peut être levée
- sous quelle forme
- qui est responsable de la traduire
- ce qui peut (ou non) être exposé au client

Cette section signifie :
« Voici la seule manière acceptable de gérer les erreurs dans BallersWanted.
Tout autre comportement est considéré comme une violation d’architecture. »

En tant que Tech Lead je cherche ici à garantir 5 choses :
1. Préserver le Domain Layer
    Le domaine exprime des règles, pas des statuts HTTP
2. Éviter les erreurs silencieuses
    Pas de return null
    Pas de console.log en guise de gestion d’erreur
3. Uniformité des réponses API
    Le client mobile doit toujours comprendre ce qui se passe
4. Lisibilité pour les agents
    Pas de mécanisme tordu
    Pas de hiérarchie d’exceptions inutile
5. Privacy by design
    Aucune info sensible dans les messages externes$

### [Typologie d'erreurs] - (cadre mental pour les agents)
1. Erreurs métier (Domain Errors) : Levées dans le Domain Layer
    Violations de règles métier
    Attendus, fréquentes
    Fait normal du système
Exemples :
    - Session pleine
    - Utilisateur déjà présent
    - Action non autorisée selon l’état métier

2. Erreurs applicatives : Interprétées comme erreurs 500
    Cas non prévus
    Incohérences d’état
    Bugs

### [Règle gestion d'erreur n°1] — Le domaine lève des erreurs métier explicites
Pattern imposé : Domain Error nommée

Une erreur métier = une classe dédiée
Le message est technique / interne
Le code est stable et contractuel

Exemple :
```
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
```

Exemple :
```
export class SessionIsFullError extends DomainError {
  constructor() {
    super(
      'SESSION_IS_FULL',
      'The session cannot accept more participants',
    );
  }
}
```

### [Règle gestion d'erreur n°2] — Le domaine ne connaît jamais HTTP
Exemple correct :
```
if (this.currentPlayersCount >= this.maxPlayersAllowed) {
  throw new SessionIsFullError();
}
```

Exemple interdit : Interdit dans Domain & Application layers
```
throw new HttpException('Session full', 400);
``
```

### [Règle gestion d'erreur n°3] — L'API traduit les erreurs, elle ne les crée pas
Pattern standard dans l’API (Controller / Filter)
Exemple :
```
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(400).json({
      errorCode: error.code,
      message: 'Action not allowed',
    });
  }
}
```
Pourquoi ce message générique dans l'exemple ?
Pas de fuite métier
Pas de logique côté client
Le client se base sur errorCode

 ### [Contrat d'erreur API] - Contrat d’erreur API (important pour mobile & agents)
 Toutes les erreurs exposées doivent respecter ce format :
 ```
 {
  "errorCode": "SESSION_IS_FULL",
  "message": "Action not allowed"
}
```
Règles strictes
OUI/OK : errorCode = stable, exploitable client
OUI/OK : Message = générique, non sensible
NON/KO : Pas de stacktrace
NON/KO : Pas de message métier précis

Ce n’est pas au backend de décider de l’UX.
Exemples :
SESSION_IS_FULL → “Le terrain est plein”
USER_NOT_AUTHENTICATED → redirect login
UNKNOWN_ERROR → fallback générique

Le mapping UX est côté app, jamais côté backend

Anti‑patterns explicitement interdits :
Erreurs interdites
Lever des erreurs HTTP hors de la couche API
Retourner null ou undefined en cas d’erreur
Catcher une erreur sans la relancer ou la transformer
Exposer des messages métier précis au client
Logger une erreur sans contexte métier

### [Résumé (à destination des agents)]
Dans BallersWanted, une erreur est un signal métier, pas un échec technique.
Le domaine parle en règles, l’API traduit, le client décide de l’expérience.
Toute erreur qui ne respecte pas ce flux est considérée comme une dette technique.

## 8. Sécurité

La sécurité de BallersWanted est conçue pour :
- protéger les utilisateurs sans alourdir l’expérience mobile
- rester compatible avec une architecture simple (monolithe modulaire)
- être compréhensible et respectée par des agents générateurs de code

- **Authentification** : [méthode][JWT (JSON Web Token) stateless, transmis via header Authorization]
Description pour les agents : L’authentification repose sur un token signé côté backend
Le token contient uniquement :
- l’identifiant utilisateur
- des métadonnées non sensibles

Aucune session serveur persistée

Règles
    Le Domain Layer ne connaît jamais l’authentification
    Toute vérification d’identité est faite :
    - via un guard côté API
    - avant l’exécution des use cases

Intent
    Authentifier sans état pour maximiser la scalabilité, la simplicité et la compatibilité mobile.

- **Autorisation** : [méthode][Autorisation applicative par règles métier, pas par rôles techniques]
Description pour les agents : Les droits ne sont pas gérés par des rôles globalisés (admin, user, etc.)
Les règles d’accès sont :
- contextuelles
- dépendantes de l’état métier (session, playground, participation)

Les vérifications vivent :
- soit dans le Domain Layer (règles métier)
- soit dans les use cases (orchestration)

Règles
    Pas d’ACL génériques
    Pas de logique d’autorisation dans les controllers
    Toute décision d’accès doit être explicite et testable

Intent
    L’autorisation exprime ce qu’un utilisateur peut faire dans un contexte métier donné, pas ce qu’il est.

- **Secrets** : [stockage][Variables d’environnement uniquement]
Description pour les agents :
Aucun secret n’est versionné
Aucun secret n’est hardcodé

Tous les secrets passent par :
- variables d’environnement
- fichiers .env non commités

Exemples :
    JWT secret
    Credentials database
    Clés API externes (si ajoutées)

Règles
    Accès aux secrets uniquement via le module de configuration
    Jamais d’accès direct à process.env dans le domaine ou l’application

Intent
    Garantir un code portable, sécurisé et déployable sans modification.

- **Input validation** : [méthode][Validation stricte à l’entrée de l’API + invariants métier dans le domaine]
Description pour les agents :
Côté API
    Validation des formats (types, champs requis, bornes)
    Rejet immédiat des requêtes invalides
    Aucune requête invalide ne doit atteindre le domaine

Côté domaine
    Validation des règles métier
    Protection des invariants
    Levée d’erreurs métier explicites

Règles
    Jamais de validation métier dans les controllers
    Jamais de confiance accordée aux données entrantes
    Le domaine ne valide que le métier, jamais le format

Intent
    Séparer clairement la validation technique de la validation métier pour protéger le cœur du système.

### [Résumé TL (à destination des agents)]
La sécurité dans BallersWanted est volontairement simple, explicite et distribuée :
    - l’API protège l’accès
    - le domaine protège le métier
    - les secrets ne vivent jamais dans le code
    - aucune donnée entrante n’est digne de confiance

Toute entorse à ces règles est considérée comme une faille de conception, pas comme un détail d’implémentation.

## 9. Performance (Budgets)

Dans BallersWanted, la performance n’est pas une abstraction technique, c’est :
- une perception utilisateur (“ça répond vite ou pas”)
- un levier produit (décision j’y vais / j’y vais pas)
- un garde‑fou architectural (éviter la dérive)

Les budgets doivent donc être :
- simples
- mesurables sans tooling complexe
- suffisants pour un produit mobile communautaire
- compatibles avec Evolution Over Perfection

| Métrique | Budget | Monitoring |
|----------|--------|-----------|
| **Response time p95** | [cible] | [outil] |
Response time p95≤ | inférieur ou égal à 300 ms (API HTTP, hors réseau mobile) | Logs structurés avec timestamp + durée
| **Error rate** | [cible] | [outil] |
Error rate≤ | inférieur ou égal à 1 % des requêtes | Logs d’erreurs agrégés par endpoint

## 10. ADRs (Architecture Decision Records)

> Les ADRs sont stockés dans `.aiad/adrs/` au format :
> `ADR-NNN-[titre].md`

[Aucun ADR pour l'instant — documentez chaque décision technique significative]
