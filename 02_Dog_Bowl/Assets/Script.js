/* Pace Maze Bowl - work sample 2. Sticky bar, spin wheel (no email), offer page bundles/promo. */
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
    var prizes = [10, 15, 20, 10, 15, 25];
    var colors = ['#fbe7a1', '#c9def7', '#f9cfd9', '#bfe3c8', '#ddd3fb', '#ffffff'];
    var svg = $('svg', modal), seg = 360 / prizes.length, html = '';
    var pt = function (deg, r) { var a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    prizes.forEach(function (p, i) {
      var s = pt(i * seg, 96), e = pt((i + 1) * seg, 96), mid = i * seg + seg / 2, t = pt(mid, 64);
      html += '<path d="M100 100 L' + s[0] + ' ' + s[1] + ' A96 96 0 0 1 ' + e[0] + ' ' + e[1] + ' Z" fill="' + colors[i] + '" stroke="#111" stroke-width="1.5"/>';
      html += '<text x="' + t[0] + '" y="' + t[1] + '" fill="#111" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="18" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (mid > 90 && mid < 270 ? mid + 180 : mid) + ' ' + t[0] + ' ' + t[1] + ')">' + p + '%</text>';
    });
    html += '<circle cx="100" cy="100" r="97" fill="none" stroke="#111" stroke-width="2"/><circle cx="100" cy="100" r="13" fill="#fff" stroke="#111" stroke-width="2"/>';
    svg.innerHTML = html;

    var shown = false;
    var open = function () {
      if (shown || store.get('paceWheelSeen')) { return; }
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
    if (location.hash === '#spin') { open(); } /* demo link: index.html#spin opens the wheel right away */
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
