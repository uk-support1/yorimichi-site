(function () {
  var html = document.documentElement;
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- メニュー ---------- */
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

  /* ---------- 文字サイズ ---------- */
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

  /* ---------- 動きの ON/OFF ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mbtn = document.querySelector('.motion-btn');
  var startedOff = html.dataset.motion === 'off';
  function paintMotion() {
    var off = html.dataset.motion === 'off';
    if (!mbtn) return;
    mbtn.setAttribute('aria-pressed', String(off));
    mbtn.textContent = off ? '動き:切' : '動き:入';
  }
  if (mbtn) {
    if (reduce) { mbtn.hidden = true; }
    paintMotion();
    mbtn.addEventListener('click', function () {
      var off = html.dataset.motion !== 'off';
      if (off) html.dataset.motion = 'off'; else html.removeAttribute('data-motion');
      try { localStorage.setItem('ym-motion', off ? 'off' : 'on'); } catch (e) {}
      paintMotion();
      if (!off && startedOff) location.reload(); /* 最初から切だった場合は、演出を読み込み直す */
    });
  }

  /* ---------- ここから先は動き。OS設定または「切」の人には一切かけない ---------- */
  if (reduce || startedOff || !('IntersectionObserver' in window)) return;
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
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $('.reveal').forEach(function (el) { io.observe(el); });

  /* パララックス */
  var pars = $('[data-parallax]');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    /* IntersectionObserver の取りこぼし対策(表示領域に入ったものは必ず表示する) */
    $('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add('in');
    });
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var off = (r.top + r.height / 2 - vh / 2) * -0.14;
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();
})();
