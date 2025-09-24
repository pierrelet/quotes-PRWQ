// StreamFlix interactions

(function () {
  const html = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeMenu = document.getElementById('themeMenu');
  const navToggleBtn = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const yearEl = document.getElementById('year');
  const breadcrumb = document.getElementById('breadcrumb');

  // Year in footer
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme system with localStorage
  const THEMES = ['dark', 'light', 'sepia'];
  const STORAGE_KEY = 'streamflix-theme';
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme && THEMES.includes(storedTheme)) {
    html.setAttribute('data-theme', storedTheme);
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) return;
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeMenu(theme);
  }
  function updateThemeMenu(current) {
    if (!themeMenu) return;
    themeMenu.querySelectorAll('li').forEach(li => li.setAttribute('aria-selected', String(li.dataset.theme === current)));
  }
  function toggleThemeMenu() {
    if (!themeMenu || !themeToggleBtn) return;
    const isHidden = themeMenu.classList.toggle('hidden');
    themeToggleBtn.setAttribute('aria-expanded', String(!isHidden));
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleThemeMenu);
    document.addEventListener('click', (e) => {
      if (!themeMenu || !themeToggleBtn) return;
      if (!themeMenu.contains(e.target) && e.target !== themeToggleBtn) {
        themeMenu.classList.add('hidden');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
    if (themeMenu) {
      themeMenu.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        applyTheme(li.dataset.theme);
        themeMenu.classList.add('hidden');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      });
      updateThemeMenu(html.getAttribute('data-theme') || 'dark');
    }
  }

  // Mobile nav toggle
  if (navToggleBtn && navMenu) {
    navToggleBtn.addEventListener('click', () => {
      const expanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
      navToggleBtn.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('hidden');
    });
  }

  // Animated nav indicator follows active link
  const navIndicator = document.querySelector('.nav-indicator');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  function updateIndicator(targetEl) {
    if (!navIndicator || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const parentRect = targetEl.parentElement.getBoundingClientRect();
    navIndicator.style.left = rect.left - parentRect.left + 'px';
    navIndicator.style.width = rect.width + 'px';
  }
  function setActive(link) {
    navLinks.forEach(l => l.classList.toggle('is-active', l === link));
    updateIndicator(link);
  }
  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.is-active');
    if (active) updateIndicator(active);
  });
  navLinks.forEach(link => link.addEventListener('click', (e) => {
    setActive(e.currentTarget);
  }));
  // Initial indicator
  window.requestAnimationFrame(() => {
    const active = document.querySelector('.nav-link.is-active');
    if (active) updateIndicator(active);
  });

  // Header shrink on scroll
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.body.classList.toggle('is-compact', y > 24 && y > lastY);
    lastY = y;
  }, { passive: true });

  // Scrollspy with IntersectionObserver
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const idToLink = new Map(navLinks.map(l => [l.getAttribute('href').slice(1), l]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const link = idToLink.get(id);
        if (link) setActive(link);
        updateBreadcrumb(entry.target);
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
  sections.forEach(s => observer.observe(s));

  function updateBreadcrumb(section) {
    if (!breadcrumb) return;
    const title = section.getAttribute('data-title') || section.id;
    breadcrumb.innerHTML = '';
    const items = [
      { label: 'Accueil', href: '#home' },
      { label: title, href: `#${section.id}` }
    ];
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      if (idx > 0) {
        const sep = document.createElement('li'); sep.className = 'sep'; sep.textContent = '›'; breadcrumb.appendChild(sep);
      }
      const a = document.createElement('a'); a.href = item.href; a.textContent = item.label; li.appendChild(a);
      breadcrumb.appendChild(li);
    });
  }

  // Hero parallax via mouse and scroll
  const hero = document.querySelector('.hero');
  const layers = {
    back: document.querySelector('.layer-back'),
    mid: document.querySelector('.layer-mid'),
    front: document.querySelector('.layer-front'),
  };
  function parallax(xRatio, yRatio) {
    if (layers.back) layers.back.style.transform = `translate3d(${xRatio * -8}px, ${yRatio * -4}px, -80px) scale(1.1)`;
    if (layers.mid) layers.mid.style.transform = `translate3d(${xRatio * -16}px, ${yRatio * -8}px, -40px) scale(1.05)`;
    if (layers.front) layers.front.style.transform = `translate3d(${xRatio * 10}px, ${yRatio * 6}px, 0)`;
  }
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      parallax(x * 20, y * 20);
    });
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const xRatio = 0;
      const yRatio = Math.max(0, 1 - Math.min(1, y / 600)) * -10;
      parallax(xRatio, yRatio);
    }, { passive: true });
  }

  // Fake data for movies
  const sampleImages = [
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517602382275-86b7a2b4e0b3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=800&auto=format&fit=crop'
  ];
  function createCard(index) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="card-media skeleton">
        <picture>
          <source media="(min-width: 1024px)" srcset="${sampleImages[index % sampleImages.length]}&dpr=2" />
          <img loading="lazy" alt="Poster" />
        </picture>
      </div>
      <div class="card-overlay" aria-hidden="true">
        <div class="overlay-center">
          <button class="play-btn" title="Lire" aria-label="Lire">
            ▶
          </button>
        </div>
        <div class="overlay-bottom">
          <div class="overlay-title">Titre ${index + 1}</div>
          <div class="overlay-meta">2025 • Action • 16+</div>
        </div>
      </div>
      <span class="badge">TOP ${((index % 10) + 1)}</span>
      <div class="card-actions">
        <button class="icon-btn" title="Ajouter à ma liste" data-action="add">
          +
        </button>
        <button class="icon-btn" title="Voir les détails" data-action="info">i</button>
      </div>
      <div class="card-info">
        <h3 class="card-title">Titre ${index + 1}</h3>
        <p class="card-meta">2025 • Action • 16+</p>
      </div>`;
    return el;
  }

  function hydrateGrid(grid) {
    if (!grid) return;
    const cards = Array.from({ length: 14 }, (_, i) => createCard(i));
    cards.forEach((c, i) => {
      c.style.animation = `fade-in var(--dur-3) var(--ease-smooth) ${i * 40}ms both`;
      grid.appendChild(c);
      // Simulate image load
      const img = c.querySelector('img');
      img.addEventListener('load', () => c.querySelector('.card-media').classList.remove('skeleton'));
      img.src = sampleImages[i % sampleImages.length];
    });
  }

  // Staggered fade-in animation via JS-created keyframes
  const style = document.createElement('style');
  style.textContent = `@keyframes fade-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`;
  document.head.appendChild(style);

  document.querySelectorAll('.grid.movies').forEach(hydrateGrid);

  // Simple user list: persist added items in localStorage
  const LIST_KEY = 'streamflix-list';
  let myList = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
  const listGrid = document.querySelector('[data-user-list]');
  function renderList() {
    if (!listGrid) return;
    listGrid.innerHTML = '';
    myList.forEach((src, i) => {
      const card = createCard(i);
      card.querySelector('img').src = src;
      listGrid.appendChild(card);
    });
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn[data-action="add"]');
    if (!btn) return;
    const card = btn.closest('.card');
    const img = card && card.querySelector('img');
    if (!img) return;
    const src = img.currentSrc || img.src;
    if (!myList.includes(src)) {
      myList.push(src);
      localStorage.setItem(LIST_KEY, JSON.stringify(myList));
      renderList();
    }
  });
  renderList();
})();


