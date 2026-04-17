import * as THREE from 'three';

export async function initGLTFImporter() {
  if (!window.location.search.includes('registerobject=true')) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.95); z-index: 100000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: monospace; padding: 2rem; box-sizing: border-box;
  `;
  
  const closeBtn = document.createElement('div');
  closeBtn.style.cssText = `position:absolute; top:2rem; right:2rem; cursor:pointer; font-size:1.5rem;`;
  closeBtn.innerText = "✕";
  closeBtn.onclick = () => overlay.remove();
  overlay.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.innerText = "Birkfield Object Importer";
  title.style.marginBottom = "2rem";
  overlay.appendChild(title);

  const dropZone = document.createElement('div');
  dropZone.style.cssText = `
    width: 100%; max-width: 600px; height: 200px; 
    border: 3px dashed #888; border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 1.2rem; margin-bottom: 2rem; transition: all 0.2s;
  `;
  dropZone.innerHTML = `<div>Drag & Drop <b>.glb</b> or <b>.gltf</b> from Blender</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">Ensure meshes are named "Sphere", "Cube", "Cylinder", or "Torus" to properly cast primitives.</div>`;

  const output = document.createElement('textarea');
  output.style.cssText = `
    width: 100%; max-width: 800px; height: 350px;
    background: #111; color: #0f0; border: 1px solid #333;
    padding: 1rem; font-family: monospace; display: none; margin-bottom:1rem;
  `;

  overlay.appendChild(dropZone);
  overlay.appendChild(output);
  document.body.appendChild(overlay);

  dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = '#fff'; dropZone.style.background = 'rgba(255,255,255,0.1)'; };
  dropZone.ondragleave = (e) => { e.preventDefault(); dropZone.style.borderColor = '#888'; dropZone.style.background = 'transparent'; };
  dropZone.ondrop = async (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#888'; dropZone.style.background = 'transparent';
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    dropZone.innerHTML = `Processing ${file.name}...`;

    try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        
        const url = URL.createObjectURL(file);
        
        loader.load(url, (gltf) => {
            const codeBlocks: string[] = [];
            
            gltf.scene.traverse((node: any) => {
                if (node.isMesh) {
                    const name = node.name.toLowerCase();
                    const matColor = node.material && node.material.color ? node.material.color.getHexString() : 'ffffff';
                    
                    let densityMult = 1.0;
                    
                    // Utilize Mesh string names for exact multipliers, e.g. "Sphere.density3.5" or "Cube.density0.2"
                    const nameMatch = name.match(/density(\d+\.?\d*)/);
                    if (nameMatch) {
                        densityMult *= parseFloat(nameMatch[1]);
                    }
                    
                    const worldPos = new THREE.Vector3();
                    const worldQuat = new THREE.Quaternion();
                    const worldScale = new THREE.Vector3();
                    
                    node.getWorldPosition(worldPos);
                    node.getWorldQuaternion(worldQuat);
                    node.getWorldScale(worldScale);
                    
                    const euler = new THREE.Euler().setFromQuaternion(worldQuat);
                    
                    // Measure exact true math limits incase users applied transformations in edit mode!
                    node.geometry.computeBoundingBox();
                    const box = node.geometry.boundingBox;
                    const bW = box.max.x - box.min.x;
                    const bH = box.max.y - box.min.y;
                    const bD = box.max.z - box.min.z;

                    const trueWidth = bW * worldScale.x;
                    const trueHeight = bH * worldScale.y;
                    const trueDepth = bD * worldScale.z;

                    let surfaceArea = 2 * (trueWidth * trueHeight + trueHeight * trueDepth + trueWidth * trueDepth);
                    if (name.includes('sphere')) {
                        const r = ((trueWidth + trueHeight + trueDepth) / 3 / 2);
                        surfaceArea = 4 * Math.PI * r * r;
                    } else if (name.includes('cylinder')) {
                        const r = ((trueWidth + trueDepth) / 4);
                        surfaceArea = 2 * Math.PI * r * trueHeight + 2 * Math.PI * r * r;
                    } else if (name.includes('torus') || name.includes('ring')) {
                         const r = Math.max(trueWidth, trueDepth) / 2;
                         surfaceArea = (2 * Math.PI * r) * (2 * Math.PI * 0.2);
                    }
                    
                    const rawDensity = Math.floor(surfaceArea * 50 * densityMult);
                    if (!gltf.scene.userData.globalRawDensity) gltf.scene.userData.globalRawDensity = 0;
                    if (!gltf.scene.userData.rawMeshStats) gltf.scene.userData.rawMeshStats = [];

                    gltf.scene.userData.globalRawDensity += rawDensity;
                    gltf.scene.userData.rawMeshStats.push({ name, matColor, rawDensity, trueWidth, trueHeight, trueDepth, worldPos, euler });
                }
            });

            const safeGlobalDensity = Math.max(1, gltf.scene.userData.globalRawDensity);
            gltf.scene.userData.rawMeshStats.forEach((mesh: any) => {
                const { name, matColor, rawDensity, trueWidth, trueHeight, trueDepth, worldPos, euler } = mesh;
                
                // Map the entire collection's raw geometric volume directly down into the 1000 point budget mathematically!
                // We enforce a minimum of 10 points so tiny elements don't just completely blink out
                const density = Math.max(10, Math.round((rawDensity / safeGlobalDensity) * 1000));

                const px = worldPos.x.toFixed(3);
                const py = worldPos.y.toFixed(3);
                const pz = worldPos.z.toFixed(3);
                const rx = euler.x.toFixed(3);
                const ry = euler.y.toFixed(3);
                const rz = euler.z.toFixed(3);

                if (name.includes('sphere')) {
                    const r = ((trueWidth + trueHeight + trueDepth) / 3 / 2).toFixed(3);
                    codeBlocks.push(`      points = points.concat(sampleSphere({ radius: ${r}, center: new THREE.Vector3(${px}, ${py}, ${pz}), rotation: new THREE.Euler(${rx}, ${ry}, ${rz}), density: ${density}, color: new THREE.Color('#${matColor}') }, rng));`);
                } else if (name.includes('cylinder')) {
                    const r = ((trueWidth + trueDepth) / 4).toFixed(3);
                    const h = trueHeight.toFixed(3);
                    codeBlocks.push(`      points = points.concat(sampleCylinder({ radiusBottom: ${r}, radiusTop: ${r}, height: ${h}, center: new THREE.Vector3(${px}, ${py}, ${pz}), rotation: new THREE.Euler(${rx}, ${ry}, ${rz}), density: ${density}, color: new THREE.Color('#${matColor}') }, rng));`);
                } else if (name.includes('torus') || name.includes('ring')) {
                     const r = (Math.max(trueWidth, trueDepth) / 2).toFixed(3);
                    codeBlocks.push(`      points = points.concat(sampleTorus({ radius: ${r}, tube: 0.2, center: new THREE.Vector3(${px}, ${py}, ${pz}), rotation: new THREE.Euler(${rx}, ${ry}, ${rz}), density: ${density}, color: new THREE.Color('#${matColor}') }, rng));`);
                } else {
                    codeBlocks.push(`      points = points.concat(sampleBox({ width: ${trueWidth.toFixed(3)}, height: ${trueHeight.toFixed(3)}, depth: ${trueDepth.toFixed(3)}, center: new THREE.Vector3(${px}, ${py}, ${pz}), rotation: new THREE.Euler(${rx}, ${ry}, ${rz}), density: ${density}, color: new THREE.Color('#${matColor}') }, rng));`);
                }
            });

            const objName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
            const tsCode = `
  ${objName}: {
    id: '${objName}',
    generatePoints: (rng) => {
      let points: any[] = [];
${codeBlocks.join('\n')}
      return points;
    }
  }
`;
            output.value = `// Paste this definition into src/objects/objectRegistry.ts inside the objectRegistry:\n\n${tsCode}`;
            output.style.display = 'block';
            output.select();
            
            dropZone.innerHTML = `Loaded! Drop another?`;
            URL.revokeObjectURL(url);
        }, undefined, (err) => {
            dropZone.innerHTML = `<span style="color:red">Parse Error: ${err}</span>`;
        });
    } catch(err: any) {
        dropZone.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
    }
  };
}
