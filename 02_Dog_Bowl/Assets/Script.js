/* Pace Maze Bowl, rebuild. Sticky bar, spin wheel (no email), offer page bundles and promo. */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked: fine */ } }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Sticky bottom bar: shows after the hero ---------- */
  var bar = $('.bar'), hero = $('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('show', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(hero);
  }

  /* ---------- Spin wheel: spin, then straight to checkout (no email) ---------- */
  var modal = $('#wheel');
  if (modal) {
    var INK = '#0B1B4D';
    var prizes = [10, 15, 20, 10, 15, 25];
    var colors = ['#BFDBFE', '#FFFFFF', '#F59E0B', '#EC4899', '#FFFFFF', '#F59E0B'];
    var svg = $('svg', modal), seg = 360 / prizes.length, html = '';
    var pt = function (deg, r) { var a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    prizes.forEach(function (p, i) {
      var s = pt(i * seg, 96), e = pt((i + 1) * seg, 96), mid = i * seg + seg / 2, t = pt(mid, 64);
      html += '<path d="M100 100 L' + s[0] + ' ' + s[1] + ' A96 96 0 0 1 ' + e[0] + ' ' + e[1] + ' Z" fill="' + colors[i] + '" stroke="' + INK + '" stroke-width="1.5"/>';
      html += '<text x="' + t[0] + '" y="' + t[1] + '" fill="' + INK + '" font-family="Young Serif, Georgia, serif" font-weight="900" font-size="18" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (mid > 90 && mid < 270 ? mid + 180 : mid) + ' ' + t[0] + ' ' + t[1] + ')">' + p + '%</text>';
    });
    html += '<circle cx="100" cy="100" r="97" fill="none" stroke="' + INK + '" stroke-width="2"/><circle cx="100" cy="100" r="13" fill="' + INK + '"/>';
    svg.innerHTML = html;

    var shown = false;
    var open = function (force) {
      if (shown || (force !== true && store.get('paceWheelSeen'))) { return; }
      shown = true;
      store.set('paceWheelSeen', '1');
      modal.classList.add('open');
      $('.spin-btn', modal).focus();
    };
    var close = function () { modal.classList.remove('open'); };
    var show = function (name) {
      modal.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('show', s.classList.contains('step-' + name)); });
    };

    setTimeout(open, 15000);
    if (location.hash === '#spin') { open(true); } /* demo link: index.html#spin opens the wheel right away */
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) { open(); } });
    $('.close', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });

    $('.spin-btn', modal).addEventListener('click', function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Spinning...';
      var win = Math.floor(Math.random() * prizes.length);
      var stop = 360 * 6 + (360 - (win * seg + seg / 2)) + (Math.random() * 20 - 10);
      svg.style.transform = 'rotate(' + stop + 'deg)';
      var finished = false;
      var done = function () {
        if (finished) { return; }
        finished = true;
        var code = 'PACE' + prizes[win];
        $('.won', modal).textContent = prizes[win] + '% off';
        $('.code-text', modal).textContent = code;
        $('.code-link', modal).href = 'Offer.html?code=' + code;
        show('won');
      };
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { done(); } else { svg.addEventListener('transitionend', done, { once: true }); setTimeout(done, 4400); }
    });
  }

  /* ---------- Offer page ---------- */
  var offer = $('.offer');
  if (offer) {
    var CODES = { PACE10: 10, PACE15: 15, PACE20: 20, PACE25: 25 };
    var pct = 0;
    var money = function (n) { return '$' + n.toFixed(2); };
    var update = function () {
      var price = parseFloat($('input[name=bundle]:checked', offer).value);
      var off = Math.round(price * pct) / 100;
      $('.t-sub').textContent = money(price);
      $('.t-off').textContent = off ? '-' + money(off) : '$0.00';
      $('.t-total').textContent = money(price - off);
    };
    var apply = function (raw) {
      var c = (raw || '').trim().toUpperCase();
      if (CODES[c]) { pct = CODES[c]; $('.promo-msg').textContent = c + ' applied: ' + pct + '% off.'; }
      else if (c) { pct = 0; $('.promo-msg').textContent = 'That code is not valid.'; }
      update();
    };
    offer.querySelectorAll('input[name=bundle]').forEach(function (r) { r.addEventListener('change', update); });
    $('.promo button').addEventListener('click', function () { apply($('.promo input').value); });
    var fromUrl = new URLSearchParams(location.search).get('code');
    if (fromUrl) { $('.promo input').value = fromUrl.toUpperCase(); apply(fromUrl); } else { update(); }
    $('.checkout form').addEventListener('submit', function (e) { e.preventDefault(); $('.demo-msg').classList.add('show'); });
  }
})();


/* V3: the clock numbers count up while the bar fills (3 s, starts at 0.5 s like the bar) */
(function () {
  var el = document.querySelector('.clock .ticks span');
  if (!el) { return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = '0:30'; return; }
  var t0 = null;
  var f = function (ts) {
    if (t0 === null) { t0 = ts + 500; }
    var p = Math.min(1, Math.max(0, (ts - t0) / 3000));
    el.textContent = '0:' + ('0' + Math.round(p * 30)).slice(-2);
    if (p < 1) { requestAnimationFrame(f); }
  };
  requestAnimationFrame(f);
})();

/* V4: rosettes (made here so the page ships no extra images) */
(function () {
  var build = function (label) {
    var s = '<svg class="rosette" viewBox="0 0 100 132" aria-hidden="true">';
    s += '<path class="tail" d="M34 76 L24 128 L40 119 L50 129 L53 80Z"/><path class="tail" d="M66 76 L76 128 L60 119 L50 129 L47 80Z"/>';
    for (var i = 0; i < 18; i++) {
      var a = i / 18 * Math.PI * 2;
      s += '<circle class="sc" cx="' + (50 + 37 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 37 * Math.sin(a)).toFixed(1) + '" r="10"/>';
    }
    s += '<circle class="face" cx="50" cy="50" r="38"/><circle class="ring" cx="50" cy="50" r="30"/>';
    var p = String(label).split('|');
    s += p.length > 1
      ? '<text class="sm" x="50" y="47">' + p[0] + '</text><text class="sm" x="50" y="59">' + p[1] + '</text>'
      : '<text x="50" y="61" style="font-size:34px">' + p[0] + '</text>';
    return s + '</svg>';
  };
  document.querySelectorAll('[data-r]').forEach(function (el) { el.innerHTML = build(el.getAttribute('data-r')); });
})();

/* V4: "Be the dog" tap race. Illustrative: the regular bowl loses 4 kibble per tap, the maze bowl 1. */
(function () {
  var box = document.querySelector('.race');
  if (!box) { return; }
  var lanes = [box.querySelector('#lane-reg'), box.querySelector('#lane-maze')];
  var per = [4, 1], N = 24;
  var eat = box.querySelector('.eat'), again = box.querySelector('.again'), res = box.querySelector('.result');
  var spots = [];
  [[12, 36], [8, 21], [4, 7]].forEach(function (r, ri) {
    for (var i = 0; i < r[0]; i++) {
      var a = i / r[0] * Math.PI * 2 + ri * 0.4;
      spots.push([50 + r[1] * Math.cos(a) - 4.5, 50 + r[1] * Math.sin(a) - 4.5]);
    }
  });
  var taps, left, done;
  var paint = function () {
    lanes.forEach(function (lane, i) {
      lane.querySelectorAll('i.k').forEach(function (k, n) { k.classList.toggle('gone', n >= left[i]); });
      lane.classList.toggle('done', !!done[i]);
      lane.querySelector('.count').textContent = done[i] ? 'Empty in ' + done[i] + ' taps' : taps + (taps === 1 ? ' tap' : ' taps');
    });
  };
  var reset = function () {
    taps = 0; left = [N, N]; done = [0, 0];
    lanes.forEach(function (lane) {
      var bowl = lane.querySelector('.bowl');
      bowl.querySelectorAll('i.k').forEach(function (k) { k.remove(); });
      spots.forEach(function (p) {
        var k = document.createElement('i');
        k.className = 'k'; k.style.left = p[0] + '%'; k.style.top = p[1] + '%';
        bowl.appendChild(k);
      });
    });
    eat.disabled = false; again.hidden = true; res.textContent = '';
    paint();
  };
  eat.addEventListener('click', function () {
    taps++;
    for (var i = 0; i < 2; i++) {
      if (left[i] > 0) { left[i] = Math.max(0, left[i] - per[i]); if (!left[i]) { done[i] = taps; } }
    }
    paint();
    if (done[0] && done[1]) {
      eat.disabled = true; again.hidden = false;
      res.textContent = 'Regular bowl: gone in ' + done[0] + ' taps. Pace Maze Bowl: ' + done[1] + ' taps. Same food, ' + Math.round(done[1] / done[0]) + ' times the work.';
      again.focus();
    }
  });
  again.addEventListener('click', function () { reset(); eat.focus(); });
  reset();
})();