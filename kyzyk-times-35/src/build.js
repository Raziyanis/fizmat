const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js");

const OUT = process.argv[2] || "Kyzyk_Times_35.pptx";
const THEME = {
  name: "Kyzyk Times 35",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0B1F3A", lt1: "FFFFFF", dk2: "16365F", lt2: "E3F6FA",
    accent1: "00AFCA", accent2: "FEC50C", accent3: "0A7F95",
    accent4: "E4572E", accent5: "2BB673", accent6: "B07800",
    hlink: "FEC50C", folHlink: "FEC50C",
  },
};
const HEX = THEME.colors;
const BG = __dirname + "/bg.png", LOGO = __dirname + "/../logo.png";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Қызық Times – Special Edition 35";
pres.author = "Кафедра информатики и робототехники";
const C = pres.SchemeColor;
const W = 13.333;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "COVER",
  background: { path: BG },
  objects: [],
});
pres.defineSlideMaster({
  title: "ROUND",
  background: { path: BG },
  objects: [],
});
pres.defineSlideMaster({
  title: "QUIZ",
  background: { path: BG },
  objects: [
    { text: { text: "ҚЫЗЫҚ TIMES · SPECIAL EDITION 35", options: { x: 0.8, y: 0.3, w: 6, h: 0.4, fontSize: 12, bold: true, color: C.accent6, charSpacing: 2, margin: 0 } } },
    { placeholder: { options: { name: "round", type: "body", x: 6.73, y: 0.3, w: 6, h: 0.4, fontSize: 12, bold: true, color: C.accent3, align: "right", margin: 0 }, text: "" } },
  ],
});

let slideCount = 0;
function add(master, section, round) {
  slideCount++;
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (round) s.addText(round, { placeholder: "round" });
  return s;
}
function sun(slide, x, y, d, transp = 0, dark = true) {
  if (dark) slide.addShape(pres.shapes.OVAL, { x: x - d * 0.12, y: y - d * 0.12, w: d * 1.24, h: d * 1.24, fill: { type: "none" }, line: { color: C.accent2, width: 3, transparency: 40 }, objectName: "sun-ring" });
  else slide.addShape(pres.shapes.OVAL, { x: x - d * 0.18, y: y - d * 0.18, w: d * 1.36, h: d * 1.36, fill: { color: C.accent2, transparency: 70 }, line: { type: "none" }, objectName: "sun-halo" });
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: C.accent2, transparency: transp }, line: { type: "none" }, objectName: "sun" });
}
function numCircle(slide, n, x, y, d = 1.0, fs = 30) {
  slide.addText(String(n), { x, y, w: d, h: d, shape: pres.shapes.OVAL, fill: { color: C.accent2 }, color: C.text1, fontSize: fs, bold: true, align: "center", valign: "middle", margin: 0, objectName: "num" });
}
function button(slide, text, targetSlide, x, y, w, h = 0.6, fill = C.accent1, color = C.text1) {
  slide.addText([{ text, options: { hyperlink: { slide: targetSlide, tooltip: text } } }], {
    x, y, w, h, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.15, fill: { color: fill }, color, fontSize: 16, bold: true, align: "center", valign: "middle", margin: 0, objectName: "btn",
  });
}

// ---------- timer (animated in post-processing by name) ----------
// TIMER_BAR wipes out over N s; digits count down (N<=30); TIMER_UP appears at the end.
function timer(slide, secs, y = 6.45) {
  const x = 0.9, w = 9.9, h = 0.3;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: C.background2 }, line: { type: "none" }, objectName: "timer-track" });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "TIMER_BAR" });
  const cx = 11.1, cy = y - 0.4, d = 1.1;
  slide.addShape(pres.shapes.OVAL, { x: cx, y: cy, w: d, h: d, fill: { color: C.background2 }, line: { color: C.accent2, width: 3 }, objectName: "timer-dial" });
  const label = secs >= 60 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : String(secs);
  const fs = secs >= 60 ? 24 : 30;
  const dOpt = (name, t) => slide.addText(t, { x: cx, y: cy, w: d, h: d, fontSize: fs, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: name });
  dOpt("TIMER_START", label);
  if (secs <= 30) for (let k = secs - 1; k >= 1; k--) dOpt("TIMER_D_" + k, String(k));
  slide.addText("УАҚЫТ БІТТІ!  ·  ВРЕМЯ ВЫШЛО!", { x, y: y - 0.2, w, h: 0.7, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.2, fill: { color: C.accent4 }, color: C.background1, fontSize: 20, bold: true, align: "center", valign: "middle", margin: 0, objectName: "TIMER_UP" });
  timers.push({ slide: slideCount, secs });
}
const timers = [];

// ---------- 1. COVER ----------
const SEC0 = "Открытие";
pres.addSection({ title: SEC0 });
let s = add("COVER", SEC0);
s.addImage({ path: LOGO, x: (W - 8.0) / 2, y: 0.55, w: 8.0, h: 4.74, objectName: "LOGO_ANIM", altText: "Логотип «Қызық Times – Special Edition 35»" });
s.addText("Қазақстан Республикасы Тәуелсіздігінің 35 жылдығы  ·  35 лет Независимости Республики Казахстан", { x: 0.8, y: 5.75, w: 11.7, h: 0.5, fontSize: 16, bold: true, color: C.accent3, align: "center", margin: 0, objectName: "occasion" });
s.addText("9 желтоқсан 2026 · РФМШ, Астана", { x: 0.8, y: 6.35, w: 11.7, h: 0.4, fontSize: 14, color: C.text1, align: "center", margin: 0, objectName: "date" });
s.addNotes("Заставка: логотип мероприятия появляется на экране автоматически (плавное проявление). Звучит энергичная музыка, команды занимают места. Затем Ведущий 1: «Қайырлы күн, құрметті ұстаздар мен оқушылар! Бүгін біз ерекше кездесуде бас қосып отырмыз!» Ведущий 2: «Добрый день! Сегодня мы отмечаем важную дату — 35 лет Независимости Республики Казахстан…»");

// ---------- 2. THEME ----------
s = add("QUIZ", SEC0, "Ашылу · Открытие");
s.addText("Тәуелсіздік – ел тұғыры,\nболашақ – біздің қолымызда", { x: 0.8, y: 1.5, w: 11.7, h: 2.2, fontSize: 44, bold: true, color: C.text1, margin: 0, objectName: "motto" });
const intro = [["Жылдамдық", "Скорость"], ["Білім", "Знания"], ["Музыка", "Музыка"], ["Технология", "Технологии"], ["Әзіл", "Юмор"], ["Сынақ", "Испытания"]];
intro.forEach(([kz, ru], i) => {
  const x = 0.8 + i * 1.98;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.5, w: 1.75, h: 1.6, rectRadius: 0.15, fill: { color: C.background2 }, line: { type: "none" }, objectName: "card" });
  s.addShape(pres.shapes.OVAL, { x: x + 0.65, y: 4.7, w: 0.45, h: 0.45, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "dot" });
  s.addText([{ text: kz, options: { bold: true, color: C.text1, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 12 } }], { x: x + 0.05, y: 5.3, w: 1.65, h: 0.7, fontSize: 15, align: "center", valign: "middle", margin: 0, objectName: "card-text" });
});
s.addNotes("Ведущий 2: «Сегодня вас ждут скорость, знания, музыка, технологии, юмор и неожиданные испытания!» Ведущий 1: «Бүгінгі басты сұрақ: тәуелсіз елдің болашағын кім қалыптастырады?» Ведущий 2: «Конечно, мы сами! А сейчас поприветствуем наши команды!»");

// ---------- 3. TEAMS ----------
s = add("QUIZ", SEC0, "Ашылу · Открытие");
s.addText("Командалармен танысу", { x: 0.8, y: 1.3, w: 11.7, h: 1.0, fontSize: 40, bold: true, color: C.text1, margin: 0, objectName: "title" });
s.addText("Знакомство с командами", { x: 0.8, y: 2.2, w: 11.7, h: 0.6, fontSize: 22, color: C.accent3, margin: 0, objectName: "subtitle" });
[["Атауы", "Название"], ["Ұран", "Девиз"], ["Капитан", "Капитан"]].forEach(([kz, ru], i) => {
  const x = 0.8 + i * 3.4;
  numCircle(s, i + 1, x, 3.4, 0.9, 26);
  s.addText([{ text: kz, options: { bold: true, color: C.text1, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 14 } }], { x: x + 1.1, y: 3.4, w: 2.1, h: 0.9, fontSize: 20, valign: "middle", margin: 0, objectName: "item" });
});
s.addText("Әр командаға — 10 секунд  ·  На каждую команду — 10 секунд", { x: 0.8, y: 4.9, w: 11.7, h: 0.6, fontSize: 18, color: C.accent6, bold: true, margin: 0, objectName: "rule" });
timer(s, 10);
s.addNotes("Каждая команда за 10 секунд называет название и девиз. Таймер запускается по клику; для следующей команды вернитесь на этот слайд (стрелка влево и снова вправо) — таймер перезапустится.");

// ---------- 4. RULES / ROUNDS ----------
s = add("QUIZ", SEC0, "Ережелер · Правила");
s.addText("Ойын барысы · Ход игры", { x: 0.8, y: 1.0, w: 11.7, h: 0.9, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
const rounds = [["БӘЙГЕ", "Блиц об истории", 10], ["КӨР ДЕ ТАП!", "Угадай по картинке", 10], ["ӘУЕНДІ ТАП!", "Музыкальная викторина", 10], ["AI СЕНЕСІҢ БЕ?", "Правда или ложь", 10], ["ҚЫЗЫҚ ТАПСЫРМА", "Творческие задания", 5], ["БОЛАШАҚ ҚАЗАҚСТАН", "Идея для 2050 года", 15]];
rounds.forEach(([n, d, p], i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.8 + col * 3.95, y = 2.2 + row * 1.85;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.65, h: 1.55, rectRadius: 0.15, fill: { color: C.background2 }, line: { type: "none" }, objectName: "round-card" });
  numCircle(s, i + 1, x + 0.25, y + 0.3, 0.9, 24);
  s.addText([{ text: n, options: { bold: true, color: C.text1, fontSize: 16, breakLine: true } }, { text: d, options: { color: C.accent3, fontSize: 13, breakLine: true } }, { text: `${p} ұпай · баллов`, options: { color: C.accent2, fontSize: 13, bold: true } }], { x: x + 1.3, y: y + 0.15, w: 2.25, h: 1.25, valign: "middle", margin: 0, objectName: "round-text" });
});
s.addText("Барлығы · Итого: 60 ұпай", { x: 0.8, y: 6.15, w: 11.7, h: 0.6, fontSize: 20, bold: true, color: C.accent6, margin: 0, objectName: "total" });
s.addNotes("Ведущий 2: «Правила просты: внимательно слушаем, быстро думаем, работаем вместе и уважаем соперников. За каждый раунд команды получают баллы. В конце узнаем победителя «Қызық Times»!»");

// ---------- helpers for rounds ----------
function divider(section, num, name, ru, pts, mins, rule) {
  pres.addSection({ title: section });
  const d = add("ROUND", section);
  sun(d, 9.8, 3.6, 4.6, 0, false);
  d.addText(String(num), { x: 9.8, y: 3.6, w: 4.6, h: 3.4, fontSize: 160, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "round-num" });
  d.addText(`ROUND ${num}`, { x: 0.8, y: 1.0, w: 8.5, h: 0.7, fontSize: 24, bold: true, color: C.text1, charSpacing: 6, margin: 0, objectName: "kicker" });
  d.addText(name, { x: 0.8, y: 1.8, w: 9.0, h: 1.4, fontSize: 60, bold: true, color: C.text1, margin: 0, fit: "shrink", objectName: "title" });
  d.addText(ru, { x: 0.8, y: 3.2, w: 8.5, h: 0.6, fontSize: 22, color: C.text1, margin: 0, objectName: "subtitle" });
  [[`${pts}`, "ұпай · баллов"], [`${mins}`, "минут"]].forEach(([v, l], i) => {
    const x = 0.8 + i * 2.6;
    d.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.2, w: 2.3, h: 1.3, rectRadius: 0.15, fill: { color: C.text1 }, line: { type: "none" }, objectName: "badge" });
    d.addText([{ text: v, options: { fontSize: 36, bold: true, color: C.accent2, breakLine: true } }, { text: l, options: { fontSize: 13, color: C.background1 } }], { x, y: 4.25, w: 2.3, h: 1.2, align: "center", valign: "middle", margin: 0, objectName: "badge-text" });
  });
  d.addText(rule, { x: 0.8, y: 5.85, w: 8.6, h: 0.9, fontSize: 16, color: C.text1, margin: 0, valign: "top", objectName: "rule" });
  return d;
}
function bil(kz, ru) {
  return [{ text: kz, options: { color: C.text1, fontSize: 34, bold: true, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 26 } }];
}

// ---------- ROUND 1 ----------
const R1 = "Раунд 1 · БӘЙГЕ";
let d = divider(R1, 1, "БӘЙГЕ", "Блиц-вопросы об истории независимого Казахстана", 10, 8, "10 сұрақ · на каждый 10 секунд · ответы пишем на карточках · 1 балл за верный ответ");
d.addNotes("Ведущий 1: «Бастаймыз! Первый раунд — «БӘЙГЕ». Здесь важны знания и скорость!» Ведущий 2: «На каждый вопрос у вас будет 10 секунд. Команды записывают ответы на карточках. За каждый правильный ответ — 1 балл.»");
const q1 = [
  ["1991 жылғы 29 тамызда қай ядролық сынақ полигоны жабылды?", "Какой ядерный полигон был закрыт 29 августа 1991 года?", "Семей полигоны · Семипалатинский", "Указ о закрытии Семипалатинского испытательного ядерного полигона подписан 29 августа 1991 года."],
  ["1991 жылы ғарышқа ұшқан тұңғыш қазақ ғарышкері кім?", "Кто стал первым казахским космонавтом (полёт 1991 года)?", "Тоқтар Әубәкіров", "Полёт Токтара Аубакирова — октябрь 1991 года, корабль «Союз ТМ-13»."],
  ["Қазақстан қай жылы БҰҰ-ға мүше болды?", "В каком году Казахстан стал членом ООН?", "1992 жыл · 1992 год", "Казахстан принят в ООН 2 марта 1992 года."],
  ["Қазақстанның Мемлекеттік Туының авторы кім?", "Кто является автором Государственного флага Казахстана?", "Шәкен Ниязбеков", "Государственные символы утверждены 4 июня 1992 года; автор флага — Шакен Ниязбеков."],
  ["Ұлттық валюта — теңге қай жылы айналымға енгізілді?", "В каком году в обращение была введена национальная валюта — тенге?", "1993 жыл · 1993 год", "Тенге введён 15 ноября 1993 года (День национальной валюты)."],
  ["Елорда Алматыдан Ақмолаға қай жылы көшірілді?", "В каком году столица была перенесена из Алматы в Акмолу?", "1997 жыл · 1997 год", "Столица официально перенесена 10 декабря 1997 года."],
  ["2006 жылы қай ән Мемлекеттік Гимн болып бекітілді?", "Какая песня в 2006 году утверждена Государственным гимном?", "«Менің Қазақстаным»", "Гимн утверждён в январе 2006 года; музыка Шамши Калдаякова."],
  ["Қазақстанның тұңғыш байланыс спутнигі қалай аталады?", "Как называется первый казахстанский спутник связи?", "KazSat-1 · ҚазСат-1", "Спутник KazSat-1 выведен на орбиту в июне 2006 года."],
  ["2011 жылы Астана мен Алматыда қандай халықаралық жарыс өтті?", "Какие международные соревнования прошли в Астане и Алматы в 2011 году?", "VII қысқы Азия ойындары", "VII зимние Азиатские игры — январь–февраль 2011 года."],
  ["2017 жылы қазақ әліпбиін қай графикаға көшіру туралы шешім қабылданды?", "На какую графику в 2017 году решено перевести казахский алфавит?", "Латын графикасы · Латиница", "Указ о переводе алфавита казахского языка на латинскую графику — 26 октября 2017 года."],
];
q1.forEach(([kz, ru, a, fact], i) => {
  const q = add("QUIZ", R1, `ROUND 1 · БӘЙГЕ · ${i + 1}/10`);
  numCircle(q, i + 1, 0.8, 1.4, 1.2, 36);
  q.addText(bil(kz, ru), { x: 2.4, y: 1.3, w: 10.2, h: 4.2, valign: "middle", margin: 0, paraSpaceAfter: 12, objectName: "question" });
  timer(q, 10);
  q.addNotes(`Ответ: ${a}. Справка: ${fact} Клик — запуск таймера (10 с). Ответы проверяются после 10-го вопроса.`);
});
s = add("QUIZ", R1, "ROUND 1 · БӘЙГЕ · Жауаптар");
s.addText("Жауаптар · Ответы", { x: 0.8, y: 0.9, w: 11.7, h: 0.8, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
q1.forEach(([, , a], i) => {
  const col = Math.floor(i / 5), row = i % 5;
  const x = 0.8 + col * 6.0, y = 2.0 + row * 0.95;
  numCircle(s, i + 1, x, y, 0.65, 18);
  s.addText(a, { x: x + 0.85, y, w: 5.0, h: 0.65, fontSize: 20, bold: true, color: C.text1, valign: "middle", margin: 0, objectName: "answer" });
});
s.addNotes("Ведущий 1: «Тамаша! Бірінші кезең аяқталды. Проверяем ответы и фиксируем результаты!» Ведущий 2: «Не расслабляемся! Впереди ещё много интересного!»");

// ---------- ROUND 2 ----------
const R2 = "Раунд 2 · КӨР ДЕ ТАП!";
d = divider(R2, 2, "КӨР ДЕ ТАП!", "Определите, что или кто изображён на экране", 10, 8, "5 сурет · на каждый слайд 20 секунд · 2 балла за верный ответ");
d.addNotes("Ведущий 2: «Второй раунд — «КӨР ДЕ ТАП!». Сейчас на экране появятся изображения. Ваша задача — определить, что или кто изображён.» Ведущий 1: «Әр дұрыс жауапқа 2 ұпай беріледі. На каждый слайд у вас 20 секунд.»");
const q2 = [
  ["Мемлекеттік Ту", "Государственный флаг Республики Казахстан", "Государственный флаг РК (официальное изображение)"],
  ["«Бәйтерек» монументі", "Монумент «Бәйтерек» — символ Астаны", "Монумент «Бәйтерек»"],
  ["Байқоңыр ғарыш айлағы", "Космодром Байконур", "Космодром Байконур (стартовая площадка)"],
  ["Абай Құнанбайұлы", "Абай Кунанбаев", "Портрет Абая Кунанбаева"],
  ["«Нұр Әлем» павильоны", "Сфера «Нұр Әлем», EXPO-2017", "Павильон-сфера «Нұр Әлем»"],
];
q2.forEach(([kz, ru, img], i) => {
  const q = add("QUIZ", R2, `ROUND 2 · КӨР ДЕ ТАП! · ${i + 1}/5`);
  numCircle(q, i + 1, 0.8, 1.2, 1.0, 30);
  q.addText("Бұл не? Бұл кім?\nЧто или кто это?", { x: 0.8, y: 2.5, w: 3.0, h: 1.6, fontSize: 22, bold: true, color: C.text1, margin: 0, objectName: "prompt" });
  q.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.3, y: 1.0, w: 8.3, h: 5.0, rectRadius: 0.2, fill: { color: C.background2 }, line: { color: C.accent1, width: 2, dashType: "dash" }, objectName: "IMAGE_FRAME" });
  q.addText([{ text: "СУРЕТ ҚОЙЫҢЫЗ · ВСТАВЬТЕ ИЗОБРАЖЕНИЕ", options: { bold: true, color: C.accent6, fontSize: 16, breakLine: true } }, { text: img, options: { color: C.accent3, fontSize: 14 } }], { x: 4.6, y: 2.9, w: 7.7, h: 1.2, align: "center", valign: "middle", margin: 0, objectName: "image-hint" });
  timer(q, 20);
  q.addNotes(`Изображение: ${img}. Вставьте картинку в рамку (Вставка → Рисунок), растяните на рамку и удалите надпись-подсказку. Ответ: ${ru}. Клик — таймер 20 с.`);
  const a = add("QUIZ", R2, `ROUND 2 · КӨР ДЕ ТАП! · ${i + 1}/5 · Жауап`);
  a.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.0, w: 6.0, h: 5.5, rectRadius: 0.2, fill: { color: C.background2 }, line: { color: C.accent1, width: 2, dashType: "dash" }, objectName: "IMAGE_FRAME" });
  a.addText("Сол сурет · То же изображение", { x: 1.0, y: 3.4, w: 5.6, h: 0.6, fontSize: 14, color: C.accent3, align: "center", margin: 0, objectName: "image-hint" });
  a.addText("ЖАУАП · ОТВЕТ", { x: 7.4, y: 1.6, w: 5.2, h: 0.5, fontSize: 16, bold: true, color: C.accent6, charSpacing: 3, margin: 0, objectName: "kicker" });
  a.addText([{ text: kz, options: { fontSize: 36, bold: true, color: C.text1, breakLine: true } }, { text: ru, options: { fontSize: 22, color: C.accent3 } }], { x: 7.4, y: 2.2, w: 5.2, h: 2.6, valign: "top", margin: 0, paraSpaceAfter: 10, objectName: "answer" });
  a.addText("+2 ұпай", { x: 7.4, y: 5.3, w: 2.4, h: 0.8, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.15, fill: { color: C.accent5 }, color: C.background1, fontSize: 22, bold: true, align: "center", valign: "middle", margin: 0, objectName: "points" });
  if (i === 4) a.addNotes("Ведущий 2: «Керемет! Оказывается, наши участники не только быстрые, но и внимательные!»");
});

// ---------- ROUND 3 ----------
const R3 = "Раунд 3 · ӘУЕНДІ ТАП!";
d = divider(R3, 3, "ӘУЕНДІ ТАП!", "Назовите исполнителя или название композиции", 10, 7, "5 фрагмент (5–8 секунд) · 2 балла за верный ответ");
d.addNotes("Ведущий 1: «Музыка объединяет поколения! Посмотрим, насколько хорошо вы знаете музыкальную культуру Казахстана.» Ведущий 2: «Сейчас прозвучат короткие фрагменты песен. Ваша задача — назвать исполнителя или название композиции. За каждый правильный ответ — 2 балла.» Ведущий 1: «Дайынбыз ба? Музыка!»");
for (let i = 1; i <= 5; i++) {
  const q = add("QUIZ", R3, `ROUND 3 · ӘУЕНДІ ТАП! · ${i}/5`);
  sun(q, 5.07, 1.2, 3.2);
  q.addText(`♪ ${i}`, { x: 5.07, y: 1.2, w: 3.2, h: 3.2, fontSize: 80, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "melody-num" });
  q.addText("Әуенді тыңдаңыз · Слушаем мелодию", { x: 0.8, y: 5.3, w: 11.7, h: 0.6, fontSize: 22, bold: true, color: C.text1, align: "center", margin: 0, objectName: "prompt" });
  timer(q, 15);
  q.addNotes(`Фрагмент №${i}: звукооператор включает трек по закрытому листу ответов. После фрагмента клик — 15 с на ответ (время на ответ в сценарии не указано — при необходимости согласуйте).`);
}
s = add("QUIZ", R3, "ROUND 3 · ӘУЕНДІ ТАП! · Жауаптар");
s.addText("Жауаптар · Ответы", { x: 0.8, y: 0.9, w: 11.7, h: 0.8, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
const cats = ["Халық әні / күй · Народная композиция", "Қазақстан туралы ән · Песня о Казахстане", "Заманауи хит · Современная песня", "Қазақ тіліндегі ән · Песня на казахском", "Фильм / жоба әуені · Из фильма или проекта"];
cats.forEach((c, i) => {
  const y = 1.95 + i * 0.9;
  numCircle(s, i + 1, 0.8, y, 0.65, 18);
  s.addText("Орындаушы — Әннің аты  (толтырыңыз)", { x: 1.65, y, w: 6.4, h: 0.65, fontSize: 18, bold: true, color: C.text1, valign: "middle", margin: 0, objectName: "MELODY_ANSWER" });
  s.addText(c, { x: 8.2, y, w: 4.4, h: 0.65, fontSize: 13, color: C.accent3, valign: "middle", margin: 0, objectName: "category" });
});
s.addNotes("Впишите названия и исполнителей после того, как музыкальный руководитель утвердит треки (порядок — как в листе ответов). Ведущий 2: «Отлично! Продолжаем наше шоу!»");

// ---------- ROUND 4 ----------
const R4 = "Раунд 4 · AI СЕНЕСІҢ БЕ?";
d = divider(R4, 4, "AI СЕНЕСІҢ БЕ?", "Ақиқат па, жалған ба? · Правда или ложь?", 10, 10, "5 тұжырым · на обсуждение 15 секунд · 2 балла за верный ответ");
d.addNotes("Ведущий 2: «Искусственный интеллект уже меняет наш мир. Но можно ли верить всему, что он показывает?» Ведущий 1: «Қазір сіздерге бірнеше тұжырым көрсетіледі. Определите: правда это или ложь!» Ведущий 2: «У вас будет 15 секунд на обсуждение. За каждый правильный ответ — 2 балла.»");
const q4 = [
  ["Қазақстан 1991 жылы тәуелсіз мемлекет болды.", "Казахстан стал независимым государством в 1991 году.", true, "16 декабря 1991 года принят Конституционный закон «О государственной независимости Республики Казахстан»."],
  ["Қазақстанның Мемлекеттік Туының түсі — қызыл.", "Государственный флаг Казахстана имеет красный фон.", false, "Полотнище флага — голубого цвета; солнце, парящий орёл и национальный орнамент — золотистые."],
  ["EXPO-2017 Астанада өтті және «Болашақ энергиясы» тақырыбына арналды.", "EXPO-2017 проходила в Астане и была посвящена теме «Энергия будущего».", true, "Международная выставка EXPO-2017 «Future Energy» прошла в Астане летом 2017 года."],
  ["Жасанды интеллект жасаған кез келген сурет — нақты оқиғаның фотосы.", "Любое изображение, созданное ИИ, обязательно является фотографией реального события.", false, "ИИ генерирует изображения того, чего никогда не было. Проверяйте источник изображения."],
  ["Жасанды интеллекттің жауабы әрқашан дұрыс, оны тексерудің қажеті жоқ.", "Ответ искусственного интеллекта всегда достоверен и не требует проверки.", false, "ИИ может уверенно выдавать неверные факты («галлюцинации»). Важные сведения нужно сверять с надёжными источниками."],
];
q4.forEach(([kz, ru, t, why], i) => {
  const q = add("QUIZ", R4, `ROUND 4 · AI СЕНЕСІҢ БЕ? · ${i + 1}/5`);
  numCircle(q, i + 1, 0.8, 1.3, 1.2, 36);
  q.addText(bil(kz, ru), { x: 2.4, y: 1.1, w: 10.2, h: 3.2, valign: "middle", margin: 0, paraSpaceAfter: 12, objectName: "statement" });
  [["АҚИҚАТ · ПРАВДА", C.accent5], ["ЖАЛҒАН · ЛОЖЬ", C.accent4]].forEach(([l, col], j) => {
    q.addText(l, { x: 2.4 + j * 5.2, y: 4.55, w: 4.9, h: 1.0, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.2, fill: { color: col }, color: C.background1, fontSize: 24, bold: true, align: "center", valign: "middle", margin: 0, objectName: "choice" });
  });
  timer(q, 15);
  q.addNotes(`Ответ: ${t ? "ПРАВДА" : "ЛОЖЬ"}. Клик — таймер 15 с.`);
  const a = add("QUIZ", R4, `ROUND 4 · AI СЕНЕСІҢ БЕ? · ${i + 1}/5 · Жауап`);
  a.addText(t ? "АҚИҚАТ\nПРАВДА" : "ЖАЛҒАН\nЛОЖЬ", { x: 0.8, y: 1.3, w: 4.4, h: 4.4, shape: pres.shapes.OVAL, fill: { color: t ? C.accent5 : C.accent4 }, color: C.background1, fontSize: 36, bold: true, align: "center", valign: "middle", margin: 0, objectName: "verdict" });
  a.addText(ru, { x: 5.8, y: 1.3, w: 6.8, h: 1.6, fontSize: 22, bold: true, color: C.text1, valign: "top", margin: 0, objectName: "statement" });
  a.addText(why, { x: 5.8, y: 3.1, w: 6.8, h: 2.2, fontSize: 18, color: C.accent3, valign: "top", margin: 0, objectName: "explanation" });
  a.addNotes(`Ведущий кратко объясняет: ${why}` + (i === 4 ? " Ведущий 1: «Міне, маңызды сабақ! Технология — күшті құрал, бірақ сыни ойлау әрқашан қажет!» Ведущий 2: «Именно поэтому нужно не просто пользоваться искусственным интеллектом, но и уметь проверять информацию!»" : ""));
});

// ---------- ROUND 5 ----------
const R5 = "Раунд 5 · ҚЫЗЫҚ ТАПСЫРМА";
d = divider(R5, 5, "ҚЫЗЫҚ ТАПСЫРМА", "Творческие и юмористические задания", 5, 7, "Каждая команда выбирает карточку · подготовка 20 секунд · выполнение до 30 секунд");
d.addNotes("Ведущий 1: «Енді көңіл көтеретін кез келді! В этом раунде важны фантазия, смелость и командный дух!» Ведущий 2: «Каждая команда вытягивает одну карточку. На подготовку — 20 секунд, на выполнение — до 30 секунд.»");
s = add("QUIZ", R5, "ROUND 5 · ҚЫЗЫҚ ТАПСЫРМА · Бағалау");
s.addText("Бағалау · Критерии оценивания", { x: 0.8, y: 1.0, w: 11.7, h: 0.9, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
[["2", "Тапсырмаға сәйкестік", "Соответствие заданию"], ["2", "Түпнұсқалық", "Оригинальность"], ["1", "Команданың қатысуы", "Участие команды"]].forEach(([p, kz, ru], i) => {
  const x = 0.8 + i * 4.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.4, w: 3.6, h: 3.2, rectRadius: 0.2, fill: { color: C.background2 }, line: { type: "none" }, objectName: "crit-card" });
  numCircle(s, p, x + 1.15, 2.7, 1.3, 44);
  s.addText([{ text: kz, options: { bold: true, color: C.text1, fontSize: 18, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 15 } }], { x: x + 0.2, y: 4.2, w: 3.2, h: 1.1, align: "center", valign: "middle", margin: 0, objectName: "crit-text" });
});
s.addText("Максимум · 5 ұпай", { x: 0.8, y: 6.1, w: 11.7, h: 0.6, fontSize: 20, bold: true, color: C.accent6, margin: 0, objectName: "total" });

const cards = [
  ["Қазақстанды Тәуелсіздік күнімен құттықтайтын роботты бейнелеңдер. Қалғандары табуы керек.", "Изобразите робота, который поздравляет Казахстан с Днём Независимости. Остальные должны угадать."],
  ["20 секундта болашақ Қазақстанның ұранын ойлап табыңдар.", "Придумайте за 20 секунд слоган Казахстана будущего."],
  ["«Тәуелсіздік» сөзін «бостандық», «ел», «тәуелсіздік» сөздерін қолданбай түсіндіріңдер.", "Объясните слово «Тәуелсіздік», не используя слова «свобода», «страна» и «независимость»."],
  ["Болашақ Қазақстанға қажет 8 технологияны кезекпен атаңдар.", "Назовите по очереди 8 технологий, которые могут пригодиться Казахстану будущего."],
  ["Болашақтың бір мамандығын сөзсіз көрсетіңдер, команда табуы керек.", "Покажите без слов одну из профессий будущего, а команда должна её угадать."],
  ["«35», «болашақ», «технология» сөздерін қолданып, Қазақстанға қысқа құттықтау айтыңдар.", "Придумайте короткое поздравление Казахстану, используя слова «35», «болашақ» и «технология»."],
];
const gridIdx = slideCount + 1;
const execIdx = gridIdx + cards.length + 1;
s = add("QUIZ", R5, "ROUND 5 · ҚЫЗЫҚ ТАПСЫРМА · Карточкалар");
s.addText("Карточканы таңдаңыз · Выберите карточку", { x: 0.8, y: 1.0, w: 11.7, h: 0.9, fontSize: 32, bold: true, color: C.text1, margin: 0, objectName: "title" });
cards.forEach((_, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.8 + col * 4.0, y = 2.2 + row * 2.3;
  s.addText([{ text: String(i + 1), options: { hyperlink: { slide: gridIdx + 1 + i, tooltip: `Карточка ${i + 1}` } } }], { x, y, w: 3.6, h: 2.0, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.2, fill: { color: C.accent2 }, color: C.text1, fontSize: 80, bold: true, align: "center", valign: "middle", margin: 0, objectName: "card-tile" });
});
s.addNotes("Команда называет номер — нажмите на эту карточку (ссылка откроет задание). Использованные номера отмечайте у себя.");
cards.forEach(([kz, ru], i) => {
  const c = add("QUIZ", R5, `ROUND 5 · Карточка ${i + 1}`);
  numCircle(c, i + 1, 0.8, 1.2, 1.2, 36);
  c.addText([{ text: kz, options: { color: C.text1, fontSize: 30, bold: true, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 24 } }], { x: 2.4, y: 1.1, w: 10.2, h: 3.6, valign: "middle", margin: 0, paraSpaceAfter: 12, objectName: "task" });
  c.addText("Дайындық · Подготовка — 20 сек", { x: 0.9, y: 5.2, w: 5.5, h: 0.5, fontSize: 16, bold: true, color: C.accent6, margin: 0, objectName: "phase" });
  button(c, "Орындау 30 сек ▶", execIdx, 7.2, 5.1, 2.6);
  button(c, "◀ Карточкалар", gridIdx, 10.0, 5.1, 2.6, 0.6, C.background2, C.text1);
  timer(c, 20);
  c.addNotes("Клик — таймер подготовки 20 с. Затем кнопка «Орындау 30 сек» — слайд выполнения.");
});
s = add("QUIZ", R5, "ROUND 5 · ҚЫЗЫҚ ТАПСЫРМА · Орындау");
s.addText("ОРЫНДАУ!", { x: 0.8, y: 2.2, w: 11.7, h: 1.6, fontSize: 80, bold: true, color: C.accent6, align: "center", valign: "middle", margin: 0, objectName: "title" });
s.addText("Выполнение задания — до 30 секунд", { x: 0.8, y: 4.9, w: 11.7, h: 0.6, fontSize: 22, bold: true, color: C.text1, align: "center", margin: 0, objectName: "subtitle" });
button(s, "◀ Карточкалар", gridIdx, 10.0, 0.9, 2.6, 0.6, C.background2, C.text1);
timer(s, 30);
s.addNotes("Клик — таймер 30 с. Кнопка «Карточкалар» возвращает к выбору карточки для следующей команды. После последней команды листайте вперёд — к раунду 6. Ведущий 2: «Вот теперь мы увидели, что у нас не только интеллектуальные, но и очень творческие команды!»");

// ---------- ROUND 6 ----------
const R6 = "Раунд 6 · БОЛАШАҚ ҚАЗАҚСТАН";
d = divider(R6, 6, "БОЛАШАҚ ҚАЗАҚСТАН", "Идея, которая сделает Казахстан лучше к 2050 году", 15, 12, "Подготовка 4 минуты · презентация до 1 минуты");
d.addNotes("Ведущий 2: «Мы вспомнили историю, проверили знания и заглянули в мир технологий. Теперь самое главное — будущее!» Ведущий 1: «Представьте, что вы — команда молодых новаторов…»");
s = add("QUIZ", R6, "ROUND 6 · БОЛАШАҚ ҚАЗАҚСТАН · Тапсырма");
s.addText("Қазақстан – 2050: сіздің идеяңыз", { x: 0.8, y: 0.9, w: 11.7, h: 0.8, fontSize: 34, bold: true, color: C.text1, margin: 0, objectName: "title" });
s.addText("Казахстан – 2050: ваша идея. Приложение, робот, AI-сервис, экоинициатива или технология для умного города", { x: 0.8, y: 1.7, w: 11.7, h: 0.8, fontSize: 17, color: C.accent3, margin: 0, objectName: "subtitle" });
const dirs = ["Умный город будущего", "ИИ в образовании", "Роботы для сельского хозяйства", "Экологическая безопасность", "Цифровая медицина", "Альтернативная энергетика", "Технологии для регионов Казахстана"];
dirs.forEach((t, i) => {
  const col = i % 4, row = Math.floor(i / 4);
  const x = 0.8 + col * 2.98, y = 2.85 + row * 1.75;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.75, h: 1.5, rectRadius: 0.15, fill: { color: C.background2 }, line: { type: "none" }, objectName: "dir-card" });
  numCircle(s, i + 1, x + 0.2, y + 0.2, 0.5, 14);
  s.addText(t, { x: x + 0.2, y: y + 0.75, w: 2.4, h: 0.65, fontSize: 15, bold: true, color: C.text1, valign: "top", margin: 0, objectName: "dir-text" });
});
s.addText("4 мин дайындық\n1 мин таныстыру", { x: 9.74, y: 4.6, w: 2.75, h: 1.5, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.15, fill: { color: C.accent2 }, color: C.text1, fontSize: 16, bold: true, align: "center", valign: "middle", margin: 0, objectName: "time-card" });
s.addNotes("Ведущий 1: «Вам нужно предложить идею, которая поможет Казахстану стать лучше к 2050 году.» Ведущий 2: «У вас 4 минуты на подготовку и до 1 минуты на презентацию…»");

s = add("QUIZ", R6, "ROUND 6 · БОЛАШАҚ ҚАЗАҚСТАН · Бағалау");
s.addText("Бағалау · Критерии оценивания", { x: 0.8, y: 1.0, w: 11.7, h: 0.9, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
[["3", "Мәселенің өзектілігі", "Актуальность проблемы"], ["4", "Шешімнің түпнұсқалығы", "Оригинальность решения"], ["4", "Шынайылығы мен пайдасы", "Реалистичность и польза"], ["4", "Таныстыру және командалық жұмыс", "Презентация и командная работа"]].forEach(([p, kz, ru], i) => {
  const x = 0.8 + i * 3.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: 2.75, h: 3.4, rectRadius: 0.2, fill: { color: C.background2 }, line: { type: "none" }, objectName: "crit-card" });
  numCircle(s, p, x + 0.78, 2.6, 1.2, 40);
  s.addText([{ text: kz, options: { bold: true, color: C.text1, fontSize: 16, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 14 } }], { x: x + 0.15, y: 4.0, w: 2.45, h: 1.5, align: "center", valign: "middle", margin: 0, objectName: "crit-text" });
});
s.addText("Максимум · 15 ұпай", { x: 0.8, y: 6.1, w: 11.7, h: 0.6, fontSize: 20, bold: true, color: C.accent6, margin: 0, objectName: "total" });

s = add("QUIZ", R6, "ROUND 6 · БОЛАШАҚ ҚАЗАҚСТАН · Дайындық");
sun(s, 5.07, 0.95, 3.2);
s.addText("4:00", { x: 5.07, y: 0.95, w: 3.2, h: 3.2, fontSize: 72, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "big-time" });
s.addText("Дайындық · Подготовка идеи — 4 минуты", { x: 0.8, y: 4.9, w: 11.7, h: 0.6, fontSize: 24, bold: true, color: C.text1, align: "center", margin: 0, objectName: "subtitle" });
timer(s, 240);
s.addNotes("Клик — таймер 4 минуты (полоса убывает, в конце — «Уақыт бітті!»).");
for (let t = 1; t <= 6; t++) {
  const p = add("QUIZ", R6, `ROUND 6 · Таныстыру · Команда ${t}`);
  numCircle(p, t, 0.8, 1.2, 1.6, 54);
  p.addText([{ text: `${t}-команда`, options: { fontSize: 44, bold: true, color: C.text1, breakLine: true } }, { text: `Команда ${t} — презентация идеи`, options: { fontSize: 22, color: C.accent3 } }], { x: 2.8, y: 1.1, w: 9.8, h: 1.8, valign: "middle", margin: 0, objectName: "team" });
  p.addText("Идеяның атауы · Название идеи: ____________________", { x: 0.8, y: 3.6, w: 11.7, h: 0.7, fontSize: 20, color: C.accent6, margin: 0, objectName: "IDEA_NAME" });
  timer(p, 60);
  p.addNotes(`Команда ${t}: клик — таймер 1 минута. Название идеи можно вписать в строку прямо во время шоу или удалить её. Если команд меньше шести, лишние слайды скройте (ПКМ → Скрыть слайд).` + (t === 6 ? " Ведущий 1: «Болашақ — бүгінгі таңдаудан басталады!» Ведущий 2: «Спасибо за ваши идеи! Возможно, именно сегодня мы увидели будущих инженеров, программистов, учёных и изобретателей Казахстана!»" : ""));
}

// ---------- FINAL ----------
const RF = "Награждение";
pres.addSection({ title: RF });
s = add("COVER", RF);
sun(s, 9.4, -1.2, 5.2);
s.addText("35", { x: 9.6, y: 0.2, w: 4.0, h: 2.6, fontSize: 150, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "big35" });
s.addText("Қорытынды", { x: 0.8, y: 2.3, w: 9, h: 1.2, fontSize: 64, bold: true, color: C.text1, margin: 0, objectName: "title" });
s.addText("Подведение итогов и награждение", { x: 0.8, y: 3.5, w: 9, h: 0.7, fontSize: 26, color: C.accent6, margin: 0, objectName: "subtitle" });
s.addText("35 жыл ішінде еліміз үлкен жолдан өтті. Ал келесі 35 жыл — біздің білімімізге, еңбегімізге және бірлігімізге байланысты.", { x: 0.8, y: 4.6, w: 8.6, h: 1.4, fontSize: 18, italic: true, color: C.accent3, margin: 0, objectName: "quote" });
s.addNotes("Ведущий 2: «Все раунды завершены. Сегодня мы увидели, насколько талантливы, умны и креативны наши девятиклассники!» Ведущий 1: «35 жыл ішінде еліміз үлкен жолдан өтті…» Ведущий 2: «Итак, результаты «Қызық Times»!» Секретарь передаёт итоговую таблицу.");

s = add("QUIZ", RF, "Номинациялар · Номинации");
s.addText("Арнайы номинациялар", { x: 0.8, y: 1.0, w: 11.7, h: 0.9, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
[["Үздік тапқыр команда", "За находчивость"], ["Ең креативті команда", "За оригинальные идеи"], ["Үздік капитан", "За лидерство"]].forEach(([kz, ru], i) => {
  const x = 0.8 + i * 4.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: 3.6, h: 3.6, rectRadius: 0.2, fill: { color: C.background2 }, line: { type: "none" }, objectName: "nom-card" });
  s.addShape(pres.shapes.OVAL, { x: x + 1.3, y: 2.6, w: 1.0, h: 1.0, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "medal" });
  s.addText("★", { x: x + 1.3, y: 2.6, w: 1.0, h: 1.0, fontSize: 32, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "star" });
  s.addText([{ text: `«${kz}»`, options: { bold: true, color: C.text1, fontSize: 18, breakLine: true } }, { text: ru, options: { color: C.accent3, fontSize: 14, breakLine: true } }, { text: "______________", options: { color: C.accent2, fontSize: 16 } }], { x: x + 0.2, y: 3.85, w: 3.2, h: 1.9, align: "center", valign: "middle", margin: 0, paraSpaceAfter: 6, objectName: "NOM_TEXT" });
});
s.addNotes("Строки «______» — для названий команд-победителей (впишите по таблице секретаря или удалите).");

[["III", "3-орын · 3 место", C.accent6], ["II", "2-орын · 2 место", C.accent1], ["I", "«БАС ЖҮЛДЕ» · 1 место", C.accent2]].forEach(([n, l, col]) => {
  const p = add("QUIZ", RF, "Марапаттау · Награждение");
  p.addText(n, { x: 0.8, y: 1.2, w: 4.6, h: 4.6, shape: pres.shapes.OVAL, fill: { color: col }, color: C.text1, fontSize: 120, bold: true, align: "center", valign: "middle", margin: 0, objectName: "place" });
  p.addText(l, { x: 6.0, y: 2.0, w: 6.6, h: 1.0, fontSize: 36, bold: true, color: C.text1, margin: 0, objectName: "title" });
  p.addText("Команда: ______________", { x: 6.0, y: 3.4, w: 6.6, h: 0.9, fontSize: 28, color: C.accent6, margin: 0, objectName: "WINNER" });
  p.addNotes("Впишите название команды по итоговой таблице секретаря. Объявляем по порядку: номинации → 3 → 2 → 1 место.");
});

s = add("COVER", RF);
s.addImage({ path: LOGO, x: (W - 7.6) / 2, y: 0.5, w: 7.6, h: 4.5, objectName: "logo", altText: "Логотип «Қызық Times – Special Edition 35»" });
s.addText("ТӘУЕЛСІЗДІККЕ 35 ЖЫЛ · 35 YEARS OF INDEPENDENCE", { x: 0.6, y: 5.5, w: 12.1, h: 0.8, fontSize: 32, bold: true, color: C.text1, align: "center", margin: 0, objectName: "title" });
s.addText("Тәуелсіздігіміз тұғырлы, болашағымыз жарқын болсын!  ·  С праздником, Казахстан!", { x: 0.6, y: 6.35, w: 12.1, h: 0.6, fontSize: 18, color: C.accent6, align: "center", margin: 0, objectName: "wish" });
s.addNotes("Ведущий 1: «Тәуелсіздігіміз тұғырлы, болашағымыз жарқын болсын!» Ведущий 2: «С праздником, Казахстан! Спасибо всем участникам, организаторам и болельщикам!» Праздничная музыка, общее фото команд на фоне этого слайда.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  require("fs").writeFileSync(OUT + ".timers.json", JSON.stringify(timers));
  console.log("slides:", slideCount, "timers:", timers.length);
})();
