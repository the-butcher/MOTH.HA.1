import BatteryStdIcon from '@mui/icons-material/BatteryStd';
import Co2Icon from '@mui/icons-material/Co2';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SpeedIcon from '@mui/icons-material/Speed';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Grid, Paper, Slider, Stack, Tab, Tabs } from '@mui/material';
import { ReactElement } from 'react';
import { IBoardProps } from '../types/IBoardProps';
import { IChartProps } from '../types/IChartProps';
import { TRecordKey } from '../types/IRecord';
import ChartComponent from './ChartComponent';
import GaugeComponent from './GaugeComponent';
import LabelComponent from './LabelComponent';
import LockComponent from './LockComponent';

export interface ISpeedDialDef {
  recordKey: TRecordKey;
  icon: ReactElement;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SPEED_DIAL_DEFS: ISpeedDialDef[] = [
  {
    recordKey: 'co2_lpf',
    icon: <Co2Icon />,
  },
  {
    recordKey: 'deg',
    icon: <DeviceThermostatIcon />,
  },
  {
    recordKey: 'hum',
    icon: <WaterDropIcon />,
  },
  {
    recordKey: 'hpa',
    icon: <SpeedIcon />,
  },
  {
    recordKey: 'bat',
    icon: <BatteryStdIcon />,
  },
];

const BoardComponent = (props: IBoardProps & IChartProps) => {

  const { labels, recordKey, clipPlane, handleRecordKey, handleClipPlane } = { ...props };

  //  value={value} onChange={handleChange}

  const getControlsWidth = () => {
    if (window.innerWidth > window.innerHeight) {
      return window.innerWidth / 2 - 40;
    } else {
      return window.innerWidth - 40;
    }
  }

  const getControlsHeight = () => {
    if (window.innerWidth > window.innerHeight) {
      return window.innerHeight - 40;
    } else {
      return window.innerHeight / 2 - 40;
    }
  }

  const getSliderHeight = () => {
    if (window.innerWidth > window.innerHeight) {
      return window.innerHeight - 80;
    } else {
      return window.innerHeight / 2 - 80;
    }
  }

  const marks = [
    {
      value: 0.2,
      label: '0.2m - ground',
    },
    {
      value: 3.0,
      label: '3.0m - 1st',
    },
    {
      value: 5.8,
      label: '5.8m - 2nd',
    },
    {
      value: 8.6,
      label: '8.6m - roof',
    },
  ];

  return (
    <>

      <Slider
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '20px', bottom: '40px', height: `${getSliderHeight()}px` }}
        orientation="vertical"
        value={clipPlane}
        min={marks[0].value}
        max={marks[marks.length - 1].value}
        valueLabelDisplay="off"
        step={0.7}
        marks={marks}
        onChange={(_e, value) => handleClipPlane(value as number)}
      />

      <Paper
        elevation={3}
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, width: `${getControlsWidth()}px`, height: `${getControlsHeight()}px`, right: '20px', top: '20px', backgroundColor: 'rgba(50, 50, 50, 0.75)' }}
      >
        <Stack direction={'row'}>
          <Tabs
            value={recordKey}
            onChange={(e, recordKey) => {
              e.stopPropagation();
              handleRecordKey(recordKey)
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ display: 'flex', flexGrow: 2, maxWidth: '70%' }}
          >
            {SPEED_DIAL_DEFS.map((action) => (
              <Tab key={action.recordKey} icon={action.icon} value={action.recordKey} aria-label={action.recordKey} sx={{ minWidth: 'unset', flexGrow: 1, maxWidth: 'unset' }} />
            ))}
          </Tabs>
          <div style={{ flexGrow: 5 }} />
          <LockComponent />
        </Stack>

        <Grid container spacing={1} sx={{ padding: '10px', flexGrow: 5 }} >
          {
            props.sensorIds.length > 0 && props.recordKey !== 'instant' ? <Grid
              item
              xs={12}
            >
              <ChartComponent {...props} />
            </Grid> : labels.map((label) => (
              <Grid
                item
                xs={6}
                key={label.sensorId}
              >
                <GaugeComponent key={label.sensorId} {...label} />
              </Grid>
            ))
          }
        </Grid>

      </Paper >
      {
        labels.map((labels) => (
          <LabelComponent key={labels.sensorId} {...labels} />
        ))
      }

    </>
  );
};

export default BoardComponent;
