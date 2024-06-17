import { Vector2, Vector3 } from 'three';
import { TRecordKey } from './IRecord';

export type TLevel = 'wall' | 'none' | 'norm' | 'warn' | 'risk';

export interface ISensor {
  sensorId: string;
  roomId: string;
  levelId: TLevel;
  recordKeys: TRecordKey[]; // the record keys available with this sensor
  position3D: Vector3;
}

export interface ISensorPosition {
  sensorId: string;
  position2D: Vector2;
}
