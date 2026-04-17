import * as THREE from 'three';
import { Birkfield } from '../Birkfield';
import type { SectionDef } from '../Birkfield';

export function initModifierPanel(app: Birkfield) {
  // Create UI container
  const container = document.createElement('div');
  container.id = 'birkfield-modifier-panel';
  container.style.position = 'fixed';
  container.style.top = '10px';
  container.style.right = '10px';
  container.style.width = '320px';
  container.style.maxHeight = '90vh';
  container.style.overflowY = 'auto';
  container.style.backgroundColor = 'rgba(20, 20, 25, 0.95)';
  container.style.backdropFilter = 'blur(10px)';
  container.style.color = '#fff';
  container.style.padding = '15px';
  container.style.borderRadius = '8px';
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '12px';
  container.style.zIndex = '999999';
  container.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
  container.style.border = '1px solid #333';

  // Make it draggable
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const titleBar = document.createElement('div');
  titleBar.innerText = '⚙ Birkfield Modifier';
  titleBar.style.fontWeight = 'bold';
  titleBar.style.borderBottom = '1px solid #444';
  titleBar.style.paddingBottom = '10px';
  titleBar.style.marginBottom = '10px';
  titleBar.style.cursor = 'grab';
  titleBar.style.userSelect = 'none';

  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
    titleBar.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.right = 'auto';
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    titleBar.style.cursor = 'grab';
  });

  container.appendChild(titleBar);

  const controlsContainer = document.createElement('div');
  container.appendChild(controlsContainer);

  const copyContainer = document.createElement('div');
  copyContainer.style.position = 'sticky';
  copyContainer.style.bottom = '0';
  copyContainer.style.background = '#111';
  copyContainer.style.padding = '10px 0 0 0';
  copyContainer.style.zIndex = '10';
  container.appendChild(copyContainer);

  document.body.appendChild(container);

  let currentSectionId: string | null = null;
  let activeSectionDef: SectionDef | null = null;
  let activeDOMElement: HTMLElement | null = null;
  let exportOverrides = new Set<string>();
  const openAccordions = new Set<string>();
  let accordionsInited = false;

  const propToDataset: Record<string, string> = {
    foregroundAnchorOffset: 'fgAnchor',
    backgroundAnchorOffset: 'bgAnchor',
    foregroundScale: 'fgScale',
    backgroundScale: 'bgScale',
    foregroundRotation: 'fgRotation',
    backgroundRotation: 'bgRotation'
  };

  // Render loop to track current section
  const updateLoop = () => {
    const sec = app.computeCurrentSection();
    if (sec && sec.id !== currentSectionId) {
      currentSectionId = sec.id;
      activeSectionDef = sec;
      activeDOMElement = document.getElementById(sec.id);

      exportOverrides.clear();
      // Auto-flag any properties explicitly passed via HTML dataset
      if (activeDOMElement) {
         const ds = activeDOMElement.dataset;
         // Hardcoded shapes are always assumed active overrides
         exportOverrides.add('foregroundShape');
         exportOverrides.add('backgroundShape');
         
         const allProps = [
            'fgActivePoints', 'bgActivePoints', 'fgWarpSpeed', 'bgWarpSpeed',
            'fgSize', 'bgSize', 'fgOpacity', 'bgOpacity', 'fgBloom', 'bgBloom', 
            'fgJitter', 'bgJitter', 'fgTransitionSpeed', 'bgTransitionSpeed', 
            'fgRotationSpeed', 'bgRotationSpeed', 'foregroundAnchorOffset', 
            'backgroundAnchorOffset', 'foregroundScale', 'backgroundScale',
            'foregroundRotation', 'backgroundRotation', 'fgMouseMax', 'bgMouseMax',
            'fgMouse', 'bgMouse', 'fgLoose', 'bgLoose'
         ];
         allProps.forEach(p => {
             const dsKey = propToDataset[p] || p;
             if (ds[dsKey] !== undefined) exportOverrides.add(p);
         });
      }

      renderControls();
    }
    requestAnimationFrame(updateLoop);
  };
  requestAnimationFrame(updateLoop);

  function createField(prop: string, renderInput: () => HTMLElement, stackVertically: boolean = false) {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '12px';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = stackVertically ? 'column' : 'row';
    wrapper.style.justifyContent = stackVertically ? 'flex-start' : 'space-between';
    wrapper.style.alignItems = stackVertically ? 'flex-start' : 'center';
    wrapper.style.gap = stackVertically ? '4px' : '0';

    const lblWrapper = document.createElement('div');
    lblWrapper.style.flex = '1';
    lblWrapper.style.display = 'flex';
    lblWrapper.style.alignItems = 'center';
    lblWrapper.style.gap = '5px';
    
    // Ignore checkboxes on purely custom toggles like 'Preview Mode' or native color pickers
    if (!['Preview Mode', 'fgColor1', 'fgColor2', 'bgColor1', 'bgColor2', 'fgColor1Light', 'fgColor2Light', 'bgColor1Light', 'bgColor2Light'].includes(prop)) {
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.checked = exportOverrides.has(prop);
        chk.id = 'override-chk-' + prop;
        chk.onchange = () => {
           if (chk.checked) exportOverrides.add(prop);
           else exportOverrides.delete(prop);
           renderControls(); // cascade disabled styling natively
        };
        lblWrapper.appendChild(chk);
    }

    const lbl = document.createElement('label');
    lbl.innerText = prop;
    lblWrapper.appendChild(lbl);
    
    const inputNode = renderInput();
    
    // Disable styling if not actively checking for an override
    if (!exportOverrides.has(prop) && !['Preview Mode', 'fgColor1', 'fgColor2', 'bgColor1', 'bgColor2', 'fgColor1Light', 'fgColor2Light', 'bgColor1Light', 'bgColor2Light'].includes(prop)) {
        inputNode.style.opacity = '0.3';
        inputNode.style.pointerEvents = 'none';
        
        // Show current engine fallback value explicitly as read-only via internal styles
        if (inputNode.tagName.toLowerCase() === 'input' && (inputNode as any).type !== 'checkbox') {
             (inputNode as HTMLInputElement).style.background = '#111';
             (inputNode as HTMLInputElement).readOnly = true;
        }
    }

    if (stackVertically) {
        inputNode.style.alignSelf = 'flex-end';
    }

    wrapper.appendChild(lblWrapper);
    wrapper.appendChild(inputNode);
    return wrapper;
  }

  function renderControls() {
    controlsContainer.innerHTML = '';
    if (!activeSectionDef) return;

    const header = document.createElement('div');
    header.style.color = '#00ffcc';
    header.style.marginBottom = '10px';
    header.innerText = `Active Section: #${activeSectionDef.id}`;
    controlsContainer.appendChild(header);

    function createAccordion(title: string, parentContent: HTMLElement, isDefaultOpen: boolean = false) {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';
        wrapper.style.border = '1px solid #333';
        wrapper.style.borderRadius = '4px';

        const accHeader = document.createElement('div');
        accHeader.style.padding = '8px';
        accHeader.style.background = '#1a1a20';
        accHeader.style.cursor = 'pointer';
        accHeader.style.fontWeight = 'bold';
        accHeader.style.display = 'flex';
        accHeader.style.justifyContent = 'space-between';
        accHeader.style.fontSize = '12px';
        accHeader.style.color = '#ddd';
        
        const titleSpan = document.createElement('span');
        titleSpan.innerText = title;

        if (!accordionsInited && isDefaultOpen) {
            openAccordions.add(title);
        }
        
        const iconSpan = document.createElement('span');
        const isOpen = openAccordions.has(title);
        iconSpan.innerText = isOpen ? '▼' : '▶';

        accHeader.appendChild(titleSpan);
        accHeader.appendChild(iconSpan);

        const body = document.createElement('div');
        body.style.padding = '10px';
        body.style.background = '#111';
        body.style.display = isOpen ? 'block' : 'none';

        accHeader.onclick = () => {
            if (openAccordions.has(title)) {
                openAccordions.delete(title);
                body.style.display = 'none';
                iconSpan.innerText = '▶';
            } else {
                openAccordions.add(title);
                body.style.display = 'block';
                iconSpan.innerText = '▼';
            }
        };

        wrapper.appendChild(accHeader);
        wrapper.appendChild(body);
        parentContent.appendChild(wrapper);

        return body;
    }

    const accTheme = createAccordion('Theme & Preview', controlsContainer, true);
    const accTransforms = createAccordion('Transforms (Pos/Rot/Scale)', controlsContainer, true);
    const accMotion = createAccordion('Animation & Motion', controlsContainer, false);
    const accRendering = createAccordion('Effects & Colors', controlsContainer, false);
    const accDensity = createAccordion('Geometry Density', controlsContainer, false);
    accordionsInited = true;

    const getTargetAccordion = (prop: string) => {
        if (prop === 'Preview Mode') return accTheme;
        if (['foregroundAnchorOffset', 'backgroundAnchorOffset', 'foregroundScale', 'backgroundScale', 'foregroundRotation', 'backgroundRotation', 'fgSize', 'bgSize'].includes(prop)) return accTransforms;
        if (['fgTransitionSpeed', 'bgTransitionSpeed', 'fgRotationSpeed', 'bgRotationSpeed', 'fgSpinSpeed', 'bgSpinSpeed', 'fgWarpSpeed', 'bgWarpSpeed', 'fgMouseMax', 'bgMouseMax', 'fgMouse', 'bgMouse'].includes(prop)) return accMotion;
        if (['fgActivePoints', 'bgActivePoints'].includes(prop)) return accDensity;
        return accRendering;
    };

    // Theme Toggle
    getTargetAccordion('Preview Mode').appendChild(createField('Preview Mode', () => {
        const select = document.createElement('select');
        select.style.background = '#222';
        select.style.color = '#fff';
        select.style.border = '1px solid #444';
        
        ['dark', 'light'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.innerText = t.toUpperCase();
            if (app.theme === t) opt.selected = true;
            select.appendChild(opt);
        });
        
        select.onchange = () => {
            app.setTheme(select.value as 'dark' | 'light');
        };
        return select;
    }));

    // Number Inputs
    const numberProps = [
        'fgActivePoints', 'bgActivePoints',
        'fgWarpSpeed', 'bgWarpSpeed',
        'fgSpinSpeed', 'bgSpinSpeed',
        'fgSize', 'bgSize', 'fgOpacity', 'bgOpacity', 
        'fgBloom', 'bgBloom', 'fgJitter', 'bgJitter', 
        'fgTransitionSpeed', 'bgTransitionSpeed', 
        'fgRotationSpeed', 'bgRotationSpeed'
    ];

    numberProps.forEach(prop => {
        getTargetAccordion(prop).appendChild(createField(prop, () => {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = prop.toLowerCase().includes('jitter') ? '0.01' : (prop.toLowerCase().includes('points') ? '10' : '0.1');
            input.style.width = '60px';
            input.style.background = '#222';
            input.style.color = '#fff';
            input.style.border = '1px solid #444';
            input.value = String((activeSectionDef as any)[prop]);

            input.oninput = () => {
                if (!exportOverrides.has(prop)) {
                    exportOverrides.add(prop);
                    const chk = document.getElementById('override-chk-' + prop) as HTMLInputElement;
                    if (chk) chk.checked = true;
                    input.style.opacity = '1.0';
                    input.style.pointerEvents = 'auto';
                    input.style.background = '#222';
                }

                const val = parseFloat(input.value);
                if (!isNaN(val)) {
                    (activeSectionDef as any)[prop] = val;
                }
            };
            return input;
        }));
    });

    // Color Inputs
    const colorProps = [
        'fgColor1', 'fgColor2', 'bgColor1', 'bgColor2',
        'fgColor1Light', 'fgColor2Light', 'bgColor1Light', 'bgColor2Light'
    ];
    colorProps.forEach(prop => {
        getTargetAccordion(prop).appendChild(createField(prop, () => {
            const flex = document.createElement('div');
            flex.style.display = 'flex';
            flex.style.gap = '5px';
            flex.style.alignItems = 'center';

            const c = (activeSectionDef as any)[prop];
            const hasOverride = c !== undefined;

            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = hasOverride;

            const input = document.createElement('input');
            input.type = 'color';
            input.value = c ? '#' + c.getHexString() : '#ffffff';
            input.style.border = '1px solid #444';
            input.style.background = '#222';
            input.style.padding = '0';
            input.style.cursor = 'pointer';
            input.style.display = hasOverride ? 'block' : 'none';

            chk.onchange = () => {
                if (chk.checked) {
                    input.style.display = 'block';
                    (activeSectionDef as any)[prop] = new THREE.Color(input.value);
                } else {
                    input.style.display = 'none';
                    (activeSectionDef as any)[prop] = undefined;
                }
                app.setTheme(app.theme); // Force re-bind of arrays
            };

            input.oninput = () => {
                (activeSectionDef as any)[prop] = new THREE.Color(input.value);
            };

            flex.appendChild(chk);
            flex.appendChild(input);
            return flex;
        }));
    });

    // Vector/Euler Inputs
    const vecProps = [
        'foregroundAnchorOffset', 'backgroundAnchorOffset',
        'foregroundScale', 'backgroundScale',
        'foregroundRotation', 'backgroundRotation'
    ];

    vecProps.forEach(prop => {
        getTargetAccordion(prop).appendChild(createField(prop, () => {
            const flex = document.createElement('div');
            flex.style.display = 'flex';
            flex.style.gap = '4px';

            const val = (activeSectionDef as any)[prop];
            const isAuto = val === 'auto';
            
            if (prop.includes('AnchorOffset')) {
                const autoBtn = document.createElement('button');
                autoBtn.innerText = isAuto ? 'Auto: ON' : 'Auto: OFF';
                autoBtn.style.fontSize = '10px';
                autoBtn.style.padding = '2px 4px';
                autoBtn.style.background = isAuto ? '#00cc66' : '#cc0000';
                autoBtn.style.color = '#fff';
                autoBtn.style.border = 'none';
                autoBtn.style.cursor = 'pointer';
                autoBtn.onclick = () => {
                    if ((activeSectionDef as any)[prop] === 'auto') {
                        (activeSectionDef as any)[prop] = new THREE.Vector3(0, 0, 0);
                    } else {
                        (activeSectionDef as any)[prop] = 'auto';
                    }
                    renderControls(); // Re-render to show/hide the vector inputs
                };
                flex.appendChild(autoBtn);
            }

            if (!isAuto) {
                ['x', 'y', 'z'].forEach(axis => {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = '0.1';
                    input.style.width = '50px';
                    input.style.background = '#222';
                    input.style.color = '#fff';
                    input.style.border = '1px solid #444';
                    input.title = axis.toUpperCase(); // hover hint
                    input.value = val ? String(Number(val[axis]).toFixed(2)) : '0';

                    input.oninput = () => {
                        if (!exportOverrides.has(prop)) {
                            exportOverrides.add(prop);
                            const chk = document.getElementById('override-chk-' + prop) as HTMLInputElement;
                            if (chk) chk.checked = true;
                            input.style.opacity = '1.0';
                            input.style.pointerEvents = 'auto';
                            input.style.background = '#222';
                        }
                        
                        const num = parseFloat(input.value);
                        if (!isNaN(num)) {
                            if ((activeSectionDef as any)[prop].isEuler) {
                                (activeSectionDef as any)[prop][axis] = num;
                            } else if ((activeSectionDef as any)[prop].isVector3) {
                                (activeSectionDef as any)[prop][axis] = num;
                            } else {
                                const current = (activeSectionDef as any)[prop];
                                (activeSectionDef as any)[prop] = { x: current.x || 0, y: current.y || 0, z: current.z || 0 };
                                (activeSectionDef as any)[prop][axis] = num;
                            }
                        }
                    };
                    flex.appendChild(input);
                });
            }

            return flex;
        }, true));
    });

    // Vector 2 Inputs
    const vec2Props = ['fgMouseMax', 'bgMouseMax'];
    vec2Props.forEach(prop => {
        getTargetAccordion(prop).appendChild(createField(prop, () => {
            const flex = document.createElement('div');
            flex.style.display = 'flex';
            flex.style.gap = '4px';

            const val = (activeSectionDef as any)[prop];
            ['x', 'y'].forEach(axis => {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.1';
                input.style.width = '50px';
                input.style.background = '#222';
                input.style.color = '#fff';
                input.style.border = '1px solid #444';
                input.title = axis.toUpperCase();
                input.value = val ? String(Number(val[axis]).toFixed(2)) : '0';

                input.oninput = () => {
                    if (!exportOverrides.has(prop)) {
                        exportOverrides.add(prop);
                        const chk = document.getElementById('override-chk-' + prop) as HTMLInputElement;
                        if (chk) chk.checked = true;
                        input.style.opacity = '1.0';
                        input.style.pointerEvents = 'auto';
                        input.style.background = '#222';
                    }
                    
                    const num = parseFloat(input.value);
                    if (!isNaN(num)) {
                        if ((activeSectionDef as any)[prop].isVector2) {
                            (activeSectionDef as any)[prop][axis] = num;
                        } else {
                            const current = (activeSectionDef as any)[prop];
                            (activeSectionDef as any)[prop] = new THREE.Vector2(current?.x || 0, current?.y || 0);
                            (activeSectionDef as any)[prop][axis] = num;
                        }
                    }
                };
                flex.appendChild(input);
            });
            return flex;
        }, true));
    });

    // Boolean Inputs
    const boolProps = ['fgMouse', 'bgMouse', 'fgLoose', 'bgLoose'];
    boolProps.forEach(prop => {
        getTargetAccordion(prop).appendChild(createField(prop, () => {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = !!(activeSectionDef as any)[prop];
            input.onchange = () => {
                if (!exportOverrides.has(prop)) {
                    exportOverrides.add(prop);
                    const chk = document.getElementById('override-chk-' + prop) as HTMLInputElement;
                    if (chk) chk.checked = true;
                }
                (activeSectionDef as any)[prop] = input.checked;
            };
            return input;
        }));
    });

    renderExportButtons();
  }

  function renderExportButtons() {
    copyContainer.innerHTML = '';
    
    const htmlBtn = document.createElement('button');
    htmlBtn.innerText = 'Copy HTML Data Attributes';
    htmlBtn.style.width = '100%';
    htmlBtn.style.padding = '5px';
    htmlBtn.style.marginBottom = '5px';
    htmlBtn.style.background = '#0059e7';
    htmlBtn.style.color = '#fff';
    htmlBtn.style.border = 'none';
    htmlBtn.style.cursor = 'pointer';

    htmlBtn.onclick = () => {
      const html = generateHTMLAttributes();
      navigator.clipboard.writeText(html);
      htmlBtn.innerText = 'Copied!';
      setTimeout(() => htmlBtn.innerText = 'Copy HTML Data Attributes', 2000);
    };

    const tsBtn = document.createElement('button');
    tsBtn.innerText = 'Copy TS Config Preset';
    tsBtn.style.width = '100%';
    tsBtn.style.padding = '5px';
    tsBtn.style.background = '#e75304';
    tsBtn.style.color = '#fff';
    tsBtn.style.border = 'none';
    tsBtn.style.cursor = 'pointer';
    tsBtn.style.marginBottom = '5px';

    tsBtn.onclick = () => {
      const ts = generateTSConfig();
      navigator.clipboard.writeText(ts);
      tsBtn.innerText = 'Copied!';
      setTimeout(() => tsBtn.innerText = 'Copy TS Config Preset', 2000);
    };

    const jsonBtn = document.createElement('button');
    jsonBtn.innerText = 'Copy inline JSON';
    jsonBtn.style.width = '100%';
    jsonBtn.style.padding = '5px';
    jsonBtn.style.background = '#0a8a00';
    jsonBtn.style.color = '#fff';
    jsonBtn.style.border = 'none';
    jsonBtn.style.cursor = 'pointer';

    jsonBtn.onclick = () => {
      const json = generateJSONConfig();
      navigator.clipboard.writeText(json);
      jsonBtn.innerText = 'Copied!';
      setTimeout(() => jsonBtn.innerText = 'Copy inline JSON', 2000);
    };

    copyContainer.appendChild(htmlBtn);
    copyContainer.appendChild(tsBtn);
    copyContainer.appendChild(jsonBtn);
  }

  function generateHTMLAttributes() {
    if (!activeSectionDef) return '';
    const d = activeSectionDef;
    const cEx = (prop: string, str: string) => exportOverrides.has(prop) ? str + '\n' : '';

    let res = `id="${d.id}"\n`;
    res += cEx('foregroundShape', `data-fg-shape="${d.foregroundShape}"`);
    res += cEx('backgroundShape', `data-bg-shape="${d.backgroundShape}"`);
    res += cEx('fgSize', `data-fg-size="${d.fgSize}"`);
    res += cEx('bgSize', `data-bg-size="${d.bgSize}"`);
    res += cEx('fgOpacity', `data-fg-opacity="${d.fgOpacity}"`);
    res += cEx('bgOpacity', `data-bg-opacity="${d.bgOpacity}"`);
    res += cEx('fgBloom', `data-fg-bloom="${d.fgBloom}"`);
    res += cEx('bgBloom', `data-bg-bloom="${d.bgBloom}"`);
    res += cEx('fgJitter', `data-fg-jitter="${d.fgJitter}"`);
    res += cEx('bgJitter', `data-bg-jitter="${d.bgJitter}"`);
    res += cEx('fgActivePoints', `data-fg-active-points="${d.fgActivePoints}"`);
    res += cEx('bgActivePoints', `data-bg-active-points="${d.bgActivePoints}"`);

    if (d.fgColor1) res += `data-fg-color1="#${d.fgColor1.getHexString()}"\n`;
    if (d.fgColor2) res += `data-fg-color2="#${d.fgColor2.getHexString()}"\n`;
    if (d.bgColor1) res += `data-bg-color1="#${d.bgColor1.getHexString()}"\n`;
    if (d.bgColor2) res += `data-bg-color2="#${d.bgColor2.getHexString()}"\n`;
    if (d.fgColor1Light) res += `data-fg-color1-light="#${d.fgColor1Light.getHexString()}"\n`;
    if (d.fgColor2Light) res += `data-fg-color2-light="#${d.fgColor2Light.getHexString()}"\n`;
    if (d.bgColor1Light) res += `data-bg-color1-light="#${d.bgColor1Light.getHexString()}"\n`;
    if (d.bgColor2Light) res += `data-bg-color2-light="#${d.bgColor2Light.getHexString()}"\n`;

    const getAnchorStr = (v: any) => v === 'auto' ? 'auto' : `${Number(v.x).toFixed(2)},${Number(v.y).toFixed(2)},${Number(v.z).toFixed(2)}`;
    
    res += cEx('foregroundAnchorOffset', `data-fg-anchor="${getAnchorStr(d.foregroundAnchorOffset)}"`);
    res += cEx('backgroundAnchorOffset', `data-bg-anchor="${getAnchorStr(d.backgroundAnchorOffset)}"`);
    res += cEx('foregroundScale', `data-fg-scale="${getAnchorStr(d.foregroundScale)}"`);
    res += cEx('backgroundScale', `data-bg-scale="${getAnchorStr(d.backgroundScale)}"`);
    res += cEx('foregroundRotation', `data-fg-rotation="${getAnchorStr(d.foregroundRotation)}"`);
    res += cEx('backgroundRotation', `data-bg-rotation="${getAnchorStr(d.backgroundRotation)}"`);
    res += cEx('fgTransitionSpeed', `data-fg-transition-speed="${d.fgTransitionSpeed}"`);
    res += cEx('bgTransitionSpeed', `data-bg-transition-speed="${d.bgTransitionSpeed}"`);
    res += cEx('fgRotationSpeed', `data-fg-rotation-speed="${d.fgRotationSpeed}"`);
    res += cEx('bgRotationSpeed', `data-bg-rotation-speed="${d.bgRotationSpeed}"`);
    res += cEx('fgSpinSpeed', `data-fg-spin-speed="${d.fgSpinSpeed}"`);
    res += cEx('bgSpinSpeed', `data-bg-spin-speed="${d.bgSpinSpeed}"`);
    res += cEx('fgWarpSpeed', `data-fg-warp-speed="${d.fgWarpSpeed}"`);
    res += cEx('bgWarpSpeed', `data-bg-warp-speed="${d.bgWarpSpeed}"`);
    res += cEx('fgMouseMax', `data-fg-mouse-max="${d.fgMouseMax ? d.fgMouseMax.x + ',' + d.fgMouseMax.y : '15,15'}"`);
    res += cEx('bgMouseMax', `data-bg-mouse-max="${d.bgMouseMax ? d.bgMouseMax.x + ',' + d.bgMouseMax.y : '15,15'}"`);

    res += cEx('fgMouse', `data-fg-mouse="${d.fgMouse}"`);
    res += cEx('bgMouse', `data-bg-mouse="${d.bgMouse}"`);
    res += cEx('fgLoose', `data-fg-loose="${d.fgLoose}"`);
    res += cEx('bgLoose', `data-bg-loose="${d.bgLoose}"`);

    return res.trim().replace(/\n/g, ' ');
  }

  function generateTSConfig() {
    if (!activeSectionDef) return '';
    const d = activeSectionDef;
    const getAnchorStr = (v: any) => v === 'auto' ? "'auto'" : `'${Number(v.x).toFixed(2)},${Number(v.y).toFixed(2)},${Number(v.z).toFixed(2)}'`;
    const cEx = (prop: string, str: string) => exportOverrides.has(prop) ? str + '\n' : '';

    return `{
${cEx('foregroundShape', `  fgShape: '${d.foregroundShape}',`)}${cEx('backgroundShape', `  bgShape: '${d.backgroundShape}',`)}${cEx('fgSize', `  fgSize: ${d.fgSize},`)}${cEx('bgSize', `  bgSize: ${d.bgSize},`)}${cEx('fgOpacity', `  fgOpacity: ${d.fgOpacity},`)}${cEx('bgOpacity', `  bgOpacity: ${d.bgOpacity},`)}${cEx('fgBloom', `  fgBloom: ${d.fgBloom},`)}${cEx('bgBloom', `  bgBloom: ${d.bgBloom},`)}${cEx('fgJitter', `  fgJitter: ${d.fgJitter},`)}${cEx('bgJitter', `  bgJitter: ${d.bgJitter},`)}${cEx('fgActivePoints', `  fgActivePoints: ${d.fgActivePoints},`)}${cEx('bgActivePoints', `  bgActivePoints: ${d.bgActivePoints},`)}${d.fgColor1 ? `  fgColor1: '#${d.fgColor1.getHexString()}',\n` : ''}${d.fgColor2 ? `  fgColor2: '#${d.fgColor2.getHexString()}',\n` : ''}${d.bgColor1 ? `  bgColor1: '#${d.bgColor1.getHexString()}',\n` : ''}${d.bgColor2 ? `  bgColor2: '#${d.bgColor2.getHexString()}',\n` : ''}${d.fgColor1Light ? `  fgColor1Light: '#${d.fgColor1Light.getHexString()}',\n` : ''}${d.fgColor2Light ? `  fgColor2Light: '#${d.fgColor2Light.getHexString()}',\n` : ''}${d.bgColor1Light ? `  bgColor1Light: '#${d.bgColor1Light.getHexString()}',\n` : ''}${d.bgColor2Light ? `  bgColor2Light: '#${d.bgColor2Light.getHexString()}',\n` : ''}${cEx('foregroundAnchorOffset', `  fgAnchor: ${getAnchorStr(d.foregroundAnchorOffset)},`)}${cEx('backgroundAnchorOffset', `  bgAnchor: ${getAnchorStr(d.backgroundAnchorOffset)},`)}${cEx('foregroundScale', `  fgScale: ${getAnchorStr(d.foregroundScale)},`)}${cEx('backgroundScale', `  bgScale: ${getAnchorStr(d.backgroundScale)},`)}${cEx('foregroundRotation', `  fgRotation: ${getAnchorStr(d.foregroundRotation)},`)}${cEx('backgroundRotation', `  bgRotation: ${getAnchorStr(d.backgroundRotation)},`)}${cEx('fgTransitionSpeed', `  fgTransitionSpeed: ${d.fgTransitionSpeed},`)}${cEx('bgTransitionSpeed', `  bgTransitionSpeed: ${d.bgTransitionSpeed},`)}${cEx('fgRotationSpeed', `  fgRotationSpeed: ${d.fgRotationSpeed},`)}${cEx('bgRotationSpeed', `  bgRotationSpeed: ${d.bgRotationSpeed},`)}${cEx('fgSpinSpeed', `  fgSpinSpeed: ${d.fgSpinSpeed},`)}${cEx('bgSpinSpeed', `  bgSpinSpeed: ${d.bgSpinSpeed},`)}${cEx('fgWarpSpeed', `  fgWarpSpeed: ${d.fgWarpSpeed},`)}${cEx('bgWarpSpeed', `  bgWarpSpeed: ${d.bgWarpSpeed},`)}${cEx('fgMouseMax', `  fgMouseMax: '${d.fgMouseMax ? d.fgMouseMax.x + ',' + d.fgMouseMax.y : '15,15'}',`)}${cEx('bgMouseMax', `  bgMouseMax: '${d.bgMouseMax ? d.bgMouseMax.x + ',' + d.bgMouseMax.y : '15,15'}',`)}${cEx('fgMouse', `  fgMouse: ${d.fgMouse},`)}${cEx('bgMouse', `  bgMouse: ${d.bgMouse},`)}${cEx('fgLoose', `  fgLoose: ${d.fgLoose},`)}${cEx('bgLoose', `  bgLoose: ${d.bgLoose},`)}
  // End of exported overrides
}`.replace(/\n\s*\n/g, '\n').replace(/,\n  \/\//, '\n  //');
  }
  function generateJSONConfig() {
    if (!activeSectionDef) return '';
    const d = activeSectionDef;
    const obj: any = {};
    const getAnchorStr = (v: any) => v === 'auto' ? 'auto' : `${Number(v.x).toFixed(2)},${Number(v.y).toFixed(2)},${Number(v.z).toFixed(2)}`;

    if (exportOverrides.has('foregroundShape')) obj.fgShape = d.foregroundShape;
    if (exportOverrides.has('backgroundShape')) obj.bgShape = d.backgroundShape;
    if (exportOverrides.has('fgSize')) obj.fgSize = d.fgSize;
    if (exportOverrides.has('bgSize')) obj.bgSize = d.bgSize;
    if (exportOverrides.has('fgOpacity')) obj.fgOpacity = d.fgOpacity;
    if (exportOverrides.has('bgOpacity')) obj.bgOpacity = d.bgOpacity;
    if (exportOverrides.has('fgBloom')) obj.fgBloom = d.fgBloom;
    if (exportOverrides.has('bgBloom')) obj.bgBloom = d.bgBloom;
    if (exportOverrides.has('fgJitter')) obj.fgJitter = d.fgJitter;
    if (exportOverrides.has('bgJitter')) obj.bgJitter = d.bgJitter;
    if (exportOverrides.has('fgActivePoints')) obj.fgActivePoints = d.fgActivePoints;
    if (exportOverrides.has('bgActivePoints')) obj.bgActivePoints = d.bgActivePoints;
    
    if (d.fgColor1) obj.fgColor1 = '#' + d.fgColor1.getHexString();
    if (d.fgColor2) obj.fgColor2 = '#' + d.fgColor2.getHexString();
    if (d.bgColor1) obj.bgColor1 = '#' + d.bgColor1.getHexString();
    if (d.bgColor2) obj.bgColor2 = '#' + d.bgColor2.getHexString();
    if (d.fgColor1Light) obj.fgColor1Light = '#' + d.fgColor1Light.getHexString();
    if (d.fgColor2Light) obj.fgColor2Light = '#' + d.fgColor2Light.getHexString();
    if (d.bgColor1Light) obj.bgColor1Light = '#' + d.bgColor1Light.getHexString();
    if (d.bgColor2Light) obj.bgColor2Light = '#' + d.bgColor2Light.getHexString();

    if (exportOverrides.has('foregroundAnchorOffset')) obj.fgAnchor = getAnchorStr(d.foregroundAnchorOffset);
    if (exportOverrides.has('backgroundAnchorOffset')) obj.bgAnchor = getAnchorStr(d.backgroundAnchorOffset);
    if (exportOverrides.has('foregroundScale')) obj.fgScale = getAnchorStr(d.foregroundScale);
    if (exportOverrides.has('backgroundScale')) obj.bgScale = getAnchorStr(d.backgroundScale);
    if (exportOverrides.has('foregroundRotation')) obj.fgRotation = getAnchorStr(d.foregroundRotation);
    if (exportOverrides.has('backgroundRotation')) obj.bgRotation = getAnchorStr(d.backgroundRotation);
    
    if (exportOverrides.has('fgTransitionSpeed')) obj.fgTransitionSpeed = d.fgTransitionSpeed;
    if (exportOverrides.has('bgTransitionSpeed')) obj.bgTransitionSpeed = d.bgTransitionSpeed;
    if (exportOverrides.has('fgRotationSpeed')) obj.fgRotationSpeed = d.fgRotationSpeed;
    if (exportOverrides.has('bgRotationSpeed')) obj.bgRotationSpeed = d.bgRotationSpeed;
    if (exportOverrides.has('fgSpinSpeed')) obj.fgSpinSpeed = d.fgSpinSpeed;
    if (exportOverrides.has('bgSpinSpeed')) obj.bgSpinSpeed = d.bgSpinSpeed;
    if (exportOverrides.has('fgWarpSpeed')) obj.fgWarpSpeed = d.fgWarpSpeed;
    if (exportOverrides.has('bgWarpSpeed')) obj.bgWarpSpeed = d.bgWarpSpeed;
    
    if (exportOverrides.has('fgMouseMax')) obj.fgMouseMax = d.fgMouseMax ? `${d.fgMouseMax.x},${d.fgMouseMax.y}` : '15,15';
    if (exportOverrides.has('bgMouseMax')) obj.bgMouseMax = d.bgMouseMax ? `${d.bgMouseMax.x},${d.bgMouseMax.y}` : '15,15';
    
    if (exportOverrides.has('fgMouse')) obj.fgMouse = d.fgMouse;
    if (exportOverrides.has('bgMouse')) obj.bgMouse = d.bgMouse;
    if (exportOverrides.has('fgLoose')) obj.fgLoose = d.fgLoose;
    if (exportOverrides.has('bgLoose')) obj.bgLoose = d.bgLoose;

    return JSON.stringify(obj);
  }
}
