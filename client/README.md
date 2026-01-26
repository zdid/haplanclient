# Home Assistant Floor Plan Client

Une application web moderne pour visualiser et interagir avec les entités Home Assistant sur un plan d'étage.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Build](#-build)
- [Tests](#-tests)
- [Architecture](#-architecture)
- [Dépannage](#-dépannage)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 Fonctionnalités

- **Visualisation interactive** : Affichage des entités Home Assistant sur un plan d'étage
- **Types d'objets multiples** : Lumière, capteurs, volets, thermostats, etc.
- **Mode édition** : Drag & drop pour positionner les objets
- **Mises à jour en temps réel** : WebSocket pour les états en direct
- **Gestion des commandes** : Contrôle des entités directement depuis l'interface
- **Responsive design** : Adapté à tous les écrans
- **Upload de plans** : Chargement de plans d'étage personnalisés

## 📦 Prérequis

- Node.js v16+ (recommandé v18+)
- npm v7+ ou yarn
- Serveur Home Assistant avec l'API accessible
- Serveur testvibe5 configuré et fonctionnel

## 🚀 Installation

```bash
# Cloner le dépôt (si applicable)
git clone https://github.com/votre-projet/home-assistant-floorplan-client.git
cd home-assistant-floorplan-client

# Installer les dépendances
npm install

# Créer un fichier .env (optionnel)
cp .env.example .env
```

## ⚙️ Configuration

### Fichier `.env`

```env
# Configuration de l'API
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Configuration du build
VITE_BUILD_ENV=production
```

### Configuration TypeScript

Voir `tsconfig.json` pour les options de compilation.

## 👨‍💻 Développement

### Démarrer le serveur de développement

```bash
# Mode développement avec rebuild automatique
npm run dev

# Mode développement complet avec serveur HTML
npm run dev:full
```

### Structure du projet

```
client/
├── src/                  # Code source
│   ├── components/       # Composants UI
│   ├── models/           # Modèles de données
│   ├── services/         # Services et API
│   ├── types/            # Définitions de types
│   ├── ui/               # Composants UI réutilisables
│   └── App.ts            # Point d'entrée
├── public/               # Fichiers statiques
│   └── index.html        # Page HTML principale
├── dist/                 # Build de production (généré)
├── test/                 # Tests (généré)
├── .env.example          # Exemple de configuration
├── .eslintrc.js          # Configuration ESLint
├── .prettierrc           # Configuration Prettier
├── tsconfig.json         # Configuration TypeScript
├── vite.config.js        # Configuration Vite
├── package.json          # Dépendances et scripts
└── README.md             # Documentation
```

## 🔨 Build

### Build pour la production

```bash
# Build avec esbuild (recommandé)
npm run build

# Build avec TypeScript seul (pour développement)
npm run build:tsc

# Build avec Vite (alternative)
npm run build:vite
```

### Sortie du build

Le build génère les fichiers suivants dans `dist/` :

- `bundle.js` - Code JavaScript bundlé et minifié (≈20 KB)
- `bundle.js.map` - Source map pour le débogage
- `index.html` - Page HTML prête pour le déploiement

### Déploiement

```bash
# Démarrer un serveur local pour tester
npm run start

# L'application sera accessible à http://localhost:8080
```

Pour un déploiement en production, copiez le contenu du dossier `dist/` sur votre serveur web.

## 🧪 Tests

### Exécuter les tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec couverture
npm run test:coverage

# Interface graphique pour les tests
npm run test:ui
```

### Structure des tests

```
__tests__/
├── models/               # Tests des modèles
│   └── objects/          # Tests des objets
├── services/             # Tests des services
└── integration/          # Tests d'intégration
```

## 🏗️ Architecture

### Diagramme des composants

```
┌───────────────────────────────────────────────────┐
│                 FloorPlanContainer                 │
│                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────┐  │
│  │   FloorPlan │    │ ObjectManager│    │  Menu   │  │
│  └─────────────┘    └─────────────┘    └─────────┘  │
│       │                  │                  │       │
└───────┼──────────────────┼──────────────────┼───────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────┐
│  Objects    │    │  Services   │    │  UI     │
│ (Light,     │    │ (API, WS,   │    │ (Menu,  │
│  Sensor,    │    │  Command)   │    │  Selector)│
│  Cover, etc.)│    └─────────────┘    └─────────┘
└─────────────┘
```

### Principaux composants

1. **FloorPlanContainer** : Conteneur principal qui gère le plan et les objets
2. **FloorPlan** : Gestion du plan d'étage et du redimensionnement
3. **ObjectManager** : Création et gestion des objets HA
4. **HAObject** : Classe de base pour tous les objets
5. **CommandService** : Service d'envoi de commandes aux entités
6. **WebSocketService** : Gestion des connexions WebSocket
7. **HAApiService** : Communication avec l'API REST

### Flux de données

```
Serveur HA → Serveur testvibe5 → Client Web
     ↑                          ↓
     └───────── Commandes ───────┘
```

## 🐛 Dépannage

### Problèmes courants

#### Le build échoue

- Vérifiez que toutes les dépendances sont installées : `npm install`
- Assurez-vous que TypeScript est configuré correctement
- Consultez les erreurs spécifiques dans la console

#### L'application ne se connecte pas au serveur

- Vérifiez que le serveur testvibe5 est en cours d'exécution
- Contrôlez les URL dans la configuration (`.env` ou `App.ts`)
- Vérifiez que le CORS est configuré côté serveur

#### Les objets ne s'affichent pas

- Vérifiez que les données sont correctement chargées depuis `/api/data`
- Assurez-vous que les positions sont dans la plage 0-1
- Contrôlez la console pour les erreurs de rendu

#### Les commandes ne fonctionnent pas

- Vérifiez que le WebSocket est connecté
- Contrôlez que le `CommandService` est correctement injecté
- Vérifiez les permissions côté serveur

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- Utilisez TypeScript pour tout le nouveau code
- Suivez les conventions de nommage existantes
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les changements significatifs
- Utilisez ESLint et Prettier pour le formatage

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

© 2024 Home Assistant Floor Plan Client
Dernière mise à jour : 04/01/2024