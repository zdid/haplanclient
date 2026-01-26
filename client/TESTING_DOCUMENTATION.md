# Documentation des Tests

Ce document décrit la stratégie de test, l'architecture des tests et comment exécuter les tests pour l'application Home Assistant Floor Plan Client.

## 📋 Table des matières

- [Stratégie de Test](#-stratégie-de-test)
- [Types de Tests](#-types-de-tests)
- [Structure des Tests](#-structure-des-tests)
- [Exécution des Tests](#-exécution-des-tests)
- [Couverture de Code](#-couverture-de-code)
- [Bonnes Pratiques](#-bonnes-pratiques)
- [Dépannage](#-dépannage)
- [Intégration Continue](#-intégration-continue)

## 🎯 Stratégie de Test

### Objectifs

1. **Qualité** : Garantir la fiabilité et la stabilité de l'application
2. **Maintenabilité** : Faciliter la maintenance et l'évolution du code
3. **Documentation** : Servir de documentation vivante du comportement attendu
4. **Performance** : Identifier les goulots d'étranglement
5. **Régression** : Prévenir les régressions lors des modifications

### Pyramide de Test

```
          UI Tests (E2E)
            ↑
       Intégration Tests
            ↑
       Service Tests
            ↑
       Unit Tests
            ↑
       Static Analysis
```

### Outils Utilisés

- **Vitest** : Framework de test moderne et rapide
- **JSDOM** : Environnement de test pour le DOM
- **TypeScript** : Support natif des types
- **ESLint** : Linting du code
- **Prettier** : Formatage du code
- **Husky** : Hooks Git pour les pré-commits
- **lint-staged** : Exécution des linters sur les fichiers modifiés

## 🧪 Types de Tests

### Tests Unitaires

**Objectif** : Tester les unités individuelles (classes, fonctions) en isolation.

**Couverture** :
- Classes de base (HAObject, SensorObject)
- Classes d'objets spécifiques (LightObject, CoverObject, etc.)
- Services (CommandService, WebSocketService, etc.)
- Utilities et helpers

**Exemple** :
```typescript
// Test de la classe LightObject
it('should toggle state and send correct command', () => {
  lightObject['toggle']();
  expect(mockCommandService.sendCommandCalls[0]).toEqual({
    entity_id: 'light.test',
    service: 'turn_on',
    serviceData: undefined,
  });
});
```

### Tests d'Intégration

**Objectif** : Tester l'interaction entre plusieurs composants.

**Couverture** :
- Intégration FloorPlanContainer + Services
- Intégration ObjectManager + FloorPlan
- Intégration des services entre eux

**Exemple** :
```typescript
// Test d'intégration du FloorPlanContainer
it('should initialize and load floorplan', async () => {
  await floorPlanContainer.initialize();
  expect(container.className).toContain('floorplan-container');
});
```

### Tests de Composants UI

**Objectif** : Tester les composants d'interface utilisateur.

**Couverture** :
- MenuSystem
- EntitySelector
- Composants d'objets (rendering, interactions)

**Approche** :
- Tests de rendering
- Tests d'interactions utilisateur
- Tests de gestion d'état

### Tests End-to-End (E2E)

**Objectif** : Tester l'application complète dans un environnement réaliste.

**Outil recommandé** : Cypress ou Playwright

**Couverture** :
- Flux utilisateur complets
- Navigation
- Interactions complexes
- Intégration avec le serveur

## 🗂️ Structure des Tests

```
__tests__/
├── models/               # Tests des modèles
│   └── objects/          # Tests des objets
│       ├── HAObject.test.ts
│       ├── LightObject.test.ts
│       ├── CoverObject.test.ts
│       ├── DimmableLightObject.test.ts
│       ├── ThermostatObject.test.ts
│       ├── TemperatureSensor.test.ts
│       ├── HumiditySensor.test.ts
│       ├── GenericSensor.test.ts
│       └── ObjectFactory.test.ts
├── services/             # Tests des services
│   ├── CommandService.test.ts
│   ├── WebSocketService.test.ts
│   ├── HAApiService.test.ts
│   └── PositionManager.test.ts
└── integration/          # Tests d'intégration
    └── FloorPlanContainer.test.ts
```

## ▶️ Exécution des Tests

### Commandes Disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch (développement)
npm run test:watch

# Exécuter les tests avec couverture de code
npm run test:coverage

# Lancer l'interface graphique pour les tests
npm run test:ui

# Exécuter les tests et ouvrir le rapport de couverture
./test-final.sh --open
```

### Exécution avec Vitest

**Options courantes** :

```bash
# Exécuter des tests spécifiques
npm test HAObject

# Exécuter les tests avec rapport détaillé
npm test --reporter=verbose

# Exécuter les tests avec journalisation
npm test --verbose

# Exécuter les tests en parallèle
npm test --threads
```

### Rapport de Couverture

Après l'exécution des tests avec couverture :

```bash
# Ouvrir le rapport HTML
open coverage/index.html

# Voir le rapport texte
cat coverage/lcov-report/index.html
```

## 📊 Couverture de Code

### Configuration

La couverture est configurée dans `vitest.config.ts` :

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.d.ts',
    '**/test-setup.ts',
    '**/vitest.config.ts',
  ],
}
```

### Seuil de Couverture

**Seuils recommandés** (à ajouter dans `package.json`) :

```json
"vitest": {
  "coverage": {
    "thresholds": {
      "lines": 80,
      "functions": 80,
      "branches": 80,
      "statements": 80
    }
  }
}
```

### Interprétation des Résultats

- **Lines** : Pourcentage de lignes de code exécutées
- **Functions** : Pourcentage de fonctions appelées
- **Branches** : Pourcentage de branches (if/else) testées
- **Statements** : Pourcentage d'instructions exécutées

## ✅ Bonnes Pratiques

### Écriture des Tests

1. **Noms descriptifs** : Utilisez des noms de tests clairs et descriptifs
2. **Arrange-Act-Assert** : Structurez vos tests en trois parties
3. **Isolation** : Testez une seule chose par test
4. **Mocking** : Isolez les dépendances externes
5. **Données de test** : Utilisez des données réalistes

**Exemple** :
```typescript
it('should create LightObject for simple light entities', () => {
  // Arrange
  const state = { state: 'on', attributes: {} };
  
  // Act
  const object = ObjectFactory.createObject(
    'light.living_room',
    'light',
    { x: 0.5, y: 0.5 },
    state,
    mockCommandService
  );
  
  // Assert
  expect(object).toBeInstanceOf(LightObject);
  expect(object.getEntity_id()).toBe('light.living_room');
});
```

### Mocking

Utilisez des mocks pour isoler les tests :

```typescript
// Mock du CommandService
class MockCommandService implements CommandService {
  sendCommandCalls: Array<{ entity_id: string; service: string; serviceData?: any }> = [];
  
  sendCommand(entity_id: string, service: string, serviceData?: any): void {
    this.sendCommandCalls.push({ entity_id, service, serviceData });
  }
  
  isConnected(): boolean {
    return true;
  }
}
```

### Setup et Teardown

Utilisez `beforeEach`, `afterEach`, `beforeAll`, `afterAll` :

```typescript
describe('LightObject', () => {
  let mockCommandService: MockCommandService;
  let lightObject: LightObject;

  beforeEach(() => {
    mockCommandService = new MockCommandService();
    lightObject = new LightObject('light.test', { x: 0.5, y: 0.5 }, mockCommandService);
  });

  afterEach(() => {
    // Nettoyage
  });

  it('should be created with default state (off)', () => {
    expect(lightObject.getEntity_id()).toBe('light.test');
  });
});
```

### Tests Asynchrones

Gérez les promesses et async/await :

```typescript
it('should load floorplan successfully', async () => {
  const floorPlan = new FloorPlan(container);
  await floorPlan.loadPlan('/test.jpg');
  
  expect(container.querySelector('img')).toBeTruthy();
});
```

## 🐛 Dépannage

### Problèmes Courants

#### Les tests ne s'exécutent pas

- Vérifiez que toutes les dépendances sont installées : `npm install`
- Assurez-vous que Node.js est à jour
- Vérifiez les erreurs dans la console

#### Échec des tests de DOM

- Assurez-vous que JSDOM est configuré
- Vérifiez que les éléments DOM sont créés avant les tests
- Utilisez `beforeEach` pour configurer le DOM

#### Problèmes de mocking

- Vérifiez que les mocks implémentent toutes les méthodes nécessaires
- Assurez-vous que les mocks sont correctement injectés
- Utilisez `@ts-ignore` si nécessaire pour les propriétés privées

#### Couverture insuffisante

- Identifiez les fichiers non couverts
- Écrivez des tests pour les parties manquantes
- Vérifiez les exclusions dans la configuration

### Conseils de Débogage

```bash
# Exécuter un test spécifique avec logs
npm test HAObject --verbose

# Exécuter les tests en mode inspection
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# Utiliser l'interface graphique pour le débogage
npm run test:ui
```

## 🤖 Intégration Continue

### Configuration GitHub Actions

Créez un fichier `.github/workflows/test.yml` :

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
    
    - name: Install dependencies
      run: npm install
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: coverage/
```

### Configuration GitLab CI

Ajoutez au fichier `.gitlab-ci.yml` :

```yaml
stages:
  - test
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm install
    - npm run lint
    - npm test
  artifacts:
    paths:
      - coverage/
    when: always
```

### Pré-commit Hooks

Le projet utilise Husky pour exécuter les tests avant chaque commit :

```bash
# Installation
npm run prepare

# Le hook exécutera automatiquement:
# 1. Linting
# 2. Tests
# Avant chaque commit
```

## 📈 Amélioration Continue

### Ajouter des Tests

Pour améliorer la couverture :

1. **Identifiez les zones non testées** :
```bash
npm run test:coverage
```

2. **Écrivez des tests pour** :
- Les nouveaux composants
- Les cas limites
- Les scénarios d'erreur
- Les interactions complexes

3. **Améliorez les tests existants** :
- Ajoutez des assertions supplémentaires
- Testez plus de cas limites
- Améliorez les mocks

### Bonnes Pratiques CI/CD

1. **Exécutez les tests à chaque commit** : Utilisez les hooks Git
2. **Exécutez les tests à chaque PR** : Configurez l'intégration continue
3. **Bloquez les merges si les tests échouent** : Configurez les protections de branche
4. **Surveillez la couverture** : Ajoutez des badges de couverture
5. **Exécutez les tests en parallèle** : Optimisez le temps d'exécution

## 🎉 Conclusion

La stratégie de test mise en place offre :

- **Couverture complète** : Tests unitaires, d'intégration et UI
- **Exécution rapide** : Vitest pour des tests rapides
- **Intégration facile** : Configuration CI/CD prête
- **Qualité assurée** : Linting et formatage automatisés
- **Documentation vivante** : Les tests documentent le comportement

Pour maintenir la qualité du code :

1. Exécutez les tests régulièrement
2. Ajoutez des tests pour les nouvelles fonctionnalités
3. Maintenez une couverture de code élevée
4. Utilisez les hooks Git pour prévenir les régressions
5. Configurez l'intégration continue

---

Dernière mise à jour : 04/01/2024