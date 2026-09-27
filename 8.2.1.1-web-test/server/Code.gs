/**
 * 8.2.1.1 Проверочная работа — выдача неповторяющихся вариантов.
 *
 * Google Apps Script, публикуется как веб-приложение (см. README.md).
 * Хранит ТОЛЬКО: номер «раунда» (меняется при сбросе) и пары
 * «случайный идентификатор сессии → номер варианта».
 * Ответы, баллы, имена и любые другие данные учеников сюда не приходят.
 */

var VARIANTS = 15;
var TEACHER_PIN = '8211';   // ОБЯЗАТЕЛЬНО замените на свой PIN перед публикацией
var KEY = 'state';

function doGet(e) {
  return handle_((e && e.parameter) || {});
}

function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (err) {}
  return handle_(p);
}

function handle_(p) {
  var res;
  try {
    switch (p.action) {
      case 'status': res = status_(); break;
      case 'issue':  res = issue_(String(p.sid || '')); break;
      case 'stats':  res = withPin_(p.pin, stats_); break;
      case 'reset':  res = withPin_(p.pin, reset_); break;
      default:       res = { ok: false, error: 'bad_action' };
    }
  } catch (err) {
    res = { ok: false, error: 'server', message: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}

function load_() {
  var raw = PropertiesService.getScriptProperties().getProperty(KEY);
  var s = raw ? JSON.parse(raw) : null;
  if (!s || !s.issued) s = { round: newRound_(), issued: {} };
  return s;
}

function save_(s) {
  PropertiesService.getScriptProperties().setProperty(KEY, JSON.stringify(s));
}

function newRound_() {
  return Utilities.getUuid().slice(0, 8);
}

function status_() {
  var s = load_();
  return { ok: true, round: s.round, issued: Object.keys(s.issued).length, total: VARIANTS };
}

function issue_(sid) {
  if (!/^[a-z0-9-]{8,64}$/i.test(sid)) return { ok: false, error: 'bad_sid' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var s = load_();
    if (s.issued[sid]) return { ok: true, variant: s.issued[sid], round: s.round };
    var used = {};
    Object.keys(s.issued).forEach(function (k) { used[s.issued[k]] = true; });
    var free = [];
    for (var v = 1; v <= VARIANTS; v++) if (!used[v]) free.push(v);
    if (!free.length) return { ok: false, error: 'full', round: s.round };
    var pick = free[Math.floor(Math.random() * free.length)];
    s.issued[sid] = pick;
    save_(s);
    return { ok: true, variant: pick, round: s.round };
  } finally {
    lock.releaseLock();
  }
}

function withPin_(pin, fn) {
  if (String(pin || '') !== TEACHER_PIN) return { ok: false, error: 'pin' };
  return fn();
}

function stats_() {
  var s = load_();
  var list = Object.keys(s.issued).map(function (k) { return s.issued[k]; })
    .sort(function (a, b) { return a - b; });
  return { ok: true, round: s.round, issued: list.length, total: VARIANTS, variants: list };
}

function reset_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var s = { round: newRound_(), issued: {} };
    save_(s);
    return { ok: true, round: s.round, issued: 0, total: VARIANTS };
  } finally {
    lock.releaseLock();
  }
}

/** Сброс вручную из редактора Apps Script: выберите resetVariants → Выполнить. */
function resetVariants() {
  Logger.log(JSON.stringify(reset_()));
}
