/**
 * Interface pour le service d'envoi de commandes
 * Cela permet de découpler les objets de l'implémentation spécifique
 */
export interface CommandService {
  sendCommand(entity_id: string, service: string, serviceData?: any): void;
  isConnected(): boolean;
}

/**
 * Implémentation par défaut utilisant WebSocket
 */
export class WebSocketCommandService implements CommandService {
  constructor(private webSocketService: any) {}

  sendCommand(entity_id: string, service: string, serviceData?: any): void {
    console.log(`[TRACE] CommandService.sendCommand() - Préparation de l'envoi de la commande ${service} pour ${entity_id} avec données:`, serviceData);
    
    if (this.isConnected()) {
      console.log(`[TRACE] CommandService - WebSocket connecté, envoi du message`);
      const mess = 
      {
        type: 'command',
        payload: {
          entity_id: entity_id,
          service: service,
          service_data: serviceData
        }
      };
      this.webSocketService.send(mess);
      console.log(`[TRACE] CommandService - Message envoyé via WebSocket`, mess);
    } else {
      console.warn('[TRACE] CommandService - WebSocket non connecté, commande non envoyée:', entity_id, service);
    }
  }

  isConnected(): boolean {
    return this.webSocketService.isConnected();
  }
}

/**
 * Implémentation de fallback utilisant l'API REST
 */
export class RestCommandService implements CommandService {
  constructor(private apiService: any) {}

  async sendCommand(entity_id: string, service: string, serviceData?: any): Promise<void> {
    try {
      await this.apiService.callService(entity_id, service, serviceData);
    } catch (error) {
      console.error('Failed to send command via REST:', error);
    }
  }

  isConnected(): boolean {
    // Pour un service REST, on considère toujours connecté
    return true;
  }
}