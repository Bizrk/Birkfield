import * as THREE from 'three';
import type { BucketState } from './bucketTypes';

const _tempVec = new THREE.Vector3();

export function updateBucket(bucket: BucketState, dt: number, bloom: number = 1.0, time: number = 0, jitter: number = 0.05, speed: number = 1.0, disruption: number = 0.0, warpSpeed: number = 5.0) {
  const { 
    positions, colors, 
    targetLocalPositions, targetColors, 
    anchor, scale, rotation, 
    geometry, count, transitionProgress
  } = bucket;
  
  // Use a smoothstep or exponential decay based ease
  // transitionProgress acts like a lerp factor (scaled by dt vaguely)
  // For standard dt (~0.016), an alpha of 0.05 is standard frame smoothing.
  // We'll normalize it by dt so it's frame-rate independent
  const alpha = 1.0 - Math.pow(1.0 - transitionProgress, dt * 60 * speed);
  const warpAlpha = 1.0 - Math.pow(1.0 - transitionProgress, dt * 60 * (speed * warpSpeed + 0.1));

  for (let i = 0; i < count; i++) {
    // 1. Get targets
    _tempVec.set(
      targetLocalPositions[i * 3 + 0],
      targetLocalPositions[i * 3 + 1],
      targetLocalPositions[i * 3 + 2]
    );

    // Apply swarming organic noise based on internal local vertex placement
    if (jitter > 0) {
      const timeFactor = time * 2.5;
      _tempVec.x += Math.sin(timeFactor + _tempVec.x * 3.0) * jitter;
      _tempVec.y += Math.cos(timeFactor + _tempVec.y * 2.5) * jitter;
      _tempVec.z += Math.sin(timeFactor + _tempVec.z * 4.0) * jitter;
    }

    if (disruption > 0.0) {
      // Create a massive physics "burst" scaling cleanly with how far the object is physically lagging!
      const noiseScale = disruption * 4.0; // Upped scaler to natively force wider spreads
      _tempVec.x += Math.sin((i % 100) * 0.5 + time * 4.0) * noiseScale;
      _tempVec.y += Math.cos((i % 123) * 0.5 - time * 4.5) * noiseScale;
      _tempVec.z += Math.sin((i % 88) * 0.5 + time * 4.2) * noiseScale;
    }

    // 2. Apply bucket bounds transforms (scale, rotate, translate)
    _tempVec.multiply(scale);
    _tempVec.applyEuler(rotation);
    _tempVec.add(anchor);

    // 3. Ease position towards transformed target
    const currentX = positions[i * 3 + 0];
    const currentY = positions[i * 3 + 1];
    const currentZ = positions[i * 3 + 2];

    const posAlpha = (currentZ - _tempVec.z < -1000.0) ? warpAlpha : alpha;

    positions[i * 3 + 0] = currentX + (_tempVec.x - currentX) * posAlpha;
    positions[i * 3 + 1] = currentY + (_tempVec.y - currentY) * posAlpha;
    positions[i * 3 + 2] = currentZ + (_tempVec.z - currentZ) * posAlpha;

    // 4. Ease color
    const cR = colors[i * 3 + 0];
    const cG = colors[i * 3 + 1];
    const cB = colors[i * 3 + 2];

    const tR = targetColors[i * 3 + 0] * bloom;
    const tG = targetColors[i * 3 + 1] * bloom;
    const tB = targetColors[i * 3 + 2] * bloom;

    let nextR = cR + (tR - cR) * alpha;
    let nextG = cG + (tG - cG) * alpha;
    let nextB = cB + (tB - cB) * alpha;

    // Zeno's paradox ghosting fix: if fully inactive (target 0), drop to absolute 0
    // so that thousands of microscopically faint overlapping points don't aggregate
    if (tR === 0 && tG === 0 && tB === 0) {
        if (nextR < 0.01 && nextG < 0.01 && nextB < 0.01) {
            nextR = 0;
            nextG = 0;
            nextB = 0;
        }
    }

    colors[i * 3 + 0] = nextR;
    colors[i * 3 + 1] = nextG;
    colors[i * 3 + 2] = nextB;
  }

  // Update geometry buffers
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}
