# Documentation des Composants

Ce document décrit en détail les composants principaux de l'application Home Assistant Floor Plan Client.

## 📋 Table des matières

- [Architecture Globale](#-architecture-globale)
- [Composants Principaux](#-composants-principaux)
- [Modèles de Données](#-modèles-de-données)
- [Services](#-services)
- [Types d'Objets](#-types-dobjets)
- [Flux de Données](#-flux-de-données)
- [Cycle de Vie](#-cycle-de-vie)

## 🏗️ Architecture Globale

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

## 🎯 Composants Principaux

### FloorPlanContainer

**Fichier** : `src/components/FloorPlanContainer.ts`

**Responsabilités** :
- Point d'entrée principal de l'application
- Initialisation des services et composants
- Gestion du cycle de vie de l'application
- Coordination entre les différents modules

**Méthodes principales** :
- `initialize()` : Charge les données initiales et configure l'application
- `uploadFloorplan(file: File)` : Gère l'upload d'un nouveau plan
- `enableEditMode()` : Active le mode édition
- `disableEditMode()` : Désactive le mode édition
- `sendCommand(entity_id, service, serviceData)` : Envoie des commandes aux entités

**Exemple d'utilisation** :
```typescript
const apiService = new HAApiService(API_BASE_URL);
const floorPlan = new FloorPlanContainer(
  document.getElementById('app'),
  apiService,
  WS_URL
);

await floorPlan.initialize();
```

### FloorPlan

**Fichier** : `src/models/FloorPlan.ts`

**Responsabilités** :
- Gestion du plan d'étage (image)
- Calcul des proportions et du redimensionnement
- Positionnement des objets sur le plan
- Gestion du conteneur DOM

**Méthodes principales** :
- `loadPlan(url: string)` : Charge et affiche un plan d'étage
- `addObject(object: HAObject)` : Ajoute un objet au plan
- `removeObject(entity_id: string)` : Retire un objet du plan
- `enableEditMode()` : Active le mode édition
- `disableEditMode()` : Désactive le mode édition

**Exemple d'utilisation** :
```typescript
const floorPlan = new FloorPlan(document.getElementById('floorplan-container'));
await floorPlan.loadPlan('/path/to/floorplan.jpg');
```

### ObjectManager

**Fichier** : `src/services/ObjectManager.ts`

**Responsabilités** :
- Création et gestion des objets HA
- Injection du CommandService
- Mise à jour des états des objets
- Coordination entre les objets et le plan

**Méthodes principales** :
- `createObjectFromConfig(config)` : Crée un objet à partir d'une configuration
- `updateObjectState(entity_id, state)` : Met à jour l'état d'un objet
- `removeObject(entity_id)` : Retire un objet
- `getObject(entity_id)` : Récupère un objet
- `getAllObjects()` : Récupère tous les objets

**Exemple d'utilisation** :
```typescript
const objectManager = new ObjectManager(floorPlan, positionManager, webSocketService);
const light = objectManager.createObjectFromConfig({
  entity_id: 'light.living_room',
  type: 'light',
  position: { x: 0.5, y: 0.5 },
  state: { state: 'on', attributes: {} }
});
```

### MenuSystem

**Fichier** : `src/components/MenuSystem.ts`

**Responsabilités** :
- Gestion du menu principal
- Activation/désactivation du mode édition
- Upload de plans
- Rafraîchissement des données

**Méthodes principales** :
- `toggleMenu()` : Affiche/masque le menu
- `toggleEditMode()` : Active/désactive le mode édition
- `triggerFileUpload()` : Ouvre le sélecteur de fichiers
- `refreshData()` : Rafraîchit les données

**Exemple d'utilisation** :
```typescript
const menuSystem = new MenuSystem(
  document.getElementById('floorplan-container'),
  (isEditing) => {
    if (isEditing) {
      floorPlan.enableEditMode();
    } else {
      floorPlan.disableEditMode();
    }
  }
);
```

### EntitySelector

**Fichier** : `src/components/EntitySelector.ts`

**Responsabilités** :
- Sélection des entités à ajouter au plan
- Navigation dans l'arborescence (Areas → Devices → Entities)
- Filtrage des entités disponibles
- Appel du callback lors de la sélection

**Méthodes principales** :
- `setData(tree)` : Charge les données de l'arborescence
- `onAreaSelected()` : Gère la sélection d'une pièce
- `onDeviceSelected()` : Gère la sélection d'un appareil
- `onEntitySelected()` : Gère la sélection d'une entité

**Exemple d'utilisation** :
```typescript
const entitySelector = new EntitySelector(
  document.getElementById('controls-container'),
  (entity_id) => {
    console.log('Entité sélectionnée:', entity_id);
    // Ajouter l'entité au plan
  }
);

entitySelector.setData(data.tree);
```

## 📦 Modèles de Données

### HAObject (Classe de base)

**Fichier** : `src/models/objects/HAObject.ts`

**Responsabilités** :
- Classe de base abstraite pour tous les objets
- Gestion des propriétés communes (position, entity_id)
- Méthodes de base (render, updateState, handleAction)
- Injection du CommandService

**Propriétés** :
- `entity_id: string` : Identifiant de l'entité
- `position: {x: number, y: number}` : Position sur le plan (0-1)
- `element: HTMLElement | null` : Élément DOM
- `commandService: CommandService | null` : Service de commandes

**Méthodes abstraites** :
- `render(): HTMLElement` : Rend l'objet dans le DOM
- `updateState(state: any): void` : Met à jour l'état de l'objet
- `handleAction(action: string): void` : Gère les actions sur l'objet

**Méthodes concrètes** :
- `getEntity_id(): string` : Retourne l'ID de l'entité
- `getPosition(): {x: number, y: number}` : Retourne la position
- `setPosition(x: number, y: number): void` : Met à jour la position
- `sendCommand(service: string, serviceData?: any): void` : Envoie une commande
- `destroy(): void` : Nettoie l'objet

### SensorObject (Classe de base pour les capteurs)

**Fichier** : `src/models/objects/SensorObject.ts`

**Responsabilités** :
- Classe de base pour les objets de type capteur
- Gestion de l'affichage des valeurs et unités
- Héritage de HAObject

**Propriétés supplémentaires** :
- `stateValue: string` : Valeur actuelle du capteur
- `unit: string` : Unité de mesure
- `icon: string` : Icône à afficher

**Méthodes** :
- `updateDisplay(): void` : Met à jour l'affichage
- `getIcon(): string` : Retourne l'icône (abstraite)

### ObjectFactory

**Fichier** : `src/models/objects/ObjectFactory.ts`

**Responsabilités** :
- Création des objets appropriés en fonction du type
- Injection des dépendances (CommandService)
- Pattern Factory pour la création d'objets

**Méthodes** :
- `createObject(entity_id, type, position, state, commandService)` : Crée un objet

**Logique de création** :
- `light.*` → LightObject ou DimmableLightObject
- `cover.*` → CoverObject ou BlindObject
- `climate.*` → ThermostatObject
- `sensor.*` → TemperatureSensor, HumiditySensor, ou GenericSensor
- Autres → GenericSensor

## 🔧 Services

### CommandService (Interface)

**Fichier** : `src/services/CommandService.ts`

**Responsabilités** :
- Définition de l'interface pour l'envoi de commandes
- Abstraction du mécanisme de communication
- Permet le changement d'implémentation

**Méthodes** :
- `sendCommand(entity_id: string, service: string, serviceData?: any): void`
- `isConnected(): boolean`

### WebSocketCommandService

**Fichier** : `src/services/CommandService.ts`

**Responsabilités** :
- Implémentation du CommandService via WebSocket
- Envoi des commandes en temps réel
- Gestion de l'état de la connexion

**Dépendances** :
- WebSocketService pour la connexion

### RestCommandService

**Fichier** : `src/services/CommandService.ts`

**Responsabilités** :
- Implémentation du CommandService via API REST
- Fallback lorsque WebSocket n'est pas disponible
- Envoi des commandes via HTTP

**Dépendances** :
- HAApiService pour les appels API

### WebSocketService

**Fichier** : `src/services/WebSocketService.ts`

**Responsabilités** :
- Gestion de la connexion WebSocket
- Réception des messages en temps réel
- Reconnexion automatique
- Gestion des handlers de messages

**Méthodes** :
- `on(type: string, handler: (data: any) => void): void` : Écoute un type de message
- `send(message: any): void` : Envoie un message
- `isConnected(): boolean` : Vérifie l'état de la connexion
- `close(): void` : Ferme la connexion

### HAApiService

**Fichier** : `src/services/HAApiService.ts`

**Responsabilités** :
- Communication avec l'API REST du serveur
- Appels aux endpoints principaux
- Gestion des erreurs

**Méthodes** :
- `getData(): Promise<any>` : Récupère les données initiales
- `uploadFloorplan(file: File): Promise<any>` : Upload un plan
- `saveConfig(config: any): Promise<any>` : Sauvegarde la configuration
- `callService(entity_id: string, service: string, serviceData?: any): Promise<any>` : Appelle un service

### PositionManager

**Fichier** : `src/models/PositionManager.ts`

**Responsabilités** :
- Gestion des positions des objets
- Sauvegarde différée (debounce)
- Persistance des positions

**Méthodes** :
- `updatePosition(entity_id: string, x: number, y: number): void` : Met à jour une position
- `removePosition(entity_id: string): void` : Retire une position
- `getPosition(entity_id: string): ObjectPosition | undefined` : Récupère une position
- `loadPositions(positions: any[]): void` : Charge les positions initiales

## 🎨 Types d'Objets

### LightObject

**Fichier** : `src/models/objects/LightObject.ts`

**Responsabilités** :
- Représentation d'une lumière simple (on/off)
- Gestion de l'état (allumé/éteint)
- Envoi des commandes de bascule

**Propriétés** :
- `isOn: boolean` : État actuel

**Méthodes** :
- `toggle(): void` : Bascule l'état
- `updateDisplay(): void` : Met à jour l'icône

### DimmableLightObject

**Fichier** : `src/models/objects/DimmableLightObject.ts`

**Responsabilités** :
- Représentation d'une lumière avec brightness
- Gestion de la luminosité
- Héritage de LightObject

**Propriétés** :
- `brightness: number` : Niveau de luminosité (0-255)

**Méthodes** :
- `adjustBrightness(delta: number): void` : Ajuste la luminosité

### CoverObject

**Fichier** : `src/models/objects/CoverObject.ts`

**Responsabilités** :
- Représentation d'un volet roulant
- Gestion de la position (0-100%)
- Contrôle de l'ouverture/fermeture

**Propriétés** :
- `coverPosition: number` : Position actuelle
- `isMoving: boolean` : État de mouvement

**Méthodes** :
- `move(direction: 'up' | 'down'): void` : Déplace le volet
- `stop(): void` : Arrête le mouvement

### BlindObject

**Fichier** : `src/models/objects/BlindObject.ts`

**Responsabilités** :
- Représentation d'un store
- Héritage de CoverObject
- Interface adaptée (boutons gauche/droite)

### ThermostatObject

**Fichier** : `src/models/objects/ThermostatObject.ts`

**Responsabilités** :
- Représentation d'un thermostat
- Gestion de la température
- Contrôle du chauffage/climatisation

**Propriétés** :
- `currentTemp: number` : Température actuelle
- `targetTemp: number` : Température cible

**Méthodes** :
- `adjustTemp(delta: number): void` : Ajuste la température

### TemperatureSensor

**Fichier** : `src/models/objects/TemperatureSensor.ts`

**Responsabilités** :
- Représentation d'un capteur de température
- Affichage de la valeur et de l'unité
- Héritage de SensorObject

### HumiditySensor

**Fichier** : `src/models/objects/HumiditySensor.ts`

**Responsabilités** :
- Représentation d'un capteur d'humidité
- Affichage de la valeur et de l'unité
- Héritage de SensorObject

### GenericSensor

**Fichier** : `src/models/objects/GenericSensor.ts`

**Responsabilités** :
- Représentation d'un capteur générique
- Adaptation à différents types de capteurs
- Héritage de SensorObject

## 📊 Flux de Données

### Initialisation

```
1. FloorPlanContainer.initialize()
   ↓
2. HAApiService.getData() → Serveur
   ↓
3. ObjectFactory.createObject() pour chaque objet
   ↓
4. FloorPlan.addObject() pour chaque objet
   ↓
5. WebSocketService.on() pour les mises à jour
```

### Mise à jour d'état

```
1. Serveur → WebSocket → FloorPlanContainer
   ↓
2. ObjectManager.updateObjectState()
   ↓
3. HAObject.updateState()
   ↓
4. HAObject.updateDisplay()
```

### Envoi de commande

```
1. Utilisateur → HAObject.handleAction()
   ↓
2. HAObject.sendCommand() → CommandService
   ↓
3. WebSocketService.send() → Serveur
   ↓
4. Serveur → WebSocket → update:state
```

### Upload de plan

```
1. Utilisateur → MenuSystem.triggerFileUpload()
   ↓
2. HAApiService.uploadFloorplan() → Serveur
   ↓
3. FloorPlan.loadPlan()
   ↓
4. WebSocket → floorplan_updated (broadcast)
```

## 🔄 Cycle de Vie

### FloorPlanContainer

```
1. new FloorPlanContainer()
   ↓
2. initialize() → Charge les données
   ↓
3. Événements utilisateur (clics, drag&drop)
   ↓
4. Mises à jour WebSocket
   ↓
5. cleanup() → Nettoyage
```

### HAObject

```
1. ObjectFactory.createObject()
   ↓
2. render() → Création DOM
   ↓
3. updateState() → Mises à jour
   ↓
4. handleAction() → Actions utilisateur
   ↓
5. destroy() → Nettoyage
```

### WebSocketService

```
1. new WebSocketService(url)
   ↓
2. connect() → Connexion
   ↓
3. on() → Registration des handlers
   ↓
4. send() → Envoi de messages
   ↓
5. close() → Déconnexion
```

---

Dernière mise à jour : 04/01/2024