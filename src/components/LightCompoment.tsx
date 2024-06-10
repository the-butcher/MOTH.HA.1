import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { SpotLight } from 'three';
import { ILightProps } from '../types/ILightProps';

const LightComponent = (props: ILightProps) => {

  const lightRef = useRef<SpotLight>(new SpotLight());

  const { gl } = useThree();
  const { stamp, intensity } = props;

  const configureLight = (light: SpotLight, textureFraction: number) => {

    light.position.set(props.position.x, props.position.y, props.position.z);
    light.lookAt(0, 0, 0);
    light.intensity = props.intensity; //props.intensity;
    light.angle = 6;
    light.decay = 0.10;

    if (props.shadowEnabled) {
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
    } else {
      light.castShadow = false;
    }

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

  useEffect(() => {
    console.debug('⚙ updating light component (stamp)', stamp);

    // lightRef.current.visible = shadowEnabled;
    // lightRef.current.shadow.needsUpdate = shadowEnabled;
    lightRef.current.intensity = intensity;

    // pointLight.current.lookAt(0, 50, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  return <spotLight intensity={intensity} ref={lightRef} castShadow />;
};

export default LightComponent;
