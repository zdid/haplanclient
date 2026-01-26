# Spécifications de l'Application Home Assistant Floor Plan Client

## 📋 Table des Matières

1. [Introduction](#-introduction)
2. [Objectifs](#-objectifs)
3. [Exigences Fonctionnelles](#-exigences-fonctionnelles)
4. [Exigences Techniques](#-exigences-techniques)
5. [Architecture](#-architecture)
6. [Cas d'Utilisation](#-cas-dutilisation)
7. [Spécifications Détaillées](#-spécifications-détaillées)
8. [Intégration avec Home Assistant](#-intégration-avec-home-assistant)
9. [Sécurité](#-sécurité)
10. [Performance](#-performance)
11. [Accessibilité](#-accessibilité)
12. [Internationalisation](#-internationalisation)
13. [Déploiement](#-déploiement)
14. [Maintenance et Support](#-maintenance-et-support)

## 🎯 Introduction

Home Assistant Floor Plan Client est une application web moderne conçue pour visualiser et interagir avec les entités Home Assistant sur un plan d'étage interactif. Cette application permet aux utilisateurs de contrôler leur maison intelligente de manière intuitive et visuelle.

## 🎯 Objectifs

### Objectifs Principaux

1. **Visualisation Intuitive** : Fournir une interface visuelle pour voir l'état des entités Home Assistant
2. **Contrôle Centralisé** : Permettre le contrôle des appareils depuis une interface unique
3. **Personnalisation** : Permettre aux utilisateurs de personnaliser l'emplacement et l'apparence des objets
4. **Temps Réel** : Afficher les mises à jour d'état en temps réel
5. **Responsive Design** : Fonctionner sur tous les appareils et tailles d'écran

### Objectifs Secondaires

1. **Extensibilité** : Architecture modulaire pour ajouter de nouveaux types d'objets
2. **Performance** : Optimisation pour un rendu fluide même avec de nombreux objets
3. **Accessibilité** : Respect des standards d'accessibilité
4. **Internationalisation** : Support de multiples langues
5. **Intégration** : Intégration facile avec d'autres systèmes domotiques

## 📋 Exigences Fonctionnelles

### Fonctionnalités Principales

#### 1. Visualisation du Plan d'Étage
- **Fonctionnalité** : Afficher un plan d'étage avec les objets positionnés
- **Détails** :
  - Chargement d'images de plan (JPEG, PNG, SVG)
  - Redimensionnement automatique pour s'adapter au conteneur
  - Maintien des proportions d'origine
  - Gestion des plans transparents

#### 2. Affichage des Objets
- **Fonctionnalité** : Afficher différents types d'objets Home Assistant
- **Types supportés** :
  - Lumière (simple et avec brightness)
  - Capteurs (température, humidité, pression, etc.)
  - Volets et stores
  - Thermostat
  - Objets génériques

#### 3. Mode Édition
- **Fonctionnalité** : Permettre la personnalisation du plan
- **Détails** :
  - Drag & drop avec contraintes
  - Ajout de nouveaux objets via un sélecteur
  - Suppression d'objets
  - Sauvegarde automatique des positions

#### 4. Contrôle des Entités
- **Fonctionnalité** : Contrôler les entités directement depuis l'interface
- **Actions supportées** :
  - Allumer/Éteindre les lumières
  - Ajuster la luminosité
  - Ouvrir/Fermer les volets
  - Régler la température
  - Actions personnalisées

#### 5. Mises à Jour en Temps Réel
- **Fonctionnalité** : Recevoir les mises à jour d'état en temps réel
- **Mécanisme** : WebSocket pour les notifications instantanées
- **Événements** :
  - Changements d'état
  - Mises à jour de configuration
  - Changements de plan

#### 6. Gestion des Plans
- **Fonctionnalité** : Upload et gestion des plans d'étage
- **Détails** :
  - Upload d'images
  - Gestion de plusieurs plans
  - Plan par défaut si aucun n'est chargé

#### 7. Sélecteur d'Entités
- **Fonctionnalité** : Sélectionner des entités à ajouter au plan
- **Détails** :
  - Navigation par arborescence (Areas → Devices → Entities)
  - Filtrage des entités disponibles
  - Prévisualisation avant ajout

#### 8. Menu Principal
- **Fonctionnalité** : Accéder aux fonctionnalités principales
- **Options** :
  - Mode édition
  - Upload de plan
  - Rafraîchissement
  - Paramètres

### Fonctionnalités Secondaires

#### 1. Thèmes et Apparence
- **Fonctionnalité** : Personnalisation de l'interface
- **Options** :
  - Thèmes clair/sombre
  - Taille des objets
  - Opacité
  - Couleurs personnalisées

#### 2. Historique et Audit
- **Fonctionnalité** : Suivi des changements
- **Détails** :
  - Historique des modifications
  - Journal des actions
  - Export des logs

#### 3. Collaboration
- **Fonctionnalité** : Partage et collaboration
- **Options** :
  - Export de configuration
  - Import de configuration
  - Partage de plans

#### 4. Notifications
- **Fonctionnalité** : Alertes et notifications
- **Types** :
  - Notifications d'état
  - Alertes de sécurité
  - Rappels

## 🔧 Exigences Techniques

### Environnement

- **Langage** : TypeScript 5.0+
- **Framework** : Aucun (vanilla TypeScript)
- **Bundler** : esbuild ou Vite
- **Tests** : Vitest
- **Linting** : ESLint + Prettier
- **Node.js** : v16+ (recommandé v18+)

### Architecture

#### Frontend
- **TypeScript** : Typage strict, classes, modules
- **DOM** : Manipulation directe du DOM
- **CSS** : Styles modernes, responsive design
- **State Management** : Gestion d'état locale

#### Backend (via API)
- **Serveur** : testvibe5 (Node.js/Express)
- **API REST** : Endpoints pour les données
- **WebSocket** : Mises à jour en temps réel
- **Base de données** : (Gérée par le serveur)

### Intégration

- **Home Assistant** : Via l'API du serveur testvibe5
- **Protocoles** : HTTP/HTTPS, WebSocket
- **Authentification** : Gérée par le serveur

### Performance

- **Rendu** : 60 FPS pour les animations
- **Chargement** : < 2s pour le chargement initial
- **Mémoire** : < 50MB pour 100 objets
- **Bande passante** : < 10KB/s pour les mises à jour

### Sécurité

- **HTTPS** : Obligatoire en production
- **CORS** : Configuration stricte
- **Validation** : Toutes les entrées validées
- **Authentification** : Via le serveur

### Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (2 dernières versions)
- **Mobile** : iOS Safari, Android Chrome
- **Desktop** : Windows, macOS, Linux

## 🏗️ Architecture

### Diagramme Global

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                Client Application                               │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   Presentation   │    Business     │     Data        │      Services           │
│                 │    Logic         │    Access       │                         │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────────┤
│  - FloorPlan    │  - ObjectManager │  - HAApiService │  - WebSocketService     │
│  - MenuSystem   │  - PositionManager│  - CommandService│  - NotificationService  │
│  - EntitySelector│  - ObjectFactory │                 │                         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                Server (testvibe5)                                │
├───────────────────────────────────────────────────────────────────────────────┤
│  - API REST (Express)                                                           │
│  - WebSocket Server                                                            │
│  - Home Assistant Integration                                                  │
│  - Database                                                                   │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                Home Assistant                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│  - Entities                                                                   │
│  - Automations                                                                │
│  - Devices                                                                   │
│  - Areas                                                                      │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Couches Logicielles

#### 1. Présentation (UI)
- **Composants** : FloorPlan, MenuSystem, EntitySelector
- **Responsabilités** :
  - Affichage
  - Interaction utilisateur
  - Gestion des événements

#### 2. Logique Métier
- **Services** : ObjectManager, PositionManager, CommandService
- **Responsabilités** :
  - Gestion des objets
  - Calcul des positions
  - Envoi des commandes

#### 3. Accès aux Données
- **Services** : HAApiService, WebSocketService
- **Responsabilités** :
  - Communication avec le serveur
  - Gestion des connexions
  - Cache des données

#### 4. Modèles de Données
- **Classes** : HAObject, LightObject, SensorObject, etc.
- **Responsabilités** :
  - Représentation des entités
  - Gestion des états
  - Rendu visuel

### Flux de Données

```
1. Initialisation
   Utilisateur → FloorPlanContainer.initialize()
              ↓
   HAApiService.getData() → Serveur testvibe5
              ↓
   ObjectFactory.createObject() pour chaque objet
              ↓
   FloorPlan.addObject() pour chaque objet
              ↓
   WebSocketService.on() pour les mises à jour

2. Mise à jour d'état
   Serveur → WebSocket → FloorPlanContainer
              ↓
   ObjectManager.updateObjectState()
              ↓
   HAObject.updateState()
              ↓
   HAObject.updateDisplay()

3. Envoi de commande
   Utilisateur → HAObject.handleAction()
              ↓
   HAObject.sendCommand() → CommandService
              ↓
   WebSocketService.send() → Serveur
              ↓
   Serveur → WebSocket → update:state

4. Upload de plan
   Utilisateur → MenuSystem.triggerFileUpload()
              ↓
   HAApiService.uploadFloorplan() → Serveur
              ↓
   FloorPlan.loadPlan()
              ↓
   WebSocket → floorplan_updated (broadcast)
```

## 🎯 Cas d'Utilisation

### 1. Visualisation du Plan

**Acteur** : Utilisateur
**Précondition** : Plan d'étage configuré
**Scénario Principal** :
1. L'utilisateur accède à l'application
2. Le plan d'étage est chargé
3. Les objets sont positionnés selon la configuration
4. Les états des objets sont affichés

**Scénario Alternatif** :
- Aucun plan configuré : Afficher un plan transparent
- Erreur de chargement : Afficher un message d'erreur

### 2. Contrôle d'une Lumière

**Acteur** : Utilisateur
**Précondition** : Lumière configurée sur le plan
**Scénario Principal** :
1. L'utilisateur clique sur l'objet lumière
2. L'état est basculé (on/off)
3. La commande est envoyée au serveur
4. L'état est mis à jour en temps réel

**Scénario Alternatif** :
- Lumière avec brightness : Utiliser les boutons +/-
- Erreur de commande : Afficher une notification

### 3. Ajout d'un Nouvel Objet

**Acteur** : Utilisateur
**Précondition** : Mode édition activé
**Scénario Principal** :
1. L'utilisateur active le mode édition
2. L'utilisateur sélectionne une entité via EntitySelector
3. L'objet est créé au centre du plan
4. L'utilisateur déplace l'objet à la position souhaitée
5. La position est sauvegardée automatiquement

**Scénario Alternatif** :
- Annulation : L'objet n'est pas sauvegardé
- Conflit de position : Avertissement à l'utilisateur

### 4. Upload d'un Plan

**Acteur** : Utilisateur
**Précondition** : Aucun
**Scénario Principal** :
1. L'utilisateur clique sur "Upload Plan"
2. L'utilisateur sélectionne un fichier image
3. Le plan est uploadé au serveur
4. Le plan est chargé dans l'application
5. Les objets sont repositionnés

**Scénario Alternatif** :
- Format invalide : Message d'erreur
- Taille excessive : Message d'erreur

### 5. Configuration des Positions

**Acteur** : Utilisateur
**Précondition** : Mode édition activé
**Scénario Principal** :
1. L'utilisateur active le mode édition
2. L'utilisateur déplace les objets existants
3. Les positions sont sauvegardées après 5 secondes d'inactivité
4. La configuration est persistée sur le serveur

**Scénario Alternatif** :
- Conflit de position : Avertissement
- Échec de sauvegarde : Notification d'erreur

## 📋 Spécifications Détaillées

### 1. FloorPlanContainer

**Fichier** : `src/components/FloorPlanContainer.ts`

**Responsabilités** :
- Initialisation de l'application
- Gestion du cycle de vie
- Coordination des composants
- Communication avec le serveur

**Méthodes** :
- `initialize()` : Charge les données initiales
- `uploadFloorplan(file)` : Upload un nouveau plan
- `enableEditMode()` : Active le mode édition
- `disableEditMode()` : Désactive le mode édition
- `sendCommand(entity_id, service, serviceData)` : Envoie une commande

**Événements** :
- `update:state` : Met à jour l'état d'un objet
- `config_updated` : Met à jour la configuration
- `floorplan_updated` : Met à jour le plan

### 2. FloorPlan

**Fichier** : `src/models/FloorPlan.ts`

**Responsabilités** :
- Chargement et affichage du plan
- Gestion des proportions et redimensionnement
- Positionnement des objets
- Gestion du mode édition

**Méthodes** :
- `loadPlan(url)` : Charge un plan depuis une URL
- `addObject(object)` : Ajoute un objet au plan
- `removeObject(entity_id)` : Retire un objet
- `calculateScale()` : Calcule l'échelle de redimensionnement
- `positionObjectElement(element, position)` : Positionne un élément

**Propriétés** :
- `container` : Conteneur DOM
- `planImage` : Image du plan
- `objects` : Map des objets
- `scale` : Échelle de redimensionnement

### 3. ObjectManager

**Fichier** : `src/services/ObjectManager.ts`

**Responsabilités** :
- Création et gestion des objets
- Injection du CommandService
- Mise à jour des états
- Coordination avec FloorPlan

**Méthodes** :
- `createObjectFromConfig(config)` : Crée un objet
- `updateObjectState(entity_id, state)` : Met à jour un état
- `removeObject(entity_id)` : Retire un objet
- `getObject(entity_id)` : Récupère un objet
- `getAllObjects()` : Récupère tous les objets

**Propriétés** :
- `objects` : Map des objets
- `commandService` : Service de commandes

### 4. HAObject (Classe de Base)

**Fichier** : `src/models/objects/HAObject.ts`

**Responsabilités** :
- Classe de base pour tous les objets
- Gestion des propriétés communes
- Méthodes de base (render, updateState, handleAction)
- Injection du CommandService

**Propriétés** :
- `entity_id` : Identifiant de l'entité
- `position` : Position sur le plan (0-1)
- `element` : Élément DOM
- `commandService` : Service de commandes

**Méthodes Abstraites** :
- `render()` : Rend l'objet
- `updateState(state)` : Met à jour l'état
- `handleAction(action)` : Gère les actions

**Méthodes Concrètes** :
- `getEntity_id()` : Retourne l'ID
- `getPosition()` : Retourne la position
- `setPosition(x, y)` : Met à jour la position
- `sendCommand(service, serviceData)` : Envoie une commande
- `destroy()` : Nettoie l'objet

### 5. LightObject

**Fichier** : `src/models/objects/LightObject.ts`

**Responsabilités** :
- Représentation d'une lumière simple
- Gestion de l'état (on/off)
- Envoi des commandes

**Propriétés** :
- `isOn` : État actuel

**Méthodes** :
- `toggle()` : Bascule l'état
- `updateDisplay()` : Met à jour l'affichage

### 6. DimmableLightObject

**Fichier** : `src/models/objects/DimmableLightObject.ts`

**Responsabilités** :
- Représentation d'une lumière avec brightness
- Gestion de la luminosité
- Héritage de LightObject

**Propriétés** :
- `brightness` : Niveau de luminosité (0-255)

**Méthodes** :
- `adjustBrightness(delta)` : Ajuste la luminosité

### 7. CoverObject

**Fichier** : `src/models/objects/CoverObject.ts`

**Responsabilités** :
- Représentation d'un volet roulant
- Gestion de la position
- Contrôle de l'ouverture/fermeture

**Propriétés** :
- `coverPosition` : Position actuelle (0-100%)
- `isMoving` : État de mouvement

**Méthodes** :
- `move(direction)` : Déplace le volet
- `stop()` : Arrête le mouvement

### 8. BlindObject

**Fichier** : `src/models/objects/BlindObject.ts`

**Responsabilités** :
- Représentation d'un store
- Héritage de CoverObject
- Interface adaptée (boutons gauche/droite)

### 9. ThermostatObject

**Fichier** : `src/models/objects/ThermostatObject.ts`

**Responsabilités** :
- Représentation d'un thermostat
- Gestion de la température
- Contrôle du chauffage/climatisation

**Propriétés** :
- `currentTemp` : Température actuelle
- `targetTemp` : Température cible

**Méthodes** :
- `adjustTemp(delta)` : Ajuste la température

### 10. TemperatureSensor

**Fichier** : `src/models/objects/TemperatureSensor.ts`

**Responsabilités** :
- Représentation d'un capteur de température
- Affichage de la valeur et de l'unité
- Héritage de SensorObject

### 11. HumiditySensor

**Fichier** : `src/models/objects/HumiditySensor.ts`

**Responsabilités** :
- Représentation d'un capteur d'humidité
- Affichage de la valeur et de l'unité
- Héritage de SensorObject

### 12. GenericSensor

**Fichier** : `src/models/objects/GenericSensor.ts`

**Responsabilités** :
- Représentation d'un capteur générique
- Adaptation à différents types
- Héritage de SensorObject

### 13. ObjectFactory

**Fichier** : `src/models/objects/ObjectFactory.ts`

**Responsabilités** :
- Création des objets appropriés
- Injection des dépendances
- Pattern Factory

**Méthodes** :
- `createObject(entity_id, type, position, state, commandService)` : Crée un objet

### 14. CommandService

**Fichier** : `src/services/CommandService.ts`

**Responsabilités** :
- Interface pour l'envoi de commandes
- Abstraction du mécanisme de communication
- Permet le changement d'implémentation

**Implémentations** :
- `WebSocketCommandService` : Via WebSocket
- `RestCommandService` : Via API REST (fallback)

### 15. WebSocketService

**Fichier** : `src/services/WebSocketService.ts`

**Responsabilités** :
- Gestion de la connexion WebSocket
- Réception des messages en temps réel
- Reconnexion automatique
- Gestion des handlers

### 16. HAApiService

**Fichier** : `src/services/HAApiService.ts`

**Responsabilités** :
- Communication avec l'API REST
- Appels aux endpoints principaux
- Gestion des erreurs

### 17. PositionManager

**Fichier** : `src/models/PositionManager.ts`

**Responsabilités** :
- Gestion des positions
- Sauvegarde différée (debounce)
- Persistance des positions

### 18. MenuSystem

**Fichier** : `src/components/MenuSystem.ts`

**Responsabilités** :
- Gestion du menu principal
- Activation du mode édition
- Upload de plans
- Rafraîchissement

### 19. EntitySelector

**Fichier** : `src/components/EntitySelector.ts`

**Responsabilités** :
- Sélection des entités
- Navigation dans l'arborescence
- Filtrage des entités
- Callback de sélection

## 🔌 Intégration avec Home Assistant

### Endpoints API

#### GET /api/data
**Description** : Récupère les données initiales
**Réponse** :
```json
{
  "tree": [Area],
  "states": { [entity_id]: HAState },
  "config": { "objects": [ObjectConfig] },
  "floorplan": FloorplanData
}
```

#### POST /api/floorplan/upload
**Description** : Upload un plan d'étage
**Requête** : `multipart/form-data` avec le fichier
**Réponse** :
```json
{
  "path": string,
  "filename": string
}
```

#### POST /api/config/save
**Description** : Sauvegarde la configuration
**Requête** : `{ "objects": [ObjectConfig] }`
**Réponse** : `{ "success": true }`

#### POST /api/entities/command
**Description** : Envoie une commande
**Requête** :
```json
{
  "entity_id": string,
  "service": string,
  "service_data"?: any
}
```
**Réponse** : `{ "success": true }`

### Messages WebSocket

#### update:state
**Description** : Mise à jour d'état
**Payload** :
```json
{
  "entity_id": string,
  "new_state": HAState
}
```

#### config_updated
**Description** : Mise à jour de configuration
**Payload** : `{ "objects": [ObjectConfig] }`

#### floorplan_updated
**Description** : Mise à jour de plan
**Payload** : `{ "path": string, "filename": string }`

#### command
**Description** : Commande envoyée par le client
**Payload** :
```json
{
  "entity_id": string,
  "service": string,
  "service_data"?: any
}
```

## 🔒 Sécurité

### Exigences

1. **HTTPS** : Obligatoire en production
2. **CORS** : Configuration stricte
3. **Validation** : Toutes les entrées validées
4. **Authentification** : Via le serveur testvibe5
5. **Chiffrement** : Données sensibles chiffrées

### Bonnes Pratiques

1. **Ne pas stocker** les informations sensibles côté client
2. **Valider** toutes les données reçues du serveur
3. **Utiliser** HTTPS pour toutes les communications
4. **Limiter** les permissions des utilisateurs
5. **Journaliser** les activités sensibles

## ⚡ Performance

### Objectifs

1. **Rendu** : 60 FPS pour les animations
2. **Chargement** : < 2s pour le chargement initial
3. **Mémoire** : < 50MB pour 100 objets
4. **Bande passante** : < 10KB/s pour les mises à jour

### Optimisations

1. **Virtualisation** : Pour les grands plans
2. **Debounce** : Pour les sauvegardes
3. **Lazy Loading** : Pour les images
4. **Compression** : Pour les données
5. **Cache** : Pour les données statiques

## ♿ Accessibilité

### Exigences

1. **WCAG 2.1** : Niveau AA
2. **Navigation clavier** : Complète
3. **Contraste** : Suffisant
4. **ARIA** : Attributes appropriés
5. **Texte alternatif** : Pour les images

### Bonnes Pratiques

1. **Sémantique HTML** : Utilisation appropriée des balises
2. **Focus** : Visible et logique
3. **Labels** : Pour tous les éléments interactifs
4. **Alternatives** : Pour le contenu non textuel
5. **Test** : Avec des outils d'accessibilité

## 🌍 Internationalisation

### Exigences

1. **Langues** : Français, Anglais (extensible)
2. **Format** : Fichiers JSON
3. **Fallback** : Vers la langue par défaut
4. **Dynamic** : Changement sans rechargement

### Bonnes Pratiques

1. **Clés** : Descriptives et uniques
2. **Contexte** : Pour les traductions
3. **Pluriels** : Gestion appropriée
4. **Test** : Avec des locuteurs natifs

## 🚀 Déploiement

### Exigences

1. **Environnement** : Node.js v16+
2. **Serveur** : HTTPS requis
3. **Build** : Optimisé pour la production
4. **Monitoring** : Pour la santé de l'application

### Procédure

1. **Build** : `npm run build`
2. **Test** : Vérifier le build
3. **Déployer** : Copier les fichiers dans `dist/`
4. **Configurer** : Le serveur web
5. **Monitorer** : Les performances

### Configuration

```nginx
server {
  listen 443 ssl;
  server_name floorplan.example.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  root /var/www/floorplan/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 🔧 Maintenance et Support

### Versioning

**Semantic Versioning** : MAJOR.MINOR.PATCH
- **MAJOR** : Modifications incompatibles
- **MINOR** : Ajout de fonctionnalités
- **PATCH** : Corrections de bugs

### Support

1. **Documentation** : Complète et à jour
2. **Issues** : GitHub Issues
3. **Community** : Forum Home Assistant
4. **Updates** : Régulières et planifiées

### Roadmap

1. **1.1.0** : Tests E2E, thèmes, i18n
2. **1.2.0** : Plans multi-étages, groupes
3. **2.0.0** : Refonte UI, plugins

---

Dernière mise à jour : 04/01/2024