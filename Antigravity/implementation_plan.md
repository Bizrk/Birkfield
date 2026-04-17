# Three.js Particle Morph Demo - Implementation Plan

## Phase 1: Scaffold (Completed)
- Vite TypeScript app created
- Three.js installed
- Next: Set up basic HTML/CSS with stacked demo sections
- Next: Initialize Three.js scene, camera, renderer

## Phase 2: Primitive Sampling System
- Implement `utils` (lerp, vec3, color, seededRandom)
- Implement `primitives/transforms.ts`
- Implement `primitives/sampleBox.ts`
- Implement `primitives/sampleSphere.ts`
- Implement `primitives/sampleCylinder.ts`
- Implement `primitives/sampleTorus.ts`

## Phase 3: Object Target Generation
- Implement `objects/normalizePointSet.ts`
- Implement `objects/buildObjectTarget.ts`
- Implement `objects/objectRegistry.ts` (define demo shapes: tripleSpheres, fiveCubes, cylinderTower, ringCluster)

## Phase 4: Bucket System (A / B / C)
- Implement `particles/bucketTypes.ts`
- Implement `particles/createBucket.ts`
- Implement `particles/updateBucket.ts`
- Implement `particles/particleSystem.ts`

## Phase 5: Section Leapfrog Logic
- Implement HTML rendering logic or fixed mock sections in `demo/createDemoSections.ts`
- Implement `sections/sectionConfig.ts`
- Implement `sections/sectionState.ts`
- Implement `sections/scrollState.ts`
- Implement `sections/computeSectionProgress.ts`

## Phase 6: Motion & Interaction
- Implement `motion/easing.ts`
- Implement `motion/transitionBlends.ts`
- Implement `motion/idleMotion.ts`
- Connect loop in `three/renderLoop.ts`

## Phase 7: Polish
- Refine colors and styling
- Add reduced motion fallback
- Clean up unused files and ensure responsive resizing works
