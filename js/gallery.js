/**
 * Organized bento gallery — tiled big/small blocks (reference-style layouts).
 */

export const BATCH_SIZE = 24;
export const HOME_PREVIEW_COUNT = 10;

/** 4-column desktop: big square + cluster, mirrored (10 tiles per block) */
export const PATTERN_DESKTOP = [
  { cs: 2, rs: 2, type: 'square' },
  { cs: 1, rs: 2, type: 'portrait' },
  { cs: 1, rs: 1, type: 'square' },
  { cs: 2, rs: 1, type: 'landscape' },
  { cs: 2, rs: 1, type: 'landscape' },
  { cs: 1, rs: 2, type: 'portrait' },
  { cs: 1, rs: 1, type: 'square' },
  { cs: 2, rs: 2, type: 'square' },
  { cs: 2, rs: 1, type: 'landscape' },
  { cs: 2, rs: 1, type: 'landscape' }
];

/** 3-column tablet: big left + 2 stacked, then mirrored (6 tiles) */
export const PATTERN_TABLET = [
  { cs: 2, rs: 2, type: 'square' },
  { cs: 1, rs: 1, type: 'portrait' },
  { cs: 1, rs: 1, type: 'landscape' },
  { cs: 1, rs: 1, type: 'landscape' },
  { cs: 1, rs: 1, type: 'portrait' },
  { cs: 2, rs: 2, type: 'square' }
];

/** 2-column mobile: alternating wide / tall / square pairs */
export const PATTERN_MOBILE = [
  { cs: 2, rs: 1, type: 'landscape' },
  { cs: 1, rs: 1, type: 'square' },
  { cs: 1, rs: 1, type: 'square' },
  { cs: 1, rs: 2, type: 'portrait' },
  { cs: 1, rs: 1, type: 'landscape' },
  { cs: 2, rs: 1, type: 'landscape' }
];

export function getPatternSlot(index) {
  return PATTERN_DESKTOP[index % PATTERN_DESKTOP.length];
}

export function getSlotType(index) {
  return getPatternSlot(index).type;
}

/** Assign photos to slot types — wide→landscape/portrait, tall→portrait, mid→square */
export function mixGalleryForBento(items) {
  if (!items.length) return [];

  const wide = items.filter(i => (i.aspectRatio || 1) > 1.2);
  const tall = items.filter(i => (i.aspectRatio || 1) < 0.85);
  const mid = items.filter(i => {
    const ar = i.aspectRatio || 1;
    return ar >= 0.85 && ar <= 1.2;
  });

  const pools = { wide: [...wide], tall: [...tall], mid: [...mid] };
  const used = new Set();
  const result = [];

  function pull(...order) {
    for (const key of order) {
      while (pools[key].length) {
        const item = pools[key].shift();
        if (!used.has(item.src)) {
          used.add(item.src);
          return item;
        }
      }
    }
    return null;
  }

  function pullForType(type) {
    if (type === 'landscape') return pull('wide', 'mid', 'tall');
    if (type === 'portrait') return pull('tall', 'wide', 'mid');
    return pull('mid', 'tall', 'wide');
  }

  for (let i = 0; i < items.length; i++) {
    const type = getPatternSlot(i).type;
    const item = pullForType(type);
    if (item) result.push(item);
  }

  for (const item of items) {
    if (!used.has(item.src)) result.push(item);
  }

  return result;
}

export async function fetchGallery() {
  try {
    const res = await fetch('gallery.json');
    if (res.ok) return await res.json();
  } catch { /* empty */ }
  return [];
}

export function createBentoItem(item, globalIndex, { eager = false } = {}) {
  const slotIndex = globalIndex % PATTERN_DESKTOP.length;
  const slot = getPatternSlot(globalIndex);

  const el = document.createElement('div');
  el.className = `bento-item bento-slot-${slotIndex} bento-crop-${slot.type}`;
  el.role = 'listitem';
  el.dataset.index = String(globalIndex);
  el.dataset.slot = String(slotIndex);

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = `3D print prototype ${globalIndex + 1}`;
  img.loading = eager ? 'eager' : 'lazy';
  img.decoding = 'async';

  el.appendChild(img);
  return el;
}

export function renderBentoItems(grid, items, startGlobalIndex, onItemClick) {
  items.forEach((item, i) => {
    const globalIndex = startGlobalIndex + i;
    const el = createBentoItem(item, globalIndex, { eager: globalIndex < 12 });
    el.addEventListener('click', () => onItemClick(globalIndex));
    grid.appendChild(el);
  });
}

export function initLightbox(gallery) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');
  if (!lb || !img) return { open: () => {} };

  let index = 0;

  function open(i) {
    if (!gallery.length) return;
    index = i;
    img.src = gallery[index].src;
    img.alt = `3D print prototype ${index + 1}`;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    index = (index + dir + gallery.length) % gallery.length;
    img.src = gallery[index].src;
    img.alt = `3D print prototype ${index + 1}`;
  }

  closeBtn?.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  prev?.addEventListener('click', () => navigate(-1));
  next?.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  return { open, close: closeLightbox, navigate };
}

export function initBentoGallery(opts) {
  const {
    grid,
    empty,
    statusEl,
    loadMoreBtn,
    scrollWrap,
    gallery: rawGallery,
    limit = null,
    onReady
  } = opts;

  const gallery = mixGalleryForBento(rawGallery);

  if (!grid || !gallery.length) {
    if (grid) grid.hidden = true;
    if (empty) empty.hidden = false;
    return { lightbox: initLightbox([]) };
  }

  if (empty) empty.hidden = true;
  grid.hidden = false;
  grid.innerHTML = '';

  const lightboxSource = limit != null ? gallery.slice(0, Math.min(limit, gallery.length)) : gallery;
  const lightbox = initLightbox(lightboxSource);
  let shown = 0;

  function updateStatus() {
    if (!statusEl) return;
    if (limit != null) {
      statusEl.textContent = `${gallery.length} prototypes from our workshop.`;
      return;
    }
    statusEl.textContent = `Showing ${shown} of ${gallery.length} projects`;
  }

  function appendBatch(count) {
    const slice = gallery.slice(shown, shown + count);
    if (!slice.length) return;
    renderBentoItems(grid, slice, shown, i => lightbox.open(i));
    shown += slice.length;
    updateStatus();

    if (loadMoreBtn) {
      const remaining = gallery.length - shown;
      if (remaining <= 0) {
        loadMoreBtn.hidden = true;
      } else {
        loadMoreBtn.hidden = false;
        loadMoreBtn.textContent = `Load more (${Math.min(BATCH_SIZE, remaining)} of ${remaining} remaining)`;
      }
    }

    grid.querySelectorAll('.bento-item:not(.visible)').forEach(el => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  }

  if (limit != null) {
    appendBatch(Math.min(limit, gallery.length));
  } else {
    appendBatch(Math.min(BATCH_SIZE, gallery.length));
    loadMoreBtn?.addEventListener('click', () => {
      appendBatch(BATCH_SIZE);
      if (scrollWrap && shown >= gallery.length) {
        scrollWrap.classList.add('is-expanded');
      }
    });
  }

  updateStatus();
  onReady?.({ shown, total: gallery.length });
  return { lightbox, appendBatch };
}
