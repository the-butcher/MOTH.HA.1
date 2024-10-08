import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import HomeIcon from '@mui/icons-material/Home';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { BottomNavigation, BottomNavigationAction, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slider } from '@mui/material';
import { SyntheticEvent, useEffect, useRef } from 'react';
import { IBoardProps } from '../types/IBoardProps';
import { TimeUtil } from '../util/TimeUtil';
import { TCameraKey } from '../types/IOrbitProps';

const BoardComponent = (props: IBoardProps) => { //  // props: IBoardProps

  // const { labels, recordKeyApp, clipPlane, handleRecordKey, handleClipPlane, handleCameraKey } = { ...props };
  const { sun, handleSunInstant, confirmProps, cameraKey, handleCameraKey } = { ...props };

  // const getSliderHeight = () => {
  //   return window.innerHeight - 80;
  // }

  // const getSliderWidth = () => {
  //   return window.innerWidth - 80;
  // }

  /**
   * component init hook
   */
  useEffect(() => {

    console.debug('✨ building board component');

    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 60000); // update every minute

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const marks = [
  //   {
  //     value: 0.2,
  //     label: '0.2m - ground',
  //   },
  //   {
  //     value: 3.0,
  //     label: '3.0m - 1st',
  //   },
  //   {
  //     value: 5.8,
  //     label: '5.8m - 2nd',
  //   },
  //   {
  //     value: 8.6,
  //     label: '8.6m - roof',
  //   },
  // ];

  const valueLabelFormat = (value: number) => {
    return TimeUtil.toLocalTime(value);
  }

  const setSunInstantTo = useRef<number>(-1);
  const handleSunInstantChange = (value: number) => {

    handleSunInstant(value);

    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 60000);

  }

  const handleSunInstantCommit = (value: number) => {

    handleSunInstant(value);

    // reset after 5 seconds
    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 600000);

  }

  return (
    <>

      {/* <Slider
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '20px', bottom: '40px', height: `${getSliderHeight()}px` }}
        orientation="vertical"
        value={clipPlane}
        min={marks[0].value}
        max={marks[marks.length - 1].value}
        valueLabelDisplay="off"
        step={0.7}
        marks={marks}
        onChange={(_e: Event, value: number | number[]) => handleClipPlane(value as number)}
      /> */}

      <Slider
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '30px', bottom: '6px', width: 'calc(100% - 60px)' }}
        orientation="horizontal"
        value={sun.sunInstant}
        min={sun.sunriseInstant}
        max={sun.sunsetInstant}
        valueLabelDisplay="on"
        step={1000 * 60}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        onChange={(_e: Event, value: number | number[]) => handleSunInstantChange(value as number)}
        onChangeCommitted={(_e: Event | SyntheticEvent<Element, Event>, value: number | number[]) => handleSunInstantCommit(value as number)}
        marks={
          [
            {
              value: sun.sunriseInstant,
              label: valueLabelFormat(sun.sunriseInstant),
            },
            {
              value: sun.sunsetInstant,
              label: valueLabelFormat(sun.sunsetInstant),
            }
          ]
        }
      />

      <BottomNavigation sx={{ display: 'flex', flexDirection: 'row', zIndex: 300 }} value={cameraKey} onChange={(_e: SyntheticEvent, value: TCameraKey) => handleCameraKey(value)} showLabels={true}>
        <BottomNavigationAction
          label="Schuppen"
          value="pumps"
          icon={<LocalDrinkIcon />}
        />
        <BottomNavigationAction
          label="Haus"
          value="home"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Häuser"
          value="quarter"
          icon={<HolidayVillageIcon />}
        />
      </BottomNavigation>

      {
        confirmProps ? <Dialog
          open={true}
          // onClose={handleCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {confirmProps.getTitle()}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {confirmProps.getContent()}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button id={'cancelbutton'} onClick={confirmProps.handleCancel} autoFocus>nein</Button>
            <Button id={'confirmbutton'} onClick={confirmProps.handleConfirm}>ja</Button>
          </DialogActions>
        </Dialog> : null
      }

      {/* <Paper
        elevation={3}
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, width: `${getControlsWidth()}px`, height: `${getControlsHeight()}px`, right: '20px', top: '20px', backgroundColor: 'rgba(100, 100, 100, 0.60)' }}
      >
        <Stack direction={'row'}>
          <Tabs
            value={recordKeyApp}
            onChange={(e, recordKey) => {
              e.stopPropagation();
              handleRecordKey(recordKey)
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ maxWidth: '70%' }}
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
            props.labels.some(l => l.selected && l.recordKeyObj === recordKeyApp) && props.recordKeyApp !== 'instant' ? <Grid
              item
              xs={12}
              sx={{ display: 'flex' }}
            >
              <ChartComponent {...props} height={getControlsHeight() - 150} />
            </Grid> : labels.map((label) => (
              <Grid
                item
                xs={6}
                key={label.sensorId}
              >
                <GaugeComponent key={label.sensorId} {...label} height={(getControlsHeight() - 180) / Math.ceil(labels.length / 2)} />
              </Grid>
            ))
          }
        </Grid>

      </Paper > */}
      {/* {
        labels.map((labels) => (
          <LabelComponent key={labels.sensorId} {...labels} />
        ))
      } */}

    </>
  );
};

export default BoardComponent;
