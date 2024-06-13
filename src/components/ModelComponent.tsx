import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, CapsuleGeometry, Color, FrontSide, Group, LineSegments, Mesh, MeshPhysicalMaterial, Object3D, Object3DEventMap, PlaneGeometry, Vector2, Vector3 } from 'three';
import { ColladaLoader, Line2 } from 'three/examples/jsm/Addons.js';
import { IEdge3D } from '../types/IEdge3D';
import { IModelProps } from '../types/IModelProps';
import { IPolygon2D } from '../types/IPolygon2D';
import { ISensor, ISensorPosition } from '../types/ISensor';
import { MaterialRepo } from '../util/MaterialRepo';
import { PolygonUtil } from '../util/PolygonUtil';
import LightComponent from './LightCompoment';

const ModelComponent = (props: IModelProps) => {

  const { scene, lights, selection, clipPlane, handleSensors, handleSensorPositions } = { ...props };

  const { invalidate } = useThree();

  const groupRef = useRef<Group>(new Group());
  const floorRef = useRef<Group>(new Group());

  const [namedMarks, setNamedMarks] = useState<Mesh[]>([]);
  const [namedFaces, setNamedFaces] = useState<Mesh[]>([]);
  const [namedLines, setNamedLines] = useState<Line2[]>([]);
  const [sensors, setSensors] = useState<ISensor[]>([]);

  const findFacesRecursive = (children: Object3D<Object3DEventMap>[]): Mesh[] => {
    const planes: Mesh[] = [];
    for (let childIndex = 0; childIndex < children.length; childIndex++) {
      const child = children[childIndex];
      if (child.type === 'Mesh') {
        planes.push(child as Mesh);
      }
      planes.push(...findFacesRecursive(child.children));
    }
    return planes;
  };

  const findLinesRecursive = (children: Object3D<Object3DEventMap>[]): LineSegments[] => {
    const lines: LineSegments[] = [];
    for (let childIndex = 0; childIndex < children.length; childIndex++) {
      const child = children[childIndex];
      if (child.type === 'LineSegments') {
        lines.push(child as LineSegments);
      }
      lines.push(...findLinesRecursive(child.children));
    }
    return lines;
  };

  const loadModel = () => {

    const loader = new ColladaLoader();
    loader.loadAsync(scene).then((result) => {

      result.scene.position.x = -0.8;
      result.scene.position.y = -3;
      // result.scene.position.z = 2;
      // result.scene.rotateZ(3);
      // console.log('scene', result.scene);


      const polygons: IPolygon2D[] = [];
      const _namedLines: Line2[] = [];
      const _namedFaces: Mesh[] = [];
      const _namedMarks: Mesh[] = [];

      // const allLines: LineSegments[] = findLinesRecursive(result.scene.children);
      // allLines.forEach((line) => {

      //   let lineName: string = '';
      //   let object: Object3D | null = line;

      //   // iterate up in tree to find a name for this object
      //   while (object) {
      //     lineName = object.name;
      //     if (lineName !== '') {
      //       break;
      //     }
      //     object = object.parent;
      //   }

      //   line.castShadow = true;
      //   line.material = MaterialRepo.MATERIAL_BASIC_LINE;

      // });



      const allFaces: Mesh[] = findFacesRecursive(result.scene.children);
      allFaces.forEach((face) => {

        let faceName: string = '';
        let object: Object3D | null = face;
        while (object) {
          faceName = object.name;
          if (faceName !== '') {
            break;
          }
          object = object.parent;
        }

        face.castShadow = true;
        face.receiveShadow = true;
        face.name = faceName;

        if (faceName.startsWith('room')) {
          face.material = MaterialRepo.getMaterialFace('none');
          _namedFaces.push(face);
        } else if (faceName.startsWith('stairs')) {
          face.material = MaterialRepo.getMaterialFace('none');
        } else {
          face.material = MaterialRepo.getMaterialFace('wall');
        }

        // find outer edges of this element
        const outerRings: IEdge3D[][] = PolygonUtil.findOuterRings(face);

        outerRings.forEach(outerRing => {

          // each distinct polygon (but segments are unordered and also not split to main polygon and holes)

          const lineSegmentPositionsA: number[] = [];
          outerRing.forEach(outerEdge => {
            lineSegmentPositionsA.push(outerEdge.pointA.x);
            lineSegmentPositionsA.push(outerEdge.pointA.y);
            lineSegmentPositionsA.push(outerEdge.pointA.z);
            lineSegmentPositionsA.push(outerEdge.pointB.x);
            lineSegmentPositionsA.push(outerEdge.pointB.y);
            lineSegmentPositionsA.push(outerEdge.pointB.z);
          });
          const lineSegmentPositionsB = new Float32Array(lineSegmentPositionsA);

          const geometry = new BufferGeometry();
          geometry.attributes['position'] = new BufferAttribute(lineSegmentPositionsB, 3);

          const lineSegments = new LineSegments(geometry, MaterialRepo.MATERIAL_BASIC_LINE);
          lineSegments.position.set(face.position.x, face.position.y, face.position.z);
          lineSegments.updateMatrixWorld();
          lineSegments.name = face.name;

          const line2 = PolygonUtil.toLine2(lineSegments);
          if (faceName.startsWith('room')) {
            face.parent?.add(line2);
          } else if (faceName.startsWith('stairs')) {
            face.parent?.add(lineSegments);
          }
          _namedLines.push(line2);

          const polygon = PolygonUtil.toPolygon2D(lineSegments, face);
          polygons.push(polygon);

        });

      });

      // find sensor markers now
      const _sensors: ISensor[] = [];
      const allLines: LineSegments[] = findLinesRecursive(result.scene.children);
      allLines.forEach((line1) => {
        let lineName: string = '';
        let object: Object3D | null = line1;

        // iterate up in tree to find a name for this object
        while (object) {
          lineName = object.name;
          if (lineName !== '') {
            break;
          }
          object = object.parent;
        }

        if (lineName.startsWith('sensor')) {

          const positionsA: number[] = [...line1.geometry.attributes['position'].array];
          const posLocal = new Vector3(positionsA[0], positionsA[1], positionsA[2]);
          const posWorld = line1.localToWorld(posLocal);

          const capGeom = new CapsuleGeometry(0.1, 0.1, 3, 12);
          capGeom.computeVertexNormals();
          const capMesh = new Mesh(capGeom, MaterialRepo.getMaterialMark('none'));
          capMesh.receiveShadow = false;
          capMesh.castShadow = false;
          capMesh.position.set(posWorld.x, posWorld.y, posWorld.z);

          line1.parent?.remove(line1);

          const sensorId = lineName.substring('sensor_'.length).replace('_', '/');
          let roomId = '';
          polygons.forEach((polygon) => {
            if (
              polygon.contains({
                x: posWorld.x,
                y: posWorld.z,
              }, posWorld.y)
            ) {
              roomId = polygon.name;
            }
          });

          capMesh.name = roomId;
          _namedMarks.push(capMesh);
          groupRef.current.add(capMesh);

          _sensors.push({
            sensorId,
            roomId,
            levelId: 'none',
            position3D: posWorld,
          });

        } else {
          line1.material = MaterialRepo.MATERIAL_BASIC_LINE;
        }
      });

      setSensors(_sensors);
      setNamedLines(_namedLines);
      setNamedFaces(_namedFaces);
      setNamedMarks(_namedMarks);

      groupRef.current.add(result.scene);

      const faceValFloor = 100;
      const floorMtrl = new MeshPhysicalMaterial({
        color: new Color(`rgb(${faceValFloor}, ${faceValFloor}, ${faceValFloor})`),
        roughness: 0.75,
        metalness: 0.0,
        reflectivity: 0.5,
        side: FrontSide,
        transparent: false,
        opacity: 1,
        wireframe: false,
      });

      const floorGeom = new PlaneGeometry(100, 100, 10, 10); // new CapsuleGeometry(7, 50, 36, 72);
      floorGeom.translate(0, 0, -7);
      floorGeom.computeVertexNormals();
      const floorMesh = new Mesh(floorGeom, floorMtrl);
      floorMesh.receiveShadow = true;

      floorRef.current.add(floorMesh);

      invalidate();

    }); // load async
  };

  useEffect(() => {
    console.debug('✨ building model component');

    setTimeout(() => {
      loadModel();
    }, 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.debug('⚙ updating model component (selection)', selection);

    namedLines.forEach((namedLine) => {
      if (selection.rooms[namedLine.name]) {
        namedLine.material = MaterialRepo.getMaterialLine(selection.rooms[namedLine.name]);
      }
    });
    namedFaces.forEach((namedFace) => {
      if (selection.rooms[namedFace.name]) {
        namedFace.material = MaterialRepo.getMaterialFace(selection.rooms[namedFace.name]);
      }
    });
    namedMarks.forEach((namedMark) => {
      if (selection.rooms[namedMark.name]) {
        namedMark.material = MaterialRepo.getMaterialMark(selection.rooms[namedMark.name]);
      }
    });
    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  useEffect(() => {
    console.debug('⚙ updating model component (sensors)', sensors);
    if (sensors.length > 0) {
      handleSensors(sensors);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensors]);


  useEffect(() => {

    console.debug('⚙ updating model component (clipPlane)', clipPlane);

    MaterialRepo.setClipPlane(clipPlane);
    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipPlane]);

  useFrame(({ camera }) => {
    MaterialRepo.updateMaterialLineResolution(); // does not have to happen on every frame

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    // rebuild sensors with their projected screen cooordinates
    const sensorPositions: ISensorPosition[] = [];
    sensors.forEach((sensor) => {
      const pos = sensor.position3D.clone();
      pos.project(camera);
      sensorPositions.push({
        ...sensor,
        position2D: new Vector2(pos.x * widthHalf + widthHalf, -(pos.y * heightHalf) + heightHalf),
      });
    }, 1);

    handleSensorPositions(sensorPositions);

    floorRef.current.lookAt(camera.position.clone());
    floorRef.current.rotateZ(Math.PI / 2);
    floorRef.current.updateMatrixWorld();

  });

  return (
    <>

      <group ref={floorRef}>
        {lights.map((light) => (
          <LightComponent key={light.id} {...light} />
        ))}
      </group>
      <group ref={groupRef} />
    </>
  );
};

export default ModelComponent;
