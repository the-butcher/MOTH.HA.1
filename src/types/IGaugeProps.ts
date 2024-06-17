import { TRecordKey } from "./IRecord";

export interface IGaugeProps {
    height: number;
    sensorId: string;
    roomId: string;
    recordKeys: TRecordKey[]; // possible recordKeys
    recordKeyObj: TRecordKey; // current recordKay (which may not be in the list above, therefore requiring fallback action)
    recordKeyApp: TRecordKey;
    selected: boolean;
    recent: number[];
}