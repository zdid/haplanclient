// Fenêtre contextuelle de base pour les objets de type switch
import { ContextWindow, getFormattedWindowTitle, applyFontSizeToWindow } from './ContextWindow';
import { BaseEntity } from '../BaseEntity';

/**
 * Fenêtre contextuelle générique pour les objets de type switch
 * Peut être utilisée pour tous les types de switches (de base ou hérités)
 */
export class SwitchContextWindow implements ContextWindow {
  entity: BaseEntity;
  element: HTMLElement;
  
  constructor(entity: BaseEntity) {
    this.entity = entity;
    this.element = this.render();
  }

  render(): HTMLElement {
    const window = document.createElement('div');
    window.className = 'context-window switch-context-window';
    window.style.minWidth = '250px';
    window.style.padding = '15px';
    window.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    window.style.borderRadius = '8px';
    window.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

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

    // État actuel
    const statusDisplay = document.createElement('div');
    statusDisplay.style.margin = '15px 0';
    statusDisplay.style.padding = '10px';
    statusDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    statusDisplay.style.borderRadius = '5px';
    statusDisplay.style.textAlign = 'center';
    
    const statusValue = document.createElement('strong');
    statusValue.style.fontSize = '1.2em';
    statusValue.style.color = this.entity.getDisplayValue('status') === 'ON' ? '#4CAF50' : '#F44336';
    statusValue.textContent = this.entity.getDisplayValue('status') || 'OFF';
    
    statusDisplay.appendChild(statusValue);
    window.appendChild(statusDisplay);

    // Contrôles
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.gap = '15px';
    controlsContainer.style.marginTop = '20px';

    // Bouton Éteindre
    const offBtn = document.createElement('button');
    offBtn.textContent = 'Éteindre';
    offBtn.style.padding = '8px 16px';
    offBtn.style.backgroundColor = '#F44336';
    offBtn.style.color = 'white';
    offBtn.style.border = 'none';
    offBtn.style.borderRadius = '4px';
    offBtn.style.cursor = 'pointer';
    offBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onAction('turn_off');
    });
    controlsContainer.appendChild(offBtn);

    // Bouton Allumer
    const onBtn = document.createElement('button');
    onBtn.textContent = 'Allumer';
    onBtn.style.padding = '8px 16px';
    onBtn.style.backgroundColor = '#4CAF50';
    onBtn.style.color = 'white';
    onBtn.style.border = 'none';
    onBtn.style.borderRadius = '4px';
    onBtn.style.cursor = 'pointer';
    onBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onAction('turn_on');
    });
    controlsContainer.appendChild(onBtn);

    window.appendChild(controlsContainer);

    return window;
  }

  onAction(action: string): void {
    this.entity.handleAction(action);
  }

  updateDisplay(): void {
    // Mettre à jour l'état
    const statusValue = this.element.querySelector('strong');
    if (statusValue) {
      const status = this.entity.getDisplayValue('status');
      statusValue.textContent = status || 'OFF';
      statusValue.style.color = status === 'ON' ? '#4CAF50' : '#F44336';
    }
  }

  close(): void {
    const windowManager = ContextWindowManager.getInstance();
    windowManager.hideWindow();
  }
}
