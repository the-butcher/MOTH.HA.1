import { invalidate } from "@react-three/fiber";
import { Group, LineSegments, Mesh, Object3D, SpotLight } from "three";
import { Line2 } from "three/examples/jsm/Addons.js";
import { MaterialRepo } from "../util/MaterialRepo";
import { MqttUtil } from "../util/MqttUtil";
import { PolygonUtil } from "../util/PolygonUtil";
import { WeatherUtil } from "../util/WeatherUtil";
import { COLOR_DESCRIPTIONS, IColorDescription, TColorKey } from "./IColorDescription";
import { IStatusResult } from "./IStatusResult";
import { ISwitchAction } from "./ISwitchAction";
import { IWeatherForecast } from "./IWeatherForecast";

export type THandlerKey =
    'weather___' |
    'light_01' |
    'light_02' |
    'moth____66' |
    'moth___178' |
    'moth___130' |
    'moth_295D3' |
    'barrel_cnt' |
    'barrel_top' |
    'barrel_bot' |
    'status_pure_1' |
    'switch_pure_1' |
    'switch_pump_1' |
    'switch_pump_2' |
    'switch_pump_3';
export type TQueryTime = 'STARTUP' | 'RUNTIME'
export type TUnit =
    'barrel_switch' |
    'volume_liters' |
    'co2_ppm' |
    'temperature_celsius' |
    'humidity_relative' |
    'battery_percent' |
    'radiation_microsivert_per_hour' |
    'pressure_hectopascal' |
    'pm_microgram_per_cube_meter'

export interface IStatusHandler {
    handlerKey: THandlerKey;
    dependencyKeys: THandlerKey[];
    topic?: string; // the url to get this elements status from (other elements may use the same url, only one call shall be made)
    title: string;
    /**
     * initialize this handler (i.e. create some 3d elements if needed)
     * @returns
     */
    initialize: () => void;
    handleStatus: (status: never) => IStatusResult | undefined; // todo some container that holds all instances (Meshes) that a specific status may apply to
    statusQuery: (queryTime: TQueryTime) => void;
    action?: ISwitchAction;
    faces: Mesh[];
    sgmts: LineSegments[];
    lines: Line2[];
    texts: Group[];
    lights: SpotLight[];
    sprites: Object3D[];
    actTo: number;
}

const topicPure1 = 'plug_150';
const topicPumpN = 'plug_153';
const topicShedN = 'shed_024';

let VALUE_COUNTER_1 = 0;
// let LITER_COUNTER_1 = 0;
let POWER____PURE_1 = false;
let POWER____PUMP_1 = false;
let POWER____PUMP_2 = false;
let POWER____PUMP_3 = false;
export const POWER_LIGHTS: { [K: string]: boolean } = {};
const counter1Min = 225;

const setVisible = (statusHandler: THandlerKey, visible: boolean) => {

    STATUS_HANDLERS[statusHandler].faces.forEach(face => {
        face.visible = visible;
    });
    STATUS_HANDLERS[statusHandler].sgmts.forEach(sgmt => {
        sgmt.visible = visible;
    });

}


const setBarrelTopColors = () => {

    // console.log('setBarrelTopColors', STATUS_COUNTER_1);

    let colorDescFace = COLOR_DESCRIPTIONS['face_gray___clip_none'];
    let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray___clip_none'];

    if (POWER____PUMP_1) {

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

const createLightHandler = (handlerKey: THandlerKey): IStatusHandler => {
    return {
        topic: handlerKey,
        handlerKey: handlerKey,
        dependencyKeys: [],
        title: handlerKey,
        handleStatus: () => {

            const colorDesc: IColorDescription = POWER_LIGHTS[handlerKey] ? COLOR_DESCRIPTIONS['face_gray___clip__245'] : {
                ...COLOR_DESCRIPTIONS['face_gray___clip__245'],
                opacity: 0.5
            }

            STATUS_HANDLERS[handlerKey].lights.forEach(light => {
                light.visible = POWER_LIGHTS[handlerKey];
            });
            STATUS_HANDLERS[handlerKey].faces.forEach(face => {
                face.material = MaterialRepo.getMaterialFace(colorDesc);
                if (POWER_LIGHTS[handlerKey]) {
                    // (face.material as MeshLambertMaterial).emissive = new Color(colorDesc.rgb);
                    // (face.material as MeshLambertMaterial).emissiveIntensity = 1;
                }
            });
            invalidate();

            const statusResult: IStatusResult = {
                handlerKey: handlerKey,
                actions: [
                    {
                        handlerKey: handlerKey,
                        type: 'switch',
                        status: POWER_LIGHTS[handlerKey]
                    }],
                values: []
            };

            // fake MQTT behaviour
            MqttUtil.RESULTS_BY_KEY[handlerKey] = statusResult;
            MqttUtil.BOARD_HANDLERS.forEach(b => {
                if (b.handlerKey === handlerKey) {
                    b.handleResult(statusResult);
                }
            });
            return statusResult;

        },
        initialize: () => {
            POWER_LIGHTS[handlerKey] = true;
            STATUS_HANDLERS[handlerKey].handleStatus({} as never);
        },
        statusQuery: () => {
            // nothing
        },
        action: {
            // title: 'air purifier',
            action: () => {
                POWER_LIGHTS[handlerKey] = !POWER_LIGHTS[handlerKey];
                STATUS_HANDLERS[handlerKey].handleStatus({} as never);
            },
            focus: () => {
                const colorDesc = COLOR_DESCRIPTIONS['line_blue___clip__245'];
                STATUS_HANDLERS[handlerKey].lines.forEach(line => {
                    line.material = MaterialRepo.getMaterialLine(colorDesc);
                });
            },
            blur: () => {
                const colorDesc = COLOR_DESCRIPTIONS['line_gray___clip__245'];
                STATUS_HANDLERS[handlerKey].lines.forEach(line => {
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

export const STATUS_HANDLERS: { [K in THandlerKey]: IStatusHandler } = {
    weather___: {
        handlerKey: 'weather___',
        dependencyKeys: [],
        title: 'weather forecast',
        handleStatus: (status: IWeatherForecast) => {

            const deg = status['temperature'].toFixed(1);

            window.clearTimeout(STATUS_HANDLERS['weather___'].actTo);
            STATUS_HANDLERS['weather___'].actTo = window.setTimeout(async () => {
                WeatherUtil.renderForecast(status);
                PolygonUtil.createTextMesh(`${deg}°C - ${status.weathercode}`, STATUS_HANDLERS['weather___'].texts[2], COLOR_DESCRIPTIONS['face_gray___clip_none']);

            }, 500);

            return {
                handlerKey: 'weather___',
                values: [
                    {
                        key: 'temperature (°C)',
                        unit: 'temperature_celsius',
                        value: deg
                    }
                ],
                actions: []
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
        handlerKey: 'moth_295D3',
        dependencyKeys: [],
        title: 'aranet radiation',
        handleStatus: (status: never) => {

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
                handlerKey: 'moth_295D3',
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
                ],
                actions: []
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
        handlerKey: 'moth____66',
        dependencyKeys: [],
        title: 'moth CO₂ sensor',
        handleStatus: (status: never) => {

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
                PolygonUtil.createTextMesh(`${deg.toFixed(1)}°C`, STATUS_HANDLERS['moth____66'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg], 'moth____66');
                invalidate();
            }, 500);

            return {
                handlerKey: 'moth____66',
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
                ],
                actions: []
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
        handlerKey: 'moth___178',
        dependencyKeys: [],
        title: 'moth CO₂ sensor',
        handleStatus: (status: never) => {

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
                PolygonUtil.createTextMesh(`${deg.toFixed(1)}°C`, STATUS_HANDLERS['moth___178'].texts[0], COLOR_DESCRIPTIONS[colorDescKeyDeg], 'moth___178');
                invalidate();
            }, 500);

            return {
                handlerKey: 'moth___178',
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
                ],
                actions: []
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
        handlerKey: 'moth___130',
        dependencyKeys: [],
        title: 'moth PM sensor',
        handleStatus: (status: never) => {

            const pm010 = status['pm010'] as number;
            const pm025 = status['pm025'] as number;
            const pm100 = status['pm100'] as number;

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
                handlerKey: 'moth___130',
                values: [
                    {
                        key: 'PM1.0 (µg/m³)',
                        unit: 'pm_microgram_per_cube_meter',
                        value: pm010.toFixed(0)
                    },
                    {
                        key: 'PM2.5 (µg/m³)',
                        unit: 'pm_microgram_per_cube_meter',
                        value: pm025.toFixed(0)
                    },
                    {
                        key: 'PM10.0 (µg/m³)',
                        unit: 'pm_microgram_per_cube_meter',
                        value: pm100.toFixed(0)
                    }
                ],
                actions: []
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
        topic: `stat/${topicShedN}/RESULT`,
        handlerKey: 'barrel_cnt',
        dependencyKeys: [],
        title: 'barrel water counter',
        handleStatus: (status: never) => {

            // console.log('barrel_cnt :: statusHndlr', status)

            if ('Counter1' in status || 'Var1' in status) { // need to check with "in" or would be falsy for 0 (zero) values otherwise

                // console.log('barrel_cnt :: handling')

                if ('Counter1' in status) {
                    VALUE_COUNTER_1 = status['Counter1'];
                } else {
                    VALUE_COUNTER_1 = parseInt(status['Var1']);
                }

                setBarrelTopColors();

                // has no graphical representation
                const result: IStatusResult = {
                    handlerKey: 'barrel_cnt',
                    values: [
                        {
                            key: 'pumped liters',
                            unit: 'volume_liters',
                            value: VALUE_COUNTER_1 > 0 ? `~ ${(VALUE_COUNTER_1 / 350).toFixed(0)}` : '0'
                        }
                    ],
                    actions: [{
                        handlerKey: 'barrel_cnt',
                        type: 'reset',
                        status: ''
                    }]
                };
                return result;

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShedN}/Counter1`, '+0', { qos: 0, retain: false });
        },
        action: {
            action: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShedN}/Counter1`, '0', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            focus: () => {
                // nothing
            },
            blur: () => {
                // nothing
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
    barrel_top: {
        topic: `stat/${topicShedN}/RESULT`,
        handlerKey: 'barrel_top',
        dependencyKeys: [],
        title: 'barrel water sensor',
        handleStatus: (status: never) => {

            // console.log('barrel_top :: statusHndlr', status)

            const switch1 = status['POWER1']; // when ON the barrel is completely full
            if (switch1) {

                // console.log('barrel_top handler', switch1, status);

                const colorDesc = switch1 === 'ON' ? COLOR_DESCRIPTIONS['face_blue___clip_none'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                const colorDescSgmt = switch1 === 'ON' ? COLOR_DESCRIPTIONS['sgmt_blue_noclip'] : COLOR_DESCRIPTIONS['face_gray___clip_none'];
                STATUS_HANDLERS['barrel_top'].faces.forEach(face => {
                    face.material = MaterialRepo.getMaterialFace(colorDesc);
                });
                STATUS_HANDLERS['barrel_top'].sgmts.forEach(sgmt => {
                    sgmt.material = MaterialRepo.getMaterialSgmt(colorDescSgmt);
                });
                invalidate();

                return {
                    handlerKey: 'barrel_top',
                    values: [
                        {
                            key: 'barrel top',
                            unit: 'barrel_switch',
                            value: switch1 === 'ON' ? 'wet' : 'dry'
                        }
                    ],
                    actions: []
                };

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShedN}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
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
        topic: `stat/${topicShedN}/RESULT`,
        handlerKey: 'barrel_bot',
        dependencyKeys: [],
        title: 'barrel water sensor',
        handleStatus: (status: never) => {

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

                return {
                    handlerKey: 'barrel_bot',
                    values: [
                        {
                            key: 'barrel bot',
                            unit: 'barrel_switch',
                            value: switch2 === 'ON' ? 'wet' : 'dry'
                        }
                    ],
                    actions: []
                };

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicShedN}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT
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
        handlerKey: 'status_pure_1',
        dependencyKeys: [],
        title: 'air purifier indicator',
        handleStatus: () => {
            // nothing, just a container for lines
            return {
                handlerKey: 'status_pure_1',
                values: [],
                actions: []
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
        handlerKey: 'switch_pure_1',
        dependencyKeys: [],
        title: 'air purifier',
        handleStatus: (status: never) => {

            // console.log('switch_pure_1 :: statusHndlr', status)

            POWER____PURE_1 = status['POWER'] && status['POWER'] === 'ON';

            STATUS_HANDLERS['status_pure_1'].faces.forEach(face => {
                face.visible = POWER____PURE_1;
            });
            STATUS_HANDLERS['status_pure_1'].sgmts.forEach(sgmt => {
                sgmt.visible = POWER____PURE_1;
            });

            invalidate();

            return {
                handlerKey: 'switch_pure_1',
                values: [],
                actions: [
                    {
                        handlerKey: 'switch_pure_1',
                        type: 'switch',
                        status: POWER____PURE_1
                    }
                ]
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
        action: {
            // title: 'air purifier',
            action: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPure1}/Power`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            focus: () => {
                STATUS_HANDLERS['switch_pure_1'].lines.forEach(line => {
                    line.visible = true;
                });
            },
            blur: () => {
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
        topic: `stat/${topicPumpN}/RESULT`,
        handlerKey: 'switch_pump_1',
        dependencyKeys: [
            'barrel_cnt'
        ],
        title: 'ground ⤴ barrel',
        handleStatus: (status: never) => {

            // console.log('switch_pump_1 :: statusHndlr', status)

            if (status['POWER1']) {

                POWER____PUMP_1 = status['POWER1'] === 'ON';
                setBarrelTopColors();

                return {
                    handlerKey: 'switch_pump_1',
                    values: [],
                    actions: [
                        {
                            handlerKey: 'switch_pump_1',
                            type: 'switch',
                            status: POWER____PUMP_1
                        }
                    ]
                };

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: () => {
            MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPumpN}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
        },
        action: {
            // title: 'ground ⤴ barrel',
            action: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPumpN}/Power1`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            focus: () => {
                STATUS_HANDLERS['switch_pump_1'].lines.forEach(line => {
                    line.visible = true;
                });
            },
            blur: () => {
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
        topic: `stat/${topicPumpN}/RESULT`,
        handlerKey: 'switch_pump_2',
        dependencyKeys: [],
        title: 'barrel ⤳ garden',
        handleStatus: (status: never) => {

            // console.log('switch_pump_2 :: statusHndlr', status)

            if (status['POWER2']) {

                let colorDescFace = COLOR_DESCRIPTIONS['face_gray___clip_none'];
                let colorDescSgmt = COLOR_DESCRIPTIONS['line_gray___clip_none'];
                // let colorDescLine = COLOR_DESCRIPTIONS['line_gray___clip__000_none'];

                POWER____PUMP_2 = status['POWER2'] === 'ON'; // when ON the barrel is completely full
                // console.log('POWER_PUMP_2', POWER_PUMP_2);
                if (POWER____PUMP_2) {

                    colorDescFace = COLOR_DESCRIPTIONS['face_blue___clip_none'];
                    colorDescSgmt = COLOR_DESCRIPTIONS['sgmt_blue_noclip'];
                    // colorDescLine = COLOR_DESCRIPTIONS['line_blue___clip_none'];

                }

                const statusHandlerKeys: THandlerKey[] = ['switch_pump_2', 'switch_pump_3'];
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

                return {
                    handlerKey: 'switch_pump_2',
                    values: [],
                    actions: [
                        {
                            handlerKey: 'switch_pump_2',
                            type: 'switch',
                            status: POWER____PUMP_2
                        }
                    ]
                };

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPumpN}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            }
        },
        action: {
            // title: 'barrel ⤳ garden',
            action: () => {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPumpN}/Power2`, 'TOGGLE', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
            },
            focus: () => {
                STATUS_HANDLERS['switch_pump_2'].lines.forEach(line => {
                    line.visible = true;
                });
            },
            blur: () => {
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
        topic: `stat/${topicPumpN}/RESULT`,
        handlerKey: 'switch_pump_3',
        dependencyKeys: [],
        title: 'barrel ⤳ pump1',
        handleStatus: (status: never) => {

            // console.log('switch_pump_3 :: statusHndlr', status);

            if (status['POWER3']) {

                POWER____PUMP_3 = status['POWER3'] === 'ON'; // when ON circling is active

                if (POWER____PUMP_3) {

                    setVisible('switch_pump_1', false);
                    setVisible('switch_pump_2', false);
                    setVisible('switch_pump_3', true);

                } else {

                    setVisible('switch_pump_1', true);
                    setVisible('switch_pump_2', true);
                    setVisible('switch_pump_3', false);

                }

                invalidate();

                return {
                    handlerKey: 'switch_pump_3',
                    values: [],
                    actions: [
                        {
                            handlerKey: 'switch_pump_3',
                            type: 'switch',
                            status: POWER____PUMP_3
                        }
                    ]
                };

            }

        },
        initialize: () => {
            // nothing
        },
        statusQuery: (queryTime: TQueryTime) => {
            if (queryTime === 'RUNTIME') {
                MqttUtil.MQTT_CLIENT.publish(`cmnd/${topicPumpN}/State`, '10', { qos: 0, retain: false }); // this should cause the device to publish a RESULT message
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