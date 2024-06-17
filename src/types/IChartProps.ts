import { ILabelProps } from './ILabelProps';
import { TRecordKey } from './IRecord';

export type TExportTo = '' | 'png';

export interface IChartProps {
  height: number;
  labels: ILabelProps[];
  recordKeyApp: TRecordKey;
  exportTo: TExportTo;
  handleExportComplete: () => void;
}
