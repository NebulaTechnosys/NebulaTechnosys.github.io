/**
 * Portfolio page — full gallery in scrollable panel with load-more.
 */

import { fetchGallery, initBentoGallery, BATCH_SIZE } from './gallery.js';

async function loadConfig() {
  try {
    const res = await fetch('js/site-config.json');
    if (res.ok) return await res.json();
  } catch { /* empty */ }
  return {};
}

function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyLogos(config, theme) {
  const darkLogo = config.logo?.darkTheme || 'images/logo_blackbg.png';
  const lightLogo = config.logo?.lightTheme || 'images/logo_whitebg.png';
  const src = theme === 'light' ? lightLogo : darkLogo;
  document.querySelectorAll('#logo-img, #footer-logo-img').forEach(img => {
    img.src = src;
    img.alt = config.companyName || 'Nebula Technosys';
  });
}

function initTheme(config) {
  const saved = localStorage.getItem('nebula-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = saved || (prefersLight ? 'light' : 'dark');
  document.documentElement.dataset.theme = theme;
  applyLogos(config, theme);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('nebula-theme', next);
    applyLogos(config, next);
    document.getElementById('theme-toggle')?.setAttribute(
      'aria-label',
      next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  });
}

function initNav() {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const ctas = document.querySelector('.header-ctas');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    ctas?.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      ctas?.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initSocial(config) {
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

function applyContact(config) {
  const waNum = (config.whatsapp || '').replace(/\D/g, '');
  const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent('Hi, I have a project idea I\'d like to discuss.')}`;
  const fab = document.getElementById('fab-whatsapp');
  if (fab) fab.href = waUrl;

  const tagline = document.getElementById('footer-tagline');
  if (tagline && config.tagline) tagline.textContent = config.tagline;
}

async function init() {
  const config = await loadConfig();
  initTheme(config);
  initNav();
  initSocial(config);
  applyContact(config);

  document.getElementById('year').textContent = new Date().getFullYear();

  const gallery = await fetchGallery();
  const countHead = document.getElementById('portfolio-total');
  if (countHead && gallery.length) {
    countHead.textContent = `${gallery.length} prototypes from our workshop`;
  }

  initBentoGallery({
    grid: document.getElementById('portfolio-grid'),
    empty: document.getElementById('portfolio-empty'),
    statusEl: document.getElementById('portfolio-status'),
    loadMoreBtn: document.getElementById('load-more'),
    scrollWrap: document.getElementById('portfolio-scroll'),
    gallery,
    limit: null
  });
}

init();
