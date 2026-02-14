var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/ui/draganddropconstrained.ts
var DragAndDropConstrained = class {
  /**
   * @param elementSelector - Sélecteur CSS de l'élément à rendre "draggable".
   *                         Le conteneur parent sera utilisé automatiquement comme zone de mouvement.
   * @param onDragEnd - Callback appelé à la fin du drag avec la position finale
   * @param constraintMode - Mode de contrainte: 'full' (objet entier dans la zone) ou 'center' (centre dans la zone)
   */
  constructor(elementSelector, onDragEnd, constraintMode = "center") {
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    /**
     * Début du glisser : calcule les offsets et active le mode "dragging".
     * @param event - Événement de souris.
     */
    this.startDrag = (event) => {
      console.log(`[TRACE] DragAndDropConstrained.startDrag() appel\xE9`, event);
      event.preventDefault();
      this.isDragging = true;
      const rect = this.element.getBoundingClientRect();
      if (this.constraintMode === "full") {
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;
        console.log(`[TRACE] Offset calcul\xE9 en mode 'full' (coin sup\xE9rieur gauche):`, { offsetX: this.offsetX, offsetY: this.offsetY });
      } else {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.offsetX = event.clientX - centerX;
        this.offsetY = event.clientY - centerY;
        console.log(`[TRACE] Offset calcul\xE9 en mode 'center' (centre):`, { offsetX: this.offsetX, offsetY: this.offsetY });
      }
    };
    /**
     * Pendant le glisser : déplace l'élément en respectant les contraintes du conteneur.
     * @param event - Événement de souris.
     */
    this.drag = (event) => {
      if (!this.isDragging) {
        return;
      }
      console.log(`[TRACE] DragAndDropConstrained.drag() appel\xE9`, event);
      let newX = event.clientX - this.offsetX;
      let newY = event.clientY - this.offsetY;
      const containerRect = this.container.getBoundingClientRect();
      const elementRect = this.element.getBoundingClientRect();
      if (this.constraintMode === "full") {
        newX = Math.max(containerRect.left, Math.min(newX, containerRect.right - elementRect.width));
        newY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - elementRect.height));
        console.log(`[TRACE] Application des contraintes en mode 'full' (objet entier dans la zone)`);
      } else {
        const centerX = event.clientX - this.offsetX + elementRect.width / 2;
        const centerY = event.clientY - this.offsetY + elementRect.height / 2;
        const constrainedCenterX = Math.max(
          containerRect.left + elementRect.width / 2,
          Math.min(centerX, containerRect.right - elementRect.width / 2)
        );
        const constrainedCenterY = Math.max(
          containerRect.top + elementRect.height / 2,
          Math.min(centerY, containerRect.bottom - elementRect.height / 2)
        );
        newX = constrainedCenterX - elementRect.width / 2;
        newY = constrainedCenterY - elementRect.height / 2;
        console.log(`[TRACE] Application des contraintes en mode 'center' (centre dans la zone)`);
      }
      this.element.style.left = `${newX - containerRect.left}px`;
      this.element.style.top = `${newY - containerRect.top}px`;
      console.log(`[TRACE] \xC9l\xE9ment d\xE9plac\xE9 \xE0:`, { left: this.element.style.left, top: this.element.style.top });
    };
    /**
     * Fin du glisser : désactive le mode "dragging".
     */
    this.endDrag = () => {
      console.log(`[TRACE] DragAndDropConstrained.endDrag() appel\xE9`);
      this.isDragging = false;
      console.log(`[TRACE] isDragging r\xE9initialis\xE9 \xE0 false`);
      if (this.onDragEnd) {
        const elementRect = this.element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        let finalPosition;
        if (this.constraintMode === "full") {
          finalPosition = {
            x: parseFloat(this.element.style.left) || 0,
            y: parseFloat(this.element.style.top) || 0
          };
          console.log(`[TRACE] Position finale en mode 'full' (coin sup\xE9rieur gauche):`, finalPosition);
        } else {
          finalPosition = {
            x: elementRect.left - containerRect.left + elementRect.width / 2,
            y: elementRect.top - containerRect.top + elementRect.height / 2
          };
          console.log(`[TRACE] Position finale en mode 'center' (centre):`, finalPosition);
        }
        this.onDragEnd(finalPosition);
      }
    };
    this.element = document.querySelector(elementSelector);
    if (!this.element) {
      throw new Error(`\xC9l\xE9ment introuvable avec le s\xE9lecteur : ${elementSelector}`);
    }
    this.container = this.element.parentElement;
    if (!this.container) {
      throw new Error("Conteneur introuvable.");
    }
    this.onDragEnd = onDragEnd;
    this.constraintMode = constraintMode;
    console.log(`[TRACE] DragAndDropConstrained initialis\xE9 avec mode de contrainte: ${constraintMode}`);
    this.init();
  }
  /**
   * Initialise les écouteurs d'événements pour le drag and drop.
   */
  init() {
    console.log(`[TRACE] DragAndDropConstrained.init() appel\xE9 pour l'\xE9l\xE9ment:`, this.element);
    this.element.style.position = "absolute";
    this.element.style.cursor = "move";
    this.element.style.userSelect = "none";
    console.log(`[TRACE] Ajout des \xE9couteurs d'\xE9v\xE9nements`);
    this.element.addEventListener("mousedown", this.startDrag);
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("mouseup", this.endDrag);
    console.log(`[TRACE] \xC9couteurs d'\xE9v\xE9nements ajout\xE9s avec succ\xE8s`);
  }
  /**
   * Nettoie les écouteurs d'événements (à appeler si la classe est détruite).
   */
  destroy() {
    this.element.removeEventListener("mousedown", this.startDrag);
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("mouseup", this.endDrag);
  }
};

// src/models/objects/HAObject.ts
var HAObject = class {
  constructor(entity_id, position, commandService) {
    this.element = null;
    this.commandService = null;
    this.positionManager = null;
    this.dragHandler = null;
    this.entity_id = entity_id;
    this.position = position;
    this.commandService = commandService || null;
  }
  // Méthode pour s'assurer que l'élément a un ID
  ensureElementHasId(element) {
    if (!element.id) {
      element.id = `ha-object-${this.entity_id.replace(/\./g, "-")}`;
    }
    return element;
  }
  getEntity_id() {
    return this.entity_id;
  }
  getPosition() {
    return this.position;
  }
  setPosition(x, y) {
    this.position = { x, y };
  }
  setDataService(commandService) {
    this.commandService = commandService;
  }
  setPositionManager(positionManager) {
    this.positionManager = positionManager;
  }
  setElement(element) {
    this.element = element;
  }
  enableDrag() {
    return __async(this, null, function* () {
      if (this.element && !this.dragHandler) {
        this.ensureElementHasId(this.element);
        try {
          yield this.getDragContainer();
          this.initializeDragHandler();
        } catch (error) {
          console.error(`Failed to enable drag for object ${this.entity_id}:`, error);
          throw error;
        }
      }
    });
  }
  // Méthode asynchrone pour obtenir le conteneur de drag-and-drop
  // Attend jusqu'à 2 secondes maximum avant d'échouer
  getDragContainer() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const maxWaitTime = 2e3;
      const checkContainer = () => {
        const container = document.getElementById("floorplan-drag-container");
        if (container) {
          resolve(container);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error("Drag container (floorplan-drag-container) not found after 2 seconds"));
        } else {
          setTimeout(checkContainer, 100);
        }
      };
      checkContainer();
    });
  }
  initializeDragHandler() {
    console.log(`[TRACE] Initialisation du drag handler pour ${this.entity_id}`);
    console.log(`[TRACE] \xC9l\xE9ment ID: ${this.element.id}, \xC9l\xE9ment:`, this.element);
    this.element.setAttribute("draggable", "false");
    try {
      const onDragEndCallback = (finalPosition) => __async(this, null, function* () {
        console.log(`[TRACE] Callback de fin de drag appel\xE9 pour ${this.entity_id} avec position:`, finalPosition);
        const trashIcon = document.querySelector(".trash-icon");
        if (trashIcon && this.isMouseOverTrashIcon(trashIcon, finalPosition)) {
          console.log(`[TRACE] Objet ${this.entity_id} dropp\xE9 sur la poubelle, suppression...`);
          this.removeObjectFromFloorPlan();
          return;
        }
        if (this.positionManager && this.element) {
          try {
            const rect = this.element.getBoundingClientRect();
            const containerRect = (yield this.getDragContainer()).getBoundingClientRect();
            if (containerRect) {
              const x = finalPosition.x / containerRect.width;
              const y = finalPosition.y / containerRect.height;
              console.log(`[TRACE] Fin de d\xE9placement d\xE9tect\xE9e pour ${this.entity_id}:`, {
                elementRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                containerRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height },
                finalPosition: { x, y }
              });
              this.positionManager.updatePosition(this.entity_id, x, y);
              this.position = { x, y };
              console.log(`[TRACE] Position finale sauvegard\xE9e pour ${this.entity_id}:`, { x, y });
            }
          } catch (error) {
            console.error(`[TRACE] Erreur dans le callback de fin de drag pour ${this.entity_id}:`, error);
          }
        }
      });
      console.log(`[TRACE] Cr\xE9ation de DragAndDropConstrained pour #${this.element.id} avec callback et mode center`);
      this.dragHandler = new DragAndDropConstrained(
        `#${this.element.id}`,
        onDragEndCallback,
        "center"
        // Mode de contrainte pour les objets HA
      );
      console.log(`[TRACE] DragAndDropConstrained cr\xE9\xE9 avec succ\xE8s avec callback et mode center`);
      console.log("element:", this.element);
      this.element.classList.add("ha-object-draggable");
      console.log(`Drag successfully initialized for object ${this.entity_id}`);
    } catch (error) {
      console.error(`Failed to initialize drag for object ${this.entity_id}:`, error);
    }
  }
  /**
   * Vérifie si une position est au-dessus de la poubelle
   * @param trashIcon L'icône de la poubelle
   * @param position La position à vérifier (en pixels par rapport au conteneur)
   * @returns True si la position est au-dessus de la poubelle
   */
  isMouseOverTrashIcon(trashIcon, position) {
    var _a;
    const trashRect = trashIcon.getBoundingClientRect();
    const containerRect = (_a = this.getDragContainer()) == null ? void 0 : _a.getBoundingClientRect();
    if (!containerRect) {
      return false;
    }
    const absoluteX = containerRect.left + position.x;
    const absoluteY = containerRect.top + position.y;
    return absoluteX >= trashRect.left && absoluteX <= trashRect.right && absoluteY >= trashRect.top && absoluteY <= trashRect.bottom;
  }
  /**
   * Supprime l'objet du floor plan
   */
  removeObjectFromFloorPlan() {
    console.log(`[TRACE] Suppression de l'objet ${this.entity_id} du floor plan`);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.positionManager) {
      this.positionManager.removePosition(this.entity_id);
    }
    this.disableDrag();
  }
  disableDrag() {
    if (this.dragHandler) {
      this.dragHandler.destroy();
      this.dragHandler = null;
    }
    if (this.element) {
      this.element.classList.remove("ha-object-draggable");
    }
  }
  sendCommand(service, serviceData) {
    if (this.commandService && this.commandService.isConnected()) {
      this.commandService.sendCommand(this.entity_id, service, serviceData);
    } else {
      console.warn(`Cannot send command: ${service} - DataService not available or not connected`);
    }
  }
  destroy() {
    this.disableDrag();
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
};

// src/models/objects/BaseEntity.ts
var BaseEntity = class extends HAObject {
  constructor(entity_id, position, dimensions = { width: 60, height: 60 }, commandService) {
    super(entity_id, position, commandService);
    this.displayValues = /* @__PURE__ */ new Map();
    this.visualStyle = "icon";
    this.contextWindow = null;
    this.dimensions = dimensions;
    this.colorScheme = {
      primary: "#4285F4",
      secondary: "#34A853",
      background: "#FFFFFF",
      text: "#333333"
    };
  }
  // Méthode pour définir les valeurs à afficher
  setDisplayValue(key, value) {
    this.displayValues.set(key, value);
    this.updateDisplay();
  }
  // Méthode pour obtenir une valeur à afficher
  getDisplayValue(key) {
    return this.displayValues.get(key);
  }
  // Méthode pour définir le style visuel
  setVisualStyle(style) {
    this.visualStyle = style;
    if (this.element) {
      this.element.className = this.element.className.replace(
        /\b(icon|card|gauge|slider|minimal)-style\b/g,
        ""
      );
      this.element.classList.add(`${style}-style`);
    }
  }
  // Méthode pour définir les dimensions
  setDimensions(width, height) {
    this.dimensions = { width, height };
    if (this.element) {
      this.element.style.width = `${width}px`;
      this.element.style.height = `${height}px`;
    }
  }
  // Méthode pour obtenir les dimensions
  getDimensions() {
    return this.dimensions;
  }
  // Méthode pour définir le schéma de couleurs
  setColorScheme(scheme) {
    this.colorScheme = __spreadValues(__spreadValues({}, this.colorScheme), scheme);
    this.updateDisplay();
  }
  // Implémentation de la méthode render de HAObject
  render() {
    const container = this.renderEntity();
    container.style.width = `${this.dimensions.width}px`;
    container.style.height = `${this.dimensions.height}px`;
    container.classList.add(`${this.visualStyle}-style`);
    this.applyColorScheme(container);
    container.classList.add("base-entity", "ha-object");
    this.element = container;
    return container;
  }
  // Appliquer le schéma de couleurs à un élément
  applyColorScheme(element) {
    element.style.setProperty("--entity-primary-color", this.colorScheme.primary);
    element.style.setProperty("--entity-secondary-color", this.colorScheme.secondary);
    element.style.setProperty("--entity-background-color", this.colorScheme.background);
    element.style.setProperty("--entity-text-color", this.colorScheme.text);
  }
  // Méthode pour créer un élément avec style de base
  createStyledElement(tag, className, content = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.innerHTML = content;
    this.applyColorScheme(element);
    return element;
  }
  // Méthode pour créer un badge de valeur
  createValueBadge(label, value, unit = "") {
    const badge = this.createStyledElement("div", "value-badge");
    badge.innerHTML = `
      <span class="badge-label">${label}:</span>
      <span class="badge-value">${value}</span>
      ${unit ? `<span class="badge-unit">${unit}</span>` : ""}
    `;
    return badge;
  }
  // Méthode pour créer un indicateur d'état
  createStatusIndicator(status) {
    const indicator = this.createStyledElement("div", "status-indicator");
    let color, icon;
    switch (status) {
      case "on":
        color = "var(--entity-secondary-color)";
        icon = "fa-check-circle";
        break;
      case "off":
        color = "#999999";
        icon = "fa-circle";
        break;
      case "warning":
        color = "#FFC107";
        icon = "fa-exclamation-triangle";
        break;
      case "error":
        color = "#F44336";
        icon = "fa-exclamation-circle";
        break;
    }
    indicator.innerHTML = `<i class="fas ${icon}" style="color: ${color}"></i>`;
    return indicator;
  }
  // Méthode pour créer un conteneur de valeurs
  createValuesContainer() {
    const container = this.createStyledElement("div", "values-container");
    this.displayValues.forEach((value, key) => {
      const badge = this.createValueBadge(key, value);
      container.appendChild(badge);
    });
    return container;
  }
  // Méthode pour créer un titre
  createTitle(title) {
    const titleElement = this.createStyledElement("div", "entity-title");
    titleElement.textContent = title;
    return titleElement;
  }
  // Méthode pour créer une icône
  createIcon(iconClass, size = "medium") {
    const icon = this.createStyledElement("div", `entity-icon ${size}`);
    icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    return icon;
  }
  // Méthode pour créer un contrôleur (boutons, sliders, etc.)
  createController(type) {
    switch (type) {
      case "button":
        return this.createStyledElement("button", "entity-button", '<i class="fas fa-power-off"></i>');
      case "slider":
        const slider = this.createStyledElement("input", "entity-slider");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "100");
        return slider;
      case "switch":
        return this.createStyledElement("div", "entity-switch");
    }
  }
  // Méthode pour définir la fenêtre contextuelle
  setContextWindow(window2) {
    this.contextWindow = window2;
    this.setupClickHandler();
  }
  // Méthode pour obtenir la fenêtre contextuelle
  getContextWindow() {
    return this.contextWindow;
  }
  // Méthode pour configurer le gestionnaire de clics
  setupClickHandler() {
    if (this.element) {
      this.element.style.cursor = "pointer";
      this.element.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onClick();
      });
    }
  }
  // Méthode appelée lors du clic
  onClick() {
    if (this.contextWindow) {
      const windowManager = ContextWindowManager.getInstance();
      windowManager.showWindow(this, this.contextWindow);
    }
  }
  // Méthode pour détruire l'entité
  destroy() {
    super.destroy();
    this.displayValues.clear();
  }
};

// src/models/objects/EnhancedLightObject.ts
var EnhancedLightObject = class extends BaseEntity {
  constructor(entity_id, position, dimensions = { width: 80, height: 80 }, commandService) {
    super(entity_id, position, dimensions, commandService);
    this.isOn = false;
    this.brightness = 0;
    this.setVisualStyle("card");
    this.setColorScheme({
      primary: "#FFD700",
      // Or
      secondary: "#FFC107",
      // Ambre
      background: "#FFFFFF",
      text: "#333333"
    });
  }
  updateState(state) {
    var _a;
    this.isOn = state.state === "on";
    this.brightness = ((_a = state.attributes) == null ? void 0 : _a.brightness) || (this.isOn ? 255 : 0);
    this.setDisplayValue("status", this.isOn ? "ON" : "OFF");
    this.setDisplayValue("brightness", this.brightness);
    this.updateDisplay();
  }
  renderEntity() {
    const container = this.createStyledElement("div", "enhanced-light-object");
    const title = this.createTitle(this.getEntity_id().split(".")[1].replace(/_/g, " "));
    const icon = this.createIcon("fa-lightbulb", "large");
    const statusIndicator = this.createStatusIndicator(this.isOn ? "on" : "off");
    const controller = this.createController("button");
    controller.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });
    const valuesContainer = this.createValuesContainer();
    container.appendChild(title);
    container.appendChild(icon);
    container.appendChild(statusIndicator);
    container.appendChild(controller);
    container.appendChild(valuesContainer);
    container.addEventListener("click", () => this.toggle());
    return container;
  }
  updateDisplay() {
    if (!this.element) return;
    const icon = this.element.querySelector(".entity-icon");
    if (icon) {
      const bulbIcon = icon.querySelector("i");
      if (bulbIcon) {
        bulbIcon.className = `fas fa-lightbulb`;
        bulbIcon.style.opacity = this.isOn ? "1" : "0.3";
        bulbIcon.style.color = this.isOn ? this.colorScheme.primary : "#999999";
      }
    }
    const statusIndicator = this.element.querySelector(".status-indicator");
    if (statusIndicator) {
      statusIndicator.innerHTML = this.createStatusIndicator(this.isOn ? "on" : "off").innerHTML;
    }
    const button = this.element.querySelector(".entity-button");
    if (button) {
      const buttonIcon = button.querySelector("i");
      if (buttonIcon) {
        buttonIcon.className = `fas ${this.isOn ? "fa-power-off" : "fa-power-off"}`;
      }
    }
    const valuesContainer = this.element.querySelector(".values-container");
    if (valuesContainer) {
      valuesContainer.innerHTML = "";
      const newValuesContainer = this.createValuesContainer();
      valuesContainer.appendChild(newValuesContainer);
    }
  }
  toggle() {
    this.sendCommand(this.isOn ? "turn_off" : "turn_on");
  }
  handleAction(action) {
    if (action === "toggle") {
      this.toggle();
    }
  }
};

// src/models/objects/MinimalLightObject.ts
var MinimalLightObject = class extends EnhancedLightObject {
  constructor(entity_id, position, dimensions = { width: 50, height: 50 }, commandService) {
    super(entity_id, position, dimensions, commandService);
    this.setVisualStyle("minimal");
    this.setColorScheme({
      primary: "#FFD700",
      // Or
      secondary: "#FFC107",
      // Ambre
      background: "transparent",
      // Fond transparent pour le style minimal
      text: "#333333"
    });
  }
  renderEntity() {
    const container = this.createStyledElement("div", "minimal-light-object");
    const icon = this.createIcon("fa-lightbulb", "large");
    container.appendChild(icon);
    container.addEventListener("click", () => this.toggle());
    return container;
  }
  updateDisplay() {
    if (!this.element) return;
    const icon = this.element.querySelector(".entity-icon");
    if (icon) {
      const bulbIcon = icon.querySelector("i");
      if (bulbIcon) {
        bulbIcon.className = `fas fa-lightbulb`;
        bulbIcon.style.opacity = this.isOn ? "1" : "0.3";
        bulbIcon.style.color = this.isOn ? this.colorScheme.primary : "#999999";
      }
    }
  }
  // Méthode pour obtenir l'élément de l'icône uniquement
  getIconElement() {
    if (this.element) {
      return this.element.querySelector(".entity-icon");
    }
    return null;
  }
  // Méthode pour obtenir l'élément de l'icône Font Awesome
  getIcon() {
    const iconElement = this.getIconElement();
    if (iconElement) {
      return iconElement.querySelector("i");
    }
    return null;
  }
};

// src/models/objects/EnhancedTemperatureSensor.ts
var EnhancedTemperatureSensor = class extends BaseEntity {
  constructor(entity_id, position, dimensions = { width: 100, height: 100 }, commandService) {
    super(entity_id, position, dimensions, commandService);
    this.temperature = 0;
    this.unit = "\xB0C";
    this.setVisualStyle("gauge");
    this.setColorScheme({
      primary: "#F44336",
      // Rouge
      secondary: "#FF5722",
      // Rouge profond
      background: "#FFFFFF",
      text: "#333333"
    });
  }
  updateState(state) {
    this.temperature = parseFloat(state.state) || 0;
    let status = "on";
    if (this.temperature < 5) status = "warning";
    else if (this.temperature > 35) status = "error";
    else status = "on";
    this.setDisplayValue("temperature", this.temperature);
    this.setDisplayValue("status", status);
    this.updateDisplay();
  }
  renderEntity() {
    const container = this.createStyledElement("div", "enhanced-temperature-sensor");
    const title = this.createTitle(this.getEntity_id().split(".")[1].replace(/_/g, " "));
    const icon = this.createIcon("fa-thermometer-half", "large");
    const status = this.getTemperatureStatus();
    const statusIndicator = this.createStatusIndicator(status);
    const tempDisplay = this.createStyledElement("div", "temperature-display");
    tempDisplay.innerHTML = `
      <span class="temp-value">${this.temperature}</span>
      <span class="temp-unit">${this.unit}</span>
    `;
    const tempBarContainer = this.createStyledElement("div", "temperature-bar-container");
    const tempBar = this.createStyledElement("div", "temperature-bar");
    tempBar.style.width = `${this.getTemperaturePercentage()}%`;
    tempBarContainer.appendChild(tempBar);
    const valuesContainer = this.createValuesContainer();
    container.appendChild(title);
    container.appendChild(icon);
    container.appendChild(statusIndicator);
    container.appendChild(tempDisplay);
    container.appendChild(tempBarContainer);
    container.appendChild(valuesContainer);
    return container;
  }
  updateDisplay() {
    if (!this.element) return;
    const tempDisplay = this.element.querySelector(".temperature-display");
    if (tempDisplay) {
      tempDisplay.innerHTML = `
        <span class="temp-value">${this.temperature}</span>
        <span class="temp-unit">${this.unit}</span>
      `;
    }
    const tempBar = this.element.querySelector(".temperature-bar");
    if (tempBar) {
      tempBar.style.width = `${this.getTemperaturePercentage()}%`;
      const status = this.getTemperatureStatus();
      switch (status) {
        case "warning":
          tempBar.style.backgroundColor = "#FFC107";
          break;
        case "error":
          tempBar.style.backgroundColor = "#F44336";
          break;
        default:
          tempBar.style.backgroundColor = this.colorScheme.primary;
      }
    }
    const statusIndicator = this.element.querySelector(".status-indicator");
    if (statusIndicator) {
      const status = this.getTemperatureStatus();
      statusIndicator.innerHTML = this.createStatusIndicator(status).innerHTML;
    }
    const valuesContainer = this.element.querySelector(".values-container");
    if (valuesContainer) {
      valuesContainer.innerHTML = "";
      const newValuesContainer = this.createValuesContainer();
      valuesContainer.appendChild(newValuesContainer);
    }
  }
  getTemperatureStatus() {
    if (this.temperature < 5) return "warning";
    if (this.temperature > 35) return "error";
    return "on";
  }
  getTemperaturePercentage() {
    const minTemp = -10;
    const maxTemp = 40;
    const percentage = (this.temperature - minTemp) / (maxTemp - minTemp) * 100;
    return Math.max(0, Math.min(100, percentage));
  }
  handleAction(action) {
    console.log(`Action ${action} received by temperature sensor, but no action taken.`);
  }
};

// src/models/objects/windows/LightWindow.ts
var LightWindow = class {
  constructor(entity) {
    this.isSimple = false;
    this.entity = entity;
    this.element = this.render();
  }
  render() {
    var _a;
    const window2 = document.createElement("div");
    window2.className = "context-window light-window";
    const title = document.createElement("h3");
    title.textContent = this.entity.getEntity_id().split(".")[1].replace(/_/g, " ");
    window2.appendChild(title);
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-button";
    toggleBtn.textContent = this.entity.getDisplayValue("status") === "ON" ? "\xC9teindre" : "Allumer";
    toggleBtn.addEventListener("click", () => this.onAction("toggle"));
    window2.appendChild(toggleBtn);
    if (this.entity instanceof EnhancedLightObject) {
      const brightnessContainer = document.createElement("div");
      brightnessContainer.className = "brightness-control";
      const brightnessLabel = document.createElement("label");
      brightnessLabel.textContent = "Luminosit\xE9:";
      brightnessContainer.appendChild(brightnessLabel);
      const brightnessInput = document.createElement("input");
      brightnessInput.type = "range";
      brightnessInput.min = "0";
      brightnessInput.max = "255";
      brightnessInput.value = ((_a = this.entity.getDisplayValue("brightness")) == null ? void 0 : _a.toString()) || "0";
      brightnessInput.addEventListener("input", (e) => {
        this.onAction("set_brightness", e.target.value);
      });
      brightnessContainer.appendChild(brightnessInput);
      const brightnessValue = document.createElement("span");
      brightnessValue.className = "brightness-value";
      brightnessValue.textContent = brightnessInput.value;
      brightnessContainer.appendChild(brightnessValue);
      brightnessInput.addEventListener("input", (e) => {
        brightnessValue.textContent = e.target.value;
      });
      window2.appendChild(brightnessContainer);
    }
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-button";
    closeBtn.textContent = "Fermer";
    closeBtn.addEventListener("click", () => this.close());
    window2.appendChild(closeBtn);
    return window2;
  }
  onAction(action, value) {
    switch (action) {
      case "toggle":
        this.entity.handleAction("toggle");
        break;
      case "set_brightness":
        this.entity.updateState({
          state: "on",
          attributes: { brightness: parseInt(value) }
        });
        break;
    }
    this.updateDisplay();
  }
  updateDisplay() {
    var _a;
    const toggleBtn = this.element.querySelector(".toggle-button");
    if (toggleBtn) {
      toggleBtn.textContent = this.entity.getDisplayValue("status") === "ON" ? "\xC9teindre" : "Allumer";
    }
    if (this.entity instanceof EnhancedLightObject) {
      const brightnessInput = this.element.querySelector('input[type="range"]');
      const brightnessValue = this.element.querySelector(".brightness-value");
      if (brightnessInput && brightnessValue) {
        const brightness = ((_a = this.entity.getDisplayValue("brightness")) == null ? void 0 : _a.toString()) || "0";
        brightnessInput.value = brightness;
        brightnessValue.textContent = brightness;
      }
    }
  }
  close() {
  }
};

// src/models/objects/windows/SwitchWindow.ts
var SwitchWindow = class {
  // Fermeture automatique après action
  constructor(entity) {
    this.isSimple = true;
    this.entity = entity;
    this.element = this.render();
  }
  render() {
    const window2 = document.createElement("div");
    window2.className = "context-window switch-window";
    const title = document.createElement("h3");
    title.textContent = this.entity.getEntity_id().split(".")[1].replace(/_/g, " ");
    window2.appendChild(title);
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-button";
    toggleBtn.textContent = this.entity.getDisplayValue("status") === "ON" ? "\xC9teindre" : "Allumer";
    toggleBtn.addEventListener("click", () => {
      this.onAction("toggle");
      setTimeout(() => this.close(), 500);
    });
    window2.appendChild(toggleBtn);
    return window2;
  }
  onAction(action) {
    this.entity.handleAction(action);
  }
  close() {
  }
};

// src/models/objects/windows/ThermostatWindow.ts
var ThermostatWindow = class {
  constructor(entity) {
    this.isSimple = false;
    this.entity = entity;
    this.element = this.render();
  }
  render() {
    var _a;
    const window2 = document.createElement("div");
    window2.className = "context-window thermostat-window";
    const title = document.createElement("h3");
    title.textContent = this.entity.getEntity_id().split(".")[1].replace(/_/g, " ");
    window2.appendChild(title);
    const currentTemp = document.createElement("div");
    currentTemp.className = "current-temperature";
    currentTemp.innerHTML = `
      <span>Temp\xE9rature actuelle:</span>
      <strong>${this.entity.getDisplayValue("temperature") || "N/A"}\xB0C</strong>
    `;
    window2.appendChild(currentTemp);
    const tempControl = document.createElement("div");
    tempControl.className = "temperature-control";
    const tempLabel = document.createElement("label");
    tempLabel.textContent = "Temp\xE9rature cible:";
    tempControl.appendChild(tempLabel);
    const tempInput = document.createElement("input");
    tempInput.type = "number";
    tempInput.min = "5";
    tempInput.max = "35";
    tempInput.value = ((_a = this.entity.getDisplayValue("target_temp")) == null ? void 0 : _a.toString()) || "20";
    tempInput.addEventListener("change", (e) => {
      this.onAction("set_temperature", e.target.value);
    });
    tempControl.appendChild(tempInput);
    const tempUnit = document.createElement("span");
    tempUnit.textContent = "\xB0C";
    tempControl.appendChild(tempUnit);
    window2.appendChild(tempControl);
    const quickControls = document.createElement("div");
    quickControls.className = "quick-controls";
    const decreaseBtn = document.createElement("button");
    decreaseBtn.textContent = "-1\xB0C";
    decreaseBtn.addEventListener("click", () => {
      var _a2;
      const current = parseInt(((_a2 = this.entity.getDisplayValue("target_temp")) == null ? void 0 : _a2.toString()) || "20");
      this.onAction("set_temperature", (current - 1).toString());
    });
    quickControls.appendChild(decreaseBtn);
    const increaseBtn = document.createElement("button");
    increaseBtn.textContent = "+1\xB0C";
    increaseBtn.addEventListener("click", () => {
      var _a2;
      const current = parseInt(((_a2 = this.entity.getDisplayValue("target_temp")) == null ? void 0 : _a2.toString()) || "20");
      this.onAction("set_temperature", (current + 1).toString());
    });
    quickControls.appendChild(increaseBtn);
    window2.appendChild(quickControls);
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-button";
    closeBtn.textContent = "Fermer";
    closeBtn.addEventListener("click", () => this.close());
    window2.appendChild(closeBtn);
    return window2;
  }
  onAction(action, value) {
    switch (action) {
      case "set_temperature":
        this.entity.sendCommand("set_temperature", { temperature: parseFloat(value) });
        break;
    }
    this.updateDisplay();
  }
  updateDisplay() {
    var _a;
    const currentTemp = this.element.querySelector(".current-temperature strong");
    if (currentTemp) {
      currentTemp.textContent = `${this.entity.getDisplayValue("temperature") || "N/A"}\xB0C`;
    }
    const tempInput = this.element.querySelector('input[type="number"]');
    if (tempInput) {
      tempInput.value = ((_a = this.entity.getDisplayValue("target_temp")) == null ? void 0 : _a.toString()) || "20";
    }
  }
  close() {
  }
};

// src/models/objects/windows/GenericWindow.ts
var GenericWindow = class {
  constructor(entity) {
    this.isSimple = false;
    this.entity = entity;
    this.element = this.render();
  }
  render() {
    const window2 = document.createElement("div");
    window2.className = "context-window generic-window";
    const title = document.createElement("h3");
    title.textContent = this.entity.getEntity_id().split(".")[1].replace(/_/g, " ");
    window2.appendChild(title);
    const valuesContainer = document.createElement("div");
    valuesContainer.className = "entity-values";
    const displayValues = this.entity["displayValues"];
    if (displayValues) {
      displayValues.forEach((value, key) => {
        const valueRow = document.createElement("div");
        valueRow.className = "value-row";
        const valueLabel = document.createElement("span");
        valueLabel.className = "value-label";
        valueLabel.textContent = `${key}:`;
        valueRow.appendChild(valueLabel);
        const valueContent = document.createElement("span");
        valueContent.className = "value-content";
        valueContent.textContent = value.toString();
        valueRow.appendChild(valueContent);
        valuesContainer.appendChild(valueRow);
      });
    }
    window2.appendChild(valuesContainer);
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-button";
    closeBtn.textContent = "Fermer";
    closeBtn.addEventListener("click", () => this.close());
    window2.appendChild(closeBtn);
    return window2;
  }
  onAction(action, value) {
    console.log(`Action ${action} re\xE7ue pour l'entit\xE9 g\xE9n\xE9rique`);
  }
  updateDisplay() {
    const displayValues = this.entity["displayValues"];
    if (!displayValues) return;
    const valueRows = this.element.querySelectorAll(".value-row");
    valueRows.forEach((row) => row.remove());
    const valuesContainer = this.element.querySelector(".entity-values");
    if (valuesContainer) {
      displayValues.forEach((value, key) => {
        const valueRow = document.createElement("div");
        valueRow.className = "value-row";
        const valueLabel = document.createElement("span");
        valueLabel.className = "value-label";
        valueLabel.textContent = `${key}:`;
        valueRow.appendChild(valueLabel);
        const valueContent = document.createElement("span");
        valueContent.className = "value-content";
        valueContent.textContent = value.toString();
        valueRow.appendChild(valueContent);
        valuesContainer.appendChild(valueRow);
      });
    }
  }
  close() {
  }
};

// src/models/objects/UnifiedObjectFactory.ts
var _UnifiedObjectFactory = class _UnifiedObjectFactory {
  static registerDefaultTypes() {
    this.registerEntityType("light", (entity_id, position, state, commandService) => {
      const light = new EnhancedLightObject(entity_id, position, { width: 80, height: 80 }, commandService);
      if (state) light.updateState(state);
      return light;
    });
    this.registerWindowType("light", (entity) => new LightWindow(entity));
    this.registerEntityType("minimal_light", (entity_id, position, state, commandService) => {
      const light = new MinimalLightObject(entity_id, position, { width: 32, height: 32 }, commandService);
      if (state) light.updateState(state);
      return light;
    });
    this.registerWindowType("minimal_light", (entity) => new LightWindow(entity));
    this.registerEntityType("temperature_sensor", (entity_id, position, state, commandService) => {
      const sensor = new EnhancedTemperatureSensor(entity_id, position, { width: 100, height: 100 }, commandService);
      if (state) sensor.updateState(state);
      return sensor;
    });
    this.registerWindowType("temperature_sensor", (entity) => new GenericWindow(entity));
    this.registerEntityType("switch", (entity_id, position, state, commandService) => {
      const light = new MinimalLightObject(entity_id, position, { width: 32, height: 32 }, commandService);
      if (state) light.updateState(state);
      return light;
    });
    this.registerWindowType("switch", (entity) => new SwitchWindow(entity));
    this.registerEntityType("thermostat", (entity_id, position, state, commandService) => {
      const sensor = new EnhancedTemperatureSensor(entity_id, position, { width: 100, height: 100 }, commandService);
      if (state) sensor.updateState(state);
      return sensor;
    });
    this.registerWindowType("thermostat", (entity) => new ThermostatWindow(entity));
  }
  /**
   * Méthode principale pour créer un objet et sa fenêtre associée
   */
  static createObjectWithWindow(entity_id, position, state, commandService) {
    const entityType = this.getEntityType(entity_id);
    const entityCreator = this.entityCreators.get(entityType) || this.entityCreators.get("light");
    const entity = entityCreator(entity_id, position, state, commandService);
    const windowCreator = this.windowCreators.get(entityType) || this.windowCreators.get("light");
    const window2 = windowCreator(entity);
    entity.setContextWindow(window2);
    return { entity, window: window2 };
  }
  /**
   * Enregistrer un nouveau type d'entité
   */
  static registerEntityType(type, creator) {
    this.entityCreators.set(type, creator);
  }
  /**
   * Enregistrer un nouveau type de fenêtre
   */
  static registerWindowType(type, creator) {
    this.windowCreators.set(type, creator);
  }
  /**
   * Extraire le type à partir de l'entity_id
   */
  static getEntityType(entity_id) {
    const parts = entity_id.split(".");
    if (parts.length < 2) return "light";
    const domain = parts[0];
    const deviceType = parts[1].split("_")[0];
    if (domain === "light") {
      if (entity_id.includes("minimal")) return "minimal_light";
      return "light";
    }
    if (domain === "switch") return "switch";
    if (domain === "sensor" && deviceType === "temperature") return "temperature_sensor";
    if (domain === "climate") return "thermostat";
    return "light";
  }
};
// Registre des créateurs d'entités
_UnifiedObjectFactory.entityCreators = /* @__PURE__ */ new Map();
// Registre des créateurs de fenêtres
_UnifiedObjectFactory.windowCreators = /* @__PURE__ */ new Map();
_UnifiedObjectFactory.registerDefaultTypes();
var UnifiedObjectFactory = _UnifiedObjectFactory;

// src/models/objects/windows/ContextWindowManager.ts
var ContextWindowManager2 = class _ContextWindowManager {
  constructor() {
    this.currentWindow = null;
    this.handleKeyDown = (e) => {
      if (e.key === "Escape") {
        this.hideWindow();
      }
    };
    this.container = document.createElement("div");
    this.container.id = "context-windows-container";
    this.container.style.position = "fixed";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";
    this.container.style.zIndex = "1000";
    this.overlay = document.createElement("div");
    this.overlay.id = "context-windows-overlay";
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100%";
    this.overlay.style.height = "100%";
    this.overlay.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    this.overlay.style.display = "none";
    this.overlay.style.zIndex = "999";
    if (typeof document !== "undefined") {
      document.body.appendChild(this.container);
      document.body.appendChild(this.overlay);
    }
  }
  static getInstance() {
    if (!_ContextWindowManager.instance) {
      _ContextWindowManager.instance = new _ContextWindowManager();
    }
    return _ContextWindowManager.instance;
  }
  showWindow(entity, window2) {
    if (this.currentWindow) {
      this.hideWindow();
    }
    this.currentWindow = window2;
    this.positionWindowNearEntity(entity, window2.element);
    this.container.appendChild(window2.element);
    this.overlay.style.display = "block";
    this.container.style.pointerEvents = "auto";
    this.overlay.onclick = () => this.hideWindow();
    document.addEventListener("keydown", this.handleKeyDown);
  }
  hideWindow() {
    if (this.currentWindow) {
      this.currentWindow.close();
      this.container.removeChild(this.currentWindow.element);
      this.currentWindow = null;
    }
    this.overlay.style.display = "none";
    this.container.style.pointerEvents = "none";
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  positionWindowNearEntity(entity, windowElement) {
    const entityElement = entity.getElement();
    if (entityElement) {
      const entityRect = entityElement.getBoundingClientRect();
      windowElement.style.position = "absolute";
      windowElement.style.left = `${entityRect.right + 10}px`;
      windowElement.style.top = `${entityRect.top}px`;
      windowElement.style.pointerEvents = "auto";
    } else {
      windowElement.style.position = "absolute";
      windowElement.style.left = "50%";
      windowElement.style.top = "50%";
      windowElement.style.transform = "translate(-50%, -50%)";
      windowElement.style.pointerEvents = "auto";
    }
  }
  // Méthode pour mettre à jour la fenêtre actuelle
  updateCurrentWindow() {
    if (this.currentWindow && this.currentWindow.updateDisplay) {
      this.currentWindow.updateDisplay();
    }
  }
  // Vérifier si une fenêtre est ouverte
  hasOpenWindow() {
    return this.currentWindow !== null;
  }
  // Obtenir la fenêtre actuelle
  getCurrentWindow() {
    return this.currentWindow;
  }
};

// src/demo-entry.ts
if (typeof window !== "undefined") {
  if (!window.UnifiedObjectFactory) {
    window.UnifiedObjectFactory = UnifiedObjectFactory;
  }
  if (!window.BaseEntity) {
    window.BaseEntity = BaseEntity;
  }
  if (!window.EnhancedLightObject) {
    window.EnhancedLightObject = EnhancedLightObject;
  }
  if (!window.MinimalLightObject) {
    window.MinimalLightObject = MinimalLightObject;
  }
  if (!window.EnhancedTemperatureSensor) {
    window.EnhancedTemperatureSensor = EnhancedTemperatureSensor;
  }
  if (!window.ContextWindowManager2) {
    window.ContextWindowManager2 = ContextWindowManager2;
  }
  if (!window.LightWindow) {
    window.LightWindow = LightWindow;
  }
  if (!window.SwitchWindow) {
    window.SwitchWindow = SwitchWindow;
  }
  if (!window.ThermostatWindow) {
    window.ThermostatWindow = ThermostatWindow;
  }
  if (!window.GenericWindow) {
    window.GenericWindow = GenericWindow;
  }
}
console.log("Modules de d\xE9monstration charg\xE9s avec succ\xE8s !");
//# sourceMappingURL=demo-bundle.js.map
