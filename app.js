
(() => {
  const body = document.body;
  const loader = document.querySelector('.site-loader');
  const loaderImg = document.querySelector('.loader-mark');
  if (loaderImg) {
    loaderImg.addEventListener('error', () => {
      loaderImg.style.display='none';
      const fallback=document.createElement('div');
      fallback.className='loader-fallback';
      loaderImg.parentNode.appendChild(fallback);
    }, {once:true});
    requestAnimationFrame(() => requestAnimationFrame(() => loaderImg.classList.add('is-active')));
  }

  const hideLoader = () => {
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('is-hidden');
      body.classList.remove('loading');
    }, 550);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, {once:true});
  setTimeout(hideLoader, 1800);

  document.querySelectorAll('.brand img,.section-mark').forEach(img => {
    img.addEventListener('error', () => {
      if (img.classList.contains('section-mark')) {
        const f=document.createElement('div'); f.className='section-mark-fallback';
        img.replaceWith(f);
      } else {
        const f=document.createElement('div'); f.className='brand-fallback'; f.textContent='RF';
        img.replaceWith(f);
      }
    }, {once:true});
  });

  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const closeMobile = () => mobileNav && mobileNav.classList.remove('open');
  if (mobileBtn && mobileNav) mobileBtn.addEventListener('click',()=>mobileNav.classList.add('open'));
  if (mobileClose) mobileClose.addEventListener('click',closeMobile);
  if (mobileNav) mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMobile));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.14,rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.reveal,.line-reveal').forEach(el=>observer.observe(el));

  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    if (window.matchMedia('(max-width:767px)').matches) {
      const mobileSrc = 'assets/hero-mobile.mp4';
      const source = heroVideo.querySelector('source');
      if (source) source.src = mobileSrc;
      heroVideo.load();
    }
    heroVideo.muted = true;
    heroVideo.setAttribute('playsinline','');
    heroVideo.play().catch(()=>{});
    const hero = document.querySelector('.hero');
    const header = document.querySelector('.site-header:not(.inner)');
    if (hero) {
      const onScroll = () => {
        const y = Math.min(window.scrollY, hero.offsetHeight);
        heroVideo.style.transform = `scale(${1 + y/6000}) translateY(${y/18}px)`;
        if (header) header.classList.toggle('scrolled', window.scrollY > hero.offsetHeight * 0.62);
      };
      window.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  } else {
    const header = document.querySelector('.site-header:not(.inner)');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
      window.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  }

  document.querySelectorAll('.schedule-tabs').forEach(tabset => {
    const tabs=[...tabset.querySelectorAll('.schedule-tab')];
    const panels=[...document.querySelectorAll('.schedule-panel')];
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      const panel=document.getElementById(tab.dataset.target);
      if(panel) panel.classList.add('active');
    }));
  });

  const signup = document.querySelector('.footer-signup');
  if (signup) {
    signup.addEventListener('submit', e => {
      e.preventDefault();
      const input=signup.querySelector('input');
      const btn=signup.querySelector('button');
      if(!input.value.trim()) return;
      btn.textContent='✓';
      input.value='';
      setTimeout(()=>btn.textContent='→',1200);
    });
  }
})();
