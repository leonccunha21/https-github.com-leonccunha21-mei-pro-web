### Regras ###
- Sempre que fizer uma atualizaçao ou correção, atualizar o arquivo atualize o site, mude o nomero da versao.
- sempre que perminar uma melhoria marque um ok  [ok]

----------------------------------------------------------------------------------- nunca remover a parte das regras
[ok]  Atualização de Vendas (v2.3.0): Dados extraídos da planilha original e gerados no data.ts.
  -> 2024: 845 vendas / 1.576 itens / R$ 27.775,78
  -> 2025: 919 vendas / 1.826 itens / R$ 35.020,98
  -> 2026: 451 vendas / 679 itens / R$ 23.013,06
  -> Backup Excel: arquivos excel/Backup_Dados_Completos.xlsx

[ok]  Arquivo Excel de Backup (v2.3.0): Gerado em arquivos excel/Backup_Dados_Completos.xlsx com todos produtos e vendas.
  -> Produtos: 982 (341 do PROD + 641 criados das vendas)
  -> Categorias: 14 reais (auto-classificadas por nome)
  -> Vendas: 2.215 linhas de itens

[ok]  Validar dados e categorias: Dados extraídos da planilha original. Produtos auto-classificados em 14 categorias reais. Vendas mescladas, duplicatas por nome removidas.

## Funcionalidades do Sistema

[ ]  Gestão de Devedores: Esta aba deve se tornar um sub-menu de "Vendas". O status de devedores deve ser padronizado como "Pendente" (não "Concluído"). Deve ser implementada a opção de cadastrar parcelas, atualizar pagamentos parciais e concluir o débito manualmente.

## Automação e Persistência

[ ]  Bot de Automação: Criar um bot que inclua scripts de automação, como o sistema de throttling inteligente e retentativas automáticas que você já está desenvolvendo. O bot também deve automatizar o envio de arquivos ao GitHub e o processo de publicação.

[ ]  Erro de Salvamento: Foi identificado um erro de migração no banco de dados que impede que as informações da loja e inventário sejam salvas corretamente. Uma correção para esse crash do sistema está sendo desenvolvida.

[ ] nao to conseguindo fazer o login no google aqui, nao aparece nada.

[ ] atualizar banco de dados de vendas e estoque, para serviços, serviços nao possui quantidade.

[ ] organize a pasta raiz do projeto, muitos dados bagunçados, remova oque nao usamos mais.

[ ] melhore o arquivo readme.md deixe o mais bonito e com informaçoes importantes. 

