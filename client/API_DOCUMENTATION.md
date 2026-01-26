# Documentation de l'API

Ce document décrit les endpoints et les messages utilisés par l'application client pour communiquer avec le serveur testvibe5.

## 📡 Endpoints API REST

### GET /api/data

Récupère les données initiales pour l'application.

**Réponse réussie (200 OK)**
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": "living_room",
        "name": "Salon",
        "devices": [
          {
            "id": "living_room_lights",
            "name": "Lumières du salon",
            "entities": {
              "light.living_room_main": {
                "entity_id": "light.living_room_main",
                "name": "Lumière principale"
              }
            }
          }
        ]
      }
    ],
    "states": {
      "light.living_room_main": {
        "entity_id": "light.living_room_main",
        "state": "on",
        "attributes": {
          "brightness": 128,
          "friendly_name": "Lumière principale"
        },
        "last_changed": "2024-01-04T10:00:00.000Z",
        "last_updated": "2024-01-04T10:00:00.000Z",
        "context": {
          "id": "abc123",
          "user_id": null
        }
      }
    },
    "config": {
      "objects": [
        {
          "entity_id": "light.living_room_main",
          "type": "light",
          "position": {
            "x": 0.5,
            "y": 0.5
          }
        }
      ]
    },
    "floorplan": {
      "path": "/uploads/floorplan.jpg",
      "filename": "floorplan.jpg"
    }
  }
}
```

**Erreur (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Erreur de connexion à Home Assistant"
}
```

### POST /api/floorplan/upload

Upload un nouveau plan d'étage.

**Requête**
- `Content-Type: multipart/form-data`
- Corps: Fichier image (JPEG, PNG, etc.)

**Réponse réussie (200 OK)**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "path": "/uploads/new-floorplan.jpg",
  "filename": "new-floorplan.jpg"
}
```

**Erreur (400 Bad Request)**
```json
{
  "success": false,
  "error": "Aucun fichier uploadé"
}
```

### POST /api/config/save

Sauvegarde la configuration des positions des objets.

**Requête**
```json
{
  "objects": [
    {
      "entity_id": "light.living_room_main",
      "type": "light",
      "position": {
        "x": 0.6,
        "y": 0.4
      }
    }
  ]
}
```

**Réponse réussie (200 OK)**
```json
{
  "success": true,
  "message": "Configuration sauvegardée"
}
```

### POST /api/entities/command

Envoie une commande à une entité.

**Requête**
```json
{
  "entity_id": "light.living_room_main",
  "service": "turn_on",
  "service_data": {
    "brightness": 128
  }
}
```

**Réponse réussie (200 OK)**
```json
{
  "success": true,
  "message": "Commande exécutée"
}
```

## 📦 Messages WebSocket

### Format des messages

Tous les messages WebSocket suivent ce format :

```json
{
  "type": "message_type",
  "payload": {}
}
```

### update:state

Envoyé lorsque l'état d'une entité change.

**Message**
```json
{
  "type": "update:state",
  "payload": {
    "entity_id": "light.living_room_main",
    "new_state": {
      "entity_id": "light.living_room_main",
      "state": "off",
      "attributes": {
        "brightness": 0,
        "friendly_name": "Lumière principale"
      },
      "last_changed": "2024-01-04T10:05:00.000Z",
      "last_updated": "2024-01-04T10:05:00.000Z",
      "context": {
        "id": "def456",
        "user_id": null
      }
    }
  }
}
```

### config_updated

Envoyé lorsque la configuration est mise à jour.

**Message**
```json
{
  "type": "config_updated",
  "payload": {
    "objects": [
      {
        "entity_id": "light.living_room_main",
        "type": "light",
        "position": {
          "x": 0.6,
          "y": 0.4
        }
      }
    ]
  }
}
```

### floorplan_updated

Envoyé lorsque le plan d'étage est mis à jour.

**Message**
```json
{
  "type": "floorplan_updated",
  "payload": {
    "path": "/uploads/new-floorplan.jpg",
    "filename": "new-floorplan.jpg"
  }
}
```

### command

Envoyé par le client pour exécuter une commande.

**Message**
```json
{
  "type": "command",
  "payload": {
    "entity_id": "light.living_room_main",
    "service": "turn_on",
    "service_data": {
      "brightness": 128
    }
  }
}
```

## 📊 Types de données

### HAState

Représente l'état d'une entité Home Assistant.

```typescript
interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    user_id: string | null;
  };
}
```

### Area

Représente une zone/pièce dans Home Assistant.

```typescript
interface Area {
  id: string;
  name: string;
  devices: Device[];
}
```

### Device

Représente un appareil dans Home Assistant.

```typescript
interface Device {
  id: string;
  name: string;
  entities: Record<string, Entity>;
}
```

### Entity

Représente une entité dans Home Assistant.

```typescript
interface Entity {
  entity_id: string;
  name: string | null;
}
```

### ObjectPosition

Représente une position sur le plan.

```typescript
interface ObjectPosition {
  x: number; // 0-1
  y: number; // 0-1
}
```

### ObjectConfig

Configuration d'un objet sur le plan.

```typescript
interface ObjectConfig {
  entity_id: string;
  type: string;
  position: ObjectPosition;
}
```

## 🔧 Exemples d'utilisation

### Récupération des données initiales

```javascript
const response = await fetch('/api/data');
const data = await response.json();

if (data.success) {
  console.log('Données chargées:', data.data);
} else {
  console.error('Erreur:', data.error);
}
```

### Envoi d'une commande

```javascript
const command = {
  entity_id: 'light.living_room_main',
  service: 'turn_on',
  service_data: { brightness: 128 }
};

const response = await fetch('/api/entities/command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(command)
});

const result = await response.json();
console.log('Commande envoyée:', result);
```

### Upload d'un plan

```javascript
const fileInput = document.getElementById('floorplan-upload');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('floorplan', file);

const response = await fetch('/api/floorplan/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Plan uploadé:', result);
```

## 📝 Notes supplémentaires

- Tous les endpoints retournent des objets JSON
- Les erreurs sont toujours retournées avec un champ `success: false` et un champ `error`
- Les positions sont toujours dans la plage 0-1 (relatif au plan)
- Les timestamps sont au format ISO 8601
- Les attributs supplémentaires peuvent être présents selon le type d'entité

## 🔒 Sécurité

- Assurez-vous que le serveur testvibe5 est sécurisé
- Utilisez HTTPS en production
- Validez toujours les données reçues du serveur
- Ne stockez pas de données sensibles dans le localStorage

---

Dernière mise à jour : 04/01/2024