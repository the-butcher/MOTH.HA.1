import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { PCFSoftShadowMap } from 'three';
import { ISceneProps } from '../types/ISceneProps';
import ModelComponent from './ModelComponent';
import OrbitComponent from './OrbitComponent';

const SceneComponent = (props: ISceneProps) => {

  const { orbit, model } = { ...props };

  useEffect(() => {

    console.debug('✨ building scene component', props);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Canvas style={{ position: 'absolute', height: '100%', width: '100%' }} gl={{ antialias: true, localClippingEnabled: true }} frameloop="demand" shadows={{ type: PCFSoftShadowMap, enabled: true, autoUpdate: true }} camera={{ position: [0, 0, 0], fov: 30, far: 10000 }}>
      <OrbitComponent key={orbit.id} {...orbit} />
      <ambientLight intensity={0.5} />
      <ModelComponent key={model.id} {...model} />

      {/* <axesHelper /> */}
      {/* <gridHelper /> */}
      {/* <Stats /> */}

    </Canvas>
  );
};

export default SceneComponent;
