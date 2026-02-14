export interface UIContainers {
  appContainer: HTMLElement;
  menuContainer: HTMLElement;
  mainContainer: HTMLElement;
  selectorContainer: HTMLElement;
  floorPlanContainer: HTMLElement;
}

export class UIInitializer {
  static initialize(): UIContainers {
    const appContainer = document.getElementById('app') || document.body;
    
    appContainer.style.cssText = `
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    `;

    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    menuContainer.style.cssText = `
      height: 36px;
      border-bottom: 1px solid #ddd;
      display: flex;
      align-items: center;
      padding-left: 6px;
    `;
    appContainer.appendChild(menuContainer);

    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
      flex: 1;
      display: flex;
      overflow: hidden;
    `;
    appContainer.appendChild(mainContainer);

    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'floorplan-selector-container';
    selectorContainer.style.cssText = `
      width: 100%;
      height: 100%;
    `;
    mainContainer.appendChild(selectorContainer);

    const floorPlanContainer = document.createElement('div');
    floorPlanContainer.id = 'floorplan-container';
    floorPlanContainer.style.cssText = `
      width: 100%;
      height: 100%;
      display: none;
      flex-direction: column;
    `;
    mainContainer.appendChild(floorPlanContainer);

    return {
      appContainer,
      menuContainer,
      mainContainer,
      selectorContainer,
      floorPlanContainer
    };
  }
}