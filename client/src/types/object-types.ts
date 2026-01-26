export interface ObjectPosition {
  x: number;
  y: number;
}

export interface ObjectConfig {
  entity_id: string;
  type: string;
  position: ObjectPosition;
}

export interface FloorPlanConfig {
  objects: ObjectConfig[];
}

export type ObjectType =
  | 'sensor'
  | 'light'
  | 'dimmable_light'
  | 'cover'
  | 'blind'
  | 'thermostat'
  | 'generic';