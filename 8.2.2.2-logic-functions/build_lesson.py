import sys, math
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, Protection
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.hyperlink import Hyperlink

OUT = sys.argv[1]
SOLVED = len(sys.argv) > 2 and sys.argv[2] == 'solved'
PWD = '8222'
FN = 'Arial'
C = dict(navy='1F4E79', blue='2E75B6', light='DDEBF7', yellow='FFF2A8', green='E2EFDA', orange='FCE4D6',
         grey='F2F2F2', white='FFFFFF', purple='E4DFEC', red='F8CBAD', dgreen='C6EFCE', ok='006100', bad='9C0006')
thin = Side(style='thin', color='A6A6A6')
BRD = Border(left=thin, right=thin, top=thin, bottom=thin)
fill = lambda c: PatternFill('solid', fgColor=c)

BOOLFMT = '"ИСТИНА";"ИСТИНА";"ЛОЖЬ"'
def W(ws, ref, val=None, bold=False, size=10, color='000000', bg=None, h='left', v='center', wrap=True,
      italic=False, font=FN, border=False, text=False, unlock=False, merge=None, numfmt=None):
    c = ws[ref]
    if val is not None:
        c.value = val
        if text and isinstance(val, str) and val.startswith('='):
            c.data_type = 's'; c.quotePrefix = True
    cells = [c] if not merge else [x for row in ws[f'{ref}:{merge}'] for x in row]
    for x in cells:
        x.font = Font(name=font, size=size, bold=bold, color=color, italic=italic)
        if bg: x.fill = fill(bg)
        x.alignment = Alignment(horizontal=h, vertical=v, wrap_text=wrap)
        if border: x.border = BRD
        if unlock: x.protection = Protection(locked=False)
    if numfmt: c.number_format = numfmt
    if merge: ws.merge_cells(f'{ref}:{merge}')
    return c

def H(ws, r, text, chars, base=15, mn=1):
    lines = max(mn, sum(max(1, math.ceil(len(p) / chars)) for p in str(text).split('\n')))
    ws.row_dimensions[r].height = max(ws.row_dimensions[r].height or 0, lines * base)

def code(ws, ref, txt, merge=None, bg=C['grey'], size=10):
    return W(ws, ref, txt, font='Consolas', size=size, bg=bg, border=True, text=True, merge=merge, color='1F1F1F')

def link(ws, ref, text, target):
    c = W(ws, ref, text, bold=True, color=C['white'], bg=C['blue'], h='center', border=True)
    c.hyperlink = Hyperlink(ref=ref, location=target, display=text)


from openpyxl.worksheet.datavalidation import DataValidation
SELF = {}
SELF_OPTS = ['3 – понял(а) полностью: могу объяснить другу', '2 – понял(а) с подсказками или с ошибками', '1 – пока не понял(а): нужна помощь']
def selfcheck(s, r, last):
    W(s, f'A{r}', '🪞 Самооценка: насколько я понял(а) эту часть урока?', bold=True, color=C['white'], bg='7030A0', merge=f'{last}{r}')
    s.row_dimensions[r].height = 22
    W(s, f'A{r+1}', 'Выбери 3, 2 или 1 ▶', bold=True, h='right', merge=f'B{r+1}')
    W(s, f'C{r+1}', None, bg=C['purple'], border=True, unlock=True, h='center', size=16, bold=True)
    s.row_dimensions[r+1].height = 28
    dv = DataValidation(type='list', formula1='"3,2,1"', allow_blank=True)
    dv.prompt = '3 – понял(а) полностью, 2 – с подсказками, 1 – пока не понял(а)'; dv.promptTitle = 'Самооценка'
    dv.error = 'Выбери из списка: 3, 2 или 1'; dv.errorTitle = 'Самооценка'
    s.add_data_validation(dv); dv.add(f'C{r+1}')
    W(s, f'A{r+2}', '3 – понял(а) полностью, могу объяснить другу   ·   2 – понял(а), но были подсказки или ошибки   ·   1 – пока не понял(а), нужна помощь',
      italic=True, size=9, bg=C['purple'], merge=f'{last}{r+2}')
    s.row_dimensions[r+2].height = 30
    SELF[s.title] = f"'{s.title}'!$C${r+1}"
    if SOLVED: s[f'C{r+1}'].value = 3
    return r + 4
wb = Workbook()
th = wb.active; th.title = 'Теория'
SHEETS = ['1_Разминка', '2_ЕСЛИ', '3_И_ИЛИ_НЕ', '4_ЕСЛИ+И_ИЛИ_НЕ', '5_★Вложенные', '6_Тест']
NAV = [('📖 Теория', "'Теория'!A1")] + [(s.replace('_', ' ', 1), f"'{s}'!A1") for s in SHEETS] + [('🏆 Итог', "'Итог'!A1")]

# =====================================================================  THEORY
ws = th
for col, w in zip('ABCDEFGHI', [2, 16, 13, 13, 24, 24, 16, 26, 26]):
    ws.column_dimensions[col].width = w
ws.sheet_view.showGridLines = False
W(ws, 'B1', 'ЛОГИЧЕСКИЕ ФУНКЦИИ В ЭЛЕКТРОННЫХ ТАБЛИЦАХ', bold=True, size=20, color=C['white'], bg=C['navy'], h='center', merge='I1')
ws.row_dimensions[1].height = 40
W(ws, 'B2', 'ЕСЛИ · И · ИЛИ · НЕ   |   Информатика, 8 класс   |   ЦО 8.2.2.2 – использовать функции обработки логических операций (ЕСЛИ(), И(), ИЛИ(), НЕ()) в электронных таблицах',
  size=10, color=C['white'], bg=C['blue'], h='center', merge='I2', italic=True)
ws.row_dimensions[2].height = 22
# navigation
r = 4
W(ws, f'B{r}', 'Перейти:', bold=True, h='right')
cols = 'CDEFGHI'
for i, (t, tg) in enumerate(NAV[1:]):
    link(ws, f'{cols[i]}{r}', t, tg)
ws.row_dimensions[r].height = 22
r = 6
W(ws, f'B{r}', 'Фамилия, имя:', bold=True, h='right')
W(ws, f'C{r}', None, bg=C['yellow'], border=True, unlock=True, merge=f'E{r}')
W(ws, f'F{r}', 'Класс:', bold=True, h='right')
W(ws, f'G{r}', None, bg=C['yellow'], border=True, unlock=True)
ws.row_dimensions[r].height = 22
NAME = "'Теория'!$C$6"; CLASS = "'Теория'!$G$6"
r = 8
W(ws, f'B{r}', '💡 Как работать с этой страницей: все примеры ЖИВЫЕ. Меняй числа и слова в жёлтых ячейках – Excel сразу пересчитает результат в зелёной ячейке. '
  'Попробуй «сломать» каждый пример: найди значение, при котором ответ поменяется!', bg=C['light'], merge=f'I{r}', size=10)
H(ws, r, ws[f'B{r}'].value, 150)

def section(r, num, title):
    W(ws, f'B{r}', f'{num}. {title}', bold=True, size=14, color=C['white'], bg=C['blue'], merge=f'I{r}')
    ws.row_dimensions[r].height = 26
    return r + 1

def para(r, txt, bg=None, bold=False, italic=False, size=10):
    W(ws, f'B{r}', txt, bg=bg, merge=f'I{r}', bold=bold, italic=italic, size=size)
    H(ws, r, txt, 150)
    return r + 1

def ex_header(r):
    for ref, t, m in [('B', '№', None), ('C', 'Ячейка 1', None), ('D', 'Ячейка 2', None), ('E', 'Формула', 'F'),
                      ('G', 'Результат', None), ('H', 'Почему так?', 'I')]:
        W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}' if m else None)
    return r + 1

def example(r, n, x, y, ru, en, why):
    W(ws, f'B{r}', n, h='center', border=True, bold=True)
    X, Y = f'C{r}', f'D{r}'
    W(ws, X, x, bg=C['yellow'], border=True, h='center', unlock=True)
    W(ws, Y, y, bg=C['yellow'] if y is not None else C['grey'], border=True, h='center', unlock=y is not None)
    code(ws, f'E{r}', ru.format(x=X, y=Y), merge=f'F{r}')
    W(ws, f'G{r}', en.format(x=X, y=Y), bg=C['green'], border=True, h='center', bold=True)
    if 'IF(' not in en: ws[f'G{r}'].number_format = BOOLFMT
    W(ws, f'H{r}', why, border=True, merge=f'I{r}', size=9)
    ws.row_dimensions[r].height = max(30, 13 * math.ceil(len(why) / 52) + 4, 13 * math.ceil(len(ru) / 44) + 4)
    return r + 1

def callout(r, txt, kind='info'):
    bg = {'info': C['light'], 'warn': C['orange'], 'key': C['green']}[kind]
    return para(r, txt, bg=bg)

# ---- 1. comparisons
r = 10
r = section(r, 1, 'Логическое выражение: вопрос, на который ответ ДА или НЕТ')
r = para(r, 'Excel умеет сравнивать значения. Результат сравнения – не число и не текст, а логическое значение: ИСТИНА (условие выполнено) или ЛОЖЬ (не выполнено). '
            'Именно такие выражения – «условия» – стоят внутри функций ЕСЛИ, И, ИЛИ, НЕ.')
for i, (op, mean) in enumerate([('=', 'равно'), ('<>', 'не равно'), ('>', 'больше'), ('<', 'меньше'), ('>=', 'больше или равно (≥)'), ('<=', 'меньше или равно (≤)')]):
    pass
W(ws, f'B{r}', 'Оператор', bold=True, bg=C['navy'], color=C['white'], h='center', border=True)
W(ws, f'C{r}', 'Значение', bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'D{r}')
W(ws, f'E{r}', 'Как в математике', bold=True, bg=C['navy'], color=C['white'], h='center', border=True)
r += 1
for op, mean, m in [('=', 'равно', '='), ('<>', 'не равно', '≠'), ('>', 'больше', '>'), ('<', 'меньше', '<'),
                    ('>=', 'больше или равно', '≥'), ('<=', 'меньше или равно', '≤')]:
    code(ws, f'B{r}', op, size=12).alignment = Alignment(horizontal='center')
    W(ws, f'C{r}', mean, border=True, merge=f'D{r}')
    W(ws, f'E{r}', m, border=True, h='center', size=12)
    r += 1
r += 1
r = para(r, 'Примеры (измени жёлтые ячейки):', bold=True)
r = ex_header(r)
r = example(r, 1, 15, None, '={x}>10', '={x}>10', '15 больше 10 – условие верно → ИСТИНА. Впиши 5 – получишь ЛОЖЬ.')
r = example(r, 2, 15, None, '={x}<>15', '={x}<>15', '15 «не равно» 15? Нет, они равны → ЛОЖЬ.')
r = example(r, 3, 18, None, '={x}>=18', '={x}>=18', 'Совершеннолетний? 18 ≥ 18 – верно! Знак >= включает саму границу. Сравни с примером 4.')
r = example(r, 4, 18, None, '={x}>18', '={x}>18', '18 > 18 – неверно → ЛОЖЬ. Граница НЕ входит. Это частая ловушка!')
r = example(r, 5, 12, 8, '={x}+{y}=20', '={x}+{y}=20', 'Сначала считается 12 + 8 = 20, потом сравнение 20 = 20 → ИСТИНА.')
r = example(r, 6, 'Астана', None, '={x}="астана"', '={x}="астана"', 'Текст пишут в кавычках. Большие и маленькие буквы Excel не различает → ИСТИНА.')
r += 1

# ---- 2. IF
r = section(r, 2, 'Функция ЕСЛИ – Excel принимает решение')
r = para(r, 'ЕСЛИ проверяет условие и выдаёт ОДНО из двух значений: первое – если условие верно, второе – если неверно. Как в жизни: «ЕСЛИ идёт дождь, ТО беру зонт, ИНАЧЕ – кепку».')
code(ws, f'B{r}', '=ЕСЛИ( лог_выражение ; значение_если_истина ; значение_если_ложь )', merge=f'I{r}', size=13, bg=C['purple'])
ws[f'B{r}'].alignment = Alignment(horizontal='center', vertical='center'); ws.row_dimensions[r].height = 28
r += 2
# flowchart
W(ws, f'D{r}', '❓ лог_выражение: условие выполняется?', bold=True, bg=C['purple'], h='center', border=True, merge=f'F{r}')
ws.row_dimensions[r].height = 26; r += 1
W(ws, f'D{r}', '↙ ДА (ИСТИНА)', bold=True, color=C['ok'], h='center')
W(ws, f'F{r}', 'НЕТ (ЛОЖЬ) ↘', bold=True, color=C['bad'], h='center'); r += 1
W(ws, f'C{r}', '✅ значение_если_истина', bold=True, bg=C['dgreen'], h='center', border=True, merge=f'D{r}')
W(ws, f'F{r}', '❌ значение_если_ложь', bold=True, bg=C['red'], h='center', border=True, merge=f'G{r}')
ws.row_dimensions[r].height = 24; r += 2
for ref, t, m in [('B', 'Аргумент', 'C'), ('D', 'Что туда писать', 'F'), ('G', 'Пример', 'I')]:
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}')
r += 1
for a, what, ex in [('1. лог_выражение', 'условие со знаком сравнения (или функция И / ИЛИ / НЕ)', 'B5>=18'),
                    ('2. значение_если_истина', 'что вывести, если условие верно: число, "текст", формулу', '"взрослый"'),
                    ('3. значение_если_ложь', 'что вывести, если условие неверно', '"ребёнок"')]:
    W(ws, f'B{r}', a, bold=True, border=True, merge=f'C{r}')
    W(ws, f'D{r}', what, border=True, merge=f'F{r}')
    code(ws, f'G{r}', ex, merge=f'I{r}')
    ws.row_dimensions[r].height = 20; r += 1
r += 1
r = para(r, 'Примеры ЕСЛИ:', bold=True)
r = ex_header(r)
r = example(r, 1, 20, None, '=ЕСЛИ({x}>=18;"взрослый";"ребёнок")', '=IF({x}>=18,"взрослый","ребёнок")', '20 ≥ 18 → ИСТИНА → выводится 2-й аргумент «взрослый». Впиши 17!')
r = example(r, 2, -5, None, '=ЕСЛИ({x}<0;"Мороз";"Тепло")', '=IF({x}<0,"Мороз","Тепло")', 'Температура −5 меньше нуля → «Мороз».')
r = example(r, 3, 12000, None, '=ЕСЛИ({x}>10000;{x}*0,9;{x})', '=IF({x}>10000,{x}*0.9,{x})', 'Покупка дороже 10 000 тг → скидка 10 %: 12000·0,9 = 10800. Результат может быть ЧИСЛОМ и даже формулой.')
r = example(r, 4, 14, None, '=ЕСЛИ({x}>=16;"Можно";"")', '=IF({x}>=16,"Можно","")', 'Пустые кавычки "" – пустая строка: ячейка выглядит пустой. 14 < 16 → ничего не выводится.')
r = example(r, 5, 5000, 7000, '=ЕСЛИ({x}>={y};"в плюсе";"в минусе")', '=IF({x}>={y},"в плюсе","в минусе")', 'Сравнивать можно две ячейки: доход 5000 < расход 7000 → «в минусе».')
r = callout(r, '🔑 Запомни: ТЕКСТ в формуле всегда пишут в кавычках "…", ЧИСЛА и адреса ячеек – без кавычек. Аргументы разделяет точка с запятой ; (в английской версии Excel – запятая).', 'key')
r += 1

# ---- 3. AND OR NOT
r = section(r, 3, 'Функции И, ИЛИ, НЕ – соединяем условия')
r = para(r, 'Часто одного условия мало. «Иду гулять, если сделал уроки И нет дождя». Для этого есть три логические функции. Их результат – тоже ИСТИНА или ЛОЖЬ.')
for ref, t, m in [('B', 'Функция', 'C'), ('D', 'Когда результат = ИСТИНА', 'F'), ('G', 'Как в речи', 'I')]:
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}')
r += 1
for f, when, sp in [('=И(усл1; усл2; …)', 'когда ВСЕ условия верны', '«и то, и другое»'),
                    ('=ИЛИ(усл1; усл2; …)', 'когда ХОТЯ БЫ ОДНО условие верно', '«или то, или другое, или оба»'),
                    ('=НЕ(условие)', 'когда условие НЕВЕРНО (меняет ответ на противоположный)', '«не», «неправда, что…»')]:
    code(ws, f'B{r}', f, merge=f'C{r}')
    W(ws, f'D{r}', when, border=True, merge=f'F{r}')
    W(ws, f'G{r}', sp, border=True, merge=f'I{r}')
    ws.row_dimensions[r].height = 20; r += 1
r += 1
r = para(r, 'Таблица истинности (меняй ИСТИНА / ЛОЖЬ в жёлтых ячейках):', bold=True)
for ref, t in zip('BCDEFG', ['Условие A', 'Условие B', '=И(A;B)', '=ИЛИ(A;B)', '=НЕ(A)', '']):
    if t: W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, text=True)
r += 1
for a, b in [(False, False), (False, True), (True, False), (True, True)]:
    W(ws, f'B{r}', a, bg=C['yellow'], border=True, h='center', unlock=True)
    W(ws, f'C{r}', b, bg=C['yellow'], border=True, h='center', unlock=True)
    W(ws, f'D{r}', f'=AND(B{r},C{r})', bg=C['green'], border=True, h='center', bold=True)
    W(ws, f'E{r}', f'=OR(B{r},C{r})', bg=C['green'], border=True, h='center', bold=True)
    W(ws, f'F{r}', f'=NOT(B{r})', bg=C['green'], border=True, h='center', bold=True)
    for _c in 'BCDEF': ws[f'{_c}{r}'].number_format = BOOLFMT
    r += 1
r = callout(r, '🔑 И – строгая (одна ЛОЖЬ портит всё). ИЛИ – добрая (хватает одной ИСТИНЫ). НЕ – «переворачивает»: ИСТИНА ↔ ЛОЖЬ.', 'key')
r += 1
r = para(r, 'Примеры функции И:', bold=True)
r = ex_header(r)
r = example(r, 1, 15, None, '=И({x}>=12;{x}<=17)', '=AND({x}>=12,{x}<=17)', 'Возраст 15: 15 ≥ 12 ✔ и 15 ≤ 17 ✔ → оба верны → ИСТИНА. Так записывают «12 ≤ x ≤ 17».')
r = example(r, 2, 150, 8, '=И({x}>=140;{y}>=10)', '=AND({x}>=140,{y}>=10)', 'Аттракцион: рост от 140 см И возраст от 10 лет. Рост 150 ✔, возраст 8 ✘ → одна ЛОЖЬ → весь результат ЛОЖЬ.')
r = example(r, 3, 7, None, '=И({x}>0;{x}<10)', '=AND({x}>0,{x}<10)', 'Число однозначное и положительное? 7 → ИСТИНА. Попробуй 10.')
r = para(r, 'Примеры функции ИЛИ:', bold=True)
r = ex_header(r)
r = example(r, 1, 'суббота', None, '=ИЛИ({x}="суббота";{x}="воскресенье")', '=OR({x}="суббота",{x}="воскресенье")', 'Выходной день? «суббота» совпала с первым условием → ИСТИНА.')
r = example(r, 2, 4, 5, '=ИЛИ({x}=5;{y}=5)', '=OR({x}=5,{y}=5)', 'Есть хотя бы одна пятёрка? Первая оценка 4 ✘, вторая 5 ✔ → хватает одной → ИСТИНА.')
r = example(r, 3, 50, None, '=ИЛИ({x}<0;{x}>100)', '=OR({x}<0,{x}>100)', 'Балл вне диапазона 0–100? 50 – ни одно условие не верно → ЛОЖЬ.')
r = para(r, 'Примеры функции НЕ:', bold=True)
r = ex_header(r)
r = example(r, 1, 5, None, '=НЕ({x}>10)', '=NOT({x}>10)', '5 > 10 – ЛОЖЬ, а НЕ(ЛОЖЬ) = ИСТИНА.')
r = example(r, 2, 'солнце', None, '=НЕ({x}="дождь")', '=NOT({x}="дождь")', 'Погода «солнце» ≠ «дождь» → условие ЛОЖЬ → НЕ переворачивает → ИСТИНА (дождя нет). Впиши «дождь».')
r = example(r, 3, 0, None, '=НЕ({x}=0)', '=NOT({x}=0)', 'Проверка «число не равно нулю». То же самое можно записать как ={x}<>0.')
r += 1

# ---- 4. HOW TO CHOOSE
r = section(r, 4, 'Как выбрать: И, ИЛИ или НЕ? Разбираем ситуации')
r = para(r, 'Самая частая ошибка – выбрать не ту функцию. Формула при этом работает без ошибок, но выдаёт неверный ответ. Помогают два способа: подсказки в тексте задачи и проверка «на одном человеке».')
for ref, t, m in [('B', 'Если в задаче…', 'D'), ('E', 'Выбирай', None), ('F', 'Пример фразы', 'I')]:
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}' if m else None)
r += 1
for words, fn, ex in [('«и … и …», «оба», «все», «одновременно», «при этом ещё»', 'И', '«пропуск на концерт, если есть билет и паспорт»'),
                      ('«хотя бы один», «любой из», «или», «либо»', 'ИЛИ', '«выходной, если суббота или воскресенье»'),
                      ('«не», «кроме», «без», «неверно, что»', 'НЕ', '«проходит тот, у кого НЕТ долгов»')]:
    W(ws, f'B{r}', words, border=True, merge=f'D{r}')
    code(ws, f'E{r}', fn, size=12).alignment = Alignment(horizontal='center', vertical='center')
    W(ws, f'F{r}', ex, border=True, merge=f'I{r}', italic=True)
    ws.row_dimensions[r].height = 22; r += 1
r = callout(r, '🧪 Проверка «на одном человеке»: может ли ОДИН человек (одно число) одновременно выполнить оба условия? '
               'Если нет (например, возраст < 7 и возраст ≥ 65) – функция И ВСЕГДА даст ЛОЖЬ, значит нужна ИЛИ. '
               'Если с ИЛИ подходит вообще любое значение (t ≥ 22 ИЛИ t ≤ 28) – значит нужна И.', 'warn')
r += 1
r = para(r, 'Сравни сам: одна ситуация – две формулы. Меняй жёлтые ячейки и смотри, какая формула ведёт себя правильно.', bold=True)
for ref, t, m in [('B', '№', None), ('C', 'Значение 1', None), ('D', 'Значение 2', None), ('E', 'Ситуация и две формулы', 'F'),
                  ('G', 'Результат с И', None), ('H', 'Результат с ИЛИ', None), ('I', 'Вывод', None)]:
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}' if m else None)
r += 1
def compare(r, n, x, y, sit, and_en, or_en, verdict):
    W(ws, f'B{r}', n, h='center', border=True, bold=True)
    X, Y = f'C{r}', f'D{r}'
    W(ws, X, x, bg=C['yellow'], border=True, h='center', unlock=True)
    W(ws, Y, y, bg=C['yellow'] if y is not None else C['grey'], border=True, h='center', unlock=y is not None)
    W(ws, f'E{r}', sit.format(x=X, y=Y), border=True, merge=f'F{r}', size=9)
    W(ws, f'G{r}', and_en.format(x=X, y=Y), bg=C['green'], border=True, h='center', bold=True)
    W(ws, f'H{r}', or_en.format(x=X, y=Y), bg=C['green'], border=True, h='center', bold=True)
    ws[f'G{r}'].number_format = BOOLFMT; ws[f'H{r}'].number_format = BOOLFMT
    W(ws, f'I{r}', verdict, border=True, size=9)
    ws.row_dimensions[r].height = max(13 * math.ceil(len(sit) / 50) + 6, 13 * math.ceil(len(verdict) / 26) + 6)
    return r + 1
r = compare(r, 1, 5, None, 'Бесплатный вход в музей «детям до 7 и пенсионерам от 65 лет».\nИ({x}<7; {x}>=65)   или   ИЛИ({x}<7; {x}>=65)',
            '=AND({x}<7,{x}>=65)', '=OR({x}<7,{x}>=65)',
            '✅ ИЛИ. В речи говорим «и», но человек не может быть сразу ребёнком и пенсионером – с И всегда ЛОЖЬ. Впиши 70, 30.')
r = compare(r, 2, 90, 50, 'Поступление в лицей: «тест по математике и по физике – не ниже 70».\nИ({x}>=70; {y}>=70)   или   ИЛИ({x}>=70; {y}>=70)',
            '=AND({x}>=70,{y}>=70)', '=OR({x}>=70,{y}>=70)',
            '✅ И. Нужны ОБА предмета. С ИЛИ приняли бы ученика с 50 по физике.')
r = compare(r, 3, 'суббота', None, 'Выходной: «суббота или воскресенье».\nИ({x}="суббота"; {x}="воскресенье")   или   ИЛИ(…)',
            '=AND({x}="суббота",{x}="воскресенье")', '=OR({x}="суббота",{x}="воскресенье")',
            '✅ ИЛИ. День не может быть сразу субботой и воскресеньем – с И всегда ЛОЖЬ.')
r = compare(r, 4, 31, None, 'Вода в аквариуме подходит рыбкам: от 22 до 28 °C.\nИ({x}>=22; {x}<=28)   или   ИЛИ({x}>=22; {x}<=28)',
            '=AND({x}>=22,{x}<=28)', '=OR({x}>=22,{x}<=28)',
            '✅ И. С ИЛИ подходит ЛЮБАЯ температура: 31 ≥ 22 – уже ИСТИНА. Впиши 5 или 100.')
r = compare(r, 5, 50, None, 'Ошибка ввода: балл ВНЕ диапазона 0–100.\nИ({x}<0; {x}>100)   или   ИЛИ({x}<0; {x}>100)',
            '=AND({x}<0,{x}>100)', '=OR({x}<0,{x}>100)',
            '✅ ИЛИ. Число не может быть сразу < 0 и > 100. Впиши 120 – сработает только ИЛИ.')
r += 1
r = para(r, 'Сложные условия: И, ИЛИ и НЕ в одной формуле', bold=True, size=11)
r = para(r, 'Как разобрать сложную задачу по шагам:\n'
            '1) Выпиши все простые условия отдельно (каждое – одно сравнение).\n'
            '2) Реши, как они связаны: все сразу (И), хотя бы одно (ИЛИ), «не» (НЕ).\n'
            '3) Если связи разные – сначала собери внутреннюю группу (её функция стоит внутри), потом внешнюю.\n'
            '4) Поставь готовую логическую функцию на место 1-го аргумента ЕСЛИ.\n'
            '5) Проверь формулу на граничных значениях и на «неудобных» случаях.', bg=C['light'])
r = para(r, 'Пример А. Бассейн пускает, если у ученика есть абонемент ИЛИ он оплатил разовое посещение, И при этом обязательно есть медсправка.', italic=True)
for ref, t in zip('BCDE', ['Абонемент?', 'Разовая оплата?', 'Медсправка?', 'Результат']):
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True)
code(ws, f'F{r}', 'Формула', merge=f'I{r}', bg=C['navy']); ws[f'F{r}'].font = Font(name=FN, bold=True, color=C['white'])
r += 1
for ref, v in zip('BCD', ['нет', 'да', 'да']):
    W(ws, f'{ref}{r}', v, bg=C['yellow'], border=True, h='center', unlock=True)
W(ws, f'E{r}', f'=IF(AND(OR(B{r}="да",C{r}="да"),D{r}="да"),"проходи","нельзя")', bg=C['green'], border=True, h='center', bold=True)
code(ws, f'F{r}', f'=ЕСЛИ(И(ИЛИ(B{r}="да";C{r}="да");D{r}="да");"проходи";"нельзя")', merge=f'I{r}')
ws.row_dimensions[r].height = 22; r += 1
code(ws, f'B{r}', 'ЕСЛИ( … ; "проходи" ; "нельзя" )\n   └─ И( … ; справка="да" )            ← справка нужна ВСЕГДА\n          └─ ИЛИ( абонемент="да" ; разово="да" )   ← хватит одного способа оплаты',
     merge=f'I{r}', bg=C['purple'])
ws[f'B{r}'].alignment = Alignment(wrap_text=True, vertical='center'); ws.row_dimensions[r].height = 50; r += 1
r = para(r, 'Почему ИЛИ внутри, а И снаружи? Оплата бывает двумя способами (хватит одного → ИЛИ), а справка нужна в любом случае (→ И). '
            'Попробуй: поставь справку «нет» – при любой оплате будет «нельзя». Поставь обе оплаты «нет» – тоже «нельзя».', bg=C['green'])
r += 1
r = para(r, 'Пример Б. Повышенная стипендия: средний балл не ниже 4,5 И НЕТ академических долгов.', italic=True)
r = ex_header(r)
r = example(r, 1, 4.7, 'да', '=ЕСЛИ(И({x}>=4,5;НЕ({y}="да"));"стипендия";"нет")', '=IF(AND({x}>=4.5,NOT({y}="да")),"стипендия","нет")',
            'Балл 4,7 ✔, но есть долги («да») → НЕ(ИСТИНА) = ЛОЖЬ → И = ЛОЖЬ → «нет». Впиши «нет».')
r = example(r, 2, 15, 'нет', '=ЕСЛИ(ИЛИ({x}<14;{y}="да");"с родителями";"можно одному")', '=IF(OR({x}<14,{y}="да"),"с родителями","можно одному")',
            'В лагерь: младше 14 ИЛИ есть ограничение врача («да») → только с родителями. 15 лет и «нет» → можно одному.')
r += 1

# ---- 5. IF + AND/OR/NOT
r = section(r, 5, 'ЕСЛИ + И / ИЛИ / НЕ – самое мощное сочетание')
r = para(r, 'Функции И, ИЛИ, НЕ выдают только ИСТИНА/ЛОЖЬ. Чтобы вывести слово или число, их ставят на место ПЕРВОГО аргумента функции ЕСЛИ:')
code(ws, f'B{r}', '=ЕСЛИ( И(усл1; усл2) ; "если оба верны" ; "иначе" )', merge=f'I{r}', size=12, bg=C['purple'])
ws[f'B{r}'].alignment = Alignment(horizontal='center', vertical='center'); ws.row_dimensions[r].height = 26; r += 2
r = ex_header(r)
r = example(r, 1, 15, None, '=ЕСЛИ(И({x}>=12;{x}<=17);"подросток";"не подросток")', '=IF(AND({x}>=12,{x}<=17),"подросток","не подросток")', 'И(…) = ИСТИНА → ЕСЛИ выводит «подросток». Впиши 25.')
r = example(r, 2, 'воскресенье', None, '=ЕСЛИ(ИЛИ({x}="суббота";{x}="воскресенье");"выходной";"учёба")', '=IF(OR({x}="суббота",{x}="воскресенье"),"выходной","учёба")', 'Одно из условий ИЛИ верно → «выходной».')
r = example(r, 3, 9.5, 170, '=ЕСЛИ(И({x}<=10;{y}>=180);"норматив выполнен";"не выполнен")', '=IF(AND({x}<=10,{y}>=180),"норматив выполнен","не выполнен")', 'Физкультура: бег 60 м не дольше 10 с И прыжок от 180 см. Бег ✔, прыжок 170 ✘ → «не выполнен».')
r = example(r, 4, 'в процессе', None, '=ЕСЛИ(НЕ({x}="готово");"доделать";"можно сдавать")', '=IF(NOT({x}="готово"),"доделать","можно сдавать")', 'Проект НЕ готов → «доделать». Впиши «готово».')
r = example(r, 5, 3000, 'да', '=ЕСЛИ(ИЛИ({x}>=5000;{y}="да");0;500)', '=IF(OR({x}>=5000,{y}="да"),0,500)', 'Доставка бесплатна (0 тг), если заказ от 5000 тг ИЛИ есть промокод («да»). Иначе 500 тг.')
r = callout(r, '⚠ Частая ошибка: =ЕСЛИ(12<=A1<=17; …) – так в Excel писать НЕЛЬЗЯ, двойное неравенство он поймёт неправильно. Правильно: =ЕСЛИ(И(A1>=12; A1<=17); …)', 'warn')
r += 1

# ---- 5. nested
r = section(r, 6, '★ Вложенные ЕСЛИ – когда вариантов больше двух')
r = para(r, 'В аргумент «значение_если_ложь» можно поставить ещё одну функцию ЕСЛИ. Excel проверяет условия по очереди и останавливается на первом верном. '
            'Важно: проверяй от большего к меньшему (или наоборот), иначе первое условие «перехватит» всё.')
r = ex_header(r)
r = example(r, 1, 22, None, '=ЕСЛИ({x}>=30;"жарко";ЕСЛИ({x}>=15;"тепло";ЕСЛИ({x}>=0;"прохладно";"мороз")))', '=IF({x}>=30,"жарко",IF({x}>=15,"тепло",IF({x}>=0,"прохладно","мороз")))', '22 ≥ 30? нет → 22 ≥ 15? ДА → «тепло». Дальше Excel не проверяет.')
r = example(r, 2, -3, None, '=ЕСЛИ({x}>0;"положительное";ЕСЛИ({x}<0;"отрицательное";"ноль"))', '=IF({x}>0,"положительное",IF({x}<0,"отрицательное","ноль"))', 'Три варианта – две функции ЕСЛИ. Впиши 0.')
r = callout(r, '🔑 Считай скобки: сколько функций ЕСЛИ открыто – столько скобок «)» в конце.', 'key')
r += 1

# ---- 6. mistakes
r = section(r, 7, 'Частые ошибки')
for ref, t, m in [('B', 'Ошибка', 'C'), ('D', 'Неправильно', 'E'), ('F', 'Правильно', 'G'), ('H', 'Что покажет Excel', 'I')]:
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True, merge=f'{m}{r}')
r += 1
for e, bad, good, res in [
        ('Текст без кавычек', '=ЕСЛИ(A1>5;да;нет)', '=ЕСЛИ(A1>5;"да";"нет")', 'ошибку #ИМЯ?'),
        ('Двойное неравенство', '=ЕСЛИ(1<A1<10;"да";"нет")', '=ЕСЛИ(И(A1>1;A1<10);"да";"нет")', 'неверный результат без ошибки!'),
        ('Не та граница', '=ЕСЛИ(A1>18;"взрослый";"ребёнок")', '=ЕСЛИ(A1>=18;"взрослый";"ребёнок")', 'в 18 лет – «ребёнок»'),
        ('Не закрыта скобка', '=ЕСЛИ(И(A1>0;A1<5);"да";"нет"', '=ЕСЛИ(И(A1>0;A1<5);"да";"нет")', 'сообщение об ошибке в формуле'),
        ('Пробел внутри кавычек', '=ЕСЛИ(A1="да ";1;0)', '=ЕСЛИ(A1="да";1;0)', '«да» ≠ «да » → всегда 0')]:
    W(ws, f'B{r}', e, bold=True, border=True, merge=f'C{r}')
    code(ws, f'D{r}', bad, merge=f'E{r}', bg=C['red'])
    code(ws, f'F{r}', good, merge=f'G{r}', bg=C['dgreen'])
    W(ws, f'H{r}', res, border=True, merge=f'I{r}', size=9)
    ws.row_dimensions[r].height = 22; r += 1
r += 1

# ---- 7. dictionary
r = section(r, 8, 'Словарик: русская и английская версии Excel')
for ref, t in zip('BCDE', ['Русский Excel', 'English Excel', 'Қазақша', 'Смысл']):
    W(ws, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True)
r += 1
for ru, en, kz, s in [('ЕСЛИ', 'IF', 'ЕГЕР (шарт)', 'условие → выбор'), ('И', 'AND', 'ЖӘНЕ', 'все условия'),
                      ('ИЛИ', 'OR', 'НЕМЕСЕ', 'хотя бы одно'), ('НЕ', 'NOT', 'ЕМЕС', 'отрицание'),
                      ('ИСТИНА', 'TRUE', 'ақиқат', 'верно'), ('ЛОЖЬ', 'FALSE', 'жалған', 'неверно'),
                      (';  (разделитель)', ',  (separator)', ';', 'между аргументами')]:
    code(ws, f'B{r}', ru); code(ws, f'C{r}', en)
    W(ws, f'D{r}', kz, border=True); W(ws, f'E{r}', s, border=True)
    r += 1
r += 1
r = selfcheck(ws, r, 'I')
W(ws, f'B{r}', '✅ Теорию прочитал(а), все примеры «потрогал(а)»? Переходи к заданиям →', bold=True, bg=C['green'], merge=f'G{r}', h='center')
link(ws, f'H{r}', '1 Разминка ▶', "'1_Разминка'!A1")
ws.row_dimensions[r].height = 24
th.page_setup.orientation = 'landscape'; th.page_setup.fitToWidth = 1; th.page_setup.fitToHeight = 0
th.sheet_properties.pageSetUpPr.fitToPage = True

# =====================================================================  TASK SHEET HELPERS
CHECKS = {}   # sheet -> list of (range, star)
HINTS = []    # list of 'sheet'!cell
SOLVE = []    # (sheet, cell, formula)  for teacher version

def ft(t): return f'_xlfn.FORMULATEXT({t})'
FUNCPAT = {'ЕСЛИ': ['ЕСЛИ(', 'IF('], 'И': ['=И(', '(И(', ';И(', 'AND('], 'ИЛИ': ['ИЛИ(', 'OR('], 'НЕ': ['НЕ(', 'NOT(']}

def chk(t, exp, funcs=()):
    conds = [ 'OR(' + ','.join(f'ISNUMBER(SEARCH("{p}",{ft(t)}))' for p in FUNCPAT[f]) + ')' for f in funcs]
    inner = f'IF({t}=({exp}),"✔","✘")'
    if conds:
        inner = f'IF(NOT(AND({",".join(conds)})),"⚠ нужна функция {" + ".join(funcs)}",{inner})'
    return f'=IFERROR(IF(NOT(_xlfn.ISFORMULA({t})),IF({t}="","","⚠ нужна формула"),{inner}),"✘")'

def task_sheet(name, title, desc, widths):
    s = wb.create_sheet(name)
    s.sheet_view.showGridLines = False
    for i, w in enumerate(widths):
        s.column_dimensions[chr(65 + i)].width = w
    last = chr(64 + len(widths))
    W(s, 'A1', title, bold=True, size=16, color=C['white'], bg=C['navy'], merge=f'{last}1')
    s.row_dimensions[1].height = 32
    W(s, 'A2', desc, italic=True, bg=C['light'], merge=f'{last}2')
    H(s, 2, desc, sum(widths) * 1.0)
    W(s, 'A3', f'="👤 Ученик: "&IF({NAME}="","(впиши имя на листе Теория)",{NAME})&IF({CLASS}="","","   ·   Класс: "&{CLASS})',
      bold=True, size=11, color=C['navy'], merge=f'{last}3')
    s.row_dimensions[3].height = 20
    CHECKS[name] = []
    s.page_setup.orientation = 'landscape'; s.page_setup.fitToWidth = 1; s.page_setup.fitToHeight = 0
    s.sheet_properties.pageSetUpPr.fitToPage = True
    return s

def hdr(s, r, items):
    for ref, t in items:
        W(s, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], h='center', border=True)
    s.row_dimensions[r].height = 32

def inp(s, ref, solved=None):
    W(s, ref, None, bg=C['yellow'], border=True, h='center', unlock=True)
    if SOLVED and solved is not None:
        s[ref].value = solved

def checkcell(s, ref, formula):
    W(s, ref, formula, border=True, h='center', bold=True)
    s[ref].protection = Protection(locked=True, hidden=True)

def hint(s, r, qcol, q, answers, text):
    a = chr(ord(qcol) + 1); k = chr(ord(qcol) + 2)
    text = text.replace('\\"', '""')
    W(s, f'{qcol}{r}', q, bg=C['light'], border=True, size=9)
    W(s, f'{a}{r}', None, bg=C['light'], border=True, unlock=True, h='center')
    conds = ','.join(f'LOWER(TRIM({a}{r}&""))="{x}"' for x in answers)
    W(s, f'{k}{r}', f'=IF({a}{r}="","🔒 Ответь на вопрос слева",IF(OR({conds}),"{text}","✘ Неверно – подумай ещё"))', border=True, size=9)
    s.row_dimensions[r].height = max(s.row_dimensions[r].height or 15, 13 * math.ceil(max(len(q) / 30, len(text) / 42)) + 6)
    s[f'{k}{r}'].protection = Protection(locked=True, hidden=True)
    HINTS.append(f"'{s.title}'!{k}{r}")
    if SOLVED: s[f'{a}{r}'].value = answers[0]

def hint_hdr(s, r, qcol):
    a = chr(ord(qcol) + 1); k = chr(ord(qcol) + 2)
    hdr(s, r, [(qcol, 'Вопрос-ключ к подсказке'), (a, 'Ответ'), (k, 'Подсказка')])

def add_cf(s, rng):
    first = rng.split(':')[0]
    s.conditional_formatting.add(rng, FormulaRule(formula=[f'{first}="✔"'], fill=fill(C['dgreen']), font=Font(color=C['ok'], bold=True)))
    s.conditional_formatting.add(rng, FormulaRule(formula=[f'{first}="✘"'], fill=fill('FFC7CE'), font=Font(color=C['bad'], bold=True)))
    s.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT({first},1)="⚠"'], fill=fill('FFEB9C'), font=Font(color='9C5700', bold=True)))

def nav_next(s, r, target, label):
    link(s, f'A{r}', label, f"'{target}'!A1")
    s.merge_cells(f'A{r}:B{r}')
    s.row_dimensions[r].height = 22

# =====================================================================  1. WARM-UP
s = task_sheet('1_Разминка', 'Задание 1. Разминка: предскажи ответ Excel',
               'Не пиши формулы! Посмотри на формулу и данные, подумай и впиши свой прогноз: ИСТИНА, ЛОЖЬ, число или текст. Справа появится ✔ или ✘. Если ✘ – подумай ещё раз и исправь ответ.',
               [5, 36, 18, 14, 3, 3, 30, 12, 42])
W(s, 'B5', 'Исходные данные', bold=True, bg=C['navy'], color=C['white'], border=True, merge='C5')
for r, (lab, v) in enumerate([('A (ячейка C6)', 15), ('B (ячейка C7)', 20), ('Город (ячейка C8)', 'Астана')], 6):
    W(s, f'B{r}', lab, border=True); W(s, f'C{r}', v, border=True, h='center', bold=True, bg=C['grey'])
hdr(s, 10, [('A', '№'), ('B', 'Формула'), ('C', 'Твой прогноз'), ('D', 'Проверка')])
items = [('=C6>10', 'C6>10'), ('=C6>=C7', 'C6>=C7'), ('=C6<>C7', 'C6<>C7'), ('=C6+5=C7', 'C6+5=C7'),
         ('=C8="астана"', 'C8="астана"'), ('=И(C6>10;C7>25)', 'AND(C6>10,C7>25)'), ('=ИЛИ(C6>10;C7>25)', 'OR(C6>10,C7>25)'),
         ('=НЕ(C6=15)', 'NOT(C6=15)'), ('=ЕСЛИ(C6>C7;"A больше";"B больше")', 'IF(C6>C7,"A больше","B больше")'),
         ('=ЕСЛИ(И(C6<C7;C8="Алматы");1;0)', 'IF(AND(C6<C7,C8="Алматы"),1,0)')]
NRM = lambda x: f'SUBSTITUTE(SUBSTITUTE(UPPER(TRIM({x}&"")),"А","A"),"В","B")'   # Cyrillic А/В -> Latin A/B
sol1 = [True, False, True, True, True, False, True, False, 'B больше', 0]
for i, (ru, en) in enumerate(items):
    r = 11 + i
    W(s, f'A{r}', i + 1, border=True, h='center', bold=True)
    code(s, f'B{r}', ru)
    inp(s, f'C{r}', sol1[i])
    e = f'({en})'; t = f'C{r}'
    checkcell(s, f'D{r}',
        f'=IF(ISBLANK({t}),"",IF(AND(_xlfn.ISFORMULA({t}),ISERROR(SEARCH("TRUE()",_xlfn.FORMULATEXT({t}))),ISERROR(SEARCH("FALSE()",_xlfn.FORMULATEXT({t}))),ISERROR(SEARCH("ИСТИНА()",_xlfn.FORMULATEXT({t}))),ISERROR(SEARCH("ЛОЖЬ()",_xlfn.FORMULATEXT({t})))),"⚠ без формул – подумай сам",IF(ISLOGICAL({e}),'
        f'IF(ISLOGICAL({t}),IF({t}={e},"✔","✘"),IF(OR(AND({e},OR(UPPER({t})="ИСТИНА",UPPER({t})="TRUE")),AND(NOT({e}),OR(UPPER({t})="ЛОЖЬ",UPPER({t})="FALSE"))),"✔","✘")),'
        f'IF({NRM(t)}={NRM(e)},"✔","✘"))))')
    s.row_dimensions[r].height = 20
CHECKS['1_Разминка'].append(('D11:D20', False))
add_cf(s, 'D11:D20')
W(s, 'G10', '💡 Подсказка', bold=True, bg=C['navy'], color=C['white'], border=True, merge='I10')
W(s, 'G11', 'ИСТИНА / ЛОЖЬ можно вводить большими или маленькими буквами. Текст (например, B больше) пиши без кавычек.\n\n'
            'Порядок: сначала считается арифметика (+, −), потом сравнение, потом И / ИЛИ / НЕ, и в конце ЕСЛИ.\n\nЗабыл(а)? Вернись на лист Теория, разделы 1–3.', bg=C['light'], merge='I15', v='top')
nav_next(s, selfcheck(s, 22, 'I'), '2_ЕСЛИ', 'Дальше: 2 ЕСЛИ ▶')

# =====================================================================  2. IF
s = task_sheet('2_ЕСЛИ', 'Задание 2. Отбор в школьную команду по информатике – функция ЕСЛИ',
               'Учитель провёл отборочный тест (максимум 100 баллов). Заполни жёлтые столбцы ФОРМУЛАМИ с функцией ЕСЛИ. Напиши формулу в первой строке и протяни её вниз маркером заполнения.',
               [4, 16, 9, 14, 9, 12, 9, 16, 9, 3, 30, 12, 40])
hdr(s, 5, [('A', '№'), ('B', 'Ученик'), ('C', 'Балл'), ('D', 'Результат\n(≥ 50 → «сдал», иначе «не сдал»)'), ('E', 'Проверка'),
           ('F', 'Бонус\n(≥ 90 → 10, иначе 0)'), ('G', 'Проверка'), ('H', '★ Комментарий\n(< 50 → «пересдача», иначе пусто "")'), ('I', 'Проверка')])
s.row_dimensions[5].height = 58
data2 = [('Айгерим', 72), ('Данияр', 50), ('Мадина', 49), ('Тимур', 95), ('Алия', 90), ('Ерлан', 31), ('Сауле', 88), ('Нурлан', 100)]
for i, (n, p) in enumerate(data2):
    r = 6 + i
    W(s, f'A{r}', i + 1, border=True, h='center'); W(s, f'B{r}', n, border=True); W(s, f'C{r}', p, border=True, h='center', bold=True, bg=C['grey'])
    inp(s, f'D{r}', f'=IF(C{r}>=50,"сдал","не сдал")'); checkcell(s, f'E{r}', chk(f'D{r}', f'IF(C{r}>=50,"сдал","не сдал")', ['ЕСЛИ']))
    inp(s, f'F{r}', f'=IF(C{r}>=90,10,0)'); checkcell(s, f'G{r}', chk(f'F{r}', f'IF(C{r}>=90,10,0)', ['ЕСЛИ']))
    inp(s, f'H{r}', f'=IF(C{r}<50,"пересдача","")'); checkcell(s, f'I{r}', chk(f'H{r}', f'IF(C{r}<50,"пересдача","")', ['ЕСЛИ']))
    s.row_dimensions[r].height = 20
CHECKS['2_ЕСЛИ'] += [('E6:E13', False), ('G6:G13', False), ('I6:I13', True)]
for rg in ['E6:E13', 'G6:G13', 'I6:I13']: add_cf(s, rg)
W(s, 'B15', '🤔 Подумай: почему у Данияра (50) и Алии (90) важно, какой знак ты выбрал – > или >= ?', italic=True, merge='I15')
hint_hdr(s, 5, 'K')
hint(s, 6, 'K', 'Каким знаком записывают «больше или равно»?', ['>='], 'Результат: =ЕСЛИ(балл>=50;\\"сдал\\";\\"не сдал\\") – вместо «балл» поставь адрес ячейки (C6)')
hint(s, 8, 'K', 'Числа в формуле пишут в кавычках? (да / нет)', ['нет'], 'Бонус: =ЕСЛИ(балл>=90;10;0) – числа без кавычек')
hint(s, 10, 'K', 'Сколько символов в пустой строке ""? (число)', ['0'], '★ Комментарий: =ЕСЛИ(балл<50;\\"пересдача\\";\\"\\")')
nav_next(s, selfcheck(s, 17, 'I'), '3_И_ИЛИ_НЕ', 'Дальше: 3 И ИЛИ НЕ ▶')

# =====================================================================  3. AND OR NOT
s = task_sheet('3_И_ИЛИ_НЕ', 'Задание 3. Функции И, ИЛИ, НЕ',
               'Часть А – заполни таблицу истинности формулами. Часть Б – школьная олимпиада: определи, кто допущен, кто получит грамоту и у кого нет пропусков. Результат в жёлтых ячейках – ИСТИНА или ЛОЖЬ.',
               [4, 14, 12, 12, 12, 13, 9, 13, 9, 14, 9, 3, 30, 12, 40])
W(s, 'A5', 'Часть А. Таблица истинности', bold=True, size=12, color=C['navy'], merge='F5')
hdr(s, 6, [('B', 'A'), ('C', 'B'), ('D', '=И(A;B)'), ('E', '=ИЛИ(A;B)'), ('F', '=НЕ(A)'), ('G', 'Проверка строки')])
for col in 'DEF':
    s[f'{col}6'].data_type = 's'; s[f'{col}6'].quotePrefix = True
for i, (a, b) in enumerate([(False, False), (False, True), (True, False), (True, True)]):
    r = 7 + i
    W(s, f'B{r}', a, border=True, h='center', bg=C['grey'], bold=True); W(s, f'C{r}', b, border=True, h='center', bg=C['grey'], bold=True)
    inp(s, f'D{r}', f'=AND(B{r},C{r})'); inp(s, f'E{r}', f'=OR(B{r},C{r})'); inp(s, f'F{r}', f'=NOT(B{r})')
    for _c in 'BCDEF': s[f'{_c}{r}'].number_format = BOOLFMT
    cD = chk(f'D{r}', f'AND(B{r},C{r})', ['И'])[1:]; cE = chk(f'E{r}', f'OR(B{r},C{r})', ['ИЛИ'])[1:]; cF = chk(f'F{r}', f'NOT(B{r})', ['НЕ'])[1:]
    checkcell(s, f'G{r}', f'=IF(COUNTBLANK(D{r}:F{r})=3,"",IF(AND({cD}="✔",{cE}="✔",{cF}="✔"),"✔",IF(OR(LEFT({cD},1)="⚠",LEFT({cE},1)="⚠",LEFT({cF},1)="⚠"),"⚠ нужны формулы И / ИЛИ / НЕ","✘")))')
    s.row_dimensions[r].height = 20
CHECKS['3_И_ИЛИ_НЕ'].append(('G7:G10', False)); add_cf(s, 'G7:G10')
W(s, 'A12', 'Часть Б. Школьная олимпиада', bold=True, size=12, color=C['navy'], merge='F12')
hdr(s, 13, [('A', '№'), ('B', 'Ученик'), ('C', 'Математика'), ('D', 'Информатика'), ('E', 'Пропуски, уроков'),
            ('F', 'Допуск\nоба балла ≥ 80'), ('G', 'Проверка'), ('H', 'Грамота\nхотя бы один ≥ 95'), ('I', 'Проверка'),
            ('J', 'Без пропусков\nНЕ(пропуски > 0)'), ('K', 'Проверка')])
s.row_dimensions[13].height = 46
data3 = [('Айгерим', 85, 92, 0), ('Данияр', 78, 99, 2), ('Мадина', 96, 70, 0), ('Тимур', 80, 80, 5), ('Алия', 60, 65, 1), ('Ерлан', 95, 95, 0)]
for i, (n, m, inf, p) in enumerate(data3):
    r = 14 + i
    W(s, f'A{r}', i + 1, border=True, h='center'); W(s, f'B{r}', n, border=True)
    for col, v in zip('CDE', (m, inf, p)): W(s, f'{col}{r}', v, border=True, h='center', bold=True, bg=C['grey'])
    inp(s, f'F{r}', f'=AND(C{r}>=80,D{r}>=80)'); checkcell(s, f'G{r}', chk(f'F{r}', f'AND(C{r}>=80,D{r}>=80)', ['И']))
    inp(s, f'H{r}', f'=OR(C{r}>=95,D{r}>=95)'); checkcell(s, f'I{r}', chk(f'H{r}', f'OR(C{r}>=95,D{r}>=95)', ['ИЛИ']))
    for _c in 'FHJ': s[f'{_c}{r}'].number_format = BOOLFMT
    inp(s, f'J{r}', f'=NOT(E{r}>0)'); checkcell(s, f'K{r}', chk(f'J{r}', f'NOT(E{r}>0)', ['НЕ']))
    s.row_dimensions[r].height = 20
CHECKS['3_И_ИЛИ_НЕ'] += [('G14:G19', False), ('I14:I19', False), ('K14:K19', False)]
for rg in ['G14:G19', 'I14:I19', 'K14:K19']: add_cf(s, rg)
hint_hdr(s, 6, 'M')
hint(s, 7, 'M', 'Чему равно И(ИСТИНА; ЛОЖЬ)?', ['ложь', 'false'], 'И – ИСТИНА, только если ВСЕ верны; ИЛИ – если хотя бы одно; НЕ – наоборот. Пример: =И(B7;C7)')
hint(s, 9, 'M', 'Какая функция нужна, если должны выполняться ОБА условия?', ['и', 'and'], 'Допуск: =И(матем>=80; информ>=80)')
hint(s, 14, 'M', 'Какая функция, если достаточно ОДНОГО условия?', ['или', 'or'], 'Грамота: =ИЛИ(матем>=95; информ>=95)')
hint(s, 16, 'M', 'Чему равно НЕ(ИСТИНА)?', ['ложь', 'false'], 'Без пропусков: =НЕ(пропуски>0)')
nav_next(s, selfcheck(s, 21, 'K'), '4_ЕСЛИ+И_ИЛИ_НЕ', 'Дальше: 4 ЕСЛИ + И ИЛИ НЕ ▶')

# =====================================================================  4. COMBO
s = task_sheet('4_ЕСЛИ+И_ИЛИ_НЕ', 'Задание 4. Школьный кинотеатр – ЕСЛИ вместе с И, ИЛИ, НЕ',
               'В актовом зале показывают фильм с пометкой 12+ (смотреть можно с 12 лет). Билет стоит 2000 тг, детям до 12 лет и пенсионерам от 63 лет – 1000 тг. Помоги кассиру и контролёру: заполни жёлтые столбцы формулами.',
               [4, 16, 9, 11, 13, 9, 15, 9, 14, 9, 3, 30, 12, 44])
hdr(s, 5, [('A', '№'), ('B', 'Зритель'), ('C', 'Возраст'), ('D', 'Билет оплачен?'),
           ('E', 'Цена билета\nЕСЛИ + ИЛИ'), ('F', 'Проверка'), ('G', 'Вход на фильм 12+\nЕСЛИ + И\n«проходи» / «стоп»'), ('H', 'Проверка'),
           ('I', 'Касса\nЕСЛИ + НЕ\n«оплатите» / «OK»'), ('J', 'Проверка')])
s.row_dimensions[5].height = 80
data4 = [('Арман', 10, 'да'), ('Жанна', 16, 'да'), ('Олжас', 12, 'да'), ('Роза апа', 65, 'нет'), ('Карина', 34, 'нет'), ('Самат', 63, 'да')]
for i, (n, a, p) in enumerate(data4):
    r = 6 + i
    W(s, f'A{r}', i + 1, border=True, h='center'); W(s, f'B{r}', n, border=True)
    W(s, f'C{r}', a, border=True, h='center', bold=True, bg=C['grey']); W(s, f'D{r}', p, border=True, h='center', bold=True, bg=C['grey'])
    e1 = f'IF(OR(C{r}<12,C{r}>=63),1000,2000)'; e2 = f'IF(AND(C{r}>=12,D{r}="да"),"проходи","стоп")'; e3 = f'IF(NOT(D{r}="да"),"оплатите","OK")'
    inp(s, f'E{r}', '=' + e1); checkcell(s, f'F{r}', chk(f'E{r}', e1, ['ЕСЛИ', 'ИЛИ']))
    inp(s, f'G{r}', '=' + e2); checkcell(s, f'H{r}', chk(f'G{r}', e2, ['ЕСЛИ', 'И']))
    inp(s, f'I{r}', '=' + e3); checkcell(s, f'J{r}', chk(f'I{r}', e3, ['ЕСЛИ', 'НЕ']))
    s.row_dimensions[r].height = 20
CHECKS['4_ЕСЛИ+И_ИЛИ_НЕ'] += [('F6:F11', False), ('H6:H11', False), ('J6:J11', False)]
for rg in ['F6:F11', 'H6:H11', 'J6:J11']: add_cf(s, rg)
W(s, 'B13', 'Выручка кассы (оплатившие зрители), тг:', bold=True, merge='D13')
W(s, 'E13', '=SUMIF(D6:D11,"да",E6:E11)', bold=True, border=True, h='center', bg=C['green'])
W(s, 'F13', '← считается сама, когда цены заполнены', italic=True, size=9, merge='J13')
hint_hdr(s, 5, 'L')
hint(s, 6, 'L', 'Дети до 12 ИЛИ пенсионеры от 63. Какая функция объединит условия?', ['или', 'or'], 'Цена: =ЕСЛИ(ИЛИ(возраст<12; возраст>=63); 1000; 2000)')
hint(s, 8, 'L', 'Нужно и 12 лет, и оплата. Какая функция?', ['и', 'and'], 'Вход: =ЕСЛИ(И(возраст>=12; оплачен=\\"да\\"); \\"проходи\\"; \\"стоп\\")')
hint(s, 10, 'L', 'Какая функция «переворачивает» условие?', ['не', 'not'], 'Касса: =ЕСЛИ(НЕ(оплачен=\\"да\\"); \\"оплатите\\"; \\"OK\\")')
nav_next(s, selfcheck(s, 15, 'J'), '5_★Вложенные', 'Дальше: 5 ★ Вложенные ▶')

# =====================================================================  5. NESTED
s = task_sheet('5_★Вложенные', 'Задание 5 ★. Оценка за СОР – вложенные функции ЕСЛИ',
               'Переведи процент выполнения в оценку: 85–100 % → 5;  65–84 % → 4;  40–64 % → 3;  меньше 40 % → 2. Используй вложенные ЕСЛИ. Обрати внимание на граничные значения!',
               [4, 16, 12, 14, 9, 3, 30, 12, 46])
hdr(s, 5, [('A', '№'), ('B', 'Ученик'), ('C', 'Выполнение, %'), ('D', 'Оценка'), ('E', 'Проверка')])
data5 = [('Айгерим', 100), ('Данияр', 85), ('Мадина', 84), ('Тимур', 65), ('Алия', 64), ('Ерлан', 40), ('Сауле', 39), ('Нурлан', 0)]
for i, (n, p) in enumerate(data5):
    r = 6 + i
    W(s, f'A{r}', i + 1, border=True, h='center'); W(s, f'B{r}', n, border=True); W(s, f'C{r}', p, border=True, h='center', bold=True, bg=C['grey'])
    e = f'IF(C{r}>=85,5,IF(C{r}>=65,4,IF(C{r}>=40,3,2)))'
    inp(s, f'D{r}', '=' + e); checkcell(s, f'E{r}', chk(f'D{r}', e, ['ЕСЛИ']))
    s.row_dimensions[r].height = 20
CHECKS['5_★Вложенные'].append(('E6:E13', True)); add_cf(s, 'E6:E13')
hint_hdr(s, 5, 'G')
hint(s, 6, 'G', 'С какой оценки начинать проверку: с 5 или с 2?', ['5'], '=ЕСЛИ(%>=85; 5; ЕСЛИ(%>=65; 4; ЕСЛИ(%>=40; 3; 2))) – три ЕСЛИ, три скобки в конце')
nav_next(s, selfcheck(s, 15, 'E'), '6_Тест', 'Дальше: 6 Итоговый тест ▶')

# =====================================================================  TEST
s = task_sheet('6_Тест', 'Задание 6. Итоговый тест: проверь, понял ли ты ВСЕ функции',
               'Выбери один правильный ответ из списка ▼ (А, Б, В или Г). Считай в уме, Excel для подсчёта не используй! После выбора сразу увидишь ✔ или ✘.',
               [5, 48, 58, 10, 12])
hdr(s, 5, [('A', '№'), ('B', 'Вопрос'), ('C', 'Варианты ответа'), ('D', 'Ответ'), ('E', 'Проверка')])
TEST = [
 ('Что вернёт формула =10>=10 ?', 'А) ИСТИНА\nБ) ЛОЖЬ\nВ) 10\nГ) ошибку', 'А'),
 ('В ячейке A1 записано 0. Что вернёт =ЕСЛИ(A1>0;"плюс";"минус") ?', 'А) плюс\nБ) минус\nВ) 0\nГ) ЛОЖЬ', 'Б'),
 ('Какая формула записана правильно (русская версия Excel)?', 'А) =ЕСЛИ(A1>5;да;нет)\nБ) =ЕСЛИ("A1>5";"да";"нет")\nВ) =ЕСЛИ(A1>5;"да";"нет")\nГ) =ЕСЛИ A1>5 ТО "да"', 'В'),
 ('Что вернёт =И(ИСТИНА;ЛОЖЬ;ИСТИНА) ?', 'А) ИСТИНА\nБ) ЛОЖЬ\nВ) 2\nГ) ошибку', 'Б'),
 ('Что вернёт =НЕ(5>3) ?', 'А) ИСТИНА\nБ) 5\nВ) 3\nГ) ЛОЖЬ', 'Г'),
 ('Как записать условие «число в A1 от 1 до 10 включительно»?', 'А) =И(A1>=1;A1<=10)\nБ) =ИЛИ(A1>=1;A1<=10)\nВ) =1<=A1<=10\nГ) =И(A1>1;A1<10)', 'А'),
 ('Скидка «детям до 7 лет и пенсионерам от 63 лет» (возраст – в A1). Какая формула верна?',
  'А) =ЕСЛИ(И(A1<7;A1>=63);"скидка";"")\nБ) =ЕСЛИ(НЕ(A1<7);"скидка";"")\nВ) =ЕСЛИ(ИЛИ(A1<7;A1>=63);"скидка";"")\nГ) =ЕСЛИ(A1<7;"скидка";A1>=63)', 'В'),
 ('Какая формула всегда даёт тот же результат, что =НЕ(A1>5) ?', 'А) =A1<5\nБ) =A1>=5\nВ) =A1<>5\nГ) =A1<=5', 'Г'),
 ('A1 = 13, B1 = "нет". Что вернёт =ЕСЛИ(И(A1>=12;B1="да");"проходи";"стоп") ?', 'А) проходи\nБ) стоп\nВ) ИСТИНА\nГ) ЛОЖЬ', 'Б'),
 ('A1 = 70. Что вернёт =ЕСЛИ(A1>=85;5;ЕСЛИ(A1>=65;4;3)) ?', 'А) 5\nБ) 3\nВ) 4\nГ) 70', 'В'),
]
dvt = DataValidation(type='list', formula1='"А,Б,В,Г"', allow_blank=True)
dvt.error = 'Выбери А, Б, В или Г из списка'; dvt.errorTitle = 'Ответ'
s.add_data_validation(dvt)
for i, (q, opts, ans) in enumerate(TEST):
    r = 6 + i
    W(s, f'A{r}', i + 1, border=True, h='center', bold=True)
    W(s, f'B{r}', q, border=True, text=True)
    W(s, f'C{r}', opts, border=True, font='Consolas', size=9, text=True)
    inp(s, f'D{r}', ans); s[f'D{r}'].font = Font(name=FN, size=14, bold=True); dvt.add(f'D{r}')
    checkcell(s, f'E{r}', f'=IF(D{r}="","",IF(UPPER(TRIM(D{r}))="{ans}","✔","✘"))')
    s.row_dimensions[r].height = 62
CHECKS['6_Тест'].append(('E6:E15', False)); add_cf(s, 'E6:E15')
W(s, 'B17', 'Верных ответов в тесте:', bold=True, h='right')
W(s, 'C17', '=COUNTIF(E6:E15,"✔")&" из 10"', bold=True, border=True, bg=C['green'])
nav_next(s, selfcheck(s, 19, 'E'), 'Итог', 'Дальше: 🏆 Итог ▶')

# =====================================================================  RESULT
s = wb.create_sheet('Итог'); s.sheet_view.showGridLines = False
for col, w in zip('ABCDEFGHIJ', [3, 24, 30, 40, 12, 18, 24, 3, 10, 16]):
    s.column_dimensions[col].width = w
W(s, 'B1', '🏆 Мой результат', bold=True, size=18, color=C['white'], bg=C['navy'], merge='J1'); s.row_dimensions[1].height = 34
W(s, 'B3', 'Ученик', bold=True, border=True)
W(s, 'C3', f'=IF({NAME}="","(впиши имя на листе Теория)",{NAME})&IF({CLASS}="",""," · "&{CLASS})', border=True, bold=True, merge='D3')

def rsize(rg):
    a, b = rg.split(':'); return int(b[1:]) - int(a[1:]) + 1
def cnt(sym, star=None, sheets=None):
    parts = []
    for sh, lst in CHECKS.items():
        if sheets and sh not in sheets: continue
        for rg, st in lst:
            if star is None or st == star:
                parts.append(f"COUNTIF('{sh}'!{rg},\"{sym}\")")
    return '+'.join(parts) or '0'
BASE = sum(rsize(rg) for lst in CHECKS.values() for rg, st in lst if not st)
STAR = sum(rsize(rg) for lst in CHECKS.values() for rg, st in lst if st)
W(s, 'B5', 'Основные задания', bold=True, border=True); W(s, 'C5', f'=({cnt("✔", False)})&" из {BASE}"', border=True, h='center')
W(s, 'B6', '★ Задания со звёздочкой', bold=True, border=True); W(s, 'C6', f'=({cnt("✔", True)})&" из {STAR}"', border=True, h='center')
W(s, 'B7', 'Всего верных ответов', bold=True, border=True); W(s, 'C7', f'={cnt("✔")}', border=True, h='center', bold=True)
W(s, 'B8', 'ОЦЕНКА ФО (из 10)', bold=True, size=13, border=True, bg=C['yellow'])
W(s, 'C8', f'=MIN(10,ROUND(C7/{BASE}*10,0))', bold=True, size=20, border=True, h='center', bg=C['yellow'])
s.row_dimensions[8].height = 34
W(s, 'B9', 'Прогресс', bold=True, border=True)
W(s, 'C9', f'=REPT("█",MIN(20,ROUND(C7/{BASE}*20,0)))&REPT("░",20-MIN(20,ROUND(C7/{BASE}*20,0)))', border=True, font='Consolas')
hcond = '+'.join(f'IF(OR(LEFT({h},1)="🔒",LEFT({h},1)="✘"),0,1)' for h in HINTS)
W(s, 'B10', 'Открыто подсказок', bold=True, border=True); W(s, 'C10', f'=({hcond})&" из {len(HINTS)}"', border=True, h='center')
W(s, 'D5', f'Оценка = верные ответы ÷ {BASE} × 10 (округление, максимум 10).\n★-задания помогают добрать баллы.', italic=True, size=9, merge='D7', v='top')

# overall objective
OV = f'(({cnt("✔", False)})/{BASE})'
W(s, 'B12', f'="🎯 ЦО 8.2.2.2: "&IF({OV}>=0.8,"ДОСТИГНУТА",IF({OV}>=0.5,"ДОСТИГНУТА ЧАСТИЧНО","ПОКА НЕ ДОСТИГНУТА"))',
  bold=True, size=14, border=True, merge='G12', h='center')
s.row_dimensions[12].height = 30
s.conditional_formatting.add('B12:G12', FormulaRule(formula=[f'{OV}>=0.8'], fill=fill(C['dgreen'])))
s.conditional_formatting.add('B12:G12', FormulaRule(formula=[f'AND({OV}>=0.5,{OV}<0.8)'], fill=fill('FFEB9C')))
s.conditional_formatting.add('B12:G12', FormulaRule(formula=[f'{OV}<0.5'], fill=fill('FFC7CE')))
W(s, 'B13', f'=IF({OV}>=0.8,"Отлично! Ты умеешь использовать ЕСЛИ, И, ИЛИ, НЕ. Попробуй ★-задания, если ещё не решил.",'
            f'IF({OV}>=0.5,"Хорошая основа. Посмотри в таблице ниже, где уровень 🟡 или 🔴, и повтори этот раздел теории.",'
            f'"Вернись к листу Теория: разделы 2–4. Используй вопросы-ключи – они открывают подсказки."))',
  italic=True, merge='G13', border=True)
s.row_dimensions[13].height = 30

# per part table
W(s, 'B15', 'Самооценка и результат по частям урока', bold=True, size=12, color=C['white'], bg='7030A0', merge='G15')
for ref, t in zip('BCDEFG', ['Часть урока', 'Критерий оценивания', 'Моя самооценка', 'Результат', 'Уровень', 'Самооценка точная?']):
    W(s, f'{ref}16', t, bold=True, bg=C['navy'], color=C['white'], border=True, h='center')
PARTS = [('Теория', 'Теория', 'изучил(а) теорию и примеры'),
         ('1_Разминка', '1. Разминка', '1) записывает логические выражения'),
         ('2_ЕСЛИ', '2. ЕСЛИ', '2) применяет функцию ЕСЛИ'),
         ('3_И_ИЛИ_НЕ', '3. И, ИЛИ, НЕ', '3) применяет функции И, ИЛИ, НЕ'),
         ('4_ЕСЛИ+И_ИЛИ_НЕ', '4. ЕСЛИ + И/ИЛИ/НЕ', '4) комбинирует ЕСЛИ с логическими функциями'),
         ('5_★Вложенные', '5. ★ Вложенные ЕСЛИ', '★ дополнительно: вложенные ЕСЛИ'),
         ('6_Тест', '6. Итоговый тест', 'все критерии 1–4')]
for i, (sh, label, crit) in enumerate(PARTS):
    r = 17 + i
    W(s, f'B{r}', label, border=True, bold=True); W(s, f'C{r}', crit, border=True, size=9)
    sc = SELF.get(sh)
    W(s, f'D{r}', f'=IF({sc}="","— не оценил(а)",IFERROR(CHOOSE(VALUE(LEFT({sc}&"",1)),"1 – пока не понял(а)","2 – понял(а) с подсказками","3 – понял(а) полностью"),"— не оценил(а)"))', border=True, size=9)
    if sh in CHECKS:
        tot = sum(rsize(rg) for rg, _ in CHECKS[sh])
        ok = cnt('✔', sheets=[sh])
        tried = '+'.join(f"COUNTIF('{sh}'!{rg},\"?*\")" for rg, _ in CHECKS[sh])
        p = f'(({ok})/{tot})'
        W(s, f'E{r}', f'=IF(({tried})=0,"—",{p})', border=True, h='center', numfmt='0%', bold=True)
        W(s, f'F{r}', f'=IF(E{r}="—","⚪ не начато",IF(E{r}>=0.8,"🟢 Достиг",IF(E{r}>=0.5,"🟡 Частично","🔴 Не достиг")))', border=True, h='center')
        W(s, f'G{r}', f'=IF(OR(E{r}="—",LEFT(D{r},1)="—"),"",IF(VALUE(LEFT(D{r},1))=IF(E{r}>=0.8,3,IF(E{r}>=0.5,2,1)),"✔ оцениваю себя точно",'
                      f'IF(VALUE(LEFT(D{r},1))>IF(E{r}>=0.8,3,IF(E{r}>=0.5,2,1)),"↑ завышаю – проверь ошибки","↓ занижаю – я знаю больше!")))', border=True, size=9)
    else:
        W(s, f'E{r}', '—', border=True, h='center'); W(s, f'F{r}', '(без проверки)', border=True, h='center', size=9); W(s, f'G{r}', '', border=True)
    s.row_dimensions[r].height = 24
s.conditional_formatting.add('F17:F23', FormulaRule(formula=['LEFT(F17,1)="🟢"'], fill=fill(C['dgreen'])))
s.conditional_formatting.add('F17:F23', FormulaRule(formula=['LEFT(F17,1)="🟡"'], fill=fill('FFEB9C')))
s.conditional_formatting.add('F17:F23', FormulaRule(formula=['LEFT(F17,1)="🔴"'], fill=fill('FFC7CE')))
W(s, 'B24', 'Уровень: 🟢 80–100 % верных ответов · 🟡 50–79 % · 🔴 меньше 50 %.  Самооценка 3/2/1 сравнивается с уровнем 🟢/🟡/🔴.', italic=True, size=9, merge='G24')

# score table
W(s, 'I3', 'Оценка', bold=True, bg=C['navy'], color=C['white'], border=True, h='center')
W(s, 'J3', 'Верных ответов', bold=True, bg=C['navy'], color=C['white'], border=True, h='center')
for i, sc in enumerate(range(10, -1, -1)):
    r = 4 + i
    lo = math.ceil((sc - 0.5) * BASE / 10) if sc > 0 else 0
    hi = math.ceil((sc + 0.5) * BASE / 10) - 1 if sc < 10 else BASE + STAR
    W(s, f'I{r}', sc, border=True, h='center'); W(s, f'J{r}', f'{lo}–{hi}', border=True, h='center')
    s.conditional_formatting.add(f'I{r}:J{r}', FormulaRule(formula=[f'$C$8={sc}'], fill=fill(C['dgreen']), font=Font(bold=True)))

W(s, 'B26', 'Рефлексия: закончи фразу', bold=True, bg=C['navy'], color=C['white'], border=True, merge='G26')
for i, q in enumerate(['Сегодня я понял(а), что…', 'Труднее всего было…', 'Где в жизни пригодится ЕСЛИ:']):
    r = 27 + i
    W(s, f'B{r}', q, border=True, merge=f'C{r}'); W(s, f'D{r}', None, bg=C['yellow'], border=True, unlock=True, merge=f'G{r}')
    s.row_dimensions[r].height = 30
s.page_setup.orientation = 'landscape'; s.page_setup.fitToWidth = 1; s.page_setup.fitToHeight = 0
s.sheet_properties.pageSetUpPr.fitToPage = True

# =====================================================================  TEACHER PLAN
s = wb.create_sheet('План_урока'); s.sheet_view.showGridLines = False
for col, w in zip('ABCDEF', [3, 12, 24, 44, 44, 18]):
    s.column_dimensions[col].width = w
W(s, 'B1', 'План урока (для учителя)', bold=True, size=16, color=C['white'], bg=C['navy'], merge='F1'); s.row_dimensions[1].height = 30
rows = [('Тема', 'Логические функции ЕСЛИ(), И(), ИЛИ(), НЕ()'),
        ('Класс', '8 класс, 40 минут'),
        ('Цель обучения', '8.2.2.2 – использовать функции обработки логических операций (ЕСЛИ(), И(), ИЛИ(), НЕ()) в электронных таблицах'),
        ('Цели урока', 'Все: записывают условия с операторами сравнения и функцию ЕСЛИ.  Большинство: используют И, ИЛИ, НЕ и сочетают их с ЕСЛИ.  Некоторые: строят вложенные ЕСЛИ и учитывают граничные значения.'),
        ('Критерии оценивания', '1) записывает логические выражения с операторами сравнения;  2) применяет функцию ЕСЛИ для выбора значения;  3) применяет функции И, ИЛИ, НЕ;  4) комбинирует ЕСЛИ с логическими функциями.'),
        ('Оценивание', 'Автоматическое на листе «Итог»: оценка ФО из 10, уровень (🟢 достиг / 🟡 частично / 🔴 не достиг) по каждому критерию, сравнение с самооценкой ученика, число открытых подсказок. Формулы проверки скрыты, ответы не видны в строке формул.'),
        ('Пароль защиты листов', PWD + '  (защищены формулы проверки; жёлтые и голубые ячейки открыты для ввода)')]
r = 3
for k, v in rows:
    W(s, f'B{r}', k, bold=True, border=True, bg=C['light'], merge=f'C{r}')
    W(s, f'D{r}', v, border=True, merge=f'F{r}'); H(s, r, v, 100)
    r += 1
r += 1
for ref, t in zip('BCDEF', ['Время', 'Этап', 'Деятельность учителя', 'Деятельность учеников', 'Лист']):
    W(s, f'{ref}{r}', t, bold=True, bg=C['navy'], color=C['white'], border=True, h='center')
r += 1
plan = [('0–3 мин', 'Орг. момент, мотивация', 'Проблемный вопрос: «Как сделать, чтобы таблица САМА решала, сдал ученик зачёт или нет?» Называет цель урока и критерии.', 'Высказывают предположения, вписывают имя на листе «Теория».', 'Теория'),
        ('3–11 мин', 'Изучение нового', 'Объясняет разделы 1–5 листа «Теория» на проекторе. На каждом примере меняет жёлтую ячейку и просит предсказать результат. Особо разбирает раздел 4 «И или ИЛИ?» (скидка детям и пенсионерам).', 'Повторяют примеры у себя, «ломают» их, подбирая значения, при которых ответ меняется. Отмечают самооценку по теории.', 'Теория'),
        ('11–14 мин', 'Разминка', 'Разбирает с классом 1–2 частые ошибки (граница >=, порядок действий).', 'Предсказывают результат 10 формул; по ✔ / ✘ исправляют ошибки сами.', '1_Разминка'),
        ('14–20 мин', 'Практика: ЕСЛИ', 'Обращает внимание на граничные значения 50 и 90. Слабым – вопрос-ключ.', 'Пишут формулу в первой строке и протягивают вниз; ★ – комментарий с пустой строкой.', '2_ЕСЛИ'),
        ('20–26 мин', 'Практика: И, ИЛИ, НЕ', 'Связывает таблицу истинности с жизненными примерами.', 'Заполняют таблицу истинности и таблицу олимпиады.', '3_И_ИЛИ_НЕ'),
        ('26–32 мин', 'Применение', 'Индивидуальная помощь; сильным – лист 5★.', 'Решают задачу «Кинотеатр» (ЕСЛИ + И/ИЛИ/НЕ); быстрые – вложенные ЕСЛИ.', '4 и 5★'),
        ('32–37 мин', 'Итоговый тест', 'Следит, чтобы тест решали самостоятельно, без подсчёта в Excel.', 'Отвечают на 10 вопросов с выбором ответа.', '6_Тест'),
        ('37–40 мин', 'Итог, рефлексия', 'Смотрит лист «Итог»: оценку, уровень по каждому критерию, совпадение самооценки с результатом. Обсуждает с 2–3 учениками, где самооценка «↑ завышена».', 'В конце каждого листа отмечают самооценку, заканчивают фразы рефлексии, показывают результат учителю.', 'Итог')]
for row in plan:
    for ref, t in zip('BCDEF', row):
        W(s, f'{ref}{r}', t, border=True, v='top', bold=(ref == 'B'))
    H(s, r, max(row[2], row[3], key=len), 40)
    r += 1
r += 1
W(s, f'B{r}', 'Термины (рус / қаз / eng)', bold=True, bg=C['navy'], color=C['white'], border=True, merge=f'F{r}'); r += 1
for a, b, c in [('условие', 'шарт', 'condition'), ('логическое выражение', 'логикалық өрнек', 'logical expression'),
                ('истина / ложь', 'ақиқат / жалған', 'true / false'), ('аргумент функции', 'функция аргументі', 'function argument'),
                ('вложенная функция', 'кірістірілген функция', 'nested function')]:
    W(s, f'B{r}', a, border=True, merge=f'C{r}'); W(s, f'D{r}', b, border=True); W(s, f'E{r}', c, border=True); r += 1

# =====================================================================  PROTECTION
for sh in wb.worksheets:
    sh.protection.sheet = True
    sh.protection.password = PWD
    sh.protection.formatColumns = False
    sh.protection.formatRows = False
wb.active = 0
wb.save(OUT)
print('base', BASE, 'star', STAR, 'hints', len(HINTS))
