(function () {
  var html = document.documentElement;
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* メニュー */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('gnav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* 文字サイズ */
  var sizeBtns = $('.size-ctl button');
  function mark(size) { sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === size)); }); }
  mark(html.dataset.size || 'm');
  sizeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      html.dataset.size = b.dataset.size;
      mark(b.dataset.size);
      try { localStorage.setItem('ym-size', b.dataset.size); } catch (e) {}
    });
  });

  /* ここから先は動き。「視差効果を減らす」設定の人には一切かけない */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  html.classList.add('anim');

  /* 見出しの一文字ずつ表示(読み上げには元の文を使う) */
  $('.split-text').forEach(function (h) {
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ''));
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          Array.from(n.textContent).forEach(function (c) {
            if (/\s/.test(c)) return;
            var s = document.createElement('span');
            s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', i++); s.textContent = c; f.appendChild(s);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(h);
  });

  /* スクロールで現れる */
  $('.reveal-list > li').forEach(function (li, i) { li.classList.add('reveal'); li.style.setProperty('--d', (i * 0.09) + 's'); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $('.reveal, .photo:not(.m), .path > li').forEach(function (el) { io.observe(el); });

  /* 道しるべの線の伸び + パララックス */
  var paths = $('[data-path]');
  var pars = $('[data-parallax]');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    paths.forEach(function (p) {
      var r = p.getBoundingClientRect();
      var prog = (vh * 0.7 - r.top) / r.height;
      p.style.setProperty('--p', Math.max(0, Math.min(1, prog)).toFixed(3));
    });
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var off = (r.top + r.height / 2 - vh / 2) * -0.12;
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  /* 写真の流れる帯:複製して途切れなく。止めるボタン付き */
  $('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee-track');
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $('img', c).forEach(function (img) { img.alt = ''; });
      $('figcaption', c).forEach(function (f) { f.remove(); });
      track.appendChild(c);
    });
    var b = m.parentNode.querySelector('.marquee-btn');
    if (b) b.addEventListener('click', function () {
      var p = m.classList.toggle('paused');
      b.setAttribute('aria-pressed', String(p));
      b.textContent = p ? '動かす' : '動きを止める';
    });
  });
})();
