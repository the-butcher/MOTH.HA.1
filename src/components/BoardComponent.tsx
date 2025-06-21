import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Divider, IconButton, Slider, Stack, SvgIcon, Switch, Typography } from '@mui/material';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { IBoardProps } from '../types/IBoardProps';
import { STATUS_HANDLERS } from '../types/IStatusHandler';
import { ISwitchProps } from '../types/ISwitchProps';
import { MqttUtil } from '../util/MqttUtil';
import { TimeUtil } from '../util/TimeUtil';

const BoardComponent = (props: IBoardProps) => {

  const { sun, handleSunInstant, handlePresetKey, handleSelectKey, selectKey, handleToggleStats } = { ...props };

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

    console.debug('📞 handling mqtt result', result);
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

      <Stack
        direction={'row'}
        sx={{
          justifyContent: 'center',
          paddingTop: '12px',
        }}
      >
        <Stack
          direction={'row'}
          sx={{
            zIndex: 300,
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
            borderRadius: '3px',
            padding: '6px'
          }}
        >
          <IconButton
            onClick={() => handlePresetKey('pumps')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <WaterDropIcon />
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              margin: '0px 6px'
            }}
          />
          <IconButton
            onClick={() => handlePresetKey('home0')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <SvgIcon>
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="white" stroke="none"              >
                <path d="M 12,22.729158 18.644807,17.555959 20.125443,16.409368 12,10.089579 3.8745566,16.409368 5.3461647,17.555959 Z" />
              </svg>
            </SvgIcon>
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              margin: '0px 6px'
            }}
          />
          <IconButton
            onClick={() => handlePresetKey('home1')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <SvgIcon>
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="white" stroke="none"              >
                <path d="M 12,18.189793 18.644807,13.016594 20.125443,11.870003 12,5.5502139 3.8745566,11.870003 5.3461647,13.016594 Z" />
                <path d="M 11.990972,20.482973 5.3371364,15.309774 3.8745566,16.447337 12,22.767126 20.125443,16.447337 18.653835,15.300746 Z" />
              </svg>
            </SvgIcon>
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              margin: '0px 6px'
            }}
          />
          <IconButton
            onClick={() => handlePresetKey('home2')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <SvgIcon>
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="white" stroke="none"              >
                <path d="M 11.990972,20.482973 5.3371364,15.309774 3.8745566,16.447337 12,22.767126 20.125443,16.447337 18.653835,15.300746 Z" />
                <path d="M 11.990972,15.901962 5.3371364,10.728763 3.8745566,11.866326 12,18.186115 20.125443,11.866326 18.653835,10.719735 Z" />
                <path d="M 12,13.692073 18.644807,8.5188744 20.125443,7.3722834 12,1.0524941 3.8745566,7.3722834 5.3461647,8.5188744 Z" />
              </svg>
            </SvgIcon>
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              margin: '0px 6px'
            }}
          />
          <IconButton
            onClick={() => handlePresetKey('home3')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <SvgIcon>
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="white" stroke="none"              >
                <path d="M 12.093252,2.7828221 5.1803681,9.6957055 V 21.217178 h 5.7607369 v -5.760736 h 2.304294 v 5.760736 h 5.760736 V 9.6957055 Z" />
              </svg>
            </SvgIcon>
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              margin: '0px 6px'
            }}
          />
          <IconButton
            onClick={() => handlePresetKey('quarter')}
            sx={{
              width: '42px',
              height: '32px',
              borderRadius: '2px'
            }}
          >
            <HolidayVillageIcon />
          </IconButton>

        </Stack>
      </Stack>

      <Stack
        direction={'row'}
        sx={{
          position: 'fixed',
          display: 'flex',
          flexDirection: 'row',
          zIndex: 300,
          left: '0px',
          bottom: '6px',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0px 12px'
        }}
      >
        <IconButton
          onClick={() => handleToggleStats()}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.0)',
            color: '#CCCCCC',
            marginRight: '12px'
          }}
        >
          <ShowChartIcon />
        </IconButton>
        {
          switchProps ? <Stack
            direction={'row'}
            sx={{
              padding: '0px 12px 0px 12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'divider',
              borderRadius: '4px',
              zIndex: 300,
              marginBottom: '6px'
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontSize: '1rem'
              }}
            >{switchProps.title}</Typography>
            <Switch
              size="medium"
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
            :
            <Slider
              sx={{
                zIndex: 300,
                padding: '0px',
                margin: '0px'
                // margin: '0px 12px'
              }}
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

      </Stack >

    </>
  );
};

export default BoardComponent;
