/* O que antes vinha do Claude (db, assets, dictation, sample), agora feito no próprio aparelho. */
const plat = (() => {
  'use strict';

  /* ---------- dados (era claude.use("db")) ---------- */
  const canal = 'BroadcastChannel' in self ? new BroadcastChannel('desafio365') : null;
  const avisar = () => { if (canal) canal.postMessage('docs'); };
  const traduz = e => { throw e && e.name === 'QuotaExceededError' ? { code: 'quota_exceeded' } : e; };
  const gravarDocs = pares => banco.gravar('docs', pares).then(avisar, traduz);
  const colecao = {
    doc: k => ({ set: v => gravarDocs({ [k]: v }), delete: () => gravarDocs({ [k]: null }) }),
    gravar: gravarDocs,
    // chama na abertura e de novo quando outra aba ou janela do app salvar alguma coisa
    onSnapshot(cb, erro) {
      const ler = () => banco.todos('docs').then(cb).catch(erro);
      if (canal) canal.onmessage = ler;
      return ler();
    },
  };
  const guardarDeVez = () => { try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch (e) {} };

  /* ---------- ajustes só deste aparelho ---------- */
  const conf = {};
  const lerConf = async () => Object.assign(conf, await banco.todos('conf'));
  const setConf = pares => { Object.assign(conf, pares); return banco.gravar('conf', pares); };

  /* ---------- fotos (era claude.use("assets")) ---------- */
  const VAZIA = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const FALTA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#8a7fa3"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" opacity=".9"><rect x="32" y="30" width="56" height="42" rx="6"/><path d="M32 64l16-14 12 10 10-8 18 14"/></g><text x="60" y="92" font-family="sans-serif" font-size="11" fill="#fff" text-anchor="middle">foto não está</text><text x="60" y="105" font-family="sans-serif" font-size="11" fill="#fff" text-anchor="middle">neste aparelho</text></svg>');
  const urls = new Map(); // id -> endereço da miniatura já carregada
  const pegando = new Map();
  function mini(id) {
    if (urls.has(id)) return Promise.resolve(urls.get(id));
    if (!pegando.has(id)) pegando.set(id, banco.ler('fotos', id).then(f => {
      const u = f ? URL.createObjectURL(f.mini || f.cheia) : FALTA;
      urls.set(id, u); pegando.delete(id); return u;
    }, () => { pegando.delete(id); return FALTA; }));
    return pegando.get(id);
  }
  const esquecer = id => { const u = urls.get(id); if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); urls.delete(id); };
  // As telas escrevem <img data-foto="id">; aqui a miniatura entra quando a imagem chega perto da tela.
  const vista = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) { const i = e.target; vista.unobserve(i); mini(i.dataset.foto).then(u => { i.src = u; }); }
  }, { rootMargin: '400px' });
  const procurar = n => {
    if (n.nodeType !== 1) return;
    if (n.matches('img[data-foto]')) vista.observe(n);
    else n.querySelectorAll('img[data-foto]').forEach(i => vista.observe(i));
  };
  new MutationObserver(ms => { for (const m of ms) m.addedNodes.forEach(procurar); }).observe(document.documentElement, { childList: true, subtree: true });

  async function decodificar(f) {
    try { return await createImageBitmap(f); } catch (e) {}
    const u = URL.createObjectURL(f);
    try { const i = new Image(); i.src = u; await i.decode(); return i; }
    catch (e) { throw { code: 'unsupported_type' }; }
    finally { URL.revokeObjectURL(u); }
  }
  function reduzir(img, max, q) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, sc = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc));
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok, erro) => c.toBlob(b => b ? ok(b) : erro({ code: 'unsupported_type' }), 'image/jpeg', q));
  }
  const fotos = {
    vazia: VAZIA,
    pronta: id => urls.get(id),
    // reduz pra no máximo 1600px, faz a miniatura e guarda as duas (recriar a imagem também tira o local gravado na foto)
    // doBackup: a foto já saiu daqui reduzida, então guarda igual, sem perder qualidade
    async guardar(arquivo, id, doBackup) {
      id = id || 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const img = await decodificar(arquivo);
      const jaPronta = doBackup && Math.max(img.width, img.height) <= 1600;
      const cheia = jaPronta ? new Blob([arquivo], { type: 'image/jpeg' }) : await reduzir(img, 1600, .85), pequena = await reduzir(img, 480, .8);
      if (img.close) img.close();
      await banco.gravar('fotos', { [id]: { cheia, mini: pequena } }).catch(traduz);
      esquecer(id);
      return id;
    },
    async cheia(id) { const f = await banco.ler('fotos', id); return f ? URL.createObjectURL(f.cheia) : FALTA; },
    async blob(id) { const f = await banco.ler('fotos', id); return f ? f.cheia : null; },
    // apagar em dois tempos: marca agora (dá pra desfazer) e apaga de verdade depois, mesmo se o app fechar antes
    marcar: (id, sim) => { const l = new Set(conf.lixo || []); sim ? l.add(id) : l.delete(id); return setConf({ lixo: [...l] }); },
    async limpar(emUso) {
      const l = conf.lixo || []; if (!l.length) return;
      await banco.gravar('fotos', Object.fromEntries(l.filter(id => !emUso(id)).map(id => [id, null])));
      l.forEach(esquecer);
      await setConf({ lixo: [] });
    },
  };

  /* ---------- voz (era claude.use("dictation")) ---------- */
  function criarDitado() {
    if (nativo) return nativo.ditado();
    const SR = self.SpeechRecognition || self.webkitSpeechRecognition;
    if (!SR) return null;
    const cb = { partial: [], final: [], state: [] }, emitir = (t, v) => cb[t].forEach(f => f(v));
    let rec = null, texto = '', querendo = false, local = false, falha = '';
    // alguns navegadores novos transcrevem no próprio aparelho: nesse caso, nada sai daqui
    try { if (SR.available) SR.available({ langs: ['pt-BR'], processLocally: true }).then(r => { local = r === 'available'; }).catch(() => {}); } catch (e) {}
    const fechar = () => { const t = texto.trim(); texto = ''; if (t) emitir('final', { text: t }); return !!t; };
    function ouvir(primeira) {
      return new Promise((ok, erro) => {
        const r = rec = new SR();
        r.lang = 'pt-BR'; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
        if (local) try { r.processLocally = true; } catch (e) {}
        r.onstart = () => { emitir('state', { state: 'listening' }); ok(); };
        // junta tudo da fala atual; só vira texto final quando ela termina (o Chrome do Android repete parciais)
        r.onresult = ev => { if (rec !== r) return; texto = [...ev.results].map(x => x[0].transcript).join(' ').replace(/\s+/g, ' '); emitir('partial', { text: texto.trim() }); };
        r.onerror = ev => {
          if (rec !== r) return;
          querendo = false;
          const c = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'not_granted' : ev.error;
          falha = c;
          if (primeira) erro({ code: c });
        };
        r.onend = () => {
          if (rec !== r) return;
          const falou = fechar();
          if (querendo && falou) { ouvir(false).catch(() => {}); return; } // pausa na fala: continua ouvindo até o silêncio
          rec = null; querendo = false; const f = falha; falha = ''; emitir('state', { state: 'stopped', code: f });
        };
        try { r.start(); } catch (e) { rec = null; querendo = false; erro({ code: 'busy' }); emitir('state', { state: 'stopped', code: 'busy' }); }
      });
    }
    return {
      get local() { return local; },
      onPartial: f => cb.partial.push(f), onFinal: f => cb.final.push(f), onState: f => cb.state.push(f),
      start() { querendo = true; texto = falha = ''; return ouvir(true); },
      // ja=true encerra na hora com o que tem (trocou de campo); senão espera o navegador terminar a última palavra
      stop(ja) {
        querendo = false; const r = rec; if (!r) return Promise.resolve();
        if (ja) { rec = null; fechar(); emitir('state', { state: 'stopped' }); try { r.abort(); } catch (e) {} }
        else try { r.stop(); } catch (e) {}
        return Promise.resolve();
      },
    };
  }

  /* ---------- IA (era claude.use("sample")) ---------- */
  const IA_MODELOS = [['claude-opus-5-5', 'Claude Opus 5.5 (melhor leitura)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (mais barato)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (o mais barato)']];
  const lista = { type: 'array', items: { type: 'string' } };
  const obj = (...ks) => ({ type: 'object', additionalProperties: false, required: ks, properties: Object.fromEntries(ks.map(k => [k, { type: 'string' }])) });
  const FORMATO = {
    type: 'object', additionalProperties: false,
    required: ['resumo', 'notei', 'funcionando', 'porques', 'sugestoes', 'metas', 'cuidado'],
    properties: { resumo: { type: 'string' }, notei: lista, funcionando: lista, porques: lista, sugestoes: { type: 'array', items: obj('titulo', 'passo') }, metas: { type: 'array', items: obj('meta', 'comentario') }, cuidado: { anyOf: [{ type: 'string' }, { type: 'null' }] } },
  };
  async function iaJSON(prompt) {
    const modelo = conf.iaModel || IA_MODELOS[0][0], cab = {
      'content-type': 'application/json', 'x-api-key': conf.iaKey, 'anthropic-version': '2026-10-21',
      'anthropic-dangerous-direct-browser-access': 'true', // a chave é da própria pessoa e fica só neste aparelho
    };
    const corpo = { model: modelo, max_tokens: 32000, stream: true, messages: [{ role: 'user', content: prompt }], output_config: { effort: 'medium', format: { type: 'json_schema', schema: FORMATO } } };
    // se um filtro de segurança recusar sem motivo, a API tenta outro modelo na mesma chamada (o Haiku não tem isso)
    if (!/haiku/.test(modelo)) { cab['anthropic-beta'] = 'server-side-fallback-2026-07-01'; corpo.fallbacks = 'default'; }
    let r;
    try { r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: cab, body: JSON.stringify(corpo), referrerPolicy: 'no-referrer', credentials: 'omit' }); }
    catch (e) { throw { code: 'offline' }; }
    if (!r.ok) {
      let m = ''; try { m = (await r.json()).error.message; } catch (e) {}
      throw { code: { 400: 'invalid', 401: 'key', 402: 'billing', 403: 'forbidden', 404: 'model', 413: 'too_large', 429: 'rate_limited', 529: 'busy' }[r.status] || 'api', message: m };
    }
    let txt = '', depois = '', fim = '', resto = '';
    const leitor = r.body.getReader(), dec = new TextDecoder();
    const linha = l => {
      if (!l.startsWith('data:')) return;
      const ev = JSON.parse(l.slice(5));
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') { txt += ev.delta.text; depois += ev.delta.text; }
      else if (ev.type === 'content_block_start' && ev.content_block.type === 'fallback') depois = ''; // outro modelo assumiu no meio: costuma continuar o texto, às vezes recomeça
      else if (ev.type === 'message_delta' && ev.delta.stop_reason) fim = ev.delta.stop_reason;
      else if (ev.type === 'error') throw { code: ev.error && ev.error.type === 'overloaded_error' ? 'busy' : 'api' };
    };
    try {
      for (;;) {
        const { done, value } = await leitor.read(); if (done) break;
        resto += dec.decode(value, { stream: true });
        const ls = resto.split('\n'); resto = ls.pop(); ls.forEach(linha);
      }
      if (resto) linha(resto);
    } catch (e) { throw e && e.code && typeof e.code === 'string' ? e : { code: 'offline' }; }
    if (fim === 'refusal') throw { code: 'refusal' };
    if (fim !== 'end_turn') throw { code: fim === 'max_tokens' ? 'too_long' : 'offline' };
    for (const t of [txt, depois]) try { return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch (e) {}
    throw { code: 'bad' };
  }

  /* ---------- zip sem compressão (backup com fotos) ---------- */
  const T = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc32 = b => { let c = ~0; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
  async function zipar(itens, progresso) {
    const enc = new TextEncoder(), partes = [], centro = [], n = new Date();
    const hora = n.getHours() << 11 | n.getMinutes() << 5 | n.getSeconds() >> 1, dia = (n.getFullYear() - 1980) << 9 | (n.getMonth() + 1) << 5 | n.getDate();
    let pos = 0, feitos = 0;
    for (const it of itens) {
      const blob = it.blob || await it.pegar(); feitos++;
      if (!blob) continue;
      const nome = enc.encode(it.nome), crc = crc32(new Uint8Array(await blob.arrayBuffer()));
      const l = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, hora, 2], [12, dia, 2], [14, crc, 4], [18, blob.size, 4], [22, blob.size, 4], [26, nome.length, 2], [28, 0, 2]].forEach(([o, v, t]) => t === 4 ? l.setUint32(o, v, true) : l.setUint16(o, v, true));
      const c = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, hora, 2], [14, dia, 2], [16, crc, 4], [20, blob.size, 4], [24, blob.size, 4], [28, nome.length, 2], [42, pos, 4]].forEach(([o, v, t]) => t === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
      partes.push(l.buffer, nome, blob); centro.push(c.buffer, nome); pos += 30 + nome.length + blob.size;
      if (progresso) progresso(feitos, itens.length);
    }
    const tam = centro.reduce((s, x) => s + x.byteLength, 0), q = centro.length / 2, f = new DataView(new ArrayBuffer(22));
    f.setUint32(0, 0x06054b50, true); f.setUint16(8, q, true); f.setUint16(10, q, true); f.setUint32(12, tam, true); f.setUint32(16, pos, true);
    return new Blob([...partes, ...centro, f.buffer], { type: 'application/zip' });
  }
  async function deszipar(arq) {
    const v = async (a, b) => new DataView(await arq.slice(a, b).arrayBuffer()), ini = Math.max(0, arq.size - 65557), f = await v(ini, arq.size);
    let e = f.byteLength - 22; while (e >= 0 && f.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw { code: 'bad_zip' };
    const n = f.getUint16(e + 10, true), tam = f.getUint32(e + 12, true), pos = f.getUint32(e + 16, true), c = await v(pos, pos + tam), dec = new TextDecoder(), out = new Map();
    for (let i = 0, p = 0; i < n; i++) {
      const met = c.getUint16(p + 10, true), t = c.getUint32(p + 20, true), nl = c.getUint16(p + 28, true), xl = c.getUint16(p + 30, true), kl = c.getUint16(p + 32, true), loc = c.getUint32(p + 42, true);
      const nome = dec.decode(new Uint8Array(c.buffer, p + 46, nl)).split('\\').join('/'); p += 46 + nl + xl + kl;
      const l = await v(loc, loc + 30), a = loc + 30 + l.getUint16(26, true) + l.getUint16(28, true), bruto = arq.slice(a, a + t);
      if (met === 0) out.set(nome, bruto);
      else if (met === 8 && 'DecompressionStream' in self) out.set(nome, await new Response(bruto.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob());
    }
    return out;
  }
  async function baixar(blob, nome) {
    if (nativo) return nativo.salvar(blob, nome);
    const f = new File([blob], nome, { type: blob.type }), toque = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (toque && navigator.canShare && navigator.canShare({ files: [f] })) try { await navigator.share({ files: [f] }); return true; } catch (e) { if (e.name === 'AbortError') return false; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    return true;
  }

  /* ---------- senha do backup: AES-GCM em pedaços, chave tirada da senha (PBKDF2) ---------- */
  const MARCA = 'D365ENC1', PEDACO = 4 * 1024 * 1024, CAB = 8 + 16 + 8;
  async function chaveDe(senha, sal) {
    const m = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: 600000 }, m, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  const param = (base, i, fim) => { const iv = new Uint8Array(12); iv.set(base); new DataView(iv.buffer).setUint32(8, i); return { name: 'AES-GCM', iv, additionalData: new Uint8Array([fim ? 1 : 0]) }; };
  async function trancar(blob, senha) {
    const sal = crypto.getRandomValues(new Uint8Array(16)), base = crypto.getRandomValues(new Uint8Array(8)), k = await chaveDe(senha, sal), n = Math.max(1, Math.ceil(blob.size / PEDACO));
    const partes = [new TextEncoder().encode(MARCA), sal, base];
    for (let i = 0; i < n; i++) partes.push(new Blob([await crypto.subtle.encrypt(param(base, i, i === n - 1), k, await blob.slice(i * PEDACO, (i + 1) * PEDACO).arrayBuffer())]));
    return new Blob(partes, { type: 'application/octet-stream' });
  }
  const temSenha = async arq => new TextDecoder().decode(await arq.slice(0, 8).arrayBuffer()) === MARCA;
  async function destrancar(arq, senha) {
    const c = new Uint8Array(await arq.slice(0, CAB).arrayBuffer()), base = c.slice(24, 32), k = await chaveDe(senha, c.slice(8, 24)), t = PEDACO + 16, n = Math.max(1, Math.ceil((arq.size - CAB) / t)), partes = [];
    try { for (let i = 0; i < n; i++) partes.push(new Blob([await crypto.subtle.decrypt(param(base, i, i === n - 1), k, await arq.slice(CAB + i * t, CAB + (i + 1) * t).arrayBuffer())])); }
    catch (e) { throw { code: 'senha' }; }
    return new Blob(partes);
  }

  /* ---------- lembrete ---------- */
  function ics(inicio, fim, h, url) {
    const n = s => s.replace(/[-:]/g, ''), agora = new Date().toISOString().replace(/[-:]|\.\d+/g, '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Desafio 365//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:lembrete-diario@desafio365', 'DTSTAMP:' + agora,
      'DTSTART:' + n(inicio) + 'T' + n(h) + '00', 'DURATION:PT5M', 'RRULE:FREQ=DAILY;UNTIL=' + n(fim) + 'T235959', 'SUMMARY:Desafio 365: registrar o dia', 'URL:' + url, 'DESCRIPTION:Abrir: ' + url, 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Desafio 365: como foi hoje?', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  }
  async function ligarSegundoPlano(sim) {
    try {
      const reg = await navigator.serviceWorker.ready; if (!reg.periodicSync) return false;
      if (!sim) { await reg.periodicSync.unregister('lembrete'); return false; }
      await reg.periodicSync.register('lembrete', { minInterval: 60 * 60 * 1000 }); return true;
    } catch (e) { return false; }
  }

  return { colecao, guardarDeVez, conf, lerConf, setConf, fotos, criarDitado, IA_MODELOS, iaJSON, zipar, deszipar, trancar, temSenha, destrancar, baixar, ics, ligarSegundoPlano };
})();
