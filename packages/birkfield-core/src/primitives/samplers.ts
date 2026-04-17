import * as THREE from 'three';
import type { SampledPoint, PrimitiveConfig } from './types';
import { SeededRandom } from '../utils/seededRandom';

export interface BoxConfig extends PrimitiveConfig {
  width: number;
  height: number;
  depth: number;
}

export function sampleBox(config: BoxConfig, rng: SeededRandom): SampledPoint[] {
  const points: SampledPoint[] = [];
  const { width, height, depth, density = 100, center = new THREE.Vector3(), rotation = new THREE.Euler(), color } = config;
  
  // Distribute points on the surface of the box
  const areaX = depth * height;
  const areaY = width * depth;
  const areaZ = width * height;
  const totalArea = 2 * (areaX + areaY + areaZ);
  
  const nx = Math.floor(density * (2 * areaX / totalArea));
  const ny = Math.floor(density * (2 * areaY / totalArea));
  const nz = Math.floor(density * (2 * areaZ / totalArea));
  
  const addPoints = (count: number, axis: 'x'|'y'|'z', sign: number) => {
    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3();
      if (axis === 'x') {
        pos.x = (width / 2) * sign;
        pos.y = rng.range(-height / 2, height / 2);
        pos.z = rng.range(-depth / 2, depth / 2);
      } else if (axis === 'y') {
        pos.x = rng.range(-width / 2, width / 2);
        pos.y = (height / 2) * sign;
        pos.z = rng.range(-depth / 2, depth / 2);
      } else {
        pos.x = rng.range(-width / 2, width / 2);
        pos.y = rng.range(-height / 2, height / 2);
        pos.z = (depth / 2) * sign;
      }
      
      // Apply transforms
      pos.applyEuler(rotation);
      pos.add(center);
      
      points.push({
        position: pos,
        color: color ? color.clone() : undefined
      });
    }
  };

  addPoints(Math.floor(nx / 2), 'x', -1);
  addPoints(Math.floor(nx / 2), 'x', 1);
  addPoints(Math.floor(ny / 2), 'y', -1);
  addPoints(Math.floor(ny / 2), 'y', 1);
  addPoints(Math.floor(nz / 2), 'z', -1);
  addPoints(Math.floor(nz / 2), 'z', 1);

  return points;
}

export interface SphereConfig extends PrimitiveConfig {
  radius: number;
}

export function sampleSphere(config: SphereConfig, rng: SeededRandom): SampledPoint[] {
  const points: SampledPoint[] = [];
  const { radius, density = 100, center = new THREE.Vector3(), rotation = new THREE.Euler(), color } = config;
  
  for (let i = 0; i < density; i++) {
    const u = rng.next();
    const v = rng.next();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    const pos = new THREE.Vector3(x, y, z);
    pos.applyEuler(rotation);
    pos.add(center);
    
    points.push({
      position: pos,
      color: color ? color.clone() : undefined
    });
  }
  return points;
}

export interface CylinderConfig extends PrimitiveConfig {
  radiusTop: number;
  radiusBottom: number;
  height: number;
}

export function sampleCylinder(config: CylinderConfig, rng: SeededRandom): SampledPoint[] {
  const points: SampledPoint[] = [];
  const { radiusTop, radiusBottom, height, density = 100, center = new THREE.Vector3(), rotation = new THREE.Euler(), color } = config;
  
  for (let i = 0; i < density; i++) {
    const h = rng.range(0, height) - height / 2;
    const t = (h + height / 2) / height;
    const currentRadius = radiusBottom * (1 - t) + radiusTop * t;
    
    const theta = rng.range(0, Math.PI * 2);
    const x = currentRadius * Math.cos(theta);
    const z = currentRadius * Math.sin(theta);
    
    const pos = new THREE.Vector3(x, h, z);
    pos.applyEuler(rotation);
    pos.add(center);
    
    points.push({
      position: pos,
      color: color ? color.clone() : undefined
    });
  }
  
  return points;
}

export interface TorusConfig extends PrimitiveConfig {
  radius: number;
  tube: number;
}

export function sampleTorus(config: TorusConfig, rng: SeededRandom): SampledPoint[] {
  const points: SampledPoint[] = [];
  const { radius, tube, density = 100, center = new THREE.Vector3(), rotation = new THREE.Euler(), color } = config;
  
  for (let i = 0; i < density; i++) {
    const u = rng.range(0, Math.PI * 2); // main ring
    const v = rng.range(0, Math.PI * 2); // cross section
    
    const x = (radius + tube * Math.cos(v)) * Math.cos(u);
    const z = (radius + tube * Math.cos(v)) * Math.sin(u);
    const y = tube * Math.sin(v);
    
    const pos = new THREE.Vector3(x, y, z);
    pos.applyEuler(rotation);
    pos.add(center);
    
    points.push({
      position: pos,
      color: color ? color.clone() : undefined
    });
  }
  
  return points;
}
