import { Stack, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useEffect, useState } from 'react';
import { IGaugeProps } from '../types/IGaugeProps';
import { SERIES_DEFS, toLevelColor } from '../types/ISeriesDef';

const GaugeComponent = (props: IGaugeProps) => {

  const { value, roomId, recordKey } = { ...props };

  const [color, setColor] = useState<string>('#000000');

  useEffect(() => {

    console.debug('✨ building gauge component', props);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug(`⚙ updating gauge component (value, recordKey)`, value, recordKey);

    setColor(toLevelColor(recordKey, value));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, recordKey]);

  return (
    <Stack
      sx={{
        display: 'flex', flexDirection: 'column', width: `100%`, height: `100%`, border: '1px solid gray', borderRadius: '5px', margin: `0px`
      }}
    >

      <Gauge
        value={value}
        startAngle={-110}
        endAngle={110}
        valueMin={SERIES_DEFS[recordKey].getGaugeMin(value)}
        valueMax={SERIES_DEFS[recordKey].getGaugeMax(value)}
        innerRadius={'70%'}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 14
          },
          [`& .${gaugeClasses.valueArc} `]: {
            fill: color,
          },
          [`& .${gaugeClasses.referenceArc} `]: {
            fill: '#505050',
          },

        }}
        text={SERIES_DEFS[recordKey].valueFormatter(value)}
      />
      <Typography
        sx={{ width: '100%', textAlign: 'center', paddingBottom: '20px' }}
      >{roomId}</Typography>

    </Stack>

  );
};

export default GaugeComponent;
