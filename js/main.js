/**
 * Nebula Technosys — Main application
 */

const ROW_UNIT = 8;
const GAP = 10;

let config = {};
let gallery = [];
let lightboxIndex = 0;

async function init() {
  await loadConfig();
  applyConfig();
  await loadGallery();
  initHero();
  initMasonry();
  initNavigation();
  initTimeline();
  initLightbox();
  initContactForm();
  initMap();
  initReveal();
  initJourneyLinks();

  document.getElementById('year').textContent = new Date().getFullYear();
}

async function loadConfig() {
  try {
    const res = await fetch('js/site-config.json');
    if (res.ok) config = await res.json();
  } catch {
    config = {
      companyName: 'Nebula Technosys',
      tagline: 'From concept to production-ready product',
      email: 'contact@nebulatechnosys.com',
      phone: '+91 00000 00000',
      whatsapp: '910000000000',
      web3formsAccessKey: 'YOUR_WEB3FORMS_ACCESS_KEY',
      logoPath: 'images/logo.png',
      map: { lat: 21.1702, lng: 72.8311, address: 'Your Office Address', zoom: 16 }
    };
  }
}

function applyConfig() {
  const name = config.companyName || 'Nebula Technosys';

  document.title = `${name} | Rapid Prototyping & 3D Printing`;
  document.querySelectorAll('#logo-text, #footer-logo').forEach(el => { el.textContent = name; });

  const tagline = config.tagline || 'Turn your idea into a real product';
  const desc = config.description || 'From first sketch to production-ready — we design, prototype, and guide your next steps.';

  const heroTagline = document.getElementById('hero-tagline');
  const heroDesc = document.getElementById('hero-desc');
  const footerTagline = document.getElementById('footer-tagline');
  if (heroTagline) heroTagline.textContent = tagline;
  if (heroDesc) heroDesc.textContent = desc;
  if (footerTagline) footerTagline.textContent = tagline;

  const logoImg = document.getElementById('logo-img');
  if (logoImg && config.logoPath) {
    logoImg.src = config.logoPath;
    logoImg.alt = name;
    logoImg.onload = () => { logoImg.hidden = false; };
    logoImg.onerror = () => { logoImg.hidden = true; };
  }

  const phoneEl = document.getElementById('contact-phone');
  const emailEl = document.getElementById('contact-email');
  const waEl = document.getElementById('contact-whatsapp');
  const fabWa = document.getElementById('fab-whatsapp');

  if (phoneEl && config.phone) {
    phoneEl.textContent = config.phone;
    phoneEl.href = `tel:${config.phone.replace(/\s/g, '')}`;
  }
  if (emailEl && config.email) {
    emailEl.textContent = config.email;
    emailEl.href = `mailto:${config.email}`;
  }
  const waNum = (config.whatsapp || '').replace(/\D/g, '');
  const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent('Hi, I have a project idea I\'d like to discuss.')}`;
  if (waEl) { waEl.href = waUrl; }
  if (fabWa) { fabWa.href = waUrl; }

  const mapAddr = document.getElementById('map-address');
  if (mapAddr && config.map?.address) mapAddr.textContent = config.map.address;
}

async function loadGallery() {
  try {
    const res = await fetch('gallery.json');
    if (res.ok) gallery = await res.json();
  } catch {
    gallery = [];
  }

  const countEl = document.getElementById('portfolio-count');
  if (countEl && gallery.length > 0) {
    countEl.textContent = `${gallery.length} prototype${gallery.length !== 1 ? 's' : ''} from our workshop.`;
  }
}

function initHero() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg || gallery.length === 0) return;

  heroBg.classList.add('has-image');
  const picks = gallery.slice(0, Math.min(5, gallery.length));
  let current = 0;

  picks.forEach((item, i) => {
    const layer = document.createElement('div');
    layer.className = 'hero-bg-layer' + (i === 0 ? ' active' : '');
    layer.style.backgroundImage = `url('${item.src}')`;
    heroBg.appendChild(layer);
  });

  if (picks.length > 1) {
    setInterval(() => {
      const layers = heroBg.querySelectorAll('.hero-bg-layer');
      layers[current].classList.remove('active');
      current = (current + 1) % layers.length;
      layers[current].classList.add('active');
    }, 5000);
  }
}

function initMasonry() {
  const grid = document.getElementById('masonry-grid');
  const empty = document.getElementById('portfolio-empty');

  if (!grid) return;

  if (gallery.length === 0) {
    grid.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  grid.innerHTML = '';

  const cols = getColumnCount();
  const colWidth = (grid.offsetWidth - GAP * (cols - 1)) / cols;

  gallery.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'masonry-item reveal';
    el.role = 'listitem';
    el.dataset.index = index;

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = `3D print prototype ${index + 1}`;
    img.loading = index < 8 ? 'eager' : 'lazy';
    img.decoding = 'async';

    el.appendChild(img);
    grid.appendChild(el);

    img.onload = () => layoutMasonryItem(el, item, colWidth);
    if (img.complete) layoutMasonryItem(el, item, colWidth);

    el.addEventListener('click', () => openLightbox(index));
  });

  window.addEventListener('resize', debounce(() => {
    const w = (grid.offsetWidth - GAP * (getColumnCount() - 1)) / getColumnCount();
    grid.querySelectorAll('.masonry-item').forEach((el, i) => {
      if (gallery[i]) layoutMasonryItem(el, gallery[i], w);
    });
  }, 200));
}

function getColumnCount() {
  const w = window.innerWidth;
  if (w <= 480) return 1;
  if (w <= 768) return 2;
  if (w <= 1024) return 3;
  return 4;
}

function layoutMasonryItem(el, item, colWidth) {
  const ratio = item.aspectRatio || (item.width / item.height) || 1;
  const imgHeight = colWidth / ratio;
  const rowSpan = Math.ceil((imgHeight + GAP) / (ROW_UNIT + GAP / getColumnCount()));
  el.style.gridRowEnd = `span ${Math.max(rowSpan, 12)}`;
}

function initNavigation() {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const ctas = document.querySelector('.header-ctas');
  const links = nav?.querySelectorAll('a') || [];

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNav(links);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    ctas?.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      ctas?.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });

  updateActiveNav(links);
}

function updateActiveNav(links) {
  const sections = ['home', 'services', 'process', 'portfolio', 'about', 'faq', 'contact'];
  let current = 'home';

  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) current = id;
  }

  links.forEach(link => {
    const href = link.getAttribute('href')?.slice(1);
    link.classList.toggle('active', href === current);
  });
}

function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');

  items.forEach((item, i) => {
    if (i === 0) item.classList.add('is-open');

    const trigger = item.querySelector('.timeline-trigger');
    trigger?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach(it => {
        it.classList.remove('is-open');
        it.querySelector('.timeline-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close');
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');

  close?.addEventListener('click', closeLightbox);
  lb?.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  prev?.addEventListener('click', () => navigateLightbox(-1));
  next?.addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', e => {
    if (lb?.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  if (!gallery.length) return;
  lightboxIndex = index;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = gallery[index].src;
  img.alt = `3D print prototype ${index + 1}`;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').hidden = true;
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + gallery.length) % gallery.length;
  const img = document.getElementById('lightbox-img');
  img.src = gallery[lightboxIndex].src;
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit');

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const accessKey = config.web3formsAccessKey;
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      status.textContent = 'Email not configured yet. Update web3formsAccessKey in config/site.config.json';
      status.classList.add('error');
      return;
    }

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoading.hidden = false;

    const formData = new FormData(form);
    formData.append('access_key', accessKey);
    formData.append('subject', `New inquiry from ${config.companyName} website`);
    formData.append('from_name', config.companyName);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        status.textContent = 'Message sent! We\'ll get back to you within 24 hours.';
        status.classList.add('success');
        form.reset();
      } else {
        throw new Error(data.message || 'Failed to send');
      }
    } catch (err) {
      status.textContent = `Could not send message. Please email us at ${config.email || 'our address'}.`;
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      btnText.hidden = false;
      btnLoading.hidden = true;
    }
  });
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const { lat, lng, zoom = 16 } = config.map || {};
  if (!lat || !lng) return;

  const map = L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lng], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup(`<strong>${config.companyName}</strong><br>${config.map.address || ''}`)
    .openPopup();

  mapEl.addEventListener('click', () => map.scrollWheelZoom.enable());
  mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
}

function initReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initJourneyLinks() {
  document.querySelectorAll('[data-journey]').forEach(link => {
    link.addEventListener('click', e => {
      const val = link.dataset.journey;
      const map = { concept: 'concept', design: 'cad', full: 'full' };
      const select = document.getElementById('journey');
      if (select && map[val]) select.value = map[val];
    });
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

init();
