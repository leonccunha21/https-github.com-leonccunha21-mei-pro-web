# Melhorias — status

## 1. Performance
- [x] O seed **foi removido**: não há mais `loadSeed`/`import('./data')` nem `public/seed-backup.json` sendo carregado no primeiro acesso. Cada conta nova inicia com 0 dados e só recebe dados via importação manual de Excel.
- [x] `xlsx` (429 kB) e `firebase` (436 kB) continuam sendo importados dinamicamente (lazy) onde são usados. Mantido.
- [x] `manualChunks` já separa `vendor-firebase`, `vendor-xlsx`, `vendor-motion` e `vendor-react` (caches de longa duração). Mantido `chunkSizeWarningLimit: 1500` em `vite.config.ts`.

## 2. Organização de código
- [x] `Settings.tsx` (era 1701 linhas) teve toda a lógica de parsing de planilhas extraída para `src/lib/sheetParsers.ts`. O componente caiu para ~965 linhas e passa a importar os parsers.
- [x] `Dashboard.tsx` teve o gráfico SVG de faturamento extraído para `src/components/SalesChart.tsx`.
- [~] Os componentes ainda são grandes; uma separação em UI menor (sub-componentes de Cards/Seções) ficou como melhoria futura, mas o risco de regressão justificou não dividir tudo agora.

## 3. Camada de dados
- [x] Centralização já existente em `src/lib/localDb.ts` (load/save IndexedDB + servidor opcional) e `src/lib/dbSync.ts` (nuvem). `App.tsx` usa um único `persist()` em vez de `saveXToStorage` espalhados.
- [x] Os parsers de planilha (antes `any[][]` em todo lugar) agora usam os tipos `Cell`/`SheetRows` e uniões corretas (`PaymentMethod`, `Loan['status']`, etc.) em `src/lib/sheetParsers.ts`. Zero `any` nos parsers.

## 4. Robustez / UX
- [x] Testes unitários adicionados em `src/lib/parsers.test.ts` (9 testes cobrindo produtos, categorias, vendas, empréstimos e clientes). Roda com `npm test`.
- [x] `aria-label` adicionado aos botões de ícone (header do App, Dashboard, SalesHistory, Products, Debtors, OsOrcamento, Reports).
- [x] O estado "modo local vs nuvem" já é explícito em `Settings.tsx` (banner "Sincronização desativada (modo local)" + botões de nuvem desabilitados quando `syncEnabled` é false).

## 5. Uso particular por conta (login Google obrigatório)
- [x] **Login obrigatório**: `App.tsx` agora tem um gate de autenticação. Enquanto `authReady` é falso mostra "Verificando conta…"; se não houver `cloudUser`, renderiza `src/components/Login.tsx` (tela com botão "Entrar com Google"). Sem login, nenhum dado é exibido (app mostra 0 dados).
- [x] **Sem seed automático**: removidos `loadSeed`/`import('./data')` em `App.tsx` e o fallback de `seed-backup.json` em `src/lib/localDb.ts` (`loadDb`). Nova conta inicia zerada.
- [x] **Entrada de dados só via Excel manual**: removido o botão "Restaurar do Backup" (`handleRestoreBackup`) de `App.tsx` e `Settings.tsx`. Os dados devem ser enviados pelo usuário via importação de planilha (`sheetParsers.ts`).
- [x] `src/components/Login.tsx` criado com botão "Entrar com Google" (usa `googleSignIn()` de `lib/firebase`), tratamento de erro e explicação de uso particular.

---

## Correção de dados (BASE 2 → BASE 1)
- O `public/seed-backup.json` (backup de restauração, rotulado "BASE 2") havia sido gerado a partir de `data/excel/BASE 2.xlsx`, que **tinha dados errados**.
- Regenerado a partir de `data/excel/BASE 1.xlsx` (referência correta/funcionando) usando `node scripts/importar_base2.cjs`, que atualizou `src/data.json`, `src/data.ts`, `data/local-db.json` e `public/seed-backup.json` (e o `dist/`).
- Resultado: 856 produtos, 2804 vendas, 18 categorias, 20 despesas, 1 empréstimo — faturamento R$ 120.369,71.
- O recurso de "Restaurar do Backup" foi **removido** (modelo de uso particular: dados só entram via Excel manual). O `seed-backup.json` deixou de ser carregado automaticamente.
- `data/excel/BASE 2.xlsx` (a planilha que o usuário envia) foi **sobrescrita** com o conteúdo correto de `data/excel/BASE 1.xlsx`, para que o arquivo enviado esteja com os dados certos.

## 8. Correção de valores na importação (v2.6.16)
- [x] **Bug crítico**: ao importar uma planilha onde a coluna **Custo (R$)** ou **Faturamento (R$)** vinha `0` (ou vazia), o parser "caía" para o preço *atual* do produto (aba Produtos), inflacionando custo (+R$7.580) e faturamento (+R$7.112) em `Modelo_Importacao.xlsx`.
- [x] Corrigido em `src/lib/sheetParsers.ts`: o parser agora **confia nas colunas da planilha** (Custo/Faturamento/Lucro) quando presentes, usando o valor exato (inclusive 0). Só deriva do catálogo de produtos quando a coluna **não existe** no sheet.
- [x] Resultado: Custo, Faturamento e Lucro batem **exatamente** (diff 0,00) com `Modelo_Importacao.xlsx` (6.566 vendas, 2019–2026, R$ 395.700,79 de faturamento).
- [x] Teste de regressão adicionado em `src/lib/parsers.test.ts`.
- [x] Fonte de dados canônica: `data/excel/Dados coletas/Modelo_Importacao.xlsx` (segue o modelo: Produtos/Vendas/Categorias/Empréstimos/Clientes/Fornecedores/Instruções).

## 7. Relatórios comparativos (v2.6.15)
- [x] Nova aba **Comparativo** em `src/components/Reports.tsx`: grade mês × ano com faturamento, variação YoY (% vs mesmo mês do ano anterior) e barra de intensidade relativa.
- [x] Resumo anual comparativo: faturamento, lucro, nº de vendas e ticket médio com variação YoY entre anos consecutivos.
- [x] A grade ignora o filtro de ano (mantém todos os anos) e respeita os demais filtros (pagamento, canal, tipo, categoria).

## 6. Convenções de dados (sempre aplicar)
- **Colunas numéricas**: nunca usar **ponto** (nem como separador de milhar, nem como separador decimal). Decimal vai com **vírgula** (ex: `25,90`).
- **Nenhum número como texto**: preço, estoque, QTD, valores (custo/faturamento/lucro), valores de empréstimo etc. devem ser células do **tipo numérico**, não texto. O modelo (`handleDownloadTemplate` em `Settings.tsx`) já usa números; o parser (`getFloatVal` em `sheetParsers.ts`) aceita ambos `.` e `,` na importação, mas a geração/convenção é vírgula + tipo numérico.
- Aplicado no modelo de importação (`Baixar Modelo`): amostras numéricas como número e instruções reforçando vírgula + tipo numérico.
