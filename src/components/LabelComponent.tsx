import HelpIcon from '@mui/icons-material/Help';
import { Avatar, Checkbox, Chip, Stack, Typography } from '@mui/material';
import React, { ChangeEvent, ReactElement, ReactNode, useEffect, useState } from 'react';
import { ILabelProps } from '../types/ILabelProps';
import { SERIES_DEFS, toLevelColor } from '../types/ISeriesDef';
import { SPEED_DIAL_DEFS } from './BoardComponent';

import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import ImageIcon from '@mui/icons-material/Image';

const LabelComponent = (props: ILabelProps) => {

  const { sensorId, x, y, recordKey, value, handleSensorSelect } = { ...props };

  const [label, setLabel] = useState<string>(sensorId); // start with sensorId as label, but will be set to a formatted version of the last value
  const [icon, setIcon] = useState<ReactNode>(<HelpIcon />);
  const [color, setColor] = useState<string>('#000000');

  const loadLastSensorValue = () => {

    const actionDef = SPEED_DIAL_DEFS.find((s) => s.recordKey === recordKey);
    const seriesDef = SERIES_DEFS[recordKey];
    if (actionDef) {
      const _icon = React.cloneElement(actionDef.icon as ReactElement, {
        style: { color: 'black', width: '16px', margin: '0px' },
      });
      setIcon(_icon);
    }

    setLabel(seriesDef.valueFormatter(value));
    setColor(toLevelColor(recordKey, value));

  };

  useEffect(() => {
    console.debug('✨ building label component', props);
    // loadLastSensorValue();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    console.debug('⚙ updating label component (value, recordKey)', value, recordKey);
    loadLastSensorValue();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, recordKey]);

  // boxShadow: `0px 0px 20px ${color}`

  const handleCheckboxChange = (_e: ChangeEvent, checked: boolean) => {
    handleSensorSelect(sensorId, checked);
  };

  return (
    <Chip
      variant="outlined"
      sx={{ zIndex: 200, height: '34px', borderRadius: '20px', boxShadow: `0px 0px 1px ${color}`, border: `3px solid ${color}`, backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'lightgray', position: 'absolute', left: `${Math.round(x + 12)}px`, top: `${Math.round(y - 16)}px` }}
      avatar={<Avatar sx={{ backgroundColor: 'lightgray', marginLeft: '2px !important' }}>{icon}</Avatar>}
      label={
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', marginTop: '0px !important' }}>
          <Typography sx={{ marginTop: '3px' }}>
            {label}
          </Typography>
          <Checkbox onChange={handleCheckboxChange} sx={{ marginTop: '0px !important' }} icon={<HideImageOutlinedIcon sx={{ color: 'lightgray' }} />} checkedIcon={<ImageIcon sx={{ color: 'lightgray' }} />} />
        </Stack>
      }
    />
  );
};

export default LabelComponent;
