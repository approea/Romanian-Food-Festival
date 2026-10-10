// Digital brochure: day tabs, "today" and "happening now" in festival time, section nav highlight.
(() => {
  const TZ = 'America/Chicago';

  // Current date and minutes past midnight in Colleyville, TX
  const festivalNow = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      const p = {};
      parts.forEach(x => { p[x.type] = x.value; });
      return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
    } catch (e) {
      return null;
    }
  };

  // ---------- day tabs ----------
  const tabs = Array.from(document.querySelectorAll('.bro-day-tab'));
  const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
  const select = (i, focus) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(j, true); }
    });
  });

  // ---------- today / happening now ----------
  const toMinutes = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const clearLive = () => {
    document.querySelectorAll('.bro-event.is-now,.bro-event.is-next').forEach(el => el.classList.remove('is-now', 'is-next'));
    document.querySelectorAll('.bro-live').forEach(el => el.remove());
  };
  const badge = (el, text) => {
    const b = document.createElement('span');
    b.className = 'bro-live';
    b.textContent = text;
    const body = el.querySelector('div');
    if (body) body.insertBefore(b, body.firstChild);
  };
  // Hero strip: what is on now and what comes next, linking to the schedule
  const strip = document.querySelector('.bro-now');
  const stripRow = (label, live, els) => {
    const row = document.createElement('span');
    row.className = 'bro-now-row';
    const l = document.createElement('span');
    l.className = 'bro-now-label' + (live ? ' bro-now-label--live' : '');
    l.textContent = label;
    const t = document.createElement('span');
    t.className = 'bro-now-time';
    t.textContent = els[0].querySelector('time').textContent;
    const w = document.createElement('span');
    w.className = 'bro-now-title';
    w.textContent = els.map(el => el.querySelector('.bro-event-title').textContent).join(' · ');
    row.append(l, t, w);
    return row;
  };
  const renderStrip = (nowEls, nextEls) => {
    const old = document.getElementById('happening-now');
    if (old) old.removeAttribute('id');
    if (!strip) return;
    strip.textContent = '';
    if (nowEls.length) strip.appendChild(stripRow('Now', true, nowEls));
    if (nextEls.length) strip.appendChild(stripRow('Next', false, nextEls));
    strip.hidden = !(nowEls.length || nextEls.length);
    // the strip jumps straight to that moment in today's list
    const target = nowEls[0] || nextEls[0];
    if (target) {
      target.id = 'happening-now';
      strip.setAttribute('href', '#happening-now');
    } else {
      strip.setAttribute('href', '#schedule');
    }
  };

  const markLive = () => {
    clearLive();
    renderStrip([], []);
    const now = festivalNow();
    if (!now) return;
    const ti = tabs.findIndex(t => t.dataset.date === now.date);
    if (ti < 0 || !panels[ti]) return;
    const items = Array.from(panels[ti].querySelectorAll('.bro-event[data-start]'));
    if (!items.length) return;
    const starts = items.map(el => toMinutes(el.dataset.start));
    const closing = starts[starts.length - 1];
    if (now.minutes >= closing) return;               // the day is over
    let latest = -1;
    starts.forEach(s => { if (s <= now.minutes) latest = Math.max(latest, s); });
    const nowEls = latest >= 0 ? items.filter((el, k) => starts[k] === latest) : [];
    const next = starts.find(s => s > now.minutes);
    const nextEls = next !== undefined ? items.filter((el, k) => starts[k] === next) : [];
    nowEls.forEach(el => { el.classList.add('is-now'); badge(el, 'Happening now'); });
    nextEls.forEach(el => { el.classList.add('is-next'); badge(el, 'Up next'); });
    renderStrip(nowEls, nextEls);
  };

  const todayIndex = (() => {
    const now = festivalNow();
    return now ? tabs.findIndex(t => t.dataset.date === now.date) : -1;
  })();
  if (todayIndex >= 0) {
    select(todayIndex);
    const pill = document.createElement('span');
    pill.className = 'bro-day-today';
    pill.textContent = 'Today';
    tabs[todayIndex].appendChild(pill);
    const heroBtn = document.querySelector('[data-today-label]');
    if (heroBtn) heroBtn.textContent = heroBtn.dataset.todayLabel;
    markLive();
    window.setInterval(markLive, 60000);
  }

  // ---------- section nav highlight ----------
  const nav = document.querySelector('.bro-nav-track');
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const setActive = id => {
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) {
        a.setAttribute('aria-current', 'true');
        // keep the active chip in view on narrow screens (centred when the bar scrolls)
        if (nav.scrollWidth > nav.clientWidth) {
          const tr = nav.getBoundingClientRect(), ar = a.getBoundingClientRect();
          const left = nav.scrollLeft + (ar.left - tr.left) - (tr.width - ar.width) / 2;
          nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  };
  if ('IntersectionObserver' in window && sections.length) {
    const hero = document.querySelector('.bro-hero');
    const visible = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, bestRatio = 0;
      sections.forEach(s => { const r = visible.get(s) || 0; if (r > bestRatio) { bestRatio = r; best = s.id; } });
      if (best) setActive(best);
      else if (hero && visible.get(hero)) setActive(null);   // back at the top
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] });
    sections.forEach(s => io.observe(s));
    if (hero) io.observe(hero);
  }
})();
