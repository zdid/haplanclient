// Classe pour les radiateurs
import { EnhancedSwitchObject } from './EnhancedSwitchObject';
import { CommandService } from '../../services/CommandService';

/**
 * Classe pour les radiateurs
 * Hérite de EnhancedSwitchObject pour les fonctionnalités de base
 */
export class EnhancedRadiatorObject extends EnhancedSwitchObject {
  constructor(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number } = { width: 80, height: 80 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    // Couleurs spécifiques pour les radiateurs
    this.setColorScheme({
      primary: '#E91E63', // Rose
      secondary: '#F06292',
      background: 'transparent',
      text: '#FFFFFF'
    });
  }

  renderEntity(): HTMLElement {
    const container = this.createStyledElement('div', 'enhanced-radiator-object');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.gap = '8px';

    // Créer l'icône spécifique
    const icon = this.createIcon(this.getIconForState(), 'medium');
    
    // Forcer la couleur de l'icône
    const iconElement = icon.querySelector('i');
    if (iconElement) {
      iconElement.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }

    // Créer l'affichage de l'état
    const statusDisplay = this.createStyledElement('div', 'radiator-status-display');
    statusDisplay.textContent = this.isOn ? 'ON' : 'OFF';
    statusDisplay.style.fontSize = '16px';
    statusDisplay.style.fontWeight = 'bold';
    statusDisplay.style.color = this.isOn ? this.colorScheme.primary : '#999999';

    // Assembler les éléments
    container.appendChild(icon);
    container.appendChild(statusDisplay);

    // Ajouter un gestionnaire de clic
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClick();
    });

    return container;
  }

  /**
   * Retourne l'icône appropriée en fonction de l'état
   */
  protected getIconForState(): string {
    // Radiateur: feu quand allumé, flocon quand éteint
    return this.isOn ? 'fa-fire' : 'fa-snowflake';
  }

  updateDisplay(): void {
    if (!this.element) return;
    
    // Mettre à jour l'icône
    const iconElement = this.element.querySelector('i');
    if (iconElement) {
      iconElement.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }
    
    // Mettre à jour l'état
    const statusDisplay = this.element.querySelector('.radiator-status-display');
    if (statusDisplay) {
      statusDisplay.textContent = this.isOn ? 'ON' : 'OFF';
      statusDisplay.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }
  }
}
