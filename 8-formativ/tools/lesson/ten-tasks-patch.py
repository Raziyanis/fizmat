#!/usr/bin/env python3
"""Урок, этап 9: «Практическая работа» — 10 задач сразу на странице (3 проекта + 7 задач с тестами), без слова «олимпиада».
Запуск: python3 -I ten-tasks-patch.py <урок.html> <выход.html>"""
import sys, json
src, out = sys.argv[1:3]
s = open(src, encoding='utf-8').read()

def rep(a, b, n):
    global s
    assert s.count(a) == n, (a[:70], s.count(a), n)
    s = s.replace(a, b)

NEW = {
 'ru': dict(name="Без повторов",
   text="Ученики называли свои любимые числа — всего n чисел. Выпиши каждое число один раз, в том порядке, в котором оно встретилось впервые.",
   inp="В первой строке — целое число n (1 ≤ n ≤ 100). Во второй — n целых чисел через пробел, каждое от 1 до 20.",
   out="Выведи числа без повторов через пробел, в порядке первого появления.",
   hint="Заведи пустой список b = []. Для каждого x из a: если x not in b — b.append(x). Потом выведи элементы b через пробел."),
 'kz': dict(name="Қайталаусыз",
   text="Оқушылар өздерінің сүйікті сандарын айтты — барлығы n сан. Әр санды бір рет қана, алғаш кездескен ретімен жазып шығар.",
   inp="Бірінші жолда — бүтін сан n (1 ≤ n ≤ 100). Екінші жолда — бос орын арқылы n бүтін сан, әрқайсысы 1-ден 20-ға дейін.",
   out="Сандарды қайталамай, алғаш кездескен ретімен бос орын арқылы шығар.",
   hint="Бос тізім b = [] жаса. a-дағы әр x үшін: егер x not in b болса — b.append(x). Соңында b элементтерін бос орын арқылы шығар."),
}
REF = "n = int(input())\na = list(map(int, input().split()))\nb = []\nfor x in a:\n    if x not in b:\n        b.append(x)\nfor x in b:\n    print(x, end=\" \")"
J = lambda x: json.dumps(x, ensure_ascii=False)
def task(lang):
    t = NEW[lang]
    return (',\n  { id: "G", stars: 2, name: %s,\n    text: %s,\n    inp: %s,\n    out: %s,\n'
            '    samples: [["7\\n3 5 3 1 5 5 2", "3 5 1 2"], ["3\\n4 4 4", "4"]],\n    hidden: ["1\\n9", "5\\n1 2 3 4 5", "6\\n2 1 2 1 2 1"],\n'
            '    gen: r => { const n = olInt(r, 1, 100); return n + "\\n" + olArr(r, n, 1, 20).join(" "); },\n'
            '    start: "n = int(input())\\na = list(map(int, input().split()))\\n",\n    ref: %s,\n    hint: %s }\n];\nTASKS_OL.forEach((t, i) => {'
            % (J(t['name']), J(t['text']), J(t['inp']), J(t['out']), J(REF), J(t['hint'])))
parts = s.split('\n];\nTASKS_OL.forEach((t, i) => {')
assert len(parts) == 3, len(parts)
s = parts[0] + task('ru') + parts[1] + task('kz') + parts[2]

# номера 1–10: проекты 1–3, задачи с тестами 4–10
rep('TASKS_OL.forEach((t, i) => {\n', 'TASKS_OL.forEach((t, i) => {\n  t.no = i + 4;\n', 2)
rep('function pjRender() {', 'TASKS_PJ.forEach((t, i) => { t.no = i + 1; });\nfunction pjRender() {', 2)
rep('  const head = t.lvName ? `${t.lvName} · ${t.fn}` : `${KIND[t.kind]} · ${t.fn}`;', '  const head = t.no ? t.fn : t.lvName ? `${t.lvName} · ${t.fn}` : `${KIND[t.kind]} · ${t.fn}`;', 2)
rep('<span class="tc-id">${t.id}</span><span class="tc-fn">${head}</span>', '<span class="tc-id">${t.no || t.id}</span><span class="tc-fn">${head}</span>', 2)
rep('<span class="tc-id">${t.id}</span><span class="tc-fn">${t.name}</span>', '<span class="tc-id">${t.no}</span><span class="tc-fn">${t.name}</span>', 2)
# все задачи видны сразу, вкладки-кнопки скрыты
rep('c.hidden = c.id !== "pj-" + id;', 'c.hidden = false;', 2)
rep('c.hidden = c.id !== "ol-" + id;', 'c.hidden = false;', 2)
rep('<div class="ex-pills" id="pjPills"', '<div class="ex-pills" hidden id="pjPills"', 2)
rep('<div class="ex-pills" id="olPills"', '<div class="ex-pills" hidden id="olPills"', 2)
rep('"Олимпиада " + t.id', '"Задача " + t.no', 2)
# тексты
rep('<p class="lead">Три небольших проекта. В каждом нужно написать программу целиком: прочитать данные в список и обработать их методами и функциями. Выбери проект — можно сделать все три. Программу проверяют на нескольких наборах данных.</p>',
    '<p class="lead">10 задач — от простых к сложным. В каждой нужно написать программу целиком: прочитать данные в список и обработать их методами и функциями. Программу проверяют на нескольких наборах данных.</p>', 1)
rep('<p class="lead">Үш шағын жоба. Әрқайсысында бағдарламаны толық жазу керек: деректерді тізімге оқып, оларды әдістер мен функциялар арқылы өңдеу. Жобаны таңда — үшеуін де орындауға болады. Бағдарлама бірнеше деректер жиынында тексеріледі.</p>',
    '<p class="lead">10 есеп — жеңілден қиынға қарай. Әрқайсысында бағдарламаны толық жазу керек: деректерді тізімге оқып, оларды әдістер мен функциялар арқылы өңдеу. Бағдарлама бірнеше деректер жиынында тексеріледі.</p>', 1)
rep('<h2>Олимпиадные задачи</h2>', '<h2>Задачи 4–10</h2>', 1)
rep('<h2>Олимпиадалық есептер</h2>', '<h2>4–10 есептер</h2>', 1)
rep('aria-label="Олимпиадные задачи"', 'aria-label="Задачи 4–10"', 1)
rep('aria-label="Олимпиадалық есептер"', 'aria-label="4–10 есептер"', 1)
rep('Задачи в стиле олимпиад и сайта Codeforces. У каждой задачи', 'У каждой задачи', 1)
rep('Олимпиадалар мен Codeforces сайтының үлгісіндегі есептер. Әр есептің', 'Әр есептің', 1)
rep('<b>Как в олимпиадах читают и выводят список.</b>', '<b>Как в задачах читают и выводят список.</b>', 1)
rep('<b>Олимпиадаларда тізім қалай оқылады және шығарылады.</b>', '<b>Есептерде тізім қалай оқылады және шығарылады.</b>', 1)
rep('`Сделано проектов: ${ok} из ${TASKS_PJ.length}`', '`Задачи 1–3: решено ${ok} из ${TASKS_PJ.length}`', 1)
rep('`Орындалған жобалар: ${ok} / ${TASKS_PJ.length}`', '`1–3 есептер: шешілгені ${ok} / ${TASKS_PJ.length}`', 1)
rep('`Решено задач: ${ok} из ${TASKS_OL.length}`', '`Задачи 4–10: решено ${ok} из ${TASKS_OL.length}`', 1)
rep('`Шешілген есептер: ${ok} / ${TASKS_OL.length}`', '`4–10 есептер: шешілгені ${ok} / ${TASKS_OL.length}`', 1)
rep('На олимпиаде n участников', 'На конкурсе n участников', 1)
rep('Олимпиадада n қатысушы', 'Байқауда n қатысушы', 1)
assert 'лимпиад' not in s.replace('/* Олимпиадные задачи', ''), [s[i-60:i+40] for i in range(len(s)) if s.startswith('лимпиад', i)][:5]
open(out, 'w', encoding='utf-8').write(s)
print('OK', out)
