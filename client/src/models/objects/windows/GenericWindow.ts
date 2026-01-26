import { ContextWindow, getFormattedWindowTitle, applyFontSizeToWindow } from './ContextWindow';
import { BaseEntity } from '../BaseEntity';

export class GenericWindow implements ContextWindow {
  entity: BaseEntity;
  element: HTMLElement;
  isSimple: boolean = false;

  constructor(entity: BaseEntity) {
    this.entity = entity;
    this.element = this.render();
  }

  render(): HTMLElement {
    const window = document.createElement('div');
    window.className = 'context-window generic-window';
    
    // Appliquer les styles de base pour les fenêtres contextuelles
    window.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fond semi-transparent
    window.style.color = '#FFFFFF'; // Texte blanc
    window.style.padding = '15px';
    window.style.borderRadius = '8px';
    window.style.minWidth = '250px';
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

    // Affichage des valeurs
    const valuesContainer = document.createElement('div');
    valuesContainer.className = 'entity-values';

    // Parcourir toutes les valeurs affichables
    const displayValues = this.entity['displayValues'] as Map<string, any>;
    if (displayValues) {
      displayValues.forEach((value, key) => {
        const valueRow = document.createElement('div');
        valueRow.className = 'value-row';
        
        const valueLabel = document.createElement('span');
        valueLabel.className = 'value-label';
        valueLabel.textContent = `${key}:`;
        valueRow.appendChild(valueLabel);
        
        const valueContent = document.createElement('span');
        valueContent.className = 'value-content';
        valueContent.textContent = value.toString();
        valueRow.appendChild(valueContent);
        
        valuesContainer.appendChild(valueRow);
      });
    }

    window.appendChild(valuesContainer);

    return window;
  }

  onAction(action: string, value?: any): void {
    // Pas d'actions spécifiques pour les entités génériques
    console.log(`Action ${action} reçue pour l'entité générique`);
  }

  updateDisplay(): void {
    // Mettre à jour les valeurs affichées
    const displayValues = this.entity['displayValues'] as Map<string, any>;
    if (!displayValues) return;
    
    const valueRows = this.element.querySelectorAll('.value-row');
    valueRows.forEach(row => row.remove());
    
    const valuesContainer = this.element.querySelector('.entity-values');
    if (valuesContainer) {
      displayValues.forEach((value, key) => {
        const valueRow = document.createElement('div');
        valueRow.className = 'value-row';
        valueRow.style.margin = '8px 0';
        valueRow.style.padding = '5px';
        valueRow.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        valueRow.style.borderRadius = '4px';
        
        const valueLabel = document.createElement('span');
        valueLabel.className = 'value-label';
        valueLabel.textContent = `${key}:`;
        valueLabel.style.fontWeight = 'bold';
        valueLabel.style.color = '#CCCCCC';
        valueRow.appendChild(valueLabel);
        
        const valueContent = document.createElement('span');
        valueContent.className = 'value-content';
        valueContent.textContent = value.toString();
        valueContent.style.marginLeft = '10px';
        valueContent.style.color = '#FFFFFF';
        valueRow.appendChild(valueContent);
        
        valuesContainer.appendChild(valueRow);
      });
    }
  }

  close(): void {
    // Rien à faire ici
  }
}