export class MenuSystem {
  private container: HTMLElement;
  private menuButton!: HTMLElement;
  private menuPanel!: HTMLElement;
  private isOpen: boolean = false;
  private isEditing: boolean = false;
  private onEditModeChange: (isEditing: boolean) => void;

  constructor(container: HTMLElement, onEditModeChange: (isEditing: boolean) => void) {
    this.container = container;
    this.onEditModeChange = onEditModeChange;
    this.createMenuButton();
    this.createMenuPanel();
  }

  private createMenuButton(): void {
    this.menuButton = document.createElement('button');
    this.menuButton.className = 'menu-button';
    this.menuButton.innerHTML = '☰';
    this.menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
    this.container.appendChild(this.menuButton);
  }

  private createMenuPanel(): void {
    this.menuPanel = document.createElement('div');
    this.menuPanel.className = 'menu-panel';
    this.menuPanel.style.display = 'none';
    this.menuPanel.innerHTML = `
      <button class="menu-item" data-action="toggle-edit">Mode Paramétrage</button>
      <button class="menu-item" data-action="upload">Upload Plan</button>
      <button class="menu-item" data-action="refresh">Refresh</button>
      <div class="settings-menu-section">
        <button class="menu-item" data-action="toggle-settings">Paramètres d'affichage</button>
        <div class="settings-container" style="display: none; margin-left: 15px; margin-top: 10px;">
          <div class="font-size-setting">
            <label for="plan-font-size">Taille police plan:</label>
            <select id="plan-font-size" class="font-size-select">
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div class="font-size-setting" style="margin-top: 10px;">
            <label for="context-font-size">Taille police contextuelle:</label>
            <select id="context-font-size" class="font-size-select">
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>
      <div class="edit-menu-section" style="display: none;">
        <div class="entity-selector-container"></div>
      </div>
    `;

    this.menuPanel.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('menu-item')) {
        const action = target.getAttribute('data-action');
        this.handleMenuAction(action);
        if (action !== 'toggle-edit' && action !== 'toggle-settings') {
          this.closeMenu();
        }
      }
    });

    // Ajouter les écouteurs pour les sélecteurs de taille de police
    this.setupFontSizeListeners();

    this.container.appendChild(this.menuPanel);
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.menuPanel.style.display = this.isOpen ? 'block' : 'none';
  }

  private closeMenu(): void {
    this.isOpen = false;
    this.menuPanel.style.display = 'none';
  }

  private handleMenuAction(action: string | null): void {
    if (!action) return;

    switch (action) {
      case 'toggle-edit':
        this.toggleEditMode();
        this.updateEditButtonLabel();
        this.closeMenu(); // Fermer le menu après le changement de mode
        break;
      case 'upload':
        this.triggerFileUpload();
        this.closeMenu();
        break;
      case 'refresh':
        this.refreshData();
        this.closeMenu();
        break;
      case 'toggle-settings':
        this.toggleSettings();
        break;
    }
  }

  private toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    this.onEditModeChange(this.isEditing);
    this.menuButton.classList.toggle('editing', this.isEditing);
    
    // Afficher/masquer la section d'édition
    const editMenuSection = this.menuPanel.querySelector('.edit-menu-section') as HTMLElement;
    if (editMenuSection) {
      editMenuSection.style.display = this.isEditing ? 'block' : 'none';
    }
  }

  private toggleSettings(): void {
    const settingsContainer = this.menuPanel.querySelector('.settings-container') as HTMLElement;
    if (settingsContainer) {
      const isVisible = settingsContainer.style.display === 'block';
      settingsContainer.style.display = isVisible ? 'none' : 'block';
    }
  }

  private setupFontSizeListeners(): void {
    // Charger les valeurs sauvegardées
    this.loadFontSizeSettings();

    // Écouter les changements sur les sélecteurs
    const planFontSizeSelect = this.menuPanel.querySelector('#plan-font-size') as HTMLSelectElement;
    const contextFontSizeSelect = this.menuPanel.querySelector('#context-font-size') as HTMLSelectElement;

    if (planFontSizeSelect) {
      planFontSizeSelect.addEventListener('change', () => {
        this.saveFontSizeSettings();
        this.applyFontSizeSettings();
      });
    }

    if (contextFontSizeSelect) {
      contextFontSizeSelect.addEventListener('change', () => {
        this.saveFontSizeSettings();
        this.applyFontSizeSettings();
      });
    }
  }

  private loadFontSizeSettings(): void {
    const planFontSize = localStorage.getItem('planFontSize') || 'medium';
    const contextFontSize = localStorage.getItem('contextFontSize') || 'medium';

    const planFontSizeSelect = this.menuPanel.querySelector('#plan-font-size') as HTMLSelectElement;
    const contextFontSizeSelect = this.menuPanel.querySelector('#context-font-size') as HTMLSelectElement;

    if (planFontSizeSelect) {
      planFontSizeSelect.value = planFontSize;
    }

    if (contextFontSizeSelect) {
      contextFontSizeSelect.value = contextFontSize;
    }

    // Appliquer les paramètres chargés
    this.applyFontSizeSettings();
  }

  private saveFontSizeSettings(): void {
    const planFontSizeSelect = this.menuPanel.querySelector('#plan-font-size') as HTMLSelectElement;
    const contextFontSizeSelect = this.menuPanel.querySelector('#context-font-size') as HTMLSelectElement;

    if (planFontSizeSelect) {
      localStorage.setItem('planFontSize', planFontSizeSelect.value);
    }

    if (contextFontSizeSelect) {
      localStorage.setItem('contextFontSize', contextFontSizeSelect.value);
    }
  }

  private applyFontSizeSettings(): void {
    const planFontSize = localStorage.getItem('planFontSize') || 'medium';
    const contextFontSize = localStorage.getItem('contextFontSize') || 'medium';

    // Appliquer la taille de police au plan
    const floorPlanContainer = document.querySelector('.floorplan-container') as HTMLElement;
    if (floorPlanContainer) {
      this.applyFontSizeToPlan(planFontSize);
    }

    // Appliquer la taille de police aux fenêtres contextuelles
    this.applyFontSizeToContextWindows(contextFontSize);
  }

  private applyFontSizeToPlan(fontSize: string): void {
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

    // Appliquer à tous les éléments du plan
    const planElements = document.querySelectorAll('.floorplan-container *');
    planElements.forEach(element => {
      (element as HTMLElement).style.fontSize = sizeValue;
    });
  }

  private applyFontSizeToContextWindows(fontSize: string): void {
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

    // Appliquer aux fenêtres contextuelles existantes
    const contextWindows = document.querySelectorAll('.context-window');
    contextWindows.forEach(window => {
      (window as HTMLElement).style.fontSize = sizeValue;
    });
  }

  private updateEditButtonLabel(): void {
    const editButton = this.menuPanel.querySelector('[data-action="toggle-edit"]') as HTMLButtonElement;
    if (editButton) {
      editButton.textContent = this.isEditing ? 'Mode Normal' : 'Mode Paramétrage';
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
        this.handleFileUpload(file);
      }
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
  }

  private handleFileUpload(file: File): void {
    // Géré par le composant parent
    console.log('File selected:', file.name);
  }

  private refreshData(): void {
    // Géré par le composant parent
    console.log('Refresh data');
  }

  // Méthode pour intégrer le sélecteur d'entités
  integrateEntitySelector(entitySelectorElement: HTMLElement): void {
    const container = this.menuPanel.querySelector('.entity-selector-container');
    if (container) {
      container.appendChild(entitySelectorElement);
    }
  }

  // Méthode pour obtenir le conteneur du sélecteur d'entités
  getEntitySelectorContainer(): HTMLElement | null {
    return this.menuPanel.querySelector('.entity-selector-container');
  }
}