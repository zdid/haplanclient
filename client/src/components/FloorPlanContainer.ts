import { FloorPlan } from '../models/FloorPlan';
import { ObjectManager } from '../services/ObjectManager';
import { PositionManager } from '../models/PositionManager';
import { HAApiService } from '../services/HAApiService';
import { WebSocketService } from '../services/WebSocketService';
import { StateUpdateMessage, FloorplanUpdateMessage } from '../types/ha-types';
import { EntitySelector } from './EntitySelector';

export class FloorPlanContainer {
  private container: HTMLElement;
  private floorPlan: FloorPlan;
  private objectManager: ObjectManager;
  private apiService: HAApiService;
  private positionManager: PositionManager;
  private webSocketService: WebSocketService;

  constructor(container: HTMLElement, apiService: HAApiService, wsUrl: string) {
    this.container = container;
    this.apiService = apiService;

    this.positionManager = new PositionManager((positions) => {
      console.log(`[TRACE] FloorPlanContainer: Callback de sauvegarde appelé avec les positions:`, positions);
      
      // Obtenir toutes les positions actuelles pour s'assurer que tout est sauvegardé
      const allPositions = this.positionManager.getAllPositions();
      console.log(`[TRACE] Sauvegarde de toutes les positions (${allPositions.length} objets):`, allPositions);
      
      this.apiService.saveConfig({ objects: allPositions })
        .then(() => {
          console.log(`[TRACE] Sauvegarde réussie de ${allPositions.length} positions via l'API`);
        })
        .catch((error) => {
          console.error(`[TRACE] Erreur lors de la sauvegarde via l'API:`, error);
        });
    });

    this.webSocketService = new WebSocketService(wsUrl);
    this.floorPlan = new FloorPlan(container, this.positionManager);
    this.objectManager = new ObjectManager(this.floorPlan, this.positionManager, this.webSocketService);
  }

  async initialize(): Promise<void> {
    try {
      const data = (await this.apiService.getData()).data;
      console.log('data', Object.keys(data), '\nData', data)
      // Charger le plan si disponible
      if (data.floorplan) {
        await this.floorPlan.loadPlan(data.floorplan.path);
      } else {
        // Mode transparent si pas de plan
        this.container.style.backgroundColor = 'transparent';
      }
      console.log('data',Object.keys(data))
      console.log('config',Object.keys(data.config))
      // Charger les objets
      if (data.config && data.config.objects) {
        console.log("je suis dans data config objects");
        console.log(JSON.stringify(data.config.objects))
        data.config.objects.forEach((objConfig: any) => {
          if(objConfig.entity_id === "__trash_icon__") {
            return;
          }
          const state = data.states[objConfig.entity_id];
          console.log("dans la boucle ", JSON.stringify(objConfig))

          this.objectManager.createObjectFromConfig({
            ...objConfig,
            state
          });
        });
      }

      // Initialiser le WebSocket pour les mises à jour
      this.initWebSocket();

    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private initWebSocket(): void {
    // Écouter les mises à jour d'état
    this.webSocketService.on('state_updated', (payload: StateUpdateMessage['payload']) => {
      // Vérifier si l'objet existe avant d'afficher la trace
      if (this.objectManager.hasObject(payload.entity_id)) {
        console.log('[STATE UPDATE] Mise à jour reçue pour un objet affiché:', payload.entity_id, payload.new_state);
        this.objectManager.updateObjectState(payload.entity_id, payload.new_state);
      } 
      // else {
      //   // Afficher une trace uniquement en mode debug si l'objet n'est pas trouvé
      //   if (false) { // Désactivé par défaut pour éviter la pollution
      //     console.log('[STATE UPDATE] Mise à jour reçue pour un objet non affiché (ignoré):', payload.entity_id);
      //   }
      // }
    });

    // Écouter les mises à jour de configuration
    this.webSocketService.on('config_updated', (payload) => {
      console.log('Config update received:', payload);
      // Recharger la configuration si nécessaire
    });

    // Écouter les mises à jour de plan
    this.webSocketService.on('floorplan_updated', (payload: FloorplanUpdateMessage['payload']) => {
      console.log('Floorplan update received:', payload);
      this.floorPlan.loadPlan(payload.path);
    });
  }

  async enableEditMode(): Promise<void> {
    await this.objectManager.enableEditMode();
  }

  disableEditMode(): void {
    this.objectManager.disableEditMode();
  }

  /**
   * Crée un objet à partir d'une configuration
   * @param config La configuration de l'objet à créer
   */
  createObjectFromConfig(config: any): void {
    this.objectManager.createObjectFromConfig(config);
  }

  /**
   * Met à jour le sélecteur d'entités avec la liste des objets existants
   * @param entitySelector Le sélecteur d'entités à mettre à jour
   */
  updateEntitySelector(entitySelector: EntitySelector): void {
    try {
      if (!entitySelector || typeof entitySelector.setExistingObjects !== 'function') {
        console.warn('EntitySelector non valide ou méthode setExistingObjects non disponible');
        return;
      }
      
      const existingObjectIds = Array.from(this.objectManager.getAllObjects()).map(obj => obj.getEntity_id());
      entitySelector.setExistingObjects(existingObjectIds);
      console.log('EntitySelector mis à jour avec les objets existants:', existingObjectIds);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sélecteur d\'entités:', error);
    }
  }

  async uploadFloorplan(file: File): Promise<void> {
    try {
      const result = await this.apiService.uploadFloorplan(file);
      await this.floorPlan.loadPlan(result.path);

      // Recharger les données après upload
      const data = (await this.apiService.getData()).data;
      
      // Mettre à jour les objets si nécessaire
      if (data.config.objects) {
        data.config.objects.forEach((objConfig: any) => {
          if (!this.objectManager.getObject(objConfig.entity_id)) {
            const state = data.states[objConfig.entity_id];
            this.objectManager.createObjectFromConfig({
              ...objConfig,
              state
            });
          }
        });
      }

    } catch (error) {
      console.error('Floorplan upload error:', error);
    }
  }

  sendCommand(entity_id: string, service: string, serviceData?: any): void {
    // Envoyer une commande via WebSocket
    this.webSocketService.send({
      type: 'command',
      payload: {
        entity_id: entity_id,
        service: service,
        service_data: serviceData
      }
    });
  }

  cleanup(): void {
    this.webSocketService.close();
  }
}