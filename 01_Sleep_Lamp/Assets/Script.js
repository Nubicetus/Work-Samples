/* Solenne Rise - work sample. Quiz, sticky mobile bar, exit-intent popup (article) and bundles/promo (offer page). */
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

  /* ---------- Sunrise rail: reading progress = 6:00 to 6:30. Flat colour steps, no gradient. ---------- */
  var rail = $('.rail'), topBar = $('.bar');
  if (rail && topBar) {
    var dot = $('.dot', rail), now = $('.now', rail), track = $('.track', rail);
    var c0 = [71, 85, 136], c1 = [165, 180, 252]; /* dim night indigo to bright lilac */
    var mix = function (t) { return 'rgb(' + c0.map(function (v, i) { return Math.round(v + (c1[i] - v) * t); }).join(',') + ')'; };
    var tick = function () {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var t = Math.min(1, Math.max(0, window.scrollY / max));
      var h = track.offsetHeight, y = h - t * h;
      dot.style.top = y + 'px';
      now.style.top = y + 'px';
      dot.style.background = mix(t);
      now.textContent = '6:' + ('0' + Math.round(t * 30)).slice(-2);
      rail.classList.toggle('show', window.scrollY > 240);
      topBar.style.width = (t * 100) + '%';
      topBar.style.background = mix(t);
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }
  /* ---------- Mobile sticky bar ---------- */
  var mbar = $('.mobile-bar'), hero = $('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      mbar.classList.toggle('show', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(hero);
  }

  /* ---------- Exit-intent popup ---------- */
  /* Desktop: opens when the mouse leaves through the top of the window (toward the tabs or close button).
     Mobile: opens when the reader scrolls back up fast after reading at least 30% of the page.
     Shows once per visit. Demo link: index.html#exit opens it right away. */
  var modal = $('#exit');
  if (modal) {
    var shown = false;
    var open = function (force) {
      if (shown || (!force && store.get('exitSeen'))) { return; }
      shown = true;
      store.set('exitSeen', '1');
      modal.classList.add('open');
      $('.step-email input', modal).focus();
    };
    var close = function () { modal.classList.remove('open'); };

    if (location.hash === '#exit') { open(true); }
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0 && window.self === window.top) { open(); } });

    var lastY = window.scrollY, lastT = Date.now();
    window.addEventListener('scroll', function () {
      var y = window.scrollY, t = Date.now();
      var read = y / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var speed = (lastY - y) / Math.max(1, t - lastT); /* px per ms, positive = scrolling up */
      if (read > 0.3 && speed > 1.2 && lastY - y > 60) { open(); }
      lastY = y; lastT = t;
    }, { passive: true });

    $('.close', modal).addEventListener('click', close);
    $('.no-thanks', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });

    /* Flow: 1) ask for an email  2) show the code, a 15-minute hold timer and the checkout link */
    var show = function (name) {
      modal.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('show', s.classList.contains('step-' + name)); });
    };
    $('.step-email', modal).addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('.step-email input', modal).value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { $('.err', modal).textContent = 'Please enter a valid email.'; return; }
      $('.err', modal).textContent = '';
      show('code');
      var left = 15 * 60, hold = $('.hold', modal);
      var tick = setInterval(function () {
        left = Math.max(0, left - 1);
        hold.textContent = Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
        if (!left) { clearInterval(tick); }
      }, 1000);
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
      if (CODES[c]) { pct = CODES[c]; $('.promo-msg').textContent = c + ' applied: ' + pct + '% off.'; $('.promo-msg').style.color = '#8fd4a8'; }
      else if (c) { pct = 0; $('.promo-msg').textContent = 'That code is not valid.'; $('.promo-msg').style.color = '#ff9a8f'; }
      update();
    };
    offer.querySelectorAll('input[name=bundle]').forEach(function (r) { r.addEventListener('change', update); });
    $('.promo button').addEventListener('click', function () { apply($('.promo input').value); });
    var fromUrl = new URLSearchParams(location.search).get('code');
    if (fromUrl) { $('.promo input').value = fromUrl.toUpperCase(); apply(fromUrl); } else { update(); }
    $('.checkout form').addEventListener('submit', function (e) { e.preventDefault(); $('.demo-msg').classList.add('show'); });
  }
})();
