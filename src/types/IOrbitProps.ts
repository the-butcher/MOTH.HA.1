import { LineSegments, Mesh, Vector3 } from "three";
import { TStatusHandlerKey } from "./IStatusHandler";

export interface IPresetProps {
  clipPlane: number;
  faces: Mesh[];
  sgmts: LineSegments[];
  apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => void;
  equals: (posistion: Vector3, target: Vector3) => boolean;
}

export type TPresetKey = 'pumps' | 'home0' | 'home1' | 'home2' | 'home3' | 'quarter' | 'user';

export const CAMERA_POSITIONS: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-2.606316550234446, 5.573445005196212, -2.574183676578704),
  'home0': new Vector3(-13.1, 17.2, -25.1),
  'home1': new Vector3(-13.1, 20.0, -25.1),
  'home2': new Vector3(-13.1, 22.8, -25.1),
  'home3': new Vector3(-27.11462252850753, 7.170372208075888, 3.3851106655435768),
  'quarter': new Vector3(-30.45090193818403, 14.736196882882762, -36.08947504792695),
  'user': new Vector3()
}

export const CAMERA_TARGETS: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-9.577474807034104, -2.5560233325780883, -16.300346163339597),
  'home0': new Vector3(0.36, -2.7, -6.18),
  'home1': new Vector3(0.36, 0.1, -6.18),
  'home2': new Vector3(0.36, 2.9, -6.18),
  'home3': new Vector3(-4.857485561634025, 1.392515836707786, -4.783590931805891),
  'quarter': new Vector3(-4.473854194388395, 2.363560431817357, -5.589525052934382),
  'user': new Vector3()
}

export const WFOCUS_TARGETS: { [K in TPresetKey]: Vector3 } = {
  'pumps': new Vector3(-8.055409469246245, -2.700001555476562, -13.210163558725592),
  'home0': new Vector3(0.36, -2.7, -6.18),
  'home1': new Vector3(0.36, 0.1, -6.18),
  'home2': new Vector3(0.36, 2.9, -6.18),
  'home3': new Vector3(-4.032296553887772, 3.0152412584874564, -6.685930244012403),
  'quarter': new Vector3(-4.032296553887772, 3.0152412584874564, -6.685930244012403),
  'user': new Vector3()
}

const tolerance = 0.1;

export const PRESET_PROPS: { [K in TPresetKey]: IPresetProps } = {
  'pumps': {
    clipPlane: 0.2,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['pumps'].x, CAMERA_POSITIONS['pumps'].y, CAMERA_POSITIONS['pumps'].z);
      target.set(CAMERA_TARGETS['pumps'].x, CAMERA_TARGETS['pumps'].y, CAMERA_TARGETS['pumps'].z);
      wFocus.set(WFOCUS_TARGETS['pumps'].x, WFOCUS_TARGETS['pumps'].y, WFOCUS_TARGETS['pumps'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['pumps'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['pumps'].clone()).length() < tolerance;
    }
  },
  'home0': {
    clipPlane: 0.205,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['home0'].x, CAMERA_POSITIONS['home0'].y, CAMERA_POSITIONS['home0'].z);
      target.set(CAMERA_TARGETS['home0'].x, CAMERA_TARGETS['home0'].y, CAMERA_TARGETS['home0'].z);
      wFocus.set(WFOCUS_TARGETS['home0'].x, WFOCUS_TARGETS['home0'].y, WFOCUS_TARGETS['home0'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['home0'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['home0'].clone()).length() < tolerance;
    }
  },
  'home1': {
    clipPlane: 3.005,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['home1'].x, CAMERA_POSITIONS['home1'].y, CAMERA_POSITIONS['home1'].z);
      target.set(CAMERA_TARGETS['home1'].x, CAMERA_TARGETS['home1'].y, CAMERA_TARGETS['home1'].z);
      wFocus.set(WFOCUS_TARGETS['home1'].x, WFOCUS_TARGETS['home1'].y, WFOCUS_TARGETS['home1'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['home1'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['home1'].clone()).length() < tolerance;
    }
  },
  'home2': {
    clipPlane: 5.805,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['home2'].x, CAMERA_POSITIONS['home2'].y, CAMERA_POSITIONS['home2'].z);
      target.set(CAMERA_TARGETS['home2'].x, CAMERA_TARGETS['home2'].y, CAMERA_TARGETS['home2'].z);
      wFocus.set(WFOCUS_TARGETS['home2'].x, WFOCUS_TARGETS['home2'].y, WFOCUS_TARGETS['home2'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['home2'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['home2'].clone()).length() < tolerance;
    }
  },
  'home3': {
    clipPlane: 8.6,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['home3'].x, CAMERA_POSITIONS['home3'].y, CAMERA_POSITIONS['home3'].z);
      target.set(CAMERA_TARGETS['home3'].x, CAMERA_TARGETS['home3'].y, CAMERA_TARGETS['home3'].z);
      wFocus.set(WFOCUS_TARGETS['home3'].x, WFOCUS_TARGETS['home3'].y, WFOCUS_TARGETS['home3'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['home3'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['home3'].clone()).length() < tolerance;
    }
  },
  'quarter': {
    clipPlane: 8.6,
    faces: [],
    sgmts: [],
    apply: (posistion: Vector3, target: Vector3, wFocus: Vector3) => {
      posistion.set(CAMERA_POSITIONS['quarter'].x, CAMERA_POSITIONS['quarter'].y, CAMERA_POSITIONS['quarter'].z);
      target.set(CAMERA_TARGETS['quarter'].x, CAMERA_TARGETS['quarter'].y, CAMERA_TARGETS['quarter'].z);
      wFocus.set(WFOCUS_TARGETS['quarter'].x, WFOCUS_TARGETS['quarter'].y, WFOCUS_TARGETS['quarter'].z);
    },
    equals: (posistion: Vector3, target: Vector3) => {
      return posistion.clone().sub(CAMERA_POSITIONS['quarter'].clone()).length() < tolerance && target.clone().sub(CAMERA_TARGETS['quarter'].clone()).length() < tolerance;
    }
  },
  'user': {
    clipPlane: -1,
    faces: [],
    sgmts: [],
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
  selectKey: TStatusHandlerKey | undefined;
  presetKey: TPresetKey | undefined;
  handleSelectKey: (selectKey: TStatusHandlerKey | undefined) => void;
  handlePresetKey: (presetKey: TPresetKey | undefined) => void;
}
