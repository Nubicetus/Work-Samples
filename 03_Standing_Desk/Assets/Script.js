/* Kinlo Rise Desk - work sample 3. No popups: standing calculator (article) and options/promo (offer page). */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Standing calculator ---------- */
  var mins = $('#mins');
  if (mins) {
    var days = $('#days');
    var hm = function (m) { var h = Math.floor(m / 60), r = Math.round(m % 60); return h + 'h ' + (r < 10 ? '0' : '') + r + 'm'; };
    var calc = function () {
      var m = +mins.value, d = +days.value;
      var week = m * d;
      $('#mins-out').textContent = m + ' min';
      $('#days-out').textContent = d;
      $('#r-week').textContent = hm(week);
      $('#r-month').textContent = Math.round(week * 52 / 12 / 60) + 'h';
      document.querySelectorAll('#r-days div').forEach(function (el, i) {
        el.classList.toggle('off', i >= d);
        el.querySelector('i').style.setProperty('--fill', Math.round(m / +mins.max * 100) + '%');
      });
    };
    [mins, days].forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  }

  /* ---------- Offer page ---------- */
  var offer = $('.offer');
  if (offer) {
    var CODES = { WORKDAY10: 10 };
    var pct = 0;
    var money = function (n) { return '$' + n.toFixed(2); };
    var update = function () {
      var price = parseFloat($('input[name=model]:checked', offer).value);
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
    offer.querySelectorAll('input[name=model]').forEach(function (r) { r.addEventListener('change', update); });
    $('.promo button').addEventListener('click', function () { apply($('.promo input').value); });
    update();
    $('.checkout form').addEventListener('submit', function (e) { e.preventDefault(); $('.demo-msg').classList.add('show'); });
  }
})();
