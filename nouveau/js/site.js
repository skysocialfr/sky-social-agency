/* Sky Social — comportements communs à toutes les pages.
   - panneau de menu (≤ 1100 px)
   - vidéos en boucle : lecture seulement à l'écran, jamais si « réduire les animations »
     ou économie de données, bouton pause/lecture accessible */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var light = !!conn.saveData || /(^|-)2g$|^3g$/.test(conn.effectiveType || '');

  /* ---------- Menu ---------- */
  var openBtn = document.querySelector('.nav-menu');
  var panel = document.getElementById('menu-panel');
  if (openBtn && panel) {
    var closeBtn = panel.querySelector('[data-menu-close]');
    var open = function () {
      panel.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-open');
      var first = panel.querySelector('nav a');
      if (first) first.focus();
    };
    var close = function () {
      panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
      openBtn.focus();
    };
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    panel.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ---------- Vidéos en boucle ---------- */
  var videos = document.querySelectorAll('video[data-loop]');
  videos.forEach(function (v) {
    var btn = document.querySelector('[data-video-toggle="' + v.id + '"]');
    var userPaused = reduce || light;
    var setBtn = function () {
      if (!btn) return;
      var paused = v.paused;
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.setAttribute('aria-label', paused ? btn.dataset.labelPlay : btn.dataset.labelPause);
      var lbl = btn.querySelector('.lbl');
      if (lbl) lbl.textContent = paused ? 'Lecture' : 'Pause';
    };
    var load = function () {
      if (v.dataset.src && !v.src) { v.src = v.dataset.src; }
    };
    var play = function () {
      load();
      var p = v.play();
      if (p && p.catch) p.catch(function () { setBtn(); });
    };
    v.addEventListener('play', setBtn);
    v.addEventListener('pause', setBtn);
    if (btn) {
      btn.addEventListener('click', function () {
        if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !userPaused && getComputedStyle(v).display !== 'none') play();
          else if (!en.isIntersecting && !v.paused) v.pause();
        });
      }, { threshold: 0.25 }).observe(v);
    } else if (!userPaused) {
      play();
    }
    setBtn();
  });
})();
