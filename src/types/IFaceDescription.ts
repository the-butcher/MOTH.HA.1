import { COLOR_DESCRIPTIONS, IColorDescription } from "./IColorDescription";
import { ILineDescription } from "./ILineDescription";

export type TFaceDescKey = 'home0' | 'home1' | 'home2' | 'switch_pure_1' | 'switch_pump_1' | 'switch_pump_2' | 'switch_pump_3' | 'handrail___clip' | 'handrail_noclip' | 'walls_shed' | 'walls_house___clip' | 'walls_house_noclip' | 'barrel_top' | 'barrel_bot' | 'barrel_mid' | 'lawn' | 'hedge___clip' | 'hedge_noclip' | 'tree' | 'stairs' | 'umbrella' | 'pavement' | 'misc_gray';

export interface IFaceDescription extends IColorDescription {
    lineDesc: ILineDescription;
}

export const FACE_DESCRIPTIONS: { [K in TFaceDescKey]: IFaceDescription } = {
    home0: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        rgb: 0xCCCCCC,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'none'
        }
    },
    home1: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        rgb: 0xCCCCCC,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'none'
        }
    },
    home2: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        rgb: 0xCCCCCC,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'none'
        }
    },
    switch_pure_1: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__245'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__245'],
            lineStyle: 'thin'
        }
    },
    switch_pump_1: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    switch_pump_2: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    switch_pump_3: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    handrail___clip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        rgb: 0xAAAAAA,
        opacity: 0.75,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    },
    handrail_noclip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        rgb: 0xAAAAAA,
        opacity: 0.75,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    walls_shed: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    },
    walls_house___clip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    },
    walls_house_noclip: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    barrel_top: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    barrel_bot: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    barrel_mid: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        opacity: 0.5,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'none'
        }
    },
    lawn: {
        ...COLOR_DESCRIPTIONS['face_green___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green___clip_none'],
            lineStyle: 'thin'
        }
    },
    hedge___clip: {
        ...COLOR_DESCRIPTIONS['face_green___clip__000'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green___clip__000'],
            lineStyle: 'thin'
        }
    },
    hedge_noclip: {
        ...COLOR_DESCRIPTIONS['face_green___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green___clip_none'],
            lineStyle: 'thin'
        }
    },
    tree: {
        ...COLOR_DESCRIPTIONS['face_green___clip_none'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_green___clip_none'],
            lineStyle: 'none'
        }
    },
    stairs: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    },
    umbrella: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        rgb: 0xAAAAAA,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    },
    pavement: {
        ...COLOR_DESCRIPTIONS['face_gray___clip_none'],
        rgb: 0x999999,
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip_none'],
            lineStyle: 'thin'
        }
    },
    misc_gray: {
        ...COLOR_DESCRIPTIONS['face_gray___clip__000'],
        lineDesc: {
            ...COLOR_DESCRIPTIONS['line_gray___clip__000'],
            lineStyle: 'thin'
        }
    }
};