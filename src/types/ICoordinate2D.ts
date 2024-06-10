export interface ICoordinate2D {
  x: number;
  y: number;
}

export interface IEvent2D extends ICoordinate2D {
  type: 'void' | 'move'
}
