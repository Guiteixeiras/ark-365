/* Ponte com o aplicativo Android. No navegador comum window.Nativo não existe e nativo fica null. */
const nativo = (() => {
  'use strict';
  const N = window.Nativo;
  if (!N) return null;
  const ouvintes = {};
  window.nativoEvento = (tipo, dados) => (ouvintes[tipo] || []).slice().forEach(f => f(dados || {}));
  const em = (tipo, f) => { (ouvintes[tipo] = ouvintes[tipo] || []).push(f); };
  const uma = tipo => new Promise(ok => { const f = d => { ouvintes[tipo] = ouvintes[tipo].filter(x => x !== f); ok(d); }; em(tipo, f); });
  const ler = t => { try { return JSON.parse(t); } catch (e) { return null; } };
  const b64 = blob => new Promise((ok, erro) => { const r = new FileReader(); r.onload = () => ok(r.result.slice(r.result.indexOf(',') + 1)); r.onerror = () => erro(r.error); r.readAsDataURL(blob); });
  const PARTE = 768 * 1024;
  let diaEnviado = '';

  function ditado() {
    const estado = N.vozEstado();
    if (estado === 'nao') return null;
    const cb = { partial: [], final: [], state: [] }, emitir = (t, v) => cb[t].forEach(f => f(v));
    let id = 0, ativo = false, querendo = false, texto = '', abriu = null;
    const CODIGO = { 9: 'not_granted', 1: 'network', 2: 'network', 4: 'network', 10: 'network', 11: 'network', 6: 'no-speech', 7: 'no-speech', 12: 'language-not-supported', 13: 'language-not-supported' };
    const iniciar = () => { id++; texto = ''; N.vozIniciar(id, true); };
    const parar = code => { ativo = querendo = false; if (abriu) { const a = abriu; abriu = null; a.erro({ code: code || 'aborted' }); } emitir('state', { state: 'stopped', code: code || '' }); };
    em('voz', d => {
      if (d.id !== id || !ativo) return;
      if (d.t === 'inicio') { if (abriu) { const a = abriu; abriu = null; a.ok(); } emitir('state', { state: 'listening' }); }
      else if (d.t === 'parcial') { texto = d.x; emitir('partial', { text: texto }); }
      else if (d.t === 'fim') {
        const t = (d.x || texto).trim(); texto = '';
        if (t) emitir('final', { text: t });
        if (querendo && t) iniciar(); else parar(''); // pausa na fala: continua até o silêncio
      } else if (d.t === 'erro') {
        const t = texto.trim(), c = CODIGO[d.c] || 'audio'; texto = '';
        if (t) emitir('final', { text: t });
        parar(c === 'no-speech' ? '' : c);
      }
    });
    return {
      local: estado === 'local',
      onPartial: f => cb.partial.push(f), onFinal: f => cb.final.push(f), onState: f => cb.state.push(f),
      start() { ativo = querendo = true; return new Promise((ok, erro) => { abriu = { ok, erro }; iniciar(); }); },
      stop(ja) {
        querendo = false; if (!ativo) return Promise.resolve();
        if (ja) { const t = texto.trim(); texto = ''; id++; if (t) emitir('final', { text: t }); N.vozCancelar(); parar(''); }
        else N.vozParar();
        return Promise.resolve();
      },
    };
  }

  return {
    em,
    // lembrete no alarme do celular
    lembrete(on, h) { const r = uma('lembrete'); N.lembrete(!!on, h); return r; },
    lembreteEstado: () => ler(N.lembreteEstado()) || {},
    dia(inicio, fim, nota) { const c = [inicio, fim, nota].join('|'); if (c === diaEnviado) return; diaEnviado = c; N.dia(inicio, fim, nota); },
    abrirAjustes: q => N.abrirAjustes(q),
    // trava
    trava: on => N.trava(!!on),
    travaEstado: () => ler(N.travaEstado()) || {},
    telaLigada: sim => N.telaLigada(!!sim),
    // área de transferência
    copiar: t => N.copiar(t), colar: () => N.colar(), limparCopia: () => N.limparCopia(),
    // salva um arquivo onde a pessoa escolher; devolve true se salvou
    async salvar(blob, nome) {
      if (!N.salvarInicio(nome, blob.type || 'application/octet-stream')) throw new Error('salvar');
      for (let p = 0; p < blob.size; p += PARTE) if (!N.salvarParte(await b64(blob.slice(p, p + PARTE)))) throw new Error('salvar');
      const r = uma('salvo'); N.salvarFim();
      const d = await r;
      if (!d.ok && !d.cancelou) throw new Error('salvar');
      return d.ok;
    },
    // cópia automática na área privada do app
    espelho: (dia, dados) => N.espelho(dia, dados),
    lerEspelho() { const d = ler(N.lerEspelho()); return d && d.dados ? { dia: d.dia, dados: ler(d.dados) } : null; },
    ditado,
  };
})();
