import { ILightProps } from './ILightProps';
import { ISelection } from './ISelection';
import { ISensor, ISensorPosition } from './ISensor';

export interface IModelProps {
  id: string;
  stamp: string;
  scene: string;
  selection: ISelection;
  lights: ILightProps[];
  clipPlane: number;
  handleSensors: (sensors: ISensor[]) => void;
  handleSensorPositions: (sensors: ISensorPosition[]) => void;
}
