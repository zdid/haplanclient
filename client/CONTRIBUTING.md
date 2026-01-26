# Guide de Contribution

Merci de votre intérêt pour contribuer à Home Assistant Floor Plan Client ! Ce guide vous aidera à contribuer efficacement au projet.

## 📋 Table des matières

- [Code de Conduite](#-code-de-conduite)
- [Comment Contribuer](#-comment-contribuer)
- [Configuration du Projet](#-configuration-du-projet)
- [Standards de Code](#-standards-de-code)
- [Workflow de Contribution](#-workflow-de-contribution)
- [Revue de Code](#-revue-de-code)
- [Documentation](#-documentation)
- [Tests](#-tests)
- [Gestion des Versions](#-gestion-des-versions)
- [Support](#-support)

## 🤝 Code de Conduite

En participant à ce projet, vous acceptez de respecter le [Code de Conduite](CODE_OF_CONDUCT.md). Soyez respectueux et bienveillant envers les autres contributeurs.

## 🚀 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Ouvrez une issue avec :
   - Une description claire du bug
   - Les étapes pour le reproduire
   - Le comportement attendu
   - Le comportement actuel
   - Des captures d'écran si nécessaire
   - La version de l'application et du navigateur

### Suggérer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été suggérée
2. Ouvrez une issue avec :
   - Une description claire de la fonctionnalité
   - Le cas d'usage
   - Les avantages pour les utilisateurs
   - Des exemples ou des maquettes si possible

### Contribuer du Code

1. Forkez le dépôt
2. Créez une branche pour votre contribution
3. Implémentez votre fonctionnalité ou correction
4. Écrivez des tests
5. Mettez à jour la documentation
6. Ouvrez une Pull Request

## 🛠️ Configuration du Projet

### Prérequis

- Node.js v16+ (recommandé v18+)
- npm v7+ ou yarn
- Git
- Un éditeur de code (VS Code recommandé)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-projet/home-assistant-floorplan-client.git
cd home-assistant-floorplan-client

# Installer les dépendances
npm install

# Configurer les hooks Git
npm run prepare
```

### Configuration Recommandée

**VS Code** :
- Extension ESLint
- Extension Prettier
- Extension TypeScript
- Extension Vitest

**Configuration** :
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["typescript"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 📜 Standards de Code

### TypeScript

- Utilisez TypeScript pour tout le nouveau code
- Typage strict pour toutes les variables et fonctions
- Utilisez des interfaces pour les objets complexes
- Préférez les `type` aux `interface` pour les types simples

### Nommage

- **Classes** : PascalCase (`FloorPlanContainer`)
- **Variables** : camelCase (`floorPlanContainer`)
- **Fonctions** : camelCase (`getEntity_id`)
- **Constantes** : UPPER_CASE (`API_BASE_URL`)
- **Fichiers** : kebab-case (`floor-plan.ts`)

### Structure

- Une classe par fichier
- Une fonction par responsabilité
- Commentaires JSDoc pour les fonctions publiques
- Limitez les fichiers à 300 lignes maximum

### Exemple

```typescript
/**
 * Gère le plan d'étage et les objets
 * @class
 */
export class FloorPlan {
  private container: HTMLElement;
  private objects: Map<string, HAObject> = new Map();

  /**
   * Crée une instance de FloorPlan
   * @param {HTMLElement} container - Conteneur DOM
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.initContainer();
  }

  /**
   * Initialise le conteneur
   * @private
   */
  private initContainer(): void {
    this.container.className = 'floorplan-container';
    this.container.style.position = 'relative';
  }

  /**
   * Charge un plan d'étage
   * @param {string} url - URL du plan
   * @returns {Promise<void>}
   */
  async loadPlan(url: string): Promise<void> {
    // Implémentation
  }
}
```

## 🔄 Workflow de Contribution

### 1. Fork et Clone

```bash
git clone https://github.com/votre-username/home-assistant-floorplan-client.git
cd home-assistant-floorplan-client
git remote add upstream https://github.com/projet-original/home-assistant-floorplan-client.git
```

### 2. Créer une Branche

```bash
git checkout -b feature/ma-fonctionnalite
git checkout -b fix/mon-bug
```

### 3. Développer

- Implémentez votre fonctionnalité ou correction
- Suivez les standards de code
- Écrivez des tests
- Mettez à jour la documentation

### 4. Commiter

```bash
git add .
git commit -m "feat: ajouter une nouvelle fonctionnalité"
git commit -m "fix: corriger un bug dans LightObject"
```

**Messages de commit** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, missing semi colons, etc
- `refactor`: Refactorisation du code
- `perf`: Amélioration des performances
- `test`: Ajout ou correction de tests
- `chore`: Changements de build, configuration, etc

### 5. Pousser

```bash
git push origin feature/ma-fonctionnalite
```

### 6. Pull Request

1. Allez sur GitHub
2. Ouvrez une Pull Request
3. Remplissez le template
4. Attendez la revue

## 🔍 Revue de Code

### Critères d'Acceptation

1. Le code suit les standards du projet
2. Les tests passent
3. La documentation est à jour
4. Pas de régressions
5. Le code est bien commenté

### Processus

1. Un mainteneur examinera votre PR
2. Des commentaires peuvent être demandés
3. Apportez les modifications nécessaires
4. La PR sera mergée une fois approuvée

## 📚 Documentation

### Mettre à Jour la Documentation

- Mettez à jour le README.md si nécessaire
- Ajoutez des commentaires JSDoc
- Mettez à jour la documentation de l'API
- Ajoutez des exemples d'utilisation

### Écrire de la Documentation

```markdown
## Nouvelle Fonctionnalité

Description de la fonctionnalité.

### Utilisation

```typescript
const exemple = new Exemple();
exemple.methode();
```

### Paramètres

- `param1` : Description
- `param2` : Description

### Retourne

Description du retour
```

## 🧪 Tests

### Écrire des Tests

- Un test par fonctionnalité
- Tests unitaires pour les classes
- Tests d'intégration pour les composants
- Tests UI pour l'interface

### Exécuter les Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Couverture de Code

- Maintenez une couverture de 80%+
- Ajoutez des tests pour les nouvelles fonctionnalités
- Testez les cas limites

## 📦 Gestion des Versions

### Versioning

Le projet suit le [Semantic Versioning](https://semver.org/) :

- **MAJOR** : Modifications incompatibles
- **MINOR** : Ajout de fonctionnalités compatibles
- **PATCH** : Corrections de bugs compatibles

### Changelog

Mettez à jour le [CHANGELOG.md](CHANGELOG.md) avec :

```markdown
## [1.0.1] - 2024-01-05

### Ajouté

- Nouvelle fonctionnalité

### Corrigé

- Bug dans LightObject
```

## 🆘 Support

### Demander de l'Aide

1. Consultez la documentation
2. Vérifiez les issues existantes
3. Ouvrez une nouvelle issue
4. Posez votre question sur le forum

### Signaler un Problème

- Décrivez le problème clairement
- Fournissez des étapes pour reproduire
- Incluez des logs ou captures d'écran
- Précisez votre environnement

## 🎉 Merci !

Votre contribution est précieuse pour le projet. Ensemble, nous pouvons créer une application Home Assistant encore meilleure !

---

Dernière mise à jour : 04/01/2024