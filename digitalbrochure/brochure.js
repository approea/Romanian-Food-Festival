// Digital brochure: the opening "Welcome", five pages behind the red buttons,
// the welcome film, and "today at the festival" (Texas time) on the schedule.
// Runs after ../app.js, which already handles the menu, the video bands,
// the day tabs of the schedule and the site's reveal animations.
(() => {
  window.broReady = true;
  const d = document;
  const root = d.documentElement;
  root.classList.add('bro-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const small = window.matchMedia('(max-width: 767px)').matches;
  const panels = Array.from(d.querySelectorAll('.bro-panel'));
  const ids = panels.map(p => p.id);
  const tabLinks = Array.from(d.querySelectorAll('.bro-tab'));
  const bar = d.querySelector('.bro-bar');
  const BASE_TITLE = d.title;
  let current = null;

  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}

  const jumpTo = y => {
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, y));
    root.style.scrollBehavior = prev;
  };
  // where the red bar sits in the page (right under the site header)
  const barTop = () => (bar ? parseFloat(getComputedStyle(bar).marginTop) || 0 : 0);
  const make = (tag, cls, text) => {
    const el = d.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  };

  // ---------------------------------------------------------------- fade-up on scroll
  const revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }) : null;
  d.querySelectorAll('.bro-r').forEach(el => (revealIO ? revealIO.observe(el) : el.classList.add('is-in')));

  // ---------------------------------------------------------------- welcome film
  const hero = d.querySelector('.bro-hero');
  const heroMedia = hero && hero.querySelector('.bro-hero-media');
  const heroVideo = hero && hero.querySelector('.bro-hero-video');
  const filmAllowed = !reduce && !saveData;
  let heroInView = true;
  const playHero = () => {
    if (!heroVideo || !filmAllowed || !heroInView || !current || current.id !== 'welcome') return;
    if (!heroVideo.dataset.loaded) {
      heroVideo.src = (small && heroVideo.dataset.srcMobile) || heroVideo.dataset.src;
      heroVideo.dataset.loaded = '1';
    }
    heroVideo.muted = true;
    const p = heroVideo.play();
    if (p && p.catch) p.catch(() => {});
  };
  const pauseHero = () => { if (heroVideo && !heroVideo.paused) heroVideo.pause(); };
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));
    heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-playing'));
  }
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        heroInView = en.isIntersecting;
        if (heroInView) playHero(); else pauseHero();
      });
    }).observe(hero);
  }
  // the same slow drift as the film on the home page
  if (heroMedia && !reduce) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!current || current.id !== 'welcome') return;
        const y = Math.min(window.scrollY, hero.offsetHeight);
        heroMedia.style.transform = y > 0 ? `scale(${(1 + y / 6000).toFixed(4)}) translateY(${(y / 18).toFixed(1)}px)` : '';
      });
    }, { passive: true });
  }

  // ---------------------------------------------------------------- pages
  const show = (id, opts = {}) => {
    const panel = d.getElementById(id);
    if (!panel || !ids.includes(id)) return;
    const changed = panel !== current;
    root.setAttribute('data-tab', id);
    tabLinks.forEach(a => {
      if (a.dataset.tab === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    panels.forEach(p => p.classList.toggle('is-active', p === panel));
    if (changed) {
      current = panel;
      d.title = id === 'welcome' ? BASE_TITLE : `${panel.dataset.title} · ${BASE_TITLE}`;
      panel.classList.remove('is-entering');
      if (opts.animate !== false && !reduce) {
        void panel.offsetWidth;   // restart the entrance
        panel.classList.add('is-entering');
      }
    }
    if (id === 'welcome') playHero(); else pauseHero();
    if (opts.scroll !== false) {
      // like opening a new page: the film from the very top; the other pages right under the red buttons
      if (id === 'welcome') jumpTo(0);
      else if (window.scrollY > barTop()) jumpTo(barTop());
    }
    if (opts.focus) {
      const h = panel.querySelector('[tabindex="-1"]');
      if (h) { try { h.focus({ preventScroll: true }); } catch (e) {} }
    }
  };
  const route = (hash, opts = {}) => {
    let id = '';
    try { id = decodeURIComponent((hash || '').replace(/^#/, '')); } catch (e) {}
    if (!id || ids.includes(id)) return show(id || 'welcome', opts);
    const el = d.getElementById(id);
    const owner = el && el.closest('.bro-panel');
    if (!owner) return show('welcome', opts);
    // a link to something inside a page (a day of the schedule, a menu section)
    show(owner.id, Object.assign({}, opts, { scroll: false }));
    if (el.classList.contains('schedule-panel')) {
      const t = d.querySelector(`.schedule-tab[data-target="${id}"]`);
      if (t) t.click();
    }
    requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  };
  d.addEventListener('click', ev => {
    const a = ev.target.closest && ev.target.closest('a[data-tab]');
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const id = a.dataset.tab;
    if (!ids.includes(id)) return;
    ev.preventDefault();
    if (location.hash !== `#${id}`) history.pushState({ tab: id }, '', `#${id}`);
    show(id, { focus: true });
    if (a.hasAttribute('data-now')) {
      // from "today at the festival": straight to what is on right now
      const n = d.getElementById('happening-now');
      if (n) requestAnimationFrame(() => n.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }));
    }
  });
  window.addEventListener('popstate', () => route(location.hash));
  window.addEventListener('hashchange', () => route(location.hash));

  // at the end of a page the same buttons are already on screen: the top bar steps aside
  const endbar = d.querySelector('.bro-endbar');
  if (bar && endbar && 'IntersectionObserver' in window) {
    let endSeen = false;
    const sync = () => root.classList.toggle('bro-bar-away', endSeen && window.scrollY > barTop() + 4);
    new IntersectionObserver(entries => { endSeen = entries[entries.length - 1].isIntersecting; sync(); }).observe(endbar);
    window.addEventListener('scroll', sync, { passive: true });
  }

  // ---------------------------------------------------------------- festival time (Texas)
  const OPENING = Date.UTC(2026, 9, 23, 22, 30);   // Friday, October 23, 5:30 PM in Colleyville (UTC-5)
  const CLOSED = Date.UTC(2026, 9, 25, 23, 0);     // Sunday, October 25, 6:00 PM
  const DAY_NAMES = { '2026-10-23': 'Friday, October 23', '2026-10-24': 'Saturday, October 24', '2026-10-25': 'Sunday, October 25' };
  // ?now=2026-10-24T14:10 previews the page as it will look at that moment of the festival
  const preview = (() => {
    const m = /[?&]now=(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(location.search);
    return m ? { date: `${m[1]}-${m[2]}-${m[3]}`, minutes: +m[4] * 60 + +m[5], ms: Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 5, +m[5]) } : null;
  })();
  const clock = () => {
    if (preview) return preview;
    try {
      const p = {};
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
      return { date: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour % 24) * 60 + +p.minute, ms: Date.now() };
    } catch (e) { return null; }
  };
  const daysBetween = (a, b) => {
    const t = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return Math.round((t(b) - t(a)) / 864e5);
  };
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

  // ---------------------------------------------------------------- schedule
  const dayTabs = Array.from(d.querySelectorAll('.schedule-tab[data-date]'));
  const dayPanel = t => d.getElementById(t.dataset.target);
  const rowsOf = t => Array.from(dayPanel(t).querySelectorAll('.schedule-row[data-start]'));
  const timeOf = r => r.querySelector('.schedule-time').textContent.trim();
  const titleOf = r => r.querySelector('.schedule-title').textContent.trim();
  d.querySelectorAll('.schedule-panel').forEach(p => {
    p.querySelectorAll('.schedule-row').forEach((r, i) => r.style.setProperty('--i', Math.min(i, 14)));
  });

  const live = d.querySelector('.bro-live');
  const kicker = live && live.querySelector('.bro-live-kicker');
  const body = live && live.querySelector('.bro-live-body');
  const link = live && live.querySelector('.bro-live-link');
  const linkText = live && live.querySelector('.bro-live-link-text');
  const flag = (row, cls, text) => {
    row.classList.add(cls);
    const b = row.querySelector('.schedule-body');
    if (b) b.insertBefore(make('span', 'bro-flag', text), b.firstChild);
  };
  // what the band should say right now; `key` changes only when the message does
  const stateAt = now => {
    const ti = dayTabs.findIndex(t => t.dataset.date === now.date);
    const thanks = { key: 'thanks', kicker: 'Thank you', link: '',
      nodes: () => [make('p', 'bro-live-title', 'Thank you for celebrating with us.'),
                    make('p', 'bro-live-note', 'Mulțumim! We hope to see you again next year.')] };
    if (ti < 0) {
      if (now.ms >= OPENING) return thanks;
      const days = daysBetween(now.date, '2026-10-23');
      return { key: `count${days}`, kicker: days === 1 ? 'The festival opens' : 'The festival opens in', link: 'See the schedule',
        nodes: () => {
          const big = make('p', 'visit-info-dates', days === 1 ? 'Tomorrow' : `${days} days`);
          big.append(make('span', null, 'Friday, October 23 · 5:30 PM'));
          return [big];
        } };
    }
    const rows = rowsOf(dayTabs[ti]);
    const starts = rows.map(r => toMin(r.dataset.start));
    const dayTitle = () => make('p', 'bro-live-title', DAY_NAMES[now.date] || '');
    if (now.minutes >= starts[starts.length - 1]) {
      if (now.ms >= CLOSED) return thanks;
      const next = dayTabs[ti + 1];
      const reopen = next && rowsOf(next).find(r => /re-?opens/i.test(titleOf(r)));
      return { key: `done${ti}`, kicker: 'Today at the festival', link: 'See the schedule',
        nodes: () => [dayTitle(), make('p', 'bro-live-note', 'That’s all for today—thank you for spending the evening with us!' +
          (reopen ? ` The festival re-opens tomorrow at ${timeOf(reopen)}.` : ''))] };
    }
    let latest = -1;
    starts.forEach(s => { if (s <= now.minutes) latest = Math.max(latest, s); });
    const nextStart = starts.find(s => s > now.minutes);
    const nowRows = latest >= 0 ? rows.filter((r, k) => starts[k] === latest) : [];
    const nextRows = nextStart === undefined ? [] : rows.filter((r, k) => starts[k] === nextStart);
    return { key: `day${ti}-${latest}-${nextStart}`, kicker: 'Today at the festival', link: 'Today’s full schedule', nowRows, nextRows,
      nodes: () => {
        const grid = make('div', 'bro-live-rows' + (nowRows.length && nextRows.length ? '' : ' is-single'));
        const card = (label, rs, isLive) => {
          const c = make('div', 'bro-now');
          c.append(make('p', 'bro-now-label' + (isLive ? ' is-live' : ''), label),
                   make('p', 'bro-now-time', timeOf(rs[0])),
                   make('p', 'bro-now-title', rs.map(titleOf).join(' · ')));
          return c;
        };
        if (nowRows.length) grid.append(card('Happening now', nowRows, true));
        if (nextRows.length) grid.append(card('Up next', nextRows, false));
        return [dayTitle(), grid];
      } };
  };
  let lastKey = null;
  const markLive = () => {
    if (!live || !dayTabs.length) return;
    const now = clock();
    const st = now && stateAt(now);
    if (!st) { live.hidden = true; return; }
    if (st.key === lastKey) return;
    d.querySelectorAll('.schedule-row.is-now, .schedule-row.is-next').forEach(r => r.classList.remove('is-now', 'is-next'));
    d.querySelectorAll('.bro-flag').forEach(f => f.remove());
    d.querySelectorAll('#happening-now').forEach(x => x.removeAttribute('id'));
    (st.nowRows || []).forEach(r => flag(r, 'is-now', 'Happening now'));
    (st.nextRows || []).forEach(r => flag(r, 'is-next', 'Up next'));
    const target = (st.nowRows || [])[0] || (st.nextRows || [])[0];
    if (target) target.id = 'happening-now';
    kicker.textContent = st.kicker;
    body.textContent = '';
    st.nodes().forEach(n => body.append(n));
    link.hidden = !st.link;
    linkText.textContent = st.link || '';
    live.hidden = false;
    // the first message arrives with the page; later changes are read out by screen readers
    if (lastKey !== null) live.setAttribute('aria-live', 'polite');
    lastKey = st.key;
  };

  // on a festival day the schedule opens on today
  const now0 = clock();
  const today = now0 ? dayTabs.findIndex(t => t.dataset.date === now0.date) : -1;
  if (today >= 0) {
    dayTabs[today].append(make('span', 'tab-today', 'Today'));
    dayTabs[today].click();
  }
  markLive();
  window.setInterval(markLive, 30000);

  // ---------------------------------------------------------------- start
  route(location.hash, { animate: false, scroll: false });

  // ---------------------------------------------------------------- opening "Welcome"
  const intro = d.querySelector('.bro-intro');
  if (intro && root.classList.contains('bro-intro-on')) {
    try { sessionStorage.setItem('bro-intro', '1'); } catch (e) {}
    let done = false;
    const kinds = ['click', 'keydown', 'wheel', 'touchmove'];
    const end = () => {
      if (done) return;
      done = true;
      kinds.forEach(k => window.removeEventListener(k, end, true));
      const finish = () => {
        root.classList.remove('bro-intro-on', 'bro-intro-out');
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      };
      if (reduce) { finish(); return; }
      root.classList.add('bro-intro-out');
      // the title rises in as the words fade away
      const line = hero && hero.querySelector('.line-reveal');
      if (line) { line.style.animation = 'none'; void line.offsetWidth; line.style.animation = ''; }
      window.setTimeout(finish, 950);
    };
    kinds.forEach(k => window.addEventListener(k, end, { capture: true, passive: true }));
    window.setTimeout(end, reduce ? 2200 : 4300);
  } else if (intro && intro.parentNode) {
    intro.parentNode.removeChild(intro);
  }
})();
