/* Общие функции для страниц ученика и учителя. */
(function () {
  'use strict';

  var SUB = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };
  var NAME = { 2: 'двоичную', 8: 'восьмеричную', 10: 'десятичную', 16: 'шестнадцатеричную' };
  var DEMO_KEY = 'ntest-8211-demo-pool';

  function digits(n, base) { return n.toString(base).toUpperCase(); }

  /** Задание [from, to, n] → текст, правильный ответ, подсказка для поля ввода. */
  function task(t) {
    var from = t[0], to = t[1], n = t[2];
    return {
      from: from,
      to: to,
      shown: digits(n, from) + SUB[from],
      text: 'Переведите число ' + digits(n, from) + SUB[from] + ' в ' + NAME[to] + ' систему счисления.',
      answer: digits(n, to),
      answerShown: digits(n, to) + SUB[to]
    };
  }

  var ALLOWED = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9A-F]+$/ };

  /** Приводит ответ ученика к виду для сравнения: без пробелов, заглавные, без ведущих нулей. */
  function normalize(s) {
    var v = String(s || '').replace(/\s+/g, '').toUpperCase().replace(/^0+(?=.)/, '');
    return v;
  }

  function isCorrect(given, t) {
    var v = normalize(given);
    return ALLOWED[t.to].test(v) && v === t.answer;
  }

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  // ---------- Обращение к серверу (или демо-режим в localStorage) ----------

  function demoLoad() {
    try {
      var s = JSON.parse(localStorage.getItem(DEMO_KEY));
      if (s && s.issued) return s;
    } catch (e) {}
    return { round: 'demo-' + newId().slice(0, 6), issued: {} };
  }
  function demoSave(s) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(s)); } catch (e) {} }

  function demoCall(p) {
    var total = window.VARIANTS.length;
    var s = demoLoad();
    var list = Object.keys(s.issued).map(function (k) { return s.issued[k]; });
    if (p.action === 'status') return { ok: true, round: s.round, issued: list.length, total: total };
    if (p.action === 'stats') return { ok: true, round: s.round, issued: list.length, total: total, variants: list.sort(function (a, b) { return a - b; }) };
    if (p.action === 'reset') { s = { round: 'demo-' + newId().slice(0, 6), issued: {} }; demoSave(s); return { ok: true, round: s.round, issued: 0, total: total }; }
    if (p.action === 'issue') {
      if (s.issued[p.sid]) return { ok: true, variant: s.issued[p.sid], round: s.round };
      var free = [];
      for (var v = 1; v <= total; v++) if (list.indexOf(v) < 0) free.push(v);
      if (!free.length) return { ok: false, error: 'full', round: s.round };
      var pick = free[Math.floor(Math.random() * free.length)];
      s.issued[p.sid] = pick;
      demoSave(s);
      return { ok: true, variant: pick, round: s.round };
    }
    return { ok: false, error: 'bad_action' };
  }

  // Автономный файл без сервера: вариант выбирается случайно на каждом устройстве.
  function localCall(p) {
    if (p.action === 'issue') return { ok: true, variant: 1 + Math.floor(Math.random() * window.VARIANTS.length), round: 'local' };
    return { ok: true, round: 'local' };
  }

  function api(p) {
    if (window.STANDALONE) return Promise.resolve(localCall(p));
    if (!window.API_URL) return Promise.resolve(demoCall(p));
    // text/plain — «простой» запрос без предварительного CORS-запроса; Apps Script его принимает.
    return fetch(window.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(p),
      redirect: 'follow'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  window.NT = {
    task: task,
    isCorrect: isCorrect,
    normalize: normalize,
    newId: newId,
    api: api,
    demo: !window.API_URL && !window.STANDALONE
  };
})();
