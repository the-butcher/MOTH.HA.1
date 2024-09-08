import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { SpotLight } from 'three';
import { ISunProps } from '../types/ISunProps';

const LightComponent = (props: ISunProps) => {

  const lightRef = useRef<SpotLight>(new SpotLight());

  const { gl } = useThree();

  const configureLight = (light: SpotLight, textureFraction: number) => {

    // light.position.set(props.position.x, props.position.y, props.position.z);
    light.lookAt(0, 0, 0);
    light.intensity = 1; //props.intensity;
    light.angle = 6;
    light.decay = 0.10;

    light.castShadow = true;
    light.shadow.autoUpdate = true;
    // light.shadow.camera.setFocalLength(200);
    // light.shadow.camera.top = 10;
    // light.shadow.camera.bottom = -10;
    // light.shadow.camera.left = -10;
    // light.shadow.camera.right = 10;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 100;
    light.shadow.camera.lookAt(0, 0, 0);
    light.shadow.bias = -0.00000005;
    const maxTextureSize = gl.capabilities.maxTextureSize;
    light.shadow.mapSize.width = maxTextureSize / textureFraction;
    light.shadow.mapSize.height = maxTextureSize / textureFraction;


  };
  useEffect(() => {
    console.debug('✨ building light component', props);

    configureLight(lightRef.current, 8);

    // const helper1 = new SpotLightHelper(lightRef.current);
    // scene.add(helper1);

    // const helper1 = new DirectionalLightHelper(lightRef.current);
    // scene.add(helper1);

    // const helper2 = new CameraHelper(lightRef.current.shadow.camera);
    // scene.add(helper2);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return <spotLight intensity={1} ref={lightRef} castShadow />;
};

export default LightComponent;
