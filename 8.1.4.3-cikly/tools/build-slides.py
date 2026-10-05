#!/usr/bin/env python3
"""Презентация 8.1.4.3 «Цикл while, цикл for» на двух языках из одного описания.
Каждый текст задаётся парой (рус., каз.). Результат: slides/ru/project и slides/kz/project
(deck.json + slides/<id>.html) для артефакта типа Slides.
Код на слайдах — из tools/examples.json (вывод получен запуском Python) или проверен в tools/check-slides.py.
Запуск: python3 tools/build-slides.py"""
import json, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
EX = json.loads((ROOT / 'tools' / 'examples.json').read_text(encoding='utf-8'))

BG, DARK, CARD, LINE, BLUE, ORANGE, ORANGE_T, MUTED, GREEN = '#F7F9FC', '#14213D', '#FFFFFF', '#C9D5E6', '#2452C0', '#D9661F', '#B5520F', '#4A5568', '#1F7A4A'
FONT = "font-family:'Golos Text', Arial, sans-serif"
MONO = "font-family:'JetBrains Mono', monospace"

LANG = 'ru'
def T(ru, kz):
    return ru if LANG == 'ru' else kz
def e(s):
    return html.escape(s, quote=False)
def code(src, size=32, color='#F7F9FC'):
    return f'<p style="{MONO}; font-size:{size}px; color:{color}; line-height:1.5; white-space:nowrap">' + '<br>'.join(e(l).replace('  ', '&#160;&#160;') for l in src.split('\n')) + '</p>'
def codebox(src, size=32, width=None):
    w = f'width:{width}px; ' if width else 'flex:1; '
    return f'<div style="{w}display:flex; flex-direction:column; background:{DARK}; padding:28px 36px; border-radius:16px">{code(src, size)}</div>'
def card(title, body, color=BLUE, border=None):
    b = border or f'1px solid {LINE}'
    return (f'<div style="flex:1; display:flex; flex-direction:column; gap:14px; background:{CARD}; padding:32px; border:{b}; border-radius:20px">'
            f'<h3 style="font-size:36px; font-weight:600; color:{color}">{title}</h3>{body}</div>')
def p(text, size=32, color=None, extra=''):
    c = f' color:{color};' if color else ''
    return f'<p style="font-size:{size}px;{c}{extra}">{text}</p>'
def section(sid, inner, notes, dark=False, gap=40, pad='128px'):
    bg, fg = (DARK, BG) if dark else (BG, DARK)
    return (f'<section id="{sid}" data-transition="fade" style="background:{bg}; color:{fg}; {FONT}; padding:{pad}; display:flex; flex-direction:column; gap:{gap}px">\n'
            + inner + f'\n<aside>{e(notes)}</aside>\n</section>\n')
def h2(text, size=64):
    return f'<h2 style="font-size:{size}px; font-weight:800">{text}</h2>'
def out_line(label, text):
    return f'<p style="{MONO}; font-size:30px; white-space:nowrap"><span style="color:{GREEN}"><b>{label}</b></span> {e(text)}</p>'


def slides():
    S = []
    # 1. Обложка
    S.append(('cover', f'''<section id="cover" data-transition="fade" style="background:{DARK}; color:{BG}; {FONT}; padding:128px; display:flex; flex-direction:column; justify-content:center; gap:40px">
<p style="font-size:32px; color:#9DB8F2; letter-spacing:4px; text-transform:uppercase">{T('Информатика · 8 класс · цель 8.1.4.3', 'Информатика · 8 сынып · 8.1.4.3 мақсаты')}</p>
<h1 style="font-size:112px; font-weight:800; line-height:1.05; width:1600px">{T('Цикл for и цикл while', 'for циклі және while циклі')}</h1>
<p style="font-size:40px; color:#C9D5E6; width:1500px">{T('Используем операторы цикла <span style="color:#FFB36B">for</span> и <span style="color:#FFB36B">while</span> в Python', 'Python тілінде <span style="color:#FFB36B">for</span> және <span style="color:#FFB36B">while</span> цикл операторларын қолданамыз')}</p>
<aside>{e(T('Тема на два урока: урок 1 — теория с примерами и раздаточный лист; урок 2 — работа в веб-ресурсе (тест и задачи на код). Веб-ресурс и раздатка — на двух языках.', 'Тақырып екі сабаққа: 1-сабақ — мысалдармен теория және үлестірме парақ; 2-сабақ — веб-ресурста жұмыс (тест және код жазу есептері). Веб-ресурс пен үлестірме парақ екі тілде.'))}</aside>
</section>
'''))
    # 2. Зачем цикл
    S.append(('hook', f'''<section id="hook" data-transition="fade" style="background:{DARK}; color:{BG}; {FONT}; padding:128px; display:flex; gap:96px; align-items:center">
<div style="width:620px; display:flex; flex-direction:column; background:#1F2E52; padding:36px 44px; border-radius:16px">{code('print("Привет!")' if LANG == 'ru' else 'print("Сәлем!")', 34)}{code('print("Привет!")' if LANG == 'ru' else 'print("Сәлем!")', 34)}{code('print("Привет!")' if LANG == 'ru' else 'print("Сәлем!")', 34)}<p style="font-size:36px; color:#9AA7BD">…</p></div>
<div style="flex:1; display:flex; flex-direction:column; gap:40px">
<h2 style="font-size:72px; font-weight:800; line-height:1.1">{T('Как напечатать слово 100 раз?', 'Сөзді 100 рет қалай шығарамыз?')}</h2>
<p style="font-size:40px; color:#C9D5E6">{T('Сто одинаковых строк — долго и легко ошибиться. А если нужно 1000 раз?', 'Жүз бірдей жол — ұзақ әрі қателесу оңай. Ал 1000 рет керек болса ше?')}</p>
<p style="font-size:40px; color:#FFB36B">{T('Цикл повторяет команды за нас.', 'Цикл командаларды біз үшін қайталайды.')}</p>
</div>
<aside>{e(T('Дайте 1–2 минуты предложить решение. Подведите к понятию цикла.', 'Шешім ұсынуға 1–2 минут беріңіз. Цикл ұғымына жетелеңіз.'))}</aside>
</section>
'''))
    # 3. Цели
    S.append(('goals', section('goals', h2(T('Цель и критерии успеха', 'Мақсат және табыс критерийлері')) +
        p(T('<b>Цель 8.1.4.3:</b> использовать оператор цикла while, использовать оператор цикла for.', '<b>8.1.4.3 мақсаты:</b> while цикл операторын қолдану, for цикл операторын қолдану.'), 38, extra=' width:1600px') +
        f'<div style="display:flex; flex-direction:column; gap:22px; background:{CARD}; padding:40px; border:1px solid {LINE}; border-radius:20px">'
        + f'<h3 style="font-size:40px; font-weight:600; color:{BLUE}">{T("Я смогу:", "Мен:")}</h3>'
        + p(T('• записать цикл for с range() — с началом, концом и шагом', '• басы, соңы және қадамы бар range() арқылы for циклін жаза аламын'), 34)
        + p(T('• перебрать список: for x in a и for i in range(len(a))', '• тізімді іріктей аламын: for x in a және for i in range(len(a))'), 34)
        + p(T('• записать цикл while с условием и не допустить бесконечный цикл', '• шарты бар while циклін жазып, шексіз циклге жол бермей аламын'), 34)
        + p(T('• выбрать подходящий цикл и решить задачу', '• қолайлы циклді таңдап, есеп шығара аламын'), 34) + '</div>',
        T('Критерии совпадают с планом урока.', 'Критерийлер сабақ жоспарымен сәйкес.'))))
    # 4. Что такое цикл
    S.append(('loop', section('loop', h2(T('Что такое цикл', 'Цикл дегеніміз не')) +
        p(T('<b>Цикл</b> — команда, которая повторяет одни и те же действия несколько раз.', '<b>Цикл</b> — бірдей әрекеттерді бірнеше рет қайталайтын команда.'), 38, extra=' width:1600px') +
        '<div style="display:flex; gap:28px">' +
        card(T('Тело цикла', 'Цикл денесі'), p(T('Команды, которые повторяются. Пишутся <b>с отступом</b> — 4 пробела.', 'Қайталанатын командалар. <b>Шегініспен</b> жазылады — 4 бос орын.'), 30)) +
        card(T('Итерация', 'Итерация'), p(T('Одно выполнение тела цикла.', 'Цикл денесінің бір рет орындалуы.'), 30)) +
        card(T('Двоеточие', 'Қос нүкте'), p(T('Строка с <b>for</b> или <b>while</b> заканчивается знаком <b>:</b>', '<b>for</b> немесе <b>while</b> жазылған жол <b>:</b> белгісімен аяқталады'), 30)) +
        '</div>' + '<div style="display:flex; gap:28px; align-items:center">' + codebox(EX['hello3']['code'] if LANG == 'ru' else EX['hello3']['kz']['code'], 32, 760) +
        out_line(T('Вывод:', 'Шығыс:'), (EX['hello3']['output'] if LANG == 'ru' else EX['hello3']['kz']['output']).replace('\n', '  ')) + '</div>',
        T('Ученики уже знают отступ из темы «Ветвление»: тело цикла пишется так же.', 'Оқушылар шегіністі «Тармақталу» тақырыбынан біледі: цикл денесі де солай жазылады.'), gap=36)))
    # 5. range
    rows = EX['_ranges'][:6]
    tbl = (f'<table style="font-size:32px; color:{DARK}"><tr><th style="width:34%">{T("Запись", "Жазылуы")}</th><th style="width:46%">{T("Какие числа", "Қандай сандар")}</th><th style="width:20%">{T("Сколько раз", "Неше рет")}</th></tr>'
           + ''.join(f'<tr><td>{e(r[0])}</td><td>{e(r[1])}</td><td>{r[2]}</td></tr>' for r in rows) + '</table>')
    S.append(('range', section('range', h2(T('Функция range(начало, конец, шаг)', 'range(басы, соңы, қадамы) функциясы')) + tbl +
        p(T('<b>Главное правило:</b> конец <b>не входит</b>. Чтобы включить n, пишем range(1, n + 1).', '<b>Басты ереже:</b> соңғы мән <b>кірмейді</b>. n-ді қосу үшін range(1, n + 1) деп жазамыз.'), 34,
          extra=f' background:#FFF1E4; padding:20px 28px; border-radius:12px; border:2px solid {ORANGE}'),
        T('Все строки таблицы получены запуском Python. Спросите: что даст range(3, 8)? (3 4 5 6 7).', 'Кестенің барлық жолы Python-да іске қосылып алынған. Сұраңыз: range(3, 8) не береді? (3 4 5 6 7).'))))
    # 6. Формы for
    S.append(('forms', section('forms', h2(T('Три способа записи и обратный отсчёт', 'Жазудың үш тәсілі және кері санау')) +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px">' +
        card('range(5)', code(EX['r_stop']['code'], 28, DARK) + out_line('→', EX['r_stop']['output'].replace('\n', ' '))) +
        card('range(1, 6)', code(EX['r_start']['code'], 28, DARK) + out_line('→', EX['r_start']['output'].replace('\n', ' '))) +
        card('range(1, 10, 2)', code(EX['r_step']['code'], 28, DARK) + out_line('→', EX['r_step']['output'].replace('\n', ' '))) +
        card('range(10, 0, -3)', code(EX['r_back3']['code'], 28, DARK) + out_line('→', EX['r_back3']['output'].strip()), ORANGE_T, f'2px solid {ORANGE}') +
        '</div>' + p(T('Отрицательный шаг — числа уменьшаются, начало больше конца. range(5, 1) — пустой: цикл не выполнится ни разу.', 'Теріс қадам — сандар кемиді, басы соңынан үлкен. range(5, 1) — бос: цикл бір рет те орындалмайды.'), 32, MUTED),
        T('Выводы проверены запуском Python (tools/examples.json).', 'Шығыстар Python-да іске қосылып тексерілген (tools/examples.json).'))))
    # 7. for x in a / range(len)
    S.append(('lists', section('lists', h2(T('Перебор списка: значения или индексы', 'Тізімді іріктеу: мәндер немесе индекстер')) +
        '<div style="display:flex; gap:28px">' +
        card('for x in a', code(EX['for_list']['code'], 26, DARK) + out_line('→', EX['for_list']['output'].strip()) +
             p(T('x — сам элемент. Удобно для суммы, поиска, вывода.', 'x — элементтің өзі. Қосынды, іздеу, шығару үшін ыңғайлы.'), 28, MUTED)) +
        card('for i in range(len(a))', code(EX['change_list']['code'], 26, DARK) + out_line('→', EX['change_list']['output']) +
             p(T('i — индекс, элемент — a[i]. Нужно, чтобы <b>изменить</b> список.', 'i — индекс, элемент — a[i]. Тізімді <b>өзгерту</b> үшін керек.'), 28, MUTED)) +
        '</div>' + (f'<div style="display:flex; gap:28px; align-items:center; background:#FFF1E4; padding:18px 26px; border-radius:12px; border:2px solid {ORANGE}">'
          + p(T('<b>Ловушка:</b>', '<b>Тұзақ:</b>'), 32) + code('for x in a: x = x * 10', 30, DARK)
          + p(T('— список <b>не меняется</b>: ', '— тізім <b>өзгермейді</b>: ') + e(EX['change_wrong']['output']), 32) + '</div>'),
        T('Покажите оба примера в редакторе. Вывод проверен запуском Python.', 'Екі мысалды да редакторда көрсетіңіз. Шығыс Python-да тексерілген.'))))
    # 8. Накопители
    S.append(('acc', section('acc', h2(T('Накопители: сумма, произведение, счётчик', 'Жинақтауыштар: қосынды, көбейтінді, санауыш')) +
        '<div style="display:flex; gap:28px">' +
        card(T('Сумма', 'Қосынды'), code(EX['sum']['code'], 26, DARK) + out_line('→', EX['sum']['output'])) +
        card(T('Произведение', 'Көбейтінді'), code(EX['prod']['code'], 26, DARK) + out_line('→', EX['prod']['output'])) +
        card(T('Счётчик', 'Санауыш'), code(EX['count']['code'], 26, DARK) + out_line('→', EX['count']['output'])) +
        '</div>' + p(T('Накопитель создаём <b>до</b> цикла: сумму и счётчик — с 0, произведение — с <b>1</b>.', 'Жинақтауышты цикл <b>алдында</b> жасаймыз: қосынды мен санауыш — 0-ден, көбейтінді — <b>1</b>-ден.'), 32),
        T('Спросите: почему произведение начинают с 1? (с 0 всё время будет 0).', 'Сұраңыз: неліктен көбейтіндіні 1-ден бастаймыз? (0-ден бастасақ, әрдайым 0 болады).'))))
    # 9. while
    wc = EX['w_count']['code']
    S.append(('while', section('while', h2(T('Цикл while: три шага', 'while циклі: үш қадам')) +
        '<div style="display:flex; gap:56px; align-items:start">' + codebox(wc, 36, 640) +
        '<div style="flex:1; display:flex; flex-direction:column; gap:22px">' +
        p(T('<b>1.</b> Начальное значение <b>до</b> цикла: i = 1', '<b>1.</b> Цикл <b>алдында</b> бастапқы мән: i = 1'), 34) +
        p(T('<b>2.</b> Условие продолжения: while i &lt;= 5', '<b>2.</b> Жалғасу шарты: while i &lt;= 5'), 34) +
        p(T('<b>3.</b> Изменение переменной в теле: i = i + 1', '<b>3.</b> Цикл денесінде айнымалыны өзгерту: i = i + 1'), 34) +
        out_line(T('Вывод:', 'Шығыс:'), EX['w_count']['output'].replace('\n', ' ')) + '</div></div>' +
        p(T('while = «пока». Тело повторяется, <b>пока условие истинно</b>; условие проверяется перед каждой итерацией.', 'while = «...-ша/-ше». Цикл денесі <b>шарт ақиқат болғанша</b> қайталанады; шарт әр итерация алдында тексеріледі.'), 32, MUTED),
        T('Этот цикл делает то же, что for i in range(1, 6).', 'Бұл цикл for i in range(1, 6) сияқты жұмыс істейді.'))))
    # 10. while — число повторений неизвестно (трассировка цифр)
    tr = EX['_trace_digits']
    hdr = [T('Шаг', 'Қадам'), 'n', T('Проверка', 'Тексеру'), 'n % 10', 's', T('новое n', 'жаңа n')]
    def cellv(v):
        return T(v, 'цикл аяқталды') if v == 'цикл закончен' else v
    trt = (f'<table style="font-size:28px; color:{DARK}"><tr>' + ''.join(f'<th>{e(h)}</th>' for h in hdr) + '</tr>' +
           ''.join('<tr>' + ''.join(f'<td>{e(cellv(c))}</td>' for c in r) + '</tr>' for r in tr) + '</table>')
    S.append(('digits', section('digits', h2(T('while: число повторений заранее неизвестно', 'while: қайталану саны алдын ала белгісіз')) +
        '<div style="display:flex; gap:40px; align-items:start">' + codebox(EX['w_digits']['code'], 30, 600) + f'<div style="flex:1">{trt}</div></div>' +
        p(T('Сумма цифр числа 2026 = <b>' + EX['w_digits']['output'] + '</b>. n % 10 — последняя цифра, n // 10 — число без неё.', '2026 санының цифрларының қосындысы = <b>' + EX['w_digits']['output'] + '</b>. n % 10 — соңғы цифр, n // 10 — онсыз сан.'), 32),
        T('Протрассируйте вместе с классом. Таблица получена запуском Python.', 'Сыныппен бірге трассировка жасаңыз. Кесте Python-да іске қосылып алынған.'), gap=32)))
    # 11. Бесконечный цикл, break
    S.append(('inf', section('inf', h2(T('Бесконечный цикл и break', 'Шексіз цикл және break')) +
        '<div style="display:flex; gap:28px">' +
        card(T('Ошибка', 'Қате'), code('i = 1\nwhile i <= 5:\n    print(i)', 28, DARK) + p(T('i не меняется → условие всегда истинно → программа не остановится.', 'i өзгермейді → шарт әрқашан ақиқат → бағдарлама тоқтамайды.'), 28, '#A52222'), '#A52222', '2px solid #C62828') +
        card(T('Исправлено', 'Түзетілген'), code(EX['w_count']['code'], 28, DARK) + p(T('В теле меняем переменную из условия.', 'Цикл денесінде шарттағы айнымалыны өзгертеміз.'), 28, GREEN), GREEN, f'2px solid {GREEN}') +
        card('break', code(EX['w_break']['code'], 26, DARK) + out_line('→', EX['w_break']['output']) + p(T('break — сразу выйти из цикла.', 'break — циклден бірден шығу.'), 28, MUTED)) +
        '</div>',
        T('Остановить зависшую программу: Ctrl + C или кнопка «Стоп». В веб-ресурсе бесконечный цикл останавливается сам через 1 секунду.', 'Қатып қалған бағдарламаны тоқтату: Ctrl + C немесе «Тоқтату» батырмасы. Веб-ресурста шексіз цикл 1 секундтан кейін өзі тоқтайды.'))))
    # 12. for или while
    S.append(('choose', section('choose', h2(T('for или while?', 'for па, while ма?')) +
        '<div style="display:flex; gap:32px">' +
        card('for', p(T('Число повторений <b>известно</b> заранее или перебираем список.', 'Қайталану саны алдын ала <b>белгілі</b> немесе тізімді іріктейміз.'), 32) + p(T('Числа от 1 до n, сумма n чисел, таблица умножения.', '1-ден n-ге дейінгі сандар, n санның қосындысы, көбейту кестесі.'), 28, MUTED), BLUE, f'2px solid {BLUE}') +
        card('while', p(T('Повторяем, <b>пока</b> выполняется условие; число повторений неизвестно.', 'Шарт орындалғанша <b>қайталаймыз</b>; қайталану саны белгісіз.'), 32) + p(T('Цифры числа, ввод до нуля, «пока сумма меньше 100».', 'Санның цифрлары, нөлге дейін енгізу, «қосынды 100-ден кіші болғанша».'), 28, MUTED), ORANGE_T, f'2px solid {ORANGE}') +
        '</div>' + p(T('Любой for с range можно переписать через while — результат одинаковый. В задачах веб-ресурса засчитывается любой цикл.', 'range бар кез келген for циклін while арқылы жазуға болады — нәтижесі бірдей. Веб-ресурс есептерінде кез келген цикл есептеледі.'), 32),
        T('В разборе веб-ресурса к каждой задаче показаны два образца: через for и через while.', 'Веб-ресурс талдауында әр есепке екі үлгі көрсетіледі: for арқылы және while арқылы.'))))
    # 13. Что выведет программа (проверено check-slides.py)
    P1 = 's = 0\nfor i in range(1, 10, 3):\n    s = s + i\nprint(s)'
    P2 = 'k = 0\nn = 5047\nwhile n > 0:\n    k = k + 1\n    n = n // 10\nprint(k)'
    S.append(('trace', f'''<section id="trace" data-transition="fade" style="background:{DARK}; color:{BG}; {FONT}; padding:128px; display:flex; flex-direction:column; gap:44px">
{h2(T('Что выведет программа?', 'Бағдарлама не шығарады?'))}
<div style="display:flex; gap:32px">
<div style="flex:1; display:flex; flex-direction:column; gap:16px; background:#1F2E52; padding:40px; border-radius:20px"><h3 style="font-size:36px; font-weight:600; color:#9DB8F2">{T('Программа 1', '1-бағдарлама')}</h3>{code(P1, 34)}</div>
<div style="flex:1; display:flex; flex-direction:column; gap:16px; background:#1F2E52; padding:40px; border-radius:20px"><h3 style="font-size:36px; font-weight:600; color:#9DB8F2">{T('Программа 2', '2-бағдарлама')}</h3>{code(P2, 34)}</div>
</div>
<p style="font-size:34px; color:#C9D5E6">{T('Запишите ответ в тетрадь, затем проверим запуском.', 'Жауапты дәптерге жазыңыз, содан кейін іске қосып тексереміз.')}</p>
<aside>{e(T('Ответы: программа 1 — 12 (1 + 4 + 7), программа 2 — 4 (в числе 5047 четыре цифры). Проверено запуском Python.', 'Жауаптар: 1-бағдарлама — 12 (1 + 4 + 7), 2-бағдарлама — 4 (5047 санында төрт цифр). Python-да іске қосылып тексерілген.'))}</aside>
</section>
'''))
    # 14. Частые ошибки
    def errc(title, note, bad, good):
        return card(title, p(note, 28) + '<div style="display:flex; gap:20px">'
            + f'<div style="flex:1; background:#FDECEC; padding:14px 20px; border-radius:10px"><p style="font-size:24px; color:#A52222; font-weight:600">{T("Неверно", "Қате")}</p>{code(bad, 24, DARK)}</div>'
            + f'<div style="flex:1; background:#E6F4EC; padding:14px 20px; border-radius:10px"><p style="font-size:24px; color:{GREEN}; font-weight:600">{T("Верно", "Дұрыс")}</p>{code(good, 24, DARK)}</div></div>', '#A52222')
    S.append(('errors', section('errors', h2(T('Частые ошибки', 'Жиі кездесетін қателер')) +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px">' +
        errc(T('1. Конец range не входит', '1. range соңы кірмейді'), T('Числа от 1 до n:', '1-ден n-ге дейінгі сандар:'), 'range(1, n)', 'range(1, n + 1)') +
        errc(T('2. Накопитель внутри цикла', '2. Жинақтауыш цикл ішінде'), T('s = 0 — до цикла, иначе сумма обнуляется:', 's = 0 — цикл алдында, әйтпесе қосынды нөлденеді:'), 'for i in a:\n    s = 0\n    s = s + i', 's = 0\nfor i in a:\n    s = s + i') +
        errc(T('3. Лишний отступ у print', '3. print-тегі артық шегініс'), T('Печатаем один раз — после цикла:', 'Бір рет — циклден кейін шығарамыз:'), 'for i in a:\n    s = s + i\n    print(s)', 'for i in a:\n    s = s + i\nprint(s)') +
        errc(T('4. Переменная while не меняется', '4. while айнымалысы өзгермейді'), T('Без i = i + 1 цикл бесконечный:', 'i = i + 1 болмаса, цикл шексіз:'), 'while i <= 5:\n    print(i)', 'while i <= 5:\n    print(i)\n    i = i + 1') +
        '</div>',
        T('Покажите ошибку 3 на примере суммы 1..5: с отступом выведется 1, 3, 6, 10, 15, без отступа — только 15.', '3-қатені 1..5 қосындысы мысалында көрсетіңіз: шегініспен 1, 3, 6, 10, 15 шығады, шегініссіз — тек 15.'), gap=32)))
    # 15. Веб-ресурс
    S.append(('web', section('web', h2(T('Урок 2: работа в веб-ресурсе', '2-сабақ: веб-ресурста жұмыс')) +
        '<div style="display:flex; gap:24px">' +
        card(T('1. Теория', '1. Теория'), p(T('Можно перечитать перед работой. Кнопка <b>ҚАЗ / РУС</b> — язык в любой момент.', 'Жұмыс алдында қайта оқуға болады. <b>ҚАЗ / РУС</b> батырмасы — тілді кез келген уақытта ауыстыру.'), 28)) +
        card(T('2. Тест', '2. Тест'), p(T('10 вопросов (A–D, сопоставление). Результат сразу. Низкий балл — перечитать теорию и пересдать; засчитывается лучшая из 3 попыток.', '10 сұрақ (A–D, сәйкестендіру). Нәтиже бірден. Балл төмен болса — теорияны қайта оқып, қайта тапсыру; 3 әрекеттің ең жақсысы есептеледі.'), 28)) +
        card(T('3. Задачи', '3. Есептер'), p(T('10 задач A, B, C. Пишем код (for или while). «Проверить» — 8 тестов; все пройдены — 1 балл.', 'A, B, C деңгейіндегі 10 есеп. Код жазамыз (for немесе while). «Тексеру» — 8 тест; бәрінен өтсе — 1 балл.'), 28)) +
        '</div>' + p(T('<b>Нельзя</b> выходить из полноэкранного режима, переключать окна и закрывать страницу — работа сразу завершится.', 'Толық экран режимінен шығуға, терезені ауыстыруға және бетті жабуға <b>болмайды</b> — жұмыс бірден аяқталады.'), 32,
          extra=' background:#FDECEC; padding:20px 28px; border-radius:12px; border:2px solid #C62828; color:#A52222'),
        T('Файл cikly-8.1.4.3.html работает без интернета. Максимум 20 баллов: тест 10 + задачи 10. Новая работа на компьютере — по паролю учителя 2026.', 'cikly-8.1.4.3.html файлы интернетсіз жұмыс істейді. Ең жоғары балл 20: тест 10 + есептер 10. Компьютерде жаңа жұмыс — мұғалімнің 2026 құпиясөзімен.'))))
    # 16. Рефлексия
    S.append(('reflect', section('reflect', h2(T('Рефлексия «3 – 2 – 1»', '«3 – 2 – 1» рефлексиясы')) +
        '<div style="display:flex; gap:32px">' +
        card('3', p(T('новых понятия (цикл, итерация, накопитель…)', 'жаңа ұғым (цикл, итерация, жинақтауыш…)'), 32)) +
        card('2', p(T('вида цикла и когда какой выбрать', 'цикл түрі және қайсысын қашан таңдау керек'), 32)) +
        card('1', p(T('вопрос, который у меня остался', 'менде қалған сұрақ'), 32), ORANGE_T) + '</div>' +
        f'<div style="display:flex; flex-direction:column; gap:12px; background:#E7EEFB; padding:30px 40px; border:2px solid {BLUE}; border-radius:20px">'
        + f'<h3 style="font-size:38px; font-weight:600">{T("Домашнее задание", "Үй тапсырмасы")}</h3>'
        + p(T('Раздаточный лист: задания, которые не успели; выучить шпаргалку по range и while.', 'Үлестірме парақ: үлгермеген тапсырмалар; range мен while жадынамасын жаттау.'), 32) + '</div>',
        T('После урока 2 — разбор частых ошибок по результатам веб-ресурса.', '2-сабақтан кейін — веб-ресурс нәтижелері бойынша жиі қателерді талдау.'))))
    return S


def build(lang):
    global LANG
    LANG = lang
    S = slides()
    out = ROOT / 'slides' / lang / 'project'
    (out / 'slides').mkdir(parents=True, exist_ok=True)
    for sid, htmltext in S:
        (out / 'slides' / f'{sid}.html').write_text(htmltext, encoding='utf-8')
    deck = {'v': 4, 'createdOnFiles': {'v': 1, 'at': '2026-10-05T09:00:00Z'}, 'lists': 'css',
            'title': T('Цикл for и цикл while — 8 класс', 'for циклі және while циклі — 8 сынып'),
            'order': [s[0] for s in S],
            'sections': {
                's1': {'description': T('Зачем нужен цикл, цель урока', 'Цикл не үшін керек, сабақтың мақсаты'), 'start': 'cover'},
                's2': {'description': T('Цикл for, range и перебор списка', 'for циклі, range және тізімді іріктеу'), 'start': 'loop'},
                's3': {'description': T('Цикл while, бесконечный цикл, выбор цикла', 'while циклі, шексіз цикл, циклді таңдау'), 'start': 'while'},
                's4': {'description': T('Закрепление, веб-ресурс и рефлексия', 'Бекіту, веб-ресурс және рефлексия'), 'start': 'trace'}},
            'faces': {'golos-text': {'family': 'Golos Text', 'href': 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;600;800&display=swap'},
                      'jetbrains-mono': {'family': 'JetBrains Mono', 'href': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap'}},
            'designSystems': []}
    (out / 'deck.json').write_text(json.dumps(deck, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(lang, len(S), 'слайдов →', out.relative_to(ROOT))


build('ru')
build('kz')
