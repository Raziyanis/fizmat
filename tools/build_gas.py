"""Собирает Lesson.html для Google Apps Script из веб-версии каждого урока."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for src, dst in [("lessons-8", "apps-script"), ("lessons-8-logic", "apps-script-logic")]:
    page = (root / src / "index.html").read_text(encoding="utf-8")
    out = ('<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<base target="_top">\n'
           + page + '\n</html>\n')
    (root / dst / "Lesson.html").write_text(out, encoding="utf-8")
    print(f"{dst}/Lesson.html:", len(out), "bytes")
