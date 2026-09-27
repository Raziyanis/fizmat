#!/usr/bin/env python3
"""Аудармада орысша сөз қалды ма? Тексеру.

Использование: python3 tools/check-kz.py ОРИГИНАЛ ПЕРЕВОД [ОРИГИНАЛ ПЕРЕВОД ...]
Файлы: .html, .docx, .pptx, а также папка со слайдами (*.html) и .js/.json.
Из оригинала берутся все русские слова (без комментариев кода и CSS). В переводе ищутся те же слова.
Совпадения выводятся списком; слова, которые одинаково пишутся по-русски и по-казахски, перечислены в SHARED.
"""
import re, sys, zipfile, pathlib

# Слова, которые пишутся одинаково в обоих языках (термины и заимствования).
SHARED = {
    'балл', 'разряд', 'минут', 'мин', 'информатика', 'сервер', 'браузер', 'демо', 'таймер', 'дескриптор',
    'рефлексия', 'формула',
    'режим',          # «толық экран режимі» — казахша да осылай
    'не', 'он',       # қазақша сөздер: «не» (немесе), «он» (10, он алтылық)
    'да', 'факт',     # «қосу арқылы да» (шылау), «1-факт»
    'цифры',          # қазақша тәуелдік форма: «9 цифры жоқ»
}

CYR = re.compile(r'[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+')


def visible_text(path):
    p = pathlib.Path(path)
    if p.is_dir():
        return '\n'.join(visible_text(f) for f in sorted(p.rglob('*')) if f.suffix in ('.html', '.json'))
    if p.suffix in ('.docx', '.pptx'):
        z = zipfile.ZipFile(p)
        tag = 'w:t' if p.suffix == '.docx' else 'a:t'
        out = []
        for n in z.namelist():
            if n.endswith('.xml') and ('word/document' in n or 'ppt/slides/slide' in n or 'ppt/notesSlides' in n):
                out += re.findall(rf'<{tag}(?: [^>]*)?>([^<]*)</{tag}>', z.read(n).decode('utf-8'))
        return '\n'.join(out)
    s = p.read_text(encoding='utf-8')
    s = re.sub(r'<style[\s\S]*?</style>', ' ', s)
    s = re.sub(r'<!--[\s\S]*?-->', ' ', s)
    s = re.sub(r'/\*[\s\S]*?\*/', ' ', s)          # комментарии JS/CSS
    s = re.sub(r'(?m)^\s*//.*$', ' ', s)
    s = re.sub(r'(?<=[;{}),])\s*//[^\n]*', ' ', s)  # комментарии в конце строки кода
    return s


def words(text):
    return {w.lower() for w in CYR.findall(text)}


def main(args):
    if len(args) < 2 or len(args) % 2:
        sys.exit(__doc__)
    bad_total = 0
    for ru, kz in zip(args[::2], args[1::2]):
        left = sorted(words(visible_text(ru)) & words(visible_text(kz)) - SHARED)
        bad_total += len(left)
        print(f'{pathlib.Path(kz).name}: ' + ('орысша сөз табылмады ✔' if not left else f'{len(left)} сөз қалды: ' + ', '.join(left)))
    sys.exit(1 if bad_total else 0)


if __name__ == '__main__':
    main(sys.argv[1:])
