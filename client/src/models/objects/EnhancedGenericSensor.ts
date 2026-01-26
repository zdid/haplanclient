import { BaseEntity } from './BaseEntity';
import { CommandService } from '../../services/CommandService';

export class EnhancedGenericSensor extends BaseEntity {
  protected sensorValue: string | number = '';
  protected unit: string = '';
  protected sensorType: string = 'default';

  constructor(
    entity_id: string,
    position: { x: number; y: number },
    sensorType: string = 'default',
    dimensions: { width: number; height: number } = { width: 80, height: 80 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    this.sensorType = sensorType;
    this.setVisualStyle('minimal'); // Style minimal pour afficher uniquement la valeur
    this.setColorScheme(this.getColorSchemeForType(sensorType));
  }

  private getColorSchemeForType(type: string): {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  } {
    switch (type) {
      case 'temperature':
        return {
          primary: '#F44336', // Rouge
          secondary: '#E57373', // Rouge clair
          background: 'transparent',
          text: '#FFFFFF' // Blanc pour le contraste sur fond noir
        };
      case 'humidity':
        return {
          primary: '#00BCD4', // Cyan
          secondary: '#4DD0E1', // Cyan clair
          background: 'transparent',
          text: '#FFFFFF' // Blanc pour le contraste sur fond noir
        };
      case 'pressure':
        return {
          primary: '#9C27B0', // Violet
          secondary: '#BA68C8', // Violet clair
          background: 'transparent',
          text: '#FFFFFF' // Blanc pour le contraste sur fond noir
        };
      case 'power':
      case 'energy':
        return {
          primary: '#FFC107', // Jaune
          secondary: '#FFD54F', // Jaune clair
          background: 'transparent',
          text: '#FFFFFF' // Blanc pour le contraste sur fond noir
        };
      default:
        return {
          primary: '#607D8B', // Bleu gris
          secondary: '#90A4AE', // Bleu gris clair
          background: 'transparent',
          text: '#FFFFFF' // Blanc pour le contraste sur fond noir
        };
    }
  }

  updateState(state: any): void {
    this.sensorValue = state.state || '';
    this.unit = state.attributes?.unit_of_measurement || '';

    this.updateDisplay();
  }

  renderEntity(): HTMLElement {
    const container = this.createStyledElement('div', 'enhanced-generic-sensor');

    // Créer uniquement l'affichage de la valeur (affichage simplifié)
    const valueDisplay = this.createStyledElement('div', 'sensor-value-display');
    valueDisplay.textContent = `${this.sensorValue}${this.unit ? ` ${this.unit}` : ''}`;
    valueDisplay.style.fontSize = '20px';
    valueDisplay.style.fontWeight = 'bold';
    valueDisplay.style.color = '#FFFFFF'; // Texte blanc pour le contraste

    // Assembler les éléments (uniquement la valeur)
    container.appendChild(valueDisplay);

    // Ajouter un gestionnaire de clic pour ouvrir la fenêtre modale
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClick(); // Cela ouvrira la fenêtre contextuelle
    });

    return container;
  }

  updateDisplay(): void {
    if (!this.element) return;

    // Mettre à jour uniquement la valeur
    const valueDisplay = this.element.querySelector('.sensor-value-display') as HTMLElement;
    if (valueDisplay) {
      valueDisplay.textContent = `${this.sensorValue}${this.unit ? ` ${this.unit}` : ''}`;
    }
  }

  handleAction(action: string): void {
    // Les capteurs génériques sont généralement en lecture seule
    console.log(`Generic sensor action ${action} - read only`);
  }
}