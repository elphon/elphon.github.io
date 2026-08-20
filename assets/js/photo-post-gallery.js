(() => {
  'use strict';

  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const gallery = root.querySelector('.photo-gallery--editorial');
  if (!gallery) return;

  /* Wide frames ---------------------------------------------------------
   * Keep authoring simple: a `wide` slot does not need orientation metadata.
   * Once the foreground image loads, use its intrinsic dimensions to choose
   * between a direct landscape frame and a blurred portrait treatment.
   */
  const wideItems = Array.from(gallery.querySelectorAll('[data-photo-role="wide"]'));

  const resolveWideOrientation = (item) => {
    const image = item.querySelector('.photo-gallery__wide-portrait img');
    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    const landscape = image.naturalWidth > image.naturalHeight;
    item.classList.toggle('is-wide-landscape', landscape);
    item.classList.toggle('is-wide-portrait', !landscape);
    item.dataset.photoOrientation = landscape ? 'landscape' : 'portrait';

    if (landscape) {
      item.style.setProperty('--photo-wide-ratio', `${image.naturalWidth} / ${image.naturalHeight}`);
    } else {
      item.style.removeProperty('--photo-wide-ratio');
    }
  };

  wideItems.forEach((item) => {
    const image = item.querySelector('.photo-gallery__wide-portrait img');
    if (!image) return;

    if (image.complete && image.naturalWidth) {
      resolveWideOrientation(item);
    } else {
      image.addEventListener('load', () => resolveWideOrientation(item), { once: true });
    }
  });

  /* Archive progress ---------------------------------------------------- */
  const hud = root.querySelector('[data-photo-hud]');
  if (!hud) return;

  const items = Array.from(gallery.querySelectorAll('[data-photo-item]'));
  const current = hud.querySelector('[data-photo-current]');
  const progress = hud.querySelector('[data-photo-progress]');
  if (!items.length || !current || !progress) return;

  const format = (number) => String(number).padStart(2, '0');

  const update = (number) => {
    const safeNumber = Math.max(1, Math.min(number, items.length));
    current.textContent = format(safeNumber);
    progress.style.transform = `scaleX(${safeNumber / items.length})`;
  };

  update(1);

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => {
        const aDistance = Math.abs(a.boundingClientRect.top - window.innerHeight * 0.42);
        const bDistance = Math.abs(b.boundingClientRect.top - window.innerHeight * 0.42);
        return aDistance - bDistance;
      });

    if (!visible.length) return;
    const number = Number(visible[0].target.dataset.photoNumber || 1);
    update(number);
  }, {
    threshold: 0.01,
    rootMargin: '-32% 0px -52% 0px'
  });

  items.forEach((item) => observer.observe(item));
})();