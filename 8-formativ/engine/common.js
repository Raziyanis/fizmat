/* Общая часть формативок 8-го класса: генератор случайных чисел, сравнение вывода, проверка обязательных инструкций.
 * Тема подключается отдельным файлом topics/<id>/topic.js: window.TOPIC = { id, generate(seed, lang, H) → 10 заданий }.
 * Задание теста: { kind: 'quiz', level, title, text, code?, options: [4 строки], answer: индекс }.
 * Задание на код: { kind: 'code', level, need: [], title, text, input, output, tests: [8 × {input, output}], solution }. */
(function () {
  'use strict';
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Помощники для генератора темы
  function helpers(seed, lang) {
    var r = rng(seed);
    var H = {
      L: function (kz, ru) { return lang === 'kz' ? kz : ru; },
      r: r,
      ri: function (a, b) { return a + Math.floor(r() * (b - a + 1)); },
      pick: function (a) { return a[Math.floor(r() * a.length)]; },
      tests: function (make) { var o = []; for (var i = 0; i < 8; i++) o.push(make(i)); return o; },
      shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    };
    // Тест: правильный ответ + 3 разных неверных → 4 варианта в случайном порядке
    H.quiz = function (q, right, wrongs) {
      var seen = {}, opts = [String(right)]; seen[String(right)] = 1;
      wrongs.forEach(function (w) { w = String(w); if (!seen[w] && opts.length < 4) { seen[w] = 1; opts.push(w); } });
      if (opts.length < 4) throw new Error('мало вариантов: ' + q.title);
      opts = H.shuffle(opts);
      q.kind = 'quiz'; q.options = opts; if (q.code && q.mono == null) q.mono = true; q.answer = opts.indexOf(String(right));
      return q;
    };
    return H;
  }
  function generate(seed, lang) {
    // Если случайные числа дали совпадающие варианты ответа, берётся соседнее зерно (проверка tools/check.py ловит такие случаи).
    var items, err;
    for (var k = 0; k < 20 && !items; k++) {
      try { items = window.TOPIC.generate((seed + k * 7919) >>> 0, lang, helpers((seed + k * 7919) >>> 0, lang)); } catch (e) { err = e; }
    }
    if (!items) throw err;
    if (k > 1) items.retried = k - 1;
    items.forEach(function (it) { if (!it.kind) it.kind = 'code'; if (!it.need) it.need = []; });
    return items;
  }
  // Сравнение вывода: скобки, запятые и кавычки не учитываются, пробел и перевод строки равнозначны, регистр букв не важен (YES = yes).
  function tokens(s) { return String(s == null ? '' : s).replace(/[\[\],'"()]/g, ' ').trim().split(/\s+/).filter(Boolean).map(function (x) { return x.toUpperCase(); }); }
  function sameOutput(got, want) { return tokens(got).join(' ') === tokens(want).join(' '); }

  // Есть ли в программе нужные инструкции (комментарии и строки не считаются).
  function clean(src) {
    return String(src || '').replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g, '""').replace(/#.*$/gm, '');
  }
  // else цикла: строка «else:» на том же отступе, что и ближайшая выше строка «for …»/«while …» этого уровня
  function hasLoopElse(code) {
    var lines = code.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var m = /^([ \t]*)else\s*:/.exec(lines[i]);
      if (!m) continue;
      var ind = m[1].replace(/\t/g, '    ').length;
      for (var j = i - 1; j >= 0; j--) {
        if (!lines[j].trim()) continue;
        var li = /^[ \t]*/.exec(lines[j])[0].replace(/\t/g, '    ').length;
        if (li > ind) continue;
        if (li < ind) break;
        if (/^\s*(for|while)\b/.test(lines[j])) return true;
        break;
      }
    }
    return false;
  }
  function missing(src, need) {
    var c = clean(src);
    return (need || []).filter(function (k) { return k === 'else' ? !hasLoopElse(c) : !new RegExp('\\b' + k + '\\b').test(c); });
  }

  window.CODE = { generate: generate, sameOutput: sameOutput, tokens: tokens, missing: missing };
})();
