import { invalidate, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import { AmbientLight, DirectionalLight } from 'three';
import { STATUS_HANDLERS } from '../types/IStatusHandler';
import { ISunProps } from '../types/ISunProps';
import { TimeUtil } from '../util/TimeUtil';
import { WeatherUtil } from '../util/WeatherUtil';

const SunCompoment = (props: ISunProps) => {

  const { sunInstant } = { ...props };
  const lightRef = useRef<DirectionalLight>(new DirectionalLight());
  const ambientLightRef = useRef<AmbientLight>(new AmbientLight());

  // const [environmentIntensity, setEnvironmentIntensity] = useState<number>(0.5);
  // const [backgroundRotation, setBackgroundRotation] = useState<[number, number, number]>([0, 0, 0]);

  const { gl } = useThree();

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
    light.shadow.bias = -0.0005;

    const maxTextureSize = gl.capabilities.maxTextureSize;
    light.shadow.mapSize.width = maxTextureSize / textureFraction;
    light.shadow.mapSize.height = maxTextureSize / textureFraction;

    // console.log('texture dim', maxTextureSize / textureFraction);

  };
  useEffect(() => {

    console.debug('✨ building sun component');

    configureLight(lightRef.current, 8);

    // scene.add(new DirectionalLightHelper(lightRef.current));
    // scene.add(new CameraHelper(lightRef.current.shadow.camera));

    // console.log('updating shadow');
    // lightRef.current.shadow.needsUpdate = true;
    gl.shadowMap.needsUpdate = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating sun component (sunInstant)', sunInstant);

    const position = SunCalc.getPosition(new Date(sunInstant), TimeUtil.LATITUDE, TimeUtil.LONGITUDE); // coordinates for vienna

    const forecast = WeatherUtil.getForecast(sunInstant);
    STATUS_HANDLERS['weather___'].statusHndlr(forecast as never);

    // console.log('forecast sun', forecast.sunshine);
    lightRef.current.intensity = 0.5 + 1.0 * forecast.sunshine;
    ambientLightRef.current.intensity = 0.5 + 0.5 * forecast.sunshine;

    const azimuth = position.azimuth;
    const altitude = position.altitude;
    const sunDist = 50;

    // const _backgroundRotation = position.azimuth + Math.PI / 2;
    // const _environmentIntensity = 0.1 + 0.5 * forecast.sunshine;
    // console.log('environmentRotation', environmentRotation, 'environmentIntensity', environmentIntensity);

    lightRef.current.position.set(- Math.sin(azimuth) * sunDist, Math.tan(altitude) * sunDist, Math.cos(azimuth) * sunDist);
    lightRef.current.lookAt(0, 0, 0);

    // console.log('environmentIntensity', _environmentIntensity, 'environmentRotation', _backgroundRotation);

    // setBackgroundRotation([0, -_backgroundRotation, 0]);
    // setEnvironmentIntensity(_environmentIntensity);

    // console.log('updating shadow');
    // lightRef.current.shadow.needsUpdate = true;
    gl.shadowMap.needsUpdate = true;

    invalidate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sunInstant]);

  // useEffect(() => {

  //   console.debug('⚙ updating sun component (backgroundRotation, environmentIntensity)', backgroundRotation, environmentIntensity);

  //   // scene.environmentIntensity = environmentIntensity;
  //   // scene.environmentRotation.setFromVector3(new Vector3(backgroundRotation[0], backgroundRotation[1], backgroundRotation[2]));
  //   // scene.environment!.needsUpdate = true;

  //   // invalidate();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [backgroundRotation, environmentIntensity]);

  return <>
    {/* <Environment preset="park" backgroundRotation={backgroundRotation} background={true} environmentIntensity={environmentIntensity} backgroundBlurriness={0.00} resolution={128} /> */}
    <directionalLight intensity={1} ref={lightRef} castShadow />
    <ambientLight intensity={1} ref={ambientLightRef} />
  </>;

};

export default SunCompoment;
