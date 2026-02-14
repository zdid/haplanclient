import { WebSocketService } from "./WebSocketService";

var dataService: DataService;

export class DataService {
  private tree: any;
  private entities: Record<string, any> = {};
  private states: Record<string, any> = {};
  private floorplans: Record<string, any> = {};
  private currentFloorplanId: string = '';
  private webSocketService: WebSocketService;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private apiBaseUrl: string;
  private floorplanImages: Map<string, HTMLImageElement> = new Map(); // Cache des images

  constructor(wsUrl: string, apiBaseUrl: string) {
    this.webSocketService = new WebSocketService(wsUrl);
    this.apiBaseUrl = apiBaseUrl;
    this.initNotifications();
    dataService = this;
  }

  private initNotifications(): void {
    // ✅ Écouter les refresh du serveur (notification indépendante)
    this.webSocketService.onNotification('refresh', (data: any) => {
      console.log('DataService: refresh reçu du serveur');
      this.handleRefreshData(data);
    });

    // ✅ Écouter les mises à jour d'état (automatiques, envoyées par le serveur)
    this.webSocketService.onNotification('state', (data: any) => {
      //console.log('DataService: Mise à jour d\'état reçue', data);

      if (data.entity_id === 'light.bureau_plafonnier') {
        console.log('[TRACE][DataService] state reçu light.bureau_plafonnier:', data.state);
      }
      
      if (data.entity_id && data.state) {
        this.states[data.entity_id] = data;
        this.notifyHandlers('state', data);
      }
    });
  }

  // ✅ UNE SEULE méthode refresh() - Demander un refresh au serveur
  async refresh(): Promise<void> {
    console.log('DataService: Demande de rafraîchissement');

    try {
      const response = await this.webSocketService.request('refresh', {});
      
      if (response.data) {
        this.handleRefreshData(response.data);
      }
    } catch (error: any) {
      console.error('DataService: Erreur refresh', error);
      throw error;
    }
  }

  // ✅ Traiter les données refresh (reçues du serveur ou en réponse à refresh)
  private handleRefreshData(data: any): void {
    console.log('DataService: Traitement du refresh');

    if (data.tree) {
      this.tree = data.tree;
    }
    if (data.states) {
      if (Array.isArray(data.states)) {
        const mappedStates: Record<string, any> = {};
        data.states.forEach((state: any) => {
          if (state && state.entity_id) {
            mappedStates[state.entity_id] = state;
          }
        });
        this.states = mappedStates;
      } else {
        this.states = data.states;
      }

      if (this.states['light.bureau_plafonnier']) {
        console.log('[TRACE][DataService] refresh state light.bureau_plafonnier:', this.states['light.bureau_plafonnier'].state);
      } else {
        console.log('[TRACE][DataService] refresh state light.bureau_plafonnier: absent');
      }
    }
    if (data.plans) {
      this.floorplans = data.plans;
      // Précharger toutes les images des plans
      this.preloadFloorplanImages();
    }

    // Initialiser le mapping des areas et devices
    this.entities = {};
    if (this.tree && Array.isArray(this.tree)) {
      this.tree.forEach((area: any) => {
        if (area.devices) {
          area.devices.forEach((device: any) => {
            if (device.entities) {
              Object.values(device.entities).forEach((entity: any) => {
                const e = entity as any;
                e.area_name = area.name;
                e.device_name = device.name;
                this.entities[e.entity_id] = e;
              });
            }
          });
        }
      });
    }

    // Définir le premier plan comme courant
    if (!this.currentFloorplanId && Object.keys(this.floorplans).length > 0) {
      this.currentFloorplanId = Object.keys(this.floorplans)[0];
      console.log('DataService: Plan courant défini à', this.currentFloorplanId);
    }

    this.notifyHandlers('refresh', data);
    console.log('DataService: refresh traité avec succès');
  }

  // Précharger toutes les images des plans
  private preloadFloorplanImages(): void {
    console.log('DataService: Préchargement des images des plans');
    
    Object.entries(this.floorplans).forEach(([floorplanId, plan]: [string, any]) => {
      if (plan.filename && !this.floorplanImages.has(floorplanId)) {
        const img = new Image();
        const url = this.getFloorplanImageUrl(plan.filename);
        
        img.onload = () => {
          this.floorplanImages.set(floorplanId, img);
          console.log(`DataService: Image chargée pour le plan ${floorplanId}`);
        };
        
        img.onerror = () => {
          console.error(`DataService: Erreur chargement image pour le plan ${floorplanId}`);
        };
        
        img.src = url;
      }
    });
  }

  /**
   * Abonne un handler à un événement
   * Retourne une fonction de désabonnement
   */
  on(event: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
    console.log(`[DataService] Handler abonné à '${event}'. Total: ${this.messageHandlers.get(event)!.size}`);
    
    // Retourner une fonction de désabonnement
    return () => this.off(event, handler);
  }

  /**
   * Désabonne un handler d'un événement
   */
  off(event: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      console.log(`[DataService] Handler désabonné de '${event}'. Restants: ${handlers.size}`);
      
      // Nettoyer le Set vide
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
      }
    }
  }

  private notifyHandlers(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[DataService] Erreur dans handler '${event}':`, error);
        }
      });
    }
  }

  // ===== Commandes =====

  async sendCommand(entity_id: string, service: string, serviceData?: any): Promise<void> {
    console.log(`DataService: Envoi commande ${service} pour ${entity_id}`);

    try {
      await this.webSocketService.request('command', {
        entity_id,
        service,
        service_data: serviceData
      });
      console.log('DataService: Commande envoyée avec succès');
    } catch (error: any) {
      console.error('DataService: Erreur envoi commande', error);
      throw error;
    }
  }

  // ===== Gestion des Plans =====

  getCurrentFloorplanId(): string {
    return this.currentFloorplanId;
  }

  setCurrentFloorplanId(floorplanId: string): void {
    if (this.floorplans[floorplanId]) {
      this.currentFloorplanId = floorplanId;
      console.log(`DataService: Plan courant changé vers ${floorplanId}`);
    } else {
      console.error(`DataService: Plan ${floorplanId} non trouvé`);
    }
  }

  getAllFloorplans(): Record<string, any> {
    return this.floorplans;
  }

  getFloorplan(floorplanId: string): any {
    return this.floorplans[floorplanId];
  }

  getCurrentFloorplan(): any {
    return this.floorplans[this.currentFloorplanId];
  }

  getFloorplanImageUrl(filename: string): string {
    const url = `${this.apiBaseUrl}/uploads/${filename}`;
    console.log('[DataService] Construction URL image:', url, 'depuis apiBaseUrl:', this.apiBaseUrl);
    return url;
  }

  // Obtenir l'image préchargée d'un plan
  getFloorplanImage(floorplanId: string): HTMLImageElement | null {
    return this.floorplanImages.get(floorplanId) || null;
  }

  getFloorplanIds(): string[] {
    return Object.keys(this.floorplans);
  }

  // ===== Gestion des Positions =====

  getPositionsForFloorplan(floorplanId: string): any[] {
    const floorplan = this.floorplans[floorplanId];
    return floorplan ? floorplan.positions || [] : [];
  }

  getCurrentFloorplanPositions(): any[] {
    return this.getPositionsForFloorplan(this.currentFloorplanId);
  }

  // ✅ Envoi immédiat sans attendre de réponse (fire-and-forget)
  updatePositionsForFloorplan(floorplanId: string, positions: any[]): void {
    console.log(`DataService: Envoi positions pour ${floorplanId} (sans attente)`);
    console.log('[DataService] positions count:', Array.isArray(positions) ? positions.length : 'non-array');
    if (Array.isArray(positions) && positions.length > 0) {
      console.log('[DataService] first position:', positions[0]);
    }

    this.webSocketService.sendRequest('update_positions', {
      floorplanId,
      positions
    });
  }



  uploadFloorplan(file: File, name: string, description?: string): void {
    console.log(`DataService: Upload plan ${name} (sans attente)`);

    // Upload via HTTP multipart (seule exception)
    const formData = new FormData();
    formData.append('floorplan', file);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    fetch(`${this.apiBaseUrl}/api/floorplan/upload`, {
      method: 'POST',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error('Erreur upload floorplan');
      }
      return response.json();
    }).then(result => {
      console.log('DataService: Upload plan réussi', result);
      // PAS de mise à jour locale - attendre le refresh du serveur
    }).catch((error: any) => {
      console.error('DataService: Erreur upload plan', error);
    });
  }

  async deleteFloorplan(floorplanId: string): Promise<void> {
    console.log(`DataService: Suppression plan ${floorplanId}`);

    try {
      await this.webSocketService.request('delete_floorplan', {
        floorplanId
      });
      // PAS de suppression locale - attendre le refresh du serveur

      console.log('DataService: Plan supprimé avec succès');
    } catch (error: any) {
      console.error('DataService: Erreur suppression plan', error);
      throw error;
    }
  }

  // ===== Getters =====

  getState(entity_id: string): any {
    return this.states[entity_id];
  }

  getEntity(entity_id: string): any {
    return this.entities[entity_id];
  }

  getEntities(): Record<string, any> {
    return this.entities;
  }

  getStates(): Record<string, any> {
    return this.states;
  }

  getTree(): any {
    return this.tree;
  }

  getNameEntity(entity_id: string): string {
    const entity = this.getEntity(entity_id);
    if (!entity) {
      return "";
    }
    return entity.name || entity.original_name || entity.device_name || entity_id;
  }

  getAreaNameOfEntity(entity_id: string): string {
    const entity = this.getEntity(entity_id);
    if (!entity) {
      return "";
    }
    return entity.area_name;
  }

  isConnected(): boolean {
    return this.webSocketService.isConnected();
  }

  close(): void {
    this.webSocketService.close();
  }
}

export function getDataService(): DataService {
  return dataService;
}