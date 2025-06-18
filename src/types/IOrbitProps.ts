import { Vector3 } from "three";
import { IConfirmProps } from "./IConfirmProps";

export interface ICameraProps {
  apply: (posistion: Vector3, target: Vector3) => void;
  equals: (posistion: Vector3, target: Vector3) => boolean;
}

export type TCameraKey = 'pumps' | 'home' | 'quarter' | 'user';

export const CAMERA_POSITIONS: { [K in TCameraKey]: Vector3 } = {
  'pumps': new Vector3(-8.151666681268697, 4.0703936745272955, -2.4322886971611197),
  'home': new Vector3(-27.11462252850753, 7.170372208075888, 3.3851106655435768),
  'quarter': new Vector3(-30.45090193818403, 14.736196882882762, -36.08947504792695),
  'user': new Vector3()
}

export const CAMERA_TARGETS: { [K in TCameraKey]: Vector3 } = {
  'pumps': new Vector3(-7.995836074067476, -1.4606985542355526, -13.10672209292114),
  'home': new Vector3(-4.857485561634025, 1.392515836707786, -4.783590931805891),
  'quarter': new Vector3(-4.473854194388395, 2.363560431817357, -5.589525052934382),
  'user': new Vector3()
}

const tolerance = 0.1;

export const CAMERA_PROPS: { [K in TCameraKey]: ICameraProps } = {
  'pumps': {
    apply: (posistion: Vector3, target: Vector3) => {
      posistion.set(CAMERA_POSITIONS['pumps'].x, CAMERA_POSITIONS['pumps'].y, CAMERA_POSITIONS['pumps'].z);
      target.set(CAMERA_TARGETS['pumps'].x, CAMERA_TARGETS['pumps'].y, CAMERA_TARGETS['pumps'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      // const lengthP = posistion.clone().sub(CAMERA_POSITIONS['pumps'].clone()).length();
      // const lengthT = target.clone().sub(CAMERA_TARGETS['pumps'].clone()).length();
      // console.log(lengthP, posistion, CAMERA_POSITIONS['pumps']);
      // console.log(lengthT, target, CAMERA_TARGETS['pumps']);
      return posistion.clone().sub(CAMERA_POSITIONS['pumps'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['pumps'].clone()).length() < tolerance;
    }
  },
  'home': {
    apply: (posistion: Vector3, target: Vector3) => {
      posistion.set(CAMERA_POSITIONS['home'].x, CAMERA_POSITIONS['home'].y, CAMERA_POSITIONS['home'].z);
      target.set(CAMERA_TARGETS['home'].x, CAMERA_TARGETS['home'].y, CAMERA_TARGETS['home'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['home'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['home'].clone()).length() < tolerance;
    }
  },
  'quarter': {
    apply: (posistion: Vector3, target: Vector3) => {
      posistion.set(CAMERA_POSITIONS['quarter'].x, CAMERA_POSITIONS['quarter'].y, CAMERA_POSITIONS['quarter'].z);
      target.set(CAMERA_TARGETS['quarter'].x, CAMERA_TARGETS['quarter'].y, CAMERA_TARGETS['quarter'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['quarter'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['quarter'].clone()).length() < tolerance;
    }
  },
  'user': {
    apply: () => {
      // do nothing
    },
    equals: () => {
      return false; // always false
    }
  }
}

export interface IOrbitProps {
  id: string;
  stamp: string;
  cameraKey: TCameraKey;
  clipPlane: number;
  handleConfirmProps: (confirmProps: IConfirmProps | undefined) => void;
  handleCameraKey: (cameraKey: TCameraKey) => void;
  handleWorldFocusDistance: (worldFocusDistance: number) => void;
}
