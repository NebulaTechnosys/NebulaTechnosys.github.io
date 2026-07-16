/**
 * Nebula Technosys — Main application
 */

import { fetchGallery, initBentoGallery, HOME_PREVIEW_COUNT } from './gallery.js';

let config = {};
let gallery = [];

async function init() {
  await loadConfig();
  applyConfig();
  await loadGallery();
  initHero();
  initHomeGallery();
  initNavigation();
  initTimeline();
  initContactForm();
  initMap();
  initTheme();
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
      logo: {
        darkTheme: 'images/logo_blackbg.png',
        lightTheme: 'images/logo_whitebg.png'
      },
      map: {
        embedUrl: '',
        address: 'Your Office Address'
      },
      social: {}
    };
  }
}

function applyConfig() {
  const name = config.companyName || 'Nebula Technosys';

  document.title = `${name} | Rapid Prototyping & 3D Printing`;

  const tagline = config.tagline || 'Turn your idea into a real product';
  const desc = config.description || 'From first sketch to production-ready — we design, prototype, and guide your next steps.';

  const heroTagline = document.getElementById('hero-tagline');
  const heroDesc = document.getElementById('hero-desc');
  const footerTagline = document.getElementById('footer-tagline');
  if (heroTagline) heroTagline.textContent = tagline;
  if (heroDesc) heroDesc.textContent = desc;
  if (footerTagline) footerTagline.textContent = tagline;

  applyLogos(getTheme());
  initSocialLinks();

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
  gallery = await fetchGallery();

  const countEl = document.getElementById('portfolio-count');
  const viewAll = document.getElementById('portfolio-view-all');
  if (gallery.length > 0) {
    if (countEl) {
      countEl.textContent = gallery.length > HOME_PREVIEW_COUNT
        ? `A curated preview from ${gallery.length} prototypes in our workshop.`
        : `${gallery.length} prototype${gallery.length !== 1 ? 's' : ''} from our workshop.`;
    }
    if (viewAll) viewAll.hidden = gallery.length <= HOME_PREVIEW_COUNT;
  }
}

function initHomeGallery() {
  initBentoGallery({
    grid: document.getElementById('portfolio-grid'),
    empty: document.getElementById('portfolio-empty'),
    statusEl: null,
    gallery,
    limit: HOME_PREVIEW_COUNT
  });

  document.querySelectorAll('#portfolio-grid .bento-item').forEach(el => {
    el.classList.add('reveal');
  });
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

function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyLogos(theme) {
  const name = config.companyName || 'Nebula Technosys';
  const darkLogo = config.logo?.darkTheme || 'images/logo_blackbg.png';
  const lightLogo = config.logo?.lightTheme || 'images/logo_whitebg.png';
  const src = theme === 'light' ? lightLogo : darkLogo;

  document.querySelectorAll('#logo-img, #footer-logo-img').forEach(img => {
    img.src = src;
    img.alt = name;
  });
}

function initTheme() {
  const saved = localStorage.getItem('nebula-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = saved || (prefersLight ? 'light' : 'dark');
  setTheme(theme);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('nebula-theme', theme);
  applyLogos(theme);

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function initSocialLinks() {
  const container = document.getElementById('footer-social');
  const social = config.social || {};
  if (!container) return;

  const icons = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><path d="M17.5 6.5h.01"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  };

  container.innerHTML = '';
  for (const [key, url] of Object.entries(social)) {
    if (!url || !icons[key]) continue;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', key);
    a.innerHTML = icons[key];
    container.appendChild(a);
  }
}

function initMap() {
  const iframe = document.getElementById('map-iframe');
  const embedUrl = config.map?.embedUrl;
  if (iframe && embedUrl) {
    iframe.src = embedUrl;
  }
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

init();
