import { LineSegments, Mesh, Vector3 } from "three";
import { THandlerKey } from "./IStatusHandler";

export interface IPresetProps {
  clipPlane: number;
  faces: Mesh[];
  sgmts: LineSegments[];
  apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => void;
  equals: (posistion: Vector3, target: Vector3) => boolean;
}

export type TPresetKey = 'pumps' | 'home0' | 'home1' | 'home2' | 'home3' | 'quarter';

export const CAMERA_POSITIONS_PORTRAIT: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-2.606316550234446, 5.573445005196212, -2.574183676578704),
  'home0': new Vector3(-23.92, 23.10, -31.97),
  'home1': new Vector3(-23.92, 25.90, -31.97),
  'home2': new Vector3(-23.92, 28.70, -31.97),
  'home3': new Vector3(-23.92, 12.00, -31.97).multiplyScalar(1.4),
  'quarter': new Vector3(-58.40978634657678, 49.03004378500024, 8.717258495086595)
};

export const CAMERA_TARGETS_PORTRAIT: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-9.577474807034104, -2.5560233325780883, -16.300346163339597),
  'home0': new Vector3(-0.04, -2.70, -5.88),
  'home1': new Vector3(-0.04, 0.10, -5.88),
  'home2': new Vector3(-0.04, 2.90, -5.88),
  'home3': new Vector3(-0.04, 2.90, -5.88),
  'quarter': new Vector3(-4.459880176107357, 1.7651644464516436, -5.848431272387478)
};

export const CAMERA_POSITIONS_LANDSCAPE: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-2.606316550234446, 5.573445005196212, -2.574183676578704),
  'home0': new Vector3(-11.99, 10.21, -18.93).multiplyScalar(1.1),
  'home1': new Vector3(-11.99, 13.01, -18.93).multiplyScalar(1.1),
  'home2': new Vector3(-11.99, 15.81, -18.93).multiplyScalar(1.1),
  'home3': new Vector3(-11.99, 6.00, -18.93).multiplyScalar(1.4),
  'quarter': new Vector3(-58.40978634657678, 49.03004378500024, 8.717258495086595)
};

export const CAMERA_TARGETS_LANDSCAPE: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-9.577474807034104, -2.5560233325780883, -16.300346163339597),
  'home0': new Vector3(-0.05, -2.70, -5.88),
  'home1': new Vector3(-0.05, 0.10, -5.88),
  'home2': new Vector3(-0.05, 2.90, -5.88),
  'home3': new Vector3(-0.05, 0.90, -5.88),
  'quarter': new Vector3(-4.459880176107357, 1.7651644464516436, -5.848431272387478)
};

export const WFOCUS_TARGETS: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-8.055409469246245, -2.700001555476562, -13.210163558725592),
  'home0': new Vector3(0.36, -2.7, -6.18),
  'home1': new Vector3(0.36, 0.1, -6.18),
  'home2': new Vector3(0.36, 2.9, -6.18),
  'home3': new Vector3(-4.032296553887772, 3.0152412584874564, -6.685930244012403),
  'quarter': new Vector3(-4.032296553887772, 3.0152412584874564, -6.685930244012403)
};

const tolerance = 0.1;

const apply = (presetKey: TPresetKey, posistion: Vector3, target: Vector3, wFocus: Vector3) => {
  // console.log('screen', screen.orientation)
  if (screen.orientation.type.startsWith('portrait')) {
    posistion.set(CAMERA_POSITIONS_PORTRAIT[presetKey].x, CAMERA_POSITIONS_PORTRAIT[presetKey].y, CAMERA_POSITIONS_PORTRAIT[presetKey].z);
    target.set(CAMERA_TARGETS_PORTRAIT[presetKey].x, CAMERA_TARGETS_PORTRAIT[presetKey].y, CAMERA_TARGETS_PORTRAIT[presetKey].z);
  } else {
    posistion.set(CAMERA_POSITIONS_LANDSCAPE[presetKey].x, CAMERA_POSITIONS_LANDSCAPE[presetKey].y, CAMERA_POSITIONS_LANDSCAPE[presetKey].z);
    target.set(CAMERA_TARGETS_LANDSCAPE[presetKey].x, CAMERA_TARGETS_LANDSCAPE[presetKey].y, CAMERA_TARGETS_LANDSCAPE[presetKey].z);
  }
  wFocus.set(WFOCUS_TARGETS[presetKey].x, WFOCUS_TARGETS[presetKey].y, WFOCUS_TARGETS[presetKey].z);
}

export const PRESET_PROPS: { [K in TPresetKey]: IPresetProps } = {
  'pumps': {
    clipPlane: 0.2,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('pumps', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['pumps'].x, CAMERA_POSITIONS['pumps'].y, CAMERA_POSITIONS['pumps'].z);
      // target.set(CAMERA_TARGETS['pumps'].x, CAMERA_TARGETS['pumps'].y, CAMERA_TARGETS['pumps'].z);
      // wFocus.set(WFOCUS_TARGETS['pumps'].x, WFOCUS_TARGETS['pumps'].y, WFOCUS_TARGETS['pumps'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['pumps'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['pumps'].clone()).length() < tolerance;
    }
  },
  'home0': {
    clipPlane: 0.205,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('home0', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['home0'].x, CAMERA_POSITIONS['home0'].y, CAMERA_POSITIONS['home0'].z);
      // target.set(CAMERA_TARGETS['home0'].x, CAMERA_TARGETS['home0'].y, CAMERA_TARGETS['home0'].z);
      // wFocus.set(WFOCUS_TARGETS['home0'].x, WFOCUS_TARGETS['home0'].y, WFOCUS_TARGETS['home0'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['home0'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['home0'].clone()).length() < tolerance;
    }
  },
  'home1': {
    clipPlane: 3.005,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('home1', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['home1'].x, CAMERA_POSITIONS['home1'].y, CAMERA_POSITIONS['home1'].z);
      // target.set(CAMERA_TARGETS['home1'].x, CAMERA_TARGETS['home1'].y, CAMERA_TARGETS['home1'].z);
      // wFocus.set(WFOCUS_TARGETS['home1'].x, WFOCUS_TARGETS['home1'].y, WFOCUS_TARGETS['home1'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['home1'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['home1'].clone()).length() < tolerance;
    }
  },
  'home2': {
    clipPlane: 5.805,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('home2', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['home2'].x, CAMERA_POSITIONS['home2'].y, CAMERA_POSITIONS['home2'].z);
      // target.set(CAMERA_TARGETS['home2'].x, CAMERA_TARGETS['home2'].y, CAMERA_TARGETS['home2'].z);
      // wFocus.set(WFOCUS_TARGETS['home2'].x, WFOCUS_TARGETS['home2'].y, WFOCUS_TARGETS['home2'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['home2'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['home2'].clone()).length() < tolerance;
    }
  },
  'home3': {
    clipPlane: 8.6,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('home3', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['home3'].x, CAMERA_POSITIONS['home3'].y, CAMERA_POSITIONS['home3'].z);
      // target.set(CAMERA_TARGETS['home3'].x, CAMERA_TARGETS['home3'].y, CAMERA_TARGETS['home3'].z);
      // wFocus.set(WFOCUS_TARGETS['home3'].x, WFOCUS_TARGETS['home3'].y, WFOCUS_TARGETS['home3'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['home3'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['home3'].clone()).length() < tolerance;
    }
  },
  'quarter': {
    clipPlane: 8.6,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      apply('quarter', posistion, target, wFocus);
      // posistion.set(CAMERA_POSITIONS['quarter'].x, CAMERA_POSITIONS['quarter'].y, CAMERA_POSITIONS['quarter'].z);
      // target.set(CAMERA_TARGETS['quarter'].x, CAMERA_TARGETS['quarter'].y, CAMERA_TARGETS['quarter'].z);
      // wFocus.set(WFOCUS_TARGETS['quarter'].x, WFOCUS_TARGETS['quarter'].y, WFOCUS_TARGETS['quarter'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS_PORTRAIT['quarter'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS_PORTRAIT['quarter'].clone()).length() < tolerance;
    }
  }
}

export interface IOrbitProps {
  id: string;
  stamp: string;
  selectKey: THandlerKey | undefined;
  presetKey: TPresetKey | undefined;
  handleSelectKey: (selectKey: THandlerKey | undefined) => void;
  handlePresetKey: (presetKey: TPresetKey | undefined) => void;
}
