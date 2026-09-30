(function () {
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
  var html = document.documentElement;
  var btns = document.querySelectorAll('.size-ctl button');
  function mark(size) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === size)); });
  }
  mark(html.dataset.size || 'm');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      html.dataset.size = b.dataset.size;
      mark(b.dataset.size);
      try { localStorage.setItem('ym-size', b.dataset.size); } catch (e) {}
    });
  });
})();
