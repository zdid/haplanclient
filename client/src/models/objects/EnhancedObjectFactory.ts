import { BaseEntity } from './BaseEntity';
import { EnhancedLightObject } from './EnhancedLightObject';
import { MinimalLightObject } from './MinimalLightObject';
import { EnhancedTemperatureSensor } from './EnhancedTemperatureSensor';
import { CommandService } from '../../services/CommandService';

export class EnhancedObjectFactory {
  static createObject(
    entity_id: string,
    type: string,
    position: { x: number; y: number },
    state?: any,
    commandService?: CommandService,
    dimensions?: { width: number; height: number },
    style: 'default' | 'minimal' = 'default'
  ): BaseEntity {
    // Dimensions par défaut pour chaque type d'objet
    const defaultDimensions = this.getDefaultDimensions(entity_id);
    const finalDimensions = dimensions || defaultDimensions;

    if (entity_id.startsWith('light.')) {
      let lightObject;
      if (style === 'minimal') {
        lightObject = new MinimalLightObject(
          entity_id,
          position,
          finalDimensions,
          commandService
        );
      } else {
        lightObject = new EnhancedLightObject(
          entity_id,
          position,
          finalDimensions,
          commandService
        );
      }
      if (state) {
        lightObject.updateState(state);
      }
      return lightObject;
    }

    if (entity_id.startsWith('sensor.') && entity_id.includes('temperature')) {
      const tempSensor = new EnhancedTemperatureSensor(
        entity_id,
        position,
        finalDimensions,
        commandService
      );
      if (state) {
        tempSensor.updateState(state);
      }
      return tempSensor;
    }

    // Pour les autres types, créer une entité générique
    return this.createGenericEntity(entity_id, position, finalDimensions, commandService);
  }

  private static getDefaultDimensions(entity_id: string): { width: number; height: number } {
    // Dimensions par défaut en fonction du type d'entité
    if (entity_id.startsWith('light.')) {
      return { width: 80, height: 80 };
    }
    if (entity_id.startsWith('sensor.') && entity_id.includes('temperature')) {
      return { width: 100, height: 100 };
    }
    if (entity_id.startsWith('climate.')) {
      return { width: 120, height: 100 };
    }
    if (entity_id.startsWith('cover.')) {
      return { width: 90, height: 90 };
    }
    // Dimensions par défaut pour les autres entités
    return { width: 70, height: 70 };
  }

  private static createGenericEntity(
    entity_id: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number },
    commandService?: CommandService
  ): BaseEntity {
    // Créer une classe générique qui hérite de BaseEntity
    class GenericEntity extends BaseEntity {
      constructor(
        entity_id: string,
        position: { x: number; y: number },
        dimensions: { width: number; height: number },
        commandService?: CommandService
      ) {
        super(entity_id, position, dimensions, commandService);
        this.setVisualStyle('icon');
      }

      renderEntity(): HTMLElement {
        const container = this.createStyledElement('div', 'generic-entity');
        
        // Créer le titre
        const title = this.createTitle(this.getEntity_id().split('.')[1].replace(/_/g, ' '));
        
        // Créer une icône générique
        const icon = this.createIcon('fa-cube', 'medium');
        
        // Créer l'indicateur d'état
        const statusIndicator = this.createStatusIndicator('on');
        
        // Créer le conteneur de valeurs
        const valuesContainer = this.createValuesContainer();
        
        // Assembler les éléments
        container.appendChild(title);
        container.appendChild(icon);
        container.appendChild(statusIndicator);
        container.appendChild(valuesContainer);
        
        return container;
      }

      updateState(state: any): void {
        // Mettre à jour les valeurs à afficher
        if (state.state) {
          this.setDisplayValue('state', state.state);
        }
        
        if (state.attributes) {
          Object.entries(state.attributes).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
              this.setDisplayValue(key, value);
            }
          });
        }
        
        this.updateDisplay();
      }

      updateDisplay(): void {
        if (!this.element) return;
        
        // Mettre à jour les valeurs affichées
        const valuesContainer = this.element.querySelector('.values-container') as HTMLElement;
        if (valuesContainer) {
          valuesContainer.innerHTML = '';
          const newValuesContainer = this.createValuesContainer();
          valuesContainer.appendChild(newValuesContainer);
        }
      }

      handleAction(action: string): void {
        console.log(`Action ${action} received by generic entity, but no action taken.`);
      }
    }

    return new GenericEntity(entity_id, position, dimensions, commandService);
  }
}