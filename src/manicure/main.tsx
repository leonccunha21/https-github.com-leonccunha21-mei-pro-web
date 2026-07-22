import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ManicureApp from './App';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ManicureApp />
  </StrictMode>,
);
