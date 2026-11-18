/* Solenne Rise - work sample. Quiz, sticky mobile bar, spin wheel (article) and bundles/promo (offer page). */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked: fine */ } }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Quiz ---------- */
  var quiz = $('#quiz');
  if (quiz) {
    var questions = [
      { q: 'How do you usually wake up?', a: ['Alarm, then snooze (more than once)', 'Alarm, then up right away', 'Before the alarm, but groggy'] },
      { q: 'What are your mornings like in winter?', a: ['Dark and hard to start', 'About the same as summer', 'I rely on a lot of coffee'] },
      { q: 'What would help most?', a: ['Waking up more gradually', 'Feeling alert sooner', 'A calmer start to the day'] }
    ];
    var results = [
      { t: 'You\'re a "five more minutes" waker', d: 'Sudden alarms hit you hardest. A slow 30-minute sunrise gives your body a head start before the sound ever plays.' },
      { t: 'You\'re a "jolt and go" waker', d: 'You get up fast but pay for it with a foggy first hour. Gradual light is a gentler way to reach the same result.' },
      { t: 'You\'re a "light-starved" waker', d: 'Dark mornings drag you down. A sunrise on your schedule brings the bright part of the morning to you, any season.' }
    ];
    var step = 0, score = [0, 0, 0];
    var stepsEl = $('.steps', quiz), bar = $('.progress i', quiz);

    var render = function () {
      var item = questions[step];
      stepsEl.innerHTML = '<div class="q"><span>' + (step + 1) + '/' + questions.length + '</span>' + item.q + '</div><div class="options"></div>';
      var box = $('.options', stepsEl);
      item.a.forEach(function (label, i) {
        var b = document.createElement('button');
        b.type = 'button';
        var k = document.createElement('kbd');
        k.textContent = 'ABC'.charAt(i);
        var t = document.createElement('span');
        t.textContent = label;
        b.appendChild(k);
        b.appendChild(t);
        b.addEventListener('click', function () { score[i]++; step++; next(); });
        box.appendChild(b);
      });
      bar.style.width = (step / questions.length * 100) + '%';
    };
    var next = function () {
      if (step < questions.length) { render(); return; }
      bar.style.width = '100%';
      var best = score.indexOf(Math.max.apply(null, score));
      stepsEl.innerHTML = '';
      $('.result-title', quiz).textContent = results[best].t;
      $('.result-text', quiz).textContent = results[best].d;
      $('.result', quiz).classList.add('show');
    };
    render();
  }

  /* ---------- Mobile sticky bar ---------- */
  var mbar = $('.mobile-bar'), hero = $('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      mbar.classList.toggle('show', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(hero);
  }

  /* ---------- Spin wheel ---------- */
  var modal = $('#wheel');
  if (modal) {
    var prizes = [10, 15, 20, 10, 15, 25];
    var colors = ['#ff8a3d', '#1b1b1e', '#e5651f', '#1b1b1e', '#ff8a3d', '#26262a'];
    var ink = ['#140a03', '#ecebe7', '#140a03', '#ecebe7', '#140a03', '#ecebe7'];
    var svg = $('svg', modal), seg = 360 / prizes.length, html = '';
    var pt = function (deg, r) { var a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    prizes.forEach(function (p, i) {
      var s = pt(i * seg, 96), e = pt((i + 1) * seg, 96), mid = i * seg + seg / 2, t = pt(mid, 64);
      html += '<path d="M100 100 L' + s[0] + ' ' + s[1] + ' A96 96 0 0 1 ' + e[0] + ' ' + e[1] + ' Z" fill="' + colors[i] + '"/>';
      html += '<text x="' + t[0] + '" y="' + t[1] + '" fill="' + ink[i] + '" font-family="Archivo, Arial, sans-serif" font-weight="600" font-size="16" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (mid > 90 && mid < 270 ? mid + 180 : mid) + ' ' + t[0] + ' ' + t[1] + ')">' + p + '%</text>';
    });
    html += '<circle cx="100" cy="100" r="96.5" fill="none" stroke="#3a3a3f" stroke-width="1"/><circle cx="100" cy="100" r="14" fill="#0b0b0c" stroke="#3a3a3f"/><circle cx="100" cy="100" r="4" fill="#ff8a3d"/>';
    svg.innerHTML = html;

    var shown = false;
    var open = function () {
      if (shown || store.get('wheelSeen')) { return; }
      shown = true;
      store.set('wheelSeen', '1');
      modal.classList.add('open');
      $('.spin-btn', modal).focus();
    };
    var close = function () { modal.classList.remove('open'); };

    setTimeout(open, 20000);
    if (location.hash === '#spin') { open(); } /* demo link: index.html#spin opens the wheel right away */
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) { open(); } });
    $('.close', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });

    /* Flow: 1) spin  2) show the prize and ask for an email  3) show the code + checkout link */
    var show = function (name) {
      modal.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('show', s.classList.contains('step-' + name)); });
    };
    var code = '';

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
        code = 'RISE' + prizes[win];
        $('.won-pct', modal).textContent = prizes[win] + '%';
        show('email');
        $('.step-email input', modal).focus();
      };
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { done(); } else { svg.addEventListener('transitionend', done, { once: true }); setTimeout(done, 4600); }
    });

    $('.step-email', modal).addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('.step-email input', modal).value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { $('.err', modal).textContent = 'Please enter a valid email.'; return; }
      $('.err', modal).textContent = '';
      $('.code-text', modal).textContent = code;
      $('.code-link', modal).href = 'Offer.html?code=' + code;
      show('code');
    });
  }

  /* ---------- Offer page ---------- */
  var offer = $('.offer');
  if (offer) {
    var CODES = { RISE10: 10, RISE15: 15, RISE20: 20, RISE25: 25 };
    var pct = 0;
    var money = function (n) { return '$' + n.toFixed(2); };
    var update = function () {
      var picked = $('input[name=bundle]:checked', offer);
      var price = parseFloat(picked.value);
      var off = Math.round(price * pct) / 100;
      $('.t-sub').textContent = money(price);
      $('.t-off').textContent = off ? '-' + money(off) : '$0.00';
      $('.t-total').textContent = money(price - off);
    };
    var apply = function (raw) {
      var c = (raw || '').trim().toUpperCase();
      if (CODES[c]) { pct = CODES[c]; $('.promo-msg').textContent = c + ' applied: ' + pct + '% off.'; $('.promo-msg').style.color = '#2f7a4b'; }
      else if (c) { pct = 0; $('.promo-msg').textContent = 'That code is not valid.'; $('.promo-msg').style.color = '#b3392f'; }
      update();
    };
    offer.querySelectorAll('input[name=bundle]').forEach(function (r) { r.addEventListener('change', update); });
    $('.promo button').addEventListener('click', function () { apply($('.promo input').value); });
    var fromUrl = new URLSearchParams(location.search).get('code');
    if (fromUrl) { $('.promo input').value = fromUrl.toUpperCase(); apply(fromUrl); } else { update(); }
    $('.checkout form').addEventListener('submit', function (e) { e.preventDefault(); $('.demo-msg').classList.add('show'); });
  }
})();
