# Análise de Viabilidade: Extensão Módulos Avançados

## 1. Visão Geral da Arquitetura
A diretriz do documento de separar a infraestrutura em **Frontend (Vercel)** e **Backend (VPS contínua)** está perfeitamente correta. Plataformas Serverless como a Vercel têm limites rígidos de tempo de execução (timeouts de poucos segundos na versão gratuita/Pro) e não suportam processos rodando eternamente em segundo plano, o que é mandatório para websockets e scrapers.

---

## 2. Roadmap de Implementação (Frontend)

À medida que formos avançando, marcaremos com `[x]` as tarefas concluídas.

### ⚙️ Fase 1: Setup e Estrutura de Dados
- [x] Atualizar o arquivo `src/types.ts` para incluir as interfaces `Lead`, `WhatsAppInstance`, `LeadExtractionJob` e `AIAgent`.
- [x] Configurar os estados iniciais no `App.tsx` e `localDb.ts` para salvar esses dados localmente (enquanto o backend/VPS não estiver pronto).

### 🎯 Fase 2: Módulo de Varredura de Leads (Scrapers)
- [x] Criar ícone e rota para a nova página "Leads" no menu lateral esquerdo (Sidebar).
- [x] Construir a tela principal de Leads (com layout em Tabela e botões de filtro).
- [x] Criar a janela/modal "Nova Varredura" (campos: Palavra-chave/Segmento, Cidade/Região).
- [x] Desenvolver a função de consultar CNPJ via API pública (BrasilAPI) operando de forma 100% real no frontend.
- [x] Criar o módulo **Funil de Vendas** (Kanban de oportunidades, 7 estágios: Lead → Contatado → Qualificação → Proposta → Negociação → Ganho/Perdido), com drag-and-drop, conversão de leads em oportunidades, valor/previsão/responsável e métricas de pipeline.
- [x] **Integração Leads → CRM**: botão "Converter em Cliente" em cada lead que cria o Customer no CRM (com CNPJ, telefone, e-mail) e evita duplicar por CNPJ/nome.
- [x] **Nova varredura já aciona a VPS** (`scrapers.enqueue`) quando online, com fallback local (job salvo) quando offline.
- [ ] **(Backend/VPS)** Executar a varredura em si (o job é criado com status PENDING, mas o scraper que popula leads a partir da keyword/localidade só roda na VPS).

### 💬 Fase 3: Módulo Omnichannel (WhatsApp)
- [x] Criar ícone e rota para a nova página "WhatsApp" no menu lateral.
- [x] Construir o painel "Instâncias de WhatsApp" (mostrando os aparelhos conectados, status e botão de adicionar novo).
- [x] Desenhar o Modal "Conectar WhatsApp" com espaço preparado para exibir o QR Code em Base64.
- [x] Criar um modelo visual de Caixa de Entrada (Inbox) para as mensagens do CRM.
- [x] **WhatsApp já consome a VPS** (`whatsapp.connect/list/messages/send`) quando online: QR Code real, status em tempo real e chat com envio. Modo local como fallback.
- [ ] **(Backend/VPS)** Subir a Evolution API na VPS + WebSocket para QR Code e mensagens em tempo real.

### 🤖 Fase 4: Inteligência Artificial (Maestro & Agentes)
- [x] Criar a página "Inteligência Artificial" no menu lateral.
- [x] Montar a interface para cadastrar Agentes Básicos (definir Nome, Objetivo e Prompt de Comportamento).
- [x] Desenhar a interface de "Base de Conhecimento" (área de upload de documentos PDF/TXT).
- [x] **Upload RAG já consome a VPS** (`rag.uploadDocument/listDocuments`) por agente, com listagem de trechos e fallback offline.
- [ ] **(Backend/VPS)** Pipeline de RAG real (PostgreSQL + pgvector): processar os documentos enviados e usá-los como contexto nas respostas dos agentes.

### 🔌 Fase 5: Camada de Integração com a VPS (API client)
- [x] Criar `src/lib/vps.ts` centralizando todos os endpoints do backend (Evolution API, scrapers, RAG) com tipos alinhados aos do frontend.
- [x] Base URL configurável via `VITE_VPS_API_URL` (default `/api`, já com proxy em `vite.config.ts` para `localhost:4000`).
- [x] Funções prontas: `whatsapp.connect/disconnect/list/messages/send`, `scrapers.enqueue/status`, `rag.uploadDocument/listDocuments/ask`, `vpsHealth()`.
- [x] **UI já ligada à VPS com fallback local**: WhatsApp (connect/list/messages/send), Leads (enqueue) e IA (upload RAG) chamam o cliente quando `vpsHealth()` retorna online; caso contrário, operam no modo local.
- [x] **Servidor stub em `server.ts`** implementando `/api/health`, `/api/whatsapp/*`, `/api/scrape/*` e `/api/rag/*` (Evolution API, scrapers e RAG simulados em memória) — testado end-to-end localmente. Substitui a VPS real em ambiente de dev.
- [ ] **(Backend/VPS)** Implementar os endpoints correspondentes na VPS (Evolution API, scrapers, PostgreSQL+pgvector).

---

## 3. Status de Sincronização (Firebase)
- [x] Envio dos dados para o Firestore implementado em lotes **ano a ano**, respeitando o orçamento diário de escritas (`src/lib/throttledSync.ts`) — evita estourar a cota do plano Spark.
- [x] Envio/Baixa agora é **100% manual** (botões "Sincronizar Agora" e "Baixar da nuvem"). Removidos os gatilhos automáticos (push 2s após edição, pull a cada 30s, retomada a cada 3h) para não consumir cota nem divergir dados antes do envio inicial completo.

---

## 4. Conclusão
O documento é extremamente maduro e as tecnologias recomendadas são padrão de mercado. Tudo é viável, desde que seja mantida a premissa fundamental: **o trabalho pesado vai para a VPS, o controle visual e estratégico fica aqui no React**.

### Próximos passos (dependem de Backend/VPS)

> **Checklist de retorno** — o que AINDA falta fazer quando voltar:

**Infraestrutura (VPS real, substitui o stub de `server.ts`):**
- [ ] Subir **Evolution API** na VPS + **WebSocket** para QR Code e mensagens em tempo real (hoje o stub simula em memória).
- [ ] Implementar **scrapers reais** (Google Maps / Instagram / Bing) consumindo os jobs criados no frontend (`/api/scrape`).
- [ ] **PostgreSQL + pgvector** para o pipeline de **RAG** da Base de Conhecimento (`/api/rag`), processando os documentos enviados e usando-os como contexto nas respostas.
- [ ] Configurar `VITE_VPS_API_URL` em produção apontando para a VPS (hoje default `/api` + proxy local).

**Frontend (melhorias possíveis, não bloqueantes):**
- [x] **Poll automático** do job de varredura: o `Leads.tsx` cria o job e puxa os leads gerados a cada 10s quando a VPS está online.
- [ ] **WebSocket** no `WhatsApp.tsx` para mensagens/status em tempo real (hoje usa list/send por HTTP).
- [x] **Chat RAG** — UI de chat com o agente via `rag.ask` integrada ao painel de cada agente.
- [ ] **Limite de 5 conexões / 3 agentes** do plano Pro não está implementado (sem trava de quantidade).
- [ ] **Redrive 360º / Atendimento omnichannel** (e-mail, Instagram DM) não foi iniciado.

**V2.13.0 — Anotações de consulta Mounjaro, cupom fiscal PDV:**
- [x] **OS/Orçamento**: botão "Converter em Venda" no detalhe do orçamento (cria venda pendente com itens)
- [x] **Mounjaro — Gráfico**: linha tracejada da meta de peso (`objetivoPeso`) no SVG
- [x] **Mounjaro — Adesão**: tabela de taxa de adesão (% doses no prazo) no Dashboard
- [x] **DRE**: filtro por período (mês inicial/final)
- [x] **DRE**: tabela comparativa anual year-over-year com evolução %
- [x] **DRE**: botão Imprimir/PDF
- [x] **Fluxo de Caixa**: cenários otimista (+30%), realista, pessimista (-30%)
- [x] **Fluxo de Caixa**: despesas por categoria com barra proporcional
- [x] **Produtos**: barra de progresso stock vs. minStock + indicador "min: N"
- [x] **PDV**: cupom fiscal com logo, dados da loja, itens, total e forma de pagamento
- [x] **Mounjaro**: anotações de consulta editáveis no detalhe do paciente

**V2.16.0 — Multi-usuário com perfis + PIX no PDV:**
- [x] **Multi-usuário**: 3 perfis (admin/gerente/vendedor) com permissões por feature
- [x] **Usuários**: painel de gestão de usuários (criar, atribuir role, deletar) em Configurações
- [x] **PIX no PDV**: geração de QR Code PIX (BRCode) + payload copiável ao selecionar forma de pagamento PIX
- [x] **Chave PIX**: campo no Perfil da Loja para cadastrar a chave

**V2.15.0 — Backup automático programado:**
- [x] **Backup automático**: configuração de frequência (diário/semanal/desligado) e horário no Settings
- [x] **Notificação**: alerta no navegador quando o backup for executado automaticamente
- [x] **Botão "Executar agora"**: backup manual com registro da data

**V2.14.0 — Histórico de preços, exportação Excel Mounjaro, comparação de fotos:**
- [x] **Produtos**: histórico de preços (custo/venda) registrado automaticamente a cada alteração, com modal timeline
- [x] **Mounjaro — Exportar CSV**: botão Exportar na lista de pacientes com dados clínicos e financeiros
- [x] **Mounjaro — Comparação de fotos**: selecione 2 fotos para comparar lado a lado + atalho "Antes/Depois"

**Status atual:** tudo que é possível no frontend está feito e funcionando (modo local + VPS stub testado end-to-end). O app compila (`npm run build`) e passa no lint (`npm run lint`) sem erros.

---

---

## 5. Plano de Melhorias Competitivas (para接近 concorrentes como ContaAzul, Bling, Tiny, Nibo, Omie)

À medida que formos avançando, marcaremos com `[x]` as tarefas concluídas.

### 🏆 Prioridade Máxima (maior impacto competitivo)

#### 5.1 Emissão de NF-e / NFC-e
- [ ] Integrar com API de notas fiscais (Nuvem Fiscal, FocusNFe, TecnoSpeed)
- [ ] Tela para emissão de NF-e a partir de vendas concluídas
- [ ] Tela para emissão de NFC-e a partir do PDV
- [ ] Dashboard de notas emitidas com status (autorizada/rejeitada/cancelada)
- [ ] Download do XML e DANFE em PDF

#### 5.2 Integração Bancária / Conciliação
- [ ] Importar extratos bancários via arquivo OFX/OFX
- [ ] Módulo de conciliação: matching automático entre extratos e vendas/despesas
- [ ] Conexão Open Finance via Pluggy/Belvo para auto-import

#### 5.3 Boletos Bancários
- [ ] Emissão de boletos registrados via API (Asaas, PagSeguro, CobreBem, Kangu)
- [ ] Link de boleto nas cobranças do módulo de devedores
- [ ] Status de pagamento do boleto (pendente/pago/vencido)

#### 5.4 Gateway de Pagamento no PDV
- [x] QR Code PIX estático no PDV (chave PIX configurável, payload BRCode, QR code gerado via `qrcode` lib)
- [ ] Gerar QR Code PIX dinâmico no PDV (Asaas, GerenciaNet, Mercado Pago)
- [ ] Link com maquininha (Stone, Cielo, Rede) — ao menos integração por link de pagamento
- [ ] Status de confirmação do pagamento em tempo real

### 📢 Marketing & Relacionamento

#### 5.5 Notificação Automática para Devedores
- [x] Conectar módulo WhatsApp com cobranças de devedores (envio automático de msg para clientes em atraso)
- [ ] Agendar lembretes automáticos (3 dias antes, 1 dia antes, vencido)
- [ ] Link de pagamento (boleto/PIX) na mensagem

#### 5.6 Automação de Marketing
- [ ] Campanhas de e-mail/WhatsApp automáticas por aniversário, inatividade
- [ ] Disparo em lote para clientes segmentados

### 📊 Relatórios & Inteligência

#### 5.7 Relatório DRE (Demonstração do Resultado do Exercício)
- [x] Criar relatório DRE completo: Receita Bruta → Deduções → Receita Líquida → CMV → Margem → Despesas → Resultado (componente `DRE.tsx`)
- [x] Testes unitários para cálculos do DRE
- [x] Comparativo anual (year-over-year com evolução %)
- [x] Exportação em CSV + impressão/PDF via browser

#### 5.8 Fluxo de Caixa Projetado
- [x] Fluxo de caixa futuro com base em contas a receber (vendas pendentes) e a pagar (despesas) (`CashFlow.tsx`)
- [x] Cenários otimista (+30%), realista e pessimista (-30%) no Fluxo Projetado

### 🛠️ Produto & Experiência

#### 5.9 Multi-usuário com Permissões
- [x] Perfil de vendedor (só PDV e consulta)
- [x] Perfil de gerente (tudo exceto config)
- [x] Perfil de admin (tudo)
- [x] Seletor de papel no sidebar + tela de gestão de usuários em Configurações

#### 5.10 White-label / Personalização da Marca
- [x] Melhorar uso do `StoreInfo` no header e sidebar (nome da loja, logo, cores)
- [x] Cor primária customizável no Perfil da Loja
- [x] Nome da loja dinâmico no header/sidebar (usa `storeInfo.name`)
- [x] Tema de cores customizável (cor primária como CSS variable, paleta `primary-50` a `primary-900`)
- [ ] Domínio próprio

#### 5.11 Alertas de Estoque Baixo
- [x] Banner no Dashboard com atalho para o estoque quando produtos estão abaixo do mínimo

#### 5.12 PWA / App Mobile
- [x] Layout responsivo mobile-first (já implementado)
- [x] Navegação inferior mobile (já implementado)
- [x] IndexedDB como fonte primária de dados (já implementado)
- [x] Sincronização manual com a nuvem (já implementado)
- [x] Service worker para cache de assets offline (`public/sw.js`)
- [x] Manifest aprimorado com ícones e descrição (`public/manifest.webmanifest`)
- [x] Push notifications configuráveis para lembretes de cobrança e estoque baixo (`src/lib/notifications.ts`)
- [ ] Splash screen personalizada

#### 5.13 API Pública
- [ ] Endpoints REST públicos para integração de terceiros
- [ ] Documentação via Swagger/OpenAPI
- [ ] Autenticação via API Key

### 🔧 Técnico & DevOps

#### 5.14 CI/CD (GitHub Actions)
- [x] Pipeline de CI: lint + test + build no push/PR (`.github/workflows/ci.yml`)
- [x] Workflow de deploy Vercel (`.github/workflows/deploy.yml`, requer secrets configurados)

#### 5.15 Testes Automatizados
- [x] Testes unitários para cálculos financeiros (DRE, lucro, margem) (`src/lib/dre.test.ts`)
- [x] Testes para o módulo de parsers de planilha (`src/lib/parsers.test.ts`)
- [x] Testes para o parser OFX/QFX (`src/lib/ofxParser.test.ts`)
- [x] Testes para o módulo de notificações (`src/lib/notifications.test.ts`)
- [ ] Testes de integração para fluxos críticos (venda → estoque → devedor)
- [ ] Testes E2E com Playwright/Cypress

#### 5.16 Conciliação Bancária via OFX
- [x] Parser de arquivos OFX/QFX (`src/lib/ofxParser.ts`)
- [x] Interface de conciliação: transações do banco vs. vendas/despesas (`BankConciliation.tsx`)
- [x] Matching automático por valor entre extrato e vendas/despesas

#### 5.17 Multi-usuário com Perfis
- [ ] Perfil de vendedor (só PDV e consulta)
- [ ] Perfil de gerente (tudo exceto config)
- [ ] Perfil de admin (tudo)
- [ ] Autenticação por senha local ou Google

#### 5.18 Orçamentos (a partir de OS)
- [x] Botão "Converter em Venda" no orçamento com 1 clique (cria venda pendente a partir dos itens)
- [ ] Transformar ServiceOrder em orçamento/proposta comercial completa
- [ ] Status: orçamento → aprovado → em produção → concluído

#### 5.19 Histórico de Preços
- [x] Registrar alterações de custo/venda por produto com data
- [x] Exibir timeline de preços no modal do produto (botão "Histórico de Preços" no form de edição)

#### 5.20 Backup Automático Programado
- [x] Agendar backup diário/semanal com horário configurável (Settings → Backup Automático)
- [x] Notificar quando backup for concluído (notificação no navegador)

#### 5.21 Cupom Fiscal Simplificado
- [ ] Botão "Imprimir Cupom" no PDV
- [ ] Layout de cupom não-fiscal simplificado

### 📱 Mounjaro PRO — Melhorias Futuras
- [x] **Gráfico de evolução com meta** — linha do peso real vs. meta com projeção no SVG
- [x] **Taxa de adesão** — % de doses tomadas no prazo vs. atrasadas, por paciente no Dashboard
- [ ] **PDF do relatório do paciente** — gerar relatório médico completo para impressão/WhatsApp
- [x] **Anotações de consulta** — campo editável no detalhe do paciente para registrar observações
- [x] **Exportar dados para Excel** — download de pacientes com peso, perda, doses, score em CSV
- [x] **Comparação de fotos lado a lado** — selecionar 2 fotos para comparar ou atalho "Antes/Depois"

### 🔧 Infraestrutura (ambos)
- [ ] **VPS definitiva** (Render/Railway/Fly.io) para backend real (Evolution API, scrapers, RAG)
- [ ] **Domínio próprio** (`minhaloja.com.br`)
- [ ] **CI/CD ativo** (configurar `VERCEL_TOKEN` nos secrets do GitHub)

**Status atual do plano competitivo:** melhorias em andamento. Cada item marcado com `[x]` foi concluído.

---

## 6. Subsite Mounjaro PRO (controle de medicamento) — [CONCLUÍDO]

Sistema irmão da loja, no **mesmo endereço**, para acompanhamento de pacientes em
tratamento com **tirzepatida (Mounjaro®)**. Informações clínicas baseadas na bula oficial
(Eli Lilly / Anvisa) e nos estudos SURMOUNT-1/2 e SURPASS 1-5. **Não substitui avaliação médica.**

### Fluxo de entrada
- [x] Tela de **escolha dos 2 sistemas** ao abrir o site (`src/components/SystemChooser.tsx`):
  *Sistema da Loja* (ZM Store) e *Mounjaro PRO*. Escolha salva em `localStorage`.
- [x] Botão **"Trocar"** no header do subsite e botão *Mounjaro PRO* na sidebar da loja para
  alternar entre os sistemas sem perder os dados.

### Autenticação e nuvem
- [x] Login obrigatório com **Google** (Firebase Auth) no subsite.
- [x] Dados salvos na nuvem em `users/{uid}/mounjaro/{clientes,pesagens,doses,pagamentos}`
  (`src/mounjaro/dbSync.ts`), sincronizados automaticamente a cada alteração.
- [x] Banco local IndexedDB próprio + indicador de status de sincronização no header.
- [x] Export/import de backup JSON.

### Módulos
- [x] **Clientes**: dados clínicos (altura, peso inicial, IMC, comorbidades, objetivo, médico).
- [x] **Doses**: dose 2,5–15 mg, intervalo configurável de **7 a 15 dias**, local, lote,
  efeitos colaterais, vínculo com pagamento e agenda de próximas doses com alerta de atraso.
- [x] **Peso**: peso atual, perdido desde o início, **perda média por dose**, IMC, meta e gráfico.
- [x] **Pagamentos + Score**: score de pagamento (0–100) por pontualidade/atraso/aberto
  (excelente/bom/regular/ruim).
- [x] **Referência**: esquema de escalonamento oficial, frequência, efeitos e resultados.

### Deploy
- [x] Build MPA no Vite (`mounjaro.html`) + rewrite em `vercel.json` (`/mounjaro` → `mounjaro.html`).
- [x] Publicado em produção: **https://mei-pro-web.vercel.app** e **https://mei-pro-web.vercel.app/mounjaro**
- [x] Commit `45b60c7` no GitHub (`origin/main`).

### Recomendações de melhoria (próximos passos, não bloqueantes)
- [x] **Lembretes de dose**: banner proativo no Painel com doses atrasadas / vencem hoje / amanhã,
  ordenado por urgência, com atalho para registrar a dose (`lembrarDoses` em `lib.ts`).
- [x] **Cálculo de dose sugerida**: `sugerirProximaDose` indica a próxima dose (2,5→15 mg) conforme
  tolerância e efeitos colaterais relatados; exibida no modal de registro de dose (apoio, não substitui médico).
- [x] **Backup automático na nuvem**: dados já sincronizam em `users/{uid}/mounjaro/*` a cada alteração
  (snapshot incremental); `gerarSnapshot` disponível para exportação manual.
- [ ] **Multiúsuario por clínica**: hoje cada conta Google tem seus próprios pacientes;
  se a cliente quiser equipe, adicionar `clinicaId` e regras de acesso compartilhado.
- [x] **Relatórios/exportação**: nova aba "Relatório" gera resumo por paciente (dados, evolução de peso
  com Δ e IMC, doses aplicadas e financeiro) com botão **Imprimir/PDF** (estilo de impressão limpo) e
  exportação JSON (`Relatorio.tsx`).
- [x] **Lembretes/avisos ao paciente**: botão "avisar no WhatsApp" nos lembretes de dose (atrasada/hoje/amanhã)
  e nas cobranças pendentes/atrasadas no Painel (`linkWhatsapp`, `mensagemLembreteDose`, `mensagemCobranca` em `lib.ts`).
  Notificações do navegador (opt-in no header) alertam o profissional ao abrir o app.
- [x] **Correção de cadastro/peso**: ao cadastrar (ou editar) cliente com peso inicial, o app agora cria
  automaticamente a **pesagem inicial** (data = início do tratamento), corrigindo os cálculos de peso base,
  perda e gráfico de evolução (`Clientes.tsx`).
- [x] **Foto de evolução**: nova aba "Fotos" para registrar acompanhamento visual por paciente.
  Imagens são **compactadas** (canvas, webp/jpeg, até ~1MB) e salvas em base64 junto ao banco,
  sincronizando na nuvem como as demais entidades (`FotoEvolucao` em `fotos`, `image.ts`, `Fotos.tsx`).
  Inclui galeria, legenda/data, visualização em tela cheia (setas/Esc) e **comparar início vs. atual**.
  Miniaturas também aparecem na ficha do cliente.
- [x] **Auditoria**: nova aba "Auditoria" registra histórico de alterações críticas
  (criar/editar/excluir de clientes, doses, pagamentos, pesagens e fotos) com usuário, data/hora e resumo.
  Os registros sincronizam na nuvem e ficam limitados aos últimos 500 eventos (`RegistroAuditoria`, `Auditoria.tsx`, `criarRegistroAuditoria` em `lib.ts`).

