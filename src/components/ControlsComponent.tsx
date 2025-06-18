import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, Mesh, Raycaster, SphereGeometry, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { IClientCoordinate, IConfirmProps } from '../types/IConfirmProps';
import { CAMERA_PROPS, IOrbitProps, TCameraKey } from '../types/IOrbitProps';
import { STATUS_HANDLERS, TStatusHandlerKey } from '../types/IStatusHandler';
import { MaterialRepo } from '../util/MaterialRepo';
import { ScreenshotUtil } from '../util/ScreenshotUtil';
import { ID_CANVAS } from './SceneComponent';
import { MODEL_OFFSET_Y } from '../types/IModelProps';

const ControlsComponent = (props: IOrbitProps) => {

  const { handleConfirmProps, cameraKey, handleCameraKey, handleWorldFocusDistance, clipPlane } = { ...props };

  const { camera, gl, scene, invalidate } = useThree();

  const controlsRef = useRef<OrbitControls>();
  const centerHelperRef = useRef<Mesh>(); // target of orbit controls
  const wFocusHelperRef = useRef<Mesh>()
  const selectHelperRef = useRef<Group>();
  const pointerUpRef = useRef<Vector2>();
  const pointerDownRef = useRef<Vector2>();
  const raycasterRef = useRef<Raycaster>(new Raycaster());

  const cameraKeyRefA = useRef<TCameraKey>();
  const cameraKeyRefB = useRef<TCameraKey>();

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating controls component (cameraKey)', cameraKey);

    cameraKeyRefA.current = cameraKey;
    cameraKeyRefB.current = cameraKey;
    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraKey]);

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

    const centerSphere = new Mesh(new SphereGeometry(0.025), MaterialRepo.getMaterialFace({
      rgb: 0x00ff00,
      opacity: 1.00
    }));
    centerHelperRef.current = centerSphere;
    centerHelperRef.current.name = 'ArrowHelper';
    scene.add(centerHelperRef.current);

    const wFocusSphere = new Mesh(new SphereGeometry(0.010), MaterialRepo.getMaterialFace({
      rgb: 0x0000ff,
      opacity: 1.00
    }));
    wFocusHelperRef.current = wFocusSphere;
    wFocusHelperRef.current.name = 'ArrowHelper';
    scene.add(wFocusHelperRef.current);


    selectHelperRef.current = new Group();
    scene.add(selectHelperRef.current);


    controlsRef.current.addEventListener('change', () => {
      const target: Vector3 = new Vector3();
      camera.getWorldDirection(target);
      if (cameraKeyRefB.current !== 'user') {
        const positionIsEqual = CAMERA_PROPS[cameraKeyRefB.current!].equals(camera.position, controlsRef.current!.target);
        if (!positionIsEqual) {
          // console.log('pos', camera.position.x, ',', camera.position.y, ',', camera.position.z);
          // console.log('tgt', controlsRef.current!.target.x, ',', controlsRef.current!.target.y, ',', controlsRef.current!.target.z);
          handleCameraKey('user');
        }
      }
      invalidate();
    });

    // handleResize();

    // initial target eval
    window.setTimeout(() => {
      pointerUpRef.current = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
      invalidate();
    }, 100);


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene]);

  useFrame(({ gl, scene, camera }) => {

    // if there is a fresh camera pre-setting
    if (cameraKeyRefA.current) {

      CAMERA_PROPS[cameraKeyRefA.current!].apply(camera.position, controlsRef.current!.target);
      controlsRef.current!.update();

      // reset key to prevent repeated eval
      cameraKeyRefA.current = undefined;

      // "force" target calc with respect to scene
      pointerUpRef.current = new Vector2(window.innerWidth / 2, window.innerHeight / 2);

      invalidate();

      return; // use next cycle to actually render (TODO check if still needed)

    }

    if (pointerUpRef.current) {

      raycasterRef.current.setFromCamera(new Vector2(0, 0), camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children).filter(i => i.point.y < (clipPlane + MODEL_OFFSET_Y));
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

      const worldFocusDistance = camera.position.clone().sub(wFocusHelperRef.current!.position).length();
      handleWorldFocusDistance(worldFocusDistance);

      // console.log('pos', camera.position.x, ',', camera.position.y, ',', camera.position.z);
      // console.log('tgt', targetPos.x, ',', targetPos.y, ',', targetPos.z);


      if (pointerDownRef.current && pointerUpRef.current.clone().sub(pointerDownRef.current).length() < 3) {

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

            const intersects = raycasterRef.current.intersectObjects(scene.children).filter(i => i.point.y < (clipPlane + MODEL_OFFSET_Y));
            for (let intersectIndex = 0; intersectIndex < intersects.length; intersectIndex++) {

              if (intersectIndex === 0) {
                wFocusHelperRef.current!.position.set(intersects[intersectIndex].point.x, intersects[intersectIndex].point.y, intersects[intersectIndex].point.z);
                const worldFocusDistance = camera.position.clone().sub(wFocusHelperRef.current!.position).length();
                handleWorldFocusDistance(worldFocusDistance);
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

        pointerDownRef.current = undefined;

      }

      pointerUpRef.current = undefined;

    }

    gl.render(scene, camera);

  }, 2);

  return null;

};

export default ControlsComponent;
