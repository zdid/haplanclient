// Classe de base pour les objets de type switch (interrupteurs)
import { BaseEntity } from './BaseEntity';
import { CommandService } from '../../services/CommandService';

/**
 * Classe de base pour les objets de type switch
 * Peut être étendue pour des types spécifiques comme les radiateurs, ballons d'eau chaude, etc.
 */
export class EnhancedSwitchObject extends BaseEntity {
  protected isOn: boolean = false;
  
  constructor(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number } = { width: 80, height: 80 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    this.setVisualStyle('minimal');
    this.setColorScheme({
      primary: '#2196F3', // Bleu par défaut
      secondary: '#03A9F4',
      background: 'transparent',
      text: '#FFFFFF'
    });
  }

  updateState(state: any): void {
    this.isOn = state.state === 'on';
    this.updateDisplay();
  }

  renderEntity(): HTMLElement {
    const container = this.createStyledElement('div', 'enhanced-switch-object');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.gap = '8px';

    // Créer l'icône (par défaut: toggle)
    const icon = this.createIcon(this.getIconForState(), 'medium');
    
    // Forcer la couleur de l'icône
    const iconElement = icon.querySelector('i');
    if (iconElement) {
      iconElement.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }

    // Créer l'affichage de l'état
    const statusDisplay = this.createStyledElement('div', 'switch-status-display');
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
    // Par défaut, les switches simples utilisent toggle-on/toggle-off
    return this.isOn ? 'fa-toggle-on' : 'fa-toggle-off';
  }

  protected toggle(): void {
    this.sendCommand('light', this.isOn ? 'turn_off' : 'turn_on');
  }

  handleAction(action: string, value?: any): void {
    if (action === 'toggle') {
      this.toggle();
    }
  }

  updateDisplay(): void {
    if (!this.element) return;
    
    // Mettre à jour l'icône
    const iconElement = this.element.querySelector('i');
    if (iconElement) {
      iconElement.className = `fas ${this.isOn ? 'fa-toggle-on' : 'fa-toggle-off'}`;
      iconElement.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }
    
    // Mettre à jour l'état
    const statusDisplay = this.element.querySelector('.switch-status-display');
    if (statusDisplay) {
      statusDisplay.textContent = this.isOn ? 'ON' : 'OFF';
      statusDisplay.style.color = this.isOn ? this.colorScheme.primary : '#999999';
    }
  }
}
