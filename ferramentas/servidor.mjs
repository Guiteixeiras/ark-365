// Servidor local só pra testar no computador. Uso: node ferramentas/servidor.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = path.join(import.meta.dirname, '..', 'app'), PORTA = Number(process.env.PORT) || 4365;
const TIPO = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(RAIZ, p);
  if (!f.startsWith(RAIZ + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TIPO[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(PORTA, '127.0.0.1', () => console.log('http://localhost:' + PORTA));
