#!/usr/bin/env python3
"""Үлестірме парақтың соңына жеке бетте жауаптар қосады (мұғалімге).
Лист с ответами в конце (для учителя): zadachi-acmp-8.1.4.4.docx → zadachi-acmp-8.1.4.4-s-otvetami.docx,
kz/esepter-acmp-8.1.4.4-kz.docx → kz/esepter-acmp-8.1.4.4-kz-zhauaptary.docx.
Программы — tools/teacher/sol/NN.py (проверены: python3 tools/teacher/run-solutions.py)."""
import pathlib, re, zipfile
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOL = ROOT / 'tools' / 'teacher' / 'sol'

RU = {
    'src': ROOT / 'zadachi-acmp-8.1.4.4.docx', 'dst': ROOT / 'zadachi-acmp-8.1.4.4-s-otvetami.docx',
    'title': 'Ответы (для учителя)',
    'note': 'Все программы проверены: запущены на примерах листа и на случайных тестах, ответы совпали. Другие верные решения тоже засчитываются.',
    'task': 'Задача', 'idea': 'Идея:',
    'comment': {},
    'tasks': [
        ('Сумма', 'цикл for и накопитель s. Если N меньше 1, складываем числа от N до 1.'),
        ('Факториал', 'произведение начинаем с 1 и умножаем на 1, 2, …, N. Для N = 0 цикл не выполняется — ответ 1.'),
        ('Список квадратов', 'цикл while: пока i·i ≤ N, выводим i·i и увеличиваем i.'),
        ('Список степеней двойки', 'цикл while: начинаем с 1 и умножаем на 2, пока число ≤ N.'),
        ('Минимальный делитель', 'цикл while перебирает делители d = 2, 3, … до первого, на который N делится без остатка.'),
        ('Арбузы', 'наименьший и наибольший элементы списка: сравниваем каждое число с текущими mn и mx.'),
        ('Загадка', 'перебираем X от 1 до S − 1; Y = S − X; ищем пару, где X · Y = P и X ≤ Y.'),
        ('Нули', 'счётчик cur увеличиваем на каждом нуле и обнуляем на единице; best — наибольшее значение cur.'),
        ('Домашнее задание', 'сумма положительных; позиции минимума и максимума; произведение чисел строго между ними.'),
        ('Гипотеза Гольдбаха', 'перебираем a от 2; вложенными циклами проверяем, что a и N − a простые; первая пара — ответ.'),
    ],
}
KZ = {
    'src': ROOT / 'kz' / 'esepter-acmp-8.1.4.4-kz.docx', 'dst': ROOT / 'kz' / 'esepter-acmp-8.1.4.4-kz-zhauaptary.docx',
    'title': 'Жауаптар (мұғалімге)',
    'note': 'Барлық бағдарлама тексерілді: парақтағы мысалдарда және кездейсоқ тестілерде іске қосылып, жауаптар сәйкес келді. Басқа дұрыс шешімдер де есептеледі.',
    'task': 'есеп', 'idea': 'Идеясы:',
    'comment': {'# N может быть меньше 1': '# N 1-ден кіші болуы мүмкін'},
    'tasks': [
        ('Қосынды', 'for циклі және s жинақтауышы. Егер N 1-ден кіші болса, N-нен 1-ге дейінгі сандарды қосамыз.'),
        ('Факториал', 'көбейтіндіні 1-ден бастап, 1, 2, …, N сандарына көбейтеміз. N = 0 болса, цикл орындалмайды — жауабы 1.'),
        ('Квадраттар тізімі', 'while циклі: i·i ≤ N болғанша i·i шығарып, i-ді арттырамыз.'),
        ('Екінің дәрежелерінің тізімі', 'while циклі: 1-ден бастап, сан ≤ N болғанша 2-ге көбейтеміз.'),
        ('Ең кіші бөлгіш', 'while циклі d = 2, 3, … бөлгіштерін N қалдықсыз бөлінетін біріншісіне дейін іріктейді.'),
        ('Қарбыздар', 'тізімнің ең кіші және ең үлкен элементтері: әр санды ағымдағы mn және mx мәндерімен салыстырамыз.'),
        ('Жұмбақ', 'X-ті 1-ден S − 1-ге дейін іріктейміз; Y = S − X; X · Y = P және X ≤ Y болатын жұпты іздейміз.'),
        ('Нөлдер', 'cur санауышын әр нөлде арттырып, бірде нөлге түсіреміз; best — cur-дың ең үлкен мәні.'),
        ('Үй тапсырмасы', 'оң сандардың қосындысы; ең кіші және ең үлкен элементтердің орны; олардың арасындағы сандардың көбейтіндісі.'),
        ('Гольдбах гипотезасы', 'a-ны 2-ден бастап іріктейміз; кірістірілген циклдермен a мен N − a жай сан екенін тексереміз; бірінші жұп — жауап.'),
    ],
}

RPR = '<w:rPr><w:rFonts w:ascii="{f}" w:hAnsi="{f}" w:cs="{f}"/>{b}{i}<w:sz w:val="{s}"/><w:szCs w:val="{s}"/></w:rPr>'


def run(text, font='Times New Roman', size=22, bold=False, italic=False):
    rpr = RPR.format(f=font, s=size, b='<w:b/><w:bCs/>' if bold else '', i='<w:i/><w:iCs/>' if italic else '')
    return f'<w:r>{rpr}<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'


def par(runs, before=0, after=60, keep=False, page_break=False, center=False):
    ppr = '<w:pPr>' + ('<w:pageBreakBefore/>' if page_break else '') + ('<w:keepNext/>' if keep else '') + \
          f'<w:spacing w:before="{before}" w:after="{after}"/>' + ('<w:jc w:val="center"/>' if center else '') + '</w:pPr>'
    return f'<w:p>{ppr}{"".join(runs)}</w:p>'


def build(L, kz):
    out = [par([run(L['title'], size=30, bold=True)], after=60, page_break=True, center=True),
           par([run(L['note'], size=20, italic=True)], after=160, center=True)]
    for n, (title, idea) in enumerate(L['tasks'], 1):
        head = f'{n}-{L["task"]}. {title}' if kz else f'{L["task"]} {n}. {title}'
        out.append(par([run(head, size=24, bold=True)], before=160, after=40, keep=True))
        out.append(par([run(L['idea'] + ' ', size=22, bold=True), run(idea, size=22)], after=40, keep=True))
        code = (SOL / f'{n:02}.py').read_text(encoding='utf-8').rstrip('\n')
        for k, v in L['comment'].items():
            code = code.replace(k, v)
        lines = code.split('\n')
        for j, line in enumerate(lines):
            out.append(par([run(line or ' ', font='Courier New', size=20)], after=0, keep=j < len(lines) - 1))
    z = zipfile.ZipFile(L['src'])
    x = z.read('word/document.xml').decode('utf-8')
    i = x.rindex('<w:sectPr')
    x = x[:i] + ''.join(out) + x[i:]
    zo = zipfile.ZipFile(L['dst'], 'w', zipfile.ZIP_DEFLATED)
    for info in z.infolist():
        zo.writestr(info, x.encode('utf-8') if info.filename == 'word/document.xml' else z.read(info.filename))
    zo.close()
    print(L['dst'].relative_to(ROOT), 'готов / дайын')


build(RU, False)
build(KZ, True)
