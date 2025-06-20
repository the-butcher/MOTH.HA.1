import mqtt, { MqttClient } from 'mqtt';
import { IStatusHandler, STATUS_HANDLERS, TStatusHandlerKey } from '../types/IStatusHandler';

export interface IBoardHandler {
    topic?: string;
    value?: string;
    handleResult: (result: boolean) => void;
}

export class MqttUtil {

    public static MQTT_CLIENT: MqttClient;

    /**
     * references to handlers, primarily taking care of 3d representation
     */
    static HANDLERS_BY_TOPIC: { [K in string]: IStatusHandler[] } = {};
    static BOARD_HANDLER: IBoardHandler | undefined;

    static setBoardHandler(boardHandler: IBoardHandler): void {
        MqttUtil.BOARD_HANDLER = boardHandler;
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
                const handler = STATUS_HANDLERS[handlerKey as TStatusHandlerKey];
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
                // console.log(`Received Message: ${message} On topic: ${topic}`);
                if (MqttUtil.HANDLERS_BY_TOPIC[topic]) {
                    MqttUtil.HANDLERS_BY_TOPIC[topic].forEach(handler => {
                        const result = handler.statusHndlr(status as never);
                        if (this.BOARD_HANDLER?.topic === topic && this.BOARD_HANDLER?.value === handler.value && result) {
                            console.log('topic', topic, 'value', handler.value, 'status', status, 'result', result);
                            this.BOARD_HANDLER.handleResult(result === 'ON');
                        }
                    });
                }
            });

            // issue any triggering messages for initial state
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as TStatusHandlerKey];
                handler.statusQuery('STARTUP');
            });

        });

    }

}

