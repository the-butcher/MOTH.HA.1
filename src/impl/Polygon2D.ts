import { ICoordinate2D } from '../types/ICoordinate2D';
import { IPolygon2D } from '../types/IPolygon2D';

export class Polygon2D implements IPolygon2D {
  readonly name: string;
  readonly coordinates: ICoordinate2D[];
  readonly z: number;

  constructor(name: string, coordinates: ICoordinate2D[], z: number) {
    this.name = name;
    this.coordinates = [...coordinates];
    this.z = z;
  }

  contains(coordinate: ICoordinate2D, z: number): boolean {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

    const x = coordinate.x;
    const y = coordinate.y;

    let inside = false;
    for (let i = 0, j = this.coordinates.length - 1; i < this.coordinates.length; j = i++) {
      const xi = this.coordinates[i].x;
      const yi = this.coordinates[i].y;
      const xj = this.coordinates[j].x;
      const yj = this.coordinates[j].y;
      const intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside && Math.abs(z - this.z) < 0.1;
  }
}
