import mqtt, { MqttClient } from 'mqtt';
import { IStatusHandler, IStatusResult, STATUS_HANDLERS, TStatusKey } from '../types/IStatusHandler';


export interface IBoardHandler {
    statusKey: string;
    handleResult: (result: IStatusResult) => void;
}

export class MqttUtil {

    public static MQTT_CLIENT: MqttClient;

    /**
     * last known stati by status key
     */
    static RESULTS_BY_KEY: { [K: string]: IStatusResult } = {};

    /**
     * references to handlers, primarily taking care of 3d representation
     */
    static HANDLERS_BY_TOPIC: { [K in string]: IStatusHandler[] } = {};
    static BOARD_HANDLER: IBoardHandler | undefined;

    static setBoardHandler(boardHandler: IBoardHandler): void {
        MqttUtil.BOARD_HANDLER = boardHandler;
        if (this.RESULTS_BY_KEY[boardHandler.statusKey]) {
            boardHandler.handleResult(this.RESULTS_BY_KEY[boardHandler.statusKey]);
        }
    }

    static clearBoardHandler(): void {
        MqttUtil.BOARD_HANDLER = undefined;
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
                const handler = STATUS_HANDLERS[handlerKey as TStatusKey];
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
            });

            this.MQTT_CLIENT.on('message', (topic, message) => {
                const status = JSON.parse(message.toString());
                if (MqttUtil.HANDLERS_BY_TOPIC[topic]) {
                    MqttUtil.HANDLERS_BY_TOPIC[topic].forEach(handler => {
                        const result = handler.statusHndlr(status as never);
                        this.RESULTS_BY_KEY[handler.statusKey] = result;
                        if (this.BOARD_HANDLER?.statusKey === handler.statusKey) {
                            // console.log('topic', topic, 'value', handler.value, 'status', status, 'result', result);
                            this.BOARD_HANDLER.handleResult(result);
                        }
                    });
                }
            });

            // initialize all handlers
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as TStatusKey];
                handler.initialize();
            });

            // query handler stati (if the handler has implemented it)
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as TStatusKey];
                handler.statusQuery('STARTUP');
            });

        });

    }

}

