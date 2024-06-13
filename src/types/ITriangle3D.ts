import { Vector3 } from "three";
import { IEdge3D } from "./IEdge3D";

export interface ITriangle3D {
    edgeA: IEdge3D;
    edgeB: IEdge3D;
    edgeC: IEdge3D;
    normal: Vector3;
}