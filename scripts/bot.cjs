#!/usr/bin/env node
/**
 * BOT UNIVERSAL - GESTÃO.PRO
 * 
 * Uso: node scripts/bot.cjs <comando>
 * 
 * Comandos:
 *   dados              Extrai dados da planilha e gera data.ts + backup Excel
 *   git-pull           Puxa alterações do GitHub (main)
 *   git-push           Commita e envia para o GitHub
 *   deploy             Faz deploy no Vercel (produção)
 *   dev                Inicia servidor de desenvolvimento
 *   build              Compila o projeto
 *   help               Mostra esta ajuda
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = __dirname;
const SCRIPTS_DIR = __dirname;

function run(command, label) {
  console.log(`\n[${label || 'EXEC'}] ${command}`);
  try {
    execSync(command, { cwd: PROJECT_ROOT, stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`\n[ERRO] Comando falhou: ${command}`);
    process.exit(1);
  }
}

function runCapture(command) {
  try {
    return execSync(command, { cwd: PROJECT_ROOT, encoding: 'utf-8', shell: true }).trim();
  } catch {
    return '';
  }
}

const COMMANDS = {
  help() {
    console.log(`
  BOT UNIVERSAL - GESTÃO.PRO
  ============================
  Uso: node scripts/bot.cjs <comando>

  Comandos:
    dados              Extrai dados da planilha e gera data.ts + backup Excel
    git-pull           Puxa alterações do GitHub (branch main)
    git-push [msg]     Commita e envia para o GitHub (msg opcional)
    deploy             Faz deploy no Vercel (produção)
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

  'git-pull'() {
    console.log('[BOT] Puxando do GitHub...');
    run('git pull origin main', 'GIT PULL');
  },

  'git-push'(msg) {
    console.log('[BOT] Enviando para o GitHub...');
    const defaultMsg = `feat: atualização automática ${new Date().toISOString().slice(0, 10)}`;
    const commitMsg = msg || defaultMsg;

    const status = runCapture('git status --porcelain');
    if (!status) {
      console.log('[BOT] Nada para commitar.');
      return;
    }

    run('git add -A', 'GIT ADD');
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, 'GIT COMMIT');
    run('git push origin main', 'GIT PUSH');
    console.log('[BOT] Enviado com sucesso!');
  },

  deploy() {
    console.log('[BOT] Deploy no Vercel...');
    run('npx vercel --prod --yes', 'VERCEL DEPLOY');
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
  if (cmd && !COMMANDS[cmd]) {
    console.log(`\n  Comando "${cmd}" não reconhecido.\n`);
  }
  process.exit(cmd && !COMMANDS[cmd] ? 1 : 0);
}

COMMANDS[cmd](...cmdArgs);
