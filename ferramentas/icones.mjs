// Desenha os ícones do app (sem dependências). Uso: node ferramentas/icones.mjs
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(import.meta.dirname, '..', 'app', 'icones');
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const ROXO = hex('#6324d6');
// o "ano em pixels": da nota mais baixa até o laranja de hoje
const CORES = ['#3a1580', '#a47bff', '#d2c8e2', '#a47bff', '#d2c8e2', '#ffb25c', '#d2c8e2', '#ffb25c', '#ff6a1a'].map(hex);
const dentro = (x, y, x0, y0, l, r) => {
  const dx = Math.max(x0 + r - x, 0, x - (x0 + l - r)), dy = Math.max(y0 + r - y, 0, y - (y0 + l - r));
  return x >= x0 && x <= x0 + l && y >= y0 && y <= y0 + l && dx * dx + dy * dy <= r * r;
};
function cor(x, y, o) { // x,y de 0 a 1; devolve [r,g,b,a]
  const m = o.margem, vao = 0.045 * (1 - 2 * m) / 0.6, l = (1 - 2 * m - 2 * vao) / 3;
  for (let i = 0; i < 9; i++) {
    const x0 = m + (i % 3) * (l + vao), y0 = m + Math.floor(i / 3) * (l + vao);
    if (dentro(x, y, x0, y0, l, l * 0.24)) {
      if (i === 8) { const cx = x0 + l / 2, cy = y0 + l / 2; if (Math.hypot(x - cx, y - cy) < l * 0.17) return o.mono ? [0, 0, 0, 0] : [255, 255, 255, 1]; }
      return o.mono ? [255, 255, 255, 1] : [...CORES[i], 1];
    }
  }
  if (o.mono || o.transparente) return [0, 0, 0, 0];
  return o.raio === 0 || dentro(x, y, 0, 0, 1, o.raio) ? [...ROXO, 1] : [0, 0, 0, 0];
}
const T = [...Array(256)].map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
const bloco = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4, 'latin1'); d.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
function png(nome, n, o, dir = DIR) {
  const A = 4, raw = Buffer.alloc((n * 4 + 1) * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let i = 0; i < A; i++) for (let j = 0; j < A; j++) { const c = cor((x + (i + .5) / A) / n, (y + (j + .5) / A) / n, o); r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3]; }
    const k = y * (n * 4 + 1) + 1 + x * 4;
    raw[k] = a ? r / a : 0; raw[k + 1] = a ? g / a : 0; raw[k + 2] = a ? b / a : 0; raw[k + 3] = a / (A * A) * 255;
  }
  const h = Buffer.alloc(13); h.writeUInt32BE(n, 0); h.writeUInt32BE(n, 4); h[8] = 8; h[9] = 6;
  fs.writeFileSync(path.join(dir, nome), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', h), bloco('IDAT', zlib.deflateSync(raw, { level: 9 })), bloco('IEND', Buffer.alloc(0))]));
}
png('icone-192.png', 192, { margem: .2, raio: .22 });
png('icone-512.png', 512, { margem: .2, raio: .22 });
png('icone-mascara-512.png', 512, { margem: .24, raio: 0 });
png('apple-touch-icon.png', 180, { margem: .2, raio: 0 });
png('icone-32.png', 32, { margem: .12, raio: .22 });
png('selo-96.png', 96, { margem: .08, mono: true });
// camadas do ícone do aplicativo Android (108dp, com a arte dentro da área segura)
const RES = path.join(import.meta.dirname, '..', 'android', 'res', 'drawable-xxxhdpi');
fs.mkdirSync(RES, { recursive: true });
png('frente.png', 432, { margem: .31, transparente: true }, RES);
png('mono.png', 432, { margem: .31, mono: true }, RES);
png('selo.png', 96, { margem: .08, mono: true }, RES);
console.log(fs.readdirSync(DIR).concat(fs.readdirSync(RES)).join('\n'));
