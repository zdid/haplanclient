import { HAObject } from '../models/objects/HAObject';
import { UnifiedObjectFactory } from '../models/objects/UnifiedObjectFactory';
import { FloorPlan } from '../models/FloorPlan';
import { PositionManager } from '../models/PositionManager';
import { CommandService, WebSocketCommandService } from './CommandService';

export class ObjectManager {
  private floorPlan: FloorPlan;
  private positionManager: PositionManager;
  private objects: Map<string, HAObject> = new Map();
  private commandService: CommandService;

  constructor(floorPlan: FloorPlan, positionManager: PositionManager, webSocketService: any) {
    this.floorPlan = floorPlan;
    this.positionManager = positionManager;
    this.commandService = new WebSocketCommandService(webSocketService);
  }

  async createObjectFromConfig(config: any): Promise<HAObject> {
    const position = this.positionManager.getPosition(config.entity_id) || config.position;
    
    // Utiliser la nouvelle fabrique unifiée
    const { entity, window } = UnifiedObjectFactory.createObjectWithWindow(
      config.entity_id,
      position,
      config.state,
      this.commandService
    );

    // Injecter le PositionManager
    entity.setPositionManager(this.positionManager);

    this.objects.set(config.entity_id, entity);
    this.floorPlan.addObject(entity);

    // Si une position existe déjà, l'appliquer
    if (position) {
      entity.setPosition(position.x, position.y);
    }

    // ENREGISTRER LA POSITION DANS LE POSITION MANAGER POUR LA SAUVEGARDE
    if (position) {
      this.positionManager.updatePosition(config.entity_id, position.x, position.y);
      console.log(`[TRACE] Position initiale enregistrée pour ${config.entity_id}:`, position);
    }

    // Si le mode édition est activé, activer le drag pour le nouvel objet
    // Vérifier si le conteneur a la classe edit-mode
    if (this.floorPlan && this.floorPlan['container']?.classList.contains('edit-mode')) {
      try {
        await entity.enableDrag();
      } catch (error) {
        console.error(`Failed to enable drag for new object ${config.entity_id}:`, error);
        // Ne pas empêcher la création de l'objet si le drag échoue
      }
    }

    return entity;
  }

  updateObjectState(entity_id: string, state: any): void {
    const object = this.objects.get(entity_id);
    if (object) {
      object.updateState(state);
    }
  }

  removeObject(entity_id: string): void {
    const object = this.objects.get(entity_id);
    if (object) {
      this.floorPlan.removeObject(entity_id);
      this.objects.delete(entity_id);
      this.positionManager.removePosition(entity_id);
    }
  }

  getObject(entity_id: string): HAObject | undefined {
    return this.objects.get(entity_id);
  }

  /**
   * Vérifie si un objet existe dans le manager
   * @param entity_id - ID de l'entité à vérifier
   * @returns true si l'objet existe, false sinon
   */
  hasObject(entity_id: string): boolean {
    return this.objects.has(entity_id);
  }

  getAllObjects(): HAObject[] {
    return Array.from(this.objects.values());
  }

  async enableEditMode(): Promise<void> {
    this.floorPlan.enableEditMode();
    // Activer le drag-and-drop pour tous les objets
    const enableDragPromises = Array.from(this.objects.values()).map(object => {
      return object.enableDrag();
    });
    
    try {
      await Promise.all(enableDragPromises);
      console.log('All objects drag enabled successfully');
    } catch (error) {
      console.error('Failed to enable drag for some objects:', error);
      throw error;
    }
  }

  disableEditMode(): void {
    this.floorPlan.disableEditMode();
    // Désactiver le drag-and-drop pour tous les objets
    this.objects.forEach(object => {
      object.disableDrag();
    });
  }

  setCommandService(commandService: CommandService): void {
    this.commandService = commandService;
    // Mettre à jour tous les objets existants
    this.objects.forEach(object => {
      object.setCommandService(commandService);
    });
  }
}