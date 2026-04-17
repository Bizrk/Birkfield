import type { SampledPoint } from '../primitives/types';
import { SeededRandom } from '../utils/seededRandom';
import * as THREE from 'three';


export function normalizePointSet(
  points: SampledPoint[], 
  targetCount: number, 
  rng: SeededRandom, 
  jitterAmount: number = 0
): SampledPoint[] {
  if (points.length === targetCount) {
    return applyJitter(points, rng, jitterAmount);
  }
  
  const result: SampledPoint[] = [];
  
  if (points.length > targetCount) {
    // Downsample deterministically
    const step = points.length / targetCount;
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.floor(i * step);
      result.push({
        position: points[idx].position.clone(),
        color: points[idx].color ? points[idx].color.clone() : undefined
      });
    }
  } else {
    // Upsample by duplicating and adding jitter
    // First, copy all existing
    for (const p of points) {
      result.push({
        position: p.position.clone(),
        color: p.color ? p.color.clone() : undefined
      });
    }
    
    // Fill the rest by picking randomly and duplicating
    const needed = targetCount - points.length;
    for (let i = 0; i < needed; i++) {
      // Pick deterministic index
      const idx = Math.floor(rng.next() * points.length);
      const basePoint = points[idx];
      
      const newPos = basePoint.position.clone();
      
      result.push({
        position: newPos,
        // Because the engine natively uses Additive Blending, pushing strict RGB(0,0,0) mathematically
        // zeros out their visual impact completely! This lets shapes request extremely sparse densities 
        // without identical points painfully compounding brightness recursively.
        color: new THREE.Color(0, 0, 0)
      });
    }
  }
  
  // Apply jitter
  return applyJitter(result, rng, jitterAmount);
}

function applyJitter(points: SampledPoint[], rng: SeededRandom, amount: number): SampledPoint[] {
  if (amount <= 0) return points;
  
  for (const p of points) {
    p.position.x += rng.range(-amount, amount);
    p.position.y += rng.range(-amount, amount);
    p.position.z += rng.range(-amount, amount);
  }
  
  return points;
}
