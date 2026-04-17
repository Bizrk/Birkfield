import './style.css';
import { Birkfield } from '@bizrk/birkfield';
import { objectRegistry } from './objects/objectRegistry';
import { initGLTFImporter } from '@bizrk/birkfield';

// Initialize the hidden overlay tool if '?registerobject=true' is in the URL
initGLTFImporter();

// Initialize the Birkfield Particle Morph system
const container = document.getElementById('canvas-container');

if (container) {
  const app = new Birkfield({
    container: container,
    sectionSelector: '.birkfield-section, .birkfield-target', // Points to both full sections and inline generic targets
    objects: objectRegistry,          // Provide the custom object targets
    bucketSize: 5000,
    defaultConfig: {
      bgShape: 'ringCluster',
      bgColor1Dark: '#111122',
      bgColor2Dark: '#221122',
      bgSize: 0.5,
      bgBloom: 1.0,
      bgTransitionSpeed: 2.0,
      fgTransitionSpeed: 2.0,
      bgRotationSpeed: 10.0,
      fgRotationSpeed: 6.0,
      bgJitter: 0.0
    },
    configs: {
      heroPreset: {
        fgShape: 'tripleSpheres',
        bgShape: 'fiveCubes',
        fgSize: 0.8,
        bgSize: 0.15,
        fgBloom: 1.5,
        bgBloom: 0.1,
        fgAnchor: '3,0,0',
        bgAnchor: '-3,-2,-5',
        fgActivePoints: 800,
        bgActivePoints: 800
      }
    }
  });

  console.log("Birkfield is active!", app);

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
      import('@bizrk/birkfield').then(m => {
        if (!document.getElementById('birkfield-modifier-panel')) {
           m.initModifierPanel(app);
        }
      });
    }
  });

  if (window.location.search.toLowerCase().includes('modifyobject=true') || window.location.search.toLowerCase().includes('birkfielddebug=true')) {
    import('@bizrk/birkfield').then(m => m.initModifierPanel(app));
  }

  // Wire up the theme toggle demo
  let isLightMode = false;
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      isLightMode = !isLightMode;
      document.body.classList.toggle('light-mode', isLightMode);
      app.setTheme(isLightMode ? 'light' : 'dark');
    });
  }
}
