# Análise de Viabilidade: Extensão Módulos Avançados

## 1. Visão Geral da Arquitetura
A diretriz do documento de separar a infraestrutura em **Frontend (Vercel)** e **Backend (VPS contínua)** está perfeitamente correta. Plataformas Serverless como a Vercel têm limites rígidos de tempo de execução (timeouts de poucos segundos na versão gratuita/Pro) e não suportam processos rodando eternamente em segundo plano, o que é mandatório para websockets e scrapers.


🔴 Implementar imediatamente:

- [ ] #4 — Forma de pagamento ao concluir é um bug silencioso hoje — toda conclusão registra formaPagamento: 'dinheiro' no caixa sem perguntar, então o relatório de meios de pagamento está sempre errado. Correção simples: mini-modal com "Como foi pago?" ao clicar em ✓.

- [ ] #3 — Clientes sumidas no Dashboard — usando só dados que já existem (agendamentos + clientes), um bloco "Reconquistar" com as clientes sem visita há 30+ dias + botão WhatsApp direto. Zero nova tabela, impacto direto em receita.

- [ ] #1 — Perfil da cliente — hoje ao clicar numa cliente em Clientes.tsx não acontece nada. Um modal com histórico de serviços, total gasto e última visita transforma completamente a experiência.

- [ ] #2 — Gráfico de receita — a tela Caixa.tsx tem todos os dados mas exibe só lista plana. Um gráfico de barras SVG puro (sem biblioteca) com receita por dia da semana muda completamente a percepção de valor do sistema.


### 📊 FASE 2 — Tabelas Robustas + State Management (2–3 semanas)
> TanStack Table + TanStack Query. Melhoria massiva na usabilidade.

#### 2.1 TanStack Table — Componente Genérico
- [ ] Instalar dependência: `npm install @tanstack/react-table`
- [ ] Criar `src/components/ui/DataTable.tsx` — componente de tabela genérico
  - Sorting por coluna (clique no header)
  - Filtros por coluna (input no footer da coluna)
  - Paginação client-side (10/25/50/100 por página)
  - Seleção de linhas (checkbox)
  - Exportação CSV/Excel da tabela filtrada
- [ ] Criar `src/lib/tableConfig.ts` — configurações padrão de colunas

#### 2.2 Migrar Tabelas Existentes (uma por vez)
- [ ] `Products.tsx` → usar `DataTable` com colunas: SKU, Nome, Categoria, Custo, Venda, Estoque, Status
- [ ] `SalesHistory.tsx` → usar `DataTable` com colunas: Data, Itens, Cliente, Total, Lucro, Status, Pagamento
- [ ] `Debtors.tsx` → usar `DataTable` com colunas: Cliente, Venda, Valor, Status, Último Pagamento
- [ ] `Reports.tsx` → usar `DataTable` nas tabelas de resumo mensal/anual
- [ ] `CashClosing.tsx` → usar `DataTable` nas sessões de caixa
- [ ] `Purchases.tsx` → usar `DataTable` nas compras
- [ ] Verificar responsividade mobile (cards em vez de tabela)

#### 2.3 TanStack Query — Dados Remotos
- [ ] Instalar dependência: `npm install @tanstack/react-query`
- [ ] Criar wrapper `QueryClientProvider` no `App.tsx`
- [ ] Criar hooks customizados:
  - `src/hooks/useProducts.ts` — CRUD de produtos
  - `src/hooks/useSales.ts` — CRUD de vendas
  - `src/hooks/useCustomers.ts` — CRUD de clientes
  - `src/hooks/useExpenses.ts` — CRUD de despesas
  - `src/hooks/useCategories.ts` — CRUD de categorias
- [ ] Substituir `fetch` + `useState` manual nos componentes por hooks
- [ ] Configurar `staleTime: 5min`, `cacheTime: 30min`
- [ ] Testar invalidação de cache após criar/editar/deletar

**Dependências Fase 2:**
```bash
npm install @tanstack/react-table @tanstack/react-query
```

---

### 🖨️ FASE 3 — Impressão Térmica + NFC-e (3–4 semanas)
> Profissionalização do PDV com impressora térmica e nota fiscal.

#### 3.1 Impressão Térmica (ESC/POS)
- [ ] Instalar dependência: `npm install portakal` (ou usar `escpos` + `iconv-lite`)
- [ ] Criar `src/lib/escpos.ts` — gerador de commands ESC/POS
  - Comandos de impressão de texto (normal, negrito, centralizado)
  - Comandos de corte de papel
  - Impressão de QR Code (PIX)
  - Impressão de código de barras (EAN/Code128)
  - Logo da loja (bitmap 1-bit)
- [ ] Criar `src/components/PrinterSettings.tsx` — config de impressora
  - Tipo: rede (TCP/IP), USB, Bluetooth
  - IP/porta da impressora
  - Modelo (Epson, Bematech, Elgin, Star)
  - Teste de conexão
- [ ] Adicionar `POST /api/print` no `server.ts` (proxy para impressora via rede)
- [ ] Modificar pós-venda em `Sales.tsx`: botão "Imprimir" → envia ESC/POS
- [ ] Salvar config de impressora no localStorage/Supabase

#### 3.2 NFC-e / DANFE (Nota Fiscal)
- [ ] Criar `src/lib/nfce.ts` — montagem do XML NFC-e conforme layout SEFAZ
- [ ] Criar `src/lib/danfe.ts` — geração do DANFE em PDF (usando `pdfme` ou `@react-pdf/renderer`)
- [ ] Criar `src/components/FiscalInvoice.tsx` — tela de emissão
  - Selecionar venda → revisar dados do cliente (CPF/CNPJ) → emitir
  - Status: autorizada, rejeitada, cancelada
  - Download XML + DANFE
- [ ] Adicionar tab "Fiscal" no Settings para configurar:
  - Certificado digital A1 (.pfx)
  - Ambiente (homologação/produção)
  - Serie e número da nota
- [ ] Botão "Gerar NFC-e" pós-venda quando cliente informa CPF/CNPJ
- [ ] Dashboard de notas emitidas com filtros por período/status

#### 3.3 Integração com APIs Fiscais
- [ ] Pesquisar e selecionar provedor: Nuvem Fiscal, FocusNFe ou TecnoSpeed
- [ ] Criar `src/lib/fiscalApi.ts` — cliente HTTP para a API
- [ ] Implementar: `emitirNFCe()`, `consultarNFCe()`, `cancelarNFCe()`
- [ ] Webhook/callback para atualização automática de status
- [ ] Notas: esta etapa depende de certificado digital e contrato com provedor

**Dependências Fase 3:**
```bash
npm install portakal pdfme
```

---

### 💰 FASE 4 — Módulo Financeiro Completo (4–6 semanas)
> Contabilidade profissional, fluxo de caixa avançado, WhatsApp para cobranças.

#### 4.1 Motor Contábil (Inspired by frappe/books)
- [ ] Criar `src/lib/accounting.ts` — motor de contabilidade
  - Conceitos: Conta (ativo/passivo/receita/despesa), Centro de Custo, Período Fiscal
  - Lançamentos: débito/crédito com partidas dobradas
  - Saldos: balancete, DRE, balanço patrimonial
- [ ] Expandir `src/types.ts` com:
  - `AccountEntry` (lançamento contábil)
  - `Account` (plano de contas)
  - `CostCenter` (centro de custo)
  - `FiscalPeriod` (período fiscal aberto/fechado)
- [ ] Criar `src/components/ChartOfAccounts.tsx` — plano de contas
- [ ] Mapear vendas → lançamentos automáticos (Receita + Estoque → CMV)
- [ ] Mapear despesas → lançamentos automáticos (Despesa + Caixa/Banco)
- [ ] Mapear compras → lançamentos automátizados (Estoque + Fornecedor)

#### 4.2 DRE Aprimorado
- [ ] Expandir `src/components/DRE.tsx` com dados contábeis reais
- [ ] Categorias: Receita Operacional Bruta → Deduções → Receita Líquida → CMV → Lucro Bruto → Despesas Operacionais → EBITDA → Resultado Líquido
- [ ] Filtro por período (mês, trimestre, ano customizado)
- [ ] Comparativo year-over-year com indicadores
- [ ] Exportação PDF/CSV com layout profissional

#### 4.3 Fluxo de Caixa Avançado
- [ ] Expandir `src/components/CashFlow.tsx`
- [ ] Projeção 30/60/90 dias baseada em: vendas recorrentes, contas a pagar, despesas fixas
- [ ] Categorização automática: entradas (vendas, recebimentos) vs saídas (despesas, compras)
- [ ] Alertas de saldo baixo (configurável: "se saldo < R$500, notificar")
- [ ] Gráfico de evolução do caixa com linhas de tendência

#### 4.4 Contas a Pagar/Receber Automatizadas
- [ ] Expandir `src/components/Bills.tsx`
- [ ] Templates de fornecedores recorrentes (aluguel, energia, internet, etc.)
- [ ] Geração automática de contas a partir de recorrência
- [ ] Status: pendente → agendado → pago → atrasado
- [ ] Alertas de vencimento (3 dias antes, 1 dia antes)
- [ ] Pagamento recorrente automático (deduz do caixa na data)
- [ ] Relatório de inadimplência com lista de clientes em atraso

#### 4.5 Integração WhatsApp para Cobranças
- [ ] Implementar endpoints reais da Evolution API no `server.ts`
- [ ] Criar `src/lib/whatsappService.ts` — cliente para envio de mensagens
- [ ] Enviar cobranças automáticas para devedores:
  - Mensagem personalizada com nome, valor, data de vencimento
  - Link de pagamento (PIX/boleto)
  - Agendamento: 3 dias antes, 1 dia antes, vencido
- [ ] Notificar clientes sobre pedidos prontos (OS/Orçamento)
- [ ] Relatório de mensagens enviadas/entregues/lidas
- [ ] Template de mensagem configurável no Settings

**Dependências Fase 4:**
```bash
npm install @react-pdf/renderer
```
(Nenhuma lib nova de contabilidade necessária — lógica própria inspirada em frappe/books)

---

### 📋 Ordem de Execução Resumida

```
FASE 1 (semana 1-2)
  1.1 → Scanner Barcode no PDV
  1.2 → PDF de Recibos
  1.3 → Etiquetas de Produtos

FASE 2 (semana 3-5)
  2.1 → DataTable genérico (TanStack Table)
  2.2 → Migrar cada tabela (Products → SalesHistory → Debtors → Reports)
  2.3 → TanStack Query (hooks de dados)

FASE 3 (semana 6-9)
  3.1 → Impressão Térmica (ESC/POS)
  3.2 → NFC-e / DANFE
  3.3 → Integração API Fiscal

FASE 4 (semana 10-15)
  4.1 → Motor Contábil
  4.2 → DRE Aprimorado
  4.3 → Fluxo de Caixa Avançado
  4.4 → Contas a Pagar/Receber
  4.5 → WhatsApp Cobranças
```

---

### 🔧 Dependências a Instalar (por fase)

| Fase | Pacote | Comando | Finalidade |
|------|--------|---------|------------|
| 1 | `quagga2` | `npm i quagga2` | Scanner de código de barras |
| 1 | `react-to-pdf` | `npm i react-to-pdf` | Geração de PDF de recibos |
| 1 | `bwip-js` | `npm i bwip-js` | Geração de código de barras/QR para etiquetas |
| 2 | `@tanstack/react-table` | `npm i @tanstack/react-table` | Tabelas robustas |
| 2 | `@tanstack/react-query` | `npm i @tanstack/react-query` | State management de dados |
| 3 | `portakal` | `npm i portakal` | Impressão térmica ESC/POS |
| 3 | `pdfme` | `npm i pdfme` | Templates PDF (DANFE, etiquetas) |

---

### ⚠️ Pré-requisitos (antes de começar)

- [ ] Verificar se o projeto compila sem erros: `npm run build`
- [ ] Verificar lint: `npm run lint`
- [ ] Confirmar que `quagga2` e `bwip-js` são compatíveis com Vite (testar import)
- [ ] Ter impressora térmica para testar Fase 3 (Epson TM-T20/T88, Bematech, Elgin)
- [ ] Definir se vai usar NFC-e (depende de certificado digital A1)

---

**Status atual:** aguardando aprovação para iniciar Fase 1.
**Próximo marco:** v2.17.0 com Scanner Barcode + PDF de Recibos + Etiquetas.

