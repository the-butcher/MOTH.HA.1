import AdjustIcon from '@mui/icons-material/Adjust';
import BatteryStdIcon from '@mui/icons-material/BatteryStd';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Co2Icon from '@mui/icons-material/Co2';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Card, CardContent, CardHeader, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Slider, Stack, SvgIcon, Switch, Typography } from '@mui/material';
import { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ActionResultUnion } from '../types/IActionResult';
import { IBoardProps } from '../types/IBoardProps';
import { STATUS_HANDLERS, THandlerKey } from '../types/IStatusHandler';
import { IStatusResult } from '../types/IStatusResult';
import { MqttUtil } from '../util/MqttUtil';
import { TimeUtil } from '../util/TimeUtil';

const BoardComponent = (props: IBoardProps) => {

  const { sun, handleSunInstant, handlePresetKey, handleSelectKey, selectKey, handleToggleStats } = { ...props };

  const statusResultRef = useRef<IStatusResult>();
  const [statusResult, setStatusResult] = useState<IStatusResult>();

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

    console.debug('📞 handle sun change');

    handleSunInstant(value);

    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 600000);

  }

  const handleSunInstantCommit = (value: number) => {

    console.debug('📞 handle sun commit');

    handleSunInstant(value);

    // reset after 5 seconds
    window.clearTimeout(setSunInstantTo.current);
    setSunInstantTo.current = window.setTimeout(() => {
      handleSunInstantChange(Date.now());
    }, 600000);

  }

  useEffect(() => {

    console.debug('⚙ updating board component (selectKey)', selectKey);

    statusResultRef.current = undefined;
    setStatusResult(undefined);
    MqttUtil.clearBoardHandlers();

    if (selectKey) {

      MqttUtil.addBoardHandler({
        handlerKey: STATUS_HANDLERS[selectKey].handlerKey,
        handleResult
      });

      STATUS_HANDLERS[selectKey].dependencyKeys.forEach(dependencyKey => {
        MqttUtil.addBoardHandler({
          handlerKey: STATUS_HANDLERS[dependencyKey].handlerKey,
          handleResult
        });
      });



      // // set an empty status result
      // setStatusResult({
      //   resultKey: selectKey,
      //   values: [],
      //   switches: []
      // });

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectKey]);

  const setOrMergeStatusResult = (result: IStatusResult) => {

    if (statusResultRef.current) {

      const values = statusResultRef.current.values;

      for (let i = 0; i < values.length; i++) {
        const replaceValue = result.values.find(v => v.key === values[i].key);
        if (replaceValue) {
          values[i].value = replaceValue.value;
        }
      }
      result.values.forEach(v2 => {
        const prevKey = values.find(v1 => v1.key === v2.key);
        if (!prevKey) {
          values.push(v2);
        }
      });

      const switches = statusResultRef.current.actions;

      for (let i = 0; i < switches.length; i++) {
        const replaceSwitch = result.actions.find(s => s.handlerKey === switches[i].handlerKey);
        if (replaceSwitch) {
          switches[i].status = replaceSwitch.status;
        }
      }
      result.actions.forEach(s2 => {
        const prevSwitch = switches.find(s1 => s1.handlerKey === s2.handlerKey);
        if (!prevSwitch) {
          switches.push(s2);
        }
      });

      statusResultRef.current = {
        ...statusResultRef.current,
        values,
        actions: switches
      };

      setStatusResult(statusResultRef.current);

    } else {

      statusResultRef.current = result;

    }

    setStatusResult(statusResultRef.current);

  }

  const handleResult = (result: IStatusResult) => {

    console.debug('📞 handling result in board component', result);

    setOrMergeStatusResult(result);

  }

  const handleSwitchAction = (handlerKey: THandlerKey) => {

    if (STATUS_HANDLERS[handlerKey].action) {
      STATUS_HANDLERS[handlerKey].action!.action();
    } else {
      console.warn('no action found', handlerKey);
    }

  };



  const getActionListItem = (actionResult: ActionResultUnion): ReactElement => {

    if (actionResult.type === 'switch') {
      return <ListItem
        key={`action_${actionResult.handlerKey}`}
        sx={{
          padding: '0px 0px 0px 12px !important'
        }}
      >
        <ListItemIcon
          key={`${actionResult.handlerKey}_power`}
          sx={{
            minWidth: 'unset'
          }}
        >
          <PowerSettingsNewIcon />

        </ListItemIcon>
        <ListItemText
          sx={{
            flexGrow: 10,
            paddingLeft: '6px'
          }}
          primary={'power'}
        />
        <ListItemText
          sx={{
            flexGrow: 0
          }}
          primary={<Switch
            size="medium"
            sx={{
              // margin: '3px'
              // flexGrow: 0
            }}
            checked={actionResult.status}
            onClick={() => handleSwitchAction(actionResult.handlerKey)}
          />}
        />

      </ListItem>
    } else if (actionResult.type === 'reset') {
      return <ListItem
        key={`action_${actionResult.handlerKey}`}
        sx={{
          padding: '0px 0px 0px 12px !important'
        }}
      >
        <ListItemIcon
          key={`${actionResult.handlerKey}_power`}
          sx={{
            minWidth: 'unset'
          }}
        >
          <FormatColorResetIcon />
        </ListItemIcon>
        <ListItemText
          sx={{
            flexGrow: 10,
            paddingLeft: '6px'
          }}
          primary={'reset'}
        />
        <ListItemText
          sx={{
            flexGrow: 0,
            padding: '0px 3px'
          }}
          primary={<IconButton
            onClick={() => handleSwitchAction(actionResult.handlerKey)}
            sx={{
              // padding: '0px 12px 0px 0px !important',
              padding: '5px',
              height: '36px',
              width: '36px'
            }}

          >
            <AdjustIcon />
          </IconButton>
          }
        />

      </ListItem >
    } else {
      return <></>
    }


  }

  const handleDeselect = () => {
    console.debug('📞 handling deselect');
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
            backgroundColor: 'rgba(0, 0, 0, 0.25) !important',
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
          bottom: '6px',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0px 12px',
          pointerEvents: 'none'
        }}
      >
        <IconButton
          onClick={() => handleToggleStats()}
          size="small"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
            color: '#CCCCCC',
            marginRight: '12px',
            pointerEvents: 'auto'
          }}
        >
          <ShowChartIcon />
        </IconButton>
        {
          statusResult ? <Card
            sx={{
              width: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              pointerEvents: 'auto'
            }}
          >
            <CardHeader
              sx={{
                // fontSize: '20px'
                padding: '6px 12px 6px 12px'
              }}
              action={
                <IconButton
                  onClick={() => handleDeselect()}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.0)',
                  }}
                >
                  <HighlightOffIcon />
                </IconButton>
              }
              title={<Typography>{STATUS_HANDLERS[statusResult.handlerKey].title}</Typography>}
            />
            <CardContent
              sx={{
                padding: '0px',
                paddingBottom: '0px !important'
              }}
            >
              {
                statusResult.values.length > 0 ? <>
                  <Divider
                    orientation='horizontal'
                    sx={{
                      margin: '0px 12px',
                      backgroundColor: 'white'
                    }}
                  ></Divider>
                  <List
                    sx={{
                      padding: '6px 0px 6px 0px',
                      width: '100%'
                    }}
                  >
                    {
                      statusResult.values.map(v => <ListItem
                        key={`${statusResult.handlerKey}_${v.key}`}
                        sx={{
                          padding: '0px 12px !important'
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'unset'
                          }}
                        >
                          {(() => {
                            switch (v.unit) {
                              case 'co2_ppm': return <Co2Icon />
                              case 'temperature_celsius': return <DeviceThermostatIcon />
                              case 'humidity_relative': return <WaterDropIcon />
                              case 'pressure_hectopascal': return <SpeedIcon />
                              case 'battery_percent': return <BatteryStdIcon />
                              case 'radiation_microsivert_per_hour': return <SvgIcon>
                                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="white" stroke="none"              >
                                  <path d="m 15.460407,18.471979 c -2.426923,1.242737 -4.869947,1.276404 -7.3305363,-0.0029 l 2.6333133,-4.48644 c 0.59868,0.355696 1.301288,0.358623 2.106359,0.0014 l 2.590864,4.487905 z M 11.761473,3.1214724 c 2.484009,0 4.732353,1.0070706 6.358596,2.6347777 1.627707,1.6277071 2.634778,3.8760506 2.634778,6.3585969 0,2.484009 -1.007071,4.732353 -2.634778,6.358596 -1.627707,1.627707 -3.876051,2.634778 -6.358596,2.634778 -2.4825465,0 -4.7323538,-1.007071 -6.3585971,-2.634778 C 3.7751688,16.8472 2.7680982,14.598856 2.7680982,12.114847 c 0,-2.4840101 1.0070706,-4.7323536 2.6347777,-6.3585969 C 7.0291192,4.128543 9.2774627,3.1214724 11.761473,3.1214724 Z m 5.868235,3.1251391 C 16.127885,4.7447882 14.053729,3.8152971 11.761473,3.8152971 c -2.2922569,0 -4.3664124,0.9294911 -5.8682357,2.4313144 C 4.391414,7.7484348 3.461923,9.8225903 3.461923,12.114847 c 0,2.292256 0.929491,4.366412 2.4313143,5.868235 1.5018233,1.501823 3.5759788,2.431314 5.8682357,2.431314 2.292256,0 4.366412,-0.929491 5.868235,-2.431314 1.501823,-1.501823 2.431314,-3.575979 2.431314,-5.868235 0,-2.2922567 -0.929491,-4.3664122 -2.431314,-5.8682355 z M 15.42235,5.7167284 c 2.289329,1.4798668 3.540848,3.5789063 3.66234,6.3498136 l -5.203685,-0.0366 c 0.0088,-0.696753 -0.339594,-1.305679 -1.050984,-1.823852 z m -3.652095,5.0763386 c 0.780187,0 1.412534,0.632346 1.412534,1.412533 0,0.780187 -0.632347,1.412534 -1.412534,1.412534 -0.780188,0 -1.412534,-0.632347 -1.412534,-1.412534 0,-0.780187 0.632346,-1.412533 1.412534,-1.412533 z M 4.4558197,12.098745 C 4.5919498,9.3761419 5.7849186,7.2434357 8.1240157,5.7518588 l 2.5703713,4.5244992 c -0.607462,0.341057 -0.9602294,0.947056 -1.0539104,1.822387 z" />
                                </svg>
                              </SvgIcon>
                              case 'pm025_microgram_per_cube_meter': return <BlurOnIcon />
                              case 'volume_liters': return <OilBarrelIcon />
                              default: return <ChevronRightIcon />
                            }
                          })()}
                        </ListItemIcon>
                        <ListItemText
                          sx={{
                            flexGrow: 10,
                            paddingLeft: '6px'
                          }}
                          primary={v.key}
                        />
                        <ListItemText
                          sx={{
                            flexGrow: 0
                          }}
                          primary={v.value}
                        />
                      </ListItem>)
                    }
                  </List>
                </> : null
              }
              {
                statusResult.actions.length > 0 ? <>
                  <Divider
                    orientation='horizontal'
                    sx={{
                      margin: '0px 12px',
                      backgroundColor: 'white'
                    }}
                  ></Divider>
                  <List
                    sx={{
                      padding: '2px 0px 2px 0px',
                      width: '100%'
                    }}
                  >
                    {
                      statusResult.actions.map(s => getActionListItem(s))
                    }
                  </List >
                </> : null
              }


            </CardContent >
          </Card> : <Slider
            sx={{
              zIndex: 300,
              padding: '0px',
              margin: '0px',
              pointerEvents: 'auto'
            }}
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
          />
        }

      </Stack >

    </>
  );
};

export default BoardComponent;
