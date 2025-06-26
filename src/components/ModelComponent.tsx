import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { BackSide, CircleGeometry, Group, LineSegments, Mesh, Object3D, Object3DEventMap, SpotLight, Vector3 } from 'three';
import { ColladaLoader, Line2, LineGeometry } from 'three/examples/jsm/Addons.js';
import { IEdge3D } from '../types/IEdge3D';
import { FACE_DESCRIPTIONS, IFaceDescription, TFaceDescKey } from '../types/IFaceDescription';
import { ILineDescription, LINE_DESCRIPTIONS, TLineDescKey } from '../types/ILineDescription';
import { IModelProps } from '../types/IModelProps';
import { PRESET_PROPS, TPresetKey } from '../types/IOrbitProps';
import { STATUS_HANDLERS, TStatusKey } from '../types/IStatusHandler';
import { MaterialRepo } from '../util/MaterialRepo';
import { PolygonUtil } from '../util/PolygonUtil';
import { COLOR_DESCRIPTIONS } from '../types/IColorDescription';

const ModelComponent = (props: IModelProps) => {

  const { scene: sceneUrl, handleModelComplete } = { ...props };


  const { scene, invalidate } = useThree();

  const groupRef = useRef<Group>(new Group());
  // const floorRef = useRef<Group>(new Group());

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

      const lights: SpotLight[] = [];

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

        // console.log('misc_gray', faceName)

        // console.log('faceName', faceName);
        const faceDescKeys: TFaceDescKey[] = Object.keys(FACE_DESCRIPTIONS) as TFaceDescKey[];
        let faceDesc: IFaceDescription | undefined;
        faceDescKeys.forEach((faceDescKey: TFaceDescKey) => {
          if (faceName === faceDescKey) {
            faceDesc = FACE_DESCRIPTIONS[faceDescKey];
            faceName = faceDescKey;
          }
        });
        if (!faceDesc) {
          faceDescKeys.forEach((faceDescKey: TFaceDescKey) => {
            if (faceName.startsWith(faceDescKey)) {
              faceDesc = FACE_DESCRIPTIONS[faceDescKey];
              faceName = faceDescKey;
            }
          });
        }

        // console.log(faceName, faceDesc)

        if (faceDesc) {

          face.name = faceName; // reassign, since the original occurence of name may have been somewhere else in the hierarchy

          // if there is a status handler with that key, add it to its faces container
          STATUS_HANDLERS[faceName as TStatusKey]?.faces.push(face);
          // if there are preset props with that key, add it to its faces container
          PRESET_PROPS[faceName as TPresetKey]?.faces.push(face);

          face.material = MaterialRepo.getMaterialFace(faceDesc);
          if (faceDesc.lineDesc.lineStyle !== 'none') {

            // find outer edges of this element
            const outerRings: IEdge3D[][] = PolygonUtil.findOuterRings(face);
            const sgmtsArray: LineSegments[] = PolygonUtil.toSgmt(outerRings, faceName, face.position, faceDesc.lineDesc);
            sgmtsArray.forEach(sgmts => {
              if (faceDesc!.lineDesc.lineStyle === 'thin') {
                face.parent?.add(sgmts);
                // if there is a status handler with that key, add it to its sgmts container
                STATUS_HANDLERS[faceName as TStatusKey]?.sgmts.push(sgmts);
                // if there are preset props with that key, add it to its sgmts container
                PRESET_PROPS[faceName as TPresetKey]?.sgmts.push(sgmts);
              } else if (faceDesc!.lineDesc.lineStyle === 'wide') {
                const line2 = PolygonUtil.toLine2(sgmts, faceDesc!.lineDesc);
                face.parent?.add(line2);
                // if there is a status handler with that key, add it to its lines container
                STATUS_HANDLERS[faceName as TStatusKey]?.lines.push(line2);
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
            const p2 = line1.localToWorld(new Vector3(positions[6], positions[7], positions[8]));
            const p3 = line1.localToWorld(new Vector3(positions[9], positions[10], positions[11]));

            // const d01 = p0.clone().sub(p1).length();
            // const d23 = p2.clone().sub(p3).length();
            // console.log('d01', d01, 'd23', d23, p0, p1, p2, p3);

            const p10n = p0.clone().sub(p1).normalize();
            const p23n = p3.clone().sub(p2).normalize();
            // const pUpn = p23n.clone().cross(p10n).normalize();

            textGroupOuter.position.x = p1.x;
            textGroupOuter.position.y = p1.y;
            textGroupOuter.position.z = p1.z;

            // rotate text to follow the long "leg"
            const txBase = new Vector3(1, 0, 0);
            const nTx1p23n = txBase.clone().cross(p23n).normalize();
            const aTx1p23n = txBase.angleTo(p23n);

            // calculate angle required to put up on the short leg
            const txUp = new Vector3(0, 1, 0);
            txUp.applyAxisAngle(nTx1p23n, aTx1p23n);
            const aTx2p10n = txUp.angleTo(p10n);

            textGroupOuter.rotateOnAxis(p23n, -aTx2p10n);
            textGroupOuter.rotateOnAxis(nTx1p23n, aTx1p23n);

            line1.visible = false;
            textGroupOuter.add(textGroupInner);
            scene.add(textGroupOuter);

            // if there is a status handler with that key, add it to its texts container
            STATUS_HANDLERS[lineName as TStatusKey]?.texts.push(textGroupInner);

          } else if (lineName.startsWith('light')) {

            const positions: number[] = [...line1.geometry.attributes['position'].array];
            const p0 = line1.localToWorld(new Vector3(positions[3], positions[4], positions[5]));

            const light = new SpotLight();
            light.position.set(p0.x, p0.y, p0.z);
            lights.push(light);

            const positions2: number[] = []; // point A of first segment
            const increm = 10;
            const radius = 0.15;
            for (let i = 0; i <= 360; i += increm) {
              const angleA = i * Math.PI / 180;
              positions2.push(Math.sin(angleA) * radius);
              positions2.push(Math.cos(angleA) * radius);
              positions2.push(0);
            }
            const lineGeometry = new LineGeometry();
            lineGeometry.setPositions(positions2);

            const line2 = new Line2(lineGeometry, MaterialRepo.getMaterialLine(lineDesc));
            line2.computeLineDistances();

            const circleGeometry = new CircleGeometry(radius, 360 / increm);
            const material = MaterialRepo.getMaterialFace(COLOR_DESCRIPTIONS['face_gray___clip__245']);
            const circleMesh = new Mesh(circleGeometry, material); scene.add(circleMesh);
            circleMesh.position.set(0, 0, -0.20);

            const group = new Group();
            group.position.set(p0.x, p0.y, p0.z);
            group.name = lineName as TStatusKey;

            group.add(circleMesh);
            group.add(line2);

            line1.visible = false;
            // dont add the light yet, will be passed through properties to SunComponent
            scene.add(group);

            // STATUS_HANDLERS[lineName as TStatusKey]?.faces.push(lightSphere);
            STATUS_HANDLERS[lineName as TStatusKey]?.lights.push(light);
            STATUS_HANDLERS[lineName as TStatusKey]?.faces.push(circleMesh);
            STATUS_HANDLERS[lineName as TStatusKey]?.lines.push(line2);
            STATUS_HANDLERS[lineName as TStatusKey]?.sprites.push(group);

          } else {

            line1.name = lineName; // reassign, since the original occurence of name may have been somewhere else in the hierarchy

            // console.log('line1.name', line1.name);

            if (lineDesc.lineStyle === 'thin') {
              line1.material = MaterialRepo.getMaterialSgmt(lineDesc);
              // if there is a status handler with that key, add it to its sgmts container
              STATUS_HANDLERS[lineName as TStatusKey]?.sgmts.push(line1);
            } else if (lineDesc.lineStyle === 'wide') {
              const line2 = PolygonUtil.toLine2(line1, lineDesc);
              line1.visible = false;
              line1.parent?.add(line2);
              // if there is a status handler with that key, add it to its lines container
              STATUS_HANDLERS[lineName as TStatusKey]?.lines.push(line2);
            }

          }

        } else { // unnamed

          line1.material = MaterialRepo.getMaterialSgmt(LINE_DESCRIPTIONS['misc_gray']);

        }

      });

      groupRef.current.add(result.scene);
      window.setTimeout(() => {
        handleModelComplete(lights);
      }, 250)

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

  return (
    <>
      <group ref={groupRef} />
    </>
  );
};

export default ModelComponent;
