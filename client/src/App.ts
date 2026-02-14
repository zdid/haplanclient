// Point d'entrée principal de l'application
import { MenuSystem } from './components/MenuSystem';
import { EntitySelector } from './components/EntitySelector';
import { FloorplanManager } from './managers/FloorplanManager';
import { UIInitializer, UIContainers } from './managers/UIInitializer';
import { PreferencesManager } from './managers/PreferencesManager';
import { DataService } from './services/DataService';
import './styles/styles.css';

const WS_URL = 'ws://localhost:3000';
const API_BASE_URL = 'http://localhost:3000';

export class App {
  private dataService: DataService;
  private containers: UIContainers;
  private floorplanManager: FloorplanManager;
  private entitySelector: EntitySelector;
  private preferencesManager: PreferencesManager;
  private menuSystem: MenuSystem;
  private unsubscribeRefresh: (() => void) | null = null;

  constructor() {
    console.log('[App] Construction');
    
    // 1. Initialiser les containers UI
    this.containers = UIInitializer.initialize();

    // 2. Créer les services
    this.dataService = new DataService(WS_URL, API_BASE_URL);
    this.preferencesManager = new PreferencesManager();

    // 3. Créer EntitySelector
    const entitySelectorContainer = document.createElement('div');
    this.entitySelector = new EntitySelector(
      entitySelectorContainer,
      async (entity_id: string) => {
        await this.handleEntitySelect(entity_id);
      }
    );

    // 4. Créer FloorplanManager (gère plusieurs plans)
    this.floorplanManager = new FloorplanManager(
      this.containers.selectorContainer,
      this.containers.floorPlanContainer,
      this.dataService,
      this.entitySelector,
      this.preferencesManager
    );

    // 5. Créer MenuSystem
    this.menuSystem = new MenuSystem(
      this.dataService,
      this.containers.mainContainer,
      (isEditing: boolean) => {
        console.log('[App] Mode édition:', isEditing);
        this.floorplanManager.setEditMode(isEditing);
      },
      this.preferencesManager
    );

    this.menuSystem.setPlanScaleChangeCallback((scale: number) => {
      this.floorplanManager.setObjectScale(scale);
    });

    this.menuSystem.setFloorplanChangeCallback(async (floorplanId: string) => {
      await this.floorplanManager.showFloorplan(floorplanId);
    });

    // Connecter le MenuSystem au FloorplanManager pour l'affichage du nom
    this.floorplanManager.setMenuSystem(this.menuSystem);

    // 7. Intégrer EntitySelector au menu
    this.menuSystem.integrateEntitySelector(this.entitySelector.getElement());

    this.menuSystem.notifyPlanScaleFromStorage();

    // 8. S'abonner aux changements de préférences
    this.preferencesManager.subscribe(() => {
      console.log('[App] Préférences mises à jour');
      const currentFloorPlan = this.floorplanManager.getCurrentFloorPlan();
      if (currentFloorPlan) {
        currentFloorPlan.updatePreferences(
          this.preferencesManager.getFontSize(),
          this.preferencesManager.getFontColor()
        );
      }
    });

    // 9. Écouter les refresh du serveur
    this.unsubscribeRefresh = this.dataService.on('refresh', () => {
      console.log('[App] refresh reçu du serveur');
      this.handleRefresh();
    });

    window.addEventListener('ha-object-focus', (event: Event) => {
      const customEvent = event as CustomEvent<{ label: string }>;
      if (customEvent.detail?.label) {
        this.menuSystem.setHoveredEntityLabel(customEvent.detail.label);
      }
    });

    console.log('[App] Construction terminée');
  }

  // Initialiser l'application
  async initialize(): Promise<void> {
    try {
      console.log('[App] Initialisation - En attente du refresh du serveur');
      console.log('[App] Application initialisée et prête à recevoir les données');
    } catch (error) {
      console.error('[App] Erreur lors de l\'initialisation:', error);
    }
  }

  // Traiter le refresh du serveur
  private async handleRefresh(): Promise<void> {
    try {
      console.log('[App] Traitement du refresh');
      
      // 1. Mettre à jour EntitySelector
      this.entitySelector.setStates(this.dataService.getStates());
      const tree = this.dataService.getTree();
      if (tree) {
        console.log('[App] Arborescence reçue');
        this.entitySelector.setData(tree);
      }

      // 2. Signaler au menu que les données sont prêtes
      this.menuSystem.onDataRefreshed();

      // 3. Initialiser tous les plans (un FloorPlanContainer par plan)
      await this.floorplanManager.initializeAllFloorplans();

      // 4. Restaurer le dernier plan affiché ou afficher le premier plan disponible
      const savedFloorplanId = this.getSavedFloorplanId();
      if (savedFloorplanId && this.dataService.getFloorplan(savedFloorplanId)) {
        console.log('[App] Restauration du plan sauvegardé:', savedFloorplanId);
        await this.floorplanManager.showFloorplan(savedFloorplanId);
      } else {
        const allFloorplans = this.dataService.getAllFloorplans();
        const defaultFloorplanId = Object.keys(allFloorplans)[0];
        if (defaultFloorplanId) {
          console.log('[App] Aucun plan sauvegarde, affichage du premier plan:', defaultFloorplanId);
          await this.floorplanManager.showFloorplan(defaultFloorplanId);
        } else {
          console.log('[App] Aucun plan disponible, rien a afficher');
        }
      }
      
      console.log('[App] refresh traité avec succès');
    } catch (error) {
      console.error('[App] Erreur lors du traitement du refresh:', error);
    }
  }

  // Récupérer le plan sauvegardé dans localStorage
  private getSavedFloorplanId(): string | null {
    try {
      const savedId = localStorage.getItem('currentFloorplanId');
      console.log('[App] Plan sauvegardé dans localStorage:', savedId);
      return savedId;
    } catch (e) {
      console.warn('[App] Impossible de lire localStorage:', e);
      return null;
    }
  }

  // Ajouter une entité au plan courant
  private async handleEntitySelect(entity_id: string): Promise<void> {
    try {
      console.log('[App] handleEntitySelect appelé pour:', entity_id);
      let state = this.dataService.getState(entity_id);
      console.log('[App] État récupéré depuis states:', state);
      
      // Si pas d'état, vérifier dans les entités
      if (!state) {
        const entity = this.dataService.getEntity(entity_id);
        console.log('[App] Entité trouvée:', entity);
        
        // Créer un état minimal si l'entité existe
        if (entity) {
          state = {
            entity_id: entity_id,
            state: 'unknown',
            attributes: {},
            last_changed: new Date().toISOString(),
            last_updated: new Date().toISOString()
          };
          console.log('[App] État créé par défaut:', state);
        }
      }
      
      if (state) {
        const currentFloorPlan = this.floorplanManager.getCurrentFloorPlan();
        console.log('[App] Plan courant:', currentFloorPlan ? 'trouvé' : 'NON TROUVÉ');
        
        if (currentFloorPlan) {
          const config = {
            entity_id: entity_id,
            type: entity_id.split('.')[0],
            position: { x: 0.5, y: 0.5 },
            state: state
          };
          console.log('[App] Création objet avec config:', config);
          currentFloorPlan.createObjectFromConfig(config);
          this.menuSystem.setEditMode(true);
          console.log('[App] Objet créé avec succès');
        } else {
          console.error('[App] ❌ Aucun plan courant');
        }
      } else {
        console.error('[App] ❌ Aucun état ni entité trouvé pour:', entity_id);
        console.log('[App] States disponibles:', Object.keys(this.dataService.getStates()));
      }
    } catch (error) {
      console.error('[App] ❌ Erreur lors de l\'ajout de l\'objet:', error);
    }
  }

  // Nettoyage
  cleanup(): void {
    // Désabonner les listeners
    if (this.unsubscribeRefresh) {
      this.unsubscribeRefresh();
      this.unsubscribeRefresh = null;
    }
    
    this.dataService.close();
    console.log('[App] Application fermée');
  }
}

// Utilitaire debounce
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Point d'entrée
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[App] Application démarrée');
    
    const app = new App();
    await app.initialize();
    
    (window as any).app = app;
    
    window.addEventListener('resize', debounce(() => {
      console.log('[App] Fenêtre redimensionnée');
    }, 200));
    
    window.addEventListener('beforeunload', () => {
      app.cleanup();
    });
    
  } catch (error) {
    console.error('[App] Erreur lors de l\'initialisation:', error);
  }
});