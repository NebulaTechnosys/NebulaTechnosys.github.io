/**
 * Overlapping collage gallery — staggered cards with hover lift.
 */

export const COLLAGE_SLOTS = 7;
export const PORTFOLIO_BATCH_SIZE = 50;
export const HOME_PREVIEW_COUNT = 7;

/** Card positions within one collage stage (matches demo 5) */
export const COLLAGE_LAYOUT = [
  'collage-c1',
  'collage-c2',
  'collage-c3',
  'collage-c4',
  'collage-c5',
  'collage-c6',
  'collage-c7'
];

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchGallery() {
  try {
    const res = await fetch('gallery.json');
    if (res.ok) return shuffle(await res.json());
  } catch { /* empty */ }
  return [];
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

function createCollageCard(item, globalIndex, slotClass, { eager = false } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `collage-card ${slotClass}`;
  el.dataset.index = String(globalIndex);
  el.setAttribute('aria-label', `View prototype ${globalIndex + 1}`);

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = `3D print prototype ${globalIndex + 1}`;
  img.loading = eager ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.draggable = false;

  el.appendChild(img);
  return el;
}

function createCollageStage(items, startGlobalIndex, onItemClick, { variant = 'default' } = {}) {
  const stage = document.createElement('div');
  stage.className = variant === 'preview' ? 'collage-stage collage-stage--preview' : 'collage-stage';
  stage.setAttribute('role', 'list');

  items.forEach((item, i) => {
    const globalIndex = startGlobalIndex + i;
    const slotClass = COLLAGE_LAYOUT[i % COLLAGE_LAYOUT.length];
    const card = createCollageCard(item, globalIndex, slotClass, { eager: globalIndex < 20 });
    card.addEventListener('click', () => onItemClick(globalIndex));
    stage.appendChild(card);
  });

  return stage;
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container — stages wrapper (or single stage on home)
 * @param {HTMLElement|null} opts.empty
 * @param {HTMLElement|null} opts.statusEl
 * @param {HTMLElement|null} opts.loadMoreBtn
 * @param {HTMLElement|null} opts.scrollWrap
 * @param {number|null} opts.limit — home preview: one stage only
 */
export function initCollageGallery(opts) {
  const {
    container,
    empty,
    statusEl,
    loadMoreBtn,
    scrollWrap,
    gallery,
    limit = null,
    batchSize = PORTFOLIO_BATCH_SIZE,
    onReady
  } = opts;

  if (!container || !gallery.length) {
    if (container) container.hidden = true;
    if (empty) empty.hidden = false;
    return { lightbox: initLightbox([]) };
  }

  if (empty) empty.hidden = true;
  container.hidden = false;
  container.innerHTML = '';

  const lightbox = initLightbox(gallery);
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
    while (shown < gallery.length && count > 0) {
      const slice = gallery.slice(shown, shown + COLLAGE_SLOTS);
      if (!slice.length) break;

      const stage = createCollageStage(slice, shown, i => lightbox.open(i));
      container.appendChild(stage);

      shown += slice.length;
      count -= slice.length;

      requestAnimationFrame(() => {
        stage.querySelectorAll('.collage-card').forEach(el => el.classList.add('visible'));
      });
    }

    updateStatus();

    if (loadMoreBtn) {
      const remaining = gallery.length - shown;
      if (remaining <= 0) {
        loadMoreBtn.hidden = true;
      } else {
        loadMoreBtn.hidden = false;
        const next = Math.min(batchSize, remaining);
        loadMoreBtn.textContent = `Load more (${next} photos)`;
      }
    }
  }

  if (limit != null) {
    const slice = gallery.slice(0, Math.min(limit, gallery.length));
    const stage = createCollageStage(slice, 0, i => lightbox.open(i), { variant: 'preview' });
    container.appendChild(stage);
    shown = slice.length;
    requestAnimationFrame(() => {
      stage.querySelectorAll('.collage-card').forEach(el => el.classList.add('visible'));
    });
  } else {
    appendBatch(batchSize);
    loadMoreBtn?.addEventListener('click', () => {
      appendBatch(batchSize);
      if (scrollWrap && shown >= gallery.length) {
        scrollWrap.classList.add('is-expanded');
      }
    });
  }

  updateStatus();
  onReady?.({ shown, total: gallery.length });
  return { lightbox, appendBatch };
}

/** @deprecated use initCollageGallery */
export const initBentoGallery = initCollageGallery;
