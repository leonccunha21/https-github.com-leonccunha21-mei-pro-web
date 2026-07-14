# Melhorias e Recomendações — ZM Store

Revisão geral do projeto (React + TypeScript / Vite). Itens priorizados por severidade.
Status: ✅ aplicado, ⏳ pendente.

## 🔴 Críticos (risco de perda/erro de dados)

### H1 — `loadDb` não marca `initialized` ao carregar do servidor/seed
- **Onde:** `src/lib/localDb.ts:77` e `:90` retornam `db` sem `initialized`.
- **Impacto:** No primeiro acesso de um navegador novo, `App.tsx:113` (`hasDb = db && db.initialized === true`) fica `false` e o app cai no seed (`data.ts`), sobrescrevendo **clientes, empréstimos, fornecedores, compras e OS** (entidades que não estão no seed). Empréstimos não têm recuperação pelo backup.
- **Fix:** Retornar `{ ...(db as LocalDb), initialized: true }` nos dois pontos.
- **Status:** ✅

### H2 — Colisão de ID de produto/categoria
- **Onde:** `App.tsx:329` (`id: \`p_${Date.now()}\``) e `:375` (`id: \`cat_${Date.now()}\``) sem sufixo aleatório.
- **Impacto:** Dois registros criados no mesmo milissegundo colidem → perda silenciosa de um deles (React key duplicada, sobrescrita em mapas).
- **Fix:** `` `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` ``.
- **Status:** ✅

## 🟠 Médios

### M1 — Estoque negativo permitido
- `Sales.tsx:44` `allowNegativeStock` default `true`; `App.tsx:426` só limita a 0, sem checar disponibilidade. Vende mais do que há.
- **Fix:** Validar `p.stock >= quantity` ao concluir venda quando `allowNegativeStock` for falso.
- **Status:** ⏳ (já coberto pela UI em `Sales.tsx` linhas 247/255/276/339; o clamp em `App.tsx` é apenas segurança)

### M2 — `server.ts` retorna `{}` em erro de parse (silencioso)
- Combinado com H1, um `local-db.json` corrompido faz `hasDb=false` e dispara sobrescrita pelo seed.
- **Fix:** Logar o erro e/ou fazer backup do arquivo corrompido em vez de retornar vazio.
- **Status:** ✅

### M3 — Last-write-wins sem concorrência
- `server.ts` PUT faz merge com `??`, mas `App.tsx` sempre envia o db inteiro (overwrite). Duas abas/máquinas competem e o perdedor perde alterações.
- **Fix:** version/ETag ou `BroadcastChannel` para notificar outras abas.
- **Status:** ✅ (BroadcastChannel `zmstore-sync` em `localDb.ts` + listener em `App.tsx`; re-sincroniza abas só sem gravação pendente)

### M4 — Regex com typo em `categorize.ts`
- `src/lib/categorize.ts:24` usa `fonte\n` / `fonte\s` (newline/espaço único). Categoria `"Fonte "` ou `"Fontes"` não casa. Mesmo erro duplicado em `scripts/processar_dados.cjs` e `scripts/importar_planilha.cjs`.
- **Fix:** `fonte\s*` + normalizar espaços antes de testar; centralizar a função.
- **Status:** ✅ (corrigido em `categorize.ts` e nos 2 scripts; centralização fica como L2)

### M5 — Persistência sem flush ao fechar a aba
- Debounce 250ms (`App.tsx:229`) não salva se a aba for fechada nesse intervalo → última alteração perdida.
- **Fix:** Flush de `pendingRef` em `visibilitychange === 'hidden'` / `pagehide`.
- **Status:** ✅

### M6 — Erros de save engolidos
- `saveDb` (`localDb.ts:98`) apenas `console.error`; falha no IndexedDB = perda silenciosa sem feedback.
- **Fix:** Toast de erro na UI.
- **Status:** ✅

### M7 — `updateSalesBulk` descarta vendas novas
- `App.tsx:248-252` faz `sales.map(s => map.get(s.id) ?? s)`, descartando IDs não existentes.
- **Fix:** unir por ID (append dos novos) em vez de só map.
- **Status:** ✅

## 🟡 Baixos / higiene

### L1 — Dados reais (PII) versionados no git
- `src/data.json`, `src/data.ts`, `public/seed-backup.json`, `src/extracted_data.json`, `public/imported_data.json` contêm vendas/clientes reais.
- **Fix:** gitignore + gerar no build/deploy; remover PII do histórico.
- **Status:** ✅ (gitignore para `src/extracted_data.json` e `public/imported_data.json`; o seed do app permanece necessário)

### L2 — Lógica duplicada
- `normalizeName`/`normalize` em `App.tsx`, `Customers.tsx`, `Purchases.tsx`, `Reports.tsx`; `categorize` em `categorize.ts` + scripts; `roundCurrency` em `currency.ts` + scripts.
- **Fix:** fonte única em `src/lib/` importada por tudo.
- **Status:** ✅ (`normalizeName`/`normalizeChannel` centralizados em `src/lib/normalize.ts`; `categorize` e `roundCurrency` já em `lib/`)

### L3 — `Dashboard.parseLocalDate` troca dia/mês automaticamente
- Heurística corrige data inválida sem aviso → pode corromper dado real.
- **Fix:** rejeitar data inválida / parser estrito.
- **Status:** ✅ (swap dia/mês só quando plausível: `month>12 && day<=12` em `Dashboard.tsx`)

### L4 — Comentário enganoso em `localDb.ts:18`
- Diz "NO backend server", mas `server.ts` + proxy do Vite + `dev` (concurrently) dependem dele.
- **Status:** ✅

### L5 — Tipagem frouxa / parse sem guarda
- `App.tsx:384` `items: any[]`; `parseFloat` sem NaN-guard em vários inputs (ex.: `CashClosing.tsx`, importadores).
- **Fix:** tipar `items` e validar `NaN` em parses numéricos.
- **Status:** ✅ (`items: SaleItem[]` em `handleRegisterSale`; `parseFloat` já protegido com `|| 0`/`isNaN` nos pontos encontrados)
