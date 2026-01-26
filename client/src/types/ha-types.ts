export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    user_id: string | null;
  };
}

export interface Area {
  id: string;
  name: string;
  devices: Device[];
}

export interface Device {
  id: string;
  name: string;
  entities: Record<string, Entity>;
}

export interface Entity {
  entity_id: string;
  name: string | null;
}

export interface FloorplanData {
  path: string;
  filename: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Types pour WebSocket
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface StateUpdateMessage {
  type: 'update:state';
  payload: {
    entity_id: string;
    new_state: HAState;
  };
}

export interface ConfigUpdateMessage {
  type: 'config_updated';
  payload: any;
}

export interface FloorplanUpdateMessage {
  type: 'floorplan_updated';
  payload: FloorplanData;
}