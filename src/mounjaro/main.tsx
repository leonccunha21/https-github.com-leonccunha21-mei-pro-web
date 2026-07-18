import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MounjaroApp from './App';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MounjaroApp />
  </StrictMode>,
);
