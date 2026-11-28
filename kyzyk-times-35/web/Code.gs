/**
 * ҚЫЗЫҚ TIMES — Special Edition 35 · веб-ресурс для шоу (Google Apps Script)
 *
 * Страница участников:  <ссылка веб-приложения>            (…/exec)
 * Страница жюри:        <ссылка веб-приложения>?page=jury  (…/exec?page=jury)
 *
 * Все данные хранятся в Google Таблице «Қызық Times 35 — данные» (создаётся функцией setup).
 */

var JURY_PIN = '';              // ПИН-код жюри отключён. Чтобы включить, впишите код, например '3535'
var CODE_LENGTH = 4;            // длина кода команды

// ---------------------------------------------------------------- этапы и ключи
var STAGES = ['teams', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'final'];

// Ответы раундов 1, 2 (варианты, которые засчитываются автоматически). Жюри может исправить любую отметку.
var KEY = {
  r1: [
    ['1991'],
    ['конституция', 'ата заң'],
    ['теңге', 'тенге', 'tenge'],
    ['астана', 'astana'],
    ['қалдаяқов', 'калдаяков', 'шәмші'],
    ['байқоңыр', 'байконур', 'baikonur'],
    ['тәуелсіздік', 'независимост'],
    ['қыран', 'бүркіт', 'орел', 'орёл', 'беркут'],
    ['1992'],
    ['kzt']
  ],
  r2: [
    ['ту', 'туы', 'флаг', 'байрақ'],
    ['бәйтерек', 'байтерек'],
    ['байқоңыр', 'байконур', 'космодром', 'ғарыш айлағы'],
    ['абай', 'құнанбай', 'кунанбаев'],
    ['нұр әлем', 'нур алем', 'нурәлем', 'expo', 'экспо', 'сфера']
  ],
  r4: ['true', 'false', 'true', 'false', 'false']
};
var POINTS = { r1: 1, r2: 2, r3: 2, r4: 2 };
var COUNT = { r1: 10, r2: 5, r3: 5, r4: 5 };
var CRITERIA = {
  r5: [['fit', 2], ['orig', 2], ['team', 1]],
  r6: [['actual', 3], ['orig', 4], ['real', 4], ['pres', 4]]
};
var NOMINATIONS = ['tapqyr', 'creative', 'captain'];
var SERVER_VERSION = 3;   // страницы проверяют версию и предупреждают, если Code.gs устарел

// ---------------------------------------------------------------- веб-приложение
function doGet(e) {
  if (e && e.parameter && e.parameter.api) {
    var args = [];
    try { args = JSON.parse(e.parameter.args || '[]'); } catch (err) {}
    return api_(e.parameter.api, args, e.parameter.callback);
  }
  var page = (e && e.parameter && e.parameter.page === 'jury') ? 'Jury' : 'Participant';
  try { HtmlService.createHtmlOutputFromFile(page); } catch (err) {
    // HTML-файлы в проект не добавлены: страницы раздаются как отдельные файлы — сервер при этом работает
    return HtmlService.createHtmlOutput('<p style="font:16px Arial;padding:24px">Қызық Times 35: сервер жұмыс істеп тұр ✓<br>Сервер работает. Откройте файл Participant.html или Jury.html.</p>');
  }
  return HtmlService.createHtmlOutputFromFile(page)
    .setTitle(page === 'Jury' ? 'Қызық Times 35 · Қазылар' : 'Қызық Times 35 · Қатысушылар')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** JSON-API: позволяет открывать Participant.html и Jury.html как отдельные файлы (они обращаются к этому скрипту). */
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}
  return api_(body.fn, body.args || []);
}
var API_ = {
  p_register: function (a) { return p_register(a[0]); },
  p_join: function (a) { return p_join(a[0], a[1]); },
  p_state: function (a) { return p_state(a[0], a[1]); },
  p_submit: function (a) { return p_submit(a[0], a[1], a[2], a[3]); },
  p_answer: function (a) { return p_answer(a[0], a[1], a[2], a[3], a[4]); },
  j_all: function (a) { return j_all(a[0]); },
  j_setState: function (a) { return j_setState(a[0], a[1]); },
  j_mark: function (a) { return j_mark(a[0], a[1], a[2], a[3], a[4]); },
  j_score: function (a) { return j_score(a[0], a[1], a[2], a[3], a[4]); },
  j_setR3Key: function (a) { return j_setR3Key(a[0], a[1]); },
  j_adj: function (a) { return j_adj(a[0], a[1], a[2], a[3]); },
  j_variant: function (a) { return j_variant(a[0], a[1], a[2], a[3], a[4]); },
  j_unlock: function (a) { return j_unlock(a[0], a[1], a[2]); },
  j_setNom: function (a) { return j_setNom(a[0], a[1], a[2]); },
  j_editTeam: function (a) { return j_editTeam(a[0], a[1], a[2]); },
  j_deleteTeam: function (a) { return j_deleteTeam(a[0], a[1]); },
  j_reset: function (a) { return j_reset(a[0]); }
};
function api_(fn, args, callback) {
  var out;
  try {
    if (!API_.hasOwnProperty(fn)) throw new Error('Белгісіз әрекет');
    out = { ok: true, result: API_[fn](args) };
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  var json = JSON.stringify(out);
  if (callback && /^[A-Za-z_$][\w$.]{0,60}$/.test(callback)) {   // JSONP для страниц, открытых как файл
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Запустите один раз из редактора: создаёт таблицу с данными. */
function setup() {
  var ss = getSS_();
  Logger.log('Таблица с данными: ' + ss.getUrl());
}

// ---------------------------------------------------------------- хранилище (ключ → JSON)
function getSS_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SS_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) { /* таблицу удалили — создаём заново */ }
  }
  var ss = SpreadsheetApp.create('Қызық Times 35 — данные');
  var db = ss.getSheets()[0];
  db.setName('DB');
  db.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  ss.insertSheet('Нәтиже');
  props.setProperty('SS_ID', ss.getId());
  return ss;
}
function dbSheet_() { return getSS_().getSheetByName('DB'); }

function dbLoad_() {
  var cache = CacheService.getScriptCache();
  var c = cache.get('db');
  if (c) return JSON.parse(c);
  var vals = dbSheet_().getDataRange().getValues();
  var data = {}, rows = {};
  for (var i = 1; i < vals.length; i++) {
    var k = String(vals[i][0]);
    if (!k) continue;
    rows[k] = i + 1;
    if (vals[i][1] !== '' && vals[i][1] !== null) data[k] = JSON.parse(vals[i][1]);
  }
  var st = { data: data, rows: rows };
  dbCache_(st);
  return st;
}
function dbCache_(st) {
  try { CacheService.getScriptCache().put('db', JSON.stringify(st), 21600); }
  catch (err) { CacheService.getScriptCache().remove('db'); }
}
/** Записывает несколько ключей под блокировкой. value === null удаляет ключ. */
function dbWrite_(changes, alreadyLocked) {
  var lock = alreadyLocked ? null : LockService.getScriptLock();
  if (lock) lock.waitLock(20000);
  try {
    CacheService.getScriptCache().remove('db');
    var st = dbLoad_();
    var sh = dbSheet_();
    Object.keys(changes).forEach(function (k) {
      var v = changes[k];
      var txt = v === null ? '' : JSON.stringify(v);
      if (st.rows[k]) {
        sh.getRange(st.rows[k], 2).setValue(txt);
      } else if (v !== null) {
        sh.appendRow([k, txt]);
        st.rows[k] = sh.getLastRow();
      }
      if (v === null) delete st.data[k]; else st.data[k] = v;
    });
    dbCache_(st);
    return st.data;
  } finally {
    if (lock) lock.releaseLock();
  }
}
function data_() { return dbLoad_().data; }

// ---------------------------------------------------------------- общие помощники
function state_(d) {
  return d.state || { stage: 'teams', open: true, showResults: false };
}
function teams_(d) {
  return Object.keys(d).filter(function (k) { return k.indexOf('team:') === 0; })
    .map(function (k) { return d[k]; })
    .sort(function (a, b) { return a.created - b.created; });
}
function publicTeam_(t) {
  return { id: t.id, name: t.name, motto: t.motto, captain: t.captain, members: t.members, cls: t.cls };
}
function clean_(s, max) {
  return String(s === undefined || s === null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max || 200);
}
function checkPin_(pin) {
  if (!JURY_PIN) return;
  if (String(pin) !== String(JURY_PIN)) throw new Error('ПИН-код қате · Неверный ПИН-код');
}
function checkTeam_(d, teamId, code) {
  var t = d['team:' + teamId];
  if (!t || String(t.code) !== String(code)) throw new Error('Команда табылмады · Команда не найдена');
  return t;
}

// Нормализация ответа: регистр, ё/е, казахские буквы → русские аналоги, без знаков препинания
function norm_(s) {
  var map = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'һ': 'х', 'і': 'и', 'ё': 'е', 'й': 'и' };
  return String(s || '').toLowerCase()
    .replace(/[әғқңөұүһіёй]/g, function (c) { return map[c]; })
    .replace(/[^a-zа-я0-9]+/g, ' ').trim();
}
function lev_(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  var p = [], i, j;
  for (j = 0; j <= b.length; j++) p[j] = j;
  for (i = 1; i <= a.length; i++) {
    var c = [i];
    for (j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = c;
  }
  return p[b.length];
}
/** Совпадает ли ответ с одним из вариантов. Короткие варианты — целым словом, длинные — с 1 опечаткой. */
function matches_(answer, variants) {
  var a = norm_(answer);
  if (!a) return false;
  var words = a.split(' ');
  return variants.some(function (v) {
    var n = norm_(v);
    if (!n) return false;
    if (n.length <= 3) return words.indexOf(n) >= 0;
    if (a.indexOf(n) >= 0) return true;
    if (n.indexOf(' ') < 0 && n.length >= 5) {
      return words.some(function (w) { return lev_(w, n) <= 1; });
    }
    return false;
  });
}
function r3Key_(d) { return d.r3key || ['', '', '', '', '']; }
/** Синонимы, добавленные жюри: d.extra[round][i] = [..] */
function extra_(d, round, i) { return (d.extra && d.extra[round] && d.extra[round][i]) || []; }

/** Автопроверка одного ответа. null — проверить нельзя (нет ключа). */
function auto_(d, round, i, answer) {
  if (answer === undefined || answer === null || String(answer).trim() === '') return false;
  if (round === 'r4') return String(answer) === KEY.r4[i];
  if (round === 'r3') {
    var k = r3Key_(d)[i];
    var vars = (k ? k.split(';') : []).concat(extra_(d, 'r3', i));
    if (!vars.length) return null;
    return matches_(answer, vars);
  }
  return matches_(answer, KEY[round][i].concat(extra_(d, round, i)));
}

/** Полный расчёт: отметки по вопросам, баллы по раундам, итог и места. */
function compute_(d) {
  var list = teams_(d);
  var rows = list.map(function (t) {
    var sc = d['score:' + t.id] || {};
    var r = { id: t.id, name: t.name, rounds: {}, marks: {}, adj: {}, total: 0 };
    ['r1', 'r2', 'r3', 'r4'].forEach(function (rd) {
      var ans = (d['ans:' + t.id + ':' + rd] || {}).answers || [];
      var ov = sc[rd] || {};
      var pts = 0, marks = [];
      for (var i = 0; i < COUNT[rd]; i++) {
        var a = auto_(d, rd, i, ans[i]);
        var m = (ov[i] === true || ov[i] === false) ? ov[i] : a;   // ручная отметка жюри важнее автопроверки
        marks.push({ auto: a, final: m, override: (ov[i] === true || ov[i] === false) });
        if (m === true) pts += POINTS[rd];
      }
      var adj = Number(ov.adj) || 0;
      r.marks[rd] = marks;
      r.adj[rd] = adj;
      r.rounds[rd] = Math.max(0, Math.min(COUNT[rd] * POINTS[rd], pts + adj));
    });
    ['r5', 'r6'].forEach(function (rd) {
      var c = sc[rd] || {}, pts = 0;
      CRITERIA[rd].forEach(function (cr) {
        var v = Number(c[cr[0]]);
        if (!isNaN(v)) pts += Math.max(0, Math.min(cr[1], v));
      });
      r.rounds[rd] = pts;
    });
    r.total = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].reduce(function (s, k) { return s + r.rounds[k]; }, 0);
    return r;
  });
  var sorted = rows.slice().sort(function (a, b) { return b.total - a.total; });
  sorted.forEach(function (r, i) {
    r.place = (i > 0 && r.total === sorted[i - 1].total) ? sorted[i - 1].place : i + 1;
  });
  return rows;
}

function writeResultsSheet_(d) {
  try {
    var sh = getSS_().getSheetByName('Нәтиже') || getSS_().insertSheet('Нәтиже');
    var rows = compute_(d).sort(function (a, b) { return a.place - b.place; });
    var out = [['Орын', 'Команда', 'Бәйге /10', 'Көр де тап /10', 'Әуенді тап /10', 'AI /10', 'Қызық тапсырма /5', 'Болашақ /15', 'Барлығы /60']];
    rows.forEach(function (r) {
      out.push([r.place, r.name, r.rounds.r1, r.rounds.r2, r.rounds.r3, r.rounds.r4, r.rounds.r5, r.rounds.r6, r.total]);
    });
    sh.clearContents();
    sh.getRange(1, 1, out.length, out[0].length).setValues(out);
  } catch (err) { /* таблица результатов — вспомогательная, ошибки не мешают шоу */ }
}

// ================================================================ API участников
function p_register(form) {
  var name = clean_(form && form.name, 40);
  if (!name) throw new Error('Команда атауын жазыңыз · Введите название команды');
  var d = data_();
  var exists = teams_(d).some(function (t) { return norm_(t.name) === norm_(name); });
  if (exists) throw new Error('Мұндай атау бар · Такое название уже занято');
  var id = Utilities.getUuid().slice(0, 8);
  var code = '';
  for (var i = 0; i < CODE_LENGTH; i++) code += Math.floor(Math.random() * 10);
  var members = (form.members || []).map(function (m) { return clean_(m, 60); }).filter(String).slice(0, 8);
  var team = {
    id: id, code: code, name: name, motto: clean_(form.motto, 120), captain: clean_(form.captain, 60),
    cls: clean_(form.cls, 10), members: members, created: Date.now()
  };
  var ch = {}; ch['team:' + id] = team;
  dbWrite_(ch);
  return { id: id, code: code, team: publicTeam_(team) };
}

function p_join(name, code) {
  var d = data_();
  var t = teams_(d).filter(function (x) { return norm_(x.name) === norm_(name) && String(x.code) === String(code).trim(); })[0];
  if (!t) throw new Error('Атауы не коды қате · Неверное название или код');
  return { id: t.id, code: t.code, team: publicTeam_(t) };
}

/** Опрос состояния участником. Возвращает этап, свои ответы и (если открыто) результаты. */
function p_state(teamId, code) {
  var d = data_();
  var st = state_(d);
  var t = teamId ? d['team:' + teamId] : null;
  var res = { stage: st.stage, open: st.open, showResults: !!st.showResults, team: null, answers: {}, version: SERVER_VERSION };
  if (t && String(t.code) === String(code)) {
    res.team = publicTeam_(t);
    ['r1', 'r2', 'r3', 'r4', 'r6'].forEach(function (rd) {
      var a = d['ans:' + t.id + ':' + rd];
      if (a) res.answers[rd] = { answers: a.answers, at: a.at };
    });
  } else if (teamId) {
    res.lost = true;
  }
  if (st.showResults) {
    res.results = compute_(d).sort(function (a, b) { return a.place - b.place; })
      .map(function (r) { return { name: r.name, place: r.place, total: r.total, rounds: r.rounds }; });
    var noms = d.noms || {};
    res.noms = {};
    NOMINATIONS.forEach(function (n) {
      var nt = noms[n] && d['team:' + noms[n]];
      if (nt) res.noms[n] = nt.name;
    });
  }
  return res;
}

/** Ответ на один вопрос (раунды 1–4): вопросы открываются по очереди, отправленный ответ изменить нельзя. */
function p_answer(teamId, code, round, idx, value) {
  if (['r1', 'r2', 'r3', 'r4'].indexOf(round) < 0) throw new Error('Белгісіз раунд');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    CacheService.getScriptCache().remove('db');
    var d = data_();
    checkTeam_(d, teamId, code);
    var st = state_(d);
    if (st.stage !== round || !st.open) throw new Error('Жауап қабылдау жабық · Приём ответов закрыт');
    var prev = d['ans:' + teamId + ':' + round];
    var list = prev ? prev.answers.slice() : [];
    idx = Number(idx);
    if (idx < list.length) throw new Error('Бұл сұраққа жауап берілген · На этот вопрос уже ответили');
    if (idx !== list.length || idx >= COUNT[round]) throw new Error('Алдымен алдыңғы сұраққа жауап беріңіз');
    var v = clean_(value, 100);
    if (round === 'r4' && v !== 'true' && v !== 'false') v = '';
    list.push(v);
    var ch = {}; ch['ans:' + teamId + ':' + round] = { answers: list, at: Date.now() };
    dbWrite_(ch, true);
    return { ok: true, answers: list, at: Date.now() };
  } finally {
    lock.releaseLock();
  }
}

function p_submit(teamId, code, round, answers) {
  var d = data_();
  checkTeam_(d, teamId, code);
  var st = state_(d);
  if (round !== 'r6') throw new Error('Бұл раундта жауап бір-бірден жіберіледі');
  if (st.stage !== round || !st.open) throw new Error('Жауап қабылдау жабық · Приём ответов закрыт');
  if (d['ans:' + teamId + ':' + round]) throw new Error('Жауап бұрын жіберілген, өзгертуге болмайды · Ответ уже отправлен');
  var clean;
  if (round === 'r6') {
    clean = {
      title: clean_(answers && answers.title, 100), problem: clean_(answers && answers.problem, 600),
      solution: clean_(answers && answers.solution, 1200), benefit: clean_(answers && answers.benefit, 600)
    };
  } else {
    clean = [];
    for (var i = 0; i < COUNT[round]; i++) clean.push(clean_(answers && answers[i], 100));
  }
  var ch = {}; ch['ans:' + teamId + ':' + round] = { answers: clean, at: Date.now() };
  dbWrite_(ch);
  return { ok: true, at: Date.now() };
}

// ================================================================ API жюри
function j_all(pin) {
  checkPin_(pin);
  var d = data_();
  var list = teams_(d);
  var answers = {};
  list.forEach(function (t) {
    answers[t.id] = {};
    ['r1', 'r2', 'r3', 'r4', 'r6'].forEach(function (rd) {
      var a = d['ans:' + t.id + ':' + rd];
      if (a) answers[t.id][rd] = a;
    });
  });
  var scores = {};
  list.forEach(function (t) { scores[t.id] = d['score:' + t.id] || {}; });
  return {
    state: state_(d),
    teams: list.map(function (t) { var p = publicTeam_(t); p.code = t.code; return p; }),
    answers: answers,
    scores: scores,
    computed: compute_(d),
    key: { r1: KEY.r1, r2: KEY.r2, r4: KEY.r4, r3: r3Key_(d) },
    extra: d.extra || {},
    version: SERVER_VERSION,
    noms: d.noms || {},
    now: Date.now()
  };
}

function j_setState(pin, patch) {
  checkPin_(pin);
  var d = data_();
  var st = state_(d);
  if (patch.stage !== undefined) {
    if (STAGES.indexOf(patch.stage) < 0) throw new Error('Белгісіз кезең');
    st.stage = patch.stage;
  }
  if (patch.open !== undefined) st.open = !!patch.open;
  if (patch.showResults !== undefined) st.showResults = !!patch.showResults;
  dbWrite_({ state: st });
  return j_all(pin);
}

/** Отметка вопроса: value true/false — вручную, null — вернуть автопроверку. */
function j_mark(pin, teamId, round, idx, value) {
  checkPin_(pin);
  if (['r1', 'r2', 'r3', 'r4'].indexOf(round) < 0) throw new Error('Белгісіз раунд');
  var d = data_();
  if (!d['team:' + teamId]) throw new Error('Команда табылмады');
  var sc = d['score:' + teamId] || {};
  sc[round] = sc[round] || {};
  if (value === true || value === false) sc[round][idx] = value; else delete sc[round][idx];
  var ch = {}; ch['score:' + teamId] = sc;
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

function j_score(pin, teamId, round, field, value) {
  checkPin_(pin);
  var crit = (CRITERIA[round] || []).filter(function (c) { return c[0] === field; })[0];
  if (!crit) throw new Error('Белгісіз критерий');
  var d = data_();
  if (!d['team:' + teamId]) throw new Error('Команда табылмады');
  var sc = d['score:' + teamId] || {};
  sc[round] = sc[round] || {};
  if (value === '' || value === null || value === undefined) delete sc[round][field];
  else sc[round][field] = Math.max(0, Math.min(crit[1], Number(value) || 0));
  var ch = {}; ch['score:' + teamId] = sc;
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

/** Ручная поправка баллов раунда (может быть отрицательной). */
function j_adj(pin, teamId, round, value) {
  checkPin_(pin);
  if (['r1', 'r2', 'r3', 'r4'].indexOf(round) < 0) throw new Error('Белгісіз раунд');
  var d = data_();
  if (!d['team:' + teamId]) throw new Error('Команда табылмады');
  var sc = d['score:' + teamId] || {};
  sc[round] = sc[round] || {};
  var v = Math.round(Number(value) || 0);
  if (v) sc[round].adj = Math.max(-20, Math.min(20, v)); else delete sc[round].adj;
  var ch = {}; ch['score:' + teamId] = sc;
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

/** Добавить / убрать синоним правильного ответа (засчитывается всем командам). */
function j_variant(pin, round, idx, text, remove) {
  checkPin_(pin);
  if (['r1', 'r2', 'r3'].indexOf(round) < 0) throw new Error('Бұл раундқа синоним қосылмайды');
  var t = clean_(text, 100);
  if (!t) throw new Error('Бос мәтін');
  var d = data_();
  var ex = d.extra || {};
  ex[round] = ex[round] || {};
  var list = ex[round][idx] || [];
  list = list.filter(function (x) { return norm_(x) !== norm_(t); });
  if (!remove) list.push(t);
  if (list.length) ex[round][idx] = list; else delete ex[round][idx];
  writeResultsSheet_(dbWrite_({ extra: ex }));
  return j_all(pin);
}

/** Разрешить команде отправить ответ раунда заново (удаляет её ответ). */
function j_unlock(pin, teamId, round) {
  checkPin_(pin);
  var ch = {}; ch['ans:' + teamId + ':' + round] = null;
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

function j_setR3Key(pin, arr) {
  checkPin_(pin);
  var k = [];
  for (var i = 0; i < 5; i++) k.push(clean_(arr && arr[i], 200));
  writeResultsSheet_(dbWrite_({ r3key: k }));
  return j_all(pin);
}

function j_setNom(pin, nom, teamId) {
  checkPin_(pin);
  if (NOMINATIONS.indexOf(nom) < 0) throw new Error('Белгісіз номинация');
  var d = data_();
  var noms = d.noms || {};
  if (teamId) noms[nom] = teamId; else delete noms[nom];
  dbWrite_({ noms: noms });
  return j_all(pin);
}

function j_editTeam(pin, teamId, form) {
  checkPin_(pin);
  var d = data_();
  var t = d['team:' + teamId];
  if (!t) throw new Error('Команда табылмады');
  if (form.name !== undefined && clean_(form.name, 40)) t.name = clean_(form.name, 40);
  if (form.motto !== undefined) t.motto = clean_(form.motto, 120);
  if (form.captain !== undefined) t.captain = clean_(form.captain, 60);
  var ch = {}; ch['team:' + teamId] = t;
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

function j_deleteTeam(pin, teamId) {
  checkPin_(pin);
  var ch = {};
  ['team:', 'score:'].forEach(function (p) { ch[p + teamId] = null; });
  ['r1', 'r2', 'r3', 'r4', 'r6'].forEach(function (rd) { ch['ans:' + teamId + ':' + rd] = null; });
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}

/** Очистить всё (команды, ответы, баллы) — для репетиции. */
function j_reset(pin) {
  checkPin_(pin);
  var d = data_();
  var ch = {};
  Object.keys(d).forEach(function (k) { ch[k] = null; });
  ch.state = { stage: 'teams', open: true, showResults: false };
  writeResultsSheet_(dbWrite_(ch));
  return j_all(pin);
}
