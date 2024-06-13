import { LineSegments, Mesh, Vector3 } from "three";
import { Line2, LineGeometry } from "three/examples/jsm/Addons.js";
import { Edge3D } from "../impl/Edge3D";
import { Triangle3D } from "../impl/Triangle3D";
import { ICoordinate2D } from "../types/ICoordinate2D";
import { IEdge3D, TEdgeComparison } from "../types/IEdge3D";
import { ITriangle3D } from "../types/ITriangle3D";
import { MaterialRepo } from "./MaterialRepo";
import { IPolygon2D } from "../types/IPolygon2D";
import { Polygon2D } from "../impl/Polygon2D";

export class PolygonUtil {

    static toLine2(segments: LineSegments): Line2 {

        const positions1: number[] = [...segments.geometry.attributes['position'].array];

        const positions2: number[] = [positions1[0], positions1[1], positions1[2]]; // point A of first segment
        for (let i = 0; i < positions1.length / 6; i++) {
            positions2.push(positions1[i * 6 + 3]);
            positions2.push(positions1[i * 6 + 4]);
            positions2.push(positions1[i * 6 + 5]);
        }
        // console.log('positions2', positions2);

        const geometry = new LineGeometry();
        geometry.setPositions(positions2);

        const line2 = new Line2(geometry, MaterialRepo.getMaterialLine('none'));
        line2.computeLineDistances();
        line2.scale.set(1, 1, 1);
        line2.position.set(segments.position.x, segments.position.y, segments.position.z);
        line2.name = segments.name;

        return line2;

    }

    static toPolygon2D(segments: LineSegments, face: Mesh): IPolygon2D {

        const positions1: number[] = [...segments.geometry.attributes['position'].array];

        const coordinates: ICoordinate2D[] = [];
        let posLocal: Vector3;
        let posWorld: Vector3;

        // first coordinate
        posLocal = new Vector3(positions1[0], positions1[1], positions1[2]);
        posWorld = face.localToWorld(posLocal.clone());
        coordinates.push({
            x: posWorld.x,
            y: posWorld.z
        });
        // console.log('posWorld', posWorld);
        const z = posWorld.y;
        for (let i = 0; i < positions1.length / 6; i++) {
            posLocal = new Vector3(positions1[i * 6 + 3], positions1[i * 6 + 4], positions1[i * 6 + 5]);
            posWorld = face.localToWorld(posLocal.clone());
            coordinates.push({
                x: posWorld.x,
                y: posWorld.z
            });
            // console.log('posWorld', posWorld);
        }

        return new Polygon2D(face.name, coordinates, z);

    }

    static findOuterRings(mesh: Mesh): IEdge3D[][] {

        const positions: number[] = [...mesh.geometry.attributes['position'].array];
        const normals: number[] = [...mesh.geometry.attributes['normal'].array];
        // console.log('positions', positions, 'normals', normals);

        // const allEdges: IEdge3D[] = [];
        const allTriangles: ITriangle3D[] = [];
        for (let i = 0; i < positions.length; i += 9) {
            const edgeA = new Edge3D(new Vector3(positions[i + 0], positions[i + 1], positions[i + 2]), new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]));
            const edgeB = new Edge3D(new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]), new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]));
            const edgeC = new Edge3D(new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]), new Vector3(positions[i + 0], positions[i + 1], positions[i + 2]));
            const normal = new Vector3(normals[i + 0], normals[i + 1], normals[i + 2]);
            allTriangles.push(new Triangle3D(edgeA, edgeB, edgeC, normal));
        }

        const outerRings: IEdge3D[][] = [];

        // create triangle buckets by normal
        while (allTriangles.length > 0) {

            // get last triangle
            const indexA = allTriangles.length - 1;
            const parTriangles: ITriangle3D[] = [
                allTriangles[indexA]
            ];

            // get any other triangles parallel to the first (maybe not in the same plane though)
            const parIndices: number[] = [];
            for (let indexB = 0; indexB < allTriangles.length - 1; indexB++) {
                if (allTriangles[indexA].normal.equals(allTriangles[indexB].normal)) {
                    parIndices.push(indexB);
                }
            }

            // reverse, so higher indices get removed first
            parIndices.reverse();

            // remove from all and push into par
            parIndices.forEach(parIndex => {
                parTriangles.push(...allTriangles.splice(parIndex, 1)); // move from all to par
            });

            // remove last (indexA)
            allTriangles.pop();

            // throw all edges from triangles having the same orientation into a single bucket
            const allEdges: IEdge3D[] = [];
            parTriangles.forEach(parTriangle => {
                allEdges.push(parTriangle.edgeA);
                allEdges.push(parTriangle.edgeB);
                allEdges.push(parTriangle.edgeC);
            });

            // find outer edges (not touching another edge)
            const outerEdges: IEdge3D[] = [];
            while (allEdges.length > 0) {
                const indexA = allEdges.length - 1;
                let edgeComparison: TEdgeComparison = 'not_equal';
                for (let indexB = 0; indexB < allEdges.length - 1; indexB++) {
                    edgeComparison = allEdges[indexA].compare(allEdges[indexB]);
                    if (edgeComparison !== 'not_equal') {
                        // console.log('inner', edgeComparison, allEdges[indexA], allEdges[indexB])
                        allEdges.splice(indexA, 1);
                        allEdges.splice(indexB, 1);
                        break;
                    }
                }
                if (edgeComparison === 'not_equal') {
                    // console.log('outer', edgeComparison, allEdges[indexA])
                    outerEdges.push(allEdges[indexA]);
                    allEdges.pop();
                }
            }

            while (outerEdges.length > 0) {

                // console.log('outerEdges', [...outerEdges]);

                // get last triangle
                const indexA = outerEdges.length - 1;

                const outerRing: IEdge3D[] = [
                    outerEdges[indexA]
                ];
                outerEdges.pop();
                let edgeF: IEdge3D | null = new Edge3D(new Vector3(), new Vector3());
                while (edgeF) {
                    edgeF = null;
                    const edge0 = outerRing[0];
                    const edgeN = outerRing[outerRing.length - 1];
                    for (let indexB = 0; indexB < outerEdges.length; indexB++) {
                        const edgeB = outerEdges[indexB];
                        if (edge0.pointA.equals(edgeB.pointB)) { // edgeB comes before edge0
                            edgeF = edgeB;
                            outerEdges.splice(indexB, 1);
                            outerRing.unshift(edgeF);
                            break;
                        } else if (edge0.pointA.equals(edgeB.pointA)) { // edgeB comes before edge0, but is reversed
                            edgeF = edgeB.reverse();
                            outerEdges.splice(indexB, 1);
                            outerRing.unshift(edgeF);
                            break;
                        } else if (edgeN.pointB.equals(edgeB.pointA)) { // edgeB comes adjacent after edge a
                            edgeF = edgeB;
                            outerEdges.splice(indexB, 1);
                            outerRing.push(edgeF);
                            break;
                        } else if (edgeN.pointB.equals(edgeB.pointB)) { // edgeB comes adjacent after edge a, but is reversed
                            edgeF = edgeB.reverse();
                            outerEdges.splice(indexB, 1);
                            outerRing.push(edgeF);
                            break;
                        }
                    }
                }

                outerRings.push(outerRing);

            }

        }

        // console.log('outerRings', outerRings);

        return outerRings;


    }

}