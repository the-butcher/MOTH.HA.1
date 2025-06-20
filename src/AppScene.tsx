import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BoardComponent from './components/BoardComponent';
import SceneComponent from './components/SceneComponent';
import { IBoardProps } from './types/IBoardProps';
import { TPresetKey } from './types/IOrbitProps';
import { ISceneProps } from './types/ISceneProps';
import { TStatusHandlerKey } from './types/IStatusHandler';
import { ISunProps } from './types/ISunProps';
import { MqttUtil } from './util/MqttUtil';
import { ObjectUtil } from './util/ObjectUtil';
import { ThemeUtil } from './util/ThemeUtil';
import { TimeUtil } from './util/TimeUtil';
import { WeatherUtil } from './util/WeatherUtil';

const theme = ThemeUtil.createTheme();

function AppScene() {

  const handlePresetKey = (presetKey: TPresetKey | undefined) => {

    console.debug('📞 handlePresetKey', presetKey);

    presetKeyRef.current = presetKey;

    scenePropsRef.current = {
      ...scenePropsRef.current,
      orbit: {
        ...scenePropsRef.current.orbit,
        presetKey: presetKeyRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

    boardPropsRef.current = {
      ...boardPropsRef.current,
      presetKey: presetKeyRef.current
    };
    setBoardProps(boardPropsRef.current);

  }

  const handleSelectKey = (selectKey: TStatusHandlerKey | undefined) => {

    console.debug('📞 handleSelectKey', selectKey);

    selectKeyRef.current = selectKey;

    scenePropsRef.current = {
      ...scenePropsRef.current,
      orbit: {
        ...scenePropsRef.current.orbit,
        selectKey: selectKeyRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

    boardPropsRef.current = {
      ...boardPropsRef.current,
      selectKey: selectKeyRef.current
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

  const handleModelComplete = () => {

    console.debug('📞 handleModelComplete');

    selectKeyRef.current = undefined;

    MqttUtil.setup();

    scenePropsRef.current = {
      ...scenePropsRef.current,
      model: {
        ...scenePropsRef.current.model,
        modelComplete: true
      },
      orbit: {
        ...scenePropsRef.current.orbit,
        selectKey: selectKeyRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

  };

  // const clipPlaneRef = useRef<number>(8.6);
  const selectKeyRef = useRef<TStatusHandlerKey | undefined>('weather___');
  const presetKeyRef = useRef<TPresetKey | undefined>('home3');
  const sunPropsRef = useRef<ISunProps>(TimeUtil.getSunProps());
  const scenePropsRef = useRef<ISceneProps>({
    orbit: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      selectKey: selectKeyRef.current,
      presetKey: presetKeyRef.current,
      handleSelectKey,
      handlePresetKey
    },
    model: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      scene: './h24og2_poly_test.dae',
      sun: sunPropsRef.current,
      modelComplete: false,
      handleModelComplete
    }
  });
  const boardPropsRef = useRef<IBoardProps>({
    sun: sunPropsRef.current,
    selectKey: selectKeyRef.current,
    presetKey: presetKeyRef.current,
    handleSunInstant,
    handlePresetKey,
    handleSelectKey
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
