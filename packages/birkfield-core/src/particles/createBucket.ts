import * as THREE from 'three';
import type { BucketState } from './bucketTypes';
import type { SampledPoint } from '../primitives/types';

export function createBucket(count: number, pointSize: number = 0.4, opacity: number = 0.8): BucketState {
  // Create a soft glowing circle texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.1)'); // Sharper falloff reduces muddy blending
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const targetLocalPositions = new Float32Array(count * 3);
  const targetColors = new Float32Array(count * 3);

  // Initialize randomly
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    targetLocalPositions[i * 3 + 0] = positions[i * 3 + 0];
    targetLocalPositions[i * 3 + 1] = positions[i * 3 + 1];
    targetLocalPositions[i * 3 + 2] = positions[i * 3 + 2];

    colors[i * 3 + 0] = 0.5;
    colors[i * 3 + 1] = 0.5;
    colors[i * 3 + 2] = 0.5;

    targetColors[i * 3 + 0] = 0.5;
    targetColors[i * 3 + 1] = 0.5;
    targetColors[i * 3 + 2] = 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: pointSize,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: opacity,
    sizeAttenuation: true,
    depthWrite: false, // helps with blending
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);

  return {
    count,
    positions,
    colors,
    targetLocalPositions,
    targetColors,
    geometry,
    points,
    anchor: new THREE.Vector3(),
    scale: new THREE.Vector3(1, 1, 1),
    rotation: new THREE.Euler(),
    baseRotation: new THREE.Euler(),
    transitionProgress: 0.05 // default ease rate
  };
}

// Helper to fill target arrays from sampled point setup
export function setBucketTarget(bucket: BucketState, targetPoints: SampledPoint[], color1?: THREE.Color, color2?: THREE.Color, activePoints?: number) {
  if (targetPoints.length !== bucket.count) {
    console.warn(`Target point count (${targetPoints.length}) mismatch with bucket (${bucket.count}).`);
  }
  const minCount = Math.min(bucket.count, targetPoints.length);
  const activeLimit = activePoints !== undefined ? activePoints : minCount;

  for (let i = 0; i < minCount; i++) {
    const p = targetPoints[i];
    bucket.targetLocalPositions[i * 3 + 0] = p.position.x;
    bucket.targetLocalPositions[i * 3 + 1] = p.position.y;
    bucket.targetLocalPositions[i * 3 + 2] = p.position.z;

    let c = p.color || new THREE.Color(1, 1, 1);
    const isOutOfBounds = i >= activeLimit;

    if (isOutOfBounds || (p.color && p.color.r === 0 && p.color.g === 0 && p.color.b === 0)) {
      // Points outside the active count get faded to completely black (invisible in AdditiveBlending)
      c = new THREE.Color(0, 0, 0);
      // Fling them deep into background space so they sit behind geometry
      bucket.targetLocalPositions[i * 3 + 2] -= 2000.0; 
    } else if (color1 && color2) {
      // Golden ratio pseudo-random distribution so the random splatter doesn't flicker on scroll-transitions
      const ratio = ((i * 137.5) % 1000) / 1000;
      c = new THREE.Color().copy(color1).lerp(color2, ratio);
    } else if (color1) {
      c = color1;
    }

    bucket.targetColors[i * 3 + 0] = c.r;
    bucket.targetColors[i * 3 + 1] = c.g;
    bucket.targetColors[i * 3 + 2] = c.b;
  }
}
