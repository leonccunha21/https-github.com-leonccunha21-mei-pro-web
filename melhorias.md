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
- [ ] **Poll automático** do job de varredura: o `Leads.tsx` cria o job, mas ainda não puxa os leads gerados (`/api/scrape/:id/leads`) nem atualiza o status sozinho — hoje depende do backend popular.
- [ ] **WebSocket** no `WhatsApp.tsx` para mensagens/status em tempo real (hoje usa list/send por HTTP).
- [ ] **`rag.ask`** ainda não tem UI de chat com o agente (só upload/list de documentos).
- [ ] **Limite de 5 conexões / 3 agentes** do plano Pro não está implementado (sem trava de quantidade).
- [ ] **Redrive 360º / Atendimento omnichannel** (e-mail, Instagram DM) não foi iniciado.

**Status atual:** tudo que é possível no frontend está feito e funcionando (modo local + VPS stub testado end-to-end). O app compila (`npm run build`) e passa no lint (`npm run lint`) sem erros.

---

## 5. Subsite Mounjaro PRO (controle de medicamento) — [CONCLUÍDO]

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
- [ ] **Notificação push/e-mail**: além do banner no app, avisar o paciente quando a dose estiver próxima.
- [ ] **Foto de evolução**: anexar fotos do paciente por etapa do tratamento.
- [ ] **Auditoria**: histórico de quem alterou dose/pagamento (útil para a cliente).

