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
  '<a href="#viktorina">Викторина</a><a href="#praktika">Практика</a><a href="#dop">Қосымша есептер</a><a href="#refleksiya">Рефлексия</a>\n  </nav>')
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
        '<p>Ақиқат кестелері туралы жеті сұрақ. Жауаптан кейін түсіндірме шығады. Уақыты — шамамен 4 минут.</p>')
h = rep(h, '<h2>Практикалық жұмыс: мектеп кітапханасы</h2><p>Сіз мектеп кітапханасының каталогына бағдарлама жазасыз: әр кітаптың инвентарлық нөмірі бар. P1–P6 есептері оңайдан қиынға қарай орналасқан. «Тексеру» батырмасы бағдарламаны тесттерде іске қосады.</p>',
        '<h2>Практикалық жұмыс: ақиқат кестелерін тұрғызу</h2><p>P1–P6 есептері оңайдан қиынға қарай орналасқан. Ұяшықты басқан сайын мәні · → 0 → 1 болып ауысады. «Тексеру» батырмасы кестені тексеріп, қате ұяшықтарды қызылмен көрсетеді. Уақыты — шамамен 10 минут.</p>')
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
for bad in ['іздеу алгоритм', 'кітапхана', 'Сызықтық', 'жиын (set)', 'Python', 'pesochnica']:
    assert bad not in h, bad

s = js
s = s.replace('searchlab', 'ttablelab')
s = rep(s, "const LESSON='search';", "const LESSON='truthtable';")
s = rep_re(s, r"matcher\(\$\('#matchA'\),'mA3',\[.*?\],true\);", "matcher($('#matchA'),'mT2'," + J(MATCH) + ",false);")
s = between(s, '/* ---------- tab 2: topic ---------- */', '/* ---------- search visualizer ---------- */', CORE_JS + RACE_JS)
s = between(s, '/* ---------- search visualizer ---------- */', '/* ---------- methods ---------- */', LAB_JS)
s = between(s, '/* ---------- methods ---------- */', '/* ---------- tasks ---------- */', 'const EXAMPLES=' + J(EXAMPLES) + ';\n' + EXAMPLES_JS)
s = between(s, '/* ---------- tasks ---------- */', '/* ---------- quiz ---------- */', 'const tasks=' + J(TASKS) + ';\nconst prac=' + J(PRAC) + ';\n' + TASKS_JS)
s = rep_re(s, r'const quiz=\[\n.*?\n\];', 'const quiz=' + J(QUIZ) + ';')
s = rep_re(s, r'const mq=\[\n.*?\n\];', 'const mq=' + J(MQ) + ';')
s = between(s, '/* ---------- find the bug ---------- */', '/* ---------- tabs ---------- */', 'const dbg=' + J(DBG) + ';\n' + DBG_JS)
s = rep_re(s, r'const CONF_Q=\{.*?\};', 'const CONF_Q=' + J(CONF_Q) + ';')
s = rep_re(s, r'const GOAL_DEF=\[.*?\n\];',
  "const GOAL_DEF=[\n"
  " {name:'Барлығы',goal:'екі айнымалы өрнектің ақиқат кестесін тұрғызамын',items:[\n"
  "   ['q',[0,1],'Викторина, 1, 2-сұрақтар','#viktorina'],['prac',['P1','P2'],'Практика P1, P2','#praktika']]},\n"
  " {name:'Көпшілігі',goal:'аралық бағандармен үш айнымалы өрнектің кестесін тұрғызамын',items:[\n"
  "   ['q',[2,3,4],'Викторина, 3, 4, 5-сұрақтар','#viktorina'],['prac',['P3','P4'],'Практика P3, P4','#praktika'],['dop',['A1','A2'],'Қосымша есеп A1 немесе A2','#dop']]},\n"
  " {name:'Кейбіреулері',goal:'кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін',items:[\n"
  "   ['q',[5,6],'Викторина, 6, 7-сұрақтар','#viktorina'],['prac',['P5','P6'],'Практика P5, P6','#praktika'],['dop',['B1','B2','C1','C2'],'B немесе C деңгейіндегі қосымша есеп','#dop']]},\n"
  "];")
s = rep_re(s, r"const msg=reached<0\?.*?Керемет жұмыс!'\];",
  "const msg=reached<0?['Сабақ мақсатына әзірге жетпедіңіз','Базалық деңгейден бастаңыз: викторинаның 1, 2-сұрақтары және практикалық жұмыстың P1, P2 есептері.']:\n"
  "    reached===0?['9.2.1.2 мақсатына базалық деңгейде жеттіңіз','Сіз екі айнымалы өрнектің кестесін тұрғызасыз. Келесі қадам — үш айнымалы және аралық бағандар: викторинаның 3–5-сұрақтары, P3, P4 есептері және A1 немесе A2 қосымша есебі.']:\n"
  "    reached===1?['9.2.1.2 мақсатына «Көпшілігі» деңгейінде жеттіңіз','Сіз аралық бағандармен кестені қатесіз тұрғызасыз. Енді кестені талдаңыз: 6, 7-сұрақтар, P5, P6 есептері және B немесе C деңгейіндегі қосымша есеп.']:\n"
  "    ['9.2.1.2 мақсатына толық жеттіңіз','Сіз кестені тұрғызып қана қоймай, оны талдап, өрнектерді салыстырасыз. Керемет жұмыс!'];")
s = rep(s, '<span class="obj-code">9.2.5.3</span>', '<span class="obj-code">9.2.1.2</span>')
s = rep_re(s, r'const HINTS=\[\n.*?\n\];', 'const HINTS=' + J(HINTS) + ';')
s = rep(s, "const HINT_TABS=['svoistva','lab','metody','pesochnica'];", "const HINT_TABS=['svoistva','lab','metody'];")
s = rep(s, "return `Доп. задача ${b}`;", "return `Қосымша есеп ${b}`;")
s = rep(s, "stLangOk=mode==='change'||!!student||store.get('lang',null)===CUR_LANG;", "stLangOk=true;")
s = rep(s, "'Алдымен тілді, содан кейін сыныпты, кейін тегің мен атыңды таңда.'", "'Алдымен сыныпты, содан кейін тегің мен атыңды таңда.'")
s = rep(s, "if(a.length<=5)return [a];const g=Math.ceil(a.length/5);", "if(a.length<=4)return [a];let g=Math.ceil(a.length/4);if(Math.floor(a.length/g)<3&&g>1)g--;")
s = rep(s, "let pkClass=store.get('pkClass',null);", "let pkClass=store.get('pkClass',null);if(!pkClass&&Object.keys(CLASSES).length===1){pkClass=Object.keys(CLASSES)[0];store.set('pkClass',pkClass);}")
s = rep(s, 'resList=Array.isArray(v&&v.results)?v.results:[];', 'resList=Array.isArray(v&&v.results)?v.results.filter(r=>r&&(!r.lesson||r.lesson===LESSON)):[];')
for bad in ['іздеу', 'Іздеу', 'кітап', 'sandbox', 'pesochnica', 'makeEditor(']:
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
print('ok', len(h), len(s))
