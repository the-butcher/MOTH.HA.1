import { COLOR_DESCRIPTIONS, IColorDescription } from "./IColorDescription";
import { ILineDescription } from "./ILineDescription";

export type TFaceDescKey = 'switch_pump_1' | 'switch_pump_2' | 'handrail' | 'walls_shed' | 'walls_house' | 'barrel_top' | 'barrel_bot' | 'barrel_mid' | 'lawn' | 'hedge' | 'tree' | 'stairs' | 'umbrella' | 'pavement' | 'misc_gray';

export interface IFaceDescription extends IColorDescription {
    lineDesc: ILineDescription;
}

export const FACE_DESCRIPTIONS: { [K in TFaceDescKey]: IFaceDescription } = {
    switch_pump_1: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    switch_pump_2: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    handrail: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        rgb: 0xAAAAAA,
        opacity: 0.75,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    walls_shed: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    walls_house: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    barrel_top: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    barrel_bot: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    barrel_mid: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        opacity: 0.5,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'none'
        }
    },
    lawn: {
        ...COLOR_DESCRIPTIONS['face_green'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green'],
            lineStyle: 'thin'
        }
    },
    hedge: {
        ...COLOR_DESCRIPTIONS['face_green'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green'],
            lineStyle: 'thin'
        }
    },
    tree: {
        ...COLOR_DESCRIPTIONS['face_green'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green'],
            lineStyle: 'none'
        }
    },
    stairs: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    umbrella: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        rgb: 0xAAAAAA,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    pavement: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        rgb: 0x999999,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    },
    misc_gray: {
        ...COLOR_DESCRIPTIONS['face_gray'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray'],
            lineStyle: 'thin'
        }
    }
};