
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
    document.querySelectorAll('.brand img,.section-mark,.section-logo').forEach(img => {
      img.addEventListener('error', () => {
        if (img.classList.contains('section-mark') || img.classList.contains('section-logo')) {
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

  // Background videos inside content sections (culture page ensembles).
  // Sources load only when the section scrolls into view, play muted, pause
  // off-screen, and never autoplay under reduced motion or data saver.
  try {
    const bgVideos = [...document.querySelectorAll('video.bg-video')];
    if (bgVideos.length) {
      const small = window.matchMedia('(max-width:767px)').matches;
      const conn = navigator.connection || {};
      const autoplay = !reducedMotion && !conn.saveData;
      const load = v => {
        if (v.dataset.loaded) return;
        const src = (small && v.dataset.srcMobile) || v.dataset.src;
        if (!src) return;
        v.src = src;
        v.dataset.loaded = '1';
      };
      const start = v => {
        if (!autoplay || v.dataset.userPaused || v.dataset.failed) return;
        load(v);
        v.play().catch(() => {});
      };
      bgVideos.forEach(v => {
        v.muted = true;
        v.setAttribute('playsinline', '');
        const section = v.closest('.ensemble');
        const btn = section && section.querySelector('.video-toggle');
        v.addEventListener('error', () => {
          v.dataset.failed = '1';
          if (btn) btn.hidden = true;
        });
        if (!btn) return;
        const sync = () => {
          btn.classList.toggle('is-paused', v.paused);
          btn.setAttribute('aria-label', v.paused
            ? (btn.dataset.labelPlay || 'Play background video')
            : (btn.dataset.labelPause || 'Pause background video'));
        };
        v.addEventListener('play', sync);
        v.addEventListener('pause', sync);
        btn.hidden = false;
        sync();
        btn.addEventListener('click', () => {
          if (v.paused) {
            delete v.dataset.userPaused;
            load(v);
            v.play().catch(() => {});
          } else {
            v.dataset.userPaused = '1';
            v.pause();
          }
        });
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) start(entry.target);
          else if (!entry.target.paused) entry.target.pause();
        }), {threshold: .2});
        bgVideos.forEach(v => io.observe(v));
      } else {
        bgVideos.forEach(start);
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

  // Tickets: the Buy tickets link opens Eventbrite's checkout as a pop-up on the
  // page (Eventbrite's embedded checkout widget), so visitors stay on the site.
  // Until the widget is ready - or if it can't load (blocked script, or a page
  // opened from disk: Eventbrite only allows the pop-up on https) - it stays a
  // normal link to the event on Eventbrite.
  try {
    const ebLink = document.querySelector('[data-eventbrite-event]');
    if (ebLink && ebLink.id && window.location.protocol === 'https:') {
      const ebScript = document.createElement('script');
      ebScript.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
      ebScript.async = true;
      ebScript.onload = () => {
        try {
          window.EBWidgets.createWidget({
            widgetType: 'checkout',
            eventId: ebLink.dataset.eventbriteEvent,
            modal: true,
            modalTriggerElementId: ebLink.id
          });
        } catch (err) { return; }
        // Eventbrite opens the pop-up on click but doesn't stop the link itself.
        ebLink.addEventListener('click', e => e.preventDefault());
        ebLink.setAttribute('aria-haspopup', 'dialog');
      };
      document.head.appendChild(ebScript);
    }
  } catch (e) {}
})();
