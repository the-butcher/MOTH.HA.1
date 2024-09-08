export interface IColorDescription {
    rgb: number;
    opacity: number;
}

export type TColorKey = 'face_gray' | 'face_green' | 'face_blue' | 'face_yellow' | 'face_red' | 'line_gray' | 'line_green' | 'line_blue' | 'line_red' | 'sgmt_blue' | 'sgmt_red';

export const COLOR_DESCRIPTIONS: { [K in TColorKey]: IColorDescription } = {
    face_gray: {
        rgb: 0xFFFFFF,
        opacity: 1.00
    },
    face_green: {
        rgb: 0x33DD33,
        opacity: 1.00
    },
    face_blue: {
        rgb: 0x3333FF,
        opacity: 0.75
    },
    face_yellow: {
        rgb: 0xCCCC00,
        opacity: 1.00
    },
    face_red: {
        rgb: 0xFF4444,
        opacity: 1.00
    },
    line_gray: {
        rgb: 0x444444,
        opacity: 0.75
    },
    line_green: {
        rgb: 0x225522,
        opacity: 0.75
    },
    line_blue: {
        rgb: 0x3333FF,
        opacity: 0.75
    },
    line_red: {
        rgb: 0xFF3333,
        opacity: 0.75
    },
    sgmt_blue: {
        rgb: 0x5555FF,
        opacity: 0.75
    },
    sgmt_red: {
        rgb: 0xFF5555,
        opacity: 0.75
    },
};