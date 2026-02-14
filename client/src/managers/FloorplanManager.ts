import { FloorPlanContainer } from '../components/FloorPlanContainer';
import { FloorplanSelector } from '../components/FloorplanSelector';
import { DataService } from '../services/DataService';
import { EntitySelector } from '../components/EntitySelector';
import { PreferencesManager } from './PreferencesManager';
import { MenuSystem } from '../components/MenuSystem';

export class FloorplanManager {
  private selectorContainer: HTMLElement;
  private floorPlanContainer: HTMLElement;
  private currentFloorPlanId: string | null = null;
  private floorPlanContainers: Map<string, {container: FloorPlanContainer, element: HTMLElement}> = new Map();
  private isEditMode: boolean = false;
  private objectScale: number = 1;
  private dataService: DataService;
  private entitySelector: EntitySelector;
  private preferencesManager: PreferencesManager;
  private menuSystem: MenuSystem | null = null;

  constructor(
    selectorContainer: HTMLElement,
    floorPlanContainer: HTMLElement,
    dataService: DataService,
    entitySelector: EntitySelector,
    preferencesManager: PreferencesManager
  ) {
    this.selectorContainer = selectorContainer;
    this.floorPlanContainer = floorPlanContainer;
    this.dataService = dataService;
    this.entitySelector = entitySelector;
    this.preferencesManager = preferencesManager;
  }

  setMenuSystem(menuSystem: MenuSystem): void {
    this.menuSystem = menuSystem;
  }

  /**
   * Initialise tous les containers de plans en une seule fois
   * Chaque plan a son propre container pré-calculé
   */
  async initializeAllFloorplans(): Promise<void> {
    console.log('FloorplanManager: Initialisation de tous les plans');
    
    // ✅ 1. Nettoyer proprement les anciens containers
    console.log(`FloorplanManager: Nettoyage de ${this.floorPlanContainers.size} anciens containers`);
    this.floorPlanContainers.forEach((data, floorplanId) => {
      console.log(`FloorplanManager: Nettoyage du container pour ${floorplanId}`);
      try {
        data.container.cleanup();
      } catch (error) {
        console.error(`Erreur lors du nettoyage du container ${floorplanId}:`, error);
      }
    });
    
    // 2. Vider les containers existants
    this.floorPlanContainers.clear();
    this.floorPlanContainer.innerHTML = '';
    
    const floorplans = this.dataService.getAllFloorplans();
    const floorplanIds = Object.keys(floorplans);

    // 3. Créer un container pour chaque plan
    for (const floorplanId of floorplanIds) {
      await this.createFloorplanContainer(floorplanId);
    }

    console.log(`FloorplanManager: ${floorplanIds.length} plans initialisés`);
  }

  /**
   * Crée et initialise un container pour un plan spécifique
   */
  private async createFloorplanContainer(floorplanId: string): Promise<void> {
    // Si déjà créé, ne rien faire
    if (this.floorPlanContainers.has(floorplanId)) {
      console.log(`Plan ${floorplanId} déjà initialisé, skip`);
      return;
    }

    console.log(`Création du container pour le plan: ${floorplanId}`);

    // Créer l'élément DOM pour ce plan
    const imageContainer = document.createElement('div');
    imageContainer.id = `floorplan-${floorplanId}`;
    imageContainer.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      overflow: auto;
      display: none;
    `;
    this.floorPlanContainer.appendChild(imageContainer);

    // Définir temporairement ce plan comme courant pour la création
    const previousFloorplanId = this.dataService.getCurrentFloorplanId();
    this.dataService.setCurrentFloorplanId(floorplanId);

    // Créer le FloorPlanContainer
    const floorPlanContainer = new FloorPlanContainer(imageContainer, this.dataService);
    await floorPlanContainer.initialize();

    // Appliquer les préférences
    floorPlanContainer.updatePreferences(
      this.preferencesManager.getFontSize(),
      this.preferencesManager.getFontColor()
    );

    floorPlanContainer.setObjectScale(this.objectScale);

    // Sauvegarder dans le Map
    this.floorPlanContainers.set(floorplanId, {
      container: floorPlanContainer,
      element: imageContainer
    });

    // Restaurer le plan courant précédent
    if (previousFloorplanId) {
      this.dataService.setCurrentFloorplanId(previousFloorplanId);
    }

    console.log(`Container créé pour le plan: ${floorplanId}`);
  }

  /**
   * Masque tous les plans
   */
  private hideAllFloorplans(): void {
    this.floorPlanContainers.forEach((data) => {
      data.element.style.display = 'none';
    });
  }

  async showSelector(): Promise<void> {
    console.log('Affichage du sélecteur de plans');
    this.selectorContainer.innerHTML = '';

    const floorplanSelector = new FloorplanSelector(
      this.selectorContainer,
      this.dataService,
      (floorplanId: string) => this.showFloorplan(floorplanId)
    );

    floorplanSelector.render();
    
    this.selectorContainer.style.display = 'block';
    this.floorPlanContainer.style.display = 'none';

    // Masquer tous les containers de plans
    this.hideAllFloorplans();
    this.currentFloorPlanId = null;

    // Effacer le nom du plan dans le menu
    if (this.menuSystem) {
      this.menuSystem.setCurrentFloorplanName('');
    }
  }

  /**
   * Affiche un plan spécifique en le rendant visible
   * Tous les autres plans sont masqués
   */
  async showFloorplan(floorplanId: string): Promise<void> {
    try {
      console.log('Affichage du plan:', floorplanId);

      // Créer le container si nécessaire (lazy loading)
      if (!this.floorPlanContainers.has(floorplanId)) {
        await this.createFloorplanContainer(floorplanId);
      }

      // Masquer tous les plans
      this.hideAllFloorplans();

      // Afficher le plan sélectionné
      const floorplanData = this.floorPlanContainers.get(floorplanId);
      if (floorplanData) {
        floorplanData.element.style.display = 'block';
        this.currentFloorPlanId = floorplanId;

        // Définir le plan courant dans le DataService
        this.dataService.setCurrentFloorplanId(floorplanId);

        // Sauvegarder le plan courant dans localStorage
        try {
          localStorage.setItem('currentFloorplanId', floorplanId);
          console.log('[FloorplanManager] Plan sauvegardé dans localStorage:', floorplanId);
        } catch (e) {
          console.warn('[FloorplanManager] Impossible de sauvegarder dans localStorage:', e);
        }

        // ✅ IMPORTANT: Forcer le recalcul des dimensions maintenant que le container est visible
        // Utiliser requestAnimationFrame pour s'assurer que display:block est appliqué
        requestAnimationFrame(() => {
          floorplanData.container.recalculateDimensions();
        });

        // Mettre à jour l'EntitySelector
        floorplanData.container.updateEntitySelector(this.entitySelector);

        floorplanData.container.setObjectScale(this.objectScale);

        // Appliquer le mode édition si actif
        if (this.isEditMode) {
          floorplanData.container.enableEditMode();
        }
      }

      // Configurer les swipe handlers
      this.addSwipeHandlers(floorplanId);

      this.selectorContainer.style.display = 'none';
      this.floorPlanContainer.style.display = 'flex';

      // Mettre à jour le nom du plan dans le menu
      if (this.menuSystem) {
        this.menuSystem.setCurrentFloorplanName(floorplanId);
      }

      console.log('Plan affiché:', floorplanId);
    } catch (error) {
      console.error('Erreur lors de l\'affichage du plan:', error);
    }
  }

  private addSwipeHandlers(floorplanId: string): void {
    let touchStartX = 0;
    let touchEndX = 0;

    this.floorPlanContainer.addEventListener('touchstart', (e) => {
      if (!this.isEditMode) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, false);

    this.floorPlanContainer.addEventListener('touchend', (e) => {
      if (!this.isEditMode) {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(floorplanId, touchStartX, touchEndX);
      }
    }, false);
  }

  private handleSwipe(currentId: string, touchStartX: number, touchEndX: number): void {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    const allFloorplans = Object.keys(this.dataService.getAllFloorplans());
    const currentIndex = allFloorplans.indexOf(currentId);

    if (diff > swipeThreshold && currentIndex < allFloorplans.length - 1) {
      console.log('Swipe gauche - Plan suivant');
      this.showFloorplan(allFloorplans[currentIndex + 1]);
    } else if (diff < -swipeThreshold && currentIndex > 0) {
      console.log('Swipe droite - Plan précédent');
      this.showFloorplan(allFloorplans[currentIndex - 1]);
    }
  }

  setEditMode(isEditing: boolean): void {
    this.isEditMode = isEditing;
    if (this.currentFloorPlanId) {
      const floorplanData = this.floorPlanContainers.get(this.currentFloorPlanId);
      if (floorplanData) {
        if (isEditing) {
          floorplanData.container.enableEditMode();
        } else {
          floorplanData.container.disableEditMode();
        }
      }
    }
  }

  setObjectScale(scale: number): void {
    this.objectScale = scale;
    this.floorPlanContainers.forEach((data) => {
      data.container.setObjectScale(scale);
    });
  }

  getCurrentFloorPlan(): FloorPlanContainer | null {
    if (this.currentFloorPlanId) {
      const floorplanData = this.floorPlanContainers.get(this.currentFloorPlanId);
      return floorplanData ? floorplanData.container : null;
    }
    return null;
  }

  clear(): void {
    this.selectorContainer.innerHTML = '';
    this.floorPlanContainer.innerHTML = '';
    this.floorPlanContainers.clear();
    this.currentFloorPlanId = null;
    this.isEditMode = false;
  }
}