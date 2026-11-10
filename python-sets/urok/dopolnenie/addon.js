
/* =====================================================================
   ДОПОЛНЕНИЕ К УРОКУ (общий код для файла ученика и экрана учителя)
   · этап «Тема»: карточки методов списка и загадка, которая открывает тему;
   · новая тема разделена на две части: «Новая тема» (шаги 1–12) и
     «Операции» (шаги 13–24);
   · в конце каждой части — задание на сопоставление «метод — описание».
   Всё работает в браузере, на сервер ничего нового не отправляется.
   Тексты на двух языках: mxT('по-русски', 'қазақша').
   ===================================================================== */
var MX_HOST = (typeof drawLessonPanelAll_ === 'function') ? 'teacher' : 'student';
function mxKk() { return typeof LANG !== 'undefined' && LANG === 'kk'; }
function mxT(ru, kk) { return mxKk() ? kk : ru; }
function mxEl(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function mxEsc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function mxShuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function mxTime(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function mxSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function mxLesson() { return MX_HOST === 'teacher' ? (LAST && LAST.lesson) : (DATA && DATA.lesson); }
function mxBtnClass(main) { return MX_HOST === 'teacher' ? (main ? 'big-action' : 'act') : (main ? 'action' : 'quiet'); }
var MX_COLORS = ['#e8456f', '#e07b00', '#b38f00', '#00968a', '#1f8ad6', '#3651d4', '#6a4fe0', '#a43bd6', '#138a4b', '#c4500a'];

/* ---------------- данные: два задания на сопоставление ---------------- */
var MX_PAIRS = {
  1: [
    { m: 's.add(x)', slide: 4,
      d: ['Добавляет один элемент x. Если такой элемент уже есть, множество не меняется.', 'Бір x элементін қосады. Мұндай элемент бұрыннан болса, жиын өзгермейді.'],
      w: ['add(x) кладёт в множество ровно один элемент. Если x уже есть, ничего не меняется: в множестве не бывает повторов. Добавить сразу несколько элементов — это update.',
          'add(x) жиынға дәл бір элемент қосады. x бұрыннан болса, ештеңе өзгермейді: жиында қайталанатын элемент болмайды. Бірнеше элементті бірден update қосады.'] },
    { m: 's.remove(x)', slide: 6,
      d: ['Удаляет элемент x. Если такого элемента нет, возникает ошибка KeyError.', 'x элементін өшіреді. Мұндай элемент болмаса, KeyError қатесі шығады.'],
      w: ['remove(x) удаляет именно тот элемент, который указан в скобках. Если такого элемента нет, Python останавливает программу с ошибкой KeyError — в этом главное отличие от discard.',
          'remove(x) жақшада көрсетілген элементті өшіреді. Мұндай элемент болмаса, Python бағдарламаны KeyError қатесімен тоқтатады — discard әдісінен басты айырмашылығы осында.'] },
    { m: 's.discard(x)', slide: 7,
      d: ['Удаляет элемент x, если он есть. Если его нет, ошибки не будет.', 'x элементі бар болса, оны өшіреді. Жоқ болса, қате шықпайды.'],
      w: ['discard(x) тоже удаляет указанный элемент x, но если его нет, просто ничего не делает — ошибки не будет.',
          'discard(x) да көрсетілген x элементін өшіреді, бірақ ол жоқ болса, ештеңе істемейді — қате шықпайды.'] },
    { m: 's.pop()', slide: 8,
      d: ['Удаляет из множества произвольный элемент и возвращает его. Для пустого множества — ошибка KeyError.', 'Жиыннан кез келген бір элементті өшіріп, оны қайтарады. Бос жиында KeyError қатесі шығады.'],
      w: ['У pop() скобки пустые: вы не говорите, что удалить. Python сам выбирает элемент, удаляет его и возвращает, поэтому его можно сохранить: x = s.pop().',
          'pop() жақшасы бос: нені өшіру керек екенін сіз айтпайсыз. Python элементті өзі таңдап, өшіреді және қайтарады, сондықтан оны сақтап қоюға болады: x = s.pop().'] },
    { m: 's.clear()', slide: 9,
      d: ['Удаляет все элементы: множество становится пустым.', 'Барлық элементті өшіреді: жиын бос болып қалады.'],
      w: ['clear() удаляет не один элемент, а все сразу. После него множество пустое: set().',
          'clear() бір элементті емес, бәрін бірден өшіреді. Одан кейін жиын бос болады: set().'] },
    { m: 's.update(t)', slide: 5,
      d: ['Добавляет в множество сразу все элементы из t.', 't ішіндегі барлық элементті жиынға бірден қосады.'],
      w: ['update(t) получает целую коллекцию t (список, строку, множество) и добавляет все её элементы. add добавляет только один.',
          'update(t) тұтас t жинағын (тізім, жол, жиын) алып, оның барлық элементін қосады. add тек біреуін қосады.'] },
    { m: 's.copy()', slide: 10,
      d: ['Возвращает новое множество с теми же элементами.', 'Дәл сондай элементтері бар жаңа жиын қайтарады.'],
      w: ['copy() не меняет s, а создаёт новое множество с такими же элементами. Если изменить копию, исходное множество останется прежним.',
          'copy() s жиынын өзгертпейді, дәл сондай элементтері бар жаңа жиын жасайды. Көшірмені өзгертсеңіз, бастапқы жиын өзгермейді.'] },
    { m: 'len(s)', slide: 0,
      d: ['Возвращает количество элементов множества.', 'Жиындағы элементтер санын қайтарады.'],
      w: ['len(s) — функция, а не метод: пишется len(s), а не s.len(). Она ничего не меняет в множестве, только считает элементы.',
          'len(s) — әдіс емес, функция: s.len() емес, len(s) деп жазылады. Ол жиынды өзгертпейді, тек элементтерді санайды.'] }
  ],
  2: [
    { m: 'a.union(b)', slide: 13,
      d: ['Возвращает новое множество из всех элементов a и b.', 'a мен b жиындарының барлық элементінен тұратын жаңа жиын қайтарады.'],
      w: ['union(b) собирает в новое множество все элементы a и все элементы b. Общие элементы не дублируются. То же самое записывается оператором a | b.',
          'union(b) a мен b жиындарының барлық элементін жаңа жиынға жинайды. Ортақ элементтер қайталанбайды. Дәл осыны a | b операторымен де жазуға болады.'] },
    { m: 'a.intersection(b)', slide: 14,
      d: ['Возвращает новое множество из элементов, которые есть и в a, и в b.', 'a-да да, b-да да бар элементтерден тұратын жаңа жиын қайтарады.'],
      w: ['intersection(b) оставляет только элементы, которые есть одновременно в a и в b. Оператор: a & b.',
          'intersection(b) a-да да, b-да да бір мезгілде бар элементтерді ғана қалдырады. Операторы: a & b.'] },
    { m: 'a.difference(b)', slide: 15,
      d: ['Возвращает новое множество из элементов a, которых нет в b.', 'a-да бар, бірақ b-да жоқ элементтерден тұратын жаңа жиын қайтарады.'],
      w: ['difference(b) — это «a без b»: элементы a, которых нет в b. Порядок важен: a.difference(b) и b.difference(a) дают разные множества. Оператор: a - b.',
          'difference(b) — «b-сыз a»: a-да бар, бірақ b-да жоқ элементтер. Рет маңызды: a.difference(b) пен b.difference(a) әртүрлі жиын береді. Операторы: a - b.'] },
    { m: 'a.symmetric_difference(b)', slide: 16,
      d: ['Возвращает новое множество из элементов, которые есть только в одном из множеств: в a или в b, но не в обоих.', 'Жиындардың тек біреуінде ғана бар элементтерден тұратын жаңа жиын қайтарады: a-да немесе b-да, бірақ екеуінде бірдей емес.'],
      w: ['symmetric_difference(b) — элементы, которые есть ровно в одном из множеств. Общие элементы отбрасываются. Оператор: a ^ b.',
          'symmetric_difference(b) — жиындардың дәл біреуінде ғана бар элементтер. Ортақ элементтер алынып тасталады. Операторы: a ^ b.'] },
    { m: 'a.issubset(b)', slide: 20,
      d: ['Возвращает True, если каждый элемент a есть в b.', 'a-ның әрбір элементі b-да болса, True қайтарады.'],
      w: ['issubset(b) отвечает на вопрос «лежит ли a целиком внутри b?» и возвращает True или False. Оператор: a <= b.',
          'issubset(b) «a толығымен b-ның ішінде ме?» деген сұраққа жауап беріп, True немесе False қайтарады. Операторы: a <= b.'] },
    { m: 'a.issuperset(b)', slide: 21,
      d: ['Возвращает True, если a содержит все элементы b.', 'a жиыны b-ның барлық элементін қамтыса, True қайтарады.'],
      w: ['issuperset(b) отвечает на вопрос «содержит ли a все элементы b?». Это проверка в обратную сторону по сравнению с issubset. Оператор: a >= b.',
          'issuperset(b) «a жиыны b-ның барлық элементін қамти ма?» деген сұраққа жауап береді. Бұл — issubset-ке қарама-қарсы бағыттағы тексеру. Операторы: a >= b.'] },
    { m: 'a.isdisjoint(b)', slide: 22,
      d: ['Возвращает True, если у a и b нет ни одного общего элемента.', 'a мен b-ның бірде-бір ортақ элементі болмаса, True қайтарады.'],
      w: ['isdisjoint(b) возвращает True, если у множеств нет ни одного общего элемента, то есть их пересечение пустое.',
          'isdisjoint(b) жиындардың бірде-бір ортақ элементі болмаса, яғни олардың қиылысуы бос болса, True қайтарады.'] },
    { m: 'a.difference_update(b)', slide: 18,
      d: ['Удаляет из самого a все элементы, которые есть в b. Новое множество не создаётся.', 'a жиынының өзінен b-да бар элементтердің бәрін өшіреді. Жаңа жиын жасалмайды.'],
      w: ['difference_update(b) удаляет элементы b прямо из a и ничего не возвращает. Оператор: a -= b. В отличие от difference, новое множество не создаётся.',
          'difference_update(b) b-ның элементтерін тікелей a-дан өшіреді және ештеңе қайтармайды. Операторы: a -= b. difference-тен айырмашылығы — жаңа жиын жасалмайды.'] },
    { m: 'a.intersection_update(b)', slide: 17,
      d: ['Оставляет в самом a только элементы, которые есть и в b. Новое множество не создаётся.', 'a жиынының өзінде тек b-да да бар элементтерді қалдырады. Жаңа жиын жасалмайды.'],
      w: ['intersection_update(b) оставляет в a только общие с b элементы и ничего не возвращает. Оператор: a &= b. В отличие от intersection, меняется само a.',
          'intersection_update(b) a-да тек b-мен ортақ элементтерді қалдырады және ештеңе қайтармайды. Операторы: a &= b. intersection-нан айырмашылығы — a-ның өзі өзгереді.'] },
    { m: 'a.symmetric_difference_update(b)', slide: 19,
      d: ['Оставляет в самом a элементы, которые есть только в одном из множеств. Новое множество не создаётся.', 'a жиынының өзінде жиындардың тек біреуінде бар элементтерді қалдырады. Жаңа жиын жасалмайды.'],
      w: ['symmetric_difference_update(b) записывает в a элементы, которые есть ровно в одном из множеств, и ничего не возвращает. Оператор: a ^= b. В отличие от symmetric_difference, меняется само a.',
          'symmetric_difference_update(b) a-ға жиындардың дәл біреуінде ғана бар элементтерді жазады және ештеңе қайтармайды. Операторы: a ^= b. symmetric_difference-тен айырмашылығы — a-ның өзі өзгереді.'] }
  ]
};
var MX_TIPS = {
  1: {
    '1-2': ['remove и discard оба удаляют x. Разница в том, что будет, если x нет: remove → ошибка KeyError, discard → ничего не происходит.', 'remove да, discard да x-ті өшіреді. Айырмашылығы — x жоқ болғанда: remove → KeyError қатесі, discard → ештеңе болмайды.'],
    '0-5': ['add — один элемент: s.add(5). update — много элементов из коллекции: s.update([5, 6, 7]).', 'add — бір элемент: s.add(5). update — жинақтағы көп элемент: s.update([5, 6, 7]).'],
    '1-3': ['Посмотрите на скобки: remove(x) удаляет указанный элемент, pop() — без аргумента, сам выбирает элемент и возвращает его.', 'Жақшаға қараңыз: remove(x) көрсетілген элементті өшіреді, pop() аргументсіз — элементті өзі таңдап, қайтарады.'],
    '2-3': ['Посмотрите на скобки: discard(x) удаляет указанный элемент, pop() — без аргумента, сам выбирает элемент и возвращает его.', 'Жақшаға қараңыз: discard(x) көрсетілген элементті өшіреді, pop() аргументсіз — элементті өзі таңдап, қайтарады.'],
    '3-4': ['pop удаляет один элемент, clear — все элементы сразу.', 'pop бір элементті өшіреді, clear — барлық элементті бірден.'],
    '1-4': ['remove удаляет один указанный элемент, clear — все элементы сразу.', 'remove көрсетілген бір элементті өшіреді, clear — барлық элементті бірден.'],
    '2-4': ['discard удаляет один указанный элемент, clear — все элементы сразу.', 'discard көрсетілген бір элементті өшіреді, clear — барлық элементті бірден.'],
    '6-7': ['copy возвращает новое множество, len — число (количество элементов).', 'copy жаңа жиын қайтарады, len — сан (элементтер саны).'],
    '0-6': ['add меняет само множество s, а copy создаёт новое множество и s не меняет.', 'add s жиынының өзін өзгертеді, ал copy жаңа жиын жасайды және s-ті өзгертпейді.'],
    '5-6': ['update меняет само множество s, а copy создаёт новое множество и s не меняет.', 'update s жиынының өзін өзгертеді, ал copy жаңа жиын жасайды және s-ті өзгертпейді.']
  },
  2: {
    '0-1': ['union — все элементы обоих множеств, intersection — только общие элементы.', 'union — екі жиынның барлық элементі, intersection — тек ортақ элементтер.'],
    '0-3': ['union берёт все элементы, а symmetric_difference выбрасывает общие.', 'union барлық элементті алады, ал symmetric_difference ортақ элементтерді алып тастайды.'],
    '1-3': ['intersection — только общие элементы, symmetric_difference — наоборот, всё, кроме общих.', 'intersection — тек ортақ элементтер, symmetric_difference — керісінше, ортақтардан басқасының бәрі.'],
    '1-2': ['intersection — элементы, которые есть в обоих множествах; difference — элементы a, которых нет в b.', 'intersection — екі жиында да бар элементтер; difference — a-да бар, бірақ b-да жоқ элементтер.'],
    '2-3': ['difference — элементы только из a. symmetric_difference — элементы, которые есть только в a или только в b.', 'difference — тек a-дағы элементтер. symmetric_difference — тек a-да немесе тек b-да бар элементтер.'],
    '0-2': ['union добавляет к a элементы b, difference, наоборот, убирает из a элементы b.', 'union a-ға b-ның элементтерін қосады, difference керісінше a-дан b-ның элементтерін алып тастайды.'],
    '4-5': ['Это проверки в разные стороны: a.issubset(b) — «a внутри b», a.issuperset(b) — «a содержит b».', 'Бұл — қарама-қарсы бағыттағы тексерулер: a.issubset(b) — «a b-ның ішінде», a.issuperset(b) — «a b-ны қамтиды».'],
    '2-7': ['Оба убирают из a элементы b, но difference возвращает новое множество, а difference_update меняет само a.', 'Екеуі де a-дан b-ның элементтерін алып тастайды, бірақ difference жаңа жиын қайтарады, ал difference_update a-ның өзін өзгертеді.'],
    '1-6': ['intersection возвращает множество общих элементов, а isdisjoint только отвечает True или False: правда ли, что общих элементов нет.', 'intersection ортақ элементтер жиынын қайтарады, ал isdisjoint тек True немесе False деп жауап береді: ортақ элемент жоқ па.'],
    '4-6': ['issubset проверяет, что все элементы a есть в b, а isdisjoint — что общих элементов нет вообще.', 'issubset a-ның барлық элементі b-да бар екенін тексереді, ал isdisjoint — ортақ элемент мүлдем жоқ екенін.'],
    '5-6': ['issuperset проверяет, что a содержит все элементы b, а isdisjoint — что общих элементов нет вообще.', 'issuperset a-ның b-ның барлық элементін қамтитынын тексереді, ал isdisjoint — ортақ элемент мүлдем жоқ екенін.'],
    '7-8': ['Оба меняют a: difference_update убирает из a элементы b, а intersection_update, наоборот, оставляет только элементы b.', 'Екеуі де a-ны өзгертеді: difference_update a-дан b-ның элементтерін алып тастайды, ал intersection_update керісінше тек b-ның элементтерін қалдырады.'],
    '7-9': ['difference_update убирает из a элементы b, а symmetric_difference_update ещё и добавляет в a элементы b, которых там не было.', 'difference_update a-дан b-ның элементтерін алып тастайды, ал symmetric_difference_update оған қоса a-да болмаған b элементтерін қосады.'],
    '8-9': ['intersection_update оставляет только общие элементы, symmetric_difference_update — наоборот, всё, кроме общих.', 'intersection_update тек ортақ элементтерді қалдырады, symmetric_difference_update — керісінше, ортақтардан басқасының бәрін.'],
    '1-8': ['Оба находят общие элементы, но intersection возвращает новое множество, а intersection_update меняет само a.', 'Екеуі де ортақ элементтерді табады, бірақ intersection жаңа жиын қайтарады, ал intersection_update a-ның өзін өзгертеді.'],
    '3-9': ['Оба находят элементы только одного из множеств, но symmetric_difference возвращает новое множество, а symmetric_difference_update меняет само a.', 'Екеуі де жиындардың біреуінде ғана бар элементтерді табады, бірақ symmetric_difference жаңа жиын қайтарады, ал symmetric_difference_update a-ның өзін өзгертеді.']
  }
};
function mxGroup(part, k) {
  if (part === 1) return [0, 5].indexOf(k) > -1 ? mxT('добавляет элементы', 'элемент қосады')
    : [1, 2, 3, 4].indexOf(k) > -1 ? mxT('удаляет элементы', 'элемент өшіреді') : mxT('не меняет множество', 'жиынды өзгертпейді');
  return k <= 3 ? mxT('возвращает новое множество', 'жаңа жиын қайтарады')
    : k <= 6 ? mxT('возвращает True или False', 'True немесе False қайтарады') : mxT('изменяет само множество a', 'a жиынының өзін өзгертеді');
}
function mxTip(part, i, r) {
  var key = Math.min(i, r) + '-' + Math.max(i, r), tip = MX_TIPS[part][key];
  if (tip) return tip[mxKk() ? 1 : 0];
  var P = MX_PAIRS[part];
  return P[i].m + ' ' + mxGroup(part, i) + ', ' + mxT('а', 'ал') + ' ' + P[r].m + ' ' + mxGroup(part, r) + '. ' +
    (part === 1 ? mxT('Подумайте, что делает метод: добавляет, удаляет или только сообщает информацию.', 'Әдістің не істейтінін ойланыңыз: элемент қоса ма, өшіре ме, әлде тек ақпарат бере ме.')
                : mxT('Подумайте, что получается в результате: новое множество, True/False или изменённое a.', 'Нәтижесінде не шығатынын ойланыңыз: жаңа жиын, True/False немесе өзгерген a.'));
}

/* ---------------- задание на сопоставление ---------------- */
var MX_GAMES = {};
function mxGame(part) {
  var key = part + (mxKk() ? 'kk' : 'ru');
  if (MX_GAMES[key]) return MX_GAMES[key];
  var P = MX_PAIRS[part], N = P.length, LIMIT0 = part === 1 ? 180 : 240;
  var links = {}, selected = null, checked = false, t0 = null, timer = null, pointer = null, timeUp = false, limit = LIMIT0;
  var root = mxEl('div', 'mx-card mx-game');
  root.appendChild(mxEl('h3', null, mxT('Задание на сопоставление', 'Сәйкестендіру тапсырмасы') + ' · ' +
    (part === 1 ? mxT('методы добавления и удаления', 'қосу және өшіру әдістері') : mxT('операции над множествами', 'жиындарға амалдар'))));
  root.appendChild(mxEl('div', 'mx-sub', mxT('Соедините метод с его описанием. Работа индивидуальная, на оценку не влияет.',
    'Әдісті оның сипаттамасымен сәйкестендіріңіз. Жұмыс жеке орындалады, бағаға әсер етпейді.')));

  var intro = mxEl('div');
  var ol = mxEl('ol', 'mx-steps');
  [mxT('Нажмите на метод в левой колонке.', 'Сол жақ бағандағы әдісті басыңыз.'),
   mxT('Нажмите на подходящее описание справа — появится цветная линия.', 'Оң жақтағы сәйкес сипаттаманы басыңыз — түрлі түсті сызық пайда болады.'),
   mxT('Передумали? Нажмите на метод ещё раз — пара разорвётся.', 'Ойыңыз өзгерді ме? Әдісті қайта басыңыз — жұп ажырайды.'),
   mxT('Соедините все ' + N + ' пар и нажмите «Проверить».', 'Барлық ' + N + ' жұпты қосып, «Тексеру» түймесін басыңыз.'),
   mxT('На задание — ' + (LIMIT0 / 60) + ' минуты. Когда время выйдет, ответы проверятся автоматически.', 'Тапсырмаға — ' + (LIMIT0 / 60) + ' минут. Уақыт біткенде жауаптар автоматты түрде тексеріледі.'),
   mxT('После проверки нажмите «Почему?» у ошибки, а «Показать» вернёт к слайду с этим методом.', 'Тексерілгеннен кейін қатенің жанындағы «Неге?» түймесін басыңыз, ал «Көрсету» осы әдіс туралы слайдқа қайтарады.')
  ].forEach(function (s) { ol.appendChild(mxEl('li', null, s)); });
  intro.appendChild(ol);
  var startRow = mxEl('div', 'mx-row');
  var startBtn = mxEl('button', 'mx-btn mx-main', '▶ ' + mxT('Начать', 'Бастау') + ' · ' + mxTime(LIMIT0));
  startRow.appendChild(startBtn); intro.appendChild(startRow);
  root.appendChild(intro);

  var game = mxEl('div', 'mx-hidden');
  var chips = mxEl('div', 'mx-chips');
  var cntChip = mxEl('span', 'mx-chip'); var bar = mxEl('span', 'mx-bar'); bar.appendChild(mxEl('i')); var cnt = mxEl('span', null, '0/' + N);
  cntChip.appendChild(bar); cntChip.appendChild(cnt);
  var timeChip = mxEl('span', 'mx-chip', '⏱ ' + mxTime(LIMIT0));
  var plus = mxEl('button', 'mx-mini', '+1 ' + mxT('мин', 'мин'));
  chips.appendChild(cntChip); chips.appendChild(timeChip); chips.appendChild(plus);
  game.appendChild(chips);
  var board = mxEl('div', 'mx-board');
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'mx-lines');
  var left = mxEl('div', 'mx-col mx-l'), right = mxEl('div', 'mx-col mx-r');
  left.appendChild(mxEl('h4', null, mxT('Метод', 'Әдіс'))); right.appendChild(mxEl('h4', null, mxT('Описание', 'Сипаттама')));
  board.appendChild(svg); board.appendChild(left); board.appendChild(right);
  game.appendChild(board);
  var act = mxEl('div', 'mx-row');
  var checkBtn = mxEl('button', 'mx-btn mx-main', '✨ ' + mxT('Проверить', 'Тексеру'));
  var resetBtn = mxEl('button', 'mx-btn', '↻ ' + mxT('Начать заново', 'Қайта бастау'));
  act.appendChild(checkBtn); act.appendChild(resetBtn); game.appendChild(act);
  root.appendChild(game);
  var res = mxEl('div', 'mx-res mx-hidden'); root.appendChild(res);
  root.appendChild(mxEl('div', 'mx-hint', part === 1
    ? mxT('Обозначения: s — множество, x — элемент, t — другая коллекция (множество, список, строка).', 'Белгілеулер: s — жиын, x — элемент, t — басқа жинақ (жиын, тізім, жол).')
    : mxT('Обозначения: a, b — множества. Методы с _update изменяют само множество a.', 'Белгілеулер: a, b — жиындар. _update деп аяқталатын әдістер a жиынының өзін өзгертеді.')));

  function codeHtml(m) { return mxEsc(m).replace(/([a-z_]+)\(/, '<span class="mx-fn">$1</span>('); }
  function leftOf(r) { for (var k in links) if (links[k] === r) return +k; return null; }
  function elapsed() { return t0 ? Math.min(limit, Math.floor((Date.now() - t0) / 1000)) : 0; }
  function build() {
    links = {}; selected = null; checked = false; t0 = null; timeUp = false; limit = LIMIT0;
    clearInterval(timer); timeChip.textContent = '⏱ ' + mxTime(limit); timeChip.className = 'mx-chip'; plus.disabled = true;
    intro.className = ''; game.className = 'mx-hidden'; res.className = 'mx-res mx-hidden'; res.textContent = '';
    Array.prototype.slice.call(left.querySelectorAll('.mx-item')).concat(Array.prototype.slice.call(right.querySelectorAll('.mx-item'))).forEach(function (e) { e.remove(); });
    mxShuffle(P.map(function (_, i) { return i; })).forEach(function (i) {
      var b = mxEl('button', 'mx-item'); b.dataset.i = i; b.style.setProperty('--c', MX_COLORS[i]);
      b.innerHTML = '<span class="mx-tag"></span><code>' + codeHtml(P[i].m) + '</code>';
      b.onclick = function () { pickLeft(i); }; left.appendChild(b);
    });
    mxShuffle(P.map(function (_, i) { return i; })).forEach(function (i) {
      var b = mxEl('button', 'mx-item'); b.dataset.i = i;
      b.innerHTML = '<span class="mx-tag"></span><span></span>'; b.lastChild.textContent = P[i].d[mxKk() ? 1 : 0];
      b.onclick = function () { pickRight(i); }; right.appendChild(b);
    });
    render();
  }
  function pickLeft(i) {
    if (checked) return;
    if (links[i] !== undefined) { delete links[i]; selected = null; } else selected = (selected === i ? null : i);
    render();
  }
  function pickRight(r) {
    if (checked) return;
    var owner = leftOf(r);
    if (selected === null) { if (owner !== null) delete links[owner]; }
    else { if (owner !== null) delete links[owner]; links[selected] = r; selected = null; }
    pointer = null; render();
  }
  function render() {
    var order = Array.prototype.map.call(left.querySelectorAll('.mx-item'), function (e) { return +e.dataset.i; });
    left.querySelectorAll('.mx-item').forEach(function (el) {
      var i = +el.dataset.i, on = links[i] !== undefined, tag = el.querySelector('.mx-tag');
      el.classList.toggle('mx-sel', selected === i); el.classList.toggle('mx-linked', on);
      tag.className = on || selected === i ? 'mx-tag mx-on' : 'mx-tag'; tag.textContent = on || selected === i ? order.indexOf(i) + 1 : '';
    });
    right.querySelectorAll('.mx-item').forEach(function (el) {
      var owner = leftOf(+el.dataset.i), tag = el.querySelector('.mx-tag');
      el.classList.toggle('mx-linked', owner !== null);
      if (owner !== null) { el.style.setProperty('--c', MX_COLORS[owner]); tag.className = 'mx-tag mx-on'; tag.textContent = order.indexOf(owner) + 1; }
      else { el.style.removeProperty('--c'); tag.className = 'mx-tag'; tag.textContent = ''; }
    });
    var n = Object.keys(links).length;
    bar.firstChild.style.width = (n / N * 100) + '%'; cnt.textContent = n + '/' + N;
    checkBtn.disabled = checked || n < N;
    drawLines();
  }
  function anchor(el, side) {
    var b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (side === 'r' ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top };
  }
  function curve(a, z) { var dx = Math.max(30, (z.x - a.x) * 0.5); return 'M' + a.x + ' ' + a.y + ' C' + (a.x + dx) + ' ' + a.y + ' ' + (z.x - dx) + ' ' + z.y + ' ' + z.x + ' ' + z.y; }
  function drawLines() {
    if (!root.isConnected || game.className) { return; }
    var html = '';
    for (var k in links) {
      var i = +k, r = links[k], a = left.querySelector('.mx-item[data-i="' + i + '"]'), z = right.querySelector('.mx-item[data-i="' + r + '"]');
      if (!a || !z) continue;
      var color = checked ? (r === i ? '#137333' : '#b3261e') : MX_COLORS[i];
      html += '<path class="' + (checked && r !== i ? 'mx-pbad' : '') + '" d="' + curve(anchor(a, 'r'), anchor(z, 'l')) + '" stroke="' + color + '"/>';
    }
    if (selected !== null && pointer && !checked) {
      var s = left.querySelector('.mx-item[data-i="' + selected + '"]');
      html += '<path class="mx-ptemp" d="' + curve(anchor(s, 'r'), pointer) + '" stroke="' + MX_COLORS[selected] + '"/>';
    }
    svg.innerHTML = html;
  }
  board.addEventListener('pointermove', function (e) {
    if (selected === null || checked || e.pointerType === 'touch') return;
    var b = board.getBoundingClientRect(); pointer = { x: e.clientX - b.left, y: e.clientY - b.top }; drawLines();
  });
  board.addEventListener('pointerleave', function () { pointer = null; drawLines(); });
  window.addEventListener('resize', drawLines);
  if (window.ResizeObserver) new ResizeObserver(drawLines).observe(board);

  function check() {
    if (checked) return;
    checked = true; selected = null; clearInterval(timer); plus.disabled = true;
    var score = 0, wrong = [];
    left.querySelectorAll('.mx-item').forEach(function (el) {
      var i = +el.dataset.i, ok = links[i] === i;
      el.classList.add(ok ? 'mx-ok' : 'mx-bad'); el.appendChild(mxEl('span', 'mx-mark', ok ? '✅' : '❌'));
      if (ok) score++; else wrong.push(i);
    });
    right.querySelectorAll('.mx-item').forEach(function (el) { var r = +el.dataset.i; el.classList.add(leftOf(r) === r ? 'mx-ok' : 'mx-bad'); });
    render();
    var verdict = score === N ? mxT('🏆 Блестяще! Все пары верные!', '🏆 Керемет! Барлық жұп дұрыс!')
      : score >= N - 2 ? mxT('🔥 Отлично, почти всё!', '🔥 Өте жақсы, барлығы дерлік дұрыс!')
      : score >= N / 2 ? mxT('👍 Неплохо, но есть над чем подумать', '👍 Жаман емес, бірақ ойланатын жер бар') : mxT('💡 Попробуйте ещё раз', '💡 Тағы бір рет көріңіз');
    res.textContent = ''; res.className = 'mx-res';
    var sc = mxEl('div', 'mx-score', String(score)); sc.appendChild(mxEl('small', null, ' / ' + N)); res.appendChild(sc);
    res.appendChild(mxEl('div', 'mx-verdict', verdict));
    res.appendChild(mxEl('div', 'mx-sub', timeUp ? mxT('⏰ Время вышло', '⏰ Уақыт бітті') : '⏱ ' + mxT('время', 'уақыт') + ' ' + mxTime(elapsed())));
    if (wrong.length) {
      var ul = mxEl('ul', 'mx-fix');
      ul.appendChild(mxEl('div', null, mxT('Разбор ошибок — нажмите «Почему?»', 'Қателерді талдау — «Неге?» түймесін басыңыз')));
      wrong.forEach(function (i) {
        var r = links[i], none = r === undefined, li = mxEl('li'), L = mxKk() ? 1 : 0;
        var top = mxEl('div', 'mx-top'), what = mxEl('span');
        what.innerHTML = '❌ <code>' + mxEsc(P[i].m) + '</code> ' + (none ? mxEsc(mxT('— не успели соединить', '— қосып үлгермедіңіз'))
          : mxEsc(mxT('вы соединили с описанием метода', 'сіз мұны мына әдістің сипаттамасымен қостыңыз:')) + ' <code>' + mxEsc(P[r].m) + '</code>');
        var btns = mxEl('span', 'mx-row'); btns.style.marginTop = '0';
        var why = mxEl('button', 'mx-mini', '💡 ' + mxT('Почему?', 'Неге?'));
        var show = mxEl('button', 'mx-mini', '▶ ' + mxT('Показать', 'Көрсету'));
        why.onclick = function () { li.classList.toggle('mx-open'); };
        show.onclick = function () { mxGoSlide(part, P[i].slide); };
        btns.appendChild(why); btns.appendChild(show); top.appendChild(what); top.appendChild(btns); li.appendChild(top);
        var box = mxEl('div', 'mx-why');
        if (!none) box.innerHTML += '<p><b>' + mxEsc(mxT('Ваш ответ:', 'Сіздің жауабыңыз:')) + '</b> «' + mxEsc(P[r].d[L]) + '» — ' +
          mxEsc(mxT('так работает', 'бұл')) + ' <code>' + mxEsc(P[r].m) + '</code>' + mxEsc(mxT('.', ' әдісінің жұмысы.')) + '</p>';
        box.innerHTML += '<p><b>' + mxEsc(mxT('Правильно:', 'Дұрысы:')) + '</b> <code>' + mxEsc(P[i].m) + '</code> — ' + mxEsc(P[i].d[L]) + '</p>' +
          '<p><b>' + mxEsc(mxT('Почему:', 'Себебі:')) + '</b> ' + mxEsc(P[i].w[L]) + '</p>' +
          (none ? '' : '<p class="mx-tip">🔑 ' + mxEsc(mxTip(part, i, r)) + '</p>');
        li.appendChild(box); ul.appendChild(li);
      });
      res.appendChild(ul);
    }
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  startBtn.onclick = function () {
    intro.className = 'mx-hidden'; game.className = ''; t0 = Date.now(); plus.disabled = false;
    timer = setInterval(function () {
      var l = limit - elapsed();
      timeChip.textContent = '⏱ ' + mxTime(l); timeChip.className = 'mx-chip' + (l <= 30 ? ' mx-hurry' : '');
      if (l <= 0) { timeUp = true; check(); }
    }, 250);
    setTimeout(drawLines, 30);
  };
  plus.onclick = function () { if (checked || !t0) return; limit += 60; timeChip.textContent = '⏱ ' + mxTime(limit - elapsed()); };
  checkBtn.onclick = check;
  resetBtn.onclick = build;
  build();
  MX_GAMES[key] = { root: root, drawLines: drawLines };
  return MX_GAMES[key];
}

/* ---------------- две части новой темы ---------------- */
var MX_PARTS = { 1: { from: 0, to: 12, stage: 'lesson' }, 2: { from: 12, to: 99, stage: 'lesson2' } };
var MX_SHOW = { 1: false, 2: false };      // открыто ли задание на сопоставление
function mxBox(part) { return document.getElementById((MX_HOST === 'teacher' ? 'panel-' : 'screen-') + MX_PARTS[part].stage); }
function mxEditorOff() { if (MX_HOST === 'teacher' && typeof EDITOR_OPEN !== 'undefined') EDITOR_OPEN = false; }
function mxOpenPart(part) {
  if (STAGE === MX_PARTS[part].stage) mxRender(part); else setStage(MX_PARTS[part].stage);
  window.scrollTo(0, 0);
}
function mxGoSlide(part, slide) { MX_SHOW[part] = false; SLIDE = slide; SLIDE_OPEN = true; mxEditorOff(); mxOpenPart(part); }
function mxNextAfter(part) {
  MX_SHOW[part] = false; mxEditorOff();
  if (part === 1) { SLIDE = MX_PARTS[2].from; SLIDE_OPEN = false; setStage('lesson2'); }
  else setStage('check');
}
function mxRender(part) {
  var L = mxLesson(), box = mxBox(part);
  if (!L || !box) return;
  var blocks = L.blocks, a = MX_PARTS[part].from, z = Math.min(MX_PARTS[part].to, blocks.length);
  if (SLIDE < a || SLIDE >= z) { SLIDE = a; SLIDE_OPEN = false; }
  var g = MX_SHOW[part] ? mxGame(part) : null;
  if (g && box.contains(g.root)) { g.drawLines(); return; }   // задание уже на экране: не перерисовываем
  box.textContent = '';
  var title = part === 1 ? mxT('Этап 3 · новая тема', '3-кезең · жаңа тақырып') : mxT('Этап 4 · операции над множествами', '4-кезең · жиындарға амалдар');
  box.appendChild(mxEl('div', 'eyebrow', title + ' · ' + (g ? mxT('задание на сопоставление', 'сәйкестендіру тапсырмасы')
    : mxT('шаг', 'қадам') + ' ' + (SLIDE + 1) + ' / ' + blocks.length)));
  var strip = mxEl('div', 'steps');
  for (var i = a; i < z; i++) (function (i) {
    var chip = mxEl('i', !g && i === SLIDE ? 'now' : (g || i < SLIDE ? 'y' : ''), String(i + 1));
    chip.title = blocks[i].heading || '';
    chip.addEventListener('click', function () { MX_SHOW[part] = false; SLIDE = i; SLIDE_OPEN = false; mxEditorOff(); mxRender(part); });
    strip.appendChild(chip);
  })(i);
  var tchip = mxEl('i', 'mx-task' + (g ? ' now' : ''), '✦ ' + mxT('Задание', 'Тапсырма'));
  tchip.title = mxT('Задание на сопоставление', 'Сәйкестендіру тапсырмасы');
  tchip.addEventListener('click', function () { MX_SHOW[part] = true; mxEditorOff(); mxRender(part); });
  strip.appendChild(tchip);
  box.appendChild(strip);

  var nav = mxEl('div', 'qnav');
  var prev = mxEl('button', mxBtnClass(false), '← ' + mxT('Назад', 'Артқа'));
  var next = mxEl('button', mxBtnClass(false));
  nav.appendChild(prev); nav.appendChild(next);

  if (g) {
    box.appendChild(g.root);
    prev.addEventListener('click', function () { MX_SHOW[part] = false; SLIDE = z - 1; SLIDE_OPEN = false; mxRender(part); });
    next.textContent = part === 1 ? mxT('К операциям над множествами →', 'Жиындарға амалдарға →') : mxT('К проверке понимания →', 'Түсінуді тексеруге →');
    next.addEventListener('click', function () { mxNextAfter(part); });
    box.appendChild(nav);
    setTimeout(g.drawLines, 30);
    return;
  }
  prev.disabled = SLIDE === a;
  prev.addEventListener('click', function () { SLIDE--; SLIDE_OPEN = false; mxEditorOff(); mxRender(part); });
  next.textContent = SLIDE + 1 < z ? mxT('Дальше →', 'Әрі қарай →') : mxT('К заданию на сопоставление →', 'Сәйкестендіру тапсырмасына →');
  next.addEventListener('click', function () {
    mxEditorOff();
    if (SLIDE + 1 < z) { SLIDE++; SLIDE_OPEN = false; mxRender(part); }
    else { MX_SHOW[part] = true; mxRender(part); window.scrollTo(0, 0); }
  });

  var b = blocks[SLIDE];
  if (b.ref) {
    var head = mxEl('div', 'card');
    head.appendChild(mxEl('div', 'display', b.heading));
    head.appendChild(mxEl('div', null, b.text));
    box.appendChild(head);
    renderReference(box, L);
    box.appendChild(nav);
    if (typeof txDom === 'function') txDom(box);
    return;
  }
  var card = mxEl('div', 'card');
  if (b.ask && !SLIDE_OPEN) {
    card.appendChild(mxEl('div', 'asklabel', tx('Вопрос классу')));
    card.appendChild(mxEl('div', 'askbig', b.ask));
    if (b.askCode) card.appendChild(mxEl('pre', null, b.askCode));
    var open = mxEl('button', mxBtnClass(true), tx('Показать ответ'));
    open.addEventListener('click', function () { SLIDE_OPEN = true; mxRender(part); });
    card.appendChild(open);
  } else {
    card.appendChild(mxEl('div', 'display', b.heading));
    if (b.ask) {
      var q = mxEl('div', 'askdone');
      q.appendChild(mxEl('div', 'askdone-label', tx('Вопрос')));
      q.appendChild(mxEl('div', null, b.ask));
      if (b.askCode) q.appendChild(mxEl('pre', null, b.askCode));
      card.appendChild(q);
    }
    card.appendChild(mxEl('div', 'answer-label', tx('Ответ')));
    card.appendChild(mxEl('div', null, b.text));
    slideExtras(card, b);
    if (b.code) {
      card.appendChild(mxEl('pre', null, b.code));
      if (b.out) {
        if (MX_HOST === 'student') card.appendChild(mxEl('div', 'out-label', tx('Что выведет:')));
        card.appendChild(mxEl('div', 'out' + (b.out.indexOf('Error') > -1 ? ' err' : ''), b.out));
      }
      var edit = mxEl('button', mxBtnClass(false), tx('Открыть в редакторе'));
      if (MX_HOST === 'teacher') edit.style.marginTop = '10px';
      edit.addEventListener('click', function () {
        edit.style.display = 'none';
        if (MX_HOST === 'teacher') EDITOR_OPEN = true;
        attachEditor(card, b.code);
      });
      card.appendChild(edit);
    }
  }
  box.appendChild(card);
  box.appendChild(nav);
  if (typeof txDom === 'function') txDom(box);
}

/* ---------------- этап «Тема»: методы списка и загадка ---------------- */
var MX_LIST = [
  { m: 'lst.append(x)', d: ['Добавляет один элемент в конец списка.', 'Тізімнің соңына бір элемент қосады.'], ex: 'a = [1, 2]\na.append(3)  # [1, 2, 3]' },
  { m: 'lst.extend(t)', d: ['Добавляет в конец все элементы из t.', 't ішіндегі барлық элементті соңына қосады.'], ex: 'a = [1, 2]\na.extend([3, 4])  # [1, 2, 3, 4]' },
  { m: 'lst.remove(x)', d: ['Удаляет первое вхождение x. Если x нет — ошибка ValueError.', 'x-тің бірінші кездесуін өшіреді. x жоқ болса — ValueError қатесі.'], ex: 'a = [1, 2, 1]\na.remove(1)  # [2, 1]' },
  { m: 'lst.pop()', d: ['Удаляет и возвращает последний элемент (pop(i) — элемент с индексом i).', 'Соңғы элементті өшіріп, қайтарады (pop(i) — i индексті элементті).'], ex: 'a = [1, 2, 3]\na.pop()  # 3, a = [1, 2]' },
  { m: 'lst.clear()', d: ['Удаляет все элементы списка.', 'Тізімнің барлық элементін өшіреді.'], ex: 'a = [1, 2]\na.clear()  # []' },
  { m: 'lst.copy()', d: ['Возвращает новый список — копию.', 'Жаңа тізім — көшірме қайтарады.'], ex: 'b = a.copy()' },
  { m: 'len(lst)', d: ['Возвращает количество элементов.', 'Элементтер санын қайтарады.'], ex: 'len([5, 7, 9])  # 3' }
];
var MX_MAP = [
  ['lst.append(x)', ['в конец списка', 'тізімнің соңына'], 's.add(x)', ['', '']],
  ['lst.extend(t)', ['', ''], 's.update(t)', ['', '']],
  ['lst.remove(x)', ['нет x → ValueError', 'x жоқ → ValueError'], 's.remove(x)', ['нет x → KeyError', 'x жоқ → KeyError']],
  ['-', ['', ''], 's.discard(x)', ['🆕 нет x → ошибки нет', '🆕 x жоқ → қате жоқ']],
  ['lst.pop()', ['удаляет последний', 'соңғысын өшіреді'], 's.pop()', ['удаляет произвольный', 'кез келгенін өшіреді']],
  ['lst.clear()', ['', ''], 's.clear()', ['', '']],
  ['lst.copy()', ['', ''], 's.copy()', ['', '']],
  ['len(lst)', ['', ''], 'len(s)', ['', '']]
];
var MX_REVEALED = false;
try { MX_REVEALED = sessionStorage.getItem('setmethods.mx.topic') === '1'; } catch (e) {}

function mxTopic(box) {
  if (!box || (box.__mx && box.childNodes.length)) return;
  box.__mx = true;
  var K = mxKk() ? 1 : 0;
  /* то, что нарисовал основной код (тема, цель, результаты), прячем до разгадки */
  var hostPart = mxEl('div', MX_REVEALED ? '' : 'mx-hidden');
  while (box.childNodes.length) hostPart.appendChild(box.firstChild);
  var eyebrow = hostPart.querySelector('.eyebrow');
  if (eyebrow) box.appendChild(eyebrow);

  var cards = mxEl('div', 'mx-card');
  cards.appendChild(mxEl('h3', null, mxT('🧩 Вспомним методы списка', '🧩 Тізім әдістерін еске түсірейік')));
  cards.appendChild(mxEl('div', 'mx-sub', mxT('Нажмите на карточку — она перевернётся и покажет, что делает метод.', 'Карточканы басыңыз — ол аударылып, әдістің не істейтінін көрсетеді.')));
  var grid = mxEl('div', 'mx-flips');
  MX_LIST.forEach(function (x, k) {
    var b = mxEl('button', 'mx-flip'); b.style.setProperty('--c', MX_COLORS[k]);
    b.innerHTML = '<div class="mx-flip-in"><div class="mx-face"><code></code><small></small></div><div class="mx-face mx-back"><span></span><code></code></div></div>';
    b.querySelector('.mx-face:not(.mx-back) code').textContent = x.m;
    b.querySelector('.mx-face:not(.mx-back) small').textContent = mxT('нажмите, чтобы вспомнить', 'еске түсіру үшін басыңыз');
    b.querySelector('.mx-back span').textContent = x.d[K];
    b.querySelector('.mx-back code').textContent = x.ex;
    b.onclick = function () { b.classList.toggle('mx-open'); };
    grid.appendChild(b);
  });
  cards.appendChild(grid);
  box.appendChild(cards);

  var rc = mxEl('div', 'mx-card');
  rc.appendChild(mxEl('h3', null, mxT('🕵️ Загадка', '🕵️ Жұмбақ')));
  rc.appendChild(mxEl('div', 'mx-sub', mxT('Переложим элементы списка lst в загадочную коллекцию x. Что изменится? Нажимайте «Дальше».',
    'lst тізімінің элементтерін жұмбақ x жинағына салайық. Не өзгереді? «Әрі қарай» түймесін басыңыз.')));
  var riddle = mxEl('div', 'mx-riddle');
  var lc = mxEl('div', 'mx-coll mx-list'); lc.appendChild(mxEl('span', 'mx-lbl', mxT('lst — список', 'lst — тізім')));
  var lcells = mxEl('div', 'mx-cells'); lc.appendChild(lcells);
  var sc = mxEl('div', 'mx-coll mx-set'); var slbl = mxEl('span', 'mx-lbl', 'x — ???'); sc.appendChild(slbl);
  var scells = mxEl('div', 'mx-cells'); sc.appendChild(scells);
  riddle.appendChild(lc); riddle.appendChild(mxEl('div', 'mx-arrow', '➜')); riddle.appendChild(sc);
  rc.appendChild(riddle);
  var cons = mxEl('div', 'mx-console'); rc.appendChild(cons);
  var cap = mxEl('div', 'mx-cap'); rc.appendChild(cap);
  var row = mxEl('div', 'mx-row');
  var nextB = mxEl('button', 'mx-btn mx-main', '▶ ' + mxT('Дальше', 'Әрі қарай'));
  var resetB = mxEl('button', 'mx-btn', '↻ ' + mxT('Сначала', 'Басынан'));
  var skipB = mxEl('button', 'mx-btn', mxT('Пропустить загадку и показать тему', 'Жұмбақты өткізіп, тақырыпты көрсету'));
  row.appendChild(nextB); row.appendChild(resetB); row.appendChild(skipB);
  rc.appendChild(row);
  var reveal = mxEl('div', 'mx-reveal mx-hidden');
  rc.appendChild(reveal);
  box.appendChild(rc);
  box.appendChild(hostPart);

  var LST = [3, 1, 3, 2, 1], lines = [], stepN = 0, busy = false, named = false, HID = '\u0000';
  function draw() {
    var nm = named ? '<span class="mx-q">set</span>' : '<span class="mx-q">▒▒▒</span>';
    cons.innerHTML = lines.map(function (l) { return l.split(HID).join(nm); }).join('\n');
  }
  function inp(code) { lines.push('<span class="mx-p">&gt;&gt;&gt;</span> ' + code); draw(); }
  function out(text, cls) { lines.push(cls ? '<span class="' + cls + '">' + text + '</span>' : text); draw(); }
  function ball(v) { var e = mxEl('div', 'mx-el', String(v)); e.dataset.v = v; return e; }
  function shake() { riddle.classList.remove('mx-shake'); void riddle.offsetWidth; riddle.classList.add('mx-shake'); }
  function reset() {
    stepN = 0; lines = []; named = false; busy = false;
    lcells.innerHTML = LST.map(function (v, i) { return '<div class="mx-cell"><div class="mx-box">' + v + '</div><span class="mx-idx">[' + i + ']</span></div>'; }).join('');
    scells.innerHTML = '<span class="mx-qm">?</span>'; sc.className = 'mx-coll mx-set'; slbl.textContent = 'x — ???';
    reveal.className = 'mx-reveal mx-hidden'; nextB.textContent = '▶ ' + mxT('Дальше', 'Әрі қарай'); nextB.disabled = false;
    inp('lst = [3, 1, 3, 2, 1]'); cap.textContent = mxT('Нажмите «Дальше» ▶', '«Әрі қарай» түймесін басыңыз ▶');
  }
  function showTopic(scroll) {
    MX_REVEALED = true;
    try { sessionStorage.setItem('setmethods.mx.topic', '1'); } catch (e) {}
    hostPart.className = '';
    if (scroll) setTimeout(function () { hostPart.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
  }
  function buildReveal() {
    reveal.textContent = '';
    reveal.appendChild(mxEl('div', 'mx-rt', mxT('Тема урока', 'Сабақ тақырыбы')));
    var Ls = mxLesson();
    reveal.appendChild(mxEl('div', 'mx-rn', Ls ? Ls.title : 'set'));
    reveal.appendChild(mxEl('div', 'mx-sub', mxT('Методы списка, которые вы знаете → методы множества', 'Сіз білетін тізім әдістері → жиын әдістері')));
    var map = mxEl('div', 'mx-map');
    MX_MAP.forEach(function (r) {
      var rowE = mxEl('div', 'mx-map-row');
      var l = mxEl('div', 'mx-m' + (r[0] === '-' ? ' mx-none' : ''), r[0]); if (r[1][K]) l.appendChild(mxEl('small', null, r[1][K]));
      var rr = mxEl('div', 'mx-m' + (r[0] === '-' ? ' mx-new' : ''), r[2]); if (r[3][K]) rr.appendChild(mxEl('small', null, r[3][K]));
      rowE.appendChild(l); rowE.appendChild(mxEl('div', 'mx-ar', '➜')); rowE.appendChild(rr); map.appendChild(rowE);
    });
    reveal.appendChild(map);
  }
  var STEPS = [
    async function () {
      inp('x = ' + HID + '(lst)');
      var cells = lcells.querySelectorAll('.mx-cell');
      await mxSleep(500); cells[2].classList.add('mx-dup'); cells[4].classList.add('mx-dup');
      cap.textContent = mxT('Повторяющиеся элементы подсвечены красным…', 'Қайталанатын элементтер қызылмен белгіленді…');
      await mxSleep(1000); scells.textContent = '';
      for (var i = 0; i < cells.length; i++) { cells[i].classList.add('mx-go'); await mxSleep(250); }
      for (var v = 1; v <= 3; v++) { scells.appendChild(ball(v)); await mxSleep(250); }
      inp('x'); out('{1, 2, 3}');
      cap.textContent = mxT('❓ Куда пропали повторяющиеся 3 и 1? Почему скобки фигурные?', '❓ Қайталанған 3 пен 1 қайда кетті? Неге жақшалар фигуралы?');
    },
    async function () {
      inp('x[0]'); await mxSleep(400); shake();
      out("TypeError: '" + HID + "' object is not subscriptable", 'mx-e');
      cap.textContent = mxT('❓ Обратиться к элементу по номеру нельзя: у элементов нет индексов.', '❓ Элементке нөмірі бойынша жүгінуге болмайды: элементтерде индекс жоқ.');
    },
    async function () {
      inp('x.append(5)'); await mxSleep(400); shake();
      out("AttributeError: '" + HID + "' object has no attribute 'append'", 'mx-e');
      cap.textContent = mxT('❓ Метода append нет — у этой коллекции свои методы.', '❓ append әдісі жоқ — бұл жинақтың өз әдістері бар.');
    },
    async function () {
      inp('x.add(5)'); await mxSleep(400); scells.appendChild(ball(5));
      await mxSleep(600); inp('x'); out('{1, 2, 3, 5}');
      await mxSleep(700); inp('x.add(5)');
      var e = scells.querySelector('[data-v="5"]'); e.classList.add('mx-hl'); await mxSleep(900); e.classList.remove('mx-hl');
      inp('x'); out('{1, 2, 3, 5}');
      cap.textContent = mxT('Вместо append здесь add — и второй раз 5 не добавилась!', 'Мұнда append орнына add — және 5 екінші рет қосылмады!');
    },
    async function () {
      cap.textContent = mxT('🤔 Только уникальные элементы, фигурные скобки, нет порядка и индексов… Как в математике называется такая совокупность элементов?',
        '🤔 Тек бірегей элементтер, фигуралы жақша, рет те, индекс те жоқ… Математикада мұндай элементтер жиынтығы қалай аталады?');
      nextB.textContent = '🎉 ' + mxT('Открыть тему', 'Тақырыпты ашу');
    },
    async function () {
      named = true; draw();
      sc.className = 'mx-coll mx-set mx-known'; slbl.textContent = mxT('x — set (множество)', 'x — set (жиын)');
      cap.textContent = mxT('Это множество — set!', 'Бұл — жиын, set!');
      buildReveal(); reveal.className = 'mx-reveal';
      showTopic(false);
      setTimeout(function () { reveal.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
    }
  ];
  nextB.onclick = async function () {
    if (busy || stepN >= STEPS.length) return;
    busy = true; nextB.disabled = true;
    await STEPS[stepN++]();
    busy = false; nextB.disabled = stepN >= STEPS.length;
  };
  resetB.onclick = reset;
  skipB.onclick = function () { showTopic(true); };
  reset();
  if (typeof txDom === 'function' && MX_HOST === 'student') txDom(hostPart);
}

/* ---------------- подключение к основному коду ---------------- */
function renderLesson() { mxRender(1); }
function renderLesson2() { mxRender(2); }
function drawLessonPanel() { mxRender(1); }
function drawLessonPanel2() { mxRender(2); }
function renderTopic() { renderTopicBase_(); mxTopic(document.getElementById('screen-topic')); }
function drawTopic() {
  var box = document.getElementById('panel-topic');
  if (box.__mx && box.__mxLang === LANG && box.childNodes.length) return;   // загадку не сбрасываем при автообновлении
  box.__mx = false;
  drawTopicBase_();
  mxTopic(box);
  box.__mxLang = LANG;
}
(function () {
  var st = document.createElement('style');
  st.textContent = MX_CSS;
  document.head.appendChild(st);
})();
