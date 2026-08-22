
(() => {
  const html = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Content is visible by default in CSS. Only opt into the hidden/animated
  // state when motion is allowed AND this script actually runs. If anything
  // below throws, critical content (hero title, date, CTA) is unaffected
  // because it never depended on JS to become visible in the first place.
  if (!reducedMotion) {
    html.classList.add('motion-enabled');
  }

  // Safety net: whatever happens with the IntersectionObserver below,
  // force every reveal/line-reveal element visible after a short delay so
  // content can never be stuck hidden.
  window.setTimeout(() => {
    document.querySelectorAll('.reveal,.line-reveal').forEach(el => el.classList.add('is-visible'));
  }, 2200);

  const loader = document.querySelector('.site-loader');
  const loaderWrap = document.querySelector('.loader-mark-wrap');
  const loaderImg = document.querySelector('.loader-mark');
  if (loaderImg) {
    loaderImg.addEventListener('error', () => {
      loaderImg.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'loader-fallback';
      loaderImg.parentNode.appendChild(fallback);
    }, {once: true});
  }
  if (loaderWrap) {
    requestAnimationFrame(() => requestAnimationFrame(() => loaderWrap.classList.add('is-active')));
  }

  const loadStart = (window.performance && performance.now) ? performance.now() : Date.now();
  const MIN_LOADER_MS = 820;
  let loaderHidden = false;
  const hideLoader = () => {
    if (!loader || loaderHidden) return;
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const remaining = Math.max(0, MIN_LOADER_MS - (now - loadStart));
    setTimeout(() => {
      loaderHidden = true;
      loader.classList.add('is-hidden');
      body.classList.remove('loading');
    }, remaining);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, {once: true});
  setTimeout(hideLoader, 2400);

  try {
    document.querySelectorAll('.brand img,.section-mark').forEach(img => {
      img.addEventListener('error', () => {
        if (img.classList.contains('section-mark')) {
          const f = document.createElement('div'); f.className = 'section-mark-fallback';
          img.replaceWith(f);
        } else {
          const f = document.createElement('div'); f.className = 'brand-fallback'; f.textContent = 'RF';
          img.replaceWith(f);
        }
      }, {once: true});
    });
  } catch (e) {}

  try {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileClose = document.querySelector('.mobile-nav-close');
    const closeMobile = () => mobileNav && mobileNav.classList.remove('open');
    if (mobileBtn && mobileNav) mobileBtn.addEventListener('click', () => mobileNav.classList.add('open'));
    if (mobileClose) mobileClose.addEventListener('click', closeMobile);
    if (mobileNav) mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  } catch (e) {}

  try {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {threshold: .14, rootMargin: '0px 0px -5% 0px'});
      document.querySelectorAll('.reveal,.line-reveal').forEach(el => observer.observe(el));
    } else {
      document.querySelectorAll('.reveal,.line-reveal').forEach(el => el.classList.add('is-visible'));
    }
  } catch (e) {
    document.querySelectorAll('.reveal,.line-reveal').forEach(el => el.classList.add('is-visible'));
  }

  try {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
      if (window.matchMedia('(max-width:767px)').matches) {
        const source = heroVideo.querySelector('source');
        if (source) source.setAttribute('src', source.getAttribute('src').replace('hero.mp4', 'hero-mobile.mp4'));
        heroVideo.load();
      }
      heroVideo.muted = true;
      heroVideo.setAttribute('playsinline', '');
      heroVideo.play().catch(() => {});
      const hero = document.querySelector('.hero');
      const header = document.querySelector('.site-header:not(.inner)');
      if (hero) {
        const onScroll = () => {
          const y = Math.min(window.scrollY, hero.offsetHeight);
          heroVideo.style.transform = `scale(${1 + y / 6000}) translateY(${y / 18}px)`;
          if (header) header.classList.toggle('scrolled', window.scrollY > hero.offsetHeight * 0.62);
        };
        window.addEventListener('scroll', onScroll, {passive: true});
        onScroll();
      }
    } else {
      const header = document.querySelector('.site-header:not(.inner)');
      if (header) {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, {passive: true});
        onScroll();
      }
    }
  } catch (e) {}

  try {
    document.querySelectorAll('.schedule-tabs').forEach(tabset => {
      const tabs = [...tabset.querySelectorAll('.schedule-tab')];
      const panels = [...document.querySelectorAll('.schedule-panel')];
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(tab.dataset.target);
        if (panel) panel.classList.add('active');
      }));
    });
  } catch (e) {}

  try {
    const signup = document.querySelector('.footer-signup');
    if (signup) {
      signup.addEventListener('submit', e => {
        e.preventDefault();
        const input = signup.querySelector('input');
        const btn = signup.querySelector('button');
        if (!input.value.trim()) return;
        btn.textContent = '✓';
        input.value = '';
        setTimeout(() => btn.textContent = '→', 1200);
      });
    }
  } catch (e) {}

  try {
    document.querySelectorAll('.simple-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (form.checkValidity && !form.checkValidity()) { form.reportValidity(); return; }
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = 'Thank you ✓';
        btn.disabled = true;
        form.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3200);
      });
    });
  } catch (e) {}
})();
