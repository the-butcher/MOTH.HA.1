import { TActionType, TLedboxStatus, TResetStatus } from "./IActionResult";

export interface IClientCoordinate {
    clientX: number;
    clientY: number;
}

export type THandlerActionUnion = IHandlerActionReset | IHandlerActionSwitch | IHandlerActionLedbox;


export interface IHandlerAction<T extends TActionType, R> {
    type: T
    /**
     * create visual selection in 3d display
     * @returns
     */
    focus: () => void;
    /**
     * clear visual selection in 3d display
     * @returns
     */
    blur: () => void;
    execute: (param: R) => void;
}

export interface IHandlerActionReset extends IHandlerAction<'reset', TResetStatus> {
    type: 'reset';
}

export interface IHandlerActionSwitch extends IHandlerAction<'switch', boolean> {
    type: 'switch';
}

export interface IHandlerActionLedbox extends IHandlerAction<'ledbox', TLedboxStatus> {
    type: 'ledbox';
}