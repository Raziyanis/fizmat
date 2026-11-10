"""Генератор практической работы 8.2.2.1 «Проект: Новый школьный двор».

Создаёт два файла:
  practical_work_student.xlsx – для учащихся (защищённые листы, автопроверка);
  practical_work_teacher_key.xlsx – ключ для учителя (все формулы заполнены).
Запуск: python3 build.py
"""
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Protection, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule

PASSWORD = "8221"

YELLOW = PatternFill("solid", fgColor="FFF2A8")
HEAD = PatternFill("solid", fgColor="1F4E78")
DATA = PatternFill("solid", fgColor="EAF1FB")
STAR = PatternFill("solid", fgColor="FCE4D6")
GREEN = PatternFill("solid", fgColor="C6EFCE")
RED = PatternFill("solid", fgColor="FFC7CE")
ORANGE = PatternFill("solid", fgColor="FFE699")
thin = Side(style="thin", color="9BB0C8")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WHITE_B = Font(bold=True, color="FFFFFF")
TITLE = Font(bold=True, size=16, color="1F4E78")
SUB = Font(italic=True, size=11, color="404040")
WRAP = Alignment(wrap_text=True, vertical="center")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
MONEY = '#,##0" тг"'

CHECK_CELLS = []  # (sheet, cell) – для подсчёта баллов
HINT_CELLS = []   # (sheet, cell) – для подсчёта открытых подсказок
BLUE = PatternFill("solid", fgColor="DDEBF7")
HINT_FILL = PatternFill("solid", fgColor="F2F2F2")
LOCKED_MSG = "🔒 Ответьте на вопрос слева"


def check_formula(cell, expected, tol="0.01"):
    """Формула проверки: формула есть + значение верное."""
    return (f'=IF({cell}="","",IFERROR(IF(NOT(_xlfn.ISFORMULA({cell})),"⚠ нужна формула",'
            f'IF(ABS({cell}-({expected}))<{tol},"✔","✘")),"✘"))')


def text_check(cell, answer):
    return f'=IF({cell}="","",IF(LOWER(TRIM({cell}))="{answer}","✔","✘"))'


def xl_str(text):
    """Строка для вставки в формулу Excel (кавычки удваиваются)."""
    return '"' + text.replace('"', '""') + '"'


def hint(ws, row, question, answers, formula_text, teacher, col="I"):
    """Вопрос-ключ (col), ответ ученика (col+1), подсказка-формула (col+2).
    Подсказка открывается только после верного ответа на вопрос."""
    from openpyxl.utils import column_index_from_string, get_column_letter
    ci = column_index_from_string(col)
    q, a, h = (f"{get_column_letter(ci + k)}{row}" for k in range(3))
    put(ws, q, question, BLUE)
    c = put(ws, a, answers[0] if teacher else None, BLUE, bold=True, align=CENTER)
    c.protection = Protection(locked=False)
    ok = ",".join(f'LOWER(TRIM({a}&""))={xl_str(x.lower())}' for x in answers)
    c = put(ws, h, f'=IF({a}="",{xl_str(LOCKED_MSG)},IF(OR({ok}),{xl_str(formula_text)},'
                   f'"✘ Неверно – подумайте ещё"))', HINT_FILL)
    c.font = Font(bold=True, color="1F4E78")
    c.protection = Protection(locked=True, hidden=not teacher)
    HINT_CELLS.append((ws.title, h))


def hint_header(ws, row, col="I"):
    from openpyxl.utils import column_index_from_string
    header(ws, row, ["Вопрос-ключ к подсказке", "Ответ", "Подсказка: математическая формула"], column_index_from_string(col))


def header(ws, row, titles, col0=1):
    for i, t in enumerate(titles):
        c = ws.cell(row=row, column=col0 + i, value=t)
        c.fill, c.font, c.alignment, c.border = HEAD, WHITE_B, CENTER, BOX


def put(ws, ref, value, fill=None, fmt=None, bold=False, align=WRAP):
    c = ws[ref]
    c.value = value
    if fill:
        c.fill = fill
    if fmt:
        c.number_format = fmt
    if bold:
        c.font = Font(bold=True)
    c.alignment = align
    c.border = BOX
    return c


def answer(ws, ref, key, teacher, fmt=None):
    """Жёлтая ячейка для ответа ученика."""
    c = put(ws, ref, key if teacher else None, YELLOW, fmt, bold=True, align=CENTER)
    c.protection = Protection(locked=False)


def check(ws, ref, formula, teacher):
    c = put(ws, ref, formula, align=CENTER)
    c.font = Font(bold=True, size=12)
    c.protection = Protection(locked=True, hidden=not teacher)
    CHECK_CELLS.append((ws.title, ref))


def colour_checks(ws, rng):
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"✔"'], fill=GREEN))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"✘"'], fill=RED))
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT({rng.split(":")[0]},1)="⚠"'], fill=ORANGE))


def widths(ws, w):
    for col, width in w.items():
        ws.column_dimensions[col].width = width


def protect(ws, teacher):
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    if not teacher:
        ws.protection.sheet = True
        ws.protection.password = PASSWORD
        ws.protection.formatColumns = False


# ---------------------------------------------------------------- Инструкция
def sheet_intro(wb, teacher):
    ws = wb.active
    ws.title = "Инструкция"
    widths(ws, {"A": 3, "B": 30, "C": 85})
    ws["B1"] = "Практическая работа «Проект: Новый школьный двор»"
    ws["B1"].font = TITLE
    ws["B2"] = "8 класс · ЦО 8.2.2.1 – использовать математические функции СУММ, ABS, КОРЕНЬ, СТЕПЕНЬ, СУММЕСЛИ · 30 минут"
    ws["B2"].font = SUB

    put(ws, "B4", "Фамилия, имя:", bold=True)
    answer(ws, "C4", "Образец ключа" if teacher else None, teacher)
    put(ws, "B5", "Класс:", bold=True)
    answer(ws, "C5", None, teacher)

    story = ("Школьный парламент выиграл грант 4 000 000 тг на благоустройство школьного двора. "
             "Вы – команда проектировщиков. Нужно рассчитать размеры клумб и площадок, составить смету "
             "и проверить, укладывается ли проект в бюджет. Все расчёты – только формулами!")
    ws.merge_cells("B7:C7")
    put(ws, "B7", story)
    ws.row_dimensions[7].height = 48

    header(ws, 9, ["Этап", "Что сделать"], col0=2)
    steps = [
        ("Лист 1_Площадки (≈8 мин)", "Найти стороны клумб, площади площадок, объём ящика – функции КОРЕНЬ и СТЕПЕНЬ."),
        ("Лист 2_Смета (≈12 мин)", "Посчитать стоимость каждой покупки, итог сметы (СУММ) и расходы по категориям (СУММЕСЛИ)."),
        ("Лист 3_Бюджет (≈8 мин)", "Сравнить смету с бюджетом и лимитами – функция ABS. Ответить на вопросы."),
        ("Лист Итог (≈2 мин)", "Посмотреть свой результат. Показать учителю."),
    ]
    for i, (a, b) in enumerate(steps, start=10):
        put(ws, f"B{i}", a, DATA, bold=True)
        put(ws, f"C{i}", b)

    header(ws, 15, ["Функция", "Запись и пример"], col0=2)
    syntax = [
        ("СУММ", "Запись: =СУММ(диапазон)   пример: =СУММ(A1:A10)"),
        ("ABS (модуль)", "Запись: =ABS(число)   пример: =ABS(-15) → 15"),
        ("КОРЕНЬ", "Запись: =КОРЕНЬ(число)   пример: =КОРЕНЬ(81) → 9"),
        ("СТЕПЕНЬ", "Запись: =СТЕПЕНЬ(число; показатель)   пример: =СТЕПЕНЬ(2;3) → 8;  =СТЕПЕНЬ(27;1/3) → 3"),
        ("СУММЕСЛИ", "Запись: =СУММЕСЛИ(где_искать; условие; что_суммировать)   пример: =СУММЕСЛИ(C2:C9;\"Спорт\";G2:G9)"),
    ]
    for i, (a, b) in enumerate(syntax, start=16):
        put(ws, f"B{i}", a, DATA, bold=True)
        put(ws, f"C{i}", b)

    header(ws, 22, ["Обозначение", "Значение"], col0=2)
    legend = [
        (YELLOW, "Жёлтая ячейка – сюда вводите формулу"),
        (GREEN, "✔ – верно"),
        (RED, "✘ – ошибка, проверьте формулу"),
        (ORANGE, "⚠ нужна формула – вы ввели число вручную, а нужна формула"),
        (STAR, "★ – задание повышенной сложности"),
        (BLUE, "Голубая ячейка – вопрос-ключ: ответьте верно, и справа откроется математическая формула (запись на Excel составьте сами) (учитель видит, сколько подсказок открыто)"),
    ]
    for i, (f, t) in enumerate(legend, start=23):
        put(ws, f"B{i}", "", f)
        put(ws, f"C{i}", t)
    put(ws, "B30", "Совет: в формулах используйте ссылки на ячейки, а не числа. "
                   "Для копирования формулы тяните маркер заполнения вниз.")
    ws.merge_cells("B30:C30")
    ws.row_dimensions[30].height = 32
    protect(ws, teacher)


# ---------------------------------------------------------------- Лист 1
def sheet1(wb, teacher):
    ws = wb.create_sheet("1_Площадки")
    widths(ws, {"A": 5, "B": 30, "C": 11, "D": 20, "E": 11, "F": 16, "G": 14, "H": 16, "I": 34, "J": 9, "K": 42})
    ws["A1"] = "Этап 1. Геометрия двора: КОРЕНЬ и СТЕПЕНЬ"
    ws["A1"].font = TITLE
    ws["A2"] = "Введите формулу в столбец G. Застряли? Ответьте на вопрос-ключ в голубой ячейке – откроется математическая формула-подсказка."
    ws["A2"].font = SUB
    header(ws, 4, ["№", "Объект", "Форма", "Что известно", "Значение", "Что найти", "Ответ", "Проверка"])
    hint_header(ws, 4)
    rows = [
        ("Клумба «Солнце»", "квадрат", "площадь, м²", 49, "сторона, м", "SQRT(E{r})",
         ("Сколько ячеек в диапазоне A1:A5?", ["5"], "Сторона квадрата:  a = √S")),
        ("Клумба «Радуга»", "квадрат", "площадь, м²", 30.25, "сторона, м", "SQRT(E{r})",
         ("Сколько ячеек в диапазоне A1:C2?", ["6"], "Сторона квадрата:  a = √S")),
        ("Площадка для настольного тенниса", "квадрат", "сторона, м", 12, "площадь, м²", "POWER(E{r},2)",
         ("Сколько ячеек в диапазоне B2:D5?", ["12"], "Площадь квадрата:  S = a²")),
        ("Воркаут-площадка", "квадрат", "сторона, м", 9.5, "площадь, м²", "POWER(E{r},2)",
         ("Адрес ячейки на пересечении столбца D и строки 7?", ["d7", "д7"], "Площадь квадрата:  S = a²")),
        ("Ящик для рассады", "куб", "ребро, м", 1.2, "объём, м³", "POWER(E{r},3)",
         ("Какой знак разделяет аргументы функции: СТЕПЕНЬ(2 ? 3)?", [";"], "Объём куба:  V = a³")),
        ("★ Компостер", "куб", "объём, м³", 0.512, "ребро, м", "POWER(E{r},1/3)",
         ("Каким знаком в Excel записывают возведение в степень (без функции)?", ["^"], "Ребро куба:  a = ∛V = V^(1/3)")),
    ]
    for i, (obj, form, known, val, find, f, (q, ans, htext)) in enumerate(rows, start=5):
        fill = STAR if obj.startswith("★") else DATA
        put(ws, f"A{i}", i - 4, fill, align=CENTER)
        put(ws, f"B{i}", obj, fill)
        put(ws, f"C{i}", form, fill, align=CENTER)
        put(ws, f"D{i}", known, fill)
        put(ws, f"E{i}", val, fill, align=CENTER)
        put(ws, f"F{i}", find, fill)
        expr = f.format(r=i)
        answer(ws, f"G{i}", "=" + expr, teacher, "0.###")
        check(ws, f"H{i}", check_formula(f"G{i}", expr), teacher)
        hint(ws, i, q, ans, htext.format(r=i), teacher)

    ws["A12"] = "Диагональная дорожка через прямоугольный двор (по диагонали из угла в угол)"
    ws["A12"].font = Font(bold=True, color="1F4E78")
    put(ws, "B13", "Длина двора, м", DATA)
    put(ws, "E13", 48, DATA, align=CENTER)
    put(ws, "B14", "Ширина двора, м", DATA)
    put(ws, "E14", 36, DATA, align=CENTER)
    put(ws, "B15", "Длина дорожки, м", DATA, bold=True)
    answer(ws, "G15", "=SQRT(POWER(E13,2)+POWER(E14,2))", teacher, "0.##")
    check(ws, "H15", check_formula("G15", "SQRT(E13^2+E14^2)"), teacher)
    hint(ws, 15, "Какое число будет в ячейке с формулой =2+3*2?", ["8"], "Теорема Пифагора:  d = √(a² + b²)", teacher)
    colour_checks(ws, "H5:H15")
    protect(ws, teacher)


# ---------------------------------------------------------------- Лист 2
ITEMS = [
    ("Саженцы туи", "Озеленение", "шт", 20, 3500),
    ("Семена газонной травы", "Озеленение", "кг", 15, 2800),
    ("Рассада цветов для клумб", "Озеленение", "шт", 120, 450),
    ("Бордюр для клумб", "Озеленение", "м", 50, 1200),
    ("Резиновое покрытие площадок", "Спорт", "м²", 234.25, 9000),
    ("Теннисный стол уличный", "Спорт", "шт", 2, 185000),
    ("Воркаут-комплекс", "Спорт", "шт", 1, 420000),
    ("Бетон для установки тренажёров", "Спорт", "м³", 1.5, 28000),
    ("Тротуарная плитка для дорожки", "Дорожки", "м²", 90, 4200),
    ("Бордюр дорожный", "Дорожки", "м", 120, 1500),
    ("Фонарь на солнечной батарее", "Освещение", "шт", 16, 18500),
    ("LED-прожектор для площадки", "Освещение", "шт", 4, 32000),
]
CATS = ["Озеленение", "Спорт", "Дорожки", "Освещение"]
FIRST, LAST = 5, 5 + len(ITEMS) - 1  # 5..16


def sheet2(wb, teacher):
    ws = wb.create_sheet("2_Смета")
    widths(ws, {"A": 5, "B": 34, "C": 16, "D": 13, "E": 10, "F": 13, "G": 17, "H": 16, "I": 34, "J": 9, "K": 46})
    ws["A1"] = "Этап 2. Смета проекта: СУММ и СУММЕСЛИ"
    ws["A1"].font = TITLE
    ws["A2"] = "Количество материалов взято из расчётов этапа 1. Цены – от поставщика."
    ws["A2"].font = SUB
    header(ws, 4, ["№", "Наименование", "Категория", "Ед. изм.", "Кол-во", "Цена, тг", "Стоимость, тг", "Проверка"])
    hint_header(ws, 4)
    hint(ws, FIRST, "Каким знаком в Excel обозначается умножение?", ["*"],
         "Стоимость = Количество × Цена", teacher)
    rng_c, rng_e, rng_f = f"$C${FIRST}:$C${LAST}", f"$E${FIRST}:$E${LAST}", f"$F${FIRST}:$F${LAST}"
    for i, (name, cat, unit, qty, price) in enumerate(ITEMS, start=FIRST):
        put(ws, f"A{i}", i - FIRST + 1, DATA, align=CENTER)
        put(ws, f"B{i}", name, DATA)
        put(ws, f"C{i}", cat, DATA, align=CENTER)
        put(ws, f"D{i}", unit, DATA, align=CENTER)
        put(ws, f"E{i}", qty, DATA, align=CENTER)
        put(ws, f"F{i}", price, DATA, MONEY)
        answer(ws, f"G{i}", f"=E{i}*F{i}", teacher, MONEY)
        check(ws, f"H{i}", check_formula(f"G{i}", f"E{i}*F{i}"), teacher)
    t = LAST + 1  # 17
    put(ws, f"B{t}", "ИТОГО по смете (СУММ)", bold=True)
    answer(ws, f"G{t}", f"=SUM(G{FIRST}:G{LAST})", teacher, MONEY)
    check(ws, f"H{t}", check_formula(f"G{t}", f"SUMPRODUCT({rng_e},{rng_f})"), teacher)
    hint(ws, t, "Сколько ячеек в диапазоне G5:G16?", ["12"],
         "Итог = S₁ + S₂ + … + S₁₂  (сумма всех стоимостей)", teacher)

    s = t + 3  # 20
    ws[f"A{s-1}"] = "Расходы по категориям – используйте СУММЕСЛИ (условие – ссылка на ячейку в столбце B)"
    ws[f"A{s-1}"].font = Font(bold=True, color="1F4E78")
    header(ws, s, ["Категория", "Сумма, тг", "Проверка"], col0=2)
    hint_header(ws, s)
    hint(ws, s + 1, "Какой знак делает ссылку абсолютной (A1 → $A$1)?", ["$"],
         "Сумма категории = Σ стоимостей тех строк, где Категория = нужной", teacher)
    for k, cat in enumerate(CATS, start=s + 1):  # 21..24
        put(ws, f"B{k}", cat, DATA, bold=True)
        answer(ws, f"C{k}", f"=SUMIF(${'C'}${FIRST}:$C${LAST},B{k},$G${FIRST}:$G${LAST})", teacher, MONEY)
        check(ws, f"D{k}", check_formula(f"C{k}", f"SUMPRODUCT(({rng_c}=B{k})*{rng_e}*{rng_f})"), teacher)
    star = s + 6  # 26
    put(ws, f"B{star}", "★ Сумма всех покупок дороже 100 000 тг", STAR, bold=True)
    answer(ws, f"C{star}", f'=SUMIF(G{FIRST}:G{LAST},">100000")', teacher, MONEY)
    check(ws, f"D{star}", check_formula(f"C{star}", f"SUMPRODUCT(({rng_e}*{rng_f}>100000)*{rng_e}*{rng_f})"), teacher)
    hint(ws, star, "Какой знак ставится между первой и последней ячейкой диапазона (A1 ? A9)?", [":"],
         "Σ стоимостей только тех покупок, где Стоимость > 100 000", teacher)
    colour_checks(ws, f"H{FIRST}:H{t}")
    colour_checks(ws, f"D{s+1}:D{star}")
    protect(ws, teacher)
    return t, s + 1


# ---------------------------------------------------------------- Лист 3
LIMITS = [300000, 2700000, 600000, 400000]


def sheet3(wb, teacher, total_row, cat_row):
    ws = wb.create_sheet("3_Бюджет")
    widths(ws, {"A": 3, "B": 40, "C": 18, "D": 18, "E": 20, "F": 14, "G": 20, "H": 14, "I": 34, "J": 9, "K": 40})
    ws["B1"] = "Этап 3. Укладываемся в бюджет? Функция ABS"
    ws["B1"].font = TITLE
    ws["B2"] = "Отклонение может быть отрицательным (экономия) или положительным (перерасход). ABS показывает его размер."
    ws["B2"].font = SUB
    put(ws, "B4", "Бюджет проекта (грант)", DATA, bold=True)
    put(ws, "C4", 4000000, DATA, MONEY)
    put(ws, "B5", "Итог сметы (берётся с листа 2)", DATA, bold=True)
    put(ws, "C5", f"='2_Смета'!G{total_row}", DATA, MONEY)
    put(ws, "B6", "Разница: Бюджет − Смета")
    answer(ws, "C6", "=C4-C5", teacher, MONEY)
    check(ws, "D6", check_formula("C6", "C4-C5"), teacher)
    put(ws, "B7", "Отклонение от бюджета по модулю (ABS)")
    answer(ws, "C7", "=ABS(C6)", teacher, MONEY)
    check(ws, "D7", check_formula("C7", "ABS(C4-C5)"), teacher)
    hint_header(ws, 5)
    hint(ws, 6, "Сколько строк в диапазоне A3:A10?", ["8"], "Разница = Бюджет − Смета", teacher)
    hint(ws, 7, "Сколько столбцов в диапазоне A1:F1?", ["6"], "Отклонение = |Разница|   (модуль: |−a| = a)", teacher)

    ws["B9"] = "Лимиты по категориям, утверждённые школьным парламентом"
    ws["B9"].font = Font(bold=True, color="1F4E78")
    header(ws, 10, ["Категория", "Лимит, тг", "Факт (лист 2), тг", "Отклонение (Факт − Лимит)",
                    "Проверка", "Модуль отклонения (ABS)", "Проверка"], col0=2)
    for j, (cat, lim) in enumerate(zip(CATS, LIMITS)):
        r = 11 + j
        put(ws, f"B{r}", cat, DATA, bold=True)
        put(ws, f"C{r}", lim, DATA, MONEY)
        put(ws, f"D{r}", f"='2_Смета'!C{cat_row + j}", DATA, MONEY)
        answer(ws, f"E{r}", f"=D{r}-C{r}", teacher, MONEY)
        check(ws, f"F{r}", check_formula(f"E{r}", f"D{r}-C{r}"), teacher)
        answer(ws, f"G{r}", f"=ABS(E{r})", teacher, MONEY)
        check(ws, f"H{r}", check_formula(f"G{r}", f"ABS(D{r}-C{r})"), teacher)
    hint_header(ws, 10)
    hint(ws, 11, "Как называется ссылка вида A1, которая меняется при копировании? (одно слово)", ["относительная"], "Отклонение = Факт − Лимит", teacher)
    hint(ws, 12, "Как называется ссылка вида $A$1? (одно слово)", ["абсолютная"], "Модуль отклонения = |Факт − Лимит|", teacher)
    put(ws, "B15", "Сумма модулей отклонений (СУММ)", bold=True)
    answer(ws, "G15", "=SUM(G11:G14)", teacher, MONEY)
    check(ws, "H15", check_formula("G15", "SUMPRODUCT(ABS(D11:D14-C11:C14))"), teacher)
    hint(ws, 15, "Сколько ячеек в диапазоне A1:D10?", ["40"], "Σ = |x₁| + |x₂| + |x₃| + |x₄|", teacher)

    ws["B17"] = "Вопросы (ответ – одним словом)"
    ws["B17"].font = Font(bold=True, color="1F4E78")
    put(ws, "B18", "Хватает ли гранта на весь проект? (да / нет)")
    answer(ws, "C18", "нет", teacher)
    check(ws, "D18", text_check("C18", "нет"), teacher)
    put(ws, "B19", "★ В какой категории перерасход больше всего?", STAR)
    answer(ws, "C19", "Спорт", teacher)
    check(ws, "D19", text_check("C19", "спорт"), teacher)
    put(ws, "B21", "★ Предложите, что можно сократить, чтобы уложиться в грант (свободный ответ):", STAR)
    ws.merge_cells("C21:K21")
    answer(ws, "C21", "Например: уменьшить площадь резинового покрытия на ~17 м² (148 250 / 9 000)" if teacher else None, teacher)
    ws.row_dimensions[21].height = 36
    for rng in ("D6:D7", "F11:F14", "H11:H15", "D18:D19"):
        colour_checks(ws, rng)
    protect(ws, teacher)


# ---------------------------------------------------------------- Итог
def sheet_result(wb, teacher):
    ws = wb.create_sheet("Итог")
    widths(ws, {"A": 3, "B": 34, "C": 30})
    ws["B1"] = "Мой результат"
    ws["B1"].font = TITLE
    total = len(CHECK_CELLS)
    parts = "+".join(f"COUNTIF('{s}'!{c},\"✔\")" for s, c in CHECK_CELLS)
    put(ws, "B3", "Фамилия, имя", DATA, bold=True)
    put(ws, "C3", "=IF(Инструкция!C4=\"\",\"(заполните на листе Инструкция)\",Инструкция!C4)")
    put(ws, "B4", "Верных ответов", DATA, bold=True)
    put(ws, "C4", f"={parts}", align=CENTER).font = Font(bold=True, size=14)
    put(ws, "B5", "Всего заданий", DATA, bold=True)
    put(ws, "C5", total, align=CENTER)
    put(ws, "B6", "Процент выполнения", DATA, bold=True)
    put(ws, "C6", "=C4/C5", fmt="0%", align=CENTER).font = Font(bold=True, size=14)
    put(ws, "B7", "Прогресс", DATA, bold=True)
    c = put(ws, "C7", '=REPT("█",ROUND(C6*20,0))&REPT("░",20-ROUND(C6*20,0))')
    c.font = Font(color="2E7D32", size=12)
    put(ws, "B8", "Уровень", DATA, bold=True)
    put(ws, "C8", '=IF(C6>=0.85,"Высокий 🏆",IF(C6>=0.6,"Достаточный 👍",IF(C6>=0.3,"Средний – доработайте ✘",'
                  '"Начальный – обратитесь к учителю")))', align=CENTER).font = Font(bold=True, size=12)
    put(ws, "B9", "Открыто подсказок", DATA, bold=True)
    opened = "+".join(f"IF(OR(LEFT('{s}'!{c},1)=\"🔒\",LEFT('{s}'!{c},1)=\"✘\"),0,1)" for s, c in HINT_CELLS)
    put(ws, "C9", f'=({opened})&" из {len(HINT_CELLS)}"', align=CENTER)
    ws["B10"] = "Ошибки (✘) по листам:"
    ws["B10"].font = Font(bold=True)
    for k, sheet in enumerate(["1_Площадки", "2_Смета", "3_Бюджет"], start=11):
        cells = [c for s, c in CHECK_CELLS if s == sheet]
        f = "+".join(f"COUNTIF('{sheet}'!{c},\"✘\")+COUNTIF('{sheet}'!{c},\"⚠*\")" for c in cells)
        put(ws, f"B{k}", sheet, DATA)
        put(ws, f"C{k}", f"={f}", align=CENTER)
    protect(ws, teacher)


def build(teacher):
    CHECK_CELLS.clear()
    HINT_CELLS.clear()
    wb = Workbook()
    sheet_intro(wb, teacher)
    sheet1(wb, teacher)
    total_row, cat_row = sheet2(wb, teacher)
    sheet3(wb, teacher, total_row, cat_row)
    sheet_result(wb, teacher)
    wb.calculation.fullCalcOnLoad = True
    name = "practical_work_teacher_key.xlsx" if teacher else "practical_work_student.xlsx"
    wb.save(name)
    print(name, "проверяемых ячеек:", len(CHECK_CELLS))


if __name__ == "__main__":
    build(teacher=False)
    build(teacher=True)
