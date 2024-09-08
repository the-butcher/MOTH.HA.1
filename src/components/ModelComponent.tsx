import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, LineSegments, Mesh, Object3D, Object3DEventMap, Vector3 } from 'three';
import { ColladaLoader } from 'three/examples/jsm/Addons.js';
import { IEdge3D } from '../types/IEdge3D';
import { FACE_DESCRIPTIONS, IFaceDescription, TFaceDescKey } from '../types/IFaceDescription';
import { ILineDescription, LINE_DESCRIPTIONS, TLineDescKey } from '../types/ILineDescription';
import { IModelProps } from '../types/IModelProps';
import { STATUS_HANDLERS, TStatusHandlerKey } from '../types/IStatusHandler';
import { MaterialRepo } from '../util/MaterialRepo';
import { MqttUtil } from '../util/MqttUtil';
import { PolygonUtil } from '../util/PolygonUtil';

const ModelComponent = (props: IModelProps) => {

  // const { scene, lights, selection, clipPlane, handleSensors, handleSensorPositions } = { ...props };
  const { scene: sceneUrl, clipPlane } = { ...props };


  const { scene, invalidate } = useThree();

  const groupRef = useRef<Group>(new Group());
  const floorRef = useRef<Group>(new Group());

  // const [namedMarks, setNamedMarks] = useState<Mesh[]>([]);
  // const [namedFaces, setNamedFaces] = useState<Mesh[]>([]);
  // const [namedLines, setNamedLines] = useState<Line2[]>([]);
  // const [sensors, setSensors] = useState<ISensor[]>([]);

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
    loader.loadAsync(sceneUrl).then((result) => {

      // TODO :: get the scene centered where do these values come from
      // result.scene.position.x = 1.5;
      result.scene.position.y = -3;
      result.scene.position.z = -6;
      // result.scene.scale.x = 0.1;
      // result.scene.scale.y = 0.1;
      // result.scene.scale.z = 0.1;
      // result.scene.position.z = 2;
      result.scene.rotateZ(-0.320); // north
      // console.log('scene', result.scene);

      const allFaces: Mesh[] = findFacesRecursive(result.scene.children);
      const allLines: LineSegments[] = findLinesRecursive(result.scene.children);

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

        if (faceName.startsWith('room')) {
          faceName = 'room';
        }

        // console.log('faceName', faceName);
        const faceDescKeys: TFaceDescKey[] = Object.keys(FACE_DESCRIPTIONS) as TFaceDescKey[];
        let faceDesc: IFaceDescription | undefined;
        faceDescKeys.forEach((faceDescKey: TFaceDescKey) => {
          if (faceName.startsWith(faceDescKey)) {
            faceDesc = FACE_DESCRIPTIONS[faceDescKey];
            faceName = faceDescKey;
          }
        });
        if (faceDesc) {

          face.name = faceName; // reassign, since the original occurence of name may have been somewhere else in the hierarchy

          STATUS_HANDLERS[faceName as TStatusHandlerKey]?.faces.push(face);

          face.material = MaterialRepo.getMaterialFace(faceDesc);
          if (faceDesc.lineDesc.lineStyle !== 'none') {

            // find outer edges of this element
            const outerRings: IEdge3D[][] = PolygonUtil.findOuterRings(face);
            const sgmtsArray: LineSegments[] = PolygonUtil.toSgmt(outerRings, faceName, face.position, faceDesc.lineDesc);
            sgmtsArray.forEach(sgmts => {
              if (faceDesc!.lineDesc.lineStyle === 'thin') {
                face.parent?.add(sgmts);
                // todo :: add to segments on status handler if applicable
                STATUS_HANDLERS[faceName as TStatusHandlerKey]?.sgmts.push(sgmts);
              } else if (faceDesc!.lineDesc.lineStyle === 'wide') {
                const line2 = PolygonUtil.toLine2(sgmts, faceDesc!.lineDesc);
                face.parent?.add(line2);
                STATUS_HANDLERS[faceName as TStatusHandlerKey]?.lines.push(line2);
                // todo :: add to outlines on status handler if applicable
              }
            });

          }

        } else { // unnamed

          face.material = MaterialRepo.getMaterialFace(FACE_DESCRIPTIONS['misc_gray']);

        }

        face.castShadow = face.material.opacity >= 0.50;
        face.receiveShadow = true;

      });

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

        const lineDescKeys: TLineDescKey[] = Object.keys(LINE_DESCRIPTIONS) as TLineDescKey[];
        let lineDesc: ILineDescription | undefined;
        lineDescKeys.forEach((lineDescKey: TLineDescKey) => {
          if (lineName.startsWith(lineDescKey)) {
            lineDesc = LINE_DESCRIPTIONS[lineDescKey];
            lineName = lineDescKey;
          }
        });
        if (lineDesc) {

          // console.log('line1.name (label)', line1.name);
          if (line1.name.endsWith('_label')) {

            const positions: number[] = [...line1.geometry.attributes['position'].array];
            // console.log('positions', positions);

            const textGroupOuter = new Group();
            const textGroupInner = new Group();

            const p0 = line1.localToWorld(new Vector3(positions[0], positions[1], positions[2]));
            const p1 = line1.localToWorld(new Vector3(positions[3], positions[4], positions[5]));
            const p2 = line1.localToWorld(new Vector3(positions[9], positions[10], positions[11]));

            const p10 = p0.clone().sub(p1).normalize();
            const p12 = p2.clone().sub(p1).normalize();

            textGroupOuter.position.x = p1.x;
            textGroupOuter.position.y = p1.y;
            textGroupOuter.position.z = p1.z;

            // the target normal of the text
            const axisNormal0 = p12.clone().cross(p10.clone()).normalize();

            textGroupOuter.lookAt(p1.clone().add(axisNormal0));
            textGroupInner.rotateZ(Math.PI / 2);

            line1.visible = false;
            textGroupOuter.add(textGroupInner);
            scene.add(textGroupOuter);

            STATUS_HANDLERS[lineName as TStatusHandlerKey]?.texts.push(textGroupInner);

          } else {

            line1.name = lineName; // reassign, since the original occurence of name may have been somewhere else in the hierarchy

            if (lineDesc.lineStyle === 'thin') {
              line1.material = MaterialRepo.getMaterialSgmt(lineDesc);
              STATUS_HANDLERS[lineName as TStatusHandlerKey]?.sgmts.push(line1);
            } else if (lineDesc.lineStyle === 'wide') {
              const line2 = PolygonUtil.toLine2(line1, lineDesc);
              line1.visible = false;
              line1.parent?.add(line2);
              STATUS_HANDLERS[lineName as TStatusHandlerKey]?.lines.push(line2);
            }

          }

        } else { // unnamed

          line1.material = MaterialRepo.getMaterialSgmt(LINE_DESCRIPTIONS['misc_gray']);

        }

      });


      // console.log('STATUS_HANDLERS', STATUS_HANDLERS);
      window.setTimeout(() => {
        MqttUtil.setup();
      }, 1000);

      groupRef.current.add(result.scene);

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

    console.debug('⚙ updating model component (clipPlane)', clipPlane);

    MaterialRepo.setClipPlane(clipPlane);
    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipPlane]);

  useFrame(({ camera }) => {

    MaterialRepo.updateMaterialLineResolution(); // does not have to happen on every frame

    // const widthHalf = window.innerWidth / 2;
    // const heightHalf = window.innerHeight / 2;

    // rebuild sensors with their projected screen cooordinates
    // const sensorPositions: ISensorPosition[] = [];
    // sensors.forEach((sensor) => {
    //   const pos = sensor.position3D.clone();
    //   pos.project(camera);
    //   sensorPositions.push({
    //     ...sensor,
    //     position2D: new Vector2(pos.x * widthHalf + widthHalf, -(pos.y * heightHalf) + heightHalf),
    //   });
    // }, 1);

    // handleSensorPositions(sensorPositions);

    floorRef.current.lookAt(camera.position.clone());
    floorRef.current.rotateZ(Math.PI / 2);
    floorRef.current.updateMatrixWorld();

  });

  return (
    <>
      {/* <group ref={floorRef}>
        {lights.map((light) => (
          <LightComponent key={light.id} {...light} />
        ))}
      </group> */}
      <group ref={groupRef} />
    </>
  );
};

export default ModelComponent;
