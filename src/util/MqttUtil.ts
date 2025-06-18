import mqtt, { MqttClient } from 'mqtt';
import { IStatusHandler, STATUS_HANDLERS, TStatusHandlerKey } from '../types/IStatusHandler';

export class MqttUtil {

    public static MQTT_CLIENT: MqttClient;

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
            const handlersByTopic: { [K in string]: IStatusHandler[] } = {};
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as TStatusHandlerKey];
                // first handler for this topic?
                if (handler.statusTopic) {
                    if (!handlersByTopic[handler.statusTopic]) {
                        handlersByTopic[handler.statusTopic] = []; // bucket to store any handlers subscribing to the same topic
                        this.MQTT_CLIENT.subscribe(handler.statusTopic, { qos: 0 }); // subscribe to this topic
                        // console.log('subscribing to topic', handler.statusTopic);
                    }
                    // add to handlers
                    handlersByTopic[handler.statusTopic].push(handler);
                }
            });

            this.MQTT_CLIENT.on('message', (topic, message) => {
                const status = JSON.parse(message.toString());
                // console.log(`Received Message: ${message} On topic: ${topic}`);
                if (handlersByTopic[topic]) {
                    handlersByTopic[topic].forEach(handler => {
                        handler.statusHndlr(status as never);
                    });
                }
            });

            // issue any triggering messages for initial state
            handlerKeys.forEach(handlerKey => {
                const handler = STATUS_HANDLERS[handlerKey as TStatusHandlerKey];
                handler.statusQuery();
            });

        });

    }

}

