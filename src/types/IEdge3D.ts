import { Vector3 } from "three";

export type TEdgeComparison = 'equals_ab' | 'equals_ba' | 'not_equal';

export interface IEdge3D {
    pointA: Vector3;
    pointB: Vector3;
    compare: (edge: IEdge3D) => TEdgeComparison;
    reverse: () => IEdge3D;
}