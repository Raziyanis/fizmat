/**
 * Собирает автономный файл offline-test.html: работает без интернета,
 * проверяет ответы сам, а когда связь появляется — отправляет работу
 * в таблицу учителя (doPost в Код.gs).
 *
 * Запуск:  node build-offline.js [ссылка-на-/exec]
 *
 * Ссылку можно передать аргументом или вписать в WEB_APP_URL ниже.
 * Готовый файл содержит фамилии учеников и правильные ответы,
 * поэтому он в .gitignore и в репозиторий не попадает.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const read = (n) => fs.readFileSync(path.join(DIR, n), 'utf8');

const WEB_APP_URL = process.argv[2] ||
  'https://script.google.com/macros/s/AKfycbxhAQ8MvqxRp-TmunuVPe5nzxnqadBf1Iw0I0XmHHfQbF4DzdEnCK35M57-HiQXiP9e/exec';

const code = read('code.gs');
const QUESTIONS = eval(code.match(/var QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
const VERSION = code.match(/var APP_VERSION = '([^']+)'/)[1];

function roster() {
  const file = path.join(DIR, 'classes.csv');
  if (!fs.existsSync(file)) return [];
  const rows = read('classes.csv').replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1)
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

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Повторение: методы списка</title>
<style>
  :root {
    --bg:#f6f7f9; --card:#fff; --text:#15181d; --muted:#5b6471; --line:#dfe3e8;
    --accent:#1f6feb; --ok:#137333; --ok-bg:#e6f4ea; --ok-line:#8cd2a4;
    --bad:#b3261e; --bad-bg:#fce8e6; --bad-line:#f0a9a3; --warn:#8a5a00; --warn-bg:#fff4d6;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);padding:16px;
       font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif}
  .wrap{max-width:680px;margin:0 auto}
  h1{font-size:22px;margin:8px 0 4px}
  .sub{color:var(--muted);font-size:14px;margin-bottom:20px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px}
  .who{font-size:14px;color:var(--muted);margin-bottom:14px}
  .who b{color:var(--text)}
  .who button{width:auto;padding:4px 10px;font-size:13px;margin-left:8px}
  label.name{display:block;font-weight:600;margin-bottom:6px}
  input[type=text]{width:100%;padding:11px 12px;font-size:16px;font-family:inherit;
    border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--text)}
  input[type=text]:focus{outline:2px solid var(--accent);outline-offset:-1px;border-color:var(--accent)}
  .pick{display:flex;flex-wrap:wrap;gap:8px}
  .pick button{width:auto}
  .names{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
  .names button{width:100%;text-align:left;font-weight:500}
  .steps{display:flex;gap:5px;margin-bottom:14px;flex-wrap:wrap}
  .steps i{min-width:24px;height:22px;border-radius:5px;background:var(--line);color:var(--muted);
    display:flex;align-items:center;justify-content:center;font:700 12px/1 inherit;font-style:normal;padding:0 4px}
  .steps i.y{background:var(--ok);color:#fff} .steps i.n{background:var(--bad);color:#fff}
  .steps i.now{background:var(--accent);color:#fff;box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--accent)}
  .qnum{font-size:13px;color:var(--muted);font-weight:600}
  .qtext{margin:6px 0 10px;font-weight:600;font-size:17px}
  pre{background:#11161d;color:#e8edf3;padding:12px 14px;border-radius:8px;overflow-x:auto;
      font:14px/1.5 "SF Mono",Menlo,Consolas,"Liberation Mono",monospace;margin:0 0 12px}
  .opt{display:block;margin:0 0 8px}
  .opt input{position:absolute;opacity:0}
  .opt span{display:block;padding:11px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;
    font:15px/1.4 "SF Mono",Menlo,Consolas,"Liberation Mono",monospace}
  .opt input:checked + span{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent);background:#eef4ff}
  .opt.locked span{cursor:default}
  .opt.picked-ok span{border-color:var(--ok-line);background:var(--ok-bg);color:var(--ok);font-weight:600}
  .opt.picked-bad span{border-color:var(--bad-line);background:var(--bad-bg);color:var(--bad);font-weight:600}
  .opt.show-right span{border-color:var(--ok-line);background:var(--ok-bg);color:var(--ok)}
  .opt.dim span{opacity:.5}
  .verdict{display:flex;align-items:center;gap:10px;margin:14px 0 8px;font-weight:700;font-size:17px}
  .verdict.ok{color:var(--ok)} .verdict.bad{color:var(--bad)}
  .verdict .dot{width:14px;height:14px;border-radius:50%;display:inline-block}
  .verdict.ok .dot{background:var(--ok)} .verdict.bad .dot{background:var(--bad)}
  .note{color:var(--muted);font-size:14px;margin-bottom:14px}
  button{background:var(--accent);color:#fff;border:0;border-radius:8px;padding:13px 20px;
    font:600 16px/1.2 inherit;font-family:inherit;cursor:pointer;width:100%}
  button:disabled{opacity:.55;cursor:default}
  button.secondary{background:var(--card);color:var(--accent);border:1px solid var(--accent)}
  button.quiet{background:transparent;color:var(--muted);border:1px solid var(--line)}
  .msg{padding:11px 13px;border-radius:8px;margin-bottom:14px;font-size:15px}
  .msg.err{background:var(--bad-bg);color:var(--bad)}
  .msg.warn{background:var(--warn-bg);color:var(--warn)}
  .msg.ok{background:var(--ok-bg);color:var(--ok)}
  .score{font-size:34px;font-weight:700;margin:0}
  .fb{border-left:4px solid var(--line);padding-left:12px}
  .fb.ok{border-color:var(--ok)} .fb.bad{border-color:var(--bad)}
  .tag{display:inline-block;font-size:13px;font-weight:600;padding:2px 8px;border-radius:20px}
  .tag.ok{background:var(--ok-bg);color:var(--ok)} .tag.bad{background:var(--bad-bg);color:var(--bad)}
  .fb .ans{font:14px/1.5 "SF Mono",Menlo,Consolas,monospace;margin:4px 0}
  .version{text-align:center;color:var(--muted);font-size:12px;padding:20px 0 8px}
  .row{display:flex;gap:8px;flex-wrap:wrap}
  .row button{width:auto;flex:1 1 auto}
  @media (prefers-color-scheme: dark){
    :root{--bg:#0f1216;--card:#171c22;--text:#e9edf2;--muted:#9aa5b1;--line:#2b323b;--accent:#4c8dff;
      --ok:#6fd58f;--ok-bg:#16301f;--ok-line:#2f6b43;--bad:#ff8a80;--bad-bg:#351b19;--bad-line:#7a3a35;
      --warn:#ffc06e;--warn-bg:#332814}
    .opt input:checked + span{background:#1b2740}
  }
</style>
</head>
<body>
<div class="wrap">

  <div id="banner"></div>

  <div id="screen-who">
    <h1>Повторение: методы списка</h1>
    <div class="sub">Тема, которую мы уже прошли. ${QUESTIONS.length} заданий, по одному за раз.
      Интернет не нужен: проверка идёт прямо здесь.</div>
    <div class="card">
      <label class="name">Класс</label>
      <div class="pick" id="class-list"></div>
    </div>
    <div class="card" id="name-card" style="display:none">
      <label class="name">Фамилия и имя</label>
      <div class="names" id="name-list"></div>
      <div style="margin-top:12px"><button class="quiet" id="not-listed">Меня нет в списке</button></div>
    </div>
    <div class="card" id="manual-card" style="display:none">
      <label class="name" for="manual-name">Напишите фамилию и имя</label>
      <input type="text" id="manual-name" autocomplete="name" placeholder="Например: Ахметов Алихан">
      <div style="margin-top:12px"><button id="manual-ok">Продолжить</button></div>
    </div>
  </div>

  <div id="screen-test" style="display:none">
    <div class="who" id="who-line"></div>
    <div class="steps" id="steps"></div>
    <div class="card" id="question-card"></div>
  </div>

  <div id="screen-result" style="display:none">
    <h1>Результат</h1>
    <div class="card" style="text-align:center">
      <p class="score" id="score"></p>
      <div class="sub" id="score-sub" style="margin:0"></div>
    </div>
    <div class="card">
      <div id="send-state" class="sub" style="margin:0 0 12px"></div>
      <div class="row">
        <button class="secondary" id="send-now">Отправить учителю</button>
        <button class="quiet" id="download">Скачать результат</button>
      </div>
    </div>
    <div id="feedback"></div>
    <button class="secondary" id="again">Пройти ещё раз</button>
  </div>

  <div class="version">${VERSION} · автономный файл</div>
</div>

<script>
var URL_SEND = ${JSON.stringify(WEB_APP_URL)};
var VERSION = ${JSON.stringify(VERSION)};
var CLASSES = ${JSON.stringify(CLASSES)};
var QUESTIONS = ${JSON.stringify(QUESTIONS)};
var QUEUE_KEY = 'listmethods.offline.v1';

var chosen = { klass: '', name: '', manual: false };
var step = 0, answers = {}, verdicts = {}, locked = false, attemptId = '', lastResult = null;

function el(t, c, x){var n=document.createElement(t); if(c)n.className=c; if(x!==undefined)n.textContent=x; return n;}
function show(id){['screen-who','screen-test','screen-result'].forEach(function(s){
  document.getElementById(s).style.display = (s===id)?'block':'none';}); window.scrollTo(0,0);}
function banner(text, kind){var b=document.getElementById('banner'); b.textContent='';
  if(text) b.appendChild(el('div','msg '+(kind||'err'), text));}
function uid(){return 'o'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}

/* ---------- очередь отправки ---------- */
function queueRead(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');}catch(e){return [];}}
function queueWrite(l){try{localStorage.setItem(QUEUE_KEY, JSON.stringify(l)); return true;}catch(e){return false;}}
function queueAdd(p){var l=queueRead(); l.push(p); return queueWrite(l);}
function queueDrop(id){queueWrite(queueRead().filter(function(p){return p.uid!==id;}));}

function sendOne(payload){
  return fetch(URL_SEND, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },  // простой запрос, без preflight
    body: JSON.stringify(payload)
  }).then(function(r){ return r.json(); })
    .then(function(res){ if(!res || !res.ok) throw new Error(res && res.error || 'сервер отказал'); return res; });
}

function flushQueue(onState){
  var list = queueRead();
  if(!list.length){ if(onState) onState('empty'); return; }
  if(onState) onState('sending');
  sendOne(list[0])
    .then(function(){ queueDrop(list[0].uid); flushQueue(onState); })
    .catch(function(){ if(onState) onState('failed'); });
}

function sendState(state){
  var box = document.getElementById('send-state');
  var left = queueRead().length;
  if(state==='sending'){ box.textContent='Отправляем учителю…'; return; }
  if(left===0){ box.textContent='Работа отправлена учителю.'; box.style.color='var(--ok)'; return; }
  box.style.color='var(--warn)';
  box.textContent='Интернета нет. Работа сохранена на этом устройстве и уйдёт сама, '+
    'когда появится связь — просто откройте этот файл снова.';
}

window.addEventListener('online', function(){ flushQueue(sendState); });

/* ---------- выбор ученика ---------- */
function renderWho(){
  show('screen-who');
  var box=document.getElementById('class-list'); box.textContent='';
  if(!CLASSES.length){ box.parentNode.style.display='none';
    document.getElementById('manual-card').style.display='block'; return; }
  CLASSES.forEach(function(c){
    var b=el('button','secondary',c.klass);
    b.addEventListener('click',function(){chooseClass(c);});
    box.appendChild(b);
  });
}
function chooseClass(c){
  chosen.klass=c.klass; chosen.name=''; chosen.manual=false;
  document.getElementById('name-card').style.display='block';
  document.getElementById('manual-card').style.display='none';
  var l=document.getElementById('name-list'); l.textContent='';
  c.students.forEach(function(n){
    var b=el('button','secondary',n);
    b.addEventListener('click',function(){chosen.name=n; chosen.manual=false; beginTest();});
    l.appendChild(b);
  });
  document.getElementById('name-card').scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('not-listed').addEventListener('click',function(){
  document.getElementById('manual-card').style.display='block';
  document.getElementById('manual-name').focus();
});
document.getElementById('manual-ok').addEventListener('click',function(){
  var n=document.getElementById('manual-name').value.trim();
  if(n.split(/\\s+/).length<2){banner('Напишите и фамилию, и имя.','err');return;}
  if(!chosen.klass && CLASSES.length){banner('Сначала выберите класс.','err');return;}
  banner(''); chosen.name=n; chosen.manual=true; beginTest();
});

/* ---------- тест ---------- */
function beginTest(){
  attemptId=uid(); step=0; answers={}; verdicts={}; locked=false;
  show('screen-test');
  var w=document.getElementById('who-line'); w.textContent='';
  w.appendChild(el('span',null,'Отвечает: '));
  w.appendChild(el('b',null,(chosen.klass?chosen.klass+', ':'')+chosen.name));
  var b=el('button','quiet','Это не я');
  b.addEventListener('click',renderWho); w.appendChild(b);
  renderStep();
}
function renderSteps(){
  var box=document.getElementById('steps'); box.textContent='';
  QUESTIONS.forEach(function(q,i){
    var c=''; if(q.id in verdicts) c=verdicts[q.id]?'y':'n'; else if(i===step) c='now';
    var chip=el('i',c,String(i+1));
    chip.title='Задание '+(i+1)+' · '+q.topic;
    box.appendChild(chip);
  });
}
function renderStep(){
  renderSteps(); locked=false;
  var q=QUESTIONS[step];
  var card=document.getElementById('question-card'); card.textContent='';
  card.appendChild(el('div','qnum','Задание '+(step+1)+' из '+QUESTIONS.length+' · '+q.topic));
  card.appendChild(el('div','qtext',q.text));
  card.appendChild(el('pre',null,q.code));
  var labels=[];
  q.options.forEach(function(opt,idx){
    var lab=el('label','opt');
    var r=document.createElement('input');
    r.type='radio'; r.name=q.id; r.value=String(idx);
    r.addEventListener('change',function(){ if(locked)return;
      answers[q.id]=idx; document.getElementById('check').disabled=false; });
    lab.appendChild(r); lab.appendChild(el('span',null,opt));
    card.appendChild(lab); labels.push(lab);
  });
  var btn=el('button',null,'Ответить'); btn.id='check'; btn.disabled=true;
  btn.addEventListener('click',function(){ checkAnswer(q,labels); });
  card.appendChild(btn);
}
function checkAnswer(q,labels){
  if(locked) return; locked=true;
  var ok = answers[q.id]===q.correct;
  verdicts[q.id]=ok; renderSteps();
  labels.forEach(function(lab,idx){
    lab.classList.add('locked');
    lab.querySelector('input').disabled=true;
    if(idx===answers[q.id]) lab.classList.add(ok?'picked-ok':'picked-bad');
    else if(!ok && idx===q.correct) lab.classList.add('show-right');
    else lab.classList.add('dim');
  });
  var card=document.getElementById('question-card');
  var v=el('div','verdict '+(ok?'ok':'bad'));
  v.appendChild(el('span','dot')); v.appendChild(el('span',null, ok?'Верно':'Неверно'));
  card.appendChild(v);
  if(!ok) card.appendChild(el('div','note','Правильный ответ: '+q.options[q.correct]));
  card.appendChild(el('div','note',q.note));
  var btn=document.getElementById('check');
  btn.textContent = (step+1<QUESTIONS.length)?'Следующее задание':'Посмотреть результат';
  btn.disabled=false;
  btn.replaceWith(btn.cloneNode(true));
  var fresh=card.querySelector('#check');
  fresh.addEventListener('click',nextStep); fresh.focus();
}
function nextStep(){
  if(step+1<QUESTIONS.length){ step++; renderStep(); window.scrollTo(0,0); } else finish();
}

/* ---------- итог ---------- */
function finish(){
  var score=0;
  QUESTIONS.forEach(function(q){ if(answers[q.id]===q.correct) score++; });
  lastResult={ uid:uid(), attempt:attemptId, klass:chosen.klass, name:chosen.name,
               answers:answers, addToClass:chosen.manual, score:score, total:QUESTIONS.length };

  show('screen-result');
  document.getElementById('score').textContent=score+' / '+QUESTIONS.length;
  var wrong=QUESTIONS.length-score;
  document.getElementById('score-sub').textContent =
    wrong===0?'Все задания верно.':'Ошибок: '+wrong+'. Разбор ниже.';

  queueAdd({ uid:lastResult.uid, attempt:lastResult.attempt, klass:lastResult.klass,
             name:lastResult.name, answers:lastResult.answers, addToClass:lastResult.addToClass });
  flushQueue(sendState);
  sendState();

  var box=document.getElementById('feedback'); box.textContent='';
  QUESTIONS.forEach(function(q,i){
    var given=answers[q.id], ok=given===q.correct;
    var card=el('div','card');
    var fb=el('div','fb '+(ok?'ok':'bad'));
    fb.appendChild(el('div','qnum','Задание '+(i+1)+' · '+q.topic));
    fb.appendChild(el('span','tag '+(ok?'ok':'bad'), ok?'Верно':'Ошибка'));
    fb.appendChild(el('div','qtext',q.text));
    fb.appendChild(el('pre',null,q.code));
    if(!ok){
      fb.appendChild(el('div','ans','Ваш ответ: '+(given>=0&&given<q.options.length?q.options[given]:'—')));
      fb.appendChild(el('div','ans','Правильно: '+q.options[q.correct]));
    } else {
      fb.appendChild(el('div','ans','Ответ: '+q.options[q.correct]));
    }
    fb.appendChild(el('div','note',q.note));
    card.appendChild(fb); box.appendChild(card);
  });
}

document.getElementById('send-now').addEventListener('click',function(){ flushQueue(sendState); });
document.getElementById('again').addEventListener('click',function(){ window.location.reload(); });
document.getElementById('download').addEventListener('click',function(){
  if(!lastResult) return;
  var lines=['Повторение: методы списка ('+VERSION+')',
             'Класс: '+lastResult.klass, 'Ученик: '+lastResult.name,
             'Балл: '+lastResult.score+' из '+lastResult.total, ''];
  QUESTIONS.forEach(function(q,i){
    var g=lastResult.answers[q.id];
    lines.push((i+1)+'. '+q.topic+' — '+((g===q.correct)?'верно':'ошибка')+
      '; ответ: '+(g>=0&&g<q.options.length?q.options[g]:'—')+
      '; правильно: '+q.options[q.correct]);
  });
  var blob=new Blob([lines.join('\\n')],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');
  a.href=window.URL.createObjectURL(blob);
  a.download='результат-'+lastResult.klass+'-'+lastResult.name.replace(/\\s+/g,'-')+'.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

/* при открытии дошлём то, что не ушло в прошлый раз */
if(queueRead().length){
  banner('Есть неотправленная работа — отправим, как только появится интернет.','warn');
  flushQueue(function(state){ if(state!=='failed' && !queueRead().length) banner('Работа отправлена учителю.','ok'); });
}
renderWho();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(DIR, 'offline-test.html'), html);
console.log('offline-test.html собран:', Math.round(html.length / 1024) + ' КБ');
console.log('заданий:', QUESTIONS.length, '· классов:', CLASSES.length,
            '· учеников:', CLASSES.reduce((n, c) => n + c.students.length, 0));
console.log('отправка на:', WEB_APP_URL);
