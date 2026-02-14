import { DataService } from "../services/DataService";
import { PreferencesManager } from '../managers/PreferencesManager';

export class MenuSystem {
  private dataService: DataService;
  private container: HTMLElement;
  private topBarContainer!: HTMLElement;
  private floorplanSelector!: HTMLSelectElement;
  private quickActionsContainer!: HTMLElement;
  private fontQuickLabel!: HTMLElement;
  private entitySelectorPanel!: HTMLElement;
  private fontSelectorPanel!: HTMLElement;
  private isEditing: boolean = false;
  private onEditModeChange: (isEditing: boolean) => void;
  private preferencesManager: PreferencesManager;
  private onPlanScaleChange: ((scale: number) => void) | null = null;
  private onFloorplanChange: ((floorplanId: string) => Promise<void> | void) | null = null;
  private hoveredEntityDisplay!: HTMLElement;
  private overlay!: HTMLElement;

  constructor(dataService: DataService, container: HTMLElement, onEditModeChange: (isEditing: boolean) => void, preferencesManager: PreferencesManager) {
    this.dataService = dataService;
    this.container = container;
    this.onEditModeChange = onEditModeChange;
    this.preferencesManager = preferencesManager;
    this.createOverlay();
    this.createTopBar();
    this.createQuickActions();
    this.createFloorplanSelectorDisplay();
    this.createEntitySelectorPanel();
    this.createFontsPanel();
  }
  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'isoverlay';
    this.overlay.id = 'context-windows-overlay';
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    this.overlay.style.display = 'none';
    this.overlay.style.zIndex = '1000';
    this.container.appendChild(this.overlay)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        console.log('[MenuSystem] Clic sur l\'overlay, fermeture des panneaux de menus');
        e.stopPropagation();
        this.overlay.style.display = 'none';
        this.overlay.querySelectorAll('.entity-selector-panel, .font-selector-panel').forEach(panel => {
          (panel as HTMLElement).style.display = 'none';
       });
      }
    });
  }
  private createTopBar(): void {
    this.topBarContainer = document.createElement('div');
    this.topBarContainer.className = 'top-bar';
    this.container.appendChild(this.topBarContainer);
  }

  private createQuickActions(): void {
    this.quickActionsContainer = document.createElement('div');
    this.quickActionsContainer.className = 'menu-quick-actions';

    this.quickActionsContainer.innerHTML = `
      <button class="menu-quick-action" data-action="toggle-select-entity" title="Entitées">
        <i class="fas fa-sliders-h"></i>
      </button>
      <span class="menu-quick-action menu-quick-indicator" data-action="toggle-edit" title="Déplacement" tabindex="0">
        <i class="fas fa-arrows-alt"></i>
      </span>
      <button class="menu-quick-action menu-quick-font" data-action="font-size" title="Police">
        <i class="fas fa-font"></i>
        <span class="menu-quick-text" aria-hidden="true"></span>
      </button>
      <button class="menu-quick-action" data-action="upload" title="Upload Plan">
        <i class="fas fa-upload"></i>
      </button>
      <button class="menu-quick-action" data-action="refresh" title="Refresh">
        <i class="fas fa-sync-alt"></i>
      </button>
    `;

    this.fontQuickLabel = this.quickActionsContainer.querySelector('.menu-quick-text') as HTMLElement;

    // Gestionnaire pour les boutons d'action rapides
    this.quickActionsContainer.addEventListener('click', (e) => {
      if(this.isEditing) {
        this.toggleEditMode();
      }
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action') || target.closest('.menu-quick-action')?.getAttribute('data-action');
      console.log(`[MenuSystem] target:`, target, `action:`, action);
      this.quickActionsClickHandler(action||'');
    });
      // Mise à jour de la couleur de l'icône au démarrage
    this.updateMoveIconHighlight();

    this.topBarContainer.appendChild(this.quickActionsContainer);
    this.updateFontQuickIndicator();
  }

  quickActionsClickHandler(action: string): void {
    switch (action) {
      case 'toggle-edit':
        this.toggleEditMode();
        break;
      case 'toggle-select-entity': 
        this.toggleEntitySelectorPanel() 
        break; 
      case 'font-size': 
        this.toogleFontSizeMenu();
          break; 
      case 'upload':
        this.triggerFileUpload(); 
        break; 
      case 'refresh': 
        this.refreshData(); 
        break; 
    }  
  };

  // Méthode pour coloriser l'arrière-plan de l'icône de déplacement selon le mode édition
  private updateMoveIconHighlight(): void {
    const moveIcon = this.quickActionsContainer.querySelector('.menu-quick-indicator') as HTMLElement | null;
    if (moveIcon) {
      if (this.isEditing) {
        moveIcon.style.background = '#ffe082'; // Jaune clair, modifiable selon charte
        moveIcon.style.borderRadius = '6px';
        moveIcon.style.transition = 'background 0.2s';
      } else {
        moveIcon.style.background = 'transparent';
      }
    }
  }
  

  private createFloorplanSelectorDisplay(): void {
    const selectorWrapper = document.createElement('div');
    selectorWrapper.className = 'floorplan-selector-inline';
    selectorWrapper.style.cssText = `
      border-radius: 4px;
      padding: 0;
    `;

    this.floorplanSelector = document.createElement('select');
    this.floorplanSelector.id = 'floorplan-selector';
    this.floorplanSelector.className = 'floorplan-select';
    this.floorplanSelector.style.cssText = `
      background: transparent;
      color: #444;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 4px;
      padding: 3px 6px;
      min-width: 140px;
      font-size: 13px;
    `;
    this.floorplanSelector.disabled = true;
    this.floorplanSelector.innerHTML = '<option value="loading">En attente des donnees...</option>';

    selectorWrapper.appendChild(this.floorplanSelector);
    this.topBarContainer.appendChild(selectorWrapper);

    this.hoveredEntityDisplay = document.createElement('div');
    this.hoveredEntityDisplay.className = 'floorplan-entity-display';
    this.hoveredEntityDisplay.style.cssText = `
      color: #444;
      font-size: 13px;
      font-weight: normal;
      padding: 0;
      border-radius: 4px;
      max-width: 50vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    this.hoveredEntityDisplay.textContent = '';
    this.topBarContainer.appendChild(this.hoveredEntityDisplay);
  }

  private createFontsPanel(): void {
    this.fontSelectorPanel = document.createElement('div');
    this.fontSelectorPanel.className = 'font-selector-panel';
    this.fontSelectorPanel.style.display = 'none';
    this.fontSelectorPanel.innerHTML = `
      <div class="settings-fonts-section">
        <div class="font-size-setting" data-target="plan">
          <div class="font-size-buttons" aria-label="Taille police plan">
            <button class="font-size-button" data-target="plan" data-size="xs" aria-label="Plan tres petite">
              <i class="fas fa-font font-size-xs"></i>
            </button>
            <button class="font-size-button" data-target="plan" data-size="small" aria-label="Plan petite">
              <i class="fas fa-font font-size-sm"></i>
            </button>
            <button class="font-size-button" data-target="plan" data-size="medium" aria-label="Plan moyenne">
              <i class="fas fa-font font-size-md"></i>
            </button>
            <button class="font-size-button" data-target="plan" data-size="large" aria-label="Plan grande">
              <i class="fas fa-font font-size-lg"></i>
            </button>
            <button class="font-size-button" data-target="plan" data-size="xl" aria-label="Plan tres grande">
              <i class="fas fa-font font-size-xl"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    this.fontSelectorPanel.style.cssText = `
        position: absolute;
        top: 60px;
        left: 60px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        padding: 10px;
        z-index: 100;
        display: none;
        min-width: 260px;
      `;
    // Ajouter les écouteurs pour les boutons de taille de police
    this.setupFontSizeButtons();

    // ❌ NE PAS appeler setupFloorplanSelector() ici
    // ✅ Ce sera appelé dans onDataRefreshed() après le refresh

    this.overlay.appendChild(this.fontSelectorPanel);
  }

  private toggleEditMode(): void {
    this.setEditMode(!this.isEditing);
  }
  
  toogleFontSizeMenu() {  
    console.log('[MenuSystem] toggleFontSizeMenu appelé, fontSelectorPanel:', this.fontSelectorPanel.style.display);
    let newStyle = 'none'
    if (this.fontSelectorPanel) {
      if(this.fontSelectorPanel.style.display === 'none') {
        newStyle = 'block';
        this.openFontSettingsForActiveContext(); 
      } 
      this.fontSelectorPanel.style.display = newStyle;
      const overlayContainer : HTMLElement | null = this.fontSelectorPanel.closest('.isoverlay'); 
      if(overlayContainer) {
        overlayContainer.style.display = newStyle;
      }
    }
  }

  public setEditMode(isEditing: boolean): void {
    if (this.isEditing === isEditing) {
      return;
    }

    this.isEditing = isEditing;
    this.onEditModeChange(this.isEditing);
    //this.toggleEntitySelectorPanel();
    this.updateMoveIconHighlight();
  }

private createEntitySelectorPanel(): void {
    this.entitySelectorPanel = document.createElement('div');
    this.entitySelectorPanel.className = 'entity-selector-panel';
    this.entitySelectorPanel.style.cssText = `
      position: absolute;
      top: 60px;
      left: 60px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      padding: 10px;
      z-index: 100;
      display: none;
      min-width: 260px;
    `;

    const entitySelectorContainer = document.createElement('div');
    entitySelectorContainer.className = 'entity-selector-container';
    this.entitySelectorPanel.appendChild(entitySelectorContainer);
    this.overlay.appendChild(this.entitySelectorPanel);
  }

  private toggleEntitySelectorPanel(): void {
    let newStyle = 'none'
    if (this.entitySelectorPanel) {
      if(this.entitySelectorPanel.style.display === 'none') {
        newStyle = 'block';
      } 
      this.entitySelectorPanel.style.display = newStyle;
      const overlayContainer : HTMLElement | null = this.entitySelectorPanel.closest('.isoverlay'); 
      if(overlayContainer) {
        overlayContainer.style.display = newStyle;
      }
    }
  }

  private setupFloorplanSelector(): void {
    const floorplanSelector = this.floorplanSelector;
    
    if (floorplanSelector) {
      // Écouter les changements de sélection
      floorplanSelector.addEventListener('change', async () => {
        const selectedFloorplanId = floorplanSelector.value;
        if (selectedFloorplanId && selectedFloorplanId !== 'loading') {
          console.log(`[MenuSystem] Changement de plan sélectionné vers ${selectedFloorplanId}`);
          if(this.isEditing){
            this.toggleEditMode();
          }
          try {
            // Appeler la méthode de changement de plan si elle existe
            if (this.onFloorplanChange) {
              await this.onFloorplanChange(selectedFloorplanId);
            } else {
              console.log(`[MenuSystem] Méthode onFloorplanChange non définie`);
            }
          } catch (error) {
            console.error(`[MenuSystem] Erreur lors du changement de plan`, error);
            alert('Erreur lors du changement de plan: ' + (error instanceof Error ? error.message : String(error)));
          }
        }
      });
    }
  }

  private async updateFloorplanSelector(): Promise<void> {
    const floorplanSelector = this.floorplanSelector;
    
    if (floorplanSelector) {
      try {
        // Récupérer les plans depuis le DataService (objet, pas tableau)
        const floorplans = this.dataService.getAllFloorplans();
        console.log("floorplans all:", floorplans);
        const currentFloorplanId = this.dataService.getCurrentFloorplanId();
        
        const floorplanIds = Object.keys(floorplans);
        console.log(`[MenuSystem] updateFloorplanSelector: ${floorplanIds.length} plans disponibles, courant: ${currentFloorplanId}`);
        
        // Effacer les options existantes
        floorplanSelector.innerHTML = '';
        
        if (floorplanIds.length === 0) {
          floorplanSelector.innerHTML = '<option value="">Aucun plan disponible</option>';
          floorplanSelector.disabled = true;
          return;
        }
        
        // Ajouter chaque plan comme option
        floorplanIds.forEach((floorplanId: string) => {
          const option = document.createElement('option');
          option.value = floorplanId;
          option.textContent = floorplanId; // Le nom est la clé
          
          if (floorplanId === currentFloorplanId) {
            option.selected = true;
          }
          
          floorplanSelector.appendChild(option);
        });
        
        floorplanSelector.disabled = false;
        
      } catch (error) {
        console.error(`[MenuSystem] Erreur lors de la récupération des plans`, error);
        floorplanSelector.innerHTML = '<option value="">Erreur de chargement</option>';
      }
    }
  }


  private setupFontSizeButtons(): void {
    this.loadFontSizeSettings();

    this.fontSelectorPanel.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('.font-size-button') as HTMLElement | null;
      if (!target) {
        return;
      }

      const fontTarget = target.getAttribute('data-target');
      const size = target.getAttribute('data-size');
      if (!fontTarget || !size) {
        return;
      }

      if (fontTarget === 'plan') {
        this.setFontSize(size);
      }
    });
  }

  private loadFontSizeSettings(): void {
    console.log('[TRACE] MenuSystem - Chargement des paramètres de taille de police depuis localStorage');

    const planFontSize = localStorage.getItem('planFontSize') || 'xs';
    console.log('[TRACE] MenuSystem - Taille police plan chargée:', planFontSize);

    this.updateFontSizeButtons(planFontSize);
    console.log('[TRACE] MenuSystem - Application des paramètres de taille de police');
    this.applyFontSizeSettings();
  }

  private setFontSize(size: string): void {
    localStorage.setItem('planFontSize', size);
    console.log('[TRACE] MenuSystem - Taille police plan sauvegardée:', size);

    const planFontSize = localStorage.getItem('planFontSize') || 'xs';
    this.updateFontSizeButtons(planFontSize);
    this.applyFontSizeSettings();
  }

  private updateFontSizeButtons(planSize: string): void {
    const buttons = this.fontSelectorPanel.querySelectorAll('.font-size-button');
    buttons.forEach((button) => {
      const target = button.getAttribute('data-target');
      const size = button.getAttribute('data-size');
      const isActive = target === 'plan' && size === planSize;
      button.classList.toggle('active', isActive);
    });
  }

  private applyFontSizeSettings(): void {
    console.log('[TRACE] MenuSystem - Application des paramètres de taille de police');
    
    const planFontSize = localStorage.getItem('planFontSize') || 'xs';
    console.log('[TRACE] MenuSystem - Application taille police plan:', planFontSize);

    // Appliquer la taille de police au plan
    const floorPlanContainer = document.querySelector('.floorplan-container') as HTMLElement;
    if (floorPlanContainer) {
      this.applyFontSizeToPlan(planFontSize);
    }

    // Appliquer la taille de police aux fenêtres contextuelles (fixe)
    this.applyFontSizeToContextWindows('medium');
    this.updateFontQuickIndicator();
  }

  private applyFontSizeToPlan(fontSize: string): void {
    console.log('[TRACE] MenuSystem - Application taille police plan:', fontSize);
    
    let sizeValue = '14px';
    let scaleValue = 1;
    switch (fontSize) {
      case 'xs':
        sizeValue = '14px';
        scaleValue = 1;
        break;
      case 'small':
        sizeValue = '16px';
        scaleValue = 16 / 14;
        break;
      case 'medium':
        sizeValue = '18px';
        scaleValue = 18 / 14;
        break;
      case 'large':
        sizeValue = '20px';
        scaleValue = 20 / 14;
        break;
      case 'xl':
        sizeValue = '22px';
        scaleValue = 22 / 14;
        break;
    }

    console.log('[TRACE] MenuSystem - Valeur de taille appliquée:', sizeValue);

    document.documentElement.style.setProperty('--plan-scale', scaleValue.toString());
    if (this.onPlanScaleChange) {
      this.onPlanScaleChange(scaleValue);
    }

    // Appliquer à tous les éléments du plan
    const planElements = document.querySelectorAll('.floorplan-container *');
    planElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      if (htmlElement.closest('.ha-object')) {
        return;
      }
      htmlElement.style.fontSize = sizeValue;
    });
    
    console.log('[TRACE] MenuSystem - Taille police appliquée à', planElements.length, 'éléments du plan');
  }

  private applyFontSizeToContextWindows(fontSize: string): void {
    console.log('[TRACE] MenuSystem - Application taille police contextuelle:', fontSize);
    
    let sizeValue = '14px';
    switch (fontSize) {
      case 'small':
        sizeValue = '12px';
        break;
      case 'medium':
        sizeValue = '14px';
        break;
      case 'large':
        sizeValue = '16px';
        break;
    }

    console.log('[TRACE] MenuSystem - Valeur de taille contextuelle appliquée:', sizeValue);

    // Appliquer aux fenêtres contextuelles existantes
    const contextWindows = document.querySelectorAll('.context-window');
    contextWindows.forEach(window => {
      (window as HTMLElement).style.fontSize = sizeValue;
    });
    
    console.log('[TRACE] MenuSystem - Taille police appliquée à', contextWindows.length, 'fenêtres contextuelles');
  }

  private openFontSettingsForActiveContext(): void {
    console.log('[MenuSystem] Ouverture du menu de paramètres de police pour le contexte actif');
    const targetButton = this.fontSelectorPanel.querySelector('.font-size-button[data-target="plan"]') as HTMLButtonElement | null;

    // if (!this.isOpen) {
    //   this.toggleMenu();
    // }

    if (targetButton) {
      targetButton.focus();
    }
  }

  private updateFontQuickIndicator(): void {
    if (!this.fontQuickLabel) {
      return;
    }

    const sizeValue = localStorage.getItem('planFontSize') || 'xs';
    const label = `Plan: ${this.getPlanFontLabel(sizeValue)}`;

    this.fontQuickLabel.textContent = label;
  }

  private getPlanFontLabel(value: string): string {
    switch (value) {
      case 'xs':
        return 'Tres petite';
      case 'small':
        return 'Petite';
      case 'medium':
        return 'Moyenne';
      case 'large':
        return 'Grande';
      case 'xl':
        return 'Tres grande';
      default:
        return value;
    }
  }


  public setPlanScaleChangeCallback(callback: (scale: number) => void): void {
    this.onPlanScaleChange = callback;
  }

  public notifyPlanScaleFromStorage(): void {
    const planFontSize = localStorage.getItem('planFontSize') || 'xs';
    let scaleValue = 1;
    switch (planFontSize) {
      case 'xs':
        scaleValue = 1;
        break;
      case 'small':
        scaleValue = 16 / 14;
        break;
      case 'medium':
        scaleValue = 18 / 14;
        break;
      case 'large':
        scaleValue = 20 / 14;
        break;
      case 'xl':
        scaleValue = 22 / 14;
        break;
    }
    document.documentElement.style.setProperty('--plan-scale', scaleValue.toString());
    if (this.onPlanScaleChange) {
      this.onPlanScaleChange(scaleValue);
    }
  }

  private triggerFileUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.showFloorplanNameDialog(file);
      }
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
  }

  private showFloorplanNameDialog(file: File): void {
    // Créer un dialogue modal pour saisir le nom du plan
    const dialog = document.createElement('div');
    dialog.className = 'floorplan-name-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';
    dialog.style.zIndex = '1000';

    const dialogContent = document.createElement('div');
    dialogContent.style.backgroundColor = 'white';
    dialogContent.style.padding = '20px';
    dialogContent.style.borderRadius = '8px';
    dialogContent.style.width = '400px';
    dialogContent.style.maxWidth = '90%';

    dialogContent.innerHTML = `
      <h3 style="margin-top: 0;">Nom du plan</h3>
      <p>Veuillez entrer un nom pour ce plan d'étage :</p>
      <input type="text" id="floorplan-name-input" 
             style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;"
             placeholder="Ex: Rez-de-chaussée, Étage, Garage...">
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="floorplan-name-cancel" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">Annuler</button>
        <button id="floorplan-name-submit" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Valider</button>
      </div>
    `;

    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);

    // Focus sur le champ de saisie
    const nameInput = dialogContent.querySelector('#floorplan-name-input') as HTMLInputElement;
    nameInput.focus();

    // Gestion des boutons
    const cancelButton = dialogContent.querySelector('#floorplan-name-cancel') as HTMLButtonElement;
    const submitButton = dialogContent.querySelector('#floorplan-name-submit') as HTMLButtonElement;

    const closeDialog = () => {
      document.body.removeChild(dialog);
    };

    cancelButton.addEventListener('click', closeDialog);

    submitButton.addEventListener('click', () => {
      const floorplanName = nameInput.value.trim();
      if (floorplanName) {
        this.handleFileUploadWithName(file, floorplanName);
        closeDialog();
      } else {
        alert('Veuillez entrer un nom pour le plan');
        nameInput.focus();
      }
    });

    // Permettre de valider avec la touche Entrée
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const floorplanName = nameInput.value.trim();
        if (floorplanName) {
          this.handleFileUploadWithName(file, floorplanName);
          closeDialog();
        } else {
          alert('Veuillez entrer un nom pour le plan');
        }
      }
    });
  }

  private handleFileUploadWithName(file: File, name: string): void {
    console.log('Upload plan:', file.name, 'avec le nom:', name);
    
    this.dataService.uploadFloorplan(file, name)
      // .then((result: any) => {
      //   console.log('Upload plan réussi:', result);
      //   alert(`Plan "${name}" uploadé avec succès`);
      // })
      // .catch((error) => {
      //   console.error('Erreur upload plan:', error);
      //   alert(`Erreur lors de l'upload du plan: ${error.message}`);
      // });
  }

  private handleFileUpload(file: File): void {
    console.log('File selected:', file.name);
  }

  private refreshData(): void {
    // Géré par le composant parent
    console.log('Refresh data');
    this.dataService.refresh();
  }

  // Méthode pour intégrer le sélecteur d'entités
  integrateEntitySelector(entitySelectorElement: HTMLElement): void {
    const container = this.entitySelectorPanel?.querySelector('.entity-selector-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(entitySelectorElement);
    }
  }

  // Méthode pour obtenir le conteneur du sélecteur d'entités
  getEntitySelectorContainer(): HTMLElement | null {
    return this.entitySelectorPanel?.querySelector('.entity-selector-container') || null;
  }
 
  // Méthode pour signaler un refresh de données
  public onDataRefreshed(): void {
    console.log('[MenuSystem] Signal de refresh reçu - Initialisation du sélecteur de plans');
    
    // Configurer le sélecteur de plans UNIQUEMENT après le refresh
    this.setupFloorplanSelector();
    
    // Mettre à jour le sélecteur avec les plans reçus
    this.updateFloorplanSelector();
  }

  // // Méthode pour afficher la liste des plans (appelée depuis le menu)
  // private showPlansList(): void {
  //   console.log('[MenuSystem] Affichage de la liste des plans');
  //   // Déclencher l'événement pour afficher le sélecteur de plans
  //   if (typeof (this as any).onShowPlansList === 'function') {
  //     (this as any).onShowPlansList();
  //   }
  // }

  // Méthode pour enregistrer le callback d'affichage de la liste
  public setShowPlansListCallback(callback: () => void): void {
    (this as any).onShowPlansList = callback;
  }

  public setFloorplanChangeCallback(callback: (floorplanId: string) => Promise<void> | void): void {
    this.onFloorplanChange = callback;
  }

  // Méthode pour mettre à jour le nom du plan affiché
  public setCurrentFloorplanName(floorplanId: string): void {
    if (this.floorplanSelector && floorplanId) {
      const optionExists = Array.from(this.floorplanSelector.options).some(
        (option) => option.value === floorplanId
      );
      if (optionExists) {
        this.floorplanSelector.value = floorplanId;
      }
      console.log('[MenuSystem] Plan courant mis a jour:', floorplanId);
    }
  }

  public setHoveredEntityLabel(label: string): void {
    if (this.hoveredEntityDisplay) {
      this.hoveredEntityDisplay.textContent = label;
    }
  }
}