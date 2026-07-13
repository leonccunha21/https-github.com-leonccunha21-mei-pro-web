#!/usr/bin/env node
/**
 * BOT DE AUTOMAÇÃO - GESTÃO.PRO
 *
 * Uso: node scripts/bot.cjs <comando> [args]
 *
 * Comandos:
 *   dados              Extrai dados da planilha -> data.ts + backup Excel
 *   git-pull           Puxa alterações do GitHub (main) com retentativas
 *   git-push [msg]     Commita e envia para o GitHub (com throttle/retry)
 *   sync [msg]         Extrai planilha + pull + commit + push (fluxo completo)
 *   deploy             Deploy no Vercel (produção) com retentativas
 *   publish [msg]      sync + deploy
 *   dev                Inicia servidor de desenvolvimento
 *   build              Compila o projeto (produção)
 *   lint               Verifica tipos TypeScript
 *   status             Mostra status do git
 *   help               Mostra esta ajuda
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = __dirname;

// ---------------------------------------------------------------------------
// Utilitários de automação: throttle (limitação de taxa) e retry (retentativa)
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cria um limitador que garante um intervalo mínimo entre execuções.
function makeThrottle(minIntervalMs) {
  let last = 0;
  return async function throttle(fn) {
    const now = Date.now();
    const wait = Math.max(0, minIntervalMs - (now - last));
    if (wait) await sleep(wait);
    last = Date.now();
    return fn();
  };
}

// Executa um comando com retentativas automáticas (backoff exponencial + jitter).
async function execWithRetry(command, { retries = 4, baseDelay = 1500, label } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n[${label || 'EXEC'}] (tentativa ${attempt}/${retries}) ${command}`);
      execSync(command, { cwd: PROJECT_ROOT, stdio: 'inherit', shell: true });
      return true;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.warn(`[AVISO] Falha na tentativa ${attempt}: ${msg.split('\n')[0]}`);
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 400);
        console.log(`[BOT] Aguardando ${Math.round(delay)}ms (throttling/retry)...`);
        await sleep(delay);
      } else {
        console.error(`[ERRO] Comando falhou após ${retries} tentativas: ${command}`);
        return false;
      }
    }
  }
  return false;
}

// Throttle compartilhado para operações de rede/Git (evita rajadas).
const netThrottle = makeThrottle(2000);

function run(command, label) {
  console.log(`\n[${label || 'EXEC'}] ${command}`);
  try {
    execSync(command, { cwd: PROJECT_ROOT, stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`\n[ERRO] Comando falhou: ${command}`);
    process.exitCode = 1;
    throw err;
  }
}

function runCapture(command) {
  try {
    return execSync(command, { cwd: PROJECT_ROOT, encoding: 'utf-8', shell: true }).trim();
  } catch {
    return '';
  }
}

function buildCommitMsg(msg) {
  return msg || `feat: atualização automática ${new Date().toISOString().slice(0, 10)}`;
}

const COMMANDS = {
  help() {
    console.log(`
  BOT DE AUTOMAÇÃO - GESTÃO.PRO
  ==============================
  Uso: node scripts/bot.cjs <comando> [args]

  Comandos:
    dados              Extrai dados da planilha -> data.ts + backup Excel
    git-pull           Puxa alterações do GitHub (main) com retentativas
    git-push [msg]     Commita e envia para o GitHub (throttle + retry)
    sync [msg]         Extrai planilha + pull + commit + push (fluxo completo)
    deploy             Deploy no Vercel (produção) com retentativas
    publish [msg]      sync + deploy
    dev                Inicia servidor de desenvolvimento (localhost:3000)
    build              Compila o projeto (produção)
    lint               Verifica tipos TypeScript
    status             Mostra status do git
    help               Mostra esta ajuda
`);
  },

  dados() {
    console.log('[BOT] Extraindo dados da planilha...');
    run(`node "${path.join(SCRIPTS_DIR, 'processar_dados.cjs')}"`, 'PROCESSAR DADOS');
  },

  async 'git-pull'() {
    console.log('[BOT] Puxando do GitHub...');
    const ok = await netThrottle(() => execWithRetry('git pull origin main', { label: 'GIT PULL', retries: 4 }));
    return ok;
  },

  async 'git-push'(msg) {
    console.log('[BOT] Enviando para o GitHub...');
    const commitMsg = buildCommitMsg(msg);
    const status = runCapture('git status --porcelain');
    if (!status) {
      console.log('[BOT] Nada para commitar.');
      return true;
    }
    run('git add -A', 'GIT ADD');
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, 'GIT COMMIT');
    const ok = await netThrottle(() => execWithRetry('git push origin main', { label: 'GIT PUSH', retries: 5 }));
    if (ok) console.log('[BOT] Enviado com sucesso!');
    return ok;
  },

  async sync(msg) {
    console.log('[BOT] Sincronizando projeto (planilha -> GitHub)...');
    COMMANDS.dados();
    await netThrottle(() => execWithRetry('git pull origin main --rebase', { label: 'GIT PULL', retries: 4 }));
    const status = runCapture('git status --porcelain');
    if (!status) {
      console.log('[BOT] Sem alterações locais para enviar.');
      return true;
    }
    run('git add -A', 'GIT ADD');
    run(`git commit -m "${buildCommitMsg(msg).replace(/"/g, '\\"')}"`, 'GIT COMMIT');
    const ok = await netThrottle(() => execWithRetry('git push origin main', { label: 'GIT PUSH', retries: 5 }));
    if (ok) console.log('[BOT] Sincronizado com sucesso!');
    return ok;
  },

  async deploy() {
    console.log('[BOT] Deploy no Vercel...');
    return netThrottle(() => execWithRetry('npx vercel --prod --yes', { label: 'VERCEL DEPLOY', retries: 4 }));
  },

  async publish(msg) {
    const synced = await COMMANDS.sync(msg);
    if (!synced) {
      console.error('[BOT] Sync falhou — abortando publicação.');
      return false;
    }
    return COMMANDS.deploy();
  },

  dev() {
    console.log('[BOT] Iniciando servidor de desenvolvimento...');
    run('npm run dev', 'DEV SERVER');
  },

  build() {
    console.log('[BOT] Compilando projeto...');
    run('npm run build', 'BUILD');
  },

  lint() {
    console.log('[BOT] Verificando tipos...');
    run('npx tsc --noEmit', 'LINT');
  },

  status() {
    console.log('[BOT] Status do Git:');
    run('git status', 'GIT STATUS');
    console.log('\n[BOT] Últimos commits:');
    run('git log --oneline -5', 'GIT LOG');
  }
};

// --- MAIN ---
const args = process.argv.slice(2);
const cmd = args[0];
const cmdArgs = args.slice(1);

if (!cmd || cmd === 'help' || !COMMANDS[cmd]) {
  COMMANDS.help();
  if (cmd && !COMMANDS[cmd]) console.log(`\n  Comando "${cmd}" não reconhecido.\n`);
  process.exit(cmd && !COMMANDS[cmd] ? 1 : 0);
}

const result = COMMANDS[cmd](...cmdArgs);
if (result && typeof result.then === 'function') {
  result.catch(err => {
    console.error(err);
    process.exit(1);
  });
}
