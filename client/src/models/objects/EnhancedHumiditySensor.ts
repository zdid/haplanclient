import { BaseEntity } from './BaseEntity';
import { CommandService } from '../../services/CommandService';

export class EnhancedHumiditySensor extends BaseEntity {
  protected humidity: number = 0;

  constructor(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number } = { width: 100, height: 100 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    this.setVisualStyle('minimal'); // Style minimal pour afficher uniquement la valeur
    this.setColorScheme({
      primary: '#00BCD4', // Cyan
      secondary: '#4DD0E1', // Cyan clair
      background: 'transparent', // Fond transparent
      text: '#FFFFFF' // Blanc pour le contraste sur fond noir
    });
  }

  updateState(state: any): void {
    this.humidity = state.state || 0;
    
    this.updateDisplay();
  }

  renderEntity(): HTMLElement {
    const container = this.createStyledElement('div', 'enhanced-humidity-sensor');

    // Créer uniquement l'affichage de la valeur (affichage simplifié)
    const valueDisplay = this.createStyledElement('div', 'sensor-value-display');
    valueDisplay.textContent = `${this.humidity}%`;
    valueDisplay.style.fontSize = '24px';
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

    // Mettre à jour uniquement la valeur d'humidité
    const valueDisplay = this.element.querySelector('.sensor-value-display') as HTMLElement;
    if (valueDisplay) {
      valueDisplay.textContent = `${this.humidity}%`;
    }
  }

  handleAction(action: string): void {
    // Les capteurs d'humidité sont généralement en lecture seule
    console.log(`Humidity sensor action ${action} - read only`);
  }
}