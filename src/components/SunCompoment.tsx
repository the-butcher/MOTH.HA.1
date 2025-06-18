import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import { DirectionalLight, Vector3 } from 'three';
import { STATUS_HANDLERS } from '../types/IStatusHandler';
import { ISunProps } from '../types/ISunProps';
import { TimeUtil } from '../util/TimeUtil';
import { WeatherUtil } from '../util/WeatherUtil';

const SunCompoment = (props: ISunProps) => {

  const { sunInstant } = { ...props };
  const lightRef = useRef<DirectionalLight>(new DirectionalLight());

  const { gl, scene } = useThree();

  const configureLight = (light: DirectionalLight, textureFraction: number) => {

    light.position.set(0, 0, 1);
    light.lookAt(0, 0, 0);
    light.intensity = 0.90;
    light.castShadow = true;
    light.shadow.autoUpdate = true;

    light.shadow.camera.top = 15;
    light.shadow.camera.bottom = -15;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.near = 15;
    light.shadow.camera.far = 150;
    light.shadow.camera.lookAt(0, 0, 0);
    light.shadow.bias = -0.005;

    const maxTextureSize = gl.capabilities.maxTextureSize;
    light.shadow.mapSize.width = maxTextureSize / textureFraction;
    light.shadow.mapSize.height = maxTextureSize / textureFraction;

  };
  useEffect(() => {

    console.debug('✨ building sun component');

    configureLight(lightRef.current, 16);

    // scene.add(new DirectionalLightHelper(lightRef.current));
    // scene.add(new CameraHelper(lightRef.current.shadow.camera));

    lightRef.current.shadow.needsUpdate = true;
    gl.shadowMap.needsUpdate = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating sun component (hour)', sunInstant);

    const forecast = WeatherUtil.getForecast(sunInstant);
    STATUS_HANDLERS['weather___'].statusHndlr(forecast as never);

    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sunInstant]);

  useFrame(() => { // { gl, scene, camera }

    const position = SunCalc.getPosition(new Date(sunInstant), TimeUtil.LATITUDE, TimeUtil.LONGITUDE); // coordinates for vienna

    const forecast = WeatherUtil.getForecast(sunInstant);
    // console.log('forecast sun', forecast.sunshine);
    lightRef.current.intensity = 0.1 + 0.8 * forecast.sunshine;

    const azimuth = position.azimuth;
    const altitude = position.altitude;
    const sunDist = 50;

    const environmentRotation = position.azimuth + Math.PI / 2;
    const environmentIntensity = 0.02 + 0.1 * forecast.sunshine;
    // console.log('environmentRotation', environmentRotation, 'environmentIntensity', environmentIntensity);

    lightRef.current.position.set(- Math.sin(azimuth) * sunDist, Math.tan(altitude) * sunDist, Math.cos(azimuth) * sunDist);
    lightRef.current.lookAt(0, 0, 0);

    scene.environmentRotation.setFromVector3(new Vector3(0, -environmentRotation, 0));
    scene.environmentIntensity = environmentIntensity;
    scene.environment!.needsUpdate = true;

    lightRef.current.shadow.needsUpdate = true;
    gl.shadowMap.needsUpdate = true;

  }, 2);

  return <directionalLight intensity={1} ref={lightRef} castShadow />;

};

export default SunCompoment;
