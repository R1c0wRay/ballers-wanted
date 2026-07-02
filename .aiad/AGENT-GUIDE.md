# AGENT-GUIDE — BallersWanted

## Identité du Projet

- **Nom** : BallersWanted
- **Description** : BallersWanted est une application permettant à des joueurs de basket-ball de se retrouver sur des terrains extérieurs gratuits (playground) pour pouvoir jouer.
- **Domaine métier** : Loisirs, communautés, passion, sport
- **Mission** : Permettre aux joueurs de basket d'informer de leur venue sur un terrain (playground) pour ne pas se retrouver seul, organiser des matchs et avoir de la visibilité sur la fréquentation. Qui est présent et où ?

## Documentation de Référence

- PRD : ./PRD.md
- ARCHITECTURE : ./ARCHITECTURE.md
- SPECs en cours : [Lien]

## Stack Technique

BallersWanted repose sur un backend NestJS exécuté en Node.js 25, avec TypeScript en mode strict comme langage unique pour garantir cohérence et sécurité. L’application suit une architecture monolithe modulaire orientée domaine (DDD), avec un Domain Layer pur indépendant de toute technologie.
Les échanges se font en HTTP REST, complétés par du temps réel via WebSocket natif, directement intégré dans NestJS (pas de middleware externe).
La persistance repose uniquement sur PostgreSQL 16, utilisé à la fois pour les données métier (users, sessions, playgrounds) et la présence volatile (best‑effort). Aucun cache distribué ni event bus n’est utilisé afin de privilégier la simplicité.
La sécurité s’appuie sur une authentification JWT stateless, avec validation stricte des entrées et gestion des secrets via variables d’environnement.
La qualité est assurée par :
Node.js test runner natif pour les tests unitaires
Scripts d’intégration HTTP réels
QA manuels cadrés pour les E2E

L’observabilité repose sur des logs structurés, utilisés pour mesurer la performance (p95 ≤ 300 ms) et le taux d’erreur (≤ 1%).

## Règles Absolues

### TOUJOURS

- Respecte strictement l’architecture (Domain → Application = Infrastructure → API) → Aucun mélange de responsabilité, aucune dépendance interdite.
- Imite un pattern existant avant d’écrire du nouveau code = Si un exemple existe dans le projet, il doit être reproduit à l’identique dans son intention.
- Exprime explicitement le métier dans le code = Noms, structures et logique doivent refléter le vocabulaire métier (Playground, Session, Presence).
- Valide toutes les entrées à la frontière API = Aucune donnée invalide ne doit atteindre le Domain Layer.
- Lève des erreurs métier explicites (DomainError) = Jamais de null, jamais d’erreur silencieuse.
- Maintiens la cohérence SPEC ↔ code = Toute implémentation doit être traçable à la SPEC correspondante (pas de drift).

### JAMAIS

- N'écris jamais de la logique métier dans Controllers ou Infrastructure
- N'accède jamais à la base de données hors Repository
- N'introduis jamais de nouveau pattern sans la validation du Tech Lead
- N'optimise jamais sans preuve (logs / metrics)
- Ne contourne jamais une règle “temporairement”

## Conventions de Code

**Nommage** : Convention métier stricte
    - Variables : camelCase, orientées métier (playgroundId, currentPlayersCount)
    - Classes : PascalCase (Session, JoinSessionUseCase)
    - Fichiers : kebab-case + suffixe rôle (join-session.usecase.ts, session.rules.ts)
    - Database : snake_case, tables singulier, clés explicites (session_id, created_at)
Règle absolue : le code doit refléter le vocabulaire métier (Playground, Session, Presence) et jamais des termes techniques vagues (data, service, handler)

**Structure composants** : Pattern DDD + Use Case
    - Domain Layer : règles métier, entités, erreurs (aucune dépendance technique)
    - Application Layer : Use Cases (orchestration uniquement)
    - Infrastructure : DB, WebSocket, logging
    - API Layer : Controllers minces (validation + délégation)
Pattern obligatoire :
    - 1 Use Case = 1 intention utilisateur
    - Controller => appelle Use Case => appelle Domain => passe par Repository

**Imports** :  Ordre strict par couche
    - Node.js natif
    - Dépendances externes
    - Commun (config, utils)
    - Application (use cases)
    - Domain
    - Infrastructure
Règles :
    - Groupes séparés par ligne vide
    - Aucun mélange de couches
    - Interdit : domain qui importe infra ou framework

**Gestion des erreurs** :
Pattern DomainError
Les erreurs métier sont levées uniquement dans le domaine
Format standard : classe DomainError avec code stable
L’API traduit les erreurs => réponse JSON standardisée

Exemples :
```
export class SessionIsFullError extends DomainError {
  constructor() {
    super('SESSION_IS_FULL', 'The session cannot accept more participants');
  }
}
```

```
{
  "errorCode": "SESSION_IS_FULL",
  "message": "Action not allowed"
}
```

Règles :
    - jamais de null ou undefined pour signaler une erreur
    - jamais d’erreur HTTP dans le domaine
    - toujours une erreur métier explicite


Si un agent hésite :
    - Imiter un fichier existant
    - Respecter les patterns documentés
    - Ne jamais inventer un nouveau style ou pattern
    - Prioriser lisibilité métier > “élégance technique”

## Vocabulaire Métier

| Terme | Définition | Terme à éviter |
|-------|------------|----------------|
| Playground | Lieu physique extérieur où se pratique un sport (ex : terrain de basket public). Ce n’est pas un événement ni une session. | Terrain, Court, Lieu |
| Session | Période temporelle où des utilisateurs se déclarent présents sur un playground pour jouer. | Match, Game, Event |
| Participant | Utilisateur ayant rejoint une session. Statut explicite dans un contexte donné. | Joueur, Player |
| Utilisateur (User) | Personne identifiée dans le système, indépendamment de toute session ou activité. | Compte, Profil |
| Présence (Presence) | État temporaire indiquant qu’un utilisateur est présent ou va être présent sur un playground. Donnée volatile, non garantie. | Check-in, Status |
| Fréquentation | Donnée agrégée représentant le nombre de participants sur un playground à un instant donné. | Popularité, Affluence |
| Activité playground | Vue consolidée combinant sessions, participants et fréquentation pour un playground donné. | Stats terrain |
| Sport | Type abstrait d’activité (basket, football…) sans logique spécifique codée en dur. | Jeu |
| SportRules | Ensemble des règles configurables associées à un sport (nombre de joueurs, contraintes, etc.). | Règles hardcodées |
| Use Case | Action utilisateur explicite orchestrée par l’application (ex : rejoindre une session). | Service, Handler |
| Arrivée | Action métier indiquant qu’un utilisateur commence sa présence sur un playground. | Check-in |
| Départ | Action métier indiquant qu’un utilisateur quitte un playground ou une session. | Check-out |
| Erreur métier (DomainError) | Erreur attendue liée au non-respect d’une règle métier (ex : session pleine). | Exception, Bug |
| Erreur technique | Erreur non attendue liée à un problème technique (DB, réseau, bug). | Erreur inconnue |
| JWT (Token) | Jeton d’authentification représentant l’identité d’un utilisateur côté système. | Session, Cookie |

Règle fondamentale pour les agents : Si un mot n’est pas dans ce tableau, alors il ne doit probablement pas exister dans le code.


### Règles absolues liées au vocabulaire (pour les agents)

    - Un terme métier a une seule signification
    - Le code DOIT utiliser exactement ces termes
    - Aucun synonyme métier ne doit apparaître dans le code
    - Les agents n’inventent jamais de nouveau vocabulaire
    - Toute ambiguïté de nom = risque fonctionnel
    
## Patterns de Développement

Les patterns ci‑dessous définissent les seules façons acceptables de structurer le code dans BallersWanted.
Ils doivent être strictement respectés et reproduits par les agents.

 **Pattern 1 — Use Case (Orchestration métier)**
 Un Use Case représente une intention utilisateur explicite.
Il orchestre le domaine et les dépendances, sans contenir de logique métier complexe.

Règles :
    - 1 Use Case = 1 action utilisateur
    - Aucune logique technique (pas de HTTP direct, pas de SQL)
    - Appelle le domaine, ne le remplace jamais

Exemple
```

export class JoinSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
  ) {}

  execute(input: { sessionId: string; userId: string }) {
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

**Pattern 2 — Domaine souverain (Entity + Rules)**
Le domaine contient toutes les règles métier.
Il est indépendant de toute technologie.

Règles :
    - Aucune dépendance (framework, DB, HTTP)
    - Les règles sont explicites (dans .rules.ts ou dans l’entité)
    - Les erreurs métier sont levées ici

Exemples
```
export class Session {
  constructor(
    readonly id: string,
    private currentPlayersCount: number,
    private readonly maxPlayersAllowed: number,
  ) {}

  join(userId: string): void {
    SessionRules.ensureNotFull(
      this.currentPlayersCount,
      this.maxPlayersAllowed,
    );

    this.currentPlayersCount++;
  }
}
```
```
export class SessionRules {
  static ensureNotFull(current: number, max: number): void {
    if (current >= max) {
      throw new SessionIsFullError();
    }
  }
}
```

**Pattern 3 — Controller mince (API Boundary)**
Le controller est une porte d’entrée technique.
Il ne contient aucune logique métier.

Règles :
    - Validation inputs
    - Authentification
    - Délégation immédiate à un Use Case

Exemple
```
@Controller('sessions')
export class SessionController {
  constructor(
    private readonly joinSessionUseCase: JoinSessionUseCase,
  ) {}

  @Post(':id/join')
  join(@Param('id') sessionId: string, @Req() req: Request) {
    return this.joinSessionUseCase.execute({
      sessionId,
      userId: req.user.id,
    });
  }
}
```

**Pattern 4 — Repository (Accès aux données)**
Le Repository est le seul point de contact avec la DB.

Règles :
    - Pas d’accès DB ailleurs
    - Interface claire (get, save, find)
    - Aucun code métier dedans

Exemple
```
export class SessionRepository {
  getById(sessionId: string): Session {
    // accès DB ici uniquement
  }

  save(session: Session): void {
    // persistence ici uniquement
  }
}
```

**Pattern 5 — Gestion d’erreur (DomainError)**
Les erreurs métier sont nommées et explicites.

Règles :
    - Levées dans le domaine
    - Traduites dans l’API
    - Jamais exposées brutes

Exemple
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

**Pattern 6 — Flux standard (end-to-end)**
Toute fonctionnalité doit suivre ce flux :
Controller => Use Case => Domain => Repository => Database
Aucun raccourci n'est autorisé

**Règle absolue pour les agents**
Si une implémentation ne correspond à aucun de ces patterns, elle est considérée comme incorrecte.
Si un agent hésite il doit : 
    - Rechercher un exemple existant
    - Copier la structure
    - Ne jamais inventer un nouveau pattern
    - Prioriser lisibilité métier > optimisation technique

## Anti-Patterns
Les anti‑patterns suivants sont strictement interdits.
Ils représentent des dérives fréquentes des agents qui compromettent l’architecture et la qualité produit.

**Logique métier dans les Controllers**
Pourquoi éviter ?
Casse la séparation des responsabilités
Rend le code difficile à maintenir
Empêche l’évolution produit

Exemple interdit
```
@Post(':id/join')
join(@Param('id') sessionId: string, @Req() req: Request) {
  const session = this.sessionRepository.getById(sessionId);

  if (session.currentPlayersCount >= session.max) {
    throw new Error('Full');
  }

  session.currentPlayersCount++;

  return session;
}
```

Alternative :
Déplacer toute la logique dans un Use Case + Domain

 **Accès direct à la base de données hors Repository**
Pourquoi éviter ?
Couplage fort à la DB
Impossible de faire évoluer ou maintenir
Viol du pattern architecture

Exemple interdit
```
const session = db.query('SELECT * FROM session WHERE id = ?', [id]);
```

Alternative :
```
const session = this.sessionRepository.getById(id);
```

 **Utilisation de null ou undefined pour signaler une erreur**
Pourquoi éviter ?
Provoque des bugs silencieux
Rend le flux de code ambigu
Non conforme au contrat d’erreur

Exemple interdit
```
if (!session) {
  return null;
}
```

Alternative :
```
if (!session) {
  throw new SessionNotFoundError();
}
```

**DTO utilisé comme modèle métier**
Pourquoi éviter ?
Mélange API et domaine
Rend le modèle métier fragile
Empêche la réutilisation

Exemple interdit
```
function joinSession(dto: JoinSessionDto) {
  if (dto.currentPlayersCount >= dto.maxPlayersAllowed) {
    ...
  }
}
```

Alternative :
Utiliser une Entity métier (Session)

**Services “fourre‑tout” génériques**
Pourquoi éviter ?
Code illisible
Responsabilités floues
Impossible à maintenir ou tester

Exemple interdit
```
class DataService {
  process(data: any) {
    // fait plein de choses sans contexte métier
  }
}
```

Alternative
Use Cases spécifiques (JoinSessionUseCase, GetPlaygroundActivityUseCase)


**Règles métier hardcodées**
Pourquoi éviter ?
Bloque le multi‑sport
Crée des branches conditionnelles non scalables

Exemple interdit
```
if (sport === 'basket') {
  maxPlayers = 10;
}
```

Alternative
```
SportRules.getMaxPlayers(sport);
```

**Catch d’erreur sans traitement**
Pourquoi éviter ?
Masque les problèmes
Rend le système imprévisible

Exemple interdit
```
try {
  ...
} catch (e) {
  console.log(e);
}
```

Alternative
```
try {
  ...
} catch (e) {
  throw e;
}
```

**Optimisation prématurée**
Pourquoi éviter ?
Complexifie inutilement le code
Introduit de la dette technique
Non aligné avec “Evolution over Perfection”

Exemple interdit
```
// cache en mémoire complexe sans besoin réel
const cache = new Map();
```

Alternative
Observer d’abord via logs et optimiser ensuite

**Création de nouveaux patterns non documentés**
Pourquoi éviter ?
Brise la cohérence
Rend les agents imprévisibles
Crée de la dette invisible

Exemple interdit
```
class CustomHandlerManagerProcessor {}
```

Alternative
Réutiliser un pattern existant (Use Case, Repository, etc.)

**Règle absolue pour les agents**
Tout anti‑pattern introduit est considéré comme une erreur critique, même si le code “fonctionne”.

Si un agent hésite :
    - Trouver un exemple similaire dans le projet
    - L'imiter sans le modifier structurellement
    - Refuser d’implémenter si ambigu
    - Ne jamais improviser

## Lessons learned

> Section mise à jour à chaque fin d'itération (commande `/aiad-retro`).
> Documentez ici les erreurs récurrentes de l'agent ET les corrections appliquées.

| Date | Erreur agent | Correction | Impact |
|------|-------------|------------|--------|
| | | | |

---

## Human learnings

> Section v1.1 — Documentez ici les écarts entre l'intention humaine et la livraison.
> Ces learnings ne sont PAS des erreurs de l'agent — ce sont des défaillances de l'expression humaine.

| Date | Intention exprimée | Résultat obtenu | Apprentissage |
|------|--------------------|-----------------|---------------|
| | | | |
