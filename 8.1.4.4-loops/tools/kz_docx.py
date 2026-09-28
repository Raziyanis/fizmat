"""Docx құжатын абзац бөліктері бойынша аударады (қалың / қалың емес бөліктер жеке аударылады).
Әр орысша бөлік T сөздігінде болуы тиіс (немесе keep өрнегіне сәйкес келуі тиіс), әйтпесе қате шығады.
Пішім (қаріп, кесте, түс) өзгермейді."""
import re, sys, zipfile

CYR = re.compile('[А-Яа-яЁё]')


def translate_docx(SRC, DST, T, keep=None):
    z = zipfile.ZipFile(SRC)
    x = z.read('word/document.xml').decode('utf-8')
    used = set()
    def fix_par(m):
        p = m.group(0)
        runs = list(re.finditer(r'<w:r\b.*?</w:r>', p, re.S))
        groups = []
        for r in runs:
            t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)', r.group(0)))
            if not t:
                continue
            b = bool(re.search(r'<w:b/>|<w:b w:val="(1|true)"/>', r.group(0)))
            if groups and groups[-1][0] == b:
                groups[-1][1].append(r); groups[-1][2] += t
            else:
                groups.append([b, [r], t])
        repl = {}
        for b, rs, t in groups:
            if not CYR.search(t) or (keep and re.fullmatch(keep, t)):
                continue
            if t not in T:
                sys.exit('Аудармасы жоқ: ' + repr(t))
            used.add(t)
            for k, r in enumerate(rs):
                new = r.group(0)
                new = re.sub(r'<w:t[^>]*>[^<]*</w:t>', '', new)
                if k == 0:
                    new = new.replace('</w:r>', '<w:t xml:space="preserve">' + T[t] + '</w:t></w:r>')
                new = new.replace('<w:lang w:val="ru-RU"/>', '<w:lang w:val="kk-KZ"/>')
                repl[r.start()] = (r.end(), new)
        if not repl:
            return p
        out, pos = [], 0
        for st in sorted(repl):
            end, new = repl[st]
            out.append(p[pos:st]); out.append(new); pos = end
        out.append(p[pos:])
        return ''.join(out)

    x = re.sub(r'<w:p\b.*?</w:p>', fix_par, x, flags=re.S)
    unused = set(T) - used
    if unused:
        sys.exit('Қолданылмаған аудармалар: ' + repr(sorted(unused)))
    DST.parent.mkdir(exist_ok=True)
    zo = zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED)
    for i in z.infolist():
        zo.writestr(i, x.encode('utf-8') if i.filename == 'word/document.xml' else z.read(i.filename))
    zo.close()
    print(DST.name, 'дайын')
