# -*- coding: utf-8 -*-
"""Практика: келесі есепке тек ағымдағы есеп «Тексеру» батырмасымен
тексеруге жіберілгеннен кейін ғана өтуге болады. Тексерілген есептерге
кез келген уақытта қайтуға болады."""

CSS = '''  .steps i.locked { opacity: .35; cursor: not-allowed; }
'''

OLD_INSTR = ("      tx('Переходить между задачами можно по номерам сверху или кнопками «Предыдущая» ' +\n"
             "         'и «Следующая». Когда закончите, нажмите «Сдать практику» — уйдут и баллы, ' +")
NEW_INSTR = ("      tx('Следующая задача открывается только после того, как текущая отправлена кнопкой «Проверить». ' +\n"
             "         'К уже проверенным задачам можно вернуться по номерам сверху или кнопкой «Предыдущая». ' +\n"
             "         'Когда закончите, нажмите «Сдать практику» — уйдут и баллы, ' +")

INSTR_RU = ('Следующая задача открывается только после того, как текущая отправлена кнопкой «Проверить». '
            'К уже проверенным задачам можно вернуться по номерам сверху или кнопкой «Предыдущая». '
            'Когда закончите, нажмите «Сдать практику» — уйдут и баллы, и ваши программы. '
            'Кнопка «Подсказка» есть только у первых двух задач: дальше пробуйте сами, а разбор появится, когда задача решена.')
INSTR_KK = ('Келесі есеп ағымдағы есепті «Тексеру» батырмасымен тексеруге жібергеннен кейін ғана ашылады. '
            'Тексерілген есептерге жоғарыдағы нөмірлер немесе «Алдыңғы» батырмасы арқылы қайта оралуға болады. '
            'Жұмысты аяқтағанда «Практиканы тапсыру» батырмасын басыңыз — ұпайларыңыз да, бағдарламаларыңыз да жіберіледі. '
            '«Кеңес» батырмасы тек алғашқы екі есепте бар: әрі қарай өзіңіз шығарып көріңіз, ал талдау есеп шешілгенде шығады.')

NEED_RU = 'Чтобы перейти к следующей задаче, сначала нажмите «Проверить».'
NEED_KK = 'Келесі есепке өту үшін алдымен «Тексеру» батырмасын басыңыз.'

UI = {INSTR_RU: INSTR_KK, NEED_RU: NEED_KK}


def patch_student(src, sub1):
    src = sub1(src, '  .steps i.extra { border-style: dashed; }\n',
               '  .steps i.extra { border-style: dashed; }\n' + CSS)
    src = sub1(src, OLD_INSTR, NEW_INSTR)
    # нөмірлер: тексерілмеген есептен әрі өтуге болмайды
    src = sub1(src, "    chip.addEventListener('click', function () { workIdx = i; workSave(); renderWork(); });",
               "    var open_ = workReach_(tasks.length);\n"
               "    if (i > open_) chip.className += ' locked';\n"
               "    chip.addEventListener('click', function () {\n"
               "      if (i > workReach_(tasks.length)) { banner(tx('" + NEED_RU + "'), 'warn'); return; }\n"
               "      workIdx = i; workSave(); renderWork();\n"
               "    });")
    # «Келесі →»: ағымдағы есеп тексерілгенше өшік
    src = sub1(src, "  next.disabled = workIdx >= tasks.length - 1;\n"
                    "  next.addEventListener('click', function () { workIdx++; workSave(); renderWork(); });",
               "  next.disabled = workIdx >= tasks.length - 1 || !(workIdx in workVerdict);\n"
               "  if (!(workIdx in workVerdict) && workIdx < tasks.length - 1) {\n"
               "    next.title = tx('" + NEED_RU + "');\n"
               "  }\n"
               "  next.addEventListener('click', function () { workIdx++; workSave(); renderWork(); });")
    src = sub1(src, 'function renderWork() {',
               '/* Ең алыс ашық есеп: алдындағы барлық есеп тексерілген болуы керек. */\n'
               'function workReach_(n) {\n'
               '  var i = 0;\n'
               '  while (i < n - 1 && (i in workVerdict)) i++;\n'
               '  return i;\n'
               '}\n\n'
               'function renderWork() {\n'
               '  if (DATA && DATA.lesson && DATA.lesson.work &&\n'
               '      workIdx > workReach_(DATA.lesson.work.tasks.length)) {\n'
               '    workIdx = workReach_(DATA.lesson.work.tasks.length);\n'
               '  }')
    return src
