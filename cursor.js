/**
 * ARIA VELEN — Luxury Custom Cursor System (Performance Optimized)
 * Perfectly matches User Reference: Pristine gold circular ring with concentric center dot.
 * - Hardware accelerated translate3d on parent container with zero CSS transition interference
 * - Smart idle sleeping (zero CPU/GPU utilization when mouse is stationary)
 * - Coarse/touch pointer detection to bypass overhead on mobile
 * - Non-layout-thrashing event delegation (avoids forced synchronous reflow)
 */

(function () {
  'use strict';

  // Fast exit on touch / coarse devices to save mobile battery and memory
  if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    return;
  }

  const cursorEl = document.getElementById('custom-cursor');
  if (!cursorEl) return;

  // Only now that the custom cursor is alive do we hide the native pointer
  // (CSS keys `cursor: none` off this class, so a JS failure can never leave
  // the user without a cursor).
  document.body.classList.add('custom-cursor-active');

  const dot = cursorEl.querySelector('.cursor-dot');
  const ring = cursorEl.querySelector('.cursor-ring');
  const badge = cursorEl.querySelector('.cursor-badge');

  // Coordinates with high-precision smoothing
  const pos = {
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    currX: window.innerWidth / 2,
    currY: window.innerHeight / 2
  };

  let isHovering = false;
  let currentAction = 'OPEN';
  let isFirstMove = true;
  let isSleeping = false;
  let lastTime = performance.now();
  let rafId = null;

  function wakeCursor() {
    if (isSleeping) {
      isSleeping = false;
      lastTime = performance.now();
      rafId = requestAnimationFrame(updateCursor);
    }
  }

  // Track raw mouse pointer with immediate coordinate synchronization
  window.addEventListener('mousemove', (e) => {
    pos.targetX = e.clientX;
    pos.targetY = e.clientY;

    if (isFirstMove) {
      pos.currX = e.clientX;
      pos.currY = e.clientY;
      isFirstMove = false;
      cursorEl.style.transform = `translate3d(${pos.currX.toFixed(2)}px, ${pos.currY.toFixed(2)}px, 0)`;
    }
    cursorEl.style.opacity = '1';
    wakeCursor();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorEl.style.opacity = '0';
  });

  document.addEventListener('mouseenter', (e) => {
    pos.targetX = e.clientX;
    pos.targetY = e.clientY;
    if (isFirstMove) {
      pos.currX = e.clientX;
      pos.currY = e.clientY;
      isFirstMove = false;
      cursorEl.style.transform = `translate3d(${pos.currX.toFixed(2)}px, ${pos.currY.toFixed(2)}px, 0)`;
    }
    cursorEl.style.opacity = '1';
    wakeCursor();
  }, { passive: true });

  // Tactile click shockwave
  window.addEventListener('mousedown', (e) => {
    cursorEl.classList.add('clicking');
    createClickWave(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    cursorEl.classList.remove('clicking');
  }, { passive: true });

  // Zero-allocation reusable shockwave pool (silky 120 FPS without DOM garbage collection)
  const wavePool = [];
  let waveIdx = 0;
  for (let i = 0; i < 4; i++) {
    const w = document.createElement('div');
    w.className = 'cursor-click-wave';
    document.body.appendChild(w);
    wavePool.push(w);
  }

  function createClickWave(x, y) {
    const wave = wavePool[waveIdx % wavePool.length];
    waveIdx++;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    wave.classList.remove('wave-active');
    void wave.offsetWidth;
    wave.classList.add('wave-active');
  }

  // Update cursor badge text based on hovered element
  function setCursorMode(action) {
    if (!badge || currentAction === action) return;
    currentAction = action || 'OPEN';

    if (action === 'OPEN') {
      badge.innerHTML = `
        <span class="cursor-letter">O</span>
        <span class="cursor-letter">P</span>
        <span class="cursor-symbol">
          <svg viewBox="0 0 24 24" class="split-disc-icon">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="currentColor"/>
          </svg>
        </span>
        <span class="cursor-letter">N</span>
      `;
    } else if (action === 'PLAY') {
      badge.innerHTML = `
        <span class="cursor-letter">P</span>
        <span class="cursor-letter">L</span>
        <span class="cursor-symbol">
          <svg viewBox="0 0 24 24" class="split-disc-icon">
            <polygon points="8,5 19,12 8,19" fill="currentColor"/>
          </svg>
        </span>
        <span class="cursor-letter">Y</span>
      `;
    } else if (action.includes('3D') || action === 'DRAG 3D' || action === '3D KNOT' || action === '3D MODE') {
      badge.innerHTML = `
        <span class="cursor-letter">3</span>
        <span class="cursor-symbol">
          <svg viewBox="0 0 24 24" class="split-disc-icon">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 3 L12 21 M3 12 L21 12" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </span>
        <span class="cursor-letter">D</span>
      `;
    } else {
      badge.innerHTML = `<span style="letter-spacing:0.25em; font-size:9px;">${action}</span>`;
    }
  }

  // High-performance event delegation using textContent to avoid synchronous reflows
  const interactiveSelector = 'a, button, input, select, textarea, .track-row, .album-card, [data-cursor]';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      cursorEl.classList.add('hovering');
      isHovering = true;
      wakeCursor();
      const cursorAttr = target.getAttribute('data-cursor') || (target.textContent ? target.textContent.trim().slice(0, 7) : '') || 'OPEN';
      setCursorMode(cursorAttr.toUpperCase());

      if (cursorAttr.includes('3D') || target.classList.contains('about-3d-interactive-zone')) {
        cursorEl.classList.add('hovering-3d');
      }
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      if (e.relatedTarget && target.contains(e.relatedTarget)) {
        return;
      }
      cursorEl.classList.remove('hovering');
      cursorEl.classList.remove('hovering-3d');
      isHovering = false;
      wakeCursor();
      setCursorMode('OPEN');
    }
  }, { passive: true });

  // High-Resolution Smooth Physics Loop with Idle Sleeping
  function updateCursor(now) {
    if (document.hidden) {
      lastTime = performance.now();
      isSleeping = true;
      return;
    }
    if (!now) now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Optimal damping factor:
    // lambda = 24.0 idle gives buttery, fluid ~35ms inertia with zero jitter.
    // lambda = 32.0 hovering gives magnetic, responsive lock-on to buttons.
    const lambda = isHovering ? 32.0 : 24.0;
    const factor = 1.0 - Math.exp(-lambda * delta);

    pos.currX += (pos.targetX - pos.currX) * factor;
    pos.currY += (pos.targetY - pos.currY) * factor;

    const diffX = Math.abs(pos.targetX - pos.currX);
    const diffY = Math.abs(pos.targetY - pos.currY);

    if (diffX < 0.06 && diffY < 0.06) {
      pos.currX = pos.targetX;
      pos.currY = pos.targetY;
      cursorEl.style.transform = `translate3d(${pos.currX.toFixed(2)}px, ${pos.currY.toFixed(2)}px, 0)`;
      isSleeping = true;
      return; // Sleep loop when settled at target coordinates
    }

    cursorEl.style.transform = `translate3d(${pos.currX.toFixed(2)}px, ${pos.currY.toFixed(2)}px, 0)`;
    rafId = requestAnimationFrame(updateCursor);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastTime = performance.now();
      wakeCursor();
    }
  }, { passive: true });

  // Initial positioning
  cursorEl.style.transform = `translate3d(${pos.currX.toFixed(2)}px, ${pos.currY.toFixed(2)}px, 0)`;
  rafId = requestAnimationFrame(updateCursor);

})();
