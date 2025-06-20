import { invalidate } from "@react-three/fiber";
import { Group, LineSegments, Mesh } from "three";
import { Line2 } from "three/examples/jsm/Addons.js";
import { MaterialRepo } from "../util/MaterialRepo";
import { MqttUtil } from "../util/MqttUtil";
import { COLOR_DESCRIPTIONS, TColorKey } from "./IColorDescription";
import { ISwitchProps } from "./ISwitchProps";
import { PolygonUtil } from "../util/PolygonUtil";
import { IWeatherForecast } from "../util/IWeatherForecast";
import { ObjectUtil } from "../util/ObjectUtil";

export type TStatusHandlerKey = 'weather___' | 'moth____66' | 'moth___178' | 'moth___130' | 'moth_295D3' | 'barrel_cnt' | 'barrel_top' | 'barrel_bot' | 'switch_pure_1' | 'switch_pump_1' | 'switch_pump_2' | 'switch_pump_3';
export type TStatusResult = 'ON' | 'OFF' | undefined;
export type TQueryTime = 'STARTUP' | 'RUNTIME'

export interface IStatusHandler {
    topic: string; // the url to get this elements status from (other elements may use the same url, only one call shall be made)
    value: string;
    statusHndlr: (status: never) => TStatusResult; // todo some container that holds all instances (Meshes) that a specific status may apply to
    statusQuery: (queryTime: TQueryTime) => void;
    switchProps?: ISwitchProps;
    faces: Mesh[];
    sgmts: LineSegments[];
    lines: Line2[];
    texts: Group[];
    actTo: number;
}

const topicPure1 = 'plug_150';
const topicPump = 'plug_153';
const topicShed = 'shed_024';

export let VALUE_COUNTER_1 = 0;
export let POWER_PURE_1 = false;
export let POWER_PUMP_1 = false;
export let POWER_PUMP_2 = false;
export let POWER_PUMP_3 = false;
const counter1Min = 225;

const setVisible = (statusHandler: TStatusHandlerKey, visible: boolean) => {

    STATUS_HANDLERS[statusHandler].faces.forEach(face => {
        face.visible = visible;
    });
    STATUS_HANDLERS[statusHandler].sgmts.forEach(sgmt => {
        sgmt.visible = visible;
    });
    // STATUS_HANDLERS[statusHandler].lines.forEach(line => {
    //     line.visible = visible;
    // });

}


const setBarrelTopColors = () => {

    // console.log('setBarrelTopColors', STATUS_COUNTER_1);

    let colorDescFace = COLOR_DESCRIPTIONS['face_gray___clip_none'];
    let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray___clip_none'];
    // let colorDescLine = COLOR_DESCRIPTIONS['line_gray___clip__000_none'];

    if (POWER_PUMP_1) {

        if (VALUE_COUNTER_1 > counter1Min) {
            colorDescFace = COLOR_DESCRIPTIONS['face_blue___clip_none'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue_noclip'];
            // colorDescLine = COLOR_DESCRIPTIONS['line_blue___clip_none'];
        } else {
            colorDescFace = COLOR_DESCRIPTIONS['face_red_noclip'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_red_noclip'];
            // colorDescLine = COLOR_DESCRIPTIONS['line_red_noclip'];
        }

    } else {

        // TODO reset the liter display, test code below
        // PolygonUtil.createTextMesh('', STATUS_HANDLERS['switch_pump_1'].texts[0]);

    }

    STATUS_HANDLERS['switch_pump_1'].faces.forEach(face => {
        face.material = MaterialRepo.getMaterialFace(colorDescFace);
    });
    STATUS_HANDLERS['switch_pump_1'].sgmts.forEach(sgmt => {
        sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
    });
    // STATUS_HANDLERS['switch_pump_1'].lines.forEach(line => {
    //     line.material = MaterialRepo.getMaterialLine(colorDescLine);
    // });

    invalidate();

};

export const STATUS_HANDLERS: { [K in TStatusHandlerKey]: IStatusHandler } = {
    weather___: {
        topic: ObjectUtil.createId(),
        value: ObjectUtil.createId(),
        statusHndlr: (status: IWeatherForecast) => {
            // nothing

            const deg = status['temperature'].toFixed(1);
            const sun = (status.sunshine * 100).toFixed(0);
            const prc = (status.precipitation).toFixed(1);

            window.clearTimeout(STATUS_HANDLERS['weather___'].actTo);
            STATUS_HANDLERS['weather___'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['weather___'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip_none']);
                PolygonUtil.createTextMesh(`${sun}%`, STATUS_HANDLERS['weather___'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip_none']);
                PolygonUtil.createTextMesh(`${prc}mm/h`, STATUS_HANDLERS['weather___'].texts[2], COLOR_DESCRIPTIONS['face_gray___clip_none']);
                invalidate();
            }, 500);

            return undefined;
        },
        statusQuery: () => {
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip_none']);
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip_none']);
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[2], COLOR_DESCRIPTIONS['face_gray___clip_none']);
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    moth_295D3: {
        topic: `aranet/295D3`,
        value: ObjectUtil.createId(),
        statusHndlr: (status: never) => {

            const rad = status['rad'];

            let colorDescKeyRad: TColorKey = 'face_green___clip__000';
            if (rad >= 10) {
                colorDescKeyRad = 'face_red___clip';
            } else if (rad >= 0.2) {
                colorDescKeyRad = 'face_yellow___clip';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth_295D3'].actTo);
            STATUS_HANDLERS['moth_295D3'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${rad}µSv/h`, STATUS_HANDLERS['moth_295D3'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyRad]);
                invalidate();
            }, 500);

            return undefined;

        },
        statusQuery: () => {
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth_295D3'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    moth____66: {
        topic: `moth/ip__66`,
        value: ObjectUtil.createId(),
        statusHndlr: (status: never) => {

            const co2Lpf = status['co2_lpf'];
            const deg = status['deg'];
            // console.log('moth/ip__66', co2Lpf, status, STATUS_HANDLERS['moth____66'].texts[0]);

            let colorDescKeyLpf: TColorKey = 'face_green___clip__000';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red___clip';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow___clip';
            }

            let colorDescKeyDeg: TColorKey = 'face_green___clip__000';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red___clip';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow___clip';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth____66'].actTo);
            STATUS_HANDLERS['moth____66'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf]);
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg]);
                invalidate();
            }, 500);

            return undefined;

        },
        statusQuery: () => {
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip__000']);
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    moth___178: {
        topic: `moth/ip_178`,
        value: ObjectUtil.createId(),
        statusHndlr: (status: never) => {

            const co2Lpf = status['co2_lpf'];
            const deg = status['deg'];
            // console.log('moth/ip_178', co2Lpf, status, STATUS_HANDLERS['moth___178'].texts[0]);

            let colorDescKeyLpf: TColorKey = 'face_green___clip__000';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red___clip';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow___clip';
            }

            let colorDescKeyDeg: TColorKey = 'face_green___clip__000';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red___clip';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow___clip';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth___178'].actTo);
            STATUS_HANDLERS['moth___178'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf]);
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg]);
                invalidate();
            }, 500);

            return undefined;

        },
        statusQuery: () => {
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip__000']);
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    moth___130: {
        topic: `moth/ip_130`,
        value: ObjectUtil.createId(),
        statusHndlr: (status: never) => {

            const pm025 = status['pm025'];
            // console.log('moth/ip_130', pm025, status, STATUS_HANDLERS['moth___130'].texts[0]);

            let colorDescKeyPm025: TColorKey = 'face_green___clip__000';
            if (pm025 >= 15) {
                colorDescKeyPm025 = 'face_red___clip';
            } else if (pm025 >= 5) {
                colorDescKeyPm025 = 'face_yellow___clip';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth___130'].actTo);
            STATUS_HANDLERS['moth___130'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${pm025}µg/m³`, STATUS_HANDLERS['moth___130'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyPm025]);
                invalidate();
            }, 500);

            return undefined;

        },
        statusQuery: () => {
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___130'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_cnt: {
        topic: `stat/${topicShed}/RESULT`,
        value: ObjectUtil.createId(),
        statusHndlr: (status: never) => {

            // console.log('barrel_cnt :: statusHndlr', status)

            if (status['Counter1']) {
                VALUE_COUNTER_1 = status['Counter1'];
            } else if (status['Var1']) {
                VALUE_COUNTER_1 = parseInt(status['Var1']);
            }
            setBarrelTopColors();
            if (VALUE_COUNTER_1 && POWER_PUMP_1) {

                // console.log('counter1', STATUS_COUNTER_1, status);

                const liters = VALUE_COUNTER_1 / 350;
                PolygonUtil.createTextMesh(`~ ${liters.toFixed()} liter`, STATUS_HANDLERS['switch_pump_1'].texts[0], {
                    rgb: 0xFFFFFF,
                    opacity: 1,
                    clip: 'clip_none'
                });

                window.clearTimeout(STATUS_HANDLERS['barrel_cnt'].actTo);
                STATUS_HANDLERS['barrel_cnt'].actTo = window.setTimeout(() => {
                    STATUS_HANDLERS['barrel_cnt'].statusQuery('RUNTIME');
                }, 1000);

            } else {

                // PolygonUtil.createTextMesh(`off`, STATUS_HANDLERS['switch_pump_1'].texts[0]);

            }

            return undefined;

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShed}/Counter1`, '+0', { qos: 0, retain: false });
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_top: {
        topic: `stat/${topicShed}/RESULT`,
        value: 'POWER1',
        statusHndlr: (status: never) => {

            // console.log('barrel_top :: statusHndlr', status)

            const switch1 = status['POWER1']; // when ON the barrel is completely full
            if (switch1) {

                // console.log('barrel_top handler', power1, status);
                const colorDesc = switch1 === 'ON' ? COLOR_DESCRIPTIONS['face_blue___clip_none'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                const colorDescSgmt = switch1 === 'ON' ? COLOR_DESCRIPTIONS['sgmt_blue_noclip'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                STATUS_HANDLERS['barrel_top'].faces.forEach(face => {
                    face.material = MaterialRepo.getMaterialFace(colorDesc);
                });
                STATUS_HANDLERS['barrel_top'].sgmts.forEach(sgmt => {
                    sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                });
                invalidate();

            }

            return undefined;

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShed}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_bot: {
        topic: `stat/${topicShed}/RESULT`,
        value: 'POWER2',
        statusHndlr: (status: never) => {

            // console.log('barrel_bot :: statusHndlr', status)

            const switch2 = status['POWER2']; // when ON the barrel is completely empty
            if (switch2) {
                // console.log('barrel_bot handler', power2, status);
                const colorDescFace = switch2 === 'OFF' ? COLOR_DESCRIPTIONS['face_blue___clip_none'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                const colorDescSgmt = switch2 === 'OFF' ? COLOR_DESCRIPTIONS['sgmt_blue_noclip'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                STATUS_HANDLERS['barrel_bot'].faces.forEach(face => {
                    face.material = MaterialRepo.getMaterialFace(colorDescFace);
                });
                STATUS_HANDLERS['barrel_bot'].sgmts.forEach(sgmt => {
                    sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                });
                invalidate();
            }

            return undefined;

        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShed}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT
            }
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pure_1: {
        topic: `stat/${topicPure1}/RESULT`,
        value: 'POWER',
        statusHndlr: (status: never) => {

            // console.log('switch_pure_1 :: statusHndlr', status)

            POWER_PURE_1 = status['POWER'] && status['POWER'] === 'ON';

            const colorDescFace = POWER_PURE_1 ? COLOR_DESCRIPTIONS['face_blue___clip__245'] : COLOR_DESCRIPTIONS['face_gray___clip__245'];
            const colorDescSgmt = POWER_PURE_1 ? COLOR_DESCRIPTIONS['line_blue___clip__245'] : COLOR_DESCRIPTIONS['line_gray___clip__245'];

            STATUS_HANDLERS['switch_pure_1'].faces.forEach(face => {
                face.material = MaterialRepo.getMaterialFace(colorDescFace);
            });
            STATUS_HANDLERS['switch_pure_1'].sgmts.forEach(sgmt => {
                sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
            });

            invalidate();
            // TODO :: introduce a way to notify a switch component, if displayed

            return POWER_PURE_1;

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPure1}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        switchProps: {
            title: 'air purifier',
            toggle: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPure1}/Power`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            select: () => {

                STATUS_HANDLERS['switch_pure_1'].lines.forEach(line => {
                    line.visible = true;
                });

            },
            deselect: () => {

                STATUS_HANDLERS['switch_pure_1'].lines.forEach(line => {
                    line.visible = false;
                });

            },
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pump_1: {
        topic: `stat/${topicPump}/RESULT`,
        value: 'POWER1',
        statusHndlr: (status: never) => {

            // console.log('switch_pump_1 :: statusHndlr', status)

            if (status['POWER1']) {

                POWER_PUMP_1 = status['POWER1'] === 'ON';

                setBarrelTopColors();

                return POWER_PUMP_1 ? 'ON' : 'OFF';

            }

            return undefined;

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        switchProps: {
            title: 'ground ⤴ barrel',
            toggle: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/Power1`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            select: () => {

                STATUS_HANDLERS['switch_pump_1'].lines.forEach(line => {
                    line.visible = true;
                });

            },
            deselect: () => {

                STATUS_HANDLERS['switch_pump_1'].lines.forEach(line => {
                    line.visible = false;
                });

            },
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pump_2: {
        topic: `stat/${topicPump}/RESULT`,
        value: 'POWER2',
        statusHndlr: (status: never) => {

            // console.log('switch_pump_2 :: statusHndlr', status)

            if (status['POWER2']) {

                let colorDescFace = COLOR_DESCRIPTIONS['face_gray___clip_none'];
                let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray___clip_none'];
                // let colorDescLine = COLOR_DESCRIPTIONS['line_gray___clip__000_none'];

                POWER_PUMP_2 = status['POWER2'] === 'ON'; // when ON the barrel is completely full
                // console.log('POWER_PUMP_2', POWER_PUMP_2);
                if (POWER_PUMP_2) {

                    colorDescFace = COLOR_DESCRIPTIONS['face_blue___clip_none'];
                    colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue_noclip'];
                    // colorDescLine = COLOR_DESCRIPTIONS['line_blue___clip_none'];

                }

                const statusHandlerKeys: TStatusHandlerKey[] = ['switch_pump_2', 'switch_pump_3'];
                statusHandlerKeys.forEach(statusHandlerKey => {
                    STATUS_HANDLERS[statusHandlerKey].faces.forEach(face => {
                        face.material = MaterialRepo.getMaterialFace(colorDescFace);
                    });
                    STATUS_HANDLERS[statusHandlerKey].sgmts.forEach(sgmt => {
                        sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                    });
                    // STATUS_HANDLERS[statusHandlerKey].lines.forEach(line => {
                    //     line.material = MaterialRepo.getMaterialLine(colorDescLine);
                    // });
                });

                invalidate();

                return POWER_PUMP_2 ? 'ON' : 'OFF';

            }

            return undefined;

        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }
        },
        switchProps: {
            title: 'barrel ⤳ garden',
            toggle: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/Power2`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            select: () => {

                STATUS_HANDLERS['switch_pump_2'].lines.forEach(line => {
                    line.visible = true;
                });

            },
            deselect: () => {

                STATUS_HANDLERS['switch_pump_2'].lines.forEach(line => {
                    line.visible = false;
                });

            },
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pump_3: {
        topic: `stat/${topicPump}/RESULT`,
        value: 'POWER3',
        statusHndlr: (status: never) => {

            // console.log('switch_pump_3 :: statusHndlr', status);

            if (status['POWER3']) {

                POWER_PUMP_3 = status['POWER3'] === 'ON'; // when ON circling is active

                if (POWER_PUMP_3) {

                    setVisible('switch_pump_1', false);
                    setVisible('switch_pump_2', false);
                    setVisible('switch_pump_3', true);

                } else {

                    setVisible('switch_pump_1', true);
                    setVisible('switch_pump_2', true);
                    setVisible('switch_pump_3', false);

                }

                invalidate();

                return POWER_PUMP_3 ? 'ON' : 'OFF';

            }

            return undefined;

        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    }
}