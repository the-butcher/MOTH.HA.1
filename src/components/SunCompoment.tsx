import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import { DirectionalLight } from 'three';
import { ISunProps } from '../types/ISunProps';
import { TimeUtil } from '../util/TimeUtil';

const SunCompoment = (props: ISunProps) => {

  const { sunInstant } = { ...props };
  const lightRef = useRef<DirectionalLight>(new DirectionalLight());

  const { gl } = useThree();

  const configureLight = (light: DirectionalLight, textureFraction: number) => {

    light.position.set(0, 0, 1);
    light.lookAt(0, 0, 0);
    light.intensity = 1.00; //props.intensity;

    light.castShadow = true;
    light.shadow.autoUpdate = true;
    light.shadow.camera.top = 15;
    light.shadow.camera.bottom = -15;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.near = 15;
    light.shadow.camera.far = 100;
    light.shadow.camera.lookAt(0, 0, 0);
    light.shadow.bias = -0.005;

    const maxTextureSize = gl.capabilities.maxTextureSize;
    light.shadow.mapSize.width = maxTextureSize / textureFraction;
    light.shadow.mapSize.height = maxTextureSize / textureFraction;

  };
  useEffect(() => {

    console.debug('✨ building sun component');

    configureLight(lightRef.current, 16);

    // const helper1 = new SpotLightHelper(lightRef.current);
    // scene.add(helper1);

    // scene.add(new DirectionalLightHelper(lightRef.current));
    // scene.add(new CameraHelper(lightRef.current.shadow.camera));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating sun component (hour)', sunInstant);
    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sunInstant]);

  useFrame(() => { // { gl, scene, camera }

    const position = SunCalc.getPosition(new Date(sunInstant), TimeUtil.LATITUDE, TimeUtil.LONGITUDE); // coordinates for vienna

    const azimuth = position.azimuth; // Math.PI / 2 +
    const altitude = position.altitude;
    const sunDist = 50;

    lightRef.current.position.set(- Math.sin(azimuth) * sunDist, Math.tan(altitude) * sunDist, Math.cos(azimuth) * sunDist);
    lightRef.current.lookAt(0, 0, 0);

    // scene.add(new DirectionalLightHelper(lightRef.current));
    // scene.add(new CameraHelper(lightRef.current.shadow.camera));

  }, 1);

  return <directionalLight intensity={1} ref={lightRef} castShadow />;

};

export default SunCompoment;
