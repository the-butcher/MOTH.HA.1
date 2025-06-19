import { COLOR_DESCRIPTIONS, IColorDescription } from "./IColorDescription";
import { ILineDescription } from "./ILineDescription";

export type TFaceDescKey = 'switch_pump_1' | 'switch_pump_2' | 'switch_pump_3' | 'handrail___clip' | 'handrail_noclip' | 'walls_shed' | 'walls_house___clip' | 'walls_house_noclip' | 'barrel_top' | 'barrel_bot' | 'barrel_mid' | 'lawn' | 'hedge___clip' | 'hedge_noclip' | 'tree' | 'stairs' | 'umbrella' | 'pavement' | 'misc_gray';

export interface IFaceDescription extends IColorDescription {
    lineDesc: ILineDescription;
}

export const FACE_DESCRIPTIONS: { [K in TFaceDescKey]: IFaceDescription } = {
    switch_pump_1: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    switch_pump_2: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    switch_pump_3: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    handrail___clip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        rgb: 0xAAAAAA,
        opacity: 0.75,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    },
    handrail_noclip: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        rgb: 0xAAAAAA,
        opacity: 0.75,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    walls_shed: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    },
    walls_house___clip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    },
    walls_house_noclip: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    barrel_top: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    barrel_bot: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    barrel_mid: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        opacity: 0.5,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'none'
        }
    },
    lawn: {
        ...COLOR_DESCRIPTIONS['face_green_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green_noclip'],
            lineStyle: 'thin'
        }
    },
    hedge___clip: {
        ...COLOR_DESCRIPTIONS['face_green___clip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green___clip'],
            lineStyle: 'thin'
        }
    },
    hedge_noclip: {
        ...COLOR_DESCRIPTIONS['face_green_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green_noclip'],
            lineStyle: 'thin'
        }
    },
    tree: {
        ...COLOR_DESCRIPTIONS['face_green_noclip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green_noclip'],
            lineStyle: 'none'
        }
    },
    stairs: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    },
    umbrella: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        rgb: 0xAAAAAA,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    },
    pavement: {
        ...COLOR_DESCRIPTIONS['face_gray_noclip'],
        rgb: 0x999999,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray_noclip'],
            lineStyle: 'thin'
        }
    },
    misc_gray: {
        ...COLOR_DESCRIPTIONS['face_gray___clip'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip'],
            lineStyle: 'thin'
        }
    }
};