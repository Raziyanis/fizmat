/**
 * Информатика, 8-сынып — формативтік жұмыстар (барлық тақырыптарға бір скрипт) — приём результатов учеников по всем темам.
 * Google Apps Script, веб-қосымша ретінде жарияланады (README.md, «Нәтижелер мұғалімнің поштасына»).
 *
 * Оқушы жұмысты аяқтағанда веб-ресурс осы скриптке нәтижені жібереді. Скрипт:
 *   1) мұғалімге хат жібереді: аты-жөні, сыныбы, балы, әр есеп бойынша тесттер, нұсқаулар және оқушының коды (+ PDF);
 *   2) Google Кестесіне («Нәтижелер» парағы) бір жол қосады.
 */

var EMAIL = '';          // хат қай поштаға келеді (үтір арқылы бірнешеу); бос болса — скрипт иесінің поштасы
var SEND_EMAIL = true;   // false — хат жібермей, тек кестеге жазу
var SEND_PDF = true;     // хатқа есептің PDF нұсқасы тіркеледі / к письму прикладывается PDF
var SHEET_NAME = 'Нәтижелер';
var TIME_ZONE = 'Asia/Almaty';
var APP = 'fizmat-formativ-';   // барлық формативтік жұмыстардың белгісі / метка всех формативок
// Осы скрипт бұрын қабылдаған басқа веб-ресурстар да қабылданады / принимаются и прежние веб-ресурсы, отправлявшие на этот скрипт
var OTHER_APPS = { 'break-continue-8.1.4.5': '8.1.4.5 break, continue, else (13 есеп)' };

/** Бір рет қолмен іске қосыңыз: кесте жасалады және тексеру хаты жіберіледі (рұқсаттар сұралады). */
function setup() {
  var ss = book_();
  sheet_(); claimSheet_();
  Logger.log('Кесте: ' + ss.getUrl());
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, 'Формативтік жұмыстар (8-сынып) — пошта жұмыс істейді', 'Бұл тексеру хаты. Оқушылардың нәтижелері осы поштаға келеді.\nЭто проверочное письмо: результаты учеников будут приходить на эту почту.\nКесте / таблица: ' + ss.getUrl());
  Logger.log('Хат жіберілді / письмо отправлено: ' + to);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.a === 'claim') return claim_(p);
  return ContentService.createTextOutput('Формативтік жұмыстар: нәтижелерді қабылдау жұмыс істеп тұр.');
}

// Бір оқушы бір формативке LOCK_HOURS сағатта бір рет қана кіре алады (кез келген браузерден, кез келген компьютерден).
// Оқушы әзілмен басқаның атын таңдап қойса — мұғалім «Кірулер» парағынан сол жолды өшіреді, сонда кіру қайта ашылады.
var LOCK_HOURS = 24;
var CLAIM_SHEET = 'Кірулер';
function claim_(p) {
  var cb = /^[A-Za-z_$][\w$]{0,40}$/.test(p.cb || '') ? p.cb : 'cb';
  var res;
  try {
    if (String(p.app || '').indexOf(APP) !== 0) throw new Error('app');
    var key = [p.app, norm_(p.cls), norm_(p.name)].join('|'), now = Date.now(), lim = LOCK_HOURS * 3600 * 1000;
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sh = claimSheet_(), n = sh.getLastRow(), rows = n > 1 ? sh.getRange(2, 1, n - 1, 8).getValues() : [], found = null;
      for (var i = rows.length - 1; i >= 0; i--) {
        var r = rows[i], t = r[0] instanceof Date ? r[0].getTime() : 0;
        if (r[6] === 'кірді / вошёл' && [r[1], norm_(r[2]), norm_(r[3])].join('|') === key && now - t < lim) { found = { at: t, id: String(r[4]) }; break; }
      }
      var ok = !found || found.id === String(p.wid);
      if (!found || !ok) sh.appendRow([new Date(now), clip_(p.app, 60), safe_(p.cls), safe_(p.name), safe_(p.wid), safe_(p.ua), ok ? 'кірді / вошёл' : 'ҚАЙТА КІРУ ӘРЕКЕТІ / повторная попытка', found ? new Date(found.at) : '']);
      res = ok ? { ok: true } : { ok: false, at: found.at, until: found.at + lim };
    } finally { lock.releaseLock(); }
  } catch (err) {
    res = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(res) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function claimSheet_() {
  var ss = book_(), sh = ss.getSheetByName(CLAIM_SHEET);
  if (!sh) {
    sh = ss.insertSheet(CLAIM_SHEET);
    sh.appendRow(['Уақыты', 'Жұмыс', 'Сынып', 'Аты-жөні', 'ID', 'Браузер', 'Нәтиже', 'Алғашқы кіру']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  return sh;
}
function norm_(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase(); }

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d && d.app === LESSON_APP) return lesson_(d);
    if (!d || (String(d.app || '').indexOf(APP) !== 0 && !OTHER_APPS[d.app])) return out_('skip');
    if (!d.topic) d.topic = OTHER_APPS[d.app] || d.app;
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sh = sheet_();
      // бір нәтиже екі рет келсе (интернет үзіліп, қайта жіберілсе) — қайталамаймыз
      var ids = sh.getRange(1, 11, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return String(r[0]); });
      if (ids.indexOf(String(d.id)) >= 0) return out_('dup');
      // алдымен хат: хат жіберілмесе, жол жазылмайды — оқушының беті кейін қайта жібереді
      if (SEND_EMAIL) mail_(d);
      sh.appendRow([
        new Date(), safe_(d.topic), safe_(d.cls), safe_(d.name), num_(d.score), num_(d.max), safe_(d.time), num_(d.viol), safe_(d.reasonText),
        safe_((d.tasks || []).map(function (t) { return t.no + ': ' + t.pts; }).join('; ')), safe_(d.id), safe_(d.lang), num_(d.seed),
      ]);
    } finally { lock.releaseLock(); }
    return out_('ok');
  } catch (err) {
    return out_('error: ' + err);
  }
}

// Есеп (HTML): хаттың мәтіні және PDF үшін ортақ. pdf = true — PDF-ке ыңғайлы белгілер (✓/✗ орнына +/−)
function report_(d, pdf) {
  var when = Utilities.formatDate(new Date(), TIME_ZONE, 'dd.MM.yyyy HH:mm');
  var h = [], cell = 'border:1px solid #c9d1dc;padding:4px 6px;vertical-align:top;';
  h.push('<h2 style="margin:0 0 6px;font-family:Arial,sans-serif">' + esc_(d.name) + ', ' + esc_(d.cls) + '</h2>');
  h.push('<p style="font-family:Arial,sans-serif;font-size:16px;margin:4px 0">' + esc_(d.topic) + ' · ' + when + '</p>');
  h.push('<p style="font-family:Arial,sans-serif;font-size:18px;margin:4px 0"><b>' + d.score + ' / ' + d.max + '</b> балл</p>');
  h.push('<p style="font-family:Arial,sans-serif;color:#555;margin:4px 0 10px">Уақыты / время: ' + esc_(d.time) + ' · бұзушылық / нарушения: ' + d.viol + (d.reasonText ? ' · ' + esc_(d.reasonText) : '') + '</p>');
  h.push('<table cellpadding="4" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">');
  h.push('<tr style="background:#e8eef7"><th align="left" style="' + cell + '">№</th><th align="left" style="' + cell + '">Есеп / Задача</th><th align="left" style="' + cell + '">Түрі / Тип</th><th align="left" style="' + cell + '">Нәтиже / Результат</th><th align="left" style="' + cell + '">Балл</th><th align="left" style="' + cell + '">Код / жауаптар — код / ответы</th></tr>');
  (d.tasks || []).forEach(function (t) {
    var ok = t.pts > 0, col = ok ? '#1a7f37' : '#c62828', mark = pdf ? (ok ? '+ ' : '− ') : (ok ? '✓ ' : '✗ ');
    h.push('<tr><td style="' + cell + '">' + esc_(t.no) + '</td><td style="' + cell + '">' + esc_(t.title) + '</td>' +
      '<td style="' + cell + 'white-space:nowrap">' + esc_(t.tests) + '</td><td style="' + cell + '">' + esc_(t.need) + '</td>' +
      '<td style="' + cell + 'color:' + col + ';white-space:nowrap">' + mark + t.pts + '</td>' +
      '<td style="' + cell + '"><pre style="margin:0;font-family:Consolas,\'Courier New\',monospace;font-size:12px;white-space:pre-wrap">' + esc_(t.code || '—') + '</pre></td></tr>');
  });
  h.push('</table>');
  return h.join('\n');
}
function mail_(d) {
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  var subj = clip_(d.topic, 80) + ' · ' + clip_(d.cls, 20) + ' · ' + clip_(d.name, 60) + ' — ' + d.score + ' / ' + d.max;
  var msg = { to: to, subject: subj, htmlBody: report_(d, false) };
  if (SEND_PDF) {
    try {   // PDF жасалмаса да, хат PDF-сіз кетеді
      var fname = (clip_(d.topic, 40) + '_' + clip_(d.cls, 20) + '_' + clip_(d.name, 60)).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
      var page = '<html><head><meta charset="utf-8"></head><body style="margin:24px">' + report_(d, true) + '</body></html>';
      msg.attachments = [Utilities.newBlob(page, 'text/html', fname + '.html').getAs('application/pdf').setName(fname + '.pdf')];
    } catch (e) { msg.htmlBody += '<p style="color:#c62828">PDF жасалмады: ' + esc_(e) + '</p>'; }
  }
  MailApp.sendEmail(msg);
}
function book_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SHEET_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('Формативтік жұмыстар — нәтижелер (8-сынып)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  return ss;
}
function sheet_() {
  var ss = book_(), sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.getSheets()[0];
    sh.setName(SHEET_NAME);
    sh.appendRow(['Уақыты', 'Тақырып', 'Сынып', 'Аты-жөні', 'Балл', 'Макс.', 'Жұмыс уақыты', 'Бұзушылық', 'Аяқталу себебі', 'Есептер бойынша', 'ID', 'Тіл', 'Нұсқа (seed)']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 13).setFontWeight('bold');
  }
  return sh;
}
function out_(s) { return ContentService.createTextOutput(s); }
function num_(x) { var n = Number(x); return isFinite(n) ? n : ''; }
function clip_(s, n) { return String(s == null ? '' : s).slice(0, n); }
// кестеде формула ретінде орындалмасын
function safe_(s) { s = clip_(s, 2000); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// ===================== Сабақтар (веб-ресурс-сабақ) / Уроки =====================
// Оқушының әр жауабы «Урок — ответы» парағына жазылады, қорытынды — «Урок — итоги» парағында (әр оқушыға бір жол).
// Оқушы «Мұғалімге жіберу» батырмасын басқанда — барлық жауаптары бар жеке хат келеді.
var LESSON_APP = 'fizmat-lesson';
var LESSON_ANS = 'Урок — ответы', LESSON_SUM = 'Урок — итоги';
var LESSON_COLS = [
  ['stage', 'Где сейчас'], ['rev', '1. Повторим'], ['expect', 'Ожидания'], ['act', '4. Вспомним'], ['actFirst', '4. С 1-й попытки'],
  ['match', '7. Какой метод?'], ['matchFirst', '7. С 1-й попытки'], ['z', '8. Практика 0'], ['a', '8. Практика A'], ['b', '8. Практика B'], ['c', '8. Практика C'],
  ['now', 'Практика: сейчас'], ['desc', 'Описания'], ['pj', '9. Практ. работа'], ['olymp', 'Олимпиада'], ['test', '10. Тест'],
  ['expOk', 'Ожидания оправдались'], ['r0', 'Результат 1'], ['r1', 'Результат 2'], ['r2', 'Результат 3'], ['use', 'Где пригодится'], ['note', 'Комментарий'], ['hw', 'ДЗ']
];
function lessonSheet_(name, head) {
  var ss = book_(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}
function lesson_(d) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var key = clip_(d.lesson, 80) + '|' + clip_(d.id, 120), props = PropertiesService.getScriptProperties();
    // жауаптар: қайта жіберілгенде қайталанбайды (әр оқушыға сақталған жауаптар саны)
    var have = Number(props.getProperty('n:' + key) || 0), from = Number(d.from) || 0, list = d.attempts || [], rows = [];
    for (var i = Math.max(0, have - from); i < list.length; i++) {
      var a = list[i];
      rows.push([new Date(Number(a.t) || Date.now()), safe_(d.lesson), safe_(d.cls), safe_(d.name), safe_(a.stage), safe_(a.task), safe_(clip_(a.answer, 3000)), a.ok ? '✓' : '✗', safe_(a.note)]);
    }
    if (rows.length) {
      var sa = lessonSheet_(LESSON_ANS, ['Уақыты / Время', 'Урок', 'Класс', 'Фамилия и имя', 'Этап', 'Задание', 'Ответ ученика', 'Верно', 'Пояснение']);
      sa.getRange(sa.getLastRow() + 1, 1, rows.length, 9).setValues(rows);
      props.setProperty('n:' + key, String(Math.max(have, from + list.length)));
    }
    // қорытынды: әр оқушыға бір жол
    var head = ['Обновлено', 'Урок', 'Класс', 'Фамилия и имя'].concat(LESSON_COLS.map(function (c) { return c[1]; })).concat(['Письмо учителю', 'ID']);
    var ss = lessonSheet_(LESSON_SUM, head), sum = d.summary || {}, n = ss.getLastRow(), at = 0;
    var ids = n > 1 ? ss.getRange(2, head.length, n - 1, 1).getValues() : [];
    for (var r = 0; r < ids.length; r++) if (String(ids[r][0]) === key) { at = r + 2; break; }
    var mailed = at ? ss.getRange(at, head.length - 1).getValue() : '';
    if (d.finish && SEND_EMAIL) { lessonMail_(d, key); mailed = new Date(); }
    var row = [new Date(), safe_(d.lesson), safe_(d.cls), safe_(d.name)].concat(LESSON_COLS.map(function (c) { return safe_(sum[c[0]] == null ? '' : String(sum[c[0]])); })).concat([mailed, key]);
    if (at) ss.getRange(at, 1, 1, row.length).setValues([row]); else ss.appendRow(row);
  } finally { lock.releaseLock(); }
  return out_('ok');
}
function lessonMail_(d, key) {
  var to = EMAIL || Session.getEffectiveUser().getEmail(), sum = d.summary || {};
  var sa = lessonSheet_(LESSON_ANS, ['Уақыты / Время', 'Урок', 'Класс', 'Фамилия и имя', 'Этап', 'Задание', 'Ответ ученика', 'Верно', 'Пояснение']);
  var n = sa.getLastRow(), all = n > 1 ? sa.getRange(2, 1, n - 1, 9).getValues() : [];
  var mine = all.filter(function (r) { return String(r[1]) === String(d.lesson) && String(r[2]) === String(d.cls) && String(r[3]) === String(d.name); });
  var td = 'border:1px solid #c9d1dc;padding:4px 6px;vertical-align:top;font-family:Arial,sans-serif;font-size:13px;';
  var h = ['<h2 style="font-family:Arial,sans-serif;margin:0 0 4px">' + esc_(d.name) + ', ' + esc_(d.cls) + '</h2>',
    '<p style="font-family:Arial,sans-serif;margin:0 0 10px">' + esc_(d.lesson) + ' · ' + Utilities.formatDate(new Date(), TIME_ZONE, 'dd.MM.yyyy HH:mm') + '</p>',
    '<h3 style="font-family:Arial,sans-serif">Итоги по этапам</h3><table style="border-collapse:collapse">'];
  LESSON_COLS.forEach(function (c) { if (sum[c[0]] != null && String(sum[c[0]]) !== '') h.push('<tr><td style="' + td + 'background:#f3f6f9"><b>' + esc_(c[1]) + '</b></td><td style="' + td + '">' + esc_(sum[c[0]]) + '</td></tr>'); });
  h.push('</table><h3 style="font-family:Arial,sans-serif">Все ответы ученика (' + mine.length + ')</h3><table style="border-collapse:collapse"><tr>');
  ['Время', 'Этап', 'Задание', 'Ответ', 'Верно', 'Пояснение'].forEach(function (x) { h.push('<th style="' + td + 'background:#e9eef1">' + x + '</th>'); });
  h.push('</tr>');
  mine.forEach(function (r) {
    var ok = r[7] === '✓';
    h.push('<tr><td style="' + td + '">' + Utilities.formatDate(new Date(r[0]), TIME_ZONE, 'HH:mm') + '</td><td style="' + td + '">' + esc_(r[4]) + '</td><td style="' + td + '">' + esc_(r[5]) +
      '</td><td style="' + td + 'font-family:Consolas,monospace;white-space:pre-wrap">' + esc_(r[6]) + '</td><td style="' + td + 'color:' + (ok ? '#2e7d32' : '#c62828') + ';font-weight:bold">' + r[7] + '</td><td style="' + td + '">' + esc_(r[8]) + '</td></tr>');
  });
  h.push('</table>');
  MailApp.sendEmail({ to: to, subject: 'Урок: ' + clip_(d.lesson, 70) + ' · ' + clip_(d.cls, 20) + ' · ' + clip_(d.name, 60), htmlBody: h.join('') });
}
