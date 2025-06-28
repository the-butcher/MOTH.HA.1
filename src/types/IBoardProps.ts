import { TPresetKey } from "./IOrbitProps";
import { THandlerKey } from "./IStatusHandler";
import { ISunProps } from "./ISunProps";

export interface IBoardProps {
  sun: ISunProps,
  selectKey: THandlerKey | undefined;
  presetKey: TPresetKey | undefined; // current preset key
  handleSunInstant: (sunInstant: number) => void;
  handlePresetKey: (presetKey: TPresetKey | undefined) => void;
  handleSelectKey: (selectKey: THandlerKey | undefined) => void;
  handleToggleStats: () => void;
}
