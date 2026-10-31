/**
 * 8.2.1.1 Перевод натурального числа из десятичной системы счисления
 * в двоичную, восьмеричную, шестнадцатеричную и обратно.
 *
 * Скрипт создаёт VARIANTS разных вариантов теста (Google Forms, режим «Тест»):
 * структура вопросов одинаковая, числа в каждом варианте свои.
 * Все ответы собираются в одну Google Таблицу, итоги — на листе «Результаты».
 * Опубликованный как веб-приложение, скрипт выдаёт каждому ученику
 * по одной ссылке его собственный вариант (см. README.md).
 */

var TITLE = '8.2.1.1 Системы счисления';
var VARIANTS = 15;   // сколько вариантов создать (по числу учеников)
var SEED = 2026;     // измените число, чтобы получить другой набор вариантов

// ---------- Генерация заданий ----------

var SUB = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };
var BASE_NAME = { 2: 'двоичную', 8: 'восьмеричную', 10: 'десятичную', 16: 'шестнадцатеричную' };

// Типы ошибок: каждый неверный вариант ответа соответствует типичной ошибке ученика.
var OK = 'верно';
var ERR = {
  reverse:   'обратный порядок цифр (остатков)',
  asDecimal: 'цифры прочитаны как десятичное число',
  carry:     'ошибка в соседнем разряде (±основание)',
  arith:     'арифметическая ошибка (±1, ±2)',
  oneDigit:  'ошибка в одной цифре',
  count:     'ошибка подсчёта (±1)',
  noBase:    'сравнение без учёта основания',
  alphabet:  'не знает алфавит системы',
  letter:    'неверное значение буквы-цифры',
  letter16:  'путает цифру F с основанием 16',
  powNoMinus:'2^k вместо 2^k − 1',
  exponent:  'неверный показатель степени (±1)',
  minusOne:  '2^k − 1 вместо 2^k',
  other:     'прочее'
};

function rng_(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int_(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }

function fmt_(n, base) { return n.toString(base).toUpperCase() + (base === 10 ? '' : SUB[base]); }

function hasLetter_(n) { return /[A-F]/.test(n.toString(16).toUpperCase()); }

/** Три правдоподобных неверных числа для правильного ответа n. */
function wrongValues_(r, n, base, srcDigits) {
  var cand = [];
  var s = n.toString(base);
  var rev = parseInt(s.split('').reverse().join(''), base);
  cand.push(rev);                                      // остатки записаны не в том порядке
  if (srcDigits && /^\d+$/.test(srcDigits)) cand.push(parseInt(srcDigits, 10)); // цифры прочитаны как десятичные
  for (var b = 0; b < s.length * (base === 2 ? 1 : 3); b++) cand.push(n ^ (1 << b)); // ошибка в одном разряде
  cand.push(n + base, n - base, n + 1, n - 1, n + 2, n - 2);
  var out = [];
  var seen = {};
  seen[n] = true;
  while (cand.length && out.length < 3) {
    var v = cand.splice(Math.floor(r() * cand.length), 1)[0];
    if (v > 0 && !seen[v]) { seen[v] = true; out.push(v); }
  }
  return out;
}

/**
 * Тип ошибки, которой соответствует неверный ответ w при переводе числа n в систему base.
 * Если ответ подходит под несколько типов, они перечисляются через « + ».
 */
function classifyConv_(w, n, base, srcDigits) {
  var s = n.toString(base);
  var ws = w.toString(base);
  var types = [];
  if (w === parseInt(s.split('').reverse().join(''), base)) types.push(ERR.reverse);
  if (srcDigits && /^\d+$/.test(srcDigits) && w === parseInt(srcDigits, 10)) types.push(ERR.asDecimal);
  if (Math.abs(w - n) === base) types.push(ERR.carry);
  else if (Math.abs(w - n) <= 2) types.push(ERR.arith);
  if (base !== 10 && ws.length <= s.length && !types.length) {
    while (ws.length < s.length) ws = '0' + ws;   // потерянная старшая цифра тоже считается ошибкой в одной цифре
    var diff = 0;
    for (var i = 0; i < s.length; i++) if (s[i] !== ws[i]) diff++;
    if (diff === 1) types.push(ERR.oneDigit);
  }
  return types.length ? types.join(' + ') : ERR.other;
}

function conv_(r, n, from, to) {
  var src = n.toString(from).toUpperCase();
  var wrong = wrongValues_(r, n, to, src);
  return {
    kind: 'перевод ' + from + '→' + to,
    q: 'Переведите число ' + fmt_(n, from) + (from === 10 ? '₁₀' : '') + ' в ' + BASE_NAME[to] + ' систему счисления.',
    a: [fmt_(n, to)].concat(wrong.map(function (v) { return fmt_(v, to); })),
    tags: [OK].concat(wrong.map(function (v) { return classifyConv_(v, n, to, src); })),
    hint: fmt_(n, from) + ' = ' + fmt_(n, to)
  };
}

function makeVariant(seed) {
  var r = rng_(seed);
  var qs = [];
  var n;

  qs.push(conv_(r, int_(r, 17, 63), 10, 2));
  qs.push(conv_(r, int_(r, 64, 127), 10, 2));
  qs.push(conv_(r, int_(r, 128, 255), 10, 2));
  qs.push(conv_(r, int_(r, 65, 299), 10, 8));
  qs.push(conv_(r, int_(r, 300, 511), 10, 8));
  do { n = int_(r, 160, 255); } while (!hasLetter_(n));
  qs.push(conv_(r, n, 10, 16));
  do { n = int_(r, 256, 4095); } while (!hasLetter_(n));
  qs.push(conv_(r, n, 10, 16));
  qs.push(conv_(r, int_(r, 16, 63), 2, 10));
  qs.push(conv_(r, int_(r, 64, 255), 2, 10));
  qs.push(conv_(r, int_(r, 8, 63), 8, 10));
  qs.push(conv_(r, int_(r, 64, 511), 8, 10));
  do { n = int_(r, 26, 255); } while (!hasLetter_(n));
  qs.push(conv_(r, n, 16, 10));
  do { n = int_(r, 256, 4095); } while (!hasLetter_(n));
  qs.push(conv_(r, n, 16, 10));

  // Количество единиц в двоичной записи
  n = int_(r, 50, 250);
  var bin = n.toString(2);
  var ones = bin.split('1').length - 1;
  qs.push({ kind: 'число единиц', q: 'Сколько единиц в двоичной записи числа ' + n + '?',
            a: [ones, ones + 1, ones - 1, ones + 2].map(String),
            tags: [OK, ERR.count, ERR.count, ERR.other],
            hint: n + ' = ' + bin + '₂' });

  // Количество разрядов двоичной записи
  n = int_(r, 20, 1000);
  var len = n.toString(2).length;
  qs.push({ kind: 'число разрядов', q: 'Сколько цифр в двоичной записи числа ' + n + '?',
            a: [len, len - 1, len + 1, len + 2].map(String),
            tags: [OK, ERR.count, ERR.count, ERR.other],
            hint: n + ' = ' + n.toString(2) + '₂' });

  // Сравнение чисел, записанных в разных системах
  var vals = [];
  while (vals.length < 4) {
    var v = int_(r, 20, 120);
    if (vals.indexOf(v) < 0) vals.push(v);
  }
  var bases = [2, 8, 16, 10].sort(function () { return r() - 0.5; });
  var shown = vals.map(function (v, i) { return fmt_(v, bases[i]); });
  var maxIdx = vals.indexOf(Math.max.apply(null, vals));
  // «Без учёта основания»: цифры числа прочитаны как десятичные (буквы A–F — не читаются)
  var face = shown.map(function (s) { var d = s.replace(/[₀-₉]/g, ''); return /^\d+$/.test(d) ? +d : -1; });
  var faceMax = Math.max.apply(null, face);
  var order = [maxIdx].concat([0, 1, 2, 3].filter(function (i) { return i !== maxIdx; }));
  qs.push({ kind: 'сравнение чисел', q: 'Какое из чисел наибольшее?',
            a: order.map(function (i) { return shown[i]; }),
            tags: order.map(function (i, k) { return k === 0 ? OK : face[i] === faceMax ? ERR.noBase : ERR.other; }),
            hint: shown.map(function (s, i) { return s + ' = ' + vals[i]; }).join(', ') });

  // Недопустимая цифра
  var ib = [2, 8, 16][int_(r, 0, 2)];
  var bad = { 2: ['2', '0', '1'], 8: ['8', '0', '7', '5'], 16: ['G', 'F', '9', 'A'] }[ib];
  qs.push({ kind: 'алфавит системы', tags: bad.map(function (_, i) { return i ? ERR.alphabet : OK; }),
            q: 'Какой символ НЕ может встречаться в записи числа в ' +
               { 2: 'двоичной', 8: 'восьмеричной', 16: 'шестнадцатеричной' }[ib] + ' системе счисления?',
            a: bad,
            hint: { 2: 'Цифры: 0 и 1.', 8: 'Цифры: 0–7.', 16: 'Цифры: 0–9 и A–F.' }[ib] });

  // Значение буквы-цифры
  var L = int_(r, 10, 15);
  var lv = L === 15 ? [15, 14, 13, 16] : [L, L - 1, L + 1, 16];
  qs.push({ kind: 'значение буквы', q: 'Какое число в десятичной системе соответствует цифре ' + L.toString(16).toUpperCase() + '₁₆?',
            a: lv.map(String),
            tags: lv.map(function (x, i) { return i === 0 ? OK : x === 16 ? (L === 15 ? ERR.letter16 : ERR.other) : ERR.letter; }),
            hint: 'A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.' });

  // Наибольшее число из k двоичных разрядов
  var k = int_(r, 4, 10);
  var mx = Math.pow(2, k) - 1;
  qs.push({ kind: 'наибольшее k-разрядное', q: 'Какое наибольшее натуральное число можно записать с помощью ' + k + ' двоичных разрядов?',
            a: [mx, mx + 1, Math.pow(2, k - 1), mx - 1].map(String),
            tags: [OK, ERR.powNoMinus, ERR.exponent, ERR.other],
            hint: '1…1₂ (' + k + ' единиц) = 2^' + k + ' − 1 = ' + mx });

  // 1 и k нулей
  k = int_(r, 4, 9);
  qs.push({ kind: 'степень двойки', q: 'Какое десятичное число записывается в двоичной системе как 1' + new Array(k + 1).join('0') + '₂?',
            a: [Math.pow(2, k), Math.pow(2, k) - 1, Math.pow(2, k + 1), Math.pow(2, k - 1)].map(String),
            tags: [OK, ERR.minusOne, ERR.exponent, ERR.exponent],
            hint: '1 и ' + k + ' нулей = 2^' + k + ' = ' + Math.pow(2, k) });

  return qs;
}

// ---------- Создание тестов ----------

function shuffle_(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function createForm_(variant, questions, ss) {
  var form = FormApp.create(TITLE + ' — вариант ' + variant);
  form.setIsQuiz(true)
      .setDescription('8 класс. Вариант ' + variant + '.\n' +
                      'Перевод натуральных чисел между системами счисления с основаниями 2, 8, 10, 16.\n' +
                      'Каждый вопрос — 1 балл. Выберите один правильный ответ.')
      .setLimitOneResponsePerUser(true)
      .setAllowResponseEdits(false)
      .setPublishingSummary(false)
      .setProgressBar(true);
  try { form.setCollectEmail(true); } catch (e) { /* включается в настройках формы вручную */ }

  form.addTextItem().setTitle('Фамилия и имя').setRequired(true);
  form.addPageBreakItem().setTitle('Вопросы');

  questions.forEach(function (item) {
    var mc = form.addMultipleChoiceItem();
    var choices = shuffle_(item.a.map(function (text, i) { return mc.createChoice(text, i === 0); }));
    mc.setTitle(item.q)
      .setChoices(choices)
      .setPoints(1)
      .setRequired(true)
      .setFeedbackForIncorrect(FormApp.createFeedback().setText('Решение: ' + item.hint).build());
  });

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  return form;
}

function createTests() {
  var ss = SpreadsheetApp.create(TITLE + ' — результаты');
  var results = ss.getSheets()[0].setName('Результаты');
  results.appendRow(['Время', 'Вариант', 'Фамилия и имя', 'Email', 'Баллы', 'Максимум']);
  results.setFrozenRows(1);

  var list = ss.insertSheet('Варианты');
  list.appendRow(['Вариант', 'Ссылка для ученика', 'Ученик (email)', 'Редактирование']);
  var keys = ss.insertSheet('Ключи');
  keys.appendRow(['Вариант', 'Вопрос', 'Правильный ответ']);

  var formIds = {};
  for (var v = 1; v <= VARIANTS; v++) {
    var qs = makeVariant(SEED * 1000 + v);
    var form = createForm_(v, qs, ss);
    formIds[form.getId()] = v;
    list.appendRow([v, form.getPublishedUrl(), '', form.getEditUrl()]);
    keys.getRange(keys.getLastRow() + 1, 1, qs.length, 3).setValues(
      qs.map(function (q, i) { return [v, (i + 1) + '. ' + q.q, q.a[0]]; }));
  }

  var props = PropertiesService.getScriptProperties();
  props.setProperty('SS_ID', ss.getId());
  props.setProperty('FORM_IDS', JSON.stringify(formIds));

  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onResponse').forSpreadsheet(ss).onFormSubmit().create();

  Logger.log('Готово: создано вариантов — ' + VARIANTS);
  Logger.log('Таблица (результаты, ссылки, ключи): ' + ss.getUrl());
}

/** Срабатывает при каждой отправке любого варианта и записывает итог на лист «Результаты». */
function onResponse(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var props = PropertiesService.getScriptProperties();
    var formIds = JSON.parse(props.getProperty('FORM_IDS'));
    var form = FormApp.openByUrl(e.range.getSheet().getFormUrl());
    var responses = form.getResponses();
    var resp = responses[responses.length - 1];

    var name = '';
    var score = 0;
    var max = 0;
    resp.getItemResponses().forEach(function (ir) {
      if (ir.getItem().getType() === FormApp.ItemType.TEXT) name = ir.getResponse();
    });
    resp.getGradableItemResponses().forEach(function (ir) { score += ir.getScore() || 0; });
    form.getItems(FormApp.ItemType.MULTIPLE_CHOICE).forEach(function (it) {
      max += it.asMultipleChoiceItem().getPoints();
    });

    SpreadsheetApp.openById(props.getProperty('SS_ID')).getSheetByName('Результаты')
      .appendRow([resp.getTimestamp(), formIds[form.getId()], name, resp.getRespondentEmail(), score, max]);
  } finally {
    lock.releaseLock();
  }
}

// ---------- Раздача: одна ссылка, у каждого ученика свой вариант ----------

/** Веб-приложение: закрепляет за учеником (по email) свободный вариант и открывает его. */
function doGet() {
  var email = Session.getActiveUser().getEmail();
  if (!email) {
    return HtmlService.createHtmlOutput(
      '<p style="font:16px sans-serif">Не удалось определить ваш аккаунт. Обратитесь к учителю.</p>');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  var url;
  try {
    var sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SS_ID'))
      .getSheetByName('Варианты');
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
    for (var i = 0; i < rows.length && !url; i++) {
      if (String(rows[i][2]).toLowerCase() === email.toLowerCase()) url = rows[i][1];
    }
    for (var j = 0; j < rows.length && !url; j++) {
      if (!rows[j][2]) {
        sheet.getRange(j + 2, 3).setValue(email);
        url = rows[j][1];
      }
    }
  } finally {
    lock.releaseLock();
  }

  if (!url) {
    return HtmlService.createHtmlOutput(
      '<p style="font:16px sans-serif">Свободные варианты закончились. Обратитесь к учителю.</p>');
  }
  return HtmlService.createHtmlOutput(
    '<div style="font:18px sans-serif;text-align:center;margin-top:60px">' +
    '<a href="' + url + '" target="_top" style="background:#1a73e8;color:#fff;padding:14px 28px;' +
    'border-radius:8px;text-decoration:none">Открыть мой вариант теста</a></div>')
    .setTitle(TITLE);
}

// ---------- Данные для исследования: анализ ошибок ----------

/**
 * Запустите вручную после того, как ученики сдали тест.
 * Создаёт (или пересоздаёт) в таблице результатов два листа без имён и email:
 *  «Ошибки (анонимно)» — каждый ответ каждого ученика с типом ошибки;
 *  «Сводка ошибок»     — сколько раз каждый неверный вариант предлагался и сколько раз его выбрали.
 * Ученик обозначен кодом варианта (В1, В2, …); соответствие кода и ученика есть только
 * на листе «Варианты», который не нужно никому передавать.
 */
function analyzeErrors() {
  var props = PropertiesService.getScriptProperties();
  var formIds = JSON.parse(props.getProperty('FORM_IDS'));
  var ss = SpreadsheetApp.openById(props.getProperty('SS_ID'));

  var rows = [];
  var stat = {};        // тип задания → тип ошибки → { offered, chosen }
  var byKind = {};      // тип задания → { n, correct }
  var mismatch = 0;

  Object.keys(formIds).forEach(function (id) {
    var v = formIds[id];
    var form = FormApp.openById(id);
    var qs = makeVariant(SEED * 1000 + v);
    var items = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE);
    var pos = {};
    items.forEach(function (it, i) {
      pos[it.getId()] = i;
      if (!qs[i] || it.getTitle() !== qs[i].q) mismatch++;
    });

    form.getResponses().forEach(function (resp, attempt) {
      var code = 'В' + v + (attempt ? '-' + (attempt + 1) : '');
      var date = Utilities.formatDate(resp.getTimestamp(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      resp.getItemResponses().forEach(function (ir) {
        var i = pos[ir.getItem().getId()];
        if (i === undefined || !qs[i]) return;
        var q = qs[i];
        var chosen = String(ir.getResponse());
        var j = q.a.indexOf(chosen);
        var tag = j < 0 ? 'ответ не распознан' : q.tags[j];
        rows.push([code, v, date, i + 1, q.kind, chosen, q.a[0], j === 0 ? 1 : 0, j === 0 ? '' : tag]);

        byKind[q.kind] = byKind[q.kind] || { n: 0, correct: 0 };
        byKind[q.kind].n++;
        if (j === 0) byKind[q.kind].correct++;

        var s = stat[q.kind] = stat[q.kind] || {};
        var offered = {};
        q.tags.slice(1).forEach(function (t) { offered[t] = true; });
        Object.keys(offered).forEach(function (t) {
          s[t] = s[t] || { offered: 0, chosen: 0 };
          s[t].offered++;
        });
        if (j > 0) s[tag].chosen++;
      });
    });
  });

  var detail = resetSheet_(ss, 'Ошибки (анонимно)');
  detail.appendRow(['Код ученика', 'Вариант', 'Дата', '№ вопроса', 'Тип задания',
                    'Ответ ученика', 'Правильный ответ', 'Верно (1/0)', 'Тип ошибки']);
  if (rows.length) detail.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  detail.setFrozenRows(1);

  var sum = resetSheet_(ss, 'Сводка ошибок');
  var out = [['Тип задания', 'Ответов', 'Верных', 'Доля верных', '', '', '']];
  Object.keys(byKind).sort().forEach(function (k) {
    out.push([k, byKind[k].n, byKind[k].correct, byKind[k].correct / byKind[k].n, '', '', '']);
  });
  out.push(['', '', '', '', '', '', '']);
  out.push(['Тип задания', 'Тип ошибки', 'Сколько раз предлагался', 'Сколько раз выбран',
            'Доля выбора (выбран / предлагался)', 'Доля среди всех ошибок задания', '']);
  Object.keys(stat).sort().forEach(function (k) {
    var errs = byKind[k].n - byKind[k].correct;
    Object.keys(stat[k]).sort().forEach(function (t) {
      var x = stat[k][t];
      out.push([k, t, x.offered, x.chosen, x.offered ? x.chosen / x.offered : '', errs ? x.chosen / errs : '', '']);
    });
  });
  sum.getRange(1, 1, out.length, out[0].length).setValues(out);

  Logger.log('Ответов обработано: ' + rows.length + '. Вопросов, не совпавших с кодом: ' + mismatch +
             (mismatch ? ' — проверьте, что SEED и VARIANTS не менялись после создания тестов.' : '.'));
}

function resetSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (sh) ss.deleteSheet(sh);
  return ss.insertSheet(name);
}
