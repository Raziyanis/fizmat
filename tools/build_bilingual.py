"""Собирает двуязычную страницу урока (русский + казахский) из src-ru.html.

Русский текст правится только в src-ru.html. Казахский получается словарём tools/i18n_kz.json
(фрагмент → перевод), шаблонами tools/i18n_kz_templates.py и правками ниже (ребус темы и то,
что зависит от порядка слов). В index.html лежат обе версии разметки в <template> и оба скрипта
в функциях L_ru / L_kz; язык выбирается кнопками РУС | ҚАЗ и запоминается в браузере.
Так же собирается экран учителя: tools/teacher/<папка>.html → apps-script*/Teacher.html.

    python3 tools/build_bilingual.py          # уроки и экраны учителя
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from i18n_core import translate
from i18n_kz_templates import TPL

root = Path(__file__).resolve().parent.parent
DIC = json.loads((root / "tools" / "i18n_kz.json").read_text(encoding="utf-8"))

# Класс может быть с казахской буквой: 8Ә, 8Ғ…
CLASS_RX = ("/^\\d{1,2}[А-ЯЁ]?$/", "/^\\d{1,2}[А-ЯЁӘҒҚҢӨҰҮҺІ]?$/")


def set_letters(js, letters, decoys=None):
    """Буквы ребуса: letters[n] — буква (или группа) задания n, decoys[n] — неверная ветка той же длины."""
    for n, let in letters.items():
        rx = re.compile(r'(\{ n: %d,[^\n]*?letter: ")[^"]*(")' % n)
        js, k = rx.subn(lambda m: m.group(1) + let + m.group(2), js)
        assert k == 1, ("letter", n)
        if decoys:
            rx = re.compile(r'(\{ n: %d,[^\n]*?decoy: ")[^"]*(")' % n)
            js, k = rx.subn(lambda m: m.group(1) + decoys[n] + m.group(2), js)
            assert k == 1, ("decoy", n)
    return js


def set_opts(js, n, letters):
    """Урок 3: буквы вариантов ответа вопроса n по порядку."""
    start = js.index("{ n: %d, chart:" % n)
    end = js.index("] }", start)
    block = js[start:end]
    it = iter(letters)
    block, k = re.subn(r'(\["[^"]*", ")[^"]*(")', lambda m: m.group(1) + next(it) + m.group(2), block)
    assert k == len(letters), ("opts", n, k)
    return js[:start] + block + js[end:]


def replace_once(js, old, new):
    assert js.count(old) == 1, ("replace", old[:60], js.count(old))
    return js.replace(old, new)


def kz_lesson1(js):
    js = replace_once(js, 'const ROWS = ["МАТЕМАТИЧЕСКИЕ", "ФУНКЦИИ"];', 'const ROWS = ["МАТЕМАТИКАЛЫҚ", "ФУНКЦИЯЛАР"];')
    js = set_letters(js, {1: "М", 2: "А", 3: "Т", 4: "Е", 5: "И", 6: "К", 7: "Л", 8: "Ы", 9: "Қ", 10: "Ф", 11: "УН", 12: "ЦЯР"})
    return replace_once(js, 'const KEY = "topic-l1";', 'const KEY = "topic-l1-kz";')


def kz_lesson2(js):
    js = replace_once(js, 'const ROWS = ["ЛОГИЧЕСКИЕ", "ФУНКЦИИ"];', 'const ROWS = ["ЛОГИКАЛЫҚ", "ФУНКЦИЯЛАР"];')
    js = set_letters(js,
                     {1: "Л", 2: "О", 3: "Г", 4: "И", 5: "К", 6: "А", 7: "Ы", 8: "Қ", 9: "Ф", 10: "УН", 11: "ЦЯ", 12: "Р"},
                     {1: "М", 2: "Ө", 3: "Ғ", 4: "І", 5: "Х", 6: "Ә", 7: "Ү", 8: "Ң", 9: "В", 10: "ҮМ", 11: "ЧЕ", 12: "П"})
    return replace_once(js, 'const KEY = "topic-l2";', 'const KEY = "topic-l2-kz";')


def kz_lesson3(js):
    js = replace_once(js, 'const ROWS = ["СТАТИСТИЧЕСКИЕ", "ФУНКЦИИ"];', 'const ROWS = ["СТАТИСТИКАЛЫҚ", "ФУНКЦИЯЛАР"];')
    opts = {1: "РСЛМ", 2: "ШВТЖ", 3: "ОАЯЭ", 4: "ЫЙЮИ", 5: "БКЩЖ", 6: "ЗЛОГ", 7: "ГЫХЛ", 8: "ВДҚП", 9: "ЫЮФО"}
    for n, s in opts.items():
        js = set_opts(js, n, list(s))
    js = set_opts(js, 10, ["ҮМ", "УН", "ӨП", "ЮЛ"])
    js = set_opts(js, 11, ["ШӘП", "ЦЯР", "ЩЕЗ", "ЖІВ"])
    # вопрос 11: «балмұздақ … көбірек / азырақ сатылады»
    start = js.index("{ n: 11, chart:"); end = js.index("] }", start)
    block = js[start:end].replace('"үлкен"', '"көбірек"').replace('"кіші"', '"азырақ"')
    js = js[:start] + block + js[end:]
    return replace_once(js, 'const KEY = "topic-l3";', 'const KEY = "topic-l3-kz";')


def kz_lesson4(js):
    # казахские слова сортируются иначе: Қ и І идут после Я
    js = replace_once(js, 'out: "[\'қарбыз\', \'бал\', \'ірімшік\']", note: "Сөздер — әліпби бойынша."',
                      'out: "[\'бал\', \'ірімшік\', \'қарбыз\']", note: "Сөздер әріп кодтары бойынша реттелді: қазақ әріптері І мен Қ — Я-дан кейін, сондықтан «қарбыз» соңында."')
    return replace_once(js, 'const KEY = "topic-l4";', 'const KEY = "topic-l4-kz";')


def kz_lesson5(js):
    """Урок «Кортеж»: тема КОРТЕЖ TUPLE одинакова в обоих языках, ребус общий."""
    return js


def kz_lesson6(js):
    return replace_once(js, 'const KEY = "topic-l6";', 'const KEY = "topic-l6-kz";')


def kz_lesson7(js):
    return replace_once(js, 'const KEY = "topic-l7";', 'const KEY = "topic-l7-kz";')


def tpl_puzzle(file):
    """Свой казахский ребус урока: блок ROWS…TASKS заменяется готовым текстом из tools/<file> целиком."""
    def tpl(src):
        a = src.index("const ROWS = ["); b = src.index("TASKS.forEach(t => { const o")
        return {src[a:b]: (root / "tools" / file).read_text(encoding="utf-8")}
    return tpl


def tpl_lesson4(src):
    """Урок 4: ребус «Робот-список» на казахском — свои программы, ответы которых складываются в БІР ӨЛШЕМДІ МАССИВ."""
    a = src.index("const ROWS = ["); b = src.index("TASKS.forEach(t => { const o")
    return {src[a:b]: (root / "tools" / "kz_lists_puzzle.js").read_text(encoding="utf-8")}


PYODIDE = "0.26.4"


def pyodide_payload():
    """Pyodide для урока «Список» встраивается в index.html: страница работает одним файлом и без сети.
    Пакет берётся из npm один раз и лежит в tools/.cache (в git не попадает)."""
    import base64, gzip, subprocess, tarfile
    cache = root / "tools" / ".cache" / f"pyodide-{PYODIDE}"
    if not (cache / "package" / "pyodide.asm.wasm").exists():
        cache.mkdir(parents=True, exist_ok=True)
        name = subprocess.run(["npm", "pack", f"pyodide@{PYODIDE}", "--silent"], cwd=cache, check=True,
                              capture_output=True, text=True).stdout.strip().splitlines()[-1]
        with tarfile.open(cache / name) as t:
            t.extractall(cache, filter="data")
    pkg = cache / "package"
    blobs = "".join(
        f'<script type="application/octet-stream" id="pyb-{f.replace(".", "-")}">'
        + base64.b64encode(gzip.compress((pkg / f).read_bytes(), 9, mtime=0)).decode() + "</script>\n"
        for f in ["pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"])
    js = "".join("<script>\n" + (pkg / f).read_text(encoding="utf-8") + "\n</script>\n" for f in ["pyodide.js", "pyodide.asm.js"])
    assert "</script" not in js.replace("\n</script>\n", "")
    return blobs + js


# Строки, где перевод по фрагментам ломает порядок слов: заменяются целиком уже в казахском тексте
KZ_FIX = {
    "lessons-8-logic": [
        ('Мына таңбамен де жауап осындай болар ма еді: > , дұрысы — >=?',
         'Егер >= орнына > таңбасы тұрса, жауап осындай болар ма еді?'),
        ('C1: "Таңбамен <>"', 'C1: "<> арқылы"'),
    ],
}

LESSONS = {
    "lessons-8": ("Математические функции · 8 класс", "Математикалық функциялар · 8 сынып", kz_lesson1),
    "lessons-8-logic": ("Логические функции · 8 класс", "Логикалық функциялар · 8 сынып", kz_lesson2),
    "lessons-8-stats": ("Статистические функции · 8 класс", "Статистикалық функциялар · 8 сынып", kz_lesson3),
    "lessons-8-lists": ("Одномерный массив. Список · 8 класс", "Бір өлшемді массив. Тізім · 8 сынып", kz_lesson4),
    "lessons-8-tuples": ("Кортеж: tuple · 8 класс", "Кортеж: tuple · 8 сынып", kz_lesson5),
    "lessons-8-dict": ("Словарь: dict · 8 класс", "Сөздік: dict · 8 сынып", kz_lesson6),
    "lessons-8-set": ("Множество: set · 8 класс", "Жиын: set · 8 сынып", kz_lesson7),
}
# Свои шаблоны урока: фрагменты исходника, которые заменяются готовым казахским текстом целиком
LESSON_TPL = {"lessons-8-lists": tpl_lesson4, "lessons-8-dict": tpl_puzzle("kz_dict_puzzle.js"), "lessons-8-set": tpl_puzzle("kz_set_puzzle.js")}
# Уроки, в которые встраивается Python (Pyodide)
LESSON_PY = {"lessons-8-lists", "lessons-8-tuples", "lessons-8-dict", "lessons-8-set"}

LANG_CSS = """
.lang-sw{display:inline-flex;align-self:center;flex:none;border:1px solid var(--line, #c9d3d8);border-radius:999px;overflow:hidden;vertical-align:middle}
.lang-sw button{font:inherit;font-size:.8rem;font-weight:700;letter-spacing:.04em;padding:.3rem .65rem;border:0;background:transparent;color:inherit;cursor:pointer}
.lang-sw button[aria-pressed="true"]{background:var(--c, #1d7652);color:#fff}
.lang-sw button:focus-visible{outline:2px solid var(--c, #1d7652);outline-offset:-2px}
.lg-card .lang-sw, #pinBox .lang-sw{display:flex;width:max-content;margin:0 0 .6rem auto}
"""

BOOT = r"""<script>
/* Язык урока: РУС | ҚАЗ. Выбор хранится в браузере; переключение перезагружает страницу. */
(function () {
  var TITLES = { ru: %(ru)s, kz: %(kz)s };
  var lang = "ru";
  try {
    var h = location.hash.slice(1);
    lang = h === "kz" || h === "ru" ? h : localStorage.getItem("fizmat-lang") || "ru";
  } catch (e) {}
  if (lang !== "kz") lang = "ru";
  document.documentElement.lang = lang === "kz" ? "kk" : "ru";
  document.title = TITLES[lang];
  var root = document.getElementById("lang-root");
  root.parentNode.replaceChild(document.getElementById("t-" + lang).content.cloneNode(true), root);
  /* Смена языка перезагружает страницу: запоминаем ученика, этап, открытую карточку и прокрутку и возвращаемся туда же */
  function here() {
    var who = document.getElementById("who"), name = document.getElementById("whoName");
    var step = document.querySelector('.step[aria-selected="true"]');
    var panel = step && document.getElementById(step.getAttribute("aria-controls"));
    var pill = panel && panel.querySelector('.fpill[aria-selected="true"]');
    return { path: location.pathname, who: who && !who.hidden && name ? name.textContent : "",
      step: step ? step.id : "", pill: pill ? pill.getAttribute("data-f") : "", y: window.scrollY };
  }
  function resume() {
    var r = null;
    try { r = JSON.parse(sessionStorage.getItem("fizmat-resume") || "null"); sessionStorage.removeItem("fizmat-resume"); } catch (e) {}
    if (!r || r.path !== location.pathname) return;
    var login = document.getElementById("login"), cls = document.getElementById("lgCls"), nm = document.getElementById("lgName");
    var i = r.who.lastIndexOf(", ");
    if (login && !login.hidden && cls && nm && i > 0) {
      nm.value = r.who.slice(0, i); cls.value = r.who.slice(i + 2);
      document.getElementById("lgGo").click();
    }
    var tries = 0;
    (function wait() {
      if (login && !login.hidden) { if (++tries < 150) setTimeout(wait, 100); return; }
      var tab = r.step && document.getElementById(r.step);
      if (tab && !tab.disabled) tab.click();
      var pill = r.pill && document.querySelector('.fpill[data-f="' + r.pill + '"]');
      if (pill) pill.click();
      [100, 500].forEach(function (ms) { setTimeout(function () { window.scrollTo(0, r.y || 0); }, ms); });
    })();
  }
  function sw() {
    var s = document.createElement("span");
    s.className = "lang-sw"; s.setAttribute("role", "group"); s.setAttribute("aria-label", "Тіл / Язык");
    [["ru", "РУС"], ["kz", "ҚАЗ"]].forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = p[1]; b.setAttribute("aria-pressed", String(p[0] === lang));
      b.addEventListener("click", function () {
        if (p[0] === lang) return;
        try { localStorage.setItem("fizmat-lang", p[0]); } catch (e) {}
        try { sessionStorage.setItem("fizmat-resume", JSON.stringify(here())); } catch (e) {}
        location.hash = p[0];
        location.reload();
      });
      s.appendChild(b);
    });
    return s;
  }
  %(places)s.forEach(function (sel) {
    var box = document.querySelector(sel);
    if (box) box.insertBefore(sw(), box.firstChild);
  });
  (lang === "kz" ? L_kz : L_ru)();
  resume();
})();
"""


def split(page):
    """head + стили | разметка | скрипт | хвост. Разметка начинается после </style> (или после <body>)."""
    a = page.index("<style>"); b = page.index("</style>") + len("</style>")
    c = page.index("<script>"); d = page.rindex("</script>")
    assert b < c
    pre, body = "", page[b:c]
    if "<body>" in body:
        i = body.index("<body>") + len("<body>"); pre, body = body[:i], body[i:]
    return page[:a], page[a:b] + pre, body, page[c + len("<script>"):d], page[d + len("</script>"):]


def assemble(src, titles, places, fix_kz, name, tpl=None):
    assert src.count("<script>") == 1 and "</template>" not in src
    kz, missing = translate(src, DIC, tpl={**TPL, **(tpl or {})})
    if missing:
        raise SystemExit(f"{name}: нет перевода для {len(missing)} фрагментов, например: {missing[:5]}")
    head, style, body_ru, js_ru, tail = split(src)
    _, _, body_kz, js_kz, _ = split(kz)
    js_kz = fix_kz(js_kz)
    # сокращения без строчных букв словарь не трогает: СОР 1 → БЖБ 1, ДЗ → ҮТ
    abbr = lambda t: re.sub(r"(?<![А-ЯЁA-Z])(СОР|СОЧ|ДЗ)(?![А-ЯЁA-Z])", lambda m: {"СОР": "БЖБ", "СОЧ": "ТЖБ", "ДЗ": "ҮТ"}[m.group(1)], t)
    body_kz, js_kz = abbr(body_kz), abbr(js_kz)
    assert "</script" not in js_ru + js_kz
    style = style.replace("</style>", LANG_CSS + "</style>", 1)
    return (head + style + '\n<div id="lang-root"></div>\n'
            + '<template id="t-ru">' + body_ru + '</template>\n'
            + '<template id="t-kz">' + body_kz + '</template>\n'
            + BOOT % {"ru": json.dumps(titles[0], ensure_ascii=False), "kz": json.dumps(titles[1], ensure_ascii=False),
                      "places": json.dumps(places)}
            + "function L_ru() {\n" + js_ru + "\n}\n"
            + "function L_kz() {\n" + js_kz + "\n}\n</script>" + (tail if tail.strip() else "\n"))


def build(folder):
    ru_title, kz_title, fix = LESSONS[folder]
    src = (root / folder / "src-ru.html").read_text(encoding="utf-8").replace(*CLASS_RX)
    def fix_kz(js):
        js = fix(js)
        for old, new in KZ_FIX.get(folder, []):
            js = replace_once(js, old, new)
        # сервер отвечает ученику на его языке
        js = replace_once(js, 'gsr("registerStudent", c, n)', 'gsr("registerStudent", c, n, "kz")')
        return replace_once(js, 'gsr("submitAnswer", { qid: shownQ,', 'gsr("submitAnswer", { qid: shownQ, lang: "kz",')
    tpl = LESSON_TPL[folder](src) if folder in LESSON_TPL else None
    page = assemble(src, (ru_title, kz_title), [".top .tools", "#login .lg-card"], fix_kz, folder, tpl)
    if folder in LESSON_PY:
        page = page.replace('<div id="lang-root"></div>\n', '<div id="lang-root"></div>\n' + pyodide_payload(), 1)
    (root / folder / "index.html").write_text(page, encoding="utf-8")
    print(f"{folder}/index.html: {len(page)} bytes")


# Экран учителя: данные с сервера (этапы, самооценка) приходят по-русски — на казахском экране
# они переводятся тем же словарём, поэтому фильтры и сравнения в коде продолжают совпадать.
DATA_WORDS = ["Получилось", "Частично", "Пока нет", "Да", "Нет"]
KZ_DATA_JS = r"""
const KZ_DATA = %s;
const KZ_TASK = { "Вопрос": "Сұрақ", "Развилка": "Айрық", "Задание": "Тапсырма" };
function kzData(v) {
  if (typeof v === "string") return v in KZ_DATA ? KZ_DATA[v] : v.replace(/\(1-я: /g, "(1-ші: ").replace(/^верно: /, "дұрыс: ")
    .replace(/^(Вопрос|Развилка|Задание) (\d+)$/, (m, a, n) => KZ_TASK[a] + " " + n);
  if (Array.isArray(v)) return v.map(kzData);
  if (v && typeof v === "object") { const o = {}; Object.keys(v).forEach(k => { o[k] = kzData(v[k]); }); return o; }
  return v;
}
"""


def build_teacher(folder):
    src = (root / "tools" / "teacher" / f"{folder}.html").read_text(encoding="utf-8")
    words = DATA_WORDS + [k for k in DIC if re.fullmatch(r"\d+\. .+", k)]
    data = {w: DIC[w] for w in words}
    def fix_kz(js):
        js = replace_once(js, 'gsr("getTeacherData", PIN, qWanted).then(d => {', 'gsr("getTeacherData", PIN, qWanted).then(d => { d = kzData(d);')
        return KZ_DATA_JS % json.dumps(data, ensure_ascii=False) + js
    page = assemble(src, ("Экран учителя", "Мұғалім экраны"), [".top .tools", "#pinBox"], fix_kz, folder)
    (root / folder / "Teacher.html").write_text(page, encoding="utf-8")
    print(f"{folder}/Teacher.html: {len(page)} bytes")


if __name__ == "__main__":
    for f in LESSONS:
        build(f)
    for f in ["apps-script", "apps-script-logic", "apps-script-stats"]:
        build_teacher(f)
