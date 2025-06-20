import { Color, DoubleSide, LineBasicMaterial, MeshPhysicalMaterial, Plane, Vector3 } from 'three';
import { LineMaterial } from 'three/examples/jsm/Addons.js';
import { IColorDescription, TClip } from '../types/IColorDescription';
import { MODEL_OFFSET_Y } from '../types/IModelProps';

export class MaterialRepo {

  private static MATERIALS_FACE: { [k in string]: MeshPhysicalMaterial } = {};
  private static MATERIALS_LINE: { [k in string]: LineMaterial } = {};
  private static MATERIALS_SGMT: { [k in string]: LineBasicMaterial } = {};
  private static CLIP_PLANE_000 = new Plane(new Vector3(0, -1, 0), MODEL_OFFSET_Y);
  private static CLIP_PLANE_245 = new Plane(new Vector3(0, -1, 0), MODEL_OFFSET_Y + 245);

  static setClipPlane(clipPlane: number) {
    // console.log('clipPlane (repo)', clipPlane);
    MaterialRepo.CLIP_PLANE_000.constant = clipPlane + MODEL_OFFSET_Y;
    MaterialRepo.CLIP_PLANE_245.constant = clipPlane + MODEL_OFFSET_Y + 245;
  }

  static toCode(type: string, rgb: number, opacity: number, clip: TClip): string {
    return `${type}_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}_${clip}`;
  }

  static getMaterialSgmt(colorDesc: IColorDescription): LineBasicMaterial {

    const code = this.toCode('face', colorDesc.rgb, 1, colorDesc.clip); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_SGMT[code]) {

      const clippingPlanes: Plane[] = [];
      if (colorDesc.clip === 'clip__000') {
        clippingPlanes.push(this.CLIP_PLANE_000);
      } else if (colorDesc.clip === 'clip__245') {
        clippingPlanes.push(this.CLIP_PLANE_245);
      }

      MaterialRepo.MATERIALS_SGMT[code] = new LineBasicMaterial({
        color: new Color(colorDesc.rgb),
        opacity: colorDesc.opacity,
        transparent: true,
        clippingPlanes,
        clipShadows: clippingPlanes.length > 0
      });
    }

    return MaterialRepo.MATERIALS_SGMT[code];

  }

  static getMaterialFace(colorDesc: IColorDescription): MeshPhysicalMaterial {

    const code = this.toCode('face', colorDesc.rgb, colorDesc.opacity, colorDesc.clip); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_FACE[code]) {

      const clippingPlanes: Plane[] = [];
      if (colorDesc.clip === 'clip__000') {
        clippingPlanes.push(this.CLIP_PLANE_000);
      } else if (colorDesc.clip === 'clip__245') {
        clippingPlanes.push(this.CLIP_PLANE_245);
      }

      MaterialRepo.MATERIALS_FACE[code] = new MeshPhysicalMaterial({
        color: new Color(colorDesc.rgb),
        opacity: colorDesc.opacity,
        transparent: true,
        roughness: 0.75,
        metalness: 0.00,
        reflectivity: 0.01,
        side: DoubleSide,
        clippingPlanes,
        clipShadows: clippingPlanes.length > 0,
        polygonOffset: true,
        polygonOffsetFactor: 0.50
      });

    }

    return MaterialRepo.MATERIALS_FACE[code];

  }

  static getMaterialLine(colorDesc: IColorDescription): LineMaterial {

    const code = this.toCode('face', colorDesc.rgb, 1, colorDesc.clip); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_LINE[code]) {

      const clippingPlanes: Plane[] = [];
      if (colorDesc.clip === 'clip__000') {
        clippingPlanes.push(this.CLIP_PLANE_000);
      } else if (colorDesc.clip === 'clip__245') {
        clippingPlanes.push(this.CLIP_PLANE_245);
      }

      MaterialRepo.MATERIALS_LINE[code] = new LineMaterial({
        color: new Color(colorDesc.rgb),
        opacity: colorDesc.opacity,
        transparent: true,
        linewidth: 4, // in world units with size attenuation, pixels otherwise
        vertexColors: false,
        dashed: false,
        alphaToCoverage: false,
        clippingPlanes
      });

    }

    return MaterialRepo.MATERIALS_LINE[code];

  }

  static updateMaterialLineResolution() {
    for (const level in MaterialRepo.MATERIALS_LINE) {
      MaterialRepo.MATERIALS_LINE[level].resolution.set(window.innerWidth, window.innerHeight);
    }
  }
}
