import { TActionResultUnion } from "./IActionResult";
import { THandlerKey } from "./IStatusHandler";
import { IStatusValue } from "./IStatusValue";

export interface IStatusResult {
    handlerKey: THandlerKey;
    values: IStatusValue[];
    actions: TActionResultUnion[];
}