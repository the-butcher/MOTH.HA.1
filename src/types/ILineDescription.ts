import { COLOR_DESCRIPTIONS, IColorDescription } from "./IColorDescription";

export type TLineDescKey = 'moth____66' | 'moth___178' | 'switch_pump_1' | 'switch_pump_2' | 'barrel_top' | 'barrel_bot' | 'misc_gray';
export type TLineStyle = 'none' | 'thin' | 'wide';

export interface ILineDescription extends IColorDescription {
    lineStyle: TLineStyle;
}

export const LINE_DESCRIPTIONS: { [K in TLineDescKey]: ILineDescription } = {
    moth____66: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'thin'
    },
    moth___178: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'thin'
    },
    switch_pump_1: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'wide'
    },
    switch_pump_2: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'wide'
    },
    barrel_top: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'wide'
    },
    barrel_bot: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'wide'
    },
    misc_gray: {
        ...COLOR_DESCRIPTIONS['line_gray'],
        lineStyle: 'thin'
    }
};