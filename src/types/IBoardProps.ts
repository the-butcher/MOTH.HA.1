import { ILabelProps } from './ILabelProps';
import { TRecordKey } from './IRecord';

export interface IBoardProps {
  labels: ILabelProps[];
  recordKeyApp: TRecordKey;
  clipPlane: number;
  handleRecordKey: (recordKey: TRecordKey) => void;
  handleClipPlane: (clipPlane: number) => void;
}
