### Regras ###
- Sempre que fizer uma atualizaçao ou correção, atualizar o arquivo atualize o site, mude o nomero da versao.
- sempre que perminar uma melhoria marque um ok  [ok]

----------------------------------------------------------------------------------- nunca remover a parte das regras 

[ok]  Correção de Tipos: Os erros no data.ts (campo color no tipo Category e complexidade de tipo) são pré-existentes. Para resolver erros de complexidade, recomenda-se anotar os tipos explicitamente em vez de depender apenas da inferência.
  -> Campo color removido das categorias (não era usado), tipos já estão explícitos no types.ts. Build TypeScript limpo sem erros.

[ ]  Atualização de Vendas: O site precisa ser atualizado e publicado para incluir as vendas de 2025 e 2026.
  -> Vendas já vão de 2025-01 a 2026-06 no data.ts (v_1 a v_1370). Dados de 2024 não estão mais presentes. Versão atualizada. --- quero todos dados que tem na planilha, de 2024 a 2026 

## Melhorias no Visual e Mobile

[ok]  Design Responsivo: O visual mobile e para tablets está muito ruim e precisa ser melhorado usando Media Queries no CSS para adaptar o layout a diferentes resoluções.
  -> Mobile completamente reformulado: bottom nav 5 tabs + menu slide-up, backdrop-blur, card view nos produtos (mobile) / tabela (desktop), grid 2 colunas no PDV, KPI 2x2, touch targets 36px, inputs 16px, scrollbar sutil.

[ok] Conversão para PWA: O site deve se tornar uma Progressive Web App (PWA) para permitir a instalação no celular como um app nativo.
  -> PWA já configurado: manifest.webmanifest, sw.js (service worker com cache offline), meta tags Apple, registro no main.tsx.

## Funcionalidades do Sistema

[ ]  Gestão de Devedores: Esta aba deve se tornar um sub-menu de "Vendas". O status de devedores deve ser padronizado como "Pendente" (não "Concluído"). Deve ser implementada a opção de cadastrar parcelas, atualizar pagamentos parciais e concluir o débito manualmente.

[ok]  Categorias vs. Marcas: Marcas como iPhone, Samsung, Motorola e Xiaomi devem ser tratadas como marcas e não categorias, exigindo uma reestruturação para uma categorização mais precisa e completa.
  -> 14 categorias reais criadas (Capas e Películas, Cabos e Adaptadores, Fones, Carregadores, Acessórios, Computador/Periféricos, Memória/Armazenamento, Áudio/Vídeo, Eletrônicos, Casa/Utensílios, Brinquedos/Jogos, Serviços, Relógios/Wearables, Diversos). 335 produtos reclassificados. categorize.ts atualizado.

## Automação e Persistência

[ ]  Bot de Automação: Criar um bot que inclua scripts de automação, como o sistema de throttling inteligente e retentativas automáticas que você já está desenvolvendo. O bot também deve automatizar o envio de arquivos ao GitHub e o processo de publicação.

[ ]  Erro de Salvamento: Foi identificado um erro de migração no banco de dados que impede que as informações da loja e inventário sejam salvas corretamente. Uma correção para esse crash do sistema está sendo desenvolvida.

[ ] site, sem login deve mostrar zero dados, esta mostrando meus dados, isso nao e seguro nem legal.

[ ] nao to conseguindo fazer o login no google aqui, nao aparece nada.

[ ] atualizar banco de dados de vendas e estoque, para serviços, serviços nao possui quantidade.

[ ] quero um arquivo em excel que seja a base de todos dados que tem para eu poder analizar editar e arrumar. nao estou confiando nos dados que estao sendo mostrados, e precisamos de 100% de certeza nos dados antes de colocar em produçao.

[] Atualização de Vendas: O site precisa ser atualizado e publicado para incluir as vendas de 2024 a  2026. Os dados corretos para o Excel são:2026: 451 vendas / 679 itens / R$ 23.013,00.2025: 918 vendas / 1.826 itens / R$ 35.020,00.2024: 845 vendas / 1.576 itens / R$ 25.768,00.Totais: 2.214 vendas, 4.081 itens, R$ 83.801,00 totais.