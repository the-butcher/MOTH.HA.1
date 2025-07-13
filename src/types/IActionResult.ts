import { THandlerKey } from "./IStatusHandler";

export type TActionType = 'switch' | 'reset' | 'ledbox';
export type TLedboxStatus = 0 | 1 | 2 | 3;
export type TResetStatus = '';

export interface IActionResult<T extends TActionType, R> {
    handlerKey: THandlerKey;
    type: T;
    status: R;
}

export type TActionResultUnion = IActionResultReset | IActionResultSwitch | IActionResultLedbox;

export interface IActionResultReset extends IActionResult<'reset', TResetStatus> {
    handlerKey: THandlerKey;
    type: 'reset';
    status: TResetStatus;
}

export interface IActionResultSwitch extends IActionResult<'switch', boolean> {
    handlerKey: THandlerKey;
    type: 'switch';
    status: boolean;
}

export interface IActionResultLedbox extends IActionResult<'ledbox', TLedboxStatus> {
    handlerKey: THandlerKey;
    type: 'ledbox';
    status: TLedboxStatus;
    future: TLedboxStatus;
}