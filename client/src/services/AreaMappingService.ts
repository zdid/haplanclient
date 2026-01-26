// Service pour mapper les entités à leurs areas
import { Area } from '../types/ha-types';

export class AreaMappingService {
  private static instance: AreaMappingService;
  private entityToAreaMap: Map<string, string> = new Map();
  private areaData: Area[] = [];

  private constructor() {
    // Private constructor pour singleton
  }

  public static getInstance(): AreaMappingService {
    if (!AreaMappingService.instance) {
      AreaMappingService.instance = new AreaMappingService();
    }
    return AreaMappingService.instance;
  }

  // Initialiser avec les données d'arborescence
  public initialize(areas: Area[]): void {
    this.areaData = areas;
    this.buildEntityToAreaMap();
  }

  // Construire la map entity_id -> area_name
  private buildEntityToAreaMap(): void {
    this.entityToAreaMap.clear();
    
    this.areaData.forEach(area => {
      area.devices.forEach(device => {
        Object.values(device.entities).forEach(entity => {
          this.entityToAreaMap.set(entity.entity_id, area.name);
        });
      });
    });
  }

  // Obtenir le nom de l'area pour une entité
  public getAreaNameForEntity(entity_id: string): string | undefined {
    return this.entityToAreaMap.get(entity_id);
  }

  // Obtenir toutes les données d'area
  public getAllAreas(): Area[] {
    return this.areaData;
  }

  // Mettre à jour les données
  public updateAreas(areas: Area[]): void {
    this.areaData = areas;
    this.buildEntityToAreaMap();
  }

  // Effacer toutes les données
  public clear(): void {
    this.entityToAreaMap.clear();
    this.areaData = [];
  }
}