/* Ortak hareket katmanı. <script src=".../motion.js" defer data-mode="site|tool|game"> ile yüklenir.
   Hareketi azalt açıksa hiçbir şey yapmaz; sayfa eskisi gibi çalışır. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const mode = (document.currentScript && document.currentScript.dataset.mode) || 'site';
  root.classList.add('fx');
  if (mode === 'game') { root.classList.add('fx-game'); return; } // oyunlarda yalnızca üst çubuk girişi
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const add = (tag, cls) => { const e = document.createElement(tag); e.className = cls; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; };

  /* ---- Kaydırma çizgisi ve paralaks noktalı arka plan ---- */
  const bar = add('div', 'fx-progress'), dots = add('div', 'fx-dots');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY, h = root.scrollHeight - innerHeight;
      root.style.setProperty('--fx-y', y);
      bar.style.setProperty('--fx-p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- Kaydırınca beliren öğeler ---- */
  const RV = mode === 'site'
    ? '.hero .wrap > *, .sec-head, .filters, .lvlbar, .tool, .about-text, .about-photo, .contact > div, .apath, .more'
    : 'header, .band, .panel, .boards';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const seen = new WeakSet(), pending = [];
  const flush = () => { void document.body.offsetHeight; setTimeout(() => pending.splice(0).forEach(el => { el.classList.remove('rv-init'); io.observe(el); }), 40); };
  const watch = scope => {
    (scope || document).querySelectorAll(RV).forEach(el => {
      if (seen.has(el)) return; seen.add(el);
      const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty('--rd', Math.min(sib, 6) * 70 + 'ms');
      el.classList.add('rv', 'rv-init'); // önce geçişsiz gizle: görünen öğe 1→0→1 titremesin
      pending.push(el);
    });
    if (pending.length) flush();
  };
  watch();
  // yedek: bir şey hiç gözlenemezse 2,5 sn sonra görünür yap
  setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }), 2500);
  const hero = document.querySelector('.hero'); if (hero) requestAnimationFrame(() => hero.classList.add('in-view'));
  // sonradan çizilen bölümler (öğrenme yolu vb.)
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches(RV)) watch(n.parentElement); } }))).observe(document.body, { childList: true, subtree: true });

  if (!fine) return; // dokunmatik cihazlarda kart eğimi ve imleç yok

  /* ---- Kart ışığı ve eğimi ---- */
  const CARD = mode === 'site' ? '.tool, .post, .alevel' : '.panel';
  const tilt = mode === 'site';
  let active = null;
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest(CARD);
    if (active && active !== c) { active.classList.remove('fx-hover'); active.style.removeProperty('--rx'); active.style.removeProperty('--ry'); }
    active = c;
    if (!c) return;
    if (!c.classList.contains('fx-card')) { c.classList.add('fx-card'); if (!tilt || c.matches('.alevel, .panel')) c.classList.add('fx-flat'); }
    const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    c.classList.add('fx-hover');
    c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
    if (tilt && !c.classList.contains('fx-flat')) { c.style.setProperty('--ry', ((x / r.width - 0.5) * 6).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-(y / r.height - 0.5) * 5).toFixed(2) + 'deg'); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (active) { active.classList.remove('fx-hover'); active.style.removeProperty('--rx'); active.style.removeProperty('--ry'); active = null; } });

  /* ---- Mıknatıs düğme (ana sayfadaki birincil çağrı düğmeleri) ---- */
  document.querySelectorAll('.hero .btn').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px'; });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });

  /* ---- İmleç halkası ---- */
  root.classList.add('fx-cur');
  const ring = add('div', 'fx-cursor'), dot = add('div', 'fx-cursor-dot');
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY; root.classList.add('fx-on');
    const t = e.target.closest ? e.target : null;
    root.classList.toggle('fx-link', !!(t && t.closest('a, button, summary, [role=button], [role=tab], input, label, .post.has-detail, .post.has-link')));
    root.classList.toggle('fx-hide', !!(t && t.closest('canvas, dialog, input[type=search], textarea')));
  }, { passive: true });
  addEventListener('pointerdown', () => root.classList.add('fx-down'));
  addEventListener('pointerup', () => root.classList.remove('fx-down'));
  document.addEventListener('pointerleave', () => root.classList.remove('fx-on'));
  (function follow() {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    requestAnimationFrame(follow);
  })();
})();
