"""Перевод страницы урока на казахский: разбивка на фрагменты, защищённые места, применение словаря.

Страница режется на фрагменты по разделителям HTML и JS (< > " ' ` { } $ \\ перевод строки и &quot;).
Каждый фрагмент с кириллицей переводится целиком по словарю. Одинаковый фрагмент везде переводится
одинаково — поэтому слово «зачёт» в ячейке, в формуле-эталоне и в тексте задания совпадает.
"""
import re

QUOT = "\x01"   # &quot; на время разбивки становится разделителем
SEG = re.compile(r'[^<>"\'`{}$\\\n\x01\x02]*[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі][^<>"\'`{}$\\\n\x01\x02]*')
LOWER = re.compile(r"[а-яёәғқңөұүһі]")

# Места, которые остаются на русском: их читает экран учителя (этапы, сводка, лента попыток)
PROTECT = [
    re.compile(r"function lessonSummary\(\) \{.*?\n\}", re.S),
    re.compile(r"const STAGES = \{[^\n]*"),
    re.compile(r"[^\n]*__onAttempt\([^\n]*"),
    re.compile(r'stage: "[^"]*"'),
    re.compile(r'"всё решено"'),
    re.compile(r"<!--.*?-->", re.S),
    re.compile(r'<title>[^<]*</title>'),
    re.compile(r"/\*.*?\*/", re.S),                 # комментарии CSS и JS
    re.compile(r"(?<=\s)// [^\n]*"),
    re.compile(r"\[[^\]\n]*А-Я[^\]\n]*\]"),        # буквенные классы в регулярных выражениях
]

def protect(text, extra=(), tpl=None):
    saved = []
    def keep(m):
        saved.append(m.group(0)); return f"\x02{len(saved) - 1}\x02"
    for ru, kz in (tpl or {}).items():            # шаблоны с подстановками: целиком, готовым переводом
        ru = ru.replace("&quot;", QUOT)
        if ru in text:
            saved.append(kz); text = text.replace(ru, f"\x02{len(saved) - 1}\x02")
    for rx in list(PROTECT) + list(extra):
        text = rx.sub(keep, text)
    return text, saved

def restore(text, saved):
    return re.sub(r"\x02(\d+)\x02", lambda m: saved[int(m.group(1))], text)

def identity(seg):
    """Фрагмент без строчных букв — формула, код ошибки, адрес, ИСТИНА/ЛОЖЬ: не переводится."""
    return not LOWER.search(seg)

def segments(text, tpl=None):
    """Все фрагменты с кириллицей (без пробелов по краям), которые нужно перевести."""
    text, _ = protect(text.replace("&quot;", QUOT), tpl=tpl)
    out = []
    for m in SEG.finditer(text):
        core = m.group(0).strip()
        if core and not identity(core):
            out.append(core)
    return out

def translate(text, dic, extra_protect=(), tpl=None):
    """Применить словарь ко всей странице. Возвращает (перевод, список непереведённых фрагментов)."""
    text, saved = protect(text.replace("&quot;", QUOT), extra_protect, tpl)
    missing = []
    def tr(m):
        s = m.group(0); core = s.strip()
        if not core or identity(core): return s
        if core not in dic:
            missing.append(core); return s
        lead = s[:len(s) - len(s.lstrip())]; tail = s[len(s.rstrip()):]
        return lead + dic[core] + tail
    text = SEG.sub(tr, text)
    return restore(text, saved).replace(QUOT, "&quot;"), missing
