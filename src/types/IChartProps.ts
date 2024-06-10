import { TRecordKey } from './IRecord';

export type TExportTo = '' | 'png';

export interface IChartProps {
  sensorIds: string[];
  recordKey: TRecordKey;
  exportTo: TExportTo;
  handleExportComplete: () => void;
}
