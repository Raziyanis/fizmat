# -*- coding: utf-8 -*-
"""Build the 9.2.1.2 'Ақиқат кестесін тұрғызу' lesson on the teacher's lesson engine (Kazakh, no Python, offline)."""
import sys, re, json
sys.path.insert(0, sys.argv[1])
from content2 import *
from blocks2 import *
from js2 import CORE_JS, RACE_JS, LAB_JS, EXAMPLES_JS, TASKS_JS, DBG_JS

STU, TEA, OUTDIR = sys.argv[2], sys.argv[3], sys.argv[4]
J = lambda x: json.dumps(x, ensure_ascii=False)

def rep(s, old, new, count=1):
    n = s.count(old); assert n == count, f'expected {count} got {n}: {old[:90]!r}'
    return s.replace(old, new)
def rep_re(s, pat, new):
    m = list(re.finditer(pat, s, re.S)); assert len(m) == 1, f'regex matched {len(m)}: {pat[:90]!r}'
    a, b = m[0].span(); return s[:a] + new + s[b:]
def between(s, start, end, new):
    assert s.count(start) == 1, start[:60]
    a = s.index(start); b = s.index(end, a); return s[:a] + new + s[b:]

src = open(STU, encoding='utf-8').read().split('\n')
html = '\n'.join(src[1833:2772]); js = '\n'.join(src[2775:3653]); head_rest = '\n'.join(src[1:8])

h = html
h = rep(h, '</style>', EXTRA_CSS + '</style>')
h = rep(h, '<div class="brand">Іздеу <span>·</span> search</div>', '<div class="brand">Ақиқат <span>·</span> кесте</div>')
h = rep_re(h, r'<nav aria-label="Сабақ бөлімдері">.*?</nav>',
  '<nav aria-label="Сабақ бөлімдері">\n    <a href="#povtorenie">Қайталау</a><a href="#tema">Тақырып қандай?</a><a href="#cel">Сабақ мақсаты</a><a href="#svoistva">Алгоритм</a>'
  '<a href="#lab">Конструктор</a><a href="#metody">Мысалдар</a><a href="#kakoy">Қай өрнек?</a><a href="#oshibka">Қатені тап</a>'
  '<a href="#praktika">Практика</a><a href="#dop">Қалыптастырушы бағалау</a><a href="#refleksiya">Рефлексия</a><a href="#viktorina">Викторина ★</a>\n  </nav>')
h = rep(h, '<div class="lang-sw"><span>Қаз</span><button type="button" data-lang="ru" title="Русский">Рус</button></div>', '')
h = rep(h, 'Информатика · 9-сынып · Іздеу', 'Информатика · 9-сынып · Ақиқат кестесі')
h = rep(h, 'Алдымен тілді, содан кейін сыныпты, кейін тегің мен атыңды таңда.', 'Алдымен сыныпты, содан кейін тегің мен атыңды таңда.')
h = rep(h, '<div class="start-step"><div class="start-lbl">1. Тіл / Язык</div>', '<div class="start-step" hidden><div class="start-lbl">1. Тіл / Язык</div>')
h = rep(h, '<div class="start-lbl">2. Сынып</div>', '<div class="start-lbl">1. Сынып</div>')
h = rep(h, '<div class="start-lbl">3. Тегі мен аты</div>', '<div class="start-lbl">2. Тегі мен аты</div>')
h = rep(h, '<h2>Қайталау: жиын (set)</h2><p>Өткен тақырыпты еске түсірейік: жиынның қасиеттері мен әдістері. Уақыты — шамамен 7 минут.</p>',
        '<h2>Қайталау: логикалық амалдар</h2><p>Өткен тақырыпты еске түсірейік: инверсия, конъюнкция, дизъюнкция, амалдар реті және кестедегі жолдар саны. Уақыты — шамамен 5 минут.</p>')
h = rep(h, '<h3 class="sub">1. Ауызша сұрау «Дұрыс / Бұрыс» <span class="time">≈ 3 мин</span></h3>', '<h3 class="sub">1. Ауызша сұрау «Дұрыс / Бұрыс» <span class="time">≈ 2 мин</span></h3>')
h = rep(h, '<h3 class="sub">2. Жұппен сәйкестендіру <span class="time">≈ 4 мин</span></h3>', '<h3 class="sub">2. Жұппен сәйкестендіру: ұғым және оның мағынасы <span class="time">≈ 3 мин</span></h3>')
h = rep(h, 'Сол жақтағы әдісті немесе кодты, содан кейін оң жақтағы сәйкес әрекетті немесе нәтижені басыңыз.', 'Сол жақтағы ұғымды, содан кейін оң жақтағы оның мағынасын басыңыз.')
h = rep_re(h, r'<div class="qcards tf">\n.*?\n    </div>', '<div class="qcards tf">\n' + tf_cards() + '\n    </div>')
h = rep_re(h, r'    <details class="memo">.*?</details>', MEMO)
h = between(h, '  <section id="tema">', '  <section id="kakoy">', TEMA + '\n\n' + CEL + '\n\n' + SVOISTVA + '\n\n' + LAB + '\n\n' + METODY)
h = rep(h, '<h2>Қай іздеу жарайды?</h2><p>Жағдаятты оқып, жауапты таңдаңыз. Жауаптан кейін түсіндірме шығады.</p>',
        '<h2>Қай өрнек жарайды?</h2><p>Жағдаятты оқып, жауапты таңдаңыз. Жауаптан кейін түсіндірме шығады. Мұғалім бірнеше жағдаятты сыныппен ауызша талдай алады.</p>')
h = rep(h, 'Әр іздеу бағдарламасында қате бар. Кодты іске қосып, не дұрыс болмағанын қарап, түзетіңіз де, «Тексеру» батырмасын басыңыз.',
        'Әр кестеде қате бар. Қате ұяшықтарды тауып, басу арқылы түзетіңіз де, «Тексеру» батырмасын басыңыз. Уақыты — шамамен 6 минут.')
h = rep(h, ' Әр тапсырманың астындағы дұрыс түзетуді тек мұғалім көреді.', ' Әр тапсырманың астындағы дұрыс кестені тек мұғалім көреді.')
h = rep(h, '<p>Сызықтық және екілік іздеу туралы жеті сұрақ. Жауаптан кейін түсіндірме шығады.</p>',
        '<p>Қосымша тапсырма: сабақтың соңында уақыт қалса орындаңыз. Ақиқат кестелері туралы жеті сұрақ, жауаптан кейін түсіндірме шығады. Мақсатқа жету деңгейіне әсер етпейді.</p>')
h = rep(h, '<h2>Практикалық жұмыс: мектеп кітапханасы</h2><p>Сіз мектеп кітапханасының каталогына бағдарлама жазасыз: әр кітаптың инвентарлық нөмірі бар. P1–P6 есептері оңайдан қиынға қарай орналасқан. «Тексеру» батырмасы бағдарламаны тесттерде іске қосады.</p>',
        '<h2>Практикалық жұмыс: ақиқат кестелерін тұрғызу</h2><p>P1–P3 есептері оңайдан қиынға қарай орналасқан. Ұяшықты басқан сайын мәні · → 0 → 1 болып ауысады. «Тексеру» батырмасы кестені тексеріп, қате ұяшықтарды қызылмен көрсетеді. Уақыты — шамамен 6 минут.</p>')
h = rep_re(h, r'<p class="howto">Енгізудің бірінші жолы.*?</p>',
  '<p class="howto">Кейбір есептерде айнымалылар бағандарын (A, B, C) да өзіңіз толтырасыз — олардың ұяшықтары басқа түсті. Жиындар екілік санау ретімен жазылады: 0 0 0, 0 0 1, …, 1 1 1. '
  'Аралық бағандарды солдан оңға қарай толтырыңыз.<span class="t-only"> Әр есептің астындағы үлгі шешімді тек мұғалім көреді.</span></p>')
h = rep(h, '«Тексеру» батырмасы бағдарламаны тесттерде іске қосып, қажетті алгоритмнің қолданылғанын тексереді.',
        '«Тексеру» батырмасы кестені және сұраққа берілген жауапты тексереді.')
h = rep_re(h, r'    <div class="refl">.*?\n    </div>\n    <div class="exit-end', REFL + '\n    <div class="exit-end')
h = rep(h, '✓ — уровень достигнут, ◐ — частично, ○ — не начат.', '✓ — деңгейге жетті, ◐ — ішінара, ○ — басталмаған.')
h = rep_re(h, r'Еңбегі адал – өскелең азамат\..*?</div></footer>',
  'Еңбегі адал – өскелең азамат. Тапсырмаларды өз бетіңізше орындап, өзіңізді адал тексеріңіз.<br>Ресурс интернетсіз жұмыс істейді: кестелер браузердің өзінде тексеріледі. Интернет болса, нәтижелер мұғалімге жіберіледі.</div></footer>')
h = rep(h, 'Әр топта 4–5 адам, біріншісі — жетекші', 'Әр топта 3–4 адам, біріншісі — жетекші')
h = rep(h, '<div class="sec-head"><h2>Қосымша есептер</h2><p>Практикалық жұмысты аяқтағандарға. Деңгейді таңдап, өз қарқыныңызбен шығарыңыз.</p></div>',
        '<div class="sec-head"><h2>Қалыптастырушы бағалау</h2><p>10 тапсырма қарапайымнан күрделіге қарай орналасқан: Ф1–Ф3 базалық, Ф4–Ф7 орта, Ф8–Ф10 жоғары деңгей. Балл автоматты түрде есептеледі: соңғы (F) бағандағы әр дұрыс жол — 1 балл (8 жол дұрыс болса — 8 балл, 5 жол дұрыс болса — 5 балл). Барлық тапсырмадан ең көбі 66 балл жиналады. Жиналған балл пайызға, пайыз 10 балдық бағаға айналады: мысалы, 66-дан 52 балл — 79 % — 7,88 / 10 (≈ 8). Тек соңғы (F) баған тексеріледі: айнымалылар мен аралық бағандар — өзіңізге көмек, оларды толтыру міндетті емес. Әр тапсырманың нәтижесі F бағаны толық толтырылып, бірінші рет тексерілгенде бекітіледі.</p><span class="score" id="dopScore">0 / 10 балл</span><p class="howto" id="dopDetail" style="flex-basis:100%;margin:0"></p></div>')
h = rep(h, '>Барлық есептер</button>', '>Барлық тапсырмалар</button>')
h = rep(h, 'Сынып оқушылары: қосымша есептер', 'Сынып оқушылары: қалыптастырушы бағалау')
h = rep(h, '«Викторина», «Практика» және «Қосымша есептер»', '«Практика» және «Қалыптастырушы бағалау»')
h = rep(h, '<th>Қосымша есептер</th>', '<th>ҚБ</th>')
h = rep(h, '«Тексеру» батырмасы кестені және сұраққа берілген жауапты тексереді.', '«Тексеру» батырмасы кестені және сұраққа берілген жауапты тексереді. Әр оқушыға тапсырмалардың өз нұсқасы беріледі: өрнектер мен айнымалылар әртүрлі, сондықтан көршіден көшіру мүмкін емес.<span class="t-only"> Мұғалім бетінде 1-нұсқа көрсетілген; оқушылардың жауабы автоматты түрде өз нұсқасы бойынша тексеріледі.</span>')
h = h.replace('Тек викторина, практика және қосымша есептер ескеріледі.', 'Деңгейге тек практика мен қалыптастырушы бағалау әсер етеді; викторина — қосымша.')
h = h.replace('<th>Оқушы</th><th>Викторина</th>', '<th>Оқушы</th><th>Викторина ★</th>')
# move «Викторина» after «Рефлексия» (extra task if time remains)
_vs = h.index('  <section id="viktorina">'); _ve = h.index('</section>', _vs) + len('</section>')
_vk = h[_vs:_ve]; h = h[:_vs] + h[_ve:]
_rs = h.index('  <section id="refleksiya">'); _re = h.index('</section>', _rs) + len('</section>')
h = h[:_re] + '\n\n' + _vk.replace('<h2>Нәтижені болжа</h2>', '<h2>Викторина ★ (уақыт қалса)</h2>') + h[_re:]
for bad in ['іздеу алгоритм', 'кітапхана', 'Сызықтық', 'жиын (set)', 'Python', 'pesochnica']:
    assert bad not in h, bad

s = js
s = s.replace('searchlab', 'ttablelab')
s = rep(s, "const LESSON='search';", "const LESSON='truthtable';")
s = rep_re(s, r"matcher\(\$\('#matchA'\),'mA3',\[.*?\],true\);", "matcher($('#matchA'),'mT2'," + J(MATCH) + ",false);")
s = between(s, '/* ---------- tab 2: topic ---------- */', '/* ---------- search visualizer ---------- */', CORE_JS + RACE_JS)
s = between(s, '/* ---------- search visualizer ---------- */', '/* ---------- methods ---------- */', LAB_JS)
s = between(s, '/* ---------- methods ---------- */', '/* ---------- tasks ---------- */', 'const EXAMPLES=' + J(EXAMPLES) + ';\n' + EXAMPLES_JS)
s = between(s, '/* ---------- tasks ---------- */', '/* ---------- quiz ---------- */', 'const FO_GEN=' + J(FO_GEN) + ';\nconst FO_CLASSES=' + re.search(r'const CLASSES=(\{.*?\});', js).group(1) + ';\nconst prac=' + J(PRAC) + ';\n' + TASKS_JS)
s = rep_re(s, r'const quiz=\[\n.*?\n\];', 'const quiz=' + J(QUIZ) + ';')
s = rep_re(s, r'const mq=\[\n.*?\n\];', 'const mq=' + J(MQ) + ';')
s = between(s, '/* ---------- find the bug ---------- */', '/* ---------- tabs ---------- */', 'const dbg=' + J(DBG) + ';\n' + DBG_JS)
s = rep_re(s, r'const CONF_Q=\{.*?\};', 'const CONF_Q=' + J(CONF_Q) + ';')
s = rep_re(s, r'const GOAL_DEF=\[.*?\n\];',
  "const GOAL_DEF=[\n"
  " {name:'Барлығы',goal:'екі айнымалы өрнектің ақиқат кестесін тұрғызамын',items:[\n"
  "   ['prac',['P1'],'Практика P1','#praktika'],['dop',['Ф1','Ф2','Ф3'],'ҚБ: Ф1–Ф3 тапсырмаларының бірі','#dop']]},\n"
  " {name:'Көпшілігі',goal:'аралық бағандармен үш айнымалы өрнектің кестесін тұрғызамын',items:[\n"
  "   ['prac',['P2'],'Практика P2','#praktika'],['dop',['Ф4','Ф5','Ф6','Ф7'],'ҚБ: Ф4–Ф7 тапсырмаларының бірі','#dop']]},\n"
  " {name:'Кейбіреулері',goal:'кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін',items:[\n"
  "   ['prac',['P3'],'Практика P3','#praktika'],['dop',['Ф8','Ф9','Ф10'],'ҚБ: Ф8–Ф10 тапсырмаларының бірі','#dop']]},\n"
  "];")
s = rep_re(s, r"const msg=reached<0\?.*?Керемет жұмыс!'\];",
  "const msg=reached<0?['Сабақ мақсатына әзірге жетпедіңіз','Базалық деңгейден бастаңыз: практикалық жұмыстың P1 есебі және қалыптастырушы бағалаудың Ф1–Ф3 тапсырмалары.']:\n"
  "    reached===0?['9.2.1.2 мақсатына базалық деңгейде жеттіңіз','Сіз екі айнымалы өрнектің кестесін тұрғызасыз. Келесі қадам — үш айнымалы және аралық бағандар: практиканың P2 есебі және қалыптастырушы бағалаудың Ф4–Ф7 тапсырмаларының бірі.']:\n"
  "    reached===1?['9.2.1.2 мақсатына «Көпшілігі» деңгейінде жеттіңіз','Сіз аралық бағандармен кестені қатесіз тұрғызасыз. Енді кестені талдаңыз: практиканың P3 есебі және қалыптастырушы бағалаудың Ф8–Ф10 тапсырмаларының бірі.']:\n"
  "    ['9.2.1.2 мақсатына толық жеттіңіз','Сіз кестені тұрғызып қана қоймай, оны талдап, өрнектерді салыстырасыз. Керемет жұмыс!'];")
s = rep(s, '<span class="obj-code">9.2.5.3</span>', '<span class="obj-code">9.2.1.2</span>')
s = rep_re(s, r'const HINTS=\[\n.*?\n\];', 'const HINTS=' + J(HINTS) + ';')
s = rep(s, "const HINT_TABS=['svoistva','lab','metody','pesochnica'];", "const HINT_TABS=['svoistva','lab','metody'];")
s = rep(s, "return `Доп. задача ${b}`;", "return `ҚБ ${b}`;")
s = rep(s, "<span>Қосымша есептер: ${tasks.filter", "<span>Қалыптастырушы бағалау: ${tasks.filter")
s = rep(s, "<span>Қалыптастырушы бағалау: ${tasks.filter(t=>done[t.id]).length} / ${tasks.length}</span>", "<span>Қалыптастырушы бағалау: ${foRows().ok} / ${foRows().all} балл → ${foFmt(foTotal())} / 10</span>")
s = rep(s, "{suf:'#dop',n:dd.length,total:tasks.length,partner:dd.join(', '),sig:dd.join(',')}", "{suf:'#dop',n:foTotal(),total:10,partner:dd.join(', '),sig:dd.join(',')+'|'+foTotal()}")
s = rep(s, "stLangOk=mode==='change'||!!student||store.get('lang',null)===CUR_LANG;", "stLangOk=true;")
s = rep(s, "'Алдымен тілді, содан кейін сыныпты, кейін тегің мен атыңды таңда.'", "'Алдымен сыныпты, содан кейін тегің мен атыңды таңда.'")
s = rep(s, "if(a.length<=5)return [a];const g=Math.ceil(a.length/5);", "if(a.length<=4)return [a];let g=Math.ceil(a.length/4);if(Math.floor(a.length/g)<3&&g>1)g--;")
s = rep(s, "let pkClass=store.get('pkClass',null);", "let pkClass=store.get('pkClass',null);if(!pkClass&&Object.keys(CLASSES).length===1){pkClass=Object.keys(CLASSES)[0];store.set('pkClass',pkClass);}")
s = rep(s, "student={cls:stPick.cls,name:stPick.name,manual:!!stPick.manual};store.set('student',student);drawStudent();closeStart();",
  "student={cls:stPick.cls,name:stPick.name,manual:!!stPick.manual};store.set('student',student);if(window.__ttNeedReload){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}location.reload();return;}drawStudent();closeStart();")
s = rep(s, 'resList=Array.isArray(v&&v.results)?v.results:[];', 'resList=Array.isArray(v&&v.results)?v.results.filter(r=>r&&(!r.lesson||r.lesson===LESSON)):[];')
for bad in ['іздеу', 'Іздеу', 'sandbox', 'pesochnica', 'makeEditor(']:
    left = [l for l in s.split('\n') if bad in l and not l.lstrip().startswith('function makeEditor')]
    if bad == 'makeEditor(':
        left = [l for l in left if 'function makeEditor' not in l]
    assert not left, (bad, left[:2])
OBJ = 'берілген логикалық өрнекке ақиқат кестесін тұрғызу'
def kuru(x):
    return x.replace(OBJ, '\x00').replace('Тұрғыз', 'Құр').replace('тұрғыз', 'құр').replace('\x00', OBJ)
h = kuru(h); s = kuru(s)
open(OUTDIR + '/check.js', 'w', encoding='utf-8').write(s)

BOOT = """<script>
(function(){
  var frag=document.getElementById('tpl-kz').content.cloneNode(true);
  var scripts=Array.prototype.slice.call(frag.querySelectorAll('script'));
  scripts.forEach(function(s){s.parentNode.removeChild(s);});
  document.documentElement.lang='kk';
  document.body.appendChild(frag);
  for(var i=0;i<scripts.length;i++){var n=document.createElement('script');n.textContent=scripts[i].textContent;document.body.appendChild(n);}
})();
</script>"""

def assemble(first_line, title):
    fl = first_line.replace('<html lang="ru">', '<html lang="kk">')
    fl = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', fl)
    return '\n'.join([fl, head_rest, '<template id="tpl-kz">', h, '<script>', s, '</script>', '', '</template>', BOOT]) + '\n'

tea_first = open(TEA, encoding='utf-8').read().split('\n')[0]
open(OUTDIR + '/stu.html', 'w', encoding='utf-8').write(assemble(src[0], 'Ақиқат кестесін құру'))
open(OUTDIR + '/tea.html', 'w', encoding='utf-8').write(assemble(tea_first, 'Ақиқат кестесін құру — мұғалім'))

# ---------- free version: no class / student selection, no sync ----------
def make_free(x):
    def R(a, b, cnt=1):
        nonlocal x
        assert x.count(a) == cnt, (a[:60], x.count(a)); x = x.replace(a, b)
    x = re.sub(r'<script>window\.__NO_TEACHER=true;window\.__SYNC_URL=[^<]*</script>',
               '<script>window.__NO_TEACHER=true;window.__FREE=true;</script>', x, count=1)
    assert 'script.google' not in x and '__SYNC_KEY="' not in x
    x = x.replace('ttablelab:', 'ttablefree:')
    st = "const store={get(k,d){"; i = x.index(st); j = x.index('};', i) + 2
    x = x[:j] + "if(!store.get('student',null)){store.set('seed',Math.random().toString(36).slice(2));store.set('student',{cls:'',name:'Оқушы',manual:true});}" + x[j:]
    R("prHash(_stu.cls+'|'+_stu.name+'|'+g.id)", "prHash(store.get('seed','')+'|'+g.id)")
    R(', мұғалім оны әр оқушы бойынша көреді.', '.')
    R('Осы компьютердегі жауаптарың, кодың және рефлексияң жойылады, келесі оқушы үшін сабаққа кіру беті ашылады.',
      'Осы компьютердегі барлық жауаптар мен рефлексия жойылады, сабақ келесі оқушы үшін басынан ашылады (қалыптастырушы бағалаудың жаңа нұсқасымен).')
    R('<h2 id="exitTitle">Сабақтан шығасың ба?</h2>', '<h2 id="exitTitle">Жаңа оқушы үшін тазалау керек пе?</h2>')
    R('id="exitYes">Иә, шығу</button>', 'id="exitYes">Иә, тазалау</button>')
    R('id="stuExit">Сабақтан шығу</button>', 'id="stuExit">Жаңа оқушы</button>')
    R('id="ssExit">Сабақтан шығу</button>', 'id="ssExit">Жаңа оқушы</button>')
    css = ('<style>#stuChange,#ssChange,#pairsS,#grpS,#stuBar>span:first-child,#sideStu .ss-lbl,#ssName,#ssCls,'
           '#startScreen,.link-st,#stuLine{display:none!important}#stuBar{justify-content:flex-end}</style>')
    R('</head>', css + '</head>')
    return x
stu_html = open(OUTDIR + '/stu.html', encoding='utf-8').read()
open(OUTDIR + '/free.html', 'w', encoding='utf-8').write(make_free(stu_html))
print('ok', len(h), len(s))
