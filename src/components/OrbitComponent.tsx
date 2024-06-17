import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PerspectiveCamera, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { IOrbitProps } from '../types/IOrbitProps';

const OrbitComponent = (props: IOrbitProps) => {
  const { camera, gl, scene, invalidate } = useThree();

  const controlsRef = useRef<OrbitControls>();
  const pointerRef = useRef<Vector2>();

  const handleClick = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerRef.current = new Vector2(x, y);
    invalidate(); // re-render required to find out if something was selected by clicking
  };

  const handleResize = () => {
    if (window.innerWidth > window.innerHeight) {
      camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth / 4 - 50, 0, window.innerWidth, window.innerHeight);
      (camera as PerspectiveCamera).setFocalLength(25);
    } else {
      camera.setViewOffset(window.innerWidth, window.innerHeight, -40, -window.innerHeight / 4, window.innerWidth, window.innerHeight);
      (camera as PerspectiveCamera).setFocalLength(25);
    }
  };

  useEffect(() => {
    console.debug('✨ building orbit component', props);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.debug('⚙ updating controls component (camera, gl)', camera, gl);

    controlsRef.current = new OrbitControls(camera, gl.domElement);
    controlsRef.current.enablePan = false;
    controlsRef.current.enableDamping = false;

    // const globalPlaneA = new Plane(new Vector3(1, 0, 1), 0.0001);
    // const globalPlaneB = new Plane(new Vector3(1, 0, -1), 0.0001);
    // gl.clippingPlanes = [
    //   globalPlaneA,
    //   // globalPlaneB
    // ];

    camera.position.set(-28.59821177010701, 14.644400463539876, 28.36975612282989);
    controlsRef.current.target.set(0, 0, 0);
    camera.near = 1;
    controlsRef.current.minPolarAngle = 0; // Math.PI / 4; // how far above ground the map can be tilted, 0 == vertical
    controlsRef.current.maxPolarAngle = Math.PI / 2;
    controlsRef.current.update();

    controlsRef.current.addEventListener('change', () => {
      invalidate();
      // console.log('pt', camera.position);
    });

    handleResize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene]);

  useFrame(({ gl, scene, camera }) => {
    // when there is a pointer coordinate, handle object selection, if any
    // if (pointerRef.current) {
    //     raycasterRef.current.setFromCamera(pointerRef.current, camera);
    //     const intersects = raycasterRef.current.intersectObjects(scene.children);
    //     if (intersects.length > 0) {
    //         const nearestIntersect = intersects[0];
    //         if (nearestIntersect.object.name !== '') {
    //             if (nearestIntersect.object.name.startsWith('room')) {
    //                 handleSelection(nearestIntersect.object.name, 'norm');
    //             }
    //         }
    //     }
    //     pointerRef.current = undefined;
    // }

    gl.render(scene, camera);

    const invalidateRequired = controlsRef.current?.update(); // https://github.com/mrdoob/three.js/issues/23090
    if (invalidateRequired) {
      invalidate();
    }

  }, 2);

  return null;
};

export default OrbitComponent;
