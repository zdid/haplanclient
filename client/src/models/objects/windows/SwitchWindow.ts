import { ContextWindow, getFormattedWindowTitle, applyFontSizeToWindow } from './ContextWindow';
import { MinimalLightObject } from '../MinimalLightObject';

export class SwitchWindow implements ContextWindow {
  entity: MinimalLightObject;
  element: HTMLElement;
  isSimple: boolean = true; // Fermeture automatique après action

  constructor(entity: MinimalLightObject) {
    this.entity = entity;
    this.element = this.render();
  }

  render(): HTMLElement {
    const window = document.createElement('div');
    window.className = 'context-window switch-window';
    
    // Appliquer les styles de base pour les fenêtres contextuelles
    window.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fond semi-transparent
    window.style.color = '#FFFFFF'; // Texte blanc
    window.style.padding = '15px';
    window.style.borderRadius = '8px';
    window.style.minWidth = '250px';
    window.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Titre formaté avec area - entity name
    const title = document.createElement('h3');
    title.textContent = getFormattedWindowTitle(this.entity);
    title.style.marginTop = '0';
    title.style.color = '#FFFFFF';
    title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    title.style.paddingBottom = '10px';
    window.appendChild(title);
    
    // Appliquer la taille de police
    applyFontSizeToWindow(window);

    // Bouton d'état
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-button';
    toggleBtn.textContent = this.entity.getDisplayValue('status') === 'ON' ? 'Éteindre' : 'Allumer';
    toggleBtn.addEventListener('click', () => {
      this.onAction('toggle');
      // Fermeture automatique après 500ms
      setTimeout(() => this.close(), 500);
    });
    window.appendChild(toggleBtn);

    return window;
  }

  onAction(action: string): void {
    this.entity.handleAction(action);
  }

  close(): void {
    // Cette fenêtre se ferme automatiquement
  }
}