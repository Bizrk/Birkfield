# Customizing the Particle Morph Demo

This guide explains how to hook into the underlying systems of the Particle Morph Demo to build your own distinct objects, map them to scroll sections, and tweak the timing properties of the motion profiles.

## 1. System Architecture Refresher

The visual logic operates under a **"Leapfrog"** bucket system:
- **Bucket A and Bucket B** alternate between foreground and background roles per section.
  - While one bucket forms a tight, distinct hero object, the other bucket forms the larger, dispersed "loose proto-object" behind it.
  - Since both exist locally on the GPU simultaneously, no points are destroyed; they are just mathematically transitioned between targets.
- **Bucket C** consistently acts as the structural "Ambient Noise" layer holding the composition together without forming hero shapes.

## 2. Creating Custom Objects

To define a new shape, you won't import a 3D model. Instead, we use mathematical primitive grouping to predictably sample specific points into an array. 

### Step 1: Open `src/objects/objectRegistry.ts`
This registry holds all the definitions used by the system mapping out available forms. To add a new one, add a key to the `objectRegistry` export:

```ts
  myCustomShape: {
    id: 'myCustomShape',
    generatePoints: (rng) => {
      let points = [];
      
      // Combine whatever primitive samplers you want here:
      // sampleBox, sampleSphere, sampleCylinder, sampleTorus
      
      points = points.concat(sampleBox({
        width: 2, height: 2, depth: 2,
        center: new THREE.Vector3(0, 0, 0),
        density: 500, // Points this shape tries to claim
        color: new THREE.Color('#ff0055')
      }, rng));

      // Return the merged primitives.
      return points;
    }
  }
```

*Note: You don't have to worry about hitting EXACTLY 1000 points. The Normalization engine (`src/objects/normalizePointSet.ts`) will cleanly scale, deduplicate, or resample the raw arrays until they flawlessly match the bucket sizes.*

## 3. Mapping Objects to Scroll Sections

Once you have a custom object definition, you need to map it to a scroll section.

### Step 1: Add HTML Structure
In `index.html`, add a section with an `id` matching what you plan to configure:
```html
<section class="birkfield-target" id="section-my-new-one">
  <div class="content">Your Text</div>
  <div class="anchor-region"></div>
</section>
```

### Step 2: Register in `src/sections/sectionConfig.ts`
The sequence in `demoSections` controls what shape appears when that HTML element enters view. Update the array to assign your new object:

```ts
{
  id: 'section-my-new-one',
  objectId: 'myCustomShape', // Your shape ID
  foregroundBucket: 'A',     // Make sure it alternates with the previous section
  backgroundBucket: 'B',     // Example: if previous foreground was 'B', make this one 'A'
  foregroundScale: new THREE.Vector3(1, 1, 1),
  backgroundScale: new THREE.Vector3(0.5, 0.5, 0.5),
  foregroundAnchorOffset: new THREE.Vector3(3, 0, 0), // Position shift
  backgroundAnchorOffset: new THREE.Vector3(-3, 0, -5), // Position shift
  foregroundRotation: new THREE.Euler(0, 0, 0),
  backgroundRotation: new THREE.Euler(0, 0, 0)
}
```

## 4. Tuning Motion, Speds, and Idle Timing

Motion is split into three main areas that are fully tweakable.

### A. Idle Motion (Breathing / Sine movement)
**File: `src/motion/idleMotion.ts`**
Controls what the objects do when you *aren't* scrolling.
- `amplitudeX` / `amplitudeY`: Modifies how wide the "boomerang" sweep is.
- `speed`: Increases frequency of the sine loop offset.

### B. Frame Interpolation / Morph Snap Speed
**File: `src/particles/updateBucket.ts`**
Controls how closely the objects stick to their target vertices (the "snappiness").
- Look for: `const alpha = 1.0 - Math.pow(1.0 - transitionProgress, dt * 60);`
- Increasing `transitionProgress` inside `createBucket.ts` baseline (e.g. from `0.05` to `0.2`) will make the points snap vastly faster. Lower numbers yield sluggish ease-in morphs.

### C. Scroll Follow Delay 
**File: `src/main.ts`**
Controls the physical delay objects have while shifting across the page bounding boxes.
- Look for: ``bucket.anchor.lerp(targetAnchor, dt * 2.5);``
- Increasing the multiplier here speeds up how fast the bounding box moves toward the active HTML anchor points, independent of the individual points' morph rates.
