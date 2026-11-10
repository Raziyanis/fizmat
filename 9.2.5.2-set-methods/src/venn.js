/* ---------- диаграммы Венна и карточка фактов для слайдов ---------- */
var VENN_N = 0;

function vennFmt(list) {
  var xs = list.slice().sort(function (x, y) {
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x) < String(y) ? -1 : (String(x) > String(y) ? 1 : 0);
  });
  if (!xs.length) return 'set()';
  return '{' + xs.map(function (x) { return typeof x === 'string' ? "'" + x + "'" : String(x); })
    .join(', ') + '}';
}

function vennEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Один рисунок: два круга, элементы в своих областях, результат закрашен. */
function vennBlock(v) {
  var A = v.a || [], B = v.b || [];
  var inA = function (x) { return A.indexOf(x) > -1; };
  var inB = function (x) { return B.indexOf(x) > -1; };
  var ao = A.filter(function (x) { return !inB(x); });
  var both = A.filter(inB);
  var bo = B.filter(function (x) { return !inA(x); });
  var na = v.na || 'a', nb = v.nb || 'b';
  var aIn = !ao.length && both.length && bo.length;   // a внутри b
  var bIn = !bo.length && both.length && ao.length;   // b внутри a
  var disj = !both.length;
  var id = 'vn' + (++VENN_N);

  var cA, cB, pAo, pBoth, pBo, labA, labB;
  if (aIn) {
    cB = [185, 120, 100]; cA = [150, 128, 50];
    pBoth = [150, 128]; pBo = [240, 120]; pAo = null;
    labA = [150, 70]; labB = [300, 32];
  } else if (bIn) {
    cA = [185, 120, 100]; cB = [220, 128, 50];
    pBoth = [220, 128]; pAo = [130, 120]; pBo = null;
    labB = [220, 70]; labA = [70, 32];
  } else if (disj) {
    cA = [100, 120, 78]; cB = [270, 120, 78];
    pAo = [100, 120]; pBo = [270, 120]; pBoth = null;
    labA = [100, 28]; labB = [270, 28];
  } else {
    cA = [140, 120, 88]; cB = [230, 120, 88];
    pAo = [100, 120]; pBoth = [185, 120]; pBo = [270, 120];
    labA = [95, 22]; labB = [275, 22];
  }
  var circ = function (c, extra) {
    return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" ' + (extra || '') + '/>';
  };
  var op = v.op || 'none';
  var shade = {
    union: ['ao', 'both', 'bo'], inter: ['both'], diff: ['ao'], diffBA: ['bo'],
    sym: ['ao', 'bo'], subset: ['both'], superset: ['both'], disjoint: [], none: []
  }[op] || [];

  var s = '<svg viewBox="0 0 370 240" role="img" aria-label="' + vennEsc(na + ' / ' + nb) + '">';
  s += '<defs>' +
       '<clipPath id="' + id + 'cb">' + circ(cB) + '</clipPath>' +
       '<mask id="' + id + 'ma"><rect width="370" height="240" fill="#fff"/>' + circ(cB, 'fill="#000"') + '</mask>' +
       '<mask id="' + id + 'mb"><rect width="370" height="240" fill="#fff"/>' + circ(cA, 'fill="#000"') + '</mask>' +
       '</defs>';
  if (shade.indexOf('ao') > -1) s += circ(cA, 'class="sh" mask="url(#' + id + 'ma)"');
  if (shade.indexOf('bo') > -1) s += circ(cB, 'class="sh" mask="url(#' + id + 'mb)"');
  if (shade.indexOf('both') > -1) s += circ(cA, 'class="sh" clip-path="url(#' + id + 'cb)"');
  s += circ(cA, 'class="ring"') + circ(cB, 'class="ring rb"');
  s += '<text class="lab" x="' + labA[0] + '" y="' + labA[1] + '" text-anchor="middle">' + vennEsc(na) + '</text>';
  s += '<text class="lab lb" x="' + labB[0] + '" y="' + labB[1] + '" text-anchor="middle">' + vennEsc(nb) + '</text>';
  var put = function (list, p) {
    if (!p || !list.length) return;
    var top = p[1] - (list.length - 1) * 9;
    list.forEach(function (x, i) {
      s += '<text class="el" x="' + p[0] + '" y="' + (top + i * 18 + 5) + '" text-anchor="middle">' +
           vennEsc(x) + '</text>';
    });
  };
  put(ao, pAo); put(both, pBoth); put(bo, pBo);
  s += '</svg>';

  var exprs = {
    union: na + ' | ' + nb, inter: na + ' & ' + nb, diff: na + ' - ' + nb, diffBA: nb + ' - ' + na,
    sym: na + ' ^ ' + nb, subset: na + ' <= ' + nb, superset: na + ' >= ' + nb,
    disjoint: na + '.isdisjoint(' + nb + ')'
  };
  var res = {
    union: vennFmt(ao.concat(both, bo)), inter: vennFmt(both), diff: vennFmt(ao), diffBA: vennFmt(bo),
    sym: vennFmt(ao.concat(bo)), subset: !ao.length ? 'True' : 'False',
    superset: !bo.length ? 'True' : 'False', disjoint: disj ? 'True' : 'False'
  };

  var wrap = el('div', 'venn');
  if (v.title) wrap.appendChild(el('div', 'venn-title', v.title));
  var pic = el('div', 'venn-pic');
  pic.innerHTML = s;
  wrap.appendChild(pic);
  var sets = el('div', 'venn-sets');
  sets.appendChild(el('div', null, na + ' = ' + vennFmt(A)));
  sets.appendChild(el('div', null, nb + ' = ' + vennFmt(B)));
  wrap.appendChild(sets);
  if (exprs[op]) {
    wrap.appendChild(el('div', 'venn-cap', (v.expr || exprs[op]) + '  →  ' + res[op]));
  }
  return wrap;
}

/** Таблица «как записать / что делает / меняет ли / что возвращает». */
function factsBlock(rows) {
  var box = el('div', 'facts');
  rows.forEach(function (r) {
    box.appendChild(el('div', 'fk', r[0]));
    box.appendChild(el('div', 'fv', r[1]));
  });
  return box;
}

/** Всё дополнительное, что может быть у слайда. */
function slideExtras(card, b) {
  if (b.facts) card.appendChild(factsBlock(b.facts));
  if (b.vennGrid) {
    var g = el('div', 'venn-grid');
    b.vennGrid.forEach(function (v) { g.appendChild(vennBlock(v)); });
    card.appendChild(g);
  }
  if (b.venn) card.appendChild(vennBlock(b.venn));
}

