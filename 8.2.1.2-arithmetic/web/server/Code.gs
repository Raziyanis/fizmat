/**
 * 8.2.1.2 «Санау жүйелерінде қосу және азайту» — оқушылардың нәтижелерін қабылдау.
 * Google Apps Script, веб-қосымша ретінде жарияланады (README.md, «Нәтижелер мұғалімнің поштасына»).
 *
 * Әр оқушы жұмысты тапсырғанда веб-ресурс осы скриптке нәтижені жібереді. Скрипт:
 *   1) Google Кестесіне («Нәтижелер» парағы) бір жол қосады;
 *   2) мұғалімге хат жібереді: аты-жөні, сыныбы, балы және әр мысалға берген жауабы.
 * Тегін: Google аккаунтының өз квотасы (жеке аккаунтқа тәулігіне шамамен 100 хат).
 */

var EMAIL = 'Meruet.agadilova@fizmat.kz';   // хат қай пошталарға келеді (үтір арқылы); бос болса — скрипт иесінің поштасы
var SEND_EMAIL = true;   // false — хат жібермей, тек кестеге жазу
var SHEET_NAME = 'Нәтижелер';
var SEND_PDF = true;      // хатқа есептің PDF нұсқасы тіркеледі / к письму прикладывается PDF
var TIME_ZONE = 'Asia/Almaty';

/** Бір рет қолмен іске қосыңыз: кесте жасалады, сілтемесі «Журналда» шығады. */
function setup() {
  var ss = book_();
  Logger.log('Кесте: ' + ss.getUrl());
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  // хат жіберуге рұқсат сұралады және бірден тексеріледі
  MailApp.sendEmail(to, '8.2.1.2 — пошта жұмыс істейді', 'Бұл тексеру хаты. Оқушылардың нәтижелері осы поштаға келеді.\nЭто проверочное письмо: результаты учеников будут приходить на эту почту.\nКесте / таблица: ' + ss.getUrl());
  Logger.log('Хат жіберілді / письмо отправлено: ' + to);
}

function doGet() {
  return ContentService.createTextOutput('8.2.1.2: нәтижелерді қабылдау жұмыс істеп тұр.');
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || d.app !== 'qosu-azaytu-8.2.1.2') return out_('skip');
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sh = sheet_();
      // бір нәтиже екі рет келсе (интернет үзіліп, қайта жіберілсе) — қайталамаймыз
      var ids = sh.getRange(1, 13, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return String(r[0]); });
      if (ids.indexOf(String(d.id)) >= 0) return out_('dup');
      // алдымен хат: хат жіберілмесе, жол жазылмайды — оқушының беті кейін қайта жібереді
      if (SEND_EMAIL) mail_(d);
      sh.appendRow([
        new Date(), safe_(d.cls), safe_(d.name), num_(d.main), num_(d.mainMax), num_(d.star), num_(d.starMax),
        safe_(d.time), num_(d.viol), safe_(d.reasonText), safe_(d.tasks.map(function (t) { return t.no + ': ' + t.score + '/' + t.max; }).join('; ')),
        safe_(d.lang), safe_(d.id), num_(d.seed),
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
  var h = [], cell = 'border:1px solid #c9d1dc;padding:4px 6px;';
  h.push('<h2 style="margin:0 0 6px;font-family:Arial,sans-serif">' + esc_(d.name) + ', ' + esc_(d.cls) + '</h2>');
  h.push('<p style="font-family:Arial,sans-serif;font-size:16px;margin:4px 0">8.2.1.2 · Санау жүйелерінде қосу және азайту · ' + when + '</p>');
  h.push('<p style="font-family:Arial,sans-serif;font-size:18px;margin:4px 0"><b>' + d.main + ' / ' + d.mainMax + '</b> балл &nbsp;·&nbsp; ★ қосымша: <b>' + d.star + ' / ' + d.starMax + '</b></p>');
  h.push('<p style="font-family:Arial,sans-serif;color:#555;margin:4px 0 10px">Уақыты: ' + esc_(d.time) + ' · бұзушылық: ' + d.viol + (d.reasonText ? ' · ' + esc_(d.reasonText) : '') + '</p>');
  h.push('<table cellpadding="4" style="border-collapse:collapse;font-family:Consolas,\'Courier New\',monospace;font-size:13px">');
  h.push('<tr style="background:#e8eef7"><th align="left" style="' + cell + '">№</th><th align="left" style="' + cell + '">Мысал</th><th align="left" style="' + cell + '">Дұрыс жауап</th><th align="left" style="' + cell + '">Оқушының жауабы</th><th align="left" style="' + cell + '">Балл</th></tr>');
  d.tasks.forEach(function (t) {
    h.push('<tr style="background:#f5f6f8"><td colspan="5" style="' + cell + '"><b>' + esc_(t.no + '. ' + t.title) + ' — ' + t.score + ' / ' + t.max + '</b></td></tr>');
    t.items.forEach(function (it) {
      var col = it.ok ? '#1a7f37' : '#c62828', mark = pdf ? (it.ok ? '+ ' : '− ') : (it.ok ? '✓ ' : '✗ ');
      h.push('<tr><td style="' + cell + '">' + esc_(it.no) + '</td><td style="' + cell + '">' + esc_(it.expr) + '</td><td style="' + cell + '">' + esc_(it.key) + '</td><td style="' + cell + 'color:' + col + '">' + esc_(it.answer || '—') + '</td><td style="' + cell + 'color:' + col + ';white-space:nowrap">' + mark + esc_(it.pts != null ? it.pts + ' / ' + it.per : '') + '</td></tr>');
    });
  });
  h.push('</table>');
  return h.join('\n');
}
function mail_(d) {
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  var subj = '8.2.1.2 · ' + clip_(d.cls, 20) + ' · ' + clip_(d.name, 60) + ' — ' + d.main + ' / ' + d.mainMax + (d.starMax ? ' (★ ' + d.star + ' / ' + d.starMax + ')' : '');
  var msg = { to: to, subject: subj, htmlBody: report_(d, false) };
  if (SEND_PDF) {
    try {   // PDF жасалмаса да, хат PDF-сіз кетеді
      var fname = ('8.2.1.2_' + clip_(d.cls, 20) + '_' + clip_(d.name, 60)).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
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
    ss = SpreadsheetApp.create('8.2.1.2 — нәтижелер (санау жүйелерінде қосу және азайту)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  return ss;
}
function sheet_() {
  var ss = book_(), sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.getSheets()[0];
    sh.setName(SHEET_NAME);
    sh.appendRow(['Уақыты', 'Сынып', 'Аты-жөні', 'Балл', 'Макс.', '★ балл', '★ макс.', 'Жұмыс уақыты', 'Бұзушылық', 'Аяқталу себебі', 'Тапсырмалар бойынша', 'Тіл', 'ID', 'Нұсқа (seed)']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 14).setFontWeight('bold');
  }
  return sh;
}
function out_(s) { return ContentService.createTextOutput(s); }
function num_(x) { var n = Number(x); return isFinite(n) ? n : ''; }
function clip_(s, n) { return String(s == null ? '' : s).slice(0, n); }
// кестеде формула ретінде орындалмасын
function safe_(s) { s = clip_(s, 2000); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
