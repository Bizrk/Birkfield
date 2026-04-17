# Birkfield Particle Morph System

Birkfield is a highly optimized, scroll-driven Three.js procedural particle engine designed to seamlessly morph mathematically-sampled primitive geometries and Blender exports through HTML configurations.

---

## 1. HTML Configuration Stack

The primary way you interact with Birkfield is by appending simple `data-*` attributes natively to any standard HTML `<section>` or `<div>`. The engine natively parses these properties without requiring deep JavaScript implementation.

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-config` | An inline, double-quoted JSON object containing any number of property overrides implicitly (e.g. `data-config='{"fgShape": "cube"}'`) | `undefined` |
| `data-birkfield-config` | Name of an overarching preset loaded securely in your TypeScript `options.configs` dictionary | `undefined` |
| `data-fg-shape` / `bg-shape` | **Required.** The matching string key for your 3D target shape in `buildObjectTarget.ts` | `undefined` |
| `data-fg-size` / `bg-size`   | Size scalar of individual glowing dot particles | `0.8` / `0.15` |
| `data-fg-active-points` / `bg-active-points` | Limits how many of the 5k engine points are actively rendered for a layer | `5000` |
| `data-fg-opacity` / `bg-opacity` | Visibility override for the specific layer. Perfect for hiding loose background objects during layout structures. | `1.0` / `1.0` |
| `data-fg-bloom` / `bg-bloom` | How powerfully the glow radiates relative to its base pass | `1.5` / `0.1` |
| `data-fg-jitter` / `bg-jitter` | Magnitude of the organic target point "swarming" wave | `0.05` |
| `data-fg-loose` / `bg-loose` | Enables organic structural breakdown scattering (Disable for architectural meshes) | `false` / `true` |
| `data-fg-mouse` / `bg-mouse` | Booleans enabling interactive Parallax mouse tracking per layer | `true` |
| `data-fg-mouse-max` / `bg-mouse-max` | Vector2 clamping `X,Y` degree limits limiting interactive bounds (e.g. `5,3`) | `15,15` |
| `data-fg-transition-speed` / `bg-transition-speed` | Snappiness scalar for spatial morphology transitions | `2.0` |
| `data-fg-warp-speed` / `bg-warp-speed` | Snappiness multiplier specifically for inactive Z-depth points flying into active bounds | `5.0` |
| `data-fg-rotation-speed` / `bg-rotation-speed` | Snappiness scalar for idle rocking/swarming motion | `1.0` |
| `data-fg-spin-speed` / `bg-spin-speed` | Continuous linear 360-degree rotation speed tumbling along the Y-axis | `0.0` |
| `data-fg-color1` / `bg-color1` | Override the object's base colors into a stable random-gradient setup (e.g., `#ff0000`) | `undefined` |
| `data-fg-color2` / `bg-color2` | Paired gradient color override to compliment `color1` | `undefined` |
| `data-fg-color1-light` / `bg-color1-light` | Light mode alternative for `color1` (System automatically reads media queries) | `undefined` |
| `data-fg-color2-light` / `bg-color2-light` | Light mode alternative for `color2` | `undefined` |

**Modifier Panel Automation:**
You rarely have to hand-code these properties. Press `[M]` inside a running environment (or use `?birkfielddebug=true` internally) to spawn the **Birkfield Modifier Panel**. Select any Section DOM element to live-tune its spatial vectors, colors, active point slicing, and interaction bounds on the fly. 

You can inherently copy perfectly formatted configurations using the Export boxes at the bottom depending on your architectural strategy:
1. **Copy HTML Data Attributes:** Spits out isolated `data-fg-*` attributes.
2. **Copy TS Config Preset:** Spits out a javascript object dictionary to be used formally in `main.ts`.
3. **Copy inline JSON:** Spits out a strictly validated double-quoted JSON object to be injected into `<div data-config='[JSON]'>`.

### **The Configuration Cascade**
When the engine attempts to establish the environment for an element, it looks through a strict fallback system:
`Specific HTML Attributes` -> `data-config JSON overrides` -> `data-birkfield-config Script Presets` -> `Global Fallbacks`.
This means you can establish heavy layout presets globally through script, but cleanly override single local parameters (like target colors) natively inside the HTML markup seamlessly without redefining everything.

### **Thematic Modes**
The engine automatically queries `window.matchMedia('(prefers-color-scheme: light)')` initially and activates light mode colors seamlessly. You can override it via your application UI later by issuing `birkfieldInstance.setTheme('light' | 'dark')` which will auto-recompile the particle arrays flawlessly!

### **The Alignment Anchors & Rotations**
You can define exact baseline geometric rotations via `data-fg-rotation` and `data-bg-rotation` using a raw Euler radiun string e.g. `0,3.14,0`. These are great for permanently facing objects slightly off axis.

You place objects physically on the scoped DOM by declaring modifiers via the `data-fg-anchor` and `data-bg-anchor` attributes in an `X,Y,Z` string. (e.g. `data-fg-anchor="3,0,-5"`).
* **X**: Horizontal modifier relative to targeted boundary (Negative=Left, Positive=Right)
* **Y**: Vertical modifier 
* **Z**: Depth modifier (Negative pushes an object deep behind the screen, creating heavy mouse parallaxing)

**Scales:**
You can specifically warp or multiply geometry locally via `data-fg-scale` (defaults to `1,1,1`). This mathematically multiplies the underlying DOM-bounding scale projection.

***

### **Native DOM Tracking Targets**
Because the engine now natively tracks DOM bounding-boxes on scroll, you can explicitly direct the tracking layout internally by nesting structurally specific divs using these reserved class-names:
* **`.birkfield-fg`**: Maps the precise foreground 3D anchor projection to surround this specific DOM node bounds instead of the entire section constraint.
* **`.birkfield-bg`**: Maps the background projection exactly over this internal DOM node constraint.

This essentially lets you run fluid, highly targeted responsive CSS using flex/grid on standard HTML elements without fighting math inside of scripts! Any `<div class="birkfield-fg">` explicitly handles where your particle cluster lands!

---

## 2. Structural Classes

You use CSS class-names to dictate how the sections trigger:

* **`.birkfield-section`**: Represents a massive, relative scrolling layout block. The active component tracks your Scroll Y bounds relative to the block's physical center offset and hot-swaps seamlessly when you cross thresholds.
* **`.birkfield-target`**: Represents strict, localized inline boxes. 

*(Tip: To place objects selectively inside a section or target seamlessly, ensure you nest lightweight `.birkfield-fg` and `.birkfield-bg` nodes into the flow of the document!)*

---

## 3. The Object Registry & GLTF Importer

The true shape limits of the system come directly from the `objectRegistry.ts`.
You can algorithmically define shapes using equations, OR import them blindly from Blender!

### **The GLTF In-Browser Importer**
Append `?registerobject=true` to your website's local URL (e.g., `http://localhost:5173/?registerobject=true`).
This launches a drag-and-drop overlay.
1. Create a mesh using basic Primitives in Blender (Spheres, Boxes, Cylinders, Toruses).
2. Export as `.glb`.
3. Drop it onto the target website.
4. The system directly exports a perfect TypeScript block you can paste directly into your `objectRegistry.ts`!

### **GLTF Scaling Mechanics**
The importer accurately utilizes explicit physical dimensions, bounding box bounds, and rotation constraints out of the raw `.glb` buffers, and generates proportionate particles normalized cleanly.

**Controlling Point Density from Blender:**
* The point density determines how solid an object looks. Total points are relative (meaning all meshes split the 1,000 engine points evenly across their sizes out of the box).
* To override the weight (density) multiplier natively from Blender, rename your mesh in exactly this format: **`[Name].density[Number]`**. 
* *(Example: A mesh named `Sphere.density2.5` will calculate 250% of the relative visual point limit.)*
