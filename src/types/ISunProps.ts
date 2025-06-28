import { SpotLight } from "three";

export interface ISunProps {
  sunriseInstant: number;
  sunsetInstant: number;
  sunInstant: number
  lights: SpotLight[];
}
