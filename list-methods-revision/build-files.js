/**
 * Собирает два самостоятельных файла из тех же страниц, что работают по ссылке:
 *
 *   fayl-uchenika.html  — ученику. Работает без интернета: задания, проверка
 *                         и оценивание внутри файла. Работы уходят в таблицу,
 *                         как только появляется связь.
 *   fayl-uchitelya.html — учителю. Открывается с диска и сам подтягивает
 *                         данные из таблицы, когда есть интернет.
 *
 * Запуск:  node build-files.js [ссылка-на-/exec] [токен-учителя]
 *
 * Ссылку и токен выводит функция setup() в журнале выполнения.
 * Оба файла содержат фамилии учеников, файл ученика — ещё и правильные
 * ответы, файл учителя — токен. Поэтому они в .gitignore.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const read = (n) => fs.readFileSync(path.join(DIR, n), 'utf8');

const WEB_APP_URL = process.argv[2] ||
  'https://script.google.com/macros/s/AKfycbxhAQ8MvqxRp-TmunuVPe5nzxnqadBf1Iw0I0XmHHfQbF4DzdEnCK35M57-HiQXiP9e/exec';
const TEACHER_TOKEN = process.argv[3] || 'ТОКЕН-НЕ-ЗАДАН';

const code = read('code.gs');
const QUESTIONS = eval(code.match(/var QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
const LESSON = eval('(' + code.match(/var LESSON = (\{[\s\S]*?\n\});/)[1] + ')');
const VERSION = code.match(/var APP_VERSION = '([^']+)'/)[1];

function roster() {
  const file = path.join(DIR, 'classes.csv');
  if (!fs.existsSync(file)) return [];
  const rows = read('classes.csv').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1)
    .map((l) => l.split(',').map((x) => x.trim()))
    .filter((p) => p.length >= 2 && p[0] && p[1]);
  const map = {}, order = [];
  for (const [klass, name] of rows) {
    if (!map[klass]) { map[klass] = []; order.push(klass); }
    if (map[klass].indexOf(name) === -1) map[klass].push(name);
  }
  order.sort((a, b) => a.localeCompare(b, 'ru'));
  return order.map((k) => ({ klass: k, students: map[k].sort((a, b) => a.localeCompare(b, 'ru')) }));
}
const CLASSES = roster();

/** Вставляет слой-заглушку перед собственным скриптом страницы. */
function withShim(html, shim, title) {
  const i = html.indexOf('<script>');
  if (i === -1) throw new Error('в ' + title + ' не найден <script>');
  return html.slice(0, i) + '<script>\n' + shim + '\n</script>\n' + html.slice(i);
}

/* ------------------------------------------------------------------ */
/* Общая часть: очередь отправки                                       */
/* ------------------------------------------------------------------ */

const QUEUE = `
var SEND_URL = ${JSON.stringify(WEB_APP_URL)};
var QKEY = 'listmethods.outbox.v1';
var lastConfirmed = true;

function qRead(){ try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch(e){ return []; } }
function qWrite(l){ try { localStorage.setItem(QKEY, JSON.stringify(l)); return true; } catch(e){ return false; } }
function qAdd(p){ var l = qRead(); l.push(p); return qWrite(l); }
function qDrop(uid){ qWrite(qRead().filter(function(x){ return x.uid !== uid; })); }

/**
 * Отправка на сервер. Файл открыт с диска, поэтому браузер обычно не даёт
 * прочитать ответ; тогда отправляем вслепую. Повтор безопасен: у каждой
 * записи свой номер, и второй строки сервер не создаст.
 */
function sendOne(payload){
  var body = JSON.stringify(payload);
  var head = { 'Content-Type': 'text/plain;charset=utf-8' };
  return fetch(SEND_URL, { method:'POST', headers: head, body: body })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (!res || (!res.ok && res.error)) throw new Error(res.error || 'сервер отказал');
      lastConfirmed = true; return res;
    })
    .catch(function(){
      return fetch(SEND_URL, { method:'POST', mode:'no-cors', headers: head, body: body })
        .then(function(){ lastConfirmed = false; return { ok: true }; });
    });
}

var sending = false;
function qFlush(onState){
  var list = qRead();
  if (!list.length || sending) { if (onState) onState(qRead().length ? 'left' : 'empty'); return; }
  sending = true;
  var item = list[0];
  sendOne(item)
    .then(function(){ sending = false; qDrop(item.uid); qFlush(onState); })
    .catch(function(){ sending = false; if (onState) onState('failed'); });
}
window.addEventListener('online', function(){ qFlush(); });
setInterval(function(){ if (qRead().length) qFlush(); }, 30000);
`;

/* ------------------------------------------------------------------ */
/* Файл ученика                                                        */
/* ------------------------------------------------------------------ */

const STUDENT_SHIM = `
/* Самостоятельный файл ученика: сервера нет, всё считается здесь. */
var OFFLINE = true;
var Q = ${JSON.stringify(QUESTIONS)};
var L = ${JSON.stringify(LESSON)};
var CL = ${JSON.stringify(CLASSES)};
var VER = ${JSON.stringify(VERSION)};
${QUEUE}

function nrm(v){ return String(v == null ? '' : v).toLowerCase().replace(/ё/g,'е').replace(/\\s+/g,'').trim(); }
function okAnswer(given, list){
  var g = nrm(given);
  if (!g) return false;
  for (var i = 0; i < list.length; i++) if (nrm(list[i]) === g) return true;
  return false;
}
function qById(id){ for (var i=0;i<Q.length;i++) if (Q[i].id===id) return Q[i]; return null; }

function gradeCheck(ans){
  var score = 0, detail = [];
  L.check.items.forEach(function(it, i){
    var given = ans[String(i)], got = 0;
    if (it.kind === 'tf') { if (typeof given === 'boolean' && given === it.answer) got = it.points; }
    else if (it.kind === 'choice') { if (given === it.answer) got = it.points; }
    else if (it.kind === 'gap') { if (okAnswer(given, it.accept)) got = it.points; }
    else if (it.kind === 'match') {
      var pairs = given || {};
      for (var k = 0; k < it.left.length; k++) if (Number(pairs[String(k)]) === k) got++;
    }
    score += got;
    detail.push({ n: i+1, got: got, max: it.points, note: it.note });
  });
  return { score: score, total: L.check.total, detail: detail };
}

function gradeWork(ans, klass, name){
  var score = 0, detail = [];
  L.work.tasks.forEach(function(t, i){
    var given = ans[String(i)];
    var vs = t.variants || [];
    var accept = vs.length ? vs[foVariant(klass, name, i, vs.length)].accept : t.accept;
    var ok = okAnswer(given, accept);
    if (ok) score += t.points;
    detail.push({ n: i+1, got: ok ? t.points : 0, max: t.points,
                  skipped: !String(given == null ? '' : given).trim(),
                  given: String(given || '').substring(0,120), note: t.note });
  });
  return { score: score, total: L.work.total, detail: detail };
}

function uidLocal(){ return 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

window.google = { script: { run: {
  withSuccessHandler: function(f){ var c = Object.create(this); c._ok = f; c._fail = this._fail; return c; },
  withFailureHandler: function(f){ var c = Object.create(this); c._fail = f; c._ok = this._ok; return c; },

  getStudentData: function(){
    this._ok({
      version: VER, lesson: L, email: '', total: Q.length, classes: CL,
      questions: Q.map(function(q){
        return { id:q.id, topic:q.topic, code:q.code, text:q.text, options:q.options };
      })
    });
  },

  checkAccess: function(){ this._ok({ allowed: true, used: 0, max: 3 }); },

  answerQuestion: function(p){
    var q = qById(p.qid);
    this._ok({ ok: p.given === q.correct, correct: q.correct,
               correctText: q.options[q.correct], note: q.note,
               number: Q.indexOf(q) + 1 });
  },

  finishAttempt: function(p){
    var score = 0, feedback = [];
    Q.forEach(function(q){
      var given = p.answers[q.id];
      var ok = given === q.correct;
      if (ok) score++;
      feedback.push({ id:q.id, topic:q.topic, code:q.code, text:q.text, options:q.options,
                      given: (typeof given === 'number') ? given : -1,
                      correct:q.correct, ok:ok, note:q.note });
    });
    qAdd({ uid: p.uid, attempt: p.attempt, klass: p.klass, name: p.name,
           answers: p.answers, addToClass: p.addToClass });
    qFlush();
    this._ok({ score: score, total: Q.length, feedback: feedback, duplicate: false });
  },

  submitStage: function(p){
    var res;
    if (p.stage === 'check') res = gradeCheck(p.answers || {});
    else if (p.stage === 'work') res = gradeWork(p.answers || {}, p.klass, p.name);
    else res = { score: '', total: '', detail: [], choice: p.choice, text: p.text };
    qAdd({ type: 'stage', uid: p.uid || uidLocal(), klass: p.klass, name: p.name,
           stage: p.stage, answers: p.answers || {}, choice: p.choice || '', text: p.text || '' });
    qFlush();
    this._ok(res);
  },

  getMyMessages: function(){ this._ok([]); },
  replyToTeacher: function(){ this._ok({}); }
} } };
`;

/* ------------------------------------------------------------------ */
/* Файл учителя                                                        */
/* ------------------------------------------------------------------ */

const TEACHER_SHIM = `
/* Самостоятельный файл учителя: данные подтягиваются из таблицы.
   Задания, список урока и классы вшиты сюда же, поэтому страница
   показывает разбор и вызывает учеников даже без связи. */
var TOKEN = ${JSON.stringify(TEACHER_TOKEN)};
var Q = ${JSON.stringify(QUESTIONS)};
var L = ${JSON.stringify(LESSON)};
var CL = ${JSON.stringify(CLASSES)};
var VER = ${JSON.stringify(VERSION)};
${QUEUE}

/** Каркас без ответов класса: задания есть, цифры пустые. */
function localSkeleton(){
  var roster = [];
  CL.forEach(function(c){ c.students.forEach(function(n){ roster.push({klass:c.klass, name:n}); }); });
  return {
    version: VER, lesson: L, roster: roster, stages: {}, students: [],
    perQuestion: Q.map(function(q, i){
      return { id:q.id, number:i+1, topic:q.topic, text:q.text, code:q.code,
               options: q.options.map(function(o, oi){
                 return { text:o, count:0, correct: oi === q.correct }; }),
               note: q.note, correctText: q.options[q.correct], correct: q.correct,
               right: [], wrong: [], silent: roster.slice(),
               answered: 0, rightCount: 0, wrongCount: 0, silentCount: roster.length, percent: 0 };
    }),
    dialog: [],
    classes: CL.map(function(c){
      return { klass:c.klass, expected:c.students.length, answered:0, extra:0 }; }),
    missing: roster.slice(), total: Q.length, average: 0, spreadsheetUrl: '',
    offlineOnly: true
  };
}

var CACHE_KEY = 'listmethods.teachercache.v1';
var jsonpN = 0;

/** Читаем данные тегом <script>: обычный запрос с диска браузер не пустит. */
function pullResults(onOk, onFail){
  var name = '__lm' + (++jsonpN) + '_' + Date.now();
  var done = false;
  var tag = document.createElement('script');
  window[name] = function(data){
    done = true;
    try { delete window[name]; } catch(e) { window[name] = undefined; }
    if (tag.parentNode) tag.parentNode.removeChild(tag);
    if (data && data.error) { onFail(new Error(data.error)); return; }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch(e) {}
    onOk(data);
  };
  tag.src = SEND_URL + '?data=results&key=' + encodeURIComponent(TOKEN) + '&callback=' + name;
  tag.onerror = function(){ if (!done) onFail(new Error('нет связи с таблицей')); };
  document.head.appendChild(tag);
  setTimeout(function(){ if (!done) onFail(new Error('таблица не ответила')); }, 20000);
}

function cachedResults(){
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch(e){ return null; }
}

window.google = { script: { run: {
  withSuccessHandler: function(f){ var c = Object.create(this); c._ok = f; c._fail = this._fail; return c; },
  withFailureHandler: function(f){ var c = Object.create(this); c._fail = f; c._ok = this._ok; return c; },

  getResults: function(){
    var ok = this._ok;
    pullResults(ok, function(){
      // связи нет: показываем последнее загруженное, а если его нет —
      // задания и списки классов из самого файла
      var old = cachedResults();
      if (old) { old.stale = true; ok(old); }
      else { ok(localSkeleton()); }
    });
  },

  askStudent: function(p){
    qAdd({ type: 'ask', token: TOKEN, uid: p.uid, klass: p.klass,
           name: p.name, qid: p.qid, text: p.text });
    qFlush();
    this._ok({ ok: true });
  }
} } };
`;

const student = withShim(read('student.html'), STUDENT_SHIM, 'student.html');
const teacher = withShim(read('teacher.html'), TEACHER_SHIM, 'teacher.html');

fs.writeFileSync(path.join(DIR, 'fayl-uchenika.html'), student);
fs.writeFileSync(path.join(DIR, 'fayl-uchitelya.html'), teacher);

console.log('версия:', VERSION);
console.log('fayl-uchenika.html :', Math.round(student.length / 1024) + ' КБ,',
            QUESTIONS.length, 'заданий,',
            CLASSES.reduce((n, c) => n + c.students.length, 0), 'учеников');
console.log('fayl-uchitelya.html:', Math.round(teacher.length / 1024) + ' КБ');
console.log('отправка и чтение:', WEB_APP_URL);
if (TEACHER_TOKEN === 'ТОКЕН-НЕ-ЗАДАН') {
  console.log('! токен учителя не передан: выполните setup() и пересоберите с токеном');
}
