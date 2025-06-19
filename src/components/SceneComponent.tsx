import { Canvas } from '@react-three/fiber';
import { createRef, useEffect } from 'react';
import { PCFSoftShadowMap } from 'three';
import { ISceneProps } from '../types/ISceneProps';
import ControlsComponent from './ControlsComponent';
import ModelComponent from './ModelComponent';
import SunCompoment from './SunCompoment';

import { Stats } from '@react-three/drei';


export const ID_CANVAS = 'dashcanvas';

const SceneComponent = (props: ISceneProps) => {

  const { orbit, model } = { ...props };
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {

    console.debug('✨ building scene component', props, canvasRef.current);

    if (canvasRef.current) {
      canvasRef.current.id = ID_CANVAS;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      style={{ position: 'absolute', height: '100%', width: '100%' }}
      gl={{ antialias: true, localClippingEnabled: true, preserveDrawingBuffer: true }}
      frameloop="demand" // demand
      shadows={{ type: PCFSoftShadowMap, enabled: true, autoUpdate: false }}
      camera={{ position: [0, 0, 0], fov: 30, near: 1, far: 1000 }}
    >


      <ControlsComponent key={orbit.id} {...orbit} />
      <ModelComponent key={model.id} {...model} />
      {
        model.modelComplete ? <SunCompoment {...model.sun} /> : null
      }

      {/* <axesHelper /> */}
      {/* <gridHelper /> */}
      <Stats />

    </Canvas>
  );
};

export default SceneComponent;
