import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Button, ButtonGroup, IconButton, Slider, Stack, Switch, Typography } from '@mui/material';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { IBoardProps } from '../types/IBoardProps';
import { STATUS_HANDLERS } from '../types/IStatusHandler';
import { ISwitchProps } from '../types/ISwitchProps';
import { MqttUtil } from '../util/MqttUtil';
import { TimeUtil } from '../util/TimeUtil';


const BoardComponent = (props: IBoardProps) => {

  const { sun, handleSunInstant, handlePresetKey, handleSelectKey, selectKey } = { ...props };

  const [switchProps, setSwitchProps] = useState<ISwitchProps>();
  const [switchActive, setSwitchActive] = useState<boolean>(false);

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

  const valueLabelFormat = (value: number) => {
    return TimeUtil.toLocalTime(value);
  }

  const setSunInstantTo = useRef<number>(-1);
  const handleSunInstantChange = (value: number) => {

    // console.log('handle sun change');

    handleSunInstant(value);

    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 600000);

  }

  const handleSunInstantCommit = (value: number) => {

    // console.log('handle sun commit');

    handleSunInstant(value);

    // reset after 5 seconds
    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 600000);

  }

  useEffect(() => {

    console.debug('⚙ updating board component (selectKey)', selectKey);

    if (selectKey && STATUS_HANDLERS[selectKey].topic && STATUS_HANDLERS[selectKey].value && STATUS_HANDLERS[selectKey].switchProps) {
      setSwitchProps(STATUS_HANDLERS[selectKey].switchProps!);
      MqttUtil.setBoardHandler({
        topic: STATUS_HANDLERS[selectKey].topic,
        value: STATUS_HANDLERS[selectKey].value,
        handleResult
      });
      STATUS_HANDLERS[selectKey].statusQuery('RUNTIME');
    } else {
      setSwitchProps(undefined);
      MqttUtil.clearBoardHandler();
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectKey]);

  const handleResult = (result: boolean) => {
    console.log('handling result', result);
    setSwitchActive(result);
  }

  const toggleSwitch = () => {

    if (selectKey && STATUS_HANDLERS[selectKey].topic && STATUS_HANDLERS[selectKey].switchProps) {
      STATUS_HANDLERS[selectKey].switchProps!.toggle();
    }

  };

  const handleDeselect = () => {
    console.debug('handling deselect');
    setSwitchActive(false);
    handleSelectKey(undefined);
  }


  return (
    <>

      {/* <Slider
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '20px', bottom: '80px', height: `${getSliderHeight()}px` }}
        orientation="vertical"
        value={clipPlane}
        min={marks[0].value}
        max={marks[marks.length - 1].value}
        valueLabelDisplay="off"
        step={0.7}
        marks={marks}
        onChange={(_e: Event, value: number | number[]) => handleClipPlane(value as number)}
      /> */}



      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 300,
          paddingTop: '6px'
        }}
      >
        <ButtonGroup
          variant="text"
          sx={{ display: 'flex', flexDirection: 'row', zIndex: 300 }}
        >
          <Button
            onClick={() => handlePresetKey('pumps')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>P</Typography>
          </Button>
          <Button
            onClick={() => handlePresetKey('home0')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>H<Typography component={'span'} sx={{ fontSize: '0.6rem' }}>0</Typography></Typography>
          </Button>
          <Button
            onClick={() => handlePresetKey('home1')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>H<Typography component={'span'} sx={{ fontSize: '0.6rem' }}>1</Typography></Typography>
          </Button>
          <Button
            onClick={() => handlePresetKey('home2')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>H<Typography component={'span'} sx={{ fontSize: '0.6rem' }}>2</Typography></Typography>
          </Button>
          <Button
            onClick={() => handlePresetKey('home3')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>H<Typography component={'span'} sx={{ fontSize: '0.6rem' }}>3</Typography></Typography>
          </Button>
          <Button
            onClick={() => handlePresetKey('quarter')}
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25) !important' }}
          >
            <Typography>Q</Typography>
          </Button>
        </ButtonGroup>
      </div >

      {
        switchProps ? <Stack
          direction={'row'}
          sx={{
            position: 'fixed',
            bottom: '6px',
            margin: '6px 0px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        ><Stack
          direction={'row'}
          sx={{
            padding: '0px 6px 0px 12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderColor: 'divider',
            borderRadius: '4px',
            zIndex: 300
          }}
        >
            <Typography>{switchProps.title}</Typography>
            <Switch
              sx={{
                // margin: '3px'
              }}
              checked={switchActive}
              onClick={() => toggleSwitch()}
            />
            <IconButton
              onClick={() => handleDeselect()}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                color: '#CCCCCC'
              }}
            >
              <HighlightOffIcon />
            </IconButton>
          </Stack>
        </Stack> : <Slider
          sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '30px', bottom: '6px', width: 'calc(100% - 60px)' }}
          orientation="horizontal"
          value={sun.sunInstant}
          min={sun.sunriseInstant}
          max={sun.sunsetInstant}
          valueLabelDisplay="on"
          step={1000 * 60 * 10}
          getAriaValueText={valueLabelFormat}
          valueLabelFormat={valueLabelFormat}
          onChange={(_e: Event, value: number | number[]) => handleSunInstantChange(value as number)}
          onChangeCommitted={(_e: Event | SyntheticEvent<Element, Event>, value: number | number[]) => handleSunInstantCommit(value as number)}
        />
      }

      {/* <Slider
        sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 300, left: '30px', bottom: '6px', width: 'calc(100% - 60px)' }}
        orientation="horizontal"
        value={sun.sunInstant}
        min={sun.sunriseInstant}
        max={sun.sunsetInstant}
        valueLabelDisplay="on"
        step={1000 * 60 * 10}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        onChange={(_e: Event, value: number | number[]) => handleSunInstantChange(value as number)}
        onChangeCommitted={(_e: Event | SyntheticEvent<Element, Event>, value: number | number[]) => handleSunInstantCommit(value as number)}
      /> */}

    </>
  );
};

export default BoardComponent;
