import { Canvas } from '@react-three/fiber';
import { createRef, useEffect } from 'react';
import { PCFSoftShadowMap } from 'three';
import { ISceneProps } from '../types/ISceneProps';
import ModelComponent from './ModelComponent';
import OrbitComponent from './OrbitComponent';
import SunCompoment from './SunCompoment';


export const ID_CANVAS = 'dashcanvas';

const SceneComponent = (props: ISceneProps) => {

  const { orbit, model } = { ...props };
  const canvasRef = createRef<HTMLCanvasElement>();

  // const [ambientIntensity, setAmbientIntensity] = useState<number>(0);
  // const [sunArray, setSunArray] = useState<JSX.Element[]>([]);

  useEffect(() => {

    console.debug('✨ building scene component', props, canvasRef.current);

    if (canvasRef.current) {
      canvasRef.current.id = ID_CANVAS;
    }

    // console.log('model.sun', model.sun);
    // const _sunArray: JSX.Element[] = [];
    // for (let sunInstant = model.sun.sunriseInstant; sunInstant <= model.sun.sunsetInstant; sunInstant += (model.sun.sunsetInstant - model.sun.sunriseInstant) / 10) {
    //   console.log('instant', sunInstant);
    //   const sunProps: ISunProps = {
    //     sunInstant,
    //     sunriseInstant: model.sun.sunriseInstant,
    //     sunsetInstant: model.sun.sunsetInstant
    //   };
    //   _sunArray.push(<SunCompoment {...sunProps} />);
    // }
    // setSunArray(_sunArray);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    // console.log('⚙ updating scene component (model.sun)', model.sun);

    // const position = SunCalc.getPosition(new Date(model.sun.sunInstant), TimeUtil.LATITUDE, TimeUtil.LONGITUDE); // coordinates for vienna

    // const altitude = position.altitude;
    // // console.log('altitude', altitude);
    // setAmbientIntensity(Math.min(0.75, altitude * 10));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.sun]);

  return (
    <Canvas ref={canvasRef} style={{ position: 'absolute', height: '100%', width: '100%' }} gl={{ antialias: true, localClippingEnabled: true }} frameloop="demand" shadows={{ type: PCFSoftShadowMap, enabled: true, autoUpdate: true }} camera={{ position: [0, 0, 0], fov: 30, far: 10000 }}>

      <OrbitComponent key={orbit.id} {...orbit} />
      <ambientLight intensity={0.80} />
      <ModelComponent key={model.id} {...model} />
      <SunCompoment {...model.sun} />
      {/* <SunCompoment {...model.sun} sunInstant={model.sun.sunInstant - TimeUtil.MILLISECONDS_PER_MINUTE * 2} /> */}
      {/* <SunCompoment {...model.sun} sunInstant={model.sun.sunInstant + TimeUtil.MILLISECONDS_PER_MINUTE * 2} /> */}
      {/* {
        sunArray
      } */}

      {/* <axesHelper /> */}
      {/* <gridHelper /> */}
      {/* <Stats /> */}

    </Canvas>
  );
};

export default SceneComponent;
