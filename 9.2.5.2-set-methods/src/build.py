# -*- coding: utf-8 -*-
"""Собирает файлы ученика и учителя урока 9.2.5.2 из исходных файлов-шаблонов.

Запуск:  python3 -I build.py <student.orig.html> <teacher.orig.html> <out_dir>
Все примеры кода исполняются настоящим Python: выводы слайдов и справочника,
верные ответы повторения и ожидаемые ответы задач берутся из запуска."""
import contextlib
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content as C  # noqa: E402
import langkeep  # noqa: E402
import kkui  # noqa: E402

VER = 'set v1 · 10 ноября'


# ---------------- запуск Python ----------------
def run(code, inputs=()):
    data = list(inputs)

    def _input(prompt=''):
        if not data:
            raise EOFError('no input')
        return data.pop(0)

    buf = io.StringIO()
    err = None
    with contextlib.redirect_stdout(buf):
        try:
            exec(compile(code, '<program>', 'exec'), {'__name__': '__main__', 'input': _input})
        except Exception as e:  # noqa: BLE001
            err = '%s: %s' % (type(e).__name__, e)
    return buf.getvalue(), err


def shown(code):
    """То, что покажет страница: вывод, а при ошибке — строка ошибки."""
    out, err = run(code)
    out = out.rstrip('\n')
    if err:
        out = (out + '\n' if out else '') + err
    return out


def py_lit(v, br):
    parts = ['"%s"' % x if isinstance(x, str) else str(x) for x in v]
    if br == '{':
        return '{' + ', '.join(parts) + '}' if parts else 'set()'
    if br == '(':
        return '(' + ', '.join(parts) + (',)' if len(parts) == 1 else ')')
    return '[' + ', '.join(parts) + ']'


def with_data(code, data):
    """Та же подстановка, что в странице (withData)."""
    for k, v in (data or {}).items():
        rx = re.compile(r'^' + k + r'\s*=\s*([\[({]).*[\])}]\s*$', re.M)
        m = rx.search(code)
        if not m:
            raise SystemExit('нет строки данных %s в коде:\n%s' % (k, code))
        code = rx.sub(lambda _m: k + ' = ' + py_lit(v, m.group(1)), code, count=1)
    return code


def lit_kind(code, k):
    m = re.search(r'^' + k + r'\s*=\s*([\[({])', code, re.M)
    return m.group(1) if m else '('


# ---------------- сборка данных ----------------
def build():
    ru = lambda o: C.pick(o, 'ru')  # noqa: E731
    kk = lambda o: C.pick(o, 'kk')  # noqa: E731

    # --- повторение ---
    Q, QKK = [], []
    for q in C.QUESTIONS:
        out = shown(q['code'])
        want = 'Ошибка' if ('Error' in out and '\n' not in out and ':' in out) else out
        got = q['options'][q['correct']]
        if got != want:
            raise SystemExit('%s: верный вариант %r, а Python даёт %r' % (q['id'], got, out))
        if len(set(q['options'])) != len(q['options']):
            raise SystemExit('%s: повторяются варианты' % q['id'])
        Q.append(dict(id=q['id'], topic=q['topic'], code=q['code'], text=C.ASK_RU,
                      options=q['options'], correct=q['correct'], note=ru(q['note'])))
        QKK.append(dict(text=C.ASK_KK,
                        options=[C.ERR_KK if o == C.ERR_RU else o for o in q['options']],
                        note=kk(q['note'])))

    # --- слайды ---
    blocks = []
    for b in C.BLOCKS:
        b = dict(b)
        if 'code' in b:
            code_ru = ru(b['code'])
            b['out'] = shown(code_ru)
            if isinstance(b['code'], C.T):
                assert shown(b['code'].kk) == b['out']
        blocks.append(b)

    cards = []
    for c in C.CARDS:
        c = dict(c)
        c['out'] = shown(c['code'])
        cards.append(c)

    # --- проверка понимания: choice сверяем с Python ---
    for it in C.CHECK['items']:
        if it['kind'] == 'choice':
            m = re.match(r'(?:Что выведет )?print\((.*)\)\?$', ru(it['text']))
            out = shown('print(%s)' % m.group(1))
            if ru(it['options'][it['answer']]) != out:
                raise SystemExit('check: %r -> %r' % (it['text'].ru, out))

    # --- практика ---
    tasks = []
    for t in C.TASKS:
        t = dict(t)
        start = ru(t['start'])
        ref = t['ref']
        tests = []
        for test in t['tests']:
            test = dict(test)
            code = with_data(ref, test.get('data'))
            if test.get('data'):
                with_data(start, test['data'])          # строка данных есть в заготовке
                if isinstance(t['start'], C.T):
                    with_data(t['start'].kk, test['data'])
            out, err = run(code, test.get('inputs', []))
            if err:
                raise SystemExit('%s: эталон упал: %s' % (t['id'], err))
            test['want'] = out.rstrip('\n')
            if not test['want'].strip():
                raise SystemExit('%s: пустой ответ в тесте' % t['id'])
            tests.append(test)
        t['tests'] = tests
        samples = []
        for test in tests[:2]:
            if test.get('data'):
                left = '\n'.join('%s = %s' % (k, py_lit(v, lit_kind(start, k)))
                                 for k, v in test['data'].items())
            else:
                left = '\n'.join(test['inputs'])
            samples.append([left, test['want']])
        t['samples'] = samples
        t['points'] = 1
        if t.get('hint') is None:
            t.pop('hint', None)
        tasks.append(t)

    main = [t for t in tasks if not t.get('extra')]
    assert len(main) == 10 and len(tasks) == 14

    lesson_src = dict(C.HEAD)
    lesson_src.update(
        blocks=blocks,
        reference=dict(cards=cards, compare=C.COMPARE),
        mistakes=C.MISTAKES,
        check=C.CHECK,
        work=dict(total=10, fo=True, kind='code', intro=C.WORK_INTRO, tasks=tasks),
        decide=C.DECIDE,
        reflection=C.REFLECTION,
        homework=C.HOMEWORK,
    )
    L = ru(lesson_src)
    LKK = kk(lesson_src)
    LKK.pop('code', None)
    assert sum(i['points'] for i in L['check']['items']) == L['check']['total']
    for it in L['decide']['items']:
        assert it['answer'] in L['decide']['choices']
    CL = [dict(klass=C.CLASS_NAME, students=C.STUDENTS)]
    return Q, QKK, L, LKK, CL


# ---------------- правка страниц ----------------
def sub1(src, old, new, count=1):
    n = src.count(old)
    if n != count:
        raise SystemExit('ожидалось %d вхождений, найдено %d: %r' % (count, n, old[:80]))
    return src.replace(old, new)


def js(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


def set_var(src, name, value):
    rx = re.compile(r'^var ' + name + r' = .*;$', re.M)
    if len(rx.findall(src)) != 1:
        raise SystemExit('переменная %s не найдена ровно один раз' % name)
    return rx.sub(lambda _m: 'var %s = %s;' % (name, value), src)


ERRHELP_OLD_START = '/** Короткое объяснение частых ошибок по-русски. */'
ERRHELP_NEW = r'''/** Короткое объяснение частых ошибок — на языке страницы. */
function errHelp(e) {
  var t = String((e && e.type) || ''), m = String((e && e.msg) || '');
  var kk = (LANG === 'kk');
  if (t === 'NameError') {
    var who = (/'([^']+)'/.exec(m) || [])[1] || '';
    return kk
      ? 'Python ' + (who ? '«' + who + '» ' : '') + 'атауын білмейді. Көбіне бұл айнымалы атауындағы қате — жоғарыда қалай жазылғанын салыстырыңыз.'
      : 'Python не знает имя' + (who ? ' «' + who + '»' : '') +
        '. Чаще всего это опечатка в названии переменной — сверьте, как оно написано выше.';
  }
  if (t === 'EOFError') {
    return kk
      ? 'Бағдарлама енгізу сұрап тұр, ал дерек қалмады: артық input() бар немесе жіберілгеннен көп оқылды.'
      : 'Программа просит ввод, а данных больше нет: лишний input() или их прочитано больше, чем прислали.';
  }
  if (t === 'TypeError' && m.indexOf('subscriptable') > -1 && m.indexOf('set') > -1) {
    return kk
      ? 'Жиында индекс жоқ: s[0] жазуға болмайды. Рет керек болса — sorted(s).'
      : 'У множества нет индексов: s[0] писать нельзя. Если нужен порядок — sorted(s).';
  }
  if (t === 'TypeError' && m.indexOf('unhashable') > -1) {
    return kk
      ? 'Жиынға тізімді салуға болмайды. Бірнеше элементті update([...]) арқылы қосыңыз.'
      : 'Положить в множество список нельзя. Несколько элементов добавляют через update([...]).';
  }
  if (t === 'TypeError' && m.indexOf('exactly one argument') > -1) {
    return kk
      ? 'add дәл бір элемент қабылдайды. Бірнешеуін update([...]) қосады.'
      : 'add принимает ровно один элемент. Несколько добавляет update([...]).';
  }
  if (t === 'KeyError') {
    return kk
      ? 'Жиында мұндай элемент жоқ. Элемент болмауы мүмкін болса, remove орнына discard жазыңыз; бос жиында pop() да осы қатені береді.'
      : 'Такого элемента во множестве нет. Если его может не быть, пишите discard вместо remove; pop() у пустого множества даёт ту же ошибку.';
  }
  if (t === 'AttributeError' && m.indexOf("'set'") > -1) {
    return kk
      ? 'Жиында мұндай әдіс жоқ. Жиынға қосу — add, жою — remove немесе discard.'
      : 'У множества нет такого метода. Добавление — add, удаление — remove или discard.';
  }
  if (t === 'AttributeError' && m.indexOf("'dict'") > -1) {
    return kk
      ? 'Бұл жиын емес, сөздік: {} бос сөздік жасайды. Бос жиын — set().'
      : 'Это не множество, а словарь: {} создаёт пустой словарь. Пустое множество — set().';
  }
  if (t === 'IndexError') {
    return kk
      ? 'Жоқ элементке жүгіну. Санау нөлден басталады: үш элементті тізімде бұл 0, 1 және 2.'
      : 'Обращение к элементу, которого нет. Счёт начинается с нуля: у списка из трёх элементов это 0, 1 и 2.';
  }
  if (t === 'ValueError' && m.indexOf('invalid literal') > -1) {
    return kk
      ? 'Санды оқу мүмкін болмады: бір жолда бірнеше сан болса, split() арқылы бөліңіз.'
      : 'Не получилось прочитать число: если в строке несколько чисел, разбейте её через split().';
  }
  if (t === 'ZeroDivisionError') return kk ? 'Нөлге бөлу.' : 'Деление на ноль.';
  return '';
}
'''

PYLIT_OLD = '''function pyLit(v, round) {
  var parts = v.map(function (x) {
    return (typeof x === 'string') ? '"' + x + '"' : String(x);
  });
  if (!round) return '[' + parts.join(', ') + ']';
  return '(' + parts.join(', ') + (parts.length === 1 ? ',)' : ')');
}'''
PYLIT_NEW = '''function pyLit(v, br) {
  var parts = v.map(function (x) {
    return (typeof x === 'string') ? '"' + x + '"' : String(x);
  });
  if (br === true) br = '(';
  if (br === '{') return parts.length ? '{' + parts.join(', ') + '}' : 'set()';
  if (br !== '(') return '[' + parts.join(', ') + ']';
  return '(' + parts.join(', ') + (parts.length === 1 ? ',)' : ')');
}

/* Какие скобки у строки данных в программе: [ — список, ( — кортеж, { — множество. */
function litKind(code, k) {
  var m = new RegExp('^' + k + '\\\\s*=\\\\s*([\\\\[({])', 'm').exec(String(code || ''));
  return m ? m[1] : '(';
}'''

WITHDATA_OLD = '''    var re = new RegExp('^' + k + '\\\\s*=\\\\s*([\\\\[(]).*[\\\\])]\\\\s*$', 'm');
    var m = re.exec(c);
    if (!m) return null;
    c = c.replace(re, k + ' = ' + pyLit(data[k], m[1] === '('));'''
WITHDATA_NEW = '''    var re = new RegExp('^' + k + '\\\\s*=\\\\s*([\\\\[({]).*[\\\\])}]\\\\s*$', 'm');
    var m = re.exec(c);
    if (!m) return null;
    c = c.replace(re, k + ' = ' + pyLit(data[k], m[1]));'''


def patch_common(src, Q, QKK, L, LKK, UKK, CL):
    src = set_var(src, 'Q', js(Q))
    src = set_var(src, 'L', js(L))
    src = set_var(src, 'LKK', js(LKK))
    src = set_var(src, 'UKK', js(UKK))
    src = set_var(src, 'QKK', js(QKK))
    src = set_var(src, 'CL', js(CL))
    src = set_var(src, 'VER', js(VER))
    src = sub1(src, "var PAGE_VERSION = 'v63 · 8 ноября';", "var PAGE_VERSION = '%s';" % VER)
    # своё хранилище: очереди, кэш и черновики другого урока не смешиваются
    src = src.replace("'listmethods.", "'setmethods.")
    assert 'listmethods' not in src
    # таблица для этого урока ещё не подключена — ничего не шлём в чужую
    src = re.sub(r'^var SEND_URL = ".*";$',
                 '/* Адрес развёртывания Apps Script для этого урока. Пока пусто: '
                 'ответы копятся на устройстве ученика и уйдут, когда адрес появится. */\n'
                 'var SEND_URL = "";', src, count=1, flags=re.M)
    src = sub1(src, "function sendOne(payload){\n  var body",
               "function sendOne(payload){\n  if (!SEND_URL) return Promise.reject(new Error('таблица урока не подключена'));\n  var body")
    src = sub1(src, '<span>Информатика · 8 класс</span>', '<span>Информатика · 9 класс</span>')
    src = sub1(src, '<span class="lbl">Список/кортеж</span>', '<span class="lbl">Список/кортеж/set</span>')
    src = sub1(src, "cmp.appendChild(el('div', 'refname', 'Список или кортеж: сравнение'));",
               "cmp.appendChild(el('div', 'refname', R.compare.title || 'Список или кортеж: сравнение'));")
    here = os.path.dirname(os.path.abspath(__file__))
    css = open(os.path.join(here, 'venn.css'), encoding='utf-8').read()
    vjs = open(os.path.join(here, 'venn.js'), encoding='utf-8').read()
    src = sub1(src, '</style>', css + '</style>')
    for fn in ('function renderLesson() {', 'function drawLessonPanel() {'):
        if src.count('\n' + fn) == 1:
            src = src.replace('\n' + fn, '\n' + vjs + fn)
            break
    else:
        raise SystemExit('нет функции слайдов')
    src = sub1(src, "    card.appendChild(el('div', 'askbig', b.ask));\n",
               "    card.appendChild(el('div', 'askbig', b.ask));\n"
               "    if (b.askCode) card.appendChild(el('pre', null, b.askCode));\n")
    src = sub1(src, "      q.appendChild(el('div', null, b.ask));\n",
               "      q.appendChild(el('div', null, b.ask));\n"
               "      if (b.askCode) q.appendChild(el('pre', null, b.askCode));\n")
    src = sub1(src, "    card.appendChild(el('div', null, b.text));\n",
               "    card.appendChild(el('div', null, b.text));\n    slideExtras(card, b);\n")
    return src


def patch_student(src, data):
    src = patch_common(src, *data)
    src = langkeep.patch_student(src, sub1)
    src = kkui.patch_both(src, sub1)
    src = kkui.patch_student(src, sub1)
    src = sub1(src, '<title>Методы списка — повторение</title>', '<title>Методы множества — урок</title>')
    src = sub1(src, '<div class="display">Методы списка</div>', '<div class="display">Список и кортеж</div>')
    src = sub1(src, "decide: 'Список или кортеж', reflect: 'Рефлексия' };",
               "decide: 'Список, кортеж или множество', reflect: 'Рефлексия' };")
    src = sub1(src, "    txDom(document.getElementById('stages'));\n",
               "    txDom(document.getElementById('stages'));\n    txDom(document.querySelector('.brand'));\n")
    src = sub1(src, PYLIT_OLD, PYLIT_NEW)
    src = sub1(src, WITHDATA_OLD, WITHDATA_NEW)
    src = sub1(src, "names.map(function (n) { return '«' + n + ' = (…)»'; })",
               "names.map(function (n) { return '«' + n + ' = …»'; })")
    src = sub1(src, "detail: tx('Данные:') + '\\n' + testShow(test) +",
               "detail: tx('Данные:') + '\\n' + testShow(test, code) +")
    src = sub1(src, "function testShow(test) {", "function testShow(test, code) {")
    src = sub1(src, "parts.push(k + ' = ' + pyLit(test.data[k], true));",
               "parts.push(k + ' = ' + pyLit(test.data[k], litKind(code, k)));")
    # errHelp целиком
    i = src.index(ERRHELP_OLD_START)
    j = src.index('/** Проверка задачи: программу запускают на всех наборах данных. */')
    src = src[:i] + ERRHELP_NEW + '\n' + src[j:]
    src = sub1(src, "return 'fo:' + (who === '|' ? 'noname' : who);",
               "return 'fo-set:' + (who === '|' ? 'noname' : who);")
    # этап 6: выбор из трёх структур
    src = sub1(src, "box.appendChild(el('div', 'eyebrow', 'Этап 6 · список или кортеж'));\n  box.appendChild(el('div', 'display', 'Список или кортеж?'));",
               "box.appendChild(el('div', 'eyebrow', 'Этап 6 · выбор структуры данных'));\n  box.appendChild(el('div', 'display', D.title || 'Список или кортеж?'));")
    src = sub1(src, "['кортеж', 'список'].forEach(function (choice) {",
               "(D.choices || ['кортеж', 'список']).forEach(function (choice) {")
    src = sub1(src, "showStageResult('decide-result', res, 'Список или кортеж');",
               "showStageResult('decide-result', res, 'Список, кортеж или множество');")
    return src


def patch_teacher(src, data):
    src = patch_common(src, *data)
    src = langkeep.patch_teacher(src, sub1)
    src = kkui.patch_both(src, sub1)
    src = kkui.patch_teacher(src, sub1)
    src = sub1(src, '<title>Методы списка — экран учителя</title>', '<title>Методы множества — экран учителя</title>')
    src = sub1(src, '<h1>Методы списка — ответы класса</h1>', '<h1>Методы множества — ответы класса</h1>')
    src = sub1(src, "box.appendChild(el('div', 'eyebrow', 'Этап 6 · список или кортеж'));\n  box.appendChild(el('div', 'display', 'Список или кортеж?'));",
               "box.appendChild(el('div', 'eyebrow', 'Этап 6 · выбор структуры данных'));\n  box.appendChild(el('div', 'display', (L.decide && L.decide.title) || 'Список или кортеж?'));")
    src = sub1(src, "'. В теме письма — «8 класс».'", "'. В теме письма — «9 класс».'")
    src = sub1(src, 'var TOKEN = "92895e2178f54d52";', 'var TOKEN = "";')
    # без таблицы не ждём 20 секунд и объясняем честно
    src = sub1(src, "  var name = '__lm' + (++jsonpN) + '_' + Date.now();",
               "  if (!SEND_URL) { setTimeout(function(){ onFail(new Error('no-sheet')); }, 0); return; }\n"
               "  var name = '__lm' + (++jsonpN) + '_' + Date.now();")
    src = sub1(src, "      var why = (!TOKEN || TOKEN === 'ТОКЕН-НЕ-ЗАДАН')",
               "      var why = !SEND_URL\n"
               "        ? 'Таблица для этого урока ещё не подключена, поэтому ответы класса сюда не приходят. ' +\n"
               "          'Задания, разбор и вызов учеников работают из файла.'\n"
               "        : (!TOKEN || TOKEN === 'ТОКЕН-НЕ-ЗАДАН')")
    return src


def main():
    s_path, t_path, out_dir = sys.argv[1:4]
    Q, QKK, L, LKK, CL = build()
    base_ukk = json.loads(re.search(r'^var UKK = (.*);$',
                                    open(s_path, encoding='utf-8').read(), re.M).group(1))
    UKK = dict(base_ukk)
    UKK.update(C.UI_EXTRA)
    UKK[VER] = VER.replace('ноября', 'қараша')
    UKK['Таблица для этого урока ещё не подключена, поэтому ответы класса сюда не приходят. '
        'Задания, разбор и вызов учеников работают из файла.'] = (
        'Бұл сабақтың кестесі әлі қосылмаған, сондықтан сынып жауаптары мұнда келмейді. '
        'Тапсырмалар, талдау және оқушыны шақыру файлдан жұмыс істейді.')
    data = (Q, QKK, L, LKK, UKK, CL)
    with open(s_path, encoding='utf-8') as f:
        s = patch_student(f.read(), data)
    with open(t_path, encoding='utf-8') as f:
        t = patch_teacher(f.read(), data)
    os.makedirs(out_dir, exist_ok=True)
    for name, body in (('fayl-uchenika.html', s), ('fayl-uchitelya.html', t)):
        with open(os.path.join(out_dir, name), 'w', encoding='utf-8') as f:
            f.write(body)
    json.dump(dict(Q=Q, QKK=QKK, L=L, LKK=LKK, CL=CL), open(os.path.join(out_dir, 'lesson-data.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('ok', len(s), len(t))


if __name__ == '__main__':
    main()
