// Classe de base pour tous les objets Home Assistant
import { CommandService } from '../../services/CommandService';
import { PositionManager } from '../../models/PositionManager';
import { DragAndDropConstrained } from '../../ui/draganddropconstrained';

export abstract class HAObject {
  protected entity_id: string;
  protected position: {x: number, y: number};
  protected element: HTMLElement | null = null;
  protected commandService: CommandService | null = null;
  protected positionManager: PositionManager | null = null;
  private dragHandler: DragAndDropConstrained | null = null;

  constructor(entity_id: string, position: {x: number, y: number}, commandService?: CommandService) {
    this.entity_id = entity_id;
    this.position = position;
    this.commandService = commandService || null;
  }

  abstract render(): HTMLElement;

  // Méthode pour s'assurer que l'élément a un ID
  ensureElementHasId(element: HTMLElement): HTMLElement {
    if (!element.id) {
      element.id = `ha-object-${this.entity_id.replace(/\./g, '-')}`;
    }
    return element;
  }
  abstract updateState(state: any): void;
  abstract handleAction(action: string): void;

  getEntity_id(): string {
    return this.entity_id;
  }

  getPosition(): {x: number, y: number} {
    return this.position;
  }

  setPosition(x: number, y: number): void {
    this.position = {x, y};
  }

  setCommandService(commandService: CommandService): void {
    this.commandService = commandService;
  }

  setPositionManager(positionManager: PositionManager): void {
    this.positionManager = positionManager;
  }

  setElement(element: HTMLElement): void {
    this.element = element;
  }
  getElement() : HTMLElement | null{
    return this.element;
  }
  async enableDrag(): Promise<void> {
    if (this.element && !this.dragHandler) {
      // Créer un ID unique pour l'élément si ce n'est pas déjà fait
      this.ensureElementHasId(this.element);
      
      try {
        // Attendre que le conteneur de drag-and-drop soit disponible
        await this.getDragContainer();
        this.initializeDragHandler();
      } catch (error) {
        console.error(`Failed to enable drag for object ${this.entity_id}:`, error);
        throw error;
      }
    }
  }
  
  // Méthode asynchrone pour obtenir le conteneur de drag-and-drop
  // Attend jusqu'à 2 secondes maximum avant d'échouer
  private getDragContainer(): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const maxWaitTime = 2000; // 2 secondes
      
      const checkContainer = () => {
        const container = document.getElementById('floorplan-drag-container');
        
        if (container) {
          resolve(container);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error('Drag container (floorplan-drag-container) not found after 2 seconds'));
        } else {
          // Réessayer après un court délai
          setTimeout(checkContainer, 100);
        }
      };
      
      // Premier essai immédiat
      checkContainer();
    });
  }

  private initializeDragHandler(): void {
    console.log(`[TRACE] Initialisation du drag handler pour ${this.entity_id}`);
    console.log(`[TRACE] Élément ID: ${this.element!.id}, Élément:`, this.element);
    
    // Désactiver le drag natif pour éviter les conflits
    this.element!.setAttribute('draggable', 'false');
    
    try {
      // Créer un callback pour la fin du drag
      const onDragEndCallback = async (finalPosition: {x: number, y: number}) => {
        console.log(`[TRACE] Callback de fin de drag appelé pour ${this.entity_id} avec position:`, finalPosition);
        
        // Vérifier si l'objet a été droppé sur la poubelle
        const trashIcon = document.querySelector('.trash-icon') as HTMLElement;
        const isOverTrash = trashIcon ? await this.isMouseOverTrashIcon(trashIcon, finalPosition) : false;
        if (isOverTrash) {
          console.log(`[TRACE] Objet ${this.entity_id} droppé sur la poubelle, suppression...`);
          this.removeObjectFromFloorPlan();
          return; // Ne pas mettre à jour la position si l'objet est supprimé
        }
        
        // Si pas sur la poubelle, mettre à jour la position normale
        if (this.positionManager && this.element) {
          try {
            const rect = this.element.getBoundingClientRect();
            const containerRect = (await this.getDragContainer()).getBoundingClientRect();
            
            if (containerRect) {
              // Les coordonnées finales sont déjà en pixels par rapport au conteneur
              // Convertir en pourcentages (0-1) par rapport au dragContainer
              const x = finalPosition.x / containerRect.width;
              const y = finalPosition.y / containerRect.height;
              
              console.log(`[TRACE] Fin de déplacement détectée pour ${this.entity_id}:`, {
                elementRect: {left: rect.left, top: rect.top, width: rect.width, height: rect.height},
                containerRect: {left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height},
                finalPosition: {x, y}
              });
              
              this.positionManager.updatePosition(this.entity_id, x, y);
              this.position = {x, y};
              
              console.log(`[TRACE] Position finale sauvegardée pour ${this.entity_id}:`, {x, y});
            }
          } catch (error) {
            console.error(`[TRACE] Erreur dans le callback de fin de drag pour ${this.entity_id}:`, error);
          }
        }
      };
      
      // Utiliser le parent de l'élément comme conteneur et passer le callback
      // Pour les objets HA, nous utilisons le mode 'center' car ils sont centrés avec transform: translate(-50%, -50%)
      console.log(`[TRACE] Création de DragAndDropConstrained pour #${this.element!.id} avec callback et mode center`);
      this.dragHandler = new DragAndDropConstrained(
        `#${this.element!.id}`,
        onDragEndCallback,
        'center' // Mode de contrainte pour les objets HA
      );
      console.log(`[TRACE] DragAndDropConstrained créé avec succès avec callback et mode center`);
      
      // Ajouter une classe pour indiquer que l'objet est draggable
      console.log("element:", this.element)
      this.element!.classList.add('ha-object-draggable');
      console.log(`Drag successfully initialized for object ${this.entity_id}`);
     
    } catch (error) {
      console.error(`Failed to initialize drag for object ${this.entity_id}:`, error);
    }
  }

  /**
   * Vérifie si une position est au-dessus de la poubelle
   * @param trashIcon L'icône de la poubelle
   * @param position La position à vérifier (en pixels par rapport au conteneur)
   * @returns True si la position est au-dessus de la poubelle
   */
  private async isMouseOverTrashIcon(trashIcon: HTMLElement, position: {x: number, y: number}): Promise<boolean> {
    const trashRect = trashIcon.getBoundingClientRect();
    
    try {
      const container = await this.getDragContainer();
      const containerRect = container?.getBoundingClientRect();
      
      if (!containerRect) {
        return false;
      }
      
      // Convertir la position relative en position absolue
      const absoluteX = containerRect.left + position.x;
      const absoluteY = containerRect.top + position.y;
      
      return (
        absoluteX >= trashRect.left &&
        absoluteX <= trashRect.right &&
        absoluteY >= trashRect.top &&
        absoluteY <= trashRect.bottom
      );
    } catch (error) {
      console.error('[TRACE] HAObject - Erreur dans isMouseOverTrashIcon:', error);
      return false;
    }
  }
  
  /**
   * Supprime l'objet du floor plan
   */
  private removeObjectFromFloorPlan(): void {
    console.log(`[TRACE] Suppression de l'objet ${this.entity_id} du floor plan`);
    
    // Supprimer l'élément du DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Notifier le PositionManager pour supprimer la position
    if (this.positionManager) {
      this.positionManager.removePosition(this.entity_id);
    }
    
    // Désactiver le drag si actif
    this.disableDrag();
  }
  
  disableDrag(): void {
    if (this.dragHandler) {
      this.dragHandler.destroy();
      this.dragHandler = null;
    }
    
    if (this.element) {
      this.element.classList.remove('ha-object-draggable');
    }
  }

  /**
   * Envoyer une commande au format domain.service
   * @param domain - Domaine de l'entité (ex: 'light', 'climate', 'cover')
   * @param service - Service à appeler (ex: 'turn_on', 'set_temperature')
   * @param serviceData - Données supplémentaires pour le service
   */
  protected sendCommand(domain: string, service: string, serviceData?: any): void {
    // Construire la commande complète au format domain.service
    const fullService = `${domain}.${service}`;
    
    console.log(`[TRACE] HAObject.sendCommand() - Envoi de la commande ${fullService} pour ${this.entity_id} avec données:`, serviceData);
    
    if (this.commandService && this.commandService.isConnected()) {
      console.log(`[TRACE] HAObject - CommandService disponible et connecté, transmission de la commande`);
      this.commandService.sendCommand(this.entity_id, fullService, serviceData);
    } else {
      console.warn(`[TRACE] HAObject - Impossible d'envoyer la commande: ${fullService} - CommandService non disponible ou non connecté`);
    }
  }

  destroy(): void {
    this.disableDrag();
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}