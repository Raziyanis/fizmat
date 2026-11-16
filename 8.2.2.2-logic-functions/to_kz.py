import sys, re, openpyxl
sys.path.insert(0, sys.argv[3])
from kz_dict import LIT, TXT, KEEP, OTHER, SHEETS
src, dst = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src)
QRE = re.compile(r'"((?:[^"]|"")*)"')
miss = set()
def lit_sub(f):
    def rep(m):
        v = m.group(1)
        return '"' + LIT.get(v, v) + '"'
    return QRE.sub(rep, f)
def sheet_sub(f):
    for a, b in SHEETS.items():
        f = f.replace(f"'{a}'!", f"'{b}'!")
    return f
RU = re.compile('[а-яё]', re.I)
for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str): continue
            dt = c.data_type
            if c.data_type == 'f':
                f = sheet_sub(lit_sub(v))
                # accept Kazakh answers
                f = re.sub(r'UPPER\((C\d+)\)="TRUE"', r'UPPER(\1)="TRUE",UPPER(\1)="АҚИҚАТ"', f)
                f = re.sub(r'UPPER\((C\d+)\)="FALSE"', r'UPPER(\1)="FALSE",UPPER(\1)="ЖАЛҒАН"', f)
                f = re.sub(r'(LOWER\(TRIM\((\w+)&""\)\))="жоқ"', r'\1="жоқ",\1="жок"', f)
                f = re.sub(r'(LOWER\(TRIM\((\w+)&""\)\))="ложь"', r'\1="ложь",\1="жалған",\1="жалган"', f)
                c.value = f
            elif v in KEEP:
                pass
            elif v in TXT:
                c.value = TXT[v]
            else:
                nv = lit_sub(v)
                if nv == v and RU.search(v) and not v.startswith('='):
                    miss.add(v)
                c.value = nv
            if dt == 's' and isinstance(c.value, str) and c.value.startswith('='):
                c.data_type = 's'
            if c.hyperlink is not None and c.hyperlink.location:
                c.hyperlink.location = sheet_sub(c.hyperlink.location)
    for cf in ws.conditional_formatting:
        for r in cf.rules:
            r.formula = [sheet_sub(lit_sub(x)) for x in r.formula]
    for dv in ws.data_validations.dataValidation:
        for attr in ('prompt', 'promptTitle', 'error', 'errorTitle'):
            x = getattr(dv, attr)
            if x: setattr(dv, attr, OTHER.get(x, x))
    for k, rd in list(ws.row_dimensions.items()):
        if rd.height and rd.height > 20: rd.height = round(rd.height * 1.15, 1)
import math
from openpyxl.utils import column_index_from_string
for ws in wb:
    for mr in ws.merged_cells.ranges:
        if mr.min_row == 2 and mr.max_row == 2 and mr.min_col == 1:
            w = sum((ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width or 9) for i in range(mr.min_col, mr.max_col + 1))
            txt = str(ws.cell(2, 1).value or '')
            ws.row_dimensions[2].height = max(18, 14 * math.ceil(len(txt) * 1.05 / w) + 6)
for a, b in SHEETS.items():
    wb[a].title = b
wb.save(dst)
print('MISSING:', sorted(miss))
