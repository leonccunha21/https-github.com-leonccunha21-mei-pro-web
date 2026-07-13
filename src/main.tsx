import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// O Service Worker foi desativado (sw.js é um no-op) para evitar o loop de
// recarregamentos em desenvolvimento causado pelo cache de módulos pelo HMR.
// Aqui garantimos que qualquer SW ainda registrado seja removido de vez.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
}
