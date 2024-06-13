import { Vector3 } from "three";
import { IEdge3D } from "../types/IEdge3D";
import { ITriangle3D } from "../types/ITriangle3D";

export class Triangle3D implements ITriangle3D {

    public readonly edgeA: IEdge3D;
    public readonly edgeB: IEdge3D;
    public readonly edgeC: IEdge3D;
    public readonly normal: Vector3;

    constructor(edgeA: IEdge3D, edgeB: IEdge3D, edgeC: IEdge3D, normal: Vector3) {
        this.edgeA = edgeA;
        this.edgeB = edgeB;
        this.edgeC = edgeC;
        this.normal = normal;
    }

}