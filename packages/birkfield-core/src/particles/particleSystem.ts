import * as THREE from 'three';
import type { BucketState } from './bucketTypes';
import { createBucket } from './createBucket';

export interface MainParticleSystem {
  bucketA: BucketState;
  bucketB: BucketState;
}

export function initParticleSystem(scene: THREE.Scene, bucketSize: number): MainParticleSystem {
  // A and B alternate roles
  const bucketA = createBucket(bucketSize, 0.08, 1.0);
  const bucketB = createBucket(bucketSize, 0.08, 1.0);

  scene.add(bucketA.points);
  scene.add(bucketB.points);

  return {
    bucketA,
    bucketB
  };
}
