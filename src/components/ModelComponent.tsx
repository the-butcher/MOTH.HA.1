import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { CapsuleGeometry, Color, DoubleSide, FrontSide, Group, LineBasicMaterial, LineSegments, Mesh, MeshPhysicalMaterial, Object3D, Object3DEventMap, PlaneGeometry, Vector2, Vector3 } from 'three';
import { ColladaLoader, Line2, LineGeometry } from 'three/examples/jsm/Addons.js';
import { Polygon2D } from '../impl/Polygon2D';
import { ICoordinate2D } from '../types/ICoordinate2D';
import { IModelProps } from '../types/IModelProps';
import { IPolygon2D } from '../types/IPolygon2D';
import { ISensor, ISensorPosition } from '../types/ISensor';
import { MaterialRepo } from '../util/MaterialRepo';
import LightComponent from './LightCompoment';

const VALUE_LINE_DEFAULT = 80;
const MATERIAL_LINE_DEFAULT = new LineBasicMaterial({
  name: 'line_default',
  color: new Color(`rgb(${VALUE_LINE_DEFAULT}, ${VALUE_LINE_DEFAULT}, ${VALUE_LINE_DEFAULT})`),
  opacity: 1.0,
  // transparent: true,
  side: DoubleSide,
});

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
      console.log('scene', result.scene);


      const polygons: IPolygon2D[] = [];
      const _namedLines: Line2[] = [];
      const _namedFaces: Mesh[] = [];
      const _namedMarks: Mesh[] = [];

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

        line1.castShadow = true;

        if (lineName.startsWith('room')) {
          // get positions
          const geometry = new LineGeometry();
          const positionsA: number[] = [...line1.geometry.attributes['position'].array];
          // build segments
          const segmentsA: [Vector3, Vector3][] = [];
          for (let index = 0; index < positionsA.length / 3; index += 2) {
            segmentsA.push([new Vector3(positionsA[index * 3 + 0], positionsA[index * 3 + 1], positionsA[index * 3 + 2]), new Vector3(positionsA[index * 3 + 3], positionsA[index * 3 + 4], positionsA[index * 3 + 5])]);
          }
          const segmentsB: [Vector3, Vector3][] = [];
          if (segmentsA.length > 0) {
            segmentsB.push(segmentsA.shift()!);
            while (segmentsA.length > 0) {
              // console.log('segmentsA.length', segmentsA.length);
              let minDist = Number.MAX_VALUE;
              let minIndx = -1;
              let minFlip = false;
              for (let indexA = 0; indexA < segmentsA.length; indexA++) {
                const pBB = segmentsB[segmentsB.length - 1][1];
                const pAA = segmentsA[indexA][0];
                const pAB = segmentsA[indexA][1];
                const dBA = pBB.clone().sub(pAA).length(); // to A of segment
                const dBB = pBB.clone().sub(pAB).length(); // to B of segment
                if (dBA < dBB && dBA < minDist) {
                  minDist = dBA;
                  minIndx = indexA;
                  minFlip = false;
                } else if (dBB < dBA && dBB < minDist) {
                  minDist = dBB;
                  minIndx = indexA;
                  minFlip = true;
                }
              }
              // find and remove closest segment
              const segmentA = segmentsA.splice(minIndx, 1)[0];
              if (minFlip) {
                segmentsB.push([segmentA[1], segmentA[0]]);
              } else {
                segmentsB.push([segmentA[0], segmentA[1]]);
              }
            }
          }

          const coordinates: ICoordinate2D[] = [];
          let posL: Vector3;
          let posW: Vector3;

          const positionsB: number[] = [];

          // first coordinate
          posL = segmentsB[0][0];
          posW = line1.localToWorld(posL.clone());

          coordinates.push({
            x: posW.x,
            y: posW.z
          });
          const z = posW.y;
          positionsB.push(posL.x, posL.y, posL.z);
          for (let index = 0; index < segmentsB.length; index++) {
            posL = segmentsB[index][1];
            posW = line1.localToWorld(posL.clone());
            coordinates.push({
              x: posW.x,
              y: posW.z
            });
            positionsB.push(posL.x, posL.y, posL.z);
          }

          polygons.push(new Polygon2D(lineName, coordinates, z));
          geometry.setPositions(positionsB);

          const line2 = new Line2(geometry, MaterialRepo.getMaterialLine('none'));
          line2.computeLineDistances();
          line2.scale.set(1, 1, 1);
          line2.position.set(line1.position.x, line1.position.y, line1.position.z);

          line1.parent?.add(line2);
          line1.parent?.remove(line1);

          line2.name = lineName;
          // console.log('lineName', lineName, line2);
          _namedLines.push(line2);
        }

      });

      // find sensor markers now
      const _sensors: ISensor[] = [];
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
          const posScene = line1.localToWorld(posLocal);

          const capGeom = new CapsuleGeometry(0.1, 0.1, 3, 12);
          capGeom.computeVertexNormals();
          const capMesh = new Mesh(capGeom, MaterialRepo.getMaterialMark('none'));
          capMesh.receiveShadow = false;
          capMesh.castShadow = false;
          capMesh.position.set(posScene.x, posScene.y, posScene.z);

          line1.parent?.remove(line1);

          const sensorId = lineName.substring('sensor_'.length).replace('_', '/');
          let roomId = '';
          polygons.forEach((polygon) => {
            if (
              polygon.contains({
                x: posScene.x,
                y: posScene.z,
              }, posScene.y)
            ) {
              roomId = polygon.name;
              // console.log('sensor', sensorId, ' contained in ', polygon.name);
            }
          });

          capMesh.name = roomId;
          _namedMarks.push(capMesh);
          groupRef.current.add(capMesh);

          _sensors.push({
            sensorId,
            roomId,
            levelId: 'none',
            position3D: posScene,
          });

        } else {
          line1.material = MATERIAL_LINE_DEFAULT;
        }
      });

      const allFaces: Mesh[] = findFacesRecursive(result.scene.children);
      allFaces.forEach((face) => {

        let faceName: string = '';
        let object: Object3D | null = face;
        while (object) {
          faceName = object.name;
          if (faceName !== '') {
            // console.log('faceName', faceName, face);
            break;
          }
          object = object.parent;
        }

        face.castShadow = true;
        face.receiveShadow = true;

        if (faceName.startsWith('room')) {
          face.material = MaterialRepo.getMaterialFace('none');
          face.name = faceName;
          // console.log('faceName', faceName, face);
          _namedFaces.push(face);
        } else if (faceName.startsWith('stairs')) {
          face.material = MaterialRepo.getMaterialFace('none');
        } else {
          face.material = MaterialRepo.getMaterialFace('wall');
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
        // console.log('highlighting mark', namedMark.name, selection.rooms[namedMark.name]);
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
