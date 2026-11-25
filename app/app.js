/* Desafio 365: telas e regras. Dados, fotos, voz e IA ficam em plataforma.js. */
{
const $=s=>document.getElementById(s);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const p=String(s).split('-').map(Number);return new Date(p[0],p[1]-1,p[2])};
const add=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const diff=(a,b)=>Math.round((parse(a)-parse(b))/864e5);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const okDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s));
const num=n=>n.toFixed(1).replace('.',',');
let TODAY=ymd(new Date());
const RL=['','Péssimo','Ruim','Ok','Bom','Ótimo'];
const WD=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const fmtLong=d=>cap(parse(d).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'short'}).replace('.',''));
const fmtShort=d=>parse(d).toLocaleDateString('pt-BR',{day:'numeric',month:'short'}).replace('.','');
const FEEL=[['feliz','Feliz',1],['calmo','Calmo',1],['motivado','Motivado',1],['grato','Grato',1],['animado','Animado',1],['confiante','Confiante',1],['cansado','Cansado',0],['ansioso','Ansioso',0],['triste','Triste',0],['irritado','Irritado',0],['sozinho','Sozinho',0],['estressado','Estressado',0],['entediado','Entediado',0]];
const fl=k=>{const f=FEEL.find(x=>x[0]===k);return f?f[1]:''};
const QS=['O que te deixou orgulhoso hoje?','O que você faria diferente se o dia recomeçasse?','Quem fez diferença no seu dia?','O que te tirou do sério hoje, e por quê?','Do que você tá com vontade ultimamente?','O que você aprendeu hoje, mesmo que pequeno?','O que você evitou fazer hoje? Por quê?','Se o você de daqui a um ano lesse esse dia, o que ia pensar?','O que te deu energia hoje? E o que tirou?','Qual pensamento ficou voltando na sua cabeça?','O que você tá adiando e por quê?','Pelo que você é grato hoje?','O que te fez rir?','Como você cuidou de você hoje?','O que tá te preocupando de verdade?','Que pequena vitória você teve?','O que você quer que amanhã tenha?','O que você disse sim que queria ter dito não?','O que te motivou a abrir esse app hoje?','Que hábito você sente que tá mudando?','O que você sentiu falta hoje?','O que te deixaria mais tranquilo essa semana?','Qual foi a decisão mais difícil do dia?','O que você fez só por você?','O que você tá sentindo agora, sem filtro?','Que conselho você daria pra si mesmo hoje?','O que você notou no seu corpo hoje?','O que você quer lembrar desse dia?','O que te travou hoje?','Do que você se cobrou demais?'];
const blank=()=>({r:0,h:{},good:[],bad:[],helped:'',disliked:'',note:'',f:[],ph:[],sleep:null,kg:null,best:'',pq:'',pa:'',star:false,w:null});
const cleanW=v=>{if(!v||typeof v!=='object')return null;const ex=(Array.isArray(v.ex)?v.ex:[]).filter(x=>x&&typeof x==='object').slice(0,30).map(x=>({n:String(x.n||''),s:(Array.isArray(x.s)?x.s:[]).filter(y=>y&&typeof y==='object').slice(0,30).map(y=>({kg:okNum(y.kg,0,1000),r:okNum(y.r,0,500),d:!!y.d,t:['a','d','f'].includes(y.t)?y.t:'',min:okNum(y.min,0,600),km:okNum(y.km,0,300)}))}));const n=String(v.n||''),note=String(v.note||'');const tm=x=>{const n=Number(x);return isFinite(n)&&n>1e12&&n<4e12?n:0};return ex.length||note?{n,ex,note,st:tm(v.st),en:tm(v.en)}:null};
const okNum=(v,a,b)=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);return isFinite(n)&&n>=a&&n<=b?Math.round(n*10)/10:null};
const okId=x=>/^[A-Za-z0-9_.-]{4,80}$/.test(x)||/^demo:\d+$/.test(x);
const has=e=>!!e&&!!(e.r||(e.good||[]).length||(e.bad||[]).length||e.helped||e.disliked||e.note||(e.f||[]).length||(e.ph||[]).length||e.sleep!=null||e.kg!=null||e.best||e.pa||e.star||!!(e.w&&e.w.ex&&e.w.ex.length)||Object.values(e.h||{}).some(Boolean));
const MG=[['disciplina','Disciplina'],['vontade','Tava com vontade'],['meta','Pensando na meta'],['pessoas','Alguém me puxou'],['bem','Me fez bem antes'],['rotina','Já é rotina'],['obrigacao','Obrigação'],['outro','Outro']];
const MB=[['preguica','Preguiça'],['semvontade','Sem vontade'],['cansaco','Cansaço'],['ansiedade','Ansiedade ou estresse'],['tedio','Tédio'],['impulso','Impulso'],['pessoas','Influência de alguém'],['tempo','Falta de tempo'],['outro','Outro']];
const ml=k=>{const f=MG.find(x=>x[0]===k&&k!=='pessoas')||MB.find(x=>x[0]===k);return f?f[1]:''};
const mlab=(l,k)=>{const f=(l==='good'?MG:MB).find(x=>x[0]===k);return f?f[1]:''};
const ci=x=>typeof x==='string'?{t:x,m:'',w:''}:{t:String(x&&x.t||''),m:String(x&&x.m||''),w:String(x&&x.w||'')};
const TIP={preguica:'Preguiça costuma ser o começo parecendo grande demais. Diminui o primeiro passo: só colocar a roupa, só abrir o caderno.',semvontade:'Quando falta vontade, a ação vem antes da motivação. Combina só 5 minutos; se depois quiser parar, para.',cansaco:'Cansaço pede olhar pro sono e pro quanto você tá carregando. Compara com os dias em que você dormiu bem.',ansiedade:'Anota o que tava pesando nesses dias. Se continuar se repetindo, vale conversar com alguém de confiança sobre isso.',tedio:'Deixa uma alternativa pronta pro tédio que não seja o celular: um desenho, uma caminhada, uma música.',impulso:'Coloca um obstáculo pequeno entre você e o impulso: app fora da tela inicial, besteira fora de vista.',pessoas:'Repara com quem e onde isso costuma acontecer. Às vezes é só combinar diferente.',tempo:'Encaixa versões curtas: 15 minutos contam mais que zero.',outro:'Tenta escrever o motivo com suas palavras nas próximas vezes; fica mais fácil achar o padrão.'};
const clean=v=>{const e=blank();if(!v||typeof v!=='object')return e;const r=Number(v.r);e.r=r>=1&&r<=5?Math.round(r):0;if(v.h&&typeof v.h==='object')for(const k in v.h)e.h[String(k)]=!!v.h[k];e.good=Array.isArray(v.good)?v.good.map(ci).filter(x=>x.t):[];e.bad=Array.isArray(v.bad)?v.bad.map(ci).filter(x=>x.t):[];e.f=Array.isArray(v.f)?v.f.map(String).filter(k=>fl(k)):[];e.ph=Array.isArray(v.ph)?v.ph.map(String).filter(okId).slice(0,9):[];e.sleep=okNum(v.sleep,0,24);e.kg=okNum(v.kg,20,400);e.best=String(v.best||'');e.pq=String(v.pq||'');e.pa=String(v.pa||'');e.star=!!v.star;e.w=cleanW(v.w);e.helped=String(v.helped||'');e.disliked=String(v.disliked||'');e.note=String(v.note||'');return e};
const cleanGoals=v=>(v&&Array.isArray(v.list)?v.list:[]).filter(g=>g&&typeof g==='object').map(g=>({id:String(g.id||uid()),title:String(g.title||''),why:String(g.why||''),notes:String(g.notes||''),by:okDate(g.by)?g.by:'',habit:String(g.habit||''),done:!!g.done,steps:Array.isArray(g.steps)?g.steps.map(s=>({t:String(s&&s.t||''),d:!!(s&&s.d)})):[]}));
const uid=()=>'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

let exemplo=false,openItem=null,uploading=0,lbD=null,dictFn=null,micT=null,revOpen=null,exSel=null,modalOpen=false;
const XK=['routines','reviews','letters','exmeta'];
const XC={routines:v=>(v&&Array.isArray(v.list)?v.list:[]).filter(x=>x&&typeof x==='object').map(x=>({id:String(x.id||uid()),n:String(x.n||'Treino'),ex:(Array.isArray(x.ex)?x.ex:[]).slice(0,30).map(e=>typeof e==='string'?{n:e,sets:3,rmin:8,rmax:12}:{n:String(e&&e.n||''),sets:Math.max(1,Math.min(10,Math.round(Number(e&&e.sets)||3))),rmin:okNum(e&&e.rmin,1,100)||8,rmax:okNum(e&&e.rmax,1,100)||12}).filter(e=>e.n)})),
  exmeta:v=>{const m=v&&(v.map||v.list),o={};if(m&&typeof m==='object'&&!Array.isArray(m))for(const k in m){const z=m[k];if(z&&typeof z==='object')o[String(k)]={g:String(z.g||''),note:String(z.note||'').slice(0,600)}}return o},
  reviews:v=>(v&&Array.isArray(v.list)?v.list:[]).filter(x=>x&&okDate(x.wk)).map(x=>({wk:x.wk,at:okDate(x.at)?x.at:x.wk,a:(Array.isArray(x.a)?x.a:[]).slice(0,3).map(String)})),
  letters:v=>(v&&Array.isArray(v.list)?v.list:[]).filter(x=>x&&okDate(x.open)).map(x=>({id:String(x.id||uid()),at:okDate(x.at)?x.at:TODAY,t:String(x.t||''),open:x.open,sur:!!x.sur,op:okDate(x.op)?x.op:''}))};
let X={routines:[],reviews:[],letters:[],exmeta:{}};
const MS=[7,30,50,100,150,200,250,300,365];
let S={start:null,habits:['Academia'],why:'',seen:[],rest:90},E={},G=[],AIr=null,demo=true,mode='loading',sel=TODAY,col=null,feedN=12,q='',undoFn=null,per='30',aiBusy=false;
const dirty=new Set(),timers={},chains={},pend={};
let cur=blank();

const PAL=[['#ff8a4c','#ffd59a','#5a2e7a','#2b1b4a'],['#7fc8ff','#e6f6ff','#3f8f5a','#20553a'],['#2a2d6e','#7b6cff','#1b1a40','#0d0c24'],['#ffb3c7','#fff0d6','#e0703f','#8a3a2a'],['#9fe0d0','#f3fff8','#2f7a8c','#174452'],['#ffd36b','#fff6d8','#c0573a','#6e2e22']];
const demoPic=k=>{const c=PAL[k%PAL.length],sx=60+(k*53)%280,sy=70+(k*29)%60;return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="'+sx+'" cy="'+sy+'" r="34" fill="#fff" opacity=".85"/><path d="M0 210 Q 100 '+(150+k%40)+' 200 200 T 400 190 V300 H0Z" fill="'+c[2]+'"/><path d="M0 250 Q 140 210 260 248 T 400 240 V300 H0Z" fill="'+c[3]+'"/></svg>')};
const fsrc=id=>{if(id.startsWith('demo:'))return'src="'+esc(demoPic(+id.slice(5)))+'"';const u=plat.fotos.pronta(id);return u?'src="'+esc(u)+'"':'src="'+plat.fotos.vazia+'" data-foto="'+esc(id)+'"'};
function makeDemo(){
  let s=11;const rnd=()=>(s=s*16807%2147483647)/2147483647;
  const pick=(a,n)=>{const c=a.slice(),o=[];while(o.length<n&&c.length)o.push(c.splice(Math.floor(rnd()*c.length),1)[0]);return o};
  const G0=['Treino de perna completo','Bebi 2L de água','Dormi antes da meia-noite','Saí com os amigos','Estudei 1h sem celular','Cozinhei em casa','Bati meu recorde no supino','Caminhei no fim da tarde','Resolvi uma pendência chata'];
  const B=['Dormi tarde demais','Pulei o treino','Esqueci de beber água','Deixei tarefa pra depois','Passei tempo demais na tela','Acordei atrasado'];
  const H=['Deixar a roupa da academia separada na noite anterior','Playlist nova no treino','Desligar o wifi depois das 23h','Ir treinar logo depois do trabalho'];
  const D=['Tela antes de dormir','Almoçar com pressa','Deixar tudo pra última hora'];
  const WW={'Dormi tarde demais':'Emendei um episódio no outro','Pulei o treino':'O dia ficou corrido','Deixei tarefa pra depois':'Achei que era grande demais pra começar','Treino de perna completo':'Lembrei do motivo de ter começado','Estudei 1h sem celular':'Deixei o celular na outra sala'};
  const FIT={'Dormi tarde demais':['impulso','tedio'],'Pulei o treino':['tempo','cansaco','preguica'],'Esqueci de beber água':['tempo'],'Deixei tarefa pra depois':['preguica','semvontade'],'Passei tempo demais na tela':['tedio','impulso'],'Acordei atrasado':['cansaco','preguica']};
  const mi=(t,M)=>{const f=FIT[t];const k=rnd()<.85?(f?f[Math.floor(rnd()**1.5*f.length)]:M[Math.floor(rnd()**1.7*(M.length-1))][0]):'';return{t,m:k,w:rnd()<.35&&WW[t]?WW[t]:''}};
  const st=add(TODAY,-41),e={};
  for(let i=0;i<41;i++){const d=add(st,i);if(rnd()<.1)continue;const gym=rnd()<.6;const r=Math.max(1,Math.min(5,1+Math.floor(rnd()*2.2+rnd()*2.2+(gym?.8:0))));
    const sl=Math.round((5+rnd()*2+r*.5)*2)/2,pos=FEEL.filter(x=>x[2]),neg=FEEL.filter(x=>!x[2]);
    e[d]={r,sleep:rnd()<.85?Math.min(10,sl):null,kg:i%3===0?Math.round((72+i*.035+rnd()*.6)*10)/10:null,f:pick((r>=4?pos:r<=2?neg:rnd()<.5?pos:neg).map(x=>x[0]),1+(rnd()<.4)),best:r>=4&&rnd()<.7?pick(['Treino pesado e saí me sentindo bem','Pôr do sol voltando pra casa','Conversa boa com um amigo','Terminei uma coisa que tava enrolando','Café da tarde com a família'],1)[0]:'',ph:rnd()<.22?[('demo:'+i)]:[],star:r>=4&&rnd()<.2,pq:'',pa:'',h:{Academia:gym},good:pick(G0,r>=4?2:1).map(t=>mi(t,MG)),bad:(r<=2?pick(B,rnd()<.4?2:1):(rnd()<.3?pick(B,1):[])).map(t=>mi(t,MB)),helped:r>=4&&rnd()<.6?pick(H,1)[0]:'',disliked:r<=3&&rnd()<.5?pick(D,1)[0]:'',note:''}}
  const g=[{id:'gd1',title:'Correr 10 km sem parar',why:'Exemplo: quero ter mais fôlego no dia a dia.',notes:'Trocar o percurso a cada duas semanas.',by:add(TODAY,200),habit:'Academia',done:false,steps:[{t:'Correr 3 km sem parar',d:true},{t:'Correr 5 km sem parar',d:false},{t:'Fazer uma prova de rua',d:false}]},
    {id:'gd2',title:'Ler 12 livros no ano',why:'Exemplo: ler me ajuda a desacelerar.',notes:'',by:'',habit:'',done:false,steps:[{t:'Escolher os 3 primeiros',d:true},{t:'20 páginas por dia',d:false}]}];
  const T3=(n,a,b,c)=>({n,sets:a||3,rmin:b||8,rmax:c||12});
  const RT=[{id:'rA',n:'Treino A · Peito e tríceps',ex:[T3('Supino reto',4,6,10),T3('Supino inclinado com halteres'),T3('Crucifixo',3,10,15),T3('Tríceps corda',3,10,15)]},{id:'rB',n:'Treino B · Costas e bíceps',ex:[T3('Puxada frontal'),T3('Remada curvada'),T3('Rosca direta',3,10,12),T3('Esteira',1,1,1)]},{id:'rC',n:'Treino C · Pernas',ex:[T3('Agachamento livre',4,6,10),T3('Leg press'),T3('Cadeira extensora',3,10,15),T3('Panturrilha',4,12,20)]}];
  const base={'Supino reto':40,'Supino inclinado com halteres':16,'Crucifixo':12,'Tríceps corda':20,'Puxada frontal':45,'Remada curvada':35,'Rosca direta':12,'Agachamento livre':50,'Leg press':120,'Cadeira extensora':35,'Panturrilha':60};
  let ri=0;const ds=Object.keys(e).sort();
  for(const d of ds){if(!e[d].h.Academia)continue;const rt=RT[ri++%3],k=diff(d,st);const t0=parse(d).setHours(18,20+Math.floor(rnd()*30));e[d].w={n:rt.n,note:'',st:t0,en:t0+(48+Math.floor(rnd()*25))*60000,ex:rt.ex.map((x,xi)=>{const n=x.n;if(n==='Esteira')return{n,s:[{kg:null,r:null,d:true,t:'',min:20,km:Math.round((2.4+rnd()*.6+k*.01)*10)/10}]};const kg=Math.round((base[n]*(1+k*.006))/2.5)*2.5;const ss=[...Array(x.sets)].map((_,j)=>({kg,r:Math.min(x.rmax,Math.max(x.rmin,x.rmax-1-j-(rnd()<.3?1:0)+(k>30?1:0))),d:true,t:'',min:null,km:null}));if(xi===0)ss.unshift({kg:Math.round(kg*.5/2.5)*2.5,r:12,d:true,t:'a',min:null,km:null});return{n,s:ss}})}}
  const mon=add(TODAY,-((parse(TODAY).getDay()+6)%7));
  const X0={exmeta:{'supino reto':{g:'',note:'Banco no 3º furo, pegada um palmo além do ombro.'}},routines:RT,reviews:[{wk:add(mon,-7),at:add(mon,-1),a:['Treinei 4 vezes e li todos os dias.','Dormi tarde em 3 noites.','Dormir antes da meia-noite.']},{wk:add(mon,-14),at:add(mon,-8),a:['O domingo foi leve.','Pulei dois treinos por falta de tempo.','Deixar a mochila pronta na noite anterior.']}],letters:[{id:'l1',at:add(TODAY,-20),t:'',open:add(TODAY,140),sur:true,op:''}]};
  return{S:{start:st,habits:['Academia'],why:'Exemplo: quero terminar o ano sabendo o que funciona pra mim.',seen:MS.filter(m=>m<=42)},E:e,G:g,X:X0};
}
function enterDemo(){const d=makeDemo();S=d.S;E=d.E;G=d.G;X=d.X;AIr=null;demo=true;sel=add(TODAY,-1)}
const end=()=>add(S.start,364);
const inRange=d=>{const i=diff(d,S.start);return i>=0&&i<=364&&d<=TODAY};
const inCh=d=>{const i=diff(d,S.start);return i>=0&&i<=364};

/* ---------- diário ---------- */
function renderTop(){
  const n=diff(TODAY,S.start)+1;
  $('dayN').innerHTML=n<1?'Começa em <small>'+esc(fmtShort(S.start))+'</small>':n>365?'Concluído':'Dia '+n+' <small>de 365</small>';
  $('progBar').style.width=Math.max(0,Math.min(100,n/365*100))+'%';
  $('range').textContent=fmtShort(S.start)+' até '+parse(end()).toLocaleDateString('pt-BR',{day:'numeric',month:'short',year:'numeric'}).replace('.','')+(demo?' · exemplo':'');
  let reg=0,gym=0,g=0,b=0;const h0=S.habits[0];
  for(const d in E){if(!inCh(d))continue;const e=E[d];if(has(e))reg++;if(h0&&e.h&&e.h[h0])gym++;g+=(e.good||[]).length;b+=(e.bad||[]).length}
  let st=0,d=has(E[TODAY])?TODAY:add(TODAY,-1);while(d>=S.start&&has(E[d])){st++;d=add(d,-1)}
  const items=[[reg,'dias registrados'],[st,st===1?'dia seguido':'dias seguidos'],[gym,'dias de '+(h0||'hábito').toLowerCase()],[g,'coisas boas'],[b,'coisas ruins']];
  $('stats').innerHTML=items.map(x=>'<div><b>'+x[0]+'</b><span>'+esc(x[1])+'</span></div>').join('');
  // sem dados ainda: tela de começo. O exemplo só aparece se a pessoa pedir
  const novo=demo&&mode!=='loading'&&!exemplo;
  document.body.classList.toggle('carregando',mode==='loading');document.body.classList.toggle('novo',novo);document.body.classList.toggle('exemplo',demo&&exemplo);
  if(novo||mode==='loading')$('range').textContent='Um quadradinho por dia. Pinta o ano.';
  if(!novo&&$('bkBox').parentElement!==$('ajustes'))$('ajustes').appendChild($('bkBox'));
  $('demo').classList.toggle('on',demo&&exemplo&&mode!=='loading');
  $('hab0').textContent=h0||'hábito';
  {const lr=X.reviews.slice().sort((a,b)=>a.wk<b.wk?1:-1)[0];$('focusTx').textContent=lr&&lr.a[2]&&diff(TODAY,lr.wk)<=14?'Foco da semana: '+lr.a[2]:''}
  $('whyTx').textContent=S.why||'Por que você começou? Escreve aqui o motivo forte que vai te trazer de volta.';$('whyTx').classList.toggle('ph',!S.why);$('whyEdit').disabled=demo;$('whyEdit').textContent=S.why?'Editar':'Escrever';
  $('lock').classList.toggle('on',demo);
  if(nativo&&!demo&&mode==='db')nativo.dia(S.start,end(),E[TODAY]&&E[TODAY].r?TODAY:'');
}
function renderGrid(){
  const st=S.start,last=parse(end());let d0=parse(st);d0.setDate(1);let html='';const h0=S.habits[0];
  while(d0<=last){
    const y=d0.getFullYear(),m=d0.getMonth(),off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
    let cells='<span></span>'.repeat(off);
    for(let k=1;k<=n;k++){
      const d=ymd(new Date(y,m,k)),i=diff(d,st);let c='c',dis=false;const e=E[d];
      if(i<0||i>364){c+=' out';dis=true}
      else if(d>TODAY){c+=' fut';dis=true}
      else{c+=e&&e.r?' r'+e.r:has(e)?' r0':' none';if(e&&h0&&e.h&&e.h[h0])c+=' gym'}
      if(d===TODAY)c+=' today';if(d===sel)c+=' sel';
      const lab=fmtShort(d)+(e&&e.r?' · '+RL[e.r]:'');
      cells+='<button class="'+c+'" data-d="'+d+'" title="'+esc(lab)+'" aria-label="'+esc(lab)+'"'+(dis?' disabled tabindex="-1"':'')+'></button>';
    }
    const name=d0.toLocaleDateString('pt-BR',{month:'long'})+(y!==parse(st).getFullYear()||m===0?' '+y:'');
    html+='<div class="mo"><h3>'+esc(name)+'</h3><div class="wk">'+'STQQSSD'.split('').map(x=>'<span>'+x+'</span>').join('')+'</div><div class="days">'+cells+'</div></div>';
    d0=new Date(y,m+1,1);
  }
  $('months').innerHTML=html;
}
function renderBal(){
  const rows=[];let d0=parse(S.start);d0.setDate(1);const lim=parse(TODAY<end()?TODAY:end());
  while(d0<=lim){const y=d0.getFullYear(),m=d0.getMonth();let g=0,b=0,gy=0,reg=0;
    for(const d in E){const p=parse(d);if(p.getFullYear()!==y||p.getMonth()!==m||!inCh(d))continue;const e=E[d];g+=(e.good||[]).length;b+=(e.bad||[]).length;if(e.h&&e.h[S.habits[0]])gy++;if(has(e))reg++}
    rows.push({n:d0.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),g,b,gy,reg});d0=new Date(y,m+1,1)}
  if(!rows.length){$('bal').innerHTML='<p class="sub">Aparece aqui quando o desafio começar.</p>';return}
  const mx=Math.max(1,...rows.map(r=>Math.max(r.g,r.b)));
  $('bal').innerHTML='<span></span><span class="hd" style="text-align:right">ruins</span><span class="hd">boas</span><span class="hd g">'+esc(S.habits[0]||'')+'</span>'+rows.reverse().map(r=>'<span class="m">'+esc(r.n)+'</span><div class="l">'+(r.b?'<div class="bar" style="width:'+(r.b/mx*100)+'%">'+r.b+'</div>':'')+'</div><div class="r">'+(r.g?'<div class="bar" style="width:'+(r.g/mx*100)+'%">'+r.g+'</div>':'')+'</div><span class="g">'+r.gy+' de '+r.reg+' dias</span>').join('');
}
function renderFeed(){
  const qq=q.trim().toLowerCase();
  let ds=Object.keys(E).filter(d=>has(E[d])&&inCh(d)).sort().reverse();
  if(qq)ds=ds.filter(d=>{const e=E[d];return[...(e.good||[]),...(e.bad||[])].map(x=>x.t+' '+x.w+' '+ml(x.m)).concat([e.helped,e.disliked,e.note,e.best,e.pa,e.pq,(e.f||[]).map(fl).join(' '),Object.keys(e.h||{}).filter(k=>e.h[k]).join(' ')]).join(' ').toLowerCase().includes(qq)});
  const show=ds.slice(0,feedN);
  $('feed').innerHTML=show.length?show.map(d=>{const e=E[d];const hs=Object.keys(e.h||{}).filter(k=>e.h[k]);
    return '<button class="ent" data-d="'+d+'"><div class="t">'+(e.r?'<i class="dot r'+e.r+'"></i>':'')+'<b>'+esc(fmtLong(d))+'</b>'+(e.star?'<span class="tag" style="background:var(--r4);color:#16131f">Marcante</span>':'')+(e.r?'<span class="tag">'+RL[e.r]+'</span>':'')+e.f.map(k=>'<span class="tag">'+esc(fl(k))+'</span>').join('')+hs.map(k=>'<span class="tag">'+esc(k)+'</span>').join('')+'</div>'
      +(e.ph.length?'<div class="thumbs">'+e.ph.map(id=>'<img '+fsrc(id)+' alt="" loading="lazy">').join('')+'</div>':'')+(e.best?'<p><b>Melhor momento:</b> '+esc(e.best)+'</p>':'')
      +(e.good||[]).map(x=>'<p class="pg">'+esc(x.t)+bec('good',x)+'</p>').join('')+(e.bad||[]).map(x=>'<p class="pb">'+esc(x.t)+bec('bad',x)+'</p>').join('')
      +(e.helped?'<p class="px">Ajudou: '+esc(e.helped)+'</p>':'')+(e.disliked?'<p class="px">Não curti: '+esc(e.disliked)+'</p>':'')+(e.note?'<p class="px">'+esc(e.note)+'</p>':'')+(e.pa?'<p class="px">'+esc(e.pq)+' '+esc(e.pa)+'</p>':'')+(e.sleep!=null||e.kg!=null?'<p class="px">'+[e.sleep!=null?'Sono '+num(e.sleep)+'h':'',e.kg!=null?num(e.kg)+' kg':''].filter(Boolean).join(' · ')+'</p>':'')+'</button>'}).join('')
    :'<p class="sub">'+(qq?'Nada encontrado com essa busca.':'Seus dias registrados vão aparecer aqui.')+'</p>';
  $('moreBtn').hidden=ds.length<=feedN;
}
const curQ=()=>cur.pq||QS[((diff(sel,S.start)%QS.length)+QS.length)%QS.length];
function renderPhotos(){
  const can=!demo;$('phWrap').hidden=!can&&!cur.ph.length;
  $('photos').innerHTML=cur.ph.map((id,i)=>'<div class="ph"><button class="open" data-po="'+i+'" aria-label="Ver foto"><img '+fsrc(id)+' alt=""></button>'+(can?'<button class="phx" data-pi="'+i+'" aria-label="Remover foto">×</button>':'')+'</div>').join('')
    +'<div class="ph phload"'+(uploading?'':' hidden')+'>Salvando '+uploading+'…</div>'
    +(can&&cur.ph.length<9?'<button class="phadd" id="phAdd">+ Foto</button>':'');
}
const bec=(l,x)=>x.m||x.w?'<span class="because"> · porque: '+esc([mlab(l,x.m),x.w].filter(Boolean).join(', ').toLowerCase())+'</span>':'';
function renderEditor(){
  cur=clean(E[sel]);openItem=null;
  const i=diff(sel,S.start)+1;
  $('edDate').textContent=sel===TODAY?'Hoje':fmtLong(sel);
  $('edDay').textContent=(sel===TODAY?fmtLong(sel)+' · ':'')+'Dia '+i+' de 365';
  $('prev').disabled=sel<=S.start;$('next').disabled=sel>=TODAY||sel>=end();
  $('fs').disabled=demo;$('gfs').disabled=demo;
  $('rate').innerHTML=[1,2,3,4,5].map(r=>'<button data-r="'+r+'" aria-pressed="'+(cur.r===r)+'"><i class="r'+r+'"></i>'+RL[r]+'</button>').join('');
  $('habits').innerHTML=S.habits.map((h,k)=>'<button class="chip" data-h="'+k+'" aria-pressed="'+!!cur.h[h]+'">'+esc(h)+'</button>').join('');
  renderLists();
  $('feel').innerHTML=FEEL.map(x=>'<button class="chip '+(x[2]?'pos':'neg')+'" data-fe="'+x[0]+'" aria-pressed="'+cur.f.includes(x[0])+'">'+x[1]+'</button>').join('');
  $('best').value=cur.best;$('qTx').textContent=curQ();$('qAns').value=cur.pa;
  $('sleep').value=cur.sleep??'';$('kg').value=cur.kg??'';
  $('star').setAttribute('aria-pressed',cur.star);$('star').textContent=cur.star?'Dia marcante':'Marcar como dia marcante';
  renderPhotos();
  $('helped').value=cur.helped;$('disliked').value=cur.disliked;$('note').value=cur.note;
  $('startEdit').value=S.start;
  $('habEdit').innerHTML=S.habits.map((h,k)=>'<span class="chip" style="display:inline-flex;align-items:center;gap:6px;padding-right:6px">'+esc(h)+'<button class="x" data-x="'+k+'" aria-label="Remover '+esc(h)+'">×</button></span>').join('');
}
function renderLists(){
  for(const l of['good','bad']){const M=l==='good'?MG:MB;
    $(l).innerHTML=cur[l].map((x,k)=>{const op=openItem&&openItem.l===l&&openItem.k===k;const lab=mlab(l,x.m);
      return '<li><div class="it"><span>'+esc(x.t)+'</span><button class="whyb'+(lab?' set':'')+'" data-o="'+k+'" aria-expanded="'+op+'">'+(lab?esc(lab):'por quê?')+'</button><button class="x" data-k="'+k+'" aria-label="Remover">×</button></div>'
      +(op?'<div class="whyp"><p class="q">'+(l==='good'?'O que te fez fazer isso?':'Por que isso aconteceu?')+'</p><div class="mch">'+M.map(m=>'<button data-m="'+m[0]+'" data-i="'+k+'" aria-pressed="'+(x.m===m[0])+'">'+m[1]+'</button>').join('')+'</div><input data-w="'+k+'" value="'+esc(x.w)+'" placeholder="Explica com suas palavras (opcional)" aria-label="Explicação"></div>'
        :(x.w?'<p class="ww">'+esc(x.w)+'</p>':''))+'</li>'}).join('')}
}

/* ---------- relatórios ---------- */
function periodDays(){const en=TODAY<end()?TODAY:end();let st=per==='all'?S.start:add(en,-(+per-1));if(st<S.start)st=S.start;const out=[];for(let d=st;d<=en;d=add(d,1))out.push(d);return out}
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const norm=t=>String(t).toLowerCase().trim().replace(/[.!?,;]+$/,'');
function tally(days,key){const m=new Map();for(const d of days){const e=E[d];if(!e)continue;for(const x of e[key]||[]){const k=norm(x.t);if(!k)continue;const o=m.get(k)||{t:x.t,n:0,last:d,ms:{}};o.n++;o.t=x.t;o.last=d;if(x.m)o.ms[x.m]=(o.ms[x.m]||0)+1;m.set(k,o)}}return[...m.values()].sort((a,b)=>b.n-a.n||(a.last<b.last?1:-1))}
function habitRate(h,days){const reg=days.filter(d=>has(E[d]));const n=reg.filter(d=>E[d].h&&E[d].h[h]).length;return{n,of:reg.length}}
function analyze(days){
  const reg=days.filter(d=>has(E[d])),rated=reg.filter(d=>E[d].r);
  const A={days,reg,rated,avg:avg(rated.map(d=>E[d].r))};
  A.hab=S.habits.map(h=>{const w=[],wo=[];for(const d of rated)(E[d].h&&E[d].h[h]?w:wo).push(E[d].r);const r=habitRate(h,days);return{h,n:r.n,of:r.of,w:avg(w),wo:avg(wo),nw:w.length,nwo:wo.length}});
  A.wd=WD.map((n,i)=>{const v=rated.filter(d=>(parse(d).getDay()+6)%7===i).map(d=>E[d].r);return{n,a:avg(v),c:v.length}});
  A.good=tally(reg,'good');A.bad=tally(reg,'bad');
  A.fe={};for(const d of reg)for(const k of E[d].f)A.fe[k]=(A.fe[k]||0)+1;
  A.sl=rated.filter(d=>E[d].sleep!=null);A.slAll=reg.filter(d=>E[d].sleep!=null).map(d=>E[d].sleep);
  A.kg=days.filter(d=>E[d]&&E[d].kg!=null).map(d=>({d,v:E[d].kg}));
  A.mg={};A.mb={};A.wg=[];A.wb=[];
  for(const d of reg.slice().reverse()){const e=E[d];for(const x of e.good){if(x.m)A.mg[x.m]=(A.mg[x.m]||0)+1;if(x.w)A.wg.push({t:x.t,w:x.w,m:x.m,d})}for(const x of e.bad){if(x.m)A.mb[x.m]=(A.mb[x.m]||0)+1;if(x.w)A.wb.push({t:x.t,w:x.w,m:x.m,d})}}
  const uniq=(arr)=>{const s=new Map();for(const x of arr){const k=norm(x.t);if(k&&!s.has(k))s.set(k,x)}return[...s.values()]};
  A.helps=uniq(reg.filter(d=>E[d].r>=4&&E[d].helped).reverse().map(d=>({t:E[d].helped,d})));
  A.dislikes=uniq(reg.filter(d=>E[d].disliked).reverse().map(d=>({t:E[d].disliked,d})));
  return A;
}
function recommend(A){
  const R=[];
  const hb=A.hab.filter(x=>x.nw>=3&&x.nwo>=3).sort((a,b)=>(b.w-b.wo)-(a.w-a.wo))[0];
  if(hb&&hb.w-hb.wo>=.4)R.push({c:'warm',t:hb.h+' tá segurando seus dias',b:'Com '+hb.h.toLowerCase()+' sua nota média é '+num(hb.w)+'; sem, cai pra '+num(hb.wo)+'. '+(hb.of&&hb.n/hb.of<.6?'Você fez em '+Math.round(hb.n/hb.of*100)+'% dos dias registrados, então tem espaço pra crescer: escolhe dias fixos na semana.':'Vale proteger isso mesmo nos dias corridos.')});
  const topM=(cnt,M)=>M.map(([k,l])=>({k,l,n:cnt[k]||0})).filter(x=>x.n&&x.k!=='outro').sort((a,b)=>b.n-a.n)[0];
  const bm=topM(A.mb,MB),gm=topM(A.mg,MG);
  if(bm&&bm.n>=3)R.push({c:'cold',t:'“'+bm.l+'” está por trás de '+bm.n+' coisas ruins',b:TIP[bm.k]+(gm?' E repara: o que mais te move nas coisas boas é “'+gm.l.toLowerCase()+'”. Usa isso a seu favor.':'')});
  const tb=A.bad[0];
  if(tb&&tb.n>=3){const h=A.helps.slice(0,2).map(x=>'“'+x.t+'”');const tm=Object.entries(tb.ms).sort((a,b)=>b[1]-a[1])[0];R.push({c:'cold',t:'“'+tb.t+'” se repetiu '+tb.n+' vezes',b:(tm?'Na maioria das vezes o motivo foi “'+mlab('bad',tm[0]).toLowerCase()+'”. ':'')+(h.length?'Nos seus dias bons, o que ajudou foi '+h.join(' e ')+'. Dá pra usar isso como antídoto.':'Tenta anotar o que acontece antes disso nos próximos dias. Fica mais fácil achar o gatilho.')})}
  const l7=[],p7=[];for(let i=0;i<14;i++){const d=add(TODAY,-i);if(!inRange(d)||!E[d]||!E[d].r)continue;(i<7?l7:p7).push(E[d].r)}
  if(l7.length>=3&&p7.length>=3){const df=avg(l7)-avg(p7);
    if(df<=-.6)R.push({c:'cold',t:'A última semana pesou mais',b:'Nota média '+num(avg(l7))+' contra '+num(avg(p7))+' na semana anterior. Dá uma olhada no que apareceu de ruim nesses dias e no que você parou de fazer.'});
    else if(df>=.6)R.push({c:'warm',t:'A última semana foi melhor',b:'Nota média '+num(avg(l7))+' contra '+num(avg(p7))+' na anterior. O que mudou? Anota pra conseguir repetir.'})}
  const wds=A.wd.filter(w=>w.c>=2);if(wds.length>=4){const lo=wds.reduce((a,b)=>b.a<a.a?b:a);if(A.avg-lo.a>=.7)R.push({c:'cold',t:lo.n+' costuma ser seu dia mais difícil',b:'Média '+num(lo.a)+' contra '+num(A.avg)+' no geral. Planeja algo leve ou que você curte pra esse dia.'})}
  for(const g of G.filter(g=>!g.done)){
    const left=g.steps.filter(s=>!s.d).length;
    if(g.habit&&S.habits.includes(g.habit)){const ds=[];for(let i=0;i<14;i++){const d=add(TODAY,-i);if(inRange(d))ds.push(d)}const n=ds.filter(d=>E[d]&&E[d].h&&E[d].h[g.habit]).length;
      if(ds.length>=5&&n/ds.length<.5)R.push({c:'',t:'Meta “'+g.title+'” ficando pra trás',b:g.habit+' em '+n+' de '+ds.length+' dias nas últimas semanas. '+(left?'Próximo passo: “'+g.steps.find(s=>!s.d).t+'”.':'Escolhe uns dias fixos na semana pra isso.')})}
    if(!g.steps.length&&g.title)R.push({c:'',t:'Quebra “'+g.title+'” em passos',b:'Meta sem passos fica abstrata. Escreve 2 ou 3 coisas pequenas que dá pra fazer essa semana.'});
    if(g.by&&g.steps.length){const dl=diff(g.by,TODAY),pr=1-left/g.steps.length;if(dl>=0&&dl<=30&&pr<.5)R.push({c:'cold',t:'Faltam '+dl+' dias pra “'+g.title+'”',b:'Você fez '+(g.steps.length-left)+' de '+g.steps.length+' passos. Vale rever o prazo ou focar no próximo passo agora.'})}
  }
  if(!S.why&&!demo)R.push({c:'',t:'Escreve o seu porquê',b:'Lá no topo. Um motivo forte, com suas palavras, é o que te faz voltar nos dias sem vontade.'});
  const lo=A.sl.filter(d=>E[d].sleep<7).map(d=>E[d].r),hi=A.sl.filter(d=>E[d].sleep>=7).map(d=>E[d].r);
  if(lo.length>=3&&hi.length>=3&&avg(hi)-avg(lo)>=.5)R.push({c:'warm',t:'Dormir 7h ou mais muda seu dia',b:'Com 7h ou mais de sono sua nota média é '+num(avg(hi))+'; com menos, '+num(avg(lo))+'. Você dormiu menos de 7h em '+lo.length+' dos '+A.sl.length+' dias com sono anotado.'});
  const nf=FEEL.filter(x=>!x[2]).map(x=>({k:x[0],l:x[1],n:A.fe[x[0]]||0})).sort((a,b)=>b.n-a.n)[0];
  if(nf&&nf.n>=4)R.push({c:'cold',t:'Você marcou “'+nf.l.toLowerCase()+'” em '+nf.n+' dias',b:'Vale ver o que esses dias têm em comum: busca “'+nf.l.toLowerCase()+'” em Olhando pra trás, no Diário.'+(nf.k==='ansioso'||nf.k==='triste'||nf.k==='sozinho'?' Se tiver pesando, conversar com alguém de confiança ajuda.':'')});
  let r7=0;for(let i=0;i<7;i++){const d=add(TODAY,-i);if(inRange(d)&&has(E[d]))r7++}
  if(diff(TODAY,S.start)>=7&&r7<4)R.push({c:'',t:'Registrou '+r7+' dos últimos 7 dias',b:'Quanto mais dias registrados, mais claros ficam os padrões. Mesmo só a nota do dia já ajuda.'});
  if(!R.length)R.push({c:'',t:A.reg.length<10?'Ainda poucos dias':'Tudo estável por aqui',b:A.reg.length<10?'Com uns 10 dias registrados começam a aparecer padrões e recomendações.':'Nenhum alerta no período. Continua registrando.'});
  return R.slice(0,6);
}
function rowBars(list,color,mx,fmt){return list.map(x=>'<div class="hrow"><span class="nm">'+esc(x.t)+'</span><div class="track"><i style="width:'+(mx?x.v/mx*100:0)+'%;background:'+color+'"></i></div><span class="v">'+esc(fmt(x))+'</span></div>').join('')}
function renderReport(){
  const days=periodDays(),A=analyze(days);
  [...$('perSel').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===per));
  $('repTitle').textContent=A.rated.length?'Nota média '+num(A.avg)+(per==='all'?' no desafio':' nos últimos '+per+' dias'):'Relatório';
  $('repSub').textContent=days.length?fmtShort(days[0])+' a '+fmtShort(days[days.length-1])+(demo?' · exemplo':''):'O desafio ainda não começou.';
  const h0=A.hab[0],tg=A.good.reduce((s,x)=>s+x.n,0),tb=A.bad.reduce((s,x)=>s+x.n,0);
  $('figs').innerHTML=[[A.reg.length+' de '+days.length,'dias registrados'],[h0?h0.n:0,h0?'dias de '+h0.h.toLowerCase():'hábitos'],[tg,'coisas boas'],[tb,'coisas ruins']].map(f=>'<div><b>'+esc(f[0])+'</b><span>'+esc(f[1])+'</span></div>').join('');
  $('cols').innerHTML=days.map(d=>{const e=E[d];const r=e&&e.r;return'<span class="'+(r?'r'+r:'')+'" style="height:'+(r?r*20:has(e)?10:3)+'%" title="'+esc(fmtShort(d)+(r?' · '+RL[r]:''))+'"></span>'}).join('');
  $('axis').innerHTML=days.length?'<span>'+esc(fmtShort(days[0]))+'</span><span>'+esc(fmtShort(days[days.length-1]))+'</span>':'';
  $('recs').innerHTML=recommend(A).map(r=>'<div class="rec '+r.c+'"><b>'+esc(r.t)+'</b><p>'+esc(r.b)+'</p></div>').join('');
  $('wd').innerHTML=A.wd.map(w=>'<div class="hrow"><span class="nm">'+w.n+'</span><div class="track"><i class="'+(w.c?'r'+Math.max(1,Math.min(5,Math.round(w.a))):'')+'" style="width:'+(w.a/5*100)+'%"></i></div><span class="v">'+(w.c?num(w.a):'–')+'</span></div>').join('');
  $('habRep').innerHTML=A.hab.length?A.hab.map(x=>'<div class="hrow"><span class="nm">'+esc(x.h)+'</span><div class="track"><i style="width:'+(x.of?x.n/x.of*100:0)+'%;background:var(--blue)"></i></div><span class="v">'+x.n+'/'+x.of+'</span></div>'+(x.nw>=2&&x.nwo>=2?'<p class="sub" style="margin:-2px 0 12px">Nota com: <b>'+num(x.w)+'</b> · sem: <b>'+num(x.wo)+'</b></p>':'')).join(''):'<p class="sub">Adicione hábitos nos ajustes do diário.</p>';
  const tops=(l,c)=>l.length?rowBars(l.slice(0,6).map(x=>({t:x.t,v:x.n})),c,l[0].n,x=>x.v+'×'):'<p class="sub">Nada registrado no período.</p>';
  $('topGood').innerHTML=tops(A.good,'var(--r5)');$('topBad').innerHTML=tops(A.bad,'var(--r1)');
  $('helps').innerHTML=A.helps.length?A.helps.slice(0,6).map(x=>'<div class="rec warm"><p>'+esc(x.t)+'</p><p class="px" style="font-size:13px">'+esc(fmtShort(x.d))+'</p></div>').join(''):'<p class="sub">Nada ainda.</p>';
  $('dislikes').innerHTML=A.dislikes.length?A.dislikes.slice(0,6).map(x=>'<div class="rec cold"><p>'+esc(x.t)+'</p><p class="px" style="font-size:13px">'+esc(fmtShort(x.d))+'</p></div>').join(''):'<p class="sub">Nada ainda.</p>';
  const motRows=(cnt,M,c)=>{const l=M.map(([k,lab])=>({t:lab,v:cnt[k]||0})).filter(x=>x.v).sort((a,b)=>b.v-a.v);return l.length?rowBars(l,c,l[0].v,x=>x.v+'×'):'<p class="sub">Quando você marcar o porquê das coisas, aparece aqui.</p>'};
  $('motG').innerHTML=motRows(A.mg,MG,'var(--r5)');$('motB').innerHTML=motRows(A.mb,MB,'var(--r1)');
  const wl=(a,l,c)=>a.slice(0,4).map(x=>'<div class="rec '+c+'"><b>'+esc(x.t)+'</b><p>'+esc((x.m?mlab(l,x.m)+': ':'')+x.w)+'</p></div>').join('');
  $('whyG').innerHTML=wl(A.wg,'good','warm');$('whyB').innerHTML=wl(A.wb,'bad','cold');
  const fr=FEEL.map(x=>({t:x[1],v:A.fe[x[0]]||0,p:x[2]})).filter(x=>x.v).sort((a,b)=>b.v-a.v).slice(0,8);
  $('feelRep').innerHTML=fr.length?fr.map(x=>'<div class="hrow"><span class="nm">'+esc(x.t)+'</span><div class="track"><i style="width:'+(x.v/fr[0].v*100)+'%;background:'+(x.p?'var(--r5)':'var(--r1)')+'"></i></div><span class="v">'+x.v+'×</span></div>').join(''):'<p class="sub">Marca como você se sentiu no registro do dia.</p>';
  $('sleepSub').textContent=A.slAll.length?'Média de '+num(avg(A.slAll))+'h por noite em '+A.slAll.length+(A.slAll.length===1?' noite anotada.':' noites anotadas.')+' Abaixo, sua nota média por faixa de sono.':'Anota quantas horas dormiu e aparece aqui como o sono mexe no seu dia.';
  const bk=[['Menos de 6h',0,6],['6h a 7h',6,7],['7h a 8h',7,8],['8h ou mais',8,25]].map(([t,a,b])=>{const v=A.sl.filter(d=>E[d].sleep>=a&&E[d].sleep<b).map(d=>E[d].r);return{t,a:avg(v),c:v.length}});
  $('sleepRep').innerHTML=A.sl.length?bk.map(b=>'<div class="hrow"><span class="nm">'+b.t+'</span><div class="track"><i class="'+(b.c?'r'+Math.max(1,Math.min(5,Math.round(b.a))):'')+'" style="width:'+(b.a/5*100)+'%"></i></div><span class="v">'+(b.c?num(b.a):'–')+'</span></div>').join(''):'';
  kgPts=A.kg;$('kgw').hidden=kgPts.length<2;drawKg();
  $('kgSub').textContent=kgPts.length>=2?'Peso: de '+num(kgPts[0].v)+' para '+num(kgPts[kgPts.length-1].v)+' kg ('+((kgPts[kgPts.length-1].v-kgPts[0].v)>=0?'+':'')+num(kgPts[kgPts.length-1].v-kgPts[0].v)+' kg) no período.':kgPts.length===1?'Peso: '+num(kgPts[0].v)+' kg. Com mais registros aparece a linha.':'Anota o peso de vez em quando e aparece a linha aqui.';
  renderAI();
}
let kgPts=[];
function drawKg(){drawLine($('kgSvg'),kgPts,'kg')}
function drawLine(s,kgPts,unit){const W=s.clientWidth,H=s.clientHeight;if(!W||!H||kgPts.length<2){s.innerHTML='';return}
  const vs=kgPts.map(p=>p.v),mn=Math.min(...vs),mx=Math.max(...vs),pd=Math.max(.5,(mx-mn)*.15),lo=mn-pd,hi=mx+pd,L=6,R=W<520?60:64,T=16,B=26,span=Math.max(1,diff(kgPts[kgPts.length-1].d,kgPts[0].d));
  const x=p=>L+(W-L-R)*diff(p.d,kgPts[0].d)/span,y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
  const path=kgPts.map((p,i)=>(i?'L':'M')+x(p).toFixed(1)+' '+y(p.v).toFixed(1)).join(' '),last=kgPts[kgPts.length-1];
  s.innerHTML='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+(H-B)+'" y2="'+(H-B)+'" stroke="var(--line)"/>'
   +'<path d="'+path+'" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'
   +kgPts.map(p=>'<circle cx="'+x(p).toFixed(1)+'" cy="'+y(p.v).toFixed(1)+'" r="3.5" fill="var(--blue)"/>').join('')
   +'<text x="'+(x(last)+8)+'" y="'+(y(last.v)+4)+'" style="fill:var(--ink);font-weight:600">'+num(last.v)+' '+unit+'</text>'
   +'<text x="'+L+'" y="'+(H-6)+'">'+esc(fmtShort(kgPts[0].d))+'</text><text x="'+(W-R)+'" y="'+(H-6)+'" text-anchor="end">'+esc(fmtShort(last.d))+'</text>'}
const kgRO=new ResizeObserver(()=>drawKg());kgRO.observe($('kgSvg'));
function renderAI(msg,extra){
  const o=$('aiOut');
  $('aiBtn').disabled=$('aiCopy').disabled=aiBusy||demo;$('aiBtn').textContent=aiBusy?'Analisando…':'Pedir análise';
  if(msg){o.innerHTML='<p>'+esc(msg)+'</p>'+(extra||'');return}
  if(demo){o.innerHTML='<p class="sub">Disponível depois que você começar seu desafio.</p>';return}
  if(!AIr||!AIr.res){o.innerHTML='';return}
  const r=AIr.res,li=a=>'<ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  let h='<p class="sub" style="margin-top:16px">Análise de '+esc(fmtShort(AIr.at))+' · '+(AIr.per==='all'?'desafio todo':esc(AIr.per)+' dias')+'</p>';
  if(r.cuidado)h+='<div class="care">'+esc(r.cuidado)+'</div>';
  if(r.resumo)h+='<p>'+esc(r.resumo)+'</p>';
  if(r.notei.length)h+='<h3>O que eu notei</h3>'+li(r.notei);
  if(r.porques&&r.porques.length)h+='<h3>Por trás do que você faz</h3>'+li(r.porques);
  if(r.funcionando.length)h+='<h3>O que tá funcionando</h3>'+li(r.funcionando);
  if(r.sugestoes.length)h+='<h3>Sugestões</h3><ul>'+r.sugestoes.map(s=>'<li><b>'+esc(s.titulo)+'</b> '+esc(s.passo)+'</li>').join('')+'</ul>';
  if(r.metas.length)h+='<h3>Sobre suas metas</h3><ul>'+r.metas.map(s=>'<li><b>'+esc(s.meta)+':</b> '+esc(s.comentario)+'</li>').join('')+'</ul>';
  o.innerHTML=h;
}
const cleanAI=v=>{if(!v||typeof v!=='object')return null;const arr=a=>Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,8):[];
  return{resumo:typeof v.resumo==='string'?v.resumo:'',notei:arr(v.notei),funcionando:arr(v.funcionando),porques:arr(v.porques),
    sugestoes:(Array.isArray(v.sugestoes)?v.sugestoes:[]).filter(x=>x&&typeof x==='object').slice(0,6).map(x=>({titulo:String(x.titulo||''),passo:String(x.passo||'')})),
    metas:(Array.isArray(v.metas)?v.metas:[]).filter(x=>x&&typeof x==='object').slice(0,6).map(x=>({meta:String(x.meta||''),comentario:String(x.comentario||'')})),
    cuidado:typeof v.cuidado==='string'&&v.cuidado.trim()?v.cuidado:null}};
const curQFor=(d,e)=>e.pq||QS[((diff(d,S.start)%QS.length)+QS.length)%QS.length];
function pedidoIA(){
  const days=periodDays().filter(d=>has(E[d]));
  if(!days.length){renderAI('Registra alguns dias primeiro pra ter o que analisar.');return null}
  const reg=days.map(d=>{const e=E[d];return{data:d,dia_semana:WD[(parse(d).getDay()+6)%7],nota:e.r?RL[e.r]:null,sentiu:e.f.map(fl),sono_h:e.sleep??undefined,peso_kg:e.kg??undefined,melhor_momento:e.best||undefined,pergunta_do_dia:e.pa?{pergunta:curQFor(d,e),resposta:e.pa}:undefined,dia_marcante:e.star||undefined,treino:e.w?e.w.n+': '+e.w.ex.filter(x=>x.n).map(x=>x.n+' '+x.s.filter(y=>y.t!=='a').map(y=>y.min!=null?y.min+'min'+(y.km!=null?' '+num(y.km)+'km':''):y.kg!=null&&y.r!=null?num(y.kg)+'kg×'+y.r+(y.t==='f'?'(falha)':y.t==='d'?'(drop)':''):'').filter(Boolean).join(', ')).join('; '):undefined,fotos:e.ph.length||undefined,fez:Object.keys(e.h).filter(k=>e.h[k]),boas:e.good.map(x=>x.t+(x.m||x.w?' (porque: '+[mlab('good',x.m),x.w].filter(Boolean).join(', ')+')':'')),ruins:e.bad.map(x=>x.t+(x.m||x.w?' (porque: '+[mlab('bad',x.m),x.w].filter(Boolean).join(', ')+')':'')),ajudou:e.helped||undefined,nao_curti:e.disliked||undefined,anotacao:e.note||undefined}});
  const metas=G.filter(g=>!g.done).map(g=>({meta:g.title,porque:g.why,prazo:g.by||undefined,habito_ligado:g.habit||undefined,passos:g.steps.map(s=>(s.d?'[feito] ':'[a fazer] ')+s.t),anotacoes:g.notes||undefined}));
  const foco=$('aiFocus').value.trim();
  const prompt='Você é um apoio pessoal de quem está fazendo um desafio de 365 dias registrando o dia a dia (hábitos como academia, coisas boas, coisas ruins, o que ajudou, o que não curtiu). Leia os registros e as metas abaixo e devolva uma leitura honesta e útil. A pessoa quer muito entender POR QUE faz o que faz: cada coisa boa ou ruim pode trazer o porquê (um motivo como preguiça, sem vontade, cansaço, pensando na meta, e às vezes uma explicação). Olhe com atenção pra isso: o que realmente move a pessoa, o que trava, se o que parece preguiça é na verdade cansaço, falta de sentido ou ansiedade, e o que de forte faz ela voltar e melhorar.\n\n'
   +'Tom: português do Brasil, como um amigo próximo e sincero. Direto, acolhedor, sem julgamento, sem sermão e sem diagnóstico. Use fatos concretos dos registros (cite coisas que a pessoa escreveu, dias, repetições). Recomendações pequenas, práticas e ligadas às metas quando fizer sentido. Os registros podem ter assuntos pessoais e delicados: trate com respeito e naturalidade.\n\n'
   +'Responda SOMENTE com JSON neste formato:\n{"resumo": "2 ou 3 frases", "notei": ["padrões que você percebeu"], "funcionando": ["o que está dando certo"], "porques": ["o que está por trás do que a pessoa faz: o que move e o que trava, com base nos porquês registrados"], "sugestoes": [{"titulo": "curto", "passo": "uma ação concreta pros próximos dias"}], "metas": [{"meta": "nome da meta", "comentario": "como os registros se relacionam com ela e um próximo passo"}], "cuidado": null}\n'
   +'Máximo de 4 itens em cada lista. "cuidado" fica null, a não ser que os registros mostrem sofrimento intenso, desesperança, vontade de se machucar ou crise. Nesse caso escreva ali, com carinho e sem alarme, um incentivo a conversar com alguém de confiança e lembre que o CVV atende 24h pelo telefone 188, de graça, ou em cvv.org.br.\n\n'
   +(foco?'A pessoa pediu foco em: '+foco+'\n\n':'')
   +(S.why?'O porquê da pessoa pra esse desafio: '+S.why+'\n':'')+(X.reviews.length?'Revisões semanais (o que foi melhor / o que travou / foco da semana seguinte): '+JSON.stringify(X.reviews.slice(-4))+'\n':'')+'Hábitos acompanhados: '+JSON.stringify(S.habits)+'\nMetas: '+JSON.stringify(metas)+'\nRegistros ('+reg.length+' dias): '+JSON.stringify(reg);
  return prompt}
const guardarIA=v=>{const res=cleanAI(v);if(!res)return false;AIr={at:TODAY,per,res};if(!demo)persist('ai',()=>AIr);return true};
async function runAI(){
  if(aiBusy||demo)return;
  if(!plat.conf.iaKey){renderAI('Pra rodar num toque, coloca sua chave da API em Ajustes e backup, no Diário. Sem chave, usa Copiar pedido.','<button class="btn lk" data-ir>Abrir ajustes</button>');return}
  const prompt=pedidoIA();if(!prompt)return;
  aiBusy=true;renderAI();$('aiOut').innerHTML='<p class="sub" style="margin-top:14px">Lendo seus registros…</p>';
  try{
    const v=await plat.iaJSON(prompt);
    if(!guardarIA(v))throw{code:'bad'};
    aiBusy=false;renderAI();
  }catch(e){aiBusy=false;const c=e&&e.code;
    const m={rate_limited:'A conta chegou no limite por agora. Tenta de novo daqui a pouco.',key:'A chave não foi aceita. Confere em Ajustes e backup.',billing:'A conta da Anthropic está sem crédito.',forbidden:'Essa chave não tem permissão pra isso.',model:'Esse modelo não está disponível pra sua chave. Escolhe outro em Ajustes e backup.',busy:'A API está sobrecarregada agora. Tenta daqui a alguns minutos.',offline:'Sem conexão com a API. Confere a internet e tenta de novo.',refusal:'O Claude não quis responder a essa análise. Tenta outro período ou outro modelo.',too_long:'A resposta ficou longa demais. Tenta um período menor.',too_large:'É registro demais pra uma análise só. Tenta um período menor.'}[c];
    renderAI(m||(c==='invalid'&&e.message?'A API recusou o pedido: '+e.message:'Não consegui fazer a análise agora. Tenta de novo.'),c==='key'||c==='model'?'<button class="btn lk" data-ir>Abrir ajustes</button>':'')}
}

/* ---------- metas ---------- */
function goalCard(g){
  const done=g.steps.filter(s=>s.d).length,tot=g.steps.length;
  let hab='';if(g.habit&&S.habits.includes(g.habit)){const ds=[];for(let i=0;i<30;i++){const d=add(TODAY,-i);if(inRange(d))ds.push(d)}const n=ds.filter(d=>E[d]&&E[d].h&&E[d].h[g.habit]).length;hab=esc(g.habit)+' em '+n+' dos últimos '+ds.length+' dias'}
  const dl=g.by?diff(g.by,TODAY):null;
  return '<article class="goal" data-id="'+esc(g.id)+'">'
   +'<label class="sr" for="t-'+esc(g.id)+'">Título</label><input class="gt" id="t-'+esc(g.id)+'" data-f="title" value="'+esc(g.title)+'" placeholder="Nome da meta">'
   +'<div class="gmeta"><label>Prazo <input type="date" data-f="by" value="'+esc(g.by)+'"></label>'
   +'<label>Hábito ligado <select data-f="habit"><option value="">nenhum</option>'+S.habits.map(h=>'<option'+(h===g.habit?' selected':'')+'>'+esc(h)+'</option>').join('')+'</select></label>'
   +(dl!==null?'<span>'+(dl>0?'faltam '+dl+' dias':dl===0?'é hoje':'passou '+(-dl)+' dias')+'</span>':'')+'</div>'
   +(tot?'<div class="gbar" aria-label="'+done+' de '+tot+' passos"><i style="width:'+(done/tot*100)+'%"></i></div><span class="hd">'+done+' de '+tot+' passos'+(hab?' · '+hab:'')+'</span>':(hab?'<span class="hd">'+hab+'</span>':''))
   +'<span class="lab">Passos</span><ul class="steps">'+g.steps.map((s,k)=>'<li class="'+(s.d?'ok':'')+'"><input type="checkbox" data-st="'+k+'" aria-label="Feito"'+(s.d?' checked':'')+'><span>'+esc(s.t)+'</span><button class="x" data-sd="'+k+'" aria-label="Remover passo">×</button></li>').join('')+'</ul>'
   +'<div class="add"><input class="fld" data-sa placeholder="Novo passo" aria-label="Novo passo"><button class="btn" data-sab style="width:44px;padding:0;font-size:20px" aria-label="Adicionar passo">+</button></div>'
   +'<label class="lab">Por quê</label><textarea data-f="why" placeholder="Por que isso importa pra você">'+esc(g.why)+'</textarea>'
   +'<label class="lab">Anotações</label><textarea data-f="notes" placeholder="Ideias, o que tentar, o que aprendeu">'+esc(g.notes)+'</textarea>'
   +'<div class="gact">'+(g.done?'<button class="btn ghost" data-ga="reopen">Reabrir</button>':'<button class="btn ghost" data-ga="done">Concluir meta</button>')+'<button class="btn ghost" data-ga="del">Excluir</button></div></article>';
}
function renderGoals(){
  const act=G.filter(g=>!g.done),dn=G.filter(g=>g.done);
  $('goals').innerHTML=act.length?act.map(goalCard).join(''):'<div class="empty">Nenhuma meta ainda. Escreve uma lá em cima: pode ser algo grande, tipo um objetivo pro ano.</div>';
  $('goalsDone').innerHTML=dn.map(goalCard).join('');
  $('doneBox').hidden=!dn.length;$('doneSum').textContent='Concluídas ('+dn.length+')';
}
const goalsFocused=()=>document.getElementById('v-metas').contains(document.activeElement)&&document.activeElement.tagName!=='BUTTON';
function saveGoals(){if(!demo)persist('goals',()=>({list:G.map(g=>({...g,steps:g.steps.map(s=>({...s}))}))}))}
function gById(el){const a=el.closest('.goal');return a?G.find(g=>g.id===a.dataset.id):null}
for(const box of['goals','goalsDone']){
  $(box).addEventListener('input',ev=>{const f=ev.target.dataset.f;const g=gById(ev.target);if(!f||!g||demo)return;if(f==='by'&&ev.target.value&&!okDate(ev.target.value))return;g[f]=ev.target.value;saveGoals();if(f==='habit'||f==='by'){renderGoals();renderReport()}});
  $(box).addEventListener('click',ev=>{const t=ev.target,g=gById(t);if(!g||demo)return;
    if(t.dataset.st!==undefined){g.steps[+t.dataset.st].d=t.checked;saveGoals();renderGoals();renderReport();return}
    if(t.dataset.sd!==undefined){const k=+t.dataset.sd,s=g.steps.splice(k,1)[0];saveGoals();renderGoals();toast('Passo removido',()=>{g.steps.splice(k,0,s);saveGoals();renderGoals()});return}
    if(t.dataset.sab!==undefined){const inp=t.parentElement.querySelector('[data-sa]');const v=inp.value.trim();if(!v)return;g.steps.push({t:v,d:false});saveGoals();renderGoals();const ni=$(box).querySelector('.goal[data-id="'+CSS.escape(g.id)+'"] [data-sa]');if(ni)ni.focus();return}
    const a=t.dataset.ga;
    if(a==='done'||a==='reopen'){g.done=a==='done';saveGoals();renderGoals();renderReport();if(a==='done')toast('Meta concluída',()=>{g.done=false;saveGoals();renderGoals()})}
    if(a==='del'){const i=G.indexOf(g);G.splice(i,1);saveGoals();renderGoals();renderReport();toast('Meta excluída',()=>{G.splice(i,0,g);saveGoals();renderGoals();renderReport()})}
  });
  $(box).addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.dataset.sa!==undefined){ev.preventDefault();ev.target.nextElementSibling.click()}});
}
function newGoal(){const v=$('gNew').value.trim();if(!v||demo)return;G.unshift({id:uid(),title:v,why:'',notes:'',by:'',habit:'',done:false,steps:[]});$('gNew').value='';saveGoals();renderGoals();renderReport()}
$('gAdd').onclick=newGoal;
$('gNew').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();newGoal()}});

/* ---------- geral ---------- */
function memCard(d,label){const e=E[d];const p=e.ph[0];const txt=e.best||(e.good[0]&&e.good[0].t)||e.note||e.pa||'';
  return '<button class="mem" data-d="'+d+'">'+(p?'<img '+fsrc(p)+' alt="" loading="lazy">':'')+'<div class="mb"><span class="ml">'+esc(label)+'</span><b>'+(e.r?'<i class="dot r'+e.r+'" style="margin-right:6px"></i>':'')+esc(fmtLong(d))+'</b>'+(txt?'<p>'+esc(txt)+'</p>':'')+(e.f.length?'<p class="px">'+esc(e.f.map(fl).join(', '))+'</p>':'')+'</div></button>'}
function renderMem(){
  const od=[[7,'Uma semana atrás'],[30,'Um mês atrás'],[90,'Três meses atrás'],[180,'Seis meses atrás'],[364,'Quase um ano atrás']].map(([n,l])=>[add(TODAY,-n),l]).filter(([d])=>d>=S.start&&has(E[d]));
  $('onDay').innerHTML=od.length?od.map(([d,l])=>memCard(d,l)).join(''):'<div class="empty">Quando você tiver uma semana de registros, aparece aqui o que viveu nesse mesmo dia.</div>';
  const st=Object.keys(E).filter(d=>E[d].star&&inCh(d)).sort().reverse();
  $('stars').innerHTML=st.length?st.map(d=>memCard(d,'Dia '+(diff(d,S.start)+1))).join(''):'<div class="empty">Nenhum ainda. No registro do dia, toca em “Marcar como dia marcante”.</div>';
  const ph=[];for(const d of Object.keys(E).filter(inCh).sort().reverse())for(const id of E[d].ph)ph.push([id,d]);
  $('galSub').textContent=ph.length?ph.length+(ph.length===1?' foto':' fotos')+(demo?' de exemplo':''):'';
  $('gal').innerHTML=ph.length?ph.map(([id,d])=>'<button data-g="'+esc(id)+'" data-d="'+d+'" aria-label="Foto de '+esc(fmtShort(d))+'"><img '+fsrc(id)+' alt="" loading="lazy"><span>'+esc(fmtShort(d))+'</span></button>').join(''):'<div class="empty" style="grid-column:1/-1">As fotos que você colocar nos dias aparecem aqui.</div>';
}
$('onDay').addEventListener('click',ev=>{const b=ev.target.closest('[data-d]');if(b)select(b.dataset.d)});
$('stars').addEventListener('click',ev=>{const b=ev.target.closest('[data-d]');if(b)select(b.dataset.d)});
$('gal').addEventListener('click',ev=>{const b=ev.target.closest('[data-g]');if(b)openLb(b.dataset.g,b.dataset.d)});
function renderAll(withEditor){renderTop();renderMem();renderRev();renderMs();renderLetters();renderRevs();renderGrid();renderBal();renderFeed();renderReport();if(!goalsFocused())renderGoals();if(withEditor)renderEditor();if(!(tab==='treino'&&$('wk').contains(document.activeElement)))renderGym()}
const setStatus=t=>{$('status').textContent=t};
function persist(key,body){
  dirty.add(key);clearTimeout(timers[key]);setStatus('Salvando…');pend[key]=body;
  timers[key]=setTimeout(()=>gravar(key),600);
}
function gravar(key){const body=pend[key];if(!body)return;clearTimeout(timers[key]);delete pend[key];
  if(!col){setStatus('Não deu pra salvar neste navegador.');return}
  const b=body();
  chains[key]=(chains[key]||Promise.resolve()).then(()=>b?col.doc(key).set(b):col.doc(key).delete())
    .then(()=>{if(!pend[key])dirty.delete(key);setStatus('Tudo salvo');espelhar(4000)})
    .catch(err=>setStatus(err&&err.code==='quota_exceeded'?'Acabou o espaço pra salvar.':'Não consegui salvar agora. Tenta mexer de novo daqui a pouco.'));
}
// no Android, guarda também uma cópia do texto na área privada do app (últimos 7 dias de uso)
let espT=null;function espelhar(ms){if(!nativo)return;clearTimeout(espT);espT=setTimeout(()=>{espT=null;if(!demo&&Object.values(E).some(has))try{nativo.espelho(TODAY,backup())}catch(e){}},ms)}
// fechou ou trocou de app antes dos 600ms: salva já o que estava na fila
const salvarJa=()=>{for(const k of Object.keys(pend))gravar(k);if(espT||document.hidden)espelhar(0)};
addEventListener('pagehide',salvarJa);
document.addEventListener('visibilitychange',()=>{if(document.hidden)salvarJa();else{viraDia();vigia()}});
function commit(){
  if(demo)return;const d=sel;
  if(has(cur))E[d]=clean(cur);else delete E[d];
  persist('d'+d,()=>E[d]?clean(E[d]):null);
  renderTop();renderGrid();renderBal();renderFeed();renderReport();if(tab!=='treino')renderGym();
}
function saveSettings(){persist('settings',()=>({start:S.start,habits:S.habits.slice(),why:S.why||'',seen:(S.seen||[]).slice(),rest:S.rest||90}))}
function saveX(k){if(!demo)persist(k,()=>(k==='exmeta'?{map:JSON.parse(JSON.stringify(X[k]))}:{list:JSON.parse(JSON.stringify(X[k]))}))}
const seenUpTo=st=>MS.filter(m=>m<=diff(TODAY,st)+1);
function select(d,keep){if(!inRange(d))return;if(tab!=='diario'&&!keep)location.hash='diario';sel=d;renderGrid();renderEditor();renderGym();if(!keep&&window.innerWidth<960)$('ed').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
let tt;function toast(t,fn){undoFn=fn;$('toastTx').textContent=t.length>40?t.slice(0,40)+'…':t;$('undoBtn').hidden=!fn;$('toast').classList.add('on');clearTimeout(tt);tt=setTimeout(()=>{$('toast').classList.remove('on');undoFn=null},5000)}
$('undoBtn').onclick=()=>{if(undoFn)undoFn();undoFn=null;$('toast').classList.remove('on')};

let tab='diario';
function route(){const h=location.hash.slice(1);tab=['diario','treino','relatorios','metas','memorias'].includes(h)?h:'diario';
  for(const t of['diario','treino','relatorios','metas','memorias'])$('v-'+t).classList.toggle('on',t===tab);
  [...$('tabs').children].forEach(a=>a.dataset.t===tab?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));{const at=$('tabs').querySelector('[aria-current]');$('tabs').scrollLeft=at.offsetLeft-$('tabs').offsetLeft-60}if(S.start&&tab==='relatorios')renderReport()}
addEventListener('hashchange',route);

$('months').addEventListener('click',ev=>{const b=ev.target.closest('button[data-d]');if(b&&!b.disabled)select(b.dataset.d)});
$('feed').addEventListener('click',ev=>{const b=ev.target.closest('button[data-d]');if(b)select(b.dataset.d)});
$('prev').onclick=()=>select(add(sel,-1));
$('next').onclick=()=>select(add(sel,1));
$('rate').addEventListener('click',ev=>{const b=ev.target.closest('button[data-r]');if(!b)return;const r=+b.dataset.r;cur.r=cur.r===r?0:r;[...$('rate').children].forEach(x=>x.setAttribute('aria-pressed',+x.dataset.r===cur.r));commit()});
$('habits').addEventListener('click',ev=>{const b=ev.target.closest('button[data-h]');if(!b)return;const h=S.habits[+b.dataset.h];cur.h[h]=!cur.h[h];b.setAttribute('aria-pressed',!!cur.h[h]);commit()});
function addItem(list){const inp=$(list+'In');const v=inp.value.trim();if(!v)return;cur[list].push({t:v,m:'',w:''});openItem={l:list,k:cur[list].length-1};inp.value='';renderLists();commit();inp.focus()}
for(const l of['good','bad']){
  $(l+'Add').onclick=()=>addItem(l);
  $(l+'In').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();addItem(l)}});
  $(l).addEventListener('click',ev=>{const t=ev.target;
    if(t.dataset.o!==undefined){const k=+t.dataset.o;openItem=openItem&&openItem.l===l&&openItem.k===k?null:{l,k};renderLists();return}
    if(t.dataset.m!==undefined){const x=cur[l][+t.dataset.i];x.m=x.m===t.dataset.m?'':t.dataset.m;renderLists();commit();return}
    const b=t.closest('button[data-k]');if(!b)return;const k=+b.dataset.k,d=sel;const it=cur[l].splice(k,1)[0];openItem=null;renderLists();commit();
    toast('Removido: '+it.t,()=>{if(sel!==d)select(d);cur[l].splice(k,0,it);renderLists();commit()})});
  $(l).addEventListener('input',ev=>{const w=ev.target.dataset.w;if(w===undefined)return;cur[l][+w].w=ev.target.value;commit()});
  $(l).addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.dataset.w!==undefined){ev.preventDefault();openItem=null;renderLists();$(l+'In').focus()}});
}
for(const f of['helped','disliked','note','best'])$(f).addEventListener('input',ev=>{cur[f]=ev.target.value;commit()});
$('feel').addEventListener('click',ev=>{const b=ev.target.closest('button[data-fe]');if(!b)return;const k=b.dataset.fe;cur.f=cur.f.includes(k)?cur.f.filter(x=>x!==k):[...cur.f,k];b.setAttribute('aria-pressed',cur.f.includes(k));commit()});
$('qAns').addEventListener('input',ev=>{cur.pq=curQ();cur.pa=ev.target.value;commit()});
$('qNext').onclick=()=>{if(demo)return;const i=QS.indexOf(curQ());cur.pq=QS[(i+1)%QS.length];$('qTx').textContent=cur.pq;if(cur.pa)commit()};
for(const [f,a,b] of[['sleep',0,24],['kg',20,400]])$(f).addEventListener('input',ev=>{cur[f]=okNum(ev.target.value,a,b);commit()});
$('star').onclick=()=>{cur.star=!cur.star;$('star').setAttribute('aria-pressed',cur.star);$('star').textContent=cur.star?'Dia marcante':'Marcar como dia marcante';commit()};
$('photos').addEventListener('click',ev=>{const t=ev.target;
  if(t.id==='phAdd'){$('phIn').click();return}
  const o=t.closest('[data-po]');if(o){openLb(cur.ph[+o.dataset.po],sel);return}
  if(t.dataset.pi!==undefined){const i=+t.dataset.pi,d=sel,id=cur.ph.splice(i,1)[0];commit();renderPhotos();let undone=false;plat.fotos.marcar(id,true);
    toast('Foto removida',()=>{undone=true;plat.fotos.marcar(id,false);if(sel!==d)select(d);cur.ph.splice(i,0,id);commit();renderPhotos()});
    setTimeout(()=>{if(!undone)plat.fotos.limpar(fotoEmUso).catch(()=>{})},7000)}
});
$('phIn').addEventListener('change',async ev=>{const files=[...ev.target.files].slice(0,Math.max(0,9-cur.ph.length));ev.target.value='';if(demo||!files.length)return;
  const d=sel;uploading+=files.length;renderPhotos();
  for(const f of files){try{const id=await plat.fotos.guardar(f);
      if(sel===d){cur.ph.push(id);commit()}else{const e=clean(E[d]);e.ph.push(id);E[d]=e;persist('d'+d,()=>clean(E[d]));renderAll(false)}}
    catch(e){const c=e&&e.code;setStatus(c==='unsupported_type'?'Esse formato de foto não funcionou. Tenta JPG ou PNG.':c==='quota_exceeded'?'Acabou o espaço pra fotos.':'Não consegui salvar a foto. Tenta de novo.')}
    uploading--;renderPhotos()}
});
function openLb(id,d){lbD=d;fotoGrande(id);$('lbTx').textContent=fmtLong(d)+(E[d]&&E[d].best?' · '+E[d].best:'');$('lb').hidden=false;$('lbClose').focus()}
const fotoEmUso=id=>Object.values(E).some(e=>e.ph&&e.ph.includes(id));
let lbUrl=null,lbId=null;
async function fotoGrande(id){lbId=id;const im=$('lbImg');if(lbUrl){URL.revokeObjectURL(lbUrl);lbUrl=null}if(id.startsWith('demo:')){im.src=demoPic(+id.slice(5));return}im.src=plat.fotos.pronta(id)||plat.fotos.vazia;
  try{const u=await plat.fotos.cheia(id);if(lbId!==id){if(u.startsWith('blob:'))URL.revokeObjectURL(u);return}if(u.startsWith('blob:'))lbUrl=u;im.src=u}catch(e){}}
$('lbClose').onclick=()=>{$('lb').hidden=true};
$('lbDay').onclick=()=>{$('lb').hidden=true;if(lbD)select(lbD)};
addEventListener('keydown',ev=>{if(ev.key==='Escape')$('lb').hidden=true});
$('lb').addEventListener('click',ev=>{if(ev.target.id==='lb')$('lb').hidden=true});
$('find').addEventListener('input',ev=>{q=ev.target.value;feedN=12;renderFeed()});
$('moreBtn').onclick=()=>{feedN+=20;renderFeed()};
$('perSel').addEventListener('click',ev=>{const b=ev.target.closest('button[data-p]');if(!b)return;per=b.dataset.p;renderReport()});
$('aiBtn').onclick=runAI;
/* IA de graça: o app copia o pedido, a pessoa cola no Claude e traz a resposta */
const copiarTx=async t=>{if(nativo)return nativo.copiar(t);try{await navigator.clipboard.writeText(t);return true}catch(e){return false}};
$('aiCopy').onclick=async()=>{if(demo||aiBusy)return;const p=pedidoIA();if(!p)return;
  const ok=await copiarTx(p);$('aiIn').hidden=false;$('aiPaste').hidden=!nativo;
  if(ok)renderAI('Pedido copiado. Abre o Claude, cola numa conversa nova e envia. Depois copia a resposta e volta aqui.');
  else{$('aiIn').value=p;$('aiIn').select();renderAI(nativo?'É texto demais pra copiar de uma vez. Escolhe um período menor.':'Copia o texto abaixo, cola no Claude e depois troca pela resposta.')}};
function receberIA(t){let v=null;const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a)try{v=JSON.parse(t.slice(a,b+1))}catch(e){}
  if(!v||typeof v!=='object'||(typeof v.resumo!=='string'&&!Array.isArray(v.notei))||!guardarIA(v))return false;
  $('aiIn').value='';$('aiIn').hidden=true;$('aiPaste').hidden=true;renderAI();return true}
$('aiIn').addEventListener('input',()=>receberIA($('aiIn').value));
$('aiPaste').onclick=()=>{const t=nativo?nativo.colar():'';if(receberIA(t)){if(nativo)nativo.limparCopia();toast('Análise salva',null)}else renderAI('Não achei a resposta no que você copiou. Copia a resposta inteira do Claude, começando no { e terminando no }.')};
$('aiOut').addEventListener('click',ev=>{if(ev.target.closest('[data-ir]'))abrirAjustes('iaKey')});
$('whyEdit').onclick=()=>{if(demo)return;const b=$('whyBox');b.hidden=!b.hidden;if(!b.hidden){$('whyIn').value=S.why||'';$('whyIn').focus()}};
$('whySave').onclick=()=>{if(demo)return;S.why=$('whyIn').value.trim();$('whyBox').hidden=true;saveSettings();renderTop();renderReport()};

$('startIn').value=$('startIn').max=TODAY;
$('verEx').onclick=()=>{exemplo=true;location.hash='diario';renderAll(true);scrollTo(0,0)};
$('sairEx').onclick=()=>{exemplo=false;renderAll(true);scrollTo(0,0)};
$('jaTenho').onclick=()=>{const b=$('boasImp'),abre=b.hidden;if(abre)b.appendChild($('bkBox'));b.hidden=!abre;$('jaTenho').setAttribute('aria-expanded',abre);if(abre)b.scrollIntoView({block:'nearest'})};
$('beginBtn').onclick=()=>{const v=$('startIn').value;if(!okDate(v)||v>TODAY){$('startIn').value=TODAY;return}
  S={start:v,habits:['Academia'],why:'',seen:seenUpTo(v)};E={};G=[];AIr=null;X={routines:[],reviews:[],letters:[],exmeta:{}};demo=false;sel=TODAY;plat.guardarDeVez();exemplo=false;saveSettings();saveGoals();location.hash='diario';renderAll(true);scrollTo(0,0);if(nativo&&!plat.conf.lembrete)ligarLem(true,'21:00')};
$('startSave').onclick=()=>{const v=$('startEdit').value;if(demo||!okDate(v)||v>TODAY)return;S.start=v;S.seen=[...new Set([...(S.seen||[]),...seenUpTo(v)])];if(!inRange(sel))sel=TODAY;saveSettings();renderAll(true)};
$('habAdd').onclick=()=>{const v=$('habIn').value.trim();if(demo||!v||S.habits.includes(v))return;S.habits.push(v);$('habIn').value='';saveSettings();renderAll(true)};
$('habIn').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();$('habAdd').click()}});
$('habEdit').addEventListener('click',ev=>{const b=ev.target.closest('button[data-x]');if(!b||demo)return;S.habits.splice(+b.dataset.x,1);saveSettings();renderAll(true)});
const backup=()=>JSON.stringify({desafio365:3,settings:S,entries:E,goals:G,extra:X});
$('copyBtn').onclick=async()=>{if(await copiarTx(backup()))$('copyBtn').textContent='Copiado';else{$('impTx').value=backup();$('impTx').select();$('copyBtn').textContent=nativo?'Texto grande: usa o arquivo':'Selecionado: copie com Ctrl+C'}setTimeout(()=>$('copyBtn').textContent='Copiar backup',2500)};
const bkTx=t=>{$('bkTx').textContent=t};
const ehBackup=o=>!!(o&&typeof o==='object'&&o.entries&&typeof o.entries==='object');
const podeImportar=()=>demo||!Object.keys(E).length||confirm('Importar por cima? Os dias do backup substituem os mesmos dias daqui, e metas, rotinas, revisões e cartas ficam como estão no backup.');
async function importar(o){
  if(!col){bkTx('Não deu pra salvar neste navegador.');return false}
  salvarJa();const eraDemo=demo;
  if(demo){E={};G=[];X={routines:[],reviews:[],letters:[],exmeta:{}};AIr=null}
  const s=o.settings;
  if(s&&okDate(s.start))S={start:s.start,habits:Array.isArray(s.habits)&&s.habits.length?s.habits.map(String):['Academia'],why:String(s.why||''),seen:Array.isArray(s.seen)?s.seen.map(Number).filter(n=>MS.includes(n)):seenUpTo(s.start),rest:okNum(s.rest,15,600)||90};
  else if(demo){const st=Object.keys(o.entries).filter(okDate).sort()[0]||TODAY;S={start:st,habits:['Academia'],why:'',seen:seenUpTo(st)}}
  if(o.goals)G=cleanGoals({list:o.goals});
  if(o.extra)for(const k of XK){X[k]=XC[k]({list:o.extra[k]});}
  demo=exemplo=false;const docs={};let n=0;
  for(const d in o.entries){if(!okDate(d))continue;const e=clean(o.entries[d]);if(!has(e))continue;E[d]=e;docs['d'+d]=clean(e);dirty.add('d'+d);n++}
  try{await col.gravar(docs)}catch(e){bkTx(e&&e.code==='quota_exceeded'?'Acabou o espaço pra salvar.':'Não consegui salvar o backup agora. Tenta de novo.');return false}
  finally{for(const k in docs)dirty.delete(k)}
  saveSettings();saveGoals();if(o.extra)for(const k of XK)saveX(k);
  salvarJa();plat.guardarDeVez();
  if(nativo&&!plat.conf.lembrete)ligarLem(true,'21:00');
  const t='Backup importado: '+n+(n===1?' dia.':' dias.');setStatus(t);bkTx(t);
  $('impTx').value='';if(eraDemo||!inRange(sel))sel=TODAY;renderAll(true);if(eraDemo){location.hash='diario';scrollTo(0,0);toast(t,null)}setTimeout(checkModals,600);return true}
$('impBtn').onclick=async()=>{let o=null;try{o=JSON.parse($('impTx').value)}catch(e){}
  if(!ehBackup(o)){$('impBtn').textContent='Texto inválido';setTimeout(()=>$('impBtn').textContent='Importar texto',2000);return}
  if(podeImportar())await importar(o)};
$('zipBtn').onclick=async()=>{if(demo){bkTx('Começa o seu desafio primeiro.');return}
  const b=$('zipBtn'),t0=b.textContent;b.disabled=true;
  try{salvarJa();const itens=[{nome:'backup.json',blob:new Blob([backup()],{type:'application/json'})}];
    for(const d of Object.keys(E).sort())for(const id of E[d].ph||[])if(!id.startsWith('demo:'))itens.push({nome:'fotos/'+d+'_'+id+'.jpg',pegar:()=>plat.fotos.blob(id)});
    let z=await plat.zipar(itens,(i,n)=>{b.textContent='Juntando '+i+' de '+n+'…'});
    const senha=$('bkSenha').value;if(senha){b.textContent='Trancando…';z=await plat.trancar(z,senha)}
    if(await plat.baixar(z,'desafio365-'+TODAY+(senha?'.d365':'.zip')))bkTx('Backup salvo ('+(z.size>1e6?num(z.size/1e6)+' MB':Math.ceil(z.size/1e3)+' KB')+'). '+(senha?'Só abre com essa senha.':'Está sem senha: guarda num lugar seguro, ele tem tudo que você escreveu.'))}
  catch(e){bkTx('Não consegui montar o backup agora.')}
  b.disabled=false;b.textContent=t0};
$('arqBtn').onclick=()=>$('arqIn').click();
$('arqIn').addEventListener('change',async ev=>{let f=ev.target.files[0];if(!f)return;
  const b=$('arqBtn'),t0=b.textContent;b.disabled=true;
  try{let o=null,fs=[];
    if(await plat.temSenha(f)){const senha=$('bkSenha').value;if(!senha){bkTx('Esse backup tem senha. Digita a senha no campo acima e importa de novo.');$('bkSenha').focus();throw{code:'dito'}}b.textContent='Abrindo…';f=await plat.destrancar(f,senha)}
    if(new TextDecoder().decode(await f.slice(0,2).arrayBuffer())==='PK'){const z=await plat.deszipar(f);let j=null;for(const[n,v]of z){if(/(^|[\/])backup\.json$/.test(n))j=v;const m=/(?:^|[\/])\d{4}-\d{2}-\d{2}_([A-Za-z0-9_.-]+)\.(jpe?g|png|webp)$/i.exec(n);if(m&&okId(m[1]))fs.push([m[1],v])}if(j)o=JSON.parse(await j.text())}
    else o=JSON.parse(await f.text());
    if(!ehBackup(o))throw 0;
    if(podeImportar()){let ruins=0;for(let i=0;i<fs.length;i++){b.textContent='Foto '+(i+1)+' de '+fs.length+'…';try{await plat.fotos.guardar(fs[i][1],fs[i][0],true)}catch(e){if(e&&e.code==='quota_exceeded')throw e;ruins++}}
      if(await importar(o)&&fs.length)bkTx($('bkTx').textContent+' '+(fs.length-ruins)+' fotos.'+(ruins?' '+ruins+' não abriram.':''))}}
  catch(e){const c=e&&e.code;if(c!=='dito')bkTx(c==='quota_exceeded'?'Acabou o espaço pra fotos neste aparelho.':c==='senha'?'Senha errada ou arquivo danificado.':'Esse arquivo não é um backup do Desafio 365.')}
  ev.target.value='';b.disabled=false;b.textContent=t0});

function applyData(ns,ne,ng,ai,xs){
  if(ns&&okDate(ns.start)){S={start:ns.start,habits:Array.isArray(ns.habits)?ns.habits.map(String):['Academia'],why:String(ns.why||''),seen:Array.isArray(ns.seen)?ns.seen.map(Number).filter(n=>MS.includes(n)):seenUpTo(ns.start),rest:okNum(ns.rest,15,600)||90};E=ne;G=ng;AIr=ai;X=xs;demo=false}
  else if(Object.keys(ne).length){const st=Object.keys(ne).sort()[0];S={start:st,habits:['Academia'],why:'',seen:seenUpTo(st)};E=ne;G=ng;AIr=ai;X=xs;demo=false}
  else enterDemo();
  if(!inRange(sel))sel=demo?add(TODAY,-1):TODAY;
}
const cleanAIr=v=>v&&okDate(v.at)?{at:v.at,per:['7','30','all'].includes(v.per)?v.per:'30',res:cleanAI(v.res)}:null;
// quem usou o arquivo antigo neste mesmo endereço tinha os dados no localStorage: traz pro banco uma vez
async function trazerAntigo(){let o=null;try{o=JSON.parse(localStorage.getItem('desafio365')||'null')}catch(e){}
  if(!o||(!(o.S&&okDate(o.S.start))&&!(o.E&&Object.keys(o.E).length))||(await banco.chaves('docs')).length)return;
  const docs={};if(o.S&&okDate(o.S.start))docs.settings=o.S;if(o.G)docs.goals={list:cleanGoals({list:o.G})};if(o.AIr)docs.ai=cleanAIr(o.AIr);
  if(o.X)for(const k of XK){const v=XC[k]({list:o.X[k]});docs[k]=k==='exmeta'?{map:v}:{list:v}}
  for(const d in o.E||{})if(okDate(d)&&has(clean(o.E[d])))docs['d'+d]=clean(o.E[d]);
  await col.gravar(docs);localStorage.removeItem('desafio365')}

/* ---------- fala ---------- */
const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
let micBase='';
function setupMics(){if(!dictFn)return;
  for(const id of['note','best','qAns','helped','disliked','goodIn','badIn','whyIn','lTx']){const f=$(id);if(!f||f.parentElement.classList.contains('mw'))continue;
    const w=document.createElement('div');w.className='mw';f.parentNode.insertBefore(w,f);w.appendChild(f);
    const b=document.createElement('button');b.type='button';b.className='mic';b.dataset.mic=id;b.setAttribute('aria-label','Falar em vez de digitar');b.innerHTML=MIC;w.appendChild(b)}
  if(setupMics.ok)return;setupMics.ok=true;
  dictFn.onPartial(({text})=>{if(!micT)return;const f=$(micT);f.value=micBase+(micBase&&text?' ':'')+text});
  dictFn.onFinal(({text})=>{if(!micT||!text)return;const f=$(micT);micBase=micBase+(micBase?' ':'')+text.trim();f.value=micBase;f.dispatchEvent(new Event('input',{bubbles:true}))});
  dictFn.onState(({state,code})=>{if(state!=='listening'){if(code&&code!=='aborted'&&code!=='no-speech')toast(code==='not_granted'?'Libera o microfone pro app':code==='network'?'A voz precisa de internet':code==='language-not-supported'?(nativo?'Baixando a voz em português, tenta já já':'Voz em português indisponível'):'Não consegui ouvir agora',null);document.querySelectorAll('.mic.on').forEach(b=>b.classList.remove('on'));if(micT){const f=$(micT);f.value=micBase;f.dispatchEvent(new Event('input',{bubbles:true}))}micT=null}});
}
document.addEventListener('click',ev=>{const b=ev.target.closest('button[data-mic]');if(!b||!dictFn)return;ev.preventDefault();
  const id=b.dataset.mic;if(micT===id){dictFn.stop().catch(()=>{});return}
  if(micT)dictFn.stop(true);
  if(!dictFn.local&&!plat.conf.voz){if(!confirm(nativo?'Este celular não transcreve a voz sozinho. Quem transcreve é o serviço de voz dele (em geral o do Google), e o áudio pode ir pra internet por lá enquanto você fala. O app não guarda áudio. Quer usar a voz mesmo assim?':'Pra virar texto, a sua voz é processada pelo serviço do próprio navegador (o do Google no Chrome, o da Apple no iPhone). O áudio sai do aparelho só enquanto você fala, e o app não guarda nada dele. Quer usar a voz?'))return;plat.setConf({voz:true})}
  const f=$(id);if(f.closest('fieldset:disabled'))return;micT=id;micBase=f.value.trim();b.classList.add('on');
  dictFn.start().catch(()=>{b.classList.remove('on');if(micT===id)micT=null})});

/* ---------- modal ---------- */
let mdlClose=null;
function showModal(html,ok,onClose){modalOpen=true;$('mdlBody').innerHTML=html;$('mdlOk').textContent=ok||'Fechar';mdlClose=onClose||null;$('mdl').hidden=false;$('mdlOk').focus()}
$('mdlOk').onclick=()=>{$('mdl').hidden=true;modalOpen=false;const f=mdlClose;mdlClose=null;if(f)f();setTimeout(checkModals,300)};
function checkModals(){if(demo||mode==='loading'||modalOpen||!S.start)return;
  const L=X.letters.find(l=>!l.op&&l.open<=TODAY);
  if(L){showModal('<span class="kick">Uma carta chegou</span><h2>De você, pra você</h2><p class="sub" style="margin-top:8px">Escrita em '+esc(parse(L.at).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}))+', no dia '+(diff(L.at,S.start)+1)+' do desafio.</p><div class="letter">'+esc(L.t)+'</div>','Guardar carta',()=>{L.op=TODAY;saveX('letters');renderLetters()});return}
  const n=diff(TODAY,S.start)+1,due=MS.filter(m=>m<=n&&!(S.seen||[]).includes(m));
  if(due.length){const m=Math.max(...due);S.seen=[...new Set([...(S.seen||[]),...due])];saveSettings();showMilestone(m)}
}
function msSummary(m){const en=add(S.start,m-1),days=[];for(let d=S.start;d<=en&&d<=TODAY;d=add(d,1))days.push(d);const A=analyze(days);const g=A.hab.find(h=>h.h===GYM());
  const li=[];li.push('Registrou <b>'+A.reg.length+'</b> de '+days.length+' dias');if(A.rated.length)li.push('Nota média <b>'+num(A.avg)+'</b>');if(g)li.push('<b>'+g.n+'</b> dias de '+esc(g.h.toLowerCase()));
  const tg=A.good[0],tb=A.bad[0];if(tg)li.push('O que mais repetiu de bom: <b>'+esc(tg.t)+'</b> ('+tg.n+'×)');if(tb)li.push('O que mais pesou: <b>'+esc(tb.t)+'</b> ('+tb.n+'×)');
  if(A.slAll.length)li.push('Sono médio <b>'+num(avg(A.slAll))+'h</b>');if(A.kg.length>=2)li.push('Peso de <b>'+num(A.kg[0].v)+'</b> para <b>'+num(A.kg[A.kg.length-1].v)+' kg</b>');
  const wk=days.filter(d=>E[d]&&E[d].w).length;if(wk)li.push('<b>'+wk+'</b> treinos registrados');
  const stars=days.filter(d=>E[d]&&E[d].star).length;if(stars)li.push('<b>'+stars+'</b> '+(stars===1?'dia marcante':'dias marcantes'));
  return '<ul>'+li.map(x=>'<li>'+x+'</li>').join('')+'</ul>'}
function showMilestone(m){const left=365-m;showModal('<span class="kick">Marco alcançado</span><h2>Dia '+m+'!</h2><p>'+(m===365?'Você completou o desafio inteiro. Olha o caminho:':'Olha como foram esses '+m+' dias:')+'</p>'+msSummary(m)+(S.why?'<p class="sub">Seu porquê: “'+esc(S.why)+'”</p>':'')+(left>0?'<p class="sub">Faltam '+left+' dias.</p>':''),'Bora continuar')}
function renderMs(){const n=diff(TODAY,S.start)+1;$('mss').innerHTML=MS.map(m=>m<=n?'<button class="ms ok" data-ms="'+m+'"><b>Dia '+m+'</b><span>ver resumo</span></button>':'<div class="ms"><b>Dia '+m+'</b><span>faltam '+(m-n)+' dias</span></div>').join('')}
$('mss').addEventListener('click',ev=>{const b=ev.target.closest('[data-ms]');if(b)showMilestone(+b.dataset.ms)});

/* ---------- cartas ---------- */
function renderLetters(){const sealed=X.letters.filter(l=>!l.op),open=X.letters.filter(l=>l.op).sort((a,b)=>a.op<b.op?1:-1);
  $('lts').innerHTML=sealed.map(l=>'<div class="lt seal"><b>Carta lacrada</b><p>Escrita em '+esc(fmtShort(l.at))+'. '+(l.sur?'Abre sem aviso.':'Abre em '+esc(fmtShort(l.open))+'.')+'</p></div>').join('')
   +open.map(l=>'<details class="lt"><summary>Carta de '+esc(fmtShort(l.at))+' · aberta em '+esc(fmtShort(l.op))+'</summary><p class="letter">'+esc(l.t)+'</p></details>').join('')
   ||'<p class="sub">Nenhuma carta ainda.</p>';
  $('lfs').disabled=demo}
$('lSeal').onclick=()=>{if(demo)return;const t=$('lTx').value.trim();if(!t){$('lTx').focus();return}
  const w=(document.querySelector('input[name=lwhen]:checked')||{}).value||'sur';let open;
  if(w==='end')open=end();else if(w==='date'){open=$('lDate').value;if(!okDate(open)||open<=TODAY){$('lDate').focus();return}}else open=add(TODAY,90+Math.floor(Math.random()*276));
  X.letters.push({id:uid(),at:TODAY,t,open,sur:w==='sur',op:''});saveX('letters');$('lTx').value='';$('lwBox').open=false;renderLetters();toast('Carta lacrada',null)};

/* ---------- revisão ---------- */
const monday=d=>add(d,-((parse(d).getDay()+6)%7));
function reviewDue(){if(demo||!S.start)return null;const wd=(parse(TODAY).getDay()+6)%7;const wk=wd===6?monday(TODAY):wd<=1?monday(add(TODAY,-7)):null;
  if(!wk||add(wk,6)<S.start||X.reviews.some(r=>r.wk===wk))return null;return wk}
const wkRange=wk=>fmtShort(wk)+' a '+fmtShort(add(wk,6));
function renderRev(){const el=$('revArea');
  if(revOpen){const wk=revOpen,days=[];for(let d=wk;d<=add(wk,6)&&d<=TODAY;d=add(d,1))if(d>=S.start)days.push(d);const A=analyze(days),g=A.hab.find(h=>h.h===GYM()),ex=X.reviews.find(r=>r.wk===wk);
    const bm=MB.map(([k,l])=>({l,n:A.mb[k]||0})).filter(x=>x.n).sort((a,b)=>b.n-a.n)[0];
    const bests=days.filter(d=>E[d]&&E[d].best).map(d=>E[d].best).slice(0,3);
    el.innerHTML='<div class="rev"><h2>Revisão da semana</h2><p class="sub">'+esc(wkRange(wk))+'</p>'
     +'<div class="figs"><div><b>'+A.reg.length+'/'+days.length+'</b><span>dias registrados</span></div><div><b>'+(A.rated.length?num(A.avg):'–')+'</b><span>nota média</span></div><div><b>'+(g?g.n:0)+'</b><span>dias de '+esc((GYM()||'hábito').toLowerCase())+'</span></div><div><b>'+days.filter(d=>E[d]&&E[d].w).length+'</b><span>treinos</span></div></div>'
     +(bests.length?'<p><b>Melhores momentos:</b> '+bests.map(esc).join(' · ')+'</p>':'')
     +(A.good[0]?'<p><b>Mais repetiu de bom:</b> '+esc(A.good[0].t)+'</p>':'')+(A.bad[0]?'<p><b>Mais pesou:</b> '+esc(A.bad[0].t)+(bm?' · motivo mais comum: '+esc(bm.l.toLowerCase()):'')+'</p>':'')
     +['O que foi melhor nessa semana?','O que te travou, e por quê?','Uma coisa pra focar na próxima semana'].map((q,i)=>'<label class="lab" for="rv'+i+'">'+q+'</label><textarea id="rv'+i+'">'+esc(ex?ex.a[i]||'':'')+'</textarea>').join('')
     +'<div class="row"><button class="btn" id="rvSave">Concluir revisão</button><button class="btn ghost" id="rvLater">Depois</button></div></div>';
    $('rvSave').onclick=()=>{const a=[0,1,2].map(i=>$('rv'+i).value.trim());X.reviews=X.reviews.filter(r=>r.wk!==wk);X.reviews.push({wk,at:TODAY,a});saveX('reviews');revOpen=null;renderAll(false);toast('Revisão salva',null)};
    $('rvLater').onclick=()=>{revOpen=null;renderRev()};return}
  const due=reviewDue();
  el.innerHTML=due?'<div class="revban"><div><b>Hora da revisão da semana</b><p>'+esc(wkRange(due))+' · 3 perguntas, uns 2 minutos.</p></div><button class="btn" id="rvGo">Fazer agora</button></div>':'';
  if(due)$('rvGo').onclick=()=>{revOpen=due;renderRev()};
}
function renderRevs(){const l=X.reviews.slice().sort((a,b)=>a.wk<b.wk?1:-1);
  $('revs').innerHTML=l.length?l.map(r=>'<div class="lt"><b>'+esc(wkRange(r.wk))+'</b>'+['Melhor','Travou','Foco'].map((h,i)=>r.a[i]?'<p><b>'+h+':</b> '+esc(r.a[i])+'</p>':'').join('')+'</div>').join(''):'<p class="sub">Aos domingos aparece no Diário o convite pra revisão.</p>';
  $('revNow').disabled=demo}
$('revNow').onclick=()=>{if(demo)return;revOpen=monday(TODAY)<S.start?S.start:monday(TODAY);location.hash='diario';renderRev();setTimeout(()=>$('revArea').scrollIntoView({block:'start'}),50)};

/* ---------- treino ---------- */
const GYM=()=>S.habits.find(h=>/academia|treino|gym|muscula/i.test(h))||S.habits[0]||'';
const LIB=[['Supino reto','Peito'],['Supino inclinado','Peito'],['Supino inclinado com halteres','Peito'],['Supino com halteres','Peito'],['Supino declinado','Peito'],['Crucifixo','Peito'],['Crossover','Peito'],['Peck deck','Peito'],['Flexão','Peito'],
['Puxada frontal','Costas'],['Barra fixa','Costas'],['Remada curvada','Costas'],['Remada baixa','Costas'],['Remada unilateral','Costas'],['Remada cavalinho','Costas'],['Pulldown','Costas'],['Levantamento terra','Costas'],
['Desenvolvimento','Ombros'],['Desenvolvimento com halteres','Ombros'],['Elevação lateral','Ombros'],['Elevação frontal','Ombros'],['Crucifixo inverso','Ombros'],['Encolhimento','Ombros'],
['Rosca direta','Bíceps'],['Rosca alternada','Bíceps'],['Rosca martelo','Bíceps'],['Rosca scott','Bíceps'],['Rosca concentrada','Bíceps'],
['Tríceps corda','Tríceps'],['Tríceps pulley','Tríceps'],['Tríceps testa','Tríceps'],['Tríceps francês','Tríceps'],['Mergulho','Tríceps'],
['Agachamento livre','Pernas'],['Agachamento búlgaro','Pernas'],['Agachamento smith','Pernas'],['Hack','Pernas'],['Leg press','Pernas'],['Cadeira extensora','Pernas'],['Mesa flexora','Pernas'],['Cadeira flexora','Pernas'],['Stiff','Pernas'],['Afundo','Pernas'],
['Elevação pélvica','Glúteos'],['Cadeira abdutora','Glúteos'],['Glúteo no cabo','Glúteos'],['Panturrilha','Panturrilha'],['Panturrilha sentado','Panturrilha'],
['Abdominal','Abdômen'],['Abdominal infra','Abdômen'],['Prancha','Abdômen'],
['Esteira','Cardio'],['Bicicleta','Cardio'],['Elíptico','Cardio'],['Escada','Cardio'],['Corrida','Cardio'],['Pular corda','Cardio']];
const GROUPS=['Peito','Costas','Ombros','Bíceps','Tríceps','Pernas','Glúteos','Panturrilha','Abdômen','Cardio','Outro'];
const libG=n=>{const k=norm(n),f=LIB.find(x=>norm(x[0])===k);return f?f[1]:''};
const meta=n=>X.exmeta[norm(n)]||{};
const grpOf=n=>{const g=meta(n).g;return GROUPS.includes(g)?g:libG(n)||'Outro'};
const isC=n=>grpOf(n)==='Cardio';
const work=y=>y.t!=='a'&&y.kg!=null&&y.r;
const e1=(kg,r)=>kg*(1+r/30);
const kgf=v=>v==null?'':v%1?num(v):String(v);
const fmtT=sec=>{sec=Math.max(0,Math.round(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;return h?h+':'+pad(m)+':'+pad(x):m+':'+pad(x)};
const durTxt=ms=>{const m=Math.round(ms/60000);return m>=60?Math.floor(m/60)+'h'+pad(m%60):m+' min'};
const setStr=y=>y.min!=null||y.km!=null?(y.min!=null?y.min+' min':'')+(y.km!=null?' '+kgf(y.km)+' km':''):y.kg!=null||y.r!=null?(y.kg!=null?kgf(y.kg):'–')+'×'+(y.r??'–'):'';
function exHist(){const m=new Map();for(const d of Object.keys(E).sort()){const w=E[d].w;if(!w)continue;for(const x of w.ex){const k=norm(x.n);if(!k||isC(x.n))continue;const ss=x.s.filter(work);if(!ss.length)continue;const o=m.get(k)||{n:x.n,ses:[]};o.n=x.n;o.ses.push({d,s:ss});m.set(k,o)}}return m}
function lastSes(n,before){const k=norm(n);if(!k)return null;const ds=Object.keys(E).filter(d=>d<before&&E[d].w).sort().reverse();for(const d of ds){const x=E[d].w.ex.find(z=>norm(z.n)===k);if(x&&x.s.some(y=>y.kg!=null||y.r!=null||y.min!=null))return{d,s:x.s}}return null}
function bestBefore(n,before){let b=0;for(const d of Object.keys(E)){if(d>=before||!E[d].w)continue;for(const x of E[d].w.ex)if(norm(x.n)===norm(n))for(const y of x.s)if(work(y))b=Math.max(b,e1(y.kg,y.r))}return b}
const setTxt=s=>{const w=s.filter(work);if(!w.length)return s.map(setStr).filter(Boolean).join(', ');const b=w.reduce((a,y)=>y.kg>a.kg||(y.kg===a.kg&&y.r>a.r)?y:a,w[0]);return w.length+(w.length===1?' série':' séries')+' · melhor '+kgf(b.kg)+' kg × '+b.r};
const rtOf=w=>w&&X.routines.find(r=>norm(r.n)===norm(w.n));
function suggest(x){if(isC(x.n))return null;const l=lastSes(x.n,sel);if(!l)return null;const ws=l.s.filter(work);if(!ws.length)return null;
  const rt=rtOf(cur.w),tg=rt&&rt.ex.find(e=>norm(e.n)===norm(x.n)),top=tg?tg.rmax:12;
  const kgTop=Math.max(...ws.map(y=>y.kg)),atTop=ws.filter(y=>y.kg===kgTop);
  if(atTop.every(y=>y.r>=top)){const inc=kgTop>=20?2.5:1;return{kg:Math.round((kgTop+inc)*10)/10,txt:'Da última vez você fechou '+top+' reps em todas com '+kgf(kgTop)+' kg. Tenta '+kgf(kgTop+inc)+' kg.'}}
  return null}

let restEnd=0,restTot=0,actx=null,restDoneT=null;
function beep(){try{if(!actx)return;const t=actx.currentTime;for(let i=0;i<3;i++){const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,t+i*.25);g.gain.exponentialRampToValueAtTime(.3,t+i*.25+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.25+.18);o.connect(g);g.connect(actx.destination);o.start(t+i*.25);o.stop(t+i*.25+.2)}}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
function startRest(sec){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(e){}if(nativo)nativo.telaLigada(true);restTot=sec;restEnd=Date.now()+sec*1000;clearTimeout(restDoneT);$('restBar').classList.remove('done');$('restBar').hidden=false;document.body.classList.add('resting');tick()}
function stopRest(){if(nativo)nativo.telaLigada(false);restEnd=0;$('restBar').hidden=true;$('restBar').classList.remove('done');document.body.classList.remove('resting')}
function tick(){
  if(restEnd){const left=(restEnd-Date.now())/1000;
    if(left<=0){restEnd=0;$('restT').textContent='0:00';$('restBar').classList.add('done');$('restP').style.transform='scaleX(0)';beep();restDoneT=setTimeout(stopRest,4000)}
    else{$('restT').textContent=fmtT(Math.ceil(left));$('restP').style.transform='scaleX('+(left/restTot)+')'}}
  const c=$('wClock');if(c&&cur.w&&cur.w.st&&!cur.w.en)c.textContent=fmtT((Date.now()-cur.w.st)/1000);
}
const tickI=setInterval(tick,250);
$('restBar').addEventListener('click',ev=>{const b=ev.target.closest('[data-rb]');if(!b)return;const v=b.dataset.rb;if(v==='skip'){stopRest();return}if(!restEnd)return;restEnd+=+v*1000;restTot=Math.max(restTot,(restEnd-Date.now())/1000);tick()});

const blankSet=c=>({kg:null,r:null,d:false,t:'',min:null,km:null});
function setRow(x,xi,y,si,prev,pr){const c=isC(x.n),id=xi+'.'+si,p=prev&&prev[si];
  return '<tr class="'+(y.d?'done':'')+(pr?' rec':'')+'"><td><button class="stb t-'+(y.t||'n')+'" data-ty="'+id+'" title="'+esc(TN[y.t||''])+'" aria-label="Tipo da série: '+esc(TN[y.t||''])+'">'+(y.t?TT[y.t]:si+1-x.s.slice(0,si).filter(z=>z.t==='a').length)+'</button></td>'
   +'<td class="pv">'+(p&&setStr(p)?'<button class="prev" data-pv="'+id+'" title="Usar">'+esc(setStr(p))+'</button>':'<span class="prev">–</span>')+'</td>'
   +(c?'<td><input type="number" inputmode="decimal" min="0" step="1" data-sm="'+id+'" value="'+(y.min??'')+'" aria-label="Minutos"></td><td><input type="number" inputmode="decimal" min="0" step="0.1" data-sq="'+id+'" value="'+(y.km??'')+'" aria-label="Quilômetros"></td>'
      :'<td><input type="number" inputmode="decimal" step="0.5" min="0" data-sk="'+id+'" value="'+(y.kg??'')+'" aria-label="Carga em kg"></td><td><input type="number" inputmode="numeric" min="0" data-sr="'+id+'" value="'+(y.r??'')+'" aria-label="Repetições"></td>')
   +'<td><input type="checkbox" data-sd="'+id+'"'+(y.d?' checked':'')+' aria-label="Série feita"></td><td><button class="x" data-sx="'+id+'" aria-label="Remover série">×</button></td></tr>'}
const TT={a:'A',d:'D',f:'F'},TN={'':'Normal','a':'Aquecimento','d':'Drop set','f':'Até a falha'};
let noteOpen=-1;
function exCard(x,xi,n){const c=isC(x.n),l=x.n?lastSes(x.n,sel):null,b0=x.n&&!c?bestBefore(x.n,sel):0,sg=x.n?suggest(x):null,m=x.n?meta(x.n):{},rt=rtOf(cur.w),tg=rt&&rt.ex.find(e=>norm(e.n)===norm(x.n));
  return '<div class="exc" data-xi="'+xi+'"><div class="exh"><label class="sr" for="xn'+xi+'">Exercício</label><input class="exn" id="xn'+xi+'" data-xn="'+xi+'" list="exList" value="'+esc(x.n)+'" placeholder="Exercício" autocomplete="off">'
   +'<button class="x" data-xu="'+xi+'" aria-label="Subir"'+(xi?'':' disabled')+'>↑</button><button class="x" data-xw="'+xi+'" aria-label="Descer"'+(xi<n-1?'':' disabled')+'>↓</button><button class="x" data-xd="'+xi+'" aria-label="Remover exercício">×</button></div>'
   +'<div class="exm">'+(x.n?'<select data-xg="'+xi+'" aria-label="Grupo muscular">'+GROUPS.map(g=>'<option'+(g===grpOf(x.n)?' selected':'')+'>'+g+'</option>').join('')+'</select>':'')
   +(tg&&!c?'<span>Meta '+tg.sets+' × '+tg.rmin+(tg.rmax!==tg.rmin?'–'+tg.rmax:'')+'</span>':'')
   +(l?'<span>Última vez ('+esc(fmtShort(l.d))+'): '+esc(setTxt(l.s))+'</span>':'')
   +(x.n?'<button class="lnk" data-nt="'+xi+'">'+(m.note?'editar nota':'+ nota')+'</button>':'')+'</div>'
   +(noteOpen===xi?'<div class="exnote"><textarea data-nx="'+xi+'" placeholder="Ex.: banco no 3º furo, pegada fechada" aria-label="Nota do exercício">'+esc(m.note||'')+'</textarea></div>':m.note?'<p class="exnote">'+esc(m.note)+'</p>':'')
   +(sg?'<div class="sug"><span>'+esc(sg.txt)+'</span><button data-sg="'+xi+'" data-kg="'+sg.kg+'">Usar '+esc(kgf(sg.kg))+' kg</button></div>':'')
   +'<table class="sets"><thead><tr><th>Série</th><th>Anterior</th><th>'+(c?'min':'kg')+'</th><th>'+(c?'km':'Reps')+'</th><th>Feito</th><th></th></tr></thead><tbody>'
   +(()=>{let run=b0;return x.s.map((y,si)=>{let pr=false;if(y.d&&work(y)&&b0>0){const v=e1(y.kg,y.r);if(v>run+1e-9){pr=true;run=v}}return setRow(x,xi,y,si,l&&l.s,pr)}).join('')})()
   +'</tbody></table><div class="wact"><button class="btn ghost" data-sa="'+xi+'">+ Série</button></div></div>'}
function wSummary(w){let sets=0,vol=0,prs=[];const anyD=w.ex.some(x=>x.s.some(y=>y.d));for(const x of w.ex){if(!x.n)continue;const b0=isC(x.n)?0:bestBefore(x.n,sel);let best=0;for(const y of x.s){if(y.d)sets++;if(work(y)&&(y.d||!anyD)){vol+=y.kg*y.r;if(y.d)best=Math.max(best,e1(y.kg,y.r))}}if(b0>0&&best>b0+1e-9){const t=x.s.filter(y=>y.d&&work(y)).reduce((a,y)=>e1(y.kg,y.r)>e1(a.kg,a.r)?y:a);prs.push(x.n+': '+kgf(t.kg)+' kg × '+t.r)}}return{sets,vol,prs}}
function renderGym(){
  const i=diff(sel,S.start)+1;$('tDate').textContent=sel===TODAY?'Treino de hoje':fmtLong(sel);$('tSub').textContent=(sel===TODAY?fmtLong(sel)+' · ':'')+'Dia '+i+' de 365';
  $('tPrev').disabled=sel<=S.start;$('tNext').disabled=sel>=TODAY||sel>=end();$('tLock').classList.toggle('on',demo);$('tfs').disabled=demo;
  const names=new Set(LIB.map(x=>x[0]));for(const o of exHist().values())names.add(o.n);for(const r of X.routines)for(const e of r.ex)names.add(e.n);
  $('exList').innerHTML=[...names].map(n=>'<option value="'+esc(n)+'">').join('');
  const w=cur.w;
  if(!w){const last=Object.keys(E).filter(d=>d<sel&&E[d].w).sort().pop();
    $('wk').innerHTML='<p class="sub">'+(sel===TODAY?'Bora treinar? Escolhe como começar.':'Nenhum treino registrado nesse dia.')+'</p><div class="wk-start">'+X.routines.map(r=>'<button data-rs="'+esc(r.id)+'" class="main"><b>'+esc(r.n)+'</b><span>'+esc(r.ex.slice(0,3).map(e=>e.n).join(', ')+(r.ex.length>3?'…':''))+'</span></button>').join('')
      +(last?'<button data-rl="'+last+'"><b>Repetir último</b><span>'+esc(E[last].w.n||'Treino')+' · '+esc(fmtShort(last))+'</span></button>':'')
      +'<button data-rf><b>Treino livre</b><span>Monta na hora</span></button></div>';renderSide();return}
  const sm=wSummary(w),live=w.st&&!w.en;
  $('wk').innerHTML='<label class="sr" for="wName">Nome do treino</label><input class="wname" id="wName" value="'+esc(w.n)+'" placeholder="Nome do treino">'
   +'<div class="wstat">'+(live?'<span class="live">Em andamento <b id="wClock">'+fmtT((Date.now()-w.st)/1000)+'</b></span>':w.st&&w.en?'<span>Duração <b>'+durTxt(w.en-w.st)+'</b></span>':'')
   +'<span><b>'+sm.sets+'</b> séries feitas</span>'+(sm.vol?'<span><b>'+(sm.vol>=1000?num(sm.vol/1000)+' t':Math.round(sm.vol)+' kg')+'</b> de volume</span>':'')
   +'<label>Descanso <select id="wRest">'+[30,45,60,90,120,150,180,240].map(v=>'<option value="'+v+'"'+(v===(S.rest||90)?' selected':'')+'>'+fmtT(v)+'</option>').join('')+'</select></label></div>'
   +w.ex.map((x,xi)=>exCard(x,xi,w.ex.length)).join('')
   +'<div class="wact"><button class="btn" id="wAddEx">+ Exercício</button>'+(live?'<button class="btn" id="wFin" style="background:var(--r5);color:#fff">Finalizar treino</button>':'')+'<button class="btn ghost" id="wSaveRt">Salvar como rotina</button><button class="btn ghost" id="wDel">Apagar treino</button></div>'
   +'<label class="lab" for="wNote">Como foi o treino</label><textarea class="fld" id="wNote" placeholder="Energia, dor, o que mudar na próxima">'+esc(w.note)+'</textarea>';
  renderSide();
}
let exPts=[],rtEdit=null,rtDraft=null;
function renderSide(){
  const H=[...exHist().values()].map(o=>{let best=null,b1=0;for(const se of o.ses)for(const y of se.s){if(!best||y.kg>best.kg||(y.kg===best.kg&&y.r>best.r))best=y;b1=Math.max(b1,e1(y.kg,y.r))}return{n:o.n,best,b1,last:o.ses[o.ses.length-1].d,c:o.ses.length,ses:o.ses}}).sort((a,b)=>a.last<b.last?1:-1);
  if((!exSel||!H.some(h=>h.n===exSel))&&H[0])exSel=H[0].n;
  $('prs').innerHTML=H.length?'<thead><tr><th>Exercício</th><th class="n">Melhor</th><th class="n">1RM est.</th><th class="n">Vezes</th></tr></thead><tbody>'+H.map(h=>'<tr data-ex="'+esc(h.n)+'" class="'+(h.n===exSel?'on':'')+'" tabindex="0"><td>'+esc(h.n)+'</td><td class="n">'+kgf(h.best.kg)+' kg × '+h.best.r+'</td><td class="n">'+num(h.b1)+' kg</td><td class="n">'+h.c+'</td></tr>').join('')+'</tbody>':'<tbody><tr><td class="sub">Seus recordes aparecem aqui depois do primeiro treino.</td></tr></tbody>';
  const o=H.find(h=>h.n===exSel);exPts=o?o.ses.map(se=>({d:se.d,v:Math.max(...se.s.map(y=>y.kg))})):[];
  $('exw').hidden=exPts.length<2;drawLine($('exSvg'),exPts,'kg');
  $('exSub').textContent=o?(exPts.length>=2?o.n+': carga máxima de '+kgf(exPts[0].v)+' para '+kgf(exPts[exPts.length-1].v)+' kg.':o.n+': registra mais treinos pra ver a linha.'):'';
  $('exHistL').innerHTML=o?o.ses.slice(-6).reverse().map(se=>{const raw=E[se.d].w.ex.find(x=>norm(x.n)===norm(o.n));return'<li><b>'+esc(fmtShort(se.d))+'</b><span>'+esc((raw?raw.s:se.s).filter(y=>y.t!=='a').map(y=>setStr(y)+(y.t==='f'?' falha':y.t==='d'?' drop':'')).join(', '))+'</span></li>'}).join(''):'';
  // semana: séries por grupo
  const wk=monday(TODAY),pw=add(wk,-7),cnt=(a,b)=>{const m={};let n=0;for(let d=a;d<=b;d=add(d,1)){const w=E[d]&&E[d].w;if(!w)continue;n++;for(const x of w.ex){if(!x.n)continue;const g=grpOf(x.n);const k=x.s.filter(y=>y.t!=='a'&&(y.d||y.kg!=null||y.min!=null)).length;if(k)m[g]=(m[g]||0)+k}}return{m,n}};
  const cw=cnt(wk,add(wk,6)),cp=cnt(pw,add(pw,6));
  $('wkSub').textContent=cw.n+(cw.n===1?' treino':' treinos')+' desde segunda (semana passada: '+cp.n+'). Séries por grupo muscular:';
  const gs=GROUPS.filter(g=>cw.m[g]||cp.m[g]),mx=Math.max(1,...gs.map(g=>Math.max(cw.m[g]||0,cp.m[g]||0)));
  $('mus').innerHTML=gs.length?gs.map(g=>'<div class="hrow"><span class="nm">'+g+'</span><div class="track"><i style="width:'+((cw.m[g]||0)/mx*100)+'%;background:var(--blue)"></i></div><span class="v">'+(cw.m[g]||0)+' <span class="px">/ '+(cp.m[g]||0)+'</span></span></div>').join('')+'<p class="sub" style="margin-top:4px">Esta semana / semana passada.</p>':'<p class="sub">Nenhum treino nas últimas duas semanas.</p>';
  const weeks=[];for(let k=7;k>=0;k--){const s0=monday(add(TODAY,-7*k));let v=0,c=0;for(let d=s0;d<=add(s0,6);d=add(d,1)){const w=E[d]&&E[d].w;if(!w)continue;c++;for(const x of w.ex)for(const y of x.s)if(work(y))v+=y.kg*y.r}weeks.push({wk:s0,v,c})}
  const vx=Math.max(1,...weeks.map(w=>w.v));
  $('vol').innerHTML=weeks.map(w=>'<div title="'+esc(wkRange(w.wk))+' · '+w.c+' treinos"><span>'+(w.v?(w.v>=1000?num(w.v/1000)+'t':Math.round(w.v)):'')+'</span><i style="height:'+(w.v/vx*85)+'%"></i></div>').join('');
  $('volx').innerHTML=weeks.map(w=>'<span>'+esc(fmtShort(w.wk).replace(' de ',' '))+'</span>').join('');
  renderRts();
}
function renderRts(){
  $('rts').innerHTML=X.routines.map(r=>{
    if(rtEdit===r.id)return rteHTML();
    return '<div class="rtc"><b>'+esc(r.n)+'</b><ul>'+r.ex.map(e=>'<li>'+esc(e.n)+(isC(e.n)?'':' · '+e.sets+' × '+e.rmin+(e.rmax!==e.rmin?'–'+e.rmax:''))+'</li>').join('')+'</ul><div class="row"><button class="btn ghost" data-re="'+esc(r.id)+'">Editar</button><button class="btn ghost" data-rd="'+esc(r.id)+'">Apagar</button></div></div>'}).join('')
   +(rtEdit==='new'?rteHTML():'')+(X.routines.length||rtEdit?'':'<p class="sub">Nenhuma rotina ainda.</p>');
  $('rtNew').hidden=!!rtEdit||demo;
}
function rteHTML(){const d=rtDraft;return '<div class="rtc rte"><label class="sr" for="rtN">Nome da rotina</label><input class="rn" id="rtN" value="'+esc(d.n)+'" placeholder="Nome. Ex.: Treino A · Peito">'
  +'<div class="rth"><span>Exercício</span><span>Séries</span><span>Reps mín</span><span>Reps máx</span><span></span></div>'
  +d.ex.map((e,i)=>'<div class="rtrow"><input list="exList" data-rn="'+i+'" value="'+esc(e.n)+'" placeholder="Exercício" aria-label="Exercício"><input type="number" min="1" max="10" data-rk="sets.'+i+'" value="'+e.sets+'" aria-label="Séries"><input type="number" min="1" max="100" data-rk="rmin.'+i+'" value="'+e.rmin+'" aria-label="Repetições mínimas"><input type="number" min="1" max="100" data-rk="rmax.'+i+'" value="'+e.rmax+'" aria-label="Repetições máximas"><span><button class="x" data-ru="'+i+'" aria-label="Subir">↑</button><button class="x" data-rx="'+i+'" aria-label="Remover">×</button></span></div>').join('')
  +'<div class="row" style="margin-top:8px"><button class="btn ghost" id="rtAddE">+ Exercício</button><button class="btn" id="rtSave">Salvar rotina</button><button class="btn ghost" id="rtCancel">Cancelar</button></div></div>'}
$('rtNew').onclick=()=>{if(demo)return;rtEdit='new';rtDraft={id:uid(),n:'',ex:[{n:'',sets:3,rmin:8,rmax:12}]};renderRts();const f=$('rtN');if(f)f.focus()};
$('rts').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||demo)return;
  if(b.dataset.re!==undefined){const r=X.routines.find(x=>x.id===b.dataset.re);if(!r)return;rtEdit=r.id;rtDraft=JSON.parse(JSON.stringify(r));renderRts();return}
  if(b.dataset.rd!==undefined){const i=X.routines.findIndex(r=>r.id===b.dataset.rd);if(i<0)return;const r=X.routines.splice(i,1)[0];saveX('routines');renderGym();toast('Rotina apagada',()=>{X.routines.splice(i,0,r);saveX('routines');renderGym()});return}
  if(!rtDraft)return;
  if(b.dataset.ru!==undefined){const i=+b.dataset.ru;if(i>0){const t=rtDraft.ex[i];rtDraft.ex[i]=rtDraft.ex[i-1];rtDraft.ex[i-1]=t;renderRts()}return}
  if(b.dataset.rx!==undefined){rtDraft.ex.splice(+b.dataset.rx,1);renderRts();return}
  if(b.id==='rtAddE'){rtDraft.ex.push({n:'',sets:3,rmin:8,rmax:12});renderRts();const f=document.querySelector('[data-rn="'+(rtDraft.ex.length-1)+'"]');if(f)f.focus();return}
  if(b.id==='rtCancel'){rtEdit=null;rtDraft=null;renderRts();return}
  if(b.id==='rtSave'){const d=rtDraft;d.n=d.n.trim()||'Treino';d.ex=d.ex.filter(e=>e.n.trim()).map(e=>({n:e.n.trim(),sets:Math.max(1,Math.min(10,Math.round(e.sets)||3)),rmin:e.rmin||8,rmax:Math.max(e.rmin||8,e.rmax||12)}));if(!d.ex.length)return;
    const i=X.routines.findIndex(r=>r.id===d.id);if(i>=0)X.routines[i]=d;else X.routines.push(d);saveX('routines');rtEdit=null;rtDraft=null;renderGym();toast('Rotina salva',null)}
});
$('rts').addEventListener('input',ev=>{const t=ev.target;if(!rtDraft)return;if(t.id==='rtN'){rtDraft.n=t.value;return}if(t.dataset.rn!==undefined){rtDraft.ex[+t.dataset.rn].n=t.value;return}if(t.dataset.rk){const[k,i]=t.dataset.rk.split('.');rtDraft.ex[+i][k]=okNum(t.value,1,100)}});
$('prs').addEventListener('click',ev=>{const t=ev.target.closest('tr[data-ex]');if(!t)return;exSel=t.dataset.ex;renderSide()});
$('prs').addEventListener('keydown',ev=>{if(ev.key==='Enter'){const t=ev.target.closest('tr[data-ex]');if(t){exSel=t.dataset.ex;renderSide()}}});
const exRO=new ResizeObserver(()=>drawLine($('exSvg'),exPts,'kg'));exRO.observe($('exSvg'));

function fromLast(n,cnt){const l=lastSes(n,sel);if(l){const ws=l.s.map(y=>({kg:y.kg,r:y.r,d:false,t:y.t,min:y.min,km:y.km}));return ws}return[...Array(cnt||1)].map(blankSet)}
function startW(ex,n){cur.w={n,note:'',ex,st:sel===TODAY?Date.now():0,en:0};const g=GYM();if(g)cur.h[g]=true;commit();renderGym();renderEditor()}
const sIdx=id=>id.split('.').map(Number);
$('wk').addEventListener('click',ev=>{if(demo)return;const t=ev.target,b=t.closest('button');const w=cur.w;
  if(b&&b.dataset.rs!==undefined){const r=X.routines.find(x=>x.id===b.dataset.rs);if(!r)return;startW(r.ex.map(e=>{let s=fromLast(e.n,e.sets);const nw=s.filter(y=>y.t!=='a').length;if(!isC(e.n)&&nw<e.sets){const l=s.filter(y=>y.t!=='a').pop()||blankSet();for(let k=nw;k<e.sets;k++)s.push({...l,d:false})}return{n:e.n,s}}),r.n);return}
  if(b&&b.dataset.rl!==undefined){const p=E[b.dataset.rl].w;startW(p.ex.map(x=>({n:x.n,s:x.s.map(y=>({...y,d:false}))})),p.n);return}
  if(b&&b.dataset.rf!==undefined){startW([{n:'',s:[blankSet()]}],'Treino');setTimeout(()=>{const f=$('xn0');if(f)f.focus()},30);return}
  if(!w)return;
  if(t.dataset.sd!==undefined){const[a,c]=sIdx(t.dataset.sd),y=w.ex[a].s[c];y.d=t.checked;
    if(y.d&&!isC(w.ex[a].n)&&y.kg==null&&y.r==null){const l=lastSes(w.ex[a].n,sel),p=l&&l.s[c];if(p){y.kg=p.kg;y.r=p.r}}
    if(!w.st&&sel===TODAY&&y.d)w.st=Date.now();
    commit();const xi=a;const card=t.closest('.exc');card.outerHTML=exCard(w.ex[xi],xi,w.ex.length);
    if(y.d){startRest(S.rest||90);const b0=bestBefore(w.ex[a].n,sel);if(work(y)&&b0>0&&e1(y.kg,y.r)>b0+1e-9)toast('Recorde no '+w.ex[a].n+'!',null)}
    updStat();return}
  if(!b)return;
  if(b.dataset.ty!==undefined){const[a,c]=sIdx(b.dataset.ty),y=w.ex[a].s[c],o=['','a','d','f'];y.t=o[(o.indexOf(y.t)+1)%4];commit();b.closest('.exc').outerHTML=exCard(w.ex[a],a,w.ex.length);return}
  if(b.dataset.pv!==undefined){const[a,c]=sIdx(b.dataset.pv),l=lastSes(w.ex[a].n,sel),p=l&&l.s[c];if(!p)return;Object.assign(w.ex[a].s[c],{kg:p.kg,r:p.r,min:p.min,km:p.km});commit();b.closest('.exc').outerHTML=exCard(w.ex[a],a,w.ex.length);return}
  if(b.dataset.sg!==undefined){const a=+b.dataset.sg,kg=Number(b.dataset.kg);for(const y of w.ex[a].s)if(!y.d&&y.t!=='a')y.kg=kg;commit();b.closest('.exc').outerHTML=exCard(w.ex[a],a,w.ex.length);return}
  if(b.dataset.sa!==undefined){const x=w.ex[+b.dataset.sa],l=x.s[x.s.length-1];x.s.push(l?{...l,d:false,t:l.t==='a'?'':l.t}:blankSet());commit();renderGym();return}
  if(b.dataset.sx!==undefined){const[a,c]=sIdx(b.dataset.sx);w.ex[a].s.splice(c,1);if(!w.ex[a].s.length)w.ex[a].s.push(blankSet());commit();renderGym();return}
  if(b.dataset.xu!==undefined||b.dataset.xw!==undefined){const i=+(b.dataset.xu??b.dataset.xw),j=b.dataset.xu!==undefined?i-1:i+1;if(j<0||j>=w.ex.length)return;const tmp=w.ex[i];w.ex[i]=w.ex[j];w.ex[j]=tmp;noteOpen=-1;commit();renderGym();return}
  if(b.dataset.xd!==undefined){const k=+b.dataset.xd,x=w.ex.splice(k,1)[0];noteOpen=-1;commit();renderGym();toast('Exercício removido',()=>{if(cur.w){cur.w.ex.splice(k,0,x);commit();renderGym()}});return}
  if(b.dataset.nt!==undefined){const i=+b.dataset.nt;noteOpen=noteOpen===i?-1:i;b.closest('.exc').outerHTML=exCard(w.ex[i],i,w.ex.length);const f=document.querySelector('[data-nx="'+i+'"]');if(f)f.focus();return}
  if(b.id==='wAddEx'){w.ex.push({n:'',s:[blankSet()]});commit();renderGym();const f=$('xn'+(w.ex.length-1));if(f)f.focus();return}
  if(b.id==='wFin'){w.en=Date.now();stopRest();commit();const sm=wSummary(w);renderGym();
    showModal('<span class="kick">Treino concluído</span><h2>'+esc(w.n||'Treino')+'</h2><ul><li>Duração <b>'+durTxt(w.en-w.st)+'</b></li><li><b>'+w.ex.filter(x=>x.n).length+'</b> exercícios, <b>'+sm.sets+'</b> séries feitas</li>'+(sm.vol?'<li>Volume <b>'+(sm.vol>=1000?num(sm.vol/1000)+' toneladas':Math.round(sm.vol)+' kg')+'</b></li>':'')+'</ul>'+(sm.prs.length?'<p><b>Recordes:</b></p><ul>'+sm.prs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p class="sub">Sem recorde hoje, mas treino feito conta mais que treino perfeito.</p>'),'Fechar');return}
  if(b.id==='wSaveRt'){const n=(w.n||'Treino').trim(),ex=w.ex.filter(x=>x.n.trim()).map(x=>{const ws=x.s.filter(y=>y.t!=='a'),rs=ws.map(y=>y.r).filter(Boolean);return{n:x.n.trim(),sets:Math.max(1,ws.length||1),rmin:rs.length?Math.min(...rs):8,rmax:rs.length?Math.max(...rs):12}});if(!ex.length)return;
    const ex0=X.routines.find(r=>norm(r.n)===norm(n));if(ex0)ex0.ex=ex;else X.routines.push({id:uid(),n,ex});saveX('routines');renderSide();toast('Rotina “'+n+'” salva',null);return}
  if(b.id==='wDel'){const old=cur.w;cur.w=null;stopRest();commit();renderGym();toast('Treino apagado',()=>{cur.w=old;commit();renderGym()});return}
});
function updStat(){const w=cur.w;if(!w)return;const el=document.querySelector('#wk .wstat');if(!el)return;const sm=wSummary(w),spans=el.querySelectorAll(':scope>span');const live=w.st&&!w.en;
  const html=(live?'<span class="live">Em andamento <b id="wClock">'+fmtT((Date.now()-w.st)/1000)+'</b></span>':w.st&&w.en?'<span>Duração <b>'+durTxt(w.en-w.st)+'</b></span>':'')+'<span><b>'+sm.sets+'</b> séries feitas</span>'+(sm.vol?'<span><b>'+(sm.vol>=1000?num(sm.vol/1000)+' t':Math.round(sm.vol)+' kg')+'</b> de volume</span>':'');
  spans.forEach(x=>x.remove());el.insertAdjacentHTML('afterbegin',html);
  if(live&&!$('wFin')){const a=$('wAddEx');if(a)a.insertAdjacentHTML('afterend','<button class="btn" id="wFin" style="background:var(--r5);color:#fff">Finalizar treino</button>')}}
$('wk').addEventListener('input',ev=>{const t=ev.target,w=cur.w;if(!w||demo)return;
  if(t.id==='wName'){w.n=t.value;commit();return}
  if(t.id==='wNote'){w.note=t.value;commit();return}
  if(t.id==='wRest'){S.rest=+t.value||90;saveSettings();return}
  if(t.dataset.xn!==undefined){w.ex[+t.dataset.xn].n=t.value;commit();return}
  if(t.dataset.nx!==undefined){const x=w.ex[+t.dataset.nx];if(!x.n)return;const k=norm(x.n);X.exmeta[k]={...(X.exmeta[k]||{}),note:t.value};saveX('exmeta');return}
  if(t.dataset.xg!==undefined){const x=w.ex[+t.dataset.xg];const k=norm(x.n);X.exmeta[k]={...(X.exmeta[k]||{}),g:t.value};saveX('exmeta');const i=+t.dataset.xg;reCard(i);renderSide();return}
  const key=t.dataset.sk||t.dataset.sr||t.dataset.sm||t.dataset.sq;if(key){const[a,c]=sIdx(key),y=w.ex[a].s[c];
    if(t.dataset.sk)y.kg=okNum(t.value,0,1000);else if(t.dataset.sr)y.r=okNum(t.value,0,500);else if(t.dataset.sm)y.min=okNum(t.value,0,600);else y.km=okNum(t.value,0,300);commit();updStat()}});
$('wk').addEventListener('change',ev=>{const t=ev.target;if(t.dataset.xn===undefined||!cur.w)return;const i=+t.dataset.xn,x=cur.w.ex[i];if(!x)return;
  if(x.n&&x.s.length===1&&x.s[0].kg==null&&x.s[0].r==null&&x.s[0].min==null){x.s=fromLast(x.n,1);commit()}
  setTimeout(()=>{reCard(i);renderSide()},0)});
function reCard(i){if(!cur.w||!cur.w.ex[i])return;const a=document.activeElement;let q=null;if(a&&a.closest&&a.closest('#wk .exc[data-xi="'+i+'"]'))for(const k of['sk','sr','sm','sq','xn','nx','xg'])if(a.dataset&&a.dataset[k]!==undefined){q='[data-'+k+'="'+a.dataset[k]+'"]';break}
  const card=document.querySelector('#wk .exc[data-xi="'+i+'"]');if(!card)return;card.outerHTML=exCard(cur.w.ex[i],i,cur.w.ex.length);if(q){const f=document.querySelector('#wk '+q);if(f){f.focus();if(f.select)try{f.select()}catch(e){}}}}
$('tPrev').onclick=()=>select(add(sel,-1),true);
$('tNext').onclick=()=>select(add(sel,1),true);

/* ---------- o dia vira com o app aberto ---------- */
const digitando=()=>{const a=document.activeElement;return !!(a&&a.matches('input,textarea,select')&&a.closest('#ed,#wk,.rev,.goal,.lw'))};
function viraDia(){const h=ymd(new Date());if(h===TODAY||!S.start||digitando())return;const era=TODAY;TODAY=h;
  if(demo){$('startIn').max=TODAY;enterDemo();renderAll(true);return}
  const treinando=cur.w&&cur.w.st&&!cur.w.en;
  if(sel===era&&!treinando&&inRange(TODAY))sel=TODAY;
  renderAll(true);setTimeout(checkModals,400)}

/* ---------- lembrete ---------- */
async function vigia(){try{const h=await lembrete.hora();if(!h)return;
  if(nativo&&document.hidden)return;
  if(!document.hidden){await lembrete.avisado(h);toast('Hora de registrar o dia',null);return}
  if(!('Notification'in window)||Notification.permission!=='granted')return;
  const reg=await navigator.serviceWorker.ready;await reg.showNotification(lembrete.titulo,lembrete.opcoes);await lembrete.avisado(h)}catch(e){}}
setInterval(()=>{viraDia();vigia()},30000);
const lemConf=()=>plat.conf.lembrete||{on:false,h:'21:00'};
function renderLem(msg){const c=lemConf();$('lemOn').checked=c.on;$('lemH').value=c.h;
  if(nativo){const s=nativo.lembreteEstado();$('lemXi').hidden=!(c.on&&s.xiaomi);
    $('lemTx').textContent=msg||(c.on?'Ligado. Toca às '+c.h+' mesmo com o app fechado, se você ainda não deu nota pro dia.'+(s.xiaomi?' No Xiaomi e Poco, faz uma vez: liga o Início automático do Desafio 365 e deixa a Bateria em Sem restrições. Sem isso o celular pode segurar o aviso.':''):'Desligado.');return}
  $('lemTx').textContent=msg||(c.on?'Ligado. Se você já deu nota pro dia, ele não avisa. Com o app fechado, o celular pode atrasar ou pular o aviso: pra garantir todo dia, usa também o calendário.':'O aviso do app funciona melhor com ele aberto ou usado há pouco. O do calendário toca todo dia, mesmo com o app fechado.')}
async function ligarLem(on,h){let msg='';
  if(nativo){const r=await nativo.lembrete(on,h);await plat.setConf({lembrete:{on:!!r.on,h},avisado:null});renderLem(on&&!r.on?'As notificações estão bloqueadas. Libera em Configurações, Apps, Desafio 365, Notificações.':'');return}
  if(on){if(!('Notification'in window))msg='Aqui o app não pode mandar notificação. No iPhone, instala na Tela de Início primeiro. O calendário funciona de qualquer jeito.';
    else{const p=Notification.permission==='default'?await Notification.requestPermission():Notification.permission;if(p!=='granted')msg='As notificações estão bloqueadas pra este app. Libera nas configurações do celular ou usa o calendário.'}}
  await plat.setConf({lembrete:{on:on&&!msg,h}});plat.ligarSegundoPlano(on&&!msg);renderLem(msg)}
$('lemOn').addEventListener('change',ev=>ligarLem(ev.target.checked,$('lemH').value||'21:00'));
$('lemH').addEventListener('change',async ev=>{const h=ev.target.value||'21:00';if(nativo){ligarLem(lemConf().on,h);return}await plat.setConf({lembrete:{...lemConf(),h},avisado:null});renderLem()});
$('lemIcs').onclick=async()=>{if(demo||!S.start){renderLem('Começa o seu desafio primeiro.');return}
  const ini=S.start>TODAY?S.start:TODAY;await plat.baixar(new Blob([plat.ics(ini,end(),lemConf().h,location.origin+location.pathname)],{type:'text/calendar'}),'lembrete-desafio365.ics');
  renderLem('Abre o arquivo baixado pra adicionar ao calendário. Ele toca todo dia às '+lemConf().h+' até o fim do desafio.')};

/* ---------- ajustes ---------- */
function abrirAjustes(foco){location.hash='diario';setTimeout(()=>{$('ajustes').open=true;const f=foco&&$(foco);(f||$('ajustes')).scrollIntoView({block:'center'});if(f)f.focus({preventScroll:true})},60)}
function renderIA(){const k=plat.conf.iaKey;$('iaKey').value='';$('iaKey').placeholder=k?'Chave salva (termina em '+k.slice(-4)+')':'Cole a chave (sk-ant-...)';$('iaDel').hidden=!k;
  $('iaModel').innerHTML=plat.IA_MODELOS.map(m=>'<option value="'+m[0]+'"'+(m[0]===(plat.conf.iaModel||plat.IA_MODELOS[0][0])?' selected':'')+'>'+m[1]+'</option>').join('')}
$('iaSave').onclick=async()=>{const k=$('iaKey').value.trim();if(!k){$('iaKey').focus();return}await plat.setConf({iaKey:k});renderIA();renderAI();toast('Chave salva neste aparelho',null)};
$('iaDel').onclick=async()=>{await plat.setConf({iaKey:null});renderIA();toast('Chave removida',null)};
$('iaModel').addEventListener('change',ev=>plat.setConf({iaModel:ev.target.value}));

/* ---------- instalar ---------- */
let pedirInst=null;
const instalado=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function renderInst(){const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  $('instBox').hidden=!!nativo||instalado();$('instBtn').hidden=!pedirInst;
  $('instTx').textContent=pedirInst?'Fica com ícone próprio e abre sem internet.':ios?'No Safari: toca em Compartilhar e depois em Adicionar à Tela de Início.':'No Chrome do celular: abre o menu ⋮ e toca em Instalar app (ou Adicionar à tela inicial).'}
addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();pedirInst=ev;renderInst()});
addEventListener('appinstalled',()=>{pedirInst=null;renderInst();plat.guardarDeVez()});
$('instBtn').onclick=async()=>{const p=pedirInst;if(!p)return;pedirInst=null;await p.prompt();renderInst()};

/* ---------- partida ---------- */
if(!nativo&&'serviceWorker'in navigator){const tinha=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(tinha)toast('Versão nova pronta: fecha e abre o app',null)});
  navigator.serviceWorker.addEventListener('message',ev=>{if(ev.data==='registrar'&&!demo&&inRange(TODAY)){location.hash='diario';select(TODAY)}})}

/* ---------- só no aplicativo Android ---------- */
if(nativo){
  $('lemIcs').hidden=true;$('iaCfg').hidden=true;$('aiBtn').hidden=true;$('travaBox').hidden=false;$('aiCopy').classList.remove('lk');
  $('aiSub').textContent='Opcional e de graça. Este app não tem acesso à internet: você copia o pedido, cola numa conversa com o Claude e traz a resposta de volta. O pedido leva os registros do período escolhido, metas, revisões e o seu porquê; ao colar no Claude, isso sai do aparelho. Fotos e cartas nunca vão. A última análise fica salva aqui.';
  $('zipBtn').textContent='Salvar backup com fotos';
  const renderTrava=()=>{const s=nativo.travaEstado();$('travaOn').checked=!!s.on;$('travaTx').textContent=!s.bloqueio?'Seu celular está sem PIN ou senha. Cria um nas configurações do celular pra trava funcionar.':s.on?'Tranca ao abrir e depois de 30 segundos fora. O conteúdo não aparece nos apps recentes nem em prints.':'O app abre direto e aparece nos apps recentes.'};
  $('travaOn').addEventListener('change',ev=>{nativo.trava(ev.target.checked);renderTrava()});renderTrava();
  $('lemIni').onclick=()=>nativo.abrirAjustes('inicio');$('lemBat').onclick=()=>nativo.abrirAjustes('bateria');
  nativo.em('registrar',()=>{if(!demo&&inRange(TODAY)){location.hash='diario';select(TODAY)}});
  // botão voltar: fecha o que estiver aberto, depois volta pro Diário, depois sai
  window.nativoVoltar=()=>{if(!$('lb').hidden){$('lb').hidden=true;return true}if(!$('mdl').hidden){$('mdlOk').click();return true}if(tab!=='diario'){location.hash='diario';return true}return false};
}
// banco vazio mas com cópia automática guardada: oferece recuperar
function oferecerCopia(){const c=nativo&&demo?nativo.lerEspelho():null,b=$('recup');b.hidden=!(c&&ehBackup(c.dados));if(b.hidden)return;
  b.textContent='Recuperar cópia de '+fmtShort(c.dia);b.onclick=async()=>{if(await importar(c.dados))b.hidden=true}}

async function boot(){
  route();enterDemo();renderAll(true);setStatus('Carregando seus dias…');renderInst();renderLem();renderIA();
  try{await plat.lerConf();col=plat.colecao;await trazerAntigo()}
  catch(e){col=null;$('semBanco').classList.add('on');setStatus('Não consegui abrir o armazenamento.');return}
  renderLem();renderIA();
  dictFn=plat.criarDitado();setupMics();
  let first=true;
  col.onSnapshot(docs=>{
    const ne={};for(const k in docs)if(k[0]==='d'&&okDate(k.slice(1)))ne[k.slice(1)]=clean(docs[k]);
    for(const k of dirty){if(k[0]!=='d')continue;const d=k.slice(1);if(E[d])ne[d]=E[d];else delete ne[d]}
    const ns=dirty.has('settings')?{start:S.start,habits:S.habits,why:S.why,seen:S.seen,rest:S.rest}:docs.settings;
    const xs={};for(const k of XK)xs[k]=dirty.has(k)?X[k]:XC[k](docs[k]);
    const ng=dirty.has('goals')?G:cleanGoals(docs.goals);
    const ai=dirty.has('ai')?AIr:cleanAIr(docs.ai);
    const wasDemo=demo;mode='db';
    applyData(ns,ne,ng,ai,xs);
    if(first&&!demo&&inRange(TODAY))sel=TODAY; // abre sempre em hoje
    const ed=$('ed').contains(document.activeElement);
    renderAll(first||wasDemo!==demo||(!ed&&!dirty.has('d'+sel)));
    if(first){first=false;setStatus(demo?'':'Tudo salvo');
      oferecerCopia();
      if(nativo&&!demo&&!plat.conf.lembrete)ligarLem(true,'21:00');
      if(!demo){plat.guardarDeVez();plat.fotos.limpar(fotoEmUso).catch(()=>{});if(lemConf().on)plat.ligarSegundoPlano(true)}
      setTimeout(checkModals,600);vigia()}
  },()=>{col=null;mode='loading';$('semBanco').classList.add('on');setStatus('Não consegui acessar seus dias salvos agora.')});
}
boot();
}
