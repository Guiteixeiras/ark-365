/* Service worker: deixa o app abrir sem internet e mostra o lembrete.
   MUDOU ALGUM ARQUIVO DO APP? Troque a VERSAO, senão o celular continua com a versão antiga. */
importScripts('banco.js');
const VERSAO = '2026-11-25.4', CACHE = 'desafio365-' + VERSAO;
const ARQUIVOS = ['./', 'estilo.css', 'banco.js', 'nativo.js', 'plataforma.js', 'app.js', 'manifest.webmanifest', 'fontes/archivo.woff2',
  'icones/icone-32.png', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/icone-mascara-512.png', 'icones/apple-touch-icon.png', 'icones/selo-96.png'];

self.addEventListener('install', ev => ev.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())));

self.addEventListener('activate', ev => ev.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('desafio365-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

// Só cuida dos arquivos do próprio app. A chamada de IA passa direto e nunca é guardada.
self.addEventListener('fetch', ev => {
  const r = ev.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  ev.respondWith(caches.open(CACHE).then(c => c.match(r.mode === 'navigate' ? './' : r, { ignoreSearch: true })).then(x => x || fetch(r)));
});

async function lembrar() {
  const hoje = await lembrete.hora();
  if (!hoje) return;
  await self.registration.showNotification(lembrete.titulo, lembrete.opcoes);
  await lembrete.avisado(hoje);
}
self.addEventListener('periodicsync', ev => { if (ev.tag === 'lembrete') ev.waitUntil(lembrar()); });

self.addEventListener('notificationclick', ev => {
  ev.notification.close();
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    const j = l[0];
    if (j) { j.postMessage('registrar'); return j.focus(); }
    return self.clients.openWindow('./#diario');
  }));
});
