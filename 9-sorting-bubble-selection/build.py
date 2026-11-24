# Собирает автономный index.html (открывается двойным щелчком, работает без интернета)
import pathlib
d=pathlib.Path(__file__).parent
body=(d/'lesson.html').read_text(encoding='utf-8')
head,rest=body.split('</style>',1)
(d/'index.html').write_text('<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+'</style>\n</head>\n<body>\n'+rest.strip()+'\n</body>\n</html>\n',encoding='utf-8')
