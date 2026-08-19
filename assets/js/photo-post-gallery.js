(() => {
  'use strict';

  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const gallery = root.querySelector('.photo-gallery--editorial');
  const hud = root.querySelector('[data-photo-hud]');
  if (!gallery || !hud) return;

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
