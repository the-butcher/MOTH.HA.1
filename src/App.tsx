import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { useRef, useState } from 'react';
import BoardComponent from './components/BoardComponent';
import SceneComponent from './components/SceneComponent';
import { IBoardProps } from './types/IBoardProps';
import { IChartProps } from './types/IChartProps';
import { IInfluxDbResponses } from './types/IInfluxDbResponses';
import { ILabelProps } from './types/ILabelProps';
import { TRecordKey } from './types/IRecord';
import { ISceneProps } from './types/ISceneProps';
import { ISensor, ISensorPosition } from './types/ISensor';
import { SERIES_DEFS } from './types/ISeriesDef';
import { JsonLoader } from './util/JsonLoader';
import { ObjectUtil } from './util/ObjectUtil';
import { ThemeUtil } from './util/ThemeUtil';

const theme = ThemeUtil.createTheme();

/**
 * TODO :: time range in chart
 * TODO :: time animation on the 3D-view (maybe with color transitions)
 * TODO :: better strategy for missing values in series
 * TODO :: query the fields of the sensor to know what icons to offer (maybe the sensors can indicate what values are available, gray out sensors not providing a specific value)
 * @returns
 */
function App() {

  const recordKeyRef = useRef<TRecordKey>('co2_lpf');
  const clipPlaneRef = useRef<number>(0.2);

  const loadLastSensorValues = () => {

    // https://docs.influxdata.com/influxdb/v1/tools/api/#request-body

    const seriesDef = SERIES_DEFS[recordKeyRef.current];

    const labels = [
      ...boardPropsRef.current.labels
    ];
    const rooms = {
      ...scenePropsRef.current.model.selection.rooms,
    }

    const url = `http://192.168.0.38:8086/query`;
    const qry = encodeURIComponent(boardPropsRef.current.labels.map((label) => `SELECT last(${recordKeyRef.current}) as ${recordKeyRef.current} FROM "homeassistant"."autogen"."${label.sensorId}"`).join(';'));

    new JsonLoader(url, 'POST')
      .withBasicAuthorization(`${import.meta.env.VITE_INFLUXDB_USER}`, `${import.meta.env.VITE_INFLUXDB_PASS}`)
      .withParameter('epoch', 'ms')
      .withParameter('q', qry)
      .load<IInfluxDbResponses>()
      .then((responses) => {

        responses.results.forEach((result) => {

          const sensorId = result.series[0].name;
          const value = result.series[0].values[0][1];
          const label = labels.find(l => l.sensorId === sensorId);
          if (label) {
            label.value = value as number;
            rooms[label.roomId] = seriesDef.levelFormatter(value as number);
          }

        });

        boardPropsRef.current = {
          ...boardPropsRef.current,
          labels,
        };
        setBoardProps(boardPropsRef.current);

        scenePropsRef.current = {
          ...sceneProps,
          model: {
            ...scenePropsRef.current.model,
            selection: {
              rooms
            }
          },
        };
        setSceneProps(scenePropsRef.current);

      });

  };

  const handleClipPlane = (clipPlane: number) => {

    console.debug('📞 handleClipPlane', clipPlane);

    clipPlaneRef.current = clipPlane;

    // MaterialRepo.setClipPlane(clipPlane);
    boardPropsRef.current = {
      ...boardPropsRef.current,
      clipPlane,
    };
    setBoardProps(boardPropsRef.current);

    scenePropsRef.current = {
      ...sceneProps,
      model: {
        ...sceneProps.model,
        clipPlane: clipPlaneRef.current
      }
    };
    setSceneProps(scenePropsRef.current);

  }

  const handleSensorSelect = (sensorId: string, selected: boolean) => {

    console.debug('📞 handleSensorSelect', sensorId, selected);

    const sensorIds = [...chartPropsRef.current.sensorIds];
    const indexOfSensorId = sensorIds.indexOf(sensorId);
    if (selected && indexOfSensorId === -1) {
      sensorIds.push(sensorId);
    } else if (!selected == indexOfSensorId >= 0) {
      sensorIds.splice(indexOfSensorId, 1);
    }

    chartPropsRef.current = {
      ...chartPropsRef.current,
      sensorIds
    };
    setChartProps(chartPropsRef.current);

  };

  const handleSensors = (sensors: ISensor[]) => {

    console.debug('📞 handleSensors', sensors);

    const labels: ILabelProps[] = sensors.map(sensor => {
      return {
        sensorId: sensor.sensorId,
        roomId: sensor.roomId,
        recordKey: recordKeyRef.current,
        value: 0,
        x: 0,
        y: 0,
        handleSensorSelect,
      }
    });

    boardPropsRef.current = {
      ...boardPropsRef.current,
      labels
    };
    loadLastSensorValues();

  };

  const handleSensorPositions = (sensorPositions: ISensorPosition[]) => {

    console.debug('📞 handleSensorPositions', sensorPositions);

    const labels = [
      ...boardPropsRef.current.labels
    ];
    sensorPositions.forEach((sensorPosition) => {
      const label = labels.find((l) => l.sensorId === sensorPosition.sensorId);
      if (label) {
        label.x = sensorPosition.position2D.x;
        label.y = sensorPosition.position2D.y;
      }
    });
    boardPropsRef.current = {
      ...boardPropsRef.current,
      labels,
    };
    setBoardProps(boardPropsRef.current);

  };

  /**
   * update key and labels
   * @param recordKey
   */
  const handleRecordKey = (recordKey: TRecordKey) => {

    console.debug('📞 handleRecordKey', recordKey);

    recordKeyRef.current = recordKey;

    const labels = boardPropsRef.current.labels.map(label => {
      return {
        ...label,
        recordKey: recordKeyRef.current
      };
    });
    boardPropsRef.current = {
      ...boardPropsRef.current,
      labels,
      recordKey: recordKeyRef.current
    };
    loadLastSensorValues();

    chartPropsRef.current = {
      ...chartPropsRef.current,
      recordKey: recordKeyRef.current,
    };
    setChartProps(chartPropsRef.current);

  };

  const chartPropsRef = useRef<IChartProps>({
    sensorIds: [],
    recordKey: 'co2_lpf',
    exportTo: '',
    handleExportComplete: () => { }
  });
  const [chartProps, setChartProps] = useState<IChartProps>(chartPropsRef.current);

  const scenePropsRef = useRef<ISceneProps>({
    orbit: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId()
    },
    model: {
      id: ObjectUtil.createId(),
      stamp: ObjectUtil.createId(),
      clipPlane: clipPlaneRef.current,
      scene: './h24og2.dae',
      selection: {
        rooms: {},
      },
      lights: [
        {
          id: ObjectUtil.createId(),
          stamp: ObjectUtil.createId(),
          position: {
            x: 50,
            y: 20,
            z: 50,
          },
          intensity: 0.50,
          shadowEnabled: true,
        },
        {
          id: ObjectUtil.createId(),
          stamp: ObjectUtil.createId(),
          position: {
            x: 50,
            y: 20,
            z: 50,
          },
          intensity: 0.50,
          shadowEnabled: false,
        },
      ],
      handleSensors,
      handleSensorPositions,
    },
  });
  const [sceneProps, setSceneProps] = useState<ISceneProps>(scenePropsRef.current);

  const boardPropsRef = useRef<IBoardProps>({
    labels: [],
    recordKey: recordKeyRef.current,
    clipPlane: clipPlaneRef.current,
    handleRecordKey,
    handleClipPlane
  });
  const [boardProps, setBoardProps] = useState<IBoardProps>(boardPropsRef.current);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', height: '100%' }}>
        <SceneComponent {...sceneProps} />
        <BoardComponent {...boardProps} {...chartProps} />
      </div>
    </ThemeProvider>
  );
}

export default App;
