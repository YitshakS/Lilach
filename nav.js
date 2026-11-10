/* Lilach deck navigation: arrows on the screen edges, dots, keyboard and swipe.
   RTL: "next" is on the left side, "previous" on the right side. */
(function () {
  var pages = [
    { href: 'index.html',    title: 'פתיחה' },
    { href: '1.html',   title: 'מסלול הסדר' },
    { href: '2.html',  title: 'תוכנית הדסים' },
    { href: '3.html',   title: 'תוכנית קודקוד' },
    { href: '4.html', title: 'דף העצומה' },
    { href: '5.html',  title: 'תגובות הבנות' },
    { href: '6.html', title: 'הצעה: פיילוט' },
    { href: '7.html',      title: 'מה מבקשים' },
    { href: '8.html', title: 'לוח זמנים' }
  ];
  var file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  var cur = 0;
  pages.forEach(function (p, k) { if (p.href === file) cur = k; });

  function go(k) {
    if (k < 0 || k > pages.length - 1 || k === cur) return;
    location.href = pages[k].href;
  }

  var nav = document.createElement('div');
  nav.className = 'dn';
  nav.setAttribute('dir', 'rtl');

  function edge(side, label, target, glyph) {
    var a = document.createElement('a');
    a.className = 'dn-edge dn-' + side;
    a.setAttribute('aria-label', label);
    a.title = label;
    if (target >= 0 && target < pages.length) a.href = pages[target].href;
    else a.className += ' dn-off';
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + glyph + '"/></svg>';
    return a;
  }
  // right side = previous (chevron pointing right), left side = next (chevron pointing left)
  nav.appendChild(edge('prev', 'השקף הקודם', cur - 1, 'M9 4l8 8-8 8'));
  nav.appendChild(edge('next', 'השקף הבא', cur + 1, 'M15 4l-8 8 8 8'));

  var bar = document.createElement('div');
  bar.className = 'dn-bar';
  pages.forEach(function (p, k) {
    var d = document.createElement('a');
    d.href = p.href;
    d.className = 'dn-dot' + (k === cur ? ' dn-cur' : '');
    d.title = p.title;
    d.setAttribute('aria-label', (k + 1) + ': ' + p.title);
    bar.appendChild(d);
  });
  var count = document.createElement('span');
  count.className = 'dn-count';
  count.setAttribute('dir', 'ltr');
  count.textContent = (cur + 1) + ' / ' + pages.length;
  bar.appendChild(count);
  nav.appendChild(bar);
  document.body.appendChild(nav);

  // show on activity, hide after a moment of stillness
  var timer;
  function wake() {
    nav.classList.remove('dn-idle');
    clearTimeout(timer);
    timer = setTimeout(function () { nav.classList.add('dn-idle'); }, 2600);
  }
  ['mousemove', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, wake, { passive: true });
  });
  wake();

  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowLeft': case 'PageDown': case ' ': case 'Enter': go(cur + 1); e.preventDefault(); break;
      case 'ArrowRight': case 'PageUp': case 'Backspace': go(cur - 1); e.preventDefault(); break;
      case 'Home': go(0); break;
      case 'End': go(pages.length - 1); break;
      case 'f': case 'F':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        else document.exitFullscreen && document.exitFullscreen();
        break;
    }
  });

  // swipe: in RTL a swipe to the right turns to the next slide
  var sx = null, sy = null;
  window.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = sy = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // warm the cache for the neighbours
  [cur + 1, cur - 1].forEach(function (k) {
    if (k >= 0 && k < pages.length) {
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = pages[k].href;
      document.head.appendChild(l);
    }
  });
})();
