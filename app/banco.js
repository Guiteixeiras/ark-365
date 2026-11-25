/* Banco local: tudo fica no IndexedDB deste aparelho.
   Carregado pela página e também pelo service worker (que precisa ler o lembrete).
   Lojas:
     docs  -> um registro por chave: d2026-11-24 (cada dia), settings, goals, ai, routines, reviews, letters, exmeta
     fotos -> id: {cheia: Blob (até 1600px), mini: Blob (até 480px)}
     conf  -> coisas só deste aparelho, fora do backup: chave da IA, lembrete, aceite da voz */
self.banco = (() => {
  const NOME = 'desafio365', VERSAO = 1, LOJAS = ['docs', 'fotos', 'conf'];
  let aberto = null;
  const abrir = () => aberto || (aberto = new Promise((ok, erro) => {
    const r = indexedDB.open(NOME, VERSAO);
    r.onupgradeneeded = () => { for (const l of LOJAS) if (!r.result.objectStoreNames.contains(l)) r.result.createObjectStore(l); };
    r.onsuccess = () => {
      const db = r.result;
      db.onversionchange = () => { db.close(); aberto = null; };
      db.onclose = () => { aberto = null; };
      ok(db);
    };
    r.onerror = () => { aberto = null; erro(r.error); };
  }));
  // O iPhone às vezes derruba a conexão quando o app fica em segundo plano: reabre e tenta de novo uma vez.
  async function tx(loja, modo, fn, denovo = true) {
    const db = await abrir();
    let t;
    try { t = db.transaction(loja, modo); }
    catch (e) { if (!denovo) throw e; aberto = null; return tx(loja, modo, fn, false); }
    return new Promise((ok, erro) => {
      const r = fn(t.objectStore(loja));
      if (modo === 'readwrite' && t.commit) t.commit(); // fecha já: assim vale mesmo se o app estiver sendo fechado agora
      t.oncomplete = () => ok(typeof r === 'function' ? r() : r && r.result);
      t.onerror = t.onabort = () => erro(t.error || new Error('Falha no banco'));
    });
  }
  return {
    ler: (loja, k) => tx(loja, 'readonly', s => s.get(k)),
    chaves: loja => tx(loja, 'readonly', s => s.getAllKeys()),
    todos: loja => tx(loja, 'readonly', s => {
      const k = s.getAllKeys(), v = s.getAll();
      return () => Object.fromEntries(k.result.map((x, i) => [x, v.result[i]]));
    }),
    // pares: {chave: valor}. Valor null ou undefined apaga. Tudo numa transação só.
    gravar: (loja, pares) => tx(loja, 'readwrite', s => {
      for (const k in pares) pares[k] == null ? s.delete(k) : s.put(pares[k], k);
    }),
  };
})();

/* Lembrete diário: regra única, usada com o app aberto (app.js) e com ele fechado (sw.js). */
self.lembrete = (() => {
  const p = n => String(n).padStart(2, '0');
  return {
    titulo: 'Como foi hoje?',
    opcoes: { body: 'Um minuto pra pintar o quadradinho do dia.', tag: 'lembrete', icon: 'icones/icone-192.png', badge: 'icones/selo-96.png', lang: 'pt-BR' },
    // devolve a data de hoje se for hora de lembrar, senão null
    async hora() {
      const c = await banco.ler('conf', 'lembrete');
      if (!c || !c.on) return null;
      const n = new Date(), hoje = n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate());
      if (p(n.getHours()) + ':' + p(n.getMinutes()) < c.h) return null;
      if (await banco.ler('conf', 'avisado') === hoje) return null;
      const s = await banco.ler('docs', 'settings');
      if (!s || !s.start || hoje < s.start) return null;
      const fim = new Date(s.start + 'T12:00'); fim.setDate(fim.getDate() + 364);
      if (n > fim && n.toDateString() !== fim.toDateString()) return null;
      const d = await banco.ler('docs', 'd' + hoje);
      return d && d.r ? null : hoje;
    },
    avisado: hoje => banco.gravar('conf', { avisado: hoje }),
  };
})();
