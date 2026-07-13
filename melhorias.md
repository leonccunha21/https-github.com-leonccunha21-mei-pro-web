### Regras ###
- Sempre que fizer uma atualização ou correção, atualizar o arquivo atualize o site, mude o número da versão.
- sempre que perminar uma melhoria marque um ok [ok]

--------------------------------------------------------------------------------- nunca remover a parte das regras

### RELATÓRIO DE PEDIDOS (valide no navegador: marque [x] ou risque o que não estiver ok)

## Correções do sistema
[ok] Ano ativo dinâmico no Dashboard e Relatórios (cai no ano com mais vendas)
[ok] Filtro de data robusto (aceita DD/MM/AAAA, AAAA-MM-DD, etc.)
[ok] Deduplicação de estoque (soma por nome normalizado)
[ok] "Mais Vendidos" corrigido (agrupa por nome, não colapsa tudo em 1)
[ok] "Zerar banco" não apaga dados (flag initialized)
[ok] Service Worker desligado (fim do loop de recarregamento)

## Planilhas e dados
[ok] Planilha-mãe adotada: data/excel/Relatório de Vendas.xlsx
[ok] Vendas 2023 integradas (518 vendas / 695 itens / R$ 33.931,69)
[ok] Pipeline: planilha -> data.json + data.ts + Backup Excel + local-db.json
[ok] Planilha editável: data/excel/ZMStore_Editavel.xlsx + scripts importar/gerar
[ok] Hub de scripts (hub.bat) com menu Git

## Tarefas do melhorias.md
[ok] Devedores: submenu de Vendas + status Pendente + parcelas + pagamento parcial + concluir débito
[ok] Bot de Automação: scripts/bot.cjs com throttle/retry + sync + publish
[ok] Serviços (categoria Serviços) sem quantidade em estoque
[ok] Pasta raiz organizada (removido activate.bat, dev.log, backups temp)
[ok] README.md reescrito

## Entrega
[ok] Bump de versão para 2.5.0
[ok] Commit + push no GitHub (main)

## Módulos de "sistema de vendas completo" (v2.6.0)
[ok] Clientes/CRM: cadastro (nome, telefone, e-mail, endereço, obs) + histórico de compras + total gasto + débitos em aberto. Semeado automaticamente a partir dos clientes das vendas existentes.
[ok] Compras & Fornecedores: cadastro de fornecedores + registro de compras com itens, custo e nota; entra no estoque e atualiza custo/venda dos produtos.
[ok] Fechamento de Caixa: abertura (saldo inicial), sangria (retiradas com motivo), fechamento com contagem física e diferença esperado x contado.
[ok] Descontos no PDV: já existia (%), agora autocompleta clientes cadastrados no checkout.
[ok] Empréstimos (agiotagem) na tela Devedores: cadastro de nome, telefone, data que pegou, data para pagar, valor emprestado e valor dos juros; lista com total a receber, atraso em dias, recebimento parcial e quitação.
[ok] data/local-db.json removido do git (agora ignored): deletar/excluir o banco nao e mais restaurado por git pull ou bot de sync. Para limpar de verdade, usar "Zerar Banco" em Configurações (persiste vazio).
[ok] Build dist atualizado com o módulo de Empréstimos (toggle "Débitos de Vendas | Empréstimos" no topo da tela Devedores).
[ok] Removido botão duplicado "Devedores" no menu lateral (ficou apenas o submenu em Vendas).
[ok] Pipeline (processar_dados.cjs) protegido: ao (re)gerar data/local-db.json, preserva clientes, fornecedores, compras e fechamentos (não apaga os dados dos novos módulos).
[ok] Controle de recebimento de Marketplace (Shopee/TikTok/OLX) na tela Devedores: toggle "Marketplace", lista de pedidos com canal e ID do pedido (ecommerceOrderId), KPIs de A Receber/Recebidos e botão "Recebido" (marca quando o valor caiu na conta, ~1 mês). Tipo Sale ganha campo saleChannel.

## Pendências / o que não ficou ok (preencher ao validar)
[ ] __________________________________________________
[ ] __________________________________________________

### Histórico de Versões
- v2.6.5 [ok] — 13/07/2026: controle de recebimento de Marketplace (Shopee/TikTok/OLX) em Devedores: canal + ID do pedido, KPIs e botão "Recebido".
- v2.6.4 [ok] — 13/07/2026: removido botão duplicado "Devedores" do menu lateral.
- v2.6.3 [ok] — 13/07/2026: local-db.json fora do git (banco nao volta por pull/bot); build dist com Empréstimos; correção de visibilidade do módulo.
- v2.6.2 [ok] — 13/07/2026: Empréstimos (agiotagem) na tela Devedores: nome, telefone, datas, valor emprestado + juros, recebimento parcial e quitação.
- v2.6.1 [ok] — 13/07/2026: pipeline processar_dados.cjs protegido (preserva clientes/fornecedores/compras/fechamentos ao regerar local-db.json).
- v2.6.0 [ok] — 13/07/2026: Clientes/CRM, Compras & Fornecedores (entrada de estoque), Fechamento de Caixa, autocomplete de clientes no PDV.
- v2.5.0 [ok] — 13/07/2026: Devedores submenu+parcelas, Bot com throttle/retry, serviços sem qtd, pasta organizada, README.
- v2.4.0 [ok] — 13/07/2026: ano dinâmico, filtro data, deduplicação, Mais Vendidos, SW off, planilha-mãe, Vendas 2023.
- v2.3.0 — versão base anterior.
