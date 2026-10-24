"""Собирает двуязычную страницу урока (русский + казахский) из src-ru.html.

Русский текст правится только в src-ru.html. Казахский получается словарём tools/i18n_kz.json
(фрагмент → перевод), шаблонами tools/i18n_kz_templates.py и правками ниже (ребус темы и то,
что зависит от порядка слов). В index.html лежат обе версии разметки в <template> и оба скрипта
в функциях L_ru / L_kz; язык выбирается кнопками РУС | ҚАЗ и запоминается в браузере.

    python3 tools/build_bilingual.py          # все три урока
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
}

LANG_CSS = """
.lang-sw{display:inline-flex;align-self:center;flex:none;border:1px solid var(--line, #c9d3d8);border-radius:999px;overflow:hidden;vertical-align:middle}
.lang-sw button{font:inherit;font-size:.8rem;font-weight:700;letter-spacing:.04em;padding:.3rem .65rem;border:0;background:transparent;color:inherit;cursor:pointer}
.lang-sw button[aria-pressed="true"]{background:var(--c, #1d7652);color:#fff}
.lang-sw button:focus-visible{outline:2px solid var(--c, #1d7652);outline-offset:-2px}
.lg-card .lang-sw{display:flex;width:max-content;margin:0 0 .6rem auto}
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
  var app = document.getElementById("app");
  app.parentNode.replaceChild(document.getElementById("t-" + lang).content.cloneNode(true), app);
  function sw() {
    var s = document.createElement("span");
    s.className = "lang-sw"; s.setAttribute("role", "group"); s.setAttribute("aria-label", "Тіл / Язык");
    [["ru", "РУС"], ["kz", "ҚАЗ"]].forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = p[1]; b.setAttribute("aria-pressed", String(p[0] === lang));
      b.addEventListener("click", function () {
        if (p[0] === lang) return;
        try { localStorage.setItem("fizmat-lang", p[0]); } catch (e) {}
        location.hash = p[0];
        location.reload();
      });
      s.appendChild(b);
    });
    return s;
  }
  var tools = document.querySelector(".top .tools");
  if (tools) tools.insertBefore(sw(), tools.firstChild);
  var card = document.querySelector("#login .lg-card");
  if (card) card.insertBefore(sw(), card.firstChild);
  (lang === "kz" ? L_kz : L_ru)();
})();
"""


def split(page):
    a = page.index("<style>"); b = page.index("</style>") + len("</style>")
    c = page.index("<script>"); d = page.rindex("</script>")
    assert b < c
    return page[:a], page[a:b], page[b:c], page[c + len("<script>"):d]


def build(folder):
    ru_title, kz_title, fix = LESSONS[folder]
    src = (root / folder / "src-ru.html").read_text(encoding="utf-8")
    assert src.count("<script>") == 1 and "</template>" not in src
    src = src.replace(*CLASS_RX)
    kz, missing = translate(src, DIC, tpl=TPL)
    if missing:
        raise SystemExit(f"{folder}: нет перевода для {len(missing)} фрагментов, например: {missing[:5]}")
    head, style, body_ru, js_ru = split(src)
    _, _, body_kz, js_kz = split(kz)
    js_kz = fix(js_kz)
    for old, new in KZ_FIX.get(folder, []):
        js_kz = replace_once(js_kz, old, new)
    # сервер отвечает ученику на его языке
    js_kz = replace_once(js_kz, 'gsr("registerStudent", c, n)', 'gsr("registerStudent", c, n, "kz")')
    js_kz = replace_once(js_kz, 'gsr("submitAnswer", { qid: shownQ,', 'gsr("submitAnswer", { qid: shownQ, lang: "kz",')
    assert "</script" not in js_ru + js_kz
    style = style.replace("</style>", LANG_CSS + "</style>")
    page = (head + style + '\n<div id="app"></div>\n'
            + '<template id="t-ru">' + body_ru + '</template>\n'
            + '<template id="t-kz">' + body_kz + '</template>\n'
            + BOOT % {"ru": json.dumps(ru_title, ensure_ascii=False), "kz": json.dumps(kz_title, ensure_ascii=False)}
            + "function L_ru() {\n" + js_ru + "\n}\n"
            + "function L_kz() {\n" + js_kz + "\n}\n</script>\n")
    (root / folder / "index.html").write_text(page, encoding="utf-8")
    print(f"{folder}/index.html: {len(page)} bytes")


if __name__ == "__main__":
    for f in LESSONS:
        build(f)
