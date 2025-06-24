import { SpotLight } from 'three';
import { ISunProps } from './ISunProps';

export const MODEL_OFFSET_Y = -2.7;

export interface IModelProps {
  id: string;
  stamp: string;
  scene: string;
  sun: ISunProps;
  modelComplete: boolean;
  handleModelComplete: (lights: SpotLight[]) => void;
}

// export interface IClipPlane {
//   clipPlane: number;
// }