import { Vector3 } from "three";
import { IConfirmProps } from "./IConfirmProps";

export interface ICameraProps {
  apply: (posistion: Vector3, target: Vector3) => void;
  equals: (posistion: Vector3, target: Vector3) => boolean;
}

export type TCameraKey = 'pumps' | 'home' | 'quarter' | 'user';

export const CAMERA_POSITIONS: { [K in TCameraKey]: Vector3 } = {
  'pumps': new Vector3(-8.267770135658687, 4.8086158348320724, 1.3546789531281878),
  'home': new Vector3(-45.103139533877865, 12.40505417958047, -3.340202979929243),
  'quarter': new Vector3(-53.172083123771564, 132.55506642815183, 9.811176581449974),
  'user': new Vector3()
}

export const CAMERA_TARGETS: { [K in TCameraKey]: Vector3 } = {
  'pumps': new Vector3(-7.049997379630604, -0.6834751064135369, -11.314080010311438),
  'home': new Vector3(-4.314651979439628, 1.8449880211182899, -6.257759581240546),
  'quarter': new Vector3(-2.2059846503016374, -0.49999997588496337, 3.7697885110909604),
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
  handleConfirmProps: (confirmProps: IConfirmProps | undefined) => void;
  handleCameraKey: (cameraKey: TCameraKey) => void;
}
