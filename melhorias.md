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

## Pendências / o que não ficou ok (preencher ao validar)
[ ] __________________________________________________
[ ] __________________________________________________

### Histórico de Versões
- v2.6.0 [ok] — 13/07/2026: Clientes/CRM, Compras & Fornecedores (entrada de estoque), Fechamento de Caixa, autocomplete de clientes no PDV.
- v2.5.0 [ok] — 13/07/2026: Devedores submenu+parcelas, Bot com throttle/retry, serviços sem qtd, pasta organizada, README.
- v2.4.0 [ok] — 13/07/2026: ano dinâmico, filtro data, deduplicação, Mais Vendidos, SW off, planilha-mãe, Vendas 2023.
- v2.3.0 — versão base anterior.
