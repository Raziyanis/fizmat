"""Генератор практической работы 8.2.2.1 «Проект: Новый школьный двор».

Создаёт два файла:
  practical_work_student.xlsx – для учащихся (защищённые листы, автопроверка);
  practical_work_teacher_key.xlsx – ключ для учителя (все формулы заполнены).
Запуск: python3 build.py
"""
import math

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Protection, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule

PASSWORD = "8221"

# ---------------------------------------------------------------- язык
import re

LANG = "ru"          # "ru" или "kz"
SEEN = set()         # все строки, прошедшие через tr() (для контроля перевода)
CYR = re.compile("[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]")


def tr(text):
    """Перевод строки интерфейса на текущий язык. Строки без кириллицы не переводятся."""
    if not isinstance(text, str) or not CYR.search(text):
        return text
    SEEN.add(text)
    if LANG == "ru":
        return text
    from kz_strings import KZ
    if text in KZ.values():  # уже переведено
        return text
    if text not in KZ:
        raise KeyError(f"Нет казахского перевода: {text!r}")
    return KZ[text]

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
    return (f'=IF({cell}="","",IFERROR(IF(NOT(_xlfn.ISFORMULA({cell})),{xl_str(tr("⚠ нужна формула"))},'
            f'IF(ABS({cell}-({expected}))<{tol},"✔","✘")),"✘"))')


def text_check(cell, answer):
    return f'=IF({cell}="","",IF(LOWER(TRIM({cell}))={xl_str(tr(answer))},"✔","✘"))'


def xl_str(text):
    """Строка для вставки в формулу Excel (кавычки удваиваются)."""
    return '"' + text.replace('"', '""') + '"'


def hint(ws, row, question, answers, formula_text, teacher, col="I"):
    """Вопрос-ключ (col), ответ ученика (col+1), подсказка-формула (col+2).
    Подсказка открывается только после верного ответа на вопрос."""
    from openpyxl.utils import column_index_from_string, get_column_letter
    ci = column_index_from_string(col)
    q, a, h = (f"{get_column_letter(ci + k)}{row}" for k in range(3))
    answers = [tr(x) for x in answers]
    put(ws, q, question, BLUE)
    c = put(ws, a, answers[0] if teacher else None, BLUE, bold=True, align=CENTER)
    c.protection = Protection(locked=False)
    ok = ",".join(f'LOWER(TRIM({a}&""))={xl_str(x.lower())}' for x in answers)
    c = put(ws, h, f'=IF({a}="",{xl_str(tr(LOCKED_MSG))},IF(OR({ok}),{xl_str(tr(formula_text))},'
                   f'{xl_str(tr("✘ Неверно – подумайте ещё"))}))', HINT_FILL)
    c.font = Font(bold=True, color="1F4E78")
    c.protection = Protection(locked=True, hidden=not teacher)
    HINT_CELLS.append((ws.title, h))


def hint_header(ws, row, col="I"):
    from openpyxl.utils import column_index_from_string
    header(ws, row, ["Вопрос-ключ к подсказке", "Ответ", "Подсказка: математическая формула"], column_index_from_string(col))


def header(ws, row, titles, col0=1):
    for i, t in enumerate(titles):
        c = ws.cell(row=row, column=col0 + i, value=tr(t))
        c.fill, c.font, c.alignment, c.border = HEAD, WHITE_B, CENTER, BOX


def put(ws, ref, value, fill=None, fmt=None, bold=False, align=WRAP):
    c = ws[ref]
    c.value = value if isinstance(value, str) and value.startswith("=") else tr(value)
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
    ws.title = tr("Инструкция")
    widths(ws, {"A": 3, "B": 30, "C": 85})
    ws["B1"] = tr("Практическая работа «Проект: Новый школьный двор»")
    ws["B1"].font = TITLE
    ws["B2"] = tr("8 класс · ЦО 8.2.2.1 – использовать математические функции СУММ, ABS, КОРЕНЬ, СТЕПЕНЬ, СУММЕСЛИ · 30 минут")
    ws["B2"].font = SUB

    put(ws, "B4", "Фамилия, имя:", bold=True)
    answer(ws, "C4", "Образец ключа" if teacher else None, teacher)
    put(ws, "B5", "Класс:", bold=True)
    answer(ws, "C5", None, teacher)

    story = ("Школьный парламент выиграл грант 4 000 000 тг на благоустройство школьного двора. "
             "Вы – команда проектировщиков: составьте смету, сравните её с грантом, проверьте размеры "
             "клумб и площадок и решите, на чём сэкономить. Все расчёты – только формулами!")
    ws.merge_cells("B7:C7")
    put(ws, "B7", story)
    ws.row_dimensions[7].height = 48

    header(ws, 9, ["Этап", "Что сделать"], col0=2)
    steps = [
        ("1_СУММ (≈7 мин)", "Стоимость каждой покупки и итог сметы."),
        ("2_ABS (≈6 мин)", "Сравнить смету с грантом; на сколько изменились цены поставщика."),
        ("3_КОРЕНЬ (≈5 мин)", "Стороны квадратных клумб по их площади; ★ длина бордюра."),
        ("4_СТЕПЕНЬ (≈6 мин)", "Площади площадок, объём ящика, ★ ребро куба, диагональная дорожка."),
        ("5_СУММЕСЛИ (≈6 мин)", "Расходы по категориям и по условию; вывод – на чём сэкономить."),
        ("Итог", "Посмотреть свой результат. Показать учителю."),
    ]
    for i, (a, b) in enumerate(steps, start=10):
        put(ws, f"B{i}", a, DATA, bold=True)
        put(ws, f"C{i}", b)

    header(ws, 17, ["Функция", "Запись и пример"], col0=2)
    syntax = [
        ("СУММ", "Запись: =СУММ(диапазон)   пример: =СУММ(A1:A10)"),
        ("ABS (модуль)", "Запись: =ABS(число)   пример: =ABS(-15) → 15"),
        ("КОРЕНЬ", "Запись: =КОРЕНЬ(число)   пример: =КОРЕНЬ(81) → 9"),
        ("СТЕПЕНЬ", "Запись: =СТЕПЕНЬ(число; показатель)   пример: =СТЕПЕНЬ(2;3) → 8;  =СТЕПЕНЬ(27;1/3) → 3"),
        ("СУММЕСЛИ", "Запись: =СУММЕСЛИ(где_искать; условие; что_суммировать)   пример: =СУММЕСЛИ(C2:C9;\"Спорт\";G2:G9)"),
    ]
    for i, (a, b) in enumerate(syntax, start=18):
        put(ws, f"B{i}", a, DATA, bold=True)
        put(ws, f"C{i}", b)

    header(ws, 24, ["Обозначение", "Значение"], col0=2)
    legend = [
        (YELLOW, "Жёлтая ячейка – сюда вводите формулу"),
        (GREEN, "✔ – верно"),
        (RED, "✘ – ошибка, проверьте формулу"),
        (ORANGE, "⚠ нужна формула – вы ввели число вручную, а нужна формула"),
        (STAR, "★ – задание повышенной сложности"),
        (BLUE, "Голубая ячейка – вопрос-ключ: ответьте верно, и справа откроется математическая формула (запись на Excel составьте сами) (учитель видит, сколько подсказок открыто)"),
    ]
    for i, (f, t) in enumerate(legend, start=25):
        put(ws, f"B{i}", "", f)
        put(ws, f"C{i}", t)
    put(ws, "B32", "Совет: в формулах используйте ссылки на ячейки, а не числа. "
                   "Для копирования формулы тяните маркер заполнения вниз.")
    ws.merge_cells("B32:C32")
    ws.row_dimensions[32].height = 32
    protect(ws, teacher)


# ---------------------------------------------------------------- данные сметы
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
TOTAL_ROW = LAST + 1                 # 17
S1, S2, S3, S4, S5 = "1_СУММ", "2_ABS", "3_КОРЕНЬ", "4_СТЕПЕНЬ", "5_СУММЕСЛИ"
SHEETS = [S1, S2, S3, S4, S5]
HINT_W = {"I": 36, "J": 11, "K": 44}


def title(ws, text, sub, col="A"):
    ws[f"{col}1"] = tr(text)
    ws[f"{col}1"].font = TITLE
    ws[f"{col}2"] = tr(sub)
    ws[f"{col}2"].font = SUB


def section(ws, ref, text):
    ws[ref] = tr(text)
    ws[ref].font = Font(bold=True, color="1F4E78")


# ---------------------------------------------------------------- 1. СУММ
def sheet_sum(wb, teacher):
    ws = wb.create_sheet(tr(S1))
    widths(ws, {"A": 5, "B": 40, "C": 14, "D": 9, "E": 9, "F": 13, "G": 17, "H": 16, **HINT_W})
    title(ws, "Этап 1. Смета проекта – функция СУММ",
          "Посчитайте стоимость каждой покупки и общий итог. Застряли? Ответьте на вопрос-ключ – откроется формула-подсказка.")
    header(ws, 4, ["№", "Наименование", "Категория", "Ед. изм.", "Кол-во", "Цена, тг", "Стоимость, тг", "Проверка"])
    hint_header(ws, 4)
    for i, (name, cat, unit, qty, price) in enumerate(ITEMS, start=FIRST):
        put(ws, f"A{i}", i - FIRST + 1, DATA, align=CENTER)
        put(ws, f"B{i}", name, DATA)
        put(ws, f"C{i}", cat, DATA, align=CENTER)
        put(ws, f"D{i}", unit, DATA, align=CENTER)
        put(ws, f"E{i}", qty, DATA, align=CENTER)
        put(ws, f"F{i}", price, DATA, MONEY)
        answer(ws, f"G{i}", f"=E{i}*F{i}", teacher, MONEY)
        check(ws, f"H{i}", check_formula(f"G{i}", f"E{i}*F{i}"), teacher)
    hint(ws, FIRST, "Каким знаком в Excel обозначается умножение?", ["*"],
         "Стоимость = Количество × Цена", teacher)
    t = TOTAL_ROW
    put(ws, f"B{t}", "ИТОГО по смете (СУММ)", bold=True)
    answer(ws, f"G{t}", f"=SUM(G{FIRST}:G{LAST})", teacher, MONEY)
    check(ws, f"H{t}", check_formula(f"G{t}", f"SUMPRODUCT(E{FIRST}:E{LAST},F{FIRST}:F{LAST})"), teacher)
    hint(ws, t, "Сколько ячеек в диапазоне G5:G16?", ["12"],
         "Итог = S₁ + S₂ + … + S₁₂  (сумма всех стоимостей)", teacher)
    put(ws, "B19", "★ Стоимость только озеленения (позиции 1–4)", STAR, bold=True)
    answer(ws, "G19", "=SUM(G5:G8)", teacher, MONEY)
    check(ws, "H19", check_formula("G19", "SUMPRODUCT(E5:E8,F5:F8)"), teacher)
    hint(ws, 19, "Сколько ячеек в диапазоне A1:A5?", ["5"],
         "S = S₁ + S₂ + S₃ + S₄  (только строки 1–4)", teacher)
    colour_checks(ws, f"H{FIRST}:H19")
    protect(ws, teacher)


# ---------------------------------------------------------------- 2. ABS
PRICE_CHANGES = [("Саженцы туи", 3500, 3200), ("Теннисный стол уличный", 185000, 192000),
                 ("Фонарь на солнечной батарее", 18500, 17000), ("Тротуарная плитка, м²", 4200, 4500)]


def sheet_abs(wb, teacher):
    ws = wb.create_sheet(tr(S2))
    widths(ws, {"A": 3, "B": 40, "C": 18, "D": 18, "E": 20, "F": 14, "G": 20, "H": 14, **HINT_W})
    title(ws, "Этап 2. Укладываемся в бюджет? Функция ABS",
          "Разница бывает отрицательной (перерасход, подешевело) или положительной. ABS показывает её размер без знака.", "B")
    put(ws, "B4", "Бюджет проекта (грант)", DATA, bold=True)
    put(ws, "C4", 4000000, DATA, MONEY)
    put(ws, "B5", "Итог сметы (берётся с листа 1)", DATA, bold=True)
    put(ws, "C5", f"='{tr(S1)}'!G{TOTAL_ROW}", DATA, MONEY)
    put(ws, "B6", "Разница: Бюджет − Смета")
    answer(ws, "C6", "=C4-C5", teacher, MONEY)
    check(ws, "D6", check_formula("C6", "C4-C5"), teacher)
    put(ws, "B7", "Отклонение от бюджета по модулю (ABS)")
    answer(ws, "C7", "=ABS(C6)", teacher, MONEY)
    check(ws, "D7", check_formula("C7", "ABS(C4-C5)"), teacher)
    hint_header(ws, 5)
    hint(ws, 6, "Сколько строк в диапазоне A3:A10?", ["8"], "Разница = Бюджет − Смета", teacher)
    hint(ws, 7, "Сколько столбцов в диапазоне A1:F1?", ["6"], "Отклонение = |Разница|   (модуль: |−a| = a)", teacher)
    put(ws, "B8", "Хватает ли гранта на весь проект? (да / нет)")
    answer(ws, "C8", "нет", teacher)
    check(ws, "D8", text_check("C8", "нет"), teacher)

    section(ws, "B10", "Поставщик прислал новые цены. На сколько изменилась каждая цена?")
    header(ws, 11, ["Товар", "Старая цена, тг", "Новая цена, тг", "Изменение (Новая − Старая)",
                    "Проверка", "Модуль изменения (ABS)", "Проверка"], col0=2)
    hint_header(ws, 11)
    for j, (name, old, new) in enumerate(PRICE_CHANGES):
        r = 12 + j
        put(ws, f"B{r}", name, DATA, bold=True)
        put(ws, f"C{r}", old, DATA, MONEY)
        put(ws, f"D{r}", new, DATA, MONEY)
        answer(ws, f"E{r}", f"=D{r}-C{r}", teacher, MONEY)
        check(ws, f"F{r}", check_formula(f"E{r}", f"D{r}-C{r}"), teacher)
        answer(ws, f"G{r}", f"=ABS(E{r})", teacher, MONEY)
        check(ws, f"H{r}", check_formula(f"G{r}", f"ABS(D{r}-C{r})"), teacher)
    hint(ws, 12, "Как называется ссылка вида A1, которая меняется при копировании? (одно слово)",
         ["относительная"], "Изменение = Новая цена − Старая цена", teacher)
    hint(ws, 13, "Как называется ссылка вида $A$1? (одно слово)", ["абсолютная"],
         "Модуль изменения = |Новая − Старая|", teacher)
    put(ws, "B16", "★ Сумма модулей изменений (СУММ)", STAR, bold=True)
    answer(ws, "G16", "=SUM(G12:G15)", teacher, MONEY)
    check(ws, "H16", check_formula("G16", "SUMPRODUCT(ABS(D12:D15-C12:C15))"), teacher)
    hint(ws, 16, "Сколько ячеек в диапазоне A1:D10?", ["40"], "Σ = |x₁| + |x₂| + |x₃| + |x₄|", teacher)
    for rng in ("D6:D8", "F12:F15", "H12:H16"):
        colour_checks(ws, rng)
    protect(ws, teacher)


# ---------------------------------------------------------------- 3–4. КОРЕНЬ, СТЕПЕНЬ
def geometry_rows(ws, rows, teacher):
    header(ws, 4, ["№", "Объект", "Форма", "Что известно", "Значение", "Что найти", "Ответ", "Проверка"])
    hint_header(ws, 4)
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
        hint(ws, i, q, ans, htext, teacher)


GEO_W = {"A": 5, "B": 32, "C": 11, "D": 18, "E": 11, "F": 16, "G": 14, "H": 16, **HINT_W}


def sheet_sqrt(wb, teacher):
    ws = wb.create_sheet(tr(S3))
    widths(ws, GEO_W)
    title(ws, "Этап 3. Клумбы и площадки – функция КОРЕНЬ",
          "Архитектор знает только площади квадратных участков. Найдите длины сторон и проверьте смету.")
    geometry_rows(ws, [
        ("Клумба «Солнце»", "квадрат", "площадь, м²", 49, "сторона, м", "SQRT(E{r})",
         ("Сколько ячеек в диапазоне A1:C2?", ["6"], "Сторона квадрата:  a = √S")),
        ("Клумба «Радуга»", "квадрат", "площадь, м²", 30.25, "сторона, м", "SQRT(E{r})",
         ("Сколько ячеек в диапазоне B2:D5?", ["12"], "Сторона квадрата:  a = √S")),
        ("Шахматная площадка", "квадрат", "площадь, м²", 64, "сторона, м", "SQRT(E{r})",
         ("Адрес ячейки на пересечении столбца D и строки 7?", ["d7", "д7"], "Сторона квадрата:  a = √S")),
    ], teacher)
    section(ws, "A9", "★ Сколько метров бордюра нужно, чтобы обойти обе клумбы? (в смете заложено 50 м)")
    put(ws, "B10", "★ Бордюр для двух клумб, м", STAR, bold=True)
    answer(ws, "G10", "=4*SQRT(E5)+4*SQRT(E6)", teacher, "0.##")
    check(ws, "H10", check_formula("G10", "4*SQRT(E5)+4*SQRT(E6)"), teacher)
    hint(ws, 10, "Как называется пересечение строки и столбца? (одно слово)", ["ячейка"],
         "Периметр квадрата:  P = 4a,  где a = √S", teacher)
    colour_checks(ws, "H5:H10")
    protect(ws, teacher)


def sheet_power(wb, teacher):
    ws = wb.create_sheet(tr(S4))
    widths(ws, GEO_W)
    title(ws, "Этап 4. Спортивные площадки и ящики – функция СТЕПЕНЬ",
          "Найдите площади и объёмы. Для корня тоже можно использовать СТЕПЕНЬ с дробным показателем.")
    geometry_rows(ws, [
        ("Площадка для настольного тенниса", "квадрат", "сторона, м", 12, "площадь, м²", "POWER(E{r},2)",
         ("Какой знак разделяет аргументы функции: СТЕПЕНЬ(2 ? 3)?", [";"], "Площадь квадрата:  S = a²")),
        ("Воркаут-площадка", "квадрат", "сторона, м", 9.5, "площадь, м²", "POWER(E{r},2)",
         ("Какой номер у столбца C?", ["3"], "Площадь квадрата:  S = a²")),
        ("Ящик для рассады", "куб", "ребро, м", 1.2, "объём, м³", "POWER(E{r},3)",
         ("Сколько ячеек в диапазоне C3:E7?", ["15"], "Объём куба:  V = a³")),
        ("★ Компостер", "куб", "объём, м³", 0.512, "ребро, м", "POWER(E{r},1/3)",
         ("Каким знаком в Excel записывают возведение в степень (без функции)?", ["^"],
          "Ребро куба:  a = ∛V = V^(1/3)")),
    ], teacher)
    section(ws, "A11", "Диагональная дорожка через прямоугольный двор (из угла в угол)")
    put(ws, "B12", "Длина двора, м", DATA)
    put(ws, "E12", 48, DATA, align=CENTER)
    put(ws, "B13", "Ширина двора, м", DATA)
    put(ws, "E13", 36, DATA, align=CENTER)
    put(ws, "B14", "Длина дорожки, м", DATA, bold=True)
    answer(ws, "G14", "=SQRT(POWER(E12,2)+POWER(E13,2))", teacher, "0.##")
    check(ws, "H14", check_formula("G14", "SQRT(E12^2+E13^2)"), teacher)
    hint(ws, 14, "Какое число будет в ячейке с формулой =2+3*2?", ["8"], "Теорема Пифагора:  d = √(a² + b²)", teacher)
    colour_checks(ws, "H5:H14")
    protect(ws, teacher)


# ---------------------------------------------------------------- 5. СУММЕСЛИ
def sheet_sumif(wb, teacher):
    ws = wb.create_sheet(tr(S5))
    widths(ws, {"A": 5, "B": 40, "C": 18, "D": 12, "E": 17, "F": 3, "G": 3, "H": 3, **HINT_W})
    title(ws, "Этап 5. Куда уходят деньги? Функция СУММЕСЛИ",
          "Стоимости перенесены с листа 1. Найдите суммы по условию и решите, на чём сэкономить.")
    header(ws, 4, ["№", "Наименование", "Категория", "Ед. изм.", "Стоимость, тг"])
    for i, (name, cat, unit, _, _) in enumerate(ITEMS, start=FIRST):
        put(ws, f"A{i}", i - FIRST + 1, DATA, align=CENTER)
        put(ws, f"B{i}", name, DATA)
        put(ws, f"C{i}", cat, DATA, align=CENTER)
        put(ws, f"D{i}", unit, DATA, align=CENTER)
        put(ws, f"E{i}", f"='{tr(S1)}'!G{i}", DATA, MONEY)
    rc, rd, re = f"$C${FIRST}:$C${LAST}", f"$D${FIRST}:$D${LAST}", f"$E${FIRST}:$E${LAST}"

    section(ws, "A18", "Расходы по категориям (условие – ссылка на ячейку в столбце B)")
    header(ws, 19, ["Категория", "Сумма, тг", "Проверка"], col0=2)
    hint_header(ws, 19)
    for k, cat in enumerate(CATS, start=20):  # 20..23
        put(ws, f"B{k}", cat, DATA, bold=True)
        answer(ws, f"C{k}", f"=SUMIF({rc},B{k},{re})", teacher, MONEY)
        check(ws, f"D{k}", check_formula(f"C{k}", f"SUMPRODUCT(({rc}=B{k})*{re})"), teacher)
    hint(ws, 20, "Какой знак делает ссылку абсолютной (A1 → $A$1)?", ["$"],
         "Сумма категории = Σ стоимостей тех строк, где Категория = нужной", teacher)
    put(ws, "B25", "Сумма покупок, которые считаются в штуках («шт»)", bold=True)
    answer(ws, "C25", f'=SUMIF({rd},{xl_str(tr("шт"))},{re})', teacher, MONEY)
    check(ws, "D25", check_formula("C25", f'SUMPRODUCT(({rd}={xl_str(tr("шт"))})*{re})'), teacher)
    hint(ws, 25, "Сколько ячеек в диапазоне A1:B2?", ["4"], "Σ стоимостей тех строк, где Ед. изм. = «шт»", teacher)
    put(ws, "B26", "★ Сумма всех покупок дороже 100 000 тг", STAR, bold=True)
    answer(ws, "C26", f'=SUMIF({re},">100000")', teacher, MONEY)
    check(ws, "D26", check_formula("C26", f"SUMPRODUCT(({re}>100000)*{re})"), teacher)
    hint(ws, 26, "Какой знак сравнения означает «больше»?", [">"],
         "Σ стоимостей только тех покупок, где Стоимость > 100 000", teacher)

    section(ws, "A28", "Выводы")
    put(ws, "B29", "На какую категорию уходит больше всего денег? (одно слово)")
    answer(ws, "C29", "Спорт", teacher)
    check(ws, "D29", text_check("C29", "спорт"), teacher)
    put(ws, "B30", "★ Что можно сократить, чтобы уложиться в грант? (свободный ответ)", STAR)
    ws.merge_cells("C30:K30")
    answer(ws, "C30", "Например: уменьшить резиновое покрытие примерно на 17 м² (148 250 / 9 000)"
           if teacher else None, teacher)
    ws.row_dimensions[30].height = 36
    colour_checks(ws, "D20:D29")
    protect(ws, teacher)



# ---------------------------------------------------------------- Итог
MAX_FO = 10  # максимальный балл ФО


def sheet_result(wb, teacher):
    ws = wb.create_sheet(tr("Итог"))
    of = tr(" из ")
    intro = tr("Инструкция")
    widths(ws, {"A": 3, "B": 36, "C": 40, "D": 3, "E": 14, "F": 22})
    ws["B1"] = tr("Мой результат")
    ws["B1"].font = TITLE
    total = len(CHECK_CELLS)
    parts = "+".join(f"COUNTIF('{s}'!{c},\"✔\")" for s, c in CHECK_CELLS)
    put(ws, "B3", "Фамилия, имя", DATA, bold=True)
    put(ws, "C3", f"=IF('{intro}'!C4=\"\",{xl_str(tr('(заполните на листе Инструкция)'))},'{intro}'!C4)")

    # --- крупно: выполнено заданий
    c = put(ws, "B5", "ВЫПОЛНЕНО ЗАДАНИЙ", HEAD, align=CENTER)
    c.font = Font(bold=True, size=18, color="FFFFFF")
    c = put(ws, "C5", f"={parts}", DATA, fmt=f'0"{of}{total}"', align=CENTER)
    c.font = Font(bold=True, size=40, color="1F4E78")
    ws.row_dimensions[5].height = 66

    # --- крупно: балл ФО
    c = put(ws, "B7", f"БАЛЛ ФО (макс. {MAX_FO})", HEAD, align=CENTER)
    c.font = Font(bold=True, size=18, color="FFFFFF")
    c = put(ws, "C7", f"=ROUND(C5/{total}*{MAX_FO},0)", fmt=f'0"{of}{MAX_FO}"', align=CENTER)
    c.font = Font(bold=True, size=48)
    ws.row_dimensions[7].height = 80
    ws.conditional_formatting.add("C7", CellIsRule(operator="greaterThanOrEqual", formula=["8"], fill=GREEN))
    ws.conditional_formatting.add("C7", CellIsRule(operator="between", formula=["5", "7"], fill=ORANGE))
    ws.conditional_formatting.add("C7", CellIsRule(operator="lessThan", formula=["5"], fill=RED))
    ws.merge_cells("B8:C8")
    c = put(ws, "B8", f"Балл = выполнено заданий ÷ {total} × {MAX_FO}, округление до целого")
    c.font = Font(italic=True, color="404040")

    put(ws, "B10", "Процент выполнения", DATA, bold=True)
    put(ws, "C10", f"=C5/{total}", fmt="0%", align=CENTER).font = Font(bold=True, size=14)
    put(ws, "B11", "Прогресс", DATA, bold=True)
    c = put(ws, "C11", '=REPT("█",ROUND(C10*20,0))&REPT("░",20-ROUND(C10*20,0))')
    c.font = Font(color="2E7D32", size=12)
    put(ws, "B12", "Открыто подсказок", DATA, bold=True)
    opened = "+".join(f"IF(OR(LEFT('{s}'!{c},1)=\"🔒\",LEFT('{s}'!{c},1)=\"✘\"),0,1)" for s, c in HINT_CELLS)
    put(ws, "C12", f'=({opened})&"{of}{len(HINT_CELLS)}"', align=CENTER)
    ws["B14"] = tr("Ошибки по листам:")
    ws["B14"].font = Font(bold=True)
    for k, sheet in enumerate([tr(x) for x in SHEETS], start=15):
        cells = [c for s, c in CHECK_CELLS if s == sheet]
        f = "+".join(f"COUNTIF('{sheet}'!{c},\"✘\")+COUNTIF('{sheet}'!{c},\"⚠*\")" for c in cells)
        put(ws, f"B{k}", sheet, DATA)
        put(ws, f"C{k}", f"={f}", align=CENTER)

    # --- таблица перевода: задания → балл ФО
    header(ws, 9, ["Балл ФО", "Выполнено заданий"], col0=5)
    for i, score in enumerate(range(MAX_FO, -1, -1)):
        lo = max(0, math.ceil((score - 0.5) * total / MAX_FO - 1e-9))
        hi = total if score == MAX_FO else math.ceil((score + 0.5) * total / MAX_FO - 1e-9) - 1
        r = 10 + i
        put(ws, f"E{r}", score, DATA, align=CENTER).font = Font(bold=True)
        put(ws, f"F{r}", f"{lo}–{hi}" if lo != hi else f"{lo}", align=CENTER)
        ws.conditional_formatting.add(f"E{r}:F{r}", FormulaRule(formula=[f"$C$7={score}"], fill=YELLOW))
    protect(ws, teacher)


def build(teacher, lang="ru"):
    global LANG
    LANG = lang
    CHECK_CELLS.clear()
    HINT_CELLS.clear()
    wb = Workbook()
    sheet_intro(wb, teacher)
    for make in (sheet_sum, sheet_abs, sheet_sqrt, sheet_power, sheet_sumif):
        make(wb, teacher)
    sheet_result(wb, teacher)
    wb.calculation.fullCalcOnLoad = True
    name = "practical_work_teacher_key" if teacher else "practical_work_student"
    name += "_kz.xlsx" if lang == "kz" else ".xlsx"
    wb.save(name)
    print(name, "проверяемых ячеек:", len(CHECK_CELLS))


if __name__ == "__main__":
    import sys
    if "--strings" in sys.argv:  # вывести все строки интерфейса (для перевода)
        build(teacher=True)
        build(teacher=False)
        for t in sorted(SEEN):
            print(repr(t))
        sys.exit()
    for lang in ("ru", "kz"):
        build(teacher=False, lang=lang)
        build(teacher=True, lang=lang)
