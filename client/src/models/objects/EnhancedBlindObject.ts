import { EnhancedCoverObject } from './EnhancedCoverObject';
import { CommandService } from '../../services/CommandService';

export class EnhancedBlindObject extends EnhancedCoverObject {
  constructor(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number } = { width: 80, height: 80 },
    commandService?: CommandService
  ) {
    super(entity_id, position, dimensions, commandService);
    
    // Personnalisation pour les stores
    this.setColorScheme({
      primary: '#2196F3', // Bleu
      secondary: '#64B5F6', // Bleu clair
      background: 'transparent',
      text: '#FFFFFF' // Blanc pour le contraste sur fond noir
    });
  }

  renderEntity(): HTMLElement {
    const container = super.renderEntity();
    
    // Remplacer l'icône par une icône de store
    const icon = container.querySelector('.entity-icon') as HTMLElement;
    if (icon) {
      const blindIcon = icon.querySelector('i') as HTMLElement;
      if (blindIcon) {
        blindIcon.className = 'fas fa-blinds';
      }
    }
    
    return container;
  }
}