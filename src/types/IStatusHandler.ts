import { invalidate } from "@react-three/fiber";
import { Color, Group, LineSegments, Mesh, MeshLambertMaterial, Object3D, SpotLight } from "three";
import { Line2 } from "three/examples/jsm/Addons.js";
import { IWeatherForecast } from "../util/IWeatherForecast";
import { MaterialRepo } from "../util/MaterialRepo";
import { MqttUtil } from "../util/MqttUtil";
import { PolygonUtil } from "../util/PolygonUtil";
import { WeatherUtil } from "../util/WeatherUtil";
import { COLOR_DESCRIPTIONS, IColorDescription, TColorKey } from "./IColorDescription";
import { ISwitchProps } from "./ISwitchProps";

export type TStatusKey = 'weather___' | 'light_01' | 'light_02' | 'moth____66' | 'moth___178' | 'moth___130' | 'moth_295D3' | 'barrel_cnt' | 'barrel_top' | 'barrel_bot' | 'status_pure_1' | 'switch_pure_1' | 'switch_pump_1' | 'switch_pump_2' | 'switch_pump_3';
export type TQueryTime = 'STARTUP' | 'RUNTIME'
export type TUnit = 'barrel_switch' | 'co2_ppm' | 'temperature_celsius' | 'humidity_relative' | 'battery_percent' | 'radiation_microsivert_per_hour' | 'pressure_hectopascal' | 'pm025_microgram_per_cube_meter'

export interface IStatusResult {
    statusKey: TStatusKey;
    title: string;
    values: IStatusValue[];
    switch?: {
        status: boolean
    };
}

export interface IStatusValue {
    key: string;
    unit: TUnit;
    value: string;
}

export interface IStatusHandler {
    topic?: string; // the url to get this elements status from (other elements may use the same url, only one call shall be made)
    statusKey: TStatusKey;
    /**
     * initialize this handler (i.e. create some 3d elements if needed)
     * @returns
     */
    initialize: () => void;
    statusHndlr: (status: never) => IStatusResult; // todo some container that holds all instances (Meshes) that a specific status may apply to
    statusQuery: (queryTime: TQueryTime) => void;
    switchProps?: ISwitchProps;
    faces: Mesh[];
    sgmts: LineSegments[];
    lines: Line2[];
    texts: Group[];
    lights: SpotLight[];
    sprites: Object3D[];
    actTo: number;
}

const topicPure1 = 'plug_150';
const topicPump = 'plug_153';
const topicShed = 'shed_024';

export let VALUE_COUNTER_1 = 0;
export let LITER_COUNTER_1 = 0;
export let POWER_PURE_1 = false;
export let POWER_PUMP_1 = false;
export let POWER_PUMP_2 = false;
export let POWER_PUMP_3 = false;
export const POWER_LIGHTS: { [K: string]: boolean } = {};
const counter1Min = 225;

const setVisible = (statusHandler: TStatusKey, visible: boolean) => {

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

    if (POWER_PUMP_1) {

        if (VALUE_COUNTER_1 > counter1Min) {
            colorDescFace = COLOR_DESCRIPTIONS['face_blue___clip_none'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue_noclip'];
        } else {
            colorDescFace = COLOR_DESCRIPTIONS['face_red_noclip'];
            colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_red_noclip'];
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

    invalidate();

};

const createLightHandler = (statusKey: TStatusKey): IStatusHandler => {
    return {
        topic: statusKey,
        statusKey: statusKey,
        statusHndlr: (): IStatusResult => {

            // if (Object.keys(POWER_LIGHTS).indexOf(statusKey) === -1) {
            //     POWER_LIGHTS[statusKey] = false;
            // }
            const colorDesc: IColorDescription = POWER_LIGHTS[statusKey] ? COLOR_DESCRIPTIONS['face_gray___clip__245'] : {
                ...COLOR_DESCRIPTIONS['face_gray___clip__245'],
                opacity: 0.5
            }

            STATUS_HANDLERS[statusKey].lights.forEach(light => {
                light.visible = POWER_LIGHTS[statusKey];
            });
            STATUS_HANDLERS[statusKey].faces.forEach(face => {
                face.material = MaterialRepo.getMaterialFace(colorDesc);
                if (POWER_LIGHTS[statusKey]) {
                    (face.material as MeshLambertMaterial).emissive = new Color(colorDesc.rgb);
                    (face.material as MeshLambertMaterial).emissiveIntensity = 1;
                }
            });
            invalidate();

            const statusResult: IStatusResult = {
                statusKey: statusKey,
                title: statusKey,
                switch: {
                    status: POWER_LIGHTS[statusKey]
                },
                values: []
            };

            // fake MQTT behaviour
            MqttUtil.RESULTS_BY_KEY[statusKey] = statusResult;
            if (MqttUtil.BOARD_HANDLER?.statusKey === statusKey) {
                MqttUtil.BOARD_HANDLER.handleResult(statusResult);
            }

            return statusResult;

        },
        initialize: () => {

            POWER_LIGHTS[statusKey] = true;
            STATUS_HANDLERS[statusKey].statusHndlr({} as never);

        },
        statusQuery: () => {
            // nothing
        },
        switchProps: {
            // title: 'air purifier',
            toggle: () => {
                POWER_LIGHTS[statusKey] = !POWER_LIGHTS[statusKey];
                STATUS_HANDLERS[statusKey].statusHndlr({} as never);
            },
            select: () => {
                const colorDesc = COLOR_DESCRIPTIONS['line_blue___clip__245'];
                STATUS_HANDLERS[statusKey].lines.forEach(line => {
                    line.material = MaterialRepo.getMaterialLine(colorDesc);
                });
            },
            deselect: () => {
                const colorDesc = COLOR_DESCRIPTIONS['line_gray___clip__245'];
                STATUS_HANDLERS[statusKey].lines.forEach(line => {
                    line.material = MaterialRepo.getMaterialLine(colorDesc);
                });
            },
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    };
}

export const STATUS_HANDLERS: { [K in TStatusKey]: IStatusHandler } = {
    weather___: {
        statusKey: 'weather___',
        statusHndlr: (status: IWeatherForecast): IStatusResult => {
            // nothing

            const deg = status['temperature'].toFixed(1);

            window.clearTimeout(STATUS_HANDLERS['weather___'].actTo);
            STATUS_HANDLERS['weather___'].actTo = window.setTimeout(async () => {
                WeatherUtil.renderForecast(status);
                PolygonUtil.createTextMesh(`${deg}°C - ${status.weathercode}`, STATUS_HANDLERS['weather___'].texts[2], COLOR_DESCRIPTIONS['face_gray___clip_none']);

            }, 500);

            return {
                statusKey: 'weather___',
                title: 'weather forecast',
                values: [
                    {
                        key: 'temperature (°C)',
                        unit: 'temperature_celsius',
                        value: deg
                    }
                ]
            };

        },
        initialize: () => {
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip_none']);
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip_none']);
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['weather___'].texts[2], COLOR_DESCRIPTIONS['face_gray___clip_none']);
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    light_01: createLightHandler('light_01'),
    light_02: createLightHandler('light_02'),
    moth_295D3: {
        topic: `aranet/295D3`,
        statusKey: 'moth_295D3',
        statusHndlr: (status: never): IStatusResult => {

            // console.log('aranet/295D3', status);

            const rad = status['rad'] as number;
            const bat = status['bat'] as number;

            let colorDescKeyRad: TColorKey = 'face_green___clip__000';
            if (rad >= 10) {
                colorDescKeyRad = 'face_red___clip';
            } else if (rad >= 0.2) {
                colorDescKeyRad = 'face_yellow___clip__000';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth_295D3'].actTo);
            STATUS_HANDLERS['moth_295D3'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${rad}µSv/h`, STATUS_HANDLERS['moth_295D3'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyRad], 'moth_295D3');
                invalidate();
            }, 500);

            return {
                statusKey: 'moth_295D3',
                title: 'aranet radiation',
                values: [
                    {
                        key: 'radiation (µSv/h)',
                        unit: 'radiation_microsivert_per_hour',
                        value: rad?.toFixed(2)
                    },
                    {
                        key: 'battery (%)',
                        unit: 'battery_percent',
                        value: bat?.toFixed(0)
                    }
                ]
            };

        },
        initialize: () => {
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth_295D3'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    moth____66: {
        topic: `moth/ip__66`,
        statusKey: 'moth____66',
        statusHndlr: (status: never): IStatusResult => {

            const co2Lpf = status['co2_lpf'] as number;
            const deg = status['deg'] as number;
            const hum = status['hum'] as number;
            const hpa = status['hpa'] as number;
            const bat = status['bat'] as number;

            // console.log('moth/ip__66', status);

            let colorDescKeyLpf: TColorKey = 'face_green___clip__000';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red___clip';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow___clip__000';
            }

            let colorDescKeyDeg: TColorKey = 'face_green___clip__000';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red___clip';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow___clip__000';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth____66'].actTo);
            STATUS_HANDLERS['moth____66'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf], 'moth____66');
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg], 'moth____66');
                invalidate();
            }, 500);

            return {
                statusKey: 'moth____66',
                title: 'moth CO₂ sensor',
                values: [
                    {
                        key: 'CO₂ (ppm)',
                        unit: 'co2_ppm',
                        value: co2Lpf.toFixed(0)
                    },
                    {
                        key: 'temperature (°C)',
                        unit: 'temperature_celsius',
                        value: deg.toFixed(1)
                    },
                    {
                        key: 'humidity (rel. %)',
                        unit: 'humidity_relative',
                        value: hum.toFixed(1)
                    },
                    {
                        key: 'pressure (hpa)',
                        unit: 'pressure_hectopascal',
                        value: hpa.toFixed(0)
                    },
                    {
                        key: 'battery (%)',
                        unit: 'battery_percent',
                        value: bat.toFixed(0)
                    }
                ]
            };

        },
        initialize: () => {
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip__000']);
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    moth___178: {
        topic: `moth/ip_178`,
        statusKey: 'moth___178',
        statusHndlr: (status: never): IStatusResult => {

            const co2Lpf = status['co2_lpf'] as number;
            const deg = status['deg'] as number;
            const hum = status['hum'] as number;
            const hpa = status['hpa'] as number;
            const bat = status['bat'] as number;

            // console.log('moth/ip_178', status);

            let colorDescKeyLpf: TColorKey = 'face_green___clip__000';
            if (co2Lpf >= 1000) {
                colorDescKeyLpf = 'face_red___clip';
            } else if (co2Lpf >= 800) {
                colorDescKeyLpf = 'face_yellow___clip__000';
            }

            let colorDescKeyDeg: TColorKey = 'face_green___clip__000';
            if (deg >= 30) {
                colorDescKeyDeg = 'face_red___clip';
            } else if (deg >= 25) {
                colorDescKeyDeg = 'face_yellow___clip__000';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth___178'].actTo);
            STATUS_HANDLERS['moth___178'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${co2Lpf}ppm`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS[colorDescKeyLpf], 'moth___178');
                PolygonUtil.createTextMesh(`${deg}°C`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg], 'moth___178');
                invalidate();
            }, 500);

            return {
                statusKey: 'moth___178',
                title: 'moth CO₂ sensor',
                values: [
                    {
                        key: 'CO₂ (ppm)',
                        unit: 'co2_ppm',
                        value: co2Lpf.toFixed(0)
                    },
                    {
                        key: 'temperature (°C)',
                        unit: 'temperature_celsius',
                        value: deg.toFixed(1)
                    },
                    {
                        key: 'humidity (rel. %)',
                        unit: 'humidity_relative',
                        value: hum.toFixed(1)
                    },
                    {
                        key: 'pressure (hpa)',
                        unit: 'pressure_hectopascal',
                        value: hpa.toFixed(0)
                    },
                    {
                        key: 'battery (%)',
                        unit: 'battery_percent',
                        value: bat.toFixed(0)
                    }
                ]
            };

        },
        initialize: () => {
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip__000']);
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    moth___130: {
        topic: `moth/ip_130`,
        statusKey: 'moth___130',
        statusHndlr: (status: never): IStatusResult => {

            const pm025 = status['pm025'] as number;

            // console.log('moth/ip_130', status);

            let colorDescKeyPm025: TColorKey = 'face_green___clip__000';
            if (pm025 >= 15) {
                colorDescKeyPm025 = 'face_red___clip';
            } else if (pm025 >= 5) {
                colorDescKeyPm025 = 'face_yellow___clip__000';
            }

            // TODO :: multiple messages coming almost at the same time -> debounce
            window.clearTimeout(STATUS_HANDLERS['moth___130'].actTo);
            STATUS_HANDLERS['moth___130'].actTo = window.setTimeout(() => {
                PolygonUtil.createTextMesh(`${pm025}µg/m³`, STATUS_HANDLERS['moth___130'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyPm025], 'moth___130');
                invalidate();
            }, 500);

            return {
                statusKey: 'moth___130',
                title: 'moth PM sensor',
                values: [
                    {
                        key: 'PM2.5 (µg/m³)',
                        unit: 'pm025_microgram_per_cube_meter',
                        value: pm025.toFixed(0)
                    }
                ]
            };

        },
        initialize: () => {
            // PolygonUtil.createTextMesh(`###`, STATUS_HANDLERS['moth___130'].texts[0], COLOR_DESCRIPTIONS['face_gray___clip__000']);
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    barrel_cnt: {
        topic: `stat/${topicShed}/RESULT`,
        statusKey: 'barrel_cnt',
        statusHndlr: (status: never): IStatusResult => {

            // console.log('barrel_cnt :: statusHndlr', status)

            if (status['Counter1']) {
                VALUE_COUNTER_1 = status['Counter1'];
            } else if (status['Var1']) {
                VALUE_COUNTER_1 = parseInt(status['Var1']);
            }

            setBarrelTopColors();
            if (VALUE_COUNTER_1 && POWER_PUMP_1) {

                const liters = Math.round(VALUE_COUNTER_1 / 350);
                if (liters != LITER_COUNTER_1) {
                    // console.log('counter1', VALUE_COUNTER_1, liters, status);
                    LITER_COUNTER_1 = liters;
                    PolygonUtil.createTextMesh(`~ ${LITER_COUNTER_1.toFixed()} liter`, STATUS_HANDLERS['switch_pump_1'].texts[0], {
                        rgb: 0xFFFFFF,
                        opacity: 1,
                        clip: 'clip_none'
                    });
                }


                window.clearTimeout(STATUS_HANDLERS['barrel_cnt'].actTo);
                STATUS_HANDLERS['barrel_cnt'].actTo = window.setTimeout(() => {
                    STATUS_HANDLERS['barrel_cnt'].statusQuery('RUNTIME');
                }, 1000);

            } else {

                // PolygonUtil.createTextMesh(`off`, STATUS_HANDLERS['switch_pump_1'].texts[0]);

            }

            // has no graphical representation
            return {
                statusKey: 'barrel_cnt',
                title: 'barrel water counter',
                values: []
            };

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShed}/Counter1`, '+0', { qos: 0, retain: false });
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    barrel_top: {
        topic: `stat/${topicShed}/RESULT`,
        statusKey: 'barrel_top',
        statusHndlr: (status: never): IStatusResult => {

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

            return {
                statusKey: 'barrel_top',
                title: 'barrel water sensor',
                values: [
                    {
                        key: 'barrel top',
                        unit: 'barrel_switch',
                        value: switch1 ? 'wet' : 'dry'
                    }
                ]
            };

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShed}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    barrel_bot: {
        topic: `stat/${topicShed}/RESULT`,
        statusKey: 'barrel_bot',
        statusHndlr: (status: never): IStatusResult => {

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

            return {
                statusKey: 'barrel_bot',
                title: 'barrel water sensor',
                values: [
                    {
                        key: 'barrel bot',
                        unit: 'barrel_switch',
                        value: switch2 ? 'wet' : 'dry'
                    }
                ]
            };

        },
        initialize: () => {
            // nothing
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
        lights: [],
        sprites: [],
        actTo: -1
    },
    status_pure_1: {
        statusKey: 'status_pure_1',
        statusHndlr: (): IStatusResult => {
            // nothing, just a container for lines
            return {
                statusKey: 'status_pure_1',
                title: 'air purifier indicator',
                values: []
            };
        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            // nothing
        },
        faces: [],
        sgmts: [],
        lines: [],
        texts: [],
        lights: [],
        sprites: [],
        actTo: -1
    },
    switch_pure_1: {
        topic: `stat/${topicPure1}/RESULT`,
        statusKey: 'switch_pure_1',
        statusHndlr: (status: never): IStatusResult => {

            // console.log('switch_pure_1 :: statusHndlr', status)

            POWER_PURE_1 = status['POWER'] && status['POWER'] === 'ON';

            STATUS_HANDLERS['status_pure_1'].faces.forEach(face => {
                face.visible = POWER_PURE_1;
            });
            STATUS_HANDLERS['status_pure_1'].sgmts.forEach(sgmt => {
                sgmt.visible = POWER_PURE_1;
            });

            invalidate();

            return {
                statusKey: 'switch_pure_1',
                title: 'air purifier',
                values: [],
                switch: {
                    status: POWER_PURE_1
                }
            };

        },
        initialize: () => {

            STATUS_HANDLERS['status_pure_1'].faces.forEach(face => {
                face.visible = false;
            });
            STATUS_HANDLERS['status_pure_1'].sgmts.forEach(sgmt => {
                sgmt.visible = false;
            });

        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPure1}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        switchProps: {
            // title: 'air purifier',
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
        lights: [],
        sprites: [],
        actTo: -1
    },
    switch_pump_1: {
        topic: `stat/${topicPump}/RESULT`,
        statusKey: 'switch_pump_1',
        statusHndlr: (status: never): IStatusResult => {

            // console.log('switch_pump_1 :: statusHndlr', status)

            if (status['POWER1']) {
                POWER_PUMP_1 = status['POWER1'] === 'ON';
                setBarrelTopColors();
            }

            return {
                statusKey: 'switch_pump_1',
                title: 'ground ⤴ barrel',
                values: [],
                switch: {
                    status: POWER_PUMP_1
                }
            };

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        switchProps: {
            // title: 'ground ⤴ barrel',
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
        lights: [],
        sprites: [],
        actTo: -1
    },
    switch_pump_2: {
        topic: `stat/${topicPump}/RESULT`,
        statusKey: 'switch_pump_2',
        statusHndlr: (status: never): IStatusResult => {

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

                const statusHandlerKeys: TStatusKey[] = ['switch_pump_2', 'switch_pump_3'];
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

                // return POWER_PUMP_2 ? 'ON' : 'OFF';

            }

            return {
                statusKey: 'switch_pump_2',
                title: 'barrel ⤳ garden',
                values: [],
                switch: {
                    status: POWER_PUMP_2
                }
            };

        },
        initialize: () => {
            // nothing
        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPump}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }
        },
        switchProps: {
            // title: 'barrel ⤳ garden',
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
        lights: [],
        sprites: [],
        actTo: -1
    },
    switch_pump_3: {
        topic: `stat/${topicPump}/RESULT`,
        statusKey: 'switch_pump_3',
        statusHndlr: (status: never): IStatusResult => {

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

                // return POWER_PUMP_3 ? 'ON' : 'OFF';

            }

            return {
                statusKey: 'switch_pump_3',
                title: 'barrel ⤳ pump1',
                values: [],
                switch: {
                    status: POWER_PUMP_3
                }
            };

        },
        initialize: () => {
            // nothing
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
        lights: [],
        sprites: [],
        actTo: -1
    }
}