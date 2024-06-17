import { Color, DoubleSide, FrontSide, LineBasicMaterial, MeshPhysicalMaterial, Plane, Vector3 } from 'three';
import { TLevel } from '../types/ISensor';
import { LineMaterial } from 'three/examples/jsm/Addons.js';

export class MaterialRepo {

  private static MATERIALS_FACE: { [k in string]: MeshPhysicalMaterial } = {};
  private static MATERIALS_MARK: { [k in string]: MeshPhysicalMaterial } = {};
  private static MATERIALS_LINE: { [k in string]: LineMaterial } = {};
  private static MATERIALS_SGMT: { [k in string]: LineBasicMaterial } = {};
  private static CLIP_PLANE = new Plane(new Vector3(0, -1, 0), -2.7);

  static setClipPlane(clipPlane: number) {
    MaterialRepo.CLIP_PLANE.constant = clipPlane - 2.7;
  }

  static getMaterialSgmt(level: TLevel): LineBasicMaterial {
    if (!this.MATERIALS_SGMT[level]) {
      const segmValDefault = 80;
      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];
      let color = new Color(`rgb(${segmValDefault}, ${segmValDefault}, ${segmValDefault})`);
      if (level === 'norm') {
        color = new Color(`rgb(${segmValDefault}, 200, ${segmValDefault})`);
      } else if (level === 'warn') {
        color = new Color(`rgb(200, 200, ${segmValDefault})`);
      } else if (level === 'risk') {
        color = new Color(`rgb(255, ${segmValDefault}, ${segmValDefault})`);
      } else if (level === 'none') {
        // just stick with the color, but no clipping plane
      } else { // i.e. a wall
        // clippingPlanes.push(this.CLIP_PLANE);
      }
      MaterialRepo.MATERIALS_SGMT[level] = new LineBasicMaterial({
        color,
        clippingPlanes,
        clipShadows: clippingPlanes.length > 0,
      });
    }
    return MaterialRepo.MATERIALS_SGMT[level];
  }

  static getMaterialFace(level: TLevel): MeshPhysicalMaterial {
    if (!this.MATERIALS_FACE[level]) {
      const faceValDefault = 100;
      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];
      let color = new Color(`rgb(${faceValDefault}, ${faceValDefault}, ${faceValDefault})`);
      let opacity = 0.80;
      if (level === 'norm') {
        color = new Color(`rgb(${faceValDefault}, 200, ${faceValDefault})`);
      } else if (level === 'warn') {
        color = new Color(`rgb(200, 200, ${faceValDefault})`);
      } else if (level === 'risk') {
        color = new Color(`rgb(255, ${faceValDefault}, ${faceValDefault})`);
      } else if (level === 'none') {
        // just stick with the color, but no clipping plane
      } else { // i.e. a wall
        color = new Color(`rgb(255, 255, 255)`);
        // clippingPlanes.push(this.CLIP_PLANE);
        opacity = 0.50;
      }
      MaterialRepo.MATERIALS_FACE[level] = new MeshPhysicalMaterial({
        color,
        opacity,
        transparent: true,
        roughness: 0.25,
        metalness: 0.10,
        reflectivity: 0.01,
        side: DoubleSide,
        clippingPlanes,
        clipShadows: clippingPlanes.length > 0,
        polygonOffset: true,
        polygonOffsetFactor: 1
      });
    }
    return MaterialRepo.MATERIALS_FACE[level];
  }

  static getMaterialMark(level: TLevel): MeshPhysicalMaterial {
    if (!this.MATERIALS_MARK[level]) {
      const faceValDefault = 5;
      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];
      let color = new Color(`rgb(${faceValDefault}, ${faceValDefault}, ${faceValDefault})`);
      if (level === 'norm') {
        color = new Color(`rgb(0, 255, 0)`);
      } else if (level === 'warn') {
        color = new Color(`rgb(200, 200, 0)`);
      } else if (level === 'risk') {
        color = new Color(`rgb(250, 0, 0)`);
      }
      MaterialRepo.MATERIALS_MARK[level] = new MeshPhysicalMaterial({
        color,
        roughness: 0.50,
        metalness: 0.75,
        reflectivity: 0.75,
        side: FrontSide,
        emissive: color,
        emissiveIntensity: 0.1,
        // wireframe: true
        clippingPlanes
      });
    }
    return MaterialRepo.MATERIALS_MARK[level];
  }

  static getMaterialLine(level: TLevel): LineMaterial {
    if (!this.MATERIALS_LINE[level]) {
      const lineValDefault = 75;
      const clippingPlanes: Plane[] = [
        this.CLIP_PLANE
      ];
      let color = new Color(`rgb(${lineValDefault}, ${lineValDefault}, ${lineValDefault})`);
      if (level === 'norm') {
        color = new Color(`rgb(0, 180, 0)`);
      } else if (level === 'warn') {
        color = new Color(`rgb(200, 200, 0)`);
      } else if (level === 'risk') {
        color = new Color(`rgb(255, 0, 0)`);
      }
      MaterialRepo.MATERIALS_LINE[level] = new LineMaterial({
        color,
        linewidth: 3, // in world units with size attenuation, pixels otherwise
        vertexColors: false,
        opacity: 0.75,
        transparent: false,
        dashed: false,
        alphaToCoverage: false,
        clippingPlanes
      });
    }
    return MaterialRepo.MATERIALS_LINE[level];
  }

  static updateMaterialLineResolution() {
    for (const level in MaterialRepo.MATERIALS_LINE) {
      MaterialRepo.MATERIALS_LINE[level].resolution.set(window.innerWidth, window.innerHeight);
    }
  }
}
