/* Sky Social — effets d'animation (maquette « Labo d'animations »).
   Chaque effet est activé par un attribut data-* et ne tourne que lorsque
   son bloc est à l'écran. Rien ne s'anime si l'utilisateur a demandé moins
   de mouvement ; les effets à la souris sont ignorés sur écran tactile.

   data-parallax   effet 01 : parallaxe à la souris (--x, --y entre -1 et 1)
   data-spotlight  effet 02 : projecteur duotone (--sx, --sy entre 0 et 1)
   data-words      phrase révélée mot à mot au défilement
   data-grow       cadre qui s'agrandit au défilement (--vp)
   data-hpin       défilement horizontal épinglé (réalisations)
   data-bubble     bulle « Voir » qui suit la souris sur les cartes
   data-svc        liste des expertises avec image collée */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var lerp = function (a, b, f) { return a + (b - a) * f; };

  /* ---------- Expertises : une ligne ouverte, image associée (aussi sans animation) ---------- */
  document.querySelectorAll('[data-svc]').forEach(function (root) {
    var rows = Array.prototype.slice.call(root.querySelectorAll('.svc-row'));
    var imgs = Array.prototype.slice.call(root.querySelectorAll('.svc-img'));
    var count = root.querySelector('.svc-count');
    var set = function (i) {
      rows.forEach(function (r, k) {
        var on = k === i;
        r.classList.toggle('is-on', on);
        r.querySelector('.svc-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      if (count) count.textContent = '0' + (i + 1) + ' / 0' + rows.length;
    };
    rows.forEach(function (r, i) {
      var b = r.querySelector('.svc-btn');
      b.addEventListener('click', function () { set(i); });
      b.addEventListener('focus', function () { set(i); });
      if (fine) b.addEventListener('mouseenter', function () { set(i); });
    });
    set(0);
  });

  /* ---------- Mots révélés ---------- */
  var wordBlocks = [];
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var lines = el.querySelectorAll('.line');
    var spans = [];
    lines.forEach(function (line) {
      var parts = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      parts.forEach(function (t, i) {
        var s = document.createElement('span');
        s.className = 'w w-dim';
        s.textContent = i < parts.length - 1 ? t + ' ' : t;
        if (t === el.dataset.words) s.dataset.key = '1';
        line.appendChild(s);
        spans.push(s);
      });
    });
    wordBlocks.push({ el: el, spans: spans, lit: -1 });
  });
  var paintWords = function (b, q) {
    var lit = Math.round(q * b.spans.length);
    if (lit === b.lit) return;
    b.lit = lit;
    b.spans.forEach(function (s, i) {
      var on = i < lit;
      s.className = 'w ' + (on ? (s.dataset.key ? 'w-key' : 'w-lit') : 'w-dim');
    });
  };
  if (reduce) wordBlocks.forEach(function (b) { paintWords(b, 1); });

  if (reduce) return;

  /* ---------- Défilement : mots, cadre du film, réalisations épinglées ---------- */
  var grows = Array.prototype.slice.call(document.querySelectorAll('[data-grow]'));
  var pins = [];
  document.querySelectorAll('[data-hpin]').forEach(function (w) {
    var list = w.querySelector('.work-list');
    var stick = w.querySelector('.work-stick');
    var p = { w: w, list: list, stick: stick, dist: 0, on: false };
    var measure = function () {
      var vh = window.innerHeight;
      p.on = vh >= 700 && vh < 1400 && window.innerWidth >= 900;
      w.classList.toggle('work-pin', p.on);
      if (!p.on) { list.style.removeProperty('--wx'); return; }
      p.dist = Math.max(0, list.offsetWidth - stick.clientWidth);
      w.style.setProperty('--pinh', String(vh + p.dist));
      w.style.setProperty('--vhpx', String(vh));
    };
    p.measure = measure;
    measure();
    pins.push(p);
  });
  var sraf = 0;
  var onScroll = function () {
    if (sraf) return;
    sraf = requestAnimationFrame(function () {
      sraf = 0;
      var vh = window.innerHeight || 800;
      wordBlocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        paintWords(b, Math.round(clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3)) * 32) / 32);
      });
      grows.forEach(function (g) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--vp', clamp((vh - r.top) / (vh * 0.9)).toFixed(3));
      });
      pins.forEach(function (p) {
        if (!p.on) return;
        var r = p.w.getBoundingClientRect();
        var span = r.height - vh;
        var k = span > 0 ? clamp(-r.top / span) : 0;
        p.list.style.setProperty('--wx', (k * p.dist).toFixed(1));
      });
    });
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { pins.forEach(function (p) { p.measure(); }); onScroll(); });
  onScroll();

  /* ---------- Bulle « Voir » ---------- */
  if (fine) {
    document.querySelectorAll('[data-bubble]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--bx', Math.round(e.clientX - r.left));
        card.style.setProperty('--by', Math.round(e.clientY - r.top));
      });
    });
  }

  /* ---------- Effets 01 et 02 : boucle lissée, seulement à l'écran ---------- */
  if (!fine) return;
  var fx = [];
  var add = function (el, kind) {
    var f = { el: el, kind: kind, hover: false, visible: false,
      cur: kind === 'parallax' ? { x: 0, y: 0 } : { x: 0.5, y: 0.5 },
      tgt: kind === 'parallax' ? { x: 0, y: 0 } : { x: 0.5, y: 0.5 } };
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / (r.width || 1);
      var y = (e.clientY - r.top) / (r.height || 1);
      f.hover = true;
      f.tgt = kind === 'parallax' ? { x: x * 2 - 1, y: y * 2 - 1 } : { x: x, y: y };
      wake();
    });
    el.addEventListener('mouseleave', function () { f.hover = false; });
    fx.push(f);
  };
  document.querySelectorAll('[data-parallax]').forEach(function (el) { add(el, 'parallax'); });
  document.querySelectorAll('[data-spotlight]').forEach(function (el) { add(el, 'spotlight'); });
  if (!fx.length) return;

  var raf = 0;
  var tick = function (now) {
    raf = 0;
    var t = now / 1000;
    var any = false;
    fx.forEach(function (f) {
      if (!f.visible) return;
      any = true;
      var goal = f.hover ? f.tgt : (f.kind === 'parallax'
        ? { x: Math.sin(t * 0.45) * 0.6, y: Math.sin(t * 0.31 + 1) * 0.4 }
        : { x: 0.5 + Math.sin(t * 0.55) * 0.33, y: 0.48 + Math.sin(t * 1.1) * 0.2 });
      var k = f.kind === 'parallax' ? 0.06 : 0.12;
      f.cur.x = lerp(f.cur.x, goal.x, k);
      f.cur.y = lerp(f.cur.y, goal.y, k);
      if (f.kind === 'parallax') {
        f.el.style.setProperty('--x', f.cur.x.toFixed(4));
        f.el.style.setProperty('--y', f.cur.y.toFixed(4));
      } else {
        f.el.style.setProperty('--sx', f.cur.x.toFixed(4));
        f.el.style.setProperty('--sy', f.cur.y.toFixed(4));
      }
    });
    if (any && !document.hidden) raf = requestAnimationFrame(tick);
  };
  var wake = function () { if (!raf) raf = requestAnimationFrame(tick); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        fx.forEach(function (f) { if (f.el === en.target) f.visible = en.isIntersecting; });
      });
      wake();
    }, { threshold: 0.05 });
    fx.forEach(function (f) { io.observe(f.el); });
  } else {
    fx.forEach(function (f) { f.visible = true; });
    wake();
  }
  document.addEventListener('visibilitychange', wake);
})();
