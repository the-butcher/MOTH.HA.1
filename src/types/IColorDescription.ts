export type TClip = 'clip_none' | 'clip__000' | 'clip__245';

export interface IColorDescription {
    rgb: number;
    opacity: number;
    clip: TClip;
}

export type TColorKey =
    'face_gray___clip__000' | 'face_gray___clip__245' | 'face_gray___clip_none' |
    'face_green___clip__000' | 'face_green___clip__245' | 'face_green___clip_none' |
    'face_blue___clip__245' | 'face_blue___clip_none' |
    'face_yellow___clip__000' | 'face_yellow___clip__245' | 'face_yellow___clip_none' |
    'face_red___clip' | 'face_red_noclip' |
    'line_gray___clip__000' | 'line_gray___clip__245' | 'line_gray___clip_none' |
    'line_green___clip__000' | 'line_green___clip__245' | 'line_green___clip_none' |
    'line_blue___clip__000' | 'line_blue___clip__245' | 'line_blue___clip_none' |
    'line_red___clip' | 'line_red_noclip' |
    'sgmt_blue_noclip' |
    'sgmt_red___clip' | 'sgmt_red_noclip';

const LINE_OPACITY = 0.60;

export const COLOR_DESCRIPTIONS: { [K in TColorKey]: IColorDescription } = {
    face_gray___clip__000: {
        rgb: 0xFFFFFF,
        opacity: 1.00,
        clip: 'clip__000'
    },
    face_gray___clip__245: {
        rgb: 0xFFFFFF,
        opacity: 1.00,
        clip: 'clip__245'
    },
    face_gray___clip_none: {
        rgb: 0xFFFFFF,
        opacity: 1.00,
        clip: 'clip_none'
    },
    face_green___clip__000: {
        rgb: 0x33DD33,
        opacity: 1.00,
        clip: 'clip__000'
    },
    face_green___clip__245: {
        rgb: 0x33DD33,
        opacity: 1.00,
        clip: 'clip__245'
    },
    face_green___clip_none: {
        rgb: 0x33DD33,
        opacity: 1.00,
        clip: 'clip_none'
    },
    face_blue___clip__245: {
        rgb: 0x3333FF,
        opacity: 0.75,
        clip: 'clip__245'
    },
    face_blue___clip_none: {
        rgb: 0x3333FF,
        opacity: 0.75,
        clip: 'clip_none'
    },
    face_red___clip: {
        rgb: 0xFF4444,
        opacity: 1.00,
        clip: 'clip__000'
    },
    face_red_noclip: {
        rgb: 0xFF4444,
        opacity: 1.00,
        clip: 'clip_none'
    },
    face_yellow___clip__000: {
        rgb: 0xCCCC00,
        opacity: 1.00,
        clip: 'clip__000'
    },
    face_yellow___clip__245: {
        rgb: 0xCCCC00,
        opacity: 1.00,
        clip: 'clip__245'
    },
    face_yellow___clip_none: {
        rgb: 0xCCCC00,
        opacity: 1.00,
        clip: 'clip_none'
    },
    line_gray___clip__000: {
        rgb: 0x444444,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    line_gray___clip__245: {
        rgb: 0x444444,
        opacity: LINE_OPACITY,
        clip: 'clip__245'
    },
    line_gray___clip_none: {
        rgb: 0x444444,
        opacity: LINE_OPACITY,
        clip: 'clip_none'
    },
    line_green___clip__000: {
        rgb: 0x225522,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    line_green___clip__245: {
        rgb: 0x225522,
        opacity: LINE_OPACITY,
        clip: 'clip__245'
    },
    line_green___clip_none: {
        rgb: 0x225522,
        opacity: LINE_OPACITY,
        clip: 'clip_none'
    },
    line_blue___clip__000: {
        rgb: 0x6666CC,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    line_blue___clip__245: {
        rgb: 0x6666CC,
        opacity: LINE_OPACITY,
        clip: 'clip__245'
    },
    line_blue___clip_none: {
        rgb: 0x6666CC,
        opacity: LINE_OPACITY,
        clip: 'clip_none'
    },
    line_red___clip: {
        rgb: 0xFF3333,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    line_red_noclip: {
        rgb: 0xFF3333,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    sgmt_blue_noclip: {
        rgb: 0x5555FF,
        opacity: LINE_OPACITY,
        clip: 'clip_none'
    },
    sgmt_red___clip: {
        rgb: 0xFF5555,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
    sgmt_red_noclip: {
        rgb: 0xFF5555,
        opacity: LINE_OPACITY,
        clip: 'clip__000'
    },
};