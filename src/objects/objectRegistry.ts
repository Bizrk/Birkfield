import * as THREE from 'three';
import type { ObjectDefinition } from '@birkfield/core';
import { sampleSphere, sampleBox, sampleCylinder, sampleTorus } from '@birkfield/core';

export const objectRegistry: Record<string, ObjectDefinition> = {
  // Paste this definition into src/objects/objectRegistry.ts inside the objectRegistry:


  prims: {
    id: 'prims',
    generatePoints: (rng) => {
      let points: any[] = [];
      points = points.concat(sampleBox({ width: 2.000, height: 2.000, depth: 2.000, center: new THREE.Vector3(-4.075, 0.000, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 1200, color: new THREE.Color('#e75304') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 2.000, depth: 2.000, center: new THREE.Vector3(-4.075, 2.325, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 4800, color: new THREE.Color('#e75304') }, rng));
      points = points.concat(sampleSphere({ radius: 1.000, center: new THREE.Vector3(-1.486, 0.000, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 628, color: new THREE.Color('#0059e7') }, rng));
      points = points.concat(sampleSphere({ radius: 1.000, center: new THREE.Vector3(-1.486, 2.252, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 628, color: new THREE.Color('#0059e7') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 2.000, depth: 2.000, center: new THREE.Vector3(1.258, 0.000, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 1200, color: new THREE.Color('#e700bd') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 2.000, depth: 2.000, center: new THREE.Vector3(1.258, 2.215, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 1200, color: new THREE.Color('#e700bd') }, rng));
      points = points.concat(sampleTorus({ radius: 1.250, tube: 0.2, center: new THREE.Vector3(4.130, 0.000, 0.000), rotation: new THREE.Euler(1.571, 0.000, 0.000), density: 493, color: new THREE.Color('#e7e7e7') }, rng));
      points = points.concat(sampleTorus({ radius: 1.250, tube: 0.2, center: new THREE.Vector3(4.130, 0.000, 0.000), rotation: new THREE.Euler(1.571, 0.000, 0.000), density: 986, color: new THREE.Color('#e7e7e7') }, rng));
      points = points.concat(sampleTorus({ radius: 1.250, tube: 0.2, center: new THREE.Vector3(4.130, 2.534, 0.000), rotation: new THREE.Euler(1.571, 0.000, 0.000), density: 493, color: new THREE.Color('#e7e7e7') }, rng));
      return points;
    }
  }


  ,
  microscope: {
    id: 'microscope',
    generatePoints: (rng) => {
      let points: any[] = [];
      points = points.concat(sampleCylinder({ radiusBottom: 1.000, radiusTop: 1.000, height: 5.438, center: new THREE.Vector3(0.000, 3.318, 0.000), rotation: new THREE.Euler(-0.520, 0.000, 0.000), density: 300, color: new THREE.Color('#e75304') }, rng));
      points = points.concat(sampleBox({ width: 0.374, height: 3.048, depth: 2.000, center: new THREE.Vector3(1.331, 1.012, -0.866), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#00e704') }, rng));
      points = points.concat(sampleBox({ width: 0.374, height: 3.048, depth: 2.000, center: new THREE.Vector3(-1.413, 1.012, -0.866), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#00e704') }, rng));
      points = points.concat(sampleBox({ width: 0.374, height: 1.152, depth: 0.803, center: new THREE.Vector3(1.331, 4.194, -0.866), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#e7e7e7') }, rng));
      points = points.concat(sampleBox({ width: 0.374, height: 1.152, depth: 0.803, center: new THREE.Vector3(-1.413, 4.194, -0.866), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#e7e7e7') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.416, radiusTop: 0.416, height: 1.015, center: new THREE.Vector3(0.000, 6.117, -1.987), rotation: new THREE.Euler(-0.520, 0.000, 0.000), density: 300, color: new THREE.Color('#ffffff') }, rng));
      points = points.concat(sampleBox({ width: 6.654, height: 0.336, depth: 6.654, center: new THREE.Vector3(0.000, 0.000, 0.000), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#0059e7') }, rng));
      points = points.concat(sampleTorus({ radius: 0.653, tube: 0.2, center: new THREE.Vector3(0.000, 0.263, 1.842), rotation: new THREE.Euler(0.000, 0.000, 0.000), density: 300, color: new THREE.Color('#e700bd') }, rng));
      return points;
    }
  }
  ,


  tripleSpheres: {
    id: 'tripleSpheres',
    generatePoints: (rng) => {
      const p1 = sampleSphere({
        radius: 1.5,
        center: new THREE.Vector3(0, 0, 0),
        density: 400,
        color: new THREE.Color('#3888ff')
      }, rng);
      const p2 = sampleSphere({
        radius: 0.8,
        center: new THREE.Vector3(-2, 1, 0),
        density: 200,
        color: new THREE.Color('#ff3864')
      }, rng);
      const p3 = sampleSphere({
        radius: 0.8,
        center: new THREE.Vector3(2, -1, 0),
        density: 200,
        color: new THREE.Color('#00ffcc')
      }, rng);
      return [...p1, ...p2, ...p3];
    }
  },

  fiveCubes: {
    id: 'fiveCubes',
    generatePoints: (rng) => {
      let points: any[] = [];
      const colors = ['#f44336', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50'];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 2;
        points = points.concat(sampleBox({
          width: 1, height: 1.5, depth: 1,
          center: new THREE.Vector3(Math.cos(angle) * radius, (i - 2) * 0.5, Math.sin(angle) * radius),
          rotation: new THREE.Euler(rng.range(0, Math.PI), rng.range(0, Math.PI), 0),
          density: 160,
          color: new THREE.Color(colors[i])
        }, rng));
      }
      return points;
    }
  },

  cylinderTower: {
    id: 'cylinderTower',
    generatePoints: (rng) => {
      let points: any[] = [];
      points = points.concat(sampleCylinder({
        radiusBottom: 1.5, radiusTop: 1.0, height: 3,
        center: new THREE.Vector3(0, -1.5, 0),
        density: 300,
        color: new THREE.Color('#e0dfdf')
      }, rng));
      points = points.concat(sampleCylinder({
        radiusBottom: 1.0, radiusTop: 0.5, height: 2.5,
        center: new THREE.Vector3(0, 1.25, 0),
        density: 250,
        color: new THREE.Color('#b3b3b3')
      }, rng));
      points = points.concat(sampleCylinder({
        radiusBottom: 0.5, radiusTop: 0.1, height: 2,
        center: new THREE.Vector3(0, 3.5, 0),
        density: 150,
        color: new THREE.Color('#ff8f00')
      }, rng));
      return points;
    }
  },

  ringCluster: {
    id: 'ringCluster',
    generatePoints: (rng) => {
      let points: any[] = [];
      for (let i = 0; i < 3; i++) {
        points = points.concat(sampleTorus({
          radius: 2 - i * 0.4,
          tube: 0.1 + i * 0.05,
          center: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(rng.range(0, Math.PI), rng.range(0, Math.PI), 0),
          density: 300,
          color: new THREE.Color().setHSL(0.1 + i * 0.3, 0.8, 0.6)
        }, rng));
      }
      return points;
    }
  },

  imageBorder: {
    id: 'imageBorder',
    generatePoints: (rng) => {
      let points: any[] = [];
      const thickness = 0.15;
      const length = 4.0;
      const c = new THREE.Color('#ffffff');
      // Top Edge
      points = points.concat(sampleBox({ width: length, height: thickness, depth: thickness, center: new THREE.Vector3(0, 2, 0), density: 50, color: c }, rng));
      // Bottom Edge
      points = points.concat(sampleBox({ width: length, height: thickness, depth: thickness, center: new THREE.Vector3(0, -2, 0), density: 50, color: c }, rng));
      // Left Edge
      points = points.concat(sampleBox({ width: thickness, height: length, depth: thickness, center: new THREE.Vector3(-2, 0, 0), density: 50, color: c }, rng));
      // Right Edge
      points = points.concat(sampleBox({ width: thickness, height: length, depth: thickness, center: new THREE.Vector3(2, 0, 0), density: 50, color: c }, rng));

      return points;
    }
  },
  // Paste this definition into src/objects/objectRegistry.ts inside the objectRegistry:


  // Paste this definition into src/objects/objectRegistry.ts inside the objectRegistry:


  templebg: {
    id: 'templebg',
    generatePoints: (rng) => {
      let points: any[] = [];
      points = points.concat(sampleBox({ width: 19.163, height: 0.230, depth: 19.163, center: new THREE.Vector3(-0.047, 0.000, -3.657), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 2000, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-7.028, 0.485, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(-7.028, 3.529, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-7.028, 6.555, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(6.971, 0.485, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(6.971, 3.529, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(6.971, 6.555, 2.983), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-4.067, 0.485, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(-4.067, 3.529, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-4.067, 6.555, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(3.947, 0.485, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(3.947, 3.529, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(3.947, 6.555, -1.857), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-1.012, 0.485, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(-1.012, 3.529, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(-1.012, 6.555, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(0.986, 0.485, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleCylinder({ radiusBottom: 0.691, radiusTop: 0.691, height: 5.432, center: new THREE.Vector3(0.986, 3.529, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 150, color: new THREE.Color('#898989') }, rng));
      points = points.concat(sampleBox({ width: 2.000, height: 0.705, depth: 2.000, center: new THREE.Vector3(0.986, 6.555, -7.337), rotation: new THREE.Euler(0.000, -1.571, 0.000), density: 75, color: new THREE.Color('#898989') }, rng));
      return points;
    }
  }
  ,
  temple: {
    id: 'temple',
    generatePoints: (rng) => {
      let points: any[] = [];
      // Dark base colors, will be used as a multiplier against html color overrides
      const floorColor = new THREE.Color(0.4, 0.4, 0.4);
      const pillarColor = new THREE.Color(1.0, 1.0, 1.0);

      // Giant Floor spanning deep into the Z-axis
      points = points.concat(sampleBox({ width: 30, height: 0.2, depth: 30, center: new THREE.Vector3(0, -3, -10), density: 300, color: floorColor }, rng));

      // Generating 2 rows of symmetrical columns leading into the depth
      for (let i = 0; i < 5; i++) {
        const zPos = -2 - (i * 5); // Spaces columns deeper and deeper

        // Left pillar
        points = points.concat(sampleCylinder({ radiusBottom: 0.6, radiusTop: 0.6, height: 10, center: new THREE.Vector3(-6, 2, zPos), density: 70, color: pillarColor }, rng));
        // Right pillar
        points = points.concat(sampleCylinder({ radiusBottom: 0.6, radiusTop: 0.6, height: 10, center: new THREE.Vector3(6, 2, zPos), density: 70, color: pillarColor }, rng));
      }
      return points;
    }
  },

  statue: {
    id: 'statue',
    generatePoints: (rng) => {
      let points: any[] = [];
      const coreColor = new THREE.Color('#ffffff');
      const ghostColor = new THREE.Color(0.2, 0.2, 0.2);

      // Hierarchical base/pedestal
      points = points.concat(sampleBox({ width: 4, height: 1.5, depth: 4, center: new THREE.Vector3(0, -2.25, 0), density: 750, color: coreColor }, rng));
      points = points.concat(sampleBox({ width: 2.5, height: 0.8, depth: 2.5, center: new THREE.Vector3(0, -1.1, 0), density: 500, color: coreColor }, rng));

      // Torso & Shoulders
      points = points.concat(sampleBox({ width: 2.5, height: 3.5, depth: 1.2, center: new THREE.Vector3(0, 1.05, 0), density: 1250, color: coreColor }, rng));

      // Head
      points = points.concat(sampleSphere({ radius: 0.8, center: new THREE.Vector3(0, 4.0, 0), density: 600, color: coreColor }, rng));

      // Abstract geometric "Aura" floating concentrically around the statue
      points = points.concat(sampleTorus({ radius: 4, tube: 0.05, center: new THREE.Vector3(0, 1, 0), rotation: new THREE.Euler(1, 0, 0), density: 750, color: ghostColor }, rng));
      points = points.concat(sampleTorus({ radius: 4, tube: 0.05, center: new THREE.Vector3(0, 1, 0), rotation: new THREE.Euler(-1, 0, 0), density: 750, color: ghostColor }, rng));

      return points;
    }
  }
};
