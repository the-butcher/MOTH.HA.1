import { TPresetKey } from "./IOrbitProps";
import { TStatusHandlerKey } from "./IStatusHandler";
import { ISunProps } from "./ISunProps";

export interface IBoardProps {
  sun: ISunProps,
  selectKey: TStatusHandlerKey | undefined;
  presetKey: TPresetKey | undefined; // current preset key
  handleSunInstant: (sunInstant: number) => void;
  handlePresetKey: (presetKey: TPresetKey | undefined) => void;
  handleSelectKey: (selectKey: TStatusHandlerKey | undefined) => void;
}
