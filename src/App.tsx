import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { useRef, useState } from 'react';
import BoardComponent from './components/BoardComponent';
import SceneComponent from './components/SceneComponent';
import { IBoardProps } from './types/IBoardProps';
import { IConfirmProps } from './types/IConfirmProps';
import { TCameraKey } from './types/IOrbitProps';
import { ISceneProps } from './types/ISceneProps';
import { ISunProps } from './types/ISunProps';
import { ObjectUtil } from './util/ObjectUtil';
import { ThemeUtil } from './util/ThemeUtil';
import { TimeUtil } from './util/TimeUtil';

const theme = ThemeUtil.createTheme();

/**
 * tasmota command to turn on:  http://192.168.0.24/cm?cmnd=Power%201
 * tasmota command to turn off: http://192.168.0.24/cm?cmnd=Power%200
 * tasmota command to get status: http://192.168.0.24/cm?cmnd=status%2010 (different responses for plugs and esp32)
 *
 * TODO :: time range in chart
 * TODO :: time animation on the 3D-view (maybe with color transitions)
 * TODO :: better strategy for missing values in series
 * TODO :: query the fields of the sensor to know what icons to offer (maybe the sensors can indicate what values are available, gray out sensors not providing a specific value)
 * @returns
 */
function App() {

  const handleClipPlane = (clipPlane: number) => {

    console.debug('📞 handleClipPlane', clipPlane);

    clipPlaneRef.current = clipPlane;

    // MaterialRepo.setClipPlane(clipPlane);
    boardPropsRef.current = {
      ...boardPropsRef.current,
      clipPlane
    };
    setBoardProps(boardPropsRef.current);

    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...sceneProps.model,
        clipPlane: clipPlaneRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

  }

  const handleCameraKey = (cameraKey: TCameraKey) => {

    console.debug('📞 handleCameraKey', cameraKey);

    cameraKeyRef.current = cameraKey;

    scenePropsRef.current = {
      ...scenePropsRef.current,
      orbit: {
        ...sceneProps.orbit,
        cameraKey: cameraKeyRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

    boardPropsRef.current = {
      ...boardPropsRef.current,
      cameraKey: cameraKeyRef.current
    };
    setBoardProps(boardPropsRef.current);

  }

  const handleConfirmProps = (confirmProps: IConfirmProps | undefined) => {

    console.debug('📞 handleConfirmProps', confirmProps);
    boardPropsRef.current = {
      ...boardPropsRef.current,
      confirmProps
    };
    setBoardProps(boardPropsRef.current);

  }

  const handleSunInstant = (sunInstant: number) => {

    console.debug('📞 handleSunInstant', sunInstant);

    sunPropsRef.current = {
      ...sunPropsRef.current,
      sunInstant
    }

    // MaterialRepo.setClipPlane(clipPlane);
    boardPropsRef.current = {
      ...boardPropsRef.current,
      sun: sunPropsRef.current
    };
    setBoardProps(boardPropsRef.current);

    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...sceneProps.model,
        sun: sunPropsRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

  }

  const clipPlaneRef = useRef<number>(8.6);
  const cameraKeyRef = useRef<TCameraKey>('home');
  const sunPropsRef = useRef<ISunProps>(TimeUtil.getSunProps());
  const scenePropsRef = useRef<ISceneProps>({
    orbit: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      cameraKey: cameraKeyRef.current,
      handleConfirmProps,
      handleCameraKey
    },
    model: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      clipPlane: clipPlaneRef.current,
      scene: './h24og2_poly_test.dae',
      sun: sunPropsRef.current,
    },
  });
  const boardPropsRef = useRef<IBoardProps>({
    clipPlane: clipPlaneRef.current,
    sun: sunPropsRef.current,
    cameraKey: cameraKeyRef.current,
    handleClipPlane,
    handleSunInstant,
    handleCameraKey
  });

  const [sceneProps, setSceneProps] = useState<ISceneProps>(scenePropsRef.current);
  const [boardProps, setBoardProps] = useState<IBoardProps>(boardPropsRef.current);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', height: '100%' }}>
        <SceneComponent {...sceneProps} />
        <BoardComponent {...boardProps} />
      </div>
    </ThemeProvider>
  );
}

export default App;
