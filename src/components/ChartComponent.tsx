import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useEffect, useRef, useState } from 'react';
import { IChartProps } from '../types/IChartProps';
import { IInfluxDbResponses } from '../types/IInfluxDbResponses';
import { IRecord } from '../types/IRecord';
import { SERIES_DEFS } from '../types/ISeriesDef';
import { TICK_DEFINITIONS } from '../types/ITickDefinition';
import { JsonLoader } from '../util/JsonLoader';
import { TimeUtil } from '../util/TimeUtil';

export interface ISeries {
  dataKey: string;
  label: string;
  showMark: boolean;
  type: 'line';
  curve: 'linear' | 'stepAfter' | 'stepBefore';
  connectNulls: true;
  valueFormatter: (value: number | null) => string;
}

/**
 * component, renders a chart, using the mui/x-charts component
 * @param props
 * @returns
 */
const ChartComponent = (props: IChartProps) => {

  const { sensorIds, recordKey, exportTo, handleExportComplete } = props;

  const [timeRange, setTimeRange] = useState<string>('3h');
  const [tickDefIndex, setTickDefIndex] = useState<number>(0);
  const [tickInterval, setTickInterval] = useState<number[]>();

  const [records, setRecords] = useState<IRecord[]>([]);
  const [stepRecords, setStepRecords] = useState<IRecord[]>([]);

  const [series, setSeries] = useState<ISeries[]>([]);
  const [minmax, setMinMax] = useState<[number, number]>([0, 0]);
  const chartRef = useRef<SVGElement>();

  const loadSensorValues = () => {

    // https://docs.influxdata.com/influxdb/v1/tools/api/#request-body

    // const minInstant = Date.now() - TimeUtil.MILLISECONDS_PER_HOUR * 3 + TimeUtil.getTimezoneOffsetSeconds() * 1000;
    // const minDate = new Date(minInstant);
    // console.log('minTime', TimeUtil.toCsvDate(minDate), TimeUtil.getTimezoneOffsetSeconds());

    const url = `http://192.168.0.38:8086/query`;
    const qry = encodeURIComponent(sensorIds.map((sensorId) => `SELECT ${recordKey} FROM "homeassistant"."autogen"."${sensorId}" WHERE time > now() - ${timeRange}`).join(';'));

    new JsonLoader(url, 'POST')
      .withBasicAuthorization('influxdb', 'influxdb')
      .withParameter('epoch', 'ms')
      .withParameter('q', qry)
      .load<IInfluxDbResponses>()
      .then((responses) => {
        const _records1: IRecord[] = [];
        const _series: ISeries[] = [];

        responses.results.forEach((result) => {

          const combinedKey = toCombinedKey(result.series[0].name);

          _series.push({
            dataKey: combinedKey,
            label: `${SERIES_DEFS[recordKey].hint} (${result.series[0].name})`,
            showMark: false,
            type: 'line',
            curve: 'linear',
            connectNulls: true,
            valueFormatter: SERIES_DEFS[recordKey].valueFormatter,
          });

          result.series[0].values.forEach((value) => {
            const record: IRecord = {};
            record['instant'] = getTickInstant(value[0] as number, TimeUtil.MILLISECONDS_PER_MINUTE);
            record[combinedKey] = value[1] as number;
            _records1.push(record);
          });
        });
        _records1.sort((a, b) => a['instant'] - b['instant']);

        const _records2: IRecord[] = [];
        for (let recordIndex = 0; recordIndex < _records1.length; recordIndex++) {
          if (_records2.length === 0 || _records1[recordIndex].instant !== _records2[_records2.length - 1].instant) {
            _records2.push({
              ..._records2[_records2.length - 1], // all previous value (if the new record does not redefine a value, there will be the previous value)
              ..._records1[recordIndex] // all values of the new record
            });
          } else { // same instant, merge records
            _records2[_records2.length - 1] = {
              ..._records2[_records2.length - 1],
              ..._records1[recordIndex]
            }
          }
        }

        // console.log('_records2', _records2);

        setSeries(_series);
        setRecords(_records2);
      });
  };

  const toCombinedKey = (seriesId: string) => {
    return `${seriesId.replace('/', '_')}_${recordKey}`
  }

  /**
   * https://gist.github.com/SunPj/14fe4f10db43be2d84751f5595d48246
   * @param stylesheet
   * @returns
   */
  const stringifyStylesheet = (stylesheet: CSSStyleSheet): string => {
    return stylesheet.cssRules
      ? Array.from(stylesheet.cssRules)
        .map((rule) => rule.cssText || '')
        .join('\n')
      : '';
  };
  /**
   * iterates all stylesheets in the document and collects and concatenates all rules from those stylesheets
   * @returns
   */
  const collectStyles = (): string => {
    return Array.from(document.styleSheets)
      .map((s) => stringifyStylesheet(s))
      .join('\n');
  };
  /**
   * collects all styles in the document and creates a <def/> node from it
   * needed for exporting when all current styles need to be attached to the <svg/> clone
   * @returns
   */
  const collectDefs = (): string => {
    const styles = collectStyles();
    return `<defs><style type="text/css"><![CDATA[${styles}]]></style></defs>`;
  };

  /**
   * exports this chart to a png image
   */
  const exportToPng = () => {
    const chartSvg = chartRef.current;
    const { width, height } = chartSvg!.getBoundingClientRect();

    const chartSvgClone: SVGElement = chartSvg!.cloneNode(true) as SVGElement;

    const defs = collectDefs();
    chartSvgClone.insertAdjacentHTML('afterbegin', defs);

    const svgContent = new XMLSerializer().serializeToString(chartSvgClone);
    const svgBlob = new Blob([svgContent], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgDataUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const pngPadding = 10;

      const canvas = document.createElement('canvas');
      canvas.width = width + pngPadding * 2;
      canvas.height = height + pngPadding * 2;

      const context = canvas.getContext('2d');
      context!.fillStyle = 'white';
      context!.fillRect(0, 0, canvas.width, canvas.height);
      context!.drawImage(image, pngPadding, pngPadding, width, height);

      context!.font = '14px smb';
      context!.fillStyle = 'black';

      const textY = height + pngPadding - 3;
      context!.fillText(TimeUtil.toCsvDate(new Date(records[0].instant)), 70, textY);
      context!.fillText(TimeUtil.toCsvDate(new Date(records[records.length - 1].instant)), width + pngPadding - 166, textY);

      const pngDataUrl = canvas.toDataURL();
      const pngDownloadLink = document.createElement('a');
      pngDownloadLink.setAttribute('href', pngDataUrl);
      pngDownloadLink.setAttribute('download', TimeUtil.getExportName('png', records[0].instant, records[records.length - 1].instant)); // TODO format with dates
      pngDownloadLink.click();

      handleExportComplete();
    };
    image.onerror = (e) => {
      console.error('failed to complete export', e);
      handleExportComplete();
    };
    image.src = svgDataUrl;
  };

  /**
   * recalculates the tick interval of the chart, given the current width and date-range
   */
  const rebuildTickInterval = () => {

    if (chartRef.current && records.length > 0) {
      const chartWidth = chartRef.current.getBoundingClientRect().width - 85; // 85 measured from
      if (chartWidth > 0) {
        let minInstant = records[0].instant; // - TimeUtil.getTimezoneOffsetSeconds();
        let maxInstant = records[records.length - 1].instant; // - TimeUtil.getTimezoneOffsetSeconds();

        const difInstant = maxInstant - minInstant;
        const maxTickCount = chartWidth / 20;

        let _tickDefIndex = 0;
        for (; _tickDefIndex < TICK_DEFINITIONS.length; _tickDefIndex++) {
          const curTickCount = difInstant / TICK_DEFINITIONS[_tickDefIndex].tick;
          if (curTickCount < maxTickCount) {
            break;
          }
        }

        minInstant = getTickInstant(records[0].instant, TICK_DEFINITIONS[_tickDefIndex].tick);
        maxInstant = getTickInstant(records[records.length - 1].instant, TICK_DEFINITIONS[_tickDefIndex].tick);

        const _tickInterval: number[] = [];
        for (let instant = minInstant; instant < maxInstant; instant += TICK_DEFINITIONS[_tickDefIndex].tick) {
          _tickInterval.push(instant);
        }
        setTickDefIndex(_tickDefIndex);
        setTickInterval(_tickInterval);
      }
    }

  };

  /**
   * calculates a tick instant snapped to the time-step specified
   * @param instant
   * @param step
   * @returns
   */
  const getTickInstant = (instant: number, step: number) => {
    const offsetInstant = instant - TimeUtil.getTimezoneOffsetSeconds() * 1000;
    const moduloInstant = offsetInstant - (offsetInstant % step) + step;
    return moduloInstant + TimeUtil.getTimezoneOffsetSeconds() * 1000;
  };

  /**
   * rebuilds a reduced list of records, depending on the current tick definition
   */
  const rebuildStepRecords = () => {

    if (records?.length > 0) {
      const step = TICK_DEFINITIONS[tickDefIndex].tick / TICK_DEFINITIONS[tickDefIndex].step;

      const minInstant = getTickInstant(records[0].instant - step, step);
      const maxInstant = getTickInstant(records[records.length - 1].instant, step);

      const _stepRecords: IRecord[] = [];
      let record: IRecord;
      let recordIndex = 0;
      let offInstant: number;
      for (let instant = minInstant; instant < maxInstant; instant += step) {
        for (; recordIndex < records.length; recordIndex++) {
          record = records[recordIndex];
          offInstant = record.instant - instant; // positive value while records are older than instant
          if (Math.abs(offInstant) <= TimeUtil.MILLISECONDS_PER_MINUTE / 2) {
            _stepRecords.push(record);
            // break; // will continue with the next searchable instant
          } else if (offInstant > 0) {
            break;
          }
        }
      }
      setStepRecords(_stepRecords);
    }

  };

  /**
   * callback, triggered when the chartRef becomes valid
   * @param ref
   */
  const handleRefChange = (ref: SVGElement) => {
    console.debug(`⚙ updating chart component (ref)`, ref);
    if (!chartRef.current) {
      chartRef.current = ref;
      rebuildTickInterval();
    }
  };

  /**
   * recalculates the y-axis min and max values
   */
  const recalculateMinMax = () => {
    const combinedKeys = sensorIds.map(s => toCombinedKey(s));
    const values: number[] = [];
    records.forEach(record => {
      combinedKeys.forEach(combinedKey => {
        if (record[combinedKey]) {
          values.push(record[combinedKey]);
        }
      });
    });
    const _min = Math.min(...values);
    const _max = Math.max(...values);
    setMinMax([_min, _max]);
  };

  /**
   * react hook (records)
   */
  useEffect(() => {

    console.debug(`⚙ updating chart component (records)`, records);
    rebuildTickInterval();
    recalculateMinMax();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, records]);

  /**
   * react hook (timeRange)
   */
  useEffect(() => {

    console.debug(`⚙ updating chart component (timeRange)`, timeRange);
    loadSensorValues();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  /**
   * react hook (tickInterval)
   * once the tick-interval is built, the reduced set of records can be evaluated
   */
  useEffect(() => {

    console.debug(`⚙ updating chart component (tickInterval)`, tickInterval);
    if (tickInterval) {
      rebuildStepRecords();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickInterval]);

  /**
   * react hook (stepRecords)
   * when the step-records are complete, the chart can be treated as rendered and, if required, the chart can be exported to png
   */
  useEffect(() => {

    if (stepRecords?.length > 0) {
      console.debug(`⚙ updating chart component (stepRecords, exportTo)`, stepRecords, exportTo);
      if (exportTo === 'png') {
        setTimeout(() => {
          exportToPng();
        }, 250);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepRecords]);

  useEffect(() => {
    console.debug(`⚙ updating chart component (sensorIds, recordKey)`, sensorIds, recordKey);
    if (sensorIds.length > 0 && recordKey !== 'instant') {
      loadSensorValues();
      recalculateMinMax();
    } else {
      setSeries([]);
      setRecords([]);
      setStepRecords([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorIds, recordKey]);

  /**
   * component init hook
   */
  useEffect(() => {

    console.debug('✨ building chart component', chartRef);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getXAxisMin = () => {
    if (records.length > 0) {
      return records[0].instant;
    } else {
      return undefined;
    }
  };

  const getXAxisMax = () => {
    if (records.length > 0) {
      return records[records.length - 1].instant;
    } else {
      return undefined;
    }
  };

  // , backgroundColor: 'rgba(50, 50, 50, 0.9)'

  return (
    <Stack style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid gray', borderRadius: '5px', margin: '0px' }}>

      <LineChart
        skipAnimation
        ref={handleRefChange}
        xAxis={[
          {
            dataKey: 'instant',
            valueFormatter: (instant, context) => {
              if (context.location === 'tooltip') {
                return TimeUtil.toLocalDateTime(instant);
              } else {
                return TimeUtil.toLocalTime(instant);
              }
            },
            min: getXAxisMin(),
            max: getXAxisMax(),
            label: 'time (HH:MM)',
            tickInterval,
            tickLabelStyle: {
              angle: -90,
              translate: -4,
              textAnchor: 'end',
              fontSize: 12,
            },
          },
        ]}
        yAxis={[
          {
            colorMap: SERIES_DEFS[recordKey].colorMap,
            valueFormatter: SERIES_DEFS[recordKey].valueFormatter,
            min: SERIES_DEFS[recordKey].getChartMin(minmax[0]),
            max: SERIES_DEFS[recordKey].getChartMax(minmax[1]),
            label: `${SERIES_DEFS[recordKey].hint}`,
          },
        ]}
        series={series}
        dataset={stepRecords}
        grid={{ vertical: true, horizontal: true }}
        margin={{ top: 15, right: 10, bottom: 75, left: 90 }}
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: 'translateX(-40px)',
          },
          [`& .${axisClasses.bottom} .${axisClasses.label}`]: {
            transform: 'translateY(30px)',
          },
          '& .MuiLineElement-root': {
            strokeWidth: 3,
          },
          flexGrow: 5
        }}
        {...{
          legend: { hidden: true },
        }}
      ></LineChart>
      <FormControl variant="outlined" sx={{ margin: '10px' }}>
        <InputLabel id="prop-label" size='small'>time range</InputLabel>
        <Select
          value={timeRange}
          label={'time range'}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <MenuItem value={'1h'}>&nbsp;1 hour</MenuItem>
          <MenuItem value={'3h'}>&nbsp;3 hours</MenuItem>
          <MenuItem value={'6h'}>&nbsp;6 hours</MenuItem>
          <MenuItem value={'12h'}>12 hours</MenuItem>
          <MenuItem value={'1d'}>&nbsp;1 day</MenuItem>
          <MenuItem value={'3d'}>&nbsp;3 days</MenuItem>
          <MenuItem value={'1w'}>&nbsp;1 week</MenuItem>
          <MenuItem value={'2w'}>&nbsp;2 weeks</MenuItem>
          <MenuItem value={'4w'}>&nbsp;4 weeks</MenuItem>
        </Select>
      </FormControl>

    </Stack >
  );
};

export default ChartComponent;
