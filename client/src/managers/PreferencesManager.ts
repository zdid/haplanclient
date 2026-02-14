export class PreferencesManager {
  private fontSize: number = 12;
  private fontColor: string = '#000000';
  private observers: Set<() => void> = new Set();

  constructor() {
    this.loadPreferences();
  }

  setFontSize(size: number): void {
    this.fontSize = size;
    this.savePreferences();
    this.notifyObservers();
  }

  getFontSize(): number {
    return this.fontSize;
  }

  setFontColor(color: string): void {
    this.fontColor = color;
    this.savePreferences();
    this.notifyObservers();
  }

  getFontColor(): string {
    return this.fontColor;
  }

  subscribe(observer: () => void): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: () => void): void {
    this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer());
  }

  private savePreferences(): void {
    const preferences = {
      fontSize: this.fontSize,
      fontColor: this.fontColor
    };
    localStorage.setItem('appPreferences', JSON.stringify(preferences));
    console.log('Préférences sauvegardées');
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('appPreferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.fontSize = preferences.fontSize || 12;
        this.fontColor = preferences.fontColor || '#000000';
        console.log('Préférences chargées');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  }
}