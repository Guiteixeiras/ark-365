// Monta o aplicativo Android direto com as ferramentas do Google, sem Gradle nem bibliotecas de terceiros.
// Uso: node ferramentas/apk.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(import.meta.dirname, '..'), AND = path.join(RAIZ, 'android'), OUT = path.join(AND, 'saida');
// onde estão as ferramentas neste computador: ferramentas/local.json {"android": "...", "java": "..."} ou variáveis de ambiente
const LOCAL = path.join(import.meta.dirname, 'local.json'), cfg = fs.existsSync(LOCAL) ? JSON.parse(fs.readFileSync(LOCAL, 'utf8')) : {};
const SDK = process.env.ANDROID_FERRAMENTAS || cfg.android, JH = cfg.java || process.env.JAVA_HOME;
if (!SDK || !JH) throw new Error('Diz onde estão as ferramentas em ferramentas/local.json: {"android": "pasta", "java": "pasta do JDK"}');
const BT = path.join(SDK, 'build-tools', fs.readdirSync(path.join(SDK, 'build-tools'))[0]);
const JAR = path.join(SDK, 'platforms', 'android-36', 'android.jar');
const EXE = process.platform === 'win32' ? '.exe' : '', J = n => path.join(JH, 'bin', n + EXE), B = n => path.join(BT, n + EXE);
const roda = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'], cwd: OUT });

// versão: 1 + minutos desde 2026, pra cada geração ser "mais nova" que a anterior
const CODIGO = Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 60000), NOME = new Date().toISOString().slice(0, 10).replaceAll('-', '.');

fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['assets/www', 'gen', 'classes', 'dex']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

// 1. telas: tudo de app/, menos o que é só do navegador. A trava de rede perde até a API de IA.
for (const f of fs.readdirSync(path.join(RAIZ, 'app'))) if (!['sw.js', 'manifest.webmanifest', 'icones'].includes(f)) fs.cpSync(path.join(RAIZ, 'app', f), path.join(OUT, 'assets/www', f), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/www/icones'));
fs.copyFileSync(path.join(RAIZ, 'app/icones/icone-32.png'), path.join(OUT, 'assets/www/icones/icone-32.png'));
const ih = path.join(OUT, 'assets/www/index.html');
let html = fs.readFileSync(ih, 'utf8');
for (const x of [' https://api.anthropic.com', '<link rel="manifest" href="manifest.webmanifest">\n', '<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">\n']) { if (!html.includes(x)) throw new Error('não achei no index.html: ' + x); html = html.replace(x, ''); }
fs.writeFileSync(ih, html);

// 2. recursos + manifesto
roda(B('aapt2'), ['compile', '--dir', path.join(AND, 'res'), '-o', 'res.zip']);
roda(B('aapt2'), ['link', '-o', 'base.apk', '-I', JAR, '--manifest', path.join(AND, 'AndroidManifest.xml'), '--java', 'gen', '--min-sdk-version', '31', '--target-sdk-version', '34', '--version-code', String(CODIGO), '--version-name', NOME, 'res.zip']);

// 3. código
const java = d => fs.readdirSync(d, { recursive: true }).filter(f => f.endsWith('.java')).map(f => path.join(d, f));
roda(J('javac'), ['--release', '11', '-Xlint:-options', '-encoding', 'UTF-8', '-classpath', JAR, '-d', 'classes', ...java(path.join(AND, 'src')), ...java(path.join(OUT, 'gen'))]);
const classes = fs.readdirSync(path.join(OUT, 'classes'), { recursive: true }).filter(f => f.endsWith('.class')).map(f => path.join('classes', f));
roda(J('java'), ['-cp', path.join(BT, 'lib/d8.jar'), 'com.android.tools.r8.D8', '--release', '--lib', JAR, '--min-api', '31', '--output', 'dex', ...classes]);
// os assets entram pelo jar: no Windows o aapt2 grava "www\\arquivo" e o Android não acha
roda(J('jar'), ['uf0', 'base.apk', '-C', 'dex', 'classes.dex', '-C', '.', 'assets']);
const dentro = execFileSync(J('jar'), ['tf', 'base.apk'], { cwd: OUT, encoding: 'utf8' }).split(/\r?\n/);
if (dentro.some(n => n.includes('\\'))) throw new Error('barra invertida dentro do APK');
for (const n of ['AndroidManifest.xml', 'classes.dex', 'assets/www/index.html', 'assets/www/app.js', 'assets/www/nativo.js', 'assets/www/fontes/archivo.woff2']) if (!dentro.includes(n)) throw new Error('faltou no APK: ' + n);
roda(B('zipalign'), ['-f', '-p', '4', 'base.apk', 'alinhado.apk']);

// 4. assinatura: a chave é criada uma vez e precisa ser guardada pra poder atualizar o app depois
const CH = path.join(AND, 'chave'), KS = path.join(CH, 'desafio365.p12'), SENHA = path.join(CH, 'senha.txt');
if (!fs.existsSync(KS)) {
  fs.mkdirSync(CH, { recursive: true });
  fs.writeFileSync(SENHA, crypto.randomBytes(24).toString('base64url'));
  roda(J('keytool'), ['-genkeypair', '-keystore', KS, '-storetype', 'PKCS12', '-storepass:file', SENHA, '-alias', 'desafio365', '-keyalg', 'EC', '-groupname', 'secp256r1', '-validity', '36500', '-dname', 'CN=Desafio 365']);
}
const APK = path.join(RAIZ, 'Desafio365.apk');
roda(J('java'), ['--enable-native-access=ALL-UNNAMED', '-jar', path.join(BT, 'lib/apksigner.jar'), 'sign', '--ks', KS, '--ks-key-alias', 'desafio365', '--ks-pass', 'file:' + SENHA, '--min-sdk-version', '31', '--out', APK, 'alinhado.apk']);
roda(J('java'), ['--enable-native-access=ALL-UNNAMED', '-jar', path.join(BT, 'lib/apksigner.jar'), 'verify', '--print-certs', APK]);
fs.rmSync(APK + '.idsig', { force: true });
fs.rmSync(OUT, { recursive: true, force: true });
console.log('\nPronto: ' + APK + ' (' + Math.round(fs.statSync(APK).size / 1024) + ' KB, versão ' + NOME + ', código ' + CODIGO + ')');
