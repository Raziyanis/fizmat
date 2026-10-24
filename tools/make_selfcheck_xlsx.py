"""Урок «Математические функции», этап «Работа в Excel»: книга с самопроверкой для ученика и ключ для учителя.

Ученик пишет формулы, Excel сам проверяет ответ и способ записи. Сценарии берутся со страницы урока.
Запуск: python3 tools/make_selfcheck_xlsx.py [kz] [filled <файл>]
  без filled — книга самопроверки и ключ в lessons-8/; kz — казахская версия (имена функций как в русском Excel);
  filled — тестовая книга с правильными формулами (для проверки самой проверки).
"""
import json, re, subprocess, sys
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, Protection
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
ARGS = sys.argv[1:]
KZ = "kz" in ARGS
if KZ: ARGS.remove("kz")
FILLED = bool(ARGS) and ARGS[0] == "filled"   # для теста: книга с правильными формулами
def tr(ru, kz): return kz if KZ else ru
DIC = json.loads((ROOT / "tools" / "i18n_kz.json").read_text(encoding="utf-8"))
def word(w): return DIC.get(w, w) if KZ else w          # слова-данные (категории) — как на казахской странице
OUT = ARGS[1] if FILLED else ROOT / "lessons-8" / tr("Самопроверка_Excel.xlsx", "Өзін-өзі_тексеру_Excel.xlsx")
KEY_OUT = ROOT / "lessons-8" / tr("Ключ_Excel_сценарии.xlsx", "Кілт_Excel_сценарийлер.xlsx")

# Сценарии: русские — из src-ru.html, казахские — из казахской части собранной страницы (function L_kz)
js = ('const s0=require("fs").readFileSync(process.argv[1],"utf8"),s=s0.slice(s0.indexOf(process.argv[2]));'
      'eval(s.slice(s.indexOf("const EX_SC = ["),s.indexOf("EX_SC.forEach")).replace("const EX_SC","var EX_SC"));'
      'console.log(JSON.stringify(EX_SC))')
SC = json.loads(subprocess.run(["node", "-e", js, str(ROOT / "lessons-8" / ("index.html" if KZ else "src-ru.html")), "function L_kz()" if KZ else ""],
                               capture_output=True, text=True, check=True).stdout)

FN = {"СУММ": "SUM", "ABS": "ABS", "КОРЕНЬ": "SQRT", "СТЕПЕНЬ": "POWER", "СУММЕСЛИ": "SUMIF"}
def has_fn(t, ru):  # функция в тексте формулы: русское или английское имя
    return f'OR(ISNUMBER(SEARCH("{ru}(",{t})),ISNUMBER(SEARCH("{FN[ru]}(",{t})))'
def colons(t): return f'(LEN({t})-LEN(SUBSTITUTE({t},":","")))'

# Для каждого шага: ячейки-цели, ожидаемое значение (выражение от данных), условия на запись
STEPS = {
 "S1": [dict(c=["B8"], exp="SUM(B2:B7)", fn=["СУММ"], way=">=1:"),
        dict(c=["C8"], exp="SUM(C2:C7)", fn=["СУММ"]),
        dict(c=["E2"], exp="B2+B3+B6", fn=["СУММ"], way="0:"),
        dict(c=["E3"], exp="B2+B3+500", fn=["СУММ"], has=["500"]),
        dict(c=["E4"], exp="SUM(B2:B4)+B7", fn=["СУММ"], way="1:", has=["B7"]),
        dict(c=["E5"], exp="SUM(B2:B7)+SUM(C2:C7)", fn=["СУММ"], way="2:"),
        dict(c=["E6"], exp="SUM(B2:C7)", fn=["СУММ"], way="1:"),
        dict(c=["B8"], exp="SUM(B2:B7)", fn=["СУММ"], pre=("B7=1200", tr("сначала измени B7 на 1200", "алдымен B7 мәнін 1200 деп өзгерт")))],
 "S2": [dict(c=["G2"], exp="12", fn=["ABS"]),
        dict(c=["G3"], exp="ABS(B2)", fn=["ABS"]),
        dict(c=["E3", "E8"], exp=["C3-B3", "C8-B8"], nofn=["ABS"], fill="E2:E8"),
        dict(c=["D3", "D8"], exp=["ABS(C3-B3)", "ABS(C8-B8)"], fn=["ABS"], fill="D2:D8"),
        dict(c=["D4"], exp="ABS(C4-B4)", fn=["ABS"]),
        dict(c=["G4"], exp="SUMPRODUCT(ABS(C2:C8-B2:B8))", fn=["СУММ"]),
        dict(c=["G5"], exp="SUM(C2:C8)-SUM(B2:B8)", fn=["СУММ"]),
        dict(c=["G6"], exp="ABS(B8-B2)", fn=["ABS"])],
 "S3": [dict(c=["C2"], exp="SQRT(B2)", fn=["КОРЕНЬ"]),
        dict(c=["C5", "C6"], exp=["SQRT(B5)", "SQRT(B6)"], fill="C2:C6"),
        dict(c=["C4"], exp="SQRT(B4)"),
        dict(c=["F2"], exp="12", fn=["КОРЕНЬ"]),
        dict(c=["D2"], exp="SQRT(B2)*4"),
        dict(c=["F3"], exp="ERR", fn=["КОРЕНЬ"]),
        dict(c=["F4"], exp="5", fn=["КОРЕНЬ", "ABS"]),
        dict(c=["F5"], exp="SQRT(2*B2)", fn=["КОРЕНЬ"])],
 "S4": [dict(c=["C2"], exp="POWER(A2,B2)", fn=["СТЕПЕНЬ"]),
        dict(c=["C5"], exp="POWER(A5,B5)", fill="C2:C6"),
        dict(c=["C6"], exp="POWER(A6,B6)"),
        dict(c=["D3", "D6"], exp=["A3^B3", "A6^B6"], nofn=["СТЕПЕНЬ"], has=["^"], fill="D2:D6"),
        dict(c=["F2"], exp="POWER(A2,10)", fn=["СТЕПЕНЬ"], has=["10"]),
        dict(c=["F3"], exp="343", fn=["СТЕПЕНЬ"]),
        dict(c=["F4"], exp="9", fn=["СТЕПЕНЬ"], nofn=["КОРЕНЬ"]),
        dict(c=["F5"], exp="133100", fn=["СТЕПЕНЬ"])],
 "S5": [dict(c=["F2"], exp='SUMIF(C2:C9,">0")', fn=["СУММЕСЛИ"], has=[">0"]),
        dict(c=["F3"], exp='SUMIF(C2:C9,"<0")', fn=["СУММЕСЛИ"], has=["<0"]),
        dict(c=["F4"], exp=f'SUMIF(B2:B9,"{word("еда")}",C2:C9)', fn=["СУММЕСЛИ"], has=[word("еда")]),
        dict(c=["F5"], exp="SUMIF(B2:B9,E5,C2:C9)", fn=["СУММЕСЛИ"], has=["E5"], pre=('E5<>""', tr("сначала впиши категорию в E5", "алдымен E5-ке санатты жаз"))),
        dict(c=["F6"], exp='SUMIF(C2:C9,"<-500")', fn=["СУММЕСЛИ"], has=["<-500"]),
        dict(c=["F7"], exp='-SUMIF(C2:C9,"<0")', fn=["СУММЕСЛИ", "ABS"]),
        dict(c=["F8"], exp="SUM(C2:C9)", fn=["СУММ"]),
        dict(c=["F5"], exp="SUMIF(B2:B9,E5,C2:C9)", fn=["СУММЕСЛИ"], pre=(f'E5="{word("игры")}"', tr("сначала замени в E5 слово на «игры»", f"алдымен E5-тегі сөзді «{word('игры')}» деп ауыстыр")))],
 "S6": [dict(c=["E1"], exp="SQRT(B1)", fn=["КОРЕНЬ"]),
        dict(c=["E2"], exp="B1", fn=["СТЕПЕНЬ"]),
        dict(c=["E3"], exp="4*SQRT(B1)*B2"),
        dict(c=["E4"], exp="SUM(C6:C11)", fn=["СУММ"]),
        dict(c=["E5"], exp=f'SUMIF(B6:B11,"{word("краска")}",C6:C11)', fn=["СУММЕСЛИ"]),
        dict(c=["E6"], exp="ABS(B3-SUM(C6:C11))", fn=["ABS"]),
        dict(c=["E7"], exp=f'SUM(C6:C11)-SUMIF(B6:B11,"{word("краска")}",C6:C11)', fn=["СУММ", "СУММЕСЛИ"]),
        dict(c=["E6"], exp="ABS(B3-SUM(C6:C11))", fn=["ABS"], pre=("B3=60000", tr("сначала измени B3 на 60000", "алдымен B3 мәнін 60000 деп өзгерт")))],
}
# правильные формулы — только для тестовой «заполненной» книги
SOLVE = {
 "S1": {"B8": "=SUM(B2:B7)", "C8": "=SUM(C2:C7)", "E2": "=SUM(B2,B3,B6)", "E3": "=SUM(B2,B3,500)", "E4": "=SUM(B2:B4,B7)", "E5": "=SUM(B2:B7,C2:C7)", "E6": "=SUM(B2:C7)", "B7": 1200},
 "S2": {"G2": "=ABS(-12)", "G3": "=ABS(B2)", **{f"E{r}": f"=C{r}-B{r}" for r in range(2, 9)}, **{f"D{r}": f"=ABS(C{r}-B{r})" for r in range(2, 9)}, "G4": "=SUM(D2:D8)", "G5": "=SUM(E2:E8)", "G6": "=ABS(B8-B2)"},
 "S3": {**{f"C{r}": f"=SQRT(B{r})" for r in range(2, 7)}, "F2": "=SQRT(144)", "D2": "=C2*4", "F3": "=SQRT(-25)", "F4": "=SQRT(ABS(-25))", "F5": "=SQRT(C2*C2+C2*C2)"},
 "S4": {**{f"C{r}": f"=POWER(A{r},B{r})" for r in range(2, 7)}, **{f"D{r}": f"=A{r}^B{r}" for r in range(2, 7)}, "F2": "=POWER(A2,10)", "F3": "=POWER(7,3)", "F4": "=POWER(81,0.5)", "F5": "=100000*POWER(1.1,3)"},
 "S5": {"F2": '=SUMIF(C2:C9,">0")', "F3": '=SUMIF(C2:C9,"<0")', "F4": f'=SUMIF(B2:B9,"{word("еда")}",C2:C9)', "E5": word("игры"), "F5": "=SUMIF(B2:B9,E5,C2:C9)", "F6": '=SUMIF(C2:C9,"<-500")', "F7": '=ABS(SUMIF(C2:C9,"<0"))', "F8": "=SUM(C2:C9)"},
 "S6": {"E1": "=SQRT(B1)", "E2": "=POWER(E1,2)", "E3": "=4*E1*B2", "E4": "=SUM(C6:C11)", "E5": f'=SUMIF(B6:B11,"{word("краска")}",C6:C11)', "E6": "=ABS(B3-E4)", "E7": f'=SUM(C6:C11)-SUMIF(B6:B11,"{word("краска")}",C6:C11)', "B3": 60000},
}

def check_formula(st):
    cells = st["c"]; exps = st["exp"] if isinstance(st["exp"], list) else [st["exp"]]
    main = cells[0]; t = f'IFERROR(_xlfn.FORMULATEXT({main}),"")'
    conds = []  # (условие ошибки, текст)
    conds.append((" OR(" + ",".join(f"NOT(_xlfn.ISFORMULA({c}))" for c in cells) + ")", tr("✗ нужна формула, а не число", "✗ сан емес, формула керек") + (tr(" (протяни формулу вниз)", " (формуланы төмен созып көшір)") if st.get("fill") else "")))
    for ru in st.get("fn", []): conds.append((f"NOT({has_fn(t, ru)})", tr(f"✗ нужна функция {ru}", f"✗ {ru} функциясы керек")))
    for ru in st.get("nofn", []): conds.append((has_fn(t, ru), tr(f"✗ здесь обойдись без {ru}", f"✗ мұнда {ru} функциясынсыз жаз")))
    way = []  # способ записи проверяем после ответа: сначала «верно ли посчитано», потом «тем ли способом»
    w = st.get("way")
    if w == "0:": way.append((f"{colons(t)}>0", tr("✗ ответ верный, но перечисли ячейки через «;», без диапазона", "✗ жауап дұрыс, бірақ ұяшықтарды ауқымсыз, «;» арқылы тізіп жаз")))
    if w == "1:": way.append((f"{colons(t)}<>1", tr("✗ ответ верный, но запиши одним диапазоном", "✗ жауап дұрыс, бірақ бір ауқыммен жаз")))
    if w == "2:": way.append((f"{colons(t)}<>2", tr("✗ ответ верный, но нужны два диапазона через «;»", "✗ жауап дұрыс, бірақ «;» арқылы екі ауқым керек")))
    if w == ">=1:": way.append((f"{colons(t)}<1", tr("✗ ответ верный, но используй диапазон через «:»", "✗ жауап дұрыс, бірақ «:» арқылы ауқым қолдан")))
    for h in st.get("has", []):
        way.append((f'ISERROR(SEARCH("{h}",{t}))', tr("✗ ответ верный, но запиши так, как просит шаг", "✗ жауап дұрыс, бірақ қадамда сұралғандай жаз")))
    if exps[0] == "ERR": ok = f"ISERROR({main})"
    else: ok = "AND(" + ",".join(f"IFERROR(ABS({c}-({e}))<=0.01*MAX(1,ABS({e})),FALSE)" for c, e in zip(cells, exps)) + ")"
    f = f'IF(ISBLANK({main}),"—",'
    closing = ")"
    if st.get("pre"):
        f += f'IF(NOT({st["pre"][0]}),"✗ {st["pre"][1]}",'; closing += ")"
    for c, msg in conds:
        f += f'IF({c},"{msg}",'; closing += ")"
    f += f'IF(NOT({ok}),"{tr("✗ ответ неверный — проверь формулу", "✗ жауап дұрыс емес — формуланы тексер")}",'; closing += ")"
    for c, msg in way:
        f += f'IF({c},"{msg}",'; closing += ")"
    f += '"' + tr("✓ верно", "✓ дұрыс") + '"' + closing
    return "=" + f

thin = Side(style="thin", color="C9D3D9")
GREEN = PatternFill("solid", fgColor="D9F2E3"); RED = PatternFill("solid", fgColor="FBE1DE"); YEL = PatternFill("solid", fgColor="FFF4CC")
HEAD = PatternFill("solid", fgColor="1D7652"); WHITE = Font(bold=True, color="FFFFFF")
START, TOTAL = tr("Начало", "Басы"), tr("Итог", "Қорытынды")
wb = Workbook(); info = wb.active; info.title = START
lines = [(tr("Самопроверка: математические функции в Excel", "Өзін-өзі тексеру: Excel-дегі математикалық функциялар"), True), ("", False),
         (tr("Класс:", "Сынып:"), True), (tr("Фамилия и имя:", "Тегі мен аты:"), True), ("", False),
         (tr("Как работать", "Қалай жұмыс істеу керек"), True)] + [(x, False) for x in tr([
         "1. Открой лист сценария (S1–S6). Таблица с данными уже заполнена.",
         "2. Справа — шаги. Пиши формулу в жёлтую ячейку, которая указана в шаге.",
         "3. В столбце «Проверка» Excel сразу покажет: ✓ верно — или что исправить.",
         "4. Шаги со словами «измени…» — поменяй число в таблице, формулу не трогай.",
         "5. Общий счёт — на листе «Итог»."], [
         "1. Сценарий парағын аш (S1–S6). Деректері бар кесте дайын.",
         "2. Оң жақта — қадамдар. Формуланы қадамда көрсетілген сары ұяшыққа жаз.",
         "3. «Тексеру» бағанында Excel бірден көрсетеді: ✓ дұрыс — немесе нені түзету керек.",
         "4. «Өзгерт…» деген қадамдарда кестедегі санды өзгерт, формулаға тиме.",
         "5. Жалпы есеп — «Қорытынды» парағында."])]
for i, (txt, b) in enumerate(lines, 1):
    info.cell(i, 1, txt).font = Font(bold=b, size=14 if i == 1 else 11)
info["B3"].fill = YEL; info["B4"].fill = YEL
for k in ("B3", "B4"): info[k].protection = Protection(locked=False)
info.column_dimensions["A"].width = 22; info.column_dimensions["B"].width = 60
info.protection.sheet = True; info.protection.password = "fizmat"

summary = []
for s in SC:
    ws = wb.create_sheet(s["id"])
    for k, v in s["data"].items():
        t = v.replace(",", ".")
        ws[k] = int(t) if re.fullmatch(r"-?\d+", t) else (float(t) if re.fullmatch(r"-?\d+\.\d+", t) else v)
        if int(k[1:]) == 1 or v in [word(x) for x in ("Товар", "Категория", "Цена, тг")]: ws[k].font = Font(bold=True)
    # всё на листе ученика можно править, кроме панели шагов
    for row in ws.iter_rows(min_row=1, max_row=20, min_col=1, max_col=8):
        for c in row: c.protection = Protection(locked=False)
    targets = set()
    for st in STEPS[s["id"]]:
        if st.get("fill"):
            a, b = st["fill"].split(":"); col = a[0]
            for r in range(int(a[1:]), int(b[1:]) + 1): targets.add(f"{col}{r}")
        targets.update(st["c"])
    for k in targets: ws[k].fill = YEL
    c0 = 10  # J
    for j, h in enumerate(tr(["№", "Тип шага", "Задание", "Ячейка", "Проверка"], ["№", "Қадам түрі", "Тапсырма", "Ұяшық", "Тексеру"])):
        c = ws.cell(1, c0 + j, h); c.font = WHITE; c.fill = HEAD
    for i, (t, st) in enumerate(zip(s["tasks"], STEPS[s["id"]]), 1):
        r = i + 1
        cell_txt = (tr(f"{t['cell']} → протяни вниз; ответ в {t['read']}", f"{t['cell']} → төмен созып көшір; жауап {t['read']} ұяшығында") if t.get("read") else t["cell"])
        vals = [i, t["tag"], t["q"], cell_txt]
        for j, v in enumerate(vals):
            c = ws.cell(r, c0 + j, v); c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = Border(bottom=thin)
        chk = ws.cell(r, c0 + 4, check_formula(st))
        chk.alignment = Alignment(wrap_text=True, vertical="top"); chk.border = Border(bottom=thin)
        chk.font = Font(bold=True)
        chk.protection = Protection(locked=True, hidden=True)   # формулу проверки не видно
    n = len(s["tasks"])
    rng = f"N2:N{n + 1}"
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT(N2,1)="✓"'], fill=GREEN))
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LEFT(N2,1)="✗"'], fill=RED))
    ws.cell(n + 3, c0 + 2, tr("Выполнено шагов:", "Орындалған қадамдар:")).font = Font(bold=True)
    sc_cell = ws.cell(n + 3, c0 + 4, f'=COUNTIF({rng},"✓*")&"{tr(" из ", " / ")}{n}"'); sc_cell.font = Font(bold=True, size=13)
    sc_cell.protection = Protection(locked=True, hidden=True)
    for col, w in {c0: 4, c0 + 1: 20, c0 + 2: 60, c0 + 3: 16, c0 + 4: 34}.items(): ws.column_dimensions[get_column_letter(col)].width = w
    for col in "ABCDEFGH": ws.column_dimensions[col].width = 14
    ws.column_dimensions["A"].width = 18
    ws.freeze_panes = "A2"
    ws.protection.sheet = True; ws.protection.password = "fizmat"
    ws.protection.formatCells = False; ws.protection.formatColumns = False  # можно менять разрядность и ширину столбцов
    summary.append((s["id"], s["title"], s["fn"], rng, n))
    if FILLED:
        for k, v in SOLVE[s["id"]].items(): ws[k] = v

it = wb.create_sheet(TOTAL)
it["A1"] = tr("Итог самопроверки", "Өзін-өзі тексеру қорытындысы"); it["A1"].font = Font(bold=True, size=14)
it["A2"] = f'="{tr("Ученик", "Оқушы")}: "&{START}!B4&", "&{START}!B3'
for j, h in enumerate(tr(["Сценарий", "Название", "Функция", "Верно", "Всего"], ["Сценарий", "Атауы", "Функция", "Дұрыс", "Барлығы"])):
    c = it.cell(4, 1 + j, h); c.font = WHITE; c.fill = HEAD
for i, (sid, title, fn, rng, n) in enumerate(summary, 5):
    it.cell(i, 1, sid); it.cell(i, 2, title); it.cell(i, 3, fn)
    it.cell(i, 4, f"=COUNTIF({sid}!{rng},\"✓*\")"); it.cell(i, 5, n)
last = 4 + len(summary)
it.cell(last + 1, 2, tr("Всего", "Барлығы")).font = Font(bold=True)
it.cell(last + 1, 4, f"=SUM(D5:D{last})").font = Font(bold=True)
it.cell(last + 1, 5, f"=SUM(E5:E{last})").font = Font(bold=True)
it.column_dimensions["B"].width = 34; it.column_dimensions["C"].width = 16
it.protection.sheet = True; it.protection.password = "fizmat"
from openpyxl.workbook.properties import CalcProperties
wb.calculation = CalcProperties(fullCalcOnLoad=True)  # Excel пересчитает проверку при открытии
wb.save(OUT)
print("saved", OUT)


# ---------- ключ для учителя: все формулы вписаны, справа — шаги и ответы ----------
EN = {"СУММЕСЛИ": "SUMIF", "СУММ": "SUM", "КОРЕНЬ": "SQRT", "СТЕПЕНЬ": "POWER", "ABS": "ABS"}
def to_en(f):
    """Русская запись Excel → формула для файла: имена функций, «;» → «,», десятичная запятая → точка."""
    out = []
    for p in re.split(r'("[^"]*")', f):
        if p.startswith('"'): out.append(p); continue
        p = re.sub(r'(\d),(\d)', r'\1.\2', p)
        for ru, en in EN.items(): p = p.replace(ru + "(", en + "(")
        out.append(p.replace(";", ","))
    return "".join(out)
def first_formula(h):
    m = re.search(r'=[^\s]+', h); return re.sub(r'[.:,;]+$', '', m.group(0)) if m else ""
def num(v):
    t = v.replace(",", ".")
    return int(t) if re.fullmatch(r'-?\d+', t) else float(t) if re.fullmatch(r'-?\d+\.\d+', t) else v
def shift(f, dr): return re.sub(r'([A-H])(\d+)', lambda m: m.group(1) + str(int(m.group(2)) + dr), f)

def key():
    FILL = {"S2.3": ("E", 2, 8, "=C2-B2"), "S2.4": ("D", 2, 8, "=ABS(C2-B2)"), "S3.1": ("C", 2, 6, "=КОРЕНЬ(B2)"), "S4.1": ("C", 2, 6, "=СТЕПЕНЬ(A2;B2)"), "S4.4": ("D", 2, 6, "=A2^B2")}
    CHANGE = {"S1.8": "B7 → 1200", "S5.8": f"E5 → {word('игры')}", "S6.8": "B3 → 60000"}
    kb = Workbook(); kb.remove(kb.active)
    inf = kb.create_sheet(tr("Как пользоваться", "Қалай қолдану"))
    rows = tr(["Ключ к этапу «Работа в Excel» (урок «Математические функции», 8 класс).",
               "На листах S1–S6 — таблица сценария, как её набирают ученики, и все формулы уже вписаны (жёлтые ячейки).",
               "Справа на каждом листе — шаги: ячейка, формула в русском Excel и правильный ответ.",
               "Шаги с пометкой «измени …» ученик выполняет, меняя данные; в файле данные исходные, ответ в таблице шагов — после изменения.",
               "Формулы в файле записаны так, что русский Excel покажет их по-русски: СУММ, ABS, КОРЕНЬ, СТЕПЕНЬ, СУММЕСЛИ."],
              ["«Excel-де жұмыс» кезеңінің кілті («Математикалық функциялар» сабағы, 8 сынып).",
               "S1–S6 парақтарында — оқушылар толтыратын сценарий кестесі және барлық формула жазылған (сары ұяшықтар).",
               "Әр парақтың оң жағында — қадамдар: ұяшық, орыс тіліндегі Excel-дегі формула және дұрыс жауап.",
               "«Өзгерт …» деген қадамдарды оқушы деректерді өзгертіп орындайды; файлда бастапқы деректер, ал қадамдар кестесіндегі жауап — өзгерткеннен кейін.",
               "Формулалар орыс тіліндегі Excel оларды орысша көрсететіндей жазылған: СУММ, ABS, КОРЕНЬ, СТЕПЕНЬ, СУММЕСЛИ. Функция атаулары Excel-дің тіліне байланысты көрсетіледі."])
    for i, r in enumerate(rows, 1): inf.cell(i, 1, r)
    inf.column_dimensions["A"].width = 120
    for s in SC:
        ws = kb.create_sheet(s["id"])
        for k, v in s["data"].items():
            ws[k] = num(v)
            if int(k[1:]) == 1 or v in [word(x) for x in ("Товар", "Категория", "Цена, тг")]: ws[k].font = Font(bold=True)
        if s["id"] == "S5": ws["E5"] = word("транспорт")
        placed = []
        for i, t in enumerate(s["tasks"], 1):
            tid = f'{s["id"]}.{i}'
            if tid in FILL:
                col, r1, r2, f = FILL[tid]
                for r in range(r1, r2 + 1):
                    ws[f"{col}{r}"] = to_en(shift(f, r - r1)); placed.append(f"{col}{r}")
            elif not t.get("noFormula"):
                f = "=СУММЕСЛИ(B2:B9;E5;C2:C9)" if tid == "S5.4" else first_formula(t["hint"])
                ws[t["cell"]] = to_en(f); placed.append(t["cell"])
        for k in placed: ws[k].fill = YEL
        c0 = 10
        for j, h in enumerate(tr(["Шаг", "Тип шага", "Ячейка", "Формула (русский Excel)", "Ответ"], ["Қадам", "Қадам түрі", "Ұяшық", "Формула (орыс тіліндегі Excel)", "Жауап"])):
            c = ws.cell(1, c0 + j, h); c.font = WHITE; c.fill = HEAD
        for i, t in enumerate(s["tasks"], 1):
            tid = f'{s["id"]}.{i}'
            f = FILL[tid][3] + tr(" и протянуть вниз", " және төмен созып көшіру") if tid in FILL else ("=СУММЕСЛИ(B2:B9;E5;C2:C9)" if tid == "S5.4" else ("" if t.get("noFormula") else first_formula(t["hint"])))
            if tid in CHANGE: f = tr("измени ", "өзгерт: ") + CHANGE[tid]
            for j, v in enumerate([i, t["tag"], t.get("read") or t["cell"], f, t["ans"]]):
                c = ws.cell(i + 1, c0 + j, v)
                if isinstance(v, str) and v.startswith(("=", "#")): c.data_type = "s"   # текст формулы, а не формула
                c.border = Border(bottom=thin); c.alignment = Alignment(wrap_text=True, vertical="top")
        for col, w in {c0: 6, c0 + 1: 26, c0 + 2: 8, c0 + 3: 44, c0 + 4: 12}.items(): ws.column_dimensions[get_column_letter(col)].width = w
        for col in "ABCDEFG": ws.column_dimensions[col].width = 16
        ws.freeze_panes = "A2"
    kb.save(KEY_OUT); print("saved", KEY_OUT)

if not FILLED: key()
