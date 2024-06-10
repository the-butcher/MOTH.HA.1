import { TLevel } from './ISensor';

export interface ISelection {
  rooms: { [k in string]: TLevel };
}
