import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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
import { WeatherUtil } from './util/WeatherUtil';
import { MqttUtil } from './util/MqttUtil';

const theme = ThemeUtil.createTheme();

function AppScene() {

  const handleClipPlane = (clipPlane: number) => {

    console.debug('📞 handleClipPlane', clipPlane);

    clipPlaneRef.current = clipPlane;

    // MaterialRepo.setClipPlane(clipPlane);
    boardPropsRef.current = {
      ...boardPropsRef.current,
      clipPlane: clipPlaneRef.current
    };
    setBoardProps(boardPropsRef.current);

    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...scenePropsRef.current.model,
        clipPlane: clipPlaneRef.current
      },
      orbit: {
        ...scenePropsRef.current.orbit,
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
    };

    // update slider
    boardPropsRef.current = {
      ...boardPropsRef.current,
      sun: sunPropsRef.current
    };
    setBoardProps(boardPropsRef.current);

    // update sun in scene
    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...scenePropsRef.current.model,
        sun: sunPropsRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

  }

  const handleWorldFocusDistance = (worldFocusDistance: number) => {

    console.debug('📞 worldFocusDistance', worldFocusDistance);

    boardPropsRef.current = {
      ...boardPropsRef.current,
      sun: sunPropsRef.current
    };
    setBoardProps(boardPropsRef.current);

    scenePropsRef.current = {
      ...scenePropsRef.current,
      worldFocusDistance
    };
    setSceneProps(scenePropsRef.current);

  }

  const handleModelComplete = () => {

    console.debug('📞 handleModelComplete');

    // window.setTimeout(() => {
    MqttUtil.setup();
    // }, 1000);


    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...scenePropsRef.current.model,
        modelComplete: true
      }
    };
    setSceneProps(scenePropsRef.current);

  };

  const clipPlaneRef = useRef<number>(8.6);
  const cameraKeyRef = useRef<TCameraKey>('home');
  const sunPropsRef = useRef<ISunProps>(TimeUtil.getSunProps());
  const scenePropsRef = useRef<ISceneProps>({
    orbit: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      cameraKey: cameraKeyRef.current,
      clipPlane: clipPlaneRef.current,
      handleConfirmProps,
      handleCameraKey,
      handleWorldFocusDistance
    },
    model: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      clipPlane: clipPlaneRef.current,
      scene: './h24og2_poly_test.dae',
      sun: sunPropsRef.current,
      modelComplete: false,
      handleModelComplete
    },
    worldFocusDistance: 0
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


  useEffect(() => {

    console.debug('✨ building appscene component');

    WeatherUtil.loadForecast();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export default AppScene;
