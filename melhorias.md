1. Performance (mais urgente)
- O chunk data-JddvFpeW.js tem 1,08 MB — é o seed-backup.json (966 produtos + 2804 vendas) embutido e carregado junto no boot. Isso deixa o carregamento inicial lento. Recomendo carregar esse seed sob demanda (lazy import) ou movê-lo para o IndexedDB/localStorage em vez de bundle.
- xlsx (429 kB) e firebase (436 kB) já são importados dinamicamente em boa parte dos lugares — mantenha assim; evite importá-los no topo.
- Ative build.chunkSizeWarningLimit maior ou faça manualChunks para separar vendors (firebase/xlsx/motion) em caches de longa duração.
2. Organização de código
- Settings.tsx (1341 linhas) faz parsing de Excel/CSV, import/export e UI num só arquivo. Separe em lib/parsers.ts (lógica) + componentes de UI menores. Mesma ideia para Dashboard.tsx (723 linhas, com gráfico SVG feito à mão) — extraia o gráfico para um componente próprio.
- Componentes gigantes dificultam manutenção e aumentam o risco de regressão em melhorias de UI.
3. Camada de dados
- O app alterna entre localStorage, seed embutido e Firebase. Centralize isso num lib/storage.ts / lib/db.ts com uma interface única, em vez de espalhar saveXToStorage pelo App.tsx.
- Muitas funções de parsing usam any livremente — tipar melhor evita bugs silenciosos na importação.
4. Robustez / UX
- Não há testes. Adicionar pelo menos testes unitários para os parsers de planilha (que são a parte mais frágil) já evitaria muita dor.
- Vários botões de ícone não têm aria-label — melhorar acessibilidade.
- O "modo local" vs "nuvem" tem regras misturadas (restore/baixar viram no-op). Deixar esse estado explícito e documentado ajuda a evitar confusão do usuário.



