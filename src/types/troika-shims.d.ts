declare module 'troika-three-text' {
  import { ColorRepresentation, Material, Mesh } from 'three';

  export class Text extends Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    anchorX: string | number;
    anchorY: string | number;
    letterSpacing: number;
    maxWidth: number;
    textAlign: string;
    sdfGlyphSize: number;
    glyphGeometryDetail: number;
    fillOpacity: number;
    outlineWidth: number | string;
    outlineBlur: number | string;
    outlineColor: ColorRepresentation;
    outlineOpacity: number;
    material: Material | Material[];
    sync(callback?: () => void): void;
    dispose(): void;
  }
}

declare module 'troika-three-utils' {
  import { Material } from 'three';

  export function createDerivedMaterial<T extends Material = Material>(
    baseMaterial: T,
    options?: Record<string, unknown>
  ): T & {
    baseMaterial: T;
    uniforms: Record<string, { value: unknown }>;
    dispose(): void;
  };
}
