import { SpotLight } from "three";

export interface ISunProps {
  sunriseInstant: number;
  sunsetInstant: number;
  sunInstant: number
  lights: SpotLight[];
}

// /**
//  * definition for extra lights
//  */
// export interface ILightProps {
//   position: Vector3;
// }
