import { BaseEntity } from '../BaseEntity';
import { AreaMappingService } from '../../../services/AreaMappingService';

export interface ContextWindow {
  entity: BaseEntity;
  element: HTMLElement;
  isSimple: boolean; // Fermeture automatique après action

  /**
   * Rendu de la fenêtre
   */
  render(): HTMLElement;

  /**
   * Gestion des actions
   */
  onAction(action: string, value?: any): void;

  /**
   * Fermeture de la fenêtre
   */
  close(): void;

  /**
   * Mise à jour de l'affichage
   */
  updateDisplay?(): void;
}

// Fonction utilitaire pour obtenir le titre formaté
export function getFormattedWindowTitle(entity: BaseEntity): string {
  const areaMappingService = AreaMappingService.getInstance();
  const areaName = areaMappingService.getAreaNameForEntity(entity.getEntity_id());
  
  // Extraire le nom de l'entité à partir de l'entity_id
  const entityParts = entity.getEntity_id().split('.');
  const entityName = entityParts.length > 1 ? entityParts[1].replace(/_/g, ' ') : entity.getEntity_id();
  
  // Formater le titre
  if (areaName) {
    return `${areaName} - ${entityName}`;
  } else {
    return entityName;
  }
}

// Fonction utilitaire pour appliquer la taille de police
export function applyFontSizeToWindow(windowElement: HTMLElement): void {
  const fontSize = localStorage.getItem('contextFontSize') || 'medium';
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
  
  windowElement.style.fontSize = sizeValue;
}