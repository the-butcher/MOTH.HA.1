import { BufferAttribute, BufferGeometry, Group, LineSegments, Mesh, Vector3 } from "three";
import { Font, Line2, LineGeometry, TextGeometry, TTFLoader } from "three/examples/jsm/Addons.js";
import { Edge3D } from "../impl/Edge3D";
import { Triangle3D } from "../impl/Triangle3D";
import { IEdge3D, TEdgeComparison } from "../types/IEdge3D";
import { ILineDescription, LINE_DESCRIPTIONS } from "../types/ILineDescription";
import { ITriangle3D } from "../types/ITriangle3D";
import { MaterialRepo } from "./MaterialRepo";
import { IColorDescription } from "../types/IColorDescription";


export class PolygonUtil {

    static font: Font;

    static async getFont(): Promise<Font> {

        if (!this.font) {
            const fontData = await new TTFLoader().loadAsync('./smb.ttf');
            this.font = new Font(fontData);
        }
        return this.font;

    }

    static createTextMesh(label: string, parent: Group, colorDesc: IColorDescription) {

        this.getFont().then(() => {

            const textGeom = new TextGeometry(label, {
                font: this.font,
                size: 0.3,
                depth: 0.00,
                curveSegments: 12,
                bevelThickness: 0.005,
                bevelSize: 0.005,
                bevelEnabled: false
            });
            textGeom.computeBoundingBox();
            textGeom.computeVertexNormals();

            const textMesh = new Mesh(textGeom, MaterialRepo.getMaterialFace(colorDesc));
            textMesh.castShadow = true;
            textMesh.receiveShadow = true;
            textMesh.name = 'ArrowHelper';

            parent.clear();
            parent.add(textMesh);

            const outerRings: IEdge3D[][] = PolygonUtil.findOuterRings(textMesh);
            const sgmtsArray: LineSegments[] = PolygonUtil.toSgmt(outerRings, 'ArrowHelper', textMesh.position, {
                ...LINE_DESCRIPTIONS['misc_gray'],
                opacity: 0.10
            });
            sgmtsArray.forEach(sgmts => {
                parent.add(sgmts);
            });

        });

    }

    static toSgmt(outerRings: IEdge3D[][], name: string, position: Vector3, lineDesc: ILineDescription): LineSegments[] {

        const filteredEdges: IEdge3D[] = [];
        outerRings.forEach(outerRing => {
            outerRing.forEach(outerEdge => {

                let isDuplicate = false;
                filteredEdges.forEach(filteredEdge => {
                    const comparison = outerEdge.compare(filteredEdge);
                    if (comparison === 'equals_ab' || comparison === 'equals_ba') {
                        isDuplicate = true;
                    }
                });
                if (!isDuplicate) {
                    filteredEdges.push(outerEdge);
                } else {
                    // console.log('found duplicate');
                }

            });
        });

        const lineSegmentArray: LineSegments[] = [];

        const lineSegmentPositionsA: number[] = [];
        filteredEdges.forEach(filteredEdge => {
            lineSegmentPositionsA.push(filteredEdge.pointA.x);
            lineSegmentPositionsA.push(filteredEdge.pointA.y);
            lineSegmentPositionsA.push(filteredEdge.pointA.z);
            lineSegmentPositionsA.push(filteredEdge.pointB.x);
            lineSegmentPositionsA.push(filteredEdge.pointB.y);
            lineSegmentPositionsA.push(filteredEdge.pointB.z);
        });
        const lineSegmentPositionsB = new Float32Array(lineSegmentPositionsA);

        const geometry = new BufferGeometry();
        geometry.attributes['position'] = new BufferAttribute(lineSegmentPositionsB, 3);

        const material = MaterialRepo.getMaterialSgmt(lineDesc);
        const lineSegments = new LineSegments(geometry, material);
        lineSegments.position.set(position.x, position.y, position.z);
        lineSegments.updateMatrixWorld();
        lineSegments.name = name;
        lineSegmentArray.push(lineSegments);


        // const lineSegmentArray: LineSegments[] = [];
        // outerRings.forEach(outerRing => {

        //     const lineSegmentPositionsA: number[] = [];
        //     outerRing.forEach(outerEdge => {
        //         lineSegmentPositionsA.push(outerEdge.pointA.x);
        //         lineSegmentPositionsA.push(outerEdge.pointA.y);
        //         lineSegmentPositionsA.push(outerEdge.pointA.z);
        //         lineSegmentPositionsA.push(outerEdge.pointB.x);
        //         lineSegmentPositionsA.push(outerEdge.pointB.y);
        //         lineSegmentPositionsA.push(outerEdge.pointB.z);
        //     });
        //     const lineSegmentPositionsB = new Float32Array(lineSegmentPositionsA);

        //     const geometry = new BufferGeometry();
        //     geometry.attributes['position'] = new BufferAttribute(lineSegmentPositionsB, 3);

        //     const material = MaterialRepo.getMaterialSgmt(lineDesc);
        //     const lineSegments = new LineSegments(geometry, material);
        //     lineSegments.position.set(position.x, position.y, position.z);
        //     lineSegments.updateMatrixWorld();
        //     lineSegments.name = name;
        //     lineSegmentArray.push(lineSegments);

        // });

        return lineSegmentArray;

    }

    static toLine2(segments: LineSegments, lineDesc: ILineDescription): Line2 {

        const positions1: number[] = [...segments.geometry.attributes['position'].array];

        const positions2: number[] = [positions1[0], positions1[1], positions1[2]]; // point A of first segment
        // one segment at a time
        for (let i = 0; i < positions1.length / 6; i++) {
            positions2.push(positions1[i * 6 + 3]);
            positions2.push(positions1[i * 6 + 4]);
            positions2.push(positions1[i * 6 + 5]);
        }
        // console.log('positions2', positions2);

        const geometry = new LineGeometry();
        geometry.setPositions(positions2);

        const line2 = new Line2(geometry, MaterialRepo.getMaterialLine(lineDesc));
        line2.computeLineDistances();
        line2.scale.set(1, 1, 1);
        line2.position.set(segments.position.x, segments.position.y, segments.position.z);
        line2.name = segments.name;
        line2.castShadow = true;
        line2.receiveShadow = true;

        return line2;

    }

    // static toPolygon2D(segments: LineSegments, face: Mesh): IPolygon2D {

    //     const positions1: number[] = [...segments.geometry.attributes['position'].array];

    //     const coordinates: ICoordinate2D[] = [];
    //     let posLocal: Vector3;
    //     let posWorld: Vector3;

    //     // first coordinate
    //     posLocal = new Vector3(positions1[0], positions1[1], positions1[2]);
    //     posWorld = face.localToWorld(posLocal.clone());
    //     coordinates.push({
    //         x: posWorld.x,
    //         y: posWorld.z
    //     });
    //     // console.log('posWorld', posWorld);
    //     const z = posWorld.y;
    //     for (let i = 0; i < positions1.length / 6; i++) {
    //         posLocal = new Vector3(positions1[i * 6 + 3], positions1[i * 6 + 4], positions1[i * 6 + 5]);
    //         posWorld = face.localToWorld(posLocal.clone());
    //         coordinates.push({
    //             x: posWorld.x,
    //             y: posWorld.z
    //         });
    //         // console.log('posWorld', posWorld);
    //     }

    //     return new Polygon2D(face.name, coordinates, z);

    // }

    static findOuterRings(mesh: Mesh): IEdge3D[][] {

        const positions: number[] = [...mesh.geometry.attributes['position'].array];
        const normals: number[] = [...mesh.geometry.attributes['normal'].array];

        // collect triangles
        const allTriangles: ITriangle3D[] = [];
        for (let i = 0; i < positions.length; i += 9) {
            const edgeA = new Edge3D(new Vector3(positions[i + 0], positions[i + 1], positions[i + 2]), new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]));
            const edgeB = new Edge3D(new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]), new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]));
            const edgeC = new Edge3D(new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]), new Vector3(positions[i + 0], positions[i + 1], positions[i + 2]));
            const normal = new Vector3(normals[i + 0], normals[i + 1], normals[i + 2]);
            allTriangles.push(new Triangle3D(edgeA, edgeB, edgeC, normal));
        }

        const outerRings: IEdge3D[][] = [];

        // create triangle buckets by face normal
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

            // order edges, split by rings
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

        return outerRings;


    }

}