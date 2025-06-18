import { Canvas } from '@react-three/fiber';
import { createRef, useEffect, useState } from 'react';
import { PCFSoftShadowMap } from 'three';
import { ISceneProps } from '../types/ISceneProps';
import ModelComponent from './ModelComponent';
import ControlsComponent from './ControlsComponent';
import SunCompoment from './SunCompoment';

import { Environment } from '@react-three/drei';
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { WeatherUtil } from '../util/WeatherUtil';


export const ID_CANVAS = 'dashcanvas';

const SceneComponent = (props: ISceneProps) => {

  const { orbit, model, worldFocusDistance } = { ...props };
  const canvasRef = createRef<HTMLCanvasElement>();
  const [ambientIntensity, setAmbientIntensity] = useState<number>(0);

  useEffect(() => {

    console.debug('✨ building scene component', props, canvasRef.current);

    if (canvasRef.current) {
      canvasRef.current.id = ID_CANVAS;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating scene component (model.sun)', model.sun);

    const forecast = WeatherUtil.getForecast(model.sun.sunInstant);
    setAmbientIntensity(1.1 - 0.1 * forecast.sunshine);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.sun]);



  return (
    <Canvas
      ref={canvasRef}
      style={{ position: 'absolute', height: '100%', width: '100%' }}
      gl={{ antialias: true, localClippingEnabled: true, preserveDrawingBuffer: true }}
      frameloop="demand"
      shadows={{ type: PCFSoftShadowMap, enabled: true, autoUpdate: false }}
      camera={{ position: [0, 0, 0], fov: 30, near: 1, far: 1000 }}
    >
      <EffectComposer renderPriority={3}>
        <DepthOfField
          bokehScale={4}
          worldFocusRange={worldFocusDistance / 3}
          worldFocusDistance={worldFocusDistance}
        />
      </EffectComposer>
      <Environment preset="park" backgroundRotation={[0, 0, 0]} background={false} environmentIntensity={0.1} backgroundBlurriness={0.50} resolution={64} />
      <ControlsComponent key={orbit.id} {...orbit} />
      <ambientLight intensity={ambientIntensity} />
      <ModelComponent key={model.id} {...model} />
      {
        model.modelComplete ? <SunCompoment {...model.sun} /> : null
      }

      {/* <axesHelper /> */}
      {/* <gridHelper /> */}
      {/* <Stats /> */}

    </Canvas>
  );
};

export default SceneComponent;
