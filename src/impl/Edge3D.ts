import { Vector3 } from "three";
import { IEdge3D, TEdgeComparison } from "../types/IEdge3D";

export class Edge3D implements IEdge3D {

    public readonly pointA: Vector3;
    public readonly pointB: Vector3;

    constructor(pointA: Vector3, pointB: Vector3) {
        this.pointA = pointA;
        this.pointB = pointB;
    }

    compare(edge: IEdge3D): TEdgeComparison {
        if (this.pointA.equals(edge.pointA) && this.pointB.equals(edge.pointB)) {
            return 'equals_ab';
        } else if (this.pointA.equals(edge.pointB) && this.pointB.equals(edge.pointA)) {
            return 'equals_ba';
        } else {
            return 'not_equal';
        }
    }

    reverse(): IEdge3D {
        return new Edge3D(this.pointB, this.pointA);
    }

}