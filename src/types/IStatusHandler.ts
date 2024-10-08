import { invalidate } from "@react-three/fiber";
import { Group, LineSegments, Mesh } from "three";
import { Line2 } from "three/examples/jsm/Addons.js";
import { MaterialRepo } from "../util/MaterialRepo";
import { MqttUtil } from "../util/MqttUtil";
import { COLOR_DESCRIPTIONS, TColorKey } from "./IColorDescription";
import { IConfirmProps } from "./IConfirmProps";
import { PolygonUtil } from "../util/PolygonUtil";

export type TStatusHandlerKey = 'moth____66' | 'moth___178' | 'barrel_cnt' | 'barrel_top' | 'barrel_bot' | 'switch_pump_1' | 'switch_pump_2';

export interface IStatusHandler {
    statusTopic: string; // the url to get this elements status from (other elements may use the same url, only one call shall be made)
    statusHndlr: (status: never) => void; // todo some container that holds all instances (Meshes) that a specific status may apply to
    statusQuery: () => void;
    confirmProps?: IConfirmProps;
    faces: Mesh[];
    sgmts: LineSegments[];
    lines: Line2[];
    texts: Group[];
    actTo: number;
}

const topicPump1 = 'plug_150';
const topicPump2 = 'plug_103';
const topicLevel = 'esp__228';

export let STATUS_COUNTER_1 = 0;
let STATUS_POWER_1 = false;
let STATUS_POWER_2 = false;
const counter1Min = 225;


const setBarrelTopColors = () => {

    let colorDescFace = COLOR_DESCRIPTIONS['face_gray'];
    let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray'];
    let colorDescLine = COLOR_DESCRIPTIONS['line_gray'];

    if (STATUS_POWER_1) {

        if (STATUS_COUNTER_1 > counter1Min) {
            colorDescFace = COLOR_DESCRIPTIONS['face_blue'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue'];
            colorDescLine = COLOR_DESCRIPTIONS['line_blue'];
        } else {
            colorDescFace = COLOR_DESCRIPTIONS['face_red'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_red'];
            colorDescLine = COLOR_DESCRIPTIONS['line_red'];
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
    STATUS_HANDLERS['switch_pump_1'].lines.forEach(line => {
        line.material = MaterialRepo.getMaterialLine(colorDescLine);
    });

    invalidate();

};

export const STATUS_HANDLERS: { [K in TStatusHandlerKey]: IStatusHandler } = {
    moth____66: {
        statusTopic: `moth/ip__66`,
        statusHndlr: (status: never) => {

            const co2Lpf = status['co2_lpf'];
            const deg = status['deg'];
            console.log('moth/ip__66', co2Lpf, status, STATUS_HANDLERS['moth____66'].texts[0]);

            let colorDescKeyLpf: TColorKey = 'face_green';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow';
            }

            let colorDescKeyDeg: TColorKey = 'face_green';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth____66'].actTo);
            STATUS_HANDLERS['moth____66'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf]); // TODO :: color depending on value
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg]);
                invalidate();
            }, 500);

        },
        statusQuery: () => {

            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS['face_gray']); // TODO :: color depending on value
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS['face_gray']);
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    moth___178: {
        statusTopic: `moth/ip_178`,
        statusHndlr: (status: never) => {

            const co2Lpf = status['co2_lpf'];
            const deg = status['deg'];
            console.log('moth/ip_178', co2Lpf, status, STATUS_HANDLERS['moth___178'].texts[0]);

            let colorDescKeyLpf: TColorKey = 'face_green';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow';
            }

            let colorDescKeyDeg: TColorKey = 'face_green';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth___178'].actTo);
            STATUS_HANDLERS['moth___178'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf]); // TODO :: color depending on value
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg]);
                invalidate();
            }, 500);

        },
        statusQuery: () => {

            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS['face_gray']); // TODO :: color depending on value
            PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS['face_gray']);
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_cnt: {
        statusTopic: `stat/${topicLevel}/RESULT`,
        statusHndlr: (status: never) => {

            STATUS_COUNTER_1 = status['Counter1'];
            setBarrelTopColors();
            if (STATUS_COUNTER_1 && STATUS_POWER_1) {

                // console.log('counter1', STATUS_COUNTER_1, status);

                const liters = STATUS_COUNTER_1 / 350;
                PolygonUtil.createTextMesh(`~ ${liters.toFixed()} liter`, STATUS_HANDLERS['switch_pump_1'].texts[0], {
                    rgb: 0xFFFFFF,
                    opacity: 1
                });

                window.clearTimeout(STATUS_HANDLERS['barrel_cnt'].actTo);
                STATUS_HANDLERS['barrel_cnt'].actTo = window.setTimeout(() => {
                    STATUS_HANDLERS['barrel_cnt'].statusQuery();
                }, 1000);

            } else {

                // PolygonUtil.createTextMesh(`off`, STATUS_HANDLERS['switch_pump_1'].texts[0]);

            }

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicLevel}/Counter1`, '+0', { qos: 0, retain: false });
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_top: {
        statusTopic: `stat/${topicLevel}/RESULT`,
        statusHndlr: (status: never) => {

            const switch1 = status['POWER1']; // when ON the barrel is completely full
            if (switch1) {

                // console.log('barrel_top handler', power1, status);
                const colorDesc = switch1 === 'ON' ? COLOR_DESCRIPTIONS['face_blue'] : COLOR_DESCRIPTIONS['face_gray'];
                const colorDescSgmt = switch1 === 'ON' ? COLOR_DESCRIPTIONS['sgmt_blue'] : COLOR_DESCRIPTIONS['line_gray'];
                STATUS_HANDLERS['barrel_top'].faces.forEach(face => {
                    face.material = MaterialRepo.getMaterialFace(colorDesc);
                });
                STATUS_HANDLERS['barrel_top'].sgmts.forEach(sgmt => {
                    sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                });
                invalidate();

            }

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicLevel}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    barrel_bot: {
        statusTopic: `stat/${topicLevel}/RESULT`,
        statusHndlr: (status: never) => {

            const switch2 = status['POWER2']; // when ON the barrel is completely empty
            if (switch2) {
                // console.log('barrel_bot handler', power2, status);
                const colorDescFace = switch2 === 'OFF' ? COLOR_DESCRIPTIONS['face_blue'] : COLOR_DESCRIPTIONS['face_gray'];
                const colorDescSgmt = switch2 === 'OFF' ? COLOR_DESCRIPTIONS['sgmt_blue'] : COLOR_DESCRIPTIONS['line_gray'];
                STATUS_HANDLERS['barrel_bot'].faces.forEach(face => {
                    face.material = MaterialRepo.getMaterialFace(colorDescFace);
                });
                STATUS_HANDLERS['barrel_bot'].sgmts.forEach(sgmt => {
                    sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                });
                invalidate();
            }

        },
        statusQuery: () => {
            // nothing, 'barrel_top' already triggers the correct query
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pump_1: {
        statusTopic: `stat/${topicPump1}/RESULT`,
        statusHndlr: (status: never) => {

            STATUS_POWER_1 = status['POWER'] && status['POWER'] === 'ON';
            setBarrelTopColors();

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump1}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        confirmProps: {
            getTitle: () => 'Boden >> Tonne',
            getContent: () => STATUS_POWER_1 ? 'Pumpe ausschalten?' : 'Pumpe einschalten?',
            handleCancel: () => {

            },
            handleConfirm: () => {
                // console.log('power toggle switch_pump_1');
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump1}/Power`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    },
    switch_pump_2: {
        statusTopic: `stat/${topicPump2}/RESULT`,
        statusHndlr: (status: never) => {

            let colorDescFace = COLOR_DESCRIPTIONS['face_gray'];
            let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray'];
            let colorDescLine = COLOR_DESCRIPTIONS['line_gray'];

            STATUS_POWER_2 = status['POWER'] && status['POWER'] === 'ON'; // when ON the barrel is completely full
            if (STATUS_POWER_2) {

                colorDescFace = COLOR_DESCRIPTIONS['face_blue'];
                colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue'];
                colorDescLine = COLOR_DESCRIPTIONS['line_blue'];

            }

            STATUS_HANDLERS['switch_pump_2'].faces.forEach(face => {
                face.material = MaterialRepo.getMaterialFace(colorDescFace);
            });
            STATUS_HANDLERS['switch_pump_2'].sgmts.forEach(sgmt => {
                sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
            });
            STATUS_HANDLERS['switch_pump_2'].lines.forEach(line => {
                line.material = MaterialRepo.getMaterialLine(colorDescLine);
            });

            invalidate();

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump2}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        confirmProps: {
            getTitle: () => 'Tonne >> Garten',
            getContent: () => STATUS_POWER_2 ? 'Pumpe ausschalten?' : 'Pumpe einschalten?',
            handleCancel: () => {

            },
            handleConfirm: () => {
                // console.log('power toggle switch_pump_2');
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump2}/Power`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }

        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        actTo: -1
    }
}