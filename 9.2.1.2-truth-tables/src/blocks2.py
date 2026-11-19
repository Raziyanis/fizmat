# -*- coding: utf-8 -*-
EXTRA_CSS = """
/* ---- 9.2.1.2 truth tables ---- */
.tt-race,.tt-tbl{border-collapse:collapse;font-family:var(--f-mono);margin:0 auto;width:auto;min-width:0}
.tt-race th,.tt-race td,.tt-tbl th,.tt-tbl td{text-align:center;min-width:40px;padding:4px 8px;text-transform:none;letter-spacing:0}
.tt-race th,.tt-tbl th{font-family:var(--f-mono);font-size:.82rem;color:var(--ink);white-space:nowrap}
.tt-race td.tt-f,.tt-tbl td.tt-f{padding:2px}
.tt-race button,.tt-cell{width:100%;min-width:44px;min-height:30px;font:inherit;font-weight:700;border:1px solid var(--line);border-radius:6px;background:var(--b-soft);color:var(--ink);cursor:pointer}
.tt-cell.var{background:var(--a-soft)}
.tt-race button.ok,.tt-cell.ok{background:var(--ok-soft);border-color:var(--hit)}
.tt-race button.bad,.tt-cell.bad{background:var(--bad-soft);border-color:var(--bad);color:var(--bad)}
.race-time{font-family:var(--f-mono);font-weight:600;align-self:center}
.tt-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:start}
@media (max-width:820px){.tt-grid{grid-template-columns:1fr}}
.tt-tbl tr.cur td{background:var(--b-soft)}
.tt-tbl .curc{background:var(--b-soft)}
.tt-tbl td.one{color:var(--hit);font-weight:700}
.tt-tbl td.fcol,.tt-tbl th.fcol{border-left:2px solid var(--ink)}
.viz-row input.tt-expr{width:min(360px,100%)!important;font-family:var(--f-mono);font-size:1.05rem}
.sym-b{font-family:var(--f-mono);font-size:1rem;min-width:40px;padding:6px 10px}
.tt-steps{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px;display:grid;gap:8px;font-size:.92rem}
.tt-ops{margin:0;padding-left:22px;font-family:var(--f-mono)}
.tt-ops li{padding:2px 4px;border-radius:4px}
.tt-ops li.on{background:var(--b-soft);font-weight:700}
.tt-calc{font-family:var(--f-mono);font-size:.86rem;line-height:1.7}
.tt-err{color:var(--bad);font-weight:600}
.ex-b{font-family:var(--f-mono);font-size:.82rem}
.methods.ex-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.ex-card .tt-tbl{font-size:.85rem}
.tt-bar{border:0;padding:0;background:none;justify-content:flex-start;gap:8px}
.tt-q{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.tt-q input{width:140px;font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:8px}
.basic-tt{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.basic-tt .prop h3{margin-bottom:6px}
"""

TF_CARDS = [
 ("n айнымалы үшін ақиқат кестесінде 2 · n жол болады.", "<b>Бұрыс.</b> Жолдар саны 2<sup>n</sup>: 3 айнымалыға 8 жол, 4 айнымалыға 16 жол."),
 ("ЖӘНЕ (∧) амалының нәтижесі екі мән де 1 болғанда ғана 1 болады.", "<b>Дұрыс.</b> Бір 0 жеткілікті: 1 ∧ 0 = 0."),
 ("¬A ∨ B өрнегінде алдымен ∨ орындалады.", "<b>Бұрыс.</b> Алдымен терістеу ¬, содан кейін ∧, ең соңында ∨."),
 ("НЕМЕСЕ (∨) амалы екі мән де 0 болғанда ғана 0 болады.", "<b>Дұрыс.</b> Бір 1 жеткілікті: 0 ∨ 1 = 1."),
 ("Ақиқат кестесінде жиындар екілік санау ретімен жазылады: 00, 01, 10, 11.", "<b>Дұрыс.</b> Сонда бірде-бір жиын жоғалмайды. Ал үлкен өрнектің кестесін тез әрі қатесіз қалай тұрғызамыз? Бүгінгі сабақ осы туралы."),
]

def tf_cards():
    return '\n'.join(f'      <details class="qcard"><summary><span class="qn">{i}</span><span>{q}</span><span class="pk-chip" hidden></span>'
                     f'<button class="pk-mini" type="button">Кім жауап береді?</button></summary><p>{a}</p></details>'
                     for i, (q, a) in enumerate(TF_CARDS, 1))

MEMO = """    <details class="memo"><summary>Жадынама: негізгі логикалық амалдар</summary>
      <div class="tbl-wrap"><table class="tt-tbl">
        <thead><tr><th>A</th><th>B</th><th class="fcol">¬A</th><th>A ∧ B</th><th>A ∨ B</th></tr></thead>
        <tbody><tr><td>0</td><td>0</td><td class="fcol">1</td><td>0</td><td>0</td></tr><tr><td>0</td><td>1</td><td class="fcol">1</td><td>0</td><td>1</td></tr>
        <tr><td>1</td><td>0</td><td class="fcol">0</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td class="fcol">0</td><td>1</td><td>1</td></tr></tbody>
      </table></div>
      <p class="howto" style="margin-top:8px">Амалдар реті: жақша ( ) → терістеу ¬ → ЖӘНЕ ∧ → НЕМЕСЕ ∨. Жолдар саны: 2<sup>n</sup>.</p>
    </details>"""

TEMA = """  <section id="tema">
    <div class="sec-head"><h2>Сабақтың тақырыбын анықтаймыз</h2><p>Бір кестені екі тәсілмен толтырып, уақыт пен қателерді салыстырыңыз. Содан кейін бағыттаушы сұрақтарға жауап беріңіз. Уақыты — шамамен 5 минут.</p></div>
    <div class="topic-grid">
      <div class="step">
        <h3 class="sub">1-тәсіл. F-ті бірден</h3>
        <p><code>F = (A ∨ B) ∧ ¬C</code> өрнегінің мәнін әр жолда ойша есептеп, тек F бағанын толтырыңыз. Ұяшықты басқан сайын мәні 0 мен 1 болып ауысады. Секундомер бірінші басқанда іске қосылады.</p>
        <div id="race1"></div>
      </div>
      <div class="step">
        <h3 class="sub">2-тәсіл. Аралық бағандармен</h3>
        <p>Дәл сол өрнек, бірақ алдымен <code>A ∨ B</code>, содан кейін <code>¬C</code>, ең соңында F. Ұяшықтар көбейді — уақыт пен қателер ше?</p>
        <div id="race2"></div>
      </div>
    </div>
    <h3 class="sub">Бағыттаушы сұрақтар</h3>
    <div class="qcards">
      <details class="qcard"><summary><span class="qn">1</span><span>Қай тәсілде қателер аз болды? Неліктен?</span></summary><p>Аралық бағандармен: әр бағанда бір ғана амал есептеледі, ойда ештеңе сақтамаймыз. Қате болса, оны қай бағанда екені бірден көрінеді.</p></details>
      <details class="qcard"><summary><span class="qn">2</span><span>Кестеде неше жол болды? Ол неге байланысты?</span></summary><p>8 жол: айнымалы үшеу, 2<sup>3</sup> = 8.</p></details>
      <details class="qcard"><summary><span class="qn">3</span><span>A, B, C мәндері қандай ретпен жазылды?</span></summary><p>Екілік санау ретімен: 000-ден 111-ге дейін. Сонда бірде-бір жиын жоғалмайды және қайталанбайды.</p></details>
      <details class="qcard"><summary><span class="qn">4</span><span>Аралық бағандардың реті неге байланысты?</span></summary><p>Амалдардың орындалу ретіне: жақша, ¬, ∧, ∨.</p></details>
      <details class="qcard"><summary><span class="qn">5</span><span>Ақиқат кестесі өмірде қайда керек?</span></summary><p>Сандық сұлбаларда (компьютер, калькулятор), дабыл мен автоматика жүйелерінде, ережелер мен шарттарды тексеруде.</p></details>
      <details class="qcard final"><summary><span class="qn">?</span><span>Сонымен, сабақтың тақырыбы қандай?</span></summary><p class="topic-reveal">Ақиқат кестесін тұрғызу</p><p><a href="#cel">Сабақ мақсатына өту →</a></p></details>
    </div>
  </section>"""

CEL = """  <section id="cel">
    <div class="topic-head">
      <div class="eyebrow">Информатика · 9-сынып · Логика</div>
      <h1>Ақиқат кестесін тұрғызу</h1>
      <div class="tri">ақиқат кестесі · таблица истинности · truth table</div>
    </div>
    <div class="objective"><span class="obj-code">9.2.1.2</span><span><b>Оқыту мақсаты:</b> берілген логикалық өрнекке ақиқат кестесін тұрғызу</span></div>
    <div class="two-col">
      <div class="goals">
        <div class="goals-title">Сабақ мақсаттары</div>
        <div><b>Барлығы</b><span>екі айнымалы өрнектің ақиқат кестесін тұрғызады: жолдар санын анықтап, жиындарды екілік санау ретімен жазады</span></div>
        <div><b>Көпшілігі</b><span>амалдардың орындалу ретін анықтап, аралық бағандар арқылы үш айнымалы өрнектің ақиқат кестесін тұрғызады</span></div>
        <div><b>Кейбіреулері</b><span>кестені талдайды: ақиқат жиындарды санайды, екі өрнектің тең мәнділігін кесте арқылы тексереді</span></div>
      </div>
      <div class="goals">
        <div class="goals-title">Күтілетін нәтижелер — сабақтың соңында мен</div>
        <div><b>Білемін</b><span>¬, ∧, ∨ амалдарының ақиқат кестелерін және олардың орындалу ретін</span></div>
        <div><b>Істей аламын</b><span>жолдар мен бағандар санын анықтауды, кестені аралық бағандармен қатесіз толтыруды</span></div>
        <div><b>Түсінемін</b><span>n айнымалыға неге 2<sup>n</sup> жол керек екенін және кесте екі өрнектің тең мәнділігін қалай дәлелдейтінін</span></div>
      </div>
    </div>
    <h3 class="sub">Тапсырмаларды орындау арқылы мақсатқа қалай жетеміз</h3>
    <p class="howto">Мақсат тек жеке тапсырмалар бойынша бағаланады: викторина, практикалық жұмыс және қосымша есептер. Деңгей өз жолындағы барлық тапсырма орындалғанда есептеледі. Қорытынды <a href="#refleksiya">Рефлексия</a> қойындысында автоматты түрде көрсетіледі, мұғалім оны әр оқушы бойынша көреді.</p>
    <div class="tbl-wrap"><table class="plan levels-plan">
      <thead><tr><th>Мақсат деңгейі</th><th>Мен істей аламын</th><th>Мұны қандай тапсырмалар дәлелдейді</th></tr></thead>
      <tbody>
        <tr><td><span class="lvl a">Барлығы</span></td><td>Екі айнымалы өрнектің ақиқат кестесін тұрғызамын</td>
          <td><a href="#viktorina">Викторина, 1, 2-сұрақтар</a><br><a href="#praktika">Практика P1, P2</a></td></tr>
        <tr><td><span class="lvl b">Көпшілігі</span></td><td>Аралық бағандармен үш айнымалы өрнектің кестесін тұрғызамын</td>
          <td><a href="#viktorina">Викторина, 3, 4, 5-сұрақтар</a><br><a href="#praktika">Практика P3, P4</a><br><a href="#dop">Қосымша есеп A1 немесе A2</a></td></tr>
        <tr><td><span class="lvl c">Кейбіреулері</span></td><td>Кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін</td>
          <td><a href="#viktorina">Викторина, 6, 7-сұрақтар</a><br><a href="#praktika">Практика P5, P6</a><br><a href="#dop">B немесе C деңгейіндегі қосымша есеп</a></td></tr>
      </tbody>
    </table></div>
    <h3 class="sub">40 минуттық жоспар</h3>
    <div class="tbl-wrap"><table class="plan">
      <thead><tr><th>Уақыты</th><th>Кезең</th><th>Қойынды</th></tr></thead>
      <tbody>
        <tr><td>0–5 мин</td><td>Қайталау: «Дұрыс / Бұрыс», жұппен сәйкестендіру</td><td><a href="#povtorenie">Қайталау</a></td></tr>
        <tr><td>5–10 мин</td><td>Екі тәсілмен жарыс, тақырып пен мақсат</td><td><a href="#tema">Тақырып қандай?</a>, <a href="#cel">Сабақ мақсаты</a></td></tr>
        <tr><td>10–17 мин</td><td>Жаңа тақырып: тұрғызу алгоритмі, конструктор, мысалдар</td><td><a href="#svoistva">Алгоритм</a>, <a href="#lab">Конструктор</a>, <a href="#metody">Мысалдар</a></td></tr>
        <tr><td>17–23 мин</td><td>Топпен жұмыс: кестедегі қатені табу</td><td><a href="#oshibka">Қатені тап</a></td></tr>
        <tr><td>23–27 мин</td><td>Жеке жұмыс: викторина</td><td><a href="#viktorina">Викторина</a></td></tr>
        <tr><td>27–37 мин</td><td>Практикалық жұмыс P1–P6</td><td><a href="#praktika">Практика</a></td></tr>
        <tr><td>37–40 мин</td><td>Рефлексия, мақсатқа жету</td><td><a href="#refleksiya">Рефлексия</a></td></tr>
      </tbody>
    </table></div>
    <p class="howto">«Қай өрнек?» және «Қосымша есептер» — жылдам аяқтағандарға, мұғалімнің таңдауымен немесе үй жұмысына.</p>
    <h3 class="sub">Жаттығу <span class="time">мақсатты бағалауға кірмейді</span></h3>
    <div class="train">
      <a href="#lab">Конструктор</a><span>кесте қалай тұрғызылатынын қадамдап көреміз</span>
      <a href="#metody">Мысалдар</a><span>дайын кестелерді оқимыз</span>
      <a href="#kakoy">Қай өрнек?</a><span>жағдаятқа сай өрнек таңдаймыз</span>
      <a href="#oshibka">Қатені тап</a><span>топта кестедегі қателерді түзетеміз</span>
    </div>
  </section>"""

SVOISTVA = """  <section id="svoistva">
    <div class="sec-head"><h2>Ақиқат кестесін тұрғызу алгоритмі</h2><p>Уақыты — шамамен 4 минут.</p></div>
    <div class="definition">
      <div class="def-label">Анықтама</div>
      <p class="def-text"><b>Ақиқат кестесі</b> (таблица истинности, truth table) — логикалық өрнектің айнымалылар мәндерінің барлық жиынында қабылдайтын мәндерінің кестесі. n айнымалы үшін 2<sup>n</sup> жиын, яғни 2<sup>n</sup> жол болады.</p>
    </div>
    <h3 class="sub">Негізгі амалдардың ақиқат кестелері</h3>
    <div class="basic-tt">
      <div class="prop"><h3>Инверсия, ¬ (ЕМЕС)</h3><div class="tbl-wrap"><table class="tt-tbl"><thead><tr><th>A</th><th class="fcol">¬A</th></tr></thead><tbody><tr><td>0</td><td class="fcol">1</td></tr><tr><td>1</td><td class="fcol">0</td></tr></tbody></table></div><p>Мәнді керісінше өзгертеді.</p></div>
      <div class="prop"><h3>Конъюнкция, ∧ (ЖӘНЕ)</h3><div class="tbl-wrap"><table class="tt-tbl"><thead><tr><th>A</th><th>B</th><th class="fcol">A ∧ B</th></tr></thead><tbody><tr><td>0</td><td>0</td><td class="fcol">0</td></tr><tr><td>0</td><td>1</td><td class="fcol">0</td></tr><tr><td>1</td><td>0</td><td class="fcol">0</td></tr><tr><td>1</td><td>1</td><td class="fcol one">1</td></tr></tbody></table></div><p>Екеуі де 1 болса ғана 1.</p></div>
      <div class="prop"><h3>Дизъюнкция, ∨ (НЕМЕСЕ)</h3><div class="tbl-wrap"><table class="tt-tbl"><thead><tr><th>A</th><th>B</th><th class="fcol">A ∨ B</th></tr></thead><tbody><tr><td>0</td><td>0</td><td class="fcol">0</td></tr><tr><td>0</td><td>1</td><td class="fcol one">1</td></tr><tr><td>1</td><td>0</td><td class="fcol one">1</td></tr><tr><td>1</td><td>1</td><td class="fcol one">1</td></tr></tbody></table></div><p>Кемінде біреуі 1 болса 1.</p></div>
    </div>
    <h3 class="sub">Ақиқат кестесін тұрғызу қадамдары</h3>
    <ol class="algo-steps">
      <li>Айнымалыларды санаңыз: n айнымалы → <b>2<sup>n</sup> жол</b>.</li>
      <li>Амалдардың орындалу ретін анықтаңыз: жақша ( ) → ¬ → ∧ → ∨. Әр амал — бір баған.</li>
      <li>Бағандар санын табыңыз: <b>айнымалылар саны + амалдар саны</b>. Кестенің тақырып жолына айнымалыларды, содан кейін амалдарды орындалу ретімен жазыңыз.</li>
      <li>Айнымалылардың мәндерін <b>екілік санау ретімен</b> жазыңыз: бірінші айнымалы бағанының жартысы 0, жартысы 1; келесісінде топтар екі есе кіші; соңғысында 0 мен 1 кезектеседі.</li>
      <li>Аралық бағандарды солдан оңға қарай, бағанды толығымен толтырыңыз. Әр бағанда тек бір амал есептеледі.</li>
      <li>Соңғы баған — F, өрнектің мәні. Кестені талдау керек болса, F = 1 жолдарын санаңыз.</li>
    </ol>
    <h3 class="sub">Мысал: F = (A ∨ B) ∧ ¬C</h3>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Қадам</th><th>Нәтиже</th></tr></thead>
      <tbody>
        <tr><td>Айнымалылар</td><td>A, B, C → n = 3 → 2<sup>3</sup> = <b>8 жол</b></td></tr>
        <tr><td>Амалдар реті</td><td>1) A ∨ B (жақша) &nbsp; 2) ¬C &nbsp; 3) (A ∨ B) ∧ ¬C</td></tr>
        <tr><td>Бағандар</td><td>3 айнымалы + 3 амал = <b>6 баған</b></td></tr>
        <tr><td>A, B, C бағандары</td><td>A: 0 0 0 0 1 1 1 1 · B: 0 0 1 1 0 0 1 1 · C: 0 1 0 1 0 1 0 1</td></tr>
      </tbody>
    </table></div>
    <div class="terms">
      <div class="term"><div class="kz">ақиқат кестесі</div>таблица истинности<div class="en">truth table</div></div>
      <div class="term"><div class="kz">логикалық өрнек</div>логическое выражение<div class="en">logical expression</div></div>
      <div class="term"><div class="kz">айнымалы</div>переменная<div class="en">variable</div></div>
      <div class="term"><div class="kz">мәндер жиыны</div>набор значений<div class="en">combination</div></div>
      <div class="term"><div class="kz">аралық баған</div>промежуточный столбец<div class="en">intermediate column</div></div>
      <div class="term"><div class="kz">тең мәнді</div>равносильный<div class="en">equivalent</div></div>
    </div>
  </section>"""

LAB = """  <section id="lab">
    <div class="sec-head"><h2>Ақиқат кестесінің конструкторы</h2><p>Өрнекті жазыңыз (батырмалармен немесе пернетақтамен): айнымалылар A, B, C, D; амалдар ¬, ∧, ∨ және жақшалар. Конструктор амалдардың ретін анықтап, кестені аралық бағандарымен тұрғызады. «Жолдап» режимінде кесте жол-жолымен, «Бағандап» режимінде баған-бағанымен толады. Уақыты — шамамен 3 минут.</p></div>
    <div class="viz">
      <div class="viz-row" role="group" aria-label="Мысалдар"><span class="viz-lbl">Мысалдар:</span>
        <button class="btn-ghost ex-b" type="button" data-ex="A ∧ ¬B">A ∧ ¬B</button>
        <button class="btn-ghost ex-b" type="button" data-ex="¬(A ∨ B)">¬(A ∨ B)</button>
        <button class="btn-ghost ex-b" type="button" data-ex="(A ∨ B) ∧ ¬C">(A ∨ B) ∧ ¬C</button>
        <button class="btn-ghost ex-b" type="button" data-ex="A ∨ ¬B ∧ C">A ∨ ¬B ∧ C</button>
        <button class="btn-ghost ex-b" type="button" data-ex="(A ∧ B) ∨ (C ∧ D)">(A ∧ B) ∨ (C ∧ D)</button></div>
      <div class="viz-row"><label class="viz-lbl" for="ttExpr">F =</label><input type="text" id="ttExpr" class="tt-expr" value="(A ∨ B) ∧ ¬C" spellcheck="false" autocomplete="off"></div>
      <div class="viz-row" role="group" aria-label="Белгілер"><button class="btn-ghost sym-b" type="button" data-sym="¬">¬</button><button class="btn-ghost sym-b" type="button" data-sym=" ∧ ">∧</button><button class="btn-ghost sym-b" type="button" data-sym=" ∨ ">∨</button><button class="btn-ghost sym-b" type="button" data-sym="(">(</button><button class="btn-ghost sym-b" type="button" data-sym=")">)</button><button class="btn-ghost sym-b" type="button" data-sym="A">A</button><button class="btn-ghost sym-b" type="button" data-sym="B">B</button><button class="btn-ghost sym-b" type="button" data-sym="C">C</button><button class="btn-ghost sym-b" type="button" data-sym="D">D</button><button class="btn-ghost sym-b" type="button" data-sym="⌫">⌫</button></div>
      <div class="viz-row" role="group" aria-label="Режим"><span class="viz-lbl">Толтыру:</span><button class="alg-b" type="button" data-ttm="row" aria-pressed="true">Жолдап</button><button class="alg-b" type="button" data-ttm="col" aria-pressed="false">Бағандап</button></div>
      <div class="viz-row"><button class="btn" type="button" id="ttStep">Қадам</button><button class="btn alt" type="button" id="ttAuto">▶ Авто</button><button class="btn-ghost" type="button" id="ttAll">Бүкіл кесте</button><button class="btn-ghost" type="button" id="ttReset">Басынан</button></div>
      <div class="viz-stat"><span>Айнымалылар: <b id="ttVars">—</b></span><span>Жолдар: <b id="ttRows">—</b></span><span>Бағандар: <b id="ttCols">—</b></span><span>F = 1: <b id="ttOnes">—</b></span><span id="ttState"></span></div>
      <div class="tt-grid"><div class="tbl-wrap"><table class="tt-tbl" id="ttTbl"></table></div><div class="tt-steps" id="ttSteps"></div></div>
    </div>
  </section>"""

METODY = """  <section id="metody">
    <div class="sec-head"><h2>Мысалдар: дайын кестелер</h2><p>Әр кестені оқып, түсіндірмемен салыстырыңыз. «Конструкторда ашу» батырмасы кестенің қалай тұрғызылатынын қадамдап көрсетеді. Уақыты — шамамен 2 минут.</p></div>
    <div class="methods ex-grid" id="methods"></div>
  </section>

"""

REFL = """    <div class="refl">
      <div class="card">
        <h3>Табыс баспалдағы</h3>
        <label class="check"><input type="checkbox" id="st1"><span>¬, ∧, ∨ амалдарының ақиқат кестелерін білемін</span></label>
        <label class="check"><input type="checkbox" id="st2"><span>Жолдар мен бағандар санын анықтап, жиындарды екілік санау ретімен жазамын</span></label>
        <label class="check"><input type="checkbox" id="st3"><span>Аралық бағандар арқылы үш айнымалы өрнектің кестесін тұрғызамын</span></label>
        <label class="check"><input type="checkbox" id="st4"><span>Кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін</span></label>
      </div>
      <div class="card">
        <h3>Шығу билеті 3-2-1</h3>
        <label for="r3">Ақиқат кестесін тұрғызудың 3 қадамы</label><textarea id="r3"></textarea>
        <label for="r2">Аралық бағандардың 2 пайдасы</label><textarea id="r2"></textarea>
        <label for="r1">Ақиқат кестесі қажет болатын өмірден 1 мысал</label><textarea id="r1"></textarea>
      </div>
    </div>"""
