export interface IColorDescription {
    rgb: number;
    opacity: number;
    clip: boolean;
}

export type TColorKey = 'face_gray___clip' | 'face_gray_noclip' | 'face_green___clip' | 'face_green_noclip' | 'face_blue_noclip' | 'face_yellow___clip' | 'face_red___clip' | 'face_red_noclip' | 'face_red_noclip' | 'line_gray___clip' | 'line_gray_noclip' | 'line_green___clip' | 'line_green_noclip' | 'line_blue_noclip' | 'line_red___clip' | 'line_red_noclip' | 'sgmt_blue_noclip' | 'sgmt_red___clip' | 'sgmt_red_noclip';

// face_gray___clip___clip
// face_gray___clip_noclip

export const COLOR_DESCRIPTIONS: { [K in TColorKey]: IColorDescription } = {
    face_gray___clip: {
        rgb: 0xFFFFFF,
        opacity: 1.00,
        clip: true
    },
    face_gray_noclip: {
        rgb: 0xFFFFFF,
        opacity: 1.00,
        clip: false
    },
    face_green___clip: {
        rgb: 0x33DD33,
        opacity: 1.00,
        clip: true
    },
    face_green_noclip: {
        rgb: 0x33DD33,
        opacity: 1.00,
        clip: false
    },
    face_blue_noclip: {
        rgb: 0x3333FF,
        opacity: 0.75,
        clip: false
    },
    face_yellow___clip: {
        rgb: 0xCCCC00,
        opacity: 1.00,
        clip: true
    },
    face_red___clip: {
        rgb: 0xFF4444,
        opacity: 1.00,
        clip: true
    },
    face_red_noclip: {
        rgb: 0xFF4444,
        opacity: 1.00,
        clip: false
    },
    line_gray___clip: {
        rgb: 0x444444,
        opacity: 0.90,
        clip: true
    },
    line_gray_noclip: {
        rgb: 0x444444,
        opacity: 0.90,
        clip: false
    },
    line_green___clip: {
        rgb: 0x225522,
        opacity: 0.90,
        clip: true
    },
    line_green_noclip: {
        rgb: 0x225522,
        opacity: 0.90,
        clip: false
    },
    line_blue_noclip: {
        rgb: 0x3333FF,
        opacity: 0.90,
        clip: false
    },
    line_red___clip: {
        rgb: 0xFF3333,
        opacity: 0.90,
        clip: true
    },
    line_red_noclip: {
        rgb: 0xFF3333,
        opacity: 0.90,
        clip: true
    },
    sgmt_blue_noclip: {
        rgb: 0x5555FF,
        opacity: 0.90,
        clip: false
    },
    sgmt_red___clip: {
        rgb: 0xFF5555,
        opacity: 0.90,
        clip: true
    },
    sgmt_red_noclip: {
        rgb: 0xFF5555,
        opacity: 0.90,
        clip: true
    },
};