// Service Worker intencionalmente desativado (no-op).
// Existia um SW que cacheava os modulos /src/* em desenvolvimento, causando
// um loop de recarregamentos com o HMR do Vite. Este SW nao intercepta nem
// cacheia nenhuma requisicao; serve apenas para substituir o SW antigo e
// permitir que o main.tsx o desregistre de forma limpa.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// Sem handler de 'fetch': o navegador usa a rede diretamente.
