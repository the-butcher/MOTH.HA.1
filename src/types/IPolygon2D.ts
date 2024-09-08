import { ICoordinate2D } from './ICoordinate2D';

export interface IPolygon2D {
  name: string;
  coordinates: ICoordinate2D[];
  contains(coordinate: ICoordinate2D, z: number): boolean;
}
