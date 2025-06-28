import mqtt, { MqttClient } from 'mqtt';
import { IStatusHandler, STATUS_HANDLERS, THandlerKey } from '../types/IStatusHandler';
import { IStatusResult } from '../types/IStatusResult';


export interface IBoardHandler {
    handlerKey: string;
    handleResult: (result: IStatusResult) => void;
}

export class MqttUtil {

    public static MQTT_CLIENT: MqttClient;

    /**
     * last known stati by status key
     */
    public static RESULTS_BY_KEY: { [K: string]: IStatusResult } = {};

    /**
     * references to handlers, primarily taking care of 3d representation
     */
    static HANDLERS_BY_TOPIC: { [K in string]: IStatusHandler[] } = {};
    public static BOARD_HANDLERS: IBoardHandler[] = [];

    static addBoardHandler(boardHandler: IBoardHandler): void {
        MqttUtil.BOARD_HANDLERS.push(boardHandler);
        if (this.RESULTS_BY_KEY[boardHandler.handlerKey]) {
            boardHandler.handleResult(this.RESULTS_BY_KEY[boardHandler.handlerKey]);
        }
    }

    static clearBoardHandlers(): void {
        MqttUtil.BOARD_HANDLERS = [];
    }

    static setupHandler(handler: IStatusHandler): void {
        // first handler for this topic?
        if (handler.topic) {
            if (!MqttUtil.HANDLERS_BY_TOPIC[handler.topic]) {
                MqttUtil.HANDLERS_BY_TOPIC[handler.topic] = []; // bucket to store any handlers subscribing to the same topic
                this.MQTT_CLIENT.subscribe(handler.topic, { qos: 0 }); // subscribe to this topic
                // console.log('subscribing to topic', handler.statusTopic);
            }
            // add to handlers
            MqttUtil.HANDLERS_BY_TOPIC[handler.topic].push(handler);
        }
    }

    static setup(): void {

        // console.log('initMqtt');

        this.MQTT_CLIENT = mqtt.connect('ws://192.168.0.38', {
            port: 8083,
            username: 'mqtt',
            password: 'mqttee'
        });
        // console.log('mqttClient', this.MQTT_CLIENT);

        this.MQTT_CLIENT.on('connect', () => {

            // console.log(`mqtt connected`);

            const handlerKeys = Object.keys(STATUS_HANDLERS);

            // console.log('collecting handlers by topic');

            handlerKeys.forEach(handlerKey => {
                MqttUtil.setupHandler(STATUS_HANDLERS[handlerKey as THandlerKey]);
            });

            this.MQTT_CLIENT.on('message', (topic, message) => {
                const statusJson = JSON.parse(message.toString());
                if (MqttUtil.HANDLERS_BY_TOPIC[topic]) {
                    MqttUtil.HANDLERS_BY_TOPIC[topic].forEach(handler => {
                        const result = handler.handleStatus(statusJson as never); // let the handler process the result
                        if (result) {
                            this.RESULTS_BY_KEY[handler.handlerKey] = result; // store a copy of the result
                            this.BOARD_HANDLERS.forEach(b => {
                                if (b.handlerKey === handler.handlerKey) {
                                    b.handleResult(result);
                                }
                            });
                        }
                    });
                }
            });

            // query handler stati (if the handler has implemented it)
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as THandlerKey];
                handler.statusQuery('STARTUP');
            });

        });

    }

}

