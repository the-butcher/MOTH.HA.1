import { THandlerKey } from "./IStatusHandler";

export type TActionResult = 'switch' | 'reset';

export interface IActionResult<T extends TActionResult, R> {
    handlerKey: THandlerKey;
    type: T;
    status: R;
}

export type ActionResultUnion = IActionResultReset | IActionResultSwitch;

export interface IActionResultReset extends IActionResult<'reset', string> {
    handlerKey: THandlerKey;
    type: 'reset';
    status: string;
}

export interface IActionResultSwitch extends IActionResult<'switch', boolean> {
    handlerKey: THandlerKey;
    type: 'switch';
    status: boolean;
}