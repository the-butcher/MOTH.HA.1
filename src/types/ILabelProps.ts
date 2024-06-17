import { IGaugeProps } from './IGaugeProps';

export interface ILabelProps extends IGaugeProps {
  x: number;
  y: number;
  handleSensorSelect: (sensorId: string) => void;
}
