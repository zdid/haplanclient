import { 
  getAuth, 
  createConnection, 
  Auth, 
  Connection, 
  AuthData,
  getUser,
  HassUser
} from 'home-assistant-js-websocket';

export class HomeAssistantAuth {
  private static auth: Auth | undefined = undefined;
  private static connection: Connection | null = null;
  private static authUrl: string = '';
  private static authChangeCallbacks: Set<() => void> = new Set();

  // Initialiser avec l'URL de Home Assistant
  static async init(haUrl: string): Promise<void> {
    this.authUrl = haUrl.endsWith('/') ? haUrl.slice(0, -1) : haUrl;
    
    try {
      // getAuth gère seul : PKCE, le code dans l'URL, et le chargement/sauvegarde
      this.auth = await getAuth({
        hassUrl: this.authUrl,
        // redirectUrl doit être identique au <link> dans index.html
        redirectUrl: window.location.origin + window.location.pathname,
        saveTokens: (tokens) => localStorage.setItem('ha-tokens', JSON.stringify(tokens)),
        loadTokens: async () => JSON.parse(localStorage.getItem('ha-tokens') || 'null'),
      });

      // Création de la connexion WebSocket
      this.connection = await createConnection({ auth: this.auth });
      
      console.log('[HA-Auth] Connexion établie avec succès');
      this.notifyAuthChange();

    } catch (err) {
      // Erreur 1 signifie simplement que l'utilisateur n'est pas encore connecté
      if (err !== 1) {
        console.error('[HA-Auth] Erreur d\'initialisation:', err);
      }
    }
  }

  // Lancer le flux OAuth2 (Remplace tes 100 lignes de PKCE manuel)
  static async authenticate(): Promise<void> {
    if (!this.authUrl) return;
    // On rappelle getAuth sans tokens pour forcer la redirection
    await getAuth({ hassUrl: this.authUrl });
  }

  // Plus besoin de handleCallback manuel ! getAuth le fait lors de l'init()
  
  static isAuthenticated(): boolean {
    return !!this.connection;
  }

  static getHAConnection(): Connection | null {
    return this.connection;
  }

  // Commande pour envoyer un service (version simplifiée)
  static async sendHACommand(service: string, entityId: string, data: any): Promise<any> {
    if (!this.connection) throw new Error('Non connecté');

    const [domain, serviceName] = service.split('.');
    return this.connection.sendMessagePromise({
      type: 'call_service',
      domain: domain,
      service: serviceName,
      service_data: data,
      target: { entity_id: entityId }
    });
  }

  static logout(): void {
    localStorage.removeItem('ha-tokens');
    window.location.reload(); // Rechargement propre pour réinitialiser l'état
  }

  private static notifyAuthChange(): void {
    this.authChangeCallbacks.forEach(cb => cb());
  }

  static onAuthChange(callback: () => void): () => void {
    this.authChangeCallbacks.add(callback);
    return () => this.authChangeCallbacks.delete(callback);
  }
}