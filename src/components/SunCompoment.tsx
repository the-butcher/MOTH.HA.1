import { invalidate, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import { AmbientLight, DirectionalLight, Object3D, SpotLight } from 'three';
import { STATUS_HANDLERS } from '../types/IStatusHandler';
import { ISunProps } from '../types/ISunProps';
import { TimeUtil } from '../util/TimeUtil';
import { WeatherUtil } from '../util/WeatherUtil';

const SunCompoment = (props: ISunProps) => {

  const { sunInstant, lights } = { ...props };
  const lightRef___shadow = useRef<DirectionalLight>(new DirectionalLight());
  const lightRef_noshadow = useRef<DirectionalLight>(new DirectionalLight());
  const ambientLightRef = useRef<AmbientLight>(new AmbientLight());

  // const [environmentIntensity, setEnvironmentIntensity] = useState<number>(0.5);
  // const [backgroundRotation, setBackgroundRotation] = useState<[number, number, number]>([0, 0, 0]);

  const { gl, scene } = useThree();

  const configureSun = (light: DirectionalLight, textureFraction: number) => {

    light.position.set(0, 0, 1);
    light.lookAt(0, 0, 0);
    // light.intensity = 0.90;
    light.castShadow = textureFraction > 0;
    light.shadow.autoUpdate = textureFraction > 0;

    if (textureFraction > 0) {

      light.shadow.camera.top = 15;
      light.shadow.camera.bottom = -15;
      light.shadow.camera.left = -20;
      light.shadow.camera.right = 20;
      light.shadow.camera.near = 15;
      light.shadow.camera.far = 150;
      light.shadow.camera.lookAt(0, 0, 0);
      light.shadow.bias = -0.001;

      const maxTextureSize = gl.capabilities.maxTextureSize;
      light.shadow.mapSize.width = maxTextureSize / textureFraction;
      light.shadow.mapSize.height = maxTextureSize / textureFraction;

    }

    // console.log('texture dim', maxTextureSize / textureFraction);

  };

  const configureSpotLight = (light: SpotLight, textureFraction: number) => {

    light.castShadow = textureFraction > 0;
    light.shadow.autoUpdate = false; // textureFraction > 0;
    light.intensity = 5;
    light.decay = 1.5;
    light.penumbra = 0.25;
    light.angle = 85 * Math.PI / 180

    const target: Object3D = new Object3D();

    scene.add(light);
    scene.add(target);

    light.target = target;
    target.position.set(light.position.x, light.position.y - 10, light.position.z);

    if (textureFraction > 0) {

      light.shadow.camera.near = 0.10;
      light.shadow.camera.far = 25;
      // light.shadow.camera.lookAt(0, -10, 0);
      light.shadow.bias = -0.001;

      const maxTextureSize = gl.capabilities.maxTextureSize;
      light.shadow.mapSize.width = maxTextureSize / textureFraction;
      light.shadow.mapSize.height = maxTextureSize / textureFraction;

    }


  };

  useEffect(() => {

    console.debug('✨ building sun component');

    configureSun(lightRef___shadow.current, 8);
    configureSun(lightRef_noshadow.current, -1);

    lights.forEach(light => {
      scene.add(light);
      configureSpotLight(light, 8);
      light.shadow.needsUpdate = true;
    });

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
    STATUS_HANDLERS['weather___'].handleStatus(forecast as never);

    const azimuth = position.azimuth;
    const altitude = position.altitude;
    const sunDist = 50;

    // PI / 2 when in zenith, 0 when rising or setting
    const ambientIntensity = 0.95 - Math.cos(altitude * 2) ** 60;
    //

    const lightRef___shadowIntensity = 1 - forecast.cloudcover;
    const lightRef_noshadowIntensity = forecast.cloudcover;

    lightRef___shadow.current.intensity = Math.max(0, lightRef___shadowIntensity * 1.5 * ambientIntensity);
    lightRef_noshadow.current.intensity = Math.max(0, lightRef_noshadowIntensity * 1.2 * ambientIntensity);
    ambientLightRef.current.intensity = Math.max(0.01, ambientIntensity);

    // console.log('ambientIntensity', ambientIntensity, 'lightRef___shadowIntensity', lightRef___shadow.current.intensity, 'lightRef_noshadowIntensity', lightRef_noshadow.current.intensity);

    // const _backgroundRotation = position.azimuth + Math.PI / 2;
    // const _environmentIntensity = 0.1 + 0.5 * forecast.sunshine;
    // console.log('environmentRotation', environmentRotation, 'environmentIntensity', environmentIntensity);

    lightRef___shadow.current.position.set(- Math.sin(azimuth) * sunDist, Math.tan(altitude) * sunDist, Math.cos(azimuth) * sunDist);
    lightRef___shadow.current.lookAt(0, 0, 0);

    lightRef_noshadow.current.position.set(- Math.sin(azimuth) * sunDist, Math.tan(altitude) * sunDist, Math.cos(azimuth) * sunDist);
    lightRef_noshadow.current.lookAt(0, 0, 0);

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
    <directionalLight intensity={1} ref={lightRef___shadow} castShadow />
    <directionalLight intensity={1} ref={lightRef_noshadow} castShadow />
    <ambientLight intensity={1} ref={ambientLightRef} />
  </>;

};

export default SunCompoment;
