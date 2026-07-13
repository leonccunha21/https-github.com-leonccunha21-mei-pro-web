### Regras ###
- Sempre que fizer uma atualizaçao ou correção, atualizar o arquivo atualize o site, mude o nomero da versao.
- sempre que perminar uma melhoria marque um ok  [ok]

--------------------------------------------------------------------------------- nunca remover a parte das regras

## Funcionalidades do Sistema

[ok]  Gestão de Devedores (v2.5.0): tornou-se sub-menu de "Vendas" na sidebar. Status padronizado como "Pendente". Implementado cadastro de parcelas, registro de pagamentos parciais (atualiza valor restante) e conclusão manual do débito. Tipo Sale ganhou `installments?` e `paidAmount?`.

## Automação e Persistência

[ok]  Bot de Automação (v2.5.0): `scripts/bot.cjs` com throttle (limitação de taxa) e retentativas automáticas (backoff exponencial + jitter) para Git/deploy. Comandos `git-pull`, `git-push`, `sync` (planilha→pull→commit→push) e `publish` (sync+deploy Vercel).

[ok]  Banco de dados de vendas/estoque (v2.5.0): serviços (categoria "Serviços") não possuem quantidade — estoque zerado no pipeline e oculto no formulário de produto; corrigida a detecção de serviço (antes só reconhecia "serviço" singular, falhava com "Serviços").

[ok]  Pasta raiz organizada (v2.5.0): removidos arquivos soltos/desnecessários (activate.bat — script de ativação pirata do Windows —, dev.log, backup temporário src/data.json.atual.bak). Manteve-se hub.bat e metadata.json (tooling).

[ok]  README.md reescrito (v2.5.0): documentação com funcionalidades, stack, como rodar, pipeline da planilha, bot de automação, estrutura do projeto e regras de versionamento.

## Melhorias e Correções Concluídas [ok]

[ok]  v2.4.0 — Ano ativo dinâmico no Dashboard e Relatórios: o sistema cai no ano mais recente que possui vendas (e não no ano civil).
[ok]  v2.4.0 — Filtro de data robusto (parseLocalDate) aceita DD/MM/YYYY, YYYY-MM-DD e variações; corrigido bug de datas que zeravam os filtros.
[ok]  v2.4.0 — Deduplicação de estoque: normalização de nome de produto + soma de estoque em adição/edição/importação/carregamento/salvamento (App.runStockCleanup). Validação: 987 produtos únicos, 0 duplicados.
[ok]  v2.4.0 — Correção "Mais Vendidos": itemKey usa productId ou nome normalizado; agregação correta (900 grupos distintos em vez de 1 blob). Top produtos coerentes.
[ok]  v2.4.0 — Correção "Zerar banco volta tudo": flag `initialized` no localDb; primeiro load semeia + marca initialized; reset/import marcam initialized=true; data.json permanece intacto.
[ok]  v2.4.0 — Service Worker desativado (sw.js no-op + main.tsx desregistra SW em dev) — elimina loop de recarregamento em desenvolvimento.
[ok]  v2.4.0 — Planilha-mãe adotada como fonte oficial: `Relatório de Vendas.xlsx` (abas Vendas 2024/2025/2026, PROD, Devedores). `processar_dados.cjs` aponta para ela.
[ok]  v2.4.0 — Integração de Vendas 2023: `Vendas 2023.xlsx` (aba Vendas, formato mensal) adiciona 518 vendas, 695 itens, R$ 33.931,69 e +207 produtos. Total: 987 produtos / 2733 vendas.
[ok]  v2.4.0 — Pipeline converte planilha → src/data.json + src/data.ts + Backup Excel (Backup_Dados_Completos.xlsx) + data/local-db.json (initialized:true), preservando storeInfo/orders.
[ok]  v2.4.0 — Verificação em produção: frontend :3000 e backend :4000 ativos; /api/db serve 987 prod / 2733 vendas; Mais Vendidos e Devedores (8 pendentes) funcionando; lint (tsc) passa.

## Histórico de Versões

- v2.5.0 [ok] — 13/07/2026: Devedores como submenu de Vendas + parcelas + pagamento parcial + concluir débito; Bot de Automação com throttle/retry (sync/publish); serviços sem quantidade (detecção corrigida); pasta raiz organizada; README reescrito.
- v2.4.0 [ok] — 13/07/2026: ano dinâmico, filtro de data robusto, deduplicação de estoque, correção Mais Vendidos/Zerar banco, SW desativado, planilha-mãe adotada, integração Vendas 2023.
- v2.3.0 — versão base anterior.
