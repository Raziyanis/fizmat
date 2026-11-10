import sys, json, re
MX = sys.argv[1]
SRC = {'student': sys.argv[2], 'teacher': sys.argv[3]}
OUT = {'student': sys.argv[4], 'teacher': sys.argv[5]}
css = open(MX + '/addon.css', encoding='utf-8').read()
addon = open(MX + '/addon.js', encoding='utf-8').read()
addon = 'var MX_CSS = ' + json.dumps(css, ensure_ascii=False) + ';\n' + addon

def rep(s, old, new, count=1):
    n = s.count(old)
    assert n == count, (n, old[:100])
    return s.replace(old, new)

STAGE_RENUM = [  # от больших номеров к меньшим, чтобы не сдвинуть дважды
    ('Этап 8 · домашнее задание', 'Этап 9 · домашнее задание'), ('8-кезең · үй тапсырмасы', '9-кезең · үй тапсырмасы'),
    ('Этап 7 · рефлексия', 'Этап 8 · рефлексия'), ('7-кезең · рефлексия', '8-кезең · рефлексия'),
    ('Этап 6 · выбор структуры данных', 'Этап 7 · выбор структуры данных'), ('6-кезең · деректер құрылымын таңдау', '7-кезең · деректер құрылымын таңдау'),
    ('Этап 6 · список или кортеж', 'Этап 7 · список или кортеж'), ('6-кезең · тізім бе, кортеж бе', '7-кезең · тізім бе, кортеж бе'),
    ('Этап 5 · практика · формативное оценивание', 'Этап 6 · практика · формативное оценивание'), ('5-кезең · практика · қалыптастырушы бағалау', '6-кезең · практика · қалыптастырушы бағалау'),
    ('Этап 4 · проверка понимания', 'Этап 5 · проверка понимания'), ('4-кезең · түсінуді тексеру', '5-кезең · түсінуді тексеру'),
]
NEW_UKK = {
    'Операции': 'Амалдар',
    'Новая тема — объяснение с примерами и задание на сопоставление': 'Жаңа тақырып — мысалдармен түсіндіру және сәйкестендіру тапсырмасы',
    'Операции над множествами — объяснение и задание на сопоставление': 'Жиындарға амалдар — түсіндіру және сәйкестендіру тапсырмасы',
}

def bump_ru(s):
    for a, b in (('Этап 6', 'Этап 7'), ('Этап 5', 'Этап 6'), ('Этап 4', 'Этап 5')): s = s.replace(a, b)
    return s
def bump_kk(s):
    for a, b in (('6-кезең', '7-кезең'), ('5-кезең', '6-кезең'), ('4-кезең', '5-кезең')): s = s.replace(a, b)
    return s

def fix_lesson(line, var, kk):
    pre = 'var ' + var + ' = '
    assert line.startswith(pre) and line.rstrip().endswith(';')
    d = json.loads(line[len(pre):].rstrip()[:-1])
    gm = d['goalMap']
    bump = bump_kk if kk else bump_ru
    for g in gm: g['check'] = bump(g['check'])
    m3 = '3-кезең: сәйкестендіру тапсырмасы' if kk else 'Этап 3: задание на сопоставление'
    m4 = '4-кезең: сәйкестендіру тапсырмасы' if kk else 'Этап 4: задание на сопоставление'
    gm[1]['check'] = m3 + ' · ' + gm[1]['check']
    gm[2]['check'] = m4 + ' · ' + gm[2]['check']
    gm[3]['check'] = m4 + ' · ' + gm[3]['check']
    if kk:
        gm[2]['where'] = gm[2]['where'].replace('3-кезең, 13–20', '4-кезең, 13–20')
        assert gm[3]['where'] == '3-кезең, 12 және 21–23-қадамдар'
        gm[3]['where'] = '3-кезең, 12-қадам · 4-кезең, 21–23-қадамдар'
        d['reached'] = d['reached'].replace('5-кезеңде', '6-кезеңде').replace('4-кезеңде', '5-кезеңде')
    else:
        gm[2]['where'] = gm[2]['where'].replace('Этап 3, шаги 13–20', 'Этап 4, шаги 13–20')
        assert gm[3]['where'] == 'Этап 3, шаги 12 и 21–23'
        gm[3]['where'] = 'Этап 3, шаг 12 · Этап 4, шаги 21–23'
        d['reached'] = d['reached'].replace('на этапе 5', 'на этапе 6').replace('на этапе 4', 'на этапе 5')
    return pre + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n'

def fix_ukk(line):
    pre = 'var UKK = '
    d = json.loads(line[len(pre):].rstrip()[:-1])
    d.update(NEW_UKK)
    return pre + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';\n'

for host in ('student', 'teacher'):
    s = open(SRC[host], encoding='utf-8').read()
    lines = s.split('\n')
    for i, ln in enumerate(lines):
        if ln.startswith('var L = {'): lines[i] = fix_lesson(ln + '\n', 'L', False).rstrip('\n')
        elif ln.startswith('var LKK = {'): lines[i] = fix_lesson(ln + '\n', 'LKK', True).rstrip('\n')
        elif ln.startswith('var UKK = {'): lines[i] = fix_ukk(ln + '\n').rstrip('\n')
    s = '\n'.join(lines)
    # кнопки этапов: новая «Операции» и сдвиг номеров
    s = rep(s, '<button class="stage" data-stage="lesson"><span class="num">3</span><span class="lbl">Новая тема</span></button>',
            '<button class="stage" data-stage="lesson"><span class="num">3</span><span class="lbl">Новая тема</span></button>\n'
            '      <button class="stage" data-stage="lesson2"><span class="num">4</span><span class="lbl">Операции</span></button>')
    for name, old, new in (('home', 8, 9), ('reflect', 7, 8), ('decide', 6, 7), ('work', 5, 6), ('check', 4, 5)):
        s = rep(s, 'data-stage="%s"><span class="num">%d</span>' % (name, old), 'data-stage="%s"><span class="num">%d</span>' % (name, new))
    for a, b in STAGE_RENUM:
        s = s.replace(a, b)
    s = rep(s, "var PANELS = ['topic', 'lesson', 'check', 'work', 'decide', 'reflect', 'home'];",
               "var PANELS = ['topic', 'lesson', 'lesson2', 'check', 'work', 'decide', 'reflect', 'home'];")
    if host == 'student':
        s = rep(s, '  <div id="screen-lesson" style="display:none"></div>\n',
                   '  <div id="screen-lesson" style="display:none"></div>\n  <div id="screen-lesson2" style="display:none"></div>\n')
        s = rep(s, "  if (name === 'lesson') renderLesson();\n", "  if (name === 'lesson') renderLesson();\n  if (name === 'lesson2') renderLesson2();\n")
        s = rep(s, "  ['topic', 'lesson', 'check', 'work', 'decide', 'reflect', 'home'].forEach(function (n) {",
                   "  ['topic', 'lesson', 'lesson2', 'check', 'work', 'decide', 'reflect', 'home'].forEach(function (n) {")
        s = rep(s, 'function renderLesson() {', 'function renderLessonAll_() {   /* прежний показ всех шагов подряд; теперь renderLesson в дополнении */')
        s = rep(s, 'function renderTopic() {', 'function renderTopicBase_() {')
        s = rep(s, """  [['3', 'Новая тема — объяснение с примерами'],
   ['4', 'Понимание — короткая проверка на 10 баллов'],
   ['5', 'Практика — практическая работа на 10 баллов'],
   ['6', 'Рефлексия'],
   ['7', 'Домашнее задание']].forEach(function (pair) {""",
"""  [['3', 'Новая тема — объяснение с примерами и задание на сопоставление'],
   ['4', 'Операции над множествами — объяснение и задание на сопоставление'],
   ['5', 'Понимание — короткая проверка на 10 баллов'],
   ['6', 'Практика — практическая работа на 10 баллов'],
   ['7', 'Список/кортеж/set'],
   ['8', 'Рефлексия'],
   ['9', 'Домашнее задание']].forEach(function (pair) {""")
        s = rep(s, "\nif (offlineFile_()) fileWarning_(); else start();\n", "\n" + addon + "\nif (offlineFile_()) fileWarning_(); else start();\n")
    else:
        s = rep(s, '  <div id="panel-lesson" style="display:none"></div>\n',
                   '  <div id="panel-lesson" style="display:none"></div>\n  <div id="panel-lesson2" style="display:none"></div>\n')
        s = rep(s, "  if (STAGE === 'lesson') drawLessonPanel();\n", "  if (STAGE === 'lesson') drawLessonPanel();\n  if (STAGE === 'lesson2') drawLessonPanel2();\n")
        s = rep(s, "drawStageScores('check', 'Проверка понимания', 4);", "drawStageScores('check', 'Проверка понимания', 5);")
        s = rep(s, "drawStageScores('work', 'Практика · ФО', 5);", "drawStageScores('work', 'Практика · ФО', 6);")
        s = rep(s, 'function drawLessonPanel() {', 'function drawLessonPanelAll_() {   /* прежний показ всех шагов подряд; теперь drawLessonPanel в дополнении */')
        s = rep(s, 'function drawTopic() {', 'function drawTopicBase_() {')
        tail = "  document.getElementById('refresh').addEventListener('click', load);\n}\n</script>\n</body>"
        s = rep(s, tail, tail.replace('}\n</script>', '}\n' + addon + '\n</script>'))
    assert '</script' not in addon
    open(OUT[host], 'w', encoding='utf-8').write(s)
    print(host, 'ok', len(s))
