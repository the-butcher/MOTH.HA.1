import { useFrame, useThree } from '@react-three/fiber';
import { easeInOut } from "motion";
import { useEffect, useRef } from 'react';
import { Group, Mesh, Raycaster, SphereGeometry, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { IClientCoordinate, IConfirmProps } from '../types/IConfirmProps';
import { MODEL_OFFSET_Y } from '../types/IModelProps';
import { CAMERA_PROPS, IOrbitProps } from '../types/IOrbitProps';
import { STATUS_HANDLERS, TStatusHandlerKey } from '../types/IStatusHandler';
import { MaterialRepo } from '../util/MaterialRepo';
import { ScreenshotUtil } from '../util/ScreenshotUtil';
import { ID_CANVAS } from './SceneComponent';
// import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass, FXAAEffect } from "postprocessing";

const ControlsComponent = (props: IOrbitProps) => {

  const { handleConfirmProps, cameraKey } = { ...props }; // , handleCameraKey, handleWorldFocusDistance

  const { camera, gl, scene, invalidate } = useThree();

  const controlsRef = useRef<OrbitControls>();

  const centerHelperRef = useRef<Mesh>(); // target of orbit controls
  const wFocusHelperRef = useRef<Mesh>()
  const selectHelperRef = useRef<Group>();

  const pointerUpRef = useRef<Vector2>();
  const pointerDownRef = useRef<Vector2>();
  const raycasterRef = useRef<Raycaster>(new Raycaster());

  // const cameraKeyRefA = useRef<TCameraKey>();
  // const cameraKeyRefB = useRef<TCameraKey>();

  const cameraPositionCurr = useRef<Vector3>(new Vector3());
  const cameraPositionOrig = useRef<Vector3>(new Vector3());
  const cameraPositionDiff = useRef<Vector3>(new Vector3());
  const cameraTargetCurr = useRef<Vector3>(new Vector3());
  const cameraTargetOrig = useRef<Vector3>(new Vector3());
  const cameraTargetDiff = useRef<Vector3>(new Vector3());
  const wFocusTargetCurr = useRef<Vector3>(new Vector3());
  const wFocusTargetOrig = useRef<Vector3>(new Vector3());
  const wFocusTargetDiff = useRef<Vector3>(new Vector3());

  const worldFocusDistanceRef = useRef<number>(0);

  const clipPlaneCurr = useRef<number>(8.6);
  const clipPlaneOrig = useRef<number>(8.6);
  const clipPlaneDiff = useRef<number>(8.6);

  const effectComposerRef = useRef<EffectComposer>();
  const effectPassRef = useRef<EffectPass>();

  /**
   * the beginning millis of animation
   */
  const tsAnimOrig = useRef<number>(-1);
  /**
   * the ending millis of animation
   */
  const tsAnimDest = useRef<number>(-1);

  const toScreenCoordinate = (mouseCoordinate: Vector2): Vector2 => {
    const x = (mouseCoordinate.x / window.innerWidth) * 2 - 1;
    const y = -(mouseCoordinate.y / window.innerHeight) * 2 + 1;
    return new Vector2(x, y);
  }

  const handlePointerDown = (e: MouseEvent) => {
    if (e.target && (e.target as HTMLElement).id === ID_CANVAS) {
      pointerDownRef.current = new Vector2(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: MouseEvent) => {
    if (e.target && (e.target as HTMLElement).id === ID_CANVAS) {
      pointerUpRef.current = new Vector2(e.clientX, e.clientY);
      invalidate();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'f') {

      console.debug('⚙ handle key up "f"');
      ScreenshotUtil.getInstance().renderToFrame(gl); // , scene, camera, 0

    } else if (e.key === 'p') {

      console.debug('⚙ handle key up "p"');
      ScreenshotUtil.getInstance().renderToFrame(gl); // , scene, camera, 0
      if (ScreenshotUtil.getInstance().getFrameCount() === 1) {
        ScreenshotUtil.getInstance().exportToPng();
      } else {
        ScreenshotUtil.getInstance().exportToGif();
      }
      ScreenshotUtil.getInstance().removeFrame(0);
      // handleScreenshotCompleted();

    }
  };
  // const handleResize = () => {
  //   if (window.innerWidth > window.innerHeight) {
  //     camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth / 4 - 50, 0, window.innerWidth, window.innerHeight);
  //     (camera as PerspectiveCamera).setFocalLength(25);
  //   } else {
  //     camera.setViewOffset(window.innerWidth, window.innerHeight, -40, -window.innerHeight / 4, window.innerWidth, window.innerHeight);
  //     (camera as PerspectiveCamera).setFocalLength(25);
  //   }
  // };

  useEffect(() => {

    console.debug('✨ building orbit component', props);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handlePointerUp);

    window.addEventListener('keyup', handleKeyUp);
    // window.addEventListener('resize', handleResize);

    effectComposerRef.current = new EffectComposer(gl);

    effectPassRef.current = new EffectPass(camera, new DepthOfFieldEffect(camera, {
      worldFocusDistance: worldFocusDistanceRef.current,
      worldFocusRange: worldFocusDistanceRef.current / 3,
      bokehScale: 5
    }));

    effectComposerRef.current.addPass(new RenderPass(scene, camera));
    effectComposerRef.current.addPass(new EffectPass(camera, new FXAAEffect()));
    effectComposerRef.current.addPass(effectPassRef.current);

    MaterialRepo.setClipPlane(clipPlaneCurr.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {

  //   console.debug('⚙ updating constrols component (clipPlane)', clipPlane);

  //   MaterialRepo.setClipPlane(clipPlane);
  //   invalidate();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [clipPlane]);



  useEffect(() => {

    console.debug('⚙ updating controls component (camera, gl)', camera, gl);

    controlsRef.current = new OrbitControls(camera, gl.domElement);
    // controlsRef.current.enablePan = false;
    // controls.screenSpacePanning = true; // default
    // controls.enableDamping = false;
    // controls.zoomToCursor = true;

    // cameraKeyRefA.current = cameraKey;
    // cameraKeyRefB.current = cameraKey;

    camera.near = 1;
    // controlsRef.current.minPolarAngle = 0; // Math.PI / 4; // how far above ground the map can be tilted, 0 == vertical
    // controlsRef.current.maxPolarAngle = Math.PI / 2;

    const centerSphere = new Mesh(new SphereGeometry(0.05), MaterialRepo.getMaterialFace({
      rgb: 0x00ff00,
      opacity: 1.00,
      clip: false
    }));
    centerHelperRef.current = centerSphere;
    centerHelperRef.current.name = 'ArrowHelper';
    scene.add(centerHelperRef.current);

    const wFocusSphere = new Mesh(new SphereGeometry(0.05), MaterialRepo.getMaterialFace({
      rgb: 0x0000ff,
      opacity: 1.00,
      clip: false
    }));
    wFocusHelperRef.current = wFocusSphere;
    wFocusHelperRef.current.name = 'ArrowHelper';
    scene.add(wFocusHelperRef.current);

    selectHelperRef.current = new Group();
    scene.add(selectHelperRef.current);

    controlsRef.current.addEventListener('change', () => {
      invalidate();
      // const target: Vector3 = new Vector3();
      // camera.getWorldDirection(target);
      // const checkKeys: TCameraKey[] = ['home3', 'pumps', 'quarter'];
      // for (let i = 0; i < checkKeys.length; i++) {
      //   const isPositionMatch = CAMERA_PROPS[checkKeys[i]].equals(camera.position, controlsRef.current!.target);
      //   if (isPositionMatch) {
      //     setTimeout(() => {
      //       handleCameraKey(checkKeys[i]);
      //     }, 500);

      //     return;
      //   }
      // }
      // handleCameraKey('user');
    });

    // handleResize();

    // initial target eval
    window.setTimeout(() => {
      pointerUpRef.current = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
      invalidate();
    }, 100);


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene]);

  useEffect(() => {

    console.debug('⚙ updating controls component (cameraKey)', cameraKey);

    // cameraKeyRefA.current = cameraKey;
    // cameraKeyRefB.current = cameraKey;

    if (cameraKey !== 'user') {

      const cameraPositionDest = new Vector3();
      const cameraTargetDest = new Vector3();
      const wFocusTargetDest = new Vector3();

      CAMERA_PROPS[cameraKey].apply(cameraPositionDest, cameraTargetDest, wFocusTargetDest);

      cameraPositionOrig.current = camera.position.clone();
      cameraPositionDiff.current = cameraPositionDest.clone().sub(cameraPositionOrig.current);

      cameraTargetOrig.current = controlsRef.current!.target.clone();
      cameraTargetDiff.current = cameraTargetDest.clone().sub(cameraTargetOrig.current);

      wFocusTargetOrig.current = wFocusHelperRef.current!.position.clone();
      wFocusTargetDiff.current = wFocusTargetDest.clone().sub(wFocusTargetOrig.current);

      const clipPlaneDest = CAMERA_PROPS[cameraKey].clipPlane;
      clipPlaneOrig.current = clipPlaneCurr.current;
      clipPlaneDiff.current = clipPlaneDest - clipPlaneOrig.current;

      tsAnimOrig.current = Date.now();
      tsAnimDest.current = tsAnimOrig.current + 2500;

      // trigger first animation frame
      invalidate();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraKey]);

  const updateControls = (fraction: number) => {

    cameraPositionCurr.current = cameraPositionOrig.current.clone().add(cameraPositionDiff.current.clone().multiplyScalar(fraction));
    cameraTargetCurr.current = cameraTargetOrig.current.clone().add(cameraTargetDiff.current.clone().multiplyScalar(fraction));
    wFocusTargetCurr.current = wFocusTargetOrig.current.clone().add(wFocusTargetDiff.current.clone().multiplyScalar(fraction));

    camera.position.set(cameraPositionCurr.current.x, cameraPositionCurr.current.y, cameraPositionCurr.current.z);
    controlsRef.current!.target.set(cameraTargetCurr.current.x, cameraTargetCurr.current.y, cameraTargetCurr.current.z);
    wFocusHelperRef.current!.position.set(wFocusTargetCurr.current.x, wFocusTargetCurr.current.y, wFocusTargetCurr.current.z);

    if (clipPlaneDiff.current !== 0) {
      clipPlaneCurr.current = clipPlaneOrig.current + clipPlaneDiff.current * fraction;
      MaterialRepo.setClipPlane(clipPlaneCurr.current);
      gl.shadowMap.needsUpdate = true;
    }

    worldFocusDistanceRef.current = camera.position.clone().sub(wFocusHelperRef.current!.position).length();

    controlsRef.current!.update();

  }

  useFrame(() => { // { gl, scene, camera }s

    const tsAnimN = Date.now();
    if (tsAnimN < tsAnimDest.current) {

      const fraction = (tsAnimN - tsAnimOrig.current) / (tsAnimDest.current - tsAnimOrig.current);
      // console.log('fraction', easeInOut(fraction));
      updateControls(easeInOut(easeInOut(fraction)));

      invalidate();

    } else if (tsAnimDest.current > 0) { // final animation step pending

      // console.log('fraction', 1);
      updateControls(1);

      tsAnimOrig.current = -1;
      tsAnimDest.current = -1;

      invalidate();

    }

    if (pointerDownRef.current) {
      // console.log('nav');
    }

    if (pointerUpRef.current) {

      // console.log('intersect a, clipPlane', clipPlane);

      raycasterRef.current.setFromCamera(new Vector2(0, 0), camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children).filter(i => i.point.y < (clipPlaneCurr.current + MODEL_OFFSET_Y));
      for (let intersectIndex = 0; intersectIndex < intersects.length; intersectIndex++) {
        const intersect = intersects[intersectIndex];
        if (intersect.object.name !== 'ArrowHelper' && intersect.object.parent?.name !== 'ArrowHelper') {

          controlsRef.current!.target.x = intersect.point.x;
          controlsRef.current!.target.y = intersect.point.y;
          controlsRef.current!.target.z = intersect.point.z;

          controlsRef.current!.update(); // https://github.com/mrdoob/three.js/issues/23090

          break;

        }
      }

      const targetPos = controlsRef.current!.target;
      centerHelperRef.current?.position.set(targetPos.x, targetPos.y, targetPos.z);

      worldFocusDistanceRef.current = camera.position.clone().sub(wFocusHelperRef.current!.position).length();

      console.log('pos', camera.position.x, ',', camera.position.y, ',', camera.position.z);
      console.log('tgt', targetPos.x, ',', targetPos.y, ',', targetPos.z);

      if (pointerDownRef.current) {

        if (pointerUpRef.current.clone().sub(pointerDownRef.current).length() < 3) {

          // console.log('intersect b');

          const hitsByNamedHandler: { [K in string]: number } = {};

          // clear container for select helper spheres
          selectHelperRef.current?.clear();

          for (let radius = 1; radius <= 3; radius++) {
            const startAngle = radius * 30;
            for (let gradAngle = startAngle; gradAngle < startAngle + 360; gradAngle += 60) {

              const radAngle = gradAngle / 180 * Math.PI;
              const clickCoordinate = new Vector2(Math.cos(radAngle) * radius * 3, Math.sin(radAngle) * radius * 3);
              const screenCoordinate = toScreenCoordinate(pointerUpRef.current.clone().add(clickCoordinate));

              raycasterRef.current.setFromCamera(screenCoordinate, camera);

              const intersects = raycasterRef.current.intersectObjects(scene.children).filter(i => i.point.y < (clipPlaneCurr.current + MODEL_OFFSET_Y));
              for (let intersectIndex = 0; intersectIndex < intersects.length; intersectIndex++) {

                if (intersectIndex === 0) {
                  wFocusHelperRef.current!.position.set(intersects[intersectIndex].point.x, intersects[intersectIndex].point.y, intersects[intersectIndex].point.z);
                  worldFocusDistanceRef.current = camera.position.clone().sub(wFocusHelperRef.current!.position).length();
                  console.log('pos', wFocusHelperRef.current!.position.x, ',', wFocusHelperRef.current!.position.y, ',', wFocusHelperRef.current!.position.z);
                }
                const intersect = intersects[intersectIndex];
                // console.log('intersect', intersect);
                if (intersect.object.name !== '' && intersect.object.name !== 'ArrowHelper') {

                  // const sphere = new Mesh(new SphereGeometry(0.02), MaterialRepo.getMaterialFace({
                  //   rgb: 0x0000FF,
                  //   opacity: 0.5
                  // }));
                  // sphere.position.x = intersect.point.x;
                  // sphere.position.y = intersect.point.y;
                  // sphere.position.z = intersect.point.z;
                  // selectHelperRef.current?.add(sphere);

                  const statusHandler = STATUS_HANDLERS[intersect.object.name as TStatusHandlerKey];
                  if (statusHandler?.confirmProps) {
                    hitsByNamedHandler[intersect.object.name] = hitsByNamedHandler[intersect.object.name] ? hitsByNamedHandler[intersect.object.name] + (3 - radius) : 1;
                  }

                  break;

                }
              }
            }
          }

          let maxConfirmProps: IConfirmProps | undefined;
          let maxHits = -1;
          Object.keys(hitsByNamedHandler).forEach(key => {
            const keyHits = hitsByNamedHandler[key];
            if (keyHits > maxHits && STATUS_HANDLERS[key as TStatusHandlerKey].confirmProps) {
              maxHits = keyHits;
              maxConfirmProps = STATUS_HANDLERS[key as TStatusHandlerKey].confirmProps;
            }
          });

          if (maxConfirmProps) {
            handleConfirmProps({
              ...maxConfirmProps,
              handleCancel: (e: IClientCoordinate) => {
                maxConfirmProps?.handleCancel(e);
                handleConfirmProps(undefined);
              },
              handleConfirm: (e: IClientCoordinate) => {
                maxConfirmProps?.handleConfirm(e);
                handleConfirmProps(undefined);
              }
            });
          }

        }

        pointerDownRef.current = undefined;

      }

      pointerUpRef.current = undefined;

    }

    effectComposerRef.current!.removePass(effectPassRef.current!);
    effectPassRef.current!.dispose();
    effectPassRef.current = new EffectPass(camera, new DepthOfFieldEffect(camera, {
      worldFocusDistance: worldFocusDistanceRef.current,
      worldFocusRange: worldFocusDistanceRef.current / 3,
      bokehScale: 5
    }));
    effectComposerRef.current!.addPass(effectPassRef.current);
    effectComposerRef.current!.render();

    // scene.environment!.needsUpdate = true;
    // gl.clear();
    // gl.render(scene, camera);

  }, 2);

  // <EffectComposer renderPriority={3} enabled={true}>
  //   <DepthOfField
  //     bokehScale={4}
  //     worldFocusRange={worldFocusDistance / 3}
  //     worldFocusDistance={worldFocusDistance}
  //   />
  // </EffectComposer>

  return null;

};

export default ControlsComponent;
