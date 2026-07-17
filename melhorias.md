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
- [ ] **(Backend/VPS)** Executar a varredura em si (o job é criado com status PENDING, mas o scraper que popula leads a partir da keyword/localidade só roda na VPS).

### 💬 Fase 3: Módulo Omnichannel (WhatsApp)
- [x] Criar ícone e rota para a nova página "WhatsApp" no menu lateral.
- [x] Construir o painel "Instâncias de WhatsApp" (mostrando os aparelhos conectados, status e botão de adicionar novo).
- [x] Desenhar o Modal "Conectar WhatsApp" com espaço preparado para exibir o QR Code em Base64.
- [x] Criar um modelo visual de Caixa de Entrada (Inbox) para as mensagens do CRM.
- [ ] **(Backend/VPS)** Conectar de verdade à Evolution API: QR Code real em Base64, status em tempo real e envio/recebimento de mensagens.

### 🤖 Fase 4: Inteligência Artificial (Maestro & Agentes)
- [x] Criar a página "Inteligência Artificial" no menu lateral.
- [x] Montar a interface para cadastrar Agentes Básicos (definir Nome, Objetivo e Prompt de Comportamento).
- [x] Desenhar a interface de "Base de Conhecimento" (área de upload de documentos PDF/TXT).
- [ ] **(Backend/VPS)** Pipeline de RAG real (PostgreSQL + pgvector): processar os documentos enviados e usá-los como contexto nas respostas dos agentes.

---

## 3. Status de Sincronização (Firebase)
- [x] Envio dos dados para o Firestore implementado em lotes **ano a ano**, respeitando o orçamento diário de escritas (`src/lib/throttledSync.ts`) — evita estourar a cota do plano Spark.
- [x] Envio/Baixa agora é **100% manual** (botões "Sincronizar Agora" e "Baixar da nuvem"). Removidos os gatilhos automáticos (push 2s após edição, pull a cada 30s, retomada a cada 3h) para não consumir cota nem divergir dados antes do envio inicial completo.

---

## 4. Conclusão
O documento é extremamente maduro e as tecnologias recomendadas são padrão de mercado. Tudo é viável, desde que seja mantida a premissa fundamental: **o trabalho pesado vai para a VPS, o controle visual e estratégico fica aqui no React**.

### Próximos passos (dependem de Backend/VPS)
1. Evolution API rodando na VPS + WebSocket para QR Code e mensagens em tempo real.
2. Scraper de varredura de leads (Google Maps / Instagram) consumindo os jobs criados no frontend.
3. PostgreSQL + pgvector para o pipeline de RAG da Base de Conhecimento.
