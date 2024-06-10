import { Vector2, Vector3 } from 'three';

export type TLevel = 'wall' | 'none' | 'norm' | 'warn' | 'risk';

export interface ISensor {
  sensorId: string;
  roomId: string;
  levelId: TLevel;
  position3D: Vector3;
}

export interface ISensorPosition {
  sensorId: string;
  position2D: Vector2;
}
