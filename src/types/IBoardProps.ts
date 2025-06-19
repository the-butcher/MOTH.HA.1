import { IConfirmProps } from "./IConfirmProps";
import { TCameraKey } from "./IOrbitProps";
import { ISunProps } from "./ISunProps";

export interface IBoardProps {
  sun: ISunProps,
  confirmProps?: IConfirmProps; // for when a confirm is supposed to be rendered
  cameraKey: TCameraKey; // current camera key
  // handleClipPlane: (clipPlane: number) => void;
  handleSunInstant: (sunInstant: number) => void;
  handleCameraKey: (cameraKey: TCameraKey) => void;
}
