/**
 * ARIA VELEN — Main UI Controller for Separate Webpages
 * Manages the sound toggle, audio player deck, contact form transmission,
 * scroll reveals, hero ascension and the ambient luxury effects.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Header scroll state is managed seamlessly inside the consolidated rAF scroll loop below

    // -----------------------------------------------------------------------
    // Theatrical Cinematic Pre-Opening Curtain Controller
    // Matches User Reference:
    // 1. One golden line first comes expanding horizontally
    // 2. The artist name 'ARIA VELEN' reveals in gleaming white
    // 3. Sub-status chapter tag emerges
    // 4. Curtain theatrically lifts & dissolves, revealing the sanctuary
    // -----------------------------------------------------------------------
    function initTheatricalOpening() {
      const curtain = document.getElementById('theatrical-curtain');
      if (!curtain) {
        document.body.classList.add('page-revealed');
        return;
      }

      const skipBtn = document.getElementById('theatrical-skip-btn');
      let isDismissed = false;

      function dismissCurtain() {
        if (isDismissed) return;
        isDismissed = true;

        curtain.classList.add('curtain-dismissed');
        document.body.classList.add('page-revealed');

        if (window.triggerVisibleReveals) {
          window.triggerVisibleReveals();
        }

        setTimeout(() => {
          curtain.style.display = 'none';
        }, 740);
      }

      // Check if URL has ?scroll= or deep-link hash to bypass automatically
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('scroll')) {
        dismissCurtain();
        return;
      }

      // 1. Interactive 'ENTER SANCTUARY' button
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissCurtain();
        });
      }

      // 2. Click anywhere on curtain overlay to enter immediately
      curtain.addEventListener('click', () => {
        dismissCurtain();
      });

      // 3. Key press (Enter, Space, Escape) to enter immediately
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          dismissCurtain();
        }
      }, { once: true });

      // 4. Automatic cinematic theatrical reveal after smoothly drawn sequence plays (~1050ms)
      setTimeout(() => {
        dismissCurtain();
      }, 1050);
    }

    initTheatricalOpening();

    // -----------------------------------------------------------------------
    // 1. Audio Engine & Sound Header Button
    // -----------------------------------------------------------------------
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        if (window.AriaAudio) {
          window.AriaAudio.togglePlayback();
        }
      });
    }

    // -----------------------------------------------------------------------
    // 2. Music Player UI Bindings (for music.html & home)
    // -----------------------------------------------------------------------
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-track-btn');
    const nextBtn = document.getElementById('next-track-btn');
    const trackRows = document.querySelectorAll('.track-row');
    const bassSlider = document.getElementById('bass-slider');
    const progressTrack = document.getElementById('player-progress-track');
    const vinylStage = document.getElementById('vinyl-stage');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AriaAudio) {
          window.AriaAudio.togglePlayback();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (window.AriaAudio) window.AriaAudio.prevTrack();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (window.AriaAudio) window.AriaAudio.nextTrack();
      });
    }

    trackRows.forEach((row) => {
      row.addEventListener('click', () => {
        const index = parseInt(row.getAttribute('data-track-index'), 10);
        if (window.AriaAudio) {
          window.AriaAudio.setTrack(index);
          if (!window.AriaAudio.isPlaying) {
            window.AriaAudio.play();
          }
        }
      });
    });

    if (vinylStage) {
      vinylStage.addEventListener('click', () => {
        if (window.AriaAudio) {
          window.AriaAudio.togglePlayback();
        }
      });
    }

    // Homepage Nocturne Play buttons
    const nocturneBtn = document.getElementById('release-listen-now-btn');
    const nocturneCircleBtn = document.getElementById('nocturne-quick-play');
    [nocturneBtn, nocturneCircleBtn].forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (window.AriaAudio) {
            window.AriaAudio.togglePlayback();
          }
        });
      }
    });

    if (bassSlider) {
      bassSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        if (window.AriaAudio && typeof window.AriaAudio.setBassBoost === 'function') {
          window.AriaAudio.setBassBoost(val);
        }
      });
    }

    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        if (!window.AriaAudio) return;
        const rect = progressTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const track = window.AriaAudio.tracks[window.AriaAudio.currentTrackIndex];
        window.AriaAudio.currentTime = Math.floor(track.duration * clickRatio);

        const progressBar = document.getElementById('player-progress-bar');
        const scrubKnob = document.getElementById('player-scrub-knob');
        if (progressBar) progressBar.style.width = `${clickRatio * 100}%`;
        if (scrubKnob) scrubKnob.style.left = `${clickRatio * 100}%`;
      });
    }

    // Non-blocking streaming destinations popover (replaces the old alert())
    const streamBtn = document.getElementById('stream-links-btn');
    if (streamBtn) {
      const destinations = [
        { label: 'Spotify — Hi-Fi Master (Dolby Atmos)', url: 'https://spotify.com' },
        { label: 'Apple Music — Spatial Audio', url: 'https://music.apple.com' },
        { label: 'Tidal — Hi-Res FLAC', url: 'https://tidal.com' },
        { label: 'Bandcamp — 24-bit / 96kHz', url: 'https://bandcamp.com' },
        { label: '180g Gold Vinyl — Enquire', url: 'contact.html' }
      ];

      const closeStreamPopover = () => {
        const open = document.querySelector('.stream-links-popover');
        if (open) open.remove();
        streamBtn.setAttribute('aria-expanded', 'false');
      };

      streamBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.querySelector('.stream-links-popover')) {
          closeStreamPopover();
          return;
        }

        const pop = document.createElement('div');
        pop.className = 'stream-links-popover';
        pop.setAttribute('role', 'menu');
        pop.innerHTML = destinations.map((d) =>
          `<a class="stream-link-item" role="menuitem" href="${d.url}" target="_blank" rel="noopener noreferrer">${d.label}</a>`
        ).join('');
        document.body.appendChild(pop);

        const rect = streamBtn.getBoundingClientRect();
        const width = pop.offsetWidth;
        const height = pop.offsetHeight;
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
        const top = rect.top - height - 10;
        pop.style.left = `${left}px`;
        pop.style.top = `${top >= 12 ? top : rect.bottom + 10}px`;
        streamBtn.setAttribute('aria-expanded', 'true');
      });

      document.addEventListener('click', (e) => {
        const pop = document.querySelector('.stream-links-popover');
        if (pop && !pop.contains(e.target) && !streamBtn.contains(e.target)) closeStreamPopover();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeStreamPopover();
      });
      window.addEventListener('scroll', closeStreamPopover, { passive: true });
    }

    // -----------------------------------------------------------------------
    // 3. Contact Form Transmission (for contact.html)
    // -----------------------------------------------------------------------
    let isSubmittingInquiry = false;
    window.handleFormSubmit = function () {
      if (isSubmittingInquiry) return;
      isSubmittingInquiry = true;

      const form = document.getElementById('booking-form');
      const banner = document.getElementById('form-success-banner');
      const submitBtn = form ? form.querySelector('.submit-btn') : null;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">SENDING INQUIRY...</span>';
        submitBtn.style.opacity = '0.7';
      }

      setTimeout(() => {
        if (banner) banner.style.display = 'block';
        if (submitBtn) {
          submitBtn.innerHTML = '<span class="btn-text">INQUIRY SENT</span><span class="btn-icon">✓</span>';
          submitBtn.style.background = 'linear-gradient(135deg, #d4af37, #f7e7a9)';
          submitBtn.style.borderColor = '#d4af37';
          submitBtn.style.color = '#000000';
          submitBtn.style.opacity = '1';
        }
        if (form) form.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">SEND INQUIRY</span><span class="btn-icon">→</span>';
            submitBtn.removeAttribute('style');
          }
          isSubmittingInquiry = false;
        }, 5000);
      }, 900);
    };

    // -----------------------------------------------------------------------
    // 4. Universal Editorial Scroll Reveal System: Content Fades As It Comes Up
    // -----------------------------------------------------------------------
    function initScrollFadeReveal() {
      const candidateSelectors = [
        // Structural headers & blocks
        '.section > *',
        '.section-tracker-header',
        '.section-eyebrow',
        '.section-heading',
        '.section-left-eyebrow',
        '.section-divider',
        // Homepage
        '.statement-headline',
        '.statement-paragraph',
        '.statement-photo-wrap',
        '.statement-accent-line',
        '.gallery-item-wrap',
        '.editorial-gallery-section',
        '.gallery-caption',
        '.editorial-stat-card',
        '.featured-tour-banner',
        // About Page
        '.bio-editorial-lead',
        '.bio-editorial-body',
        '.bio-editorial-body p',
        '.manifesto-quote-wrap',
        '.manifesto-quote',
        '.timeline-item',
        '.chronology-node',
        '.press-reviews-grid',
        '.review-card',
        '.discover-card',
        '.sound-philosophy-card',
        // Music Page
        '.orbital-rings-visual',
        '.vinyl-status-banner',
        '.track-row',
        '.disco-grid',
        '.album-card',
        '.album-artwork-wrap',
        '.streaming-platforms-bar',
        '.audio-feature-showcase',
        // Tour Page
        '.tour-header-block',
        '.tour-subtext',
        '.past-moment-item',
        '.past-moments-editorial-gallery',
        '.tour-date-item',
        '.tour-dates-list',
        '.tour-city-card',
        '.vip-experience-card',
        '.bookings-directory-grid',
        // Contact Page
        '.contact-wrapper',
        '.contact-card',
        '.contact-lead',
        '.contact-form-card',
        '.contact-inquiry-type',
        '.contact-field',
        '.management-card',
        // 3D Lab / Animation Page
        '.studio-header-wrap',
        '.studio-control-panel',
        // Global Footer
        '.site-footer',
        '.footer-column',
        '.footer-col',
        '.footer-bottom-bar'
      ];

      const elements = document.querySelectorAll(candidateSelectors.join(', '));
      
      elements.forEach((el) => {
        // Exclude every hero centerpiece (they are animated with scroll-linked rAF)
        if (el.closest('.home-hero-a-section') || 
            el.closest('.contact-hero-centerpiece') || 
            el.closest('.site-header') || 
            el.closest('.about-hero-fullscreen-section') || 
            el.closest('.biography-hero-split')) return;
        
        if (!el.classList.contains('scroll-fade-up') && !el.classList.contains('scroll-fade-in')) {
          el.classList.add('scroll-fade-up');
        }

        // Add stagger delays to sibling cards inside grids or lists
        const parent = el.parentElement;
        if (parent && (parent.classList.contains('disco-grid') || 
                       parent.classList.contains('track-rows') || 
                       parent.classList.contains('gallery-cards-grid') || 
                       parent.classList.contains('past-moments-editorial-gallery') || 
                       parent.classList.contains('bookings-directory-grid') ||
                       parent.classList.contains('press-reviews-grid') ||
                       parent.classList.contains('timeline-track') ||
                       parent.classList.contains('editorial-gallery-grid'))) {
          const siblings = Array.from(parent.children);
          const siblingIndex = siblings.indexOf(el);
          if (siblingIndex > 0) {
            el.classList.add(`stagger-${Math.min(siblingIndex % 6 + 1, 6)}`);
          }
        }
      });

      // IntersectionObserver: reveals content as soon as it enters viewport
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.03,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('.scroll-fade-up, .scroll-fade-in').forEach((el) => {
        observer.observe(el);
      });

      // Global check function to reveal any elements currently inside viewport
      function checkVisibleReveals() {
        const vh = window.innerHeight || 800;
        document.querySelectorAll('.scroll-fade-up:not(.is-revealed), .scroll-fade-in:not(.is-revealed)').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add('is-revealed');
          }
        });
      }

      window.triggerVisibleReveals = checkVisibleReveals;
      requestAnimationFrame(checkVisibleReveals);
      setTimeout(checkVisibleReveals, 200);
      setTimeout(checkVisibleReveals, 700);

      // 120 FPS Optimization: IntersectionObserver handles all scrolling reveals
      // asynchronously off the main thread with zero layout reflow.
      // We only run checkVisibleReveals on window resize (debounced).
      let revealResizeTimer = null;
      window.addEventListener('resize', () => {
        if (revealResizeTimer) clearTimeout(revealResizeTimer);
        revealResizeTimer = setTimeout(checkVisibleReveals, 120);
      }, { passive: true });
    }

    initScrollFadeReveal();

    // -----------------------------------------------------------------------
    // Seamless Whole-Website Page-to-Page Fading Transitions
    // Every internal navigation smoothly dissolves the screen to deep obsidian
    // before the destination page blooms into view.
    // -----------------------------------------------------------------------
    function initPageTransitions() {
      window.addEventListener('pageshow', () => {
        document.body.classList.remove('page-is-leaving');
      });

      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip anchors, mailto, tel, JS, external targets, or modifier clicks
        if (href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') || 
            href.startsWith('javascript:') || 
            link.target === '_blank' || 
            e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return;
        }

        // Only transition internal relative HTML pages or root
        const isInternal = href.endsWith('.html') || href === '/' || href.startsWith('index.html') || href.startsWith('./');
        if (isInternal) {
          const currentPath = window.location.pathname.split('/').pop() || 'index.html';
          const targetPath = href.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
          if (currentPath === targetPath && href.includes('#')) {
            return;
          }

          e.preventDefault();
          document.body.classList.add('page-is-leaving');

          setTimeout(() => {
            window.location.href = href;
          }, 240);
        }
      });
    }

    initPageTransitions();

    // -----------------------------------------------------------------------
    // 5. Homepage Hero Ascension Synchronization (High-Performance rAF Loop)
    // -----------------------------------------------------------------------
    function initHeroAscendScroll() {
      const siteHeader = document.getElementById('site-header');
      const heroContent = document.querySelector('.hero-a-content');
      const heroBackdrop = document.getElementById('hero-singer-backdrop');
      const contactHeroInner = document.querySelector('.contact-centerpiece-inner');
      const aboutHeroWrap = document.querySelector('.about-hero-title-wrap');

      if (!siteHeader && !heroContent && !heroBackdrop && !contactHeroInner && !aboutHeroWrap) return;

      let isTicking = false;
      let isFullyAscended = false;
      let cachedHeroHeight = window.innerHeight || 800;

      window.addEventListener('resize', () => {
        cachedHeroHeight = window.innerHeight || 800;
      }, { passive: true });

      function updateAscend() {
        const scrollY = window.scrollY || 0;
        const heroHeight = cachedHeroHeight;

        if (siteHeader) {
          if (scrollY > 40) {
            siteHeader.classList.add('scrolled');
          } else {
            siteHeader.classList.remove('scrolled');
          }
        }

        if (scrollY > heroHeight * 1.3) {
          if (!isFullyAscended) {
            if (heroContent) { heroContent.style.opacity = '0'; heroContent.style.pointerEvents = 'none'; }
            if (aboutHeroWrap) { aboutHeroWrap.style.opacity = '0'; aboutHeroWrap.style.pointerEvents = 'none'; }
            if (contactHeroInner) { contactHeroInner.style.opacity = '0'; contactHeroInner.style.pointerEvents = 'none'; }
            if (heroBackdrop) { heroBackdrop.style.opacity = '0'; }
            isFullyAscended = true;
          }
          isTicking = false;
          return;
        }

        isFullyAscended = false;
        const p = Math.min(1.0, Math.max(0.0, scrollY / (heroHeight * 0.72)));

        if (heroContent) {
          const ascentPx = Math.pow(p, 1.15) * 160;
          const fadeAlpha = Math.max(0.0, 1.0 - Math.pow(p, 1.3));
          heroContent.style.transform = `translate3d(-50%, calc(-50% - ${ascentPx.toFixed(1)}px), 0)`;
          heroContent.style.opacity = `${fadeAlpha.toFixed(3)}`;
          heroContent.style.pointerEvents = fadeAlpha < 0.1 ? 'none' : 'auto';
        }

        if (aboutHeroWrap) {
          const ascentPx = Math.pow(p, 1.15) * 140;
          const fadeAlpha = Math.max(0.0, 1.0 - Math.pow(p, 1.3));
          aboutHeroWrap.style.transform = `translate3d(0, -${ascentPx.toFixed(1)}px, 0)`;
          aboutHeroWrap.style.opacity = `${fadeAlpha.toFixed(3)}`;
          aboutHeroWrap.style.pointerEvents = fadeAlpha < 0.1 ? 'none' : 'auto';
        }

        if (contactHeroInner) {
          const ascentPx = Math.pow(p, 1.15) * 160;
          const fadeAlpha = Math.max(0.0, 1.0 - Math.pow(p, 1.3));
          contactHeroInner.style.transform = `translate3d(-50%, calc(-50% - ${ascentPx.toFixed(1)}px), 0)`;
          contactHeroInner.style.opacity = `${fadeAlpha.toFixed(3)}`;
          contactHeroInner.style.pointerEvents = fadeAlpha < 0.1 ? 'none' : 'auto';
        }

        if (heroBackdrop) {
          const bgFade = Math.max(0.0, 1.0 - Math.pow(p, 1.25));
          heroBackdrop.style.opacity = `${(bgFade * 0.65).toFixed(3)}`;
          heroBackdrop.style.transform = `translate3d(0, -${(p * 50).toFixed(1)}px, 0)`;
        }

        isTicking = false;
      }

      // Immediate invocation to guarantee exact centered placement on initial load
      updateAscend();

      window.addEventListener('scroll', () => {
        if (!isTicking) {
          isTicking = true;
          requestAnimationFrame(updateAscend);
        }
      }, { passive: true });
    }

    initHeroAscendScroll();

    // Support ?scroll= URL parameter for automated verification
    const urlParams = new URLSearchParams(window.location.search);
    const scrollParam = urlParams.get('scroll');
    if (scrollParam) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      const targetY = parseInt(scrollParam, 10);
      window.scrollTo({ top: targetY, behavior: 'instant' });
      setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }, 80);
    }

    // -----------------------------------------------------------------------
    // Universal Luxury Smoothness & Ambient Effects Engine
    // -----------------------------------------------------------------------

    // 1. Interactive 3D Magnetic Card Perspective Tilt & Dynamic Specular Glare (120 FPS Optimized)
    function initMagneticCardTilt() {
      if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

      const cardSelector = '.album-card, .contact-card, .contact-artist-card, .biography-portrait-frame, .statement-photo-wrap, .timeline-photo-card';
      const cards = document.querySelectorAll(cardSelector);

      cards.forEach((card) => {
        card.classList.add('has-magnetic-tilt');

        if (!card.querySelector('.card-specular-glare')) {
          const glare = document.createElement('div');
          glare.className = 'card-specular-glare';
          card.appendChild(glare);
        }

        let rafId = null;
        let cardRect = null;

        const onMouseEnter = () => {
          cardRect = card.getBoundingClientRect();
        };

        const onMouseMove = (e) => {
          if (!cardRect) cardRect = card.getBoundingClientRect();
          const x = e.clientX - cardRect.left;
          const y = e.clientY - cardRect.top;

          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

          const normX = (x / cardRect.width) * 2 - 1;
          const normY = (y / cardRect.height) * 2 - 1;

          const tiltX = -normY * 12;
          const tiltY = normX * 12;

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) translate3d(0, 0, 12px) scale3d(1.025, 1.025, 1.025)`;
          });
        };

        const onMouseLeave = () => {
          cardRect = null;
          if (rafId) cancelAnimationFrame(rafId);
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)';
        };

        card.addEventListener('mouseenter', onMouseEnter, { passive: true });
        card.addEventListener('mousemove', onMouseMove, { passive: true });
        card.addEventListener('mouseleave', onMouseLeave, { passive: true });
      });
    }

    // 2. Ambient Drifting Aura Glow Orbs
    function initAmbientAuraOrbs() {
      if (!document.querySelector('.glow-random-1')) {
        const orb1 = document.createElement('div');
        orb1.className = 'ambient-glow glow-random-1';
        orb1.setAttribute('aria-hidden', 'true');
        document.body.appendChild(orb1);
      }
      if (!document.querySelector('.glow-random-2')) {
        const orb2 = document.createElement('div');
        orb2.className = 'ambient-glow glow-random-2';
        orb2.setAttribute('aria-hidden', 'true');
        document.body.appendChild(orb2);
      }
    }

    // Activate All Universal Smoothness & Luxury Systems
    initMagneticCardTilt();
    initAmbientAuraOrbs();

  });

})();
