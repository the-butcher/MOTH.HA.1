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
  const clipPlaneRef = useRef<number>(8.6);
  const sensorsRef = useRef<ISensor[]>([]);

  const loadSensorKeys = (_sensors: ISensor[]) => {

    const url = `http://192.168.0.38:8086/query`;
    const qry = encodeURIComponent(_sensors.map((sensor) => `SHOW FIELD KEYS ON "homeassistant" FROM "${sensor.sensorId}"`).join(';'));

    // console.log('qry', qry);
    // console.log('sensors', sensors);

    new JsonLoader(url, 'POST')
      .withBasicAuthorization(`${import.meta.env.VITE_INFLUXDB_USER}`, `${import.meta.env.VITE_INFLUXDB_PASS}`)
      .withParameter('epoch', 'ms')
      .withParameter('q', qry)
      .load<IInfluxDbResponses>()
      .then((responses) => {

        responses.results.forEach((result) => {

          const series = result.series[0];
          if (series) {
            const sensorId = result.series[0].name;
            const sensor = _sensors.find(s => s.sensorId === sensorId);
            if (sensor) {
              result.series[0].values.forEach((value) => {
                sensor?.recordKeys.push(value[0] as TRecordKey);
              });
              sensorsRef.current.push(sensor);
            } else {
              console.warn('failed to reidentify sensor', sensorId);
            }
          }



        });

        // build a base set of labels
        const labels: ILabelProps[] = sensorsRef.current.map(sensor => {
          return {
            height: 0,
            sensorId: sensor.sensorId,
            roomId: sensor.roomId,
            recordKeys: sensor.recordKeys,
            recordKeyObj: sensor.recordKeys[0], // TODO :: proper default
            recordKeyApp: recordKeyRef.current,
            selected: false,
            recent: [0],
            x: 0,
            y: 0,
            handleSensorSelect,
          }
        });
        boardPropsRef.current = {
          ...boardPropsRef.current,
          labels
        };
        rebuildLabels();

      });

  }

  const loadLastSensorValues = () => {

    // https://docs.influxdata.com/influxdb/v1/tools/api/#request-body

    const labels = [
      ...boardPropsRef.current.labels
    ];
    const rooms = {
      ...scenePropsRef.current.model.selection.rooms,
    }

    const url = `${import.meta.env.VITE_INFLUXDB__URL}`;
    const qry = encodeURIComponent(boardPropsRef.current.labels.map((label) => `SELECT ${label.recordKeyObj} FROM "homeassistant"."autogen"."${label.sensorId}" WHERE time > now() - 1h`).join(';'));

    new JsonLoader(url, 'POST')
      .withBasicAuthorization(`${import.meta.env.VITE_INFLUXDB_USER}`, `${import.meta.env.VITE_INFLUXDB_PASS}`)
      .withParameter('epoch', 'ms')
      .withParameter('q', qry)
      .load<IInfluxDbResponses>()
      .then((responses) => {

        responses.results.forEach((result) => {

          const series = result.series[0];

          // console.log('series.values', series.values)
          if (series) {
            const sensorId = series.name;
            // const value = series.values[0][1]; // whatever value was queried
            const label = boardPropsRef.current.labels.find(l => l.sensorId === sensorId);
            if (label) {
              label.recent = series.values.map(v => v[1] as number); // value as number;
              rooms[label.roomId] = SERIES_DEFS[label.recordKeyObj].levelFormatter(label.recent[label.recent.length - 1]);
            }
          }

        });

        // console.log('labels', labels);

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

  const handleSensorSelect = (sensorId: string) => {

    console.debug('📞 handleSensorSelect', sensorId);

    const labels = [
      ...boardPropsRef.current.labels
    ];
    const label = labels.find((l) => l.sensorId === sensorId);
    if (label) {
      label.selected = !label.selected;
    }

    chartPropsRef.current = {
      ...chartPropsRef.current,
      labels
    };
    setChartProps(chartPropsRef.current);

  };

  /**
   * called when the sensors are first loaded with the model
   * TODO :: load a sample value (or maybe there is even a field only query)
   * @param sensors
   */
  const handleSensors = (sensors: ISensor[]) => {

    console.debug('📞 handleSensors', sensors);

    // load keys for each sensor to know is selectable where
    loadSensorKeys(sensors);

  };


  const handleSensorPositions = (sensorPositions: ISensorPosition[]) => {

    console.debug('📞 handleSensorPositions', sensorPositions);

    const labels = [
      ...boardPropsRef.current.labels
    ];
    sensorPositions.forEach((sensorPosition) => {
      const label = boardPropsRef.current.labels.find((l) => l.sensorId === sensorPosition.sensorId);
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

  const rebuildLabels = () => {

    const labels = boardPropsRef.current.labels.map(label => {
      const recordKeyObj = label.recordKeys.indexOf(recordKeyRef.current) >= 0 ? recordKeyRef.current : label.recordKeyObj;
      return {
        ...label,
        recordKeyObj,
        recordKeyApp: recordKeyRef.current
      };
    });
    boardPropsRef.current = {
      ...boardPropsRef.current,
      labels,
      recordKeyApp: recordKeyRef.current
    };
    loadLastSensorValues();

    chartPropsRef.current = {
      ...chartPropsRef.current,
      labels,
      recordKeyApp: recordKeyRef.current,
    };
    setChartProps(chartPropsRef.current);

  }

  /**
   * update key and labels
   * @param recordKey
   */
  const handleRecordKey = (recordKey: TRecordKey) => {

    console.debug('📞 handleRecordKey', recordKey);

    recordKeyRef.current = recordKey;
    rebuildLabels();

  };

  const chartPropsRef = useRef<IChartProps>({
    height: 0,
    labels: [],
    recordKeyApp: 'co2_lpf',
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
      scene: './h24og2_poly_test.dae',
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
    recordKeyApp: recordKeyRef.current,
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
