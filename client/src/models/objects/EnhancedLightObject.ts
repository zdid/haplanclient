import { BaseEntity } from './BaseEntity';
import { CommandService } from '../../services/CommandService';

export class EnhancedLightObject extends BaseEntity {
  protected isOn: boolean = false;
  protected brightness: number = 0;

  constructor(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number } = { width: 80, height: 80 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    this.setVisualStyle('icon'); // Style simplifié pour afficher uniquement l'icône
    this.setColorScheme({
      primary: '#FFD700', // Or
      secondary: '#FFC107', // Ambre
      background: 'transparent', // Fond transparent
      text: '#FFFFFF' // Blanc pour le contraste sur fond noir
    });
  }

  updateState(state: any): void {
    this.isOn = state.state === 'on';
    this.brightness = state.attributes?.brightness || (this.isOn ? 255 : 0);
    
    // Ne plus stocker les valeurs à afficher (affichage simplifié)
    this.updateDisplay();
  }

  renderEntity(): HTMLElement {
    const container = this.createStyledElement('div', 'enhanced-light-object');

    // Créer uniquement l'icône (affichage simplifié)
    const icon = this.createIcon('fa-lightbulb', 'large');
    
    // Forcer la couleur de l'icône en blanc pour le contraste sur fond noir
    const iconElement = icon.querySelector('i');
    if (iconElement) {
      iconElement.style.color = '#FFFFFF';
    }

    // Assembler les éléments (uniquement l'icône)
    container.appendChild(icon);

    // Ajouter un gestionnaire de clic pour ouvrir la fenêtre modale
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClick(); // Cela ouvrira la fenêtre contextuelle
    });

    return container;
  }

  updateDisplay(): void {
    if (!this.element) return;

    // Mettre à jour uniquement l'icône en fonction de l'état
    const icon = this.element.querySelector('.entity-icon') as HTMLElement;
    if (icon) {
      const bulbIcon = icon.querySelector('i') as HTMLElement;
      if (bulbIcon) {
        bulbIcon.className = `fas fa-lightbulb`;
        bulbIcon.style.opacity = this.isOn ? '1' : '0.3';
        bulbIcon.style.color = this.isOn ? this.colorScheme.primary : '#999999';
      }
    }
  }

  protected toggle(): void {
    const action = this.isOn ? 'turn_off' : 'turn_on';
    console.log(`[TRACE] EnhancedLightObject.toggle() - Envoi de la commande light.${action}`);
    this.sendCommand('light', action);
  }

  handleAction(action: string): void {
    if (action === 'toggle') {
      this.toggle();
    }
  }
}