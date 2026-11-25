# Guia de uso do Desafio 365

Aplicativo Android que roda inteiro no celular. Não tem permissão de internet, não tem conta, não tem servidor e não está publicado em lugar nenhum.

## 1. Instalar no celular (Android 12 ou mais novo)

1. Atualiza o **Android System WebView** e o **Chrome** na Play Store (o app usa esse motor pra desenhar as telas).
2. Liga o celular no computador pelo cabo, escolhe **Transferência de arquivos** e copia o `Desafio365.apk` pra pasta Download.
3. No celular, abre o **Gerenciador de Arquivos → Downloads** e toca no `Desafio365.apk`.
4. Ele vai avisar que a fonte é desconhecida: permite pro Gerenciador de Arquivos. Se o Play Protect perguntar se quer **enviar o app pra verificação**, pode recusar e tocar em *Instalar mesmo assim*.
5. Abre o app, coloca a digital e toca em **Começar meu desafio** (ou **Já tenho um backup**). Aceita a notificação quando ele pedir.

## 2. Deixar o lembrete das 21h confiável (só uma vez)

Celulares Xiaomi, Redmi e Poco seguram apps em segundo plano. Em **Diário → Ajustes e backup → Lembrete diário**:

1. Toca em **Início automático** e liga o Desafio 365.
2. Toca em **Bateria**, entra em *Economia de bateria* e escolhe **Sem restrições**.

O aviso só toca se o dia ainda não tem nota, e não mostra nada do que você escreveu. Forçar a parada do app nas configurações cancela o aviso até você abrir de novo.

## 3. Trazer seus dados do Claude

1. Na versão do Claude, no celular: **Diário → Ajustes e backup → Copiar backup**.
2. No app: **Já tenho um backup**, cola o texto e toca em **Importar texto**.
3. As fotos antigas não vêm no texto. No lugar delas aparece "foto não está neste aparelho": apaga o quadrinho e põe a foto de novo.

## 4. Análise com IA, sem pagar chave

Em **Relatórios → Análise com IA**:

1. **Copiar pedido**, abre o Claude (ou outra IA), cola numa conversa nova e envia.
2. Copia a resposta inteira, volta no app e toca em **Colar resposta**.

O pedido leva os registros do período escolhido, metas, revisões e o seu porquê. Fotos e cartas não vão. Ao colar numa IA da internet, esse texto sai do celular. Pra não sair de casa, dá pra colar numa IA que roda no seu computador, como o Ollama.

## 5. O que protege seus dados

| Proteção | Como funciona |
|---|---|
| Sem internet | O app não pede essa permissão, então o Android não deixa ele se conectar |
| Digital ou PIN | Pede ao abrir e depois de 30 segundos fora. Dá pra desligar nos ajustes |
| Tela escondida | Não aparece nos apps recentes nem em prints |
| Fora da nuvem | Não entra no backup do Google nem na troca de celular |
| Teclado | Pede modo anônimo, pra ele não aprender o que você escreve |
| Fotos | Ficam só dentro do app, reduzidas e sem a localização gravada |
| Voz | Transcreve no aparelho quando o celular sabe. Se não souber, avisa que o áudio passa pelo serviço de voz (Google) e pergunta antes |

O que ela **não** cobre: alguém que saiba o PIN do seu celular, e o que você mesmo colar ou salvar fora do app.

## 6. Backup

**Salvar backup com fotos** gera um arquivo onde você escolher. Coloca uma **senha**: com ela o arquivo (`.d365`) só abre com a senha, e se esquecer não tem como recuperar. Sem senha vira um `.zip` comum.

Faz um de vez em quando e guarda fora do celular: perdeu o celular ou desinstalou o app, é a única cópia. O app também guarda sozinho os últimos 7 dias de textos (sem fotos) e oferece recuperar se o banco sumir.

## 7. Atualizar ou mexer no código

| Pasta | O que tem |
|---|---|
| `app/` | As telas e regras. Também rodam num navegador comum |
| `android/` | A parte do celular: janela, trava, alarme, voz, salvar arquivo |
| `android/chave/` | A assinatura do app e a senha dela. Só existe no seu computador, não vai pro repositório |
| `ferramentas/` | `apk.mjs` monta o aplicativo, `servidor.mjs` testa no computador, `icones.mjs` desenha os ícones |

- Gerar de novo: `node ferramentas/apk.mjs`. Precisa do JDK e das ferramentas do Android, com as pastas em `ferramentas/local.json`. Instalar por cima mantém os dados.
- **Guarda a pasta `android/chave` e não passa pra ninguém.** Sem ela, uma versão nova não instala por cima da antiga: seria preciso salvar backup, desinstalar e importar.
- Testar no computador: `node ferramentas/servidor.mjs` e abrir <http://localhost:4365>.

Fonte Archivo, licença SIL OFL (`app/fontes/OFL.txt`).
