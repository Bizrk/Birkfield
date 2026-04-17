import * as THREE from 'three';
import type { BucketState } from '../particles/bucketTypes';

export function applyIdleMotion(
  bucket: BucketState, 
  baseRotation: THREE.Euler, 
  time: number, 
  isForeground: boolean,
  rotationSpeedMultiplier: number,
  mouseX: number,
  mouseY: number,
  mouseMax: THREE.Vector2,
  continuousSpinSpeed: number
) {
  // Foreground gets tighter, distinct motion
  // Background gets slower looser sweeping motion
  
  const amplitudeX = isForeground ? 0.1 : 0.3;
  const amplitudeY = isForeground ? 0.2 : 0.4;
  const rawSpeed = isForeground ? 1.0 : 0.5;
  const computedSpeed = rawSpeed * rotationSpeedMultiplier;

  // Convert mouseMax from degrees to radians
  const maxRadX = THREE.MathUtils.degToRad(mouseMax.x);
  const maxRadY = THREE.MathUtils.degToRad(mouseMax.y);

  // Apply bounded limits natively
  const rotMouseXOffset = mouseY * maxRadX; // Vertical mouse movement shifts pitch (X axis)
  const rotMouseYOffset = mouseX * maxRadY; // Horizontal mouse movement shifts yaw (Y axis)

  bucket.rotation.x = baseRotation.x + Math.sin(time * computedSpeed) * amplitudeX + rotMouseXOffset;
  bucket.rotation.y = baseRotation.y + Math.cos(time * computedSpeed * 0.8) * amplitudeY + rotMouseYOffset + (time * continuousSpinSpeed);
  bucket.rotation.z = baseRotation.z; // skip z mostly
}

export function applyAmbientMotion(bucket: BucketState, time: number) {
  bucket.rotation.y = time * 0.1;
  bucket.rotation.x = Math.sin(time * 0.05) * 0.1;
}
