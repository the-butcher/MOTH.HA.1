import { COLOR_DESCRIPTIONS, IColorDescription } from "./IColorDescription";

export type TLineDescKey = 'weather___' | 'light_01' | 'light_02' | 'moth____66' | 'moth___178' | 'moth___130' | 'moth_295D3' | 'status_pure_1' | 'switch_pure_1' | 'switch_pump_1' | 'switch_pump_2' | 'switch_pump_3' | 'barrel_top' | 'barrel_bot' | 'misc_gray';
export type TLineStyle = 'none' | 'thin' | 'wide';

export interface ILineDescription extends IColorDescription {
    lineStyle: TLineStyle;
}

export const LINE_DESCRIPTIONS: { [K in TLineDescKey]: ILineDescription } = {
    weather___: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    },
    light_01: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__245'],
        lineStyle: 'thin'
    },
    light_02: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__245'],
        lineStyle: 'thin'
    },
    moth_295D3: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    },
    moth____66: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    },
    moth___178: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    },
    moth___130: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    },
    status_pure_1: {
        ...COLOR_DESCRIPTIONS['line_blue___clip__245'],
        lineStyle: 'wide'
    },
    switch_pure_1: {
        ...COLOR_DESCRIPTIONS['line_blue___clip__245'],
        lineStyle: 'wide'
    },
    switch_pump_1: {
        ...COLOR_DESCRIPTIONS['line_blue___clip_none'],
        lineStyle: 'wide'
    },
    switch_pump_2: {
        ...COLOR_DESCRIPTIONS['line_blue___clip_none'],
        lineStyle: 'wide'
    },
    switch_pump_3: {
        ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
        lineStyle: 'wide'
    },
    barrel_top: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'wide'
    },
    barrel_bot: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'wide'
    },
    misc_gray: {
        ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
        lineStyle: 'thin'
    }
};