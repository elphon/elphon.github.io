(() => {
  'use strict';

  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero slideshow ------------------------------------------------------- */
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
        timer = window.setInterval(() => renderHero(index + 1), 7000);
      }
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

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHero();
      else restartHero();
    });

    renderHero(0);
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
