import { TRecordKey } from "./IRecord";

export interface IGaugeProps {
    sensorId: string;
    roomId: string;
    recordKey: TRecordKey;
    value: number;
}