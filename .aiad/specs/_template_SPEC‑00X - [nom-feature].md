# Spécification de Feature : [NOM DE LA FEATURE]

**Branche de la Feature**: `[###-nom-feature]`  
**Créé le**: [DATE]  
**Status**: Draft  
**Input**: Description utilisateur: "$ARGUMENTS"

## Scénarios utilisateur et Tests *(obligatoire)*

<!--
 IMPORTANT : Les user stories doivent être PRIORISÉES comme des parcours utilisateurs, classés par ordre d’importance.
  Chaque user story/parcours doit être TESTABLE INDÉPENDAMMENT — cela signifie que si vous n’en implémentez qu’UNE seule,
  vous devez quand même disposer d’un MVP (Minimum Viable Product) viable qui apporte de la valeur.
  
  Attribuez des priorités (P1, P2, P3, etc.) à chaque story, où P1 est la plus critique.
  Considérez chaque story comme une brique fonctionnelle autonome qui peut être :
  - Développée indépendamment
  - Testée indépendamment
  - Déployée indépendamment
  - Démontrée aux utilisateurs indépendamment
-->

### User Story 1 - [Titre court] (Priorité : P1)

[Décrire ce parcours utilisateur en langage simple]

**Pourquoi cette priorité**: [Expliquer la valeur et pourquoi ce niveau de priorité]

**Test indépendant**: [Décrire comment tester indépendamment — ex : "Peut être testé entièrement en [action spécifique] et fournit [valeur spécifique]"]

**Scénarios d’acceptation**: *(en anglais)*

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Titre court] (Priorité : P2)

[Décrire ce parcours utilisateur en langage simple]

**Pourquoi cette priorité**: [Expliquer la valeur et pourquoi ce niveau de priorité]

**Test indépendant**: [Décrire comment tester indépendamment]

**Scénarios d’acceptation**: *(en anglais)*

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Titre court] (Priorité : P3)

[Décrire ce parcours utilisateur en langage simple]

**Pourquoi cette priorité**: [Expliquer la valeur et pourquoi ce niveau de priorité]

**Test indépendant**: [Décrire comment tester indépendamment]

**Scénarios d’acceptation**: *(en anglais)*

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Ajouter autant de user stories que nécessaire, chacune avec une priorité]

### Cas limites (Edge Cases)

<!--
ACTION REQUISE : Le contenu de cette section correspond à des éléments à compléter (placeholders).
Remplissez-les avec les cas limites appropriés.
-->

- Que se passe-t-il lorsque [condition limite] ?
- Comment le système gère-t-il [scénario d’erreur] ?

## Exigences *(obligatoire)*

<!--
ACTION REQUISE : Le contenu de cette section correspond à des éléments à compléter (placeholders).
Remplissez-les avec les exigences fonctionnelles appropriées.
-->

### Exigences fonctionnelles (Functional Requirements)

- **FR-001**: Le système DOIT [capacité précise, ex : "permettre aux utilisateurs de créer un compte"]
- **FR-002**: Le système DOIT [capacité précise, ex : "valider les adresses email"]
- **FR-003**: Les utilisateurs DOIVENT pouvoir [interaction clé, ex : "réinitialiser leur mot de passe"]
- **FR-004**: Le système DOIT [exigence de données, ex : "sauvegarder les préférences utilisateur"]
- **FR-005**: Le système DOIT [comportement, ex : "journaliser tous les événements de sécurité"]

*Exemple d’exigences nécessitant clarification :*

- **FR-006**: Le système DOIT authentifier les utilisateurs via [BESOIN DE CLARIFICATION : méthode non précisée — email/mot de passe, SSO, OAuth ?]
- **FR-007**: Le système DOIT conserver les données utilisateurs pendant [BESOIN DE CLARIFICATION : durée non définie]

### Entités clés *(inclure si la fonctionnalité implique des données)*

- **[Entity 1]**: [Ce qu’elle représente, ses attributs principaux sans implémentation]
- **[Entity 2]**: [Ce qu’elle représente, ses relations avec d’autres entités]

## Critères de succès *(obligatoire)*

<!--
  ACTION REQUIRED: Définir des critères de succès mesurables
  Ils doivent être indépendants de toutes technologies et mesurables
-->

### Résultats mesurables

- **SC-001**: [Métrique mesurable, ex : "Les utilisateurs peuvent créer un compte en moins de 2 minutes"]
- **SC-002**: [Métrique mesurable, ex : "Le système supporte 1000 utilisateurs simultanés sans dégradation"]
- **SC-003**: [Métrique de satisfaction utilisateur, ex : "90 % des utilisateurs réussissent l’action principale du premier coup"]
- **SC-004**: [Métrique business, ex : "Réduction de 50 % des tickets support liés à [X]"]