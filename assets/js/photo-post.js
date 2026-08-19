(() => {
  'use strict';

  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* Motion boot --------------------------------------------------------- */
  if (!reduceMotion) {
    body.classList.add('photo-motion-ready');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => body.classList.add('photo-motion-mounted'));
    });
  }

  const revealTargets = Array.from(root.querySelectorAll(
    '.photo-editorial-intro__index, ' +
    '.photo-editorial-intro__copy, ' +
    '.photo-editorial-intro__details, ' +
    '.photo-section-heading, ' +
    '.photo-gallery__item, ' +
    '.photo-feature__stage, ' +
    '.photo-feature__caption, ' +
    '.photo-story-end'
  ));

  revealTargets.forEach((element, index) => {
    element.classList.add('photo-reveal');

    if (element.classList.contains('photo-gallery__item')) {
      const galleryItems = Array.from(element.parentElement?.children || []);
      const galleryIndex = Math.max(0, galleryItems.indexOf(element));
      element.style.setProperty('--photo-reveal-delay', `${(galleryIndex % 3) * 55}ms`);
    } else {
      element.style.setProperty('--photo-reveal-delay', `${Math.min(index % 3, 2) * 45}ms`);
    }
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -7% 0px'
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
  }

  /* Hero slideshow ------------------------------------------------------ */
  const hero = root.querySelector('.photo-hero');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const controls = hero.querySelector('[data-hero-controls]');
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    const counter = hero.querySelector('[data-hero-counter]');

    let index = 0;
    let timer = null;
    let touchStartX = 0;
    let scrollFrame = null;

    const format = (number) => String(number).padStart(2, '0');

    const renderHero = (nextIndex, userInitiated = false) => {
      if (!slides.length) return;

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      if (counter) {
        counter.textContent = `${format(index + 1)} / ${format(slides.length)}`;
      }

      if (userInitiated) restartHero();
    };

    const stopHero = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const restartHero = () => {
      stopHero();
      if (!reduceMotion && slides.length > 1 && !document.hidden) {
        timer = window.setInterval(() => renderHero(index + 1), 5200);
      }
    };

    const updateHeroBoundary = () => {
      scrollFrame = null;
      const boundary = Math.max(120, hero.offsetHeight * 0.72);
      body.classList.toggle('photo-hero-past', window.scrollY > boundary);
    };

    const requestHeroBoundaryUpdate = () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(updateHeroBoundary);
    };

    if (slides.length <= 1 && controls) controls.hidden = true;

    previous?.addEventListener('click', () => renderHero(index - 1, true));
    next?.addEventListener('click', () => renderHero(index + 1, true));

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', restartHero);

    hero.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    hero.addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) {
        renderHero(index + (delta < 0 ? 1 : -1), true);
      }
    }, { passive: true });

    if (!reduceMotion && finePointer) {
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

        hero.style.setProperty('--photo-hero-shift-x', `${normalizedX * 12}px`);
        hero.style.setProperty('--photo-hero-shift-y', `${normalizedY * 8}px`);
      });

      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--photo-hero-shift-x', '0px');
        hero.style.setProperty('--photo-hero-shift-y', '0px');
      });
    }

    window.addEventListener('scroll', requestHeroBoundaryUpdate, { passive: true });
    window.addEventListener('resize', requestHeroBoundaryUpdate, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHero();
      else restartHero();
    });

    renderHero(0);
    updateHeroBoundary();
    restartHero();
  }

  /* Back to top --------------------------------------------------------- */
  root.querySelector('[data-photo-top]')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* Lightbox ------------------------------------------------------------ */
  const items = Array.from(root.querySelectorAll('[data-photo-item]'));
  const lightbox = document.querySelector('[data-photo-lightbox]');
  if (!items.length || !lightbox) return;

  const image = lightbox.querySelector('[data-lightbox-image]');
  const figure = lightbox.querySelector('.photo-lightbox__figure');
  const caption = lightbox.querySelector('[data-lightbox-caption]');
  const meta = lightbox.querySelector('[data-lightbox-meta]');
  const counter = lightbox.querySelector('[data-lightbox-counter]');
  const previous = lightbox.querySelector('[data-lightbox-prev]');
  const next = lightbox.querySelector('[data-lightbox-next]');
  const fullscreen = lightbox.querySelector('[data-lightbox-fullscreen]');
  const closers = Array.from(lightbox.querySelectorAll('[data-lightbox-close]'));

  let current = 0;
  let lastFocus = null;
  let lightboxTouchStartX = 0;

  const preload = (targetIndex) => {
    const item = items[(targetIndex + items.length) % items.length];
    const src = item?.dataset.photoSrc;
    if (!src) return;
    const preloadImage = new Image();
    preloadImage.src = src;
  };

  const replayLightboxImageMotion = () => {
    if (reduceMotion || !figure) return;
    figure.classList.remove('is-switching');
    void figure.offsetWidth;
    figure.classList.add('is-switching');
  };

  const renderLightbox = () => {
    const item = items[current];
    const src = item.dataset.photoSrc || '';

    image.src = src;
    image.alt = item.dataset.photoAlt || '';
    caption.textContent = item.dataset.photoCaption || '';
    meta.textContent = item.dataset.photoMeta || '';
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;

    caption.hidden = !caption.textContent;
    meta.hidden = !meta.textContent;

    replayLightboxImageMotion();
    preload(current - 1);
    preload(current + 1);
  };

  const openLightbox = (itemIndex) => {
    current = itemIndex;
    lastFocus = document.activeElement;
    renderLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('photo-lightbox-open');
    lightbox.querySelector('[data-lightbox-close]')?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('photo-lightbox-open');

    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch?.(() => {});
    }

    image.src = '';
    figure?.classList.remove('is-switching');
    lastFocus?.focus?.();
  };

  const moveLightbox = (delta) => {
    current = (current + delta + items.length) % items.length;
    renderLightbox();
  };

  items.forEach((item, itemIndex) => {
    item.addEventListener('click', () => openLightbox(itemIndex));
  });

  previous?.addEventListener('click', () => moveLightbox(-1));
  next?.addEventListener('click', () => moveLightbox(1));
  closers.forEach((closer) => closer.addEventListener('click', closeLightbox));

  fullscreen?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await lightbox.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch (_) {
      // Fullscreen support is optional; the lightbox remains usable without it.
    }
  });

  lightbox.addEventListener('touchstart', (event) => {
    lightboxTouchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - lightboxTouchStartX;
    if (Math.abs(delta) > 50) moveLightbox(delta < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);

    if (event.key === 'Tab') {
      const focusable = Array.from(lightbox.querySelectorAll('button:not([disabled])'));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();