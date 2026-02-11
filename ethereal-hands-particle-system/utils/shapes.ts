
import { ShapeType } from '../types';

export const getShapePositions = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const size = 5;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ShapeType.Sphere: {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        x = size * Math.cos(theta) * Math.sin(phi);
        y = size * Math.sin(theta) * Math.sin(phi);
        z = size * Math.cos(phi);
        break;
      }
      case ShapeType.Cube: {
        x = (Math.random() - 0.5) * size * 2;
        y = (Math.random() - 0.5) * size * 2;
        z = (Math.random() - 0.5) * size * 2;
        break;
      }
      case ShapeType.Heart: {
        const t = (i / count) * Math.PI * 2;
        // 2D heart projected into 3D
        const r = 0.3;
        x = r * 16 * Math.pow(Math.sin(t), 3);
        y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        z = (Math.random() - 0.5) * 2;
        break;
      }
      case ShapeType.Spiral: {
        const t = (i / count) * Math.PI * 20;
        x = (t / 4) * Math.cos(t);
        y = (t / 4) * Math.sin(t);
        z = (t / 4) - size;
        break;
      }
      case ShapeType.Torus: {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 4;
        const r = 1.5;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
        break;
      }
      case ShapeType.DNA: {
        const t = (i / count) * Math.PI * 10;
        const side = i % 2 === 0 ? 1 : -1;
        const shift = side === 1 ? 0 : Math.PI;
        x = Math.cos(t + shift) * 2.5;
        y = Math.sin(t + shift) * 2.5;
        z = t * 1.5 - (10 * 1.5) / 2;
        break;
      }
      case ShapeType.Pyramid: {
        const h = Math.random();
        const w = (1 - h) * size;
        const angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * w;
        z = Math.sin(angle) * w;
        y = h * size * 1.5 - (size * 0.75);
        break;
      }
      case ShapeType.Ring: {
        const t = (i / count) * Math.PI * 2;
        const r = size + (Math.random() - 0.5) * 1.5;
        x = Math.cos(t) * r;
        y = Math.sin(t) * r;
        z = (Math.random() - 0.5) * 0.5;
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};
