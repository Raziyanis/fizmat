# -*- coding: utf-8 -*-
"""Казахский режим без русских остатков.

1. txDom: кроме точного совпадения, переводит известные подписи внутри
   составных строк («Задание 1 · append», «Ошибок: 3. Разбор ниже.») и
   подсказки в полях ввода.
2. Разборы, которые считает сама страница (повторение, понимание, практика),
   берутся из казахской версии урока."""

TXDOM_OLD = '''  nodes.forEach(function (node) {
    if (node.parentNode && node.parentNode.tagName === 'PRE') return;   // код не трогаем
    var raw = node.nodeValue, key = raw.trim();
    if (!key) return;
    var v = UI_KK[key];
    if (v !== undefined) node.nodeValue = raw.replace(key, v);
  });
  var titled = root.querySelectorAll('[title]');
  for (var i = 0; i < titled.length; i++) {
    var t = UI_KK[titled[i].getAttribute('title').trim()];
    if (t !== undefined) titled[i].setAttribute('title', t);
  }
}'''

TXDOM_NEW = r'''  nodes.forEach(function (node) {
    if (node.parentNode && node.parentNode.tagName === 'PRE') return;   // код не трогаем
    var raw = node.nodeValue, key = raw.trim();
    if (!key) return;
    var v = txPart_(key);
    if (v !== key) node.nodeValue = raw.replace(key, v);
  });
  var titled = root.querySelectorAll('[title]');
  for (var i = 0; i < titled.length; i++) {
    var t0 = titled[i].getAttribute('title').trim(), t = txPart_(t0);
    if (t !== t0) titled[i].setAttribute('title', t);
  }
  var ph = root.querySelectorAll('[placeholder]');
  for (var j = 0; j < ph.length; j++) {
    var p0 = ph[j].getAttribute('placeholder').trim(), p = txPart_(p0);
    if (p !== p0) ph[j].setAttribute('placeholder', p);
  }
}

/* Перевод строки: целиком, а если её нет в словаре — по известным кускам.
   Куски ищем только в строках без казахских букв, чтобы не трогать
   уже переведённый текст. */
var TX_KEYS_ = null;
function txPart_(s) {
  var v = UI_KK[s];
  if (v !== undefined) return v;
  /* Эти куски переводим всегда: рядом с ними бывают казахские слова и имена. */
  s = s.split('9 класс').join('9 сынып').split(' или ').join(' немесе ');
  var pre = /^([А-Яа-яЁё][А-Яа-яЁё ]*:)\s/.exec(s);
  if (pre && UI_KK[pre[1]] !== undefined) s = UI_KK[pre[1]] + s.slice(pre[1].length);
  if (/[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/.test(s) || !/[А-Яа-яЁё]/.test(s)) return s;
  if (!TX_KEYS_) {
    TX_KEYS_ = Object.keys(UI_KK).filter(function (k) {
      return /[А-Яа-яЁё]/.test(k) && (k.length >= 5 || /:$/.test(k));
    }).sort(function (a, b) { return b.length - a.length; });
  }
  var out = s;
  TX_KEYS_.forEach(function (k) {
    var at = out.indexOf(k);
    while (at > -1) {
      var before = at === 0 ? ' ' : out.charAt(at - 1);
      var after = out.charAt(at + k.length) || ' ';
      if (!/[А-Яа-яЁёA-Za-z0-9_]/.test(before) && !/[А-Яа-яЁёA-Za-z_]/.test(after)) {
        out = out.slice(0, at) + UI_KK[k] + out.slice(at + k.length);
        at = out.indexOf(k, at + UI_KK[k].length);
      } else {
        at = out.indexOf(k, at + 1);
      }
    }
  });
  return out;
}'''

# Локальные заглушки сервера: разбор на языке страницы
STUB_HELPERS = '''
/* Разбор на языке страницы: в казахском режиме берём тексты из LKK и QKK. */
function kkOn_() { return typeof LANG !== 'undefined' && LANG === 'kk'; }
function qLoc_(q) {
  var i = Q.indexOf(q), k = kkOn_() ? (QKK[i] || {}) : {};
  return { text: k.text || q.text, options: k.options || q.options, note: k.note || q.note };
}
function lkNote_(stage, i, fallback) {
  if (!kkOn_()) return fallback;
  var part = (stage === 'check') ? (LKK.check || {}).items : ((LKK.work || {}).tasks);
  return (part && part[i] && part[i].note) || fallback;
}
'''


def patch_both(src, sub1):
    src = sub1(src, TXDOM_OLD, TXDOM_NEW)
    return src


def patch_student(src, sub1):
    src = sub1(src, 'function nrm(v){', STUB_HELPERS + 'function nrm(v){')
    src = sub1(src, '    detail.push({ n: i+1, got: got, max: it.points, note: it.note });',
               "    detail.push({ n: i+1, got: got, max: it.points, note: lkNote_('check', i, it.note) });")
    src = sub1(src, "                  verdict: String(o.verdict || '').substring(0,200), note: t.note });",
               "                  verdict: String(o.verdict || '').substring(0,200), note: lkNote_('work', i, t.note) });")
    src = sub1(src, '''    var q = qById(p.qid);
    this._ok({ ok: p.given === q.correct, correct: q.correct,
               correctText: q.options[q.correct], note: q.note,''',
               '''    var q = qById(p.qid), lq = qLoc_(q);
    this._ok({ ok: p.given === q.correct, correct: q.correct,
               correctText: lq.options[q.correct], note: lq.note,''')
    src = sub1(src, '''      feedback.push({ id:q.id, topic:q.topic, code:q.code, text:q.text, options:q.options,
                      given: (typeof given === 'number') ? given : -1,
                      correct:q.correct, ok:ok, note:q.note });''',
               '''      var lq = qLoc_(q);
      feedback.push({ id:q.id, topic:q.topic, code:q.code, text:lq.text, options:lq.options,
                      given: (typeof given === 'number') ? given : -1,
                      correct:q.correct, ok:ok, note:lq.note });''')
    # подписи, собранные из кусков, — через словарь
    src = sub1(src, "  var label = (step + 1 < DATA.total) ? 'Следующее задание' : 'Посмотреть результат';",
               "  var label = tx((step + 1 < DATA.total) ? 'Следующее задание' : 'Посмотреть результат');")
    src = sub1(src, "    chip.title = 'Задание ' + (i + 1) + ' · ' + q.topic;",
               "    chip.title = tx('Задание') + ' ' + (i + 1) + ' · ' + q.topic;")
    src = sub1(src, "    chip.title = (x.extra ? 'Дополнительная задача ' : 'Задача ') + (i + 1) + ' · ' + x.name;",
               "    chip.title = tx(x.extra ? 'Дополнительная задача' : 'Задача') + ' ' + (i + 1) + ' · ' + x.name;")
    return src


def patch_teacher(src, sub1):
    return sub1(src, "    card.appendChild(el('div', 'qnum', 'Карточка ' + (i + 1) + ' из ' + R.cards.length));",
                "    card.appendChild(el('div', 'qnum', tx('Карточка') + ' ' + (i + 1) + ' / ' + R.cards.length));")
