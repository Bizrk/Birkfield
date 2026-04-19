import * as THREE from 'three';
import type { BucketState } from './bucketTypes';
import { createBucket } from './createBucket';

export interface MainParticleSystem {
  bucketA: BucketState;
  bucketB: BucketState;
  bucketHover: BucketState;
}

export function initParticleSystem(scene: THREE.Scene, bucketSize: number): MainParticleSystem {
  // A and B alternate roles
  const bucketA = createBucket(bucketSize, 0.08, 1.0);
  const bucketB = createBucket(bucketSize, 0.08, 1.0);
  // Independent bucket for hover interactions
  const bucketHover = createBucket(Math.min(bucketSize, 800), 0.15, 1.0);

  scene.add(bucketA.points);
  scene.add(bucketB.points);
  scene.add(bucketHover.points);

  // Stash away until explicitly needed
  bucketHover.points.position.z = -10000;

  return {
    bucketA,
    bucketB,
    bucketHover
  };
}
