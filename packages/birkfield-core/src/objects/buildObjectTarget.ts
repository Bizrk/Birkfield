import * as THREE from 'three';
import type { SampledPoint } from '../primitives/types';
import { SeededRandom } from '../utils/seededRandom';
import { normalizePointSet } from './normalizePointSet';

// The resolved and loose states of an object
export interface ObjectTargetStates {
  resolved: SampledPoint[];
  loose: SampledPoint[];
}

export interface ObjectDefinition {
  id: string;
  generatePoints: (rng: SeededRandom) => SampledPoint[];
}

export function buildObjectTarget(
  def: ObjectDefinition, 
  targetPoints: number,
  rngSeed: number = 1234
): ObjectTargetStates {
  const rng = new SeededRandom(rngSeed);
  const rawPoints = def.generatePoints(rng);

  // Normalization keeps original colors
  const resolved = normalizePointSet(rawPoints, targetPoints, rng, 0.0);

  // Create loose version
  // We recreate them but with huge jitter and dimmer colors
  const looseRng = new SeededRandom(rngSeed + 100);
  const loose = [];
  for (let i = 0; i < resolved.length; i++) {
    const p = resolved[i];
    const newPos = p.position.clone();
    
    // add large spherical spread for massive background proto-cloud look
    const out = {x: 0, y: 0, z: 0};
    looseRng.onSphere(out);
    const radiusScale = looseRng.range(0, 25.0); // Huge viewport-covering size
    newPos.x += out.x * radiusScale;
    newPos.y += out.y * radiusScale;
    newPos.z += (out.z * radiusScale) * 0.15; // Crush depth mapping so it forms a background WALL instead of swallowing the foreground completely

    // Use original colors; brightness mapping is handled completely by HTML data-bloom attributes in updateBucket
    const newColor = p.color ? p.color.clone() : new THREE.Color(0x888888);

    loose.push({
      position: newPos,
      color: newColor
    });
  }

  return { resolved, loose };
}
