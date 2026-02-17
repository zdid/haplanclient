import { HomeAssistantAuth } from '../auth/ha-auth';

export class HAAuthComponent {
  private container: HTMLElement;
  private haUrlInput!: HTMLInputElement;
  private loginButton!: HTMLButtonElement;
  private logoutButton!: HTMLButtonElement;
  private statusElement!: HTMLElement;
  private testConnectionButton!: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupUI();
    this.setupEventListeners();
    this.updateUI();
  }

  private setupUI(): void {
    this.container.innerHTML = `
      <div class="auth-container">
        <h2>Connexion à Home Assistant</h2>
        <div class="auth-form">
          <div class="form-group">
            <label for="ha-url">URL de votre instance Home Assistant:</label>
            <input type="text" id="ha-url" placeholder="https://votre-home-assistant:8123" 
                   value="${localStorage.getItem('haUrl') || ''}">
          </div>
          <button id="login-button" class="btn btn-primary">Se connecter avec Home Assistant</button>
          <button id="logout-button" class="btn btn-secondary" style="display: none;">Se déconnecter</button>
          <button id="test-connection" class="btn btn-info" style="display: none;">Tester la connexion</button>
        </div>
        <div class="auth-status" id="auth-status"></div>
      </div>
    `;

    this.haUrlInput = this.container.querySelector('#ha-url') as HTMLInputElement;
    this.loginButton = this.container.querySelector('#login-button') as HTMLButtonElement;
    this.logoutButton = this.container.querySelector('#logout-button') as HTMLButtonElement;
    this.testConnectionButton = this.container.querySelector('#test-connection') as HTMLButtonElement;
    this.statusElement = this.container.querySelector('#auth-status') as HTMLElement;

    // Appliquer les styles
    this.applyStyles();
  }

  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .auth-container {
        max-width: 500px;
        margin: 50px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      
      .auth-container h2 {
        color: #333;
        margin-bottom: 20px;
      }
      
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .form-group {
        text-align: left;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
      }
      
      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn-primary {
        background-color: #4285F4;
        color: white;
      }
      
      .btn-primary:hover {
        background-color: #3367D6;
      }
      
      .btn-secondary {
        background-color: #f1f3f4;
        color: #333;
      }
      
      .btn-secondary:hover {
        background-color: #e8eaed;
      }
      
      .btn-info {
        background-color: #2196F3;
        color: white;
      }
      
      .btn-info:hover {
        background-color: #0b7dda;
      }
      
      .auth-status {
        margin-top: 20px;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .status-success {
        color: #2E7D32;
        background-color: #E8F5E9;
      }
      
      .status-error {
        color: #C62828;
        background-color: #FFEBEE;
      }
      
      .status-info {
        color: #1565C0;
        background-color: #E3F2FD;
      }
      
      .ha-logo {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        background: #03A9F4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 24px;
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    this.loginButton.addEventListener('click', async () => {
      await this.handleLogin();
    });

    this.logoutButton.addEventListener('click', () => {
      this.handleLogout();
    });

    this.testConnectionButton.addEventListener('click', async () => {
      await this.testConnection();
    });

    // Écouter les changements d'authentification
    HomeAssistantAuth.onAuthChange(() => {
      this.updateUI();
    });

    // Sauvegarder l'URL quand elle change
    this.haUrlInput.addEventListener('change', () => {
      localStorage.setItem('haUrl', this.haUrlInput.value);
    });
  }

  private async handleLogin(): Promise<void> {
    const haUrl = this.haUrlInput.value.trim();
    if (!haUrl) return;

    localStorage.setItem('haUrl', haUrl);
  
    // 1. On initialise l'URL
    await HomeAssistantAuth.init(haUrl);
  
    // 2. On lance la redirection vers HA (la bibliothèque gère PKCE toute seule)
    await HomeAssistantAuth.authenticate();
}
    
  private handleLogout(): void {
    HomeAssistantAuth.logout();
    this.showStatus('Vous avez été déconnecté', 'info');
    this.updateUI();
  }

  private async testConnection(): Promise<void> {
    //try {
      this.showStatus('Test de connexion en cours... en fait je ne fais rien pour l\'instant:', 'info');
      
    //   if (isValid) {
    //     // Essayer de récupérer des données simples
    //     const states = await HomeAssistantAuth.fetchHAData('get_states');
    //     this.showStatus(`Connecté avec succès! ${states.length} entités disponibles`, 'success');
    //   } else {
    //     this.showStatus('Token invalide ou expiré', 'error');
    //   }
    // } catch (error) {
    //   console.error('Erreur test connexion:', error);
    //   this.showStatus('Erreur de connexion: ' + (error instanceof Error ? error.message : String(error)), 'error');
    // }
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.statusElement.textContent = message;
    this.statusElement.className = 'auth-status status-' + type;
  }

  updateUI(): void {
    const isAuthenticated = HomeAssistantAuth.isAuthenticated();
    
    if (isAuthenticated) {
      this.loginButton.style.display = 'none';
      this.logoutButton.style.display = 'block';
      this.testConnectionButton.style.display = 'block';
      this.showStatus('Connecté à Home Assistant', 'success');
    } else {
      this.loginButton.style.display = 'block';
      this.logoutButton.style.display = 'none';
      this.testConnectionButton.style.display = 'none';
      this.showStatus('Non connecté', 'info');
    }
  }

  cleanup(): void {
    // Nettoyer les écouteurs d'événements
    this.loginButton.removeEventListener('click', this.handleLogin);
    this.logoutButton.removeEventListener('click', this.handleLogout);
    this.testConnectionButton.removeEventListener('click', this.testConnection);
  }
}