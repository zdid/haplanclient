import { ContextWindow, getFormattedWindowTitle, applyFontSizeToWindow } from './ContextWindow';
import { BaseEntity } from '../BaseEntity';
import { ContextWindowManager } from './ContextWindowManager';

export class ThermostatWindow implements ContextWindow {
  entity: BaseEntity;
  element: HTMLElement;
  isSimple: boolean = false;

  constructor(entity: BaseEntity) {
    this.entity = entity;
    this.element = this.render();
    
    // Vérifier les valeurs initiales
    console.log(`[TRACE] ThermostatWindow créé pour ${entity.getEntity_id()}`);
    console.log(`[TRACE] Valeurs initiales:`);
    console.log(`  - current_temperature: ${this.entity.getDisplayValue('current_temperature')}`);
    console.log(`  - target_temp: ${this.entity.getDisplayValue('target_temp')}`);
    console.log(`  - temperature_unit: ${this.entity.getDisplayValue('temperature_unit')}`);
  }

  render(): HTMLElement {
    console.log(`[TRACE] ThermostatWindow.render() appelé pour l'entité ${this.entity.getEntity_id()}`);
    console.log(`[TRACE] ThermostatWindow - Création des éléments de la fenêtre`);
    
    const window = document.createElement('div');
    window.className = 'context-window thermostat-window';
    
    // Appliquer les styles de base pour les fenêtres contextuelles
    window.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fond semi-transparent
    window.style.color = '#FFFFFF'; // Texte blanc
    window.style.padding = '15px';
    window.style.borderRadius = '8px';
    window.style.minWidth = '250px';
    window.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    
    console.log(`[TRACE] ThermostatWindow - Conteneur principal créé`);

    // Titre formaté avec area - entity name
    const title = document.createElement('h3');
    title.textContent = getFormattedWindowTitle(this.entity);
    title.style.marginTop = '0';
    title.style.color = '#FFFFFF';
    title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    title.style.paddingBottom = '10px';
    window.appendChild(title);
    
    // Appliquer la taille de police
    applyFontSizeToWindow(window);

    // Affichage de la température actuelle uniquement
    const currentTemp = document.createElement('div');
    currentTemp.className = 'thermostat-current';
    currentTemp.style.marginBottom = '15px';
    currentTemp.style.padding = '10px';
    currentTemp.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    currentTemp.style.borderRadius = '5px';
    currentTemp.innerHTML = `
      <span style="color: #aaa;">Température actuelle:</span>
      <strong class="current-temp-value" style="color: #000; font-size: 1.2em;">${this.entity.getDisplayValue('current_temperature') || 'N/A'}${this.entity.getDisplayValue('temperature_unit') || '°C'}</strong>
    `;
    window.appendChild(currentTemp);

    // Contrôle de température
    

    // Libellé "Température cible" centré
    const targetTempLabel = document.createElement('div');
    targetTempLabel.style.textAlign = 'center';
    targetTempLabel.style.margin = '10px 0';
    targetTempLabel.style.fontWeight = 'bold';
    targetTempLabel.textContent = 'Température cible';
    window.appendChild(targetTempLabel);

    // Contrôles de température sur une seule ligne
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.marginBottom = '15px';

    // Bouton -1°C
    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '-1°C';
    decreaseBtn.addEventListener('click', (e) => {
      console.log(`[TRACE] ThermostatWindow - Bouton -1°C cliqué`);
      e.stopPropagation();
      const current = parseInt(this.entity.getDisplayValue('target_temp')?.toString() || '20');
      console.log(`[TRACE] ThermostatWindow - Température actuelle: ${current}, nouvelle cible: ${current - 1}`);
      this.onAction('set_temperature', (current - 1).toString());
    });
    controlsContainer.appendChild(decreaseBtn);

    // Champ de saisie de température
    const tempInput = document.createElement('input');
    tempInput.type = 'number';
    tempInput.min = '5';
    tempInput.max = '35';
    tempInput.value = this.entity.getDisplayValue('target_temp')?.toString() || '20';
    tempInput.style.width = '60px';
    tempInput.style.textAlign = 'center';
    tempInput.addEventListener('change', (e) => {
      console.log(`[TRACE] ThermostatWindow - Changement de température détecté`);
      e.stopPropagation();
      console.log(`[TRACE] ThermostatWindow - Nouvelle température: ${(e.target as HTMLInputElement).value}`);
      this.onAction('set_temperature', (e.target as HTMLInputElement).value);
    });
    controlsContainer.appendChild(tempInput);

    // Unité de température
    const tempUnit = document.createElement('span');
    tempUnit.textContent = '°C';
    controlsContainer.appendChild(tempUnit);

    // Bouton +1°C
    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+1°C';
    increaseBtn.addEventListener('click', (e) => {
      console.log(`[TRACE] ThermostatWindow - Bouton +1°C cliqué`);
      e.stopPropagation();
      const current = parseInt(this.entity.getDisplayValue('target_temp')?.toString() || '20');
      console.log(`[TRACE] ThermostatWindow - Température actuelle: ${current}, nouvelle cible: ${current + 1}`);
      this.onAction('set_temperature', (current + 1).toString());
    });
    controlsContainer.appendChild(increaseBtn);

    window.appendChild(controlsContainer);

    return window;
  }

  onAction(action: string, value?: any): void {
    console.log(`[TRACE] ThermostatWindow.onAction() appelé avec action: ${action}, valeur: ${value}`);
    
    switch (action) {
      case 'set_temperature':
        console.log(`[TRACE] ThermostatWindow - Appel de entity.handleAction('set_temperature', ${value})`);
        // Utiliser handleAction au lieu de sendCommand pour respecter l'encapsulation
        this.entity.handleAction('set_temperature', value);
        break;
    }
    
    console.log(`[TRACE] ThermostatWindow - Mise à jour de l'affichage`);
    this.updateDisplay();
  }

  updateDisplay(): void {
    // Mettre à jour la température actuelle
    const currentTempElement = this.element.querySelector('.current-temp-value');
    if (currentTempElement) {
      const currentTempValue = this.entity.getDisplayValue('current_temperature');
      const tempUnit = this.entity.getDisplayValue('temperature_unit') || '°C';
      currentTempElement.textContent = `${currentTempValue || 'N/A'}${tempUnit}`;
    }
    
    // Mettre à jour le champ de température
    const tempInput = this.element.querySelector('input[type="number"]') as HTMLInputElement;
    if (tempInput) {
      tempInput.value = this.entity.getDisplayValue('target_temp')?.toString() || '20';
    }
  }

  close(): void {
    // Fermer la fenêtre via le ContextWindowManager
    const windowManager = ContextWindowManager.getInstance();
    windowManager.hideWindow();
  }
}