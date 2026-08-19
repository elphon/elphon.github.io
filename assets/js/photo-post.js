(() => {
  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero slider
  const hero = root.querySelector('.photo-hero');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    const dotsHost = hero.querySelector('[data-hero-dots]');
    let index = 0;
    let timer = null;
    let touchStartX = 0;

    const setSlide = (nextIndex, userInitiated = false) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (dotsHost) {
        [...dotsHost.children].forEach((dot, i) => {
          dot.classList.toggle('is-active', i === index);
          dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }
      if (userInitiated) restartTimer();
    };

    const restartTimer = () => {
      if (timer) window.clearInterval(timer);
      if (!reduceMotion && slides.length > 1) {
        timer = window.setInterval(() => setSlide(index + 1), 6000);
      }
    };

    if (dotsHost && slides.length > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to photograph ${i + 1}`);
        dot.addEventListener('click', () => setSlide(i, true));
        dotsHost.appendChild(dot);
      });
    }

    prev?.addEventListener('click', () => setSlide(index - 1, true));
    next?.addEventListener('click', () => setSlide(index + 1, true));
    hero.addEventListener('mouseenter', () => timer && window.clearInterval(timer));
    hero.addEventListener('mouseleave', restartTimer);
    hero.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) setSlide(index + (delta < 0 ? 1 : -1), true);
    }, { passive: true });

    setSlide(0);
    restartTimer();
  }

  // Lightbox
  const items = [...root.querySelectorAll('[data-photo-item]')];
  const lightbox = document.querySelector('[data-photo-lightbox]');
  if (!items.length || !lightbox) return;

  const image = lightbox.querySelector('[data-lightbox-image]');
  const caption = lightbox.querySelector('[data-lightbox-caption]');
  const meta = lightbox.querySelector('[data-lightbox-meta]');
  const counter = lightbox.querySelector('[data-lightbox-counter]');
  const prev = lightbox.querySelector('[data-lightbox-prev]');
  const next = lightbox.querySelector('[data-lightbox-next]');
  const fullscreen = lightbox.querySelector('[data-lightbox-fullscreen]');
  const closers = [...lightbox.querySelectorAll('[data-lightbox-close]')];
  let current = 0;
  let lastFocus = null;
  let touchStartX = 0;

  const render = () => {
    const item = items[current];
    image.src = item.dataset.photoSrc || '';
    image.alt = item.dataset.photoAlt || '';
    caption.textContent = item.dataset.photoCaption || '';
    meta.textContent = item.dataset.photoMeta || '';
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    caption.hidden = !caption.textContent;
    meta.hidden = !meta.textContent;
  };

  const open = (index) => {
    current = index;
    lastFocus = document.activeElement;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('photo-lightbox-open');
    lightbox.querySelector('[data-lightbox-close]')?.focus();
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('photo-lightbox-open');
    if (document.fullscreenElement) document.exitFullscreen?.();
    image.src = '';
    lastFocus?.focus?.();
  };

  const move = (delta) => {
    current = (current + delta + items.length) % items.length;
    render();
  };

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  closers.forEach((button) => button.addEventListener('click', close));

  fullscreen?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await lightbox.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (_) {
      // Fullscreen can be blocked by browser or platform policy; lightbox still works.
    }
  });

  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'Tab') {
      const focusables = [...lightbox.querySelectorAll('button:not([disabled])')];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
