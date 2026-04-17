import * as THREE from 'three';

export interface SampledPoint {
  position: THREE.Vector3;
  color?: THREE.Color;
  normal?: THREE.Vector3;
}

export interface PrimitiveConfig {
  center?: THREE.Vector3;
  rotation?: THREE.Euler;
  color?: THREE.Color;
  density?: number; // Approximate points to generate
}
