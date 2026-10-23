/**
 * Урок «Математические функции» (8 класс) — серверная часть.
 * Ученики открывают веб-приложение без входа в Google и сами вписывают класс и имя;
 * учитель открывает ту же ссылку с ?page=teacher и входит по PIN.
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
  if (st.getLastRow() < 3) st.appendRow(["Проверять список учеников (да/нет)", "да"]);
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

/** Класс к виду «8А» (латинские A, B, C… → русские), имя — с заглавных букв. */
function normClass_(v) {
  const map = { A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М", O: "О", P: "Р", T: "Т", X: "Х" };
  return String(v || "").toUpperCase().replace(/\s+/g, "").replace(/[ABCEHKMOPTX]/g, function (ch) { return map[ch]; }).slice(0, 20);
}
function normName_(v) {
  return String(v || "").trim().replace(/\s+/g, " ").split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join(" ").slice(0, 80);
}

/** Ключ для сравнения имён: без регистра, ё = е, порядок слов не важен. */
function key_(name) {
  return normName_(name).toLowerCase().replace(/ё/g, "е").split(" ").sort().join(" ");
}

function lev_(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Проверять ли ученика по списку (лист «Настройки», B3: да/нет). */
function checkRoster_() {
  return String(sheet_("settings").getRange("B3").getValue()).trim().toLowerCase() !== "нет";
}

/**
 * Вход ученика. Если список на листе «Ученики» заполнен и проверка включена,
 * пускает только тех, кто есть в списке; при опечатке предлагает похожее имя.
 */
function registerStudent(cls, name) {
  cls = normClass_(clean_(cls, 20).replace(/^'/, ""));
  name = normName_(clean_(name, 80).replace(/^'/, ""));
  if (!/^\d{1,2}[А-ЯЁ]?$/.test(cls)) throw new Error("Класс пишется так: цифра и буква, например 8А.");
  if (name.split(" ").length < 2) throw new Error("Впиши фамилию и имя через пробел.");
  const roster = getRoster();
  const hasList = Object.keys(roster).length > 0;
  if (hasList && checkRoster_()) {
    const list = roster[cls];
    if (!list || !list.length) throw new Error("Класса " + cls + " нет в списке. Проверь, как написан класс.");
    const k = key_(name);
    const hit = list.filter(function (s) { return key_(s) === k; })[0];
    if (hit) return { id: cls + " | " + hit, cls: cls, name: hit };
    let best = null, bd = 99;
    list.forEach(function (s) { const dd = lev_(key_(s), k); if (dd < bd) { bd = dd; best = s; } });
    if (best && (bd <= 2 || (bd <= 3 && k.length >= 12))) return { suggest: best, cls: cls };
    throw new Error("Тебя нет в списке класса " + cls + ". Проверь, как написаны фамилия и имя, или скажи учителю.");
  }
  withLock_(function () {
    const list = getRoster()[cls] || [];
    if (!list.some(function (s) { return key_(s) === key_(name); })) sheet_("roster").appendRow([cls, name]);
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
  return { q: q, want: want, questions: questions, answers: answers, attempts: attempts, progress: progress, roster: getRoster() };
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
