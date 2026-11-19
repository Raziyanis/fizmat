# -*- coding: utf-8 -*-
"""Build the 9.2.4.3 truth-table lesson from the user's 'Іздеу зертханасы' engine (Kazakh only)."""
import sys, re, json
sys.path.insert(0, sys.argv[1])
from content import *
from blocks import *
from js_blocks import RACE_JS, LAB_JS

STU, TEA, OUTDIR = sys.argv[2], sys.argv[3], sys.argv[4]
J = lambda x: json.dumps(x, ensure_ascii=False)

def rep(s, old, new, count=1):
    n = s.count(old)
    assert n == count, f'expected {count} got {n}: {old[:80]!r}'
    return s.replace(old, new)

def rep_re(s, pat, new, flags=re.S):
    m = list(re.finditer(pat, s, flags))
    assert len(m) == 1, f'regex matched {len(m)}: {pat[:80]!r}'
    a, b = m[0].span()
    return s[:a] + new + s[b:]

def between(s, start, end, new, keep_end=True):
    a = s.index(start); b = s.index(end, a)
    assert s.count(start) == 1, start[:60]
    return s[:a] + new + (s[b:] if keep_end else s[b + len(end):])

src = open(STU, encoding='utf-8').read().split('\n')
html = '\n'.join(src[1833:2772])
js = '\n'.join(src[2775:3653])
head_rest = '\n'.join(src[1:8])
skulpt = '\n'.join(src[2772:2774])

# ---------------- HTML ----------------
h = html
h = rep(h, '</style>', EXTRA_CSS + '</style>')
h = rep(h, '<div class="brand">Іздеу <span>·</span> search</div>', '<div class="brand">Ақиқат <span>·</span> truth table</div>')
h = rep_re(h, r'<nav aria-label="Сабақ бөлімдері">.*?</nav>',
  '<nav aria-label="Сабақ бөлімдері">\n    <a href="#povtorenie">Қайталау</a><a href="#tema">Тақырып қандай?</a><a href="#cel">Сабақ мақсаты</a><a href="#svoistva">Анықтама</a>'
  '<a href="#lab">Конструктор</a><a href="#metody">Кодта</a><a href="#pesochnica">Құмсалғыш</a><a href="#kakoy">Қай өрнек?</a><a href="#oshibka">Қатені тап</a>'
  '<a href="#viktorina">Викторина</a><a href="#praktika">Практика</a><a href="#dop">Қосымша есептер</a><a href="#refleksiya">Рефлексия</a>\n  </nav>')
h = rep(h, '<div class="lang-sw"><span>Қаз</span><button type="button" data-lang="ru" title="Русский">Рус</button></div>', '')
h = rep(h, 'Информатика · 9-сынып · Іздеу', 'Информатика · 9-сынып · Ақиқат кестелері')
h = rep(h, 'Алдымен тілді, содан кейін сыныпты, кейін тегің мен атыңды таңда.', 'Алдымен сыныпты, содан кейін тегің мен атыңды таңда.')
h = rep(h, '<div class="start-step"><div class="start-lbl">1. Тіл / Язык</div>', '<div class="start-step" hidden><div class="start-lbl">1. Тіл / Язык</div>')
h = rep(h, '<div class="start-lbl">2. Сынып</div>', '<div class="start-lbl">1. Сынып</div>')
h = rep(h, '<div class="start-lbl">3. Тегі мен аты</div>', '<div class="start-lbl">2. Тегі мен аты</div>')
h = rep(h, '<h2>Қайталау: жиын (set)</h2><p>Өткен тақырыпты еске түсірейік: жиынның қасиеттері мен әдістері. Уақыты — шамамен 7 минут.</p>',
        '<h2>Қайталау: логикалық амалдар және ақиқат кестесі</h2><p>Өткен тақырыпты еске түсірейік: ∧, ∨, ¬ амалдары, амалдар реті және ақиқат кестесіндегі жолдар саны. Python-дағы жазылуын да қайталаймыз. Уақыты — шамамен 5 минут.</p>')
h = rep(h, '<h3 class="sub">1. Ауызша сұрау «Дұрыс / Бұрыс» <span class="time">≈ 3 мин</span></h3>', '<h3 class="sub">1. Ауызша сұрау «Дұрыс / Бұрыс» <span class="time">≈ 2 мин</span></h3>')
h = rep(h, '<h3 class="sub">2. Жұппен сәйкестендіру <span class="time">≈ 4 мин</span></h3>', '<h3 class="sub">2. Жұппен сәйкестендіру: код және оның нәтижесі <span class="time">≈ 3 мин</span></h3>')
h = rep_re(h, r'<div class="qcards tf">\n.*?\n    </div>', '<div class="qcards tf">\n' + tf_cards() + '\n    </div>')
h = rep_re(h, r'    <details class="memo">.*?</details>', MEMO)
h = between(h, '  <section id="tema">', '  <section id="metody">', TEMA + '\n\n' + CEL + '\n\n' + SVOISTVA + '\n\n' + LAB + '\n\n')
h = rep(h, '<h2>Іздеу алгоритмдері кодта</h2><p>Мысалды орындау үшін «Құмсалғышқа» батырмасын басыңыз. Алдымен нәтижені болжап, содан кейін іске қосыңыз.</p>',
        '<h2>Ақиқат кестесі кодта</h2><p>Мысалды орындау үшін «Құмсалғышқа» батырмасын басыңыз. Алдымен нәтижені болжап, содан кейін іске қосыңыз. Уақыты — шамамен 2 минут.</p>')
h = rep(h, '<h2>Қай іздеу жарайды?</h2><p>Жағдаятты оқып, жауапты таңдаңыз. Жауаптан кейін түсіндірме шығады.</p>',
        '<h2>Қай өрнек жарайды?</h2><p>Жағдаятты оқып, жауапты таңдаңыз. Жауаптан кейін түсіндірме шығады. Мұғалім бірнеше жағдаятты сыныппен ауызша талдай алады.</p>')
h = rep(h, 'Әр іздеу бағдарламасында қате бар. Кодты іске қосып, не дұрыс болмағанын қарап, түзетіңіз де, «Тексеру» батырмасын басыңыз.',
        'Әр бағдарлама ақиқат кестесін қате құрады. Кодты іске қосып, не дұрыс болмағанын қарап, түзетіңіз де, «Тексеру» батырмасын басыңыз. Уақыты — шамамен 6 минут.')
h = rep(h, '<p>Сызықтық және екілік іздеу туралы жеті сұрақ. Жауаптан кейін түсіндірме шығады.</p>',
        '<p>Python-дағы логикалық өрнектер мен ақиқат кестелері туралы жеті сұрақ. Жауаптан кейін түсіндірме шығады. Уақыты — шамамен 4 минут.</p>')
h = rep(h, '<h2>Практикалық жұмыс: мектеп кітапханасы</h2><p>Сіз мектеп кітапханасының каталогына бағдарлама жазасыз: әр кітаптың инвентарлық нөмірі бар. P1–P6 есептері оңайдан қиынға қарай орналасқан. «Тексеру» батырмасы бағдарламаны тесттерде іске қосады.</p>',
        '<h2>Практикалық жұмыс: мектептің ақылды жүйесі</h2><p>Сіз мектептің дабыл және жарық жүйесіне бағдарлама жазасыз. P1–P6 есептері оңайдан қиынға қарай орналасқан. «Тексеру» батырмасы бағдарламаны тесттерде іске қосады. Уақыты — шамамен 10 минут.</p>')
h = rep_re(h, r'<p class="howto">Енгізудің бірінші жолы.*?</p>',
  '<p class="howto">Кіріс деректері бар есептерде оларды оқитын жол бағдарламаның басында жазылып қойған. Кесте жолдары екілік санау ретімен шығуы керек: 0 0 0, 0 0 1, …, 1 1 1. '
  'Мәндерді 0/1 түрінде шығарыңыз: <code>print(A, B, C, int(F))</code>.<span class="t-only"> Әр есептің астындағы үлгі шешімді тек мұғалім көреді.</span></p>')
h = rep(h, '«Тексеру» батырмасы бағдарламаны тесттерде іске қосып, қажетті алгоритмнің қолданылғанын тексереді.',
        '«Тексеру» батырмасы бағдарламаны тесттерде іске қосып, қажетті құрылымның (цикл, логикалық амалдар) қолданылғанын тексереді.')
h = rep_re(h, r'    <div class="refl">.*?\n    </div>\n    <div class="exit-end', REFL + '\n    <div class="exit-end')
h = rep(h, '✓ — уровень достигнут, ◐ — частично, ○ — не начат.', '✓ — деңгейге жетті, ◐ — ішінара, ○ — басталмаған.')
h = rep_re(h, r'Еңбегі адал – өскелең азамат\..*?</div></footer>',
  'Еңбегі адал – өскелең азамат. Тапсырмаларды өз бетіңізше орындап, өзіңізді адал тексеріңіз.<br>Браузердегі Python Skulpt интерпретаторында жұмыс істейді. Кестедегі мәндерді 0/1 түрінде шығару үшін <code>int()</code> қолданыңыз.</div></footer>')

# ---------------- JS ----------------
s = js
s = s.replace('searchlab', 'truthlab')
s = rep(s, "const LESSON='search';", "const LESSON='truth';")
s = rep_re(s, r"matcher\(\$\('#matchA'\),'mA3',\[.*?\],true\);", "matcher($('#matchA'),'mT1'," + J(MATCH) + ",true);")
s = between(s, '/* ---------- tab 2: topic ---------- */', '/* ---------- search visualizer ---------- */',
            'const RACE_CODE=' + J(RACE_CODE) + ';\nconst RACE5_CODE=' + J(RACE5_CODE) + ';\n' + RACE_JS)
s = between(s, '/* ---------- search visualizer ---------- */', '/* ---------- methods ---------- */', LAB_JS)
s = rep_re(s, r'const methods=\[\n.*?\n\];', 'const methods=' + J(METHODS) + ';')
s = rep_re(s, r"sandbox=makeEditor\(\$\('#sandbox'\),\{.*?\}\);", "sandbox=makeEditor($('#sandbox'),{title:'sandbox.py',code:" + J(SANDBOX) + ",stdin:''});")
s = rep_re(s, r'const NEED_LBL=\{.*?\};', "const NEED_LBL={'for ':'for циклі',' and ':'and амалы',' or ':'or амалы','not ':'not амалы','if':'if шарты','==':'== салыстыру'};")
s = rep_re(s, r'const tasks=\[\n.*?\n\];', 'const tasks=' + J(TASKS) + ';')
s = rep_re(s, r'const prac=\[\n.*?\n\];', 'const prac=' + J(PRAC) + ';')
s = rep_re(s, r'const quiz=\[\n.*?\n\];', 'const quiz=' + J(QUIZ) + ';')
s = rep_re(s, r'const mq=\[\n.*?\n\];', 'const mq=' + J(MQ) + ';')
s = rep_re(s, r'const dbg=\[\n.*?\n\];', 'const dbg=' + J(DBG) + ';')
s = rep_re(s, r'const CONF_Q=\{.*?\};', 'const CONF_Q=' + J(CONF_Q) + ';')
s = rep_re(s, r'const GOAL_DEF=\[.*?\n\];',
  "const GOAL_DEF=[\n"
  " {name:'Барлығы',goal:'логикалық өрнекті Python-да жазып, берілген жиын үшін мәнін есептеймін',items:[\n"
  "   ['q',[0,1],'Викторина, 1, 2-сұрақтар','#viktorina'],['prac',['P1','P2'],'Практика P1, P2','#praktika']]},\n"
  " {name:'Көпшілігі',goal:'екі және үш айнымалы өрнектің ақиқат кестесін шығарамын',items:[\n"
  "   ['q',[2,3,4],'Викторина, 3, 4, 5-сұрақтар','#viktorina'],['prac',['P3','P4'],'Практика P3, P4','#praktika'],['dop',['A1','A2'],'Қосымша есеп A1 немесе A2','#dop']]},\n"
  " {name:'Кейбіреулері',goal:'кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін',items:[\n"
  "   ['q',[5,6],'Викторина, 6, 7-сұрақтар','#viktorina'],['prac',['P5','P6'],'Практика P5, P6','#praktika'],['dop',['B1','B2','C1','C2'],'B немесе C деңгейіндегі қосымша есеп','#dop']]},\n"
  "];")
s = rep_re(s, r"const msg=reached<0\?.*?Керемет жұмыс!'\];",
  "const msg=reached<0?['Сабақ мақсатына әзірге жетпедіңіз','Базалық деңгейден бастаңыз: викторинаның 1, 2-сұрақтары және практикалық жұмыстың P1, P2 есептері.']:\n"
  "    reached===0?['9.2.4.3 мақсатына базалық деңгейде жеттіңіз','Сіз өрнекті Python-да жазып, оның мәнін есептейсіз. Келесі қадам — толық кесте: викторинаның 3–5-сұрақтары, P3, P4 есептері және A1 немесе A2 қосымша есебі.']:\n"
  "    reached===1?['9.2.4.3 мақсатына «Көпшілігі» деңгейінде жеттіңіз','Сіз ақиқат кестесін циклдермен құрасыз. Енді кестені талдаңыз: 6, 7-сұрақтар, P5, P6 есептері және B немесе C деңгейіндегі қосымша есеп.']:\n"
  "    ['9.2.4.3 мақсатына толық жеттіңіз','Сіз кестені құрып қана қоймай, оны бағдарламамен талдайсыз. Керемет жұмыс!'];")
s = rep(s, '<span class="obj-code">9.2.5.3</span>', '<span class="obj-code">9.2.4.3</span>')
s = rep_re(s, r'const HINTS=\[\n.*?\n\];', 'const HINTS=' + J(HINTS) + ';')
s = rep(s, "return `Доп. задача ${b}`;", "return `Қосымша есеп ${b}`;")
s = rep(s, "stLangOk=mode==='change'||!!student||store.get('lang',null)===CUR_LANG;", "stLangOk=true;")
s = rep(s, "'Алдымен тілді, содан кейін сыныпты, кейін тегің мен атыңды таңда.'", "'Алдымен сыныпты, содан кейін тегің мен атыңды таңда.'")
s = rep(s, 'resList=Array.isArray(v&&v.results)?v.results:[];', 'resList=Array.isArray(v&&v.results)?v.results.filter(r=>r&&(!r.lesson||r.lesson===LESSON)):[];')
for bad in ['іздеу', 'Іздеу', 'кітап']:
    left = [l for l in s.split('\n') if bad in l]
    assert not left, (bad, left[:3])
for bad in ['іздеу алгоритм', 'кітапхана', 'Сызықтық', 'жиын (set)', 'екілік іздеу']:
    assert bad not in h, bad
open(OUTDIR + '/check.js', 'w', encoding='utf-8').write(s)

BOOT = """<script>
(function(){
  var frag=document.getElementById('tpl-kz').content.cloneNode(true);
  var scripts=Array.prototype.slice.call(frag.querySelectorAll('script'));
  scripts.forEach(function(s){s.parentNode.removeChild(s);});
  document.documentElement.lang='kk';
  document.body.appendChild(frag);
  (async function(){
    for(var i=0;i<scripts.length;i++){var s=scripts[i],n=document.createElement('script');
      if(s.src){n.src=s.src;await new Promise(function(res){n.onload=res;n.onerror=res;document.body.appendChild(n);});}
      else{n.textContent=s.textContent;document.body.appendChild(n);}}
  })();
})();
</script>"""

def assemble(first_line, title):
    fl = first_line.replace('<html lang="ru">', '<html lang="kk">')
    fl = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', fl)
    return '\n'.join([fl, head_rest, '<template id="tpl-kz">', h, skulpt, '<script>', s, '</script>', '', '</template>', BOOT]) + '\n'

tea_first = open(TEA, encoding='utf-8').read().split('\n')[0]
open(OUTDIR + '/stu.html', 'w', encoding='utf-8').write(assemble(src[0], 'Ақиқат кестелері зертханасы'))
open(OUTDIR + '/tea.html', 'w', encoding='utf-8').write(assemble(tea_first, 'Ақиқат кестелері зертханасы — мұғалім'))
print('ok', len(h), len(s))
