/**
 * 8.2.1.2 «Санау жүйелерінде қосу және азайту» — оқушылардың нәтижелерін қабылдау.
 * Google Apps Script, веб-қосымша ретінде жарияланады (README.md, «Нәтижелер мұғалімнің поштасына»).
 *
 * Әр оқушы жұмысты тапсырғанда веб-ресурс осы скриптке нәтижені жібереді. Скрипт:
 *   1) Google Кестесіне («Нәтижелер» парағы) бір жол қосады;
 *   2) мұғалімге хат жібереді: аты-жөні, сыныбы, балы және әр мысалға берген жауабы.
 * Тегін: Google аккаунтының өз квотасы (жеке аккаунтқа тәулігіне шамамен 100 хат).
 */

var EMAIL = 'raziya.baimurzayeva@fizmat.kz';   // хат қай поштаға келеді; бос болса — скрипт иесінің поштасы
var SEND_EMAIL = true;   // false — хат жібермей, тек кестеге жазу
var SHEET_NAME = 'Нәтижелер';

/** Бір рет қолмен іске қосыңыз: кесте жасалады, сілтемесі «Журналда» шығады. */
function setup() {
  var ss = book_();
  Logger.log('Кесте: ' + ss.getUrl());
  Logger.log('Хат мына поштаға келеді: ' + (EMAIL || Session.getEffectiveUser().getEmail()));
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
      sh.appendRow([
        new Date(), safe_(d.cls), safe_(d.name), num_(d.main), num_(d.mainMax), num_(d.star), num_(d.starMax),
        safe_(d.time), num_(d.viol), safe_(d.reasonText), safe_(d.tasks.map(function (t) { return t.no + ': ' + t.score + '/' + t.max; }).join('; ')),
        safe_(d.lang), safe_(d.id), num_(d.seed),
      ]);
    } finally { lock.releaseLock(); }
    if (SEND_EMAIL) mail_(d);
    return out_('ok');
  } catch (err) {
    return out_('error: ' + err);
  }
}

function mail_(d) {
  var to = EMAIL || Session.getEffectiveUser().getEmail();
  var subj = '8.2.1.2 · ' + clip_(d.cls, 20) + ' · ' + clip_(d.name, 60) + ' — ' + d.main + ' / ' + d.mainMax + (d.starMax ? ' (★ ' + d.star + ' / ' + d.starMax + ')' : '');
  var h = [];
  h.push('<h2 style="margin:0 0 6px">' + esc_(d.name) + ', ' + esc_(d.cls) + '</h2>');
  h.push('<p style="font-size:18px;margin:4px 0"><b>' + d.main + ' / ' + d.mainMax + '</b> балл &nbsp;·&nbsp; ★ қосымша: <b>' + d.star + ' / ' + d.starMax + '</b></p>');
  h.push('<p style="color:#555;margin:4px 0">Уақыты: ' + esc_(d.time) + ' · бұзушылық: ' + d.viol + (d.reasonText ? ' · ' + esc_(d.reasonText) : '') + '</p>');
  h.push('<table cellpadding="4" style="border-collapse:collapse;font-family:Consolas,monospace;font-size:14px">');
  h.push('<tr style="background:#e8eef7"><th align="left">№</th><th align="left">Мысал</th><th align="left">Оқушының жауабы</th><th align="left">Дұрыс жауап</th><th></th></tr>');
  d.tasks.forEach(function (t) {
    h.push('<tr style="background:#f5f6f8"><td colspan="5"><b>' + esc_(t.no + '. ' + t.title) + ' — ' + t.score + ' / ' + t.max + '</b></td></tr>');
    t.items.forEach(function (it) {
      h.push('<tr><td>' + esc_(it.no) + '</td><td>' + esc_(it.expr) + '</td><td>' + esc_(it.answer || '—') + '</td><td>' + esc_(it.key) + '</td><td style="color:' + (it.ok ? '#1a7f37' : '#c62828') + '">' + (it.ok ? '✓' : '✗') + '</td></tr>');
    });
  });
  h.push('</table>');
  MailApp.sendEmail({ to: to, subject: subj, htmlBody: h.join('\n') });
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
