/**
 * Урок «Математические функции» (8 класс) — серверная часть.
 * Ученики открывают веб-приложение без входа в Google, учитель — по ссылке с ?page=teacher и PIN.
 * Все данные лежат в Google Таблице, к которой привязан этот скрипт.
 */

const SHEETS = {
  roster:   { name: "Ученики",   head: ["Класс", "Ученик"] },
  progress: { name: "Прогресс",  head: ["ID", "Класс", "Ученик", "Этап", "Ожидания", "Какая функция", "С первой попытки", "Разминка «Ячейки»", "Уровень A", "Уровень B", "Уровень C", "Ожидания оправдались", "Все учащиеся", "Большинство", "Некоторые", "Где пригодится", "Комментарий", "Обновлено"] },
  attempts: { name: "Попытки",   head: ["Время", "Класс", "Ученик", "Этап", "Задание", "Ответ", "Верно", "Подсказка ученику"] },
  board:    { name: "Доска",     head: ["Время", "ID вопроса", "Вопрос", "Класс", "Ученик", "Ответ"] },
  settings: { name: "Настройки", head: ["Параметр", "Значение"] }
};

/** Запустить один раз из редактора: создаёт листы и запоминает таблицу. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", ss.getId());
  Object.keys(SHEETS).forEach(function (k) {
    const d = SHEETS[k];
    let sh = ss.getSheetByName(d.name);
    if (!sh) sh = ss.insertSheet(d.name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(d.head);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, d.head.length).setFontWeight("bold");
    }
  });
  const st = ss.getSheetByName(SHEETS.settings.name);
  if (st.getLastRow() < 2) st.appendRow(["PIN учителя", "1234"]);
}

function doGet(e) {
  const teacher = e && e.parameter && e.parameter.page === "teacher";
  return HtmlService.createHtmlOutputFromFile(teacher ? "Teacher" : "Lesson")
    .setTitle(teacher ? "Экран учителя" : "Информатика 8 класс")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/* ---------- служебное ---------- */

function sheet_(key) {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEETS[key].name);
  if (!sh) throw new Error("Нет листа «" + SHEETS[key].name + "». Запустите функцию setup.");
  return sh;
}

/** Обрезает текст и не даёт ему стать формулой в таблице. */
function clean_(v, max) {
  let s = String(v === null || v === undefined ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function time_(d) {
  return d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss") : String(d);
}

function rows_(key) {
  const sh = sheet_(key), n = sh.getLastRow(), w = SHEETS[key].head.length;
  return n > 1 ? sh.getRange(2, 1, n - 1, w).getValues() : [];
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- ученик ---------- */

function getRoster() {
  const map = {};
  rows_("roster").forEach(function (r) {
    const c = String(r[0]).trim(), s = String(r[1]).trim();
    if (c && s) (map[c] = map[c] || []).push(s);
  });
  Object.keys(map).forEach(function (c) { map[c].sort(function (a, b) { return a.localeCompare(b, "ru"); }); });
  return map;
}

function registerStudent(cls, name) {
  cls = clean_(cls, 20).replace(/^'/, "");
  name = clean_(name, 80).replace(/^'/, "");
  if (!cls || name.length < 3) throw new Error("Укажи класс, фамилию и имя.");
  withLock_(function () {
    const list = getRoster()[cls] || [];
    if (!list.some(function (s) { return s.toLowerCase() === name.toLowerCase(); })) sheet_("roster").appendRow([cls, name]);
  });
  return { id: cls + " | " + name, cls: cls, name: name };
}

function saveProgress(p) {
  const id = clean_(p.id, 120);
  if (!id) return false;
  const row = [id, clean_(p.cls, 20), clean_(p.name, 80), clean_(p.stage, 40), clean_(p.expect, 500),
    clean_(p.match, 10), Number(p.matchFirst) || 0, clean_(p.z, 10), clean_(p.a, 10), clean_(p.b, 10), clean_(p.c, 10),
    clean_(p.expOk, 20), clean_(p.r0, 20), clean_(p.r1, 20), clean_(p.r2, 20), clean_(p.use, 500), clean_(p.note, 500), new Date()];
  withLock_(function () {
    const sh = sheet_("progress");
    const n = sh.getLastRow();
    const hit = n > 1 ? sh.getRange(2, 1, n - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
    if (hit) sh.getRange(hit.getRow(), 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  });
  return true;
}

function logAttempt(a) {
  sheet_("attempts").appendRow([new Date(), clean_(a.cls, 20), clean_(a.name, 80), clean_(a.stage, 40),
    clean_(a.task, 80), clean_(a.answer, 300), a.ok ? "да" : "нет", clean_(a.note, 300)]);
  return true;
}

function getQuestion() {
  const cache = CacheService.getScriptCache();
  let q = cache.get("q");
  if (q === null) {
    q = PropertiesService.getScriptProperties().getProperty("Q") || "null";
    cache.put("q", q, 600);
  }
  return JSON.parse(q);
}

function setQuestion_(q) {
  const s = JSON.stringify(q);
  PropertiesService.getScriptProperties().setProperty("Q", s);
  CacheService.getScriptCache().put("q", s, 600);
}

function submitAnswer(a) {
  const q = getQuestion();
  if (!q || !q.open || q.id !== a.qid) throw new Error("Учитель уже закрыл этот вопрос.");
  const text = clean_(a.text, 1000);
  if (!text) throw new Error("Напиши ответ.");
  sheet_("board").appendRow([new Date(), q.id, clean_(q.text, 300), clean_(a.cls, 20), clean_(a.name, 80), text]);
  return true;
}

/* ---------- учитель ---------- */

function checkPin_(pin) {
  const v = String(sheet_("settings").getRange("B2").getValue()).trim();
  if (!v || String(pin).trim() !== v) throw new Error("Неверный PIN.");
}

function teacherLogin(pin) { checkPin_(pin); return true; }

function openQuestion(pin, text) {
  checkPin_(pin);
  text = String(text || "").trim().slice(0, 300);
  if (!text) throw new Error("Напишите вопрос.");
  const q = { id: "Q" + Date.now(), text: text, open: true };
  setQuestion_(q);
  return q;
}

function closeQuestion(pin) {
  checkPin_(pin);
  const q = getQuestion();
  if (q) { q.open = false; setQuestion_(q); }
  return q;
}

/** Всё для экрана учителя одним запросом: вопрос, ответы, попытки, прогресс. */
function getTeacherData(pin, qid, since) {
  checkPin_(pin);
  const board = rows_("board"), questions = [], seen = {};
  for (let i = board.length - 1; i >= 0; i--) {
    const id = String(board[i][1]);
    if (!seen[id]) { seen[id] = true; questions.push({ id: id, text: String(board[i][2]) }); }
  }
  const q = getQuestion();
  if (q && !seen[q.id]) questions.unshift({ id: q.id, text: q.text });
  const want = qid || (q ? q.id : (questions[0] && questions[0].id));
  const answers = board.filter(function (r) { return String(r[1]) === want; })
    .map(function (r) { return { t: time_(r[0]), cls: String(r[3]), name: String(r[4]), text: String(r[5]) }; });
  const att = rows_("attempts");
  const attempts = att.slice(Math.max(0, att.length - 400)).map(function (r) {
    return { t: time_(r[0]), cls: String(r[1]), name: String(r[2]), stage: String(r[3]), task: String(r[4]), answer: String(r[5]), ok: r[6] === "да", note: String(r[7]) };
  });
  const now = Date.now();
  const progress = rows_("progress").map(function (r) {
    const upd = r[17] instanceof Date ? r[17].getTime() : 0;
    return { cls: String(r[1]), name: String(r[2]), stage: String(r[3]), expect: String(r[4]), match: String(r[5]), matchFirst: r[6],
      z: String(r[7]), a: String(r[8]), b: String(r[9]), c: String(r[10]), expOk: String(r[11]), r0: String(r[12]), r1: String(r[13]), r2: String(r[14]),
      use: String(r[15]), note: String(r[16]), t: time_(r[17]), online: now - upd < 150000 };
  });
  return { q: q, want: want, questions: questions, answers: answers, attempts: attempts, progress: progress };
}

/** Очистить ответы и попытки перед новым уроком (список учеников остаётся). */
function clearLessonData(pin) {
  checkPin_(pin);
  ["progress", "attempts", "board"].forEach(function (k) {
    const sh = sheet_(k), n = sh.getLastRow();
    if (n > 1) sh.deleteRows(2, n - 1);
  });
  setQuestion_(null);
  return true;
}
