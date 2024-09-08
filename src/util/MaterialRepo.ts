import { Color, DoubleSide, LineBasicMaterial, MeshPhysicalMaterial, Plane, Vector3 } from 'three';
import { LineMaterial } from 'three/examples/jsm/Addons.js';
import { IColorDescription } from '../types/IColorDescription';

export class MaterialRepo {

  private static MATERIALS_FACE: { [k in string]: MeshPhysicalMaterial } = {};
  private static MATERIALS_LINE: { [k in string]: LineMaterial } = {};
  private static MATERIALS_SGMT: { [k in string]: LineBasicMaterial } = {};
  private static CLIP_PLANE = new Plane(new Vector3(0, -1, 0), -2.7);

  static setClipPlane(clipPlane: number) {
    MaterialRepo.CLIP_PLANE.constant = clipPlane - 2.7;
  }

  static toCode(type: string, rgb: number, opacity: number): string {
    return `${type}_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
  }

  static getMaterialSgmt(colorDesc: IColorDescription): LineBasicMaterial {

    const code = this.toCode('face', colorDesc.rgb, 1); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_SGMT[code]) {

      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];

      MaterialRepo.MATERIALS_SGMT[code] = new LineBasicMaterial({
        color: new Color(colorDesc.rgb),
        opacity: colorDesc.opacity,
        transparent: true,
        clippingPlanes,
        clipShadows: clippingPlanes.length > 0,
      });
    }

    return MaterialRepo.MATERIALS_SGMT[code];

  }

  static getMaterialFace(colorDesc: IColorDescription): MeshPhysicalMaterial {

    const code = this.toCode('face', colorDesc.rgb, colorDesc.opacity); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_FACE[code]) {

      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];

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
        polygonOffsetFactor: 0.5
      });

    }

    return MaterialRepo.MATERIALS_FACE[code];

  }

  static getMaterialLine(colorDesc: IColorDescription): LineMaterial {

    const code = this.toCode('face', colorDesc.rgb, 1); // `face_${rgb.toString(16).padStart(6, '0')}_${Math.round(opacity * 256).toString(16).padStart(2, '0')}`;
    if (!this.MATERIALS_LINE[code]) {

      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];

      MaterialRepo.MATERIALS_LINE[code] = new LineMaterial({
        color: new Color(colorDesc.rgb),
        linewidth: 4, // in world units with size attenuation, pixels otherwise
        vertexColors: false,
        opacity: colorDesc.opacity,
        transparent: false,
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
