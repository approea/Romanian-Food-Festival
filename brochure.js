// Digital brochure: welcome intro, pages behind tabs, film loops, festival-day schedule.
(() => {
  window.broReady = true;
  const d = document;
  const root = d.documentElement;
  root.classList.add('bro-js');   // in case the page had already fallen back to the no-script layout
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const phone = window.matchMedia('(max-width: 767px)');
  const TZ = 'America/Chicago';
  const panels = Array.from(d.querySelectorAll('.bro-panel'));
  const ids = panels.map(p => p.id);
  const tabLinks = Array.from(d.querySelectorAll('a[data-tab]'));
  let current = panels.find(p => p.classList.contains('is-active')) || panels[0];

  // number the top buttons so they can settle in one after another
  d.querySelectorAll('.bro-nav--top .bro-tabs li').forEach((li, i) => li.style.setProperty('--n', i));

  const jumpTo = top => {
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, top));
    root.style.scrollBehavior = prev;
  };
  const topNav = d.querySelector('.bro-nav--top');
  const bottomNav = d.querySelector('.bro-nav--bottom');
  const mini = d.querySelector('.bro-mini');

  // ---------------------------------------------------------------- film loops
  const videoFor = v => `../assets/brochure/v/${v.dataset.video}${phone.matches ? '-m' : ''}.mp4`;
  const playVideo = v => {
    if (!v || reduce || saveData) return;
    if (!v.dataset.loaded) { v.src = videoFor(v); v.dataset.loaded = '1'; }
    v.muted = true;
    if (!v.dataset.watch) {
      v.dataset.watch = '1';
      v.addEventListener('playing', () => v.classList.add('is-playing'));
    }
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  const heroIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      const v = en.target.querySelector('video');
      if (!v) return;
      if (en.isIntersecting && en.target.closest('.bro-panel') === current) playVideo(v);
      else if (!v.paused) v.pause();
    });
  }, { threshold: 0.05 }) : null;
  if (heroIO) d.querySelectorAll('.bro-hero').forEach(h => heroIO.observe(h));

  // ---------------------------------------------------------------- reveal on scroll
  const revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }) : null;
  const armReveals = panel => {
    panel.querySelectorAll('.bro-reveal:not(.is-in)').forEach(el => {
      if (revealIO) revealIO.observe(el); else el.classList.add('is-in');
    });
  };

  // ---------------------------------------------------------------- pages
  const setCurrentTab = id => {
    tabLinks.forEach(a => {
      if (a.dataset.tab === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  };
  const show = (id, opts = {}) => {
    const panel = d.getElementById(id);
    if (!panel || !panel.classList.contains('bro-panel')) return;
    const changed = panel !== current || !panel.classList.contains('is-active');
    if (changed) {
      panels.forEach(p => {
        const on = p === panel;
        p.classList.toggle('is-active', on);
        p.classList.remove('is-entering');
        if (!on) { const v = p.querySelector('video'); if (v && !v.paused) v.pause(); }
      });
      current = panel;
      if (opts.animate !== false && !reduce) {
        void panel.offsetWidth;  // restart the entrance animation
        panel.classList.add('is-entering');
      }
      d.title = `${panel.dataset.docTitle} — Digital Brochure · Romanian Food Festival DFW`;
    }
    setCurrentTab(id);
    playVideo(panel.querySelector('video'));
    if (opts.reveal !== false) armReveals(panel);
    if (id === 'schedule') replaySchedule();
    if (opts.scroll !== false && window.scrollY > 0) jumpTo(0);   // every page opens from the top, like a new page
    if (opts.focus) {
      const h = panel.querySelector('.bro-hero-title');
      if (h) h.focus({ preventScroll: true });
    }
  };
  const route = (hash, opts = {}) => {
    const id = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!id) return show('welcome', opts);
    if (ids.includes(id)) return show(id, opts);
    const el = id && d.getElementById(id);
    if (el && !el.closest('.bro-panel')) return;   // e.g. the skip link
    const owner = el && el.closest('.bro-panel');
    if (owner) {
      show(owner.id, Object.assign({}, opts, { scroll: false }));
      requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
      return;
    }
    show('welcome', opts);
  };
  d.addEventListener('click', ev => {
    const a = ev.target.closest('a[data-tab]');
    if (a) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
      ev.preventDefault();
      const id = a.dataset.tab;
      if (location.hash !== `#${id}`) history.pushState({ tab: id }, '', `#${id}`);
      show(id, { focus: true });
      if (a.hasAttribute('data-now')) {
        // from the "now / next" card: go straight to what is on right now
        const n = d.getElementById('happening-now');
        if (n) requestAnimationFrame(() => n.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }));
      }
      return;
    }
    const j = ev.target.closest('a[data-jump]');
    if (j) {
      const target = d.getElementById(j.getAttribute('href').slice(1));
      if (target) { ev.preventDefault(); target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    }
  });
  window.addEventListener('popstate', () => route(location.hash));
  window.addEventListener('hashchange', () => route(location.hash));

  // ---------------------------------------------------------------- compact bar (phones, tablets)
  if (mini && topNav && 'IntersectionObserver' in window) {
    const seen = new Map();
    const update = () => mini.classList.toggle('is-shown', !seen.get(topNav) && !seen.get(bottomNav));
    const navIO = new IntersectionObserver(entries => {
      entries.forEach(en => seen.set(en.target, en.isIntersecting));
      update();
    });
    navIO.observe(topNav);
    if (bottomNav) navIO.observe(bottomNav);
  }

  // ---------------------------------------------------------------- festival time
  const festivalNow = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      const p = {};
      parts.forEach(x => { p[x.type] = x.value; });
      return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
    } catch (e) { return null; }
  };
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

  // ---------------------------------------------------------------- schedule: days
  const dayTabs = Array.from(d.querySelectorAll('.bro-day-tab'));
  const dayPanels = dayTabs.map(t => d.getElementById(t.getAttribute('aria-controls')));
  dayPanels.forEach(p => p && p.querySelectorAll('.bro-period-title, .bro-ev').forEach((el, i) => el.style.setProperty('--n', Math.min(i, 14))));
  const staggerDay = p => {
    if (!p || reduce) return;
    p.classList.remove('is-in');
    void p.offsetWidth;
    p.classList.add('is-in');
  };
  const selectDay = (i, focus) => {
    dayTabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (dayPanels[k]) dayPanels[k].hidden = !on;
    });
    staggerDay(dayPanels[i]);
    if (focus) dayTabs[i].focus();
  };
  const replaySchedule = () => {
    const i = dayTabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    staggerDay(dayPanels[i < 0 ? 0 : i]);
  };
  dayTabs.forEach((t, i) => {
    t.addEventListener('click', () => selectDay(i));
    t.addEventListener('keydown', ev => {
      let j = null;
      if (ev.key === 'ArrowRight') j = (i + 1) % dayTabs.length;
      else if (ev.key === 'ArrowLeft') j = (i - 1 + dayTabs.length) % dayTabs.length;
      else if (ev.key === 'Home') j = 0;
      else if (ev.key === 'End') j = dayTabs.length - 1;
      if (j !== null) { ev.preventDefault(); selectDay(j, true); }
    });
  });

  // ---------------------------------------------------------------- happening now / up next
  const liveSection = d.querySelector('.bro-live');
  const liveKicker = liveSection && liveSection.querySelector('.bro-live-kicker');
  const liveTitle = liveSection && liveSection.querySelector('.bro-live-title');
  const liveBody = liveSection && liveSection.querySelector('.bro-live-body');
  const liveBtn = liveSection && liveSection.querySelector('.bro-btn');
  const DOW = { '2026-10-23': 'Friday, October 23', '2026-10-24': 'Saturday, October 24', '2026-10-25': 'Sunday, October 25' };
  const OPENING = Date.UTC(2026, 9, 23, 22, 30);   // Friday 5:30 PM in Texas (CDT = UTC-5)
  const CLOSED = Date.UTC(2026, 9, 25, 23, 0);     // Sunday 6:00 PM in Texas

  const eventLine = (label, els) => {
    const row = d.createElement('div');
    row.className = 'bro-live-row';
    const l = d.createElement('span');
    l.className = 'bro-live-label';
    l.textContent = label;
    const w = d.createElement('span');
    w.className = 'bro-live-what';
    const b = d.createElement('b');
    const t = els[0].querySelector('.bro-ev-time');
    b.textContent = `${t.querySelector('time').textContent} ${t.querySelector('span').textContent}`;
    w.append(b, d.createTextNode(els.map(el => el.querySelector('.bro-ev-title').textContent).join(' · ')));
    row.append(l, w);
    return row;
  };
  const countdown = ms => {
    const wrap = d.createElement('div');
    wrap.className = 'bro-count';
    const mins = Math.max(0, Math.floor(ms / 60000));
    [[Math.floor(mins / 1440), 'days'], [Math.floor(mins / 60) % 24, 'hours'], [mins % 60, 'min']].forEach(([n, u]) => {
      const c = d.createElement('div');
      const b = d.createElement('b');
      b.textContent = String(n);
      const s = d.createElement('span');
      s.textContent = u;
      c.append(b, s);
      wrap.append(c);
    });
    return wrap;
  };
  const badge = (el, text) => {
    const s = d.createElement('span');
    s.className = 'bro-live-badge';
    s.textContent = text;
    const card = el.querySelector('.bro-ev-card');
    card.insertBefore(s, card.firstChild);
  };

  let todayIndex = -1;
  const markLive = () => {
    d.querySelectorAll('.bro-ev.is-now, .bro-ev.is-next').forEach(el => el.classList.remove('is-now', 'is-next'));
    d.querySelectorAll('.bro-live-badge').forEach(el => el.remove());
    const now = festivalNow();
    if (!now || !liveSection) return;
    const ms = Date.now();
    todayIndex = dayTabs.findIndex(t => t.dataset.date === now.date);
    liveBody.textContent = '';
    const card = liveSection.querySelector('.bro-live-card');
    card.classList.toggle('is-countdown', todayIndex < 0);
    if (todayIndex < 0) {
      if (ms < OPENING) {
        liveKicker.textContent = 'Countdown';
        liveTitle.textContent = 'The festival opens Friday, October 23 at 5:30 PM';
        liveBody.append(countdown(OPENING - ms));
        liveBtn.firstChild.textContent = 'See the schedule ';
        liveSection.hidden = false;
      } else {
        liveSection.hidden = true;
      }
      return;
    }
    const items = Array.from(dayPanels[todayIndex].querySelectorAll('.bro-ev[data-start]'));
    const starts = items.map(el => toMin(el.dataset.start));
    const closing = starts[starts.length - 1];
    liveKicker.textContent = 'Today at the festival';
    liveTitle.textContent = DOW[now.date];
    liveBtn.firstChild.textContent = 'Today’s schedule ';
    liveSection.hidden = false;
    if (now.minutes >= closing) {
      const p = d.createElement('p');
      p.className = 'bro-live-what';
      p.textContent = ms >= CLOSED ? 'Thank you for celebrating with us. Mulțumim!' : 'That’s all for today. See you tomorrow!';
      liveBody.append(p);
      return;
    }
    let latest = -1;
    starts.forEach(s => { if (s <= now.minutes) latest = Math.max(latest, s); });
    const nowEls = latest >= 0 ? items.filter((el, k) => starts[k] === latest) : [];
    const next = starts.find(s => s > now.minutes);
    const nextEls = next !== undefined ? items.filter((el, k) => starts[k] === next) : [];
    nowEls.forEach(el => { el.classList.add('is-now'); badge(el, 'Happening now'); });
    nextEls.forEach(el => { el.classList.add('is-next'); badge(el, 'Up next'); });
    if (nowEls.length) liveBody.append(eventLine('Now', nowEls));
    if (nextEls.length) liveBody.append(eventLine('Next', nextEls));
    const target = nowEls[0] || nextEls[0];
    d.querySelectorAll('#happening-now').forEach(el => el.removeAttribute('id'));
    if (target) target.id = 'happening-now';
  };

  const now0 = festivalNow();
  const startDay = now0 ? dayTabs.findIndex(t => t.dataset.date === now0.date) : -1;
  if (startDay >= 0) {
    const pill = d.createElement('span');
    pill.className = 'bro-day-today';
    pill.textContent = 'Today';
    dayTabs[startDay].appendChild(pill);
    selectDay(startDay);
  }
  markLive();
  window.setInterval(markLive, 60000);

  // ---------------------------------------------------------------- start
  // a link straight to a page (e.g. a future QR code to #menu) opens that page; the browser
  // itself scrolls to it, just below the bar that stays on screen
  route(location.hash, { animate: false, scroll: false, reveal: false });

  // ---------------------------------------------------------------- welcome intro
  const intro = d.querySelector('.bro-intro');
  const ready = () => { root.classList.add('bro-ready'); armReveals(current); };
  if (intro && root.classList.contains('bro-intro-on')) {
    try { sessionStorage.setItem('bro-intro', '1'); } catch (e) {}
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      d.removeEventListener('keydown', onKey);
      if (reduce) {
        root.classList.remove('bro-intro-on');
        intro.remove();
        ready();
        return;
      }
      intro.classList.add('is-out');
      root.classList.add('bro-entering');
      ready();
      window.setTimeout(() => {
        root.classList.remove('bro-intro-on');
        intro.remove();
        window.setTimeout(() => root.classList.remove('bro-entering'), 1200);
      }, 1000);
    };
    const onKey = ev => { if (['Enter', ' ', 'Escape'].includes(ev.key)) { ev.preventDefault(); end(); } };
    window.setTimeout(end, reduce ? 1600 : 3500);
    intro.addEventListener('click', end);
    d.addEventListener('keydown', onKey);
  } else {
    if (intro) intro.remove();
    ready();
  }
})();
