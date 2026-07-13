<div align="center">

# 🛒 Gestão.PRO — Sistema de Gestão Comercial (ZM Store)

Painel completo para gestão de **vendas, estoque, clientes (devedores), despesas, fluxo de caixa e relatórios**.
Os dados são carregados a partir de planilhas Excel (a "planilha-mãe") e convertidos em um banco local.

</div>

---

## ✨ Funcionalidades

- **Painel Geral** com KPIs, produtos mais vendidos e avaliação de estoque.
- **Estoque** com cadastro de produtos, categorias, ajuste de estoque e importação/exportação Excel.
- **Frente de Caixa (PDV)** com venda rápida e baixa automática de estoque (serviços não consomem estoque).
- **Vendas** (histórico) e **Devedores** (submenu de Vendas) com controle de pendências, **parcelas**, **pagamentos parciais** e conclusão manual do débito.
- **Relatórios** e **Fluxo de Caixa** com filtros por ano (o ano ativo é o mais recente que possui vendas).
- **OS / Orçamentos** para serviços técnicos.
- **Backup/Restauração** do banco local e exportação para Excel.

## 🧱 Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend local:** Node (`server.ts` via `tsx`) servindo `/api/db` a partir de `data/local-db.json`
- **Dados:** Excel → `scripts/processar_dados.cjs` → `src/data.json` / `src/data.ts`
- **Deploy:** Vercel

## 🚀 Como rodar

**Pré-requisitos:** Node.js 18+ instalado.

```bash
npm install        # instala dependências
npm run dev        # sobe backend (:4000) + frontend (:3000)
```

Acesse **http://localhost:3000**.

Outros scripts:

```bash
npm run build      # build de produção (pasta dist/)
npm run lint       # checagem de tipos (tsc --noEmit)
npm run web        # só o frontend (Vite)
npm run server     # só o backend local
```

## 📊 Pipeline da planilha (fonte de dados)

A **planilha-mãe oficial** é `data/excel/Relatório de Vendas.xlsx` (abas `Vendas 2024/2025/2026`, `PROD`, `Devedores`).
As vendas de **2023** ficam em `data/excel/Vendas 2023.xlsx` (formato mensal).

Para converter a planilha em dados do sistema:

```bash
node scripts/processar_dados.cjs
```

Isso gera:
- `src/data.json` e `src/data.ts` (usados pelo app)
- `data/excel/Backup_Dados_Completos.xlsx` (backup legível)
- atualiza `data/local-db.json` (banco que o app consome)

**Regra do projeto:** toda atualização/relatório deve **bump de versão** (em `package.json`) e ser registrada como concluída (`[ok]`) em `melhorias.md`.

## 🤖 Bot de Automação

`scripts/bot.cjs` automatiza tarefas com **throttling** e **retentativas automáticas** (backoff exponencial):

```bash
node scripts/bot.cjs dados       # extrai planilha -> data.json/data.ts
node scripts/bot.cjs git-pull    # puxa do GitHub (com retry)
node scripts/bot.cjs git-push    # commit + push (throttle + retry)
node scripts/bot.cjs sync        # planilha -> pull -> commit -> push
node scripts/bot.cjs deploy      # deploy Vercel (produção)
node scripts/bot.cjs publish     # sync + deploy
node scripts/bot.cjs status      # status do git
```

## 🗂️ Estrutura

```
src/
  components/      UI (Dashboard, Products, Sales, SalesHistory, Debtors, Reports, Settings...)
  types.ts         modelos (Product, Sale, Expense, Category, ServiceOrder)
  data.json/.ts    dados gerados a partir da planilha
  App.tsx          shell, navegação e estado do banco local
scripts/
  processar_dados.cjs   pipeline planilha -> dados
  importar_planilha.cjs planilha editável -> dados
  gerar_planilha.cjs    gera planilha editável (ZMStore_Editavel.xlsx)
  gerar_backup_excel.cjs backup Excel
  bot.cjs              automação (throttle + retry)
data/
  local-db.json   banco consumido pelo app (backend)
  excel/          planilhas (Relatório de Vendas, Vendas 2023, backups)
hub.bat           menu rápido de scripts + git
```

## 📌 Notas

- O Service Worker foi desativado (`public/sw.js` é um no-op) para evitar recarregamento em loop em desenvolvimento.
- Serviços (categoria *Serviços*) não possuem quantidade em estoque.
- "Mais Vendidos" agrupa por nome normalizado (sem colapsar itens diferentes).
