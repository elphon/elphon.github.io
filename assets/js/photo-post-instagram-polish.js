(() => {
  'use strict';

  const hero = document.querySelector('body.photo-theme-instagram .photo-hero');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  if (!slides.length) return;

  const galleryItems = Array.from(document.querySelectorAll('[data-photo-item][data-photo-meta]'));
  const heroTime = hero.querySelector('.photo-hero__meta time');

  const fileNameFromUrl = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return decodeURIComponent(url.pathname.split('/').pop() || '');
    } catch (_) {
      return decodeURIComponent(String(value).split('?')[0].split('/').pop() || '');
    }
  };

  const galleryByFile = new Map();
  galleryItems.forEach((item) => {
    const file = fileNameFromUrl(item.dataset.photoSrc || item.dataset.photoDisplaySrc || '');
    if (file) galleryByFile.set(file, item);
  });

  const exif = document.createElement('div');
  exif.className = 'photo-hero__exif';
  exif.setAttribute('aria-label', 'Camera settings');

  const fields = [
    ['APERTURE', 'aperture'],
    ['SHUTTER', 'shutter'],
    ['ISO', 'iso'],
    ['LENS', 'lens']
  ];

  const valueNodes = {};
  fields.forEach(([label, key]) => {
    const item = document.createElement('div');
    item.className = 'photo-hero__exif-item';

    const name = document.createElement('span');
    name.textContent = label;

    const value = document.createElement('strong');
    value.textContent = '—';

    item.append(name, value);
    exif.appendChild(item);
    valueNodes[key] = value;
  });

  const parseMeta = (meta) => {
    const parts = String(meta || '').split('·').map((part) => part.trim()).filter(Boolean);
    const aperture = parts.find((part) => /^f\/[\d.]+$/i.test(part)) || '—';
    const iso = parts.find((part) => /^ISO\s+/i.test(part)) || '—';
    const lens = parts.find((part) => /\bmm\b/i.test(part) && !/equivalent|eq\./i.test(part)) || '—';
    const shutter = parts.find((part) => {
      if (/^\d{4}\.\d{2}\.\d{2}/.test(part)) return false;
      return /^(?:\d+\/\d+|\d+(?:\.\d+)?)\s*s$/i.test(part);
    }) || '—';
    const captured = parts.find((part) => /^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}/.test(part)) || '';

    return { aperture, shutter, iso, lens, captured };
  };

  const render = () => {
    const active = slides.find((slide) => slide.classList.contains('is-active')) || slides[0];
    const portrait = active.querySelector('.photo-hero__portrait');
    const wrap = active.querySelector('.photo-hero__portrait-wrap');
    if (!portrait || !wrap) return;

    const file = fileNameFromUrl(portrait.currentSrc || portrait.src);
    const sourceItem = galleryByFile.get(file);
    const parsed = parseMeta(sourceItem?.dataset.photoMeta || '');

    valueNodes.aperture.textContent = parsed.aperture;
    valueNodes.shutter.textContent = parsed.shutter;
    valueNodes.iso.textContent = parsed.iso.replace(/^ISO\s+/i, '');
    valueNodes.lens.textContent = parsed.lens;

    if (exif.parentElement !== wrap) wrap.appendChild(exif);

    if (heroTime && parsed.captured) {
      const [date, time = ''] = parsed.captured.split(/\s+/);
      heroTime.textContent = `${date} · ${time.slice(0, 5)}`;
      heroTime.setAttribute('datetime', `${date.replace(/\./g, '-')}T${time || '00:00:00'}+09:00`);
    }
  };

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === 'attributes')) render();
  });

  slides.forEach((slide) => observer.observe(slide, {
    attributes: true,
    attributeFilter: ['class']
  }));

  render();
})();
