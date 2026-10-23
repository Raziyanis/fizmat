"""Собирает apps-script/Lesson.html из lessons-8/index.html для Google Apps Script."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
page = (root / "lessons-8" / "index.html").read_text(encoding="utf-8")
out = ('<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<base target="_top">\n'
       + page + '\n</html>\n')
(root / "apps-script" / "Lesson.html").write_text(out, encoding="utf-8")
print("apps-script/Lesson.html:", len(out), "bytes")
