import { TPresetKey } from "./IOrbitProps";
import { TStatusKey } from "./IStatusHandler";
import { ISunProps } from "./ISunProps";

export interface IBoardProps {
  sun: ISunProps,
  selectKey: TStatusKey | undefined;
  presetKey: TPresetKey | undefined; // current preset key
  handleSunInstant: (sunInstant: number) => void;
  handlePresetKey: (presetKey: TPresetKey | undefined) => void;
  handleSelectKey: (selectKey: TStatusKey | undefined) => void;
  handleToggleStats: () => void;
}
