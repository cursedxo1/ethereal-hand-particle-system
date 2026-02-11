
export enum ShapeType {
  Sphere = 'Sphere',
  Cube = 'Cube',
  Heart = 'Heart',
  Spiral = 'Spiral',
  Torus = 'Torus',
  DNA = 'DNA',
  Pyramid = 'Pyramid',
  Ring = 'Ring'
}

export interface HandData {
  x: number;
  y: number;
  z: number;
  isFist: boolean;
  isActive: boolean;
}

export interface AppSettings {
  particleCount: number;
  forceStrength: number;
  interactionRadius: number;
  damping: number;
  returnStrength: number;
  shape: ShapeType;
  color: string;
}
