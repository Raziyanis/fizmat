// Backgrounds + logo built from the user's reference ornament (ref/band.png, ref/motif.png)
const sharp = require("sharp");
const fs = require("fs");
const uri = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
const BAND = uri("ref/band.png"), MOTIF = uri("ref/motif.png");
const W = 1920, H = 1080;
const bandW = 88, bandH = Math.round(1371 * bandW / 173);
function bandCol(x) {
  let s = "";
  for (let y = 0; y < H; y += bandH) s += `<image href="${BAND}" x="${x}" y="${y}" width="${bandW}" height="${bandH}"/>`;
  return s;
}
const sky = `<defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#22C3DB"/><stop offset="1" stop-color="#00A3BE"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`;

async function content() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">${sky}
  ${bandCol(16)}
  <rect x="139" y="34" width="1770" height="1018" rx="34" fill="#0B1F3A" opacity="0.18"/>
  <rect x="135" y="28" width="1770" height="1018" rx="34" fill="#FFFFFF"/>
  <image href="${MOTIF}" x="1560" y="700" width="320" height="320" opacity="0.10"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile("bg_content.png");
}
async function full() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${sky}
  ${bandCol(16)}<g transform="translate(${W} 0) scale(-1 1)">${bandCol(16)}</g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile("bg_full.png");
}
async function logo() {
  const LW = 1400, LH = 860, cx = 700, cy = 300;
  let rays = "";
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * 2 * Math.PI, w = Math.PI / 64;
    const p = (r, ang) => `${(cx + r * Math.cos(ang)).toFixed(1)} ${(cy + r * Math.sin(ang)).toFixed(1)}`;
    rays += `<path d="M${p(182, a - w)} L${p(250, a)} L${p(182, a + w)} Z"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LW}" height="${LH}">
  <image href="${MOTIF}" x="${cx - 560}" y="${cy - 150}" width="300" height="300"/>
  <image href="${MOTIF}" x="${cx + 260}" y="${cy - 150}" width="300" height="300"/>
  <g fill="#FEC50C">${rays}</g>
  <circle cx="${cx}" cy="${cy}" r="170" fill="#FEC50C"/>
  <text x="${cx}" y="${cy + 66}" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="190" fill="#0B1F3A">35</text>
  <text x="${cx}" y="690" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="150" fill="#0B1F3A">ҚЫЗЫҚ TIMES</text>
  <rect x="190" y="730" width="1020" height="92" rx="46" fill="#0B1F3A"/>
  <text x="${cx}" y="792" text-anchor="middle" font-family="Liberation Sans, Arial" font-weight="bold" font-size="46" letter-spacing="3" fill="#FEC50C">ТӘУЕЛСІЗДІККЕ 35 ЖЫЛ · 1991–2026</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile("logo.png");
}
(async () => { await content(); await full(); await logo(); console.log("ok"); })();
