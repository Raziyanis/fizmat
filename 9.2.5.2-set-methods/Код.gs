/**
 * Сервер урока для файлов ученика и учителя (Google Apps Script).
 *
 * Что делает:
 *  - принимает от страницы ученика ответы теста, этапы урока и ответы учителю
 *    и записывает их строкой на лист «Журнал» Google-таблицы;
 *  - отдаёт странице учителя все записи урока (по ключу), а странице ученика —
 *    только его переписку с учителем;
 *  - по команде учителя: письмо с отчётом, лист «Сводка», очистка ответов.
 *
 * Баллы здесь не считаются: их считает сама страница учителя по заданиям,
 * которые в неё вшиты. Поэтому один и тот же скрипт подходит к любому уроку,
 * собранному по этому шаблону: записи разных уроков различаются полем lesson.
 *
 * Как запустить — см. README.md рядом с этим файлом.
 */

var SHEET_LOG = 'Журнал';
var SHEET_SUMMARY = 'Сводка';
var HEAD = ['Время', 'Урок', 'Тип', 'Номер записи', 'Класс', 'Ученик', 'Данные'];
var SCRIPT_VERSION = 'set v1 · 10 ноября';

/* ---------------- настройка ---------------- */

/** Запустите один раз: создаёт таблицу и ключ учителя, печатает их в журнал. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = openBook_();
  var key = props.getProperty('TEACHER_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    props.setProperty('TEACHER_KEY', key);
  }
  Logger.log('Таблица: ' + ss.getUrl());
  Logger.log('Ключ учителя (TOKEN): ' + key);
  Logger.log('Теперь: Начать развертывание → Новое развертывание → Веб-приложение, ' +
             'запуск от имени «Я», доступ «Все». Скопируйте ссылку, которая заканчивается на /exec.');
  return { url: ss.getUrl(), key: key };
}

/** Показывает ключ и таблицу ещё раз, если их потеряли. */
function diagnose() {
  var props = PropertiesService.getScriptProperties();
  var ss = openBook_();
  var log = ss.getSheetByName(SHEET_LOG);
  Logger.log('Таблица: ' + ss.getUrl());
  Logger.log('Ключ учителя (TOKEN): ' + (props.getProperty('TEACHER_KEY') || '— запустите setup()'));
  Logger.log('Записей в журнале: ' + Math.max(0, log.getLastRow() - 1));
}

function openBook_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('BOOK_ID');
  var ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Урок — ответы учеников');
    props.setProperty('BOOK_ID', ss.getId());
  }
  var log = ss.getSheetByName(SHEET_LOG);
  if (!log) {
    log = ss.getSheets()[0];
    log.setName(SHEET_LOG);
  }
  if (log.getLastRow() === 0) {
    log.appendRow(HEAD);
    log.setFrozenRows(1);
  }
  return ss;
}

function teacherKey_() {
  return PropertiesService.getScriptProperties().getProperty('TEACHER_KEY') || '';
}

/* ---------------- приём записей ---------------- */

function doPost(e) {
  var p;
  try {
    p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'не JSON' });
  }
  var type = String(p.type || 'finish');
  var lesson = clip_(p.lesson || '', 60);

  // команды учителя — только с ключом
  if (['ask', 'report', 'summary', 'clear'].indexOf(type) > -1) {
    if (!p.token || p.token !== teacherKey_()) return json_({ ok: false, error: 'неверный ключ' });
    if (type === 'report') return json_(sendReport_(p));
    if (type === 'summary') return json_(writeSummary_(p));
    if (type === 'clear') return json_(clearLesson_(lesson));
  }
  if (['answer', 'finish', 'stage', 'reply', 'ask'].indexOf(type) < 0) {
    return json_({ ok: false, error: 'неизвестный тип записи' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var uid = clip_(p.uid || '', 60);
    var cache = CacheService.getScriptCache();
    if (uid && cache.get('uid:' + uid)) return json_({ ok: true, duplicate: true });
    var log = openBook_().getSheetByName(SHEET_LOG);
    delete p.token;
    log.appendRow([new Date(), lesson, type, uid, clip_(p.klass || '', 40), clip_(p.name || '', 80),
                   clip_(JSON.stringify(p), 45000)]);
    if (uid) cache.put('uid:' + uid, '1', 21600);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/* ---------------- выдача ---------------- */

function doGet(e) {
  var q = (e && e.parameter) || {};
  var cb = String(q.callback || '');
  if (cb && !/^[A-Za-z_$][\w$]{0,80}$/.test(cb)) cb = '';
  var out;
  if (q.data === 'results') {
    out = (q.key && q.key === teacherKey_())
      ? results_(String(q.lesson || ''))
      : { error: 'Неверный ключ учителя. Проверьте TOKEN в файле учителя (функция diagnose() покажет ключ).' };
  } else if (q.data === 'messages') {
    out = messages_(String(q.lesson || ''), String(q.klass || ''), String(q.name || ''));
  } else {
    out = { ok: true, version: SCRIPT_VERSION, hint: 'Сервер урока работает.' };
  }
  var text = JSON.stringify(out);
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

/** Все записи урока — странице учителя. */
function results_(lesson) {
  var ss = openBook_();
  var rows = readLog_(ss, lesson);
  return { ok: true, version: SCRIPT_VERSION, rows: rows, spreadsheetUrl: ss.getUrl() };
}

/** Переписка одного ученика с учителем — странице ученика. */
function messages_(lesson, klass, name) {
  if (!name) return [];
  var me = norm_(klass) + '|' + norm_(name);
  return readLog_(openBook_(), lesson).filter(function (r) {
    return (r.type === 'ask' || r.type === 'reply') && norm_(r.klass) + '|' + norm_(r.name) === me;
  }).map(function (r) {
    return { author: r.type === 'ask' ? 'Учитель' : r.name, text: r.p.text || '',
             qid: r.p.qid || '', time: r.time };
  });
}

function readLog_(ss, lesson) {
  var log = ss.getSheetByName(SHEET_LOG);
  var n = log.getLastRow() - 1;
  if (n < 1) return [];
  var values = log.getRange(2, 1, n, HEAD.length).getValues();
  var tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  var out = [];
  values.forEach(function (v) {
    if (lesson && String(v[1]) !== lesson) return;
    var p = {};
    try { p = JSON.parse(v[6] || '{}'); } catch (e) { p = {}; }
    var when = v[0] instanceof Date ? v[0] : new Date(v[0]);
    out.push({ ts: when.getTime(), time: Utilities.formatDate(when, tz, 'HH:mm'),
               type: String(v[2]), uid: String(v[3]), klass: String(v[4]), name: String(v[5]), p: p });
  });
  return out;
}

/* ---------------- команды учителя ---------------- */

/** Письмо учителю: текст отчёта собирает страница учителя. */
function sendReport_(p) {
  var to = Session.getEffectiveUser().getEmail();
  if (!to) return { ok: false, error: 'не удалось узнать почту владельца скрипта' };
  MailApp.sendEmail(to, clip_(p.subject || 'Отчёт урока', 200), String(p.text || ''));
  return { ok: true, to: to };
}

/** Лист «Сводка»: строки готовит страница учителя. */
function writeSummary_(p) {
  var ss = openBook_();
  var sh = ss.getSheetByName(SHEET_SUMMARY) || ss.insertSheet(SHEET_SUMMARY);
  sh.clearContents();
  var head = p.header || [];
  var rows = (p.rows || []).filter(function (r) { return r && r.length === head.length; });
  if (head.length) sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows);
  sh.setFrozenRows(1);
  return { ok: true, rows: rows.length, url: ss.getUrl() + '#gid=' + sh.getSheetId() };
}

/** Удаляет записи этого урока. Ничего другого не трогает. */
function clearLesson_(lesson) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var log = openBook_().getSheetByName(SHEET_LOG);
    var n = log.getLastRow() - 1;
    if (n < 1) return { ok: true, wiped: 0 };
    var values = log.getRange(2, 1, n, HEAD.length).getValues();
    var keep = values.filter(function (v) { return lesson && String(v[1]) !== lesson; });
    var wiped = values.length - keep.length;
    log.getRange(2, 1, n, HEAD.length).clearContent();
    if (keep.length) log.getRange(2, 1, keep.length, HEAD.length).setValues(keep);
    return { ok: true, wiped: wiped };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- мелочи ---------------- */

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function clip_(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }
function norm_(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(); }
