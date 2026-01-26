# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Non publié]

### Ajouté

- Documentation complète du projet (README, API, Composants, Tests)
- Fichier CHANGELOG pour suivre les modifications
- Fichier .env.example pour la configuration
- Scripts de build et de test améliorés
- Configuration ESLint et Prettier
- Configuration Husky pour les pré-commits
- Configuration lint-staged pour le formatage automatique
- Tests unitaires complets pour les composants principaux
- Tests d'intégration pour FloorPlanContainer
- Documentation de l'API et des composants
- Script de test final pour vérifier le build

### Modifié

- Passage de TypeScript Compiler seul à esbuild pour le bundling
- Correction de toutes les erreurs TypeScript
- Amélioration de l'architecture avec injection de dépendances
- Refactorisation du système de commandes (CommandService)
- Amélioration de la gestion des positions (PositionManager)
- Optimisation des classes d'objets (LightObject, CoverObject, etc.)
- Mise à jour de la configuration de build
- Amélioration de la documentation des types

### Corrigé

- Correction des problèmes de typage dans les classes
- Correction des conflits de noms de propriétés
- Correction des problèmes d'accès aux membres privés
- Correction des problèmes de build TypeScript
- Correction des problèmes de mocking dans les tests
- Correction des problèmes de configuration Vite

## [1.0.0] - 2024-01-04

### Ajouté

- Architecture complète de l'application
- Système de classes pour les objets Home Assistant
- Gestion du plan d'étage avec redimensionnement
- Mode édition avec drag & drop
- Communication WebSocket pour les mises à jour en temps réel
- Système de commandes pour contrôler les entités
- Upload de plans d'étage
- Sélecteur d'entités pour ajouter de nouveaux objets
- Menu système pour les actions principales
- Build system avec esbuild
- Tests unitaires de base
- Configuration TypeScript
- Configuration de linting

### Fonctionnalités

- Visualisation interactive des entités sur un plan
- Support de multiples types d'objets (lumières, capteurs, volets, thermostats)
- Mises à jour d'état en temps réel via WebSocket
- Contrôle des entités directement depuis l'interface
- Mode édition pour positionner les objets
- Upload et gestion des plans d'étage
- Interface responsive adaptée à tous les écrans

## [0.1.0] - 2023-12-23

### Ajouté

- Structure initiale du projet
- Configuration TypeScript de base
- Classe DragAndDropConstrained existante
- Documentation initiale

### Fonctionnalités

- Fonctionnalité de drag & drop avec contraintes
- Structure de base pour l'application client

---

## Guide de Version

### [MAJOR.MINOR.PATCH]

- **MAJOR** : Modifications incompatibles avec les versions précédentes
- **MINOR** : Ajout de fonctionnalités compatibles avec les versions précédentes
- **PATCH** : Corrections de bugs compatibles avec les versions précédentes

### Types de modifications

- **Ajouté** : Pour les nouvelles fonctionnalités
- **Modifié** : Pour les modifications de fonctionnalités existantes
- **Corrigé** : Pour les corrections de bugs
- **Supprimé** : Pour les suppressions de fonctionnalités
- **Déprécié** : Pour les fonctionnalités bientôt supprimées
- **Sécurité** : Pour les corrections de vulnérabilités

---

## Roadmap

### Prochaines versions

#### [1.1.0]

- Ajout des tests E2E avec Cypress
- Amélioration des performances de rendu
- Support des thèmes personnalisés
- Internationalisation (i18n)
- Amélioration de l'accessibilité

#### [1.2.0]

- Support des plans multi-étages
- Gestion des groupes d'entités
- Historique des états
- Export/Import de configurations
- Intégration avec d'autres systèmes domotiques

#### [2.0.0]

- Refonte complète de l'UI
- Support des plugins
- Marketplace de thèmes et plugins
- Version mobile native
- Intégration avec l'assistant vocal

---

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives de contribution.

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Dernière mise à jour : 04/01/2024