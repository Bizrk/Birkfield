import * as THREE from 'three';
import { initScene } from './three/initScene';
import { initParticleSystem, type MainParticleSystem } from './particles/particleSystem';
import { setBucketTarget } from './particles/createBucket';
import { updateBucket } from './particles/updateBucket';
import { applyIdleMotion } from './motion/idleMotion';
import { buildObjectTarget, type ObjectTargetStates, type ObjectDefinition } from './objects/buildObjectTarget';

export interface BirkfieldOptions {
  container: HTMLElement;
  sectionSelector?: string;
  objects: Record<string, ObjectDefinition>;
  bucketSize?: number;
  zIndex?: number | string; // Controls if scene renders behind or in front of DOM
  configs?: Record<string, ConfigPreset>; // Pre-defined section configurations
  defaultConfig?: ConfigPreset; // Global fallback properties
}

export interface ConfigPreset {
  fgShape?: string;
  bgShape?: string;
  fgSizeDark?: number;
  bgSizeDark?: number;
  fgSizeLight?: number;
  bgSizeLight?: number;
  fgOpacity?: number;
  bgOpacity?: number;
  fgBloom?: number;
  bgBloom?: number;
  fgJitter?: number;
  bgJitter?: number;
  fgColorDark1?: string;
  fgColorDark2?: string;
  bgColorDark1?: string;
  bgColorDark2?: string;
  fgAnchor?: string;
  bgAnchor?: string;
  fgAnchorMobile?: string;
  bgAnchorMobile?: string;
  zIndex?: string;
  fgMouse?: boolean;
  bgMouse?: boolean;
  fgLoose?: boolean;
  bgLoose?: boolean;
  fgTransitionSpeed?: number;
  bgTransitionSpeed?: number;
  fgRotation?: string;
  bgRotation?: string;
  fgScale?: string;
  bgScale?: string;
  fgScaleMobile?: string;
  bgScaleMobile?: string;
  fgRotationSpeed?: number;
  bgRotationSpeed?: number;
  fgSpinSpeed?: number;
  bgSpinSpeed?: number;
  fgColorLight1?: string;
  fgColorLight2?: string;
  bgColorLight1?: string;
  bgColorLight2?: string;
  fgActivePoints?: number;
  bgActivePoints?: number;
  fgWarpSpeed?: number;
  bgWarpSpeed?: number;
  fgMouseMax?: string;
  bgMouseMax?: string;
  themeMode?: 'auto' | 'inverted' | 'light' | 'dark';
}

export interface SectionDef {
  id: string;
  foregroundShape: string;
  backgroundShape: string;
  fgSizeDark: number;
  bgSizeDark: number;
  fgSizeLight: number;
  bgSizeLight: number;
  fgOpacity: number;
  bgOpacity: number;
  fgBloom: number;
  bgBloom: number;
  fgJitter: number;
  bgJitter: number;
  fgColorDark1?: THREE.Color;
  fgColorDark2?: THREE.Color;
  bgColorDark1?: THREE.Color;
  bgColorDark2?: THREE.Color;
  fgColorLight1?: THREE.Color;
  fgColorLight2?: THREE.Color;
  bgColorLight1?: THREE.Color;
  bgColorLight2?: THREE.Color;
  foregroundAnchorOffset: THREE.Vector3 | 'auto';
  backgroundAnchorOffset: THREE.Vector3 | 'auto';
  fgAnchorMobileRaw?: THREE.Vector3 | 'auto';
  bgAnchorMobileRaw?: THREE.Vector3 | 'auto';
  foregroundScale: THREE.Vector3;
  backgroundScale: THREE.Vector3;
  fgScaleMobileRaw?: THREE.Vector3;
  bgScaleMobileRaw?: THREE.Vector3;
  foregroundRotation: THREE.Euler;
  backgroundRotation: THREE.Euler;
  foregroundBucket: 'A' | 'B';
  domAnchorElement?: HTMLElement | null;
  zIndex?: string; // Controls dynamic background/foreground swapping per section
  fgMouse: boolean;
  bgMouse: boolean;
  fgLoose: boolean;
  bgLoose: boolean;
  fgTransitionSpeed: number;
  bgTransitionSpeed: number;
  fgRotationSpeed: number;
  bgRotationSpeed: number;
  fgActivePoints: number;
  bgActivePoints: number;
  fgWarpSpeed: number;
  bgWarpSpeed: number;
  fgSpinSpeed: number;
  bgSpinSpeed: number;
  fgMouseMax: THREE.Vector2;
  bgMouseMax: THREE.Vector2;
  themeMode: 'auto' | 'inverted' | 'light' | 'dark';
}

export class Birkfield {
  private options: Required<BirkfieldOptions>;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sys: MainParticleSystem;
  
  private targetCache: Record<string, ObjectTargetStates> = {};
  public sections: SectionDef[] = [];
  private sectionCenters: number[] = [];
  
  private scrollY: number = 0;
  private viewportHeight: number = window.innerHeight;
  
  private activeSectionId: string = '';
  private clock = new THREE.Clock();
  private isDestroyed = false;
  private lastFrameScroll = 0;
  
  public theme: 'dark' | 'light' = 'dark';
  private currentEffectiveTheme: 'dark' | 'light' | '' = '';

  constructor(options: BirkfieldOptions) {
    this.options = {
      container: options.container,
      sectionSelector: options.sectionSelector || '.birkfield-section, .birkfield-target',
      objects: options.objects,
      bucketSize: options.bucketSize || 1000,
      zIndex: options.zIndex !== undefined ? options.zIndex : 0,
      configs: options.configs || {},
      defaultConfig: options.defaultConfig || {}
    };

    // 1. Setup Scene (Apply optional zIndex layer targeting)
    if (this.options.zIndex !== undefined) {
      this.options.container.style.zIndex = this.options.zIndex.toString();
    }
    
    const { scene, camera, renderer } = initScene(this.options.container);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // 2. Setup Particles
    this.sys = initParticleSystem(this.scene, this.options.bucketSize);

    // 3. Cache Object Targets
    for (const [key, def] of Object.entries(this.options.objects)) {
      this.targetCache[key] = buildObjectTarget(def, this.options.bucketSize, 42);
    }

    // Initial theme detection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
       this.setTheme('light');
    }

    // 4. Initialize DOM mapping
    this.parseSectionsFromDOM();
    this.initScrollListener();

    // 5. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private parseAnchor(val: any, fallback: THREE.Vector3 | 'auto'): THREE.Vector3 | 'auto' {
    if (val === 'auto') return 'auto';
    if (!val) return fallback;
    const parts = String(val).split(',').map(s => parseFloat(s.trim()));
    if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new THREE.Vector3(parts[0], parts[1], parts[2]);
    }
    return fallback;
  }

  private parseVector2(val: any, fallback: THREE.Vector2): THREE.Vector2 {
    if (!val) return fallback;
    const parts = String(val).split(',').map(s => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
       return new THREE.Vector2(parts[0], parts[1]);
    }
    return fallback;
  }

  private parseEuler(str: string | null | undefined, def: THREE.Euler): THREE.Euler {
    if (!str) return def;
    const parts = str.split(',').map(Number);
    if (parts.length === 3) return new THREE.Euler(parts[0], parts[1], parts[2]);
    return def;
  }

  // Projects a DOM bounding box onto the 3D plane
  private getDOMObjectTransform(el: HTMLElement | null | undefined, zDepth: number, baseScale: THREE.Vector3): { anchor: THREE.Vector3, scale: THREE.Vector3 } {
    if (!el) return { anchor: new THREE.Vector3(0, 0, zDepth), scale: baseScale };

    const rect = el.getBoundingClientRect();
    
    // 1. Calculate World Anchor (Center of rect)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (centerX / window.innerWidth) * 2 - 1;
    const y = -(centerY / window.innerHeight) * 2 + 1;

    const vec = new THREE.Vector3(x, y, 0.5);
    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();
    
    const distance = (zDepth - this.camera.position.z) / vec.z;
    const anchor = new THREE.Vector3().copy(this.camera.position).add(vec.multiplyScalar(distance));

    // 2. Calculate World Scale (Width of rect)
    const xEdge = (rect.left / window.innerWidth) * 2 - 1;
    const vecEdge = new THREE.Vector3(xEdge, y, 0.5);
    vecEdge.unproject(this.camera);
    vecEdge.sub(this.camera.position).normalize();
    const distanceEdge = (zDepth - this.camera.position.z) / vecEdge.z;
    const leftAnchor = new THREE.Vector3().copy(this.camera.position).add(vecEdge.multiplyScalar(distanceEdge));

    const width3D = Math.abs(anchor.x - leftAnchor.x) * 2;

    // 3. Calculate World Scale (Height of rect)
    const yEdge = -(rect.top / window.innerHeight) * 2 + 1;
    const vecTop = new THREE.Vector3(x, yEdge, 0.5);
    vecTop.unproject(this.camera);
    vecTop.sub(this.camera.position).normalize();
    const distanceTop = (zDepth - this.camera.position.z) / vecTop.z;
    const topAnchor = new THREE.Vector3().copy(this.camera.position).add(vecTop.multiplyScalar(distanceTop));

    const height3D = Math.abs(anchor.y - topAnchor.y) * 2;

    // Constrain scale to smallest dimension so object always perfectly fits inside the target
    const fitDimension = Math.min(width3D, height3D);
    const targetScale = fitDimension / 4.0; 

    return { 
        anchor, 
        scale: new THREE.Vector3(targetScale, targetScale, targetScale)
    };
  }

  public parseSectionsFromDOM() {
    const elements = document.querySelectorAll(this.options.sectionSelector);
    this.sections = [];
    let toggleA = true;

    // Cache parsing references for cleaner extraction
    const defaultPreset = this.options.defaultConfig || {};

    elements.forEach((el, index) => {
      const ds = (el as HTMLElement).dataset;
      const explicitAnchor = el.querySelector('.anchor-region') as HTMLElement | null;
      const resolvedAnchorElement = explicitAnchor || (el as HTMLElement);
      
      let inlineConfig: Partial<ConfigPreset> = {};
      
      const presetName = ds.birkfieldConfig;
      if (presetName && this.options.configs && this.options.configs[presetName]) {
          inlineConfig = { ...this.options.configs[presetName] };
      }

      const jsonStr = ds.config;
      if (jsonStr) {
          try {
              const parsed = JSON.parse(jsonStr);
              inlineConfig = { ...inlineConfig, ...parsed };
          } catch(e) {
              console.warn(`Birkfield: Invalid JSON in data-config for element #${el.id || 'unknown'}`, e);
          }
      }
      
      // Cascade resolution system
      const getStr = (dsName: string, configKey: keyof ConfigPreset, fallback: string | undefined): string | undefined => {
          if (ds[dsName] !== undefined) return ds[dsName];
          if (inlineConfig[configKey] !== undefined) return String(inlineConfig[configKey]);
          if (defaultPreset[configKey] !== undefined) return String(defaultPreset[configKey]);
          return fallback;
      };
      const getNum = (dsName: string, configKey: keyof ConfigPreset, fallback: number): number => {
          if (ds[dsName] !== undefined) return parseFloat(ds[dsName]!);
          if (inlineConfig[configKey] !== undefined) return Number(inlineConfig[configKey]);
          if (defaultPreset[configKey] !== undefined) return Number(defaultPreset[configKey]);
          return fallback;
      };
      const getBool = (dsName: string, configKey: keyof ConfigPreset, fallback: boolean): boolean => {
          if (ds[dsName] !== undefined) return ds[dsName] === 'true' || ds[dsName] === '';
          if (inlineConfig[configKey] !== undefined) return !!inlineConfig[configKey];
          if (defaultPreset[configKey] !== undefined) return !!defaultPreset[configKey];
          return fallback;
      };
      const getColor = (dsName: string, configKey: keyof ConfigPreset) => {
          const val = getStr(dsName, configKey, undefined);
          return val ? new THREE.Color(val) : undefined;
      };
      const getAnchor = (dsName: string, configKey: keyof ConfigPreset, fallback: THREE.Vector3 | 'auto') => {
          return this.parseAnchor(getStr(dsName, configKey, undefined), fallback);
      };

      const getEuler = (dsName: string, configKey: keyof ConfigPreset, fallback: THREE.Euler) => {
          return this.parseEuler(getStr(dsName, configKey, undefined), fallback);
      };

      const isMobile = window.innerWidth <= 768;

      this.sections.push({
        id: el.id,
        foregroundShape: getStr('fgShape', 'fgShape', Object.keys(this.options.objects)[0])!,
        backgroundShape: getStr('bgShape', 'bgShape', Object.keys(this.options.objects)[0])!,
        fgSizeDark: getNum('fgSizeDark', 'fgSizeDark', 0.8),
        bgSizeDark: getNum('bgSizeDark', 'bgSizeDark', 0.15),
        fgSizeLight: getNum('fgSizeLight', 'fgSizeLight', getNum('fgSizeDark', 'fgSizeDark', 0.8) * 0.35),
        bgSizeLight: getNum('bgSizeLight', 'bgSizeLight', getNum('bgSizeDark', 'bgSizeDark', 0.15) * 0.35),
        fgOpacity: getNum('fgOpacity', 'fgOpacity', 1.0),
        bgOpacity: getNum('bgOpacity', 'bgOpacity', 1.0),
        fgBloom: getNum('fgBloom', 'fgBloom', 1.5),
        bgBloom: getNum('bgBloom', 'bgBloom', 0.1),
        fgJitter: getNum('fgJitter', 'fgJitter', 0.05),
        bgJitter: getNum('bgJitter', 'bgJitter', 0.05),
        fgColorDark1: getColor('fgColorDark1', 'fgColorDark1'),
        fgColorDark2: getColor('fgColorDark2', 'fgColorDark2'),
        bgColorDark1: getColor('bgColorDark1', 'bgColorDark1'),
        bgColorDark2: getColor('bgColorDark2', 'bgColorDark2'),
        fgColorLight1: getColor('fgColorLight1', 'fgColorLight1'),
        fgColorLight2: getColor('fgColorLight2', 'fgColorLight2'),
        bgColorLight1: getColor('bgColorLight1', 'bgColorLight1'),
        bgColorLight2: getColor('bgColorLight2', 'bgColorLight2'),
        // Allow dedicated innerWidth checks specifically designed to natively decouple mobile DOM layout logic
        
        fgAnchorMobileRaw: getAnchor('fgAnchorMobile', 'fgAnchorMobile', undefined as any),
        bgAnchorMobileRaw: getAnchor('bgAnchorMobile', 'bgAnchorMobile', undefined as any),
        fgScaleMobileRaw: getAnchor('fgScaleMobile', 'fgScaleMobile', undefined as any) as THREE.Vector3 | undefined,
        bgScaleMobileRaw: getAnchor('bgScaleMobile', 'bgScaleMobile', undefined as any) as THREE.Vector3 | undefined,

        foregroundAnchorOffset: isMobile 
            ? getAnchor('fgAnchorMobile', 'fgAnchorMobile', getAnchor('fgAnchor', 'fgAnchor', new THREE.Vector3(3, 0, 0)))
            : getAnchor('fgAnchor', 'fgAnchor', new THREE.Vector3(3, 0, 0)),
        backgroundAnchorOffset: isMobile 
            ? getAnchor('bgAnchorMobile', 'bgAnchorMobile', getAnchor('bgAnchor', 'bgAnchor', new THREE.Vector3(-3, 0, -5)))
            : getAnchor('bgAnchor', 'bgAnchor', new THREE.Vector3(-3, 0, -5)),
        foregroundScale: isMobile 
            ? getAnchor('fgScaleMobile', 'fgScaleMobile', getAnchor('fgScale', 'fgScale', new THREE.Vector3(1, 1, 1))) as THREE.Vector3
            : getAnchor('fgScale', 'fgScale', new THREE.Vector3(1, 1, 1)) as THREE.Vector3,
        backgroundScale: isMobile 
            ? getAnchor('bgScaleMobile', 'bgScaleMobile', getAnchor('bgScale', 'bgScale', new THREE.Vector3(0.5, 0.5, 0.5))) as THREE.Vector3
            : getAnchor('bgScale', 'bgScale', new THREE.Vector3(0.5, 0.5, 0.5)) as THREE.Vector3,
        foregroundRotation: getEuler('fgRotation', 'fgRotation', new THREE.Euler(0, index * 0.2, 0)),
        backgroundRotation: getEuler('bgRotation', 'bgRotation', new THREE.Euler(0, 0, 0)),
        foregroundBucket: toggleA ? 'A' : 'B',
        fgLoose: getBool('fgLoose', 'fgLoose', false), // default foregrounds resolve cleanly
        bgLoose: getBool('bgLoose', 'bgLoose', true),  // default backgrounds scatter into clouds
        domAnchorElement: resolvedAnchorElement,
        zIndex: getStr('zIndex', 'zIndex', undefined),
        fgMouse: getBool('fgMouse', 'fgMouse', true),
        bgMouse: getBool('bgMouse', 'bgMouse', true),
        fgTransitionSpeed: getNum('fgTransitionSpeed', 'fgTransitionSpeed', 2.0),
        bgTransitionSpeed: getNum('bgTransitionSpeed', 'bgTransitionSpeed', 2.0),
        fgRotationSpeed: getNum('fgRotationSpeed', 'fgRotationSpeed', 1.0),
        bgRotationSpeed: getNum('bgRotationSpeed', 'bgRotationSpeed', 1.0),
        fgSpinSpeed: getNum('fgSpinSpeed', 'fgSpinSpeed', 0.0),
        bgSpinSpeed: getNum('bgSpinSpeed', 'bgSpinSpeed', 0.0),
        fgActivePoints: getNum('fgActivePoints', 'fgActivePoints', this.options.bucketSize),
        bgActivePoints: getNum('bgActivePoints', 'bgActivePoints', this.options.bucketSize),
        fgWarpSpeed: getNum('fgWarpSpeed', 'fgWarpSpeed', 5.0),
        bgWarpSpeed: getNum('bgWarpSpeed', 'bgWarpSpeed', 5.0),
        fgMouseMax: this.parseVector2(getStr('fgMouseMax', 'fgMouseMax', undefined), new THREE.Vector2(15, 15)),
        bgMouseMax: this.parseVector2(getStr('bgMouseMax', 'bgMouseMax', undefined), new THREE.Vector2(15, 15)),
        themeMode: getStr('themeMode', 'themeMode', 'auto') as 'auto' | 'inverted' | 'light' | 'dark'
      });
      toggleA = !toggleA;
    });
    
    this.updateSectionMetrics();
  }

  private updateSectionMetrics() {
    const currentScroll = window.scrollY;
    this.sectionCenters = this.sections.map(sec => {
      const el = document.getElementById(sec.id);
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      // rect.top is relative to the viewport. To get the absolute document position, 
      // we must add the exact window.scrollY at the moment of measurement.
      return rect.top + currentScroll + rect.height / 2;
    });
  }

  private mouseX = 0;
  private mouseY = 0;

  private rawMouseX = 0;
  private rawMouseY = 0;

  private initScrollListener() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    }, { passive: true });
    
    window.addEventListener('resize', () => {
      this.viewportHeight = window.innerHeight;
      this.updateSectionMetrics();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.rawMouseX = e.clientX;
      this.rawMouseY = e.clientY;
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    this.scrollY = window.scrollY;
  }

  public computeCurrentSection() {
    if (this.sectionCenters.length === 0) {
      this.updateSectionMetrics();
    }
    const viewportCenter = this.scrollY + this.viewportHeight / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.sectionCenters.length; i++) {
        const dist = Math.abs(this.sectionCenters[i] - viewportCenter);
        if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
        }
    }
    return this.sections[closestIndex];
  }

  public setTheme(mode: 'dark' | 'light') {
    this.theme = mode;
    if (this.scene.fog && (this.scene.fog as THREE.FogExp2).color) {
      (this.scene.fog as THREE.FogExp2).color = new THREE.Color(mode === 'light' ? '#f0f0f0' : '#0d0f12');
    }
  }

  private resolveColor(section: SectionDef, layer: 'fg' | 'bg', index: 1 | 2, effectiveTheme: string): THREE.Color | undefined {
    if (effectiveTheme === 'light') {
        const lightColor = section[`${layer}ColorLight${index}` as keyof SectionDef];
        if (lightColor) return lightColor as THREE.Color;
    } else if (effectiveTheme === 'dark') {
        const darkColor = section[`${layer}ColorDark${index}` as keyof SectionDef];
        if (darkColor) return darkColor as THREE.Color;
    }
    return undefined;
  }

  private animate() {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.animate);
    
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    const activeSection = this.computeCurrentSection();
    if (!activeSection) return;

    let effectiveTheme = this.theme;
    if (activeSection.themeMode === 'light') effectiveTheme = 'light';
    else if (activeSection.themeMode === 'dark') effectiveTheme = 'dark';
    else if (activeSection.themeMode === 'inverted') effectiveTheme = this.theme === 'light' ? 'dark' : 'light';

    if (effectiveTheme !== this.currentEffectiveTheme) {
        this.currentEffectiveTheme = effectiveTheme;
        
        const blendMode = effectiveTheme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending;
        if (this.sys?.bucketA?.points?.material) {
            const matA = this.sys.bucketA.points.material as THREE.PointsMaterial;
            matA.blending = blendMode;
            matA.map = effectiveTheme === 'light' ? this.sys.bucketA.textureSolid : this.sys.bucketA.textureBloom;
            matA.needsUpdate = true;
        }
        if (this.sys?.bucketB?.points?.material) {
            const matB = this.sys.bucketB.points.material as THREE.PointsMaterial;
            matB.blending = blendMode;
            matB.map = effectiveTheme === 'light' ? this.sys.bucketB.textureSolid : this.sys.bucketB.textureBloom;
            matB.needsUpdate = true;
        }
        
        // Force the section to re-resolve colors instantly!
        this.activeSectionId = ''; 
    }

    if (activeSection.id !== this.activeSectionId) {
      this.activeSectionId = activeSection.id;
      
      const fgShapeData = this.targetCache[activeSection.foregroundShape];
      const bgShapeData = this.targetCache[activeSection.backgroundShape];
      
      const fgShape = fgShapeData ? (activeSection.fgLoose ? fgShapeData.loose : fgShapeData.resolved) : Object.values(this.targetCache)[0].resolved;
      const bgShape = bgShapeData ? (activeSection.bgLoose ? bgShapeData.loose : bgShapeData.resolved) : Object.values(this.targetCache)[0].loose;
      
      const fgC1 = this.resolveColor(activeSection, 'fg', 1, effectiveTheme);
      const fgC2 = this.resolveColor(activeSection, 'fg', 2, effectiveTheme);
      const bgC1 = this.resolveColor(activeSection, 'bg', 1, effectiveTheme);
      const bgC2 = this.resolveColor(activeSection, 'bg', 2, effectiveTheme);

      if (activeSection.foregroundBucket === 'A') {
        setBucketTarget(this.sys.bucketA, fgShape, fgC1, fgC2, activeSection.fgActivePoints, effectiveTheme);
        setBucketTarget(this.sys.bucketB, bgShape, bgC1, bgC2, activeSection.bgActivePoints, effectiveTheme);
      } else {
        setBucketTarget(this.sys.bucketB, fgShape, fgC1, fgC2, activeSection.fgActivePoints, effectiveTheme);
        setBucketTarget(this.sys.bucketA, bgShape, bgC1, bgC2, activeSection.bgActivePoints, effectiveTheme);
      }

      // Hot-swap the canvas HTML zIndex to weave it through the document
      const activeZ = activeSection.zIndex || (this.options.zIndex !== undefined ? this.options.zIndex.toString() : '1');
      this.options.container.style.zIndex = activeZ;
    }

    const bucketAIsForeground = activeSection.foregroundBucket === 'A';
    
    const updateTransformTargets = (bucket: any, isForeground: boolean) => {
      const offsetConfig = isForeground ? activeSection.foregroundAnchorOffset : activeSection.backgroundAnchorOffset;
      const baseScale = isForeground ? activeSection.foregroundScale : activeSection.backgroundScale;
      let targetAnchor = new THREE.Vector3();
      let targetScale = baseScale;
      let targetBaseRot = isForeground ? activeSection.foregroundRotation : activeSection.backgroundRotation;
      
      let isTrackingDOM = false;

      if (offsetConfig === 'auto') {
         // Auto-track the DOM anchor
         const zDepth = isForeground ? 0 : -5;
         const domXform = this.getDOMObjectTransform(activeSection.domAnchorElement, zDepth, baseScale);
         targetAnchor = domXform.anchor;
         targetScale = domXform.scale;
         isTrackingDOM = true;
      } else {
         targetAnchor = offsetConfig as THREE.Vector3;
      }

      const targetPointSize = isForeground 
          ? (effectiveTheme === 'light' ? activeSection.fgSizeLight : activeSection.fgSizeDark) 
          : (effectiveTheme === 'light' ? activeSection.bgSizeLight : activeSection.bgSizeDark);
      
      const targetOpacity = isForeground ? activeSection.fgOpacity : activeSection.bgOpacity;
      if (bucket.points.material) {
          bucket.points.material.size += (targetPointSize - bucket.points.material.size) * dt * 3;
          bucket.points.material.opacity += (targetOpacity - bucket.points.material.opacity) * dt * 3;

          // Zeno's paradox ghosting fix: clamp completely if nearly invisible
          if (Math.abs(bucket.points.material.opacity - targetOpacity) < 0.005) {
              bucket.points.material.opacity = targetOpacity;
          }
      }

      const activeDur = isForeground ? activeSection.fgTransitionSpeed : activeSection.bgTransitionSpeed;
      const activeSpeed = 1.0 / Math.max(0.01, activeDur);
      
      if (isTrackingDOM) {
         // Teleport the anchors perfectly avoiding structural lerp completely
         bucket.scale.copy(targetScale);
         bucket.anchor.copy(targetAnchor);
      } else {
         bucket.scale.lerp(targetScale, dt * (activeSpeed * 1.5));
         bucket.anchor.lerp(targetAnchor, dt * (activeSpeed * 3.0));
      }
      
      // Smoothly ease the explicit base Rotations for the boomerang center 
      bucket.baseRotation.x += (targetBaseRot.x - bucket.baseRotation.x) * dt * (activeSpeed * 2.0);
      bucket.baseRotation.y += (targetBaseRot.y - bucket.baseRotation.y) * dt * (activeSpeed * 2.0);
      bucket.baseRotation.z += (targetBaseRot.z - bucket.baseRotation.z) * dt * (activeSpeed * 2.0);

      let localMouseX = this.mouseX;
      let localMouseY = this.mouseY;

      if (activeSection.domAnchorElement) {
          const rect = activeSection.domAnchorElement.getBoundingClientRect();
          const domCenterX = rect.left + rect.width / 2;
          const domCenterY = rect.top + rect.height / 2;
          
          const dx = this.rawMouseX - domCenterX;
          const dy = this.rawMouseY - domCenterY;
          
          localMouseX = (dx / (window.innerWidth / 2));
          localMouseY = -(dy / (window.innerHeight / 2));
      }

      const allowMouse = isForeground ? activeSection.fgMouse : activeSection.bgMouse;
      const targetMouseX = allowMouse ? localMouseX : 0;
      const targetMouseY = allowMouse ? localMouseY : 0;
      const targetMouseMax = isForeground ? activeSection.fgMouseMax : activeSection.bgMouseMax;
      
      const rotDur = isForeground ? activeSection.fgRotationSpeed : activeSection.bgRotationSpeed;
      const rotSpeed = rotDur <= 0 ? 0.0 : 1.0 / rotDur;
      const spinSpd = isForeground ? activeSection.fgSpinSpeed : activeSection.bgSpinSpeed;

      applyIdleMotion(bucket, bucket.baseRotation, time, isForeground, rotSpeed, targetMouseX, targetMouseY, targetMouseMax, spinSpd);
      
      (bucket as any).internalTargetAnchorCache = targetAnchor.clone(); // bind for displacement tracking
      (bucket as any).internalIsTrackingDOM = isTrackingDOM;
    };

    updateTransformTargets(this.sys.bucketA, bucketAIsForeground);
    updateTransformTargets(this.sys.bucketB, !bucketAIsForeground);

    const bloomA = bucketAIsForeground ? activeSection.fgBloom : activeSection.bgBloom;
    const bloomB = !bucketAIsForeground ? activeSection.fgBloom : activeSection.bgBloom;

    // Prevent aggressive multiplicative bloom washing out colors on white backgrounds
    const safeBloomA = effectiveTheme === 'light' ? Math.min(bloomA, 1.0) : bloomA;
    const safeBloomB = effectiveTheme === 'light' ? Math.min(bloomB, 1.0) : bloomB;

    const jitterA = bucketAIsForeground ? activeSection.fgJitter : activeSection.bgJitter;
    const jitterB = !bucketAIsForeground ? activeSection.fgJitter : activeSection.bgJitter;

    const fgTransSpeed = 1.0 / Math.max(0.01, activeSection.fgTransitionSpeed);
    const bgTransSpeed = 1.0 / Math.max(0.01, activeSection.bgTransitionSpeed);

    // Compute raw scroll delta
    const scrollDelta = Math.abs(this.scrollY - this.lastFrameScroll);
    this.lastFrameScroll = this.scrollY;
    
    // Convert scroll burst purely into physical shattering forces
    const scrollBurst = Math.min(scrollDelta * 0.04, 2.5);

    const getDisruption = (bucket: any) => {
        // Only apply structural explosions natively to absolute DOM-bound elements
        if (bucket.internalIsTrackingDOM) {
            return scrollBurst;
        }
        return 0.0;
    };

    const warpA = bucketAIsForeground ? activeSection.fgWarpSpeed : activeSection.bgWarpSpeed;
    const warpB = !bucketAIsForeground ? activeSection.fgWarpSpeed : activeSection.bgWarpSpeed;

    updateBucket(this.sys.bucketA, dt, safeBloomA, time, jitterA, fgTransSpeed, getDisruption(this.sys.bucketA), warpA);
    updateBucket(this.sys.bucketB, dt, safeBloomB, time, jitterB, bgTransSpeed, getDisruption(this.sys.bucketB), warpB);

    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    this.isDestroyed = true;
    this.renderer.dispose();
    // cleanup event listeners
    // optionally remove dom node
  }
}
