# -*- coding: utf-8 -*-
"""New HTML blocks for the truth-table lesson (Kazakh)."""

EXTRA_CSS = """
/* ---- truth-table lesson ---- */
.tt-race,.tt-tbl{border-collapse:collapse;font-family:var(--f-mono);margin:0 auto;width:auto;min-width:0}
.tt-race th,.tt-race td,.tt-tbl th,.tt-tbl td{text-align:center;min-width:42px;padding:4px 8px}
.tt-race td.tt-f{padding:2px}
.tt-race button{width:100%;min-width:46px;min-height:30px;font:inherit;font-weight:700;border:1px solid var(--line);border-radius:6px;background:var(--b-soft);color:var(--ink);cursor:pointer}
.tt-race button.ok{background:var(--ok-soft);border-color:var(--hit)}
.tt-race button.bad{background:var(--bad-soft);border-color:var(--bad)}
.race-time{font-family:var(--f-mono);font-weight:600;align-self:center}
.tt-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:14px;align-items:start}
@media (max-width:820px){.tt-grid{grid-template-columns:1fr}}
.tt-tbl tr.cur td{background:var(--b-soft)}
.tt-tbl td.one{color:var(--hit);font-weight:700}
.tt-tbl td.fcol,.tt-tbl th.fcol{border-left:2px solid var(--ink)}
.viz-row input.tt-expr{width:min(340px,100%)!important;font-family:var(--f-mono)}
.tt-code{margin:0;font-family:var(--f-mono);font-size:.84rem;background:var(--code-bg);color:var(--code-ink);padding:12px;border-radius:10px;white-space:pre;overflow-x:auto}
.tt-code .hl{background:rgba(255,255,255,.14);display:inline-block;min-width:100%}
.tt-code .cm{color:var(--code-muted)}
.tt-err{color:var(--bad);font-weight:600}
.ex-b{font-family:var(--f-mono);font-size:.82rem}
"""

TF_CARDS = [
 ("n айнымалы үшін ақиқат кестесінде 2 · n жол болады.", "<b>Бұрыс.</b> Жолдар саны 2<sup>n</sup>: 3 айнымалыға 8 жол, 4 айнымалыға 16 жол."),
 ("ЖӘНЕ (∧) амалының нәтижесі екі мән де 1 болғанда ғана 1 болады.", "<b>Дұрыс.</b> Бір 0 жеткілікті: 1 ∧ 0 = 0."),
 ("¬A ∨ B өрнегінде алдымен ∨ орындалады.", "<b>Бұрыс.</b> Алдымен терістеу ¬, содан кейін ∧, ең соңында ∨."),
 ("НЕМЕСЕ (∨) амалы екі мән де 0 болғанда ғана 0 болады.", "<b>Дұрыс.</b> Бір 1 жеткілікті: 0 ∨ 1 = 1."),
 ("Python-да ∧, ∨, ¬ амалдары and, or, not деп жазылады.", "<b>Дұрыс.</b> Ал ақиқат кестесін компьютер өзі құра ала ма? Бүгінгі сабақ осы туралы."),
]

def tf_cards():
    out = []
    for i, (q, a) in enumerate(TF_CARDS, 1):
        out.append(f'      <details class="qcard"><summary><span class="qn">{i}</span><span>{q}</span><span class="pk-chip" hidden></span>'
                   f'<button class="pk-mini" type="button">Кім жауап береді?</button></summary><p>{a}</p></details>')
    return '\n'.join(out)

MEMO = """    <details class="memo"><summary>Жадынама: логикалық амалдар</summary>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Логикада</th><th>Python-да</th><th>Мағынасы</th></tr></thead>
        <tbody>
          <tr><td>¬A</td><td><code>not A</code></td><td>терістеу: 0 → 1, 1 → 0</td></tr>
          <tr><td>A ∧ B</td><td><code>A and B</code></td><td>екеуі де 1 болса ғана 1</td></tr>
          <tr><td>A ∨ B</td><td><code>A or B</code></td><td>кемінде біреуі 1 болса 1</td></tr>
          <tr><td>амалдар реті</td><td><code>( )</code>, <code>not</code>, <code>and</code>, <code>or</code></td><td>жақша, терістеу, ЖӘНЕ, НЕМЕСЕ</td></tr>
          <tr><td>жолдар саны</td><td><code>2 ** n</code></td><td>n айнымалы → 2<sup>n</sup> жол</td></tr>
        </tbody>
      </table></div>
    </details>"""

TEMA = """  <section id="tema">
    <div class="sec-head"><h2>Сабақтың тақырыбын анықтаймыз</h2><p>Компьютермен жарысып, бағыттаушы сұрақтарға жауап беріңіз. Соңғы кеңесті ашпай тұрып, тақырыпты атап көріңіз. Уақыты — шамамен 3 минут.</p></div>
    <div class="topic-grid">
      <div class="step">
        <h3 class="sub">1-қадам. «Адам мен компьютер» жарысы</h3>
        <p><code>F = (A ∨ B) ∧ ¬C</code> өрнегінің ақиқат кестесін толтырыңыз: F ұяшығын басқан сайын мәні 0 мен 1 болып ауысады. Секундомер бірінші басқанда іске қосылады.</p>
        <div class="tbl-wrap"><table class="tt-race" id="raceTbl"></table></div>
        <div class="answer-row"><button class="btn" type="button" id="raceCheck">Тексеру</button><button class="btn-ghost" type="button" id="raceNew">Қайта бастау</button><span class="race-time" id="raceTime">0,0 с</span></div>
        <p class="feedback" id="raceFb" hidden></p>
      </div>
      <div class="step">
        <h3 class="sub">2-қадам. Енді компьютер</h3>
        <p>Дәл сол кестені Python бағдарламасы құрады. «▶ Іске қосу» батырмасын басыңыз: компьютер кестені бір сәтте және қатесіз құрады. Өз нәтижеңізбен салыстырыңыз.</p>
        <div id="edRace"></div>
        <details class="reveal"><summary>Ал айнымалы 5 болса ше?</summary>
          <p>Қолмен 2<sup>5</sup> = 32 жолды толтыру керек. Бағдарламаға тек екі цикл қосылады.</p>
          <div id="edRace5"></div>
        </details>
      </div>
    </div>
    <h3 class="sub">3-қадам. Бағыттаушы сұрақтар</h3>
    <div class="qcards">
      <details class="qcard"><summary><span class="qn">1</span><span>Кестені толтыруға сізге қанша уақыт кетті, ал компьютерге ше?</span></summary><p>Қолмен — ондаған секунд және қателесу қаупі бар. Компьютер кестені секундтың мыңнан бір бөлігінде, қатесіз құрады.</p></details>
      <details class="qcard"><summary><span class="qn">2</span><span>Бағдарлама A, B, C айнымалыларының барлық мәндерін қалай аралап шықты?</span></summary><p>Кірістірілген <b>for</b> циклдерімен: әр айнымалы <code>range(2)</code> арқылы 0 мен 1 мәндерін алады. Сыртқы цикл — A, ең ішкісі — C.</p></details>
      <details class="qcard"><summary><span class="qn">3</span><span>Айнымалылар саны мен циклдер саны, жолдар саны қалай байланысты?</span></summary><p>n айнымалы — n кірістірілген цикл және 2<sup>n</sup> жол.</p></details>
      <details class="qcard"><summary><span class="qn">4</span><span>∧, ∨, ¬ белгілері бағдарламада қалай жазылды?</span></summary><p><code>and</code>, <code>or</code>, <code>not</code>. Амалдар реті математикадағыдай: алдымен <code>not</code>, содан кейін <code>and</code>, ең соңында <code>or</code>.</p></details>
      <details class="qcard"><summary><span class="qn">5</span><span>Мұндай бағдарлама өмірде қайда керек?</span></summary><p>Сандық сұлбаларды, дабыл жүйелерін, ойын ережелерін тексеруде: бағдарлама барлық жағдайды аралап, қатені тез табады.</p></details>
      <details class="qcard final"><summary><span class="qn">?</span><span>Сонымен, сабақтың тақырыбы қандай?</span></summary><p class="topic-reveal">Python-да ақиқат кестелерін құру мәселелерін шешу</p><p><a href="#cel">Сабақ мақсатына өту →</a></p></details>
    </div>
  </section>"""

CEL = """  <section id="cel">
    <div class="topic-head">
      <div class="eyebrow">Информатика · 9-сынып · Python</div>
      <h1>Python-да ақиқат кестелерін құру мәселелерін шешу</h1>
      <div class="tri">ақиқат кестесі · таблица истинности · truth table</div>
    </div>
    <div class="objective"><span class="obj-code">9.2.4.3</span><span><b>Оқыту мақсаты:</b> берілген логикалық өрнек үшін ақиқат кестелерін құру</span></div>
    <div class="two-col">
      <div class="goals">
        <div class="goals-title">Сабақ мақсаттары</div>
        <div><b>Барлығы</b><span>логикалық өрнекті Python-да <code>and</code>, <code>or</code>, <code>not</code> арқылы жазып, берілген жиын үшін мәнін есептейді</span></div>
        <div><b>Көпшілігі</b><span>кірістірілген <code>for</code> циклдерімен екі және үш айнымалы өрнектің толық ақиқат кестесін шығарады</span></div>
        <div><b>Кейбіреулері</b><span>кестені бағдарламамен талдайды: ақиқат жиындарды санайды, екі өрнектің тең мәнділігін тексереді</span></div>
      </div>
      <div class="goals">
        <div class="goals-title">Күтілетін нәтижелер — сабақтың соңында мен</div>
        <div><b>Білемін</b><span>∧, ∨, ¬ амалдарының Python-да <code>and</code>, <code>or</code>, <code>not</code> деп жазылатынын және олардың орындалу ретін</span></div>
        <div><b>Істей аламын</b><span><code>for A in range(2)</code> циклдерімен барлық жиынды аралап, кестені 0/1 түрінде шығаруды</span></div>
        <div><b>Түсінемін</b><span>n айнымалыға неге 2<sup>n</sup> жол және n кірістірілген цикл керек екенін, кестені бағдарламамен тексеру қатені табуға қалай көмектесетінін</span></div>
      </div>
    </div>
    <h3 class="sub">Тапсырмаларды орындау арқылы мақсатқа қалай жетеміз</h3>
    <p class="howto">Мақсат тек жеке тапсырмалар бойынша бағаланады: викторина, практикалық жұмыс және қосымша есептер. Деңгей өз жолындағы барлық тапсырма орындалғанда есептеледі. Қорытынды <a href="#refleksiya">Рефлексия</a> қойындысында автоматты түрде көрсетіледі, мұғалім оны әр оқушы бойынша көреді.</p>
    <div class="tbl-wrap"><table class="plan levels-plan">
      <thead><tr><th>Мақсат деңгейі</th><th>Мен істей аламын</th><th>Мұны қандай тапсырмалар дәлелдейді</th></tr></thead>
      <tbody>
        <tr><td><span class="lvl a">Барлығы</span></td><td>Өрнекті Python-да жазып, бір жиын үшін мәнін есептеймін</td>
          <td><a href="#viktorina">Викторина, 1, 2-сұрақтар</a><br><a href="#praktika">Практика P1, P2</a>: бір жиын, екі айнымалы кесте</td></tr>
        <tr><td><span class="lvl b">Көпшілігі</span></td><td>Екі және үш айнымалы өрнектің ақиқат кестесін шығарамын</td>
          <td><a href="#viktorina">Викторина, 3, 4, 5-сұрақтар</a><br><a href="#praktika">Практика P3, P4</a>: толық кесте, ақиқат жиындар<br><a href="#dop">Қосымша есеп A1 немесе A2</a></td></tr>
        <tr><td><span class="lvl c">Кейбіреулері</span></td><td>Кестені талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін</td>
          <td><a href="#viktorina">Викторина, 6, 7-сұрақтар</a><br><a href="#praktika">Практика P5, P6</a>: тең мәнділік, кесте бойынша жиындар<br><a href="#dop">B немесе C деңгейіндегі қосымша есеп</a></td></tr>
      </tbody>
    </table></div>
    <h3 class="sub">40 минуттық жоспар</h3>
    <div class="tbl-wrap"><table class="plan">
      <thead><tr><th>Уақыты</th><th>Кезең</th><th>Қойынды</th></tr></thead>
      <tbody>
        <tr><td>0–5 мин</td><td>Қайталау: «Дұрыс / Бұрыс», жұппен сәйкестендіру</td><td><a href="#povtorenie">Қайталау</a></td></tr>
        <tr><td>5–10 мин</td><td>«Адам мен компьютер» жарысы, тақырып пен мақсат</td><td><a href="#tema">Тақырып қандай?</a>, <a href="#cel">Сабақ мақсаты</a></td></tr>
        <tr><td>10–17 мин</td><td>Жаңа тақырып: кестені құру қадамдары, конструктор, дайын код</td><td><a href="#svoistva">Анықтама</a>, <a href="#lab">Конструктор</a>, <a href="#metody">Кодта</a></td></tr>
        <tr><td>17–23 мин</td><td>Топпен жұмыс: қатені табу</td><td><a href="#oshibka">Қатені тап</a></td></tr>
        <tr><td>23–27 мин</td><td>Жеке жұмыс: нәтижені болжау</td><td><a href="#viktorina">Викторина</a></td></tr>
        <tr><td>27–37 мин</td><td>Практикалық жұмыс P1–P6</td><td><a href="#praktika">Практика</a></td></tr>
        <tr><td>37–40 мин</td><td>Рефлексия, мақсатқа жету</td><td><a href="#refleksiya">Рефлексия</a></td></tr>
      </tbody>
    </table></div>
    <p class="howto">«Құмсалғыш», «Қай өрнек?» және «Қосымша есептер» — жылдам аяқтағандарға, мұғалімнің таңдауымен немесе үй жұмысына.</p>
    <h3 class="sub">Жаттығу <span class="time">мақсатты бағалауға кірмейді</span></h3>
    <div class="train">
      <a href="#lab">Конструктор</a><span>кесте қалай құрылатынын қадамдап көреміз</span>
      <a href="#metody">Кодта</a><span>дайын бағдарламаларды оқып, іске қосамыз</span>
      <a href="#pesochnica">Құмсалғыш</a><span>өз кодымызды жазамыз</span>
      <a href="#kakoy">Қай өрнек?</a><span>жағдаятқа сай өрнек таңдаймыз</span>
      <a href="#oshibka">Қатені тап</a><span>топта қателерді түзетеміз</span>
    </div>
  </section>"""

SVOISTVA = """  <section id="svoistva">
    <div class="sec-head"><h2>Python-дағы ақиқат кестесі: анықтамалар</h2><p>Уақыты — шамамен 3 минут.</p></div>
    <div class="definition">
      <div class="def-label">Анықтама</div>
      <p class="def-text"><b>Ақиқат кестесі</b> (таблица истинности, truth table) — логикалық өрнектің айнымалылар мәндерінің барлық жиынында қабылдайтын мәндерінің кестесі. n айнымалы үшін 2<sup>n</sup> жиын (жол) болады. Python-да кестені кірістірілген <code>for</code> циклдерімен құрады: әр айнымалы <code>range(2)</code> арқылы 0 мен 1 мәндерін алады.</p>
    </div>
    <div class="def-grid">
      <div class="prop"><h3>Амалдар Python-да</h3><p>Логикалық амалдардың Python-дағы жазылуы. 1 мен 0 — <code>True</code> мен <code>False</code> сияқты.</p><pre>¬A     →  not A
A ∧ B  →  A and B
A ∨ B  →  A or B
1 / 0  →  True / False</pre></div>
      <div class="prop"><h3>Барлық жиынды аралау</h3><p>Әр айнымалыға бір цикл. Өрнек ең ішкі циклде есептеледі.</p><pre>for A in range(2):
    for B in range(2):
        F = A and not B
        print(A, B, int(F))</pre></div>
      <div class="prop"><h3>Жолдар саны</h3><p>Әр жаңа айнымалы жолдар санын екі есе арттырады.</p><pre>n = 1  →   2 жол
n = 2  →   4 жол
n = 3  →   8 жол
n = 4  →  16 жол</pre></div>
    </div>
    <h3 class="sub">Python-да ақиқат кестесін құру қадамдары</h3>
    <ol class="algo-steps">
      <li>Өрнектегі айнымалыларды санаңыз: n айнымалы → 2<sup>n</sup> жол және n кірістірілген цикл.</li>
      <li>Әр айнымалыға цикл жазыңыз: <code>for A in range(2):</code> — A алдымен 0, содан кейін 1 мәнін алады.</li>
      <li>Ең ішкі циклде өрнекті Python-да жазыңыз: ∧ → <code>and</code>, ∨ → <code>or</code>, ¬ → <code>not</code>. Күмәнді жерге жақша қойыңыз.</li>
      <li>Нәтижені <code>int(F)</code> арқылы 0 немесе 1 түріне келтіріп, <code>print(A, B, C, int(F))</code> деп шығарыңыз.</li>
      <li>Тақырып жолын циклдерге дейін бір рет шығарыңыз: <code>print("A B C F")</code>.</li>
      <li>Кестені талдау керек болса, санауыш немесе шарт қосыңыз: <code>if F: count += 1</code>.</li>
    </ol>
    <h3 class="sub">Амалдардың орындалу реті</h3>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Реті</th><th>Логикада</th><th>Python-да</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>жақша ( )</td><td class="hl"><code>( )</code></td></tr>
        <tr><td>2</td><td>терістеу ¬</td><td class="hl"><code>not</code></td></tr>
        <tr><td>3</td><td>ЖӘНЕ ∧</td><td class="hl"><code>and</code></td></tr>
        <tr><td>4</td><td>НЕМЕСЕ ∨</td><td class="hl"><code>or</code></td></tr>
        <tr><td>★</td><td>импликация A → B</td><td class="hl"><code>(not A) or B</code></td></tr>
        <tr><td>★</td><td>эквиваленция A ↔ B</td><td class="hl"><code>A == B</code></td></tr>
      </tbody>
    </table></div>
    <div class="definition">
      <div class="def-label">Назар аударыңыз</div>
      <p class="def-text">Python-да <code>and</code> мен <code>or</code> операндтың өзін қайтарады: <code>1 and 0</code> → <code>0</code>, ал <code>not 1</code> → <code>False</code>. Кестеде бәрі 0 мен 1 болып шығуы үшін <code>int(F)</code> қолданыңыз.</p>
    </div>
    <div class="terms">
      <div class="term"><div class="kz">ақиқат кестесі</div>таблица истинности<div class="en">truth table</div></div>
      <div class="term"><div class="kz">логикалық өрнек</div>логическое выражение<div class="en">logical expression</div></div>
      <div class="term"><div class="kz">айнымалы</div>переменная<div class="en">variable</div></div>
      <div class="term"><div class="kz">кірістірілген цикл</div>вложенный цикл<div class="en">nested loop</div></div>
      <div class="term"><div class="kz">мәндер жиыны</div>набор значений<div class="en">combination</div></div>
      <div class="term"><div class="kz">тең мәнді</div>равносильный<div class="en">equivalent</div></div>
    </div>
  </section>"""

LAB = """  <section id="lab">
    <div class="sec-head"><h2>Ақиқат кестесінің конструкторы</h2><p>Өрнекті Python тілінде жазыңыз: айнымалылар A, B, C, D (бас әріп), амалдар <code>and</code>, <code>or</code>, <code>not</code> және жақшалар. «Қадам» батырмасы циклдің келесі айналымын орындайды: кестеге жаңа жол қосылады, ал оң жақта оны құратын Python коды көрінеді. Уақыты — шамамен 2 минут.</p></div>
    <div class="viz">
      <div class="viz-row" role="group" aria-label="Мысалдар"><span class="viz-lbl">Мысалдар:</span>
        <button class="btn-ghost ex-b" type="button" data-ex="A and not B">A and not B</button>
        <button class="btn-ghost ex-b" type="button" data-ex="not (A or B)">not (A or B)</button>
        <button class="btn-ghost ex-b" type="button" data-ex="(A or B) and not C">(A or B) and not C</button>
        <button class="btn-ghost ex-b" type="button" data-ex="A or B and C">A or B and C</button>
        <button class="btn-ghost ex-b" type="button" data-ex="(A or B) and (C or D)">(A or B) and (C or D)</button></div>
      <div class="viz-row"><label class="viz-lbl" for="ttExpr">F =</label><input type="text" id="ttExpr" class="tt-expr" value="(A or B) and not C" spellcheck="false" autocomplete="off"></div>
      <div class="viz-row"><button class="btn" type="button" id="ttStep">Қадам</button><button class="btn alt" type="button" id="ttAuto">▶ Авто</button><button class="btn-ghost" type="button" id="ttAll">Бүкіл кесте</button><button class="btn-ghost" type="button" id="ttReset">Басынан</button></div>
      <div class="viz-stat"><span>Айнымалылар: <b id="ttVars">—</b></span><span>Жолдар: <b id="ttRows">0</b> / <b id="ttTotal">0</b></span><span>F = 1: <b id="ttOnes">0</b></span><span id="ttState"></span></div>
      <div class="tt-grid"><div class="tbl-wrap"><table class="tt-tbl" id="ttTbl"></table></div><pre class="tt-code" id="ttCode"></pre></div>
    </div>
  </section>"""

REFL = """    <div class="refl">
      <div class="card">
        <h3>Табыс баспалдағы</h3>
        <label class="check"><input type="checkbox" id="st1"><span>Логикалық өрнекті Python-да and, or, not арқылы жаза аламын</span></label>
        <label class="check"><input type="checkbox" id="st2"><span>Кірістірілген for циклдерімен 2 және 3 айнымалы өрнектің ақиқат кестесін шығарамын</span></label>
        <label class="check"><input type="checkbox" id="st3"><span>n айнымалыға неге 2ⁿ жол керек екенін түсіндіре аламын</span></label>
        <label class="check"><input type="checkbox" id="st4"><span>Кестені бағдарламамен талдаймын: ақиқат жиындарды санаймын, тең мәнділікті тексеремін</span></label>
      </div>
      <div class="card">
        <h3>Шығу билеті 3-2-1</h3>
        <label for="r3">Python-да ақиқат кестесін құрудың 3 қадамы</label><textarea id="r3"></textarea>
        <label for="r2">Кестені қолмен құрудан бағдарламаның 2 артықшылығы</label><textarea id="r2"></textarea>
        <label for="r1">Ақиқат кестесі қажет болатын өмірден 1 мысал</label><textarea id="r1"></textarea>
      </div>
    </div>"""
