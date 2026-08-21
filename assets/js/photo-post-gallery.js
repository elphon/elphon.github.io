(() => {
  'use strict';

  const root = document.querySelector('[data-photo-post]');
  if (!root) return;

  const gallery = root.querySelector('.photo-gallery--editorial');
  if (!gallery) return;

  const getPrimaryImage = (item) => {
    if (!item) return null;
    if (item.dataset.photoRole === 'wide') {
      return item.querySelector('.photo-gallery__wide-portrait img');
    }
    return Array.from(item.children).find((child) => child.tagName === 'IMG') || null;
  };

  const waitForDimensions = (image, eager = false) => new Promise((resolve) => {
    if (!image) {
      resolve(false);
      return;
    }

    if (eager) image.loading = 'eager';

    if (image.complete && image.naturalWidth && image.naturalHeight) {
      resolve(true);
      return;
    }

    const done = () => resolve(Boolean(image.naturalWidth && image.naturalHeight));
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
  });

  const isLandscape = (image) => Boolean(
    image && image.naturalWidth && image.naturalHeight && image.naturalWidth > image.naturalHeight
  );

  const createPayloadImage = (item, backdrop = false) => {
    const image = document.createElement('img');
    image.src = item.dataset.photoDisplaySrc || item.dataset.photoSrc || '';
    image.loading = 'lazy';
    image.decoding = 'async';

    if (backdrop) {
      image.alt = '';
      return image;
    }

    image.alt = item.dataset.photoAlt || '';
    if (item.dataset.photoSrcset) image.srcset = item.dataset.photoSrcset;
    if (item.dataset.photoSizes) image.sizes = item.dataset.photoSizes;
    return image;
  };

  const updateOverlay = (item) => {
    const overlay = item.querySelector('.photo-gallery__overlay');
    if (!overlay) return;

    overlay.textContent = '';

    if (item.dataset.photoCaption) {
      const caption = document.createElement('strong');
      caption.textContent = item.dataset.photoCaption;
      overlay.appendChild(caption);
    }

    if (item.dataset.photoMeta) {
      const meta = document.createElement('small');
      meta.textContent = item.dataset.photoMeta;
      overlay.appendChild(meta);
    }
  };

  const renderPayload = (item) => {
    if (!item) return;

    Array.from(item.children).forEach((child) => {
      if (child.tagName === 'IMG' || child.classList.contains('photo-gallery__wide-media')) {
        child.remove();
      }
    });

    const overlay = item.querySelector('.photo-gallery__overlay');

    if (item.dataset.photoRole === 'wide') {
      const media = document.createElement('span');
      media.className = 'photo-gallery__wide-media';

      const backdrop = document.createElement('span');
      backdrop.className = 'photo-gallery__wide-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.appendChild(createPayloadImage(item, true));

      const foreground = document.createElement('span');
      foreground.className = 'photo-gallery__wide-portrait';
      foreground.appendChild(createPayloadImage(item));

      media.append(backdrop, foreground);
      item.insertBefore(media, overlay || null);
    } else {
      item.insertBefore(createPayloadImage(item), overlay || null);
    }

    item.classList.remove('is-wide-landscape', 'is-wide-portrait');
    item.removeAttribute('data-photo-orientation');
    item.style.removeProperty('--photo-wide-ratio');
    updateOverlay(item);
  };

  const payloadKeys = [
    'photoSrc',
    'photoDisplaySrc',
    'photoSrcset',
    'photoAlt',
    'photoCaption',
    'photoMeta'
  ];

  const swapPhotoPayload = (first, second) => {
    payloadKeys.forEach((key) => {
      const temporary = first.dataset[key] || '';
      first.dataset[key] = second.dataset[key] || '';
      second.dataset[key] = temporary;
    });

    renderPayload(first);
    renderPayload(second);
  };

  /* Wide frames ---------------------------------------------------------
   * A wide slot automatically adapts its presentation to the source ratio.
   * Landscape sources render directly; portrait sources use the blurred stage.
   */
  const resolveWideOrientation = (item) => {
    const image = getPrimaryImage(item);
    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    const landscape = isLandscape(image);
    item.classList.toggle('is-wide-landscape', landscape);
    item.classList.toggle('is-wide-portrait', !landscape);
    item.dataset.photoOrientation = landscape ? 'landscape' : 'portrait';

    if (landscape) {
      item.style.setProperty('--photo-wide-ratio', `${image.naturalWidth} / ${image.naturalHeight}`);
    } else {
      item.style.removeProperty('--photo-wide-ratio');
    }
  };

  const watchWideOrientation = (item) => {
    const image = getPrimaryImage(item);
    if (!image) return;

    if (image.complete && image.naturalWidth) {
      resolveWideOrientation(item);
    } else {
      image.addEventListener('load', () => resolveWideOrientation(item), { once: true });
    }
  };

  Array.from(gallery.querySelectorAll('[data-photo-role="wide"]')).forEach(watchWideOrientation);

  /* Optional four-photo auto ordering ----------------------------------
   * `order: auto` is intentionally opt-in. The authored order is otherwise
   * preserved exactly. For lead-two-wide / wide-two-lead, if the current wide
   * slot is portrait and another source is landscape, swap only those photo
   * payloads so the grid geometry and numbering remain stable.
   */
  const autoCompositions = Array.from(gallery.querySelectorAll('[data-photo-order="auto"]'))
    .filter((composition) => ['lead-two-wide', 'wide-two-lead'].includes(composition.dataset.photoGrid));

  const arrangeAutoWide = async (composition) => {
    if (!composition || composition.dataset.photoAutoOrdered) return;
    composition.dataset.photoAutoOrdered = 'pending';

    const items = Array.from(composition.querySelectorAll('.photo-composition__grid > [data-photo-item]'));
    if (items.length !== 4) {
      composition.dataset.photoAutoOrdered = 'skipped';
      return;
    }

    const wideItem = items.find((item) => item.dataset.photoRole === 'wide');
    if (!wideItem) {
      composition.dataset.photoAutoOrdered = 'skipped';
      return;
    }

    await Promise.all(items.map((item) => waitForDimensions(getPrimaryImage(item), true)));

    if (isLandscape(getPrimaryImage(wideItem))) {
      composition.dataset.photoAutoOrdered = 'kept';
      return;
    }

    const landscapeItem = items.find(
      (item) => item !== wideItem && isLandscape(getPrimaryImage(item))
    );

    if (!landscapeItem) {
      composition.dataset.photoAutoOrdered = 'no-landscape';
      return;
    }

    swapPhotoPayload(wideItem, landscapeItem);
    composition.dataset.photoAutoOrdered = 'swapped';
    watchWideOrientation(wideItem);
  };

  if (autoCompositions.length) {
    if ('IntersectionObserver' in window) {
      const autoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          arrangeAutoWide(entry.target);
        });
      }, {
        threshold: 0,
        rootMargin: '600px 0px 600px 0px'
      });

      autoCompositions.forEach((composition) => autoObserver.observe(composition));
    } else {
      autoCompositions.forEach(arrangeAutoWide);
    }
  }

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
