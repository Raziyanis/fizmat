# -*- coding: utf-8 -*-
"""Связь файлов урока с сервером Код.gs.

Ученик: каждая запись уходит с полем lesson; ответы теста уходят сразу,
по одному, — учитель видит, кто на каком задании; переписка с учителем
работает через сервер.

Учитель: забирает с сервера журнал записей урока и сам строит из него всё,
что показывает: таблицу теста, разбор по заданиям, баллы этапов, программы
практики, рефлексию, переписку. Отчёт на почту и лист «Сводка» тоже
собирает сама страница, сервер только отправляет и записывает."""

LESSON_ID = 'set-9.2.5.2'

COMMON_SENDONE_OLD = ("  if (!SEND_URL) return Promise.reject(new Error('таблица урока не подключена'));\n"
                      "  var body = JSON.stringify(payload);")
COMMON_SENDONE_NEW = ("  if (!SEND_URL) return Promise.reject(new Error('таблица урока не подключена'));\n"
                      "  payload.lesson = payload.lesson || LESSON_ID;\n"
                      "  var body = JSON.stringify(payload);")

JSONP = r'''
/* Запрос к серверу тегом <script>: с диска обычный запрос браузер не пустит. */
var jsonpN_ = 0;
function jsonp_(params, onOk, onFail, waitMs) {
  if (!SEND_URL) { setTimeout(function () { onFail(new Error('no-sheet')); }, 0); return; }
  var name = '__srv' + (++jsonpN_) + '_' + Date.now();
  var done = false;
  var tag = document.createElement('script');
  window[name] = function (data) {
    done = true;
    try { delete window[name]; } catch (e) { window[name] = undefined; }
    if (tag.parentNode) tag.parentNode.removeChild(tag);
    if (data && data.error) { onFail(new Error(data.error)); return; }
    onOk(data);
  };
  var q = [];
  for (var k in params) if (params.hasOwnProperty(k)) q.push(k + '=' + encodeURIComponent(params[k]));
  q.push('lesson=' + encodeURIComponent(LESSON_ID));
  q.push('callback=' + name);
  tag.src = SEND_URL + (SEND_URL.indexOf('?') > -1 ? '&' : '?') + q.join('&');
  tag.onerror = function () { if (!done) { done = true; onFail(new Error('нет связи с таблицей')); } };
  document.head.appendChild(tag);
  setTimeout(function () { if (!done) { done = true; onFail(new Error('таблица не ответила')); } }, waitMs || 20000);
}
'''

# ---------------- ученик ----------------
STUDENT_ANSWER_OLD = "  answerQuestion: function(p){\n"
STUDENT_ANSWER_NEW = ("  answerQuestion: function(p){\n"
                      "    // каждый ответ сразу уходит учителю: видно, кто на каком задании\n"
                      "    qAdd({ type: 'answer', uid: p.uid, attempt: p.attempt, klass: p.klass, name: p.name,\n"
                      "           qid: p.qid, given: p.given });\n"
                      "    qFlush();\n")

STUDENT_CHAT_OLD = ("  getMyMessages: function(){ this._ok([]); },\n"
                    "  replyToTeacher: function(){ this._ok({}); }")
STUDENT_CHAT_NEW = r'''  getMyMessages: function(klass, name){
    var ok = this._ok;
    jsonp_({ data: 'messages', klass: klass || '', name: name || '' }, function (list) {
      ok((list || []).map(function (m) {
        var q = qById(m.qid);
        return { author: m.author, text: m.text, time: m.time, qid: m.qid,
                 number: q ? Q.indexOf(q) + 1 : 0 };
      }));
    }, function () { ok([]); }, 15000);
  },
  replyToTeacher: function(p){
    qAdd({ type: 'reply', uid: p.uid, klass: p.klass, name: p.name, qid: p.qid, text: p.text });
    qFlush();
    this._ok({ ok: true });
  }'''

# ---------------- учитель ----------------
TEACHER_PULL = r'''
/* ---------- данные класса: журнал с сервера → всё, что на экране ---------- */
function nk_(k, n) { return (String(k || '') + '|' + String(n || '')).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(); }
function nrm_(v) { return String(v == null ? '' : v).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, '').trim(); }
function accepted_(given, list) {
  var g = nrm_(given);
  if (!g) return false;
  for (var i = 0; i < list.length; i++) if (nrm_(list[i]) === g) return true;
  return false;
}
function qNum_(qid) { for (var i = 0; i < Q.length; i++) if (Q[i].id === qid) return i + 1; return 0; }

/** Один этап ученика: баллы считаем по заданиям, вшитым в файл. */
function stageRecord_(rec, p) {
  var ans = p.answers || {};
  if (p.stage === 'check') {
    var marks = [], score = 0;
    L.check.items.forEach(function (it, i) {
      var g = ans[String(i)], got = 0;
      if (it.kind === 'tf') { if (typeof g === 'boolean' && g === it.answer) got = it.points; }
      else if (it.kind === 'choice') { if (g === it.answer) got = it.points; }
      else if (it.kind === 'gap') { if (accepted_(g, it.accept)) got = it.points; }
      else if (it.kind === 'match') {
        var pairs = g || {};
        for (var k = 0; k < it.left.length; k++) if (Number(pairs[String(k)]) === k) got++;
      }
      marks.push(g === undefined ? null : got);
      score += got;
    });
    rec.check = { score: score, marks: marks, done: true };
  } else if (p.stage === 'work') {
    var wm = [], codes = [], ws = 0;
    L.work.tasks.forEach(function (t, i) {
      var a = ans[String(i)], o = (a && typeof a === 'object') ? a : {};
      var code = String(o.code == null ? '' : o.code);
      var got = o.ok === true ? t.points : 0;
      wm.push(code.trim() || o.ok === true ? got : null);
      codes.push({ code: code, got: got, verdict: String(o.verdict || '') });
      if (!t.extra) ws += got;
    });
    rec.work = { score: ws, marks: wm, codes: codes, done: p.final !== false };
  } else if (p.stage === 'decide') {
    var ds = 0;
    L.decide.items.forEach(function (it, i) { if (ans[String(i)] === it.answer) ds++; });
    rec.decide = { score: ds };
  } else if (p.stage === 'reflection') {
    rec.reflection = String(p.choice || '') + (p.text ? ' — ' + p.text : '');
  }
}

/** Из журнала записей собирает то же, что раньше присылал сервер. */
function buildFromLog_(raw) {
  var rows = (raw.rows || []).slice().sort(function (a, b) { return a.ts - b.ts; });
  var seenUid = {};
  rows = rows.filter(function (r) {
    if (!r.uid) return true;
    if (seenUid[r.uid]) return false;
    seenUid[r.uid] = true;
    return true;
  });

  var roster = [], inRoster = {}, extraBy = {};
  CL.forEach(function (c) {
    c.students.forEach(function (n) { roster.push({ klass: c.klass, name: n }); inRoster[nk_(c.klass, n)] = true; });
  });

  var tests = {}, stages = {}, dialog = [];
  rows.forEach(function (r) {
    var p = r.p || {};
    var key = nk_(r.klass, r.name);
    if (r.type === 'answer' || r.type === 'finish') {
      var s = tests[key] || (tests[key] = { klass: r.klass, name: r.name, att: {}, last: '', fin: 0, time: '' });
      var id = String(p.attempt || 'a');
      var a = s.att[id] || (s.att[id] = { answers: {}, finished: false });
      if (r.type === 'answer') {
        if (typeof p.given === 'number') a.answers[p.qid] = p.given;
      } else {
        a.answers = p.answers || a.answers;
        if (!a.finished) s.fin++;
        a.finished = true;
      }
      s.last = id; s.time = r.time;
      if (p.addToClass && !inRoster[key]) {
        inRoster[key] = true;
        roster.push({ klass: r.klass, name: r.name });
        extraBy[r.klass] = (extraBy[r.klass] || 0) + 1;
      }
    } else if (r.type === 'stage') {
      var rec = stages[key] || (stages[key] = { klass: r.klass, name: r.name });
      stageRecord_(rec, p);
    } else if (r.type === 'ask' || r.type === 'reply') {
      dialog.push({ klass: r.klass, name: r.name, qid: p.qid || '', text: p.text || '',
                    time: r.time, author: r.type === 'ask' ? 'Учитель' : r.name, number: qNum_(p.qid) });
    }
  });

  var students = Object.keys(tests).map(function (k) {
    var s = tests[k], a = s.att[s.last];
    var marks = [], score = 0, answered = 0;
    Q.forEach(function (q) {
      var g = a.answers[q.id];
      if (typeof g !== 'number') { marks.push(-1); return; }
      answered++;
      if (g === q.correct) { score++; marks.push(1); } else marks.push(0);
    });
    return { klass: s.klass, name: s.name, finished: a.finished, score: score, total: Q.length,
             answered: answered, attempts: s.fin, time: s.time, marks: marks, given: a.answers };
  }).sort(function (x, y) {
    return x.klass.localeCompare(y.klass, 'ru') || x.name.localeCompare(y.name, 'ru');
  });

  var perQuestion = Q.map(function (q, i) {
    var right = [], wrong = [], silent = [], counts = q.options.map(function () { return 0; }), seen = {};
    students.forEach(function (s) {
      var g = s.given[q.id];
      if (typeof g !== 'number') return;
      seen[nk_(s.klass, s.name)] = true;
      counts[g] = (counts[g] || 0) + 1;
      (g === q.correct ? right : wrong).push({ klass: s.klass, name: s.name, chosen: q.options[g] });
    });
    roster.forEach(function (p) { if (!seen[nk_(p.klass, p.name)]) silent.push({ klass: p.klass, name: p.name }); });
    var answered = right.length + wrong.length;
    return { id: q.id, number: i + 1, topic: q.topic, text: q.text, code: q.code,
             options: q.options.map(function (o, oi) { return { text: o, count: counts[oi] || 0, correct: oi === q.correct }; }),
             note: q.note, correctText: q.options[q.correct], correct: q.correct,
             right: right, wrong: wrong, silent: silent, answered: answered,
             rightCount: right.length, wrongCount: wrong.length, silentCount: silent.length,
             percent: answered ? Math.round(right.length / answered * 100) : 0 };
  });

  var finishedKey = {};
  students.forEach(function (s) { if (s.finished) finishedKey[nk_(s.klass, s.name)] = s; });
  var classes = CL.map(function (c) {
    var n = 0;
    roster.forEach(function (p) { if (p.klass === c.klass && finishedKey[nk_(p.klass, p.name)]) n++; });
    return { klass: c.klass, expected: c.students.length, answered: n, extra: extraBy[c.klass] || 0 };
  });
  var missing = roster.filter(function (p) { return !finishedKey[nk_(p.klass, p.name)]; });
  var fin = students.filter(function (s) { return s.finished; });
  var sum = 0; fin.forEach(function (s) { sum += s.score; });

  return {
    version: VER, lesson: L, lessonKk: LKK, uiKk: UKK, questionsKk: QKK,
    roster: roster, stages: stages, students: students, perQuestion: perQuestion, dialog: dialog,
    classes: classes, missing: missing, total: Q.length,
    average: fin.length ? Math.round(sum / fin.length * 10) / 10 : 0,
    spreadsheetUrl: raw.spreadsheetUrl || ''
  };
}

/** Строка на ученика: все этапы урока — для письма и листа «Сводка». */
function summaryRows_(klass) {
  var d = LAST || {};
  var test = {};
  (d.students || []).forEach(function (s) { test[nk_(s.klass, s.name)] = s; });
  return (d.roster || []).filter(function (p) { return !klass || p.klass === klass; }).map(function (p) {
    var k = nk_(p.klass, p.name), s = test[k], st = (d.stages || {})[k] || {};
    return [p.klass, p.name,
            s ? s.score + ' / ' + s.total + (s.finished ? '' : ' …') : '—',
            st.check ? st.check.score + ' / ' + L.check.total : '—',
            st.work ? st.work.score + ' / ' + L.work.total + (st.work.done ? '' : ' …') : '—',
            st.decide ? st.decide.score + ' / ' + L.decide.items.length : '—',
            st.reflection || ''];
  });
}
var SUMMARY_HEAD_ = ['Класс', 'Ученик', 'Повторение', 'Понимание', 'Практика', 'Выбор структуры', 'Рефлексия'];

var CACHE_KEY = 'setmethods.teachercache.v2';

function pullResults(onOk, onFail){
  jsonp_({ data: 'results', key: TOKEN }, function (raw) {
    var data = buildFromLog_(raw || {});
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
    onOk(patchLang(data));
  }, function (err) {
    // ключ не подошёл — забываем его, при следующем открытии файл спросит снова
    if (/ключ/i.test(String(err && err.message))) {
      forgetKey_();
      err = new Error('Мұғалім кілті қате. Бетті жаңартып (F5), кілтті қайта енгізіңіз. ' +
                      'Ключ учителя не подошёл — обновите страницу и введите его заново');
    }
    onFail(err);
  }, 20000);
}
'''

TEACHER_CMDS_OLD = '''  sendReportNow: function(klass){
    var ok = this._ok, fail = this._fail;
    sendOne({ type: 'report', token: TOKEN, klass: klass || '',
              uid: 'r' + Date.now().toString(36) })
      .then(function(){ ok({ ok: true }); })
      .catch(function(e){ fail(e); });
  },

  buildSummaryNow: function(){
    var ok = this._ok, fail = this._fail;
    sendOne({ type: 'summary', token: TOKEN, uid: 's' + Date.now().toString(36) })
      .then(function(res){ ok(res || { ok: true }); })
      .catch(function(e){ fail(e); });
  },

  clearResultsNow: function(){
    var ok = this._ok, fail = this._fail;
    sendOne({ type: 'clear', token: TOKEN, uid: 'c' + Date.now().toString(36) })
      .then(function(res){ ok(res && res.wiped !== undefined ? res.wiped : 0); })
      .catch(function(e){ fail(e); });
  }'''
TEACHER_CMDS_NEW = '''  sendReportNow: function(klass){
    var ok = this._ok, fail = this._fail;
    var rows = summaryRows_(klass || '');
    var text = rows.map(function (r) {
      return r[0] + ' · ' + r[1] + '\\n  ' + SUMMARY_HEAD_.slice(2).map(function (h, i) {
        return h + ': ' + r[i + 2];
      }).join('\\n  ');
    }).join('\\n\\n');
    sendOne({ type: 'report', token: TOKEN, klass: klass || '',
              subject: (L.title || 'Урок') + ' — ' + (klass || 'все классы'),
              text: text || 'Пока нет ответов.', uid: 'r' + Date.now().toString(36) })
      .then(function(res){ ok(res || { ok: true }); })
      .catch(function(e){ fail(e); });
  },

  buildSummaryNow: function(){
    var ok = this._ok, fail = this._fail;
    var rows = summaryRows_('');
    sendOne({ type: 'summary', token: TOKEN, header: SUMMARY_HEAD_, rows: rows,
              uid: 's' + Date.now().toString(36) })
      .then(function(res){
        ok({ ok: true, rows: (res && res.rows) || rows.length,
             url: (res && res.url) || (LAST && LAST.spreadsheetUrl) || '' });
      })
      .catch(function(e){ fail(e); });
  },

  clearResultsNow: function(){
    var ok = this._ok, fail = this._fail;
    sendOne({ type: 'clear', token: TOKEN, uid: 'c' + Date.now().toString(36) })
      .then(function(res){ ok(res && res.wiped !== undefined ? res.wiped : 0); })
      .catch(function(e){ fail(e); });
  }'''


def patch_common(src, sub1, url, token):
    src = sub1(src, 'var SEND_URL = "";', 'var SEND_URL = %s;\nvar LESSON_ID = "%s";' % (
        '"' + url.replace('"', '') + '"', LESSON_ID))
    src = sub1(src, COMMON_SENDONE_OLD, COMMON_SENDONE_NEW)
    src = sub1(src, 'function qRead(){', JSONP + 'function qRead(){')
    return src


def patch_student(src, sub1, url, token):
    src = patch_common(src, sub1, url, token)
    src = sub1(src, STUDENT_ANSWER_OLD, STUDENT_ANSWER_NEW)
    src = sub1(src, STUDENT_CHAT_OLD, STUDENT_CHAT_NEW)
    return src


def patch_teacher(src, sub1, url, token):
    src = patch_common(src, sub1, url, token)
    return _rest(src, sub1)


ASK_KEY = r'''
/* Ключ учителя: если его нет в файле, спрашиваем один раз и запоминаем на этом компьютере. */
var KEY_STORE = 'setmethods.teacherkey';
(function () {
  if (TOKEN) return;
  try { TOKEN = localStorage.getItem(KEY_STORE) || ''; } catch (e) {}
  if (TOKEN || !SEND_URL) return;
  var k = window.prompt(
    'Мұғалім кілтін (TOKEN) енгізіңіз. Ол Apps Script-те diagnose() функциясын іске қосқанда журналда шығады.\n\n' +
    'Введите ключ учителя (TOKEN) — он есть в журнале функции diagnose() в Apps Script.', '');
  if (k && k.trim()) {
    TOKEN = k.trim();
    try { localStorage.setItem(KEY_STORE, TOKEN); } catch (e) {}
  }
})();
function forgetKey_() {
  try { localStorage.removeItem(KEY_STORE); } catch (e) {}
}
'''


def set_token(src, sub1, token):
    import re
    assert len(re.findall(r'^var TOKEN = ".*";$', src, re.M)) == 1
    src = re.sub(r'^var TOKEN = ".*";$', lambda m: 'var TOKEN = "%s";' % token.replace('"', ''), src, flags=re.M)
    # спросить ключ можно только после того, как объявлен SEND_URL
    return sub1(src, '\nvar LESSON_ID = ', ASK_KEY + '\nvar LESSON_ID = ')


def _rest(src, sub1):
    i = src.index("var CACHE_KEY = 'setmethods.teachercache.v1';")
    j = src.index('/** Казахский перевод и текст урока лежат в самом файле.', i)
    src = src[:i] + TEACHER_PULL.lstrip('\n') + '\n' + src[j:]
    src = sub1(src, TEACHER_CMDS_OLD, TEACHER_CMDS_NEW)
    return src
