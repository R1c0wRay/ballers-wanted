# PRD : Connexion utilisateur BallersWanted

> Ce fichier est la source de vérité produit. Il est injecté en contexte agent lors des phases de cadrage uniquement.
> Mainteneur : Product Manager

## 1. Contexte et scope d'activation

**Contexte** :
Cette SPEC implémente la première capability critique définie dans le PRD :
- permettre à un utilisateur de s’identifier de manière fiable et persistante
Cette SPEC est un prérequis bloquant pour :
- présence utilisateur
- sessions
- fréquentation fiable

**Scope d'activation** :
 Cette SPEC est activée lorsque :
- une requête nécessite une identité utilisateur
- le client mobile n’a pas encore de token valide

Hors scope :
- login social
- profil utilisateur enrichi
- gestion multi-device

## 2. Périmètre fonctionnel

Fonctionnalités incluses :
1. Création d’utilisateur (signup minimal)
2. Authentification utilisateur (login)
3. Génération d’un JWT stateless
4. Auth Guard pour protéger endpoints
5. Persistence utilisateur basique en DB

## 3. Architecture et fichiers impactés

**Domain layer** :
```
src/domain/user/
  user.entity.ts
  ```

**Application Layer** :
```
src/application/user/
  authenticate-user.usecase.ts
  create-user.usecase.ts
  ```

**Infrastructure** :
```
src/infrastructure/database/repositories/
  user.repository.ts

src/common/guards/
  auth.guard.ts
  ```

**API Layer** :
```
src/api/user/
  user.controller.ts
  user.module.ts
```

**Config** :
```
src/config/
  auth.config.ts (à créer)
```

## 4. Interface technique (API)

### POST /auth/signup
**Input**
```
{
  "email": "string"
}
```
**Output**
```
{
  "token": "JWT"
}
```

### POST /auth/login
**Input**
```
{
  "email": "string"
}

```

**Output**
```
{
  "token": "JWT"
}
```

**Auth header**
```
Authorization: Bearer <JWT>
```

## 5. Modèle de données (PostgreSQL)

**Table user**
```
id (uuid, primary key)
email (string, unique)
created_at (timestamp)
```

Note TL : 
- Pas de password en v1 → simplification assumée
- À confirmer (UNKNOWN) : stratégie d’identité (email seul vs autre

## 6. Règles métier

**Règle 1**
Un utilisateur est identifié par un identifiant unique = email unique et aucune duplication autorisée

**Règle 2**
La création est idempotente = si email existe, retourner utilisateur existant

**Règle 3**
Le domaine ne connaît pas JWT.
JWT = infrastructure uniquement

## 7. Validation des inputs

**API Layer**
email obligatoire
format email valide
longueur < 255

**Domaine**
aucune validation technique
uniquement invariants métier

## 8. Pattern d’orchestration (Use Case)

**Exemple — authenticate-user.usecase.ts**
```
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  execute(input: { email: string }): { token: string } {
    let user = this.userRepository.findByEmail(input.email);

    if (!user) {
      user = this.userRepository.create(input.email);
    }

    const token = this.tokenService.generate(user.id);

    return { token };
  }
}
```

## 9. Sécurité
JWT signé avec secret (.env)
Pas de données sensibles dans token
durée de vie : 24h (à confirmer)

UNKNOWN :
refresh token strategy (reporté v2)

## 10. Tests attendus

**Unit tests (Node runner natif)**
création user
login existant
génération token

**Integration tests**
POST signup → 200 + token
POST login → 200 + token
endpoint protégé sans token → 401


**Cas limites**
email invalide → rejet
email déjà existant → no duplication
token invalide → rejected

## 11. Cas d’usage

**UC1 — Premier utilisateur**
POST /signup
user créé
token retourné

**UC2 — Retour utilisateur**
POST /login
user trouvé
token retourné

**UC3 — Accès protégé**
appel API avec token
guard valide
user injecté

## 12. Definitions of Done

### Definition of Output Done (DoOD)
Une fonctionnalité n’est considérée comme Done que si 100 % des critères ci‑dessous sont respectés.

**Techniques**
Respect strict des conventions BW (naming, imports, patterns)
TypeScript strict sans erreur
Code structuré selon : Domain / Use Case / Repository / Controller
Tests unitaires critiques passants
Aucun code mort ou provisoire

**Sécurité**
Aucun secret dans le code (usage .env uniquement)
Validation stricte des inputs (email, format)
JWT signé correctement (secret configuré)
Aucun leak d’information sensible dans les erreurs


**Performance**
Endpoint /auth respecte p95 ≤ 300 ms (hors réseau mobile)
Requêtes DB simples (index email, pas de scan complet)
Génération JWT non bloquante


**Fonctionnels**
Signup et Login fonctionnels (retour token valide)
AuthGuard protège correctement les endpoints
Pas de duplication utilisateur (email unique)
SPEC respectée sans dérive fonctionnelle

**Déploiement**
Build NestJS OK
Application démarre sans erreur
Tests d’appel API (signup/login) OK
Endpoint testable en environnement local / staging

**Review**
Code review validée (au moins 1 approbation)
QA valide les cas d’usage principaux
Logs vérifiables (auth + erreurs)

### Definition of Outcome Done (DoOuD)
Quand la valeur produit réelle est atteinte

**User outcomes**
| Métrique | Cible | Mesure |
| Taux de complétion de connexion | supérieur ou égal à 80% | Funnel Login |
| Temps pour se connecter | inférieur ou égal à 10 sec | Tracking mobile |
| Utilisateur connectés utilisant la présence | supérieur ou égal à 60% | Corrélation login ==> action |

**Business outcomes**
| Métrique | Cible | Mesure |
| Augmentation de la fiabilité perçue | Qualitative | Feedback utilisateur |
| Réduction du churn initial | -20% | Analyse cohortes |
| Activation utilisateur (1ère action utile) | supérieur ou égal à 70% | 1ère action utile |

**Learning outcomes**
| Hypothèse | Résultat attendu |
| Les utilisateurs acceptent de se connecter sans friction majeure | Validée si ≥80% complétion |
| L’identification augmente la confiance dans les données | Validée via usage réel |
| L’absence de login social n’est pas bloquante en v1 | A confirmer |
