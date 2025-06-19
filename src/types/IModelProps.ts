import { ISunProps } from './ISunProps';

export const MODEL_OFFSET_Y = -2.7;

export interface IModelProps {
  id: string;
  stamp: string;
  scene: string;
  sun: ISunProps;
  modelComplete: boolean;
  handleModelComplete: () => void;
}

// export interface IClipPlane {
//   clipPlane: number;
// }