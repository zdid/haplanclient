import { HAObject } from './objects/HAObject';

export class PositionManager {
  private positions: Map<string, {x: number, y: number}> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private saveCallback: (positions: any[]) => void;

  constructor(saveCallback: (positions: any[]) => void) {
    this.saveCallback = saveCallback;
  }

  updatePosition(entity_id: string, x: number, y: number): void {
    console.log(`[TRACE] PositionManager.updatePosition appelé pour ${entity_id}:`, {x, y});
    this.positions.set(entity_id, {x, y});
    console.log(`[TRACE] Position stockée dans PositionManager pour ${entity_id}. Nombre total de positions:`, this.positions.size);
    this.scheduleSave();
  }

  removePosition(entity_id: string): void {
    console.log(`[TRACE] PositionManager.removePosition appelé pour ${entity_id}`);
    this.positions.delete(entity_id);
    console.log(`[TRACE] Position supprimée. Nombre total de positions:`, this.positions.size);
    this.scheduleSave();
  }

  private scheduleSave(): void {
    console.log(`[TRACE] PositionManager.scheduleSave appelé. Planification de la sauvegarde dans 5 secondes...`);
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      console.log(`[TRACE] Timer de sauvegarde précédent annulé.`);
    }

    this.debounceTimer = setTimeout(() => {
      console.log(`[TRACE] Délai de 5 secondes écoulé. Déclenchement de savePositions...`);
      this.savePositions();
    }, 5000); // 5 secondes de délai
  }

  private savePositions(): void {
    const positions = Array.from(this.positions.entries()).map(([entity_id, pos]) => ({
      entity_id: entity_id,
      position: pos
    }));

    console.log(`[TRACE] PositionManager.savePositions appelé avec les positions:`, positions);
    console.log(`[TRACE] Appel du callback de sauvegarde...`);
    
    this.saveCallback(positions);
  }

  loadPositions(positions: any[]): void {
    positions.forEach(pos => {
      this.positions.set(pos.entity_id, pos.position);
    });
  }

  getPosition(entity_id: string): {x: number, y: number} | undefined {
    return this.positions.get(entity_id);
  }

  /**
   * Retourne toutes les positions enregistrées
   * @returns Tableau de toutes les positions avec leurs entity_id
   */
  getAllPositions(): Array<{entity_id: string, position: {x: number, y: number}}> {
    return Array.from(this.positions.entries()).map(([entity_id, pos]) => ({
        entity_id,
        position: pos
    }));
  }
}