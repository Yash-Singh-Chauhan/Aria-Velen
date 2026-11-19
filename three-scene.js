/**
 * ARIA VELEN — Ultra-Smooth 60FPS 3D WebGL Engine (Three.js)
 * PERFORMANCE OPTIMIZED:
 * - Capped pixel ratio (max 1.25) to eliminate GPU fill-rate bottle-necks
 * - Frame-rate independent delta time exponential damping (zero shudder/jitter)
 * - Optimized geometry segment counts for silky 60+ FPS on all machines
 * - Streamlined high-gloss PBR lighting and shaders
 */

(function () {
  'use strict';

  let initialized = false;
  let bootAttempts = 0;

  function startAria3D() {
    if (initialized) return;

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.warn('[Aria 3D Engine] #webgl-canvas element not found on page.');
      return;
    }

    if (typeof THREE === 'undefined') {
      // Retry a bounded number of times instead of looping forever if the
      // Three.js bundle ever fails to load.
      if (++bootAttempts > 40) {
        console.warn('[Aria 3D Engine] THREE failed to load — 3D visuals disabled.');
        return;
      }
      setTimeout(startAria3D, 50);
      return;
    }

    initialized = true;
    canvas.style.opacity = '1';

    const pageType = document.body.getAttribute('data-page') || 'home';

    // --- Scene & Camera Setup ---
    const scene = new THREE.Scene();
    if (pageType !== 'home' && pageType !== 'about' && pageType !== 'contact') {
      scene.fog = new THREE.FogExp2(0x070707, 0.025);
    }

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

  // High performance WebGL renderer with capped pixel ratio
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    precision: 'mediump',
    stencil: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap at 1.25 to prevent 4K/retina GPU frame stutter while maintaining crispness
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  // --- High-Dynamic Range Studio Lighting (Deep Obsidian Darkness with Razor Gold Gleams) ---
  const ambientLight = new THREE.AmbientLight(0x060402, 0.22);
  scene.add(ambientLight);

  // Key light: brilliant warm champagne gold from top-left, casting strong specular sheen on left facet
  const keyLight = new THREE.DirectionalLight(0xfff7e2, 4.8);
  keyLight.position.set(-7.5, 7.0, 5.0);
  scene.add(keyLight);

  // Specular gleam light along beveled edges and contours
  const specLight = new THREE.DirectionalLight(0xfffdf0, 4.2);
  specLight.position.set(-4.5, 5.2, 5.8);
  scene.add(specLight);

  // Apex peak top glint light
  const topLight = new THREE.DirectionalLight(0xffe899, 2.4);
  topLight.position.set(-1.0, 8.5, 4.0);
  scene.add(topLight);

  // Warm bronze rim light on right (deep contrast)
  const rimLight = new THREE.DirectionalLight(0x5a3408, 1.2);
  rimLight.position.set(7.0, -1.5, 3.5);
  scene.add(rimLight);

  // Subtle warm amber bounce from below (kept very dark for brooding contrast)
  const warmBounce = new THREE.DirectionalLight(0x1a0e04, 0.28);
  warmBounce.position.set(0, -5, 2.5);
  scene.add(warmBounce);

  // Dynamic interactive cursor glint (sweeps liquid gold highlight across dark metal)
  const cursorLight = new THREE.PointLight(0xffdf88, 2.8, 22, 1.2);
  cursorLight.position.set(0, 0, 8.5);
  scene.add(cursorLight);

  // High-Contrast Studio Equirectangular Reflection Map for Solid Gleaming Gold Bullion
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512; envCanvas.height = 256;
  const envCtx = envCanvas.getContext('2d');
  envCtx.fillStyle = '#060402';
  envCtx.fillRect(0, 0, 512, 256);

  // Warm golden bronze horizon sweep
  const horiz = envCtx.createLinearGradient(0, 60, 0, 195);
  horiz.addColorStop(0, '#100a03');
  horiz.addColorStop(0.25, '#4a300a');
  horiz.addColorStop(0.5, '#ffd242');
  horiz.addColorStop(0.75, '#6b450f');
  horiz.addColorStop(1, '#0a0601');
  envCtx.fillStyle = horiz;
  envCtx.fillRect(0, 60, 512, 135);

  // Massive Top-Left Studio Key Softbox (Creates the glorious liquid-gold sheen across the left facet)
  const rad1 = envCtx.createRadialGradient(130, 50, 0, 130, 50, 130);
  rad1.addColorStop(0, '#ffffff');
  rad1.addColorStop(0.18, '#fff7db');
  rad1.addColorStop(0.40, '#ffd64a');
  rad1.addColorStop(0.65, '#b57a1a');
  rad1.addColorStop(0.85, '#4a2c06');
  rad1.addColorStop(1, 'rgba(6, 4, 2, 0)');
  envCtx.fillStyle = rad1;
  envCtx.beginPath();
  envCtx.arc(130, 50, 130, 0, Math.PI * 2);
  envCtx.fill();

  // Top Apex Glint Softbox (Highlights the top sharp tip of the A)
  const radApex = envCtx.createRadialGradient(256, 25, 0, 256, 25, 60);
  radApex.addColorStop(0, '#ffffff');
  radApex.addColorStop(0.35, '#ffe8a0');
  radApex.addColorStop(1, 'rgba(6, 4, 2, 0)');
  envCtx.fillStyle = radApex;
  envCtx.beginPath();
  envCtx.arc(256, 25, 60, 0, Math.PI * 2);
  envCtx.fill();

  // Subtle bronze rim softbox on right
  const rad2 = envCtx.createRadialGradient(390, 85, 0, 390, 85, 80);
  rad2.addColorStop(0, '#ffe08a');
  rad2.addColorStop(0.4, '#9a621c');
  rad2.addColorStop(1, 'rgba(6, 4, 2, 0)');
  envCtx.fillStyle = rad2;
  envCtx.beginPath();
  envCtx.arc(390, 85, 80, 0, Math.PI * 2);
  envCtx.fill();

  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTexture;

  // Mouse & State Tracking with Delta Time Smoothing
  const state = {
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0, isDown: false, prevX: 0, prevY: 0 },
    dragRot: { x: 0, y: 0, vx: 0, vy: 0 },
    knotBoost: 1.0,
    smoothScrollY: window.scrollY || 0,
    targetScrollY: window.scrollY || 0,
    isMusicPlaying: false,
    audioFrequency: 0,
    bassPulse: 0,
    focusedBeacon: null
  };

  window.addEventListener('scroll', () => {
    state.targetScrollY = window.scrollY || 0;
  }, { passive: true });

  let winWidth = window.innerWidth || 1920;
  let winHeight = window.innerHeight || 1080;
  let winAspect = winWidth / winHeight;

  // Passive, non-blocking mouse listener (pure math with cached window dimensions for 120 FPS)
  window.addEventListener('mousemove', (e) => {
    state.mouse.targetX = (e.clientX / winWidth) * 2 - 1;
    state.mouse.targetY = -(e.clientY / winHeight) * 2 + 1;
  }, { passive: true });

  window.addEventListener('mousedown', (e) => {
    state.mouse.isDown = true;
    state.mouse.prevX = e.clientX;
    state.mouse.prevY = e.clientY;
  });

  window.addEventListener('mouseup', () => { state.mouse.isDown = false; });

  // Touch Support
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      state.mouse.targetX = (t.clientX / winWidth) * 2 - 1;
      state.mouse.targetY = -(t.clientY / winHeight) * 2 + 1;
    }
  }, { passive: true });

  let resizeRaf = null;
  function handleWindowResize() {
    winWidth = window.innerWidth || 1920;
    winHeight = window.innerHeight || 1080;
    winAspect = winWidth / winHeight;
    camera.aspect = winAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(winWidth, winHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  }

  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(handleWindowResize);
  }, { passive: true });

  // Ultra-fast single-pass ImageData brushed normal texture generator (bypasses slow canvas 2D fillRect calls)
  function createBrushedNormalTexture(width, height, noiseScale, repeatX, repeatY) {
    const tCanvas = document.createElement('canvas');
    tCanvas.width = width;
    tCanvas.height = height;
    const tCtx = tCanvas.getContext('2d');
    const imgData = tCtx.createImageData(width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const noise = (Math.random() - 0.5) * noiseScale;
      const val = Math.min(255, Math.max(0, Math.round(128 + noise)));
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + (x * 4);
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    return texture;
  }

  // High-fidelity procedural micro-tangent normal texture for authentic 24K brushed gold
  function createSculpturalNormalTexture(width, height) {
    const w = width || 512;
    const h = height || 512;
    const tCanvas = document.createElement('canvas');
    tCanvas.width = w;
    tCanvas.height = h;
    const tCtx = tCanvas.getContext('2d');
    const imgData = tCtx.createImageData(w, h);
    const data = imgData.data;
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      const yNorm = y / h;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + (x * 4);
        const xNorm = x / w;
        // Fine anisotropic brushed satin striations with micro-abrasions
        const striation1 = Math.sin(xNorm * Math.PI * 36) * 14;
        const striation2 = Math.sin(xNorm * Math.PI * 110 + yNorm * 12) * 7;
        const crossGrain = Math.cos(yNorm * Math.PI * 24) * 4;
        const microNoise = (Math.random() - 0.5) * 12;

        const nx = 128 + striation1 + striation2 + microNoise;
        const ny = 128 + crossGrain + (Math.random() - 0.5) * 8;
        data[idx]     = Math.min(255, Math.max(0, Math.round(nx)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(ny)));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 6);
    return texture;
  }

  // High-fidelity procedural micro-roughness variation map for realistic jeweler's rouge satin finish
  function createSculpturalRoughnessTexture(width, height) {
    const w = width || 512;
    const h = height || 512;
    const tCanvas = document.createElement('canvas');
    tCanvas.width = w;
    tCanvas.height = h;
    const tCtx = tCanvas.getContext('2d');
    const imgData = tCtx.createImageData(w, h);
    const data = imgData.data;
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      const yNorm = y / h;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + (x * 4);
        const xNorm = x / w;
        // Non-uniform satin polish & soft buffing cloth streaks
        const buffWave = Math.sin(xNorm * Math.PI * 14 + yNorm * 8) * 9;
        const fineGrain = Math.sin(xNorm * Math.PI * 52) * 6;
        const microStoch = (Math.random() - 0.5) * 10;
        // Maps to physical roughness ~0.11 to ~0.22 in sRGB space
        const v = Math.min(255, Math.max(0, Math.round(40 + buffWave + fineGrain + microStoch)));
        data[idx]     = v;
        data[idx + 1] = v;
        data[idx + 2] = v;
        data[idx + 3] = 255;
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 4);
    return texture;
  }

  // High-fidelity procedural 24K bullion gold color gradient texture (matching About model chiaroscuro)
  function createBullionGradientTexture(width, height) {
    const w = width || 1024;
    const h = height || 256;
    const tCanvas = document.createElement('canvas');
    tCanvas.width = w;
    tCanvas.height = h;
    const tCtx = tCanvas.getContext('2d');

    // Chiaroscuro 24K bullion gold gradient along vertical tube cross-section (v-axis)
    const grad = tCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.00, '#fff6dc'); // Luminous incandescent specular peak
    grad.addColorStop(0.12, '#ffdf8e'); // Warm champagne highlight
    grad.addColorStop(0.30, '#dfa438'); // Rich saturated 24K bullion gold (exact About tone)
    grad.addColorStop(0.55, '#d4831a'); // Saturated amber-gold core
    grad.addColorStop(0.76, '#6e380a'); // Deep warm chiaroscuro bronze shadow
    grad.addColorStop(0.90, '#381c05'); // Cognac velvety bronze
    grad.addColorStop(1.00, '#140702'); // Deep obsidian crevice tone
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, w, h);

    // Subtle brushed satin micro-grain striations
    const imgData = tCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      const yNorm = y / h;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + (x * 4);
        const xNorm = x / w;
        const wave = Math.sin(xNorm * Math.PI * 48 + yNorm * 10) * 4;
        const noise = (Math.random() - 0.5) * 5 + wave;
        data[idx]     = Math.min(255, Math.max(0, Math.round(data[idx] + noise)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(data[idx + 1] + noise * 0.8)));
        data[idx + 2] = Math.min(255, Math.max(0, Math.round(data[idx + 2] + noise * 0.4)));
      }
    }
    tCtx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    return texture;
  }

  // Universal Luxury Dark Obsidian Bullion Gold Material Factory (Furnished, Refined & Shared Across All Models)
  function createUnifiedObsidianGoldMaterial(customNormalMap, isFlatShaded) {
    const normalMap = customNormalMap || createBrushedNormalTexture(256, 256, 16, 4, 4);
    return new THREE.MeshStandardMaterial({
      color: 0x1a1206,      // Deep dark smoked obsidian bronze bullion (brooding dark in shadow)
      metalness: 1.0,       // Pure 100% physical metal
      roughness: 0.13,      // Razor-sharp high-mirror liquid gold specular sheen (radiant shiny from light source)
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.012, 0.012), // Subtle tactile brushed satin micro-grain
      flatShading: !!isFlatShaded,
      emissive: 0x040201,   // Deep dark obsidian crevices
      envMapIntensity: 3.2, // Radiant HDR studio specular reflections cutting through darkness
      fog: false,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });
  }

  // Procedural Tangent Normal Texture for Anisotropic Pressed Vinyl Micro-Grooves
  function createVinylGrooveNormalTexture(width, height) {
    const w = width || 512;
    const h = height || 512;
    const tCanvas = document.createElement('canvas');
    tCanvas.width = w;
    tCanvas.height = h;
    const tCtx = tCanvas.getContext('2d');
    const imgData = tCtx.createImageData(w, h);
    const data = imgData.data;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = w / 2;

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      const dy = y - cy;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const r = Math.sqrt(dx * dx + dy * dy);
        const idx = rowOffset + (x * 4);

        if (r > 74 && r < (maxR - 8)) {
          // Circular tangent normal perturbation (creates authentic anisotropic vinyl butterfly sheen)
          const theta = Math.atan2(dy, dx);
          const grooveWave = Math.sin(r * 2.2) * 14 + Math.sin(r * 5.6) * 6;
          const nx = 128 - Math.sin(theta) * grooveWave;
          const ny = 128 + Math.cos(theta) * grooveWave;
          data[idx]     = Math.min(255, Math.max(0, Math.round(nx)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(ny)));
          data[idx + 2] = 246;
          data[idx + 3] = 255;
        } else {
          // Flat neutral normal for center label and outer bevel
          data[idx]     = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        }
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // Procedural Micro-Roughness Texture for Realistic Vinyl Sound Grooves & Satin Center Label
  function createVinylGrooveRoughnessTexture(width, height) {
    const w = width || 512;
    const h = height || 512;
    const tCanvas = document.createElement('canvas');
    tCanvas.width = w;
    tCanvas.height = h;
    const tCtx = tCanvas.getContext('2d');
    const imgData = tCtx.createImageData(w, h);
    const data = imgData.data;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = w / 2;

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      const dy = y - cy;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const r = Math.sqrt(dx * dx + dy * dy);
        const idx = rowOffset + (x * 4);

        if (r <= 76) {
          // Center 24K gold label: smooth satin polish ~ 0.16 roughness
          const buff = Math.sin((x / w) * Math.PI * 16) * 5;
          const val = Math.min(255, Math.max(0, Math.round(38 + buff)));
          data[idx]     = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        } else if (r > 76 && r < (maxR - 8)) {
          // Alternating micro-groove tracks
          const trackMod = Math.sin(r * 0.45) * 10 + Math.sin(r * 1.8) * 6;
          const val = Math.min(255, Math.max(0, Math.round(34 + trackMod)));
          data[idx]     = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        } else {
          // Outer edge rim: glossy lacquer ~ 0.09 roughness
          data[idx]     = 22;
          data[idx + 1] = 22;
          data[idx + 2] = 22;
          data[idx + 3] = 255;
        }
      }
    }
    tCtx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(tCanvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }


  // =========================================================================
  // PAGE-SPECIFIC 3D MODEL INSTANTIATION
  // =========================================================================

  let activeModel = null;
  let animatePageModel = () => {};

  if (pageType === 'home') {
    // -----------------------------------------------------------------------
    // HOME: MONUMENTAL 3D ARCHITECTURAL CAPITAL "A" (Matches User Screenshot 1:1)
    // - Massive screen-filling geometry with sharp apex and straight diagonal legs
    // - Sharp triangular counter window & lower rectangular portal
    // - Deep stepped chamfered bevel catching razor highlights
    // - 100% Solid 24K Satin Gold until it scrolls under the frame
    // -----------------------------------------------------------------------
    camera.position.set(0, -0.15, 9.6);
    const letterGroup = new THREE.Group();
    scene.add(letterGroup);
    letterGroup.position.set(0, 0, 0);

    // -----------------------------------------------------------------------
    // HOME: CINEMATIC STAGE LIGHTING HARMONIZED WITH SINGER BACKDROP
    // Perfectly matches the warm amber incandescent concert-hall illumination,
    // intense golden rim kicker on the right, and deep velvety shadows of hero-singer.jpg
    // -----------------------------------------------------------------------

    // 1. Warm Concert-Hall Ambient Fill (Moody dark amber atmosphere)
    ambientLight.color.setHex(0x180d04);
    ambientLight.intensity = 0.35;

    // 2. Warm Amber Stage Key Beam (Top-Left Anamorphic Beam, 2900K tungsten)
    keyLight.position.set(-6.2, 5.8, 4.8);
    keyLight.color.setHex(0xffbe55);
    keyLight.intensity = 3.2;

    // 3. Golden Amber Specular Chisel Light (Strikes the left beveled chamfer with razor sheen)
    specLight.position.set(-3.8, 4.6, 5.5);
    specLight.color.setHex(0xffdf8e);
    specLight.intensity = 2.4;

    // 4. Apex Peak Glint Light (Glints on the sharp apex tip of the A)
    topLight.position.set(-0.8, 8.0, 3.8);
    topLight.color.setHex(0xffcc66);
    topLight.intensity = 1.6;

    // 5. Intense Golden Rim Light on Right (Matches the glowing rim on Aria's hair in the background!)
    rimLight.position.set(5.5, 3.2, -3.2);
    rimLight.color.setHex(0xffa22e);
    rimLight.intensity = 3.6;

    // 6. Under-Stage Warm Bronze Floor Bounce
    warmBounce.position.set(0, -5.0, 2.5);
    warmBounce.color.setHex(0x381c05);
    warmBounce.intensity = 0.45;

    // Dedicated Concert Stage Reflection Map:
    // Paints the warm amber stage lights, luminous hair rim, and concert bokeh spheres directly
    // into the equirectangular reflection map so the 24K gold reflections match the photo!
    const homeEnvCanvas = document.createElement('canvas');
    homeEnvCanvas.width = 512; homeEnvCanvas.height = 256;
    const hCtx = homeEnvCanvas.getContext('2d');
    hCtx.fillStyle = '#080502';
    hCtx.fillRect(0, 0, 512, 256);

    // Warm stage amber horizon glow sweep
    const hHoriz = hCtx.createLinearGradient(0, 50, 0, 200);
    hHoriz.addColorStop(0, '#0a0602');
    hHoriz.addColorStop(0.25, '#3a1e06');
    hHoriz.addColorStop(0.5, '#d98b25');
    hHoriz.addColorStop(0.75, '#5c2d08');
    hHoriz.addColorStop(1, '#080502');
    hCtx.fillStyle = hHoriz;
    hCtx.fillRect(0, 50, 512, 150);

    // Top-Left warm stage beam softbox
    const hRad1 = hCtx.createRadialGradient(130, 55, 0, 130, 55, 125);
    hRad1.addColorStop(0, '#fff4d6');
    hRad1.addColorStop(0.22, '#ffcf66');
    hRad1.addColorStop(0.50, '#d4831a');
    hRad1.addColorStop(0.78, '#4a2405');
    hRad1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    hCtx.fillStyle = hRad1;
    hCtx.beginPath();
    hCtx.arc(130, 55, 125, 0, Math.PI * 2);
    hCtx.fill();

    // Right-side stage rim & hair kicker softbox (matches singer's rim light in photo)
    const hRad2 = hCtx.createRadialGradient(385, 75, 0, 385, 75, 95);
    hRad2.addColorStop(0, '#ffbf52');
    hRad2.addColorStop(0.35, '#c97516');
    hRad2.addColorStop(0.75, '#3d1a03');
    hRad2.addColorStop(1, 'rgba(8, 5, 2, 0)');
    hCtx.fillStyle = hRad2;
    hCtx.beginPath();
    hCtx.arc(385, 75, 95, 0, Math.PI * 2);
    hCtx.fill();

    // Stage bokeh orbs matching the background photograph
    const bokeh1 = hCtx.createRadialGradient(90, 140, 0, 90, 140, 35);
    bokeh1.addColorStop(0, '#ff9e24');
    bokeh1.addColorStop(0.6, '#804008');
    bokeh1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    hCtx.fillStyle = bokeh1;
    hCtx.beginPath();
    hCtx.arc(90, 140, 35, 0, Math.PI * 2);
    hCtx.fill();

    const homeEnvTexture = new THREE.CanvasTexture(homeEnvCanvas);
    homeEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = homeEnvTexture;

    // Architectural Capital 'A' Shape (Matches Screenshot 1:1)
    const shape = new THREE.Shape();
    // Apex sharp peak
    shape.moveTo(0, 4.45);
    // Outer right diagonal edge extending down past viewport frame
    shape.lineTo(3.4, -4.95);
    // Right inner base
    shape.lineTo(1.45, -4.95);
    // Lower rectangular portal opening
    shape.lineTo(0.95, -2.1);
    shape.lineTo(-0.95, -2.1);
    // Left inner base
    shape.lineTo(-1.45, -4.95);
    // Outer left diagonal edge extending down past viewport frame
    shape.lineTo(-3.4, -4.95);
    shape.closePath();

    // Sharp isosceles triangular counter window
    const hole = new THREE.Path();
    hole.moveTo(0, 2.35);
    hole.lineTo(-0.95, -0.32);
    hole.lineTo(0.95, -0.32);
    hole.closePath();
    shape.holes.push(hole);

    // Monumental gold bullion brick bevel extrusion (deep, solid block)
    const extrudeSettings = {
      steps: 1,
      depth: 1.85,
      bevelEnabled: true,
      bevelThickness: 0.48,
      bevelSize: 0.34,
      bevelOffset: 0,
      bevelSegments: 8
    };

    const letterGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    letterGeo.center();
    letterGeo.computeVertexNormals();

    // Dedicated Stage Accent Lights for 'A':
    // 1. Subtle warm under-stage fill (preserves chiaroscuro drama without pitch black crushed faces)
    const letterStageFill = new THREE.DirectionalLight(0x6e380a, 1.4);
    letterStageFill.position.set(3.0, -3.0, 3.5);
    letterGroup.add(letterStageFill);

    // 2. Liquid Gold Specular Glint Spotlight (Follows cursor, warm amber golden sheen)
    const letterGleamLight = new THREE.PointLight(0xffbe58, 2.2, 18, 1.1);
    letterGleamLight.position.set(0, 0, 5.0);
    letterGroup.add(letterGleamLight);

    const goldNormalMap = createSculpturalNormalTexture(512, 512);
    const goldRoughnessMap = createSculpturalRoughnessTexture(512, 512);

    // Photorealistic 24K Antique Bullion Gold (Harmonized with background stage lighting)
    const letterMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfa438,            // Rich warm 24K Bullion Gold (matches concert amber tones)
      emissive: 0x140702,         // Deep bronze shadow depth in crevices
      metalness: 1.0,             // Pure precious metal
      roughness: 0.14,            // Base satin-polish
      roughnessMap: goldRoughnessMap, // Non-uniform micro-polish variation
      normalMap: goldNormalMap,
      normalScale: new THREE.Vector2(0.012, 0.012),
      clearcoat: 0.88,            // High-gloss jewelry glaze
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      ior: 2.5,
      envMapIntensity: 2.2,       // Balanced HDR reflections matching stage ambience
      fog: false,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });

    const letterMesh = new THREE.Mesh(letterGeo, letterMat);
    letterGroup.add(letterMesh);

    // Generous invisible hit proxy ensuring seamless, forgiving hover detection across the full 'A' frame
    const homeHitGeo = new THREE.BoxGeometry(6.6, 9.6, 2.2);
    const homeHitProxy = new THREE.Mesh(homeHitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false }));
    letterMesh.add(homeHitProxy);
    const homeHitTargets = [letterMesh, homeHitProxy];

    // Raycaster for isolated cursor hover tracking
    const homeRaycaster = new THREE.Raycaster();
    const homeMouseVec = new THREE.Vector2();
    let homeHoverBlend = 0.0;

    // Canonical presentation angle: Monumental 'A' faces front with slight 13-deg facet angle catching key light
    const baseRotY = 0.23;
    const baseRotX = -0.02;

    animatePageModel = (elapsedTime, delta) => {
      const scrollY = state.smoothScrollY;
      const heroHeight = winHeight;

      // Normalized progress through the hero slide (0.0 at top, 1.0 by 62% of hero height)
      const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.62)));

      // If fully scrolled past, hide group completely to prevent any artifacts or draw calls
      if (p >= 0.98) {
        letterGroup.visible = false;
        return;
      } else {
        letterGroup.visible = true;
      }

      // 1. Smooth Fade on Scroll (Disappearing into thin air with ZERO shader recompiles)
      const fadeAlpha = Math.max(0.0, Math.pow(1.0 - p, 1.55));
      letterMat.opacity = fadeAlpha;

      // -------------------------------------------------------------------
      // 2. "JUST FLOAT ON ITS PLACE" (ZERO-GRAVITY OSCILLATION & ASCENSION)
      // Floats peacefully in its place with natural zero-gravity micro-drifts;
      // does NOT spin continuously on its own!
      // -------------------------------------------------------------------
      const floatY = Math.sin(elapsedTime * 0.92) * 0.16;
      const floatPitch = Math.sin(elapsedTime * 0.68) * 0.016;
      const floatYaw = Math.cos(elapsedTime * 0.52) * 0.020;
      const floatRoll = Math.sin(elapsedTime * 0.82) * 0.012;

      // Upward scroll ascension
      const ascentY = Math.pow(p, 1.1) * 22.0;
      letterMesh.position.y = floatY + ascentY;

      // Responsive viewport adaptation
      const aspect = winAspect;
      const responsiveScale = aspect < 1.0 ? Math.max(0.55, aspect * 0.88) : 1.0;
      const flightScale = (1.0 + p * 0.14) * responsiveScale;

      // -------------------------------------------------------------------
      // 3. ISOLATED RAYCASTING: ONLY REACTS JUST WHEN CURSOR HOVERS ON IT
      // When cursor is elsewhere, it stays purely floating in its place.
      // When cursor hovers over the 'A', it reacts with smooth 3D tilt,
      // tactile z-glide, scale bloom, and liquid-gold gleams!
      // -------------------------------------------------------------------
      homeMouseVec.set(state.mouse.targetX, state.mouse.targetY);
      homeRaycaster.setFromCamera(homeMouseVec, camera);

      let isDirectHover = false;
      if (p < 0.85) {
        const hits = homeRaycaster.intersectObjects(homeHitTargets, false);
        if (hits.length > 0) {
          isDirectHover = true;
        }
      }

      // Silk-smooth exponential damping on hover blend (graceful entry and release)
      const hoverDamp = 1.0 - Math.exp(-6.0 * delta);
      homeHoverBlend += ((isDirectHover ? 1.0 : 0.0) - homeHoverBlend) * hoverDamp;

      // Optional tactile cursor badge feedback
      const cursorEl = document.getElementById('custom-cursor');
      if (cursorEl) {
        if (isDirectHover) {
          cursorEl.classList.add('hovering-3d');
        } else {
          cursorEl.classList.remove('hovering-3d');
        }
      }

      // -------------------------------------------------------------------
      // 4. REACTIVE 3D MOTION (STRICTLY GOVERNED BY HOVER BLEND)
      // When idle (blend = 0), rests peacefully at base presentation angle.
      // When hovered (blend > 0), reacts smoothly to cursor position!
      // -------------------------------------------------------------------
      const hoverTiltX = (-state.mouse.y * 0.28) * homeHoverBlend;
      const hoverTiltY = (state.mouse.x * 0.38) * homeHoverBlend;
      const hoverTiltZ = (state.mouse.x * 0.10) * homeHoverBlend;

      const targetRotX = baseRotX + hoverTiltX + floatPitch - (p * 0.35);
      const targetRotY = baseRotY + hoverTiltY + floatYaw;
      const targetRotZ = floatRoll + hoverTiltZ;

      const rotDamp = 1.0 - Math.exp(-5.5 * delta);
      letterMesh.rotation.x += (targetRotX + (state.dragRot.x * 0.10) - letterMesh.rotation.x) * rotDamp;
      letterMesh.rotation.y += (targetRotY + (state.dragRot.y * 0.10) - letterMesh.rotation.y) * rotDamp;
      letterMesh.rotation.z += (targetRotZ - letterMesh.rotation.z) * rotDamp;

      // Tactile scale breath & z-glide toward camera when hovered
      const hoverScale = 1.0 + 0.038 * homeHoverBlend;
      letterMesh.scale.set(flightScale * hoverScale, flightScale * hoverScale, flightScale * hoverScale);
      letterMesh.position.z = 0.32 * homeHoverBlend;

      // Liquid gold specular spotlight follows cursor and flares up directly over the 'A'
      letterGleamLight.position.x = state.mouse.x * 3.8;
      letterGleamLight.position.y = state.mouse.y * 3.2;
      letterGleamLight.position.z = 4.8 + homeHoverBlend * 0.8;
      letterGleamLight.intensity = 2.2 + homeHoverBlend * 3.8;

      cursorLight.position.x = state.mouse.x * 3.5;
      cursorLight.position.y = state.mouse.y * 3.0 + ascentY;
    };

    activeModel = letterGroup;

  } else if (pageType === 'about') {
    // -----------------------------------------------------------------------
    // ABOUT: Monumental Refined 24K Bullion Torus Knot (Centered & Hyper-Realistic)
    // - Centered in viewport to harmonize with centered "About Aria" typography
    // - MeshPhysicalMaterial with clearcoat, brushed satin normal map, and pure metallic response
    // - Dynamic multi-axis harmonic precession at majestic, dignified slow speed
    // -----------------------------------------------------------------------
    camera.position.set(0, 0, 11);
    const knotGroup = new THREE.Group();
    scene.add(knotGroup);

    // Dynamic right-side framing according to viewport aspect ratio
    let baseKnotX = 3.3;
    let baseKnotY = 0.05;

    function updateAboutKnotPosition() {
      const w = window.innerWidth;
      const h = window.innerHeight || 800;
      const aspect = w / h;
      if (w <= 768) {
        // Mobile: positioned below text or centered
        baseKnotX = 0;
        baseKnotY = -0.6;
        knotGroup.position.set(baseKnotX, baseKnotY, 0);
        knotGroup.scale.setScalar(0.68);
      } else if (w <= 1100) {
        // Tablet: shifted moderately to the right
        baseKnotX = 2.4;
        baseKnotY = 0.05;
        knotGroup.position.set(baseKnotX, baseKnotY, 0);
        knotGroup.scale.setScalar(0.80);
      } else {
        // Desktop: positioned gracefully on the right half
        baseKnotX = Math.min(4.1, Math.max(2.8, aspect * 1.95));
        baseKnotY = 0.05;
        knotGroup.position.set(baseKnotX, baseKnotY, 0);
        knotGroup.scale.setScalar(0.92);
      }
    }
    updateAboutKnotPosition();
    window.addEventListener('resize', updateAboutKnotPosition);

    // Harmonized Stage Lighting matching the Home model (warm amber illumination & bronze shadows)
    ambientLight.color.setHex(0x180d04);
    ambientLight.intensity = 0.35;

    keyLight.position.set(-6.2, 5.8, 4.8);
    keyLight.color.setHex(0xffbe55);
    keyLight.intensity = 3.2;

    specLight.position.set(-3.8, 4.6, 5.5);
    specLight.color.setHex(0xffdf8e);
    specLight.intensity = 2.4;

    topLight.position.set(-0.8, 8.0, 3.8);
    topLight.color.setHex(0xffcc66);
    topLight.intensity = 1.6;

    rimLight.position.set(5.5, 3.2, -3.2);
    rimLight.color.setHex(0xffa22e);
    rimLight.intensity = 3.6;

    warmBounce.position.set(0, -5.0, 2.5);
    warmBounce.color.setHex(0x381c05);
    warmBounce.intensity = 0.45;

    // Dedicated Stage Reflection Map matching the Home model
    const aboutEnvCanvas = document.createElement('canvas');
    aboutEnvCanvas.width = 512; aboutEnvCanvas.height = 256;
    const aCtx = aboutEnvCanvas.getContext('2d');
    aCtx.fillStyle = '#080502';
    aCtx.fillRect(0, 0, 512, 256);

    const aHoriz = aCtx.createLinearGradient(0, 50, 0, 200);
    aHoriz.addColorStop(0, '#0a0602');
    aHoriz.addColorStop(0.25, '#3a1e06');
    aHoriz.addColorStop(0.5, '#d98b25');
    aHoriz.addColorStop(0.75, '#5c2d08');
    aHoriz.addColorStop(1, '#080502');
    aCtx.fillStyle = aHoriz;
    aCtx.fillRect(0, 50, 512, 150);

    const aRad1 = aCtx.createRadialGradient(130, 55, 0, 130, 55, 125);
    aRad1.addColorStop(0, '#fff4d6');
    aRad1.addColorStop(0.22, '#ffcf66');
    aRad1.addColorStop(0.50, '#d4831a');
    aRad1.addColorStop(0.78, '#4a2405');
    aRad1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    aCtx.fillStyle = aRad1;
    aCtx.beginPath();
    aCtx.arc(130, 55, 125, 0, Math.PI * 2);
    aCtx.fill();

    const aRad2 = aCtx.createRadialGradient(385, 75, 0, 385, 75, 95);
    aRad2.addColorStop(0, '#ffbf52');
    aRad2.addColorStop(0.35, '#c97516');
    aRad2.addColorStop(0.75, '#3d1a03');
    aRad2.addColorStop(1, 'rgba(8, 5, 2, 0)');
    aCtx.fillStyle = aRad2;
    aCtx.beginPath();
    aCtx.arc(385, 75, 95, 0, Math.PI * 2);
    aCtx.fill();

    const aBokeh1 = aCtx.createRadialGradient(90, 140, 0, 90, 140, 35);
    aBokeh1.addColorStop(0, '#ff9e24');
    aBokeh1.addColorStop(0.6, '#804008');
    aBokeh1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    aCtx.fillStyle = aBokeh1;
    aCtx.beginPath();
    aCtx.arc(90, 140, 35, 0, Math.PI * 2);
    aCtx.fill();

    const aboutEnvTexture = new THREE.CanvasTexture(aboutEnvCanvas);
    aboutEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = aboutEnvTexture;

    // Dedicated Stage Accent Lights for Torus Knot:
    // 1. Warm under-loop fill (preserves deep chiaroscuro drama without pitch black crushed faces)
    const knotFillLight = new THREE.DirectionalLight(0x6e380a, 1.4);
    knotFillLight.position.set(3.0, -3.0, 3.5);
    knotGroup.add(knotFillLight);

    // 2. Liquid Gold Specular Glint Spotlight (Follows cursor, warm amber golden sheen)
    const knotGleamLight = new THREE.PointLight(0xffbe58, 2.4, 18, 1.1);
    knotGleamLight.position.set(0, 0, 5.0);
    knotGroup.add(knotGleamLight);

    // 1. High-Density Mathematical Curvature (260 tubular segments x 64 radial segments)
    const knotGeo = new THREE.TorusKnotGeometry(2.55, 0.64, 260, 64, 2, 3);
    knotGeo.computeVertexNormals();

    // 2. High-Resolution 512x512 Micro-Brushed Tangent Normal Map & Satin Rouge Roughness Map
    const knotNormalMap = createSculpturalNormalTexture(512, 512);
    const knotRoughnessMap = createSculpturalRoughnessTexture(512, 512);

    // 3. Photorealistic Physical PBR 24K Bullion Gold Material (Matching Home 3D Model 1:1)
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfa438,            // Rich warm 24K Bullion Gold (matches Home model exactly)
      emissive: 0x140702,         // Deep bronze shadow depth in crevices
      metalness: 1.0,             // Pure precious metal
      roughness: 0.14,            // Base satin-polish
      roughnessMap: knotRoughnessMap, // Authentic non-uniform polishing cloth micro-grain
      normalMap: knotNormalMap,   // High-res brushed satin striations
      normalScale: new THREE.Vector2(0.012, 0.012),
      clearcoat: 0.88,            // High-gloss jewelry lacquer glaze
      clearcoatRoughness: 0.05,   // Mirror-like secondary specular sheen
      reflectivity: 1.0,
      ior: 2.5,
      envMapIntensity: 2.2,       // Balanced HDR reflections matching stage ambience
      fog: false,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });
    const bronzeKnot = new THREE.Mesh(knotGeo, knotMat);
    knotGroup.add(bronzeKnot);

    animatePageModel = (elapsedTime, delta) => {
      const scrollY = state.smoothScrollY;
      const heroHeight = winHeight;

      // Normalized scroll progress through the hero slide
      const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.65)));

      if (p >= 0.98) {
        knotGroup.visible = false;
        return;
      } else {
        knotGroup.visible = true;
      }

      // 1. Smooth Fade on Scroll (Disappearing into thin air with ZERO shader recompiles)
      const fadeAlpha = p <= 0.005 ? 1.0 : Math.max(0.0, Math.pow(1.0 - p, 1.55));
      knotMat.opacity = fadeAlpha;

      // 2. Upward Scroll Ascension (Soaring majestically upwards into the sky)
      const ascentY = Math.pow(p, 1.1) * 22.0;

      // 3. DYNAMIC YET SLOW KINETIC PRECESSION
      // Multi-axis harmonic precession: continuously evolves in pitch, yaw, roll, and 3D spatial drift
      const slowT = elapsedTime * 0.16; // Majestic, dignified slow tempo

      // Dynamic 3D rotational precession with non-repeating harmonic periods
      const dynYaw = slowT + Math.sin(slowT * 0.6) * 0.32;
      const dynPitch = Math.sin(slowT * 0.78) * 0.30 + Math.cos(slowT * 0.36) * 0.15;
      const dynRoll = Math.cos(slowT * 0.68) * 0.24 + Math.sin(slowT * 0.26) * 0.12;

      // Dynamic spatial zero-gravity breathing drift (slow sinusoidal wave in X, Y, Z)
      const floatY = Math.sin(elapsedTime * 0.65) * 0.16 + Math.cos(elapsedTime * 0.35) * 0.06;
      const floatX = Math.cos(elapsedTime * 0.45) * 0.10;
      const floatZ = Math.sin(elapsedTime * 0.55) * 0.09;

      knotGroup.position.x = baseKnotX;
      knotGroup.position.y = baseKnotY + ascentY;

      bronzeKnot.position.x = floatX;
      bronzeKnot.position.y = floatY;
      bronzeKnot.position.z = floatZ;

      // Target rotation combining dynamic kinetic angles with dignified cursor parallax
      const targetRotX = dynPitch + (-state.mouse.y * 0.26);
      const targetRotY = dynYaw + (state.mouse.x * 0.32);
      const targetRotZ = dynRoll + (state.mouse.x * 0.08);

      // Elegant, dignified inertia damping with subtle organic delay
      const rotDamp = 1.0 - Math.exp(-4.5 * delta);
      bronzeKnot.rotation.x += (targetRotX + (state.dragRot.x * 0.10) - bronzeKnot.rotation.x) * rotDamp;
      bronzeKnot.rotation.y += (targetRotY + (state.dragRot.y * 0.10) - bronzeKnot.rotation.y) * rotDamp;
      bronzeKnot.rotation.z += (targetRotZ - bronzeKnot.rotation.z) * rotDamp;

      // Dynamic specular gleam tracking sweeps across the gold ribbons with cursor
      knotGleamLight.position.x = state.mouse.x * 3.2;
      knotGleamLight.position.y = state.mouse.y * 2.8;

      // Dynamic counter-parallax for the quote card on the left
      const quoteCard = document.getElementById('about-quote-card');
      if (quoteCard && p < 0.85) {
        const tx = (-state.mouse.x * 12).toFixed(1);
        const ty = (-state.mouse.y * 8).toFixed(1);
        const rx = (state.mouse.y * 3.5).toFixed(2);
        const ry = (-state.mouse.x * 4.5).toFixed(2);
        quoteCard.style.transform = `perspective(1000px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    };

    activeModel = knotGroup;

  } else if (pageType === 'music') {
    // -----------------------------------------------------------------------
    // MUSIC: Grand 3D Vinyl Record & Harmonic Orbits (24K Gold & Obsidian PBR)
    // - Harmonized stage lighting rig (warm amber 0xffbe55, golden rim 0xffa22e, bronze bounce 0x381c05)
    // - Dedicated stage reflection map (musicEnvTexture) matching Home & About 1:1
    // - High-resolution 1024x1024 canvas texture with 24K bullion gold center label & micro-grooves
    // - Micro-brushed anisotropic normal & roughness maps
    // - MeshPhysicalMaterial with clearcoat lacquer sheen
    // - Solid 3D 24K gold spindle pin & luminous harmonic orbit rings
    // - Dynamic cursor tracking with liquid gold gleam spotlight & interactive tilt
    // -----------------------------------------------------------------------
    camera.position.set(0, 0, 13);
    const musicGroup = new THREE.Group();
    scene.add(musicGroup);
    musicGroup.position.set(0, -0.15, 0);

    // Harmonized Concert Stage Lighting (Warm Amber Key, Golden Hair Rim, Velvety Bronze Shadows)
    ambientLight.color.setHex(0x180d04);
    ambientLight.intensity = 0.35;

    keyLight.position.set(-6.2, 5.8, 4.8);
    keyLight.color.setHex(0xffbe55);
    keyLight.intensity = 3.2;

    specLight.position.set(-3.8, 4.6, 5.5);
    specLight.color.setHex(0xffdf8e);
    specLight.intensity = 2.4;

    topLight.position.set(-0.8, 8.0, 3.8);
    topLight.color.setHex(0xffcc66);
    topLight.intensity = 1.6;

    rimLight.position.set(5.5, 3.2, -3.2);
    rimLight.color.setHex(0xffa22e);
    rimLight.intensity = 3.6;

    warmBounce.position.set(0, -5.0, 2.5);
    warmBounce.color.setHex(0x381c05);
    warmBounce.intensity = 0.45;

    // Dedicated Stage Reflection Map matching Home and About models
    const musicEnvCanvas = document.createElement('canvas');
    musicEnvCanvas.width = 512; musicEnvCanvas.height = 256;
    const mCtx = musicEnvCanvas.getContext('2d');
    mCtx.fillStyle = '#080502';
    mCtx.fillRect(0, 0, 512, 256);

    const mHoriz = mCtx.createLinearGradient(0, 50, 0, 200);
    mHoriz.addColorStop(0, '#0a0602');
    mHoriz.addColorStop(0.25, '#3a1e06');
    mHoriz.addColorStop(0.5, '#d98b25');
    mHoriz.addColorStop(0.75, '#5c2d08');
    mHoriz.addColorStop(1, '#080502');
    mCtx.fillStyle = mHoriz;
    mCtx.fillRect(0, 50, 512, 150);

    const mRad1 = mCtx.createRadialGradient(130, 55, 0, 130, 55, 125);
    mRad1.addColorStop(0, '#fff4d6');
    mRad1.addColorStop(0.22, '#ffcf66');
    mRad1.addColorStop(0.50, '#d4831a');
    mRad1.addColorStop(0.78, '#4a2405');
    mRad1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    mCtx.fillStyle = mRad1;
    mCtx.beginPath();
    mCtx.arc(130, 55, 125, 0, Math.PI * 2);
    mCtx.fill();

    const mRad2 = mCtx.createRadialGradient(385, 75, 0, 385, 75, 95);
    mRad2.addColorStop(0, '#ffbf52');
    mRad2.addColorStop(0.35, '#c97516');
    mRad2.addColorStop(0.75, '#3d1a03');
    mRad2.addColorStop(1, 'rgba(8, 5, 2, 0)');
    mCtx.fillStyle = mRad2;
    mCtx.beginPath();
    mCtx.arc(385, 75, 95, 0, Math.PI * 2);
    mCtx.fill();

    const mBokeh1 = mCtx.createRadialGradient(90, 140, 0, 90, 140, 35);
    mBokeh1.addColorStop(0, '#ff9e24');
    mBokeh1.addColorStop(0.6, '#804008');
    mBokeh1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    mCtx.fillStyle = mBokeh1;
    mCtx.beginPath();
    mCtx.arc(90, 140, 35, 0, Math.PI * 2);
    mCtx.fill();

    const musicEnvTexture = new THREE.CanvasTexture(musicEnvCanvas);
    musicEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = musicEnvTexture;

    // Dedicated Stage Accent Lights for Music Vinyl:
    // 1. Under-disc warm bronze fill
    const musicFillLight = new THREE.DirectionalLight(0x6e380a, 1.4);
    musicFillLight.position.set(3.0, -3.0, 3.5);
    musicGroup.add(musicFillLight);

    // 2. Liquid Gold Specular Glint Spotlight (Follows cursor, warm amber sheen)
    const musicGleamLight = new THREE.PointLight(0xffbe58, 2.8, 22, 1.2);
    musicGleamLight.position.set(0, 0, 5.0);
    musicGroup.add(musicGleamLight);

    // High-Resolution 1024x1024 Vinyl Canvas Texture (Rich 24K Bullion Gold Label & Obsidian Lacquer)
    const vCanvas = document.createElement('canvas');
    vCanvas.width = 1024; vCanvas.height = 1024;
    const ctx = vCanvas.getContext('2d');
    const cx = 512, cy = 512;

    // Base deep smoked obsidian vinyl body
    ctx.fillStyle = '#080605';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle dark bronze circular base gradient
    const discGrad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 500);
    discGrad.addColorStop(0, '#0a0806');
    discGrad.addColorStop(0.5, '#120d09');
    discGrad.addColorStop(0.9, '#080605');
    discGrad.addColorStop(1, '#050403');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 500, 0, Math.PI * 2);
    ctx.fill();

    // Concentric soundwave micro-grooves
    ctx.lineWidth = 1;
    for (let r = 160; r < 485; r += 2) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (r % 28 === 0) {
        // Track gap with warm amber-gold gleam
        ctx.strokeStyle = 'rgba(223, 164, 56, 0.32)';
      } else if (r % 8 === 0) {
        // Subtle golden sheen micro-groove
        ctx.strokeStyle = 'rgba(223, 164, 56, 0.14)';
      } else if (r % 5 === 0) {
        ctx.strokeStyle = 'rgba(60, 44, 26, 0.6)';
      } else {
        ctx.strokeStyle = 'rgba(20, 16, 12, 0.8)';
      }
      ctx.stroke();
    }

    // Outer lead-in groove rim
    ctx.beginPath();
    ctx.arc(cx, cy, 492, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(223, 164, 56, 0.35)';
    ctx.stroke();

    // Run-out groove spiral area
    ctx.beginPath();
    ctx.arc(cx, cy, 156, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(223, 164, 56, 0.28)';
    ctx.stroke();

    // 24K Antique Bullion Gold Center Label
    const labelRadius = 148;
    const labelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, labelRadius);
    labelGrad.addColorStop(0, '#ffe8a3');    // Champagne apex highlight
    labelGrad.addColorStop(0.20, '#f5c768'); // Radiant warm gold
    labelGrad.addColorStop(0.50, '#dfa438'); // 24K bullion gold
    labelGrad.addColorStop(0.78, '#9c6014'); // Warm antique bronze
    labelGrad.addColorStop(0.92, '#dfa438'); // Gold foil perimeter ring
    labelGrad.addColorStop(1, '#4a2505');    // Outer bronze beveled drop edge
    ctx.fillStyle = labelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, labelRadius, 0, Math.PI * 2);
    ctx.fill();

    // Precision concentric gold rings on label
    ctx.beginPath();
    ctx.arc(cx, cy, labelRadius - 4, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffd97d';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, labelRadius - 10, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(74, 37, 5, 0.45)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 235, 175, 0.7)';
    ctx.stroke();

    // Label Typography
    ctx.textAlign = 'center';

    // Top: ARIA VELEN
    ctx.font = 'bold 22px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText('A R I A   V E L E N', cx, cy - 65);

    // Sub-header: THE FREQUENCY
    ctx.font = '600 16px "Space Grotesk", monospace';
    ctx.fillStyle = '#fff6db';
    ctx.shadowBlur = 4;
    ctx.fillText('THE FREQUENCY', cx, cy - 38);

    ctx.shadowBlur = 0; // reset shadow

    // Center divider line
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy - 26);
    ctx.lineTo(cx + 55, cy - 26);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(74, 37, 5, 0.5)';
    ctx.stroke();

    // Lower details: MASTER STEREO // 24-BIT 96kHz
    ctx.font = '600 11px "Space Grotesk", monospace';
    ctx.fillStyle = '#2e1804';
    ctx.fillText('MASTER STEREO // 24-BIT 96kHz', cx, cy + 48);

    // Speed & catalog: 33⅓ RPM • SIDE A • 2026
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#5c3208';
    ctx.fillText('33⅓ RPM • SIDE A • 2026', cx, cy + 72);

    // Center Spindle Brass Grommet
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    const grommetGrad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 26);
    grommetGrad.addColorStop(0, '#ffd97d');
    grommetGrad.addColorStop(0.5, '#dfa438');
    grommetGrad.addColorStop(1, '#5a3008');
    ctx.fillStyle = grommetGrad;
    ctx.fill();

    // Spindle Hole (Center dark obsidian void)
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#050403';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 220, 120, 0.5)';
    ctx.stroke();

    const vinylTexture = new THREE.CanvasTexture(vCanvas);
    vinylTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const vinylGrooveNormal = createVinylGrooveNormalTexture(512, 512);
    const vinylRoughness = createVinylGrooveRoughnessTexture(512, 512);

    // Photorealistic 96-segment cylinder with MeshPhysicalMaterial
    const vinylGeo = new THREE.CylinderGeometry(4.75, 4.75, 0.08, 96);
    const vinylEdgeMat = new THREE.MeshPhysicalMaterial({
      color: 0x140e08,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.88,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.8
    });
    const vinylFaceMat = new THREE.MeshPhysicalMaterial({
      map: vinylTexture,
      normalMap: vinylGrooveNormal,
      normalScale: new THREE.Vector2(0.016, 0.016),
      roughnessMap: vinylRoughness,
      roughness: 0.13,
      metalness: 0.95,
      clearcoat: 0.96,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 3.2
    });
    const vinylMaterials = [vinylEdgeMat, vinylFaceMat, vinylFaceMat];
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMaterials);
    vinylMesh.rotation.x = Math.PI * 0.22;
    musicGroup.add(vinylMesh);

    // Solid 3D 24K Gold Spindle Pin in center
    const spindleGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.28, 32);
    const spindleMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfa438,
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 0.95,
      envMapIntensity: 3.5
    });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.position.y = 0.055;
    vinylMesh.add(spindleMesh);

    // Luminous 24K Bullion Gold Harmonic Orbit Rings
    const harmonicRings = [];
    const ringRadii = [5.6, 6.4, 7.3, 8.2, 9.2];
    ringRadii.forEach((r, idx) => {
      const rGeo = new THREE.RingGeometry(r, r + 0.045, 96);
      const rMat = new THREE.MeshStandardMaterial({
        color: 0xdfa438,
        emissive: 0x9c6014,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.95,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.30 + (idx * 0.08)
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = Math.PI * 0.22;
      musicGroup.add(rMesh);
      harmonicRings.push({ mesh: rMesh, baseRadius: r, speed: (idx % 2 === 0 ? 1 : -1) * (0.003 + idx * 0.002) });
    });

    let isCursorOverVinyl = false;
    const vinylStageEl = document.getElementById('vinyl-stage');
    if (vinylStageEl) {
      vinylStageEl.addEventListener('mouseenter', () => { isCursorOverVinyl = true; });
      vinylStageEl.addEventListener('mouseleave', () => { isCursorOverVinyl = false; });
    }

    animatePageModel = (elapsedTime, delta) => {
      const spinSpd = state.isMusicPlaying ? 0.038 : (isCursorOverVinyl ? 0.016 : 0.006);
      vinylMesh.rotation.y += spinSpd;

      const targetRotX = (Math.PI * 0.22) - (state.mouse.y * 0.20);
      const targetRotZ = (state.mouse.x * 0.20);
      const damp = 1.0 - Math.exp(-7.0 * delta);

      vinylMesh.rotation.x += (targetRotX - vinylMesh.rotation.x) * damp;
      vinylMesh.rotation.z += (targetRotZ - vinylMesh.rotation.z) * damp;

      // Update cursor gleam light position
      musicGleamLight.position.x = state.mouse.x * 4.2;
      musicGleamLight.position.y = state.mouse.y * 3.6;
      musicGleamLight.intensity = 2.4 + (state.bassPulse * 1.5);

      harmonicRings.forEach((r, idx) => {
        r.mesh.rotation.z += r.speed;
        const pulse = 1.0 + Math.sin(elapsedTime * 2.2 + idx) * 0.015 + (state.bassPulse * 0.06);
        r.mesh.scale.set(pulse, pulse, 1);
        r.mesh.material.opacity = (0.28 + idx * 0.08) + (state.bassPulse * 0.2);
      });

      // Smooth ascension on scroll driven by state.smoothScrollY
      const scrollY = state.smoothScrollY;
      const heroHeight = winHeight;
      const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.75)));
      musicGroup.position.y = -0.15 + p * 8.0;

      // Responsive scale on narrow screens / mobile
      const aspect = winAspect;
      const responsiveMusicScale = aspect < 1.0 ? Math.max(0.52, aspect * 0.78) : 1.0;
      musicGroup.scale.setScalar(responsiveMusicScale);

      if (p >= 0.85) {
        musicGroup.visible = false;
        if (canvas) canvas.style.opacity = '0';
        return;
      } else {
        musicGroup.visible = true;
      }

      if (canvas) {
        canvas.style.opacity = Math.max(0, 1.0 - p * 1.5).toFixed(3);
      }
    };

    activeModel = musicGroup;

  } else if (pageType === 'tour') {
    // -----------------------------------------------------------------------
    // TOUR: MONUMENTAL 3D WORLD TOUR GLOBE & ASTRONOMICAL ARMILLARY MATRIX
    // - High-Resolution 2048x1024 Hand-Crafted World Map & Telemetry Texture:
    //   * Accurate continental geography (India Subcontinent, Europe, Americas, Asia, Africa, Australia)
    //   * Fine geographic grid (Equator, Prime Meridian, Tropics of Cancer/Capricorn, Parallels every 15°)
    //   * Accurate tour sanctuary markers (Mumbai, Pune, Delhi, London, Paris, Berlin, Tokyo, New York, Reykjavik)
    // - 3D 24K Gold City Sanctuary Beacon Pins & Pulsing Sonar Radar Rings
    // - Arched 3D Glowing Flight Route Tubes spanning across continents
    // - Earth's authentic 23.44° Axial Inclination Rotation (silky continuous spin)
    // - Calibrated Astronomical Armillary Rings & Polar Finial Axis Shaft
    // - Photorealistic 24K Bullion Gold & Smoked Obsidian PBR Material (matching Home model)
    // - Chiaroscuro Stage HDR Lighting & Interactive Cursor Gleam Flare
    // -----------------------------------------------------------------------
    camera.position.set(0, 0, 11);

    const tourGroup = new THREE.Group();
    scene.add(tourGroup);

    let isDesktop = window.innerWidth > 900;
    function updateTourPosition() {
      isDesktop = window.innerWidth > 900;
      if (!isDesktop) {
        tourGroup.scale.setScalar(0.70);
      } else {
        tourGroup.scale.setScalar(0.85);
      }
    }
    updateTourPosition();
    window.addEventListener('resize', updateTourPosition);

    // Harmonized Stage Lighting matching the Homepage and About models
    ambientLight.color.setHex(0x180d04);
    ambientLight.intensity = 0.35;

    keyLight.position.set(-6.2, 5.8, 4.8);
    keyLight.color.setHex(0xffbe55);
    keyLight.intensity = 3.2;

    specLight.position.set(-3.8, 4.6, 5.5);
    specLight.color.setHex(0xffdf8e);
    specLight.intensity = 2.4;

    topLight.position.set(-0.8, 8.0, 3.8);
    topLight.color.setHex(0xffcc66);
    topLight.intensity = 1.6;

    rimLight.position.set(5.5, 3.2, -3.2);
    rimLight.color.setHex(0xffa22e);
    rimLight.intensity = 3.6;

    warmBounce.position.set(0, -5.0, 2.5);
    warmBounce.color.setHex(0x381c05);
    warmBounce.intensity = 0.45;

    // Dedicated Stage Reflection Map matching Home and About models 1:1
    const tourEnvCanvas = document.createElement('canvas');
    tourEnvCanvas.width = 512; tourEnvCanvas.height = 256;
    const tCtx = tourEnvCanvas.getContext('2d');
    tCtx.fillStyle = '#080502';
    tCtx.fillRect(0, 0, 512, 256);

    const tHoriz = tCtx.createLinearGradient(0, 50, 0, 200);
    tHoriz.addColorStop(0, '#0a0602');
    tHoriz.addColorStop(0.25, '#3a1e06');
    tHoriz.addColorStop(0.5, '#d98b25');
    tHoriz.addColorStop(0.75, '#5c2d08');
    tHoriz.addColorStop(1, '#080502');
    tCtx.fillStyle = tHoriz;
    tCtx.fillRect(0, 50, 512, 150);

    const tRad1 = tCtx.createRadialGradient(130, 55, 0, 130, 55, 125);
    tRad1.addColorStop(0, '#fff4d6');
    tRad1.addColorStop(0.22, '#ffcf66');
    tRad1.addColorStop(0.50, '#d4831a');
    tRad1.addColorStop(0.78, '#4a2405');
    tRad1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    tCtx.fillStyle = tRad1;
    tCtx.beginPath();
    tCtx.arc(130, 55, 125, 0, Math.PI * 2);
    tCtx.fill();

    const tRad2 = tCtx.createRadialGradient(385, 75, 0, 385, 75, 95);
    tRad2.addColorStop(0, '#ffbf52');
    tRad2.addColorStop(0.35, '#c97516');
    tRad2.addColorStop(0.75, '#3d1a03');
    tRad2.addColorStop(1, 'rgba(8, 5, 2, 0)');
    tCtx.fillStyle = tRad2;
    tCtx.beginPath();
    tCtx.arc(385, 75, 95, 0, Math.PI * 2);
    tCtx.fill();

    const tBokeh1 = tCtx.createRadialGradient(90, 140, 0, 90, 140, 35);
    tBokeh1.addColorStop(0, '#ff9e24');
    tBokeh1.addColorStop(0.6, '#804008');
    tBokeh1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    tCtx.fillStyle = tBokeh1;
    tCtx.beginPath();
    tCtx.arc(90, 140, 35, 0, Math.PI * 2);
    tCtx.fill();

    const tourEnvTexture = new THREE.CanvasTexture(tourEnvCanvas);
    tourEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tourEnvTexture;

    // Dedicated Stage Accent Lights for Tour Sculpture:
    const tourFillLight = new THREE.DirectionalLight(0x6e380a, 1.4);
    tourFillLight.position.set(3.0, -3.0, 3.5);
    tourGroup.add(tourFillLight);

    const tourGleamLight = new THREE.PointLight(0xffbe58, 2.8, 22, 1.2);
    tourGleamLight.position.set(0, 0, 5.0);
    tourGroup.add(tourGleamLight);

    // =======================================================================
    // 1. HIGH-RESOLUTION WORLD MAP CANVAS TEXTURE (2048 x 1024)
    // Accurate Continental Geography, Lat/Lon Grids & Tour Telemetry
    // =======================================================================
    const mapW = 2048, mapH = 1024;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = mapW; mapCanvas.height = mapH;
    const mctx = mapCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = mapW; bumpCanvas.height = mapH;
    const bctx = bumpCanvas.getContext('2d');

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = mapW; roughCanvas.height = mapH;
    const rctx = roughCanvas.getContext('2d');

    // Ocean: Smoked Obsidian Bronze Depth
    mctx.fillStyle = '#0a0805';
    mctx.fillRect(0, 0, mapW, mapH);

    bctx.fillStyle = '#000000'; // Sea is base elevation 0
    bctx.fillRect(0, 0, mapW, mapH);

    rctx.fillStyle = '#141414'; // Ocean is specular high-mirror polish (roughness ~0.08)
    rctx.fillRect(0, 0, mapW, mapH);

    // Coordinate conversion: Longitude [-180, 180] -> [0, mapW], Latitude [-90, 90] -> [mapH, 0]
    function toX(lon) { return ((lon + 180) / 360) * mapW; }
    function toY(lat) { return ((90 - lat) / 180) * mapH; }

    // Draw Parallels & Meridians Grid
    mctx.lineWidth = 1;
    mctx.strokeStyle = 'rgba(223, 164, 56, 0.16)';
    for (let lon = -180; lon <= 180; lon += 15) {
      mctx.beginPath();
      mctx.moveTo(toX(lon), 0);
      mctx.lineTo(toX(lon), mapH);
      mctx.stroke();
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      mctx.beginPath();
      mctx.moveTo(0, toY(lat));
      mctx.lineTo(mapW, toY(lat));
      mctx.stroke();
    }

    // Equator Line (Prominent 24K Gold Ribbon)
    mctx.lineWidth = 2.5;
    mctx.strokeStyle = '#dfa438';
    mctx.beginPath();
    mctx.moveTo(0, toY(0));
    mctx.lineTo(mapW, toY(0));
    mctx.stroke();

    // Prime Meridian
    mctx.lineWidth = 1.8;
    mctx.strokeStyle = 'rgba(255, 230, 160, 0.55)';
    mctx.beginPath();
    mctx.moveTo(toX(0), 0);
    mctx.lineTo(toX(0), mapH);
    mctx.stroke();

    // Tropics of Cancer & Capricorn (Dashed Gold)
    mctx.setLineDash([8, 6]);
    mctx.lineWidth = 1.2;
    mctx.strokeStyle = 'rgba(223, 164, 56, 0.38)';
    mctx.beginPath();
    mctx.moveTo(0, toY(23.44));
    mctx.lineTo(mapW, toY(23.44));
    mctx.moveTo(0, toY(-23.44));
    mctx.lineTo(mapW, toY(-23.44));
    mctx.stroke();
    mctx.setLineDash([]); // reset

    // Degree Labels along Equator
    mctx.font = 'bold 11px monospace';
    mctx.fillStyle = 'rgba(223, 164, 56, 0.65)';
    mctx.textAlign = 'center';
    for (let lon = -180; lon < 180; lon += 30) {
      const label = lon === 0 ? '0°' : (lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`);
      mctx.fillText(label, toX(lon), toY(0) - 6);
    }

    // Accurate Continental Polygons & Landmasses
    function drawLandmass(pts) {
      if (!pts || pts.length < 3) return;
      // 1. Draw Land in Map Canvas
      mctx.beginPath();
      mctx.moveTo(toX(pts[0][0]), toY(pts[0][1]));
      for (let i = 1; i < pts.length; i++) {
        mctx.lineTo(toX(pts[i][0]), toY(pts[i][1]));
      }
      mctx.closePath();
      mctx.fillStyle = '#dfa438'; // 24K Bullion Gold Land
      mctx.fill();
      mctx.lineWidth = 2.0;
      mctx.strokeStyle = '#ffeaa7'; // Luminous Champagne Coastlines
      mctx.stroke();

      // 2. Draw Bump (Topographic Elevation)
      bctx.beginPath();
      bctx.moveTo(toX(pts[0][0]), toY(pts[0][1]));
      for (let i = 1; i < pts.length; i++) {
        bctx.lineTo(toX(pts[i][0]), toY(pts[i][1]));
      }
      bctx.closePath();
      bctx.fillStyle = '#b0b0b0'; // Land elevated
      bctx.fill();
      bctx.lineWidth = 2.0;
      bctx.strokeStyle = '#ffffff'; // Peaks & cliffs
      bctx.stroke();

      // 3. Draw Roughness (Satin Bullion Land)
      rctx.beginPath();
      rctx.moveTo(toX(pts[0][0]), toY(pts[0][1]));
      for (let i = 1; i < pts.length; i++) {
        rctx.lineTo(toX(pts[i][0]), toY(pts[i][1]));
      }
      rctx.closePath();
      rctx.fillStyle = '#454545'; // Land roughness ~0.18
      rctx.fill();
    }

    // Accurate Landmass Data:
    // India Subcontinent (Detailed & Prominent)
    drawLandmass([
      [68.5, 23.5], [69.5, 21.8], [72.8, 19.0], [73.8, 15.5], [75.2, 12.0],
      [77.5, 8.1], [78.5, 9.5], [80.3, 13.2], [82.8, 17.0], [86.5, 20.8],
      [88.8, 21.8], [91.5, 22.0], [93.5, 24.5], [94.5, 27.5], [89.0, 26.8],
      [85.5, 27.5], [80.5, 30.5], [76.5, 33.5], [74.0, 34.5], [72.5, 32.0],
      [70.0, 28.5], [68.5, 25.0]
    ]);
    // Sri Lanka
    drawLandmass([[80.0, 9.8], [81.8, 8.5], [81.5, 6.2], [80.0, 6.0], [79.8, 8.2]]);

    // Europe (Western, Central & Mediterranean)
    drawLandmass([
      [-9.5, 37.0], [-9.0, 43.5], [-1.5, 43.5], [-4.8, 48.5], [1.5, 50.8],
      [5.0, 53.5], [8.5, 55.0], [9.8, 57.5], [12.5, 55.5], [19.0, 54.5],
      [21.5, 55.8], [28.0, 59.5], [30.5, 49.5], [29.0, 45.0], [26.0, 40.2],
      [23.5, 38.0], [21.5, 36.8], [16.0, 38.2], [15.5, 41.0], [18.5, 40.2],
      [12.5, 43.8], [13.5, 45.8], [10.0, 44.0], [3.2, 43.2], [3.0, 42.2],
      [-0.5, 38.0], [-5.5, 36.0], [-9.5, 37.0]
    ]);
    // Great Britain
    drawLandmass([[-5.5, 50.0], [1.8, 51.2], [1.7, 52.8], [0.2, 54.2], [-2.0, 57.5], [-3.8, 58.7], [-5.2, 56.5], [-3.2, 53.5], [-5.0, 51.5]]);
    // Ireland
    drawLandmass([[-10.2, 51.8], [-6.0, 52.2], [-5.8, 54.5], [-8.2, 55.4], [-10.4, 54.0]]);
    // Scandinavia
    drawLandmass([[5.2, 58.5], [5.0, 62.0], [11.5, 65.0], [14.0, 68.2], [28.0, 71.0], [31.5, 70.2], [24.0, 65.2], [18.2, 59.8], [12.0, 56.0], [8.5, 57.2]]);
    // Iceland
    drawLandmass([[-24.0, 65.0], [-18.0, 66.5], [-13.5, 65.0], [-18.0, 63.5]]);

    // Africa & Madagascar
    drawLandmass([
      [-5.5, 36.0], [10.5, 37.2], [15.0, 32.5], [25.0, 32.0], [32.5, 31.5],
      [33.0, 27.5], [38.5, 22.0], [43.5, 12.5], [51.2, 11.8], [48.0, 5.0],
      [42.0, -1.0], [39.0, -5.0], [35.5, -15.0], [32.5, -26.0], [28.0, -32.5],
      [18.5, -34.8], [15.0, -28.5], [12.0, -18.0], [9.0, -4.5], [9.5, 4.5],
      [4.5, 5.0], [-1.0, 5.5], [-7.5, 4.5], [-13.0, 9.0], [-17.5, 14.8],
      [-16.5, 21.0], [-13.0, 27.5], [-9.5, 30.5], [-5.5, 36.0]
    ]);
    drawLandmass([[44.0, -13.0], [50.5, -13.5], [49.5, -20.0], [47.0, -25.5], [43.5, -24.0], [44.0, -17.0]]);

    // Asia & Middle East
    drawLandmass([
      [35.0, 32.0], [35.0, 28.0], [43.0, 13.0], [51.0, 15.0], [59.5, 22.5],
      [56.0, 26.0], [50.0, 26.0], [48.0, 30.0], [54.0, 38.0], [60.0, 42.0],
      [75.0, 45.0], [90.0, 48.0], [105.0, 52.0], [120.0, 53.0], [130.0, 43.0],
      [122.0, 38.0], [118.0, 30.0], [113.0, 22.0], [108.0, 18.0], [104.0, 10.0],
      [101.0, 3.0], [104.0, 1.3], [103.0, 7.0], [100.0, 14.0], [98.0, 17.0],
      [93.5, 24.5], [89.0, 26.8], [75.0, 35.0], [62.0, 30.0], [48.0, 30.0], [35.0, 32.0]
    ]);
    // Northern Siberia / Russia
    drawLandmass([
      [30.0, 60.0], [60.0, 60.0], [80.0, 72.0], [110.0, 76.0], [140.0, 72.0],
      [170.0, 68.0], [180.0, 65.0], [160.0, 55.0], [156.0, 51.0], [143.0, 50.0],
      [135.0, 58.0], [100.0, 65.0], [60.0, 62.0], [30.0, 60.0]
    ]);
    // Japan
    drawLandmass([[130.0, 33.0], [135.0, 34.5], [139.7, 35.7], [141.5, 38.5], [141.0, 43.0], [145.0, 44.0], [140.0, 41.0], [136.0, 36.0], [131.0, 34.0]]);
    // Southeast Asia Islands (Sumatra, Java, Borneo, Philippines)
    drawLandmass([[95.5, 5.5], [105.5, -5.8], [103.0, -4.0], [98.0, 2.0]]);
    drawLandmass([[106.0, -6.0], [114.0, -8.0], [112.0, -7.0], [106.0, -6.0]]);
    drawLandmass([[109.0, 2.0], [117.0, 4.0], [118.0, -4.0], [110.0, -3.0]]);
    drawLandmass([[120.0, 18.0], [125.0, 13.0], [126.0, 7.0], [121.0, 14.0]]);

    // North America & Greenland
    drawLandmass([
      [-168.0, 65.0], [-160.0, 71.0], [-130.0, 70.0], [-95.0, 69.0], [-80.0, 63.0],
      [-64.0, 60.0], [-55.0, 52.0], [-65.0, 45.0], [-70.0, 43.0], [-74.0, 40.7],
      [-75.5, 35.0], [-80.5, 25.0], [-82.5, 28.5], [-97.0, 26.0], [-97.0, 20.0],
      [-90.0, 21.0], [-87.0, 21.0], [-88.0, 16.0], [-83.0, 10.0], [-77.0, 8.0],
      [-80.0, 9.0], [-85.0, 13.0], [-92.0, 15.0], [-105.0, 20.0], [-115.0, 32.0],
      [-124.0, 40.0], [-125.0, 49.0], [-135.0, 58.0], [-150.0, 60.0], [-168.0, 65.0]
    ]);
    drawLandmass([[-50.0, 60.0], [-20.0, 70.0], [-18.0, 80.0], [-35.0, 83.0], [-58.0, 77.0], [-52.0, 68.0]]);

    // South America
    drawLandmass([
      [-75.0, 11.0], [-62.0, 11.0], [-50.0, 0.0], [-35.0, -5.0], [-35.0, -9.0],
      [-38.0, -13.0], [-42.0, -23.0], [-50.0, -30.0], [-58.0, -38.0], [-65.0, -45.0],
      [-68.0, -55.0], [-74.0, -52.0], [-74.0, -40.0], [-71.0, -30.0], [-70.0, -18.0],
      [-80.0, -5.0], [-77.0, 2.0], [-75.0, 11.0]
    ]);

    // Australia & New Zealand
    drawLandmass([
      [114.0, -22.0], [125.0, -14.0], [136.0, -12.0], [142.0, -11.0], [148.0, -20.0],
      [153.0, -28.0], [150.0, -37.0], [140.0, -38.0], [135.0, -34.0], [125.0, -33.0],
      [115.0, -34.0], [113.0, -26.0]
    ]);
    drawLandmass([[173.0, -35.0], [178.0, -38.0], [174.0, -41.0], [171.0, -44.0], [167.0, -46.0], [170.0, -43.0], [174.0, -37.0]]);

    // Antarctica
    drawLandmass([[-180.0, -78.0], [-120.0, -75.0], [-60.0, -64.0], [0.0, -70.0], [60.0, -68.0], [120.0, -66.0], [180.0, -78.0]]);

    // =======================================================================
    // 2. ACCURATE TOUR SANCTUARIES & TELEMETRY ON MAP
    // =======================================================================
    const tourSanctuaries = [
      { name: 'MUMBAI', lat: 19.076, lon: 72.877, venue: 'Jio World Arena', isHub: true },
      { name: 'PUNE', lat: 18.520, lon: 73.856, venue: 'Balewadi Amphitheatre', isHub: false },
      { name: 'DELHI', lat: 28.613, lon: 77.209, venue: 'JL Nehru Arena', isHub: true },
      { name: 'LONDON', lat: 51.507, lon: -0.127, venue: 'Royal Albert Hall', isHub: true },
      { name: 'PARIS', lat: 48.856, lon: 2.352, venue: 'Philharmonie de Paris', isHub: false },
      { name: 'BERLIN', lat: 52.520, lon: 13.405, venue: 'Kraftwerk Berlin', isHub: false },
      { name: 'TOKYO', lat: 35.676, lon: 139.650, venue: 'Bunkamura Orchard Hall', isHub: true },
      { name: 'NEW YORK', lat: 40.712, lon: -74.006, venue: 'Carnegie Hall', isHub: true },
      { name: 'REYKJAVÍK', lat: 64.146, lon: -21.942, venue: 'Harpa Eldborg', isHub: false }
    ];

    // Mark City Badges on Map Canvas
    mctx.textAlign = 'left';
    tourSanctuaries.forEach(c => {
      const cx = toX(c.lon);
      const cy = toY(c.lat);

      // Gold Target Ring
      mctx.beginPath();
      mctx.arc(cx, cy, 6, 0, Math.PI * 2);
      mctx.strokeStyle = '#fff5d0';
      mctx.lineWidth = 1.8;
      mctx.stroke();

      // Core Beacon Center Dot
      mctx.beginPath();
      mctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      mctx.fillStyle = '#ffffff';
      mctx.fill();

      // Precision Typography Badge
      mctx.font = 'bold 9px "Space Grotesk", monospace';
      mctx.fillStyle = '#ffffff';
      mctx.shadowColor = 'rgba(0,0,0,0.8)';
      mctx.shadowBlur = 4;
      mctx.fillText(`★ ${c.name}`, cx + 8, cy + 3);
      mctx.shadowBlur = 0;
    });

    const worldTexture = new THREE.CanvasTexture(mapCanvas);
    worldTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const worldBumpTexture = new THREE.CanvasTexture(bumpCanvas);
    const worldRoughnessTexture = new THREE.CanvasTexture(roughCanvas);

    // =======================================================================
    // 3. 3D GLOBE SPHERE (PBR 24K Bullion Gold & Mirror Obsidian Oceans)
    // =======================================================================
    const globeRadius = 2.30;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 96, 64);
    globeGeo.computeVertexNormals();

    const globeMat = new THREE.MeshPhysicalMaterial({
      map: worldTexture,
      bumpMap: worldBumpTexture,
      bumpScale: 0.035,
      roughnessMap: worldRoughnessTexture,
      roughness: 0.12,
      metalness: 0.95,
      clearcoat: 0.88,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      ior: 2.5,
      envMapIntensity: 2.5,
      fog: false,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });

    // Earth's authentic 23.44° Axial Tilt Pivot
    const globePivot = new THREE.Group();
    tourGroup.add(globePivot);
    globePivot.rotation.z = (23.44 * Math.PI) / 180; // 23.44° Earth Axial Tilt

    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globePivot.add(globeMesh);

    // Coordinate to 3D Sphere conversion
    function getSpherePos(lat, lon, r) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    // =======================================================================
    // 4. 3D CITY SANCTUARY BEACONS & PULSING SONAR RADAR RINGS
    // =======================================================================
    const beaconPins = [];
    const pulsingRings = [];

    const pinMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfa438,
      emissive: 0x5a3408,
      metalness: 1.0,
      roughness: 0.10,
      clearcoat: 0.95
    });

    const gemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    tourSanctuaries.forEach((c, idx) => {
      const pos = getSpherePos(c.lat, c.lon, globeRadius);
      const normal = pos.clone().normalize();

      // Pin Cylinder
      const pinGeo = new THREE.CylinderGeometry(0.020, 0.012, 0.14, 16);
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.07)));
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      globeMesh.add(pinMesh);

      // Top Radiant Gem
      const gemGeo = new THREE.SphereGeometry(c.isHub ? 0.038 : 0.026, 16, 16);
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.15)));
      globeMesh.add(gemMesh);

      // Pulsing Sonar Ring on Surface
      const rGeo = new THREE.RingGeometry(0.04, 0.08, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0xffdf88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.02)));
      rMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      globeMesh.add(rMesh);

      pulsingRings.push({ mesh: rMesh, baseScale: 1.0, offset: idx * 0.7 });
    });

    // =======================================================================
    // 5. 3D ARCHED TOUR FLIGHT ROUTE TUBES (CatmullRom Great-Circle Arcs)
    // =======================================================================
    const tourRoutes = [
      ['MUMBAI', 'PUNE'],
      ['PUNE', 'DELHI'],
      ['DELHI', 'LONDON'],
      ['LONDON', 'PARIS'],
      ['PARIS', 'BERLIN'],
      ['BERLIN', 'REYKJAVÍK'],
      ['REYKJAVÍK', 'NEW YORK'],
      ['DELHI', 'TOKYO'],
      ['TOKYO', 'MUMBAI']
    ];

    const flightTubeMat = new THREE.MeshStandardMaterial({
      color: 0xffe08a,
      emissive: 0xdfa438,
      emissiveIntensity: 0.85,
      metalness: 0.90,
      roughness: 0.18,
      transparent: true,
      opacity: 0.88
    });

    tourRoutes.forEach(pair => {
      const cityA = tourSanctuaries.find(c => c.name === pair[0]);
      const cityB = tourSanctuaries.find(c => c.name === pair[1]);
      if (!cityA || !cityB) return;

      const posA = getSpherePos(cityA.lat, cityA.lon, globeRadius);
      const posB = getSpherePos(cityB.lat, cityB.lon, globeRadius);

      const distance = posA.distanceTo(posB);
      const arcHeight = Math.min(0.55, Math.max(0.12, distance * 0.18));

      // Build 3D arc path with 24 curved intermediate points
      const points = [];
      const numPts = 24;
      for (let i = 0; i <= numPts; i++) {
        const t = i / numPts;
        const pt = new THREE.Vector3().lerpVectors(posA, posB, t);
        const elevation = Math.sin(t * Math.PI) * arcHeight;
        pt.normalize().multiplyScalar(globeRadius + elevation);
        points.push(pt);
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.012, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, flightTubeMat);
      globeMesh.add(tubeMesh);
    });

    // =======================================================================
    // 6. ASTRONOMICAL POLAR AXIS SPINDLE & MERIDIAN ARMILLARY RINGS
    // =======================================================================
    const armillaryGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfa438,
      emissive: 0x140702,
      metalness: 1.0,
      roughness: 0.14,
      clearcoat: 0.88,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.4
    });

    // North & South Pole Finials & Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.030, 0.030, 5.2, 24);
    const shaftMesh = new THREE.Mesh(shaftGeo, armillaryGoldMat);
    globePivot.add(shaftMesh);

    const finialGeo = new THREE.CylinderGeometry(0.14, 0.08, 0.26, 32);
    const finialNorth = new THREE.Mesh(finialGeo, armillaryGoldMat);
    finialNorth.position.y = 2.48;
    globePivot.add(finialNorth);

    const finialSouth = new THREE.Mesh(finialGeo, armillaryGoldMat);
    finialSouth.position.y = -2.48;
    finialSouth.rotation.x = Math.PI;
    globePivot.add(finialSouth);

    // Calibrated 360° Meridian Ring enclosing the globe
    const meridianRingGeo = new THREE.TorusGeometry(2.62, 0.030, 24, 128);
    const meridianRing = new THREE.Mesh(meridianRingGeo, armillaryGoldMat);
    globePivot.add(meridianRing);

    // Outer Celestial Horizon & Gyro Gimbal Rings
    const horizonRingGeo = new THREE.TorusGeometry(2.95, 0.025, 20, 128);
    const horizonRing = new THREE.Mesh(horizonRingGeo, armillaryGoldMat);
    horizonRing.rotation.x = Math.PI * 0.5;
    tourGroup.add(horizonRing);

    const outerGimbalGeo = new THREE.TorusGeometry(3.38, 0.018, 16, 128);
    const outerGimbal = new THREE.Mesh(outerGimbalGeo, armillaryGoldMat);
    outerGimbal.rotation.x = 0.52;
    outerGimbal.rotation.y = 0.35;
    tourGroup.add(outerGimbal);

    // =======================================================================
    // 7. SILKY SMOOTH ANIMATION & INTERACTIVE PARALLAX TRACKING
    // =======================================================================
    animatePageModel = (elapsedTime, delta) => {
      tourGleamLight.position.x = state.mouse.x * 3.8;
      tourGleamLight.position.y = state.mouse.y * 3.2;

      const scrollY = state.smoothScrollY;
      const heroHeight = winHeight;
      const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.72)));

      if (p >= 0.88) {
        tourGroup.visible = false;
        if (canvas) canvas.style.opacity = '0';
        return;
      } else {
        tourGroup.visible = true;
      }

      // Smooth Fade on Scroll
      const fadeAlpha = Math.max(0.0, Math.pow(1.0 - p, 1.4));
      globeMat.opacity = fadeAlpha;
      armillaryGoldMat.opacity = fadeAlpha;

      // Scroll Ascension
      const ascentY = Math.pow(p, 1.1) * 8.0;

      // 1. Silky Smooth Continuous Polar Rotation (Authentic Earth Spin)
      globeMesh.rotation.y += 0.0035;

      // 2. Real-Time Pulsing Radar Rings at Tour Cities
      pulsingRings.forEach(r => {
        const wave = Math.sin(elapsedTime * 3.2 + r.offset);
        const scale = 1.0 + Math.max(0, wave) * 0.75;
        r.mesh.scale.set(scale, scale, 1);
        r.mesh.material.opacity = Math.max(0.12, 0.75 - Math.max(0, wave) * 0.55);
      });

      // 3. Counter-Precession of Outer Armillary Rings
      horizonRing.rotation.z += 0.0018;
      outerGimbal.rotation.z += -0.0022;
      outerGimbal.rotation.x += 0.0012;

      // 4. Zero-gravity spatial breathing drift
      const floatY = Math.sin(elapsedTime * 0.72) * 0.14 + Math.cos(elapsedTime * 0.36) * 0.05;
      const floatX = Math.cos(elapsedTime * 0.52) * 0.08;
      const floatZ = Math.sin(elapsedTime * 0.62) * 0.06;

      // 5. Reactive 3D cursor tilt with exponential damping
      const cursorTiltX = -state.mouse.y * 0.35;
      const cursorTiltY = state.mouse.x * 0.55;

      const rotDamp = 1.0 - Math.exp(-5.5 * delta);
      const posDamp = 1.0 - Math.exp(-6.0 * delta);

      globePivot.rotation.x += (cursorTiltX + (state.dragRot.x * 0.10) - globePivot.rotation.x) * rotDamp;
      globePivot.rotation.y += (cursorTiltY + (state.dragRot.y * 0.10) - globePivot.rotation.y) * rotDamp;

      // Interactive 3D spatial position tracking: glides with cursor
      const basePosX = isDesktop ? 2.9 : 0.0;
      const basePosY = isDesktop ? -0.10 : 0.35;
      const targetPosX = basePosX + floatX + (state.mouse.x * 0.50);
      const targetPosY = basePosY + floatY + (state.mouse.y * 0.40) + ascentY;
      const targetPosZ = floatZ + (-Math.abs(state.mouse.x) * 0.18);

      tourGroup.position.x += (targetPosX - tourGroup.position.x) * posDamp;
      tourGroup.position.y += (targetPosY - tourGroup.position.y) * posDamp;
      tourGroup.position.z += (targetPosZ - tourGroup.position.z) * posDamp;

      // Responsive scale on scroll
      const baseScale = isDesktop ? 0.85 : 0.70;
      tourGroup.scale.setScalar(Math.max(0.001, (baseScale - p * 0.85)));

      if (canvas) {
        canvas.style.opacity = Math.max(0, 1.0 - p * 1.5).toFixed(3);
      }
    };

    activeModel = tourGroup;
  } else if (pageType === 'contact') {
    // -----------------------------------------------------------------------
    // CONTACT: REFINED 24K BULLION CHISELED HELICAL IRIS PORTAL (THIN RIMS)
    // Harmonized with Home and About Models 1:1:
    // - Thin, Slender, Sculptural Knife-Edge Rims (R=3.35, rBase=0.52, rApex=0.36)
    // - Compact Aperture & Monumental Ribbon Ratio
    // - Authentic 24K Bullion Gold PBR Finish (0xdfa438, 100% metal, 0.14 roughness, 0.88 clearcoat)
    // - Non-Uniform Micro-Polish Roughness Map & Tangent Normal Map
    // - Etched 5-Line Musical Scores & Debossed Audio Soundwave Amplitude Spikes
    // - Harmonized Stage Lighting Rig & Equirectangular Stage HDR Reflection Map
    // - Floating Golden Dust Embers & Spatial Zero-Gravity Breathing
    // - Tactile Hover Glint, Cursor Parallax & Smooth Fade/Ascension on Scroll
    // -----------------------------------------------------------------------
    camera.position.set(0, 0, 10.5);
    const contactGroup = new THREE.Group();
    scene.add(contactGroup);
    contactGroup.position.set(0, 0, 0);

    // Responsive scaling and centering for Contact hero centerpiece
    let basePortalScale = 0.95;
    function updateContactPortalPosition() {
      const w = window.innerWidth;
      if (w <= 768) {
        basePortalScale = 0.65;
        contactGroup.position.set(0, -0.15, 0);
      } else if (w <= 1100) {
        basePortalScale = 0.80;
        contactGroup.position.set(0, 0.0, 0);
      } else {
        basePortalScale = 0.95;
        contactGroup.position.set(0, 0.05, 0);
      }
      contactGroup.scale.setScalar(basePortalScale);
    }
    updateContactPortalPosition();
    window.addEventListener('resize', updateContactPortalPosition);

    // Harmonized Stage Lighting matching Home and About models 1:1
    ambientLight.color.setHex(0x180d04);
    ambientLight.intensity = 0.35;

    keyLight.position.set(-6.2, 5.8, 4.8);
    keyLight.color.setHex(0xffbe55);
    keyLight.intensity = 3.2;

    specLight.position.set(-3.8, 4.6, 5.5);
    specLight.color.setHex(0xffdf8e);
    specLight.intensity = 2.4;

    topLight.position.set(-0.8, 8.0, 3.8);
    topLight.color.setHex(0xffcc66);
    topLight.intensity = 1.6;

    rimLight.position.set(5.5, 3.2, -3.2);
    rimLight.color.setHex(0xffa22e);
    rimLight.intensity = 3.6;

    warmBounce.position.set(0, -5.0, 2.5);
    warmBounce.color.setHex(0x381c05);
    warmBounce.intensity = 0.45;

    // Dedicated Stage Reflection Map matching Home and About models 1:1
    const contactEnvCanvas = document.createElement('canvas');
    contactEnvCanvas.width = 512; contactEnvCanvas.height = 256;
    const cCtx = contactEnvCanvas.getContext('2d');
    cCtx.fillStyle = '#080502';
    cCtx.fillRect(0, 0, 512, 256);

    const cHoriz = cCtx.createLinearGradient(0, 50, 0, 200);
    cHoriz.addColorStop(0, '#0a0602');
    cHoriz.addColorStop(0.25, '#3a1e06');
    cHoriz.addColorStop(0.5, '#d98b25');
    cHoriz.addColorStop(0.75, '#5c2d08');
    cHoriz.addColorStop(1, '#080502');
    cCtx.fillStyle = cHoriz;
    cCtx.fillRect(0, 50, 512, 150);

    const cRad1 = cCtx.createRadialGradient(130, 55, 0, 130, 55, 125);
    cRad1.addColorStop(0, '#fff4d6');
    cRad1.addColorStop(0.22, '#ffcf66');
    cRad1.addColorStop(0.50, '#d4831a');
    cRad1.addColorStop(0.78, '#4a2405');
    cRad1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    cCtx.fillStyle = cRad1;
    cCtx.beginPath();
    cCtx.arc(130, 55, 125, 0, Math.PI * 2);
    cCtx.fill();

    const cRad2 = cCtx.createRadialGradient(385, 75, 0, 385, 75, 95);
    cRad2.addColorStop(0, '#ffbf52');
    cRad2.addColorStop(0.35, '#c97516');
    cRad2.addColorStop(0.75, '#3d1a03');
    cRad2.addColorStop(1, 'rgba(8, 5, 2, 0)');
    cCtx.fillStyle = cRad2;
    cCtx.beginPath();
    cCtx.arc(385, 75, 95, 0, Math.PI * 2);
    cCtx.fill();

    const cBokeh1 = cCtx.createRadialGradient(90, 140, 0, 90, 140, 35);
    cBokeh1.addColorStop(0, '#ff9e24');
    cBokeh1.addColorStop(0.6, '#804008');
    cBokeh1.addColorStop(1, 'rgba(8, 5, 2, 0)');
    cCtx.fillStyle = cBokeh1;
    cCtx.beginPath();
    cCtx.arc(90, 140, 35, 0, Math.PI * 2);
    cCtx.fill();

    const contactEnvTexture = new THREE.CanvasTexture(contactEnvCanvas);
    contactEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = contactEnvTexture;

    // High-Resolution Procedural Texture: 24K Bullion Gold with Etched Soundwaves & Music Staves
    // Color graded identically to the Home & About 3D Bullion Gold Palette
    function createChiseledPortalTexture(width, height) {
      const w = width || 2048;
      const h = height || 1024;
      const tCanvas = document.createElement('canvas');
      tCanvas.width = w; tCanvas.height = h;
      const tCtx = tCanvas.getContext('2d');

      // Chiaroscuro 24K Bullion Gold Gradient matching createBullionGradientTexture 1:1
      const baseGrad = tCtx.createLinearGradient(0, 0, 0, h);
      baseGrad.addColorStop(0.00, '#fff6dc'); // Luminous incandescent specular peak
      baseGrad.addColorStop(0.12, '#ffdf8e'); // Warm champagne highlight
      baseGrad.addColorStop(0.30, '#dfa438'); // Rich saturated 24K bullion gold (exact About/Home tone)
      baseGrad.addColorStop(0.55, '#d4831a'); // Saturated amber-gold core
      baseGrad.addColorStop(0.76, '#6e380a'); // Deep warm chiaroscuro bronze shadow
      baseGrad.addColorStop(0.90, '#381c05'); // Cognac velvety bronze
      baseGrad.addColorStop(1.00, '#140702'); // Deep obsidian crevice tone
      tCtx.fillStyle = baseGrad;
      tCtx.fillRect(0, 0, w, h);

      // Fine horizontal brushed anisotropic striations matching sculptural finish
      const imgData = tCtx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        const yNorm = y / h;
        for (let x = 0; x < w; x++) {
          const idx = rowOffset + (x * 4);
          const xNorm = x / w;
          const wave = Math.sin(xNorm * Math.PI * 48 + yNorm * 10) * 4;
          const noise = (Math.random() - 0.5) * 6 + wave;
          data[idx]     = Math.min(255, Math.max(0, Math.round(data[idx] + noise)));
          data[idx + 1] = Math.min(255, Math.max(0, Math.round(data[idx + 1] + noise * 0.82)));
          data[idx + 2] = Math.min(255, Math.max(0, Math.round(data[idx + 2] + noise * 0.45)));
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      const facetCount = 5;
      const facetH = h / facetCount;

      tCtx.save();
      for (let f = 0; f < facetCount; f++) {
        const fTop = f * facetH;
        const fMid = fTop + facetH * 0.46;

        // 1. Etched 5-Line Musical Score curving across the facet
        const staveSpacing = 5.5;
        const staveStartY = fMid - 11;
        tCtx.strokeStyle = 'rgba(20, 7, 2, 0.85)';
        tCtx.lineWidth = 1.5;
        for (let line = 0; line < 5; line++) {
          const ly = staveStartY + line * staveSpacing;
          tCtx.beginPath();
          tCtx.moveTo(0, ly);
          tCtx.bezierCurveTo(w * 0.3, ly - 6, w * 0.7, ly + 6, w, ly);
          tCtx.stroke();
        }

        // Musical Notes along the score
        tCtx.fillStyle = 'rgba(20, 7, 2, 0.90)';
        for (let nx = 50; nx < w; nx += 85 + ((f * 23) % 55)) {
          const ny = staveStartY + ((nx * 11) % 5) * staveSpacing;
          tCtx.beginPath();
          tCtx.ellipse(nx, ny, 4.0, 2.8, -0.32, 0, Math.PI * 2);
          tCtx.fill();
          tCtx.beginPath();
          tCtx.moveTo(nx + 3.4, ny);
          tCtx.lineTo(nx + 3.4, ny - 14);
          tCtx.lineWidth = 1.2;
          tCtx.stroke();
        }

        // 2. Etched Audio Waveform Bursts (Soundwave Amplitude Spikes)
        const waveCount = 2;
        for (let wc = 0; wc < waveCount; wc++) {
          const waveCenterX = ((w * (0.24 + wc * 0.5 + f * 0.12)) % (w - 240)) + 120;
          const waveWidth = 260;
          const barSpacing = 4.0;
          const barCount = Math.floor(waveWidth / barSpacing);

          for (let b = 0; b < barCount; b++) {
            const bx = (waveCenterX - waveWidth / 2) + b * barSpacing;
            const prog = b / barCount;
            const env = Math.pow(Math.sin(prog * Math.PI), 1.4);
            const freq = Math.sin(prog * Math.PI * 12) * 0.45 + Math.sin(prog * Math.PI * 26) * 0.25 + 0.35;
            const barHalfH = Math.max(2.5, env * freq * (facetH * 0.44));

            // Deep engraved core line
            tCtx.strokeStyle = 'rgba(16, 5, 2, 0.94)';
            tCtx.lineWidth = 1.8;
            tCtx.beginPath();
            tCtx.moveTo(bx, fMid - barHalfH);
            tCtx.lineTo(bx, fMid + barHalfH);
            tCtx.stroke();

            // Specular deboss highlight on top/right edge
            tCtx.strokeStyle = 'rgba(255, 235, 175, 0.55)';
            tCtx.lineWidth = 1.0;
            tCtx.beginPath();
            tCtx.moveTo(bx + 1.0, fMid - barHalfH);
            tCtx.lineTo(bx + 1.0, fMid + barHalfH);
            tCtx.stroke();
          }
        }
      }
      tCtx.restore();

      const texture = new THREE.CanvasTexture(tCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    }

    // Parametric 5-Blade Knife-Edge Helical Iris Portal Geometry (Thin Rims)
    function createChiseledIrisGeometry(R, rBase, rApex, lobes, twistTurns, uSegments) {
      R = R || 3.35;        // Large graceful diameter
      rBase = rBase || 0.52; // Thin, slender base tube radius (reduced from 1.15)
      rApex = rApex || 0.36; // Refined apex ridge height (reduced from 0.65)
      lobes = lobes || 5;
      twistTurns = twistTurns || 1;
      uSegments = uSegments || 240;

      const geom = new THREE.BufferGeometry();
      const pos = [];
      const uvs = [];
      const indices = [];

      const bladeSubRamp = 18;
      const bladeSubDrop = 6;
      const totalVSub = bladeSubRamp + bladeSubDrop;

      let vOffset = 0;

      for (let l = 0; l < lobes; l++) {
        const bladeStartAngle = (l / lobes) * Math.PI * 2;
        const bladeEndAngle = ((l + 1) / lobes) * Math.PI * 2;
        const bladeSpan = bladeEndAngle - bladeStartAngle;
        const rampSpan = bladeSpan * 0.77;
        const dropSpan = bladeSpan * 0.23;

        const bladeStartIdx = vOffset;

        for (let i = 0; i <= uSegments; i++) {
          const u = i / uSegments;
          const theta = u * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          const twistAngle = -u * Math.PI * 2 * twistTurns;

          for (let s = 0; s <= totalVSub; s++) {
            let alpha, h;
            if (s <= bladeSubRamp) {
              const p = s / bladeSubRamp;
              alpha = bladeStartAngle + p * rampSpan;
              h = Math.pow(p, 0.80);
            } else {
              const q = (s - bladeSubRamp) / bladeSubDrop;
              alpha = bladeStartAngle + rampSpan + q * dropSpan;
              h = 1.0 - Math.pow(q, 0.70);
            }

            const rProfile = rBase + rApex * h;
            const rotAngle = alpha + twistAngle;
            const locX = rProfile * Math.cos(rotAngle);
            const locY = rProfile * Math.sin(rotAngle) * 0.68;

            const px = (R + locX) * cosT;
            const py = (R + locX) * sinT;
            const pz = locY;

            pos.push(px, py, pz);
            const vCoord = (l + (s / totalVSub)) / lobes;
            uvs.push(u * 2, vCoord);
            vOffset++;
          }
        }

        const stride = totalVSub + 1;
        for (let i = 0; i < uSegments; i++) {
          for (let s = 0; s < totalVSub; s++) {
            const a = bladeStartIdx + i * stride + s;
            const b = bladeStartIdx + (i + 1) * stride + s;
            const c = bladeStartIdx + (i + 1) * stride + (s + 1);
            const d = bladeStartIdx + i * stride + (s + 1);
            indices.push(a, b, d);
            indices.push(b, c, d);
          }
        }
      }

      geom.setIndex(indices);
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.computeVertexNormals();

      return geom;
    }

    // 1. High-Resolution Brushed Satin 24K Bullion Gold Texture & Normal Map
    const portalTexture = createChiseledPortalTexture(2048, 1024);
    const portalNormalMap = createSculpturalNormalTexture(512, 512);
    const portalRoughnessMap = createSculpturalRoughnessTexture(512, 512);

    // 2. Photorealistic Physical PBR 24K Bullion Gold Material (Matching Home & About Models 1:1)
    const portalMat = new THREE.MeshPhysicalMaterial({
      map: portalTexture,
      color: 0xdfa438,            // Rich warm 24K Bullion Gold (matches Home & About models exactly)
      emissive: 0x140702,         // Deep bronze shadow depth in crevices
      metalness: 1.0,             // Pure precious metal
      roughness: 0.14,            // Base satin-polish
      roughnessMap: portalRoughnessMap, // Authentic non-uniform polishing cloth micro-grain
      normalMap: portalNormalMap,   // High-res brushed satin striations
      normalScale: new THREE.Vector2(0.012, 0.012),
      clearcoat: 0.88,            // High-gloss jewelry lacquer glaze
      clearcoatRoughness: 0.05,   // Mirror-like secondary specular sheen
      reflectivity: 1.0,
      ior: 2.5,
      envMapIntensity: 2.2,       // Balanced HDR reflections matching stage ambience
      fog: false,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });

    // Thin Rims: R=3.35, rBase=0.52, rApex=0.36
    const portalGeo = createChiseledIrisGeometry(3.35, 0.52, 0.36, 5, 1, 240);
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    contactGroup.add(portalMesh);

    // Presentation angle: matches the camera perspective in user reference image
    portalMesh.rotation.set(0.18, -0.14, 0.10);

    // Dedicated Stage Accent Lights:
    const knotFillLight = new THREE.DirectionalLight(0x6e380a, 1.4);
    knotFillLight.position.set(3.0, -3.0, 3.5);
    contactGroup.add(knotFillLight);

    const knotGleamLight = new THREE.PointLight(0xffbe58, 2.4, 18, 1.1);
    knotGleamLight.position.set(0, 0, 5.0);
    contactGroup.add(knotGleamLight);

    // Floating Golden Dust Embers
    const pCount = 220;
    const pGeo = new THREE.BufferGeometry();
    const pPos = [];
    for (let i = 0; i < pCount; i++) {
      pPos.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 12
      );
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd277,
      size: 0.040,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(pGeo, pMat);
    contactGroup.add(dustParticles);

    // Hit proxy for tactile cursor feedback
    const portalHitGeo = new THREE.SphereGeometry(3.6, 24, 16);
    const portalHitProxy = new THREE.Mesh(portalHitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false }));
    portalMesh.add(portalHitProxy);
    const hitTargets = [portalMesh, portalHitProxy];

    const contactRaycaster = new THREE.Raycaster();
    const contactMouseVec = new THREE.Vector2();
    let contactHoverBlend = 0.0;
    let continuousRollZ = 0.10;

    animatePageModel = (elapsedTime, delta) => {
      const scrollY = state.smoothScrollY;
      const heroHeight = winHeight;

      const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.70)));

      if (p >= 0.98) {
        contactGroup.visible = false;
        if (canvas) canvas.style.opacity = '0';
        return;
      } else {
        contactGroup.visible = true;
      }

      // 1. Smooth Fade on Scroll into contact inquiry form below
      const fadeAlpha = p <= 0.005 ? 1.0 : Math.max(0.0, Math.pow(1.0 - p, 1.55));
      portalMat.opacity = fadeAlpha;
      if (canvas) {
        canvas.style.opacity = Math.max(0, 1.0 - p * 1.5).toFixed(3);
      }

      // 2. Upward Scroll Ascension
      const ascentY = Math.pow(p, 1.1) * 22.0;

      // 3. Tactile hover feedback
      if (p < 0.85) {
        contactMouseVec.set(state.mouse.targetX, state.mouse.targetY);
        contactRaycaster.setFromCamera(contactMouseVec, camera);
        const hits = contactRaycaster.intersectObjects(hitTargets, false);
        const isHovered = hits.length > 0;
        const hDamp = 1.0 - Math.exp(-5.5 * delta);
        contactHoverBlend += ((isHovered ? 1.0 : 0.0) - contactHoverBlend) * hDamp;

        const cursorEl = document.getElementById('custom-cursor');
        if (cursorEl) {
          if (isHovered) {
            cursorEl.classList.add('hovering-3d');
          } else {
            cursorEl.classList.remove('hovering-3d');
          }
        }
      }

      // 4. Majestic Slow Precession & Zero-Gravity Float
      continuousRollZ += 0.08 * delta;

      const dynPitch = 0.18 + Math.sin(elapsedTime * 0.25) * 0.05;
      const dynYaw = -0.14 + Math.cos(elapsedTime * 0.20) * 0.05;

      const floatY = Math.sin(elapsedTime * 0.65) * 0.14 + Math.cos(elapsedTime * 0.35) * 0.05;
      const floatX = Math.cos(elapsedTime * 0.45) * 0.08;
      const floatZ = Math.sin(elapsedTime * 0.55) * 0.08;

      portalMesh.position.x = floatX;
      portalMesh.position.y = floatY;
      portalMesh.position.z = floatZ;

      contactGroup.position.y = ascentY;

      // Cursor parallax and inertia
      const targetRotX = dynPitch + (-state.mouse.y * 0.20);
      const targetRotY = dynYaw + (state.mouse.x * 0.25);
      const targetRotZ = continuousRollZ + (state.mouse.x * 0.06);

      const rotDamp = 1.0 - Math.exp(-4.5 * delta);
      portalMesh.rotation.x += (targetRotX + (state.dragRot.x * 0.08) - portalMesh.rotation.x) * rotDamp;
      portalMesh.rotation.y += (targetRotY + (state.dragRot.y * 0.08) - portalMesh.rotation.y) * rotDamp;
      portalMesh.rotation.z += (targetRotZ - portalMesh.rotation.z) * rotDamp;

      // Golden dust particles drift
      dustParticles.rotation.y += 0.02 * delta;
      dustParticles.rotation.z += 0.01 * delta;

      // Specular gleam follows cursor
      knotGleamLight.position.x = state.mouse.x * 3.4;
      knotGleamLight.position.y = state.mouse.y * 3.0;
      knotGleamLight.intensity = 2.4 + contactHoverBlend * 2.2;
    };

    activeModel = contactGroup;
  } else if (pageType === 'animation') {
    // -----------------------------------------------------------------------
    // ANIMATION: SCREEN-SIZED KINETIC 3D CHAMBER & MULTI-MODEL STUDIO
    // Pure screensized experience for 3D animation inspection & interaction
    // -----------------------------------------------------------------------
    camera.position.set(0, 0, 10);
    const studioGroup = new THREE.Group();
    scene.add(studioGroup);

    let currentModelKey = 'a';
    let kineticSpeedMultiplier = 1.0;
    const modelContainers = {};

    // Shared solid dark obsidian bullion gold material
    const studioNormalMap = createBrushedNormalTexture(256, 256, 16, 4, 4);
    const currentMaterial = createUnifiedObsidianGoldMaterial(studioNormalMap);

    // 1. Model: Monumental Gold 'A'
    const aGroup = new THREE.Group();
    studioGroup.add(aGroup);
    modelContainers['a'] = aGroup;

    const shape = new THREE.Shape();
    shape.moveTo(0, 4.2);
    shape.lineTo(3.2, -4.5);
    shape.lineTo(1.4, -4.5);
    shape.lineTo(0.9, -1.9);
    shape.lineTo(-0.9, -1.9);
    shape.lineTo(-1.4, -4.5);
    shape.lineTo(-3.2, -4.5);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(0, 2.2);
    hole.lineTo(-0.9, -0.25);
    hole.lineTo(0.9, -0.25);
    hole.closePath();
    shape.holes.push(hole);

    const aGeo = new THREE.ExtrudeGeometry(shape, {
      steps: 1, depth: 1.55, bevelEnabled: true, bevelThickness: 0.42, bevelSize: 0.30, bevelSegments: 3
    });
    aGeo.center();
    aGeo.computeVertexNormals();

    const aMesh = new THREE.Mesh(aGeo, currentMaterial);
    aGroup.add(aMesh);

    // 2. Model: Torus Knot
    const knotGroup = new THREE.Group();
    studioGroup.add(knotGroup);
    knotGroup.visible = false;
    modelContainers['knot'] = knotGroup;

    const knotGeo = new THREE.TorusKnotGeometry(2.4, 0.72, 128, 32, 2, 3);
    const knotMesh = new THREE.Mesh(knotGeo, currentMaterial);
    knotGroup.add(knotMesh);

    // 3. Model: Vinyl Turntable
    const vinylGroup = new THREE.Group();
    studioGroup.add(vinylGroup);
    vinylGroup.visible = false;
    modelContainers['vinyl'] = vinylGroup;

    const vCanvas = document.createElement('canvas');
    vCanvas.width = 512; vCanvas.height = 512;
    const vCtx = vCanvas.getContext('2d');
    vCtx.fillStyle = '#0d0d0d'; vCtx.fillRect(0, 0, 512, 512);
    vCtx.lineWidth = 1;
    for (let r = 80; r < 240; r += 3) {
      vCtx.beginPath(); vCtx.arc(256, 256, r, 0, Math.PI * 2);
      vCtx.strokeStyle = (r % 12 === 0) ? 'rgba(212, 175, 55, 0.5)' : 'rgba(40, 40, 40, 0.6)';
      vCtx.stroke();
    }
    vCtx.beginPath(); vCtx.arc(256, 256, 70, 0, Math.PI * 2);
    vCtx.fillStyle = '#8f6828'; vCtx.fill();
    vCtx.fillStyle = '#ffd700'; vCtx.font = 'bold 16px monospace'; vCtx.textAlign = 'center';
    vCtx.fillText('ARIA VELEN', 256, 246);
    vCtx.fillText('THE FREQUENCY', 256, 266);
    const vinylTex = new THREE.CanvasTexture(vCanvas);

    const vinylGeo = new THREE.CylinderGeometry(4.4, 4.4, 0.08, 48);
    const vinylMat = new THREE.MeshStandardMaterial({ map: vinylTex, roughness: 0.25, metalness: 0.88 });
    const vinylMesh = new THREE.Mesh(vinylGeo, [
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 }),
      vinylMat, vinylMat
    ]);
    vinylMesh.rotation.x = Math.PI * 0.28;
    vinylGroup.add(vinylMesh);

    // 4. Model: Holographic Globe
    const globeGroup = new THREE.Group();
    studioGroup.add(globeGroup);
    globeGroup.visible = false;
    modelContainers['globe'] = globeGroup;

    const globeWire = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 28, 14),
      new THREE.MeshBasicMaterial({ color: 0x8a6728, wireframe: true, transparent: true, opacity: 0.45 })
    );
    const globeCore = new THREE.Mesh(
      new THREE.SphereGeometry(2.26, 24, 24),
      currentMaterial
    );
    globeGroup.add(globeWire);
    globeGroup.add(globeCore);

    // 5. Model: Cymatic Wave
    const waveGroup = new THREE.Group();
    studioGroup.add(waveGroup);
    waveGroup.visible = false;
    modelContainers['wave'] = waveGroup;

    const waveGeo = new THREE.PlaneGeometry(16, 6.5, 36, 16);
    const waveMesh = new THREE.Mesh(waveGeo, currentMaterial);
    waveMesh.rotation.x = -Math.PI * 0.32;
    waveGroup.add(waveMesh);

    // Animation loop for screensized chamber
    let fpsAccum = 0;
    let fpsFrames = 0;
    animatePageModel = (elapsedTime, delta) => {
      const spd = delta * kineticSpeedMultiplier;

      if (currentModelKey === 'a') {
        aGroup.rotation.y += 0.5 * spd;
        aGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      } else if (currentModelKey === 'knot') {
        knotGroup.rotation.y += 0.9 * spd;
        knotGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.15;
      } else if (currentModelKey === 'vinyl') {
        vinylMesh.rotation.y += 1.8 * spd;
      } else if (currentModelKey === 'globe') {
        globeGroup.rotation.y += 0.6 * spd;
        globeGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.1;
      } else if (currentModelKey === 'wave') {
        const wavePos = waveGeo.attributes.position;
        for (let i = 0; i < wavePos.count; i++) {
          const u = wavePos.getX(i);
          const v = wavePos.getY(i);
          const waveZ = Math.sin(u * 0.8 + elapsedTime * 3 * kineticSpeedMultiplier) * 0.45
                      + Math.cos(v * 1.2 + elapsedTime * 2.5) * 0.3;
          wavePos.setZ(i, waveZ);
        }
        wavePos.needsUpdate = true;
      }

      // Responsive tilt / orbit drag
      const targetRotX = -state.mouse.y * 0.35;
      const targetRotY = state.mouse.x * 0.45;
      const rotDamp = 1.0 - Math.exp(-9.0 * delta);
      studioGroup.rotation.x += (targetRotX + state.dragRot.x - studioGroup.rotation.x) * rotDamp;
      studioGroup.rotation.y += (targetRotY + state.dragRot.y - studioGroup.rotation.y) * rotDamp;

      cursorLight.position.x = state.mouse.x * 6;
      cursorLight.position.y = state.mouse.y * 5;

      // Real-time FPS telemetry measured from the actual frame budget
      fpsAccum += delta;
      fpsFrames += 1;
      if (fpsAccum >= 0.5) {
        const fpsEl = document.getElementById('fps-display');
        if (fpsEl) {
          fpsEl.textContent = `${(fpsFrames / fpsAccum).toFixed(1)} FPS`;
        }
        fpsAccum = 0;
        fpsFrames = 0;
      }
    };

    activeModel = studioGroup;

    // Global Hooks for HTML UI Controls
    window.setStudioModel = (key) => {
      currentModelKey = key;
      Object.keys(modelContainers).forEach(k => {
        modelContainers[k].visible = (k === key);
      });
      state.dragRot.x = 0;
      state.dragRot.y = 0;
    };

    window.setStudioSpeed = (val) => {
      kineticSpeedMultiplier = parseFloat(val);
    };

    window.setStudioMaterial = (theme) => {
      const themes = {
        gold: { color: 0x1a1206, metalness: 1.0, roughness: 0.13, emissive: 0x040201 },
        chrome: { color: 0x141416, metalness: 1.0, roughness: 0.08, emissive: 0x020204 },
        platinum: { color: 0x222228, metalness: 0.98, roughness: 0.12, emissive: 0x06060a },
        rose: { color: 0x24120e, metalness: 0.96, roughness: 0.14, emissive: 0x080302 }
      };
      const t = themes[theme] || themes.gold;
      currentMaterial.color.setHex(t.color);
      currentMaterial.metalness = t.metalness;
      currentMaterial.roughness = t.roughness;
      currentMaterial.emissive.setHex(t.emissive);
    };
  }

  // Heavily dampened, graceful drag/tap rotation (no fast spinning or jerking even after clicks/taps)
  window.addEventListener('mousemove', (e) => {
    if (state.mouse.isDown && activeModel) {
      const deltaX = (e.clientX - state.mouse.prevX) * 0.001;
      const deltaY = (e.clientY - state.mouse.prevY) * 0.001;
      state.dragRot.y = Math.max(-0.3, Math.min(0.3, state.dragRot.y + deltaX * 0.25));
      state.dragRot.x = Math.max(-0.2, Math.min(0.2, state.dragRot.x + deltaY * 0.25));
      state.mouse.prevX = e.clientX;
      state.mouse.prevY = e.clientY;
    }
  });

  // Global High-Performance Render Loop with High-Resolution Timestamps
  const startTime = performance.now();
  let prevTime = startTime;

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Pause WebGL rendering entirely when tab is hidden or backgrounded to save 100% GPU/CPU
    if (document.hidden) {
      prevTime = performance.now();
      return;
    }

    const now = performance.now();
    const delta = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;
    const elapsedTime = (now - startTime) / 1000;

    // Smooth mouse coordinates with frame-rate independent exponential damping (subtle graceful delay)
    const smoothDamp = 1.0 - Math.exp(-10.0 * delta);
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * smoothDamp;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * smoothDamp;

    // Rapidly decay drag momentum when released so it settles immediately without lingering spin
    if (!state.mouse.isDown) {
      state.dragRot.x *= Math.exp(-8.0 * delta);
      state.dragRot.y *= Math.exp(-8.0 * delta);
    }

    // Smooth scroll interpolation with frame-rate independent exponential damping (silky 60/120fps)
    const scrollDamp = 1.0 - Math.exp(-12.0 * delta);
    state.smoothScrollY += (state.targetScrollY - state.smoothScrollY) * scrollDamp;

    // Dynamic interactive cursor light tracking: sweeps radiant golden gleam across the dark metallic model on all pages
    if (cursorLight) {
      cursorLight.position.x = state.mouse.x * 4.5;
      cursorLight.position.y = state.mouse.y * 3.8;
      cursorLight.position.z = 8.5;
    }

    animatePageModel(elapsedTime, delta);

    // Skip expensive WebGL rendering pass when active 3D model is offscreen or hidden
    if (activeModel && activeModel.visible === false) {
      return;
    }

    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      prevTime = performance.now();
    }
  }, { passive: true });

  renderLoop();

  window.Aria3DEngine = {
    setMusicPlaying: (isPlaying) => {
      state.isMusicPlaying = isPlaying;
    },
    setAudioFrequency: (freq, bass) => {
      state.audioFrequency = freq;
      state.bassPulse = bass;
    }
  };
  }

  // Safe launcher: triggers immediately if DOM is ready, or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAria3D);
  } else {
    startAria3D();
  }

})();
