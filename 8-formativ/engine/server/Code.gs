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

/** Бір рет қолмен іске қосыңыз: кесте жасалады және тексеру хаты жіберіледі (рұқсаттар сұралады). */
function setup() {
  var ss = book_();
  Logger.log('Кесте: ' + ss.getUrl());
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, 'Формативтік жұмыстар (8-сынып) — пошта жұмыс істейді', 'Бұл тексеру хаты. Оқушылардың нәтижелері осы поштаға келеді.\nЭто проверочное письмо: результаты учеников будут приходить на эту почту.\nКесте / таблица: ' + ss.getUrl());
  Logger.log('Хат жіберілді / письмо отправлено: ' + to);
}

function doGet() {
  return ContentService.createTextOutput('Формативтік жұмыстар: нәтижелерді қабылдау жұмыс істеп тұр.');
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || String(d.app || '').indexOf(APP) !== 0) return out_('skip');
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
