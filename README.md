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
- **Módulos avançados (VPS stub):** `server.ts` também expõe `/api/whatsapp`, `/api/scrape` e `/api/rag` (Evolution API, scrapers e RAG simulados em memória) para testar a integração end-to-end sem uma VPS real. Em produção, esses endpoints devem ser implementados na VPS (PostgreSQL + pgvector).
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
  mounjaro/        SUBSITE "Mounjaro PRO" (controle de tratamento com tirzepatida)
    App.tsx        shell e navegação do subsite
    main.tsx       entrypoint (montado em /mounjaro)
    types.ts       modelos (Cliente, Dose, Pesagem, Pagamento, Score)
    localDb.ts     banco local IndexedDB do subsite
    lib.ts         cálculos clínicos (IMC, score, próxima dose, perda)
    ui.tsx         componentes visuais compartilhados
    pages/         Dashboard, Clientes, Doses, Peso, Pagamentos, Referencia
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

## 💊 Subsite Mounjaro PRO (controle de medicamento)

Sistema separado, acessível no **mesmo endereço** em **`/mounjaro`** (ou `/mounjaro.html`),
para acompanhamento de pacientes em tratamento com **tirzepatida (Mounjaro®)**.
Informações clínicas baseadas na bula oficial (Eli Lilly / Anvisa) e nos estudos
SURMOUNT-1/2 e SURPASS 1-5. **Não substitui avaliação médica.**

**Fluxo de entrada:** ao abrir o site, o usuário vê a tela de **escolha dos 2 sistemas**
(`src/components/SystemChooser.tsx`): *Sistema da Loja* (ZM Store) ou *Mounjaro PRO*.
A escolha fica salva em `localStorage` (`mei_pro_system_choice`) e pode ser trocada a
qualquer momento pelo menu (botão "Mounjaro PRO" na loja / "← Voltar" no subsite).

**Autenticação e nuvem:** tanto a loja quanto o Mounjaro PRO exigem login com **Google**
(Firebase Auth). Os dados do Mounjaro PRO são salvos na nuvem em
`users/{uid}/mounjaro/{clientes,pesagens,doses,pagamentos}` (ver `src/mounjaro/dbSync.ts`),
sincronizados automaticamente a cada alteração, além do banco local IndexedDB.

Funcionalidades:
- **Clientes**: cadastro com dados clínicos (altura, peso inicial, IMC, comorbidades, objetivo, médico).
- **Doses**: registro de aplicações com dose (2,5–15 mg), intervalo configurável de **7 a 15 dias**,
  local de aplicação, lote, efeitos colaterais e vínculo com pagamento. Agenda de próximas doses com alertas de atraso.
- **Peso**: pesagens ao longo do tempo, peso atual, peso perdido desde o início, **perda média por dose**,
  IMC atual, meta e gráfico de evolução.
- **Pagamentos + Score**: controle de pagamentos por cliente e **score de pagamento (0–100)**
  calculado por pontualidade, atrasos e valor em aberto (classificação excelente/bom/regular/ruim).

> Deploy: o `vercel.json` faz rewrite de `/mounjaro` para `mounjaro.html` (MPA via Vite).

## 📌 Notas

- O Service Worker foi desativado (`public/sw.js` é um no-op) para evitar recarregamento em loop em desenvolvimento.
- Serviços (categoria *Serviços*) não possuem quantidade em estoque.
- "Mais Vendidos" agrupa por nome normalizado (sem colapsar itens diferentes).
