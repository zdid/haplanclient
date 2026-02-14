interface WebSocketMessage {
  type: 'request' | 'response' | 'notification';
  id?: string;
  action?: string;
  success?: boolean;
  error?: string;
  data?: any;
  event?: string;
  payload?: any;
}
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private responseHandlers: Map<string, (data: any) => void> = new Map();
  private notificationHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isManuallyClosed = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    try {
      console.log('WebSocketService: Connexion à', this.url);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocketService: Connecté');
        this.reconnectAttempts = 0;
        this.isManuallyClosed = false;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: any = JSON.parse(event.data);
          if(message && message.type !=='state') {
            console.log('WebSocketService: Message  reçu -', message);
          }
          this.handleMessage(message);
        } catch (error) {
          console.error('WebSocketService: Erreur parsing message', error);
        }
      };

      this.ws.onerror = (event: Event) => {
        console.error('WebSocketService: Erreur', event);
      };

      this.ws.onclose = () => {
        console.log('WebSocketService: Fermé');
        
        if (!this.isManuallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`WebSocketService: Reconnexion dans ${this.reconnectDelay}ms (tentative ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('WebSocketService: Erreur connexion', error);
    }
  }

  // Envoyer une requête et attendre la réponse
  async request(action: string, payload: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket non connecté'));
        return;
      }

      const id = 'req_' + uuidv4();
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(id);
        reject(new Error(`Timeout pour la requête ${action}`));
      }, 30000);

      this.responseHandlers.set(id, (response: any) => {
        clearTimeout(timeout);
        
        if (response.success || response.data || response.type === 'refresh') {
          resolve(response.data || response);
        } else {
          reject(new Error(response.error || response.message || 'Erreur inconnue'));
        }
      });

      // Format du serveur : pas de "type", juste id + action + payload
      const message = {
        id,
        action,
        payload
      };

      try {
        this.ws?.send(JSON.stringify(message));
        console.log(`WebSocketService: Requête envoyée - ${action} (${id})`);
      } catch (error) {
        this.responseHandlers.delete(id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Envoyer une requête sans attendre de réponse
  sendRequest(action: string, payload: any = {}): void {
    if (!this.isConnected()) {
      console.error('WebSocket non connecté');
      return;
    }

    const id = 'req_' + uuidv4();
    const message = {
      id,
      action,
      payload
    };

    try {
      this.ws?.send(JSON.stringify(message));
      console.log(`WebSocketService: Requête envoyée (sans attente) - ${action} (${id})`);
    } catch (error) {
      console.error('WebSocketService: Erreur envoi sans attente', error);
    }
  }

  onNotification(event: string, handler: (data: any) => void): void {
    this.notificationHandlers.set(event, handler);
    console.log(`WebSocketService: Abonnement à ${event}`);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  close(): void {
    this.isManuallyClosed = true;
    this.ws?.close();
  }

  private handleMessage(message: any): void {
    const { type, id } = message;
    if(type !== 'state' ) {
      console.log('WebSocketService: Message reçu -', type || id, message);
    }
    // refresh est une notification du serveur, pas une réponse
    if (type === 'refresh') {
      this.handleNotification(message);
      return;
    }

    // Les autres types sont des réponses à des requêtes
    if (id && this.responseHandlers.has(id)) {
      this.handleResponse(message);
    } else if (type) {
      // Autres notifications
      this.handleNotification(message);
    }
  }

  private handleResponse(message: any): void {
    const { id } = message;
    if (!id) return;

    const handler = this.responseHandlers.get(id);
    if (handler) {
      handler(message);
      this.responseHandlers.delete(id);
    }
  }

  private handleError(message: any): void {
    const { id, error, message: errorMessage } = message;
    if (!id) return;

    const handler = this.responseHandlers.get(id);
    if (handler) {
      handler({
        success: false,
        error: error || errorMessage
      });
      this.responseHandlers.delete(id);
    }
  }

  private handleNotification(message: any): void {
    const { type, data, event } = message; 
    if(type !== 'state' ) {
      console.log('WebSocketService: Notification reçue -', message);
    }
    // Mapper les types de réponses en événements de notification
    if (type === 'refresh') {
      const handler = this.notificationHandlers.get('refresh');
      if (handler) {
        handler(data || message);
      }
    } else if (type === 'state') {
      const handler = this.notificationHandlers.get('state');
      if (handler) {
        handler(data || message);
      }
    } else if (type === 'config_update') {
      const handler = this.notificationHandlers.get('config_update');
      if (handler) {
        handler(data || message);
      }
    } else if (event) {
      const handler = this.notificationHandlers.get(event);
      if (handler) {
        handler(data || message);
      }
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket non connecté');
    }
  }
}