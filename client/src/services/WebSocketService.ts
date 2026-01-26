export class WebSocketService {
  private socket!: WebSocket;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectInterval: number = 5000;
  private isConnecting: boolean = false;

  constructor(private url: string) {
    this.connect();
  }

  private connect(): void {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    this.socket = new WebSocket(this.url);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.isConnecting = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        //console.log('WebSocket message received:', data);
        
        if (data.type && this.messageHandlers.has(data.type)) {
          console.log("messagehandler",data.type)
          this.messageHandlers.get(data.type)!(data.payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.isConnecting = false;
      
      // Reconnect after delay
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  on(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  send(message: any): void {
    console.log(`[TRACE] WebSocketService.send() - Envoi du message via WebSocket:`, message);
    
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log(`[TRACE] WebSocketService - Socket ouvert, envoi des données JSON`);
      this.socket.send(JSON.stringify(message));
      console.log(`[TRACE] WebSocketService - Message envoyé avec succès`);
    } else {
      console.warn('[TRACE] WebSocketService - Socket non ouvert, message non envoyé');
    }
  }

  close(): void {
    this.socket.close();
  }

  isConnected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }
}