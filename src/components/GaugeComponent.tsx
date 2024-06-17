import { Stack, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { } from '@mui/x-charts/SparkLineChart';
import { useEffect, useRef, useState } from 'react';
import { IGaugeProps } from '../types/IGaugeProps';
import { SERIES_DEFS, toLevelColor } from '../types/ISeriesDef';
import { SparkLineChart } from '@mui/x-charts';

const GaugeComponent = (props: IGaugeProps) => {

  const { height, recent, roomId, recordKeyObj: recordKey } = { ...props };

  const stackRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [color, setColor] = useState<string>('#000000');

  useEffect(() => {

    console.debug('✨ building gauge component', props);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug(`⚙ updating gauge component (value, recordKey)`, recent, recordKey);

    setColor(toLevelColor(recordKey, recent[recent.length - 1]));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recent, recordKey]);

  return (
    <Stack
      ref={stackRef}
      sx={{
        display: 'flex', flexDirection: 'row', width: `100%`, height: '100%', border: '1px solid #444444', borderRadius: '5px', margin: `0px`, backgroundColor: 'rgba(100, 100, 100, 0.60)'
      }}
    >
      <Typography
        sx={{ textAlign: 'center', padding: '20px' }}
      >{roomId}</Typography>
      <Stack spacing={1}
        sx={{ display: 'flex', flexGrow: 5, flexDirection: 'column', width: `100%`, height: `100%`, margin: `0px`, padding: '10px' }}
      >
        <Gauge
          height={height * 0.7}
          value={recent[recent.length - 1]}
          startAngle={-110}
          endAngle={110}
          valueMin={SERIES_DEFS[recordKey].getGaugeMin(recent[recent.length - 1])}
          valueMax={SERIES_DEFS[recordKey].getGaugeMax(recent[recent.length - 1])}
          innerRadius={'70%'}
          cornerRadius={2}

          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 14
            },
            [`& .${gaugeClasses.valueArc} `]: {
              fill: color,
              stroke: '#444444',
              strokeWidth: '1.0',
              strokeOpacity: 1,
            },
            [`& .${gaugeClasses.referenceArc} `]: {
              fill: '#444444',
              stroke: '#444444',
              strokeWidth: '1.0',
              strokeOpacity: 1,
            },
            border: '1px solid #444444', borderRadius: '5px'
          }}
          text={SERIES_DEFS[recordKey].valueFormatter(recent[recent.length - 1])}
        />
        <SparkLineChart
          height={height * 0.3}
          // plotType="bar"
          data={recent}
          sx={{
            height: '30%',
            border: '1px solid #444444',
            borderRadius: '5px',
            [`& .MuiLineElement-root`]: {
              stroke: '#aaaaaa',
              strokeWidth: 3
            },
          }}
        />
      </Stack>

    </Stack>

  );
};

export default GaugeComponent;
