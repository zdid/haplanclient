// Point d'entrée principal de l'application
import { FloorPlanContainer } from './components/FloorPlanContainer';
import { HAApiService } from './services/HAApiService';
import { MenuSystem } from './components/MenuSystem';
import { EntitySelector } from './components/EntitySelector';
import { AreaMappingService } from './services/AreaMappingService';

// Import du CSS
import './styles/styles.css';

// Configuration de l'application
const API_BASE_URL = 'http://localhost:3000'; // À adapter selon votre configuration
const WS_URL = 'ws://localhost:3000'; // À adapter selon votre configuration

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialiser le service de mapping d'areas
    const areaMappingService = AreaMappingService.getInstance();
    
    // Créer les conteneurs principaux
    const appContainer = document.getElementById('app') || document.body;
    
    // S'assurer que le conteneur parent prend toute la largeur et la hauteur
    if (appContainer === document.body) {
      document.documentElement.style.height = '100%';
      document.documentElement.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.width = '100%';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.boxSizing = 'border-box';
    } else {
      appContainer.style.height = '100vh';
      appContainer.style.width = '100vw';
      appContainer.style.overflow = 'hidden';
      appContainer.style.margin = '0';
      appContainer.style.padding = '0';
      appContainer.style.boxSizing = 'border-box';
    }
    
    const floorPlanContainer = document.createElement('div');
    floorPlanContainer.id = 'floorplan-container';
    floorPlanContainer.style.width = '100%';
    floorPlanContainer.style.height = '100%'; // Prendre toute la hauteur disponible
    floorPlanContainer.style.position = 'relative';
    floorPlanContainer.style.minHeight = '400px'; // Hauteur minimale pour éviter les problèmes sur petits écrans
    floorPlanContainer.style.minWidth = '100%'; // Largeur minimale pour garantir toute la largeur
    floorPlanContainer.style.overflow = 'hidden'; // Empêcher les barres de défilement
    floorPlanContainer.style.boxSizing = 'border-box'; // Inclure le padding dans les dimensions
    floorPlanContainer.style.display = 'block'; // Assurer un comportement de bloc
    floorPlanContainer.style.margin = '0'; // Supprimer toute marge
    floorPlanContainer.style.padding = '0'; // Supprimer tout padding
    
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';
    controlsContainer.style.marginTop = '20px';
    
    appContainer.appendChild(floorPlanContainer);
    appContainer.appendChild(controlsContainer);

    // Initialiser les services
    const apiService = new HAApiService(API_BASE_URL);
    
    // Initialiser le conteneur du plan
    const floorPlan = new FloorPlanContainer(floorPlanContainer, apiService, WS_URL);

    // Initialiser le système de menu
    const menuSystem = new MenuSystem(floorPlanContainer, async (isEditing: boolean) => {
      if (isEditing) {
        await floorPlan.enableEditMode();
      } else {
        floorPlan.disableEditMode();
      }
    });

    // Initialiser le sélecteur d'entités dans un conteneur temporaire
    const tempContainer = document.createElement('div');
    const entitySelector = new EntitySelector(tempContainer, async (entity_id: string) => {
      console.log('Entity selected:', entity_id);
      
      // Logique pour ajouter un nouvel objet au plan
      try {
        // Obtenir l'état de l'entité
        console.log('[TRACE] getData entity_id', entity_id)
        const data = (await apiService.getData()).data;
        //console.log('[TRACE] data.states', typeof data, Object.keys(data))
        const state = data.states[entity_id];
        
        if (state) {
          // Créer l'objet avec une position par défaut (centre du plan)
          const config = {
            entity_id: entity_id,
            type: entity_id.split('.')[0],
            position: { x: 0.5, y: 0.5 },
            state: state
          };
          
          // Utiliser l'objectManager via floorPlan
          floorPlan.createObjectFromConfig(config);
          console.log('Objet ajouté avec succès');
          
          // Mettre à jour le sélecteur d'entités avec les nouveaux objets existants
          floorPlan.updateEntitySelector(entitySelector);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'objet:', error);
      }
    });
    
    // Charger les données initiales pour le sélecteur d'entités
    try {
      const initialData = await apiService.getData();
      entitySelector.setStates(initialData.states);
    } catch (error) {
      console.error('Erreur lors du chargement initial des states:', error);
    }
    
    // Intégrer le sélecteur d'entités dans le menu
    menuSystem.integrateEntitySelector(entitySelector.getElement());

    // Initialiser l'application
    await floorPlan.initialize();

    // Charger les données pour le sélecteur d'entités
    try {
      const data = (await apiService.getData()).data;
      console.log('Données reçues du serveur:', data);
      
      if (data && data.tree) {
        console.log('Arborescence reçue:', data.tree);
        
        // Vérifier que l'arborescence contient des données valides
        const hasValidData = data.tree.some((area: any) => {
          return area && area.devices && area.devices.length > 0;
        });
        
        if (hasValidData) {
          entitySelector.setData(data.tree);
          
          // Initialiser le service de mapping d'areas
          areaMappingService.initialize(data.tree);
          console.log('Service de mapping d\'areas initialisé avec succès');
          
          console.log('Sélecteur d\'entités mis à jour avec succès');
        } else {
          console.warn('L\'arborescence ne contient pas de données valides');
        }
      } else {
        console.warn('Aucune arborescence (tree) trouvée dans les données');
      }
      
      // Mettre à jour la liste des objets existants via FloorPlanContainer
      floorPlan.updateEntitySelector(entitySelector);
    } catch (error) {
      console.error('Erreur lors du chargement des données pour le sélecteur:', error);
    }
    
    // Masquer le conteneur de contrôles puisque les combobox sont maintenant dans le menu
    controlsContainer.style.display = 'none';

    // Gérer l'upload de plan via le menu
    const originalHandleFileUpload = (menuSystem as any).handleFileUpload;
    (menuSystem as any).handleFileUpload = async (file: File) => {
      try {
        await floorPlan.uploadFloorplan(file);
        console.log('Floorplan uploaded successfully');
      } catch (error) {
        console.error('Error uploading floorplan:', error);
      }
    };

    console.log('Application initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Afficher un message d'erreur à l'utilisateur
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.style.padding = '20px';
    errorMessage.textContent = 'Failed to load application: ' + (error instanceof Error ? error.message : String(error));
    document.body.appendChild(errorMessage);
  }
});

// Gestion du redimensionnement
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

window.addEventListener('resize', debounce(() => {
  // Logique de redimensionnement si nécessaire
}, 200));

export {};