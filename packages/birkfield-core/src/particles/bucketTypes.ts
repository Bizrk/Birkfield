import * as THREE from 'three';


export interface BucketState {
  // Current interpolated values
  positions: Float32Array;
  colors: Float32Array;

  // The base memory allocations
  targetLocalPositions: Float32Array; 
  targetColors: Float32Array;

  // Render object
  points: THREE.Points;
  geometry: THREE.BufferGeometry;

  // World transform to apply to targetLocalPositions dynamically
  anchor: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Euler;
  baseRotation: THREE.Euler;

  // How fast to interpolate to targets (0-1)
  transitionProgress: number; 
  
  // Point count
  count: number;
  
  textureBloom: THREE.Texture;
  textureSolid: THREE.Texture;
}
