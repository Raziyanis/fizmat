// Generates: bg.png (white + faint Kazakh "қошқар мүйіз" ornament), logo.png (event logo)
const sharp = require("sharp");
const fs = require("fs");

// one ram-horn spiral branch starting at (0,0), curling to the right (dir=1) or left (dir=-1)
function horn(R, dir, turns = 1.55, steps = 60) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const th = Math.PI - t * turns * Math.PI;
    const r = R * (1 - 0.72 * t);
    const x = R + r * Math.cos(th);
    const y = -r * Math.sin(th);
    pts.push([dir * x, y]);
  }
  return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
}
// motif: stem + two horns up, two smaller horns down, diamond centre
function motif(R) {
  const up = horn(R, 1) + " " + horn(R, -1);
  const down = [horn(R * 0.7, 1), horn(R * 0.7, -1)].map(d => `<path d="${d}" transform="translate(0 ${R * 1.9}) scale(1 -1)"/>`).join("");
  return `<path d="${up}"/><path d="M0 0 L0 ${R * 1.9}"/>${down}` +
    `<path d="M0 ${R * 0.55} L${R * 0.28} ${R * 0.95} L0 ${R * 1.35} L${-R * 0.28} ${R * 0.95} Z"/>`;
}

// flag-style ornament column: chained symmetric ram-horn units (like the hoist band of the State Flag)
function flagUnit(R, g) {
  const top = horn(R, 1) + " " + horn(R, -1);
  const bot = `<path d="${horn(R, 1)} ${horn(R, -1)}" transform="translate(0 ${g}) scale(1 -1)"/>`;
  const dm = `<path d="M0 ${g * 0.5 - R * 0.32} L${R * 0.22} ${g * 0.5} L0 ${g * 0.5 + R * 0.32} L${-R * 0.22} ${g * 0.5} Z"/>`;
  return `<path d="${top}"/>${bot}<path d="M0 0 L0 ${g}"/>${dm}`;
}
function flagColumn(R, g, H, x) {
  const P = g + R * 2.15;
  let out = "";
  for (let y = -P; y < H + P; y += P) out += `<g transform="translate(${x} ${y})">${flagUnit(R, g)}</g>`;
  return out;
}
async function bg() {
  const W = 1920, H = 1080, R = 26, g = 44;
  const col = flagColumn(R, g, H, 72);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <g fill="none" stroke="#FEC50C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45">${col}</g>
  <g fill="none" stroke="#00AFCA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.06" transform="translate(${W} 0) scale(-1 1)">${flagColumn(R * 3, g * 3, H, 40 + R * 3)}</g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile("bg.png");
}

async function logo() {
  const W = 1400, H = 830, cx = 700, cy = 300;
  let rays = "";
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * 2 * Math.PI, w = Math.PI / 64;
    const p = (r, ang) => `${(cx + r * Math.cos(ang)).toFixed(1)} ${(cy + r * Math.sin(ang)).toFixed(1)}`;
    rays += `<path d="M${p(182, a - w)} L${p(250, a)} L${p(182, a + w)} Z"/>`;
  }
  const bigHorn = (dir) => `<g transform="translate(${cx + dir * 310} ${cy}) rotate(${-dir * 90})">${flagUnit(46, 74)}<g transform="translate(0 ${74 + 46 * 2.15})">${flagUnit(46, 74)}</g></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <g fill="none" stroke="#00AFCA" stroke-width="12" stroke-linejoin="round" stroke-linecap="round">${bigHorn(-1)}${bigHorn(1)}</g>
  <g fill="#FEC50C">${rays}</g>
  <circle cx="${cx}" cy="${cy}" r="170" fill="#FEC50C"/>
  <text x="${cx}" y="${cy + 66}" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="190" fill="#0B1F3A">35</text>
  <text x="${cx}" y="680" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="150" fill="#0B1F3A">ҚЫЗЫҚ TIMES</text>
  <rect x="250" y="715" width="900" height="86" rx="43" fill="#00AFCA"/>
  <text x="${cx}" y="772" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="44" letter-spacing="4" fill="#FFFFFF">SPECIAL EDITION · 1991–2026</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile("logo.png");
}

(async () => { await bg(); await logo(); console.log("ok"); })();
